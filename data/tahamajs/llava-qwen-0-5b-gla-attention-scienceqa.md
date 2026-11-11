# tahamajs/llava-qwen-0.5b-gla-attention-scienceqa

## Resumen

`llava-qwen-0.5b-gla-attention-scienceqa` es un checkpoint experimental publicado por el usuario tahamajs dentro del proyecto NeuralOps, un "attention surgery zoo" que sustituye capas de atención cuadrática por operadores lineales en modelos existentes. En este caso, el punto de partida es `llava-hf/llava-interleave-qwen-0.5b-hf`, un vision-language model de LLaVA que combina una torre visual SigLIP congelada, un proyector MLP de dos capas y un decodificador Qwen2 de 24 capas (D=1024, 16 cabezas, head_dim=64). La intervención reemplaza la atención de 18 de las 24 capas por GLAttention (Gated Linear Attention con backend FLA), manteniendo seis capas cuadráticas como anclas en los índices [3, 7, 11, 15, 19, 23].

El modelo no pretende ser un VLM de propósito general, sino una prueba de concepto reproducible de compresión arquitectónica con destilación de conocimiento. Se afina sobre el subconjunto con imagen de ScienceQA (split de validación) y se publica como delta quirúrgico de pesos en FP16 (`attention_weights.safetensors`, 144,80 MB) que debe combinarse con el modelo base para su uso. El resultado es un artefacto 11,75 veces más pequeño que el base completo en FP16 (1,52 GB ahorrados, -91,5 %).

Su relevancia es metodológica: documenta con telemetría completa (pasos, VRAM, duración) el coste de cambiar atención cuadrática por lineal en un VLM pequeño, incluyendo la caída de precisión asociada. Es útil para investigadores que estudian eficiencia de atención, no como sustituto de un VLM listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (SigLIP vision tower + MLP projector + decoder Qwen2) con atención híbrida: 18/24 capas GLAttention lineal y 6 capas cuadráticas ancla |
| Parametros totales | no disponible (modelo base ~0.5B; el delta publicado ocupa 144,80 MB en FP16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 safetensors) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (delta quirúrgico FP16) + JSON de manifiesto y config |

## Arquitectura y entrenamiento

El modelo hereda la topología de LLaVA-Interleave-Qwen-0.5B: torre visual SigLIP de 27 capas congelada, proyector multimodal MLP de dos capas y decodificador Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas de atención y head_dim 64. La "cirugía" sustituye la self-attention de 18 capas (`hybrid_3_1`) por GLAttention, una atención lineal con recurrencia gated: S_t = exp(g_t) · S_{t-1} + (K_t / sqrt(d))^T @ V_t, O_t = Q_t @ S_t, con g_t = logsigmoid(gate_logits / tau) ≤ 0. Se conservan seis capas cuadráticas en los índices [3, 7, 11, 15, 19, 23] como anclas, y se congelan la torre visual, el proyector, los MLP del decodificador y los embeddings. Solo se entrenan las 18 capas sustituidas y los layernorms del decodificador.

El entrenamiento combina destilación de conocimiento del profesor (el modelo base) en dos etapas: 49 pasos en la etapa 1 y 95 en la etapa 2, 144 pasos en total, ejecutados en una única RTX 3090 (24 GB) con un pico de 16.310 MB de VRAM y una duración de 120,3 segundos. El dataset es `derek-thomas/ScienceQA`, restringido al subconjunto con imagen del split de validación. No se documentan tokens de entrenamiento, composición completa del dataset ni uso de RLHF o DPO.

## Capacidades

- Respuesta a preguntas visuales (VQA) sobre imágenes con contenido STEM, en formato de elección múltiple con letra de opción.
- Generación de texto condicionada a imagen y prompt mediante el pipeline `image-text-to-text`.
- Razonamiento multimodal básico sobre figuras científicas (el objetivo declarado del checkpoint).
- Soporte de plantilla de chat (`chat_template.json` incluido).
- Capacidades multilingües: únicamente inglés.
- Tool calling / function calling: no disponible.
- Modo thinking, audio o vídeo: no disponible.
- Agentes multi-paso: no disponible.

