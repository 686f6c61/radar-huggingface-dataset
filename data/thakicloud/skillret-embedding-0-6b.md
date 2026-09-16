# ThakiCloud/SKILLRET-Embedding-0.6B

## Resumen

SkillRet-Embedding-0.6B (identificador `ThakiCloud/SKILLRET-Embedding-0.6B`) es un modelo de embeddings de frases desarrollado por ThakiCloud, obtenido mediante ajuste fino supervisado del modelo `Qwen/Qwen3-Embedding-0.6B`. Su tarea concreta es la recuperación de habilidades (skill retrieval) para agentes basados en LLM: dada una petición en lenguaje natural, el modelo devuelve las skills más relevantes de una biblioteca que, en el benchmark de referencia, contiene 6.660 skills en test y 10.123 en entrenamiento.

El modelo tiene 595.776.512 parámetros (~0.6B), se distribuye con licencia Apache 2.0, pesos en safetensors y un repositorio de 1,2 GB, y declara soporte únicamente para inglés. Se entrenó sobre el split de entrenamiento del benchmark SkillRet (127.190 pares consulta–skill, derivados de 63.259 consultas) con aprendizaje contrastivo, y se publica junto al informe técnico arXiv:2605.05726.

Su relevancia actual es operativa: a medida que los agentes pasan de un puñado de herramientas a catálogos con miles de skills, seleccionar cuál invocar se convierte en un cuello de botella. Este modelo aborda esa fase de enrutado con un encoder de 0.6B parámetros, lo que permite desplegarlo en hardware modesto y reutilizarlo como primera etapa de recuperación antes de invocar a un LLM mayor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, heredada del modelo base Qwen/Qwen3-Embedding-0.6B (la model card no detalla la configuración interna) |
| Parametros totales | 595.776.512 (~0.6B), dato real de safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens de longitud máxima de secuencia en entrenamiento; contexto de inferencia heredado del modelo base: no disponible |
| Tipos de cuantizacion | No disponible en la model card; se mencionan variantes cuantizadas en el articulo arXiv:2609.16391, sin especificar formatos |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 1,2 GB); compatible con sentence-transformers y Text Embeddings Inference |
| Modelo base | Qwen/Qwen3-Embedding-0.6B (relacion: finetune) |
| Pipeline | sentence-similarity |
| Biblioteca | sentence-transformers |
| Dataset de entrenamiento | ThakiCloud/SKILLRET (split de entrenamiento del benchmark SkillRet) |
| Publicacion | Creado el 2026-05-06; actualizado el 2026-09-16; 1.498 descargas y 9 likes en el momento de la consulta |

## Arquitectura y entrenamiento

El modelo es un encoder de texto tipo transformer denso que hereda la arquitectura de Qwen3-Embedding-0.6B y se reentrena como recuperador denso (dual encoder): las consultas y las skills se codifican en el mismo espacio vectorial y la similitud se calcula mediante producto escalar sobre embeddings normalizados. El ajuste fino se realizó con MultipleNegativesRankingLoss (InfoNCE) y compartición de negativos entre GPUs, sobre el split de entrenamiento del benchmark SkillRet: 127.190 pares consulta–skill procedentes de 63.259 consultas y 10.123 skills, con una longitud máxima de secuencia de 8.192 tokens.

La configuración de entrenamiento fue de 4× NVIDIA B200 en DDP con precisión BF16, batch efectivo de 384 (96 por dispositivo × 4 GPUs), learning rate 2e-5 y una única época, con un tiempo total de aproximadamente 6 horas. El checkpoint seleccionado es el del paso 150 (0,45 épocas), que alcanzó un NDCG@15 de 0,7887 en validación. El modelo se distribuye acompañado de dos artículos: el informe del benchmark (arXiv:2605.05726) y un estudio de cuantización post-entrenamiento en familias de embedders (arXiv:2609.16391), que documenta las mediciones de las variantes cuantizadas.

Registro de entrenamiento publicado por el autor:

| Epoca | Paso | Perdida de entrenamiento | NDCG@15 |
|---|---|---|---|
| 0,15 | 50 | 2,4288 | 0,7802 |
| 0,30 | 100 | 1,9920 | 0,7842 |
| 0,45 | 150 | 1,9758 | 0,7887 |
| 0,60 | 200 | 1,9011 | 0,7865 |
| 0,76 | 250 | 1,9100 | 0,7874 |
| 0,91 | 300 | 1,9412 | 0,7859 |
| 1,00 | 331 | — | 0,7862 |

Versiones de framework declaradas: Python 3.10.12, Sentence Transformers 5.4.1, Transformers 5.5.4, PyTorch 2.7.1+cu128.

## Capacidades

- Generacion de embeddings de frases y documentos para similitud semantica (pipeline `sentence-similarity`).
- Recuperacion de skills de agente a partir de una peticion en lenguaje natural, sobre bibliotecas de miles de entradas.
- Recuperacion densa consulta–documento en ingles, con soporte de prefijo de instruccion (`Instruct: Given a skill search query, retrieve relevant skills that match the query\nQuery: `).
- Embeddings normalizados (`normalize_embeddings=True`), aptos para similitud coseno y busqueda por producto escalar.
- Procesamiento de secuencias de hasta 8.192 tokens, lo que permite indexar descripciones de skills largas.
- Integracion con la libreria sentence-transformers y con Text Embeddings Inference (etiquetas `text-embeddings-inference` y `endpoints_compatible`).
- No es un modelo generativo: no produce texto, no ejecuta skills y no soporta tool calling ni razonamiento multi-paso por si mismo. La model card lo indica explicitamente: "The model retrieves skills but does not execute them".

## Casos de uso

- Enrutado de skills en agentes LLM: dado un mensaje de usuario, se codifica la consulta y se recuperan por similitud las skills mas adecuadas de un catalogo de miles de entradas antes de que el agente decida cual invocar. El modelo esta entrenado especificamente para esta tarea con 127.190 pares consulta–skill.
- Recuperacion de herramientas (tool retrieval) en asistentes de codigo: indexar las funciones, APIs internas o plugins disponibles y seleccionar las candidatas relevantes para cada peticion, reduciendo el numero de herramientas que se inyectan en el prompt del LLM.
- Primera etapa de un pipeline de recuperacion en dos fases: usar este encoder de 0.6B para recuperar un conjunto amplio de candidatas (por ejemplo, top-15 con Recall@15 de 0,8809) y aplicar despues un reranker o un LLM para el refinado.
- Enrutado de tickets de soporte a procedimientos internos: indexar runbooks y procedimientos operativos con el mismo formato de descripcion que las skills y asignar cada incidencia al procedimiento correspondiente.
- Busqueda semantica sobre documentacion tecnica estructurada (por ejemplo, entradas de tipo `nombre-skill | descripcion`), aprovechando la ventana de 8.192 tokens para descripciones extensas.
- Evaluacion y reproduccion de investigacion en recuperacion de skills: el modelo es la propuesta de referencia del benchmark SkillRet, de modo que sirve como linea base reproducible sobre el split de test (4.997 consultas y 6.660 skills).
- Pre-filtrado en sistemas multi-agente con presupuesto de contexto limitado: al reducir el catalogo de skills a un subconjunto pequeno, se disminuye el numero de tokens consumidos por el prompt del agente planificador.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el split de test del benchmark SkillRet (4.997 consultas, 6.660 skills). No es un modelo generativo, por lo que no se reportan MMLU, HumanEval ni GSM8K.

| Metrica | @5 | @10 | @15 |
|---|---|---|---|
| NDCG | 0,7557 | 0,7803 | 0,7887 |
| Recall | 0,7915 | 0,8542 | 0,8809 |
| Completeness | 0,6596 | 0,7509 | 0,7903 |

