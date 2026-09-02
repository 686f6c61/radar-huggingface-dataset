# zagor84/dqn-SpaceInvadersNoFrameskip-v4

## Resumen

Este modelo es un agente de aprendizaje por refuerzo profundo (deep reinforcement learning) entrenado para jugar al clásico juego de Atari *Space Invaders* en el entorno `SpaceInvadersNoFrameskip-v4` de Gymnasium. Fue desarrollado por el usuario `zagor84` utilizando la librería Stable-Baselines3 y el framework de entrenamiento RL Zoo, que proporciona una infraestructura estandarizada con optimización de hiperparámetros y agentes preentrenados.

El agente emplea una política basada en red neuronal convolucional (CnnPolicy) combinada con el algoritmo Deep Q-Network (DQN), uno de los métodos fundacionales del aprendizaje por refuerzo profundo. El modelo resuelve el problema de controlar una nave espacial para destruir oleadas de alienígenas, procesando únicamente la información visual del juego (píxeles) y tomando decisiones discretas de movimiento y disparo. Su relevancia radica en ser un ejemplo reproducible de entrenamiento de agentes RL en entornos Atari, útil para investigación, educación y comparación de algoritmos.

El repositorio incluye el modelo entrenado, los hiperparámetros exactos utilizados y las instrucciones para reproducir el entrenamiento o evaluar el agente. El tamaño del repositorio es de 0,1 GB y el modelo se distribuye a través de Hugging Face Hub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DQN con CnnPolicy (red convolucional) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de juego, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de 0,1 GB, probablemente archivos `.zip` de Stable-Baselines3) |

## Arquitectura y entrenamiento

El modelo utiliza el algoritmo DQN (Deep Q-Network) implementado en Stable-Baselines3, con una política basada en red neuronal convolucional (CnnPolicy) diseñada para procesar observaciones visuales de alta dimensionalidad. El entorno se envuelve con `AtariWrapper` de Stable-Baselines3, que aplica preprocesamiento estándar de Atari: conversión a escala de grises, reducción de resolución, recorte de la imagen y acumulación de 4 frames consecutivos (`frame_stack: 4`) para proporcionar información temporal al agente.

El entrenamiento se realizó durante 1.000.000 de pasos de tiempo (`n_timesteps: 1000000.0`) con una tasa de aprendizaje de 0,0001, tamaño de lote de 32 y un buffer de experiencia de 100.000 transiciones. Se aplicó una estrategia de exploración epsilon-greedy con decaimiento lineal desde 1,0 hasta 0,01 durante el 10% del entrenamiento (`exploration_fraction: 0.1`). El modelo actualiza su red objetivo cada 1000 pasos (`target_update_interval: 1000`) y realiza un paso de gradiente cada 4 interacciones con el entorno (`train_freq: 4`). No se aplicó normalización de observaciones ni recompensas.

## Capacidades

- Jugar al juego *Space Invaders* (entorno `SpaceInvadersNoFrameskip-v4`) de forma autónoma, tomando decisiones discretas de movimiento y disparo basadas únicamente en la observación visual del juego.
- Procesar entradas visuales de alta dimensionalidad mediante una red neuronal convolucional, extrayendo características espaciales relevantes de los frames del juego.
- Mantener una política de control estable gracias al uso de experiencia replay y red objetivo, características propias del algoritmo DQN.
- Evaluar el rendimiento del agente mediante la recompensa media obtenida en episodios de juego.
- Reproducir el entrenamiento completo con los hiperparámetros documentados en la model card.
- Cargar y ejecutar el modelo entrenado mediante las herramientas de RL Zoo (`rl_zoo3.load_from_hub` y `rl_zoo3.enjoy`).

## Casos de uso

