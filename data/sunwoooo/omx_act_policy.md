# SunWoooo/omx_act_policy

## Resumen

`omx_act_policy` es una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT), publicado originalmente en el paper arXiv:2304.13705. El modelo lo ha subido el usuario SunWoooo al Hub de Hugging Face mediante la librería LeRobot, el framework de Hugging Face para aprendizaje por imitación en robótica. Su función es predecir secuencias cortas de acciones (chunks) a partir de observaciones visuales y de estado del robot, en lugar de predecir un único paso de acción por inferencia.

El modelo está especializado en una tarea concreta de manipulación: recoger y colocar una fresa, según el dataset `SunWoooo/pick_and_place_strawberry` con el que se ha entrenado. No es un modelo de lenguaje ni un modelo fundacional de propósito general: es un checkpoint de política visomotora de aproximadamente 51,7 millones de parámetros, empaquetado en safetensors y pensado para ejecutarse con LeRobot sobre robots tipo SO-100 (el ejemplo de la model card usa `so100_follower`).

Su relevancia es práctica para quien trabaja en robótica de imitación con hardware de bajo coste: ofrece un punto de partida reproducible, con licencia Apache 2.0, para entrenar y evaluar políticas ACT en tareas de pick-and-place, y demuestra el flujo completo de LeRobot (entrenamiento, publicación en el Hub y evaluación con `lerobot-record`). Al tener cero descargas y cero likes en el momento de la consulta, debe considerarse un checkpoint experimental de un autor individual, no un modelo validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones con chunking |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; el modelo consume observaciones por paso y predice chunks de acción) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB, librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone transformer con un mecanismo de *action chunking*: en lugar de predecir una sola acción por observación, el modelo predice un bloque de acciones futuras, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. La arquitectura típica de ACT incluye un codificador de imágenes (por ejemplo, ResNet) para las observaciones visuales y un transformer encoder-decoder que fusiona la información visual con el estado de las articulaciones y genera las acciones. El paper original reporta altas tasas de éxito en tareas de manipulación aprendidas a partir de datos de teleoperación.

En este caso concreto, el entrenamiento se ha realizado con LeRobot sobre el dataset `SunWoooo/pick_and_place_strawberry`, un conjunto de demostraciones de teleoperación para la tarea de recoger y colocar una fresa. La model card no detalla el número de episodios, la composición del dataset, el número de tokens ni si se aplicaron técnicas de RLHF o DPO (no aplicables en este paradigma, que es de imitación supervisada). Tampoco se documentan innovaciones adicionales más allá del propio action chunking del método ACT. El comando de entrenamiento indicado usa `--policy.type=act`, dispositivo CUDA y seguimiento opcional con Weights & Biases.

## Capacidades

- Predicción de acciones robóticas en forma de chunks a partir de observaciones visuales y de estado del robot.
- Control visomotor para tareas de manipulación tipo pick-and-place (en este checkpoint, específicamente recoger y colocar una fresa).
- Aprendizaje por imitación a partir de datos de teleoperación, sin necesidad de recompensas explícitas.
- Integración nativa con el ecosistema LeRobot: entrenamiento con `lerobot-train` y evaluación con `lerobot-record`.
- Ejecución sobre robots de bajo coste tipo SO-100 (`so100_follower` en los ejemplos de la model card).
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües, visión general, audio ni modo de pensamiento: es una política de control, no un modelo generativo de texto.

## Casos de uso

