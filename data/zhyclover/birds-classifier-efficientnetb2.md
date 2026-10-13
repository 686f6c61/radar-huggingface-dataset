# zhyclover/Birds-Classifier-EfficientNetB2

## Resumen

Birds-Classifier-EfficientNetB2 es un modelo de clasificacion de imagenes especializado en identificar 525 especies de aves a partir de fotografias RGB de 224x224 pixeles. Se trata de un ajuste fino (fine-tuning) del modelo generico google/efficientnet-b2, preentrenado originalmente sobre ImageNet-1K, realizado por el autor dennisjooo sobre el conjunto de datos gpiosenka/100-bird-species de Kaggle. El repositorio que se documenta aqui (zhyclover/Birds-Classifier-EfficientNetB2) es una redistribucion de ese ajuste fino, con 12 descargas y 0 likes en el momento de redactar esta ficha.

Arquitecturalmente es una red convolucional de la familia EfficientNet, variante B2, con aproximadamente 8,5 millones de parametros totales (8.508.287 segun el peso en safetensors). No es un modelo de lenguaje: no tiene ventana de contexto, no genera texto y no soporta tool calling ni razonamiento multi-paso. Su unica funcion es asignar una etiqueta de especie a una imagen de entrada, devolviendo logits sobre 525 clases.

Su relevancia practica esta en el coste computacional minimo: con menos de 9 millones de parametros cabe en cualquier GPU de consumo, en CPU de portatil e incluso en dispositivos embebidos tipo Raspberry Pi, manteniendo una precision de validacion del 98,59 % y de test del 99,12 % sobre el dataset de referencia. Frente a un acierto aleatorio de 0,19 % (1/525), el modelo es utilizable directamente en produccion para tareas de triaje y clasificacion automatizada de aves.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN EfficientNet-B2 (bloques MBConv con squeeze-and-excitation y activacion Swish) |
| Parametros totales | 8.508.287 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, sin contexto de texto) |
| Tipos de cuantizacion | no disponible; el repo incluye pesos en safetensors, ONNX y PyTorch, y la etiqueta `base_model:quantized:google/efficientnet-b2` sugiere una variante cuantizada del modelo base |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, ONNX y PyTorch (checkpoint de `EfficientNetForImageClassification`) |

Datos adicionales: resolucion de entrada 224x224 RGB, 525 clases de salida, tamano del repositorio 0,1 GB, creado y actualizado el 2026-10-13, autor del repositorio zhyclover, autor del ajuste fino original dennisjooo.

## Arquitectura y entrenamiento

El modelo parte de google/efficientnet-b2, una CNN disenada mediante escalado compuesto (compound scaling) que balancea simultaneamente profundidad, anchura y resolucion de entrada. La columna vertebral esta formada por bloques MBConv (Mobile Inverted Bottleneck Convolution) con conexiones residuales y modulos de squeeze-and-excitation, y la cabeza de clasificacion original de 1000 clases de ImageNet-1K fue sustituida por una cabeza de 525 clases, una por especie del dataset de aves. Las imagenes se preprocesan con la configuracion oficial del autor original (`preprocessor_config.json` de google/efficientnet-b2), sin cambios respecto al modelo base.

El ajuste fino se realizo con PyTorch sobre una GPU P100 gratuita de Kaggle, empleando las librerias Lightning y Torchmetrics. El dataset gpiosenka/100-bird-species contiene 84.635 imagenes de entrenamiento y 2.625 imagenes de validacion y de test respectivamente, con 525 especies y una resolucion uniforme de 224x224. El regimen de entrenamiento fue fp32 con perdida de entropia cruzada, optimizador Adam (betas 0,99 y 0,999), learning rate inicial de 1e-3, planificador ReduceLROnPlateau sobre la perdida de validacion (paciencia 2, factor de decaimiento 0,1), tamano de lote 64 y parada temprana sobre la precision de validacion con paciencia 10. Como aumento de datos se aplico rotacion aleatoria de 10 grados con probabilidad 0,5 y volteo horizontal aleatorio con probabilidad 0,5. No se documenta uso de RLHF, DPO ni tecnicas de destilacion o decodificacion especulativa, que no aplican a este tipo de modelo.

## Capacidades

