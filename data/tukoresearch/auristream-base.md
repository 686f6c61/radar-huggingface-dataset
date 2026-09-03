# TuKoResearch/AuriStream-base

## Resumen

AuriStream es un modelo de lenguaje de habla desarrollado por TuKoResearch, un equipo liderado por Greta Tuckute y Klemen Kotar. El modelo representa el habla mediante la predicción autorregresiva de tokens cocleares, un enfoque que se inspira en la codificación neuronal del sistema auditivo humano. AuriStream se compone de dos etapas: una primera etapa de tokenización que convierte la señal de audio en una secuencia de tokens cocleares mediante un tokenizador como WavCochCausalV8192, y una segunda etapa que aplica un modelo autorregresivo de secuencia sobre estos tokens para aprender representaciones fonémicas y léxicas de alto nivel.

La relevancia actual de AuriStream radica en su capacidad para lograr un rendimiento competitivo en diversas tareas de habla del benchmark SUPERB, al mismo tiempo que aprende representaciones semánticas de nivel léxico. El modelo base, identificado como `TuKoResearch/AuriStream-base`, está disponible bajo licencia Apache 2.0 y es accesible a través de la librería Transformers de HuggingFace, aunque su acceso está restringido y requiere aceptar condiciones previas. El repositorio principal y la documentación del proyecto se encuentran en GitHub y en la página oficial del proyecto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo autorregresivo de secuencia sobre tokens cocleares (dos etapas: tokenización coclear + modelado de secuencia) |
| Parametros totales | no disponible (el modelo base; existe una variante de 7B parámetros denominada AuriStream7BDeep_40Pred_BigAudioDataset_100k) |
| Parametros activos | no aplicable (no se especifica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (probablemente safetensors, pero no confirmado) |

## Arquitectura y entrenamiento

AuriStream se basa en un enfoque de dos etapas. La primera etapa emplea un tokenizador coclear (por ejemplo, WavCochCausalV8192) que transforma la señal de audio en una secuencia de tokens discretos que imitan la codificación coclear del oído humano. La segunda etapa consiste en un modelo autorregresivo de secuencia, presumiblemente un transformer, que predice estos tokens en orden temporal. Este diseño permite que el modelo aprenda representaciones fonémicas y léxicas de forma no supervisada, sin necesidad de etiquetas lingüísticas explícitas.

No se ha publicado información detallada sobre el proceso de entrenamiento del modelo base, como el número de tokens de entrenamiento, la composición del dataset o el uso de técnicas de alineación como RLHF o DPO. La variante de 7B parámetros (`AuriStream7BDeep_40Pred_BigAudioDataset_100k`) sugiere que el entrenamiento se realizó sobre un conjunto de audio de gran tamaño ("BigAudioDataset"), pero no se especifican más detalles. Se recomienda consultar el paper y el repositorio oficial para obtener información actualizada.

## Capacidades

- Generación de representaciones de habla: AuriStream aprende representaciones de audio que capturan información fonémica, léxica y semántica.
- Tareas de procesamiento de habla: el modelo muestra un rendimiento competitivo en tareas del benchmark SUPERB, que incluye reconocimiento de fonemas, reconocimiento de habla, identificación de hablante, entre otras.
- Representaciones léxicas: el modelo desarrolla representaciones semánticas de nivel de palabra, lo que lo diferencia de otros modelos de audio que se centran únicamente en características acústicas.
- No se ha documentado soporte para tool calling, funciones de agente, razonamiento multi-paso, visión o audio generativo en la información disponible.

## Casos de uso

- Extracción de características acústicas para ASR: AuriStream puede utilizarse como extractor de características de audio en pipelines de reconocimiento automático de habla, aprovechando sus representaciones fonémicas y léxicas.
- Análisis de prosodia y fonética: sus representaciones cocleares permiten estudiar patrones tonales y articulatorios en aplicaciones de lingüística computacional.
- Sistemas de verificación de hablante: gracias a su rendimiento en tareas de identificación de hablante dentro de SUPERB, puede integrarse en sistemas biométricos de voz.
- Compresión de audio para almacenamiento: la tokenización coclear podría servir como base para esquemas de compresión de audio basados en modelos generativos.
- Investigación en neurociencia computacional: al imitar la codificación coclear, el modelo sirve como herramienta para estudiar cómo el cerebro procesa el habla.
- Desarrollo de asistentes de voz en entornos con pocos recursos: su licencia Apache 2.0 y su arquitectura abierta permiten adaptarlo a nuevos idiomas y dominios con datasets limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La página del proyecto menciona un rendimiento competitivo en tareas SUPERB, pero no se proporcionan métricas numéricas específicas para el modelo base. Se recomienda consultar el paper de AuriStream para obtener datos detallados de evaluación.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware para el modelo base. Dado que existe una variante de 7B parámetros, se puede inferir que la inferencia requerirá al menos 14-16 GB de VRAM en FP16 para esa variante, pero no hay datos confirmados para el modelo base. Se sugiere probar con GPUs consumer como RTX 3090 o RTX 4090, o GPUs de datacenter como A100 o H100, dependiendo del tamaño final del modelo. Las opciones de despliegue típicas para modelos de Transformers incluyen vLLM, llama.cpp, Ollama o TGI, pero no se ha confirmado la compatibilidad con estas herramientas.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de habla como WavLM, HuBERT o wav2vec 2.0. Se carece de datos de parámetros, contexto y rendimiento del modelo base. Se recomienda consultar el paper para obtener una comparación formal.

## Limitaciones y advertencias

- Acceso restringido: el modelo requiere aceptar condiciones de uso en HuggingFace, lo que puede limitar su adopción inmediata en entornos industriales.
- Falta de documentación técnica: no se han publicado especificaciones detalladas sobre el modelo base (parámetros, contexto, datos de entrenamiento), lo que dificulta evaluar su idoneidad para casos de uso concretos.
- Riesgo de alucinaciones: al ser un modelo autorregresivo, puede generar secuencias de tokens que no correspondan a audio real si se utiliza para generación, aunque su propósito principal es la representación.
- Sesgos potenciales: al entrenarse con datos de audio no especificados, podría heredar sesgos de acentos, dialectos o condiciones de grabación.
- Limitaciones de idioma: no se ha especificado qué idiomas soporta, por lo que su uso en idiomas distintos al inglés podría degradar el rendimiento.

## Enlaces

- Modelo base en HuggingFace: https://huggingface.co/TuKoResearch/AuriStream-base
- Variante de 7B parámetros: https://huggingface.co/TuKoResearch/AuriStream7BDeep_40Pred_BigAudioDataset_100k
- Página del proyecto: https://tukoresearch.github.io/auristream-speech/
- Repositorio GitHub: https://github.com/TuKoResearch/auristream-speech
- Modelo paralelo (AuriStreamParallel-base): https://huggingface.co/TuKoResearch/AuriStreamParallel-base
