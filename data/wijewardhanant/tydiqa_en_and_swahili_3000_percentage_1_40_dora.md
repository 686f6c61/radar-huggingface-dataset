# WijewardhanaNT/tydiqa_en_and_swahili_3000_percentage_1_40_DoRA

## Resumen

Este repositorio contiene un adaptador de ajuste fino eficiente en parametros (PEFT) entrenado sobre el modelo base meta-llama/Llama-3.1-8B. El identificador del repositorio, `tydiqa_en_and_swahili_3000_percentage_1_40_DoRA`, sugiere que el ajuste se ha realizado sobre el conjunto de datos TyDiQA, restringido a los idiomas ingles y suajili, con un subconjunto de 3000 ejemplos y algun tipo de fraccionamiento de datos entre el 1 % y el 40 %. Ninguna de estas inferencias esta confirmada por la model card, que se publica como plantilla sin rellenar: todos los campos de descripcion, uso previsto, datos de entrenamiento y evaluacion aparecen como "[More Information Needed]".

El modelo tiene relevancia limitada como artefacto de produccion, pero es un ejemplo tipico de los adaptadores de bajo rango que circulan por HuggingFace para investigacion en procesamiento de lenguaje natural de bajos recursos. TyDiQA es una referencia consolidada para respuesta a preguntas extractiva en lenguas tipologicamente diversas, y el suajili es una de las lenguas con menos recursos cubiertas por el benchmark. El adaptador esta etiquetado como `lora` en los tags y como `DoRA` en el nombre, sin que la model card aclare cual de las dos tecnicas se aplico finalmente.

El repositorio ocupa 0,1 GB, registra 6 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (22 de septiembre de 2026, fecha que no es coherente con el calendario actual y conviene tratar como dato no fiable). No hay licencia declarada, ni idiomas declarados, ni resultados de evaluacion.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (DoRA o LoRA, segun nombre y tags, sin confirmar) sobre un transformer decoder-only: Llama 3.1 8B |
| Parametros totales | No disponible para el adaptador. El modelo base tiene 8.030 millones de parametros |
| Parametros activos | No aplica: el modelo base no es de tipo MoE |
| Longitud de contexto | No disponible para el adaptador. El modelo base soporta 128.000 tokens |
| Tipos de cuantizacion | No disponible para el adaptador, que se publica en safetensors. El modelo base admite cuantizacion a 8 y 4 bits mediante bitsandbytes, GPTQ, AWQ o GGUF |
| Idiomas soportados | No disponible en la model card. El identificador del repositorio sugiere ingles y suajili |
| Licencia | No disponible. El modelo base se distribuye bajo la Llama 3.1 Community License |
| Formato de pesos | safetensors (pesos de adaptador PEFT, no pesos completos) |

## Arquitectura y entrenamiento

La unica informacion tecnica verificable es que se trata de un adaptador PEFT compatible con la libreria `peft` (version 0.17.1 citada en la model card) y que el modelo base es Llama 3.1 8B, un transformer decoder-only con atencion agrupada por consultas (GQA), normalizacion RMSNorm, activacion SwiGLU y codificacion posicional RoPE. El ajuste por adaptadores congela los pesos del modelo base e introduce matrices de bajo rango entrenables, lo que reduce el coste de entrenamiento a una fraccion del de un ajuste completo.

