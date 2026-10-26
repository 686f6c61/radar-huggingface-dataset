# turintech/gemma-4-E4B-it-Artemis-GGUF

## Resumen

`turintech/gemma-4-E4B-it-Artemis-GGUF` es una conversión a GGUF del checkpoint cuantización-consciente (QAT) `google/gemma-4-E4B-it-qat-q4_0-unquantized` de Google, publicada por TurinTech con su pipeline de compresión Artemis. El modelo resuelve un problema muy concreto: llevar un modelo de chat, razonamiento y uso de herramientas de la familia Gemma 4 a un único fichero de 4,22 GB que corre en CPU o en una GPU pequeña, manteniendo un comportamiento muy cercano al original (99 % de coincidencia en el siguiente token sobre OASST1 según el autor).

El repositorio contiene tres cuantizaciones (Q4_0 por defecto, IQ3_M y Q3_K_M), un proyector multimodal separado (`mmproj`, en BF16 o F16) que habilita la entrada de imágenes, y un drafter MTP (`mtp-gemma-4-E4B-it-Artemis.gguf`) derivado del modelo assistant de Google para decodificación especulativa. El pipeline declarado es `image-text-to-text`, con soporte para servidor de llama.cpp y para Ollama.

El dato de parámetros reales del checkpoint es de 7.463.013.674, muy por encima de los ~4B que sugiere el sufijo E4B del nombre; la model card no desglosa parámetros activos ni arquitectura interna, por lo que esa información queda como no disponible. La licencia declarada en HuggingFace es Apache 2.0, aunque el campo `license_link` remite a la licencia de Gemma 4 de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de la familia Gemma 4, con variante de activación selectiva (denominación E4B) y soporte multimodal mediante proyector separado; detalles internos no disponibles |
| Parametros totales | 7.463.013.674 (7.463 millones) |
| Parametros activos | no disponible (el autor no desglosa el cómputo activo del checkpoint E4B) |
| Longitud de contexto | no disponible como máximo del modelo; los ejemplos del autor usan `-c 8192` (8.192 tokens) |
| Tipos de cuantizacion | Q4_0 (por defecto, 4,22 GB), IQ3_M (~3,8 GB), Q3_K_M (~3,6 GB); proyectores en BF16 y F16; drafter MTP en Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 en los metadatos de HuggingFace; `license_link` apunta a la licencia de Gemma 4 (`https://ai.google.dev/gemma/docs/gemma_4_license`) |
| Formato de pesos | GGUF (llama.cpp); proyector `mmproj-*.gguf` y drafter MTP en GGUF separados |
| Modelo base | google/gemma-4-E4B-it-qat-q4_0-unquantized (relación: quantized) |
| Modalidades de entrada | texto e imagen (proyector `mmproj`); el proyector incluye también el encoder de audio de Gemma, no probado por el autor |
| Tamaño del repositorio | 13,7 GB |
| Descargas / likes | 4.292 descargas, 9 likes (a fecha de actualización 2026-10-26) |

## Arquitectura y entrenamiento

La model card no documenta el entrenamiento: no indica número de tokens, composición del dataset ni si hubo RLHF o DPO. Lo que sí se sabe es que el punto de partida es el checkpoint QAT de Google `gemma-4-E4B-it-qat-q4_0-unquantized`, es decir, un modelo ya entrenado con cuantización consciente de Q4_0 y distribuido con los pesos sin cuantizar; TurinTech parte de ese material y aplica sus técnicas Artemis para producir los GGUF. El modelo resultante es una conversión y compresión independiente, no afiliada ni respaldada por Google.

A nivel de ingeniería, el repositorio separa tres piezas: el fichero principal de pesos, el proyector multimodal (`mmproj-BF16.gguf` / `mmproj-F16.gguf`, 992 MB de descarga) que aporta visión y contiene además el encoder de audio, y el drafter MTP. Este último es la conversión a GGUF del modelo assistant de Google (`google/gemma-4-E4B-it-qat-q4_0-unquantized-assistant`, revisión `27f8d20`), cuantizado a Q4_0, que actúa como borrador de tokens para decodificación especulativa con `--spec-type draft-mtp`. El drafter no funciona de forma autónoma y puede alterar ligeramente las respuestas greedy.

