# VectaBass/vectabass-618m-2.18bt-base-cooled

## Resumen

vectabass-618m-2.18bt-base-cooled es un modelo de lenguaje base de 618 millones de parámetros totales (527,7 millones no pertenecientes a embeddings) desarrollado por VectaBass. Se trata de la celda N4-D2 del "AR square" de la fase 1 del proyecto: una escalera de modelos de entre 100M y 1,6B de parámetros no-embedding, cada tamano entrenado con varios presupuestos de tokens y publicados conjuntamente para poder verificar empíricamente la ley de escalado. Este checkpoint concreto se ha entrenado con 2.182.742.016 tokens, es decir, 4 tokens por parámetro no-embedding.

El modelo emplea una arquitectura tipo Llama con atención causal, GQA 2:1 y una innovación propia denominada exclusive self-attention (XSA), que requiere cargar código personalizado (`modeling_vectabass.py`) mediante `trust_remote_code`. La longitud de contexto es de 2048 tokens y el vocabulario usa BPE de GPT-2 ampliado a 50.304 filas con 26 tokens especiales.

Es relevante por su carácter de modelo de investigación orientado a IA soberana del Reino Unido: el dataset incluye fuentes del sector público británico, parlamentarias y de lenguas celtas (galés, gaélico escocés, irlandés, manés, córnico) además de inglés y escocés. No es un modelo de asistente: es un base model sin ajuste por instrucciones ni por seguridad, pensado para estudios de scaling laws y no para uso en producción como chatbot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama con GQA 2:1 y exclusive self-attention (XSA) |
| Parametros totales | 617.908.480 (embeddings atados) |
| Parametros activos | no disponible (no es MoE) |
| Parametros no-embedding | 527.708.160 |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (entrenado y publicado en bf16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | en, cy (gales), gd (gaelico escoces), ga (irlandes), gv (manes), kw (cornico), sco (escoces) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con código de modelado personalizado en Python) |
| Ancho / capas | 1792 / 15 |
| Cabezas | 28 query, 14 key-value, dimension 64 |
| Feed-forward | SwiGLU, dimension 4752 |
| Normalizacion | RMSNorm, pre-norm |
| Posiciones | RoPE, base 10000 |
| Vocabulario | 50.304 filas (GPT-2 BPE 50.257 + 26 tokens especiales + padding) |

## Arquitectura y entrenamiento

La red es un transformer decoder-only de estilo Llama con 15 capas, ancho 1792, atención causal con GQA 2:1 (28 cabezas de consulta y 14 de clave-valor de dimensión 64) y feed-forward SwiGLU de dimensión 4752. La diferencia respecto a Llama es la exclusive self-attention (XSA), una variante de atención propia del proyecto que obliga a cargar `modeling_vectabass.py` desde el repositorio con `trust_remote_code=True`. Las posiciones usan RoPE con base 10000 y el contexto está limitado a 2048 tokens.

El entrenamiento usó 2.182.742.016 tokens (4 por parámetro no-embedding) con un batch de 458.752 tokens, optimizador Muon para matrices ocultas (NS 5, Moonlight RMS 0.2, momentum 0.95) combinado con AdamW en fp32 (0.9, 0.95), LR pico de 0.00148, warmup de 437M tokens y un schedule de warmup, fase constante y cooldown 1-sqrt hasta cero en el último 20% del entrenamiento (de ahí el sufijo "cooled"). El weight decay es 0.0575 sobre matrices. La precisión de entrenamiento fue bf16 en pesos y activaciones con pesos maestros en fp32 en el optimizador, y estadísticas de normalización, ángulos RoPE y logits en fp32. Se ejecutó sobre 2 x NVIDIA GH200 de 120 GB.

Los datos provienen de la vista de la fase 1: 47 bins de texto con licencia abierta, unos 96B tokens únicos, con fuentes de `HuggingFaceFW/fineweb-edu`, `HuggingFaceFW/fineweb-2` y `HuggingFaceTB/finemath`, e incluyen fuentes del sector público y parlamentarias del Reino Unido y de lenguas celtas. No se documenta RLHF ni DPO: es un modelo base puro.

## Capacidades

- Generación de texto autoregresiva en inglés principalmente, con capacidad en gales, gaélico escocés, irlandés, manés, córnico y escocés en proporciones menores.
- Modelado de lenguaje y continuación de texto con contexto de 2048 tokens.
- Capacidad potencial de razonamiento y matemáticas básicas por la inclusión de FineMath en el dataset, aunque no se han medido benchmarks.
- No soporta tool calling ni function calling de forma nativa (es un base model sin ajuste por instrucciones).
- No soporta agentes ni razonamiento multi-paso de forma fiable sin post-entrenamiento.
- Sin modo thinking, sin visión, sin audio.
- No dispone de ajuste por seguridad ni filtrado de salidas.

## Casos de uso

