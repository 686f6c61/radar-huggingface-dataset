# ZhuYuhan/VideoJev-2B

## Resumen

VideoJev-2B es un modelo de comprensión de vídeo desarrollado por Yuhan Zhu y colaboradores (grupo MCG-NJU), construido como un ajuste fino de Qwen/Qwen3.5-2B. A diferencia de los modelos de vídeo generativos, VideoJev no produce tokens de respuesta: adapta el backbone lingüístico para emitir decisiones estructuradas mediante una cabeza de decisión compartida que puntúa candidatos. Resuelve dos tareas concretas: localización temporal de eventos (temporal grounding) y selección de respuesta en preguntas de opción múltiple sobre vídeo.

El modelo integra un codificador visual completo, el backbone de lenguaje y la cabeza de decisión en un único repositorio, con 2.177.589.056 parámetros totales y pesos almacenados en FP32. Su enfoque de "decision model" en lugar de generación autoregresiva lo hace especialmente adecuado para pipelines de evaluación y sistemas de interacción vídeo-texto donde se requiere una puntuación calibrada de candidatos en lugar de texto libre.

Es relevante porque propone un paradigma alternativo a los video-LLM generativos: en lugar de generar la respuesta, puntúa opciones, lo que facilita la integración en sistemas de decisión y reduce la ambigüedad de formato en tareas de grounding y QA de opción múltiple.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (codificador visual + backbone Qwen3.5-2B + cabeza de decisión compartida) |
| Parámetros totales | 2.177.589.056 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 8192 tokens en el ejemplo de uso (configurable vía parámetro `context`) |
| Tipos de cuantización | no disponible (pesos en FP32; inferencia CUDA con autocast BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

VideoJev-2B parte de Qwen3.5-2B como backbone lingüístico y le añade un codificador visual completo, un procesador específico de vídeo y una cabeza de decisión compartida que puntúa candidatos. La innovación principal es sustituir la generación autoregresiva de tokens por una puntuación directa de candidatos: para grounding temporal emplea probabilidades sigmoideas independientes por intervalo, y para QA de opción múltiple usa softmax sobre las opciones. El modelo procesa fotogramas a una tasa configurable (2 FPS en el ejemplo, hasta 2048 fotogramas) y soporta dos modos de inferencia, "Cached" y "Joint", que difieren en cómo se combinan las representaciones.

Los detalles sobre el volumen de datos de entrenamiento, la composición del dataset y si hubo RLHF/DPO no están disponibles en la información proporcionada. El paper asociado es arXiv:2610.18615 ("VideoJev: System One Model for Video Understanding and Interaction"). El repositorio incluye el codificador visual, el backbone, la cabeza de decisión, el tokenizer y el procesador, y requiere `trust_remote_code=True` para su carga.

## Capacidades

- Localización temporal de eventos en vídeo (temporal grounding) con salida de intervalo en segundos y probabilidades sigmoideas.
- Respuesta a preguntas de opción múltiple sobre vídeo, devolviendo índice de respuesta y probabilidades softmax.
- Procesamiento de vídeo a tasa de fotogramas configurable (FPS) con límite de fotogramas (hasta 2048 en el ejemplo).
- Soporte de contexto largo (hasta 8192 tokens en el ejemplo de uso).
- Extracción de características (pipeline `feature-extraction`).
- Dos modos de inferencia: "Cached" y "Joint".
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión de imágenes estáticas, audio ni modo thinking.

## Casos de uso

- Análisis de contenido audiovisual para localización de eventos: el modelo identifica el intervalo temporal exacto en el que ocurre un evento descrito en texto, útil en catalogación automática de archivos de vídeo y sistemas de búsqueda.
- Evaluación automática de sistemas de vídeo-QA: al puntuar opciones de respuesta con probabilidades calibradas, sirve como evaluador o componente de un pipeline de benchmarking.
- Sistemas de interacción vídeo-texto: integrado en asistentes que responden preguntas de opción múltiple sobre vídeos largos, con contexto de hasta 8192 tokens.
- Moderación y verificación de contenido: localización temporal de eventos concretos en vídeos para revisión humana o automatizada.
- Investigación en comprensión de vídeo: modelo de referencia para estudiar el paradigma de "decision model" frente a la generación autoregresiva.
- Anotación asistida de datasets de vídeo: generación de intervalos temporales y respuestas candidatas para acelerar el etiquetado.
- Indexación de vídeo bajo demanda: procesamiento por lotes de vídeos con 2 FPS y hasta 2048 fotogramas para construir índices temporales de eventos.

## Benchmarks y rendimiento

Resultados publicados en la model card (porcentajes; grounding usa mIoU, MLVU usa M-Avg, el resto accuracy):

| Benchmark | Métrica | Cached | Joint |
|---|---|---:|---:|
| Charades-STA | mIoU | 55.05 | 55.71 |
| ActivityNet Captions | mIoU | 57.30 | 58.11 |
| QVHighlights | mIoU | 69.52 | 69.56 |
| LVBench | accuracy | 62.43 | 63.20 |
| Video-MME | accuracy | 68.33 | 68.22 |
| LongVideoBench | accuracy | 68.59 | 68.44 |
| MLVU | M-Avg | 73.24 | 74.16 |

No se han publicado en la información disponible resultados comparativos directos con otros modelos de la misma categoría.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; los pesos en FP32 de 2.177.589.056 parámetros ocupan aproximadamente 8,7 GB, a los que hay que sumar el codificador visual, el procesador y las activaciones de vídeo (que crecen con el número de fotogramas y la longitud de contexto).
- GPU recomendadas: no especificadas; el ejemplo usa `device_map={"": "cuda:0"}` con `flash_attention_2`, lo que sugiere GPUs con soporte de FlashAttention 2 (A100, H100, RTX 4090, etc.).
- Cabe en GPU de consumo: probablemente en GPUs con 16-24 GB si se reduce el número de fotogramas y el contexto, aunque no se documenta oficialmente.
- Opciones de despliegue: `transformers` (versión 5.14.1 o superior) con `trust_remote_code=True`, `accelerate`, `flash-attn`, `causal-conv1d` y `flash-linear-attention`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El ejemplo usa 2 FPS y contexto de 8192 tokens para un vídeo corto, con aviso de que los vídeos largos requieren más memoria.

## Comparativa con modelos similares

No se dispone de datos de comparación con modelos alternativos en la información proporcionada. Como referencia estructural, el modelo base es Qwen/Qwen3.5-2B (2B parámetros, licencia no especificada en esta ficha), sobre el que VideoJev añade codificador visual y cabeza de decisión. No se conocen en la información disponible otros "decision models" de vídeo directamente comparables con métricas publicadas.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para grounding temporal y QA de opción múltiple; no genera texto libre ni respuestas abiertas.
- No se documentan sesgos conocidos ni evaluación de sesgos.
- Riesgo de alucinación en la selección de respuestas y en los intervalos temporales; las probabilidades de grounding son sigmoideas independientes, no calibradas conjuntamente.
- Idiomas soportados no disponibles; el ejemplo está en inglés.
- El rendimiento en vídeos largos depende del número de fotogramas y del contexto configurado; los vídeos largos requieren más memoria.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del autor.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan restricciones adicionales ni condiciones de atribución específicas.
- El repositorio estaba privado en el momento de la publicación de la model card; se requiere autenticación con una cuenta con acceso.
- Dependencias específicas y versiones fijadas (transformers 5.14.1, PyTorch 2.8, CUDA 12.8, av 18.1.0) pueden complicar el despliegue en entornos existentes.

## Enlaces

- Hugging Face: https://huggingface.co/ZhuYuhan/VideoJev-2B
- Paper: https://arxiv.org/abs/2610.18615
- Homepage: https://mcg-nju.github.io/VideoJev
- Código: https://github.com/MCG-NJU/VideoJev
- Guía de uso: https://huggingface.co/ZhuYuhan/VideoJev-2B/blob/main/USAGE.md
- Dataset de demo: https://huggingface.co/datasets/ZhuYuhan/VideoJev-Demo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
