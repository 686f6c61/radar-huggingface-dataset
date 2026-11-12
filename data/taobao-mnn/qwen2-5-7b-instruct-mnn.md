# taobao-mnn/Qwen2.5-7B-Instruct-MNN

## Resumen

Qwen2.5-7B-Instruct-MNN es un paquete de inferencia de texto en formato MNN derivado de Qwen/Qwen2.5-7B-Instruct, el modelo instructivo de 7.000 millones de parametros de la familia Qwen2.5 de Alibaba. Lo publica el equipo taobao-mnn dentro del ecosistema MNN (Mobile Neural Network), el motor de inferencia de Alibaba, y su proposito es permitir ejecutar el modelo sobre CPU x64 con pesos cuantizados en 4 bits mediante HQQ, reduciendo el espacio en disco y la huella de memoria frente a los pesos originales en BF16.

No se trata de un modelo nuevo ni de un reentrenamiento: es una conversion del checkpoint original a un grafo MNN acompanado de pesos cuantizados, con la cabeza LM y las proyecciones lineales del tronco en HQQ 4-bit (block=128, alpha en FP16, simetria desactivada) y la capa de embeddings en un fichero BF16 independiente. La arquitectura subyacente es `Qwen2ForCausalLM`, un transformer denso de 28 capas, sin expertos enrutados (no es MoE). El campo de configuracion declara `max_position_embeddings=32768`, aunque el autor advierte que no se ha medido la longitud de contexto real.

