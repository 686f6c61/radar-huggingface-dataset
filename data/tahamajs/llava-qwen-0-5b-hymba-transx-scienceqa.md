# tahamajs/llava-qwen-0.5b-hymba-transx-scienceqa

## Resumen
`tahamajs/llava-qwen-0.5b-hymba-transx-scienceqa` es un checkpoint experimental de investigación publicado por el usuario tahamajs dentro del marco NeuralOps, un proyecto de "cirugía de atención" (attention surgery) que sustituye módulos de atención cuadrática de transformers por bloques híbridos de transformer y modelos de espacio de estados (SSM). El modelo parte de `llava-hf/llava-interleave-qwen-0.5b-hf`, un VLM LLaVA de 0,5 mil millones de parámetros con torre visual SigLIP congelada, proyector MLP de dos capas y decodificador Qwen2 de 24 capas, y aplica sobre él el operador `hymba_transx` (`HymbaTransXBlock`, familia SSM) en 18 de las 24 capas del decodificador.

El objetivo no es ofrecer un modelo listo para producción, sino demostrar una técnica de compresión y destilación de conocimiento: reemplazar la atención cuadrática por bloques híbridos SSM manteniendo seis capas de anclaje cuadráticas (`[3, 7, 11, 15, 19, 23]`) y recuperar capacidad mediante knowledge distillation desde el modelo profesor original. El resultado es un artefacto de pesos delta de 296,11 MB (frente a los 1,66 GB del modelo base en FP16, un 82,6 % menos) que alcanza un 41,25 % de accuracy en el subconjunto con imágenes de ScienceQA (validation), frente al 63,75 % del profesor.

Es relevante ahora como pieza de un zoo de variantes de atención sobre un mismo VLM pequeño: permite comparar operadores SSM e híbridos en una tarea multimodal concreta (razonamiento visual STEM) con telemetría de entrenamiento reproducible, aunque sus cifras absolutas están lejos de un uso comercial real y su ecosistema de carga (`neuralops`) es propio y no estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida transformer + SSM (`HymbaTransXBlock`) sobre LLaVA-Qwen-0.5B: torre visual SigLIP congelada + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas (D=1024, H=16, head_dim=64); 18/24 capas sustituidas por bloques SSM con esquema `hybrid_3_1` y 6 capas de anclaje cuadráticas |
| Parametros totales | No disponible (el modelo base LLaVA-Qwen-0.5B ronda los 0,5B; el artefacto publicado contiene solo pesos delta de 296,11 MB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | No disponible; los pesos se publican en FP16 (safetensors) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16), pesos delta quirúrgicos modulares; requiere `neuralops` para la carga |

## Arquitectura y entrenamiento
El modelo aplica una intervención estructural sobre el decodificador Qwen2 de LLaVA-Qwen-0.5B: 18 de las 24 capas de self-attention se reemplazan por `HymbaTransXBlock`, un bloque híbrido que combina atención diferencial con componentes de espacio de estados, dejando intactas seis capas cuadráticas de anclaje en las posiciones `[3, 7, 11, 15, 19, 23]` para preservar capacidad de modelado global. Permanecen congelados la torre visual SigLIP (27 capas), el proyector multimodal, los MLP del decodificador y los embeddings. Solo se entrenan y serializan las atenciones modificadas y los layernorms del decodificador.

El entrenamiento combina dos etapas de destilación de conocimiento desde el profesor `llava-hf/llava-interleave-qwen-0.5b-hf`: 5 pasos en la etapa 1 y 11 en la etapa 2, 16 pasos totales ejecutados en una única NVIDIA RTX 3090 (24 GB), con 121,8 segundos de duración y un pico de VRAM de 21.465 MB. La evaluación se realiza sobre el subconjunto con imágenes de ScienceQA (validation). La innovación destacable es el propio procedimiento de "cirugía" reproducible: un manifiesto (`surgical_manifest.json`) describe la topología de sustitución y los prefijos modificados, lo que permite auditar qué partes del modelo se han alterado.

## Capacidades
- Generación de texto e imagen-a-texto conversacional (pipeline `image-text-to-text`).
- Respuesta a preguntas visuales (VQA) sobre imágenes y diagramas, orientada a contenido STEM.
- Razonamiento visual de opción múltiple en el formato de ScienceQA (selección de letra de respuesta).
- Procesamiento conjunto de imagen y texto mediante el procesador LLaVA (placeholder `<image>` en el prompt).
- Capacidad multilingüe: limitada al inglés.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento extendido (thinking mode).
- No se documenta soporte de audio ni de vídeo.

