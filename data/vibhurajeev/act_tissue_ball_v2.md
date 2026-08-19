# vibhurajeev/act_tissue_ball_v2

## Resumen

El modelo `act_tissue_ball_v2` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), desarrollada por el autor vibhurajeev y publicada a través del ecosistema LeRobot de Hugging Face. ACT es una técnica de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y el éxito en tareas de manipulación. Este modelo concreto está entrenado para la tarea "Pick the tissue ball" (recoger una bola de tejido) sobre un robot tipo `so_follower`, utilizando dos cámaras (superior y frontal) y el estado articular del robot.

Con 51,7 millones de parámetros y un peso de solo 0,2 GB, es un modelo ligero pensado para ejecutarse en tiempo real en hardware de consumo. Su relevancia radica en que demuestra el flujo completo de entrenamiento y despliegue de políticas robóticas con LeRobot, una librería open source que democratiza el aprendizaje por imitación. El modelo se distribuye con licencia Apache-2.0, lo que permite uso comercial y modificación sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es modelo de texto) |
| Tipos de cuantizacion | no disponible (solo safetensors de precision completa) |
| Idiomas soportados | no disponible (no es modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT propuesta en el paper [Action Chunking with Transformers](https://huggingface.co/papers/2304.13705). Se trata de un transformer que consume observaciones multimodales —dos imagenes RGB de 480x640 píxeles (cámaras `top` y `front`) y un vector de estado de 6 dimensiones— y produce como salida un chunk de acciones de 6 dimensiones (probablemente posiciones articulares o comandos de efector final). La innovación clave del método es la predicción de secuencias de acciones en bloques, lo que reduce la acumulación de errores típica de los métodos autoregresivos paso a paso.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.2) sobre un dataset de demostraciones teleoperadas con 60 episodios y 20.276 frames a 30 FPS. La configuración de entrenamiento incluye 100.000 pasos, batch size de 8, optimizador AdamW con learning rate de 1e-5 y semilla 1000. No se aplicaron técnicas de RLHF ni DPO, ya que es un modelo de imitación supervisada. El dataset está disponible públicamente en [vibhurajeev/pick_tissue_ball_v2_20260817_184026](https://huggingface.co/datasets/vibhurajeev/pick_tissue_ball_v2_20260817_184026).

## Capacidades

- Control robótico por imitación: predice chunks de acciones a partir de observaciones visuales y de estado.
- Percepción multimodal: integra dos cámaras RGB (superior y frontal) junto con el estado del robot.
- Tarea específica entrenada: "Pick the tissue ball" (recoger una bola de tejido de una superficie).
- Compatibilidad con el ecosistema LeRobot: puede ejecutarse con `lerobot-rollout` y reentrenarse con `lerobot-train`.
- No es un modelo de lenguaje ni de visión general: no genera texto, código ni realiza razonamiento simbólico.

## Casos de uso

- Automatización de picking en entornos industriales: el modelo puede integrarse en una celda robótica para recoger objetos pequeños y deformables (como bolas de tejido) de una cinta o bandeja. Su tamaño reducido permite ejecutarlo en controladores embebidos con GPU ligera.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas entre tareas o la robustez frente a variaciones de iluminación y posición de objetos.
- Prototipado rápido de soluciones robóticas: al estar publicado en Hugging Face con LeRobot, un desarrollador puede descargar el modelo y probarlo en su propio robot `so_follower` en menos de una hora, siguiendo la guía de rollout.
- Educación en robótica y aprendizaje automático: es un ejemplo didáctico de cómo entrenar una política de manipulación con datos teleoperados, útil para cursos de robótica o laboratorios universitarios.
- Desarrollo de cobots para laboratorios: en entornos de investigación biológica o química, puede adaptarse para recoger muestras o materiales pequeños, reduciendo la intervención humana.
- Benchmarking de algoritmos de imitación: el dataset y el modelo permiten comparar ACT con otros métodos (diffusion policies, etc.) en una tarea estandarizada, gracias a la integración con LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). Por tanto, no se dispone de tasas de éxito ni métricas comparativas verificadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Dado el tamaño del modelo (51,7 M parámetros) y la entrada de imágenes 480x640, se estima que puede ejecutarse en GPU con 4-8 GB de VRAM, aunque no hay datos confirmados.
- GPU recomendadas: no hay especificación oficial. Por su ligereza, debería ser compatible con RTX 3060, RTX 4060 o superiores, así como con GPUs de datacenter como T4 o L4.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de GPUs modernas con al menos 4 GB de VRAM, pero no está verificado.
- Opciones de despliegue: LeRobot ofrece los comandos `lerobot-rollout` para ejecución en robot real. También es posible exportar a otros formatos, aunque no se documenta en la model card.
- Latencia y throughput: no disponible. Al ser un transformer pequeño, se espera que la inferencia sea de pocos milisegundos, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, ya que la mayoría de políticas robóticas publicadas en LeRobot están entrenadas para tareas y robots específicos, y no existe un benchmark estandarizado que permita comparación directa.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado únicamente para la tarea "Pick the tissue ball" con el robot `so_follower`. No generaliza a otras tareas ni a otros robots sin reentrenamiento.
- Dataset pequeño: 60 episodios pueden ser insuficientes para cubrir variaciones de posición, iluminación o textura del objeto, lo que puede provocar fallos en entornos no vistos.
- Sin evaluación reportada: no hay datos de éxito en robot real, por lo que su rendimiento real es desconocido.
- Dependencia de la configuración de cámaras: las observaciones requieren dos cámaras con la misma resolución y posición que las usadas en el entrenamiento; cualquier cambio en la calibración degradará el rendimiento.
- No es un modelo de lenguaje: no soporta procesamiento de texto ni interacción conversacional; su uso está restringido a control robótico.
- Licencia Apache-2.0: permite uso comercial y modificación, pero exige incluir el aviso de licencia y citar el método original (ACT) y LeRobot en publicaciones derivadas.

## Enlaces

- Modelo en Hugging Face: [vibhurajeev/act_tissue_ball_v2](https://huggingface.co/vibhurajeev/act_tissue_ball_v2)
- Dataset de entrenamiento: [vibhurajeev/pick_tissue_ball_v2_20260817_184026](https://huggingface.co/datasets/vibhurajeev/pick_tissue_ball_v2_20260817_184026)
- Paper de ACT: [Action Chunking with Transformers (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- Repositorio de LeRobot: [https://github.com/huggingface/lerobot](https://github.com/huggingface/lerobot)
- Guía de ACT en LeRobot: [https://huggingface.co/docs/lerobot/main/en/act](https://huggingface.co/docs/lerobot/main/en/act)
- Documentación general de LeRobot: [https://huggingface.co/docs/lerobot/index](https://huggingface.co/docs/lerobot/index)
