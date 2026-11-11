# tahamajs/llava-qwen-0.5b-reap-moe-scienceqa

## Resumen

llava-qwen-0.5b-reap-moe-scienceqa es un checkpoint multimodal de tipo vision-language derivado de llava-hf/llava-interleave-qwen-0.5b-hf mediante una intervención de "attention surgery" implementada en la librería NeuralOps. El autor, tahamajs, sustituye el mecanismo de atención estándar de 18 de las 24 capas del decodificador Qwen2 por un operador denominado REAPMoEAttention (Robust Expert Allocation and Pruning Mixture of Experts), una variante de atención dispersa tipo MoE. El resultado se evalúa en el subconjunto con imagen de ScienceQA (validación).

El modelo resuelve el problema de comprimir y especializar un VLM pequeño (0,5B de parámetros) para razonamiento visual de tipo STEM, manteniendo el torreón de visión SigLIP congelado y aplicando destilación de conocimiento desde el modelo base. El artefacto serializado ocupa 411,64 MB en FP16, un 75,8 % menos que los 1,66 GB del modelo base completo, lo que lo hace atractivo para despliegues con recursos muy limitados.

Es relevante ahora como ejemplo reproducible de cirugía de atención sobre modelos multimodales pequeños: demuestra que es posible reemplazar selectivamente capas de atención por operadores dispersos y recuperar el rendimiento del profesor mediante destilación, con un coste de entrenamiento de 317 pasos y 120,4 segundos en una única RTX 3090.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM LLaVA: torre de visión SigLIP congelada (27 capas) + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas (D=1024, H=16, head_dim=64); 18/24 capas con atención REAPMoEAttention (familia sparse) |
| Parametros totales | 0,5B (heredados del base llava-interleave-qwen-0.5b-hf; el checkpoint guarda solo atención y layernorms modificados) |
| Parametros activos | no disponible (el autor no publica el número de expertos ni la fracción activa de REAPMoEAttention) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 safetensors) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (attention_weights.safetensors, attention_only_fp16, 1272 tensores) |

## Arquitectura y entrenamiento

La arquitectura parte del VLM LLaVA-Interleave con Qwen2 de 0,5B: torre de visión SigLIP congelada de 27 capas, proyector MLP de dos capas y decodificador Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas y head_dim 64. La intervención quirúrgica se aplica sobre 18 de las 24 capas del decodificador (esquema hybrid_3_1), reemplazando self_attn por el operador REAPMoEAttention, y se entrenan además las layernorms del decodificador. Se mantienen congelados el vision_tower, el multi_modal_projector, seis capas ancla cuadráticas en los índices [3, 7, 11, 15, 19, 23], los MLP del decodificador y los embeddings.

El entrenamiento combina dos etapas de destilación de conocimiento (142 pasos en la etapa 1 y 175 en la etapa 2, 317 en total) ejecutadas en una NVIDIA GeForce RTX 3090 de 24 GB, con un pico de VRAM de 16.153 MB y una duración total de 120,4 segundos. El resultado pasa de un 31,87 % de accuracy en zero-shot previo a la destilación a un 64,38 % final, superando ligeramente al profesor (63,75 %); la perplejidad baja de 5,12 a 2,60 frente a 2,45 del profesor. No se detalla la composición exacta del dataset de destilación más allá de ScienceQA, ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) y respuesta a preguntas visuales de tipo STEM.
- Razonamiento visual sobre figuras científicas, diagramas y esquemas del dominio ScienceQA.
- Respuesta en formato de opción múltiple (selección de letra de respuesta), tal como muestra el ejemplo de la model card.
- Conversación multi-turno mediante plantilla de chat incluida (chat_template.json).
- Procesamiento de imagen con preprocesador propio (preprocessor_config.json, resolución de ejemplo 384x384).
- Capacidades multilingües: solo inglés declarado.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, audio, vídeo): no disponible en la información proporcionada.

## Casos de uso

