# yasutomo57jp/models-for-IndyXe

## Resumen

`yasutomo57jp/models-for-IndyXe` no es un modelo de lenguaje, sino una coleccion de tres clasificadores binarios de LightGBM que el sistema robotico IndyXe utiliza en su paquete ROS 2 `action_recognition` para interpretar la intencion de las personas que aparecen en el campo de vision del robot. Cada clasificador consume caracteristicas tabulares derivadas de la estimacion de pose y de cara (mensajes `recognition_msgs/Persons`) y devuelve una etiqueta binaria por persona y fotograma: si esta saludando con la mano, si esta mirando hacia la camara/robot o si esta sentada (por ejemplo, en silla de ruedas).

El interes del repositorio es practico y acotado: ofrece modelos ligeros ya entrenados con los que reproducir el comportamiento del pipeline de percepcion de IndyXe sin reentrenar, en dos formatos (pickle `.joblib` y texto nativo de LightGBM `.txt`). No hay pesos neuronales, ni tokenizador, ni ventana de contexto: son arboles de decision potenciados sobre vectores de 51, 255 y 7 dimensiones.

Por su naturaleza, la ficha se adapta al formato de un modelo tabular: no aplican campos como longitud de contexto o cuantizacion, y las secciones de benchmarks, hardware y comparativa se cubren con lo que el autor documenta y con alternativas equivalentes de la misma categoria (clasificadores ligeros para reconocimiento de acciones).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting de arboles de decision (LightGBM, `LGBMClassifier`) |
| Parametros totales | no disponible (numero de arboles: 179 en `hand_waving`, 67 iteraciones x 2 clases en `looking_at`, 174 en `wheelchair`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular de 51, 255 o 7 caracteristicas) |
| Tipos de cuantizacion | no aplica (modelos de arboles; no se cuantizan) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | `.joblib` (pickle de scikit-learn) y `.txt` (formato nativo de LightGBM) |

Detalle por modelo:

| Fichero | Tarea | Entrada | Salida |
|---|---|---|---|
| `hand_waving_model.joblib` / `.txt` | Esta saludando con la mano | 255 = 5 fotogramas x 17 keypoints x (x, y, z) | 0: no, 1: si |
| `looking_at_model.joblib` / `.txt` | Esta mirando hacia la camara/robot | 7 = bbox facial [x, y, w, h] + orientacion [yaw, pitch, roll] | 0: no, 1: si |
| `wheelchair_model.joblib` / `.txt` | Esta sentada (silla de ruedas o silla) | 51 = 17 keypoints x (x, y, z) | 0: no, 1: si |

## Arquitectura y entrenamiento

Los tres modelos son clasificadores LightGBM entrenados con la API de scikit-learn (`LGBMClassifier`) con `n_estimators=10000`, `learning_rate=0.1`, `num_leaves=31` y `random_state=0`. El numero de rondas de boosting se limito mediante early stopping sobre una particion de validacion, dando como resultado 179 arboles para `hand_waving`, 67 iteraciones x 2 clases para `looking_at` y 174 para `wheelchair`. `looking_at` se entreno con objetivo `multiclass` (`num_class=2`); los otros dos con objetivo `binary`.

Los datos provienen de bolsas ROS 2 grabadas con el pipeline de percepcion de IndyXe, una bolsa por clase; el conjunto de entrenamiento no se publica. Las caracteristicas de pose son 17 keypoints 3D en el sistema de coordenadas del sensor, en orden estilo COCO, normalizados restando la media de los keypoints validos (aquellos con `z > 0` y finitos); los invalidos se ponen a cero tras el centrado. `wheelchair` usa un unico fotograma normalizado (51 dimensiones) y `hand_waving` concatena los ultimos 5 fotogramas normalizados de la misma persona, del mas antiguo al mas reciente (255 dimensiones). `looking_at` combina la bounding box facial en coordenadas de imagen con la orientacion de la cara (yaw, pitch, roll). El entrenamiento se realizo con scikit-learn 1.5.2 y LightGBM 4.x.

## Capacidades

- Clasificacion binaria de acciones humanas a partir de caracteristicas tabulares de pose y cara.
- Deteccion de saludo con la mano mediante una ventana temporal de 5 fotogramas.
- Deteccion de atencion hacia el robot a partir de la orientacion facial y la posicion de la cara en la imagen.
- Deteccion de persona sentada (silla de ruedas o silla) a partir de un unico esqueleto 3D.
- Inferencia por lotes sobre multiples personas de un mismo fotograma (`predict` / `predict_proba` con matrices `(n_persons, d)`).
- Carga sin dependencia de pickle mediante el formato de texto nativo de LightGBM, con probabilidades identicas.
- Integracion con ROS 2: los nodos del paquete `action_recognition` descargan estos ficheros automaticamente si no encuentran un modelo local.
- No soporta tool calling, agentes, razonamiento multi-paso, vision directa ni capacidades multilingues: consume caracteristicas ya extraidas por el pipeline de percepcion.

