# turintech/GLM-5.2-MaxMin108-GGUF

## Resumen

GLM-5.2-MaxMin108-GGUF es una versión comprimida del modelo GLM-5.2 de Z.ai, desarrollada por turintech mediante poda de expertos y cuantización a formato GGUF. El modelo original es un MoE de 753B parámetros (según la model card) con 256 expertos enrutados por capa; esta variante conserva únicamente 108 de esos expertos por capa, seleccionados con un criterio max-min fair sobre diez dominios de texto. El resultado es un artefacto de aproximadamente 100 GiB que cabe en una NVIDIA GB10 Spark con 128 GB de memoria unificada, algo que el modelo completo no permite.

La relevancia de este modelo es doble: demuestra que un modelo de escala frontera puede reducirse para ejecutarse en hardware de escritorio, y documenta un método de selección de expertos que, según los benchmarks publicados, iguala a alternativas como REAP-50 en MMLU con un 59% del tamaño. Sin embargo, la compresión tiene un coste claro: pierde 24.29 puntos de MMLU respecto al modelo padre (87.29 → 63.00) y su capacidad de generación de código se degrada notablemente. No es un sustituto del modelo completo, sino una opción para entornos con restricciones severas de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), 256 expertos enrutados por capa, podados a 108 |
| Parametros totales | 324.832.039.332 (324,8B) en safetensors; el modelo base GLM-5.2 tiene 753B |
| Parametros activos | No disponible (el modelo base tiene 40B activos; la poda modifica este valor, pero no se ha publicado) |
| Longitud de contexto | No especificada en la variante; el modelo base soporta hasta 1M de tokens |
| Tipos de cuantizacion | IQ2_M (2.650 bpw) e IQ2_M-fast (2.530 bpw) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (con shards de 6 archivos) |

## Arquitectura y entrenamiento

El modelo es una variante cuantizada y podada de GLM-5.2, un transformer con arquitectura de mezcla de expertos (MoE). El proceso de compresion consistio en dos pasos: primero, se seleccionaron 108 de los 256 expertos enrutados de cada capa mediante un criterio max-min fair aplicado sobre diez dominios de texto, eliminando los expertos menos relevantes para cada dominio. Segundo, los tensores resultantes se cuantizaron a formato GGUF con precision de 2.65 bits por peso (variante IQ2_M) o 2.53 bits (variante fast). La diferencia entre ambas variantes radica exclusivamente en la precision de los tensores no expertos (proyecciones de atencion y experto compartido); los tensores de los expertos son identicos entre ellas.

No se ha publicado informacion sobre los datos de entrenamiento del modelo base ni sobre el proceso de entrenamiento de la poda (si hubo fine-tuning posterior o solo seleccion estatica). La model card indica que los benchmarks se ejecutaron sobre el artefacto final sin recalibracion adicional. La seleccion de expertos se realizo sobre corpus de texto de diez dominios, pero no se detallan cuales son.

## Capacidades

- Generacion de texto: produce texto coherente y fluido en ingles, con capacidad de razonamiento basico evidenciada por resultados en MMLU.
- Conocimiento factual: alcanza un 63.00 en MMLU (5-shot, 14.042 preguntas), un nivel comparable al de modelos de ~120B en cuantizacion 4-bit, aunque muy por debajo del modelo padre (87.29).
- Generacion de codigo: obtiene un pass@1 de 0.626 en MBPP (3-shot, 500 problemas), conservando el 88.2% de la capacidad del padre. La poda afecta menos al codigo procedural que al conocimiento declarativo.
- Razonamiento multilingue: solo se ha verificado en ingles; no hay evidencia de capacidades en otros idiomas.
- No se ha confirmado soporte para tool calling, function calling ni modos de agente en esta variante, aunque el modelo base los incluye. La model card no los menciona.

## Casos de uso

