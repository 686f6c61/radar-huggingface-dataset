# tihon-nth/vivit-vit-fc-loss-8-10-epochs-5_class_1_p3_min_0_splited-1792718756.841698

## Resumen

`tihon-nth/vivit-vit-fc-loss-8-10-epochs-5_class_1_p3_min_0_splited-1792718756.841698` es un checkpoint de clasificación de vídeo obtenido por fine-tuning de `google/vivit-b-16x2-kinetics400`, el modelo ViViT (Video Vision Transformer) en su variante base con tubelet espacio-temporal de 16 fotogramas y tamaño 2. Lo publica el usuario `tihon-nth` con la librería `transformers` y licencia MIT. El nombre del repositorio indica una cabeza de clasificación de 5 clases sobre una partición concreta de un dataset (`5_class_1_p3_min_0_splited`), aunque el autor no documenta ni el dataset ni las etiquetas.

El modelo resuelve una tarea acotada: asignar un clip de vídeo a una de cinco categorías. Cuenta con 88.650.245 parámetros (aproximadamente 355 MB en FP32), lo que lo sitúa en el rango de los clasificadores de vídeo ligeros que caben en cualquier GPU consumer. El autor declara en la model card un resultado de 0,9279 de accuracy y 0,1315 de pérdida sobre el conjunto de evaluación, sin especificar su composición ni el protocolo de medida.

Su relevancia es fundamentalmente metodológica: sirve como ejemplo reproducible de fine-tuning de ViViT para pocas clases (se documentan semilla, optimizador, scheduler y 11.000 pasos de entrenamiento) y como posible extractor de características de vídeo. Con 0 descargas y 0 likes en el momento de la consulta, y una model card autogenerada sin revisar, debe tratarse como un experimento personal y no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ViViT (Video Vision Transformer), variante base B/16x2; fine-tune de `google/vivit-b-16x2-kinetics400` |
| Parámetros totales | 88.650.245 |
| Longitud de contexto | No aplica (no es un modelo de lenguaje). Entrada de vídeo: clips de 16 fotogramas según la nomenclatura `16x2` del modelo base; resolución y muestreo temporal no documentados |
| Tipos de cuantización | No documentados por el autor. Al publicarse en safetensors admite FP16/BF16 e int8 dinámico con PyTorch, pero no hay conversiones publicadas ni verificadas |
| Idiomas soportados | No aplica / no disponible: modelo de clasificación de vídeo, sin procesamiento de lenguaje |
| Licencia | MIT |
| Formato de pesos | safetensors (librería `transformers`); no hay GGUF, ONNX ni TorchScript en el repositorio |
| Pipeline | `video-classification` |
| Clases de salida | 5 (etiquetas no documentadas) |
| Dataset de entrenamiento | No disponible ("unknown dataset" en la model card) |
| Tamaño del repositorio | 3,9 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación (metadatos HF) | 2026-10-23 |

## Arquitectura y entrenamiento

La arquitectura es un transformer de visión adaptado a vídeo. ViViT divide el clip en tubos espacio-temporales ("tubelets") que se proyectan linealmente en una secuencia de tokens, añaden embeddings posicionales y procesan la secuencia con un encoder transformer estándar; la clasificación se hace con una cabeza lineal sobre la representación agregada. La variante B/16x2 del checkpoint base implica un tubelet de 2 fotogramas y parche espacial de 16×16 sobre clips de 16 fotogramas, lo que produce una secuencia de tokens notablemente más larga que una imagen suelta y explica que el coste de inferencia sea mayor que el de un ViT de tamaño equivalente. El autor no aporta ninguna innovación propia: es un fine-tuning supervisado del checkpoint de Google preentrenado sobre Kinetics-400 (400 clases de acciones).

Los hiperparámetros declarados son: learning rate 5e-05, batch de entrenamiento y evaluación de 8, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal y 11.000 pasos. Con 1.100 pasos por época implícitos en la tabla de resultados, se deduce un tamaño aproximado de 8.800 clips por época (dato inferido, no declarado). El entrenamiento se detiene en el paso 11.000, que corresponde a la época 9,0992, y no se especifica si hubo selección del mejor checkpoint ni con qué criterio. No hay datos de tokens de entrenamiento, composición del dataset, aumentos de datos ni etapas de RLHF/DPO, que por otra parte no aplican a una tarea de clasificación supervisada. Las versiones de framework declaradas son Transformers 5.18.0, PyTorch 2.14.1+cu126, Datasets 5.0.1 y Tokenizers 0.23.2.

## Capacidades

- Clasificación de clips de vídeo en 5 categorías cerradas, mediante `transformers` pipeline `video-classification`.
- Extracción de embeddings de vídeo: truncando la cabeza de clasificación se puede usar el encoder como extractor de características para búsqueda, clustering o modelos posteriores.
- Inferencia por lotes de clips, adecuada para procesar un catálogo de vídeos en un job offline.
- No soporta tool calling ni function calling: no es un modelo generativo.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües, de audio ni de texto.
- No hay modo "thinking" ni decodificación especulativa.
- No se documenta capacidad zero-shot sobre clases distintas de las 5 aprendidas.

