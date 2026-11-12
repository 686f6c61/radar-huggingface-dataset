# XinchengTan/nsdl-detector-viki20

## Resumen

NSDL detector (VIKI, 20 clases) es un modelo de deteccion de objetos basado en YOLO26-L, desarrollado por Xincheng Tan y publicado como parte del trabajo de investigacion "NSDL: Neuro-Symbolic Division of Labor for Multi-Robot Task Planning" (Tan, Wang, Di y Zhu, arXiv preprint, 2026). El modelo actua como el detector del modulo `detect` dentro del sistema NSDL, encargado de percibir las herramientas y objetos que los robots manipulan en tareas de planificacion multi-robot.

Se trata de un fine-tuning de YOLO26-L (Ultralytics 8.4.33) inicializado desde pesos COCO y ajustado exclusivamente sobre el split oficial de entrenamiento de VIKI-L2, compuesto por 900 imagenes. El conjunto de clases cubre 6 robots (fetch, stompy, unitree_h1, panda, unitree_go2, anymal_c) y 14 objetos o elementos de entorno de cocina (apple, banana, bowl, bread, cabinet, knife, peach, pear, plate, sink, table, toaster, tomato, wooden_cutting_board).

El modelo es relevante para investigadores que replican o extienden el sistema NSDL, ya que constituye el componente perceptivo exacto empleado en los experimentos del paper. Su utilidad practica esta acotada al dominio VIKI-L2: deteccion de robots manipuladores y utillaje de cocina en escenas de laboratorio. El repositorio ocupa 0,1 GB y contiene un unico fichero `best.pt` de aproximadamente 53 MB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26-L (Ultralytics 8.4.33), detector de objetos de una etapa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch `.pt`) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch `.pt` (`best.pt`, 53.002.078 bytes, sha256 `213fd9fdc668cd29a5e104365359f26ba66bc0dfe18a0e60dd4fd7f04cfd792a`) |

## Arquitectura y entrenamiento

El modelo es un detector YOLO26-L, la variante grande de la familia YOLO26 de Ultralytics (version 8.4.33). Se inicializa desde pesos preentrenados en COCO y se ajusta sobre el split de entrenamiento oficial de VIKI-L2, que consta de 900 imagenes. El ajuste se limita a ese split, sin datos adicionales. El fichero publicado corresponde al promedio exponencial de pesos (EMA) utilizado para evaluacion; se han eliminado el estado del optimizador y las rutas de entrenamiento. No se especifican en la informacion disponible el numero de epocas, el tamano de lote, la tasa de aprendizaje ni la composicion detallada del dataset mas alla del recuento de imagenes y clases.

Las clases del modelo son 20: `fetch`, `stompy`, `unitree_h1`, `panda`, `unitree_go2`, `anymal_c`, `apple`, `banana`, `bowl`, `bread`, `cabinet`, `knife`, `peach`, `pear`, `plate`, `sink`, `table`, `toaster`, `tomato` y `wooden_cutting_board`. Las seis primeras corresponden a plataformas roboticas; el resto, a alimentos, utensilios y mobiliario de cocina. Los ajustes de inferencia empleados en el paper son `imgsz=960`, `conf=0.25`, `IoU=0.70` y `max_det=64`. El modelo debe colocarse en `checkpoints/best.pt` dentro del repositorio de codigo de NSDL.

## Capacidades

- Deteccion de objetos en imagenes RGB con 20 clases especificas del dominio VIKI-L2.
- Localizacion y clasificacion simultanea de seis plataformas roboticas (Fetch, Stompy, Unitree H1, Franka Panda, Unitree Go2, ANYmal C).
- Deteccion de 14 clases de objetos y elementos de cocina (frutas, utensilios, superficies y electrodomesticos).
- Salida en formato estandar Ultralytics (cajas delimitadoras, etiquetas de clase y puntuaciones de confianza), integrable en pipelines de percepcion robotica.
- Entrada de imagenes de hasta 960 px de lado en la configuracion de inferencia del paper.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni capacidades multilingues: es exclusivamente un detector visual.

## Casos de uso

