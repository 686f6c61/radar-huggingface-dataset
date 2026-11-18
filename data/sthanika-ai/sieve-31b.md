# sthanika-ai/Sieve-31B

## Resumen

Sieve-31B es un adaptador LoRA de tipo "decision model" desarrollado por Sthānika AI sobre el modelo base `google/gemma-4-31B-it` (revisión `842da37`). A diferencia de un modelo generativo convencional, Sieve-31B no produce texto: recibe un estado (texto o JSON) y una serie de preguntas tipadas, y devuelve una distribución de probabilidad sobre las opciones de cada pregunta. Está diseñado específicamente para tareas de clasificación y decisión estructurada, no para generación libre.

El adaptador tiene rango 128 (α=128) y se aplica sobre las proyecciones `q/k/v/o/gate/up/down_proj` de las 60 capas de texto del backbone, sumando 979 millones de parámetros entrenables sobre los 31B del modelo base. Soporta tres tipos de pregunta: `choice` (selección entre 2 y 255 claves), `noul` (sí/no) y `score` (nivel esperado sobre una escala ordinal de 2 a 10 niveles).

Su relevancia radica en el enfoque: en lugar de pedir a un LLM que genere una respuesta y parsearla, Sieve lee el estado una vez por pregunta y puntúa directamente las opciones mediante el producto del hidden state final con las filas de la capa de salida correspondientes a los tokens de etiqueta (A, B, …, hasta 255). Esto elimina el riesgo de formatos inválidos y permite calibrar probabilidades con una temperatura fija de 8.5495. Está publicado bajo licencia Apache 2.0 y solo declara soporte para inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (r=128, α=128) sobre transformer decoder `google/gemma-4-31B-it`; diseño de "answer slots" |
| Parámetros totales | 31B (modelo base) + 979M (adaptador LoRA entrenable) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens por fila de prompt (estado + una pregunta) |
| Tipos de cuantización | no disponible (el autor reporta ejecución en bf16; no se documentan GGUF, GPTQ ni AWQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT, aplicado sin fusionar) |

## Arquitectura y entrenamiento

Sieve-31B es un adaptador PEFT de rango 128 y α=128 aplicado sobre las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y de MLP (`gate_proj`, `up_proj`, `down_proj`) de las 60 capas de texto del backbone Gemma 4 de 31B. El adaptador se aplica siempre sin fusionar con el modelo base, tanto en entrenamiento como en inferencia, y se carga en la revisión fijada `842da37` del modelo base.

El mecanismo de decisión es distintivo: cada pregunta se formula como un turno de usuario en la plantilla de chat de Gemma (con el modo "thinking" desactivado), seguido de un slot `Answer: (`. En ese slot, el hidden state final se multiplica por las filas de la capa de salida correspondientes a los tokens de etiqueta de las opciones (A, B, …, hasta 255), y un softmax a temperatura fija T=8.5495 produce las probabilidades. El modelo nunca genera texto, no trunca, descarta ni reordena opciones, no ajusta prompts por benchmark y no ve etiquetas gold. No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se empleó RLHF o DPO.

## Capacidades

- Clasificación de decisión tipada en tres modalidades: `choice` (2 a 255 opciones con claves del solicitante, opcionalmente descritas), `noul` (sí/no con P(yes)) y `score` (escala ordinal de 2 a 10 niveles con nivel esperado y confianza).
- Salida de distribuciones de probabilidad calibradas por opción, no de texto libre.
- Procesamiento de estados en texto plano o JSON, con lectura única por pregunta.
- Manejo de hasta 255 opciones por pregunta y 32.768 tokens por fila de prompt; las peticiones que exceden estos límites se rechazan como `Unsupported`.
- Recuperación ante out-of-memory: reduce a la mitad el chunk de forward y reintenta; si una fila individual no cabe, lanza error para reintento en ejecución reanudada.
- No soporta tool calling, function calling, agentes multi-step, visión, audio ni modo thinking; su única función es la decisión tipada.
- Capacidades multilingües: solo inglés declarado.

## Casos de uso

