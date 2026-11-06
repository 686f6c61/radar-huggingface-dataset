# thejagstudio/portfolio-models

## Resumen

`thejagstudio/portfolio-models` no es un modelo único, sino un repositorio agregador de 15 modelos de machine learning empaquetados en formato ONNX para ejecutarse íntegramente en el navegador mediante ONNX Runtime Web sobre WebGPU, con retroceso a WASM. Lo mantiene Jagrat Patel (usuario `thejagstudio`) para alimentar las demos interactivas de su portfolio personal, de modo que el sitio web no sirve los pesos directamente sino que los carga desde Hugging Face mediante URLs de resolución.

El repositorio cubre tareas muy dispares: profundidad monocular (Depth Anything V2 Small), clasificación de emociones (DistilBERT GoEmotions, FER+), reconocimiento de entidades (DistilBERT NER), análisis de sentimiento (DistilBERT SST-2), estilización de imágenes (Magenta), detección de landmarks faciales y pose (MediaPipe), OCR (PP-OCRv5 mobile), detección de objetos (RT-DETRv2 con ResNet-18), segmentación (SlimSAM), generación de imágenes (SD-Turbo cuantizado a 4 bits), reconocimiento de voz (Whisper tiny y base con timestamps) y un modelo de difusión para lenguaje (NanoDiffuse 122M en 8 bits).

Su relevancia práctica es doble: por un lado, sirve como catálogo de referencia de conversiones ONNX listas para inferencia en cliente; por otro, demuestra un patrón de despliegue sin backend de inferencia, donde el coste de cómputo recae en la GPU del usuario. El tamaño total del repositorio es de 2,0 GB y la licencia es mixta, heredada de cada modelo de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agregado heterogéneo: ViT (Depth Anything V2), BERT/DistilBERT (clasificación y NER), CNN (FER+, Magenta), redes de landmarks (MediaPipe), RT-DETR, SlimSAM, difusión (SD-Turbo, NanoDiffuse), encoder-decoder (Whisper), detección de texto (PP-OCRv5) |
| Parametros totales | No disponible (depende de cada submodelo; el mayor documentado es NanoDiffuse con 122M y SD-Turbo) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Incluye variantes cuantizadas: NanoDiffuse en 8 bits empaquetado, SD-Turbo en 4 bits empaquetado; el resto en precisión original ONNX no especificada |
| Idiomas soportados | No disponible a nivel de repositorio; PP-OCRv5 mobile está limitado a inglés, Whisper soporta multilingüe según su modelo base |
| Licencia | Mixta (Apache-2.0, MIT, Stability AI Community License y otras por carpeta; ver LICENSE.md) |
| Formato de pesos | ONNX (compatible con onnxruntime-web y transformers.js) |

## Arquitectura y entrenamiento

El repositorio no entrena modelos propios: redistribuye pesos de terceros convertidos a ONNX. La mayoría de las carpetas contienen conversiones sin cambios respecto al original, mientras que unas pocas incluyen re-cuantización documentada en el README de cada carpeta junto con el script que la generó (caso de `nanodiffuse-q8` y `sd-turbo-webgpu-q4`). Cada submodelo conserva la arquitectura de su origen: transformers para Depth Anything V2, DistilBERT y Whisper; CNN para FER+ y Magenta; arquitecturas específicas para MediaPipe Face Landmarker y BlazePose; RT-DETR sobre ResNet-18; SlimSAM podado al 77 %; y modelos de difusión para SD-Turbo y NanoDiffuse.

La innovación técnica relevante no está en el entrenamiento sino en el empaquetado: todos los grafos están preparados para ejecutarse con ONNX Runtime Web sobre WebGPU, con retroceso a WASM cuando la GPU del navegador no está disponible. Esto permite inferencia en cliente sin servidor, con latencias dependientes del hardware del usuario. No se documentan datos de entrenamiento, número de tokens, composición de dataset ni procesos de RLHF/DPO, ya que el repositorio es de distribución, no de entrenamiento.

## Capacidades

