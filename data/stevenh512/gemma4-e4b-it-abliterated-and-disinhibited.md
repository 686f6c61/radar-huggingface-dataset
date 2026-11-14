# stevenh512/gemma4-E4B-it-Abliterated-AND-Disinhibited

## Resumen

`stevenh512/gemma4-E4B-it-Abliterated-AND-Disinhibited` es una variante modificada de `google/gemma-4-E4B-it`, un modelo multimodal de tipo image-text-to-text desarrollado originalmente por Google. La modificación, atribuida en la model card a `treadon` y redistribuida por `stevenh512`, aplica dos ablaciones de rango 1 sobre el flujo residual (residual stream) del modelo base: una para eliminar la dirección de rechazo por seguridad (abliteration) y otra para eliminar la dirección de neutralidad o hedging (disinhibition). El resultado es un modelo con los mismos pesos de conocimiento y arquitectura que el original, pero sin los comportamientos entrenados de rechazo y de evasión de opinión.

El modelo cuenta con aproximadamente 7.941 millones de parámetros según el archivo safetensors real, y el repositorio ocupa 15,9 GB. La modificación de `stevenh512` consiste en una copia uno a uno del modelo de `treadon` con el archivo `processor_config.json` restaurado desde el modelo base de Google, lo que permite exportar la cabeza multimodal (mmproj) a GGUF para su uso con llama.cpp. Es relevante para investigadores en interpretabilidad mecanicista y alineación que estudian las direcciones de rechazo y neutralidad de forma compuesta, no aislada.

