# yuplpp/fabric-classifier

## Resumen

fabric-classifier es un modelo de clasificación de imágenes especializado en tejidos (fabric), publicado por el usuario yuplpp en Hugging Face. Se trata de un ajuste fino supervisado del ViT-Base preentrenado por Google sobre ImageNet-21k (google/vit-base-patch16-224-in21k), por lo que hereda la arquitectura Vision Transformer estándar: entrada de 224x224 píxeles dividida en parches de 16x16 y 85.827.878 parámetros totales. El modelo resuelve una tarea acotada de visión por computador: asignar una etiqueta de clase textil a una imagen, sin capacidades generativas, de texto ni multimodales.

El interés práctico del modelo es limitado pero concreto: sirve como punto de partida reproducible para pipelines de inspección o catalogación textil, y como ejemplo de ajuste fino con el Trainer de Transformers. Sus resultados publicados son modestos: una precisión (accuracy) de 0,5042 en el conjunto de evaluación del dataset 0x-Jayveersinh-Raj/fabric_classification_dataset, con una pérdida de validación de 1,7256 tras tres épocas de entrenamiento. Ese valor de pérdida sugiere, de forma estimada, un problema de clasificación de aproximadamente 5 o 6 clases (ln(6) ≈ 1,79 sería el valor de una predicción aleatoria), aunque el autor no especifica el número de clases.

La relevancia del modelo es más de plantilla que de rendimiento: la model card está autogenerada por el Trainer, no documenta composición del dataset, split de evaluación, sesgos ni latencia, y acumula cero descargas y cero "likes" en el momento de la consulta. Se publica bajo licencia Apache-2.0, lo que permite uso comercial en los pesos, aunque la licencia del dataset de entrenamiento no está documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base, 12 capas, patch 16, resolución 224x224); preentrenado en ImageNet-21k |
| Parametros totales | 85.827.878 (dato real extraído de los safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en el sentido de texto. Secuencia de entrada: 197 tokens (196 parches de 16x16 más el token CLS) para 224x224 px |
| Tipos de cuantizacion | No documentados. El repositorio solo publica pesos en safetensors; la cuantización a int8 es viable con herramientas estándar, pero el autor no publica variantes cuantizadas |
| Idiomas soportados | No aplica: modelo exclusivamente de visión, no procesa texto. El autor no declara idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers; repositorio marcado como endpoints_compatible) |

Datos adicionales de ficha: identificador `yuplpp/fabric-classifier`, pipeline `image-classification`, tamaño del repositorio 1,0 GB (incluye checkpoints de entrenamiento), creado y actualizado el 30 de septiembre de 2026 según los metadatos del Hub, 0 descargas y 0 likes.

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer base: la imagen de entrada se divide en parches de 16x16 píxeles que se proyectan linealmente y se procesan con mecanismos de autoatención, con un token CLS cuya representación alimenta la cabeza de clasificación. El punto de partida es google/vit-base-patch16-224-in21k, preentrenado de forma autosupervisada sobre ImageNet-21k (14 millones de imágenes, 21.843 clases), lo que proporciona representaciones visuales generales antes del ajuste específico. No se documenta ningún componente adicional: ni decodificación especulativa, ni atención lineal, ni capas MoE, ni adaptadores tipo LoRA.

El ajuste fino se realizó con el Trainer de Transformers sobre el dataset 0x-Jayveersinh-Raj/fabric_classification_dataset (formato arrow). Hiperparámetros declarados: learning rate 5e-5, batch de entrenamiento y evaluación de 32, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-8, scheduler coseno con 109 pasos de calentamiento y 3 épocas completas (1098 pasos totales, es decir, unos 366 pasos por época). No hay indicios de RLHF ni DPO, algo esperable en clasificación de imágenes. A partir de los 366 pasos por época y el batch de 32 puede estimarse un conjunto de entrenamiento de aproximadamente 11.700 imágenes por época, aunque el autor no confirma este dato ni describe la composición, el balance de clases o el split utilizado.

La evolución del entrenamiento muestra una mejora sostenida pero moderada: la pérdida de validación baja de 1,9668 a 1,7256 y la precisión sube de 0,4365 a 0,5042 en tres épocas, con la pérdida de entrenamiento descendiendo más rápido (de 2,0179 a 1,6036), lo que apunta a un sobreajuste leve.

## Capacidades

