# sugam24/geonusaf-unetformer-r18-random-fold0

## Resumen

GeoNUSAF - UNetFormer (ResNet-18) es un modelo de segmentación semántica para imágenes de teledetección, desarrollado por sugam24, que clasifica el uso del suelo en el Valle de Katmandú (Nepal) en seis clases: residencial, carretera, río, bosque, suelo no utilizado y agrícola. El modelo emplea una arquitectura UNetFormer, que combina un encoder ResNet-18 preentrenado en ImageNet con un decoder basado en atención global-local, una propuesta publicada por Wang et al. en 2022 para segmentación urbana eficiente en escenas de teledetección.

El checkpoint corresponde al fold 0 de un esquema de validación cruzada con división aleatoria (random split) de 3 folds, con semilla 42. Se entrena con imágenes de 512x512 píxeles a una resolución efectiva de 0.586 m/px, y alcanza un mIoU de validación de 0.5210. El repositorio incluye los pesos del modelo en formato PyTorch (tamaño 1.2 GB) junto con la configuración y las métricas. La licencia no está especificada en la ficha de Hugging Face, aunque la implementación de referencia del paper original es GPL-3.0.

Este modelo es relevante para aplicaciones de cartografía urbana, planificación territorial y monitorización de cambios en el uso del suelo, ya que ofrece una solución ligera (ResNet-18) con capacidad para procesar imágenes de alta resolución en entornos urbanos. Sin embargo, al ser un checkpoint de validación cruzada y no un modelo final, su uso en producción requeriría ensamblar los tres folds o reentrenar con todos los datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNetFormer (encoder ResNet-18 de timm, decoder con atencion global-local) |
| Parametros totales | no disponible (estimable ~15-20 M por el encoder ResNet-18, pero no confirmado) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no aplicable (modelo de vision, entrada 512x512 píxeles) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en float32 de PyTorch) |
| Idiomas soportados | no aplicable (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (safetensors no confirmado; repo con checkpoint .pt) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura UNetFormer propuesta por Wang et al. (2022) en el articulo "UNetFormer: A UNet-like Transformer for Efficient Semantic Segmentation of Remote Sensing Urban Scene Imagery". El encoder es un ResNet-18 preentrenado en ImageNet, que extrae caracteristicas multiescala. El decoder utiliza un mecanismo de atencion global-local que combina informacion contextual global con detalles locales, lo que permite segmentar escenas urbanas de forma eficiente sin necesidad de un transformer pesado. La implementacion es independiente del repositorio oficial GeoSeg (GPL-3.0), segun indica el autor.

El entrenamiento se realizo con imagenes de 512x512 píxeles normalizadas con la media y desviacion de ImageNet, a una resolucion efectiva de 0.586 m/px. Se utilizo el optimizador AdamW con peso de decaimiento 0.0001, tasa de aprendizaje de 0.0006 para el decoder y 6e-05 para el encoder, y una cabeza auxiliar con peso 0.4. El mejor epoch fue el 37, con las metricas de validacion indicadas. El dataset corresponde al Valle de Katmandu, con 6 clases y un indice de ignorancia de 255 para píxeles no etiquetados. No se menciona el uso de RLHF ni DPO, al tratarse de un modelo de vision puro.

## Capacidades

- Segmentacion semantica de uso del suelo en imagenes aereas o de satelite, con 6 clases: residencial, carretera, rio, bosque, suelo no utilizado y agricola.
- Procesamiento de imagenes de alta resolucion (GSD efectivo de 0.586 m/px) con entrada de 512x512 píxeles.
- Inferencia eficiente gracias al encoder ligero ResNet-18, adecuada para aplicaciones en tiempo real o con recursos limitados.
- Deteccion de estructuras urbanas (carreteras, edificios residenciales) y elementos naturales (rios, bosques, campos agricolas).
- Soporte para inferencia por lotes en GPUs convencionales; no requiere hardware especializado.
- No incluye capacidades de generacion de texto, vision general, tool calling ni agentes; es un modelo de segmentacion puro.

## Casos de uso

- Cartografia de uso del suelo urbano: el modelo puede clasificar automaticamente parcelas en categorias como residencial, carretera o suelo no utilizado, facilitando la actualizacion de mapas catastrales en ciudades como Katmandu.
- Planificacion de infraestructuras: las carreteras y rios detectados permiten identificar zonas de riesgo de inundacion o trazar nuevas rutas de transporte evitando areas residenciales o boscosas.
- Monitorizacion de cambios en el tiempo: al aplicar el modelo sobre imagenes de distintas fechas, se pueden detectar expansiones urbanas o perdida de bosque, util para estudios de impacto ambiental.
- Agricultura de precision: la clase "Agricultural" permite identificar parcelas cultivadas y estimar su extension, ayudando a gestionar recursos o evaluar sequias.
- Gestion de emergencias: tras un desastre natural, la segmentacion de carreteras y rios ayuda a planificar rutas de evacuacion o identificar zonas afectadas.
- Investigacion academica en teledeteccion: el checkpoint sirve como punto de partida para experimentos de transferencia de aprendizaje o para comparar metodos de segmentacion en entornos urbanos del sur de Asia.

## Benchmarks y rendimiento

El autor proporciona metricas de validacion para el fold 0 (split aleatorio). No se han publicado comparaciones con otros modelos en la informacion disponible.

| Metrica | Valor |
|---|---|
| mIoU | 0.5210 |
| mF1 | 0.6723 |
| Overall Accuracy (OA) | 0.7888 |
| Kappa | 0.6566 |

Desglose por clase (validacion):

| Clase | IoU | F1 |
|---|---|---|
| Residential | 0.8135 | 0.8971 |
| Road | 0.4210 | 0.5925 |
| River | 0.4420 | 0.6130 |
| Forest | 0.5875 | 0.7402 |
| UnusedLand | 0.3304 | 0.4967 |
| Agricultural | 0.5317 | 0.6943 |

Estos valores indican un rendimiento solido en la clase residencial y aceptable en bosque y agricola, pero mas debil en carreteras, rios y suelo no utilizado, probablemente debido a clases con menos ejemplos o mayor variabilidad.

## Requisitos de hardware

- VRAM estimada para inferencia: con entrada de 512x512 y un encoder ResNet-18, el modelo requiere aproximadamente 1-2 GB de VRAM en float32, y menos de 1 GB si se cuantiza a float16. No se han publicado mediciones exactas.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 2060, RTX 3060) es suficiente para inferencia. Para entrenamiento o fine-tuning, se recomienda 8 GB o mas (RTX 3070, RTX 4080, A100).
- Compatibilidad con consumer GPU: si, el modelo es ligero y cabe en GPUs de gama media.
- Opciones de despliegue: al ser un checkpoint de PyTorch, se puede cargar con la libreria `torch` y ejecutar con `torchvision` o directamente con el codigo de la arquitectura. No se proporcionan archivos ONNX ni TensorRT, pero se pueden exportar. Tambien es compatible con frameworks de inferencia como vLLM o TGI (aunque no son habituales para segmentacion) y con llama.cpp no es aplicable.
- Latencia y throughput: no disponibles; dependen del hardware y del batch. Con una GPU moderna, se esperan decenas de inferencias por segundo para imagenes de 512x512.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos en la informacion proporcionada. El modelo se basa en UNetFormer, que en el paper original se compara con U-Net, DeepLabV3 y otros metodos en datasets urbanos como LoveDA o ISPRS Vaihingen. Sin embargo, no hay datos de rendimiento de este checkpoint frente a esos modelos. Se recomienda consultar el articulo original para ver comparativas de la arquitectura base, aunque con diferencias de dataset y entrenamiento.

