# wckwan/Webshop-Olmo3-7B-GRPO-Think-8192

## Resumen

Este modelo es una política de lenguaje de 7.000 millones de parámetros desarrollada por wckwan, construida sobre el modelo base allenai/Olmo-3-7B-Think. Se ha afinado mediante un proceso de aprendizaje por refuerzo denominado Process-GRPO, con el objetivo de actuar como agente de búsqueda multi-turno en tareas de navegación web, siguiendo el estilo Search-R1. El entrenamiento utiliza un modelo de recompensa de proceso (un verificador basado en Olmo-3-7B-Think) que puntúa cada turno de la interacción, con normalización de ventajas por grupo y posición de turno, e incorpora en los prompts del verificador las respuestas de las herramientas recuperadas y la respuesta correcta. Su relevancia radica en ser un ejemplo abierto (licencia Apache 2.0) de aplicación de técnicas de aprendizaje por refuerzo a agentes con tool use y razonamiento. El repositorio incluye tanto la política final (paso de entrenamiento 300) como los checkpoints intermedios de los pasos 100 y 200.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de allenai/Olmo-3-7B-Think; no se especifica si es MoE o hibrida) |
| Parametros totales | 7.000 millones (7B, segun denominacion del modelo base) |
| Parametros activos | No aplicable (modelo denso, no es MoE) |
| Longitud de contexto | 8192 tokens (inferido de la nomenclatura; no confirmado en la documentacion) |
| Tipos de cuantizacion | No disponible; el repositorio contiene pesos en safetensors sin cuantizaciones publicadas |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; raiz: politica final (step 300); subcarpetas step_100 y step_200 |

## Arquitectura y entrenamiento

El modelo es un afinado de allenai/Olmo-3-7B-Think, un modelo de lenguaje de 7.000 millones de parametros con capacidad de generacion de razonamiento previo a la respuesta ("thinking"). Sobre esta base se ha aplicado un entrenamiento de aprendizaje por refuerzo llamado Process-GRPO. En lugar de una recompensa global al final de la episodio, se usa un modelo de recompensa de proceso que puntua cada turno de la interaccion del agente. La normalizacion de ventajas se calcula por grupo y por posicion de turno, y los prompts del verificador incluyen las respuestas de las herramientas recuperadas y la respuesta correcta (gold answer). Este esquema permite que el modelo aprenda a utilizar herramientas de busqueda de forma mas robusta, seleccionando consultas y refinando la estrategia a lo largo de multiples turnos. Los datos de entrenamiento y el tamano del corpus no estan especificados en la informacion disponible; la incorporacion de tool use y el nombre del modelo sugieren un entorno de compras web (WebShop) con agentes de busqueda.

## Capacidades

- Generacion de texto con razonamiento previo: hereda el modo "think" de Olmo-3-7B-Think, generando pasos de razonamiento antes de la respuesta final.
- Tool use en multiples turnos: puede emitir consultas de busqueda, recibir respuestas de herramientas y continuar iterando hasta resolver una tarea.
- Actuacion como agente de busqueda estilo Search-R1: gestiona trayectorias de busqueda con una media de 2,6 busquedas por trayectoria en el entrenamiento, segun la model card.
- Soporte de decodificacion de multiples turnos: disenado para mantener contexto a lo largo de interacciones largas con herramientas.
- No se especifican capacidades de vision, audio, ni multilingues en la documentacion.

## Casos de uso

- Navegacion web automatizada en entornos de comercio electronico: el modelo puede ejecutar tareas de busqueda de productos, filtrar opciones y completar compras simuladas en entornos tipo WebShop, integrandose en pipelines de evaluacion de agentes.
- Asistentes de busqueda de informacion multi-turno: dado un objetivo, el modelo emite consultas, analiza resultados de herramientas y refina la busqueda a lo largo de varios turnos hasta alcanzar la respuesta.
- Investigacion en aprendizaje por refuerzo para tool use: al ser Apache 2.0, sirve como base reproducible para estudiar tecnicas de recompensa de proceso y normalizacion de ventajas en agentes LLM.
- Evaluacion de politicas en benchmarks de navegacion web: el modelo puede usarse para comparar politicas de busqueda o para reproducir experimentos en el entorno WebShop.
- Prototipos de agentes con recuperacion de informacion: puede adaptarse a contextos donde se necesita consultar motores de busqueda o bases de datos externas mediante herramientas.
- Analisis de robustez en agentes de razonamiento: el modelo permite examinar como la recompensa de proceso afecta a la calidad de las trayectorias de busqueda en entornos con multiples pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos cuantitativos provienen del resumen de entrenamiento del paso 300: puntuacion media del modelo de recompensa de proceso aproximadamente 0,93, busquedas por trayectoria aproximadamente 2,6 y precision del lote de entrenamiento aproximadamente 0,49. No se ofrecen comparaciones con otros modelos en tareas estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: con los pesos en precision completa (fp16/bf16), se estiman entre 14 y 16 GB de VRAM para el modelo de 7.000 millones de parametros. Con cuantizacion 4-bit (no incluida en el repositorio, pero posible mediante conversion), se estiman entre 5 y 6 GB de VRAM.
- GPU recomendada: para precision completa, una RTX 4090 de 24 GB, A100 de 40 GB o H100 de 80 GB. Para cuantizacion 4-bit, GPU consumer de 8-12 GB como RTX 3060 o RTX 4070.
- Si cabe en GPU consumer: si, siempre que se cuantice el modelo; en precision completa se requiere una tarjeta de al menos 16 GB.
- Opciones de despliegue: transformers (via AutoModelForCausalLM), vLLM, TGI, o llama.cpp / Ollama si se convierte previamente a formato GGUF. El repositorio es compatible con endpoints de inferencia de Hugging Face.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Webshop-Olmo3-7B-GRPO-Think-8192 | allenai/Olmo-3-7B-Think | 7B | 8192 (inferido) | Apache 2.0 | Hugging Face |
| WebShop-Olmo3-7B-GiGPO | allenai/Olmo-3-7B-Instruct | 7B | No disponible | Apache 2.0 | Hugging Face |
| allenai/Olmo-3-7B-Think | - | 7B | No disponible | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparados en benchmarks, por lo que la comparacion se limita a caracteristicas tecnicas declaradas.

## Limitaciones y advertencias

- El modelo ha sido entrenado en un dominio especifico (agentes de busqueda y compra web), por lo que su generalizacion a tareas generalistas puede ser limitada.
- No se han publicado datos sobre sesgos, composicion del dataset ni restricciones de los datos de entrenamiento.
- Como todo modelo de lenguaje, existe riesgo de alucinacion, especialmente en escenarios fuera del entorno de entrenamiento.
- La longitud de contexto no esta confirmada oficialmente; el sufijo "8192" sugiere 8192 tokens, pero debe verificarse experimentalmente.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, lo que indica una validacion externa minima y probablemente bajo uso en produccion.
- La licencia Apache 2.0 permite uso comercial, pero hay que revisar las condiciones del modelo base y los posibles terminos de los datos utilizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wckwan/Webshop-Olmo3-7B-GRPO-Think-8192
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Modelo hermano: https://huggingface.co/wckwan/WebShop-Olmo3-7B-GiGPO
