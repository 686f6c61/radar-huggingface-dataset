# Xylolabs/Qwen3.6-35B-A3B-Tensix-BFP4

## Resumen

Qwen3.6-35B-A3B-Tensix-BFP4 es una cuantizacion del modelo Qwen/Qwen3.6-35B-A3B realizada por Xylolabs, orientada especificamente a las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo base es un transformer MoE multimodal de 35.951.822.704 parametros totales con arquitectura `qwen3_5_moe`, que combina capas de atencion clasica, capas Gated DeltaNet y un bloque de expertos enrutados, ademas de un modulo visual y un bloque MTP (multi-token prediction).

La particularidad de esta version es que todas las proyecciones lineales del modelo de lenguaje se han redondeado a `ttnn.bfloat4_b` (BFP4, block floating point de 4 bits) mediante GPTQ, de modo que los pesos, almacenados en bf16 en safetensors, ya descansan sobre la rejilla BFP4 y TT-NN puede empaquetarlos sin un nuevo redondeo. El resultado son 4,84 bits por peso de media y 20,99 GB empaquetados frente a los 69,32 GB del modelo en BF16.

Es relevante porque permite ejecutar un modelo MoE de ~36.000 millones de parametros en hardware de inferencia de bajo consumo de memoria (aceleradores Tensix), un escenario hasta ahora reservado a GPUs de datacenter. La licencia Apache 2.0 del modelo base facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido (`qwen3_5_moe`): atencion clasica + Gated DeltaNet + expertos enrutados, con modulo visual y bloque MTP |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible (el nombre A3B sugiere ~3.000 millones activos, pero no se confirma en la informacion) |
| Longitud de contexto | no disponible (el demo de tt-metal menciona una variante `traced_128k`) |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso) en proyecciones lineales; bf16 en embeddings, LM head, normas, gate del experto compartido, `mtp` y `visual`; media de 4,84 bits por peso; compatible tambien con empaquetado exacto en `ttnn.bfloat8_b` |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16 con valores sobre la rejilla BFP4), mas `quant4.json` con el formato de cada proyeccion |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer MoE hibrido. Segun la model card, la red combina 10 capas con atencion q/k/v/o clasica, 30 capas con proyecciones Gated DeltaNet (q, k, v, z, a, b y salida) y 40 capas con expertos enrutados (gate, up y down) mas un experto compartido. Incluye ademas un modulo `visual` para entrada de imagen y texto y un bloque `mtp` (multi-token prediction) que en el demo de tt-metal aparece desactivado por defecto para este modelo. No se detallan en la informacion disponible el numero de tokens de entrenamiento ni la composicion del dataset del modelo base.

La innovacion de esta ficha es el proceso de cuantizacion: GPTQ con busqueda de exponente por bloque, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Los expertos enrutados comparten una unica matriz Hessiana por capa para gate y up, mientras que la proyeccion down de cada experto usa su propia Hessiana o, si vio pocos tokens de calibracion, redondeo al vecino mas cercano. Solo se cuantizo y evaluo el modelo de lenguaje; el modulo visual y el bloque MTP se mantienen en bf16 sin cambios.

## Capacidades

- Generacion de texto conversacional y razonamiento, heredadas del modelo base Qwen3.6-35B-A3B.
- Procesamiento de imagen y texto (`image-text-to-text`), aunque el modulo visual no se ha cuantizado ni evaluado en esta version.
- Soporte de plantilla de chat mediante `apply_chat_template` de transformers.
- Arquitectura MoE con expertos enrutados y experto compartido, lo que reduce el coste de computo por token frente a un modelo denso del mismo tamano.
- Capacidad de decodificacion multi-token potencial a traves del bloque `mtp` (desactivado por defecto en el demo de tt-metal).
- Despliegue en NPU Tensix (Wormhole, Blackhole) mediante tt-metal y TT-NN, con empaquetado nativo del formato BFP4.
- Soporte de tool calling, agentes o modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia en aceleradores Tensix: el checkpoint esta disenado para empaquetarse directamente en `ttnn.bfloat4_b` sin redondeo adicional, lo que permite servir un MoE de ~36.000 millones de parametros en Wormhole o Blackhole con 20,99 GB de pesos.
- Despliegue tensor-parallel en cuatro Blackhole P150: el demo oficial de tt-metal v0.81.1 ejecuta Qwen3.6-35B-A3B repartido en cuatro chips, un escenario realista para laboratorios que ya dispongan de ese hardware.
- Prototipado en simulacion: el checkpoint se ha validado con ttnn 0.81.1 sobre `ttsim`, el simulador de Blackhole, lo que permite desarrollar y depurar pipelines sin hardware fisico.
- Investigacion en cuantizacion de bajo bit: sirve como referencia reproducible de GPTQ con busqueda de exponente por bloque sobre un MoE hibrido, con scripts `pack_tensix.py` y `verify_grid.py` para comprobar la integridad del empaquetado.
- Evaluacion de degradacion por cuantizacion: con una KL media de 0,05013 frente a BF16 y un 89,62 % de top-1, es util para estudiar el impacto de BFP4 en tareas de generacion.
- Cargas de trabajo multimodales en el borde: al conservar el modulo visual en bf16, puede emplearse en tareas image-text-to-text donde la precision del encoder visual sea critica y el coste del LLM se reduzca con BFP4.
- Experimentacion con decodificacion multi-token: el bloque `mtp` en bf16 permite investigar tecnicas de prediccion especulativa, aunque el demo lo desactive por defecto.

