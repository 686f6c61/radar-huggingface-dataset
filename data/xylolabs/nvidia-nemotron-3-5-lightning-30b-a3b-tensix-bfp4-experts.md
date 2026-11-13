# Xylolabs/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Tensix-BFP4-Experts

## Resumen

NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Tensix-BFP4-Experts es una cuantizacion del modelo base nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16, publicada por Xylolabs y orientada especificamente a la ejecucion sobre aceleradores Tenstorrent Tensix (Wormhole y Blackhole) mediante la pila de software TT-NN / tt-metal. El modelo conserva la arquitectura original NemotronH (hibrida entre atencion y capas Mamba-2) y el esquema de mezcla de expertos con 30B parametros totales y aproximadamente 3B activos por token, pero sustituye los pesos de las proyecciones lineales por tensores empaquetados en formatos de coma flotante por bloques: bfloat4_b (BFP4) para los expertos enrutados y bfloat8_b (BFP8) para el resto de proyecciones.

La relevancia de esta publicacion es doble. Por un lado, demuestra un flujo de cuantizacion GPTQ calibrado especificamente para el formato BFP4 de Tenstorrent, con matrices almacenadas como valores bf16 sobre la rejilla BFP4/BFP8 de modo que TT-NN las empaqueta sin alterar su valor numerico. Por otro lado, reduce el peso del modelo a 19,53 GB empaquetados (4,95 bits por peso de media), lo que lo hace desplegable en memoria DRAM de dispositivos Tensix y, potencialmente, en GPUs de consumo con cuantizacion adicional.

