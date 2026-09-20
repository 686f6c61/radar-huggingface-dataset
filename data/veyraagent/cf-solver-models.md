# VeyraAgent/cf-solver-models

## Resumen

cf-solver-models es el repositorio de pesos en HuggingFace que da soporte al proyecto cf-solver del usuario VeyraAgent. No se trata de un modelo de lenguaje, sino de una coleccion de ocho modelos en formato ONNX, cada uno especializado en una subtarea distinta dentro de la resolucion automatica de CAPTCHA: reconocimiento de imagenes, deteccion de objetos, clasificacion de baldosas, rotacion y OCR con CTC. Los ficheros se mantienen fuera del repositorio de GitHub para aligerarlo y se descargan desde aqui mediante el script fetch_models.sh.

El conjunto ocupa aproximadamente 0,1 GB e incluye pesos para desafios de Aliyun, GeeTest v4, reCAPTCHA, VK y un solver de rotacion, ademas de dos modelos de proposito general (una red siamesa de 56 MB y un detector YOLOv11n de 10 MB). La licencia es MIT, la misma que el proyecto principal, y el repositorio se publico en septiembre de 2026 sin descargas ni interacciones registradas hasta la fecha.

Su relevancia es acotada y practica: cubre un nicho concreto (automatizacion de pruebas y auditoria de mecanismos anti-bot) y lo hace con modelos pequenos, ligeros y desplegables en CPU. La model card no aporta informacion sobre arquitectura interna, datos de entrenamiento ni metricas de rendimiento, por lo que la evaluacion tecnica queda limitada a la estructura de ficheros y a su proposito declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene ocho modelos ONNX independientes; los nombres de fichero sugieren red siamesa, detector YOLOv11n, clasificador de imagenes y red CTC) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (.onnx) |
| Numero de modelos incluidos | 8 |
| Tamano del repositorio | 0,1 GB |
| Descargas registradas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-09-19 |
| Ultima actualizacion | 2026-09-19 |

Desglose de ficheros declarado por el autor:

| Fichero | Tamano | Funcion declarada |
|---|---|---|
| models/siamese.onnx | 56 MB | reconocimiento de imagenes |
| models/yolov11n_captcha.onnx | 10 MB | deteccion de objetos |
| solvers/aliyun/best.onnx | 10 MB | Aliyun slide |
| solvers/geetest/models/geetest_v4_icon.onnx | 2,3 MB | iconos de GeeTest v4 |
| solvers/recaptcha/models/recaptcha_cls_s.onnx | 20 MB | clasificador de baldosas de reCAPTCHA |
| solvers/rotate/rotate_model.onnx | 1,1 MB | rotacion |
| solvers/vk/captcha_model.onnx | 1,1 MB | OCR CTC de VK |
| solvers/vk/ctc_model.onnx | 1,5 KB | decodificacion CTC de VK |

## Arquitectura y entrenamiento

La model card no documenta arquitecturas, hiperparametros, volumen de datos ni proceso de entrenamiento. La unica informacion disponible es la tabla de ficheros y su funcion declarada. A partir de los nombres puede inferirse lo siguiente, siempre como deduccion y no como dato confirmado por el autor: siamese.onnx corresponderia a una red siamesa de comparacion de imagenes (56 MB, el fichero de mayor tamano y probablemente el mas costoso en computo); yolov11n_captcha.onnx a un detector de objetos de la familia YOLOv11 en variante nano (10 MB, coherente con el sufijo n); recaptcha_cls_s.onnx a un clasificador de imagenes de 20 MB; y captcha_model.onnx junto con ctc_model.onnx a una red de reconocimiento de texto con decodificacion CTC, dado que el segundo fichero ocupa solo 1,5 KB y encaja con un vocabulario o matriz de decodificacion mas que con pesos de red.

No hay informacion sobre si los modelos se entrenaron desde cero, si se partio de checkpoints preentrenados (por ejemplo un YOLOv11 preentrenado en COCO y afinado con datos de CAPTCHA) ni sobre las tecnicas de aumento de datos empleadas. Tampoco se documenta el origen de los datasets, que en este dominio suelen generarse sinteticamente o recopilarse mediante interaccion con los propios servicios. Cualquier afirmacion al respecto seria especulativa.

