# zeromodels/beit-large-finetuned-ade-640-640

## Resumen

El modelo `zeromodels/beit-large-finetuned-ade-640-640` es una conversión íntegra a Keras 3 del checkpoint original `microsoft/beit-large-finetuned-ade-640-640`, desarrollado por el equipo de ZeroModels. Se trata de un modelo de segmentación semántica basado en BEiT (BERT Pre-Training of Image Transformers), un transformer de visión de la familia ViT con sesgo de posición relativa por capa, escala de capa aprendible en cada rama residual y agrupación media de los tokens de parche. El modelo original fue pre-entrenado de forma auto-supervisada en ImageNet-21k (14 millones de imágenes, 21.841 clases) a resolución 224×224 y posteriormente ajustado en ADE20K (150 clases) a resolución 640×640.

La conversión de ZeroModels permite ejecutar el mismo modelo sin modificaciones sobre TensorFlow, PyTorch y JAX mediante el backend de Keras 3, lo que facilita su integración en entornos heterogéneos. El repositorio incluye pesos en formato compatible con Keras y también es posible cargar los safetensors originales mediante el prefijo `hf:`. Este modelo es relevante para aplicaciones de visión por computador que requieren segmentación semántica de alta resolución con un backbone de gran capacidad, manteniendo la flexibilidad de elegir el framework de ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BEiT large (ViT) con cabeza UPerNet para segmentación semántica |
| Parametros totales | no disponible (el repo ocupa 1,7 GB, lo que sugiere un modelo large, pero no se indica el número exacto) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de visión, no procesa texto) |
| Tipos de cuantizacion | no disponible (no se mencionan cuantizaciones en la información) |
| Idiomas soportados | no disponible (modelo de imágenes, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | Keras 3 (H5/SavedModel) y safetensors originales accesibles con prefijo `hf:` |

## Arquitectura y entrenamiento

BEiT es un transformer de visión que sigue la arquitectura ViT, pero con un pre-entrenamiento auto-supervisado inspirado en BERT: se enmascaran parches de la imagen y el modelo debe reconstruir los tokens visuales discretizados mediante un tokenizador de imagen (dALL-E). El modelo large incluye 24 capas de transformer, una dimensión oculta de 1024 y 16 cabezas de atención, aunque estos detalles no se confirman en la documentación proporcionada. Para la segmentación, se añade una cabeza UPerNet que combina características multiescala y produce mapas de logits a un cuarto de la resolución de entrada.

El proceso de entrenamiento consta de dos fases: primero, pre-entrenamiento auto-supervisado en ImageNet-21k con resolución 224×224; segundo, ajuste fino supervisado en ADE20K con resolución 640×640. La conversión a Keras 3 es una reimplementación pura que carga los pesos originales y los ejecuta de forma idéntica en los tres backends. No se realizan cambios en la arquitectura ni en los pesos, por lo que el comportamiento es equivalente al modelo de Microsoft.

## Capacidades

- Segmentación semántica de imágenes con 150 clases del conjunto ADE20K, incluyendo objetos, escenas y partes de estos.
- Salida de logits a un cuarto de la resolución de entrada, con post-procesado bilineal para obtener el mapa de etiquetas a resolución completa.
- Extracción de características mediante el uso del modelo como backbone, devolviendo secuencias de tokens por bloque.
- Compatibilidad multiplataforma: el mismo código se ejecuta en TensorFlow, PyTorch y JAX gracias a Keras 3.
- Carga de pesos desde Hugging Face tanto en formato Keras como safetensors originales.
- Normalización integrada en el modelo (media 0,5 y desviación 0,5), aceptando píxeles en rango [0, 255] directamente.

## Casos de uso

- Segmentación de escenas urbanas para vehículos autónomos: el modelo puede distinguir carretera, vehículos, peatones y otros elementos de las 150 clases de ADE20K, útil para sistemas de percepción que requieren mapas de etiquetas a alta resolución.
- Análisis de imágenes aéreas o satelitales: permite identificar parcelas, edificios, vegetación y agua, facilitando tareas de planificación territorial o monitorización medioambiental.
- Segmentación de imágenes médicas (si se reentrena con datos específicos): al ser un modelo pre-entrenado de gran capacidad, puede servir como base para ajuste fino en dominios como histopatología o radiología, aunque no incluye clases médicas por defecto.
- Generación de máscaras para edición de imágenes: los mapas de segmentación resultantes pueden utilizarse para separar objetos del fondo y aplicar operaciones como reemplazo de fondo o retoque selectivo.
- Sistemas de realidad aumentada: la segmentación semántica en tiempo real (con la GPU adecuada) permite superponer información virtual sobre objetos detectados en la escena.
- Investigación en visión por computador: como backbone de extracción de características, puede emplearse en tareas de detección de objetos, seguimiento o captación de relaciones entre regiones, gracias a su capacidad de proporcionar representaciones por bloque.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye métricas de rendimiento como mIoU o precisión. Para obtener datos comparativos, se debe consultar la documentación del modelo original de Microsoft o el paper BEiT (arXiv:2106.08254), donde se reportan resultados en ADE20K, aunque no se reproducen aquí por no estar en el material proporcionado.

## Requisitos de hardware

- Tamaño del repositorio: 1,7 GB, lo que sugiere que los pesos del modelo large requieren al menos 1,7 GB de memoria para almacenarlos en precisión flotante (fp32).
- Para inferencia a resolución 640×640, se estima una VRAM mínima de 8-12 GB en fp32, dependiendo del backend y del tamaño de lote. No se dispone de datos exactos.
- Se recomienda una GPU con al menos 16 GB de VRAM para trabajar cómodamente con el modelo completo, como una NVIDIA RTX 3090, RTX 4080 o A100.
- En GPUs de consumo como la RTX 3060 (12 GB) podría caber con cuantización a fp16 o int8, pero no se ofrecen versiones cuantizadas oficiales.
- Opciones de despliegue: al ser un modelo Keras 3, puede ejecutarse con TensorFlow Serving, TorchServe o directamente en Python. También es compatible con la carga de safetensors para usar con frameworks como PyTorch y vLLM (aunque vLLM se centra en modelos de lenguaje, no en visión).
- El procesamiento de la imagen a 640×640 implica una carga computacional considerable; se recomienda usar un lote pequeño (1-2) para aplicaciones en tiempo real.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos de segmentación semántica (como SegFormer, Mask2Former o DeepLabV3). Todos ellos tienen arquitecturas y tamaños diferentes, y no se han encontrado datos de benchmarks en el material proporcionado. Se recomienda consultar el paper original de BEiT para comparaciones con otros métodos de la época.

## Limitaciones y advertencias

- El modelo está ajustado específicamente para las 150 clases de ADE20K; no reconoce clases fuera de ese conjunto y no es directamente utilizable para otros dominios sin reentrenamiento.
- La resolución de entrada fija de 640×640 puede limitar su uso en imágenes de mayor tamaño sin redimensionado, lo que podría degradar el rendimiento en objetos pequeños.
- No se han documentado sesgos específicos, pero al estar entrenado en ImageNet-21k y ADE20K (conjuntos mayoritariamente occidentales), puede presentar sesgos culturales o geográficos en la clasificación de escenas.
- Riesgo de alucinación: en segmentación, el modelo puede generar etiquetas incorrectas en regiones ambiguas o con poca iluminación. No hay mitigaciones documentadas.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe asegurarse de cumplir con las condiciones de los conjuntos de datos originales (ADE20K tiene restricciones de uso para ciertos fines).
- La conversión a Keras 3 es reciente (fecha de creación 2026-08-29) y podría tener errores no detectados; se recomienda validar los resultados frente al modelo original antes de usarlo en producción.

## Enlaces

- [Modelo en Hugging Face (zeromodels)](https://huggingface.co/zeromodels/beit-large-finetuned-ade-640-640)
- [Modelo original de Microsoft](https://huggingface.co/microsoft/beit-large-finetuned-ade-640-640)
- [Paper BEiT (arXiv:2106.08254)](https://arxiv.org/abs/2106.08254)
- [Repositorio GitHub de ZeroModels](https://github.com/IMvision12/ZeroModels)
- [Documentación de BEiT en ZeroModels](https://imvision12.github.io/ZeroModels/beit/)
- [Colección de variantes BEiT en Hugging Face](https://huggingface.co/collections/zeromodels/beit-6a9352067192fd9fcfcfe6f1)
