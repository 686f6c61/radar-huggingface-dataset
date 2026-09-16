# suthakar123/YOLOP

## Resumen

YOLOP (You Only Look Once for Panoptic driving Perception) es una red neuronal convolucional multitarea disenada para percepcion en conduccion autonoma. La desarrollan Dong Wu, Manwen Liao, Weitian Zhang y Xinggang Wang, de la School of EIC de la HUST (Huazhong University of Science and Technology), y se describen en el informe tecnico arXiv 2108.11250. Su propuesta es resolver de forma conjunta tres tareas criticas para un vehiculo autonomo —deteccion de objetos de trafico, segmentacion de la zona conducente y deteccion de carriles— con una sola red y una sola pasada hacia delante, en lugar de encadenar tres modelos independientes.

El problema que ataca es el coste computacional y de latencia de los pipelines clasicos de percepcion, donde cada tarea requiere su propio modelo. YOLOP demuestra mediante experimentos ablativos que las tres tareas pueden aprenderse de forma conjunta sin optimizacion alternante tediosa, y que el resultado mejora a la vez la precision por tarea y el rendimiento en tiempo real. Segun el model card, es el primer trabajo que alcanza velocidad de tiempo real en dispositivos embebidos manteniendo resultados de nivel state-of-the-art en el conjunto de datos BDD100K.

La ficha corresponde al repositorio suthakar123/YOLOP en HuggingFace, una resubida de tercera persona con pipeline declarado `object-detection`, sin licencia ni idiomas especificados, 0 descargas y 0 likes en el momento de la consulta. Es relevante ahora como referencia historica de los modelos multitarea de percepcion y como base ligera de deteccion y segmentacion para prototipos de conduccion autonoma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red convolucional multitarea de una sola pasada; el model card no detalla el backbone ni los cabezales, solo que comparte un unico cuerpo para deteccion y dos cabezales de segmentacion |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; no se especifica resolucion de entrada en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision; los idiomas no son un parametro relevante) |
| Licencia | no disponible (el repositorio de HuggingFace no declara licencia) |
| Formato de pesos | no disponible (el model card describe estructura de proyecto en Python, sin especificar formato de pesos) |

## Arquitectura y entrenamiento

El model card describe YOLOP como una red multitarea eficiente que maneja conjuntamente deteccion de objetos, segmentacion de zona conducente y deteccion de carriles, con el objetivo de ahorrar coste computacional, reducir el tiempo de inferencia y mejorar el rendimiento de cada tarea por separado. La informacion proporcionada no detalla el backbone concreto, el numero de capas ni el mecanismo de atencion empleado; solo se indica que la red comparte representaciones entre las tres tareas y que la deteccion de carriles se postprocesa con ajuste cuadratico (quadratic fitting) en las visualizaciones.

En cuanto al entrenamiento, el model card aporta el protocolo utilizado en los experimentos ablativos: la estrategia marcada como `ED-S-W` consiste en entrenar primero el encoder y el cabezal de deteccion, congelar despues encoder y cabezal y entrenar los dos cabezales de segmentacion, y finalmente entrenar la red completa de forma conjunta para las tres tareas. Los experimentos comparan este esquema end-to-end con variantes por etapas (`ES-W`, `ED-W`, `ES-D-W`, `ED-S-W`) y concluyen que el entrenamiento conjunto end-to-end es el que ofrece el mejor equilibrio. No se especifica en la informacion disponible el numero de tokens o imagenes de entrenamiento, la composicion exacta del dataset (mas alla de BDD100K), ni si se emplearon tecnicas de RLHF o DPO, que no aplican a este tipo de modelo.

## Capacidades

