# WijewardhanaNT/tydiqa_en_and_bengali_3000_percentage_1_40_DoRA

## Resumen

Este repositorio contiene un adaptador de tipo DoRA (Weight-Decomposed Low-Rank Adaptation) entrenado sobre el modelo base meta-llama/Llama-3.1-8B, publicado por el usuario WijewardhanaNT. No se trata por tanto de un modelo completo, sino de pesos de adaptacion de bajo rango que deben cargarse sobre el checkpoint original de Llama 3.1 8B mediante la libreria PEFT (version 0.17.1 declarada en el repositorio). El tamano del repositorio es de 0,1 GB, coherente con un adaptador y no con un modelo de 8.000 millones de parametros.

El identificador del repositorio, `tydiqa_en_and_bengali_3000_percentage_1_40_DoRA`, sugiere que el ajuste se realizo sobre el corpus TyDiQA en ingles y bengali, con un subconjunto de 3000 ejemplos y algun esquema de seleccion de capas o de porcentaje de datos (1-40). Se trata de una interpretacion del nombre del repositorio, no de un dato confirmado: la model card no documenta ni el dataset, ni los hiperparametros, ni el procedimiento de entrenamiento.

La relevancia de esta ficha es limitada y conviene ser explicitos: con 8 descargas y 0 likes en el momento de la consulta, es un experimento academico o de prueba, sin model card completada (todos los campos estan como "[More Information Needed]"), sin licencia declarada y sin resultados de evaluacion publicados. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo: los enlaces recuperados corresponden a articulos en aleman sobre migrana ocular, sin conexion con el repositorio. Resulta util unicamente como ejemplo de adaptador DoRA sobre Llama 3.1 para tareas de question answering extractivo en un escenario bilingue ingles-bengali.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador DoRA (variante de LoRA con descomposicion de pesos) sobre transformer decoder denso (Llama 3.1 8B) |
| Parametros totales | No disponible para el adaptador (rango y alpha no documentados). Modelo base: 8.030 millones de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para el adaptador. Modelo base Llama 3.1 8B: 128.000 tokens |
| Tipos de cuantizacion | No disponible. El repositorio solo contiene pesos safetensors del adaptador; la cuantizacion del modelo base depende del runtime |
| Idiomas soportados | No disponible en la model card. El identificador del repositorio sugiere ingles y bengali |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT); el modelo base debe obtenerse por separado |
| Libreria | peft (framework declarado: PEFT 0.17.1), compatible con transformers |
| Modelo base | meta-llama/Llama-3.1-8B |
| Tamano del repositorio | 0,1 GB |
| Pipeline | text-generation |
| Descargas / likes | 8 / 0 |
| Fecha de creacion | 2026-09-22 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La unica informacion tecnica verificable es que se trata de un adaptador DoRA sobre Llama 3.1 8B, empaquetado con PEFT 0.17.1 y almacenado en safetensors. DoRA es una tecnica de ajuste eficiente de parametros que descompone la matriz de pesos preentrenada en un componente de magnitud y un componente de direccion, aplicando la actualizacion de bajo rango solo sobre este ultimo; en la practica se comporta como una generalizacion de LoRA y no modifica la arquitectura del transformer subyacente, por lo que la inferencia se realiza con el mismo grafo de atencion densa que Llama 3.1 8B.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset (el nombre apunta a TyDiQA, un benchmark de question answering multilingue con respuestas extractivas), la existencia de fases de RLHF o DPO, ni los hiperparametros del adaptador (rango, alpha, dropout, tasa de aprendizaje, epocas). La model card es la plantilla por defecto de HuggingFace sin rellenar, e incluye el enlace a la calculadora de impacto de carbono de Lacoste et al. (arXiv:1910.09700), que es el unico identificador arXiv presente en las etiquetas y no guarda relacion con el metodo de entrenamiento del modelo. El sufijo "percentage_1_40" del nombre podria referirse a un rango de capas o a un porcentaje del conjunto de datos, pero no hay documentacion que lo confirme.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base Llama 3.1 8B.
- Question answering extractivo y generativo, presumiblemente el objetivo del ajuste segun el nombre del repositorio (TyDiQA).
- Procesamiento bilingue ingles-bengali, segun la interpretacion del identificador; no confirmado por el autor.
- Razonamiento basico y conocimiento general, limitados a lo preservado por el ajuste de bajo rango sobre el modelo base.
- Soporte de tool calling y function calling: no documentado para este adaptador; el modelo base Llama 3.1 lo soporta, pero no hay evidencia de que el ajuste lo preserve o lo mejore.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multimodales (vision, audio): no disponibles; Llama 3.1 8B es exclusivamente de texto.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidad multilingue fuera de ingles y bengali: no documentada.