- Generación de imágenes: SD-Turbo en 4 bits empaquetado, con tokenizador CLIP incluido.
- Modelado de lenguaje por difusión: NanoDiffuse 122M en 8 bits.
- Estimación de profundidad monocular: Depth Anything V2 Small.
- Clasificación de emociones en texto: DistilBERT GoEmotions con 28 categorías.
- Reconocimiento de entidades nombradas en texto: DistilBERT NER.
- Análisis de sentimiento binario: DistilBERT SST-2.
- Reconocimiento de emociones faciales: FER+ CNN y MediaPipe Face Landmarker.
- Estimación de pose: MediaPipe BlazePose.
- Detección de objetos: RT-DETRv2 con backbone ResNet-18.
- Segmentación de imágenes: SlimSAM con poda del 77 %.
- OCR en inglés: PP-OCRv5 mobile.
- Reconocimiento de voz con marcas de tiempo: Whisper tiny y Whisper base.
- Estilización de imágenes: transferencia de estilo arbitraria de Magenta.
- Ejecución en navegador vía ONNX Runtime Web y transformers.js; no se documenta soporte de tool calling, agentes ni multi-step reasoning.

## Casos de uso

- Demos interactivas de portfolio sin backend de inferencia: el sitio carga los ONNX directamente desde Hugging Face y ejecuta la inferencia en la GPU del visitante mediante WebGPU, eliminando costes de servidor y latencia de red hacia un endpoint de modelo.
- Análisis de sentimiento y emociones en cliente para herramientas de feedback: DistilBERT SST-2 y GoEmotions permiten clasificar reseñas o comentarios en el navegador sin enviar texto a un servidor, útil en contextos con requisitos de privacidad.
- Procesamiento de documentos escaneados en el navegador: PP-OCRv5 mobile extrae texto en inglés de imágenes o capturas, combinable con DistilBERT NER para extraer entidades en un pipeline completamente local.
- Accesibilidad y análisis de vídeo en tiempo real: MediaPipe Face Landmarker y BlazePose, con 4 MB y 15 MB respectivamente, permiten detectar landmarks faciales y pose a tasas interactivas sobre webcam sin subir vídeo a la nube.
- Edición y generación de imágenes en cliente: SD-Turbo en 4 bits (931 MB) y Magenta para estilización permiten generar o transformar imágenes en el navegador, adecuado para demos creativas donde el usuario asume el coste de cómputo.
- Transcripción de audio local: Whisper tiny (108 MB) y Whisper base (191 MB) con timestamps permiten subtitular grabaciones o dictado por voz sin salir del navegador.
- Prototipado rápido de visión por computador: Depth Anything V2 Small, RT-DETRv2 y SlimSAM sirven como base para validar ideas de profundidad, detección y segmentación antes de invertir en infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; el consumo depende de la memoria de la GPU del navegador y del tamaño del submodelo. Los modelos pequeños (MediaPipe Face 4 MB, PP-OCRv5 13 MB, MediaPipe Pose 15 MB, FER+ 18 MB, Magenta 20 MB) caben en cualquier GPU integrada moderna. Los medianos (Depth Anything V2 77 MB, Whisper tiny 108 MB, DistilBERT 136-142 MB, NanoDiffuse 150 MB, Whisper base 191 MB) requieren una GPU dedicada o integrada reciente con WebGPU. SD-Turbo en 4 bits (931 MB) es el más exigente y necesita una GPU con al menos varios GB de memoria disponible para el contexto WebGPU.
- GPU recomendadas: para SD-Turbo, GPU de escritorio discretas (RTX 3060 o superior, Apple Silicon M-series); para el resto, cualquier GPU compatible con WebGPU (Intel Iris Xe, AMD Radeon integrada, Apple M1 en adelante).
- Cabe en consumer GPU: sí, todos los submodelos están diseñados para ejecutarse en hardware de consumo; el límite práctico es la disponibilidad de WebGPU en el navegador.
- Opciones de despliegue: ONNX Runtime Web (WebGPU y WASM), transformers.js; también pueden ejecutarse en servidor con onnxruntime estándar.
- Latencia y throughput: no disponibles; dependen del hardware del cliente y del submodelo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| thejagstudio/portfolio-models | Agregado ONNX para navegador | Variable por submodelo (hasta 122M documentados) | No disponible | Mixta | ONNX |
| onnx-community/whisper-tiny | ASR ONNX individual | ~39M | No disponible | MIT | ONNX |
| Xenova/distilbert-base-uncased-finetuned-sst-2-english | Clasificación ONNX para transformers.js | ~66M | 512 tokens | Apache-2.0 | ONNX |
| stabilityai/sd-turbo | Generación de imágenes | ~860M (UNet) | No disponible | Stability AI Community License | Safetensors, ONNX en variantes de la comunidad |

