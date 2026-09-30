# xbill9/gpu-vllm-t4-2b-w4a16

## Resumen

`xbill9/gpu-vllm-t4-2b-w4a16` no es un modelo de pesos, sino el *rig* de servicio (recetas de reconstruccion, scripts y evidencias de medida) que sirve con vLLM el checkpoint `xbill9/gemma-4-E2B-it-qat-q4_0-w4a16-ct-text-emb4`, un derivado de la release QAT de Google Gemma 4 E2B. El repositorio lo publica el usuario xbill9 y documenta como llevar un Gemma 4 E2B en 4 bits de extremo a extremo sobre una unica NVIDIA Tesla T4 (arquitectura Turing) adjunta a una VM de Google Compute Engine.

El modelo servido es un Gemma 4 E2B instruction-tuned, text-only: el pipeline de repack elimina las torres de vision y audio del checkpoint original y cuantiza tambien las tablas de embeddings (`embed_tokens`, `lm_head` y las PLE) a int4. La cuantizacion es w4a16 por grupos de 32, heredada del entrenamiento con QAT (quantization aware training) de Google, no una cuantizacion post-hoc: el repack recupera la rejilla de 4 bits ya presente en los valores bf16 y aborta si detecta grupos fuera de rejilla.

Su relevancia es practica: demuestra que un Gemma 4 E2B puede servirse con vLLM 0.29.0 en una GPU Turing de gama anterior con carga de modelo de solo 2,86 GiB y una decodificacion monoflujo de 109,7 tok/s. El repositorio incluye las medidas que respaldan esas cifras y el parche de Triton necesario para Turing, lo que lo convierte en una referencia de despliegue de bajo coste mas que en un artefacto de pesos reutilizable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E2B), variante text-only tras eliminar las torres de vision y audio; embeddings por capa (PLE) cuantizados a int4 |
| Parametros totales | No disponible con precision; la denominacion comercial es E2B (2B) |
| Longitud de contexto | 16.384 tokens en la configuracion servida (`--max-model-len 16384`); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | W4A16, int4 en grupos de 32, QAT, formato compressed-tensors |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors con compressed-tensors (int4/w4a16); el repositorio `gpu-vllm-t4-2b-w4a16` no contiene pesos, solo scripts |

Notas: el repositorio es un rig de servicio, no un checkpoint. Los pesos reales residen en `xbill9/gemma-4-E2B-it-qat-q4_0-w4a16-ct-text-emb4`. No se trata de un MoE en el sentido clasico, por lo que no se incluye la fila de parametros activos.

## Arquitectura y entrenamiento

El checkpoint servido parte de la release QAT de Google DeepMind para Gemma 4 E2B, instruction-tuned y con licencia Apache 2.0. Sobre esa base, el autor aplica tres transformaciones encadenadas: `repack_q4_0.py` convierte las capas lineales a W4A16 recuperando la rejilla de 4 bits que el export QAT de Google ya almacena en bf16 (en grupos de 32); `text_only.py` elimina las torres de vision y audio; y `embed_int4.py` cuantiza a int4 las tablas `embed_tokens`, `lm_head` y las PLE (per-layer embeddings). Cada paso aborta si encuentra un grupo fuera de rejilla, de modo que la cuantizacion es exacta respecto al entrenamiento original en lugar de aproximada.

La innovacion tecnica destacable no esta en el modelo sino en el despliegue: el rig aplica un parche a Triton para adaptarlo a la arquitectura Turing (`patch_triton_turing.py`), activa un swapfile en un host de solo 7,8 GB de RAM y lanza vLLM con `--dtype float16`, `--gpu-memory-utilization 0.90`, `--max-model-len 16384` y `--max-num-seqs 8`. No se documentan en la informacion disponible detalles sobre el numero de tokens de entrenamiento, composicion del dataset ni si hubo fases de RLHF o DPO mas alla del instruction-tuning propio de la release de Google.

## Capacidades

- Generacion de texto en modo text-only; las torres de vision y audio del Gemma 4 E2B original se eliminan en este repack.
- Modelo instruction-tuned, apto para conversacion multturno dentro de la ventana de 16.384 tokens configurada.
- Capacidad de razonamiento y generacion de codigo: no confirmada explicitamente en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el repositorio si expone un servidor MCP con la herramienta `start_vllm_server` para operar el propio rig, no para uso del modelo.
- Capacidades multilingues: no disponibles.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Inferencia cuantizada int4 de extremo a extremo, incluida la capa de embeddings, con salida compatible con vLLM.

