# tacos4me/GLM-5.3-Flash-NVFP4-FP8ATTN-512K

## Resumen

Este checkpoint, publicado por `tacos4me`, es una cuantización adicional del modelo `LibertAIDAI/GLM-5.3-Flash-NVFP4`, que a su vez es la versión NVFP4 del modelo original `zai-org/GLM-5.3-Flash` de Z.ai (Zhipu). El objetivo concreto de esta variante es permitir servir el modelo completo con una ventana de contexto de 524 288 tokens (512k) íntegramente en VRAM, sin descarga a CPU, sobre dos GPU NVIDIA RTX PRO 6000 Blackwell de 96 GB cada una (192 GB en total, TP2, sin NVLink). Para lograrlo, además de la cuantización NVFP4 de los expertos enrutados (que ya trae el padre), se convierten a block-FP8 (E4M3) las proyecciones de atención, el MLP denso compartido y la cabeza de salida (`lm_head`), que en el padre permanecían en BF16. El resultado es un checkpoint de 173.85 GiB (165 496 249 182 parámetros según los tensores safetensors) que, con los parches de servido incluidos en el repositorio, alcanza una velocidad de decodificación de 101.7 tokens/s en contexto corto sin decodificación especulativa.

La relevancia de este modelo radica en que demuestra que es posible ejecutar un MoE de 320B parámetros totales (18B activos) con contexto de medio millón de tokens en hardware de estación de trabajo de gama alta, algo que hasta ahora requería clústeres multi-GPU con interconexiones rápidas. El autor publica una compuerta de calidad (teacher-forced top-1 del 95.57 % frente al baseline con atención BF16, n=271) y pruebas de repetición a 225k y 259 632 tokens sin fallos. No obstante, el checkpoint solo funciona con una imagen de vLLM específica y los cuatro ficheros de parche del directorio `serving/`; no carga en vLLM estándar ni en las imágenes oficiales del modelo. Además, en el modo 512k la entrada es exclusivamente texto (la torre de visión no se carga), la decodificación especulativa MTP está desactivada y solo se procesa una secuencia a la vez (las peticiones concurrentes hacen cola).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida: 34 capas de atención lineal KDA + 11 capas de atención dispersa tipo DeepSeek (MLA) + 1 capa draft MTP |
| Parametros totales | 165 496 249 182 (según safetensors del checkpoint); el modelo base declara 320B totales |
| Parametros activos | 18B (del modelo base, MoE) |
| Longitud de contexto | 524 288 tokens (modo 512k); modo alternativo a 262 144 tokens con MTP activado |
| Tipos de cuantizacion | NVFP4 (expertos enrutados, ~97 % de los parámetros, heredado del padre) + block-FP8 E4M3 (proyecciones de atención excepto `kv_b_proj`, `f_b/g_b` e indexador disperso; MLP denso compartido y `lm_head`) |
| Idiomas soportados | en, zh (etiquetas del repo); el checkpoint en modo 512k es solo texto |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `zai-org/GLM-5.3-Flash` es un MoE de 320B parámetros totales y 18B activos, con una arquitectura híbrida que combina 34 capas de atención lineal (KDA) con 11 capas de atención dispersa basada en MLA (estilo DeepSeek) y una capa adicional de draft para decodificación especulativa MTP. Es nativamente multimodal y fue entrenado con un contexto de 1 000 000 de tokens. El checkpoint de `tacos4me` no modifica la arquitectura ni los pesos del modelo base: toma el checkpoint NVFP4 de `LibertAIDAI/GLM-5.3-Flash-NVFP4` (revisión `caca4e6a`, que incluye las escalas de entrada de los expertos recalibradas) y convierte 425 tensores de BF16 a block-FP8 E4M3 con escalas de des cuantización FP32 (`weight_scale_inv`). Esa conversión, junto con la caché KV en FP8, es lo que permite que el modelo completo y la ventana de 512k quepan en 192 GB de VRAM sin descarga a CPU. El autor indica que el checkpoint se reproduce bit a bit con los scripts `convert_fp8attn.py` y `convert_lmhead.py` incluidos en el repositorio.

