# tocsa/atlas-dpo

## Resumen

Atlas-dpo es un modelo de lenguaje derivado de nvidia/Mistral-NeMo-Minitron-8B-Instruct y ajustado mediante DPO (Direct Preference Optimization) para una tarea muy concreta de triaje de soporte al cliente. El modelo recibe un ticket entrante y devuelve tres salidas estructuradas: una categoria, un nivel de urgencia y un borrador corto de respuesta. Atlas es un producto SaaS ficticio de gestion de proyectos, de modo que todo el dominio es sintetico y forma parte de un ejercicio academico (capstone) del taller de NVIDIA "Adding New Knowledge to LLMs".

El interes del artefacto no esta en su rendimiento como modelo generalista, sino en que documenta un pipeline completo de personalizacion de un LLM sobre un dominio nuevo: evaluacion del comportamiento objetivo, generacion de datos sinteticos, curacion, SFT con LoRA, servicio y evaluacion con vLLM, y una etapa final de DPO con NeMo RL. El modelo publicado es la politica DPO final, entrenada a partir del modelo SFT fusionado, con el objetivo de optimizar el estilo de la respuesta sin degradar la capacidad de clasificacion aprendida en la fase de SFT.

Se trata de un artefacto educativo, no revisado para uso en produccion, con licencia no declarada en el repositorio y con un unico fichero de pesos en formato PyTorch de 31,3 GB, coherente con una serializacion en float32 para un modelo de aproximadamente 8 000 millones de parametros. No se han publicado metricas cuantitativas de evaluacion mas alla de la existencia de un fichero `dpo_eval.json` con n=12 y sin valores recogidos en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (MistralForCausalLM), derivada de nvidia/Mistral-NeMo-Minitron-8B-Instruct |
| Parametros totales | aproximadamente 8 000 millones (inferido del nombre del modelo base; no declarado explicitamente en el repositorio) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos sin cuantizar. No se publican versiones GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | no disponible; la model card esta en ingles y los ejemplos del dominio (tickets del SaaS ficticio Atlas) estan en ingles |
| Licencia | no disponible; el repositorio no declara licencia |
| Formato de pesos | `pytorch_model.bin` (serializacion PyTorch, 31,3 GB). No se publican safetensors |
| Ficheros adicionales | `chat_template.jinja` (397 B), `config.json` (702 B), `generation_config.json` (111 B), `special_tokens_map.json` (414 B), `tokenizer.json` (8,8 MB), `tokenizer_config.json` (173,4 KB) |
| Tamano del repositorio | 33,7 GB |
| Fecha de creacion | 2026-10-02 |
| Ultima actualizacion | 2026-10-02 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de tipo Mistral (`MistralForCausalLM`), heredado de nvidia/Mistral-NeMo-Minitron-8B-Instruct. El repositorio no documenta cambios estructurales, ni atencion lineal, ni decodificacion especulativa, ni ninguna innovacion de arquitectura propia. El unico ajuste es de comportamiento, no de topologia.

El entrenamiento sigue el patron Meridian aplicado de extremo a extremo: definicion de la tarea (taxonomia, esquema de salida y criterios de exito), evaluacion del comportamiento objetivo con vLLM, evidencia de la brecha frente al modelo base y frente al techo de in-context learning, generacion de datos sinteticos con NeMo Data Designer, curacion con NeMo Curator, SFT con LoRA mediante NeMo AutoModel y PEFT, servicio y evaluacion comparativa de etapas con vLLM, y finalmente DPO con NeMo RL partiendo del modelo SFT fusionado. La model card indica que los datos de entrenamiento de esta ejecucion fueron generados sinteticamente con NeMo Data Designer y/o curados durante los ejercicios del taller; no se especifica numero de tokens, composicion del dataset, ni proporcion de datos de preferencia empleados en la fase DPO.

El resultado publicado es la politica DPO final. El objetivo declarado de esa etapa es optimizar el estilo de la respuesta redactada preservando el comportamiento de clasificacion obtenido en el SFT, es decir, un ajuste de preferencias orientado a la forma del borrador sin sacrificar la exactitud de categoria y urgencia.

## Capacidades

