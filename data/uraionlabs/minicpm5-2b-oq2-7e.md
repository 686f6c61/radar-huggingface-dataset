# UraionLabs/MiniCPM5-2B-oQ2.7e

## Resumen

MiniCPM5-2B-oQ2.7e es una cuantización de precisión mixta en formato MLX del modelo OpenBMB/MiniCPM5-2B, publicada por Uraion Labs. El modelo base lo desarrolla OpenBMB y emplea una arquitectura LlamaForCausalLM estándar con Grouped-Query Attention, 42 capas y 2.516.756.480 parámetros totales (1.981.982.720 no pertenecientes a embeddings). Su ventana de contexto nativa es de 131.072 tokens, lo que lo sitúa en la categoría de modelos pequeños con contexto largo.

El problema que resuelve esta variante concreta es el despliegue local en Apple Silicon con un consumo de almacenamiento mínimo: el checkpoint ocupa 0,98 GB (1.005,44 MB), con un peso efectivo de aproximadamente 3,1 bits por parámetro, gracias a una asignación de precisión guiada por matrices de importancia (flujo oMLX oQe). Frente a la cuantización uniforme de 2 bits, se preservan en 8 bits la proyección de salida (`lm_head`) y se elevan 23 capas a 5 bits y 8 capas a 6 bits, lo que mitiga parcialmente la degradación típica de las cuantizaciones agresivas.

Es relevante ahora porque permite ejecutar un modelo de 2,5B con contexto de 131k y capacidades de tool calling en un Mac con memoria unificada modesta, usando únicamente `omlx` o `mlx-lm`. La licencia Apache-2.0 del modelo base facilita su uso comercial, aunque el rendimiento real de esta variante de 2 bits no viene acompañado de benchmarks publicados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (`llama`), transformer denso con Grouped-Query Attention (16 cabezas Q / 2 cabezas KV, head dim 128) |
| Parametros totales | 2.516.756.480 (~2,52B) |
| Parametros activos | No aplica: modelo denso (no MoE). Parametros no pertenecientes a embeddings: 1.981.982.720 (~1,98B) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | oQ2.7e: base 2 bits con perfil mixto 2/5/6/8 bits (23 capas a 5 bits, 8 capas a 6 bits, `lm_head` a 8 bits); modo affine con group size 64; tensores no cuantizados en BF16; ~3,1 bits efectivos por peso |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX safetensors (0,98 GB / 1.005,44 MB) |
| Capas | 42 |
| Runtime objetivo | Apple Silicon macOS: `omlx` y `mlx-lm` |
| Dataset de calibracion | `oqe_code_multilingual`, 294 muestras |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de tipo LlamaForCausalLM con 42 capas y atención GQA de 16 cabezas de consulta frente a 2 cabezas de clave/valor, con dimensión de cabeza 128. Esta configuración reduce el coste de la caché KV en contextos largos, algo crítico con una ventana de 131.072 tokens. El checkpoint aquí descrito no reentrena ni modifica la arquitectura: es una cuantización de precisión mixta del modelo base.

Sobre el entrenamiento del modelo original, la información disponible indica que OpenBMB utilizó su currículo de datos UltraData, que incluye Ultra-FineWeb, UltraX-Preview, Ultra-FineWeb-L3, UltraData-Math, UltraData-Code, UltraData-SFT-2605, UltraData-SFT-Agent-2609 y UltraData-RL-2609. La presencia de conjuntos SFT y RL sugiere fases de ajuste supervisado y de refuerzo, y los conjuntos específicos de agente apuntan a un entrenamiento orientado a function calling y flujos agénticos. No se especifican en la información proporcionada el número total de tokens de entrenamiento, la composición porcentual del dataset ni los detalles del algoritmo de RL.

La innovación técnica de esta publicación concreta es el flujo de cuantización oQe de oMLX, que asigna precisión por capa mediante matrices de importancia y calibración sobre un conjunto multilingüe de código, en lugar de aplicar una tasa uniforme. El resultado es un perfil no uniforme (2/5/6/8 bits) con la cabeza de salida intacta en 8 bits.

## Capacidades

- Generacion de texto conversacional en ingles y chino, con soporte multi-turno.
- Razonamiento y matematicas, segun los conjuntos UltraData-Math y UltraData-RL empleados en el entrenamiento del modelo base.
- Generacion y asistencia de codigo, con datos de entrenamiento especificos (UltraData-Code) y calibracion de la cuantizacion sobre codigo multilingue.
- Tool calling y function calling, con etiquetas explicitas de `tool-calling` y `function-calling` y datos SFT/RL orientados a agente.
- Flujos agénticos y razonamiento multi-paso, con soporte de generacion de salida estructurada.
- Contexto largo de 131.072 tokens, adecuado para sintesis de documentos y razonamiento sobre repositorios completos.
- Inferencia local en Apple Silicon mediante MLX, sin dependencia de servicios en la nube.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode) en la informacion disponible.

