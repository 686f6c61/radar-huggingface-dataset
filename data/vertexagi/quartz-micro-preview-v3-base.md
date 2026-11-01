# VertexAGI/quartz-micro-preview-v3-base

## Resumen

Quartz Micro Preview V3 (base) es un modelo lingüístico de tamaño muy reducido, entrenado desde cero por Vertex AGI. Se trata de un decodificador denso de arquitectura Llama con aproximadamente 100 millones de parámetros (100.092.672 exactos según los safetensors), entrenado en fp32 sobre una única GTX 1660 Ti durante unos 18 días, a razón de unos 4.200 tokens por segundo.

El modelo resuelve un problema concreto: ofrecer un modelo base minúsculo, completamente abierto y verificable, entrenado con un corpus curado de unos 6.500 millones de tokens (65 veces más que su predecesor V2). Es un modelo base "en bruto": continúa texto pero no sigue instrucciones; para eso existe la versión chat `VertexAGI/quartz-micro-preview-v3`.

Su relevancia actual está en el nicho de los small language models reproducibles: se distribuye en un único repositorio con pesos en safetensors, MLX y GGUF, con verificación de perplexidad por formato, lo que lo hace idóneo para experimentación, educación y ejecución en hardware muy modesto, incluido Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador denso tipo Llama (LlamaForCausalLM) |
| Parametros totales | 100.092.672 (~100M) |
| Parametros activos | No aplicable (no es MoE, todos los parámetros activos) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | fp32, fp16, 8-bit (Q8_0 / MLX q8), 4-bit (Q4_K_M / MLX q4, group size 64) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 (con advertencias sobre datos de entrenamiento de terceros) |
| Formato de pesos | safetensors (fp32), MLX (fp16, q8, q4), GGUF (f16, q8_0, q4_k_m) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decodificador denso estilo Llama con 12 capas, dimensión oculta de 768, 12 cabezas de atención con 4 cabezas KV (GQA), activación SwiGLU con dimensión intermedia de 2.048, codificaciones posicionales RoPE y un tokenizador byte-level BPE con vocabulario de 32.000 tokens y embeddings vinculados (tied embeddings).

El entrenamiento usó unos 6.513.293.092 tokens en una sola pasada (99.384 pasos de 65.536 tokens), con una mezcla de datos que incluye FineWeb-Edu (2,60B), Cosmopedia v2 (1,30B), Wikipedia en inglés (0,78B), DCLM-Baseline (0,52B), Stack Exchange (0,46B), FineMath 4+ (0,39B), Python-Edu (0,33B), texto de chat de SmolTalk y Tulu-3 (0,07B), ELI5, SQuAD 2.0 (incluyendo ejemplos "unanswerable" para enseñar abstención) y TriviaQA. Se aplicó descontaminación por n-gramas de 10 palabras frente a benchmarks como ARC, HellaSwag, PIQA, WinoGrande, LAMBADA, MMLU-test y otros. El optimizador fue AdamW (betas 0,9/0,95) con learning rate 6e-4, 300 pasos de calentamiento y decay coseno hasta 6e-5. La pérdida final de validación fue 2,61 (perplexidad 13,6). No hubo RLHF ni DPO: es un modelo base preentrenado. Como innovación destacable, el autor publica la perplexidad verificada de cada formato de distribución frente al código original de entrenamiento.

## Capacidades

- Generación de texto fluido en inglés para pasajes cortos (continuación de texto, no instrucciones).
- Conocimiento factual básico heredado de Wikipedia, FineWeb-Edu y TriviaQA, aunque poco fiable.
- Exposición limitada a matemáticas (FineMath 4+) y código Python (Python-Edu), con resultados débiles.
- Abstención aprendida: entrenado con ejemplos de "no lo sé" y pasajes sin respuesta (SQuAD unanswerable, SmolTalk).
- Sin soporte de tool calling ni function calling.
- Sin capacidades de agentes ni razonamiento multi-paso.
- Sin capacidades multilingües: solo inglés.
- Sin vision ni audio; pipeline exclusivo de text-generation.

## Casos de uso

