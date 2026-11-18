# unigilby/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-oQ4e-bf16embed-HIP

## Resumen

Este repositorio contiene una cuantización mixta de precisión (oQ4e) del modelo NVIDIA Nemotron 3.5 Lightning 30B-A3B, publicada por el usuario unigilby. No se trata de un modelo original, sino de una conversión del checkpoint BF16 oficial de NVIDIA a un formato optimizado para el motor HIP de TensorFold, con la tabla de embeddings de tokens preservada sin cuantizar en BF16. El modelo base es un transformer híbrido de tipo nemotron_h que combina capas de atención con capas Mamba y capas MoE, con 31.577.940.288 parámetros totales según los safetensors del repositorio.

La relevancia de esta ficha es doble: por un lado, documenta las características del modelo Nemotron 3.5 Lightning 30B-A3B en su variante cuantizada; por otro, advierte de que se trata de un artefacto de nicho con dependencias de software muy específicas (TensorFold con soporte para checkpoints HIP oQ de ancho mixto) y con cero descargas y cero likes en el momento de la consulta. El tamaño del repositorio es de 19,7 GB y la licencia declarada es openmdw-1.1, la NVIDIA OpenMDW License Agreement v1.1.

La información disponible en la model card es fundamentalmente de empaquetado y procedencia: describe qué tensores se cuantizan, con qué anchos de bit y qué ficheros se conservan del repositorio antecesor. No se proporcionan datos sobre el entrenamiento del modelo base, benchmarks, idiomas soportados ni casos de uso, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido nemotron_h (atención + Mamba + MoE) |
| Parametros totales | 31.577.940.288 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4e mixta: 4, 5, 6 y 8 bits; group size 64, modo affine; embeddings en BF16 |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 (NVIDIA OpenMDW License Agreement v1.1) |
| Formato de pesos | safetensors (4 shards + mtp-4bit.safetensors), layout HIP para TensorFold |

## Arquitectura y entrenamiento

El modelo base, nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 (revisión a9904d24bcc1d289a1950fa9d2b978c47cf903b9), es un transformer híbrido de la familia nemotron_h. Según la descripción del empaquetado, consta de 52 capas que combinan bloques de atención, bloques Mamba y bloques MoE. En concreto, se mencionan 23 capas MoE con expertos enrutados (fc1, fc2) y expertos compartidos (up_proj, down_proj), 23 capas Mamba con proyecciones in_proj y out_proj, y 6 capas de atención con q/k/v/o_proj. La tabla de embeddings tiene forma [131072, 2688], lo que implica un vocabulario de 131.072 tokens y una dimensión oculta de 2.688.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni innovaciones de decodificación. Lo único documentado es el esquema de cuantización: los expertos enrutados se cuantizan a 4 bits, los expertos compartidos a 8 bits, las proyecciones Mamba a 6 y 8 bits, las proyecciones de atención a 5, 6 y 8 bits, el lm_head a 6 bits, y los routers, normas y escalares Mamba (A_log, D, conv1d, dt_bias) se mantienen en BF16. Esta variante concreta sustituye los embeddings cuantizados a 8 bits del repositorio antecesor por el tensor BF16 original, y conserva una cabeza draft MTP de 4 bits (mtp-4bit.safetensors) para decodificación especulativa.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation y las tags incluyen conversational.
- Razonamiento multi-paso y decodificación especulativa: el repositorio incluye una cabeza MTP (multi-token prediction) de 4 bits, lo que sugiere soporte de decodificación especulativa en el motor de inferencia.
- Mezcla de expertos: 23 capas MoE con expertos enrutados y compartidos, lo que permite activar solo una fracción de los parámetros por token (el número exacto de parámetros activos no está disponible).
- Procesamiento de secuencias largas: la combinación de capas Mamba y de atención está diseñada para modelar dependencias de largo alcance, aunque la longitud de contexto concreta no está disponible.
- Tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible; el pipeline es exclusivamente de texto.
- Capacidades multilingües: no disponible; no se declaran idiomas en la model card.

## Casos de uso

