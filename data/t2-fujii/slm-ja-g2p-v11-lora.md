# t2-fujii/slm-ja-g2p-v11-lora

## Resumen

SLM-JA-G2P v11 es un adaptador LoRA para el modelo japonés sarashina2.2-1b-instruct-v0.1 (1.000 millones de parámetros, licencia MIT) desarrollado por Takafumi Fujii (t2-fujii). Su función es la conversión de grafemas a fonemas (G2P) en japonés: recibe una frase en texto y devuelve su pronunciación en katakana, incluyendo la lectura fonética de partículas (は→ワ, へ→エ, を→オ) y de números y símbolos. Resuelve un problema clásico del procesado de voz: la estimación de lectura (yomi) de kanji y heterónimos, donde los diccionarios estáticos fallan por ambigüedad contextual.

El modelo combina el adaptador con una configuración de inferencia determinista (segmentación por frases, decodificación restringida al alfabeto katakana mediante un `LogitsProcessor` y búsqueda por haces con anchura 4). Según la model card, esta combinación supera a pyopenjtalk, el estándar de facto basado en diccionario, en los siete ítems de evaluación del artículo asociado, con significación estadística en cuatro de ellos, y sin consultar ningún diccionario en tiempo de inferencia.

Es relevante ahora porque demuestra que un modelo de lenguaje pequeño (1B) puede sustituir a un sistema de reglas y diccionario en una tarea lingüística acotada, con datos de entrenamiento anotados por humanos y sin datos generados por LLM. El repositorio ocupa aproximadamente 0,1 GB y se distribuye únicamente como adaptador PEFT en safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base sarashina2.2-1b-instruct-v0.1) con adaptador LoRA r=16 sobre todas las capas lineales |
| Parámetros totales | Aproximadamente 1.000 millones (modelo base); el adaptador LoRA añade un conjunto reducido de parámetros no especificado en la información disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base) |
| Tipos de cuantización | No disponible en la información proporcionada; el ejemplo de uso emplea bfloat16 |
| Idiomas soportados | Japonés (ja) |
| Licencia | MIT (adaptador y modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base en safetensors |

## Arquitectura y entrenamiento

El adaptador se aplica sobre sarashina2.2-1b-instruct-v0.1, un transformer decoder-only de 1B parámetros ajustado para instrucciones. El LoRA tiene rango 16 y se aplica a todas las capas lineales, con 3 épocas de entrenamiento sobre aproximadamente 2,43 millones de filas. El resultado se fusiona con el modelo base mediante `merge_and_unload()` para la inferencia.

La composición del corpus de entrenamiento es un punto técnico destacable: solo recursos anotados por humanos y generación basada en reglas, sin datos generados por LLM. Incluye frases de Wikipedia validadas de forma doble por dos sistemas de diccionario independientes, frases con dígitos, ruby de Aozora Bunko con lema atestiguado, el split de entrenamiento de KWDLC, ROHAN4600, palabras de lectura única de SudachiDict, frases con numerales y alfabeto generadas por reglas, y jsut-label. El corpus no se redistribuye por restricciones de las fuentes, pero es reproducible de forma determinista (fuentes fijadas y semillas fijas) con el cuaderno de construcción del repositorio de GitHub, que además audita mediante SHA-1 que ninguna frase de evaluación se filtra al entrenamiento.

La innovación principal no está en el modelo sino en el protocolo de decodificación: segmentación de la entrada por signos de puntuación, máscara de logits que restringe la salida al rango katakana (ァ-ヶ, ー, 、) más el token EOS, y búsqueda por haces con anchura 4, `length_penalty=0.0` y `early_stopping=True`. La model card advierte que las cifras del artículo requieren exactamente esta configuración; con decodificación voraz (`num_beams=1`) el sistema es más rápido y sigue igualando o superando al diccionario en seis de los siete ítems.

## Capacidades

- Estimación de lectura (yomi) de texto japonés: convierte una frase a katakana con la pronunciación correcta según contexto.
- Resolución de heterónimos: desambigua kanji con múltiples lecturas posibles (por ejemplo, nombres propios y compuestos) usando contexto, no diccionario.
- Lectura fonética de partículas: aplica las formas pronunciadas は→ワ, へ→エ, を→オ.
- Lectura de números y símbolos: convierte dígitos y signos a katakana (por ejemplo, años y fechas) mediante las reglas aprendidas del corpus.
- Salida restringida al alfabeto katakana: la máscara de logits garantiza que la salida sea siempre katakana válido, sin caracteres fuera de rango.
- Generación de texto conversacional e instrucciones: capacidad heredada del modelo base instruct, aunque el adaptador está especializado en G2P.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento extendido de forma nativa según la información disponible.
- Capacidad multilingüe: únicamente japonés; el adaptador está entrenado y evaluado solo en ja.

## Casos de uso

- Síntesis de voz (TTS) en japonés: el modelo actúa como front-end de G2P antes del sintetizador acústico, generando la secuencia de katakana que alimenta al modelo de voz. Es adecuado porque supera a pyopenjtalk en CER sobre el corpus jvs (0,924 % frente a 0,933 %) y en KWDLC-test (0,934 % frente a 1,236 %).
- Lectura de nombres propios y topónimos: en asistentes de dictado o navegación, la desambiguación contextual de heterónimos (69,1 % frente a 59,2 % de acierto en el conjunto de heterónimos) reduce errores que un diccionario estático no puede resolver.
- Normalización de texto para pipelines de voz en producción: integrado como paso previo a un TTS, con decodificación voraz para minimizar latencia y mantener calidad competitiva en seis de siete métricas.
- Lectura de textos con cifras y fechas: artículos de noticias o documentos financieros con años, cantidades y símbolos se convierten a katakana pronunciable, cubierto por las frases con dígitos y las generadas por reglas del corpus.
- Accesibilidad y lectura asistida: generación de furigana fonético o guías de pronunciación para aprendices de japonés y sistemas de lectura de pantalla.
- Evaluación y auditoría de sistemas G2P: el repositorio de GitHub incluye datos de evaluación y el cuaderno de construcción reproducible, lo que permite replicar la comparación contra pyopenjtalk y auditar la ausencia de fugas entre entrenamiento y test.
- Procesado por lotes de corpus: al ocupar aproximadamente 0,1 GB el adaptador y ejecutarse sobre un base de 1B, es viable procesar grandes volúmenes de frases en una sola GPU consumer con bfloat16.

## Benchmarks y rendimiento

Resultados publicados en la model card frente a pyopenjtalk (G2P estándar basado en diccionario):

| Ítem de evaluación | pyopenjtalk | SLM-JA-G2P v11 | Significación |
|---|---|---|---|
| jvs CER global ↓ | 0,933 % | 0,924 % | No indicada |
| Joyo ↑ | 96,54 % | 96,96 % | p=2,5e-3 |
| Joyo Parakeet ed. ↑ | 97,01 % | 97,68 % | p=2,8e-7 |
| KWDLC-test CER ↓ | 1,236 % | 0,934 % | p=1,8e-6 |
| Conjunto de heterónimos ↑ | 59,2 % | 69,1 % | p=3,1e-5 |

La model card indica que el sistema supera al diccionario en los siete ítems de evaluación del artículo, con victorias estadísticamente significativas en cuatro. Los ítems sexto y séptimo no se detallan en la información proporcionada. No se han publicado en la información disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K) para este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 1B en bfloat16 requiere aproximadamente 2 GB de pesos; con caché KV y overhead de runtime, entre 3 y 5 GB en función de la longitud de secuencia. El adaptador LoRA añade un consumo marginal y puede fusionarse con el base.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM; RTX 3060, RTX 4060, RTX 4070, RTX 4090, A100 y H100 son válidas. Para lotes grandes, A100 o H100.
- Cabe en GPU consumer: sí, en tarjetas con 6 GB o más; también es viable en CPU para volúmenes moderados, aunque con mayor latencia.
- Opciones de despliegue: transformers con peft (flujo oficial del ejemplo), vLLM o TGI tras fusionar el adaptador con `merge_and_unload()`, y llama.cpp u Ollama si se convierte el modelo fusionado a GGUF (no documentado en la información disponible).
- Latencia y throughput: no disponibles en la información proporcionada. La búsqueda por haces con anchura 4 multiplica el coste frente a la decodificación voraz; la model card recomienda `num_beams=1` cuando prima la velocidad.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SLM-JA-G2P v11 | LoRA sobre SLM 1B | ~1B (base) | No disponible | G2P japonés neuronal con decodificación restringida | MIT | Hugging Face (adaptador) |
| pyopenjtalk | Sistema basado en diccionario y reglas | No aplica | No aplica | G2P japonés determinista | Licencia de Open JTalk (verificar) | Open source, ampliamente desplegado |
| sarashina2.2-1b-instruct-v0.1 | Transformer decoder-only instruct | ~1B | No disponible | Modelo general japonés | MIT | Hugging Face |

