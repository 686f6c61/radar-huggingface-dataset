# tattrongvu/Jeffan-9B-1211-NVFP4

## Resumen

Jeffan-9B-1211-NVFP4 es una versión cuantizada en NVFP4 (W4A4, FP4 E2M1) del modelo Jeffan-9B-1211, desarrollado por el usuario tattrongvu y construido a su vez sobre Qwen/Qwen3.5-9B. No es un modelo generativo al uso: está especializado en toma de decisiones estructuradas, es decir, recibe un estado y una pregunta con opciones múltiples y devuelve, en un único forward pass, una probabilidad para cada opción, sin generar texto. La cuantización afecta a las 200 proyecciones del decoder (atención, Gated DeltaNet y MLP) y mantiene en BF16 el `lm_head`, los embeddings, `in_proj_a/b`, `conv1d` y las normas.

El modelo está pensado para exprimir los tensor cores FP4 de las GPU NVIDIA Blackwell. Según la model card, reduce el peso de 16,7 GiB a 7,5 GiB y multiplica por 2,5 el throughput en una RTX PRO 6000 Blackwell (39,1 req/s frente a 15,7 req/s del BF16), a cambio de una pérdida de 1,95 puntos en el índice público Jev Decision Index 0.3 respecto al modelo base en la misma ruta de vLLM.

Es relevante ahora porque demuestra una ruta práctica de despliegue de clasificación/decision-making a bajo coste por petición sobre hardware Blackwell, con licencia Apache 2.0 y soporte directo en vLLM (sin plugin), aunque exige una versión muy concreta de vLLM main y una GPU con tensor cores FP4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5 (atención completa + Gated DeltaNet), con proyecciones del decoder en NVFP4 |
| Parametros totales | 8.953.803.264 (~8,95 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (configurado en el ejemplo de vLLM con `max_model_len=32768`) |
| Tipos de cuantizacion | NVFP4 W4A4 (FP4 E2M1 en bloques de 16, escalas de bloque FP8 E4M3 y escala global FP32 por tensor); resto en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato NVFP4 de ModelOpt), pensado para vLLM |

## Arquitectura y entrenamiento

El modelo base Jeffan-9B-1211 (revisión `27315da`) deriva de Qwen/Qwen3.5-9B, un transformer con capas de atención completa y capas Gated DeltaNet (atención lineal con estado recurrente). La particularidad funcional es que la respuesta se lee de los logits del `lm_head` sobre los códigos de las opciones, sin decodificación autoregresiva: un único forward pass produce la distribución de probabilidad sobre las alternativas. El modelo base se evalúa con 2 pasadas del bucle de capas en su motor de Decision Index (transformers), mientras que vLLM lo sirve con 1 pasada.

La cuantización se realizó con NVIDIA Model Optimizer 0.48.0 usando escalas de peso Local-Hessian (cada escala de bloque se elige para minimizar el error de salida de la capa), calibración por capas con batch size 1 y 512 prompts de decisión en el formato propio del modelo. Se cuantizaron las 200 proyecciones del decoder: `q/k/v/o_proj` de atención, `in_proj_qkv`, `in_proj_z` y `out_proj` de Gated DeltaNet, y `gate/up/down_proj` del MLP. Se mantienen en BF16 `lm_head`, embeddings, `in_proj_a/b`, `conv1d` y normas. No se detalla en la información disponible el volumen de tokens de entrenamiento del modelo base ni si hubo RLHF/DPO.

## Capacidades

