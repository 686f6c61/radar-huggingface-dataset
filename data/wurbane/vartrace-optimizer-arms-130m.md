# WUrbane/vartrace-optimizer-arms-130m

## Resumen

vartrace-optimizer-arms-130m es una colección de modelos de lenguaje de 130 millones de parámetros publicada por el usuario WUrbane en Hugging Face. No se trata de un único modelo, sino de un conjunto de 36 subcarpetas, cada una con un modelo completo entrenado desde cero (o afinado desde una base preentrenada del propio autor, `OptimizerStudy/adamw_*` o `OptimizerStudy/muon_*`) con el objetivo de estudiar empíricamente el comportamiento del optimizador Muon frente a AdamW. Cada subcarpeta corresponde a un "brazo" experimental distinto: el conjunto de matrices que Muon actualiza (atención, FFN, proyecciones q/k/v/o, capas pares, etc.) o una variante espectral del update.

El interés del artefacto es fundamentalmente metodológico y de investigación: permite comparar, con el mismo presupuesto de entrenamiento (682 pasos, precisión fp32, semilla y rotación fijas `k0 / 20261021`, hardware H200), cómo cambia el resultado según qué componentes reciben el update de Muon y cuál es la forma espectral de dicho update. Los learning rates difieren entre familias (0.001 para AdamW, 0.0003 para Muon, y valores reducidos en los brazos `none`), lo que debe tenerse en cuenta al interpretar cualquier comparación.

Por su tamaño (130M), su naturaleza de checkpoint de investigación y la ausencia de una model card con datos de rendimiento, idiomas o licencia, no está pensado como modelo de producción, sino como material reproducible para estudiar dinámicas de optimización en transformers pequeños. El repo ocupa 38,3 GB, coherente con 36 checkpoints en fp32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM); detalles de capas y dimensiones no disponibles |
| Parametros totales | 130M (por submodelo) |
| Parametros activos | no disponible (no es MoE según la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

Cada subcarpeta contiene un modelo completo con su propia model card y un fichero `EXPORT.json` con hiperparámetros, hashes y modelo base. La familia se organiza en dos ejes: por un lado, el optimizador del preentrenamiento base (AdamW o Muon); por otro, el "brazo" que define qué matrices actualiza Muon (`all`, `attn`, `attn_down`, `down`, `even_layers`, `ffn`, `ffn_every3`, `gate`, `gate_up`, `k`, `o`, `q`, `qk`, `up`, `v`, `vo`, `vo_ffn`) o el brazo espectral. El brazo `none` actúa como control con learning rate muy reducido (0.0001 en AdamW, 3e-05 en Muon), presumiblemente para medir el efecto de no aplicar el update en esas matrices.

Todos los entrenamientos usan 682 pasos, matmul en fp32, semilla/rotación `k0 / 20261021` y se ejecutaron en GPUs H200. El learning rate principal es 0.001 para la familia AdamW y 0.0003 para la familia Muon. La innovación técnica central es el uso de Muon (optimizador con ortogonalización del update vía iteraciones de Newton-Schulz, aplicable solo a matrices 2D) restringido a subconjuntos de parámetros, lo que permite aislar qué componentes se benefician de su dinámica espectral. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO.

## Capacidades

- Generación de texto autoregresiva (causal LM) mediante `AutoModelForCausalLM`.
- Razonamiento y generación de código: no documentado explícitamente; al ser un modelo de 130M entrenado pocos pasos, se espera capacidad muy limitada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Uso previsto real: servir como checkpoint de investigación para estudiar Muon frente a AdamW y la contribución de cada subconjunto de matrices.

## Casos de uso

- Investigación sobre optimizadores: comparar los 36 brazos para determinar qué componentes (atención, FFN, proyecciones q/k/v/o) se benefician más del update de Muon, manteniendo fijos pasos, semilla y precisión.
- Reproducibilidad de experimentos: cada subcarpeta incluye `EXPORT.json` con hiperparámetros y hashes, lo que permite replicar exactamente el entrenamiento o auditar diferencias entre brazos.
- Estudio de la forma espectral del update: los brazos espectrales permiten analizar cómo la ortogonalización de Muon afecta al espectro de los pesos y a la convergencia en modelos pequeños.
- Ablación de learning rate: comparar los brazos `none` (LR reducido) con los brazos activos para aislar el efecto del optimizador frente al del LR.
- Docencia y formación: modelos de 130M que caben en una sola GPU consumer permiten ilustrar dinámicas de optimización en cursos de entrenamiento de LLMs.
- Base para fine-tuning controlado: partir de un brazo concreto (por ejemplo `pretrain-muon_arm-attn`) como inicialización para estudiar cómo la elección de optimizador en preentrenamiento afecta al fine-tuning posterior.
- Benchmarking de infraestructura: medir throughput y estabilidad numérica en fp32 con distintos subconjuntos de parámetros actualizados por Muon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: ~0,52 GB solo para pesos (130M × 4 bytes), más overhead de activaciones y KV cache; en la práctica cabe holgadamente en cualquier GPU con ≥4 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4090 24 GB) es suficiente; los entrenamientos originales se hicieron en H200.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs con ≥4 GB de VRAM.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained(repo, subfolder=...)`; compatible con `text-generation-inference` y `vLLM` en principio, aunque no se documenta soporte explícito; llama.cpp/Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vartrace-optimizer-arms-130m | 130M | no disponible | Estudio de Muon vs AdamW (36 brazos) | no disponible | Hugging Face |
| Pythia-160M (EleutherAI) | 160M | 2048 | Suite de investigación con checkpoints intermedios | Apache 2.0 | Hugging Face |
| GPT-2 small (OpenAI) | 124M | 1024 | Modelo de referencia decoder-only | MIT | Hugging Face |
| OPT-125M (Meta) | 125M | 2048 | Decoder-only con model card completa | OPT-175B License | Hugging Face |

La comparación con Pythia, GPT-2 y OPT es solo orientativa por tamaño: vartrace no compite en capacidad sino en propósito (ablation de optimizador). No se dispone de benchmarks que permitan comparar rendimiento real.

## Limitaciones y advertencias

- No es un modelo de producción: 130M parámetros y 682 pasos de entrenamiento implican una capacidad lingüística muy limitada.
- Ausencia de model card sustantiva: no se documentan dataset, tokens, idiomas, contexto ni evaluación, lo que impide caracterizar sesgos o calidad.
- Licencia no especificada: no se puede asumir uso comercial; debe contactarse con el autor antes de cualquier despliegue.
- Riesgo elevado de alucinación y salidas incoherentes por el escaso entrenamiento.
- El repo de 38,3 GB contiene 36 checkpoints en fp32; descargar el repo completo es costoso y probablemente innecesario si solo se quiere un brazo (usar `subfolder`).
- Los learning rates difieren entre familias (0.001 vs 0.0003) y los brazos `none` usan LR mucho menor, por lo que comparaciones ingenuas entre brazos pueden confundir el efecto del optimizador con el del LR.
- No hay garantía de compatibilidad con pipelines estándar más allá de `transformers`; el pipeline no está declarado en el repo.
- Fechas de creación y actualización (2026) y nombre del autor sugieren un artefacto de investigación personal sin mantenimiento garantizado.

## Enlaces

- Hugging Face: https://huggingface.co/WUrbane/vartrace-optimizer-arms-130m
- Modelos base referenciados en la model card: `OptimizerStudy/adamw_*` y `OptimizerStudy/muon_*` (no se proporcionan URLs directas en la información disponible)
- Paper, blog, repositorio o demo: no disponibles en la información proporcionada.
