# stevyhacker/Qwen3.5-4B-LokalBot-GGUF

## Resumen

Qwen3.5-4B-LokalBot-GGUF es un fine-tune del modelo base Qwen/Qwen3.5-4B, publicado por el desarrollador stevyhacker en noviembre de 2026. Se distribuye unicamente en formato GGUF cuantizado en Q4_K_M, calibrado con imatrix sobre datos en ingles, serbio (alfabeto latino y cirilico) y JSON, con un tamano de fichero de 2.741 GB (2.741.241.920 bytes) identico al del Qwen3.5-4B-Q4_K_M original de Unsloth.

El modelo esta disenado especificamente para los flujos de trabajo "Think" de LokalBot, una aplicacion de notas de reunion on-device: generacion de notas estructuradas con fuentes enlazadas, extraccion de decisiones y acciones, retencion de memoria de contexto personal, extraccion de foco para el "Day Digest" y tool-calling nativo para la funcion Ask. El objetivo declarado es mejorar la fidelidad estructural y la retencion de memoria respecto al modelo base sin aumentar el footprint de inferencia.

La relevancia actual radica en que demuestra que un fine-tune de 4.205.751.296 parametros sobre un base compacto puede superar al modelo original en tareas especializadas de extraccion estructurada y memoria, con una procedencia de entrenamiento 100% abierta (datos sinteticos de profesores publicos, cero reuniones privadas de usuarios), manteniendo licencia Apache 2.0 y ejecucion en llama.cpp con 32K de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B; detalles de atencion no disponibles) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (configurado en runtime `-c 32768`) |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado, calibrado con imatrix) |
| Idiomas soportados | Ingles (en), serbio latin y cirilico (sr) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Qwen3.5-4B-LokalBot-v1-Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer de 4.205.751.296 parametros. No se dispone de informacion detallada sobre la composicion del dataset de preentrenamiento del base ni sobre innovaciones arquitectonicas concretas (tipo de atencion, uso de decodificacion especulativa, etc.); estos datos figuran como no disponibles en la informacion proporcionada.

El fine-tune se entreno exclusivamente con datos sinteticos procedentes de profesores publicos y abiertos, sin incluir reuniones privadas de usuarios, segun declara el autor. La calibracion imatrix cubre ingles, serbio latin, serbio cirilico y JSON. El autor menciona que la mezcla de entrenamiento de la v1 incluyo chunks QMSum con 36% de acciones vacias y 140 ejemplos de reparacion de accion unica, lo que explica parte de las limitaciones observadas en la recall de acciones de terceros. No se especifica el volumen total de tokens de entrenamiento ni si se aplicaron RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en ingles y serbio (latino y cirilico).
- Generacion de notas de reunion estructuradas con enlaces a fuentes y validacion de evidencia.
- Extraccion de decisiones y acciones con asignacion de responsables y fechas limite.
- Retencion de memoria de contexto personal (Personal Context) con manejo de negaciones, duplicados conocidos y requisitos tipados.
- Extraccion de foco para resumenes diarios (Day Digest).
- Tool calling nativo (function calling) para la funcion Ask.
- Razonamiento agente multi-paso: bucle `search_meetings` → `read_meeting` → respuesta con citas.
- Salida JSON estructurada para pipelines de extraccion.
- Modo thinking desactivable (`enable_thinking=false`), pensado para inferencia determinista con temperatura 0.
- Correccion de deriva linguistica: elimina la fuga al ruso en texto serbio cirilico que presenta el modelo base.

## Casos de uso

