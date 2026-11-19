# thelamapi/Next-Reward

## Resumen

Next-Reward es un modelo de aprendizaje por refuerzo basado en modelo (model-based RL) publicado por el usuario thelamapi en Hugging Face. No es un modelo de lenguaje: es un agente que aprende la dinamica de movimiento de un entorno tipo gridworld (rejilla) y, a partir de ella, planifica rutas optimas mediante iteracion de valores (value iteration). El checkpoint se ejecuta en CPU exclusivamente con NumPy, sin dependencias de frameworks de deep learning.

El modelo aborda el problema de la planificacion de rutas en almacenes simulados: dado un plano de planta y un objetivo, estima como cada accion desplaza al agente y que recompensas se obtienen, para luego elegir en cada celda alcanzable el movimiento que minimiza el coste hasta la meta. Su relevancia es didactica y de investigacion: demuestra que un agente tabular ligero, entrenado sobre rejillas procedurales de 5x5, 6x6 y 7x7, generaliza a rejillas de hasta 51x51 y reproduce rutas optimas verificadas por BFS.

El repositorio es de tamano practicamente nulo (0.0 GB), con 0 descargas y 1 like en el momento de la consulta, creado y actualizado el 19 de noviembre de 2026. La informacion disponible sobre arquitectura de red, numero de parametros y licencia es muy limitada; se detalla lo que la model card especifica y se marca el resto como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RL basado en modelo tabular: estimacion de desplazamientos por accion y recompensas por tipo de destino, con planificacion por iteracion de valores |
| Parametros totales | no disponible (checkpoint en JSON; almacena estimaciones de desplazamiento para 16 patrones de muro y recompensas para 3 tipos de destino) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (no aplica; checkpoint JSON en precision nativa) |
| Idiomas soportados | en (documentacion y model card) |
| Licencia | no disponible |
| Formato de pesos | JSON (`model.json`) acompanado del codigo de inferencia `next_reward.py` |
| Factor de descuento | 0.98 |
| Entorno de entrenamiento | Rejillas procedurales de 5x5, 6x6 y 7x7 |
| Semilla del checkpoint exportado | 73 |
| Dependencias | NumPy (ejecucion en CPU) |

## Arquitectura y entrenamiento

Next-Reward no emplea una red neuronal: es un agente tabular de RL basado en modelo. Durante el entrenamiento muestrea transiciones sobre rejillas procedurales de 5x5, 6x6 y 7x7 y almacena dos componentes: estimaciones de desplazamiento por accion condicionadas a dieciseis patrones de muros vecinos, y recompensas aprendidas para tres tipos de destino. Con ese modelo del entorno, la planificacion se resuelve mediante iteracion de valores con factor de descuento 0.98, lo que produce una politica determinista sobre cada celda alcanzable.

El proceso de entrenamiento es reproducible: el script `experiment.py` (invocado con `python experiment.py --output run`) entrena y evalua las tres semillas 73, 101 y 149, y la release incluye el cuaderno de entrenamiento, el fichero `evaluation.json` y los planos de evaluacion exactos en `test_maps.json`. El checkpoint exportado corresponde a la semilla 73. No se especifican en la informacion disponible el numero total de episodios, el volumen de transiciones ni si se aplicaron tecnicas adicionales como RLHF o DPO (no aplicables en este dominio).

## Capacidades

- Planificacion de rutas optimas en rejillas completamente visibles con movimiento determinista.
- Aprendizaje del modelo de transicion: estima como cada accion cambia la posicion del agente segun el patron de muros circundante.
- Generalizacion de rejillas de entrenamiento (5x5 a 7x7) a rejillas de evaluacion de 5x5, 8x8, 12x12 y 51x51.
- Replanificacion ante cambios del plano: la model card documenta un cierre de pasillo a mitad de reparto en el que la ruta optima pasa de 44 a 64 pasos.
- Verificacion de optimalidad: las rutas producidas coinciden con la referencia de busqueda en anchura (BFS) en todos los casos evaluados.
- Ejecucion en CPU con NumPy, sin GPU ni frameworks de aprendizaje profundo.
- No soporta tool calling, function calling, agentes multi-paso conversacionales, vision, audio ni capacidades multilingues; no es un modelo de lenguaje.

## Casos de uso

