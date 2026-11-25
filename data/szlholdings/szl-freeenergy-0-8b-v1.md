# SZLHOLDINGS/SZL-FreeEnergy-0.8B-v1

## Resumen

SZL-FreeEnergy-0.8B-v1 es un modelo de generacion de texto de 873 millones de parametros publicado por SZLHOLDINGS, un consorcio que agrupa sus artefactos bajo lo que denomina "governed-AI estate": un catalogo de modelos, datasets y Spaces con trazabilidad documental mediante ficheros de recibos (receipts) y auditorias fechadas. El modelo se presenta como un artefacto de tipo "model" entrenado dentro de esa factoria gobernada y deriva del checkpoint SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3, que a su vez se apoya en la arquitectura qwen3_5 segun la etiqueta de Hugging Face.

La relevancia del modelo no reside en sus capacidades declaradas, sino en su enfoque de publicacion: la model card evita explicitamente afirmar cualquier metrica de rendimiento que no haya sido medida en una auditoria fechada, y etiqueta los datos como MEASURED, REPORTED o UNKNOWN. En el momento de la ultima revision, el escaneo estricto de recibos (receipts-tranche-5, 22 de noviembre de 2026) clasifica el repositorio como RECEIPT_FILES_NO_DONE: existen ficheros con nombre de recibo, pero no un DONE.json estricto con estado MEASURED y eval_rc=0, por lo que la evidencia de evaluacion se marca como UNKNOWN.

El modelo esta publicado con licencia Apache 2.0, formato safetensors, un unico idioma declarado (ingles) y un tamano de repositorio de 1,8 GB. Con 729 descargas y ningun "like" en el momento de la consulta, se trata de un artefacto de nicho dentro de un ecosistema corporativo cerrado, sin benchmarks publicos verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (segun tag de Hugging Face); detalles internos no disponibles |
| Parametros totales | 873.438.784 (dato real de safetensors) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3 |
| Tamano del repositorio | 1,8 GB |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo pertenece a la familia arquitectonica qwen3_5, segun la etiqueta declarada en el repositorio, y que deriva de un checkpoint previo afinado (szl-receiptagent-qwen35-0.8b-sft-v3). No se especifica en la model card el numero de capas, la dimension oculta, el mecanismo de atencion, la ventana de contexto nativa ni la composicion del dataset de entrenamiento. Tampoco se documenta si hubo fases de RLHF, DPO o ajuste supervisado mas alla de lo que sugiere el sufijo "sft" del modelo base.

El aspecto tecnico diferencial no es arquitectonico sino de gobernanza: el autor declara que las afirmaciones sobre entrenamiento y evaluacion viven en ficheros de recibos del "estate mesh" y que cualquier dato no receiptado se considera UNKNOWN. Los graficos de la model card se generan de forma determinista con Python de la biblioteca estandar a partir de una instantanea de auditoria fechada (2026-11-20T03:48:04Z). El escaneo estricto posterior (2026-11-22) no encontro un DONE.json que cumpla el umbral estricto (status=MEASURED, eval_rc=0, timestamp y recibo de entrenamiento), por lo que no hay evidencia de evaluacion validada.

## Capacidades

- Generacion de texto en ingles: es la unica capacidad declarada de forma implicita por el pipeline text-generation.
- Conversacion y respuesta a instrucciones: el modelo base es un checkpoint SFT, lo que sugiere ajuste a formato instruct, aunque no se detalla el esquema de prompt.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Razonamiento multi-paso y agentes: no disponible; el nombre del modelo base ("receiptagent") sugiere un origen orientado a agentes de recibos, pero no hay especificacion publica.
- Capacidades multilingues: limitadas al ingles segun el campo de idiomas.
- Capacidades especiales (thinking mode, vision, audio): no disponible; no se declaran.
- Trazabilidad documental: el autor enfatiza que cualquier capacidad no medida se marca como UNKNOWN, lo que en la practica implica ausencia de garantias funcionales publicas.

## Casos de uso

