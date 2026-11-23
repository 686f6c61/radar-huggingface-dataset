# SusanHill/zils-z3-cf1

## Resumen

Clef es un modelo multimodal de decisión de 27 000 millones de parámetros desarrollado por Cloudflare, obtenido mediante post-entrenamiento del modelo base Qwen/Qwen3.8-27B. A diferencia de un modelo generativo convencional, Clef no produce texto libre: recibe un estado (texto, JSON, imágenes o vídeo) junto con un esquema de preguntas tipadas y devuelve, en una única pasada hacia delante, una probabilidad para cada opción permitida de cada pregunta. Esto elimina por completo el parseo de salidas y los errores de formato.

La arquitectura combina el backbone de Qwen3.8-27B (incluido su codificador visual) con una cabeza transformer específica denominada "joint schema head", que enruta la evidencia del estado hacia cada pregunta y puntúa conjuntamente todas las opciones de todas las preguntas. El modelo está pensado para integrarse en sistemas de enrutamiento, clasificación y toma de decisiones automatizada, con una API compatible con Jev y SystemOne y despliegue soportado en SGLang.

Su relevancia actual radica en que ofrece una alternativa determinista y estructurada a los LLM generativos en tareas de decisión: en lugar de pedir al modelo que "escriba" una respuesta clasificatoria, se obtienen directamente distribuciones de probabilidad tipadas (elección, puntuación o booleano), lo que facilita la integración en producción, la calibración de confianza y la auditoría de decisiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone Qwen3.8-27B + codificador visual + joint schema head) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; SGLang probado en bf16) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (sharded), con `joint_head.safetensors` separado |

## Arquitectura y entrenamiento

Clef parte del backbone Qwen/Qwen3.8-27B, que incluye su codificador de visión, y lo combina con una cabeza específica ("joint schema head"): un pequeño transformer que lee los estados ocultos finales del backbone, enruta la evidencia relevante del estado hacia cada pregunta del esquema y puntúa conjuntamente todas las opciones de todas las preguntas. La salida es un logit por cada opción permitida de cada pregunta; aplicando softmax por pregunta se obtienen probabilidades normalizadas. El modelo se distribuye como safetensors estándar fragmentados, con la cabeza en un archivo independiente (`joint_head.safetensors`) y código propio en `joint_schema_model.py` para la codificación de registros, el batching y la carga del modelo.

El modelo es un post-entrenamiento (finetune) del base Qwen3.8-27B, orientado a la producción de salidas tipadas y estructuradas en lugar de texto libre. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; esa información no está disponible. La innovación principal es el paradigma de "decisión en una pasada": no hay generación autoregresiva ni parseo de la salida, y el modelo puede mezclar registros de solo texto y multimodales en el mismo lote.

## Capacidades

