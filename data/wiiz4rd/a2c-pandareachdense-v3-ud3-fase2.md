# Wiiz4rd/a2c-PandaReachDense-v3-UD3-Fase2

## Resumen

A2C PandaReachDense-v3 · Fase 2 es un agente de aprendizaje por refuerzo entrenado con el algoritmo Advantage Actor-Critic (A2C) sobre el entorno PandaReachDense-v3, un escenario de manipulacion robotica del paquete panda-gym en el que un brazo robotico Franka Panda debe alcanzar una posicion objetivo en el espacio 3D. El modelo lo publica el usuario Wiiz4rd como parte del Deep Reinforcement Learning Course, concretamente en la unidad 6, y esta implementado con la libreria stable-baselines3.

Se trata de un artefacto educativo mas que de un modelo de proposito general: no es un modelo de lenguaje ni procesa texto, sino una politica neuronal que mapea observaciones del entorno (posicion del efector final y del objetivo) a acciones continuas de control del brazo. La publicacion corresponde a una segunda fase de entrenamiento ("Fase 2") realizada a partir de un modelo previo de la practica, con 0 episodios adicionales y 24000 pasos de entrenamiento.

Su relevancia es acotada: sirve como referencia reproducible para quien siga el curso de Deep RL y quiera comparar el rendimiento de un agente A2C en una tarea de alcanzar objetivos con recompensa densa. El rendimiento declarado es modesto (recompensa media negativa), lo que refleja las limitaciones del algoritmo A2C y del escaso entrenamiento adicional aplicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de politica y valor (actor-critic) entrenada con A2C mediante stable-baselines3; detalles de capas no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entorno de RL con observaciones vectoriales; dimension no disponible) |
| Tipos de cuantizacion | no disponible (pesos en formato nativo de stable-baselines3, no cuantizado) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | Archivo ZIP de stable-baselines3 (`a2c-PandaReachDense-v3.zip`) junto con estadisticas de normalizacion (`vec_normalize.pkl`) |

## Arquitectura y entrenamiento

El agente sigue el paradigma actor-critic de A2C implementado en stable-baselines3. La politica y la funcion de valor se parametrizan con redes neuronales multicapa cuyas dimensiones exactas no se detallan en la informacion disponible. El entorno PandaReachDense-v3 proporciona recompensa densa (basada en la distancia al objetivo en cada paso) y acciones continuas de control del efector final del brazo Franka Panda.

El entrenamiento de esta fase consistio en 24000 pasos adicionales partiendo del modelo de la practica previa, con 0 episodios nuevos registrados en la model card. Se emplea normalizacion de observaciones y recompensas mediante `VecNormalize`, cuyas estadisticas se guardan en `vec_normalize.pkl` y deben congelarse en evaluacion. La evaluacion se realizo sobre 60 episodios con semillas 8100 a 8159, aplicando la metrica de media menos desviacion poblacional con un umbral de -3.5. No se documenta uso de RLHF, DPO ni tecnicas de optimizacion adicionales, algo esperable en un agente de RL clasico.

## Capacidades

- Control continuo de un brazo robotico Franka Panda para alcanzar una posicion objetivo en el espacio 3D (tarea PandaReachDense-v3).
- Aprendizaje por refuerzo con recompensa densa basada en distancia al objetivo.
- Politica determinista/estocastica compatible con la API de stable-baselines3 (`A2C.load`).
- Integracion con `VecNormalize` para normalizacion de observaciones y recompensas durante la evaluacion.
- Reproducibilidad mediante semillas fijas (8100-8159) y registro de resultados en `results.json`.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingues, vision, audio ni modos de razonamiento: es exclusivamente una politica de control para un entorno concreto.

## Casos de uso