- Triaje de tickets de soporte: clasificacion en una categoria del esquema definido en el taller.
- Asignacion de nivel de urgencia al ticket entrante.
- Generacion de un borrador corto de respuesta al cliente, ajustado por preferencias mediante DPO.
- Salida estructurada con tres campos (categoria, urgencia, respuesta), orientada a su consumo por un sistema posterior.
- Capacidad de clasificacion preservada deliberadamente desde la etapa SFT, segun la model card.
- Generacion de texto generalista: heredada del modelo base nvidia/Mistral-NeMo-Minitron-8B-Instruct, aunque no se documenta su evaluacion tras el ajuste.
- Tool calling / function calling: no documentado en la informacion proporcionada.
- Comportamiento agentico o razonamiento multi-paso: no documentado.
- Modo de razonamiento explicito (thinking mode): no documentado.
- Vision o audio: no soportado segun la informacion disponible (el modelo base es texto).
- Capacidades multilingues: no documentadas.

## Casos de uso

- Triaje automatico de la bandeja de entrada de soporte: el modelo lee cada ticket y devuelve categoria y urgencia en una sola pasada, lo que permite etiquetar grandes volumenes de tickets sin intervencion humana en el primer nivel.
- Enrutado a equipos especializados: usando la categoria devuelta, un orquestador puede dirigir el ticket al equipo de facturacion, integraciones, permisos o cualquier otra cola definida en la taxonomia.
- Priorizacion de colas por urgencia: el campo de urgencia permite ordenar la cola de trabajo y garantizar que los tickets criticos se atiendan antes, siempre que se valide previamente la calibracion del modelo en el dominio real.
- Borrador asistido para agentes humanos: el texto generado se presenta al agente como punto de partida editable, reduciendo el tiempo medio de primera respuesta. El ajuste DPO esta orientado precisamente a mejorar este campo.
- Anotacion a escala para analitica de producto: las categorias producidas sobre historicos de tickets permiten construir series temporales de incidencias por area y alimentar cuadros de mando internos.
- Generacion de datos etiquetados para reentrenamiento: el propio modelo puede usarse como anotador auxiliar en un ciclo de mejora continua, con revision humana posterior de una muestra.
- Docencia y estudio de pipelines de personalizacion: al ser un artefacto de taller, sirve como ejemplo reproducible de la secuencia eval, SDG, SFT y DPO aplicada a un dominio nuevo.
- Linea base de comparacion en experimentos academicos: permite medir cuanto aporta la etapa DPO sobre el modelo SFT fusionado del que parte, siempre que se disponga de un conjunto de evaluacion propio, ya que el repositorio no publica uno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio unicamente referencia un fichero `dpo_eval.json` con `n: 12`, sin que la model card incluya valores de metrica, conjunto de evaluacion, ni comparacion contra el modelo base o el modelo SFT. No es posible, por tanto, presentar una tabla de MMLU, HumanEval, GSM8K ni de exactitud de clasificacion.

## Requisitos de hardware

- Pesos publicados en `pytorch_model.bin` de 31,3 GB, coherente con una serializacion en float32 de un modelo de aproximadamente 8 000 millones de parametros. Cargar los pesos tal cual exige del orden de 32 GB de VRAM solo para el modelo, mas el overhead de activaciones y cache KV: en la practica, GPU de 40 GB o 80 GB (A100 40GB/80GB, H100) para inferencia comoda en fp32.
- Conversion a bf16 o fp16: reduce el peso a aproximadamente 16 GB, lo que permite ejecucion en una RTX 4090 (24 GB), L40S (48 GB), A10 (24 GB) o L4 (24 GB) con margen para contexto moderado.
- Cuantizacion a 8 bits: alrededor de 8-9 GB, viable en RTX 3090, RTX 4080, RTX 4070 Ti y tarjetas de 12 GB o mas con contexto corto.
- Cuantizacion a 4 bits: alrededor de 5-6 GB, viable en GPU de consumo de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, portatiles con RTX 4070) y en CPU con llama.cpp, a costa de perdida de calidad no medida en este repositorio.
- No cabe en GPU de consumo en su formato original fp32; si cabe en GPU de consumo tras conversion a bf16 o cuantizacion.
- Despliegue: la model card cita vLLM como herramienta de servicio y evaluacion del taller. Tambien es compatible con Transformers y con TGI. Para llama.cpp u Ollama seria necesario convertir previamente los pesos a GGUF, ya que el repositorio no publica artefactos GGUF.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tiempo a primer token, tokens por segundo ni numero de peticiones concurrentes soportadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato de pesos | Notas |
|---|---|---|---|---|---|
| tocsa/atlas-dpo | aprox. 8 000 millones | no disponible | no disponible | pytorch_model.bin | Politica DPO especializada en triaje de tickets de un dominio sintetico; artefacto educativo |
| nvidia/Mistral-NeMo-Minitron-8B-Instruct | aprox. 8 000 millones | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible | Modelo base declarado del que parte Atlas; capacidad generalista de instrucciones |
| Modelo SFT intermedio del taller (fusionado, no publicado) | aprox. 8 000 millones | no disponible | no disponible | no disponible | Etapa previa al DPO; sirve como referencia interna, pero no esta publicado en el repositorio |
| Alternativas instruct de rango 7-9B del ecosistema abierto | no disponible | no disponible | no disponible | no disponible | La informacion proporcionada no incluye ningun benchmark ni comparativa con modelos de la misma categoria, por lo que no es posible establecer una comparacion cuantitativa |

