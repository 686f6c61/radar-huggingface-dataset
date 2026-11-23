# wesjos/YOLO26n-face-detection-cut-P3

## Resumen

YOLO26n Face Detector es un modelo de deteccion de objetos de clase unica (rostros) desarrollado por el usuario wesjos y publicado en Hugging Face bajo licencia AGPL-3.0. Se construye a partir de la arquitectura Ultralytics YOLO26n, la variante mas pequena de la familia YOLO26, modificada mediante la eliminacion completa de la rama de deteccion P3 (la rama de alta resolucion sensible a objetos pequenos). El resultado es un detector especializado en rostros de tamano medio y grande con un coste computacional reducido.

El modelo opera con una resolucion de entrada fija de 320x320 pixeles y produce una unica caja delimitadora con su puntuacion de confianza por cada rostro detectado. Esta disenado explicitamente para escenarios donde los rostros ocupan al menos el 2% del encuadre, como videoconferencias, control de acceso de corto alcance o transmisiones en directo. La clase almacenada en los pesos es `head`, heredada del dataset de entrenamiento, aunque las cajas cubren la region facial.

Su relevancia radica en la especializacion: al eliminar la rama P3 se reduce el coste computacional en un 17,5% (de 1,450 a 1,196 GFLOPs a 320x320) manteniendo un rendimiento alto en el rango de tamanos objetivo, con un mAP50-95 de 0,930 a la resolucion de entrenamiento. Es un modelo ligero, orientado a inferencia en tiempo real incluso en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n (Ultralytics) con rama de deteccion P3 eliminada; detect heads P4 y P5 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Resolucion de entrada | 320x320 fija (obligatoria) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos PyTorch y ONNX) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (.pt) y ONNX |
| Clases | 1 (`head`) |
| GFLOPs | 1,196 @320x320 (frente a 1,450 del YOLO26n estandar) |
| Libreria | ultralytics |

## Arquitectura y entrenamiento

El modelo parte de YOLO26n, la variante nano de la familia YOLO26 de Ultralytics. La modificacion arquitectonica consiste en la eliminacion completa de la rama P3: no solo se suprime el detect head de P3, sino toda la ruta que conduce a el (upsample, concatenacion y convoluciones). Segun la model card, eliminar solo el head ahorra aproximadamente un 2,5% de computo (1,450 a 1,414 GFLOPs), mientras que eliminar la rama completa ahorra un 17,5% (1,450 a 1,196 GFLOPs). Tras la fusion de BatchNorm, la comparacion es de 1,2% y 17,5% respectivamente. La red conserva unicamente las ramas P4 (resolucion 1/16, objetos medios) y P5 (resolucion 1/32, objetos grandes).

El entrenamiento se realizo sobre el conjunto completo de anotaciones, sin descartar ninguna caja delimitadora. La model card no especifica el numero de imagenes, tokens ni la composicion exacta del dataset, ni menciona el uso de RLHF, DPO u otras tecnicas de alineacion (no aplicables a un detector). La resolucion de entrenamiento es 320x320 y el autor advierte que cambiarla a 640 degrada gravemente la precision (el mAP50-95 cae de 0,930 a 0,686). El modelo incluye una definicion propia de buckets por tamano de caja: tiny (<2% del area de la imagen), mid (2-10%) y large (>10%), estandarizando el umbral en 2%.

## Capacidades

- Deteccion de rostros de clase unica: devuelve una caja delimitadora (x1, y1, x2, y2) y una puntuacion de confianza por cada rostro.
- Deteccion optimizada para rostros de tamano medio y grande (area de caja mayor o igual al 2% del encuadre).
- Inferencia en tiempo real con bajo coste computacional (1,196 GFLOPs a 320x320).
- Ejecucion en CPU y en GPU; compatible con el pipeline de Ultralytics y con ONNX Runtime.
- Exportacion a ONNX para despliegue en entornos sin PyTorch.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades linguisticas (es un modelo puramente de vision).
- No detecta rostros pequenos (por debajo del 2% del encuadre), como los de vigilancia de largo alcance o multitudes densas vistas desde el aire.

## Casos de uso

- Videoconferencia y reuniones remotas: el modelo detecta los rostros de los participantes en cada fotograma para encuadre automatico, difuminado de fondo o seguimiento del hablante, ya que los rostros suelen ocupar mas del 2% del encuadre de una webcam.
- Control de acceso de corto alcance: en un punto de entrada con camara frontal, el modelo localiza el rostro del usuario para alimentar un pipeline posterior de reconocimiento facial, con latencia baja gracias a sus 1,196 GFLOPs.
- Transmisiones en directo: procesamiento de fotogramas de streams para censura automatica de rostros o generacion de estadisticas de audiencia, aprovechando la inferencia en tiempo real incluso en CPU.
- Camaras frontales de telefono: deteccion de rostros en aplicaciones moviles con entrada fija de 320x320, adecuada para el rango de resolucion de las camaras frontales y escenas de primer plano.
- Analisis de fotogramas de video grabado: extraccion de cajas faciales por fotograma para tareas de post-produccion, etiquetado o anonimizacion, con la advertencia de que los rostros deben superar el 2% del area.
- Preprocesado para pipelines de vision: primer paso de deteccion que recorta la region facial y la pasa a un modelo secundario (reconocimiento de emociones, estimacion de pose, verificacion de identidad) en escenarios de primer plano.
- Prototipado y experimentacion: modelo ligero para validar rapidamente pipelines de deteccion facial en entornos de desarrollo con recursos limitados, exportable a ONNX.

