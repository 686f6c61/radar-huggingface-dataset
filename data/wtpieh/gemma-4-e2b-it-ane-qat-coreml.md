# WTPieh/gemma-4-E2B-it-ane-qat-coreml

## Resumen

Gemma 4 E2B-it ANE QAT CoreML es una conversión del modelo google/gemma-4-E2B-it de Google a formato Core ML, optimizada específicamente para ejecutarse en la Apple Neural Engine (ANE) de iPhone y Mac. El autor, WTPieh, ha aplicado quantization-aware training (QAT) con falsa paletización de 4 bits para que los pesos cuantizados se ajusten exactamente al layout que Core ML ejecuta en hardware, reduciendo la brecha de calidad respecto al modelo sin cuantizar. No es una release oficial de Google.

El modelo base es un transformer de la familia Gemma 4 con aproximadamente 2.280 millones de parámetros paletizados en 277 tensores. La build está pensada para el runtime CoreML-LLM (testeada en el commit e45a7a6) e incluye tres paquetes multifunción `.mlmodelc` que combinan los programas de decode y prefill, archivos laterales de embeddings en int8, tablas RoPE y el tokenizer con plantilla de chat. El contexto es de 2.048 tokens con ventana deslizante de 512 y prefill en bloques de 1.024 tokens.