- Clasificacion de imagenes en 525 clases correspondientes a especies de aves, devolviendo logits por clase.
- Identificacion de especies a partir de fotografias RGB de 224x224, con precision de test reportada del 99,12 % en el split oficial.
- Extraccion de caracteristicas visuales reutilizables: al derivar de un modelo preentrenado en ImageNet-1K, la columna vertebral puede servir como extractor de embeddings para tareas relacionadas (deteccion, clustering de imagenes, busqueda por similitud).
- Inferencia ligera apta para entornos con recursos limitados, incluida ejecucion en CPU y en dispositivos embebidos.
- Exportacion a ONNX, lo que permite despliegue en runtimes no dependientes de PyTorch (ONNX Runtime, TensorRT, navegador via WebAssembly).
- No soporta generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes, entrada multimodal de texto ni audio.
- No dispone de capacidades multilingues: su salida son etiquetas de clase, no lenguaje natural.
- No incorpora modo de razonamiento (thinking mode) ni salida explicativa del motivo de la clasificacion.

## Casos de uso

- Aplicaciones moviles de identificacion de aves para aficionados: el usuario fotografia un ave y la app ejecuta el modelo en el dispositivo, ya que con 8,5 millones de parametros y pesos de decenas de megabytes la inferencia local es viable sin conexion y sin coste de servidor.
- Ciencia ciudadana y plataformas de observacion: integracion como paso de triaje automatico en flujos tipo eBird o iNaturalist, donde el modelo propone una especie candidata que el observador confirma o corrige, reduciendo el esfuerzo de etiquetado manual sobre volumenes altos de fotografias.
- Monitorizacion de biodiversidad con camaras trampa: clasificacion por lotes de imagenes capturadas en reservas naturales para estimar presencia y frecuencia de especies a lo largo del tiempo, aprovechando la exportacion a ONNX y el bajo coste por inferencia.
- Despliegue en hardware embebido y edge: ejecucion en Raspberry Pi, Jetson Nano o modulos similares para alimentadores inteligentes de aves o estaciones de campo con conectividad limitada, donde no es viable enviar imagenes a la nube.
- Preetiquetado en pipelines de anotacion: uso del modelo como anotador preliminar que asigna una especie a cada imagen y marca como inciertas aquellas con baja confianza (por ejemplo, probabilidad maxima por debajo de un umbral), reduciendo el coste de anotacion humana en proyectos de investigacion ornitologica.
- Educacion y divulgacion: aplicaciones interactivas en museos de historia natural, aulas o exposiciones donde el visitante sube una foto y obtiene la especie identificada al instante, con una latencia de milisegundos en GPU o decenas de milisegundos en CPU.
- Filtrado y organizacion automatica de fototecas: clasificacion de grandes colecciones de imagenes de fauna para separar fotografias de aves del resto, generar etiquetas por especie y habilitar busqueda o agrupacion por similitud.
- Componente auxiliar en sistemas de vision mayores: uso de los embeddings de la columna vertebral como caracteristica de entrada para un clasificador o detector posterior de mayor alcance taxonomico.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision en entrenamiento (accuracy) | 0,999480 |
| Precision en validacion (accuracy) | 0,985904 |
| Precision en test (accuracy) | 0,991238 |
| Acierto aleatorio de referencia (1/525) | 0,0019047619 |

No se han publicado en la informacion disponible resultados sobre benchmarks estandarizados de vision como ImageNet-1K, COCO o similares, ni comparaciones directas con otros clasificadores de aves. Las cifras anteriores proceden del propio autor sobre los splits del dataset gpiosenka/100-bird-species y no son directamente comparables con resultados de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 34 MB en fp32, 17 MB en fp16 y 8,5 MB en int8, solo para los pesos; sumando activaciones y lote, el consumo real se mantiene por debajo de 1 GB en cualquier configuracion habitual.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, GTX 1650 o incluso GPUs integradas. No requiere A100 ni H100.
- Ejecucion en CPU perfectamente viable, tanto en servidores como en portatiles, con tiempos de inferencia del orden de decenas de milisegundos por imagen.
- Despliegue: PyTorch nativo via transformers (`EfficientNetForImageClassification`), pipeline `image-classification` de Hugging Face, ONNX Runtime a partir del archivo ONNX incluido, y conversiones a TensorRT o TFLite para edge. No aplica vLLM, llama.cpp ni Ollama, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada. Estimacion orientativa basada en el tamano del modelo: por debajo de 5 ms por imagen en GPU moderna con batching, y del orden de 10 a 50 ms por imagen en CPU de escritorio; estas cifras son estimaciones, no mediciones publicadas.
- Almacenamiento: el repositorio completo ocupa 0,1 GB, por lo que puede empaquetarse dentro de aplicaciones moviles o de contenedores muy ligeros.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision en test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zhyclover/Birds-Classifier-EfficientNetB2 | 8.508.287 | no aplica | 0,991238 (525 clases de aves) | apache-2.0 | Hugging Face (12 descargas) |
| google/efficientnet-b2 | no disponible en la informacion proporcionada | no aplica | no disponible (1000 clases de ImageNet-1K) | apache-2.0 | Hugging Face |
| dennisjooo/Birds-Classifier-EfficientNetB2 | no disponible explicitamente; el modelo card y los ejemplos de codigo apuntan al mismo ajuste fino | no aplica | mismas cifras reportadas (0,985904 validacion, 0,991238 test) | apache-2.0 | Hugging Face |
| Otras alternativas de clasificacion de aves | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos verificables de otros clasificadores de especies de aves que permitan una comparacion cuantitativa directa. La comparacion con google/efficientnet-b2 se limita a la relacion de derivacion (mismo backbone, distinta cabeza de clasificacion y distinto dataset de ajuste).

