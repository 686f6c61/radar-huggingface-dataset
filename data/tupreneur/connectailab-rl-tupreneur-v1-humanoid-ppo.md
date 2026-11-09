# TUpreneur/connectailab-rl-tupreneur-v1-humanoid-ppo

## Resumen

connectailab-rl-tupreneur-v1-humanoid-ppo es una política de aprendizaje por refuerzo entrenada con PPO (Proximal Policy Optimization) para el entorno `Humanoid-v5` de MuJoCo/Gymnasium. Lo desarrolla TUpreneur en el marco del programa CONNECT AI LAB (serie "AI CITY BUILDERS", séptimo módulo de RL). No es un modelo de lenguaje: es un controlador neuronal que mapea observaciones de 348 dimensiones a 17 pares de torques articulares en el rango [-0,4, 0,4], pensado para que un humanoide simulado aprenda equilibrio y marcha bípeda desde cero.

El interés práctico está en que reproduce un pipeline completo de RL clásico (vectorización de entornos, normalización de observaciones con RMS, GAE, decaimiento lineal del learning rate) sobre un entorno de referencia exigente, con artefactos listos para cargar: los pesos de la política (`humanoid_ppo_model.pt`) y las estadísticas de normalización (`humanoid_obs_rms.pt`). El autor declara una recompensa media de 4519,4 por episodio, 11,35 s de supervivencia y 0,98 m/s de velocidad de avance, con 2,5 millones de pasos de entrenamiento y 16 entornos en paralelo.

La relevancia es acotada pero clara: sirve como línea base reproducible y como material didáctico para quien quiera evaluar o extender políticas de locomoción en MuJoCo sin reentrenar desde cero. No hay información sobre licencia, idiomas ni formato distinto de PyTorch, y el repositorio ocupa 0,0 GB según los metadatos, lo que sugiere pesos de pequeño tamaño (MLP de 256 unidades ocultas).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (política PPO) con 256 unidades ocultas; observación 348 dim, acción 17 torques en [-0,4, 0,4] |
| Parametros totales | no disponible (MLP de 256 ocultas; tamaño exacto no declarado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; episodio de hasta 1000 pasos en Humanoid-v5) |
| Tipos de cuantizacion | no disponible (pesos PyTorch en coma flotante; no se declaran variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`humanoid_ppo_model.pt`, `humanoid_obs_rms.pt`) |

## Arquitectura y entrenamiento

La política es una red neuronal densa con capa oculta de 256 unidades que consume el vector de observación de 348 dimensiones del `Humanoid-v5` y emite 17 torques articulares acotados a [-0,4, 0,4]. Se entrena con PPO sobre 16 entornos vectorizados, `n_steps` de 512, `batch_size` de 128, 10 épocas por actualización, `gamma` de 0,999, `gae_lambda` de 0,95 y `clip` de 0,2. El learning rate parte de 3e-4 y decae linealmente hasta 1e-5; el total de pasos asciende a 2.500.000. Las observaciones se normalizan mediante un `RunningMeanStd` persistido en `humanoid_obs_rms.pt`, paso imprescindible para reproducir la política fuera del script de entrenamiento.

No se documenta composición de dataset (el entorno genera la experiencia en línea), ni uso de RLHF/DPO, ni innovaciones como decodificación especulativa o atención lineal, que no aplican a este tipo de modelo. Tampoco se detalla la inicialización, el número de semillas ni el criterio de parada; los resultados declarados corresponden a una media de cinco evaluaciones según la model card.

## Capacidades

- Control de locomoción bípeda en MuJoCo `Humanoid-v5`: mantiene el equilibrio y avanza en línea recta sobre terreno plano.
- Generación de acciones continuas de 17 dimensiones con saturación en [-0,4, 0,4] por articulación.
- Supervivencia prolongada: 757 pasos de media sobre un máximo de 1000 (11,35 s a la frecuencia del entorno).
- Velocidad de desplazamiento sostenida de 0,98 m/s (3,5 km/h) con 11,3 m recorridos por episodio.
- Integración con el ecosistema Gymnasium/MuJoCo: cargable en cualquier pipeline que replique la normalización de observaciones.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, visión, audio ni capacidades multilingües: es exclusivamente una política de control.

## Casos de uso

