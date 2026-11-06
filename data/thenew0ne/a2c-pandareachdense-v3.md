# TheNew0ne/a2c-PandaReachDense-v3

## Resumen

Este repositorio contiene un agente entrenado con el algoritmo A2C (Advantage Actor-Critic) sobre el entorno PandaReachDense-v3, una tarea de control robótico de brazo manipulador incluida en la suite de Gymnasium-Robotics. El modelo lo publica el usuario TheNew0ne y se distribuye como un artefacto de Stable-Baselines3, la librería de referencia para aprendizaje por refuerzo profundo en PyTorch. No se trata de un modelo de lenguaje ni de un modelo fundacional: es una política neuronal entrenada para una tarea concreta de alcance (reach) con un brazo robótico simulado de tipo Franka Panda.

El interés del repositorio es, por tanto, limitado y muy específico: sirve como ejemplo reproducible de entrenamiento A2C en un entorno de manipulación densa, y como punto de partida para quien quiera cargar la política con `huggingface_sb3` y evaluarla o continuar el entrenamiento. El resultado declarado es modesto: una recompensa media de -0,19 con desviación de 0,13, lo que indica que la política no resuelve de forma fiable la tarea.

La información disponible es escasa: no hay licencia, no hay idiomas, no hay detalles de arquitectura de la red, ni hiperparámetros, ni número de pasos de entrenamiento. La model card es la plantilla autogenerada por Stable-Baselines3 y contiene un `TODO` en la sección de uso. Todo lo que no consta se marca explícitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal A2C (Actor-Critic) gestionada por Stable-Baselines3; capas y tamaños no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (no se documentan versiones GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | Pesos de Stable-Baselines3 (`.zip`) alojados en el repositorio de Hugging Face; tamaño del repo 0.0 GB según la ficha |

## Arquitectura y entrenamiento

El agente emplea A2C, un método de gradiente de política con función de ventaja (advantage) y estimación de valor compartida, implementado en Stable-Baselines3 sobre PyTorch. A2C es una variante síncrona de A3C que combina una política estocástica con una crítica de valor y optimiza la ventaja estimada mediante bootstrapping. La red concreta (número de capas, unidades ocultas, activaciones) no está documentada en la model card ni en los metadatos del repositorio.

El entorno PandaReachDense-v3 pertenece a Gymnasium-Robotics y consiste en controlar un brazo Franka Panda de 7 grados de libertad para llevar el efector final a una posición objetivo en el espacio, con una recompensa densa basada en la distancia al objetivo. No se especifican en la información disponible el número de pasos de entrenamiento, la composición del dataset (en RL se generan rollouts online), el uso de normalización de observaciones, ni si se aplicaron técnicas como recompensas conformadas adicionales o currículos. Tampoco consta evaluación con múltiples semillas más allá del valor declarado en el model-index.

## Capacidades

- Control de un brazo robótico simulado Franka Panda en la tarea de alcance denso (PandaReachDense-v3).
- Generación de acciones continuas de 7 dimensiones (más garra) a partir de observaciones del entorno, según la interfaz estándar del entorno.
- Carga y evaluación mediante `stable_baselines3` y `huggingface_sb3`.
- Posibilidad de reanudar el entrenamiento o hacer fine-tuning sobre la política publicada.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni procesamiento de lenguaje.
- No tiene capacidades multilingües, de visión ni de audio.
- No dispone de modo "thinking" ni de decodificación especulativa.

## Casos de uso

- Reproducción de experimentos de RL: cargar el agente con `load_from_hub` de `huggingface_sb3` y evaluarlo en PandaReachDense-v3 para comparar con otras políticas A2C o PPO publicadas en el mismo entorno.
- Línea base para comparativas de algoritmos: usar la recompensa media declarada (-0,19 ± 0,13) como referencia al entrenar PPO, SAC o TD3 en la misma tarea y comprobar si la mejora es significativa.
- Punto de partida para fine-tuning: continuar el entrenamiento con más pasos o con recompensas conformadas para intentar superar el resultado declarado, dado que la política actual no resuelve la tarea de forma fiable.
- Docencia y formación en RL: ejemplo mínimo y autocontenido de un agente A2C en un entorno de robótica de Gymnasium-Robotics, útil para ilustrar el flujo completo de entrenamiento, guardado y publicación en el Hub.
- Pruebas de infraestructura de evaluación: verificar pipelines de carga de modelos de Stable-Baselines3 desde Hugging Face en entornos de CI, incluyendo la compatibilidad de versiones de `gymnasium`, `gymnasium-robotics` y `stable-baselines3`.
- Investigación en simulación robótica: usar la política como componente inicial en estudios de transferencia sim-a-real o de robustez frente a perturbaciones, siempre asumiendo que su rendimiento base es bajo y requerirá reentrenamiento.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados):

