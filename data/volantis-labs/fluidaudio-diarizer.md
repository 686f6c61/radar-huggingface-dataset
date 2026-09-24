# volantis-labs/fluidaudio-diarizer

## Resumen

`volantis-labs/fluidaudio-diarizer` es un paquete de diarización de hablantes (identificación de "quién habla y cuándo" en un audio) distribuido en formato Core ML para su ejecución local en dispositivos Apple. No es un modelo de lenguaje: es un pipeline modular de cuatro componentes que replica el esquema clásico de tres etapas (segmentación, extracción de embeddings de hablante y clustering con puntuación PLDA) y lo empaqueta en ficheros `.mlmodelc` listos para el Apple Neural Engine (ANE) y la CPU/GPU de Apple Silicon.

El paquete se apoya en trabajo previo de referencia: la segmentación procede de pyannote (Plaquet y Bredin, 2023), los embeddings de hablante de WeSpeaker (Wang et al., 2023) con datos de VoxCeleb, y el agrupamiento de hablantes del algoritmo VBx con PLDA (Landini et al., 2022). La conversión a Core ML la realiza FluidInference y el modelo se redistribuye sin cambios bajo licencia CC BY 4.0. El peso total de los ficheros de pesos ronda los 20,4 MiB, lo que lo sitúa en la categoría de modelos de audio muy ligeros, aptos para inferencia totalmente local sin GPU dedicada.

Su relevancia práctica está en el despliegue: permite añadir etiquetado de hablante a una app iOS/macOS o a un pipeline de transcripción sin enviar audio a la nube y sin depender de CUDA. Las limitaciones de información son notables: la model card no publica parámetros exactos, ventana de contexto, composición del dataset de entrenamiento completo, métricas de error de diarización ni detalles de cuantización, y el repositorio no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline modular de cuatro etapas en Core ML: extracción de filterbank (FBank), segmentación tipo pyannote (Segmentation), extracción de embeddings de hablante tipo WeSpeaker (Embedding) y puntuación PLDA / clustering VBx (PldaRho) |
| Parametros totales | no disponible. Estimación a partir del tamaño de los `weight.bin`: ~5,3 M en float32 o ~10,7 M en float16 para los cuatro componentes (21.348.736 bytes de pesos) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible. El modelo opera sobre audio troceado en ventanas, pero no se publican los parámetros de segmentación (tamaño de ventana, solapamiento, tasa de refresco) |
| Tipos de cuantizacion | no disponible. Los pesos se entregan en `weight.bin` dentro de cada `.mlmodelc`; no se documenta si están en float32, float16 ni si admiten palettización int8 de Core ML |
| Idiomas soportados | no aplica / no disponible. La diarización es independiente del idioma; las transcripciones y el reconocimiento de voz los aporta un modelo ASR aparte |
| Licencia | CC BY 4.0 |
| Formato de pesos | Core ML (`.mlmodelc` con `weights/weight.bin`, `model.mil`, `metadata.json`) y JSON auxiliar (`plda-parameters.json`) |

Desglose de componentes por tamaño de pesos:

| Componente | Fichero | Bytes | Función |
|---|---|---|---|
| Embedding | `Embedding.mlmodelc/weights/weight.bin` | 13.412.288 | Extracción de embeddings de hablante |
| Segmentation | `Segmentation.mlmodelc/weights/weight.bin` | 5.959.360 | Segmentación por actividad de hablante |
| FBank | `FBank.mlmodelc/weights/weight.bin` | 1.776.896 | Extracción de features log-mel |
| PldaRho | `PldaRho.mlmodelc/weights/weight.bin` | 200.192 | Puntuación PLDA para el clustering |
| Parámetros PLDA | `plda-parameters.json` | 89.416 | Matrices y parámetros del modelo PLDA (VBx) |

## Arquitectura y entrenamiento

El paquete no entrena nada por su cuenta: es una redistribución convertida a Core ML de componentes ya entrenados. La etapa de segmentación se corresponde con el modelo de segmentación de pyannote (Plaquet y Bredin, 2023), que produce activaciones por hablante sobre ventanas de audio. La etapa de embedding usa un extractor tipo WeSpeaker (Wang et al., 2023) entrenado sobre VoxCeleb para proyectar cada segmento en un vector de identidad de hablante. Finalmente, el clustering se realiza con VBx (Landini et al., 2022), que aplica modelado PLDA con un prior HMM sobre los embeddings para decidir cuántos hablantes hay y asignar cada segmento. El componente `PldaRho` y `plda-parameters.json` contienen las matrices y parámetros precalculados de ese PLDA.

