# stefan-hf/yolov8n-rvlcdip-idcodes

## Resumen

YOLOv8n-rvlcdip-idcodes es un detector de objetos de una sola clase, entrenado por el autor stefan-hf para localizar los codigos identificadores (estilo Bates) que aparecen impresos en las paginas escaneadas de las colecciones RVL-CDIP e IIT-CDIP (Legacy Tobacco Documents). El modelo parte de los pesos preentrenados de Ultralytics YOLOv8 en su variante nano (yolov8n.pt, Ultralytics 8.3.153) y se afina para una unica clase, "id", trabajando con imagenes de 640 px de lado.

El problema que resuelve es el llamado atajo (shortcut) en clasificacion documental: los clasificadores de documentos tienden a aprender el codigo identificador como rasgo discriminativo, lo que infla artificialmente las metricas y oculta la capacidad real de generalizacion. Este detector permite localizar y enmascarar esos codigos tanto en la imagen como en el texto OCR derivado, y asi construir versiones de RVL-CDIP y Tobacco3482 sin ese atajo.

Es relevante porque es un componente instrumental publicado junto al articulo "Spurious Cues in RVL-CDIP and Tobacco3482 Document Classification: The Case of ID Codes" (DocEng '25). Su ambito es estrecho y esta declarado como tal: el autor advierte que solo se entreno sobre escaneos de la industria tabacalera y que no debe usarse como herramienta general de anonimizacion.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos YOLOv8, variante nano (yolov8n): red convolucional de una etapa, sin anclas, con cabeza de deteccion desacoplada |
| Parametros totales | no disponible en la informacion proporcionada (corresponde a la variante nano de la familia YOLOv8) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; la entrada es una imagen de 640 px) |
| Tipos de cuantizacion | no disponible; el repositorio distribuye un unico archivo de pesos en precision completa |
| Idiomas soportados | no aplica (no procesa texto; opera sobre imagenes de paginas escaneadas) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (.pt), archivo yolov8n-idcodes.pt |
| Tarea (pipeline) | object-detection |
| Clases | 1 ("id") |
| Tamano de entrada | 640 px |
| Modelo base | Ultralytics/YOLOv8 (yolov8n.pt), Ultralytics 8.3.153 |
| Libreria | ultralytics |
| Tamano del repositorio | 0.0 GB segun HuggingFace |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura es la de YOLOv8 en su variante nano, un detector de objetos de una etapa que predice cajas directamente a partir de caracteristicas convolucionales multi-escala, sin propuestas de region y sin anclas predefinidas. La cabeza de deteccion es desacoplada (ramas separadas para clasificacion y regresion de cajas) y el modelo trabaja sobre imagenes redimensionadas a 640 px. Al derivar de yolov8n, se trata de la configuracion mas ligera de la familia, orientada a inferencia rapida en hardware modesto.

Los datos de afinado son un muestreo de 8.000 paginas de RVL-CDIP para entrenamiento y las 3.482 paginas de Tobacco3482 para validacion. El entrenamiento duro 50 epocas con tamano de lote 32 e imagenes de 640 px; los hiperparametros completos estan en args.yaml y las metricas por epoca en results.csv del repositorio. No se documenta en la model card el uso de RLHF, DPO ni tecnicas de alineacion (no aplicables a un detector de objetos), ni innovaciones como decodificacion especulativa o atencion lineal. La unica funcion anadida respecto al modelo base es la especializacion en la clase "id" y el objetivo de uso: enmascarar esos codigos para eliminar un atajo espurio en la clasificacion documental.

## Capacidades

- Deteccion de codigos identificadores (estilo Bates) en paginas escaneadas, con salida de coordenadas en pixeles de cada caja detectada.
- Deteccion de una unica clase ("id"), no de categorias documentales ni de otros elementos de la pagina.
- Salida compatible con umbrales de confianza y con el pipeline estandar de Ultralytics (cajas xyxy, confianza, clases).
- Enmascarado posterior: las coordenadas permiten tapar con blanco la region detectada en la imagen, tanto en el ejemplo de la model card como en el uso descrito.
- Aplicable a las colecciones RVL-CDIP, Tobacco3482 e IIT-CDIP, de las que proceden los datos de entrenamiento y validacion.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, vision multimodal ni procesamiento de audio o texto.
- No procesa lenguaje natural ni OCR: para eliminar el codigo del texto OCR hay que proyectar las coordenadas de la caja sobre la salida del OCR por separado.

## Casos de uso