- Ejecucion local en hardware de 128 GB: el caso principal es desplegar un modelo de gran tamano en una NVIDIA GB10 Spark o similar, donde el modelo completo no cabe. Permite experimentar con MoE de escala frontera en un entorno de escritorio.
- Prototipado y pruebas de concepto: para desarrolladores que necesitan validar flujos de generacion de texto o codigo con un modelo de alta capacidad pero sin acceso a infraestructura cloud, esta variante ofrece una via de entrada con requisitos de memoria reducidos.
- Investigacion en poda de expertos: el artefacto sirve como referencia para estudiar el impacto de la seleccion de expertos en el rendimiento, ya que se documentan metodos y resultados comparativos con REAP-50.
- Generacion de codigo en entornos con restricciones de memoria: aunque su rendimiento en MBPP es inferior al del padre, sigue siendo util para tareas de autocompletado o generacion de funciones cortas donde el modelo base no es viable por memoria.
- Analisis de perplejidad y calidad de generacion: se puede utilizar para evaluar como afecta la cuantizacion extrema (2.65 bpw) a la coherencia y degeneracion del texto, especialmente en modos de decodificacion greedy.
- Despliegue en edge computing: al caber en un solo dispositivo con memoria unificada, es candidato para aplicaciones de inferencia en el borde, aunque con la advertencia de que la latencia (8.24 tok/s en GB10) es baja para produccion.

## Benchmarks y rendimiento

Los datos siguientes fueron medidos por el autor del modelo en las mismas maquinas y harness para todos los modelos comparados, segun la model card.

### MMLU (lm-evaluation-harness, `mmlu_generative`, 5-shot, 14.042 preguntas)

| Modelo | Tamano | MMLU | Humanidades | Ciencias sociales | STEM | Otros |
|---|---:|---:|---:|---:|---:|---:|
| GLM-5.2 UD-IQ2_M (padre) | 222.18 GiB | **87.29** ±0.27 | 83.44 | 91.84 | 87.03 | 88.86 |
| REAP-50 Q3_K_M | 169.30 GiB | 62.75 ±0.39 | 63.63 | 66.85 | 62.26 | 57.84 |
| **MaxMin108** | 100.32 GiB | **63.00** ±0.39 | 62.74 | 68.61 | 59.25 | 61.67 |
| **MaxMin108-fast** | 95.77 GiB | 61.84 ±0.40 | 62.64 | 67.57 | 57.82 | 59.06 |

### MBPP (3-shot, 500 problemas, pass@1, codigo ejecutado)

| Modelo | Tamano | pass@1 | Retencion vs padre |
|---|---:|---:|---:|
| Padre | 222.18 GiB | **0.710** ±0.020 | — |
| REAP-50 Q3_K_M | 169.30 GiB | 0.708 ±0.020 | 99.7% |
| **MaxMin108** | 100.32 GiB | 0.626 ±0.022 | 88.2% |
| **MaxMin108-fast** | 95.77 GiB | 0.592 ±0.022 | 83.4% |

### Perplejidad (llama-perplexity, `-c 4096 --chunks 32`, corpus held-out)

| Modelo | PPL codigo | Ratio | PPL general | Ratio |
|---|---:|---:|---:|---:|
| Padre | 2.1401 | 1.000 | 3.7753 | 1.000 |
| REAP-50 Q3_K_M | 2.4217 | 1.132 | 6.5462 | 1.734 |
| **MaxMin108** | 2.7751 | 1.297 | 6.2115 | **1.645** |
| **MaxMin108-fast** | 2.8260 | 1.321 | 6.2790 | 1.663 |

### Calidad de generacion (13 prompts congelados, decodificacion greedy)

| Modelo | In-domain | Out-of-domain | OOD distinct-4 |
|---|---|---:|---:|
| Padre | 0/8 | 0/5 | 0.991 |
| REAP-50 Q3_K_M | 0/8 | 1/5 | 0.883 |
| **MaxMin108** | 0/8 | 0/5 | 0.855 (0.996 muestreado) |
| **MaxMin108-fast** | 0/8 | 0/5 | 0.984 |

### Velocidad (llama-bench, llama.cpp build b10005, `-p 512 -n 128 -ngl 99 -fa 1 -ctk q8_0 -ctv q8_0 -r 3`, en 1× GB10 Spark)

| Modelo | Decode (tg128) | Prefill (pp512) | Residente @ 64K ctx |
|---|---:|---:|---:|
| MaxMin108 | 8.24 ±0.02 tok/s | 244.12 (dato incompleto en la model card) | No especificado |

## Requisitos de hardware

