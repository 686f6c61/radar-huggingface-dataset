# Xylolabs/Hy4-flash-GGUF

## Resumen

Hy4-flash-GGUF es la distribucion cuantizada en formato GGUF del modelo multimodal tencent/Hy4-flash, publicada por Xylolabs para su uso con llama.cpp sobre CUDA, Metal o CPU. El modelo base es un Mixture of Experts (MoE) multimodal de 218.900 millones de parametros totales con 12.000 millones activos por token, capaz de procesar entradas de imagen y texto y generar texto. Esta version GGUF resuelve el problema de desplegar un modelo de este tamano en hardware de inferencia local o en servidores sin infraestructura de entrenamiento dedicada, ofreciendo un abanico de cuantizaciones desde Q8_0 (228,9 GB) hasta IQ2_XXS (83,1 GB).

La relevancia actual del artefacto radica en el soporte de llama.cpp mediante un pull request especifico (PR #32517) y en una innovacion de gestion de memoria: la tabla Engram (una tabla de embeddings por capa) se mantiene en RAM del sistema y se leen solo las filas necesarias para cada prompt, lo que permite ejecutar el modelo con offload parcial de capas a GPU incluso en equipos de 24 GB de VRAM. La model card incluye ademas una evaluacion de fidelidad de cuantizacion (divergencia KL y acuerdo top-1 frente al modelo BF16) que permite elegir el compromiso adecuado entre tamano y precision.

El modelo base esta desarrollado por Tencent y se distribuye bajo la licencia Tencent Hy License, con soporte declarado de ingles y chino. La version GGUF no incluye el drafter de decodificacion especulativa DFly2 del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) multimodal, transformer (detalles no disponibles) |
| Parametros totales | 218.938.353.741 (218,9 B) |
| Parametros activos | 12 B (segun model card) |
| Longitud de contexto | 32K en configuraciones con offload; 128K en H100 y RTX PRO 6000 Blackwell; 1M en DGX Spark (segun tabla de hardware) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, NVFP4, Q4M-E5, Q4M-E4, IQ4_XS-E4, Q3_K_M-E4, IQ3_M-E4, IQ3_XXS-E4, IQ2_M-E4, IQ2_XXS-E4; vision en BF16 y Q8_0 |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Tencent Hy License (license_name: tencent-hy-license, license: other) |
| Formato de pesos | GGUF (llama.cpp); imatrix incluida; modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base Hy4-flash es un Mixture of Experts multimodal con 218,9 mil millones de parametros totales y 12 mil millones activos por token, orientado a tareas image-text-to-text. La model card de la cuantizacion no detalla la composicion del dataset de entrenamiento, el numero de tokens ni si se aplicaron tecnicas de RLHF o DPO; estos datos no estan disponibles en la informacion proporcionada.