- Replicacion del paper NSDL: el modelo es el detector exacto empleado en las filas "VIKI-L2 tool-taking" de las Tablas I y III del articulo; colocarlo en `checkpoints/best.pt` permite reproducir los resultados de percepcion del sistema neuro-simbolico.
- Percepcion en planificacion multi-robot: el detector identifica que robot (Fetch, Panda, H1, Go2, ANYmal C, Stompy) esta presente y que herramienta u objeto tiene a su alcance, informacion que alimenta el modulo simbolico de asignacion de tareas.
- Deteccion de utillaje en escenarios de cocina robotizada: localiza cuchillos, tablas de cortar, platos, bolos y alimentos para tareas de manipulacion como cortar, servir o transportar.
- Benchmark de referencia para nuevos detectores en VIKI-L2: sirve como linea base con ajustes de inferencia documentados (`imgsz=960`, `conf=0.25`, `IoU=0.70`) para comparar fine-tunings propios.
- Etiquetado asistido y pre-anotacion: al estar entrenado sobre las 20 clases del dominio, puede generar propuestas de cajas para acelerar la anotacion de nuevas imagenes de VIKI-L2.
- Investigacion en division de trabajo neuro-simbolica: integrado en pipelines que combinan percepcion neuronal (este detector) con razonamiento simbolico para asignar tareas entre robots heterogeneos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (mAP, precision, recall) ni comparaciones numericas con otros detectores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el fichero de pesos ocupa aproximadamente 53 MB, por lo que la huella en memoria es reducida y compatible con GPUs de gama media.
- GPU recomendadas: no especificadas en la informacion disponible.
- Compatibilidad con GPU de consumo: probable dado el tamano del fichero, pero no confirmada en la documentacion proporcionada.
- Opciones de despliegue: al ser un modelo Ultralytics (`.pt`), es compatible con la libreria `ultralytics` (carga via `YOLO("best.pt")`) y con los formatos de exportacion que esta soporta (ONNX, TensorRT, OpenVINO, entre otros); no se documentan opciones adicionales en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NSDL detector (VIKI, 20 clases) | no disponible (YOLO26-L) | no aplica | VIKI-L2 (robots y cocina) | AGPL-3.0 | Hugging Face |
| YOLO26-L base (COCO) | no disponible | no aplica | 80 clases COCO | AGPL-3.0 | Ultralytics |
| Alternativas especificas para VIKI-L2 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros detectores fine-tuneados especificamente para VIKI-L2 con los que establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Dominio muy restringido: solo reconoce 20 clases de VIKI-L2; fuera de ese conjunto de robots y utillaje de cocina su utilidad es limitada.
- Entrenamiento con solo 900 imagenes: el riesgo de sobreajuste y de baja generalizacion a condiciones de iluminacion, camara o escena distintas de las del dataset es alto.
- No se han publicado metricas de rendimiento (mAP, precision, recall), por lo que no es posible evaluar su calidad objetiva a partir de la informacion disponible.
- Licencia AGPL-3.0: el uso comercial requiere cumplir las obligaciones de copyleft de la AGPL, incluida la publicacion del codigo fuente de las modificaciones y de los servicios en red que lo utilicen.
- Deriva de Ultralytics YOLO26, por lo que hereda las restricciones y condiciones de licencia del proyecto original.
- No es un modelo de lenguaje: no soporta generacion de texto, razonamiento, codigo ni capacidades multilingues.
- Riesgo de falsos positivos y negativos en escenas con oclusiones o con objetos fuera de las 20 clases, sin datos publicados que cuantifiquen dicho riesgo.
- La configuracion de inferencia del paper (`imgsz=960`, `conf=0.25`, `IoU=0.70`, `max_det=64`) debe respetarse para reproducir los resultados; otros ajustes pueden alterar el comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/XinchengTan/nsdl-detector-viki20
- Codigo del proyecto NSDL: https://github.com/Xincheng-Tan/NSDL
- Paper: "NSDL: Neuro-Symbolic Division of Labor for Multi-Robot Task Planning" (Tan, Wang, Di, Zhu; arXiv preprint, 2026) — referencia sin URL directa en la informacion disponible
- Ultralytics (framework base): https://github.com/ultralytics/ultralytics
