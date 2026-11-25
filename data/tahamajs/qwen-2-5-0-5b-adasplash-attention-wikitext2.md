# tahamajs/qwen-2.5-0.5b-adasplash-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-adasplash-attention-wikitext2` es un checkpoint experimental de investigación derivado de `Qwen/Qwen2.5-0.5B`, publicado por el autor tahamajs dentro del proyecto NeuralOps Attention Surgery Zoo. El modelo aplica una "cirugía de atención": sustituye 18 de las 24 capas de atención del transformer original por el operador `AdaSplashAttention` (atención subcuadrática con α-Entmax y radio local de splash), manteniendo 6 capas con la atención GQA softmax nativa de Qwen2 como anclas de enrutamiento global. Tras el trasplante, el autor aplica una destilación de conocimiento en dos etapas sobre WikiText-2 para recuperar la calidad del modelo.

El interés de este checkpoint no es su uso como modelo de producción, sino como evidencia empírica de una técnica de sustitución de operadores de atención en modelos pequeños. El autor documenta con detalle la telemetría del proceso: la perplejidad en WikiText-2 pasa de 470.312,09 inmediatamente después del trasplante a 251,72 tras la destilación, frente a los 15,38 del modelo profesor original. Es decir, se recupera un 99,95% de la degradación introducida, pero el resultado final sigue estando muy lejos del modelo base.

Se trata de un modelo de 494 millones de parámetros, 24 capas, dimensión oculta 896, con 14 cabezas de consulta y 2 de clave/valor (GQA), contexto nativo de Qwen2.5 y licencia MIT. Su relevancia es metodológica: demuestra un pipeline reproducible de cirugía de atención más destilación offline con caché de representaciones, ejecutable en una única RTX 3090 de 24 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only híbrido: 18/24 capas con `AdaSplashAttention` (subcuadrática, α-Entmax) + 6/24 capas con GQA softmax nativa de Qwen2 |
| Parámetros totales | 494 M (modelo base Qwen2.5-0.5B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada (heredada de Qwen2.5-0.5B; el autor no la declara explícitamente) |
| Tipos de cuantización | Pesos completos en FP16 (1021,37 MB) más adaptador; no se documentan otros formatos cuantizados |
| Idiomas soportados | Inglés (según el campo `language` de la model card); multilingüismo heredado de Qwen2.5 no verificado tras la destilación |
| Licencia | MIT |
| Formato de pesos | FP16 completo (safetensors/PyTorch vía librería `neuralops`) más adaptador |
| Dimensión oculta | 896 |
| Cabezas de atención | 14 query / 2 key-value (GQA), \(d_h = 64\) |
| Capas | 24 (18 trasplantadas, 6 nativas) |
| RoPE | Sí, \(\theta = 1.000.000\) |
| Kernel dispatch | CUDA / Triton / PyTorch (3 niveles) |
| Librería | `neuralops` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only denso con 24 bloques, dimensión 896, GQA con 14 cabezas de consulta y 2 de clave/valor, y RoPE con \(\theta = 1.000.000\). La intervención sustituye la atención softmax en los índices de capa `[0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22]` por `AdaSplashAttention`, un operador de atención subcuadrática basado en α-Entmax con radio local de splash, envuelto en un `QwenAttentionAdapter`. Las capas `[3, 7, 11, 15, 19, 23]` conservan la atención GQA softmax original como anclas de recuperación global. Cada capa trasplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansión de cabezas KV de 2 a 14, y una única proyección de salida sin duplicación.

El entrenamiento consiste en una destilación de conocimiento de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), con longitud de secuencia 512, `batch_size=8` y `grad_accum=4`, ejecutada en una RTX 3090 de 24 GB con caché offline de representaciones del profesor (0 MB de VRAM del profesor en GPU). La etapa 1 (30% del presupuesto, 95 pasos) congela embeddings, MLPs y `lm_head` y entrena solo módulos de atención y layer norms con AdamW (`lr=2.0e-4`, `weight_decay=0.01`, clipping 1.0), minimizando MSE por capa más \(0.25 \cdot (1 - \cos(h_s, h_t))\). La etapa 2 (70% del presupuesto, 220 pasos) ajusta extremo a extremo con `lr=6.0e-5` y un peso de coseno de 0.50, alineando los 24 flujos residuales y evitando el `lm_head`.

## Capacidades

- Generación de texto causal autorregresiva en inglés, heredada del modelo base y parcialmente recuperada mediante destilación.
- Atención con soporte causal y manejo de GQA integrado en el operador `AdaSplashAttention`.
- Soporte de RoPE con la configuración original de Qwen2.5.
- Capacidad de servir como banco de pruebas para evaluar operadores de atención subcuadrática frente a softmax en modelos compactos.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito; estas capacidades del modelo base no están verificadas tras la cirugía y la destilación.
- Multilingüismo no verificado: la model card declara únicamente inglés y la destilación se realizó exclusivamente sobre WikiText-2.