## Casos de uso

- Servicio de inferencia de bajo coste en GPU antigua: desplegar un Gemma 4 E2B en 4 bits sobre una Tesla T4 ya existente en una VM de Compute Engine, con carga de modelo de 2,86 GiB y sin necesidad de GPU de gama alta.
- Sustitucion de un despliegue bf16 por uno cuantizado: el mismo rig bf16 (`gpu-vllm-t4-2b`) consume 6,33 GiB de carga y decodifica a 81,6 tok/s, frente a los 2,86 GiB y 109,7 tok/s de este, lo que libera VRAM para cache KV o para servir mas secuencias.
- Chatbots de asistencia text-only en produccion: la ventana de 16.384 tokens y una cache KV medida de 1.099.362 tokens permiten mantener conversaciones largas y multiples sesiones concurrentes dentro de los 16 GB de la T4.
- Procesamiento por lotes de texto (resumen, clasificacion, extraccion): ejecutable en hosts modestos gracias a la reduccion de huella de memoria, sin requerir aceleradores de ultima generacion.
- Entornos de desarrollo y CI con GPU Turing disponible: el rig incluye scripts de arranque, parada y consulta (`vllm-t4 start|stop|status|query|log|swap`) que facilitan integrar el servidor en flujos automatizados.
- Laboratorio de cuantizacion y QAT: el repositorio sirve como referencia reproducible de como recuperar una rejilla QAT de 4 bits y verificar que ningun grupo queda fuera de rejilla, util para evaluar pipelines propios.
- Bases de conocimiento con recuperacion aumentada (RAG): la combinacion de contexto de 16.384 tokens, decodificacion de 109,7 tok/s y licencia Apache 2.0 es adecuada para prototipos y servicios internos de generacion aumentada.
- Operacion mediante agentes MCP: el servidor MCP incluido expone herramientas de gestion (como `start_vllm_server`) para automatizar el ciclo de vida del despliegue desde un CLI de agente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las unicas cifras publicadas son medidas de despliegue sobre una Tesla T4, con vLLM 0.29.0 y cache de compilacion caliente:

| Build | Carga de modelo | Cache KV (tokens) | Decodificacion, c=1 |
|---|---:|---:|---:|
| Google `-qat-w4a16-ct` | 8,02 GiB | — | — |
| Repack multimodal de xbill9, `--language-model-only` | 6,37 GiB | 707.617 | — |
| xbill9 `-text` (embeddings bf16) | 6,33 GiB | 711.539 | 81,6 tok/s |
| xbill9 `-text-emb4` (servido) | 2,86 GiB | 1.099.362 | 109,7 tok/s |

Solo hay medidas monoflujo; no existe barrido de concurrencia para este rig. El articulo enlazado titula la comparacion QAT w4a16 frente a bf16 como 1,79x mas rapida en decodificacion; las cifras de la tabla de este repositorio corresponden a 109,7 frente a 81,6 tok/s.

## Requisitos de hardware

- VRAM de inferencia: 2,86 GiB de carga del modelo servido (`-text-emb4`), segun medida sobre Tesla T4.
- VRAM adicional: cache KV dimensionada con `--gpu-memory-utilization 0.90`; capacidad reportada de 1.099.362 tokens.
- GPU recomendada en esta configuracion: NVIDIA Tesla T4 (Turing, compute capability 7.5), con parche de Triton para Turing (`patch_triton_turing.py`).
- Cabe en GPU de consumo: la informacion disponible no documenta despliegue en GPU de consumo; el rig esta validado sobre Tesla T4. Otros rigs del monorepo usan NVIDIA L4, g5g y g4dn.
- Host: VM de Compute Engine con 7,8 GB de RAM; requiere swapfile, que el propio script `vllm-t4` activa antes de arrancar vLLM.
- Opciones de despliegue: vLLM 0.29.0 con `--dtype float16`; no se documentan rutas con llama.cpp, Ollama, TGI ni GGUF. Se incluye un servidor MCP para gestion.
- Throughput: 109,7 tok/s en decodificacion monoflujo (c=1). Latencia no disponible.
- Restriccion operativa: solo un rig sirve a la vez, ya que este y `gpu-vllm-t4-2b` comparten GPU y el puerto 8000.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Carga en T4 | Contexto servido | Licencia | Disponibilidad |
|---|---|---|---:|---|---|---|
| `gemma-4-E2B-it-qat-q4_0-w4a16-ct-text-emb4` (servido) | E2B (2B) | W4A16 int4 + embeddings int4 | 2,86 GiB | 16.384 tokens | Apache 2.0 | HuggingFace |
| `gemma-4-E2B-it-qat-q4_0-w4a16-ct` (Google) | E2B (2B) | W4A16 int4 | 8,02 GiB | No disponible | Apache 2.0 | Export QAT de Google |
| Repack multimodal xbill9 (`--language-model-only`) | E2B (2B) | W4A16 int4 | 6,37 GiB | No disponible | Apache 2.0 | HuggingFace |
| `gpu-vllm-t4-2b` (referencia bf16) | E2B (2B) | bf16 | 6,33 GiB | No disponible | Apache 2.0 | Repo GitHub |

