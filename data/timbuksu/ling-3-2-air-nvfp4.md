# timbuksu/Ling-3.2-Air-NVFP4

## Resumen

Ling-3.2-Air-NVFP4 es una cuantización calibrada del modelo inclusionAI/Ling-3.2-Air, un transformer de tipo Mixture-of-Experts con capacidades multimodales (visión y texto) desarrollado originalmente por inclusionAI. Esta versión, publicada por el usuario timbuksu, aplica cuantización mixta ModelOpt combinando NVFP4 para los expertos enrutados y MXFP8 para las proyecciones densas y de atención, reduciendo el tamaño en disco de 120,39 GiB (FP8 block-128 original) a 70,12 GiB.

El modelo está específicamente preparado para servir en una única GPU NVIDIA Blackwell de 96 GiB (arquitectura SM120) mediante el runtime Flare de NVIDIA, e incluye soporte para decodificación especulativa mediante un predictor MTP (Multi-Token Prediction) en la capa 42. Con 127.920.654.544 parámetros totales y 512 expertos por capa en las capas 2 a 41, es un modelo de gran escala orientado a generación de texto conversacional, razonamiento y tool calling.

Su relevancia radica en que permite desplegar un modelo MoE de ~128B parámetros en hardware consumer/prosumer Blackwell de gama alta (96 GiB) con una degradación de calidad mínima verificada: divergencia KL de 0,05782 y acuerdo top-1 del 95,21 % frente a la referencia FP8 original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (bailing_moe_v3_vl) con atención MLA y capas KDA; incluye predictor MTP en capa 42 |
| Parametros totales | 127.920.654.544 |
| Parametros activos | no disponible (512 expertos enrutados por capa, capas 2-41) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (group_size=16) en expertos enrutados; MXFP8 (group_size=32, F8_E4M3 + F8_E8M0) en KDA, MLA, MLP densas y expertos compartidos; BF16 en kv_b_proj, g_proj, embeddings, lm_head, routers, norms y pesos de visión; FP32 en algunos tensores preservados |
| Idiomas soportados | no disponible (la calibración incluye inglés y chino técnico) |
| Licencia | MIT |
| Formato de pesos | safetensors (19 shards, 75.290.852.960 bytes) |

## Arquitectura y entrenamiento

El modelo base Ling-3.2-Air emplea una arquitectura MoE con 512 expertos enrutados por capa en las capas 2 a 41, combinando mecanismos de atención MLA (Multi-head Latent Attention) en 8 capas y capas KDA (Kernelized Differential Attention) con proyecciones q/k/v/f/g/o. Incluye además expertos compartidos en las capas 2 a 42 y un predictor MTP (Multi-Token Prediction) en la capa 42 que habilita decodificación especulativa. La componente visual (vision tensors) se preserva en BF16 desde el checkpoint original.

