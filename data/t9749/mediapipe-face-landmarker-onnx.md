# t9749/mediapipe-face-landmarker-onnx

## Resumen

`t9749/mediapipe-face-landmarker-onnx` es una conversión a ONNX de los tres modelos que componen la tarea Face Landmarker de MediaPipe de Google: el detector de caras BlazeFace de corto alcance, el detector de 478 landmarks faciales y el estimador de 52 blendshapes. El autor, t9749, publica los pesos convertidos mediante tf2onnx con opset 13, lo que permite ejecutar el pipeline completo de detección facial y seguimiento de expresiones fuera del ecosistema TensorFlow Lite, en cualquier runtime compatible con ONNX Runtime.

El paquete resuelve un problema práctico de despliegue: MediaPipe distribuye estos modelos como un bundle `.task` en formato TFLite, lo que limita su uso a runtimes concretos. Al ofrecer los grafos en ONNX, el modelo se puede integrar en pipelines de Python, C++, C# o JavaScript con ONNX Runtime, y en servidores de inferencia estándar. No es un modelo generativo ni un LLM: es un conjunto de tres redes convolucionales pequeñas para visión por computador en tiempo real.

La relevancia actual radica en su coste computacional muy bajo y en la verificación empírica que incluye el autor: comparado contra la implementación oficial de MediaPipe Tasks sobre 300 fotos de LFW, obtiene 336 caras detectadas frente a 335, un error de landmarks del 0,8 % del ancho de la cara (p95 1,05 %) y una diferencia media absoluta de blendshapes de 0,010 (p95 0,024). El repo tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño declarado de 0,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tres CNN: BlazeFace short-range (detector), detector de mallas faciales (478 landmarks) y regresor de blendshapes |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (los pesos publicados son la conversión directa del bundle float16 v1 de MediaPipe) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 13, convertido con tf2onnx) |

Detalle de entradas y salidas por fichero:

| Fichero | Entrada | Salida |
|---|---|---|
| `face_detector.onnx` | `input` [1,128,128,3] RGB en [-1,1] | `regressors` [1,896,16], `classificators` [1,896,1] |
| `face_landmarks_detector.onnx` | [1,256,256,3] RGB en [0,1] | 478 × (x,y,z) en píxeles del recorte [1,1,1,1434] y logit de presencia de cara |
| `face_blendshapes.onnx` | [1,146,2] coordenadas x,y de landmarks en píxeles de imagen | 52 puntuaciones de blendshape |

## Arquitectura y entrenamiento

El pipeline replica la arquitectura de MediaPipe Face Landmarker. El primer módulo es un BlazeFace de corto alcance que opera sobre una entrada de 128×128 y produce 896 anclas con 16 valores de regresión y 1 logit de clasificación por ancla. El segundo módulo recibe un recorte de 256×256 y regresa 478 puntos faciales con coordenadas (x, y, z) relativas al recorte, más un logit de presencia facial. El tercer módulo es un pequeño MLP que toma 146 índices de landmarks (definidos en `blendshape_subset.json`, extraídos de `face_blendshapes_graph.cc` de MediaPipe) y produce 52 coeficientes de blendshape correspondientes a las expresiones faciales del estándar ARKit.

No se dispone de información sobre el dataset de entrenamiento original, el número de tokens (no aplica) ni sobre procesos de RLHF/DPO (no aplica). Los pesos proceden directamente de los modelos float16 v1 incluidos en `face_landmarker.task` de Google, convertidos a ONNX con tf2onnx en opset 13. La innovación técnica relevante es la propia conversión: preserva la equivalencia funcional con la implementación TFLite original, verificada empíricamente sobre 300 imágenes de LFW.

## Capacidades

- Detección de caras en imágenes con el detector BlazeFace de corto alcance (hasta 896 anclas por pasada).
- Localización de 478 landmarks faciales en 3D (x, y, z) sobre el recorte de cara.
- Estimación de 52 coeficientes de blendshape compatibles con el esquema ARKit para expresiones faciales.
- Salida de logit de presencia facial para filtrar detecciones falsas.
- Ejecución en CPU y GPU mediante ONNX Runtime, sin dependencia de TensorFlow ni TFLite.
- No soporta tool calling, agentes, razonamiento multi-step ni procesamiento de lenguaje: es exclusivamente un modelo de visión.
- No soporta entrada de vídeo de forma nativa; el seguimiento temporal debe implementarlo el usuario encadenando frames.

## Casos de uso