## Capacidades

- Generación de texto y razonamiento de largo alcance: soporta contextos de hasta 524 288 tokens en el modo 512k, con prefill de 75-87 segundos para secuencias de ~503k tokens.
- Decodificación especulativa MTP en el modo alternativo de 262 144 tokens (velocidad de 129-146 tokens/s según el contenido); desactivada en el modo 512k.
- Sin soporte de tool calling ni function calling documentado en este checkpoint (el modelo base sí lo tiene, pero no se detalla aquí).
- Sin capacidades de agente multi-paso específicas más allá de la generación con contexto largo.
- Multilingüe limitado a inglés y chino según las etiquetas; el checkpoint en modo 512k es solo texto (la torre de visión no se carga).
- Sin modo de razonamiento explícito (thinking mode) documentado.

## Casos de uso

- Análisis de documentos extensos: procesar libros técnicos, expedientes legales o corpus completos de código en una sola pasada, gracias a la ventana de 524 288 tokens que permite mantener todo el documento en contexto sin fragmentación.
- Recuperación y verificación de hechos en bases de conocimiento largas: con la caché KV en FP8 y el contexto de 512k, se pueden realizar consultas que requieren localizar agujas en documentos de cientos de miles de tokens, como demuestran las pruebas de repetición a 225k y 259 632 tokens.
- Asistentes de programación con repositorios completos: el modelo puede recibir un repositorio entero (código fuente, documentación, tests) como contexto y generar respuestas coherentes sobre cualquier parte del mismo.
- Traducción y resumen de corpus largos en inglés y chino: al mantener el texto fuente completo en contexto, se evitan pérdidas de información por truncamiento.
- Investigación académica: revisión sistemática de literatura donde cada artículo se procesa en su totalidad y se comparan resultados entre decenas de documentos.
- Servicio de inferencia de larga duración en entornos con hardware Blackwell de gama alta: el checkpoint está optimizado para vLLM con parches específicos y puede desplegarse como endpoint de generación de texto con contexto extremo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor proporciona métricas propias de calidad y rendimiento medidas en el hardware objetivo:

| Metrica | Valor |
|---|---|
| Compuerta de calidad (teacher-forced top-1 vs baseline BF16-attention, n=271) | 95.57 % (build con escalas recalibradas); 96.68 % (build previo a la recalibración) |
| Prefill para 503 374 tokens | 80.4 s (build recalibrado); 75-87 s en pruebas previas |
| Decodificación single-stream a contexto corto (sin MTP) | 101.7 tokens/s |
| Decodificación single-stream a 262 144 tokens (con MTP k=1) | 129-146 tokens/s (depende del contenido) |
| Pruebas de repetición a 225k y 259 632 tokens (generación greedy de 2 712 tokens) | Peor repetición de 4-gramas: 3 y 2 (umbral de fallo ≥12) |

## Requisitos de hardware

- VRAM mínima: 192 GB (2 × 96 GB) para el modo 512k sin descarga a CPU. El autor confirma que el padre con atención BF16 no puede cargarse sin offload en este hardware (OOM durante la carga de pesos).
- GPU recomendadas: 2 × NVIDIA RTX PRO 6000 Blackwell Workstation (96 GB cada una), en configuración TP2, PCIe sin NVLink. También se mencionan despliegues en 4 × NVIDIA DGX Spark (GB10) para el modelo base con contexto 1M, pero no para este checkpoint concreto.
- No cabe en GPU de consumo típicas (RTX 4090, 24 GB, etc.) ni en configuraciones de 48 GB o 80 GB individuales.
- Opciones de despliegue: vLLM con la imagen específica `cstechdev/vllm:glm53-flash-nope-sm120-cu130-20260826-r1` y los cuatro ficheros del directorio `serving/` del repositorio (Dockerfile incluido). No se menciona soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: prefill de ~80 s para ~503k tokens, decodificación de ~102 tokens/s a contexto corto sin MTP, y 129-146 tokens/s a 262k con MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto maximo | Cuantizacion | Hardware para 512k | Licencia |
|---|---|---|---|---|---|
| tacos4me/GLM-5.3-Flash-NVFP4-FP8ATTN-512K (este) | 165.5B (checkpoint) / 320B base | 524 288 (modo 512k) | NVFP4 + block-FP8 | 2 × RTX PRO 6000 (192 GB) | MIT |
| LibertAIDAI/GLM-5.3-Flash-NVFP4 (padre) | 320B total / 18B activo | 1 000 000 (entrenado) | NVFP4 (expertos) + BF16 (atención) | No carga sin offload en 192 GB | MIT |
| zai-org/GLM-5.3-Flash (base) | 320B total / 18B activo | 1 000 000 (entrenado) | BF16 | No disponible | MIT |
| brandonmusic/GLM-5.3-Flash-tr3-4bpw | 320B total / 18B activo | 499 968 (medido) | 4-bit NVFP4 KV | 2 × RTX PRO 6000 (192 GB) | MIT |

