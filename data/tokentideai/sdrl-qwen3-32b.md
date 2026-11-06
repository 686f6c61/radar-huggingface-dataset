# tokentideAI/SDRL-Qwen3-32B

## Resumen

SDRL-Qwen3-32B es un ajuste fino del modelo Qwen3-32B de Alibaba, desarrollado por tokentideAI, orientado a resolver problemas de optimización de operaciones (operations research, OR) a escala industrial. El modelo se presenta como un "meta-solver" adaptativo: en lugar de aplicar siempre la misma estrategia computacional, analiza cada problema en lenguaje natural y lo enruta dinámicamente hacia una de tres familias de estrategias: solver exacto (Gurobi para LP/MILP de escala tratable), algoritmo combinatorio exacto (programación dinámica, greedy, grafos, backtracking) o búsqueda metaheurística (ALNS, GRASP, búsqueda local, simulated annealing) para instancias NP-hard de gran tamaño.

El modelo se entrena con Strategy-Diverse Reinforcement Learning (SDRL), un marco que emplea una recompensa jerárquica de diversidad condicionada por corrección, con el objetivo de evitar el colapso prematuro de estrategia y fomentar la exploración tanto entre familias de estrategias como dentro de cada una. Además, incorpora un esquema de entrenamiento de formato mixto que soporta tanto problemas textuales autocontenidos como instancias industriales que requieren leer y procesar ficheros de datos externos en tiempo de ejecución.

