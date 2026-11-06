# vllm-sr/vela3-turbo

## Resumen

vela3-turbo es un modelo de decisión y extracción de 27B desarrollado por vLLM Semantic Router en colaboración con KR Labs, miembro de referencia de la familia Vela 3.0. Se construye sobre vllm-sr/d3-turbo (v1.0, revision `da17b5d0c860f7e5be6e2afebe67228b4bd24d0c`, congelado) al que añade adaptadores LoRA con gating para tareas de extracción de spans. Está diseñado para resolver, en una única llamada `system_one`, tareas de enrutado semántico de LLM, clasificación zero-shot, NER, extracción de relaciones, detección de PII, detección de alucinaciones y señales de seguridad, devolviendo probabilidades y offsets de caracteres sin generar texto libre.

Su relevancia actual radica en el auge de los routers semánticos y los guardrails para sistemas LLM en producción: en lugar de usar un LLM generativo grande para clasificar o extraer información, Vela ofrece respuestas deterministas con probabilidades calibradas. Los adaptadores solo se activan para su tarea concreta, de modo que las decisiones ordinarias son bit a bit idénticas a las del modelo base d3-turbo (561 de 561 idénticas en su verificación interna). Se publica bajo licencia Apache-2.0 con un repositorio de 6,2 GB en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer multimodal) con adaptadores LoRA con gating por tarea sobre base congelada |
| Parametros totales | 26,09B (base con codificador de vision) + 5044 MB de adaptadores y cabeceras |
| Parametros activos | no disponible (no se indica si es MoE; los adaptadores se activan selectivamente por tarea) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | transformers (safetensors), endpoints_compatible, custom_code |

## Arquitectura y entrenamiento

vela3-turbo sigue una arquitectura de base congelada más adaptadores: d3-turbo (26,09B con codificador de vision, multimodal, acepta texto, JSON, imagenes y videos para sus tipos de pregunta propios) responde todas las decisiones ordinarias (choice, yes/no, score) sin modificacion, garantizando reproducibilidad bit a bit. Sobre esta base se montan adaptadores LoRA con gating, uno por tarea: spans (claims no soportados, datos personales, evidencia), entidades, relaciones y senales de router. Cada adaptador se activa unicamente cuando la pregunta corresponde a su tarea.

El entrenamiento reutiliza la receta de vela3-flash portada a d3-turbo: los adaptadores de spans, entidades y router se re-umbralizaron y el de relaciones se reentreno. Las senales de router se entrenaron de forma supervisada sobre datasets publicos usados por Vela 2.0 (AEGIS 2.0, PolyGuardMix y Nemotron-Safety-Guard v3 para seguridad; Global-MMLU para dominio; WildFeedback para feedback; DiffusionDB para modalidad; MASSIVE para intents), y dominio y feedback ademas sobre el train split del router signal suite publico. El resto de datos incluye datasets publicos de NER, relaciones, alucinaciones, evidencia y PII, mas texto web y de documentos etiquetado por un modelo profesor grande. No se entrena con ningun test split ni con items del Decision Index; se advierte de cierto solapamiento entre filas de test del router signal suite y fuentes de entrenamiento publicas.

## Capacidades

- Clasificacion zero-shot por nombres de etiquetas, con probabilidad por opcion (tipos `choice`, `yes/no`, `score`).
- Extraccion de spans exactos con offsets de caracteres: claims no soportados (alucinaciones), datos personales (PII) y evidencia.
- NER zero-shot a partir de nombres de etiquetas.
- Extraccion de relaciones end-to-end y con entidad cabeza dada.
- Senales de router semantico: seguridad de contenido, dominio, feedback, modalidad e intents, para enrutado de LLM.
- Deteccion de alucinaciones sobre respuestas de RAG.
- Multimodal: acepta imagenes y videos para los tipos de pregunta propios de d3-turbo.
- Respuestas estructuradas sin generacion de texto libre, adecuada para pipelines deterministas.
- No se documenta soporte de tool calling ni de agentes multi-paso.

## Casos de uso

- Enrutado semantico de LLM en produccion: clasifica cada peticion de usuario por dominio, intent, modalidad y senal de seguridad en una llamada `system_one`, permitiendo dirigir la consulta al modelo o agente adecuado con latencia baja y sin generacion de texto.
- Guardrails de seguridad: usa las senales entrenadas sobre AEGIS 2.0, PolyGuardMix y Nemotron-Safety-Guard v3 para filtrar contenido inseguro antes de que llegue al LLM principal.
- Deteccion de alucinaciones en RAG: verifica cada frase de una respuesta generada contra el contexto recuperado y marca los claims no soportados con offsets exactos (0,900 de example-F1 en LettuceDetect v2), util para mostrar advertencias al usuario o regenerar respuestas.
- Cumplimiento y proteccion de datos (GDPR): detecta y localiza PII en textos y documentos con offsets de caracteres, facilitando la anonimizacion automatica antes de enviar datos a APIs externas.
- Enriquecimiento de documentos con NER y relaciones zero-shot: extrae entidades y relaciones definiendo las etiquetas en la propia peticion, sin entrenar un modelo por dominio, util en indexacion de corpus empresariales o extraccion de conocimiento.
- Clasificacion zero-shot de tickets y consultas: categoriza peticiones de soporte en taxonomias definidas en tiempo de ejecucion (por ejemplo billing/tech), con probabilidades por opcion para establecer umbrales de escalamiento.
- Verificacion de evidencia: localiza los fragmentos del contexto que sostienen o refutan una afirmacion, util en sistemas de fact-checking y auditoria de respuestas.

