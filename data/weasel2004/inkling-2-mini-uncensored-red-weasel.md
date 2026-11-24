# weasel2004/inkling-2-mini-uncensored-red-weasel

## Resumen

Inkling 2 Mini Uncensored (Red Weasel) es una modificación del modelo multimodal Inkling 2 Mini desarrollado por Thinking Machines Lab. La modificación, realizada por el usuario weasel2004 bajo la marca Red Weasel, consiste en una abliteración aplicada directamente sobre los pesos del modelo para eliminar su comportamiento de rechazo (refusal), manteniendo intacta la arquitectura original `inkling2_loop`, la torre de visión, la plantilla de chat y el formato de los ficheros.

El modelo base es un transformer de tipo mezcla de expertos (MoE) con 26.388.646.440 parámetros totales, capacidades de imagen-texto-a-texto y pesos en formato safetensors. La modificación no introduce fine-tuning ni datos nuevos: únicamente elimina una dirección de rechazo identificada en el flujo residual mediante una búsqueda parametrizada sobre dónde y con qué intensidad aplicarla.

La relevancia de esta ficha es doble: por un lado documenta un caso práctico de abliteración sobre un MoE multimodal con expertos cuantizados en NVFP4 y MXFP8; por otro, advierte de que el modelo responderá solicitudes que el original declina, lo que traslada al usuario la responsabilidad legal y ética del uso. La licencia Apache 2.0 del original se mantiene, así como la política de uso aceptable de Thinking Machines.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `inkling2_loop` (transformer MoE multimodal con torre de visión) |
| Parametros totales | 26.388.646.440 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos NVFP4 (capas 0-19), expertos MXFP8 (capas 20-23), pesos densos en BF16; cuantización de 8 bits declarada en los tags (modelopt) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Inkling 2 Mini emplea la arquitectura `inkling2_loop`, un transformer de mezcla de expertos con 24 capas y una torre de visión que habilita la modalidad image-text-to-text. Los expertos de las capas 0 a 19 están codificados en NVFP4 (4 bits) y los de las capas 20 a 23 en MXFP8 (8 bits), mientras que los pesos densos se mantienen en BF16. El repositorio ocupa 20,2 GB y los pesos se distribuyen en safetensors.

La modificación Red Weasel no reentrena el modelo. Se identificó una dirección de rechazo en el flujo residual contrastando los estados internos del modelo ante prompts que rechaza y prompts que responde, y se eligió la intervención mediante una búsqueda parametrizada. La eliminación se integró en tres tipos de pesos: la tabla de embeddings de tokens, todas las proyecciones de salida de atención y la proyección down (w2) de cada experto en las 24 capas. El modelo escribe en el flujo residual a través de un filtro por canal tras cada una de estas operaciones, y la edición se resolvió a través de ese filtro para que la dirección se elimine donde el modelo realmente la lee. Los expertos NVFP4 se redondearon con noise shaping a lo largo de la dirección eliminada para que el redondeo a 4 bits no cancele la edición; los MXFP8 se redondearon al más cercano. Las intensidades aplicadas fueron 1.5 en embeddings, 1.5 en atención y 1.0 en expertos, registradas en `abliteration_bake.json`. No hubo fine-tuning ni datos nuevos.

## Capacidades

- Generación de texto conversacional multi-turno.
- Comprensión de imágenes y respuesta texto-a-texto (pipeline image-text-to-text).
- Razonamiento con modo de pensamiento configurable (thinking effort `high` recomendado).
- Generación de código, según los conjuntos de prompts de codificación empleados en la evaluación del autor.
- Respuesta a solicitudes que el modelo original rechaza, tras la eliminación del comportamiento de rechazo.
- Compatibilidad con los runtimes del original: Transformers, vLLM, SGLang y Mach X, sin ficheros, flags ni hooks adicionales.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y abliteración: el modelo sirve como caso de estudio reproducible de eliminación de dirección de rechazo sobre un MoE multimodal cuantizado, con intensidades y metodología documentadas en `abliteration_bake.json`.
- Evaluación comparativa de robustez: permite medir la degradación en prompts ordinarios y de codificación frente al original (4,0 rechazos y 5,8 respuestas inacabadas de media sobre 88 prompts), útil para cuantificar el coste de la abliteración.
- Despliegue en Intel Arc: mediante Mach X (`ie serve <folder>`) se puede servir el modelo en hardware Arc, un entorno con menos soporte en el ecosistema habitual.
- Procesamiento de documentos con imagen: al conservar la torre de visión y el pipeline image-text-to-text, puede emplearse para extracción y descripción de contenido visual en pipelines propios.
- Generación de código en entornos controlados: los tags y la evaluación del autor incluyen prompts de codificación, por lo que puede integrarse en flujos de asistencia a programación donde se requiera ausencia de rechazos.
- Experimentación con cuantización híbrida NVFP4/MXFP8: el modelo permite estudiar el impacto del redondeo con noise shaping en expertos de 4 bits sobre el comportamiento final.
- Base para futuras modificaciones: al mantener el formato, la plantilla de chat y los ficheros del original, sirve como punto de partida para otras intervenciones sobre pesos sin necesidad de reconstruir el pipeline.