## Capacidades

- Reconocimiento de imagenes mediante una red siamesa (models/siamese.onnx), orientada a comparar o emparejar imagenes.
- Deteccion de objetos con YOLOv11n (models/yolov11n_captcha.onnx), pensada para localizar elementos dentro de un desafio visual.
- Resolucion de desafios de tipo slide de Aliyun (solvers/aliyun/best.onnx).
- Reconocimiento de iconos de GeeTest v4 (solvers/geetest/models/geetest_v4_icon.onnx).
- Clasificacion de baldosas de reCAPTCHA (solvers/recaptcha/models/recaptcha_cls_s.onnx), es decir, decidir si una imagen concreta coincide con la categoria solicitada.
- Resolucion de desafios de rotacion (solvers/rotate/rotate_model.onnx).
- OCR con decodificacion CTC para CAPTCHA de VK (solvers/vk/captcha_model.onnx y solvers/vk/ctc_model.onnx).
- Distribucion de pesos como arbol de ficheros con rutas relativas al repositorio cf-solver, de modo que al copiarlos se restauran todos los solvers.
- Descarga automatizada mediante el script scripts/fetch_models.sh, con soporte opcional de token de HuggingFace (HF_TOKEN) si el repositorio fuese privado.
- No hay evidencia de soporte de tool calling, agentes, razonamiento multi-paso, vision general, audio ni modo de pensamiento: no es un modelo de lenguaje y la model card no declara ninguna de esas capacidades.

## Casos de uso

- Auditoria de la robustez de CAPTCHA propios: un equipo que despliegue su propio mecanismo anti-bot puede usar estos modelos como adversario de referencia para medir la tasa de exito de un atacante automatizado antes de ponerlo en produccion, y decidir si necesita aumentar la dificultad o cambiar de proveedor.
- Pruebas de regresion en flujos con proteccion anti-bot: en suites de test end-to-end (por ejemplo, validacion de un formulario de alta protegido por reCAPTCHA en un entorno de staging propio), el clasificador de baldosas permite automatizar la interaccion sin intervencion manual.
- Investigacion academica en seguridad y vision por computador: el conjunto ofrece pesos pequenos y separados por tarea (deteccion, clasificacion, OCR, comparacion siamesa) que sirven como linea base reproducible en estudios sobre robustez de desafios visuales.
- Verificacion de accesibilidad: al automatizar la resolucion de un desafio se puede comprobar si un usuario legitimo con dificultades visuales seria capaz de superarlo, y detectar mecanismos que deberian ofrecer una alternativa accesible.
- Integracion en pipelines de monitorizacion: los modelos caben en CPU y en cualquier GPU de consumo, por lo que pueden ejecutarse en contenedores ligeros para comprobar de forma periodica que un servicio de terceros sigue operativo y no ha cambiado su desafio.
- Formacion y demos sobre deteccion de objetos: yolov11n_captcha.onnx es un detector nano de 10 MB utilizable como ejemplo practico de despliegue ONNX en un portatil sin GPU, y la red siamesa ilustra tecnicas de comparacion de imagenes en el mismo formato.
- Sustitucion o complemento del solver de referencia: dado que los ficheros conservan la ruta relativa al repositorio cf-solver, un usuario puede sustituir un modelo concreto (por ejemplo, reentrenar el clasificador de reCAPTCHA) sin tocar el resto del arbol.

