# wesjos/YOLO26n-head-detection-cut-P3

## Resumen

YOLO26n-head-detection-cut-P3 es un modelo de detección de objetos de clase única orientado a la detección de caras, publicado por el usuario wesjos en Hugging Face bajo la librería Ultralytics. Se construye a partir de la arquitectura YOLO26n, la variante más pequeña de la familia YOLO26, modificada mediante la eliminación completa de la rama de detección P3 (la de mayor resolución espacial, sensible a objetos pequeños). El resultado es un detector que conserva únicamente las cabezas P4 y P5, lo que reduce el coste computacional en aproximadamente un 17,5 % respecto al modelo base.

El modelo está entrenado con entrada fija de 320×320 píxeles y produce una única caja delimitadora con su confianza por cada cara detectada. La etiqueta de clase almacenada en los pesos es `head`, heredada del conjunto de datos de entrenamiento, aunque las cajas cubren la región facial. Está pensado para escenarios donde las caras ocupan al menos un 2 % del fotograma, como videoconferencias, control de acceso de corto alcance o cámaras frontales de teléfono, y no para vigilancia de largo alcance ni multitudes densas vistas desde el aire.

Su relevancia actual radica en el compromiso explícito entre coste y precisión: al eliminar la rama P3 se obtiene un modelo más ligero y rápido, adecuado para inferencia en tiempo real sobre hardware modesto, a costa de renunciar a la detección de caras pequeñas. El repositorio incluye pesos en formato PyTorch y ONNX, así como una tarjeta de modelo inusualmente detallada con métricas por tamaño de objeto y pruebas estadísticas de significancia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n (Ultralytics), detector de una etapa con ramas P4 y P5 (rama P3 eliminada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de 320×320 píxeles) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos PyTorch y ONNX; no se documentan cuantizaciones específicas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (.pt) y ONNX (.onnx) |

## Arquitectura y entrenamiento

El modelo parte de YOLO26n, un detector de objetos de una etapa basado en red neuronal convolucional con backbone y cuello de agregación de características multiescala, del que se han conservado las cabezas de detección P4 (resolución 1/16, objetos medianos) y P5 (resolución 1/32, objetos grandes). La eliminación de la rama P3 no se limita a suprimir la cabeza de detección: se elimina toda la ruta asociada (operaciones de upsampling, concatenación y convoluciones), lo que reduce el coste de 1,450 a 1,196 GFLOPs a 320×320, es decir, un 17,5 % menos de cómputo. Tras la fusión de capas de normalización por lotes, la reducción se mantiene en el mismo 17,5 %.

El entrenamiento se realizó sobre el conjunto completo de anotaciones, sin descartar ninguna caja delimitadora, y con resolución fija de 320×320. La tarjeta del modelo no detalla el número de imágenes, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF (no aplicable aquí) o aumentos de datos específicos. El modelo es de clase única (`head`) y no incorpora mecanismos de decodificación especulativa ni atención lineal, al ser una arquitectura convolucional de detección.

## Capacidades

- Detección de caras en imágenes y fotogramas de vídeo, con salida de una caja delimitadora y una puntuación de confianza por cara.
- Clase única: solo detecta la categoría `head` (región facial); no distingue entre personas ni otras clases de objetos.
- Entrada de resolución fija de 320×320 píxeles; cambiar la resolución a 640 degrada gravemente la precisión (mAP50-95 cae de 0,930 a 0,686).
- Inferencia en tiempo real sobre CPU y GPU, con pesos en PyTorch y ONNX.
- Orientado a objetivos de tamaño mediano y grande: caras que ocupan un 2 % o más del fotograma.
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades de agente (no es un modelo de lenguaje).
- No dispone de capacidades multilingües, de visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Videoconferencia y herramientas de reunión virtual: el modelo detecta la región facial en cada fotograma para encuadrar, recortar o aplicar efectos, aprovechando su baja latencia y su entrenamiento específico para caras que ocupan entre el 11 % y el 30 % del fotograma.
- Control de acceso de corto alcance: en cámaras situadas a pocos metros del usuario, las caras superan holgadamente el umbral del 2 % del fotograma, por lo que el modelo ofrece detección fiable con un coste computacional reducido.
- Procesamiento de fotogramas de retransmisiones en directo: al ejecutarse sobre ONNX y CPU, puede integrarse en pipelines de streaming para localizar caras de presentadores o invitados en tiempo real.
- Cámaras frontales de teléfono y aplicaciones móviles: el tamaño reducido del modelo y su entrada de 320×320 lo hacen apto para inferencia en dispositivos con recursos limitados, siempre que el rostro esté cerca de la cámara.
- Anotación asistida y preetiquetado de datasets faciales: el modelo puede generar cajas candidatas sobre imágenes de primer plano para acelerar el etiquetado manual, con revisión posterior para corregir falsos positivos.
- Moderación y análisis de contenido en primer plano: detección de presencia de caras en imágenes subidas por usuarios donde el rostro ocupa una porción significativa de la imagen, como paso previo a un desenfoque o a una política de privacidad.

