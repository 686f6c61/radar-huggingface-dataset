# vladd3/q-Taxi

## Resumen

q-Taxi es un agente de aprendizaje por refuerzo basado en Q-Learning tabular, entrenado para resolver el entorno Taxi-v3 de Gymnasium. Lo publica el usuario vladd3 en Hugging Face como un artefacto de tipo `reinforcement-learning`, con un fichero de pesos serializado en formato pickle (`q-learning.pkl`) en lugar de pesos de red neuronal. No se trata, por tanto, de un modelo de lenguaje ni de una red neuronal profunda: es una tabla Q empaquetada junto con metadatos del entorno.

El modelo resuelve el problema clasico de Taxi-v3, un entorno discreto con 500 estados y 6 acciones en el que un taxi debe recoger y dejar pasajeros en cuatro ubicaciones de una cuadricula. Su relevancia es fundamentalmente didactica y de referencia: sirve como linea base reproducible para comparar algoritmos de RL y como ejemplo minimo de publicacion de agentes en el Hub.

La model card declara un `mean_reward` de 7.44 +/- 2.71 sobre Taxi-v3, un rendimiento modesto que sugiere un entrenamiento parcial o una politica no totalmente convergida (el optimo de Taxi-v3 ronda los 8-9 puntos de recompensa media con politicas bien entrenadas). No hay informacion sobre arquitectura neuronal, parametros, contexto ni idiomas, ya que no aplican a este tipo de artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla Q sobre estados-acciones discretos) |
| Parametros totales | no disponible (tabla Q, no red neuronal; tamano dependiente de la implementacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno Taxi-v3: 500 estados discretos) |
| Tipos de cuantizacion | no disponible (pesos en pickle, no cuantizables como red neuronal) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `q-learning.pkl` (pickle de Python) |

## Arquitectura y entrenamiento

El agente emplea Q-Learning tabular, un algoritmo de diferencias temporales off-policy que actualiza una tabla Q(s, a) mediante la regla de Bellman con una tasa de aprendizaje y un factor de descuento. El entorno es Taxi-v3 de Gymnasium, un MDP discreto con 500 estados (25 posiciones del taxi x 5 posiciones del pasajero x 4 destinos) y 6 acciones (moverse en cuatro direcciones, recoger y dejar pasajero). La model card no especifica hiperparametros (alpha, gamma, epsilon, numero de episodios) ni detalles del bucle de entrenamiento.

El fichero publicado es un pickle que, segun el ejemplo de uso de la model card, se carga con `load_from_hub(repo_id="vladd3/q-Taxi", filename="q-learning.pkl")` y expone al menos la clave `env_id` para reconstruir el entorno con `gym.make`. La model card advierte de que puede ser necesario anadir atributos adicionales al entorno (por ejemplo `is_slippery=False` en entornos resbaladizos, aunque Taxi-v3 no lo es por defecto). No se documenta ninguna innovacion tecnica: es una implementacion custom de Q-Learning sin red neuronal, sin DQN, sin replay buffer ni target network.

## Capacidades

- Resolucion del entorno Taxi-v3 mediante politica greedy derivada de la tabla Q.
- Seleccion de accion discreta entre las 6 acciones del entorno (movimiento y recogida/entrega).
- Aprendizaje off-policy tabular, reproducible a partir del pickle publicado.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes multi-step basados en texto ni razonamiento simbolico general.
- No tiene capacidades multilingues, de vision, audio ni thinking mode.
- Uso previsto: evaluacion y comparacion de algoritmos de RL en entornos discretos.

## Casos de uso

- Linea base de referencia en experimentos de RL: cargar el agente y medir su recompensa media en Taxi-v3 para comparar con DQN, PPO o SARSA en el mismo entorno.
- Docencia y tutoriales de Q-Learning: el pickle y la model card sirven como ejemplo minimo de agente tabular publicado en el Hub, util para explicar el flujo `load_from_hub` + `gym.make`.
- Validacion de pipelines de evaluacion: comprobar que un harness de RL (por ejemplo, el de Hugging Face) carga correctamente pesos en pickle y reproduce el `mean_reward` declarado.
- Reproducibilidad de experimentos: al ser un artefacto pequeno (repo de 0.0 GB), se puede versionar y distribuir junto con el codigo de entrenamiento sin coste de almacenamiento.
- Pruebas de integracion de entornos Gymnasium: verificar la compatibilidad de la version de `gym.make(model["env_id"])` con la version de Gymnasium usada en produccion.
- Estudio de convergencia: analizar por que el agente alcanza 7.44 +/- 2.71 y no el optimo, ajustando hiperparametros y reentrenando para comparar curvas de aprendizaje.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | Taxi-v3 | mean_reward | 7.44 +/- 2.71 |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: practicamente nula; la tabla Q de Taxi-v3 ocupa del orden de kilobytes y el pickle se carga en CPU.
- GPU recomendadas: no aplica; el agente es tabular y no requiere aceleracion por hardware.
- Cabe en cualquier consumer GPU y tambien en CPU sin GPU dedicada.
- Opciones de despliegue: Python con `gymnasium` y el helper `load_from_hub` de Hugging Face; no aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; dependen del bucle de simulacion del entorno, no del modelo.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Parametros | Contexto | Rendimiento declarado | Licencia |
|---|---|---|---|---|---|---|
| vladd3/q-Taxi | Q-Learning tabular | Taxi-v3 | no disponible | no aplica | mean_reward 7.44 +/- 2.71 | no disponible |
| Agentes DQN de referencia (p. ej. Stable-Baselines3) | DQN (red neuronal) | Taxi-v3 / otros | red pequena (MLP) | no aplica | no disponible en esta ficha | MIT (SB3) |
| Agentes tabulares de la comunidad en el Hub | Q-Learning / SARSA | Taxi-v3 | no disponible | no aplica | no disponible | variable |

No se dispone de datos verificados de benchmarks comparativos en la informacion proporcionada; la comparativa con DQN y otros agentes tabulares es cualitativa.

## Limitaciones y advertencias

- Rendimiento suboptimo: 7.44 +/- 2.71 esta por debajo del optimo tipico de Taxi-v3, lo que sugiere convergencia incompleta o una politica con exploracion residual.
- Metrica no verificada: el `mean_reward` declarado tiene `verified: false`; no hay garantia de reproducibilidad con la version actual de Gymnasium.
- Dependencia del entorno: el agente solo es valido para Taxi-v3; no generaliza a otros entornos ni a variantes con dinamica distinta.
- Formato pickle: cargar un `.pkl` de origen no verificado implica riesgo de ejecucion de codigo arbitrario; conviene inspeccionarlo o cargarlo en un entorno aislado.
- Licencia no disponible: no se puede asumir uso comercial sin consultar al autor.
- Sin sesgos de lenguaje ni alucinacion en el sentido de LLM, pero la politica puede ser fragil ante cambios en la dinamica del entorno (por ejemplo, modificaciones de recompensas o transiciones).
- Documentacion escasa: sin hiperparametros, sin numero de episodios y sin semilla, la reproducibilidad del entrenamiento no esta garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vladd3/q-Taxi
- Entorno Taxi-v3 (Gymnasium): https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentacion de agentes de RL en Hugging Face: https://huggingface.co/docs/hub/en/models
- Repositorio de referencia Stable-Baselines3 (comparativa DQN): https://github.com/DLR-RM/stable-baselines3
