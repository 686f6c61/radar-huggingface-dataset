# while0628/dqn-SpaceInvadersNoFrameskip-v4

## Resumen

Se trata de un agente de aprendizaje por refuerzo profundo publicado en Hugging Face por el usuario while0628. En concreto es una política DQN (Deep Q-Network) entrenada con la librería Stable Baselines 3 y el marco RL Zoo sobre el entorno `SpaceInvadersNoFrameskip-v4` de Atari. No es un modelo de lenguaje: no procesa ni genera texto, no tiene ventana de contexto en el sentido habitual y su salida es un valor Q por cada acción disponible del juego.

El problema que resuelve es control secuencial a partir de píxeles: recibe una observación de 4 fotogramas apilados de 84x84 en escala de grises y selecciona una acción (moverse a izquierda o derecha, disparar, combinar movimiento y disparo, o no hacer nada). La política es una CNN tipo Nature de aproximadamente 1,69 millones de parámetros, un tamaño que permite ejecutarla en CPU sin dificultad.

Su relevancia es fundamentalmente didáctica y de infraestructura: sirve como ejemplo reproducible de un pipeline completo de RL Zoo (entrenamiento, carga desde el hub y generación de vídeo) y como referencia de partida para experimentos con DQN en Atari. Conviene matizar su alcance: se entrenó con solo 1.000.000 de pasos, declara una recompensa media de 647,00 ± 291,71 (no verificada), no especifica licencia y no tiene descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DQN con política CNN tipo Nature: 3 capas convolucionales (32 filtros 8x8 stride 4; 64 filtros 4x4 stride 2; 64 filtros 3x3 stride 1) + capa densa de 512 unidades + cabeza lineal de 6 salidas (una por acción) |
| Parametros totales | ~1.687.000 (~1,69 M), estimados a partir de la `CnnPolicy` de Stable Baselines 3; el autor no declara la cifra |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; la entrada es una observación de 4 x 84 x 84 píxeles en escala de grises (4 fotogramas apilados) |
| Tipos de cuantizacion | no disponible; no se publican pesos cuantizados, el modelo se distribuye en precisión original (float32) |
| Idiomas soportados | no aplica (agente de control sobre píxeles; no procesa lenguaje) |
| Licencia | no disponible (no declarada en la model card) |
| Formato de pesos | archivo `.zip` de Stable Baselines 3 (política serializada con `torch.save`); no se ofrece safetensors ni GGUF |
| Algoritmo | DQN (value-based, off-policy, replay buffer uniforme, target network) |
| Entorno | `SpaceInvadersNoFrameskip-v4` (Atari, ALE) con `AtariWrapper` |
| Pasos de entrenamiento | 1.000.000 (`n_timesteps`) |
| Espacio de acciones | discreto, 6 acciones (NOOP, FIRE, RIGHT, LEFT, RIGHTFIRE, LEFTFIRE) |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El agente emplea el algoritmo DQN canónico con una red neuronal convolucional que aproxima la función de valor acción-estado. La entrada son 4 fotogramas consecutivos de 84x84 en escala de grises, apilados en el canal (`frame_stack = 4`), preprocesados por `AtariWrapper` (recorte de la región de juego, conversión a escala de grises, redimensionado a 84x84, repetición de acción con salto de 4 fotogramas, recorte de recompensa a {-1, 0, +1} y `FireReset`). La red proyecta esa entrada a 3.136 características tras las convoluciones y las combina en una capa densa de 512 unidades antes de emitir los 6 valores Q. El entrenamiento usa un replay buffer de 100.000 transiciones, tamaño de lote 32, tasa de aprendizaje 1e-4 con Adam, `train_freq = 4` con 1 paso de gradiente por actualización, `learning_starts = 100.000`, actualización de la red objetivo cada 1.000 pasos y exploración epsilon-greedy decreciente desde 1,0 hasta 0,01 durante el 10 % inicial del entrenamiento.

No se documenta ninguna innovación técnica adicional: no hay *double Q-learning*, *prioritized experience replay*, *dueling architecture*, *n-step returns* ni *noisy nets*. Tampoco se especifican el número de semillas, el número de episodios de evaluación, la desviación entre ejecuciones ni la composición exacta de la evaluación que respalda la métrica declarada. El valor `optimize_memory_usage = False` implica que el buffer almacena tanto la observación como la observación siguiente, lo que duplica el consumo de RAM respecto a la variante optimizada.

## Capacidades

