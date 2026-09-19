# Stage-org/4b-C-200-luna-8k-epoch3

## Resumen

Stage-org/4b-C-200-luna-8k-epoch3 es un modelo de 4.539 millones de parametros (4,54 B) publicado por el usuario Stage-org en HuggingFace. Se trata de un derivado del modelo base Qwen/Qwen3.5-4B sometido a un proceso de aprendizaje por refuerzo (RL) durante 10.000 pasos y 3 epocas sobre el dataset Stage-org/4b-C-200-luna-8k, que no esta descrito en la informacion disponible. El repositorio solo contiene pesos en formato safetensors (9,1 GB, compatible con pesos en bf16/fp16 sin estados de optimizador).

El interes tecnico del modelo no esta en sus capacidades declaradas —no hay model card descriptiva, ni benchmarks, ni evaluacion publicada— sino en que el autor ha publicado la configuracion completa del entrenamiento: metodo RL con DPPO (mascaras de enmascaramiento de probabilidad 0,2-0,28), group_size 8, learning rate 1e-6 con AdamW (betas 0.9/0.99), weight decay 0.0 y un juez automatico externo identificado como gpt-5.6-luna. La inferencia durante el entrenamiento se realizo con vLLM, con max_model_len de 65.536 tokens, parser de razonamiento qwen3, parser de tool calling qwen3_coder y modo thinking activado.

Es relevante ahora unicamente como artefacto de investigacion reproducible sobre recetas de RL post-entrenamiento en modelos densos pequenos. Con 1 descarga y 0 likes en el momento de la consulta, no existe validacion independiente de su calidad, y la ausencia de licencia y de idiomas declarados impide recomendarlo para uso comercial o en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base Qwen/Qwen3.5-4B; tag de HuggingFace: qwen3_5; se usa FlashAttention 2 en el entrenamiento) |
| Parametros totales | 4.539.265.536 (~4,54 B) |
| Parametros activos | No aplica (no se declara arquitectura MoE) |
| Longitud de contexto | 65.536 tokens en inferencia (max_model_len de vLLM); la configuracion del learner declara seq_len = 300.000 tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo incluye safetensors; no hay GGUF, AWQ ni GPTQ publicados) |
| Idiomas soportados | No disponible (no se declaran; el modelo base Qwen es multilingue, pero no hay confirmacion) |
| Licencia | No disponible (no se especifica en el repositorio) |
| Formato de pesos | safetensors (9,1 GB en el repositorio) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna mas alla del modelo base: Qwen/Qwen3.5-4B, etiquetado en HuggingFace con el tag qwen3_5. Por el tamano de pesos (4,54 B de parametros en 9,1 GB) se trata de un transformer denso con pesos en bf16 o fp16. La configuracion de entrenamiento especifica el uso de FlashAttention 2 y de pesos con carga "weights_only".

El entrenamiento es un ciclo de RL (learner.method = "rl") sobre el dataset Stage-org/4b-C-200-luna-8k, con 10.000 pasos, 3 epocas, batch_size 128 y group_size 8. El optimizador es AdamW con lr 1e-6, weight_decay 0.0, max_norm 1.0, betas (0.9, 0.99). La funcion de perdida usa un esquema DPPO con dppo_mask_low 0.2, dppo_mask_high 0.28, adv_tau 1.0 y kl_tau 0.001. La generacion durante el entrenamiento se hizo con temperatura 0.9, top_p 1.0, max_tokens 4096 y enable_thinking activado; el juez automatico (open_ended_judge) es un endpoint externo con el modelo gpt-5.6-luna, temperatura 1.0, reasoning_effort "medium", max_retries 3 y max_in_flight 32. La infraestructura declarada es de 2 GPUs por nodo (1 para inferencia, 1 para entrenamiento), vLLM en el puerto 7000 con gpu_memory_utilization 0.9 y hasta 256 rollouts en vuelo con max_off_policy_steps 8. El checkpoint se guarda cada 1000 (unidad "epoch") conservando solo el ultimo.

Como innovacion destacable solo puede senalarse la propia publicacion de la receta: el uso de un juez propietario (gpt-5.6-luna) para puntuar respuestas abiertas y la integracion de parsers especificos de razonamiento y tool calling durante la fase de RL.

## Capacidades

