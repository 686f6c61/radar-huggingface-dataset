# taobao-mnn/Qwen1.5-7B-Chat-MNN

## Resumen

Qwen1.5-7B-Chat-MNN es un paquete de inferencia en formato MNN derivado de Qwen/Qwen1.5-7B-Chat, el modelo conversacional de 7 mil millones de parametros desarrollado por el equipo Qwen de Alibaba. Lo publica la organizacion taobao-mnn y su proposito es permitir la ejecucion local del modelo sobre el motor MNN (Mobile Neural Network) de Alibaba, con pesos cuantizados en 4 bits mediante HQQ (Half-Quadratic Quantization). No se trata de un modelo nuevo ni de un fine-tuning: es una conversion de pesos y grafos para un runtime concreto.

El modelo base emplea la arquitectura Qwen2ForCausalLM (model_type `qwen2`) con 32 capas de transformer, y el paquete exporta unicamente el modulo de lenguaje (entrada y salida de texto). La cuantizacion afecta a las matrices lineales del tronco y a la cabeza LM de salida, mientras que las embeddings de entrada se conservan en BF16 en un fichero separado. El campo de configuracion `max_position_embeddings` es de 32768, si bien el autor advierte explicitamente que no es una medida de contexto maximo verificado.

Su relevancia actual es practica: ofrece un artefacto listo para desplegar en CPU x64 con el runtime MNN 3.6.2, con trazabilidad de la conversion (parametros de exportacion y metadatos de verificacion publicados) y una declaracion honesta de los limites de validacion. Es util para quien necesite ejecutar un chat de 7B en entornos sin GPU, aceptando que solo se ha verificado en x64 CPU y que el resto de backends (ARM FP16, Metal, OpenCL, Vulkan, CUDA, moviles) no han sido probados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (model_type `qwen2`), 32 capas |
| Parametros totales | no disponible (el autor no infiere parametros a partir del nombre del repositorio) |
| Parametros activos | no aplica (no es MoE; la configuracion no declara expertos enrutados) |
| Longitud de contexto | `max_position_embeddings`=32768 en configuracion; contexto maximo real no verificado |
| Tipos de cuantizacion | HQQ 4-bit en tronco lineal y cabeza LM (block=128, alpha_bytes=2 FP16, sym=false); embeddings de entrada en BF16 |
| Idiomas soportados | zh (chino), en (ingles) |
| Licencia | tongyi-qianwen (etiquetada como `other` en metadatos) |
| Formato de pesos | MNN (grafo y pesos del runtime MNN), mas fichero separado `embeddings_bf16.bin` |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only de la familia Qwen1.5, con 32 capas y arquitectura declarada `Qwen2ForCausalLM`. El paquete MNN no reentrena ni modifica el modelo: exporta el modulo de lenguaje con el exportador estandar de MNN en la revision fijada `b0239771b07b317a258fbc384683bbd540741406`, aplicando cuantizacion HQQ de 4 bits con bloque de 128 y escalas en FP16 asimetricas (`sym=false`) tanto en las capas lineales del tronco como en la cabeza LM. Las embeddings de entrada se mantienen en BF16 en un fichero independiente, con una disposicion distinta a la de las escalas de las capas lineales.

No se detallan en la informacion disponible los datos de entrenamiento del modelo original (numero de tokens, composicion del corpus, uso de RLHF o DPO). El autor declara explicitamente que no reproduce evaluaciones, cifras de rendimiento ni afirmaciones de capacidades del modelo upstream, y que la cuantizacion puede introducir errores en la salida. La innovacion tecnica del paquete es la propia conversion: integracion con MNN 3.6.2 con soporte LLM, modo de baja memoria y fusion de transformer (`MNN_SUPPORT_TRANSFORMER_FUSE`), y verificacion de alineamiento FP32 entre la implementacion de origen y el exportador en prefill, decode, embeddings, una capa representativa, normalizacion y logits a lo largo de las 32 capas.

## Capacidades

- Generacion de texto conversacional en chino e ingles, heredada del modelo base Qwen1.5-7B-Chat.
- Razonamiento y respuesta a instrucciones en formato de chat (la validacion incluye casos de saludo, aritmetica, traduccion y traduccion larga).
- Respuesta a preguntas de conocimiento general y tareas de calculo simple (se valida con un caso de aritmetica elemental).
- Traduccion entre idiomas soportados (caso de validacion `translation` y `long_translation`).
- Generacion con parada natural y sin caracteres de reemplazo en las pruebas deterministas declaradas.
- Capacidad de razonamiento multi-paso o modo "thinking": no verificada; el autor clasifica el razonamiento como `none` y no activa ni desactiva el modo de pensamiento forzado.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Vision, audio o video: no soportado (solo se exporta el modulo de lenguaje; estos modos no han sido verificados).
- Capacidades de agente: no verificadas.

## Casos de uso

