# ThakiCloud/Thaki-SecEmbed-8B-Preview

## Resumen

Thaki-SecEmbed-8B-Preview es un adaptador LoRA experimental de embeddings especializado en la recuperacion de documentacion de tecnicas de MITRE ATT&CK a partir de consultas de analistas de seguridad. Lo desarrolla ThakiCloud sobre el modelo base Qwen/Qwen3-Embedding-8B (revision fijada `1d8ad4ca9b3dd8059ad90a75d4983776a23d44af`), y se publica como adaptador PEFT, no como pesos fusionados.

El problema que aborda es el mapeo de TTP (tacticas, tecnicas y procedimientos): dada una consulta en lenguaje de analista (pregunta, afirmacion, palabras clave, hipotesis de TTP), el modelo debe recuperar el documento de la tecnica o subtecnica ATT&CK correspondiente. El corpus de recuperacion son todas las tecnicas y subtecnicas vivas de ATT&CK, renderizadas a un documento cada una mediante un renderizador fijo.

Se trata de una version Preview con alcance deliberadamente acotado: solo se evalua la recuperacion de documentacion ATT&CK en ingles y coreano, con dimension de embedding de 4096. El propio autor advierte que no hay una diferencia estadisticamente clara frente al Qwen3-Embedding-8B original en la evaluacion preregistrada, y que en recuperacion general se observa una degradacion medible en FiQA-2018, por lo que recomienda usar el modelo base para tareas de recuperacion de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3-Embedding-8B) con adaptador LoRA (r=16, alpha=32) sobre q, k, v, o, gate, up, down |
| Parametros totales | 8B (modelo base); el adaptador LoRA es de ~0,2 GB de repositorio |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el ejemplo de uso emplea 512 tokens para consultas y 2048 para documentos |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye para cargarse junto al base en bfloat16) |
| Idiomas soportados | ingles, coreano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA; no se publican pesos fusionados en esta Preview) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-Embedding-8B, un transformer encoder de 8.000 millones de parametros, al que se anade un adaptador LoRA de bajo rango (r=16, alpha=32) que modifica las proyecciones q, k, v, o, gate, up y down. La dimension de embedding principal es 4096 y el pooling es de ultimo token con padding a la izquierda, seguido de normalizacion L2, igual que en el modelo base. La instruccion se aplica unicamente al lado de la consulta, mientras que los documentos se codifican como texto sin instruccion; el formato de consulta es `Instruct: {instruction}\nQuery: {query}`.

El entrenamiento usa exclusivamente datos publicos derivados de MITRE ATT&CK STIX (Enterprise ATT&CK v19.2, `enterprise-attack.json` del repositorio mitre/cti). El corpus de recuperacion esta formado por cada tecnica y subtecnica viva de ATT&CK, renderizada a un documento mediante un renderizador fijo que se usa tambien para los positivos de entrenamiento, de modo que el formato del documento no puede revelar la respuesta. Las consultas fueron generadas por un LLM profesor a partir de datos publicos. No se emplearon datos internos ni de clientes. Esta Preview no entrena con objetivo Matryoshka (MRL), por lo que las dimensiones truncadas no estan optimizadas.

## Capacidades

- Generacion de embeddings de texto de 4096 dimensiones para recuperacion (feature-extraction).
- Recuperacion de documentacion de tecnicas y subtecnicas MITRE ATT&CK a partir de consultas de analista.
- Acepta distintos estilos de consulta: preguntas, afirmaciones, palabras clave, peticiones de evidencia, busquedas de analista e hipotesis de TTP.
- Soporte bilingue limitado a ingles y coreano.
- Uso como recuperador de primera etapa (candidate retrieval) delante de un reranker para mapeo de TTP.
- Ejecucion como adaptador LoRA sobre el modelo base mediante PEFT, manteniendo el pooling de ultimo token y la normalizacion L2 del base.
- No es un modelo generativo: no produce texto, tool calling, agentes ni razonamiento multi-paso. Sus capacidades se limitan a la representacion y recuperacion de textos.

## Casos de uso

- Mapeo de TTP en analisis de ciberamenazas: dado un extracto de informe o una descripcion de comportamiento, el modelo recupera las tecnicas ATT&CK candidatas para su revision humana y posterior mapeo.
- Busqueda de analista sobre ATT&CK: un analista formula una consulta en lenguaje natural (en ingles o coreano) y obtiene los documentos de tecnica mas relevantes del corpus ATT&CK.
- Recuperador de primera etapa en pipelines de reranking: por su salida de embeddings, encaja como primer recuperador que alimenta un reranker o un clasificador posterior en un sistema de atribucion de TTP.
- Enriquecimiento de alertas SOC: al recibir una descripcion de evidencia, el modelo sugiere la tecnica ATT&CK asociada para etiquetar casos, siempre con supervision humana.
- Construccion de indices de recuperacion sobre documentacion ATT&CK: permite indexar el corpus de tecnicas y ofrecer busqueda semantica interna en herramientas de seguridad.
- Investigacion sobre embeddings especializados por dominio: sirve como caso de estudio reproducible (adaptador publico, evaluacion preregistrada) para estudiar el efecto de la especializacion LoRA en dominios tecnicos.
- Soporte bilingue en equipos coreanos: al cubrir ingles y coreano, permite que analistas coreanoparlantes consulten el corpus ATT&CK (documentado en ingles) en su idioma.

