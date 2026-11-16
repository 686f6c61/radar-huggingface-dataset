# taobao-mnn/Hunyuan-4B-Instruct-MNN

## Resumen

Hunyuan-4B-Instruct-MNN es un paquete de inferencia de texto en formato MNN derivado del modelo Tencent Hunyuan-4B-Instruct, publicado por el equipo taobao-mnn. No se trata de un modelo entrenado desde cero, sino de una conversión cuantizada del modelo base de Tencent, empaquetada con el formato de grafo y pesos propio del motor MNN de Alibaba. El objetivo es permitir la ejecución del modelo en CPU sin depender de frameworks de inferencia de gran tamano, manteniendo una huella de memoria reducida.

El modelo base declara la arquitectura `HunYuanDenseV1ForCausalLM` (model_type `hunyuan_v1_dense`) con 36 capas de lenguaje y un campo `max_position_embeddings` de 262144, aunque el autor advierte explicitamente que ese valor no constituye una longitud de contexto maxima medida. La conversión aplica cuantizacion HQQ de 4 bits a las lineas del tronco lingueistico y de 8 bits a la cabeza LM, con bloques de 64 y escalas en FP16.

La relevancia de este paquete es operativa: ofrece un artefacto reproducible (con version de MNN, commit y parametros de exportacion documentados) para desplegar un modelo de 4B en entornos x64 sin GPU. Su validacion, sin embargo, es acotada: el autor solo ha verificado x64 CPU, dejando sin probar ARM, Metal, OpenCL, Vulkan, CUDA y dispositivos moviles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `HunYuanDenseV1ForCausalLM` (model_type `hunyuan_v1_dense`), transformer denso, 36 capas |
| Parametros totales | no disponible (el autor no infiere el numero de parametros a partir del nombre del repositorio) |
| Parametros activos | no aplica (arquitectura densa, sin expertos enrutados) |
| Longitud de contexto | no disponible como valor medido; `max_position_embeddings=262144` en configuracion, sin validacion de contexto maximo |
| Tipos de cuantizacion | HQQ 4 bits (tronco, block=64, alpha_bytes=2 FP16, sym=false); HQQ 8 bits (cabeza LM, block=64, alpha_bytes=2 FP16, sym=false); embeddings comparten los pesos cuantizados de la cabeza LM |
| Idiomas soportados | zh, en |
| Licencia | TENCENT HUNYUAN COMMUNITY LICENSE AGREEMENT (metadato `other`) |
| Formato de pesos | MNN (grafo y pesos empaquetados); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El paquete no documenta el proceso de entrenamiento del modelo base: la model card no transcribe datos de preentrenamiento, numero de tokens, composicion del dataset ni si hubo RLHF o DPO, y remite al modelo original de Tencent para esa informacion. Lo que si se detalla es la arquitectura declarada en la configuracion: un transformer denso de 36 capas con clase `HunYuanDenseV1ForCausalLM`, sin rutas de expertos. El exportador solo extrae el modulo de lenguaje, por lo que el paquete es estrictamente texto a texto.

La innovacion tecnica del artefacto esta en la cadena de conversion, no en el modelo. Se usa el exportador estandar de MNN en un commit fijado (`b0239771b07b317a258fbc384683bbd540741406`) con `--export mnn --hqq`, cuantizando el tronco a 4 bits y la cabeza LM a 8 bits con escalas FP16. El autor documenta una verificacion de alineacion FP32 entre la implementacion de origen y el exportador en prefill/decode, embeddings, capa representativa, normalizacion y logits sobre las 36 capas, aunque advierte que esto no garantiza equivalencia token a token tras la cuantizacion. La configuracion de runtime por defecto fija backend CPU, `precision: low`, `memory: low`, 4 hilos, muestreo mixto (penalty, topK, topP, min_p, temperature) con temperature 0.7, top_k 20, top_p 0.8 y repetition_penalty 1.05, y un limite de generacion de 2048 tokens.

## Capacidades

- Generacion de texto en chino e ingles, unico par de idiomas declarado.
- Razonamiento y aritmetica basica: los casos de validacion incluyen `arithmetic` y `greeting`.
- Traduccion: los casos de prueba incluyen `translation` y `long_translation` (este ultimo con 796 tokens de prompt).
- Modo de razonamiento hibrido: la configuracion clasifica el modelo como `hybrid` y el autor indica que no desactiva el pensamiento forzado por defecto; el contexto Jinja de prueba usa `{"enable_thinking": false}`.
- Inferencia en CPU x64 mediante el runtime MNN, con soporte de bajo consumo de memoria (`MNN_LOW_MEMORY=ON`) y fusion de transformer (`MNN_SUPPORT_TRANSFORMER_FUSE=ON`).
- No se declaran capacidades de tool calling, function calling, agentes, vision, audio ni video; el paquete solo exporta el modulo de lenguaje.

## Casos de uso

