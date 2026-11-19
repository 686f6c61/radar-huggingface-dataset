# turintech/gemma-4-E2B-it-Artemis-GGUF

## Resumen

Gemma 4 E2B it Artemis GGUF es una cuantización del checkpoint oficial de Google `google/gemma-4-E2B-it-qat-q4_0-unquantized`, publicada por TurinTech bajo su pipeline de compresión Artemis. El modelo base es un Gemma 4 de la variante E2B (4.628.569.635 parámetros totales según safetensors), ajustado para instrucciones y con capacidad multimodal de entrada imagen-texto, orientado a conversación y a la invocación de herramientas en entornos con recursos limitados.

La aportación de esta ficha no es un nuevo entrenamiento, sino la conversión a formato GGUF y la compresión con Artemis partiendo de un checkpoint ya cuantizado-aware (QAT). El resultado más relevante es que el autor declara una reducción del peso descargable a 2,31 GB y un consumo de memoria de CPU de 3,6 GiB (frente a los 4,7 GiB del original), manteniendo el rendimiento en tool calling de BFCL live en 196 de 258 llamadas correctas, frente a 194 del modelo de partida.

Es relevante ahora porque permite ejecutar un modelo Gemma 4 multimodal con soporte de tool calling, plantilla de chat con modo de razonamiento (thinking) y un drafter MTP (multi-token prediction) para decodificación especulativa directamente en CPU, con despliegue vía llama.cpp, Ollama o LM Studio, y con licencia Apache 2.0 en esta distribución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, variante E2B); no se detalla la composición interna en la información disponible |
| Parámetros totales | 4.628.569.635 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible como máximo oficial; el ejemplo de despliegue del autor usa 8.192 tokens (`-c 8192`) |
| Tipos de cuantización | Q3_K_L (fichero publicado y medido); el autor indica que el mismo comando sirve para los otros tres ficheros del repo, sin especificar sus nombres |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (llama.cpp); incluye proyector visual de 986 MB y drafter MTP convertidos |
| Tamaño del repo | 10,4 GB |
| Peso del fichero Q3_K_L | 2,31 GB |
| Memoria de CPU requerida (Q3_K_L, solo texto) | 3,6 GiB (original: 4,7 GiB) |
| Modalidad | image-text-to-text (entrada de imagen y texto) |
| Modelo base | google/gemma-4-E2B-it-qat-q4_0-unquantized |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint QAT de Gemma 4 E2B en su variante instruida. No se ha reentrenado: TurinTech parte de los pesos ya preparados para cuantización de Google y aplica su pipeline Artemis para producir ficheros GGUF compatibles con llama.cpp. La información disponible no detalla la composición del dataset de entrenamiento original, el número de tokens, ni si hubo fases de RLHF o DPO.

Los elementos técnicos destacables que sí documenta el autor son tres. Primero, la conversión y verificación del proyector visual (986 MB), que se descarga y carga automáticamente al usar `-hf` salvo que se pase `--no-mmproj`. Segundo, la conversión y medida de un drafter MTP para decodificación especulativa, verificado con la build b11889 de llama.cpp. Tercero, la plantilla de chat Jinja incluida, que activa el modo de razonamiento por defecto y separa la salida en `message.reasoning_content` (razonamiento) y `message.content` (respuesta final).

Las mediciones del autor se realizaron con llama.cpp build b11617, en modo solo texto, con `-np 1` (una única ranura) y `--cache-ram 0` para desactivar la caché de prompt en RAM. Con la caché por defecto (8 GiB), el consumo crecía hasta 11,8 GiB durante la suite completa de tareas, dato relevante para dimensionar despliegues.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat integrada y compatible con la API de chat completions de llama-server.
- Razonamiento explícito en modo thinking: el razonamiento se devuelve en `reasoning_content` y puede desactivarse con `"chat_template_kwargs": {"enable_thinking": false}`.
- Tool calling / function calling: las llamadas se devuelven en `choices[0].message.tool_calls`; el autor reporta 196 de 258 llamadas correctas en BFCL live.
- Comprensión de imágenes: pipeline image-text-to-text, con proyector visual incluido en el repo.
- Razonamiento matemático de tipo escolar: 221 de 250 respuestas correctas en las últimas 250 preguntas de GSM8K.
- Seguimiento de instrucciones: 410 de 539 restricciones cumplidas en IFEval.
- Conocimiento y razonamiento de nivel avanzado: 57 de 280 aciertos en la muestra de MMLU-Pro.
- Decodificación especulativa mediante drafter MTP convertido y verificado por el autor.
- Ejecución en CPU sin GPU, con huella de memoria de 3,6 GiB en el fichero Q3_K_L.

## Casos de uso

- Asistentes conversacionales en CPU: el fichero Q3_K_L ocupa 2,31 GB y consume 3,6 GiB de RAM en modo texto, por lo que puede desplegarse en servidores sin GPU o en portátiles; el autor cita unos 115 tokens por segundo en un Apple M3 Max de 36 GB con Metal.
- Agentes con invocación de herramientas: el modelo devuelve tool calls estructuradas en la API de chat completions, lo que permite integrarlo en flujos de automatización que encadenen funciones externas (consultas a bases de datos, APIs HTTP, cálculos) sin infraestructura GPU.
- Procesamiento de documentos con imagen: al incluir proyector visual, puede recibir capturas, formularios escaneados o diagramas junto con instrucciones de texto para extracción o descripción, siempre que se cargue el proyector (sin `--no-mmproj`).
- Razonamiento paso a paso auditable: el modo thinking separa el razonamiento de la respuesta final, útil en entornos donde se quiere registrar o revisar la cadena de razonamiento antes de mostrar el resultado al usuario.
- Automatización local en estaciones de trabajo: con Ollama (`ollama run turintech/gemma-4-e2b-it-artemis`) o LM Studio, se puede desplegar en equipos de desarrollo para tareas de asistencia, resumen o clasificación sin depender de servicios en la nube.
- Prototipado de aplicaciones multimodales: al ser GGUF y compatible con llama-server, sirve para validar pipelines de imagen-texto en local antes de migrar a variantes de mayor tamaño o a infraestructura con GPU.
- Servicio de chat con contexto moderado: con `-c 8192` y una sola ranura (`-np 1`), es adecuado para sesiones de conversación de longitud media en las que el coste de memoria debe mantenerse acotado.

