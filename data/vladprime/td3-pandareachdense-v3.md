# Vladprime/td3-PandaReachDense-v3

## Resumen

`td3-PandaReachDense-v3` es un agente de aprendizaje por refuerzo entrenado con el algoritmo TD3 (Twin Delayed DDPG) combinado con Hindsight Experience Replay (HER) sobre el entorno `PandaReachDense-v3` de la libreria panda-gym. Lo publica Vlad Kolomiiets (usuario `Vladprime`) como entregable del curso HF Deep RL, unidad 6, y se distribuye como un checkpoint de Stable-Baselines3 (fichero `.zip`) bajo licencia Apache 2.0.

No es un modelo de lenguaje: es una politica neuronal para control de un brazo robotico Franka Panda en una tarea de alcanzar un objetivo en el espacio 3D, con recompensa densa. El agente se entrena desde inicializacion aleatoria en 10.000 pasos de entorno con semilla 20261101, y el checkpoint se selecciona con semillas de validacion separadas.

Su relevancia es didactica y de referencia: ilustra el flujo completo de entrenamiento, evaluacion con semillas fijas y publicacion reproducible de un agente RL en HuggingFace. El rendimiento es modesto en recompensa media (-0.2152), aunque la tasa de exito en el ultimo paso es del 100 %, lo que refleja lo que mide realmente la recompensa densa frente a la consecucion del objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TD3 (Twin Delayed DDPG) con HER (Hindsight Experience Replay, relabeling de objetivos futuros); red actor-critic MLP sobre observaciones y acciones continuas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint Stable-Baselines3 (`.zip`, `td3-PandaReachDense-v3.zip`) |

## Arquitectura y entrenamiento

El agente sigue la formulacion TD3, un algoritmo actor-critic off-policy para espacios de accion continuos que emplea dos criticos Q y toma el minimo para reducir la sobreestimacion, retrasa la actualizacion del actor y aplica suavizado de ruido a la accion objetivo. Sobre esta base se anade HER con relabeling de objetivos futuros: las transiciones fallidas se reinterpretan como si el objetivo alcanzado hubiera sido el deseado, lo que acelera el aprendizaje en tareas con recompensa dispersa o densa de dificil exploracion.

El entrenamiento parte de inicializacion aleatoria, usa la recompensa densa original del entorno y los espacios de observacion y accion originales de `PandaReachDense-v3`. Se ejecutan 10.000 pasos de entorno con semilla 20261101 y el checkpoint final se selecciona mediante semillas de validacion independientes. La evaluacion se realiza con 200 semillas fijas (1000000 a 1000199) tras recargar el checkpoint. El autor documenta la reproduccion con Python 3.10 en Linux, ya que la version fijada de NumPy es anterior a Python 3.12, mediante `pip install -r requirements.txt` y `python train.py`.

## Capacidades

- Control continuo de un brazo robotico Franka Panda para alcanzar un objetivo en el espacio 3D (`PandaReachDense-v3`).
- Aprendizaje por refuerzo off-policy con TD3 y mejora de exploracion mediante HER.
- Recarga directa del checkpoint con `stable_baselines3.TD3.load` sobre un entorno `gym.make("PandaReachDense-v3")`.
- Evaluacion reproducible con semillas fijas y metricas de recompensa media, desviacion tipica y tasa de exito.
- No soporta tool calling, function calling, agentes multi-paso, generacion de texto, vision, audio ni capacidades multilingues.

## Casos de uso