- Generacion de texto y razonamiento en modo thinking: la configuracion de generacion del entrenamiento activa enable_thinking con hasta 4096 tokens de salida, lo que indica que el modelo fue entrenado para producir cadenas de razonamiento explicitas.
- Tool calling / function calling: la configuracion de inferencia usa tool_call_parser = "qwen3_coder", lo que implica soporte previsto para llamadas a herramientas en vLLM.
- Razonamiento multi-paso orientado a agentes: los rollouts de RL con group_size 8 y hasta 256 en vuelo sugieren entrenamiento sobre tareas resueltas en varios pasos, aunque no se detalla la naturaleza de las tareas.
- Generacion de codigo: el parser de tool calling esta basado en la familia coder de Qwen, lo que apunta a uso en entornos de codigo, sin datos que lo confirmen.
- Procesamiento de contexto largo: la ventana configurada para inferencia es de 65.536 tokens.
- Capacidades multilingues: no disponibles; no se declaran idiomas y no hay evaluacion al respecto.
- Vision y audio: no disponibles; no se mencionan y la inferencia usa language_model_only = true.

## Casos de uso

- Estudio de recetas de RL post-entrenamiento: al publicarse la configuracion completa (DPPO, learning rate, group_size, juez), el modelo sirve como artefacto reproducible para analizar como afecta un ciclo de RL de 10.000 pasos a un modelo denso de 4 B. Es util precisamente porque el autor expone parametros que habitualmente no se publican.
- Comparacion de checkpoints por epoca: el nombre del repositorio ("epoch3") y la politica keep_last = 1 apuntan a una publicacion de checkpoints por epoca; comparar epoch1, epoch2 y epoch3 permite medir degradacion o mejora sin reentrenar.
- Prototipado de agentes con tool calling: con tool_call_parser qwen3_coder y reasoning_parser qwen3, puede desplegarse en vLLM como backend de un agente que encadene llamadas a funciones, siempre que se valide antes su fiabilidad real.
- Asistencia de codigo en local: con 4,54 B de parametros y pesos en safetensors, una conversion a 4 bits lo situa en el rango de 2,5-3 GB de VRAM, lo que permite ejecutarlo en un portatil con GPU para autocompletado y revision de fragmentos de codigo.
- Procesamiento de documentos largos: la ventana de 65.536 tokens en inferencia permite resumir o extraer informacion de expedientes extensos en una sola pasada, sin troceado previo. La calidad del resultado no esta medida.
- Entrenamiento de chatbots multi-turno para pruebas internas: su tamano permite desplegar una instancia dedicada en una unica GPU para validar flujos conversacionales antes de escalar a un modelo mayor.
- Punto de partida para SFT de dominio: al ser un modelo de 4 B, es viable aplicar LoRA sobre un corpus propio con una GPU de 24 GB, usando este checkpoint como inicializacion tras el RL.
- Baseline de evaluacion propio: dado que no existe ninguna evaluacion publicada, resulta adecuado como sujeto de pruebas para quien quiera medirlo con sus propios conjuntos (MMLU, GSM8K, HumanEval o similares) y compararlo con el Qwen3.5-4B original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye model card descriptiva, no declara metricas y no se han encontrado evaluaciones independientes en la busqueda web realizada (los resultados obtenidos corresponden a portales de ofertas de practicas y no guardan relacion con el modelo).

## Requisitos de hardware

