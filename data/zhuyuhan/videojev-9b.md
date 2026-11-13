# ZhuYuhan/VideoJev-9B

## Resumen

VideoJev-9B es un modelo de comprensión de vídeo desarrollado por Yuhan Zhu (repositorio `ZhuYuhan`), vinculado al grupo MCG-NJU, que adapta el modelo de lenguaje Qwen3.5-9B para realizar decisiones estructuradas sobre vídeo: localización temporal de eventos (temporal grounding) y selección de respuestas en preguntas de opción múltiple. En lugar de generar tokens de respuesta de forma autoregresiva, el modelo puntúa candidatos mediante una cabeza de decisión compartida (decision head), lo que lo convierte en un modelo de decisión más que en un generador de texto libre.

El modelo integra un codificador visual completo, un backbone de lenguaje basado en Qwen3.5-9B y una cabeza de decisión almacenada en FP32. Con 8.245.891.312 parámetros totales, se distribuye en formato safetensors con código personalizado (`trust_remote_code`) y requiere dependencias específicas como `flash-linear-attention` y `flash-attn`. Su pipeline declarado es `feature-extraction`, aunque sus capacidades reales abarcan video-question-answering y temporal grounding.

Es relevante porque propone un paradigma alternativo a la generación autoregresiva para tareas de vídeo: puntuar candidatos con una cabeza compartida permite obtener probabilidades calibradas, intervalos temporales en segundos e índices de respuesta de forma directa, lo que facilita su integración en sistemas de decisión y evaluación. El modelo se publica bajo licencia Apache 2.0 y va acompañado de un paper (arXiv:2610.18615), una página del proyecto y un repositorio de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (codificador visual + backbone de lenguaje Qwen3.5-9B + cabeza de decisión compartida); detalles internos del backbone no disponibles |
| Parametros totales | 8.245.891.312 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8192 tokens en el ejemplo de uso (context=8192); contexto máximo no disponible |
| Tipos de cuantizacion | no disponible (pesos en dtypes de Qwen, cabeza de decisión en FP32; inferencia CUDA con autocast BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

VideoJev-9B se construye sobre Qwen3.5-9B mediante fine-tuning (relación `finetune` declarada en la model card). La arquitectura combina un codificador visual completo, un backbone de lenguaje y una cabeza de decisión compartida que puntúa candidatos en lugar de generar tokens. Para las tareas de grounding, las puntuaciones son probabilidades sigmoideas independientes; para las preguntas de opción múltiple, se aplica softmax sobre las opciones. El repositorio incluye además el tokenizer y el processor necesarios para el preprocesado de vídeo.

El modelo admite dos modos de inferencia, "Cached" y "Joint", que producen resultados ligeramente distintos en los benchmarks. El procesamiento de vídeo se controla mediante parámetros como `fps` (2.0 en el ejemplo) y `max_frames` (2048 en el ejemplo), lo que permite ajustar el coste computacional según la longitud del vídeo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Localización temporal de eventos en vídeo (temporal grounding): devuelve un intervalo en segundos junto con probabilidades por candidato.
- Respuesta a preguntas de vídeo de opción múltiple (video-question-answering): devuelve `answer_index` basado en cero y la respuesta seleccionada.
- Puntuación de candidatos mediante cabeza de decisión compartida, con probabilidades calibradas (sigmoide para grounding, softmax para QA).
- Procesamiento de vídeo con control de FPS y número máximo de frames.
- Soporte de contexto de 8192 tokens en el ejemplo de uso.
- Inferencia en BF16 con puntuación de decisión en FP32.
- No se documentan capacidades de tool calling, agentes, generación de texto libre, matemáticas, visión estática ni audio.

## Casos de uso

- Búsqueda y recuperación de momentos concretos en archivos de vídeo: dado un texto descriptivo ("la mujer de verde come pasta"), el modelo devuelve el intervalo temporal exacto en segundos, útil para sistemas de indexación y búsqueda semántica de vídeo.
- Moderación y anotación automática de contenido audiovisual: la localización temporal permite marcar segmentos de interés (eventos, acciones) en grandes volúmenes de vídeo sin intervención manual.
- Evaluación automática de sistemas de vídeo: las probabilidades calibradas por candidato permiten construir métricas de confianza y comparar alternativas de respuesta de forma cuantitativa.
- Sistemas de preguntas y respuestas sobre vídeo para formación o documentación: el modelo selecciona la opción correcta entre varias, adecuado para cuestionarios automatizados sobre material audiovisual.
- Análisis de vídeos largos: con `max_frames` configurable y contexto de 8192 tokens, puede procesar secuencias extensas ajustando el muestreo de frames según los requisitos de memoria.
- Integración en pipelines de investigación en comprensión de vídeo: al devolver estructuras JSON con `id`, `task`, `probabilities` e `interval`, encaja en flujos de evaluación reproducibles (ver `evaluation_results.json`).
- Prototipado de asistentes de interacción con vídeo: el modo de decisión estructurada facilita respuestas deterministas y verificables en lugar de texto libre.

## Benchmarks y rendimiento

Resultados publicados en la model card (porcentajes; grounding con mIoU, MLVU con M-Avg, resto con accuracy). Ambas columnas usan el mismo checkpoint.

| Benchmark | Metrica | Cached | Joint |
|---|---|---:|---:|
| Charades-STA | mIoU | 60.75 | 61.49 |
| ActivityNet Captions | mIoU | 62.54 | 63.28 |
| QVHighlights | mIoU | 72.59 | 72.61 |
| LVBench | accuracy | 69.14 | 69.92 |
| Video-MME | accuracy | 78.00 | 78.07 |
| LongVideoBench | accuracy | 74.27 | 75.47 |
| MLVU | M-Avg | 83.18 | 83.90 |

No se han publicado en la información disponible resultados comparativos frente a otros modelos en estos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el tamaño del repositorio es de 49.5 GB, lo que orienta sobre el espacio en disco necesario para los pesos completos en sus dtypes originales.
- El ejemplo de uso emplea `device_map={"": "cuda:0"}` con una única GPU, BF16 y `flash_attention_2`.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño (8.2B parámetros) y dependencias (flash-attn, flash-linear-attention, CUDA 12.8), se requiere una GPU con soporte para estas librerías.
- Encaje en GPU de consumo: no disponible.
- Opciones de despliegue: `transformers` (versión 5.14.1) con `trust_remote_code=True`, `accelerate`, `safetensors`, `av` (18.1.0) y `flash-attn`. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor advierte que los vídeos largos requieren más memoria que el ejemplo corto (2 FPS, contexto de 8K).

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni especificaciones de modelos comparables en la información proporcionada. El modelo base declarado es Qwen/Qwen3.5-9B, sobre el que se aplica fine-tuning, pero no se ofrecen métricas comparativas frente a él ni frente a otros modelos de comprensión de vídeo.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| VideoJev-9B | 8.245.891.312 | 8192 (ejemplo) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-9B (base) | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas de video-QA | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo está diseñado para decisión estructurada (grounding y opción múltiple), no para generación de texto libre; no debe esperarse salida conversacional.
- No se documentan los idiomas soportados; la cobertura multilingüe es desconocida.
- No se dispone de información sobre sesgos, datos de entrenamiento ni riesgos de alucinación específicos.
- El contexto máximo no está documentado; el ejemplo usa 8192 tokens, y los vídeos largos requieren más memoria.
- Requiere `trust_remote_code=True` y código personalizado, lo que implica revisar el código antes de ejecutarlo en producción.
- Dependencias muy específicas (transformers 5.14.1, PyTorch 2.8 con CUDA 12.8, flash-linear-attention 0.4.2, fla-core 0.4.2, av 18.1.0), lo que puede complicar el despliegue.
- La model card indica que el repositorio era privado en el momento de su publicación y requiere autenticación con una cuenta con acceso; conviene verificar la disponibilidad pública actual.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y la atribución correspondiente.
- Sin datos publicados de latencia, throughput ni requisitos mínimos de VRAM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZhuYuhan/VideoJev-9B
- Paper: https://arxiv.org/abs/2610.18615
- Página del proyecto: https://mcg-nju.github.io/VideoJev
- Código: https://github.com/MCG-NJU/VideoJev
- Guía de uso: USAGE.md (referenciada en la model card, dentro del repositorio)
- Resultados de evaluación: evaluation_results.json (referenciado en la model card, dentro del repositorio)
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de demostración: https://huggingface.co/datasets/ZhuYuhan/VideoJev-Demo
