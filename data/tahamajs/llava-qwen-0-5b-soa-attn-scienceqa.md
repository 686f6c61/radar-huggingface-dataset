# tahamajs/llava-qwen-0.5b-soa-attn-scienceqa

## Resumen

llava-qwen-0.5b-soa-attn-scienceqa es un checkpoint multimodal derivado de llava-hf/llava-interleave-qwen-0.5b-hf mediante una técnica de cirugía de atención denominada SOAAttention (Shared Orthogonal Attention con cuellos de botella latentes por proyección). Lo publica el usuario tahamajs dentro del proyecto NeuralOps, un "zoo" de operadores de atención alternativos que se aplican sobre modelos preentrenados para reducir el coste computacional y el tamaño en disco. El modelo resuelve, en concreto, la pregunta de razonamiento visual sobre ciencia a nivel de primaria y secundaria evaluada en el subconjunto con imagen de ScienceQA.

La arquitectura subyacente es un LLaVA clásico: torre de visión SigLIP congelada, proyector MLP de dos capas y decodificador Qwen2 de 24 capas con dimensión oculta 1024 y 16 cabezas de atención (head_dim 64). La intervención de SOAAttention reemplaza las proyecciones densas Q, K y V en 18 de las 24 capas por pares de baja rangre inicializados mediante SVD truncada de los pesos originales, dejando intactas seis capas "ancla" cuadráticas y el resto de componentes (MLPs, embeddings, torre de visión y proyector).

Es relevante ahora porque demuestra un flujo de compresión agresiva con destilación de conocimiento sobre un VLM pequeño: el artefacto de pesos guardado ocupa 92,35 MB frente a los 1,66 GB del modelo base en FP16, una reducción del 94,6 % (18,42 veces más pequeño). El coste es una caída de precisión en ScienceQA del 63,75 % del profesor al 40,62 % tras la destilación, lo que lo sitúa como una pieza de investigación más que como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal tipo LLaVA: torre de visión SigLIP congelada + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas con atención SOAAttention en 18/24 capas |
| Parámetros totales | no disponible (el modelo base LLaVA-Qwen-0.5B ronda los 0,5 mil millones; el artefacto guardado contiene 336 tensores de atención en FP16) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (los pesos se distribuyen en FP16 safetensors) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (attention_only_fp16, 92,35 MB) más tokenizer, config y manifest en JSON |

## Arquitectura y entrenamiento

El modelo parte del checkpoint llava-hf/llava-interleave-qwen-0.5b-hf, que combina una torre de visión SigLIP de 27 capas (congelada) con un proyector MLP de dos capas y un decodificador Qwen2 de 24 capas, dimensión 1024, 16 cabezas y head_dim 64. La cirugía SOAAttention factoriza las proyecciones densas Q, K y V en pares de baja rangre con cuellos de botella latentes por proyección, inicializados por SVD truncada de los pesos preentrenados. Se aplica sobre 18 de las 24 capas (esquema hybrid_3_1), manteniendo seis capas ancla cuadráticas en los índices 3, 7, 11, 15, 19 y 23, y se congelan la torre de visión, el proyector, los MLPs y los embeddings. Solo se entrenan las atenciones modificadas y los layernorms del decodificador.

El entrenamiento es una destilación de conocimiento en dos etapas sobre el subconjunto con imagen de ScienceQA (dataset derek-thomas/ScienceQA), con 313 pasos totales (141 en la etapa 1 y 172 en la etapa 2), 120,5 segundos de duración y un pico de VRAM de 15.355 MB en una única RTX 3090 de 24 GB. No se documentan el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO. La innovación técnica destacable es el propio operador SOAAttention y su integración en un pipeline de "cirugía" reproducible con manifest (schema_version=neuralops.surgery/v2) que permite auditar qué prefijos se han modificado y cuáles se han congelado.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) en formato conversacional.
- Respuesta a preguntas visuales de tipo STEM: interpretación de figuras, diagramas y esquemas científicos.
- Razonamiento de opción múltiple sobre contenido de ciencia a nivel escolar, con formato de respuesta por letra.
- Soporte de chat multi-turno mediante plantilla de chat incluida (chat_template.json).
- Procesamiento de imagen con preprocesador propio (preprocessor_config.json) para la torre SigLIP.
- Capacidad multilingüe limitada al inglés.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento extendido (thinking mode).
- No se documenta soporte de audio ni de vídeo.

## Casos de uso

