# ttindall/Qwen3.5-9B-Defiance-Uncensored-MTP-GGUF

## Resumen

Qwen3.5-9B-Defiance-Uncensored-MTP-GGUF es una cuantización GGUF publicada por el usuario ttindall sobre los pesos de HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive, un derivado de Qwen3.5-9B al que se le han eliminado los mecanismos de rechazo (refusals) en los propios pesos. El modelo conserva la arquitectura original de Qwen3.5 con 8.953.803.264 parámetros (~9B) y una ventana de contexto nativa de hasta 262.144 tokens. La aportación de ttindall no es el entrenamiento, sino el empaquetado: una plantilla de chat "Defiance v2" embebida en cada GGUF, un sidecar con la cabeza MTP (Multi-Token Prediction) de Qwen y el proyector de visión de HauhauCS en BF16.

El interés técnico reside en dos elementos. Primero, la plantilla incorpora 40 "constructs" o modos de razonamiento (desde niveles nativos hasta paneles multiagente de 20 personalidades) portados desde el trabajo Turbo-Brilliance de DavidAU, que se activan por petición mediante etiquetas `{REASON:x}` o el parámetro `reasoning_effort`. Segundo, el sidecar MTP actúa como modelo borrador para decodificación especulativa en llama.cpp, con una tasa de aceptación del 53% y un rendimiento medido de 188,9 tok/s en Q4_K_M.

El modelo está pensado para usuarios que necesitan un 9B sin restricciones de contenido y con modos de razonamiento conmutables en tarjetas donde no cabe la variante de 27B del mismo autor. Es relevante por su enfoque poco habitual: separar pesos, plantilla y cabeza especulativa en artefactos independientes, lo que permite reutilizar el sidecar con otros GGUFs del mismo modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5) con cabeza MTP en sidecar separado |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos; 32K recomendado con los modos persona |
| Tipos de cuantizacion | Q4_K_M, Q6_K (publicadas); K/V en q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), proyector de visión BF16 separado |

## Arquitectura y entrenamiento

La base es Qwen3.5-9B, un transformer denso de ~9B parámetros. Sobre él, HauhauCS aplicó un proceso de "ablación" de rechazos en los pesos (el autor de la ficha afirma que no entrenó nada y que los pesos son byte a byte los de HauhauCS, verificados tensor a tensor en cada cuantización: 427 tensores por archivo). No se dispone de información sobre el volumen de tokens de entrenamiento original, la composición del dataset ni si hubo RLHF o DPO en la cadena Qwen3.5 → HauhauCS.

La innovación destacable es la decodificación especulativa mediante MTP. Los GGUFs de Qwen3.5-9B se distribuyen sin su cabeza MTP; este repositorio la aporta como archivo sidecar independiente (`Qwen3.5-9B-MTP-sidecar-Q8_0.gguf`) que se carga con `-md` y `--spec-type draft-mtp`. La plantilla Defiance v2 se genera con el script `make_defiance_template.py --gguf ... --qwen35`, aplica trece reemplazos de Defiance v2 más tres específicos de Qwen3.5 (supresión del texto de esfuerzo salvo petición explícita, tratamiento de tokens antiguos y gestión de mensajes de sistema en turnos posteriores) y queda embebida en el GGUF, por lo que no requiere `--chat-template-file`.

## Capacidades

- Generación de texto y razonamiento con modos conmutables: niveles nativos (`low`, `medium`, `xhigh`, `off`), frameworks (`omni`, `deeptree`, `hyper`, `socrates`, `logic`, `ultra`), paneles multiagente (`einstein` con 20 agentes, `spoon` con 5 expertos, `holodeck`) y personajes (`joker`, `house`, `vader`, `neo`, `stark`, `matlock`, `quinn`, `pkd`).
- Visión: pipeline `image-text-to-text` con el proyector BF16 de HauhauCS, cargado vía `--mmproj`.
- Tool calling y uso como endpoint compatible con OpenAI desde agentes de código; los nombres de esfuerzo de los agentes se mapean a los niveles nativos (`high` y `max` → `xhigh`; `minimal` y `none` → `low`).
- Razonamiento multi-paso con bloque de pensamiento controlado por `--reasoning-format deepseek` y presupuesto configurable (`--reasoning-budget`).
- Modo instruct sin bloque de pensamiento mediante etiquetas `{REASON:ijoker}`.
- Roleplay y conversación multi-turno con contexto largo.
- Capacidad de desactivar el preámbulo sin censura con `"chat_template_kwargs": {"defiance_preamble": false}`.

## Casos de uso

