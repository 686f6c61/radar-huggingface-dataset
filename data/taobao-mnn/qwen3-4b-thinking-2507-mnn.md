# taobao-mnn/Qwen3-4B-Thinking-2507-MNN

## Resumen

Qwen3-4B-Thinking-2507-MNN es un paquete de inferencia de texto en formato MNN derivado del modelo Qwen/Qwen3-4B-Thinking-2507, publicado por el equipo taobao-mnn. No se trata de un modelo entrenado desde cero, sino de una conversión cuantizada del modelo original de Qwen para ejecutarse sobre el motor MNN (Mobile Neural Network) de Alibaba, orientado a despliegue en CPU y dispositivos con recursos limitados.

El paquete conserva la arquitectura del modelo fuente, declarada como `Qwen3ForCausalLM` con `model_type=qwen3` y 36 capas de lenguaje. La model card no declara routing de expertos, por lo que no hay evidencia de que sea un modelo MoE; el nombre del repositorio no debe interpretarse como indicador de arquitectura o número de parámetros. El campo de configuración `max_position_embeddings` es 262144, pero el autor aclara explícitamente que no constituye un contexto máximo verificado.

La relevancia de este paquete es operativa: ofrece pesos ya convertidos con cuantización HQQ (4 bits en el backbone lineal, 8 bits en la cabeza LM) y una configuración de ejecución probada sobre MNN 3.6.2, con validación limitada a CPU x64. Es útil para quien necesite desplegar un modelo de razonamiento de la familia Qwen3 en entornos sin GPU, asumiendo las limitaciones de verificación que el propio autor documenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3ForCausalLM` (model_type `qwen3`), 36 capas de lenguaje |
| Parametros totales | no disponible (el autor no infiere el recuento desde el nombre del repositorio) |
| Parametros activos | no aplica (sin routing de expertos declarado) |
| Longitud de contexto | `max_position_embeddings=262144` en configuración; no es contexto máximo verificado. Entradas de prueba reales: 17–873 tokens |
| Tipos de cuantizacion | HQQ 4 bits (block=64, alpha_bytes=2 FP16, sym=false) en backbone lineal; HQQ 8 bits (block=64) en cabeza LM; embeddings comparten pesos de la cabeza LM cuantizada |
| Idiomas soportados | zh, en |
| Licencia | apache-2.0 (heredada del modelo upstream) |
| Formato de pesos | MNN (paquete de inferencia MNN; no safetensors ni GGUF) |
| Tamano del repositorio | 5.2 GB |
| Version de runtime | MNN 3.6.2, commit `b0239771b07b317a258fbc384683bbd540741406` |
| Generacion maxima por defecto | 4096 tokens (`max_new_tokens`) |

## Arquitectura y entrenamiento

El paquete no incluye entrenamiento propio: es una conversión del modelo Qwen/Qwen3-4B-Thinking-2507, cuya arquitectura declarada es un transformer causal (`Qwen3ForCausalLM`) con 36 capas. Solo se exporta el módulo de lenguaje (entrada y salida de texto); no se incluyen módulos de visión, audio ni vídeo. La model card no aporta datos sobre composición del dataset, número de tokens de entrenamiento ni si hubo RLHF o DPO en el modelo original.

La innovación técnica relevante está en el pipeline de cuantización y exportación. El backbone lineal usa HQQ de 4 bits con bloques de 64 y escalas en FP16, mientras que la cabeza de salida LM usa HQQ de 8 bits; los embeddings de entrada no son BF16 independientes, sino que comparten los pesos cuantizados de la cabeza LM. La conversión se realiza con el exportador `llmexport.py` de MNN, con opciones `--export mnn --hqq --quant_bit 4 --quant_block 64 --lm_quant_bit 8 --lm_quant_block 64 --scale_bit 16 --embed_bit 16`. El autor documenta una verificación de alineación FP32 entre la implementación fuente y el exportador (prefill/decode, embedding, capa representativa, norm y logits) sobre las 36 capas, aunque aclara que esto no implica coincidencia token a token de la salida cuantizada.

## Capacidades

- Generación de texto en chino e inglés, con modo de razonamiento forzado (`reasoning: forced`), es decir, el modelo piensa antes de responder y no se desactiva por defecto.
- Razonamiento multi-paso y aritmética: los casos de prueba incluidos cubren saludos, aritmética, traducción y traducción larga.
- Traducción entre los idiomas soportados (zh/en), con un caso de prueba de 873 tokens de entrada.
- Generación con parada natural y sin caracteres de reemplazo ni repeticiones anómalas en las pruebas de determinismo documentadas.
- Muestreo configurable mediante sampler mixto: penalty, topK, topP, min_p y temperature (valores por defecto: temperature 0.7, top_k 20, top_p 0.8, repetition_penalty 1.05, min_p 0).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni vídeo en este paquete.
- No se documenta soporte multilingüe más allá de zh y en.

## Casos de uso

- Despliegue en servidores sin GPU: el paquete está validado en CPU x64 con MNN 3.6.2 y configuración de baja memoria (`memory: low`, `precision: low`), lo que permite ejecutar un modelo de razonamiento de 36 capas en infraestructura de solo CPU.
- Aplicaciones de escritorio o edge con MNN: al ser un paquete MNN, encaja en el ecosistema de MNN para integrar inferencia local en aplicaciones nativas, aunque el autor advierte que ARM CPU FP16, Metal, OpenCL, Vulkan y CUDA no están verificados.
- Traducción zh-en en pipelines internos: los casos de prueba de traducción y traducción larga (hasta 873 tokens) respaldan este uso, con la cautela de que las pruebas son de estructura, no de calidad de traducción.
- Asistencia aritmética y razonamiento paso a paso: el modo de pensamiento forzado es adecuado para tareas donde se requiere cadena de razonamiento explícita, con un presupuesto de 4096 tokens de generación.
- Prototipado y evaluación de cuantización HQQ: el paquete incluye `export_args.json` y `refresh_metadata.json`, lo que lo hace útil como referencia reproducible para comparar la salida cuantizada frente al modelo original.
- Pruebas de regresión de motores de inferencia: los scripts de descarga, compilación y ejecución documentados permiten montar un banco de pruebas determinista (greedy, precision=high, 8 hilos) para validar versiones de MNN.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se publican mediciones de rendimiento ni cifras de memoria por dispositivo, y que no hay conclusiones de validación en GPU, FP16 móvil, visión, audio o vídeo.

Las únicas métricas documentadas son de verificación funcional, no de calidad:

| Prueba | Alcance | Resultado |
|---|---|---|
| Alineación FP32 fuente vs. exportador | Prefill/decode, embedding, capa representativa, norm, logits; 36 capas | Alineación correcta (no implica igualdad token a token tras cuantizar) |
| Determinismo | CPU x64, greedy, precision=high, 8 hilos, use_mmap=false, presupuesto 8192 | Casos `greeting`, `arithmetic`, `translation`, `long_translation`: parada natural, sin caracteres de reemplazo ni repetición anómala |
| Smoke con configuración por defecto | Muestreo y precisión por defecto, thinking activo, límite 4096 tokens | Comprobaciones estructurales superadas, sin exceder el límite |
| Longitud de entrada | Casos predefinidos | Rango 17–873 tokens (`long_translation`: 873) |

## Requisitos de hardware

- VRAM estimada: no disponible. El paquete está orientado a CPU y el autor no publica cifras de memoria por dispositivo.
- GPU recomendadas: no disponibles; CUDA, Metal, OpenCL y Vulkan figuran como no verificados.
- CPU: validado únicamente en x64. La configuración por defecto usa `backend_type: cpu`, `thread_num: 4`, `memory: low` y `precision: low`.
- ARM CPU FP16, dispositivos móviles y aceleradores gráficos: no verificados por el autor.
- Despliegue: exclusivamente mediante MNN 3.6.2 (o superior con regresión propia), compilado con `MNN_BUILD_LLM=ON`, `MNN_LOW_MEMORY=ON`, `MNN_BUILD_CONVERTER=ON` y `MNN_SUPPORT_TRANSFORMER_FUSE=ON`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; no se han publicado mediciones.
- Almacenamiento: repositorio de 5.2 GB; el autor recomienda descargar el paquete completo y no mezclar revisiones ni sustituir solo el archivo de grafo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| taobao-mnn/Qwen3-4B-Thinking-2507-MNN | no disponible (36 capas) | 262144 en config, no verificado | MNN (HQQ 4/8 bits) | apache-2.0 | Validado solo en CPU x64; sin benchmarks publicados |
| Qwen/Qwen3-4B-Thinking-2507 (modelo fuente) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | safetensors (formato original de Qwen) | apache-2.0 | Modelo de referencia; el paquete MNN es una conversión cuantizada del mismo |
| Otras conversiones MNN de la familia Qwen3 | no disponible | no disponible | MNN | apache-2.0 (heredada) | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de benchmarks que permitan comparar rendimiento frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Verificación muy acotada: solo se valida CPU x64; ARM CPU FP16, Metal, OpenCL, Vulkan, CUDA y dispositivos móviles quedan sin verificar.
- Sin benchmarks de calidad: no hay resultados de MMLU, HumanEval, GSM8K ni similares; las pruebas documentadas comprueban estructura y determinismo, no precisión.
- Contexto no verificado: `max_position_embeddings=262144` es un campo de configuración; las entradas probadas no superan los 873 tokens.
- Riesgo de alucinación y errores: el autor advierte que la salida cuantizada puede seguir produciendo errores; la cuantización HQQ de 4 bits en el backbone puede degradar la calidad frente al modelo original.
- Modo de razonamiento forzado: la categoría `reasoning` es `forced`, por lo que no se puede desactivar el pensamiento sin cambiar la configuración; esto incrementa el consumo de tokens.
- Idiomas limitados: solo chino e inglés; no se documenta soporte de castellano.
- Sin capacidades multimodales ni tool calling documentados: solo se exporta el módulo de lenguaje.
- Licencia: apache-2.0 heredada del modelo upstream; la cuantización no amplía la autorización y persisten las obligaciones de atribución y política de uso del modelo original.
- Integridad del paquete: no se deben mezclar revisiones ni reemplazar solo el archivo de grafo; los pesos, tokenizador, plantilla y configuración deben actualizarse conjuntamente.
- Reproducibilidad: una reexportación con versiones distintas de dependencias no garantiza bytes idénticos; hay que revalidar en un directorio de salida nuevo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/taobao-mnn/Qwen3-4B-Thinking-2507-MNN
- Modelo fuente en ModelScope: https://modelscope.cn/models/Qwen/Qwen3-4B-Thinking-2507/summary
- Licencia del modelo upstream: https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507/blob/main/LICENSE
- Repositorio MNN: https://github.com/alibaba/MNN
- Exportador MNN (commit fijado): https://github.com/alibaba/MNN/tree/b0239771b07b317a258fbc384683bbd540741406/transformers/llm/export
- Documentación MNN-LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
- Parámetros de exportación: `export_args.json` (en el repositorio)
- Metadatos de verificación: `refresh_metadata.json` (en el repositorio)
