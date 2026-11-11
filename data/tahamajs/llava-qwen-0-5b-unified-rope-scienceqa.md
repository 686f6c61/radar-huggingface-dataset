# tahamajs/llava-qwen-0.5b-unified-rope-scienceqa

## Resumen

`llava-qwen-0.5b-unified-rope-scienceqa` es un checkpoint multimodal de tipo vision-language derivado de `llava-hf/llava-interleave-qwen-0.5b-hf` mediante la técnica de "attention surgery" del proyecto NeuralOps. El autor, `tahamajs`, sustituye el mecanismo de atención rotatoria estándar por un operador propio denominado UnifiedRoPE en 18 de las 24 capas del decodificador Qwen2, manteniendo congelados el torre de visión SigLIP, el proyector multimodal y seis capas de atención cuadrática de anclaje. El resultado se ajusta sobre el subconjunto de ScienceQA con imágenes para responder preguntas de razonamiento científico visual.

El modelo es relevante como artefacto de investigación más que como producto: demuestra que es posible comprimir y reemplazar quirúrgicamente el mecanismo de atención de un VLM pequeño, destilar el conocimiento del modelo profesor y mejorar métricas declaradas (67,5 % de accuracy frente al 63,75 % del profesor) con un coste de entrenamiento de 285 pasos y 120,5 segundos en una RTX 3090. El artefacto serializado pesa 370,62 MB frente a los 1,66 GB del base en FP16, una reducción del 78,2 %.

La arquitectura subyacente es un LLaVA-Interleave con torre SigLIP congelada, proyector MLP de dos capas y decodificador Qwen2 de 24 capas (dimensión 1024, 16 cabezas, head_dim 64). El contexto, los idiomas y los detalles de entrenamiento más allá de lo declarado no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA-Interleave (SigLIP vision tower + MLP projector + Qwen2 decoder) con atención UnifiedRoPE en 18/24 capas |
| Parametros totales | no disponible (el base es Qwen2-0.5B; el checkpoint guarda solo 714 tensores de atención y layernorms) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en FP16; `weights_format=attention_only_fp16`) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, FP16, 370,62 MB) + `surgical_manifest.json` (schema `neuralops.surgery/v2`) |

## Arquitectura y entrenamiento

El modelo parte de `llava-hf/llava-interleave-qwen-0.5b-hf`: una torre de visión SigLIP congelada de 27 capas, un proyector multimodal MLP de dos capas y un decodificador Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas de atención y dimensión de cabeza 64. La intervención sustituye el mecanismo de atención en 18 de las 24 capas (esquema `hybrid_3_1`) por el operador `UnifiedRoPE` de la familia `modern`, definido en `neuralops/layers/modern/unified_rope.py`. Se conservan seis capas de atención cuadrática como anclas en los índices `[3, 7, 11, 15, 19, 23]`, y quedan congelados el `vision_tower`, el `multi_modal_projector`, los MLP del decodificador y los embeddings.

El ajuste se realizó en dos etapas sobre el subconjunto de ScienceQA con imágenes: 123 pasos en la etapa 1 y 162 en la etapa 2, con un total de 285 pasos en 120,5 segundos y un pico de VRAM de 16.188 MB en una RTX 3090. El proceso combina destilación de conocimiento desde el modelo profesor (que sirve de referencia) con el ajuste de los layernorms del decodificador. El autor declara mejoras frente al profesor: accuracy del 63,75 % al 67,50 % (+8,12 puntos relativos) y perplejidad de 2,45 a 2,32. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Respuesta a preguntas visuales (VQA) sobre imágenes de contenido científico y STEM.
- Razonamiento multimodal de opción múltiple: el formato de prompt sugiere responder con la letra de la opción.
- Comprensión de imagen y texto conjuntamente mediante el pipeline `image-text-to-text`.
- Conversación multi-turno según la etiqueta `conversational` y la plantilla de chat incluida (`chat_template.json`).
- Capacidad de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés declarado.
- Modo thinking, audio u otras modalidades: no disponible.

## Casos de uso

