# TechnoBaptist/clef-flash

## Resumen

Clef-Flash es un modelo multimodal de 9.409.813.744 parámetros (9,4B) diseñado para tomar decisiones sobre datos tipados en lugar de generar texto libre. Recibe un «estado» (texto, JSON, imágenes o vídeo) junto con un esquema de preguntas tipadas y devuelve, en una sola pasada hacia delante, una probabilidad para cada opción permitida de cada pregunta. No hay generación de texto abierta ni parseo de la salida: el modelo emite un logit por opción y se aplica un softmax por pregunta.

El modelo se presenta como un post-entrenamiento de Qwen/Qwen3.5-9B, conservando su backbone y su codificador visual, al que se añade una «joint schema head» (una cabeza transformer pequeña) que enruta la evidencia del estado hacia cada pregunta y puntúa conjuntamente todas las opciones. La model card y los enlaces asociados atribuyen el desarrollo a Cloudflare, si bien el repositorio de HuggingFace está publicado por el usuario TechnoBaptist. Existe una variante mayor, Cloudflare/clef, y Clef-Flash se describe como la variante «flash».

Su relevancia actual radica en que sustituye el patrón habitual de «generar texto y parsearlo» por una salida estructurada nativa con probabilidades calibrables, lo que simplifica su integración en pipelines de clasificación, triaje y enrutado. La API es compatible con Jev y SystemOne, y el modelo puede servirse con SGLang en hardware H200, B200 y B300. La licencia es Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone Qwen3.5-9B con codificador visual) más una «joint schema head» que puntúa opciones de forma conjunta |
| Parámetros totales | 9.409.813.744 (9,4B) |
| Parámetros activos | No aplica (no se documenta arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | bf16 documentado en el cookbook de SGLang; no se documentan GGUF ni otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (sharded) para el backbone, joint_head.safetensors para la cabeza, más código personalizado joint_schema_model.py |

## Arquitectura y entrenamiento

Clef-Flash parte del backbone de Qwen/Qwen3.5-9B, incluyendo su codificador visual, almacenado como safetensors estándar fragmentado. Sobre las representaciones ocultas finales del backbone se añade una cabeza específica («joint schema head»): un transformer pequeño que lee los estados finales, enruta la evidencia desde el estado hacia cada pregunta del esquema y puntúa conjuntamente todas las opciones de todas las preguntas. La salida es un logit por cada opción permitida; aplicando un softmax por pregunta se obtienen las probabilidades. El modelo se distribuye junto a código propio (joint_schema_model.py) que implementa la codificación de registros, el batching, la carga del modelo y el cliente de la API SystemOne.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO durante el post-entrenamiento. El pipeline declarado es image-text-to-text y los tags incluyen «multimodal», «structured-output», «classification» y «post-train». La model card describe el modelo como un modelo de decisión: no genera texto libre y no requiere parseo de salida. Se documentan tres tipos de pregunta en el esquema de entrada: `choice` (elección entre criterios), `score` (puntuación con leyenda) y `noul` (booleano, probabilidad de verdadero).

## Capacidades

- Salida estructurada nativa: devuelve una distribución de probabilidad por cada opción permitida de cada pregunta, sin texto libre ni parseo posterior.
- Tipos de pregunta soportados: `choice` (con `choice`, `confidence` y `probabilities`), `score` (con `score` esperado, `confidence`, `legend` y `probabilities`) y `noul` (probabilidad de verdadero).
- Entrada multimodal: admite el estado como texto, JSON, imágenes (PIL) y vídeo (arrays de fotogramas) mediante el procesador incluido.
- Mezcla de registros: se pueden combinar registros solo-texto y multimodales en el mismo lote.
- Puntuación conjunta: todas las preguntas del esquema se puntúan de forma conjunta en una única pasada hacia delante.
- Compatibilidad de API: compatible con Jev y SystemOne; expone el endpoint POST /v1/systemone con respuestas que incluyen `model`, `answers` (indexadas por ID de pregunta) y `usage`.
- Servicio con SGLang: se puede desplegar con SGLang y atender peticiones en /v1/systemone.
- Instrucciones opcionales: el campo `instructions` de cada pregunta es opcional.

## Casos de uso

- Triaje de tickets de soporte: con un estado de texto o JSON, se definen preguntas `choice` (departamento responsable), `score` (urgencia con leyenda) y `noul` (si hay una caída de servicio). El modelo devuelve probabilidades por opción en una sola pasada, lo que permite enrutar el ticket sin parsear texto generado.
- Validación documental en cuentas a pagar: el estado incluye los campos de la factura en JSON y se pregunta con `noul` si el total supera un umbral o si el estado es «overdue». Adecuado para pipelines deterministas donde se necesita una probabilidad y no una frase.
- Enrutado de agentes: dado el mensaje de un usuario y un esquema de herramientas o departamentos, el modelo puntúa cada opción y permite seleccionar la rama del agente con una confianza asociada.
- Extracción estructurada desde imágenes: con `images` (por ejemplo, un recibo) y preguntas `noul` o `choice`, se obtiene la probabilidad de que un dato sea legible o de qué categoría corresponde. El codificador visual del backbone procesa la imagen de entrada.
- Inspección de vídeo: con `videos` como arrays de fotogramas, se pueden plantear preguntas tipadas sobre el contenido, mezclando registros de vídeo y de texto en el mismo lote.
- Puntuación y priorización con `score`: el tipo de pregunta `score` con leyenda devuelve un valor esperado y una confianza, útil para priorizar colas de trabajo o clasificar gravedad.
- Guardrails y moderación: esquemas `choice` o `noul` permiten evaluar si un contenido cumple una política concreta y devolver la probabilidad asociada, integrándose como paso de decisión previo a otras etapas.
- Evaluación automática de decisiones: servir con SGLang y consultar el endpoint /v1/systemone permite desplegar el modelo como servicio de decisión para comparar políticas o configuraciones sobre un mismo estado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: en bf16, los 9,4B parámetros equivalen a aproximadamente 18,8 GB de pesos; con el codificador visual, el estado de las activaciones y la cabeza de esquema, el consumo se sitúa por encima de los 19 GB. El repositorio ocupa 19,1 GB.
- GPU de referencia: la model card indica que se ha probado con torch 2.11 y transformers 5.10.2 en una única H200. El cookbook de SGLang documenta instrucciones de lanzamiento para H200, B200 y B300 (variante flash, bf16, estrategia balanced, nodo único).
- GPU de consumo: no se documenta compatibilidad con GPU de consumo. Por tamaño, tarjetas con 24 GB (por ejemplo, RTX 3090 o RTX 4090) podrían alojar los pesos en bf16 con poco margen, pero es una estimación no verificada en la información disponible.
- Opciones de despliegue: SGLang mediante la imagen lmsysorg/sglang:dev-clef (puerto 30000, endpoint /v1/systemone) y carga directa con transformers usando el código propio joint_schema_model.py. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Dependencias: pillow para entradas de imagen y vídeo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TechnoBaptist/clef-flash | 9,4B | No disponible | Probabilidades por opción (structured output) | Apache-2.0 | HuggingFace |
| Qwen/Qwen3.5-9B | No disponible (modelo base del que deriva) | No disponible | Texto libre | No disponible | HuggingFace |
| Cloudflare/clef | No disponible (variante mayor de la misma familia) | No disponible | Probabilidades por opción (structured output) | No disponible | HuggingFace |

No se dispone de datos de benchmarks ni de especificaciones detalladas de las alternativas en la información proporcionada.

## Limitaciones y advertencias

- No genera texto libre: cualquier caso de uso que requiera respuestas en lenguaje natural o conversación queda fuera de su diseño.
- Riesgo de decisiones mal calibradas: al devolver siempre una distribución sobre las opciones permitidas, una evidencia insuficiente o ambigua puede traducirse en probabilidades con confianza aparente pero incorrecta. No hay mecanismo documentado de abstención.
- Idiomas soportados no documentados, por lo que no se puede garantizar un comportamiento multilingüe.
- Longitud de contexto no documentada, lo que dificulta dimensionar entradas largas en producción.
- Requiere código personalizado (joint_schema_model.py) y, por tanto, ejecución con confianza de código remoto en transformers.
- Licencia Apache-2.0 en el repositorio, pero el modelo deriva de Qwen/Qwen3.5-9B: conviene revisar las condiciones del modelo base antes de un uso comercial.
- Tamaño de repositorio de 19,1 GB, que condiciona tiempos de descarga y almacenamiento en caché.
- Adopción no validada: el repositorio figura con 0 descargas y 0 likes, sin evidencias públicas de uso en producción.
- Discrepancia de autoría: la model card apunta a Cloudflare y el repositorio está publicado por el usuario TechnoBaptist; el identificador usado en los ejemplos de la model card es Cloudflare/clef-flash, distinto del ID del repositorio.
- Fechas de creación y actualización del repositorio (2026) posteriores a la fecha habitual de consulta; conviene verificar la vigencia y la procedencia de los artefactos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/TechnoBaptist/clef-flash
- Anuncio en el blog de Cloudflare: https://blog.cloudflare.com/clef-decision-models
- Leaderboard Decision Index: https://clef-evals.workers-ai-mle.workers.dev
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante mayor de la familia: https://huggingface.co/Cloudflare/clef
- Repositorio referenciado en los ejemplos de uso: https://huggingface.co/Cloudflare/clef-flash
- Cookbook de SGLang para Clef: https://docs.sglang.io/cookbook/autoregressive/Cloudflare/clef
