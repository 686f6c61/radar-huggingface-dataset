# Wizzas/dpickleball-rl-agent

## Resumen

dPickleball-rl-agent es un proyecto de aprendizaje por refuerzo profundo publicado en Hugging Face por el usuario Wizzas, que contiene el codigo fuente y los pesos de un agente entrenado para el entorno Unity dPickleBall. No se trata de un modelo de lenguaje ni de un modelo fundacional: es un agente de control entrenado con Proximal Policy Optimization (PPO) que aprende a jugar a un deporte simulado tipo pickleball mediante un espacio de acciones discreto tridimensional (movimiento vertical, movimiento horizontal y rotacion de pala). El proyecto se desarrollo para el curso AIT306 de Deep Reinforcement Learning en la Xiamen University Malaysia (Grupo 11, semestre de abril de 2026) y obtuvo el segundo puesto entre 13 equipos en una competicion interna.

La relevancia del proyecto reside en su enfoque de entrenamiento en dos etapas para resolver el problema de la senal de aprendizaje debil en self-play desde cero. En lugar de entrenar directamente en el entorno competitivo, primero se aprenden habilidades fundamentales en un entorno simplificado de pared con un curriculo de seis niveles, y despues las politicas resultantes se refinan mediante self-play de liga con una reserva dinamica de oponentes. El agente final, denominado RealFT, combina dos checkpoints distintos (uno para cada lado de la pista) seleccionados mediante partidos reales contra un oponente de referencia.

