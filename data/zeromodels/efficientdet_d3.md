# zeromodels/efficientdet_d3

## Resumen

EfficientDet-D3 es un detector de objetos de una sola etapa, basado en anclas, desarrollado originalmente por Google Brain (Tan, Pang y Le) y publicado en el paper "EfficientDet: Scalable and Efficient Object Detection" (arXiv:1911.09070). Esta versión concreta, `zeromodels/efficientdet_d3`, es una conversión pura a Keras 3 del checkpoint original de Google AutoML, lo que permite ejecutarla sin modificaciones sobre TensorFlow, PyTorch o JAX. El modelo combina un backbone EfficientNet-B3 con una red piramidal bidireccional ponderada (BiFPN) y cabezales compartidos de clasificación y regresión de cajas, procesando imágenes a 896x896 píxeles y detectando las 90 categorías del dataset COCO.

La relevancia de esta conversión radica en su portabilidad: al estar implementada en Keras 3, los desarrolladores pueden elegir el backend de su preferencia sin cambiar el código de inferencia. Además, los pesos son independientes de la resolución, lo que permite ajustar el tamaño de entrada (múltiplos de 128) según las necesidades de latencia o precisión. El repositorio tiene un tamaño de 0.1 GB y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y académico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientDet-D3 (backbone EfficientNet-B3 + BiFPN + cabezales compartidos) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen 896x896) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (cargados via `from_weights` en Keras 3) |

## Arquitectura y entrenamiento

EfficientDet-D3 pertenece a la familia EfficientDet, que emplea un escalado compuesto para equilibrar resolución, profundidad y anchura. El backbone EfficientNet-B3 extrae características multiescala que se fusionan mediante una red BiFPN con pesos aprendibles por entrada. Sobre cada nivel de la pirámide se aplican una cabeza de clasificación y una de regresión de cajas compartidas, y las detecciones finales se obtienen tras decodificar las anclas y aplicar NMS (por defecto, agnóstico de clase). El modelo original fue entrenado en el dataset COCO con 90 categorías, aunque esta conversión no incluye el proceso de entrenamiento, solo los pesos preentrenados.

La implementación de ZeroModels reproduce fielmente la arquitectura original de Google AutoML, pero en Keras 3, lo que permite ejecutarla sobre TensorFlow, PyTorch o JAX sin cambios en el código. No se han documentado innovaciones adicionales más allá de la propia conversión; el checkpoint es idéntico al original en cuanto a pesos y comportamiento.

## Capacidades

- Deteccion de objetos en las 90 categorias de COCO (personas, vehiculos, animales, objetos cotidianos, etc.).
- Soporte de multiples backends de Keras 3: TensorFlow, PyTorch y JAX, seleccionables mediante la variable de entorno `KERAS_BACKEND`.
- Resolucion de entrada ajustable: los pesos son independientes de la resolucion, por lo que se puede especificar un tamaño de imagen multiplo de 128 (por ejemplo, 512, 640, 896) para adaptar el equilibrio entre precision y velocidad.
- NMS configurable: por defecto agnostico de clase (una caja por objeto), pero se puede activar NMS por clase con `class_agnostic=False`.
- Acceso a las salidas crudas por nivel (sin decodificacion) mediante `EfficientDetModel`, util para integraciones personalizadas.
- Interfaz simple de carga: `from_weights` acepta cualquier repositorio de HuggingFace con formato zeromodels.

## Casos de uso

- Inspeccion de calidad en manufactura: el modelo puede detectar defectos o piezas anomalas en lineas de produccion a partir de imagenes de camaras industriales. Su resolucion de 896x896 permite captar detalles finos, y la licencia Apache 2.0 facilita su integracion en sistemas propietarios.
- Deteccion de vacios en imagenes de radar de penetracion terrestre (GPR): como demuestra el articulo de MDPI, EfficientDet-D3 es viable para localizar oquedades en el subsuelo, ayudando en la evaluacion de infraestructuras sin metodos invasivos.
- Vigilancia y seguridad perimetral: al detectar personas, vehiculos u otros objetos en tiempo real, puede alimentar sistemas de alerta temprana en entornos controlados, con la posibilidad de ajustar la resolucion para mayor velocidad en CPUs.
- Conteo y seguimiento de objetos en almacenes: combinado con algoritmos de tracking, permite inventariar productos o monitorizar flujos de mercancia a partir de secuencias de video, gracias a su inferencia eficiente en GPU consumer.
- Robotica y navegacion autonoma: el modelo puede servir como modulo de percepcion para evitar obstaculos o localizar objetivos en entornos estructurados, aprovechando la compatibilidad con JAX para acelerar la experimentacion.
- Analisis de imagenes medicas o cientificas: aunque no esta entrenado especificamente para dominios medicos, su capacidad de transferencia permite fine-tuning sobre datasets reducidos, manteniendo un buen equilibrio entre precision y coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper original de EfficientDet reporta metricas mAP en COCO, pero esos datos no se incluyen en la documentacion de esta conversion. Se recomienda consultar el articulo arXiv para obtener las cifras comparativas de la familia completa.

