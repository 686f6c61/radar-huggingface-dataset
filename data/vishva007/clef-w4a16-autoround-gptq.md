# Vishva007/clef-W4A16-AutoRound-GPTQ

## Resumen

Clef-W4A16-AutoRound-GPTQ es una versión cuantizada a 4 bits de pesos (W4A16) del modelo Cloudflare/Clef, un modelo multimodal de decisión de aproximadamente 9B parámetros post-entrenado a partir de Qwen3.5. A diferencia de un LLM generativo convencional, Clef evalúa esquemas estructurados (texto, JSON, imagen y vídeo) y devuelve distribuciones de probabilidad calibradas sobre preguntas tipadas en un único forward pass, sin generación autorregresiva de tokens. La cuantización la firma el usuario Vishva007 mediante Intel AutoRound con GPTQ y el formato compressed-tensors.

El interés de esta release es práctico: reduce el peso del checkpoint base a 4 bits manteniendo en BF16 nativo la torre de visión, la cabeza de esquema conjunto (`joint_head.safetensors`) y las convoluciones lineales de las capas de atención lineal de Qwen3.5, lo que según el autor evita degradación en OCR, en la calibración de las decisiones y en las capas de atención. El resultado es un modelo apto para servir con vLLM (build nightly, > v0.31.0) y consumir mediante el SDK `typesafe_sdk` o la API `systemone`, orientado a clasificación y enrutamiento estructurado más que a chat libre.

La relevancia actual radica en su enfoque: sustituye la generación de texto por una cabeza de clasificación tipada con confidencias, lo que encaja en pipelines de decisión (triage de incidencias, verificación documental, enrutamiento) donde se necesita salida determinista y acotada en lugar de texto libre. La licencia Apache 2.0 facilita su uso comercial, aunque el modelo depende de código personalizado (`trust-remote-code`) y de un ecosistema de serving muy específico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Qwen3.5 (atención lineal + atención estándar), con cabeza de esquema conjunto para clasificación tipada |
| Parámetros totales | 3.029.765.360 (según safetensors del repo cuantizado); el modelo base se describe como 9B |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 32k tokens (configuración de serving indicada: `--max-model-len 32k`) |
| Tipos de cuantización | W4A16 (4 bits pesos, 16 bits activaciones), group_size=64, simétrico; visión, joint head y convoluciones lineales en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compressed-tensors (AutoRound/GPTQ); código personalizado incluido en el repo |

## Arquitectura y entrenamiento

El modelo base Cloudflare/Clef es un modelo multimodal de decisión post-entrenado desde Qwen3.5, con una torre de visión para procesar imágenes (y, según la model card, también vídeo) y una cabeza de esquema conjunto que produce distribuciones de probabilidad sobre preguntas tipadas (`choice`, `score`, `noul`). La inferencia no es autorregresiva: el modelo evalúa el estado y el esquema en un solo forward pass y devuelve respuestas con confianza calibrada. La arquitectura subyacente de Qwen3.5 incluye capas de atención lineal, que el autor de la cuantización preserva explícitamente en BF16 para evitar deriva numérica.

Esta release concreta no aporta entrenamiento nuevo: es una compresión del checkpoint base. La cuantización usa Intel AutoRound en modo W4A16 con `sym=True` y `group_size=64`, y mantiene en BF16 la torre de visión (para no degradar OCR), la cabeza de esquema conjunto y las convoluciones lineales. El autor afirma cero pérdida de precisión en las suites de texto, estado JSON y multimodal frente al checkpoint base, aunque no se aportan métricas detalladas ni metodología de evaluación. No hay información sobre el volumen de tokens de entrenamiento, la composición del dataset ni sobre etapas de RLHF o DPO del modelo original.

## Capacidades

- Evaluación de esquemas estructurados: recibe un estado (texto o JSON) y un conjunto de preguntas tipadas, y devuelve la opción elegida con su confianza.
- Tipos de pregunta soportados en los ejemplos: `choice` (selección entre criterios), `score` (puntuación ordinal sobre una lista de criterios) y `noul` (booleano sí/no).
- Procesamiento multimodal de imágenes: evaluación de documentos, recibos y capturas con preguntas tipadas sobre su contenido.
- Procesamiento de vídeo mencionado en la descripción del modelo base (sin ejemplos de uso en la model card).
- Salida calibrada en un único forward pass, sin generación autorregresiva de tokens, lo que reduce latencia frente a enfoques generativos.
- Integración con tooling de producción: serving con vLLM y SDK `typesafe_sdk` con endpoint `/v1/systemone`.
- Soporte de esquemas anidados y múltiples preguntas por petición, con respuesta por pregunta y confianza asociada.
- No se documentan capacidades de tool calling genérico, agentes multi-paso ni modo thinking; el modelo está orientado a decisión, no a diálogo abierto.

