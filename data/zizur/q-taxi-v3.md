# Zizur/q-Taxi-v3

## Resumen

Zizur/q-Taxi-v3 es un agente de aprendizaje por refuerzo entrenado con Q-learning sobre el entorno Taxi-v3 de Gym. No se trata de un modelo de lenguaje ni de una red neuronal profunda: es una implementación clásica de Q-learning tabular, serializada como un diccionario de Python (presumiblemente con una tabla Q) en el archivo `q-learning.pkl`. El autor es Zizur, un usuario individual de Hugging Face, y el repositorio no contiene pesos en formatos estándar de deep learning ni documentación sobre hiperparámetros, semillas o procedimiento de entrenamiento.

El problema que resuelve es el clásico benchmark de control discreto Taxi-v3: un agente debe recoger y dejar pasajeros en una cuadrícula de 5x5 con 4 ubicaciones designadas, gestionando un espacio de estados de 500 y 6 acciones. Es relevante únicamente como ejemplo de referencia o material didáctico de Q-learning, no como componente de sistemas en producción.

El modelo declara un `mean_reward` de 7,46 ± 2,73 en Taxi-v3, un resultado modesto para este entorno (el óptimo típico ronda 8-13 según la variante), lo que sugiere un entrenamiento parcial o una política no completamente convergida. No hay información sobre arquitectura de red, número de episodios, tasa de aprendizaje ni política de exploración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-learning tabular (implementación custom, sin red neuronal) |
| Parametros totales | no disponible (tabla Q sobre 500 estados x 6 acciones como maximo teorico) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entorno con horizonte maximo de 200 pasos en Taxi-v3) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | `.pkl` (pickle de Python, probablemente diccionario con tabla Q) |

## Arquitectura y entrenamiento

La arquitectura es Q-learning tabular, un método de aprendizaje por refuerzo sin aproximación funcional. El agente mantiene una tabla Q que mapea cada estado discreto de Taxi-v3 (500 estados posibles) a valores de acción para las 6 acciones disponibles (moverse en 4 direcciones, recoger pasajero, dejar pasajero). La actualización sigue la regla clásica de Bellman: Q(s,a) ← Q(s,a) + α[r + γ max Q(s',a') − Q(s,a)].

No hay información en la model card sobre el número de episodios de entrenamiento, la tasa de aprendizaje (α), el factor de descuento (γ), la política de exploración (ε-greedy u otra), ni sobre si se aplicó decodificación especulativa, attention linear u otras innovaciones (ninguna de ellas aplica a este tipo de agente). El resultado declarado (7,46 ± 2,73) es coherente con un entrenamiento que no ha alcanzado la política óptima, ya que en Taxi-v3 una política convergida suele superar recompensas medias de 8-9.

## Capacidades

- Resolución del entorno Taxi-v3: recogida y entrega de pasajeros en una cuadrícula 5x5 con 4 paradas designadas.
- Toma de decisiones discretas en un espacio de estados finito (500 estados) y 6 acciones.
- Aprendizaje por refuerzo offline: la tabla Q puede cargarse y evaluarse sin reentrenamiento.
- No dispone de generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling, function calling ni agentes multi-step en el sentido de LLM.
- No tiene capacidades multilingües (no procesa lenguaje).
- No dispone de thinking mode, audio ni otras capacidades especiales.

## Casos de uso

- Docencia de Q-learning: servir como ejemplo funcional de agente tabular para cursos introductorios de reinforcement learning, cargando el `.pkl` y evaluando la política en Taxi-v3.
- Baseline de comparación: utilizarlo como referencia mínima frente a agentes con aproximación funcional (DQN, PPO) sobre el mismo entorno, para ilustrar la brecha de rendimiento entre métodos tabulares y deep RL.
- Reproducción de experimentos: validar pipelines de `load_from_hub` y `gym.make` en entornos de investigación que necesiten un agente preentrenado de bajo coste computacional.
- Pruebas de integración de librerías: verificar el funcionamiento de utilidades de Hugging Face para reinforcement learning (carga de pickle, model-index) sin requerir GPU.
- Demostraciones educativas en notebooks: mostrar visualmente la política aprendida sobre la cuadrícula de Taxi-v3 con matplotlib, sin dependencias pesadas.
- Prototipado de entornos Gym: usar el agente como punto de partida para modificar hiperparámetros (α, γ, ε) y observar el efecto en la recompensa media.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados):

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| reinforcement-learning | Taxi-v3 | mean_reward | 7,46 +/- 2,73 | false |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: 0 GB (agente tabular; no requiere GPU).
- GPU recomendadas: ninguna; funciona en CPU.
- Cabe en cualquier consumer GPU y en cualquier CPU, incluso en entornos con menos de 1 GB de RAM.
- Opciones de despliegue: carga directa con `pickle`/`load_from_hub` de Hugging Face y `gym.make("Taxi-v3")`; no aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser una consulta de tabla, la inferencia por paso es del orden de microsegundos, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento Taxi-v3 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Zizur/q-Taxi-v3 | Q-learning tabular | tabla Q (max. 500x6) | no aplica | 7,46 +/- 2,73 (declarado) | no disponible | Hugging Face |
| DQN sobre Taxi-v3 (implementaciones comunitarias) | Red neuronal profunda | no disponible | no aplica | no disponible | variable | múltiples repos |
| PPO sobre Taxi-v3 (implementaciones comunitarias) | Policy gradient | no disponible | no aplica | no disponible | variable | múltiples repos |

No se dispone de datos verificados de benchmarks para los comparadores; la comparativa se limita a categoría y formato.

## Limitaciones y advertencias

- Resultado modesto: el `mean_reward` de 7,46 ± 2,73 sugiere una política no óptima para Taxi-v3; no debe presentarse como agente resuelto.
- Sin licencia declarada: el uso comercial queda en un limbo legal; conviene contactar al autor antes de cualquier explotación.
- Sin documentación de entrenamiento: no se conocen hiperparámetros, semilla ni número de episodios, lo que impide reproducir el resultado.
- Formato frágil: el `.pkl` es un pickle de Python, con riesgo de incompatibilidad entre versiones de librerías y de ejecución de código no confiable al deserializar.
- Repositorio vacío en apariencia: tamaño de 0,0 GB y 0 descargas; el archivo `q-learning.pkl` podría no estar presente o ser de tamaño insignificante.
- Sin información sobre sesgos: al operar en un entorno sintético determinista, no aplican sesgos sociales, pero tampoco hay evaluación de robustez frente a variantes del entorno (por ejemplo, `is_slippery=True`).
- No apto para producción: no es un modelo de lenguaje ni un componente de sistemas de IA generativa; su uso se limita a docencia, experimentación y baselines.

## Enlaces

- Hugging Face: https://huggingface.co/Zizur/q-Taxi-v3
- Entorno Taxi-v3 (Gym): https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentación de carga de modelos RL en Hugging Face: https://huggingface.co/docs/hub/models
- No se han encontrado papers, blogs, repos adicionales ni demos en la información disponible.