## Casos de uso

- Evaluacion academica de tecnicas DoRA: el repositorio sirve como punto de partida reproducible para comparar DoRA frente a LoRA clasico en una tarea de QA extractivo sobre un subconjunto pequeno de TyDiQA, midiendo Exact Match y F1 antes y despues del ajuste.
- Question answering sobre documentos en bengali: un sistema de recuperacion aumentada (RAG) que recupere pasajes de una base documental en bengali y use el adaptador para extraer la respuesta, aprovechando la ventana de 128.000 tokens del modelo base para concatenar varios pasajes.
- Atencion al cliente bilingue en mercados de India y Bangladesh: despliegue de un asistente que responde en ingles y bengali sobre una base de conocimiento cerrada, con el adaptador como capa especifica de dominio sobre un Llama 3.1 8B compartido.
- Prototipado rapido con recursos limitados: al ocupar 0,1 GB, el adaptador permite cambiar de tarea sobre una misma instancia del modelo base servida en vLLM con soporte de LoRA, sin duplicar los 16 GB de pesos completos por cada caso de uso.
- Investigacion sobre seleccion de capas en PEFT: el sufijo "percentage_1_40" sugiere un experimento de ajuste parcial; el repositorio puede usarse como referencia en estudios sobre que capas contribuyen mas a tareas de QA multilingue.
- Fine-tuning incremental con presupuesto bajo: partiendo de este adaptador, un equipo puede continuar el entrenamiento con datos propios de un dominio concreto (legal, sanitario) en una unica GPU de 24 GB, en lugar de reentrenar el modelo completo.

Advertencia: al no existir evaluacion publicada, ninguno de estos casos de uso esta respaldado por metricas. Cualquier despliegue en produccion exigiria una validacion propia previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye la seccion de evaluacion y el autor no aporta cifras de Exact Match, F1 ni de ningun otro metrico sobre TyDiQA ni sobre benchmarks generales (MMLU, GSM8K, HumanEval). Tampoco se dispone de comparaciones frente al modelo base sin ajustar, por lo que no es posible determinar si el adaptador mejora, mantiene o degrada el rendimiento original.

## Requisitos de hardware

- El adaptador en si ocupa 0,1 GB, pero requiere cargar el modelo base Llama 3.1 8B completo para funcionar.
- VRAM estimada para el modelo base en bf16/fp16: en torno a 16 GB de pesos, mas overhead de activaciones y cache KV; con contexto largo (128.000 tokens) la cache KV puede superar con holgura los 16 GB adicionales.
- VRAM estimada en cuantizacion de 4 bits (GPTQ, AWQ, bitsandbytes NF4): aproximadamente 5-6 GB de pesos, mas cache KV.
- GPU consumer: viable en RTX 4090 (24 GB) y RTX 3090 (24 GB) con cuantizacion de 4 bits o 8 bits; en bf16 completo es ajustado en 24 GB si se usan contextos largos. En GPUs de 12-16 GB solo con cuantizacion agresiva y contextos recortados.
- GPU de datacenter: A100 40/80 GB, H100 80 GB y L40S 48 GB para despliegue en bf16 con concurrencia alta.
- Opciones de despliegue: transformers + peft (ruta mas directa para cargar el adaptador), vLLM con soporte de LoRA, TGI con adaptadores, y conversion manual a GGUF si se desea usar llama.cpp u Ollama (requiere fusionar el adaptador con el modelo base y convertir, ya que estos runtimes no cargan adaptadores PEFT directamente).
- Latencia y throughput: no disponibles. No hay datos de tok/s publicados para este adaptador.

