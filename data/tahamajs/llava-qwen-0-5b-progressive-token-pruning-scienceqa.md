# tahamajs/llava-qwen-0.5b-progressive-token-pruning-scienceqa

## Resumen

`tahamajs/llava-qwen-0.5b-progressive-token-pruning-scienceqa` es un checkpoint multimodal derivado de `llava-hf/llava-interleave-qwen-0.5b-hf`, publicado por el autor tahamajs dentro del proyecto NeuralOps. No es un modelo entrenado desde cero, sino el resultado de una "cirugía de atención" sobre el modelo base: se sustituye el mecanismo de self-attention estándar en 18 de las 24 capas del decodificador Qwen2 por un operador denominado `ProgressiveTokenPruning` (PTP v2), que reduce dinámicamente el conjunto de claves y valores antes de calcular la atención. El objetivo es comprimir el coste computacional del bloque de atención manteniendo, mediante destilación de conocimiento, una parte del rendimiento del profesor original.

El modelo conserva la arquitectura LLaVA-Interleave: torre visual SigLIP congelada (27 capas), proyector MLP de dos capas y decodificador Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas y `head_dim` 64. El checkpoint distribuido no contiene los pesos completos, sino únicamente los deltas quirúrgicos en FP16 (`attention_weights.safetensors`, 372,89 MB), lo que reduce el artefacto un 78,1 % respecto al modelo base de 1,66 GB.

La relevancia de esta ficha es acotada: se trata de un experimento de investigación sobre eficiencia atencional, evaluado en un subconjunto de ScienceQA, no de un modelo listo para producción. Su interés reside en el enfoque metodológico (poda progresiva de tokens con garantía de causalidad) y en los datos de telemetría de entrenamiento publicados, más que en su rendimiento absoluto, que queda muy por debajo del profesor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LLaVA-Interleave: torre visual SigLIP congelada + proyector MLP (2 capas) + decodificador Qwen2 (24 capas, D=1024, H=16, head_dim=64) con atención PTP v2 en 18/24 capas |
| Parámetros totales | no disponible (el artefacto publicado contiene solo pesos de atención; el modelo base ronda los 0,5B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en FP16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, FP16, solo atención) + `surgical_manifest.json` |

## Arquitectura y entrenamiento

El modelo parte de LLaVA-Interleave-Qwen-0.5B y aplica una intervención quirúrgica sobre el mecanismo de atención: en 18 de las 24 capas del decodificador (esquema `hybrid_3_1`) se reemplaza la self-attention cuadrática por `ProgressiveTokenPruning` (familia `adaptive`). El operador puntúa cada token con una red de scoring por capa, fuerza la retención del primer token (BOS/CLS), selecciona `k = ceil(L · keep_ratio)` tokens y calcula la atención solo sobre ese subconjunto reducido de claves y valores. En el codificador (bidireccional) usa top-k por score; en el decodificador (causal) retiene el primer token más los últimos `k-1`, garantizando que no haya fuga de información futura ni pérdida de claves en el paso 0. Si no se produce poda (`k == L`) y no hay caché, recurre a la ruta rápida SDPA. Se mantienen intactas 6 capas ancla cuadráticas en los índices `[3, 7, 11, 15, 19, 23]`, así como la torre visual SigLIP, el proyector, los MLP y los embeddings.

