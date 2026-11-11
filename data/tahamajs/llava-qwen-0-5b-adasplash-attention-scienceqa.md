# tahamajs/llava-qwen-0.5b-adasplash-attention-scienceqa

## Resumen

`tahamajs/llava-qwen-0.5b-adasplash-attention-scienceqa` es un modelo de visión-lenguaje (VLM) multimodal derivado de `llava-hf/llava-interleave-qwen-0.5b-hf`, publicado por el autor Taha Majlesi dentro del proyecto NeuralOps. El modelo no es un fine-tuning convencional: es un experimento de "cirugía de atención" en el que 18 de las 24 capas de atención del decodificador Qwen2 se sustituyen por un mecanismo subcuadrático propietario denominado `AdaSplashAttention`, y posteriormente se destila sobre preguntas con imagen del dataset ScienceQA. El objetivo es medir cuánto aguanta un VLM pequeño cuando se reemplaza la atención cuadrática estándar por una aproximación con entmax y radio local.

La relevancia es doble. Por un lado, sirve como banco de pruebas reproducible de mecanismos de atención alternativos (attention zoo) sobre un VLM real de 0,5B parámetros, con la torre de visión SigLIP y el proyector MLP congelados. Por otro, demuestra que una destilación de solo 192 pasos de optimización recupera buena parte de la precisión perdida tras la sustitución: se pasa de un 32,41% de accuracy visual en zero-shot a un 44,14% tras la destilación, frente al 46,90% del profesor original.

Se trata de un modelo de nicho, orientado a investigación y no a producción general. El repositorio solo contiene los pesos de atención y layernorm en FP16 (682,17 MB), que se cargan sobre el modelo base con `strict=False`; no es un checkpoint autónomo. El contexto, el tamaño del vocabulario y los datos de entrenamiento detallados no están publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal LLaVA: encoder de visión SigLIP (congelado) + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas con 18 capas sustituidas por `AdaSplashAttention` (patrón `hybrid_3_1`) |
| Parametros totales | 0,5B (modelo base `llava-interleave-qwen-0.5b-hf`); geometría del decodificador: 24 capas, D=1024, H=16, d_h=64 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos publicados están en FP16) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 682,17 MB, FP16) + configs de processor y tokenizer |

## Arquitectura y entrenamiento

El modelo parte de `llava-hf/llava-interleave-qwen-0.5b-hf`, un LLaVA interleaved con torre de visión SigLIP, proyector MLP de dos capas y decodificador Qwen2 de 24 capas (D=1024, H=16, d_h=64). Sobre esa base se aplica una "cirugía de atención": 18 de las 24 capas se reemplazan por `AdaSplashAttention`, un mecanismo subcuadrático que combina α-entmax con un radio local tipo splash. Las 6 capas cuadráticas que se conservan actúan como anclas en las posiciones `[3, 7, 11, 15, 19, 23]` bajo el patrón `hybrid_3_1`. La torre de visión y el proyector multimodal permanecen completamente congelados, de modo que el experimento aísla cómo el mecanismo subcuadrático gestiona el enrutamiento cross-modal denso entre tokens visuales y de texto.

El entrenamiento consiste en una destilación de conocimiento sobre preguntas con imagen de `derek-thomas/ScienceQA`, en dos etapas (Stage 1: 71 pasos, Stage 2: 121 pasos), con un total de 192 pasos de optimización. La ejecución completa duró 120,7 segundos con un pico de 20.243 MB de VRAM en una NVIDIA RTX 3090 de 24 GB. No se documentan el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF/DPO; la información disponible solo indica destilación supervisada sobre ScienceQA.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) y respuesta a preguntas visuales (VQA).
- Razonamiento visual básico sobre contenidos científicos y educativos, limitado al dominio de ScienceQA.
- Conversación multi-turno con imágenes intercaladas, heredada del formato LLaVA interleave del modelo base.
- Comprensión de imágenes mediante el encoder SigLIP congelado y el proyector MLP.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo no está diseñado ni evaluado para ello.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (thinking mode, visión, audio): visión únicamente; no hay modo de razonamiento explícito ni audio.

## Casos de uso