## Casos de uso

- Investigación en eficiencia de atención: comparar la perplejidad y el coste computacional de `AdaSplashAttention` frente a softmax GQA en un mismo backbone de 0,5B, usando la telemetría publicada como línea base.
- Reproducción de pipelines de cirugía de atención: el repositorio NeuralOps documenta el registro `ATTENTION_REGISTRY`, el adaptador `QwenAttentionAdapter` y el ratio híbrido 3:1, lo que permite replicar la sustitución en otros modelos pequeños.
- Validación de destilación offline con caché de representaciones: el protocolo de dos etapas con 0 MB de VRAM del profesor en GPU es directamente reutilizable en hardware de consumo para experimentos de alineación de representaciones.
- Estudio de recuperación tras intervención quirúrgica: el salto de perplejidad de 470.312,09 a 251,72 permite analizar cuánta capacidad se recupera con destilación de representaciones y qué queda irrecuperable.
- Benchmark de kernels: el despacho en tres niveles (CUDA, Triton, PyTorch) del operador permite medir latencia y throughput de cada backend en una RTX 3090.
- Docencia y divulgación técnica: como ejemplo didáctico de sustitución de operadores, herencia de pesos y evitar el colapso de proyecciones no inicializadas en modelos compactos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), medidos en el split de validación de WikiText-2 (`wikitext-2-raw-v1`) con longitud de secuencia 512, `batch_size=8` y `grad_accum=4`, en una NVIDIA GeForce RTX 3090 de 24 GB:

| Métrica | Valor | Notas |
|---|---:|---|
| Perplejidad del profesor (`Qwen/Qwen2.5-0.5B`) | 15,38 | Referencia GQA softmax causal |
| Perplejidad del estudiante tras cirugía (zero-shot) | 470.312,09 | Inmediatamente tras el trasplante de 18/24 capas |
| Perplejidad del estudiante tras destilación | 251,72 | Tras destilación de representaciones en 2 etapas |
| Delta absoluto de perplejidad | -470.060,37 | Mejora lograda por la destilación |
| Reducción relativa de perplejidad | 99,95% | Recuperación respecto al pico post-cirugía |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1 GB de pesos (1021,37 MB) más overhead de activaciones y caché KV; cómodo en cualquier GPU con 4 GB o más.
- GPU recomendadas: RTX 3090 (la utilizada por el autor para la destilación), RTX 4090, A100 o H100 para despliegues de mayor throughput; cualquier GPU consumer moderna es suficiente para inferencia individual.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y similares, dado el reducido tamaño del modelo.
- Opciones de despliegue: la librería `neuralops` es el entorno nativo; no se documenta compatibilidad directa con vLLM, llama.cpp, Ollama o TGI, por lo que el despliegue estándar requeriría exportar los pesos a un formato compatible o implementar el operador `AdaSplashAttention` en el runtime elegido.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-adasplash-attention-wikitext2` | 494 M | No disponible | 251,72 (post-destilación) | MIT | Hugging Face (312 descargas) |
| `Qwen/Qwen2.5-0.5B` (profesor) | 494 M | No disponible en esta ficha | 15,38 | Apache 2.0 (modelo base Qwen2.5) | Hugging Face |
| `Qwen/Qwen2.5-1.5B` | 1,5 B | No disponible en esta ficha | No disponible | Apache 2.0 | Hugging Face |

La comparación relevante es contra el propio modelo base: el checkpoint quirúrgico multiplica por más de 16 la perplejidad del profesor (251,72 frente a 15,38) incluso tras la destilación, lo que lo sitúa fuera del rango de uso práctico como generador de texto y lo confina a investigación.

## Limitaciones y advertencias

- Perplejidad muy superior a la del modelo base (251,72 frente a 15,38): la calidad de generación es sustancialmente peor que la de Qwen2.5-0.5B y no es apta para producción.
- El resultado es un artefacto de investigación: la model card lo presenta como parte del Attention Surgery Zoo, no como un modelo listo para uso general.
- Idiomas: solo se declara inglés y la destilación se realizó exclusivamente sobre WikiText-2, por lo que el multilingüismo original de Qwen2.5 no está garantizado.
- Riesgo de alucinación elevado dado el deterioro de la perplejidad y la ausencia de ajuste fino instructivo o RLHF/DPO documentado.
- Sesgos: no documentados por el autor; al entrenar solo sobre WikiText-2, los sesgos del corpus y los del modelo base no han sido mitigados ni evaluados.
- Compatibilidad: depende de la librería `neuralops` y del operador `AdaSplashAttention`; no hay garantía de funcionamiento en runtimes estándar sin adaptación.
- Licencia MIT declarada en el repositorio, pero el modelo base Qwen2.5 tiene su propia licencia; conviene revisar ambas antes de cualquier uso comercial.
- Los benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false` en el model-index).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-adasplash-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de `AdaSplashAttention`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/fast_kernels/adasplash_attention.py
- Licencia del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