La innovación no está en el algoritmo, sino en la conversión y empaquetado: los cuatro bloques se exportan a Core ML con metadatos (`model.mil`, `coremldata.bin`, hashes SHA-256) para que el runtime de Apple pueda planificar la ejecución en el Apple Neural Engine, la GPU o la CPU. No se documenta en la información disponible ningún ajuste fino, destilación, cuantización posterior ni cambio de pesos respecto a los modelos de origen ("redistributed unchanged"). Tampoco se especifica el número total de tokens o de horas de audio de entrenamiento, la composición exacta del dataset más allá de la mención a VoxCeleb, ni si se aplicó algún tipo de RLHF/DPO (no aplicable en un modelo de audio de este tipo).

## Capacidades

- Diarización de hablantes sobre audio: determina cuántos hablantes hay y asigna tramos temporales a cada uno de ellos.
- Manejo de conversaciones multi-hablante, incluyendo solapamiento de voces, en función de las capacidades heredadas del modelo de segmentación de pyannote.
- Extracción de embeddings de hablante reutilizables para tareas auxiliares de verificación o comparación de voces.
- Ejecución totalmente local mediante Core ML, con posibilidad de descarga y carga manual de los modelos según la documentación de FluidAudio.
- Integración con pipelines de reconocimiento de voz para producir transcripciones con etiqueta de hablante (el ASR lo aporta otro modelo).
- Compatibilidad con los flujos de FluidAudio para Apple (segmentación, embeddings y clustering como módulos separados).
- No soporta tool calling, function calling, generación de texto, razonamiento, código, matemáticas ni visión: es un componente de audio, no un LLM.
- Capacidades multilingües: no aplica, la diarización no depende del idioma, aunque el embedding puede heredar el sesgo del corpus de entrenamiento (VoxCeleb, predominantemente inglés).

## Casos de uso

- Transcripción con etiqueta de hablante en apps nativas de Apple: se encadena un modelo ASR de FluidAudio con este diarizador para obtener "Hablante 1: ..." en la propia app, sin salir del dispositivo y sin coste de nube.
- Actas de reuniones y notas de voz: el pipeline segmenta la grabación por participantes y permite generar un resumen por intervención, útil en apps de productividad para iOS y macOS.
- Subtitulado de entrevistas y pódcast: asignar turnos de palabra correctamente simplifica la edición y mejora la legibilidad de los subtítulos en producciones con dos o más voces.
- Analítica de llamadas de atención al cliente: separar agente y cliente en cada grabación para medir tiempos de habla, interrupciones y solapamientos, con el audio procesado localmente para cumplir requisitos de privacidad.
- Investigación cualitativa y ciencias sociales: transcripción de entrevistas semiestructuradas con etiquetado automático de entrevistador y entrevistado, reduciendo el trabajo manual de anotación.
- Documentación clínica y dictado profesional: separar la voz del facultativo de la del paciente en una consulta grabada, siempre que se cumplan los requisitos normativos de tratamiento de datos de salud.
- Indexación y búsqueda por hablante en archivos de audio: generar un índice de segmentos por voz para localizar rápidamente qué dijo cada persona y en qué minuto en un archivo largo.
- Moderación y control de calidad en plataformas de audio: detectar cuántas voces distintas aparecen en un contenido subido, útil para clasificación y para detección de contenido sintético mezclado con voz humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio únicamente lista ficheros, tamaños y hashes SHA-256, sin métricas de diarización (DER, JER, tasa de confusión de hablantes) ni comparaciones con otros sistemas. Tampoco se documentan latencia ni throughput.

## Requisitos de hardware

