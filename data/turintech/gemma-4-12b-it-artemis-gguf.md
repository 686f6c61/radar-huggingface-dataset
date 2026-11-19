# turintech/gemma-4-12B-it-Artemis-GGUF

## Resumen

Gemma 4 12B it Artemis GGUF es una versión cuantizada en formato GGUF del checkpoint QAT (quantization-aware training) de Google Gemma 4 12B instruct, publicada por TurinTech. El modelo base, `google/gemma-4-12B-it-qat-q4_0-unquantized`, es un modelo multimodal de tipo image-text-to-text con 11.907 millones de parámetros (~11,9 mil millones), entrenado por Google DeepMind y distribuido bajo licencia Apache 2.0. TurinTech aplica su pipeline propietario Artemis para comprimir el checkpoint QAT a un archivo de 6,72 GB que se ejecuta con aproximadamente 7,5 GiB de VRAM, frente a los 23,6 GiB del original.

El modelo resuelve el problema de desplegar un modelo multimodal de 12B con capacidades de tool calling, razonamiento y visión en hardware de consumo o en una única GPU de gama media. Mantiene el rendimiento del checkpoint original en las métricas medidas por el autor: 210 de 258 tool calls correctas en BFCL live, 243 de 250 en GSM8K y 475 de 539 instrucciones seguidas en IFEval. Incluye además un proyector de visión separado y un drafter MTP (multi-token prediction) para decodificación especulativa, ambos convertidos desde los pesos originales.

La relevancia actual radica en la combinación de tres factores: licencia Apache 2.0 sin restricciones de uso comercial, soporte nativo en llama.cpp con plantilla de chat Jinja y modo thinking configurable, y un tamaño que cabe en GPUs consumer de 8-12 GB. La ficha se basa exclusivamente en la model card y los metadatos publicados por TurinTech; los datos no declarados se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos no disponibles |
| Parametros totales | 11.907.350.576 (~11,9 mil millones) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 8.192 tokens en la configuracion de ejemplo de llama-server (`-c 8192`); maximo nativo no disponible |
| Tipos de cuantizacion | Q4_0 (GGUF); repo de 7,4 GB con archivo principal de 6,72 GB |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (llama.cpp); proyector de vision en archivos separados (incluye mmproj-F16.gguf) |

## Arquitectura y entrenamiento

El modelo es una adaptación del checkpoint `google/gemma-4-12B-it-qat-q4_0-unquantized`, que Google produjo mediante entrenamiento consciente de cuantizacion (QAT) para el esquema q4_0. TurinTech no entrena el modelo desde cero: aplica su pipeline Artemis sobre ese checkpoint para generar pesos GGUF compatibles con llama.cpp, preservando el comportamiento del original. La arquitectura interna del transformer (número de capas, dimensión oculta, mecanismo de atención) no se detalla en la información proporcionada; sí se confirma que es multimodal, con entrada de imagen y de audio (las capas de audio están presentes en el proyector pero no fueron probadas por el autor).