- Investigación sobre mecanismos de atención subcuadráticos: el modelo permite comparar `AdaSplashAttention` frente a atención cuadrática estándar en un VLM real, con la torre de visión congelada como control, midiendo el impacto en accuracy y perplejidad sobre ScienceQA.
- Reproducción de experimentos de attention surgery: el repositorio incluye los pesos de atención y el script `apply_qwen_attention_surgery`, lo que facilita replicar la sustitución de capas y validar el pipeline de destilación en 192 pasos.
- Evaluación educativa automatizada en inglés: responder preguntas de ciencias con apoyo de imagen en un entorno controlado, útil para prototipar asistentes de estudio sobre el dominio ScienceQA.
- Benchmarking de eficiencia de kernels: al sustituir 18 de 24 capas por un mecanismo con radio local, sirve para medir latencia y memoria frente al modelo base en GPUs de consumo (cabe en una RTX 3090 de 24 GB durante el entrenamiento).
- Docencia y divulgación técnica: ejemplo práctico y reproducible de destilación de conocimiento sobre un VLM pequeño, con telemetría publicada (pasos, duración, VRAM pico).
- Base para ablaciones de congelación: al mantener fijos visión y proyector, permite estudiar por separado el efecto del decodificador en tareas cross-modales.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre `derek-thomas/ScienceQA`, split de validación, subconjunto con imagen (métricas no verificadas de forma independiente):

| Métrica | Profesor (`llava-interleave-qwen-0.5b`) | Zero-shot `adasplash_attention` | Destilado `adasplash_attention` | Delta |
|---|---:|---:|---:|---:|
| ScienceQA Visual Accuracy (%) | 46,90 | 32,41 | 44,14 | +11,73 |
| Perplejidad de respuesta condicionada por imagen | 3,85 | 4.124,70 | 2,95 | -4.121,75 |

Telemetría de entrenamiento: 192 pasos (Stage 1: 71; Stage 2: 121), 120,7 s de duración, pico de 20.243 MB de VRAM en una NVIDIA RTX 3090 de 24 GB.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos de atención publicados ocupan 682,17 MB en FP16; el modelo base de 0,5B completo requiere cargarse aparte. Durante el entrenamiento el pico registrado fue de 20.243 MB en una RTX 3090 de 24 GB.
- GPU recomendadas: el autor valida el flujo en NVIDIA RTX 3090 de 24 GB. Por tamaño del modelo base (0,5B), debería caber en GPUs de consumo con 8-16 GB, aunque no se han publicado mediciones de inferencia.
- ¿Cabe en GPU de consumo? Sí, según el tamaño del modelo base; la RTX 3090 está confirmada para el entrenamiento, no se documentan pruebas en otras tarjetas.
- Opciones de despliegue: el flujo oficial usa `transformers` (`LlavaForConditionalGeneration`), `safetensors` y `huggingface_hub`, más el script de cirugía de atención de NeuralOps. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ScienceQA Visual Acc | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/llava-qwen-0.5b-adasplash-attention-scienceqa` | 0,5B | no disponible | 44,14% (destilado) | MIT | Hugging Face, pesos de atención únicamente |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | 0,5B | no disponible | 46,90% | no disponible en la información | Hugging Face |
| LLaVA original (paper 2304.08485) | 7B / 13B | no disponible | 92,53% (con GPT-4, según el paper) | no disponible en la información | Código y pesos públicos |

Los datos de contexto y licencia de los modelos comparables no están disponibles en la información proporcionada. La comparación con LLaVA original no es homogénea: el 92,53% del paper corresponde a un modelo mucho mayor y a otro protocolo de evaluación.

## Limitaciones y advertencias

- Métricas no verificadas: el autor marca explícitamente `verified: false` en accuracy y perplejidad; no hay validación independiente.
- No es un checkpoint autónomo: solo incluye pesos de atención y layernorm; requiere el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` y el script de cirugía de NeuralOps para funcionar.
- Dominio estrecho: entrenado y evaluado únicamente sobre ScienceQA en inglés; el rendimiento fuera de ese dominio no está documentado y probablemente sea pobre.
- Pérdida frente al profesor: incluso tras la destilación, queda 2,76 puntos por debajo del modelo base en accuracy visual.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad ni de calibración; un VLM de 0,5B es propenso a respuestas plausibles pero incorrectas.
- Sesgos: no se documentan análisis de sesgo demográfico, cultural o lingüístico.
- Idioma: solo inglés declarado; no hay soporte multilingüe verificado.
- Licencia MIT: permite uso comercial, pero al derivar del modelo base conviene revisar las condiciones de `llava-hf/llava-interleave-qwen-0.5b-hf` y de SigLIP.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día; no hay evidencia de uso en producción ni mantenimiento.
- Sin soporte documentado para tool calling, agentes ni despliegue con servidores de inferencia estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-adasplash-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de `AdaSplashAttention`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/fast_kernels/adasplash_attention.py
- Licencia del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
- LLaVA (sitio del proyecto): https://llava-vl.github.io/
- Paper Visual Instruction Tuning: https://arxiv.org/abs/2304.08485
