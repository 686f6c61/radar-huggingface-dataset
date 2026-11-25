# tencent/WePocketModel1.0-2B-MLX

## Resumen

WePocketModel 1.0 2B · MLX es la conversión para Apple Silicon del modelo multimodal `tencent/WePocketModel1.0-2B`, publicada por Tencent bajo licencia Apache 2.0. Se trata de un modelo de 2.213.241.664 parámetros (bf16, 4,12 GiB) construido sobre un backbone Qwen3.5 que combina una torre visual Qwen3-VL con un modelo de lenguaje híbrido de 24 capas. La build MLX reescribe los pesos al layout de MLX y empaqueta un runtime autocontenido, de modo que la inferencia se ejecuta en la GPU de Apple sin PyTorch ni torchvision.

Su rasgo diferencial es que un único conjunto de parámetros cubre tres familias de capacidades: generación (texto, imagen o contenido intercalado, con decodificación sin slots), embedding multimodal (vectores L2-normalizados de 2.048 dimensiones con truncamiento MRL a 64/128/256/512/1024) y decisión estructurada (elección entre opciones, puntuaciones ordinales y juicios binarios mediante el mecanismo JEV). Esto lo orienta a despliegues on-device en macOS donde se necesita recuperación, ranking y toma de decisiones ligeras en el mismo modelo.

Es relevante ahora porque demuestra que un modelo multimodal de 2B puede ejecutarse íntegramente en hardware de consumo Apple con un runtime mínimo y cuantización en tiempo de carga (4 u 8 bits), sin depender del stack de PyTorch. La información pública disponible sobre benchmarks, idiomas y datos de entrenamiento es, no obstante, muy limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal: torre visual Qwen3-VL + modelo de lenguaje híbrido de 24 capas (backbone Qwen3.5), con cabezas de tarea (embedding y decisión) y cuello de botella visual MGVB |
| Parámetros totales | 2.213.241.664 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Cuantización de capas lineales en tiempo de carga con `--quantize-bits 4` u `8`; pesos publicados en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en layout MLX (bf16), más `task_modules.safetensors`; existe una release GGUF del modelo base en otro repositorio |

## Arquitectura y entrenamiento

La arquitectura combina una torre visual Qwen3-VL (preprocesado de imagen mediante `smart_resize` y patchify, reimplementados en numpy/PIL/MLX) con un modelo de lenguaje híbrido de 24 capas y un cuello de botella visual denominado MGVB. Sobre ese backbone se añaden módulos de tarea: slots E/J, cabeza de embedding y cabeza de decisión, empaquetados aparte en `task_modules.safetensors`. La conversión a MLX solo altera el layout, no las matemáticas: renombra claves al árbol de módulos MLX (`vision_tower.*`, `language_model.model.*`), reordena las `conv1d` depthwise de `[out, 1, kernel]` a `[out, kernel, 1]`, cambia el Conv3d de patch embedding de `NCDHW` a `NDHWC` y almacena las ganancias de RMSNorm como `weight` en lugar de la forma delta `weight - 1` del release original.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card menciona una plantilla de chat de entrenamiento (`chat_template.jinja`) y un contrato de arquitectura `task_slots_v1`, pero no detalla el proceso de alineación. Tampoco se documentan innovaciones como decodificación especulativa; sí se menciona la decodificación sin slots para generación y el truncamiento MRL para los embeddings.

## Capacidades

- Generación de texto a partir de texto, de una imagen o de contenido intercalado texto/imagen (OCR, captioning, VQA y chat).
- Embedding multimodal: codifica texto e imágenes en vectores L2-normalizados de 2.048 dimensiones, con dimensiones truncadas MRL de 64, 128, 256, 512 y 1.024 para recuperación y ranking de candidatos.
- Decisión estructurada: evalúa un estado de aplicación y una serie de preguntas para devolver elecciones entre criterios (`choice`), puntuaciones ordinales (`score`) o juicios binarios de probabilidad (`noul`, mecanismo JEV).
- Procesamiento de imágenes integrado en el runtime MLX (redimensionado inteligente y patchify) sin dependencias de PyTorch.
- Cuantización en carga a 4 u 8 bits de las capas lineales sin descarga adicional.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente; la capacidad de decisión estructurada puede usarse para seleccionar acciones en un flujo de aplicación.
- Capacidades multilingües: no disponible.
- Modo thinking, visión, audio: visión sí; thinking y audio no disponibles.

## Casos de uso

