# stevyhacker/Qwen3.5-4B-LokalBot-GGUF

## Resumen

Qwen3.5-4B-LokalBot-GGUF es una familia de fine-tunes cuantizados en formato GGUF del modelo base Qwen/Qwen3.5-4B, publicada por el desarrollador stevyhacker para su aplicación LokalBot. El modelo está especializado en tareas de procesamiento de reuniones en dispositivo (on-device): generación de notas de reunión con trazabilidad de fuentes, extracción de decisiones y acciones, retención de memoria de contexto personal, extracción de foco para resúmenes diarios y tool-calling nativo. Está entrenado y optimizado para inglés y serbio (en alfabeto latino y cirílico).

El checkpoint recomendado es la versión v4, un merge de LoRA con escala 1.0 entrenado sobre 4.117 filas verificadas, que corrige los fallos de extracción de acciones observados en v3 con hablantes diarizados sin nombre. El modelo mantiene una huella de 2,741 GB en cuantización Q4_K_M, idéntica a la del Qwen3.5-4B stock, por lo que es un reemplazo directo en el servidor llama.cpp que LokalBot incluye.

La relevancia actual del modelo reside en su enfoque en tareas estructuradas de extracción de información sobre transcripciones de reuniones, con mejoras medibles en latencia, reducción de rechazos del validador y detección de decisiones frente al modelo base, manteniendo licencia Apache 2.0 y un conjunto de datos de entrenamiento compuesto exclusivamente por fuentes abiertas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B); no se detalla en la informacion disponible |
| Parametros totales | 4.205.751.296 (4,2 mil millones) |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | 32.768 tokens (configuracion de despliegue en LokalBot: `-c 32768`) |
| Tipos de cuantizacion | Q4_K_M (imatrix calibrada con EN + SR + JSON); no se listan otras cuantizaciones |
| Idiomas soportados | Ingles (en) y serbio (sr), incluyendo latin y cirilico |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (4 ficheros: v1, v2, v3, v4; cada uno de 2,741 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen/Qwen3.5-4B, un transformer de 4,2 mil millones de parametros. La informacion disponible no detalla la arquitectura interna del modelo base (tipo de atencion, uso de MoE, SSM o hibridos), por lo que este dato debe consultarse en la model card del modelo base. El fine-tune se realizo mediante LoRA con merge a escala 1.0 (v4) y 0.85 (v3), y los pesos resultantes se cuantizaron a Q4_K_M con una matriz de importancia (imatrix) calibrada sobre datos en ingles, serbio y JSON.

El entrenamiento de v4 utilizo 4.117 filas verificadas con Swift, compuestas exclusivamente por fuentes publicas con licencias Apache-2.0, ODC-By-1.0, CC-BY-4.0, MIT y CC0, mas salidas sinteticas de modelos profesor de pesos abiertos validadas contra el validador de evidencia y propiedad de LokalBot. No se usaron reuniones privadas de usuarios. El objetivo del entrenamiento son tareas Think de LokalBot: notas de reunion con enlace a fuentes, extraccion de decisiones y acciones, retencion de memoria de contexto personal, extraccion de foco para Day Digest y tool-calling nativo Ask en ingles y serbio. No se menciona el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento orientado a tareas estructuradas de extraccion de informacion.
- Generacion de notas de reunion con trazabilidad de fuentes (source-linked meeting notes).
- Extraccion de decisiones y acciones a partir de transcripciones, incluyendo hablantes diarizados sin nombre (`them 1..8`, `local 1..3`, `them unclear`).
- Retencion de memoria de contexto personal (Personal Context memory retention), con 118/120 casos en la evaluacion interna.
- Extraccion de foco para resumenes diarios (Day Digest focus extraction).
- Tool-calling nativo (Ask) y soporte de agentes multi-paso: 6/6 herramientas nativas y bucle de agente multi-paso superado en la evaluacion SparkX26.
- Salida estructurada en JSON (imatrix calibrada con JSON).
- Capacidades multilingues en ingles y serbio (latin y cirilico), con 13/13 en recuperacion serbia en la prueba de memoria.
- Modo thinking opcional (`enable_thinking`), aunque LokalBot lo ejecuta por defecto con `enable_thinking=false`.

## Casos de uso

- Generacion automatica de actas de reunion: el modelo procesa transcripciones diarizadas y produce notas estructuradas con enlace a la fuente, adecuado por su entrenamiento especifico en reuniones reales y su contexto de 32K tokens.
- Extraccion de decisiones y acciones en herramientas de productividad: identifica segmentos de decision y acciones con propietario resuelto, con una tasa de rechazos del validador un 60,6% menor que el modelo stock en el holdout Blind21.
- Memoria de contexto personal en asistentes on-device: retiene y recupera informacion de contexto del usuario con una tasa de retencion del 98,3% en 120 casos held-out, lo que lo hace adecuado para asistentes personales que operan localmente.
- Resumenes diarios con extraccion de foco (Day Digest): selecciona los puntos focales del dia a partir de notas y eventos, disenado para ejecucion en dispositivo con latencia mediana de 13,64 s en GPU G4.
- Tool-calling y agentes multi-paso en local: integrable en bucles de agente que requieren llamadas a herramientas nativas en ingles y serbio, con soporte de plantilla Jinja (`--jinja`) en llama.cpp.
- Procesamiento de reuniones en serbio (latin y cirilico): cubre un idioma poco representado en modelos abiertos, con 13/13 en recuperacion serbia y sin deriva hacia el ruso en la prueba Golden6 (0 impactos de deriva rusa frente a 21 del stock).
- Despliegue en entornos con privacidad estricta: al ejecutarse en llama.cpp local con pesos GGUF de 2,741 GB, permite procesar transcripciones confidenciales sin salida a la nube, como demuestra el pipeline de replay de LokalBot sobre tunel SSH.

## Benchmarks y rendimiento

Evaluacion back-to-back en NVIDIA RTX PRO 6000 Blackwell con llama.cpp v1.0.0 (commit `b1b770d9`), `-c 32768 -ngl 99 --jinja --reasoning on`, `enable_thinking: false`, temperatura 0.

| Benchmark | Metrica | Stock Qwen3.5-4B | v4 (s=1.0) |
|---|---|---|---|
| Blind21 (21 reuniones EN, 85 acciones ref.) | Trabajos completados | 20/21 | 21/21 |
| Blind21 | Recall de segmentos de accion | 47/85 (55,3%) | 40/85 (47,1%) |
| Blind21 | Recall de accion a 2 palabras | 44/85 (51,8%) | 38/85 (44,7%) |
| Blind21 | Aciertos limpios con propietario resuelto | 38 | 27 |
| Blind21 | Precision de acciones candidatas | 27,9% (179 emitidas) | 22,8% (193 emitidas) |
| Blind21 | Tasa de propietario resuelto | 57,0% | 47,2% |
| Blind21 | Solapamiento de segmentos de decision (40 ref.) | 3/40 (7,5%) | 18/40 (45,0%) |
| Blind21 | Reuniones con decision acertadas (12 ref.) | 3/12 | 12/12 |
| Blind21 | Falsos positivos en reuniones sin decision (9) | 6 | 25 |
| Blind21 | Rechazos del validador | 175 | 69 (-60,6%) |
| Blind21 | Pasadas de reparacion | 56 | 28 |
| Blind21 | Latencia mediana de extraccion (GPU G4) | 24,24 s | 13,64 s (1,78x mas rapido) |
| Private28 (28 reuniones reales, 147 acciones, 58 decisiones) | Recall de acciones | 73/147 (49,7%) | 76/147 (51,7%) |
| Private28 | Solapamiento de decisiones | 0/58 | 14/58 (24,1%) |
| Private28 | Rechazos del validador | 160 | 67 (-58,1%) |
| Private28 | Latencia mediana | 21,88 s | 17,74 s (1,23x mas rapido) |
| Golden6 (replay Swift en produccion) | Completados / decisiones / acciones | no disponible | 6/6, 8 decisiones, 29 acciones, 1 rechazo, 0 deriva rusa |
| Golden6 | Latencia mediana | 6,46 s | 5,28 s |
| Personal Context Memory (120 casos) | Retencion | 81/120 (67,5%), 12 no deseados | 118/120 (98,3%), 1 no deseado |
| Personal Context Memory (serbio) | Recall | 0/13, 9 no deseados | 13/13, 0 no deseados |
| SparkX26 (extraccion + tool-calling) | Casos / campos | 8/12, 38/43 | 9/12, 39/43 |
| SparkX26 | Herramientas nativas | no disponible | 6/6 |
| ThinkOnSmoke6 (`enable_thinking=true`) | Aprobados | no disponible | 4/6 (1 fuga de etiqueta ``) |

Prueba exacta de McNemar de dos colas sobre recall de acciones en Blind21 (v4 vs stock): 10 ganadas, 17 perdidas, p = 0,2478. En Private28: p = 0,7359.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,741 GB para los pesos en Q4_K_M, mas overhead de contexto KV cache para 32K tokens (no cuantificado en la informacion disponible).
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (usada en la evaluacion); cualquier GPU con al menos ~4-6 GB de VRAM libre para pesos y cache.
- Cabe en GPU de consumo: si, dado el tamano de 2,741 GB del fichero GGUF; cabe en RTX 4090, RTX 3090 y GPUs con 8 GB o mas.
- Opciones de despliegue: llama.cpp (version fijada v1.0.0, commit `b1b770d9`, con `--jinja` y `--reasoning on`); servidor llama.cpp incluido en LokalBot. No se mencionan vLLM, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: latencia mediana de extraccion de 13,64 s en Blind21 y 17,74 s en Private28 sobre RTX PRO 6000 Blackwell; 5,28 s en Golden6. No se proporcionan cifras de throughput (tokens/s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-LokalBot v4 (este) | 4,2 B | 32K | Apache 2.0 | GGUF Q4_K_M | Fine-tune para reuniones, memoria y tool-calling; mejor latencia y menos rechazos que el stock |
| Qwen/Qwen3.5-4B (stock) | 4,2 B | 32K (config. de despliegue) | Apache 2.0 | safetensors / GGUF | Mayor recall bruto de acciones en Blind21 (55,3% vs 47,1%) y menos falsos positivos en reuniones sin decision (6 vs 25) |
| Alternativas de 4B para extraccion estructurada | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de benchmarks comparables en la informacion proporcionada |

## Limitaciones y advertencias

- En Blind21, el modelo stock supera a v4 en recall bruto de acciones (55,3% vs 47,1%, p = 0,2478) y en precision de acciones candidatas (27,9% vs 22,8%); la mejora de v4 se concentra en decisiones, latencia y reduccion de rechazos.
- v4 genera mas falsos positivos de decision en reuniones sin decision: 25 frente a 6 del stock en las 9 reuniones cero-decision de Blind21.
- Con `enable_thinking=true`, v4 aprueba 4/6 en ThinkOnSmoke6 y presenta una fuga de la etiqueta ``; LokalBot lo ejecuta por defecto con `enable_thinking=false`.
- Cobertura idiomatica limitada a ingles y serbio (latin y cirilico); no se declaran otros idiomas.
- Riesgo de alucinacion y de deriva linguistica: aunque v4 elimina la deriva hacia el ruso en Golden6 (0 frente a 21 del stock), el modelo sigue siendo un 4B y puede generar contenido no sustentado en la transcripcion.
- La licencia Apache 2.0 permite uso comercial, pero el modelo esta disenado y validado para el pipeline de LokalBot; su comportamiento fuera de ese pipeline (prompts, validadores y plantillas distintas) no esta evaluado.
- Los benchmarks se obtuvieron con una version fijada de llama.cpp y una GPU concreta; el rendimiento puede variar con otras configuraciones.
- No se han publicado datos sobre sesgos demograficos o culturales en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/stevyhacker/Qwen3.5-4B-LokalBot-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio LokalBot: https://github.com/stevyhacker/LokalBot