## Casos de uso

- Triage de incidencias en producción: dado un estado con métricas y errores (por ejemplo, latencia de base de datos a 4.000 ms y errores 504), el modelo devuelve severidad, urgencia y decisión de rollback con confianza, tal como muestra el ejemplo de la model card.
- Enrutamiento de tickets a equipos: con preguntas `choice` sobre criterios como SRE, facturación o pagos, se obtiene el equipo destino y una confianza que permite derivar a revisión humana cuando es baja.
- Verificación documental con visión: evaluación de recibos y facturas con preguntas booleanas (legibilidad, importe superior a un umbral) aprovechando la torre de visión preservada en BF16.
- Moderación y clasificación de contenido: asignación de categorías tipadas sobre texto o imágenes con distribución de probabilidad, útil para umbrales de escalado.
- Automatización de decisiones en soporte al cliente: clasificación de la intención y la criticidad de una conversación o captura enviada por el usuario antes de derivarla a un agente.
- Control de calidad en pipelines de datos: validación de estados JSON contra esquemas y preguntas de consistencia, con salida estructurada lista para consumo programático.
- Serving de alta concurrencia: la configuración de vLLM indicada (hasta 128 secuencias en batch, KV cache en fp8, prefix caching y chunked prefill) está pensada para despliegues con muchas peticiones cortas de clasificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente afirma "cero pérdida" frente al checkpoint base en suites de texto, estado JSON y multimodal, sin cifras, sin tamaño de las suites y sin comparación con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con pesos W4A16 sobre un checkpoint de ~19,5 GB en el repo y 3.029 millones de parámetros reportados en safetensors, el peso en VRAM dependerá de la configuración exacta y de los componentes preservados en BF16 (visión, joint head, convoluciones lineales).
- GPU recomendadas: no especificadas por el autor; la configuración de vLLM asume GPU con suficiente memoria para `--gpu-memory-utilization 0.90` y KV cache en fp8. Para el modelo base de 9B en BF16 serían necesarias GPUs de 24 GB o más (RTX 4090, L40S, A100, H100), pero esta cifra no está confirmada para la variante cuantizada.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible.
- Opciones de despliegue: vLLM (requiere versión > v0.31.0 o imagen `vllm/vllm-openai:nightly`), con `--trust-remote-code --dtype bfloat16`. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La arquitectura de decisión en un solo forward pass sugiere menor latencia que la generación autorregresiva, pero no se aportan medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Clef-W4A16-AutoRound-GPTQ (esta ficha) | 3.029 M reportados en safetensors; base descrito como 9B | 32k | Decisión multimodal tipada, sin generación | Apache 2.0 | Hugging Face, serving vía vLLM nightly |
| Cloudflare/Clef (base) | 9B | no disponible | Decisión multimodal tipada | Apache 2.0 | Hugging Face |
| Vishva007/clef-W4A16-AutoRound | no disponible | no disponible | Variante cuantizada equivalente | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas de la misma categoría (modelos de decisión tipada) en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- No es un modelo de chat ni de generación de texto libre: solo responde a esquemas de preguntas tipadas predefinidas.
- Requiere código personalizado (`joint_schema_model.py`) y `--trust-remote-code` en vLLM; esto implica revisar el código antes de desplegarlo en producción.
- Dependencia de una versión muy concreta de vLLM (> v0.31.0 o build nightly), lo que complica la reproducibilidad y el mantenimiento.
- La afirmación de "cero pérdida" tras la cuantización no está respaldada con métricas públicas ni con la metodología de evaluación.
- Discrepancia entre el tamaño reportado en safetensors (3.029 millones de parámetros) y la descripción del modelo base como 9B; conviene verificar qué componentes están incluidos en el recuento antes de dimensionar el hardware.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento adecuado en castellano sin evaluación propia.
- Riesgo de calibración deficiente en dominios alejados de los datos de post-entrenamiento: las confidencias devueltas deben validarse con datos propios antes de usarlas como umbral automático.
- Sesgos del modelo base no documentados en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el código personalizado deben auditarse por separado.
- El modelo tiene muy poca tracción (149 descargas, 1 like) y no procede del desarrollador original, sino de un tercero; no hay garantía de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vishva007/clef-W4A16-AutoRound-GPTQ
- Variante AutoRound sin sufijo GPTQ: https://huggingface.co/Vishva007/clef-W4A16-AutoRound
- Modelo base: https://huggingface.co/Cloudflare/Clef
- Resultados de búsqueda web: https://huggingface.co/Vishva007/clef-W4A16-AutoRound y https://huggingface.co/Vishva007/clef-W4A16-AutoRound-GPTQ