No hay informacion sobre el rango de las matrices, el valor de alpha, las capas objetivo, el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se documentan hiperparametros (tasa de aprendizaje, precision, regimen de entrenamiento). La diferencia entre DoRA (descomposicion del peso en magnitud y direccion, arXiv:2402.09353) y LoRA estandar no se puede confirmar: el nombre del repositorio indica DoRA y los tags indican `lora`. La etiqueta `arxiv:1910.09700` que aparece en los tags corresponde al articulo de Lacoste et al. sobre estimacion de emisiones de carbono, citado en la plantilla de la model card, y no a un articulo del modelo.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base Llama 3.1 8B.
- Respuesta a preguntas extractiva (span extraction) sobre pasajes, si el ajuste se ha realizado efectivamente sobre TyDiQA como sugiere el nombre. No confirmado por el autor.
- Cobertura potencial de ingles y suajili, deducida exclusivamente del identificador del repositorio.
- Capacidades multilingues del modelo base: Llama 3.1 esta entrenado oficialmente en ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes. El suajili no figura entre los idiomas soportados oficialmente, por lo que la cobertura en esa lengua depende enteramente del ajuste.
- Soporte de tool calling y function calling: no documentado para este adaptador. El modelo base lo soporta, pero un ajuste sobre datos de QA extractiva puede degradar esa capacidad.
- Modo de razonamiento explicito, vision o audio: no disponible.
- Comportamiento agente o razonamiento multi-paso: no documentado.

## Casos de uso

- Investigacion en adaptadores de bajo rango: el repositorio sirve para reproducir experimentos sobre el efecto del tamano del subconjunto de datos (el "1_40" del nombre) en el rendimiento de un adaptador. Es util precisamente por ser un artefacto pequeno y aislado del modelo base.
- Respuesta a preguntas extractiva en ingles: si el ajuste es el que sugiere el nombre, el adaptador puede integrarse sobre Llama 3.1 8B para localizar respuestas dentro de un pasaje de contexto, con el coste de almacenamiento minimo que implica un adaptador de menos de 0,1 GB.
- Procesamiento de lenguaje natural para suajili: el suajili es una de las lenguas con menos recursos de TyDiQA. Un adaptador de este tipo puede servir de punto de partida para sistemas de consulta documental en esa lengua, siempre que se valide el rendimiento real antes de cualquier despliegue.
- Experimentos academicos de comparacion LoRA frente a DoRA: el autor puede estar comparando ambas tecnicas con el mismo conjunto de datos. El repositorio permitiria, en teoria, contrastar variantes si existieran los demas adaptadores de la serie.
- Base para un ajuste posterior de tarea especifica: al ser un adaptador ligero, puede combinarse con otros adaptadores o servir de inicializacion para un ajuste adicional en dominios concretos (legal, sanitario, administracion publica) en ingles.
- Prototipado con recursos limitados: el adaptador se puede cargar sobre una instancia cuantizada del modelo base en una GPU de consumo, lo que permite evaluar rapidamente si el ajuste aporta valor antes de invertir en un ajuste completo.
- Auditoria y docencia: el repositorio es un caso de estudio sobre model cards incompletas: plantilla sin rellenar, licencia ausente y ausencia total de evaluacion, util para ilustrar buenas y malas practicas de publicacion en HuggingFace.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la seccion "Evaluation" con todos los campos marcados como "[More Information Needed]": no hay datos de TyDiQA (F1, exact match), MMLU, HumanEval, GSM8K ni de ninguna otra tarea. Tampoco hay resultados de comparacion frente a LoRA estandar o frente al modelo base sin ajustar.

## Requisitos de hardware

