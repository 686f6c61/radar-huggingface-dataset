# zeromodels/regnet-y-006

## Resumen

`zeromodels/regnet-y-006` es una conversión pura a Keras 3 del modelo `facebook/regnet-y-006`, un clasificador de imágenes basado en la familia RegNet propuesta por Facebook AI Research en el artículo *Designing Network Design Spaces* (arXiv:2003.13678). La variante Y incorpora bloques Squeeze-and-Excitation (SE) y sigue una regla cuantizada-lineal para definir anchos y profundidades por etapa, lo que da lugar a una red convolucional ligera y eficiente. Este checkpoint concreto, con una complejidad de 0,6 GFLOPs, está pensado para tareas de clasificación de imágenes y como backbone de extracción de características en cuatro escalas.

La relevancia de esta versión radica en que, gracias a la implementación en Keras 3, el mismo código y los mismos pesos pueden ejecutarse sin modificaciones sobre TensorFlow, PyTorch o JAX, lo que facilita la integración en flujos de trabajo heterogéneos. El modelo se distribuye bajo licencia Apache 2.0 y está disponible en Hugging Face, aunque el repositorio no contiene pesos propios: estos se cargan directamente desde el checkpoint original de Facebook.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RegNet-Y (CNN con bloques residuales 1x1 -> 3x3 grouped -> SE -> 1x1, stem 3x3 stride-2, 4 etapas) |
| Parametros totales | no disponible (el checkpoint original de `facebook/regnet-y-006` tiene aproximadamente 6 millones, pero no se indica en la informacion proporcionada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (procesamiento de imagenes) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio no contiene pesos; se cargan desde `facebook/regnet-y-006` via `from_weights`) |

## Arquitectura y entrenamiento

El modelo original fue entrenado en ImageNet-1k para clasificacion de 1000 clases. La arquitectura RegNet-Y se caracteriza por un stem convolucional de 3x3 con stride 2, seguido de cuatro etapas compuestas por bloques residuales de la forma `1x1 -> 3x3 grouped -> SE -> 1x1`. La variante Y anade el bloque Squeeze-and-Excitation, que recalibra los canales de forma adaptativa y mejora la precision con un coste computacional minimo. Los anchos y profundidades de cada etapa siguen una regla cuantizada-lineal derivada de un espacio de diseno obtenido mediante busqueda de arquitecturas neuronales (NAS).

La conversion a Keras 3 no modifica los pesos ni la topologia: se trata de una reimplementacion en el nuevo framework que permite usar el mismo checkpoint en TensorFlow, PyTorch o JAX. La normalizacion de la imagen esta integrada en el modelo (`include_normalization=True`), por lo que se pueden pasar pixeles crudos en el rango [0, 255]. No se ha aplicado ningun ajuste fino adicional sobre el checkpoint original.

## Capacidades

- Clasificacion de imagenes: devuelve logits de 1000 clases de ImageNet.
- Extraccion de caracteristicas multi-escala: como backbone, produce mapas de caracteristicas en strides 4, 8, 16 y 32, util para deteccion de objetos, segmentacion o tareas de vision por computador.
- Soporte multi-backend: el mismo codigo y pesos funcionan en TensorFlow, PyTorch y JAX sin cambios.
- Normalizacion integrada: no requiere preprocesado manual de los pixeles.
- Soporte de formatos de canal `channels_last` y `channels_first` con resultados bit-exactos.
- Ligereza computacional: 0,6 GFLOPs, adecuado para entornos con recursos limitados.

## Casos de uso