- VRAM estimada para inferencia (pesos): ~9,1 GB en bf16/fp16 (coincide con el tamano del repositorio), ~4,6-5 GB en cuantizacion de 8 bits y ~2,5-3 GB en 4 bits. Las cifras de 8 y 4 bits son estimaciones a partir del numero de parametros; no hay cuantizaciones publicadas por el autor.
- Cache KV: con una ventana de 65.536 tokens, la cache KV puede superar ampliamente el tamano de los pesos. En la practica, usar la ventana completa exige GPU de 40-80 GB o tecnicas de paginacion de cache. Para ventanas de 8.192 tokens, un consumo total de 10-14 GB en bf16 es un orden de magnitud razonable.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S 48 GB para contexto largo; RTX 4090 (24 GB), RTX 3090 (24 GB) y A6000 (48 GB) para contexto moderado en bf16.
- Cabe en GPU de consumo: si. En RTX 4090, 4080 (16 GB), 3090 o 4070 Ti (12 GB) con cuantizacion de 4 bits y ventanas de contexto reducidas. En 8 bits cabe en GPUs de 8-12 GB solo con contexto corto.
- Opciones de despliegue: vLLM es la via natural, ya que el entrenamiento ya uso vLLM con reasoning_parser qwen3 y tool_call_parser qwen3_coder. Tambien son viables TGI, SGLang y transformers con FlashAttention 2. Ollama y llama.cpp requieren convertir los safetensors a GGUF, conversion que el autor no proporciona.
- Latencia y throughput: no disponibles. No hay mediciones publicadas ni datos de latencia en la informacion proporcionada.
- Nota sobre entrenamiento: la configuracion declara 2 GPUs por nodo (1 de inferencia + 1 de entrenamiento) para el ciclo de RL, no para servir el modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Stage-org/4b-C-200-luna-8k-epoch3 | 4,54 B | 65.536 en inferencia (300.000 en config de learner) | No disponible | safetensors en HuggingFace, 1 descarga | Sin benchmarks publicados |
| Qwen/Qwen3.5-4B (base) | No disponible | No disponible | No disponible | HuggingFace | No disponible |
| Qwen/Qwen3-4B | 4,0 B | 32.768 nativo, ~131.072 con YaRN | Apache 2.0 | HuggingFace, ampliamente desplegado | Benchmarks publicados por el autor |
| Llama 3.2 3B | 3,2 B | 128.000 | Licencia comunitaria Llama 3.2 | HuggingFace | Benchmarks publicados por el autor |
| Gemma 3 4B | 4,0 B | 128.000 | Licencia Gemma | HuggingFace | Benchmarks publicados por el autor |

La comparacion con el modelo base Qwen3.5-4B no puede completarse porque no se dispone de sus especificaciones en la informacion proporcionada. Los tres modelos alternativos de la tabla cuentan con evaluaciones publicadas por sus autores, algo de lo que carece por completo este checkpoint, lo que impide cualquier comparacion de rendimiento objetiva.

## Limitaciones y advertencias

- Licencia no especificada: al no declararse licencia, no puede asumirse permiso de uso comercial. Adoptar este modelo en produccion sin aclarar la licencia con el autor es un riesgo legal.
- Idiomas no declarados: no hay informacion sobre cobertura linguistica ni calidad por idioma.
- Sin evaluacion: no existen benchmarks, ni model card descriptiva, ni validacion de terceros. Las capacidades listadas proceden de la configuracion de entrenamiento, no de resultados medidos.
- Riesgo de alucinacion elevado y no cuantificado: el ajuste por RL con un juez automatico externo (gpt-5.6-luna) sobre respuestas abiertas tiende a optimizar la puntuacion del juez, no la veracidad. Es un escenario propicio para reward hacking, y sin evaluacion no puede descartarse.
- Trazabilidad limitada del entrenamiento: el dataset (Stage-org/4b-C-200-luna-8k) no se describe y el campo "type" figura como "new_task" con "path" vacio, por lo que se desconoce la composicion real de los datos.
- Dependencia de un juez propietario: la senal de recompensa proviene de un endpoint cerrado (gpt-5.6-luna) que no puede auditarse ni reproducirse sin acceso a la misma API.
- Posible discrepancia de contexto: la configuracion del learner declara seq_len = 300.000, mientras que la inferencia usa max_model_len = 65.536. No se aclara si el modelo fue entrenado con secuencias de 300.000 tokens ni si soporta esa longitud en la practica.
- Riesgo de sobreajuste al juez: 10.000 pasos de RL con 3 epocas y group_size 8 sobre un modelo de 4 B pueden degradar el modelo base en tareas ajenas al objetivo del juez (olvido catastrofico), sin que existan mediciones que lo confirmen o desmientan.
- Sin cuantizaciones oficiales: no hay GGUF, AWQ ni GPTQ. Cualquier despliegue en hardware de consumo requiere conversiones propias, con el riesgo de degradacion que ello implica.
- Adopcion nula: 1 descarga y 0 likes. No hay senales de uso en comunidad, ni issues, ni discusiones que permitan anticipar problemas.
- Fechas del repositorio: creado y actualizado el 19 de septiembre de 2026, con apenas un minuto entre ambos eventos, lo que sugiere una publicacion automatizada sin revision posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Stage-org/4b-C-200-luna-8k-epoch3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/Stage-org/4b-C-200-luna-8k
- Paper, blog, repositorio o demo: no disponible
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo; los resultados obtenidos corresponden a portales de ofertas de practicas (stage.fr, welcometothejungle.com, indeed.fr, jobs-stages.letudiant.fr) y no guardan relacion con el modelo.