## Benchmarks y rendimiento

La tarjeta del modelo reporta métricas de validación propias, pero no una tabla comparativa completa con otros modelos. Los datos disponibles son:

| Metrica | Valor |
|---|---|
| mAP50-95 (imgsz=320) | 0,930 |
| mAP50-95 (imgsz=640) | 0,686 |
| GFLOPs a 320×320 (modelo completo YOLO26n) | 1,450 |
| GFLOPs a 320×320 (este modelo, rama P3 eliminada) | 1,196 |
| Reduccion de computo | 17,5 % |
| Confianza en demos (3 imagenes, conf=0.25) | 0,941–0,960 |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la información disponible, al no tratarse de un modelo de lenguaje. Tampoco se detallan métricas de precisión (P) y exhaustividad (R) por tamaño de objeto más allá de la metodología descrita en la tarjeta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,0 GB) y la naturaleza del modelo (YOLO26n con rama P3 eliminada), se trata de un modelo muy ligero, apto para GPUs de gama baja y CPU.
- GPU recomendadas: no especificadas en la información disponible; por su perfil de cómputo (1,196 GFLOPs a 320×320), cabe en GPUs de consumo como la RTX 4090 y en GPUs de datacenter como A100 o H100 sin problemas, aunque no se aportan cifras de latencia por GPU.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna; no se documentan requisitos mínimos concretos.
- Opciones de despliegue: Ultralytics (Python), ONNX Runtime y OpenCV; la tarjeta menciona `ultralytics`, `onnxruntime` y `opencv-python` como dependencias. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un detector de objetos).
- Latencia y throughput: no se proporcionan cifras de ms/imagen ni de imágenes por segundo; la tarjeta menciona que las demos se ejecutaron en CPU con `ultralytics 8.4.211`, pero sin tiempos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO26n-head-detection-cut-P3 | no disponible | 320×320 fijo | mAP50-95 0,930 a 320 | AGPL-3.0 | Hugging Face (wesjos) |
| YOLO26n (base Ultralytics) | no disponible | resolución configurable | no disponible en esta ficha | AGPL-3.0 | Ultralytics |
| Otros detectores faciales YOLO | no disponible | variable | no disponible | variable | no disponible |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada; la comparativa con el YOLO26n base se limita al coste computacional (1,450 frente a 1,196 GFLOPs) y a la eliminación de la rama P3.

## Limitaciones y advertencias

- No detecta caras pequeñas: la eliminación de la rama P3 implica que los objetivos por debajo del 2 % del fotograma (menos de 45×45 píxeles a 320) no se detectan de forma fiable; no es apto para vigilancia de largo alcance, multitudes densas desde el aire ni miniaturas de fotos de carné.
- La resolución de entrada debe ser 320×320; usar 640 degrada la precisión de forma severa (mAP50-95 de 0,930 a 0,686).
- La salida ONNX en bruto requiere supresión de no máximos (NMS); sin este paso, una sola cara genera múltiples cajas superpuestas.
- Modelo de clase única: no distingue personas, objetos ni otras categorías; la etiqueta `head` puede inducir a confusión, ya que las cajas cubren la región facial.
- Licencia AGPL-3.0: impone obligaciones de copyleft para uso en red y puede restringir su integración en productos comerciales propietarios; debe revisarse antes de un despliegue en producción.
- Riesgo de sesgos y alucinaciones: no se documentan sesgos demográficos ni análisis de equidad; como todo detector entrenado con un dataset no descrito, puede presentar diferencias de rendimiento entre tonos de piel, edades o condiciones de iluminación.
- No se detalla el dataset de entrenamiento (número de imágenes, diversidad, procedencia), lo que dificulta evaluar su robustez y generalización.
- No es un modelo de lenguaje: no soporta generación de texto, razonamiento, código ni capacidades de agente.

## Enlaces

- Hugging Face: https://huggingface.co/wesjos/YOLO26n-head-detection-cut-P3
- Ultralytics (framework y documentación): https://github.com/ultralytics/ultralytics
- ONNX Runtime: https://onnxruntime.ai/
- OpenCV: https://opencv.org/