- Clasificación/decision-making estructurado: dado un estado y una pregunta con opciones, devuelve una probabilidad por opción en un solo forward pass, sin generación de texto.
- Preguntas de opción múltiple y tareas de selección entre alternativas.
- Salida interpretable como distribución de probabilidad sobre las opciones (útil para umbrales y calibración).
- Áreas evaluadas en el Jev Decision Index: Knowledge, Language, Retrieval, Tools y Arts.
- Capacidad de tool selection implícita (dimensión Tools del índice: 85,75 en NVFP4).
- Soporte de prompts largos (hasta 32.768 tokens) con atención bidireccional en las capas de atención completa (`is_causal: false`).
- No soporta generación de texto libre, tool calling en sentido agéntico ni multi-step reasoning generativo: la respuesta es una lectura de logits.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Enrutamiento de decisiones en pipelines: usar el modelo como clasificador de la mejor acción entre un conjunto cerrado de opciones (por ejemplo, qué herramienta invocar o qué categoría asignar), leyendo la probabilidad por opción en una sola pasada y con latencia de ~20 ms por petición.
- Moderación y triaje de contenido: dado un texto y un conjunto de etiquetas, obtener la distribución de probabilidad sobre las categorías para aplicar umbrales configurables, aprovechando el throughput de 39,1 req/s en una RTX PRO 6000 Blackwell.
- Selección de herramienta en agentes: la dimensión Tools del índice (85,75) sugiere su uso como módulo de decisión de qué función llamar dentro de un agente, dejando la generación al modelo principal.
- Preguntas de opción múltiple a escala: evaluación automática de exámenes o formularios con opciones cerradas, donde la salida probabilística permite medir confianza además de la respuesta elegida.
- Retrieval reranking con opciones: decidir entre candidatos recuperados presentados como opciones, usando la probabilidad como señal de ordenación; la dimensión Retrieval obtiene 67,11 en NVFP4.
- Despliegue de bajo coste en producción: servir el modelo con vLLM en GPU Blackwell con 7,5 GiB de pesos, liberando VRAM para otros servicios en la misma GPU, con licencia Apache 2.0 para uso comercial.
- Clasificación por lotes offline: procesar grandes volúmenes de decisiones estructuradas con `max-cudagraph-capture-size 2048` para mantener los prompts típicos (200-2.000 tokens) en CUDA graphs y maximizar throughput.

## Benchmarks y rendimiento

Resultados del Jev Decision Index 0.3 (suite pública completa, 140.620 peticiones puntuadas, incluido HLE):

| Modelo | Pasadas del bucle | Índice público | Cambio | Raw | Knowledge | Language | Retrieval | Tools | Arts |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Jeffan-9B-1211, publicado (motor Decision Index) | 2 | 70,55 | — | 77,58 | 56,82 | 72,70 | 74,29 | 88,61 | 59,95 |
| Jeffan-9B-1211, vLLM (RTX PRO 6000) | 1 | 67,27 | −4,65% | 75,47 | 51,90 | 70,13 | 68,81 | 87,39 | 59,76 |
| **Jeffan-9B-1211-NVFP4, vLLM (RTX PRO 6000)** | 1 | **65,32** | **−7,41%** | 74,06 | 49,63 | 67,97 | 67,11 | 85,75 | 58,09 |

La cuantización por sí sola (NVFP4 frente a Jeffan-9B-1211 en la misma ruta de vLLM) cuesta 1,95 puntos del índice público (−2,90%; intervalo del 95%: −2,34 a −1,51 puntos, bootstrap pareado con 200 remuestreos). Una pasada del bucle en vLLM frente a las 2 publicadas cuesta 3,28 puntos. La cuantización penaliza entre 1,6 y 2,3 puntos en cada área (Knowledge −2,27, Language −2,16, Retrieval −1,70, Arts −1,67, Tools −1,64). No es un resultado oficial de leaderboard.

Rendimiento en una RTX PRO 6000 Blackwell (vLLM, mezcla de 300 peticiones de decisión, bucle cerrado):

| Métrica | Jeffan-9B-1211 (BF16) | Jeffan-9B-1211-NVFP4 |
|---|---:|---:|
| Pico de peticiones/s | 15,7 | **39,1** |
| Latencia mediana, una petición a la vez | 31 ms | **20 ms** |
| Pesos en GPU | 16,7 GiB | 7,5 GiB |

## Requisitos de hardware