- Clasificación de imágenes de tejidos o materiales textiles en clases predefinidas por el dataset de ajuste (tarea única de `image-classification`).
- Extracción de representaciones visuales: al ser un ViT-Base, el cuerpo del modelo puede reutilizarse como extractor de características (embeddings de 768 dimensiones) para búsqueda por similitud, clustering o fine-tuning posterior.
- Transferencia a dominios próximos: admite un nuevo ajuste fino con relativamente pocos datos al partir de pesos preentrenados en ImageNet-21k.
- Inferencia por lotes: el pipeline estándar de Transformers procesa múltiples imágenes por llamada.
- Soporte de tool calling / function calling: no aplica. El modelo no genera texto ni produce llamadas a herramientas.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no aplica (sin entrada ni salida de texto).
- Capacidades especiales (modo "thinking", visión generativa, audio, OCR, VQA): no disponibles. Es un clasificador discriminativo, no un modelo generativo multimodal.

## Casos de uso

- Control de calidad en línea de producción textil: una cámara industrial captura muestras de tejido y el modelo asigna la clase correspondiente para detectar desviaciones respecto al lote esperado. Es adecuado por su coste computacional bajo (85,8 M de parámetros) y su capacidad de procesar lotes, aunque la precisión de 0,5042 obliga a fijar umbrales conservadores y a validar con datos propios.
- Precatalogación en comercio electrónico textil: clasificar automáticamente imágenes de producto por tipo de tejido antes de la revisión humana, reduciendo el trabajo de etiquetado manual. El modelo actúa como primer filtro, no como decisión final.
- Triaje en reciclaje textil: separar residuos por tipo de fibra o tejido en plantas de clasificación, usando el modelo como componente de visión en un sistema de cintas transportadoras con verificación humana posterior.
- Extracción de embeddings para búsqueda visual: usar el cuerpo del ViT como extractor de características y construir un índice vectorial para recuperar tejidos visualmente similares. En este caso no se emplea la cabeza de clasificación y no dependen del accuracy reportado.
- Base para un ajuste fino propio: partir de estos pesos (o directamente del modelo base google/vit-base-patch16-224-in21k) y reentrenar con un dataset propio mejor documentado y balanceado para superar la precisión publicada.
- Docencia e investigación en visión por computador: caso de estudio reproducible de ajuste fino con Trainer, útil para comparar hiperparámetros, estrategias de data augmentation y análisis de sobreajuste sobre un ViT-Base.
- Moderación o filtrado de catálogos en marketplaces: descartar o marcar imágenes que no correspondan a la categoría textil declarada, siempre como señal auxiliar dentro de un pipeline con revisión.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (métrica no verificada, `verified: false`):

| Modelo | Conjunto de evaluacion | Metrica | Valor |
|---|---|---|---|
| fabric-classifier | 0x-Jayveersinh-Raj/fabric_classification_dataset (arrow, config default) | Accuracy | 0,5042 |
| fabric-classifier | 0x-Jayveersinh-Raj/fabric_classification_dataset | Perdida (loss) | 1,7256 |

Evolución durante el entrenamiento (datos de la model card):

| Epoca | Paso | Perdida de entrenamiento | Perdida de validacion | Precision |
|---|---|---|---|---|
| 1,0 | 366 | 2,0179 | 1,9668 | 0,4365 |
| 2,0 | 732 | 1,6601 | 1,7640 | 0,4850 |
| 3,0 | 1098 | 1,6036 | 1,7256 | 0,5042 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar, ni comparaciones con otros modelos sobre este mismo dataset.

## Requisitos de hardware

