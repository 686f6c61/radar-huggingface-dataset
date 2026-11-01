# xquantize/userrepgen-4b-6bit

## Resumen

userrepgen-4b-6bit es una conversión cuantizada a 6 bits en formato MLX del modelo microsoft/UserRepGen-4B, desarrollada por el usuario xquantize para su ejecución en Apple Silicon. El modelo original, publicado por Microsoft bajo licencia MIT, no es un chatbot al uso: recibe una conversación multi-turno entre usuario y asistente y devuelve un objeto JSON que describe al usuario, con dos campos: `task` (qué pretende conseguir) y `user_behavior` (cómo se comporta durante la interacción). Esta representación estructurada del usuario resulta útil para personalización, enrutamiento o análisis de conversaciones.

La conversión mantiene los 4.205.751.296 parámetros del modelo base y ocupa unos 3,4 GB en el repositorio (alrededor de 3,2 GB de descarga), lo que permite ejecutarlo en Macs con 16 GB o más de memoria unificada. Según el autor, esta variante de 6 bits es la recomendada: igualó al modelo bf16 original en las pruebas realizadas, mientras que las variantes de 4 bits fallaron en al menos una conversación por bucles de repetición que invalidaban el JSON.

La relevancia de esta ficha radica en que documenta una alternativa práctica para desplegar un modelo de representación de usuario en hardware de consumo Apple, con una ventana de entrada de hasta 8192 tokens heredada del modelo original y una licencia permisiva que facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen 3.5, según el tag `qwen3_5`); detalles completos no disponibles |
| Parametros totales | 4.205.751.296 |
| Parametros activos | No aplica (no es MoE, según la informacion disponible) |
| Longitud de contexto | Hasta 8192 tokens de entrada (heredada del modelo original) |
| Tipos de cuantizacion | 6 bits (esta version); el autor ofrece tambien 8 bits y variantes de 4 bits no recomendadas |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | Safetensors en formato MLX (libreria `mlx`) |

## Arquitectura y entrenamiento

El modelo base es un transformer de 4.200 millones de parámetros etiquetado con la familia `qwen3_5`, lo que sugiere una arquitectura derivada de Qwen 3.5, aunque la información disponible no detalla la composición exacta de capas, atención ni normalización. La conversión a 6 bits se realizó con `mlx-lm` 0.32.0 mediante el comando `mlx_lm.convert --hf-path microsoft/UserRepGen-4B -q --q-bits 6`, que cuantiza los pesos para aprovechar el backend MLX en chips Apple. Esta versión es solo de texto: los pesos de visión del modelo original no se incluyen.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. La model card de la conversión remite a la model card de Microsoft para los detalles de entrenamiento y las limitaciones conocidas. La innovación destacable de esta variante es la propia cuantización a 6 bits: el autor reporta que iguala al bf16 en validez de JSON y ausencia de repeticiones, algo que las variantes de 4 bits no consiguen.

## Capacidades

- Generación de representaciones estructuradas del usuario en JSON a partir de conversaciones multi-turno, con los campos `task` y `user_behavior`.
- Comprensión de conversaciones completas de usuario y asistente formateadas como historial de texto.
- Generación de JSON válido de forma consistente en la evaluación del autor (5/5 conversaciones con decodificación greedy).
- Ejecución en Apple Silicon mediante MLX, con carga directa desde Hugging Face.
- No es un chatbot: no está pensado para mantener diálogo conversacional, sino para producir una salida analítica.
- Requiere el uso de la plantilla `representation_prompt.txt` incluida en el repositorio y desactivar el modo thinking (`enable_thinking=False`).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, function calling, agentes y razonamiento multi-paso: no disponibles en la información proporcionada.

## Casos de uso

- Personalización de asistentes: antes de responder, el sistema pasa el historial de la conversación por UserRepGen-4B para extraer la tarea del usuario y su estilo de comportamiento, y adapta la respuesta o el tono en consecuencia. La ventana de 8192 tokens permite procesar historiales largos.
- Enrutamiento inteligente de peticiones: el campo `task` del JSON generado puede alimentar un clasificador o un router que derive la conversación al agente, herramienta o cola de soporte adecuada, sin necesidad de un LLM grande adicional.
- Análisis de conversaciones de soporte: procesar en lote transcripciones de atención al cliente para etiquetar intenciones y comportamientos del usuario, y alimentar paneles de analítica o sistemas de calidad.
- Investigación sobre simulación de usuarios: el modelo base está orientado a la simulación de usuarios; esta representación estructurada sirve como paso previo para generar perfiles que guíen simulaciones de diálogo o pruebas de sistemas conversacionales.
- Detección de frustración o confusión: el campo `user_behavior` permite identificar patrones de comportamiento (por ejemplo, dudas repetidas o correcciones) y activar intervenciones proactivas en un asistente.
- Prototipado local en Mac: gracias a los ~3,2 GB de descarga y su ejecución en MLX, un desarrollador puede integrar esta extracción de representación en un prototipo o script local sin GPU dedicada, por ejemplo en herramientas de escritorio o notebooks.
- Moderación y auditoría: revisar conversaciones almacenadas y extraer descripciones estructuradas del usuario para auditar el cumplimiento de políticas o detectar usos indebidos.

