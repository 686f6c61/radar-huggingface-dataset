# whisper-free/speaker-diarization-onnx

## Resumen

`whisper-free/speaker-diarization-onnx` es un repositorio de modelos ONNX para diarización de hablantes (identificar «quién habla y cuándo») que utiliza la aplicación Whisper Free. No es un modelo entrenado por el autor: contiene dos ficheros copiados sin modificar de sus fuentes originales, un modelo de segmentación (`segmentation-3.0.onnx`, export ONNX de `pyannote/segmentation-3.0` de Hervé Bredin / CNRS) y un modelo de embeddings de hablante (`embedding-campplus-zh-en.onnx`, CAM++ de 3D-Speaker de Alibaba / ModelScope).

Su relevancia es práctica: empaqueta en formato ONNX dos piezas que en su origen viven en el ecosistema PyTorch y sherpa-onnx, lo que permite ejecutar diarización sobre ONNX Runtime en CPU o GPU sin dependencias de PyTorch. Esto encaja en pipelines de transcripción donde un ASR (por ejemplo Whisper) genera el texto y estos modelos atribuyen cada segmento a un hablante.

La ficha pública es mínima: no se documentan parámetros, datasets de entrenamiento, benchmarks ni idiomas, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta. Las licencias son distintas por fichero (MIT y Apache-2.0) y el autor advierte explícitamente de que las licencias de los datasets de entrenamiento no fueron auditadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de diarización en dos etapas: segmentación de voz (`segmentation-3.0.onnx`, export ONNX de `pyannote/segmentation-3.0`) + embedding de hablante (`embedding-campplus-zh-en.onnx`, CAM++ de 3D-Speaker). La estructura interna de cada red no se detalla en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de audio; no se documenta la ventana de entrada) |
| Tipos de cuantizacion | no disponible (solo se distribuyen ficheros `.onnx`; no se indica precisión ni se documentan variantes cuantizadas) |
| Idiomas soportados | no disponibles; el nombre del fichero de embedding incluye el sufijo `zh_en` |
| Licencia | `per-file-see-readme`: `segmentation-3.0.onnx` bajo MIT; `embedding-campplus-zh-en.onnx` bajo Apache-2.0 |
| Formato de pesos | ONNX (`.onnx`), con fichero `SHA256SUMS` para verificación |
| Pipeline declarado (Hugging Face) | `voice-activity-detection` |
| Tamaño del repositorio | 0.0 GB según la API de Hugging Face (dato a verificar antes de usar) |
| Autor del repositorio | `whisper-free` (tercero; no es el autor de los modelos originales) |

## Arquitectura y entrenamiento

El repositorio no implementa un modelo único, sino que agrupa dos componentes complementarios. El primero es un modelo de segmentación de voz derivado de `pyannote/segmentation-3.0` (autor: Hervé Bredin / CNRS, proyecto pyannote.audio), del que existe un export ONNX realizado por `csukuangfj` dentro del ecosistema sherpa-onnx. El segundo es un extractor de embeddings de hablante CAM++ procedente de `campplus_sv_zh_en_16k-common_advanced` de 3D-Speaker (Alibaba / ModelScope), con build ONNX publicado en las releases de k2-fsa/sherpa-onnx. La combinación habitual es: la segmentación propone regiones de habla y el embedding genera vectores que permiten agrupar esas regiones por hablante.

El autor declara explícitamente que los modelos están «copiados sin cambios» y que no los ha convertido él mismo. Por tanto no hay información sobre tokens de entrenamiento, composición del dataset, ni fases de ajuste (RLHF/DPO no aplican a este tipo de modelos). Tampoco se detalla ninguna innovación técnica propia: el interés del repositorio es el empaquetado y la distribución, no la investigación. La model card advierte de que las licencias de los datasets de entrenamiento no fueron auditadas y de que el material se ofrece «as-is, no warranty».

## Capacidades

- Segmentación de actividad de voz y de regiones de habla sobre audio (etiqueta de pipeline `voice-activity-detection`).
- Extracción de embeddings de hablante (representaciones vectoriales para verificación y agrupamiento).
- Diarización completa al combinar ambos modelos: asignar etiquetas de hablante a intervalos temporales de una grabación.
- Ejecución mediante ONNX Runtime, lo que permite despliegue multiplataforma sin PyTorch.
- Integración con transcripción ASR: alinear la salida de un modelo de reconocimiento de voz con las etiquetas de hablante para obtener transcripciones atribuidas.
- No dispone de generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No está orientado a agentes ni a razonamiento multi-paso.
- No se documentan capacidades multilingües más allá del sufijo `zh_en` en el nombre del modelo de embedding.
- No dispone de modo «thinking» ni de entradas de audio procesadas como lenguaje.

## Casos de uso

