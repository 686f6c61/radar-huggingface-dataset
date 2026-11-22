# Thelivu/Thelivu-750M-Embedding

## Resumen

Thelivu-750M-Embedding es un adaptador LoRA de rango 32 que convierte el codificador del modelo base Thelivu-750M en un modelo de embeddings de texto para búsqueda semántica y generación aumentada por recuperación (RAG). Lo desarrolla Saravanan A R bajo la organización Thelivu, y su propósito es resolver el problema de la recuperación de pasajes en inglés: el modelo base, sin entrenamiento específico para embeddings, obtiene alrededor de 0,04 nDCG@10 en tareas de retrieval, mientras que con este adaptador de 61 MB alcanza 0,610 de media en diez tareas públicas de recuperación en inglés.

El adaptador no es un modelo completo: requiere el modelo base Thelivu-750M y utiliza únicamente su codificador, que cuenta con 358M parámetros. Entrena 15,14M parámetros y produce vectores de 1.024 dimensiones, con entrenamiento Matryoshka para poder truncarlos a 512, 256 o 128 dimensiones sin reentrenar. Soporta ventanas de 512 tokens en uso ordinario y hasta 2.048 tokens en una sola pasada mediante late chunking integrado, una técnica que preserva el contexto entre fragmentos de un documento largo.

Su relevancia actual radica en dos factores: por un lado, compite con modelos de embeddings consolidados como all-MiniLM-L6 o sentence-t5-large en las mismas tareas, superándolos en la media reportada; por otro, su formato compacto (un archivo de 61 MB sobre una base compartida) permite despliegue autoalojado en CPU o GPU sin enviar texto a servicios externos. La licencia del adaptador es Apache 2.0, aunque la del modelo base es independiente y debe verificarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 32) sobre el codificador de un transformer encoder-decoder (Thelivu-750M) |
| Parametros totales | 15,14M entrenables en el adaptador; 358M en el codificador utilizado del modelo base |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens por texto en uso ordinario; hasta 2.048 tokens en una pasada con late chunking |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 para el adaptador; el modelo base tiene licencia propia |
| Formato de pesos | `adapter.safetensors` con `adapter_config.json` en formato Thelivu (no PEFT) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA de rango 32 sobre el codificador del modelo base Thelivu-750M, un transformer encoder-decoder del que solo se emplea la parte encoder (358M parámetros). El adaptador entrena 15,14M parámetros y genera vectores unitarios de 1.024 dimensiones; el entrenamiento Matryoshka permite truncar la salida a 512, 256 o 128 dimensiones manteniendo la norma unitaria. El modelo es asimétrico: las consultas y los pasajes se codifican con prefijos distintos (`query: ` y `passage: `), y las consultas se truncan a 64 tokens mientras que los pasajes se truncan a 512.

El entrenamiento se realizó sobre pares de texto públicos: pares pregunta-respuesta, pares de FAQ, pares de afirmación-evidencia y pares título-abstract de texto científico y enciclopédico, incluyendo texto con fórmulas y notación. Los datos se limpiaron y preprocesaron para garantizar la calidad, se usó únicamente material cuya licencia permite uso comercial y se eliminó de los datos de entrenamiento todo texto que aparece en los benchmarks reportados. El procedimiento combinó aprendizaje contrastivo in-batch y una fusión ponderada de tres adaptadores entrenados, almacenada como un único adaptador de rango 32. El adaptador no contiene texto de entrenamiento. Como mecanismo técnico destacable, incorpora late chunking: el documento completo se lee en una sola pasada y el vector de cada fragmento conserva el contexto circundante, con ventana y solapamiento configurables por llamada.

## Capacidades

- Generación de embeddings de texto en inglés para búsqueda semántica y recuperación de pasajes (query a passage).
- Recuperación de documentos largos mediante late chunking, con lectura de hasta 2.048 tokens en una pasada.
- Vectores truncables a 512, 256 o 128 dimensiones (Matryoshka), todos de longitud unitaria.
- Codificación asimétrica con prefijos diferenciados para consultas y pasajes.
- Ventana de late chunking y solapamiento configurables por llamada.
- Ejecución en CPU o GPU con un archivo de 61 MB sobre el modelo base compartido.
- No soporta tool calling ni function calling (no es un modelo generativo).
- No soporta agentes ni razonamiento multi-paso (es un modelo de representación).
- No soporta visión, audio ni modo thinking.
- Multilingüismo: no disponible; solo inglés.

## Casos de uso

- Búsqueda semántica en documentación técnica: el adaptador convierte consultas y fragmentos de documentación en vectores de 1.024 dimensiones que se indexan en una base vectorial; la recuperación por similitud de coseno (producto escalar, al ser vectores unitarios) permite encontrar pasajes relevantes aunque no compartan palabras clave con la consulta.
- Recuperación para RAG en inglés: se usa como recuperador en la primera etapa de un pipeline RAG, codificando la pregunta del usuario con el prefijo `query: ` y los pasajes del corpus con `passage: `, y alimentando los fragmentos recuperados al modelo generativo.
- Procesamiento de artículos científicos y texto con fórmulas: el entrenamiento incluyó pares título-abstract y afirmación-evidencia de texto científico, por lo que es adecuado para indexar y recuperar literatura técnica con notación matemática.
- Búsqueda sobre documentos largos: con late chunking, un documento completo de hasta 2.048 tokens se procesa en una pasada y cada fragmento conserva el contexto de sus vecinos, lo que mejora la recuperación frente a fragmentar sin contexto; los resultados reportados en la tarea needle se mantienen entre 0,76 y 0,92 de precisión desde 256 hasta 32.768 tokens.
- Despliegue autoalojado con requisitos de privacidad: al ser un archivo de 61 MB sobre una base compartida y ejecutarse en CPU o GPU, permite montar un recuperador interno sin que el texto salga de la infraestructura propia.
- Indexación con presupuesto de almacenamiento ajustado: gracias a Matryoshka, se pueden almacenar vectores de 128 o 256 dimensiones en lugar de 1.024, reduciendo el espacio del índice vectorial a costa de cierta pérdida de precisión (el impacto exacto por dimensión no está disponible).
- Filtrado de candidatos en pipelines de FAQ: los pares de FAQ formaron parte del entrenamiento, de modo que el adaptador puede emparejar preguntas de usuario con respuestas canónicas en bases de conocimiento de soporte.