- Deteccion de objetos de trafico: identifica vehiculos y otros objetos relevantes en escenas de conduccion sobre BDD100K, con un recall del 89,2 % y un mAP50 del 76,5 % segun el model card.
- Segmentacion de zona conducente: genera la mascara de la superficie transitable, con un mIoU del 91,5 %.
- Deteccion de carriles: estima las lineas de carril, con un mIoU del 70,50 % y un IoU del 26,20 %; las visualizaciones del model card aplican ajuste cuadratico como postprocesado.
- Inferencia multitarea en una sola pasada: las tres tareas se resuelven con un unico modelo, frente a los pipelines que requieren tres redes independientes.
- Orientacion a tiempo real: el model card reporta 41 fps y afirma ser el primer trabajo en alcanzar tiempo real en dispositivos embebidos con rendimiento de nivel state-of-the-art en BDD100K.
- No se documenta en la informacion proporcionada soporte de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingues, modo thinking, vision-general, audio ni generacion de texto. Es un modelo puramente de vision por computador para percepcion de conduccion.

## Casos de uso

- Percepcion embarcada en vehiculos autonomos o ADAS: un unico modelo cubre deteccion de objetos, zona conducente y carriles, lo que reduce el numero de redes que deben ejecutarse simultaneamente en la unidad de computo del vehiculo y simplifica la integracion.
- Prototipado rapido de pipelines de conduccion autonoma: al resolver las tres tareas en una sola red con 24,4 ms/frame segun el experimento multitarea, permite construir una demo funcional de percepcion completa sin ensamblar tres modelos distintos.
- Investigacion academica en aprendizaje multitarea: los experimentos ablativos del model card (end-to-end frente a por etapas, multitarea frente a tarea unica) sirven como linea base reproducible para estudiar transferencia entre tareas de percepcion.
- Sistemas de asistencia a la conduccion en flotas y vehiculos comerciales: la deteccion de carriles y de zona transitable sirve para alertas de salida de carril y para validar que el vehiculo circula dentro de la calzada.
- Anotacion asistida y pre-etiquetado de datasets de conduccion: las salidas de deteccion y segmentacion pueden usarse como propuesta inicial que despues revisa un anotador humano, acelerando la construccion de nuevos conjuntos sobre BDD100K o dominios propios.
- Analisis offline de grabaciones de trafico: procesar videos de dashcam en lote para extraer objetos detectados, area transitable y geometria de carril, por ejemplo en estudios de infraestructura o auditoria de incidentes.
- Demostraciones educativas de vision por computador multitarea: el repositorio incluye una carpeta `inference` con imagenes de entrada y salida, lo que facilita usarlo como ejemplo didactico de como compartir un backbone entre tareas.

## Benchmarks y rendimiento

Resultados reportados en el model card sobre BDD100K.

Deteccion de objetos de trafico:

| Modelo | Recall (%) | mAP50 (%) | Velocidad (fps) |
|---|---|---|---|
| Multinet | 81,3 | 60,2 | 8,6 |
| DLT-Net | 89,4 | 68,4 | 9,3 |
| Faster R-CNN | 77,2 | 55,6 | 5,3 |
| YOLOv5s | 86,8 | 77,2 | 82 |
| YOLOP | 89,2 | 76,5 | 41 |

Segmentacion de zona conducente:

| Modelo | mIoU (%) | Velocidad (fps) |
|---|---|---|
| Multinet | 71,6 | 8,6 |
| DLT-Net | 71,3 | 9,3 |
| PSPNet | 89,6 | 11,1 |
| YOLOP | 91,5 | 41 |

Deteccion de carriles:

| Modelo | mIoU (%) | IoU (%) |
|---|---|---|
| ENet | 34,12 | 14,64 |
| SCNN | 35,79 | 15,84 |
| ENet-SAD | 36,56 | 16,02 |
| YOLOP | 70,50 | 26,20 |

Ablacion 2, multitarea frente a tarea unica (mismas metricas por tarea):

