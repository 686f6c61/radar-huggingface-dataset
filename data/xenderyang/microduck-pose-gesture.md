# XenderYang/microduck-pose-gesture

## Resumen

MicroDuck Pose-Gesture es un modelo de visión por computadora desarrollado por XenderYang para el robot pato de la serie MicroDuck. Se trata de un detector de personas y gestos basado en la arquitectura YOLO11m-pose, entrenado con datos sintéticos específicamente para el entorno de una cámara frontal montada en el robot. El modelo resuelve el problema de reconocer la posición del cuerpo y los gestos de las extremidades superiores de una persona desde el punto de vista del robot, lo que permite interacciones sociales y de control mediante gestos en tiempo real.

La relevancia del modelo radica en su enfoque sim-first, es decir, está diseñado para entrenarse en simulación y transferirse al mundo real. Utiliza un dataset sintético con etiquetas de keypoints generadas por el propio renderizador y técnicas de aleatorización de dominio para mejorar la generalización. El modelo se distribuye en formato ONNX, lo que facilita su integración en pipelines robóticos y sistemas embebidos. Los datos de validación indican una precisión media (mAP50) de 0.995 en la detección de cajas y 0.85 en la estimación de pose. El repositorio tiene un tamaño de 0.1 GB y no publica el número de parámetros.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11m-pose (v8) |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión) |
| Tipos de cuantizacion | ONNX (sin cuantización especificada) |
| Idiomas soportados | No aplica (modelo de visión) |
| Licencia | no disponible |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

Es un modelo de detección de pose de una sola etapa basado en YOLO11m-pose. El contrato de inferencia es un tensor de entrada `[1,3,480,480]` y una salida `[1,56,4725]`, correspondiente a la decodificación estándar de YOLOv8/YOLO11 para pose. La entrada de entrenamiento se especifica a 320x240, mientras que el despliegue se realiza a 640x480, con una cámara IMX219-like de 62° HFOV, 40° de pitch de cabeza y una altura de ojo de 25 cm.

El entrenamiento se realizó con un dataset sintético v8, que genera etiquetas de keypoints exactas utilizando el propio renderizador. Se aplicó aleatorización de dominio sobre suelo, brillo, ruido, desenfoque, compresión JPEG e interferencia espacial, con un conjunto balanceado. La validación se realizó en 150 muestras. No se indica la aplicación de técnicas de alineación como RLHF o DPO, al tratarse de un modelo de visión.

## Capacidades

- Detección de personas con bounding boxes y nivel de confianza; en validación alcanza un Box mAP50 de aproximadamente 0.995.
- Estimación de keypoints corporales de un subconjunto COCO-17; en validación alcanza un Pose mAP50 de aproximadamente 0.85.
- Clasificación de gestos de extremidades superiores en cinco clases: idle, right_fwd, left_fwd, both_fwd y both_side.
- Optimizado para imágenes de cámara frontal en primera persona, con campo de visión de 62° HFOV y pitch de cabeza de 40°.
- Entrenado con aleatorización de dominio para mejorar la transferencia de simulación a entornos reales (sim2real-ready).
- Distribuido en formato ONNX, lo que permite integrarlo en frameworks multilingües como ONNX Runtime o TensorRT.

## Casos de uso

- Interacción natural con robot pato en entornos domésticos: el robot detecta a una persona y reconoce si extiende un brazo hacia delante para solicitar atención o indicar una dirección.
- Teleoperación por gestos: el operador utiliza gestos de brazos para controlar el movimiento del robot; por ejemplo, ambos brazos hacia delante para avanzar o ambos hacia los lados para girar.
- Robótica educativa: el modelo sirve como ejemplo de despliegue de redes de visión en robots de bajo coste, dado que su salida ONNX es ligera y puede ejecutarse en hardware con recursos limitados.
- Investigación en simulación a real: permite validar estrategias de entrenamiento con datos sintéticos y domain randomization para acelerar el desarrollo de comportamientos robóticos.
- Monitorización de actividad en espacios controlados: el modelo puede contar personas y analizar la posición de sus brazos en secuencias de vídeo, aunque no está diseñado como sistema de seguridad.
- Integración en pipelines de visión robótica: al ser ONNX, puede integrarse en ROS2 con ONNX Runtime o TensorRT para ejecutar la inferencia de forma eficiente en sistemas embebidos.

## Benchmarks y rendimiento

Se han publicado resultados de validación en la model card del autor. No se han encontrado comparaciones con otros modelos en la información disponible.

| Métrica | Valor |
|---|---|
| Box mAP50 (150 muestras de validación) | ≈ 0.995 |
| Pose mAP50 (150 muestras de validación) | ≈ 0.85 |

## Requisitos de hardware

- No se han publicado requisitos de VRAM ni de GPU en la información disponible.
- El modelo se distribuye en ONNX y el repositorio tiene un tamaño de 0.1 GB, lo que indica que es ligero, pero no hay cifras oficiales de consumo.
- Al ser un modelo de visión con entrada 480x480, es plausible que se ejecute en GPUs de consumo, aunque no se especifican modelos concretos.
- Opciones de despliegue: el formato ONNX permite su uso con ONNX Runtime, TensorRT u otros motores de inferencia. Las opciones como vLLM, llama.cpp, Ollama o TGI no aplican, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de detección de pose. Para situar el modelo, se puede considerar que comparte arquitectura con la familia YOLO11-pose, aunque no se han publicado benchmarks comparativos.

## Limitaciones y advertencias

- El modelo está especializado en la geometría de la cámara del robot pato (62° HFOV, 40° de pitch, altura de ojo de 25 cm); otras configuraciones de cámara o posiciones pueden degradar el rendimiento.
- El dataset es sintético y, aunque se ha aplicado aleatorización de dominio, la brecha sim2real puede persistir en entornos no vistos.
- Los gestos reconocidos se limitan a cinco clases (idle, right_fwd, left_fwd, both_fwd, both_side), lo que reduce su uso generalista.
- La estimación de pose utiliza un subconjunto de 17 keypoints de COCO, no el conjunto completo.
- No se ha publicado una licencia, por lo que el uso comercial es incierto; se recomienda consultar al autor antes de desplegarlo en producción.
- Existe riesgo de falsos positivos y detecciones incorrectas, especialmente en condiciones fuera del dominio de entrenamiento. No se han publicado pruebas de robustez frente a condiciones adversas.

## Enlaces

- HuggingFace: https://huggingface.co/XenderYang/microduck-pose-gesture
- Repositorio de entrenamiento/benchmark: https://github.com/YDxun/microduck-duck-play
- Repositorio relacionado de control por gestos con Snap Spectacles: https://github.com/kgediya/specs-microduck
- Modelo relacionado de la misma serie: https://huggingface.co/XenderYang/microduck-rl-ydx-walk
