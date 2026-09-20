# yennik16/2026-24679-switch-vs-switch2-classifier

## Resumen

El modelo `yennik16/2026-24679-switch-vs-switch2-classifier` es un clasificador binario de imagenes entrenado para distinguir fotografias de dos consolas portatiles de Nintendo: la clase 0 corresponde a la Switch OLED edicion Tears of the Kingdom y la clase 1 a la Switch 2. Lo publica el usuario yennik16 como entregable del Homework 2 (AutoML for neural networks) de un curso de "Designing with AI", y su proposito declarado es la demostracion de transfer learning sobre un conjunto de imagenes pequeno y auto recopilado, no la identificacion general de modelos de consola.

Tecnicamente es un modelo de vision por computador construido sobre un backbone `efficientnet_b0` preentrenado en ImageNet y congelado (4.007.548 parametros sin gradientes), al que se le sustituye el clasificador por una cabeza entrenable de 328.450 parametros: estandarizacion de caracteristicas seguidas de `linear(256) -> ReLU -> dropout -> linear(2)`. La seleccion de arquitectura e hiperparametros se hizo mediante una busqueda aleatoria de 24 trials con semilla 24679, con validacion cruzada de 4 particiones sobre las 22 fotografias originales de entrenamiento.

Su relevancia es fundamentalmente didactica y metodologica: documenta con detalle un flujo completo de AutoML con particiones estratificadas que evitan la fuga de datos entre originales y variantes aumentadas, y el propio autor advierte de que existe una seccion de "Known failure modes" (modos de fallo conocidos) que no se incluye en la informacion disponible. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, con un tamano de 0.0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con backbone EfficientNet-B0 preentrenado en ImageNet y congelado, mas cabeza clasificadora entrenable |
| Parametros totales | 4.335.998 (4.007.548 del backbone congelado + 328.450 entrenables) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificacion de imagenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (entrada exclusivamente de imagenes, sin capacidades linguisticas) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (la model card declara `library_name: pytorch`; el formato concreto del fichero de pesos no se especifica) |
| Tarea | Clasificacion de imagenes binaria (0 = Switch OLED TOTK, 1 = Switch 2) |
| Resolucion de entrada | 224 x 224 RGB |
| Preprocesado obligatorio | Escalado a [0, 1] y normalizacion con estadisticos ImageNet (mean [0.485, 0.456, 0.406], std [0.229, 0.224, 0.225]); sin resize ni center crop |
| Dataset de entrenamiento | `pakiino/2026-24679-switch-image-hw1` (CC-BY-4.0) |
| Particiones | Entrenamiento 374 filas (22 fotografias originales + 352 variantes offline), validacion 5 fotografias, test 5 fotografias |
| Metricas declaradas | accuracy, f1 |
| Tamano del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue un esquema clasico de transfer learning. El backbone es `efficientnet_b0` preentrenado en ImageNet y congelado por completo (4.007.548 parametros sin gradientes); el clasificador original se reemplaza por una identidad, de modo que la salida es el embedding agrupado. Sobre ese embedding se aplica una estandarizacion de caracteristicas cuyos valores de media y desviacion tipica se almacenan como buffers del modulo, y despues una cabeza `linear(256) -> ReLU -> dropout -> linear(2)`. Los unicos parametros entrenables son 328.450, lo que corresponde a la "red compacta" que pide el enunciado de la tarea: el backbone aporta representacion, no capacidad adicional.

El entrenamiento se apoyo en una busqueda aleatoria de 24 trials con semilla 24679 sobre ocho ejes: backbone (`mobilenet_v3_small`, `resnet18`, `efficientnet_b0`), dimension oculta (0, 64, 128, 256), dropout (0.0-0.6), optimizador (adam, adamw, sgd con momentum 0.9), learning rate (1e-4 a 1e-1 en escala logaritmica), weight decay (1e-6 a 1e-2 en escala logaritmica) y conjunto de aumentos (`none`, `photometric`, `all`). La configuracion seleccionada fue `efficientnet_b0`, `hidden=256`, `dropout=0.148`, `adam`, `lr=0.01237`, `weight_decay=0.000233` y `aug_set=photometric`. La seleccion uso validacion cruzada de 4 particiones sobre las 22 fotografias originales de entrenamiento, estratificada por etiqueta y eliminando de cada fold todos los descendientes aumentados de las fotografias retenidas; el early stopping, con paciencia de 10 epocas sobre un maximo de 60, uso exclusivamente la particion de validacion de 5 fotografias, y la particion de test no se toco hasta la evaluacion final. El reentrenamiento final corrio 13 epocas y restauro la epoca 3, coherente con la mediana de mejor epoca de los folds de validacion cruzada.