La comparación con otros modelos neuronales de G2P en japonés no está disponible en la información proporcionada. Frente a pyopenjtalk, la diferencia clave es que el modelo neuronal no consulta diccionario y resuelve ambigüedades por contexto, mientras que el sistema de diccionario es más ligero en cómputo y determinista por construcción.

## Limitaciones y advertencias

- Especialización estrecha: el adaptador está entrenado exclusivamente para G2P en japonés; su uso como modelo conversacional general degrada las capacidades del base.
- Dependencia de la configuración de decodificación: las cifras del artículo requieren segmentación por frases, máscara de katakana y búsqueda por haces de anchura 4. Otras configuraciones pueden dar resultados distintos.
- Sesgos: al entrenarse con Wikipedia, Aozora Bunko, KWDLC y otros corpus escritos, puede reflejar la distribución de esos dominios y fallar en registros coloquiales, dialectos o transcripciones fonéticas no estándar.
- Riesgo de alucinación: al ser un modelo generativo, puede producir lecturas plausibles pero incorrectas en kanji raros, nombres extranjeros o neologismos; la máscara de katakana evita caracteres inválidos, no errores de lectura.
- Limitación de idioma: solo japonés; no hay soporte multilingüe.
- Restricciones de licencia: adaptador y base son MIT, lo que permite uso comercial; sin embargo, el corpus de entrenamiento no se redistribuye por restricciones de las fuentes originales, por lo que la reproducibilidad depende de reconstruirlo con el cuaderno del repositorio.
- Madurez: repositorio con 10 descargas y 0 likes en el momento de la consulta, creado en octubre de 2026; ecosistema de validación externa limitado.
- Contexto: la longitud de contexto no se detalla en la información disponible; entradas muy largas deben segmentarse, como hace el propio ejemplo de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/t2-fujii/slm-ja-g2p-v11-lora
- Modelo base: https://huggingface.co/sbintuitions/sarashina2.2-1b-instruct-v0.1
- Código y datos de evaluación: https://github.com/tmfi-analytics/slm-ja-g2p
- Artículo: arXiv link pendiente de publicación (ID TBA) según la model card; no disponible en la información proporcionada.
