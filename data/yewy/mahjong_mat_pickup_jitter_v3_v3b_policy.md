# Yewy/mahjong_mat_pickup_jitter_v3_v3b_policy

## Resumen

Este modelo es una política de robótica entrenada con **Action Chunking with Transformers (ACT)**, un método de aprendizaje por imitación desarrollado originalmente por investigadores de Stanford (Zhao et al., 2023). La política ha sido entrenada por el usuario de Hugging Face **Yewy** mediante la librería **LeRobot** de Hugging Face, y está especializada en una tarea concreta de manipulación: recoger piezas de una estera de mahjong (mahjong mat pickup) con jitter en la posición, utilizando un brazo robótico **SO101** (posiblemente en configuración móvil tipo **LeKiwi**).

ACT resuelve el problema de la imitación de demostraciones teleoperadas: en lugar de predecir una acción por paso temporal, el modelo predice bloques (chunks) de acciones cortas, lo que reduce la acumulación de error y la necesidad de un gran volumen de datos. El modelo es relevante como ejemplo práctico de cómo la comunidad puede entrenar y desplegar políticas de manipulación de bajo coste con hardware accesible (brazos SO-100/SO-101) y software abierto. Tiene aproximadamente 51,7 millones de parámetros y se distribuye en formato safetensors bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), aprendizaje por imitación |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica: política de robótica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (0,2 GB en el repositorio) |

## Arquitectura y entrenamiento

ACT es una arquitectura basada en transformadores que combina un codificador CVAE (Conditional Variational Autoencoder) con un transformador para la predicción de secuencias de acciones. El modelo recibe como entrada observaciones del entorno (típicamente imágenes de cámaras y estados articulares del robot) y predice bloques de acciones consecutivas en lugar de pasos individuales. Esto mitiga el problema de error compuesto en la imitación y permite alcanzar tasas de éxito altas con relativamente pocas demostraciones teleoperadas. El paper original se publicó en arXiv (2304.13705) bajo el título "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware".

El entrenamiento se realizó con la librería LeRobot de Hugging Face sobre el dataset **Yewy/mahjong_mat_pickup_jitter_v3_v3b_224**, que contiene demostraciones teleoperadas de la tarea de recogida de piezas en una estera de mahjong con variación de posición (jitter). La resolución de las imágenes del dataset parece ser de 224 píxeles, según el sufijo del nombre del dataset. No se dispone de información sobre el número de episodios, el número de pasos de entrenamiento ni los hiperparámetros concretos utilizados.

## Capacidades

- Predicción de bloques de acciones (action chunking) para manipulación fina de objetos.
- Control de un brazo robótico SO101 (o configuración LeKiwi) para tareas de recogida (pick-up) de piezas.
- Generalización a variaciones de posición del objeto (entrenado con jitter en la posición de las piezas).
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Integración nativa con el ecosistema LeRobot (entrenamiento, evaluación y grabación de episodios de evaluación).
- No tiene capacidades de lenguaje, visión genérica ni tool calling: es una política específica de tarea.

## Casos de uso

- **Automatización de recogida de piezas pequeñas en mesa**: la política controla el brazo SO101 para agarrar objetos colocados en posiciones variables sobre una estera, útil para prototipos de pick-and-place de bajo coste.
- **Investigación en aprendizaje por imitación**: sirve como punto de partida para experimentos de fine-tuning, variación de datasets o comparación con otras políticas (Diffusion Policy, TDMPC, etc.) dentro de LeRobot.
- **Educación en robótica**: ideal como ejemplo didáctico en cursos o talleres que usen hardware SO-100/SO-101, dado el bajo coste del robot y la documentación completa de LeRobot.
- **Validación de pipelines de teleoperación**: permite verificar que un sistema de teleoperación genera datos de calidad suficientes para entrenar políticas con éxito.
- **Desarrollo de tareas de manipulación similares**: el flujo de trabajo (dataset → entrenamiento ACT → evaluación con lerobot-record) puede replicarse para tareas análogas como clasificación de objetos o colocación en contenedores.
- **Pruebas de robótica móvil con LeKiwi**: si el brazo está montado en la plataforma móvil LeKiwi, puede emplearse para experimentos de manipulación con base móvil.
- **Benchmarking de hardware de inferencia**: al ser un modelo ligero (0,2 GB, ~52M de parámetros), es adecuado para probar el despliegue de políticas en equipos con GPU modestas o incluso CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Para políticas ACT de robótica, la métrica habitual es la tasa de éxito de la tarea en episodios de evaluación física, que depende del robot, las cámaras y las condiciones del entorno, y no es transferible entre configuraciones. El repositorio no incluye tasas de éxito ni métricas de evaluación.

