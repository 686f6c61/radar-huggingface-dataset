# taobao-mnn/Qwen3-4B-SafeRL-MNN

## Resumen

Qwen3-4B-SafeRL-MNN es un paquete de inferencia de texto para el motor MNN (Mobile Neural Network, de Alibaba) construido a partir del modelo Qwen/Qwen3-4B-SafeRL. Lo publica la organizacion taobao-mnn, que se encarga de convertir modelos de la familia Qwen a un formato optimizado para ejecucion en CPU mediante MNN. El objetivo no es ofrecer un modelo nuevo, sino un artefacto listo para desplegar el modelo base en entornos donde no hay GPU o donde se prefiere una pila ligera y determinista.

El modelo subyacente declara arquitectura `Qwen3ForCausalLM` (model_type `qwen3`) con 36 capas de lenguaje y un campo `max_position_embeddings` de 40960 en la configuracion. El paquete solo exporta el modulo de lenguaje (entrada y salida de texto), con pesos lineal del backbone cuantizados en HQQ 4 bits y la cabeza LM en HQQ 8 bits. La licencia es apache-2.0, heredada del modelo original.

La relevancia de esta ficha es doble: por un lado, documenta una conversion concreta con trazabilidad estricta (version de MNN 3.6.2, commit fijado, fecha de aceptacion 2026-11-12); por otro, deja claro que la validacion se limita a CPU x64 y que no hay verificacion en ARM, Metal, OpenCL, Vulkan, CUDA ni dispositivos moviles. Es, por tanto, un artefacto util para prototipado y despliegue en CPU, no una alternativa a los pesos originales en GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (model_type `qwen3`), transformer decoder-only, 36 capas |
| Parametros totales | no disponible (el repo ocupa 5.2 GB; no se declara el recuento exacto) |
| Parametros activos | no aplica (no es MoE; la config no declara expertos enrutados) |
| Longitud de contexto | max_position_embeddings=40960 en config; no es contexto maximo medido |
| Tipos de cuantizacion | HQQ 4 bits (backbone lineal, block=64, alpha_bytes=2 FP16, sym=false) y HQQ 8 bits (cabeza LM, block=64, alpha_bytes=2 FP16, sym=false); embeddings comparten pesos de la cabeza LM |
| Idiomas soportados | zh, en |
| Licencia | apache-2.0 |
| Formato de pesos | paquete MNN (grafo + pesos cuantizados HQQ), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Qwen3 con 36 capas de lenguaje, segun la configuracion de origen. El paquete MNN solo exporta el modulo de lenguaje: no incluye vision, audio ni video, y la entrada y salida son exclusivamente texto. La cuantizacion aplicada es HQQ (Half-Quadratic Quantization) con bloques de 64 y escalas en FP16 (`alpha_bytes=2`), simetrica desactivada (`sym=false`). El backbone lineal usa 4 bits y la cabeza de salida 8 bits; la matriz de embeddings de entrada no es una copia BF16 independiente, sino que comparte los pesos cuantizados de la cabeza LM.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, el proceso de alineamiento (RLHF/DPO) ni innovaciones de decodificacion del modelo original en la documentacion proporcionada. La model card del paquete MNN declara explicitamente que no reproduce afirmaciones de rendimiento o capacidad del modelo upstream que no hayan sido medidas en el propio paquete. La conversion se realizo con el exportador estandar de MNN en el commit `b0239771b07b317a258fbc384683bbd540741406` y la version de runtime MNN 3.6.2, con soporte de LLM, bajo consumo de memoria y fusion de transformer.

## Capacidades

- Generacion de texto en chino e ingles, con el modelo base Qwen3-4B-SafeRL como referencia.
- Razonamiento y respuesta a preguntas de tipo aritmetico y conversacional (validado en los casos de prueba del paquete: saludo, aritmetica, traduccion y traduccion larga).
- Traduccion entre idiomas soportados (se incluye un caso de traduccion larga de 875 tokens de prompt en la validacion).
- Modo de razonamiento hibrido: la configuracion clasifica el razonamiento como `hybrid` y no desactiva el pensamiento forzado por defecto; el contexto Jinja por defecto es `null`.
- Inferencia determinista en CPU x64 con muestreo configurable (penalty, topK, topP, min_p, temperature).
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni video en la informacion disponible.

## Casos de uso