- Investigación en aprendizaje por refuerzo: el modelo sirve como punto de partida para estudiar el comportamiento de DQN en entornos Atari, comparar variantes del algoritmo o analizar la influencia de los hiperparámetros en el rendimiento final.
- Benchmarking de algoritmos RL: al estar entrenado con una configuración estándar y documentada, puede utilizarse como referencia para comparar nuevos algoritmos o mejoras sobre DQN en el mismo entorno.
- Educación y formación: el repositorio incluye instrucciones claras de instalación y ejecución, lo que lo convierte en un recurso didáctico para enseñar conceptos de aprendizaje por refuerzo profundo, como Q-learning, experiencia replay o políticas convolucionales.
- Desarrollo de agentes para juegos Atari: el modelo puede servir como base para transferir el aprendizaje a otros juegos de Atari o para experimentar con fine-tuning en entornos similares.
- Evaluación de políticas entrenadas: mediante el script `rl_zoo3.enjoy`, se puede visualizar el comportamiento del agente en tiempo real, lo que permite inspeccionar cualitativamente la política aprendida y detectar posibles fallos o comportamientos subóptimos.
- Reproducibilidad de experimentos: los hiperparámetros exactos y el entorno de entrenamiento están documentados, lo que permite reproducir el experimento completo y verificar los resultados publicados.

## Benchmarks y rendimiento

El autor declara en la model card los siguientes resultados, sin verificación independiente:

| Benchmark | Entorno | Métrica | Resultado |
|---|---|---|---|
| DQN | SpaceInvadersNoFrameskip-v4 | mean_reward | 584,50 ± 185,25 |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo tiene un tamaño de repositorio de 0,1 GB, por lo que la inferencia es ligera y puede ejecutarse en CPU sin problemas de memoria.
- Para el entrenamiento desde cero, se recomienda una GPU con al menos 4 GB de VRAM, como una NVIDIA GTX 1650 o superior, aunque el entrenamiento de 1 millón de pasos puede completarse en CPU en varias horas.
- Para la evaluación y visualización del agente, no se requiere GPU; basta con una CPU moderna y una pantalla para renderizar el entorno.
- El despliegue se realiza mediante el ecosistema Stable-Baselines3 y RL Zoo, que requieren Python 3.8+ y las dependencias de PyTorch.
- No se dispone de datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

Existen otros modelos DQN entrenados en el mismo entorno `SpaceInvadersNoFrameskip-v4` publicados en Hugging Face Hub, como `jaymanvirk/dqn_space_invaders_no_frame_skip_v4` y `Bear-ai/dqn-SpaceInvadersNoFrameskip-v4`. Todos utilizan la misma arquitectura y framework, pero pueden diferir en los hiperparámetros y el número de pasos de entrenamiento. No se dispone de datos comparativos de rendimiento entre estos modelos.

| Modelo | Entorno | Algoritmo | Recompensa media declarada |
|---|---|---|---|
| zagor84/dqn-SpaceInvadersNoFrameskip-v4 | SpaceInvadersNoFrameskip-v4 | DQN | 584,50 ± 185,25 |
| jaymanvirk/dqn_space_invaders_no_frame_skip_v4 | SpaceInvadersNoFrameskip-v4 | DQN | no disponible |
| Bear-ai/dqn-SpaceInvadersNoFrameskip-v4 | SpaceInvadersNoFrameskip-v4 | DQN | no disponible |

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en el entorno `SpaceInvadersNoFrameskip-v4`; no es transferible a otros juegos o tareas sin reentrenamiento.
- La recompensa media declarada (584,50 ± 185,25) no está verificada de forma independiente y presenta una alta varianza, lo que indica una política con rendimiento inconsistente entre episodios.
- No se especifica la licencia del modelo, por lo que se recomienda contactar con el autor antes de un uso comercial o de redistribución.
- El modelo no incluye capacidades de generalización a variantes del juego (por ejemplo, con frameskip activado) ni a otros entornos Atari.
- No se proporcionan datos sobre sesgos o comportamientos no deseados más allá de los inherentes a la política aprendida.
- El entrenamiento se realizó con una configuración estándar de DQN, que puede no ser óptima en comparación con algoritmos más recientes como PPO o SAC.

## Enlaces

- Repositorio del modelo: https://huggingface.co/zagor84/dqn-SpaceInvadersNoFrameskip-v4
- Stable-Baselines3: https://github.com/DLR-RM/stable-baselines3
- RL Zoo: https://github.com/DLR-RM/rl-baselines3-zoo
- SB3 Contrib: https://github.com/Stable-Baselines-Team/stable-baselines3-contrib
- SBX (SB3 + JAX): https://github.com/araffin/sbx
