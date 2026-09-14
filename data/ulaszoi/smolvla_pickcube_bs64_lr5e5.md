# ulasZoi/smolvla_pickcube_bs64_lr5e5

## Resumen

`ulasZoi/smolvla_pickcube_bs64_lr5e5` es un checkpoint de política robótica de tipo vision-language-action (VLA) publicado por el usuario ulasZoi en Hugging Face, obtenido por ajuste fino del modelo base `lerobot/smolvla_base` mediante la librería LeRobot. SmolVLA es una familia de modelos VLA compactos y eficientes que, según su model card, alcanza rendimiento competitivo con un coste computacional reducido y puede desplegarse en hardware de consumo. El checkpoint tiene 450.046.176 parámetros y un repositorio de 1,2 GB en formato safetensors.

El modelo resuelve una tarea concreta de manipulación: "pick up the cube" (recoger el cubo). Consume como observaciones el estado articular del robot (`observation.state`, vector de 6 dimensiones) y una imagen de cámara frontal (`observation.images.front`, tensor de 3x480x640), y produce un vector de acción de 6 dimensiones. Está entrenado para el robot `so_follower` (brazo seguidor de la familia SO-100/SO-101) con una única cámara frontal.

Su relevancia es principalmente metodológica y educativa: es un ejemplo reproducible de ajuste fino de SmolVLA con una configuración declarada (batch 64, learning rate 5e-5, 20.000 pasos) sobre un conjunto de datos de imitación de 243 episodios y 76.011 fotogramas a 30 FPS. No incluye resultados de evaluación publicados, por lo que su utilidad práctica debe validarse en el robot real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta, ajustada desde `lerobot/smolvla_base`; detalle interno no disponible en la model card (descrito en arXiv:2506.01844) |
| Parámetros totales | 450.046.176 (aproximadamente 450 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el repositorio solo publica pesos en safetensors |
| Idiomas soportados | No disponible (política robótica; las instrucciones de tarea están en inglés: "pick up the cube") |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repositorio de 1,2 GB, librería `lerobot`) |
| Tipo de robot | `so_follower` |
| Cámaras | `front` |
| Entradas | `observation.state` (STATE, forma `(6,)`); `observation.images.front` (VISUAL, forma `(3, 480, 640)`) |
| Salidas | `action` (ACTION, forma `(6,)`) |
| Pipeline declarado | `robotics` |

## Arquitectura y entrenamiento

SmolVLA se presenta como un modelo VLA compacto y eficiente, orientado a reducir el coste computacional manteniendo un rendimiento competitivo, con posibilidad de despliegue en hardware de consumo. Este checkpoint concreto no es un modelo entrenado desde cero: es un ajuste fino supervisado del modelo base `lerobot/smolvla_base` mediante imitación, usando el flujo de trabajo de LeRobot. La model card no reproduce los detalles internos de la arquitectura (composición del backbone de visión-lenguaje, mecanismo de generación de la acción, tipo de decodificación), que se remiten al artículo arXiv:2506.01844.

El entrenamiento se realizó sobre el dataset `ulasZoi/smolvla_pickcube_all`, compuesto por 243 episodios y 76.011 fotogramas capturados a 30 FPS, con la única tarea "pick up the cube". La configuración declarada es: 20.000 pasos de entrenamiento, batch size 64, optimizador AdamW, learning rate 5e-5, semilla 1000 y versión de LeRobot 0.6.2. No se documenta en la información disponible el uso de RLHF, DPO ni otras fases de alineación posteriores al entrenamiento por imitación, ni innovaciones técnicas adicionales específicas de este checkpoint.

## Capacidades

