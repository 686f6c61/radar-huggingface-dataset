# ZhuYuhan/VideoJev-0.8B

## Resumen

VideoJev-0.8B es un modelo de comprensión de vídeo desarrollado por ZhuYuhan (en colaboración con el grupo MCG-NJU, según los enlaces del paper) que adapta el backbone de lenguaje Qwen3.5-0.8B para emitir decisiones estructuradas sobre vídeo en lugar de generar texto libre. En concreto, el modelo resuelve dos tareas: localización temporal de eventos (temporal grounding, devolviendo un intervalo en segundos) y selección de respuesta en preguntas de elección múltiple sobre vídeo. Para ello sustituye la generación autorregresiva de tokens de respuesta por una cabeza de decisión compartida que puntúa candidatos.

La relevancia del modelo está en su planteamiento de "decision model": en lugar de pedir al modelo que escriba la respuesta, se calculan probabilidades sobre un conjunto cerrado de candidatos (intervalos temporales o opciones de respuesta), lo que reduce el coste de decodificación y hace la salida más fácil de evaluar y de integrar en pipelines. Con 843.024.448 parámetros totales y un repositorio de 3,4 GB, es un modelo pequeño orientado a extracción de características y respuesta a preguntas sobre vídeo.

El checkpoint incluye el codificador visual completo, el backbone de lenguaje, la cabeza de decisión, el tokenizer y el processor. Está publicado bajo licencia Apache 2.0 y se distribuye en formato safetensors con código personalizado (`trust_remote_code=True`), lo que exige revisar el código remoto antes de desplegarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (codificador visual + backbone de lenguaje Qwen3.5-0.8B + cabeza de decisión compartida); detalles internos no disponibles |
| Parametros totales | 843.024.448 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8192 tokens en el ejemplo de uso; configuración para benchmarks no detallada |
| Tipos de cuantizacion | pesos almacenados en FP32; inferencia CUDA con autocast BF16 y scoring de decisión en FP32; no se documentan otros formatos (GGUF, AWQ, GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con código personalizado, `custom_code`) |

## Arquitectura y entrenamiento

VideoJev-0.8B parte de Qwen3.5-0.8B como backbone de lenguaje y le añade un codificador visual y una cabeza de decisión compartida. El modelo no genera tokens de respuesta: puntúa candidatos. Para grounding temporal produce probabilidades sigmoideas independientes por instante (de ahí que devuelva un intervalo en segundos), mientras que para preguntas de elección múltiple aplica softmax sobre las opciones. Esta separación entre representación y decisión es la innovación central frente a los modelos video-LLM generativos convencionales.

El repositorio incluye el codificador visual, el backbone, la cabeza de decisión, el tokenizer y el processor. Los pesos se almacenan en FP32 y la inferencia en CUDA usa BF16 con scoring FP32. El modelo admite dos modos de inferencia, "Cached" y "Joint", con resultados ligeramente distintos según el benchmark. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; el paper referenciado (arXiv:2610.18615) es la fuente para esos datos.

## Capacidades

- Localización temporal de eventos en vídeo (temporal grounding), devolviendo un intervalo en segundos con probabilidades sigmoideas.
- Respuesta a preguntas de elección múltiple sobre vídeo, con `answer_index` cero-based y respuesta seleccionada.
- Procesamiento de vídeo a FPS configurable (2 FPS en el ejemplo) y hasta 2048 frames en el ejemplo de uso.
- Extracción de características de vídeo (pipeline `feature-extraction`).
- Procesamiento conjunto de varias preguntas sobre un mismo vídeo mediante `predict_video`.
- Soporte de contexto de 8192 tokens en la configuración de ejemplo.
- No se documentan capacidades de tool calling, agentes, audio, ni modo "thinking".

## Casos de uso

- Indexación y búsqueda de momentos en archivos audiovisuales: dado un vídeo y una consulta textual ("la mujer de verde come pasta"), el modelo devuelve el intervalo temporal del evento, lo que permite construir índices de momentos para buscadores internos o plataformas de vídeo.
- Moderación y etiquetado de contenido: para una pregunta cerrada sobre lo que ocurre en un clip ("¿qué está comiendo la mujer?"), el modelo devuelve la opción más probable entre candidatos predefinidos, lo que encaja en pipelines de clasificación con categorías fijas.
- Evaluación automática de vídeo en investigación: el modelo sirve como componente de referencia en benchmarks de grounding (Charades-STA, ActivityNet Captions, QVHighlights) y de QA de vídeo largo (LVBench, Video-MME, LongVideoBench, MLVU).
- Análisis de vídeo largo con muestreo a 2 FPS y contexto de 8192 tokens: útil para resumir o responder preguntas sobre grabaciones extensas donde no se necesita decodificación generativa.
- Extracción de características para sistemas de recomendación o recuperación: el pipeline `feature-extraction` permite obtener representaciones de vídeo para alimentar modelos posteriores de ranking o clustering.
- Prototipado en entornos con GPU modesta: con 843 M de parámetros, es viable experimentar con grounding y QA de vídeo sin infraestructura de gran escala, siempre que se ajusten FPS y número de frames.

