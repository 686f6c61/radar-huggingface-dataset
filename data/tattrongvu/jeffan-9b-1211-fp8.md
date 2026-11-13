# tattrongvu/Jeffan-9B-1211-FP8

## Resumen

Jeffan-9B-1211-FP8 es la versión cuantizada en FP8 del modelo Jeffan-9B-1211, desarrollado por el usuario tattrongvu y construido a su vez sobre Qwen/Qwen3.5-9B. No es un modelo generativo al uso: funciona como un motor de decisión que recibe un estado y una pregunta de opción múltiple y devuelve, en un único forward pass, una probabilidad para cada opción, sin generar texto. El modelo está orientado a tareas de clasificación y toma de decisiones estructuradas (decision-making, multiple-choice).

La contribución de esta variante es la cuantización W8A8 en FP8 (formato E4M3) aplicada con NVIDIA Model Optimizer 0.48.0, que reduce el peso de los pesos de 16,7 GiB a 10,3 GiB y multiplica por 1,55 el throughput sobre una RTX PRO 6000 Blackwell, manteniendo según el autor una pérdida no medible en la suite pública del Jev Decision Index 0.3.

El modelo cuenta con 8.953.803.264 parámetros y está pensado exclusivamente para servirse con vLLM sobre GPUs con tensor cores FP8 (Ada, Hopper o Blackwell). Su licencia Apache 2.0 y su enfoque de inferencia en una sola pasada lo hacen relevante para pipelines de decisión automática de baja latencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5-9B, con capas de atención completa y Gated DeltaNet (arquitectura híbrida) |
| Parámetros totales | 8.953.803.264 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (según `max_model_len` en el ejemplo de inferencia) |
| Tipos de cuantización | FP8 W8A8 (E4M3), esquema `FP8_PER_CHANNEL_PER_TOKEN`; pesos con una escala por canal de salida, activaciones cuantizadas por token en tiempo de ejecución |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato FP8 de ModelOpt; requiere vLLM (transformers no lo ejecuta) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-9B, un transformer híbrido que combina capas de atención completa con capas Gated DeltaNet (atención lineal con estado recurrente). El autor cuantiza las 200 proyecciones del decoder: las proyecciones de atención `q/k/v/o_proj`, las de Gated DeltaNet `in_proj_qkv`, `in_proj_z` y `out_proj`, y las del MLP `gate/up/down_proj`. Se mantienen en BF16 el `lm_head` (del que se leen las probabilidades de las respuestas), los embeddings, `in_proj_a/b`, `conv1d` y las normalizaciones.

La cuantización se realizó con NVIDIA Model Optimizer 0.48.0. No se dispone de información sobre el dataset de entrenamiento del modelo base (número de tokens, composición, uso de RLHF/DPO) en la documentación proporcionada. Una particularidad técnica relevante es que las capas de atención completa deben leer todo el prompt en ambas direcciones (`is_causal: false`), por lo que cada prompt se prellena completo, sin prefix caching ni chunked prefill. En vLLM el modelo ejecuta una sola pasada del bucle de capas, mientras que el resultado publicado del modelo base (70,55) se obtiene con dos pasadas mediante su propio motor de Decision Index en transformers.

## Capacidades

- Clasificación y toma de decisiones estructurada: recibe un estado y una pregunta de opción múltiple y devuelve una probabilidad por opción en un único forward pass, sin generación autoregresiva.
- Evaluación de opciones múltiples con lectura directa de logits del `lm_head`.
- Razonamiento sobre estados y contextos largos (hasta 32.768 tokens) en formato de prompt completo bidireccional.
- Áreas cubiertas según la suite Jev Decision Index 0.3: Knowledge, Language, Retrieval, Tools y Arts.
- No soporta generación de texto libre, tool calling generativo ni razonamiento multi-step en el sentido habitual; su salida es una distribución de probabilidad sobre opciones.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Enrutamiento de decisiones automáticas: dado un estado del sistema y un conjunto de opciones (por ejemplo, acciones a tomar), el modelo devuelve la probabilidad de cada una en una sola pasada, lo que permite umbrales de confianza y lógica de escalado.
- Clasificación de tickets o consultas en opción múltiple: se presenta el texto y las categorías candidatas y se lee la opción más probable, aprovechando el contexto de 32.768 tokens para casos con historial largo.
- Evaluación de respuestas en pipelines de QA: el modelo puntúa opciones candidatas (incluida la categoría Tools del índice) para seleccionar la respuesta más probable sin generar texto.
- Selección de herramientas en agentes: la dimensión Tools del índice (87,77 en la suite) sugiere su uso para decidir qué herramienta invocar entre un conjunto cerrado de opciones.
- Sistemas de decisión de baja latencia: con 25 ms de latencia mediana por petición individual y 24,3 peticiones/s en una RTX PRO 6000 Blackwell, es apto para servicios interactivos que requieren decisiones en milisegundos.
- Filtrado y moderación por categorías: clasificación de contenido en un conjunto predefinido de etiquetas leyendo directamente las probabilidades por opción.
- Evaluación comparativa de modelos de decisión: al mantener la suite pública del Jev Decision Index 0.3 con una pérdida de solo −0,08 puntos frente al modelo base en la misma ruta de vLLM, sirve como referencia cuantizada en experimentos de evaluación.