## Casos de uso

- Etiquetado automático de archivos audiovisuales: si las 5 clases del checkpoint coinciden con la taxonomía de una videoteca, se puede clasificar cada clip en un pipeline por lotes y usar las etiquetas para indexar y buscar.
- Detección de eventos en vídeo de vigilancia o industria: el modelo actúa como clasificador de clips cortos que dispara alertas ante una categoría concreta (por ejemplo, presencia de persona en zona restringida), siempre que esa categoría fuese una de las 5 entrenadas.
- Control de calidad en líneas de producción: clasificación de clips de cámara industrial para separar piezas correctas de defectuosas, con la ventaja de que 88,6 M de parámetros permiten inferencia en una GPU de gama media junto al resto del sistema.
- Análisis deportivo o de ejercicio: reconocimiento de acciones o posturas a partir de clips cortos, útil para generar estadísticas de sesión o para revisión de técnica por parte de entrenadores.
- Moderación y triaje de contenido en plataformas pequeñas: primera pasada barata sobre vídeos subidos para separar categorías problemáticas antes de una revisión humana, dado que el coste por clip es bajo frente a un modelo generativo.
- Investigación en visión por computador: punto de partida reproducible para comparar estrategias de fine-tuning de ViViT con pocas clases, gracias a que el autor publica semilla, optimizador, scheduler y curva de validación por época.
- Prototipado de extracción de features: usar el encoder como backbone congelado y entrenar una cabeza ligera sobre un dataset propio, reutilizando los pesos aprendidos en Kinetics-400.

## Benchmarks y rendimiento

El autor no declara resultados en el `model-index` (lista de resultados vacía) ni compara con líneas base. Los únicos datos disponibles son la pérdida y la accuracy sobre el conjunto de evaluación, del que no se especifica tamaño, composición ni procedencia:

| Métrica (conjunto de evaluación no descrito) | Valor |
|---|---|
| Loss | 0,1315 |
| Accuracy | 0,9279 |

Curva de validación declarada durante el entrenamiento:

| Época | Paso | Training loss | Validation loss | Accuracy |
|---|---|---|---|---|
| 0,1001 | 1101 | 0,0982 | 0,1730 | 0,8491 |
| 1,1001 | 2202 | 0,1904 | 0,1343 | 0,8960 |
| 2,1001 | 3303 | 0,0619 | 0,1702 | 0,8810 |
| 3,1001 | 4404 | 0,1067 | 0,1801 | 0,8782 |
| 4,1001 | 5505 | 0,0653 | 0,1065 | 0,9363 |
| 5,1001 | 6606 | 0,0440 | 0,1158 | 0,9260 |
| 6,1001 | 7707 | 0,0503 | 0,1678 | 0,9185 |
| 7,1001 | 8808 | 0,0847 | 0,1297 | 0,9316 |
| 8,1001 | 9909 | 0,0575 | 0,1688 | 0,9157 |
| 9,0992 | 11000 | 0,0341 | 0,1419 | 0,9297 |

Observación: los valores finales de la tabla (loss 0,1419, accuracy 0,9297 en el paso 11.000) no coinciden exactamente con los declarados en el encabezado de la model card (loss 0,1315, accuracy 0,9279), lo que sugiere que la evaluación reportada corresponde a otro momento oa otro subconjunto no especificado. No se han publicado resultados en benchmarks estándar (Kinetics-400, Something-Something, UCF101) en la información disponible.

## Requisitos de hardware

