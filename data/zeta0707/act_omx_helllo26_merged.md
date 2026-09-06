# zeta0707/act_omx_helllo26_merged

## Resumen

El modelo `zeta0707/act_omx_helllo26_merged` es un modelo de política robótica basado en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias cortas de acciones en lugar de pasos individuales. Ha sido desarrollado por el usuario `zeta0707` y entrenado con el framework LeRobot de Hugging Face. Está diseñado para controlar un robot tipo `bi_omx_follower` en la tarea concreta de recoger y colocar caramelos ("pick and place candy").

El modelo tiene 51.680.908 parámetros (51.7M) y se distribuye en formato safetensors. A diferencia de los modelos de lenguaje, no procesa texto ni mantiene una ventana de contexto: su entrada consiste en el estado del robot y tres imágenes RGB de 640x480 (cámaras superior, izquierda y derecha), y su salida es una acción de 12 dimensiones. La relevancia de este modelo radica en que es un ejemplo de política de imitación open source lista para ejecutar con LeRobot, lo que permite a investigadores y desarrolladores reproducir y evaluar el pipeline de ACT sin necesidad de entrenar desde cero.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Action Chunking with Transformers, ACT) |
| Parametros totales | 51.680.908 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de políticas robóticas, sin ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (el modelo no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tarea | "pick and place candy" |
| Robot | bi_omx_follower |
| Cámaras | top, left, right |

## Arquitectura y entrenamiento

El modelo implementa ACT, una arquitectura basada en Transformers que aprende a generar "chunks" de acciones a partir de observaciones. En lugar de predecir una única acción por paso, el modelo genera una secuencia de acciones que se ejecuta de forma continua, lo que reduce el error acumulativo típico de los enfoques paso a paso. La entrada incluye el estado del robot (12 dimensiones) y tres imágenes RGB de 480x640 de las cámaras superior, izquierda y derecha. La salida es una acción de 12 dimensiones.

El entrenamiento se realizó con LeRobot 0.5.2 sobre el dataset `zeta0707/helllo26_merged`, que contiene 32 episodios y 46.035 frames a 30 FPS. La configuración de entrenamiento fue de 30.000 pasos, tamaño de batch 8, optimizador AdamW y learning rate de 5e-05, con semilla 1000. No se ha publicado información sobre técnicas de post-entrenamiento como RLHF o DPO, ya que se trata de un modelo de control robótico y no de lenguaje.

## Capacidades

- Genera acciones de 12 dimensiones para controlar el robot `bi_omx_follower`.
- Consume como entrada el estado del robot y tres imágenes RGB de 480x640 (top, left, right).
- Predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que permite movimientos más suaves y robustos.
- No soporta tool calling, razonamiento simbólico ni capacidades de lenguaje: es exclusivamente un modelo de política.
- Puede ejecutarse en tiempo real con LeRobot mediante el comando `lerobot-rollout` para controlar el robot.

## Casos de uso

- Automatización de pick-and-place en una célula de producción: el modelo recibe las imágenes de tres cámaras y el estado del brazo, y genera la secuencia de acciones para recoger un caramelo de una posición y colocarlo en otra. Es adecuado porque está entrenado específicamente para esa tarea y ese robot.
- Investigación en aprendizaje por imitación: sirve como modelo de referencia para comparar ACT con otros métodos de IL (por ejemplo, diffusion policy) usando el mismo dataset `helllo26_merged`.
- Generación de datos de demostración: se puede ejecutar el modelo para registrar nuevos episodios y ampliar el dataset de entrenamiento, lo que permite iterar sobre el comportamiento de la política.
- Robótica educativa: LeRobot permite cargar el modelo y ejecutarlo en un `bi_omx_follower`, lo que facilita la enseñanza de control robótico y aprendizaje por imitación en entornos académicos.
- Automatización en laboratorio: manejo de muestras pequeñas (como caramelos) en entornos controlados con iluminación y posiciones fijas, donde la tarea es repetitiva y bien definida.
- Pruebas de concepto para validar el pipeline de LeRobot: el modelo puede usarse como un caso de uso completo para verificar el flujo de entrenamiento, guardado en el Hub y rollout en hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política. No se dispone de tasas de éxito, métricas de rendimiento ni comparativas con otros modelos.

## Requisitos de hardware

- No se han publicado requisitos específicos de VRAM o GPU para este modelo.
- El modelo tiene 51.680.908 parámetros y un tamaño de 0.2 GB, por lo que en principio es ligero y podría ejecutarse en una GPU de consumo (por ejemplo, RTX 3060 o superior), pero no hay datos verificados.
- El framework LeRobot permite configurar la inferencia con `--policy.device=cuda`, por lo que se requiere una GPU NVIDIA con CUDA.
- Para el rollout es necesario disponer del robot `bi_omx_follower` y de tres cámaras configuradas según los nombres de las observaciones (top, left, right).
- No se dispone de mediciones de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Dataset | Licencia |
|---|---|---|---|---|
| zeta0707/act_omx_helllo26_merged | 51.680.908 | pick and place candy | zeta0707/helllo26_merged | apache-2.0 |
| zeta0707/act_hello26_merged | 51.7M (según Hub) | no disponible | zeta0707/hello26_merged | apache-2.0 |

Ambos modelos son políticas ACT entrenadas con LeRobot por el mismo autor. El segundo modelo aparece en el Hub con el mismo tamaño aproximado y licencia, pero no se dispone de información sobre su tarea concreta ni sobre sus resultados de evaluación. No hay benchmarks públicos que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación, por lo que el rendimiento real en el robot es desconocido.
- El modelo se entrenó con un dataset pequeño (32 episodios) y una única tarea ("pick and place candy"), lo que limita su generalización a otros objetos, posiciones o entornos.
- La política depende de la configuración de cámaras (top, left, right) y del estado del robot; cambios en la iluminación, la posición de la cámara o la calibración pueden degradar el rendimiento.
- No es un modelo de lenguaje: no puede responder preguntas ni razonar sobre instrucciones textuales.
- La licencia Apache 2.0 permite uso comercial, pero no hay garantías de rendimiento ni soporte por parte del autor.
- Es un checkpoint de entrenamiento sin validación en hardware real, por lo que podría presentar fallos de seguridad si se usa sin supervisión adecuada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zeta0707/act_omx_helllo26_merged
- Dataset de entrenamiento: https://huggingface.co/datasets/zeta0707/helllo26_merged
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=zeta0707/helllo26_merged
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