## Limitaciones y advertencias

- Ambito cerrado de 525 especies: cualquier ave fuera de ese conjunto se clasificara igualmente en una de las 525 clases, sin mecanismo nativo de rechazo de clase desconocida. Se recomienda aplicar un umbral de confianza sobre la probabilidad maxima.
- Riesgo de sobreajuste al dataset de origen: las imagenes de gpiosenka/100-bird-species son de resolucion uniforme 224x224 y con condiciones controladas; el rendimiento puede degradarse en fotografias de campo con oclusion, desenfoque de movimiento, iluminacion adversa, aves parcialmente visibles o fondos complejos.
- Sesgo de dominio y geografico: la composicion del dataset condiciona que especies y que regiones del mundo estan mejor representadas. No se documenta la distribucion geografica de las imagenes, por lo que el comportamiento puede ser desigual entre especies.
- Riesgo de alucinacion en sentido taxonomico: el modelo siempre devuelve una etiqueta con una puntuacion de confianza, incluso ante imagenes que no contienen aves. No debe interpretarse la salida como certeza.
- Sin datos de calibracion: no se publican metricas de calibracion, matrices de confusion por especie ni curvas de precision-cobertura, por lo que no es posible conocer a priori que especies se confunden entre si.
- Trazabilidad del repositorio: la model card del repositorio documentado referencia en sus ejemplos de codigo el identificador `dennisjooo/Birds-Classifier-EfficientNetB2` y no `zhyclover/Birds-Classifier-EfficientNetB2`. Conviene verificar la procedencia y la fidelidad de los pesos antes de usarlos en produccion.
- Popularidad y mantenimiento: 12 descargas, 0 likes y sin historial de actualizaciones posterior a la creacion. No hay senales de mantenimiento activo.
- Licencia: apache-2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserven los avisos de copyright y licencia. El dataset gpiosenka/100-bird-species se distribuye en Kaggle y tiene sus propias condiciones de uso, que deben revisarse por separado antes de un uso comercial.
- Ausencia de documentacion sobre cuantizacion: aunque existe una etiqueta que apunta a un modelo base cuantizado, no se detalla que esquema de cuantizacion se aplico ni su impacto en la precision.
- Idiomas: no aplica, pero implica que el modelo no genera nombres comunes de aves ni descripciones; habria que mapear los indices de clase a nombres legibles mediante el `id2label` del config.

## Enlaces

- Modelo en Hugging Face (repositorio documentado): https://huggingface.co/zhyclover/Birds-Classifier-EfficientNetB2
- Modelo original del ajuste fino: https://huggingface.co/dennisjooo/Birds-Classifier-EfficientNetB2
- Repositorio de codigo del autor: https://github.com/dennisjooo/Birds-Classifier-EfficientNetB2
- README del repositorio de codigo: https://github.com/dennisjooo/Birds-Classifier-EfficientNetB2/blob/main/README.md
- Imagen de curvas de entrenamiento: https://github.com/dennisjooo/Birds-Classifier-EfficientNetB2/raw/main/logs/metrics.png
- Modelo base google/efficientnet-b2: https://huggingface.co/google/efficientnet-b2
- Configuracion de preprocesado del modelo base: https://huggingface.co/google/efficientnet-b2/blob/main/preprocessor_config.json
- Dataset de aves en Kaggle: https://www.kaggle.com/datasets/gpiosenka/100-bird-species
- Ficha del modelo en AIBase: https://model.aibase.com/models/details/1915694793377865730