- GPU con tensor cores FP4: NVIDIA Blackwell obligatoria. Medido en una NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB).
- VRAM estimada: 7,5 GiB de pesos en GPU; con `gpu_memory_utilization=0.90` y contexto de 32.768 tokens hay que reservar espacio adicional para KV cache y activaciones.
- No cabe en GPU consumer sin tensor cores FP4: el checkpoint es formato NVFP4 de ModelOpt y transformers no lo ejecuta; requiere vLLM.
- Despliegue: vLLM main en commit `2e9a6ad8` o posterior (switch bidireccional para checkpoints de la familia Qwen3.5, sin plugin). Instalación de referencia: `vllm==0.34.0rc1.dev238+g2e9a6ad81`, PyTorch con CUDA 13.0.
- Configuración necesaria: `is_causal: false`, prompts prellenados enteros (sin prefix caching ni chunked prefill), `--max-cudagraph-capture-size 2048` para mantener prompts de 200-2.000 tokens en CUDA graphs (sin esto, NVFP4 es más lento que BF16 a una petición: 43 ms).
- Backend de atención: TRITON_ATTN en la RTX PRO 6000; en otras tarjetas, el backend que soporte vLLM.
- Latencia y throughput medidos: 20 ms de latencia mediana (una petición) y 39,1 req/s de pico en la RTX PRO 6000.
- No disponible información sobre despliegue en llama.cpp, Ollama o TGI: el formato NVFP4 y la dependencia de vLLM main lo impiden en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Índice público (Jev 0.3) | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| Jeffan-9B-1211-NVFP4 | ~8,95 B | 32.768 | 65,32 (vLLM, 1 pasada) | Apache 2.0 | Hugging Face, requiere GPU Blackwell y vLLM main |
| Jeffan-9B-1211 (BF16) | ~8,95 B | 32.768 | 67,27 (vLLM, 1 pasada) / 70,55 (publicado, 2 pasadas) | Apache 2.0 | Hugging Face, transformers y vLLM |
| Jeffan-9B-1211-FP8 | ~8,95 B | 32.768 | no disponible | Apache 2.0 | Hugging Face; opción más precisa a tamaño FP8 según la model card |
| Qwen/Qwen3.5-9B (base) | ~9 B (no confirmado) | no disponible | no disponible | no disponible en esta información | Hugging Face |

No se dispone de resultados de benchmarks de modelos comparables de la misma categoría (clasificación/decision-making estructurado) en la información proporcionada.

## Limitaciones y advertencias

- La cuantización NVFP4 introduce una pérdida medible de calidad: 1,95 puntos del índice público frente al modelo base en la misma ruta de vLLM, con penalización en todas las áreas (1,6-2,3 puntos).
- El resultado publicado de 70,55 no es alcanzable en vLLM: requiere 2 pasadas del bucle con el motor Decision Index y transformers; en vLLM se sirve con 1 pasada.
- Dependencia estricta de hardware: solo funciona en GPU NVIDIA Blackwell con tensor cores FP4; no es ejecutable en transformers ni en GPUs anteriores.
- Dependencia de una versión concreta de vLLM main (commit `2e9a6ad8` o posterior) y de configuración específica (`is_causal: false`, sin prefix caching ni chunked prefill), lo que complica el despliegue en producción.
- Sin `--max-cudagraph-capture-size 2048`, el rendimiento a una petición cae por debajo del BF16 (43 ms frente a 31 ms).
- El modelo no genera texto: no sirve para tareas generativas, agentes con razonamiento multi-paso ni tool calling en sentido estricto; solo produce distribuciones sobre opciones predefinidas.
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingüe.
- Riesgo de alucinación no evaluado en la información disponible; al leer logits sobre opciones cerradas, el riesgo se traslada a una elección incorrecta con alta confianza.
- Sesgos conocidos no documentados.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-9B y las dependencias de vLLM deben verificarse por separado.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni informes independientes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tattrongvu/Jeffan-9B-1211-NVFP4
- Modelo base: https://huggingface.co/tattrongvu/Jeffan-9B-1211
- Variante FP8: https://huggingface.co/tattrongvu/Jeffan-9B-1211-FP8
- Modelo Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Wheels de vLLM (commit 2e9a6ad8): https://wheels.vllm.ai/2e9a6ad8100cf648d1c87c03f723dfe34fe5d12a
- PyTorch CUDA 13.0: https://download.pytorch.org/whl/cu130