- Seguimiento facial en tiempo real para avatares: el modelo entrega 478 landmarks y 52 blendshapes por frame, lo suficiente para animar un avatar 3D en una aplicación de videollamada o stream, con latencia baja al ejecutarse en ONNX Runtime sobre CPU.
- Análisis de expresiones en estudios de mercado: procesar lotes de imágenes o fotogramas de vídeo para cuantificar sonrisas, ceño fruncido u otras expresiones mediante los coeficientes de blendshape, agregando métricas por sujeto o por estímulo.
- Preprocesado para pipelines de reconocimiento facial: usar los 478 landmarks para alinear y recortar rostros antes de pasarlos a un modelo de identificación, aprovechando la salida de presencia facial para descartar detecciones espurias.
- Filtros y efectos en aplicaciones móviles o web: integrar los tres grafos ONNX en una app con ONNX Runtime Web o Mobile para aplicar máscaras, maquillaje virtual o deformaciones faciales sin depender del SDK de MediaPipe.
- Telemetría de atención en entornos educativos o de conducción: estimar orientación y expresión facial a partir de landmarks para detectar somnolencia o pérdida de atención, con un coste computacional que permite ejecución en dispositivos de borde.
- Investigación en visión por computador: usar la conversión como referencia reproducible para comparar implementaciones de detección facial o para hacer ablaciones sobre el pipeline de MediaPipe sin necesidad de reentrenar.
- Automatización de etiquetado de datasets faciales: procesar grandes volúmenes de imágenes con el detector y el landmarker para generar anotaciones preliminares de landmarks y expresiones que luego se revisan manualmente.

## Benchmarks y rendimiento

El autor reporta una validación empírica contra la implementación oficial de MediaPipe Tasks FaceLandmarker sobre 300 fotos de LFW:

| Metrica | Resultado |
|---|---|
| Caras detectadas (ONNX vs MediaPipe) | 336 vs 335 |
| Error de landmarks (media, % del ancho de cara) | 0,8 % |
| Error de landmarks (p95) | 1,05 % |
| Diferencia media absoluta de blendshapes | 0,010 |
| Diferencia de blendshapes (p95) | 0,024 |

No se han publicado resultados de benchmarks estándar (WIDER FACE, 300W, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; los tres modelos son CNN pequeñas (entradas de 128×128 y 256×256) y caben holgadamente en cualquier GPU consumer, incluidas GTX 1650 o superiores.
- GPU recomendadas: cualquier GPU con soporte de ONNX Runtime (CUDA o DirectML); para producción en servidor, T4, L4, A10 o superiores son suficientes y quedan sobredimensionadas.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1-2 GB de VRAM libre; también en CPU.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#, JavaScript/Web), integración en servidores de inferencia compatibles con ONNX, y ejecución en dispositivos de borde.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño de las entradas (128×128 y 256×256) se espera latencia de milisegundos por frame en CPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Landmarks | Blendshapes | Licencia | Formato |
|---|---|---|---|---|---|
| t9749/mediapipe-face-landmarker-onnx | Conversión ONNX de MediaPipe | 478 | 52 | Apache-2.0 | ONNX |
| MediaPipe Face Landmarker (Google) | Pipeline original | 478 | 52 | Apache-2.0 | TFLite (.task) |
| MediaPipe Face Mesh (Google) | Malla facial clásica | 468 | no | Apache-2.0 | TFLite |
| InsightFace (varios modelos) | Detección y reconocimiento | 5 o 106 | no | MIT / otras | ONNX |

La ventaja diferencial frente al bundle original de MediaPipe es el formato ONNX, que amplía los runtimes compatibles. Frente a InsightFace, este paquete no ofrece embeddings de identidad ni reconocimiento facial, solo detección, landmarks y expresiones.

## Limitaciones y advertencias

- Solo detecta caras de corto alcance (BlazeFace short-range); caras pequeñas o muy lejanas pueden no detectarse.
- El modelo de blendshapes lee únicamente 146 de los 478 landmarks, por lo que la expresividad está limitada al subconjunto definido en `blendshape_subset.json`.
- No hay seguimiento temporal integrado: la coherencia entre frames debe gestionarla la aplicación.
- No se han publicado evaluaciones de sesgo por género, edad o tono de piel; el rendimiento puede degradarse en condiciones de iluminación adversas u oclusiones.
- Riesgo de falsos positivos y negativos en el detector, mitigable parcialmente con el logit de presencia facial.
- La licencia Apache-2.0 permite uso comercial, pero los modelos originales son © Google y el usuario debe respetar las condiciones de atribución de MediaPipe.
- El repo tiene 0 descargas y 0 likes y fue creado en noviembre de 2026; no hay evidencia de mantenimiento ni de comunidad que valide la conversión más allá de la comprobación del autor.
- No hay información sobre cuantizaciones adicionales ni sobre soporte de opsets distintos del 13.

## Enlaces

- Hugging Face: https://huggingface.co/t9749/mediapipe-face-landmarker-onnx
- MediaPipe Face Landmarker (Google): https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker
- Documentación de MediaPipe Tasks: https://ai.google.dev/edge/mediapipe/solutions/guide
- ONNX Runtime: https://onnxruntime.ai/
- tf2onnx: https://github.com/onnx/tensorflow-onnx