## Requisitos de hardware

- Tamano del repositorio: 0.1 GB, lo que sugiere que los pesos ocupan aproximadamente 100 MB en formato de punto flotante.
- VRAM estimada para inferencia: no disponible. Dado el tamano de los pesos y la resolucion de entrada (896x896), es probable que quepa en GPUs consumer con 4 GB o mas, pero no se proporcionan cifras oficiales.
- GPUs recomendadas: no se especifican. Por el tamano del modelo, tarjetas como RTX 3060, RTX 4060 o superiores deberian ser suficientes; tambien puede ejecutarse en CPU para pruebas puntuales.
- Opciones de despliegue: al ser Keras 3, puede servirse con TensorFlow Serving, TorchServe o mediante frameworks de inferencia como ONNX Runtime si se exporta previamente. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependen del backend, la resolucion elegida y el hardware.

## Comparativa con modelos similares

La siguiente tabla compara las variantes de EfficientDet disponibles en el ecosistema zeromodels, segun la informacion de la model card:

| Variante | Backbone | Resolucion de entrada | Tamano de repo |
|---|---|---|---|
| efficientdet_d0 | EfficientNet-B0 | 512 | no disponible |
| efficientdet_d1 | EfficientNet-B1 | 640 | no disponible |
| efficientdet_d2 | EfficientNet-B2 | 768 | no disponible |
| efficientdet_d3 | EfficientNet-B3 | 896 | 0.1 GB |
| efficientdet_d4 | EfficientNet-B4 | 1024 | no disponible |
| efficientdet_d5 | EfficientNet-B5 | 1280 | no disponible |
| efficientdet_d6 | EfficientNet-B6 | 1280 | no disponible |
| efficientdet_d7 | EfficientNet-B6 | 1536 | no disponible |

En cuanto a alternativas de otros frameworks, el README de Google AutoML indica que EfficientDet-D0 tiene precision comparable a YOLOv3, por lo que D3, al ser una version escalada, ofrece mejor rendimiento a costa de mayor coste computacional. No se dispone de datos de benchmarks directos para esta conversion especifica.

## Limitaciones y advertencias

- El modelo fue entrenado exclusivamente en COCO, por lo que su capacidad de generalizacion a dominios muy diferentes (medico, industrial, aereo) es limitada sin fine-tuning.
- La resolucion de entrada debe ser multiplo de 128; valores muy alejados del tamaño de entrenamiento (896) pueden degradar la precision.
- El NMS por defecto es agnostico de clase, lo que puede suprimir detecciones de objetos cercanos de diferentes categorias; es necesario configurar `class_agnostic=False` si se requieren multiples etiquetas por region.
- No se documentan sesgos especificos, pero los sesgos presentes en COCO (distribucion de clases, condiciones de iluminacion, geografias) se heredan.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo no incluye garantias de exactitud ni adecuacion para aplicaciones criticas.
- Al ser una conversion de pesos, no se incluye el codigo de entrenamiento original; cualquier modificacion arquitectonica requiere reentrenar desde cero.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zeromodels/efficientdet_d3
- Coleccion de variantes EfficientDet: https://huggingface.co/collections/zeromodels/efficientdet
- Paper original: https://arxiv.org/abs/1911.09070
- Repositorio de Google AutoML EfficientDet: https://github.com/google/automl/tree/master/efficientdet
- Repositorio de ZeroModels: https://github.com/IMvision12/ZeroModels
- Documentacion de EfficientDet en ZeroModels: https://imvision12.github.io/ZeroModels/efficientdet/
- Articulo MDPI sobre uso de EfficientDet-D3 en GPR: https://www.mdpi.com/2412-3811/10/6/140
