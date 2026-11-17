# Xylolabs/Ornith-1.5-9B-Tenstorrent-Tensix-BFP4-Out8

## Resumen

Ornith-1.5-9B-Tenstorrent-Tensix-BFP4-Out8 es una cuantización del modelo multimodal Ornith-1.5-9B (de ornith-ai) realizada por Xylolabs para su ejecución sobre aceleradores NPU de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo base emplea la arquitectura `qwen3_5`, un transformer híbrido que combina capas Gated DeltaNet con capas de atención clásica, y está orientado a generación de texto e imagen-a-texto conversacional en inglés y coreano. Cuenta con 9.653.104.368 parámetros totales y una torre visual (`model.visual`) más un módulo MTP (multi-token prediction) que permanecen en bf16 sin cuantizar.

El interés de esta variante es que reduce el peso del modelo de lenguaje de 17,91 GB en bf16 a 8,23 GB empaquetado para Tensix (7,35 bits por peso de media), manteniendo una fidelidad frente al original razonablemente alta: KL medio de 0,0545 frente a bf16, frente al 0,0375 del GGUF oficial Q4_K_M de llama.cpp. La cuantización se aplica de forma selectiva: las proyecciones de salida de Gated DeltaNet y de atención van en `bfloat4_b` con redondeo al más cercano, el resto de proyecciones en `bfloat4_b` mediante GPTQ con búsqueda de exponente por bloque, y el LM head, embeddings, normas, torre visual y módulo MTP se mantienen en bf16.

