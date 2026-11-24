# tahamajs/qwen-2.5-0.5b-fused-svd-kernel-wikitext2

## Resumen
`qwen-2.5-0.5b-fused-svd-kernel-wikitext2` es un checkpoint experimental de Qwen2.5-0.5B en el que el autor (tahamajs) ha sustituido quirúrgicamente 18 de las 24 capas de atención del decoder por el operador `FusedSVDKernelAttention` de la librería NeuralOps, un módulo de atención lineal basado en SVD con complejidad subcuadrática. Tras el transplante, el modelo se sometió a una destilación de conocimiento en dos etapas sobre WikiText-2 para recuperar parte de la calidad perdida.

El interés del modelo no es su rendimiento final, sino su valor como experimento reproducible de "attention surgery": documenta con telemetría detallada cómo un cambio de operador de atención degrada la perplejidad de 15,38 a 821.427,41 y cómo la destilación la recupera parcialmente hasta 364,46. Es, por tanto, una referencia útil para investigadores que estudian atención lineal, destilación de representaciones ocultas y arquitecturas híbridas en modelos compactos.

El modelo base Qwen2.5-0.5B tiene 494M parámetros y 24 capas; el checkpoint resultante declara 533.299.840 parámetros en safetensors. La licencia es MIT y la librería de carga es `neuralops`, no `transformers`, lo que condiciona su despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder híbrido: 18/24 capas con `FusedSVDKernelAttention` (atención lineal SVD) y 6/24 capas con GQA softmax nativa de Qwen2 |
| Parametros totales | 533.299.840 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-0.5B soporta 32.768 tokens, pero la model card no confirma la conservación tras la cirugía) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 completo, 1017,23 MB, más un adaptador) |
| Idiomas soportados | inglés (`en` en la model card) |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16 completo + adaptador) |

## Arquitectura y entrenamiento
El modelo parte de Qwen2.5-0.5B: 24 bloques decoder, dimensión oculta D=896, 14 cabezas de consulta y 2 cabezas KV (GQA), dimensión por cabeza 64, RoPE con theta=1.000.000. La cirugía `hybrid_3_1` sustituye la atención en los índices `[0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22]` por `FusedSVDKernelAttention` envuelto en `QwenAttentionAdapter`, y conserva GQA softmax nativa en `[3, 7, 11, 15, 19, 23]` como anclas de recuperación contextual. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansión de cabezas KV de 2 a 14 y sin duplicar la proyección de salida. El operador soporta causalidad autorregresiva, GQA, RoPE vía adaptador y despacho de kernel en tres niveles (CUDA / Triton / PyTorch).

El entrenamiento consistió en destilación de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), longitud de secuencia 512, `batch_size=8`, `grad_accum=4`, ejecutada en una RTX 3090 de 24 GB con caché offline de representaciones del profesor (0 MB de VRAM del profesor en GPU). La etapa 1 (30 % del presupuesto, 129 pasos) congeló embeddings, MLP y `lm_head`, entrenando solo atención y layernorms con AdamW (`lr=2.0e-4`, `weight_decay=0.01`, clipping 1.0) y pérdida `MSE + 0.25·(1 − cos(h_s, h_t))`. La etapa 2 (70 %, 296 pasos) ajustó de extremo a extremo los 24 flujos residuales con `lr=6.0e-5` y pérdida `MSE + 0.50·(1 − cos(h_s, h_t))`. Se usaron pesos maestros FP32 con AMP FP16 y `GradScaler`.

## Capacidades
- Generación de texto causal autorregresiva en inglés.
- Conversación multi-turno (tag `conversational` en el repositorio).
- Razonamiento y conocimiento general heredados del profesor Qwen2.5-0.5B, aunque muy degradados por la perplejidad resultante.
- Soporte de atención con GQA y RoPE preservado en las capas ancla.
- Ejecución con despacho de kernel CUDA, Triton o PyTorch puro según disponibilidad de hardware.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking.
- Capacidad multilingüe: no disponible; la model card solo declara inglés.

