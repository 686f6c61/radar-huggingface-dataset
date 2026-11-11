# tahamajs/llava-qwen-0.5b-salt-attention-scienceqa

## Resumen

`llava-qwen-0.5b-salt-attention-scienceqa` es un checkpoint experimental de visión-lenguaje publicado por el usuario tahamajs dentro del proyecto NeuralOps. No es un modelo entrenado desde cero, sino el resultado de una cirugía de atención sobre el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf`: se sustituyen las proyecciones lineales estándar de la atención por módulos `SALTLinear` (familia SVD) en 18 de las 24 capas del decoder, dejando congelados el torreón visual SigLIP, el proyector multimodal y seis capas ancla de atención cuadrática.

El objetivo declarado es la compresión extrema del artefacto de pesos: el repositorio serializa únicamente los pesos modificados de atención en FP16 (`attention_weights.safetensors`, 46,40 MB), frente a los 1,66 GB del modelo base completo, una reducción del 97,3 %. El modelo se evalúa en el subconjunto con imagen de ScienceQA (validación) y se afina mediante destilación de conocimiento desde el modelo profesor.

Su relevancia es metodológica más que de producto: sirve como banco de pruebas reproducible de técnicas de "attention surgery" y destilación sobre un VLM pequeño, con telemetría completa de entrenamiento (RTX 3090, 295 pasos, 120,4 s). No obstante, la precisión final (33,12 %) está muy por debajo del profesor (63,75 %), por lo que no es apto para uso en producción sin un reentrenamiento adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (torreón visual SigLIP congelado + proyector MLP de 2 capas + decoder Qwen2 de 24 capas) con módulos SALTLinear en atención |
| Parametros totales | no disponible (el artefacto serializado contiene 606 tensores de atención; el modelo base es de 0,5B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 en los pesos de atención serializados; no se documentan otras cuantizaciones |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, solo atención, FP16) + `surgical_manifest.json` |

## Arquitectura y entrenamiento

El modelo parte de `llava-interleave-qwen-0.5b-hf`, cuya estructura es un torreón visual SigLIP de 27 capas congelado, un proyector MLP de 2 capas y un decoder Qwen2 de 24 capas con dimensión oculta D=1024, 16 cabezas y head_dim=64. La cirugía aplica el operador `salt_attention` (familia SVD) en 18 de las 24 capas del decoder, manteniendo seis capas ancla con atención cuadrática completa en los índices [3, 7, 11, 15, 19, 23] bajo un patrón `hybrid_3_1`. Se congelan el torreón visual, el proyector, los MLP del decoder y los embeddings; solo se entrenan las atenciones modificadas y los layernorms del decoder.

El entrenamiento combina destilación de conocimiento desde el modelo profesor en dos etapas (133 + 162 pasos, 295 en total), ejecutadas en una RTX 3090 de 24 GB con un pico de 16.489 MB de VRAM y una duración total de 120,4 segundos. La evaluación se realiza sobre el subconjunto con imagen de ScienceQA en validación. No se documenta el número de tokens de entrenamiento, la composición del dataset más allá de ScienceQA ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) en formato conversacional.
- Respuesta a preguntas visuales de tipo STEM (ScienceQA), seleccionando la letra de opción correcta.
- Razonamiento multimodal básico sobre figuras y diagramas científicos.
- Soporte de chat multi-turno mediante plantilla de chat incluida (`chat_template.json`).
- Procesamiento de imágenes con preprocesador SigLIP configurado (`preprocessor_config.json`).
- No se documenta soporte de tool calling, function calling, agentes, visión de vídeo, audio ni modo "thinking".

## Casos de uso

- Investigación en compresión de modelos: el checkpoint sirve como referencia reproducible para medir el impacto de sustituir atenciones por módulos SVD en un VLM de 0,5B, con manifiesto quirúrgico y métricas de telemetría incluidos.
- Docencia y experimentación académica: permite estudiar destilación de conocimiento sobre ScienceQA con un coste de cómputo mínimo (una sola RTX 3090 y 2 minutos de entrenamiento).
- Prototipado de pipelines VLM de bajo coste: el artefacto de 46,40 MB se puede cargar en entornos con almacenamiento limitado para validar integraciones antes de escalar a modelos mayores.
- Benchmarking de operadores de atención: comparar `salt_attention` frente a atención cuadrática estándar usando la accuracy y perplejidad declaradas como línea base.
- Evaluación de estrategias híbridas de atención: el patrón `hybrid_3_1` con seis capas ancla permite analizar el equilibrio entre compresión y calidad en tareas de razonamiento visual.
- Reproducción de experimentos de "attention surgery": el repositorio incluye configuración, manifiesto y métricas legibles por máquina para replicar el procedimiento sobre otros modelos base.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre ScienceQA, subconjunto con imagen STEM, split de validación:

| Metrica | Profesor (baseline) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 31,25 | 33,12 | +1,87 |
| Perplejidad (PPL) | 2,45 | 14,07 | 3,04 | -11,03 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el entrenamiento consumió 16.489 MB de pico en una RTX 3090, pero la inferencia con el artefacto de atención (46,40 MB) más el modelo base requiere cargar también el torreón visual y el resto de componentes congelados.
- GPU recomendadas: RTX 3090 (24 GB) es la GPU usada por el autor; se desconoce el comportamiento en A100, H100 o GPUs de menor VRAM.
- GPU de consumo: probablemente asequible en GPUs de 16-24 GB, aunque no se documenta oficialmente.
- Opciones de despliegue: la librería `neuralops` mediante `load_surgeried_model`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (img, val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-salt-attention-scienceqa | no disponible (base 0,5B) | no disponible | 33,12 % acc / 3,04 PPL | MIT | Hugging Face |
| llava-hf/llava-interleave-qwen-0.5b-hf (profesor) | 0,5B | no disponible | 63,75 % acc / 2,45 PPL | no disponible en la informacion | Hugging Face |
| Alternativas de 0,5B con ScienceQA | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Precisión muy inferior al modelo profesor: 33,12 % frente a 63,75 % en ScienceQA, lo que indica una pérdida sustancial de capacidad tras la cirugía de atención.
- Solo se serializan los pesos de atención modificados; para inferencia es necesario cargar el modelo base completo y aplicar el manifiesto quirúrgico.
- Idiomas: únicamente inglés; no se documenta soporte multilingüe.
- No se documentan sesgos, riesgos de alucinación ni evaluaciones de seguridad; al ser un modelo de 0,5B, la fiabilidad factual es limitada.
- Licencia MIT, lo que permite uso comercial, pero el modelo base puede tener condiciones adicionales no reflejadas en esta ficha.
- Resultados de benchmarks no verificados (`verified: false`); deben tratarse como declaraciones del autor.
- No apto para producción sin un reentrenamiento o ajuste adicional: el rendimiento en razonamiento visual STEM es bajo en términos absolutos.
- Dependencia de la librería `neuralops`, poco extendida, lo que puede complicar la integración en stacks estándar.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-salt-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de SALTAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/svd/salt_attention.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
