# StillWorking/sentinel-face-recognition

## Resumen

Sentinel Face Recognition es un sistema completo de reconocimiento facial y busqueda semantica publicado por el usuario StillWorking en Hugging Face. No se trata de un modelo de lenguaje ni de un modelo fundacional en el sentido habitual, sino de un pipeline de vision por computador empaquetado como repositorio reproducible: deteccion facial con MTCNN, extraccion de embeddings con AdaFace IR50, indexacion y busqueda vectorial con FAISS sobre el dataset CelebA (202.599 imagenes) y una capa de analisis asistida por la API de Gemini. El repositorio incluye backend en Python con FastAPI, frontend en React con TypeScript, tests, configuracion de despliegue con Nginx y pesos preentrenados.

El problema que resuelve es la identificacion y recuperacion de rostros similares en grandes colecciones de imagenes, con una API REST lista para produccion y una interfaz web interactiva. Su relevancia practica deriva de que integra en un unico artefacto las piezas tipicas de un sistema de reconocimiento facial (deteccion, alineamiento, embedding, indice ANN y servicio), lo que reduce el trabajo de integracion para prototipos y demos.

El repositorio ocupa 0,5 GB e incluye el dataset CelebA referenciado (1,35 GB comprimido segun la model card). La licencia es MIT, el idioma declarado es ingles y el pipeline de Hugging Face no esta especificado. No se han publicado resultados de benchmarks propios en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de vision: MTCNN (deteccion) + AdaFace IR50 (embedding) + FAISS (busqueda vectorial) |
| Parametros totales | No disponible (AdaFace IR50 es una CNN ResNet-50 modificada; no se detalla el recuento exacto) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (metadatos y documentacion); el reconocimiento facial es independiente del idioma |
| Licencia | MIT |
| Formato de pesos | Pesos AdaFace y MTCNN en el directorio `models_cache/`; embeddings en `embeddings.pkl`; indice FAISS en `index_artifacts/` |
| Dimension del embedding | 512 |
| Dataset de referencia | CelebA (202.599 imagenes, 40 atributos binarios, 178x218 px, JPEG) |
| Entrenamiento de AdaFace | MS1MV2 (segun la model card) |
| Tamano del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

El sistema no entrena un modelo nuevo: compone modelos preentrenados. La deteccion facial se realiza con MTCNN (Multi-task Cascaded Convolutional Networks), que aborda deteccion multi-escala y tolera rotaciones y oclusiones. La extraccion de caracteristicas usa AdaFace con backbone IR50, que produce embeddings de 512 dimensiones; segun la model card, AdaFace fue entrenado sobre MS1MV2 y esta orientado a rostros "in the wild". Sobre esos embeddings se construye un indice FAISS que permite busqueda por similitud sobre mas de 200.000 rostros con latencias inferiores a 5 ms declaradas.

La capa de analisis semantico se delega a la API de Gemini (modelo configurable, por defecto `gemini-2.5-flash`), por lo que el sistema requiere una clave externa para las funciones de generacion y analisis. El repositorio incluye scripts para reconstruir el indice (`build_index.py`) y un conjunto de tests. No se especifican en la informacion disponible detalles sobre el proceso de entrenamiento de AdaFace mas alla del dataset, ni sobre posibles ajustes finos, RLHF/DPO (no aplicables) o innovaciones tecnicas adicionales como decodificacion especulativa.

## Capacidades

- Deteccion de rostros en imagenes con MTCNN, con umbral de confianza configurable (`DETECTION_CONFIDENCE`, por defecto 0,6) y tamano minimo de cara (`MTCNN_MIN_FACE_SIZE`, por defecto 20).
- Extraccion de embeddings faciales de 512 dimensiones mediante AdaFace IR50.
- Busqueda semantica y recuperacion de rostros similares sobre un indice FAISS de mas de 200.000 caras.
- Identificacion de rostros en una imagen con umbral de similitud configurable (`MATCH_SIMILARITY_THRESHOLD`, por defecto 0,50).
- Analisis asistido por Gemini mediante API externa, incluyendo generacion de personas/rostros sinteticos a traves del endpoint `/api/v1/generate-person`.
- API REST con documentacion Swagger en `/docs`, autenticacion por API key opcional, rate limiting (60 peticiones por minuto por defecto) y proteccion CORS.
- Interfaz web React + TypeScript con analisis en tiempo real, busqueda y visualizacion.
- Soporte de ejecucion en GPU (`TORCH_DEVICE=cuda`) y fallback a CPU, mas lento.
- No dispone de tool calling, razonamiento multi-paso ni capacidades de agente en el sentido de un LLM; la orquestacion es la del pipeline descrito.

## Casos de uso

