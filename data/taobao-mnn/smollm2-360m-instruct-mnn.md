# taobao-mnn/SmolLM2-360M-Instruct-MNN

## Resumen

SmolLM2-360M-Instruct-MNN es un paquete de inferencia de texto para el motor MNN (Alibaba) construido a partir del modelo HuggingFaceTB/SmolLM2-360M-Instruct. Lo publica la organizacion taobao-mnn y su proposito no es ofrecer un modelo nuevo, sino un artefacto listo para ejecutar en el runtime MNN con pesos cuantizados a 4 bits mediante HQQ, pensado para despliegue en CPU y en dispositivos con recursos limitados. El modelo base es un transformer tipo Llama de 360 millones de parametros con 32 capas, ajustado con instrucciones y orientado a generacion de texto en chino e ingles.

La relevancia de este paquete es practica: permite ejecutar un modelo conversacional pequeno sin GPU, con un peso en repositorio de aproximadamente 0,5 GB y una configuracion por defecto en CPU de baja memoria y baja precision. No aporta capacidades nuevas respecto al modelo original, sino una ruta de despliegue reproducible con MNN 3.6.2 sobre una revision concreta del codigo fuente.

Conviene subrayar que la validacion publicada por el autor es acotada: solo se ha verificado en CPU x64, y no hay resultados publicados de benchmarks, latencia, throughput ni consumo de memoria. El paquete esta pensado para integrarse en aplicaciones que ya usan MNN y que aceptan un modelo de muy bajo coste computacional a cambio de una calidad limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer `LlamaForCausalLM` (model_type `llama`), 32 capas |
| Parametros totales | 360M (modelo base SmolLM2-360M-Instruct) |
| Parametros activos | no aplica (no es MoE; la configuracion no declara expertos enrutados) |
| Longitud de contexto | `max_position_embeddings` = 8192 en configuracion; no es un maximo de contexto medido |
| Tipos de cuantizacion | HQQ 4-bit (block=64, alpha_bytes=2 en FP16, sym=false) en pesos lineales del tronco y en la cabeza LM; embeddings en BF16 separado (`embeddings_bf16.bin`) |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache 2.0 (heredada del modelo base; el paquete no incluye el texto de la licencia) |
| Formato de pesos | Paquete MNN (grafo + pesos HQQ 4-bit + `embeddings_bf16.bin`), no safetensors ni GGUF |
| Tamano del repositorio | ~0,5 GB |
| Runtime requerido | MNN 3.6.2, commit `b0239771b07b317a258fbc384683bbd540741406` |
| Configuracion por defecto | `backend_type=cpu`, `memory=low`, `precision=low`, `thread_num=4` |
| Limite de generacion por defecto | 512 tokens |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only de tipo Llama con 32 capas y 360 millones de parametros, publicado originalmente por Hugging Face (HuggingFaceTB) como SmolLM2-360M-Instruct. No hay informacion en la documentacion proporcionada sobre el numero de tokens de entrenamiento, la composicion del dataset ni sobre las etapas de alineacion (SFT, RLHF o DPO) del modelo base; esos datos corresponden a la model card original de SmolLM2 y no se reproducen aqui.

La innovacion de este repositorio no esta en el modelo sino en el empaquetado: los pesos lineales del tronco y la cabeza de salida se cuantizan con HQQ a 4 bits (bloques de 64, escalas en FP16, cuantizacion asimetrica desactivada), mientras que la matriz de embeddings se mantiene en BF16 en un fichero separado. La exportacion se realiza con el exportador LLM de MNN en una revision fija, con soporte de fusion de transformer y modo de baja memoria. El autor declara una verificacion de alineacion FP32 entre la implementacion de referencia y el exportador (prefill/decode, embeddings, capas representativas, normalizacion y logits) sobre las 32 capas, pero advierte que esto no implica equivalencia token a token de la salida cuantizada.

## Capacidades

- Generacion de texto conversacional con formato de instrucciones (chat), en chino e ingles.
- Respuesta a preguntas factuales simples, aritmetica basica y traduccion, segun los casos de prueba declarados por el autor (saludo, aritmetica, traduccion y traduccion larga).
- Generacion con plantilla Jinja; el contexto de plantilla por defecto es `null` y la clasificacion de razonamiento es `none`.
- Capacidad de entrada larga: los casos de prueba alcanzan 963 tokens de prompt, dentro de un limite configurado de 8192 posiciones.
- No se declara soporte de tool calling ni de function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso explicito (sin modo thinking forzado).
- No hay capacidades de vision, audio ni video: solo se exporta el modulo de lenguaje.
- No se declara capacitacion multilingue mas alla de chino e ingles.

## Casos de uso

