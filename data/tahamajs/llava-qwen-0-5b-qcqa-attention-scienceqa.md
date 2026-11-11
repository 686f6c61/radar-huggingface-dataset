# tahamajs/llava-qwen-0.5b-qcqa-attention-scienceqa

## Resumen

llava-qwen-0.5b-qcqa-attention-scienceqa es un checkpoint experimental de tipo "attention surgery" publicado por el usuario tahamajs dentro del ecosistema NeuralOps. Se deriva del modelo vision-lenguaje LLaVA-Qwen-0.5B de Hugging Face (llava-hf/llava-interleave-qwen-0.5b-hf) mediante la sustitución del mecanismo de atención en 18 de sus 24 capas del decodificador por un operador propio denominado QCQAAttention (Quality and Capacity-Aware Grouped Query Attention), perteneciente a la familia "modern" del registro de NeuralOps.

El modelo no es un entrenamiento desde cero ni un fine-tuning convencional: es una cirugía de atención combinada con destilación de conocimiento (knowledge distillation) sobre el subconjunto con imágenes de ScienceQA. El resultado es un artefacto parcial que solo contiene los pesos modificados de atención y las layer norms del decodificador, con un peso en disco de 370,67 MB frente a los 1,66 GB del modelo base en FP16, lo que supone una reducción del 78,2 %. El autor reporta una precisión del 68,12 % y una perplejidad de 2,38 en el split de validación de ScienceQA.

Su relevancia es fundamentalmente metodológica: demuestra un flujo de trabajo de sustitución de atención con destilación eficiente en VRAM (0 MB de VRAM del profesor, caché offline de representaciones, 120,6 segundos de entrenamiento en una RTX 3090). No obstante, es un artefacto de investigación con cero descargas y sin verificación independiente, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (torre de visión SigLIP congelada + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas) con atención sustituida por QCQAAttention en 18/24 capas |
| Parametros totales | 0,5B (modelo base); el artefacto publicado contiene 750 tensores de atención y layer norms |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (attention_weights.safetensors, FP16, solo atención y layer norms) |

## Arquitectura y entrenamiento

La arquitectura parte de LLaVA-Interleave-Qwen-0.5B: una torre de visión SigLIP congelada de 27 capas, un proyector multimodal MLP de 2 capas y un decodificador Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas y dimensión de cabeza 64. La intervención quirúrgica reemplaza la self-attention en 18 de las 24 capas (esquema hybrid_3_1) por el operador QCQAAttention, manteniendo seis capas ancla con atención cuadrática en los índices [3, 7, 11, 15, 19, 23]. Permanecen congelados la torre de visión, el proyector, los MLP del decodificador y los embeddings; solo se entrenan las atenciones modificadas y las layer norms del decodificador.

El entrenamiento se realizó mediante destilación de conocimiento con la arquitectura de caché offline de representaciones de NeuralOps (§21.1), sobre el dataset derek-thomas/ScienceQA. Se ejecutaron 292 pasos de optimización en dos etapas (127 + 165) en una NVIDIA GeForce RTX 3090 de 24 GB, con un pico de VRAM de 16.091 MB y una duración total de 120,6 segundos. El autor declara 0 MB de VRAM del profesor gracias a la caché offline. No se especifica el número de tokens de entrenamiento ni la composición detallada del dataset más allá de ScienceQA.

## Capacidades