En todos los casos, el uso debe limitarse a sistemas propios o a entornos sobre los que se tenga autorizacion explicita; el uso contra servicios de terceros puede infringir sus condiciones de uso y la legislacion aplicable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye tasas de acierto, latencias, throughput ni comparaciones con otros solvers para ninguno de los ocho ficheros. Tampoco se indica el conjunto de validacion empleado, por lo que no es posible estimar la precision real de cada modelo a partir de la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible. Como referencia de orden de magnitud, los pesos suman alrededor de 100 MB en disco, por lo que la inferencia de cada modelo por separado cabe holgadamente en memoria de CPU y en cualquier GPU de consumo; la cifra exacta depende del runtime y del tamano de lote, que no se documentan.
- GPU recomendadas: no disponibles. El autor no especifica hardware objetivo; por el tamano de los ficheros, no se requiere una GPU de centro de datos (A100, H100) ni siquiera una GPU dedicada.
- Viabilidad en GPU de consumo: alta. Cualquier GPU consumer reciente (serie RTX 30 o superior, o incluso integradas) puede ejecutar estos modelos; el mas exigente seria siamese.onnx con 56 MB, y no por memoria sino por posible coste de computo si recibe imagenes de alta resolucion.
- Ejecucion en CPU: previsiblemente viable para los modelos de menor tamano (rotate_model.onnx 1,1 MB, ctc_model.onnx 1,5 KB, geetest_v4_icon.onnx 2,3 MB) y probablemente tambien para el detector nano y el clasificador de 20 MB.
- Opciones de despliegue: el formato ONNX es compatible con ONNX Runtime, y en el ecosistema Python con onnxruntime-gpu u onnxruntime para CPU; tambien puede consumirse desde OpenCV DNN, TensorRT (previa conversion) o C# mediante ONNX Runtime. La model card no menciona ningun stack concreto, por lo que estas opciones son compatibilidades genericas del formato, no requisitos declarados por el autor.
- Latencia y throughput estimados: no disponibles. No se publican mediciones.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos alternativos con los que comparar, y este repositorio no es comparable con modelos de lenguaje ni con checkpoints genericos de vision de proposito general, ya que se trata de un conjunto de pesos especializados por tarea y ligados a la implementacion de cf-solver. No se dispone de datos de rendimiento propios ni de terceros para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no hay informacion sobre arquitectura, datos de entrenamiento, preprocesado, resolucion de entrada, normalizacion ni umbrales de decision. Integrar estos modelos requiere leer el codigo de cf-solver.
- Sin metricas de calidad: no se publica ninguna tasa de acierto, matriz de confusion ni evaluacion por tipo de desafio, de modo que el rendimiento real es desconocido.
- Fuerte acoplamiento al proyecto cf-solver: las rutas relativas estan pensadas para restaurar el arbol de ese repositorio; usar los modelos fuera de ese contexto exige reconstruir el preprocesado y el postprocesado por cuenta propia.
- Riesgo de obsolescencia: los CAPTCHA cambian de version con frecuencia (el propio repositorio distingue GeeTest v4 y reCAPTCHA), por lo que estos pesos pueden dejar de funcionar sin previo aviso y sin que se publique una actualizacion.
- Riesgo legal y de terminos de servicio: resolver CAPTCHA de terceros suele vulnerar las condiciones de uso de esos servicios y puede tener implicaciones legales segun la jurisdiccion. El uso responsable se limita a sistemas propios, pruebas de seguridad autorizadas y entornos de investigacion controlados.
- Sesgos y generalizacion: no disponibles. No hay informacion sobre la distribucion de datos de entrenamiento, por lo que se desconoce el comportamiento ante idiomas, alfabetos, esquemas de color o resoluciones distintos de los vistos durante el entrenamiento.
- Idiomas soportados: no disponibles. Aunque existe un modelo CTC asociado a VK, no se especifica que alfabetos o juegos de caracteres cubre.
- Licencia: MIT, permisiva, permite uso comercial y modificacion siempre que se conserve el aviso de copyright y la licencia. No impone restricciones adicionales por parte del autor, pero eso no exime del cumplimiento de las condiciones de los servicios contra los que se use.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, sin historial de mantenimiento ni comunidad que valide su funcionamiento.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/VeyraAgent/cf-solver-models
- Repositorio del proyecto principal en GitHub: https://github.com/VeyraAgent/cf-solver
- Descarga directa de ejemplo (clasificador de reCAPTCHA): https://huggingface.co/VeyraAgent/cf-solver-models/resolve/main/solvers/recaptcha/models/recaptcha_cls_s.onnx
- Script de descarga masiva: scripts/fetch_models.sh dentro del repositorio cf-solver (ruta relativa, sin URL publica indicada en la model card)

No se han encontrado otros enlaces relevantes (papers, blogs, demos o documentacion adicional) en la busqueda web realizada; los resultados obtenidos no guardan relacion con el modelo.
