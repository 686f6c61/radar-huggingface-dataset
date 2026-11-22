# SupraLabs/Supra2.6-Pico

## Resumen

Supra2.6-Pico es un modelo de lenguaje de tipo base (no instruido) desarrollado por SupraLabs, con 2.972.496 parámetros únicos y una ventana de contexto de 1.024 tokens. Se trata de un experimento de arquitectura híbrida a muy pequeña escala: combina seis capas de recurrencia lineal Gated Delta Net de segunda generación (GDN-2) con dos capas de atención global con Grouped-Query Attention (GQA) y puerta sigmoide, distribuidas en dos grupos idénticos de cuatro bloques. El modelo se entrena desde cero y se publica como referencia reproducible de recetas de entrenamiento para modelos por debajo de los 3 millones de parámetros.

La relevancia del modelo es fundamentalmente metodológica, no funcional. Documenta con detalle una receta completa (9.998.172.160 tokens, optimizador Muon para matrices 2-D y AdamW para embeddings y normas, precisión bf16 con pesos maestros fp32, una sola GPU RTX Pro 6000 Blackwell) y una mezcla de datos explícita con once fuentes, incluyendo ClimbMix, Cosmopedia v2, Ultra-FineWeb, TXT360-v2 y varios corpus matemáticos. También incorpora innovaciones poco habituales a este tamaño, como attention residuals con mezcla softmax aprendida sobre las salidas de todas las capas precedentes.

