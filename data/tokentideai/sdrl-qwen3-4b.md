# tokentideAI/SDRL-Qwen3-4B

## Resumen

SDRL-Qwen3-4B es un ajuste fino del modelo Qwen3-4B-Instruct-2507 desarrollado por tokentideAI, entrenado con un marco de aprendizaje por refuerzo denominado Strategy-Diverse Reinforcement Learning (SDRL). Su proposito es convertir un LLM generalista en un meta-resolutor de problemas de optimizacion industrial: dado un enunciado en lenguaje natural, el modelo decide y ejecuta la estrategia computacional mas adecuada (solver exacto como Gurobi, algoritmo combinatorio exacto o busqueda heuristica) en lugar de limitarse a formular el modelo matematico.

El modelo aborda un problema concreto: los LLM suelen producir formulaciones LP/MILP correctas en papel pero fallan al resolver instancias industriales de gran escala, especialmente cuando los datos residen en ficheros externos (file-grounded). SDRL introduce una recompensa jerarquica de diversidad condicionada por correccion, que evita el colapso prematuro hacia una unica estrategia, y un esquema de entrenamiento de formato mixto que cubre problemas textuales autocontenidos y problemas con datos en ficheros.

Con 4.022 millones de parametros, licencia Apache 2.0 y un tamano de repositorio de 8,1 GB, es relevante porque demuestra que un modelo de 4B entrenado especificamente supera a modelos frontier mucho mayores (GPT-5.5, Claude-Opus-4.8, Gemini-3.1-Pro-Preview) en varios benchmarks de modelado de optimizacion, con un promedio de 64,6 frente a 43,3 del Qwen3-4B base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el modelo base admite cuantizaciones habituales de la familia Qwen3) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer decoder-only denso de aproximadamente 4.000 millones de parametros, y se ajusta mediante RL con el framework SDRL. La innovacion central es una recompensa jerarquica de diversidad condicionada por correccion (correctness-gated hierarchical diversity reward) que fomenta la exploracion tanto entre familias de estrategias (solver exacto, algoritmo combinatorio exacto, busqueda heuristica) como dentro de cada familia, evitando que el entrenamiento colapse hacia una sola estrategia dominante. El modelo aprende a enrutar cada problema a la estrategia mas apropiada segun su estructura y escala.

El entrenamiento utiliza un esquema de formato mixto que combina problemas de optimizacion autocontenidos (enunciado textual completo) con instancias industriales file-grounded, en las que los datos estan distribuidos en ficheros externos que el modelo debe leer y procesar en tiempo de ejecucion. El subconjunto limpio de entrenamiento contiene 20.320 instancias (train.parquet, 22,2 MiB). No se especifica en la informacion disponible el numero total de tokens de entrenamiento, la composicion detallada del dataset ni si se emplearon tecnicas adicionales como DPO.

## Capacidades

- Razonamiento y modelado de problemas de optimizacion expresados en lenguaje natural (LP, MILP, problemas combinatorios).
- Enrutamiento adaptativo entre tres familias de estrategias: solver exacto (Gurobi), algoritmo combinatorio exacto (DP, greedy, grafos, backtracking) y busqueda heuristica (ALNS, GRASP, busqueda local, simulated annealing).
- Generacion de codigo de solucion ejecutable a partir de la formulacion del problema.
- Procesamiento de instancias file-grounded: lectura y uso de datos distribuidos en ficheros externos durante la inferencia.
- Verificacion de factibilidad y correccion de soluciones (evaluado en el benchmark FrontierOR).
- Diseno automatico de algoritmos (AAD): generacion de heuristicas y algoritmos de optimizacion, evaluado en la tarea EoH de bin packing.
- Generacion de texto general y conversacion heredadas del modelo base Qwen3-4B-Instruct-2507.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponible de forma explicita; el paradigma de meta-solutor implica planificacion de estrategia, pero no se documenta un framework de agentes.
- Capacidades multilingues: no disponible.

## Casos de uso

