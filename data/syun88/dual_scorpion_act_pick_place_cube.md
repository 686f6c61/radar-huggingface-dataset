# syun88/dual_scorpion_act_pick_place_cube

## Resumen

`syun88/dual_scorpion_act_pick_place_cube` es una política de robótica entrenada con el método ACT (Action Chunking with Transformers) y publicada en Hugging Face mediante la librería LeRobot. El autor es el usuario `syun88` y el modelo resuelve una tarea concreta de manipulación: recoger y colocar un cubo con un robot de doble brazo (dual scorpion). No es un modelo de lenguaje generalista, sino una política de imitación que mapea observaciones visuales y de estado del robot a secuencias de acciones motrices.

El modelo se apoya en el paper ACT (arXiv:2304.13705), un método de aprendizaje por imitación que predice fragmentos cortos de acciones (*action chunks*) en lugar de pasos individuales, lo que reduce el error de acumulación y suele lograr tasas de éxito altas en tareas de manipulación. Se entrenó a partir del dataset `syun88/dual_scorpion_pick_place_cube_20261119_142553`, generado presumiblemente mediante teleoperación.

Su relevancia es acotada pero clara: sirve como referencia reproducible para quien quiera desplegar o reentrenar una política ACT en un robot de doble brazo con LeRobot. El repositorio es pequeño (0,2 GB), tiene 51.689.104 parámetros y se distribuye con licencia Apache 2.0, lo que facilita su reutilización y adaptación. No hay información sobre idiomas ni sobre benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación basada en transformer |
| Parametros totales | 51.689.104 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política robótica, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; modelo de robótica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es ACT, un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. En lugar de predecir una acción por paso, el modelo predice *chunks* de acciones de horizonte corto, lo que mitiga el problema de acumulación de errores típico de las políticas paso a paso y mejora la estabilidad en tareas de manipulación. La implementación concreta corresponde a LeRobot, la librería de Hugging Face para robótica, que empaqueta el modelo junto con su pipeline de entrenamiento e inferencia.

El entrenamiento se realizó sobre el dataset `syun88/dual_scorpion_pick_place_cube_20261119_142553`, que no está descrito en detalle en la información disponible (número de episodios, composición y número de tokens o frames no disponibles). No se indica si hubo RLHF, DPO ni ninguna fase de ajuste posterior; ACT es un método puramente de imitación supervisada. Tampoco se documentan innovaciones adicionales más allá del propio *action chunking*.

## Capacidades

- Manipulación robótica de tipo *pick and place*: recoger un cubo y colocarlo, con un robot de doble brazo (dual scorpion).
- Aprendizaje por imitación a partir de datos de teleoperación.
- Predicción de fragmentos de acción (*action chunks*) en lugar de pasos individuales.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- Ejecución de políticas en robots compatibles con LeRobot (por ejemplo, configuraciones `so100_follower` en los ejemplos de la model card).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Recogida y colocación de cubos en laboratorio: el modelo ejecuta directamente la tarea para la que fue entrenado sobre el robot dual scorpion, sirviendo como base para experimentos de manipulación bimanual.
- Reproducción de experimentos de investigación: al estar entrenado con LeRobot y publicar pesos en safetensors, permite replicar el pipeline de entrenamiento e inferencia del paper ACT en un entorno controlado.
- Punto de partida para *fine-tuning*: el modelo puede reentrenarse con un dataset propio de otra tarea de pick and place usando `lerobot-train --policy.type=act`, aprovechando los pesos como inicialización.
- Evaluación comparativa de políticas: sirve como referencia de política ACT en tareas de manipulación para comparar con otras arquitecturas (Diffusion Policy, VQ-BeT, etc.) dentro de LeRobot.
- Docencia y formación en robótica de imitación: el repositorio es pequeño (0,2 GB) y la licencia Apache 2.0 permite usarlo en cursos y talleres sin restricciones comerciales.
- Pruebas de despliegue en hardware de doble brazo: útil para validar la integración de LeRobot con robots bimanuales y medir latencia y tasa de éxito en entornos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 51,7 M de parámetros el modelo es muy ligero y cabe holgadamente en cualquier GPU consumer moderna, aunque no se especifica la cifra exacta.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con al menos unos pocos GB de memoria libre debería ser suficiente, pero no se documenta.
- Cabe en GPU consumer: sí, por el reducido número de parámetros (51,7 M), aunque no se indica el modelo concreto.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte para dispositivos CUDA según la model card.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks ni comparaciones con otras políticas robóticas (Diffusion Policy, VQ-BeT, etc.), por lo que no es posible establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Modelo altamente específico: solo está entrenado para la tarea de recoger y colocar un cubo con un robot dual scorpion; no generaliza a otras tareas ni a otros robots sin reentrenamiento.
- Sin información sobre sesgos: no se documentan sesgos conocidos, pero al ser un modelo de imitación hereda los sesgos y la distribución de los datos de teleoperación.
- Riesgo de fallo fuera de distribución: si las condiciones visuales o del robot difieren de las del dataset de entrenamiento, la tasa de éxito puede degradarse sin aviso.
- Sin datos de benchmarks ni de tasa de éxito: no se puede verificar el rendimiento real del modelo a partir de la información disponible.
- Sin información sobre idiomas ni contexto: no aplica, pero conviene no confundirlo con un modelo de lenguaje.
- Licencia Apache 2.0: permite uso comercial y modificación, pero exige mantener el aviso de licencia y no ofrece garantías.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/syun88/dual_scorpion_act_pick_place_cube
- Dataset: https://huggingface.co/datasets/syun88/dual_scorpion_pick_place_cube_20261119_142553
- Paper ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
