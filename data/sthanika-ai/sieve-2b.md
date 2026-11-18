# sthanika-ai/Sieve-2B

## Resumen

Sieve-2B es un modelo de decisión desarrollado por Sthānika AI, diseñado para resolver un problema muy concreto y distinto al de los modelos generativos habituales: dada una pieza de texto o JSON (el *estado*) y una serie de preguntas tipadas, devuelve una probabilidad calibrada para cada opción de cada pregunta. No genera texto en ningún momento; lee el estado una vez por pregunta y puntúa directamente las opciones.

Técnicamente es un adaptador LoRA (rango 8, α=16) junto con una cabeza escalar de puntuación, montado sobre los primeros 16 de los 24 bloques de Qwen/Qwen3.5-2B-Base. Solo se cargan en GPU los pesos necesarios para inferencia (1,43 B parámetros efectivos), lo que reduce el consumo a unos 3 GB en bf16. Admite dos tipos de pregunta: `choice` (entre 2 y 255 claves) y `noul` (sí/no).

Su relevancia reside en la invariancia al orden de las opciones: la arquitectura replica el estado codificado una vez por opción, de modo que cada opción se puntúa como una continuación independiente sin ver a sus hermanas. Esto elimina por construcción el sesgo de posición que afecta a los modelos que evalúan varias opciones en una sola pasada, un problema crítico en sistemas de enrutamiento, clasificación y decisión automatizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=8, α=16) + cabeza escalar sobre bloques 1-16 de Qwen/Qwen3.5-2B-Base (transformer híbrido con capas Gated DeltaNet) |
| Parametros totales | 1,43 B en inferencia (embeddings + bloques 1-16 + adaptador + cabeza); base completa de referencia: 1,88 B |
| Parametros activos | No aplica (no es MoE); 4,69 M parámetros entrenados (LoRA 3.637.248 + cabeza 1.053.697) |
| Longitud de contexto | 32.768 tokens para estado + pregunta + opción más larga; entrenado con prompts de hasta 2.048 tokens |
| Tipos de cuantizacion | No disponible (se ejecuta en bf16 o fp32) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

Sieve-2B no es un modelo generativo al uso. Se compone de un backbone Qwen/Qwen3.5-2B-Base del que solo se ejecutan los bloques 1 a 16 (de 24), más un adaptador LoRA de rango 8 con α=16 aplicado a las proyecciones de atención y MLP de esos bloques, y una cabeza escalar que produce la puntuación de cada opción. Los bloques 17-24 y la cabeza de generación de texto del modelo base nunca se cargan en GPU.

