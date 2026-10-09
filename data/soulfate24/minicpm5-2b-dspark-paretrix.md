# Soulfate24/MiniCPM5-2B-DSpark-Paretrix

## Resumen

MiniCPM5-2B-DSpark-Paretrix es una coleccion de cuantizaciones GGUF del modelo openbmb/MiniCPM5-2B, un transformer denso de aproximadamente 2,52 mil millones de parametros desarrollado por OpenBMB. La ficha la publica el usuario Soulfate24 bajo el paraguas de su suite Paretrix Quantization Suite, cuyo objetivo es generar recetas de cuantizacion optimizadas segun el principio de Pareto en lugar de aplicar un bitwidth uniforme a toda la red. El paquete incorpora ademas el draft checkpoint openbmb/MiniCPM5-2B-DSpark, pensado para decodificacion especulativa.

El modelo base pertenece a la serie MiniCPM5 de OpenBMB, orientada a despliegue on-device y en entornos con recursos limitados. Segun el repositorio GitHub de OpenBMB, MiniCPM5-2B es el segundo modelo de la serie tras MiniCPM5-1B y esta construido sobre una arquitectura densa de tipo LlamaForCausalLM, alcanzando lo que el autor describe como SOTA en la clase de 2B de codigo abierto. La relevancia de esta ficha concreta es practica: ofrece variantes cuantizadas con presupuestos de tamano calibrados (desde 2556 MiB hasta 1016 MiB) y metricas de degradacion medidas por el propio autor.

La aportacion diferenciadora no es el modelo en si, sino el metodo de cuantizacion. Paretrix mide la sensibilidad real de activaciones por clase de tensor mediante `llama-imatrix`, aprende tablas de tasa a partir de campanas cruzadas entre arquitecturas y asigna bitwidths bajo objetivos exactos de presupuesto, en lugar de recetas planas. El resultado son tiers con un compromiso calidad/compresion que, segun los datos publicados, supera a las cuantizaciones stock equivalentes de llama.cpp en varios puntos de la curva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (LlamaForCausalLM), con draft checkpoint DSpark para decodificacion especulativa |
| Parametros totales | 2.516.756.480 (aproximadamente 2,52 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens (131K) segun fuentes secundarias; no confirmado en la model card |
| Tipos de cuantizacion | GGUF Paretrix: Fidelity-48pc, Precision-42pc, Quality-36pc, Compact-33pc, Mini-30pc, Nano-27pc, Pico-24pc, Femto-21pc. Referencias stock: Q8_0, Q6_K-imx, Q5_K_M-imx, IQ4_XS-imx, IQ3_M-imx |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones Paretrix) y safetensors (pesos base; el repositorio ocupa 13,4 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de tipo LlamaForCausalLM, sin capas MoE ni mecanismos de atencion lineal o hibridos SSM, segun lo indicado en la evaluacion de Spark Arena. La serie MiniCPM5 de OpenBMB se posiciona explicitamente para despliegue local y en dispositivos con recursos restringidos. El checkpoint DSpark que acompania a estas cuantizaciones es un modulo de decodificacion especulativa independiente: la evaluacion de Spark Arena lo configura con `num_speculative_tokens=7`, valor que coincide con el `block_size` del propio draft, y con muestreo greedy en el draft para preservar la paridad de verificacion sin perdida con el modelo objetivo a temperatura cero.

Respecto a los datos de entrenamiento, las etiquetas de la ficha referencian los datasets de OpenBMB Ultra-FineWeb, UltraX-Preview, Ultra-FineWeb-L3, UltraData-Math, UltraData-Code y las colecciones de SFT y RL (UltraData-SFT-2605, UltraData-SFT-Agent-2609, UltraData-RL-2609). No se especifica en la informacion disponible el numero total de tokens, la composicion exacta del dataset ni los detalles del pipeline de alineamiento (RLHF/DPO/RL) mas alla de la existencia de esos conjuntos.

La innovacion tecnica de esta publicacion concreta es el metodo Paretrix. Segun la propia suite, cada tier se calcula midiendo la sensibilidad de activaciones por clase de tensor con `llama-imatrix`, aprendiendo tablas de tasa de campanas cruzadas y resolviendo la asignacion de bitwidths como un problema de mochila calibrado por tasa cuando la heterogeneidad compensa, o con recetas planas cuando la uniformidad es suficiente. La suite se presenta como aplicable tanto a modelos GGUF como a modulos de decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Procesamiento de contexto largo, con ventanas de hasta 131K tokens segun fuentes secundarias, adecuado para documentos extensos sin truncado.
- Tool calling y function calling, segun las etiquetas declaradas por el autor.
- Soporte de flujos de agente y razonamiento multi-paso, reflejado en el uso del dataset UltraData-SFT-Agent-2609.
- Decodificacion especulativa mediante el draft DSpark, con verificacion sin perdida respecto al modelo objetivo en modo greedy.
- Despliegue on-device y en el edge, con variantes que caben por debajo de 1,1 GiB.
- Capacidades multilingues limitadas a en y zh; no se declaran otros idiomas.
- No se declaran capacidades de vision, audio ni modo de razonamiento explicito (thinking mode) en la informacion disponible.

## Casos de uso

- Asistente local en dispositivos de gama baja: la variante Femto-21pc ocupa 1016 MiB, lo que permite ejecutar el modelo integramente en RAM o VRAM de portatiles, mini-PC y telefonos de gama alta sin conexion a red.
- Procesamiento de documentos largos en el edge: con una ventana de hasta 131K tokens, el modelo puede resumir o extraer informacion de contratos, informes o expedientes completos sin fragmentacion previa, manteniendo todo el contexto en una sola pasada.
- Atencion al cliente automatizada multilingue (en/zh): el modelo puede gestionar conversaciones multi-turno dentro de un presupuesto de memoria reducido, lo que abarata el coste por sesion en despliegues con muchas instancias concurrentes.
- Agentes con tool calling en pipelines de automatizacion: el soporte declarado de function calling permite integrarlo como planificador ligero que invoca APIs, bases de datos o scripts externos en flujos multi-paso.
- Servicio de inferencia con decodificacion especulativa: desplegando el modelo objetivo en BF16 con vLLM junto al draft DSpark y `num_speculative_tokens=7`, se puede reducir la latencia por token en cargas interactivas sin alterar la salida.
- Generacion de codigo asistida en IDE: el modelo base se entrena con UltraData-Code, de modo que puede emplearse para autocompletado y explicacion de fragmentos en editores locales, con la variante Precision-42pc como equilibrio entre calidad y huella.
- Clasificacion y etiquetado de texto a gran escala: al ser un modelo pequeno y cuantizable a partir de 1 GiB, es viable ejecutar lotes masivos de clasificacion, extraccion de entidades o moderacion en hardware modesto.
- Investigacion en cuantizacion: la tabla de tiers Paretrix sirve como banco de pruebas reproducible para estudiar el compromiso entre PPL, KLD y tamano en modelos de 2B, comparando recetas empiricas frente a las stock de llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay datos de MMLU, HumanEval, GSM8K ni similares). Lo que si se publica es una tabla de calidad de cuantizacion medida por el autor, con perplexity (PPL), divergencia KL (KLD), variacion RMS de probabilidad y cobertura top-p:

