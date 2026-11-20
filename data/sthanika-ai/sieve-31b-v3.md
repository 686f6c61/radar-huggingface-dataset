# sthanika-ai/Sieve-31B-v3

## Resumen

Sieve-31B-v3 es un modelo de decisión desarrollado por Sthanika AI, un fine-tune completo de google/gemma-4-31B-it (revisión `842da37`) que no genera texto: recibe un estado (texto o JSON) y una lista de preguntas tipadas, y devuelve una probabilidad calibrada para cada opción de cada pregunta. Su salida se obtiene directamente de los logits de la capa de salida del modelo sobre las etiquetas de las opciones (A, B, …, hasta 255) en un slot `Answer: (`, con softmax a una temperatura por categoría de pregunta. Está pensado para sustituir a clasificadores ad hoc y a LLM generativos en tareas de decisión estructurada donde se necesita una distribución de probabilidad fiable y no una respuesta en lenguaje natural.

Con 31.273.086.512 parámetros totales (29,29B entrenados en el fine-tune) y pesos en bf16 de 58,3 GiB, el modelo se posiciona como una alternativa de razonamiento-decisión de gran tamaño. Su rasgo arquitectónico más distintivo es el uso de atención bidireccional en las 10 capas de atención global del backbone Gemma-4, mientras que las 50 capas de ventana deslizante (ventana de 1.024 tokens) permanecen causales. Esto permite que el estado se lea en función de la pregunta y sus opciones, algo imposible en un modelo generativo causal.

El modelo declara el puesto #1 (empatado) en el leaderboard Decision Index 0.4.1 con una puntuación Full de 71,10 (datos del 28 de octubre de 2026, 243 modelos), y un 71,68 en la suite pública 0.3 (140.178 peticiones puntuadas, índice que promedia 37 benchmarks). Es relevante ahora porque ofrece una vía no generativa y calibrada para la evaluación automatizada y la toma de decisiones, con licencia Apache 2.0 y compatibilidad con endpoints de Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder Gemma-4 con 60 capas (10 de atención global bidireccional + 50 de ventana deslizante causal de 1.024 tokens); lectura por logits de etiquetas de opción |
| Parámetros totales | 31.273.086.512 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | sin límite declarado; entrenado con prompts de hasta 16.384 tokens |
| Tipos de cuantización | no disponible (pesos publicados en bf16) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (13 shards en bf16) + `head.pt` con la cabeza de lectura, regla de atención, política de serving y temperaturas |

## Arquitectura y entrenamiento

Sieve-31B-v3 parte de google/gemma-4-31B-it y aplica un fine-tune completo sobre todas las proyecciones lineales de las 60 capas del decoder (29,29B parámetros). Los embeddings de tokens (atados a la capa de salida) y todas las normalizaciones se mantienen del backbone. Los pesos publicados son una media ponderada del backbone (0,3) y del modelo fine-tuneado (0,7). La innovación principal es la atención bidireccional en las 10 capas globales: al no generar texto, el modelo puede hacer que cada token atienda a todos los demás del prompt, de modo que el estado se interpreta a la luz de la pregunta y sus opciones. En peticiones con varias preguntas, el bloque compartido (turno de sistema, lista de preguntas y estado) solo atiende a sí mismo, y cada bloque de pregunta atiende al bloque compartido, compartiendo una única lectura del estado.

El prompt sigue la plantilla de chat de Gemma con el modo thinking desactivado: un turno de sistema, un turno de usuario con las preguntas y el estado, y un bloque por pregunta con sus opciones etiquetadas que termina en el slot `Answer: (`. La puntuación se obtiene de los logits de la capa de salida sobre las etiquetas de las opciones (A, B, …, AA, AB, …, hasta 255 opciones, con softcap final de logits) y una softmax a la temperatura de la categoría de pregunta. Se aplica una temperatura global T = 1,27 y 22 temperaturas por categoría (de 0,955 a 1,380). Para las preguntas `choice` reordenables, cada una se lee dos veces (orden original y rotado a la mitad) y se promedian los dos vectores de log-probabilidad, lo que cancela el sesgo por posición de etiqueta; las preguntas con `"permute": false` se leen una sola vez. El modelo fue entrenado con los tipos `choice` y `noul` (el tipo `score` está soportado pero no se declara entrenado). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Decisión tipada con probabilidades calibradas: devuelve, para cada pregunta, la opción más probable, una confianza y una probabilidad por opción.
- Preguntas `choice`: entre 2 y 255 opciones definidas por el llamante, opcionalmente descritas; devuelve la clave más probable, confianza y distribución por clave.
- Preguntas `noul`: respuesta binaria sí/no con P(sí).
- Preguntas `score`: lista ordenada de 2 a 10 niveles; devuelve el nivel esperado, confianza y probabilidad por nivel.
- Lectura de estado en texto o JSON, con una sola pasada compartida para todas las preguntas de la petición.
- Mitigación del sesgo posicional mediante doble lectura con rotación de opciones y promedio de log-probabilidades.
- No genera texto: la salida es siempre una distribución de probabilidad sobre etiquetas.
- Capacidades multilingües: solo inglés declarado.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como tal; el modelo está orientado a decisión puntual, no a planificación.
- Capacidades de visión o audio: no disponibles (aunque el backbone Gemma-4 es image-text-to-text, la ficha no declara uso multimodal en este fine-tune).