## Limitaciones y advertencias

- La licencia no esta especificada: el autor no indica bajo que terminos se distribuye el modelo. El repositorio de referencia (GeoSeg) es GPL-3.0, lo que podria implicar restricciones para uso comercial si el codigo se deriva de el, pero la implementacion aqui es independiente. Se recomienda contactar al autor antes de usar en produccion.
- Rendimiento limitado en clases minoritarias: carreteras, rios y suelo no utilizado presentan IoU por debajo de 0.45, lo que puede generar errores en aplicaciones criticas que dependan de estas clases.
- Sesgo geografico: el modelo se entrena exclusivamente con imagenes del Valle de Katmandu; su capacidad de generalizacion a otras regiones o estaciones del ano no esta verificada.
- Riesgo de alucinacion espacial: como todo modelo de segmentacion, puede producir predicciones inconsistentes en areas con sombras, nubes o solapamientos de clases.
- Es un checkpoint de validacion (fold 0), no un modelo final. Para obtener un rendimiento optimo, seria necesario combinar los tres folds o reentrenar con el conjunto completo.
- No se proporcionan datos sobre el dataset de entrenamiento (numero de imagenes, balance de clases), lo que dificulta evaluar su robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sugam24/geonusaf-unetformer-r18-random-fold0
- Articulo original de UNetFormer (arXiv): https://arxiv.org/abs/2109.08937
- Repositorio GeoSeg (referencia de la arquitectura): https://github.com/WangLibo1995/GeoSeg
- Repositorio alternativo de UNetFormer: https://github.com/whulearner/UnetFormer
- Version del modelo con split por bloques (misma serie): https://huggingface.co/sugam24/geonusaf-unetformer-r18-block-fold0
