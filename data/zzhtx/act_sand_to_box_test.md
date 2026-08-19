# zzhtx/act_sand_to_box_test

## Resumen

El modelo `zzhtx/act_sand_to_box_test` es una política de control robótico basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. Ha sido desarrollado por el usuario zzhtx y entrenado con el framework LeRobot de Hugging Face. El modelo está especializado en una tarea concreta: recoger un saco de arena y colocarlo dentro de una caja, operando sobre un robot tipo `so_follower` con dos cámaras (vista cenital y vista de muñeca).

La arquitectura ACT predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación. Con 51,7 millones de parámetros, es un modelo compacto que puede ejecutarse en hardware modesto. Su relevancia radica en demostrar el flujo completo de entrenamiento y despliegue de políticas robóticas con LeRobot, aunque su alcance está limitado a la tarea específica para la que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica, modelo de vision+estado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es modelo de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura ACT, un método de aprendizaje por imitacion que combina un transformer con codificadores de vision y estado. La politica recibe como entrada el estado del robot (6 dimensiones) y dos imagenes RGB de 480x640 píxeles (camara cenital y camara de muñeca). La salida es un chunk de acciones de 6 dimensiones que se ejecutan de forma secuencial. Este enfoque de prediccion por chunks reduce la acumulacion de errores frente a politicas que predicen un solo paso.

El entrenamiento se realizo con el framework LeRobot (version 0.6.2) sobre un dataset de 50 episodios teleoperados, con un total de 17.378 frames a 30 FPS. La configuracion de entrenamiento incluye 100 pasos de optimizacion, batch size de 32, optimizador AdamW con learning rate de 1e-05 y semilla 1000. No se menciona el uso de tecnicas como RLHF o DPO, al tratarse de aprendizaje por imitacion supervisado.

## Capacidades

- Control robotico de manipulacion: ejecuta la tarea de recoger un saco de arena y colocarlo en una caja.
- Percepcion visual multimodal: procesa dos camaras simultaneamente (cenital y de muñeca) para guiar el movimiento.
- Prediccion de acciones por chunks: genera secuencias de acciones de 6 dimensiones, lo que permite movimientos suaves y coordinados.
- Integracion con LeRobot: compatible con el ecosistema de herramientas de entrenamiento, evaluacion y despliegue de Hugging Face.
- Ejecucion en tiempo real: al ser un modelo pequeno, puede operar a frecuencias adecuadas para control en bucle cerrado.

## Casos de uso

- Automatizacion de tareas de picking and placing: el modelo puede integrarse en celdas roboticas para mover objetos de una ubicacion a otra, como en lineas de embalaje o clasificacion.
- Prototipado rapido de politicas de manipulacion: gracias a LeRobot, sirve como punto de partida para entrenar variantes de la misma tarea con diferentes objetos o disposiciones.
- Investigacion en aprendizaje por imitacion: util para reproducir y estudiar el comportamiento de ACT en tareas de manipulacion con pocos datos.
- Demostracion educativa: permite a estudiantes y desarrolladores experimentar con un pipeline completo de robotica basado en aprendizaje automatico.
- Evaluacion de generalizacion: puede usarse como baseline para probar tecnicas de aumento de datos o regularizacion en tareas similares.
- Despliegue en robots de bajo coste: al requerir pocos recursos, es adecuado para plataformas roboticas asequibles tipo So-100 o similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no hay resultados de evaluacion en robot real ("No evaluation results have been provided for this policy yet"). No se dispone de datos comparativos con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, pero al tratarse de un modelo de 51,7 millones de parametros, se estima que cabe en GPUs con 4-6 GB de VRAM en precision FP32.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA (por ejemplo, RTX 3060, RTX 4090, A100) es suficiente para inferencia y entrenamiento.
- Compatibilidad con consumer GPU: si, el modelo es lo bastante pequeno para ejecutarse en GPUs de consumo.
- Opciones de despliegue: LeRobot ofrece scripts de rollout (`lerobot-rollout`) para ejecutar la politica en el robot. Tambien es posible exportar a otros formatos si se adapta.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en el repositorio ni en los resultados de busqueda. Existen otros modelos ACT publicados en Hugging Face (por ejemplo, `Mau124/act_so101_grab_block_to_box`), pero no se tienen datos de rendimiento ni especificaciones para establecer una comparacion rigurosa. Se recomienda consultar el paper original de ACT para referencias tecnicas.

## Limitaciones y advertencias

- Especializacion extrema: el modelo solo ha sido entrenado para una tarea concreta (recoger saco de arena y ponerlo en caja). No generaliza a otras tareas u objetos sin reentrenamiento.
- Datos limitados: 50 episodios de entrenamiento pueden no cubrir la variabilidad del mundo real (iluminacion, posiciones, distracciones). El rendimiento fuera del entorno de entrenamiento puede degradarse.
- Sin evaluacion publicada: no hay resultados de tasa de exito en robot real, por lo que se desconoce su fiabilidad en produccion.
- Dependencia de hardware especifico: requiere el robot `so_follower` y las camaras configuradas con los mismos nombres y resoluciones que en el entrenamiento.
- Sin soporte de idiomas ni texto: al ser un modelo de control robotico, no procesa lenguaje natural ni genera texto.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero se debe mantener la atribucion y citar el metodo y LeRobot segun la model card.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/zzhtx/act_sand_to_box_test)
- [Dataset de entrenamiento](https://huggingface.co/datasets/zzhtx/sand-to-box_20260817_163857)
- [Paper ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [LeRobot (GitHub)](https://github.com/huggingface/lerobot)
- [Documentacion de LeRobot para ACT](https://huggingface.co/docs/lerobot/main/en/act)
- [Guia de instalacion de LeRobot](https://huggingface.co/docs/lerobot/main/en/installation)
- [Guia de hardware](https://huggingface.co/docs/lerobot/main/en/hardware_guide)
- [Guia de grabacion y entrenamiento](https://huggingface.co/docs/lerobot/en/il_robots)
- [Cheat-sheet CLI](https://huggingface.co/docs/lerobot/main/en/cheat-sheet)
