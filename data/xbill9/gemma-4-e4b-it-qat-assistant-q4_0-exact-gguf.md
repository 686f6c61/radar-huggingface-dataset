# xbill9/gemma-4-E4B-it-qat-assistant-q4_0-exact-gguf

## Resumen

Build no oficial en formato GGUF del modelo asistente (drafter) de decodificación especulativa para Gemma 4 E4B-it QAT, publicado por el usuario xbill9. No es un modelo autónomo: es el componente auxiliar que propone tokens candidatos para que el modelo objetivo (target) los verifique en paralelo, acelerando la generación sin alterar la salida final del target. Su modelo base es `google/gemma-4-E4B-it-qat-q4_0-unquantized-assistant`, revisión `27f8d20`, y se distribuye bajo licencia Apache 2.0.

El drafter tiene 77.993.732 parámetros (aproximadamente 78 M) y una arquitectura muy reducida: 4 capas transformer de ancho 256, tres de ellas con ventana deslizante y una con atención completa, que emiten únicamente queries porque las claves y los valores provienen de la caché del modelo objetivo. Todas las matrices de pesos se almacenan en Q4_0 sobre la rejilla exacta que produjo el entrenamiento consciente de cuantización (QAT), lo que da un fichero de 59.678.368 bytes (unos 57 MiB) con un error relativo de 0,00138 frente a los pesos bf16 de Google.

Su relevancia práctica es inmediata para quien sirva Gemma 4 E4B-it QAT en local: con el drafter activado, el autor mide 100,0 tok/s en una RTX 3050 OEM de 8 GB frente a 58,2 tok/s sin él (factor 1,72x), con la misma tasa de aceptación que el fichero Q8_0 equivalente y sin degradación medible en GSM8K ni en llamadas a herramientas. El requisito es disponer de una versión de llama.cpp con soporte de predicción multi-token (MTP) para Gemma 4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer drafter (MTP) de 4 capas, ancho 256; 3 capas de ventana deslizante y 1 de atención completa; solo queries (K y V de la cache del target); 2 proyecciones de unión al estado oculto de 2560 del target |
| Parametros totales | 77.993.732 (aproximadamente 78 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el drafter no mantiene cache propia; usa la del modelo objetivo) |
| Tipos de cuantizacion | Q4_0 exacto en todas las matrices de pesos (escalas de bloque en fp16); normas y escalas en F32; se publica un unico fichero Q4_0 |
| Idiomas soportados | no disponible (modelo solo de texto; no se declara cobertura linguistica propia) |
| Licencia | Apache 2.0, con remision a los terminos de Gemma 4 |
| Formato de pesos | GGUF (fichero `gemma-4-E4B-it-qat-assistant-q4_0-exact.gguf`, 59.678.368 bytes, SHA-256 `dc965cb963e56b86fbc04db8efec83163886085e88514574650a57fa55a2ee24`) |

## Arquitectura y entrenamiento

El modelo es un drafter de decodificación especulativa basado en predicción multi-token (MTP). Consta de 4 capas transformer de anchura 256, de las cuales tres usan atención de ventana deslizante y una usa atención completa. Cada capa calcula solamente las queries; las claves y los valores se leen de la caché del modelo objetivo. Dos proyecciones conectan el estado oculto de 2560 dimensiones del target con el espacio de 256 del drafter, y la cabeza de salida es el embedding atado de 262.144 tokens. El drafter no incluye visión ni audio.

No se describe un pipeline de entrenamiento propio en la informacion disponible: los pesos derivan del checkpoint QAT de Google `google/gemma-4-E4B-it-qat-q4_0-unquantized-assistant` en la revisión `27f8d20`. La innovación del build es la cuantización: cada matriz de pesos se lleva a Q4_0 recuperando el paso entrenado de cada bloque (magnitud máxima dividida por 8, 7, ... 1, según cuál deje los 32 valores en un nivel entero), refinado por mínimos cuadrados y almacenado como escala de bloque en fp16. Ningún bloque quedó fuera de la rejilla y entre el 96,5 % y el 97,1 % de los valores por tensor reproducen exactamente el origen en bf16 al redondear. El conversor de llama.cpp omite los centroides `masked_embedding` del checkpoint y el orden de tokens (un atajo agrupado para la cabeza de salida); llama.cpp puntúa el vocabulario completo, y el resto de metadatos (hiperparámetros, tokenizador, plantilla de chat) procede del conversor, con `general.file_type` fijado a Q4_0.

## Capacidades

- Generación de texto como drafter: propone tokens candidatos que el modelo objetivo verifica, con 2 tokens redactados por paso en las pruebas del autor.
- No genera respuestas por sí solo: sin un target Gemma 4 E4B-it QAT que lo acompañe no produce salida utilizable.
- Soporte de tool calling a través del target: la pareja medida alcanza 0,9150 en BFCL simple (400 llamadas a herramientas), frente a 0,9100 sin drafter.
- Razonamiento matemático heredado del target: 0,9325 en GSM8K (1.319 problemas), idéntico al resultado sin drafter.
- Texto únicamente: no hay componentes de visión ni de audio en el drafter.
- Multilingüismo: no declarado; depende exclusivamente del modelo objetivo y de su tokenizador.
- Integración con decodificación especulativa tipo MTP en llama.cpp (`--spec-type draft-mtp`), con flash attention y caché KV en f16 en las pruebas publicadas.
- Compatibilidad de plantilla de chat y tokenizador con el ecosistema Gemma 4 (262.144 tokens de vocabulario).