- Pesos en fp32: aproximadamente 343 MB (85.827.878 parámetros x 4 bytes). En fp16/bf16: unos 172 MB. En int8: unos 86 MB.
- VRAM para inferencia: inferior a 1 GB en fp16 con lotes pequeños, sumando activaciones; con 2 GB libres se opera con margen amplio a 224x224.
- GPU recomendadas: cualquier GPU con 4 GB o más, incluidas GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090, así como T4, L4, A10, A100 y H100 (estas últimas muy sobredimensionadas para 85,8 M de parámetros).
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna, e incluso en CPU para lotes pequeños o baja frecuencia de peticiones.
- Opciones de despliegue: pipeline de transformers, exportación a ONNX Runtime o TorchScript, Triton Inference Server, TorchServe, Hugging Face Inference Endpoints (el repositorio está marcado como `endpoints_compatible`) y frameworks de serving genéricos como Ray Serve. vLLM soporta tareas de clasificación, pero resulta innecesario para este tamaño. GGUF, llama.cpp y Ollama no son la vía habitual para un ViT de clasificación.
- Espacio en disco: el repositorio ocupa 1,0 GB porque incluye checkpoints de entrenamiento; solo los pesos finales en safetensors ocupan ~343 MB.
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia ni de imágenes por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Licencia | Disponibilidad | Rendimiento en el dataset del autor |
|---|---|---|---|---|---|
| yuplpp/fabric-classifier | 85,8 M | 224x224, parches de 16 | Apache-2.0 | Público en Hugging Face | Accuracy 0,5042 (no verificada) |
| google/vit-base-patch16-224-in21k (modelo base) | 85,8 M (arquitectura idéntica) | 224x224, parches de 16 | Apache-2.0 | Público en Hugging Face | No disponible |
| google/vit-base-patch16-224 (ajuste sobre ImageNet-1k) | 85,8 M (misma arquitectura) | 224x224, parches de 16 | Apache-2.0 | Público en Hugging Face | No disponible |

No se dispone de resultados de otros clasificadores ViT de tamaño comparable evaluados sobre 0x-Jayveersinh-Raj/fabric_classification_dataset, ni de comparaciones con arquitecturas alternativas (ResNet, EfficientNet, ConvNeXt) en ese mismo conjunto. La comparación cuantitativa con alternativas queda, por tanto, como no disponible.

## Limitaciones y advertencias

- Precisión limitada: 0,5042 de accuracy sobre el conjunto de evaluación. Sin conocer el número de clases ni el reparto del split, no puede afirmarse que supere de forma holgada a una línea base trivial. A partir de la pérdida de validación (1,7256) puede estimarse un problema de unas 5 o 6 clases, pero es una inferencia, no un dato declarado.
- Sobreajuste leve: la pérdida de entrenamiento (1,6036) es inferior a la de validación (1,7256) al final de las tres épocas, con solo 3 épocas de entrenamiento, lo que sugiere margen para más regularización o más datos.
- Documentación insuficiente: la model card está autogenerada y contiene secciones con "More information needed" en descripción, usos previstos, limitaciones y datos de entrenamiento y evaluación. Se desconoce la composición del dataset, el balance de clases, el split y el proceso de etiquetado.
- Riesgo de sesgo no evaluado: no se han publicado análisis de sesgo por tipo de tejido, iluminación, resolución de cámara, color o procedencia geográfica de las imágenes. La robustez ante imágenes fuera de distribución es desconocida.
- Riesgo de alucinación de etiqueta: al ser un clasificador, siempre devuelve una de las clases aprendidas con una probabilidad asociada, incluso ante entradas irrelevantes o de baja calidad. Es imprescindible aplicar umbrales de confianza y un mecanismo de rechazo.
- Licencia: los pesos se publican bajo Apache-2.0, lo que permite uso comercial y modificación. Sin embargo, la licencia del dataset de entrenamiento no está documentada, lo que introduce un riesgo legal para explotación comercial si el conjunto de datos tuviera restricciones.
- Restricciones de ámbito: no procesa texto, no soporta tool calling, agentes, ni entrada multimodal. Cualquier caso de uso que requiera descripción textual de la imagen necesita un modelo adicional.
- Mantenimiento: 0 descargas y 0 likes en el momento de la consulta, sin evidencias de mantenimiento posterior. Los metadatos del Hub muestran fechas de creación y actualización de septiembre de 2026, poco habituales, lo que conviene verificar antes de integrarlo.
- Sesgo de dominio: el ajuste se hizo sobre un único dataset de tejidos; su rendimiento fuera de ese dominio (otras cámaras, otros materiales, otras condiciones de iluminación) no está medido y probablemente sea inferior al reportado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuplpp/fabric-classifier
- Modelo base: https://huggingface.co/google/vit-base-patch16-224-in21k
- Dataset de ajuste: https://huggingface.co/datasets/0x-Jayveersinh-Raj/fabric_classification_dataset
- Space de Trackio asociado: https://huggingface.co/spaces/yuplpp/fabric-classifier-vit-static-7d85ee
- Repositorio de Trackio: https://github.com/gradio-app/trackio
- Paper original de Vision Transformer (An Image is Worth 16x16 Words): https://arxiv.org/abs/2010.11929