Conviene subrayar que el propio autor advierte de que, a esta escala, el modelo no es utilizable como asistente general, chatbot ni en tareas de producción. Su interés está en la comparación de arquitecturas híbridas (recurrencia lineal frente a atención global) en el régimen de los millones de parámetros y en servir de base para experimentos controlados de scaling y de mezcla de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 8 capas con patrón `[GDN-2, GDN-2, GDN-2, gated GQA] × 2`; GDN-2 con recurrencia erase/write por canal y log-decay por canal; GQA con 3 cabezas query / 1 cabeza KV (head_dim 48), RoPE en 24 dimensiones, RMSNorm en q/k y puerta de salida sigmoide; attention residuals con softmax aprendida sobre salidas de capas previas |
| Parametros totales | 2.972.496 únicos (3.562.320 almacenados en `model.pt` por el embedding atado al LM head, contado dos veces en disco); 2.382.672 no pertenecientes al embedding |
| Parametros activos | No aplica (no es MoE; todas las capas se activan en cada token) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | No disponible (solo se publican pesos fp32; no se documentan variantes GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.pt` (11,9 MB, fp32, incluye ambas entradas atadas) y `model.safetensors` (155 tensores, 2.972.496 parámetros, LM head atado almacenado una sola vez) |

## Arquitectura y entrenamiento

El modelo se organiza en ocho bloques agrupados en dos secuencias idénticas de cuatro: tres bloques GDN-2 seguidos de un bloque de atención global con GQA. La recurrencia GDN-2 sigue la formulación `S_t = (I − k_t (b_t ⊙ k_t)ᵀ) Diag(exp(g_t)) S_{t−1} + k_t (w_t ⊙ v_t)ᵀ`, con tres cabezas por capa, kernel de convolución 4 y mecanismo de borrado/escritura por canal con decaimiento logarítmico también por canal, implementado mediante el kernel chunked `fla`. Las dos capas de atención global usan 3 cabezas query y 1 cabeza KV con head_dim 48, RoPE aplicado sobre 24 dimensiones, RMSNorm en q y k, y una puerta sigmoide a la salida. Además, cada capa mezcla las salidas de todas las capas anteriores mediante una softmax aprendida con una query por capa (attention residuals). El modelo usa pre-RMSNorm, FFN SwiGLU con dimensión oculta 352, `d_model` de 144 y vocabulario BPE de 4.096 tokens entrenado sobre la propia mezcla, con embeddings de entrada y salida atados.

El entrenamiento consumió 9.998.172.160 tokens en 38.140 pasos de 262.144 tokens (batch 256 × contexto 1.024), con cada fuente muestreada como máximo una época. Se usó Muon para las matrices 2-D (lr 0,02, momento 0,95, 5 pasos de Newton–Schulz) y AdamW para embeddings y normas (lr 6e-3, β 0,9/0,95), warmup lineal de 10.000 pasos, clipping de gradiente 1,0, autocast bf16 con pesos maestros fp32 y semilla 0. Todo el entrenamiento se ejecutó en una única RTX Pro 6000 Blackwell con 20 vCPU sobre PyTorch 2.x, `fla-core` 0.6.0 y `tokenizers`. La mezcla de datos fue: ClimbMix 36,3 % (3,63B tokens), Cosmopedia v2 19,5 % (1,95B), Ultra-FineWeb L2 HQ 19,5 % (1,95B), TXT360-v2 web-high-medium 13,6 % (1,36B), open-web-math 5,1 % (0,51B), OpenMathInstruct-2 4,8 % (0,48B), NuminaMath-CoT 0,53 %, TinyStories 0,48 %, OpenStax 0,10 %, orca-math-word-problems 0,10 % y GSM8K 0,004 %.

## Capacidades

- Generación y completado de texto en inglés a nivel de n-gramas y frases cortas; el modelo es de tipo base, sin ajuste por instrucciones.
- Razonamiento matemático elemental muy limitado, favorecido por la presencia de corpus matemáticos en la mezcla (open-web-math, OpenMathInstruct-2, NuminaMath-CoT).
- Modelado de secuencias cortas con contexto de 1.024 tokens, suficiente para párrafos o documentos breves.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- Multilingüismo: únicamente inglés; no se documenta cobertura de otros idiomas.
- No dispone de modo thinking, visión ni audio.
- Inferencia posible en CPU pura mediante `model_h_local.py` y `gdn2_ref.py`, y en GPU con el kernel Triton `fla` a través de `model_h.py`.

## Casos de uso

- Investigación en arquitecturas híbridas: permite comparar el rendimiento de una mezcla 6:2 de recurrencia lineal GDN-2 y atención global frente a un transformer puro del mismo tamaño, en un régimen de menos de 3 millones de parámetros y con receta reproducible.
- Estudio de attention residuals: al incorporar mezcla softmax aprendida sobre todas las capas previas, sirve para analizar si esta técnica aporta ganancias medibles a escalas mínimas.
- Validación de recetas de entrenamiento: la combinación Muon + AdamW, el schedule de learning rate y la mezcla de once fuentes documentada paso a paso permiten replicar el experimento y aislar el efecto de cada decisión.
- Experimentos de scaling controlados: con 9.998.172.160 tokens y una sola GPU, es una unidad de cómputo asequible para estudiar curvas de pérdida y leyes de escalado a muy baja escala.
- Pruebas de tokenizadores: el vocabulario BPE de 4.096 tokens entrenado sobre la mezcla permite evaluar el impacto del tamaño de vocabulario en modelos sub-3M.
- Docencia y divulgación: el modelo cabe en 11,9 MB y se ejecuta en CPU, lo que facilita demostraciones de entrenamiento desde cero y de inferencia de modelos de lenguaje en entornos con recursos mínimos.
- Referencia para pipelines de evaluación: la definición del índice compuesto (HellaSwag, ARC, PIQA y Arithmark-3) puede reutilizarse como plantilla de evaluación para modelos de escala similar.

## Benchmarks y rendimiento

Evaluación con conjuntos completos y puntuación por log-verosimilitud con normalización de longitud (`acc_norm`):

| Benchmark | Puntuación (`acc_norm`) | Ítems |
|---|---|---|
| HellaSwag | 26,40 | 10.042 |
| ARC-Easy | 33,54 | 2.376 |
| ARC-Challenge | 23,21 | 1.172 |
| PIQA | 56,09 | 1.838 |
| Arithmark-3 | 38,10 | 1.000 |
| Índice compuesto | 8,192 | — |

El índice se define como `( N(HellaSwag, 25) + N(media ARC, 25) + N(PIQA, 50) + 0,65 · N(Arithmark-3, 25) ) / 3,65`, con `N(v, c) = 100 · (v − c) / (100 − c)`. Para el mismo checkpoint, los valores de `acc` sin normalizar son: HellaSwag 26,49, ARC-Easy 33,50, ARC-Challenge 17,92, PIQA 56,91 y Arithmark-3 38,10.

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 50 MB en fp32 (11,9 MB de pesos más estados de activación y caché de recurrencia para 1.024 tokens); en la práctica, cualquier GPU con más de 1 GB de memoria es suficiente.
- GPU recomendadas: ninguna en particular; el modelo se entrenó en una RTX Pro 6000 Blackwell, pero para inferencia basta con una GPU integrada o una GTX 1050 o superior.
- Cabe en cualquier GPU de consumo, incluidas las más antiguas, y también en CPU sin GPU.
- Opciones de despliegue: código propio con PyTorch (`model_h.py` con kernel Triton `fla` para GPU, `model_h_local.py` + `gdn2_ref.py` para CPU). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no publicarse pesos en GGUF no es directamente compatible con dichos motores sin conversión.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño (2,97M parámetros y contexto de 1.024 tokens), se espera una latencia de milisegundos por secuencia en CPU moderna, aunque no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Supra2.6-Pico | 2.972.496 | 1.024 | Híbrida GDN-2 + GQA | Apache 2.0 | Hugging Face (`model.pt`, `model.safetensors`) |
| Alternativas sub-3M comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables de la misma categoría (sub-3M, híbridos de recurrencia lineal y atención) en la documentación proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- El propio autor indica explícitamente que, a esta escala, el modelo no es utilizable como asistente general, chatbot ni para ninguna tarea de producción.
- Es un modelo base sin ajuste por instrucciones: no sigue instrucciones ni mantiene diálogos coherentes.
- Riesgo elevado de alucinación y de generar texto gramaticalmente plausible pero sin contenido factual fiable.
- Contexto limitado a 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Solo soporta inglés; no se documenta ningún otro idioma.
- Sesgos desconocidos: la model card no incluye análisis de sesgos ni evaluaciones de seguridad; la mezcla incluye corpus web sin filtrar más allá de los conjuntos de alta calidad indicados.
- Licencia Apache 2.0, que permite uso comercial, pero las limitaciones técnicas hacen inviable cualquier aplicación productiva real.
- El autor menciona "problemas accidentales de benchmaxing" en la versión 2.5 Pico, lo que aconseja tratar con cautela las métricas publicadas y verificar la evaluación de forma independiente.
- El repositorio tiene un tamaño de 0,0 GB según Hugging Face, coherente con los 11,9 MB del archivo de pesos, pero conviene verificar la integridad de los ficheros antes de su uso.
- No se publican pesos cuantizados, por lo que el despliegue en motores de inferencia optimizados requiere conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SupraLabs/Supra2.6-Pico
- Dataset ClimbMix: https://huggingface.co/datasets/karpathy/climbmix-400b-shuffle
- Dataset Cosmopedia v2 (smollm-corpus): https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset Ultra-FineWeb: https://huggingface.co/datasets/openbmb/Ultra-FineWeb
- Dataset TXT360-v2: https://huggingface.co/datasets/IFM/TxT360-v2
- Dataset open-web-math: https://huggingface.co/datasets/open-web-math/open-web-math
- Dataset OpenMathInstruct-2: https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
- Dataset NuminaMath-CoT: https://huggingface.co/datasets/project-numina/NuminaMath-CoT
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Dataset OpenStax: https://huggingface.co/datasets/crumb/openstax-text
- Dataset orca-math-word-problems: https://huggingface.co/datasets/microsoft/orca-math-word-problems-200k
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
