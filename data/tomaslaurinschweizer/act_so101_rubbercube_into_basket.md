# TomasLaurinSchweizer/act_so101_rubbercube_into_basket

## Resumen

Este repositorio contiene una política de robótica entrenada con Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias de acciones en lugar de pasos individuales. El modelo ha sido desarrollado por TomasLaurinSchweizer y entrenado con la librería LeRobot de Hugging Face, específicamente para la tarea de introducir un cubo de goma en una cesta utilizando un brazo robótico SO-101 (SO Follower). La política aprende de 50 episodios teleoperados que suman 34.634 fotogramas capturados a 30 FPS desde dos cámaras: una de escritorio y otra en la muñeca del robot.

El modelo cuenta con 51.668.614 parámetros y se distribuye bajo licencia Apache 2.0. Su relevancia radica en que demuestra un flujo completo y reproducible de entrenamiento de políticas robóticas con LeRobot, un ecosistema que está democratizando el acceso a la robótica de aprendizaje. El repositorio incluye el código de inferencia y entrenamiento listo para usar con el robot SO-101, lo que permite a otros equipos reproducir y adaptar la política a sus propios entornos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación basado en una arquitectura transformer que predice bloques de acciones (action chunks) en lugar de acciones individuales. Esto reduce el error de acumulación durante el despliegue y permite ejecutar movimientos más fluidos y coordinados. El modelo se entrenó con LeRobot versión 0.6.2, con un optimizador AdamW, una tasa de aprendizaje de 1e-05, batch size de 32 y semilla 1000, durante 5.415 pasos de entrenamiento.

El dataset de entrenamiento se recopiló mediante teleoperación con el robot SO-101 e incluye 50 episodios de la tarea "Poner el cubo de goma en la cesta", con un total de 34.634 fotogramas. Las observaciones incluyen el estado del robot (6 dimensiones) y dos cámaras RGB (workspace y wrist) con resolución de 480x640 píxeles. No se menciona el uso de técnicas de refuerzo como RLHF o DPO en el proceso de entrenamiento.

## Capacidades

- Generación de acciones robóticas de 6 dimensiones (posición y orientación del efector final) a partir de observaciones visuales y de estado.
- Control de precisión para tareas de pick-and-place, específicamente para la tarea de introducir un cubo de goma en una cesta.
- Procesamiento de imágenes de dos cámaras simultáneamente (workspace y muñeca) para obtener contexto visual completo.
- Ejecución de políticas de aprendizaje por imitación en el brazo robótico SO-101 mediante LeRobot.
- Soporte de despliegue en tiempo real con la herramienta `lerobot-rollout`.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y visualización de datasets.

## Casos de uso

- **Manipulación robótica en investigación**: el modelo puede servir como base para estudiar técnicas de aprendizaje por imitación en brazos robóticos de bajo coste como el SO-101, permitiendo comparar el rendimiento de ACT con otros métodos en tareas de pick-and-place.
- **Automatización de tareas repetitivas en laboratorio**: la política puede adaptarse para colocar objetos pequeños en contenedores, una tarea común en entornos de laboratorio que puede automatizarse con este modelo.
- **Demostración de robótica educativa**: el repositorio incluye guías completas de instalación y despliegue, lo que lo convierte en un recurso valioso para cursos de robótica e inteligencia artificial que quieran mostrar un pipeline de aprendizaje por imitación de principio a fin.
- **Benchmarking de algoritmos de imitación**: los investigadores pueden usar este modelo como referencia para evaluar nuevas variantes de ACT o métodos alternativos en la misma tarea y dataset.
- **Desarrollo de aplicaciones de robótica asistencial**: la capacidad de manipular objetos pequeños podría adaptarse a tareas de asistencia en el hogar, aunque se requiere evaluación adicional en entornos reales.
- **Formación en teleoperación y recolección de datos**: el dataset asociado sirve para practicar técnicas de teleoperación y para estudiar el efecto de la calidad de los datos en el rendimiento de la política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que no se han proporcionado resultados de evaluación en el robot real ("No evaluation results have been provided for this policy yet").

