# taobao-mnn/Qwen3-14B-MNN

## Resumen

Qwen3-14B-MNN es un paquete de inferencia en formato MNN del modelo Qwen3-14B de Alibaba Qwen, convertido por el equipo taobao-mnn para su uso con el motor MNN (Mobile Neural Network) de Alibaba. El modelo subyacente es un transformer denso de tipo `Qwen3ForCausalLM` con 40 capas, pensado para generacion de texto en chino e ingles. La particularidad de este repositorio no es el modelo en si, sino el artefacto: pesos cuantizados en 4 bits mediante HQQ (Half-Quadratic Quantization) con block=128, empaquetados junto con el grafo de ejecucion MNN para despliegue en CPU.

La relevancia de esta ficha es practica: permite ejecutar un modelo de 14B parametros en CPU x64 con un consumo de disco de 16,9 GB, sin necesidad de GPU, usando el runtime MNN 3.6.2. Es una via de despliegue orientada a entornos con recursos limitados o sin acelerador dedicado, y el autor documenta de forma inusualmente explicita los limites de la validacion realizada (solo CPU x64, sin verificacion en ARM, Metal, OpenCL, Vulkan, CUDA ni dispositivos moviles).

El paquete es una conversion, no un modelo nuevo: no introduce cambios en la arquitectura, el entrenamiento ni los datos. Cualquier capacidad o limitacion del Qwen3-14B original se hereda, con el anadido de la perdida de precision propia de la cuantizacion a 4 bits. La licencia Apache 2.0 del modelo original se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, `Qwen3ForCausalLM` (model_type `qwen3`), 40 capas |
| Parametros totales | 14B (segun el modelo base Qwen3-14B; el repositorio no declara un recuento medido propio) |
| Parametros activos | no disponible (no es MoE; la configuracion no declara expertos de enrutamiento) |
| Longitud de contexto | `max_position_embeddings=40960` en configuracion; el autor advierte que no es un maximo de contexto medido |
| Tipos de cuantizacion | HQQ 4-bit, block=128, alpha_bytes=2 (FP16), sym=false, tanto en pesos lineales del tronco como en la cabeza LM; embeddings en BF16 separado (`embeddings_bf16.bin`) |
| Idiomas soportados | zh, en |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3-14B) |
| Formato de pesos | MNN (grafo + pesos cuantizados), con archivo de embeddings BF16 independiente |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only denso de 40 capas con atencion causal estandar, sin mezcla de expertos. El repositorio no aporta informacion sobre el entrenamiento original (numero de tokens, composicion del dataset, fases de RLHF o DPO); esa informacion corresponde a la model card de Qwen/Qwen3-14B y no se reproduce aqui. Lo que si documenta este paquete es el proceso de conversion: exportacion con el exportador LLM de MNN en el commit `b0239771b07b317a258fbc384683bbd540741406`, usando `--export mnn --hqq --quant_bit 4 --quant_block 128 --lm_quant_bit 4 --lm_quant_block 128 --scale_bit 16 --embed_bit 16 --seperate_embed`.

La innovacion tecnica del paquete es la combinacion de cuantizacion HQQ de 4 bits (con escalas en FP16 y cuantizacion asimetrica desactivada) con el runtime MNN, que incorpora fusion de operadores de transformer (`MNN_SUPPORT_TRANSFORMER_FUSE`) y modo de baja memoria (`MNN_LOW_MEMORY`). Los embeddings de entrada se mantienen en BF16 en un archivo aparte, lo que preserva mayor fidelidad en la capa de embedding a costa de tamano. El autor realizo una verificacion de alineamiento FP32 entre la implementacion de referencia y el exportador en prefill/decode, embedding, capas representativas, norm y logits, pero solo sobre 4 capas truncadas, por lo que no constituye una validacion numerica de todas las capas ni garantiza coincidencia token a token tras la cuantizacion.

## Capacidades

- Generacion de texto en chino e ingles, heredada del Qwen3-14B original.
- Modo de razonamiento hibrido: la configuracion clasifica el modelo como `hybrid` en cuanto a reasoning, sin desactivar el pensamiento forzado.
- Respuesta a instrucciones y conversacion multi-turno (dentro de los limites reales de contexto, no verificados mas alla de 886 tokens de prompt en las pruebas del autor).
- Generacion de codigo y matematicas: las pruebas incluyen casos de aritmetica, pero no se publican resultados de benchmarks que cuantifiquen el rendimiento en estas tareas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada para este paquete.
- Soporte de agentes y razonamiento multi-paso: no verificado en este paquete.
- Capacidades multimodales (vision, audio, video): no disponibles; el autor indica explicitamente que solo se exporta el modulo de lenguaje y que no hay validacion de vision, audio ni video.
- Capacidades multilingues: limitadas a zh y en segun los metadatos.

## Casos de uso

