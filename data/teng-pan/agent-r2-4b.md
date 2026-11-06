# teng-pan/Agent-R2-4B

## Resumen

Agent-R²-4B es un modelo de lenguaje de 4.411 millones de parametros (4,4B), desarrollado por teng-pan, especializado en tareas de productividad profesional de horizonte largo. Se construye mediante fine-tuning del modelo base Qwen/Qwen3-4B-Thinking-2507, un transformer denso con modo de razonamiento extendido, y se entrena en dos etapas: SFT seguido de RL basado en rubricas (rubric-based RL). Su objetivo no es responder preguntas aisladas, sino producir entregables utilizables (hojas de calculo, presentaciones, documentos, PDFs) a partir de ficheros heterogeneos en un espacio de trabajo.

El modelo aparece en el articulo *Agent-R²: Scaling Agents for Realistic Productivity Work via Real-Source Data Synthesis*, que propone sintetizar datos de entrenamiento a partir de fuentes reales para escalar agentes en flujos de trabajo ocupacionales. Es relevante porque demuestra que un modelo de 4B puede superar a alternativas mucho mayores en benchmarks de tareas profesionales end-to-end: en GDPval obtiene 51.0 frente a los 48.0 de Qwen3-235B-A22B-Thinking-2507, y en OfficeQA alcanza 14.8 frente a 13.8.

La ficha se basa en la model card publicada y en los metadatos de Hugging Face. La informacion sobre composicion del dataset, numero de tokens de entrenamiento y detalles del algoritmo de RL no esta disponible en la documentacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Thinking-2507) |
| Parametros totales | 4.411.424.256 (4,4B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el repo ocupa 8,8 GB, compatible con bfloat16) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Agent-R²-4B es un transformer denso basado en Qwen3-4B-Thinking-2507, el modelo de 4B de la familia Qwen3 con modo de pensamiento extendido. El entrenamiento se realiza en dos etapas: primero un ajuste supervisado (SFT) sobre trayectorias de agente, y despues un refuerzo basado en rubricas (rubric-based RL), en el que la recompensa se define mediante criterios verificables sobre el entregable final en lugar de una unica respuesta de referencia.

La innovacion principal descrita en el articulo es la sintesis de datos a partir de fuentes reales (real-source data synthesis) para escalar el entrenamiento de agentes en flujos de trabajo de productividad. El modelo esta disenado para operar con herramientas de ficheros y para recibir una especificacion explicita y verificable del entregable. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion exacta del dataset ni los hiperparametros del RL.

## Capacidades

- Generacion de texto y razonamiento en modo thinking, heredado de Qwen3-4B-Thinking-2507.
- Ejecucion de flujos de trabajo de agente de horizonte largo con multiples pasos.
- Manipulacion de ficheros heterogeneos: documentos, hojas de calculo, presentaciones y PDFs.
- Produccion de entregables utilizables (por ejemplo, un fichero `.xlsx` con un resumen trimestral) en lugar de respuestas en texto plano.
- Uso de herramientas de ficheros expuestas por el entorno de ejecucion (lectura y escritura en un espacio de trabajo).
- Verificacion del entregable antes de finalizar, segun las instrucciones de sistema recomendadas en la model card.
- Capacidad multilingue limitada al ingles segun los metadatos del modelo.

## Casos de uso

- Elaboracion de informes financieros: el modelo puede leer varios ficheros de un directorio de trabajo y generar una hoja de calculo consolidada, verificando el resultado contra la especificacion del entregable.
- Preparacion de presentaciones a partir de documentos fuente: dado un conjunto de PDFs y notas, produce una presentacion con la estructura solicitada, apoyandose en su entrenamiento con ficheros ofimaticos heterogeneos.
- Extraccion y consolidacion de datos de PDFs: procesa documentos no estructurados y vuelca los datos en formatos tabulares verificables.
- Automatizacion de tareas administrativas repetitivas: genera borradores de documentos y hojas de calculo a partir de plantillas y datos de entrada, reduciendo el trabajo manual.
- Agente de escritorio o de espacio de trabajo: integrado en un entorno que expone herramientas de ficheros, ejecuta cadenas de acciones multi-paso hasta completar un entregable concreto.
- Evaluacion de tareas ocupacionales: sirve como referencia ligera para reproducir resultados de GDPval y OfficeQA en entornos con recursos limitados, al superar en estos benchmarks a modelos mucho mayores.
- Prototipado de pipelines de agentes en local: al ser un modelo de 4,4B, permite iterar sobre disenos de agente y especificaciones de entregables sin depender de infraestructura de gran escala.

## Benchmarks y rendimiento

Resultados reportados en la model card y en el articulo (evaluacion end-to-end de tareas ocupacionales realistas):

| Benchmark | Qwen3-4B-Thinking-2507 (base) | Agent-R²-4B | Qwen3-235B-A22B-Thinking-2507 |
|---|---|---|---|
| GDPval | 32.4 | 51.0 | 48.0 |
| OfficeQA | 2.2 | 14.8 | 13.8 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 9 GB solo para los pesos (4,4B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, alrededor de 10-12 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 5-6 GB; en 4 bits: aproximadamente 3-4 GB (estimaciones a partir del numero de parametros; no se han publicado GGUF oficiales).
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en produccion con concurrencia; RTX 4090 (24 GB) para inferencia en bfloat16 sin problemas.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 y, con cuantizacion, en GPUs de 8-12 GB.
- Opciones de despliegue: transformers (soporte nativo, segun la model card), text-generation-inference (etiqueta `text-generation-inference` en Hugging Face y `endpoints_compatible`), vLLM y llama.cpp/Ollama mediante conversion a GGUF (no se han publicado pesos GGUF oficiales).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GDPval | OfficeQA | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Agent-R²-4B | 4,4B | no disponible | 51.0 | 14.8 | Apache 2.0 | Hugging Face |
| Qwen3-4B-Thinking-2507 (base) | 4B | no disponible | 32.4 | 2.2 | Apache 2.0 | Hugging Face |
| Qwen3-235B-A22B-Thinking-2507 | 235B totales (22B activos, MoE) | no disponible | 48.0 | 13.8 | Apache 2.0 | Hugging Face |

Agent-R²-4B supera a su modelo base en ambos benchmarks y tambien al modelo MoE de 235B en las mismas tareas, con un coste de inferencia muy inferior. No se dispone de datos de contexto ni de otros benchmarks para una comparacion mas amplia.

## Limitaciones y advertencias

- Modelo entrenado exclusivamente en ingles segun los metadatos; el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion en la manipulacion de ficheros y en la extraccion de datos de documentos; la model card recomienda instruir al modelo para que fundamente cada afirmacion en los ficheros proporcionados.
- El rendimiento optimo depende de exponer las mismas herramientas de ficheros usadas durante el entrenamiento y de dar una especificacion explicita y verificable del entregable; fuera de ese entorno, el rendimiento puede degradarse.
- No se han publicado detalles sobre sesgos, composicion del dataset ni evaluaciones de seguridad.
- La longitud de contexto no esta documentada; para tareas con muchos ficheros grandes puede ser un factor limitante.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen3-4B-Thinking-2507.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni reportes de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/teng-pan/Agent-R2-4B
- Codigo del proyecto: https://github.com/ZJU-REAL/Agent-R2
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507
