# Wojtekb30/LIS1-2B

## Resumen

LIS1 (Linguistic Image Segmenter) es una familia de modelos de segmentación de imágenes por referencia (*referring image segmentation*) desarrollada por Wojtekb30. A diferencia de aproximaciones como LISA, que generan tokens de texto de forma autorregresiva y dependen de un codificador SAM externo, LIS1 realiza el razonamiento visual y la decodificación de máscaras a nivel de píxel en un único paso hacia delante (*single forward pass*), sin generación autorregresiva de tokens y sin encoder SAM adicional. La familia se construye sobre Qwen3.5 en cinco tamaños: 0.8B, 2B, 4B, 9B y 27B.

El modelo aquí descrito, LIS1-2B, es la variante de 2.000 millones de parámetros. Combina el Vision Transformer nativo de Qwen3.5 con los estados ocultos del LLM para producir máscaras directamente, lo que reduce la latencia frente a pipelines de razonamiento segmentado en dos etapas. Está entrenado exclusivamente sobre RefCOCO, RefCOCO+ y RefCOCOg (con un 35 % de aumento sintético de acertijos funcionales) y evaluado zero-shot en ReasonSeg.

Su relevancia radica en la eficiencia: obtiene resultados competitivos frente a LISA-7B en algunas métricas de ReasonSeg pese a tener un tercio de los parámetros y evitar por completo la decodificación autorregresiva. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5: Vision Transformer + LLM) con cabeza de máscaras; decodificación no autorregresiva en un solo paso |
| Parametros totales | 2B (variante LIS1-2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit y 8-bit (bitsandbytes); bfloat16 completo |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y .pt (checkpoints `noLora` y `forLora`); adaptador LoRA PEFT separado |

## Arquitectura y entrenamiento

LIS1 se apoya en Qwen3.5, que aporta un Vision Transformer nativo y un LLM con atención lineal (soporte opcional de kernels `causal-conv1d` y `flash-linear-attention` en CUDA). Sobre esa base se añade una cabeza de máscaras que consume los estados ocultos del LLM y produce máscaras de segmentación directamente, sin generar tokens de texto intermedios. Esto elimina la necesidad de un encoder SAM pesado y de la decodificación autorregresiva típica de LISA.

El entrenamiento se realizó exclusivamente sobre el dataset RefCOCO de lichengunc (RefCOCO, RefCOCO+, RefCOCOg) con un 35 % de aumento sintético de acertijos funcionales. Hay dos etapas: `noLora` (Stage 1), donde se entrena la cabeza de máscaras con el modelo Qwen3.5 base completamente congelado, y `forLora` (Stage 2), donde se entrena la cabeza más un adaptador LoRA ligero (r=8, alpha=16) aplicado solo a las 4 capas superiores del LLM. La evaluación en ReasonSeg es zero-shot, sin ver imágenes de entrenamiento de ese benchmark.

## Capacidades

- Segmentación de imágenes por referencia a partir de lenguaje natural (nombres de objetos directos).
- Razonamiento de sentido común y resolución de acertijos funcionales para localizar objetos (por ejemplo, "algo que puedas beber").
- Decodificación de máscaras a nivel de píxel en un único paso hacia delante, sin generación autorregresiva de tokens.
- Procesamiento de múltiples consultas simultáneas sobre una misma imagen, con aislamiento de consultas (`isolate_queries`).
- Salida de cajas delimitadoras y máscaras renderizadas con puntuaciones de confianza.
- Caché de visión (`cache_vision`) para reutilizar características visuales entre consultas.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en formato de agente.

## Casos de uso

- Segmentación interactiva en herramientas de edición de imagen: el usuario escribe "la taza roja" o "algo para sentarse" y el modelo devuelve la máscara en un solo paso, lo que permite una experiencia de baja latencia en interfaces de anotación o retoque.
- Anotación automática de datasets: generar máscaras de referencia sobre imágenes de RefCOCO-style para preetiquetar corpus de visión por computador, reduciendo el coste de anotación manual.
- Robótica y manipulación guiada por lenguaje: localizar objetos descritos funcionalmente ("el utensilio para cortar") para tareas de pick-and-place, aprovechando el razonamiento de acertijos sin pipeline de dos etapas.
- Asistentes de accesibilidad: describir y resaltar regiones de una imagen a partir de instrucciones verbales, con máscaras precisas para personas con discapacidad visual.
- Análisis de imágenes en comercio electrónico: segmentar productos a partir de descripciones funcionales o de atributos ("la prenda que se lleva en la cabeza") para catalogación automática.
- Moderación y análisis de contenido visual: aislar regiones descritas por lenguaje natural para revisión posterior, con soporte de múltiples consultas por imagen en una sola pasada.
- Investigación en segmentación zero-shot: servir como baseline ligero (2B) para experimentos de referring segmentation sin depender de SAM ni de decodificación autorregresiva.

## Benchmarks y rendimiento

Resultados en ReasonSeg (zero-shot). gIoU y cIoU expresados en porcentaje.

| Metodo | Val overall gIoU | Val overall cIoU | Test short gIoU | Test short cIoU | Test long gIoU | Test long cIoU | Test overall gIoU | Test overall cIoU |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| LISA-7B | 44.4 | 46.0 | 37.6 | 34.4 | 36.6 | 34.7 | 36.8 | 34.1 |
| LISA-7B (ft) | 52.9 | 54.0 | 40.6 | 40.6 | 49.4 | 51.0 | 47.3 | 48.4 |
| LISA-13B (ft) | 56.2 | 62.9 | 44.3 | 42.0 | 54.0 | 54.3 | 51.7 | 51.1 |
| LIS1-0.8B noLora | 31.7 | 32.5 | 28.6 | 23.7 | 27.3 | 30.6 | 27.5 | 29.6 |
| LIS1-0.8B forLora | 32.4 | 31.7 | 30.4 | 23.9 | 29.1 | 29.6 | 29.4 | 28.6 |
| LIS1-2B noLora | 37.4 | 33.1 | 35.1 | 27.2 | 34.5 | 33.6 | 34.6 | 32.6 |
| LIS1-2B forLora | 37.5 | 33.1 | 35.5 | 27.1 | 34.6 | 34.3 | 34.8 | 33.1 |
| LIS1-4B noLora | 42.3 | 38.3 | 39.9 | 29.9 | 43.5 | 40.5 | 42.8 | 38.7 |
| LIS1-9B forLora | 45.1 | 40.0 | 40.8 | 33.3 | 44.7 | 40.9 | 43.9 | 39.6 |
| LIS1-27B forLora | 54.0 | 54.8 | 47.1 | 44.6 | 50.7 | 51.4 | 50.0 | 50.4 |

El autor indica además que LIS1 4B y superiores obtuvieron mejores resultados que Ultralytics MobileSAM y YOLOE Open Vocabulary en evaluación interna (sin cifras publicadas en la model card).

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, aproximadamente 4-5 GB para el modelo base de 2B más la cabeza de máscaras y el adaptador LoRA; en 4-bit, alrededor de 1,5-2,5 GB; en 8-bit, en torno a 3 GB. Estimaciones orientativas, no publicadas por el autor.
- GPU recomendadas: RTX 4090, A100, H100 para bfloat16 con throughput alto; RTX 3090/4080 y GPUs consumer de 8 GB o más para cuantización 4-bit.
- Cabe en GPU consumer: sí, en 4-bit y 8-bit en tarjetas de 8 GB o más; en bfloat16 completo conviene 8-12 GB.
- Opciones de despliegue: script propio `lis1_infer.py` con `transformers`, `peft`, `safetensors`, `bitsandbytes` y `accelerate`, más kernels opcionales `causal-conv1d` y `flash-linear-attention` en CUDA. No se documenta soporte nativo de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; el diseño de un solo paso hacia delante sin decodificación autorregresiva reduce la latencia frente a LISA, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ReasonSeg test overall gIoU / cIoU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LIS1-2B (forLora) | 2B | no disponible | 34.8 / 33.1 | Apache 2.0 | Hugging Face (Wojtekb30) |
| LISA-7B | 7B | no disponible | 36.8 / 34.1 (zero-shot); 47.3 / 48.4 (ft) | no disponible en la información | GitHub JIA-Lab-research/LISA |
| LISA-13B | 13B | no disponible | 44.8 / 45.8 (zero-shot); 51.7 / 51.1 (ft) | no disponible en la información | GitHub JIA-Lab-research/LISA |
| LIS1-27B (forLora) | 27B | no disponible | 50.0 / 50.4 | Apache 2.0 | Hugging Face (Wojtekb30) |

LIS1-2B se queda por debajo de LISA-7B en precisión, pero con un tercio de parámetros, sin encoder SAM y sin decodificación autorregresiva, lo que lo sitúa como opción de bajo coste y baja latencia. Para máxima precisión dentro de la familia, LIS1-27B se acerca a LISA-13B fine-tuned.

## Limitaciones y advertencias

- Entrenado exclusivamente en inglés; el rendimiento en otros idiomas no está evaluado y probablemente sea deficiente.
- Entrenado solo sobre RefCOCO/RefCOCO+/RefCOCOg con aumento sintético; puede generalizar peor a dominios visuales muy distintos (médico, satelital, industrial).
- Riesgo de alucinación en el razonamiento de acertijos funcionales: descripciones ambiguas pueden producir máscaras incorrectas con puntuaciones de confianza altas.
- Resultados en ReasonSeg zero-shot notablemente inferiores a LISA fine-tuned; no usar como sustituto directo en producción de alta precisión sin validación propia.
- Sin datos publicados sobre sesgos demográficos, geográficos o culturales.
- Requiere el modelo base Qwen3.5 correspondiente, que debe descargarse por separado; el repositorio LIS1 solo contiene la cabeza de máscaras y el adaptador LoRA (tamaño del repo: 0,1 GB).
- Dependencia de scripts propios (`LIS1ModelCode.py`, `lis1_infer.py`) y de versiones concretas de `transformers`/`peft`; no hay integración estándar en frameworks de serving.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3.5 subyacente antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Wojtekb30/LIS1-2B
- Dataset de entrenamiento: https://huggingface.co/datasets/Wojtekb30/ref_coco_lichengunc
- Split de validación ReasonSeg: https://huggingface.co/datasets/Ricky06662/ReasonSeg_val
- Split de test ReasonSeg: https://huggingface.co/datasets/Ricky06662/ReasonSeg_test
- Repositorio LISA (resultados de referencia): https://github.com/JIA-Lab-research/LISA
- Tabla de resultados de LISA: https://github.com/JIA-Lab-research/LISA/blob/main/imgs/table1.jpg