- Clasificacion de imagenes en produccion: al ser un modelo pequeno (0,6 GFLOPs), puede desplegarse en servidores CPU o GPUs modestas para clasificar imagenes en tiempo real, por ejemplo en sistemas de moderacion de contenido o catalogacion automatica de productos.
- Backbone para deteccion de objetos: las caracteristicas multi-escala (strides 4, 8, 16, 32) permiten usarlo como extractor de caracteristicas en arquitecturas como Faster R-CNN o YOLO, reduciendo el coste computacional frente a backbones mas pesados.
- Segmentacion semantica: los mapas de caracteristicas de diferentes resoluciones pueden alimentar decodificadores tipo U-Net o FPN para segmentar imagenes medicas o de satelite.
- Extraccion de embeddings visuales: la salida de la ultima etapa puede usarse como vector de caracteristicas para busqueda por similitud, clustering o sistemas de recomendacion visual.
- Prototipado rapido en investigacion: gracias a la compatibilidad con Keras 3, los investigadores pueden experimentar con el mismo modelo en diferentes frameworks sin reescribir codigo, acelerando la validacion de ideas.
- Aplicaciones de edge computing: su pequeno tamano y bajo coste de inferencia lo hacen apto para dispositivos moviles o sistemas embebidos, siempre que se exporte a un formato adecuado (por ejemplo, TensorFlow Lite o ONNX).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El checkpoint original de `facebook/regnet-y-006` reporta una precision top-1 de aproximadamente 75,7 % en ImageNet-1k, pero este dato no aparece en la documentacion de `zeromodels/regnet-y-006` y no debe atribuirse a esta conversion sin verificacion.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de aproximadamente 6 millones de parametros, en FP32 ocupa unos 24 MB de memoria, y en FP16 unos 12 MB. Cabe en cualquier GPU comercial, incluso en las integradas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tambien puede ejecutarse en CPU sin problemas para inferencia por lotes pequenos.
- Compatibilidad con consumer GPU: si, es compatible con RTX 2060, GTX 1660, etc., y con hardware de gama baja.
- Opciones de despliegue: al ser un modelo Keras 3, puede servirse con TensorFlow Serving, TorchServe, o exportarse a ONNX para usar con ONNX Runtime. Tambien es posible integrarlo en pipelines de Python directamente.
- Latencia y throughput: no se proporcionan datos especificos, pero por su tamano se espera una latencia de pocos milisegundos en GPU y decenas de milisegundos en CPU para una imagen de 224x224.

## Comparativa con modelos similares

| Modelo | Parametros | GFLOPs | Precision top-1 (ImageNet) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zeromodels/regnet-y-006 | ~6M (no confirmado) | 0,6 | no disponible | Apache 2.0 | Hugging Face |
| facebook/regnet-y-006 | ~6M | 0,6 | ~75,7 % (segun paper) | Apache 2.0 | Hugging Face |
| facebook/regnet-x-006 | ~6M | 0,6 | ~74,9 % (segun paper) | Apache 2.0 | Hugging Face |
| ResNet-18 | 11,7M | 1,8 | ~69,8 % | BSD-3 | Varios |

La comparativa se basa en datos publicos de los checkpoints originales de Facebook. La conversion de zeromodels no altera los pesos, por lo que el rendimiento deberia ser identico al original, aunque no se han publicado benchmarks especificos de esta version.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado en ImageNet, puede presentar sesgos en clases relacionadas con personas, objetos o escenarios poco representados en el dataset.
- Riesgo de alucinacion: no aplica, al ser un modelo discriminativo de vision y no generativo.
- Limitaciones de contexto o idioma: no aplica, es un modelo de vision sin procesamiento de texto.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero se debe mantener el aviso de copyright y la atribucion.
- Caveat para produccion: el repositorio de zeromodels no contiene pesos; es necesario cargarlos desde el hub de Facebook, lo que requiere conexion a internet en el primer uso o una descarga manual previa.
- La normalizacion integrada asume pixeles en [0, 255]; si se usan otros rangos, los resultados pueden degradarse.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zeromodels/regnet-y-006
- Checkpoint original: https://huggingface.co/facebook/regnet-y-006
- Paper: https://arxiv.org/abs/2003.13678
- Repositorio ZeroModels: https://github.com/IMvision12/ZeroModels
- Documentacion de RegNet en ZeroModels: https://imvision12.github.io/ZeroModels/regnet/
- Coleccion de variantes RegNet: https://huggingface.co/collections/zeromodels/regnet-6a9270a4e723a861ea988d0b