No se dispone de datos de rendimiento comparado en la informacion proporcionada. Cualquier comparacion con modelos de tamano similar (por ejemplo, instruct de 7 a 9 000 millones de parametros) requeriria una evaluacion propia sobre un conjunto de tickets etiquetados, que este repositorio no incluye.

## Limitaciones y advertencias

- Artefacto educativo: la propia model card indica explicitamente que no ha sido revisado para uso en produccion.
- Dominio sintetico: Atlas es un SaaS ficticio y los datos de entrenamiento fueron generados sinteticamente con NeMo Data Designer y/o curados en ejercicios de taller. El comportamiento sobre tickets reales de una empresa concreta no esta garantizado.
- Evaluacion insuficiente: el unico artefacto de evaluacion referenciado es `dpo_eval.json` con n=12 y sin valores publicados. Doce ejemplos no permiten estimar de forma fiable la exactitud de clasificacion ni la calidad del texto generado.
- Licencia no declarada: el repositorio no incluye licencia, lo que impide determinar si se permite el uso comercial. Ademas, al derivar de un modelo base de terceros, habria que revisar tambien las condiciones de ese modelo.
- Riesgo de alucinacion: el modelo genera borradores de respuesta al cliente, un escenario donde una afirmacion incorrecta (plazos, estados de cuenta, condiciones) puede tener consecuencias directas. Se requiere revision humana y, preferiblemente, anclaje a una base de conocimiento.
- Deriva de formato: al ser un modelo de lenguaje generando una salida pseudoestructurada (categoria, urgencia, respuesta) y no un clasificador con cabeza dedicada, puede producir categorias fuera de la taxonomia o urgencias mal calibradas. Es imprescindible validar la salida contra un esquema antes de consumirla.
- Sesgos: no se ha publicado ningun analisis de sesgo, y los datos sinteticos pueden heredar los sesgos del generador o del modelo docente empleado en la fase de generacion.
- Idiomas: no se documenta soporte multilingue. Es probable que el ajuste se haya realizado unicamente en ingles, dado el contenido de la model card, pero esto no se afirma explicitamente en la informacion disponible.
- Contexto: la longitud de contexto efectiva no se declara en el repositorio, por lo que no puede planificarse el tratamiento de tickets con hilos de conversacion largos sin verificacion previa.
- Formato de pesos: la ausencia de safetensors y de cuantizaciones oficiales anade trabajo de conversion y despliegue, y complica el uso en entornos que exigen pesos en formato seguro.
- Cache KV y memoria: en fp32, la ventana de contexto practica esta muy limitada por la memoria disponible, dado que el modelo ya ocupa mas de 31 GB antes de cargar el tokenizador y las activaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tocsa/atlas-dpo
- Modelo base declarado: https://huggingface.co/nvidia/Mistral-NeMo-Minitron-8B-Instruct
- vLLM, herramienta de servicio y evaluacion citada en la model card: https://github.com/vllm-project/vllm
- NeMo Data Designer, generacion de datos sinteticos citada en la model card: https://github.com/NVIDIA-NeMo/DataDesigner
- NeMo Curator, curacion de datos citada en la model card: https://github.com/NVIDIA-NeMo/Curator
- NeMo RL, herramienta de la etapa DPO citada en la model card: https://github.com/NVIDIA-NeMo/RL
- PEFT, libreria de LoRA citada en la model card: https://github.com/huggingface/peft

No se han proporcionado papers, blogs, repositorios propios, demos ni Spaces asociados a este modelo mas alla de la propia model card y de las herramientas del ecosistema NVIDIA y Hugging Face citadas por el autor.
