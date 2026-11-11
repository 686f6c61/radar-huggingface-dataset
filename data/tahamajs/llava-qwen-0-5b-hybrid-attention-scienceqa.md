# tahamajs/llava-qwen-0.5b-hybrid-attention-scienceqa

## Resumen

`llava-qwen-0.5b-hybrid-attention-scienceqa` es un checkpoint experimental de tipo vision-language publicado por el usuario `tahamajs` dentro del proyecto NeuralOps, un "Attention Surgery Zoo" que sustituye el mecanismo de atención estándar de modelos existentes por operadores alternativos. En este caso, el modelo parte de `llava-hf/llava-interleave-qwen-0.5b-hf` y reemplaza la atención cuadrática de 18 de sus 24 capas del decoder Qwen2 por un operador `HybridAttention` (softmax + atención lineal con fusión dinámica por cabeza), manteniendo 6 capas cuadráticas como anclas. El resultado se afina mediante destilación de conocimiento sobre el subconjunto con imágenes de ScienceQA.

La relevancia del modelo no está en su rendimiento absoluto, sino en su naturaleza de artefacto de investigación: demuestra que es posible comprimir quirúrgicamente un VLM pequeño (0,5B parámetros) reduciendo el peso serializado a 180,79 MB frente a los 1,66 GB del base FP16 (un 89,4 % menos), recuperando además buena parte de la precisión perdida mediante destilación. El checkpoint se distribuye como delta quirúrgico modular, no como modelo completo, y requiere la librería `neuralops` para cargarse.

Se trata de un modelo de nicho, con cero descargas y sin verificación externa de sus métricas, orientado a quienes investigan eficiencia de atención, compresión de VLMs o técnicas de atención híbrida. No es un modelo listo para producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (SigLIP vision tower + proyector MLP de 2 capas + decoder Qwen2 de 24 capas) con atención híbrida en 18/24 capas |
| Parametros totales | 0,5B (modelo base); el artefacto distribuido son pesos delta de 180,79 MB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (pesos safetensors); no se documentan otras cuantizaciones |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, delta quirúrgico FP16) + manifiesto JSON |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura LLaVA-Interleave de Qwen 0.5B: una torre de visión SigLIP congelada de 27 capas, un proyector multimodal MLP de 2 capas y un decoder Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas de atención y dimensión de cabeza 64. La intervención quirúrgica sustituye el `self_attn` de 18 de las 24 capas por `HybridAttention`, un operador que combina softmax y atención lineal con fusión dinámica ponderada por cabeza. Las 6 capas restantes (índices 3, 7, 11, 15, 19, 23) conservan atención cuadrática como anclas. La torre de visión, el proyector, los MLP del decoder y los embeddings permanecen congelados y no se incluyen en el artefacto.

El entrenamiento se realizó en dos etapas (5 pasos en la etapa 1 y 170 en la etapa 2, 175 pasos totales) con destilación de conocimiento desde el modelo profesor, sobre el subconjunto con imágenes de ScienceQA. La telemetría reportada indica 120,2 segundos de entrenamiento en una RTX 3090 de 24 GB, con un pico de VRAM de 22 236 MB. No se especifican el número de tokens de entrenamiento ni la composición detallada del dataset más allá de ScienceQA.

## Capacidades

- Respuesta a preguntas visuales (VQA) sobre imágenes con contenido STEM (ciencia, tecnología, ingeniería y matemáticas).
- Razonamiento multimodal básico limitado al formato de ScienceQA (pregunta + imagen + opciones de respuesta).
- Generación de texto conversacional en inglés mediante plantilla de chat.
- Selección de opción de respuesta múltiple en el formato específico del benchmark.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, audio ni otras capacidades especiales.
- Multilingüismo limitado al inglés.

## Casos de uso

- Investigación en eficiencia de atención: sirve como referencia reproducible para comparar `HybridAttention` frente a atención cuadrática estándar en un VLM pequeño, con métricas de precisión y perplejidad antes y después de la destilación.
- Estudio de compresión de modelos: el artefacto de 180,79 MB frente a los 1,66 GB del base permite analizar el impacto de distribuir solo pesos delta quirúrgicos en lugar del modelo completo.
- Evaluación de destilación de conocimiento: la tabla profesor / pre-KD / post-KD (63,75 % / 33,12 % / 58,75 %) ofrece un caso concreto para estudiar la recuperación de capacidad tras una cirugía agresiva.
- Benchmarking de VQA científica: útil para medir el suelo de rendimiento de un VLM de 0,5B en el subconjunto con imágenes de ScienceQA, como baseline en experimentos comparativos.
- Docencia y divulgación: ejemplo didáctico de sustitución modular de operadores de atención en un pipeline LLaVA, con manifiesto quirúrgico y configuración auditables.
- Prototipado de pipelines NeuralOps: permite validar la API `load_surgeried_model` y el flujo de carga de checkpoints delta antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados externamente), sobre el subconjunto con imágenes de ScienceQA, split de validación:

| Metrica | Profesor (base) | Pre-KD (zero-shot) | Post-KD (final) | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 33,12 | 58,75 | +25,63 |
| Perplejidad | 2,45 | 6,30 | 2,28 | -4,02 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento consumió 22 236 MB de pico en una RTX 3090, pero la inferencia del checkpoint delta requiere cargar además el modelo base completo; no se documenta una cifra de VRAM específica para inferencia.
- GPU recomendadas: RTX 3090 (24 GB) fue la hardware usada en el entrenamiento; GPUs con al menos 24 GB son un punto de partida razonable.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3090, RTX 4090 y similares con 24 GB o más, aunque no se confirma oficialmente.
- Opciones de despliegue: la única vía documentada es la API `neuralops.hub.load_surgeried_model`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (acc.) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-hybrid-attention-scienceqa | 0,5B | no disponible | 58,75 % (no verificado) | MIT | Hugging Face (delta NeuralOps) |
| llava-hf/llava-interleave-qwen-0.5b-hf (base) | 0,5B | no disponible | 63,75 % (profesor, según el autor) | no disponible en esta ficha | Hugging Face |
| Otros VLM de ~0,5B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con alternativas adicionales de forma rigurosa.

## Limitaciones y advertencias

- Las métricas (58,75 % de accuracy, 2,28 de perplejidad) están declaradas por el autor y marcadas como no verificadas; no deben tomarse como referencia consolidada.
- El checkpoint es un delta quirúrgico, no un modelo autónomo: requiere el base `llava-hf/llava-interleave-qwen-0.5b-hf` y la librería `neuralops` para funcionar.
- El entrenamiento se limita a 175 pasos sobre ScienceQA; el riesgo de sobreajuste al formato del benchmark es alto y la generalización a otras tareas de VQA no está evaluada.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- No se documentan sesgos conocidos, pero al derivar de Qwen2 y ScienceQA hereda los sesgos de ambos.
- Riesgo de alucinación no cuantificado; en un modelo de 0,5B con atención lineal parcial es previsible que aumente fuera del dominio de entrenamiento.
- La licencia MIT permite uso comercial, pero la ausencia de verificación de métricas y de soporte desaconseja su uso en producción sin evaluación propia.
- No se documenta la longitud de contexto soportada, lo que impide planificar despliegues con entradas largas.
- Cero descargas y cero likes en el momento de la consulta: no hay comunidad ni evidencia de uso real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-hybrid-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de `HybridAttention`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/hybrid/hybrid_attention.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
