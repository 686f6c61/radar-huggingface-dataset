# Wojtekb30/LIS1-4B

## Resumen

LIS1-4B (Linguistic Image Segmenter 4B) es un modelo de segmentación de imágenes por referencia (referring image segmentation) y razonamiento visual desarrollado por Wojtekb30. Se construye sobre el modelo base Qwen3.5 de 4B parámetros y añade una cabeza de máscaras entrenada específicamente para producir máscaras a nivel de píxel a partir de consultas en lenguaje natural, incluidas consultas funcionales o adivinanzas ("something you can drink"). Forma parte de una familia que cubre los tamaños 0.8B, 2B, 4B, 9B y 27B.

La innovación principal frente a propuestas como LISA es que LIS1 realiza el razonamiento y la decodificación de la máscara en un único forward pass, sin generación autorregresiva de tokens y sin un codificador SAM externo. Aprovecha el Vision Transformer nativo de Qwen3.5 y los estados ocultos del LLM para producir directamente las máscaras, lo que reduce la latencia y simplifica el despliegue al eliminar el backbone pesado de segmentación.

El modelo se entrenó exclusivamente sobre el dataset RefCOCO (RefCOCO, RefCOCO+ y RefCOCOg) con un 35 % de aumento sintético de adivinanzas funcionales, y se evaluó zero-shot en ReasonSeg. La versión 4B se sitúa en un punto intermedio de la familia: supera a LIS1-0.8B y LIS1-2B en gIoU/cIoU y se acerca a LIS1-9B, con un coste computacional notablemente menor que el modelo de 27B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5 base + cabeza de máscaras LIS1, atención lineal en Qwen3.5) |
| Parámetros totales | 4B (modelo base Qwen3.5-4B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit y 8-bit (bitsandbytes); bfloat16 completo |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y .pt (checkpoints `noLora` y `forLora`); adaptador LoRA PEFT separado |

## Arquitectura y entrenamiento

LIS1 combina el modelo base Qwen3.5-4B (con su Vision Transformer nativo y mecanismos de atención lineal) con una cabeza de máscaras entrenada que consume los estados ocultos del LLM y produce máscaras a nivel de píxel en un único forward pass. No hay generación autorregresiva de tokens ni codificador SAM externo, a diferencia de LISA. El pipeline incluye utilidades propias (`LIS1ModelCode.py`, `lis1_infer.py`) y soporta kernels acelerados en CUDA (`causal-conv1d`, `flash-linear-attention`).

El entrenamiento se realizó exclusivamente sobre el dataset RefCOCO de lichengunc (RefCOCO, RefCOCO+ y RefCOCOg) con un 35 % de aumento sintético de adivinanzas funcionales. Se publican dos variantes por tamaño: `noLora` (etapa 1, cabeza de máscaras entrenada con el modelo Qwen3.5 congelado) y `forLora` (etapa 2, cabeza de máscaras más un adaptador LoRA PEFT con `r=8` y `alpha=16` aplicado solo a las 4 capas superiores del LLM). La evaluación en ReasonSeg es zero-shot, sin haber visto imágenes de entrenamiento de ese benchmark.

## Capacidades

- Segmentación de imágenes por referencia a partir de consultas en lenguaje natural.
- Razonamiento visual de sentido común y resolución de adivinanzas funcionales (por ejemplo, "something you can drink").
- Decodificación de máscaras a nivel de píxel en un único forward pass, sin generación autorregresiva.
- Soporte de múltiples consultas simultáneas por imagen con aislamiento entre consultas (`isolate_queries=True`).
- Puntuación de confianza por máscara (scores observados entre 0.75 y 0.88 en el ejemplo de la model card).
- Caché de características visuales (`cache_vision=True`) para reutilizar la codificación de la imagen entre consultas.
- Cuantización 4-bit y 8-bit para reducir requisitos de memoria.
- Capacidades multilingües: solo inglés declarado.

## Casos de uso

- Anotación automática de datasets de segmentación: el modelo puede generar máscaras a partir de descripciones textuales sobre imágenes no etiquetadas, reduciendo el coste de anotación manual en pipelines de visión por computador.
- Robótica de manipulación guiada por lenguaje: un operador indica "coge la taza roja" o "el objeto que sirve para beber" y el modelo devuelve la máscara del objeto para que el sistema de agarre planifique la acción, gracias al razonamiento funcional sobre adivinanzas.
- Edición de imágenes asistida por texto: integrado en herramientas de retoque, permite seleccionar regiones mediante descripciones funcionales en lugar de coordenadas, con máscaras de píxel precisas.
- Análisis de escenas para accesibilidad: descripción y localización de objetos relevantes en imágenes para sistemas de asistencia visual, con consultas en lenguaje natural.
- Moderación y análisis de contenido visual: localización de elementos concretos (por ejemplo, "red sauce" o "something you can drink") en imágenes para revisiones automatizadas.
- Investigación en razonamiento visual: banco de pruebas para estudiar segmentación zero-shot en ReasonSeg con un modelo no autorregresivo y sin backbone SAM, útil para comparar arquitecturas de un solo paso frente a pipelines en dos etapas.
- Preprocesado en pipelines de visión industrial: segmentación de componentes descritos por el operador en lenguaje natural para control de calidad, con la ventaja de un único forward pass y menor latencia.

## Benchmarks y rendimiento

Resultados en ReasonSeg (zero-shot), extraídos de la model card. gIoU y cIoU en porcentaje.

| Método | Val overall gIoU | Val overall cIoU | Test short gIoU | Test short cIoU | Test long gIoU | Test long cIoU | Test overall gIoU | Test overall cIoU |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| LISA-7B | 44.4 | 46.0 | 37.6 | 34.4 | 36.6 | 34.7 | 36.8 | 34.1 |
| LISA-7B (ft) | 52.9 | 54.0 | 40.6 | 40.6 | 49.4 | 51.0 | 47.3 | 48.4 |
| LISA-13B (ft) | 56.2 | 62.9 | 44.3 | 42.0 | 54.0 | 54.3 | 51.7 | 51.1 |
| LIS1-4B noLora | 42.3 | 38.3 | 39.9 | 29.9 | 43.5 | 40.5 | 42.8 | 38.7 |
| LIS1-4B forLora | 43.5 | 39.6 | 40.1 | 29.7 | 42.9 | 39.2 | 42.4 | 37.7 |
| LIS1-9B forLora | 45.1 | 40.0 | 40.8 | 33.3 | 44.7 | 40.9 | 43.9 | 39.6 |
| LIS1-27B forLora | 54.0 | 54.8 | 47.1 | 44.6 | 50.7 | 51.4 | 50.0 | 50.4 |

Según la model card, LIS1 4B y superiores obtuvieron mejores resultados que Ultralytics MobileSAM y YOLOE Open Vocabulary en una evaluación interna (sin cifras publicadas). Los resultados de LISA y de los métodos comparativos provienen de la tabla publicada por el equipo de LISA.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada; depende de la cuantización (4-bit, 8-bit o bfloat16) y del tamaño del modelo base Qwen3.5-4B.
- GPU recomendadas: no disponible. El código de ejemplo usa `device="cuda"` y soporta kernels CUDA opcionales (`causal-conv1d`, `flash-linear-attention`).
- ¿Cabe en GPU de consumo? No disponible como dato confirmado; la cuantización 4-bit y 8-bit vía bitsandbytes está soportada, lo que reduce los requisitos de memoria.
- Opciones de despliegue: script propio `lis1_infer.py` con `LIS1Inferencer`; dependencias `transformers`, `peft`, `safetensors`, `pillow`, `opencv-python`, `numpy`, `pyarrow`, `torch`, `torchvision`; opcionales `bitsandbytes`, `accelerate`, `causal-conv1d`, `flash-linear-attention`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card destaca la ventaja de un único forward pass sin generación autorregresiva, pero no publica cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LIS1-4B | 4B | no disponible | Un solo forward pass, sin SAM, sin autorregresión | Apache 2.0 | Hugging Face (Wojtekb30/LIS1-4B) |
| LISA-7B | 7B | no disponible | Autorregresivo + backbone SAM | no disponible en la información | Hugging Face / GitHub (JIA-Lab-research) |
| LISA-13B | 13B | no disponible | Autorregresivo + backbone SAM | no disponible en la información | Hugging Face / GitHub (JIA-Lab-research) |
| LIS1-9B | 9B | no disponible | Un solo forward pass, sin SAM | Apache 2.0 | Hugging Face (familia LIS1) |

En ReasonSeg, LIS1-4B forLora alcanza 43.5 gIoU en validación, por debajo de LISA-7B (44.4) y LISA-7B ft (52.9), pero con un modelo más pequeño y sin backbone SAM. LIS1-9B forLora (45.1 val gIoU) se acerca a LISA-7B, y LIS1-27B forLora (54.0 val gIoU) supera a LISA-7B ft y se aproxima a LISA-13B ft (56.2).

## Limitaciones y advertencias

- Entrenado exclusivamente sobre RefCOCO con aumento sintético de adivinanzas; el rendimiento en dominios fuera de esa distribución puede degradarse.
- Evaluación zero-shot en ReasonSeg: los resultados en validación y test son inferiores a LISA-7B y LISA-13B en la mayoría de métricas, especialmente en consultas cortas.
- Solo idioma inglés declarado; no se garantiza soporte multilingüe.
- Riesgo de alucinación en el razonamiento funcional: una adivinanza puede resolverse a un objeto incorrecto con una puntuación de confianza alta; se recomienda umbral de confianza (`threshold`) y validación humana en producción.
- Sesgos heredados del dataset RefCOCO y del modelo base Qwen3.5, no documentados en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5 puede tener sus propias condiciones que deben verificarse por separado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; ecosistema y soporte comunitario limitados.
- Dependencia de código propio (`LIS1ModelCode.py`, `lis1_infer.py`) no empaquetado como librería estándar; requiere copiar archivos al directorio de trabajo.
- No se publican cifras de latencia, throughput ni VRAM, lo que dificulta la planificación de capacidad en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Wojtekb30/LIS1-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/Wojtekb30/ref_coco_lichengunc
- Split de validación ReasonSeg: https://huggingface.co/datasets/Ricky06662/ReasonSeg_val
- Split de test ReasonSeg: https://huggingface.co/datasets/Ricky06662/ReasonSeg_test
- Repositorio LISA (resultados comparativos): https://github.com/JIA-Lab-research/LISA
- Tabla de resultados de LISA: https://github.com/JIA-Lab-research/LISA/blob/main/imgs/table1.jpg
