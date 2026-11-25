# YellowPlus/AirDecision-4B-v1.3

## Resumen

AirDecision-4B-v1.3 es un modelo de decisión estructurada desarrollado por YellowPlus, publicado como versión autónoma y autocontenida de su modelo `base-v6-hardsynth-half-soft-clean-aa-v5`, seleccionado en el paso 992 de 992 del entrenamiento. Se construye mediante fine-tuning supervisado sobre `unsloth/Qwen3.5-4B`, un modelo multimodal de 4.539.265.536 parámetros (4,54 mil millones) con torre de visión congelada, y adopta la formulación de `<decision>` enmascarada del proyecto Intern-Decision. Su propósito no es generar texto libre, sino puntuar preguntas de tipo `choice`, `noul` (probabilidad binaria) y `score` (expectativa ordinal) en un único forward pass causal, con cero tokens generados.

La relevancia del modelo radica en su contrato de inferencia: una sola pasada determinista, sin cadena de pensamiento, sin muestreo, sin reintentos ni ensembles, con calibración nativa casi unitaria gracias a temperature scaling post-hoc (`T = 0.97893069720783`, almacenado en `calibration/calibration.json`). Esto lo hace adecuado para cargas de trabajo de decisión de una sola pasada donde la latencia y la reproducibilidad son críticas, como routers de herramientas, clasificadores de intención o evaluadores automáticos.

