# zeromodels/beit-base-patch16-224-pt22k-ft22k

## Resumen

BEiT (BERT Pre-Training of Image Transformers) es un modelo de vision por computadora desarrollado por Microsoft Research que traslada el paradigma de pre-entrenamiento de BERT al dominio de las imagenes. Esta variante concreta, publicada por zeromodels, es una conversion a Keras 3 puro del checkpoint original de Microsoft, lo que permite ejecutar el mismo codigo sin modificaciones en TensorFlow, PyTorch o JAX. Se trata de un backbone de tamano base, pre-entrenado de forma auto-supervisada mediante masked image modeling en ImageNet-22k (14 millones de imagenes, 21.841 clases) y posteriormente fine-tuneado en el mismo dataset para clasificacion a resolucion 224x224.

La relevancia de este modelo reside en su doble utilidad: funciona como clasificador de imagenes listo para usar con 21.841 clases y, a la vez, puede emplearse como backbone para extraccion de caracteristicas o como punto de partida para fine-tuning en tareas downstream. La conversion a Keras 3 amplia su accesibilidad al permitir su uso con tres backends de deep learning sin cambios en el codigo, algo poco habitual en el ecosistema de modelos de vision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) con pre-entrenamiento BERT-like (masked image modeling) |
| Parametros totales | aproximadamente 86 millones (tamano base, segun paper arXiv:2106.08254) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 197 tokens (imagen 224x224 dividida en patches de 16x16: 196 patches + token CLS) |
| Tipos de cuantizacion | no disponible (modelo de vision, no requiere cuantizacion tipica de LLM) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | Apache 2.0 |
| Formato de pesos | Keras 3 (zeromodels); safetensors del modelo original via prefijo `hf:` |

## Arquitectura y entrenamiento

BEiT adopta una arquitectura de transformer encoder similar a BERT, aplicada a imagenes. Cada imagen se divide en patches de 16x16 pixeles que se proyectan linealmente a embeddings, anadiendo un token especial de clasificacion. A diferencia de ViT estandar, BEiT incorpora tres innovaciones clave: bias de posicion relativa por capa (similar a T5), layer scale aprendible en cada rama residual y mean pooling de los tokens de patch para la clasificacion final.

El pre-entrenamiento utiliza masked image modeling (MIM): se enmascaran aleatoriamente patches de la imagen y el modelo debe reconstruir los tokens visuales discretizados por un dVAE previamente entrenado, un proceso analogo al masked language modeling de BERT. El modelo se pre-entreno en ImageNet-22k (14 millones de imagenes, 21.841 clases) a resolucion 224x224 y posteriormente se fine-tuneo en el mismo dataset con aumentos como random resized cropping, volteo horizontal y color jittering, con normalizacion RGB de media 0.5 y desviacion 0.5.

## Capacidades

- Clasificacion de imagenes en 21.841 clases de ImageNet-22k directamente desde el checkpoint fine-tuneado.
- Extraccion de caracteristicas por bloques mediante `BeitModel.from_weights(..., as_backbone=True)`, que devuelve las secuencias de tokens por capa para tareas downstream.
- Compatibilidad multiplataforma: el mismo codigo Keras 3 se ejecuta sin cambios en TensorFlow, PyTorch o JAX.
- Normalizacion integrada en el modelo: acepta pixeles crudos en rango [0, 255] sin preprocesado adicional.
- Variantes disponibles en la coleccion zeromodels para segmentacion semantica (fine-tuneadas en ADE20k) y para tamano large.
- Carga de pesos del modelo original de Microsoft mediante el prefijo `hf:` en `from_weights`.

## Casos de uso

