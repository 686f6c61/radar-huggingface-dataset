# tahamajs/qwen-2.5-0.5b-galerkin-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-galerkin-attention-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido 18 de las 24 capas de atención del decoder original por el operador `GalerkinAttention` de la librería NeuralOps, manteniendo 6 capas con la atención GQA softmax nativa de Qwen2. Lo publica el autor independiente tahamajs como parte de su "Attention Surgery Zoo", un proyecto que explora la viabilidad de transplantar operadores de atención subcuadrática en modelos preentrenados compactos.

El modelo no es un modelo de propósito general listo para producción: es un artefacto de investigación sobre atención lineal y destilación de conocimiento. Tras el transplante quirúrgico, la perplejidad en WikiText-2 se dispara a 295.128,06 y, después de un protocolo de destilación en dos etapas sobre WikiText-2, baja hasta 153,16. Para contextualizar, el profesor original Qwen2.5-0.5B obtiene 15,38 en el mismo benchmark, de modo que el estudiante queda aproximadamente diez veces peor en perplejidad pese a la recuperación del 99,95 % respecto al estado post-cirugía.

La relevancia es metodológica: demuestra el pipeline de "attention surgery" con herencia de pesos `q_proj`/`k_proj`/`v_proj`/`o_proj`, expansión de cabeceras KV de 2 a 14 y destilación de representaciones ocultas con caché offline en una única RTX 3090. La licencia es MIT y el checkpoint se distribuye en safetensors FP16 (1.021,18 MB) más un adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder híbrido: 18/24 capas con `GalerkinAttention` (lineal, familia `linear`) + 6/24 capas con GQA softmax nativa de Qwen2 |
| Parametros totales | 535.364.224 (según safetensors); la model card cita 494M para el base |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el base Qwen2.5-0.5B soporta 32.768 tokens; el checkpoint no lo declara) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 completo, 1.021,18 MB, más adaptador) |
| Idiomas soportados | inglés (`en` en la model card) |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16 completo + adaptador) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B: 24 capas, dimensión oculta D=896, 14 cabeceras de consulta y 2 de clave/valor (GQA), dimensión por cabecera d_h=64 y RoPE con theta=1.000.000. Sobre esa base se aplica una cirugía determinista con ratio `hybrid_3_1`: las capas [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22] usan `GalerkinAttention` envuelto en `QwenAttentionAdapter`, mientras que [3, 7, 11, 15, 19, 23] conservan la atención GQA softmax preentrenada como anclas de enrutamiento contextual global. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansión de cabeceras KV de 2 a 14 y una única `o_proj` sin duplicación.

`GalerkinAttention` se describe como una "Petrov-Galerkin Projection Attention" con soporte causal autoregresivo, manejo de GQA y despacho de kernel en tres niveles (CUDA / Triton / PyTorch). El entrenamiento consiste en una destilación de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), ejecutada en una RTX 3090 de 24 GB con caché offline de representaciones del profesor (0 MB de VRAM del profesor en GPU). La etapa 1 (30 % del presupuesto, 124 pasos) congela embeddings, MLP y `lm_head` y entrena solo atención y layer norms con AdamW (lr=2.0e-4, weight decay 0.01, grad clipping 1.0), AMP FP16 con `GradScaler` y pesos maestros FP32, minimizando MSE por capa más 0,25·(1 − coseno) entre estados ocultos. La etapa 2 (70 %, 285 pasos) realiza destilación end-to-end de representaciones; el detalle completo del objetivo queda truncado en la model card.

## Capacidades

- Generación de texto causal autorregresiva en inglés, heredada del base Qwen2.5-0.5B.
- Soporte de atención causal con GQA en las capas transplantadas, lo que permite decodificación token a token estándar.
- Conversacional y `text-generation` como pipeline declarado.
- Capacidad de operar como sujeto de experimentos de atención lineal y destilación, no como asistente fiable.
- No se documentan tool calling, function calling, agentes, visión, audio, thinking mode ni capacidades multimodales.
- Multilingüismo limitado al inglés según la model card; el base Qwen2.5 es multilingüe, pero este checkpoint no declara ese soporte.

## Casos de uso