La plantilla de chat va embebida en el fichero y se activa con `--jinja`; activa el modo thinking por defecto, lo que obliga a reservar suficientes tokens de salida (el autor recomienda unos 1.500). Se ha probado con llama.cpp b11617 y, para el proyector de visión y el drafter MTP, con b11889.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat embebida y modo thinking activable o desactivable por petición.
- Razonamiento y matemáticas de varios pasos: 226 de 250 problemas de GSM8K resueltos en la evaluación del autor.
- Uso de herramientas y function calling en formato compatible con la API de chat de OpenAI: 364 de 400 llamadas correctas en BFCL simple (91 %).
- Comprensión de imágenes: preguntas sobre gráficos y tablas enviando la imagen como data URL en una parte `image_url` del mensaje; 9 de 20 preguntas de gráficos correctas con el proyector BF16.
- Entrada de audio: el proyector incluye el encoder de audio de Gemma, pero el autor declara explícitamente que no ha probado audio.
- Decodificación especulativa mediante drafter MTP, que elevó la generación de 278,9 a 490,1 tokens por segundo en una RTX 5090.
- Despliegue compatible con endpoints: el tag `endpoints_compatible` y el ejemplo con `/v1/chat/completions` indican compatibilidad con la interfaz de chat completions de OpenAI.
- Capacidades multilingües: no disponibles en la información proporcionada (la model card no detalla cobertura de idiomas).

## Casos de uso

- Asistentes de atención al cliente en producción: el fichero Q4_0 ocupa 4,22 GB y necesita 3,3 GiB de VRAM con todas las capas en GPU o 6,8 GiB de RAM en CPU, de modo que se puede desplegar una instancia por núcleo de servicio sin depender de un clúster de GPUs.
- Automatización con tool calling: con 364 de 400 llamadas correctas en BFCL simple, es adecuado para agentes que invocan APIs internas (consultas de estado, creación de tickets, lectura de bases de datos) a través de `/v1/chat/completions` con `tools` en la petición.
- Extracción de datos de documentos escaneados y gráficos: enviando la imagen al proyector multimodal se pueden transcribir tablas y responder preguntas sobre figuras; el rendimiento medido (45 % en preguntas de gráficos) lo hace apto para flujos con revisión humana, no para extracción totalmente desatendida.
- Asistente de código en local: el autor incluye respuestas de chat y código en su conjunto de 30 prompts; el modelo cabe en una GPU de consumo y se integra en editores mediante el servidor de llama.cpp en `localhost:8080`.
- Razonamiento matemático con verificación: 226 de 250 aciertos en GSM8K permiten usarlo como primer paso de un pipeline de resolución de problemas aritméticos con comprobación posterior por una herramienta o un modelo mayor.
- Servicio de bajo coste en CPU para desarrollo y CI: con 6,8 GiB de RAM en un Ryzen 9 5900X y `--cache-ram 0`, se puede levantar un servidor de pruebas en máquinas sin GPU para tests de integración de prompts y plantillas.
- Inferencia de alta concurrencia con MTP: usando el drafter (`--spec-type draft-mtp`) se obtienen 490,1 tokens/s en una RTX 5090, útil para tareas de generación masiva por lotes donde el coste por token es el factor limitante.
- Distribución en escritorio y móvil vía Ollama: la etiqueta `turintech/gemma-4-e4b-it-artemis:4.2gb` replica el mismo fichero con el mismo SHA-256, lo que simplifica el despliegue en entornos de usuario final.

## Benchmarks y rendimiento

Resultados declarados por TurinTech (no verificados de forma independiente en la información disponible):

| Evaluación | Métrica | Artemis Q4_0 | Google Q4_0 (5,15 GB) |
|---|---|---|---|
| BFCL simple | Llamadas de herramienta correctas | 364/400 (91,0 %) | 360/400 (90,0 %) |
| GSM8K test | Respuestas correctas | 226/250 (90,4 %) | 231/250 (92,4 %) |
| OASST1 chat | Mismo siguiente token que el original | 99 % | referencia |

| Evaluación adicional | Métrica | Resultado |
|---|---|---|
| Preguntas sobre gráficos (20 ítems), proyector BF16 | Respuestas correctas | 9/20 (45 %) |
| Preguntas sobre gráficos (20 ítems), proyector F16 | Respuestas correctas | 8/20 (40 %) |
| Preguntas sobre gráficos (20 ítems), Unsloth UD-Q4_K_XL con su proyector | Respuestas correctas | 8/20 (40 %) |

| Rendimiento de inferencia | Entorno | Resultado |
|---|---|---|
| Generación Q4_0 sin drafter | RTX 5090, 30 prompts | 278,9 tokens/s |
| Generación Q4_0 con drafter MTP | RTX 5090, 30 prompts | 490,1 tokens/s |
| Generación Q4_0 | Apple M3 Max 36 GB, Metal, llama.cpp b11617 | ~45 tokens/s |

## Requisitos de hardware