La innovacion tecnica mas destacable de esta distribucion es la forma en que trata la tabla Engram: la segunda parte de cada cuantizacion contiene esta tabla en FP8 E4M3 (o Q5_0 en los ficheros `-E5`, IQ4_NL en los `-E4` y MXFP4 en `IQ2_XXS-E4`), y las instrucciones de ejecucion recomiendan mantenerla en RAM del sistema mediante `--override-tensor '^per_layer_token_embd\.weight$=CPU'` junto con `--load-mode mmap --lazy-mode on`, de modo que solo se leen las filas requeridas por el prompt. La cuantizacion se ha generado con una matriz de importancia (imatrix) propia. El modelo base incluye un drafter de decodificacion especulativa DFly2 que no se distribuye en esta version GGUF.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino.
- Procesamiento de imagen y texto (pipeline image-text-to-text) mediante los proyectores multimodales `mmproj-Hy4-flash-BF16.gguf` o `mmproj-Hy4-flash-Q8_0.gguf`.
- Razonamiento y respuesta a preguntas, segun la evaluacion "Answers" de la model card (5/5 en todas las cuantizaciones probadas).
- Soporte de plantillas de chat mediante `--jinja` en llama.cpp.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidades de tool calling, function calling y agentes multi-paso: no disponibles en la informacion proporcionada.
- Capacidades de audio o modos de pensamiento explicitos: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue local de un modelo multimodal de gran escala: con la cuantizacion IQ3_XXS-E4 (100,5 GB) y una H100 de 80 GB, el modelo cabe con 64,9 GB en GPU y permite un contexto de 128K, adecuado para asistentes documentales con imagenes.
- Procesamiento de documentos con imagenes en entornos con GPU de 24 GB: usando offload de capas y la tabla Engram en RAM del sistema (RTX 4090 o RTX 3090), se puede ejecutar con contexto de 32K para tareas de extraccion y resumen de capturas o formularios.
- Servicio de inferencia en servidor con llama-server: el binario `llama-server` compilado desde el PR #32517 permite exponer el modelo como API compatible con endpoints para integrarlo en aplicaciones existentes.
- Analisis de imagenes en flujos bilingues ingles-chino: el soporte nativo de ambos idiomas y la entrada image-text-to-text lo hacen adecuado para moderacion o catalogacion de contenido en mercados asiaticos.
- Prototipado e investigacion en hardware de gama alta de consumo: la RTX 5090 (32 GB) permite ejecutar el modelo con offload y contexto de 32K, util para experimentacion academica sin acceso a clusters.
- Evaluacion comparativa de tecnicas de cuantizacion: la tabla de divergencia KL y acuerdo top-1 frente a BF16 permite estudiar el impacto de cada formato (Q8_0, Q4_K_M, IQ2, NVFP4) en la fidelidad del modelo, un caso de uso metodologico para investigadores.
- Despliegue en DGX Spark con 128 GB de memoria unificada: la cuantizacion IQ3_M-E4 (108,1 GB) permite contexto de hasta 1M tokens segun la tabla de hardware, adecuado para analisis de corpus extensos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card proporciona unicamente metricas de fidelidad de cuantizacion frente al modelo BF16 sobre WikiText-2, chat y texto reservado:

| Cuantizacion | Tamano | WikiText-2 KL | top-1 | Chat KL | top-1 | Held-out KL | top-1 | Answers |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| BF16, flash attention off | 375,4 GB | 0,1152 | 89,8% | 0,1987 | 89,0% | 0,0818 | 91,7% | - |
| Q8_0 / E4M3 | 228,9 GB | 0,1450 | 88,3% | 0,2483 | 87,5% | 0,1051 | 90,3% | 5/5 |
| Q6_K / E4M3 | 193,3 GB | 0,1458 | 87,9% | 0,2486 | 87,2% | 0,0998 | 90,4% | 5/5 |
| Q5_K_M / E4M3 | 176,7 GB | 0,1664 | 87,5% | 0,2705 | 86,6% | 0,1127 | 89,5% | 5/5 |
| Q4_K_M / E4M3 | 161,2 GB | 0,2123 | 85,1% | 0,3205 | 85,3% | 0,1444 | 88,5% | 5/5 |
| NVFP4 / E4M3 | 154,9 GB | 0,2511 | 83,8% | 0,4033 | 83,3% | 0,1724 | 87,3% | 5/5 |
| Q4_K_M / Q5_0 | 141,4 GB | 0,2235 | 85,0% | 0,3586 | 85,1% | 0,1416 | 88,9% | 5/5 |
| Q4_K_M / IQ4_NL | 133,5 GB | 0,2333 | 85,0% | 0,3514 | 84,4% | 0,1556 | 88,3% | 5/5 |
| IQ4_XS / IQ4_NL | 122,6 GB | 0,2362 | 84,4% | 0,3671 | 84,3% | 0,1706 | 87,7% | 5/5 |
| Q3_K_M / IQ4_NL | 114,2 GB | 0,3393 | 81,0% | 0,5192 | 81,2% | 0,2446 | 84,8% | 5/5 |
| IQ3_M / IQ4_NL | 108,1 GB | 0,4028 | 79,4% | 0,5664 | 79,8% | 0,3105 | 82,8% | 5/5 |
| IQ3_XXS / IQ4_NL | 100,5 GB | 0,4698 | 77,3% | 0,6502 | 78,6% | 0,3389 | 81,4% | 5/5 |
| IQ2_M / IQ4_NL | 91,9 GB | 0,6412 | 73,3% | 0,8604 | 74,9% | 0,4699 | 78,2% | 5/5 |
| IQ2_XXS + IQ2_S / MXFP4 | 83,1 GB | 0,8349 | 69,3% | 1,1280 | 72,1% | 0,6276 | 75,1% | 5/5 |

