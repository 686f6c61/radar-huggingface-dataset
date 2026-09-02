# zagor84/q-Taxi-v3

## Resumen

q-Taxi-v3 es un agente de aprendizaje por refuerzo basado en Q-Learning, entrenado para resolver el entorno Taxi-v3 de Gymnasium. Lo desarrolla el usuario zagor84 y se distribuye exclusivamente a través de Hugging Face como un modelo de demostración para la integración con la biblioteca `rl_zoo3` o `stable-baselines3`. El problema que resuelve es el clásico de navegación y recogida de pasajeros en un tablero de 5x5, donde el agente debe aprender una política óptima mediante la actualización iterativa de una tabla Q.

El modelo está implementado como una tabla de valores Q (un diccionario o matriz de tamaño 500x6, correspondiente a los 500 estados discretos y 6 acciones posibles del entorno), no como una red neuronal. Su relevancia actual es principalmente didáctica: sirve como ejemplo de referencia para quienes estudian RL tabular, aunque su rendimiento declarado (recompensa media de 7.56 ± 2.71) está lejos del óptimo teórico del entorno (que suele superar 9.0 con entrenamiento adecuado). El repositorio no incluye pesos en formato safetensors ni GGUF, sino un único archivo `q-learning.pkl`. No se especifican licencia ni idiomas soportados, y carece de atributos adicionales como `is_slippery` o `max_steps`, lo que puede afectar a la reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla Q de 500x6) |
| Parametros totales | 3000 valores (500 estados x 6 acciones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (entorno episódico, sin contexto lingüístico) |
| Tipos de cuantizacion | No disponible (pesos en formato pickle, sin cuantización) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Pickle (`.pkl`) |

## Arquitectura y entrenamiento

El modelo es una implementación clásica de Q-Learning tabular, un método de aprendizaje por refuerzo sin red neuronal. La política se representa mediante una tabla Q donde cada estado (definido por la posición del taxi, el destino del pasajero y el estado de recogida) se asocia a un vector de valores para las 6 acciones posibles: mover hacia el sur, norte, este, oeste, recoger pasajero y dejar pasajero. El algoritmo actualiza iterativamente estos valores mediante la ecuación de Bellman con una tasa de aprendizaje y un factor de descuento, típicamente con una estrategia epsilon-greedy para exploración.

No se dispone de información sobre el número de episodios de entrenamiento, el valor de los hiperparámetros (alpha, gamma, epsilon) ni la composición del entorno (si se usó `is_slippery=True` o `False`). El repositorio solo incluye el archivo serializado `q-learning.pkl`, que contiene el diccionario con los valores Q y el identificador del entorno (`env_id`). No hay evidencia de técnicas avanzadas como Double Q-Learning, DQN o priorización de experiencias. Se trata de un agente de juguete, adecuado para fines educativos pero sin innovación técnica destacable.

## Capacidades

- Generacion de politicas optimas en el entorno Taxi-v3: el agente aprende a recoger al pasajero en una ubicacion, llevarlo a su destino y dejarlo, evitando penalizaciones por acciones ilegales.
- Inferencia determinista: una vez entrenado, la politica es greedy (selecciona la accion con mayor valor Q), lo que permite ejecutar episodios sin exploracion.
- Integracion con Gymnasium: el archivo se carga mediante `load_from_hub` y se usa directamente con `gym.make(model["env_id"])`.
- Capacidades multilingues: no aplica (entorno de simulacion, no procesamiento de lenguaje).
- Tool calling o agentes: no aplica.
- Vision o audio: no aplica.

## Casos de uso

- Educacion en aprendizaje por refuerzo: es un ejemplo practico para estudiantes que quieran entender como funciona Q-Learning tabular, ya que permite inspeccionar la tabla Q y visualizar la convergencia de la politica.
- Prueba de integracion con librerias de RL: sirve para validar el flujo de carga de modelos desde Hugging Face con `rl_zoo3` o `stable-baselines3`, sin necesidad de entrenar un agente desde cero.
- Benchmark basico de entornos de navegacion: puede usarse como linea base (baseline) para comparar con agentes mas avanzados (DQN, PPO) en Taxi-v3, aunque su rendimiento es inferior al optimo.
- Demostracion de serializacion de modelos: el archivo `.pkl` muestra como guardar y cargar una tabla Q, util para quienes desarrollan sus propios agentes tabulares.
- Analisis de hiperparametros: al ser un modelo simple, permite experimentar con diferentes valores de alpha, gamma y epsilon y observar su impacto en la recompensa media.
- Generacion de datos de entrenamiento: en un entorno de simulacion, el agente puede ejecutarse para generar trayectorias etiquetadas que sirvan para entrenar politicas basadas en redes neuronales (imitacion).

## Benchmarks y rendimiento

El autor declara un unico resultado en el model-index, sin verificacion externa:

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | Taxi-v3 | mean_reward | 7.56 +/- 2.71 |

Este valor esta por debajo del rendimiento tipico de un agente Q-Learning bien entrenado en Taxi-v3, que suele alcanzar recompensas medias superiores a 9.0. La desviacion estandar de 2.71 indica una alta variabilidad entre episodios, probablemente debida a una politica suboptima o a un entrenamiento insuficiente. No se proporcionan otros benchmarks (exito de recogida, longitud de episodio, etc.).

## Requisitos de hardware

- Inferencia: no requiere GPU. La tabla Q tiene solo 3000 valores, por lo que la seleccion de accion es una operacion O(1) en CPU.
- Memoria: menos de 1 MB de RAM para cargar el archivo pickle.
- GPU recomendada: ninguna.
- Despliegue: se puede ejecutar en cualquier maquina con Python y Gymnasium. No es compatible con vLLM, Ollama ni TGI por ser un agente de RL, no un modelo de lenguaje.
- Latencia: inferior a 1 ms por paso de entorno en cualquier CPU moderna.
- Throughput: capaz de ejecutar miles de episodios por segundo en un solo nucleo.

## Comparativa con modelos similares

Existen otros repositorios con el mismo nombre y contenido en Hugging Face, como `Varun3003/q-Taxi-v3` y `nam194/q-Taxi-v3`, ambos con la misma estructura de modelo card y probablemente el mismo archivo de pesos. No se dispone de datos de rendimiento comparativos publicados para estos. Como alternativa tecnica, el agente DQN de Stable-Baselines3 para Taxi-v3 (si existiera) ofreceria un rendimiento superior, pero no hay un modelo oficial comparable en el ecosistema. En terminos de metodologia, el Q-Learning tabular es la opcion mas simple; otros agentes como SARSA o Expected SARSA podrian lograr resultados similares o mejores, pero no se han publicado modelos de referencia.

| Modelo | Arquitectura | Rendimiento (mean_reward) | Licencia | Formato |
|---|---|---|---|---|
| zagor84/q-Taxi-v3 | Q-Learning tabular | 7.56 +/- 2.71 | No disponible | Pickle |
| Varun3003/q-Taxi-v3 | Q-Learning tabular | No disponible | No disponible | Pickle |
| nam194/q-Taxi-v3 | Q-Learning tabular | No disponible | No disponible | Pickle |

## Limitaciones y advertencias

- Rendimiento suboptimo: la recompensa media de 7.56 es inferior a la de agentes bien entrenados (por encima de 9.0), lo que sugiere un entrenamiento incompleto o hiperparametros deficientes.
- Falta de especificacion del entorno: no se indica si se uso `is_slippery` (deslizamiento estocastico) ni el numero maximo de pasos, lo que afecta a la reproducibilidad exacta.
- Sin licencia declarada: no se puede determinar si el uso comercial esta permitido; se debe contactar al autor ante cualquier duda.
- Formato propietario: el archivo `.pkl` es especifico de Python y no es interoperable con otros ecosistemas (JavaScript, Rust, etc.).
- Sin verificacion externa: el benchmark declarado no esta verificado por terceros.
- Sin soporte para variantes del entorno: el modelo esta fijado a Taxi-v3; no sirve para otros entornos de Gymnasium.
- Riesgo de sesgo: al ser un entorno sintetico, no hay sesgos sociales, pero la politica puede ser fragil ante cambios en la dinamica del entorno (por ejemplo, si se modifica el mapa).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zagor84/q-Taxi-v3
- Repositorio similar (Varun3003): https://huggingface.co/Varun3003/q-Taxi-v3
- Repositorio similar (nam194): https://huggingface.co/nam194/q-Taxi-v3
- Articulo sobre Q-Learning en Taxi-v3 (fxis.ai): https://fxis.ai/edu/mastering-q-learning-with-the-fast-taxi-v3-model/