La licencia es la Gemma License de Google, lo que impone restricciones de uso comercial y de redistribución que conviene revisar antes de cualquier despliegue en producción. El modelo tiene 2 descargas y 0 likes en el momento de la consulta, y fue creado el 6 de noviembre de 2026 y actualizado el 14 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), base Gemma 4 E4B |
| Parametros totales | 7.941.100.874 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor menciona exportacion de mmproj a GGUF para llama.cpp) |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma License) |
| Formato de pesos | safetensors (repositorio de 15,9 GB); exportable a GGUF segun la model card |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E4B-it`, un transformer multimodal de Google que procesa entradas de imagen y texto. Sobre esa base, la modificación aplica dos ablaciones de rango 1 sobre el flujo residual, sin fine-tuning ni datos adicionales. Según la model card, las dos direcciones (rechazo por seguridad y neutralidad) son aproximadamente ortogonales en el espacio del flujo residual, por lo que las cirugías se componen. El procedimiento es secuencial: primero se aplica la desinhibición en la capa L=20 con escala 1.5, y después se ablaciona el rechazo en 17 capas con escala 1.0 sobre el modelo ya modificado.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base, más allá de lo que Google publique para Gemma 4 E4B-it. La innovación técnica destacable es precisamente el método de doble ablación compuesta documentado en el blog del autor, que permite eliminar dos comportamientos entrenados de forma simultánea manteniendo el resto de capacidades del modelo.

## Capacidades

- Generación de texto conversacional y multimodal (image-text-to-text), heredada del modelo base Gemma 4 E4B-it.
- Respuestas comprometidas con una opinión cuando se le pide, sin párrafos de disclaimer ni evasión de neutralidad.
- Respuesta directa a prompts que el modelo original rechazaría por seguridad, según los ejemplos de la model card.
- Procesamiento de imágenes y texto combinados, con exportación de la cabeza multimodal a GGUF para llama.cpp.
- Capacidades de razonamiento y conocimiento general heredadas del modelo base (no se detallan benchmarks específicos).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio: la visión está confirmada por el pipeline image-text-to-text; audio no disponible.

## Casos de uso

- Investigación en interpretabilidad mecanicista: el modelo sirve como banco de pruebas para estudiar cómo interactúan las direcciones de rechazo y neutralidad en el flujo residual, aplicando ablaciones compuestas y comparando con las variantes de ablación única publicadas por el mismo autor.
- Estudio de alineación y seguridad: permite analizar qué comportamientos del modelo base están codificados en direcciones lineales y cómo se degradan o preservan al eliminarlas, con las eval sets `treadon/abliteration-eval` y `treadon/disinhibition-eval`.
- Generación de opiniones comprometidas en entornos de investigación: útil para experimentos donde se necesita que el modelo adopte una postura clara sobre temas controvertidos (política, ética, economía) sin hedging, por ejemplo en estudios de sesgo o de persuasión.
- Análisis de prompts restringidos: permite examinar cómo responde un modelo de chat de frontera a solicitudes que el original rechazaría, en un contexto controlado de laboratorio y con fines de auditoría de seguridad.
- Despliegue local con llama.cpp: al restaurarse `processor_config.json`, la cabeza multimodal se puede exportar a GGUF, lo que facilita la inferencia en hardware de consumo para experimentos reproducibles.
- Baseline para comparativas de ablación: sirve como referencia frente a `gemma4-E4B-it-abliterated` y `gemma4-E4B-it-disinhibited` para medir el efecto combinado de ambas cirugías en una misma evaluación.
- Demostraciones interactivas: el Space enlazado en la model card permite probar el comportamiento del modelo sin infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 7.941 millones de parámetros, en FP16 se necesitan aproximadamente 15,9 GB solo para pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabría esperar viabilidad en GPUs de 24 GB o más en FP16, y en GPUs de consumo de 8-12 GB con cuantización a 4-8 bits, aunque el autor no lo confirma.
- ¿Cabe en consumer GPU?: no confirmado en la información; la mención de exportación a GGUF para llama.cpp sugiere que el autor prevé su uso en entornos locales.
- Opciones de despliegue: transformers (librería declarada) y llama.cpp mediante exportación de mmproj a GGUF. vLLM, Ollama y TGI no se mencionan en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modificación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| stevenh512/gemma4-E4B-it-Abliterated-AND-Disinhibited | 7.941.100.874 | no disponible | Abliteration + disinhibition | gemma | Hugging Face (2 descargas) |
| treadon/gemma4-E4B-it-abliterated | no disponible | no disponible | Solo abliteration | gemma | Hugging Face |
| treadon/gemma4-E4B-it-disinhibited | no disponible | no disponible | Solo disinhibition | gemma | Hugging Face |
| google/gemma-4-E4B-it | no disponible | no disponible | Modelo base sin modificar | gemma | Hugging Face |

## Limitaciones y advertencias

- El modelo elimina deliberadamente el comportamiento de rechazo por seguridad, por lo que puede generar contenido dañino, ilegal o éticamente problemático que el modelo base rechazaría. No es apto para despliegues de producción orientados al público sin salvaguardas externas.
- Elimina la neutralidad entrenada: tiende a comprometerse con opiniones sobre temas controvertidos, lo que puede introducir sesgos y posturas no calibradas en contextos donde se espera imparcialidad.
- La ablación es una intervención lineal y puede degradar capacidades del modelo base de forma no documentada; no se han publicado benchmarks que cuantifiquen la pérdida de rendimiento.
- Riesgo de alucinación: no evaluado en la información disponible; el modelo conserva los pesos de conocimiento del base, pero la modificación podría alterar la calibración.
- Restricciones de licencia: la Gemma License impone términos de uso, restricciones de redistribución y obligaciones que deben revisarse antes de cualquier uso comercial.
- Idiomas soportados y longitud de contexto no documentados en la información proporcionada.
- El repositorio tiene muy poca tracción (2 descargas, 0 likes) y fue creado en noviembre de 2026; no hay evidencia de validación independiente.
- La model card original incluye ejemplos de prompts restringidos (por ejemplo, instrucciones para fabricar explosivos) que se citan aquí solo como datos de referencia y no deben interpretarse como instrucciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stevenh512/gemma4-E4B-it-Abliterated-AND-Disinhibited
- Modelo original de treadon: https://huggingface.co/treadon/gemma4-E4B-it-Abliterated-AND-Disinhibited-USE-THIS
- Modelo base de Google: https://huggingface.co/google/gemma-4-E4B-it
- Variante solo abliteration: https://huggingface.co/treadon/gemma4-E4B-it-abliterated
- Variante solo disinhibition: https://huggingface.co/treadon/gemma4-E4B-it-disinhibited
- Dataset de evaluación de desinhibición: https://huggingface.co/datasets/treadon/disinhibition-eval
- Dataset de evaluación de abliteration: https://huggingface.co/datasets/treadon/abliteration-eval
- Demo en Spaces: https://huggingface.co/spaces/treadon/gemma4-E4B-it-Abliterated-AND-Disinhibited-USE-THIS
- Blog del autor sobre la técnica: https://www.riteshkhanna.com/blog/abliterate-AND-disinhibit-gemma
- Perfil del autor en X: https://x.com/treadon
