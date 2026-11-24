# tahamajs/qwen-2.5-0.5b-compressed-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-compressed-attention-wikitext2` es un checkpoint experimental de Qwen2.5-0.5B en el que se ha sustituido quirúrgicamente el mecanismo de atención estándar por un operador de atención comprimida basado en descomposición en valores singulares (SVD truncada), seguido de un proceso de destilación de conocimiento en dos etapas sobre WikiText-2. Lo publica el autor independiente `tahamajs` dentro del proyecto NeuralOps, una librería de "cirugía de atención" que permite intercambiar operadores de atención en transformers preentrenados.

El modelo parte de los 494M parámetros de Qwen2.5-0.5B (24 capas, dimensión oculta 896, 14 cabezas de consulta y 2 de clave/valor con GQA, RoPE con theta 1.000.000) y reemplaza 18 de las 24 capas de atención (75%) por `CompressedAttentionLayer`, conservando 6 capas nativas GQA como anclas de recuperación contextual (topología híbrida 3:1). El resultado es un modelo de 501,8M parámetros totales que mantiene soporte causal autoregresivo y decodificación estándar, pero con atención subcuadrática en la mayoría de capas.

Su relevancia es fundamentalmente metodológica: demuestra que es posible transplantar un operador de atención alternativo en un modelo pequeño y recuperar prácticamente toda la calidad mediante destilación, pasando de una perplejidad de 340.984,77 en zero-shot tras la cirugía a 95,76 tras la destilación, frente a los 15,38 del profesor original. No es un modelo pensado para producción conversacional, sino una pieza de investigación sobre eficiencia atencional y compresión de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atención híbrida: 18/24 capas `CompressedAttentionLayer` (SVD truncada) y 6/24 capas GQA softmax nativas |
| Parametros totales | 501.827.200 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-0.5B soporta 32.768 tokens, pero la model card no lo confirma para este checkpoint) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 completo, 957,20 MB, más un adaptador) |
| Idiomas soportados | inglés (etiqueta `en` en la model card); multilingüe heredado del base no verificado |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16 completo + adaptador) |

## Arquitectura y entrenamiento

La arquitectura es un decoder-only de Qwen2.5-0.5B con 24 bloques. La modificación consiste en sustituir la atención GQA softmax por `CompressedAttentionLayer`, un operador que aplica SVD truncada para comprimir las proyecciones de atención, manteniendo soporte causal, manejo de GQA y RoPE. Las capas transplantadas son los índices [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22]; las capas [3, 7, 11, 15, 19, 23] conservan la atención GQA original como anclas. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansión de cabezas KV de 2 a 14 y una única proyección de salida, evitando el colapso de proyecciones no inicializadas. El despacho de kernels es de tres niveles: CUDA, Triton y PyTorch.

El entrenamiento consistió en destilación de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), con longitud de secuencia 512, batch 8 y acumulación de gradiente 4, ejecutada en una RTX 3090 de 24 GB con caché offline de representaciones del profesor (0 MB de VRAM del profesor en GPU). La etapa 1 (30% del presupuesto, 76 pasos) congela el backbone y entrena solo módulos de atención y layer norms con AdamW (lr 2.0e-4, weight decay 0.01, clipping 1.0), minimizando MSE por capa más 0.25·(1 − coseno) entre estados ocultos del estudiante y del profesor. La etapa 2 (70% del presupuesto) realiza destilación end-to-end de representaciones. La perplejidad zero-shot tras la cirugía fue de 340.984,77, que bajó a 95,76 tras la destilación, una reducción relativa del 99,97%.

## Capacidades

- Generación de texto causal autoregresiva en inglés, con soporte de decodificación estándar (greedy, sampling, beam).
- Razonamiento básico y conversación de baja complejidad, limitados por el tamaño de 0,5B y por el dominio de entrenamiento (WikiText-2, texto enciclopédico).
- Atención causal con RoPE y GQA en las capas ancla, lo que preserva el enrutamiento contextual global en 6 de 24 capas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: solo inglés declarado; el multilingüismo del base Qwen2.5 no está verificado tras la cirugía.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación sobre atención eficiente: el checkpoint sirve como referencia reproducible para medir el impacto de sustituir atención softmax por atención comprimida por SVD en un modelo pequeño, con telemetría de perplejidad antes y después de la destilación.
- Experimentos de destilación de conocimiento: la topología híbrida 3:1 y el protocolo en dos etapas (alineamiento de subespacio con backbone congelado y destilación end-to-end) son un caso de estudio para quienes investigan recuperación de calidad tras cirugía de modelos.
- Benchmarking de operadores NeuralOps: permite comparar `compressed_attention` frente a atención nativa en tareas de modelado de lenguaje causal con WikiText-2 como referencia.
- Pruebas de despliegue de atención subcuadrática: útil para validar kernels CUDA/Triton en un modelo de 0,5B antes de escalar a modelos mayores.
- Evaluación de robustez post-cirugía: sirve para estudiar cómo se degrada la perplejidad al aumentar la proporción de capas transplantadas (por ejemplo, comparando 3:1 con otras ratios).
- Prototipado educativo: modelo pequeño (957 MB en FP16) que cabe en GPUs de consumo y permite reproducir el pipeline de cirugía y destilación en una sola RTX 3090.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente, `verified: false`), medidos en el split de validación de WikiText-2 (`wikitext-2-raw-v1`) con longitud de secuencia 512.