- Experimentación y educación sobre LLMs: al ser un modelo de 100M entrenado desde cero con documentación completa del proceso, es ideal para estudiar cómo escala la calidad con los tokens y para cursos sobre preentrenamiento.
- Ejecución en hardware mínimo: con 63-67 MB en 4-bit, funciona en portátiles sin GPU dedicada, Raspberry Pi-class devices o navegadores con WASM vía llama.cpp.
- Desarrollo y pruebas en Apple Silicon: los formatos MLX (fp16, q8, q4) permiten integrarlo en pipelines mlx-lm con overhead mínimo.
- Pruebas de infraestructura de inferencia: su tamaño lo hace perfecto para smoke tests de vLLM, llama.cpp, Ollama o TGI sin consumir recursos.
- Baseline de investigación: punto de comparación para técnicas de destilación, cuantización o decodificación especulativa (como modelo draft).
- Prototipado de completado de texto simple: generación de continuaciones cortas en inglés donde la factualidad no es crítica (brainstorming estilístico, texto creativo).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K, etc.). El autor no reporta puntuaciones en benchmarks estándar, presumiblemente por el tamaño del modelo. Los únicos datos cuantitativos publicados son de perplexidad:

| Formato | Perplexidad | Diferencia respecto al original |
|---|---:|---:|
| transformers fp32 | 10,614 | 0,000% |
| MLX fp16 | 10,614 | 0,000% |
| MLX 8-bit | 10,604 | 0,096% |
| MLX 4-bit | 11,043 | 4,044% |
| GGUF f16 | 10,614 | 0,002% |
| GGUF Q8_0 | 10,615 | 0,008% |
| GGUF Q4_K_M | 10,903 | 2,717% |

Pérdida de validación final: 2,61 (perplexidad 13,6). Comparativa interna con V2 base: perplexidad 14,4 (V3) frente a 28,1 (V2) sobre 300 ventanas de 1.024 tokens del split de validación V3.

## Requisitos de hardware

- VRAM estimada para inferencia: desde unos 70-80 MB en Q4_K_M hasta unos 400 MB en fp32; cualquier GPU o CPU moderna es suficiente.
- GPU recomendadas: ninguna en particular; el propio autor lo entrenó en una GTX 1660 Ti, y para inferencia basta cualquier GPU consumer o incluso solo CPU.
- Consumer GPUs: cabe sobradamente en cualquier GPU con 1 GB de VRAM o más (GTX 1050, RTX 3060, RTX 4090, Apple Silicon unificado, etc.).
- Opciones de despliegue: Transformers (PyTorch), mlx-lm (Apple Silicon), llama.cpp, Ollama y LM Studio vía GGUF; compatible con vLLM y TGI al ser un LlamaForCausalLM estándar sin código personalizado ni `trust_remote_code`.
- Latencia y throughput: no disponible; por tamaño y contexto, se espera latencia muy baja y throughput alto incluso en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Quartz Micro Preview V3 base | ~100M | 1.024 | Apache-2.0 | Base preentrenada desde cero, 6,5B tokens, solo inglés |
| SmolLM2-135M (HuggingFaceTB) | 135M | 2.048 | Apache-2.0 | Similar en clase de tamaño, con versiones instruct y mayor contexto |
| Qwen2.5-0.5B | ~500M | 32.768 (128K con YaRN) | Apache-2.0 (algunas variantes Qwen) | Clase superior, multilingüe y con mejores capacidades |
| Llama 3.2 1B | ~1.200M | 128.000 | Llama Community License | Mucho mayor contexto y capacidades, licencia restrictiva comparada |

Quartz Micro se sitúa en el extremo inferior de la gama: frente a SmolLM2-135M ofrece menos contexto y probablemente menor calidad, pero con una trazabilidad total del entrenamiento y una huella de memoria aún menor.

## Limitaciones y advertencias

- No sigue instrucciones: es un modelo base que solo continúa texto; para chat usar la versión `quartz-micro-preview-v3`.
- Alta tasa de alucinación declarada por el propio autor: afirma hechos erróneos e inventa detalles con frecuencia.
- Débil en matemáticas, razonamiento y código.
- Ignora límites de longitud en la generación.
- Solo inglés; sin capacidades multilingües.
- Contexto de solo 1.024 tokens, muy limitado para documentos largos.
- Sin ajuste de seguridad ni alineamiento: hereda sesgos y errores del texto web y sintético de entrenamiento.
- Riesgo licencia para uso comercial: aunque los pesos son Apache-2.0, parte de los datos de entrenamiento tienen términos NonCommercial o ShareAlike (Tulu-3 incluye `no_robots` bajo CC-BY-NC; Wikipedia, Stack Exchange, Dolly y SQuAD son CC-BY-SA; CoCoNot es ODC-By). Revisar estos términos antes de cualquier despliegue comercial.
- El propio autor indica que no es apto para ninguna decisión que importe ("not suitable for any decision that matters").

## Enlaces

- Modelo base: https://huggingface.co/VertexAGI/quartz-micro-preview-v3-base
- Modelo chat (versión instruccional): https://huggingface.co/VertexAGI/quartz-micro-preview-v3
- Autor en Hugging Face: https://huggingface.co/VertexAGI
