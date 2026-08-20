# StargazerLabs/Qwen3.8-23B-Mini-Me-bf16

## Resumen

Qwen3.8-23B-Mini-Me-bf16 es un modelo de lenguaje multimodal desarrollado por StargazerLabs como una versión podada del modelo Qwen/Qwen3.8-27B de la serie Qwen3.8. El modelo elimina 12 capas del transformer original (pasando de 64 a 52 capas), manteniendo intacta la torre de visión, lo que lo convierte en una alternativa más ligera y rápida para tareas de codificación, agentes y conversaciones multi-turno con contexto largo. Su licencia Apache 2.0 permite uso comercial sin restricciones.

La relevancia de este modelo radica en la técnica de poda por capas (layer pruning) aplicada sobre un modelo de 27 mil millones de parámetros, reduciendo el tamaño a aproximadamente 22,79 mil millones de parámetros sin modificar la arquitectura base. Según su autor, el modelo se comporta de forma muy similar al padre en la mayoría de tareas, aunque ligeramente inferior en rendimiento general, y está pensado para entornos donde se prioriza la velocidad y el menor consumo de recursos frente a la precisión absoluta. El repositorio no publica benchmarks estándar, por lo que la evaluación se basa en pruebas internas del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.8-27B podado, 52 capas, torre de visión intacta) |
| Parametros totales | 22.790.504.208 (aprox. 22,79 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el autor indica que mantiene instrucciones más allá del contexto nominal) |
| Tipos de cuantizacion | bf16 (repositorio original); cuantizaciones adicionales no publicadas |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, MLX |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B y aplica una poda de 12 capas del transformer, seleccionadas mediante "lesion probing" sobre combinaciones de profundidad. Las capas eliminadas son las 12-15, 24-27 y 36-39, elegidas como la combinación más favorable según pruebas internas del autor. La torre de visión (vision tower) se mantiene intacta, por lo que el modelo conserva las capacidades multimodales del original. No se han publicado detalles sobre el dataset de entrenamiento ni sobre el proceso de ajuste (si hubo RLHF, DPO o fine-tuning adicional). El modelo se distribuye en formato MLX, optimizado para Apple Silicon, y en safetensors para otros frameworks.

## Capacidades

- Generación de texto y razonamiento general, con un rendimiento ligeramente inferior al modelo padre (Qwen3.8-27B).
- Procesamiento de imágenes y texto (pipeline image-text-to-text), gracias a la torre de visión intacta.
- Soporte para tool calling y function calling, según el autor.
- Trabajo agéntico y conversaciones multi-turno largas, manteniendo la instrucción más allá del contexto nominal.
- Capacidad para tareas de codificación, aunque con menor precisión que el modelo original.
- No se especifican modos de pensamiento (thinking mode) ni soporte de audio.

## Casos de uso

- Asistente de programación en producción: puede integrarse en entornos de desarrollo para completar código, explicar fragmentos o revisar cambios, gracias a su soporte de tool calling y su menor latencia frente al modelo padre.
- Agentes autónomos de automatización: su capacidad para mantener instrucciones en conversaciones largas y gestionar herramientas lo hace adecuado para agentes que interactúan con APIs o ejecutan flujos multi-paso.
- Atención al cliente multimodal: al conservar la visión, puede procesar capturas de pantalla o imágenes de productos junto con el texto para resolver incidencias de soporte.
- Análisis de documentos con imágenes: útil para extraer información de documentos escaneados o diagramas técnicos en entornos con recursos limitados.
- Despliegue en hardware de gama media: al ser más pequeño que el 27B, permite ejecutar inferencia en GPUs de consumo o en servidores con una sola GPU de 24 GB con cuantización, reduciendo costes en producción.
- Prototipado rápido de aplicaciones multimodales: su licencia Apache 2.0 y su formato MLX facilitan la experimentación en entornos Apple Silicon sin necesidad de infraestructura pesada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que el modelo ha sido evaluado mediante pruebas internas ("personal probes") y que no existen métricas estándar reportadas. No se pueden comparar números con otros modelos de forma fiable.

## Requisitos de hardware

- VRAM estimada para inferencia: el tamaño del repositorio en bf16 es de 45,6 GB, por lo que se necesitan al menos 48 GB de VRAM para cargar el modelo sin cuantización. Con cuantización de 8 bits se estima alrededor de 23 GB, y de 4 bits alrededor de 12 GB, aunque no se han publicado pesos cuantizados.
- GPU recomendadas: para bf16 completo, GPU de 48 GB como A6000, A40 o H100. Para cuantización de 8 bits, una RTX 4090 (24 GB) sería suficiente; para 4 bits, una RTX 3090 o RTX 4080.
- El modelo está optimizado para MLX, por lo que es desplegable en Apple Silicon (M1 Pro o superior) con memoria unificada de al menos 32 GB para bf16.
- Opciones de despliegue: vLLM, TGI, llama.cpp (si se convierte a GGUF), y MLX (para Apple Silicon). También se puede usar con transformers y safetensors.
- Latencia y throughput: no disponibles; se espera que sea aproximadamente un 15-20 % más rápido que el modelo 27B por la reducción de capas, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-23B-Mini-Me (este) | 22,79B | no disponible | inferior al padre, sin benchmarks | Apache 2.0 | safetensors, MLX |
| Qwen3.8-27B (padre) | 27B | no disponible | superior, modelo base | Apache 2.0 | safetensors |
| Qwen3-8B (serie Qwen3) | 8B | no disponible | no comparable | Apache 2.0 | safetensors, GGUF |

No hay datos de benchmarks para comparar directamente. El modelo se posiciona como una alternativa intermedia entre el 27B y los modelos de 8B, priorizando velocidad sobre precisión.

## Limitaciones y advertencias

- El modelo no tiene benchmarks estándar publicados; su evaluación se basa en pruebas personales del autor, lo que limita la confianza en su rendimiento.
- Es una versión podada, por lo que es "un poco menos inteligente" que Qwen3.8-27B en la mayoría de tareas, según el autor.
- La longitud de contexto no está documentada; el autor indica que mantiene la instrucción más allá del contexto nominal, pero no hay datos verificados.
- No se especifican sesgos conocidos, pero al derivarse de Qwen3.8-27B puede heredar los sesgos del modelo base.
- Riesgo de alucinación no cuantificado; se recomienda verificar las respuestas en producción.
- El formato MLX limita su uso en entornos no Apple Silicon; para otros frameworks hay que convertir los pesos.
- No se han publicado pesos cuantizados, lo que obliga a convertir el modelo para despliegues con VRAM limitada.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías de rendimiento ni soporte.

## Enlaces

- HuggingFace: https://huggingface.co/StargazerLabs/Qwen3.8-23B-Mini-Me-bf16
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Artículo de OpenLM sobre Qwen3.8: https://openlm.ai/qwen3.8/
- Guía de despliegue de Qwen3.8 en producción: https://www.yottalabs.ai/post/how-to-run-qwen-3-8-in-production
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B (referencia indirecta)