- Planificacion de produccion y logistica: dado un enunciado de planificacion con restricciones de capacidad, el modelo formula el MILP y decide si resolverlo con Gurobi o con una heuristica tipo ALNS cuando la instancia es demasiado grande, devolviendo una solucion factible verificada.
- Optimizacion de rutas y distribucion: para instancias de VRP de gran escala, el modelo selecciona busqueda heuristica (ALNS, simulated annealing) en lugar de un solver exacto intratable, generando el codigo de la heuristica y ejecutandolo.
- Investigacion operativa asistida para analistas: el modelo traduce un problema descrito en lenguaje natural a una formulacion matematica y a codigo de solver, reduciendo el trabajo manual de modelado en equipos sin especialistas en OR.
- Procesamiento de instancias industriales con datos en ficheros: en escenarios donde los datos de demanda, capacidades o costes estan en CSV externos, el modelo lee los ficheros en tiempo de ejecucion (file-grounded) y construye la solucion, capacidad en la que supera ampliamente a los modelos base (23,6 en MIPLIB-NL frente a 7,7 del Qwen3-4B base).
- Diseno automatico de heuristicas: generacion y refinamiento de algoritmos de empaquetado (bin packing) y otras metaheuristicas, util para equipos que investigan AAD y necesitan un generador de candidatos algoritmicos.
- Asistente de docencia e investigacion en optimizacion: explicacion paso a paso de estrategias de resolucion y generacion de ejemplos ejecutables para cursos de investigacion operativa.
- Despliegue en entornos con recursos limitados: al ser un modelo de 4B, puede ejecutarse en una sola GPU consumer para prototipado de pipelines de optimizacion, a diferencia de los modelos frontier con los que compite en benchmarks.

## Benchmarks y rendimiento

Resultados en siete benchmarks NL-to-Opt (porcentaje de soluciones validas con error relativo < 1e-6):

| Metodo | NL4Opt | MAMO-E | MAMO-C | Ind-OR | OptMath | OptiBench | MIPLIB-NL | Avg. |
|---|---|---|---|---|---|---|---|---|
| Qwen3-4B-Instruct-2507 (base) | 72,7 | 68,9 | 42,4 | 40,0 | 17,5 | 54,1 | 7,7 | 43,3 |
| Qwen3-32B (base) | 85,3 | 88,8 | 66,0 | 39,0 | 17,5 | 60,0 | 10,5 | 52,4 |
| ORLM-Llama3-8B | 85,7 | 82,3 | 37,4 | 24,0 | 2,6 | 51,1 | 0,6 | 40,5 |
| OptMATH-Qwen2.5-7B | 94,7 | 86,5 | 51,2 | 20,0 | 24,4 | 57,9 | 0,0 | 47,8 |
| OptMATH-Qwen2.5-32B | 95,9 | 89,9 | 54,1 | 31,0 | 34,7 | 66,1 | 5,5 | 53,9 |
| SIRL-Qwen2.5-7B | 96,3 | 91,7 | 51,7 | 33,0 | 30,5 | 58,0 | 0,5 | 51,7 |
| SIRL-Qwen2.5-32B | 98,0 | 94,6 | 61,1 | 42,0 | 45,8 | 67,4 | 1,4 | 58,6 |
| StepORLM-Qwen3-8B | 89,8 | 89,9 | 52,2 | 40,0 | 14,5 | 56,5 | 0,9 | 49,1 |
| **SDRL-Qwen3-4B** | 96,3 | 92,4 | 79,3 | 55,0 | 41,0 | 67,1 | 23,6 | **64,6** |
| SDRL-Qwen3-32B | 96,3 | 96,0 | 81,8 | 56,0 | 59,0 | 69,1 | 30,0 | 69,7 |
| DeepSeek-V4-Pro | 95,5 | 90,0 | 87,2 | 63,0 | 49,4 | 66,9 | 28,2 | 68,6 |
| Qwen3.5-397B-A17B | 94,7 | 91,4 | 81,3 | 64,0 | 42,2 | 65,5 | 32,3 | 67,3 |
| GPT-5.5 | 95,5 | 93,8 | 92,1 | 67,0 | 40,4 | 69,6 | 29,1 | 69,6 |
| Claude-Opus-4.8 | 92,2 | 94,2 | 93,1 | 64,0 | 60,2 | 64,6 | 39,1 | 72,5 |
| Gemini-3.1-Pro-Preview | 90,2 | 91,6 | 93,0 | 67,0 | 51,8 | 66,1 | 40,9 | 71,5 |

