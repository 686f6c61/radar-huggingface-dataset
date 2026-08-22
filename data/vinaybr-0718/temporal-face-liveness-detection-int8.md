# vinaybr-0718/Temporal-Face-Liveness-Detection-INT8

## Resumen

El modelo Temporal Face Liveness Detection INT8 es un clasificador de vídeo diseñado para distinguir entre una cara real y una presentación falsa (anti-spoofing). Desarrollado por el usuario vinaybr-0718, forma parte de un proyecto de detección de viveza facial que combina un backbone MobileNetV3-Small con atención CBAM y una célula LSTM para modelar la dimensión temporal. El modelo procesa una secuencia de 10 fotogramas RGB de 224×224 junto con 8 características de sensor por fotograma, lo que permite detectar ataques de presentación como fotos, vídeos o máscaras.

El modelo se ha entrenado en PyTorch y se ha exportado a ONNX y posteriormente a TensorFlow Lite con cuantización INT8, lo que resulta en un archivo de aproximadamente 1,58 MB, adecuado para inferencia en dispositivos con recursos limitados. La licencia es MIT, lo que permite uso comercial y modificación sin restricciones significativas. La arquitectura es ligera y está optimizada para despliegue en tiempo real en aplicaciones de autenticación, control de acceso y verificación de identidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV3-Small + CBAM + LSTM (desplegada manualmente) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 10 fotogramas (secuencia temporal) |
| Tipos de cuantizacion | INT8 (TFLite), también disponibles FP32 y FP16 en el repositorio original |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | MIT |
| Formato de pesos | TFLite (liveness_model_int8.tflite), también ONNX y PyTorch |

## Arquitectura y entrenamiento

La arquitectura combina un extractor visual MobileNetV3-Small preentrenado, que procesa cada uno de los 10 fotogramas RGB de entrada. Tras el backbone, un módulo CBAM (Convolutional Block Attention Module) aplica atención en los canales y en el espacio para resaltar las características relevantes. Las características visuales de 576 dimensiones se concatenan con un vector de 8 características de sensor por fotograma, dando un vector de 584 dimensiones que se proyecta a 256 y luego a 128. Esta secuencia de vectores se procesa mediante una célula LSTM desplegada manualmente durante 10 pasos de tiempo, lo que permite capturar la dinámica temporal del movimiento facial. El estado final de la LSTM (128 dimensiones) se proyecta a 64 y finalmente a un logit único que indica viveza.

El entrenamiento se realizó con PyTorch, usando el optimizador Adam con una tasa de aprendizaje inicial de 1e-4 y un tamaño de lote de 4. No se especifica el dataset ni el número de tokens (no aplica). La conversión a TFLite INT8 se realizó a partir del modelo ONNX, con parámetros de cuantización específicos para las entradas y la salida, lo que permite una inferencia eficiente en CPU y dispositivos embebidos.

## Capacidades

- Clasificación binaria de viveza facial: determina si una secuencia de vídeo contiene una cara real o un ataque de presentación.
- Procesamiento multimodal: combina información visual (frames RGB) con datos de sensores (por ejemplo, acelerómetro, giroscopio, profundidad) para mejorar la robustez.
- Análisis temporal: el uso de LSTM permite capturar movimientos y microexpresiones que distinguen una cara viva de una foto o vídeo.
- Inferencia ligera: el modelo en TFLite INT8 tiene un tamaño de 1,58 MB y está optimizado para ejecutarse en dispositivos con recursos limitados.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un clasificador de vídeo de un solo propósito.

## Casos de uso

- Autenticación en aplicaciones móviles: el modelo puede integrarse en un flujo de inicio de sesión biométrico para verificar que el usuario está presente en tiempo real, evitando el uso de fotos o vídeos.
- Procesos KYC (Know Your Customer): en plataformas de verificación de identidad, el modelo puede evaluar una secuencia de frames capturada por la cámara del usuario para asegurar que la persona está viva antes de aceptar documentos de identidad.
- Control de acceso físico: en sistemas de acceso con reconocimiento facial, el modelo puede añadir una capa anti-spoofing para evitar que se engañe al sistema con imágenes impresas o pantallas.
- Asistencia y registro de presencia: en sistemas de marcaje de asistencia, se puede usar el modelo para confirmar que el empleado está presente físicamente, no solo con una fotografía.
- Prevención de fraude en transacciones financieras: en operaciones de alto riesgo que requieren verificación biométrica, el modelo puede validar la viveza del usuario antes de autorizar la transacción.
- Sistemas de vigilancia y seguridad: como componente de un pipeline más amplio, el modelo puede ayudar a identificar intentos de suplantación en cámaras de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como precisión, recall o F1 en el modelo card ni en los repositorios asociados.

## Requisitos de hardware

- El modelo TFLite INT8 es extremadamente ligero (1,58 MB) y puede ejecutarse en CPU, sin necesidad de GPU dedicada.
- Se recomienda una Raspberry Pi 4 o un dispositivo móvil con Android o iOS para inferencia en tiempo real.
- El consumo de memoria es bajo: la entrada de 10 frames de 224×224 en int8 ocupa aproximadamente 10 × 3 × 224 × 224 = 1,5 MB, y el modelo completo cabe en la RAM de cualquier dispositivo moderno.
- Las opciones de despliegue incluyen TensorFlow Lite Interpreter, que está disponible para Python, Android, iOS y microcontroladores. También se puede usar el runtime de ONNX si se convierte de nuevo a ONNX.
- No se proporcionan datos de latencia o throughput, pero dada la arquitectura ligera se espera inferencia en tiempo real en dispositivos de gama media.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo ni de comparaciones con alternativas. Sin embargo, en el ámbito de detección de viveza facial existen otros modelos, como los basados en Vision Transformer (ViT) que se encuentran en Hugging Face (por ejemplo, `jdp8/vit_Liveness_detection_v1.0`). A diferencia de este modelo, que es multimodal y temporal, muchos de esos modelos son clasificadores de imagen estática. No se pueden establecer comparaciones cuantitativas sin datos de benchmarks.

## Limitaciones y advertencias

- El modelo es sensible a condiciones de iluminación deficiente, desenfoque de movimiento, baja calidad de la cámara, cambios de pose grandes, caras pequeñas o parcialmente visibles. En esos escenarios el rendimiento puede degradarse.
- No se ha entrenado con técnicas de spoofing desconocidas; puede fallar ante ataques novedosos no vistos en el entrenamiento.
- La entrada esperada es una secuencia fija de 10 fotogramas consecutivos; si se proporciona una sola imagen o frames desordenados, la salida no será fiable.
- La entrada de sensores es parte del interfaz; si se usan valores de sensor irreales (por ejemplo, ceros), el modelo puede no comportarse correctamente.
- El modelo no debe considerarse un sistema completo de verificación de identidad; solo es un componente de detección de viveza que debe integrarse en un pipeline más amplio.
- La cuantización INT8 introduce una pérdida de precisión respecto a la versión FP32, aunque se compensa con la ganancia de eficiencia.
- No se proporcionan datos sobre sesgos o equidad; se desconoce su comportamiento en distintos grupos demográficos.

## Enlaces

- Hugging Face: https://huggingface.co/vinaybr-0718/Temporal-Face-Liveness-Detection-INT8
- Repositorio GitHub: https://github.com/VinayBR03/Face-Liveness-Detection
- Modelo TFLite en GitHub: https://github.com/VinayBR03/Face-Liveness-Detection/blob/main/liveness_model_int8.tflite
- Página de proyecto (demo): https://dinesh-raina.github.io/Liveness_FaceDetection/
