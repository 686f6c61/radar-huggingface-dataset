# tabitawita/taxi-v3

## Resumen

`tabitawita/taxi-v3` es un agente de aprendizaje por refuerzo entrenado mediante Q-Learning tabular para resolver el entorno `Taxi-v4` de Gymnasium (antes OpenAI Gym). No se trata de un modelo de lenguaje ni de una red neuronal profunda: es una implementacion personalizada de un agente Q-Learning que aprende una tabla de valores accion-estado para el problema clasico del taxi, en el que un vehiculo debe recoger y dejar pasajeros en una cuadricula de 5x5 con cuatro ubicaciones posibles.

El modelo lo publica el usuario `tabitawita` en Hugging Face y se distribuye como un fichero `q-learning.pkl` (serializacion Python) que se carga con el helper `load_from_hub` de la libreria de Hugging Face para entornos de RL. Su relevancia es fundamentalmente didactica o de referencia: sirve como ejemplo reproducible de un agente Q-Learning basico sobre un entorno discreto, no como componente para produccion.

La ficha resulta atipica dentro del catalogo habitual de modelos generativos, ya que no dispone de arquitectura transformer, parametros, contexto ni capacidades linguisticas. La informacion publicada por el autor es minima y se limita a la model card y a una unica metrica de recompensa media declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (implementacion personalizada) |
| Parametros totales | no disponible (tabla Q, no red neuronal) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno discreto Taxi-v4) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | no disponible |
| Formato de pesos | `q-learning.pkl` (pickle de Python) |

## Arquitectura y entrenamiento

El agente implementa Q-Learning clasico, un algoritmo de aprendizaje por refuerzo off-policy y sin modelo que actualiza una tabla Q mediante la regla de actualizacion de Bellman con una tasa de aprendizaje y un factor de descuento (los hiperparametros concretos no se detallan en la informacion disponible). El entorno `Taxi-v4` es un MDP discreto con un espacio de estados finito y seis acciones posibles (norte, sur, este, oeste, recoger pasajero, dejar pasajero), lo que hace viable el enfoque tabular sin function approximation.

No se especifican en la model card el numero de episodios de entrenamiento, la politica de exploracion (epsilon-greedy u otra), la semilla ni los hiperparametros utilizados. Tampoco se indica si el entrenamiento se realizo con la variante `is_slippery` activada o desactivada, aunque la propia model card advierte al usuario que compruebe si necesita anadir atributos como `is_slippery=False` al cargar el entorno, lo que sugiere que ese detalle puede afectar a la reproducibilidad.

## Capacidades

- Resolucion del entorno `Taxi-v4` de Gymnasium mediante politica greedy sobre la tabla Q aprendida.
- Toma de decisiones discreta en un espacio de estados finito (recogida y entrega de pasajeros en una cuadricula 5x5).
- Carga directa desde el Hub mediante `load_from_hub(repo_id="tabitawita/taxi-v3", filename="q-learning.pkl")`.
- No dispone de generacion de texto, razonamiento linguistico, codigo, matematicas ni vision.
- No soporta tool calling, function calling ni comportamiento agentico multi-paso fuera del propio entorno.
- No tiene capacidades multilingues.
- No incorpora modos especiales (thinking, audio, etc.).

## Casos de uso

- Docencia de aprendizaje por refuerzo: usar el agente como ejemplo funcional de Q-Learning tabular en un curso introductorio, cargandolo con `load_from_hub` y evaluandolo sobre `Taxi-v4` para ilustrar la convergencia de la tabla Q.
- Baseline de comparacion: servir como referencia minima frente a agentes mas sofisticados (DQN, PPO) en el mismo entorno, ya que su recompensa media declarada (7,56) permite contextualizar mejoras.
- Pruebas de infraestructura de RL: validar pipelines de evaluacion, logging y carga de artefactos desde el Hub antes de escalar a entornos mas complejos.
- Reproduccion de experimentos: punto de partida para reentrenar el agente con distintos hiperparametros y comparar la recompensa media obtenida.
- Demostraciones educativas interactivas: integrar el agente en un notebook o demo visual de la cuadricula del taxi para explicar politica optima y valores de estado.
- Verificacion de compatibilidad con Gymnasium: comprobar el comportamiento del agente con distintas configuraciones de `is_slippery` y documentar el impacto en la recompensa.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (metrica no verificada):

| Tarea | Dataset / entorno | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | Taxi-v4 | mean_reward | 7,56 +/- 2,71 |

No se han publicado otros resultados de benchmarks en la informacion disponible. La metrica figura como `verified: false` en el model-index.

## Requisitos de hardware

- VRAM: no aplica; el agente es una tabla Q serializada en pickle y se ejecuta en CPU.
- GPU recomendadas: ninguna; no requiere aceleracion por hardware.
- Cabe en cualquier equipo consumer, incluidos portatiles de gama baja y entornos sin GPU.
- Despliegue: Python con `gymnasium` y las utilidades de carga del Hub de Hugging Face; no requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; dependen del bucle de simulacion del entorno, no del modelo.

## Comparativa con modelos similares

| Modelo | Enfoque | Entorno | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tabitawita/taxi-v3 | Q-Learning tabular | Taxi-v4 | 7,56 +/- 2,71 | no disponible | Hugging Face |
| Agentes DQN sobre Taxi-v3/v4 | Deep Q-Network | Taxi-v3/v4 | no disponible | variable | Implementaciones de referencia en librerias de RL |
| Agentes PPO sobre Taxi-v3/v4 | Policy gradient | Taxi-v3/v4 | no disponible | variable | Implementaciones de referencia en librerias de RL |

No se dispone de datos comparativos publicados en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- La licencia no esta declarada, por lo que el uso comercial queda en un limbo juridico hasta que el autor la especifique.
- El agente solo es valido para `Taxi-v4`; no generaliza a otros entornos ni tareas.
- La recompensa media declarada (7,56 +/- 2,71) no esta verificada y presenta una desviacion tipica elevada, lo que indica variabilidad considerable entre episodios.
- La model card advierte de que puede ser necesario ajustar atributos del entorno (por ejemplo, `is_slippery=False`) para reproducir el comportamiento esperado; una configuracion distinta puede degradar el rendimiento.
- No se documentan hiperparametros, semilla ni numero de episodios, lo que dificulta la reproducibilidad exacta.
- El formato pickle puede plantear riesgos de seguridad al deserializar ficheros de origen no verificado; conviene auditar antes de cargar en entornos de produccion.
- No es adecuado para tareas de NLP, generacion, codigo ni ninguna aplicacion fuera del entorno Taxi.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tabitawita/taxi-v3
- Entorno Taxi-v4 en Gymnasium: https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentacion de Hugging Face para RL: https://huggingface.co/docs/hub/en/models