- Docencia en cursos de Deep RL: sirve como ejemplo ejecutable de la unidad 6 del Deep Reinforcement Learning Course, permitiendo al alumnado cargar el agente y reproducir la evaluacion con las semillas indicadas.
- Comparacion de algoritmos: util como linea base A2C frente a otros algoritmos (PPO, SAC, DQN) sobre el mismo entorno PandaReachDense-v3 para estudiar diferencias de convergencia y estabilidad.
- Reproduccion de experimentos: el binomio `a2c-PandaReachDense-v3.zip` + `vec_normalize.pkl` permite replicar exactamente la evaluacion descrita, congelando estadisticas y conservando la recompensa original.
- Analisis de normalizacion de recompensas: el modelo ejemplifica el uso de `VecNormalize` y los errores tipicos al evaluar si no se congelan las estadisticas, un caso practico para estudiar buenas practicas.
- Punto de partida para entrenamiento adicional: al ser una "Fase 2" construida sobre un modelo previo, sirve de ejemplo de entrenamiento incremental y de como evaluar si los pasos adicionales mejoran o degradan la politica.
- Prototipado de pipelines de evaluacion: el formato de `results.json` y el protocolo de 60 episodios con semillas fijas son reutilizables como plantilla para evaluar otros agentes de RL en entornos panda-gym.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Metrica | Entorno | Valor | Verificado |
|---|---|---|---|
| mean_reward | PandaReachDense-v3 | -0.272266 +/- 0.143470 | No |
| Media menos desviacion poblacional (60 episodios, semillas 8100-8159) | PandaReachDense-v3 | -0.416 (umbral: -3.5) | No |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, inferior a 1 GB; las redes de un agente A2C para panda-gym son pequenas y las observaciones son vectoriales, no imagenes de alta resolucion.
- GPU recomendadas: no es necesario GPU; cualquier CPU moderna es suficiente para inferencia en tiempo real del entorno.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090, etc.) e incluso en CPU sin aceleracion.
- Opciones de despliegue: stable-baselines3 (carga con `A2C.load`), Gymnasium/panda-gym para el entorno, y `VecNormalize.load` para las estadisticas. No aplica vLLM, llama.cpp, Ollama ni TGI, que son para modelos de lenguaje.
- Latencia y throughput estimados: no disponibles; dependen del paso de simulacion de MuJoCo y del hardware, pero al tratarse de una red pequena la inferencia por paso es del orden de microsegundos a milisegundos.

## Comparativa con modelos similares

No se dispone de datos de otros agentes publicados sobre PandaReachDense-v3 en la informacion proporcionada. Comparativa cualitativa con alternativas tipicas del mismo curso:

| Modelo | Algoritmo | Entorno | Contexto / observacion | Licencia | Disponibilidad |
|---|---|---|---|---|
| A2C PandaReachDense-v3 · Fase 2 (este) | A2C | PandaReachDense-v3 | Vectorial, dimension no disponible | no disponible | Hugging Face |
| Agentes PPO sobre panda-gym | PPO | PandaReachDense-v3 | Vectorial | no disponible | Habitual en el curso, no confirmado |
| Agentes SAC sobre panda-gym | SAC | PandaReachDense-v3 | Vectorial | no disponible | Habitual en el curso, no confirmado |

No disponible informacion cuantitativa de rendimiento de las alternativas para una comparacion rigurosa.

## Limitaciones y advertencias

- Rendimiento limitado: la recompensa media declarada es negativa (-0.272) y la media menos desviacion es -0.416, indicando que el agente no alcanza de forma consistente el objetivo; el umbral de -3.5 es permisivo.
- Entrenamiento escaso: solo 24000 pasos adicionales y 0 episodios nuevos en esta fase, lo que sugiere una mejora marginal respecto al modelo base.
- Especifico de un unico entorno: no generaliza a otras tareas, robots ni entornos; no es un modelo de proposito general.
- Sin licencia declarada: no se especifican condiciones de uso comercial ni de redistribucion; debe contactarse con el autor antes de cualquier uso fuera del ambito educativo.
- Dependencia de `vec_normalize.pkl`: evaluar sin congelar las estadisticas o sin conservar la recompensa original produce resultados invalidos.
- Resultados no verificados: los valores del model-index estan marcados como `verified: false` y no han sido auditados de forma independiente.
- Riesgo de sobreajuste a las semillas de evaluacion: al usar un rango fijo de semillas (8100-8159) no se documenta variabilidad fuera de ese conjunto.
- Sin informacion sobre sesgos: al no tratar datos humanos ni lenguaje, no aplican sesgos sociales tipicos, pero tampoco hay analisis de robustez ante perturbaciones del entorno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Wiiz4rd/a2c-PandaReachDense-v3-UD3-Fase2
- Deep Reinforcement Learning Course (curso de referencia): https://huggingface.co/learn/deep-rl-course
- stable-baselines3 (libreria): https://github.com/DLR-RM/stable-baselines3
- panda-gym (entorno PandaReachDense-v3): https://github.com/qgallouedec/panda-gym
- Gymnasium: https://gymnasium.farama.org