- Evaluación de técnicas de "attention surgery": el checkpoint sirve como referencia reproducible para comparar UnifiedRoPE frente a atención estándar en un VLM pequeño, con métricas declaradas y telemetría de entrenamiento incluidas.
- Investigación en destilación de conocimiento multimodal: el par profesor/alumno y los deltas de accuracy y perplejidad permiten estudiar la transferencia de conocimiento en modelos de 0,5B.
- Prototipado de asistentes educativos STEM: el ajuste sobre ScienceQA lo hace adecuado para responder preguntas de ciencias con apoyo de figuras en entornos de demostración, siempre con validación humana.
- Benchmarking de compresión de pesos: el artefacto de 370,62 MB frente a 1,66 GB permite medir el impacto de reducir el footprint en tareas de VQA.
- Docencia y formación técnica: útil para ilustrar cómo se modifica quirúrgicamente un grafo de atención y cómo se serializa un manifiesto de cirugía (`surgical_manifest.json`).
- Pipeline de investigación con `neuralops.hub.load_surgeried_model`: integración directa en flujos de experimentación que ya usan la librería NeuralOps para cargar modelos intervenidos.
- Base para ablaciones controladas: al conservar seis capas cuadráticas de anclaje, permite aislar el efecto de las capas sustituidas en experimentos posteriores.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Metrica | Profesor (baseline) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) en ScienceQA (subconjunto STEM con imagen, validation) | 63,75 | 59,38 | 67,50 | +8,12 |
| Perplejidad (PPL) | 2,45 | 2,62 | 2,32 | -0,30 |

Telemetría de entrenamiento declarada: 285 pasos (123 etapa 1, 162 etapa 2), 120,5 s, pico de VRAM 16.188 MB en RTX 3090, timestamp 2026-11-11T11:07:39Z.

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento consumió 16.188 MB de pico en una RTX 3090, por lo que la inferencia en FP16 debería caber holgadamente en GPUs de 24 GB.
- GPU recomendadas: RTX 3090 (validada por el autor para el ajuste); GPUs con al menos 24 GB para reproducir el entrenamiento. Para inferencia, cualquier GPU con suficiente VRAM para el modelo base completo (el checkpoint solo contiene pesos de atención y layernorms, requiere cargar el base).
- ¿Cabe en GPU de consumo? Sí, el modelo base de 0,5B en FP16 ocupa aproximadamente 1,66 GB; el artefacto quirúrgico añade 370,62 MB. Cabe en GPUs de 8-12 GB con margen.
- Opciones de despliegue: la model card solo documenta la carga mediante `neuralops.hub.load_surgeried_model`. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/llava-qwen-0.5b-unified-rope-scienceqa` | ~0,5B (base) | no disponible | 67,50 % accuracy ScienceQA (declarado) | MIT | Hugging Face |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | ~0,5B | no disponible | 63,75 % accuracy ScienceQA (declarado en esta ficha) | no disponible | Hugging Face |
| Otros VLM pequeños comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de otros modelos de la misma categoría (por ejemplo, variantes de SmolVLM, Qwen2-VL-2B o PaliGemma) que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; el ajuste se limita a ScienceQA y no se documenta una evaluación de sesgos.
- Riesgo de alucinación: no evaluado; al ser un modelo de 0,5B ajustado en un dominio estrecho, la generalización fuera de ScienceQA es incierta.
- Limitaciones de contexto e idioma: solo inglés declarado; la longitud de contexto no se especifica.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo base (`llava-hf/llava-interleave-qwen-0.5b-hf`) puede tener condiciones propias que conviene revisar.
- El checkpoint no es autónomo: contiene únicamente 714 tensores de atención y layernorms; requiere cargar el modelo base para funcionar.
- Los resultados de benchmarks están declarados por el autor y marcados como no verificados (`verified: false`); no deben tratarse como evidencia independiente.
- El repositorio registra 0 descargas y 0 likes, lo que indica ausencia de validación por parte de la comunidad.
- El uso de la librería `neuralops` y de la API `load_surgeried_model` limita la portabilidad frente a stacks estándar de Hugging Face Transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-unified-rope-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de UnifiedRoPE: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/modern/unified_rope.py
- Licencia del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
