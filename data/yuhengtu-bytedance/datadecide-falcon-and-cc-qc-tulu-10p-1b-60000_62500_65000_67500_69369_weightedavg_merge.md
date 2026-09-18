# yuhengtu-bytedance/DataDecide-falcon-and-cc-qc-tulu-10p-1B-60000_62500_65000_67500_69369_weightedavg_merge

## Resumen

Este repositorio contiene un modelo de lenguaje de 1.279.854.592 parametros (aproximadamente 1,28 mil millones) publicado por el usuario yuhengtu-bytedance. No es un modelo entrenado desde cero, sino el resultado de una fusion de puntos de control (checkpoint merge) generada con la herramienta mergekit mediante el metodo Linear, descrito en el articulo arXiv:2203.05482 (Model Soups). El resultado se distribuye en formato safetensors con pesos en bfloat16 y una etiqueta de arquitectura "llama".

El modelo combina cinco checkpoints de una misma ejecucion de entrenamiento, identificados como step60000, step62500, step65000, step67500 y step69369, todos ellos pertenecientes a una receta de datos denominada "falcon-and-cc-qc-tulu-10p" a escala 1B. La interpolacion se realiza con pesos crecientes (1, 2, 3, 4 y 5 respectivamente) y normalizacion activada, tomando el step69369 como modelo base. Este tipo de fusion se emplea habitualmente para suavizar la superficie de perdida y obtener un punto de control mas estable que cualquiera de los pasos individuales.

Es relevante en el contexto de la investigacion sobre mezclas de datos de preentrenamiento a escala pequena: el nombre del modelo sugiere que forma parte de una suite de experimentos de escalado de recetas de datos, donde se entrenan modelos de ~1B parametros con distintas composiciones del corpus para extrapolar que receta funciona mejor a mayor escala. No obstante, la model card no aporta informacion sobre la licencia, los idiomas, la longitud de contexto ni resultados de evaluacion, y el repositorio no tiene descargas ni interacciones registradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible de forma explicita; la etiqueta del repositorio indica "llama", compatible con un transformer decoder-only tipo Llama |
| Parametros totales | 1.279.854.592 (dato de los safetensors) |
| Parametros activos | No aplica: no es un modelo MoE segun la informacion disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se publican cuantizaciones oficiales; el repositorio solo contiene pesos en bfloat16 y, dada la etiqueta "llama", serian convertibles a GGUF, AWQ o GPTQ con herramientas estandar |
| Idiomas soportados | No disponibles; el nombre de la receta de datos sugiere corpus en ingles (falcon, common crawl, tulu), pero no se confirma |
| Licencia | No disponible |
| Formato de pesos | safetensors (dtype de salida bfloat16, fusion calculada en float32) |
| Tamano del repositorio | 2,6 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Fecha de creacion | 2026-09-17 |
| Ultima actualizacion | 2026-09-17 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna mas alla de la etiqueta "llama" y del pipeline de generacion de texto. Lo que si se detalla es el procedimiento de fusion: se parte de cinco checkpoints de una misma ejecucion de entrenamiento y se combinan linealmente sus pesos. La configuracion YAML declara el metodo `linear`, `normalize: true`, `dtype: float32` para el calculo y `out_dtype: bfloat16` para la salida. Los pesos asignados son 1 (step60000), 2 (step62500), 3 (step65000), 4 (step67500) y 5 (step69369), de modo que el checkpoint final de la ejecucion domina la media ponderada, mientras que los intermedios aportan un efecto de regularizacion.

No se indica el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. El nombre de la receta, "falcon-and-cc-qc-tulu-10p", apunta a una mezcla que combinaria datos tipo Falcon/RefinedWeb, Common Crawl, una version filtrada por calidad y el corpus Tulu, pero se trata de una inferencia a partir del identificador y no de un dato confirmado en la documentacion. La innovacion tecnica del repositorio es, por tanto, el propio ensamblado de checkpoints, no una arquitectura nueva.

## Capacidades

- Generacion de texto autoregresiva, segun el pipeline declarado (`text-generation`).
- Modelo base sin evidencia de ajuste por instrucciones: la model card no menciona chat template, fases de alineamiento ni formato conversacional.
- Capacidad multilingue: no disponible; no se documentan idiomas.
- Tool calling / function calling: no disponible, no se declara soporte.
- Uso en agentes y razonamiento multi-paso: no disponible, no se declara soporte.
- Capacidades de vision, audio o modo de razonamiento explicito (thinking): no disponibles.
- Compatibilidad declarada con text-generation-inference y con endpoints, gracias a las etiquetas `text-generation-inference` y `endpoints_compatible`.
- Es una instantanea de investigacion orientada a experimentos de mezcla de datos y de checkpoints, no un modelo listo para producto.

## Casos de uso