| Modelo | MiB | PPL | Delta PPL | KLD | RMS dp | top-p | Pareto |
|---|---:|---:|---:|---:|---:|---:|---|
| Q8_0 (stock) | 2556 | 11,9393 | +0,0181 | 0,0015 | 0,99% | 97,8% | si |
| Fidelity-48pc | 2309 | 11,9598 | +0,0386 | 0,0033 | 1,47% | 96,8% | si |
| Q6_K-imx (stock) | 1974 | 11,9724 | +0,0512 | 0,0059 | 1,91% | 95,9% | equivalente a Precision-42pc (-0,0002, -1 MiB) |
| Precision-42pc | 1973 | 11,9678 | +0,0466 | 0,0057 | 1,89% | 96,0% | si |
| Q5_K_M-imx (stock) | 1724 | 12,0905 | +0,1693 | 0,0195 | 3,58% | 92,8% | inferior a Quality-36pc |
| Quality-36pc | 1723 | 12,1180 | +0,1968 | 0,0175 | 3,43% | 93,3% | si |
| Compact-33pc | 1593 | 12,2219 | +0,3007 | 0,0427 | 5,12% | 89,2% | si |
| Mini-30pc | 1446 | 12,3731 | +0,4519 | 0,0672 | 6,53% | 86,7% | si |
| IQ4_XS-imx (stock) | 1358 | 12,3977 | +0,4765 | 0,0722 | 6,69% | 86,9% | si |
| Nano-27pc | 1306 | 12,6530 | +0,7318 | 0,0848 | 7,26% | 85,7% | si |
| IQ3_M-imx (stock) | 1170 | 13,9101 | +1,9889 | 0,2027 | 11,74% | 78,6% | inferior a Pico-24pc |
| Pico-24pc | 1154 | 13,9155 | +1,9943 | 0,1719 | 10,52% | 79,3% | si |
| Femto-21pc | 1016 | 15,2794 | +3,3582 | 0,2918 | 14,25% | 73,9% | si |

Lectura de los datos: los tiers Paretrix mejoran a las cuantizaciones stock en el punto de comparacion correspondiente (Precision-42pc frente a Q6_K-imx, Quality-36pc frente a Q5_K_M-imx y Pico-24pc frente a IQ3_M-imx), sobre todo en KLD. No se dispone de comparaciones contra otros modelos en tareas downstream.

## Requisitos de hardware

