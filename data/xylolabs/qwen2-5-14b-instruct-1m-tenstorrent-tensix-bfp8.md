# Xylolabs/Qwen2.5-14B-Instruct-1M-Tenstorrent-Tensix-BFP8

## Resumen

Este repositorio contiene una cuantizacion del modelo Qwen/Qwen2.5-14B-Instruct-1M, desarrollada por Xylolabs y orientada especificamente a la inferencia sobre aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). No se trata de un modelo nuevo, sino de una exportacion del checkpoint original de Qwen con sus capas lineales (atención q/k/v/o y MLP gate/up/down en las 48 capas) cuantizadas a `ttnn.bfloat8_b` (BFP8) mediante GPTQ, mientras que el LM head, los embeddings, las normas y el resto de tensores permanecen en bf16. El objetivo es reducir el peso en memoria del modelo en el dispositivo y aprovechar el formato de bloque flotante que TT-NN empaqueta de forma nativa.

El modelo base, Qwen2.5-14B-Instruct-1M, es un transformer denso de 14.770.033.664 parametros con una ventana de contexto extendida hasta 1M de tokens, entrenado por el equipo Qwen (Alibaba) para tareas de instruccion y conversacion. Esta version cuantizada conserva esa ventana de contexto y las capacidades del modelo original, pero su proposito principal es el despliegue en hardware Tenstorrent, no en GPUs convencionales.

