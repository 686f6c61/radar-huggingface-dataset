# sxlvxa/Taxi-v4

## Resumen

`sxlvxa/Taxi-v4` es un agente de aprendizaje por refuerzo entrenado con Q-Learning tabular para resolver el entorno `Taxi-v4` de Gymnasium. No se trata de un modelo de lenguaje ni de una red neuronal profunda: es una tabla Q serializada en un fichero `q-learning.pkl` que el autor ha subido al Hub de Hugging Face usando el formato estándar de la librería `stable-baselines3` para agentes de RL. El repositorio lo publica el usuario `sxlvxa` y, a fecha de la información disponible, no cuenta con descargas ni interacciones.

El entorno `Taxi-v4` es un problema clásico de RL discreto: un taxi debe recoger y dejar pasajeros en una cuadrícula de 5x5 con cuatro ubicaciones posibles, gestionando un espacio de estados de 500 y seis acciones discretas. El agente aprende una política óptima mediante iteración de valores Q sobre las recompensas del entorno, sin intervención de redes neuronales ni de grandes volúmenes de datos.

La relevancia de esta ficha es limitada en el contexto de modelos de IA generativa: se trata de un artefacto educativo o de referencia para reproducir experimentos de Q-Learning clásico. Su interés práctico reside en servir como ejemplo mínimo de integración con el Hub y como baseline de comparación para entornos tabulares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla Q, sin red neuronal) |
| Parametros totales | no disponible (tabla de 500 estados x 6 acciones, tamaño no declarado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL discreto, 500 estados) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `q-learning.pkl` (pickle de Python) |

## Arquitectura y entrenamiento

El agente implementa Q-Learning tabular, un algoritmo de diferencias temporales off-policy que actualiza una tabla de valores Q(s, a) mediante la regla de actualización de Bellman. El espacio de estados de `Taxi-v4` es discreto y finito (500 estados), y el espacio de acciones también (6 acciones: mover norte, sur, este, oeste, recoger pasajero y dejar pasajero). No hay función de aproximación, ni red neuronal, ni fases de preentrenamiento o ajuste fino supervisado.

No se dispone de información sobre hiperparámetros de entrenamiento (tasa de aprendizaje, factor de descuento, política de exploración epsilon-greedy, número de episodios), composición del dataset (en RL no aplica en el sentido habitual) ni técnicas de estabilización. La model card únicamente declara el resultado final de recompensa media y la etiqueta `custom-implementation`, lo que sugiere que el autor implementó el bucle de entrenamiento de forma manual en lugar de usar `stable-baselines3` directamente, aunque el formato de serialización (`q-learning.pkl`) es el que emplea esa librería.

## Capacidades

- Resolución del entorno `Taxi-v4` de Gymnasium mediante política Q greedy.
- Toma de decisiones discreta en un espacio de 500 estados y 6 acciones.
- Aprendizaje por refuerzo off-policy tabular (Q-Learning).
- Serialización y carga mediante `load_from_hub` con el fichero `q-learning.pkl`.
- No soporta generación de texto, código, matemáticas, visión ni audio.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües (no procesa lenguaje natural).
- No dispone de modo thinking, visión, audio ni otras capacidades especiales.

## Casos de uso

- Docencia de aprendizaje por refuerzo: el agente sirve como ejemplo mínimo y reproducible de Q-Learning tabular para explicar la actualización de Bellman y la política epsilon-greedy en un entorno con espacio de estados finito.
- Baseline de comparación: permite contrastar el rendimiento de algoritmos más complejos (DQN, PPO, A2C) sobre `Taxi-v4` frente a una solución tabular de referencia.
- Pruebas de integración con el Hub: útil para validar flujos de `load_from_hub`, versionado de artefactos y reproducción de entornos Gymnasium en pipelines de CI.
- Verificación de entornos Gymnasium: sirve para comprobar que la versión de `gym.make("Taxi-v4")` y las dependencias asociadas funcionan correctamente en un entorno de desarrollo.
- Experimentos de evaluación de agentes RL: permite medir la recompensa media y la varianza de una política entrenada sobre múltiples episodios, tal como declara el autor (7,56 ± 2,71).
- Material de apoyo en cursos de RL: al ser un artefacto pequeño y de carga rápida, se puede distribuir junto con cuadernos de Jupyter para prácticas sin requerir GPU.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | Taxi-v4 | mean_reward | 7,56 +/- 2,71 |

No se han publicado otros resultados de benchmarks en la información disponible. La recompensa media de 7,56 con desviación típica de 2,71 es coherente con una política Q-Learning parcialmente entrenada sobre `Taxi-v4`; el óptimo teórico del entorno se sitúa en torno a 8 puntos por episodio, por lo que el agente está cerca pero no alcanza la política óptima de forma estable.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (el agente es una tabla Q serializada en pickle, sin tensores ni pesos en GPU).
- GPU recomendadas: no aplica; la inferencia se ejecuta en CPU.
- Cabe en cualquier GPU consumer y en cualquier CPU moderna: el fichero `q-learning.pkl` ocupa unos pocos kilobytes.
- Opciones de despliegue: carga directa con `load_from_hub` de `stable-baselines3` y ejecución sobre `gym.make("Taxi-v4")`; no requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser una consulta a tabla, la latencia por paso es del orden de microsegundos en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| sxlvxa/Taxi-v4 | Q-Learning tabular | Taxi-v4 | no disponible (tabla 500x6) | no aplica | no disponible | Hugging Face |
| Agentes DQN sobre Taxi-v4 | Red neuronal profunda | Taxi-v4 | ~50k-200k (MLP) | no aplica | variable | Repositorios de RL |
| Agentes PPO sobre Taxi-v4 | Policy gradient | Taxi-v4 | ~50k-200k (MLP) | no aplica | variable | Repositorios de RL |
| Agentes tabulares SARSA | Q-Learning variante | Taxi-v4 | tabla 500x6 | no aplica | variable | Repositorios de RL |

No se dispone de datos de benchmarks comparativos publicados en la información proporcionada para establecer una comparación cuantitativa con estos modelos alternativos.

## Limitaciones y advertencias

- El agente está entrenado exclusivamente para `Taxi-v4`; no generaliza a otros entornos ni a variantes como `Taxi-v3` sin reentrenamiento.
- La recompensa media declarada (7,56 ± 2,71) no ha sido verificada de forma independiente (`verified: false`) y presenta una varianza alta, lo que sugiere una política no del todo estable.
- La licencia no está declarada, por lo que el uso comercial queda en un limbo legal y no se recomienda en producción sin aclaración previa del autor.
- El formato `q-learning.pkl` es un pickle de Python, lo que implica riesgos de seguridad al deserializar ficheros de origen no confiable.
- No hay información sobre sesgos, alucinaciones ni limitaciones idiomáticas porque el modelo no procesa lenguaje natural ni datos textuales.
- El repositorio tiene 0 descargas y 0 likes, sin señales de validación por parte de la comunidad.
- La model card contiene una referencia cruzada a `sxlvxa/Taxi-v3` en el ejemplo de uso, lo que puede inducir a error al cargar el artefacto correcto.
- No se documentan hiperparámetros ni semillas, lo que dificulta la reproducibilidad del entrenamiento.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/sxlvxa/Taxi-v4)
- [Entorno Taxi-v4 en Gymnasium](https://gymnasium.farama.org/environments/toy_text/taxi/)
- [Documentación de stable-baselines3](https://stable-baselines3.readthedocs.io/)
- [Repositorio de Gymnasium](https://github.com/Farama-Foundation/Gymnasium)
