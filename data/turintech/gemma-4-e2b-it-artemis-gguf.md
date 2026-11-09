# turintech/gemma-4-E2B-it-Artemis-GGUF

## Resumen

Gemma 4 E2B IT Artemis GGUF es una cuantización del checkpoint oficial `google/gemma-4-E2B-it-qat-q4_0-unquantized` de Google, publicada por TurinTech bajo su pipeline de compresión Artemis. El modelo base es la variante instruct de la familia Gemma 4 de Google, con capacidades multimodales (image-text-to-text) y un total de 4.628.569.635 parámetros. TurinTech redistribuye el modelo en formato GGUF para su uso con llama.cpp, con el objetivo declarado de ejecutar chat y tool calls en CPU.

La relevancia de esta ficha reside en que combina tres elementos poco habituales en un modelo de este tamaño: cuantización QAT de origen (el checkpoint base ya viene cuantizado a q4_0), compresión adicional mediante Artemis hasta un archivo de 2,31 GB que requiere 3,6 GiB de memoria de CPU, y soporte de decodificación especulativa mediante un drafter MTP (multi-token prediction) convertido también a GGUF. El resultado declarado por el autor es un modelo que mantiene el rendimiento en tool calling del original (196 de 258 llamadas correctas frente a 194 del checkpoint de referencia) con una huella de memoria notablemente reducida.

