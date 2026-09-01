# WoojongKim/smolvla_policy_omx_gelsight_env1_square

## Resumen

El modelo `WoojongKim/smolvla_policy_omx_gelsight_env1_square` es una política robótica de visión-lenguaje-acción (VLA) entrenada sobre la arquitectura SmolVLA, un modelo compacto y eficiente diseñado para ejecutarse en hardware de consumo. Ha sido desarrollado por WoojongKim utilizando el framework LeRobot de Hugging Face, y está especializado en una tarea concreta de manipulación con sensor táctil GelSight, como indica el nombre del dataset de entrenamiento (`omx_gelsight_env1_square`). El modelo cuenta con 450 millones de parámetros y se distribuye bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones.

SmolVLA (paper arXiv:2506.01844) propone una alternativa ligera a los VLA masivos existentes, manteniendo un rendimiento competitivo con un coste computacional reducido. Este checkpoint concreto es un ajuste fino del modelo base `lerobot/smolvla_base` sobre un dataset específico de robótica, por lo que su utilidad se limita a la tarea para la que fue entrenado, aunque puede servir como punto de partida para otros fine-tunings.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA (detalles internos no disponibles) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles (el modelo no está orientado a lenguaje general) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | LeRobot |
| Pipeline | robotics |
| Modelo base | `lerobot/smolvla_base` |
| Dataset de entrenamiento | `WoojongKim/omx_gelsight_env1_square` |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual, un modelo de lenguaje y un cabezal de acción para generar comandos motores a partir de observaciones visuales e instrucciones en lenguaje natural. La arquitectura exacta del modelo base no se detalla en la información disponible, pero se sabe que está optimizada para ser compacta y eficiente, permitiendo su despliegue en GPUs de consumo.

El entrenamiento de este checkpoint se realizó mediante el framework LeRobot, utilizando el dataset `WoojongKim/omx_gelsight_env1_square`, que probablemente contiene demostraciones de tareas de manipulación con sensores táctiles GelSight en un entorno cuadrado. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. El modelo se publica como un ajuste fino del checkpoint base `lerobot/smolvla_base`.

## Capacidades

- Generación de acciones motoras (control de robots) a partir de observaciones visuales y, potencialmente, instrucciones en lenguaje natural.
- Procesamiento de información táctil proveniente de sensores GelSight, integrada en el pipeline de percepción.
- Ejecución de políticas de manipulación en tareas específicas (entorno cuadrado con sensor táctil).
- Compatibilidad con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No se han documentado capacidades de tool calling, agentes o razonamiento multi-paso, ya que es un modelo de política puro.

## Casos de uso

- Manipulación robótica fina con retroalimentación táctil: el modelo puede controlar un brazo robótico equipado con un sensor GelSight para tareas como inserción de piezas, agarre de objetos delicados o ensamblaje de precisión, aprovechando la información táctil para ajustar la fuerza y la posición.
- Investigación en aprendizaje por imitación: al estar entrenado con LeRobot, sirve como referencia para estudiar la transferencia de políticas VLA compactas a tareas específicas, permitiendo reproducir experimentos y comparar con otros checkpoints.
- Desarrollo de prototipos en robótica educativa: su tamaño reducido (450M parámetros) permite ejecutarlo en GPUs de gama media, facilitando su uso en laboratorios universitarios o proyectos de bajo presupuesto.
- Fine-tuning para nuevas tareas: al ser un checkpoint intermedio, puede servir como inicialización para entrenar políticas en tareas similares con sensores táctiles, reduciendo el tiempo de convergencia.
- Evaluación de hardware de bajo coste: su eficiencia permite probar el rendimiento de VLA en plataformas como Jetson o GPUs integradas, validando su viabilidad en robots de bajo coste.
- Benchmarking de modelos VLA: puede utilizarse como baseline en comparativas de modelos de política robótica, dado que su licencia Apache 2.0 facilita su redistribución y modificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K, ya que se trata de un modelo de robótica y no de lenguaje general. Tampoco se han reportado tasas de éxito en tareas de manipulación.

## Requisitos de hardware

- VRAM estimada: con 450M parámetros, el modelo en FP32 ocuparía aproximadamente 1,8 GB, pero no se dispone de datos oficiales sobre el consumo real durante inferencia. Es probable que quepa en GPUs con 8 GB de VRAM o menos, pero no se puede confirmar sin pruebas.
- GPU recomendadas: no se especifican, pero por tamaño podría ejecutarse en RTX 3060, RTX 4060 o superiores. También podría funcionar en hardware de menor capacidad si se cuantiza, aunque no se ofrecen versiones cuantizadas.
- Opciones de despliegue: al estar integrado con LeRobot, se puede ejecutar mediante las herramientas de inferencia de LeRobot (`lerobot-record`), y es compatible con el ecosistema de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas VLA compactas para robótica con sensor táctil). El modelo base `lerobot/smolvla_base` es el punto de referencia, pero no se han publicado comparativas con otros checkpoints.

## Limitaciones y advertencias

- El modelo está especializado en una tarea concreta (entorno cuadrado con sensor GelSight) y no es generalizable a otras tareas sin un nuevo fine-tuning.
- No se ha documentado el rendimiento en entornos reales; los resultados pueden variar significativamente respecto a simulaciones o datasets de entrenamiento.
- Al ser un modelo de política, no es adecuado para tareas de lenguaje natural, razonamiento o generación de texto.
- No se han reportado sesgos específicos, pero al entrenarse con un dataset limitado, puede heredar sesgos de las demostraciones (por ejemplo, posturas o estrategias particulares del operador).
- Riesgo de alucinación no aplica en el sentido tradicional, pero puede generar acciones incorrectas si las observaciones difieren del dominio de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la procedencia del dataset de entrenamiento para evitar problemas de derechos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WoojongKim/smolvla_policy_omx_gelsight_env1_square
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/WoojongKim/omx_gelsight_env1_square
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
