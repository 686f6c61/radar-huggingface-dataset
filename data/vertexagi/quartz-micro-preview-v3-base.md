# VertexAGI/quartz-micro-preview-v3-base

## Resumen

Quartz Micro Preview V3 Base es un modelo de lenguaje de 100,09 millones de parámetros entrenado desde cero por Vertex AGI sobre una única GPU de consumo (GTX 1660 Ti). Sigue la arquitectura Llama densa: 12 capas, dimensión oculta 768, 12 cabezas de atención con 4 cabezas KV (GQA), FFN SwiGLU de 2048, RoPE y embeddings atados de 32K con tokenizador BPE byte-level. Su ventana de contexto es de 1.024 tokens.

Se trata de un checkpoint base puro: continúa texto, pero no sigue instrucciones ni tiene ajuste de seguridad. El entrenamiento consistió en una pasada única sobre aproximadamente 6.500 millones de tokens (99.384 pasos de 65.536 tokens), con una pérdida de validación final de 2,61 (perplejidad 13,6). El modelo se distribuye en tres formatos dentro del mismo repositorio (safetensors fp32, MLX fp16/8-bit/4-bit y GGUF F16/Q8_0/Q4_K_M), lo que facilita su uso en entornos muy limitados de memoria.

Su relevancia es doble: por un lado, es un ejemplo reproducible de preentrenamiento desde cero en hardware de gama baja; por otro, sirve como referencia de lo que un modelo de ~100M parámetros puede y no puede hacer, con métricas de perplejidad publicadas por formato de cuantización. Existe una variante chat del mismo autor (quartz-micro-preview-v3) para uso conversacional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso tipo Llama (12 capas, hidden 768, 12 heads / 4 KV heads, SwiGLU 2048, RoPE) |
| Parámetros totales | 100.092.672 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantización | fp32 (safetensors), fp16 (MLX y GGUF F16), 8-bit (MLX q8, GGUF Q8_0), 4-bit (MLX q4 grupo 64, GGUF Q4_K_M) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp32), MLX (fp16, q8, q4), GGUF (F16, Q8_0, Q4_K_M) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso con la arquitectura estándar de Llama: 12 capas, dimensión oculta 768, 12 cabezas de atención con 4 cabezas KV (atención con query grouping), FFN SwiGLU con dimensión intermedia 2048, embeddings posicionales rotatorios (RoPE) y embeddings de entrada/salida atados con vocabulario BPE byte-level de 32K. No incorpora innovaciones como decodificación especulativa, atención lineal ni mezcla de expertos.

El preentrenamiento se realizó desde pesos inicializados aleatoriamente, sobre una mezcla de datos de aproximadamente 6.513.293.092 tokens en una sola pasada. La composición principal es FineWeb-Edu deduplicado (2,60B), Cosmopedia v2 (1,30B), Wikipedia en inglés de 2023 (0,78B), DCLM-Baseline (0,52B), Stack Exchange (0,46B), FineMath 4+ (0,39B), Python-Edu limpio (0,33B) y una pequeña fracción de texto de chat/instrucciones (0,07B), además de ELI5, SQuAD 2.0 y TriviaQA. Se aplicó descontaminación por n-gramas de 10 palabras contra ARC, HellaSwag, PIQA, WinoGrande, LAMBADA, OpenBookQA, SciQ, BoolQ, TriviaQA-validation, MMLU-test y CommonsenseQA. El optimizador fue AdamW (betas 0,9/0,95) con lr 6e-4, 300 pasos de calentamiento y decaimiento coseno hasta 6e-5, en fp32 sobre una GTX 1660 Ti durante unos 18 días a ~4.200 tokens/s. No se aplicó RLHF ni DPO: es un checkpoint base sin alineamiento.

## Capacidades

- Generación de texto continuado en inglés, con fluidez superficial en fragmentos cortos.
- Razonamiento básico y matemáticas muy limitadas (el propio autor lo señala como punto débil).
- Generación de código débil; el corpus incluye Python-Edu, pero el tamaño del modelo limita la calidad.
- Sin soporte de tool calling ni function calling.
- Sin soporte de agentes ni razonamiento multi-paso.
- Monolingüe: solo inglés; no se ha entrenado con datos en castellano ni otros idiomas.
- No dispone de modo thinking, visión ni audio.
- Capacidad de abstención parcial: el dataset incluye ejemplos de "no puedo hacer eso" y preguntas no respondibles de SQuAD 2.0, aunque el autor advierte que sigue inventando detalles.
- No sigue instrucciones ni respeta límites de longitud solicitados.

## Casos de uso

