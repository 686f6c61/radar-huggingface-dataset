# TUpreneur/connectailab-rl-tupreneur-v2-halfcheetah-ppo

## Resumen

`connectailab-rl-tupreneur-v2-halfcheetah-ppo` es un modelo de aprendizaje por refuerzo (RL) publicado por TUpreneur en Hugging Face, desarrollado en el marco de CONNECT AI LAB y del curso "AI CITY BUILDERS". No se trata de un modelo de lenguaje, sino de una política entrenada con PPO (Proximal Policy Optimization) para controlar el robot cuadrúpedo HalfCheetah del entorno `HalfCheetah-v5` de MuJoCo y Gymnasium. El objetivo es que el agente aprenda a correr a alta velocidad desde cero mediante interacción con el simulador.

El modelo recibe observaciones de 17 dimensiones y emite acciones de 6 dimensiones (pares de torsión articulares en el rango [-1, 1]). Según la model card, el entrenamiento se realizó durante 600 000 pasos con 16 entornos paralelos, `n_steps` de 256, `batch_size` de 128, 10 épocas por actualización y una tasa de aprendizaje con decaimiento lineal de 3e-4 a 1e-5, con una penalización de postura de 1,2.

Su relevancia es principalmente educativa y de referencia: documenta una receta PPO reproducible sobre un benchmark clásico de locomoción continua, con métricas declaradas de recompensa media por episodio (4676,3), velocidad media (4,97 m/s) y distancia recorrida en 50 s (248,5 m). El repositorio es de tamaño 0.0 GB y no incluye pesos en formato estándar de transformers, ya que es un checkpoint de PyTorch específico para RL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal para RL (MLP con capa oculta de 128 unidades) entrenada con PPO |
| Parametros totales | no disponible (no se especifica el recuento exacto; la capa oculta es de 128) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; observación de 17 dimensiones por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`cheetah_ppo_model.pt`, `cheetah_obs_rms.pt`) |

## Arquitectura y entrenamiento

La política es una red neuronal de tipo perceptrón multicapa (MLP) con una capa oculta de 128 unidades, que mapea observaciones de 17 dimensiones a 6 acciones continuas de torsión articular. El entrenamiento se realiza con PPO sobre `HalfCheetah-v5` de MuJoCo/Gymnasium, con 16 entornos en paralelo, 600 000 pasos totales, `n_steps` de 256, `batch_size` de 128, 10 épocas por actualización, `gamma` de 0,99, `gae_lambda` de 0,95 y `clip` de 0,2. La tasa de aprendizaje decae linealmente de 3e-4 a 1e-5.

Se incluye una penalización de postura de 1,2, lo que sugiere un ajuste de la función de recompensa para favorecer una locomoción estable además de la velocidad. El repositorio incluye también `cheetah_obs_rms.pt`, presumiblemente las estadísticas de normalización de observaciones (running mean/std), necesarias para reproducir la inferencia. No se documentan técnicas adicionales como RLHF, DPO o decodificación especulativa, ya que no aplican a este dominio.

## Capacidades

- Control de locomoción continua: genera acciones de torsión articular de 6 dimensiones para el robot HalfCheetah en MuJoCo.
- Aprendizaje de carrera de alta velocidad desde cero mediante PPO, sin demostraciones.
- Política determinista o estocástica (según configuración de PPO) para inferencia en simulación.
- Normalización de observaciones incluida en el artefacto (`cheetah_obs_rms.pt`) para estabilizar la inferencia.
- Reproducibilidad del entrenamiento documentada con hiperparámetros completos.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües, visión, audio ni modo de razonamiento, por no ser un modelo de lenguaje.

## Casos de uso

- Investigación en RL de locomoción: servir como línea base reproducible para comparar algoritmos (PPO, SAC, TD3) sobre `HalfCheetah-v5` con los mismos hiperparámetros documentados.
- Docencia y formación: el modelo acompaña al curso "AI CITY BUILDERS" y permite a estudiantes inspeccionar una política PPO entrenada y su curva de recompensa.
- Validación de entornos MuJoCo: usar la política como referencia para verificar que una instalación de Gymnasium/MuJoCo reproduce las métricas declaradas (4676,3 de recompensa, 4,97 m/s).
- Pruebas de robustez: evaluar la política bajo perturbaciones del entorno (cambios de fricción, ruido en observaciones) para estudiar generalización en locomoción.
- Benchmarking de hardware de simulación: medir throughput de pasos por segundo en CPU/GPU con una política de tamaño reducido y comparar configuraciones de vectorización.
- Base para transferencia sim-a-real: punto de partida para experimentos de dominio aleatorio y adaptación de políticas de locomoción a robots físicos, aunque el modelo no incluye tales mecanismos.
- Demostración de despliegue de políticas RL: integrar `cheetah_ppo_model.pt` en un bucle de inferencia con `cheetah_obs_rms.pt` para reproducir el vídeo `replay.mp4`.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Metrica | Valor |
|---|---|
| Recompensa media por episodio (HalfCheetah-v5) | 4676,3 |
| Velocidad media de avance | 4,97 m/s (17,9 km/h) |
| Distancia media por episodio (50 s) | 248,5 m |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: mínima; la política es una MLP con capa oculta de 128 unidades, por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requiere GPU dedicada; cualquier GPU NVIDIA (GTX 1060 o superior) acelera la simulación. Para entrenamiento paralelo con 16 entornos, se recomienda una GPU con al menos 8 GB (RTX 3060/4060 o superior).
- Cabe en GPU consumer: sí, en cualquier modelo con suficiente memoria para MuJoCo; el cuello de botella es el simulador, no la red.
- Opciones de despliegue: PyTorch nativo con Gymnasium y MuJoCo; no aplican vLLM, llama.cpp, Ollama ni TGI por no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos de RL comparables ni resultados de referencia de la literatura para `HalfCheetah-v5` con los que contrastar.

## Limitaciones y advertencias

- Licencia no especificada: no se puede asumir uso comercial sin consultar al autor.
- Métricas no verificadas (`verified: false`): los valores de recompensa, velocidad y distancia proceden únicamente de la model card.
- Ámbito restringido: la política está entrenada exclusivamente para `HalfCheetah-v5`; no generaliza a otros entornos ni a robots físicos sin adaptación.
- Sin información sobre sesgos: al ser un modelo de RL en simulación, los sesgos relevantes serían de simulación (sim-to-real gap), no documentados.
- Riesgo de sobreajuste al entorno: no se documentan evaluaciones con semillas distintas ni con dominio aleatorio.
- Repositorio de 0.0 GB: conviene verificar que los artefactos (`cheetah_ppo_model.pt`, `cheetah_obs_rms.pt`, `replay.mp4`) estén efectivamente disponibles antes de integrarlo.
- Sin soporte de lenguaje, visión ni herramientas: no debe emplearse en tareas de NLP.

## Enlaces

- Hugging Face: https://huggingface.co/TUpreneur/connectailab-rl-tupreneur-v2-halfcheetah-ppo
- Repositorio relacionado (link01): https://huggingface.co/TUpreneur/connectailab-rl-tupreneur-v2-link01
- Árbol de archivos del repositorio relacionado: https://huggingface.co/TUpreneur/connectailab-rl-tupreneur-v2-link01/tree/main