- Recoger y colocar objetos en entornos de laboratorio: el checkpoint está entrenado específicamente para la tarea de fresa del dataset `pick_and_place_strawberry`, por lo que sirve como referencia directa para reproducir esa tarea con un robot SO-100 y evaluar la tasa de éxito con `lerobot-record`.
- Prototipado rápido de políticas de imitación: un equipo puede partir de este checkpoint y del flujo de LeRobot para validar su pipeline de datos, entrenamiento y despliegue antes de invertir en datasets propios más grandes.
- Docencia y formación en robótica de imitación: al ser un ejemplo completo y de licencia permisiva, es útil para explicar el método ACT, el formato de datasets de LeRobot y el ciclo entrenamiento-evaluación en un curso práctico.
- Benchmark interno de hardware de bajo coste: permite medir latencia y tasa de éxito de una política ACT de ~51,7 M de parámetros en brazos robóticos económicos, comparando configuraciones de cámara y control.
- Base para fine-tuning en tareas similares: con un dataset propio de pick-and-place, se puede reentrenar o ajustar la política usando `--policy.type=act` y el mismo esquema de entrenamiento documentado.
- Automatización de tareas repetitivas de laboratorio o almacén a pequeña escala: en escenarios controlados con objetos y posiciones similares a los del dataset de entrenamiento, la política puede ejecutar ciclos de recogida y colocación sin intervención humana.
- Investigación en generalización visomotora: sirve como punto de comparación para estudiar cómo varía el rendimiento al cambiar iluminación, posición de cámara u objetos respecto a las demostraciones originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de acción ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros y pesos en safetensors (repo de 0,2 GB), la huella en memoria es reducida y cabe holgadamente en GPUs de consumo, aunque el requisito real depende del codificador visual y del tamaño de las imágenes de entrada.
- GPU recomendadas: el comando de entrenamiento de la model card usa `--policy.device=cuda`; para entrenamiento se recomienda una GPU NVIDIA con CUDA (gama RTX o superior), y para inferencia es suficiente una GPU de consumo o incluso CPU en muchos casos, aunque no se documentan cifras oficiales.
- Cabe en GPU de consumo: sí, por el tamaño del checkpoint (0,2 GB); no se especifican modelos concretos ni mínimos oficiales.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path` apuntando al checkpoint local o del Hub); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SunWoooo/omx_act_policy | 51.668.614 | no aplica | no disponible | Apache 2.0 | Hugging Face Hub (LeRobot) |
| Políticas ACT de referencia en LeRobot | no disponible | no aplica | no disponible | según checkpoint | Hugging Face Hub (LeRobot) |
| Políticas Diffusion Policy | no disponible | no aplica | no disponible | según checkpoint | Hugging Face Hub (LeRobot) |
| Políticas VQ-BeT / otros métodos de imitación en LeRobot | no disponible | no aplica | no disponible | según checkpoint | Hugging Face Hub (LeRobot) |

No se dispone de datos numéricos publicados para establecer una comparación cuantitativa con alternativas concretas; la comparación anterior es únicamente categórica.

## Limitaciones y advertencias

- Especialización extrema: el checkpoint está entrenado para una única tarea (recoger y colocar una fresa) y un dataset concreto; no se espera que generalice a otros objetos, entornos o robots sin reentrenamiento.
- Sin validación comunitaria: cero descargas y cero likes en el momento de la consulta; no hay evidencia pública de tasas de éxito ni de reproducibilidad por terceros.
- Riesgo de sobreajuste a las condiciones del dataset: cambios en iluminación, posición de cámara, fondo u objeto pueden degradar el rendimiento de forma significativa, algo habitual en políticas de imitación.
- Sin datos de sesgos ni de robustez: la model card no documenta análisis de fallos, sesgos de datos ni comportamiento fuera de distribución.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene revisar la procedencia del dataset `SunWoooo/pick_and_place_strawberry` antes de un uso en producción.
- No es un modelo de lenguaje: no debe evaluarse con métricas de LLM (MMLU, HumanEval, GSM8K) ni usarse para tareas de texto, código o razonamiento simbólico.
- Documentación mínima: faltan detalles de entrenamiento (episodios, hiperparámetros, aumentos de datos) que dificultan la reproducción exacta de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SunWoooo/omx_act_policy
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Dataset de entrenamiento: https://huggingface.co/datasets/SunWoooo/pick_and_place_strawberry