La model card incluye tambien comparaciones con cuantizaciones de AngelSlim (Q4_K_M, Q3_K e IQ2_AH), que presentan peor fidelidad que las equivalentes de Xylolabs en los tres conjuntos evaluados.

## Requisitos de hardware

- VRAM estimada: depende de la cuantizacion y del offload. En una H100 de 80 GB, la cuantizacion IQ3_XXS-E4 (100,5 GB) coloca 64,9 GB en GPU; en una RTX PRO 6000 Blackwell de 96 GB, Q3_K_M-E4 (114,2 GB) coloca 78,6 GB en GPU.
- GPU recomendadas: H100 (80 GB) para contexto de 128K con IQ3_XXS-E4; RTX PRO 6000 Blackwell (96 GB) para Q3_K_M-E4 con 128K; DGX Spark (128 GB unificados) para IQ3_M-E4 con contexto de 1M.
- GPU de consumo: RTX 4090 y RTX 3090 (24 GB) y RTX 5090 (32 GB) pueden ejecutar el modelo con offload y contexto de 32K; RTX 6000 Ada o dos GPU de 24 GB (48 GB) tambien con offload y 32K.
- Opciones de despliegue: llama.cpp (llama-cli y llama-server) compilado desde el PR #32517; soporte CUDA, Metal y CPU. No se mencionan vLLM, Ollama ni TGI en la informacion disponible.
- Flags relevantes: `--override-tensor '^per_layer_token_embd\.weight$=CPU' --load-mode mmap --lazy-mode on -ngl 99 --jinja -c 8192` (contexto configurable).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Hy4-flash-GGUF (Xylolabs) | 218,9 B | 12 B | 32K-1M segun hardware | Tencent Hy License | GGUF | Multimodal, cuantizaciones con imatrix y tabla Engram en RAM |
| tencent/Hy4-flash (base) | 218,9 B | 12 B | no disponible | Tencent Hy License | safetensors | Incluye drafter DFly2; BF16 375,4 GB |
| AngelSlim Q4_K_M | no disponible | no disponible | no disponible | no disponible | cuantizado | 168,3 GB; KL WikiText-2 0,2161 frente a 0,2123 de Xylolabs |
| AngelSlim Q3_K | no disponible | no disponible | no disponible | no disponible | cuantizado | 155,4 GB; KL WikiText-2 0,2969 |
| AngelSlim IQ2_AH | no disponible | no disponible | no disponible | no disponible | cuantizado | 135,0 GB; KL WikiText-2 0,7328 |

No se dispone de datos de otros modelos de la misma categoria (mismo tamano o misma tarea) en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia Tencent Hy License no es una licencia open source estandar; es responsabilidad del usuario revisar sus terminos antes de un uso comercial.
- El modelo solo declara soporte de ingles y chino; el rendimiento en castellano no esta documentado.
- Las cuantizaciones de baja precision (IQ2_XXS, IQ2_M) muestran una degradacion notable: KL de 0,8349 y 0,6412 en WikiText-2 frente a 0,1152 del BF16, con acuerdo top-1 por debajo del 75%.
- El drafter de decodificacion especulativa DFly2 no esta incluido, por lo que se pierde la aceleracion asociada al modelo original.
- Requiere compilar llama.cpp desde un pull request no fusionado (PR #32517); la estabilidad y el soporte a largo plazo no estan garantizados.
- El repositorio ocupa 1277,8 GB, lo que exige espacio de almacenamiento considerable incluso para descargar una sola cuantizacion.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada.
- El contexto maximo depende del hardware y de la configuracion; con offload en GPU de 24 GB se limita a 32K.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Hy4-flash-GGUF
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Licencia: https://huggingface.co/Xylolabs/Hy4-flash-GGUF/blob/main/LICENSE
- Pull request de llama.cpp: https://github.com/ggml-org/llama.cpp/pull/32517
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Assets de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
