# tahamajs/llava-qwen-0.5b-preconditioned-gdn-attention-scienceqa

## Resumen

`tahamajs/llava-qwen-0.5b-preconditioned-gdn-attention-scienceqa` es un checkpoint experimental de un modelo vision-lenguaje derivado de `llava-hf/llava-interleave-qwen-0.5b-hf` mediante una técnica de "cirugía de atención" sobre el decoder. El autor sustituye el mecanismo de self-attention de 18 de las 24 capas del decoder Qwen2 por un operador denominado `PreconditionedGDNAttention` (Gated DeltaNet con precondicionamiento de curvatura), manteniendo congelados el torreón visual SigLIP, el proyector multimodal y 6 capas de atención cuadrática que actúan como anclas. El objetivo no es ofrecer un modelo de producción, sino servir de banco de pruebas reproducible para evaluar variantes de atención híbrida en modelos multimodales de pequeño tamaño.

El modelo tiene aproximadamente 0,5 mil millones de parámetros en su configuración base (Qwen2 de 24 capas, dimensión 1024, 16 cabezas, head_dim 64) y se ha afinado por destilación de representaciones sobre el subconjunto con imagen del dataset ScienceQA. El repositorio publica únicamente los pesos de atención modificados (145,39 MB en FP16) más un manifiesto quirúrgico, no los pesos completos, por lo que requiere recomponer el modelo con la herramienta NeuralOps a partir del checkpoint base.

Su relevancia es acotada pero clara: documenta de forma transparente el coste y la ganancia de reemplazar atención cuadrática por atención lineal con compuertas en un VLM pequeño, con métricas declaradas por el autor (41,25 % de accuracy y perplejidad 2,70 en ScienceQA) y telemetría de entrenamiento completa. Las cifras no están verificadas de forma independiente y el modelo solo declara soporte de inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (SigLIP vision tower congelado + proyector MLP de 2 capas + decoder Qwen2 de 24 capas) con atención híbrida: `preconditioned_gdn_attention` en 18/24 capas y atención cuadrática en 6 capas ancla [3, 7, 11, 15, 19, 23] |
| Parametros totales | Aproximadamente 0,5 B (modelo base `llava-interleave-qwen-0.5b-hf`) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos publicados están en FP16; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (delta de atención en FP16, `attention_only_fp16`) + `surgical_manifest.json` (schema `neuralops.surgery/v2`) |

## Arquitectura y entrenamiento

La arquitectura parte de LLaVA-Interleave-Qwen-0.5B: un torreón visual SigLIP de 27 capas congelado, un proyector MLP de dos capas y un decoder Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas y head_dim 64. La modificación quirúrgica sustituye la self-attention en 18 de las 24 capas del decoder por `PreconditionedGDNAttention`, un operador de la familia de atención con compuertas que aplica un precondicionamiento de curvatura empírica (covarianza diagonal) antes de la actualización de estado recurrente: `P_t = (diag(s_t) + λI)^(-1/2)`, seguido de una actualización tipo DeltaNet `S_t = α_t · S_{t-1}(I − β_t · k̃_t k̃_tᵀ) + β_t · k̃_t v_tᵀ`. Se conservan 6 capas con atención cuadrática como anclas para preservar capacidad de recuperación exacta. La configuración híbrida se etiqueta como `hybrid_3_1`.

El entrenamiento se realizó por destilación de representaciones en dos etapas (40 + 74 pasos de optimización, 114 en total) sobre el subconjunto con imagen de ScienceQA, usando la arquitectura de caché offline de representaciones de NeuralOps, que permite mantener al profesor con 0 MB de VRAM en GPU. Todo el proceso se ejecutó en una única RTX 3090 (24 GB) durante 120,9 s, con un pico de 14.849 MB de VRAM. Solo se guardaron los pesos de atención modificados y los layernorms del decoder; el torreón visual, el proyector, los MLP, los embeddings y las capas ancla quedan excluidos del artefacto y deben tomarse del modelo base. No se documenta el número total de tokens de entrenamiento ni la composición exacta del dataset más allá de la referencia a ScienceQA.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) en formato conversacional.
- Respuesta a preguntas visuales de tipo STEM, especialmente sobre el subconjunto con imagen de ScienceQA.
- Razonamiento multimodal de un solo turno o multiturno corto mediante plantilla de chat (`chat_template.json` incluido).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales: no se declaran modos de pensamiento, visión adicional, audio ni decodificación especulativa.
- Al ser un checkpoint de investigación centrado en atención, su comportamiento fuera de ScienceQA no está caracterizado.

## Casos de uso

