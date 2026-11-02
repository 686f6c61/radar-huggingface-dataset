# TheNew0ne/dqn-SpaceInvadersNoFrameskip-v4

## Resumen

El modelo `TheNew0ne/dqn-SpaceInvadersNoFrameskip-v4` es un agente de aprendizaje por refuerzo profundo (Deep Q-Network, DQN) entrenado para jugar al entorno `SpaceInvadersNoFrameskip-v4` de la suite Atari 2600, integrada en Gymnasium. Lo desarrolla el usuario de HuggingFace TheNew0ne y se ha generado con la librería Stable-Baselines3 junto con el RL Zoo, el framework de entrenamiento y optimización de hiperparámetros del ecosistema SB3. No es un modelo de lenguaje ni un transformer generativo: es una política neuronal convolucional que mapea observaciones visuales (fotogramas apilados del juego) a acciones discretas.

El problema que resuelve es acotado: demostrar y distribuir una política entrenada que alcanza una recompensa media de 384,50 +/- 132,16 en Space Invaders, un resultado modesto para los estándares de DQN en Atari (el DQN original de DeepMind reportaba puntuaciones medias notablemente superiores en este juego tras 50 millones de fotogramas). El entrenamiento declarado es de solo 200.000 pasos, lo que explica el rendimiento limitado. Su relevancia es principalmente didáctica: sirve como referencia reproducible para comparar configuraciones, validar pipelines de RL Zoo y estudiar el comportamiento de DQN con `CnnPolicy` en entornos visuales.

Arquitectura: red convolucional (CNN) como extractor de características seguida de una cabeza de valores Q, con `frame_stack` de 4 y `AtariWrapper`. El tamaño del repositorio es de 0,3 GB, coherente con un checkpoint de SB3 que incluye el buffer de repetición y los pesos de la red. No hay información sobre licencia ni idiomas, ya que no aplica al tratarse de un agente de RL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DQN (Deep Q-Network) con `CnnPolicy` sobre observaciones de imagen apiladas (frame_stack=4) |
| Parametros totales | no disponible (checkpoint SB3 de 0,3 GB; el numero exacto de parametros de la CNN no se declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; la "ventana" es el frame_stack de 4 fotogramas) |
| Tipos de cuantizacion | no disponible (no se documentan versiones cuantizadas; el checkpoint es de precision completa en PyTorch) |
| Idiomas soportados | no aplica (agente de RL sobre Atari) |
| Licencia | no disponible |
| Formato de pesos | checkpoint de Stable-Baselines3 (`.zip` con pesos PyTorch y metadatos del buffer) |

## Arquitectura y entrenamiento

El agente sigue el algoritmo DQN clásico implementado en Stable-Baselines3: una red convolucional que procesa las observaciones (fotogramas de 84x84 en escala de grises, apilados 4 veces) y produce valores Q para cada una de las acciones discretas del entorno. El entrenamiento se realizó con RL Zoo usando los siguientes hiperparámetros: `batch_size=32`, `buffer_size=100000`, `learning_rate=0.0001`, `exploration_fraction=0.1`, `exploration_final_eps=0.01`, `target_update_interval=100`, `train_freq=4`, `gradient_steps=1`, `learning_starts=10000` y `n_timesteps=200000`. Se aplica `AtariWrapper` (recorte, escalado, conversión a grises y salto de fotogramas) y `frame_stack=4`.

No se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores, algo que no aplica a este tipo de agente. Tampoco se especifica la composición del dataset (en RL no hay dataset estático; los datos provienen de la interacción con el entorno). La innovación técnica es mínima: se limita al uso de la implementación estándar de DQN de SB3 con la configuración por defecto del RL Zoo para Atari. El número de pasos de entrenamiento (200.000) es bajo en comparación con las referencias habituales de DQN en Atari (millones de pasos), lo que condiciona el rendimiento final.

## Capacidades

- Jugar a Space Invaders (Atari 2600) en el entorno `SpaceInvadersNoFrameskip-v4` con observaciones visuales.
- Selección de acciones discretas (movimiento y disparo) a partir de fotogramas apilados.
- Inferencia determinista o estocástica según la configuración de exploración en el momento de la evaluación.
- Integración con el ecosistema Stable-Baselines3 y RL Zoo para carga, evaluación y reentrenamiento.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes multi-step reasoning ni planificación simbólica más allá de la política aprendida.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo "thinking", visión general, audio ni otras capacidades multimodales fuera del procesamiento de fotogramas del juego.

## Casos de uso