## Casos de uso

- Asistente de codigo local en macOS: con 131.072 tokens de contexto puede cargar varios ficheros de un repositorio a la vez y responder preguntas de refactorizacion sin enviar codigo a servidores externos, algo relevante en entornos con requisitos de confidencialidad.
- Agente con tool calling en el escritorio: el modelo puede emitir llamadas a funciones estructuradas e integrarse en bucles agénticos que consulten APIs locales o ficheros del sistema, apoyandose en los datos de entrenamiento especificos de agente.
- Sintesis de documentacion larga: informes, contratos o manuales de decenas de miles de tokens que caben completos en la ventana de contexto, evitando estrategias de troceado y recuperacion.
- Analisis de repositorios completos: con contexto de 131k puede razonar sobre la estructura de un proyecto mediano, localizar definiciones y proponer cambios coherentes entre modulos.
- Prototipado e investigacion en portatiles: permite experimentar con un modelo de 2,5B en un Mac sin GPU dedicada, con un checkpoint de menos de 1 GB que se carga y descarga rapidamente durante las pruebas.
- Generacion de salida estructurada para pipelines de datos: extraccion de campos en JSON a partir de texto o codigo, aprovechando el `lm_head` preservado en 8 bits para reducir errores de formato.
- Traduccion tecnica ingles-chino: unico par de idiomas oficialmente soportado, util en documentacion y codigo con comentarios en ambos idiomas.
- Ejecucion en runners de CI con hardware Apple: verificacion automatica de documentacion o generacion de resumenes de cambios en un flujo de integracion continua sobre macOS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta variante cuantizada. El unico dato numerico aportado por el autor es que el modelo base MiniCPM5-2B alcanza una media de 53,9 en el conjunto de evaluacion propio de OpenBMB, sin desglose por tarea ni comparacion con modelos de referencia. No se dispone de valores de MMLU, HumanEval, GSM8K ni de metricas de perplejidad para el checkpoint oQ2.7e.

| Benchmark | oQ2.7e | MiniCPM5-2B (base) |
|---|---|---|
| MMLU | no disponible | no disponible |
| HumanEval | no disponible | no disponible |
| GSM8K | no disponible | no disponible |
| Media del conjunto de evaluacion de OpenBMB | no disponible | 53,9 (dato declarado por el autor, sin desglose) |

## Requisitos de hardware

