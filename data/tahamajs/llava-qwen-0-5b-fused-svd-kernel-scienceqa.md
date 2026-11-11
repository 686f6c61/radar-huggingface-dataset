# tahamajs/llava-qwen-0.5b-fused-svd-kernel-scienceqa

## Resumen

LLaVA-Qwen-0.5B Fused SVD Kernel (ScienceQA) es un checkpoint experimental derivado de `llava-hf/llava-interleave-qwen-0.5b-hf` mediante técnicas de cirugía de atención y destilación de conocimiento. Lo publica el autor independiente tahamajs bajo el paraguas de su proyecto NeuralOps, una librería centrada en la sustitución modular de capas de atención por operadores alternativos (en este caso `FusedSVDKernelAttention`, familia SVD). El modelo no es un VLM de propósito general, sino un artefacto de investigación para evaluar el impacto de reemplazar la atención cuadrática por aproximaciones lineales basadas en descomposición en valores singulares en un transformer multimodal.

El modelo conserva la arquitectura base de LLaVA-Interleave-Qwen-0.5B: una torre visual SigLIP congelada, un proyector MLP de dos capas y un decodificador Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas y head_dim 64. La intervención quirúrgica sustituye la atención en 18 de las 24 capas (esquema `hybrid_3_1`), dejando 6 capas ancla cuadráticas en los índices [3, 7, 11, 15, 19, 23]. El resultado se evalúa sobre el subconjunto con imagen de ScienceQA (validación), donde obtiene un 31,25 % de accuracy y una perplejidad de 3,25.

Su relevancia es acotada pero clara para quien investiga eficiencia en atención: demuestra un pipeline reproducible de sustitución de atención con destilación desde el modelo profesor (63,75 % de accuracy) y reduce el artefacto en disco a 144,23 MB de pesos delta, un 91,5 % menos que el FP16 completo (1,66 GB). No obstante, la caída de rendimiento respecto al profesor es sustancial (32,5 puntos de accuracy), lo que lo sitúa como banco de pruebas más que como modelo de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LLaVA-Interleave (SigLIP + proyector MLP 2 capas + decodificador Qwen2 de 24 capas), con atención SVD-kernel fusionada en 18/24 capas |
| Parámetros totales | no disponible (modelo base Qwen2 de 0.5B; el artefacto delta pesa 144,23 MB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en FP16 safetensors) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, pesos delta quirúrgicos en FP16) |

## Arquitectura y entrenamiento

La arquitectura parte de LLaVA-Interleave-Qwen-0.5B: torre visual SigLIP de 27 capas congelada, proyector multimodal MLP de dos capas congelado y decodificador Qwen2 de 24 capas (D=1024, H=16, head_dim=64). La modificación quirúrgica reemplaza el módulo `self_attn` en 18 de las 24 capas por `FusedSVDKernelAttention`, un operador de atención lineal basado en descomposición SVD con kernel fusionado. Se preservan 6 capas ancla cuadráticas en los índices [3, 7, 11, 15, 19, 23] (esquema `hybrid_3_1`), junto con los MLP del decodificador, los embeddings y la torre visual, que permanecen congelados. Solo se entrenan las capas de atención modificadas y los layernorms del decodificador.

El entrenamiento se realizó en una única NVIDIA GeForce RTX 3090 (24 GB) con 244 pasos de optimización distribuidos en dos etapas (96 en la etapa 1, 148 en la etapa 2), un tiempo total de 120,3 s y un pico de VRAM de 17.472 MB. Se aplicó destilación de conocimiento desde el modelo profesor (el LLaVA-Qwen-0.5B sin cirugía) sobre el dataset `derek-thomas/ScienceQA`. El resultado es un checkpoint delta: solo se serializan los pesos modificados, lo que explica el tamaño reducido del artefacto (144,23 MB frente a 1,66 GB del FP16 completo, una reducción del 91,5 %).

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) en tareas de razonamiento visual STEM.
- Respuesta a preguntas de opción múltiple sobre figuras científicas (ScienceQA), el dominio para el que fue destilado.
- Conversación multimodal de un solo turno o multi-turno mediante plantilla de chat (`chat_template.json` incluido).
- Procesamiento de imágenes con preprocesador SigLIP estándar (384×384, según el ejemplo de la model card).
- Razonamiento básico sobre contenido visual en inglés.
- No se documenta soporte de tool calling, function calling, agentes ni modo thinking.
- No se documenta soporte de audio ni de vídeo.
- Capacidades multilingües limitadas al inglés.

## Casos de uso

