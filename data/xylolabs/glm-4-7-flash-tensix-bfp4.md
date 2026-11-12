# Xylolabs/GLM-4.7-Flash-Tensix-BFP4

## Resumen

GLM-4.7-Flash-Tensix-BFP4 es una cuantizacion del modelo zai-org/GLM-4.7-Flash realizada por Xylolabs para su ejecucion sobre aceleradores Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo base es un transformer de tipo MoE (mezcla de expertos) con arquitectura `glm4_moe_lite` y 31.221.488.576 parametros totales, distribuido bajo licencia MIT. Esta version concreta aplica GPTQ con busqueda de exponente por bloque para cuantizar las capas lineales del decodificador al formato `ttnn.bfloat4_b` (BFP4, block floating point de 4 bits), manteniendo el resto de tensores en bf16.

El problema que resuelve es la huella de memoria: el checkpoint BF16 original ocupa 59,89 GB, mientras que esta version empaquetada ocupa 17,764 GB con un promedio de 4,75 bits por peso, lo que permite desplegar un modelo de 31 mil millones de parametros en hardware con DRAM limitada. La cuantizacion se ha verificado bit a bit sobre las 9.208 matrices declaradas, con una perdida de calidad medida de 0,093059 de divergencia KL media respecto al BF16 y un 87,78 % de aciertos top-1 en la evaluacion del autor.

Es relevante ahora porque demuestra un flujo completo de cuantizacion BFP4 orientado a NPUs de Tenstorrent, un ecosistema emergente que compite con GPUs en inferencia de bajo coste energetico. No obstante, la model card indica que la verificacion en hardware se hizo sobre `ttsim` (simulador Blackhole de Tenstorrent) con ttnn 0.81.1, no sobre silicio real, y que tt-transformers y tt-forge no se han ejecutado con este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`glm4_moe_lite`), con atencion MLA (multi-head latent attention) y capa MTP (multi-token prediction) |
| Parametros totales | 31.221.488.576 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso en matrices cuantizadas; 4,75 bits de media incluyendo tensores bf16), GPTQ con busqueda de exponente por bloque (offsets -1 y 0, damping 0,1) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (matrices cuantizadas almacenadas como valores bf16 empaquetados en la rejilla BFP4) |

## Arquitectura y entrenamiento

El modelo base GLM-4.7-Flash emplea una arquitectura transformer con mezcla de expertos (MoE) y atencion MLA, segun los tags `glm4_moe_lite` y la presencia de proyecciones `q_b_proj` y `kv_a_proj_with_mqa` en las 47 capas del decodificador. La model card menciona pesos de compuerta/up/down tanto densos como enrutados y compartidos, lo que confirma una estructura MoE con expertos compartidos. Incluye ademas una capa MTP (multi-token prediction) en `model.layers.47`, que se conserva sin cuantizar en bf16 con su sesgo de correccion de expertos en float32.

Sobre el entrenamiento del modelo base no se proporciona informacion en los datos disponibles (numero de tokens, composicion del dataset, uso de RLHF o DPO): no disponible. La innovacion tecnica de esta version es el pipeline de cuantizacion GPTQ adaptado a la rejilla BFP4 de Tenstorrent: cada matriz se empaqueta en bloques con exponente compartido y se verifica que ningun valor cambia tras el empaquetado y desempaquetado TT-NN. Las 94 matrices `q_b_proj` y `kv_a_proj_with_mqa` requieren una permutacion even/odd de sus ultimos 64 filas (tras conservar las primeras 192 y 512 filas respectivamente) para caer en la rejilla BFP4; los ficheros conservan el orden HF original, por lo que la implementacion debe reordenar los pares rotatorios de forma consistente con el empaquetado.

## Capacidades

- Generacion de texto conversacional en ingles y chino, con plantilla de chat (`apply_chat_template`).
- Razonamiento y respuesta a preguntas, segun la evaluacion del autor (37 de 40 respuestas correctas frente a 38 de 40 del BF16).
- Soporte de decodificacion con capa MTP retenida (no evaluada en esta version).
- Capacidades de codigo y matematicas: no disponible en la informacion proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Vision o audio: no disponible.
- Modo thinking explicito: no disponible.

## Casos de uso