- Despliegue de un LLM de 4B en servidores sin GPU: el paquete esta validado en x64 CPU con MNN 3.6.2, por lo que encaja en entornos de virtualizacion o CI donde no hay acelerador disponible y se necesita un modelo bilingue zh/en.
- Traduccion chino-ingles en linea: los casos de validacion cubren traduccion simple y de prompt largo (796 tokens), lo que respalda su uso en pipelines de traduccion por lotes con prompts de tamano moderado.
- Asistente conversacional de bajo coste: con 2048 tokens de generacion por defecto y muestreo configurado, puede sostener dialogos multi-turno en aplicaciones de escritorio o backends ligeros.
- Procesamiento por lotes de texto en chino e ingles: al ejecutarse en CPU con cuantizacion 4/8 bits, es adecuado para tareas de resumen, clasificacion o reescritura en colas nocturnas donde la latencia no es critica.
- Pruebas de integracion de MNN en productos propios: sirve como referencia reproducible (commit, version de runtime y parametros de exportacion documentados) para validar la cadena de conversion antes de exportar modelos propios.
- Prototipado de aplicaciones moviles o embebidas: aunque el autor no ha validado ARM, Metal, OpenCL ni Vulkan, el formato MNN es el que usa el ecosistema para estos destinos, por lo que el paquete puede emplearse como punto de partida sujeto a regresion propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no publica cifras de rendimiento ni de memoria por dispositivo, y que las pruebas realizadas (deterministas y de smoke test) no constituyen una evaluacion de precision. Los unicos datos medidos son de longitud de entrada: prompts de 13 a 796 tokens en los casos predefinidos.

## Requisitos de hardware

- VRAM: no disponible; el paquete esta orientado a CPU y no se han validado rutas GPU.
- GPU recomendadas: no disponible; CUDA, Metal, OpenCL y Vulkan figuran como no verificados.
- GPU de consumo: no disponible; no hay confirmacion de funcionamiento en RTX 4090 ni en ninguna otra.
- Despliegue: runtime MNN 3.6.2 compilado con `MNN_BUILD_LLM=ON`, `MNN_LOW_MEMORY=ON`, `MNN_BUILD_CONVERTER=ON` y `MNN_SUPPORT_TRANSFORMER_FUSE=ON`; ejecucion mediante el binario `llm_demo` con `config.json` y un fichero de prompt.
- Latencia y throughput: no disponibles; el autor no publica mediciones.
- Tamano del repositorio: 5.4 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Validacion |
|---|---|---|---|---|---|
| Hunyuan-4B-Instruct-MNN | no disponible (base de 4B, 36 capas) | 262144 declarados, no medidos | MNN, HQQ 4/8 bits | Tencent Hunyuan Community License | solo x64 CPU |
| tencent/Hunyuan-4B-Instruct (original) | 4B (segun denominacion) | 262144 declarados | safetensors (formato habitual del original) | Tencent Hunyuan Community License | no disponible en esta informacion |
| Alternativas GGUF de tamano similar | no disponible | no disponible | GGUF | variable | no disponible |

No se dispone de datos de benchmarks ni de especificaciones verificadas de los modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Validacion restringida: solo se ha verificado x64 CPU; ARM CPU FP16, Metal, OpenCL, Vulkan, CUDA y dispositivos moviles quedan sin probar.
- La cuantizacion HQQ 4/8 bits puede introducir errores; el autor advierte que las salidas cuantizadas pueden ser incorrectas aunque la alineacion FP32 del exportador sea correcta.
- El valor `max_position_embeddings=262144` es un campo de configuracion, no una longitud de contexto maxima medida; no debe usarse como garantia en produccion.
- Idiomas limitados a chino e ingles; no se declara soporte de castellano ni de otros idiomas.
- Sin capacidades de vision, audio, tool calling ni agentes: solo se exporta el modulo de lenguaje.
- Licencia Tencent Hunyuan Community License Agreement: impone obligaciones de atribucion y politica de uso; la conversion cuantizada no amplia los derechos concedidos por el titular original.
- El paquete debe actualizarse como un todo (grafo, pesos externos, tokenizador, embeddings, plantilla y configuracion); mezclar revisiones o sustituir solo el fichero de grafo puede romper la inferencia.
- Los casos de validacion son un conjunto reducido y predefinido; no constituyen una evaluacion de precision ni de robustez frente a sesgos o alucinaciones, sobre los que no se aporta informacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/taobao-mnn/Hunyuan-4B-Instruct-MNN
- Modelo original en ModelScope: https://modelscope.cn/models/Tencent-Hunyuan/Hunyuan-4B-Instruct/summary
- Repositorio MNN: https://github.com/alibaba/MNN
- Exportador MNN en el commit fijado: https://github.com/alibaba/MNN/tree/b0239771b07b317a258fbc384683bbd540741406/transformers/llm/export
- Documentacion MNN-LLM: https://mnn-docs
