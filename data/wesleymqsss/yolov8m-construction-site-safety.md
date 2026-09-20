# wesleymqsss/yolov8m-construction-site-safety

## Resumen

`wesleymqsss/yolov8m-construction-site-safety` es un modelo de deteccion de objetos basado en YOLOv8m, fine-tuneado por el usuario wesleymqsss para la deteccion de equipos de proteccion individual (EPI), no conformidades de seguridad, trabajadores y maquinaria en entornos de obra. El modelo parte de los pesos preentrenados de Ultralytics y se redistribuye en formato PyTorch (`.pt`) a traves de HuggingFace Hub bajo licencia MIT, con una unica clase de tarea: object detection.

El modelo resuelve un problema acotado y muy habitual en seguridad laboral: la verificacion automatica del uso de casco, mascarilla y chaleco reflectante, ademas de la deteccion de personas, conos de senalizacion, maquinaria y vehiculos. Su interes practico radica en que las 10 clases estan definidas explicitamente en portugues de Brasil, incluyendo clases negativas del tipo "Sem Capacete" y "Sem Mascara", lo que permite construir alertas de no conformidad sin necesidad de logica de post-procesado adicional.

Se trata de un modelo pequeno (repo de 0,1 GB, pesos de aproximadamente 50 MB) orientado a inferencia en tiempo real sobre imagen fija o video, no de un modelo de lenguaje. No dispone de ventana de contexto ni de capacidades de razonamiento: es un detector puramente visual. En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 likes, por lo que no existe validacion independiente de sus metricas publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8m (CNN, deteccion de objetos en una etapa, backbone CSPDarknet con cuello PAN-FPN y cabeza desacoplada ancla-libre) |
| Parametros totales | ~25,9 M (cifra publica de Ultralytics para YOLOv8m; no confirmada de forma independiente para este checkpoint) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen, tipicamente 640x640 px) |
| Tipos de cuantizacion | no disponible en la model card; al ser un modelo Ultralytics es compatible con exportacion a FP16, INT8 y formatos ONNX/TensorRT/OpenVINO mediante la API de exportacion de la libreria |
| Idiomas soportados | portugues (pt); las etiquetas de clase estan en portugues de Brasil |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`, fichero `best.pt`) |
| Tarea | object-detection |
| Numero de clases | 10 |
| Libreria | ultralytics |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-19 |

Clases mapeadas (PT-BR): 0 Capacete, 1 Mascara, 2 Sem Capacete, 3 Sem Mascara, 4 Sem Colete, 5 Pessoa, 6 Cone de Sinalizacao, 7 Colete Refletor, 8 Maquinaria, 9 Veiculo.

## Arquitectura y entrenamiento

YOLOv8m es un detector de una sola etapa de la familia YOLOv8 de Ultralytics. La arquitectura combina un backbone convolucional tipo CSPDarknet con un cuello PAN-FPN que fusiona caracteristicas multi-escala, y una cabeza de deteccion desacoplada (ramas separadas para clasificacion y regresion) con asignacion de etiquetas libre de anclas. El modelo opera sobre una unica pasada de la red, lo que le permite alcanzar latencias bajas sin necesidad de propuestas de regiones ni de etapas de refinamiento en cascada. La variante "m" (medium) se situa en el punto medio de la escala de Ultralytics, entre las variantes n/s y l/x.

La model card no documenta el procedimiento de entrenamiento: no se indica el dataset utilizado, el numero de imagenes, el numero de epocas, la resolucion de entrada durante el fine-tuning, la estrategia de aumento de datos ni si se aplico congelacion de capas o reentrenamiento completo. Tampoco se especifica la composicion del conjunto de validacion sobre el que se calcularon las metricas publicadas. Unicamente se declara que se trata de un fine-tuning sobre YOLOv8m para deteccion de EPI y no conformidades. Cualquier reproducibilidad del resultado queda por tanto condicionada a informacion no publicada.

## Capacidades

- Deteccion de objetos en imagen fija y en flujo de video, con salida de cajas delimitadoras y etiquetas de clase.
- Deteccion de equipos de proteccion individual en uso: casco (`Capacete`), mascarilla (`Mascara`) y chaleco reflectante (`Colete Refletor`).
- Deteccion de no conformidades como clases de pleno derecho: `Sem Capacete`, `Sem Mascara` y `Sem Colete`. Esto permite generar alertas directamente a partir de la salida del detector, sin inferir la ausencia por complemento.
- Deteccion de personas (`Pessoa`) como clase independiente, lo que posibilita el conteo de trabajadores en escena.
- Deteccion de elementos de entorno de obra: conos de senalizacion (`Cone de Sinalizacao`), maquinaria (`Maquinaria`) y vehiculos (`Veiculo`).
- Segmentacion temporal manual: al no ser un modelo de tracking, el seguimiento de identidades entre fotogramas requiere acoplar un tracker externo como ByteTrack o BoT-SORT, disponibles en la propia libreria Ultralytics.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No tiene capacidades de vision-lenguaje: no genera descripciones ni responde a preguntas sobre la imagen.
- No hay capacidades de audio ni modo de razonamiento extendido.
- Multilingue: no aplica. Las etiquetas estan en portugues; el modelo no procesa texto.

## Casos de uso

- Monitorizacion de EPI en obra en tiempo real: el modelo se ejecuta sobre el flujo de camaras IP instaladas en el acceso o en zonas de riesgo y emite una alerta cuando detecta la clase `Sem Capacete`, `Sem Mascara` o `Sem Colete` sobre una persona. Al ser un detector de una etapa y de 25,9 M de parametros, es viable en GPU de gama media e incluso en CPU con resolucion reducida.
- Auditoria automatica de imagenes historicas: procesamiento por lotes de fotografias de inspeccion para generar un inventario de no conformidades por zona y fecha, alimentando indicadores de seguridad (por ejemplo, tasa de incumplimiento de casco por cuadrilla).
- Control de acceso a zonas criticas: integracion con el sistema de tornos o barreras para denegar el paso si no se detecta `Capacete` y `Colete Refletor` sobre la persona detectada, con un umbral de confianza configurable.
- Analitica de seguridad y cuadros de mando: agregacion de detecciones por clase a lo largo del tiempo para construir series temporales de incumplimiento, utiles para formacion y para priorizar inspecciones.
- Asistencia a la inspeccion de seguridad laboral: pre-etiquetado automatico de imagenes que un tecnico revisa despues, reduciendo el tiempo de anotacion manual de informes de obra.
- Deteccion de intrusion en zonas de maquinaria: uso combinado de las clases `Pessoa`, `Maquinaria` y `Veiculo` para identificar personas dentro de areas de operacion de maquinaria pesada y disparar una senal de aviso.
- Analisis post-incidente: revision de grabaciones para reconstruir si el trabajador implicado llevaba el EPI requerido en el momento del accidente, con trazabilidad sobre las clases detectadas.

## Benchmarks y rendimiento

Metricas declaradas por el autor en la model card. No se especifica el conjunto de evaluacion, el umbral de confianza ni el numero de imagenes utilizadas.

| Metrica | Valor |
|---|---|
| mAP@0.5 | ~81,2 % |
| Precision | ~89,2 % |
| Recall | ~76,5 % |

No se han publicado resultados de benchmarks comparativos con otros detectores de EPI en la informacion disponible, ni valores de mAP@0.5:0.95, ni metricas por clase. No se dispone tampoco de resultados sobre conjuntos publicos de referencia como COCO, ya que el modelo ha sido fine-tuneado y sus metricas corresponden al dominio de obra.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1-2 GB en FP32 a 640x640 con lote 1; aproximadamente 1 GB o menos en FP16. Cifras estimadas a partir del tamano del modelo (25,9 M de parametros, pesos de ~50 MB), no publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Para lotes grandes o video multi-canal de alta resolucion, se recomienda NVIDIA T4, L4, RTX 3060 12 GB, RTX 4090 o superiores. En A100/H100 el modelo queda infrautilizado salvo en escenarios de muchos flujos concurrentes.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en GTX 1650 4 GB, RTX 3050, RTX 3060, RTX 4060 y superiores. Tambien es viable en CPU (con latencias mayores) y en dispositivos tipo Jetson Orin para despliegue en borde.
- Opciones de despliegue: Ultralytics (Python/CLI), exportacion a ONNX, ONNX Runtime, TensorRT, OpenVINO, TFLite, CoreML y NCNN mediante `model.export()`. No se ha publicado integracion con vLLM, TGI, llama.cpp ni Ollama, que no aplican a un modelo de vision.
- Latencia y throughput: no disponibles. No se han publicado mediciones de FPS, latencia por imagen ni throughput en ninguna GPU concreta.

## Comparativa con modelos similares

No se dispone de datos de rendimiento en deteccion de EPI para los modelos alternativos, por lo que la comparacion se limita a caracteristicas arquitectonicas y de licencia. Las cifras de parametros y mAP de COCO de las variantes de YOLOv8 proceden de la documentacion publica de Ultralytics y no son extrapolables al dominio de seguridad en obra.

| Modelo | Parametros | Tarea | Contexto/entrada | Licencia | Rendimiento en EPI |
|---|---|---|---|---|---|
| yolov8m-construction-site-safety | ~25,9 M | Deteccion de objetos (10 clases de obra) | Imagen 640x640 px | MIT | mAP@0.5 81,2 % (autodeclarado) |
| YOLOv8s | ~11,2 M | Deteccion de objetos (80 clases COCO) | Imagen 640x640 px | AGPL-3.0 (Ultralytics) | no disponible |
| YOLOv8l | ~43,7 M | Deteccion de objetos (80 clases COCO) | Imagen 640x640 px | AGPL-3.0 (Ultralytics) | no disponible |
| RT-DETR (variante base) | no disponible con precision | Deteccion de objetos end-to-end | Imagen 640x640 px | MIT / Apache-2.0 segun implementacion | no disponible |

Nota relevante: este checkpoint se distribuye bajo MIT, mientras que los pesos oficiales de Ultralytics se publican bajo AGPL-3.0. Esa diferencia de licencia es el principal argumento practico a favor de este modelo frente a partir directamente de los pesos oficiales, siempre que se asuman las limitaciones de un fine-tuning no documentado.

## Limitaciones y advertencias

- Validacion inexistente: 0 descargas y 0 likes. Las metricas estan autodeclaradas y no han sido reproducidas por terceros.
- Procedencia de los datos desconocida: no se documenta el dataset de entrenamiento ni el de evaluacion, lo que impide evaluar el riesgo de sobreajuste al dominio y de fuga de datos entre train y test.
- Metricas sin contexto: no se indica el umbral de confianza ni el IoU asociados a los valores de precision y recall publicados, ni se desglosan por clase. Un recall del 76,5 % implica que aproximadamente una de cada cuatro instancias no se detecta, lo que es critico cuando la clase no detectada es una no conformidad de seguridad.
- Ambiguedad entre clases complementarias: las clases `Capacete` y `Sem Capacete`, `Mascara` y `Sem Mascara`, y `Colete Refletor` y `Sem Colete` inducen a confusion del modelo cuando la oclusion o la postura impiden ver con claridad la prenda. Es un riesgo intrinseco al diseno del etiquetado.
- Sesgos potenciales: el modelo se ha entrenado presumiblemente con imagenes de obra en Brasil. El rendimiento puede degradarse con condiciones de iluminacion, tipos de EPI, colores o normas de seguridad diferentes a las del conjunto de entrenamiento. No hay evaluacion de sesgo por tono de piel, genero o tipo de cuerpo.
- Riesgo de alucinacion: como cualquier detector, puede producir falsos positivos, especialmente en objetos parcialmente visibles o con patrones similares a un casco o chaleco. En un sistema de alertas esto genera ruido; en un sistema sancionador o de control de acceso, consecuencias indeseadas.
- Dependencia de umbrales: el uso en produccion exige calibrar el umbral de confianza y el NMS sobre datos propios. Los valores por defecto de Ultralytics no estan ajustados a este dominio.
- Idiomas: el modelo no procesa texto. Las unicas cadenas relevantes son los nombres de clase, en portugues de Brasil; su reutilizacion en otros idiomas requiere remapear etiquetas.
- Restricciones de licencia: el checkpoint se publica bajo MIT, lo que permite uso comercial. Sin embargo, la libreria `ultralytics` que lo ejecuta se distribuye bajo AGPL-3.0, y su uso en un servicio en red puede activar obligaciones de copyleft sobre el codigo de la aplicacion. Conviene revisar este punto con asesoria legal antes de un despliegue comercial cerrado.
- Ausencia de tracking nativo: el modelo no asigna identidades persistentes; cualquier metrica de "trabajador incumplidor" requiere un tracker externo y sufre de errores de reidentificacion.
- Sin soporte ni mantenimiento declarado: no se indica versionado, changelog ni compromiso de actualizacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wesleymqsss/yolov8m-construction-site-safety
- Repositorio de Ultralytics: https://github.com/ultralytics/ultralytics
- Documentacion de Ultralytics (YOLOv8, exportacion y despliegue): https://docs.ultralytics.com/
- Pesos oficiales de YOLOv8: https://github.com/ultralytics/assets/releases

Nota: la busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo. Los unicos resultados obtenidos eran paginas de descarga del navegador Google Chrome, sin relacion con el modelo ni con deteccion de EPI. No se han localizado papers, blogs tecnicos, demos ni repositorios adicionales asociados a este checkpoint.
