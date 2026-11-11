# tahamajs/llava-qwen-0.5b-hgrn2-gated-outer-scienceqa

## Resumen

`llava-qwen-0.5b-hgrn2-gated-outer-scienceqa` es un checkpoint multimodal de tipo vision-language derivado de `llava-hf/llava-interleave-qwen-0.5b-hf` mediante una técnica de "cirugía de atención" (attention surgery) implementada en la librería NeuralOps del autor `tahamajs`. El modelo sustituye las capas de self-attention cuadrática de 18 de las 24 capas del decodificador Qwen2 por bloques `HGRN2GatedOuterBlock`, una variante de atención lineal recurrente basada en HGRN-2 con producto externo (outer-product) y compuerta de olvido por cabeza. Las 6 capas restantes (`[3, 7, 11, 15, 19, 23]`) se mantienen como anclas cuadráticas, dando lugar a una topología híbrida `hybrid_3_1`.

El objetivo declarado es la compresión y el estudio de arquitecturas de atención alternativas sobre un VLM pequeño (0,5B parámetros) para razonamiento visual STEM, evaluado sobre el subconjunto con imagen de ScienceQA (split de validación). El artefacto serializado ocupa 148,08 MB en FP16, un 91,3 % menos que el modelo base completo (1,66 GB), gracias a que solo se guardan las capas modificadas y los layernorms entrenados; la torre de visión SigLIP, el proyector multimodal, los MLPs y los embeddings permanecen congelados y no se incluyen en el delta.

La relevancia actual es doble: por un lado, demuestra un flujo de trabajo reproducible de sustitución de atención con destilación de conocimiento sobre hardware de consumo (una RTX 3090); por otro, publica métricas honestas que muestran una pérdida de precisión de 5 puntos respecto al profesor (34,38 % frente a 63,75 %), lo que lo convierte en un caso de estudio útil sobre los límites de estas técnicas en modelos pequeños, más que en un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA híbrida: torre SigLIP congelada + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas con 18 capas sustituidas por `HGRN2GatedOuterBlock` (atención lineal recurrente) y 6 anclas cuadráticas |
| Parametros totales | 0,5B (modelo base LLaVA-Qwen-0.5B); el delta serializado contiene 155.268.596 bytes en FP16 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en FP16 safetensors) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16), más `surgical_manifest.json`, `config.json` y tokenizer en formato Hugging Face |

## Arquitectura y entrenamiento

El modelo parte de `llava-interleave-qwen-0.5b-hf`: una torre de visión SigLIP de 27 capas congelada, un proyector MLP de 2 capas y un decodificador Qwen2 de 24 capas con dimensión oculta D=1024, 16 cabezas y `head_dim=64`. Sobre esta base se aplica una cirugía de atención que reemplaza la self-attention cuadrática en 18 de las 24 capas por `HGRN2GatedOuterBlock`, un bloque de atención lineal recurrente con estado `S_t = f_t · S_{t-1} + k_tᵀ · v_t`, salida `y_t = q_t · S_t` y normalización de estado con escala de salida, donde `f_t ∈ (0,1)` es una compuerta de olvido por cabeza. Las capas `[3, 7, 11, 15, 19, 23]` se conservan como anclas cuadráticas, configurando el patrón `hybrid_3_1`.

El entrenamiento consistió en una destilación de conocimiento en dos etapas (9 + 19 pasos, 28 en total) ejecutada en una única NVIDIA RTX 3090 de 24 GB, con un pico de VRAM de 18.326 MB y una duración total de 123,1 segundos. Solo se entrenaron las capas de atención sustituidas y los layernorms del decodificador; la torre de visión, el proyector, los MLPs, los embeddings y las anclas cuadráticas quedaron congelados. El dataset de evaluación y ajuste es `derek-thomas/ScienceQA`, restringido al subconjunto con imagen del split de validación. No se documenta en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto condicionada por imagen (pipeline `image-text-to-text`), orientada a respuesta a preguntas visuales de tipo STEM.
- Razonamiento visual de opción múltiple sobre figuras, diagramas y gráficos científicos (formato ScienceQA con respuesta por letra de opción).
- Conversación multi-turno: incluye `chat_template.json`, por lo que soporta plantillas de chat.
- Procesamiento de imágenes mediante el preprocesador SigLIP incluido (`preprocessor_config.json`).
- Capacidad multilingüe limitada al inglés.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, audio ni otras modalidades distintas de imagen y texto.

## Casos de uso

