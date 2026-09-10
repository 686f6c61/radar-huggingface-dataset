# ukkathva/AdaptKey-Nemotron-30b-FP8

## Resumen

AdaptKey-Nemotron-30b-FP8 es una version cuantizada en FP8 del modelo AdaptKey/AdaptKey-Nemotron-30b, publicada por el usuario ukkathva en HuggingFace. Se trata de un modelo de lenguaje causal (Causal Language Model) orientado a generacion de texto en ingles, cuyo unico proposito declarado es reducir la huella de memoria y maximizar la velocidad de inferencia respecto al modelo base en FP16/BF16. La cuantizacion se ha realizado con `llmcompressor` de Neural Magic aplicando el esquema `FP8_DYNAMIC` a todas las capas `Linear`, dejando fuera la capa `lm_head` para preservar la maxima precision en la proyeccion de salida.

El modelo esta pensado para servirse con vLLM sobre GPUs con soporte de FP8 nativo, es decir, NVIDIA H100, A100 y la serie RTX 40. La nomenclatura del nombre sugiere un tamano de aproximadamente 30.000 millones de parametros, coherente con la familia Nemotron, aunque la model card no confirma el numero exacto de parametros, la longitud de contexto ni la composicion del dataset de entrenamiento del modelo original. Tampoco se especifica la licencia.

La relevancia de esta publicacion es practica mas que cientifica: es un ejemplo de flujo de trabajo de cuantizacion FP8 dinamica en el ecosistema vLLM, util para quien necesite desplegar un modelo de ~30B con menor coste de VRAM y mayor throughput. Hay que senalar que el repositorio no tiene descargas ni interacciones registradas y no incluye resultados de benchmarks, por lo que su calidad real frente al modelo base no esta verificada publicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal (segun model card: "Causal Language Model"); detalles especificos no disponibles |
| Parametros totales | no disponible (el nombre sugiere ~30B, sin confirmar) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 dynamic (esquema `FP8_DYNAMIC` de llmcompressor) en todas las capas `Linear`; `lm_head` sin cuantizar |
| Idiomas soportados | Ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors con configuracion de cuantizacion de llmcompressor/compressed-tensors (formato de salida estandar de la herramienta; no confirmado explicitamente en la model card) |

## Arquitectura y entrenamiento

La model card describe el modelo como un "Causal Language Model" y no aporta informacion sobre la arquitectura interna del modelo base AdaptKey/AdaptKey-Nemotron-30b: no se detalla si emplea atencion estandar, atencion lineal, mezcla de expertos (MoE) o algun esquema hibrido, ni se indican el numero de capas, dimensiones ocultas o cabezas de atencion. Tampoco se documentan los datos de entrenamiento (numero de tokens, composicion del corpus) ni si hubo fases de ajuste fino con RLHF, DPO u otras tecnicas de alineacion. Toda esta informacion queda fuera del alcance de la model card publicada y deberia consultarse en el repositorio del modelo base.

La innovacion tecnica que si esta documentada es el proceso de cuantizacion. Se aplico `llmcompressor` de Neural Magic con el esquema `FP8_DYNAMIC` a todas las capas `Linear`, lo que implica escalas de cuantizacion calculadas dinamicamente en tiempo de ejecucion por lote de activaciones, en lugar de fijarse a partir de un conjunto de calibracion estatico. La capa `lm_head` se excluyo deliberadamente de la cuantizacion para mantener la precision en la proyeccion final al vocabulario. El resultado es una reduccion aproximada del 50 % en el peso de los parametros respecto a FP16/BF16 y una aceleracion en GPUs con unidades FP8 nativas.

## Capacidades

- Generacion de texto en ingles como tarea principal declarada.
- Razonamiento y generacion de codigo: no confirmado explicitamente en la model card.
- Matematicas: no confirmado explicitamente en la model card.
- Vision: no disponible; no se menciona ninguna capacidad multimodal.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- Capacidad especial: inferencia en FP8 acelerada sobre hardware compatible (H100, A100, RTX 40) mediante vLLM.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Servicio de generacion de texto en ingles a gran escala: el modelo puede desplegarse con vLLM en un unico H100 o A100 de 80 GB, ofreciendo mayor throughput por GPU que la version en BF16 gracias a los kernels FP8 y a la reduccion de ancho de banda de memoria requerido por los pesos.
- Asistente conversacional de dominio general: al tratarse de un modelo causal de ~30B, es adecuado para dialogo multi-turno en ingles, siempre que se respete la ventana de contexto, cuyo tamano no esta documentado.
- Reduccion de coste de infraestructura en produccion: en escenarios donde ya se sirve el modelo base en BF16, esta version permite mantener un modelo por GPU de 80 GB o habilitar despliegues en GPUs de 48 GB como la RTX 6000 Ada, bajando el coste por token servido.
- Evaluacion y comparacion de tecnicas de cuantizacion FP8: el repositorio sirve como referencia reproducible para ingenieros que quieran medir la degradacion de calidad de `FP8_DYNAMIC` frente a BF16 en un modelo de ~30B, usando `llmcompressor` como herramienta.
- Backend de generacion para aplicaciones de检索... (no, evitar). Sustituir: Backend de generacion para aplicaciones internas de resumen y redaccion en ingles: con una latencia reducida y menor consumo de VRAM, encaja en servicios de resumen de documentos, reescritura y extraccion de informacion donde no se requiere una ventana de contexto muy larga.
- Investigacion academica con recursos limitados: al caber en una sola GPU profesional, permite a grupos sin clústeres grandes experimentar con un modelo de ~30B cuantizado sin necesidad de paralelismo tensorial.
- Fine-tuning posterior con QLoRA sobre pesos FP8: no esta confirmado que el formato de cuantizacion sea directamente compatible con librerias de entrenamiento como PEFT/bitsandbytes, por lo que este caso requiere validacion previa.