El modelo se distribuye con licencia Apache 2.0 según los metadatos de Hugging Face, aunque el enlace de licencia de la model card apunta a los términos de Gemma 4 de Google. Soporta visión mediante un proyector multimodal separado (`mmproj-F16.gguf`, 986 MB) y modo thinking activado por defecto en la plantilla de chat. El repositorio acumula 386.792 descargas y está disponible también en Ollama y LM Studio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), con drafter MTP para decodificación especulativa; detalles internos no disponibles |
| Parametros totales | 4.628.569.635 |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | 8.192 tokens en el ejemplo de despliegue documentado (`-c 8192`); máximo nativo no disponible |
| Tipos de cuantizacion | Q3_K_L (archivo principal documentado, 2,31 GB); se mencionan otros tres archivos GGUF en el repo; proyector multimodal en F16 (`mmproj-F16.gguf`, 986 MB) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (metadatos HF); enlace a términos Gemma 4 de Google en la model card |
| Formato de pesos | GGUF (llama.cpp); requiere build con soporte de Gemma 4 (probado con b11617 y b11889) |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-E2B-it-qat-q4_0-unquantized`, un checkpoint instruct de Gemma 4 con cuantización consciente del entrenamiento (QAT) a q4_0. TurinTech aplica su pipeline Artemis sobre ese checkpoint para producir los archivos GGUF, incluyendo la conversión del proyector de visión y del drafter MTP. No se detalla en la información disponible la arquitectura interna exacta (número de capas, tipo de atención, composición del dataset de entrenamiento ni si hubo RLHF/DPO), más allá de que se trata de un transformer multimodal con soporte de tool calling y modo thinking.

La innovación técnica destacable es la combinación de QAT de origen con compresión Artemis: el archivo Q3_K_L ocupa 2,31 GB y reduce la memoria de CPU necesaria de 4,7 GiB (original) a 3,6 GiB, manteniendo el rendimiento en BFCL live (196 frente a 194 tool calls correctas). Además, el repositorio incluye un drafter MTP convertido a GGUF que habilita decodificación especulativa en llama.cpp. Las mediciones se realizaron con `-np 1 --cache-ram 0` para desactivar la caché de prompt en RAM de llama-server (8 GiB por defecto), que de otro modo hacía crecer el consumo hasta 11,8 GiB durante la suite completa de tareas.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline image-text-to-text, etiqueta conversational).
- Razonamiento con modo thinking activado por defecto en la plantilla de chat; la respuesta de razonamiento se devuelve en `message.reasoning_content` y la final en `message.content`. Se puede desactivar con `"chat_template_kwargs": {"enable_thinking": false}`.
- Tool calling / function calling: las llamadas se devuelven en `choices[0].message.tool_calls` al enviar una lista `tools` al endpoint compatible con OpenAI.
- Visión: soporte de imágenes mediante el proyector multimodal separado (`mmproj-F16.gguf`); sin `--no-mmproj`, el servidor descarga y carga el proyector automáticamente.
- Decodificación especulativa mediante drafter MTP convertido a GGUF.
- Razonamiento matemático (evaluado en GSM8K) y conocimiento general (evaluado en MMLU-Pro).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistentes de chat en CPU sin GPU: el archivo Q3_K_L requiere solo 3,6 GiB de memoria de CPU y responde a unos 115 tokens por segundo en un Apple M3 Max (36 GB) con Metal, lo que lo hace viable en portátiles y servidores sin acelerador dedicado.
- Agentes con tool calling en producción: el modelo mantiene 196 de 258 llamadas correctas en BFCL live, por lo que puede integrarse en flujos de agentes que invocan APIs, bases de datos o funciones internas mediante el endpoint compatible con OpenAI de llama-server.
- Automatización de atención al cliente: con 8.192 tokens de contexto y modo conversacional multi-turno, puede gestionar hilos de soporte con historial moderado; conviene desactivar el modo thinking o reservar unos 1.500 tokens de salida si se mantiene activo.
- Procesamiento de documentos con imágenes: al cargar el proyector multimodal, el modelo puede responder preguntas sobre capturas, formularios o diagramas, útil en pipelines de extracción de información sin infraestructura GPU.
- Evaluación de instrucciones y generación controlada: con 410 de 539 instrucciones seguidas en IFEval, es adecuado para tareas de formato estricto (JSON, plantillas, listas) en las que el cumplimiento de restricciones es crítico.
- Despliegue en entornos de borde o CI: al distribuirse en Ollama (`ollama run turintech/gemma-4-e2b-it-artemis`) y LM Studio, puede incorporarse a pruebas automatizadas o demos locales sin dependencias de servicios en la nube.
- Razonamiento matemático básico: con 221 de 250 correctas en GSM8K, sirve para asistentes educativos o validación de cálculos aritméticos de varios pasos en aplicaciones de nicho.

## Benchmarks y rendimiento

Resultados declarados por el autor (TurinTech), no verificados de forma independiente:

| Benchmark | Métrica | Resultado | Referencia |
|---|---|---|---|
| BFCL live | Tool calls correctas | 196 de 258 | Original: 194 |
| GSM8K (últimas 250) | Correctas | 221 de 250 | no disponible |
| MMLU-Pro (muestra) | Correctas | 57 de 280 | no disponible |
| IFEval | Instrucciones seguidas | 410 de 539 | no disponible |

Rendimiento medido: aproximadamente 115 tokens por segundo en Apple M3 Max (36 GB) con llama.cpp Metal (b11617) usando el archivo Q3_K_L.

## Requisitos de hardware

- VRAM/memoria: 3,6 GiB de memoria de CPU para el archivo Q3_K_L en modo texto con `-np 1 --cache-ram 0`; el checkpoint original requiere 4,7 GiB. Sin desactivar la caché de prompt en RAM, el consumo crece hasta 11,8 GiB durante la suite completa.
- Proyector de visión: 986 MB adicionales si se carga `mmproj-F16.gguf`.
- GPU: no se documentan requisitos de GPU; el modelo está orientado a CPU. Funciona con Metal en Apple Silicon (medido en M3 Max).
- GPU de consumo: no disponible; no se han publicado cifras para RTX 4090 u otras GPU de consumo.
- Despliegue: llama.cpp (`llama-server`), Ollama y LM Studio. Requiere build de llama.cpp con soporte de Gemma 4 (probado con b11617 y b11889).
- Contexto en despliegue: 8.192 tokens en el ejemplo documentado.
- Throughput: ~115 tok/s en M3 Max con Metal; latencia no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BFCL live | Licencia | Formato |
|---|---|---|---|---|---|
| gemma-4-E2B-it-Artemis-GGUF | 4.628.569.635 | 8.192 (despliegue documentado) | 196/258 | apache-2.0 (metadatos) | GGUF |
| google/gemma-4-E2B-it-qat-q4_0-unquantized (base) | 4.628.569.635 | no disponible | 194/258 | términos Gemma 4 | safetensors |
| Otros modelos de ~4-5B con tool calling | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos alternativos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Los benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en la model-index).
- El modo thinking está activado por defecto en la plantilla de chat: requiere reservar unos 1.500 tokens de salida o desactivarlo explícitamente, lo que puede degradar el rendimiento en tareas de razonamiento.
- El contexto documentado en el ejemplo de despliegue es de 8.192 tokens; el máximo nativo no se especifica, por lo que no debe asumirse una ventana mayor sin verificación.
- La memoria de CPU crece de 3,6 GiB a 11,8 GiB si no se usa `--cache-ram 0`, lo que puede romper despliegues ajustados.
- Requiere una build reciente de llama.cpp con soporte de Gemma 4; versiones anteriores no cargarán el modelo.
- Idiomas soportados no disponibles: no se puede garantizar calidad multilingüe fuera del inglés sin evaluación propia.
- Posible riesgo de alucinación inherente a modelos de 4,6B parámetros, especialmente en MMLU-Pro (57 de 280 correctas, ~20,4%), lo que limita su uso en tareas de conocimiento factual denso.
- Licencia ambigua: los metadatos indican apache-2.0 pero la model card enlaza a los términos de Gemma 4 de Google; conviene verificar las condiciones de uso comercial antes de producción.
- Sesgos conocidos: no disponibles en la información proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/turintech/gemma-4-E2B-it-Artemis-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
- TurinTech: https://www.turintech.ai
- Otros modelos de TurinTech: https://huggingface.co/turintech
- Ollama: https://ollama.com/turintech/gemma-4-e2b-it-artemis
- LM Studio: https://lmstudio.ai/turintech/gemma-4-e2b-it-artemis
- LinkedIn de TurinTech: https://www.linkedin.com/company/turintechai
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Resultados declarados: https://huggingface.co/turintech/gemma-4-E2B-it-Artemis-GGUF#results
