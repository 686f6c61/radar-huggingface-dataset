# wren6991/Inkling-2-Mini-Unbound-oQ4e

## Resumen

Inkling-2-Mini-Unbound-oQ4e es una cuantizacion mixta en formato MLX del checkpoint nokeepai/Inkling-2-Mini-Unbound, que a su vez deriva de Inkling-2-Mini, el modelo multimodal de Thinking Machines Lab. El autor de esta version, wren6991, ha aplicado la receta oQ (oMLX v0.8.1) en modo oQ4e para producir un checkpoint de 26.388.646.400 parametros (unos 26,4 mil millones) con un peso efectivo de 4,915 bits por parametro, distribuido en 4 shards que ocupan 15,098 GiB. El objetivo es ofrecer una alternativa de 4 bits que pueda ejecutarse en hardware Apple Silicon mediante MLX, manteniendo la misma estructura que mlx-community/Inkling-2-Mini-oQ4e-mtp.

La caracteristica diferencial de esta variante es que hereda la edicion de pesos de "Unbound": las 20 proyecciones de salida de atencion han sido modificadas para eliminar el comportamiento de rechazo del modelo original, sin que se haya aplicado posteriormente ningun entrenamiento de seguridad. Esto convierte al modelo en un checkpoint "abliterated" y "uncensored", orientado a investigacion sobre alineamiento y evaluacion de salvaguardas, no a despliegue directo con usuarios finales. La licencia declarada es Apache 2.0, aunque el autor remite a la politica de uso aceptable del modelo base.

