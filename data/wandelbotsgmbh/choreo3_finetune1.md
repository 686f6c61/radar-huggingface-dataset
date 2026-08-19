# wandelbotsgmbh/choreo3_finetune1

## Resumen

`wandelbotsgmbh/choreo3_finetune1` es un modelo de política robótica basado en el método Action Chunking with Transformers (ACT), desarrollado por Wandelbots GmbH. Este modelo se enmarca en el campo del aprendizaje por imitación: aprende a generar secuencias de acciones a partir de demostraciones teleoperadas, lo que permite a un robot ejecutar tareas complejas sin necesidad de programación explícita. El modelo está entrenado sobre el dataset `wandelbotsgmbh/choreo3_noise` y ha sido publicado utilizando la librería LeRobot de Hugging Face, lo que facilita su integración en pipelines de entrenamiento y evaluación.

Con 51,6 millones de parámetros, es un modelo relativamente ligero, diseñado para ser ejecutado en hardware de gama media. Su arquitectura ACT predice "chunks" de acciones (varios pasos a la vez) en lugar de acciones individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación robótica. La relevancia actual radica en su enfoque práctico para la automatización industrial, ya que Wandelbots ofrece una plataforma de automatización definida por software que es agnóstica respecto al fabricante del robot.

La licencia Apache 2.0 permite uso comercial sin restricciones, y el modelo está disponible en formato safetensors. Aunque no se proporcionan métricas de rendimiento ni detalles de entrenamiento más allá del dataset, su diseño basado en ACT y su integración con LeRobot lo convierten en una opción accesible para desarrolladores que buscan implementar políticas de control robótico mediante aprendizaje por imitación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.623.559 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa Action Chunking with Transformers (ACT), una arquitectura de transformer que procesa observaciones visuales y de estado del robot para predecir una secuencia de acciones futuras (chunk) en lugar de una sola acción. Esta técnica, presentada en el paper [2304.13705](https://huggingface.co/papers/2304.13705), reduce la acumulación de errores en tareas de control y mejora la precisión en manipulaciones de larga duración. ACT se basa en un codificador-decodificador transformer, donde el codificador procesa las observaciones y el decodificador genera el chunk de acciones.

El entrenamiento se realizó mediante aprendizaje por imitación supervisado, utilizando el dataset `wandelbotsgmbh/choreo3_noise`. Este dataset, también publicado por Wandelbots, contiene demostraciones teleoperadas con ruido intencional, lo que probablemente busca aumentar la robustez del modelo ante perturbaciones. No se dispone de información sobre el número de tokens, la composición exacta del dataset ni la aplicación de técnicas como RLHF o DPO. El modelo se entrenó y subió al Hub mediante la librería LeRobot, siguiendo el flujo de trabajo estándar de esa herramienta.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones (chunks) para ejecutar tareas de manipulación, como recoger, colocar o ensamblar objetos.
- Integración con LeRobot: compatible con el ecosistema de LeRobot, lo que permite entrenar, evaluar y desplegar políticas en robots como SO-100 u otros brazos robóticos.
- Robustez ante ruido: al haber sido entrenado con un dataset que incluye ruido, puede tolerar pequeñas perturbaciones en las observaciones o en la ejecución.
- Sin capacidades de lenguaje: no procesa texto ni mantiene conversaciones; su salida es directamente un vector de acciones del robot.
- Sin tool calling ni agentes: no es un modelo de propósito general; está especializado en el control motor.

## Casos de uso

- Automatización industrial de tareas repetitivas: el modelo puede controlar un brazo robótico para realizar operaciones de pick-and-place en una línea de montaje. Gracias a su predicción por chunks, mantiene trayectorias suaves y reduce errores acumulativos.
- Teleoperación asistida: en entornos donde un operario guía al robot mediante un dispositivo háptico, el modelo puede aprender de esas demostraciones y luego reproducirlas de forma autónoma, mejorando la productividad.
- Prototipado rápido en laboratorios de robótica: investigadores pueden usar el modelo como punto de partida para fine-tuning con sus propios datasets, gracias a la integración con LeRobot y la licencia Apache 2.0.
- Evaluación de políticas en simuladores: al ser ligero (51M parámetros), puede ejecutarse en tiempo real en simuladores como MuJoCo o Isaac Gym para validar algoritmos de control.
- Formación de operarios en entornos virtuales: el modelo puede generar trayectorias de referencia que sirvan como guía visual en simulaciones de entrenamiento.
- Robótica educativa: por su tamaño reducido y su integración con hardware accesible (p. ej., SO-100), es adecuado para cursos de robótica y aprendizaje por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de éxito en tareas específicas, comparaciones con otros modelos ni evaluaciones cuantitativas de precisión o latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,6M parámetros y pesos en FP32, el modelo ocupa aproximadamente 206 MB. En FP16, unos 103 MB. La inferencia puede ejecutarse en GPUs con 2 GB de VRAM o menos, aunque se recomienda al menos 4 GB para margen con las observaciones de entrada.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA, como NVIDIA GTX 1060 (6 GB), RTX 2060, RTX 3060, o incluso integradas si se usa cuantización (no disponible). Para entrenamiento, una GPU con 8-12 GB es suficiente.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de consumo general.
- Opciones de despliegue: se puede ejecutar mediante LeRobot, que utiliza PyTorch. También es posible exportar a ONNX o TensorRT, aunque no se documenta en la información disponible.
- Latencia y throughput: no se proporcionan datos oficiales. Dado el tamaño del modelo, se espera una inferencia en tiempo real (decenas de milisegundos) en GPUs modernas, pero no hay cifras confirmadas.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables en la misma categoría (políticas robóticas basadas en ACT) con información pública suficiente para establecer una comparación objetiva. Otros modelos de ACT existen en el ecosistema LeRobot, pero no se dispone de sus especificaciones detalladas en este contexto.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos, pero al ser un modelo entrenado con datos de demostración, puede heredar sesgos del operador humano (p. ej., preferencias de trayectoria).
- Riesgo de alucinación: no aplica, ya que no genera contenido simbólico; sin embargo, puede producir acciones incorrectas si las observaciones están fuera de la distribución de entrenamiento.
- Limitaciones de contexto: al ser un modelo de control, no maneja contexto lingüístico ni de largo plazo; su "contexto" es la ventana de observaciones actuales (imágenes y estados).
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución sin restricciones significativas, siempre que se mantenga el aviso de copyright.
- Caveat para producción: el modelo no incluye mecanismos de seguridad ni de detección de fallos. En entornos industriales reales, debe integrarse con sistemas de supervisión y parada de emergencia. Además, al ser un fine-tune sobre un dataset con ruido, puede comportarse de forma impredecible ante ruido extremo o situaciones no vistas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/wandelbotsgmbh/choreo3_finetune1)
- [Paper de ACT (Action Chunking with Transformers)](https://huggingface.co/papers/2304.13705)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Repositorio de LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Organización Wandelbots en Hugging Face](https://huggingface.co/wandelbotsgmbh)
- [Sitio web de Wandelbots](https://www.wandelbots.com/)
- [GitHub de Wandelbots](https://github.com/wandelbotsgmbh)
