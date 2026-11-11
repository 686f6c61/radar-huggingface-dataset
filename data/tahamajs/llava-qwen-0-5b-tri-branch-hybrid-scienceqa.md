# tahamajs/llava-qwen-0.5b-tri-branch-hybrid-scienceqa

## Resumen

`llava-qwen-0.5b-tri-branch-hybrid-scienceqa` es un checkpoint experimental publicado por el usuario tahamajs dentro del proyecto NeuralOps, un "Attention Surgery Zoo" que sustituye mecanismos de atención estándar por operadores alternativos en modelos existentes. En este caso, el modelo parte de `llava-hf/llava-interleave-qwen-0.5b-hf`, un VLM de 0.5B parámetros (torre visual SigLIP congelada, proyector MLP de 2 capas y decodificador Qwen2 de 24 capas), y reemplaza la atención cuadrática en 18 de las 24 capas del decodificador por el operador `TriBranchHybridAttention` (familia `hybrid`, variante `hybrid_3_1`). Las 6 capas restantes, en los índices `[3, 7, 11, 15, 19, 23]`, se mantienen como anclas cuadráticas.

El problema que aborda es la reducción del coste computacional de la atención en modelos multimodales pequeños mediante "cirugía" de capas y destilación de conocimiento desde el modelo profesor original. El resultado es un artefacto de solo 97,40 MB (frente a 1,66 GB del base en FP16), un 94,3% más pequeño, que conserva parcialmente las capacidades de razonamiento visual sobre ScienceQA. No es un modelo de propósito general: es una pieza de investigación reproducible sobre operadores de atención alternativos.

Es relevante ahora por su enfoque metodológico (atención híbrida + KD sobre un VLM compacto) más que por su rendimiento absoluto, que queda muy por debajo del profesor (44,38% frente a 63,75% de accuracy en ScienceQA). El checkpoint se distribuye con licencia MIT y está pensado para experimentación, no para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (SigLIP vision tower + MLP projector + Qwen2 decoder) con atención híbrida `TriBranchHybridAttention` en 18/24 capas |
| Parametros totales | 0.5B (modelo base); el artefacto guarda solo pesos de atención y layernorms modificados (534 tensores, 97,40 MB en FP16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en FP16 `attention_only_fp16`) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`), más `surgical_manifest.json`, `config.json` y tokenizer BPE |

## Arquitectura y entrenamiento

El modelo base es LLaVA-Interleave-Qwen-0.5B: torre visual SigLIP de 27 capas congelada, proyector MLP de 2 capas y decodificador Qwen2 de 24 capas con dimensión oculta D=1024, 16 cabezas y head_dim=64. Sobre esta arquitectura, NeuralOps aplica una sustitución de atención en 18 de las 24 capas del decodificador por `TriBranchHybridAttention` (registro `tri_branch_hybrid`, familia `hybrid`, variante `hybrid_3_1`). Las capas `[3, 7, 11, 15, 19, 23]` se mantienen cuadráticas como anclas. La torre visual, el proyector, los MLP del decodificador y los embeddings quedan congelados y excluidos del artefacto guardado.

El entrenamiento se realizó en dos etapas (86 + 123 = 209 pasos de optimización) sobre una única NVIDIA RTX 3090 de 24 GB, con un pico de 16.953 MB de VRAM y una duración total de 120,2 segundos. Se usó destilación de conocimiento desde el modelo profesor sobre el subconjunto de ScienceQA con imágenes (split de validación). Los resultados de la destilación son: accuracy del 30,63% en zero-shot antes de KD, 44,38% tras KD, frente al 63,75% del profesor; la perplejidad baja de 4,16 a 3,19 (profesor: 2,45). No se documenta el número de tokens de entrenamiento ni la composición exacta del dataset más allá de `derek-thomas/ScienceQA`.

## Capacidades

- Respuesta a preguntas visuales (VQA) sobre imágenes con contenido STEM, en formato de elección múltiple por letra de opción.
- Generación de texto condicionada a imagen mediante el pipeline `image-text-to-text`.
- Razonamiento multimodal básico limitado al dominio de ScienceQA (ciencias y matemáticas escolares con figura).
- Soporte de plantilla de chat (`chat_template.json` incluido) para conversaciones de un turno con imagen.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés.
- Modo thinking, visión adicional, audio: no disponible.

## Casos de uso

- Investigación sobre operadores de atención alternativos: sirve como checkpoint de referencia para reproducir el experimento `tri_branch_hybrid` y comparar curvas de KD frente a atención cuadrática.
- Estudio de compresión extrema de VLMs: el artefacto de 97,40 MB permite analizar cuánta capacidad de razonamiento visual se conserva al guardar solo pesos de atención modificados.
- Docencia y divulgación sobre atención híbrida: útil para ilustrar en un aula o tutorial cómo se sustituyen capas de atención y qué impacto tiene en accuracy y perplejidad.
- Baseline para fine-tuning en dominios STEM: al ser un VLM de 0.5B con licencia MIT, se puede partir de él para ajustar tareas de VQA científica con recursos muy limitados (cabe en una RTX 3090).
- Pruebas de pipelines de inferencia con `neuralops.hub`: validar la API `load_surgeried_model` y el formato `neuralops.surgery/v2` en entornos de CI.
- Evaluación de robustez de la destilación: comparar el comportamiento zero-shot (30,63%) frente al post-KD (44,38%) en subconjuntos de ScienceQA con y sin imagen.
- Prototipado de asistentes educativos de bajo coste: solo si se acepta la limitación de idioma (inglés) y el dominio restringido a preguntas STEM de opción múltiple.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`), sobre ScienceQA, subconjunto con imágenes, split de validación:

