# yukamatsumae/molmoact2_otter_whitepushplace

## Resumen

Este modelo es un checkpoint de política robótica entrenado con LeRobot sobre el dataset `yukamatsumae/WhitePushPlace_20260827_004728`. Se basa en MolmoAct2, un modelo de razonamiento de acciones multimodal desarrollado por el Allen Institute for AI (AllenAI), que combina un backbone de visión-lenguaje (VLM) con una cabeza de política para control motor. El checkpoint concreto, publicado por el usuario `yukamatsumae`, está especializado en la tarea de empujar objetos blancos sobre una superficie (push place) y se distribuye con licencia Apache-2.0.

El modelo tiene 5.442.196.272 parámetros (5,44 mil millones) y se presenta en formato safetensors, con un tamaño de repositorio de 10,9 GB. Está diseñado para ser usado con el framework LeRobot, que permite entrenar y evaluar políticas de imitación para robots manipuladores. Su relevancia radica en que demuestra la aplicación práctica de un modelo de acción multimodal de gran tamaño a tareas de manipulación física, con un pipeline de entrenamiento reproducible y abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) sobre backbone MolmoAct2 (VLM) |
| Parametros totales | 5.442.196.272 (5,44 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del backbone VLM, no especificado) |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible (modelo orientado a robótica, no a texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (checkpoint de LeRobot) |

## Arquitectura y entrenamiento

El checkpoint se basa en la arquitectura ACT (Action Chunking Transformer), que es un transformador que predice secuencias de acciones (chunks) a partir de observaciones de imagen y estado del robot. En este caso, el backbone es MolmoAct2, un VLM especializado en razonamiento espacial y encarnado (embodied reasoning), entrenado sobre un corpus de 3,3 millones de muestras con una receta de "especializar y ensayar" (specialize-then-rehearse). La cabeza de política ACT se entrena mediante aprendizaje por imitación (behavior cloning) sobre demostraciones humanas o teleoperadas.

El entrenamiento se realizó con LeRobot, que utiliza un pipeline estándar de entrenamiento supervisado con pérdida de regresión sobre las acciones. No se dispone de detalles sobre el número de tokens de entrenamiento, composición del dataset o uso de RLHF/DPO en este checkpoint concreto. El dataset asociado (`WhitePushPlace_20260827_004728`) contiene episodios de la tarea de empujar y colocar objetos blancos, pero no se especifica el número de episodios ni la configuración del robot.

## Capacidades

- Control motor para tareas de manipulación robótica, específicamente empujar y colocar objetos (push place).
- Generación de secuencias de acciones (chunks) a partir de observaciones visuales y proprioceptivas.
- Integración con el framework LeRobot para entrenamiento, evaluación e inferencia en robots reales o simulados.
- Soporte para robots tipo SO-100 (follower) según los comandos de evaluación proporcionados.
- Capacidades multimodales heredadas del backbone MolmoAct2 (visión y lenguaje), aunque el checkpoint está enfocado a la salida de acciones.
- No se especifican capacidades de tool calling, agentes o razonamiento multi-paso fuera del ámbito robótico.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos industriales: el modelo puede controlar un brazo robótico para empujar y colocar piezas en posiciones definidas, reduciendo la necesidad de programación manual.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de modelos VLM grandes a políticas de control de bajo nivel.
- Desarrollo de robots domésticos: tareas como ordenar objetos o limpiar superficies pueden beneficiarse de la capacidad de razonamiento espacial del modelo.
- Benchmarking de políticas robóticas: al estar disponible en LeRobot, permite comparar el rendimiento de MolmoAct2 frente a otras arquitecturas (ACT nativo, Diffusion Policy, etc.) en tareas estandarizadas.
- Entrenamiento de robots en simulación: el checkpoint puede evaluarse en entornos simulados antes de desplegarlo en hardware real, gracias a la compatibilidad con LeRobot.
- Personalización de comportamientos robóticos: mediante fine-tuning con datasets propios, se puede adaptar el modelo a tareas específicas de empuje o colocación con diferentes objetos o configuraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este checkpoint en la información disponible. El paper de MolmoAct2 (arXiv:2605.02881) reporta evaluaciones del modelo base en tareas de razonamiento de acciones, pero no hay datos desglosados para este checkpoint concreto de LeRobot. Se recomienda consultar el repositorio oficial de MolmoAct2 para métricas generales del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, pero dado el tamaño de 5,44 B parámetros, se estima un mínimo de 12-16 GB en FP16 para cargar el modelo completo (sin cuantización).
- GPU recomendadas: una RTX 4090 (24 GB) o superior sería adecuada para inferencia en FP16; para entrenamiento se recomienda una A100 (40/80 GB) o H100.
- Compatibilidad con GPU de consumo: sí, una RTX 3090 o 4090 puede manejar el modelo en FP16, aunque la latencia dependerá de la frecuencia de inferencia requerida.
- Opciones de despliegue: LeRobot soporta inferencia con PyTorch; también se puede exportar a otros formatos si se convierte el checkpoint, pero no hay soporte nativo para vLLM, llama.cpp u Ollama al ser un modelo de robótica.
- Latencia y throughput: no disponibles; dependen del hardware y de la frecuencia de control del robot (típicamente 10-50 Hz).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| molmoact2_otter_whitepushplace (este) | 5,44 B | no disponible | Push place (robótica) | Apache-2.0 | HuggingFace |
| MolmoAct2 base (AllenAI) | no especificado | no especificado | Razonamiento de acciones multimodal | Apache-2.0 | GitHub/HuggingFace |
| ACT nativo (LeRobot) | ~10-100 M | no aplica | Manipulación robótica | Apache-2.0 | HuggingFace |
| Diffusion Policy (LeRobot) | ~10-100 M | no aplica | Manipulación robótica | Apache-2.0 | HuggingFace |

La comparativa muestra que este checkpoint es significativamente más grande que las políticas ACT o Diffusion Policy típicas de LeRobot, gracias al backbone VLM. Sin embargo, no hay datos de rendimiento directos para comparar en la misma tarea.

## Limitaciones y advertencias

- El modelo está especializado en una tarea concreta (empujar objetos blancos) y puede no generalizar a otras tareas sin fine-tuning.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con demostraciones, puede heredar sesgos del operador o del entorno de recogida de datos.
- Riesgo de alucinación en la generación de acciones si las observaciones difieren del dominio de entrenamiento; se recomienda validar en simulación antes del despliegue real.
- Limitaciones de contexto: al ser un modelo de robótica, no maneja texto libre ni conversaciones; su salida son secuencias de acciones.
- La licencia Apache-2.0 permite uso comercial, pero se debe atribuir el origen y mantener el aviso de licencia.
- Para producción, es necesario calibrar la frecuencia de control y la seguridad del robot; el modelo no incluye mecanismos de seguridad integrados.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/yukamatsumae/molmoact2_otter_whitepushplace
- Repositorio oficial de MolmoAct2 (GitHub): https://github.com/allenai/molmoact2
- Repositorio de MolmoAct (GitHub): https://github.com/allenai/MolmoAct
- Paper de MolmoAct2 (arXiv): https://arxiv.org/abs/2605.02881
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Checkpoint relacionado (yellowpushplace_lora): https://huggingface.co/yukamatsumae/molmoact2_otter_yellowpushplace_lora