- Docencia y aprendizaje de RL: sirve como ejemplo completo del ciclo entrenamiento, seleccion de checkpoint y evaluacion reproducible en la unidad 6 del curso HF Deep RL, con instrucciones de reproduccion explicitas.
- Referencia de linea base para TD3 + HER: permite comparar nuevas variantes (SAC, DDPG, PPO) sobre `PandaReachDense-v3` con las mismas 200 semillas de evaluacion y la misma metrica de recompensa media.
- Validacion de pipelines de RL: al ser un checkpoint `.zip` de Stable-Baselines3, se puede cargar en scripts de CI para comprobar que el entorno `panda-gym` y las dependencias fijadas siguen funcionando.
- Experimentos de relabeling: sirve de punto de partida para estudiar el efecto de HER con objetivos futuros frente a otras estrategias de relabeling en tareas de alcance roboticas.
- Prototipado de control robotico simulado: permite integrar una politica preentrenada en simuladores de grasping y manipulacion para pruebas de alcance antes de entrenar politicas propias.
- Reproduccion de articulos y tutoriales: el autor documenta semilla, numero de pasos y version de Python, lo que facilita replicar el resultado en entornos Linux con Python 3.10.
- Evaluacion de robustez: las 200 semillas fijas permiten medir varianza y estabilidad del agente antes de desplegarlo en escenarios simulados mas complejos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card y el model-index (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| Tarea | Reinforcement Learning |
| Entorno | PandaReachDense-v3 |
| Recompensa media (`mean_reward`) | -0.2152 |
| Desviacion tipica | 0.1161 |
| Media menos desviacion tipica | -0.3313 |
| Tasa de exito en el ultimo paso | 100,0 % |
| Semillas de evaluacion | 200 fijas (1000000–1000199) |
| Pasos de entrenamiento | 10.000 |
| Semilla de entrenamiento | 20261101 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el checkpoint es un `.zip` de tamanio reducido (repo de 0,0 GB) y la inferencia de una politica MLP sobre observaciones y acciones continuas es muy ligera.
- GPU recomendadas: no se especifican; el entrenamiento de 10.000 pasos con TD3 + HER es viable en CPU y en GPU de gama consumer.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU consumer moderna; no se detalla el modelo concreto en la informacion disponible.
- Opciones de despliegue: Stable-Baselines3 con `TD3.load` sobre `gym.make("PandaReachDense-v3")`; requiere Python 3.10 en Linux por la version fijada de NumPy.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada. Como referencia cualitativa, el propio autor cita TD3 y HER como componentes del agente, pero no se aportan resultados de alternativas como SAC o DDPG sobre `PandaReachDense-v3`.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| td3-PandaReachDense-v3 | no disponible | no aplica | mean_reward -0.2152 ± 0.1161; exito final 100 % | Apache 2.0 | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Especifico de un unico entorno (`PandaReachDense-v3`); no generaliza a otras tareas de manipulacion sin reentrenamiento.
- Entrenamiento corto (10.000 pasos) y desde inicializacion aleatoria: la recompensa media negativa indica margen de mejora pese a la tasa de exito final del 100 %.
- La metrica de exito se mide solo en el ultimo paso; no se aportan curvas de aprendizaje ni evaluacion intermedia.
- Resultados declarados por el autor y marcados como no verificados (`verified: false`); no hay validacion independiente.
- Dependencia de versiones fijadas (Python 3.10, NumPy anterior a 3.12) que puede dificultar la reproduccion en entornos mas recientes.
- No es un modelo de lenguaje: no admite prompts de texto, tool calling ni razonamiento multi-paso.
- Riesgo de sobreajuste a las semillas de validacion usadas para seleccionar el checkpoint.
- Licencia Apache 2.0 permite uso comercial, pero el agente solo es utilizable en el entorno simulado para el que fue entrenado; no se documentan sesgos ni riesgos de alucinacion por no aplicar a este tipo de modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Vladprime/td3-PandaReachDense-v3
- Curso HF Deep RL, unidad 6 (hands-on): https://huggingface.co/learn/deep-rl-course/en/unit6/hands-on
- Libreria panda-gym: no disponible en la informacion proporcionada
- Repositorio Stable-Baselines3: no disponible en la informacion proporcionada
- Paper de TD3: no disponible en la informacion proporcionada
- Paper de HER: no disponible en la informacion proporcionada
