# TUpreneur/connectailab-rl-tupreneur-v1-halfcheetah-ppo

## Resumen

`connectailab-rl-tupreneur-v1-halfcheetah-ppo` es un agente de aprendizaje por refuerzo desarrollado por TUpreneur en el marco del programa CONNECT AI LAB (curso AI CITY BUILDERS, septima sesion). No es un modelo de lenguaje: es una politica neuronal entrenada con PPO (Proximal Policy Optimization) para resolver la tarea de locomocion del entorno `HalfCheetah-v5` de MuJoCo/Gymnasium, en la que un robot cuadrupedo de dos patas (cheetah) debe aprender a correr hacia delante maximizando la recompensa.

El modelo recibe observaciones de 17 dimensiones y emite acciones continuas de 6 dimensiones (pares de par en las articulaciones, en el rango [-1, 1]). Se entreno durante 500 000 pasos con 16 entornos en paralelo, `n_steps=256`, `batch_size=64`, 10 epocas por actualizacion, tasa de aprendizaje 3e-4, `gamma=0.99`, `gae_lambda=0.95` y recorte de PPO de 0.2. El autor declara una recompensa media por episodio de 1503.1, una velocidad de avance de 1.84 m/s (6.6 km/h) y una distancia recorrida de 91.9 m en 50 segundos de simulacion.

