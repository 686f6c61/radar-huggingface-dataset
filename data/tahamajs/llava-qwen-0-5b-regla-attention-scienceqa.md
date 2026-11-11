# tahamajs/llava-qwen-0.5b-regla-attention-scienceqa

## Resumen
`tahamajs/llava-qwen-0.5b-regla-attention-scienceqa` es un checkpoint experimental de visión-lenguaje derivado de `llava-hf/llava-interleave-qwen-0.5b-hf` mediante una técnica de "cirugía de atención" (attention surgery) desarrollada por el autor (tahamajs) dentro del framework NeuralOps. El modelo sustituye el mecanismo de atención cuadrática en 18 de las 24 capas del decoder Qwen2 por un operador híbrido denominado ReGLAAttention (Refined Gated Linear Attention), manteniendo seis capas ancla con atención cuadrática estándar. El objetivo es reducir el coste computacional y el tamaño del artefacto manteniendo la funcionalidad multimodal básica.

El modelo conserva la torre visual SigLIP congelada y el proyector MLP de dos capas del modelo base, y solo se han entrenado y serializado los módulos de atención modificados y los layernorms del decoder. El resultado es un artefacto de pesos de 402 MB frente a los 1,66 GB del base en FP16, lo que supone una reducción del 76,4 %. La evaluación se ha realizado exclusivamente sobre el subconjunto con imagen de ScienceQA (validación), con una precisión del 38,75 % y una perplejidad de 3,20.

Es relevante como ejemplo de investigación aplicada sobre compresión arquitectónica de VLMs pequeños mediante destilación de conocimiento y sustitución de operadores de atención, no como un modelo listo para producción. El checkpoint se publica con licencia MIT y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (SigLIP vision tower + MLP projector + decoder Qwen2 con ReGLAAttention híbrida) |
| Parametros totales | 0,5B (modelo base LLaVA-Qwen-0.5B); artefacto quirúrgico de 402,31 MB en FP16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, `weights_format=attention_only_fp16`) |

## Arquitectura y entrenamiento
El modelo base es LLaVA-Qwen-0.5B: torre visual SigLIP congelada de 27 capas, proyector MLP de dos capas y decoder Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas y `head_dim` de 64. La modificación quirúrgica sustituye la atención cuadrática por ReGLAAttention (familia híbrida) en 18 de las 24 capas del decoder, dejando intactas seis capas ancla en las posiciones `[3, 7, 11, 15, 19, 23]` para preservar capacidad de atención global. Se congelan la torre visual, el proyector, los MLP del decoder y los embeddings; solo se entrenan y guardan las atenciones modificadas y los layernorms del decoder.

El entrenamiento se realizó en una única NVIDIA RTX 3090 (24 GB) con un pico de 6.823 MB de VRAM, 332 pasos de optimización (102 en etapa 1 y 230 en etapa 2) y una duración total de 120,2 segundos. Se aplicó destilación de conocimiento desde el modelo profesor (el LLaVA-Qwen-0.5B original), que alcanza 63,75 % de precisión y 2,45 de perplejidad en el mismo conjunto. Antes de la destilación, el modelo quirúrgico zero-shot obtenía 32,50 % de precisión y 14,87 de perplejidad; tras la destilación, 38,75 % y 3,20 respectivamente (+6,25 puntos de precisión y −11,67 de perplejidad). El manifiesto `surgical_manifest.json` (schema `neuralops.surgery/v2`) registra 840 tensores guardados.

## Capacidades
- Generación de texto y respuesta a preguntas visuales (VQA) sobre imágenes, orientada a contenido STEM.
- Razonamiento multimodal básico limitado al subconjunto con imagen de ScienceQA.
- Soporte de plantilla de chat conversacional (`chat_template.json` incluido).
- Procesamiento de imagen con preprocesador propio (`preprocessor_config.json`), orientado a entradas de 384×384 píxeles en el ejemplo de uso.
- Capacidad multilingüe: solo inglés.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, audio ni vídeo.

