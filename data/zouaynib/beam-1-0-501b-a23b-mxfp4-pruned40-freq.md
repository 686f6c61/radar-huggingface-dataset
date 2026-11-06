# zouaynib/Beam-1.0-501B-A23B-MXFP4-Pruned40-Freq

## Resumen

Beam-1.0-501B-A23B-MXFP4-Pruned40-Freq es un checkpoint derivado del modelo Beam-1.0-501B-A23B de Reflection, un transformer de tipo mixture-of-experts (MoE) con 501.000 millones de parametros totales y 23.000 millones activos por token. El autor del checkpoint, zouaynib, parte de su propia cuantizacion MXFP4 del modelo original y aplica una poda del 40 % de los expertos enrutados (104 de 256 por capa, en las 49 capas MoE), seleccionados por frecuencia de enrutamiento medida sobre razonamiento generado por el propio Beam. El objetivo es claro: meter un modelo de 501B en una unica GPU AMD Instinct MI300X de 192 GB, algo imposible con el checkpoint completo.

La poda es puramente estructural, sin reentrenamiento ni destilacion: se eliminan tensores de expertos y las filas correspondientes del router, y se ajusta `num_experts` a 152. El resultado ocupa 172 GB (160 GiB de pesos), lo que deja espacio para una cache KV de 147.161 tokens en la misma GPU. El autor documenta el coste de la compresion con intervalos de confianza bootstrap y mediciones de divergencia KL frente al modelo completo.

La relevancia actual es doble: por un lado, demuestra que la poda guiada por frecuencia de enrutamiento preserva el razonamiento matematico mucho mejor que metodos como REAP en este modelo concreto; por otro, es un ejemplo practico de despliegue de un MoE de gran escala en hardware AMD con ROCm y vLLM, un terreno donde escasean las recetas reproducibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (49 capas MoE, 8 grupos de 32 expertos, top-4 grupos y 8 expertos por token en el modelo original) |
| Parametros totales | 154.425.003.736 (segun safetensors del checkpoint podado); el modelo base declara 501B |
| Parametros activos | 23B (denominacion del modelo base; no recalculado tras la poda en la informacion disponible) |
| Longitud de contexto | 131.072 tokens en la receta de despliegue; el modelo base se anuncia con hasta 1.024K en agregadores de terceros |
| Tipos de cuantizacion | MXFP4 (W4A16: pesos FP4 desempaquetados a BF16 en vuelo en gfx942); no se documentan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 171,7 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con enrutamiento en dos niveles: 8 grupos de 32 expertos, de los que se eligen 4 grupos y luego 8 expertos por token. El checkpoint original tiene 256 expertos enrutados por capa en 49 capas MoE; tras la poda quedan 152. La receta de poda preserva la estructura de grupos: se conservan los 19 mejores expertos de cada uno de los 8 grupos en todas las capas, de modo que el router mantiene su topologia y solo cambian las dimensiones. El script `write_pruned.py` elimina los tensores de expertos, las filas del router y las entradas del sesgo de correccion correspondientes.

El criterio de seleccion es la frecuencia de enrutamiento. Para calibrar, Beam respondio 400 prompts fuera de los conjuntos de evaluacion (MATH-500, MMLU-Pro STEM, HumanEval, MBPP, UltraChat) con `reasoning_effort=high`, generando 262.000 tokens de conversaciones completas (prompt, razonamiento y respuesta). `prune_beam.py` recorre el modelo MXFP4 capa por capa y registra cuantas veces se elige cada experto, ademas de la puntuacion REAP (media de peso del router por norma de la salida del experto) para el checkpoint hermano. No hay reentrenamiento ni destilacion: todos los pesos restantes son los de Beam. La innovacion tecnica destacable es precisamente el sesgo de calibracion: al usar razonamiento del propio modelo, la poda especializa la red hacia matematicas y codigo a costa de prosa enciclopedica.

## Capacidades

- Generacion de texto y razonamiento de varios pasos con modo de razonamiento configurable (`reasoning_effort` hasta `max`) y presupuesto de tokens de pensamiento.
- Razonamiento matematico de competicion: 94,2 % en AIME 2026 con el checkpoint podado, dentro del intervalo de confianza del modelo completo.
- Razonamiento cientifico de nivel graduado (GPQA-Diamond), con degradacion notable tras la poda (74,2 % frente a 89,4 %).
- Generacion de codigo y tareas de ingenieria de software, segun los casos de uso declarados por Reflection para el modelo base.
- Tool calling y function calling: la receta de vLLM incluye `--tool-call-parser beam` y `--enable-auto-tool-choice`.
- Tareas aganticas de horizonte largo y resumen, segun la model card del modelo base.
- Capacidades multilingues: no disponible.
- Vision y audio: no disponibles.

