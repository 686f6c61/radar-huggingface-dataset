# strangelab/paddleocr-doc-orientation-onnx-int8-storage

## Resumen

Este repositorio contiene una versión cuantizada a 8 bits del clasificador de orientación de documentos de PaddleOCR, derivada del modelo oficial `PaddlePaddle/PP-LCNet_x1_0_doc_ori_onnx`. Lo publica el usuario `strangelab` (Strange Lab) y su propósito es reducir el tamaño del archivo del modelo manteniendo el mismo comportamiento que el original. El modelo predice la orientación de una página escaneada en cuatro clases (0°, 90°, 180° y 270°) para enderezarla antes de pasarla por el motor de OCR.

La arquitectura subyacente es PP-LCNet_x1_0, una red convolucional ligera de clasificación de imágenes de PaddlePaddle, exportada a formato ONNX (opset 9). La modificación consiste en convertir 31 tensores de pesos convolucionales a almacenamiento entero con signo de 8 bits, con una escala independiente por canal de salida; la primera convolución, el clasificador, los sesgos y los parámetros de normalización conservan su precisión original. El resultado es un grafo que pesa 1,87 MB frente a los 6,79 MB del ONNX oficial, un ahorro del 72,5 % en el archivo del modelo.

Es relevante para quienes ya usan PaddleOCR y descargan el modelo de orientación por separado: el checkpoint ahorra 4,92 MB por instalación y se integra con el mismo motor ONNX Runtime sin cambios en el código. La inferencia sigue siendo en FP32, ya que ONNX Runtime reconstruye los pesos almacenados en 8 bits, de modo que la cuantización afecta al almacenamiento, no al coste computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PP-LCNet_x1_0 (CNN ligera de clasificacion de imagenes), exportada a ONNX opset 9 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | Almacenamiento int8 con signo en 31 tensores de pesos convolucionales, escala por canal de salida; inferencia en FP32 |
| Idiomas soportados | no disponible (clasificador de orientacion, independiente del idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (grafo con pesos int8 almacenados), con manifest para el SDK web |
| Tamano del archivo del modelo | 1,87 MB (frente a 6,79 MB del ONNX oficial) |
| Pipeline | image-classification |
| Libreria | PaddleOCR |
| Modelo base | PaddlePaddle/PP-LCNet_x1_0_doc_ori_onnx |

## Arquitectura y entrenamiento

El modelo es un clasificador convolucional PP-LCNet_x1_0 de PaddlePaddle, diseñado para clasificar la orientación de páginas escaneadas en cuatro clases discretas. La red procesa la imagen con el preprocesamiento original de PaddleOCR y produce cuatro probabilidades FP32, una por orientación. No se dispone de información sobre el dataset de entrenamiento original (número de tokens no aplica, composición de imágenes, técnicas de aumento de datos) más allá de lo que publique PaddlePaddle en el modelo base.

La innovación de esta versión es exclusivamente de compresión: Strange Lab convirtió 31 tensores de pesos convolucionales a almacenamiento int8 con signo, con una escala separada por canal de salida, dejando en precisión original la primera convolución, el clasificador, los sesgos y los parámetros de normalización. El grafo mantiene ONNX opset 9 y las cuatro salidas de probabilidad en FP32. ONNX Runtime reconstruye los pesos para inferencia en FP32, por lo que la cuantización reduce el tamaño de descarga y almacenamiento, no el coste de cómputo en tiempo de ejecución.

## Capacidades

- Clasificación de orientación de documentos en cuatro clases: 0°, 90°, 180° y 270°.
- Enderezado de páginas escaneadas antes del pipeline de OCR, integrable como paso previo en PaddleOCR (`doc_preprocessor`).
- Uso directo como clasificador de orientación (`doc_img_orientation_classification`) para obtener solo el ángulo.
- Ejecución en CPU mediante ONNX Runtime (probado con `onnxruntime==1.32.0`).
- Ejecución en navegador mediante el SDK JavaScript `web-sdk-pp-lcnet-x1-0-doc-ori` con backend WASM y ONNX Runtime Web 1.27.0.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un clasificador de imágenes.

## Casos de uso

- Digitalización de archivos históricos: el modelo endereza páginas de libros y manuscritos escaneados con orientaciones variables antes de pasarlas por OCR; en la evaluación del autor se probó con 183 páginas de cuatro libros históricos, seis manuales y tres horarios públicos.
- Procesamiento por lotes de formularios: en las 50 muestras de test de FUNSD clasificó correctamente 199 de 200 vistas, lo que lo hace adecuado para pipelines de captura de formularios administrativos.
- Preprocesado en aplicaciones de escaneo móvil: al pesar 1,87 MB y ejecutarse en CPU (unos 4,0 ms de mediana en caliente en un hilo de Apple M4, sin preprocesamiento), encaja en apps que necesitan corregir la orientación en el dispositivo.
- OCR en el navegador: el SDK JavaScript con backend WASM permite enderezar documentos sin enviar la imagen a un servidor, útil para aplicaciones web de digitalización con requisitos de privacidad.
- Mejora de la tasa de acierto de motores OCR de terceros: en la prueba del autor, con las imágenes corregidas Tesseract recuperó el 86,87 % de las palabras de referencia, frente al 24,70 % sin corregir la orientación.
- Integración en pipelines PaddleOCR existentes: sustituye al modelo de orientación oficial sin cambios de código, reduciendo el tamaño de la descarga en 4,92 MB por instalación.
- Automatización de la rotación en sistemas de gestión documental: clasificar la orientación permite decidir si se rota la imagen antes de archivarla o de aplicar recorte y detección de tablas.

## Benchmarks y rendimiento

| Prueba | Vistas evaluadas | Este modelo | Modelo oficial ONNX | Notas |
|---|---|---|---|---|
| Libros historicos, manuales y horarios | 732 | 730 correctas | 730 correctas | Decisiones identicas en las 732 vistas; ambos fallan en dos vistas de la misma pagina de horario |
| FUNSD (test) | 200 | 199 correctas | 199 correctas | Decisiones identicas en todas las vistas; cuatro vistas comparten una pagina fuente |
| Imagenes corregidas (subconjunto de 12 paginas x 4 orientaciones) | 48 | Identicas al oficial | Identicas | Tesseract recupera 86,87 % de palabras con correccion, 24,70 % sin correccion |

| Metrica | Valor |
|---|---|
| Tamano del archivo del modelo | 1,87 MB (oficial: 6,79 MB; ahorro del 72,5 %) |
| Latencia de inferencia en caliente (1 hilo de CPU Apple M4) | ~4,0 ms de mediana, sin preprocesamiento |
| Carga en frio del runtime WASM en navegador | 26,83 MB adicionales |

Comparación con OnnxTR citada por el autor: OnnxTR ofrece un clasificador de cuatro orientaciones de 1,72 MB; dos versiones de 8 bits publicadas identificaron correctamente las 200 vistas de formularios con el cargador de OnnxTR y obtuvieron 671 y 693 aciertos sobre las 732 vistas de libros, manuales y horarios, frente a los 730 de este modelo. La forma de entrada, el nombre de entrada y el preprocesamiento difieren de los de PaddleOCR.

## Requisitos de hardware

- VRAM: no aplica; el modelo está pensado para CPU y para navegador con WASM. No se han publicado requisitos de GPU.
- GPU recomendadas: no disponible; no se documenta uso en GPU.
- Cabe en cualquier GPU de consumo y en CPU doméstica: el archivo pesa 1,87 MB y la inferencia en FP32 es de milisegundos.
- Opciones de despliegue: ONNX Runtime (CPU), PaddleOCR 3.7.0 con PaddleX 3.7.2 y `engine onnxruntime`, y SDK JavaScript `web-sdk-pp-lcnet-x1-0-doc-ori` con backend WASM.
- Latencia: ~4,0 ms de mediana en caliente en un hilo de CPU Apple M4, excluyendo preprocesamiento.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tamano del archivo | Clases | Licencia | Entorno | Aciertos en 732 vistas (libros, manuales, horarios) |
|---|---|---|---|---|---|
| Este modelo (strangelab, int8) | 1,87 MB | 4 orientaciones | Apache 2.0 | PaddleOCR + ONNX Runtime | 730 |
| PaddlePaddle/PP-LCNet_x1_0_doc_ori_onnx (oficial) | 6,79 MB | 4 orientaciones | Apache 2.0 | PaddleOCR + ONNX Runtime | 730 |
| OnnxTR clasificador de 8 bits (version 1) | 1,72 MB | 4 orientaciones | no disponible en la informacion | OnnxTR | 671 |
| OnnxTR clasificador de 8 bits (version 2) | 1,72 MB | 4 orientaciones | no disponible en la informacion | OnnxTR | 693 |

## Limitaciones y advertencias

- Solo clasifica cuatro orientaciones discretas (0°, 90°, 180°, 270°); no corrige inclinaciones arbitrarias ni perspectiva.
- La evaluación cubre tipos de documento muestreados (libros históricos, manuales, horarios y formularios FUNSD); no hay garantía de comportamiento en otros dominios (facturas, radiografías, capturas de pantalla).
- La cuantización afecta solo al almacenamiento: la inferencia sigue en FP32, por lo que no se reduce el coste computacional ni la memoria en ejecución.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente más allá de las pruebas del propio autor.
- No se documentan sesgos; al ser un clasificador de orientación, el riesgo de sesgo se limita a posibles diferencias de precisión según el tipo de documento o la calidad del escaneo.
- Riesgo de alucinación no aplica (no genera texto), pero sí puede clasificar erróneamente vistas ambiguas, como muestran los dos fallos sobre la misma página de horario.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y de las dependencias (PaddleOCR, PaddleX, ONNX Runtime) para producción.
- En navegador, la primera carga descarga 26,83 MB de runtime WASM, lo que puede ser problemático en conexiones lentas o dispositivos con poca memoria.
- El manifest del SDK web está adaptado por el autor del SDK a partir de su propio manifest Apache 2.0; conviene revisar su mantenimiento antes de depender de él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/strangelab/paddleocr-doc-orientation-onnx-int8-storage
- Modelo base: https://huggingface.co/PaddlePaddle/PP-LCNet_x1_0_doc_ori_onnx
- Fuente fijada del modelo base y configuracion: https://huggingface.co/PaddlePaddle/PP-LCNet_x1_0_doc_ori_onnx/tree/7330ab7039123e46af2dc03154b9969aa412c61d
- SDK y configuracion del runtime web: https://github.com/chenmohan123/web-sdk-PP-LCNet_x1_0_doc_ori
- OnnxTR: https://github.com/felixdittrich92/OnnxTR
- Dataset FUNSD: https://guillaumejaume.github.io/FUNSD/
- Imagen de ejemplo de Paddle: https://paddle-model-ecology.bj.bcebos.com/paddlex/imgs/demo_image/img_rot180_demo.jpg
