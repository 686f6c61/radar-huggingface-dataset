# tahamajs/llava-qwen-0.5b-cosformer-scienceqa

## Resumen

llava-qwen-0.5b-cosformer-scienceqa es un checkpoint experimental publicado por el usuario tahamajs dentro del proyecto NeuralOps, un "attention surgery zoo" que sustituye mecanismos de atención estándar por operadores alternativos en modelos preentrenados. En este caso, el modelo parte de llava-hf/llava-interleave-qwen-0.5b-hf (un VLM LLaVA con torre visual SigLIP congelada, proyector MLP de dos capas y decodificador Qwen2 de 24 capas con dimensión 1024) y reemplaza la atención cuadrática por CosformerAttention, un operador de atención lineal, en 18 de las 24 capas del decodificador.

El problema que aborda es la reducción de coste computacional en atención para modelos visión-lenguaje pequeños, aplicando atención lineal híbrida (3 capas lineales por cada capa cuadrática de anclaje) y recuperando calidad mediante destilación de conocimiento offline. El resultado es un artefacto de solo 184,78 MB de pesos delta frente a los 1,66 GB del modelo base FP16, lo que supone una reducción del 89,1 %.

Es relevante como ejemplo reproducible de cirugía de atención y destilación eficiente: el autor documenta telemetría completa de entrenamiento (101 pasos, 120,5 s, 19.937 MB de VRAM pico en una RTX 3090) y evalúa en el subconjunto con imágenes de ScienceQA (validación), obteniendo 45,00 % de accuracy y perplejidad 3,38. No obstante, se trata de un artefacto de investigación con muy poca tracción (9 descargas, 0 likes) y cuyos resultados no están verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (SigLIP vision tower + MLP projector + decoder Qwen2) con atención Cosformer lineal en 18/24 capas |
| Parametros totales | no disponible (modelo base LLaVA-Qwen-0.5B; pesos delta serializados de 184,78 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos delta en FP16 safetensors) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (attention_weights.safetensors, pesos delta quirúrgicos) + tokenizer.json, vocab.json, merges.txt |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura LLaVA interleave de Qwen 0.5B: torre visual SigLIP de 27 capas congelada, proyector multimodal MLP de dos capas y decodificador Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas y head_dim 64. La intervención sustituye la self-attention en 18 de las 24 capas por CosformerAttention (familia linear), manteniendo 6 capas cuadráticas de anclaje en los índices [3, 7, 11, 15, 19, 23] bajo un esquema híbrido 3:1. Se congelan la torre visual, el proyector, los MLP del decodificador, los embeddings y las capas de anclaje; solo se entrenan las atenciones modificadas y los layernorms del decodificador.

El entrenamiento se realiza mediante destilación de conocimiento offline con la arquitectura de caché de representaciones de NeuralOps, sobre una NVIDIA GeForce RTX 3090 de 24 GB, con 0 MB de VRAM del profesor en GPU. Se ejecutan 101 pasos de optimización (33 en etapa 1, 68 en etapa 2) en 120,5 s, con un pico de VRAM de 19.937 MB. El conjunto de evaluación es el subconjunto con imágenes de ScienceQA (derek-thomas/ScienceQA, split de validación). No se detalla en la información disponible el volumen de tokens de entrenamiento ni la composición completa del dataset más allá de ScienceQA.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) para preguntas de respuesta múltiple sobre figuras y diagramas STEM.
- Razonamiento visual básico orientado a preguntas de ciencia con opciones (formato ScienceQA).
- Conversación multi-turno mediante plantilla de chat incluida (chat_template.json).
- Procesamiento de imágenes a través del preprocesador SigLIP incluido (preprocessor_config.json).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés (idioma declarado: en).
- Modo thinking, visión avanzada, audio: no disponible.

## Casos de uso