| Metodo | Recall (%) | AP (%) | mIoU (%) | Accuracy (%) | IoU (%) | Velocidad (ms/frame) |
|---|---|---|---|---|---|---|
| Det (solo deteccion) | 88,2 | 76,9 | - | - | - | 15,7 |
| Da-Seg (solo segmentacion de zona) | - | - | 92,0 | - | - | 14,8 |
| Ll-Seg (solo carriles) | - | - | - | 79,6 | 27,9 | 14,8 |
| Multitarea | 89,2 | 76,5 | 91,5 | 70,5 | 26,2 | 24,4 |

Ablacion 1, entrenamiento end-to-end frente a por etapas:

| Metodo | Recall (%) | AP (%) | mIoU (%) | Accuracy (%) | IoU (%) |
|---|---|---|---|---|---|
| ES-W | 87,0 | 75,3 | 90,4 | 66,8 | 26,2 |
| ED-W | 87,3 | 76,0 | 91,6 | 71,2 | 26,1 |
| ES-D-W | 87,0 | 75,1 | 91,7 | 68,6 | 27,0 |
| ED-S-W | 87,5 | 76,1 | 91,6 | 68,0 | 26,8 |
| End-to-end | 89,2 | 76,5 | 91,5 | 70,5 | 26,2 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de ningun benchmark de lenguaje, porque el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El model card no publica numero de parametros, tamano de pesos ni consumo de memoria.
- GPU recomendadas: no disponible. El model card no enumera GPU concretas.
- Compatibilidad con GPU de consumo: no confirmada de forma explicita, pero el model card afirma que es el primer trabajo en alcanzar tiempo real en dispositivos embebidos y reporta 41 fps, ademas de 24,4 ms/frame en el experimento de multitarea; estos datos apuntan a un modelo ligero apto para hardware de gama media, sin que se especifiquen modelos concretos.
- Opciones de despliegue: el model card describe una estructura de proyecto en Python con carpetas `inference` (imagenes de entrada y salida), `lib/config/default`, `lib/core` (activaciones, evaluacion, funciones, NMS, perdidas, postprocesado), `lib/dataset` (superclase `AutoDriveDataset` y subclases como `bdd.py` y `hust.py`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo de vision de este tipo.
- Latencia y throughput: 41 fps y 24,4 ms/frame para el modelo multitarea segun el model card; 15,7 ms/frame para la variante de solo deteccion y 14,8 ms/frame para cada variante de solo segmentacion.

## Comparativa con modelos similares

| Modelo | Tareas | Recall (%) | mAP50 (%) | mIoU zona (%) | mIoU carril (%) | Velocidad (fps) |
|---|---|---|---|---|---|---|
| YOLOP | Deteccion + zona conducente + carriles | 89,2 | 76,5 | 91,5 | 70,50 | 41 |
| YOLOv5s | Solo deteccion | 86,8 | 77,2 | - | - | 82 |
| Multinet | Deteccion + zona conducente | 81,3 | 60,2 | 71,6 | - | 8,6 |
| DLT-Net | Deteccion + zona conducente | 89,4 | 68,4 | 71,3 | - | 9,3 |
| PSPNet | Solo segmentacion de zona | - | - | 89,6 | - | 11,1 |
| Faster R-CNN | Solo deteccion | 77,2 | 55,6 | - | - | 5,3 |
| ENet-SAD | Solo carriles | - | - | - | 36,56 (mIoU) | no disponible |

La comparativa se limita a los datos incluidos en el model card. No hay informacion sobre licencia ni disponibilidad de pesos de cada alternativa en la informacion proporcionada. La ventaja diferencial de YOLOP es cubrir las tres tareas con una sola red, a 41 fps, frente a 8,6-11,1 fps de los modelos multitarea o de segmentacion comparados, a costa de quedar por detras de YOLOv5s en mAP50 de deteccion (76,5 frente a 77,2) pese a superarlo en recall (89,2 frente a 86,8). No se conocen en la informacion proporcionada alternativas mas recientes de percepcion panoptica para conduccion.

## Limitaciones y advertencias

- El repositorio de HuggingFace no declara licencia. No hay base explicita para asumir uso comercial permitido; habria que consultar la licencia del repositorio original del proyecto antes de cualquier despliegue en produccion.
- Es una resubida de un tercero (autor `suthakar123`), no el repositorio oficial del equipo de la HUST. No se garantiza que los pesos o el codigo coincidan con la version publicada por los autores.
- Los metadatos de creacion y actualizacion indican la fecha 2026-09-16, posterior a la publicacion del informe tecnico en 2021, lo que sugiere metadatos poco fiables o una resubida tardia. Conviene verificar la procedencia de los ficheros.
- El modelo esta especializado en escenas de conduccion y entrenado sobre BDD100K. No se documenta su comportamiento en dominios fuera de ese conjunto (por ejemplo, camaras aereas, interiores o imagenes genericas), donde el rendimiento puede degradarse de forma notable.
- La deteccion de carriles es la tarea con peor resultado relativo: mIoU del 70,50 % e IoU del 26,20 %, muy por debajo de la segmentacion de zona conducente (91,5 %). Las visualizaciones del model card aplican ajuste cuadratico como postprocesado, lo que implica que las salidas crudas son menos limpias que las imagenes mostradas.
- El experimento multitarea reduce metricas frente a los modelos de tarea unica: la precision de carriles baja de 79,6 % a 70,5 % y el IoU de 27,9 % a 26,2 %, ademas de multiplicar el tiempo de inferencia de 14,8 a 24,4 ms/frame. Es un compromiso explicito entre cobertura de tareas y precision por tarea.
- No se documentan sesgos concretos, riesgos de alucinacion (no aplica a un modelo discriminativo) ni limitaciones idiomaticas. En un sistema de conduccion real, los fallos de deteccion o segmentacion tienen consecuencias de seguridad, por lo que el modelo no deberia usarse como unica fuente de decision.
- No se publican en la informacion disponible detalles de cuantizacion, formato de pesos ni requisitos de memoria, lo que dificulta planificar un despliegue en hardware concreto.
- Los resultados de busqueda web asociados a esta consulta no guardan relacion con el modelo (tratan sobre el movimiento FIRE); no aportan informacion adicional y no se han utilizado como fuente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/suthakar123/YOLOP
- Informe tecnico del paper: https://arxiv.org/abs/2108.11250
- Enlace del paper en el model card (PDF): https://arxiv.org/pdf/1612.07695.pdf
- Multinet, paper: https://arxiv.org/pdf/1612.07695.pdf
- Multinet, codigo: https://github.com/MarvinTeichmann/MultiNet
- DLT-Net, paper: https://ieeexplore.ieee.org/abstract/document/8937825
- Faster R-CNN, paper: https://proceedings.neurips.cc/paper/2015/file/14bfa6bb14875e45bba028a21ed38046-Paper.pdf
- Faster R-CNN, codigo: https://github.com/ShaoqingRen/faster_rcnn
- YOLOv5, codigo: https://github.com/ultralytics/yolov5
- PSPNet, paper: https://openaccess.thecvf.com/content_cvpr_2017/papers/Zhao_Pyramid_Scene_Parsing_CVPR_2017_paper.pdf
- PSPNet, codigo: https://github.com/hszhao/PSPNet
- ENet, paper: https://arxiv.org/pdf/1606.02147.pdf
- ENet, codigo: https://github.com/osmr/imgclsmob
- SCNN, paper: https://www.aaai.org/ocs/index.php/AAAI/AAAI18/paper/download/16802/16322
- SCNN, codigo: https://github.com/XingangPan/SCNN
- ENet-SAD, paper: https://openaccess.thecvf.com/content_ICCV_2019/papers/Hou_Learning_Lightweight_Lane_Detection_CNNs_by_Self_Attention_Distillation_ICCV_2019_paper.pdf
- ENet-SAD, codigo: https://github.com/cardwing/Codes-for-Lane-Detection