- Investigación sobre atención lineal en VLMs: el checkpoint sirve como punto de partida reproducible para estudiar el impacto de sustituir self-attention por bloques HGRN-2 en un decodificador pequeño, comparando contra el profesor con las métricas ya publicadas.
- Docencia y divulgación técnica: permite ilustrar en un taller o artículo el flujo completo de "attention surgery" más destilación, con telemetría de hardware y tiempos concretos (28 pasos, 123 s, RTX 3090).
- Prototipado de asistentes educativos STEM en inglés: dado su tamaño (0,5B) y su delta de 148 MB, puede desplegarse en entornos de bajo recursos para experimentar con preguntas sobre figuras científicas, aceptando la precisión limitada del 34,38 %.
- Pruebas de pipelines de evaluación multimodal: útil para validar arneses de benchmark sobre ScienceQA con modelos pequeños antes de escalar a modelos mayores.
- Experimentos de compresión y empaquetado de modelos: el formato de delta quirúrgico con manifiesto (`surgical_manifest.json`) sirve como referencia para diseñar esquemas de distribución de pesos parciales.
- Base para fine-tuning posterior: al estar bajo licencia MIT y ser un modelo de 0,5B, puede ajustarse en una GPU de consumo para dominios STEM específicos, partiendo de las capas ya modificadas.
- Comparación de operadores de atención: la familia `gated` de NeuralOps incluye otros operadores; este checkpoint permite contrastar `hgrn2_gated_outer` frente a alternativas sobre la misma base y dataset.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Métrica | Profesor (baseline) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) en ScienceQA (subconjunto con imagen, validación) | 63,75 | 39,38 | 34,38 | -5,00 |
| Perplexity en ScienceQA (subconjunto con imagen, validación) | 2,45 | 761,76 | 3,90 | -757,86 |

Telemetría de entrenamiento declarada: 28 pasos de optimización (9 en etapa 1, 19 en etapa 2), 123,1 s de duración total, pico de VRAM de 18.326 MB en una RTX 3090. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base completo en FP16 ronda los 1,66 GB de pesos; el delta quirúrgico ocupa 148,08 MB. Con overhead de activaciones y del procesador de imagen, cabe holgadamente en GPUs de 8 GB o menos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM; el autor entrenó en una RTX 3090 (24 GB) con un pico de 18,3 GB, pero la inferencia es mucho más ligera.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4070, RTX 4090 y equivalentes; también en iGPU con suficiente memoria compartida para cuantizaciones bajas, aunque no se publican pesos GGUF.
- Opciones de despliegue: la model card solo documenta la carga mediante `neuralops.hub.load_surgeried_model` de la librería NeuralOps. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles. La única referencia temporal es el entrenamiento (123,1 s para 28 pasos), que no es extrapolable a inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `tahamajs/llava-qwen-0.5b-hgrn2-gated-outer-scienceqa` | 0,5B | No disponible | MIT | 18/24 capas con atención lineal HGRN-2; 34,38 % en ScienceQA (imagen, validación) |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | 0,5B | No disponible | No disponible en la información | Base LLaVA-Qwen con atención cuadrática completa; 63,75 % en ScienceQA según la model card |
| Otros checkpoints del zoo NeuralOps | 0,5B | No disponible | MIT (presumiblemente, según el repositorio) | Variantes con otros operadores de atención sobre la misma base; resultados no disponibles en la información |

No se dispone de datos de benchmarks de terceros para establecer comparaciones con otros VLMs de tamaño similar (por ejemplo, variantes de SmolVLM o PaliGemma) en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de precisión significativa: 34,38 % frente al 63,75 % del profesor, una caída de 5 puntos respecto al estado pre-KD y de más de 29 puntos respecto al modelo original. No es adecuado para producción sin un ajuste adicional.
- Métricas no verificadas: los resultados del `model-index` están marcados como `verified: false` y proceden únicamente del autor.
- Entrenamiento muy corto: 28 pasos de optimización en 123 s sugieren un ajuste mínimo; es probable que el modelo esté infraajustado para el dominio.
- Idiomas: solo inglés declarado; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Contexto: no se documenta la longitud máxima de contexto, lo que impide planificar su uso en conversaciones largas.
- Dependencia de la librería NeuralOps: la carga requiere `neuralops.hub`, una librería no estándar; la integración con ecosistemas habituales (transformers, vLLM) no está confirmada.
- Riesgo de alucinación: inherente a los VLMs de 0,5B y agravado por la destilación parcial; las respuestas sobre figuras científicas pueden ser incorrectas con alta frecuencia.
- Sesgos: no se documenta ninguna evaluación de sesgos; el dataset ScienceQA tiene una distribución temática y lingüística concreta que puede introducir sesgos de dominio.
- Licencia MIT: permite uso comercial, pero el modelo base y la torre SigLIP pueden tener condiciones propias que conviene revisar antes de un despliegue comercial.
- Fecha de creación futura en los metadatos (2026-11-11): conviene verificar la procedencia y el estado real del repositorio antes de confiar en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-hgrn2-gated-outer-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/gated/hgrn2_gated_outer.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
