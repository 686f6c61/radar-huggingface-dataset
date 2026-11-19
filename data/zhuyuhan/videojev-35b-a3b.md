# ZhuYuhan/VideoJev-35B-A3B

## Resumen

VideoJev-35B-A3B es un modelo especializado en comprensión de vídeo desarrollado por Yuhan Zhu y colaboradores (MCG-NJU), construido como un fine-tuning de Qwen/Qwen3.6-35B-A3B. Se presenta como un "System One model" para vídeo, es decir, un modelo que resuelve tareas de vídeo mediante puntuación directa de candidatos en lugar de generación autoregresiva de texto. Resuelve dos tareas concretas: *temporal grounding* (localizar el intervalo temporal de un evento descrito en lenguaje natural) y *video question answering* de opción múltiple.

La relevancia del modelo radica en su enfoque de "decision model": en lugar de generar una respuesta textual token a token, el modelo puntúa directamente candidatos (intervalos temporales o opciones de respuesta) y devuelve probabilidades. Esto reduce la latencia frente a enfoques generativos y permite obtener puntuaciones calibradas por candidato. El modelo tiene 33.791.740.272 parámetros totales según los pesos en safetensors, aunque su nombre ("A3B") sugiere una arquitectura de mezcla de expertos con aproximadamente 3.000 millones de parámetros activos, heredada de la base Qwen3.6-35B-A3B.

El modelo se distribuye bajo licencia Apache 2.0, con un repositorio de 71,9 GB, e incluye código personalizado (`trust_remote_code=True`) y dependencias específicas como `flash-linear-attention` y `fla-core`, lo que apunta a componentes de atención lineal en su arquitectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.6-35B-A3B (MoE según nomenclatura A3B), con componentes de atención lineal (dependencias flash-linear-attention); modelo de decisión con puntuación de candidatos |
| Parametros totales | 33.791.740.272 |
| Parametros activos | no disponible (la nomenclatura "A3B" sugiere ~3B activos, sin confirmación en la información disponible) |
| Longitud de contexto | no disponible como spec fija; el ejemplo de uso pasa `context=8192` y `max_frames=2048` |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16 según el ejemplo de carga) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.6-35B-A3B y se ajusta (finetune) para tareas de vídeo. La nomenclatura "35B-A3B" indica una arquitectura de mezcla de expertos con aproximadamente 35.000 millones de parámetros totales y unos 3.000 millones activos por token, aunque la información disponible no detalla la configuración exacta de expertos. Las dependencias declaradas (`flash-linear-attention` y `fla-core`) indican el uso de capas de atención lineal, lo que resulta coherente con el procesamiento de secuencias de vídeo largas (hasta 2048 frames en el ejemplo).

El rasgo arquitectónico distintivo es su condición de "decision model" o "System One": en lugar de generar texto, el modelo puntúa directamente candidatos. Para *temporal grounding* produce puntuaciones sigmoideas independientes por unidad temporal (con un umbral por defecto de 0,25 y la posibilidad de ajustarlo a 0,4) y deriva un intervalo en segundos; para *multiple-choice QA* produce una distribución softmax sobre las opciones. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- *Temporal grounding*: localización de intervalos temporales en vídeo a partir de una consulta en lenguaje natural, devolviendo probabilidades por unidad temporal e intervalo resultante en segundos.
- *Video question answering* de opción múltiple: puntuación softmax sobre opciones y selección de la respuesta con mayor probabilidad.
- Procesamiento de vídeo a FPS configurable (el ejemplo usa 2 FPS) con límite de frames configurable (hasta 2048 en el ejemplo).
- Puntuación de candidatos calibrada (sigmoid para grounding, softmax para QA), en lugar de generación autoregresiva.
- Procesamiento por lotes de múltiples preguntas en una sola llamada (`predict_video` acepta una lista de preguntas).
- Extracción de características de vídeo (pipeline declarado: `feature-extraction`; método `predict_features`).
- No se documentan capacidades de tool calling, agentes, visión general más allá de vídeo, audio ni modo de razonamiento explícito.

## Casos de uso