- Clasificacion de imagenes en produccion: el modelo puede clasificar imagenes en 21.841 categorias de ImageNet-22k directamente, sin necesidad de fine-tuning, gracias a su checkpoint fine-tuneado. Es adecuado para sistemas de etiquetado automatico de imagenes donde se requiera una cobertura amplia de categorias.
- Extraccion de caracteristicas para transfer learning: usando `as_backbone=True`, se pueden obtener representaciones de tokens por capa para alimentar cabezales personalizados en tareas como deteccion de objetos, recuperacion de imagenes por similitud o clasificacion fine-grained en dominios especificos.
- Backbone para segmentacion semantica: la coleccion zeromodels incluye variantes fine-tuneadas en ADE20k que extienden este mismo backbone a tareas de segmentacion, lo que permite reutilizar el conocimiento aprendido en ImageNet-22k.
- Prototipado rapido multiplataforma: al ser Keras 3 puro, un mismo notebook puede experimentar con backends de TensorFlow, PyTorch o JAX sin cambiar el codigo, util en entornos con restricciones de framework o para comparar rendimiento entre backends.
- Fine-tuning en datasets propios: el checkpoint pre-entrenado y fine-tuneado en ImageNet-22k es un punto de partida solido para adaptar el modelo a dominios especificos con pocas imagenes, gracias a la transferencia de caracteristicas genericas aprendidas en 14 millones de imagenes.
- Investigacion en vision transformers: al ser una implementacion limpia en Keras 3, resulta util para estudiar el comportamiento de bias de posicion relativa, layer scale y mean pooling en arquitecturas ViT, asi como para reproducir experimentos del paper original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamano del repositorio: 0,4 GB, lo que lo hace apto para entornos con recursos limitados.
- VRAM estimada para inferencia: inferior a 2 GB en batch pequeno (1-8 imagenes) con precision float32, dado el tamano de aproximadamente 86 millones de parametros.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1060, RTX 2060, RTX 3060, etc.) es suficiente para inferencia y fine-tuning ligero. No requiere GPUs de datacenter como A100 o H100.
- Ejecucion en CPU: viable para inferencia en batch pequeno, con latencia de decenas de milisegundos por imagen en CPUs modernas.
- Opciones de despliegue: al ser Keras 3, se puede servir con TensorFlow Serving, TorchServe o mediante exportacion a TensorFlow Lite para edge devices. No requiere infraestructura de LLM como vLLM u Ollama.
- Latencia estimada: del orden de 5-15 ms por imagen en GPU moderna (RTX 3090 o superior) y 50-200 ms en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Pre-entrenamiento | Clases | Licencia |
|---|---|---|---|---|---|
| zeromodels/beit-base-patch16-224-pt22k-ft22k | ~86M | 224x224 | MIM en ImageNet-22k + fine-tuning | 21.841 | Apache 2.0 |
| microsoft/beit-base-patch16-224-pt22k | ~86M | 224x224 | MIM en ImageNet-22k (solo pre-entrenado) | no aplica | Apache 2.0 |
| google/vit-base-patch16-224 | ~86M | 224x224 | Supervisado en ImageNet-21k + fine-tuning | 1.000 | Apache 2.0 |
| facebook/deit-base-patch16-224 | ~86M | 224x224 | Supervisado con distillation en ImageNet-1k | 1.000 | Apache 2.0 |

La diferencia principal frente a ViT y DeiT es el pre-entrenamiento mediante masked image modeling en lugar de clasificacion supervisada, lo que en el paper original de BEiT reporta mejoras en tareas de clasificacion y segmentacion con el mismo presupuesto de parametros. Ademas, esta variante de zeromodels ofrece la ventaja de ser Keras 3 puro, mientras que los modelos de Google y Facebook se distribuyen en formatos nativos de PyTorch o JAX.

## Limitaciones y advertencias

- Resolucion fija de entrada de 224x224: las imagenes deben redimensionarse a este tamano, lo que puede degradar la calidad en imagenes de alta resolucion con detalles finos.
- Sesgos del dataset ImageNet-22k: el modelo puede reflejar sesgos presentes en las 21.841 clases de ImageNet, incluyendo posibles sesgos culturales o geograficos en la distribucion de clases.
- Riesgo de errores en clasificacion fine-grained: al trabajar con 21.841 clases, es probable que el modelo confunda categorias visualmente similares (por ejemplo, distintas especies de aves o razas de perro).
- Sin capacidades de deteccion ni segmentacion en esta variante: este checkpoint concreto es solo de clasificacion; para segmentacion hay que usar las variantes fine-tuneadas en ADE20k de la coleccion zeromodels.
- Dependencia de Keras 3: el formato de pesos es especifico de zeromodels; para usar los pesos originales de Microsoft en safetensors hay que emplear el prefijo `hf:` en la carga.
- Sin soporte de vision-language: a diferencia de modelos como CLIP o BLIP, BEiT no procesa texto ni admite busqueda multimodal.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/zeromodels/beit-base-patch16-224-pt22k-ft22k
- Modelo original de Microsoft: https://huggingface.co/microsoft/beit-base-patch16-224-pt22k-ft22k
- Checkpoint pre-entrenado (sin fine-tuning): https://huggingface.co/microsoft/beit-base-patch16-224-pt22k
- Paper original: https://arxiv.org/abs/2106.08254
- Repositorio GitHub de ZeroModels: https://github.com/IMvision12/ZeroModels
- Documentacion de BEiT en ZeroModels: https://imvision12.github.io/ZeroModels/beit/
- Coleccion de variantes BEiT: https://hugging