Es relevante porque aborda un cuello de botella práctico en la aplicación de LLM a optimización: los modelos generalistas suelen fallar al formular y resolver problemas de gran escala o con datos distribuidos en ficheros. SDRL-Qwen3-32B reporta mejoras sustanciales frente a su modelo base y frente a modelos frontera en benchmarks de NL-to-Opt, especialmente en la categoría file-grounded (MIPLIB-NL), donde alcanza 30.0 frente a 10.5 del base y 39.1 del mejor modelo frontera reportado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-32B); no se detalla en la model card |
| Parametros totales | 32.762.123.264 (32,76 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-32B, un transformer decoder-only de aproximadamente 32,76 mil millones de parametros. Sobre esa base, tokentideAI aplica un ajuste fino con refuerzo (RL) mediante el marco SDRL, cuyo componente central es una recompensa de diversidad jerarquica condicionada por correccion. Esta recompensa promueve la exploracion entre las tres familias de estrategias (solver exacto, algoritmo combinatorio exacto y metaheuristica) y dentro de cada familia, penalizando el colapso hacia una unica estrategia dominante.

El entrenamiento combina un esquema de formato mixto: por un lado, problemas de optimizacion descritos en texto autocontenido; por otro, instancias industriales "file-grounded" en las que el modelo debe leer y procesar ficheros de datos externos en tiempo de ejecucion. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas adicionales como DPO o decodificacion especulativa.

## Capacidades

- Generacion de codigo Python para formulacion y resolucion de problemas de optimizacion, incluyendo el uso de `gurobipy`.
- Razonamiento estructurado en tres fases: analisis del problema (tipo, estructura matematica, escala estimada), enrutamiento de estrategia e implementacion.
- Enrutamiento adaptativo entre solver exacto (Gurobi), algoritmos combinatorios exactos (DP, greedy, grafos, backtracking) y metaheuristicas (ALNS, GRASP, busqueda local, simulated annealing).
- Procesamiento de instancias industriales con datos en ficheros externos (file-grounded), leyendo y procesando datos en tiempo de ejecucion.
- Generacion de texto y razonamiento general heredados del modelo base Qwen3-32B.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes multi-paso: no disponible de forma explicita; el flujo de meta-solver implica razonamiento multi-paso interno.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (thinking mode, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- **Resolucion de problemas de planificacion de produccion**: el modelo recibe una descripcion en lenguaje natural de un problema de scheduling con restricciones de capacidad y lo formula como MILP para Gurobi si la escala es pequena o media, o lo resuelve con una metaheuristica si el numero de variables y restricciones es elevado.
- **Optimizacion de rutas y logistica**: para problemas de routing de gran escala, el modelo selecciona ALNS o busqueda local en lugar de un solver exacto, generando el codigo Python necesario y ejecutandolo sobre los datos del problema.
- **Procesamiento de instancias industriales con datos en ficheros**: en escenarios donde los datos no caben en el prompt (por ejemplo, matrices de costes o inventarios extensos), el modelo lee los ficheros en tiempo de ejecucion y construye la solucion a partir de ellos, una capacidad medida especificamente en MIPLIB-NL.
- **Asistente para analistas de investigacion operativa**: el modelo analiza la estructura matematica de un problema (continuo vs. discreto, lineal vs. no lineal, subestructura optima) y recomienda y justifica la estrategia de resolucion mas adecuada antes de implementarla.
- **Generacion de formulaciones MILP para integracion en pipelines**: dado que produce codigo Python con `gurobipy`, puede integrarse en flujos automatizados que formulan y resuelven modelos de optimizacion de forma repetida sobre instancias cambiantes.
- **Prototipado rapido de metaheuristicas**: para problemas NP-hard sin estructura explotable, el modelo genera implementaciones de simulated annealing, GRASP o busqueda local adaptadas a la instancia concreta, reduciendo el tiempo de desarrollo inicial.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre siete benchmarks NL-to-Opt. Una solucion se considera valida si el error relativo es menor que 1e-6.

| Metodo | NL4Opt | MAMO-E | MAMO-C | Ind-OR | OptMath | OptiBench | MIPLIB-NL | Media |
|---|---|---|---|---|---|---|---|---|
| Qwen3-32B (base) | 85.3 | 88.8 | 66.0 | 39.0 | 17.5 | 60.0 | 10.5 | 52.4 |
| SIRL-Qwen2.5-32B | 98.0 | 94.6 | 61.1 | 42.0 | 45.8 | 67.4 | 1.4 | 58.6 |
| OptMATH-Qwen2.5-32B | 95.9 | 89.9 | 54.1 | 31.0 | 34.7 | 66.1 | 5.5 | 53.9 |
| SDRL-Qwen3-4B | 96.3 | 92.4 | 79.3 | 55.0 | 41.0 | 67.1 | 23.6 | 64.6 |
| **SDRL-Qwen3-32B** | **96.3** | **96.0** | **81.8** | **56.0** | **59.0** | **69.1** | **30.0** | **69.7** |
| DeepSeek-V4-Pro | 95.5 | 90.0 | 87.2 | 63.0 | 49.4 | 66.9 | 28.2 | 68.6 |
| Qwen3.5-397B-A17B | 94.7 | 91.4 | 81.3 | 64.0 | 42.2 | 65.5 | 32.3 | 67.3 |
| GPT-5.5 | 95.5 | 93.8 | 92.1 | 67.0 | 40.4 | 69.6 | 29.1 | 69.6 |
| Claude-Opus-4.8 | 92.2 | 94.2 | 93.1 | 64.0 | 60.2 | 64.6 | 39.1 | 72.5 |
| Gemini-3.1-Pro-Preview | 90.2 | 91.6 | 93.0 | 67.0 | 51.8 | 66.1 | 40.9 | 71.5 |

SDRL-Qwen3-32B supera a su base en todos los benchmarks y alcanza una media de 69.7, por encima de DeepSeek-V4-Pro (68.6) y Qwen3.5-397B-A17B (67.3), y cerca de GPT-5.5 (69.6). Queda por debajo de Claude-Opus-4.8 (72.5) y Gemini-3.1-Pro-Preview (71.5). Destaca en OptMath (59.0) y MIPLIB-NL (30.0) dentro de los modelos abiertos evaluados.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 65 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 80 GB.
- Cuantizacion en 8 bits: alrededor de 33-35 GB de VRAM; en 4 bits: alrededor de 17-20 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB, o multiples GPU consumer con suficiente VRAM agregada.
- Cabe en GPU consumer de gama alta (RTX 4090 24 GB) solo con cuantizacion de 4 bits, con margen ajustado.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), y previsiblemente vLLM y llama.cpp/GGUF si se generan conversiones, aunque no se confirman en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media NL-to-Opt | MIPLIB-NL | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SDRL-Qwen3-32B | 32,76 B | no disponible | 69.7 | 30.0 | apache-2.0 | Hugging Face |
| SIRL-Qwen2.5-32B | ~32 B | no disponible | 58.6 | 1.4 | no disponible | Hugging Face |
| OptMATH-Qwen2.5-32B | ~32 B | no disponible | 53.9 | 5.5 | no disponible | Hugging Face |
| Qwen3-32B (base) | 32,76 B | no disponible | 52.4 | 10.5 | apache-2.0 | Hugging Face |

Frente a los ajustes finos especializados en OR de la misma escala (SIRL y OptMATH sobre Qwen2.5-32B), SDRL-Qwen3-32B mejora la media en mas de 10 puntos y multiplica por mas de 5 el rendimiento en la categoria file-grounded. Frente a modelos frontera cerrados, se situa en el rango de GPT-5.5 en media, aunque por debajo de Claude-Opus-4.8 y Gemini-3.1-Pro-Preview.

## Limitaciones y advertencias

- El modelo esta especializado en optimizacion; su rendimiento en tareas generales de texto, codigo o razonamiento fuera de OR no se reporta y podria degradarse respecto al base.
- Riesgo de alucinacion en la formulacion matematica: una formulacion incorrecta puede producir soluciones invalidas aunque el codigo se ejecute sin errores.
- Dependencia de Gurobi para la ruta de solver exacto: requiere licencia de Gurobi en produccion, lo que anade coste y complejidad operativa.
- La evaluacion se limita a siete benchmarks NL-to-Opt; no hay datos sobre robustez fuera de ese dominio ni sobre idiomas distintos del ingles (los prompts de ejemplo estan en ingles).
- No se especifican la longitud de contexto, los idiomas soportados ni los tipos de cuantizacion, lo que dificulta planificar despliegues.
- Licencia apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3-32B; conviene verificar la licencia del base.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de la comunidad.
- El uso de metaheuristicas no garantiza optimalidad; en problemas donde se requiere certificado de optimalidad debe forzarse la ruta de solver exacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tokentideAI/SDRL-Qwen3-32B
- Modelo hermano SDRL-Qwen3-4B: https://huggingface.co/tokentideAI/SDRL-Qwen3-4B
- Paper en arXiv: https://arxiv.org/abs/2609.34427
- Repositorio GitHub (codigo de inferencia y benchmarks): https://github.com/tokentideAI/LLMMetaSolver
- Modelo base: https://huggingface.co/Qwen/Qwen3-32B
- Referencia SIRL: https://huggingface.co/chenyitian-shanshu/SIRL