- Búsqueda y recuperación de momentos concretos en archivos audiovisuales: dado un catálogo de vídeos y una descripción textual ("la mujer de verde come pasta"), el modelo devuelve el intervalo temporal exacto, lo que permite indexar y recortar clips automáticamente.
- Generación automática de capítulos y marcadores: aplicar grounding sobre descripciones de eventos para producir una segmentación temporal de vídeos largos, útil en plataformas de formación o streaming.
- Moderación y auditoría de contenido: localizar en un vídeo los tramos que corresponden a una descripción de evento sospechoso para revisión humana, aprovechando las probabilidades por unidad temporal.
- Evaluación automática de sistemas de vídeo: usar las puntuaciones calibradas del modelo como referencia para comparar pipelines de comprensión de vídeo en tareas de grounding y QA.
- Asistentes de accesibilidad: responder preguntas de opción múltiple sobre el contenido de un vídeo para generar descripciones o resúmenes verificables.
- Anotación asistida de datasets de vídeo: preetiquetar intervalos y respuestas de opción múltiple para acelerar el etiquetado humano, dado el formato de salida estructurado en JSON.
- Monitorización de vídeo industrial o de seguridad: grounding de eventos descritos ("una persona cruza la línea") sobre flujos grabados para generar alertas con marcas temporales.

## Benchmarks y rendimiento

La model card incluye dos gráficas de resultados (`assets/benchmark-grounding.png` y `assets/benchmark-qa.png`) que comparan "calidad y latencia" del modelo, pero los valores numéricos no están disponibles en la información proporcionada.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con 33.791.740.272 parámetros en bfloat16, los pesos ocupan aproximadamente 67,6 GB, por lo que la inferencia en precisión completa requiere más de 70 GB de VRAM.
- GPU recomendadas: el autor indica que probó el modelo con un H200 (141 GB de VRAM). Para bfloat16 se requieren GPUs de clase H100/H200 o A100 de 80 GB (esta última con margen ajustado).
- GPU de consumo: no cabe en GPUs de consumo (RTX 4090 de 24 GB) en bfloat16; no se documentan versiones cuantizadas en la información disponible.
- Opciones de despliegue: `transformers` (versión 5.14.1 en el ejemplo) con `accelerate`, `flash-attn`, `causal-conv1d`, `flash-linear-attention` y `fla-core`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles numéricamente; la model card incluye gráficas de latencia comparativa sin valores extraídos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VideoJev-35B-A3B | 33,79B totales (MoE, ~3B activos según nomenclatura) | no disponible (ejemplo con context=8192) | Grounding temporal y QA de vídeo por puntuación de candidatos | Apache 2.0 | Hugging Face, transformers con código remoto |
| Qwen/Qwen3.6-35B-A3B (base) | ~35B totales (MoE, ~3B activos) | no disponible | Modelo de lenguaje general | no disponible en la información | Hugging Face |
| Alternativas específicas de grounding temporal | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo especializado: solo cubre grounding temporal y QA de opción múltiple sobre vídeo; no es un modelo de propósito general ni un chatbot.
- Requiere `trust_remote_code=True` y código personalizado del repositorio, lo que implica revisar el código antes de ejecutarlo en producción.
- Dependencias frágiles y específicas (`transformers==5.14.1`, `flash-linear-attention==0.4.2`, `fla-core==0.4.2`, `av==18.1.0`), lo que complica la reproducibilidad y el mantenimiento.
- Idiomas soportados no documentados; el comportamiento multilingüe es incierto.
- Riesgo de alucinación no evaluado en la información disponible; al ser un modelo de puntuación, el riesgo se traslada a falsos positivos en intervalos y a respuestas de opción múltiple incorrectas con alta confianza.
- El rendimiento depende de parámetros de inferencia (FPS, `max_frames`, `context`, umbral de grounding); no se documentan valores óptimos más allá de los ejemplos.
- No se documentan sesgos conocidos ni evaluaciones de robustez.
- Licencia Apache 2.0 permite uso comercial, pero la licencia del modelo base (Qwen3.6-35B-A3B) debe verificarse de forma independiente.
- El tamaño del repositorio (71,9 GB) y los requisitos de VRAM (>70 GB en bfloat16) limitan su despliegue a infraestructura de gama alta.

## Enlaces

- Hugging Face: https://huggingface.co/ZhuYuhan/VideoJev-35B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Paper: https://arxiv.org/abs/2610.18615
- Página del proyecto: https://mcg-nju.github.io/VideoJev
- Código: https://github.com/MCG-NJU/VideoJev
- Guía de uso: https://huggingface.co/ZhuYuhan/VideoJev-35B-A3B/blob/main/USAGE.md
- Dataset de demostración: https://huggingface.co/datasets/ZhuYuhan/VideoJev-Demo
