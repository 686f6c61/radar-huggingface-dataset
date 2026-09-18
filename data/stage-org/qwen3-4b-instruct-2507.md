# Stage-org/Qwen3-4B-Instruct-2507

## Resumen

Qwen3-4B-Instruct-2507 es un modelo de lenguaje causal de 4.000 millones de parámetros (3.600 millones sin contar embeddings) publicado por el equipo Qwen de Alibaba. Se trata de la versión actualizada del modo "non-thinking" de Qwen3-4B, orientada a instrucciones directas sin bloques de razonamiento explícito. La ficha que nos ocupa corresponde al repositorio `Stage-org/Qwen3-4B-Instruct-2507`, una réplica subida por un tercero (Stage-org) del modelo oficial `Qwen/Qwen3-4B-Instruct-2507`, con licencia Apache 2.0.

El modelo incorpora mejoras sustanciales frente a la versión anterior en seguimiento de instrucciones, razonamiento lógico, comprensión de texto, matemáticas, ciencia, programación y uso de herramientas. Destaca especialmente por su ventana de contexto nativa de 262.144 tokens, por un salto notable en benchmarks de razonamiento (ZebraLogic pasa de 35,2 a 80,2 puntos y AIME25 de 19,1 a 47,4) y por una mejor alineación con preferencias subjetivas del usuario.