El ajuste se realizó mediante destilación de conocimiento con la arquitectura de caché offline de representaciones de NeuralOps, sobre una única NVIDIA RTX 3090 (24 GB) y sin VRAM de profesor en GPU. El entrenamiento constó de 135 pasos (16 en etapa 1, 119 en etapa 2), duró 120,2 segundos y alcanzó un pico de 15.329 MB de VRAM. El conjunto de evaluación es el subconjunto de ScienceQA con imágenes (split de validación). No se especifica el número de tokens de entrenamiento ni la composición detallada del dataset más allá de `derek-thomas/ScienceQA`.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) en inglés.
- Respuesta a preguntas visuales de tipo STEM (ciencias, matemáticas básicas) sobre el subconjunto de ScienceQA con imágenes.
- Razonamiento multimodal de una sola vuelta; el formato de chat está incluido (`chat_template.json`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (thinking mode, audio, vídeo): no disponibles.
- Eficiencia atencional: poda progresiva de tokens con garantía de causalidad en el decodificador.

## Casos de uso

- Investigación sobre eficiencia atencional: sirve como referencia reproducible para estudiar el impacto de la poda progresiva de tokens en un VLM pequeño, ya que publica manifiesto quirúrgico, métricas de entrenamiento y telemetría de hardware.
- Evaluación comparativa de operadores de atención: permite contrastar `ProgressiveTokenPruning` frente a atención cuadrática en el mismo modelo base y dataset, con resultados de accuracy y perplejidad declarados.
- Prototipado de asistentes educativos STEM en inglés: el modelo responde preguntas de ciencias con imagen, aunque su accuracy del 41,25 % lo limita a entornos de prueba y no a tutela real.
- Destilación de modelos pequeños en hardware de consumo: el pipeline completo (135 pasos, 120 s, una RTX 3090) es un ejemplo práctico de cómo ajustar un VLM con recursos limitados.
- Estudio de compresión de artefactos: el delta de 372,89 MB frente a 1,66 GB del base ilustra técnicas de serialización selectiva de pesos para distribución ligera.
- Base para experimentos de poda en otros VLMs: el manifiesto `neuralops.surgery/v2` y el formato de pesos por capas facilitan trasladar la metodología a otros modelos LLaVA.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Métrica | Profesor (baseline) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) en ScienceQA (subconjunto con imagen, validación) | 63,75 | 30,00 | 41,25 | +11,25 |
| Perplejidad (PPL) | 2,45 | 4,63 | 1,82 | -2,81 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El artefacto publicado pesa 372,89 MB en FP16 y el modelo base completo 1,66 GB, por lo que la inferencia completa en FP16 debería caber holgadamente en GPUs de consumo con 8 GB o más, aunque el dato no está confirmado.
- GPU recomendadas: el autor solo documenta entrenamiento en NVIDIA RTX 3090 (24 GB). Para inferencia se puede asumir cualquier GPU con suficiente VRAM para el modelo base, pero no hay cifras publicadas.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño del modelo base (≈0,5B parámetros), aunque no se aporta medición.
- Opciones de despliegue: la librería declarada es `neuralops`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI. El checkpoint contiene solo pesos de atención, por lo que requiere el modelo base para reconstruir el modelo completo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/llava-qwen-0.5b-progressive-token-pruning-scienceqa` | ≈0,5B (base) | no disponible | 41,25 % accuracy en ScienceQA (subconjunto con imagen) | MIT | Hugging Face, solo pesos de atención |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | ≈0,5B | no disponible | 63,75 % accuracy en el mismo subconjunto (según el autor) | no disponible en la información | Hugging Face |
| Otros VLMs pequeños comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con alternativas adicionales de la misma categoría.

## Limitaciones y advertencias

- Rendimiento muy inferior al profesor: 41,25 % frente a 63,75 % de accuracy en ScienceQA, una caída de 22,5 puntos porcentuales pese a la destilación.
- El checkpoint no es autónomo: contiene solo los pesos de atención modificados (`attention_weights.safetensors`) y requiere el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` para funcionar.
- Idiomas: solo inglés declarado; no hay soporte multilingüe.
- Sesgos: no documentados por el autor; al derivar de un VLM pequeño entrenado con datos web, es esperable heredar sesgos del modelo base, pero no se aporta análisis.
- Riesgo de alucinación: no cuantificado; en tareas STEM con imágenes, un accuracy del 41,25 % implica una tasa de error elevada.
- Contexto: longitud de contexto no publicada; no se garantiza manejo de conversaciones largas.
- Licencia MIT permite uso comercial, pero el modelo base puede tener sus propias condiciones que conviene revisar por separado.
- Los resultados de benchmarks están marcados como no verificados (`verified: false`) y provienen únicamente del autor.
- Sin datos de latencia, throughput ni compatibilidad con frameworks de despliegue estándar; no recomendado para producción sin evaluación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-progressive-token-pruning-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Implementación del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/adaptive/progressive_token_pruning.py
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