- Selección de acciones por valor en `SpaceInvadersNoFrameskip-v4` a partir exclusivamente de píxeles, sin estado textual ni características hechas a mano.
- Procesamiento de observaciones con historial de 4 fotogramas, lo que le permite en la práctica distinguir el movimiento de proyectiles entre fotogramas consecutivos.
- Inferencia determinista por defecto mediante `model.predict(obs, deterministic=True)` (argmax sobre los valores Q), reproducible con la misma semilla de entorno.
- Carga y ejecución mediante la API estándar de Stable Baselines 3 (`DQN.load`) y mediante `rl_zoo3.load_from_hub` / `rl_zoo3.enjoy`.
- Compatibilidad con entornos vectorizados de Gymnasium y con el resto del ecosistema SB3 (callbacks, wrappers, `Monitor`, `VecEnv`).
- Capacidad de continuar el entrenamiento (*fine-tuning*) o de reutilizar la política como inicialización en otras variantes de Atari del mismo espacio de observación.
- Renderizado de vídeo de las partidas con `render_mode = "rgb_array"`, tal como declara el autor en los argumentos del entorno.
- No soporta *tool calling*, ni razonamiento multi-paso simbólico, ni capacidades multilingües, ni visión general: la visión está limitada al preprocesado de 84x84 en grises del propio entorno.

## Casos de uso

- Docencia y cursos de aprendizaje por refuerzo: el agente ilustra el ciclo completo de DQN (replay buffer, red objetivo, epsilon-greedy) con un coste de entrenamiento de 1M de pasos, asumible en un laboratorio con una sola GPU o incluso en CPU con paciencia.
- Prueba de regresión de pipelines de RL: cargarlo con `rl_zoo3.load_from_hub --algo dqn --env SpaceInvadersNoFrameskip-v4 -orga while0628` permite verificar que una instalación de SB3, RL Zoo y Gymnasium/ALE funciona de extremo a extremo antes de lanzar experimentos costosos.
- Baseline de referencia en experimentos de eficiencia de muestras: sirve como punto de comparación para variantes (Double DQN, dueling, PER) evaluadas con el mismo presupuesto de 1M de pasos y el mismo `AtariWrapper`.
- Generación de material audiovisual para documentación o artículos: con `render_mode = "rgb_array"` y `rl_zoo3.enjoy` se graba la partida del agente y se ilustra el comportamiento aprendido sin intervención manual.
- Depuración de wrappers y preprocesado: al fijar `frame_stack = 4` y `AtariWrapper`, el modelo permite aislar errores en la cadena de preprocesado (recorte, grises, recorte de recompensa) comparando la recompensa obtenida con la declarada.
- Punto de partida para *fine-tuning* en Atari: la política convolucional puede inicializar agentes en variantes del entorno (por ejemplo, con *sticky actions*) o en juegos con entrada de 84x84x4, reduciendo el tiempo hasta la convergencia.
- Estudio metodológico de evaluación en RL: la desviación típica declarada (±291,71 sobre una media de 647,00) lo convierte en un caso práctico para calcular cuántos episodios hacen falta para obtener intervalos de confianza razonables.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card. La métrica figura como no verificada (`verified: false`).

| Metrica | Dataset / entorno | Valor | Verificado |
|---|---|---|---|
| mean_reward | SpaceInvadersNoFrameskip-v4 | 647,00 ± 291,71 | No |

No se han publicado otros resultados de benchmarks en la información disponible (no hay MMLU, HumanEval ni GSM8K, que no aplican a este tipo de modelo, ni curvas de aprendizaje, número de episodios de evaluación o comparación con baselines del RL Zoo). Tampoco se especifica si la media se calcula sobre evaluaciones periódicas durante el entrenamiento o sobre una evaluación final independiente.

## Requisitos de hardware

- VRAM para inferencia: menos de 1 GB. Con ~1,69 M de parámetros en float32, los pesos ocupan aproximadamente 6,8 MB; el grueso del consumo es el propio entorno ALE y el bucle de renderizado.
- GPU recomendadas: no se necesita GPU. Cualquier GPU con 4-8 GB (GTX 1650, RTX 3060, RTX 4090) sobra para inferencia y para reentrenar; A100/H100 solo tendrían sentido para barridos masivos de hiperparámetros en paralelo.
- Compatible con GPU de consumo: sí, en todas las gamas, e incluso en CPU. La latencia por paso en CPU es del orden de milisegundos, muy por debajo del límite de 60 Hz del emulador en la mayoría de equipos; no se han publicado medidas exactas de latencia ni de throughput.
- Memoria RAM para reentrenamiento: el replay buffer de 100.000 transiciones con observaciones uint8 de 84x84x4 ocupa unos 2,8 GB; al estar `optimize_memory_usage = False`, se almacenan también las observaciones siguientes, por lo que hay que prever aproximadamente 5,6 GB solo para el buffer.
- Opciones de despliegue: `python -m rl_zoo3.enjoy` (la vía documentada por el autor), carga directa con `stable_baselines3.DQN.load("dqn-SpaceInvadersNoFrameskip-v4.zip")` y bucle propio con `model.predict`. No se proporciona exportación a ONNX ni TorchScript.
- Herramientas no aplicables: vLLM, llama.cpp, Ollama y TGI no sirven para este modelo, ya que no es un transformer de lenguaje.