El checkpoint de `tacos4me` se diferencia del de `brandonmusic` en que este último usa caché KV en 4-bit NVFP4 para alcanzar ~498k tokens (con una compuerta de calidad fallida, 3/10), mientras que este usa caché KV en FP8-e4m3 y publica una compuerta de calidad aprobada (95.57 %). El padre con atención BF16 no puede servir 512k sin offload en este hardware.

## Limitaciones y advertencias

- El checkpoint no carga en vLLM estándar ni en las imágenes oficiales de GLM-5.3-Flash; requiere una imagen específica y cuatro ficheros de parche. Sin ellos, se producen `KeyError` en los tensores `weight_scale_inv` de atención o fallos de forma en el embedding de vocabulario.
- En el modo 512k la entrada es solo texto: la torre de visión no se carga, por lo que se pierde la multimodalidad del modelo base.
- La decodificación especulativa MTP está desactivada en el modo 512k; activarla reduce el contexto máximo a 262 144 tokens.
- Solo se procesa una secuencia a la vez (`--max-num-seqs 1`); las peticiones concurrentes se ponen en cola, lo que limita el throughput en entornos multi-usuario.
- El autor advierte que las escalas de entrada de los expertos pasaron por tres revisiones en un día; este repo fija la revisión recalibrada `caca4e6a`, pero si se usara una versión con `input_scale=1.0` se produciría underflow en bloques de activación con amax pequeño, causando repeticiones intermitentes.
- Aunque la compuerta de calidad supera el umbral del 95 %, se trata de una métrica propia del autor (teacher-forced top-1) y no de benchmarks estandarizados; la calidad real en tareas abiertas no está verificada de forma independiente.
- El modelo está etiquetado como WIP/preview en la fecha de publicación (2026-08-30); el autor indica que los pesos y los parches están en proceso de verificación final.
- La licencia MIT permite uso comercial, pero el modelo base y el padre también son MIT, por lo que no hay restricciones de licencia adicionales conocidas.

## Enlaces

- Repositorio del checkpoint: https://huggingface.co/tacos4me/GLM-5.3-Flash-NVFP4-FP8ATTN-512K
- Modelo padre (NVFP4): https://huggingface.co/LibertAIDAI/GLM-5.3-Flash-NVFP4
- Modelo base (zai-org): https://huggingface.co/zai-org/GLM-5.3-Flash
- Checkpoint alternativo para 512k (brandonmusic): https://huggingface.co/brandonmusic/GLM-5.3-Flash-tr3-4bpw
- PR de vLLM para soporte `glm5_next`: https://github.com/vllm-project/vllm/pull/53906
- Discusión sobre escalas de entrada del padre: https://huggingface.co/LibertAIDAI/GLM-5.3-Flash-NVFP4/discussions/7
- Guía de ejecución local (unsloth): https://unsloth.ai/docs/models/glm-5.3-flash
- Despliegue en DGX Spark (referencia): https://github.com/tonyd2wild/GLM-5.3-Flash-NVFP4-DFlash2-2x-DGX-Spark