- Actas de reuniones: transcribir con Whisper y usar la segmentación más los embeddings para etiquetar cada intervención con su hablante, de modo que el acta refleje quién propuso cada acción.
- Subtitulado accesible: generar subtítulos con identificador de hablante para vídeos con varias personas, útil en formación interna y documentación audiovisual.
- Analítica de contact center: separar turnos de agente y cliente en llamadas grabadas y calcular métricas como tiempo de habla por rol o solapamientos.
- Investigación cualitativa: procesar entrevistas semiestructuradas y grupos focales, atribuyendo fragmentos a personas concretas antes de la codificación manual.
- Producción de pódcast y entrevistas: detectar automáticamente los cambios de locutor para agilizar la edición y la generación de capítulos o marcas de tiempo.
- Auditoría y cumplimiento: verificar quién intervino en una comunicación grabada, con la ventaja de ejecutar la inferencia en infraestructura propia al ser modelos ONNX locales.
- Preprocesado para pipelines RAG sobre audio: enriquecer cada fragmento transcrito con metadatos de hablante antes de indexarlo en una base vectorial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de error de diarización (DER), curvas de detección ni comparaciones cuantitativas con otros sistemas.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio no publica recuento de parámetros ni tamaño de los ficheros, y la API reporta 0.0 GB, un dato que debe verificarse tras la descarga.
- Inferencia en CPU: viable en principio con ONNX Runtime, que es el escenario habitual de sherpa-onnx; no hay cifras publicadas de latencia.
- GPU: al no documentarse requisitos, no es posible recomendar modelos concretos (A100, H100, RTX 4090 u otros) con fundamento.
- Ejecución en GPU de consumo: no confirmada por falta de datos de memoria; el pipeline en dos etapas (segmentación por ventanas + embedding) suele ser ligero, pero no hay medición oficial en la información disponible.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), sherpa-onnx (los dos modelos provienen de su ecosistema) y la propia aplicación Whisper Free. vLLM, llama.cpp, Ollama y TGI no aplican: son runtimes de modelos de lenguaje.
- Throughput y latencia: no disponibles.

## Comparativa con modelos similares

| Sistema | Componentes | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este repositorio (`whisper-free/speaker-diarization-onnx`) | Segmentación pyannote 3.0 + embedding CAM++ en ONNX | no disponible | no disponible | no disponible | MIT + Apache-2.0 por fichero | Hugging Face, 0 descargas |
| `pyannote/segmentation-3.0` (original) | Modelo de segmentación en PyTorch | no disponible en la informacion proporcionada | no disponible | no disponible | MIT según la model card citada | Hugging Face |
| Pipeline de diarización de sherpa-onnx (k2-fsa) | Segmentación + embedding, habitualmente con ONNX Runtime | no disponible | no disponible | no disponible | Apache-2.0 según el ecosistema citado | GitHub y releases |
| 3D-Speaker CAM++ (original, ModelScope) | Extractor de embeddings de hablante | no disponible | no disponible | no disponible | Apache-2.0 según la model card citada | GitHub y ModelScope |

No se dispone de datos cuantitativos para comparar el rendimiento relativo de estas alternativas; la diferencia principal documentada es el formato (ONNX empaquetado frente a PyTorch) y el desglose de licencias por fichero.

## Limitaciones y advertencias

- Licencia no unificada: cada fichero tiene su propia licencia (MIT y Apache-2.0). Cualquier uso comercial debe revisarse fichero a fichero junto con el texto del README.
- Las licencias de los datasets de entrenamiento originales no fueron auditadas por el autor, lo que introduce un riesgo legal no cuantificado en producción.
- El material se distribuye «as-is, no warranty»: sin garantías de funcionamiento ni de soporte.
- El autor no ha entrenado ni convertido los modelos; los problemas de calidad deben atribuirse a los modelos de origen (pyannote y 3D-Speaker).
- No hay benchmarks publicados: no es posible estimar la tasa de error de diarización (DER) antes de desplegar.
- No se documentan los idiomas soportados; el único indicio es el sufijo `zh_en` del modelo de embedding.
- No se documenta el comportamiento con habla solapada, ruido de fondo, cambios de canal o grabaciones telefónicas de baja calidad.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validación de la comunidad ni informes de incidencias.
- El tamaño reportado de 0.0 GB puede indicar que los pesos no están incluidos en el snapshot o que el dato es incompleto: verificar con `SHA256SUMS` antes de integrar.
- La etiqueta de pipeline (`voice-activity-detection`) no describe del todo la funcionalidad real (diarización), lo que puede dificultar el descubrimiento y la integración automática.
- La model card no indica requisitos de hardware, versiones de ONNX Runtime ni formato exacto de entrada/salida de los tensores.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de asignación errónea de hablantes (fusiones o divisiones incorrectas), que debe validarse con muestras etiquetadas manualmente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/whisper-free/speaker-diarization-onnx
- Modelo de segmentación original: https://huggingface.co/pyannote/segmentation-3.0
- Export ONNX de la segmentación (csukuangfj): https://huggingface.co/csukuangfj/sherpa-onnx-pyannote-segmentation-3-0
- Proyecto sherpa-onnx (k2-fsa): https://github.com/k2-fsa/sherpa-onnx
- Proyecto 3D-Speaker (ModelScope, embeddings CAM++): https://github.com/modelscope/3D-Speaker
- Proyecto pyannote.audio: https://github.com/pyannote/pyannote-audio

Nota sobre la búsqueda web: los resultados obtenidos corresponden a páginas genéricas sobre transcripción con Whisper (whisperai.com, clubic.com, openai.com/index/whisper) y no aportan información técnica sobre este repositorio de diarización, por lo que no se han utilizado como fuente de datos.
