# sthanika-ai/Sieve-31B-v4

## Resumen

Sieve-31B-v4 es un modelo de decisión desarrollado por Sthānika AI, un fine-tune completo de google/gemma-4-31B-it (revisión `842da37`) orientado a la clasificación calibrada de opciones múltiples. A diferencia de un modelo generativo, no produce texto: recibe un estado (texto o JSON) y una lista de preguntas tipadas, y devuelve una probabilidad calibrada para cada opción de cada pregunta a partir de los logits de las etiquetas (A, B, …) en la capa de salida del propio modelo.

El modelo conserva la arquitectura de Gemma 4 con 60 capas de decodificador, pero modifica las 10 capas de atención global para que sean bidireccionales, mientras que las 50 capas de ventana deslizante (ventana de 1.024 tokens) permanecen causales. Entrenado en dos etapas (fine-tune completo de 29,29B parámetros en las proyecciones lineales, con dos ejecuciones promediadas y mezcladas con el backbone, más una LoRA de rango 32 fusionada en los pesos densos), el resultado es un checkpoint completo en bf16 de 31.273.086.512 parámetros.

Su relevancia radica en el enfoque: en lugar de pedir a un LLM que "razone" una elección en lenguaje natural, expone directamente una distribución de probabilidad calibrada sobre las opciones, con temperturas por categoría de pregunta y lectura en dos órdenes de opciones para cancelar el sesgo de posición de etiqueta. Esto lo hace adecuado para enrutamiento, triaje y puntuación determinista en pipelines de producción, donde la calibración importa más que la generación libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Gemma 4): 60 capas, 10 de atención global bidireccional y 50 de ventana deslizante causal (1.024 tokens) |
| Parametros totales | 31.273.086.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | sin límite declarado; entrenado con prompts de hasta 16.384 tokens |
| Tipos de cuantizacion | no disponible (checkpoint publicado en bf16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (13 shards en bf16) + `head.pt` (readout, regla de atención, política de serving y temperaturas) |

## Arquitectura y entrenamiento

El backbone es Gemma 4, un transformer decoder de 60 capas que intercala 10 capas de atención global completa con 50 capas de ventana deslizante de 1.024 tokens. La modificación clave de Sieve-31B-v4 es hacer bidireccionales las capas globales: al no generar texto, cada token puede atender a todos los demás del bloque, de modo que el estado se lee a la luz de la pregunta y sus opciones. Las capas de ventana deslizante siguen siendo causales, como en el modelo base.

El entrenamiento consta de dos etapas. La primera es un fine-tune completo de todas las proyecciones lineales de las 60 capas (29,29B parámetros), ejecutado dos veces y promediado, luego mezclado con el backbone; los embeddings de tokens (atados a la capa de salida) y todas las normalizaciones se mantienen del backbone. La segunda etapa es una LoRA de rango 32 orientada a mejorar el rendimiento, fusionada en los pesos densos, de modo que no se necesita adaptador en inferencia. Ambos entrenamientos usaron la misma regla de atención bidireccional que luego aplica el runtime de serving.

El readout no usa una cabeza nueva: emplea los logits de la capa de salida del propio modelo sobre las etiquetas de opción (A, B, …, AA, AB, …, hasta 255 opciones), con softmax a la temperatura de la categoría de pregunta. Hay una temperatura global T = 1,167 y 22 temperaturas por categoría (de 0,850 a 1,333). Para preguntas `choice` reordenables, el modelo lee dos veces (orden original y rotado a la mitad) y promedia los vectores de log-probabilidad, cancelando la preferencia por posición de etiqueta; las preguntas con `"permute": false` se leen una sola vez.

## Capacidades

- Clasificación de opción múltiple calibrada (`choice`) con 2 a 255 opciones, devolviendo la clave más probable, una confianza y la probabilidad por clave.
- Preguntas binarias sí/no (`noul`), devolviendo P(yes).
- Puntuación en escala ordinal (`score`) con 2 a 10 niveles, devolviendo el nivel esperado, confianza y probabilidad por nivel (tipo definido, aunque el modelo se entrenó solo con `choice` y `noul`).
- Lectura compartida del estado: varias preguntas de una misma petición comparten una única lectura del estado, y las preguntas no ven las opciones de las demás.
- Reutilización de claves y valores del bloque compartido (2.048 tokens o más) para cada pregunta y cada orden de opciones, con resultado idéntico al cálculo individual.
- No genera texto: no hay decodificación autoregresiva ni riesgo de salida libre; el resultado es siempre una distribución sobre las opciones dadas.
- Soporte de entrada de texto o JSON como estado.
- Multilingüe: no disponible (solo se declara inglés).
- Tool calling, agentes y visión: no disponible en la información proporcionada, pese a que el backbone base es image-text-to-text.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el asunto y el cuerpo de un ticket, una pregunta `choice` con los equipos disponibles (facturación, técnico, etc.) devuelve la probabilidad por equipo; la confianza permite derivar a revisión humana cuando es baja.
- Predicción de churn o riesgo de cancelación: una pregunta `noul` sobre el texto de la interacción devuelve P(yes) calibrada, utilizable como variable numérica en un modelo de scoring posterior.
- Triaje de moderación de contenido: preguntas `choice` sobre categorías de política, con lectura en dos órdenes para evitar sesgo de posición de etiqueta, adecuado para clasificación determinista y auditable.
- Clasificación de documentos y contratos: el estado puede ser JSON con metadatos y texto; varias preguntas comparten la lectura del estado, lo que reduce coste frente a una llamada por pregunta.
- Encuestas y feedback con escalas ordinales: el tipo `score` (2 a 10 niveles) permite obtener el nivel esperado y la distribución completa, útil para análisis de sentimiento graduado o NPS.
- Enrutamiento en pipelines de agentes: como componente de decisión que selecciona la siguiente herramienta o rama de un flujo, sin generación de texto y con probabilidades calibradas para umbrales explícitos.
- Etiquetado asistido y control de calidad: comparar la distribución del modelo con la etiqueta humana para detectar casos ambiguos o mal etiquetados en datasets de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la ejecución de la suite pública Decision Index 0.3 está en curso y que el índice de decisión se añadirá más adelante. No se proporcionan cifras de accuracy ni de expected calibration error (ECE) pese a que ambas métricas figuran en los tags.

## Requisitos de hardware

- Pesos en bf16: 58,3 GiB, según la model card.
- VRAM estimada para inferencia: al menos ~60 GiB para cargar los pesos en bf16; se requiere margen adicional para activaciones, claves y valores del bloque compartido y el estado de atención bidireccional.
- GPU recomendadas: A100 80 GB, H100 80 GB, o configuraciones multi-GPU para repartir los 13 shards.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en GPUs de 48 GB en bf16; no se documentan cuantizaciones que lo reduzcan.
- Opciones de despliegue: runtime propio `sieve` (versión 0.5.1 o posterior), instalable vía `pip install "sieve-decisions[serve]"` desde el repositorio de GitHub; requiere torch 2.8.0 según los requisitos probados. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sieve-31B-v4 | 31,27B | sin límite declarado; entrenado hasta 16.384 tokens | Modelo de decisión (clasificación calibrada) | apache-2.0 | Hugging Face + runtime `sieve` |
| google/gemma-4-31B-it | 31B (no confirmado en la información) | no disponible | LLM generativo multimodal | no disponible en la información | Hugging Face |
| Alternativas de clasificación calibrada de tamaño comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos directamente comparables de la misma categoría (modelos de decisión calibrada) en la información proporcionada.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está documentado.
- No genera texto: no sirve para tareas de generación, resumen, diálogo libre ni razonamiento en lenguaje natural.
- El tipo `score` está definido en la interfaz pero el modelo se entrenó solo con `choice` y `noul`; su calibración en `score` no está garantizada.
- El Decision Index público no está publicado; no hay evidencia independiente de calibración (ECE) ni de accuracy en la información disponible.
- Riesgo de alucinación: al no generar texto, el riesgo se traslada a confianzas mal calibradas o a opciones no contempladas; el modelo nunca trunca, descarta ni reordena opciones, por lo que la cobertura de las opciones recae en el llamador.
- Sesgos: se mitiga el sesgo de posición de etiqueta mediante la lectura en dos órdenes, pero no se documentan evaluaciones de sesgo demográfico, cultural o de dominio.
- Licencia apache-2.0 permite uso comercial, pero el modelo base es google/gemma-4-31B-it, cuyos términos deben verificarse por separado en producción.
- Requiere el runtime propietario `sieve` para aplicar la regla de atención bidireccional y las temperaturas; cargarlo con transformers estándar sin `head.pt` produciría resultados incorrectos.
- El repo ocupa 62,6 GB y no se ofrecen cuantizaciones, lo que limita el despliegue en hardware de consumo.
- Sin descargas ni likes en el momento de la ficha (0 y 0), lo que implica ausencia de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/sthanika-ai/Sieve-31B-v4
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Repositorio de código: https://github.com/sthanika-ai/Sieve
- Colección de la familia Sieve: https://huggingface.co/collections/sthanika-ai/sieve-6abb93a61dd495f69811c586
- Sthānika AI: https://sthanika.ai/
- Sieve: https://sieve.one/
