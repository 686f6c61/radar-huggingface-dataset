# stevyhacker/Qwen3.5-4B-LokalBot-GGUF

## Resumen

Qwen3.5-4B-LokalBot-GGUF es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-4B, publicado por el desarrollador stevyhacker, calibrado con imatrix y cuantizado en formato Q4_K_M. Está diseñado específicamente para LokalBot, un cliente de IA on-device, y se orienta a tareas de "Think": generación de notas de reunión con trazabilidad de fuente, extracción de decisiones y acciones, retención de memoria de contexto personal, extracción de foco para resúmenes diarios y tool calling nativo en inglés y serbio (tanto en alfabeto latino como cirílico).

El modelo resuelve un problema concreto: los modelos base genéricos fallan al procesar transcripciones reales de reuniones con hablantes diarizados sin nombre (por ejemplo, "them 1..8" o "local 1..3"), lo que provoca pérdidas de recall en la extracción de acciones. La versión v4 corrige esta regresión respecto a v3 y supera tanto al modelo base como a versiones anteriores en las cuatro suites de evaluación del autor.

Con 4.205.751.296 parámetros totales y un peso de 2.741 GB en Q4_K_M, el modelo está pensado para ejecutarse en hardware de consumo mediante llama.cpp, con una ventana de contexto de 32K tokens y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-4B); no se detalla en la informacion disponible |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (configuracion de evaluacion: `-c 32768`) |
| Tipos de cuantizacion | Q4_K_M (unico formato publicado en el repo) |
| Idiomas soportados | en (ingles), sr (serbio, latin y cirilico); mezcla EN/SR |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors solo como dato del modelo base) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del transformer Qwen/Qwen3.5-4B. El autor no detalla en la informacion disponible la arquitectura interna del modelo base (tipo de atención, número de capas, etc.), pero sí especifica que el ajuste se realizó mediante LoRA merge con escala 1.0 en la versión recomendada (v4). El entrenamiento se llevó a cabo sobre 4.117 filas verificadas con Swift, y el autor indica que solo se usaron datos de licencia abierta: datasets públicos Apache-2.0 / ODC-By y ejemplos sintéticos generados por modelos teacher de pesos abiertos. No se emplearon reuniones privadas de usuarios en el entrenamiento.

La calibración imatrix cubre inglés, serbio y JSON. El modelo está optimizado para ejecutarse con `enable_thinking=False`, temperatura 0 y contexto de 32K en el servidor llama.cpp incluido en LokalBot. La versión v4 corrige la caída de recall en elementos de acción de reuniones reales que afectaba a v3, causada por listas de hablantes diarizados sin nombre. El autor reporta que v4 supera tanto al modelo base como a v3 en las cuatro suites de evaluación, con un 61,6% menos de rechazos del validador que el modelo base y una latencia mediana 1,43 veces menor.

## Capacidades

- Generación de texto conversacional en inglés y serbio (latino y cirílico).
- Generación de notas de reunión con enlaces a la fuente (source-linked meeting notes).
- Extracción de decisiones y elementos de acción a partir de transcripciones de reuniones.
- Retención de memoria de contexto personal (Personal Context memory retention).
- Extracción de foco para resúmenes diarios (Day Digest focus extraction).
- Tool calling nativo (Ask tool-calling), con soporte de bucle de agente multi-paso (`multi-step agent loop` verificado como `True` en la suite SparkX26).
- Salida estructurada en JSON (calibración imatrix específica para JSON).
- Manejo de transcripciones diarizadas con hablantes sin nombre (por ejemplo, "them 1..8", "local 1..3").
- Capacidad multilingüe limitada a inglés y serbio; el autor reporta 0 derivas al ruso y 0 tokens latinos sueltos en salidas en cirílico serbio.

## Casos de uso

