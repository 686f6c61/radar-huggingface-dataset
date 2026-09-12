# violetxi/hparam-92m-block-mtp-truncated-peak_lr-1e-3-wu-0p01-s42

## Resumen

El modelo `violetxi/hparam-92m-block-mtp-truncated-peak_lr-1e-3-wu-0p01-s42` es un modelo de lenguaje de 92.138.496 parámetros publicado por el usuario violetxi en HuggingFace. No es un modelo de propósito general: está especializado en ajedrez y genera secuencias de jugadas en una notación compacta de pieza y casillas (por ejemplo, `Pe2e4 Pe7e5 Ng1f3`). Su etiqueta de arquitectura es `looped_block_mtp`, un núcleo recurrente de pesos compartidos que combina predicción multi-token por bloques de tres con entrenamiento mediante retropropagación truncada en el tiempo (truncated BPTT).

La característica diferencial está en el esquema de evaluación y decodificación: cada pasada recurrente puntúa tres posiciones de consulta fijas y causalmente ordenadas, de modo que `generate()` confirma un bloque de tres tokens antes de iniciar el siguiente bloque recurrente. El contexto es de 1.024 tokens lógicos (incluido el bloque de consulta) y el token de máscara (ID 81) no puede generarse. No admite caché KV ni búsqueda por haz, lo que condiciona directamente su coste de inferencia.

El repositorio es el resultado de un barrido de hiperparámetros: el nombre codifica el pico de learning rate (1e-3), el calentamiento (0,01) y la semilla (42), y cada checkpoint vive en su propia rama `step-N`; esta ficha corresponde al paso 80.000. Su interés actual es el de banco de pruebas reproducible para arquitecturas recurrentes con pesos compartidos y predicción multi-token, más que el de motor de ajedrez listo para producción: el propio autor indica que la publicación no ejecuta inferencia de benchmark y que la selección de condiciones queda sujeta a las reglas de validación y colapso del barrido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `looped_block_mtp`: núcleo recurrente de pesos compartidos con predicción multi-token en bloques de 3 tokens |
| Parámetros totales | 92.138.496 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 1.024 tokens lógicos, incluido el bloque de consulta de 3 tokens |
| Tipos de cuantización | no disponible (solo se publican pesos en safetensors; no hay GGUF, AWQ, GPTQ ni variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de dominio específico de ajedrez; no orientado a lenguaje natural) |
| Licencia | no disponible (la model card solo menciona las licencias del código de núcleo adaptado, no una licencia del modelo) |
| Formato de pesos | safetensors (acompañado de config, tokenizer y código compartido; requiere `trust_remote_code=True`) |
| Tamaño del repositorio | 9,2 GB (incluye archivos nativos con estado de optimizador y RNG, no necesarios para inferencia) |
| Revisiones | una rama por checkpoint (`step-N`); esta ficha usa `step-80000` |
| Modalidad | texto (secuencias de jugadas de ajedrez) |
| Librería | transformers |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer de bloques recurrentes con pesos compartidos entre pasadas, no un transformer denso convencional. Cada pasada recurrente evalúa tres posiciones de consulta fijas y causalmente ordenadas, y la salida del modelo por bloque se obtiene con `model.block_logits(input_ids)`, que devuelve un tensor `[batch, 1, 3, vocab]` con la predicción del siguiente bloque de tres tokens. El entrenamiento emplea retropropagación truncada en el tiempo (truncated BPTT) sobre el núcleo recurrente y una pérdida de bloque densa y no solapada registrada en el modelo: `model(input_ids, labels=input_ids)` hace que `logits[:, t]` puntúe el token `t+1`, y cada grupo de tres tokens ve únicamente el prefijo anterior a ese grupo. El autor subraya explícitamente que esto no es un NTP con teacher forcing ordinario, por lo que las métricas de pérdida no son comparables con las de un modelo autorregresivo estándar.

Los datos de entrenamiento son partidas de ajedrez, pero no se especifica en la información disponible ni el número de tokens, ni la composición del dataset, ni si hubo fases de RLHF o DPO. La condición experimental documentada es `92m-blktrunc-lr1e3-wu01-s42`, correspondiente a un pico de learning rate de 1e-3, un calentamiento del 1 % y semilla 42. El repositorio incluye `requirements.txt`, el tokenizer, el código de núcleo compartido y un `training_summary.json` que vincula la exportación con la suma de comprobación del modelo nativo y las versiones del código fuente. Los valores de safetensors preservan exactamente los tensores nativos; el estado de optimizador y de recuperación de la semilla RNG permanece en el archivo nativo y no es necesario para inferencia.

