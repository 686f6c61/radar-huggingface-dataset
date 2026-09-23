# torch-pointcloud/pointmlp-elite.scanobjectnn-hardest.xu-ma

## Resumen

pointmlp-elite.scanobjectnn-hardest.xu-ma es un modelo de clasificacion de nubes de puntos en 3D publicado por el usuario torch-pointcloud. Se trata de una conversion a la libreria torch-pointcloud del PointMLP "elite" original de ma-xu/pointMLP-pytorch, descrito en el articulo "Rethinking Network Design and Local Geometry in Point Cloud: A Simple Residual MLP Framework" (ICLR 2022). El modelo resuelve una tarea concreta: asignar una de 15 categorias de objeto a una nube de puntos de entrada, y lo hace con una arquitectura basada exclusivamente en perceptrones multicapa residuales con agrupamiento afin geometrico, sin convoluciones ni mecanismos de atencion.

El tamano es muy reducido: 717.615 parametros (0,7 M), con 3 canales de entrada (coordenadas xyz) y 256 dimensiones de caracteristicas internas. Se ha entrenado sobre la variante PB_T50_RS del benchmark ScanObjectNN, la mas exigente del conjunto, que anade perturbaciones de traslacion, rotacion y escalado sobre escaneos reales de interiores. Los resultados declarados por el autor son 84,18 de overall accuracy (OA) y 81,77 de mean accuracy (mAcc) sobre ese split.

