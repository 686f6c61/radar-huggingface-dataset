# TheStageAI/embeddinggemma-2

## Resumen

EmbeddingGemma 2 (Apple Silicon) es una distribución del modelo de embeddings `google/embeddinggemma-2` de Google, comprimida y empaquetada por TheStage AI para su ejecución en hardware de Apple mediante CoreML y la Neural Engine (NPU). El modelo original es multimodal: proyecta texto, imagen, audio, vídeo y entradas mixtas (por ejemplo, una imagen con su pie de foto) en un único espacio vectorial L2-normalizado de 768 dimensiones, lo que permite búsquedas cruzadas entre modalidades con una sola consulta.

La distribución de TheStage AI no es un modelo en el sentido tradicional, sino un conjunto de *engine bundles* de CoreML que se cargan a través del SDK propietario TheStage Apple SDK (`EmbeddingPipeline`). El SDK descarga, cachea y ejecuta los motores en el dispositivo, de modo que la inferencia ocurre íntegramente en local, sin enviar datos a la nube. Está pensado para aplicaciones iOS 18+ y macOS 15+ sobre Apple Silicon, con soporte opcional para Flutter.

Su relevancia radica en llevar un modelo de embeddings multimodal de calidad a la NPU de dispositivos Apple con requisitos de despliegue muy concretos: vectores Matryoshka (768/512/256/128), prompts de tarea especializados (query, document, STS, clasificación, clustering, recuperación de código, QA, verificación de hechos) y un espacio de embeddings compartido entre modalidades. La licencia del repositorio es Apache 2.0, aunque el uso requiere un token de acceso de TheStage AI validado en línea durante la inicialización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de embeddings multimodal (modelo base `google/embeddinggemma-2`), empaquetado como engine bundles CoreML |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens de texto (el texto más largo se trunca); imagen 256-280 tokens; audio 25 tokens/s (primeros 30 s); vídeo 1 frame/s, hasta 14 frames por defecto, hasta 140 tokens por frame |
| Tipos de cuantizacion | no disponible (comprimido por TheStage AI para CoreML/NPU; no se detallan esquemas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (repositorio); el SDK TheStage Apple SDK y el token de acceso tienen sus propias condiciones |
| Formato de pesos | CoreML (engine bundles); el modelo base original en HuggingFace no se especifica en la información disponible |
| Dimension de embedding | 768 (L2-normalizado); Matryoshka 512 / 256 / 128 |
| Modalidades de entrada | texto, imagen, audio, vídeo, mixtas |
| Dispositivo por defecto | NPU (Neural Engine) |
| Version del SDK | 1.7.0+ |
| Requisitos de sistema | macOS 15.0+, iOS 18.0+, Xcode 16.0+, Swift 6.0+, Flutter 3.24+ (opcional); simulador no soportado |
| Tamano del repo | 1.4 GB |

## Arquitectura y entrenamiento

El modelo base `google/embeddinggemma-2` es un modelo de embeddings multimodal que mapea texto, imagen, audio, vídeo y combinaciones de ellos a un espacio vectorial único de 768 dimensiones L2-normalizado. Está entrenado con la técnica Matryoshka, de modo que los primeros 512, 256 o 128 valores del vector constituyen por sí mismos embeddings válidos de menor dimensionalidad, lo que permite ajustar el coste de almacenamiento y búsqueda sin reentrenar. La información proporcionada no detalla el número de parámetros, la composición del dataset de entrenamiento ni si se emplearon técnicas de RLHF o DPO.

La contribución de TheStage AI es de compresión y empaquetado: convierte el modelo original en motores CoreML optimizados para la Neural Engine de Apple Silicon, con prompts de tarea y límites de tokens definidos en el propio bundle. El SDK expone una API de alto nivel (`infer`, `similarity`) que abstrae la carga de motores, la gestión de modalidades y la selección de dimensión Matryoshka. No se documentan innovaciones de arquitectura propias más allá del proceso de compresión y del pipeline de despliegue on-device.

## Capacidades

- Generación de embeddings de texto con prompts de tarea especializados: `query`, `document`, `STS`, `Classification`, `Clustering`, `CodeRetrieval`, `QuestionAnswering` y `FactChecking`.
- Embeddings de imagen de cualquier tamaño (256-280 tokens por imagen).
- Embeddings de audio mono a cualquier frecuencia de muestreo (remuestreado internamente), a 25 tokens por segundo y limitado a los primeros 30 segundos.
- Embeddings de vídeo a 1 frame por segundo, hasta 14 frames por defecto y hasta 140 tokens por frame.
- Embeddings de entradas mixtas: una sola representación para combinaciones como imagen + texto.
- Vectores Matryoshka de 768, 512, 256 y 128 dimensiones.
- Similitud coseno entre embeddings mediante `EmbeddingPipeline.similarity`.
- Inferencia completamente on-device en la NPU, sin envío de datos a la nube tras la inicialización.
- Metadatos de salida: `dimension`, `embedding_space_id`, `token_count` y `truncated`.
- No se documenta soporte de tool calling, agentes, generación de texto ni razonamiento multi-paso; es un modelo exclusivamente de extracción de características.

## Casos de uso

- Búsqueda semántica local en aplicaciones iOS y macOS: indexar documentos del usuario y responder consultas con `task: .QUERY` frente a `task: .DOCUMENT`, todo en el dispositivo, lo que evita enviar contenido sensible a servidores externos.
- Búsqueda visual en galerías de fotos: generar embeddings de imágenes con `infer(image:)` y recuperarlas mediante una consulta textual en el mismo espacio de 768 dimensiones, sin necesidad de etiquetado manual.
- Recuperación aumentada (RAG) en apps móviles: construir un índice vectorial local de notas, manuales o correos y recuperar fragmentos relevantes antes de pasarlos a un LLM, manteniendo la privacidad del corpus.
- Detección de duplicados y clustering de contenido: usar `task: .Clustering` con vectores Matryoshka de 256 o 128 dimensiones para agrupar artículos, reseñas o imágenes con un coste de almacenamiento reducido.
- Búsqueda de código en herramientas de desarrollo: emplear `task: .CodeRetrieval` para localizar fragmentos de código relevantes dentro de un repositorio o documentación técnica.
- Moderación y verificación de hechos: usar `task: .FactChecking` y `task: .QuestionAnswering` para comparar afirmaciones con fuentes indexadas y detectar inconsistencias.
- Análisis de audio y vídeo en el dispositivo: transcribir conceptualmente o indexar fragmentos de audio (primeros 30 s) y frames de vídeo para búsqueda por similitud en apps de notas de voz o grabaciones.
- Aplicaciones Flutter multiplataforma en iOS: integrar el SDK mediante `thestage_apple_sdk` y pasar rutas de archivo para imagen, audio y vídeo desde Dart.

## Benchmarks y rendimiento

La model card incluye una tabla de calidad de referencia del modelo base (Google, bf16) por tamaño Matryoshka. Los datos disponibles están incompletos: solo se muestran la columna de 768 dimensiones y parte de la fila de 768.

| Tamano | MTEB eng v2 | MTEB Code | MIEB lite | MAEB | MMEB v2 |
|---|---|---|---|---|---|
| 768 | 68.46 | 78.68 | 6 (dato incompleto) | no disponible | no disponible |
| 512 | no disponible | no disponible | no disponible | no disponible | no disponible |
| 256 | no disponible | no disponible | no disponible | no disponible | no disponible |
| 128 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la información disponible resultados de benchmarks propios de la versión CoreML de TheStage AI, ni comparativas con otros modelos.

## Requisitos de hardware

- Hardware: Mac con Apple Silicon o iPhone/iPad físico. El simulador no está soportado.
- Sistema operativo: macOS 15.0+ o iOS 18.0+.
- Herramientas de desarrollo: Xcode 16.0+, Swift 6.0+; Flutter 3.24+ si se usa la integración Flutter.
- Ejecución por defecto en la NPU (Neural Engine); no se especifican requisitos de VRAM ni de memoria unificada.
- Tamaño del repositorio de motores: 1.4 GB, que debe descargarse y cachearse en el dispositivo.
- Despliegue: exclusivamente mediante TheStage Apple SDK (SwiftPM o plugin Flutter); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Requiere conexión a internet en la primera inicialización para validar el token de TheStage AI; la inferencia posterior es totalmente local.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de modelos comparables en la información proporcionada. Como referencia cualitativa, el modelo base `google/embeddinggemma-2` es la alternativa directa (sin compresión CoreML y sin requisito de token de TheStage AI), pero no se detallan sus parámetros, contexto ni licencia en esta ficha.

| Modelo | Parametros | Contexto | Licencia | Despliegue |
|---|---|---|---|---|
| TheStageAI/embeddinggemma-2 | no disponible | 2048 tokens (texto) | Apache 2.0 (repo) + SDK propietario | CoreML / NPU Apple |
| google/embeddinggemma-2 | no disponible | no disponible | no disponible | HuggingFace (formato no especificado) |
| Otros modelos de embeddings multimodales | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El texto superior a 2048 tokens se trunca; el audio se limita a los primeros 30 segundos y el vídeo a un máximo de frames configurable (14 por defecto).
- Los embeddings solo son comparables si comparten el mismo `embedding_space_id`; mezclar resultados de distintas configuraciones o dimensiones produce similitudes inválidas.
- Requiere un token de acceso de TheStage AI y una validación en línea durante `initialize`; sin conexión, la inicialización falla.
- El SDK es propietario y la licencia Apache 2.0 del repositorio no cubre necesariamente el SDK ni los términos de uso del servicio de token.
- No funciona en el simulador de iOS; requiere hardware Apple Silicon real.
- No se documentan sesgos conocidos, riesgo de alucinación (no genera texto) ni limitaciones idiomáticas concretas; los idiomas soportados figuran como no disponibles.
- El tamaño del repo (1.4 GB) y la carga inicial de motores pueden afectar al tiempo de arranque en frío de la aplicación.
- No se especifican los esquemas de cuantización aplicados, lo que dificulta evaluar la pérdida de calidad frente al modelo base en bf16.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/TheStageAI/embeddinggemma-2
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Repositorio del SDK: https://github.com/TheStageAI/AppleSDK
- Documentación del SDK: https://docs.thestage.ai
- Portal de tokens: https://app.thestage.ai