- Notas de reunion automaticas on-device: el modelo genera notas estructuradas con decisiones, acciones y referencias a la fuente a partir de transcripciones, usando los 32K tokens de contexto para reuniones largas y validacion de evidencia integrada en el pipeline de LokalBot.
- Extraccion de acciones y responsables: en produccion, alimenta el `MeetingNotesGenerator` en Swift con validadores y cola de reparacion; los datos del autor muestran una tasa de rechazo del validador reducida de 40 a 33 casos y llamadas de reparacion de 19 a 10 en 12 reuniones reales.
- Memoria personal persistente: retiene contexto del usuario entre sesiones con recall util del 90.4% en ingles y 92.3% en serbio, adecuado para asistentes que deben recordar preferencias, negaciones y requisitos previos.
- Tool calling en agentes locales: integra busqueda y lectura de reuniones en bucles multi-paso con citas verificables, util para asistentes de productividad que operan sin conexion a la nube.
- Procesamiento multilingue EN/SR: corrige la deriva al ruso en serbio cirilico (de 20 impactos a 0 en la fixture `staging-sr`), lo que lo hace adecuado para equipos que trabajan en serbio latino y cirilico mezclado con ingles.
- Resumen diario de foco (Day Digest): extrae los temas prioritarios del dia a partir de notas y reuniones, con latencia mediana de extraccion de 0.505 s en el benchmark SparkX26.
- Despliegue en hardware consumer: al ocupar 2.741 GB en Q4_K_M, puede ejecutarse en portatiles Apple Silicon (evaluado en M4 Max 48 GB) y en GPUs consumer con VRAM suficiente, mediante llama.cpp con `-ngl 99`.

## Benchmarks y rendimiento

Resultados publicados por el autor, comparados contra `unsloth/Qwen3.5-4B-GGUF` (Qwen3.5-4B-Q4_K_M) con flags identicos (`-c 32768 -ngl 99 --jinja --reasoning on`, `enable_thinking: false`, temperatura 0) en Apple M4 Max 48 GB con llama.cpp v1.0.0.

| Benchmark | Metrica | Stock Qwen3.5 4B | LokalBot v1 | Delta |
|---|---|---:|---:|---|
| MemoryRetention EN (96 casos, 52 gold) | Recall util | 28/52 (53.8%) | 47/52 (90.4%) | +36.6 pts |
| MemoryRetention EN | Casos perfectos | 70/96 (72.9%) | 85/96 (88.5%) | +15 casos |
| MemoryRetention EN | Pares perfectos | 26/48 | 37/48 | +11 pares |
| MemoryRetention EN | Negacion / dup conocido / req tipado | 1/8 · 5/8 · 4/8 | 8/8 · 8/8 · 8/8 | 100% en las tres |
| MemoryRetention EN | Clean empty / no deseados | 42/44 · 3 | 38/44 · 7 | -4 empty |
| MemoryRetention SR (24 casos, 13 gold) | Recall util | 0/13 (0.0%) | 12/13 (92.3%) | +92.3 pts |
| MemoryRetention SR | Casos / pares perfectos | 10/24 · 0/12 | 21/24 · 9/12 | +11 casos / +9 pares |
| MemoryRetention SR | Clean empty / no deseados | 10/11 · 9 | 9/11 · 2 | -7 no deseados |
| SparkX26 (extraccion estructurada) | Casos JSON pasados | 7/12 (37/43 campos) | 8/12 (36/43 campos) | +1 caso |
| SparkX26 | Tool calling nativo | 6/6 | 6/6 | igual |
| SparkX26 | Bucle agente multi-paso | True | True | igual |
| SparkX26 | Latencia mediana de extraccion | 0.579 s | 0.505 s | -13% |
| MeetingNotesReplayTests (6 fixtures) | Trabajos completados | 6/6 | 6/6 | igual |
| MeetingNotesReplayTests | Decisiones estructuradas | 3/6 | 6/6 (5/6 rubrica exacta) | +3 |
| MeetingNotesReplayTests | Deriva al ruso (staging-sr) | 20 impactos | 0 impactos | -100% |
| MeetingNotesReplayTests | Rechazos / reparaciones | 3 / 4 | 1 / 1 | -67% / -75% |
| MeetingNotesReplayTests | Acciones guardadas | 27 | 17 | -10 |
| MeetingNotesReplayTests | Latencia mediana | 10.36 s | 7.30 s | -30% |
| Private12 (12 reuniones reales) | Trabajos completados | 12/12 | 12/12 | igual |
| Private12 | Decisiones / reuniones con decision | 5 (2/8) | 17 (8/8) | 100% de reuniones |
| Private12 | Tasa de responsables resueltos | 66.2% (49/74) | 75.8% (50/66) | +9.6 pts |
| Private12 | Rechazos del validador | 40 (11/2/5) | 33 (0/0/1) | invalid_note y speaker_ref a 0 |
| Private12 | Llamadas de reparacion | 19 | 10 | -47% |
| Private12 | Recall de segmentos de accion | 50.0% | 44.3% | -5.7 pts |
| Private12 | Latencia mediana | 33.13 s | 27.41 s | -17% |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2.741 GB solo para los pesos en Q4_K_M; con contexto de 32K y overhead de KV cache, el consumo total depende del runtime y del numero de tokens en contexto (no se publica una cifra exacta de VRAM total).
- GPU recomendadas: el autor evalua en Apple M4 Max 48 GB; por tamano, cabe en GPUs consumer con al menos 4-6 GB de VRAM efectiva para pesos mas cache, como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090. Para despliegue en servidor, A100 o H100 sobradas.
- Cabe en consumer GPU: si, al ser un Q4_K_M de 2.741 GB; tambien en portatiles Apple Silicon.
- Opciones de despliegue: llama.cpp (runtime evaluado, con `-c 32768 -ngl 99 --jinja --reasoning on`), Ollama (formato GGUF compatible), vLLM y TGI (compatibilidad GGUF no confirmada en la informacion; usar llama.cpp como referencia).
- Latencia y throughput: latencia mediana de extraccion de 0.505 s (SparkX26) y 7.30 s (MeetingNotesReplayTests) en M4 Max 48 GB; no se publica throughput en tokens/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---:|---|---|---|
| Qwen3.5-4B-LokalBot v1 (este) | 4.205.751.296 | 32K | Apache 2.0 | GGUF Q4_K_M | Fine-tune especializado en notas de reunion, memoria y tool calling EN/SR |
| Qwen/Qwen3.5-4B (base) | 4.205.751.296 | no disponible en la informacion | no disponible en la informacion | safetensors, GGUF (via Unsloth) | Modelo generalista; peor recall de memoria y deriva al ruso en serbio cirilico |
| unsloth/Qwen3.5-4B-GGUF | 4.205.751.296 | 32K (runtime) | no disponible en la informacion | GGUF Q4_K_M | Version cuantizada del base usada como referencia head-to-head |
| Qwen3.5-9B (referencia citada) | no disponible | no disponible | no disponible | no disponible | Recall de memoria EN del 71.2%, inferior al 90.4% de LokalBot v1 segun el autor |