## Casos de uso

- Aceleración de inferencia local en GPU de consumo: sobre una RTX 3050 OEM de 8 GB, añadir el drafter con `-c 8192` mantiene el consumo conjunto target + drafter en 4.499 MiB y sube el rendimiento de 58,2 a 100,0 tok/s, lo que permite servir Gemma 4 E4B-it QAT en equipos modestos.
- Asistentes conversacionales de baja latencia: al duplicar aproximadamente el throughput con la misma calidad de respuesta, reduce el tiempo hasta el primer token percibido en chats multi-turno servidos desde una sola GPU.
- Despliegue por lotes con tool calling: con 8 peticiones simultáneas, la tasa de aceptación de tokens redactados es de 0,8382 y BFCL simple se mantiene en 0,9150, por lo que es adecuado para backends de agentes que resuelven varias llamadas a funciones en paralelo.
- Pipelines de CI/CD y tests de agentes: el fichero de 57 MiB se descarga y carga rápido, lo que permite incorporarlo a entornos de pruebas que necesiten ejecutar el target repetidamente sin agotar el presupuesto de tiempo.
- Investigación en decodificación especulativa: al publicar el script de construcción (`evidence/gguf_exact.py`), el informe por tensor y la tabla por prompt, sirve como caso de estudio reproducible sobre cómo la precisión del drafter (Q4_0, Q8_0, bf16) apenas afecta a la aceptación (0,481, 0,487 y 0,484 respectivamente).
- Sustitución de un drafter Q8_0 en producción: el fichero ocupa 59.678.368 bytes frente a 98.672.288 bytes del Q8_0 del conversor, con menor error relativo (0,00138 frente a 0,00486) y 4499 MiB frente a 4537 MiB de VRAM, por lo que libera memoria y disco sin coste de velocidad.
- Prototipado en cuadernos y demos con una sola GPU: al no necesitar memoria adicional apreciable ni cambiar la salida greedy del target, se puede activar y desactivar por configuración para comparar latencias en la misma máquina.

## Benchmarks y rendimiento

Datos publicados por el autor. Entorno: RTX 3050 OEM (8 GB), llama.cpp `77c4540ce`, target `xbill9/gemma-4-E4B-it-qat-q4_0-exact-gguf`, flash attention, caché KV en f16. Velocidad medida con seis prompts (código, chat, relato, explicación, datos, resumen), 256 tokens, greedy, mediana de tres ejecuciones y media geométrica entre prompts, 2 tokens redactados por paso. Calidad medida con 8 peticiones simultáneas, greedy y 2 tokens redactados.

| Metrica | Q8_0 (conversor de llama.cpp) | Este GGUF Q4_0 |
|---|---:|---:|
| Tamano de fichero | 98.672.288 B | 59.678.368 B |
| Error relativo frente a pesos bf16 de Google | 0,00486 | 0,00138 |
| Pesos bit a bit identicos (decuantizados, fp32) | 11,4 % | 28,7 % |
| Generacion con drafter (target E4B, RTX 3050) | 100,4 tok/s (1,72x) | 100,0 tok/s (1,72x) |
| Tokens redactados aceptados | 0,487 | 0,481 |
| VRAM, target + drafter, `-c 8192` | 4537 MiB | 4499 MiB |

Referencias adicionales del mismo informe: el target sin drafter rinde 58,2 tok/s; los pesos bf16 de Google servidos sin cambios aceptan la misma proporción de tokens (0,484) y son más lentos (92,3 tok/s, 1,58x). Todas las precisiones del drafter produjeron las mismas respuestas greedy.

| Tarea | Sin drafter | Drafter Q8_0 | Este drafter |
|---|---:|---:|---:|
| GSM8K, 1319 problemas | 0,9325 | 0,9310 | 0,9325 |
| BFCL simple, 400 llamadas a herramientas | 0,9100 | 0,9150 | 0,9150 |
| Tokens redactados aceptados (ambas tandas) | — | 0,8374 | 0,8382 |