- Evaluación de preguntas visuales de ciencia en investigación: el modelo responde preguntas de opción múltiple sobre figuras STEM con un 64,38 % de accuracy en el subconjunto con imagen de ScienceQA, útil como línea base para experimentos de cirugía de atención.
- Tutor educativo ligero: integrado en una aplicación de refuerzo escolar, puede responder preguntas sobre diagramas de ciencias con un coste de cómputo mínimo gracias a sus 0,5B de parámetros y 411,64 MB de pesos.
- Prototipado rápido en hardware de consumo: al caber holgadamente en GPUs de gama media (el entrenamiento usó una RTX 3090 con 16 GB de pico), sirve para validar pipelines multimodales antes de escalar a modelos mayores.
- Investigación en atención dispersa: permite comparar el operador REAPMoEAttention frente a atención cuadrática estándar en las mismas capas, gracias a que el checkpoint conserva seis capas ancla cuadráticas.
- Destilación de conocimiento reproducible: el par de etapas (142 + 175 pasos) y las métricas de telemetría publicadas permiten replicar el proceso de recuperación de rendimiento tras la cirugía.
- Despliegue en entornos con memoria restringida: el artefacto de 411,64 MB (4,13x más pequeño que el base en FP16) encaja en dispositivos edge o contenedores con límites estrictos de almacenamiento.
- Clasificación automática de preguntas con imagen en pipelines de anotación: el formato de respuesta con letra de opción facilita la integración en flujos de etiquetado semiautomático.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Metrica | Profesor (base) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) en ScienceQA (subconjunto con imagen, validación) | 63,75 | 31,87 | 64,38 | +32,51 |
| Perplejidad en ScienceQA (subconjunto con imagen, validación) | 2,45 | 5,12 | 2,60 | -2,52 |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento con destilación consumió 16.153 MB de pico en una RTX 3090, por lo que la inferencia en FP16 debería requerir bastante menos.
- GPU recomendadas: NVIDIA RTX 3090 (usada en el entrenamiento); cualquier GPU con al menos 24 GB ofrece margen holgado. Para GPUs de 8-12 GB no hay datos publicados de funcionamiento.
- Cabe en GPU de consumo: sí, según la telemetría de entrenamiento en RTX 3090; no se confirma para GPUs de gama baja.
- Opciones de despliegue: la model card documenta la API `neuralops.hub.load_surgeried_model` de la librería NeuralOps. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; el único dato temporal es la duración del entrenamiento (120,4 s para 317 pasos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-reap-moe-scienceqa | 0,5B | no disponible | 64,38 % accuracy en ScienceQA (subconjunto con imagen, validación) | MIT | Hugging Face, librería NeuralOps |
| llava-hf/llava-interleave-qwen-0.5b-hf (base/profesor) | 0,5B | no disponible | 63,75 % accuracy en el mismo subconjunto (según el autor) | no disponible | Hugging Face |
| Otros VLM pequeños (p. ej. variantes de 0,5B-1B) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base porque la información proporcionada no incluye datos de alternativas de la misma categoría.

## Limitaciones y advertencias

- El checkpoint contiene únicamente los pesos de atención y layernorms modificados (1272 tensores, formato attention_only_fp16); requiere cargarse junto con el modelo base mediante la API de NeuralOps, no es un modelo autónomo.
- El dominio de evaluación es exclusivamente ScienceQA (subconjunto con imagen, validación); no hay evidencia de generalización a otras tareas visuales.
- Solo se declara inglés; no hay soporte multilingüe verificado.
- Los resultados de benchmarks están marcados como no verificados (`verified: false`) y proceden del propio autor.
- Riesgo de alucinación: no documentado en la información disponible, pero inherente a los VLM de este tamaño.
- Sesgos conocidos: no documentados en la información disponible.
- La licencia MIT permite uso comercial, pero el modelo base llava-interleave-qwen-0.5b-hf tiene su propia licencia que conviene revisar antes de producción.
- No se documentan limitaciones de longitud de contexto ni comportamiento fuera del formato de opción múltiple.
- El proyecto es muy reciente (creado el 2026-11-11) y sin descargas ni likes, por lo que carece de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-reap-moe-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador REAPMoEAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/sparse/reap_moe.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