## Casos de uso

- Razonamiento matematico en produccion con presupuesto acotado: el checkpoint mantiene el rendimiento en AIME dentro del intervalo del modelo completo, por lo que sirve para tutoria de matematicas, verificacion de derivaciones o generacion de problemas resueltos en una sola MI300X.
- Agentes de codigo en un solo nodo: con tool calling nativo y 131k tokens de contexto, se puede desplegar un agente que lea repositorios, ejecute herramientas y encadene pasos sin salir de una GPU.
- Sustitucion de un despliegue de 2 GPU por 1 GPU: el modelo completo MXFP4 necesita 2x MI300X; este checkpoint libera una GPU entera a cambio de una perdida medida de calidad, util para reducir coste de infraestructura en entornos ROCm.
- Servicio de chat con razonamiento a concurrencia media: con 32 peticiones concurrentes sostiene 444 tok/s de salida y 6,89 s de TTFT mediano con prompts y respuestas de 1k tokens, suficiente para un asistente interno.
- Generacion de codigo en pipelines de CI: la divergencia frente al modelo completo es menor en codigo (top-1 del 90,1 % a 40,6 % de poda) que en prosa, lo que lo hace aceptable para revision automatizada, generacion de tests y parches.
- Evaluacion e investigacion sobre poda de MoE: el checkpoint y sus scripts permiten reproducir la comparativa frecuencia frente a REAP y medir el impacto de distintos porcentajes de poda sobre cargas propias.
- Fine-tuning como base especializada: al ser Apache 2.0 y ocupar una sola GPU, es viable adaptar el modelo a dominios concretos con LoRA sobre los expertos supervivientes.

## Benchmarks y rendimiento

Ajustes de Reflection: `reasoning_effort=max`, T=0,7, top-p 0,99, presupuesto de 32k tokens. Intervalos bootstrap del 95 % sobre las preguntas.

| Modelo | AIME 2026 (30 x 4) | GPQA-Diamond (198 x 2) |
|---|---|---|
| MXFP4, 256 expertos (2x MI300X) | 95,8 % [88,3; 100,0] | 89,4 % [85,1; 93,2] |
| Podado 40 %, REAP (1x MI300X) | 81,7 % [68,3; 92,5] | no ejecutado |
| Podado 40 %, frecuencia (1x MI300X) | 94,2 % [85,8; 99,2] | 74,2 % [68,2; 79,8] |
| BF16, referencia de Reflection | 97,7 % | 90,6 % |

Divergencia frente al modelo completo segun el porcentaje de expertos eliminados (texto retenido de 65.504 tokens):

| Expertos eliminados | KL | Top-1 global | Top-1 mat. chat | Top-1 codigo | Top-1 wikitext |
|---|---|---|---|---|---|
| 12,5 % | 0,119 | 91,6 % | 97,0 % | 94,8 % | 87,3 % |
| 25 % | 0,264 | 86,4 % | 95,1 % | 91,0 % | 79,7 % |
| 40,6 % (REAP) | 0,464 | 81,0 % | 93,5 % | 88,0 % | 71,2 % |
| 40,6 % (frecuencia) | 0,534 | 80,2 % | 95,8 % | 90,1 % | 67,4 % |
| 50 % | 0,591 | 78,0 % | 91,5 % | 85,6 % | 67,5 % |
| 62,5 % | 0,785 | 74,0 % | 89,4 % | 81,2 % | 62,6 % |

Rendimiento de servicio en 1x MI300X (prompts de 1k tokens, salidas de 1k tokens):

| Concurrentes | tok/s de salida | TTFT mediano | Tiempo por token |
|---|---|---|---|
| 1 | 60 | 0,40 s | 16,3 ms |
| 8 | 206 | 2,17 s | 37,0 ms |
| 32 | 444 | 6,89 s | 66,5 ms |
| 64 (2 copias, 2 GPU) | 906 | 6,83 s | 64,7 ms |
| 128 (2 copias, 2 GPU) | 1.318 | 13,77 s | 83,6 ms |

Referencia del modelo completo en 2x MI300X (TP2): 85 tok/s con 1 peticion, 988 con 64 y 1.462 con 128.

## Requisitos de hardware