- Generación automática de notas de reunión: el modelo procesa transcripciones diarizadas de hasta 1.115 segmentos y extrae decisiones y acciones con trazabilidad de fuente, gracias a su contexto de 32K tokens y a un recall de acciones del 52,7% en la suite Private28.
- Extracción de elementos de acción en entornos laborales: con un 52,7% de recall en 150 acciones de referencia y 0 colapsos a cero acciones en reuniones accionables, es adecuado para pipelines que convierten transcripciones en listas de tareas asignadas a propietarios resueltos.
- Detección de decisiones en reuniones: alcanza 19/19 reuniones con decisiones detectadas en la suite Private28, frente a 6/19 del modelo base, lo que lo hace útil para sistemas que marcan acuerdos y resoluciones.
- Memoria personal on-device: con un 97,5% de retención perfecta en 120 casos retenidos (100% en serbio y 96,2% en inglés), puede usarse para mantener contexto persistente del usuario en asistentes locales sin enviar datos a la nube.
- Asistente con tool calling y agentes multi-paso: verificado con 6/6 herramientas nativas y bucle de agente multi-paso en la suite SparkX26, adecuado para asistentes que encadenan llamadas a funciones y razonamiento en varios pasos.
- Resúmenes diarios y extracción de foco: la tarea Day Digest focus extraction permite generar resúmenes de actividad diaria extrayendo los puntos clave de conversaciones y documentos.
- Despliegue en hardware de consumo: con 2.741 GB en Q4_K_M y ejecución sobre llama.cpp, cabe en GPU de consumo y permite inferencia local con latencia mediana de 11,84 s en una NVIDIA RTX PRO 6000 Blackwell para extracción de reuniones.
- Procesamiento bilingüe inglés-serbio: útil para equipos que trabajan en ambos idiomas, incluyendo reuniones mixtas EN/SR y transcripciones en cirílico serbio, con 0 derivas al ruso reportadas.

## Benchmarks y rendimiento

Los resultados proceden de la model card del autor, evaluados en la misma hardware (NVIDIA RTX PRO 6000 Blackwell con llama.cpp, `-c 32768 -ngl 99 --jinja --reasoning on`, `enable_thinking: false`, temperatura 0).

Suite Private28 (28 reuniones reales, 150 acciones de referencia, 58 decisiones de referencia en 19 reuniones):

| Metrica | Stock 4B | v3 (s=0.85) | v4 (s=1.0) |
|---|---:|---:|---:|
| Trabajos completados | 27/28 | 28/28 | 28/28 |
| Recall de acciones (150 ref) | 70/150 (46,7%) | 47/150 (31,3%) | 79/150 (52,7%) |
| Recall de acciones (subconjunto Private12, 70 ref) | 36/70 (51,4%) | 22/70 (31,4%) | 38/70 (54,3%) |
| Aciertos limpios de accion con propietario resuelto | 59 | 36 | 60 |
| Colapsos a cero acciones en reuniones accionables | 0 | 6 | 0 |
| Reuniones con decisiones detectadas (19 ref) | 6/19 | 19/19 | 19/19 |
| Tasa de propietario resuelto | 59,4% | 66,1% | 59,9% |
| Rechazos del validador | 185 | 27 | 71 (-61,6% vs. stock) |
| Derivas al ruso | 0 | 0 | 0 |
| Latencia mediana de extraccion (GPU G4) | 16,98 s | 9,54 s | 11,84 s (1,43x mas rapido vs. stock) |
| Recall por propietario de referencia (user / other / unresolved / none) | 16/19 · 30/57 · 9/37 · 15/37 | 11/19 · 16/57 · 8/37 · 12/37 | 15/19 · 29/57 · 14/37 · 21/37 |

Suite Personal Context / Memory Retention (120 casos retenidos):

| Slice | Metrica | Stock 4B | v3 | v4 |
|---|---|---:|---:|---:|
| Ingles (96 casos, 52 gold) | Recall util | 31/52 (59,6%) | 52/52 (100,0%) | 50/52 (96,2%) |
| Ingles | Propuestas no deseadas | 3 | 1 | 1 |
| Serbio (24 casos, 13 gold) | Recall util | 0/13 (0,0%) | 12/13 (92,3%) | 13/13 (100,0%) |
| Serbio | Propuestas no deseadas | 9 | 0 | 0 |
| Combinado (120 casos) | Perfectos / no deseados | 83/120 (69,2%) / 12 | 118/120 (98,3%) / 1 | 117/120 (97,5%) / 1 |