| Metrica | Valor | Notas |
|---|---:|---|
| Perplejidad del profesor (`Qwen/Qwen2.5-0.5B`) | 15,38 | Referencia GQA softmax causal exacta |
| Perplejidad zero-shot del estudiante (pre-destilación) | 340.984,77 | Inmediatamente tras el transplante de 18/24 capas |
| Perplejidad del estudiante tras destilación (post-KD) | 95,76 | Tras destilación de representaciones en 2 etapas |
| Delta absoluto de perplejidad | −340.889,02 | Cambio logrado por la destilación |
| Reducción relativa de perplejidad | 99,97% | Recuperación desde el pico post-cirugía |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB en FP16 (pesos de 957,20 MB más caché KV y overhead del runtime); en cuantización de 8 bits rondaría 1 GB y en 4 bits unos 0,6 GB, aunque no se publican pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; el autor entrenó la destilación en una NVIDIA GeForce RTX 3090 de 24 GB.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: el modelo usa la librería `neuralops`, por lo que requiere ese runtime o la conversión de pesos a un formato estándar; no se confirma compatibilidad directa con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-compressed-attention-wikitext2` | 501,8M | no disponible | 95,76 (post-KD, autor) | MIT | Hugging Face, 412 descargas |
| `Qwen/Qwen2.5-0.5B` (profesor) | 494M | 32.768 tokens | 15,38 (referencia del autor) | Apache 2.0 | Hugging Face, ampliamente usado |
| `Qwen/Qwen2.5-1.5B` | 1,5B | 32.768 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| `meta-llama/Llama-3.2-1B` | 1,2B | 128.000 tokens | no disponible en esta ficha | Llama 3.2 Community License | Hugging Face |

La comparación directa es limitada: el checkpoint de NeuralOps no busca igualar al profesor en calidad, sino demostrar la viabilidad de la cirugía de atención con recuperación por destilación. Frente al Qwen2.5-0.5B original, la perplejidad es unas 6,2 veces mayor, a cambio de un operador de atención subcuadrática en el 75% de las capas.

## Limitaciones y advertencias

- Calidad degradada: la perplejidad post-KD (95,76) es 6,2 veces la del profesor (15,38); no es adecuado para tareas que requieran precisión cercana al modelo base.
- Dominio restringido: la destilación se hizo exclusivamente sobre WikiText-2 (texto enciclopédico en inglés), por lo que el rendimiento fuera de ese dominio no está caracterizado.
- Riesgo de alucinación elevado: un modelo de 0,5B con perplejidad alta y entrenamiento limitado a un corpus enciclopédico tiende a generar contenido plausible pero incorrecto.
- Idiomas: solo se declara inglés; el multilingüismo del base Qwen2.5 puede haberse degradado tras la cirugía y la destilación.
- Contexto: la model card no confirma la longitud de contexto efectiva tras el transplante; asumir los 32.768 tokens del base es una extrapolación no verificada.
- Dependencia de runtime: requiere la librería `neuralops` para cargar el modelo; la compatibilidad con ecosistemas estándar (vLLM, llama.cpp, Ollama, TGI) no está documentada.
- Benchmarks no verificados: los resultados de perplejidad están marcados como `verified: false` y proceden únicamente del autor.
- Licencia MIT: permite uso comercial, pero el modelo base Qwen2.5-0.5B es Apache 2.0 y conviene revisar las obligaciones de atribución del modelo derivado.
- Madurez: 412 descargas y 2 likes en el momento de la consulta; sin validación independiente por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-compressed-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de `CompressedAttentionLayer`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/svd/compressed_attention.py
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