- Despliegue en servidores sin GPU: el paquete MNN con cuantizacion HQQ 4-bit permite ejecutar un modelo de 14B en CPU x64, adecuado para entornos donde no hay acelerador disponible o el coste de GPU no esta justificado. El autor valida explicitamente este escenario.
- Prototipado y pruebas de integracion en local: con MNN 3.6.2 y el binario `llm_demo` se puede levantar una inferencia de texto con la configuracion incluida (CPU, low memory, 4 hilos), util para validar prompts y plantillas antes de pasar a produccion.
- Aplicaciones embebidas y de borde sobre MNN: el motor MNN esta disenado para despliegue en dispositivos, por lo que el paquete encaja en pipelines moviles o de borde, aunque el autor advierte que ARM CPU FP16, Metal, OpenCL, Vulkan y moviles no estan verificados en esta entrega.
- Generacion de texto en chino e ingles con contexto moderado: tareas de resumen, reescritura, traduccion y respuesta a preguntas donde el prompt no supere longitudes verificadas (30-886 tokens en las pruebas publicadas).
- Traduccion y procesamiento de documentos: el caso `long_translation` con 886 tokens de prompt paso las comprobaciones estructurales, lo que sirve como referencia de longitud manejable, no como garantia de calidad.
- Base para reexportacion y ajuste de cuantizacion: el repositorio documenta el comando completo de exportacion, de modo que un equipo puede reproducir el paquete con otros parametros de cuantizacion o versiones de MNN, revalidando el resultado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no publica mediciones de rendimiento ni cifras de memoria por dispositivo, y que las pruebas realizadas son comprobaciones estructurales y de determinismo (generacion greedy, precision alta, 8 hilos, `use_mmap=false`, presupuesto de 4096 tokens) sobre cuatro casos predefinidos (greeting, arithmetic, translation, long_translation), no una evaluacion de precision.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el escenario validado; el paquete esta verificado solo en CPU x64. No se publican cifras de memoria por dispositivo.
- GPU recomendadas: no disponibles; no hay validacion en CUDA, Metal, OpenCL ni Vulkan.
- Compatibilidad con GPU de consumo: no verificada en esta entrega.
- Tamano en disco: 16,9 GB para el repositorio completo (pesos cuantizados 4-bit mas embeddings BF16 y grafo MNN).
- Opciones de despliegue: runtime MNN 3.6.2 compilado con `MNN_BUILD_LLM=ON`, `MNN_LOW_MEMORY=ON`, `MNN_BUILD_CONVERTER=ON`, `MNN_SUPPORT_TRANSFORMER_FUSE=ON` y `MNN_SEP_BUILD=OFF`; binario `llm_demo` incluido en la compilacion. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Configuracion por defecto del paquete: backend CPU, memoria baja, precision baja, 4 hilos, sampler mixto (topK, topP, min_p, temperature) con temperature 0.6, top_k 20, top_p 0.95, min_p 0, y limite de generacion de 512 tokens.
- Latencia y throughput: no publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Validacion |
|---|---|---|---|---|---|
| Qwen3-14B-MNN (este paquete) | 14B | 40960 en configuracion (no medido) | MNN, HQQ 4-bit | Apache 2.0 | Solo CPU x64 |
| Qwen/Qwen3-14B (original) | 14B | 40960 en configuracion | safetensors, BF16 | Apache 2.0 | No disponible en esta ficha |
| Otras conversiones MNN de modelos de ~14B | no disponible | no disponible | MNN | variable | no disponible |
| Alternativas GGUF de Qwen3-14B (llama.cpp) | 14B | no disponible | GGUF, Q4_K_M y similares | Apache 2.0 | no disponible en esta ficha |

La comparativa se limita a lo verificable: el paquete MNN se distingue del original por el formato y la cuantizacion, no por capacidades. No se dispone de datos de rendimiento comparativo entre esta conversion y otras alternativas de cuantizacion del mismo modelo base.

## Limitaciones y advertencias

- Validacion restringida: solo se ha verificado CPU x64. ARM CPU FP16, Metal, OpenCL, Vulkan, CUDA y dispositivos moviles quedan sin verificar por el autor.
- Perdida de precision por cuantizacion: los pesos lineales y la cabeza LM estan en HQQ 4-bit; el autor advierte que la salida cuantizada puede contener errores.
- Contexto no medido: `max_position_embeddings=40960` es un campo de configuracion, no un maximo de contexto verificado. Las pruebas cubren prompts de 30 a 886 tokens.
- Sin benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni metricas equivalentes; no es posible comparar su calidad con el modelo original ni con otras cuantizaciones.
- Idiomas limitados a chino e ingles; no se declara soporte de castellano.
- Riesgo de alucinacion: inherente al modelo base y no cuantificado en este paquete.
- Sesgos: no documentados en la informacion disponible; se heredan los del modelo base.
- Integridad del paquete: el autor exige actualizar de forma conjunta grafo, pesos externos, tokenizador, embeddings, plantillas y configuracion; mezclar revisiones o sustituir solo el archivo de grafo puede romper la inferencia.
- Reproducibilidad: la reexportacion con distintas versiones de dependencias no garantiza bytes identicos; hay que usar un directorio de salida nuevo y revalidar.
- Licencia: Apache 2.0 heredada; la conversion no amplia los derechos. Hay que cumplir las obligaciones de atribucion y la politica de uso del modelo original.
- Sin soporte documentado de tool calling ni de agentes en este paquete.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/taobao-mnn/Qwen3-14B-MNN
- Modelo base en ModelScope: https://modelscope.cn/models/Qwen/Qwen3-14B/summary
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-14B/blob/main/LICENSE
- Exportador MNN (commit fijado): https://github.com/alibaba/MNN/tree/b0239771b07b317a258fbc384683bbd540741406/transformers/llm/export
- Documentacion MNN-LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
- Repositorio MNN: https://github.com/alibaba/MNN
