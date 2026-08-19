# yukamatsumae/molmoact2_otter_yellowpush

## Resumen

El modelo `yukamatsumae/molmoact2_otter_yellowpush` es una política robótica entrenada con el framework LeRobot de Hugging Face, basada en la arquitectura MolmoAct2 desarrollada por el Allen Institute for AI (AllenAI). Se trata de un modelo de control para manipulación robótica, específicamente entrenado para la tarea de empujar un objeto amarillo (YellowPush), como indica el nombre del dataset asociado. Con 5.442 millones de parámetros y un peso total de 10,9 GB en formato safetensors, este modelo representa un ejemplo de aplicación de modelos multimodales de lenguaje y visión al control de robots físicos.

La relevancia de este modelo radica en que demuestra el uso práctico de MolmoAct2, la segunda generación de la familia MolmoAct, que según el repositorio oficial de AllenAI es "más rápida, más fuerte y mejor en todos los aspectos" que su predecesora. Al estar publicado bajo licencia Apache 2.0 y entrenado con LeRobot, cualquier desarrollador puede reproducir el entrenamiento, adaptarlo a otras tareas o desplegarlo en robots compatibles, lo que lo convierte en un recurso valioso para la comunidad de robótica open source.

Sin embargo, la información disponible sobre este modelo concreto es muy limitada: la model card no incluye detalles técnicos específicos más allá de la plantilla genérica de LeRobot, y no se han publicado resultados de benchmarks ni especificaciones de entrenamiento. Esta ficha se basa únicamente en los datos proporcionados por HuggingFace y la documentación pública de MolmoAct2.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MolmoAct2 (multimodal, basada en transformer, orientada a acciones robóticas) |
| Parametros totales | 5.442.196.272 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato safetensors sin cuantizar) |
| Idiomas soportados | no disponible (probablemente inglés, sin confirmar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta de este modelo no está documentada en la información proporcionada. Sin embargo, por el nombre y la referencia al repositorio oficial de AllenAI, se sabe que se basa en MolmoAct2, un modelo multimodal diseñado para generar acciones de control robótico a partir de observaciones visuales y de estado. MolmoAct2 es la evolución de MolmoAct, que combina un modelo de lenguaje multimodal con una cabeza de política para producir comandos de actuación.

El entrenamiento se realizó con el framework LeRobot, como indica la model card y los tags. LeRobot es una biblioteca de Hugging Face para aprendizaje por imitación en robótica. El dataset utilizado es `yukamatsumae/YellowPush_20260818_082007`, que corresponde a una tarea de empuje de un objeto amarillo. No se dispone de información sobre el número de tokens, la composición del dataset, el uso de RLHF/DPO u otras técnicas de entrenamiento. Tampoco se documentan innovaciones técnicas específicas en este modelo concreto.

## Capacidades

- Control robótico: el modelo genera políticas de acción para robots, concretamente para la tarea de empujar un objeto amarillo (YellowPush).
- Percepción visual: al estar basado en MolmoAct2, se espera que procese entradas visuales (imágenes de cámaras) para decidir las acciones, aunque no se detalla en la información disponible.
- Aprendizaje por imitación: entrenado mediante demostraciones, siguiendo el paradigma de LeRobot.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, evaluación y despliegue de LeRobot.
- No se confirma soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, ya que es un modelo especializado en robótica y no un modelo conversacional general.

## Casos de uso

- Manipulación robótica en laboratorio: el modelo puede desplegarse en un brazo robótico tipo SO-100 (como indica el comando de evaluación) para realizar tareas de empuje de objetos, útil en investigación de robótica.
- Reproducción de experimentos de aprendizaje por imitación: investigadores pueden clonar el repositorio y reproducir el entrenamiento con su propio dataset siguiendo la guía de LeRobot.
- Base para fine-tuning en nuevas tareas: dado que es un modelo preentrenado con pesos abiertos, se puede adaptar a otras tareas de manipulación (apilar, agarrar, etc.) mediante entrenamiento adicional con LeRobot.
- Evaluación de políticas robóticas: el modelo sirve como punto de partida para comparar el rendimiento de diferentes arquitecturas de control en entornos físicos o simulados.
- Educación en robótica con IA: estudiantes y desarrolladores pueden estudiar cómo un modelo multimodal de 5.4B parámetros se aplica al control de robots, gracias a la documentación de LeRobot.
- Despliegue en robots de bajo coste: al ser un modelo relativamente pequeño (5.4B) y con licencia permisiva, puede ejecutarse en hardware asequible, facilitando prototipos rápidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas específicas de robótica (tasa de éxito en la tarea, precisión de empuje, etc.) para este modelo concreto. El repositorio oficial de MolmoAct2 en GitHub podría contener evaluaciones de la familia de modelos, pero no se ha accedido a ellas en esta búsqueda.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Como referencia, un modelo de 5.4B parámetros en fp32 requiere aproximadamente 21,8 GB de VRAM; en fp16 o bf16, unos 10,9 GB. Con cuantización a 8 bits, podría reducirse a ~5,5 GB, y a 4 bits a ~2,7 GB, aunque no se confirma que el modelo soporte estas cuantizaciones.
- GPU recomendadas: para inferencia en fp16, una GPU con al menos 12-16 GB de VRAM (por ejemplo, RTX 4070 Ti, RTX 4080, A100 40GB). Para entrenamiento, se necesitaría más VRAM, posiblemente 24 GB o más (RTX 3090, RTX 4090, A100).
- Si cabe en consumer GPU: probablemente sí, con cuantización o en fp16 en GPUs de gama alta (RTX 4090). No hay datos oficiales.
- Opciones de despliegue: LeRobot proporciona scripts de evaluación e inferencia, pero no se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que es un modelo de robótica, no un LLM conversacional. El despliegue se haría típicamente con PyTorch y los módulos de LeRobot.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de robótica de tamaño similar. La familia MolmoAct2 de AllenAI podría compararse con otros modelos de políticas robóticas como RT-2 de Google o OpenVLA, pero no hay datos concretos sobre este modelo específico. Se recomienda consultar el repositorio oficial de MolmoAct2 para conocer comparativas con su predecesor MolmoAct.

## Limitaciones y advertencias

- Sesgos conocidos: no hay información. Al ser un modelo entrenado con un dataset específico (empuje de objetos amarillos), su comportamiento está limitado a esa tarea y no generaliza a otras sin fine-tuning.
- Riesgo de alucinación: no aplica directamente, al ser un modelo de acción robótica, pero puede generar acciones incorrectas si las condiciones del entorno difieren de las de entrenamiento.
- Limitaciones de contexto o idioma: no se especifican idiomas; el modelo no está diseñado para procesamiento de lenguaje natural, sino para control robótico.
- Restricciones de licencia: licencia Apache 2.0, permite uso comercial y modificación, pero se debe atribuir al autor original.
- Caveat para producción: la model card es una plantilla genérica sin detalles de rendimiento, robustez o seguridad. Antes de usar en entornos reales, es imprescindible evaluar el modelo en condiciones controladas y validar su seguridad. No se recomienda su uso en robots que interactúen con personas sin supervisión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yukamatsumae/molmoact2_otter_yellowpush
- Repositorio oficial de MolmoAct2 (AllenAI): https://github.com/allenai/molmoact2
- Repositorio de MolmoAct (AllenAI): https://github.com/allenai/MolmoAct
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