La comparativa se limita a variantes del mismo Gemma 4 E2B sobre la misma GPU; no se dispone de datos de benchmarks que permitan comparar con modelos de otros fabricantes de tamano similar.

## Limitaciones y advertencias

- El repositorio `xbill9/gpu-vllm-t4-2b-w4a16` no contiene pesos: es un rig de servicio. Los pesos estan en `xbill9/gemma-4-E2B-it-qat-q4_0-w4a16-ct-text-emb4`.
- Es un proyecto no oficial: no esta afiliado ni respaldado por Google, aunque Gemma 4 se publica bajo Apache 2.0.
- Alcance reducido a texto: el repack elimina las torres de vision y audio, por lo que no hay capacidades multimodales pese a que el modelo base Gemma 4 E2B las incluya.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es un modelo de 2B parametros, con la precision inherente a ese tamano.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Idiomas soportados: no disponibles; no hay evaluacion multilingue publicada para este repack.
- Sin barrido de concurrencia: las cifras de rendimiento son monoflujo, con `--max-num-seqs 8` configurado pero no medido en carga concurrente.
- Requiere parche especifico de Triton para Turing; sin el, el servidor no arranca en T4.
- El host necesita swapfile y solo un rig puede ocupar la GPU y el puerto 8000 a la vez.
- Tras cambiar `MODEL_NAME` hay que reiniciar una vez: el primer arranque compila desde cero y dimensiona mal la cache KV.
- La licencia Apache 2.0 permite uso comercial del modelo, pero la informacion disponible no cubre los terminos adicionales de la licencia de Gemma 4 mas alla del enlace oficial.

## Enlaces

- Repositorio del rig en HuggingFace: https://huggingface.co/xbill9/gpu-vllm-t4-2b-w4a16
- Checkpoint servido: https://huggingface.co/xbill9/gemma-4-E2B-it-qat-q4_0-w4a16-ct-text-emb4
- Monorepo `gemma4-dev`: https://github.com/xbill9/gemma4-dev
- Rig en GitHub: https://github.com/xbill9/gemma4-dev/tree/main/gpu-vllm-t4-2b-w4a16
- Rig de referencia bf16: https://github.com/xbill9/gemma4-dev/tree/main/gpu-vllm-t4-2b
- Benchmarks del rig: https://github.com/xbill9/gemma4-dev/tree/main/gpu-vllm-t4-2b/benchmarks
- Articulo: Gemma 4 on a Tesla T4, Part 2: The Minimum GCE VM and a Script to Drive It: https://dev.to/gde/gemma-4-on-a-tesla-t4-part-2-the-minimum-gce-vm-and-a-script-to-drive-it-3gk1
- Articulo: Gemma 4 on a Tesla T4: QAT Weights Decode 1.79x Faster Than bf16: https://dev.to/gde/gemma-4-on-a-tesla-t4-qat-weights-decode-179x-faster-than-bf16-2fi4
- Articulo: 2B Gemma 4 QAT Deployment with GCE, NVIDIA L4, MCP, and Antigravity CLI: https://xbill999.medium.com/2b-gemma-4-qat-deployment-with-gce-nvidia-l4-mcp-and-antigravity-cli-5cc952eadc7f
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