La relevancia de esta ficha radica en que demuestra un flujo completo de QAT para paletización 4-bit sobre ANE, con métricas de acuerdo top-1 frente al GGUF QAT oficial de Google y datos de rendimiento reales en iPhone 17 Pro Max y Mac con chip M5 Max. El bundle ocupa 3,7 GB en disco con pesos Core ML de 1,14 GB, lo que lo hace viable en dispositivos de gama alta con memoria unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4), atención completa con ventana deslizante de 512 |
| Parametros totales | 2.280 millones (277 tensores paletizados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (prefill en bloques de 1.024, ventana deslizante 512) |
| Tipos de cuantizacion | Paletización 4-bit con LUT fp16 de 16 entradas por grupo de 32 filas de salida; embeddings de entrada y por capa en int8 con escalas por fila |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | Core ML (`.mlmodelc` multifunción), safetensors para la paleta entrenada (`palette/pal-00948.safetensors`), int8 side files para embeddings |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Gemma 4 con atención completa y ventana deslizante de 512 tokens. La build Core ML divide el modelo en tres paquetes (`chunk1`, `chunk2_3way`, `chunk3_3way`), cada uno con su programa de decode y las funciones de prefill para las mismas capas, compartiendo pesos entre ambos modos. La paletización 4-bit se aplica a todas las lineales del decoder (q/k/v/o, gate/up/down, gate y proyección por capa), a `per_layer_model_projection` y a la LM head, que está desacoplada y es una copia paletizada del embedding. Cada tensor paletizado se representa como `<name>.lut` (fp16, `[out/32, 16]`) más `<name>.idx` (uint8, `[out, in]`), de modo que `W[r, c] = lut[r // 32, idx[r, c]]`. El resto de tensores (norms, embeddings de entrada y por capa) se mantienen sin cambios respecto al checkpoint base, salvo los embeddings int8 con escalas por fila.

El entrenamiento consistió en QAT con falsa paletización straight-through: en cada paso cada peso se ajusta a su entrada LUT más cercana y la pasada forward usa `W_q = LUT[group, idx]` con la LUT redondeada a fp16, fluyendo gradientes tanto a los pesos latentes como a las entradas LUT, inicializadas por k-means por grupo. El profesor fue `google/gemma-4-E2B-it-qat-q4_0-unquantized` en bf16 ejecutado en vivo en el mismo proceso, con pérdida KL(profesor ‖ estudiante) sobre todo el vocabulario más 0,2 × entropía cruzada y soft-cap de logits de 30 en ambos. Se usó AdamW (β 0,9/0,95, sin weight decay), lr 2e-5 para pesos y 1e-5 para LUTs, 30 pasos de warm-up, schedule coseno, 64k tokens por paso, bf16 con gradient checkpointing, 948 pasos (unos 60 M tokens, 2,7 épocas) en 4,6 h sobre una RTX PRO 6000. El checkpoint final es el de menor KL de validación (0,800 → 0,112 nats/token), sin usar el conjunto de held-out para seleccionarlo.

Los datos de entrenamiento suman 20.184 secuencias y 22,2 M tokens: 7.923 peticiones de recapitulación sobre pasajes de 300–650 palabras de 36 novelas de dominio público de Project Gutenberg (excluyendo *Alice* y *Looking-Glass*), 1.375 chats cortos multi-turno de asistente para una app de lectura, y 10.886 fragmentos de FineWeb-Edu de 1–2K tokens. La exportación se hizo con el conversor Gemma 4 de CoreML-LLM en e45a7a6 inyectando los `W_q` entrenados, verificando que cada peso paletizado se descomprime bit a bit a los valores entrenados, y fusionando los programas de decode y prefill con `coremltools.utils.save_multifunction`.

## Capacidades

- Generación de texto en modo decoder-only con contexto de 2.048 tokens y prefill en bloques de 1.024.
- Razonamiento y recapitulación de pasajes largos: el entrenamiento incluye 7.923 peticiones de recap sobre pasajes de 300–650 palabras.
- Conversación multi-turno: el dataset incluye 1.375 chats cortos de asistente para una app de lectura.
- Ejecución en Apple Neural Engine (ANE) en iPhone y Mac, con decode a 35,2 tok/s en M5 Max y 35,0 tok/s iniciales en iPhone 17 Pro Max.
- Soporte de plantilla de chat incluida en `coreml/` (tokenizer y chat template en `hf_model/`).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada; la build es text-only.

## Casos de uso

- Recapitulación de textos largos en apps de lectura: el modelo fue entrenado específicamente con pasajes de 300–650 palabras de novelas de dominio público para generar recaps, y el contexto de 2.048 tokens permite procesar el pasaje completo más la instrucción en una sola pasada.
- Asistente conversacional multi-turno en iOS: con chats cortos de asistente en el dataset de entrenamiento y decode a 31,4 tok/s sostenidos durante 10 minutos en iPhone 17 Pro Max, es adecuado para diálogos de lectura o acompañamiento en apps nativas.
- Generación de texto en local sin conexión: el bundle de 3,7 GB en disco y 3,6 GB de huella de proceso con el modelo cargado permiten ejecutarlo íntegramente en el dispositivo, sin llamadas a servidor.
- Procesamiento de documentos educativos: los 10.886 fragmentos de FineWeb-Edu de 1–2K tokens en el entrenamiento lo orientan a tareas de comprensión y resumen de material didáctico dentro del límite de 2.048 tokens.
- Prototipado de inferencia en ANE: sirve como referencia para validar flujos de QAT con paletización 4-bit y exportación a Core ML con paquetes multifunción, incluyendo el parche de RoPE y el script `fix_rope.py` incluidos en el repo.
- Integración en pipelines de CI para apps Apple: el runtime CoreML-LLM con el parche `coreml-llm-multifunction.patch` permite cargar los programas de prefill como funciones de los paquetes de decode, facilitando pruebas automatizadas de generación en simuladores y dispositivos.
- Despliegue en Mac con Apple Silicon: con decode a 35,2 tok/s en M5 Max y pesos Core ML de 1,14 GB (2,29 GB como programas separados), es viable para herramientas de escritorio que requieran generación local de texto.

## Benchmarks y rendimiento

La métrica es el acuerdo top-1 forzado por profesor con el GGUF QAT Q4_0 de Google (`gemma-4-E2B-it-qat-q4_0`) sobre 20 prompts de recapitulación held-out (pasajes de *Alice's Adventures in Wonderland*, unos 700 tokens de prompt cada uno, 129 tokens de respuesta puntuados por prompt). Se reporta el acuerdo top-1 medio y la perplejidad de la respuesta del GGUF (mediana). "Loops" cuenta respuestas libres de 256 tokens en las que un n-grama de 8 tokens se repite al menos 3 veces.

**Mac (M5 Max), runtime CoreML-LLM:**

| Bundle | Compute | Top-1 | PPL | Loops (de 20) | Decode |
|---|---|---|---|---|---|
| GGUF (llama.cpp) | CPU | 1 | 1,43 | 0 | — |
| fp16 sin cuantizar, tablas RoPE estándar | GPU | 0,646 | 3,13 | — | — |
| fp16 sin cuantizar, RoPE corregido | GPU | 0,919 | 1,467 | — | — |
| Profesor bf16 en PyTorch (referencia) | — | 0,918 | 1,466 | — | — |
| Paleta 4-bit k-means (sin QAT), RoPE corregido | ANE | 0,667 | 2,955 | 0 | 33,8 tok/s |
| Paleta 4-bit k-means (sin QAT), RoPE estándar | ANE | 0,469 | 11,38 | 11 | 33,5 tok/s |
| **Este modelo** (QAT, RoPE corregido, multifunción) | ANE | **0,857** | **1,680** | **0** | 35,2 tok/s |

**iPhone 17 Pro Max (iOS 27.0.1), Neural Engine:**

| Métrica | Valor |
|---|---|
| Top-1 (mismos 20 prompts) | 0,857 |
| PPL | 1,68 |
| Decode inicial | 35,0 tok/s |
| Decode sostenido (10 min generación continua) | 31,4 tok/s (90 % retenido) |
| Huella de proceso con modelo cargado | 3,6 GB |
| Tiempo de carga | 81 s la primera vez (compilación ANE en dispositivo), 5,5 s posteriores |
| Estado térmico | "fair" a los 62 s, "serious" a los 218 s |

Advertencia del autor: el teléfono estaba cargando (75–80 %) durante estas ejecuciones, lo que añade calor y hace pesimistas los tiempos térmicos; las cifras de tok/s pueden diferir en batería.

## Requisitos de hardware

- VRAM/memoria: pesos Core ML de 1,14 GB (2,29 GB como programas separados); bundle de 3,7 GB en disco; huella de proceso de 3,6 GB con el modelo cargado en iPhone 17 Pro Max.
- GPU recomendadas: no aplica GPU dedicada; el modelo está optimizado para Apple Neural Engine en iPhone y Mac con Apple Silicon (probado en M5 Max y iPhone 17 Pro Max).
- Cabe en consumer GPU: no es el objetivo del modelo; está diseñado para ANE, no para GPUs NVIDIA o AMD.
- Opciones de despliegue: runtime CoreML-LLM (commit e45a7a6) con el parche `coreml-llm-multifunction.patch`; paquetes multifunción generados con `coremltools.utils.save_multifunction`; target de despliegue iOS 18 / macOS 15 en fp16.
- Latencia y throughput: decode de 35,2 tok/s en M5 Max (ANE) y 35,0 tok/s iniciales / 31,4 tok/s sostenidos en iPhone 17 Pro Max; carga de 81 s la primera vez y 5,5 s posteriores en iPhone.
- Almacenamiento: 3,7 GB en disco para el bundle completo; 6,2 GB de tamaño del repo en HuggingFace.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Este modelo** (Gemma 4 E2B-it ANE QAT CoreML) | 2,28 B (277 tensores paletizados) | 2.048 tokens | Core ML 4-bit paletizado, ANE | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| google/gemma-4-E2B-it (base) | No disponible | No disponible | Safetensors / PyTorch | Licencia Gemma 4 | HuggingFace (modelo base referenciado) |
| google/gemma-4-E2B-it-qat-q4_0 (GGUF QAT) | No disponible | No disponible | GGUF Q4_0, llama.cpp | Licencia Gemma 4 | HuggingFace (referenciado como profesor y baseline) |
| google/gemma-4-E2B-it-qat-q4_0-unquantized | No disponible | No disponible | bf16, PyTorch | Licencia Gemma 4 | HuggingFace (usado como profesor en bf16) |

No se dispone de datos de benchmarks de los modelos base y GGUF más allá de las métricas de acuerdo top-1 y PPL reportadas en la tabla de rendimiento, donde el GGUF QAT Q4_0 se usa como referencia (top-1 1, PPL 1,43) y el profesor bf16 en PyTorch alcanza top-1 0,918 y PPL 1,466. No se han publicado comparativas con otros modelos de la misma categoría en la información disponible.

## Limitaciones y advertencias

- No es una release oficial de Google: es una versión modificada de Gemma 4 E2B-it por WTPieh, sujeta a la licencia Gemma 4 de Google además de Apache 2.0.
- Contexto limitado a 2.048 tokens con ventana deslizante de 512, insuficiente para documentos largos o conversaciones extensas.
- Modelo text-only: no soporta visión, audio ni otras modalidades.
- Idiomas soportados no especificados; el entrenamiento se centró en inglés (novelas de Project Gutenberg y FineWeb-Edu), por lo que el rendimiento en castellano no está validado.
- Riesgo de alucinación y de bucles: aunque el modelo reporta 0 bucles en 20 respuestas libres de 256 tokens, la métrica es limitada y no garantiza ausencia de repeticiones en otros dominios.
- Dependencia de un runtime concreto: requiere CoreML-LLM en e45a7a6 más un parche específico (`coreml-llm-multifunction.patch`); no funciona con llama.cpp, vLLM, TGI ni Ollama.
- El parche de RoPE (`fix_rope.py`) ya está aplicado en este bundle, pero es necesario para bundles Gemma 4 de CoreML-LLM sin corregir; sin él, el top-1 cae de 0,919 a 0,646 en fp16 y de 0,667 a 0,469 en 4-bit sin QAT.
- Rendimiento térmico en iPhone: el estado térmico alcanza "serious" a los 218 s de generación continua, con posible throttling en sesiones largas.
- Las mediciones en iPhone se hicieron con el dispositivo cargando (75–80 %), lo que puede sobreestimar el consumo térmico y alterar las cifras de tok/s en batería.
- Tiempo de carga inicial de 81 s en dispositivo por compilación ANE, aunque las cargas posteriores bajan a 5,5 s.
- Sin descargas ni likes en HuggingFace en el momento de la ficha, lo que limita la validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/WTPieh/gemma-4-E2B-it-ane-qat-coreml
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Runtime CoreML-LLM: https://github.com/john-rocky/CoreML-LLM
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Licencia Apache 2.0: incluida en el repo como `LICENSE`
