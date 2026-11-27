# vamboai/morena-1.5b-instruct

## Resumen

MORENA 1.5B instruct es un modelo de lenguaje decoder-only de 1.485 millones de parametros (1.484.900.352 exactos segun los pesos en safetensors) entrenado desde cero por Vambo AI para doce lenguas africanas de escritura latina, ingles, frances y codigo. Se trata del checkpoint ajustado por instrucciones de la familia MORENA, descrito en el articulo *MORENA: An African Foundation Model*, y parte del modelo base `vamboai/morena-1.5b-base`. Su relevancia radica en que cubre idiomas como shona (sn), swahili (sw), hausa (ha), yoruba (yo), igbo (ig), zulu (zu), xhosa (xh), kinyarwanda (rw), setswana (tn), afrikaans (af), ndebele del sur (nr) y pidgin nigeriano (pcm), un conjunto escasamente representado en los modelos fundacionales disponibles.

La arquitectura es un transformer denso de 28 capas por 2048 dimensiones ocultas, con GQA de 16 cabezas de atencion y 4 de valor, SwiGLU de 6144 y RoPE con theta 500.000. El contexto es de 4.096 tokens y los embeddings estan atados. El modelo se entreno con 251,7B tokens de preentrenamiento mas 63B de mid-training (315B tokens vistos en total), seguido de 4.500 pasos de SFT con enmascaramiento de perdida y 500 pasos de recocido de seguridad.

