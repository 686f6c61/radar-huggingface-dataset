# ukaratep/dqn-SpaceInvadersNoFrameskip-v4

## Resumen

Este repositorio contiene un agente de aprendizaje por refuerzo profundo entrenado con el algoritmo DQN (Deep Q-Network) sobre el entorno SpaceInvadersNoFrameskip-v4 del conjunto de referencia Atari. Lo publica el usuario ukaratep en Hugging Face y se ha generado con la librería stable-baselines3 junto con el RL Zoo, el framework de entrenamiento e hiperparametrización asociado al proyecto. No es un modelo de lenguaje: es una política de control entrenada para jugar a un único videojuego a partir de píxeles.

El agente consume observaciones visuales en escala de grises (cuatro fotogramas apilados con el wrapper de Atari de SB3) y produce una de las acciones discretas del entorno. El entrenamiento declarado es de 1.000.000 de pasos de entorno con una CnnPolicy (red convolucional tipo NatureCNN), replay buffer de 100.000 transiciones y exploración epsilon-greedy decreciente hasta 0,01. El resultado publicado es una recompensa media de 739,00 ± 412,36 en el entorno, con el indicador `verified: false`.

Su relevancia es práctica y acotada: sirve como punto de partida reproducible para estudiar DQN, comparar algoritmos del RL Zoo y validar infraestructura de entrenamiento. No hay información disponible sobre licencia, idiomas ni formato de pesos más allá de la librería declarada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DQN con CnnPolicy (red convolucional tipo NatureCNN: 3 capas convolucionales y capa densa de 512 unidades) |
| Parámetros totales | no disponible en la información proporcionada; estimación aproximada de 1,7 millones de parámetros a partir de la CnnPolicy por defecto de stable-baselines3 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entrada de 4 fotogramas apilados, 84x84 píxeles, no una ventana de tokens) |
| Tipos de cuantización | no disponible (los agentes de SB3 se serializan como pesos float32; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | no disponible (la model card no declara licencia) |
| Formato de pesos | no disponible en la información; stable-baselines3 serializa habitualmente los agentes en un único archivo .zip |
| Librería | stable-baselines3 (RL Zoo 3) |
| Entorno de entrenamiento | SpaceInvadersNoFrameskip-v4 (Atari, observaciones RGB convertidas a grises por AtariWrapper) |
| Pasos de entrenamiento | 1.000.000 de timesteps |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El agente es un DQN clásico con función de valor aproximada por una red convolucional. La política toma como entrada cuatro fotogramas apilados (frame_stack = 4) procesados por el `AtariWrapper` de stable-baselines3, que aplica recorte, conversión a escala de grises y escalado a 84x84. La salida es un vector de valores Q, uno por cada acción discreta del entorno, y la acción se selecciona de forma greedy durante la evaluación. El entrenamiento es off-policy: se guardan transiciones en un replay buffer de 100.000 elementos y se muestrean minilotes de 32 para actualizar la red, con una red objetivo actualizada cada 1.000 pasos y entrenamiento cada 4 pasos de entorno (gradient_steps = 1).

Los hiperparámetros declarados son: learning rate 0,0001, exploration_fraction 0,2 con epsilon final 0,01, learning_starts 100.000 pasos, batch_size 32, buffer_size 100.000, target_update_interval 1.000, train_freq 4, optimize_memory_usage desactivado y normalize desactivado. No se documenta ningún mecanismo adicional de mejora (doble Q-learning, prioritized replay, dueling, distribución de retornos ni normalización de recompensas), ni el número de semillas, el número de episodios de evaluación o la composición exacta del protocolo de medida. Tampoco se describe ningún tipo de ajuste fino posterior con RLHF, DPO o preferencias: esa fase no existe en este tipo de modelo.

## Capacidades

- Control de política discreta en el entorno SpaceInvadersNoFrameskip-v4: selecciona una acción por paso a partir de píxeles.
- Procesamiento de observaciones visuales de baja resolución (84x84 en escala de grises, 4 fotogramas apilados) mediante una red convolucional.
- Aprendizaje por refuerzo off-policy con replay buffer, entrenado para maximizar la recompensa acumulada del entorno concreto.
- Ejecución determinista de la política entrenada mediante `rl_zoo3.enjoy`, útil para generar vídeos o trayectorias de evaluación.
- Compatibilidad con el ecosistema stable-baselines3 y RL Zoo: carga, evaluación y continuación del entrenamiento con los mismos comandos de la librería.
- No soporta tool calling, function calling ni uso como agente multi-paso en el sentido de los modelos de lenguaje.
- No tiene capacidades multilingües, de generación de texto, de código, de matemáticas ni de visión general: su única tarea es jugar a Space Invaders.

## Casos de uso

- Reproducción de un baseline de DQN en Atari: cargar el agente con `rl_zoo3.load_from_hub` y ejecutar `enjoy` para verificar la recompensa media declarada y compararla con la propia ejecución en la misma versión del entorno.
- Docencia de aprendizaje por refuerzo profundo: el modelo permite ilustrar en un aula o tutorial cómo una CnnPolicy aprende a partir de píxeles, qué papel juegan el replay buffer, la red objetivo y la exploración epsilon-greedy, y cómo se inspecciona una política entrenada.
- Validación de infraestructura de entrenamiento RL: sirve como carga de trabajo de referencia para medir velocidad de simulación, uso de CPU/GPU y consumo de memoria del bucle de entrenamiento de SB3 antes de escalar a entornos o algoritmos más costosos.
- Ablaciones de hiperparámetros: partir de esta configuración y variar learning rate, buffer_size, target_update_interval o exploration_fraction para estudiar su efecto sobre la recompensa media en un presupuesto de 1M de pasos.
- Generación de trayectorias para imitation learning o análisis: ejecutar la política para registrar pares observación-acción y usarlos como datos de partida en experimentos de aprendizaje por imitación o de análisis de comportamiento.
- Comparación entre librerías de RL: usar el mismo entorno y presupuesto de pasos para contrastar stable-baselines3 con implementaciones alternativas como SBX (SB3 sobre JAX) en términos de tiempo de entrenamiento y recompensa final.
- Pruebas de integración de pipelines MLOps: el flujo `train`, `push_to_hub` y `load_from_hub` del RL Zoo permite ensayar un ciclo completo de versionado, publicación y despliegue de artefactos de modelos no supervisados por texto.
- Demostraciones interactivas o vídeos: la opción de renderizado `rgb_array` y el modo `enjoy` permiten generar material visual de la política jugando sin necesidad de intervención manual.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (métrica no verificada):

| Modelo | Tarea | Dataset / entorno | Métrica | Valor | Verificado |
|---|---|---|---|---|---|
| DQN (ukaratep) | reinforcement-learning | SpaceInvadersNoFrameskip-v4 | mean_reward | 739,00 ± 412,36 | No (`verified: false`) |

Notas sobre el dato: se trata de una media declarada por el autor, sin información sobre el número de episodios, semillas o procedimiento de evaluación. La desviación típica (±412,36) es elevada en relación con la media, lo que indica una alta varianza entre episodios. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Espacio en disco: el repositorio completo ocupa 0,1 GB, por lo que un único checkpoint es de tamaño muy reducido (decenas de megabytes como máximo).
- VRAM estimada para inferencia: muy baja; con unos 1,7 millones de parámetros estimados, el modelo en float32 ocupa del orden de 7 MB y la inferencia puede ejecutarse enteramente en CPU. Cualquier GPU con 2 GB o más es sobradamente suficiente, y también lo es una CPU moderna.
- GPU recomendadas: no se requiere GPU para inferencia. Para reentrenar o continuar el entrenamiento, una GPU de gama media (RTX 3060, RTX 4090, T4, A100) acelera de forma notable el bucle de optimización, aunque el cuello de botella habitual en Atari es la simulación del entorno, que corre en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con al menos 2 GB de VRAM, e incluso en CPU sin aceleración.
- Opciones de despliegue: al ser un agente de stable-baselines3, el despliegue se hace con `rl_zoo3.load_from_hub` y `rl_zoo3.enjoy`, o cargando el modelo directamente con la API de SB3. No aplican los servidores de inferencia de modelos de lenguaje como vLLM, TGI, Ollama o llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada. Cualitativamente, una red de este tamaño puede producir acciones muy por encima de la frecuencia de decisión necesaria en el entorno, pero no hay medidas publicadas.
- Memoria durante el entrenamiento: el componente más exigente es el replay buffer de 100.000 transiciones con observaciones de 84x84x4 en uint8, no el modelo en sí.

## Comparativa con modelos similares

No hay datos comparativos en la información proporcionada. Como referencia de categoría se pueden citar el DQN original de Mnih et al. (2015) sobre el mismo conjunto de entornos Atari y otras políticas preentrenadas del RL Zoo (por ejemplo PPO, A2C o QR-DQN sobre SpaceInvadersNoFrameskip-v4), pero no se dispone de sus cifras de recompensa en esta información, por lo que no se incluyen valores.

| Modelo | Algoritmo | Entorno | Contexto / entrada | mean_reward | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ukaratep/dqn-SpaceInvadersNoFrameskip-v4 | DQN (SB3) | SpaceInvadersNoFrameskip-v4 | 4 fotogramas apilados, 84x84 | 739,00 ± 412,36 (no verificado) | no disponible | Hugging Face |
| DQN original (Mnih et al., 2015) | DQN | Atari (varios juegos) | 4 fotogramas apilados, 84x84 | no disponible en esta información | no disponible | publicación académica |
| Políticas preentrenadas del RL Zoo (PPO, A2C, QR-DQN) | varios | SpaceInvadersNoFrameskip-v4 | 4 fotogramas apilados, 84x84 | no disponible en esta información | no disponible | repositorio RL Zoo |

## Limitaciones y advertencias

- Especialización extrema: el agente está entrenado para un único entorno. No generaliza a otros juegos de Atari ni a otras tareas, y no puede reutilizarse como modelo de propósito general.
- Alta varianza en el rendimiento: la desviación típica declarada (±412,36 sobre una media de 739,00) implica una dispersión muy grande entre episodios, lo que dificulta usar el valor medio como garantía de comportamiento estable.
- Métrica no verificada: el resultado está marcado con `verified: false` y no se documentan número de episodios, semillas ni protocolo de evaluación; conviene reproducirlo antes de citarlo.
- Licencia no declarada: la model card no especifica licencia, por lo que no hay base explícita para un uso comercial ni para redistribuir los pesos. Es un riesgo legal que debe resolverse con el autor antes de cualquier uso en producción.
- Presupuesto de entrenamiento limitado: 1.000.000 de timesteps es un presupuesto bajo para Atari en comparación con los entrenamientos largos habituales de la literatura, lo que probablemente deja margen de mejora en la política.
- Ausencia de información sobre sesgos y composición de datos: no aplica el concepto de sesgo lingüístico, pero no hay análisis del comportamiento aprendido (por ejemplo, estrategias degeneradas o dependencia de la aleatoriedad del entorno).
- Riesgo de sobreajuste al entorno y a la versión concreta de la implementación: cambios en la versión de Gymnasium, del ALE o de los wrappers pueden alterar la recompensa observada.
- Sin soporte de texto, herramientas, agentes multi-paso ni capacidades multilingües: no debe presentarse como un modelo de lenguaje ni integrarse en flujos de ese tipo.
- La fecha de creación del repositorio indicada en el registro (2026-10-15) es futura respecto a la fecha habitual de consulta; conviene verificar la validez de los metadatos del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukaratep/dqn-SpaceInvadersNoFrameskip-v4
- Stable Baselines3: https://github.com/DLR-RM/stable-baselines3
- RL Baselines3 Zoo: https://github.com/DLR-RM/rl-baselines3-zoo
- Stable Baselines3 Contrib: https://github.com/Stable-Baselines-Team/stable-baselines3-contrib
- SBX (SB3 sobre JAX): https://github.com/araffin/sbx
- Referencia del algoritmo DQN original: https://arxiv.org/abs/1312.5602