- Huella de pesos segun tier GGUF: Femto-21pc 1016 MiB, Pico-24pc 1154 MiB, IQ3_M-imx 1170 MiB, Nano-27pc 1306 MiB, IQ4_XS-imx 1358 MiB, Mini-30pc 1446 MiB, Compact-33pc 1593 MiB, Quality-36pc 1723 MiB, Q5_K_M-imx 1724 MiB, Precision-42pc 1973 MiB, Q6_K-imx 1974 MiB, Fidelity-48pc 2309 MiB, Q8_0 2556 MiB.
- VRAM estimada: sumar el contexto y los buffers KV al tamano de pesos. Para BF16 nativo del modelo base se necesitan aproximadamente 5 GB solo en pesos, mas cache KV. Con los tiers GGUF, la inferencia es viable en GPUs con 4 GB o incluso 2 GB en las variantes mas comprimidas.
- GPU recomendadas: RTX 4090, A100 y H100 para servir el modelo en BF16 con vLLM y decodificacion especulativa a maxima concurrencia; RTX 3060, RTX 4060, RTX 2060 o GTX 1650 para los tiers GGUF en local.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada moderna y en muchas integradas, con las variantes Compact-33pc o inferiores. Las variantes Fidelity-48pc y Precision-42pc tambien caben con holgura en GPUs de 8 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama y derivados para los GGUF; vLLM para el modelo objetivo en BF16 junto al draft DSpark en decodificacion especulativa; tambien es compatible con la libreria transformers segun el campo `library_name`.
- Latencia y throughput: no disponible. El unico dato operativo conocido es la configuracion de decodificacion especulativa con `num_speculative_tokens=7` y muestreo greedy del draft para paridad sin perdida con el objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Soulfate24/MiniCPM5-2B-DSpark-Paretrix | 2,52B | 131K (segun fuente secundaria) | GGUF + safetensors | Apache 2.0 | Tiers Paretrix con metricas PPL/KLD por tier; incluye draft DSpark |
| openbmb/MiniCPM5-2B | 2,52B | no disponible en la informacion | safetensors | Apache 2.0 (heredada) | Modelo base denso; SOTA declarado en la clase 2B de OpenBMB |
| openbmb/MiniCPM5-2B-DSpark | 2,52B + draft | no disponible | safetensors | Apache 2.0 (heredada) | Variante con checkpoint draft de decodificacion especulativa, sin cuantizar |
| openbmb/MiniCPM5-1B | no disponible | no disponible | no disponible | no disponible | Primer modelo de la serie MiniCPM5, misma receta de entrenamiento a menor escala |
| Soulfate24/MiniCPM5-2B-DSpark-ASHQ1-Remix-GGUF | 2,52B | no disponible | GGUF | Apache 2.0 (heredada) | Cuantizaciones alternativas del mismo autor bajo otra receta (ASHQ1 Remix) |

No se dispone de datos de rendimiento comparativo entre estas variantes mas alla de la tabla de calidad de cuantizacion del propio autor.

## Limitaciones y advertencias

- Sesgos: no se documentan analisis de sesgo en la informacion disponible. Al entrenarse principalmente con corpus en ingles y chino (Ultra-FineWeb y derivados), es previsible un sesgo de representacion hacia esos dominios.
- Alucinacion: al ser un modelo de 2B parametros, la tasa de alucinacion en tareas de conocimiento factual sera superior a la de modelos grandes. ThinkLLM advierte explicitamente de que no igualara a modelos mayores en razonamiento complejo.
- Limitaciones de idioma: solo se declaran ingles y chino. El rendimiento en castellano no esta verificado y probablemente sea degradado.
- Limitaciones de contexto: la ventana de 131K tokens proviene de una fuente secundaria y no esta confirmada en la model card; conviene validarla antes de disenar un sistema que dependa de ella. Ademas, la calidad de recuperacion en ventanas muy largas no esta medida.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datasets de OpenBMB antes de un despliegue en produccion, ya que la ficha no reproduce los terminos completos.
- Degradacion por cuantizacion: los tiers agresivos conllevan perdidas medibles. Femto-21pc incrementa la PPL en +3,3582 y el KLD hasta 0,2918, con una caida del top-p al 73,9%. No son adecuados para tareas sensibles a la fidelidad de la distribucion.
- Naturaleza del repositorio: se trata de una publicacion de terceros (Soulfate24) sobre un modelo de OpenBMB. Los datos de calidad de la tabla los genera el propio autor y no han sido replicados de forma independiente hasta la fecha. El repositorio no registra descargas ni likes en el momento de la consulta.
- Decodificacion especulativa: la paridad sin perdida con el modelo objetivo se declara para muestreo greedy del draft a temperatura cero; con otros metodos de muestreo del draft no se garantiza esa equivalencia.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/Soulfate24/MiniCPM5-2B-DSpark-Paretrix
- Suite de cuantizacion Paretrix: https://huggingface.co/Soulfate24/Paretrix_Quantization_Suite
- Cuantizaciones alternativas del mismo autor: https://huggingface.co/Soulfate24/MiniCPM5-2B-DSpark-ASHQ1-Remix-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Checkpoint draft DSpark: https://huggingface.co/openbmb/MiniCPM5-2B-DSpark
- Repositorio GitHub de OpenBMB MiniCPM: https://github.com/OpenBMB/MiniCPM
- Benchmark de servicio con vLLM y DSpark en Spark Arena: https://spark-arena.com/benchmark/sub1788851012419
- Ficha divulgativa en ThinkLLM: https://thinkllm.dev/models/minicpm5-2b-dspark