- Investigación en eficiencia de atención: sirve como punto de comparación reproducible para medir el coste en accuracy de sustituir atención cuadrática por SVD-kernel en un VLM pequeño, con el profesor como referencia (63,75 % frente a 31,25 %).
- Destilación de conocimiento en modelos multimodales: el pipeline de dos etapas con 244 pasos en una RTX 3090 es replicable para estudiar la recuperación de perplejidad tras cirugía (de 12.161,91 a 3,25).
- Prototipado de pipelines de compresión de pesos: el formato delta (144,23 MB) y el `surgical_manifest.json` permiten experimentar con carga selectiva de pesos quirúrgicos.
- Evaluación de operadores de atención alternativos: útil para comparar `fused_svd_kernel` con otras variantes del zoo de NeuralOps (DistilBERT, RoBERTa, GPT-2 Conv1D, Qwen/LLaMA) bajo la misma metodología.
- Docencia y divulgación: ejemplo didáctico de cirugía de atención y auditoría de artefactos en disco, con telemetría completa de entrenamiento incluida.
- Benchmarking de VQA educativa: válido como baseline de bajo coste en el subconjunto con imagen de ScienceQA para comparar arquitecturas lineales.
- No recomendado para atención al cliente, generación de código en producción ni agentes autónomos: su accuracy (31,25 %) y su naturaleza experimental no lo permiten.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre ScienceQA, subconjunto con imagen STEM, split de validación:

| Métrica | Profesor (baseline) | Pre-KD (zero-shot) | Post-KD (final) | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 33,75 | 31,25 | -2,50 |
| Perplejidad (PPL) | 2,45 | 12.161,91 | 3,25 | -12.158,66 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El entrenamiento consumió 17.472 MB de pico en una RTX 3090, pero la inferencia requiere cargar el modelo base completo (Qwen2 0.5B + SigLIP) más los pesos delta.
- GPU recomendadas: RTX 3090 (24 GB) es la referencia usada por el autor para entrenamiento; para inferencia, cualquier GPU con al menos 8-12 GB debería ser suficiente dado el tamaño del modelo base, aunque no se documenta.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; no confirmado por el autor.
- Opciones de despliegue: la model card usa la API `neuralops.hub.load_surgeried_model` de la librería NeuralOps. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El tiempo de entrenamiento (120,3 s para 244 pasos) no es extrapolable a inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ScienceQA (img, val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tahamajs/llava-qwen-0.5b-fused-svd-kernel-scienceqa | 0.5B (base) | no disponible | 31,25 % | MIT | Hugging Face |
| llava-hf/llava-interleave-qwen-0.5b-hf (profesor) | 0.5B | no disponible | 63,75 % | no disponible en la información | Hugging Face |
| Otros checkpoints del zoo NeuralOps (DistilBERT, RoBERTa, GPT-2, Qwen/LLaMA) | varía | no disponible | no disponible | MIT (proyecto NeuralOps) | Hugging Face / GitHub |

La comparativa con alternativas externas de la misma categoría (p. ej. SmolVLM, Qwen2-VL-2B) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Caída de rendimiento severa frente al profesor: 32,5 puntos de accuracy en ScienceQA (31,25 % frente a 63,75 %), lo que lo inhabilita para uso en producción.
- Perplejidad pre-destilación extremadamente alta (12.161,91), indicativa de que la cirugía SVD-kernel rompe el comportamiento del modelo sin un proceso de destilación cuidadoso.
- Sesgos conocidos: no documentados por el autor; al derivar de Qwen2 y ScienceQA, hereda los sesgos del corpus original y del dataset educativo.
- Riesgo de alucinación: alto en dominios fuera de ScienceQA, dado el reducido ajuste y la naturaleza experimental del checkpoint.
- Limitación idiomática: solo inglés (`en`); no se garantiza comportamiento correcto en castellano u otros idiomas.
- Restricciones de licencia: MIT, permite uso comercial según la licencia, pero el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` puede tener condiciones propias que conviene verificar antes de un uso comercial.
- Dependencia de la librería NeuralOps: el código de carga (`load_surgeried_model`) es específico del proyecto; no hay integración documentada con transformers estándar, vLLM o llama.cpp.
- Artefacto delta: los pesos publicados son solo las capas modificadas; es necesario el modelo base para reconstruir el modelo completo.
- Resultados no verificados (`verified: false` en el model-index): las métricas las declara el autor sin validación independiente.
- Fecha de creación futura (2026-11-11) en los metadatos de Hugging Face, lo que sugiere posible error de marcado temporal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-fused-svd-kernel-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/svd/fused_svd_kernel.py
- Licencia del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
