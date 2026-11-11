# tahamajs/llava-qwen-0.5b-spectron-fp8-scienceqa

## Resumen

`llava-qwen-0.5b-spectron-fp8-scienceqa` es un checkpoint experimental publicado por el usuario tahamajs dentro del ecosistema NeuralOps, una librería propia para lo que el autor denomina "attention surgery" y destilación de conocimiento sobre modelos multimodales. El modelo parte de `llava-hf/llava-interleave-qwen-0.5b-hf` (un VLM compacto con torre visual SigLIP congelada, proyector MLP de dos capas y decodificador Qwen2 de 24 capas) y sustituye el mecanismo de atención de 18 de sus 24 capas por un operador híbrido propietario llamado `SpectronFP8Attention`, manteniendo seis capas de atención cuadrática como anclas.

El objetivo declarado es la compresión y modularidad: en lugar de redistribuir un modelo completo, el repositorio publica únicamente los pesos delta de las atenciones modificadas (`attention_weights.safetensors`, 106,42 MB) junto con un manifiesto quirúrgico que describe la topología de la intervención. El resultado es un artefacto aproximadamente 16 veces más pequeño que el modelo base en FP16 (1,66 GB), pensado para cargarse mediante la API `load_surgeried_model` de NeuralOps.

Es relevante ahora como ejemplo de una tendencia incipiente de checkpoints "quirúrgicos" y modularmente empaquetados, pero conviene tratarlo con cautela: el propio autor reporta una accuracy de 31,25 % en el subconjunto con imagen de ScienceQA (validation), muy por debajo del 63,75 % del modelo profesor, y el repositorio tiene cero descargas y cero likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLM LLaVA (torre visual SigLIP congelada + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas), con atención híbrida `SpectronFP8Attention` en 18/24 capas |
| Parámetros totales | No disponible (el modelo base LLaVA-Qwen-0.5B tiene ~0,5B; el artefacto publicado contiene solo 696 tensores de atención, 111.593.000 bytes) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Pesos delta en FP16 (`weights_format=attention_only_fp16`); el nombre sugiere FP8 en el operador, pero no se detalla el esquema de cuantización |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`) + `surgical_manifest.json` (schema `neuralops.surgery/v2`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de LLaVA-Interleave-Qwen-0.5B: una torre visual SigLIP de 27 capas completamente congelada, un proyector multimodal MLP de dos capas y un decodificador tipo Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas de atención y `head_dim` de 64. Sobre esta base, el autor aplica una intervención quirúrgica que reemplaza la self-attention de 18 capas del decodificador por `SpectronFP8Attention` (familia `hybrid`, esquema `hybrid_3_1`), conservando seis capas con atención cuadrática estándar como anclas en los índices `[3, 7, 11, 15, 19, 23]`. Los MLPs, embeddings, proyector y torre visual quedan congelados y excluidos del artefacto publicado; solo se guardan las atenciones modificadas y los layernorms del decodificador entrenados.

El entrenamiento consistió en una destilación de conocimiento en dos etapas (25 + 49 = 74 pasos de optimización) ejecutada en una única RTX 3090 de 24 GB, con una duración total de 121,4 segundos y un pico de VRAM de 15.977 MB. El dataset declarado es `derek-thomas/ScienceQA`, evaluado sobre el subconjunto con imagen de la split de validación. No se documentan detalles sobre la composición exacta del dataset de entrenamiento, la función de pérdida de destilación ni si hubo ajuste por RLHF/DPO; dado el número de pasos y la duración, se trata de un ajuste muy ligero orientado a demostrar la viabilidad del pipeline más que a producir un modelo competitivo.

## Capacidades

- Generación de texto e image-text-to-text: responde a preguntas sobre imágenes en formato conversacional, siguiendo la plantilla de chat de LLaVA-Interleave.
- Razonamiento visual básico sobre figuras STEM: el checkpoint está afinado específicamente sobre ScienceQA, con preguntas de ciencia que incluyen diagramas.
- Respuesta de opción múltiple: la plantilla de ejemplo del autor pide responder con la letra de la opción, lo que sugiere soporte para formato de examen tipo test.
- Conversación multi-turno: hereda el `chat_template` del modelo base LLaVA-Interleave.
- Capacidades multilingües: limitadas al inglés según la model card.
- Tool calling / function calling: no disponible.
- Modo thinking / razonamiento extendido: no disponible.
- Audio: no disponible.

## Casos de uso

- Investigación sobre atención híbrida: el checkpoint sirve como banco de pruebas reproducible para estudiar el efecto de sustituir atención cuadrática por operadores híbridos en un VLM pequeño, gracias al manifiesto quirúrgico que documenta exactamente qué capas se modificaron.
- Destilación de conocimiento a bajo coste: con 74 pasos y 121 segundos en una RTX 3090, el pipeline es un ejemplo práctico de cómo aproximar un modelo profesor con un artefacto de 106 MB, útil para experimentos académicos con presupuesto limitado.
- Evaluación de pipelines de "attention surgery": permite validar herramientas de NeuralOps como `load_surgeried_model` y el formato `neuralops.surgery/v2` antes de aplicarlos a modelos mayores.
- Prototipado de asistentes educativos STEM: para demos internas de respuesta a preguntas con imagen en inglés sobre contenido científico, aceptando la precisión limitada del modelo.
- Estudio de empaquetado modular de pesos: el formato delta (solo atenciones modificadas) es un caso de interés para quienes diseñan sistemas de distribución de checkpoints comprimidos.
- Benchmarking de cuantización FP8 en VLMs pequeños: el nombre `spectron_fp8` sugiere experimentación con precisión reducida en el operador de atención, útil para medir impacto en perplejidad y accuracy a pequeña escala.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Métrica | Profesor (baseline) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 33,12 | 31,25 | -1,87 |
| Perplejidad (PPL) | 2,45 | 22,74 | 3,62 | -19,12 |

Evaluación sobre ScienceQA (Image-Bearing STEM Subset, validation). El modelo final pierde 1,87 puntos de accuracy respecto al estado pre-destilación pero reduce la perplejidad de 22,74 a 3,62, lo que indica que la destilación ajusta bien la distribución de probabilidad aunque no mejora la exactitud en la tarea. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento usó 15.977 MB en una RTX 3090, pero ese pico incluye el modelo base completo, el profesor y estados de optimización.
- GPU recomendadas: el autor entrenó en una NVIDIA GeForce RTX 3090 (24 GB); por el tamaño del modelo base (~0,5B), la inferencia debería caber en GPUs consumer de 8-16 GB, aunque no se documenta.
- Cabe en GPU consumer: probablemente sí (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090), pero sin cifras verificadas en la model card.
- Opciones de despliegue: la única vía documentada es la API propietaria `neuralops.hub.load_surgeried_model`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento ScienceQA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/llava-qwen-0.5b-spectron-fp8-scienceqa` | ~0,5B (base); artefacto de 106 MB | No disponible | 31,25 % accuracy, PPL 3,62 | MIT | Hugging Face (0 descargas) |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (base/profesor) | ~0,5B | No disponible | 63,75 % accuracy (declarado como profesor) | No disponible en la información | Hugging Face (modelo público) |
| LLaVA-1.5-7B | ~7B | No disponible en la información | No disponible | No disponible | Hugging Face |
| Qwen2-VL-2B | ~2B | No disponible en la información | No disponible | No disponible | Hugging Face |

