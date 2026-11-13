# tattrongvu/Jeffan-27B-1211-NVFP4

## Resumen

Jeffan-27B-1211-NVFP4 es un checkpoint cuantizado en NVFP4 (W4A4) del modelo Jeffan-27B-1211 de tattrongvu, a su vez derivado de Qwen/Qwen3.8-27B. No es un modelo generativo al uso: actúa como motor de decisión que recibe un estado y una pregunta de opción múltiple y devuelve, en una única pasada hacia delante, una distribución de probabilidad sobre cada opción leyendo los logits de `lm_head`. La cuantización reduce los pesos de 50,1 GiB a 17,8 GiB y multiplica por 2,9 el throughput en una RTX PRO 6000 Blackwell, con una pérdida de 0,35 puntos en el índice público Jev Decision Index 0.3.

El interés técnico está en dos frentes. Por un lado, demuestra una receta de cuantización FP4 funcional con NVIDIA Model Optimizer 0.48.0 sobre las 400 proyecciones del decoder, manteniendo en BF16 las partes sensibles (embeddings, `lm_head`, normas y las proyecciones `in_proj_a/b` y `conv1d` de las capas Gated DeltaNet). Por otro, documenta con rigor el coste medido de esa cuantización: −0,35 puntos de índice con un intervalo de confianza del 95 % de −0,58 a −0,17, calculado con bootstrap pareado sobre 140.178 peticiones.