- Recuperación visual en local: indexar una fototeca o catálogo de imágenes en un Mac generando embeddings de 256 o 1.024 dimensiones con MRL y realizar búsqueda por similitud coseno sin enviar datos a la nube.
- Búsqueda multimodal en aplicaciones de escritorio: combinar un embedding de texto de consulta con embeddings de imágenes para ordenar candidatos, aprovechando que un mismo modelo cubre ambas modalidades.
- Asistentes de accesibilidad on-device: describir imágenes o extraer texto mediante OCR en tiempo de ejecución sobre la GPU de Apple, con el runtime MLX y sin toolchain de vídeo.
- Enrutamiento de acciones en agentes ligeros: usar la tarea `decision` con peticiones `choice` para que el modelo seleccione el siguiente paso de una aplicación (por ejemplo, llamar, mostrar menú o ignorar) a partir del estado de la conversación.
- Puntuación ordinal de candidatos: emplear peticiones `score` para rankear respuestas, productos o resultados de búsqueda según criterios ordenados definidos por la aplicación.
- Filtrado binario de contenido: usar `noul` para obtener la probabilidad de que una condición sea verdadera (por ejemplo, si un texto cumple una política) y aplicar un umbral en el pipeline.
- Prototipado de VQA y captioning en macOS: ejecutar `infer_mlx.py` con `--task generate` para generar descripciones o responder preguntas sobre imágenes durante el desarrollo, con cuantización a 4 bits para reducir memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo menciona una comparación de paridad frente al runtime oficial de PyTorch (CPU, fp32) en seis casos: generación de texto, embedding de imagen única y otros casos no detallados en el extracto disponible. No se proporcionan cifras de MMLU, HumanEval, GSM8K ni métricas de recuperación.

## Requisitos de hardware

- Pesos en bf16: 4,12 GiB para el backbone más los módulos de tarea; el repositorio completo ocupa 4,5 GB.
- VRAM/memoria unificada estimada: al menos ~5 GB en bf16 para cargar pesos y overhead del runtime; la cuantización a 4 u 8 bits reduce el consumo de las capas lineales, aunque no se especifica el ahorro exacto.
- GPU recomendadas: GPU integrada de Apple Silicon (el runtime está diseñado para MLX); no se documenta soporte para A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente; no se indica compatibilidad con GPU NVIDIA.
- Opciones de despliegue: runtime propio `wepm_mlx` con CLI `runtime/infer_mlx.py`; dependencias fijadas en `requirements.txt` (mlx, mlx-vlm, transformers, Pillow). No se mencionan vLLM, llama.cpp, Ollama ni TGI para esta build.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Capacidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WePocketModel 1.0 2B · MLX | 2,21 B | no disponible | Generación multimodal, embedding MRL, decisión estructurada | Apache 2.0 | MLX (Apple Silicon), safetensors |
| WePocketModel 1.0 2B (original) | 2,21 B | no disponible | Las mismas, en PyTorch | Apache 2.0 | safetensors, GGUF |
| WePocketModel 1.0 4B · MLX | no disponible | no disponible | Las mismas, mayor tamaño | Apache 2.0 | MLX |

No se dispone de datos de rendimiento comparativo con otras familias de modelos, por lo que la comparación se limita a parámetros, licencia y formato de despliegue.

## Limitaciones y advertencias

- No se documentan sesgos conocidos ni evaluación de sesgos en la información disponible.
- Riesgo de alucinación inherente a un modelo generativo de 2B; la model card no reporta tasas de error ni evaluaciones de fidelidad.
- Longitud de contexto e idiomas soportados no disponibles, lo que impide garantizar un comportamiento multilingüe o conversaciones de contexto largo.
- La build está limitada a Apple Silicon y al runtime MLX; no hay soporte documentado para CUDA ni para servidores de inferencia estándar.
- La cuantización a 4 u 8 bits se aplica en carga y puede degradar la calidad; no se publican métricas de degradación.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base y de los componentes Qwen3.5/Qwen3-VL.
- El repositorio registra 0 descargas y 1 like en el momento de la consulta, por lo que la validación comunitaria es prácticamente inexistente.
- La paridad con PyTorch solo se ha verificado en seis casos según la model card, sin detalle completo de los mismos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WePocketModel1.0-2B-MLX
- Modelo base en Hugging Face: https://huggingface.co/tencent/WePocketModel1.0-2B
- Versión GGUF del modelo base: https://huggingface.co/tencent/WePocketModel1.0-2B-GGUF
- Versión 4B MLX: https://huggingface.co/tencent/WePocketModel1.0-4B-MLX
- Repositorio GitHub: https://github.com/Tencent/WePocketModel
- MLX: https://github.com/ml-explore/mlx
- Paper referenciado en los tags: arxiv:2611.27365