- Planificacion de rutas en almacenes simulados: dado un plano con estanterias, muros y zonas de carga, el agente calcula la secuencia de movimientos mas corta entre puntos de recogida y el muelle, como demuestra la ruta de 316 pasos con tres recogidas validadas contra BFS.
- Replanificacion dinamica ante incidencias: cuando un pasillo se cierra a mitad de trayecto, el agente recalcula la ruta desde el punto de decision con el plano actualizado, util en simuladores de logistica con bloqueos.
- Docencia e investigacion en RL basado en modelo: el checkpoint y el codigo permiten reproducir experimentos de iteracion de valores y comparar con baselines codiciosos sobre planos controlados.
- Validacion de algoritmos de busqueda: los planos de `test_maps.json` y la referencia BFS sirven como banco de pruebas para verificar la optimalidad de otros planificadores.
- Prototipado de navegacion en rejillas de gran escala: el ejemplo de 51x51 con 1.284 celdas alcanzables y una ruta de 306 pasos muestra su uso como base para simulaciones de despacho de mayor tamano.
- Benchmarking de heuristicas: la comparacion entre Next-Reward (5.359 rutas optimas sobre 5.359 inicios alcanzables) y el baseline codicioso (2.956 llegadas) permite medir la brecha de heuristicas tipo Manhattan en entornos con callejones sin salida.
- Integracion en pipelines de simulacion ligeros: al ejecutarse solo con NumPy en CPU, puede incorporarse a entornos de test sin infraestructura de GPU.

## Benchmarks y rendimiento

Evaluacion sobre 120 planos retenidos, con todos los inicios alcanzables, para tres semillas de entrenamiento (73, 101 y 149); los tres produjeron las mismas puntuaciones:

| Rejilla | Planos | Inicios alcanzables | Rutas optimas Next-Reward | Llegadas baseline codicioso |
|---|---:|---:|---:|---:|
| 5x5 | 40 | 569 | 569 | 474 |
| 8x8 | 40 | 1.417 | 1.417 | 927 |
| 12x12 | 40 | 3.373 | 3.373 | 1.555 |
| **Total** | **120** | **5.359** | **5.359** | **2.956** |

Resultados adicionales documentados en la model card:

| Prueba | Next-Reward | Referencia / baseline |
|---|---:|---:|
| Ruta de reparto con tres recogidas (seed 2026), pasos | 316 | 316 (BFS) |
| Planos con atajo fallido resueltos (5 casos) | 5 de 5 | 0 de 5 (codicioso) |
| Ruta de despacho en rejilla 51x51, pasos | 306 | 306 (BFS) |
| Replanificacion tras cierre de pasillo, pasos | 44 -> 64 | no disponible |

Otros 1.122 inicios sin camino hasta la meta se contabilizaron por separado. No se han publicado resultados de benchmarks estandar de ML (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que no son aplicables a este tipo de modelo.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia se ejecuta en CPU con NumPy.
- GPU recomendadas: no aplica; cualquier CPU convencional es suficiente para el checkpoint y la planificacion.
- Cabe en cualquier equipo consumer: el repositorio ocupa 0.0 GB y el checkpoint es un JSON con tablas de desplazamiento y recompensa.
- Opciones de despliegue: ejecucion directa del modulo `next_reward.py` con NumPy; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este modelo.
- Latencia y throughput: no disponibles; la model card no reporta tiempos de inferencia ni de planificacion.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Next-Reward | RL basado en modelo tabular | Gridworld / almacen simulado | Modelo de transicion + iteracion de valores | no disponible | Hugging Face (thelamapi/Next-Reward) |
| Alternativas de RL tabular para gridworld | no disponible | no disponible | no disponible | no disponible | no disponible |
| Algoritmos de busqueda clasicos (BFS, A*) | Planificacion determinista | Rejillas con plano conocido | Busqueda exhaustiva / heuristica | no disponible | Implementaciones multiples |

No se dispone en la informacion proporcionada de modelos comparables publicados con los que contrastar parametros, contexto o rendimiento. La referencia natural de comparacion es BFS, usada por el propio autor como oraculo de optimalidad, y el baseline codicioso por distancia Manhattan descrito en la model card.

## Limitaciones y advertencias

- Alcance restringido a rejillas totalmente visibles con movimiento determinista; no se ha probado en control fisico de robots ni con percepcion de obstaculos.
- No soporta trafico entre multiples agentes ni la optimizacion del orden de visita a las estanterias, segun la seccion Scope de la model card.
- El experimento de cierre de pasillo proporciona al agente el plano modificado; no se evalua la deteccion autonoma del cambio.
- La generalizacion se ha verificado hasta rejillas de 51x51, pero el entrenamiento solo cubre rejillas de 5x5 a 7x7; el comportamiento en escalas mayores no esta documentado.
- Licencia no disponible: no puede confirmarse el uso comercial sin consultar al autor.
- El modelo no es un modelo de lenguaje y no debe evaluarse con benchmarks de NLP; su utilidad esta acotada a planificacion en rejillas.
- Riesgo de alucinacion no aplicable en el sentido de generacion de texto; el riesgo equivalente es una estimacion de transicion incorrecta en patrones de muro no vistos durante el entrenamiento.
- Sesgos conocidos: no documentados en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thelamapi/Next-Reward
- Imagen de portada del modelo: https://cdn-uploads.huggingface.co/production/uploads/67d46bc5fe6ad6f6511d6f44/z7NT6VY_eIDZXf_1h78iR.png
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada.