- Prototipado de busqueda de rostros similares: el indice FAISS preconstruido sobre CelebA permite consultar similitudes en menos de 5 ms, util para validar una idea de producto de recuperacion visual antes de invertir en datos propios.
- Demo de reconocimiento facial en tiempo real: con deteccion de 50-100 ms por imagen y embeddings de 20-40 ms por cara, sirve para demostraciones interactivas con webcam o galeria de fotos.
- Base para un sistema de gestion de galerias fotograficas: el endpoint `/api/v1/analyze-frame` identifica caras y el de busqueda recupera coincidencias, lo que permite agrupar fotos por persona en un archivo personal.
- Evaluacion de pipelines de vision por computador: al incluir tests, configuracion por variables de entorno y estructura modular (`api/`, `core/`, `models_cache/`), es util como referencia docente o plantilla de proyecto.
- Integracion en aplicaciones con backend Python: FastAPI y Swagger facilitan conectar el servicio a un frontend propio o a un orquestador interno sin reescribir la capa ML.
- Analisis asistido por LLM: la integracion con Gemini permite anadir descripciones o analisis semantico de los resultados de reconocimiento en flujos de investigacion o periodismo de datos.
- Despliegue detras de Nginx: el ejemplo de configuracion en `deploy/nginx.conf.example` permite montar el servicio como reverse proxy con control de acceso por API key y rate limiting.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente declara metricas de latencia operativa:

| Operacion | Latencia declarada |
|---|---|
| Deteccion facial (MTCNN) | ~50-100 ms por imagen |
| Extraccion de embedding (AdaFace) | ~20-40 ms por rostro |
| Busqueda vectorial (FAISS, 200K rostros) | <5 ms |
| Memoria GPU | ~4 GB VRAM |

No se proporcionan valores de precision (accuracy, TAR/FAR, identificacion en 1:N) sobre ningun conjunto de evaluacion.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4 GB para el pipeline completo en GPU, segun la model card.
- GPU recomendadas: no se especifican modelos concretos; cualquier GPU con al menos 4 GB de VRAM deberia ser suficiente para el pipeline (por ejemplo, RTX 3060, RTX 4060, RTX 4090, A100, H100), aunque el rendimiento exacto no esta documentado.
- Cabe en GPU de consumo: si, dado el requisito de ~4 GB de VRAM; tambien funciona en CPU con rendimiento inferior.
- Opciones de despliegue: ejecucion directa con `python main.py` (FastAPI/uvicorn), frontend con `npm run dev`, y despliegue en produccion detras de Nginx segun `deploy/nginx.conf.example`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de pipeline.
- Latencia y throughput: ver tabla de la seccion anterior; el throughput agregado no esta documentado.

## Comparativa con modelos similares

| Sistema | Tipo | Parametros / modelo base | Contexto / alcance | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sentinel Face Recognition | Pipeline completo (deteccion + embedding + FAISS + API) | AdaFace IR50 + MTCNN | 200K+ rostros indexados | MIT | Hugging Face, repo de 0,5 GB |
| InsightFace (referencia) | Libreria de reconocimiento facial | Varios backbones (ArcFace, etc.) | Depende del indice del usuario | MIT | GitHub, pip |
| DeepFace (referencia) | Framework de reconocimiento facial | Multiples modelos (VGG-Face, Facenet, ArcFace) | Depende del indice del usuario | MIT | GitHub, pip |
| FaceNet / ArcFace (pesos) | Modelo de embedding | Redes tipo Inception/ResNet | No incluye indice ni API | Varía segun publicacion | Multiples repositorios |

La comparativa es cualitativa: no se dispone de resultados de benchmarks de Sentinel que permitan contrastar precision frente a InsightFace o DeepFace. La diferencia principal es que Sentinel empaqueta el pipeline completo con API y UI, mientras que las alternativas son librerias que el usuario debe integrar.

## Limitaciones y advertencias

- El dataset CelebA es de celebridades y esta sesgado hacia rostros occidentales, segun reconoce la propia model card; el rendimiento en otras demografias puede degradarse.
- AdaFace esta entrenado con rostros alineados; las imagenes "in the wild" requieren preprocesamiento y alineamiento previo.
- Riesgo de falsos positivos y negativos en la identificacion: el umbral de similitud (0,50 por defecto) debe calibrarse para cada caso de uso.
- El reconocimiento facial tiene implicaciones legales y eticas relevantes (RGPD en la UE, consentimiento, vigilancia); la licencia MIT no exime del cumplimiento normativo.
- La funcionalidad de analisis y generacion depende de una clave de API de Gemini externa, con coste y dependencia de un servicio de terceros.
- Rate limiting por defecto de 60 peticiones por minuto; el acceso publico sin API key esta desaconsejado en produccion.
- No se han publicado benchmarks de precision; no es posible validar la calidad del reconocimiento frente a alternativas sin evaluacion propia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la fecha de creacion indicada (2026-11-10) es posterior a la fecha actual de redaccion; conviene verificar la integridad y procedencia del contenido antes de usarlo.
- Solo se declara soporte de ingles en los metadatos; la documentacion y los mensajes del sistema estan en ese idioma.

## Enlaces

- Hugging Face: https://huggingface.co/StillWorking/sentinel-face-recognition
- Documentacion de la API (local tras arranque): http://localhost:8000/docs
- Interfaz web (local tras arranque): http://localhost:5173
- Clave de API de Gemini: https://aistudio.google.com/app/apikey
- Dataset CelebA (referenciado): no disponible enlace directo en la informacion proporcionada
- Paper de AdaFace: no disponible enlace en la informacion proporcionada
- Repositorio de MTCNN: no disponible enlace en la informacion proporcionada
- Documentacion de FAISS: no disponible enlace en la informacion proporcionada