- Reproducción de experimentos de RL: cargar el agente con `rl_zoo3.load_from_hub` y evaluar la recompensa media para validar pipelines de entrenamiento o comparar configuraciones de hiperparámetros.
- Docencia y formación: usar el agente como ejemplo práctico de DQN con `CnnPolicy` en un entorno visual, mostrando el flujo completo desde el entrenamiento hasta la evaluación.
- Baseline para comparación de algoritmos: servir como referencia de DQN con 200.000 pasos frente a variantes como PPO, A2C o Rainbow en Space Invaders.
- Estudio de curvas de aprendizaje: analizar el efecto de `n_timesteps=200000` frente a entrenamientos más largos y su impacto en la recompensa media (384,50 +/- 132,16).
- Generación de vídeos de demostración: usar `rl_zoo3.enjoy` con `render_mode='rgb_array'` para grabar partidas y visualizar el comportamiento de la política.
- Punto de partida para fine-tuning: reanudar el entrenamiento desde el checkpoint para explorar mejoras con más pasos, ajuste de `learning_rate` o cambios en `buffer_size`.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Algoritmo | Entorno | Metrica | Valor |
|---|---|---|---|
| DQN | SpaceInvadersNoFrameskip-v4 | mean_reward | 384,50 +/- 132,16 |

No se han publicado otros resultados de benchmarks en la información disponible. No se incluyen comparaciones con DQN de referencia, PPO, Rainbow ni otros agentes en el mismo entorno.

## Requisitos de hardware

- VRAM estimada: muy baja; el checkpoint de 0,3 GB y la CNN de tamaño moderado permiten inferencia en GPUs con 2-4 GB de VRAM, e incluso en CPU para evaluación puntual.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es más que suficiente; también funciona en CPU para inferencia.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM; también en CPU.
- Opciones de despliegue: Stable-Baselines3 (carga directa del `.zip`), RL Zoo (`rl_zoo3.load_from_hub` y `rl_zoo3.enjoy`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Al ser un agente de RL por pasos, la latencia depende del entorno y del hardware; no se publican cifras.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Mean reward | Pasos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TheNew0ne/dqn-SpaceInvadersNoFrameskip-v4 | DQN | SpaceInvadersNoFrameskip-v4 | 384,50 +/- 132,16 | 200.000 | no disponible | HuggingFace |
| DQN de referencia (DeepMind, 2015) | DQN | Space Invaders | no disponible en esta ficha (superior según literatura) | 50.000.000 | no disponible | Paper |
| Agentes RL Zoo por defecto | DQN/PPO/A2C | SpaceInvadersNoFrameskip-v4 | no disponible | variable | MIT (RL Zoo) | GitHub |

No se dispone de datos verificables de modelos comparables en la información proporcionada para establecer una comparación cuantitativa rigurosa. La comparación con el DQN original de DeepMind se basa en la literatura general y no en cifras extraídas de esta ficha.

## Limitaciones y advertencias

- Rendimiento limitado: 200.000 pasos de entrenamiento es un presupuesto bajo para DQN en Atari; la recompensa media de 384,50 es modesta y la desviación típica de 132,16 indica alta varianza entre episodios.
- Resultado no verificado: el benchmark está marcado como `verified: false` en la model card; no ha sido validado de forma independiente.
- Sesgos: al ser un agente de RL sobre un juego concreto, no aplican sesgos lingüísticos, pero la política puede sobreajustarse a las dinámicas específicas del entorno y no generaliza a otros juegos ni tareas.
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje; sin embargo, la política puede tomar acciones subóptimas o erráticas en estados poco visitados durante el entrenamiento.
- Limitaciones de contexto o idioma: no aplica; el "contexto" se limita a 4 fotogramas apilados y el agente no procesa lenguaje.
- Restricciones de licencia: la licencia no está disponible, lo que impide confirmar si el uso comercial está permitido. Se recomienda contactar con el autor antes de usarlo en producción.
- Caveat para producción: no es adecuado para despliegues comerciales sin una evaluación adicional; su uso previsto es experimental, educativo o como baseline.
- Dependencia de versiones: requiere Stable-Baselines3 y RL Zoo compatibles; cambios de versión pueden romper la carga del checkpoint.

## Enlaces

- HuggingFace: https://huggingface.co/TheNew0ne/dqn-SpaceInvadersNoFrameskip-v4
- Stable-Baselines3: https://github.com/DLR-RM/stable-baselines3
- RL Zoo: https://github.com/DLR-RM/rl-baselines3-zoo
- SB3 Contrib: https://github.com/Stable-Baselines-Team/stable-baselines3-contrib
- SBX (SB3 + Jax): https://github.com/araffin/sbx