El checkpoint incluye solo el modelo principal de 52 capas; los tensores opcionales de prediccion multi-token (MTP) se han excluido y num_nextn_predict_layers es cero. La ejecucion nativa completa del modelo no ha sido validada para este perfil exacto, y tt-transformers y tt-forge no se han probado con este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NemotronH (hibrida: atencion + Mamba-2 + MoE), 52 capas |
| Parametros totales | 31.577.940.288 (~31,6B) |
| Parametros activos | ~3B (MoE, denominacion A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (bfloat4_b, 4,5 bits/peso) en expertos enrutados; BFP8 (bfloat8_b, 8,5 bits/peso) en atencion, Mamba-2 y experto compartido; bf16 en embeddings, LM head y normas; media 4,95 bits/peso |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (empaquetados para TT-NN; repo de 63,2 GB) |

## Arquitectura y entrenamiento

El modelo base emplea la arquitectura NemotronH, una combinacion de capas de atencion (6 capas con proyecciones q, k, v, o) y capas Mamba-2 (23 capas con proyecciones in y out), junto con un esquema de mezcla de expertos que incluye 23 capas con expertos enrutados (proyecciones up y down) y un experto compartido. Esta hibridacion busca combinar la eficiencia de estado recurrente de Mamba-2 en secuencias largas con la capacidad de recuperacion exacta de la atencion, manteniendo un coste de computo por token bajo gracias a los ~3B parametros activos.

La cuantizacion aplicada por Xylolabs usa GPTQ con busqueda de exponente por bloque para los tensores bfloat4_b, calibrada sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Las proyecciones up de los expertos enrutados comparten una unica matriz Hessiana por capa, mientras que cada proyeccion down de cada experto usa su propia Hessiana o, si vio pocos tokens de calibracion, redondeo al mas cercano. Los tensores bfloat8_b se cuantizan con redondeo al mas cercano. El sesgo de correccion de puntuacion del gate (e_score_correction_bias) se conserva en float32 sin modificar. Los tensores se almacenan como bf16 sobre la rejilla BFP, de modo que el empaquetado en TT-NN es exacto (verificado con ttnn 0.81.1 sobre el simulador ttsim de Blackhole). No se dispone de informacion sobre el proceso de entrenamiento del modelo base (numero de tokens, composicion del dataset, RLHF/DPO) en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat aplicable via apply_chat_template.
- Razonamiento y respuesta a preguntas en seis idiomas: ingles, espanol, frances, aleman, italiano y japones.
- Capacidades de mezcla de expertos con ~3B parametros activos por token, lo que reduce el coste de inferencia frente a un denso de 30B.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.
- Inferencia nativa en Tensix mediante TT-NN (empaquetado exacto de pesos BFP4/BFP8); ejecucion con Transformers 5.23.0 mediante NemotronHForCausalLM en bf16.

## Casos de uso

- Despliegue en hardware Tenstorrent: el checkpoint esta disenado para cargarse en NPUs Wormhole y Blackhole a traves de TT-NN, con 19,53 GB de memoria de dispositivo para los pesos del modelo de lenguaje mas espacio para KV cache y buffers. Es adecuado para equipos que ya operan infraestructura Tensix y quieren servir un modelo de 30B con ~3B activos.
- Servicio de chat multilingue en produccion: al soportar en, es, fr, de, it y ja, puede usarse como backend de atencion al cliente o asistentes internos en organizaciones europeas que necesiten cubrir varios idiomas con un unico modelo.
- Prototipado e investigacion en cuantizacion de bajo bit: el repo incluye quant4.json con el formato de cada proyeccion, pack_tensix.py para verificar el empaquetado matriz a matriz y verify_grid.py para validar la rejilla solo con torch; es una base util para estudiar el impacto de BFP4 con GPTQ en modelos MoE hibridos.
- Evaluacion de calidad de cuantizacion: la model card reporta metricas de divergencia KL respecto al BF16 y porcentaje de respuestas correctas, lo que permite comparar el efecto de BFP4 frente a BFP8 en tareas de generacion.
- Fine-tuning o adaptacion sobre el modelo base: al estar disponible el BF16 original (nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16), este checkpoint sirve como referencia de inferencia cuantizada para comparar frente a adaptaciones.
- Investigacion en arquitecturas hibridas Mamba-2 + atencion: el modelo permite experimentar con cargas de trabajo de contexto largo y evaluar el comportamiento de la parte Mamba-2 en NPUs con formatos BFP.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 main model (nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16) | 16 | 63,16 | 0 | 100 | 3 | no disponible |
| Este checkpoint (BFP4 experts / BFP8 projections) | 4,95 (medio) | 19,53 | no disponible en el extracto | no disponible | no disponible | no disponible |

La informacion proporcionada incluye una tabla de evaluacion truncada: solo se dispone de la fila del modelo BF16 de referencia (KL 0, Top-1 100%, 3 respuestas correctas). No se han publicado en la informacion disponible los valores completos de KL, Top-1 ni respuestas correctas para el checkpoint cuantizado, por lo que no se presentan cifras inventadas.

## Requisitos de hardware

- Memoria de dispositivo: 19,53 GB solo para los pesos del modelo de lenguaje, mas espacio para KV cache y buffers. En la practica se recomienda un dispositivo Tensix con al menos 24-32 GB de DRAM utilizable, o bien fragmentar el modelo entre varios dispositivos.
- GPUs Tensix compatibles: Tenstorrent Wormhole y Blackhole. Verificado con ttnn 0.81.1 sobre el simulador ttsim de Blackhole; no se ha validado la ejecucion nativa completa del modelo en hardware real para este perfil exacto.
- GPUs de consumo: no disponible. Al estar los pesos empaquetados en formatos BFP propietarios de TT-NN, no son directamente utilizables por vLLM, llama.cpp u Ollama; para GPU convencional habria que recurrir al modelo base BF16 o a otra cuantizacion (GPTQ/AWQ/GGUF) no publicada en este repo.
- Opciones de despliegue: TT-NN / tt-metal sobre Tensix; Transformers 5.23.0 con NemotronHForCausalLM en bf16 (carga con device_map="auto"); scripts pack_tensix.py y verify_grid.py del repo de codigo tensix-bfp-gptq.
- Latencia y throughput: no disponible. No se han publicado mediciones de latencia ni throughput en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Tensix-BFP4-Experts (este) | 31,6B totales / ~3B activos | no disponible | BFP4 expertos + BFP8 proyecciones (4,95 bits/peso) | openmdw-1.1 | Hugging Face, safetensors |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 (base) | 31,6B totales / ~3B activos | no disponible | BF16 (16 bits/peso) | openmdw-1.1 | Hugging Face, safetensors |
| Alternativas de tamano y tarea similares | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de benchmarks ni de especificaciones de modelos alternativos de la misma categoria (MoE de ~30B con ~3B activos) para establecer una comparativa cuantitativa. La unica comparacion directa posible es con el modelo base BF16 del que deriva, con el que comparte arquitectura y licencia.

## Limitaciones y advertencias

- La ejecucion nativa completa del modelo no ha sido validada para este perfil exacto; la verificacion se ha hecho con el simulador ttsim y con el empaquetado matriz a matriz, no con inferencia end-to-end en hardware real.
- tt-transformers y tt-forge no se han probado con este checkpoint, por lo que la integracion con esas pilas no esta garantizada.
- Los pesos estan empaquetados en formatos BFP4/BFP8 especificos de TT-NN; no son directamente compatibles con vLLM, llama.cpp, Ollama o TGI sin conversion previa.
- La cuantizacion BFP4 en los expertos enrutados introduce error numerico respecto al BF16; la model card reporta metricas de KL y Top-1, pero en el extracto disponible no se incluyen los valores del checkpoint cuantizado, por lo que la magnitud de la degradacion no puede confirmarse aqui.
- Riesgo de alucinacion y sesgos: no se documentan en la informacion proporcionada; al derivar de un modelo base de NVIDIA, hereda los sesgos y limitaciones de este, pero no se detallan.
- Limitaciones de contexto e idioma: la longitud de contexto no se especifica en la informacion disponible; los idiomas soportados se limitan a en, es, fr, de, it y ja.
- Licencia openmdw-1.1: es necesario revisar los terminos del archivo LICENSE del repo antes de un uso comercial, ya que la model card no detalla las restricciones concretas.
- El repo ocupa 63,2 GB, muy por encima de los 19,53 GB de pesos empaquetados, lo que implica requisitos de almacenamiento considerables para la descarga y el despliegue.
- El checkpoint excluye los tensores MTP (num_nextn_predict_layers = 0), por lo que no se beneficia de decodificacion especulativa multi-token nativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Tensix-BFP4-Experts
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Repositorio de codigo tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Licencia OpenMDW-1.1 (archivo del repo): https://huggingface.co/Xylolabs/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Tensix-BFP4-Experts/blob/main/LICENSE