## Benchmarks y rendimiento

Resultados de la suite pública completa del Jev Decision Index 0.3 (140.620 peticiones puntuadas):

| Modelo | Pasadas del bucle | Índice público | Cambio | Raw | Knowledge | Language | Retrieval | Tools | Arts |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Jeffan-9B-1211 publicado (motor Decision Index) | 2 | 70,55 | — | 77,58 | 56,82 | 72,70 | 74,29 | 88,61 | 59,95 |
| Jeffan-9B-1211 en vLLM (RTX PRO 6000) | 1 | 67,27 | −4,65% | 75,47 | 51,90 | 70,13 | 68,81 | 87,39 | 59,76 |
| Jeffan-9B-1211-FP8 en vLLM (RTX PRO 6000) | 1 | 67,19 | −4,76% | 75,42 | 51,60 | 69,92 | 68,67 | 87,77 | 59,86 |

La cuantización por sí sola (FP8 frente a Jeffan-9B-1211 en la misma ruta de vLLM) cambia el índice público en −0,08 puntos (intervalo del 95%: −0,27 a +0,19, bootstrap pareado de 200 remuestreos). Ningún área se mueve más de 0,4 puntos.

Rendimiento en una RTX PRO 6000 Blackwell (vLLM, mezcla de 300 peticiones de decisión en bucle cerrado):

| Métrica | Jeffan-9B-1211 (BF16) | Jeffan-9B-1211-FP8 |
|---|---:|---:|
| Peticiones/s en pico | 15,7 | 24,3 |
| Latencia mediana, una petición a la vez | 31 ms | 25 ms |
| Pesos en GPU | 16,7 GiB | 10,3 GiB |

## Requisitos de hardware

- VRAM estimada: 10,3 GiB de pesos en FP8; con overhead de KV cache y activaciones se recomienda al menos 16-24 GiB para contexto largo.
- GPUs recomendadas: NVIDIA RTX PRO 6000 Blackwell (única medida por el autor), además de GPUs con tensor cores FP8 (Ada, Hopper o Blackwell, como L40S, H100 o B200).
- En GPUs consumer: cabe en tarjetas con soporte FP8 y suficiente VRAM (por ejemplo, RTX 4090 de 24 GiB), aunque no se han publicado medidas en ellas.
- Despliegue: exclusivamente vLLM (versión main en commit `2e9a6ad8` o posterior), con `is_causal: false` en `hf_overrides`, `--max-cudagraph-capture-size 2048` y backend de atención TRITON_ATTN en la configuración medida. No funciona con transformers.
- Latencia y throughput: 25 ms de latencia mediana por petición y 24,3 peticiones/s en pico sobre RTX PRO 6000 Blackwell; sin CUDA graphs, el modelo FP8 es más lento que BF16 a una petición por vez (34 ms).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Índice público (Jev 0.3) | Licencia | Formato |
|---|---:|---:|---:|---|---|
| Jeffan-9B-1211-FP8 | 8,95 B | 32.768 | 67,19 (vLLM, 1 pasada) | Apache 2.0 | safetensors FP8 (ModelOpt) |
| Jeffan-9B-1211 (BF16) | 8,95 B | 32.768 | 70,55 (motor propio, 2 pasadas) / 67,27 (vLLM, 1 pasada) | Apache 2.0 | safetensors BF16 |
| Jeffan-9B-1211-NVFP4 | no disponible | no disponible | −1,95 puntos frente al base según el autor | Apache 2.0 | NVFP4 |

No se dispone de comparación con otros modelos de decisión de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Requiere GPU con tensor cores FP8; no se ejecuta en hardware sin soporte FP8 ni con transformers.
- El resultado en vLLM con una sola pasada del bucle de capas pierde 3,28 puntos frente al resultado publicado con dos pasadas; el índice de 67,19 no es un resultado oficial de leaderboard.
- La atención bidireccional obliga a prellenar el prompt completo: sin prefix caching ni chunked prefill, lo que penaliza cargas con prompts muy largos y repetidos.
- Sin `--max-cudagraph-capture-size 2048`, el modelo FP8 es más lento que BF16 a una petición por vez.
- No genera texto libre ni soporta tool calling generativo; su uso está restringido a clasificación y decisión sobre opciones.
- No hay información sobre sesgos, riesgo de alucinación en el sentido generativo, ni cobertura de idiomas.
- Solo se ha medido en una RTX PRO 6000 Blackwell Server Edition (96 GB); el rendimiento en otras GPUs es desconocido.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y su procedencia (Qwen3.5-9B) deben verificarse para cumplimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tattrongvu/Jeffan-9B-1211-FP8
- Modelo base: https://huggingface.co/tattrongvu/Jeffan-9B-1211
- Variante NVFP4: https://huggingface.co/tattrongvu/Jeffan-9B-1211-NVFP4
- Modelo original Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Índice de wheels de vLLM usado: https://wheels.vllm.ai/2e9a6ad8100cf648d1c87c03f723dfe34fe5d12a
