# Wojtekb30/LIS1-27B

## Resumen

LIS1-27B (Linguistic Image Segmenter) es un modelo de segmentación de imágenes por referencia (referring image segmentation) y razonamiento visual desarrollado por Wojtekb30. Forma parte de una familia de cinco variantes (0,8B, 2B, 4B, 9B y 27B) construidas sobre la base de Qwen3.5. El modelo resuelve una tarea concreta: dado un enunciado en lenguaje natural —incluidas adivinanzas funcionales del tipo "algo que se puede beber"—, producir máscaras de píxeles y cajas delimitadoras sobre la imagen de entrada.

Su innovación principal es que realiza el razonamiento y la decodificación de la máscara en un único pase forward (single-pass), sin generación autorregresiva de tokens y sin un codificador SAM externo. Aprovecha el Vision Transformer nativo y los estados ocultos del LLM de Qwen3.5 junto con una cabeza de máscara entrenada específicamente. Esto lo diferencia de arquitecturas como LISA, que dependen de generación autoregresiva más un backbone SAM pesado.

El modelo se entrena exclusivamente sobre RefCOCO, RefCOCO+ y RefCOCOg (con un 35 % de aumento sintético de adivinanzas funcionales) y se evalúa zero-shot en ReasonSeg. Con 27B parámetros es la variante de mayor tamaño de la familia y la que obtiene los mejores resultados en el benchmark, con un gIoU global de validación de 54,1 y un cIoU de 54,3, superando a LISA-13B y acercándose a LISA-Llama2-13B (ft).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (Vision Transformer + LLM) con cabeza de máscara no autorregresiva |
| Parametros totales | 27B (modelo base Qwen3.5-27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit y 8-bit (bitsandbytes); bfloat16 completo |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y .pt (PyTorch) |

## Arquitectura y entrenamiento

LIS1 se apoya en el modelo multimodal Qwen3.5, que aporta el Vision Transformer nativo y el LLM subyacente. Sobre esa base se añade una cabeza de máscara entrenada que decodifica píxeles directamente a partir de los estados ocultos del LLM y de las características visuales, sin generar tokens de texto de forma autorregresiva ni recurrir a un codificador SAM independiente. El resultado es un único pase forward que combina razonamiento de sentido común y segmentación a nivel de píxel.

El entrenamiento se realiza en dos etapas. En la primera (noLora, Stage 1) se entrena la cabeza de máscara manteniendo el modelo Qwen3.5 completamente congelado. En la segunda (forLora, Stage 2) se añade un adaptador PEFT LoRA ligero (r=8, alpha=16) aplicado únicamente a las cuatro capas superiores del LLM. Los datos de entrenamiento son exclusivamente RefCOCO, RefCOCO+ y RefCOCOg, con un 35 % de aumento sintético de adivinanzas funcionales; la evaluación en ReasonSeg es zero-shot, sin haber visto imágenes de entrenamiento de ese benchmark. Cada repositorio incluye ambas variantes de checkpoint en formatos .safetensors y .pt.

## Capacidades

- Segmentación de imágenes por referencia a partir de descripciones en lenguaje natural.
- Razonamiento visual de sentido común: resuelve adivinanzas funcionales ("algo que se puede beber") y las traduce en máscaras.
- Decodificación de máscaras a nivel de píxel y cajas delimitadoras en un solo pase forward.
- Procesamiento de múltiples consultas simultáneas sobre una misma imagen (con aislamiento de consultas).
- Puntuación de confianza por consulta (score asociado a cada máscara generada).
- Caché de características visuales para reutilización en consultas sucesivas.
- Soporte de cuantización 4-bit y 8-bit para reducir requisitos de memoria.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Anotación automática de datasets de segmentación: el modelo genera máscaras y cajas a partir de descripciones textuales, lo que permite preetiquetar imágenes de RefCOCO-style y reducir el trabajo manual de anotadores en pipelines de datos.
- Búsqueda visual por descripción funcional: en un catálogo de imágenes, el usuario puede consultar "algo que se puede beber" o "toast" y obtener la región exacta, gracias al razonamiento de sentido común integrado en el pase único.
- Robótica de manipulación guiada por lenguaje: un brazo robótico recibe una instrucción en lenguaje natural y el modelo devuelve la máscara del objeto a agarrar, sin latencia de generación autorregresiva.
- Edición de imágenes asistida: selección automática de regiones (por ejemplo, "red sauce") para aplicar operaciones de recorte, recoloreado o eliminación de fondo en herramientas de edición.
- Moderación y análisis de contenido visual: localización de objetos o sustancias descritas por el operador en imágenes de vigilancia o revisión, con puntuaciones de confianza por detección.
- Accesibilidad: descripción y localización de objetos para usuarios con discapacidad visual, respondiendo a consultas funcionales sobre el contenido de una fotografía.
- Automatización de flujos de visión en producción: al no requerir generación autorregresiva ni un SAM externo, el coste por inferencia es menor y se integra más fácilmente en servicios de segmentación de baja latencia.

## Benchmarks y rendimiento

Resultados en ReasonSeg (zero-shot para LIS1; el resto de métodos según la evaluación del equipo de LISA). gIoU y cIoU en escala 0-100.

| Metodo | Val gIoU | Val cIoU | Test short gIoU | Test short cIoU | Test long gIoU | Test long cIoU | Test overall gIoU | Test overall cIoU |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| LISA-7B | 44,4 | 46,0 | 37,6 | 34,4 | 36,6 | 34,7 | 36,8 | 34,1 |
| LISA-7B (ft) | 52,9 | 54,0 | 40,6 | 40,6 | 49,4 | 51,0 | 47,3 | 48,4 |
| LISA-13B | 48,9 | 46,9 | 39,9 | 43,3 | 46,4 | 46,5 | 44,8 | 45,8 |
| LISA-13B (ft) | 56,2 | 62,9 | 44,3 | 42,0 | 54,0 | 54,3 | 51,7 | 51,1 |
| LISA-Llama2-13B (ft) | 60,0 | 67,8 | 43,9 | 45,8 | 54,0 | 53,8 | 51,5 | 51,3 |
| LIS1-9B noLora | 45,2 | 38,3 | 43,1 | 35,7 | 42,7 | 37,3 | 42,8 | 37,0 |
| LIS1-9B forLora | 45,1 | 40,0 | 40,8 | 33,3 | 44,7 | 40,9 | 43,9 | 39,6 |
| LIS1-27B noLora | 54,1 | 54,3 | 46,9 | 44,0 | 49,9 | 49,8 | 49,3 | 49,0 |
| LIS1-27B forLora | 54,0 | 54,8 | 47,1 | 44,6 | 50,7 | 51,4 | 50,0 | 50,4 |

Según la model card, LIS1 4B y superiores obtuvieron mejores resultados que Ultralytics MobileSAM y YOLOE Open Vocabulary en una evaluación interna. No se detallan más métricas (latencia, throughput) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita en la model card. Para 27B en bfloat16 se requiere aproximadamente 54 GB solo para pesos, más el Vision Transformer y la cabeza de máscara; en 4-bit la huella de pesos se reduce a unos 14-16 GB, aunque el pico real depende de la resolución de imagen y de max_pixels.
- GPU recomendadas: para bfloat16 completo, A100 80 GB o H100; para cuantización 4-bit/8-bit, GPU con 24 GB o más (RTX 4090, L40S, A6000).
- GPU de consumo: en 4-bit puede caber en una RTX 4090 (24 GB) o RTX 3090; en bfloat16 no cabe en GPU de consumo.
- Opciones de despliegue: el repositorio proporciona scripts propios (`LIS1ModelCode.py`, `lis1_infer.py`, `example.py`) sobre transformers, peft, safetensors y bitsandbytes. No se menciona soporte explícito de vLLM, llama.cpp, Ollama ni TGI.
- Aceleración opcional: `causal-conv1d` y `flash-linear-attention` para kernels de atención lineal de Qwen3.5 en CUDA.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Contexto | ReasonSeg test overall gIoU | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LIS1-27B | 27B | Single-pass, sin SAM externo | no disponible | 50,0 (forLora) | apache-2.0 | Hugging Face |
| LISA-13B (ft) | 13B | Autorregresivo + SAM | no disponible | 51,7 | no disponible en la información | Hugging Face / GitHub |
| LISA-Llama2-13B (ft) | 13B | Autorregresivo + SAM | no disponible | 51,5 | no disponible en la información | Hugging Face / GitHub |
| LIS1-9B | 9B | Single-pass, sin SAM externo | no disponible | 43,9 (forLora) | apache-2.0 | Hugging Face |

LIS1-27B se sitúa en rendimiento cercano a LISA-13B (ft) y LISA-Llama2-13B (ft) en el conjunto de test global, con la ventaja de no requerir generación autorregresiva ni un backbone SAM separado, y con licencia Apache 2.0 explícita.

## Limitaciones y advertencias

- Idiomas: el modelo solo declara soporte de inglés; las consultas en castellano no están garantizadas.
- Entrenamiento limitado a RefCOCO/RefCOCO+/RefCOCOg: la generalización a dominios visuales muy distintos (imágenes médicas, satelitales, etc.) no está validada.
- Evaluación zero-shot en ReasonSeg: los resultados reflejan ese régimen; no se han publicado métricas en otros benchmarks de segmentación.
- Riesgo de alucinación: al tratarse de un modelo de segmentación, el fallo se manifiesta como máscaras sobre regiones incorrectas o puntuaciones de confianza infladas; conviene aplicar umbrales y validación posterior.
- Sesgos: no se documentan análisis de sesgo en la model card; al derivar de Qwen3.5 y RefCOCO, puede heredar sesgos de esos datos.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.5 subyacente, que no se detalla en la información disponible.
- Dependencia de scripts propios: la inferencia requiere `LIS1ModelCode.py` y `lis1_infer.py` en el directorio de trabajo; no hay integración documentada con servidores de inferencia estándar.
- Repositorio de 0,1 GB: los pesos completos del modelo base Qwen3.5-27B no parecen incluirse en el repo, por lo que es necesario descargarlos por separado.
- Sin descargas ni likes en Hugging Face en el momento de la consulta: ecosistema de validación externa muy limitado.

## Enlaces

- Hugging Face: https://huggingface.co/Wojtekb30/LIS1-27B
- Dataset de entrenamiento: https://huggingface.co/datasets/Wojtekb30/ref_coco_lichengunc
- ReasonSeg validation split: https://huggingface.co/datasets/Ricky06662/ReasonSeg_val
- ReasonSeg test split: https://huggingface.co/datasets/Ricky06662/ReasonSeg_test
- Repositorio LISA (resultados comparativos): https://github.com/JIA-Lab-research/LISA
- Tabla de resultados de LISA: https://github.com/JIA-Lab-research/LISA/blob/main/imgs/table1.jpg
