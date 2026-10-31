# vllm-sr/vela3-fast

## Resumen

vela3-fast es un modelo encoder de 380 millones de parametros (0.4B) desarrollado por vLLM Semantic Router en colaboracion con KR Labs, y forma parte de la familia Vela 3.0. Se trata de un modelo de decision (decision model) basado en dmis-lab/UltraBERT-380M, afinado para responder preguntas de eleccion multiple, si/no y de extraccion de spans en una sola pasada del encoder, sin generar texto. Devuelve decisiones, senales de enrutamiento (router signals) y los fragmentos exactos de texto solicitados (entidades, relaciones, datos personales, afirmaciones no soportadas, evidencia), con probabilidades y offsets de caracteres.

Su proposito principal es actuar como router semantico por defecto en sistemas de inferencia: clasificacion zero-shot, deteccion de PII, deteccion de alucinaciones, moderacion de contenido y senales de seguridad para enrutado de peticiones hacia modelos grandes. Segun sus autores, alcanza el mayor Decision Index publico (50.36) de cualquier modelo de hasta 500M de parametros, con latencias de 14 ms por decision a 200 tokens. Trabaja solo en ingles, con entradas de texto o JSON de hasta 32K tokens, y se distribuye bajo licencia Apache-2.0 en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-only (UltraBERT) con backbone de decision destilado y adaptadores LoRA con gating |
| Parametros totales | 380.436.225 (0.38B de backbone de decision; 1.65B y 6.6 GB el paquete completo con adaptadores con gating) |
| Parametros activos | no disponible |
| Longitud de contexto | 32K tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

vela3-fast parte de dmis-lab/UltraBERT-380M, un encoder afinado con un backbone de decision propio destilado de los modelos de decision d3. El entrenamiento del backbone incluyo destilacion sobre las distribuciones de respuesta de los modelos d3 (soft labels), splits de entrenamiento de datasets publicos formulados como decisiones (por ejemplo ANLI y RAGTruth) y tareas sinteticas de decision en los estilos que cubre el Decision Index (control de electrodomesticos, progresiones de acordes, preguntas causales), etiquetadas por d3 o por programa y verificadas contra cada item del Decision Index. Se promediaron cuatro checkpoints destilados.

Sobre ese backbone congelado se anaden pequeños adaptadores LoRA con gating, uno por tarea: spans (afirmaciones no soportadas, datos personales), evidencia, entidades, relaciones y senales de router, con adaptadores dedicados para senales de dominio, verificacion de hechos y feedback. Cada adaptador se activa solo para sus propias preguntas. Las senales de router se entrenan de forma supervisada sobre datasets publicos (AEGIS 2.0, PolyGuardMix y Nemotron-Safety-Guard v3 para seguridad, Global-MMLU para dominio, WildFeedback para feedback, DiffusionDB para modalidad, MASSIVE para intents). El resto de datos de entrenamiento incluye datasets publicos de NER, relaciones, alucinaciones, evidencia y PII, mas texto web y de documentos etiquetado por un modelo profesor grande. No se entrena sobre ningun split de test ni item del Decision Index.

## Capacidades

- Decisiones en una pasada de encoder: eleccion multiple, si/no y extraccion de spans, sin texto generado, con probabilidades y offsets de caracteres.
- Clasificacion zero-shot (pipeline zero-shot-classification).
- Token classification y named entity recognition (NER) zero-shot.
- Relation extraction (por ejemplo CoNLL04, DocRED, FewRel, CrossRE).
- Deteccion de datos personales (PII).
- Deteccion de afirmaciones no soportadas / alucinaciones (hallucination detection) y extraccion de evidencia.
- Moderacion y seguridad de contenido (content safety) y senales de router: dominio, fact-check, feedback, modalidad, intents.
- Entradas de texto o JSON, solo en ingles, hasta 32K tokens.

## Casos de uso

- Enrutado semantico de peticiones en sistemas LLM: clasifica cada consulta entrante (dominio, modalidad, intent, seguridad) en 14-28 ms para dirigirla al modelo o ruta adecuada, reduciendo coste y latencia del sistema global.
- Deteccion de alucinaciones en RAG: identifica afirmaciones no soportadas por el contexto y extrae la evidencia correspondiente con offsets de caracteres (0.889 example-F1 en LettuceDetect v2), util como filtro previo a la respuesta al usuario.
- Deteccion de PII en pipelines de datos: localiza datos personales en documentos con spans exactos para anonimizacion o cumplimiento normativo (RGPD).
- Clasificacion zero-shot de tickets y consultas: categoriza solicitudes de soporte o contenido sin entrenar un clasificador por categoria, aprovechando su rendimiento sobre GLiFormer (74.4 en la suite de 13 conjuntos).
- NER zero-shot en dominios nuevos: extrae entidades en textos de dominios no vistos (62.3 en OOD-7 zero-shot sobre CrossNER + MIT) sin reentrenamiento.
- Moderacion de contenido y seguridad: clasifica entradas con senales entrenadas sobre AEGIS 2.0, PolyGuardMix y Nemotron-Safety-Guard v3 como capa previa de seguridad.
- Analisis de relaciones en documentos: extrae pares entidad-relacion (CoNLL04, DocRED, FewRel, CrossRE) para construccion de grafos de conocimiento.
- Deteccion de feedback y verificacion de hechos: clasifica respuestas de modelos como utiles o no (WildFeedback) y verifica afirmaciones factuales.