- Prototipado de agentes documentales en ingles: dado su origen en un checkpoint "receiptagent", puede emplearse como base para experimentar con extraccion y verificacion de recibos o documentos estructurados, siempre que se valide el comportamiento con un conjunto de evaluacion propio, ya que el autor no publica curvas medidas.
- Generacion de texto ligera en entornos con recursos limitados: con 873 millones de parametros y pesos safetensors de 1,8 GB, es viable en GPU de consumo para tareas de generacion de borradores o resumenes en ingles.
- Fine-tuning especifico sobre dominios de auditoria o contabilidad: su licencia Apache 2.0 permite reentrenamiento y redistribucion, lo que facilita adaptarlo a flujos internos de verificacion documental.
- Base para pipelines de investigacion sobre gobernanza de modelos: util como ejemplo de publicacion con recibos y etiquetado MEASURED/UNKNOWN para estudiar practicas de trazabilidad en IA abierta.
- Generacion de respuestas en ingles para asistentes internos de baja latencia: al ser un modelo pequeno, puede desplegarse en CPU o GPU modesta para tareas de clasificacion y generacion acotada.
- Evaluacion comparativa de tecnicas de cuantizacion: al publicarse solo en safetensors, sirve como punto de partida para generar versiones GGUF y medir degradacion, aunque el autor no aporta datos de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo estricto de recibos del 22 de noviembre de 2026 clasifica la evidencia de evaluacion como UNKNOWN (sin DONE.json estricto).

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,7-1,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 3-4 GB en GPU.
- VRAM estimada en cuantizacion de 8 bits: en torno a 1 GB para pesos; en 4 bits, alrededor de 0,5 GB, aunque el autor no publica variantes cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (RTX 3050, RTX 4060, T4); para mayor throughput, A10G, L4 o A100.
- Cabe en GPU de consumo: si, en modelos como RTX 3060, RTX 4060, RTX 4090 y equivalentes; tambien es viable en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: transformers (libreria declarada); vLLM, llama.cpp, Ollama o TGI requeririan conversion o soporte de la arquitectura qwen3_5, que no se documenta en la ficha.
- Latencia y throughput estimados: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Benchmarks publicos |
|---|---|---|---|---|---|
| SZL-FreeEnergy-0.8B-v1 | 873 M | no disponible | Apache 2.0 | en | no disponibles |
| Qwen2.5-0.5B / 1.5B | 0,5-1,5 B | 32 K (familia Qwen2.5) | Apache 2.0 | multilingue | publicados por el autor |
| Llama 3.2 1B | 1,2 B | 128 K | Llama 3.2 Community License | multilingue | publicados por el autor |
| SmolLM2-1.7B | 1,7 B | 8 K | Apache 2.0 | en | publicados por el autor |

La comparativa se limita a parametros y licencia porque SZL-FreeEnergy no publica contexto, benchmarks ni idiomas mas alla del ingles. Frente a las alternativas citadas, su principal diferencia es la ausencia de evidencia medida y la dependencia de un ecosistema corporativo concreto.

## Limitaciones y advertencias

- Ausencia de evidencia de evaluacion: el escaneo estricto de recibos clasifica el repositorio como RECEIPT_FILES_NO_DONE y la evidencia de evaluacion como UNKNOWN; no hay garantia publicada de calidad.
- Sesgos conocidos: no documentados; al entrenarse presumiblemente en ingles, es esperable un sesgo linguistico y cultural hacia ese idioma, aunque el autor no lo explicita.
- Riesgo de alucinacion: no cuantificado; al no haber benchmarks ni evaluaciones publicadas, no puede estimarse su tasa de confabulacion, pese a que el repositorio incluye un fichero de "fleet-confabulation-sweep" no validado como evidencia.
- Limitaciones de contexto e idioma: solo se declara ingles y no se especifica la ventana de contexto, lo que impide planificar su uso en tareas de contexto largo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion; no se identifican clausulas adicionales, pero conviene revisar los terminos del modelo base.
- Caveat de produccion: la model card esta generada por una herramienta interna ("estate-cards weaver") y contiene enlaces a recursos del ecosistema SZL; la ausencia de DONE.json estricto implica que cualquier despliegue en produccion deberia acompanarse de una evaluacion propia.
- Madurez: 729 descargas y cero "like" en el momento de la consulta; no hay comunidad ni issues documentados que permitan contrastar comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/SZL-FreeEnergy-0.8B-v1
- Modelo base: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (referenciada en la model card): https://github.com/szl-holdings
- Herramienta de generacion de cards: https://github.com/szl-holdings/estate-cards