- Investigación educativa sobre preentrenamiento: sirve para estudiar curvas de pérdida, dinámica de entrenamiento y efectos del tamaño de datos en modelos de ~100M parámetros, ya que el autor publica pasos, tokens y pérdida final.
- Prototipado rápido en hardware muy limitado: con el GGUF Q4_K_M (67 MB) o el MLX q4 (63 MB) se puede ejecutar en portátiles, Raspberry Pi o entornos sin GPU dedicada para validar pipelines de inferencia.
- Generación de texto de relleno o continuaciones creativas cortas: útil para demos, tests de UI o generación de texto sintético de baja criticidad donde no se requiera exactitud factual.
- Evaluación comparativa de cuantizaciones: el repositorio publica perplejidad por formato (fp32 10,614; Q8_0 10,615; Q4_K_M 10,903), lo que permite medir el impacto de la cuantización en un modelo pequeño con datos verificables.
- Base para fine-tuning ligero: al ser un checkpoint base con licencia Apache 2.0 y pesos estándar de `LlamaForCausalLM`, se puede ajustar con LoRA en tareas acotadas (clasificación de texto corto, generación de plantillas) en una sola GPU de consumo.
- Benchmark de infraestructura: sirve para validar despliegues de llama.cpp, Ollama, LM Studio o MLX en Apple Silicon antes de migrar a modelos mayores, dado su reducido tamaño y su compatibilidad con runtimes estándar.
- Enseñanza de arquitecturas transformer: su configuración compacta y bien documentada (12 capas, GQA 12/4, SwiGLU, RoPE, embeddings atados) lo hace adecuado como material didáctico para explicar cada componente con un modelo ejecutable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta métricas de perplejidad:

| Métrica | Valor |
|---|---|
| Pérdida de validación final (V3 split) | 2,61 |
| Perplejidad de validación (V3 split) | 13,6 |
| Perplejidad en 300 ventanas de 1.024 tokens (V3 base) | 14,4 |
| Perplejidad en 300 ventanas de 1.024 tokens (V2 base) | 28,1 |
| Perplejidad transformers fp32 | 10,614 |
| Perplejidad MLX fp16 | 10,614 |
| Perplejidad MLX 8-bit | 10,604 |
| Perplejidad MLX 4-bit | 11,043 |
| Perplejidad GGUF F16 | 10,614 |
| Perplejidad GGUF Q8_0 | 10,615 |
| Perplejidad GGUF Q4_K_M | 10,903 |

## Requisitos de hardware

- VRAM estimada para inferencia: ~400 MB en fp32, ~200 MB en fp16, ~108-113 MB en 8-bit y ~63-67 MB en 4-bit.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el modelo se entrenó en una GTX 1660 Ti (6 GB) y puede ejecutarse en GPUs integradas o en CPU.
- Cabe en cualquier GPU de consumo, incluidas GTX 1050, RTX 3050, RTX 4090 o incluso en Apple Silicon mediante MLX; también funciona en CPU sin GPU dedicada.
- Opciones de despliegue: `transformers` (safetensors), `mlx-lm` (MLX), `llama.cpp`, Ollama, LM Studio (GGUF) y text-generation-inference (el repositorio está etiquetado como compatible con endpoints).
- Latencia y throughput: el autor reporta ~4.200 tokens/s durante el entrenamiento en una GTX 1660 Ti; no se publican cifras de inferencia. Dado el tamaño, se espera latencia de milisegundos por token en GPU moderna, pero no hay datos verificables.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Quartz Micro Preview V3 Base | 100,09M | 1.024 | en | Apache 2.0 | Entrenado desde cero en una GTX 1660 Ti; sin benchmarks estándar publicados |
| SmolLM-135M (HuggingFaceTB) | 135M | 2.048 | en (principalmente) | Apache 2.0 | Entrenado sobre SmolLM-Corpus; dispone de benchmarks publicados |
| Qwen2.5-0.5B | 494M | 32.768 | multilingüe | Apache 2.0 | Mucho mayor; contexto y capacidades muy superiores |
| Pythia-160M | 160M | 2.048 | en | Apache 2.0 | Suite de investigación con checkpoints intermedios; benchmarks publicados |

La comparación con SmolLM-135M y Pythia-160M es la más directa por escala, aunque Quartz no publica resultados en benchmarks estándar, lo que impide una comparación cuantitativa de calidad. Frente a Qwen2.5-0.5B la diferencia de tamaño y contexto es de un orden de magnitud.

## Limitaciones y advertencias

- No sigue instrucciones: es un modelo base que solo continúa texto; para uso conversacional debe emplearse la variante chat del mismo autor.
- Sin ajuste de seguridad ni alineamiento: puede generar contenido inapropiado, sesgado u ofensivo heredado de los datos web.
- Riesgo alto de alucinación: el propio autor advierte que "afirma hechos falsos e inventa detalles".
- Razonamiento, matemáticas y código débiles por el reducido tamaño (100M parámetros).
- Contexto muy limitado: 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Solo inglés: no hay soporte para castellano ni otros idiomas.
- Ignora límites de longitud solicitados en la generación.
- Licencia Apache 2.0 permite uso comercial, pero la calidad y fiabilidad del modelo hacen desaconsejable su uso en producción sin fine-tuning y validación previas.
- No hay benchmarks estándar publicados, por lo que no se puede comparar su calidad de forma objetiva con alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/VertexAGI/quartz-micro-preview-v3-base
- Variante chat: https://huggingface.co/VertexAGI/quartz-micro-preview-v3
- Repositorio de datos SmolLM-Corpus (FineWeb-Edu, Cosmopedia v2): https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- DCLM-Baseline: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0
- FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- llama.cpp: https://github.com/ggml-org/llama.cpp
- MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-lm
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
