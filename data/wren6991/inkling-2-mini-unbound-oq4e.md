# wren6991/Inkling-2-Mini-Unbound-oQ4e

## Resumen

Inkling-2-Mini-Unbound-oQ4e es una cuantización mixta de precisión en formato MLX del checkpoint nokeepai/Inkling-2-Mini-Unbound v2.0, una variante "abliterated" (con el comportamiento de rechazo eliminado) y destilada por autodestilación del modelo Inkling 2 Mini de Thinking Machines Lab. El modelo lo publica el usuario wren6991 y está pensado para ejecutarse en hardware Apple Silicon mediante la librería MLX y el runtime oMLX. Con 26.388.646.400 parámetros totales y un peso efectivo de 4,915 bits por parámetro, ocupa 15,098 GiB repartidos en cuatro shards, lo que lo sitúa en la franja de modelos de ~26B aptos para equipos de sobremesa con memoria unificada amplia.

El modelo es multimodal (pipeline image-text-to-text): procesa imagen y texto y genera texto, con una arquitectura que incluye mezcla de expertos (MoE) en las capas 0-23, un encoder de visión en BF16 y un borrador DSpark para decodificación especulativa multi-token (MTP) en `mtp.safetensors`. La cuantización preserva la disposición de tensores del checkpoint mlx-community/Inkling-2-Mini-oQ4e-mtp, por lo que es un reemplazo directo de ese modelo en oMLX y mlx-vlm.