Entre las innovaciones técnicas documentadas destacan tres. Primero, el uso del checkpoint QAT como punto de partida, que reduce la degradación por cuantización respecto a cuantizar un modelo entrenado en BF16. Segundo, la conversión de un drafter MTP (multi-token prediction) para decodificación especulativa, verificado con llama.cpp build b11889. Tercero, la separación del proyector de visión en un archivo independiente (`mmproj`), que permite omitir su descarga de 175 MB cuando solo se necesita texto (`--no-mmproj`). La plantilla de chat activa el modo thinking por defecto, devolviendo el razonamiento en `message.reasoning_content` y la respuesta en `message.content`; todas las métricas publicadas se midieron con thinking desactivado mediante `"chat_template_kwargs": {"enable_thinking": false}`.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat Jinja compatible con el endpoint `/v1/chat/completions` de llama-server.
- Modo thinking configurable: razonamiento expuesto en `reasoning_content` y respuesta final en `content`; se puede desactivar por petición.
- Tool calling / function calling: las llamadas se devuelven en `choices[0].message.tool_calls` y se midieron 210 aciertos de 258 en BFCL live.
- Razonamiento matemático: 243 de 250 respuestas correctas en el subconjunto GSM8K evaluado.
- Seguimiento de instrucciones: 475 de 539 instrucciones cumplidas en IFEval.
- Conocimiento general y razonamiento de nivel avanzado: 114 de 280 correctas en la muestra de MMLU-Pro.
- Visión: entrada de imágenes vía data URL en el campo `image_url` del mensaje de usuario; 13 de 20 preguntas sobre gráficos acertadas con proyector BF16 (12 con F16).
- Entrada de audio: las capas correspondientes existen en el proyector, pero no fueron probadas según el autor.
- Decodificación especulativa mediante drafter MTP convertido y medido con llama.cpp b11889.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional local con tool calling: el modelo puede gestionar diálogos multi-turno y emitir llamadas a funciones en el mismo endpoint, integrándose en aplicaciones de escritorio o servidores locales con llama.cpp y una ventana de 8.192 tokens.
- Automatización de agentes con razonamiento intermedio: activando el modo thinking, el modelo produce trazas de razonamiento separadas de la respuesta final, útiles para pipelines de multi-step reasoning donde se quiere auditar el proceso de decisión.
- Análisis de gráficos e imágenes en entornos con recursos limitados: con el proyector de visión, puede responder preguntas sobre charts y capturas, con un rendimiento medido de 13/20 en el conjunto de prueba del autor, suficiente para tareas de extracción y descripción no críticas.
- Despliegue en estaciones de trabajo con una sola GPU consumer: el archivo Q4_0 de 6,72 GB y 7,5 GiB de VRAM permiten ejecutar el modelo en GPUs de 8-12 GB, habilitando prototipos de producto sin infraestructura de centro de datos.
- Evaluación de modelos multimodales en investigación: al ser una cuantización de un checkpoint QAT con métricas declaradas, sirve como referencia para estudiar la degradación por cuantización en tareas de tool calling, matemáticas e instrucciones.
- Integración en CI/CD para pruebas de agentes: el servidor llama-server con `--jinja` y endpoint compatible con OpenAI permite montar tests automatizados de function calling y validación de esquemas de herramientas en pipelines.
- Uso comercial sin restricciones de licencia: Apache 2.0 permite incorporar el modelo en productos propietarios, con la salvedad de revisar el license_link de Gemma 4 enlazado por el autor.

## Benchmarks y rendimiento

Resultados declarados por TurinTech (no verificados de forma independiente), medidos con thinking desactivado.

| Benchmark | Metrica | Resultado | Referencia |
|---|---|---|---|
| BFCL live | Tool calls correctas | 210 de 258 | Original: 210 de 258 |
| GSM8K (ultimas 250) | Respuestas correctas | 243 de 250 | no disponible |
| MMLU-Pro (muestra) | Respuestas correctas | 114 de 280 | no disponible |
| IFEval | Instrucciones seguidas | 475 de 539 | no disponible |
| Preguntas sobre imagenes (20 charts) | Respuestas correctas | 13 (proyector BF16); 12 (proyector F16) | Unsloth UD-Q4_K_XL con su proyector: 13 |

