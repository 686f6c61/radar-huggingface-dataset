# vonvonhero/Ornith-1.5-35B-A3B-Uncensored-OpenVINO-INT8

## Resumen

Ornith-1.5-35B-A3B-Uncensored-OpenVINO-INT8 es una conversión a formato OpenVINO IR con cuantización INT8 de una variante "uncensored" del modelo base ornith-ai/Ornith-1.5-35B-A3B, realizada por el usuario vonvonhero. El modelo base pertenece a la familia Ornith, desarrollada por ornith-ai, una serie de modelos de mezcla de expertos (MoE) orientados a tareas de agente y auto-mejora. Esta variante concreta se exportó como un modelo de visión-lenguaje basado en la arquitectura Qwen3.5, por lo que admite entradas de imagen y texto, aunque también puede usarse solo con texto.

La relevancia de esta conversión radica en que permite ejecutar el modelo en entornos Intel mediante OpenVINO GenAI, con un peso reducido a 32,83 GiB gracias a la cuantización INT8, y en que la variante "uncensored" presenta una tasa de rechazo muy baja en benchmarks de jailbreak y daño, lo que la hace interesante para investigación en seguridad de IA. El modelo tiene 35 mil millones de parámetros totales con 3 mil millones activos, lo que facilita su despliegue en hardware con memoria limitada. La licencia es MIT, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) basada en Qwen3.5, multimodal (vision-lenguaje) |
| Parametros totales | 35B (segun nomenclatura del modelo) |
| Parametros activos | 3B (segun nomenclatura y analisis de MindStudio) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (OpenVINO IR); tambien existe version GGUF del mismo autor |
| Idiomas soportados | no disponible (la model card muestra un ejemplo en japones, pero no se especifica lista) |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (tambien disponible en GGUF) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un MoE con 35B parametros totales y 3B activos, construido sobre la arquitectura Qwen3.5 (segun las etiquetas `qwen3_5_moe`). Es un modelo multimodal que procesa imagenes y texto, y esta disenado para tareas de agente: segun el repositorio de ornith-ai, la familia Ornith se centra en un bucle de auto-mejora de extremo a extremo donde el modelo propone nuevas tareas, genera andamiajes especificos de tarea y produce rollouts de soluciones para aprendizaje por refuerzo.

La variante "uncensored" es un fine-tuning del modelo base que reduce significativamente los rechazos ante peticiones potencialmente daninas, como reflejan los benchmarks de jailbreak y harm. La conversion a OpenVINO INT8 fue realizada por vonvonhero, que exporto el modelo como un IR de OpenVINO compatible con la libreria `openvino_genai`. No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens procesados ni las tecnicas de alineacion utilizadas (RLHF, DPO, etc.).

## Capacidades

- Generacion de texto y conversacion multimodal: acepta entradas de imagen y texto, y produce respuestas de texto.
- Razonamiento: la etiqueta `reasoning` sugiere capacidad de razonamiento paso a paso, aunque no se detalla en la documentacion.
- Tareas de agente: el modelo base esta disenado para proposito general de agente, incluyendo planificacion y ejecucion de tareas con herramientas.
- Modo "uncensored": presenta una tasa de rechazo muy baja en benchmarks de jailbreak (96,0% ASR) y harm (97,5% ASR), lo que indica que responde a practicamente cualquier peticion sin negarse.
- Soporte de tool calling: no confirmado explicitamente, pero el modelo base esta orientado a agentes, por lo que es probable que lo soporte.
- Multilingue: no confirmado; el ejemplo de uso de la model card esta en japones, pero no hay una lista oficial de idiomas.

## Casos de uso

