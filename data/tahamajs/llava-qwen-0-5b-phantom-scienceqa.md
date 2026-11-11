# tahamajs/llava-qwen-0.5b-phantom-scienceqa

## Resumen

`tahamajs/llava-qwen-0.5b-phantom-scienceqa` es un checkpoint experimental de un modelo visión-lenguaje (VLM) construido sobre `llava-hf/llava-interleave-qwen-0.5b-hf`. El autor, tahamajs, lo publica dentro de su framework NeuralOps como parte de un "Attention Surgery Zoo": en lugar de reentrenar el modelo completo, sustituye quirúrgicamente el mecanismo de atención de 18 de las 24 capas del decoder Qwen2 por un operador denominado PHANTOMAttention (Parameter-Hashed AttentioN with Token-wise Orthogonal Mapping), de la familia SSM, y aplica destilación de conocimiento para recuperar parte del rendimiento perdido.

El modelo base combina una torre visual SigLIP congelada, un proyector MLP de dos capas y un decoder Qwen2 de 24 capas (D=1024, 16 cabezas, head_dim=64). El checkpoint publicado no contiene los pesos completos, sino únicamente los deltas quirúrgicos de atención en FP16 (49,88 MB, 606 tensores), lo que reduce el artefacto un 97,1% respecto al base completo de 1,66 GB. Se evalúa sobre el subconjunto con imagen de ScienceQA (validación), un benchmark de razonamiento STEM multimodal.