## Capacidades

- Generación de jugadas de ajedrez en notación compacta de pieza y casillas (`Pe2e4`, `Ng1f3`), con un token por jugada.
- Predicción multi-token por bloques de tres: `model.block_logits()` devuelve `[batch, 1, 3, vocab]` para el bloque siguiente.
- Decodificación por bloques en `generate()`: se confirman tres tokens antes de la siguiente pasada recurrente.
- Muestreo y generación greedy, con soporte de `num_return_sequences` y de padding.
- Inferencia en CPU o GPU mediante `transformers` con `trust_remote_code=True` y carga en `bfloat16`.
- No soporta caché KV ni búsqueda por haz (beam search).
- El token de máscara (ID 81) no puede generarse; queda reservado por el esquema de evaluación.
- No hay evidencia de tool calling ni function calling.
- No hay evidencia de modo de razonamiento explícito (thinking mode), visión, audio ni flujos de agente multi-paso.
- Capacidades multilingües: no aplicables al dominio del modelo; no disponible.
- No hay indicios de ajuste por instrucciones (instruction tuning).

## Casos de uso

- Completado de partidas de ajedrez: dado un prefijo de jugadas en el formato del tokenizer, el modelo propone continuaciones de tres jugadas por bloque. Es adecuado para reconstruir secuencias truncadas en bases de datos de partidas, siempre que se validen después las reglas legales con un motor externo.
- Anotación y enriquecimiento de ficheros PGN: rellenar jugadas ausentes o proponer variantes plausibles en un PGN incompleto, aprovechando que el contexto de 1.024 tokens cubre aproximadamente 1.023 plies (unas 511 jugadas completas) si se reserva el bloque de consulta.
- Banco de pruebas para arquitecturas recurrentes con pesos compartidos: el repositorio publica un checkpoint por paso en ramas `step-N`, junto con `training_summary.json` y la implementación exacta del núcleo, lo que permite reproducir el experimento y estudiar el efecto del truncated BPTT frente a un transformer denso de tamaño similar.
- Investigación en predicción multi-token: el esquema de bloques de tres con logits `[batch, 1, 3, vocab]` sirve para medir el acierto de una decodificación por bloques frente a la decodificación token a token, y para estudiar el equilibrio entre paralelismo de decodificación y calidad.
- Replicación de barridos de hiperparámetros: comparar esta condición (`lr=1e-3`, `wu=0,01`, `seed=42`) con otras condiciones del mismo barrido, usando las reglas de validación y colapso del autor como criterio de selección, para analizar sensibilidad a la tasa de aprendizaje y a la semilla.
- Generación de datos sintéticos para ajedrez: producir continuaciones de partidas para aumentar un corpus de entrenamiento destinado a otros modelos, con filtrado obligatorio por legalidad y por evaluación de motor.
- Material didáctico de ajedrez con supervisión humana: ilustrar planes y continuaciones típicas a partir de una posición dada, aceptable en entornos de baja exigencia siempre que un motor verifique las jugadas antes de mostrarlas.
- Pruebas de integración en pipelines de ML: al pesar solo unos cientos de megabytes en `bfloat16`, es útil como modelo de humo para validar infraestructura de despliegue con código remoto, tokenizer propio y decodificación por bloques.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica de forma explícita que «benchmark inference is not performed by publication» y que la selección de condiciones queda gobernada por las reglas de validación y colapso del barrido. No se dispone de cifras de perplejidad, precisión de jugada legal, Elo estimado, MMLU, HumanEval, GSM8K ni de ninguna otra métrica para este checkpoint.

## Requisitos de hardware

