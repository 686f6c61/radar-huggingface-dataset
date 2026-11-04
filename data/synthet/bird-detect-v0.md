# synthet/bird-detect-v0

## Resumen

bird-detect-v0 es un modelo de deteccion de objetos basado en YOLO11n (la variante nano de Ultralytics) especializado en la localizacion de aves mediante bounding boxes de una unica clase (`bird`). Lo desarrolla el usuario synthet como componente auxiliar de su proyecto image-scoring-model, una herramienta de evaluacion de calidad de imagen orientada a fotografia de fauna. El modelo no pretende clasificar especies ni identificar individuos: su unico cometido es responder a la pregunta "hay un ave y donde esta" en un fotograma dado.

El repositorio contiene dos checkpoints. El v0 se entreno exclusivamente sobre las cajas de CUB-200-2011 (aproximadamente 10.000 imagenes de entrenamiento y 1.700 de validacion), un dataset academico con aves bien encuadradas y centradas. El v1, recomendado por el autor, parte de v0 y se ajusta durante 30 epocas anadiendo 803 fotogramas de campo etiquetados por un detector maestro RTMDet-tiny (COCO), lo que corrige el sesgo de encuadre del dataset original y anade ejemplos negativos (fotogramas sin ave).

La relevancia del modelo es acotada pero clara: cubre el caso de localizacion de sujeto cuando no se necesitan keypoints oculares (para eso el autor publica synthet/eye-pose-v0). Es un modelo pequeno, de inferencia ligera, pensado para integrarse en pipelines de seleccion y puntuacion de fotografias de fauna, no como detector de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n (Ultralytics), detector de una etapa tipo anchor-free |
| Parametros totales | no disponible (el modelo base es ultralytics/yolo11n, variante nano) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen a imgsz 640) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en formato .pt de PyTorch; admite exportacion via Ultralytics a ONNX, TensorRT, etc., no documentada en la model card) |
| Idiomas soportados | no aplica (modelo de deteccion visual, sin capacidades linguisticas) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.pt` (PyTorch, Ultralytics): `bird_detect_v0.pt` y `bird_detect_v1.pt` |

## Arquitectura y entrenamiento

El modelo es un detector YOLO11n de una sola etapa con una unica clase de salida (`bird`, indice 0). La arquitectura es la estandar de Ultralytics para la variante nano: backbone convolucional con bloques C3k2 y atencion espacial, cuello PAN-FPN y cabeza de deteccion desacoplada. No incorpora innovaciones propias respecto al modelo base; el trabajo del autor esta integramente en el ajuste fino y la curaduria de datos.

El v0 se entreno 100 epocas sobre las cajas de CUB-200-2011 (imgsz 640, batch 16), alcanzando en validacion mAP50 0.994, mAP50-95 0.892, precision 0.993 y recall 0.997. El v1 parte de esos pesos y se ajusta 30 epocas (imgsz 640, batch 16, lr0 0.002) sobre CUB mas 803 fotogramas de campo etiquetados por el detector maestro RTMDet-tiny COCO (Apache-2.0), que opero sobre el fotograma completo y sobre teselas 2x2, aceptando solo cajas COCO `bird` con confianza mayor o igual a 0.50 y descartando casos ambiguos. De esos 803 fotogramas, 455 contenian cajas de ave y 385 eran fotogramas sin ave (negativos). Los umbrales se calibraron sobre una cohorte etiquetada manualmente por el propietario y excluida del entrenamiento. El listado de los 803 fotogramas se repitio cinco veces por epoca, representando el 29 por ciento de cada epoca. La validacion final del v1 (CUB val mas teacher val) reporta mAP50 0.994, mAP50-95 0.878, precision 0.991 y recall 0.982; el autor advierte explicitamente que estas cifras no son comparables con las del v0 porque el conjunto de validacion ahora incluye fotogramas de campo mas dificiles.

## Capacidades

- Deteccion de bounding boxes de aves en imagenes, con una unica clase (`bird`).
- Localizacion de sujeto para recorte, conteo y filtrado previo (gating) en pipelines de fotografia de fauna.
- Manejo de fotogramas sin ave: el v1 incorpora ejemplos negativos y reduce falsos positivos respecto al v0.
- Deteccion de aves pequenas: en la cohorte de campo, recall del 100 por ciento en aves que ocupan menos del 4 por ciento del fotograma (48 casos).
- Integracion con la CLI `eye-quality detect` del paquete eye_quality del mismo autor.
- Exportacion a otros formatos de inferencia a traves del ecosistema Ultralytics (no documentada en la model card).
- No soporta tool calling, agentes, razonamiento multi-paso, capacidades multilingues ni modos de pensamiento: es exclusivamente un detector visual.

## Casos de uso

- **Cribado previo en flujos de seleccion de fotografia de fauna**: el modelo marca que fotogramas contienen un ave y donde, de modo que las etapas posteriores (puntuacion de calidad, deteccion de keypoints oculares con eye-pose-v0) solo procesan imagenes relevantes. Adecuado por su bajo coste computacional al derivar de YOLO11n.
- **Recorte automatico del sujeto para clasificacion de especies**: las cajas generadas permiten recortar el ave y enviar el recorte a un clasificador de especies o a un modelo de vision-lenguaje, reduciendo ruido de fondo y resolucion necesaria.
- **Conteo de aves por imagen en censos o inventarios**: con una sola clase y umbrales ajustables, sirve para estimar el numero de aves presentes en un fotograma, con la cautela de que CUB suele contener un ave por imagen y las escenas densas requieren validacion propia.
- **Filtrado de fotogramas vacios en bibliotecas fotograficas**: el v1, entrenado con 385 negativos, reduce falsos positivos en fotogramas sin ave (del 100 por ciento al 50 por ciento en el subconjunto de falsos positivos del v0), lo que lo hace util para descartar tomas fallidas en catalogos grandes.
- **Automatizacion de metadatos en gestores de assets**: etiquetar imagenes con la presencia y posicion del ave para generar palabras clave, regiones de interes o miniaturas centradas en el sujeto.
- **Preprocesado en estaciones de campo o dispositivos con recursos limitados**: al ser un YOLO11n, el coste de inferencia es bajo y puede ejecutarse en GPU de consumo o incluso CPU para lotes pequenos, lo que encaja en flujos de triaje previo a la subida a la nube.
- **Investigacion en vision aplicada a fauna**: punto de partida reproducible (v0 sobre CUB) para experimentos de ajuste fino con datos propios, con la advertencia de la licencia AGPL-3.0.

## Benchmarks y rendimiento

Resultados de validacion reportados por el autor:

| Modelo | Conjunto de validacion | mAP50 | mAP50-95 | Precision | Recall |
|---|---|---|---|---|---|
| v0 | CUB val (epoca 100) | 0.994 | 0.892 | 0.993 | 0.997 |
| v1 | CUB val + teacher val (epoca final) | 0.994 | 0.878 | 0.991 | 0.982 |

Evaluacion de campo sobre una cohorte de 339 fotogramas etiquetada por el propietario (biblioteca de fauna, nunca usada en entrenamiento; presencia por fotograma, intervalos de Wilson al 95 por ciento):

| Subconjunto | v0 | v1 |
|---|---|---|
| Fotogramas con ave que v0 no detecto (78): recall | 0 % (0-5 %) | 81 % (71-88 %) |
| Fotogramas sin ave dentro de ese grupo (71): falsos positivos | 0 % (0-5 %) | 7 % (3-15 %) |
| Fotogramas que v0 detecto y contenian ave (101): recall | 100 % | 98 % (93-99 %) |
| Fotogramas que v0 detecto erroneamente y sin ave (28): siguen disparando | 100 % | 50 % (33-67 %) |
| Aves pequenas, menos del 4 % del fotograma (48): recall | 100 % | 100 % |

No se han publicado resultados de benchmarks en la informacion disponible mas alla de los anteriores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al derivar de YOLO11n (variante nano de Ultralytics) el consumo es bajo, del orden de menos de 1 GB en FP32 y aun menor en FP16, aunque la cifra exacta no figura en la model card.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo esta pensado para ejecutarse en GPU de consumo (RTX 3060, RTX 4090) e incluso en CPU para lotes pequenos.
- Cabe en GPU de consumo: si, por el tamano reducido del modelo base YOLO11n.
- Opciones de despliegue: Ultralytics (`YOLO(...).predict(...)`), CLI `eye_quality detect` del paquete del autor, y exportacion a otros runtimes via Ultralytics (ONNX, TensorRT, etc.), no documentada en la model card.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Clases | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| synthet/bird-detect-v0 (v1) | YOLO11n ajustado | 1 (`bird`) | no disponible (base yolo11n) | imagen, imgsz 640 | AGPL-3.0 | HuggingFace |
| ultralytics/yolo11n | YOLO11n COCO | 80 | no disponible en la informacion | imagen, imgsz 640 | AGPL-3.0 | Ultralytics / HuggingFace |
| RTMDet-tiny COCO (maestro usado por el autor) | Detector de una etapa | 80 | no disponible en la informacion | imagen | Apache-2.0 | OpenMMLab |
| synthet/eye-pose-v0 | Modelo complementario del mismo autor | keypoints oculares | no disponible | imagen | no disponible | HuggingFace |

La comparacion con detectores de proposito general (YOLO11n COCO, RTMDet-tiny) es la mas pertinente: bird-detect-v0 ofrece una clase unica pero ajustada al dominio de fauna, mientras que los modelos COCO cubren 80 clases con menor especializacion. No se dispone de datos de rendimiento de los alternativos en la informacion proporcionada para una comparacion cuantitativa.

## Limitaciones y advertencias

- Solo detecta cajas de la clase `bird`; no es un detector multiespecie ni identifica especies.
- Los datos de campo del v1 provienen de la biblioteca de un unico fotografo (aves de Norteamerica, objetivo teleobjetivo); es necesario validar en el propio dominio antes de usarlo en produccion.
- El detector maestro excluye aves muy pequenas, en silueta u ocluidas en lugar de etiquetarlas, por lo que esos casos siguen siendo debiles.
- Las etiquetas de CUB suelen contener un ave por imagen; los fotogramas con varias aves requieren cuidado adicional.
- Riesgo de falsos positivos en fotogramas sin ave: en la cohorte de campo, el 7 por ciento de los fotogramas sin ave del subconjunto problematico dispararon deteccion con el v1, y el 50 por ciento de los falsos positivos del v0 persistieron.
- La licencia AGPL-3.0 es copyleft fuerte: el uso en servicios en red puede obligar a liberar el codigo del servicio; revisar implicaciones antes de uso comercial.
- CUB-200-2011 es un dataset de investigacion con imagenes de Flickr descritas como limitadas a uso no comercial y educativo; la AGPL-3.0 cubre solo los pesos y no otorga derechos sobre el dataset. Comprobar sus terminos antes de uso comercial.
- El v1 utilizo cajas generadas por RTMDet-tiny (Apache-2.0) sobre fotos de campo que no se distribuyen, lo que limita la reproducibilidad exacta del entrenamiento.
- No se documentan sesgos demograficos ni linguisticos por tratarse de un modelo visual de dominio acotado; el sesgo relevante es el de dominio (especies, condiciones de luz, encuadre y geografia de los datos de entrenamiento).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/synthet/bird-detect-v0
- Modelo complementario eye-pose-v0: https://huggingface.co/synthet/eye-pose-v0
- Repositorio image-scoring-model: https://github.com/synthet/image-scoring-model
- Modelo base YOLO11n: https://huggingface.co/ultralytics/yolo11n
- Licencia AGPL-3.0: https://www.gnu.org/licenses/agpl-3.0.html
- Licencia de Ultralytics: https://www.ultralytics.com/license
- Dataset CUB-200-2011: no disponible en la informacion proporcionada
- Dataset synthet/image-scoring-model: https://huggingface.co/datasets/synthet/image-scoring-model