El modelo solo se ejecuta en vLLM sobre GPUs Blackwell con núcleos tensoriales FP4, y requiere una configuración de atención bidireccional (`is_causal: false`) heredada del modelo base. El tamaño real de parámetros en safetensors es de 14.732.516.864 (unos 14,7 B), pese a la nomenclatura "27B" del nombre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas de atención completa y capas Gated DeltaNet (familia Qwen3.5), texto únicamente |
| Parametros totales | 14.732.516.864 (según safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens en la configuración de inferencia de referencia (`max_model_len=32768`) |
| Tipos de cuantizacion | NVFP4 W4A4: valores FP4 E2M1 en bloques de 16 con escalas de bloque FP8 E4M3 y escala global FP32 por tensor; `lm_head`, embeddings, `in_proj_a/b`, `conv1d` y normas en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato NVFP4 de ModelOpt; requiere vLLM (transformers no lo ejecuta) |

## Arquitectura y entrenamiento

El modelo base Jeffan-27B-1211 se construye sobre Qwen/Qwen3.8-27B, un transformer de la familia Qwen3.5 que combina capas de atención completa con capas Gated DeltaNet (atención lineal con estado recurrente). El checkpoint cuantizado aplica NVFP4 a las 400 proyecciones del decoder: `q_proj`, `k_proj`, `v_proj`, `o_proj`, `in_proj_qkv`, `in_proj_z`, `out_proj`, `gate_proj`, `up_proj` y `down_proj`. La calibración se hizo con 512 prompts de decisión en el formato propio del modelo, con escalas de peso Local-Hessian (cada escala de bloque minimiza el error de salida de la capa), calibración capa a capa y batch size 1, usando NVIDIA Model Optimizer 0.48.0.

No se dispone de información sobre el dataset de entrenamiento del modelo base (número de tokens, composición, si hubo RLHF o DPO). La innovación documentada es exclusivamente la cuantización FP4 y su evaluación controlada: la comparación se hace con las mismas peticiones, ajustes de servidor y cliente entre BF16 y NVFP4, y la pérdida se atribuye con bootstrap pareado. El modelo no genera texto; el pipeline es de clasificación/decision-making con lectura de logits en una sola pasada.

## Capacidades

- Decisión estructurada sobre opción múltiple: dado un estado y una pregunta con opciones, devuelve una probabilidad por opción leída de los logits de `lm_head` en una única pasada, sin generación autoregresiva.
- Clasificación de texto con `pipeline_tag: text-classification`.
- Razonamiento de tipo knowledge, language, retrieval, tools y arts, según las cinco dimensiones del Jev Decision Index 0.3.
- Soporte de tool calling evaluado en la dimensión Tools del índice (89,36 puntos en NVFP4).
- Capacidades multilingües: no disponibles en la información proporcionada.
- No soporta visión, audio ni modo thinking explícito según la documentación disponible.

## Casos de uso

- Enrutado de decisiones en producción: el modelo recibe un estado serializado y una pregunta con opciones cerradas y devuelve la probabilidad de cada una en una sola pasada, lo que permite umbrales de confianza y abstención sin coste de generación.
- Clasificación de tickets o consultas: con 32.768 tokens de contexto y atención bidireccional sobre el prompt completo, puede clasificar conversaciones largas en categorías predefinidas con una latencia mediana de 42 ms en RTX PRO 6000.
- Selección de herramienta en agentes: la dimensión Tools del índice (89,36) indica buen rendimiento eligiendo entre opciones de tool calling; encaja como paso de decisión previo a la ejecución de la herramienta.
- Evaluación de retrieval: la dimensión Retrieval (75,54) permite usarlo como juez de relevancia o de selección de pasaje entre candidatos en pipelines RAG.
- Moderación y policy checks: preguntas de opción múltiple sobre cumplimiento de políticas con salida probabilística, útil para auditar decisiones con umbrales calibrados.
- Serving de alto throughput en Blackwell: con 11,63 req/s de pico y 60,2 GiB de KV-cache disponible con `--gpu-memory-utilization 0.90`, es adecuado para servicios de decisión con muchas peticiones cortas (200-2.000 tokens).
- Investigación en cuantización FP4: sirve como referencia reproducible de la receta ModelOpt NVFP4 con métricas de degradación publicadas.

## Benchmarks y rendimiento

Resultados en la suite pública completa del Jev Decision Index 0.3 (140.178 peticiones puntuadas):

| Modelo | Índice público | Cambio | Raw | Knowledge | Language | Retrieval | Tools | Arts |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Jeffan-27B-1211, publicado (motor Decision Index) | 73,39 | — | 79,65 | 62,45 | 75,29 | 76,12 | 89,46 | 61,87 |
| Jeffan-27B-1211, vLLM (RTX PRO 6000) | 73,32 | −0,10 % | 79,59 | 62,41 | 75,15 | 76,07 | 89,35 | 62,03 |
| Jeffan-27B-1211-NVFP4, vLLM (RTX PRO 6000) | 72,97 | −0,57 % | 79,36 | 61,93 | 74,81 | 75,54 | 89,36 | 61,69 |

Rendimiento en una RTX PRO 6000 Blackwell (vLLM, mezcla de 300 peticiones de decisión, bucle cerrado):

| Métrica | Jeffan-27B-1211 (BF16) | Jeffan-27B-1211-NVFP4 |
|---|---:|---:|
| Pico de peticiones/s | 3,93 | 11,63 |
| Latencia mediana, una petición a la vez | 76 ms | 42 ms |
| Pesos en GPU | 50,1 GiB | 17,8 GiB |
| Espacio de KV-cache con `--gpu-memory-utilization 0.90` | 26,2 GiB | 60,2 GiB |

En la suite pública completa, el paquete NVFP4 necesitó 2,4 veces menos horas de GPU que BF16 con los mismos ajustes de servidor. No es un resultado oficial de leaderboard.

## Requisitos de hardware

- VRAM estimada: 17,8 GiB de pesos; con `--gpu-memory-utilization 0.90` en una tarjeta de 96 GiB quedan 60,2 GiB para KV-cache.
- GPU imprescindibles: NVIDIA Blackwell con núcleos tensoriales FP4. Medido en una RTX PRO 6000 Blackwell Server Edition (96 GB).
- No cabe en GPUs consumer sin FP4: las RTX 4090 (Ada) no tienen núcleos tensoriales FP4, por lo que el checkpoint no puede ejecutarse como está.
- Despliegue: exclusivamente vLLM main en el commit `2e9a6ad8` o posterior (vLLM 0.34.0rc1.dev238+g2e9a6ad81), sin plugin. transformers no ejecuta este checkpoint.
- Configuración obligatoria: `is_causal: false`, sin prefix caching ni chunked prefill, `attention_backend="TRITON_ATTN"`, `max_cudagraph_capture_size: 2048` para mantener los prompts típicos en CUDA graphs (sin esto, NVFP4 no es más rápido que BF16 a una petición a la vez), `max_logprobs=26` y `logprobs_mode="processed_logprobs"`.
- Latencia y throughput: 42 ms de mediana a una petición y 11,63 req/s de pico en RTX PRO 6000 Blackwell.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Índice público | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeffan-27B-1211-NVFP4 | 14,7 B (según safetensors) | 32.768 | 72,97 | Apache 2.0 | Hugging Face, requiere vLLM + Blackwell |
| Jeffan-27B-1211 (BF16) | no disponible | 32.768 | 73,39 (publicado) / 73,32 (vLLM) | Apache 2.0 | Hugging Face, transformers o vLLM |
| Qwen/Qwen3.8-27B | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No hay datos publicados de otros modelos comparables de decisión por opción múltiple en la información disponible.

## Limitaciones y advertencias

- Solo se ejecuta en vLLM main reciente y en GPUs Blackwell con FP4; no hay soporte en transformers ni en GPUs Ada/Hopper para este checkpoint.
- Requiere atención bidireccional (`is_causal: false`) y precarga completa del prompt: sin prefix caching ni chunked prefill, lo que limita el reuso de prefijos largos.
- La cuantización cuesta 0,35 puntos de índice público (−0,48 %), concentrados en Retrieval (−0,53) y Knowledge (−0,48); Tools no se degrada.
- El modelo no genera texto: solo produce probabilidades sobre opciones; no sirve para generación abierta.
- Riesgo de alucinación en la selección de opciones no cuantificado en la información disponible; el uso de umbrales de confianza sobre las probabilidades es responsabilidad del integrador.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles; no se documenta cobertura multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero la dependencia de vLLM main y de hardware Blackwell condiciona el despliegue en producción.
- Los resultados del índice no son un resultado oficial de leaderboard.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tattrongvu/Jeffan-27B-1211-NVFP4
- Modelo base: https://huggingface.co/tattrongvu/Jeffan-27B-1211
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Wheels de vLLM: https://wheels.vllm.ai/2e9a6ad8100cf648d1c87c03f723dfe34fe5d12a