Tambien se evalua la transferencia a tareas de diseno automatico de algoritmos (AAD), con comparacion frente a Evolution of Heuristics (EoH) en configuracion first fit para bin packing online (metrica: exceso de bins sobre la cota inferior, menor es mejor). Los resultados detallados por instancia (1k_C100, 5k_C100, 10k_C100, 1k_C500, 5k_C500) no estan completos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 8 GB solo para pesos, mas overhead de activaciones y cache KV (estimacion practica: 10-12 GB).
- Cuantizacion a 8 bits: aproximadamente 4-5 GB de pesos; a 4 bits: aproximadamente 2,5-3 GB.
- GPU recomendadas: A100 40/80 GB o H100 para despliegue de alta concurrencia; RTX 4090 (24 GB) para inferencia comoda en FP16; RTX 3090/4080 (16-24 GB) suficientes en FP16 o 8 bits.
- Cabe en GPU consumer: si, en RTX 4090, RTX 3090, RTX 4080 y GPUs con 12 GB o mas en cuantizacion de 8 bits o inferior.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag endpoints_compatible), y previsiblemente vLLM, llama.cpp y Ollama mediante conversion a GGUF, aunque no se documentan en la model card.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Avg. NL-to-Opt | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SDRL-Qwen3-4B | 4,0B | no disponible | 64,6 | Apache 2.0 | Hugging Face |
| SIRL-Qwen2.5-7B | 7B | no disponible | 51,7 | no disponible | Hugging Face |
| OptMATH-Qwen2.5-7B | 7B | no disponible | 47,8 | no disponible | Hugging Face |
| StepORLM-Qwen3-8B | 8B | no disponible | 49,1 | no disponible | no disponible |
| Qwen3-4B-Instruct-2507 (base) | 4,0B | no disponible | 43,3 | Apache 2.0 | Hugging Face |

Frente a los modelos ajustados de 7-8B para optimizacion, SDRL-Qwen3-4B obtiene una ventaja de 13-17 puntos en el promedio, con diferencias especialmente marcadas en MAMO-ComplexLP (79,3 frente a 51-52) y MIPLIB-NL (23,6 frente a 0-0,9). Su rendimiento se acerca al de modelos frontier de cientos de miles de millones de parametros en varios sub-benchmarks (NL4Opt, OptiBench), aunque queda por detras en MAMO-ComplexLP, Ind-OR y MIPLIB-NL frente a Claude-Opus-4.8 y Gemini-3.1-Pro-Preview.

## Limitaciones y advertencias

- Modelo especializado: el ajuste RL esta orientado a optimizacion y resolucion de problemas; su rendimiento en tareas generales de conversacion o generacion creativa puede haberse degradado respecto al Qwen3-4B-Instruct-2507 original. No se documenta esta posible regresion.
- Riesgo de alucinacion en la formulacion: aunque el modelo enruta estrategias, puede generar formulaciones matematicas incorrectas o codigo de solver no ejecutable en problemas fuera de la distribucion de entrenamiento.
- Dependencia de Gurobi: la estrategia de solver exacto requiere una instalacion de Gurobi con licencia valida; no se detalla el comportamiento del modelo cuando el solver no esta disponible.
- Idiomas: no se especifican los idiomas soportados; el entrenamiento y los benchmarks son en ingles, por lo que el rendimiento en castellano no esta validado.
- Longitud de contexto: no declarada en la model card; las tareas file-grounded pueden requerir ventanas amplias y no hay garantia documentada sobre el limite efectivo.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 y la dependencia de Gurobi imponen sus propias condiciones que deben verificarse por separado.
- Madurez: repositorio con 29 descargas y 0 likes, publicado en octubre de 2026 y actualizado en noviembre de 2026; ecosistema de herramientas y validacion externa aun limitados.
- Benchmarks autoevaluados por el autor: los resultados de la tabla provienen de la model card y no se han replicado de forma independiente en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tokentideAI/SDRL-Qwen3-4B
- Modelo hermano de 32B: https://huggingface.co/tokentideAI/SDRL-Qwen3-32B
- Paper en arXiv: https://arxiv.org/abs/2609.34427
- Repositorio GitHub: https://github.com/tokentideAI/LLMMetaSolver
- Dataset de entrenamiento: https://github.com/tokentideAI/LLMMetaSolver/raw/refs/heads/main/data/train.parquet
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