- Línea base de locomoción en investigación: cargar `humanoid_ppo_model.pt` junto con `humanoid_obs_rms.pt` para comparar nuevas variantes de PPO, SAC o TD3 contra una referencia con recompensa media declarada de 4519,4 en `Humanoid-v5`.
- Material docente de RL profundo: el par de artefactos y la configuración completa (2,5 M de pasos, 16 entornos, GAE, clip 0,2) permiten reproducir la curva de aprendizaje en un curso o taller sin diseñar el pipeline desde cero.
- Estudio de normalización de observaciones: el fichero RMS aislado sirve para analizar el impacto de las estadísticas de normalización en la estabilidad del entrenamiento y en la transferencia entre ejecuciones.
- Transferencia sim-to-sim: usar la política como inicialización en variantes del entorno (cambios de masa, fricción o frecuencia de control) para medir robustez antes de plantear sim-to-real.
- Evaluación comparativa de algoritmos: emplear las métricas declaradas (recompensa, supervivencia, velocidad, distancia) como conjunto mínimo de referencia en revisiones de métodos de RL continuo.
- Depuración de entornos Gymnasium: validar que una instalación de MuJoCo y Gymnasium reproduce las observaciones de 348 dimensiones y los límites de acción esperados antes de escalar a entrenamientos largos.
- Generación de demostraciones visuales: el `replay.mp4` incluido facilita material para presentaciones o documentación técnica del comportamiento aprendido.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre `Humanoid-v5` (no verificados, `verified: false`):

| Metrica | Valor |
|---|---|
| Recompensa media por episodio | 4519,4 |
| Tiempo medio de supervivencia | 11,35 s (757 pasos de 1000) |
| Velocidad media de avance | 0,98 m/s |
| Distancia media por episodio | 11,3 m |

No se han publicado en la información disponible resultados comparativos con otras políticas en el mismo entorno, ni curvas de aprendizaje, ni desviaciones típicas entre semillas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; la política es un MLP de 256 unidades ocultas y los pesos del repositorio ocupan 0,0 GB según metadatos.
- GPU recomendadas: cualquiera con soporte CUDA es suficiente; una RTX 3060 o superior sobra para inferencia. Para reentrenar con 16 entornos vectorizados conviene una GPU de gama media-alta (RTX 3090, RTX 4090, A100) por el coste de simulación en MuJoCo.
- Cabe en cualquier GPU de consumo e incluso en CPU para inferencia por episodio, aunque la simulación MuJoCo es el cuello de botella real, no la red.
- Opciones de despliegue: PyTorch nativo cargando los `.pt`; no se declaran integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas de RL.
- Latencia y throughput: no disponibles. El coste dominante es el paso de simulación de `Humanoid-v5`, no el forward pass de la MLP.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| connectailab-rl-tupreneur-v1-humanoid-ppo | Humanoid-v5 | PPO | MLP 256 ocultas (exacto no disponible) | episodio de 1000 pasos | no disponible | Hugging Face |
| Políticas de referencia de Stable-Baselines3 (PPO Humanoid) | Humanoid-v3/v4 | PPO | MLP de tamaño configurable | episodio de 1000 pasos | MIT (librería) | Código, no pesos publicados |
| Políticas de referencia de CleanRL (PPO continuous) | MuJoCo varios | PPO | MLP configurable | episodio del entorno | MIT (librería) | Código, no pesos publicados |
| TUpreneur/connectailab-rl-tupreneur-v1-link01 | no disponible | RL | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento de las alternativas en la información proporcionada, por lo que la comparación cuantitativa de recompensa no está disponible.

## Limitaciones y advertencias

- Resultados no verificados: las métricas de la model card están marcadas como `verified: false` y provienen de una media de cinco evaluaciones sin desviación típica publicada.
- Entorno único: la política está entrenada exclusivamente en `Humanoid-v5` sobre terreno plano; no hay evidencia de robustez ante cambios de masa, fricción, pendientes o perturbaciones externas.
- Dependencia crítica de la normalización: sin `humanoid_obs_rms.pt` la política produce acciones incorrectas; es un acoplamiento que hay que respetar en cualquier despliegue.
- Sin licencia declarada: no se especifican términos de uso comercial, redistribución ni atribución; en producción hay que tratar el modelo como no licenciado hasta aclararlo con el autor.
- Sin información sobre sesgos: al no tratar datos humanos ni lenguaje, no aplican sesgos sociales típicos, pero tampoco se documenta comportamiento en escenarios fuera de distribución.
- Sin soporte de instrucciones en lenguaje natural ni API de tool calling: no es sustituible por un LLM en pipelines conversacionales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni reportes independientes de reproducibilidad.
- El repositorio ocupa 0,0 GB según metadatos; conviene verificar la integridad de los ficheros antes de asumir que los pesos están completos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TUpreneur/connectailab-rl-tupreneur-v1-humanoid-ppo
- Modelo relacionado del mismo autor: https://huggingface.co/TUpreneur/connectailab-rl-tupreneur-v1-link01
- Ficheros del modelo relacionado: https://huggingface.co/TUpreneur/connectailab-rl-tupreneur-v1-link01/tree/main
- Repositorio de Gymnasium (entorno Humanoid-v5): https://github.com/Farama-Foundation/Gymnasium
- Documentación de MuJoCo: https://mujoco.org
- Stable-Baselines3 (referencia de implementación PPO): https://github.com/DLR-RM/stable-baselines3
- CleanRL (referencia de PPO continuo): https://github.com/vwxyzjn/cleanrl
