# tahamajs/llava-qwen-0.5b-svd-mamba-scienceqa

## Resumen

llava-qwen-0.5b-svd-mamba-scienceqa es un checkpoint experimental de visión-lenguaje publicado por el usuario tahamajs dentro del proyecto NeuralOps, un marco de "cirugía de atención" que sustituye módulos de atención cuadrática por operadores alternativos en modelos transformer preentrenados. En concreto, parte de llava-hf/llava-interleave-qwen-0.5b-hf y reemplaza la atención de 18 de las 24 capas del decodificador Qwen2 por un módulo SVD-Mamba (SVDMamba), que combina proyecciones factorizadas por descomposición en valores singulares, convolución causal y un modelo de espacio de estados selectivo. El resultado se ajusta mediante destilación de conocimiento sobre el subconjunto de ScienceQA con imágenes.

El modelo no es un lanzamiento de propósito general: es un artefacto de investigación que demuestra que es posible comprimir y modificar la topología de atención de un VLM pequeño manteniendo un rendimiento parcial. El repositorio no contiene los pesos completos, sino únicamente los deltas quirúrgicos de atención en FP16 (229,74 MB), que deben cargarse sobre el modelo base mediante la API de NeuralOps. Su relevancia actual es metodológica: documenta con telemetría detallada (pasos, VRAM, tiempo) un procedimiento reproducible de sustitución de atención y destilación en hardware de consumo.

