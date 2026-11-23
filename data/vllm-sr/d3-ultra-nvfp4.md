# vllm-sr/d3-ultra-NVFP4

## Resumen

d3-ultra-NVFP4 es la versión cuantizada en NVFP4 de d3-ultra, un modelo de decisión multimodal de 26.090 millones de parámetros (incluido un codificador de visión de 0,46B) desarrollado por el autor vllm-sr dentro de la familia Decision 3.0. No es un modelo generativo al uso: recibe una entrada (texto, JSON, imágenes o vídeos) y un conjunto de preguntas tipadas, y devuelve una probabilidad para cada respuesta posible. Soporta cinco tipos de decisión: elección entre opciones, sí/no, puntuación en escala, caja delimitadora (Box) y seguimiento (Track).

La relevancia de esta variante concreta es la eficiencia: mantiene el comportamiento del modelo original con un coste de almacenamiento de 17,2 GB frente a los 52,2 GB de d3-ultra, y aproximadamente la mitad de latencia (32,5 ms frente a 63,4 ms de mediana para una pregunta de texto sobre una NVIDIA RTX PRO 6000 Blackwell). Es, por tanto, una opción para desplegar un modelo de decisión multimodal de 26B en hardware Blackwell con FP4 tensor cores.

La cuantización combina suavizado AWQ con redondeo GPTQ contra activaciones ya cuantizadas en NVFP4, aplicada a 400 proyecciones del decodificador. El modelo base es d3-ultra en la revisión `52ba9e7a`, y la licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con capas de atención lineal tipo Gated DeltaNet (según referencias a `in_proj_a`/`in_proj_b` en la model card); codificador de visión de 0,46B |
| Parametros totales | 26.085.330.160 (26,09B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 (`nvfp4-pack-quantized` de compressed-tensors): pesos y activaciones FP4 (E2M1) en bloques de 16 con escalas E4M3 y escala global FP32 por tensor; 400 proyecciones cuantizadas |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), con código custom (`d3q.load`, `d3_runtime.py`) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal con capas de atención lineal (Gated DeltaNet) en el decodificador y una torre de visión separada de 0,46B de parámetros. El pipeline declarado es `zero-shot-classification` y la arquitectura interna se etiqueta como `qwen3_5` en los tags de Hugging Face. El modelo no genera texto libre: emite probabilidades por respuesta a preguntas tipadas (Choice, Yes/No, Score, Box, Track), leyendo la entrada una sola vez por petición y resolviendo todas las preguntas en esa misma pasada.

La cuantización se aplica solo al decodificador: 400 proyecciones pasan a NVFP4 mediante suavizado AWQ (escalas conscientes de activación plegadas en las normas previas y en `up_proj`) seguido de redondeo GPTQ contra las activaciones ya cuantizadas. Quedan sin cuantizar las proyecciones `in_proj_a` e `in_proj_b` del Gated DeltaNet, la torre de visión, los embeddings y la cabeza de lectura, salvo donde se plegaron las escalas. La calibración usó las primeras 512 de las 832 peticiones de calibración de d3-ultra-INT4: 316 prompts de texto del primer shard de entrenamiento de `tasksource-jev-typed-decisions`, 153 peticiones Box y 43 de imágenes en opciones; sin peticiones de vídeo y sin imágenes de los splits de desarrollo y test. No se detallan en la información disponible los datos de entrenamiento originales de d3-ultra (número de tokens, composición, RLHF/DPO).

## Capacidades

- Clasificación zero-shot con probabilidad por respuesta: elección entre opciones, sí/no y puntuación en escala.
- Detección de objetos y localización espacial mediante preguntas de tipo Box, con precisión medida a IoU 0,5.
- Seguimiento de objetos en vídeo (Track), con métrica de éxito AUC.
- Procesamiento multimodal de imágenes y vídeos, con varias imágenes por petición.
- Imágenes dentro de las preguntas y de las opciones (por ejemplo, comparar una foto con varios grabados candidatos).
- Entrada de texto libre o JSON estructurado.
- Resolución de múltiples preguntas heterogéneas en una sola lectura de la entrada.
- Modelo de decisión "system-one": respuesta directa sin cadena de razonamiento explícita.
- No se documentan en la información disponible capacidades de generación de texto libre, tool calling ni agentes multi-paso.

## Casos de uso

- Enrutado de tickets en atención al cliente: se pasa el texto del ticket como `state` y una pregunta Choice con las colas disponibles (facturación, soporte técnico) más una pregunta Yes/No de urgencia; el modelo devuelve probabilidades que permiten aplicar umbrales y derivar a revisión humana los casos ambiguos.
- Moderación y verificación de contenido visual: preguntas Yes/No sobre imágenes (por ejemplo, presencia de un objeto o de una marca) con la probabilidad asociada como señal para el pipeline de moderación.
- Anotación asistida de datasets: preguntas Box para preetiquetar objetos en imágenes y Track para secuencias de vídeo, con probabilidad por caja para priorizar la revisión manual.
- Control de calidad en líneas de inspección: preguntas Box y Yes/No sobre imágenes de producto para detectar defectos o elementos ausentes, aprovechando la latencia reducida en GPU Blackwell para inspección en línea.
- Búsqueda y recuperación multimodal: puntuaciones de relevancia (Score) entre una consulta y candidatos, incluidos candidatos con imagen, para reordenar resultados de un motor de búsqueda.
- Evaluación de tareas visuales tipo examen: preguntas Choice cuyas opciones contienen imágenes (comparar una foto con varios grabados), útil en herramientas educativas o de evaluación de modelos.
- Filtrado previo en pipelines de vídeo: Track para seguir un objeto a lo largo de un clip y decidir qué fragmentos requieren análisis más costoso con un modelo mayor.