La relevancia actual radica en dos factores: por un lado, la creciente demanda de alternativas de inferencia fuera del ecosistema NVIDIA, y por otro, la necesidad de reducir el footprint de memoria de modelos de contexto largo. El export ocupa aproximadamente 17,15 GB empaquetado (9,29 bits por peso de media) frente a los 29,54 GB del checkpoint BF16, con una degradacion medida muy baja respecto al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), decoder-only, con atencion causal estandar |
| Parametros totales | 14.770.033.664 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 1M de tokens (heredada del modelo base Qwen2.5-14B-Instruct-1M) |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`) en capas lineales; bf16 en LM head, embeddings y normas. Existe una variante BFP4 del mismo autor |
| Idiomas soportados | Ingles (declarado en la model card); el modelo base Qwen2.5 soporta multilingue, pero esta exportacion solo declara `en` |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con `transformers`); empaquetado para TT-NN via `ttnn.bfloat8_b` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-14B-Instruct-1M: un transformer decoder-only denso de 48 capas con atencion por cabezas (GQA segun la familia Qwen2.5), activaciones SwiGLU en el MLP y normalizacion RMSNorm. La innovacion principal del modelo base es la extension del contexto hasta 1M de tokens, lograda mediante tecnicas de entrenamiento con longitudes progresivas y ajuste de las frecuencias rotatorias (RoPE) para mantener la coherencia en secuencias muy largas.

En esta exportacion concreta no se ha reentrenado el modelo: se ha aplicado GPTQ sobre la rejilla de bloque flotante `bfloat8_b`, calibrando con 65.536 tokens procedentes de WikiText-2 y de Wikipedia en coreano. Cada bloque conserva su exponente compartido tal y como lo fija el empaquetador de TT-NN, de modo que el tensor resultante se almacena como valores bf16 sobre la rejilla BFP8 y TT-NN lo empaqueta sin alterar sus valores. El resultado son 9,29 bits por peso de media y 17,15 GB empaquetados. El autor indica que la verificacion se realizo con `ttnn 0.81.1` sobre `ttsim` (simulador de Blackhole), pero que `tt-transformers` y `tt-forge` no se ejecutaron con este checkpoint.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles, con soporte del chat template de Qwen.
- Razonamiento y respuesta a instrucciones, heredado del ajuste de instruccion del modelo base.
- Generacion de codigo y matematicas (capacidades propias de la familia Qwen2.5, aunque no se documentan benchmarks especificos en esta exportacion).
- Manejo de contextos muy largos de hasta 1M de tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Capacidad multilingue del modelo base (no declarada explicitamente en esta exportacion, que solo lista `en`).
- No se documenta soporte de tool calling, function calling, vision ni audio en la informacion disponible.
- No se documenta modo "thinking" ni decodificacion especulativa en esta exportacion.

## Casos de uso

- Inferencia sobre aceleradores Tenstorrent: el caso principal. El checkpoint esta empaquetado para TT-NN (`bfloat8_b`) y permite desplegar el modelo en Wormhole o Blackhole con un footprint de 17,15 GB de pesos, liberando memoria para KV cache y buffers.
- Procesamiento de documentos largos: gracias a la ventana de 1M de tokens, se puede usar para resumir o analizar contratos, informes o codebases completos en una sola pasada, siempre que el hardware Tenstorrent disponga de memoria suficiente para el KV cache.
- Atencion al cliente automatizada: conversaciones multi-turno con historial extenso, aprovechando el contexto largo para mantener coherencia en sesiones prolongadas.
- Generacion y revision de codigo: el modelo base Qwen2.5-14B tiene buen desempeno en tareas de programacion; esta exportacion permite ejecutarlo en infraestructura Tenstorrent para pipelines de revision o generacion asistida.
- Experimentacion en investigacion de cuantizacion: el repositorio incluye scripts (`pack_tensix.py`, `verify_grid.py`) y metricas de KL y top-1 frente a BF16, utiles para estudiar el impacto de BFP8 en modelos de contexto largo.
- Despliegue en entornos con restricciones de memoria: frente al checkpoint BF16 de 29,54 GB, esta version reduce el peso a 17,15 GB, lo que facilita su ajuste en dispositivos con DRAM limitada.
- Evaluacion comparativa de formatos: la existencia de una variante BFP4 del mismo autor permite comparar precision y footprint en el mismo hardware.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen2.5-14B-Instruct-1M) | 16 | 29,54 | 0 | 100 | 31 de 33 | - |
| **Este modelo (BFP8)** | 9,29 | 17,154 | 0,00197 | 98,44 | 32 de 33 | 0 |
| Q4_K_M (llama.cpp) | 4,87 | 8,988 | 0,07403 | 90,14 | 31 de 33 | 0 |

Las metricas de KL y top-1 se calculan sobre 16.184 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano), en formato plano y con chat template. Las "respuestas" son 33 prompts cortos con comprobacion automatica. El autor advierte que estas cifras miden la cercania al BF16, no la calidad en tareas reales, y que no se reporta velocidad. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: aproximadamente 17,15 GB solo para los pesos del modelo, mas espacio para KV cache y buffers. El autor recomienda la variante BFP4 en dispositivos con menos memoria.
- Hardware objetivo: aceleradores Tenstorrent Tensix (Wormhole y Blackhole). Verificado con `ttnn 0.81.1` sobre el simulador `ttsim` de Blackhole.
- GPU convencionales: no es el objetivo del export. El checkpoint es cargable con `transformers` en bf16 (29,5 GB), por lo que requeriria GPUs con al menos 30-40 GB (A100 40GB, H100, o varias RTX 4090/3090). No se documenta soporte optimizado para CUDA.
- Opciones de despliegue: TT-NN / tt-metal en hardware Tenstorrent; carga estandar via `transformers` (`AutoModelForCausalLM.from_pretrained`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este checkpoint concreto.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor indica explicitamente que no reporta velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Este modelo (BFP8) | 14,77B | 1M | BFP8 (9,29 bits/peso) | Apache 2.0 | Tenstorrent Tensix |
| Qwen2.5-14B-Instruct-1M (BF16) | 14,77B | 1M | BF16 | Apache 2.0 | GPU/NPU genericos |
| Version BFP4 del mismo autor | 14,77B | 1M | BFP4 | Apache 2.0 | Tenstorrent Tensix (menos memoria) |
| Q4_K_M (llama.cpp) | 14,77B | 1M | 4,87 bits/peso | Apache 2.0 | CPU/GPU via llama.cpp |

La comparativa mas directa es con el checkpoint BF16 original y con la cuantizacion Q4_K_M generada por el propio autor para calibrar su criterio de aceptacion (KL medio como maximo 1,5 veces el de Q4_K_M y como maximo una respuesta perdida adicional). El modelo cumple holgadamente: 0,03 veces el KL de Q4_K_M y cero respuestas perdidas.

## Limitaciones y advertencias

- El export esta pensado para hardware Tenstorrent; no se ha validado en GPU ni en otros aceleradores, y `tt-transformers` y `tt-forge` no se probaron con este checkpoint.
- Solo se declara soporte de ingles en la model card, aunque el modelo base es multilingue; el calibrado de GPTQ incluyo texto en coreano, pero no se garantiza calidad en otros idiomas.
- Las metricas publicadas miden fidelidad al BF16 (KL, top-1), no calidad en tareas; no hay benchmarks estandar (MMLU, HumanEval, GSM8K) disponibles.
- No se reporta velocidad, latencia ni throughput; el rendimiento real en hardware Tensix no esta documentado.
- Riesgo de alucinacion inherente al modelo base Qwen2.5-14B, no mitigado por la cuantizacion.
- La cuantizacion BFP8 introduce una degradacion pequena pero no nula (KL 0,00197, top-1 98,44% frente a BF16); en tareas sensibles a la precision puede ser relevante.
- Licencia Apache 2.0 permite uso comercial, pero el autor declara el software "as is", sin garantia, y aclara que no esta afiliado ni respaldado por Tenstorrent.
- El repositorio tiene muy pocas descargas (50) y ningun "like", lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen2.5-14B-Instruct-1M-Tenstorrent-BFP8
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct-1M
- Variante BFP4: https://huggingface.co/Xylolabs/Qwen2.5-14B-Instruct-1M-Tensix-BFP4-GateUp
- Codigo (`tensix-bfp-gptq`): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion Tenstorrent: https://docs.tenstorrent.com
- Paper de referencia (Qwen2.5-1M): arXiv:2501.15383