- Huella de pesos: aproximadamente 184 MB en `bfloat16` (92,1 M de parámetros × 2 bytes), 369 MB en `float32`, 92 MB en int8 y 46 MB en int4 (estimaciones teóricas de tamaño; el autor no publica cuantizaciones).
- El repositorio completo ocupa 9,2 GB porque incluye archivos nativos con estado de optimizador y RNG, que no se descargan ni se necesitan para inferencia.
- Cabe sin problema en cualquier GPU de consumo con 2 GB o más de VRAM, incluidas GTX 1650, RTX 3060, RTX 4060 y RTX 4090; también funciona en CPU.
- GPU de datacenter (A100, H100) no aportan ventaja relevante para inferencia dado el tamaño del modelo; su utilidad se limitaría al entrenamiento o a la reproducción del barrido.
- Despliegue: `transformers` con `trust_remote_code=True` es la vía soportada. No hay pesos GGUF, por lo que llama.cpp y Ollama no pueden ejecutarlo sin conversión manual y una implementación propia del núcleo. vLLM y TGI no son compatibles de forma estándar, ya que la ausencia de caché KV y el código personalizado quedan fuera de sus supuestos de decodificación.
- Coste de inferencia: sin caché KV, cada bloque de tres tokens exige repasar el prefijo completo, de modo que el coste crece de forma aproximadamente cuadrática con la longitud de la secuencia y la latencia por token aumenta a medida que avanza la generación.
- Latencia y throughput concretos: no disponible (no publicados por el autor).

## Comparativa con modelos similares

No se han identificado en la información disponible modelos comparables directos: no hay otros modelos públicos documentados con la combinación de núcleo recurrente de pesos compartidos, predicción multi-token en bloques de tres, truncated BPTT y dominio ajedrecístico. A modo de referencia de tamaño, se incluyen dos modelos pequeños de propósito general; sus datos proceden de conocimiento público externo y no de la model card de este repositorio, y no existe comparación de rendimiento disponible entre ellos y el modelo descrito.

| Modelo | Parámetros | Contexto | Licencia | Naturaleza |
|---|---|---|---|---|
| `violetxi/hparam-92m-block-mtp-...-s42` | 92,1 M | 1.024 tokens | no disponible | Recurrente con pesos compartidos, bloques de 3, dominio ajedrez, sin caché KV |
| GPT-2 (124M) | 124 M | 1.024 tokens | MIT modificada | Referencia externa: transformer denso, NTP estándar |
| Pythia-70M | 70 M | 2.048 tokens | Apache 2.0 | Referencia externa: transformer denso, NTP estándar |

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna métrica publicada de calidad de jugada, legalidad o perplejidad. Cualquier evaluación de idoneidad debe realizarse por cuenta propia.
- Riesgo de colapso entre checkpoints: el autor indica que la selección de condiciones depende de las reglas de validación y colapso del barrido, lo que implica que no todos los checkpoints publicados son utilizables.
- Licencia no especificada: al no declararse licencia del modelo, no puede asumirse permiso de uso comercial. Las únicas licencias mencionadas corresponden al código de núcleo adaptado.
- Ejecución de código remoto: la carga requiere `trust_remote_code=True`, lo que implica ejecutar código publicado por el autor; conviene revisarlo antes de usarlo en producción.
- Sin caché KV ni beam search: limitación estructural de rendimiento y de estrategias de decodificación disponibles.
- Ventana de contexto fija de 1.024 tokens lógicos: las partidas más largas requieren truncado o ventanas deslizantes, con pérdida de información del inicio.
- Dominio cerrado: no hay soporte de lenguaje natural, ni capacidades multilingües, ni visión, audio, tool calling o razonamiento multi-paso.
- Riesgo de generar jugadas ilegales: la model card no documenta ninguna validación de legalidad de las jugadas; el filtrado con un motor de reglas es imprescindible.
- Formato de tokens propio: la notación de jugada y el tokenizer son específicos, lo que complica la interoperabilidad con herramientas de ajedrez estándar.
- Restricción de generación: el token de máscara (ID 81) no puede producirse, lo que debe tenerse en cuenta al interpretar la salida.
- Dependencia de la revisión: el código de ejemplo fija `revision="step-80000"`; cargar otra rama cambia los pesos y puede alterar el comportamiento.
- Trazabilidad parcial: `training_summary.json` vincula la exportación con la suma de comprobación nativa, pero no se documentan el dataset exacto, el número de tokens ni el régimen de entrenamiento.
- Los resultados de búsqueda web asociados a esta consulta no contenían información relacionada con el modelo (trataban sobre la carga del ion calcio), por lo que no aportan datos verificables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/violetxi/hparam-92m-block-mtp-truncated-peak_lr-1e-3-wu-0p01-s42
- Rama del checkpoint documentado (paso 80.000): https://huggingface.co/violetxi/hparam-92m-block-mtp-truncated-peak_lr-1e-3-wu-0p01-s42/tree/step-80000
- Paper, repositorio de código independiente, blog o demo: no disponible.
- Enlaces relevantes adicionales encontrados en la búsqueda web: ninguno (los resultados devueltos no guardaban relación con el modelo).