| Algoritmo | Entorno | Métrica | Valor | Verificado |
|---|---|---|---|---|
| A2C | PandaReachDense-v3 | mean_reward | -0,19 ± 0,13 | No |

No se han publicado en la información disponible resultados comparativos con otros algoritmos ni con otras políticas en el mismo entorno. El valor negativo y la desviación de 0,13 sugieren una política con alta varianza y sin convergencia clara hacia el objetivo.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; una política A2C para un entorno de observaciones de dimensión moderada cabe holgadamente en cualquier GPU consumer con 4-8 GB, e incluso puede ejecutarse en CPU.
- GPU recomendadas: no se requiere GPU dedicada para inferencia; para reentrenamiento se recomienda al menos una RTX 3060/4070 o superior, y para entrenamientos largos una A100 o H100 si se paralelizan entornos.
- Cabe en GPU consumer: sí, con prácticamente cualquier tarjeta moderna; también en CPU para evaluación puntual.
- Opciones de despliegue: `stable-baselines3` (carga directa del `.zip`), `huggingface_sb3` para descarga desde el Hub, y `gymnasium-robotics` para el entorno. No se documentan exportaciones a ONNX, TorchScript ni TensorRT.
- Latencia y throughput estimados: no disponibles; dependen del hardware y del bucle de simulación del entorno, no del modelo en sí.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TheNew0ne/a2c-PandaReachDense-v3 | A2C | PandaReachDense-v3 | -0,19 ± 0,13 | no disponible | Hugging Face Hub |
| Políticas PPO equivalentes en PandaReachDense-v3 | PPO | PandaReachDense-v3 | no disponible en la información proporcionada | variable | Hugging Face Hub (según búsqueda) |
| Políticas SAC/TD3 en PandaReachDense-v3 | SAC/TD3 | PandaReachDense-v3 | no disponible en la información proporcionada | variable | Hugging Face Hub (según búsqueda) |

No se dispone de datos verificables de modelos comparables en la información proporcionada; la comparativa queda limitada a la referencia cualitativa de que PPO y SAC suelen superar a A2C en tareas de control continuo como PandaReach, pero no se aportan cifras concretas.

## Limitaciones y advertencias

- Rendimiento bajo y alta varianza: la recompensa media declarada (-0,19 ± 0,13) indica que la política no alcanza el objetivo de forma consistente; no es apta para uso en producción sin reentrenamiento.
- Resultados no verificados: el model-index marca `verified: false`; el valor procede del propio autor y no ha sido replicado de forma independiente.
- Licencia no especificada: no se puede determinar si el uso comercial está permitido; es imprescindible contactar con el autor antes de cualquier uso empresarial.
- Documentación incompleta: la model card contiene un `TODO` en la sección de uso y no detalla hiperparámetros, arquitectura de red, semillas ni número de pasos de entrenamiento, lo que dificulta la reproducibilidad.
- Dependencia de versiones: la carga requiere versiones compatibles de `stable-baselines3`, `gymnasium` y `gymnasium-robotics`; cambios de versión pueden romper la compatibilidad de los pesos o del entorno.
- Sin capacidades de lenguaje: no debe confundirse con un LLM; no procesa texto, no responde preguntas y no soporta tool calling.
- Sesgos y alucinación: no aplican en el sentido habitual de modelos generativos de texto, pero sí existe riesgo de sobreajuste al entorno simulado y de falta de generalización a variaciones del mismo.
- Uso en robótica real: no hay evidencia de transferencia sim-a-real; la política se entrenó en simulación y su comportamiento en hardware físico no está validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheNew0ne/a2c-PandaReachDense-v3
- Stable-Baselines3 (repositorio): https://github.com/DLR-RM/stable-baselines3
- Documentación de Stable-Baselines3: https://stable-baselines3.readthedocs.io/
- Hugging Face SB3 (utilidad de carga): https://github.com/huggingface/huggingface_sb3
- Gymnasium-Robotics (entorno PandaReachDense-v3): https://robotics.farama.org/
- Documentación del entorno PandaReach: https://robotics.farama.org/envs/franka_kitchen/ (sección de tareas Panda)