## Casos de uso
- Investigación en eficiencia de arquitecturas: servir como punto de comparación controlado para medir el impacto de sustituir atención cuadrática por bloques SSM híbridos en un VLM de 0,5B, usando el mismo dataset y protocolo de evaluación.
- Estudio de destilación de conocimiento: analizar la recuperación de accuracy (de 38,12 % a 41,25 %) y la caída de perplejidad (de 2.206,83 a 3,29) tras la segunda etapa de KD frente al profesor, con telemetría completa de pasos y hardware.
- Reproducción de experimentos de attention surgery: el manifiesto quirúrgico y la configuración permiten replicar la topología `hybrid_3_1` y las capas de anclaje en otros checkpoints del zoo.
- Prototipado de VQA educativa en inglés: responder preguntas de opción múltiple sobre figuras científicas en entornos de investigación, aceptando que la precisión (~41 %) exige validación humana.
- Pruebas de despliegue en hardware de consumo: el artefacto de 296 MB y el pico de 21,5 GB durante el entrenamiento en una RTX 3090 permiten experimentar con inferencia en GPUs de gama alta de consumo.
- Docencia y divulgación técnica: ilustrar de forma práctica qué es un bloque híbrido transformer-SSM y cómo se audita un checkpoint modificado mediante `surgical_manifest.json`.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Métrica | Profesor (baseline) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) en ScienceQA (Image-Bearing STEM Subset, validation) | 63,75 | 38,12 | 41,25 | +3,13 |
| Perplejidad (PPL) en ScienceQA (Image-Bearing STEM Subset, validation) | 2,45 | 2.206,83 | 3,29 | -2.203,54 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; el artefacto de pesos delta ocupa 296,11 MB en FP16 y el modelo base completo 1,66 GB, por lo que la inferencia completa requiere cargar el base más el delta.
- GPU de entrenamiento documentada: NVIDIA GeForce RTX 3090 (24 GB), con pico de 21.465 MB de VRAM y 121,8 s para 16 pasos de optimización.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño del modelo base (0,5B) cabría esperar GPUs de consumo, pero no se confirma.
- Despliegue: la carga se realiza mediante `neuralops.hub.load_surgeried_model`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en ScienceQA (validation) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/llava-qwen-0.5b-hymba-transx-scienceqa` | ~0,5B (base) | No disponible | 41,25 % accuracy; PPL 3,29 | MIT | Hugging Face, requiere `neuralops` |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | ~0,5B | No disponible | 63,75 % accuracy; PPL 2,45 | No disponible en la información | Hugging Face, ecosistema transformers |
| Otros checkpoints del zoo NeuralOps sobre el mismo base | ~0,5B | No disponible | No disponible | MIT (según el repo) | Hugging Face, requiere `neuralops` |

No se dispone de datos de benchmarks de alternativas externas en la información proporcionada para una comparación más amplia.

## Limitaciones y advertencias
- Rendimiento muy por debajo del profesor: 41,25 % de accuracy frente a 63,75 % en ScienceQA, insuficiente para uso comercial sin supervisión.
- Sesgos conocidos: no documentados; al entrenarse solo en ScienceQA en inglés, el modelo probablemente hereda los sesgos del dataset y del base.
- Riesgo de alucinación: alto en tareas fuera de distribución, dado el bajo rendimiento y el entrenamiento limitado (16 pasos).
- Limitación de idioma: solo inglés; no se documenta soporte de castellano ni de otros idiomas.
- Limitación de dominio: especializado en VQA de opción múltiple sobre ScienceQA; no se documenta su comportamiento en otras tareas multimodales.
- Restricciones de licencia: MIT, permite uso comercial, pero el modelo base y los datos de entrenamiento pueden tener sus propias condiciones no detalladas aquí.
- Dependencia de ecosistema propietario: la carga requiere la librería `neuralops`, no estándar; no se garantiza compatibilidad con transformers, vLLM o llama.cpp.
- Pesos delta: el repositorio contiene solo los pesos modificados (296,11 MB), no un checkpoint completo autónomo; es necesario el modelo base.
- Resultados no verificados: las métricas de la model card están marcadas como `verified: false`.
- Contexto máximo no documentado: no se especifica la longitud de contexto soportada.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-hymba-transx-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del bloque `hymba_transx`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/ssm/hymba_transx.py
- Licencia MIT: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