## Benchmarks y rendimiento

Resultados reportados en la model card (nDCG@10 en tareas públicas de recuperación en inglés):

| Tarea | nDCG@10 |
|---|---|
| Quora | 0,946 |
| HotpotQA | 0,863 |
| FiQA | 0,387 |
| SciFact | 0,661 |
| Media en diez tareas | 0,610 |
| Documento largo, un vector por documento | 0,494 |

Comparativa en la media de diez tareas y en documento largo:

| Modelo | Media 10 tareas | Documento largo |
|---|---|---|
| Thelivu-750M-Embedding | 0,610 | 0,494 |
| all-MiniLM-L6 | 0,589 | 0,355 |
| sentence-t5-large | 0,542 | no disponible |
| bge-base | no disponible | 0,421 |
| e5-base | no disponible | 0,462 |
| Arctic-Embed-M | no disponible | 0,472 |

En la tarea needle con late chunking, el modelo mantiene una precisión de 0,76 a 0,92 en todas las longitudes entre 256 y 32.768 tokens, el mejor resultado de late chunking entre los modelos probados según la model card. El modelo base sin adaptador obtiene aproximadamente 0,04 nDCG@10 en retrieval. No se han publicado en la información disponible resultados de MMLU, HumanEval ni GSM8K, que no aplican a un modelo de embeddings.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el adaptador pesa 61 MB y el codificador del modelo base tiene 358M parámetros, por lo que la huella en memoria es la del codificador más el adaptador.
- GPU recomendadas: no disponible; el modelo declara ejecución en CPU o GPU sin especificar modelos concretos.
- GPU de consumo: no disponible la lista concreta; por el tamaño del codificador (358M parámetros) es plausible que quepa en GPU de consumo, pero la información proporcionada no lo confirma.
- Opciones de despliegue: el adaptador usa formato Thelivu (`adapter.safetensors` con `adapter_config.json`), no PEFT; la carga se realiza con el código del repositorio de GitHub (`adapter/embedding_adapter`), que verifica una huella de los pesos base y rechaza cargar sobre cualquier base distinta de Thelivu-750M. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media 10 tareas (nDCG@10) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Thelivu-750M-Embedding | 15,14M en adaptador; 358M en codificador base | 512 tokens (2.048 con late chunking) | 0,610 | Apache 2.0 (adaptador) | Hugging Face, requiere modelo base |
| all-MiniLM-L6 | no disponible | no disponible | 0,589 | no disponible | Hugging Face |
| sentence-t5-large | no disponible | no disponible | 0,542 | no disponible | Hugging Face |
| bge-base | no disponible | 512 tokens o menos | no disponible (0,421 en documento largo) | no disponible | Hugging Face |
| e5-base | no disponible | 512 tokens o menos | no disponible (0,462 en documento largo) | no disponible | Hugging Face |

La model card advierte que, si el objetivo es únicamente la máxima puntuación en recuperación de texto corto en inglés, modelos compactos gratuitos como bge-base y e5-base obtienen puntuaciones superiores en el benchmark presentado, por lo que conviene compararlos para ese caso concreto.

## Limitaciones y advertencias

- Solo admite inglés; el resto de idiomas queda fuera del alcance declarado.
- No está diseñado para similitud de frases ni para puntuación de paráfrasis: está construido para emparejamiento pregunta-pasaje.
- En recuperación de texto corto en inglés, bge-base y e5-base superan su puntuación en el benchmark reportado; no es la mejor opción si ese es el único criterio.
- El adaptador no es un modelo completo: requiere Thelivu-750M y rechaza cargarse sobre cualquier otra base mediante la verificación de huella de los pesos.
- El formato es propio de Thelivu, no PEFT, lo que limita la compatibilidad con herramientas estándar del ecosistema.
- La licencia Apache 2.0 cubre el adaptador, pero el modelo base tiene su propia licencia que debe verificarse antes de uso comercial.
- Riesgo de alucinación: no aplica en el sentido generativo, pero la recuperación puede devolver pasajes poco relevantes en dominios alejados de los datos de entrenamiento (FAQ, ciencia, enciclopedia, pregunta-respuesta).
- No se han publicado datos de sesgos, cuantización, latencia ni throughput en la información disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thelivu/Thelivu-750M-Embedding
- Modelo base: https://huggingface.co/Thelivu/Thelivu-750M
- Informe técnico: https://saravanan-a-r.github.io/Thelivu/
- Repositorio GitHub: https://github.com/saravanan-a-r/Thelivu
- Licencia: https://huggingface.co/Thelivu/Thelivu-750M-Embedding/blob/main/LICENSE
- Perfil del autor: https://www.linkedin.com/in/saravanan-a-r/