- Evaluación de investigación en atención lineal: el checkpoint sirve para reproducir y comparar el impacto de sustituir atención cuadrática por Cosformer en un VLM pequeño, con métricas de accuracy y perplejidad ya registradas sobre ScienceQA.
- Destilación de conocimiento con recursos limitados: el flujo documentado (caché offline de representaciones, 0 MB de VRAM del profesor, 120,5 s en una RTX 3090) es replicable para experimentos de compresión en equipos de un solo GPU consumer.
- Prototipado de asistentes educativos STEM: responde preguntas con opción múltiple sobre figuras científicas, adecuado para demos de tutoría visual en inglés.
- Estudio de artefactos delta: el formato de pesos delta (184,78 MB frente a 1,66 GB del base) permite investigar técnicas de serialización y carga modular de subconjuntos de pesos.
- Benchmarking de operadores de atención: útil como punto de comparación frente a otros operadores del zoo NeuralOps (por ejemplo, variantes lineales alternativas) sobre la misma tarea y dataset.
- Docencia y divulgación técnica: ejemplo didáctico de cirugía de atención, congelación selectiva de componentes y evaluación controlada en un VLM de 0,5B.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente) sobre ScienceQA, subconjunto con imágenes STEM, split de validación:

| Metrica | Teacher baseline | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 30,63 | 45,00 | +14,37 |
| Perplejidad (PPL) | 2,45 | 121,07 | 3,38 | -117,69 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo base es de 0,5B parámetros y el artefacto delta ocupa 184,78 MB, por lo que la inferencia completa en FP16 debería caber holgadamente en GPUs consumer de 8 GB o menos, aunque esta cifra no está confirmada en la documentación.
- GPU utilizadas en el entrenamiento: NVIDIA GeForce RTX 3090 (24 GB), con pico de 19.937 MB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para el modelo completo; RTX 3090 o superior para reproducir el pipeline de destilación.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060/4060 y superiores, aunque no hay medición publicada.
- Opciones de despliegue: la carga se realiza mediante la API pública de NeuralOps Hub (`neuralops.hub.load_surgeried_model`); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento ScienceQA (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-cosformer-scienceqa | ~0,5B (delta 184,78 MB) | no disponible | 45,00 % accuracy, PPL 3,38 | MIT | Hugging Face (9 descargas) |
| llava-hf/llava-interleave-qwen-0.5b-hf (teacher) | ~0,5B | no disponible | 63,75 % accuracy, PPL 2,45 (según el autor) | no disponible en esta ficha | Hugging Face |
| Otros operadores del zoo NeuralOps | ~0,5B | no disponible | no disponible | MIT (presumible) | Hugging Face |
| VLMs pequeños alternativos (p. ej. SmolVLM, Qwen2-VL-2B) | 0,5B–2B | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos comparativos verificados con modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Los resultados (45,00 % accuracy, PPL 3,38) están declarados por el autor y marcados como no verificados; no hay evaluación independiente.
- La caída frente al teacher es notable: -18,75 puntos de accuracy y perplejidad 3,38 frente a 2,45, lo que indica pérdida de calidad tras la cirugía de atención y la destilación.
- El modelo solo declara soporte de inglés; no hay evidencia de capacidades multilingües.
- Riesgo de alucinación inherente a un VLM de 0,5B entrenado sobre un subconjunto específico (ScienceQA con imágenes); no se recomienda su uso fuera de ese dominio sin validación.
- Sesgos: no documentados en la información disponible, pero heredados del modelo base y del dataset ScienceQA.
- Licencia MIT, lo que permite uso comercial según los términos del repositorio NeuralOps; conviene revisar el LICENSE enlazado para confirmar condiciones exactas.
- Es un artefacto de investigación con muy poca adopción (9 descargas, 0 likes) y creado en una fecha futura respecto a la información habitual de modelos; no hay garantía de mantenimiento.
- Requiere la librería neuralops y su API de carga específica; no es directamente compatible con pipelines estándar de transformers sin adaptación.
- El formato de pesos delta implica que no es un modelo autónomo: necesita el modelo base llava-hf/llava-interleave-qwen-0.5b-hf para funcionar.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-cosformer-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de CosformerAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/linear/cosformer.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