- Peso del checkpoint en disco: 0,98 GB (1.005,44 MB); el repositorio completo ocupa 1,1 GB.
- VRAM/memoria unificada para pesos: aproximadamente 1 GB en el formato cuantizado. La version BF16 del modelo base requeriria en torno a 5 GB (estimacion a partir de 2,52B parametros a 2 bytes), lo que supone una reduccion de aproximadamente 5x.
- Memoria para la cache KV: con GQA de 2 cabezas KV, 42 capas y head dim 128, la cache en BF16 ocupa unos 42 KiB por token, es decir, alrededor de 344 MB a 8.192 tokens y unos 5,6 GB a los 131.072 tokens completos (estimacion calculada a partir de las especificaciones).
- GPU recomendadas: no aplica en el sentido habitual; el runtime objetivo es Apple Silicon. Cualquier Mac con memoria unificada suficiente para pesos mas cache KV puede ejecutarlo. No se documenta soporte para A100, H100 ni RTX 4090 en esta publicacion.
- Cabe en GPU de consumo: el modelo esta pensado para GPUs integradas de Apple Silicon. Para contextos cortos, el consumo total se mantiene por debajo de 2 GB, por lo que es viable en equipos con 8 GB de memoria unificada; para contextos cercanos a 131k conviene disponer de 16 GB o mas.
- Opciones de despliegue: `omlx` (https://github.com/jundot/omlx) y `mlx-lm` (https://github.com/ml-explore/mlx-examples/tree/main/llms/mlx_lm). No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparativa mas directa es con las otras cuantizaciones de la misma familia publicadas por Uraion Labs, cuyos datos si estan disponibles:

| Variante | Bits base | Perfil mixto | `lm_head` | Tamano | Repositorio |
|---|---|---|---|---|---|
| oQ8e | 8 bits | Uniforme 8 bits | 8 bits | 2,49 GB | UraionLabs/MiniCPM5-2B-oQ8e |
| oQ6e | 6 bits | Mixto 6/8 bits (28 capas a 8 bits) | 6 bits | 1,95 GB | UraionLabs/MiniCPM5-2B-oQ6e |
| oQ5e | 5 bits | Mixto 5/6/8 bits (19 a 6b, 6 a 8b) | 6 bits | 1,67 GB | UraionLabs/MiniCPM5-2B-oQ5e |
| oQ4e | 4 bits | Mixto 4/5/6 bits (58 a 5b, 9 a 6b) | 4 bits | 1,38 GB | UraionLabs/MiniCPM5-2B-oQ4e |
| oQ3.5e | 3 bits | Mixto 3/5/6 bits (29 a 5b, 7 a 6b) | 6 bits | 1,17 GB | UraionLabs/MiniCPM5-2B-oQ3.5e |
| oQ3e | 3 bits | Mixto 3/5/6 bits (31 a 5b, 7 a 6b) | 3 bits | 1,08 GB | UraionLabs/MiniCPM5-2B-oQ3e |
| oQ2.7e | 2 bits | Mixto 2/5/6/8 bits (23 a 5b, 8 a 6b) | 8 bits | 0,98 GB | UraionLabs/MiniCPM5-2B-oQ2.7e |
| oQ2e | 2 bits | Mixto 2/5/6 bits (10 a 5b, 6 a 6b) | 6 bits | 0,88 GB | UraionLabs/MiniCPM5-2B-oQ2e |

Todas comparten licencia Apache-2.0, formato MLX safetensors, contexto de 131.072 tokens y los mismos idiomas. La diferencia relevante entre oQ2.7e y oQ2e es que la primera conserva el `lm_head` en 8 bits y aplica mas capas en 5 y 6 bits, con 0,10 GB adicionales. No se dispone de datos de benchmarks que cuantifiquen la perdida de calidad de cada variante ni de comparaciones con modelos de otros desarrolladores en la informacion proporcionada.

## Limitaciones y advertencias

- Precision base de 2 bits: aunque el perfil sea mixto (2/5/6/8), 23 capas operan a 2 bits. Es esperable una degradacion en tareas de razonamiento, matematicas y codigo frente al modelo BF16, pero no se han publicado mediciones que la cuantifiquen.
- Ausencia de benchmarks: no hay perplejidad, MMLU, HumanEval ni ninguna otra metrica para esta variante. Cualquier decision de produccion deberia ir precedida de una evaluacion propia sobre el caso de uso concreto.
- Riesgo de alucinacion: inherente a un modelo de 2,5B de parametros, agravado por la cuantizacion agresiva. En tareas factuales o de recuperacion de informacion conviene verificar las salidas.
- Idiomas: solo ingles y chino estan declarados. El rendimiento en castellano no esta garantizado ni documentado, y la calibracion de la cuantizacion no incluye muestras en espanol.
- Compatibilidad de runtime restringida: el checkpoint esta en formato MLX y depende de `omlx` o `mlx-lm` sobre Apple Silicon. No es desplegable directamente en vLLM, llama.cpp, Ollama o TGI segun la informacion disponible, lo que limita su uso en servidores Linux con GPU.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, con obligacion de mantener el aviso de licencia. Conviene revisar los terminos del modelo base OpenBMB/MiniCPM5-2B por si anaden condiciones adicionales.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad o alineacion para esta publicacion. El modelo hereda los sesgos de los datos de entrenamiento del modelo base, que no se detallan.
- Coste de contexto largo: la cache KV crece linealmente y alcanza varios gigabytes a 131.072 tokens, lo que puede agotar la memoria unificada en equipos con 8 o 16 GB si se usa la ventana completa.
- Metadatos: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no hay historial de validacion por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ2.7e
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Repositorio oMLX: https://github.com/jundot/omlx
- mlx-lm: https://github.com/ml-explore/mlx-examples/tree/main/llms/mlx_lm
- Variantes de la familia: https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ8e , https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ6e , https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ5e , https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ4e , https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ3.5e , https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ3e , https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ2e
- Datasets de entrenamiento referenciados: https://huggingface.co/datasets/openbmb/Ultra-FineWeb , https://huggingface.co/datasets/openbmb/UltraX-Preview , https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3 , https://huggingface.co/datasets/openbmb/UltraData-Math , https://huggingface.co/datasets/openbmb/UltraData-Code , https://huggingface.co/datasets/openbmb/UltraData-SFT-2605 , https://huggingface.co/datasets/openbmb/UltraData-SFT-Agent-2609 , https://huggingface.co/datasets/openbmb/UltraData-RL-2609
- Referencias arXiv incluidas en las etiquetas: https://arxiv.org/abs/2506.07900 , https://arxiv.org/abs/2602.09003
- Sitio del publicador: https://uraionlabs.com