- VRAM estimada: el archivo IQ2_M ocupa 100.32 GiB, por lo que se necesita al menos esa cantidad de memoria disponible. La variante fast ocupa 95.77 GiB.
- GPU recomendada: NVIDIA GB10 Spark con 128 GB de memoria unificada (es la plataforma de referencia en las pruebas del autor). No cabe en GPUs de consumo (RTX 4090 tiene 24 GB, RTX 5090 tiene 32 GB).
- No se han publicado datos de rendimiento en otras GPUs (A100, H100, etc.). Dado el tamaño, se requeririan multiples GPUs o una con al menos 100 GB de VRAM.
- Opciones de despliegue: llama.cpp es el runtime utilizado en las pruebas; tambien es compatible con otros motores que soporten GGUF (Ollama, llama-cpp-python). No se menciona soporte para vLLM o TGI en esta variante.
- Latencia: en GB10, decode a 8.24 tok/s y prefill a 244.12 tok/s (dato parcial). La variante fast es ~12-14% mas rapida en decode.

## Comparativa con modelos similares

| Modelo | Tamano | Contexto | MMLU | MBPP | Licencia | Formato |
|---|---:|---:|---:|---:|---|---|
| **MaxMin108** | 100.32 GiB (324B totales) | No especificado | 63.00 | 0.626 | MIT | GGUF |
| REAP-50 Q3_K_M | 169.30 GiB | No especificado | 62.75 | 0.708 | No disponible | GGUF |
| GLM-5.2 UD-IQ2_M (padre) | 222.18 GiB (753B totales) | 1M (segun base) | 87.29 | 0.710 | MIT | GGUF |

MaxMin108 es un 59% del tamano de REAP-50, con un rendimiento estadisticamente equivalente en MMLU (diferencia de 0.25 puntos dentro del margen de error) pero inferior en MBPP (0.626 vs 0.708). Frente al padre, pierde 24.29 puntos de MMLU y 0.084 de MBPP, pero cabe en hardware que no puede ejecutar el modelo completo. La licencia MIT es mas permisiva que la de REAP-50 (no especificada).

## Limitaciones y advertencias

- Perdida significativa de conocimiento: el modelo pierde 24.29 puntos de MMLU respecto al padre (87.29 → 63.00), una caida del 27.8% relativo. Las respuestas factuales pueden ser fluidas pero incorrectas con alta confianza.
- Degradacion en codigo: el pass@1 en MBPP cae a 0.626, un 12% menos que el padre y un 11.6% menos que REAP-50. No es adecuado para tareas de generacion de codigo complejo en produccion.
- Perplejidad elevada: la perplejidad general es 1.645 veces la del padre, lo que indica una menor fluidez en texto libre. En codigo, la perplejidad empeora aun mas (1.297 veces).
- Riesgo de degeneracion: aunque en las pruebas de 13 prompts no se observaron outputs degenerados en greedy, la variante base muestra un distinct-4 de 0.855 (frente a 0.991 del padre), lo que sugiere mayor tendencia a la repeticion en ciertos contextos. La variante fast mejora este aspecto (0.984).
- Limitaciones de idioma: solo se ha verificado en ingles. No hay evidencia de rendimiento en otros idiomas.
- Contexto no confirmado: no se ha publicado la longitud de contexto maxima de esta variante. Aunque el modelo base soporta 1M, la poda y cuantizacion podrian afectar la capacidad de manejar contextos largos.
- Requisitos de memoria: requiere al menos 100 GB de memoria, lo que excluye la mayoria de hardware de consumo. No es un modelo para GPUs de gama media.
- Sin garantias de soporte: el repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un artefacto experimental sin mantenimiento activo.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/turintech/GLM-5.2-MaxMin108-GGUF
- Modelo base en HuggingFace: https://huggingface.co/zai-org/GLM-5.2
- Repositorio GitHub de GLM-5 (incluye GLM-5.2): https://github.com/zai-org/GLM-5
- Documentacion de Unsloth para GLM-5.2: https://unsloth.ai/docs/models/glm-5.2
- Guia de ejecucion local de GLM-5.2: https://insiderllm.com/guides/run-glm-5-2-locally/
- Variante GGUF de Unsloth: https://huggingface.co/unsloth/GLM-5.2-GGUF