## Benchmarks y rendimiento

| Benchmark | d3-ultra-NVFP4 | d3-ultra |
|---|---|---|
| Jev Decision Index 0.3 (suite pública) | 70,74 | 71,57 |
| Suite pública de visión | 74,45 | 75,36 |
| Box accuracy a IoU 0,5 | 0,854 | 0,872 |
| Box en recibos | 0,870 | 0,955 |
| Imágenes en preguntas y opciones | 0,949 | 0,952 |
| Tracking success AUC | 0,761 / 0,768 | 0,775 / 0,783 |
| Coincidencia con la respuesta top de d3-ultra (texto) | 97,0% de 272.229 preguntas | referencia |
| Coincidencia con la respuesta top de d3-ultra (visión) | 93,5% de 12.210 preguntas | referencia |
| Latencia mediana, una pregunta de texto, RTX PRO 6000 | 32,5 ms | 63,4 ms |

Desglose del índice de texto: lenguaje, recuperación y herramientas dentro de 0,7 puntos; artes −1,3; conocimiento −2,6 (59,7 frente a 62,3). No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni benchmarks generativos equivalentes.

## Requisitos de hardware

- Requiere FP4 tensor cores: NVIDIA Blackwell. Medido en una NVIDIA RTX PRO 6000 Blackwell.
- Pesos en disco: 17,2 GB (frente a 52,2 GB de d3-ultra); la VRAM necesaria para inferencia no se detalla en la información disponible, aunque debe cubrir pesos, activaciones y el runtime.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (única configuración medida); otras GPU Blackwell compatibles con NVFP4 no están verificadas en la información disponible.
- No es ejecutable en GPU consumer sin soporte FP4 nativo (por ejemplo, generaciones anteriores a Blackwell); no se documenta compatibilidad con llama.cpp, Ollama ni otros runtimes fuera del runtime propio.
- Despliegue mediante el runtime del autor: `load_d3(path, device="cuda:0")` del módulo `d3q.load`, con transformers 5.17.0, compressed-tensors ≥0.19, torch ≥2.11 y, opcionalmente, flash-linear-attention para kernels rápidos de atención lineal.
- Latencia medida: 32,5 ms de mediana por pregunta de texto en una RTX PRO 6000. El throughput agregado no está disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Pesos en disco | Contexto | Índice de decisión | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| d3-ultra-NVFP4 | 26,09B | 17,2 GB | no disponible | 70,74 (texto) / 74,45 (visión) | Apache-2.0 | Hugging Face, runtime propio |
| d3-ultra | 26,09B | 52,2 GB | no disponible | 71,57 (texto) / 75,36 (visión) | Apache-2.0 (según modelo base) | Hugging Face |
| d3-ultra-FP8 | 26,09B | no disponible | no disponible | no disponible | Apache-2.0 (según modelo base) | Hugging Face |
| d3-ultra-INT4 | 26,09B | no disponible | no disponible | no disponible | Apache-2.0 (según modelo base) | Hugging Face |

No se dispone de datos para comparar con modelos de decisión de otros autores.

## Limitaciones y advertencias

- Pérdida de precisión respecto al modelo original: −1,8 puntos en Box a IoU 0,5, concentrada en recibos (0,870 frente a 0,955), y −2,6 puntos en conocimiento dentro del índice de texto. El autor recomienda d3-ultra-FP8 si esos casos son críticos.
- Dependencia de hardware: solo funciona en GPU NVIDIA Blackwell con soporte FP4; no hay alternativa documentada para otras GPU.
- Runtime no estándar: requiere el código propio del modelo (`d3q.load`, `d3_runtime.py`) y versiones concretas de transformers, torch y compressed-tensors; no se documenta integración con vLLM, TGI ni llama.cpp pese al nombre del autor.
- Modelo de decisión, no generativo: no produce texto libre ni razonamiento encadenado; no apto para tareas de generación, agentes o tool calling.
- Idiomas soportados no documentados; el rendimiento fuera del inglés no está verificado.
- Longitud de contexto no documentada; no se puede planificar su uso en entradas largas sin medirla.
- Calibración sin peticiones de vídeo: el comportamiento en tareas de vídeo puede desviarse más de lo medido en otras modalidades.
- Riesgo de calibración deficiente de probabilidades: al ser un modelo que emite probabilidades, conviene validar los umbrales de decisión en el dominio de producción.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Licencia Apache-2.0 permite uso comercial, pero las dependencias (compressed-tensors, transformers, flash-linear-attention) tienen sus propias licencias que deben verificarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vllm-sr/d3-ultra-NVFP4
- Modelo base: https://huggingface.co/vllm-sr/d3-ultra
- Variante FP8: https://huggingface.co/vllm-sr/d3-ultra-FP8
- Variante INT4: https://huggingface.co/vllm-sr/d3-ultra-INT4
- Dataset de calibración: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