La relevancia actual del checkpoint es doble: por un lado, demuestra una tecnica de cuantizacion mixta que preserva el encoder de vision y el draft especulativo en BF16 mientras comprime los expertos enrutados y las proyecciones; por otro, incluye el modulo DSpark en mtp.safetensors para decodificacion especulativa con oMLX Lightning MTP, lo que reduce la latencia en inferencia local. Requiere oMLX 0.8.1 o superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE), segun los tags inkling2_loop y mtp; detalles completos no disponibles |
| Parametros totales | 26.388.646.400 (26,4 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4e (4 bits mixto), grupo 64, bfloat16, redondeo mejorado con imatrix; expertos de capas 0-19 en NVFP4 grupo 16; capas 20-23 en affine 4-bit grupo 64; atencion, embeddings y lm_head en affine 8-bit grupo 64; vision y draft en BF16; routers y controladores en FP32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (sujeta a la politica de uso aceptable del modelo base) |
| Formato de pesos | safetensors (MLX), 4 shards, 15,098 GiB; incluye mtp.safetensors para decodificacion especulativa |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion, no un entrenamiento nuevo. La arquitectura subyacente corresponde a Inkling-2-Mini de Thinking Machines Lab, descrita en los tags como inkling2_loop, lo que sugiere un diseno con controladores de bucle (loop controllers) en FP32 dentro del grafo, y con un modulo MTP (multi-token prediction) empaquetado aparte como draft DSpark. La presencia de expertos enrutados confirma una estructura MoE, aunque el numero de expertos, el ratio de activacion y la dimension oculta no se detallan en la informacion disponible. El modelo es multimodal (pipeline image-text-to-text), con un encoder de vision que en esta cuantizacion se mantiene integramente en BF16.

La receta de cuantizacion es el elemento tecnico mas relevante. Se aplico oQ4e con grupo 64 y redondeo mejorado mediante imatrix, con calibracion fresca sobre los pesos ya editados de Unbound (128 x 512 muestras, conjunto multilingue). Los expertos enrutados de las capas 0-19 se conservan en el NVFP4 original (grupo 16), mientras que los de las capas 20-23 se recuantizan desde MXFP8 a affine 4-bit (grupo 64). Las proyecciones de atencion, los embeddings y lm_head pasan a affine 8-bit. El resultado es un peso efectivo de 4,915 bits (5,047 incluyendo el draft). La verificacion publicada indica que 903 de 1.098 tensores son byte-identicos al checkpoint mlx-community/Inkling-2-Mini-oQ4e-mtp, y que las 20 proyecciones attn.o_proj reproducen la edicion BF16 de Unbound con un error rms del 0,53-0,57%. No se especifican datos de preentrenamiento, volumen de tokens ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat compatible con oMLX y mlx-vlm.
- Procesamiento de imagen y texto de entrada (image-text-to-text) mediante encoder de vision en BF16.
- Razonamiento con esfuerzo configurable: el argumento reasoning_effort admite valores de 0 a 0,99 o las etiquetas none, low, medium, high y xhigh.
- Decodificacion especulativa mediante el draft DSpark incluido en mtp.safetensors, activable con oMLX Lightning MTP.
- Comportamiento sin rechazo: el modelo sigue instrucciones que el checkpoint original rechazaria, por eliminacion del comportamiento de rechazo en los pesos.
- Capacidades multilingues: la calibracion uso un conjunto multilingue, pero no se publica la lista de idiomas soportados.
- Soporte de tool calling, function calling y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el checkpoint permite estudiar como se distribuye el comportamiento de rechazo en los pesos de un modelo multimodal, comparando las 20 proyecciones attn.o_proj editadas con el original y midiendo el efecto de la edicion sobre las respuestas.
- Evaluacion de tecnicas de cuantizacion mixta: al conservar el encoder de vision en BF16 y comprimir selectivamente los expertos, sirve como caso de estudio para medir la degradacion por capas y validar recetas oQ4e frente a cuantizaciones uniformes.
- Pruebas de decodificacion especulativa en Apple Silicon: el draft DSpark y la integracion con oMLX Lightning MTP permiten medir aceleraciones de latencia en hardware MLX con un modelo de 26,4 mil millones de parametros.
- Red teaming automatizado: al no aplicar salvaguardas, es util como generador de prompts adversarios y respuestas no filtradas en pipelines internos de evaluacion, siempre en entornos aislados.
- Desarrollo de filtros y clasificadores de seguridad: las respuestas del modelo sin rechazo sirven como corpus negativo para entrenar o validar clasificadores de contenido dañino.
- Inferencia local multimodal en macOS: con 15,098 GiB en 4 shards y formato MLX, cabe en equipos Apple Silicon con memoria unificada suficiente para prototipos de vision-lenguaje sin depender de GPU dedicadas.
- Analisis de robustez ante prompts de rechazo: la comparacion entre el checkpoint previo a la edicion y este permite cuantificar la tasa de cumplimiento en prompts sensibles, tal como se documenta en la verificacion conductual del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye verificaciones de integridad de la cuantizacion (identidad de configuracion 101/101 entradas, 903 de 1.098 tensores byte-identicos, error rms del 0,53-0,57% en las proyecciones editadas) y una comprobacion conductual cualitativa sobre un prompt propenso al rechazo, sin cifras de MMLU, HumanEval, GSM8K ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 15,098 GiB solo para los pesos en 4 shards; hay que sumar el espacio del draft mtp.safetensors y la cache KV, cuyo tamano depende de la longitud de contexto (no disponible).
- Hardware objetivo: Apple Silicon con MLX, dado que el checkpoint usa la libreria mlx y requiere oMLX 0.8.1 o superior; no esta pensado para CUDA.
- GPU dedicadas tipo A100, H100 o RTX 4090: no aplicables de forma nativa, ya que el formato es MLX y no GGUF ni safetensors genericos de PyTorch.
- Cabe en consumer hardware Apple: si, en equipos con memoria unificada de 24 GB o superior, siempre que la cache KV y el contexto lo permitan; el limite exacto no se especifica.
- Opciones de despliegue: oMLX (version 0.8.1 o posterior) y mlx-vlm; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la unica indicacion es que la decodificacion especulativa con DSpark y oMLX Lightning MTP esta pensada para reducir latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-Unbound-oQ4e (este) | 26,4 mil millones | no disponible | oQ4e, 4,915 bits/peso | Apache 2.0 | Hugging Face, formato MLX |
| mlx-community/Inkling-2-Mini-oQ4e-mtp | no disponible | no disponible | oQ4e con MTP | no disponible en la informacion | Hugging Face, formato MLX |
| nokeepai/Inkling-2-Mini-Unbound | no disponible | no disponible | BF16 (checkpoint sin cuantizar) | Apache 2.0 | Hugging Face |
| Inkling-2-Mini (Thinking Machines Lab) | no disponible | no disponible | original | Apache 2.0 con politica de uso aceptable | Hugging Face |

La comparativa se limita a la propia familia Inkling-2-Mini porque la informacion proporcionada no incluye datos de modelos alternativos de otros desarrolladores. La diferencia clave entre las variantes es el nivel de cuantizacion (BF16 frente a oQ4e) y la presencia o ausencia de la edicion de rechazo; los parametros y el contexto de los checkpoints base no se detallan.

## Limitaciones y advertencias

- Modelo sin salvaguardas: sigue instrucciones dañinas por diseno, ya que el comportamiento de rechazo fue eliminado de los pesos y no se ha reentrenado seguridad. No debe desplegarse ante usuarios finales sin controles propios.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; la cuantizacion a 4 bits añade ruido de redondeo respecto al BF16, aunque el autor afirma que es equivalente al de cualquier oQ4e.
- Bucles de generacion: la model card advierte que el checkpoint fuente puede entrar en bucle en algunos prompts y recomienda fijar un limite de pensamiento en esfuerzo alto.
- Idiomas: la lista de idiomas soportados no esta publicada; la calibracion multilingue no garantiza cobertura uniforme.
- Contexto: la longitud maxima no se especifica, lo que impide planificar despliegues con ventanas largas sin medir empiricamente.
- Licencia: Apache 2.0, pero el autor remite a la politica de uso aceptable de Thinking Machines Lab, que puede imponer restricciones adicionales al uso comercial.
- Compatibilidad: solo funciona con oMLX 0.8.1 o superior y mlx-vlm; no es portable a ecosistemas CUDA sin conversion.
- Trazabilidad de la edicion: la eliminacion del rechazo se hereda del checkpoint Unbound y solo se verifica de forma cualitativa, sin estadisticas publicadas de tasa de cumplimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wren6991/Inkling-2-Mini-Unbound-oQ4e
- Modelo base (Unbound): https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound
- Checkpoint de referencia de la cuantizacion: https://huggingface.co/mlx-community/Inkling-2-Mini-oQ4e-mtp
- Politica de uso aceptable del modelo base: https://thinkingmachines.ai/model-acceptable-use-policy/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
