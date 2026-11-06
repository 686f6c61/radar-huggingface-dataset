# VinayRevanuru/Sapling-505M-Base

## Resumen

Sapling-505M-Base es un modelo de lenguaje base de 505.483.776 parámetros entrenado desde cero (no es un fine-tune ni una destilación de otro modelo) por VinayRevanuru. Adopta la arquitectura densa de Qwen3 con tokenizador propio de 32.768 entradas y fue preentrenado con 5.000 millones de tokens en inglés, en una mezcla 80/20 de FineWeb-Edu y Cosmopedia v2. Se distribuye bajo licencia Apache 2.0 y pesos FP32 en safetensors.

El modelo resuelve un problema concreto: servir como referencia reproducible y de bajo coste para investigación sobre preentrenamiento de modelos pequeños, ablaciones de tokenizador y experimentos de ajuste fino. Su entrenamiento completo costó aproximadamente 81 GPU-horas en 8 A100 de 80 GB (unas 10,1 horas de reloj), lo que lo convierte en un banco de pruebas asequible para estudiar dinámicas de escalado y mezclas de datos.

Es relevante ahora porque la comunidad de modelos pequeños (sub-1B) está creciendo con propuestas como SmolLM2 o Qwen3-0.6B, y Sapling aporta una pieza totalmente abierta y documentada (incluye `training_summary.json` con configuración, manifiesto de datos y hash del tokenizador) que permite auditar cada decisión de entrenamiento. No obstante, es un modelo de completado de texto, no un asistente: no sigue instrucciones ni mantiene conversaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM densa: GQA, QK-Norm, RMSNorm, RoPE, SwiGLU |
| Parametros totales | 505.483.776 (embeddings atados) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (el repo solo publica pesos FP32 safetensors) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP32, ≈2,0 GB) |

Detalle interno: 30 capas, anchura 1.024, FFN 3.072, 16 cabezas de consulta y 8 de clave/valor con dimensión de cabeza 128, RoPE θ = 1.000.000. Reparto de parámetros: feed-forward 283,1M (56%), atención 188,7M (37%), embedding atado 33,6M (7%). Tokenizador BPE byte-level de 32.768 entradas entrenado desde cero (`<|bos|>`=1, `<|eos|>`=2, `<|pad|>`=0).

## Arquitectura y entrenamiento

Transformer decoder-only denso con la pila de Qwen3: atención con grouped-query attention (16 cabezas de consulta, 8 de clave/valor), QK-Norm, RMSNorm pre-norm, RoPE con theta de 1.000.000 y activación SwiGLU en el FFN. Los embeddings de entrada y salida están atados, lo que reduce el recuento de parámetros. El tokenizador es propio, entrenado desde cero, y no reutiliza el de Qwen3.

Datos y procedimiento: 5.000.396.800 tokens vistos en 76.300 pasos de optimizador, con batch global de 65.536 tokens (32 × 2.048). Mezcla 80% FineWeb-Edu (`sample-10BT`) y 20% Cosmopedia v2 (`smollm-corpus`, campo `text`), medida por tokens consumidos con el tokenizador propio. Se retuvo aproximadamente el 0,1% de documentos por fuente mediante hash determinista antes del entrenamiento del tokenizador y del empaquetado. Los documentos se unieron con separadores EOS y se empaquetaron en secuencias completas de 2.048 tokens sin padding ni truncado, almacenadas en shards de 52,4M tokens leídos en intercalado determinista 4:1 FineWeb:Cosmopedia; cada shard se leyó como máximo una vez. Optimizador AdamW fusionado (β = 0,9/0,95, ε = 1e-8, weight decay 0,1 excluyendo normas y sesgos), LR pico 3e-4 con warmup lineal del 1% y decaimiento coseno, clipping de gradiente 1,0, autocast BF16 con pesos maestros FP32, PyTorch DDP en 8 × A100 80GB sobre Modal, torch 2.6.0 y transformers 4.51.3.

Innovación destacable y caveat importante: el schedule coseno estaba configurado para una carrera de 7B tokens y el entrenamiento se detuvo en 5B, por lo que el checkpoint no está completamente annealed; el LR en el paso final era ≈8,2e-5 frente al suelo previsto de 3e-5. La pérdida de entrenamiento bajó de 10,2 (inicialización aleatoria; ln 32.768 ≈ 10,4) a ≈2,75 (media de 100 pasos). Pérdida mediana por fuente: FineWeb-Edu 3,45 a ~0,3B tokens y 2,83 a ~5,0B; Cosmopedia v2 2,59 y 1,72 respectivamente. No se registraron pérdidas de validación retenida para este checkpoint.

## Capacidades

- Generación de texto por completado: continúa un prefijo dado; no es un modelo de chat ni sigue instrucciones.
- Coherencia local y fluidez en inglés gracias a los datos educativos y sintéticos de estilo libro de texto.
- Capacidad limitada de razonamiento factual: produce afirmaciones fluidas pero frecuentemente falsas (el propio autor documenta que responde "Mercury" como planeta más grande).
- Sin soporte de tool calling ni function calling.
- Sin soporte de agentes ni razonamiento multi-paso.
- Sin capacidades multimodales (ni visión ni audio).
- Sin modo de razonamiento explícito (thinking mode).
- Multilingüe: no; solo inglés.
- Código y matemáticas: débiles, por escasez de estos dominios en el corpus de entrenamiento.
- Capacidad de servir como base para ajuste fino supervisado o LoRA (no incluido en este repo).

## Casos de uso

