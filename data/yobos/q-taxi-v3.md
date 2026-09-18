# Yobos/q-Taxi-v3

## Resumen

q-Taxi-v3 es un agente de aprendizaje por refuerzo publicado en Hugging Face por el usuario Yobos. Se trata de una implementación propia de Q-Learning tabular entrenada para resolver el entorno Taxi-v3 (el clásico problema de un taxi que debe recoger y dejar pasajeros en una cuadrícula de 5x5). No es un modelo de lenguaje ni una red neuronal: el "modelo" consiste en una tabla Q almacenada en un archivo pickle (`q-learning.pkl`) junto con metadatos de evaluación.

El artefacto resuelve la tarea de control discreto de Taxi-v3, en la que un agente debe aprender una política óptima de recogida y entrega minimizando pasos. Su relevancia es fundamentalmente educativa y de referencia: sirve como ejemplo canónico de un agente Q-Learning, como línea base para comparar algoritmos de RL y como banco de pruebas para pipelines de entrenamiento y evaluación.

El modelo se publica sin licencia declarada, sin idiomas asociados (no aplica) y sin descargas ni valoraciones en el momento de redactar esta ficha. El único rendimiento declarado es un `mean_reward` de 7,56 ± 2,71 sobre Taxi-v3, marcado como no verificado por el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla Q, sin red neuronal) |
| Parametros totales | no disponible (el modelo almacena una tabla Q; no se declaran dimensiones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de secuencia) |
| Tipos de cuantizacion | no disponible (no aplica; el artefacto es un archivo pickle) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | `.pkl` (pickle, archivo `q-learning.pkl`) |

## Arquitectura y entrenamiento

La arquitectura es Q-Learning tabular clásico: una tabla que asigna un valor Q a cada par estado-acción. El entorno Taxi-v3 (Farama Gymnasium) es un problema de control discreto con 500 estados posibles y 6 acciones (mover en cuatro direcciones, recoger pasajero y dejar pasajero). El agente actualiza la tabla mediante la ecuación de Bellman tras cada interacción con el entorno, sin utilizar descenso de gradiente ni redes neuronales.

El artefacto almacena, además de la tabla Q, los parámetros de evaluación `env_id`, `max_steps`, `n_eval_episodes` y `eval_seed`, y una función `evaluate_agent` que reproduce la evaluación declarada. No se documenta en la model card el número de episodios de entrenamiento, la política de exploración (por ejemplo epsilon-greedy y su decaimiento), la tasa de aprendizaje, el factor de descuento ni si hubo variaciones respecto al algoritmo estándar. Tampoco se indica si se aplicó alguna técnica de generalización, aunque por definición un enfoque tabular no generaliza fuera de los estados vistos.

## Capacidades

- Selección de acciones discretas en el entorno Taxi-v3 para completar la tarea de recogida y entrega de pasajeros.
- Aprendizaje por refuerzo tabular mediante valores Q estado-acción.
- Reproducibilidad de la evaluación a través de los parámetros `max_steps`, `n_eval_episodes` y `eval_seed` almacenados en el artefacto.
- Carga directa desde el Hub mediante `load_from_hub(repo_id="Yobos/q-Taxi-v3", filename="q-learning.pkl")`.
- No soporta generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling, function calling ni uso como agente en el sentido de los LLM.
- No tiene capacidades multilingües (no aplica).
- No dispone de modo de razonamiento (thinking mode), audio ni otras capacidades especiales.

## Casos de uso

- Material didáctico de aprendizaje por refuerzo: el agente permite ilustrar paso a paso cómo funciona Q-Learning tabular, desde la tabla Q hasta la evaluación con recompensa media.
- Línea base (baseline) en investigación: sirve como referencia de Q-Learning tabular contra la que comparar algoritmos como SARSA, Double Q-Learning o métodos con aproximación de función en el mismo entorno Taxi-v3.
- Pruebas de pipelines de RL: al ser un artefacto pequeño y sin dependencias de GPU, es útil para validar flujos de `load_from_hub`, evaluación con Gymnasium y registro en el Hub.
- Docencia en cursos de introducción a la inteligencia artificial: el entorno Taxi-v3 y este agente son un ejemplo clásico para explicar estados, acciones, recompensas y políticas.
- Verificación de entornos de evaluación: los parámetros `max_steps`, `n_eval_episodes` y `eval_seed` permiten reproducir experimentos y comprobar que un banco de pruebas de RL funciona correctamente.
- Prototipado de sistemas de decisión secuencial en dominios simplificados: sirve para experimentar con formulaciones estado-acción-recompensa antes de escalar a problemas mayores.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card (no verificados):

| Metrica | Dataset | Valor | Verificado |
|---|---|---|---|
| mean_reward | Taxi-v3 | 7,56 +/- 2,71 | No |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica. Es una tabla Q cargada en memoria; el repositorio ocupa 0,0 GB.
- GPU recomendadas: ninguna. La inferencia es una consulta a una tabla y se ejecuta en CPU.
- Cabe en cualquier GPU de consumo y tambien en equipos sin GPU (portatiles, Raspberry Pi, contenedores ligeros).
- Opciones de despliegue: Python con Gymnasium (Farama) para crear el entorno, y la utilidad `load_from_hub` del ecosistema de Hugging Face para cargar el `.pkl`. No aplican vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles; por la naturaleza tabular, la latencia por decisión es despreciable frente a cualquier modelo neuronal.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada. Como referencia cualitativa, en Hugging Face existen multiples agentes Q-Learning tabulares para Taxi-v3 generados a partir de la misma plantilla, pero no se dispone de sus valores de `mean_reward` ni de sus licencias en esta busqueda, por lo que no se incluye una tabla numerica.

| Modelo | Tipo | Entorno | mean_reward | Licencia |
|---|---|---|---|---|
| q-Taxi-v3 (Yobos) | Q-Learning tabular | Taxi-v3 | 7,56 +/- 2,71 | no disponible |
| Otros agentes Q-Learning para Taxi-v3 | Q-Learning tabular | Taxi-v3 | no disponible | no disponible |
| Alternativas con aproximacion de funcion (por ejemplo DQN) | Red neuronal | Taxi-v3 | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Al ser un agente tabular sobre un entorno sintetico, no hay sesgos de datos en el sentido de los modelos de lenguaje, pero su comportamiento esta totalmente determinado por el entorno Taxi-v3.
- Riesgo de alucinacion: no aplica (no genera texto), pero la politica aprendida puede ser suboptima en estados poco visitados durante el entrenamiento.
- La recompensa declarada (7,56 +/- 2,71) presenta una desviacion alta, lo que sugiere una politica con comportamiento variable entre episodios y posiblemente no optima.
- El resultado esta marcado como `verified: false`, es decir, no ha sido verificado de forma independiente.
- Limitaciones de contexto o idioma: no aplica; el modelo solo opera sobre el espacio de estados y acciones de Taxi-v3.
- Restricciones de licencia: la licencia no esta declarada, por lo que no se puede garantizar su uso comercial ni su redistribucion. Conviene contactar con el autor antes de cualquier uso en produccion.
- Escalabilidad: un enfoque tabular no escala a espacios de estados grandes o continuos; no es adecuado como solucion general de RL.
- Estado en el Hub: 0 descargas y 0 valoraciones, sin mantenimiento documentado. Se desconoce si habra actualizaciones.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces obtenidos eran contenido no relacionado y se han descartado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yobos/q-Taxi-v3
- Entorno Taxi-v3 (Farama Gymnasium): no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