## Benchmarks y rendimiento

Resultados publicados en la model card (porcentajes; grounding en mIoU, MLVU en M-Avg, el resto en accuracy):

| Benchmark | Metrica | Cached | Joint |
|---|---|---:|---:|
| Charades-STA | mIoU | 49.83 | 50.48 |
| ActivityNet Captions | mIoU | 52.01 | 52.69 |
| QVHighlights | mIoU | 64.05 | 63.98 |
| LVBench | accuracy | 53.78 | 54.81 |
| Video-MME | accuracy | 60.33 | 60.70 |
| LongVideoBench | accuracy | 61.11 | 60.28 |
| MLVU | M-Avg | 62.05 | 64.13 |

No se han publicado en la información disponible resultados comparativos frente a otros modelos en estos mismos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 843 M de parámetros en FP32 los pesos ocupan aproximadamente 3,4 GB, y el modo BF16 reduce esa cifra a la mitad, a lo que hay que sumar activaciones del codificador visual y memoria para frames (hasta 2048 en el ejemplo).
- El ejemplo oficial usa `device_map={"": "cuda:0"}`, `flash_attention_2` y `dtype=torch.float32`; se requiere una GPU CUDA compatible con FlashAttention 2.
- GPU recomendadas: no disponibles en la información; por tamaño, una GPU consumer con suficiente VRAM (por ejemplo, RTX 4090) debería poder ejecutar el ejemplo corto, aunque los vídeos largos "requieren más memoria que este ejemplo corto" según la model card.
- Opciones de despliegue: transformers 5.14.1 con `trust_remote_code=True`, accelerate, safetensors, av 18.1.0, flash-linear-attention 0.4.2, fla-core 0.4.2, flash-attn y causal-conv1d. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Entorno: Python 3.12, PyTorch 2.8 con CUDA 12.8.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de parámetros, contexto, rendimiento ni licencia de modelos comparables de la misma categoría (video-LLM pequeños para grounding y QA). Por tanto, la comparativa se indica como no disponible.

## Limitaciones y advertencias

- El modelo no genera texto libre: solo puntúa candidatos predefinidos (intervalos u opciones), lo que limita su uso a tareas cerradas.
- No se documentan los idiomas soportados; el comportamiento multilingüe es desconocido.
- No se detallan sesgos conocidos ni tasas de alucinación; al ser un modelo de decisión cerrada, el riesgo de alucinación textual es menor, pero puede seleccionar opciones incorrectas con alta confianza.
- La longitud de contexto efectiva para vídeos largos no está especificada más allá del ejemplo de 8192 tokens; los vídeos largos requieren más memoria.
- Requiere `trust_remote_code=True` y dependencias específicas (flash-linear-attention, flash-attn, causal-conv1d), lo que añade riesgo de seguridad y complejidad de despliegue.
- La model card indica que el repositorio era privado en el momento de su publicación; conviene verificar el acceso antes de integrarlo.
- La licencia Apache 2.0 permite uso comercial, pero debe revisarse el código personalizado y las licencias de las dependencias.
- El checkpoint se almacena en FP32, lo que aumenta el tamaño en disco y la memoria frente a alternativas en BF16.

## Enlaces

- Hugging Face: https://huggingface.co/ZhuYuhan/VideoJev-0.8B
- Paper: https://arxiv.org/abs/2610.18615
- Página del proyecto: https://mcg-nju.github.io/VideoJev
- Código: https://github.com/MCG-NJU/VideoJev
- Guía de uso: https://huggingface.co/ZhuYuhan/VideoJev-0.8B/blob/main/USAGE.md
- Resultados de evaluación: https://huggingface.co/ZhuYuhan/VideoJev-0.8B/blob/main/evaluation_results.json
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de demo: https://huggingface.co/datasets/ZhuYuhan/VideoJev-Demo