## Benchmarks y rendimiento

El autor publica recuentos de comportamiento, no benchmarks estándar. Se muestreó con temperatura 1.0 y thinking effort `high`:

| Conjunto de prompts | Resultado |
|---|---|
| 104 prompts que el original rechaza | 90 respondidos, 2 declinados, 12 aún razonando en el límite de tokens |
| 88 prompts ordinarios y de codificación (media de 5 semillas) | 4,0 declinados, 5,8 inacabados en el límite de tokens |

El autor advierte de una pequeña pérdida esperada en prompts ordinarios frente al original (algunos rechazos e inacabados más), atribuida principalmente al redondeo a 4 bits de los expertos editados. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 20,2 GB en safetensors, por lo que se requiere al menos esa cifra más overhead de activaciones y caché KV.
- GPU recomendadas: no disponible en la información proporcionada; el autor menciona Intel Arc como plataforma soportada vía Mach X.
- Cabe en GPU de consumo: no confirmado; 20,2 GB de pesos superan la VRAM de la mayoría de GPU consumer de 16 GB, por lo que probablemente requiere GPUs de 24 GB o más, aunque este dato no se confirma en la información disponible.
- Opciones de despliegue: Transformers, vLLM, SGLang y Mach X (Intel Arc, `ie serve <folder>`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Modalidad | Licencia | Estado |
|---|---|---|---|---|---|
| Inkling 2 Mini Uncensored (Red Weasel) | 26.388.646.440 | no disponible | image-text-to-text | Apache 2.0 | Publicado (0 descargas, 0 likes) |
| Inkling 2 Mini (Thinking Machines Lab) | no disponible | no disponible | image-text-to-text | Apache 2.0 | Modelo base original |
| Otras variantes abliterated de la familia Inkling | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con alternativas de la misma categoría (MoE multimodal abliterado de ~26B) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo responde a solicitudes que el original declina; el usuario es responsable del uso y del cumplimiento legal en su jurisdicción.
- Siguen aplicando la licencia Apache 2.0 del original y la Model Acceptable Use Policy de Thinking Machines.
- Pérdida de calidad esperada en prompts ordinarios: más rechazos e inacabados que el original, atribuida al redondeo a 4 bits de los expertos editados.
- Los recuentos publicados se midieron antes de una reparación final de 1.427 escalas de bloque de expertos que la primera versión escribió con código inválido (NaN); el fichero publicado es el reparado.
- Riesgo de alucinación: no cuantificado en la información disponible, pero inherente a los modelos de lenguaje.
- Sesgos conocidos: no documentados en la información disponible.
- Limitaciones de contexto e idioma: no documentadas; los idiomas soportados figuran como no disponibles.
- Trazabilidad escasa: 0 descargas y 0 likes en el momento de la ficha, sin validación independiente de los resultados declarados por el autor.
- La abliteración no elimina la posibilidad de respuestas dañinas ni garantiza coherencia en dominios sensibles; debe evaluarse antes de cualquier uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/weasel2004/inkling-2-mini-uncensored-red-weasel
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Motor de inferencia Mach X (Intel Arc): https://github.com/Red-Weasel/machx-inference-engine
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Política de uso aceptable de Thinking Machines: https://thinkingmachines.ai/model-acceptable-use-policy/