Suite SparkX26 (extraccion estructurada y tool calling nativo): 9/12 casos (39/43 campos), 6/6 herramientas nativas, bucle de agente multi-paso verificado como `True`. Suite Golden6 (replay de produccion en Swift): 6/6 completados, 8 decisiones, 29 acciones, 1 rechazo, 0 derivas al ruso y 0 tokens latinos sueltos en salidas en cirilico serbio.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,741 GB de pesos en Q4_K_M; con overhead de contexto de 32K y KV cache, se recomienda al menos 4-6 GB de VRAM para ejecución cómoda (estimación basada en el tamaño del archivo, no publicada por el autor).
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (hardware usada en las evaluaciones del autor). Por tamaño, cabe en GPU de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090.
- Cabe en GPU de consumo: sí, dado el tamaño de 2,741 GB en Q4_K_M.
- Opciones de despliegue: llama.cpp (servidor incluido en LokalBot, con `-ngl 99 --jinja --reasoning on`); al ser GGUF, es compatible con el ecosistema llama.cpp, aunque el autor solo documenta y valida el despliegue en LokalBot.
- Latencia y throughput: latencia mediana de extracción de 11,84 s en la suite Private28 sobre RTX PRO 6000 Blackwell; 1,43 veces más rápido que el modelo base (16,98 s). No se publican datos de throughput (tokens/s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---:|---|---|---|---|
| Qwen3.5-4B-LokalBot v4 (este) | 4.205.751.296 | 32K | GGUF Q4_K_M | Apache-2.0 | Fine-tune especializado en notas de reunion, memoria y tool calling EN/SR |
| Qwen/Qwen3.5-4B (stock) | 4.205.751.296 (base) | 32K (en la evaluacion) | safetensors / GGUF | Apache-2.0 | Modelo base; recall de acciones 46,7%, 6/19 reuniones con decisiones, 0/13 recall en serbio |
| Qwen3.5-4B-LokalBot v3 | 4.205.751.296 | 32K | GGUF Q4_K_M | Apache-2.0 | Version previa; 31,3% recall de acciones y 6 colapsos a cero acciones, pero 100% recall en ingles en memoria |

No se dispone en la informacion proporcionada de comparaciones con modelos de otros desarrolladores (por ejemplo, Llama o Gemma de tamano similar); esos datos figuran como no disponibles.

## Limitaciones y advertencias

- Modelo especializado: está ajustado para tareas concretas de LokalBot (notas de reunión, memoria personal, extracción de foco, tool calling) y no se ha validado como modelo de propósito general.
- Idiomas limitados: solo inglés y serbio (latino y cirílico); no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Recall de acciones moderado: el 52,7% en Private28 implica que aproximadamente la mitad de las acciones de referencia no se recuperan; no es adecuado para extracción con requisitos de exhaustividad alta sin revisión humana.
- Tasa de propietario resuelto del 59,9%: un 40% de las acciones no quedan asignadas a un propietario resuelto.
- Rechazos del validador: 71 rechazos en la suite Private28, aunque un 61,6% menos que el modelo base.
- Riesgo de alucinación: no se publican métricas específicas de alucinación; como todo modelo generativo, puede producir contenido no presente en la transcripción.
- Sesgos: no se documentan sesgos conocidos en la información disponible.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base Qwen/Qwen3.5-4B debe verificarse por separado para confirmar compatibilidad (el autor indica Apache-2.0 en el fine-tune).
- Despliegue validado únicamente en llama.cpp dentro de LokalBot con `enable_thinking=False` y temperatura 0; otros ajustes de inferencia pueden degradar el rendimiento reportado.
- Datos de entrenamiento: 4.117 filas verificadas con Swift y datasets públicos; el rendimiento en dominios distintos a reuniones y memoria personal no está evaluado.

## Enlaces

- Hugging Face: https://huggingface.co/stevyhacker/Qwen3.5-4B-LokalBot-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio LokalBot: https://github.com/stevyhacker/LokalBot