## Benchmarks y rendimiento

Evaluacion preregistrada sobre un conjunto retenido de 583 consultas (nDCG@10). El autor indica que no hay diferencia estadisticamente clara frente al modelo base (los intervalos de confianza incluyen el cero). La tabla muestra nDCG@10 tras truncado de dimension y re-normalizacion L2 (las dimensiones truncadas son solo diagnostico, no Matryoshka):

| Dim | Stock Qwen3-Embedding-8B | Thaki-SecEmbed-8B | Delta [IC 95%] |
|---|---|---|---|
| 4096 | 0,670 | 0,686 | +0,016 [-0,011, +0,043] |
| 1024 | 0,662 | 0,678 | +0,016 [-0,011, +0,042] |
| 512 | 0,658 | 0,670 | +0,012 [-0,015, +0,039] |
| 256 | 0,613 | 0,626 | +0,013 [-0,017, +0,040] |

En recuperacion general, el autor reporta que no hay regresion catastrofica frente al base bajo el umbral preregistrado del 10% en cuatro conjuntos publicos, pero si una degradacion significativa en FiQA-2018 (recuperacion financiera). No se han publicado en la informacion disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros), que ademas no aplican a un modelo de embeddings.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion a partir del tamano de 8B, no aportada por el autor): ~16 GB en bfloat16/fp16 para los pesos, mas memoria para activaciones; ~8-10 GB en int8 y ~5-6 GB en int4.
- GPU recomendadas: A100, H100, L40S o similares para despliegue en bfloat16 con alto throughput; en consumer, RTX 4090 (24 GB) y RTX 3090 (24 GB) pueden ejecutar el modelo en bfloat16.
- En consumer GPU: cabe en tarjetas de 24 GB en bfloat16 y en tarjetas de 12-16 GB mediante cuantizacion.
- Opciones de despliegue: requiere cargar el modelo base Qwen/Qwen3-Embedding-8B junto con el adaptador LoRA mediante PEFT y transformers; tambien puede servirse con vLLM o Text Embeddings Inference (TEI) en modo embeddings, siempre aplicando el adaptador. No se publican pesos GGUF ni fusionados, por lo que no hay ruta directa via llama.cpp/Ollama en esta Preview.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension de embedding | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Thaki-SecEmbed-8B-Preview | 8B (base) + LoRA r=16 | 4096 | en, ko | Apache 2.0 | Especializado en recuperacion ATT&CK; evaluacion preregistrada; sin mejora estadisticamente clara frente al base |
| Qwen/Qwen3-Embedding-8B | 8B | 4096 (con soporte MRL en el base) | multilingue | Apache 2.0 | Modelo base; recomendado por el autor para recuperacion de proposito general |
| Otros modelos de embeddings de dominio de seguridad | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Version Preview experimental: el propio autor advierte que solo se evalua una tarea (recuperacion de documentacion ATT&CK) y que no debe interpretarse como rendimiento general en seguridad ni en dominio general.
- Sin diferencia estadisticamente clara frente al Qwen3-Embedding-8B original en la evaluacion preregistrada (los intervalos de confianza incluyen el cero).
- Degradacion significativa observada en recuperacion financiera (FiQA-2018); el autor recomienda el modelo base para recuperacion general.
- Fuera de alcance: recuperacion sobre otros corpus de seguridad (informes CTI, logs/telemetria, reglas de deteccion, bases de vulnerabilidades), que no fueron evaluados.
- Solo soporta ingles y coreano; otros idiomas no estan contemplados.
- No esta entrenado con objetivo Matryoshka (MRL): las dimensiones truncadas no estan optimizadas y no deben usarse con esa expectativa.
- No debe emplearse para deteccion, atribucion o respuesta automatizadas sin revision humana.
- Es un modelo de embeddings, no generativo: no realiza tool calling, agentes ni generacion de texto.
- Aunque el adaptador se publica bajo Apache 2.0, el uso del corpus derivado de MITRE ATT&CK esta sujeto a las condiciones de uso de ATT&CK (ATT&CK Terms of Use).
- Distribucion como adaptador PEFT: requiere cargar el modelo base en la revision fijada; el `base_model_name_or_path` del `adapter_config.json` corresponde a una ruta local de entrenamiento y no debe usarse literalmente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ThakiCloud/Thaki-SecEmbed-8B-Preview
- Tarjeta en coreano: https://huggingface.co/ThakiCloud/Thaki-SecEmbed-8B-Preview/blob/main/MODEL_CARD.ko.md
- Modelo base Qwen3-Embedding-8B: https://huggingface.co/Qwen/Qwen3-Embedding-8B
- Repositorio MITRE CTI (datos de entrenamiento): https://github.com/mitre/cti
- Terminos de uso de MITRE ATT&CK: https://attack.mitre.org/resources/legal-and-branding/terms-of-use/
