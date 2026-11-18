# TypeScript/FastBrain-9B

## Resumen

FastBrain-9B es un modelo de decisión estructurada no autorregresivo de 9.410 millones de parámetros publicado por el usuario TypeScript en Hugging Face. Se construye sobre el backbone híbrido Qwen3.5-9B (inicializado desde Cloudflare/clef-flash) y añade una cabeza de decisión por atención cruzada de 116 millones de parámetros denominada JointSchemaHead. Su objetivo no es generar texto libre, sino resolver en una única pasada de prefill decisiones tipadas (elección entre opciones, clasificación binaria y puntuación ordinal) sobre estados JSON o multimodales, con `output_tokens = 0`.

El modelo aborda dos ineficiencias de los LLM autorregresivos en pipelines de agentes: la latencia que escala con la longitud de la salida y la mala calibración de las probabilidades a nivel de token en tareas de clasificación cerrada, enrutamiento de herramientas y verificación de seguridad. FastBrain-9B evalúa simultáneamente todas las preguntas y opciones candidatas en una sola pasada, leyendo los logits de las opciones desde los estados ocultos finales.

Es relevante ahora porque compite en la franja de 9B con modelos de 27B-35B en suites de decisión estructurada, manteniendo latencias por debajo de 100 ms en una sola GPU y cuantización GGUF de 8 y 4 bits. La licencia es Apache 2.0 y el repo ocupa 55,2 GB con pesos en safetensors y GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 32 capas (24 bloques Gated DeltaNet de atención lineal + 8 bloques de atención completa) con cabeza de decisión JointSchemaHead por atención cruzada |
| Parametros totales | 9.409.813.744 (9,41B): 9,30B de backbone + 116M de cabeza de decisión |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GGUF de 8 bits sin pérdida y 4 bits de alta retención (según model card) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (4 shards: model-00001-of-00004 a model-00004-of-00004 más joint_head.safetensors) y GGUF |

## Arquitectura y entrenamiento

El backbone es un transformer híbrido de 32 capas en bfloat16 que intercala 24 bloques de atención lineal Gated DeltaNet con 8 bloques de atención completa, con un máximo de 262.144 tokens de contexto. Durante el entrenamiento se actualizan 104 matrices de proyección en las 32 capas: `in_proj_qkv`, `in_proj_z` y `out_proj` en las capas de atención lineal, y `q_proj`, `k_proj`, `v_proj` y `o_proj` en las de atención completa, de forma conjunta con la cabeza de decisión. Todas las actualizaciones de bajo rango y proyecciones se pliegan directamente en los tensores base (sin adaptadores en inferencia), lo que elimina sobrecarga de adapter en el despliegue.

La cabeza JointSchemaHead (116M parámetros, en `joint_head.safetensors`) agrupa representaciones de tokens delimitadas por marcadores como `<|question_start|>`/`<|question_end|>` y aplica atención cruzada para leer los logits de las opciones. El objetivo de entrenamiento combina KL ordinal, distribución acumulada (ranked probability score) y regresión de valor esperado. El modelo se entrenó sobre el dataset TypeScript/FastBrain-Instruct. La model card menciona además una calibración de topología de esquema en tiempo de compilación y un kernel CUDA vectorizado para la cabeza, aunque el detalle completo no está disponible en la información proporcionada.

## Capacidades

- Decisión estructurada en una sola pasada (`output_tokens = 0`) sobre preguntas tipadas: `choice` (elección entre opciones), `noul` (binaria) y `score` (ordinal).
- Entrada multimodal de imagen y texto a salida tipada (`image-text-to-text`).
- Clasificación de intención y enrutamiento de herramientas (tool calling / function calling).
- Verificación de seguridad de trayectorias de agentes (guardrail de tool calls).
- Clasificación de uso indebido en 7 vías (misuse classification).
- Abstención en conjuntos abiertos (open-set abstention).
- Estimación de rúbricas ordinales.
- Soporte multilingüe limitado a inglés y chino.
- Compatible con endpoints y con llama.cpp, SGLang y transformers.

## Casos de uso

- Guardrail de agentes en producción: el modelo clasifica en 7 vías si una llamada a herramienta o una trayectoria de agente viola la política del sandbox; en la suite SafeAgents v2 intercepta 82/82 trayectorias inseguras con AUROC 0,985, por lo que puede colocarse como filtro previo a la ejecución real.
- Enrutamiento de herramientas en pipelines agénticos: dada una petición y un conjunto de esquemas de herramientas candidatos, selecciona la herramienta y los argumentos en una sola pasada de prefill, con latencia mediana de 50 ms, adecuado para bucles de agente de alta frecuencia.
- Clasificación de tickets de soporte o seguridad: al aceptar estado JSON arbitrario y preguntas tipadas, puede mapear tickets a categorías cerradas con probabilidades calibradas (mejor KL y Brier que la generación autorregresiva).
- Puntuación de rúbricas y evaluación automática: la salida de tipo `score` ordinal permite puntuar respuestas o trazas según criterios definidos, útil en sistemas de evaluación de calidad y RLHF.
- Verificación de cumplimiento en tiempo de compilación de esquemas: la calibración de topología de esquema permite fijar el conjunto de decisiones antes del despliegue y validar que las opciones emitidas son válidas.
- Atención al cliente automatizada con decisiones cerradas: para triaje y derivación de conversaciones multi-turno, el contexto de 262.144 tokens permite incluir historiales largos y el estado estructurado del cliente en una sola pasada.
- Detección de abstención en dominios abiertos: la capacidad de open-set abstention permite derivar a revisión humana los casos fuera de distribución en lugar de forzar una etiqueta.