La comparativa es aproximada: el repositorio de thejagstudio agrupa conversiones de varios de estos modelos en un único punto de descarga, lo que simplifica su uso en demos web, pero no aporta mejoras de rendimiento sobre los originales.

## Limitaciones y advertencias

- Licencia mixta: cada carpeta tiene su propia licencia (Apache-2.0, MIT, Stability AI Community License, etc.); el uso comercial requiere revisar LICENSE.md y la licencia del submodelo concreto. SD-Turbo está sujeto a la Stability AI Community License, con restricciones para empresas por encima de un umbral de ingresos.
- No es un modelo entrenado por el autor: los pesos son redistribuciones de terceros; los posibles sesgos son los de los modelos originales (por ejemplo, GoEmotions y FER+ tienen sesgos demográficos y culturales documentados en sus fuentes).
- Riesgo de alucinación: aplica a los submodelos generativos (SD-Turbo, NanoDiffuse, Whisper); Whisper puede producir transcripciones plausibles pero incorrectas en audio ruidoso.
- Cobertura de idiomas limitada: PP-OCRv5 mobile está restringido a inglés; el resto depende de los modelos base y no se documenta a nivel de repositorio.
- Dependencia de WebGPU: sin soporte de WebGPU en el navegador, la inferencia cae a WASM con latencias notablemente mayores, especialmente en SD-Turbo.
- Sin datos de benchmarks ni de rendimiento publicados: no hay métricas que permitan comparar la calidad de las conversiones frente a los originales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni de mantenimiento continuado.
- Tamaño total de 2,0 GB: la descarga completa no es trivial para clientes con ancho de banda limitado; conviene cargar solo la carpeta necesaria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/thejagstudio/portfolio-models
- Carpeta Depth Anything V2 Small: https://huggingface.co/thejagstudio/portfolio-models/tree/main/depth-anything-v2-small
- Carpeta DistilBERT GoEmotions: https://huggingface.co/thejagstudio/portfolio-models/tree/main/distilbert-go-emotions
- Carpeta DistilBERT NER: https://huggingface.co/thejagstudio/portfolio-models/tree/main/distilbert-ner
- Carpeta DistilBERT SST-2: https://huggingface.co/thejagstudio/portfolio-models/tree/main/distilbert-sst2
- Carpeta FER+: https://huggingface.co/thejagstudio/portfolio-models/tree/main/emotion-ferplus
- Carpeta Magenta Style: https://huggingface.co/thejagstudio/portfolio-models/tree/main/magenta-style
- Carpeta MediaPipe Face: https://huggingface.co/thejagstudio/portfolio-models/tree/main/mediapipe-face
- Carpeta MediaPipe Pose: https://huggingface.co/thejagstudio/portfolio-models/tree/main/mediapipe-pose
- Carpeta NanoDiffuse Q8: https://huggingface.co/thejagstudio/portfolio-models/tree/main/nanodiffuse-q8
- Carpeta PP-OCRv5: https://huggingface.co/thejagstudio/portfolio-models/tree/main/pp-ocrv5
- Carpeta RT-DETRv2 R18: https://huggingface.co/thejagstudio/portfolio-models/tree/main/rtdetr-v2-r18
- Carpeta SD-Turbo WebGPU Q4: https://huggingface.co/thejagstudio/portfolio-models/tree/main/sd-turbo-webgpu-q4
- Carpeta SlimSAM 77: https://huggingface.co/thejagstudio/portfolio-models/tree/main/slimsam-77
- Carpeta Whisper base timestamped: https://huggingface.co/thejagstudio/portfolio-models/tree/main/whisper-base-timestamped
- Carpeta Whisper tiny timestamped: https://huggingface.co/thejagstudio/portfolio-models/tree/main/whisper-tiny-timestamped
- ONNX Runtime Web: https://onnxruntime.ai/docs/tutorials/web/
- transformers.js: https://huggingface.co/docs/transformers.js
