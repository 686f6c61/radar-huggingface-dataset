# thxplz/HOI-R1_Qwen3.5-4B-SFT

## Resumen

HOI-R1_Qwen3.5-4B-SFT es un ajuste fino supervisado (SFT) del modelo multimodal Qwen/Qwen3.5-4B, desarrollado por el usuario thxplz, especializado en detección de interacciones persona-objeto (Human-Object Interaction, HOI). El modelo parte de un transformer multimodal de 4.539.265.536 parámetros (aproximadamente 4,54 mil millones) y se ha entrenado con ajuste fino de todos los parámetros mediante ms-swift sobre el dataset HICO-DET adaptado a formato conversacional para Qwen.

El problema que aborda es la detección de HOI: identificar qué acción realiza una persona sobre un objeto en una imagen (por ejemplo, "montar bicicleta", "beber de una taza"). Los modelos tradicionales de HOI obtienen resultados limitados y los modelos multimodales en zero-shot rinden muy por debajo de lo deseable; este checkpoint demuestra que un SFT sobre un MLLM de 4B puede superar a métodos especializados previos en el benchmark HICO-DET.

Es relevante porque forma parte de la línea HOI-R1, que explora el uso de modelos multimodales grandes para HOI, y porque el checkpoint SFT por sí solo alcanza 29,36 mAP en la configuración Default Full de HICO-DET, superando a Rex-Omni-3B (HOI-SFT) y a Qwen3-VL-4B-SFT. La licencia Apache 2.0 facilita su reutilización comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basado en Qwen3.5-4B |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones posteriores no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de todos los parámetros de Qwen/Qwen3.5-4B, un transformer multimodal que procesa entradas de imagen y texto y genera texto. El entrenamiento se realizó con ms-swift en modo SFT de parámetros completos, partiendo del checkpoint base y entrenando durante 1 epoch sobre los datos SFT de HICO-DET para Qwen3. El checkpoint final subido corresponde al paso 1164, con una pérdida final de entrenamiento de 0,3283.

No se configuró un conjunto de validación en esta ejecución, por lo que no se reporta precisión de validación ni mAP de validación. Los archivos publicados son los shards de inferencia junto con configuración, tokenizer y processor; no se incluyen estados de optimizador de DeepSpeed ni archivos de reanudación de entrenamiento. La innovación principal no está en la arquitectura sino en la formulación del problema HOI como una tarea conversacional image-text-to-text, lo que permite aprovechar las capacidades de razonamiento visual de un MLLM.

## Capacidades

- Detección de interacciones persona-objeto (HOI) en imágenes, incluyendo categorías frecuentes y raras de HICO-DET.
- Generación de texto conversacional a partir de imagen y texto (pipeline image-text-to-text).
- Razonamiento visual sobre la escena para identificar sujeto, objeto y acción.
- Capacidades heredadas del modelo base Qwen3.5-4B (generación de texto, comprensión de imágenes), aunque no se documentan explícitamente en la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, audio): no disponible.

## Casos de uso

- Anotación automática de datasets de HOI: el modelo puede pre-etiquetar interacciones persona-objeto en imágenes de vigilancia o repositorios visuales, reduciendo el coste de anotación manual antes de una revisión humana.
- Análisis de vídeo o imágenes de seguridad: detección de acciones como "coger", "empujar" o "montar" para generar alertas en entornos controlados, aprovechando su mAP de 29,36 en HICO-DET Default Full.
- Indexación semántica de imágenes en buscadores: enriquecer metadatos con relaciones persona-objeto-acción para mejorar la búsqueda por lenguaje natural en catálogos visuales.
- Robótica asistencial y domótica: interpretar la interacción de una persona con objetos del hogar para que un sistema de asistencia comprenda el contexto de la escena.
- Investigación en visión por computador: servir como baseline SFT reproducible para comparar con métodos tradicionales de HOID y con la variante SFT + GRPO de la misma familia.
- Evaluación de modelos multimodales: utilizar el checkpoint como referencia para medir la capacidad de un MLLM de 4B en tareas estructuradas de detección de relaciones, dado su tamaño manejable.
- Prototipado en entornos con recursos limitados: al ser un modelo de ~4,5B parámetros, puede desplegarse en una sola GPU para pruebas de concepto de detección HOI sin infraestructura de gran escala.

## Benchmarks y rendimiento

Resultados en HICO-DET (mAP) del checkpoint SFT de este repositorio, comparados con métodos representativos de la tabla publicada por el autor:

