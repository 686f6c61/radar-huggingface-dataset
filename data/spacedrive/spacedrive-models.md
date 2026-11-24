# spacedrive/spacedrive-models

## Resumen

`spacedrive/spacedrive-models` no es un modelo de lenguaje generativo, sino un repositorio contenedor de artefactos ONNX que la aplicación Spacedrive descarga en tiempo de ejecución. En concreto, la model card documenta un único fichero: `blazeface-full-range/blaze_face_full_range.onnx`, el detector de rostros MediaPipe BlazeFace (variante full-range) de Google, convertido desde el TFLite original publicado en `litert-community/MediaPipe-FaceDetector-BlazeFace-Full-Range` mediante `tf2onnx`. El propósito del repo es alojar binarios que no tienen una release ONNX upstream, de modo que Spacedrive pueda consumirlos de forma reproducible.

El modelo subyacente, BlazeFace, es un detector facial ligero basado en una CNN con bloques tipo MobileNet y un esquema de anchors similar a SSD, diseñado originalmente para ejecutarse en tiempo real en dispositivos móviles. Su tamaño reducido (2.065.224 bytes, aproximadamente 2 MB) y su licencia Apache-2.0 lo hacen adecuado para tareas de detección de caras en local, sin dependencia de servicios en la nube.

La relevancia de este repositorio es acotada: no compite en la categoría de LLM ni de modelos fundacionales, sino que es infraestructura auxiliar para una aplicación de gestión de ficheros que procesa imágenes localmente. Cualquier evaluación debe hacerse en términos de detección facial en inferencia ONNX, no de generación de texto, razonamiento o código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN ligera tipo BlazeFace (MediaPipe), detector facial con anchors estilo SSD |
| Parametros totales | no disponible (repo de 0.0 GB segun Hugging Face; fichero ONNX de 2.065.224 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (deteccion facial, independiente del idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`blaze_face_full_range.onnx`) |

## Arquitectura y entrenamiento

El artefacto es una conversión a ONNX del detector MediaPipe BlazeFace full-range, originalmente distribuido como TFLite por Google bajo Apache-2.0. BlazeFace emplea una red convolucional ligera inspirada en MobileNet con conexiones residuales y un cabezal de detección basado en anchors, pensado para localizar rostros y predecir landmarks faciales con latencia muy baja en hardware móvil. La conversión se realizó con `tf2onnx` y es reproducible mediante el script `scripts/models/convert_blazeface.py` del repositorio `github.com/spacedriveapp/spacedrive`.

No se dispone de información sobre el dataset de entrenamiento original, el número de imágenes, el esquema de aumento de datos ni el proceso de optimización, más allá de lo que documenta Google en la model card upstream de MediaPipe. El autor de este repo no ha realizado entrenamiento adicional: solo la conversión de formato, verificada con el hash `sha256 494c597f51002a1ccbdc3571cc3d02a60fea914a7ad8abf6968e31768adf422a`.

## Capacidades

- Detección de rostros en imágenes: localización de caras con bounding boxes y landmarks faciales (ojos, nariz, boca, orejas) segun el esquema estandar de BlazeFace.
- Variante full-range: pensada para rostros a distintas distancias y escalas, no solo primeros planos.
- Inferencia ONNX: ejecutable con ONNX Runtime en CPU y en GPU compatible, sin dependencias de TensorFlow.
- Procesamiento local: adecuado para pipelines de privacidad en los que las imágenes no salen del dispositivo.
- No soporta generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni capacidades multilingües.
- No incluye modo thinking, visión general (solo detección facial), audio ni otras modalidades.

## Casos de uso

- Indexación local de fotos en Spacedrive: el detector se ejecuta sobre las imágenes del usuario para agrupar rostros y habilitar búsqueda por persona sin enviar contenido a la nube, coherente con la filosofía de la aplicación de procesar con modelos locales.
- Etiquetado automático de bibliotecas fotográficas: integrado en un pipeline ONNX Runtime, permite preprocesar lotes de imágenes y generar metadatos de presencia de caras antes de un reconocimiento posterior.
- Recorte y encuadre automático: los landmarks faciales permiten centrar retratos o generar miniaturas con la cara como foco, útil en herramientas de gestión de medios.
- Moderación y filtrado en aplicaciones de compartición de imágenes: detección previa de rostros para aplicar políticas de difuminado o avisos de privacidad antes de publicar.
- Preprocesado para modelos de reconocimiento facial: el detector actúa como etapa de detección que alimenta un modelo de embeddings faciales en una arquitectura de dos fases.
- Aplicaciones de videoconferencia o captura en tiempo real: su tamaño de ~2 MB y su diseño para dispositivos móviles permiten inferencia por fotograma con latencia baja en CPU.
- Prototipado en investigación de visión: punto de partida reproducible en ONNX para experimentos de detección facial sin depender de entornos TFLite.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta el tamaño del fichero (2.065.224 bytes) y el hash SHA-256; no incluye métricas de precisión, recall, mAP ni latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del modelo (~2 MB en ONNX), la huella de memoria es del orden de decenas de MB incluyendo buffers de activaciones, apta para cualquier GPU.
- GPU recomendadas: no se especifican; cualquier GPU compatible con ONNX Runtime (CUDA o DirectML) es suficiente. No requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en iGPU; también en CPU.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML, CoreML, TensorRT via EP), integración en la aplicación Spacedrive; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| spacedrive/spacedrive-models (BlazeFace full-range) | Detector facial CNN | ~2 MB | ONNX | Apache-2.0 | Conversion de TFLite via tf2onnx |
| MediaPipe BlazeFace (upstream, litert-community) | Detector facial CNN | no disponible | TFLite | Apache-2.0 | Fuente original de la conversion |
| Otros detectores faciales ONNX (p. ej. versiones de RetinaFace o YuNet) | Detector facial CNN | variable | ONNX | variable | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de métricas comparativas de precisión ni latencia entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe evaluarse ni desplegarse para generación de texto, razonamiento, código o tareas de agente.
- Ámbito restringido a detección facial; no realiza reconocimiento de identidad ni embeddings faciales.
- Sesgos: al no documentarse el dataset de entrenamiento original, no es posible evaluar sesgos de género, edad o etnia; los detectores faciales clásicos suelen mostrar sesgos de rendimiento en función del tono de piel y la iluminación.
- Riesgo de falsos positivos y negativos en rostros ocluidos, de perfil extremo, muy pequeños o en condiciones de baja iluminación; la variante full-range mitiga parcialmente el problema de escala, no el de oclusión.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución; debe conservarse el aviso de licencia y el hash de verificación si se redistribuye.
- Dependencia de la conversión: cualquier cambio en el pipeline `tf2onnx` o en la versión de ONNX Runtime puede alterar ligeramente los resultados; conviene fijar versiones en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y un tamaño declarado de 0.0 GB, lo que sugiere que el binario puede no estar materializado en el repo o que las métricas aún no se han actualizado.
- No se documentan idiomas ni contexto porque no aplican; cualquier requisito de multilingüismo debe resolverse en capas superiores.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/spacedrive/spacedrive-models
- Repositorio de código de Spacedrive: https://github.com/spacedriveapp/spacedrive
- Filosofía de Spacedrive (procesamiento local): https://v2.spacedrive.com/overview/philosophy
- Modelo TFLite upstream: https://huggingface.co/litert-community/MediaPipe-FaceDetector-BlazeFace-Full-Range
- Documentación de MediaPipe Face Detection (Google): https://ai.google.dev/edge/mediapipe/solutions/vision/face_detector
- ONNX Runtime: https://onnxruntime.ai/
- tf2onnx: https://github.com/onnx/tensorflow-onnx
