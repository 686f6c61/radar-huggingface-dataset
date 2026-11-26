# ttttim3/Taxi-v3

## Resumen

`ttttim3/Taxi-v3` es un agente de aprendizaje por refuerzo (Q-Learning tabular) entrenado para resolver el entorno `Taxi-v3` de Gymnasium. Lo publica el usuario `ttttim3` en Hugging Face como parte del flujo de trabajo habitual de la librería `stable-baselines3`, que permite subir agentes entrenados al Hub con un formato estandarizado (fichero `q-learning.pkl` y metadatos de entorno). No se trata de un modelo de lenguaje ni de una red neuronal profunda: es una tabla Q serializada que mapea estados discretos del entorno a valores de acción.

El entorno `Taxi-v3` es un clásico de Gymnasium con un espacio de estados discreto de 500 combinaciones (25 posiciones del taxi × 5 posiciones del pasajero × 4 destinos) y 6 acciones posibles. El objetivo del agente es recoger a un pasajero y dejarlo en su destino con el menor coste acumulado; cada paso penaliza con -1 y cada entrega fallida con -10. El agente reporta una recompensa media de 7,50 ± 2,76, un valor muy por debajo del óptimo teórico (en torno a 8-13 según la política), lo que sugiere un entrenamiento limitado o una política subóptima.

La relevancia de esta ficha es acotada: se trata de un artefacto educativo o de prueba de concepto, sin licencia declarada, con cero descargas y sin documentación más allá del README mínimo generado por `stable-baselines3`. No debe confundirse con un modelo fundacional ni usarse como referencia de rendimiento en RL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla Q estado-acción) |
| Parametros totales | no disponible (tabla Q de 500 estados × 6 acciones = 3000 entradas potenciales) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL con horizonte episódico de 200 pasos) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `q-learning.pkl` (pickle de Python con la tabla Q y metadatos del entorno) |

## Arquitectura y entrenamiento

El agente implementa Q-Learning clásico, un algoritmo de diferencias temporales off-policy que actualiza iterativamente la función de valor-acción Q(s,a) mediante la regla de actualización de Bellman. La política aprendida es ε-greedy durante el entrenamiento y presumiblemente greedy en inferencia. No hay red neuronal, ni representación de características, ni generalización entre estados: la tabla Q se indexa directamente por el identificador discreto de estado que devuelve `Taxi-v3`.

No se dispone de información sobre el número de episodios de entrenamiento, la tasa de aprendizaje, el factor de descuento, la política de exploración ni la semilla utilizada. El README no incluye hiperparámetros ni curvas de aprendizaje. La recompensa media reportada (7,50) es modesta: el entorno `Taxi-v3` permite alcanzar recompensas medias superiores con un entrenamiento suficiente, por lo que el agente parece haber sido entrenado con un presupuesto limitado o sin convergencia completa.

## Capacidades

- Resolución del entorno `Taxi-v3` de Gymnasium mediante política Q-Learning tabular.
- Selección de acción discreta (6 acciones: mover norte, sur, este, oeste, recoger pasajero, dejar pasajero) a partir del estado discreto observado.
- Carga y ejecución mediante `stable-baselines3` con `load_from_hub` y `gym.make(model["env_id"])`.
- No soporta tool calling, function calling, agentes multi-paso fuera del entorno, ni razonamiento en lenguaje natural.
- No tiene capacidades multilingües, de visión, audio ni generación de texto.
- No implementa thinking mode ni decodificación especulativa.

## Casos de uso

- Docencia de aprendizaje por refuerzo: sirve como ejemplo mínimo y reproducible de un agente Q-Learning entrenado y publicado en el Hub, útil para ilustrar el ciclo entrenamiento-serialización-despliegue con `stable-baselines3`.
- Pruebas de integración de pipelines de RL: permite verificar que un pipeline de carga (`load_from_hub`), instanciación de entorno (`gym.make`) y evaluación funciona de extremo a extremo antes de escalar a entornos más complejos.
- Baseline de comparación en experimentos académicos: puede usarse como referencia inferior frente a agentes DQN, PPO o A2C entrenados en `Taxi-v3` para medir la mejora relativa.
- Reproducción de resultados: al ser un artefacto pequeño (0,0 GB declarados), facilita la reproducción de la evaluación reportada (7,50 ± 2,76) en entornos controlados.
- Demostración de entornos discretos en charlas o tutoriales: el bajo coste computacional permite ejecutarlo en cualquier portátil sin GPU.
- Verificación de formato de model card y `model-index`: útil para validar herramientas que consumen metadatos de Hugging Face y comprueban la estructura de resultados declarados.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card (no verificados, `verified: false`):

| Entorno | Métrica | Valor |
|---|---|---|
| Taxi-v3 | mean_reward | 7,50 ± 2,76 |

No se han publicado otros resultados de benchmarks en la información disponible. No hay comparación con agentes alternativos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB (no requiere GPU; la tabla Q es un objeto Python de tamaño despreciable).
- GPU recomendadas: ninguna; funciona en CPU.
- Cabe en cualquier GPU consumer y en cualquier CPU moderna; también en entornos sin aceleración.
- Opciones de despliegue: `stable-baselines3` con `load_from_hub`, `gymnasium` para el entorno. No aplica vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje).
- Latencia y throughput: no disponibles en la información proporcionada; por la naturaleza tabular del agente, la inferencia es prácticamente instantánea (una búsqueda en tabla) y el coste dominante es la simulación del entorno.

## Comparativa con modelos similares

No se dispone de información sobre agentes comparables publicados por el mismo autor ni de resultados de referencia en la model card. Como referencia cualitativa de la categoría (agentes Q-Learning en `Taxi-v3` publicados en el Hub), no hay datos suficientes para construir una tabla comparativa con parámetros, contexto y licencia verificables.

| Modelo | Entorno | Métrica declarada | Licencia | Disponibilidad |
|---|---|---|---|---|
| ttttim3/Taxi-v3 | Taxi-v3 | mean_reward 7,50 ± 2,76 | no disponible | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El agente está especializado exclusivamente en `Taxi-v3`; no generaliza a otros entornos ni tareas.
- La recompensa media declarada (7,50) no está verificada (`verified: false`) y es inferior a la que se obtiene con entrenamientos más prolongados; el rendimiento real puede variar.
- Licencia no declarada: no se puede asumir uso comercial ni redistribución sin consultar al autor.
- Sin documentación de hiperparámetros, semilla ni número de episodios: la reproducibilidad del entrenamiento no está garantizada.
- El fichero de pesos es un pickle de Python; cargar pickles de origen no confiable conlleva riesgo de ejecución de código arbitrario.
- No hay información sobre sesgos, alucinaciones ni comportamiento fuera de distribución más allá del propio entorno discreto.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.
- El identificador de entorno debe coincidir con el guardado en el pickle; si se instancia con parámetros distintos (por ejemplo, `is_slippery`), la política puede degradarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ttttim3/Taxi-v3
- Entorno Taxi-v3 en Gymnasium: https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentación de `stable-baselines3` para carga desde el Hub: https://stable-baselines3.readthedocs.io/
- Repositorio de `stable-baselines3`: https://github.com/DLR-RM/stable-baselines3
