# stanfordnlp/stanza-es

## Resumen

Stanza para español (es) es el paquete de modelos lingüísticos que el proyecto Stanza de Stanford NLP publica para el procesamiento del castellano. No se trata de un modelo generativo único, sino de una colección de modelos neuronales especializados que cubren la cadena completa de análisis lingüístico: tokenización, segmentación de frases, lematización, etiquetado morfosintáctico (POS), análisis de dependencias, reconocimiento de entidades nombradas (NER) y, según la configuración, resolución de correferencia. Se distribuye a través de la librería `stanza` y se publica en Hugging Face con la etiqueta de pipeline `token-classification`.

El modelo lo mantiene el Stanford NLP Group y se libera bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Su relevancia actual radica en que ofrece un pipeline de NLP clásico, determinista y reproducible, para una de las lenguas más habladas del mundo, con modelos entrenados sobre corpus anotados (Universal Dependencies y OntoNotes, entre otros) y una interfaz unificada en Python que abstrae la descarga y ejecución de cada componente.

Conviene subrayar que este repositorio no contiene pesos de un transformer generativo con ventana de contexto ni parámetros activos en el sentido de los LLM actuales. El tamaño del repositorio (43,2 GB) refleja el conjunto de checkpoints de todos los componentes del pipeline para español, no un único modelo monolítico. La ficha siguiente describe sus especificaciones tal como se publican y marca como "no disponible" todo dato que la información proporcionada no cubre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de modelos neuronales (tokenización, POS, lematización, dependencias, NER) basados en redes recurrentes y embeddings; no es un transformer generativo |
| Parametros totales | no disponible (conjunto de varios checkpoints; el repo ocupa 43,2 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa documentos completos mediante segmentación en frases) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoints de la librería `stanza` (formato propio de PyTorch); no se publican safetensors ni GGUF |
| Pipeline en Hugging Face | token-classification |
| Librería | stanza |
| Descargas | 4411 |
| Likes | 1 |
| Fecha de creación | 2022-03-02 |
| Última actualización | 2026-11-27 |

## Arquitectura y entrenamiento

Stanza es una herramienta de análisis lingüístico que encadena varios modelos neuronales entrenados de forma supervisada sobre corpus anotados. Para el español, el pipeline incluye tokenización y segmentación de frases, etiquetado POS y rasgos morfológicos, lematización, análisis de dependencias sintácticas y reconocimiento de entidades nombradas. Los componentes se basan en arquitecturas de tipo BiLSTM con embeddings de palabras y caracteres, y en el caso de las dependencias se emplea un parser de transiciones o graph-based según la configuración del paquete. No se trata de un modelo de lenguaje generativo ni de un transformer decoder.

La información proporcionada no detalla el número de tokens de entrenamiento, la composición exacta de los datasets ni si se aplicaron técnicas de RLHF o DPO, algo que no aplica a este tipo de modelos. Los corpus de referencia habituales del proyecto son Universal Dependencies (para POS y dependencias) y OntoNotes (para NER), pero la model card no especifica cifras concretas para el paquete español. No se documentan innovaciones como decodificación especulativa o atención lineal, porque no forman parte de esta familia de modelos.

## Capacidades

- Tokenización y segmentación de frases en texto en español.
- Etiquetado morfosintáctico (POS) con rasgos morfológicos (género, número, tiempo verbal, etc.).
- Lematización de formas flexionadas.
- Análisis de dependencias sintácticas (árboles de dependencias).
- Reconocimiento de entidades nombradas (personas, organizaciones, lugares, etc.).
- Procesamiento por lotes de documentos completos mediante segmentación interna en frases.
- Interfaz programática mediante la librería `stanza` (Python) con pipelines descargables por idioma.
- No incluye generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No soporta tool calling ni razonamiento multi-paso en el sentido de los agentes LLM.
- Capacidades multilingües limitadas al español en este paquete (el proyecto Stanza cubre más de 70 idiomas con paquetes separados).

## Casos de uso

- Análisis lingüístico de corpus: extracción de POS, lemas y árboles de dependencias sobre grandes volúmenes de texto en español para estudios lingüísticos, lexicografía o construcción de treebanks.
- Preprocesado para pipelines de NLP: normalización, lematización y etiquetado que alimentan modelos posteriores de clasificación, búsqueda o extracción de información.
- Extracción de entidades nombradas en documentos: detección de personas, organizaciones y lugares en noticias, informes o expedientes, con salida estructurada lista para indexar.
- Enriquecimiento de motores de búsqueda: generación de lemas y entidades para mejorar la recuperación léxica y semántica en castellano.
- Anonimización y análisis de PII: localización de entidades de tipo persona u organización como paso previo a la seudonimización en flujos de cumplimiento normativo.
- Análisis de opiniones y reseñas: etiquetado morfosintáctico y dependencias para extraer sujetos, objetos y modificadores en reseñas de producto o atención al cliente.
- Construcción de datasets anotados: uso del pipeline como etiquetador automático para preanotar corpus que luego se revisan manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; al tratarse de modelos recurrentes pequeños en comparación con LLM, la inferencia cabe habitualmente en CPU y en GPUs de gama baja, pero no se documentan cifras concretas.
- GPU recomendadas: no disponible; el proyecto no publica requisitos específicos para el paquete español.
- ¿Cabe en GPU consumer? Sí, previsiblemente en cualquier GPU consumer moderna, dado el perfil de los modelos de Stanza; sin cifras oficiales.
- Opciones de despliegue: librería `stanza` (Python) como vía principal; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que están orientados a LLM generativos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Contexto | Disponibilidad |
|---|---|---|---|---|---|
| stanfordnlp/stanza-es | Pipeline NLP (POS, dependencias, NER) | es | Apache 2.0 | no aplica | Hugging Face, librería stanza |
| spaCy es_core_news_* | Pipeline NLP (POS, dependencias, NER) | es | MIT | no aplica | spaCy, pip |
| Freeling | Analizador lingüístico | es y otros | GPL/LGPL (según componente) | no aplica | Binarios y librerías |
| Stanford CoreNLP (español) | Pipeline NLP | es y otros | GPLv3 | no aplica | Java, descarga directa |

La comparación se limita a herramientas de la misma categoría (análisis lingüístico), ya que no existen modelos generativos equivalentes en la información disponible. No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no razona y no responde a instrucciones.
- Depende de la calidad de los corpus de anotación; puede fallar en dominios muy alejados del entrenamiento (jerga, texto informal, dominios técnicos).
- Riesgo de errores en la tokenización de texto con formatos atípicos (URLs, emoticonos, HTML).
- El NER puede confundir entidades ambiguas o de frontera difusa; conviene revisión humana en usos críticos.
- Solo cubre español en este paquete; no es multilingüe.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las licencias de los corpus subyacentes si redistribuye datos derivados.
- El tamaño del repositorio (43,2 GB) implica descargas pesadas y requisitos de almacenamiento considerables.
- No se documentan sesgos específicos en la información proporcionada; como todo modelo entrenado con corpus periodísticos y literarios, puede reflejar sesgos de esas fuentes.

## Enlaces

- Hugging Face: https://huggingface.co/stanfordnlp/stanza-es
- Web del proyecto Stanza: https://stanfordnlp.github.io/stanza
- Repositorio GitHub: https://github.com/stanfordnlp/stanza
- Repositorio de modelos de Hugging Face del proyecto: https://github.com/stanfordnlp/huggingface-models
