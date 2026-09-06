# stephenfan1101/qwen25vl7b_detr_sft_bblr5e7_checkpoint-19613

## Resumen

Este modelo es un fine-tuning supervisado de Qwen/Qwen2.5-VL-7B-Instruct, especializado en grounding de elementos de interfaz gráfica (GUI grounding). Lo ha desarrollado el usuario stephenfan1101 (Stephen Fan) como parte de una serie de experimentos que comparan distintas tasas de aprendizaje del backbone sobre un mismo checkpoint de warmup. El objetivo es que el modelo localice y apunte a elementos concretos en capturas de pantalla, una capacidad clave para agentes que interactúan con aplicaciones de escritorio o web.

La arquitectura añade un pointer head al modelo base Qwen2.5-VL-7B, entrenando únicamente el backbone LLM, el pointer head y los embeddings de los nuevos tokens, mientras que el encoder visual permanece congelado. El modelo alcanza un 46,05 de acierto (hit_top1) en ScreenSpot-Pro, con un tamaño total de 8.649.176.064 parámetros. La relevancia del modelo radica en que este checkpoint concreto, correspondiente al arm con learning rate 5e-7, terminó el entrenamiento sin degradarse, a diferencia de otros brazos del mismo experimento que colapsaron o derivaron.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje) basado en Qwen2.5-VL-7B-Instruct, con pointer head adicional para grounding en GUI |
| Parámetros totales | 8.649.176.064 (≈8,65 mil millones) según safetensors |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2.5-VL-7B-Instruct, un modelo multimodal de visión y lenguaje. Sobre esta base se añade un pointer head específico para grounding en GUI, que predice la localización de elementos en una captura de pantalla. Durante el entrenamiento, el encoder visual permanece congelado y solo se entrenan el backbone LLM, el pointer head y los embeddings de los nuevos tokens. Esta configuración se aplicó sobre un checkpoint de warmup que ya había entrenado el pointer head de forma aislada, alcanzando 42,57 en ScreenSpot-Pro.

El entrenamiento se realizó con 4 nodos de 8 RTX 4090 cada uno (32 GPUs en total), usando DeepSpeed ZeRO-3, con un batch global de 64 y un total de 19.613 pasos. El factor diferenciador de este brazo respecto a sus tres hermanos es el learning rate del backbone, fijado en 5e-7. Los brazos con learning rates de 5e-6 colapsaron alrededor del paso 2000, y un brazo con 1e-6 se mantuvo cerca de 45 pero derivó a la baja después del paso 14.000. Este brazo, en cambio, aumentó su rendimiento durante todo el entrenamiento y terminó sin degradarse, por lo que el checkpoint final es directamente utilizable.

## Capacidades

- Grounding de elementos de interfaz gráfica: localiza y apunta a elementos concretos en capturas de pantalla, como botones, menús o campos de formulario.
- Evaluación en ScreenSpot-Pro: alcanza un hit_top1 global del 46,05 (n=1581, error estándar binomial ≈1,25 puntos porcentuales).
- Herencia del modelo base Qwen2.5-VL-7B-Instruct, lo que le otorga capacidades multimodales de visión y lenguaje, aunque no se han documentado ni evaluado en esta ficha.
- No se han publicado evaluaciones de otras capacidades como generación de texto, razonamiento, código, matemáticas o tool calling en la información disponible.

## Casos de uso

- Automatización de agentes de interfaz: el modelo puede usarse en agentes que necesitan identificar dónde hacer clic o qué elemento seleccionar en una pantalla, permitiendo tareas como navegar por formularios o completar flujos de trabajo en aplicaciones de escritorio y web.
- Testing automatizado de UI: al apuntar a elementos concretos de la interfaz, puede generar localizadores visuales para pruebas automatizadas, reduciendo la dependencia de selectores frágiles basados en HTML.
- Accesibilidad para personas con discapacidad visual: puede describir la posición y el tipo de elemento en pantalla, ayudando a lectores de pantalla a guiar al usuario sobre dónde se encuentra cada control.
- Automatización de procesos robóticos (RPA): sustituye reglas estáticas de localización por grounding dinámico, lo que hace más robusta la automatización frente a cambios en la interfaz.
- Anotación de datasets de UI: el modelo puede generar puntos de referencia o bounding boxes en capturas de pantalla, acelerando la creación de conjuntos de datos para otros modelos de grounding.
- Asistencia en soporte técnico remoto: un sistema puede indicar al usuario, paso a paso, qué elemento debe pulsar en su pantalla para resolver un problema, basándose en la captura actual.

## Benchmarks y rendimiento

El único benchmark documentado es ScreenSpot-Pro, que evalúa grounding en interfaces gráficas. Los resultados de los distintos brazos del experimento son:

| Arm | Backbone LR | Mejor media de 3 puntos | Último checkpoint |
|---|---|---|---|
| A | 5e-6 | 45,79 | 40,35 @ 13.500 |
| B | 5e-6 | 46,39 | 36,50 @ 10.500 |
| 3 | 1e-6 | 46,05 | 43,64 @ 17.500 |
| 5 (este) | 5e-7 | 46,74 | 46,05 @ 19.613 |

El checkpoint final del arm 5 logra un hit_top1 global de 46,05 en ScreenSpot-Pro, con un error estándar binomial de aproximadamente 1,25 puntos porcentuales. No se han publicado resultados de otros benchmarks como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- Entrenamiento: se realizó con 4 nodos × 8 RTX 4090 (32 GPUs) y DeepSpeed ZeRO-3.
- Inferencia: no se proporcionan requisitos específicos en la información disponible.
- El repositorio pesa 17,3 GB, lo que es coherente con pesos en bf16, aunque no se confirma. En ese caso, se necesitaría una GPU con al menos unos 18 GB de VRAM para cargar el modelo, como una RTX 4090.
- No se indican opciones de despliegue, latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en la documentación proporcionada. El autor tiene otro modelo en su perfil (qwen25vl_detr_try11_3b_sft_checkpoint-1500), pero no se conocen sus especificaciones ni resultados, por lo que no se puede establecer una comparación rigurosa.

## Limitaciones y advertencias

- El checkpoint no incluye el estado del optimizador DeepSpeed, que está fragmentado en 4 × 23 GB entre los nodos de entrenamiento. Por tanto, este modelo es solo para inferencia y evaluación, no para reanudar el entrenamiento.
- El modelo está especializado en grounding en GUI; no se han publicado benchmarks generales de lenguaje, razonamiento o visión, por lo que su rendimiento fuera de este ámbito es desconocido.
- No se documentan sesgos específicos. Al estar basado en Qwen2.5-VL-7B-Instruct, podría heredar sesgos del modelo base, pero no se han evaluado.
- El riesgo de alucinación en la predicción de coordenadas o elementos no ha sido evaluado.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni documentación de riesgos más allá de la model card.
- Los resultados de ScreenSpot-Pro provienen de un único conjunto de datos y pueden no generalizar a otras interfaces o dominios.

## Enlaces

- HuggingFace: https://huggingface.co/stephenfan1101/qwen25vl7b_detr_sft_bblr5e7_checkpoint-19613
- Perfil del autor: https://huggingface.co/stephenfan1101/models
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Otro modelo del autor: https://huggingface.co/stephenfan1101/qwen25vl_detr_try11_3b_sft_checkpoint-1500
