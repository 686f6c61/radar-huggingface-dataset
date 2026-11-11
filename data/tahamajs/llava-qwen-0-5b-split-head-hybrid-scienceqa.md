# tahamajs/llava-qwen-0.5b-split-head-hybrid-scienceqa

## Resumen

`llava-qwen-0.5b-split-head-hybrid-scienceqa` es un checkpoint experimental de tipo vision-language derivado de `llava-hf/llava-interleave-qwen-0.5b-hf` mediante técnicas de cirugía de atención (attention surgery) y destilación de conocimiento. Lo publica el autor `tahamajs` dentro del proyecto NeuralOps, un marco que sustituye módulos de atención estándar por operadores alternativos (en este caso `SplitHeadHybridAttention`, también llamado AEGIS-Attention V5) y evalúa el impacto en tareas multimodales.

El modelo conserva la arquitectura LLaVA-Interleave Qwen-0.5B: torre visual SigLIP congelada, proyector MLP de dos capas y decodificador Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas y `head_dim` de 64. La intervención reemplaza la atención en 18 de las 24 capas del decodificador (esquema `hybrid_3_1`), manteniendo seis capas con atención cuadrática completa como anclas, y aplica destilación desde el modelo profesor para recuperar capacidad.

Su relevancia es fundamentalmente metodológica: sirve como banco de pruebas reproducible para investigar atención híbrida, compresión de pesos y destilación en modelos multimodales pequeños. No es un modelo pensado para producción general, sino un artefacto de investigación que demuestra que es posible recortar el 94,6 % del peso en disco del modelo base manteniendo una precisión moderada en ScienceQA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LLaVA-Interleave (SigLIP + proyector MLP + decodificador Qwen2) con atención híbrida `SplitHeadHybridAttention` en 18/24 capas |
| Parámetros totales | no disponible (el artefacto guardado contiene solo pesos de atención modificados: 372 tensores) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP16 (formato de los pesos guardados); no se documentan otras cuantizaciones |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, FP16, solo atención) + `surgical_manifest.json` |
| Librería | `neuralops` |
| Modelo base | `llava-hf/llava-interleave-qwen-0.5b-hf` |
| Dataset de evaluación | `derek-thomas/ScienceQA` (subconjunto STEM con imágenes, validación) |
| Tamaño en disco de pesos | 91,93 MB (96.399.016 bytes); paquete total 107,13 MB |
| Pipeline | `image-text-to-text` |

## Arquitectura y entrenamiento

El modelo parte de LLaVA-Interleave Qwen-0.5B, que combina una torre visual SigLIP congelada (27 capas), un proyector multimodal MLP de dos capas y un decodificador Qwen2 de 24 capas con D=1024, H=16 y `head_dim`=64. La cirugía sustituye el módulo de self-attention en 18 de las 24 capas por `SplitHeadHybridAttention`, un operador híbrido que combina atención global y local con dispersión adaptativa (AEGIS-Attention V5). Las seis capas restantes (`[3, 7, 11, 15, 19, 23]`) conservan atención cuadrática completa como anclas de estabilidad. Se congelan la torre visual, el proyector, los MLP del decodificador y los embeddings; solo se entrenan las atenciones modificadas y los layernorms del decodificador.

El entrenamiento se realiza en dos etapas de destilación de conocimiento desde el modelo profesor: 31 pasos en la etapa 1 y 63 en la etapa 2, con un total de 94 pasos en 121,3 segundos sobre una única NVIDIA RTX 3090 (24 GB), con un pico de VRAM de 13.504 MB. El dataset de evaluación es ScienceQA (subconjunto STEM con imágenes, split de validación). El artefacto serializado incluye únicamente los pesos de atención modificados (372 tensores, `weights_format=attention_only_fp16`) más un manifiesto quirúrgico `neuralops.surgery/v2` que describe la topología de la intervención. No se documentan detalles sobre el número de tokens de entrenamiento ni la composición exacta del dataset de destilación.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) con preguntas de opción múltiple sobre contenido STEM.
- Razonamiento visual básico sobre figuras científicas (diagramas, ilustraciones de ciencias naturales).
- Respuesta a preguntas de tipo test con selección de letra de opción.
- Formato conversacional mediante `chat_template.json` incluido.
- Capacidad multilingüe limitada al inglés (idioma declarado: `en`).
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, audio ni vídeo.

