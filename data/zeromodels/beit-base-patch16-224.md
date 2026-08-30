# zeromodels/beit-base-patch16-224

## Resumen

El modelo `zeromodels/beit-base-patch16-224` es una conversión pura a Keras 3 del checkpoint original `microsoft/beit-base-patch16-224`, desarrollado por el equipo de ZeroModels. Se trata de un modelo de clasificación de imágenes basado en la arquitectura BEiT (BERT Pre-Training of Image Transformers), un vision transformer que emplea un preentrenamiento auto-supervisado mediante enmascarado de parches, similar al enfoque de BERT en NLP. El modelo original fue preentrenado en ImageNet-21k (14 millones de imágenes, 21 841 clases) y ajustado en ImageNet-1k (1 millón de imágenes, 1 000 clases) a una resolución de 224×224 píxeles.

La relevancia de esta conversión radica en que permite ejecutar el mismo modelo de forma idéntica sobre tres backends de Keras 3 (TensorFlow, PyTorch y JAX) sin modificar el código, lo que facilita la portabilidad y la integración en entornos heterogéneos. El checkpoint está pensado para tareas de clasificación de imágenes y también puede utilizarse como backbone para extracción de características o fine-tuning en otras tareas de visión. El tamaño del repositorio es de 0,3 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BEiT (Vision Transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (formato propio de Keras 3) |

## Arquitectura y entrenamiento

BEiT es un transformer de visión que sigue la estructura de ViT, pero con tres innovaciones clave: un sesgo de posición relativa por capa, una escala de capa aprendible en cada rama residual y un agrupamiento medio (mean pooling) de los tokens de parche para la clasificación. El preentrenamiento se realiza mediante enmascarado de parches: se ocultan aleatoriamente algunos parches de la imagen y el modelo debe predecir sus representaciones visuales discretizadas, un enfoque inspirado en el enmascarado de tokens de BERT. El modelo base fue preentrenado en ImageNet-21k y posteriormente ajustado en ImageNet-1k con 1 000 clases. La conversión de ZeroModels mantiene exactamente la misma arquitectura y los mismos pesos, pero reimplementa el modelo en Keras 3, lo que permite cargarlo con `from_weights` y ejecutarlo en cualquier backend compatible.

## Capacidades

- Clasificacion de imagenes: dado un tensor de píxeles de 224×224, devuelve logits sobre 1 000 clases de ImageNet.
- Extraccion de caracteristicas: mediante `BeitModel.from_weights(..., as_backbone=True)` se pueden obtener las secuencias de tokens por bloque, utiles para tareas de vision como deteccion o segmentacion.
- Soporte multi-backend: la misma implementacion funciona en TensorFlow, PyTorch y JAX sin cambios en el codigo.
- Normalizacion integrada: el modelo espera píxeles en rango [0, 255] y aplica la normalizacion internamente, simplificando el preprocesado.
- Compatibilidad con pesos de HuggingFace: se puede cargar el checkpoint original de Microsoft usando el prefijo `hf:` (por ejemplo, `hf:microsoft/beit-base-patch16-224`).
- No incluye capacidades de lenguaje, tool calling ni agentes, al ser exclusivamente un modelo de vision.

## Casos de uso

- Clasificacion de imagenes en produccion: el modelo puede integrarse en pipelines de vision por computador para clasificar fotografias, documentos escaneados o imagenes medicas, gracias a su tamaño reducido y su licencia permisiva.
- Extraccion de caracteristicas para transfer learning: usando `as_backbone=True`, se pueden obtener representaciones de alto nivel para entrenar clasificadores lineales o modelos de deteccion sobre datasets especificos.
- Prototipado rapido en Keras: al ser una implementacion pura de Keras 3, es ideal para experimentar con arquitecturas de vision en entornos que ya usan Keras, sin depender de librerias externas.
- Evaluacion de modelos de vision en multiples backends: permite comparar el rendimiento de la misma arquitectura en TensorFlow, PyTorch y JAX, util para decidir el backend mas adecuado en despliegues concretos.
- Fine-tuning en dominios especificos: el checkpoint preentrenado en ImageNet-21k es un buen punto de partida para ajustar el modelo en tareas de clasificacion con datasets pequeños, como clasificacion de plantas, defectos industriales o tipos de vehiculos.
- Educacion e investigacion: sirve como ejemplo de implementacion de un vision transformer en Keras 3, facilitando el estudio de arquitecturas de atencion y preentrenamiento auto-supervisado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo original de Microsoft reporta una precision top-1 de 83,6 % en ImageNet-1k, pero este dato no aparece en la documentacion de ZeroModels y no se puede confirmar para esta conversion.

## Requisitos de hardware

- No se proporcionan requisitos especificos de VRAM ni de GPU en la informacion disponible.
- Al tratarse de un modelo base de aproximadamente 86 millones de parametros (dato no confirmado en la documentacion), es previsible que pueda ejecutarse en GPUs de consumo como una RTX 3060 o incluso en CPU para inferencia, pero no hay datos oficiales.
- El despliegue puede realizarse mediante el propio codigo de Keras 3, o exportando los pesos a formatos como TensorFlow SavedModel o TorchScript para servidores de inferencia.
- No se mencionan opciones de despliegue con vLLM, llama.cpp u otras herramientas, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa cuantitativa con otros modelos de clasificacion de imagenes. La unica referencia clara es el modelo original `microsoft/beit-base-patch16-224`, del cual esta conversion es una reimplementacion en Keras 3. Otras alternativas como ViT-base o DeiT-base comparten la arquitectura de transformer, pero no se dispone de datos de rendimiento ni de parametros en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo exclusivamente de vision: no soporta tareas de lenguaje, tool calling ni agentes.
- La resolucion de entrada esta fijada en 224×224; no se puede cambiar sin reentrenar o adaptar el modelo.
- Al estar preentrenado en ImageNet, puede heredar sesgos presentes en ese dataset, como sobrerrepresentacion de ciertas categorias o sesgos geograficos y culturales.
- No se han documentado riesgos de alucinacion, al no generar texto.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos de la licencia del modelo original de Microsoft.
- No se garantiza la compatibilidad con versiones anteriores de Keras; se requiere Keras 3 y la libreria `zeromodels`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zeromodels/beit-base-patch16-224
- Modelo original de Microsoft: https://huggingface.co/microsoft/beit-base-patch16-224
- Paper BEiT: https://arxiv.org/abs/2106.08254
- Repositorio ZeroModels: https://github.com/IMvision12/ZeroModels
- Documentacion de BEiT en ZeroModels: https://imvision12.github.io/ZeroModels/beit/
- Coleccion de variantes BEiT: https://huggingface.co/collections/zeromodels/beit-6a9352067192fd9fcfcfe6f1