## Benchmarks y rendimiento

La model card incluye una evaluacion comparativa frente al modelo base en BF16:

| Modelo | Bits por peso | Tamano (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen3.6-35B-A3B) | 16 | 69,32 | 0 | 100 | 39 de 40 | - |
| **Este modelo (BFP4)** | 4,84 | 20,991 | 0,05013 | 89,62 | 39 de 40 | 0 |
| Q4_K_... | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La fila de comparacion con Q4_K aparece truncada en la informacion disponible. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion proporcionada.

## Requisitos de hardware

- Pesos empaquetados: 20,99 GB en BFP4, frente a 69,32 GB en BF16.
- VRAM estimada para inferencia en GPU: no disponible de forma oficial; como referencia, cargar el checkpoint en transformers con `dtype="bfloat16"` requiere del orden de 70 GB, por lo que no cabe en GPUs de consumo sin cuantizacion adicional.
- Hardware objetivo: NPU Tensix de Tenstorrent, arquitecturas Wormhole y Blackhole.
- Configuracion de referencia del demo: cuatro Blackhole P150 en tensor-parallel (MESH_DEVICE=P150x4); no se ejecuta en un solo chip.
- Simulacion: ttnn 0.81.1 sobre `ttsim` (simulador de Blackhole).
- Opciones de despliegue: transformers (`AutoModelForCausalLM`), tt-metal v0.81.1 (demo `models/demos/blackhole/qwen36`), TT-NN para empaquetado. tt-forge (tt-xla) aun no se ha probado con este checkpoint y tt-transformers no soporta esta arquitectura.
- Latencia y throughput: no disponibles; la validacion se ha hecho en simulador, no en hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen3.6-35B-A3B-Tensix-BFP4 | 35.951.822.704 | no disponible | BFP4 (4,84 bits/peso) | Apache 2.0 | Hugging Face, validado en simulador |
| Qwen/Qwen3.6-35B-A3B (base) | 35.951.822.704 | no disponible | BF16 | Apache 2.0 | Hugging Face |
| Q4_K_... (mencionado en la model card) | no disponible | no disponible | Q4_K | no disponible | no disponible |

La informacion disponible no permite una comparacion detallada con alternativas cuantizadas de la misma categoria.

## Limitaciones y advertencias

- Solo se ha cuantizado y evaluado el modelo de lenguaje; el modulo visual y el bloque `mtp` permanecen en bf16 sin evaluacion especifica.
- El checkpoint se ha validado con ttnn 0.81.1 sobre `ttsim` (simulador de Blackhole), no en hardware real; el reparto tensor-parallel en cuatro chips del demo de tt-metal no se ha ejecutado.
- tt-forge (tt-xla) no se ha probado con este checkpoint y tt-transformers no soporta la arquitectura `qwen3_5_moe`.
- La cuantizacion BFP4 introduce una divergencia medible frente a BF16: KL media de 0,05013 y top-1 del 89,62 %.
- El calibrado de GPTQ uso 65.536 tokens de WikiText-2 y Wikipedia en coreano, lo que puede introducir sesgo hacia esos dominios e idiomas.
- Algunos expertos con pocos tokens de calibracion se redondearon al vecino mas cercano en su proyeccion down, lo que puede degradar su calidad de forma desigual.
- El LM head se re-redondea en el demo de tt-metal porque este lo empaqueta en bfloat8_b, aunque el checkpoint lo mantiene en bf16.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; se heredan los del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y del codigo `tensix-bfp-gptq`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3.6-35B-A3B-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Revision del modelo base citada: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/tree/345d467b117d1fd5eda9b879a5988de9ae5f47a7
- Codigo de cuantizacion (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Demo de tt-metal para Qwen3.5/3.6: https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/blackhole/qwen36
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Qwen3.6-35B-A3B-Tensix-BFP4/blob/main/LICENSE
