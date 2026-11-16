# ViezeVingertjes/TinyErotica-7M

## Resumen

TinyErotica-7M es un modelo de lenguaje de 7,16 millones de parámetros entrenado desde cero por el desarrollador independiente ViezeVingertjes para generar relatos eróticos breves (unas 150 palabras) en inglés. Su rasgo distintivo no es la calidad literaria, sino la escala de despliegue: está diseñado para ejecutarse íntegramente en un microcontrolador ESP32-S3, sin conexión a red, a unos 5,7 tokens por segundo. Emplea una arquitectura Llama compacta (6 capas, 6 cabezas, dimensión oculta 288, FFN 768, embeddings atados) con un tokenizador BPE byte-level de 4096 tokens entrenado sobre el propio corpus.

El modelo se apoya en el dataset ViezeVingertjes/TinyErotica (configuración `curated`), formado por 257.002 relatos sintéticos de 80 a 190 palabras generados por un profesor Gemma 4 a partir de planes por relato y filtrados automáticamente. La ventana de contexto es de 256 tokens, suficiente para contener un relato completo: cada muestra arranca en el token separador `<|endoftext|>` y termina cuando el modelo lo vuelve a emitir, sin prompt de entrada.

Su relevancia actual reside en la demostración de que un modelo de generación de texto con capacidad de cierre autónomo de secuencia cabe en 7,3 MB en int8 (pesos y caché KV) y arranca en 1,5 segundos en hardware de menos de 10 euros. La licencia es Apache 2.0, aunque el contenido es explícito y restringido a adultos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder-only): 6 capas, 6 cabezas, hidden size 288, FFN 768, embeddings atados |
| Parametros totales | 7.155.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | int8 (pesos y cache KV, 7,3 MB); pesos originales en safetensors (fp32/bf16 segun repo) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); empaquetado int8 propietario para el firmware del ESP32-S3 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la estructura de Llama, deliberadamente reducido: 6 capas, 6 cabezas de atención, dimensión oculta 288, FFN de 768 y embeddings atados entre entrada y salida. El tokenizador es un BPE byte-level de 4096 tokens entrenado específicamente sobre el corpus, lo que maximiza la eficiencia de representación para el dominio y el tamaño de vocabulario reducido. La ventana de 256 tokens está calibrada para albergar un relato completo de principio a fin, con el token `<|endoftext|>` (id 0) actuando como delimitador de inicio y fin de muestra.

El entrenamiento se realizó desde cero durante 60.000 pasos con batches de 64 × 256 tokens (21 épocas sobre el corpus), optimizador AdamW con learning rate 1e-3 y schedule coseno, alcanzando una pérdida de validación de 1,060. Los datos provienen de la configuración `curated` del dataset ViezeVingertjes/TinyErotica: 257.002 relatos sintéticos de 80 a 190 palabras en 16 categorías, generados por un profesor Gemma 4 a partir de planes por relato y sometidos a verificación automática (longitud, palabras prohibidas, referencias a edades o menores, actos no planificados, errores de cuerpo y pronombres). No se documenta RLHF ni DPO; el ajuste fino se limita al preentrenamiento supervisado sobre el corpus sintético. La innovación técnica destacable es el empaquetado int8 de pesos y caché KV para ejecución en microcontrolador, con un runtime C propio.

## Capacidades

- Generación de relatos eróticos breves y autoconclusivos de aproximadamente 150 palabras en inglés, sin necesidad de prompt.
- Cierre autónomo de secuencia: el 100% de las historias termina por sí misma emitiendo el token de fin.
- Coherencia básica de personajes: mantiene nombres estables a lo largo del relato con la configuración de muestreo recomendada (0% de cambios de nombre con penalización 1,08 y nombres exentos).
- Generación con planes implícitos: reproduce estructuras narrativas de 16 categorías aprendidas del corpus (incluidos temas de fantasía oscura entre adultos).
- Muestreo configurable mediante `generation_config.json`: temperatura 1,0, top-k 40, top-p 0,95, min-p 0,10 y penalización de repetición 1,08.
- Ejecución en dispositivo: inferencia int8 en ESP32-S3 a ~5,7 tokens/s con arranque en 1,5 s.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües más allá del inglés.

## Casos de uso

- Narrativa generativa en dispositivos sin conectividad: el modelo se ejecuta íntegramente en un ESP32-S3 con 7,3 MB en int8, lo que permite generar relatos en hardware empotrado sin enviar datos a la nube. Adecuado para instalaciones de arte generativo o dispositivos de ficción interactiva para adultos.
- Demostración educativa de modelos de lenguaje en el borde: sirve para ilustrar en docencia o investigación cómo un transformer completo (atención, FFN, tokenizador BPE) cabe en un microcontrolador y produce texto coherente, con métricas medibles de pérdida, cierre de secuencia y diversidad de 4-gramas.
- Generación de ficción breve para lectura personal: produce relatos autoconclusivos de ~146 palabras con una tasa de error lógico de 0,51–0,57 por historia según el juicio ciego, suficiente para consumo recreativo sin edición.
- Pruebas de estrés de muestreo y decodificación: el modelo permite experimentar con temperatura, top-k, top-p, min-p y penalización de repetición sobre un dominio acotado, con efectos medibles en variedad (4-gramas distintos) y coherencia (errores por relato).
- Prototipado de pipelines de generación de ficción a pequeña escala: útil como bloque de bajo coste para validar prompts de sistema, formatos de salida o flujos de filtrado antes de escalar a modelos mayores como Literotica-Writer-26B-A4B.
- Investigación sobre datos sintéticos y filtrado automático: el modelo y su dataset asociado permiten estudiar cómo el tamaño y la curaduría del corpus (10k, 110k y 257k historias) afectan a la calidad narrativa y al cierre de secuencia en modelos pequeños.
- Evaluación comparativa de eficiencia tamaño-rendimiento: con 7M de parámetros supera en errores lógicos a modelos de 11,5M–14,0M entrenados con los mismos datos, lo que lo convierte en un caso de estudio sobre cuándo más datos rinden mejor que más parámetros.