Nota: varios de estos casos asumen capacidades (contexto, tool calling, calidad en tareas concretas) que no estan documentadas en la informacion disponible y deben validarse empiricamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye mediciones de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, ni comparaciones cuantitativas de perplejidad o exactitud frente al modelo base en BF16. La busqueda web realizada no devolvio ningun resultado relevante (unicamente coincidencias sin relacion con el modelo). Por tanto, no es posible afirmar en que medida la cuantizacion FP8 afecta a la calidad del modelo original.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 30 GB solo para pesos si se asume un modelo de 30.000 millones de parametros en FP8 (1 byte por parametro). A ello hay que sumar la cache KV y los buffers de activaciones, por lo que un despliegue realista requiere del orden de 35-45 GB de VRAM, dependiendo de la longitud de contexto y del tamano de lote. Estimacion propia, no confirmada por el autor.
- GPU recomendadas: NVIDIA H100 (80 GB), A100 (80 GB). La model card menciona explicitamente H100, A100 y la serie RTX 40 como hardware compatible con FP8.
- A100 de 40 GB: probablemente suficiente para lotes pequenos y contextos cortos, aunque ajustado; requiere validacion.
- GPUs de consumo: una RTX 4090 o 4080 con 24 GB no puede alojar los pesos completos en memoria; seria necesario repartir el modelo entre varias GPUs, usar offload a CPU o recurrir a una cuantizacion adicional (por ejemplo, INT4 con GGUF), que no se distribuye en este repositorio.
- GPUs profesionales de 48 GB (RTX 6000 Ada, L40S) y 80 GB (H100, A100) son las opciones naturales.
- Opciones de despliegue: vLLM es la via recomendada y documentada por el autor. Otros motores compatibles con FP8, como TensorRT-LLM o SGLang, podrian funcionar, pero no estan confirmados en la model card. llama.cpp y Ollama no soportan de forma estandar el formato de cuantizacion FP8 de llmcompressor.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar con modelos alternativos verificados. La busqueda web no aporto resultados relevantes y la model card no incluye comparaciones. A continuacion se compara unicamente la version cuantizada con su modelo base.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ukkathva/AdaptKey-Nemotron-30b-FP8 | no disponible (~30B segun nombre) | no disponible | FP8 dynamic | no disponible | HuggingFace, 0 descargas |
| AdaptKey/AdaptKey-Nemotron-30b | no disponible (~30B segun nombre) | no disponible | BF16/FP16 (no confirmado) | no disponible | HuggingFace (repositorio del autor original) |
| Alternativas de ~30B en FP8 (por ejemplo, versiones FP8 de familias Llama, Qwen o Nemotron) | no disponible | no disponible | FP8 | no disponible | no disponible |

No se han identificado en la informacion proporcionada modelos comparables con datos verificables de parametros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- Repositorio sin traccion: 0 descargas y 0 "likes" en el momento de la consulta, sin validacion por parte de la comunidad.
- Licencia no especificada: la ausencia de licencia explicita impide determinar si el uso comercial esta permitido. Debe consultarse la licencia del modelo base AdaptKey/AdaptKey-Nemotron-30b antes de cualquier despliegue en produccion.
- Idioma: el modelo esta etiquetado unicamente como ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Perdida de calidad por cuantizacion: la cuantizacion FP8 reduce la precision numerica de los pesos y puede degradar tareas sensibles a la precision, como razonamiento matematico o generacion de codigo. No hay mediciones publicadas que cuantifiquen esa degradacion.
- `lm_head` sin cuantizar: aunque mejora la precision de salida, implica que el modelo no es homogeneamente FP8 y que las herramientas de estimacion de memoria deben tenerlo en cuenta.
- Compatibilidad de hardware limitada: FP8 nativo requiere H100, A100 o RTX 40; en GPUs anteriores la cuantizacion se emula o no se aprovecha, con perdida de rendimiento.
- Riesgo de alucinacion: inherente a los modelos generativos; no se ha publicado ninguna evaluacion de fidelidad factual ni de tasas de alucinacion.
- Sesgos: no hay informacion sobre la composicion del dataset de entrenamiento del modelo base, por lo que no es posible caracterizar los sesgos presentes.
- Contexto desconocido: al no documentarse la longitud de contexto, no se puede planificar el uso en tareas de contexto largo sin una prueba previa.
- Fecha de publicacion en el repositorio: 10 de septiembre de 2026, posterior a la fecha habitual de consulta; conviene verificar la vigencia y autenticidad del repositorio.
- Sin soporte declarado para tool calling, agentes o multimodalidad: cualquier integracion de este tipo requeriria prompts ad hoc y validacion.
- Model card minima: no incluye informacion sobre datos de entrenamiento, evaluaciones, limitaciones declaradas por el autor ni guia de uso responsable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ukkathva/AdaptKey-Nemotron-30b-FP8
- Modelo base: https://huggingface.co/AdaptKey/AdaptKey-Nemotron-30b
- Repositorio de llmcompressor (Neural Magic): https://github.com/neuralmagic/llmcompressor
- Repositorio de vLLM: https://github.com/vllm-project/vllm

La busqueda web realizada no devolvio ningun enlace adicional relevante (papers, blogs, demos o repositorios asociados a este modelo).
