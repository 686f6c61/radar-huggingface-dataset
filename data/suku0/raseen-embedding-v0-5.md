# Suku0/raseen-embedding-v0.5

## Resumen

Suku0/raseen-embedding-v0.5 es un modelo de embeddings bilingüe de primera línea para árabe e inglés, desarrollado por Suku0 (Sulaiman) como una versión preliminar (v0.5) del proyecto Raseen. Se trata de un fine-tune del modelo base Qwen/Qwen3-Embedding-0.6B, con 595,7 millones de parámetros, diseñado específicamente para tareas de recuperación de información y búsqueda semántica en contextos donde el árabe es el idioma principal.

El modelo resuelve el problema de la escasez de modelos de embeddings de alta calidad para árabe, ofreciendo una alternativa open source con licencia Apache-2.0. Su relevancia actual radica en que combina la arquitectura probada de Qwen3-Embedding con un entrenamiento orientado a datos árabes, logrando resultados destacados en benchmarks como MIRACL (nDCG@10 de 0,712) y PublicHealthQA (0,851). Está disponible en Hugging Face con formato safetensors y es compatible con la librería transformers y text-embeddings-inference.

Al ser una versión 0.5, el autor especifica una serie de "puertas de lanzamiento" (release gates) que aún deben cumplirse para la versión 1, incluyendo evaluación dimensional, juicios humanos de relevancia y un reranker. Esto indica que es un modelo en desarrollo activo, pero ya utilizable para pruebas y prototipos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fine-tune de Qwen3-Embedding-0.6B (Transformer) |
| Parametros totales | 595.776.512 (~596M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Arabe e ingles (bilingue, prioridad arabe) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `Qwen/Qwen3-Embedding-0.6B` (revision `97b0c614be4d77ee51c0cef4e5f07c00f9eb65b3`), un modelo de embeddings de la familia Qwen. Al ser un fine-tune, mantiene la arquitectura del base, aunque no se especifican detalles internos (si es encoder-only, decoder-only o híbrido). El entrenamiento se realizó sobre un conjunto de datos que incluye fuentes de AISA y Omartificial (licencia Apache-2.0) y el corpus paralelo Tatoeba EN-AR (CC-BY-2.0). No se proporcionan datos sobre el número de tokens de entrenamiento, el método de optimización (p. ej., contrasteivo, hard negatives) ni si se empleó algún tipo de aprendizaje por refuerzo. El autor indica que los datasets conservan sus propias licencias, mientras que los pesos del modelo y el código Raseen son Apache-2.0.

## Capacidades

- Generacion de embeddings de texto para busqueda semantica y recuperacion de informacion.
- Soporte bilingue arabe-ingles, con prioridad en arabe (incluye dialectos y arabe moderno estandar).
- Compatible con pipelines de feature-extraction de transformers y con text-embeddings-inference para despliegue en produccion.
- Optimizado para tareas de retrieval, incluyendo datasets como MIRACL, MKQA, MLQA y PublicHealthQA.
- No se mencionan capacidades de tool calling, agentes o generacion de texto; es un modelo exclusivamente para representacion vectorial.

## Casos de uso

- Busqueda semantica en contenido arabe: el modelo puede indexar documentos en arabe y consultas de usuarios, devolviendo resultados relevantes mediante similitud coseno. Su buen rendimiento en MIRACL (nDCG@10 de 0,712) lo hace adecuado para motores de busqueda en medios, bibliotecas digitales o repositorios gubernamentales.
- Sistemas RAG (Retrieval-Augmented Generation) para asistentes en arabe: al integrarse con un LLM generativo, permite recuperar fragmentos de una base de conocimiento en arabe y pasarlos como contexto, mejorando la precision de respuestas en dominios como salud (PublicHealthQA nDCG@10 de 0,851) o atencion al cliente.
- Clasificacion de textos y analisis de sentimiento: los embeddings generados pueden alimentar clasificadores supervisados para tareas como moderacion de contenido, deteccion de spam o analisis de opinion en redes sociales arabes.
- Deduplicacion y deteccion de plagio: al comparar vectores de documentos, se pueden identificar textos duplicados o parcialmente copiados en grandes corpus arabes, util para editoriales o plataformas academicas.
- Sistemas de recomendacion basados en contenido: representando articulos, productos o noticias en arabe como vectores, se puede sugerir contenido similar a los usuarios segun su historial de interaccion.
- Busqueda multilingue arabe-ingles: gracias a su naturaleza bilingue, permite consultas en ingles para recuperar documentos en arabe y viceversa, facilitando la interoperabilidad en organizaciones internacionales o empresas con equipos mixtos.

## Benchmarks y rendimiento

El autor proporciona resultados de evaluacion en varios datasets de retrieval, medidos con nDCG@10. No se incluyen comparaciones con otros modelos en la informacion disponible.

| Dataset | nDCG@10 |
|---|---|
| Frozen development macro | 0,9296 |
| MIRACLRetrieval | 0,7125 |
| MIRACLRetrievalHardNegatives.v2 | 0,7218 |
| MKQARetrieval | 0,0531 |
| MLQARetrieval | 0,5433 |
| MintakaRetrieval | 0,2234 |
| MrTidyRetrieval | 0,6601 |
| PublicHealthQA | 0,8508 |
| SadeemQuestionRetrieval | 0,6714 |
| Targeted 10-task macro | 0,5548 |
| WebFAQRetrieval | 0,7534 |
| XPQARetrieval | 0,3585 |

El rendimiento en MKQA es notablemente bajo (0,053), lo que sugiere limitaciones en consultas de conocimiento general con respuestas cortas. En cambio, los resultados en MIRACL y PublicHealthQA son solidos para retrieval en arabe.

## Requisitos de hardware

- VRAM estimada: con 596M parametros, en fp16 se requieren aproximadamente 1,2 GB de VRAM solo para los pesos (596M × 2 bytes). En int8, unos 0,6 GB. Se recomienda al menos 2 GB de VRAM para inferencia con margen de overhead.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas (p. ej., NVIDIA GTX 1650, RTX 3050, RTX 4060) es suficiente para inferencia en lote. Para despliegue concurrente, una RTX 3090 o A10G ofrece mayor throughput.
- Compatibilidad con consumer GPU: si, cabe en GPUs de gama media e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: compatible con text-embeddings-inference, vLLM (si soporta embeddings), llama.cpp (para cuantizacion GGUF, aunque no se proporcionan archivos GGUF), y la API de transformers de Hugging Face.
- Latencia estimada: no se proporcionan datos oficiales. Para un lote de 100 textos cortos, se espera una latencia inferior a 50 ms en una GPU moderna, aunque depende del hardware y la longitud de los textos.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de embeddings arabe-ingles en la informacion proporcionada. Como referencia, el modelo base Qwen3-Embedding-0.6B es un punto de partida, pero no se han publicado sus resultados en los mismos benchmarks. No se puede establecer una comparativa rigurosa sin datos adicionales.

## Limitaciones y advertencias

- Version preliminar (v0.5): el autor lista varias "release gates" pendientes para la v1, como evaluacion dimensional, juicios humanos de relevancia y un reranker. Esto implica que el modelo puede tener inconsistencias o sesgos no detectados.
- Sesgos de datos: los datos de entrenamiento provienen de fuentes especificas (AISA, Omartificial, Tatoeba) que pueden no representar la diversidad completa del arabe, especialmente dialectos coloquiales o variantes regionales.
- Bajo rendimiento en MKQA: el nDCG@10 de 0,053 sugiere dificultades con consultas de conocimiento factual cortas, lo que limita su uso en QA extractivo sin un reranker adicional.
- Limitaciones de idioma: solo cubre arabe e ingles; no soporta otros idiomas, lo que puede ser restrictivo en entornos multilingues amplios.
- Licencias de datos: aunque los pesos son Apache-2.0, los datasets de entrenamiento conservan sus propias licencias (CC-BY-2.0 para Tatoeba). Esto no afecta al uso del modelo, pero debe tenerse en cuenta si se desea replicar el entrenamiento.
- Sin soporte de generacion: al ser un modelo de embeddings, no puede generar texto ni realizar tareas de razonamiento; solo produce vectores numericos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Suku0/raseen-embedding-v0.5
- Perfil del autor: https://huggingface.co/Suku0
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
