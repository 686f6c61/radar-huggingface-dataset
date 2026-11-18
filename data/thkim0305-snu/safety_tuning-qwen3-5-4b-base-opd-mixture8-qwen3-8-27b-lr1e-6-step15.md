# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-OPD-Mixture8-Qwen3.8-27B-lr1e-6-step15

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-OPD-Mixture8-Qwen3.8-27B-lr1e-6-step15 es un checkpoint de investigación publicado en Hugging Face por el usuario thkim0305-SNU. Se trata de un ajuste fino del modelo base Qwen/Qwen3.5-4B-Base mediante destilación on-policy (OPD, on-policy distillation) usando como profesor Qwen/Qwen3.8-27B. El objetivo declarado es el alineamiento de seguridad (safety tuning), no la mejora de capacidades generales.

El checkpoint corresponde al paso 15 de actualizaciones del optimizador OPD (iteración Megatron zero-based 14), contadas desde la inicialización de esta rama de entrenamiento y no desde un SFT previo. Usa una objective de reverse-KL puro, sin KL de referencia adicional, con un pool de prompts compuesto por una mezcla de ocho datasets.

El modelo tiene 4.659.865.088 parámetros reales según safetensors y un repositorio de 9,3 GB. Es relevante como artefacto de investigación reproducible sobre destilación on-policy aplicada a seguridad en modelos de 4B, aunque el autor no reclama ninguna mejora en benchmarks y el checkpoint es un paso intermedio (step 15) de una ejecución más larga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5; tag `qwen3_5`). Detalles internos de capas y atención no disponibles |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como spec del modelo; durante el entrenamiento se usaron límites de generación de 32768 tokens y de secuencia de 65536 tokens |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base (revisión `1001bb4d826a52d1f399e183466143f4da7b741b`) y se ajusta mediante destilación on-policy con el profesor Qwen/Qwen3.8-27B (revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`). La objective es reverse-KL puro, sin término adicional de KL respecto a una referencia. El pool de prompts es la mezcla más reciente de ocho datasets, preservando el orden original de cada fuente.

Los hiperparámetros del entrenamiento son: learning rate constante de 1e-06, batch de 30 prompts por 4 respuestas, límite de generación de 32768 tokens, límite de secuencia de 65536 tokens, muestreo con temperatura 1.0 y semilla 42. El profesor emplea un sistema específico por dataset: instrucciones de sistema ("Spec") sobre prompts dañinos o difíciles y sin Spec añadido en prompts benignos. La ejecución se identifica como `opd-q38t-base-lr1e6-20steps-save5-20261118-v1`.

El repositorio incluye solo pesos de inferencia y assets de tokenizer y configuración. Los pesos de lenguaje entrenados se convierten desde el checkpoint comprometido y se verifican mediante round-trip inverso exacto. Los tensores de visión y MTP ausentes del checkpoint de entrenamiento se mantienen sin cambios desde la inicialización fijada. Se excluyen estado del optimizador, estado RNG, datos de entrenamiento y credenciales.

## Capacidades

- Generación de texto conversacional y de tipo text-generation, según el pipeline declarado.
- Ajuste orientado a seguridad: el entrenamiento busca reducir respuestas inseguras en prompts dañinos o difíciles mediante destilación del profesor.
- Capacidad multimodal potencial: el tag `image-text-to-text` y la mención de tensores de visión sugieren que la arquitectura base soporta entrada imagen-texto, aunque los tensores de visión no fueron entrenados en esta rama y se conservan desde la inicialización.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación en destilación on-policy: el checkpoint permite reproducir y analizar la dinámica de reverse-KL OPD a paso 15 con hiperparámetros documentados (lr 1e-6, batch 30x4, semilla 42), sirviendo como punto de comparación frente a pasos posteriores de la misma ejecución.
- Estudio de alineamiento de seguridad en modelos pequeños: al derivar de un base de 4B con profesor de 27B, es útil para medir cómo se transfieren comportamientos de rechazo y manejo de prompts dañinos sin SFT previo.
- Evaluación de robustez ante prompts adversarios: la mezcla de ocho datasets y el uso de Spec en prompts dañinos permiten construir suites de evaluación centradas en seguridad conversacional.
- Baseline para comparaciones controladas: al no reclamar mejoras de benchmark, puede usarse como referencia neutra frente a checkpoints con safety tuning adicional o con otras objectives (por ejemplo, con KL de referencia).
- Experimentación con contextos largos: los límites de entrenamiento de 32768 tokens de generación y 65536 de secuencia permiten probar comportamiento en ventanas amplias, aunque la longitud de contexto efectiva del modelo no está declarada.
- Prototipado de asistentes conversacionales con restricciones de seguridad: en entornos de laboratorio, puede integrarse en pipelines de transformers para validar políticas de respuesta antes de desplegar variantes más entrenadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se reclama ninguna mejora en benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, 4.659.865.088 parámetros en precisión de 16 bits requieren aproximadamente 9,3 GB solo para pesos, a los que hay que sumar overhead de activaciones, KV cache y runtime; en cuantización de 8 bits bajaría a unos 4,7 GB y en 4 bits a unos 2,3 GB, aunque no se publican cuantizaciones para este checkpoint.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cabría esperar ejecución en GPUs de 16-24 GB de VRAM en FP16/BF16, pero no se confirma.
- ¿Cabe en consumer GPU?: no confirmado. Según el tamaño de pesos, sería viable en GPUs consumer con 16 GB o más en FP16, y en GPUs de 8-12 GB con cuantización, pero no hay datos oficiales.
- Opciones de despliegue: transformers (librería declarada) y endpoints compatibles (`endpoints_compatible`). Soporte para vLLM, llama.cpp, Ollama o TGI: no disponible en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-OPD-Mixture8-Qwen3.8-27B-lr1e-6-step15 | 4.659.865.088 | no disponible | Safety tuning via OPD desde Qwen3.5-4B-Base | apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-4B-Base | no disponible | no disponible | Modelo base preentrenado | no disponible en la información | Hugging Face |
| Qwen/Qwen3.8-27B | no disponible | no disponible | Profesor usado en la destilación | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparables ni de otros checkpoints de la misma familia para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Checkpoint intermedio: solo 15 actualizaciones OPD completadas; no es un modelo final ni se reclama mejora de capacidades o de seguridad medida en benchmarks.
- Sesgos conocidos: no documentados; al derivar de Qwen3.5-4B-Base hereda los sesgos del base, que no se describen en la información disponible.
- Riesgo de alucinación: no evaluado en la información proporcionada; al no haber benchmarks, no hay evidencia sobre tasas de alucinación.
- Idiomas: no se declaran idiomas soportados, lo que limita el despliegue multilingüe sin validación adicional.
- Contexto: la longitud de contexto del modelo no está declarada; los valores 32768/65536 son límites de entrenamiento, no garantías de calidad en ventanas largas.
- Licencia: apache-2.0 permite uso comercial, pero deben respetarse las condiciones de los modelos base y del profesor, cuyas licencias no se detallan en la información disponible.
- Artefacto de investigación: sin descargas ni likes, sin demo, sin datos de evaluación; no apto para producción sin validación propia.
- Tensores de visión y MTP no entrenados: se conservan desde la inicialización, por lo que las capacidades multimodales no han sido ajustadas en esta rama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-OPD-Mixture8-Qwen3.8-27B-lr1e-6-step15
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Profesor: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper, blog o repositorio sobre OPD: no disponible en la información proporcionada.
- Demo: no disponible.
