# wesjos/DecisionFairy-4B

## Resumen

DecisionFairy-4B es un modelo de decisión no autorregresivo desarrollado por el usuario wesjos (HuggingFace) y publicado bajo licencia Apache-2.0. Se construye sobre el backbone multimodal Qwen3.5-4B (4.659.865.088 parámetros totales en bf16) al que se le añade una cabeza de esquema conjunta (*joint schema head*) de 32,05 millones de parámetros. En lugar de generar texto token a token, el modelo evalúa en una sola pasada hacia delante todas las opciones de todos los campos solicitados simultáneamente, devolviendo probabilidades por opción.

El modelo resuelve un problema concreto: convertir un estado arbitrario (texto libre o JSON) en decisiones estructuradas y tipadas (sí/no, elección entre opciones, puntuación en una escala) con distribuciones de probabilidad asociadas. Está pensado para integrarse en pipelines de agentes y sistemas de enrutamiento donde se necesita una salida determinista y cuantificada, no una respuesta en lenguaje natural.

Es relevante por su enfoque poco habitual: reutiliza un backbone de 4B con capacidades multimodales y lo especializa mediante entrenamiento con `FastDecisionModel` / `DecisionTrainer` de Unsloth sobre los datasets `LocalLLaMA/typed-decisions` y `SargeDev/jev-distill-corpus-v3`. La ventana de entrenamiento es de 1024 tokens, lo que limita su uso a estados y preguntas relativamente compactos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5-4B) + cabeza de decisión conjunta (proyección + enrutamiento, 4 bloques, 8 cabezas, anchura 512, 2 capas de enrutamiento) |
| Parametros totales | 4.659.865.088 (backbone) + 32,05 M (cabeza) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (longitud de entrenamiento; el loader acepta hasta 16384 pero el modelo no fue entrenado para ello) |
| Tipos de cuantizacion | bf16 (pesos publicados); carga en 4 bits vía Unsloth (`load_in_4bit=True`) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors-0000{1,2}-of-00002`, bf16, ~9,3 GB; `joint_head.safetensors`, 64 MB) |

## Arquitectura y entrenamiento

El modelo combina un backbone Qwen3.5-4B (arquitectura transformer multimodal, guardada con `Qwen3_5ForConditionalGeneration` en transformers 5.10.4) con una cabeza de decisión conjunta que sigue el diseño de Clef de Cloudflare: proyección y enrutamiento sobre cada pregunta y cada span de opción. La cabeza tiene 32,05 M de parámetros distribuidos en 122 tensores, con anchura 512, 4 bloques, 8 cabezas de atención y 2 capas de enrutamiento. El entrenamiento se realizó con `FastDecisionModel` / `DecisionTrainer` de Unsloth sobre los datasets `LocalLLaMA/typed-decisions` y `SargeDev/jev-distill-corpus-v3`, con `max_seq_length = 1024`.

La innovación principal es la naturaleza no autorregresiva del modelo: no hay decodificación token a token ni salida de lenguaje. Una única pasada hacia delante puntúa todas las opciones de todos los campos solicitados de forma conjunta, lo que elimina la latencia de generación y produce directamente distribuciones softmax por campo. El modelo soporta tres tipos de pregunta: `noul` (probabilidad de que una afirmación sea cierta, 0-1), `choice` (mejor opción más probabilidad por opción) y `score` (nivel esperado en una escala de 2 a 10, posiblemente fraccionario, más probabilidad por nivel). No se dispone de información sobre el número de tokens de entrenamiento ni sobre si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Decisión estructurada tipada: responde preguntas de tipo `noul` (sí/no con probabilidad), `choice` (selección entre opciones) y `score` (puntuación en escala) en una sola pasada.
- Evaluación conjunta de múltiples campos: todos los campos de una petición se deciden simultáneamente, sin generación secuencial.
- Salida probabilística por campo: distribuciones softmax sobre opciones o niveles, con campo `confidence` asociado.
- Entrada de estado flexible: acepta un `state` como cadena de texto o cualquier JSON.
- Soporte de tool calling / function calling: no disponible explícitamente en la documentación; la interfaz es una API de decisión (`/v1/systemone`), no un protocolo de herramientas.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo está diseñado como componente de decisión puntual, no como planificador autónomo.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- Capacidades especiales: el loader acepta claves `images` y `videos`, pero esta release no incluye evaluación con imagen o vídeo; debe tratarse como modelo de texto.
- Sin generación de texto: no existe salida de lenguaje natural que leer.

## Casos de uso

- Triaje de incidentes en producción: dado un estado con logs o descripción del fallo, el modelo asigna un nivel de severidad (`choice` entre P0/P1/P2) y decide si escalar al ingeniero de guardia (`noul`) en una sola pasada, con probabilidades que permiten umbralizar la automatización.
- Enrutamiento de tickets de soporte: clasificar la categoría de una incidencia y estimar su urgencia (`score`) a partir del texto del cliente, usando las probabilidades por opción para derivar a colas distintas según confianza.
- Moderación y políticas de contenido: evaluar si un texto cumple una política (`noul`) y graduar la gravedad (`score`) con distribución por nivel, útil para sistemas que necesitan umbrales auditables en lugar de texto libre.
- Validación de formularios y datos estructurados: dado un JSON de entrada, decidir si un campo es coherente (`noul`) o seleccionar la categoría correcta entre un conjunto cerrado (`choice`), integrándose en pipelines de limpieza de datos.
- Decisión en agentes automáticos: como componente de bajo coste que sustituye a una llamada generativa cuando solo se necesita una elección discreta (por ejemplo, qué herramienta invocar o si se requiere confirmación humana), con latencia de una pasada y sin tokens de salida.
- Aprobación de reembolsos y disputas: con un estado como "el cliente dice que le cobraron dos veces", decidir si procede reembolso (`noul`) y clasificar el tipo de disputa (`choice`), tal como muestra el ejemplo de la model card.
- Clasificación de riesgo en flujos financieros o de compliance: puntuar el nivel de riesgo (`score` en escala de 2 a 10) y marcar banderas booleanas por criterio, aprovechando que todas las decisiones se computan conjuntamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 9,3 GB para el backbone más 64 MB de la cabeza, más overhead de activaciones y del procesador; en la práctica se recomienda una GPU con al menos 12-16 GB para inferencia cómoda a 1024 tokens.
- VRAM estimada en 4 bits (Unsloth `load_in_4bit=True`): aproximadamente la mitad del peso del backbone, en torno a 5-6 GB, según indica la propia model card ("halve VRAM").
- GPU recomendadas: A100, H100 o L40S para despliegue en producción; RTX 4090, RTX 4080 o RTX 3090 para desarrollo y despliegue en consumer.
- Cabe en GPU de consumo: sí, en RTX 3090/4080/4090 con cuantización 4 bits; en bf16 requiere al menos 12 GB de VRAM libre.
- Opciones de despliegue: `joint_schema_model.py` (solo torch + transformers), Unsloth `FastDecisionModel`, y servidor FastAPI incluido (`serve_systemone.py`, puerto por defecto 18095, endpoint `/v1/systemone`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser no autorregresivo, la latencia equivale a una única pasada hacia delante más el preprocesado, sin coste de decodificación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DecisionFairy-4B | 4,66 B + 32 M (cabeza) | 1024 tokens | Decisiones tipadas con probabilidades | Apache-2.0 | HuggingFace (53 descargas) |
| Qwen3.5-4B (base) | ~4 B | no disponible | Generación de texto | Apache-2.0 | HuggingFace |
| Cloudflare Clef (diseño de referencia) | no disponible | no disponible | Decisiones estructuradas | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Ventana de contexto muy limitada: entrenado con `max_seq_length = 1024`; estados y preguntas deben caber en ~1024 tokens. El valor por defecto de `systemone()` es 16384, longitud para la que el modelo no fue entrenado, por lo que hay que pasar `max_length=1024` explícitamente.
- Sin generación de texto: no produce lenguaje natural; solo devuelve decisiones y probabilidades. No es adecuado para tareas conversacionales o de redacción.
- Probabilidades no calibradas: son softmax por campo, no calibradas sobre datos del usuario; el campo `confidence` no es comparable entre modelos. Se recomienda umbralizar sobre la probabilidad de una opción concreta.
- Modalidad multimodal no evaluada: aunque el backbone es multimodal y el loader acepta `images` y `videos`, esta release no incluye evaluación con imagen o vídeo; debe tratarse como modelo de texto.
- Idiomas no especificados: no se documenta qué lenguas soporta; el comportamiento fuera del inglés (u otros idiomas del corpus de entrenamiento) es incierto.
- Riesgo de alucinación en las decisiones: al ser un clasificador probabilístico sobre un backbone generativo, puede asignar alta confianza a opciones incorrectas en estados ambiguos o fuera de distribución; requiere validación con datos propios.
- Sesgos: no documentados por el autor; al heredar el backbone Qwen3.5-4B, puede arrastrar sesgos de sus datos de entrenamiento.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones del backbone Qwen3.5-4B y de los datasets de entrenamiento (`LocalLLaMA/typed-decisions`, `SargeDev/jev-distill-corpus-v3`) antes de un despliegue en producción.
- Madurez: 53 descargas y 0 likes en el momento de la consulta; proyecto reciente (creado en octubre de 2026) sin benchmarks publicados ni validación externa conocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wesjos/DecisionFairy-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Dataset de entrenamiento: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- Unsloth (`FastDecisionModel` / `DecisionTrainer`): no disponible en la información proporcionada
- Paper o blog de Clef (Cloudflare), diseño de referencia de la cabeza: no disponible en la información proporcionada