- Huella de pesos: 21.348.736 bytes en los cuatro `weight.bin` (unos 20,4 MiB) más 89.416 bytes de parámetros PLDA, es decir, alrededor de 20,4 MiB de almacenamiento.
- VRAM: no aplica en el sentido habitual, ya que el paquete está en Core ML y no se distribuye en formato CUDA. La memoria residente en ejecución es del orden de decenas de megabytes, muy inferior a la de cualquier LLM.
- GPU compatibles: pensado para el Apple Neural Engine y la CPU/GPU integrada de Apple Silicon. No se ofrecen versiones para A100, H100 o RTX 4090; ejecutarlo en NVIDIA requeriría reconvertir a otro runtime (por ejemplo, ONNX Runtime o PyTorch con los modelos originales de pyannote/WeSpeaker).
- Cabe en hardware de consumo: sí, el objetivo declarado del ecosistema FluidAudio es la inferencia local en dispositivos Apple, incluidos iPhone, iPad y Mac con chip de la serie M.
- Opciones de despliegue: Core ML a través del SDK Swift de FluidAudio. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo de audio de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Enfoque | Parámetros | Licencia | Disponibilidad |
|---|---|---|---|---|
| fluidaudio-diarizer (volantis-labs) | Pipeline modular pyannote + WeSpeaker + VBx convertido a Core ML | no disponible (~5,3 M estimados en float32) | CC BY 4.0 | Core ML, Apple Silicon |
| pyannote speaker-diarization-3.1 | Mismo esquema de tres etapas, pesos originales | no disponible en la información proporcionada | MIT (según su propia distribución, no verificable aquí) | PyTorch / Hugging Face |
| NVIDIA NeMo diarización (MSDD / Sortformer) | Diarización end-to-end neuronal frente al esquema modular | no disponible en la información proporcionada | Apache 2.0 / NVIDIA Open Model License (no verificable aquí) | NeMo, GPU NVIDIA |
| FluidAudio LS-EEND / Sortformer | Alternativas end-to-end del propio SDK FluidAudio | no disponible | no disponible | Core ML, Apple Silicon |

Los datos de parámetros, métricas y licencias de los modelos competidores no forman parte de la información proporcionada, por lo que la comparación se limita al enfoque arquitectónico y al formato de despliegue. Los resultados de búsqueda mencionan que LS-EEND gestiona bien entornos ruidosos y solapamiento, con soporte de hasta diez hablantes, y que es más ligero que Sortformer, pero esas afirmaciones corresponden a otros modelos de FluidAudio, no a este paquete.

## Limitaciones y advertencias

- Ausencia total de métricas: sin DER ni ningún benchmark publicado, no es posible estimar la calidad de la diarización antes de integrarlo.
- Sesgo de los embeddings: el extractor procede de WeSpeaker entrenado con VoxCeleb, un corpus mayoritariamente en inglés; el rendimiento puede degradarse con acentos, idiomas o condiciones de grabación poco representados.
- Identificación de hablantes no verificada: el modelo agrupa voces, no las reconoce nominalmente; asignar un nombre real exige un paso adicional de comparación contra embeddings de referencia y abre riesgos de identificación errónea.
- Sin parámetros de segmentación publicados: se desconoce el tamaño de ventana, el solapamiento y el tiempo mínimo de habla, lo que complica ajustar el equilibrio entre latencia y precisión.
- Riesgo en escenarios difíciles: solapamiento intenso, ruido de fondo, música, reverberación o número elevado de hablantes pueden provocar fusiones o divisiones incorrectas de turnos.
- Licencia CC BY 4.0: permite uso comercial, pero obliga a mantener la atribución a pyannote, WeSpeaker, VoxCeleb, VBx y FluidInference. Además, cada componente de origen puede arrastrar sus propias condiciones, que conviene verificar antes de un despliegue en producción.
- Procedencia y madurez: el repositorio es una redistribución de terceros ("volantis-labs") de artefactos generados por FluidInference, con 0 descargas y 0 likes, sin pipeline declarado y con una model card limitada a listar ficheros y hashes. No hay garantía de mantenimiento ni de actualizaciones.
- Sin formatos alternativos: no se ofrecen pesos en safetensors, GGUF ni ONNX, lo que ata el uso al ecosistema Core ML y a macOS/iOS.
- No sustituye a un sistema ASR: por sí solo no transcribe, y su valor en producción depende de la calidad del modelo de reconocimiento de voz con el que se combine.

## Enlaces

- Hugging Face: https://huggingface.co/volantis-labs/fluidaudio-diarizer
- FluidAudio, documentación de diarización: https://github.com/FluidInference/FluidAudio/blob/main/Documentation/Diarization/GettingStarted.md
- FluidAudio, Swift Package Index: https://swiftpackageindex.com/FluidInference/FluidAudio
- FluidAudio, Sortformer end-to-end diarization (DeepWiki): https://deepwiki.com/FluidInference/FluidAudio/3.2.4-sortformer-end-to-end-diarization
- FluidAudio, ficha en Project Awesome: https://project-awesome.org/r/FluidInference-FluidAudio
- Réplica del repositorio FluidAudio-Ai: https://github.com/pankaj1920/FluidAudio-Ai/blob/main/Documentation/Diarization/GettingStarted.md