Esta variante cuantizada fue calibrada sobre 196.608 tokens (384 secuencias de 512 tokens) que abarcan código, matemáticas, razonamiento, XML de tool-calling, prosa en inglés y texto técnico en chino. La cuantización de expertos enrutados emplea GPTQ con Cholesky por bloques de 16 (19.376 de 20.992 expertos) y un fallback MSE ponderado por activaciones (1.616 expertos), con técnica Four-Over-Six (1,5× headroom) y escalas compartidas entre gate_proj y up_proj. Los detalles sobre el entrenamiento original (número de tokens, composición del dataset, RLHF/DPO) no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con modo thinking explícito (``), desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`.
- Tool calling / function calling, con parser dedicado `ling3` en vLLM y soporte de `--enable-auto-tool-choice`.
- Razonamiento multi-paso y agentes, con parser de razonamiento `ling3`.
- Capacidades multimodales de visión (se preservan los tensores de visión del modelo original en BF16).
- Decodificación especulativa mediante predictor MTP (hasta 7 draft tokens en configuración Flare, 3 en vLLM).
- Capacidades multilingües: no disponibles de forma explícita, aunque la calibración cubre inglés y chino.
- Soporte de prefix caching y modo de caché Mamba alineado (`--mamba-cache-mode align`).

## Casos de uso

- Asistente conversacional de alta concurrencia: el modelo está validado con concurrencia 16 en Flare y decodificación especulativa MTP, lo que permite servir múltiples sesiones simultáneas en una sola GPU Blackwell de 96 GiB.
- Automatización de agentes con tool calling: el parser `ling3` y el soporte de `--enable-auto-tool-choice` en vLLM permiten integrarlo en pipelines de agentes que invocan APIs externas, bases de datos o funciones personalizadas.
- Razonamiento con trazas explícitas: el modo thinking permite auditar el proceso de razonamiento en tareas de análisis, depuración o verificación, y desactivarlo para reducir latencia en producción.
- Generación y revisión de código: la calibración incluye datos de código y la arquitectura soporta contexto conversacional largo, adecuado para asistentes de programación integrados en IDE o CI/CD.
- Procesamiento de documentos con componente visual: al preservar los tensores de visión, puede emplearse en tareas de comprensión de imágenes o documentos escaneados combinadas con texto.
- Despliegue en infraestructura Blackwell de gama alta: pensado para entornos con una única GPU GB202 de 96 GiB, reduciendo costes frente a despliegues multi-GPU del checkpoint FP8 original.
- Investigación en cuantización: sirve como referencia reproducible de cuantización mixta NVFP4+MXFP8 con métricas de fidelidad publicadas (KL, top-1, top-5, perplejidad).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sí se publican métricas de fidelidad de la cuantización frente a la referencia FP8 original:

| Ámbito | KL vs. FP8 upstream | Acuerdo top-1 | Acuerdo top-5 | Perplejidad (cuant. vs. ref.) |
|---|---:|---:|---:|---:|
| Modelo objetivo de 42 capas | 0,05782 | 95,21 % | 99,56 % | 2,934 vs. 2,864 (1,0245×) |
| Predictor MTP capa 42 | 0,06165 | 93,77 % | 99,66 % | no disponible |

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 70,12 GiB en disco; el despliegue está validado en una GPU de 96 GiB con `--gpu-memory-utilization 0.90` en vLLM.
- GPU recomendadas: NVIDIA Blackwell SM120 (GB202) de 96 GiB. No hay datos de funcionamiento en A100, H100 ni RTX 4090; el formato NVFP4 y las instrucciones SM120 son específicos de Blackwell.
- No cabe en GPUs consumer convencionales (RTX 4090 de 24 GiB, etc.) según los requisitos documentados.
- Opciones de despliegue: Flare (recomendado, con paquete pre-exportado `timbuksu/Ling-3.2-Air-NVFP4-FLARE`) y vLLM mediante `inclusionAI/vllm-ling-v3` con soporte de ModelOpt mixed-precision NVFP4 + MXFP8.
- Latencia y throughput: no disponibles. La configuración Flare emplea W4A16 en decode y W4A4 en prefill con escalas CSF, decodificación especulativa MTP y bloqueo de relojes de GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Ling-3.2-Air-NVFP4 (este) | 127,9B | no disponible | NVFP4 + MXFP8 + BF16 | MIT | 1× GPU Blackwell 96 GiB |
| inclusionAI/Ling-3.2-Air (FP8) | 127,9B | no disponible | FP8 block-128 | MIT | Multi-GPU (120,39 GiB en disco) |
| inclusionAI/Ling-3.2-Air (BF16 original) | no disponible | no disponible | BF16 | MIT | no disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento en tareas con modelos de otras familias.

## Limitaciones y advertencias

- Requiere hardware muy específico: GPU NVIDIA Blackwell SM120 de 96 GiB; no es desplegable en GPUs anteriores ni consumer estándar.
- La carga en vLLM exige una build de `vllm-ling-v3` con soporte de ModelOpt mixed-precision NVFP4 + MXFP8 con expertos apilados; sin ese soporte, el checkpoint no carga directamente.
- La cuantización introduce degradación medible: perplejidad 1,0245× superior a la referencia FP8 y acuerdo top-1 del 95,21 %; puede afectar a tareas sensibles a la precisión numérica.
- Riesgo de alucinación inherente a modelos de lenguaje de gran escala; no se documentan evaluaciones específicas de factualidad.
- Sesgos conocidos: no documentados en la información disponible; la calibración se limita a inglés y chino técnico, por lo que el comportamiento en castellano no está validado.
- Longitud de contexto no especificada; conviene verificar los límites reales del modelo base antes de desplegar en producción.
- Licencia MIT permite uso comercial, pero el modelo base y el runtime Flare pueden tener condiciones adicionales que deben revisarse.
- El repositorio tiene muy pocas descargas (23) y ningún like, lo que sugiere validación comunitaria limitada.

## Enlaces

- [Hugging Face: timbuksu/Ling-3.2-Air-NVFP4](https://huggingface.co/timbuksu/Ling-3.2-Air-NVFP4)
- [Paquete Flare pre-exportado: timbuksu/Ling-3.2-Air-NVFP4-FLARE](https://huggingface.co/timbuksu/Ling-3.2-Air-NVFP4-FLARE)
- [Modelo base: inclusionAI/Ling-3.2-Air](https://huggingface.co/inclusionAI/Ling-3.2-Air)
- [Runtime Flare de NVIDIA](https://github.com/NVIDIA/flare-local-inference)
- [Fork de vLLM para Ling: inclusionAI/vllm-ling-v3](https://github.com/inclusionAI/vllm-ling-v3)