- Asistente conversacional local en CPU x64: el paquete esta pensado para ejecutarse con `llm_demo` sobre MNN en equipos sin GPU, usando la configuracion por defecto (backend CPU, memoria baja, precision baja, 4 hilos). Es adecuado para prototipos y entornos de escritorio donde no se dispone de acelerador.
- Traduccion chino-ingles en aplicaciones de escritorio: los casos de validacion incluyen traduccion corta y larga (hasta 882 tokens de prompt), lo que respalda su uso en tareas de traduccion de parrafos completos dentro de la ventana probada.
- Procesamiento por lotes de textos en ingles y chino: al ser un artefacto MNN con cuantizacion 4-bit, reduce el peso en disco y memoria frente al modelo original, lo que facilita su integracion en pipelines de procesamiento de texto en servidores CPU.
- Respuesta a preguntas frecuentes y soporte de primer nivel: el modelo base es un chat instruct, y el paquete permite desplegarlo en un servicio local con presupuesto de generacion por defecto de 512 tokens, suficiente para respuestas de atencion al cliente acotadas.
- Educacion y demostraciones de IA en local: su naturaleza autocontenida (grafo, pesos, tokenizador, plantillas y configuracion en un mismo paquete) permite montar demos reproducibles sin depender de servicios en la nube.
- Evaluacion de la cadena de herramientas MNN: util para ingenieros que quieran validar el exportador `llmexport.py` con HQQ 4-bit y comparar el comportamiento del runtime frente al modelo original, ya que se publican los parametros de exportacion y los metadatos de verificacion.
- Prototipado de aplicaciones moviles o embebidas (con cautela): aunque el backend movil no esta verificado, el formato MNN esta disenado para despliegue en dispositivos; se puede usar como base de experimentacion asumiendo la falta de validacion en ARM, Metal, OpenCL y Vulkan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que no reproduce evaluaciones, cifras de rendimiento ni afirmaciones de capacidades del modelo upstream, y que no se han publicado mediciones de velocidad ni cifras de memoria por dispositivo. Las unicas comprobaciones publicadas son de tipo estructural y de alineamiento: verificacion determinista en x64 CPU con decodificacion greedy, precision alta, 8 hilos y `use_mmap=false`, con presupuesto de generacion de 1024 tokens, sobre los casos predefinidos `greeting`, `arithmetic`, `translation` y `long_translation`; y una prueba de humo con la configuracion por defecto (muestreo por defecto, presupuesto de 512 tokens) en la que los casos pasan las comprobaciones estructurales sin superar el limite. Los prompts de prueba oscilan entre 26 y 882 tokens. Estas pruebas no constituyen una medida de precision ni de rendimiento.

## Requisitos de hardware

- VRAM estimada: no disponible; el paquete esta orientado a CPU y no se han publicado cifras de memoria por dispositivo.
- GPU recomendadas: no disponible; no se ha verificado CUDA ni ningun backend GPU (Metal, OpenCL, Vulkan).
- Compatibilidad con GPU de consumo: no verificada.
- CPU: unica plataforma validada, x64 CPU, con MNN 3.6.2 compilado con `MNN_BUILD_LLM=ON`, `MNN_LOW_MEMORY=ON`, `MNN_BUILD_CONVERTER=ON` y `MNN_SUPPORT_TRANSFORMER_FUSE=ON`.
- Configuracion por defecto del paquete: backend CPU, memoria baja, precision baja, 4 hilos; presupuesto de generacion de 512 tokens.
- Opciones de despliegue: runtime MNN mediante `llm_demo` y la API LLM de MNN; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato de pesos es MNN y no GGUF ni safetensors.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen1.5-7B-Chat-MNN (este paquete) | no declarado (base de 7B) | 32768 en configuracion, no verificado | MNN, HQQ 4-bit, CPU x64 verificado | tongyi-qianwen | Hugging Face y ModelScope |
| Qwen/Qwen1.5-7B-Chat (original) | 7B (segun nombre del modelo base) | no disponible en esta ficha | safetensors (formato habitual del modelo original; no confirmado en la informacion) | tongyi-qianwen | Hugging Face y ModelScope |
| Otras conversiones MNN de la familia Qwen | no disponible | no disponible | MNN | tongyi-qianwen | no disponible |

La comparacion con alternativas de la misma categoria (por ejemplo, otras cuantizaciones del mismo modelo base en GGUF o GPTQ) no puede completarse con los datos proporcionados: no se dispone de cifras de rendimiento del paquete ni de sus competidores en esta informacion.

## Limitaciones y advertencias

- Validacion limitada: solo se ha verificado en x64 CPU. ARM CPU FP16, Metal, OpenCL, Vulkan, CUDA y dispositivos moviles no han sido validados.
- La cuantizacion HQQ 4-bit puede degradar la calidad de la salida; el autor advierte que la salida cuantizada puede contener errores.
- El contexto maximo real no esta verificado: `max_position_embeddings`=32768 es un campo de configuracion, no una medicion. Los prompts probados no superan los 882 tokens.
- Idiomas limitados a chino e ingles; no se declara soporte de castellano ni de otros idiomas.
- Riesgo de alucinacion inherente al modelo base; no se han publicado evaluaciones de fidelidad ni de sesgos.
- No se han publicado datos sobre sesgos conocidos.
- Restricciones de licencia: se hereda la licencia tongyi-qianwen del modelo original; la conversion no amplia los derechos de uso. Es necesario cumplir las obligaciones de atribucion y las politicas de uso del modelo upstream para uso comercial.
- El paquete debe actualizarse como un todo: no se deben mezclar revisiones ni sustituir solo el fichero de grafo; hay que usar un directorio de salida nuevo y revalidar tras reexportar.
- Sin soporte verificado de tool calling, agentes, vision, audio ni video.
- Los parametros de muestreo por defecto no se declaran en la informacion; se remiten a los valores por defecto del runtime en la revision fijada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/taobao-mnn/Qwen1.5-7B-Chat-MNN
- Modelo base en ModelScope: https://modelscope.cn/models/Qwen/Qwen1.5-7B-Chat/summary
- Modelo base en Hugging Face (licencia): https://huggingface.co/Qwen/Qwen1.5-7B-Chat/blob/main/LICENSE
- Repositorio MNN (Alibaba): https://github.com/alibaba/MNN
- Exportador LLM de MNN en la revision fijada: https://github.com/alibaba/MNN/tree/b0239771b07b317a258fbc384683bbd540741406/transformers/llm/export
- Documentacion MNN-LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
- Parametros de exportacion del paquete: export_args.json (en el repositorio)
- Metadatos de verificacion del paquete: refresh_metadata.json (en el repositorio)