## Benchmarks y rendimiento

| Benchmark | vela3-turbo | Comparativa (reportada) |
|---|---|---|
| Clasificacion zero-shot (13 sets, GLiFormer Tab 5) | 81,4 | GPT-5-mini: 79,8; Gemma-4-31B-IT: 79,69 |
| Relaciones end-to-end (GLiFormer Tab 4, avg de 4) | 35,9 | Qwen3.5-9B prompted: 25,7 |
| CoNLL04 con entidad cabeza dada | 51,7 | GLiFormer-base: 8,6 (misma harness) |
| NER zero-shot OOD-7 (CrossNER + MIT) | 64,6 | gliner-multitask-large-v0.5: 62,76 |
| Claims no soportados, example-F1 (LettuceDetect v2, 10.698 respuestas) | 0,900 | LettuceDetect v2 mmBERT-base: 0,869; Vela 2.0 9B: 0,885 |
| Senales de router (24 ficheros, CI pareado 95%) | mejor que Vela 2.0 9B en 20, igual en 4, peor en 0 | — |
| Decisiones ordinarias vs d3-turbo base | 561/561 identicas | — |

No se han publicado resultados de benchmarks tipo MMLU, HumanEval o GSM8K; el modelo no esta orientado a generacion general.

## Requisitos de hardware

- VRAM estimada: no disponible. Con 26,09B de parametros en pesos base mas ~5 GB de adaptadores y cabeceras, en FP16/BF16 se requieren en torno a 52-55 GB, es decir, una GPU de datacenter (A100/H100 80 GB) o multiples GPUs consumer con tensor parallelism; con cuantizacion de 4 bits (si se soporta) cabria en torno a 16-18 GB, teoricamente viable en una RTX 4090 de 24 GB, aunque no hay soporte de cuantizacion documentado.
- GPU recomendadas: no disponible de forma explicita; por tamano, A100 80 GB o H100 son la opcion segura.
- Consumer GPU: no confirmado; solo seria factible con cuantizacion de 4 bits no documentada oficialmente.
- Despliegue: libreria transformers con custom_code; compatible con Inference Endpoints de Hugging Face (endpoints_compatible). No se menciona soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. Al no generar texto y responder con probabilidades y spans, la latencia esperada es la de un forward pass de 27B, inferior a la de un LLM generativo equivalente.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea principal | Rendimiento destacado | Licencia |
|---|---|---|---|---|
| vela3-turbo | 26,09B + adaptadores | Decision, extraccion, router | 81,4 clasificacion zero-shot; 0,900 F1 alucinaciones | Apache-2.0 |
| Vela 2.0 9B | 9B | Decision, extraccion, router | 0,885 F1 alucinaciones; peor que vela3-turbo en 20/24 ficheros de router | no disponible |
| vela3-flash | no disponible | Miembro de la misma familia, receta de origen | no disponible | no disponible |
| gliner-multitask-large-v0.5 | no disponible | NER/clasificacion zero-shot | 62,76 en OOD-7 (frente a 64,6 de vela3-turbo) | no disponible |
| LettuceDetect v2 mmBERT-base | no disponible | Deteccion de alucinaciones | 0,869 example-F1 (frente a 0,900) | no disponible |

## Limitaciones y advertencias

- No genera texto: no sirve como chatbot ni como LLM general; su salida son decisiones, probabilidades y spans.
- Las decisiones ordinarias dependen de d3-turbo v1.0 fijado; el main publico de d3-turbo esta ya en v1.1, por lo que los resultados pueden diferir de versiones mas recientes del base.
- Existe solapamiento parcial entre filas de test del router signal suite y fuentes de entrenamiento publicas; la propia ficha reporta tambien las filas sin ese solapamiento, conviene revisar ambas cifras.
- La longitud de contexto, idiomas soportados y cuantizacion no estan documentados, lo que dificulta planificar despliegues con documentos largos o en castellano.
- No hay datos de sesgo especificos publicados; al entrenar con datasets publicos de seguridad y moderacion, pueden existir sesgos heredados de esos corpus.
- Riesgo de alucinacion bajo en la deteccion de spans, pero los umbrales incluidos ("shipped thresholds") pueden requerir recalibrado para cada dominio de aplicacion.
- Licencia Apache-2.0: sin restricciones de uso comercial relevantes, aunque el uso de custom_code exige confiar en el codigo del repositorio al cargarlo con transformers.

## Enlaces

- Modelo: https://huggingface.co/vllm-sr/vela3-turbo
- Modelo base: https://huggingface.co/vllm-sr/d3-turbo
- Coleccion Vela 3.0: https://huggingface.co/collections/vllm-sr/vela-30-6ad1c430eb1718eb4754edcd
- GLiFormer paper (Tablas 4 y 5, numeros reportados): no disponible (no se incluye enlace en la model card)