## Benchmarks y rendimiento

Resultados declarados por el autor (TurinTech) en la model card; no verificados de forma independiente.

| Benchmark | Métrica | Resultado | Referencia |
|---|---|---|---|
| BFCL live | Llamadas de herramienta correctas | 196 de 258 | Original: 194 |
| GSM8K (últimas 250) | Respuestas correctas | 221 de 250 | no disponible |
| MMLU-Pro (muestra) | Respuestas correctas | 57 de 280 | no disponible |
| IFEval | Restricciones cumplidas | 410 de 539 | no disponible |

Datos de rendimiento en hardware aportados por el autor: en un Apple M3 Max con 36 GB y llama.cpp con Metal (build b11617), el fichero Q3_K_L carga y responde a aproximadamente 115 tokens por segundo. No se han publicado cifras de latencia o throughput en otras plataformas en la información disponible.

## Requisitos de hardware

- VRAM: no aplica para el modo CPU documentado; el autor reporta 3,6 GiB de memoria de CPU con el fichero Q3_K_L en modo texto, una ranura y caché de prompt desactivada.
- Memoria con caché por defecto: hasta 11,8 GiB durante la suite completa de tareas si no se usa `--cache-ram 0`, según la medición del autor.
- GPU recomendadas: no disponibles en la información proporcionada. El autor solo documenta ejecución en CPU y en Apple M3 Max con Metal.
- GPU de consumo: no se especifica compatibilidad ni rendimiento en RTX 4090 u otras tarjetas consumer; no disponible.
- Despliegue: llama.cpp (llama-server, requiere soporte de Gemma 4; el autor cita las builds b11617 y b11889), Ollama (`turintech/gemma-4-e2b-it-artemis`) y LM Studio (`turintech/gemma-4-e2b-it-artemis`).
- Descarga del modelo: 2,31 GB para el fichero Q3_K_L; el repo completo ocupa 10,4 GB; el proyector visual añade 986 MB si se carga.
- Throughput estimado: aproximadamente 115 tokens por segundo en Apple M3 Max (36 GB) con Metal; no hay datos para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| turintech/gemma-4-E2B-it-Artemis-GGUF | 4.628.569.635 | 8.192 en el ejemplo de despliegue | GGUF | apache-2.0 | 196/258 en BFCL live; 3,6 GiB de RAM en CPU |
| google/gemma-4-E2B-it-qat-q4_0-unquantized (base) | 4.628.569.635 | no disponible | safetensors | licencia Gemma 4 de Google | 194/258 en BFCL live; 4,7 GiB según el autor |
| Otras variantes de Gemma 4 E2B | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| Alternativas de otro fabricante en el mismo rango | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

La información disponible solo permite comparar de forma directa con el checkpoint base del que deriva esta cuantización.

## Limitaciones y advertencias

- Los benchmarks son declarados por el autor y figuran como no verificados; no deben tratarse como resultados independientes.
- La muestra de MMLU-Pro es pequeña (280 preguntas) y GSM8K se evalúa solo sobre las últimas 250 preguntas, lo que limita la comparabilidad con cifras publicadas sobre el conjunto completo.
- El modo thinking está activado por defecto en la plantilla de chat: si no se desactiva, hay que reservar suficientes tokens de salida (el autor sugiere unos 1.500) o la respuesta puede truncarse.
- El rendimiento medido se obtuvo con `-np 1` y `--cache-ram 0`; con la caché de prompt por defecto el consumo de memoria crece notablemente (hasta 11,8 GiB en la suite del autor), lo que puede provocar problemas en máquinas ajustadas de RAM.
- La licencia declarada en el repo es Apache 2.0, pero el enlace de licencia apunta a la licencia de Gemma 4 de Google; conviene revisar los términos de uso comercial aplicables al modelo base antes de desplegarlo en producción.
- No se especifican los idiomas soportados ni el contexto máximo oficial; el valor de 8.192 tokens es solo el usado en el ejemplo de despliegue, no una cifra confirmada de ventana máxima.
- No se han publicado datos de sesgos, tasas de alucinación ni evaluaciones de seguridad en la información disponible.
- La ejecución requiere una versión de llama.cpp con soporte de Gemma 4; builds anteriores pueden fallar al cargar el modelo, el proyector o el drafter MTP.
- El proyector visual se descarga y carga por defecto con `-hf`; si solo se necesita texto, debe pasarse `--no-mmproj` para evitar el coste adicional de 986 MB.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/turintech/gemma-4-E2B-it-Artemis-GGUF
- Resultados declarados en la model card: https://huggingface.co/turintech/gemma-4-E2B-it-Artemis-GGUF#results
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- TurinTech: https://www.turintech.ai
- Otros modelos de TurinTech: https://huggingface.co/turintech
- Ollama: https://ollama.com/turintech/gemma-4-e2b-it-artemis
- LM Studio: https://lmstudio.ai/turintech/gemma-4-e2b-it-artemis
- Discord de TurinTech: https://discord.gg/5mCDSyU9sT
- LinkedIn de TurinTech: https://www.linkedin.com/company/turintechai