Su relevancia actual es la de un baseline extremadamente ligero y facil de desplegar para clasificacion 3D: cabe en cualquier GPU consumer e incluso en CPU, se distribuye en safetensors con licencia Apache-2.0 y se integra en un ecosistema PyTorch propio (torch-pointcloud) que permite crear el modelo, transformar la muestra y extraer embeddings con unas pocas lineas de codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PointMLP (MLP residual con agrupamiento afin geometrico) |
| Parametros totales | 717.615 (0,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; el ejemplo de uso emplea 8.192 puntos por muestra |
| Tipos de cuantizacion | no disponible (el repositorio distribuye safetensors sin detallar precisiones alternativas) |
| Idiomas soportados | no aplica (modelo de nubes de puntos, no textual) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tarea | clasificacion de nubes de puntos (point-cloud-classification) |
| Numero de clases | 15 |
| Canales de entrada | 3 (posiciones xyz) |
| Dimension de caracteristicas | 256 |
| Dataset de entrenamiento | ScanObjectNN (PB_T50_RS) |
| Libreria | torch-pointcloud |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

PointMLP es una red puramente basada en MLP: agrupa vecinos locales alrededor de cada punto, aplica un modulo de transformacion afin geometrica que normaliza las coordenadas locales respecto a su media y desviacion tipica, y procesa el resultado con bloques MLP residuales. La agregacion final es simetrica (max-pooling), lo que confiere invariancia a la permutacion de los puntos, una propiedad imprescindible en nubes de puntos no ordenadas. El modelo aqui publicado es la variante "elite", la mas profunda de la familia en el repositorio original, pero con una cabeza de clasificacion de 15 clases y 0,7 M de parametros totales.

El entrenamiento se ha realizado sobre ScanObjectNN en su configuracion PB_T50_RS, compuesta por escaneos reales de objetos de interior con perturbaciones de traslacion, rotacion y escalado; es la variante mas dificil del benchmark y por eso aparece etiquetada como "hardest" en el nombre del modelo. La model card no documenta el numero de tokens equivalentes (no aplica), el numero de epocas, el optimizador, la receta de aumento de datos ni si se aplicaron tecnicas de ajuste tipo RLHF o DPO (no aplica en clasificacion). Tampoco se detalla el proceso exacto de muestreo de puntos ni si se emplean normales como entrada adicional, aunque el ejemplo de codigo incluye la clave "normal" en la muestra. Los pesos proceden de una conversion del repositorio ma-xu/pointMLP-pytorch (Apache-2.0).

## Capacidades

- Clasificacion de nubes de puntos en 15 categorias de objetos de interior (sillas, mesas, sofas y similares, segun la taxonomia de ScanObjectNN).
- Procesamiento de nubes de hasta 8.192 puntos por muestra, segun el ejemplo de la model card.
- Invariancia a permutacion gracias a la agregacion simetrica sobre las caracteristicas locales.
- Extraccion de caracteristicas: tanto `forward_features(...)` como `reset_classifier(num_classes=0)` devuelven embeddings de 256 dimensiones por muestra, utiles para tareas downstream.
- Integracion nativa con la libreria torch-pointcloud mediante `tp.create_model(..., task="classification", pretrained=True)`.
- No soporta generacion de texto, razonamiento simbolico, codigo ni matematicas: no es un modelo de lenguaje.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de vision 2D, audio ni modo "thinking".

## Casos de uso

- Robotica movil y navegacion: clasificar los objetos detectados por un LiDAR o una camara de profundidad para que el robot decida si puede atravesar, esquivar o interactuar con ellos; el modelo es lo bastante ligero para ejecutarse en el propio robot sin GPU dedicada.
- Manipulacion robotica: reconocer la categoria de una pieza escaneada antes de elegir la pinza o la estrategia de agarre, usando la nube de puntos capturada por la camara de profundidad del brazo.
- Etiquetado automatico de datasets 3D: pre-anotar grandes colecciones de escaneos con las 15 clases y reducir el trabajo de anotacion manual, dejando la revision final a un operador humano.
- Recuperacion de modelos 3D por similitud: usar los embeddings de 256 dimensiones como firma de cada objeto y construir un indice vectorial para buscar formas parecidas en un catalogo de escaneos.
- Inspeccion y control de calidad industrial: clasificar piezas escaneadas en linea de produccion para detectar objetos fuera de catalogo o mal posicionados, aprovechando que la inferencia no exige hardware de gama alta.
- Inventario y documentacion de interiores: procesar escaneos de edificios o viviendas para etiquetar automaticamente el mobiliario presente, como paso previo a la generacion de planos o gemelos digitales.
- Backbone preentrenado para tareas downstream: congelar las caracteristicas de 256 dimensiones y entrenar cabezas ligeras para segmentacion semantica de partes, deteccion de objetos 3D o clasificacion con una taxonomia distinta.
- Investigacion y docencia: servir como baseline reproducible y de bajo coste computacional en comparaciones sobre ScanObjectNN, especialmente en entornos con recursos limitados.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente; el campo `verified` es `false` en el model-index).

| Dataset | Tarea | Metrica | Valor |
|---|---|---|---|
| ScanObjectNN (PB_T50_RS) | clasificacion de nubes de puntos | OA (accuracy) | 84,18 |
| ScanObjectNN (PB_T50_RS) | clasificacion de nubes de puntos | mAcc (accuracy) | 81,77 |

La propia model card indica como valor de referencia 84,1 para la variante elite en el articulo original, coherente con el 84,18 obtenido en esta conversion. No se han publicado en la informacion disponible otros resultados de benchmarks (por ejemplo en ModelNet40) ni comparaciones numericas con arquitecturas alternativas.

## Requisitos de hardware