- Pesos: 88,65 M de parámetros equivalen a 354,6 MB en FP32 (formato publicado), 177,3 MB en FP16/BF16 y 88,7 MB en int8. El repositorio ocupa 3,9 GB, muy por encima de los pesos, probablemente por checkpoints intermedios u otros artefactos del entrenamiento.
- VRAM estimada: para lote 1 con 16 fotogramas se estima un pico de 1-2 GB en FP16, dominado por las activaciones de la secuencia de tokens y no por los pesos (estimación calculada, no medida por el autor).
- Lotes grandes: procesar 32 clips simultáneos puede requerir del orden de 10-16 GB de VRAM, por lo que conviene ajustar `batch_size` según la GPU (estimación).
- GPU recomendadas: cualquier GPU con 8 GB o más sirve para inferencia en FP16; RTX 3060/4060 en adelante para lotes pequeños, A10/L4/A100 para procesamiento masivo. También es viable en CPU gracias al tamaño reducido, con latencia mayor y no medida.
- Despliegue: `transformers` con `pipeline("video-classification")` o `AutoModelForVideoClassification`; exportación a ONNX o TorchScript como opción no verificada. vLLM, TGI, llama.cpp y Ollama no aplican porque no es un modelo generativo de texto.
- Latencia y throughput: no disponibles. Dependen del número de fotogramas, la resolución, el tamaño de lote y el hardware, y el autor no publica ninguna medición.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`tihon-nth/...`) | 88,65 M | Clips de 16 fotogramas (nomenclatura 16x2) | 5 clases, dataset no documentado | MIT | Repositorio público con 0 descargas; card autogenerada |
| `google/vivit-b-16x2-kinetics400` | Misma arquitectura (cifra exacta no verificada) | Clips de 16 fotogramas | 400 clases de Kinetics-400 | No verificada en esta ficha | Checkpoint oficial de referencia, ampliamente utilizado |
| `MCG-NJU/videomae-base-finetuned-kinetics` | En torno a 86 M (cifra aproximada, no verificada) | Clips cortos con tubelet 2x16x16 | 400 clases de Kinetics-400 | No verificada en esta ficha (habitualmente marcada como no comercial) | Muy descargado |
| `facebook/timesformer-base-finetuned-k400` | En torno a 121 M (cifra aproximada, no verificada) | Secuencias de parches con atención espacio-temporal dividida | 400 clases de Kinetics-400 | No verificada en esta ficha | Referencia académica habitual |

La comparación de rendimiento con estas alternativas no es posible: este checkpoint resuelve una clasificación de 5 clases sobre un dataset no identificado, por lo que su accuracy de 0,9279 no es trasladable ni comparable con métricas sobre Kinetics-400. La comparación relevante es arquitectónica: misma familia (ViViT-B) que el modelo base, con la única diferencia de la cabeza de clasificación y el dataset de fine-tuning.

## Limitaciones y advertencias

- Dataset y etiquetas desconocidos: la model card indica explícitamente "unknown dataset" y no publica el mapeo de las 5 clases, por lo que el checkpoint es inutilizable tal cual sin conocer el orden de las etiquetas.
- Model card autogenerada y sin revisar: el propio autor deja el comentario de plantilla pidiendo completarla; las secciones de descripción, usos previstos y datos de entrenamiento están vacías.
- Riesgo de sobreajuste: la pérdida de entrenamiento baja a 0,0341 mientras la de validación oscila entre 0,1065 y 0,1801, y la accuracy de validación fluctúa entre 0,8491 y 0,9363 sin tendencia monótona, lo que apunta a un conjunto de validación pequeño o poco representativo.
- Inconsistencia en las métricas: los valores finales de la tabla no coinciden con los del encabezado de la card (0,1419/0,9297 frente a 0,1315/0,9279).
- Sin línea base: no hay comparación con un clasificador trivial, con el modelo base sin fine-tuning ni con modelos similares; una accuracy del 92,8 % puede ser mediocre si el dataset está desbalanceado.
- Sin información de preprocesado: se desconoce el número de fotogramas exacto, la resolución, el muestreo temporal y la normalización empleados, lo que hace probable una degradación silenciosa si se usa otra configuración.
- Riesgo de sesgo no evaluado: al desconocerse el dataset, no se puede valorar el sesgo por demografía, iluminación, tipo de cámara o geografía; los modelos entrenados en Kinetics heredan sesgos de ese corpus.
- Idiomas: no aplica, pero los vídeos con rótulos o textos en pantalla no se interpretan; el modelo solo procesa apariencia visual y movimiento.
- Licencia: el checkpoint se declara MIT, lo que permite uso comercial, pero la licencia y las condiciones del modelo base y del dataset original de Kinetics-400 no se detallan en la información disponible y conviene verificarlas antes de un despliegue comercial.
- Madurez: 0 descargas, 0 likes y ningún tercero que lo haya validado; no hay issues, demos ni integraciones documentadas.
- No apto para tareas generativas: no produce descripciones, no responde a prompts y no puede sustituir a un modelo de lenguaje o multimodal en pipelines conversacionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tihon-nth/vivit-vit-fc-loss-8-10-epochs-5_class_1_p3_min_0_splited-1792718756.841698
- Modelo base: https://huggingface.co/google/vivit-b-16x2-kinetics400
- Variante hermana del mismo autor (5 clases, otra partición): https://huggingface.co/tihon-nth/vivit-vit-fc-loss-8-10-epochs-5_class_2_p3_splited-1788691377.9821992
- Documentación de VisionTransformer en torchvision: https://docs.pytorch.org/vision/main/models/vision_transformer.html
- Implementación de referencia de ViT en `timm`: https://github.com/huggingface/pytorch-image-models/blob/main/timm/models/vision_transformer.py
- Ejemplo de fine-tuning de ViViT (script de entrenamiento de terceros): https://github.com/sanket-poojary-03/Fine-tuning-ViVit/blob/main/training.py