## Casos de uso

- Evaluación automática de respuestas generadas: dado un estado con la pregunta original, la respuesta de referencia y la respuesta candidata, el modelo devuelve la probabilidad de cada categoría de calidad (correcto, parcial, incorrecto), lo que permite puntuar pipelines de generación sin un LLM juez generativo y con calibración explícita.
- Moderación de contenido con umbrales calibrados: usar preguntas `noul` (¿es tóxico?, ¿es spam?) sobre el texto del usuario y fijar umbrales de P(sí) según la política, aprovechando que la salida es una probabilidad y no una decisión binaria opaca.
- Enrutamiento de tickets y clasificación operativa: con preguntas `choice` sobre categorías de soporte (facturación, técnico, cuenta, etc.) y el estado compuesto por el asunto y el cuerpo del ticket, el modelo devuelve la categoría más probable y su confianza para derivar al equipo adecuado.
- Puntuación de relevancia en búsqueda y RAG: para cada par consulta-documento, una pregunta `score` con niveles de relevancia (0 a 4) devuelve el nivel esperado y la distribución, útil para reordenar resultados o filtrar contexto antes de pasarlo a un LLM generativo.
- Análisis de encuestas y feedback abierto: convertir respuestas de texto libre en escalas ordinales mediante preguntas `score` (satisfacción de 1 a 5), con distribución de probabilidad por nivel para agregar resultados con intervalos de incertidumbre.
- Verificación de extracción de datos estructurados: dado un JSON extraído y el texto fuente, preguntas `choice` sobre si cada campo está presente, es correcto o es ambiguo, para validar pipelines de extracción antes de escribir en base de datos.
- Decisión con múltiples preguntas sobre un mismo estado: al compartir una única lectura del estado entre todas las preguntas de la petición, es adecuado para triage que requiere evaluar varias dimensiones (urgencia, categoría, sentimiento) sobre el mismo documento con coste de lectura amortizado.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Métrica | Valor | Notas |
|---|---|---|---|
| Decision Index 0.4.1 (leaderboard) | decision_index (Full score) | 71,10 | Puesto #1 (empatado); edición 0.4.1, datos del 28-10-2026, 243 modelos; tests privados de los mantenedores |
| Decision Index 0.3 (suite pública) | decision_index (public index, corregido por azar) | 71,68 | 140.178 peticiones puntuadas; el índice promedia 37 benchmarks |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 58,3 GiB de pesos en bf16; el pico del benchmark de serving declarado fue de 81,4 GiB asignados.
- Una GPU de 96 GB ejecuta todas las peticiones públicas según el autor (por ejemplo, A100 80 GB no sería suficiente para ese pico; se requiere H100 80 GB con margen ajustado o H200/A100 de 96 GB según disponibilidad).
- No cabe en GPU de consumo (RTX 4090 de 24 GB, RTX 3090 de 24 GB) en bf16; se requeriría cuantización, cuyos formatos no están declarados.
- Opciones de despliegue: transformers (librería declarada) y endpoints compatibles de Hugging Face; vLLM, llama.cpp, Ollama o TGI no están declarados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sieve-31B-v3 | 31,27B | entrenado hasta 16.384 tokens, sin límite declarado | Decisión tipada con probabilidades calibradas, sin generación de texto | Apache 2.0 | Hugging Face, endpoints compatibles |
| google/gemma-4-31B-it (backbone) | 31B (no se detalla en la información disponible) | no disponible | Generación de texto multimodal (image-text-to-text) | no disponible en la información proporcionada | Hugging Face |
| Alternativas de clasificación/calibración de tamaño comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Solo soporta inglés de forma declarada; el rendimiento en castellano u otros idiomas no está garantizado.
- No genera texto: no sirve para tareas de generación, resumen, traducción ni diálogo abierto.
- El tipo de pregunta `score` está soportado pero el autor solo declara entrenamiento en `choice` y `noul`; su calibración puede ser menos fiable.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (campo `verified: false` en el model-index).
- El Full score del leaderboard proviene de tests privados de los mantenedores del índice, no reproducibles públicamente.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de calibración incorrecta fuera de la distribución de entrenamiento (dominios o formatos de estado no vistos).
- Las temperaturas por categoría están fijadas en `head.pt`; modificarlas altera la calibración declarada.
- Requiere hardware de gama alta (pico de 81,4 GiB); no es desplegable en GPU de consumo sin cuantización, cuyos formatos no están documentados.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Gemma-4 puede tener términos adicionales que conviene revisar antes de producción.
- El sesgo por posición de etiqueta se mitiga solo en preguntas `choice` reordenables; las marcadas con `"permute": false` conservan su orden y pueden verse afectadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sthanika-ai/Sieve-31B-v3
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Colección Sieve: https://huggingface.co/collections/sthanika-ai/sieve-6abb93a61dd495f69811c586
- Repositorio de código: https://github.com/sthanika-ai/Sieve
- Leaderboard Decision Index: https://huggingface.co/spaces/multimodalart/jev-decision-index
- Sitio de Sthanika AI: https://sthanika.ai/
- Sitio de Sieve: https://sieve.one/