## Casos de uso

- Investigación en atención eficiente: el checkpoint permite reproducir experimentos de sustitución de atención (`split_head_hybrid`) sobre un VLM pequeño y comparar precisión y perplejidad frente al profesor, con un coste de cómputo mínimo (121 s en una RTX 3090).
- Destilación de conocimiento en modelos multimodales: sirve como caso de estudio de recuperación de capacidad tras una cirugía agresiva (de 41,25 % a 43,75 % de accuracy y de PPL 111,11 a 3,23 con solo 94 pasos).
- Compresión de artefactos: demuestra una reducción del 94,6 % del peso en disco (de 1,66 GB a 91,93 MB) guardando solo los pesos de atención modificados, útil para estudiar estrategias de distribución de deltas quirúrgicos.
- Evaluación de benchmarks STEM multimodales: permite ejecutar ScienceQA sobre un modelo de 0,5B con atención modificada y comparar contra el profesor LLaVA-Interleave Qwen-0.5B.
- Docencia y divulgación: ejemplo didáctico de cómo se aplica cirugía de atención capa a capa y cómo se mide el impacto con métricas estándar (accuracy, perplexity).
- Prototipado de pipelines NeuralOps: sirve para validar la API `neuralops.hub.load_surgeried_model` y el formato `surgical_manifest.json` antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`), sobre ScienceQA (subconjunto STEM con imágenes, validación):

| Métrica | Profesor (baseline) | Pre-destilación (zero-shot) | Post-destilación (final) | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 41,25 | **43,75** | +2,50 |
| Perplexity (PPL) | 2,45 | 111,11 | **3,23** | -107,88 |

Telemetría de entrenamiento declarada: 94 pasos totales (31 + 63), 121,3 s de duración, pico de VRAM 13.504 MB en RTX 3090.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo base LLaVA-Interleave Qwen-0.5B requiere típicamente entre 2 y 4 GB en FP16, pero el checkpoint publicado solo contiene pesos de atención, por lo que debe combinarse con el modelo base para inferencia completa.
- GPU utilizadas en el entrenamiento: NVIDIA RTX 3090 (24 GB), con pico de 13.504 MB.
- Cabe en GPU de consumo: sí, el modelo base de 0,5B es apto para GPUs consumer (RTX 3060 en adelante), aunque no se documenta el rendimiento de inferencia de este checkpoint concreto.
- Opciones de despliegue: la model card documenta únicamente la API `neuralops.hub.load_surgeried_model`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ScienceQA (val, STEM con imágenes) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/llava-qwen-0.5b-split-head-hybrid-scienceqa` | 0,5B (base) | no disponible | 43,75 % accuracy / PPL 3,23 | MIT | Hugging Face, librería `neuralops` |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | 0,5B | no disponible | 63,75 % accuracy / PPL 2,45 | no disponible en la información | Hugging Face |
| LLaVA-Interleave Qwen-0.5B sin cirugía (zero-shot) | 0,5B | no disponible | 41,25 % accuracy / PPL 111,11 | no disponible en la información | no disponible |

No se dispone de datos de otros modelos comparables (por ejemplo, variantes de LLaVA-1.5 o Qwen-VL de tamaño similar) en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint contiene únicamente los pesos de atención modificados (372 tensores, 91,93 MB); para inferencia completa es necesario cargarlo junto con el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` mediante la API de NeuralOps.
- Precisión moderada: 43,75 % en ScienceQA, muy por debajo del profesor (63,75 %), lo que limita su uso en producción real.
- Idiomas: solo inglés declarado; no se garantiza comportamiento en castellano ni en otros idiomas.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad ni robustez.
- Riesgo de alucinación: no evaluado; en un VLM de 0,5B con atención parcialmente reemplazada es esperable un riesgo elevado en preguntas abiertas.
- Licencia MIT: permite uso comercial, pero el modelo base subyacente puede tener condiciones adicionales que deben verificarse por separado.
- Resultados de benchmarks no verificados (`verified: false`); proceden de la model card del autor.
- Longitud de contexto no documentada; no se recomienda asumir la del modelo base sin comprobación.
- Modelo de investigación: no apto para despliegues críticos sin validación adicional.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-split-head-hybrid-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de `SplitHeadHybridAttention`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/hybrid/split_head_hybrid_attention.py
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