- Generación de texto e imagen-a-texto (image-text-to-text) en inglés.
- Respuesta a preguntas visuales sobre contenido STEM (ciencia, tecnología, ingeniería y matemáticas) con imágenes.
- Razonamiento multimodal básico sobre diagramas y figuras científicas, limitado al dominio de ScienceQA.
- Conversación multi-turno mediante plantilla de chat incluida (chat_template.json).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No se documenta modo thinking, visión de alta resolución, audio ni otras modalidades.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Investigación en sustitución de mecanismos de atención: el checkpoint sirve como referencia reproducible para estudiar el impacto de reemplazar self-attention por operadores agrupados (QCQA) en un VLM pequeño, con métricas antes y después de la destilación.
- Docencia y experimentación con destilación de conocimiento: el flujo con caché offline de representaciones y 0 MB de VRAM del profesor es un ejemplo práctico de destilación en hardware de consumo (RTX 3090).
- Prototipado de asistentes educativos STEM: dado su rendimiento en ScienceQA (68,12 % de precisión), puede usarse como base para demos de preguntas y respuestas sobre imágenes científicas en inglés.
- Evaluación comparativa de operadores de atención: la reducción de tamaño (370,67 MB frente a 1,66 GB) permite distribuir y comparar variantes de atención en entornos con almacenamiento limitado.
- Pruebas de pipelines de imagen-a-texto con la librería neuralops: el modelo se carga mediante load_surgeried_model y sirve para validar integraciones con esa API.
- Benchmarking académico en ScienceQA: útil como baseline quirúrgico para comparar contra el modelo base llava-interleave-qwen-0.5b-hf y otras variantes del "attention zoo".

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Baseline profesor | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) en ScienceQA (Image-Bearing STEM Subset, validation) | 63,75 | 31,87 | 68,12 | +36,25 |
| Perplexity (PPL) en ScienceQA (validation) | 2,45 | 5,22 | 2,38 | -2,84 |

Telemetría de entrenamiento declarada: 292 pasos de optimización, 120,6 segundos, pico de 16.091 MB de VRAM en RTX 3090, 0 MB de VRAM del profesor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento requirió un pico de 16.091 MB en una RTX 3090, por lo que la inferencia completa del modelo base (0,5B) debería caber holgadamente en GPUs de consumo de 8-12 GB, aunque el dato no está confirmado.
- GPU recomendadas: NVIDIA RTX 3090 (usada en el entrenamiento); cualquier GPU con al menos 8 GB de VRAM debería ser suficiente para el modelo base en FP16, si bien no se documenta.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060/4060 y superiores, aunque no hay medición publicada.
- Opciones de despliegue: la model card solo documenta la API neuralops (load_surgeried_model). No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-qcqa-attention-scienceqa | 0,5B | no disponible | 68,12 % accuracy en ScienceQA (validation), declarado por el autor | MIT | Hugging Face, 0 descargas |
| llava-hf/llava-interleave-qwen-0.5b-hf (base) | 0,5B | no disponible | 63,75 % accuracy en ScienceQA (validation), según el autor | no disponible en la información | Hugging Face |
| Otros VLM pequeños (p. ej. variantes LLaVA de 0,5B-1B) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo experimental de investigación: cero descargas y cero likes en Hugging Face, sin validación independiente de los resultados.
- Los benchmarks (68,12 % de accuracy, 2,38 de perplejidad) están declarados por el autor y marcados como no verificados.
- El artefacto publicado contiene solo pesos de atención y layer norms (750 tensores); requiere el modelo base llava-hf/llava-interleave-qwen-0.5b-hf y la librería neuralops para funcionar.
- Dominio muy restringido: entrenado y evaluado únicamente en ScienceQA, en inglés.
- Riesgo de alucinación y de degradación fuera del dominio STEM con imágenes.
- Idiomas: solo inglés; no se documenta soporte multilingüe.
- Licencia MIT, lo que permite uso comercial, pero el modelo base puede tener condiciones adicionales no detalladas en la información disponible.
- Sin documentación sobre sesgos, contexto máximo, cuantizaciones ni despliegue en servidores de inferencia estándar.
- Fecha de creación y actualización (2026-11-11) y timestamps de entrenamiento (2026-11-11T09:03:58Z) posteriores a la fecha actual, lo que conviene verificar antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-qcqa-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador QCQAAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/modern/qcqa_attention.py
- Licencia MIT: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