- Limpieza de benchmarks de clasificacion documental: detectar y enmascarar los ID codes de RVL-CDIP y Tobacco3482 para reentrenar clasificadores sin el atajo, reproduciendo el experimento del articulo DocEng '25 y comprobando si las metricas caen.
- Auditoria de fuga de informacion (data leakage) en datasets: cuantificar cuantos documentos de un split contienen codigos identificadores y si la particion train/test comparte codigos, un indicio clasico de contaminacion.
- Preprocesado de pipelines OCR: ejecutar el detector antes del OCR para tapar el codigo en la imagen y evitar que se cuele como token de texto en el indice.
- Anonimizacion de identificadores en corpus de descubrimiento documental (litigios tabacaleros y colecciones IIT-CDIP): localizar las marcas Bates antes de publicar o compartir los escaneos.
- Control de calidad en digitalizacion de archivos: verificar de forma automatizada que las paginas digitalizadas incluyen (o no) el codigo esperado segun el lote y la serie documental.
- Punto de partida para fine-tuning en otros dominios: reutilizar los pesos como inicializacion y reentrenar con etiquetas propias cuando el estilo de codigo o la maquetacion difieran del corpus original.
- Analisis de correlacion entre codigo y clase documental: usar las coordenadas detectadas como variable auxiliar en estudios sobre sesgos y atajos en clasificadores de documentos.

## Benchmarks y rendimiento

Resultados publicados en la model card, sobre el conjunto de validacion Tobacco3482 (3.482 paginas) en la epoca 50:

| Metrica | Valor |
|---|---|
| Precision | 0.974 |
| Recall | 0.968 |
| mAP50 | 0.987 |
| mAP50-95 | 0.851 |

No se han publicado en la informacion disponible resultados comparativos con otros detectores sobre esta misma tarea, ni metricas de latencia o throughput. El autor aporta ademas resultados.csv con las metricas por epoca.

## Requisitos de hardware

- VRAM estimada: no disponible en la model card. Por tratarse de la variante nano de YOLOv8 con entrada de 640 px, es previsible que la inferencia quepa en menos de 1 GB en FP16 para lotes pequenos, pero no se aporta una cifra verificada. Estimation no confirmada por el autor.
- GPU recomendadas: no documentadas. La variante nano esta pensada para hardware de gama baja, por lo que cualquier GPU de consumo reciente es suficiente; tambien es viable la inferencia en CPU.
- GPU de consumo: si, cabe en tarjetas de consumo e incluso en CPU, dado el tamano de la variante nano (dato no confirmado con mediciones en la model card).
- Opciones de despliegue: la model card solo documenta inferencia mediante la libreria Ultralytics en Python (YOLO + hf_hub_download). No se detallan otros backends ni conversiones a ONNX, TensorRT, OpenVINO o TFLite.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| stefan-hf/yolov8n-rvlcdip-idcodes | Deteccion de ID codes (1 clase) | no disponible (variante nano) | 640 px | AGPL-3.0 | HuggingFace; 0 descargas y 0 likes |
| Ultralytics YOLOv8n (modelo base) | Deteccion generica (COCO, 80 clases) | no disponible en la informacion proporcionada | 640 px | AGPL-3.0 | Modelo base del que deriva este afinado |
| Otros detectores especificos de ID codes | Deteccion de identificadores Bates | no disponible | no disponible | no disponible | No se han identificado alternativas publicas en la informacion disponible |

No se dispone de datos de benchmark comparativos entre este modelo y alternativas de la misma categoria dentro de la documentacion facilitada.

## Limitaciones y advertencias

- Dominio restringido: solo se entreno con escaneos de la industria tabacalera (RVL-CDIP / IIT-CDIP) y no se ha probado en otras colecciones, donde el estilo de los codigos y la maquetacion de pagina pueden diferir.
- No es una herramienta de anonimizacion general: no detecta nombres, direcciones, firmas ni otros datos personales, unicamente codigos identificadores.
- Riesgo de fuga por falsos negativos: una deteccion fallida deja el codigo visible, por lo que el autor recomienda revisar una muestra del resultado enmascarado antes de confiar en el proceso.
- Validacion sesgada al origen: Tobacco3482 procede de la misma coleccion fuente que RVL-CDIP, de modo que se espera una precision menor en documentos de otras procedencias.
- Licencia AGPL-3.0: es una licencia copyleft fuerte. El uso en productos propietarios o en servicios ofrecidos por red exige analizar con cuidado las obligaciones de publicacion del codigo fuente; esta restriccion es relevante para integraciones comerciales.
- Sin validacion de la comunidad: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia externa de reproducibilidad mas alla de las metricas del autor.
- Sesgos conocidos: no se documentan analisis de sesgo por tipo de documento, epoca, idioma o calidad de escaneo.
- El modelo opera exclusivamente sobre pixeles: no realiza OCR, por lo que la eliminacion del codigo en la capa de texto requiere un paso adicional de proyeccion de coordenadas.
- La fecha de creacion del repositorio indicada por HuggingFace (2026-09-25) es posterior a la fecha de publicacion del articulo citado (agosto de 2025); no se dispone de explicacion en la informacion proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stefan-hf/yolov8n-rvlcdip-idcodes
- Imagen de ejemplo (deteccion y enmascarado): https://huggingface.co/stefan-hf/yolov8n-rvlcdip-idcodes/resolve/main/example.png
- Grafica de resultados de entrenamiento: https://huggingface.co/stefan-hf/yolov8n-rvlcdip-idcodes/resolve/main/results.png
- Articulo citado (DocEng '25): https://doi.org/10.1145/3704268.3748683
- Modelo base (tag): Ultralytics/YOLOv8
- Ficheros de configuracion y metricas en el repositorio: args.yaml y results.csv
