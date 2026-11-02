# wego-mink/singlearm_new_apple_4point_smolvla

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico de bajo coste computacional. Esta ficha concreta, `wego-mink/singlearm_new_apple_4point_smolvla`, es un fine-tuning del checkpoint base `lerobot/smolvla_base` sobre el dataset `wego-mink/singlearm_new_apple_4point`, orientado a una tarea de manipulación con un brazo robótico único y cuatro puntos de agarre sobre manzanas.

El modelo resuelve el problema de desplegar políticas de control visomotoras en hardware de consumo sin renunciar a la generalización que aporta un backbone visión-lenguaje. Con 450 millones de parámetros y un repositorio de 0,9 GB en formato safetensors, es lo bastante pequeño para inferencia en GPU de gama media y para integración en bucles de control en tiempo real mediante la librería LeRobot.

Es relevante ahora porque la familia SmolVLA (arXiv:2506.01844) demuestra que un VLA de escala reducida puede competir con modelos mucho mayores en tareas de manipulación, y porque este checkpoint ejemplifica el flujo típico de especialización: partir de un modelo base público y adaptarlo a un robot y una tarea concretos con un dataset propio, bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacto, familia SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a acción robótica, no a texto libre) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

SmolVLA es un modelo visión-lenguaje-acción que combina un codificador visual, un componente de lenguaje y un cabezal de predicción de acciones, entrenado para mapear observaciones (imágenes de cámara del robot) e instrucciones en lenguaje natural a comandos motores de bajo nivel. La model card no detalla la composición interna exacta de capas ni el número de tokens de entrenamiento del modelo base; esa información debe consultarse en el paper arXiv:2506.01844.

Este checkpoint concreto es un fine-tuning de `lerobot/smolvla_base` sobre el dataset `wego-mink/singlearm_new_apple_4point`, que define una tarea de manipulación con un solo brazo y cuatro puntos de agarre sobre manzanas. El entrenamiento se ha realizado con LeRobot, cuyo flujo estándar (`lerobot-train`) produce checkpoints en formato safetensors listos para `lerobot-record`. No se especifican en la información disponible detalles sobre RLHF, DPO ni composición del dataset de preentrenamiento del modelo base.

## Capacidades

- Predicción de acciones robóticas a partir de observaciones visuales e instrucciones en lenguaje natural.
- Control de un brazo robótico único en tareas de agarre y manipulación de objetos (en este checkpoint, específicamente manzanas con cuatro puntos de agarre).
- Integración nativa con el ecosistema LeRobot: entrenamiento con `lerobot-train`, evaluación e inferencia con `lerobot-record`.
- Compatibilidad con robots tipo `so100_follower` según los ejemplos de la model card.
- Despliegue en hardware de consumo según las indicaciones del paper de SmolVLA.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito; es una política de control, no un asistente conversacional.

## Casos de uso

- Recolección automatizada en línea de manipulación: el modelo puede ejecutar la secuencia de agarre sobre manzanas con cuatro puntos definidos, integrándose en una célula robotizada con brazo único y cámara cenital.
- Prototipado rápido de políticas con LeRobot: sirve como punto de partida para fine-tuning sobre nuevos datasets, ya que el flujo `lerobot-train` permite reentrenar con un `--dataset.repo_id` distinto y reutilizar la arquitectura.
- Evaluación comparativa de políticas VLA: al ser un checkpoint pequeño (450 M de parámetros, 0,9 GB), permite iterar experimentos de evaluación con `lerobot-record` en pocos minutos y comparar contra el modelo base.
- Investigación en aprendizaje por imitación: útil para estudiar cómo un VLA compacto se especializa en una tarea estrecha y qué degradación sufre en generalización fuera de distribución.
- Educación y demostraciones de robótica: su tamaño reducido y licencia Apache 2.0 facilitan su uso en laboratorios docentes con GPUs de gama media.
- Despliegue en robots de bajo coste: al requerir menos recursos que VLAs de mayor escala, encaja en plataformas tipo SO-100 con una GPU de consumo conectada al puesto de control.
- Base para pipelines de data flywheel: las evaluaciones generadas con `lerobot-record` pueden reincorporarse como nuevos episodios de entrenamiento para refinar la política de forma iterativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 M de parámetros en safetensors (0,9 GB de repo), la inferencia en fp32 rondaría 1,8 GB de pesos y en fp16/bf16 unos 0,9 GB, más overhead de activaciones y del codificador visual.
- GPU recomendadas: no especificadas en la información disponible; el paper de SmolVLA indica despliegue en hardware de consumo.
- Cabe en GPU de consumo: previsiblemente sí, en tarjetas con 6-8 GB de VRAM o superiores, aunque no se confirma con cifras oficiales.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), que es el flujo documentado. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `wego-mink/singlearm_new_apple_4point_smolvla` | 450.046.176 | no disponible | Manipulación brazo único, 4 puntos de agarre | Apache 2.0 | Hugging Face (LeRobot) |
| `lerobot/smolvla_base` | no disponible en la información | no disponible | VLA base generalista | Apache 2.0 (según familia SmolVLA) | Hugging Face (LeRobot) |
| Políticas ACT de LeRobot | no disponible | no disponible | Control visomotor por imitación | no disponible | Hugging Face (LeRobot) |

La comparación con alternativas de la misma categoría (otros VLAs compactos o políticas de imitación) no puede completarse con datos numéricos porque la información proporcionada no incluye benchmarks ni especificaciones de los modelos comparables.

## Limitaciones y advertencias

- Especialización estrecha: el checkpoint está entrenado para una tarea muy concreta (brazo único, manzanas, cuatro puntos de agarre); su rendimiento fuera de esa distribución no está garantizado.
- Sin benchmarks publicados: no hay métricas de éxito, generalización ni robustez que permitan validar el modelo antes de desplegarlo.
- Dependencia del dataset: la calidad y diversidad de `wego-mink/singlearm_new_apple_4point` condicionan directamente el comportamiento; no se documenta su composición ni tamaño.
- Sin información sobre sesgos: al ser un modelo de acción, los sesgos relevantes serían de distribución visual y de configuración física del robot, no documentados.
- Riesgo de fallo en ejecución física: como toda política robótica, errores de predicción pueden traducirse en colisiones o agarres fallidos; se recomienda entorno controlado y parada de emergencia.
- Idiomas: no se documenta soporte multilingüe de instrucciones; la model card no especifica el idioma de los comandos de entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene conservar los avisos de atribución y verificar la licencia del modelo base y del dataset.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wego-mink/singlearm_new_apple_4point_smolvla
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/wego-mink/singlearm_new_apple_4point