La comparativa se limita al modelo base porque no se han proporcionado datos de benchmarks de alternativas en la información disponible. El checkpoint quirúrgico rinde aproximadamente la mitad que su profesor en accuracy sobre ScienceQA.

## Limitaciones y advertencias

- Rendimiento muy por debajo del modelo base: 31,25 % frente a 63,75 % de accuracy en ScienceQA validation, según datos del propio autor y sin verificación independiente.
- Artefacto incompleto: solo contiene pesos de atención (696 tensores, 106 MB); requiere el modelo base LLaVA-Qwen-0.5B y la librería NeuralOps para funcionar, no es un checkpoint autónomo.
- Dependencia de una librería propietaria y poco extendida (`neuralops`), lo que limita la portabilidad y la integración con ecosistemas estándar (transformers, vLLM, llama.cpp).
- Entrenamiento extremadamente corto (74 pasos, 121 segundos) sobre un único dataset; alto riesgo de sobreajuste a ScienceQA y escasa generalización.
- Solo inglés; sin soporte documentado de otros idiomas.
- Riesgo elevado de alucinación en preguntas visuales fuera de la distribución de ScienceQA.
- Sesgos: no documentados; al derivar de Qwen2 y SigLIP, hereda los sesgos de sus datos de preentrenamiento, no evaluados por el autor.
- Licencia MIT declarada, lo que permite uso comercial, pero el modelo base y la torre visual pueden tener condiciones adicionales no especificadas en esta ficha.
- Repositorio sin tracción (0 descargas, 0 likes) y con marcas de tiempo futuras (creado 2026-11-11), lo que aconseja tratar los metadatos con escepticismo.
- No apto para producción sin una evaluación independiente exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-spectron-fp8-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador `SpectronFP8Attention`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/hybrid/spectron_fp8_attention.py
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