- Investigación en scaling laws: es una celda de una escalera de modelos de 100M a 1,6B parámetros con distintos presupuestos de tokens; se usa para ajustar y validar curvas de pérdida frente a tamano y tokens, comparando la pérdida de validación de 2,3588 nats/token con las demás celdas del AR square.
- Estudio de arquitecturas de atención: la inclusión de XSA permite comparar su efecto frente a atención estándar en un régimen de cómputo controlado, con pesos que reproducen los logits del código de entrenamiento de forma bit a bit.
- Modelado de lenguas celtas de bajo recurso: sirve como base para fine-tuning en galés, gaélico escocés, irlandés, manés y córnico, aprovechando que el dataset incluye fuentes específicas de estas lenguas.
- Procesamiento de texto del sector público británico: adecuado como base para tareas de clasificación, extracción o resumen sobre documentación parlamentaria y administrativa tras un ajuste supervisado.
- Punto de partida para fine-tuning de bajo coste: con 618M parámetros y licencia Apache 2.0, se puede ajustar en una sola GPU consumer o en un nodo pequeño para tareas específicas de dominio.
- Experimentación académica reproducible: el repositorio incluye contrato de ejecución, hash sha256 del checkpoint fuente y `provenance.json`, lo que facilita la reproducibilidad en estudios comparativos.
- Generación de texto controlada en investigación: continuación de texto y evaluación de perplejidad sobre corpus de validación propios (canon-8192) para comparar metodologías de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks zero-shot en la información disponible. El autor indica explícitamente que las puntuaciones zero-shot "no se han medido todavía". El único dato de evaluación publicado es la pérdida de validación:

| Metrica | Valor |
|---|---|
| Validation loss (canon-8192, 8192 x 2048 tokens) | 2,3588 nats por token |
| Validation loss bajo PyTorch SDPA (reproduccion) | 2,3589 nats por token |
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 1,24 GB solo para pesos (617,9M parámetros x 2 bytes), más overhead de activaciones y caché KV; en la práctica cabe holgadamente en GPUs de 8 GB o menos.
- En cuantización de 8 bits: aproximadamente 0,62 GB de pesos; en 4 bits: aproximadamente 0,31 GB (no se publican cuantizaciones oficiales, pero el modelo es compatible con herramientas estándar dado su formato).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia; para entrenamiento o fine-tuning completo se recomienda al menos una A100 o H100, aunque el autor usó 2 x GH200 de 120 GB para el preentrenamiento.
- Cabe en GPU consumer: sí, en cualquier GPU con 8 GB o más en bf16, y en GPUs de 4-6 GB con cuantización.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por XSA); vLLM, llama.cpp, Ollama o TGI requerirían soporte para la arquitectura XSA, que no está garantizado en esas herramientas al no ser una arquitectura estándar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| vectabass-618m-2.18bt-base-cooled | 618M (527,7M no-embedding) | 2048 | Apache 2.0 | Base model de estudio de scaling, XSA, multilingue celta |
| Modelos tipo GPT-2 124M/355M/774M | 124M-774M | 1024 | MIT/ modificada | Referencia clasica de modelos pequenos; no comparables en datos |
| TinyLlama 1.1B | 1,1B | 2048 | Apache 2.0 | Entrenado con 3T tokens; base model mas grande y con mas datos |
| SmolLM-135M / 360M | 135M-360M | 2048 | Apache 2.0 | Modelos pequenos de Hugging Face; comparables en tamano y contexto |

La comparación cuantitativa de rendimiento no es posible porque el autor no ha publicado benchmarks zero-shot. Frente a TinyLlama o SmolLM, este modelo se distingue por su enfoque en lenguas celtas y en datos del sector público británico, y por su carácter de celda de un estudio de scaling laws más que de modelo listo para uso general.

## Limitaciones y advertencias

- Es un modelo base entrenado para un estudio de scaling, no un asistente: afirmará cosas falsas con fluidez y no está alineado.
- Contexto limitado a 2048 tokens, insuficiente para conversaciones largas o documentos extensos.
- Predominantemente inglés; las lenguas celtas están presentes en proporciones menores y su calidad no está medida.
- Sin ajuste por seguridad ni filtrado de salidas: puede generar contenido inapropiado o sesgado.
- Requiere `trust_remote_code=True` para cargar código personalizado (`modeling_vectabass.py`), lo que implica ejecutar código del repositorio y revisarlo antes de usarlo en producción.
- La arquitectura XSA no es estándar y puede no ser compatible con herramientas de inferencia optimizadas (vLLM, llama.cpp, TGI) sin adaptaciones.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está disenado para producción como asistente sin un post-entrenamiento previo.
- No se han publicado benchmarks zero-shot, por lo que no hay evidencia de rendimiento en tareas concretas.
- Riesgo de alucinación elevado por su naturaleza de base model y su limitado presupuesto de entrenamiento (2,18B tokens).

## Enlaces

- Hugging Face: https://huggingface.co/VectaBass/vectabass-618m-2.18bt-base-cooled
- Paper: pendiente de publicación ("Paper forthcoming")
- Repositorio de datos: `DATA.md` en el repositorio de Hugging Face
- Provenance: `provenance.json` en el repositorio de Hugging Face
- Isambard-AI AIRR (referencia): https://doi.org/10.48550/arXiv.2410.11199
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