Una innovacion relevante, y poco habitual en entregables de curso, es el tratamiento del aumento de datos: la aumentacion es offline y viaja con el dataset (4 variantes independientes por fotografia original y por metodo, sin apilar transformaciones), con metodos de brillo, contraste, rotacion y desenfoque gaussiano. Los metodos que entran en entrenamiento son en si mismos un eje de busqueda, y la mejor configuracion usa solo `brightness` y `contrast`. Ademas, las particiones se estratificaron por clase antes de generar cualquier variante, garantizando que un original nunca cruza entre particiones.

## Capacidades

- Clasificacion binaria de imagenes de dos consolas concretas: salida de 2 clases (0 = Switch OLED edicion TOTK, 1 = Switch 2) a partir de una fotografia RGB de 224 x 224.
- Transfer learning sobre un backbone congelado: solo se reentrena una cabeza ligera de 328.450 parametros, lo que permite ajustes rapidos sobre un conjunto muy pequeno de imagenes.
- Inferencia reproducible con un preprocesado estricto y documentado: orientacion EXIF, conversion a RGB, redimensionado preservando aspecto, padding a 224 x 224 con (128, 128, 128), escalado a [0, 1] y normalizacion con estadisticos ImageNet.
- Robustez parcial a variaciones fotometricas moderadas (brillo y contraste) como consecuencia del conjunto de aumentos seleccionado.
- No dispone de generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa texto).
- No incluye modo "thinking", vision mas alla de la clasificacion, audio ni ninguna otra modalidad.

## Casos de uso

- Material docente para explicar transfer learning: el modelo sirve como ejemplo ejecutable de congelar un backbone ImageNet y entrenar solo una cabeza ligera, con hiperparametros y presupuesto de busqueda documentados (24 trials) para discutir el coste del AutoML.
- Referencia metodologica para evitar fuga de datos: su esquema de validacion cruzada de 4 folds sobre originales, con eliminacion de todos los descendientes aumentados, es un caso practico para ensenar por que la aumentacion offline debe separarse por origen.
- Prototipo de clasificacion de producto en catalogo: con un conjunto de fotografias propio del mismo estilo, la misma receta (backbone congelado + cabeza lineal) serviria para clasificar variantes de un producto en una app de inventario o de segunda mano.
- Prueba de integracion y de infraestructura de serving: al ser un modelo de ~17 MB en fp32 y una sola pasada de 224 x 224, es un candidato barato para validar pipelines de inferencia de imagen (carga de pesos, preprocesado, batching) antes de desplegar modelos mayores.
- Validacion de pipelines de preprocesado: al depender de un pipeline estricto (padding con 128, sin center crop, normalizacion ImageNet), sirve como prueba de regresion para comprobar que una cadena de transformaciones reproduce exactamente la esperada.
- Demostracion de despliegue en hardware modesto: el modelo cabe con holgura en GPU de consumo e incluso en CPU, por lo que es util para ensenar cuantizacion, exportacion a ONNX o TorchScript y medicion de latencia.
- Baseline en estudios comparativos de backbone: los trials registrados permiten comparar `mobilenet_v3_small`, `resnet18` y `efficientnet_b0` bajo el mismo presupuesto de busqueda, aunque la tabla publicada solo muestra parcialmente los resultados.
- Filtrado rapido en una aplicacion de coleccionismo o compraventa: como primer paso de triaje para separar fotografias de una consola frente a otra, siempre que las imagenes respeten el encuadre y el preprocesado del dataset original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible, ya que se trata de un clasificador de imagenes. La model card declara las metricas `accuracy` y `f1`, pero no incluye los valores finales sobre la particion de test.

Lo unico cuantificable disponible es el leaderboard parcial de la busqueda (top 10 de 24 trials, ordenado por balanced accuracy de validacion cruzada), del que solo se han podido recuperar las cinco primeras filas:

| backbone | hidden | dropout | optimizer | learning_rate | weight_decay | aug_set | cv_balanced_accuracy | cv_std |
|---|---|---|---|---|---|---|---|---|
| efficientnet_b0 | 256 | 0.148 | adam | 0.0124 | 0.0002 | photometric | 1.0 | 0.0 |
| efficientnet_b0 | 256 | 0.113 | adamw | 0.0396 | 0.0002 | none | 0.9583 | 0.0833 |
| efficientnet_b0 | 256 | 0.436 | sgd | 0.0024 | 0.0001 | all | 0.9583 | 0.0833 |
| efficientnet_b0 | 256 | 0.053 | adam | 0.0002 | 0.002 | none | 0.9583 | 0.0833 |
| efficientnet_b0 | 256 | 0.367 | adamw | no disponible | no disponible | no disponible | no disponible | no disponible |