## Casos de uso
- Investigación en compresión de VLMs: sirve como referencia reproducible para estudiar el impacto de sustituir atención cuadrática por operadores lineales híbridos en un decoder pequeño, con telemetría completa de entrenamiento (pasos, VRAM, duración).
- Destilación de conocimiento sobre arquitecturas modificadas: el par profesor/alumno y las métricas pre/post-KD permiten evaluar técnicas de KD en VLMs de 0,5B con presupuesto de una sola GPU consumer.
- Prototipado de asistentes educativos STEM: puede emplearse como base para experimentos de respuesta a preguntas sobre figuras científicas en inglés, aceptando la precisión limitada del 38,75 %.
- Despliegue en entornos con restricciones de almacenamiento: el artefacto de 402 MB (frente a 1,66 GB del base) facilita su distribución en dispositivos con poco espacio o en pipelines de CI que cachean pesos.
- Benchmarking de operadores de atención: útil para comparar ReGLAAttention frente a atención cuadrática en tareas VQA dentro de un mismo esqueleto LLaVA-Qwen.
- Docencia y demostraciones de "attention surgery": el manifiesto quirúrgico y los scripts de carga vía `neuralops.hub.load_surgeried_model` permiten ilustrar cómo se reemplazan módulos de atención en un transformer multimodal.

## Benchmarks y rendimiento

| Metrica | Profesor (base) | Pre-KD (zero-shot) | Post-KD (final) | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) en ScienceQA (Image-Bearing STEM, validation) | 63,75 | 32,50 | 38,75 | +6,25 |
| Perplejidad en ScienceQA (Image-Bearing STEM, validation) | 2,45 | 14,87 | 3,20 | −11,67 |

Datos declarados por el autor en la model card (`verified: false`). No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento usó 6.823 MB de pico en una RTX 3090, por lo que la inferencia en FP16 debería caber holgadamente en GPUs consumer de 8 GB o más.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16; el autor validó el flujo en RTX 3090 (24 GB).
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060/4060 (8-12 GB), RTX 4070/4080 y superiores.
- Opciones de despliegue: el checkpoint requiere la librería `neuralops` (`load_surgeried_model`) para cargar los pesos quirúrgicos; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (img, val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/llava-qwen-0.5b-regla-attention-scienceqa` | 0,5B | no disponible | 38,75 % acc / 3,20 PPL | MIT | Hugging Face (neuralops) |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | 0,5B | no disponible | 63,75 % acc / 2,45 PPL | no disponible en la información | Hugging Face |
| Otros VLMs de ~0,5B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Precisión muy inferior al modelo profesor (38,75 % frente a 63,75 % en ScienceQA), lo que desaconseja su uso en producción sin fine-tuning adicional.
- Evaluación limitada a un único conjunto (ScienceQA, subconjunto con imagen, validación); no hay datos sobre otras tareas VQA, OCR, grounding o razonamiento visual general.
- Solo soporta inglés; no se documenta cobertura multilingüe.
- No se documenta soporte de tool calling, agentes ni modos de razonamiento extendido.
- Los pesos publicados son únicamente los módulos de atención modificados y los layernorms del decoder; requieren el modelo base y la librería `neuralops` para reconstruir el modelo completo, lo que complica su uso con stacks estándar (transformers, vLLM, llama.cpp).
- Riesgo de alucinación no cuantificado; al ser un modelo pequeño y destilado, es esperable una tasa elevada en preguntas abiertas.
- Sesgos: no documentados por el autor; heredables del corpus de ScienceQA y del modelo base.
- Licencia MIT permite uso comercial, pero la falta de validación fuera de ScienceQA hace arriesgado desplegarlo sin evaluación propia.
- Métricas marcadas como `verified: false` en la model card: no han sido auditadas de forma independiente.
- Fecha de creación (2026-11-11) y telemetría de entrenamiento (120,2 s, 332 pasos) indican un experimento de investigación, no un modelo maduro.

## Enlaces
- Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-regla-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Dataset: https://huggingface.co/datasets/derek-thomas/ScienceQA
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación ReGLAAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/hybrid/regla_attention.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