- Investigación sobre preentrenamiento de modelos pequeños: reproducir o variar la receta (5B tokens, 8 × A100, 81 GPU-horas) para estudiar curvas de pérdida y efectos de la mezcla de datos con un coste asequible.
- Ablaciones de tokenizador: al incluir un tokenizador propio de 32.768 entradas y su hash sha256 (`f7d39923…0be0984`), permite comparar el impacto del vocabulario frente a tokenizadores de referencia como el de Qwen3 o SmolLM.
- Punto de partida para instruction tuning: el modelo puede ajustarse con SFT o LoRA para experimentar con alineación en modelos sub-1B, partiendo de una base ya preentrenada y documentada.
- Baseline en evaluaciones de modelos pequeños: sirve como referencia neutra en benchmarks de perplejidad y generación frente a SmolLM2-360M o Qwen3-0.6B.
- Docencia y formación: ilustra de forma tangible conceptos como GQA, QK-Norm, RoPE, empaquetado de secuencias y decaimiento coseno con un checkpoint de 2 GB que cabe en cualquier portátil.
- Generación de texto creativo de baja exigencia factual: completado de párrafos, sinopsis o descripciones donde la fluidez importa más que la veracidad, siempre con revisión humana.
- Estudio de fallos y alucinación: el propio autor incluye ejemplos de errores deliberados, lo que lo hace útil para analizar cómo y cuándo un modelo pequeño confabula.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pérdidas de entrenamiento (no de validación retenida) y ejemplos cualitativos de generación.

| Fuente | Pérdida a ~0,3B tokens | Pérdida a ~5,0B tokens |
|---|---|---|
| FineWeb-Edu | 3,45 | 2,83 |
| Cosmopedia v2 | 2,59 | 1,72 |

Pérdida global: de 10,2 en inicialización aleatoria a ≈2,75 (media de 100 pasos) al final del entrenamiento.

## Requisitos de hardware

- VRAM para inferencia en FP32: ≈2,0 GB de pesos más overhead de activaciones y caché KV; viable en GPUs consumer con 4-6 GB (GTX 1650, RTX 3050, RTX 4060).
- En BF16/FP16 (conversión manual): ≈1,0-1,1 GB de pesos; cabe en GPUs integradas con suficiente memoria compartida o en iGPUs recientes.
- Cuantización a 8 bits: ≈0,5 GB; a 4 bits: ≈0,3 GB, aunque el repo no publica pesos cuantizados y habría que generarlos.
- GPU recomendadas para entrenamiento o ajuste fino: A100 80GB (la configuración original usó 8), H100, o RTX 4090/3090 para fine-tuning con LoRA.
- Despliegue: transformers (referencia), text-generation-inference (el repo declara `endpoints_compatible` y `text-generation-inference`), vLLM, llama.cpp u Ollama previa conversión a GGUF.
- Latencia y throughput: no disponible para inferencia; en entrenamiento se midió ≈142.000 tokens/s con 8 × A100 80GB (≈81 GPU-horas, ≈10,1 horas de reloj).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Sapling-505M-Base | 505M | 2.048 | en | Apache 2.0 | Entrenado desde cero con 5B tokens; sin instruct |
| Qwen3-0.6B | ≈600M | 32.768 | multilingüe | Apache 2.0 | Arquitectura de referencia; contexto mucho mayor y versión instruct disponible |
| SmolLM2-360M | ≈360M | 8.192 | en (principalmente) | Apache 2.0 | Entrenado con ≈4T tokens; versión instruct disponible |
| SmolLM2-1.7B | ≈1,7B | 8.192 | en (principalmente) | Apache 2.0 | Alternativa de mayor tamaño con más datos de entrenamiento |

La comparación es orientativa: Sapling se entrena con un orden de magnitud menos de tokens (5B frente a los ≈4T de SmolLM2) y con contexto de 2.048 tokens, muy inferior al de Qwen3-0.6B. No hay datos de benchmarks públicos que permitan comparar rendimiento de forma directa.

## Limitaciones y advertencias

- No es fiable factualmente: genera afirmaciones fluidas pero falsas (planetas incorrectos, puntos de ebullición erróneos, eventos inventados).
- Repetición: la decodificación greedy entra en bucles con facilidad; se recomienda muestreo con `temperature` ≈0,8, `top_p` ≈0,9 y `repetition_penalty` ≈1,1.
- Débil en código y matemáticas por escasez de estos dominios en el corpus.
- Solo inglés y contexto de 2.048 tokens, insuficiente para tareas de contexto largo.
- Sin ajuste de seguridad: puede reproducir sesgos y errores presentes en texto web y sintético; no debe usarse para decisiones sobre personas ni en entornos de alto riesgo.
- Checkpoint no completamente annealed: el schedule coseno estaba configurado para 7B tokens y se detuvo en 5B con LR final ≈8,2e-5; un cooldown corto probablemente reduciría la pérdida.
- No se registraron pérdidas de validación retenida, lo que limita la evaluación objetiva de generalización.
- No es un modelo de instrucciones ni de chat; usarlo como asistente requiere ajuste fino previo.
- Licencia Apache 2.0 permite uso comercial, pero la falta de fiabilidad factual y de seguridad hace desaconsejable su uso en producción sin supervisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VinayRevanuru/Sapling-505M-Base
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset SmolLM corpus (Cosmopedia v2): https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Repositorio de Qwen3 (arquitectura de referencia): https://github.com/QwenLM/Qwen3
- SmolLM2 (modelo comparable): https://huggingface.co/HuggingFaceTB/SmolLM2-360M
- Qwen3-0.6B (modelo comparable): https://huggingface.co/Qwen/Qwen3-0.6B
- Plataforma de entrenamiento Modal: https://modal.com