## Requisitos de hardware

- **VRAM estimada**: no se ha especificado en la documentación. Con 51,7 millones de parámetros, se estima que puede caber en GPUs con 8-12 GB de VRAM en FP16.
- **GPU recomendada**: cualquier GPU moderna con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, A10) debería ser suficiente para la inferencia.
- **Cabe en consumer GPU**: sí, se espera que funcione en GPUs de consumo como la serie RTX 30/40.
- **Opciones de despliegue**: el modelo está diseñado para ser ejecutado con LeRobot, que soporta `lerobot-rollout` para inferencia en el robot. También puede usarse con el framework de LeRobot para entrenamiento y evaluación.
- **Latencia y throughput**: no se han publicado datos concretos, pero para un modelo de este tamaño se espera una latencia de decenas de milisegundos por paso de control en una GPU moderna.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_so101_rubbercube_into_basket (este modelo) | 51,7 M | Cubo de goma en cesta | 50 episodios, 34.634 frames | Apache-2.0 | Hugging Face |
| act-so101-top-wrist-cube-pick (zhangyanpei) | no disponible | Cubo pick | no disponible | no disponible | Hugging Face |
| act_so101_cube1 (bluephysi01) | no disponible | Cubo | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativos publicados para estos modelos. Los otros dos modelos listados en la búsqueda web son similares en cuanto a que utilizan ACT sobre el robot SO-101, pero no se han publicado detalles técnicos ni evaluaciones.

## Limitaciones y advertencias

- **Datos limitados**: el modelo se entrenó con solo 50 episodios, lo que puede limitar su generalización a variaciones de la tarea (cambios de posición del cubo, iluminación, etc.).
- **Sin evaluación publicada**: no se han proporcionado resultados de éxito en el robot real, por lo que el rendimiento real es desconocido.
- **Tarea específica**: la política está entrenada para una tarea concreta ("Poner el cubo de goma en la cesta") y no es una política general de manipulación.
- **Dependencia de cámaras específicas**: el modelo requiere dos cámaras con los nombres exactos `workspace` y `wrist`, y las configuraciones de resolución y FPS deben coincidir con las del entrenamiento.
- **Riesgo de sobreajuste**: el dataset es pequeño y las condiciones de entrenamiento pueden no reflejar la variabilidad del mundo real.
- **Licencia Apache-2.0**: permite uso comercial, pero es recomendable revisar los términos de la licencia y la atribución requerida.

## Enlaces

- [Repositorio del modelo en Hugging Face](https://huggingface.co/TomasLaurinSchweizer/act_so101_rubbercube_into_basket)
- [Dataset de entrenamiento](https://huggingface.co/datasets/TomasLaurinSchweizer/so101_rubbercube_into_basket_20260822_151248)
- [Paper de ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [Documentación de LeRobot ACT](https://huggingface.co/docs/lerobot/main/en/act)
- [Guía de instalación de LeRobot](https://huggingface.co/docs/lerobot/main/en/installation)
- [Guía de hardware de LeRobot](https://huggingface.co/docs/lerobot/main/en/hardware_guide)
- [Guía de imitación learning con LeRobot](https://huggingface.co/docs/lerobot/en/il_robots)
- [Cheat-sheet de CLI de LeRobot](https://huggingface.co/docs/lerobot/main/en/cheat-sheet)
- [Documentación de rollout](https://huggingface.co/docs/lerobot/main/en/inference)
- [GitHub de LeRobot](https://github.com/huggingface/lerobot)
- [Modelo similar: zhangyanpei/act-so101-top-wrist-cube-pick](https://huggingface.co/zhangyanpei/act-so101-top-wrist-cube-pick)
- [Modelo similar: bluephysi01/act_so101_cube1](https://huggingface.co/bluephysi01/act_so101_cube1)
- [Repositorio LeRobot-SO101 en GitHub](https://github.com/EmbodiedFX/LeRobot-SO101)
- [Guía de entrenamiento ACT para SO-101 en Trelis](https://trelis.substack.com/p/train-an-act-policy-for-an-so-101)
