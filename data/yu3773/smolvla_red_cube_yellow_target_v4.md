# Yu3773/smolvla_red_cube_yellow_target_v4

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por el equipo de Hugging Face LeRobot, que logra un rendimiento competitivo en tareas de robótica con un coste computacional reducido y puede desplegarse en hardware de consumo. Este repositorio concreto contiene un ajuste fino de `lerobot/smolvla_base` entrenado por el usuario Yu3773 para una tarea específica: recoger un cubo rojo y colocarlo dentro de un área objetivo amarilla, sobre un robot tipo `so_follower` con cámaras de muñeca y superior.

El modelo tiene 450 millones de parámetros en total y está licenciado bajo Apache 2.0. Se entrenó con 53 episodios (23.416 fotogramas a 30 FPS) del dataset `Yu3773/so101_red_cube_yellow_target_v4`, con 20.000 pasos de entrenamiento. Su relevancia radica en que demuestra cómo un VLA de tamaño reducido puede especializarse en una tarea de manipulación robótica con un dataset pequeño y hardware asequible, siguiendo el flujo de trabajo de LeRobot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, basado en SmolVLM con cabezal de acción) |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no se especifica en la información del modelo) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que parte de un VLM preentrenado (SmolVLM) y añade un cabezal de acción para emitir comandos de control del robot. En este ajuste fino, el modelo recibe como entrada observaciones de hasta tres cámaras (imágenes de 256x256 píxeles) más una cuarta cámara vacía (480x640), junto con el estado del robot (6 dimensiones). La salida es un vector de acción de 6 dimensiones que controla el robot.

El entrenamiento se realizó con LeRobot versión 0.6.0, con un optimizador AdamW, tasa de aprendizaje de 0.0001, tamaño de lote de 16 y semilla 1000. El dataset contiene 53 episodios de la tarea "recoger el cubo rojo y colocarlo dentro del área amarilla", grabados a 30 FPS. Se trata de un ajuste fino sobre el modelo base `lerobot/smolvla_base`, no de un entrenamiento desde cero.

## Capacidades

- Control robótico de manipulación: el modelo genera vectores de acción de 6 dimensiones (posición y orientación) a partir de observaciones visuales y del estado del robot.
- Percepción multimodal: procesa imágenes de hasta 4 cámaras (muñeca, superior y otras) junto con el estado del robot.
- Comprensión de lenguaje natural: hereda del modelo base la capacidad de interpretar instrucciones textuales como "Pick up the red cube and place it inside the yellow target area".
- Aprendizaje por imitación: está entrenado para imitar demostraciones humanas en la tarea específica del cubo rojo.
- Ajuste fino específico de tarea: está especializado en una única tarea de manipulación, no es un modelo generalista.
- Integración con LeRobot: compatible con el ecosistema de herramientas de LeRobot para entrenamiento, evaluación y despliegue.

## Casos de uso

- Manipulación de objetos en robótica de laboratorio: el modelo puede controlar un brazo robótico para tareas de pick-and-place, como la tarea del cubo rojo, en entornos de investigación.
- Automatización de procesos industriales sencillos: tareas repetitivas de recogida y colocación de piezas en cintas transportadoras, usando el modelo como política de control.
- Evaluación de políticas de aprendizaje por imitación: sirve como caso de estudio para comparar el rendimiento de SmolVLA con otros VLA en una tarea estándar.
- Investigación en VLA compactos: los investigadores pueden estudiar cómo un modelo de 450M parámetros se comporta frente a modelos más grandes en robótica.
- Prototipado rápido de políticas: con solo 53 episodios de datos, el modelo permite validar el flujo completo de LeRobot (grabación, entrenamiento, despliegue) en menos de un día.
- Enseñanza de robótica: sirve como ejemplo práctico de ajuste fino de un VLA en cursos de robótica o aprendizaje por refuerzo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio del modelo no incluye evaluación de éxito en el robot real, y el paper de SmolVLA (arXiv:2506.01844) reporta resultados agregados del modelo base, no de este ajuste fino específico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible explícitamente, pero al tratarse de un modelo de ~450M parámetros en fp32, la inferencia con LeRobot en GPU es viable con una tarjeta de 8-12 GB de VRAM. Con cuantización, cabría en 4-6 GB.
- GPU recomendadas: RTX 3060/4070, A100, H100, o cualquier GPU con al menos 8 GB de VRAM.
- Sí cabe en GPU de consumo: el modelo está diseñado para funcionar en hardware de consumo (por eso se llama "SmolVLA"), así que una RTX 3060 o superior es suficiente para inferencia.
- Opciones de despliegue: LeRobot CLI (`lerobot-rollout`), que es la vía estándar para ejecutar el modelo en un robot real. También se puede integrar en pipelines de LeRobot para entrenamiento y evaluación.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Yu3773/smolvla_red_cube_yellow_target_v4 | 450M | No disponible | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | ~450M | No disponible | Apache 2.0 | Hugging Face |
| OpenVLA (7B) | 7B | 32K | MIT | Hugging Face |

SmolVLA se diferencia de OpenVLA en que es mucho más compacto (450M vs 7B), lo que permite desplegarlo en hardware de consumo, pero sacrifica capacidad de generalización. No hay datos de rendimiento comparativos disponibles para este ajuste fino concreto.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo está entrenado únicamente con 53 episodios de una sola tarea y un solo robot, por lo que no generalizará a otras tareas o entornos sin un ajuste fino adicional.
- Riesgo de alucinación: al ser un VLA, puede generar acciones erróneas si la tarea no está bien especificada o si el entorno cambia drásticamente (iluminación, posición de objetos, etc.).
- Limitaciones de contexto: la ventana de contexto no está documentada en el modelo; la entrada se limita a las imágenes y el estado del robot.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero hay que cumplir con la atribución y las cláusulas de la licencia.
- Caveat de producción: el modelo no ha sido evaluado en el robot real según la model card ("No evaluation results have been provided"), por lo que su rendimiento en producción no está validado.
- Dependencia de LeRobot: el despliegue y el entrenamiento requieren la infraestructura de LeRobot, lo que puede limitar su uso fuera de ese ecosistema.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Yu3773/smolvla_red_cube_yellow_target_v4)
- [Dataset de entrenamiento](https://huggingface.co/datasets/Yu3773/so101_red_cube_yellow_target_v4)
- [Modelo base lerobot/smolvla_base](https://huggingface.co/lerobot/smolvla_base)
- [Paper SmolVLA (arXiv:2506.01844)](https://arxiv.org/abs/2506.01844)
- [Documentación de LeRobot para SmolVLA](https://github.com/huggingface/lerobot/blob/main/docs/source/smolvla.mdx)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
- [Visualizador del dataset](https://huggingface.co/spaces/lerobot/visualize_dataset?path=Yu3773/so101_red_cube_yellow_target_v4)