El repositorio tiene un tamano de 0.0 GB y cero descargas, lo que indica que es un artefacto de portafolio academico mas que un modelo listo para produccion. No se dispone de informacion sobre licencia, idiomas ni pipeline de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de politica y valor para PPO (arquitectura neuronal no especificada en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (agente de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | checkpoints PyTorch (`.pt`), segun los nombres `model_left.pt` y `model_right.pt` |

## Arquitectura y entrenamiento

El agente se entrena con PPO sobre el entorno Unity dPickleBall, con un espacio de acciones `MultiDiscrete([3, 3, 3])`: tres opciones para movimiento vertical (ninguno, arriba, abajo), tres para movimiento horizontal (ninguno, derecha, izquierda) y tres para rotacion de pala (ninguno, sentido antihorario, sentido horario). La arquitectura exacta de la red neuronal (numero de capas, unidades, si comparte tronco entre politica y valor) no se detalla en la informacion disponible.

El entrenamiento se estructura en dos etapas. La primera es un curriculo de seis niveles en un entorno de pared simplificado, con rangos de velocidad de bola y angulos de rebote progresivamente mas dificiles (desde 0.85–1.35 de velocidad y ±45° en el nivel 1 hasta 0.80–3.70 y ±75° en el nivel 6), combinado con reward shaping que premia movimiento efectivo, alineacion de pala, devoluciones exitosas y reposicionamiento, y penaliza la pasividad y el contacto deficiente. La segunda etapa es self-play de liga en el entorno Unity real, con una reserva de oponentes que incluye agentes entrenados independientemente, checkpoints historicos y politicas anteriores del aprendiz. La seleccion de oponentes combina muestreo inspirado en PSRO, muestreo de frontera inspirado en SFL (priorizando oponentes cercanos al nivel actual del aprendiz) y muestreo softmax para equilibrar dificultad y diversidad.

El agente final, RealFT, usa un checkpoint distinto en cada lado: `realft_01600004` (PPO afinado en el juego Unity real y despues 1.6M pasos contra una reserva de oponentes PFSP) para el lado izquierdo y otro checkpoint no completamente especificado en la informacion proporcionada para el lado derecho.

## Capacidades

- Control motor discreto en tres dimensiones: movimiento vertical, movimiento horizontal y rotacion de pala en el entorno Unity dPickleBall.
- Seguimiento de trayectorias de bola con velocidades y angulos variados, gracias al curriculo de seis niveles.
- Devolucion controlada de la bola y reposicionamiento tras el golpe.
- Adaptacion a oponentes diversos mediante self-play de liga con reserva dinamica.
- Juego competitivo autonomo en partidos uno contra uno dentro del simulador.
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas, vision, tool calling, capacidades multilingues ni modo de pensamiento. Es exclusivamente un agente de control para una tarea concreta.

## Casos de uso

- Investigacion academica en aprendizaje por refuerzo: el codigo y los checkpoints sirven como referencia reproducible para estudiar curriculos, reward shaping y self-play de liga en entornos Unity ML-Agents.
- Docencia en cursos de RL: el pipeline en dos etapas (curriculo de pared + self-play) es un ejemplo didactico de como abordar el problema de senal debil en self-play desde cero.
- Benchmark de algoritmos de seleccion de oponentes: la combinacion de PSRO, SFL y muestreo softmax puede compararse contra otras estrategias (PFSP puro, self-play uniforme) usando el mismo entorno.
- Desarrollo de agentes para deportes simulados: la estructura de acciones `MultiDiscrete([3,3,3])` y el reward shaping son reutilizables en otros entornos deportivos de Unity ML-Agents.
- Evaluacion de robustez frente a oponentes: el torneo round-robin interno y la etapa de confirmacion Top-4 ofrecen un protocolo de evaluacion replicable para comparar politicas.
- Base para experimentos de curricula automaticos: los seis niveles de dificultad documentados permiten estudiar tecnicas de generacion automatica de curriculos o de ajuste adaptativo de dificultad.

## Benchmarks y rendimiento

Los unicos resultados disponibles son los del torneo interno round-robin del proyecto, no benchmarks estandar de RL (como puntuaciones en Atari, MuJoCo o Procgen).

| Agente | Series V–D | Partidas V–D | Diferencia de puntos |
|---|---|---|---|
| RealFT | 2–1 | 5–2 | +20 |
| Haoren Original Lifted | 2–1 | 3–3 | −17 |
| Wilbert Blocker Converted | 1–2 | 4–4 | +1 |
| V67 Best 3 | 1–2 | 2–5 | −4 |

En la competicion contra otros grupos, el equipo quedo en segundo lugar entre 13 equipos. No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un agente de RL con una red de politica pequena (no se especifica el tamano), la inferencia es probablemente viable en CPU, pero no se confirma en la informacion.
- GPU recomendadas: no disponible. El entrenamiento se realizo con PyTorch y Unity ML-Agents, pero no se detallan las GPU utilizadas.
- Compatibilidad con GPU de consumo: no confirmada; por la naturaleza del proyecto (agente de control, no LLM) es probable que quepa en GPU de consumo, pero no hay dato explicito.
- Opciones de despliegue: inferencia via PyTorch cargando los checkpoints `.pt`; el entorno requiere Unity ML-Agents para la simulacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (agentes de RL para dPickleBall) mas alla de los agentes internos del propio torneo (Haoren Original Lifted, Wilbert Blocker Converted, V67 Best 3), que se listan en la seccion de benchmarks.

## Limitaciones y advertencias

- Es un agente especifico para el entorno Unity dPickleBall; no es reutilizable fuera de ese simulador sin reentrenamiento.
- No es un modelo de lenguaje: no genera texto, no razona simbolicamente ni procesa lenguaje natural.
- La licencia no esta especificada, por lo que no se puede confirmar si el uso comercial esta permitido; se debe contactar con el autor antes de cualquier uso productivo.
- El repositorio tiene 0 descargas y 0 likes, y un tamano de 0.0 GB, lo que sugiere que los pesos pueden no estar incluidos o que el artefacto es principalmente codigo fuente.
- El agente final usa dos checkpoints distintos por lado, lo que anade complejidad de despliegue y puede introducir asimetrias de comportamiento.
- Los resultados de evaluacion son internos (round-robin y Top-4) y un segundo puesto en una competicion academica de 13 equipos; no hay validacion externa ni benchmarks estandar.
- Riesgo de sobreajuste a la reserva de oponentes del entrenamiento; el propio proyecto mitiga esto con muestreo PSRO/SFL/softmax, pero no se reportan pruebas contra oponentes totalmente fuera de distribucion.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de contexto o idioma porque no aplican a un agente de control.

## Enlaces

- Hugging Face: https://huggingface.co/Wizzas/dpickleball-rl-agent
- Repositorio GitHub del proyecto: https://github.com/WAYTECHG/dpickleball-rl-agent
- Entorno original dPickleBall: https://github.com/dPickleball/dPickleBallEnv
- Grabacion de la competicion en YouTube: https://www.youtube.com/live/CitFn9FK12s