| Metodo | Entrenamiento | Default Full | Default Rare | Default Non-Rare | Known Object Full | Known Object Rare | Known Object Non-Rare |
|---|---|---:|---:|---:|---:|---:|---:|
| HO-RCNN | 150k steps | 7,81 | 5,37 | 8,54 | 10,41 | 8,94 | 10,85 |
| HOITrans | 150 epochs | 26,61 | 19,15 | 28,84 | 29,13 | 20,98 | 31,57 |
| QPIC | 150 epochs | 29,07 | 21,85 | 31,23 | 31,68 | 24,14 | 33,93 |
| Qwen3.5-4B (zero-shot) | — | 17,17 | 20,82 | 16,08 | 19,60 | 23,16 | 18,53 |
| Qwen3-VL-4B-SFT | 1 epoch | 22,46 | 21,53 | 22,73 | 24,04 | 21,97 | 24,66 |
| Rex-Omni-3B (HOI-SFT) | 1 epoch | 25,30 | 21,24 | 26,51 | 26,97 | 21,79 | 28,51 |
| **Qwen3.5-4B-SFT (este modelo)** | **1 epoch** | **29,36** | **30,47** | **29,03** | **31,22** | **30,92** | **31,31** |
| HOI-R1-Qwen3.5-4B (SFT + GRPO) | 1 epoch + 40 steps | 29,79 | 30,39 | 29,60 | 31,61 | 30,67 | 31,89 |

El checkpoint SFT de este repositorio supera a Qwen3-VL-4B-SFT y a Rex-Omni-3B (HOI-SFT) en todas las métricas mostradas, y queda ligeramente por debajo de la variante SFT + GRPO de la misma familia.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16/BF16, los 4,54B parámetros ocupan aproximadamente 9,1 GB solo en pesos; con overhead de activaciones y caché KV, se recomienda al menos 12-16 GB de VRAM. En cuantización de 8 bits, alrededor de 5-6 GB; en 4 bits, alrededor de 3-4 GB (estimaciones, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para despliegue concurrente; RTX 4090 (24 GB) suficiente para inferencia en BF16.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) en BF16 y en GPUs de 12-16 GB con cuantización.
- Opciones de despliegue: vLLM, TGI, llama.cpp/Ollama (requiere conversión a GGUF, no publicada) y transformers con el processor del modelo base.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HICO-DET Default Full (mAP) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HOI-R1_Qwen3.5-4B-SFT (este) | 4,54B | no disponible | 29,36 | Apache 2.0 | Hugging Face |
| Qwen3-VL-4B-SFT | ~4B | no disponible | 22,46 | no disponible en la información | Referencia en la tabla del autor |
| Rex-Omni-3B (HOI-SFT) | ~3B | no disponible | 25,30 | no disponible en la información | Referencia en la tabla del autor |
| QPIC (método tradicional HOID) | no aplica | no aplica | 29,07 | no disponible en la información | Referencia en la tabla del autor |

## Limitaciones y advertencias

- No se configuró conjunto de validación durante el entrenamiento, por lo que no hay métricas de validación propias del run; los resultados reportados provienen de la evaluación en HICO-DET del autor.
- El modelo está especializado en HOI sobre HICO-DET; su rendimiento fuera de esa taxonomía de acciones y objetos no está documentado.
- Riesgo de alucinación inherente a los MLLM: puede generar interacciones plausibles no presentes en la imagen, especialmente en categorías raras.
- No se documentan sesgos conocidos ni composición del dataset de entrenamiento más allá de HICO-DET; se desconoce el equilibrio demográfico y contextual.
- Idiomas soportados no disponibles; el entrenamiento SFT se realizó sobre datos en el formato de HICO-DET, presumiblemente en inglés.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B puede tener condiciones adicionales que conviene verificar.
- El repositorio no incluye estados de entrenamiento para reanudación ni cuantizaciones GGUF; para despliegue en CPU o GPUs pequeñas habría que convertir los pesos.
- El checkpoint tiene muy pocas descargas (30) y ningún like, por lo que no cuenta con validación comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thxplz/HOI-R1_Qwen3.5-4B-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/thxplz/HOI-R1_HICO-DET_dataset
- Paper HOI-R1: https://arxiv.org/abs/2510.05609
- Repositorio ms-swift (herramienta de entrenamiento): https://github.com/modelscope/ms-swift