- Clasificación y decisión estructurada: devuelve probabilidades para cada opción de preguntas de tipo `choice`, `score` y `noul` (booleano) en una sola pasada.
- Entrada multimodal: acepta estado en texto, JSON, imágenes (PIL) y vídeo (arrays de fotogramas), mezclables en el mismo lote.
- Enrutamiento de evidencia: la joint schema head asigna evidencia del estado a cada pregunta del esquema.
- Salida tipada sin parseo: respuestas con `choice`, `confidence` y `probabilities`, o `score` esperado con `legend`, o probabilidad de verdadero para `noul`.
- API compatible con Jev y SystemOne (`POST /v1/systemone`), con respuestas indexadas por ID de pregunta y bloque `usage`.
- Soporte de instrucciones opcionales por pregunta y de criterios de decisión definidos por el usuario.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No soporta generación de texto libre ni razonamiento multi-paso conversacional por diseño.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo clasifica cada mensaje en un departamento (`choice`) y estima urgencia (`score`) en una sola llamada, con probabilidades auditables para umbrales de escalado.
- Moderación y triaje de contenido: preguntas `noul` sobre presencia de spam, toxicidad o riesgo permiten obtener una probabilidad de verdadero por criterio sin parsear texto generado.
- Validación documental con visión: procesar facturas o recibos como imagen y responder preguntas booleanas sobre legibilidad, importe o estado del documento, mezclando registros de texto e imagen en el mismo lote.
- Automatización de back-office financiero: clasificar facturas como pagadas, vencidas o en borrador a partir de un estado JSON estructurado, con confianza por opción para derivar casos dudosos a revisión humana.
- Análisis de vídeo para control de calidad: pasar fotogramas como entrada y responder preguntas tipadas sobre presencia de defectos o cumplimiento de criterios.
- Decisión en pipelines de agentes: sustituir llamadas a LLM generativos por una llamada determinista que devuelve decisiones tipadas y calibradas, simplificando la integración y la trazabilidad.
- Sistemas de puntuación con escala: usar preguntas `score` con leyenda definida por el usuario para obtener una puntuación esperada y su distribución de probabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona un "Decision Index leaderboard" en clef-evals.workers-ai-mle.workers.dev, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 27 356 millones de parámetros en bf16 los pesos ocupan aproximadamente 55 GB, por lo que se requiere al menos una GPU de 80 GB para bf16 sin cuantizar.
- GPU recomendadas: H200 (configuración probada por el autor con `torch` 2.11 y `transformers` 5.10.2), B200 y B300 (comandos de lanzamiento documentados en el cookbook de SGLang).
- GPU de consumo: no cabe en GPU de consumo convencionales (RTX 4090 de 24 GB) en bf16; no se documentan cuantizaciones alternativas.
- Opciones de despliegue: SGLang (imagen `lmsysorg/sglang:dev-clef`, endpoint `/v1/systemone`), uso directo con `transformers` y el módulo `joint_schema_model.py` (`load_release_model`, `systemone`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Clef (Cloudflare) | 27,36 B | No disponible | Probabilidades tipadas por pregunta | Apache-2.0 | Hugging Face, SGLang |
| Clef-Flash (Cloudflare) | No disponible | No disponible | Probabilidades tipadas por pregunta | No disponible | Hugging Face |
| Qwen3.8-27B (modelo base) | 27 B (aprox.) | No disponible | Texto libre generativo | No disponible | Hugging Face |

La información proporcionada no incluye datos de rendimiento comparativos entre estos modelos; la comparación se limita a parámetros, tipo de salida, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo no genera texto libre: no es adecuado para tareas conversacionales abiertas, resumen o generación creativa.
- Riesgo de alucinación en las probabilidades: al ser un modelo de decisión, puede asignar alta confianza a opciones incorrectas si el estado o el esquema son ambiguos; se recomienda calibrar umbrales con datos propios.
- Sesgos: no se documentan sesgos conocidos en la información disponible; al derivar de Qwen3.8-27B, puede heredar sesgos del modelo base y de sus datos de entrenamiento.
- Idiomas soportados no documentados; el comportamiento multilingüe no está garantizado.
- Longitud de contexto no especificada, lo que dificulta planificar el tamaño máximo de estado, imágenes o vídeo por petición.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero deben respetarse las condiciones de la licencia del modelo base Qwen3.8-27B.
- Dependencia de código propio (`joint_schema_model.py`) y de versiones concretas de `torch` (2.11) y `transformers` (5.10.2); la integración con otros stacks no está documentada.
- El modelo se publicó con 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/SusanHill/zils-z3-cf1
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Clef-Flash: https://huggingface.co/Cloudflare/clef-flash
- Anuncio en el blog de Cloudflare: https://blog.cloudflare.com/clef-decision-models
- Leaderboard Decision Index: https://clef-evals.workers-ai-mle.workers.dev
- Cookbook de SGLang: https://docs.sglang.io/cookbook/autoregressive/Cloudflare/clef#hw=h200&variant=clef&quant=bf16&strategy=balanced&nodes=single