## Comparativa con modelos similares

No se dispone de resultados de evaluacion de este adaptador. La comparativa se limita a caracteristicas estructurales, y los datos del modelo base proceden de la documentacion publica de Meta, no de este repositorio.

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| WijewardhanaNT/tydiqa_en_and_bengali_3000_percentage_1_40_DoRA | Adaptador DoRA sobre 8B (rango no disponible) | No disponible (base: 128k) | safetensors PEFT | No disponible | Sin benchmarks publicados, 8 descargas |
| meta-llama/Llama-3.1-8B (base) | 8.030 M | 128k | safetensors | Llama 3.1 Community License | Modelo denso de referencia, sin ajuste de QA |
| Adaptadores LoRA sobre Llama 3.1 8B para QA extractivo | Variable (tipicamente 0,05-0,5 GB) | Heredado del base | safetensors PEFT | Depende del autor | Alternativa metodologica directa a DoRA; comparacion cuantitativa no disponible |
| Modelos especializados en QA multilingue de tamano similar | No disponible | No disponible | No disponible | No disponible | No se identifican alternativas equivalentes en la informacion proporcionada |

No es posible establecer una comparacion de rendimiento fiable sin resultados de evaluacion, ni de este modelo ni de alternativas directas evaluadas sobre el mismo subconjunto de TyDiQA.

## Limitaciones y advertencias

- Ausencia total de model card: todos los campos estan sin rellenar ("[More Information Needed]"), incluidos desarrollador, tipo de modelo, datos de entrenamiento y evaluacion.
- Licencia no declarada: esto impide determinar si el uso comercial esta permitido. Ademas, al derivar de Llama 3.1 8B, el adaptador queda sujeto en la practica a la Llama 3.1 Community License, que impone condiciones de atribucion y una clausula de uso aceptable.
- Sin benchmarks: no hay ninguna evidencia publicada de que el ajuste mejore el modelo base; es posible que lo degrade por sobreajuste a un conjunto de solo 3000 ejemplos.
- Riesgo de alucinacion: heredado de Llama 3.1 8B y potencialmente agravado si el ajuste se ha realizado sobre un unico dataset de QA extractivo, que puede inducir al modelo a generar respuestas con formato de respuesta corta incluso cuando no existe evidencia en el contexto.
- Cobertura idiomatica desconocida: aunque el nombre apunta a ingles y bengali, no hay confirmacion del autor ni evaluacion de fluidez o correccion en bengali.
- Sesgos: no documentados. El corpus TyDiQA tiene sesgos propios de la Wikipedia y de los anotadores del benchmark, que se trasladarian al adaptador en la medida en que el ajuste haya utilizado ese corpus.
- Trazabilidad: el identificador "3000_percentage_1_40" no esta explicado, lo que dificulta reproducir el entrenamiento. Sin el rango del adaptador, el alpha, la tasa de aprendizaje ni el numero de epocas, la reproducibilidad es practicamente nula.
- Madurez: 8 descargas y 0 likes indican ausencia de validacion por parte de la comunidad. No debe considerarse un artefacto listo para produccion.
- Fecha de publicacion inusual en los metadatos (2026-09-22), que puede reflejar un error de reloj o de configuracion del repositorio.
- Resultados de busqueda web no pertinentes: los enlaces recuperados tratan sobre migrana ocular en aleman y no guardan ninguna relacion con el modelo, por lo que no aportan informacion adicional.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/WijewardhanaNT/tydiqa_en_and_bengali_3000_percentage_1_40_DoRA
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Libreria PEFT: https://huggingface.co/docs/peft/index
- Paper de la metrica de impacto de carbono citada en la plantilla de la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de machine learning: https://mlco2.github.io/impact

Nota: la busqueda web realizada no devolvio ningun enlace relacionado con este modelo. Los resultados obtenidos correspondian a articulos en aleman sobre migrana ocular (aok.de, artemiskliniken.de, eyelaser.at, gesundheits-doc.com, adac.de) y se han descartado por no ser pertinentes. No se dispone de paper, blog, demo ni repositorio de codigo asociados al adaptador.