## Casos de uso

- Investigación en eficiencia de atención: reproducir el experimento de sustituir atención cuadrática por GLAttention en un VLM y medir la degradación con la telemetría publicada (144 pasos, 120,3 s, 16.310 MB de VRAM pico).
- Docencia y divulgación sobre atención lineal: usar el checkpoint como ejemplo didáctico de atención híbrida con anclas cuadráticas y su efecto en perplejidad (de 771,17 en zero-shot a 4,24 tras destilación).
- Pruebas de destilación de conocimiento: comparar la curva pre-KD (43,75 % de accuracy) frente a la post-KD (31,25 %) en un presupuesto de cómputo muy reducido.
- Benchmarking de compresión de artefactos: validar flujos que publican deltas quirúrgicos de 144,80 MB en lugar de checkpoints completos de 1,66 GB.
- Prototipado de VQA STEM en entornos con recursos limitados: ejecutar el modelo en una única GPU consumer para tareas de elección múltiple sobre figuras, asumiendo la precisión limitada.
- Auditoría de pipelines NeuralOps: verificar la carga del delta con `neuralops.hub.load_surgeried_model` y la integración con `surgical_manifest.json` y `config.json`.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados) sobre ScienceQA, subconjunto con imagen, split de validación:

| Metrica | Teacher baseline | Pre-KD (zero-shot) | Post-KD (final) | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 43,75 | 31,25 | -12,50 |
| Perplexity | 2,45 | 771,17 | 4,24 | -766,93 |

Telemetría de entrenamiento declarada: 144 pasos (49 + 95), 120,3 s, 16.310 MB de VRAM pico en una RTX 3090 (24 GB).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento consumió 16.310 MB en una RTX 3090, por lo que la inferencia en FP16 debería caber holgadamente en 24 GB.
- GPU recomendadas: RTX 3090 (probada por el autor); cualquier GPU con al menos 24 GB es un punto de partida seguro.
- GPU consumer: sí, el modelo cabe en una RTX 3090; no se documenta comportamiento en GPUs de 8-16 GB.
- Opciones de despliegue: el autor documenta la API `neuralops.hub.load_surgeried_model`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (val, con imagen) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-gla-attention-scienceqa | ~0.5B (delta de 144,80 MB) | no disponible | 31,25 % accuracy / 4,24 PPL | MIT | Hugging Face (delta) |
| llava-hf/llava-interleave-qwen-0.5b-hf (teacher) | ~0.5B | no disponible | 63,75 % accuracy / 2,45 PPL | no disponible en la información | Hugging Face (completo) |
| Versión zero-shot del mismo checkpoint | ~0.5B | no disponible | 43,75 % accuracy / 771,17 PPL | MIT | No publicada como artefacto separado |

## Limitaciones y advertencias

- Caída de precisión notable: 31,25 % de accuracy frente al 63,75 % del profesor, una pérdida de 12,50 puntos porcentuales.
- El checkpoint es un delta quirúrgico: requiere el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` y la librería `neuralops` para cargarse; no es un checkpoint autónomo.
- Solo inglés; no se documenta soporte multilingüe.
- Entrenado exclusivamente sobre el subconjunto con imagen de ScienceQA (validación), lo que limita su generalización fuera de ese dominio STEM.
- Riesgo de alucinación y de respuestas incorrectas en VQA fuera de distribución no cuantificado.
- Sesgos: no documentados por el autor.
- Resultados de benchmarks no verificados (`verified: false` en el model-index).
- Licencia MIT, pero el enlace de licencia apunta al repositorio NeuralOps; conviene revisar los términos del modelo base antes de uso comercial.
- Sin descargas ni likes en el momento de la consulta; proyecto de investigación sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-gla-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación de GLAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/linear/gla_attention.py
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