- Generación de acciones de control motor: produce vectores de acción de 6 grados de libertad a partir del estado articular y de una imagen de cámara frontal.
- Percepción visual integrada: procesa imágenes RGB de 480x640 píxeles como entrada directa de la política.
- Ejecución condicionada por instrucción en lenguaje natural: la tarea se especifica en el momento de la ejecución (por ejemplo, `--task="pick up the cube"`).
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones humanas teleoperadas.
- Integración con LeRobot: compatible con los comandos `lerobot-rollout` y `lerobot-train` de la versión 0.6.2.
- Despliegue en hardware de consumo: según la descripción del método, SmolVLA puede ejecutarse en equipos de gama de consumo.
- No documentado en la información disponible: soporte de tool calling o function calling, capacidades de agente o razonamiento multi-paso, capacidades multilingües, modo de razonamiento explícito, audio o visión más allá de la cámara frontal.

## Casos de uso

- Recogida de objetos en laboratorio de robótica: el modelo ejecuta directamente la tarea "pick up the cube" sobre un brazo `so_follower` con una cámara frontal, lo que permite reproducir el experimento completo con un único comando `lerobot-rollout` y validar el pipeline de LeRobot de extremo a extremo.
- Referencia para experimentos de ajuste fino: al declarar explícitamente batch size (64), learning rate (5e-5) y 20.000 pasos, sirve como punto de comparación reproducible frente a otros checkpoints del mismo autor (por ejemplo, variantes con batch size distinto) para estudiar el efecto de los hiperparámetros en políticas de imitación.
- Docencia en robótica e imitación: es un ejemplo listo para usar con la guía oficial de SmolVLA en LeRobot, útil en cursos donde se necesite un caso real de política VLA con dataset visualizable en el Space de LeRobot.
- Prototipado rápido en hardware asequible: con aproximadamente 450 M de parámetros, es un candidato para validar políticas VLA en estaciones de trabajo o GPUs de gama media antes de escalar a modelos mayores.
- Base para fine-tuning en tareas propias: partiendo de este checkpoint o del base `lerobot/smolvla_base`, un equipo puede adaptar la política a una tarea distinta reutilizando el mismo contrato de observaciones (estado de 6 dimensiones más imagen 480x640) y el mismo robot.
- Pruebas de robustez y variación de dominio: al ser un modelo pequeño y rápido de ejecutar, permite repetir ensayos modificando la posición del cubo, la iluminación o la presencia de distractores para medir la degradación de la política en el robot real.
- Generación de políticas para pipelines de automatización de picking: en escenarios de clasificación y recogida de piezas donde el objeto y la posición sean controlados, la política puede integrarse como componente de percepción-acción dentro de una celda robotizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de este checkpoint indica explícitamente: "No evaluation results have been provided for this policy yet", sin tabla de ensayos, éxitos ni tasas de acierto sobre el robot real. Tampoco se proporcionan métricas de simulación (LIBERO, SimplerEnv ni similares) ni comparaciones numéricas con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como dato oficial. Como referencia orientativa, con 450.046.176 parámetros, los pesos en precisión de 16 bits ocuparían alrededor de 0,9 GB, por lo que el consumo total con activaciones de imagen a 480x640 debería situarse en el rango de pocos gigabytes; esta cifra es una estimación y no un dato publicado.
- GPU recomendadas: no hay recomendaciones oficiales en la información proporcionada. Dado el tamaño del modelo, cabría esperar funcionamiento en GPUs de consumo, pero no se confirma en la model card.
- Compatibilidad con GPU de consumo: la documentación del método afirma que SmolVLA puede desplegarse en hardware de consumo; no se especifican modelos concretos ni requisitos mínimos.
- Opciones de despliegue: LeRobot, mediante los comandos `lerobot-rollout` (ejecución) y `lerobot-train` (entrenamiento), con `--policy.device=cuda` para GPU. No se documentan en la información disponible rutas de despliegue con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El dataset de entrenamiento se capturó a 30 FPS con cámaras de 640x480, pero no se publica la tasa de control alcanzada en inferencia ni el tiempo por paso.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ulasZoi/smolvla_pickcube_bs64_lr5e5` | 450.046.176 | VLA ajustada para "pick up the cube" | No disponible | Apache 2.0 | Hugging Face, librería `lerobot` |
| `lerobot/smolvla_base` | No disponible en la información proporcionada | VLA base preentrenada de SmolVLA | No disponible | No disponible en la información proporcionada | Hugging Face, librería `lerobot` |
| `ulasZoi/smolvla_pickcube_bs4` | No disponible | Variante del mismo ajuste con batch size distinto | No disponible | No disponible en la información proporcionada | Hugging Face |
| Otras políticas de imitación de LeRobot (ACT, Diffusion Policy) | No disponible | Políticas específicas de tarea | No disponible | No disponible en la información proporcionada | Hugging Face / GitHub de LeRobot |

No se dispone de datos comparativos de rendimiento (tasas de éxito, latencia o precisión) entre este checkpoint y las alternativas, porque no se han publicado evaluaciones. La única diferencia verificable frente a `ulasZoi/smolvla_pickcube_bs4` es la configuración de entrenamiento, no el resultado.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay resultados de éxito en robot real ni en simulación, por lo que no puede afirmarse que la política funcione de forma fiable en producción.
- Especialización extrema: está entrenado para una única tarea ("pick up the cube"), un único tipo de robot (`so_follower`) y una única cámara frontal. Cambiar el robot, la cámara, la resolución o el objeto invalida las expectativas de funcionamiento.
- Dependencia del contrato de observaciones: las claves de cámara deben coincidir exactamente con `observation.images.front` y el estado debe ser un vector de 6 dimensiones; cualquier desviación impide la ejecución.
- Riesgo de sobreajuste al dominio de captura: con 243 episodios y 76.011 fotogramas de un mismo montaje, es probable que la política sea sensible a cambios de iluminación, posición inicial del objeto o disposición de la escena. No se documentan pruebas de generalización.
- Sesgos: no se documentan análisis de sesgos. Al tratarse de una política entrenada con demostraciones humanas, hereda las particularidades de los operadores que registraron los datos (trayectorias, velocidades, estilo de agarre).
- Alucinación y errores de política: en robótica, los errores se manifiestan como acciones incorrectas o inseguras (colisiones, agarres fallidos). No hay umbrales de seguridad ni paradas de emergencia documentados; se recomienda supervisión humana y límites de par.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se cite. Hay que verificar además las condiciones del modelo base y del dataset utilizados.
- Idiomas: no se documenta soporte multilingüe. La instrucción de tarea empleada en los ejemplos está en inglés.
- Estado del repositorio: el checkpoint registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación por parte de la comunidad ni retroalimentación de terceros.
- Consistencia de datos: la fecha de creación indicada (2026-09-14) es posterior a la de la mayoría de referencias del ecosistema, lo que conviene comprobar antes de citarla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ulasZoi/smolvla_pickcube_bs64_lr5e5
- Dataset de entrenamiento: https://huggingface.co/datasets/ulasZoi/smolvla_pickcube_all
- Visualización del dataset (Space de LeRobot): https://huggingface.co/spaces/lerobot/visualize_dataset?path=ulasZoi/smolvla_pickcube_all
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Variante con batch size 4: https://huggingface.co/ulasZoi/smolvla_pickcube_bs4
- Artículo de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de registro de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Cita de LeRobot (BibTeX incluida en la model card): Cadene, R. et al., "LeRobot: State-of-the-art Machine Learning for Real-World Robotics in Pytorch", 2024.

Nota sobre la búsqueda web: los resultados obtenidos en la búsqueda no aportan información técnica adicional sobre este modelo; los únicos enlaces pertinentes encontrados son la variante `ulasZoi/smolvla_pickcube_bs4` y el dataset `ulasZoi/smolvla_pickcube_all`, ya incluidos arriba. El resto de resultados no guardan relación con el modelo.