## Limitaciones y advertencias

- Recall de acciones de terceros degradada: en las fixtures golden6 las acciones guardadas bajan de 27 a 17 y el recall de segmentos en private12 cae de 50.0% a 44.3%; el modelo tiende a colocar compromisos de colegas en "Key points" en lugar de `actions[]` y a dejar `due` vacio cuando la fecha ya esta en el texto.
- Regresion en `clean_empty` de memoria en ingles: baja de 42/44 a 38/44, con 7 casos no deseados frente a 3 del base.
- Solo disponible en Q4_K_M: no se publican otras cuantizaciones (Q5, Q8, FP16) ni pesos safetensors del fine-tune.
- Idiomas limitados a ingles y serbio (latino y cirilico); no hay evidencia de rendimiento en otros idiomas.
- Contexto de 32K configurado en runtime; no se confirma si el base soporta ventanas mayores ni como se comporta el fine-tune mas alla de 32K.
- Riesgo de alucinacion en extraccion estructurada: el benchmark SparkX26 muestra 8/12 casos JSON pasados y 36/43 campos correctos, con margen de error relevante en produccion.
- Procedencia de entrenamiento sintetica: aunque el autor declara datos 100% abiertos, la calidad depende de los profesores publicos usados; no se detalla la composicion exacta del dataset.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las obligaciones de atribucion y las condiciones del modelo base Qwen3.5-4B.
- Modelo con 0 descargas y 0 likes en Hugging Face en el momento de la ficha: madurez y soporte comunitario limitados.

## Enlaces

- Hugging Face: https://huggingface.co/stevyhacker/Qwen3.5-4B-LokalBot-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Referencia head-to-head (Unsloth): https://huggingface.co/unsloth/Qwen3.5-4B-GGUF
- Repositorio LokalBot: https://github.com/stevyhacker/LokalBot