El autor indica que el rendimiento en tool calling se mantiene idéntico al checkpoint original (210 de 258). No se han publicado resultados de benchmarks adicionales (MMLU estándar, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7,5 GiB con el archivo Q4_0, frente a 23,6 GiB del checkpoint original sin comprimir.
- Tamaño de descarga: 6,72 GB para el GGUF principal; 175 MB adicionales para el proyector de visión (`mmproj`), omitible con `--no-mmproj` en uso solo texto.
- GPU recomendadas: no especificadas por el autor; por el tamaño de VRAM, encaja en GPUs consumer de 8-12 GB y en GPUs de centro de datos como A100 o H100 con holgura.
- Cabe en GPU consumer: sí, según la cifra de 7,5 GiB declarada; modelos concretos no confirmados en la información disponible.
- Opciones de despliegue: llama.cpp (llama-server, builds con soporte Gemma 4; resultados medidos con b11617 y b11889), Ollama (`ollama run turintech/gemma-4-12b-it-artemis`) y LM Studio (`turintech/gemma-4-12b-it-artemis`).
- Latencia y throughput: no disponibles; el autor no publica cifras de tokens por segundo. La decodificación especulativa con el drafter MTP está soportada y medida, pero sin datos de aceleración declarados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / VRAM | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-12B-it-Artemis-GGUF | ~11,9 mil millones | 8.192 en config de ejemplo | GGUF Q4_0, ~7,5 GiB | Apache 2.0 | Hugging Face, Ollama, LM Studio |
| google/gemma-4-12B-it-qat-q4_0-unquantized | ~11,9 mil millones | no disponible | Pesos sin comprimir, ~23,6 GiB | Apache 2.0 (Gemma 4) | Hugging Face |
| Unsloth UD-Q4_K_XL (Gemma 4 12B) | ~11,9 mil millones (misma base) | no disponible | GGUF UD-Q4_K_XL | Apache 2.0 | Hugging Face |

La comparativa se limita a variantes de la misma familia Gemma 4 12B presentes en la información proporcionada; no se dispone de datos de modelos de otros desarrolladores con tamaño y tarea equivalentes. En el conjunto de 20 preguntas sobre imágenes, Artemis con proyector BF16 iguala a Unsloth UD-Q4_K_XL con su proyector (13 aciertos cada uno).

## Limitaciones y advertencias

- Los benchmarks son declarados por el autor y no verificados de forma independiente (`verified: false` en la model-index); deben interpretarse como indicativos.
- La muestra de MMLU-Pro es pequeña (280 preguntas) y la de GSM8K se limita a las últimas 250, lo que reduce la fiabilidad estadística de esas cifras.
- Riesgo de alucinación inherente a modelos generativos de este tamaño; no se documentan tasas de alucinación.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no declarados; no se puede confirmar cobertura multilingüe ni calidad por idioma.
- La longitud máxima de contexto nativa no se especifica; la configuración de ejemplo usa 8.192 tokens y contextos mayores no están documentados.
- El modo thinking está activado por defecto en la plantilla de chat y requiere unos 1.500 tokens de salida; sin ajustar `max_tokens` o desactivarlo, las respuestas pueden truncarse.
- Las capas de audio del proyector existen pero no fueron probadas; no se debe asumir soporte funcional de audio.
- La licencia del repo es Apache 2.0, pero la model card enlaza además la licencia de Gemma 4 de Google; conviene revisar ambos documentos antes de uso comercial.
- Requiere builds de llama.cpp con soporte Gemma 4 (b11617 para resultados, b11889 para proyector y drafter); versiones anteriores pueden no cargar el modelo correctamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/turintech/gemma-4-12B-it-Artemis-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- Página de resultados del autor: https://huggingface.co/turintech/gemma-4-12B-it-Artemis-GGUF#results
- Resultados detallados (RESULTS.md): https://huggingface.co/turintech/gemma-4-12B-it-Artemis-GGUF/blob/main/RESULTS.md
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Web de TurinTech: https://www.turintech.ai
- Otros modelos de TurinTech: https://huggingface.co/turintech
- Ollama: https://ollama.com/turintech/gemma-4-12b-it-artemis
- LM Studio: https://lmstudio.ai/turintech/gemma-4-12b-it-artemis
- Discord de TurinTech: https://discord.gg/5mCDSyU9sT
- LinkedIn de TurinTech: https://www.linkedin.com/company/turintechai
