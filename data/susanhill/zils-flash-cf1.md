# SusanHill/zils-flash-cf1

## Resumen

Clef-Flash es un modelo multimodal de 9.409.813.744 parámetros (aproximadamente 9,4B) desarrollado por SusanHill (publicado bajo el paraguas de Cloudflare según la model card) y afinado a partir de Qwen/Qwen3.5-9B. No es un modelo generativo de texto libre: es un modelo de decisión que recibe un estado (texto, JSON, imágenes o vídeo) y un esquema de preguntas tipadas, y devuelve en un único forward pass una probabilidad para cada opción permitida de cada pregunta. Elimina por completo la generación libre y el parsing de la salida.

La arquitectura combina el backbone Qwen3.5-9B con su codificador visual, almacenado como safetensors fragmentados estándar, más una cabeza transformer pequeña ("joint schema head") que lee los estados ocultos finales del backbone, enruta la evidencia del estado hacia cada pregunta y puntúa conjuntamente todas las opciones de todas las preguntas. La salida es un logit por opción permitida; aplicando softmax por pregunta se obtienen probabilidades calibradas.

Es relevante porque ataca un problema concreto de producción: sustituir pipelines frágiles de "prompt + parseo de JSON" por un modelo que emite decisiones estructuradas directamente, con API compatible con Jev y SystemOne. Su licencia Apache-2.0 y su soporte de SGLang lo hacen desplegable en infraestructura propia, aunque el modelo tiene cero descargas y cero likes en Hugging Face en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone Qwen3.5-9B con vision encoder) + joint schema head (cabeza transformer pequeña) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card solo documenta bf16 en los ejemplos de SGLang) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fragmentados, con `model.safetensors.index.json`); cabeza en `joint_head.safetensors`; código en `joint_schema_model.py` |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, conservando su backbone y su codificador visual. Sobre los estados ocultos finales del backbone se añade una "joint schema head": una cabeza transformer pequeña que codifica el esquema de preguntas, enruta la evidencia relevante del estado hacia cada pregunta y puntúa conjuntamente todas las opciones de todas las preguntas en un solo paso. La salida son logits por opción permitida; un softmax por pregunta produce las probabilidades. El repositorio incluye `joint_schema_model.py`, que implementa la codificación de registros, el batching, el modelo, `load_release_model` y la función `systemone`.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineación. La model card describe el proceso como "post-train" sobre Qwen3.5-9B, sin detallar la metodología. El modelo se probó con `torch` 2.11 y `transformers` 5.10.2 en una H200; los ejemplos de despliegue con SGLang cubren H200, B200 y B300. Existe una variante mayor, Cloudflare/clef, para la que se remite a su propia ficha.

## Capacidades

- Decisión estructurada multimodal: ingiere estados en texto, JSON, imágenes y vídeo, y devuelve probabilidades por opción en un único forward pass.
- Tres tipos de pregunta: `choice` (selección entre opciones con `confidence` y `probabilities`), `score` (puntuación con `legend` y distribución) y `noul` (probabilidad de verdadero/falso).
- Sin generación de texto libre ni parsing: la salida es directamente tipada y consumible por máquina.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como tal; el modelo está diseñado para decisiones de un solo paso.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidad especial: API compatible con Jev y SystemOne (`POST /v1/systemone`), con respuestas que incluyen `model`, `answers` por ID de pregunta y `usage`.
- Mezcla de registros solo texto y multimodales en el mismo batch.

## Casos de uso