- VRAM para Q4_0 (4,22 GB de fichero): 3,3 GiB con todas las capas en una NVIDIA A100 80 GB, según la medición del autor.
- RAM en CPU para Q4_0: 6,8 GiB en un AMD Ryzen 9 5900X usando `--cache-ram 0`.
- Cabe en GPU de consumo: se ha validado en RTX 5090 y en Apple M3 Max de 36 GB con backend Metal; por tamaño de fichero, Q4_0 (4,22 GB) y Q3_K_M (3,6 GB) entran en tarjetas de 8 GB o más.
- Vision: añadir 992 MB de descarga del proyector (`mmproj-BF16.gguf` o `mmproj-F16.gguf`); se puede omitir con `--no-mmproj` para uso solo de texto.
- Decodificación especulativa: fichero adicional `mtp-gemma-4-E4B-it-Artemis.gguf` (Q4_0), que se descarga automáticamente con `--spec-type draft-mtp` al usar `-hf`.
- Opciones de despliegue documentadas: `llama-server` de llama.cpp (versiones b11617 y b11889) y Ollama con las etiquetas `4.2gb` (Q4_0), `3.8gb` (IQ3_M) y `3.6gb` (Q3_K_M).
- Throughput de referencia: 45 tokens/s en M3 Max (Metal) y 490,1 tokens/s en RTX 5090 con drafter MTP; no se publican cifras de latencia por petición ni de concurrencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| turintech/gemma-4-E4B-it-Artemis-GGUF (Q4_0) | 7.463 millones totales; activos no disponibles | no disponible (ejemplos a 8.192) | 364/400 BFCL, 226/250 GSM8K, 99 % mismo token | apache-2.0 (con enlace a licencia Gemma 4) | GGUF en HF, Ollama, 4,22 GB |
| google/gemma-4-E4B-it-qat-q4_0 (Q4_0) | mismos pesos de origen | no disponible | 360/400 BFCL, 231/250 GSM8K | licencia de Gemma 4 | checkpoint original de Google, 5,15 GB en Q4_0 |
| Unsloth UD-Q4_K_XL + proyector Unsloth | misma familia E4B | no disponible | 8/20 en preguntas de gráficos | según el publicador (no disponible en la información) | GGUF alternativo |
| turintech/gemma-4-E2B-it-Artemis-GGUF | variante E2B | no disponible | 95,8 % mismo siguiente token; 3 de 16 fallos en matemáticas | apache-2.0 según el repositorio | GGUF de 2,3 GB y 2,1 GB |

## Limitaciones y advertencias

- La licencia declarada en los metadatos es Apache 2.0, pero `license_link` remite a la licencia de Gemma 4 de Google; conviene verificar los términos aplicables antes de un uso comercial.
- Es una conversión independiente de TurinTech: no está afiliada ni respaldada por Google, según declara el propio autor.
- El modo thinking está activado por defecto en la plantilla embebida; sin ajustar `max_tokens` (el autor sugiere ~1.500) las respuestas pueden quedar truncadas.
- El drafter MTP altera la salida greedy: en las pruebas del autor coincidieron las 10 respuestas de tool calling, pero solo 1 de 20 respuestas de chat y código. No es apto si se requiere reproducibilidad exacta token a token.
- La comprensión de imágenes es limitada: 9 de 20 aciertos en preguntas sobre gráficos, insuficiente para extracción desatendida.
- La entrada de audio no ha sido probada, aunque el proyector incluya el encoder correspondiente.
- El contexto máximo del modelo no está documentado; los ejemplos se limitan a 8.192 tokens, por lo que no se debe asumir una ventana mayor en producción.
- No hay información sobre sesgos, composición del dataset de entrenamiento ni tasas de alucinación medidas; al ser un modelo de ~7,5B parámetros, el riesgo de alucinación en dominios factuales sigue siendo relevante.
- No se detalla la cobertura de idiomas; no se debe asumir calidad multilingüe sin evaluarla.
- Los benchmarks son declarados por el autor, no verificados de forma independiente, y proceden de muestras pequeñas (400 ítems BFCL, 250 GSM8K, 20 preguntas de imagen).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/turintech/gemma-4-E4B-it-Artemis-GGUF
- Página del modelo en Ollama: https://ollama.com/turintech/gemma-4-e4b-it-artemis
- Etiqueta Q4_0 en Ollama: https://ollama.com/turintech/gemma-4-e4b-it-artemis:4.2gb
- Modelos Artemis de TurinTech: https://www.turintech.ai/models
- Blog de TurinTech sobre la compresión de E4B y E2B: https://www.turintech.ai/blog/gemma-4-e4b-and-e2b-compressed-with-artemis
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-unquantized
- Drafter assistant de Google: https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-unquantized-assistant
- Variante E2B de TurinTech: https://huggingface.co/turintech/gemma-4-E2B-it-Artemis-GGUF
- Hilo de feedback del autor: https://huggingface.co/spaces/turintech/README/discussions/1
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Web de TurinTech: https://turintech.ai