Su relevancia es fundamentalmente metodológica: demuestra un flujo de compresión arquitectónica post-hoc con recuperación parcial vía destilación en una sola GPU consumer (RTX 3090). No obstante, el resultado final (38,75% de accuracy) queda muy por debajo del profesor original (63,75%), por lo que debe tratarse como una prueba de concepto y no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA interleaved: torre visual SigLIP congelada + proyector MLP de 2 capas + decoder Qwen2 de 24 capas (D=1024, H=16, head_dim=64); 18/24 capas con atención sustituida por PHANTOMAttention (familia SSM, esquema `hybrid_3_1`) |
| Parametros totales | no disponible (el artefacto publicado contiene solo deltas de atención: 606 tensores, 49,88 MB en FP16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16, formato `attention_only_fp16`) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`), requiere carga vía `neuralops.hub.load_surgeried_model` |

## Arquitectura y entrenamiento

La arquitectura parte de LLaVA-Qwen-0.5B: un encoder visual SigLIP de 27 capas congelado, un proyector MLP de dos capas que alinea los embeddings visuales con el espacio del lenguaje, y un decoder Qwen2 de 24 capas con dimensión oculta 1024 y 16 cabezas de atención. La intervención quirúrgica reemplaza el `self_attn` de 18 de las 24 capas por PHANTOMAttention, manteniendo 6 capas de atención cuadrática como anclas en los índices `[3, 7, 11, 15, 19, 23]` (esquema `hybrid_3_1`). Se congelan la torre visual, el proyector, los MLP del decoder, los embeddings y las 6 capas ancla; solo se entrenan las atenciones sustituidas y los layernorms del decoder.

El entrenamiento es una destilación de conocimiento en dos etapas (147 + 172 = 319 pasos de optimización, 120,1 s en total) ejecutada en una NVIDIA GeForce RTX 3090 de 24 GB, con un pico de VRAM de 14.401 MB. La evaluación se realiza sobre el subconjunto con imagen de ScienceQA (validación). El resultado muestra que la sustitución quirúrgica degrada severamente el modelo antes de la destilación (33,75% de accuracy, perplejidad 24,53) y que la destilación recupera parcialmente el rendimiento (38,75%, perplejidad 3,07), pero sin alcanzar al profesor (63,75%, perplejidad 2,45).

## Capacidades

- Generación de texto condicionada por imagen en formato conversacional (pipeline `image-text-to-text`).
- Respuesta a preguntas visuales de tipo STEM (ScienceQA): identificación de elementos en figuras y selección de opción de respuesta.
- Razonamiento multimodal básico sobre diagramas e ilustraciones científicas.
- Soporte de plantilla de chat (`chat_template.json`) para conversaciones multi-turno.
- Capacidad multilingüe limitada al inglés.
- Capacidades de tool calling, function calling, agentes, matemáticas avanzadas, audio o thinking mode: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre compresión arquitectónica de VLMs: el checkpoint sirve como referencia reproducible de sustitución de atención por operadores SSM con destilación, permitiendo comparar deltas de accuracy y perplejidad frente al profesor.
- Docencia y experimentación en atención eficiente: útil para estudiar el compromiso entre atención cuadrática y operadores lineales en modelos multimodal pequeños sobre una única GPU consumer.
- Prototipado de pipelines de carga quirúrgica: permite validar el flujo `load_surgeried_model` de NeuralOps y el formato `surgical_manifest.json` antes de aplicarlo a modelos mayores.
- Evaluación de robustez post-surgery: escenario controlado para medir cuánto degrada una intervención de atención a un VLM de 0,5B en tareas de razonamiento visual.
- Benchmark de destilación de conocimiento: el par profesor/alumno con métricas pre y post-KD permite calibrar recetas de destilación en presupuestos de cómputo mínimos (319 pasos, 2 minutos).
- Pruebas de integración en entornos de investigación con requisitos de licencia permisiva: la licencia MIT facilita su uso en repositorios académicos y experimentos internos.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre ScienceQA, subconjunto con imagen STEM, split de validación:

| Modelo / etapa | Accuracy (%) | Perplejidad |
|---|---:|---:|
| Profesor (LLaVA-Qwen-0.5B base) | 63,75 | 2,45 |
| Alumno pre-destilación (zero-shot) | 33,75 | 24,53 |
| Alumno post-destilación (final) | 38,75 | 3,07 |
| Delta post-KD vs. pre-KD | +5,00 | -21,46 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Entrenamiento: una NVIDIA GeForce RTX 3090 (24 GB) con pico de 14.401 MB de VRAM; 319 pasos en 120,1 s.
- Inferencia: el artefacto publicado son solo deltas de atención (49,88 MB); la inferencia requiere cargar el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` (1,66 GB en FP16) junto con los pesos quirúrgicos, por lo que la VRAM efectiva es la del modelo base más el delta.
- GPU recomendadas: cualquier GPU con al menos ~4 GB de VRAM para el modelo base en FP16; una RTX 3060 o superior es suficiente. Para cuantización no se dispone de datos.
- Cabe en GPU consumer: sí, el modelo base de 0,5B es apto para GPUs de gama media.
- Despliegue: la carga está documentada únicamente vía `neuralops.hub.load_surgeried_model`; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ScienceQA (img, val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-phantom-scienceqa | ~0,5B (base) | no disponible | 38,75% acc / 3,07 PPL | MIT | Hugging Face (deltas quirúrgicos) |
| llava-hf/llava-interleave-qwen-0.5b-hf (profesor) | ~0,5B | no disponible | 63,75% acc / 2,45 PPL | no disponible en la información | Hugging Face |
| Otros VLMs de ~0,5B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al par profesor/alumno porque no se han proporcionado datos de otros modelos de la misma categoría en la información disponible.

## Limitaciones y advertencias

- Degradación significativa frente al modelo base: 38,75% vs. 63,75% de accuracy en ScienceQA, una caída de 25 puntos porcentuales.
- El checkpoint no es autónomo: contiene solo deltas de atención; requiere el modelo base y la librería NeuralOps para cargarse.
- Idioma limitado al inglés; no se garantiza comportamiento correcto en castellano u otros idiomas.
- Longitud de contexto no documentada; no se recomienda para tareas de contexto largo sin validación previa.
- Riesgo de alucinación elevado en tareas fuera de ScienceQA, dado el dominio estrecho de evaluación y la ausencia de benchmarks generales.
- Resultados de benchmarks no verificados (`verified: false` en el model-index); deben tratarse como declaraciones del autor.
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia MIT permite uso comercial, pero la ausencia de evaluación fuera de ScienceQA desaconseja su uso en producción sin validación adicional.
- El modelo fue creado y actualizado el 2026-11-11; con 0 descargas y 0 likes, no hay evidencia de uso comunitario ni de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-phantom-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de PHANTOMAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/ssm/phantom.py
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