- Despliegue en hardware Apple Silicon mediante MLX: el repositorio declara library_name mlx y pesos en formato safetensors compatibles con MLX, por lo que el caso natural es la inferencia local en equipos con chip M-series usando el stack MLX, siempre que se admita el layout oQ mixto.
- Investigación sobre cuantización mixta: el modelo es un artefacto útil para estudiar el impacto de anchos de bit variables (4, 5, 6 y 8 bits) por tipo de capa en un transformer híbrido con Mamba y MoE, comparando la perplejidad frente al checkpoint BF16 original.
- Evaluación de decodificación especulativa con MTP: la cabeza draft mtp-4bit.safetensors permite experimentar con decodificación especulativa en el motor TensorFold y medir la aceleración frente a decodificación autoregresiva estándar.
- Pruebas de integración del motor TensorFold: dado que el modelo requiere soporte específico para checkpoints HIP oQ de ancho mixto y admisión de embeddings BF16 sin cuantizar (referencias #3163, #3242, #3251, #3575 del repositorio ashhart/TensorFold), sirve como caso de prueba de regresión para ese motor.
- Generación de texto conversacional en entornos con restricciones de memoria: con 19,7 GB de pesos, el modelo puede caber en equipos con 24-32 GB de memoria unificada, lo que lo hace adecuado para asistentes conversacionales locales sin GPU dedicada de gran capacidad.
- Reproducción de experimentos de cuantización: al documentarse con precisión la procedencia (reemplazo de backbone.embeddings por el tensor BF16 extraído de la revisión a9904d2), el repositorio permite reproducir y auditar el proceso de cuantización paso a paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 19,7 GB de pesos en disco; en memoria, el modelo completo en este formato ronda los 19 GB, más overhead de activaciones y caché KV.
- GPU recomendadas: no se especifican en la model card. El layout está pensado para el motor HIP de TensorFold, lo que sugiere GPUs AMD (ROCm/HIP) como objetivo principal; también podría ejecutarse en GPUs NVIDIA mediante el mismo motor si este soporta el backend.
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB o más (RTX 3090, RTX 4090) si el motor soporta el formato; también en equipos Apple Silicon con 24-32 GB de memoria unificada mediante MLX.
- Opciones de despliegue: TensorFold con soporte de checkpoints HIP oQ de ancho mixto y admisión de embeddings BF16 (versiones que incluyan los PRs #3163, #3242, #3251 y #3575 de ashhart/TensorFold). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (oQ4e BF16-embed HIP) | 31.577.940.288 | no disponible | oQ4e mixta (4-8 bits) + embeddings BF16 | openmdw-1.1 | Hugging Face, 0 descargas |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 | no disponible en esta ficha | no disponible | BF16 sin cuantizar | openmdw-1.1 | Hugging Face (modelo base oficial) |
| unigilby/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-oQ4e-HIP | no disponible en esta ficha | no disponible | oQ4e mixta, embeddings a 8 bits | openmdw-1.1 | Hugging Face (repositorio antecesor) |

No se dispone de datos de benchmarks ni de otros modelos de la misma categoría con los que comparar rendimiento, contexto o latencia.

## Limitaciones y advertencias

- Modelo derivado, no original: es una cuantización de un checkpoint de NVIDIA; cualquier limitación del modelo base se hereda y puede amplificarse por la pérdida de precisión.
- Dependencia de software muy específica: requiere TensorFold con soporte para checkpoints HIP oQ de ancho mixto y admisión de embeddings BF16; sin esas versiones, el checkpoint no cargará correctamente.
- Sin validación de comunidad: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de evidencia empírica sobre su calidad o estabilidad en producción.
- Riesgo de alucinación: no cuantificado en la información disponible; es un riesgo inherente a los modelos de lenguaje y no se han publicado evaluaciones específicas.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no declarados; no se puede garantizar un rendimiento adecuado en castellano u otros idiomas distintos del inglés sin evaluación previa.
- Licencia: OpenMDW 1.1 permite uso comercial bajo los términos de NVIDIA OpenMDW License Agreement v1.1, pero es responsabilidad del usuario revisar las condiciones exactas del fichero LICENSE, incluidos posibles requisitos de atribución o restricciones de uso.
- Longitud de contexto no disponible: impide planificar despliegues que dependan de ventanas largas.
- Formato de pesos no estándar: el layout HIP y la cuantización mixta por módulo complican la portabilidad a otros motores de inferencia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/unigilby/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-oQ4e-bf16embed-HIP
- Modelo base oficial: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Repositorio antecesor de cuantización: https://huggingface.co/unigilby/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-oQ4e-HIP
- Motor TensorFold: https://github.com/ashhart/TensorFold (referencias de PRs #3163, #3242, #3251, #3575 citadas en la model card)