Su relevancia es la de un artefacto educativo y reproducible de RL profundo en entornos de control continuo: sirve como referencia de implementacion de PPO sobre MuJoCo y como punto de partida para experimentos de locomocion. El repositorio es de 0.0 GB y no incluye pesos en formato estandar de transformers, sino checkpoints de PyTorch propios (`cheetah_ppo_model.pt`, `cheetah_obs_rms.pt`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica neuronal de RL (actor-critico) entrenada con PPO; arquitectura interna de capas no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; observacion de 17 dimensiones por paso |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de control, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`): `cheetah_ppo_model.pt`, `cheetah_obs_rms.pt` |
| Entorno | `HalfCheetah-v5` (MuJoCo, Gymnasium) |
| Dimension de observacion | 17 |
| Dimension de accion | 6 (pares de par articular, rango [-1, 1]) |
| Algoritmo | PPO |
| Pasos de entrenamiento | 500 000 |
| Entornos paralelos | 16 |
| Hiperparametros | `n_steps=256`, `batch_size=64`, `n_epochs=10`, `lr=0.0003`, `gamma=0.99`, `gae_lambda=0.95`, `clip=0.2` |

## Arquitectura y entrenamiento

El modelo es una politica de aprendizaje por refuerzo entrenada con PPO sobre el entorno `HalfCheetah-v5` de MuJoCo a traves de Gymnasium. PPO es un algoritmo actor-critico con recorte de la razon de probabilidad (`clip=0.2`) que estabiliza las actualizaciones de politica respecto a sus predecesores (TRPO, A2C). La model card no detalla la topologia interna de la red (numero de capas, unidades ocultas ni si actor y critico comparten tronco), por lo que ese dato queda como no disponible.

El entrenamiento se realizo desde cero (sin demostraciones ni preentrenamiento) durante 500 000 pasos con 16 entornos en paralelo, lo que da un total de 8 millones de transiciones muestreadas. Se aplicaron ventajas generalizadas (GAE) con `gae_lambda=0.95` y `gamma=0.99`, y 10 epocas de optimizacion por cada lote de 256 pasos por entorno. El autor incluye ademas un fichero de normalizacion de observaciones (`cheetah_obs_rms.pt`), lo que indica que la politica opera sobre observaciones estandarizadas con media y varianza acumuladas; sin ese fichero la politica no reproducira el rendimiento declarado. No se especifica si se uso una red separada para el critico ni si hubo ajuste fino posterior.

## Capacidades

- Control continuo de locomocion: genera acciones de par articular de 6 dimensiones a partir de observaciones de 17 dimensiones del entorno `HalfCheetah-v5`.
- Locomocion hacia delante aprendida: el autor declara 1.84 m/s de velocidad media y 91.9 m recorridos por episodio de 50 segundos.
- Politica determinista o estocastica segun el modo de muestreo del actor; el checkpoint permite inferencia paso a paso en bucle de simulacion.
- Reproduccion del entrenamiento: los hiperparametros y el algoritmo estan documentados, lo que permite reentrenar o continuar el entrenamiento.
- Normalizacion de observaciones incluida como artefacto separado, necesaria para la inferencia correcta.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbolico, vision, audio ni capacidades multilingues: es un modelo de control motor en simulacion.

## Casos de uso

- Referencia educativa de PPO: usar el checkpoint y los hiperparametros documentados para que estudiantes comparen su propia implementacion de PPO contra una politica ya entrenada y verifiquen curvas de recompensa.
- Punto de partida para ajuste fino en `HalfCheetah-v5`: continuar el entrenamiento desde `cheetah_ppo_model.pt` con recompensas modificadas (por ejemplo, penalizacion energetica) para estudiar el efecto en la velocidad y el consumo de par.
- Pruebas de robustez de politicas de locomocion: inyectar ruido en las observaciones o perturbaciones externas en MuJoCo y medir la degradacion de recompensa frente a la linea base de 1503.1.
- Generacion de datos de demostracion: ejecutar la politica en bucle para recolectar trayectorias etiquetadas que alimenten tecnicas de imitation learning o world models.
- Validacion de infraestructura de RL: usar el modelo como caso de prueba reproducible para verificar pipelines de evaluacion (Gymnasium, MuJoCo, versiones de dependencias) antes de escalar a entornos mas costosos.
- Benchmark interno de algoritmos: comparar PPO contra SAC, TD3 o Dreamer en el mismo entorno usando esta politica como referencia de rendimiento con hiperparametros publicos.
- Material de docencia en cursos de IA: el repositorio acompana a la septima sesion del curso AI CITY BUILDERS de CONNECT AI LAB, con video de replay incluido (`replay.mp4`).

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card (no verificados de forma independiente, `verified: false`):

| Metrica | Valor | Entorno |
|---|---|---|
| Recompensa media por episodio | 1503.1 | HalfCheetah-v5 |
| Velocidad media de avance | 1.84 m/s (6.6 km/h) | HalfCheetah-v5 |
| Distancia media por episodio | 91.9 m | HalfCheetah-v5 |

No se han publicado en la informacion disponible resultados comparativos con otros algoritmos (SAC, TD3, A2C) ni con otras politicas sobre `HalfCheetah-v5`.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; una politica de control de este tipo ocupa tipicamente unos pocos megabytes en memoria. El tamano exacto no esta disponible porque la model card no detalla la topologia de la red.
- GPU recomendadas: no se requiere GPU. Cualquier CPU moderna puede ejecutar la inferencia paso a paso; una GPU consumer (por ejemplo, RTX 3060 o superior) acelera el entrenamiento y la evaluacion con multiples entornos.
- Cabe en cualquier GPU consumer y en CPU; el cuello de botella es la simulacion MuJoCo, no el modelo.
- Opciones de despliegue: PyTorch nativo cargando `cheetah_ppo_model.pt` y `cheetah_obs_rms.pt`; Gymnasium con MuJoCo para el entorno `HalfCheetah-v5`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de RL.
- Latencia y throughput: no disponibles. Dependen del paso de simulacion de MuJoCo y del hardware; para referencia, MuJoCo puede simular `HalfCheetah-v5` a miles de pasos por segundo en CPU moderna, pero la cifra concreta para este checkpoint no se ha publicado.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Recompensa declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-tupreneur-v1-halfcheetah-ppo | PPO | HalfCheetah-v5 | 1503.1 | no disponible | Hugging Face (TUpreneur) |
| Politicas PPO de referencia (Stable-Baselines3) | PPO | HalfCheetah-v3 | no disponible en esta ficha | MIT (codigo) | GitHub / Zoo de SB3 |
| Politicas SAC de referencia (Stable-Baselines3) | SAC | HalfCheetah-v3 | no disponible en esta ficha | MIT (codigo) | GitHub / Zoo de SB3 |

No se dispone de datos publicados en la informacion proporcionada para comparar directamente recompensas entre este checkpoint y las implementaciones de referencia de Stable-Baselines3, entre otras cosas porque el entorno es `HalfCheetah-v5` y no `v3`. Cualquier comparacion numerica requeriria reevaluar ambos modelos en el mismo entorno y con la misma semilla.

## Limitaciones y advertencias

- Resultados no verificados: las metricas del `model-index` estan marcadas como `verified: false` y proceden unicamente del autor.
- Entorno especifico: la politica esta entrenada exclusivamente para `HalfCheetah-v5`; no generaliza a otros entornos, morfologias ni versiones anteriores del entorno.
- Dependencia del fichero de normalizacion: sin `cheetah_obs_rms.pt` la inferencia producira resultados incorrectos, ya que la politica espera observaciones estandarizadas.
- Licencia no disponible: no se puede asumir uso comercial libre; hay que contactar con el autor antes de integrarlo en productos.
- Ausencia de documentacion de arquitectura: no se especifica el numero de capas ni de parametros, lo que dificulta auditar el modelo o estimar su coste con precision.
- Riesgo de sobreajuste al entorno de entrenamiento: no hay datos publicados sobre robustez ante perturbaciones, cambios de friccion o ruido en sensores.
- Sin soporte multilingue, de vision ni de herramientas: no es un modelo de lenguaje y no debe evaluarse con benchmarks de NLP.
- Repositorio de 0.0 GB: conviene verificar que los ficheros de pesos estan realmente presentes antes de intentar descargarlos; el tamano declarado sugiere un repositorio muy pequeno o incompleto.
- Sin garantias de mantenimiento: el modelo se publico en el contexto de un curso y no hay indicios de actualizaciones posteriores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TUpreneur/connectailab-rl-tupreneur-v1-halfcheetah-ppo
- Repositorio relacionado v1-link01: https://huggingface.co/TUpreneur/connectailab-rl-tupreneur-v1-link01/tree/main
- Repositorio relacionado v2-link01: https://huggingface.co/TUpreneur/connectailab-rl-tupreneur-v2-link01
- Entorno HalfCheetah-v5 (Gymnasium): no disponible en la busqueda web proporcionada
- Paper de PPO (Schulman et al., 2017): no disponible en la busqueda web proporcionada
- Documentacion de MuJoCo: no disponible en la busqueda web proporcionada