- Prototipado en CPU sin GPU: el paquete esta disenado para ejecutarse con MNN en x64 CPU con precision baja y bajo consumo de memoria, lo que permite levantar un endpoint de generacion de texto en maquinas sin acelerador.
- Traduccion zh-en en entornos embebidos: la validacion incluye un caso de traduccion larga (875 tokens de prompt) que sugiere uso para traduccion de parrafos completos en pipelines sin GPU.
- Asistentes conversacionales ligeros: con contexto de hasta 40960 posiciones declaradas y generacion por defecto de 512 tokens, sirve para dialogos multi-turno de longitud moderada en aplicaciones de escritorio o servidores modestos.
- Generacion de respuestas a preguntas frecuentes: el caso aritmetico y de saludo validado indica utilidad para FAQ y respuestas cortas deterministas con muestreo controlado.
- Despliegue en contenedores con requisitos de memoria ajustados: la cuantizacion HQQ 4/8 bits y el modo `low memory` reducen la huella frente a los pesos originales, lo que facilita ejecutar el modelo en instancias pequenas.
- Evaluacion y comparacion de cuantizaciones: al incluir `export_args.json` y `refresh_metadata.json`, el paquete sirve como referencia reproducible para medir el impacto de HQQ 4/8 bits frente al modelo base en tareas de texto.
- Integracion en aplicaciones moviles o de borde (con cautela): aunque el motor MNN esta pensado para despliegue ligero, la model card advierte que ARM CPU FP16, Metal, OpenCL, Vulkan y dispositivos moviles no han sido verificados, por lo que este caso requiere validacion propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica explicitamente que no se publican cifras de rendimiento ni de memoria por dispositivo, y que las pruebas realizadas son de tipo estructural (determinismo, alineacion FP32, smoke test con la configuracion por defecto), no de precision o exactitud. Los casos validados cubren prompts de 19 a 875 tokens, pero no constituyen una evaluacion de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el paquete esta orientado a CPU y no se publican cifras de memoria.
- GPU recomendadas: no disponibles; la validacion solo cubre CPU x64. No hay verificacion en CUDA, Metal, OpenCL ni Vulkan.
- Compatibilidad con GPU de consumo: no verificada; no se puede confirmar que quepa en RTX 4090 u otras GPU consumer con este paquete.
- Despliegue: MNN 3.6.2 compilado con `MNN_BUILD_LLM=ON`, `MNN_LOW_MEMORY=ON`, `MNN_BUILD_CONVERTER=ON` y `MNN_SUPPORT_TRANSFORMER_FUSE=ON`; ejecutable de referencia `llm_demo`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI con este formato.
- Latencia y throughput: no disponibles; no se han publicado mediciones.
- Configuracion por defecto del paquete: backend CPU, memoria baja, precision baja, 4 hilos, temperature 0.6, top_k 20, top_p 0.95, repetition_penalty 1.1, sampler mixto y limite de generacion de 512 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-4B-SafeRL-MNN | no disponible (base 4B) | 40960 declarado | MNN + HQQ 4/8 bits | apache-2.0 | Solo CPU x64 validado; solo texto; zh/en |
| Qwen/Qwen3-4B-SafeRL | 4B (por nombre) | no disponible en esta ficha | safetensors (upstream) | apache-2.0 | Modelo original; pesos completos; requiere pila estandar (transformers, vLLM, etc.) |
| Qwen3-4B (familia Qwen3) | 4B | no disponible en esta ficha | safetensors, GGUF (segun distribucion) | apache-2.0 | Alternativa de referencia de la misma familia, sin el ajuste SafeRL |

No se dispone de datos de rendimiento comparado entre estas opciones en la informacion proporcionada, por lo que la comparativa se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Validacion restringida: solo se ha verificado CPU x64; ARM CPU FP16, Metal, OpenCL, Vulkan, CUDA y dispositivos moviles no estan validados.
- Sin datos de rendimiento: no hay benchmarks de precision, latencia ni memoria publicados; las pruebas son estructurales y de determinismo, no de calidad.
- Riesgo de alucinacion: la model card advierte que la salida cuantizada puede seguir produciendo errores; la cuantizacion HQQ 4 bits en el backbone puede degradar la fidelidad respecto al modelo original.
- Contexto: `max_position_embeddings=40960` es un campo de configuracion, no un contexto maximo medido; los casos validados llegan a 875 tokens de prompt.
- Idiomas: solo chino e ingles declarados; no se garantiza comportamiento en castellano ni en otros idiomas.
- Capacidades no cubiertas: no hay soporte documentado de vision, audio, video, tool calling ni agentes.
- Licencia: apache-2.0 heredada del modelo original; la conversion cuantizada no amplia la autorizacion y persisten las obligaciones de atribucion y politica de uso del upstream.
- Integridad del paquete: grafo, pesos, tokenizador, embeddings, plantilla y configuracion deben actualizarse como un conjunto; no se deben mezclar revisiones ni sustituir solo el archivo de grafo.
- Reproducibilidad: reexportar con distintas versiones de dependencias no garantiza bytes identicos; hay que usar un directorio de salida nuevo y revalidar.

## Enlaces

- Hugging Face: https://huggingface.co/taobao-mnn/Qwen3-4B-SafeRL-MNN
- Modelo base (ModelScope): https://modelscope.cn/models/Qwen/Qwen3-4B-SafeRL/summary
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-4B-SafeRL/blob/main/LICENSE
- Repositorio MNN: https://github.com/alibaba/MNN
- Exportador MNN (commit fijado): https://github.com/alibaba/MNN/tree/b0239771b07b317a258fbc384683bbd540741406/transformers/llm/export
- Documentacion MNN-LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