## Comparativa con modelos similares

| Modelo | Algoritmo | Parametros | Entorno | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| dqn-SpaceInvadersNoFrameskip-v4 (while0628) | DQN | ~1,69 M | SpaceInvadersNoFrameskip-v4 | 647,00 ± 291,71 (no verificado) | no disponible | Hugging Face, 0 descargas |
| Agentes preentrenados del RL Zoo (DLR-RM) | DQN y otros | ~1,69 M con la misma `CnnPolicy` | Atari, incluido SpaceInvaders | no disponible en la información proporcionada | MIT para el código; los pesos no se detallan aquí | GitHub / Hugging Face |
| Rainbow o QR-DQN con sb3-contrib | Rainbow, QR-DQN | del mismo orden con `CnnPolicy` | Atari | no disponible en la información proporcionada | MIT para el código | Repositorio de sb3-contrib |
| PPO en Atari (RL Zoo) | PPO (on-policy) | del mismo orden con `CnnPolicy` | Atari | no disponible en la información proporcionada | MIT para el código | Repositorio del RL Zoo |

No se dispone de cifras de recompensa media de las alternativas en la información proporcionada, por lo que la comparación cuantitativa de rendimiento queda como no disponible. La comparación cualitativa relevante es que este agente usa DQN "vanilla" con 1M de pasos, mientras que las variantes Rainbow o QR-DQN incorporan componentes (distribución de valores, *n-step*, *prioritized replay*, *noisy nets*) que suelen mejorar la eficiencia de muestras a igual presupuesto.

## Limitaciones y advertencias

- Licencia no declarada: no hay permiso explícito de uso comercial. En un contexto de producción esto es un bloqueo legal hasta que el autor especifique términos.
- Métrica no verificada y de varianza muy alta: 647,00 ± 291,71 implica un coeficiente de variación cercano al 45 %, de modo que el intervalo de confianza de la media es amplio y las comparaciones puntuales con otros agentes pueden no ser significativas.
- Presupuesto de entrenamiento reducido: 1M de pasos está muy por debajo de los 50M de fotogramas del DQN original de Mnih et al. (2015), por lo que es esperable un rendimiento claramente inferior a los agentes de referencia del estado del arte en Atari.
- Entrenamiento en un único entorno: no hay evidencia de generalización a otros juegos ni a variantes con `sticky actions`, ni datos sobre robustez frente a cambios de semilla del emulador.
- Recompensa recortada: `AtariWrapper` aplica `ClipRewardEnv`, así que el valor 647,00 no es comparable con la puntuación cruda del juego ni con agentes entrenados sin recorte de recompensa.
- Falta de documentación metodológica: se desconoce el número de semillas, el número de episodios de evaluación, la curva de aprendizaje y si el resultado corresponde al mejor checkpoint o al último.
- Sin validación por la comunidad: 0 descargas y 0 likes en el momento de redactar la ficha; no hay informes independientes de reproducibilidad.
- Sesgos: no aplican sesgos lingüísticos ni demográficos en el sentido de los modelos de lenguaje, pero sí un sesgo de sobreajuste a la dinámica concreta de este ROM de Atari y a la política de exploración con la que se entrenó.
- Riesgo de alucinación: no aplica; el fallo característico es una política subóptima que pierde vidas por no esquivar proyectiles, no una salida factualmente incorrecta.
- En evaluación, `predict` devuelve la acción argmax de forma determinista por defecto; si se activa exploración en producción, el comportamiento puede degradarse de forma notable.
- Consumo de RAM en reentrenamiento: al no usar `optimize_memory_usage`, el buffer duplica el almacenamiento de observaciones (~5,6 GB en total).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/while0628/dqn-SpaceInvadersNoFrameskip-v4
- Stable Baselines 3: https://github.com/DLR-RM/stable-baselines3
- RL Zoo (marco de entrenamiento y carga del agente): https://github.com/DLR-RM/rl-baselines3-zoo
- SB3 Contrib: https://github.com/Stable-Baselines-Team/stable-baselines3-contrib
- SBX (SB3 + Jax): https://github.com/araffin/sbx
- Referencia canónica de DQN, Mnih et al. (2015), no incluida en la model card: https://arxiv.org/abs/1312.5602
- Arcade Learning Environment, motor del entorno, no incluido en la model card: https://github.com/Farama-Foundation/Arcade-Learning-Environment