Su relevancia actual radica en que ofrece capacidades cercanas a modelos mucho mayores (compite con Qwen3-30B-A3B Non-Thinking y GPT-4.1-nano en varios benchmarks) en un tamaño que cabe en GPU de consumo con cuantización, lo que lo convierte en una opción práctica para despliegue local, agentes con tool calling y procesamiento de documentos largos. Nota: los resultados de la búsqueda web no aportaron enlaces relevantes sobre el modelo (devolvieron resultados sobre ofertas de prácticas, ajenos al tema).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only) con GQA; 36 capas, 32 cabezas de consulta y 8 cabezas KV |
| Parametros totales | 4.022.468.096 (4,0 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Parametros no-embedding | 3,6 B |
| Longitud de contexto | 262.144 tokens (256K) nativa |
| Tipos de cuantizacion | No especificados en la informacion disponible. El repositorio se distribuye en safetensors; existen cuantizaciones de terceros (GGUF, entre otras) para la familia Qwen3 a traves de llama.cpp, Ollama, LM Studio y MLX-LM |
| Idiomas soportados | Multilingue (la model card menciona ganancias en "multiple languages" y evalua MultiIF, MMLU-ProX, INCLUDE y PolyMATH); la lista completa de idiomas no esta disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 8,1 GB |
| Modo de razonamiento | Solo "non-thinking" (no genera bloques `<think></think>`) |

## Arquitectura y entrenamiento

Se trata de un transformer causal decoder-only de 36 capas con atención por consultas agrupadas (GQA), configurada con 32 cabezas para las consultas y 8 para las claves/valores, lo que reduce de forma notable el coste de memoria de la caché KV en contextos largos. El modelo pasó por fases de preentrenamiento y post-entrenamiento, según la información de la model card. No se detallan en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni los métodos concretos de alineación (RLHF, DPO u otros).

La innovación principal de esta revisión es la eliminación del modo de pensamiento: a diferencia de Qwen3-4B original, este modelo no emite bloques de razonamiento y no requiere el parámetro `enable_thinking=False`. Esto simplifica la integración en producción (menos tokens generados, menor latencia, salida directa) manteniendo o mejorando el rendimiento en tareas de razonamiento. El informe técnico de referencia es el arXiv 2505.09388 (Qwen3 Technical Report). La ventana de contexto nativa de 262.144 tokens está soportada de forma explícita en los comandos de despliegue de vLLM y SGLang.

## Capacidades

- Generacion de texto y conversacion multi-turno, con plantilla de chat integrada en `transformers`.
- Razonamiento logico y matematico (evaluado en AIME25, HMMT25, ZebraLogic).
- Comprension de texto y conocimiento general (MMLU-Pro, MMLU-Redux, GPQA, SuperGPQA).
- Generacion de codigo en multiples lenguajes (MultiPL-E, LiveCodeBench v6, Aider-Polyglot).
- Tool calling y function calling: la model card recomienda Qwen-Agent para aprovechar las plantillas y parsers de llamadas a herramientas.
- Uso agentico con razonamiento multi-paso (evaluado en BFCL-v3 y la familia TAU1/TAU2).
- Capacidades multilingues, con mejora en cobertura de conocimiento de cola larga en varios idiomas.
- Comprension de contexto largo de hasta 256K tokens.
- Generacion creativa y tareas abiertas subjetivas (Creative Writing v3, WritingBench).
- Sin modo de pensamiento: no genera bloques `<think></think>` y no requiere flag adicional para desactivarlo.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con historial muy extenso gracias a sus 262.144 tokens de contexto nativo, manteniendo coherencia en interacciones largas y recuperando informacion de turnos antiguos sin truncado agresivo.
- Procesamiento de documentos largos (contratos, informes tecnicos, expedientes): permite resumir, extraer entidades y responder preguntas sobre documentos de cientos de miles de tokens en una sola pasada, evitando estrategias de chunking con perdida de contexto.
- Asistentes de programacion en produccion: su rendimiento en MultiPL-E (76,8) y LiveCodeBench v6 (35,1) lo hace adecuado para autocompletado, revision de codigo y generacion de tests dentro de pipelines de CI/CD con tool calling.
- Agentes con uso de herramientas: con Qwen-Agent o un runtime compatible con OpenAI, se puede integrar en flujos de reservas, consultas a bases de datos o automatizacion de tareas de back-office (benchmarks TAU1-Retail 48,7 y TAU1-Airline 32,0).
- Despliegue local en equipos de desarrollo: con cuantizacion de 4 bits ocupa aproximadamente 2,5-3 GB, por lo que cabe en portatiles y GPUs de gama media mediante Ollama, LM Studio o llama.cpp, sin coste de API.
- Generacion de contenido y redaccion asistida: sus resultados en Creative Writing v3 (83,5) y WritingBench (83,4) lo hacen util para borradores de marketing, documentacion tecnica y textos abiertos.
- Tutorizacion y resolucion de problemas de matematicas y ciencia: los saltos en AIME25 (47,4), HMMT25 (31,0) y GPQA (62,0) lo sitúan como opcion viable para explicaciones paso a paso de ejercicios.
- Extraccion de informacion estructurada a gran escala: procesamiento por lotes de correos, tickets o formularios con salida en JSON controlada mediante prompts de sistema, aprovechando la licencia Apache 2.0 para uso comercial.
- Traduccion y asistentes multilingues: los resultados en MultiIF (69,0) y MMLU-ProX (61,6) respaldan su uso en aplicaciones con usuarios de varios idiomas, siempre que se validen los idiomas concretos requeridos.

## Benchmarks y rendimiento

Datos publicados en la model card del modelo oficial (comparativa facilitada por el autor):

| Benchmark | GPT-4.1-nano-2025-04-14 | Qwen3-30B-A3B Non-Thinking | Qwen3-4B Non-Thinking | Qwen3-4B-Instruct-2507 |
|---|---|---|---|---|
| MMLU-Pro | 62,8 | 69,1 | 58,0 | **69,6** |
| MMLU-Redux | 80,2 | 84,1 | 77,3 | **84,2** |
| GPQA | 50,3 | 54,8 | 41,7 | **62,0** |
| SuperGPQA | 32,2 | 42,2 | 32,0 | **42,8** |
| AIME25 | 22,7 | 21,6 | 19,1 | **47,4** |
| HMMT25 | 9,7 | 12,0 | 12,1 | **31,0** |
| ZebraLogic | 14,8 | 33,2 | 35,2 | **80,2** |
| LiveBench 20241125 | 41,5 | 59,4 | 48,4 | **63,0** |
| LiveCodeBench v6 (25.02-25.05) | 31,5 | 29,0 | 26,4 | **35,1** |
| MultiPL-E | 76,3 | 74,6 | 66,6 | **76,8** |
| Aider-Polyglot | 9,8 | **24,4** | 13,8 | 12,9 |
| IFEval | 74,5 | **83,7** | 81,2 | 83,4 |
| Arena-Hard v2* | 15,9 | 24,8 | 9,5 | **43,4** |
| Creative Writing v3 | 72,7 | 68,1 | 53,6 | **83,5** |
| WritingBench | 66,9 | 72,2 | 68,5 | **83,4** |
| BFCL-v3 | 53,0 | 58,6 | 57,6 | **61,9** |
| TAU1-Retail | 23,5 | 38,3 | 24,3 | **48,7** |
| TAU1-Airline | 14,0 | 18,0 | 16,0 | **32,0** |
| TAU2-Retail | - | 31,6 | 28,1 | **40,4** |
| TAU2-Airline | - | 18,0 | 12,0 | **24,0** |
| TAU2-Telecom | - | **18,4** | 17,5 | 13,2 |
| MultiIF | 60,7 | **70,8** | 61,3 | 69,0 |
| MMLU-ProX | 56,2 | **65,1** | 49,6 | 61,6 |
| INCLUDE | 58,6 | **67,8** | 53,8 | 60,1 |
| PolyMATH | 15,6 | 23,3 | 16,6 | **31,1** |

\* En Arena-Hard v2 el autor reporta la tasa de victorias evaluada por GPT-4.1.

Puntos a destacar: el modelo supera a Qwen3-30B-A3B Non-Thinking en MMLU-Pro, GPQA, AIME25, HMMT25, ZebraLogic, LiveBench, Arena-Hard v2 y varios benchmarks de alineacion, pese a tener 7,5 veces menos parametros. Queda por detras en Aider-Polyglot, MultiIF, MMLU-ProX, INCLUDE y TAU2-Telecom.

## Requisitos de hardware

Estimaciones basadas en el tamano del modelo y en la arquitectura declarada (36 capas, 8 cabezas KV); no son cifras oficiales.

- Pesos en BF16: ~8 GB. Con overhead de runtime, se recomienda un minimo de 10-12 GB de VRAM.
- Pesos en FP8/INT8: ~4-5 GB de VRAM.
- Pesos en cuantizacion de 4 bits (GGUF Q4_K_M y similares): ~2,5-3 GB de VRAM.
- Cache KV: aproximadamente 144 KiB por token asumiendo `head_dim=128` (2 x 36 capas x 8 cabezas x 128 x 2 bytes). Esto implica ~4,6 GB a 32K tokens y ~36 GB a los 262.144 tokens completos. El contexto largo domina el consumo de memoria mucho mas que los pesos.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4090 24 GB en BF16 con contexto moderado; con cuantizacion de 4 bits es viable incluso en GPUs de 4-8 GB si se limita el contexto.
- GPU de datacenter: A100 80 GB o H100 80 GB para explotar la ventana completa de 256K, posiblemente con tensor parallelism y cuantizacion de la cache KV.
- Opciones de despliegue: vLLM >= 0.8.5 (`vllm serve ... --max-model-len 262144`), SGLang >= 0.4.6.post1, TGI (etiqueta `text-generation-inference`), ademas de llama.cpp, Ollama, LM Studio, MLX-LM y KTransformers para uso local.
- Ajuste practico: la propia model card recomienda reducir la longitud de contexto a valores como 32.768 en caso de errores de memoria insuficiente (OOM).
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Requisito de libreria: `transformers >= 4.51.0` (versiones anteriores lanzan `KeyError: 'qwen3'`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | MMLU-Pro | AIME25 | BFCL-v3 | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Qwen3-4B-Instruct-2507 | 4,0 B (denso) | 262.144 | Apache 2.0 | 69,6 | 47,4 | 61,9 | HuggingFace, vLLM, SGLang, Ollama, llama.cpp |
| Qwen3-4B Non-Thinking | 4,0 B (denso) | no disponible en la informacion | Apache 2.0 (familia Qwen3) | 58,0 | 19,1 | 57,6 | HuggingFace |
| Qwen3-30B-A3B Non-Thinking | 30,5 B totales / 3,3 B activos (MoE) | no disponible en la informacion | Apache 2.0 (familia Qwen3) | 69,1 | 21,6 | 58,6 | HuggingFace |
| GPT-4.1-nano-2025-04-14 | no disponible | no disponible | Propietaria | 62,8 | 22,7 | 53,0 | Solo API |

El modelo de 4B iguala o supera a Qwen3-30B-A3B en conocimiento y razonamiento, pero el MoE de 30B mantiene ventaja en eficiencia de computo por token (solo 3,3 B activos) y en algunas tareas de codigo agentico (Aider-Polyglot 24,4 frente a 12,9). GPT-4.1-nano queda por detras en casi todas las categorias salvo Aider-Polyglot, y su principal ventaja es la disponibilidad como servicio gestionado.

## Limitaciones y advertencias

- Sesgos: no se documentan analisis de sesgo en la informacion disponible; el modelo puede reproducir sesgos presentes en sus datos de entrenamiento.
- Alucinacion: como cualquier LLM generativo, puede producir informacion factualmente incorrecta con apariencia de verosimilitud, especialmente en conocimiento de cola larga o dominios especializados.
- Sin modo de pensamiento: no genera bloques `<think></think>`, por lo que no se beneficia de cadenas de razonamiento explicitas. En tareas que requieren descomposicion compleja puede quedar por detras de modelos con thinking mode.
- Contexto: aunque la ventana nativa es de 262.144 tokens, en la practica el coste de cache KV (~36 GB estimados a contexto completo) hace inviable explotarla entera en hardware de consumo; la model card sugiere bajar a 32.768 tokens ante problemas de OOM.
- Idiomas: la model card afirma mejoras multilingues, pero no publica la lista completa de idiomas soportados. Es necesario validar el comportamiento en el idioma objetivo antes de desplegar en produccion.
- Rendimiento desigual: en TAU2-Telecom (13,2) y Aider-Polyglot (12,9) queda por detras de alternativas de la propia familia Qwen3. No es la mejor opcion para esos casos concretos.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion sin restricciones significativas, siempre que se conserve el aviso de licencia y los avisos de atribucion correspondientes.
- Procedencia del repositorio: la ficha corresponde a `Stage-org/Qwen3-4B-Instruct-2507`, una replica subida por un tercero, con 0 descargas y 0 likes en el momento de la consulta, creada y actualizada en la misma marca temporal. Se recomienda verificar la integridad de los pesos y, en su caso, descargar desde el repositorio oficial de Qwen para garantizar la procedencia.
- Requisito de version: es imprescindible `transformers >= 4.51.0`; versiones anteriores fallan al cargar la arquitectura.
- Sin datos de rendimiento en produccion: no hay cifras publicadas de latencia ni throughput en la informacion disponible, por lo que el dimensionamiento debe hacerse con pruebas propias.

## Enlaces

- Repositorio en HuggingFace (copia de Stage-org): https://huggingface.co/Stage-org/Qwen3-4B-Instruct-2507
- Repositorio oficial del modelo: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Licencia del modelo oficial: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507/blob/main/LICENSE
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Informe tecnico (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Qwen-Agent (tool calling y agentes): https://github.com/QwenLM/Qwen-Agent
- Qwen Chat: https://chat.qwen.ai
- Imagen de rendimiento publicada por el autor: https://qianwen-res.oss-accelerate.aliyuncs.com/Qwen3-2507/Qwen3-4B-Instruct.001.jpeg
