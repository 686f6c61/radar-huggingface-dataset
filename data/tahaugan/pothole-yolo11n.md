# tahaUgan/pothole-yolo11n

## Resumen

tahaUgan/pothole-yolo11n es un modelo de detección de objetos basado en la arquitectura YOLO11n de Ultralytics, afinado para identificar dos clases específicas de daños en infraestructuras viales: baches (potholes) y tapas de alcantarillado (sewage manholes). Desarrollado por el usuario tahaUgan, el modelo está pensado para aplicaciones de seguridad vial e inspección de carreteras, y se distribuye bajo licencia CC-BY-4.0. Su principal ventaja es la flexibilidad de despliegue: se ofrece en formatos PyTorch, ONNX, NCNN y TFLite, lo que permite ejecutarlo en servidores, navegadores web y dispositivos móviles Android. No se especifican los parámetros totales ni la longitud de contexto, ya que se trata de un modelo de visión y no de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n (Ultralytics) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (modelo no MoE) |
| Longitud de contexto | No aplica (modelo de detección de objetos) |
| Tipos de cuantizacion | No especificado; disponibles en formato ONNX, NCNN y TFLite |
| Idiomas soportados | No disponible (modelo de visión, sin soporte de lenguaje) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (.pt), ONNX (.onnx), TFLite (.tflite), NCNN (.zip) |

## Arquitectura y entrenamiento

YOLO11n es la variante más ligera de la familia YOLO11 de Ultralytics, un detector de una sola etapa (one-stage) basado en redes neuronales convolucionales que predice cajas delimitadoras y clases directamente desde la imagen. El modelo presentado ha sido afinado (fine-tuning) sobre un conjunto de datos de imágenes de carreteras, pero la información disponible no detalla el tamaño del dataset, el número de épocas ni las técnicas de aumento de datos. Al tratarse de un modelo de visión, no se ha aplicado RLHF ni DPO. Tampoco se mencionan innovaciones técnicas específicas más allá de la propia arquitectura YOLO11.

## Capacidades

- Detección de objetos en tiempo real para dos clases: bache y tapa de alcantarillado.
- Salida con cajas delimitadoras y etiquetas de clase.
- Disponible en cuatro formatos de despliegue: PyTorch (.pt), ONNX (.onnx), NCNN (.zip) y TFLite (.tflite).
- Optimizado para ejecución en dispositivos móviles Android (NCNN con Vulkan GPU y TFLite con Kotlin/Java) y en navegador (ONNX con WebAssembly/WebGPU).
- No soporta tool calling, razonamiento multi-step ni generación de texto, al ser un modelo puramente visual.
- Capacidad de procesamiento de imágenes y vídeo en tiempo real, aunque la información no especifica la resolución óptima de entrada.

## Casos de uso

- Inspección automatizada de carreteras: integrar el modelo en vehículos de inspección para detectar baches y tapas de alcantarillado en tiempo real, generando informes automáticos para los departamentos de mantenimiento.
- Aplicación móvil de reporte ciudadano: implementar el modelo en formato TFLite o NCNN en una app Android para que los usuarios fotografíen baches y reciban una clasificación inmediata, facilitando el reporte a las autoridades.
- Mantenimiento predictivo de vías urbanas: analizar vídeo de cámaras instaladas en vehículos municipales para priorizar zonas con mayor concentración de daños y planificar reparaciones.
- Vigilancia de infraestructuras en obras: monitorizar calles en obras para detectar tapas de alcantarillado dañadas o ausentes, reduciendo riesgos de accidentes.
- Detección en el navegador sin servidor: usar el formato ONNX con WebGPU para ejecutar la detección en tiempo real desde una cámara web, útil en aplicaciones web de inspección rápida.
- Integración en flotas de reparto o transporte: desplegar el modelo en sistemas embebidos o en la nube para alertar a conductores sobre peligros en la vía, mejorando la seguridad y reduciendo daños en vehículos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponibles; al ser un modelo ligero, se puede ejecutar en CPU y en GPUs de gama baja, pero no se ofrecen datos concretos.
- Dispositivos móviles: los formatos NCNN y TFLite están orientados a Android; la model card menciona explícitamente el Galaxy A16 como objetivo para NCNN con Vulkan GPU.
- Navegador: el formato ONNX con WebGPU permite la ejecución en el cliente, sin necesidad de servidor.
- Opciones de despliegue: Ultralytics (Python), NCNN (Android C++/Vulkan), ONNX (WebAssembly/WebGPU) y TFLite (Android Kotlin/Java).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo detecta dos clases específicas (baches y tapas de alcantarillado), por lo que no es adecuado para otros tipos de daños en carreteras.
- Puede presentar falsos positivos o negativos en condiciones de iluminación adversa, sombras, superficies mojadas o texturas similares.
- No se proporciona información sobre el conjunto de datos de entrenamiento, lo que impide evaluar la robustez, la distribución de clases o posibles sesgos.
- La licencia CC-BY-4.0 permite el uso comercial, pero exige atribución al autor original.
- No se incluyen métricas de rendimiento ni resultados de validación, por lo que se recomienda una evaluación independiente antes de usar el modelo en producción.
- Al ser un modelo de visión, no aplican limitaciones de contexto o idioma.

## Enlaces

- HuggingFace: https://huggingface.co/tahaUgan/pothole-yolo11n
- Dataset relacionado: https://huggingface.co/datasets/tahaUgan/pothole-sewage-manhole-yolo