## Benchmarks y rendimiento

La model card reporta las siguientes metricas de validacion:

| Metrica | Valor |
|---|---|
| mAP50-95 @320x320 (resolucion de entrenamiento) | 0,930 |
| mAP50-95 @640x640 (resolucion no nativa) | 0,686 |
| GFLOPs @320x320 (rama P3 eliminada) | 1,196 |
| GFLOPs @320x320 (YOLO26n estandar) | 1,450 |

La model card menciona que las afirmaciones de significancia estadistica se basan en un paired bootstrap con 1.000 remuestreos a nivel de imagen y un intervalo de confianza del 95%. No se proporcionan resultados desglosados por bucket de tamano (tiny/mid/large) en la informacion disponible, ni comparaciones numericas con otros detectores faciales.

## Requisitos de hardware

- VRAM estimada: al ser un modelo nano con 1,196 GFLOPs a 320x320, la inferencia cabe holgadamente en cualquier GPU consumer; la VRAM necesaria es del orden de cientos de MB, aunque la cifra exacta no esta disponible en la informacion proporcionada.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo esta pensado para ejecutarse incluso en CPU. GPU de datacenter (A100, H100) no son necesarias para este modelo.
- Cabe en GPU consumer: si, en cualquier GPU consumer (RTX 4090, RTX 3060, e incluso GPUs integradas) y en CPU.
- Opciones de despliegue: Ultralytics (libreria nativa), ONNX Runtime (exportacion ONNX incluida), OpenCV para pre/post-procesado. No se mencionan vLLM, llama.cpp ni Ollama (no aplicables a un detector de vision).
- Latencia y throughput: la model card menciona mediciones en ms/imagen con distintos tamanos de batch (b1, b8, b32, b64) y ejecucion en CPU con ultralytics 8.4.211, pero los valores numericos concretos no estan disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | mAP50-95 | Licencia | Notas |
|---|---|---|---|---|---|
| YOLO26n Face Detector (este) | no disponible | 320x320 fija | 0,930 | AGPL-3.0 | Rama P3 eliminada; solo rostros medios/grandes |
| YOLO26n estandar | no disponible | configurable | no disponible | AGPL-3.0 | 3 ramas (P3+P4+P5); 1,450 GFLOPs @320 |
| Detectores faciales genericos | no disponible | variable | no disponible | variable | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de benchmarks de modelos alternativos de deteccion facial en la informacion proporcionada, por lo que la comparativa cuantitativa con alternativas no esta disponible.

## Limitaciones y advertencias

- No detecta rostros pequenos: la eliminacion de la rama P3 implica que los rostros que ocupan menos del 2% del encuadre (menos de 45x45 px a 320) no se detectan. No es adecuado para vigilancia de largo alcance, multitudes densas desde el aire ni miniaturas de fotos de carnet.
- Resolucion de entrada fija: usar `imgsz` distinto de 320 degrada gravemente la precision (mAP50-95 de 0,930 a 0,686 a 640). Es obligatorio mantener 320x320.
- Post-procesado obligatorio: la salida ONNX en bruto requiere NMS; sin el, un mismo rostro genera multiples cajas solapadas.
- Etiqueta de clase heredada: la clase almacenada es `head`, no `face`, lo que puede confundir en integraciones que esperen una etiqueta facial.
- Licencia AGPL-3.0: impone obligaciones de copyleft para uso en red; es necesario revisar su compatibilidad antes de un uso comercial o en productos propietarios.
- Riesgo de falsos positivos y negativos segun el umbral de confianza (por defecto 0,25); la model card documenta el efecto del umbral sobre precision y recall.
- Sesgos: no se documentan sesgos demograficos, de iluminacion o de etnia en la informacion proporcionada; al ser un modelo entrenado sobre un dataset no especificado, el rendimiento puede variar entre poblaciones y condiciones de captura.
- Datos de entrenamiento no detallados: no se especifica el numero de imagenes ni la composicion del dataset, lo que dificulta evaluar la cobertura.
- Uso responsable: la deteccion facial tiene implicaciones de privacidad; debe cumplirse la normativa aplicable (por ejemplo, RGPD en la UE).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wesjos/YOLO26n-face-detection-cut-P3
- Ultralytics (libreria y documentacion): https://github.com/ultralytics/ultralytics
- Ultralytics YOLO26: https://docs.ultralytics.com/models/yolo26/
- ONNX Runtime: https://onnxruntime.ai/
- Licencia AGPL-3.0: https://www.gnu.org/licenses/agpl-3.0.html