La innovación central es el *prefix-state fork*: el estado y la pregunta se codifican una sola vez, y el estado codificado (incluida la caché KV de atención y el estado recurrente de las capas Gated DeltaNet) se replica una vez por opción. Cada opción se ejecuta como una continuación independiente en un batch con padding a la derecha, sin acceso a las demás. Esto garantiza invariancia al orden de las opciones por construcción, verificada numéricamente a ~1e-6 y con 0 cambios de argmax en 600 ejemplos reales de banking77 bajo reordenación de opciones. La temperatura de calibración es T = 1,7144. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Clasificación y decisión tipada sobre texto o JSON: devuelve la clave más probable, una confianza y una probabilidad por clave.
- Preguntas de tipo `choice` con entre 2 y 255 opciones, opcionalmente descritas con instrucciones y criterios.
- Preguntas de tipo `noul` (sí/no) puntuadas como una elección de 2 opciones, devolviendo P(yes).
- Calibración de probabilidades: métricas de Brier score y expected calibration error reportadas por el autor.
- Invariancia al orden de opciones por diseño arquitectónico.
- Generalización a esquemas no vistos (hasta K=150 opciones) y a dominios fuera de distribución.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-step en el sentido generativo; es un modelo de decisión puro.
- Capacidades multilingües limitadas al inglés.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el asunto y el cuerpo de un correo, clasificar el departamento (facturación, técnico, etc.) con probabilidad calibrada por categoría, usando preguntas `choice` con criterios descritos.
- Predicción de churn o riesgo de cancelación: con una pregunta `noul` sobre el texto del cliente, obtener P(cancelación) y usar el umbral calibrado para disparar acciones de retención.
- Moderación y clasificación de contenido: clasificar reseñas, comentarios o mensajes en categorías predefinidas con confianza por clase, aprovechando la calibración para decidir cuándo escalar a revisión humana.
- Clasificación de intenciones en asistentes conversacionales: con hasta 59 intenciones (evaluado en MASSIVE) o esquemas de hasta 150 opciones, enrutar la consulta del usuario al flujo adecuado.
- Extracción de decisiones estructuradas desde JSON: procesar registros de formularios o logs y responder múltiples preguntas tipadas sobre el mismo estado en una sola llamada.
- Análisis de sentimiento y clasificación de reviews: sobre datasets como SST-5, Yelp o Amazon Reviews, obtener distribuciones de probabilidad por clase en lugar de una etiqueta rígida.
- Sistemas de decisión auditables: al no generar texto y devolver probabilidades calibradas con invariancia al orden, es adecuado para pipelines donde se requiere reproducibilidad y trazabilidad de la decisión.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Tarea / dataset | Metrica | Valor |
|---|---|---|
| Decision Index 0.4.1, leaderboard (tests privados) | Decision Index (full score) | 21,90 |
| Decision Index 0.4.1, leaderboard (score público) | Decision Index (public score) | 22,16 |
| MASSIVE, held out (1.200 preguntas, K=59) | Accuracy | 0,715 |
| MASSIVE, held out (1.200 preguntas, K=59) | Expected calibration error | 0,094 |
| MMLU, held out (1.500 preguntas, 4 vías) | Accuracy | 0,608 |
| transfer-v4, out-of-domain (328 preguntas) | Accuracy | 0,732 |
| Esquemas no vistos, held-out pool (clinc, newsgroups, yahoo, LEDGAR; K hasta 150) | Accuracy | 0,777 |

## Requisitos de hardware

- VRAM estimada: aproximadamente 3 GB para los pesos en bf16; algo más para activaciones y la caché replicada por opción, que escala con el número de opciones y la longitud del contexto.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para uso básico; para contextos largos (hasta 32.768 tokens) o muchas opciones, se recomienda 8-16 GB (RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, en tarjetas con 6 GB o más (por ejemplo RTX 3060, RTX 4060, RTX 4090).
- Opciones de despliegue: el paquete oficial `sieve-decisions[serve]` desde el repositorio de GitHub; requiere torch 2.8.0 y, opcionalmente, `causal-conv1d==1.7.0` (kernel de convolución fusionado, necesita nvcc 11.6 o superior). No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la información proporcionada. Sieve-2B pertenece a una categoría específica (modelos de decisión con calibración e invariancia al orden de opciones) para la que no se han identificado alternativas documentadas en los datos disponibles.

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| Sieve-2B | 1,43 B (inferencia) | 32.768 tokens | Decisión tipada calibrada, sin generación | Apache 2.0 |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- No genera texto: no sirve para tareas generativas, tool calling ni razonamiento multi-step en el sentido habitual.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente.
- El entrenamiento se realizó con prompts de hasta 2.048 tokens, aunque el límite de inferencia es de 32.768; el rendimiento en contextos muy superiores a los de entrenamiento puede degradarse.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea en dominios muy alejados de los datos de entrenamiento (accuracy out-of-domain de 0,732).
- La calibración (ECE de 0,094 en MASSIVE) no es perfecta; en producción conviene validar los umbrales de confianza con datos propios.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen/Qwen3.5-2B-Base.
- El número de opciones está limitado a 255 por pregunta de tipo `choice`.
- El rendimiento y la latencia dependen del número de opciones, ya que el estado se replica una vez por opción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sthanika-ai/Sieve-2B
- Colección Sieve: https://huggingface.co/collections/sthanika-ai/sieve-6abb93a61dd495f69811c586
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Repositorio de código: https://github.com/sthanika-ai/Sieve
- Implementación del fork: https://github.com/sthanika-ai/Sieve/blob/main/sieve/fork/model.py
- Sitio de Sthānika AI: https://sthanika.ai/
- Sitio de Sieve: https://sieve.one/