Con 0,5 mil millones de parámetros en el decodificador y una torre visual SigLIP congelada, el modelo está pensado para experimentación académica en eficiencia de arquitecturas multimodales, no para despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: torre visual SigLIP congelada + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas con atención sustituida por SVDMamba en 18 capas (esquema hybrid_3_1) |
| Parámetros totales | No disponible (el decodificador Qwen2-0.5B tiene ~0,5 B; el total con torre visual no se declara) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (los pesos publicados están en FP16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (attention_weights.safetensors, deltas de atención en FP16); requiere el modelo base llava-hf/llava-interleave-qwen-0.5b-hf |

## Arquitectura y entrenamiento

La arquitectura base es LLaVA-Interleave con Qwen2-0.5B: una torre visual SigLIP de 27 capas congelada, un proyector multimodal MLP de 2 capas y un decodificador Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas y head_dim 64. La intervención quirúrgica sustituye el módulo self_attn en 18 de las 24 capas (esquema hybrid_3_1) por SVDMamba, que factoriza las proyecciones mediante SVD y añade convolución causal y un SSM selectivo. Se conservan seis capas de atención cuadrática como anclas en los índices [3, 7, 11, 15, 19, 23]. Permanecen congelados la torre visual, el proyector, los MLP del decodificador y los embeddings; solo se entrenan las capas sustituidas y los layernorms del decodificador.

El ajuste se realizó por destilación de conocimiento desde el modelo profesor (el LLaVA-Qwen-0.5B original) sobre el subconjunto de ScienceQA con imágenes (split de validación), en dos etapas: 19 pasos en la etapa 1 y 43 en la etapa 2, 62 pasos totales. El entrenamiento duró 121,1 segundos en una RTX 3090 de 24 GB, con un pico de VRAM de 17.471 MB. No se documenta el número de tokens de entrenamiento ni la composición completa del dataset más allá de ScienceQA. La innovación principal es el propio operador SVDMamba y el pipeline de cirugía con manifiesto reproducible (surgical_manifest.json, schema neuralops.surgery/v2, 912 tensores guardados).

## Capacidades

- Generación de texto e imagen-a-texto (pipeline image-text-to-text) en formato conversacional.
- Respuesta a preguntas visuales sobre imágenes, orientada a contenido STEM (ciencia, tecnología, ingeniería y matemáticas) por el dominio de ScienceQA.
- Razonamiento visual de opción múltiple: el prompt de ejemplo pide responder con la letra de la opción.
- Soporte de chat multi-turno mediante plantilla de chat incluida (chat_template.json).
- Procesamiento de imágenes con preprocesador propio (preprocessor_config.json).
- Capacidades limitadas al inglés.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, audio ni vídeo.

## Casos de uso

- Investigación en eficiencia de arquitecturas: servir como referencia reproducible para estudiar el impacto de sustituir atención por SSM en un VLM pequeño, con telemetría completa de entrenamiento y métricas antes y después de la destilación.
- Evaluación de operadores SVD-Mamba: comparar el comportamiento del módulo SVDMamba frente a atención cuadrática en tareas de razonamiento visual STEM, usando el checkpoint como banco de pruebas controlado.
- Docencia y divulgación: ilustrar en un curso de arquitecturas multimodales cómo se realiza una cirugía de atención capa a capa y cómo se mide la degradación con accuracy y perplejidad.
- Prototipado de bajo coste en hardware de consumo: al ocupar solo 229,74 MB de deltas y entrenarse en una RTX 3090, permite experimentar con VLMs en equipos modestos.
- Auditoría de pipelines de compresión: validar herramientas que cargan deltas quirúrgicos sobre un modelo base y verifican manifiestos de tensores (912 tensores, formato attention_only_fp16).
- Pruebas de regresión de infraestructura NeuralOps: ejercitar la API load_surgeried_model y el formato de manifiesto en entornos de integración continua.
- No es adecuado para atención al cliente, generación de código en producción ni aplicaciones comerciales sensibles al rendimiento, dado su accuracy del 43,75 % en la tarea objetivo.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre ScienceQA, subconjunto STEM con imágenes, split de validación:

| Métrica | Profesor (base) | Pre-destilación (zero-shot) | Post-destilación (final) | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 39,38 | 43,75 | +4,37 |
| Perplejidad | 2,45 | 1.551,51 | 4,34 | -1.547,17 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo base LLaVA-Qwen-0.5B en FP16 ocupa unos 1,66 GB, y los deltas de atención añaden 229,74 MB. En la práctica, cabe holgadamente en GPUs de 8 GB o menos.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM; el entrenamiento documentado se realizó en una NVIDIA GeForce RTX 3090 (24 GB) con pico de 17.471 MB.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: la vía documentada es la API de NeuralOps (neuralops.hub.load_surgeried_model) junto con PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el formato de deltas parciales dificulta su uso con esos motores sin conversión.
- Latencia y throughput: no disponibles. El entrenamiento de 62 pasos tardó 121,1 s en una RTX 3090, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-svd-mamba-scienceqa | ~0,5 B (decodificador) | No disponible | 43,75 % accuracy en ScienceQA (STEM con imágenes) | MIT | Pesos delta en HF |
| llava-hf/llava-interleave-qwen-0.5b-hf (profesor) | ~0,5 B (decodificador) | No disponible | 63,75 % accuracy en la misma tarea según el autor | No disponible en la información | Pesos completos en HF |
| Otros VLMs pequeños (p. ej. variantes LLaVA de <1 B) | ~0,5-1 B | No disponible | No disponible | Variable | Variable |

No se dispone de datos suficientes para comparar con alternativas de la misma categoría más allá del modelo profesor.

## Limitaciones y advertencias

- Rendimiento degradado: la accuracy cae del 63,75 % del profesor al 43,75 %, una pérdida de 20 puntos porcentuales; la perplejidad sube de 2,45 a 4,34.
- Artefacto incompleto: el repositorio solo contiene deltas de atención (229,74 MB), no los pesos completos; requiere el modelo base y la librería NeuralOps para funcionar.
- Sesgos: no documentados por el autor; al entrenarse solo con ScienceQA en inglés, el modelo hereda los sesgos de ese dataset y del modelo base.
- Riesgo de alucinación: elevado en preguntas fuera del dominio STEM o con imágenes distintas a las de ScienceQA, dado el ajuste estrecho y el bajo número de pasos.
- Idioma: solo inglés; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Licencia MIT: permite uso comercial según los términos, pero el modelo base llava-hf/llava-interleave-qwen-0.5b-hf tiene su propia licencia que debe verificarse por separado.
- Producción: no recomendado para aplicaciones reales; es un artefacto de investigación con métricas no verificadas (verified: false en el model-index).
- Contexto: no se documenta la longitud de contexto soportada tras la cirugía, lo que impide planificar despliegues con ventanas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-svd-mamba-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación SVDMamba: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/svd/svd_mamba.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