La versión 1.3 amplía el conjunto de entrenamiento respecto a la 1.2 (de 72.283 filas y 111.252 decisiones a 87.065 filas y 131.135 decisiones, de las cuales 108.874 están supervisadas con distribuciones de probabilidad completas), añade elementos sintéticos de uso de herramientas, preguntas de conocimiento difícil con objetivos deliberadamente inciertos y variantes de orden de opciones, y modifica la política del servidor para que las respuestas sí/no en `/v1/systemone` se comprometan con un lado (nunca dentro del intervalo (0,19, 0,81)).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (transformer multimodal con torre de visión congelada), formulación Intern-Decision de `<decision>` enmascarada |
| Parametros totales | 4.539.265.536 (4,54 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens de entrada (truncación prohibida; entradas sobredimensionadas devuelven HTTP 422 antes de tocar CUDA) |
| Tipos de cuantizacion | no disponible (pesos en `bfloat16`; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen3.5-4B` (commit `3764fa359b9082ea5a1e4a5e3ac3aaf6e9671636`) con la torre de visión congelada y aplica la formulación de decisión enmascarada de Intern-Decision (commit `565350244af860e1c276768cd80bdd9b8be93913`). La inferencia se realiza en `bfloat16` con atención `sdpa` nativa de PyTorch, sin necesidad del runtime XTuner. El protocolo de decisión consiste en un único prefill causal sobre un esqueleto de asistente con `<decision>` enmascarado, que produce puntuaciones para hasta 62 símbolos de un solo token (`A–Z`, `a–z`, `0–9`) por pregunta y hasta 16 preguntas por petición.

El entrenamiento emplea entropía cruzada sobre distribuciones suaves (`-sum_i p_i log q_i` en las posiciones `<decision>`) en lugar de etiquetas one-hot, con 87.065 ejemplos y 131.135 decisiones tipadas, de las cuales 108.874 están supervisadas sobre distribuciones completas. Los objetivos se gradúan según la certeza: los ítems verificados e inequívocos reciben objetivos afilados (0,97) y las preguntas que los etiquetadores o la versión anterior no pudieron responder reciben objetivos planos. Los datos añadidos respecto a v1.2 incluyen `toolreply-synth-v1` (4.270 filas de uso de herramientas totalmente sintéticas, con dos pasadas ciegas del modelo etiquetador en modo thinking off/on), `hard-knowledge-v1` y `-v2` (1.515 + 3.489 preguntas de nivel de posgrado con 5–26 opciones), variantes de orden de opciones y nombres de clave (4.986 filas) y 522 filas de documentos laborales sembradas con O*NET-SOC donde dos rondas de etiquetado discreparon. Se aplicó una compuerta de descontaminación de 1.544.101 referencias sobre cada fila añadida, más una auditoría posterior contra 18 conjuntos de evaluación.

## Capacidades

- Puntuación de preguntas de opción múltiple (`choice`) en una sola pasada causal, con hasta 62 opciones de un solo token y hasta 16 preguntas por petición.
- Probabilidad binaria (`noul`) para preguntas de sí/no, con política `commit` en el servidor que evita respuestas en el intervalo (0,19, 0,81).
- Expectativa ordinal (`score`) para preguntas con escala ordenada.
- Calibración nativa casi unitaria mediante temperature scaling post-hoc (`T = 0.97893069720783`).
- Inferencia determinista sin generación de tokens (`output_tokens = 0`), sin CoT, sin muestreo, sin reintentos ni ensembles.
- Capacidad multimodal heredada del modelo base (torre de visión congelada), si bien la model card no documenta tareas de visión específicas para esta versión.
- Servidor HTTP compatible con TypeSafe en loopback (`serve.py`, `serve.sh`), solo con biblioteca estándar, con verificación SHA-256 de la calibración en memoria.
- Ejecución en contenedores de evaluación con `--network none --read-only`.
- No se documenta soporte de tool calling generativo, agentes multi-paso ni otras capacidades más allá de la puntuación de decisiones.

## Casos de uso

- Enrutamiento de herramientas en asistentes: el modelo puede decidir en una sola pasada si una petición de usuario requiere una llamada a herramienta, una petición de detalle faltante, una negativa o una respuesta directa, gracias a los ítems sintéticos `toolreply-synth-v1` con objetivos afilados (0,97) sobre la respuesta correcta.
- Evaluación automática de benchmarks de decisión: su contrato determinista y su calibración nativa permiten reproducir puntuaciones en JevBench y otros conjuntos sin variabilidad de muestreo, integrándose en pipelines de CI para detectar regresiones entre versiones.
- Clasificación de intención en atención al cliente: con hasta 62 opciones por pregunta y 16 preguntas por petición, puede mapear un mensaje a una taxonomía amplia de intenciones en un único forward pass, con latencia predecible.
- Filtrado de incertidumbre en preguntas de conocimiento: los objetivos planos en preguntas de nivel de posgrado enseñan al modelo a responder con baja confianza cuando no sabe, lo que permite descartar automáticamente respuestas poco fiables antes de escalarlas a un humano.
- Puntuación ordinal de calidad o severidad: la salida `score` (expectativa ordinal) sirve para clasificar reseñas, tickets o incidentes en escalas ordenadas con una única pasada.
- Servicio de decisiones en entornos aislados: el servidor de solo biblioteca estándar con verificación SHA-256 y ejecución en contenedores de solo lectura sin red encaja en evaluaciones reproducibles y entornos con requisitos estrictos de aislamiento.
- Enrutamiento de consultas en sistemas RAG: decidir si una consulta debe responderse con el contexto recuperado, reformularse o derivarse a otra fuente, con la política `commit` evitando respuestas ambiguas en el endpoint `/v1/systemone`.

## Benchmarks y rendimiento

| Benchmark | v1.2 | v1.3 |
|---|---:|---:|
| Media de precisión en siete suites (splits públicos) | 91,38 | 91,70 |
| JevBench Hard (público, 111 ítems) | 86 | 85 |
| Precisión de selección en held-out | 0,8057 | 0,8120 |
| Typed Decision (test, soft-gold): accuracy | 0,7915 | 0,8055 |
| Typed Decision (test, soft-gold): KL | 0,0791 | 0,0798 |
| Typed Decision (test, soft-gold): Brier | 0,0432 | 0,0425 |
| Typed Decision (test, soft-gold): ECE | 0,149 | 0,149 |
| Proxy de autotest de componentes públicos de AA DI v2 (no es una puntuación AA) | 66,18 | 68,00 |
| Proxy de simetría de fraseo/orden (120 ítems, todas las formas dentro de 5 pp) | 77 | 79 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar de generación en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en `bfloat16`: aproximadamente 9,1 GB solo para pesos (tamaño del repo), más overhead de activaciones y contexto; se recomienda al menos 12–16 GB de VRAM para contextos largos.
- GPU recomendadas: A100, H100, L40S o RTX 4090 para inferencia en `bfloat16`; GPU consumer de 16 GB o más (RTX 4080, RTX 4090, RTX 5090) para contextos moderados.
- Cabe en GPU consumer de gama alta; no se documentan cuantizaciones que permitan reducir por debajo de 8 GB.
- Opciones de despliegue: `transformers` nativo con `inference.py` (motor offline) y `serve.py`/`serve.sh` (servidor HTTP de solo biblioteca estándar compatible con TypeSafe en loopback); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras concretas; el contrato de cero tokens generados y una sola pasada determinista implica latencia acotada por el prefill del contexto de entrada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AirDecision-4B-v1.3 | 4,54 mil millones | 8.192 | Decisión estructurada (choice/noul/score) | Apache 2.0 | Hugging Face |
| AirDecision-4B-v1.2 | 4,54 mil millones (base Qwen3.5-4B) | 8.192 | Decisión estructurada | Apache 2.0 | Hugging Face |
| Qwen3.5-4B (base) | 4,54 mil millones | no disponible | Generación multimodal | no disponible | Hugging Face (unsloth) |

No se dispone de datos de benchmarks comparables con modelos de la misma categoría de decisión estructurada en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no se documentan capacidades multilingües.
- No genera texto: no sirve para tareas de generación, resumen, traducción ni diálogo abierto.
- Contexto máximo de 8.192 tokens de entrada, sin truncación permitida; las entradas sobredimensionadas devuelven HTTP 422.
- La política `commit` en `/v1/systemone` fuerza respuestas sí/no fuera del intervalo (0,19, 0,81), lo que puede reducir la expresividad de la incertidumbre en ese endpoint.
- Respecto a v1.2, JevBench Hard baja un ítem y el KL de Typed Decision empeora ligeramente; When2Call presenta más respuestas erróneas con confianza ≥ 0,95, consecuencia de los objetivos más afilados en respuestas de herramientas.
- Riesgo de alucinación en preguntas de conocimiento: aunque los objetivos planos mitigan la sobreconfianza (la confianza ≥ 0,7 en preguntas estilo HLE bajó del 35% al 22%), el modelo puede seguir produciendo puntuaciones altas en ítems que no domina.
- La calibración depende de un archivo `calibration/calibration.json` verificado por SHA-256; su alteración o ausencia invalida las garantías de calibración.
- El modelo no ha sido auditado para sesgos demográficos o sociales en la información disponible; los conjuntos de datos incluyen filas sembradas con O*NET-SOC de documentos laborales, lo que puede introducir sesgos ocupacionales.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los datasets de terceros (`LocalLLaMA/typed-decisions`, `nvidia/When2Call`) pueden imponer condiciones adicionales que deben revisarse.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no existe validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YellowPlus/AirDecision-4B-v1.3
- Versión anterior: https://huggingface.co/YellowPlus/AirDecision-4B-v1.2
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- Repositorio Intern-Decision: https://github.com/InternLM/Intern-Decision
- JevBench: https://benchmarkheaven.com
- Dataset `LocalLLaMA/typed-decisions`: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Dataset `nvidia/When2Call`: https://huggingface.co/datasets/nvidia/When2Call