## Benchmarks y rendimiento

Evaluación interna del autor con 100 historias por modelo, runtime C en int8 y el primer sampler de la placa (temperatura 0,8, top-p 0,9, penalización de repetición 1,15):

| Metrica | 10k historias | 110k historias | 257k, 30k pasos | 257k, 60k pasos (este modelo) |
|---|---:|---:|---:|---:|
| Historias que terminan solas | 100% | 99% | 100% | 100% |
| Mediana de palabras | 129 | 130 | 146 | 146 |
| Historias marcadas por el verificador | 5% | 13% | 0% | 0% |
| Historias que cambian de nombre | 10% | 4% | 7% | 1% |
| 4-gramas distintos | 0,654 | 0,791 | 0,867 | 0,842 |

Juicio ciego por un modelo separado que contó errores lógicos por historia:

| Modelo | Errores por historia | Historias sin errores |
|---|---:|---:|
| 257k, 30k pasos | 0,67–0,71 | 50–51% |
| Modelos mayores (11,5M–14,0M, mismos datos) | 0,67–0,73 | 50–57% |
| Este modelo, con muestreo recomendado | 0,51–0,57 | 60% |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en fp32; 7,3 MB en int8 (pesos y caché KV) para el despliegue en microcontrolador.
- GPU recomendadas: no requiere GPU; cualquier CPU moderna ejecuta el modelo en transformers. Para el despliegue empotrado, ESP32-S3 (placa de referencia Waveshare ESP32-S3-Touch-AMOLED-2.16).
- Cabe en cualquier GPU de consumo, incluida RTX 4090, y en la mayoría de SoC y microcontroladores con suficiente memoria; el límite práctico es la RAM disponible para el empaquetado int8.
- Opciones de despliegue: transformers (Python), runtime C int8 propio para ESP32-S3 (firmware no publicado todavía), text-generation-inference y endpoints compatibles según los tags del repo. No se documenta soporte de llama.cpp, Ollama ni vLLM.
- Latencia y throughput: ~5,7 tokens/s en ESP32-S3, arranque de 1,5 s; no se proporcionan cifras de latencia en CPU o GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---:|---:|---|---|---|
| TinyErotica-7M | 7,16M | 256 | Apache 2.0 | Ficción erótica breve, edge/MCU | Pesos en HF; firmware no publicado |
| Literotica-Writer-26B-A4B | 26B totales (A4B, MoE) | no disponible | no disponible | Ficción erótica larga (1.000–5.000 palabras) | HF; ejecutable con llama.cpp |
| Modelos mayores del mismo autor (11,5M–14,0M) | 11,5M–14,0M | no disponible | no disponible | Misma tarea, mismos datos | No disponibles como modelos publicados independientes en la información |

La comparación con modelos de propósito general del mismo tamaño (por ejemplo, variantes de TinyStories) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo genera contenido explícito para adultos; no debe usarse en productos accesibles a menores ni integrarse en plataformas sin verificación de edad.
- Con 7M de parámetros, los relatos son cortos y formulaicos; en escenas de tres personajes confunde a veces quién hace qué.
- Sesgos conocidos: el corpus es sintético y está limitado a 16 categorías, incluidas temáticas de fantasía oscura como no consentimiento y relaciones tabú entre adultos; el modelo reproduce esos patrones y no generaliza fuera de ellos.
- Riesgo de alucinación estructural: errores de lógica narrativa (personajes que aparecen o desaparecen, posiciones imposibles, contradicciones) en aproximadamente el 40% de las historias según el juicio ciego, con 0,51–0,57 errores por historia.
- Limitación de idioma: únicamente inglés; no hay soporte multilingüe.
- Limitación de contexto: 256 tokens, insuficiente para relatos largos o conversaciones multi-turno.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el contenido generado es explícito y puede incumplir las políticas de plataformas de distribución, tiendas de aplicaciones y proveedores cloud.
- Caveat de producción: el firmware para ESP32-S3 no se ha publicado; el despliegue en dispositivo requiere implementar o esperar el runtime C int8.
- La penalización de repetición fuerte degrada la coherencia de nombres (7% de historias cambian de nombre con penalización 1,15); hay que usar 1,08 con nombres exentos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ViezeVingertjes/TinyErotica-7M
- Dataset de entrenamiento: https://huggingface.co/datasets/ViezeVingertjes/TinyErotica
- Modelo relacionado (ficción larga): https://huggingface.co/ViezeVingertjes/Literotica-Writer-26B-A4B