- Peso del adaptador: menos de 0,1 GB en safetensors, segun el tamano del repositorio. Es despreciable frente al modelo base.
- VRAM para el modelo base completo en bf16/fp16: aproximadamente 16 GB de pesos, mas cache KV. Con 128.000 tokens de contexto la cache KV puede anadir varias decenas de GB, por lo que en la practica se usan contextos mucho menores.
- VRAM en cuantizacion de 8 bits: en torno a 9-10 GB.
- VRAM en cuantizacion de 4 bits (GPTQ, AWQ o bitsandbytes NF4): en torno a 5-6 GB.
- GPU de consumo: cabe en una RTX 3090 o RTX 4090 (24 GB) sin cuantizacion y en una RTX 3060 de 12 GB o RTX 4070 con cuantizacion de 4 bits. En GPUs de 8 GB solo con cuantizacion agresiva y contextos cortos.
- GPU de centro de datos: A100 40/80 GB, H100 80 GB o L40S para servicio concurrente. No se requiere hardware de gama alta exclusivamente por el adaptador.
- Opciones de despliegue: transformers junto con peft (carga directa del adaptador), vLLM con soporte de LoRA, TGI con adaptadores, o fusion del adaptador en los pesos base y posterior conversion a GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este adaptador, por lo que la comparacion solo puede ser estructural. Se incluyen alternativas de la misma categoria (adaptadores PEFT sobre Llama 3.1 8B o modelos de QA multilingue).

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Evidencia de rendimiento |
|---|---|---|---|---|---|
| WijewardhanaNT/tydiqa_en_and_swahili_3000_percentage_1_40_DoRA | Adaptador sobre 8.030 M | No disponible (base: 128.000) | No disponible | 6 descargas, 0 likes | Ninguna publicada |
| meta-llama/Llama-3.1-8B (sin ajustar) | 8.030 M | 128.000 tokens | Llama 3.1 Community License | Amplia, millones de descargas | Model card oficial con evaluaciones |
| Adaptadores LoRA comunitarios sobre Llama 3.1 8B | Variable, tipicamente 10-200 M | Heredado del base | Variable segun autor | Muy variable | Habitualmente escasa o nula |
| mT5 / modelos especificos para TyDiQA | 300 M - 13.000 M | 512-1.024 tokens | Apache 2.0 en la mayoria de variantes | Repositorios academicos y checkpoints publicos | Si, resultados en el articulo de TyDiQA |

La comparativa relevante para un desarrollador es frente al modelo base sin ajustar: sin resultados de evaluacion, no hay forma de justificar el uso del adaptador en lugar de Llama 3.1 8B directo o de un ajuste completo verificable.

## Limitaciones y advertencias

- Model card practicamente vacia: no hay descripcion, uso previsto, datos de entrenamiento, hiperparametros, evaluacion ni limitaciones declaradas por el autor.
- Licencia no declarada: sin licencia explicita, el uso comercial es juridicamente incierto. Ademas, el modelo deriva de Llama 3.1, por lo que hereda las restricciones de la Llama 3.1 Community License (incluida la clausula de licencia adicional para productos con mas de 700 millones de usuarios mensuales) y requiere conservar las atribuciones correspondientes.
- Idiomas no declarados: la cobertura en suajili es una inferencia a partir del nombre del repositorio, no un dato confirmado.
- Riesgo de alucinacion: en tareas extractivas, el modelo puede generar respuestas plausibles que no aparecen en el pasaje de contexto. No se ha evaluado este comportamiento.
- Riesgo de sobreajuste: si el ajuste se ha hecho con solo 3000 ejemplos, el adaptador puede degradar capacidades generales del modelo base (conversacion, codigo, tool calling) sin haberlas medido.
- Coherencia de metadatos dudosa: el pipeline declarado es `text-generation` mientras que TyDiQA es una tarea de respuesta a preguntas extractiva; el nombre indica DoRA y los tags indican `lora`; la fecha de creacion (2026-09-22) no es verificable. Tratar los metadatos con cautela.
- Adopcion marginal: 6 descargas y 0 likes indican que el modelo no ha sido validado por la comunidad.
- Sin garantia de reproducibilidad: no se especifican versiones de librerias mas alla de PEFT 0.17.1, ni semillas, ni el commit del modelo base.
- La busqueda web realizada no devolvio ninguna fuente relevante sobre este modelo: los resultados obtenidos eran enlaces de Google Maps sin relacion con el repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/WijewardhanaNT/tydiqa_en_and_swahili_3000_percentage_1_40_DoRA
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Repositorio PEFT: https://github.com/huggingface/peft
- Articulo de TyDiQA (Clark et al., 2020): https://arxiv.org/abs/2003.05002
- Repositorio del dataset TyDiQA: https://github.com/google-research-datasets/tydiqa
- Articulo de DoRA (Liu et al., 2024): https://arxiv.org/abs/2402.09353
- Articulo de LoRA (Hu et al., 2021): https://arxiv.org/abs/2106.09685
- Articulo citado en la plantilla, sobre emisiones de carbono (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
