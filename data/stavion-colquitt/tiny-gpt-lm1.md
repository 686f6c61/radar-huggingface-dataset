# Stavion-Colquitt/Tiny-GPT-LM1

## Resumen

Tiny GPT (LM 1) es un modelo de lenguaje de 20,7 millones de parámetros desarrollado por Stavion-Colquitt como proyecto educativo de implementación desde cero. Se trata de un transformer decoder-only escrito íntegramente en PyTorch, sin uso de la librería `transformers` ni de pesos preentrenados: el tokenizador BPE a nivel de byte, la arquitectura, el bucle de entrenamiento y el muestreador están implementados en el propio repositorio. El modelo se entrenó desde cero en una única GPU de consumo RTX 2060 con 6 GB de VRAM durante aproximadamente 9,5 horas sobre 505 millones de tokens de texto en inglés con licencias abiertas.

El modelo resuelve un problema fundamentalmente pedagógico: demostrar que es posible entrenar un LM funcional de extremo a extremo con hardware asequible y datos abiertos, documentando cada decisión técnica. No está pensado como asistente ni como modelo de producción, sino como referencia reproducible para quienes quieren entender el ciclo completo de entrenamiento de un LM. Su relevancia actual radica en la transparencia del proceso (curvas de validación, muestras por checkpoint, registro en MLflow) y en la trazabilidad completa de los datos de entrenamiento.

La arquitectura es un transformer decoder-only pre-norm de 8 capas, 6 cabezas de atención, dimensión de modelo 384 y MLP GELU con factor de expansión 4x, con embeddings posicionales aprendidos y una longitud de contexto de 512 tokens. Alcanza una pérdida de validación de 2,922 (perplejidad 18,6) sobre 2,5 millones de tokens reservados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, pre-norm, 8 capas, 6 cabezas, d_model 384, MLP GELU (4x) |
| Parámetros totales | 20.684.544 (20,7M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (embeddings posicionales aprendidos) |
| Tipos de cuantización | No disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT (código); los datos de entrenamiento conservan sus licencias propias |
| Formato de pesos | safetensors (`model.safetensors`), más `config.json`, `tokenizer.json`, `model.py`, `generate.py` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con normalización previa (pre-norm), 8 capas, 6 cabezas de atención y dimensión de modelo 384. El MLP usa activación GELU con factor de expansión 4x. La atención se implementa mediante `scaled_dot_product_attention` causal de PyTorch. El tokenizador es un BPE a nivel de byte con vocabulario de 16.384 tokens, entrenado sobre el propio corpus. Los embeddings de token están atados (tied) a la cabeza de salida, y los embeddings posicionales son aprendidos, no rotatorios. El contexto máximo es de 512 tokens.

El entrenamiento se realizó en dos fases sobre un total de 505 millones de tokens: FineWeb-Edu sample-10BT shard 0 (229,5M tokens), Cosmopedia v2 del corpus SmolLM shard 0 (125,4M), TinyStories V2 generado con GPT-4 (75,4M) y Wikipedia en inglés simple de 2023-11-01 (75,2M). Se usó AdamW con betas (0,9; 0,95), weight decay 0,1 solo en matrices, clipping de gradiente 1,0, micro-lotes de 32 x 2 de 512 tokens (32.768 tokens por paso), autocast FP16 con GradScaler (la Turing RTX 2060 no soporta BF16). La fase 1 usó 500 pasos de warmup y decaimiento coseno de 1e-3 a 1e-4; la extensión re-calentó a 3e-4 durante 300 pasos y decayó a 3e-5 con nueva semilla de datos. Se evaluó cada 500 pasos con pérdida de validación y muestras, guardando el mejor checkpoint por pérdida de validación y registrando en MLflow. No hubo RLHF ni DPO: es un modelo base sin ajuste por instrucciones.

## Capacidades

- Generación de texto autoregresiva en inglés con prompts libres.
- Producción de relatos cortos fluidos y oraciones de estilo enciclopédico (Wikipedia simple).
- Continuación de texto coherente a nivel de frase y párrafo breve.
- Generación de historias infantiles de estilo TinyStories.
- Muestreo configurable con temperatura y top-k (el script `generate.py` acepta `--tokens` y parámetros de muestreo).
- Inferencia en CPU sin requisitos de GPU.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- No está ajustado por instrucciones; no sigue instrucciones de forma fiable.

## Casos de uso

- Docencia y formación en NLP: el repositorio completo (tokenizador, modelo, bucle de entrenamiento, muestreador) sirve como material didáctico para explicar cada componente de un LM desde cero, sin cajas negras de librerías de alto nivel.
- Reproducción de experimentos de escalado a pequeña escala: permite estudiar empíricamente el efecto del presupuesto de datos y de pasos sobre la pérdida de validación, con curvas documentadas y muestras por checkpoint en `samples.txt`.
- Generación de texto creativo breve en inglés: produce relatos cortos y descripciones de estilo narrativo simple, adecuado para demos de generación con temperatura y top-k ajustables.
- Pruebas de infraestructura de despliegue: al ser un modelo PyTorch plano de 0,1 GB, sirve para validar pipelines de inferencia en CPU, contenedores ligeros o entornos con recursos mínimos antes de migrar a modelos mayores.
- Investigación sobre tokenizadores BPE: el `tokenizer.json` entrenado sobre el corpus permite analizar el comportamiento de un vocabulario de 16.384 tokens en dominios mixtos (web educativa, cuentos, Wikipedia).
- Estudio de sesgos y alucinación en modelos pequeños: útil como caso base para medir cómo un modelo de 20M parámetros inventa hechos y matemáticas, comparándolo con modelos mayores en tareas controladas.
- Referencia para proyectos educativos de "primer modelo": plantilla para quienes quieren entrenar su propio LM en una GPU de consumo siguiendo una receta documentada con hiperparámetros y presupuesto temporal concretos.

## Benchmarks y rendimiento

El autor no publica resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). Los únicos datos de rendimiento disponibles son de validación interna:

| Métrica | Fase 1 | Extensión (final) |
|---|---|---|
| Pasos | 9.644 | 21.877 |
| Tokens vistos | 316M | 717M (total) |
| Tiempo en RTX 2060 | 3,75 h | +5,77 h |
| Pérdida de validación | 3,057 | 2,922 |
| Perplejidad | 21,3 | 18,6 |

La validación se calculó sobre 2,5 millones de tokens reservados (cada 200º documento de la mezcla, nunca vistos en entrenamiento). El autor señala que la extensión aportó unos 0,13 nats y que, a partir del paso 19.000, la pérdida se estabilizó entre 2,92 y 2,97, por lo que las mejoras futuras dependen de más datos o un modelo mayor, no de más pasos.

## Requisitos de hardware

- Inferencia en CPU: viable y funcional según el autor; el modelo pesa 0,1 GB en safetensors.
- VRAM estimada para inferencia en GPU: inferior a 1 GB en FP16 (20,7M parámetros x 2 bytes ≈ 41 MB de pesos, más activaciones y caché KV para 512 tokens).
- GPU recomendadas: cualquier GPU con más de 1 GB de VRAM; el entrenamiento se realizó en una RTX 2060 de 6 GB. Para inferencia basta una GPU integrada o incluso CPU.
- Cabe en cualquier GPU de consumo (RTX 2060, RTX 3060, RTX 4090, etc.) con margen amplio.
- Opciones de despliegue: el autor proporciona `generate.py` con PyTorch, `tokenizers` y `safetensors`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al ser un modelo PyTorch plano sin integración con `transformers`, estas herramientas no lo cargan directamente.
- Latencia y throughput: no disponibles de forma medida. El entrenamiento procesó 32.768 tokens por paso en la RTX 2060; la inferencia en CPU es funcional pero sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Tiny GPT (LM 1) | 20,7M | 512 | MIT | safetensors (PyTorch plano) | Entrenado desde cero en RTX 2060, sin instrucciones |
| SmolLM-135M | 135M | 2.048 | Apache 2.0 | safetensors, GGUF | Modelo base de HuggingFaceTB, entrenado con el corpus SmolLM |
| TinyLlama-1.1B | 1,1B | 2.048 | Apache 2.0 | safetensors, GGUF | Entrenado sobre 3 billones de tokens, mucho mayor |
| GPT-2 small | 124M | 1.024 | MIT | safetensors, GGUF | Referencia histórica de LM pequeño, disponible en `transformers` |

La comparación es asimétrica: Tiny GPT es entre 6 y 50 veces menor que las alternativas citadas y no compite en benchmarks. Su valor diferencial es la reproducibilidad total del pipeline y la ausencia de dependencia de `transformers`, no el rendimiento. No se dispone de datos de benchmarks comparativos publicados por el autor.

## Limitaciones y advertencias

- No está ajustado por instrucciones: no sigue instrucciones de forma fiable y no debe usarse como asistente.
- Alucinación severa: inventa hechos y matemáticas; el propio autor lo advierte explícitamente.
- Pérdida de coherencia tras unas pocas frases; el contexto de 512 tokens limita la ventana efectiva.
- Solo inglés; no soporta otros idiomas.
- Hereda los sesgos presentes en FineWeb-Edu, Cosmopedia, TinyStories y Wikipedia en inglés simple.
- Entrenado con 505M tokens, muy por debajo de lo necesario para conocimiento factual fiable.
- Licencia del código MIT, pero los datos de entrenamiento conservan sus licencias (ODC-By 1.0, CDLA-Sharing 1.0, CC BY-SA 3.0); conviene revisar la compatibilidad para usos derivados.
- No es un modelo de `transformers`: requiere el código incluido en el repositorio para cargarse; no funciona con `AutoModelForCausalLM`.
- El autor lo describe como proyecto de aprendizaje y recomienda no usarlo "para nada que importe".
- Proyecto construido con asistencia de IA (Claude) para código y documentación, según declara el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Stavion-Colquitt/Tiny-GPT-LM1
- Código en GitHub: https://github.com/Stavion-Colquitt/Tiny-GPT
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Corpus SmolLM (Cosmopedia v2): https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Wikipedia en inglés simple: https://huggingface.co/datasets/wikimedia/wikipedia