- Investigacion sobre interpolacion de checkpoints: permite estudiar como varia la perplejidad y la estabilidad al promediar pasos tardios de un mismo entrenamiento con pesos crecientes, comparando contra cada step individual.
- Reproduccion de experimentos de recetas de datos: sirve como uno de los puntos de la rejilla de mezclas "falcon-and-cc-qc-tulu-10p" para analizar el efecto de la composicion del corpus en un modelo de ~1B parametros.
- Baseline de bajo coste en estudios de escalado: al caber en una sola GPU de consumo, se puede usar como referencia en barridos de hiperparametros o de recetas antes de replicarlos a mayor escala.
- Generacion de texto sin ajuste (continuacion de secuencias): util para medir calidad de lenguaje y deriva distribucional de una mezcla de datos concreta sobre corpus de validacion propios.
- Evaluacion de tecnicas de despliegue: su tamano permite probar cuantizacion, motores de inferencia y estrategias de batching en un entorno controlado antes de trasladarlas a modelos mayores.
- Destilacion o inicializacion de modelos pequenos: puede actuar como punto de partida o profesor en experimentos de destilacion sobre tareas concretas, aunque requeriria un ajuste posterior.
- Auditoria de seguridad y sesgo a escala de laboratorio: su reducido coste computacional facilita analisis de sesgo sobre corpus especificos, siempre que se asuma que no ha pasado por alineamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra tarea, y la busqueda web realizada no ha devuelto fuentes relacionadas con este modelo.

## Requisitos de hardware

- VRAM para inferencia: los pesos en bfloat16 ocupan aproximadamente 2,6 GB, por lo que se necesitan del orden de 4 GB de VRAM teniendo en cuenta el cache KV y el overhead del runtime. En cuantizacion de 8 bits la huella baja a ~1,4 GB y en 4 bits a ~0,8 GB, aunque estas conversiones no se publican en el repositorio.
- GPU de consumo: cabe con holgura en una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080 y RTX 4090. Tambien es viable en GPUs de 8 GB si se usa cuantizacion.
- GPU de centro de datos: A100 (40/80 GB), H100, L40S y A10G son sobredimensionadas para el modelo, pero utiles para servir muchas instancias en paralelo.
- Opciones de despliegue: transformers de forma nativa; text-generation-inference, ya que el repositorio declara esa etiqueta; vLLM y SGLang para serving con batching; llama.cpp y Ollama mediante conversion previa a GGUF, conversión plausible dada la etiqueta "llama" pero no verificada.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia en ninguna GPU.

## Comparativa con modelos similares

Al no existir datos de rendimiento del modelo evaluado, la comparacion se limita a caracteristicas estructurales. Las cifras de los modelos alternativos proceden de sus respectivas model cards publicas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (merge DataDecide 1B) | 1,28 mil millones | No disponible | No disponible | Repositorio HF con 0 descargas; pesos solo en bf16 |
| Llama 3.2 1B | 1,24 mil millones | 128.000 tokens | Llama 3.2 Community License | Ampliamente distribuido, versiones instruct y base |
| Qwen2.5 1.5B | 1,54 mil millones | 32.768 tokens nativos (ampliable con YaRN) | Apache 2.0 | Ampliamente distribuido, con variantes cuantizadas |
| SmolLM2 1.7B | 1,7 mil millones | 8.192 tokens | Apache 2.0 | Distribucion amplia, orientado a dispositivos y edge |

Comparacion de rendimiento: no disponible para el modelo descrito, por lo que no es posible establecer una jerarquia frente a estas alternativas.

## Limitaciones y advertencias

- Licencia no especificada: sin terminos explicitos no hay autorizacion clara para uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Ausencia total de evaluaciones: no hay benchmarks ni analisis de calidad, por lo que no se puede estimar su rendimiento relativo.
- Modelo base sin alineamiento conocido: no se declara RLHF, DPO ni ajuste por instrucciones, de modo que puede generar contenido inapropiado, repetitivo o incoherente con la intencion del usuario.
- Riesgo de alucinacion propio de un modelo de 1B parametros entrenado sobre corpus web; la mezcla de checkpoints no corrige este comportamiento.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en secuencias largas ni estimar el consumo de cache KV.
- Idiomas no documentados: el uso en castellano no esta respaldado por ninguna declaracion del autor.
- Procedencia opaca: la configuracion de fusion referencia rutas absolutas de un sistema de archivos interno (`/opt/tiger/...`), por lo que los checkpoints de origen no son accesibles publicamente y la fusion no es reproducible tal cual.
- Sesgos: no hay analisis de sesgo ni de toxicidad; al derivar de corpus tipo Common Crawl y Falcon, es esperable heredar sesgos de esas fuentes.
- Validacion comunitaria nula: cero descargas y cero likes en el momento de la consulta, sin issues ni discusiones que permitan contrastar su comportamiento real.
- Idoneidad: se trata de un artefacto de investigacion, no de un modelo orientado a produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuhengtu-bytedance/DataDecide-falcon-and-cc-qc-tulu-10p-1B-60000_62500_65000_67500_69369_weightedavg_merge
- Model Soups (metodo de fusion lineal, arXiv:2203.05482): https://arxiv.org/abs/2203.05482
- Repositorio de mergekit: https://github.com/cg123/mergekit
- Documentacion de text-generation-inference: https://github.com/huggingface/text-generation-inference
- Documentacion de vLLM: https://github.com/vllm-project/vllm
- Documentacion de llama.cpp: https://github.com/ggml-org/llama.cpp
- Nota: la busqueda web realizada no ha devuelto ningun resultado relacionado con este modelo, su autoria o su receta de datos; los unicos enlaces utiles son los derivados de las etiquetas del repositorio.