- Triaje de tickets de soporte: dado un asunto y cuerpo de correo como estado, se formulan preguntas `choice` para asignar departamento (billing, technical, etc.) y `noul` para detectar riesgo de cancelación, devolviendo probabilidades por categoría en lugar de texto parseable.
- Enrutamiento de incidencias en producción: con un JSON de evento de error como estado, se clasifica la severidad mediante `score` sobre una escala ordinal y se decide la cola de escalado con `choice`, aprovechando las 255 opciones disponibles para catálogos amplios de equipos.
- Moderación y clasificación de contenido: se puntúan políticas de cumplimiento con preguntas `noul` o `score`, obteniendo confianza calibrada que permite fijar umbrales de revisión humana.
- Enriquecimiento de datos para pipelines de ML: etiquetado automático de grandes volúmenes de registros con distribuciones de probabilidad por etiqueta, útiles para entrenar modelos posteriores o para auditoría de etiquetas existentes.
- Evaluación de riesgo en atención al cliente: combinación de `score` para sentimiento y `noul` para intención de churn sobre conversaciones o correos, con salida estructurada lista para un CRM.
- Sistemas de decisión con umbral de abstención: al devolver probabilidad por opción, se puede derivar a revisión humana cuando la confianza máxima cae por debajo de un umbral, algo imposible con un LLM generativo sin post-procesado.
- Clasificación documental en back-office: con hasta 32.768 tokens por fila, se puede incluir un documento largo junto a la pregunta y clasificarlo en categorías predefinidas con `choice`.

## Benchmarks y rendimiento

| Benchmark | Métrica | Valor | Verificado |
|---|---|---|---|
| Decision Index 0.4.1, Full score (leaderboard, datos de 2026-10-26) | decision_index | 64,25 | No |
| Decision Index 0.3, índice público (chance-corrected, suite de 140.178 peticiones, media de 37 benchmarks) | decision_index | 62,52 | No |

Los valores proceden del `model-index` declarado por el autor y no están verificados de forma independiente. El modelo dejó de aparecer en el leaderboard de Decision Index 0.4.1 desde el 2026-10-28. No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 83 GB en bf16, incluyendo la caché de PyTorch.
- GPU recomendada: una GPU de 96 GB (por ejemplo, H100 96GB o A100 80GB no sería suficiente en una sola unidad según el dato del autor); alternativa de dos GPUs con reparto mediante `--option split='{"0": "40GiB", "1": "40GiB"}'`.
- No cabe en GPU de consumo (RTX 4090, 24 GB) en bf16; no se documentan cuantizaciones que lo permitan.
- Opciones de despliegue: servidor incluido `sieve-serve --model sthanika-ai/Sieve-31B`; integración vía el paquete `sieve` (`load_sieve`, `decide`) con `transformers==5.17.0`, `peft==0.21.0`, `accelerate==1.15.0` y `torch==2.8.0` (CUDA 12.8). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sieve-31B | 31B + 979M LoRA | 32.768 tokens por fila | Decisión tipada con probabilidades por opción | Apache 2.0 | Hugging Face (adaptador PEFT) |
| `google/gemma-4-31B-it` (base) | 31B | no disponible | Generación de texto instruct | Términos de Gemma (no Apache 2.0) | Hugging Face |
| Alternativas de clasificación de mismo tamaño | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparables con otros modelos de decisión o clasificación en la información proporcionada.

## Limitaciones y advertencias

- Solo admite inglés; no se declara soporte multilingüe.
- No genera texto: no es adecuado para tareas de generación, resumen, código ni razonamiento abierto.
- Límite estricto de 255 opciones por pregunta y 32.768 tokens por fila; las peticiones mayores se rechazan.
- La temperatura está fijada en 8.5495 (la de entrenamiento); no es configurable y afecta a la calibración de las probabilidades.
- Los resultados de benchmarks son declarados por el autor y no verificados; el modelo dejó de figurar en el leaderboard 0.4.1 desde el 2026-10-28.
- Requiere versiones muy específicas de dependencias (`torch==2.8.0`, `transformers==5.17.0`, `peft==0.21.0`, `decider-ai==1.6.0`), lo que puede complicar la integración en entornos existentes.
- El adaptador debe aplicarse sin fusionar con el modelo base en la revisión `842da37`; desviarse de esa revisión puede alterar el comportamiento.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de calibración deficiente en dominios alejados de los datos de entrenamiento, y no se documentan sesgos conocidos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Gemma tiene sus propios términos que deben respetarse.

## Enlaces

- Hugging Face: https://huggingface.co/sthanika-ai/Sieve-31B
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Colección Sieve: https://huggingface.co/collections/sthanika-ai/sieve-6abb93a61dd495f69811c586
- Repositorio de código: https://github.com/sthanika-ai/Sieve
- Sitio de Sthānika AI: https://sthanika.ai/
- Sitio de Sieve: https://sieve.one/
- Leaderboard Decision Index: https://huggingface.co/spaces/multimodalart/jev-decision-index
- Kit Decision Index: https://github.com/apolinario/decision-index