## Benchmarks y rendimiento

| Benchmark | vela3-fast | Comparativa (reportado) |
|---|---|---|
| Decision Index 0.3 (publico, hasta 500M) | 50.36 | Amber 0.4B: 49.74; GLiClass v4 Edge (0.4B): 47.49 |
| GLiFormer classification suite (13 conjuntos) | 74.4 | GLiFormer-base (264M): 72.36; Qwen3.5-9B: 71.4 |
| NER (26 conjuntos GLiFormer) | 57.4 | GLiFormer-large (576M): 50.91 |
| NER zero-shot OOD-7 (CrossNER + MIT) | 62.3 | no disponible |
| LettuceDetect v2 (example-F1, 10.698 respuestas) | 0.889 | LettuceDetect v2 mmBERT-base (~307M): 0.869 |
| Router signal suite (24 ficheros) | mejor que Vela 2.0 0.3B en 13, igual en 6, peor en 5 (IC 95% pareado) | Vela 2.0 0.3B |

Latencia medida (batch 1, una AMD Instinct MI325X, 200 tokens): 14 ms por decision, 18 ms por pregunta de span.

## Requisitos de hardware

- VRAM estimada: el paquete completo con adaptadores ocupa 6.6 GB en disco; para inferencia del encoder de 380M en fp16 se estima del orden de 1-2 GB, aunque no hay cifra oficial publicada (no disponible).
- GPU de referencia en las mediciones: AMD Instinct MI325X (batch 1, 200 tokens). No se indican requisitos minimos de GPU (no disponible).
- Dada su escala de 0.4B, cabe con holgura en GPUs de consumo (por ejemplo RTX 4090 o inferiores); tambien es plausible su ejecucion en CPU dada su naturaleza encoder, aunque sin datos publicos que lo confirmen.
- Despliegue: libreria transformers de Hugging Face con custom_code; compatible con endpoints (endpoints_compatible). No se mencionan vLLM, llama.cpp, Ollama ni TGI de forma explicita (no disponible).
- Latencia y throughput: 14 ms por decision y 18 ms por pregunta de span a 200 tokens, batch 1, en una AMD Instinct MI325X.

## Comparativa con modelos similares

| Modelo | Parametros | Decision Index 0.3 | Clasificacion GLiFormer | NER (26 sets) | Licencia |
|---|---|---|---|---|---|
| vela3-fast | 0.38B | 50.36 | 74.4 | 57.4 | Apache-2.0 |
| Amber 0.4B | 0.4B | 49.74 | no disponible | no disponible | no disponible |
| GLiClass v4 Edge | 0.4B | 47.49 | no disponible | no disponible | no disponible |
| GLiFormer-base | 264M | no disponible | 72.36 | no disponible | no disponible |
| GLiFormer-large | 576M | no disponible | no disponible | 50.91 | no disponible |

## Limitaciones y advertencias

- Solo admite ingles; no hay soporte multilingue declarado.
- No genera texto: sus salidas son decisiones, etiquetas y spans, por lo que no sustituye a un LLM generativo.
- Algunas filas de test de la router signal suite publica tambien aparecen en fuentes de entrenamiento publicas; la propia model card reporta las filas sin solapamiento como referencia mas conservadora.
- La model card no documenta sesgos conocidos ni tasas de alucinacion del modelo en si (no disponible).
- Al tratarse de un modelo con custom_code en Hugging Face, conviene revisar el codigo cargado antes de usarlo en produccion.
- Las cifras de benchmarks de modelos competidores son numeros reportados por sus autores, no re-ejecuciones comparables en todos los casos.
- No hay informacion sobre cuantizacion disponible, lo que puede limitar opciones de despliegue optimizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vllm-sr/vela3-fast
- Modelo base: https://huggingface.co/dmis-lab/UltraBERT-380M
- Coleccion Vela 3.0: https://huggingface.co/collections/vllm-sr/vela-30-6ad1c430eb1718eb4754edcd