Su relevancia es acotada pero concreta: ofrece una via reproducible para desplegar Qwen2.5-7B-Instruct en entornos sin GPU, con instrucciones de compilacion fijadas a un commit concreto de MNN (3.6.2, `b0239771`) y un conjunto de verificaciones declaradas (alineamiento FP32 en las 28 capas, pruebas de determinismo en CPU x64, smoke test con la configuracion por defecto). La validacion se limita explicitamente a CPU x64; ARM FP16, Metal, OpenCL, Vulkan, CUDA y dispositivos moviles no han sido verificados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen2ForCausalLM` (transformer denso, model_type `qwen2`), 28 capas |
| Parametros totales | 7B (heredados del modelo base Qwen2.5-7B-Instruct; el paquete no declara un recuento propio) |
| Parametros activos | no disponible (no es MoE; la configuracion no declara expertos enrutados) |
| Longitud de contexto | `max_position_embeddings=32768` declarado en config; no es contexto maximo medido |
| Tipos de cuantizacion | HQQ 4-bit en tronco lineal y cabeza LM (block=128, alpha_bytes=2 FP16, sym=false); embeddings en BF16 separado |
| Idiomas soportados | zh, en |
| Licencia | apache-2.0 (heredada del modelo base) |
| Formato de pesos | paquete MNN (grafo + pesos HQQ 4-bit + `embeddings_bf16.bin`); no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only denso de 28 capas con atencion causal estandar, sin mezcla de expertos ni mecanismos hibridos SSM. El paquete MNN solo exporta el modulo de lenguaje (entrada y salida de texto); no incluye torre visual, audio ni video, y el autor indica expresamente que no se han realizado verificaciones en esas modalidades. No hay informacion en la model card sobre el volumen de tokens de preentrenamiento, la composicion del dataset ni las etapas de alineacion (SFT, RLHF o DPO) del modelo original; esos datos pertenecen a la ficha de Qwen/Qwen2.5-7B-Instruct y no se reproducen aqui.

La innovacion tecnica del paquete es la propia cadena de conversion: el exportador `llmexport.py` de MNN, fijado al commit `b0239771b07b317a258fbc384683bbd540741406`, aplica cuantizacion HQQ de 4 bits con bloques de 128 y escalas en FP16, separa los embeddings en BF16 (`--seperate_embed`, grafia literal del parametro) y genera un grafo optimizado para el runtime MNN con soporte de fusion de transformers (`MNN_SUPPORT_TRANSFORMER_FUSE=ON`) y modo de baja memoria (`MNN_LOW_MEMORY=ON`). El autor documenta una verificacion de alineamiento FP32 entre la implementacion de referencia y el exportador en prefill y decode, cubriendo las 28 capas, aunque aclara que ello no implica equivalencia token a token con la salida cuantizada. Tambien se realizo una prueba de determinismo en CPU x64 con decodificacion greedy, `precision=high`, 8 hilos y `use_mmap=false`, con presupuesto de 1024 tokens y `enable_thinking: false` en el contexto Jinja.

## Capacidades

- Generacion de texto conversacional e instructiva en chino e ingles, heredada de Qwen2.5-7B-Instruct.
- Razonamiento aritmetico basico y traduccion, cubiertos por los casos predefinidos de la validacion (`greeting`, `arithmetic`, `translation`, `long_translation`).
- Procesamiento de entradas largas: los casos de prueba alcanzan 892 tokens de prompt, dentro de un rango observado de 36 a 892 tokens.
- Generacion con limite por defecto de 512 tokens cuando la configuracion del runtime no se sobrescribe.
- Plantilla de chat Jinja configurable; por defecto el paquete trae `context` a `null` y clasificacion de razonamiento `none`, sin forzar ni desactivar el modo de pensamiento.
- No se declaran capacidades de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking explicito en la informacion disponible; cualquier capacidad de este tipo dependeria del modelo base y no esta verificada en este paquete.

## Casos de uso

- Despliegue en servidores sin GPU: el paquete esta pensado para ejecutarse en CPU x64 con el runtime MNN compilado en modo LLM y baja memoria, lo que permite servir un modelo de 7B en maquinas sin acelerador dedicado.
- Prototipado de asistentes conversacionales en chino e ingles: la plantilla de chat y el formato instructivo permiten montar un chatbot multi-turno sobre `llm_demo` o una integracion propia con MNN.
- Traduccion y reescritura de textos: los casos de validacion incluyen traduccion simple y traduccion larga (892 tokens de entrada), lo que respalda su uso en tareas de transformacion de texto de longitud media.
- Aplicaciones embebidas y de borde en arquitecturas x64: al no requerir CUDA ni Metal, encaja en mini-PC, estaciones de trabajo modestas o contenedores sin acceso a GPU.
- Evaluacion y comparacion de tecnicas de cuantizacion: sirve como referencia reproducible de HQQ 4-bit con block=128 y embeddings BF16 separados para estudiar el impacto de la cuantizacion en la calidad de salida.
- Pipelines de generacion de texto por lotes con requisitos de determinismo: la validacion con decodificacion greedy y `precision=high` documenta un modo de ejecucion estable para tareas donde la reproducibilidad importa.
- Base para experimentos de conversion: el repositorio incluye `export_args.json` y `refresh_metadata.json`, utiles para reexportar el modelo con otros parametros y comparar resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se publican mediciones de rendimiento ni cifras de memoria por dispositivo, y que las pruebas realizadas son verificaciones estructurales y de determinismo, no evaluaciones de precision. Los casos predefinidos (`greeting`, `arithmetic`, `translation`, `long_translation`) se usan como smoke tests, no como benchmark de exactitud.

## Requisitos de hardware

- VRAM: no aplica en la configuracion validada, que es CPU x64. No se han publicado cifras de memoria RAM necesaria.
- GPU: no verificadas. Metal, OpenCL, Vulkan y CUDA aparecen explicitamente como no validados por el autor.
- CPU: validado unicamente en x64. La configuracion por defecto usa `backend_type: cpu`, `memory: low`, `precision: low` y `thread_num: 4`.
- Dispositivos moviles: no verificados (ARM CPU FP16 tampoco).
- Despliegue: runtime MNN 3.6.2 compilado desde el commit `b0239771b07b317a258fbc384683bbd540741406` con `MNN_BUILD_LLM=ON`, `MNN_LOW_MEMORY=ON`, `MNN_BUILD_CONVERTER=ON` y `MNN_SUPPORT_TRANSFORMER_FUSE=ON`. No se mencionan vLLM, llama.cpp, Ollama ni TGI; el formato MNN no es compatible con esos motores.
- Latencia y throughput: no disponibles.
- Tamano del repositorio: 8,8 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| taobao-mnn/Qwen2.5-7B-Instruct-MNN | 7B (denso, 28 capas) | 32768 declarado, no medido | MNN + HQQ 4-bit | apache-2.0 | Solo CPU x64 validado; sin benchmarks publicados |
| Qwen/Qwen2.5-7B-Instruct | 7B | 32768 (declarado por el modelo base) | safetensors (BF16) | apache-2.0 | Modelo original; requiere runtime estandar (Transformers, vLLM, etc.) |
| taobao-mnn (otros paquetes MNN de la misma familia) | variable | no disponible | MNN | segun modelo base | Misma cadena de conversion; no se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion disponible; la comparacion se limita a formato, licencia y alcance de validacion.

## Limitaciones y advertencias

- Validacion restringida a CPU x64: ARM CPU FP16, Metal, OpenCL, Vulkan, CUDA y moviles no han sido verificados; no debe asumirse su funcionamiento en esas plataformas.
- El contexto maximo real no esta medido: `max_position_embeddings=32768` es un campo de configuracion, no una garantia de calidad a esa longitud.
- La cuantizacion HQQ 4-bit puede degradar la calidad de salida; el autor advierte que la salida cuantizada puede contener errores aunque el alineamiento FP32 del exportador sea correcto.
- No hay benchmarks de precision publicados; las pruebas realizadas son estructurales (parada natural, ausencia de caracteres de reemplazo, ausencia de repeticiones anomalas) y no miden exactitud.
- Idiomas limitados a chino e ingles segun los metadatos; el comportamiento en castellano u otros idiomas no esta verificado.
- Sin soporte declarado de tool calling, agentes, vision o audio en este paquete.
- La licencia apache-2.0 se hereda del modelo base; la conversion no amplia derechos y persisten las obligaciones de atribucion y politica de uso del modelo original.
- El paquete debe actualizarse como un todo (grafo, pesos, tokenizador, embeddings, plantilla y configuracion); mezclar revisiones o sustituir solo el grafo puede romper la coherencia.
- La reproducibilidad byte a byte no esta garantizada al reexportar con otras versiones de dependencias.
- El limite de generacion por defecto es de 512 tokens si no se sobrescribe en el runtime.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/taobao-mnn/Qwen2.5-7B-Instruct-MNN
- Modelo base en ModelScope: https://modelscope.cn/models/Qwen/Qwen2.5-7B-Instruct/summary
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct/blob/main/LICENSE
- Exportador MNN (commit fijado): https://github.com/alibaba/MNN/tree/b0239771b07b317a258fbc384683bbd540741406/transformers/llm/export
- Documentacion MNN-LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
- Repositorio MNN: https://github.com/alibaba/MNN
- Parametros de exportacion (en el repo): `export_args.json`
- Metadatos de verificacion (en el repo): `refresh_metadata.json`
