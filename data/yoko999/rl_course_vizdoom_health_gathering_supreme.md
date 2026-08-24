# Yoko999/rl_course_vizdoom_health_gathering_supreme

## Resumen

El modelo `Yoko999/rl_course_vizdoom_health_gathering_supreme` es un agente de aprendizaje por refuerzo profundo entrenado con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno `doom_health_gathering_supreme` de ViZDoom. El entorno consiste en un escenario donde el agente debe recoger paquetes de salud en un mapa con obstáculos, maximizando la recompensa acumulada. Fue desarrollado como parte de un curso de RL y publicado en Hugging Face usando la librería Sample-Factory 2.0, desarrollada por Alex Petrenko.

El repositorio ocupa 0,1 GB e incluye los pesos del modelo entrenado junto con los artefactos necesarios para reanudar el entrenamiento o ejecutar la política. Es un modelo de política RL pura, no un LLM, por lo que no dispone de capacidades de generación de texto ni razonamiento lingüístico. Su relevancia radica en ser un ejemplo reproducible de entrenamiento de agentes RL en entornos de navegación con observaciones parciales, útil para cursos y experimentos de aprendizaje por refuerzo.

La licencia, los idiomas y los detalles de la arquitectura interna no se declaran en la model card, por lo que se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de política APPO (detalles internos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entorno RL con observaciones por frames) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo con artefactos de Sample-Factory) |

## Arquitectura y entrenamiento

El modelo usa el algoritmo APPO, una variante asíncrona de PPO implementada en la librería Sample-Factory 2.0. Sample-Factory emplea arquitecturas típicas de RL para entornos visuales como ViZDoom, que suelen combinar una red convolucional para procesar los frames de observación con una capa recurrente (como GRU o LSTM) para manejar la parcialidad de la observación, aunque los detalles exactos de la red no se declaran en la model card.

El entrenamiento se realizó sobre el entorno `doom_health_gathering_supreme`, un escenario de ViZDoom con un mapa más complejo que el clásico `health_gathering`. El agente debe desplazarse y recolectar paquetes de salud evitando obstáculos. No se especifica el número total de pasos de entorno utilizados ni la composición del dataset (no aplica, al ser RL), ni se menciona el uso de técnicas como RLHF o DPO, que no son aplicables a este contexto.

## Capacidades

- Navegación y recolección de objetos en entornos 3D parcialmente observables.
- Toma de decisiones secuenciales basada en observaciones visuales (frames del entorno).
- Aprendizaje por refuerzo con recompensas densas en el escenario `doom_health_gathering_supreme`.
- Capacidad de reanudar el entrenamiento desde el checkpoint guardado para continuar la exploración.
- Evaluación y disfrute del agente mediante el script `enjoy` de Sample-Factory.
- No posee capacidades de generación de texto, tool calling, visión general ni razonamiento multilingüe, al ser un modelo de política RL puro.

## Casos de uso

- Formación académica en aprendizaje por refuerzo: el modelo sirve como ejemplo práctico de entrenamiento de un agente con APPO en un entorno de referencia, permitiendo a estudiantes reproducir el pipeline completo con Sample-Factory.
- Investigación en navegación con observación parcial: el escenario `health_gathering_supreme` es un banco de pruebas para estudiar estrategias de exploración y memoria en entornos con visibilidad limitada.
- Evaluación comparativa de algoritmos RL: se puede usar como baseline para comparar el rendimiento de otros algoritmos (PPO, DQN, etc.) en el mismo entorno, midiendo la recompensa media obtenida.
- Desarrollo de agentes para videojuegos: el enfoque de entrenamiento puede extrapolarse a otros entornos de ViZDoom o a juegos similares con mecánicas de recolección de objetos.
- Transferencia de aprendizaje: los pesos pueden servir como punto de partida para fine-tuning en variantes del entorno con mayor dificultad o con recompensas modificadas.
- Demostraciones de reproducibilidad en RL: al estar publicado en Hugging Face con la infraestructura de Sample-Factory, se puede reproducir el entrenamiento y verificar los resultados declarados.

## Benchmarks y rendimiento

| Algoritmo | Entorno | Métrica | Valor |
|---|---|---|---|
| APPO | doom_health_gathering_supreme | mean_reward | 12,73 +/- 5,03 |

El resultado de recompensa media de 12,73 (con desviación estándar de 5,03) está declarado por el autor del modelo y no ha sido verificado de forma independiente. No se han publicado comparaciones con otros algoritmos en el mismo entorno dentro de la información disponible.

## Requisitos de hardware

- El tamaño del repositorio es de 0,1 GB, lo que indica un modelo de política relativamente pequeño.
- La inferencia y evaluación del agente puede ejecutarse en una CPU moderna sin necesidad de GPU, dado el bajo coste computacional de un agente RL de este tipo.
- Para reanudar el entrenamiento se recomienda al menos una GPU con 8 GB de VRAM (por ejemplo, RTX 2070 o superior) para acelerar la recolección de experiencias.
- El despliegue se realiza mediante la librería Sample-Factory, con los scripts `enjoy` y `train` documentados en la model card.
- No se ha especificado latencia ni throughput, pero al ser un entorno de juego en tiempo real, la inferencia debe ejecutarse en menos de 16 ms por paso para mantener la interacción fluida.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Recompensa media | Licencia |
|---|---|---|---|---|
| Yoko999/rl_course_vizdoom_health_gathering_supreme | APPO | doom_health_gathering_supreme | 12,73 +/- 5,03 | no disponible |
| Ryukijano/rl_course_vizdoom_health_gathering_supreme | APPO | doom_health_gathering_supreme | no disponible | no disponible |
| ranranrunforit/rl_course_vizdoom_health_gathering_supreme | APPO | doom_health_gathering_supreme | no disponible | no disponible |

Los tres modelos son el mismo entrenamiento realizado por distintos usuarios del curso de RL de Hugging Face, todos con el mismo algoritmo y entorno. No se han publicado resultados comparativos entre ellos.

## Limitaciones y advertencias

- No se ha declarado la licencia, por lo que el uso comercial queda en un limbo legal hasta que el autor la especifique.
- La recompensa media de 12,73 ± 5,03 es una métrica sin verificar de forma independiente y con una desviación alta, lo que indica alta variabilidad entre episodios.
- El modelo solo está entrenado para el entorno concreto `doom_health_gathering_supreme`; no generaliza a otros escenarios de ViZDoom ni a tareas fuera del ámbito de recolección de salud.
- Al ser un agente de RL, no tiene capacidades de lenguaje ni de razonamiento simbólico, por lo que no es adecuado para tareas de NLP o generación de código.
- No se dispone de información sobre el número de pasos de entrenamiento ni la configuración exacta de hiperparámetros, lo que dificulta la reproducibilidad completa del experimento.
- El modelo tiene cero descargas y cero likes en Hugging Face, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yoko999/rl_course_vizdoom_health_gathering_supreme
- Documentación de Sample-Factory: https://www.samplefactory.dev/
- Repositorio de Sample-Factory: https://github.com/alex-petrenko/sample-factory
- Modelo equivalente de Ryukijano: https://huggingface.co/Ryukijano/rl_course_vizdoom_health_gathering_supreme
- Modelo equivalente de ranranrunforit: https://huggingface.co/ranranrunforit/rl_course_vizdoom_health_gathering_supreme
- Repositorio de HusseinEid101: https://github.com/HusseinEid101/-rl_course_vizdoom_health_gathering_supreme-