- VRAM: 160 GiB de pesos en MXFP4 sobre una GPU de 192 GB; quedan 147.161 tokens de cache KV. El repo completo pesa 171,7 GB en disco.
- GPU recomendada: AMD Instinct MI300X (gfx942) con ROCm. El autor no documenta despliegue en NVIDIA.
- GPU de consumo: no cabe. Un MoE de este tamano no entra en RTX 4090 (24 GB) ni en GPUs de 48 GB; requeriria offloading masivo a CPU y el rendimiento caeria drasticamente.
- Despliegue: vLLM >= 0.33 para ROCm con los tres parches ROCm del autor; variables y flags documentados: `VLLM_ROCM_USE_AITER=1`, `--tensor-parallel-size 1`, `--attention-backend TRITON_ATTN`, `--max-model-len 131072`, `--gpu-memory-utilization 0.95`, `--reasoning-parser beam`, `--tool-call-parser beam`.
- Ajuste de concurrencia: `--max-num-seqs` de 16 para razonamiento largo y 64 para peticiones de 2k tokens, para evitar expulsiones por presion de cache KV.
- Latencia y throughput: 60 tok/s y 16,3 ms por token con una peticion; 444 tok/s con 32 concurrentes. Dos copias en dos GPU alcanzan 1.318 tok/s con 128 concurrentes.
- Nota de computo: gfx942 no tiene computo FP4 nativo; los pesos se desempaquetan a BF16 en vuelo (W4A16), de ahi que el ahorro sea de memoria y no de FLOPs.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AIME 2026 | GPQA-Diamond | Licencia | Hardware |
|---|---|---|---|---|---|---|
| Beam MXFP4 completo (zouaynib) | 501B totales / 23B activos | 131k en receta | 95,8 % | 89,4 % | Apache 2.0 | 2x MI300X |
| Beam MXFP4 podado 40 % frecuencia (este) | 154,4B en safetensors / 23B activos nominales | 131k | 94,2 % | 74,2 % | Apache 2.0 | 1x MI300X |
| Beam MXFP4 podado 40 % REAP | no disponible | 131k | 81,7 % | no ejecutado | Apache 2.0 | 1x MI300X |
| Beam BF16 (reflection) | 501B totales / 23B activos | no disponible | 97,7 % | 90,6 % | Apache 2.0 | no disponible |

No se dispone en la informacion proporcionada de comparaciones con modelos de otros laboratorios del mismo tamano o categoria.

## Limitaciones y advertencias

- Compresion con perdida: la poda degrada la calidad de forma medible. GPQA-Diamond cae unos 15 puntos y entre 10 y 60 de las 396 respuestas agotan el presupuesto de 32k tokens; aproximadamente la mitad de la perdida se debe a que el modelo entra en bucles de razonamiento en preguntas de conocimiento.
- La degradacion es desigual: la prosa y el texto enciclopedico sufren mucho mas (top-1 del 67,4 % en wikitext) que las matematicas en formato chat (95,8 %) o el codigo (90,1 %). Hay que validar sobre la carga de trabajo propia antes de adoptarlo.
- Riesgo de alucinacion: no se documenta una evaluacion especifica de veracidad; la perdida de rendimiento en conocimiento cientifico sugiere mayor propension a errores en dominios factuales.
- Sesgos: no disponible. La model card no incluye analisis de sesgos del modelo base ni del checkpoint podado.
- Idiomas: no se declaran idiomas soportados; no se debe asumir cobertura multilingue sin evaluacion previa.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se aplican los terminos de Beam sin cambios; conviene revisar la model card de reflection/Beam-1.0-501B-A23B.
- Dependencia de hardware: la receta esta atada a MI300X, ROCm y vLLM >= 0.33 con parches especificos; no hay soporte documentado para CUDA ni para llama.cpp u Ollama.
- El numero de parametros del safetensors (154,4B) no coincide con la denominacion comercial (501B); la cifra de parametros activos tras la poda no se ha recalculado en la informacion disponible.
- Gestion de cache KV: con 147k tokens disponibles, concurrencias altas con contextos largos provocan expulsiones y latencias de cola muy superiores (TTFT de 13,77 s con 128 concurrentes en dos GPU).

## Enlaces

- Checkpoint en Hugging Face: https://huggingface.co/zouaynib/Beam-1.0-501B-A23B-MXFP4-Pruned40-Freq
- Checkpoint base MXFP4: https://huggingface.co/zouaynib/Beam-1.0-501B-A23B-MXFP4
- Checkpoint hermano podado por REAP: https://huggingface.co/zouaynib/Beam-1.0-501B-A23B-MXFP4-Pruned40-REAP
- Modelo original de Reflection: https://huggingface.co/reflection/Beam-1.0-501B-A23B
- Write-up interactivo: https://huggingface.co/spaces/zouaynib/beam-mxfp4-mi300x
- Parches ROCm: https://huggingface.co/zouaynib/Beam-1.0-501B-A23B-MXFP4/tree/main/rocm
- Ficha de terceros con datos de despliegue: https://llm-explorer.com/model/zouaynib%2FBeam-1.0-501B-A23B-MXFP4,4lDPMbMSGT1cejnKLCN3QE
- Referencia del metodo REAP: Lasby et al. 2025 (citado en la model card; no se proporciona URL directa)