## Benchmarks y rendimiento

| Suite | Metrica | Resultado | Ranking |
|---|---|---|---|
| safeagents-judge-bench v2 (7 vías) | Macro-F1 | 0,751 | 1 de 8 |
| safeagents-judge-bench v2 (7 vías) | Accuracy | 0,858 | 1 de 8 |
| safeagents-judge-bench v2 (intercepción) | Trayectorias inseguras interceptadas | 82/82 (AUROC 0,985) | no disponible |
| LocalLLaMA/typed-decisions (zero-shot) | Overall | 0,7525 | 7 de 43 (5 de 36 open-weight; 2 de 19 en ≤9B) |
| LocalLLaMA/typed-decisions | Latencia mediana | 50 ms | 66,7× más rápido que Quyet-1.0-Large (31B) |
| Cloudflare Decision Index v0.2.1 | Macro mean 10 tareas | 80,55% | 2 de 7 |
| Calibración prior-only (sin actualizar pesos) | Accuracy / KL | 0,797 / 0,0816 | 12 empatado (14 listado de 51) |

Según la model card, FastBrain-9B supera en 18,8 puntos porcentuales a Cloudflare/clef (27,4B) en macro-F1 de safeagents-judge-bench v2, y supera a ese mismo modelo en 5 de 10 tareas del Decision Index. Queda 1.º en 10 de 10 tareas entre modelos ≤9B del Decision Index. No se han publicado en la información disponible resultados de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: en bfloat16, aproximadamente 19 GB solo para pesos (9,41B × 2 bytes), más overhead de contexto y cabeza; en GGUF de 8 bits, en torno a 10-11 GB; en GGUF de 4 bits, en torno a 6-7 GB.
- GPU recomendadas: A100 40/80 GB o H100 para bfloat16 con contexto largo; RTX 4090 (24 GB) suficiente para bfloat16 en contextos moderados y para GGUF de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 con cuantización de 8 o 4 bits; en GPUs de 12-16 GB probablemente solo con 4 bits y contexto reducido.
- Opciones de despliegue: transformers, llama.cpp, SGLang y endpoints compatibles; la model card menciona compatibilidad con endpoints.
- Latencia y throughput: latencia mediana de 50 ms en LocalLLaMA/typed-decisions según la model card; no se dispone de cifras de throughput (tokens/s) porque el modelo no genera tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastBrain-9B | 9,41B | 262.144 | 0,751 macro-F1 en SafeAgents v2; 80,55% en Decision Index | Apache 2.0 | Hugging Face |
| Cloudflare/clef | 27,4B | no disponible | 0,563 macro-F1 en SafeAgents v2 (18,8 pp menos); 5 de 10 tareas del Decision Index superadas por FastBrain-9B | no disponible | Hugging Face |
| Cloudflare/clef-flash | no disponible | no disponible | 46,2% macro-F1 en SafeAgents v2; 66,77% en CLINC150+OOS | no disponible | Hugging Face (modelo base) |
| Quyet-1.0-Large | 31B | no disponible | 66,7× más lento que FastBrain-9B en typed-decisions | no disponible | Hugging Face |

## Limitaciones y advertencias

- El modelo está diseñado para decisiones estructuradas de esquema cerrado; no es un generador de texto libre y no debe usarse como chat general.
- Idiomas soportados limitados a inglés y chino; el rendimiento en castellano no está documentado.
- Riesgo de alucinación reducido por el formato cerrado, pero las probabilidades de opciones pueden estar mal calibradas fuera de la distribución de entrenamiento.
- La model card reporta resultados en suites propias y de terceros (SafeAgents, LocalLLaMA/typed-decisions, Cloudflare Decision Index); la reproducibilidad independiente no está verificada.
- El ranking 7 de 43 en typed-decisions zero-shot indica que no es el mejor modelo global en esa suite, solo en la clase ≤9B.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las licencias del modelo base (Cloudflare/clef-flash) y del dataset FastBrain-Instruct.
- El repo de 55,2 GB incluye múltiples formatos; el despliegue en producción requiere seleccionar el shard o GGUF adecuado.
- La información sobre sesgos demográficos o de dominio no está disponible en la documentación proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/TypeScript/FastBrain-9B
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
- Dataset de entrenamiento: https://huggingface.co/datasets/TypeScript/FastBrain-Instruct
- README en chino: https://huggingface.co/TypeScript/FastBrain-9B/blob/main/README_zh.md
- Licencia: https://huggingface.co/TypeScript/FastBrain-9B/blob/main/LICENSE
- Resultados de búsqueda web: no se han encontrado enlaces adicionales relevantes sobre el modelo (los resultados devueltos corresponden al lenguaje TypeScript, no al modelo).
