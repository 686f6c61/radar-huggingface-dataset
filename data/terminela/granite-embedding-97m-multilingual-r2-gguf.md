# terminela/granite-embedding-97m-multilingual-r2-GGUF

## Resumen

`terminela/granite-embedding-97m-multilingual-r2-GGUF` es una conversión al formato GGUF del modelo de embeddings `ibm-granite/granite-embedding-97m-multilingual-r2` de IBM. Se trata de un modelo de representación densa (feature extraction) de 97.441.152 parámetros, pensado para tareas de similitud semántica y búsqueda vectorial. Esta versión concreta, publicada por el usuario `terminela`, se distribuye cuantizada en Q8_0 y se emplea en la aplicación Terminela para búsqueda semántica en dispositivo.

El interés de esta ficha radica en que ofrece el modelo de IBM en un contenedor GGUF, lo que permite su ejecución con llama.cpp y herramientas compatibles sin necesidad de cargar los pesos originales en safetensors. El repositorio ocupa 0,1 GB y contiene un único fichero de 115.061.088 bytes, lo que lo hace manejable en entornos con recursos limitados.

La conversión se realizó con `convert_hf_to_gguf.py` de llama.cpp (build b11701) sobre la revisión `835ad14087e140460703cf0fae09f97d469d65c2` del modelo original. La licencia es Apache-2.0, heredada del modelo base, y el autor declara que los pesos no se han modificado en contenido, solo en formato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de embeddings del tipo transformer; la model card no detalla la arquitectura interna) |
| Parametros totales | 97.441.152 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unica cuantizacion publicada en el repo) |
| Idiomas soportados | no disponible (el nombre del modelo indica multilingue, pero la model card no enumera idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero `granite-embedding-97m-multilingual-r2-Q8_0.gguf`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base. Por el nombre y la tarea declarada (`feature-extraction`, `sentence-similarity`) se trata de un modelo de embeddings, pero la model card de esta conversión no especifica si emplea atención estándar, atención lineal u otra variante, ni el número de capas, dimensiones de embedding o cabezas de atención.

Tampoco se documentan en la información proporcionada los datos de entrenamiento del modelo original: número de tokens, composición del corpus, uso de RLHF/DPO u otras técnicas de alineación. Lo único verificable es el proceso de conversión: se aplicó `convert_hf_to_gguf.py` de llama.cpp (b11701) con cuantización Q8_0 sobre la revisión `835ad14087e140460703cf0fae09f97d469d65c2` del repositorio de IBM, sin alterar el contenido de los pesos. Para detalles de entrenamiento y arquitectura debe consultarse la model card del modelo base.

## Capacidades

- Generación de embeddings de frases y documentos para similitud semántica (`sentence-similarity`).
- Extracción de características (`feature-extraction`) para pipelines de recuperación y clustering.
- Búsqueda semántica en dispositivo, uso declarado por el autor en la aplicación Terminela.
- Capacidad multilingüe indicada por el nombre del modelo base, aunque la lista concreta de idiomas no está disponible en la información proporcionada.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking; es un modelo de embeddings, no generativo conversacional.

## Casos de uso

- Búsqueda semántica en aplicaciones móviles o de escritorio: el tamaño reducido del GGUF Q8_0 (unos 115 MB) permite indexar y consultar colecciones de documentos localmente, sin enviar texto a un servicio externo, tal como hace la app Terminela.
- Motor de recuperación en pipelines RAG: generar embeddings de chunks de documentación y de la consulta del usuario para recuperar los fragmentos más relevantes antes de pasarlos a un LLM generador.
- Deduplicación y clustering de textos: calcular similitudes entre registros de una base de datos para agrupar contenido casi idéntico o detectar duplicados en corpus multilingües.
- Clasificación zero-shot por similitud: comparar el embedding de un texto con embeddings de etiquetas descriptivas para asignar categorías sin entrenamiento supervisado adicional.
- Moderación y filtrado por similitud: comparar mensajes entrantes con una lista de patrones problemáticos previamente embebidos para priorizar revisiones.
- Búsqueda en bases de conocimiento internas: desplegar el modelo con llama.cpp en servidores modestos para ofrecer búsqueda semántica sobre wikis o manuales corporativos sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q8_0 ocupa 115.061.088 bytes (unos 110 MiB); en memoria se requiere aproximadamente esa cantidad más el overhead del runtime, por lo que cabe holgadamente en menos de 1 GB de VRAM o RAM.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre es suficiente; no se requiere A100, H100 ni RTX 4090. También puede ejecutarse en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (por ejemplo, GTX 1050, RTX 3050, RTX 4060) e incluso en iGPU con memoria compartida.
- Opciones de despliegue: llama.cpp y herramientas basadas en GGUF; el repo está etiquetado como `endpoints_compatible`. No se documenta soporte específico de vLLM, TGI u Ollama en la información proporcionada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| terminela/granite-embedding-97m-multilingual-r2-GGUF | 97.441.152 | no disponible | GGUF Q8_0 | Apache-2.0 | HuggingFace (53 descargas) |
| ibm-granite/granite-embedding-97m-multilingual-r2 | 97.441.152 (mismo modelo base) | no disponible | safetensors (formato original) | Apache-2.0 | HuggingFace (modelo base oficial) |
| Alternativas de embeddings multilingües de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación documentable con datos de la información proporcionada es frente al modelo base de IBM, del que esta conversión deriva directamente. No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información consultada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al ser una conversión del modelo de IBM, hereda los sesgos del modelo base, que deben consultarse en su model card.
- Riesgo de alucinación: no aplica en el sentido generativo, pero los embeddings pueden producir similitudes engañosas en textos ambiguos o dominios muy especializados.
- Limitaciones de contexto o idioma: la longitud máxima de contexto no está disponible; la cobertura multilingüe se infiere del nombre pero no se enumera. Textos que excedan la ventana del modelo deberán truncarse o dividirse.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificación y redistribución con atribución; el autor indica que solo redistribuye los pesos convertidos sin cambios de contenido.
- Caveats para producción: el repositorio tiene 0 likes y 53 descargas, por lo que conviene verificar el SHA-256 (`2f842d092d6916e0bdbd47a83100972518a77c3b6474a037363071f74af2cb99`) antes de desplegar; solo se ofrece Q8_0, sin alternativas de cuantización más agresivas. La conversión se hizo con una build concreta de llama.cpp (b11701), lo que puede condicionar la compatibilidad con versiones más antiguas.

## Enlaces

- Repositorio HuggingFace de esta conversión: https://huggingface.co/terminela/granite-embedding-97m-multilingual-r2-GGUF
- Modelo base en HuggingFace: https://huggingface.co/ibm-granite/granite-embedding-97m-multilingual-r2
- Revisión del modelo base utilizada: `835ad14087e140460703cf0fae09f97d469d65c2`
- Script de conversión de llama.cpp: `convert_hf_to_gguf.py` (llama.cpp build b11701)