- Roleplay y narrativa interactiva sin restricciones: los modos de personaje (`joker`, `house`, `vader`) insertan system prompts de 2.500 a 3.600 tokens por turno, por lo que con 32K de contexto se mantienen conversaciones largas sin perder la persona; adecuado para escritura creativa y simulación de personajes.
- Agentes de código en local: apuntando un agente al `llama-server` como endpoint OpenAI-compatible y usando el modo `coder` o los niveles nativos, se obtiene un asistente de programación con tool calling sobre hardware de consumo (8,8 GB en Q4_K_M).
- Análisis de imágenes en local: con el proyector BF16 cargado, el modelo responde a consultas image-text-to-text; el autor verificó 3 de 3 imágenes en su batería de pruebas.
- Razonamiento estructurado por petición: el modo `socrates` o `deeptree` fuerza un método de descomposición explícito para problemas de lógica o planificación, útil en pipelines donde se quiere controlar la estructura de la respuesta sin cambiar de modelo.
- Paneles de expertos simulados: `einstein` (20 agentes) y `spoon` (5 expertos) generan deliberaciones multi-perspectiva para lluvia de ideas o revisión de decisiones, a costa de un consumo de contexto elevado.
- Sustituto ligero del 27B en equipos con VRAM limitada: para tareas donde la profundidad del 27B no es crítica, el 9B con sidecar MTP ofrece 188,9 tok/s y 8,8 GB de huella, lo que permite desplegarlo en una RTX 4090 o incluso en GPUs de 12 GB con Q4_K_M.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos medidos por el autor son de rendimiento de inferencia y verificación funcional:

| Metrica | Resultado | Configuracion |
|---|---|---|
| Throughput | 188,9 tok/s | Q4_K_M + sidecar + proyector, 32K, q8_0 K/V |
| Throughput sin sidecar | 138,6 tok/s | misma configuracion sin decodificacion especulativa |
| Tasa de aceptacion de borradores MTP | 53% | `--spec-draft-n-max 3 --spec-draft-p-min 0` |
| Verificaciones funcionales | 12 de 12 | Q4_K_M, bateria propia del autor |
| Pruebas de vision | 3 de 3 imagenes | Q4_K_M con proyector BF16 |
| Huella en VRAM | 8,8 GB | Q4_K_M en la tarjeta |
| Huella adicional Q6_K | ~1,7 GB mas | respecto a Q4_K_M |

## Requisitos de hardware

- VRAM estimada: 8,8 GB para Q4_K_M con sidecar y proyector; aproximadamente 10,5 GB para Q6_K.
- GPU recomendadas: RTX 4090, A100 o H100 para máximo throughput; cualquier GPU con 12 GB o más para Q4_K_M.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 4080, RTX 3090 y tarjetas de 12 GB o superiores con Q4_K_M.
- Despliegue: llama.cpp (probado en el commit 2cbe0ec) mediante `llama-server`; compatible con Open WebUI y clientes que hablen la API de OpenAI.
- Flags clave: `-ngl all`, `-fa on`, `-ctk q8_0 -ctv q8_0`, `--jinja`, `--reasoning on --reasoning-format deepseek --reasoning-budget 8192`, `--temp 0.7 --top-p 0.95 --top-k 64 --min-p 0.05 --repeat-penalty 1.0`.
- Latencia y throughput: 188,9 tok/s con decodificación especulativa activa; 138,6 tok/s sin ella. El contexto adicional solo consume memoria K/V.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento medido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-Defiance-Uncensored-MTP (este) | ~9B | 262.144 | 188,9 tok/s (Q4_K_M, MTP) | Apache 2.0 | GGUF en HF |
| HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive | ~9B | no disponible | no disponible | no disponible | HF (pesos base) |
| ttindall/Qwen3.8-27B-Defiance-Uncensored-MTP-GGUF | 27B | no disponible | no disponible | no disponible | GGUF en HF |
| DavidAU/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-NEO-MAX-MTP-GGUF | 27B | no disponible | no disponible | no disponible | GGUF en HF |

La comparativa directa con modelos de otros fabricantes no está disponible en la información proporcionada. Frente al 27B del mismo autor, este 9B ofrece menor profundidad de conocimiento a cambio de una huella de 8,8 GB y mayor velocidad, según advierte el propio autor.

## Limitaciones y advertencias

- Modelo sin censura: HauhauCS eliminó los rechazos de los pesos y la plantilla instruye a todos los modos a responder sin advertencias ni moralización. La responsabilidad legal y ética del contenido generado recae en el usuario.
- Riesgo de alucinación elevado en proporción al tamaño: el autor reconoce explícitamente que un 9B "sabe menos que un 27B" y que las respuestas serán más superficiales en todos los modos.
- Los modos persona consumen de 2.500 a 3.600 tokens de contexto en cada turno; sin 32K o más de ventana, el contexto útil se reduce drásticamente.
- Los modos solo moldean método y estructura, no añaden conocimiento que los pesos no tengan.
- La etiqueta `{REASON:x}` persiste durante el resto de la conversación; es necesario iniciar un chat nuevo al cambiar de modo.
- Un nombre de modo mal escrito devuelve error en lugar de degradar silenciosamente.
- Los GGUFs originales de Qwen3.5-9B no incluyen la cabeza MTP; sin el sidecar se pierde la aceleración especulativa, pero no otras funcionalidades.
- No hay información sobre sesgos específicos, cobertura idiomática ni evaluación de seguridad del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de refusals puede incumplir políticas de plataformas o normativa sectorial en determinados despliegues.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ttindall/Qwen3.5-9B-Defiance-Uncensored-MTP-GGUF
- Pesos base (HauhauCS): https://huggingface.co/HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive
- Sidecar MTP: https://huggingface.co/ttindall/Qwen3.5-9B-MTP-Sidecar-GGUF
- Variante 27B del mismo autor: https://huggingface.co/ttindall/Qwen3.8-27B-Defiance-Uncensored-MTP-GGUF
- Constructs originales (DavidAU Turbo-Brilliance): https://huggingface.co/DavidAU/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-NEO-MAX-MTP-GGUF
