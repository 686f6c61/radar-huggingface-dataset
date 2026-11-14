# yungisimon/Qwen2.5-1.5B-giri-msq-knn_k2_and_entity-ep1

## Resumen

yungisimon/Qwen2.5-1.5B-giri-msq-knn_k2_and_entity-ep1 es un ajuste fino completo del modelo Qwen2.5-1.5B-Instruct, desarrollado por el usuario yungisimon, concebido como **modelo de memoria** entrenado sobre pares sinteticos de pregunta-respuesta derivados del dataset MuSiQue. El objetivo es que el modelo aprenda a recuperar y consolidar informacion procedente de multiples documentos, una tarea de razonamiento multi-salto que los modelos conversacionales genericos abordan con dificultad cuando el contexto es largo o la evidencia esta fragmentada.

El checkpoint publicado corresponde a la epoca 1 de 3 de un proceso de fine-tuning completo (no LoRA ni adaptadores), realizado con FSDP sobre 8 aceleradores AMD Instinct MI325X. Los pesos estan en bf16 safetensors y se cargan con `transformers` convencional mediante `AutoModelForCausalLM.from_pretrained`, usando la plantilla de chat de Qwen.

Es relevante ahora por dos motivos: primero, demuestra que es viable un fine-tuning completo de un modelo de 1.500 millones de parametros en menos de dos horas de reloj con hardware AMD, lo que abarata experimentos de adaptacion a dominios especificos; segundo, explora la linea de "modelos de memoria" para QA multi-documento, un nicho con pocas alternativas publicas de tamano pequeno y licencia permisiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), segun el modelo base Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.096 tokens usados como longitud maxima de secuencia durante el entrenamiento; la ventana nativa del modelo base no se especifica en la informacion disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos bf16 safetensors) |
| Idiomas soportados | no disponible (no declarados en la model card ni en los tags) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only denso de aproximadamente 1.540 millones de parametros con licencia Apache 2.0. El ajuste es un fine-tuning completo con FSDP, no un entrenamiento parametro-eficiente: los 1.543.714.304 parametros (100,00 %) son entrenables. Se uso precision bf16, checkpointing de gradientes y calculo de perdida exclusivamente sobre los tokens del asistente, lo que concentra el aprendizaje en las respuestas y evita que el modelo memorice las preguntas del usuario.

Los datos de entrenamiento proceden de un fichero sintetico derivado de MuSiQue (`msq_subset1000_numsamplingepochs1_knn2_doc_dedup_and_entity_maxdf3_crossdoc_entity_combination_v3.json`) con 1.725.751 ejemplos. La estrategia de construccion de pares se denomina `knn_k2_and_entity`: vecinos mas cercanos con k=2, deduplicacion de documentos y agrupacion por entidad con frecuencia documental maxima de 3, seguida de combinacion de entidades entre documentos. El entrenamiento uso batch efectivo de 256 (32 por dispositivo, 1 acumulacion, 8 GPU), tasa de aprendizaje constante de 2e-05 con warmup del 5 %, weight decay 0,01, norma maxima de gradiente 1,0, longitud maxima de 8.096 tokens y 3 epocas, de las cuales este checkpoint es la primera. El coste total de las 3 epocas fue de 1,76 horas de reloj (14,1 GPU-hora).

## Capacidades