- Inferencia en NPUs Tenstorrent Wormhole y Blackhole: el checkpoint esta disenado para cargarse con `ttnn` y `tt-metal` en formato `bfloat4_b`, reduciendo la DRAM necesaria a 17,764 GB frente a los 59,89 GB del BF16, lo que permite ejecutar un modelo de 31 mil millones de parametros en tarjetas con memoria limitada.
- Despliegue en entornos con restricciones de memoria: la cuantizacion a 4,75 bits de media permite alojar el modelo completo en aceleradores de gama media sin recurrir a offloading a CPU.
- Generacion de texto conversacional bilingue (ingles y chino): adecuado para asistentes y chatbots en estos dos idiomas usando la plantilla de chat incluida.
- Investigacion en cuantizacion de bajo bit: el pipeline `tensix-bfp-gptq` y los scripts `pack_tensix.py` y `verify_grid.py` sirven como referencia reproducible para cuantizar otros modelos a BFP4 y verificar la integridad bit a bit.
- Prototipado en simulador: la verificacion se realizo con `ttsim`, el simulador Blackhole de Tenstorrent, por lo que es util para validar pipelines antes de disponer de hardware fisico.
- Evaluacion comparativa de perdida de calidad: la model card proporciona metricas de divergencia KL y top-1 frente al BF16 y frente a Q4_K_M de llama.cpp, utiles para estudios de compromiso entre tamano y fidelidad.

## Benchmarks y rendimiento

Datos de evaluacion publicados por el autor (comparacion con el BF16 original y con Q4_K_M de llama.cpp):

| Modelo | Bits por peso | Tamano (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (zai-org/GLM-4.7-Flash) | 16 | 59,89 | 0 | 100 | 38 de 40 | - |
| Este modelo (BFP4) | 4,75 | 17,764 | 0,093059 | 87,78 | 37 de 40 | 0 |
| Q4_K_M (llama.cpp) | 4,84 | 18,123 | 0,075853 | 88,56 | 39 de 40 | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/DRAM estimada para inferencia: 17,764 GB empaquetados en BFP4 (mas overhead de activaciones y cache KV, no cuantificado en la model card).
- Hardware objetivo: NPUs Tensix de Tenstorrent, arquitecturas Wormhole y Blackhole.
- Verificacion realizada sobre `ttsim` (simulador Blackhole) con ttnn 0.81.1; no se ha probado en hardware fisico segun la model card.
- Cabe en GPU consumer: no disponible (el checkpoint esta orientado a Tensix; la carga en Transformers se verifico en CPU con Transformers 5.22.2).
- Opciones de despliegue: `ttnn` / `tt-metal` para Tensix; `transformers` (version 5.22.2 o superior, con clase nativa `glm4_moe_lite`) para carga en CPU/GPU. tt-transformers y tt-forge no se han ejecutado con este checkpoint.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GLM-4.7-Flash-Tensix-BFP4 (este) | 31,2 B | no disponible | BFP4 4,75 bits | 17,764 GB | MIT | Hugging Face |
| zai-org/GLM-4.7-Flash (BF16) | 31,2 B | no disponible | BF16 | 59,89 GB | MIT | Hugging Face |
| GLM-4.7-Flash Q4_K_M (llama.cpp) | 31,2 B | no disponible | Q4_K_M 4,84 bits | 18,123 GB | MIT | Hugging Face |

No se dispone de datos de otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion BFP4 introduce una divergencia KL media de 0,093059 respecto al BF16 y reduce el top-1 al 87,78 %; Q4_K_M de llama.cpp obtiene mejor fidelidad (KL 0,075853, top-1 88,56 %) con un tamano similar.
- Las 94 matrices `q_b_proj` y `kv_a_proj_with_mqa` no caen en la rejilla BFP4 tal como estan almacenadas: requieren una permutacion even/odd de sus ultimos 64 filas. Una implementacion que ignore este reordenamiento producira resultados incorrectos.
- La capa MTP (`model.layers.47`) se conserva en bf16 sin cuantizar y no fue evaluada; su impacto en produccion no esta caracterizado.
- Verificacion unicamente en simulador (`ttsim`), no en hardware Tensix real; tt-transformers y tt-forge no se han probado con este checkpoint.
- Requiere Transformers 5.22.2 o superior; versiones anteriores sin la clase nativa `glm4_moe_lite` no pueden cargarlo.
- Idiomas soportados limitados a ingles y chino; no se declara soporte de castellano.
- Sesgos conocidos: no disponible.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada.
- Licencia MIT: permite uso comercial, pero el modelo base y los datos de entrenamiento pueden estar sujetos a condiciones adicionales no detalladas en la model card.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/GLM-4.7-Flash-Tensix-BFP4
- Modelo base: https://huggingface.co/zai-org/GLM-4.7-Flash
- Repositorio de codigo `tensix-bfp-gptq`: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado (arXiv:2508.06471): https://arxiv.org/abs/2508.06471