- Clasificacion y etiquetado de texto en lote sobre CPU: el modelo cabe en ~0,5 GB y funciona con 4 hilos en CPU x64, por lo que puede procesar grandes volumenes de textos cortos en servidores sin GPU, aceptando la menor calidad de un modelo de 360M.
- Asistente conversacional embebido en aplicaciones de escritorio o moviles que ya usan MNN: el paquete se integra directamente en el runtime MNN y evita depender de servicios en la nube para respuestas simples en chino o ingles.
- Traduccion zh-en y en-zh de fragmentos cortos y medianos: los casos de prueba del autor incluyen traduccion y traduccion larga (963 tokens de entrada), lo que respalda su uso en tareas de traduccion acotadas.
- Prototipado rapido de pipelines de generacion de texto: sirve como modelo de referencia para validar la integracion con MNN antes de sustituirlo por un modelo mayor del mismo runtime.
- Generacion de respuestas en asistentes de FAQ o atencion al cliente de dominio cerrado: con prompts bien acotados y contexto de hasta varios miles de tokens, puede gestionar conversaciones multi-turno simples, aunque la calidad en dominios especializados sera limitada.
- Filtrado y resumen de documentos en entornos con restricciones de memoria: al mantener los embeddings en BF16 y el resto en 4 bits, el consumo es bajo y permite ejecutarse junto a otros procesos en la misma maquina.
- Educacion y experimentacion: util para estudiar el efecto de la cuantizacion HQQ 4-bit frente al modelo original en tareas controladas, ya que el autor documenta los parametros de exportacion y los metadatos de verificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del paquete indica explicitamente que no se publican mediciones de rendimiento ni cifras de memoria por dispositivo, y que las pruebas realizadas son verificaciones estructurales y de determinismo (CPU x64, greedy, `precision=high`, 8 hilos, `use_mmap=false`, presupuesto de 1024 tokens), no evaluaciones de precision.

## Requisitos de hardware

- VRAM: no aplica en la configuracion validada; el backend por defecto es CPU.
- Memoria en disco: aproximadamente 0,5 GB para el paquete completo.
- GPU recomendadas: no hay ninguna verificada. El autor declara explicitamente que CUDA, Metal, OpenCL, Vulkan y ARM CPU FP16 no han sido validados; solo se valido CPU x64.
- GPU de consumo: no hay datos publicados sobre ejecucion en RTX 4090, RTX 3090 u otras GPU de consumo.
- Despliegue: runtime MNN (binario `llm_demo` y API LLM de MNN), compilado con `MNN_BUILD_LLM=ON`, `MNN_LOW_MEMORY=ON` y `MNN_SUPPORT_TRANSFORMER_FUSE=ON`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Hilos por defecto: 4 (`thread_num=4`).
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Estado de validacion |
|---|---|---|---|---|---|
| SmolLM2-360M-Instruct-MNN | 360M | 8192 (configurado) | Paquete MNN, HQQ 4-bit | Apache 2.0 | Solo CPU x64 |
| HuggingFaceTB/SmolLM2-360M-Instruct (original) | 360M | 8192 | Safetensors, transformers | Apache 2.0 | Modelo de referencia; sin cuantizar |
| Qwen2.5-0.5B-Instruct | 500M | 32768 | Safetensors, GGUF, multiples runtimes | Apache 2.0 | Ampliamente validado en CPU y GPU |
| Llama-3.2-1B-Instruct | 1,2B | 131072 | Safetensors, GGUF, multiples runtimes | Llama 3.2 Community License | Ampliamente validado en CPU y GPU |

La comparacion con Qwen2.5-0.5B y Llama-3.2-1B es orientativa: son alternativas de tamano cercano con mayor ecosistema de despliegue y validacion publica. Este paquete solo tiene sentido si el requisito es ejecutar dentro de MNN en CPU x64; en cualquier otro escenario, el modelo original o una version GGUF de un modelo comparable ofrece mas opciones y validacion.

## Limitaciones y advertencias

- Modelo de 360M: capacidad de razonamiento, conocimiento factual y coherencia limitadas; no es adecuado para tareas que requieran precision alta.
- La cuantizacion HQQ 4-bit introduce degradacion adicional; el autor advierte que la salida cuantizada puede contener errores aunque la alineacion FP32 sea correcta.
- La validacion cubre solo CPU x64; ARM CPU FP16, Metal, OpenCL, Vulkan, CUDA y dispositivos moviles no han sido verificados.
- No hay benchmarks publicados de precision, latencia ni memoria; el rendimiento en produccion debe medirse por el usuario.
- `max_position_embeddings=8192` es un valor de configuracion, no un maximo de contexto medido; el caso de prueba mas largo usa 963 tokens.
- Idiomas limitados a chino e ingles; no se declara soporte de castellano.
- Riesgo de alucinacion inherente a un modelo de este tamano, especialmente en preguntas factuales y contextos largos.
- La licencia Apache 2.0 se hereda del modelo base, pero el paquete no incluye el texto de la licencia; deben cumplirse las obligaciones de atribucion y las politicas de uso del modelo original.
- El paquete debe usarse como un todo: no se deben mezclar revisiones ni sustituir solo el grafo, y hay que actualizar las caches propias de la aplicacion.
- La reexportacion con otras versiones de dependencias no garantiza resultados identicos byte a byte; requiere nueva validacion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/taobao-mnn/SmolLM2-360M-Instruct-MNN
- Modelo base en ModelScope: https://modelscope.cn/models/HuggingFaceTB/SmolLM2-360M-Instruct/summary
- Repositorio MNN: https://github.com/alibaba/MNN
- Exportador LLM de MNN (revision fija): https://github.com/alibaba/MNN/tree/b0239771b07b317a258fbc384683bbd540741406/transformers/llm/export
- Documentacion MNN-LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Parametros de exportacion: `export_args.json` (en el repositorio)
- Metadatos de verificacion: `refresh_metadata.json` (en el repositorio)