## Requisitos de hardware

- **VRAM para inferencia**: el modelo pesa aproximadamente 0,2 GB en safetensors, por lo que cualquier GPU moderna con 2-4 GB de VRAM es suficiente para inferencia. No hay datos oficiales de consumo exacto.
- **VRAM para entrenamiento**: no disponible; el entrenamiento de ACT en LeRobot suele realizarse en GPUs de gama media-alta (por ejemplo, RTX 3090/4090 o superiores), pero no hay cifras publicadas para este modelo.
- **GPU recomendadas**: cualquier GPU CUDA compatible (NVIDIA con soporte PyTorch). No se requieren A100/H100 para inferencia dada la reducida huella del modelo.
- **Consumer GPUs**: sí, cabe holgadamente en GPUs de consumo como una RTX 3060 o superior.
- **Despliegue**: el despliegue previsto es mediante el ecosistema LeRobot (`lerobot-record` con `--policy.path` apuntando al checkpoint local o del Hub). No aplica vLLM, llama.cpp, Ollama ni TGI, que son herramientas para modelos de lenguaje.
- **Hardware adicional necesario**: un brazo robótico SO101 (o SO-100/LeKiwi) y las cámaras correspondientes para capturar observaciones en tiempo real.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Característica | Yewy/mahjong_mat_pickup_jitter_v3_v3b_policy | Políticas ACT de la comunidad LeRobot (SO-100/SO-101) | Diffusion Policy (LeRobot) |
|---|---|---|---|
| Arquitectura | ACT (CVAE + Transformer) | ACT (CVAE + Transformer) | Diffusion Policy (difusión en espacio de acciones) |
| Tarea | Recogida de piezas en estera de mahjong con jitter | Variedad de tareas de manipulación específicas | Variedad de tareas de manipulación específicas |
| Tamaño aproximado | ~52M parámetros (0,2 GB) | Similar (decenas de millones) | Generalmente mayor que ACT |
| Licencia | Apache 2.0 | Apache 2.0 (ecosistema LeRobot) | Apache 2.0 (implementación LeRobot) |
| Disponibilidad | Hub de Hugging Face, safetensors | Hub de Hugging Face | Integrada en LeRobot |

Nota: no existen cifras comparativas de rendimiento publicadas para este modelo concreto, por lo que la comparativa se limita a características arquitectónicas y de ecosistema.

## Limitaciones y advertencias

- **Especialización extrema**: la política está entrenada para una única tarea (recoger piezas en una estera de mahjong con jitter) con un robot y disposición de cámaras concretos. No generalizará a otros objetos, entornos o robots sin reentrenamiento.
- **Sensibilidad a la disposición del hardware**: las políticas ACT son muy sensibles a la posición de cámaras, iluminación y calibración del robot; cualquier desviación respecto a la configuración de entrenamiento degrada el rendimiento.
- **Sin métricas publicadas**: no se han publicado tasas de éxito ni evaluaciones, por lo que el rendimiento real debe validarse por el usuario en su propio hardware.
- **Riesgo de fallo físico**: en robótica, los fallos de la política pueden provocar colisiones o daños en el hardware; se recomienda supervisión y paradas de emergencia durante la evaluación.
- **Licencia**: Apache 2.0 permite uso comercial, modificación y redistribución, sin restricciones relevantes más allá de la conservación del aviso de licencia.
- **Adopción marginal**: con 32 descargas y 1 like en el momento de la ficha, se trata de un modelo de nicho sin comunidad de soporte consolidada.
- **Sin cuantización ni variantes optimizadas**: no hay versiones cuantizadas ni formatos alternativos disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yewy/mahjong_mat_pickup_jitter_v3_v3b_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/Yewy/mahjong_mat_pickup_jitter_v3_v3b_224
- Paper original de ACT: https://huggingface.co/papers/2304.13705 (arXiv: 2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