Su relevancia actual es doble: por un lado, demuestra una receta de cuantización mixta reproducible y verificable (con comprobaciones bit a bit frente al release original); por otro, es un modelo sin alineación de seguridad, lo que lo hace útil para investigación sobre comportamiento de rechazo y fine-tuning, pero inadecuado para despliegue directo a usuarios finales sin salvaguardas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE) en capas 0-23, encoder de vision y borrador DSpark para MTP; runtime MLX |
| Parametros totales | 26.388.646.400 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4e mixta: expertos en NVFP4 (grupo 16) en capas 0-19, expertos en affine 4-bit (grupo 64) en capas 20-23, proyecciones de atencion/embeddings/lm_head en affine 8-bit (grupo 64), vision y borrador DSpark en BF16, routers y controladores de bucle en FP32; 4,915 bits/peso efectivos (5,047 con el borrador) |
| Idiomas soportados | no disponible (calibracion multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 4 shards, 15,098 GiB; `mtp.safetensors` para el borrador |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer multimodal con capas de mezcla de expertos, encoder de vision y un modulo de decodificacion especulativa DSpark (MTP) que acelera la generacion en oMLX Lightning MTP. El checkpoint base Inkling 2 Mini procede de Thinking Machines Lab; la variante Unbound v2.0 se obtuvo mediante abliteracion (edicion de pesos en las proyecciones q, k, v, o y la puerta de atencion de las 24 capas) seguida de autodestilacion, y se verifico que exactamente 120 tensores difieren de la v1.0, reproduciendose de forma bit-exacta a partir de los pesos v1.0 mas la fusion LoRA publicada (`W + 2·BᵀA`, fp64).

Esta cuantizacion concreta se genero con oQ (oMLX v0.8.1) en modo oQ4e, grupo 64, bfloat16, con redondeo mejorado por imatrix y calibracion fresca sobre los pesos v2 (128 x 512 muestras, conjunto multilingue). Los expertos enrutados de las capas 0-19 se mantienen en NVFP4 de origen (grupo 16) y los de las capas 20-23 se recuantizan desde MXFP8 a affine 4-bit. La verificacion reporta que 903 de 1.098 tensores son identicos byte a byte respecto a la build v1 de este mismo repositorio, y que las proyecciones modificadas codifican los pesos BF16 v2 con un error rms del 0,53-0,61 %.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento con modo de pensamiento configurable mediante `reasoning_effort` (valores de 0 a 0,99 o `none`...`xhigh`).
- Procesamiento de imagen y texto (image-text-to-text) mediante encoder de vision.
- Generacion de codigo y matematicas (capacidad heredada del modelo base; sin metricas publicadas en esta ficha).
- Decodificacion especulativa multi-token (MTP) con el borrador DSpark para acelerar la inferencia.
- Comportamiento sin rechazo: sigue instrucciones daninas por diseno (abliterated + fine-tuning de cumplimiento).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible detalle; la calibracion de la cuantizacion uso un conjunto multilingue.

## Casos de uso

- Investigacion sobre alineacion y rechazo: el modelo permite estudiar como se comporta una red sin capa de rechazo y comparar con el checkpoint original, usando `reasoning_effort` para medir la deliberacion ante peticiones sensibles.
- Evaluacion de cuantizacion en Apple Silicon: sirve como banco de pruebas reproducible para medir la degradacion de un oQ4e frente al BF16, dado que la model card documenta el error rms (0,53-0,61 %) y la equivalencia tensor a tensor.
- Desarrollo de salvaguardas externas: al no incorporar entrenamiento de seguridad, es un caso de uso realista para probar clasificadores de entrada/salida, filtros y moderacion en pipelines propios antes de exponer el modelo.
- Asistentes multimodales locales: con encoder de vision y 15,098 GiB de pesos, puede desplegarse en estaciones de trabajo Apple con memoria unificada para tareas de descripcion de imagenes, extraccion de informacion de documentos escaneados o respuesta a preguntas sobre capturas.
- Aceleracion de inferencia con MTP: el borrador DSpark en `mtp.safetensors` permite evaluar tecnicas de decodificacion especulativa en oMLX Lightning MTP sobre un modelo de ~26B cuantizado a 4 bits.
- Fine-tuning e investigacion de destilacion: la receta de abliteracion + autodestilacion documentada (120 tensores, fusion LoRA `W + 2·BᵀA`) sirve de referencia para reproducir ediciones de pesos sobre otros checkpoints.
- Prototipado de chat conversacional en local: con licencia Apache 2.0 y formato MLX, encaja en entornos de desarrollo macOS para iterar sobre plantillas de chat y ajustes de `reasoning_effort` sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la suite completa de capacidades de la v2 estaba pendiente de reejecucion en el momento del release, y que las estadisticas de rechazo/utilidad/capacidad son las del release de origen.

## Requisitos de hardware

- VRAM/memoria unificada: aproximadamente 15,1 GiB solo para los pesos (4 shards, 15,098 GiB); hay que anadir la cache KV y el overhead del runtime, por lo que se recomienda un minimo practico de 20-24 GiB de memoria unificada.
- Hardware objetivo: Apple Silicon con MLX; el formato y la libreria (`mlx`, `mlx-vlm`, oMLX >= 0.8.1) no estan pensados para GPU NVIDIA o AMD.
- GPU consumer: no aplica en el sentido tradicional; en equipos Apple encaja en configuraciones con memoria unificada de 24 GB o superior (M-series Pro/Max/Ultra).
- Despliegue: oMLX 0.8.1 o superior y mlx-vlm; no se mencionan vLLM, llama.cpp, Ollama ni TGI como compatibles con este checkpoint MLX.
- Latencia y throughput: no disponibles en la informacion proporcionada; el uso de MTP (DSpark) esta orientado a reducir la latencia de decodificacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| wren6991/Inkling-2-Mini-Unbound-oQ4e (este) | 26,39 B | no disponible | oQ4e MLX, 4,915 bits/peso | Apache 2.0 | Sin rechazo, vision, MTP |
| nokeepai/Inkling-2-Mini-Unbound (base) | no disponible | no disponible | BF16 (checkpoint fuente) | Apache 2.0 | Version abliterated v2 de referencia |
| mlx-community/Inkling-2-Mini-oQ4e-mtp | no disponible | no disponible | oQ4e MLX | no disponible | Misma disposicion de tensores; reemplazo directo |
| Inkling 2 Mini (Thinking Machines Lab) | no disponible | no disponible | BF16 | Apache 2.0 (via AUP) | Modelo original con alineacion de seguridad |

## Limitaciones y advertencias

- El modelo sigue instrucciones daninas: su comportamiento de rechazo fue eliminado y el de cumplimiento ajustado por fine-tuning; no debe desplegarse a usuarios finales sin salvaguardas propias.
- Se aplica la Acceptable Use Policy del modelo base de Thinking Machines Lab, ademas de la licencia Apache 2.0.
- Riesgo elevado de alucinacion y de respuestas no verificadas, agravado por la ausencia de entrenamiento de seguridad.
- La v2 delibera extensamente en peticiones dificiles: en el release upstream, el 17 % de los prompts daninos alcanzaba el limite de 4.096 tokens con esfuerzo 0,9; se recomienda fijar un tope de pensamiento.
- La suite completa de capacidades de la v2 estaba pendiente de reejecucion en el momento del release, por lo que las metricas de rendimiento no estan confirmadas para esta version.
- La cuantizacion introduce ruido de redondeo propio de oQ4e (error rms del 0,53-0,61 % en las proyecciones modificadas), que puede afectar a tareas de precision.
- Dependencia estricta de oMLX 0.8.1 o superior y de hardware Apple Silicon; no hay soporte documentado para CUDA.
- Idiomas soportados no documentados de forma explicita; la cobertura multilingue solo se infiere del conjunto de calibracion.
- Longitud de contexto no disponible, lo que impide garantizar conversaciones de contexto largo sin pruebas propias.

## Enlaces

- Hugging Face: https://huggingface.co/wren6991/Inkling-2-Mini-Unbound-oQ4e
- Modelo base: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound
- Checkpoint de referencia con misma disposicion: https://huggingface.co/mlx-community/Inkling-2-Mini-oQ4e-mtp
- Revision v1 de este repositorio: https://huggingface.co/wren6991/Inkling-2-Mini-Unbound-oQ4e/tree/v1
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Acceptable Use Policy del modelo base: https://thinkingmachines.ai/model-acceptable-use-policy/