Emparejado sobre los mismos problemas, la diferencia de cada variante con drafter frente a la variante sin drafter tiene un intervalo bootstrap del 95 % que incluye el cero. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: 4499 MiB para target Q4_0 más drafter con `-c 8192` y 2 tokens redactados por paso, medido en RTX 3050 OEM de 8 GB con flash attention y caché KV en f16 (4537 MiB con el drafter Q8_0).
- GPU recomendadas: el autor valida RTX 3050 OEM (8 GB). Cualquier GPU con al menos 6-8 GB de VRAM debería alojar la pareja a esa configuración; no hay mediciones publicadas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, con 8 GB de VRAM en la configuración medida. El drafter por sí solo ocupa unos 57 MiB en disco, por lo que su coste de memoria es marginal frente al target.
- Opciones de despliegue: llama.cpp y `llama-server`, con el flag `-md` para el modelo auxiliar, `--spec-type draft-mtp`, `-ngld all` y `--spec-draft-n-max 2`. Requiere una compilación con soporte de MTP para Gemma 4 (PR `#23398`, junio de 2026); el autor midió sobre el build `77c4540ce`. No se documenta compatibilidad con vLLM, TGI, Ollama ni otros runtimes.
- Latencia y throughput: 100,0 tok/s frente a 58,2 tok/s sin drafter (1,72x) en la configuración indicada; el drafter bf16 de Google se queda en 92,3 tok/s (1,58x).
- Comando de referencia publicado:
  `llama-server -m <E4B QAT Q4_0 target>.gguf -ngl 99 -fa 1 -md gemma-4-E4B-it-qat-assistant-q4_0-exact.gguf --spec-type draft-mtp -ngld all --spec-draft-n-max 2`

## Comparativa con modelos similares

La comparación relevante no es con otros modelos generativos, sino con las alternativas de drafter para el mismo target Gemma 4 E4B-it QAT Q4_0, más la opción de no usar drafter.

| Opcion | Tamano | Error relativo vs. bf16 | Tokens aceptados | Velocidad (RTX 3050) | VRAM (target + drafter, `-c 8192`) | Licencia |
|---|---:|---:|---:|---:|---:|---|
| Este GGUF Q4_0 (xbill9) | 59.678.368 B | 0,00138 | 0,481 | 100,0 tok/s (1,72x) | 4499 MiB | Apache 2.0 + terminos Gemma 4 |
| Drafter Q8_0 del conversor de llama.cpp | 98.672.288 B | 0,00486 | 0,487 | 100,4 tok/s (1,72x) | 4537 MiB | segun el conversor / pesos de Google |
| Drafter bf16 de Google sin cuantizar | no disponible | referencia | 0,484 | 92,3 tok/s (1,58x) | no disponible | Apache 2.0 + terminos Gemma 4 |
| Sin drafter (solo target) | no aplica | no aplica | no aplica | 58,2 tok/s (1,0x) | no disponible | Apache 2.0 + terminos Gemma 4 |

No se dispone de comparaciones con drafters de otros ecosistemas (por ejemplo, decodificación especulativa en vLLM o EAGLE) para este modelo: no disponible.

## Limitaciones y advertencias

- No es un modelo autónomo: sin un target Gemma 4 E4B-it QAT de la misma precisión Q4_0 no genera respuestas utilizables. La model card de Google exige que el drafter coincida con la precisión QAT del target.
- Build no oficial: creado y publicado de forma independiente a Google, sin soporte del fabricante. El repositorio registra 0 descargas y 0 likes en el momento de la consulta (creado el 14 de octubre de 2026), por lo que no hay validación comunitaria.
- Dependencia estricta de versión: necesita una compilación de llama.cpp con soporte de MTP para Gemma 4 (PR `#23398`, junio de 2026). En runtimes sin esa funcionalidad (vLLM, TGI, Ollama) el fichero no es utilizable.
- Cobertura lingüística no declarada: la model card no especifica idiomas y el modelo es solo de texto; cualquier afirmación sobre multilingüismo depende del target, no del drafter.
- Riesgo de alucinación: el drafter no decide la salida, ya que el target verifica cada token redactado; los datos publicados no muestran diferencias de calidad atribuibles al drafter más allá del redondeo en la comprobación por lotes. El riesgo de alucinación es el del modelo objetivo.
- Ganancia modesta en aceptación: 0,481 (2 tokens por paso) y 0,8382 (ambas tandas) implican que la aceleración depende del tipo de prompt; en el informe no se documentan casos con ganancias muy superiores a 1,72x.
- Licencia: la model card declara Apache 2.0 «como la fuente de Google» y remite a los términos de Gemma 4; conviene revisar esos términos antes de un uso comercial, ya que el propio autor enlaza la licencia específica de Gemma 4.
- Metadatos de cuantización omitidos: llama.cpp descarta los centroides `masked_embedding` y el orden de tokens del checkpoint original, de modo que la cabeza de salida se evalúa sobre el vocabulario completo en lugar del atajo agrupado.
- Verificación independiente: los únicos datos de rendimiento son los del autor, medidos en una sola GPU (RTX 3050 OEM de 8 GB) y sobre prompts propios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xbill9/gemma-4-E4B-it-qat-assistant-q4_0-exact-gguf
- Modelo base (Google): https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-unquantized-assistant
- Target GGUF recomendado por el autor (build propio): https://huggingface.co/xbill9/gemma-4-E4B-it-qat-q4_0-exact-gguf
- Target GGUF oficial de Google: https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-gguf
- Model card original de Google, conservada en `ORIGINAL_README.md` dentro del repositorio
- Script de construcción y evidencias: carpeta `evidence/` del repositorio (`gguf_exact.py`, informe por tensor y tabla por prompt)
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- PR de llama.cpp con soporte de MTP para Gemma 4: `#23398` (junio de 2026, referenciado en la model card); build probado `77c4540ce`