El punto fuerte declarado por el autor es la traduccion ingles a lenguas africanas: 45,8 chrF++ en FLORES+ (media de cinco idiomas, 3-shot), ocho puntos por encima de MADLAD-400-3B (37,8). En cambio, la traduccion inversa (africano a ingles) queda por debajo de MADLAD-400-3B (48,7 frente a 53,6). El modelo se distribuye con licencia Apache 2.0 y pesos en bf16, con una build GGUF separada para llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, 28 capas x 2048, GQA 16/4, SwiGLU 6144, RoPE theta 500.000, embeddings atados |
| Parametros totales | 1.484.900.352 (1.485B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | Pesos originales en bf16; build GGUF disponible en `vamboai/morena-1.5b-instruct-gguf` (cuantizaciones concretas no disponibles) |
| Idiomas soportados | sn, sw, ha, yo, ig, zu, xh, rw, tn, af, nr, pcm, en (la model card menciona ademas frances y codigo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 1.485B parametros con 28 capas, dimension oculta 2048, atencion con grouped-query attention de 16 cabezas de consulta y 4 de clave/valor, FFN SwiGLU de 6144, RoPE con theta 500.000, contexto de 4.096 tokens y embeddings atados. El optimizador combina Muon para los pesos no de embedding y AdamW para el resto, con un schedule warmup-stable-decay. El repositorio incluye `modeling_morena.py`, una implementacion de referencia en PyTorch puro sin dependencia de transformers.

El entrenamiento cubre 251,7B tokens de preentrenamiento y 63B de mid-training (315B tokens vistos). La mezcla vario en tres regimenes: el texto africano represento el 24,8% de los tokens vistos (14,8% traduccion automatica) en los pasos 1 a 25.304, el 39,1% (31,0% traduccion automatica) en los pasos 25.305 a 60.000, y el 50,2% (41,6% traduccion automatica) durante el mid-training. Nueve idiomas se tradujeron automaticamente desde documentos en ingles, lo que supone el 24% de los tokens de preentrenamiento vistos y el 28% incluyendo mid-training (57,1B tokens en disco de 271B). Los datos provienen de FineWeb-Edu, FineWeb-2, codeparrot-clean, github-code-clean, open-web-math, proof-pile-2, wura, MADLAD-400, afriberta-corpus, fikira, Magicoder-OSS-Instruct-75K, CodeFeedback-Filtered-Instruction y el corpus SFT propio `vamboai/morena-sft-corpus`. El ajuste por instrucciones consistio en 4.500 pasos de SFT con enmascaramiento de perdida mas 500 pasos de recocido de seguridad. El coste de la release se cifra en 12.834 horas de GPU A100, con un coste estimado de 25.000 a 40.000 dolares a 2-3 dolares por hora A100.

## Capacidades

- Generacion de texto conversacional multi-turno en trece idiomas, con formato de chat basado en tokens reservados: `<reserved_0>` abre turno de usuario y `<reserved_1>` abre turno de asistente (ids 3 y 4).
- Traduccion automatica, especialmente fuerte en la direccion ingles a lenguas africanas (45,8 chrF++ en FLORES+ para cinco idiomas, 3-shot).
- Comprension lectora y respuesta a preguntas en contexto (open-book QA) en lenguas africanas, con una tasa de fundamentacion en el pasaje de 0,73.
- Tool calling / function calling: 98,1% de herramienta correcta y 100% de JSON valido cuando el marcador de herramienta viene pre-rellenado en el prompt.
- Generacion de codigo, gracias a los corpus de codigo incluidos en el preentrenamiento (codeparrot, github-code-clean, Magicoder, CodeFeedback).
- Razonamiento matematico y formal, con open-web-math y proof-pile-2 en la mezcla de entrenamiento.
- Capacidades multilingues cruzadas entre lenguas africanas e ingles, con soporte declarado de frances.
- Modo de seguridad: rechazo de peticiones daninas en el 91,5% de los intentos y manejo correcto del 89,0% de 3.341 intentos en 13 idiomas y 11 categorias.

## Casos de uso

- Traduccion de documentacion institucional de ingles a lenguas africanas: el modelo alcanza 45,8 chrF++ en FLORES+ para cinco idiomas, ocho puntos por encima de MADLAD-400-3B, lo que lo hace adecuado para localizar materiales administrativos, sanitarios o educativos con revision humana posterior.
- Atencion al cliente en lenguas africanas de bajos recursos: con 4.096 tokens de contexto puede gestionar conversaciones multi-turno en swahili, hausa, yoruba o zulu, aunque conviene monitorizar la tasa de rechazo indebido (41% de peticiones benignas no atendidas correctamente).
- Asistente de lectura aumentada en ingles y lenguas africanas: con una tasa de fundamentacion de 0,73 sobre el pasaje, el modelo puede integrarse en pipelines RAG donde se le exija citar el contexto, aceptando que la precision final en lenguas africanas esta en el nivel del azar (0,325 frente a 0,25 de azar).
- Generacion de codigo asistida en entornos de desarrollo: el modelo se entreno con corpus de codigo e instrucciones (Magicoder-OSS-Instruct-75K, CodeFeedback) y puede integrarse en editores o pipelines de CI/CD para autocompletado y generacion de tests, con validacion automatica posterior.
- Clasificacion y extraccion de informacion estructurada mediante tool calling: con el marcador de herramienta pre-rellenado logra el 100% de JSON valido, lo que permite usarlo como extractor de entidades o enrutador de intenciones en sistemas de agentes.
- Investigacion linguistica y evaluacion comparativa de modelos africanos: su publicacion de metricas por idioma (Belebele, FLORES+, bits por byte) y su licencia Apache 2.0 lo convierten en una linea base reproducible para estudiar el rendimiento en lenguas de bajos recursos.
- Despliegue en hardware modesto: con 1.485B parametros y pesos bf16 (repositorio de 3,0 GB), cabe en GPUs de consumo para prototipado y en CPU mediante la build GGUF, lo que facilita pilotos en entornos con presupuesto limitado.

## Benchmarks y rendimiento

| Benchmark | MORENA 1.5B instruct | Referencia |
|---|---|---|
| Bits por byte africano (media de 12, menor es mejor) | 1,441 | Lugha-Llama-8B 1,423; gemma-3-12b-it 2,159; gemma-3-1b-pt 2,335 |
| Traduccion FLORES+ chrF++, ingles a 5 lenguas africanas, 3-shot | 45,8 (45,1-46,5) | MADLAD-400-3B 37,8; Lugha-Llama-8B 36,8 |
| Traduccion FLORES+ chrF++, 5 lenguas africanas a ingles | 48,7 (47,5-49,7) | MADLAD-400-3B 53,6; Lugha-Llama-8B 52,4 |
| Belebele comprension lectora (media de 10 lenguas africanas) | 0,309 | azar 0,25; rango por idioma 0,24 (yoruba) a 0,43 (afrikaans) |
| Retrieval QA open-book, precision / fundamentacion, media africana | 0,325 (0,297-0,355) / 0,73 | azar 0,25 |
| Generacion fundamentada, fiel a los hechos dados | 23% (22 de 96; IC 15,6-32,3) | version anterior 31% (30 de 96); base sin instrucciones 6% (6 de 96) |
| Tool calling, herramienta correcta / JSON valido (marcador pre-rellenado) | 98,1% / 100% | no disponible |
| Seguridad, intentos bien gestionados (3.341 intentos, 13 idiomas, 11 categorias) | 89,0% (87,8-90,0) | 90,2% de los intentos puntuables |
| Salida degenerada | 1,3% | no disponible |
| Rechazo de peticiones daninas | 91,5% de los intentos | no disponible |
| Peticiones benignas bien atendidas | 58,9% (53,3-64,2) | version anterior 47,9% |

Seguridad por categoria (proporcion de intentos bien gestionados, 24 prompts por categoria e idioma): autolesion 92,5; seguridad infantil 91,2; drogas 86,2; violencia 88,9; elecciones 89,2; privacidad 93,8; fraude 94,3; armas 93,3; odio 95,4; medicacion 95,4. Idiomas mas debiles: igbo 75%, yoruba 82%, setswana 83%, xhosa 87%. Todas las cifras son juicios de un modelo (google/gemma-3-12b-it) sobre otro modelo; ningun hablante nativo ha evaluado aun las respuestas.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, aproximadamente 3 GB solo para pesos, mas overhead de activaciones y cache KV; en cuantizacion de 8 bits, alrededor de 1,5-2 GB; en 4 bits, alrededor de 1-1,5 GB (estimaciones a partir del tamano de pesos, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para bf16; A100 o H100 para evaluacion a gran escala y entrenamiento; RTX 4090, RTX 3090 o RTX 4060 Ti de 16 GB son suficientes para inferencia en bf16.
- Cabe en GPU de consumo: si, con 4.096 tokens de contexto el modelo es holgado en tarjetas de 8-16 GB; en cuantizacion GGUF puede ejecutarse incluso en CPU.
- Opciones de despliegue: llama.cpp mediante la build GGUF de `vamboai/morena-1.5b-instruct-gguf`; PyTorch puro con `modeling_morena.py` y `load_example.py` incluidos en el repositorio; la model card marca `inference: false`, por lo que no se garantiza compatibilidad directa con transformers/vLLM/TGI sin adaptar el tokenizador y el formato de chat.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Traduccion EN a africano (chrF++) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MORENA 1.5B instruct | 1,485B | 4.096 | 45,8 | Apache 2.0 | Hugging Face, safetensors y GGUF |
| MADLAD-400-3B | 3B (no confirmado en la informacion) | no disponible | 37,8 | no disponible | Hugging Face (usado como referencia) |
| Lugha-Llama-8B | 8B (no confirmado en la informacion) | no disponible | 36,8 | no disponible | Hugging Face (usado como referencia) |
| gemma-3-12b-it | 12B (no confirmado en la informacion) | no disponible | no disponible (bpb 2,159) | no disponible | Hugging Face (usado como referencia) |

En bits por byte africano, MORENA 1.5B instruct (1,441) queda ligeramente por detras de Lugha-Llama-8B (1,423) pese a tener menos de una quinta parte de parametros, y muy por delante de gemma-3-12b-it (2,159) y gemma-3-1b-pt (2,335). En traduccion inversa (africano a ingles) MADLAD-400-3B y Lugha-Llama-8B superan a MORENA. En comprension lectora de opcion multiple (Belebele), el autor senala que todos los modelos por debajo de 12B medidos estan en el nivel del azar.

## Limitaciones y advertencias

- El QA aumentado por recuperacion esta en el nivel del azar en lenguas africanas (0,325 frente a 0,25), aunque el modelo lee el pasaje (fundamentacion 0,73).
- La generacion fundamentada es fiel a los hechos dados solo en el 23% de los intentos, por debajo del 31% de la version anterior.
- Sobrerrechazo: el modelo no atiende bien el 41% de las peticiones benignas ordinarias, la mayoria por rechazo. Un caso documentado de la version anterior fue negarse a recomendar una tintoreria citando "sustancias o servicios ilegales"; ese fallo concreto esta corregido, pero el problema general persiste.
- Tool calling: la cifra del 98,1% se mide con el marcador de herramienta pre-rellenado; si se deja al modelo decidir por si mismo, casi nunca invoca una herramienta.
- Comprension de opcion multiple en lenguas africanas en el nivel del azar, igual que el resto de modelos por debajo de 12B medidos.
- El checkpoint incumple la regla de seleccion fijada de antemano: falla en privacidad por 0,1 puntos, en drogas por 1,0 y en violencia por 2,6, y en degeneracion, que es del 1,3% frente al maximo del 1%.
- Todas las metricas de seguridad y calidad proceden de un juez automatico (google/gemma-3-12b-it); ningun hablante nativo ha valorado las respuestas.
- Idiomas mas debiles en seguridad: igbo (75%), yoruba (82%), setswana (83%) e isiXhosa (87%).
- Una parte sustancial del texto africano es traduccion automatica (14,8% a 41,6% segun el regimen, 28% incluyendo mid-training), lo que puede introducir artefactos de traduccion en la generacion.
- El formato de chat exige los tokens reservados `<reserved_0>` y `<reserved_1>`; usar cadenas estilo `<|user|>` produce salida degenerada porque no estan en el vocabulario.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones muy extensas.
- Licencia Apache 2.0 permite uso comercial, pero no se han publicado evaluaciones con hablantes nativos ni auditorias externas de sesgo; se recomienda validacion propia antes de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vamboai/morena-1.5b-instruct
- Build GGUF: https://huggingface.co/vamboai/morena-1.5b-instruct-gguf
- Modelo base: https://huggingface.co/vamboai/morena-1.5b-base
- Corpus SFT: https://huggingface.co/datasets/vamboai/morena-sft-corpus
- Dataset fikira: https://huggingface.co/datasets/vamboai/fikira
- Articulo *MORENA: An African Foundation Model*: no disponible (enlace no proporcionado en la informacion)
- Repositorio de codigo, demo o blog del autor: no disponible en la informacion proporcionada