Advertencia sobre estos numeros: la validacion cruzada se calculo sobre 22 fotografias originales (4 folds), de modo que una balanced accuracy de 1.0 con desviacion 0.0 procede de un conjunto extremadamente pequeno y no es extrapolable a rendimiento en produccion. La particion de test contiene unicamente 5 fotografias.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB. Los 4.335.998 parametros ocupan aproximadamente 17,4 MB en fp32, y las activaciones a 224 x 224 con lote pequeno son reducidas (estimacion a partir del numero de parametros; no publicada por el autor).
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria es sobrada, incluidas GTX 1050 Ti, RTX 3050, RTX 4090, A100 o H100. No se requiere hardware de centro de datos.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo actual e incluso en iGPU con suficiente memoria compartida.
- Inferencia en CPU: viable por el tamano del modelo, aunque no se han publicado medidas de latencia.
- Opciones de despliegue: PyTorch nativo, exportacion a TorchScript u ONNX para servir con ONNX Runtime, y frameworks de serving genericos. No se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI, que no aplican a un clasificador de imagen de este tipo.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de alternativas en la informacion proporcionada. La comparativa se limita a las arquitecturas que aparecen como ejes de busqueda en el propio proceso de AutoML, todas ellas originalmente preentrenadas en ImageNet, y a la configuracion final seleccionada.

| Modelo | Parametros | Contexto de entrada | Rendimiento en esta tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| efficientnet_b0 + cabeza lineal (este modelo) | 4.335.998 (328.450 entrenables) | Imagen 224 x 224 RGB | cv_balanced_accuracy 1.0 (std 0.0) en el trial seleccionado | CC-BY-4.0 | HuggingFace, 0 descargas |
| efficientnet_b0 + cabeza lineal (otros trials de la busqueda) | 4.335.998 (entrenables no disponibles) | Imagen 224 x 224 RGB | cv_balanced_accuracy 0.9583 en el mejor trial alternativo recuperado | CC-BY-4.0 | no disponible como modelo publicado |
| resnet18 (explorado en la busqueda) | no disponible | Imagen 224 x 224 RGB | no disponible en la informacion proporcionada | no disponible | no disponible |
| mobilenet_v3_small (explorado en la busqueda) | no disponible | Imagen 224 x 224 RGB | no disponible en la informacion proporcionada | no disponible | no disponible |

No se identifican en la informacion disponible clasificadores publicos comparables especificamente para distinguir Switch OLED de Switch 2.

## Limitaciones y advertencias

- No es un identificador general de modelos de Switch. El propio autor lo advierte de forma explicita y remite a una seccion de modos de fallo conocidos que no se incluye en la informacion disponible.
- Riesgo elevado de sobreajuste: el entrenamiento se apoya en 22 fotografias originales (ampliadas a 374 filas con variantes offline) y la validacion cruzada se calcula sobre esas mismas 22 imagenes. Una balanced accuracy de 1.0 con desviacion 0.0 es un indicio de conjunto demasiado pequeno, no de robustez.
- Test no representativo: la particion de test contiene 5 fotografias. Cualquier metrica calculada sobre ella tiene un intervalo de confianza enorme y no deberia usarse para decisiones de despliegue.
- Sensibilidad al preprocesado: alimentar una imagen sin el padding a 224 x 224 con valor (128, 128, 128) o con un recorte central la situa fuera de distribucion. El pipeline debe reproducirse en el orden exacto indicado.
- Sesgo de dominio: todas las fotografias proceden de una misma fuente (un companero de clase) y de dos unidades concretas de consola. Cambios de iluminacion, fondo, angulo, camara o una edicion distinta del mismo modelo pueden degradar la prediccion.
- Cobertura fotometrica limitada: la configuracion seleccionada entrena unicamente con aumentos de brillo y contraste, sin rotacion ni desenfoque, de modo que la invariancia frente a esas transformaciones no esta garantizada.
- Sin capacidades linguisticas ni multimodales: solo produce una etiqueta entre dos clases.
- Licencia CC-BY-4.0: permite uso comercial y obras derivadas siempre que se atribuya la autoria. Es necesario citar al autor del modelo y, en su caso, al autor del dataset `pakiino/2026-24679-switch-image-hw1`, tambien bajo CC-BY-4.0.
- Uso previsto declarado como trabajo de curso y demostracion. Para cualquier aplicacion real conviene reentrenar con un conjunto de datos mayor, diverso y con particiones de test robustas.
- Estado del repositorio: 0 descargas y 0 likes, sin senales de uso o validacion por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yennik16/2026-24679-switch-vs-switch2-classifier
- Dataset utilizado: https://huggingface.co/datasets/pakiino/2026-24679-switch-image-hw1
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada. La busqueda web realizada no devolvio ningun resultado relacionado con este modelo: los resultados obtenidos trataban sobre sistemas de calefaccion de baja energia y no guardan relacion con el modelo.