- Despliegue local de un asistente conversacional en entornos Intel: gracias al formato OpenVINO INT8, el modelo puede ejecutarse en CPU o GPU Intel con la libreria `openvino_genai`, lo que permite montar un chatbot local sin depender de servicios en la nube.
- Prototipado rapido de aplicaciones multimodales: al aceptar imagenes y texto, se puede usar para construir demos de analisis de imagenes con descripcion en lenguaje natural, por ejemplo, para clasificar fotografias o extraer informacion de documentos escaneados.
- Investigacion en seguridad de IA: la variante "uncensored" es util para estudiar comportamientos de jailbreak y evaluar la robustez de los clasificadores de contenido, ya que sus altas tasas de ASR permiten probar sistemas de moderacion.
- Tareas de agente en entornos con recursos limitados: al tener solo 3B parametros activos, el modelo puede ejecutar flujos de agente (planificacion, llamada a herramientas) en hardware modesto, como una GPU de consumo o incluso CPU con suficiente RAM.
- Generacion de contenido creativo sin restricciones: para aplicaciones donde se requiere una salida sin filtros de seguridad, como escritura de ficcion o generacion de dialogos para juegos, este modelo ofrece respuestas sin rechazos.
- Evaluacion comparativa de cuantizaciones: al existir tambien una version GGUF del mismo autor, se puede comparar el rendimiento y la calidad entre formatos OpenVINO INT8 y GGUF en diferentes backends (llama.cpp, Ollama, etc.).

## Benchmarks y rendimiento

La model card proporciona los siguientes resultados de evaluacion para la variante OpenVINO INT8:

| Benchmark | Resultado |
|---|---|
| JailbreakBench ASR | 96/100 (96,0%) |
| HarmBench ASR (159 comportamientos estandar) | 155/159 (97,5%) |

La tasa de ataque exitoso (ASR) mas alta indica menos rechazos. La evaluacion se realizo con razonamiento desactivado, temperatura 0, semilla 42, limite de 256 tokens de salida y el clasificador `HarmBench-Llama-2-13b-cls`. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- Tamano del archivo IR: 32,83 GiB (segun la model card), por lo que se necesitan al menos 33 GB de memoria libre para cargar los pesos en RAM o VRAM.
- Al ser un MoE con 3B parametros activos, la memoria necesaria para la inferencia efectiva puede ser menor que la de un modelo denso de 35B, pero no se dispone de datos concretos de VRAM.
- GPU recomendadas: el blog de MindStudio indica que el modelo base se ejecuta en una A100; para esta variante OpenVINO, se recomienda hardware Intel con soporte OpenVINO (CPU, GPU integrada o discreta).
- Opciones de despliegue: OpenVINO GenAI (usando `VLMPipeline`), y para la version GGUF, backends como llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (base) | 35B | 3B | no disponible | MIT | safetensors (original) |
| Ornith-1.5-35B-A3B-Uncensored-OpenVINO-INT8 (este) | 35B | 3B | no disponible | MIT | OpenVINO IR (INT8) |
| Ornith-1.5-35B-A3B-Uncensored-GGUF | 35B | 3B | no disponible | MIT | GGUF |

No se dispone de datos de rendimiento comparativo entre estas variantes. El modelo base y sus derivados comparten la misma arquitectura y parametros; la diferencia principal radica en el formato de pesos y el fine-tuning "uncensored".

## Limitaciones y advertencias

- Al ser una variante "uncensored", el modelo puede generar contenido danino, ilegal o inapropiado sin filtros. No es adecuado para despliegue en produccion sin una capa de moderacion externa.
- No se han evaluado sesgos, alucinaciones ni calidad general en tareas estandar (MMLU, HumanEval, etc.), por lo que su rendimiento en dichas tareas es desconocido.
- La longitud de contexto no esta documentada; se desconoce si soporta ventanas largas o si sufre degradacion con contextos extensos.
- Los idiomas soportados no estan especificados; aunque el ejemplo de uso es en japones, no hay garantia de calidad en otros idiomas.
- Requiere OpenVINO 2026.3.x y OpenVINO GenAI 2026.3.x; versiones anteriores pueden no ser compatibles.
- La evaluacion de jailbreak y harm se realizo en condiciones especificas (temperatura 0, limite de tokens, etc.); los resultados pueden variar en otros entornos.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una publicacion reciente o poco validada por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vonvonhero/Ornith-1.5-35B-A3B-Uncensored-OpenVINO-INT8
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Version GGUF del mismo autor: https://huggingface.co/vonvonhero/Ornith-1.5-35B-A3B-Uncensored-GGUF
- Blog de MindStudio sobre despliegue local: https://www.mindstudio.ai/blog/ornith-1-5-35b-a3b-local-run
- Repositorio GitHub de Ornith: https://github.com/ornith-ai/Ornith-1
