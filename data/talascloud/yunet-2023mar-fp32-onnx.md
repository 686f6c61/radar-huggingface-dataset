# TalasCloud/YuNet-2023mar-FP32-ONNX

## Resumen

YuNet-2023mar-FP32-ONNX es una conversión a formato ONNX en precisión FP32 del detector de rostros YuNet publicado en OpenCV Zoo, distribuida por el usuario TalasCloud. No se trata de un modelo de lenguaje ni de un modelo generativo: es un detector facial convolucional ligero pensado para integrarse en pipelines de procesamiento multimedia mediante OpenCV `FaceDetectorYN`. El repositorio no incluye información sobre la arquitectura interna, el número de parámetros ni el proceso de entrenamiento original.

La relevancia de esta ficha es limitada: el modelo es una reexportación de pesos ya existentes en OpenCV Zoo, mantenidos "byte a byte" con su precisión original según la model card. El autor indica un sistema objetivo concreto (Windows, AMD Radeon RX 580 2048SP y Intel Xeon E5-2696 v3 con AVX2), lo que sugiere un uso orientado a un runtime multimedia propietario más que a un uso general.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño declarado de 0.0 GB, lo que impide verificar el contenido real de los pesos. Toda la información técnica disponible proviene de la model card y del repositorio upstream de OpenCV Zoo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (detector facial convolucional de OpenCV Zoo; detalles internos no especificados) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | FP32 (única precisión publicada en este repo) |
| Idiomas soportados | no disponible (no aplica; detector facial independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | ONNX (FP32) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo en la documentación proporcionada. La model card únicamente indica que se trata de YuNet, un detector de rostros del OpenCV Zoo, reexportado a ONNX en FP32 conservando los pesos originales "byte a byte" con su precisión original. No se especifican capas, mecanismos de atención, función de pérdida, resolución de entrada ni estrategia de anclajes.

Tampoco se documentan los datos de entrenamiento: número de imágenes, composición del dataset, técnicas de aumento de datos o si hubo ajuste fino posterior. Cualquier detalle sobre el entrenamiento original debe consultarse en el repositorio de OpenCV Zoo enlazado por el autor, no en esta model card.

## Capacidades

- Detección de rostros en imágenes y fotogramas de vídeo, según el uso previsto por OpenCV `FaceDetectorYN`.
- Integración con el runtime multimedia del autor (koboldcpp-media-pipeline, release v2026.11.17-r5).
- Ejecución en CPU con instrucciones AVX2 (Xeon E5-2696 v3) y en GPU AMD Polaris (RX 580 2048SP) según el sistema objetivo declarado.
- No se documentan capacidades de reconocimiento facial, identificación de personas, estimación de pose, landmarks o atributos faciales.
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingües ni modo de pensamiento: no es un modelo de lenguaje.

## Casos de uso

- Moderación de contenido en pipelines de vídeo: el detector puede localizar rostros en fotogramas para aplicar desenfoque o censura previa a la publicación, aprovechando su formato ONNX y su ejecución ligera en CPU con AVX2.
- Anonimización de material audiovisual: integrado en un pipeline de postproducción, permite detectar caras en cada fotograma y aplicar máscaras antes de exportar el vídeo final.
- Preprocesado para reconocimiento facial: como etapa de detección previa a un modelo de embeddings faciales, recortando las regiones de interés para el siguiente estadio del sistema.
- Analítica de audiencia en retail: conteo de personas presentes en una escena a partir de las detecciones de rostro, con procesamiento en local sobre hardware modesto (RX 580 o CPU Xeon).
- Automatización de recortes y encuadres: detección de rostros para generar thumbnails o reencuadres automáticos en herramientas de edición y publicación de vídeo.
- Control de acceso o señalización en kioscos interactivos: detección de presencia de una persona frente a la cámara como disparador de la interfaz, sin identificación biométrica.
- Integración en aplicaciones de escritorio Windows: el sistema objetivo declarado (Windows + RX 580 + Xeon con AVX2) encaja con herramientas de escritorio que necesiten detección facial sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El modelo es FP32 y el tamaño del repositorio figura como 0.0 GB, por lo que no se puede calcular una estimación fiable.
- GPU recomendadas: el autor declara como objetivo una AMD Radeon RX 580 2048SP (Polaris, 8 GB). No se especifican otras GPU compatibles.
- CPU: Intel Xeon E5-2696 v3 (Haswell) con AVX2, según la model card.
- ¿Cabe en GPU de consumo? Sí, previsiblemente, dado que el autor lo ejecuta en una RX 580 de 8 GB; no se confirma compatibilidad con otras GPU de consumo.
- Opciones de despliegue: OpenCV `FaceDetectorYN` (runtime declarado por el autor); al ser ONNX, es compatible en principio con runtimes ONNX estándar, aunque no se documenta soporte explícito de ONNX Runtime, TensorRT, OpenVINO ni otros.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato | Precisión | Licencia | Contexto / tarea | Disponibilidad |
|---|---|---|---|---|---|
| YuNet-2023mar-FP32-ONNX (este repo) | ONNX | FP32 | MIT | Detección facial | Hugging Face, 0 descargas |
| YuNet (OpenCV Zoo, upstream) | ONNX | FP32 (original) | MIT (según upstream) | Detección facial | GitHub OpenCV Zoo |
| Alternativas de detección facial (p. ej. MTCNN, RetinaFace) | Varía | Varía | Varía | Detección facial | no disponible en la información proporcionada |

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Es una reexportación de pesos de OpenCV Zoo; no aporta mejoras técnicas respecto al original y no documenta cambios.
- El repositorio muestra 0 descargas y 0 likes, y un tamaño de 0.0 GB, lo que impide verificar la integridad y el contenido real de los pesos más allá del SHA-256 declarado.
- No se documentan sesgos demográficos, de iluminación, de pose ni de oclusión; los detectores faciales suelen degradarse en rostros de perfil, con baja luz o parcialmente ocultos.
- Riesgo de falsos positivos y negativos no cuantificado: no hay métricas publicadas (precisión, recall, mAP) en la información disponible.
- No debe usarse para identificación biométrica ni reconocimiento facial: el modelo solo detecta la presencia y ubicación de rostros.
- La licencia MIT permite uso comercial, pero conviene verificar la licencia del modelo upstream en OpenCV Zoo antes de redistribuirlo en producción.
- El sistema objetivo declarado es muy específico (Windows, RX 580, Xeon con AVX2); el rendimiento en otros entornos no está documentado.
- Al ser un modelo de visión, no procesa texto ni mantiene conversaciones: no es adecuado para tareas de lenguaje, razonamiento o generación.

## Enlaces

- Hugging Face: https://huggingface.co/TalasCloud/YuNet-2023mar-FP32-ONNX
- OpenCV Zoo YuNet (upstream): https://github.com/opencv/opencv_zoo/tree/main/models/face_detection_yunet
- Runtime multimedia del autor: https://github.com/aktalascloud/koboldcpp-media-pipeline/releases/tag/v2026.11.17-r5