## Casos de uso

- Recepcion robotica: el robot IndyXe detecta con `looking_at` si una persona le esta mirando y con `hand_waving` si le saluda, lo que permite iniciar una interaccion de forma proactiva en entornos de atencion al publico.
- Asistencia a personas con movilidad reducida: `wheelchair` identifica a usuarios sentados para adaptar la altura, la velocidad o la ruta del robot en tareas de acompanamiento.
- Despliegue en el propio robot: al ser arboles de pocas centenas de nodos, la inferencia es de microsegundos en CPU, sin GPU, lo que encaja con los recursos limitados de un robot movil.
- Reproduccion de experimentos de percepcion: un investigador puede cargar los `.txt` y validar el comportamiento del pipeline `action_recognition` sin reentrenar ni depender de versiones concretas de scikit-learn.
- Prototipado de nuevas acciones: los modelos sirven como referencia de formato de entrada (normalizacion de keypoints COCO, ventana de 5 fotogramas) para entrenar clasificadores adicionales con el mismo esquema.
- Filtrado previo en sistemas de videovigilancia o analitica de personas: usar `looking_at` y `wheelchair` como etapas rapidas de clasificacion sobre las salidas de un estimador de pose, antes de modelos mas costosos.
- Educacion y demos de ROS 2: ejemplo completo de integracion de modelos tabulares ligeros en un nodo ROS 2 con descarga automatica desde Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, recall, F1 ni matrices de confusion para ninguno de los tres clasificadores, ni comparaciones con alternativas.

## Requisitos de hardware

- VRAM: no aplica; la inferencia se ejecuta en CPU.
- GPU: no necesaria. Cualquier CPU moderna es suficiente; los modelos tienen entre 67 y 179 arboles con `num_leaves=31`.
- Memoria RAM: del orden de megabytes por modelo; el repositorio completo ocupa 0.0 GB segun Hugging Face.
- Despliegue: libreria `lightgbm` (via `Booster` o `LGBMClassifier`) y `joblib`/scikit-learn para los ficheros pickle; dentro de IndyXe, a traves del paquete ROS 2 `action_recognition`.
- Latencia y throughput: no disponibles de forma oficial; por el tamano de los modelos se espera latencia de microsegundos a pocos milisegundos por lote en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| models-for-IndyXe | LightGBM (arboles) | Keypoints COCO 3D y bbox/orientacion facial | Saludo, atencion, persona sentada | MIT | Hugging Face, pesos incluidos |
| MediaPipe Pose + reglas heuristicas | Landmarks + logica | Keypoints 2D/3D | Postura y gestos basicos | Apache 2.0 | Google, ampliamente usado |
| ST-GCN y variantes | Red neuronal sobre grafos de esqueleto | Secuencias de keypoints | Reconocimiento de acciones | Variable segun implementacion | Repositorios academicos |
| PoseC3D / CTR-GCN | CNN / GCN 3D | Secuencias de keypoints | Acciones humanas (NTU, Kinetics) | Variable | Repositorios academicos |

Frente a ST-GCN o PoseC3D, estos clasificadores son orders de magnitud mas ligeros y no requieren GPU, pero estan especializados en tres acciones concretas y ligados a la geometria de camara de IndyXe. Las alternativas neuronales generalizan mejor a otras acciones y datasets, a costa de mas recursos y de necesitar reentrenamiento.

## Limitaciones y advertencias

- Los modelos dependen del layout exacto de keypoints, del sistema de coordenadas y de la configuracion de camara del pipeline de percepcion de IndyXe; caracteristicas de otros estimadores de pose deben respetar ese formato.
- `looking_at` usa coordenadas faciales en espacio de imagen, por lo que depende de la resolucion y del montaje de camara empleados en el entrenamiento.
- Son clasificadores pequenos y especificos; el autor indica que no se evaluaron fuera del sistema IndyXe.
- No hay metricas publicadas de precision ni de robustez ante oclusiones, iluminacion adversa o personas fuera de distribucion.
- Los datos de entrenamiento no se publican, lo que impide auditar sesgos o reproducir el entrenamiento.
- Posible sesgo hacia la poblacion y el entorno de grabacion de las bolsas ROS 2 originales; no se documenta diversidad demografica.
- Los ficheros `.joblib` son pickles de Python y ejecutan codigo al cargarse: solo deben cargarse de fuentes de confianza. Para produccion se recomienda el formato `.txt`.
- Cargar los `.joblib` con versiones de scikit-learn distintas de 1.5.2 puede emitir `InconsistentVersionWarning`; usar los `.txt` evita el problema.
- Licencia MIT: permite uso comercial y modificacion, pero sin garantia alguna por parte del autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/yasutomo57jp/models-for-IndyXe
- LightGBM (repositorio oficial): https://github.com/microsoft/LightGBM
- Perfil del autor en X: https://x.com/yasutomo57jp/status/2108728152499667000
- Paper, blog o demo adicionales: no disponible