| Metrica | Profesor (base) | Zero-shot (pre-KD) | Final (post-KD) | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 30,63 | 44,38 | +13,75 |
| Perplejidad | 2,45 | 4,16 | 3,19 | -0,97 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: el artefacto guarda solo 97,40 MB de pesos de atención, pero para ejecutar el modelo completo hay que cargar el base `llava-hf/llava-interleave-qwen-0.5b-hf` (1,66 GB en FP16) y aplicar la cirugía; se estima un consumo de VRAM moderado, aunque el dato exacto de inferencia no está disponible.
- Entrenamiento documentado: una NVIDIA GeForce RTX 3090 (24 GB), con pico de 16.953 MB.
- GPU recomendadas: RTX 3090, RTX 4090, A100 o H100 para mayor holgura; cabe en GPUs de consumo de gama alta.
- Despliegue: la model card solo documenta la API `neuralops.hub.load_surgeried_model`; no se indica soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (val, con imagen) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/llava-qwen-0.5b-tri-branch-hybrid-scienceqa` | 0.5B | no disponible | 44,38% acc / 3,19 PPL | MIT | Hugging Face |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | 0.5B | no disponible | 63,75% acc / 2,45 PPL | no disponible en la información | Hugging Face |
| Otros VLM de ~0.5B (p. ej. SmolVLM, Qwen2-VL-2B) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con alternativas de la misma categoría no está disponible en la información proporcionada; solo se puede contrastar con su modelo base, que rinde claramente mejor.

## Limitaciones y advertencias

- Rendimiento muy inferior al profesor: 44,38% frente a 63,75% de accuracy en ScienceQA, una caída de casi 20 puntos.
- El checkpoint no es autónomo: contiene solo pesos de atención y layernorms modificados, requiere cargar el modelo base y aplicar la cirugía con NeuralOps.
- Idioma limitado al inglés; no se documenta soporte multilingüe.
- Dominio restringido a preguntas STEM de ScienceQA con imagen; no se han evaluado capacidades generales.
- Riesgo de alucinación no cuantificado; sin evaluación de sesgos publicada.
- Resultados de benchmarks declarados por el autor y marcados como no verificados (`verified: false`).
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.
- La licencia MIT se aplica al artefacto, pero conviene revisar la licencia del modelo base y del dataset ScienceQA antes de un uso comercial.
- No apto para producción sin una evaluación independiente previa.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-tri-branch-hybrid-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/hybrid/tri_branch_hybrid_attention.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