- Generacion de texto conversacional con la plantilla de chat de Qwen.
- Razonamiento de memoria multi-documento: recuperacion de evidencia distribuida entre varios pasajes y consolidacion en una respuesta unica.
- Pregunta-respuesta extractiva y abstractiva sobre contextos sinteticos derivados de MuSiQue.
- Deduplicacion implicita de informacion repetida entre documentos, efecto directo del metodo de construccion de datos.
- Agrupacion de evidencia por entidad, lo que favorece respuestas que distinguen entidades homonimas o relacionadas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada (el modelo base lo soporta, pero no se verifica en este checkpoint).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada; el entrenamiento apunta a multi-salto de recuperacion, no a uso de herramientas.
- Capacidades multilingues: no disponibles; los idiomas no estan declarados.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Pregunta-respuesta sobre corpus documental fragmentado: el modelo se usaria con pasajes recuperados por un sistema RAG y responderia combinando evidencia de varios documentos, que es exactamente la distribucion de entrenamiento (combinacion de entidades entre documentos).
- Consolidacion de actas y notas de reunion: dado un conjunto de transcripciones parciales, el modelo puede agregar acuerdos y responsables deduplicando menciones repetidas, gracias al filtrado por frecuencia documental aplicado en los datos.
- Resolucion de preguntas con entidades ambiguas: al haberse entrenado con agrupacion por entidad, resulta adecuado para distinguir personas, organizaciones o productos con nombres parecidos dentro de un mismo contexto.
- Extraccion de hechos de documentacion tecnica: integraria informacion de manuales, changelogs e issues para responder consultas concretas, con contexto de hasta 8.096 tokens por inferencia.
- Preprocesado de datasets de QA sintetico: puede usarse como generador de pares adicionales en pipelines de aumentacion, dado que ya ha visto 1,7 millones de ejemplos de este formato.
- Despliegue en entornos con GPU de consumo: con 1.500 millones de parametros, es candidato para prototipos de memoria documental en una sola GPU, siempre que se valide su calidad fuera del dominio MuSiQue.
- Evaluacion comparativa de estrategias de memoria: sirve como linea base pequena y reproducible (Apache 2.0) frente a modelos mayores en experimentos academicos sobre QA multi-salto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (MuSiQue, MMLU, HumanEval, GSM8K u otras) para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,1 GB solo para pesos, mas KV cache y activaciones; en la practica entre 4 y 6 GB segun longitud de contexto y batch.
- VRAM estimada con cuantizacion de 8 bits: alrededor de 1,6 GB para pesos; con 4 bits, cerca de 0,8 GB. Estas cifras son estimaciones por tamano, no valores publicados por el autor.
- GPU recomendadas: A100, H100 o MI325X para entrenamiento e inferencia a gran escala; RTX 4090, RTX 3090 o L40S sobradas para inferencia de una sola instancia.
- Cabe en GPU de consumo: si, incluidas RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB y RTX 4070, incluso en bf16 con contexto moderado.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained` (formato publicado), TGI (el tag `text-generation-inference` esta presente), y conversiones a GGUF para llama.cpp u Ollama, que no estan publicadas en el repositorio.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-1.5B-giri-msq-knn_k2_and_entity-ep1 | 1.543.714.304 | 8.096 tokens de entrenamiento | Fine-tune de memoria para QA multi-documento | Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| Qwen/Qwen2.5-1.5B-Instruct (modelo base) | ~1.540 millones | ventana nativa de Qwen2.5 (no verificada en esta ficha) | Chat generalista | Apache 2.0 | Hugging Face, ampliamente distribuido |
| Qwen/Qwen2.5-7B-Instruct | ~7.600 millones | ventana nativa de Qwen2.5 (no verificada en esta ficha) | Chat generalista de mayor tamano | Apache 2.0 | Hugging Face, ampliamente distribuido |

No se conocen en la informacion proporcionada otros fine-tunes publicos de "modelo de memoria" sobre MuSiQue con los que establecer una comparacion directa de rendimiento. Las cifras de parametros del modelo base y de Qwen2.5-7B-Instruct son aproximadas y no proceden de la documentacion consultada.

## Limitaciones y advertencias

- El checkpoint corresponde a la epoca 1 de 3; el autor no publica los checkpoints de las epocas 2 y 3 ni indica cual es el mejor, por lo que la calidad final puede diferir.
- El entrenamiento se realizo exclusivamente sobre pares sinteticos derivados de MuSiQue; el rendimiento fuera de ese dominio (QA abierto, codigo, matematicas, conversacion general) no esta evaluado y probablemente se degrada respecto al modelo base.
- No hay benchmarks publicados: cualquier uso en produccion exige una evaluacion propia antes de desplegar.
- Riesgo de alucinacion: al ser un modelo de 1.500 millones ajustado para consolidar evidencia, puede generar respuestas plausibles que no esten respaldadas por los pasajes de entrada; se recomienda verificacion contra las fuentes.
- Idiomas no declarados: no se especifica si el ajuste conserva el multilingueismo del modelo base; en castellano el comportamiento es desconocido.
- Ventana de contexto: la longitud maxima usada en entrenamiento es 8.096 tokens; entradas significativamente mas largas quedan fuera de la distribucion vista durante el ajuste.
- Licencia Apache 2.0, permisiva para uso comercial, pero sin garantias por parte del autor; el modelo base Qwen2.5-1.5B-Instruct tambien es Apache 2.0.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion externa.
- La model card esta mayoritariamente en ingles y no documenta sesgos conocidos, datos de preentrenamiento ni procesos de RLHF/DPO posteriores al ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-1.5B-giri-msq-knn_k2_and_entity-ep1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset de referencia MuSiQue: no disponible en la informacion proporcionada
- Paper de MuSiQue: no disponible en la informacion proporcionada
- Repositorio de codigo o demo: no disponible en la informacion proporcionada