## Casos de uso
- Investigación en atención lineal: el checkpoint sirve como referencia reproducible para medir el coste en perplejidad de sustituir atención softmax por un operador SVD subcuadrático en un modelo de 0,5B.
- Estudio de destilación de representaciones ocultas: la telemetría de las dos etapas (129 y 296 pasos, pérdidas MSE + coseno) permite replicar y comparar protocolos de destilación con caché offline.
- Benchmark de operadores NeuralOps: útil para validar el despacho CUDA/Triton/PyTorch de `FusedSVDKernelAttention` en GPUs consumer como la RTX 3090.
- Docencia y divulgación: ejemplo didáctico de cirugía de atención híbrida 3:1 con capas ancla GQA y herencia de pesos del profesor.
- Pruebas de infraestructura de inferencia: permite evaluar cómo se comportan frameworks que no son `transformers` (la librería es `neuralops`) al cargar checkpoints safetensors personalizados.
- Exploración de arquitecturas híbridas para modelos compactos: base para experimentos que busquen reducir el coste cuadrático de atención en despliegues edge, aceptando una pérdida de calidad controlada.
- No es adecuado para producción conversacional, atención al cliente ni generación de código: la perplejidad de 364,46 frente a 15,38 del profesor indica una degradación severa.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---:|---|
| Teacher baseline (Qwen2.5-0.5B) | 15,38 | Perplejidad GQA softmax exacta, referencia |
| Student zero-shot tras cirugía (pre-KD) | 821.427,41 | Inmediatamente después del transplante 18/24 |
| Student destilado (post-KD) | 364,46 | Tras destilación en 2 etapas |
| Delta absoluto de perplejidad | −821.062,95 | Cambio logrado por la destilación |
| Reducción relativa de PPL | 99,96 % | Recuperación desde el pico post-cirugía |

Medido sobre WikiText-2 (`wikitext-2-raw-v1`, split validation) a longitud de secuencia 512, `batch_size=8`, `grad_accum=4`, en NVIDIA GeForce RTX 3090 24 GB. Los resultados están declarados por el autor y no verificados (`verified: false`). No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en FP16: aproximadamente 1,1 GB de pesos (1017,23 MB) más overhead de activaciones y caché KV; en la práctica, menos de 3 GB para secuencias cortas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; la RTX 3090 (24 GB) es la referenciada por el autor para el entrenamiento.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también en GPUs integradas con suficiente memoria compartida si se ejecuta en PyTorch puro.
- Opciones de despliegue: la librería declarada es `neuralops`; no se documenta compatibilidad directa con vLLM, llama.cpp, Ollama o TGI. El despacho de kernel permite CUDA, Triton o PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL WikiText-2 | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| `tahamajs/qwen-2.5-0.5b-fused-svd-kernel-wikitext2` | 533M | no disponible | 364,46 (post-KD) | MIT | Hugging Face, librería `neuralops` |
| `Qwen/Qwen2.5-0.5B` (profesor) | 494M | 32.768 tokens | 15,38 | Apache 2.0 | Hugging Face, `transformers` |
| `Qwen/Qwen2.5-0.5B-Instruct` | 494M | 32.768 tokens | no disponible | Apache 2.0 | Hugging Face, `transformers` |

La comparación con el profesor es la más informativa: misma familia y tamaño, pero el checkpoint quirúrgico multiplica por más de 23 la perplejidad y no declara contexto máximo. Frente a alternativas de atención lineal consolidadas (por ejemplo, Mamba o RWKV), no hay datos publicados en la información disponible.

## Limitaciones y advertencias
- Degradación severa de calidad: perplejidad de 364,46 frente a 15,38 del profesor, más de 23 veces superior.
- El checkpoint es un experimento de investigación, no un modelo listo para producción.
- Solo se declara inglés; no hay evidencia de capacidades multilingües.
- Longitud de contexto no confirmada tras la cirugía; no asumir los 32.768 tokens del modelo base.
- Riesgo elevado de alucinación y de generación incoherente por la pérdida de calidad.
- Dependencia de la librería `neuralops` y del adaptador `QwenAttentionAdapter`; la carga con `transformers` estándar no está garantizada.
- Pesos en FP16 completo más adaptador; no se publican versiones GGUF ni cuantizadas.
- Licencia MIT permite uso comercial, pero la calidad del modelo hace inviable ese escenario sin un fine-tuning adicional.
- Los benchmarks están declarados por el autor y marcados como no verificados.
- Sesgos conocidos: no documentados; hereda los del profesor Qwen2.5-0.5B, no evaluados en esta ficha.

## Enlaces
- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-fused-svd-kernel-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/svd/fused_svd_kernel.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset: https://huggingface.co/datasets/Salesforce/wikitext