- Parametros: 717.615. Los pesos ocupan aproximadamente 2,9 MB en fp32 y unos 1,4 MB en fp16, sin contar el optimizador.
- VRAM estimada: la memoria la dominan las activaciones, no los pesos. Con una muestra de 8.192 puntos y 256 caracteristicas, el consumo deberia situarse por debajo de 1 GB en fp32 con batch 1; se trata de una estimacion a partir del numero de parametros y de la forma de la entrada, no de una medicion publicada.
- GPU recomendadas: no se han publicado recomendaciones oficiales. Por tamano, cualquier GPU con soporte CUDA funciona, incluidas GTX 1050, GTX 1650, RTX 3050, RTX 4060 o superiores. Tambien es viable en CPU y en GPU integradas.
- No requiere A100, H100 ni tarjetas de centro de datos.
- Cabe sin problema en GPU consumer, incluso en modelos de portatil con poca memoria dedicada.
- Opciones de despliegue: la via documentada es la libreria torch-pointcloud (`pip install torch-pointcloud`), que expone `create_model` con `pretrained=True`. No se documentan exportaciones a ONNX, TorchScript ni TorchServe. vLLM, llama.cpp, Ollama y TGI no aplican, ya que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos numericos de los modelos alternativos en la informacion proporcionada, por lo que las celdas correspondientes se marcan como no disponibles. La comparacion es, por tanto, cualitativa.

| Modelo | Parametros | Contexto / entrada | OA en ScanObjectNN PB_T50_RS | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pointmlp-elite.scanobjectnn-hardest.xu-ma (este modelo) | 717.615 (0,7 M) | 8.192 puntos en el ejemplo de uso | 84,18 | Apache-2.0 | HuggingFace, libreria torch-pointcloud |
| PointMLP elite original (ma-xu/pointMLP-pytorch) | no disponible en la informacion proporcionada (la model card cita un valor de referencia de 84,1 en OA) | no disponible | 84,1 (referencia citada en la model card) | Apache-2.0 (indicada como origen de la conversion) | GitHub |
| PointNet++ | no disponible | no disponible | no disponible | no disponible | no disponible |
| DGCNN | no disponible | no disponible | no disponible | no disponible | no disponible |
| Point Transformer / CurveNet | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Alcance restringido: solo clasificacion, con 15 clases fijas heredadas de ScanObjectNN. Cambiar la taxonomia exige reentrenar o sustituir la cabeza de clasificacion.
- Metricas no verificadas: los valores 84,18 y 81,77 estan marcados como `verified: false`; no han sido reproducidos por terceros en la informacion disponible.
- Capacidad limitada por tamano: 0,7 M de parametros es una cifra muy baja, lo que reduce la tolerancia a oclusiones severas, ruido de sensor y nubes con densidad muy distinta a la del entrenamiento.
- Sensibilidad al preprocesado: no se documenta el muestreo de puntos, la normalizacion ni el uso de normales, de modo que variaciones en el pipeline de entrada pueden degradar el rendimiento.
- Riesgo de sobreajuste al benchmark: PB_T50_RS es un conjunto acotado y controlado; un 84,18 de OA no garantiza generalizacion a escenas reales con oclusiones, objetos parciales o clases fuera del conjunto.
- Sesgos: no hay informacion publicada sobre sesgos de dominio (tipo de sensor, geografia, tipo de interior) en la model card.
- Idioma: no aplica, el modelo no procesa texto.
- Uso comercial: la licencia Apache-2.0 permite uso comercial, pero conviene conservar la atribucion del trabajo original y la cita del articulo, ya que los pesos derivan de ma-xu/pointMLP-pytorch (Apache-2.0).
- Sin validacion comunitaria: 0 descargas y 0 "likes" en el momento de la consulta; no hay evidencia de uso en produccion por terceros.
- Repositorio de 0,0 GB: no se publican datos de entrenamiento, semillas, curvas de entrenamiento ni scripts de evaluacion en el espacio de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/pointmlp-elite.scanobjectnn-hardest.xu-ma
- Articulo de PointMLP (ICLR 2022): https://arxiv.org/abs/2202.07123
- Repositorio original de los pesos: https://github.com/ma-xu/pointMLP-pytorch
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de la libreria (Zenodo): https://doi.org/10.5281/zenodo.22159632
- Articulo de ScanObjectNN (ICCV 2019): citado en la model card, sin enlace disponible en la informacion proporcionada
- Busqueda web: los resultados devueltos no contienen informacion relevante sobre este modelo (corresponden a PyTorch y a un navegador homonimo).