Es relevante ahora porque representa uno de los primeros empaquetados públicos de un modelo de ~9B con arquitectura híbrida lineal-atención para el ecosistema Tenstorrent, un objetivo de despliegue alternativo a GPU que gana tracción en inferencia de bajo consumo. La licencia MIT del modelo base facilita su uso comercial, aunque la herramienta de cuantización y los kernels asociados se publican bajo sus propios términos en repositorios separados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido `qwen3_5` (Gated DeltaNet + atención clásica), multimodal con torre visual y módulo MTP |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`, 4,5 bits/peso) y BFP8 (`bfloat8_b`, 8,5 bits/peso) para Tensix; bf16 para LM head, embeddings, normas, torre visual y MTP |
| Idiomas soportados | en, ko |
| Licencia | MIT |
| Formato de pesos | safetensors (valores cuantizados almacenados como bf16 sobre la rejilla del formato; empaquetado a Tensix con TT-NN) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B emplea la arquitectura `qwen3_5`, que combina en sus 32 capas de decodificador bloques de Gated DeltaNet (un mecanismo de estado lineal recurrente con compuertas) con bloques de atención clásica. Esta mezcla busca reducir el coste computacional y de memoria del contexto largo respecto a un transformer denso puro, manteniendo la calidad de atención completa en las capas donde es necesaria. El modelo incorpora además una torre visual (`model.visual`) para entrada de imágenes y un módulo de predicción multi-token (`mtp`), ambos preservados en bf16 en esta cuantización.

Sobre el entrenamiento del modelo base no se proporciona información en la documentación disponible: no se detallan el número de tokens, la composición del dataset ni si hubo fases de RLHF, DPO o ajuste por preferencias. La innovación técnica documentada de esta variante es el pipeline de cuantización `tensix-bfp-gptq` v0.1.0, que aplica GPTQ con búsqueda de exponente por bloque a las proyecciones `bfloat4_b`, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano, y redondeo al más cercano para las proyecciones de salida en `bfloat8_b`. Las matrices cuantizadas se almacenan como valores bf16 situados sobre la rejilla del formato, de modo que TT-NN las empaqueta sin alterar su valor; la verificación se realizó con `pack_tensix.py` y `verify_grid.py` sobre ttsim con ttnn 0.81.1.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y coreano.
- Comprensión de imágenes y respuesta texto-a-partir-de-imagen (pipeline `image-text-to-text`), gracias a la torre visual preservada en bf16.
- Modo de razonamiento explícito (`enable_thinking`) controlable mediante la plantilla de chat, con posibilidad de desactivarlo para respuestas directas.
- Predicción multi-token (módulo MTP) heredada del modelo base, útil para decodificación especulativa.
- Plantilla de chat compatible con `apply_chat_template` de Transformers.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistente conversacional bilingüe inglés-coreano: el modelo puede mantener diálogos multi-turno en ambos idiomas soportados, con la ventaja de que la cuantización BFP4/BFP8 reduce el espacio en memoria del NPU y permite servir sesiones concurrentes en un solo acelerador Tensix.
- Descripción y análisis de imágenes en el borde: al conservar la torre visual en bf16, puede procesar imágenes y generar descripciones o respuestas en inglés o coreano, adecuado para despliegues en hardware Tenstorrent de bajo consumo donde no hay GPU disponible.
- Procesamiento documental con extracción de información: la combinación de entrada visual y generación de texto permite transcribir o resumir documentos escaneados, con la ventaja de que el modelo completo cabe en 8,23 GB empaquetados para Tensix.
- Razonamiento con modo thinking para tareas de análisis: activando `enable_thinking` en la plantilla de chat, el modelo genera cadenas de razonamiento antes de la respuesta final, útil en tareas de clasificación compleja o respuesta a preguntas que requieren varios pasos.
- Despliegue en infraestructura Tenstorrent Wormhole o Blackhole: el formato BFP4/BFP8 está pensado específicamente para estas NPU, por lo que es una opción para organizaciones que ya operan hardware Tensix y quieren ejecutar un modelo de ~9B sin recurrir a GPU NVIDIA.
- Evaluación comparativa de cuantizaciones: al publicarse junto a las métricas de KL frente a bf16 y frente al GGUF Q4_K_M oficial, sirve como referencia para estudiar el impacto de BFP4 con GPTQ en arquitecturas híbridas lineal-atención.
- Prototipado de asistentes con imágenes en investigación: la licencia MIT y el formato estándar de Transformers permiten cargar el modelo con `AutoModelForImageTextToText` para experimentación académica sobre comprensión visual y generación bilingüe.

## Benchmarks y rendimiento

Los datos disponibles son evaluaciones en host de los pesos (no mediciones en dispositivo) frente al modelo base en bf16 y frente a las cuantizaciones Q4_K_M de llama.cpp.

| Pesos | Formatos por clase de tensor | Bits/peso | Tamano (GB) | KL medio a bf16 | Top-1 (%) | Respuestas correctas | Perdidas | Chequeo de precision |
|---|---|---:|---:|---:|---:|---:|---:|---|
| bf16 (original) | todos bf16 | 16,00 | 17,91 | 0 | 100 | 37/40 | - | - |
| BFP4-Out8 (esta ficha) | salidas de DeltaNet y atencion `bfloat8_b` por redondeo; resto `bfloat4_b` por GPTQ con busqueda de exponente; LM head y embedding bf16 | 7,35 | 8,231 | 0,0545 | 89,36 | 36/40 | 0 | pasado (1,46x KL; 0 perdidas frente a 0) |
| Q4_K_M (llama.cpp) | F32 177, Q4_K 217, Q6_K 33 (sin imatrix) | 5,02 | 5,780 | 0,0726 | 87,44 | 36/40 | 0 | informativo |
| Q4_K_M-imat (llama.cpp, GGUF oficial) | F32 177, Q4_K 217, Q6_K 33 (con imatrix) | 5,02 | 5,780 | 0,0375 | 91,39 | 37/40 | 0 | referencia |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/NPU: el modelo de lenguaje empaquetado para Tensix ocupa 8,23 GB; en bf16 serían 17,91 GB. Los ficheros del repositorio ocupan 19,3 GB porque almacenan los valores cuantizados como bf16.
- Hardware objetivo: NPU Tenstorrent Tensix, arquitecturas Wormhole y Blackhole. No está pensado para GPU convencional, aunque los pesos pueden cargarse en Transformers con `device_map="auto"` en bf16 (los valores cuantizados se leen como bf16, sin la ganancia de memoria del empaquetado Tensix).
- GPU consumer: no aplica como destino principal; la carga en GPU no aprovecha el formato BFP4/BFP8 y requeriría el tamaño bf16 completo, por encima de la VRAM de la mayoría de tarjetas consumer de 24 GB.
- Despliegue: TT-NN con `pack_tensix.py` y `verify_grid.py` del repositorio `tensix-bfp-gptq` v0.1.0, junto con `tensix-kernels` y `tensix-runner` v0.1.0. Para pruebas en host, Transformers con `AutoModelForImageTextToText`.
- Latencia y throughput: no disponibles en la información proporcionada; las cifras publicadas son evaluaciones en host, no mediciones en dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-9B-Tenstorrent-Tensix-BFP4-Out8 (esta ficha) | 9,65 B | no disponible | BFP4/BFP8 para Tensix, 8,23 GB empaquetado | MIT | Hugging Face |
| ornith-ai/Ornith-1.5-9B (base) | 9,65 B | no disponible | bf16, 17,91 GB | MIT | Hugging Face |
| Ornith-1.5-9B GGUF Q4_K_M-imat (llama.cpp) | 9,65 B | no disponible | GGUF Q4_K_M con imatrix, 5,78 GB | MIT | Hugging Face (ornith-ai) |
| Ornith-1.5-9B GGUF Q4_K_M (llama.cpp, sin imatrix) | 9,65 B | no disponible | GGUF Q4_K_M, 5,78 GB | MIT | Hugging Face |

En rendimiento, el GGUF oficial Q4_K_M-imat obtiene mejor KL (0,0375 frente a 0,0545) y más respuestas correctas (37/40 frente a 36/40), pero requiere un backend llama.cpp sobre CPU o GPU, mientras que esta variante está optimizada para NPU Tensix. El Q4_K_M sin imatrix queda peor en KL (0,0726) que la cuantización BFP4-Out8 pese a usar menos bits por peso (5,02 frente a 7,35).

## Limitaciones y advertencias

- Solo se ha cuantizado y evaluado el modelo de lenguaje; la torre visual y el módulo MTP son los del modelo base en bf16 y no han pasado por el proceso de cuantización ni por su evaluación de precisión.
- La evaluación publicada se realizó en host (no en dispositivo) y con un conjunto reducido de 40 preguntas, por lo que las métricas de precisión tienen poca potencia estadística.
- El KL medio frente a bf16 (0,0545) es un 46 % superior al del GGUF oficial Q4_K_M-imat (0,0375), lo que implica una degradación mayor en la distribución de salida.
- Idiomas limitados a inglés y coreano; no hay evidencia de calidad en castellano ni en otros idiomas.
- No se documenta la longitud de contexto soportada, lo que impide planificar despliegues con ventanas largas sin verificación empírica.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones de sesgo, toxicidad o robustez para este modelo.
- La licencia MIT del modelo base permite uso comercial, pero las herramientas de cuantización, kernels y runner (`tensix-bfp-gptq`, `tensix-kernels`, `tensix-runner`) se distribuyen en repositorios separados con sus propios términos, que deben revisarse antes de un despliegue en producción.
- El formato BFP4/BFP8 es específico de Tensix; fuera de ese hardware no se obtiene la reducción de memoria y el modelo se carga en bf16 con el coste completo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente de los resultados declarados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Ornith-1.5-9B-Tenstorrent-Tensix-BFP4-Out8
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Repositorio de cuantización (tensix-bfp-gptq v0.1.0): https://github.com/XylolabsInc/tensix-bfp-gptq/tree/v0.1.0
- Release de tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Kernels para Tensix (tensix-kernels v0.1.0): https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Runner para Tensix (tensix-runner v0.1.0): https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia del modelo: https://huggingface.co/Xylolabs/Ornith-1.5-9B-Tenstorrent-Tensix-BFP4-Out8/blob/main/LICENSE