- Investigación en mecanismos de atención eficiente: el checkpoint permite comparar directamente `preconditioned_gdn_attention` frente a atención cuadrática en un VLM de 0,5 B, usando las 6 capas ancla como control interno y el manifiesto quirúrgico para reproducir la topología.
- Reproducción de experimentos de destilación: la telemetría publicada (114 pasos, 120,9 s, 14.849 MB de pico) permite replicar el pipeline de NeuralOps con caché offline de representaciones en una única GPU de consumo.
- Evaluación de VQA científica en entornos educativos de investigación: útil para medir la degradación de un modelo pequeño al sustituir atención cuadrática por lineal en preguntas con diagramas STEM, con la referencia del profesor (63,75 %) como techo.
- Prototipado de asistentes de apoyo al estudio de ciencias: con 0,5 B de parámetros y contexto corto, encaja en demos locales que respondan preguntas sobre figuras de ScienceQA, siempre que se acepte la precisión limitada del 41,25 %.
- Estudio de compresión de artefactos: el delta de 145,39 MB frente a los 1,66 GB del base (91,5 % de reducción) sirve como caso práctico de serialización selectiva de pesos para pipelines de distribución de modelos.
- Benchmarking de operadores en la librería NeuralOps: el checkpoint actúa como fixture de pruebas para validar la integración de `neuralops/layers/gated/flagship_fla.py` y el esquema `neuralops.surgery/v2` en un modelo multimodal real.
- Análisis de robustez de atención híbrida: comparar el rendimiento pre-KD (32,50 %) y post-KD (41,25 %) permite estudiar cuánto del conocimiento visual se recupera solo reentrenando atención y layernorms.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), sobre ScienceQA (subconjunto con imagen, validación):

| Métrica | Profesor (base) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 32,50 | 41,25 | +8,75 |
| Perplejidad (PPL) | 2,45 | 3,56 | 2,70 | −0,86 |

Telemetría de entrenamiento declarada: 114 pasos de optimización (etapa 1: 40; etapa 2: 74), 120,9 s de duración total, pico de 14.849 MB de VRAM en una RTX 3090, timestamp 2026-11-11T08:46:53Z. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base completo en FP16 ocupa aproximadamente 1,66 GB según la model card; con overhead de activaciones y caché KV, una GPU de 8 GB es suficiente para inferencia en FP16. El delta de atención publicado pesa 145,39 MB, pero no es autosuficiente.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16; RTX 3090, RTX 4090, A100 o H100 son holgadas para este tamaño. El propio autor usó una RTX 3090 para el entrenamiento.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y equivalentes con 8 GB o más.
- Opciones de despliegue: la librería declarada es `neuralops`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y al publicarse solo el delta de atención en safetensors requiere recomposición con NeuralOps y el checkpoint base `llava-hf/llava-interleave-qwen-0.5b-hf`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ScienceQA (img, val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/llava-qwen-0.5b-preconditioned-gdn-attention-scienceqa` | ~0,5 B | no disponible | 41,25 % acc / 2,70 PPL (declarado) | MIT | Delta de atención (145,39 MB) + manifiesto |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (base/profesor) | ~0,5 B | no disponible | 63,75 % acc / 2,45 PPL (declarado por el autor) | no disponible en la información | Pesos completos (~1,66 GB FP16) |
| Otros VLM de ~0,5 B (p. ej. variantes Qwen2-VL pequeñas) | ~0,5 B | no disponible | no disponible | no disponible | no disponible |

La comparación directa más significativa es contra su propio modelo base: la cirugía de atención reduce la accuracy en 22,5 puntos porcentuales y empeora la perplejidad en 0,25, incluso tras la destilación. No se dispone de datos de benchmarks de terceros para contextualizar estas cifras frente a otros VLM del mismo rango.

## Limitaciones y advertencias

- Pérdida sustancial de rendimiento frente al profesor: 41,25 % frente a 63,75 % de accuracy en ScienceQA, una caída de 22,5 puntos porcentuales pese al ajuste por destilación.
- Métricas no verificadas: la model card marca explícitamente `verified: false` en accuracy y perplejidad; no hay evaluación independiente.
- Artefacto incompleto: solo se publican los pesos de atención y los layernorms del decoder; sin el checkpoint base y la herramienta NeuralOps el modelo no es ejecutable.
- Idiomas: solo inglés declarado; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- Contexto: la longitud de contexto no está documentada, lo que impide planificar despliegues con ventanas largas.
- Sesgos: no se documentan análisis de sesgo; al derivar de Qwen2 y ScienceQA, hereda los sesgos de ambos, no cuantificados en la información disponible.
- Riesgo de alucinación: elevado en un modelo de 0,5 B con atención parcialmente lineal y accuracy del 41,25 % en su dominio objetivo; no apto para respuestas factuales sin verificación.
- Uso comercial: la licencia MIT lo permite, pero el estado experimental y la falta de pesos completos hacen desaconsejable su uso en producción.
- Sin soporte declarado de tool calling, agentes ni modos de razonamiento extendido.
- Naturaleza del repositorio: 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validación por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-preconditioned-gdn-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/gated/flagship_fla.py
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA (derek-thomas): https://huggingface.co/datasets/derek-thomas/ScienceQA