## Benchmarks y rendimiento

La información disponible solo incluye una evaluación cualitativa del autor sobre 5 conversaciones variadas (ayuda con Excel, depuración de Python, planificación de viaje, edición de escritura y una pregunta de salud), con decodificación greedy y comparación contra el modelo bf16 original ejecutado también en MLX. No hay resultados de benchmarks estándar como MMLU, HumanEval o GSM8K.

| Version | Bits/peso | JSON valido | Salidas con frases repetidas |
|---|---|---|---|
| bf16 (original) | 16 | 5/5 | 0/5 |
| 8 bits | 8,5 | 5/5 | 1/5 |
| 6 bits (este repo) | 6,5 | 5/5 | 0/5 |
| 4 bits, group size 32 | 5,0 | 4/5 | 1/5 |
| 4 bits, mixto 4/6 | 4,7 | 3/5 | 2/5 |
| 4 bits (simple) | 4,5 | 3/5 | 1/5 |

El propio autor advierte que esta prueba es una comprobación de sanidad pequeña y no un benchmark completo.

## Requisitos de hardware

- VRAM/memoria unificada estimada: alrededor de 3,2 GB de descarga; el autor indica que funciona cómodamente en Macs con 16 GB o más de memoria unificada.
- GPU recomendadas: chips Apple Silicon (series M1, M2, M3, M4 y posteriores) con al menos 16 GB de memoria unificada. No está pensado para GPU NVIDIA ni CUDA, ya que el formato es MLX.
- Cabe en GPU de consumo: sí, en Macs de consumo con 16 GB o más; no aplica a tarjetas gráficas dedicadas convencionales por el formato MLX.
- Opciones de despliegue: `mlx_lm` (librería MLX-LM) es la vía documentada; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de representación de usuario en la documentación proporcionada. Como referencia interna, el autor ofrece otras cuantizaciones del mismo modelo base:

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| xquantize/userrepgen-4b-6bit | 4,2 B | 6 bits | 8192 tokens | MIT | Disponible (recomendado por el autor) |
| xquantize/userrepgen-4b-8bit | 4,2 B | 8 bits | 8192 tokens | MIT | Disponible |
| microsoft/UserRepGen-4B | 4,2 B | bf16 | 8192 tokens | MIT | Modelo base original |

Comparativa con alternativas de otros autores: no disponible.

## Limitaciones y advertencias

- La evaluación publicada es una comprobación de sanidad con solo 5 conversaciones y decodificación greedy; no constituye un benchmark representativo.
- Las variantes de 4 bits del mismo modelo producen bucles de repetición e invalidan el JSON en varias conversaciones, por lo que no se recomienda bajar de 6 bits.
- El modelo no es un chatbot: usarlo como asistente conversacional producirá resultados fuera de su propósito.
- Requiere seguir estrictamente la plantilla `representation_prompt.txt` y desactivar el modo thinking; un uso incorrecto del prompt puede degradar la calidad del JSON.
- Esta conversión es solo de texto; no incluye las capacidades de visión del modelo original.
- Idiomas soportados no documentados: no hay garantía de calidad fuera del inglés, idioma de los ejemplos de la model card.
- Sesgos conocidos: no disponibles en la información proporcionada; se remite a la model card original de Microsoft.
- Riesgo de alucinación: no cuantificado; al generar descripciones del usuario, puede inferir tareas o comportamientos no presentes en la conversación.
- Licencia MIT: permite uso comercial, pero conviene revisar la model card original para condiciones adicionales del modelo base.
- Formato MLX: no es portable directamente a ecosistemas CUDA o a herramientas de inferencia estándar como vLLM o llama.cpp.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/xquantize/userrepgen-4b-6bit
- Modelo base original: https://huggingface.co/microsoft/UserRepGen-4B
- Versión de 8 bits del mismo autor: https://huggingface.co/xquantize/userrepgen-4b-8bit
- Perfil del autor de la conversión: https://huggingface.co/xquantize
- Librería MLX-LM: https://github.com/ml-explore/mlx-lm