No se han publicado en la informacion disponible resultados comparativos de este modelo frente al modelo base ni frente a otros embedders en el mismo benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion a partir de 595.776.512 parametros, no publicada por el autor): ~1,2 GB en BF16/FP16, ~2,4 GB en FP32, ~0,6 GB en INT8 y ~0,3 GB en INT4, sin contar activaciones para secuencias de hasta 8.192 tokens.
- Cabe en practicamente cualquier GPU de consumo: RTX 3060 12 GB, RTX 4060, RTX 4090, asi como en iGPU con memoria compartida suficiente. El repositorio completo ocupa 1,2 GB en disco.
- GPU de datacenter (A100, H100, B200) no son necesarias para inferencia; el autor las empleo (4× B200) unicamente para el entrenamiento en DDP con batch efectivo de 384.
- Despliegue: sentence-transformers (ruta oficial del autor, con `trust_remote_code=True`), Text Embeddings Inference y Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`). Compatibilidad con llama.cpp/Ollama no esta confirmada en la informacion disponible, dado que el repositorio no publica pesos GGUF.
- Latencia y throughput: no disponibles. El unico dato temporal publicado es el de entrenamiento (~6 horas en 4× B200, 331 pasos, 1 epoca).

## Comparativa con modelos similares

No se dispone de resultados comparativos publicados en la informacion proporcionada. La tabla recoge unicamente los datos verificables y marca como "no disponible" todo lo que la model card no especifica.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Rendimiento en SkillRet |
|---|---|---|---|---|---|
| SkillRet-Embedding-0.6B | 595.776.512 | 8.192 tokens (longitud maxima de secuencia en entrenamiento) | en | Apache 2.0 | NDCG@15 0,7887; Recall@15 0,8809 (split de test) |
| Qwen/Qwen3-Embedding-0.6B (modelo base) | ~0.6B (segun la model card) | no disponible | no disponible | no disponible | no disponible |
| Otros embedders de ~0.6B (por ejemplo, alternativas multilingues de recuperacion densa) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idioma: el modelo esta optimizado para consultas y skills en ingles; el unico idioma declarado es `en`, por lo que el rendimiento en castellano u otros idiomas no esta garantizado ni medido.
- Dominio: el autor advierte de que el rendimiento puede variar en dominios fuera de la distribucion del benchmark SkillRet.
- Alcance funcional: el modelo recupera skills, pero no las ejecuta; no genera texto ni razona de forma multi-paso.
- Alucinacion: al ser un modelo de recuperacion, no genera afirmaciones, pero puede devolver skills poco relevantes; la metrica Completeness@5 es de 0,6596, lo que indica que en el top-5 faltan componentes relevantes en aproximadamente un tercio de los casos.
- Sesgos: la model card no documenta analisis de sesgos ni composicion demografica del dataset SkillRet.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de los datos de entrenamiento (dataset ThakiCloud/SKILLRET) y del modelo base antes de un despliegue en produccion.
- Cuantizacion: aunque existen mediciones publicadas sobre variantes cuantizadas (arXiv:2609.16391), el repositorio no especifica que formatos cuantizados se han validado ni su perdida de calidad, por lo que cualquier cuantizacion propia deberia reevaluarse sobre el split de test.
- Formato de prompt: el uso correcto depende de anteponer el prefijo de instruccion a las consultas; omitirlo puede degradar la calidad de la recuperacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ThakiCloud/SKILLRET-Embedding-0.6B
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Dataset: https://huggingface.co/datasets/ThakiCloud/SKILLRET
- Informe tecnico del benchmark SkillRet: https://arxiv.org/abs/2605.05726
- Estudio de cuantizacion post-entrenamiento en embedders: https://arxiv.org/abs/2609.16391
- Cita del benchmark: Cho, Hongcheol; Kang, Ryangkyung; Kim, Youngeun. "SkillRet: A Large-Scale Benchmark for Skill Retrieval in LLM Agents", arXiv:2605.05726, 2026.
- Cita del estudio de cuantizacion: Han, Hyojung. "Where Post-Training Quantization Breaks Text Embedders: A Measured Map Across Four Embedder Families", arXiv:2609.16391, 2026.

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con este modelo; los enlaces anteriores proceden exclusivamente de la model card y de los metadatos de HuggingFace.