- Investigación en compresión de modelos: sirve como referencia reproducible para medir el impacto de SOAAttention sobre un VLM pequeño, comparando precisión y perplejidad antes y después de la destilación.
- Evaluación de técnicas de cirugía de atención: el manifest permite aislar qué capas se han modificado y qué capas ancla se mantienen, útil para estudiar el equilibrio entre compresión y rendimiento.
- Prototipado de tutores educativos de ciencia: con 40,62 % de precisión en ScienceQA, puede emplearse en demos internas de respuesta a preguntas visuales sobre figuras científicas, siempre con revisión humana.
- Benchmarking de pipelines de destilación: el par de métricas (precisión y perplejidad) y la telemetría de entrenamiento (pasos, tiempo, VRAM) permiten comparar recetas de KD sobre el mismo dataset.
- Despliegue en entornos con recursos muy limitados: el artefacto de 92,35 MB facilita pruebas en máquinas sin GPU dedicada o en contenedores pequeños, aunque requiere la librería NeuralOps.
- Estudio de la degradación por cuantización estructural: la diferencia entre el estado pre-KD (perplejidad 2.093,95) y el post-KD (3,01) documenta cuánto recupera la destilación tras una factorización agresiva.
- Base para experimentos de atención eficiente: al mantener seis capas cuadráticas y 18 factorizadas, es un banco de pruebas para medir latencia y calidad en configuraciones híbridas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Métrica | Profesor (base) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Precisión (%) en ScienceQA (subconjunto con imagen, validation) | 63,75 | 31,87 | 40,62 | +8,75 |
| Perplejidad en ScienceQA (subconjunto con imagen, validation) | 2,45 | 2.093,95 | 3,01 | -2.090,94 |

Telemetría de entrenamiento declarada: 313 pasos, 120,5 s, pico de 15.355 MB de VRAM en una RTX 3090. El autor no publica comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el entrenamiento consumió 15.355 MB en una RTX 3090, por lo que la inferencia en FP16 debería caber holgadamente en GPUs de 8-12 GB, aunque no se documenta.
- GPU recomendadas: no disponibles; el autor solo reporta la RTX 3090 usada para el entrenamiento.
- Compatibilidad con GPU de consumo: probable en tarjetas con al menos 8 GB de VRAM, sin confirmación oficial.
- Opciones de despliegue: la model card solo documenta la API neuralops.hub.load_surgeried_model; no se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato de pesos (attention_only_fp16 con manifest) no es directamente compatible con esos motores sin conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión ScienceQA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-soa-attn-scienceqa | ~0,5 mil millones (base) | no disponible | 40,62 % (subconjunto con imagen, validation) | MIT | Hugging Face, requiere NeuralOps |
| llava-hf/llava-interleave-qwen-0.5b-hf (profesor) | ~0,5 mil millones | no disponible | 63,75 % (mismo subconjunto, declarado por el autor) | no disponible en la información | Hugging Face |
| Alternativas de tamaño similar (p. ej. otros VLM de 0,5B) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de terceros para establecer una comparación rigurosa con otros VLM de la misma categoría.

## Limitaciones y advertencias

- La precisión cae 23,13 puntos respecto al profesor (63,75 % a 40,62 %) en ScienceQA, lo que limita su uso en tareas reales de razonamiento visual.
- El estado pre-destilación tiene una perplejidad de 2.093,95; aunque la destilación la reduce a 3,01, sigue por encima de la del profesor (2,45).
- Solo se ha evaluado en un dataset (ScienceQA, subconjunto con imagen) y en un único split de validación; no hay evidencia de generalización a otros dominios.
- Idioma limitado al inglés; no se documenta comportamiento en castellano ni en otros idiomas.
- No se documentan sesgos conocidos, pero al entrenarse sobre material educativo de ciencia puede heredar sesgos de ese corpus.
- Riesgo de alucinación no cuantificado; en preguntas visuales de opción múltiple el formato de respuesta puede mitigar parcialmente el problema, pero no se aportan datos.
- El formato de pesos es específico de NeuralOps (attention_only_fp16 más manifest) y no es cargable directamente con transformers, vLLM o llama.cpp sin herramientas de conversión.
- La licencia MIT permite uso comercial, pero el modelo base llava-hf/llava-interleave-qwen-0.5b-hf tiene su propia licencia que no se detalla en la información disponible; conviene verificarla antes de un despliegue comercial.
- El checkpoint no incluye los pesos de la torre de visión ni del proyector (congelados y excluidos), por lo que la carga requiere el modelo base completo.
- No hay descargas ni "likes" en el momento de la consulta, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-soa-attn-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de SOAAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/fast_kernels/soa_attn.py
- Licencia del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