- Clasificación de tickets de soporte: se define un esquema con preguntas `choice` (departamento: billing/technical) y `noul` (¿hay una caída de servicio?) sobre el texto del mensaje; el modelo devuelve probabilidades por opción sin necesidad de parsear la salida.
- Triaje de urgencia: una pregunta `score` con leyenda ("Puede esperar", "Esta semana", "Hoy") permite priorizar colas de atención con una puntuación esperada y su confianza asociada.
- Procesamiento de facturas y recibos: se pasa una imagen del documento como `images` y se pregunta si el total es legible o si la factura está pagada, obteniendo decisiones tipadas directamente del pipeline OCR.
- Enrutado de correo entrante: un estado JSON con metadatos del remitente y asunto se convierte en decisiones de categoría y acción mediante preguntas `choice`, integrable en reglas de negocio posteriores.
- Moderación y verificación de contenido en vídeo: con `videos` como arrays de fotogramas, se evalúan preguntas booleanas (`noul`) sobre presencia de elementos concretos, sin generación de texto.
- Automatización de flujos de aprobación: el modelo decide si una solicitud cumple criterios definidos en el esquema, devolviendo confianza calibrada que permite umbralizar y escalar a revisión humana los casos dudosos.
- Integración en backends compatibles con SystemOne: el endpoint `/v1/systemone` de SGLang permite sustituir servicios de decisión existentes sin cambiar el contrato de la API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente referencia un "Decision Index leaderboard" externo (clef-evals.workers-ai-mle.workers.dev) sin incluir cifras en la ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 9,4B parámetros en bf16 el peso ronda los 18,8 GB, a lo que hay que sumar el codificador visual y la caché de activaciones.
- GPU recomendadas: H200 (configuración de referencia probada), B200 y B300 (comandos documentados en el cookbook de SGLang).
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; el tamaño del repo (19,1 GB) sugiere que en bf16 no cabe en GPUs de 16 GB y requeriría cuantización no documentada para GPUs de 24 GB.
- Opciones de despliegue: SGLang (`lmsysorg/sglang:dev-clef`, endpoint `/v1/systemone`), uso directo con `transformers` 5.10.2 y `torch` 2.11 mediante `joint_schema_model.py`. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Clef-Flash (este modelo) | 9,4B | no disponible | Probabilidades tipadas por pregunta | Apache-2.0 | Hugging Face (0 descargas) |
| Cloudflare/clef | no disponible (variante mayor) | no disponible | Probabilidades tipadas por pregunta | no disponible | Hugging Face |
| Qwen/Qwen3.5-9B (base) | ~9B | no disponible | Texto libre generativo | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparado entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de decisión, no de generación: no puede producir texto libre ni respuestas abiertas; cualquier caso de uso que requiera explicaciones o resúmenes queda fuera de su alcance.
- Sesgos conocidos: no disponibles; al derivar de Qwen3.5-9B hereda los sesgos de su base y de sus datos de post-entrenamiento, no documentados.
- Riesgo de alucinación: reducido por diseño al no generar texto, pero las probabilidades pueden estar mal calibradas en estados fuera de distribución; se recomienda umbralizar y validar con datos propios.
- Idiomas soportados no declarados: no hay garantía de comportamiento multilingüe más allá de lo que herede del backbone.
- Longitud de contexto no documentada: limita la planificación para estados largos (documentos extensos, vídeos de muchos fotogramas).
- Requiere código personalizado (`joint_schema_model.py` con `trust_remote_code` implícito) y versiones concretas de `torch` y `transformers`, lo que añade fricción de integración.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones de la licencia del modelo base Qwen3.5-9B.
- Madurez: cero descargas y cero likes en Hugging Face; sin benchmarks publicados en la ficha. No recomendable para producción crítica sin evaluación propia.

## Enlaces

- Hugging Face: https://huggingface.co/SusanHill/zils-flash-cf1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante mayor Clef: https://huggingface.co/Cloudflare/clef
- Anuncio en el blog de Cloudflare: https://blog.cloudflare.com/clef-decision-models
- Leaderboard Decision Index: https://clef-evals.workers-ai-mle.workers.dev
- Cookbook de SGLang: https://docs.sglang.io/cookbook/autoregressive/Cloudflare/clef#hw=h200&variant=flash&quant=bf16&strategy=balanced&nodes=single
