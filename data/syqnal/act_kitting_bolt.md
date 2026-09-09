# Syqnal/act_kitting_bolt

## Resumen

Syqnal/act_kitting_bolt es un modelo de robótica basado en Action Chunking with Transformers (ACT), desarrollado por el autor Syqnal y publicado a través del ecosistema LeRobot de Hugging Face. El modelo resuelve un problema de aprendizaje por imitación: a partir de demostraciones teleoperadas, aprende una política capaz de controlar un brazo robótico para realizar la tarea de recoger un perno roscado y colocarlo en la ranura de un kit. La arquitectura ACT predice secuencias de acciones completas en lugar de pasos individuales, lo que mejora la coherencia temporal y reduce errores acumulados en el control del robot. El modelo tiene 51.668.614 parámetros, pesa 0,2 GB y está publicado bajo licencia Apache-2.0 en formato safetensors. Aunque no se trata de un modelo de lenguaje, su relevancia radica en ofrecer una política de manipulación lista para integrarse en pipelines reales de robótica mediante LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplicable (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de robótica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura del modelo es ACT, un método de aprendizaje por imitación que utiliza un Transformer para generar chunks de acciones. A diferencia de las políticas que predicen una sola acción por paso, ACT predice una secuencia de varias acciones a partir de una observación, lo que permite mantener una ejecución estable y coherente en el tiempo. La entrada del modelo consiste en el estado del robot, con 6 dimensiones, y una imagen RGB de la cámara frontal con resolución 480x640. La salida es una acción de 6 dimensiones.

El modelo fue entrenado con el dataset Syqnal/kitting_bolt, formado por 50 episodios y 8.248 fotogramas a una frecuencia de 15 FPS. La tarea registrada es "Pick threaded bolt and place into kit slot". La configuración de entrenamiento emplea 50.000 pasos, batch size de 4, optimizador AdamW, learning rate de 1e-5 y semilla 1000. Se utilizó la versión 0.6.2 de LeRobot. La técnica de action chunking es la principal innovación metodológica, ya que evita la propagación de errores y facilita el aprendizaje de movimientos prolongados a partir de datos teleoperados.

## Capacidades

- Control robótico por imitación: genera acciones de 6 dimensiones para el robot, prediciendo secuencias de acciones completas en lugar de pasos aislados.
- Percepción visual: procesa imágenes RGB de la cámara frontal a 480x640 como parte de la observación del entorno.
- Aprendizaje a partir de teleoperación: la política se entrena con demostraciones humanas recogidas en el dataset Syqnal/kitting_bolt.
- Ejecución de la tarea de kitting: es capaz de realizar la tarea específica de recoger un perno roscado y colocarlo en la ranura de un kit.
- Compatibilidad con el ecosistema LeRobot: puede desplegarse y utilizarse mediante las herramientas y comandos CLI de LeRobot.
- No soporta generación de texto, tool calling, agentes conversacionales ni procesamiento de audio, al tratarse de un modelo de robótica.

## Casos de uso

- Automatización de ensamblaje en plantas de fabricación: el modelo controla un brazo robótico para recoger pernos roscados de una bandeja y colocarlos en la posición exacta del kit, reduciendo la intervención humana en líneas de montaje.
- Kitting logístico para centros de distribución: en la preparación de kits de productos, la política puede encargarse de la colocación de componentes metálicos, acelerando el proceso de picking y aumentando la consistencia.
- Investigación en aprendizaje por imitación: el modelo sirve como referencia de una política entrenada con ACT y LeRobot, permitiendo analizar el efecto del action chunking en la precisión y estabilidad del control.
- Integración y pruebas en plataformas LeRobot: se puede usar como ejemplo práctico del pipeline de entrenamiento y despliegue de políticas para robots tipo so_follower, facilitando la experimentación con otras tareas similares.
- Adaptación por fine-tuning a nuevas tareas de manipulación: partiendo de esta política, es posible reentrenarla con nuevos datos teleoperados para tareas relacionadas, siempre que se mantengan las condiciones de hardware y cámara.
- Demostraciones en entornos educativos y ferias: dado su reducido tamaño y facilidad de despliegue, el modelo resulta adecuado para mostrar capacidades de manipulación autónoma en espacios controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada: con 51.668.614 parámetros y un peso total de 0,2 GB, el modelo ocupa aproximadamente 200 MB en fp32 y unos 100 MB en fp16. Incluyendo los tensores de imagen, la inferencia debería caber en una GPU con 2 GB de VRAM o incluso menos para un único stream.
- GPU recomendada: una NVIDIA RTX 3060 de 6 GB o superior ofrece margen suficiente para ejecutar la inferencia sin problemas.
- Compatibilidad con GPUs de consumo: sí, el modelo es ligero y puede ejecutarse en tarjetas de consumo, así como en CPU mediante PyTorch, aunque con menor rendimiento.
- Opciones de despliegue: se puede ejecutar con Python utilizando PyTorch y LeRobot, o mediante el comando `lerobot-rollout` del CLI de LeRobot.
- Latencia y throughput: no se han publicado mediciones de latencia ni de velocidad de inferencia en la documentación disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos equivalentes en la documentación proporcionada. Al tratarse de una política específica para una tarea de robótica, no hay datos que permitan una comparación directa con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- Sin evaluación en el mundo real: la model card indica que no se han proporcionado resultados de evaluación, por lo que se desconoce la tasa de éxito de la política en el robot.
- Especialización extrema: el modelo solo está entrenado para la tarea "Pick threaded bolt and place into kit slot" y puede fallar en otras tareas o configuraciones.
- Dependencia del hardware: requiere un robot tipo so_follower y una cámara frontal calibrada; cualquier cambio en la posición de la cámara o en la morfología del robot puede invalidar la política.
- Generalización limitada: al estar entrenado con solo 50 episodios, es probable que tenga dificultades ante variaciones no vistas, como cambios de iluminación, oclusiones o posiciones de objetos diferentes.
- Licencia: la licencia Apache-2.0 permite el uso comercial, pero la responsabilidad del despliegue y de la validación en producción recae en el usuario.
- Ausencia de evaluación de sesgos: al ser un modelo de robótica, no se han documentado sesgos de lenguaje ni alucinaciones; no obstante, conviene validar su comportamiento en entornos reales antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Syqnal/act_kitting_bolt
- Dataset de entrenamiento: https://huggingface.co/datasets/Syqnal/kitting_bolt
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