- Investigación en atención subcuadrática: sirve como banco de pruebas reproducible para medir el coste de sustituir atención softmax por operadores lineales en modelos de 0,5B, comparando perplejidad pre y post destilación.
- Estudio de destilación de representaciones ocultas: el pipeline de dos etapas con caché offline de profesor permite replicar el experimento en una sola GPU consumer de 24 GB.
- Desarrollo y validación de la librería NeuralOps: útil para verificar el despacho de kernels CUDA/Triton/PyTorch y el `QwenAttentionAdapter` en un modelo pequeño.
- Benchmarking de "attention surgery" con herencia de pesos: permite evaluar cómo afecta la inicialización desde `q_proj`/`k_proj`/`v_proj`/`o_proj` del profesor a la estabilidad del transplante.
- Docencia y divulgación: ejemplo didáctico de arquitectura híbrida 3:1 y de cómo la perplejidad puede degradarse varios órdenes de magnitud tras una cirugía agresiva.
- Prototipado de bajo coste en entornos con una única RTX 3090: el checkpoint completo en FP16 ocupa poco más de 1 GB y cabe holgadamente en VRAM consumer para experimentos de inferencia.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente), medidos en el split de validación de WikiText-2 con longitud de secuencia 512, batch_size=8 y grad_accum=4:

| Metrica | Valor |
|---|---|
| Perplejidad del profesor (`Qwen/Qwen2.5-0.5B`) | 15,38 |
| Perplejidad del estudiante zero-shot tras la cirugía (pre-KD) | 295.128,06 |
| Perplejidad del estudiante tras destilación (post-KD) | 153,16 |
| Delta absoluto de perplejidad | −294.974,90 |
| Reducción relativa de perplejidad | 99,95 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 1,1-1,3 GB de pesos, más overhead de activaciones y caché KV; cabe en cualquier GPU con 4 GB o más.
- GPU recomendadas: RTX 3090 (la usada por el autor para la destilación), RTX 4090, A100 o H100 para mayor throughput; cualquier GPU consumer moderna es suficiente para inferencia.
- Cabe en GPU consumer: sí, en GTX 1660 6 GB, RTX 3060 12 GB, RTX 4060 Ti, RTX 4090 y similares.
- Opciones de despliegue: al usar `library_name: neuralops`, la carga requiere la librería NeuralOps y su `QwenAttentionAdapter`; no se documenta compatibilidad directa con vLLM, llama.cpp, Ollama o TGI, por lo que el despliegue estándar no está garantizado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-galerkin-attention-wikitext2` | 535M | no disponible | 153,16 (post-KD) | MIT | Hugging Face, requiere NeuralOps |
| `Qwen/Qwen2.5-0.5B` (profesor) | 494M | 32.768 | 15,38 | Apache 2.0 | Hugging Face, transformers estándar |
| `Qwen/Qwen2.5-1.5B` | 1.500M | 32.768 | no disponible en esta ficha | Apache 2.0 | Hugging Face, transformers estándar |

La comparación directa con el profesor muestra una degradación de aproximadamente 10× en perplejidad pese a la recuperación del 99,95 % respecto al estado post-cirugía. Frente a alternativas de tamaño similar, este checkpoint no compite en calidad de generación: su valor es experimental.

## Limitaciones y advertencias

- Calidad de lenguaje muy degradada: perplejidad de 153,16 frente a 15,38 del profesor, lo que se traduce en generación incoherente o repetitiva en la práctica.
- El checkpoint ha sido destilado únicamente sobre WikiText-2, un corpus de artículos enciclopédicos en inglés; el dominio y el idioma están fuertemente restringidos.
- Riesgo elevado de alucinación y de texto sin sentido; no apto para producción ni para atención al cliente.
- Solo se declara inglés; no hay evidencia de capacidades multilingües heredadas del base.
- No se documentan sesgos específicos, pero al derivar de Qwen2.5-0.5B y entrenarse solo en WikiText-2, puede reproducir los sesgos del corpus y del profesor.
- Requiere la librería NeuralOps y el `QwenAttentionAdapter` para cargar; no es un checkpoint estándar de transformers y puede fallar en pipelines convencionales.
- La licencia MIT aplica al checkpoint, pero conviene revisar la licencia del base Qwen2.5 (Apache 2.0) y las condiciones de NeuralOps.
- Los benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en el model-index).
- El detalle de la etapa 2 de destilación está truncado en la model card, lo que dificulta la reproducibilidad exacta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-galerkin-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de `GalerkinAttention`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/linear/galerkin_attention.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
