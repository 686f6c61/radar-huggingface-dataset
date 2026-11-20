# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-SFT728-OPD-Mixture8-Qwen3.8-27B-lr1e-6-step10

## Resumen

El modelo `Safety_Tuning-Qwen3.5-4B-SFT728-OPD-Mixture8-Qwen3.8-27B-lr1e-6-step10` es un checkpoint de investigación publicado por el usuario thkim0305-SNU (Universidad Nacional de Seúl) dentro de una línea de trabajo sobre *safety tuning* mediante destilación en política (*on-policy distillation*, OPD). Se trata de un ajuste fino del checkpoint `Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-lr1e-5-step728`, que a su vez parte de la familia Qwen3.5 de 4B. El modelo no es un lanzamiento oficial de Alibaba, sino un experimento académico reproducible con pesos liberados bajo Apache 2.0.

La arquitectura subyacente es la de Qwen3.5 (transformer denso con soporte multimodal imagen-texto, tag `qwen3_5` e `image-text-to-text`), con aproximadamente 4.660 millones de parámetros totales según los safetensors del repositorio. El objetivo declarado del entrenamiento es la destilación inversa de KL (*reverse-KL OPD*) usando como profesor `Qwen/Qwen3.8-27B`, sobre una mezcla de ocho conjuntos de datos orientada a seguridad. El checkpoint representa únicamente 10 pasos de optimizador OPD desde su inicialización, por lo que debe interpretarse como un artefacto de investigación intermedio y no como un modelo listo para producción.

Su relevancia es metodológica: documenta de forma explícita la receta (profesor, revisión, tasa de aprendizaje, tamaño de lote, límites de secuencia, semilla) y permite estudiar cómo evoluciona el alineamiento de seguridad en las primeras etapas de la destilación en política sobre un modelo pequeño. No se han publicado resultados de benchmarks ni una evaluación cuantitativa de seguridad en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3.5 (tag `qwen3_5`), con soporte multimodal imagen-texto |
| Parametros totales | 4.659.865.088 (~4,66 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible como spec oficial; los límites de entrenamiento configurados son 32.768 tokens de generación y 65.536 tokens de secuencia |
| Tipos de cuantizacion | No disponible (el repositorio publica pesos en safetensors sin cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible (la model card no declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (más tokenizer y ficheros de configuración) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen3.5 con unos 4,66 B de parámetros, heredado del checkpoint base `Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-lr1e-5-step728` (revisión `3ab4c8de6b1a62642f6e41df5272cf41109cb712`). El repositorio incluye únicamente pesos de inferencia, tokenizer y configuración; los tensores de visión y MTP ausentes en el checkpoint de entrenamiento se copian de la inicialización fijada, y los pesos de lenguaje se convierten desde el checkpoint comprometido verificando un *round-trip* inverso exacto.

El entrenamiento consiste en una fase de destilación en política (*on-policy distillation*, OPD) con objetivo de KL inversa, usando `Qwen/Qwen3.8-27B` (revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`) como profesor. La configuración registrada es: tasa de aprendizaje constante de 1e-6, lote de 30 prompts × 4 respuestas, temperatura de muestreo 1.0, semilla 42, y un pool de prompts compuesto por la mezcla más reciente de ocho conjuntos de datos preservando el orden original de cada fuente. El profesor emplea un sistema específico por dataset: *Spec* sobre prompts dañinos o difíciles y sin *Spec* añadido sobre prompts benignos. El checkpoint corresponde a 10 actualizaciones completas del optimizador OPD (iteración Megatron basada en cero: 9) dentro de la ejecución `opd-sft728-lr1e6-100steps-save5-20261119-v1`, contadas desde la inicialización de esta rama y no desde el SFT previo.

## Capacidades

- Generación de texto conversacional y continuaciones multi-turno, según el pipeline declarado `text-generation` y las tags `conversational`.
- Procesamiento de entrada imagen-texto: la tag `image-text-to-text` y la arquitectura `qwen3_5` indican soporte multimodal de entrada, aunque la model card no detalla el alcance exacto.
- Ajuste orientado a seguridad: el entrenamiento busca alinear respuestas en prompts dañinos o difíciles mediante destilación del profesor de 27B.
- Razonamiento y matemáticas: capacidades heredadas de la base Qwen3.5, no verificadas en este checkpoint.
- Generación de código: capacidad esperable por herencia de la familia, sin evaluación publicada.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; la model card no declara idiomas.
- Modo *thinking* explícito: no documentado en este checkpoint.

## Casos de uso

- Investigación en alineamiento de seguridad: comparar este checkpoint de 10 pasos OPD con la inicialización SFT y con checkpoints posteriores de la misma ejecución para medir la evolución de la tasa de rechazo y de la utilidad en prompts benignos.
- Estudio de destilación en política: analizar cómo un profesor de 27B transfiere comportamiento de seguridad a un alumno de 4,66 B con tasa de aprendizaje 1e-6 y lotes de 30×4, replicando la receta documentada.
- Evaluación de *red teaming* controlada: usar el modelo como sujeto de pruebas en pipelines de evaluación de robustez frente a prompts adversarios, dado que su propósito declarado es precisamente el endurecimiento ante entradas dañinas.
- Prototipado de asistentes conversacionales con entrada de imagen: aprovechar la modalidad imagen-texto para experimentos de diálogo que combinen capturas o documentos escaneados con preguntas en lenguaje natural.
- Generación de datos sintéticos para ajuste supervisado: emplear las respuestas del checkpoint como material de comparación frente a las del profesor Qwen3.8-27B en la misma mezcla de ocho datasets.
- Despliegue en entornos con recursos limitados: con 4,66 B de parámetros y pesos en safetensors, el modelo puede servirse en una única GPU de 24 GB en precisión reducida para experimentos internos, aunque su naturaleza de checkpoint intermedio desaconseja uso en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, los 4,66 B de parámetros ocupan aproximadamente 9,3 GB (coincide con el tamaño del repositorio); en FP8, en torno a 4,7 GB; en cuantizaciones de 4 bits, alrededor de 2,5-3 GB más overhead de contexto.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para servir con contexto largo (hasta 65.536 tokens de secuencia) y lotes moderados; una RTX 4090 de 24 GB es suficiente para BF16 con contexto estándar.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y, con cuantización de 4 bits, en GPUs de 8-12 GB como RTX 4070 o RTX 3060, siempre que se conviertan los pesos a GGUF (no se publican cuantizaciones oficiales).
- Opciones de despliegue: transformers (librería declarada), vLLM o TGI para servir en safetensors, y llama.cpp/Ollama tras conversión a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Qwen3.5-4B OPD step 10) | ~4,66 B | Hasta 65.536 tokens de secuencia en entrenamiento (no confirmado en inferencia) | Apache 2.0 | Destilación en política para seguridad, 10 pasos | Pesos en Hugging Face, 0 descargas |
| Qwen/Qwen3.8-27B (profesor) | 27 B (no confirmado) | No disponible | No disponible en la información | Modelo generalista de la familia Qwen3.8 | Usado como profesor en esta receta |
| Inicialización SFT (`Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-lr1e-5-step728`) | ~4,66 B | No disponible | Apache 2.0 (según el repo derivado) | SFT sobre mezcla de ocho datasets | Pesos en Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio: solo 10 actualizaciones de optimizador OPD; no representa el resultado final de la ejecución de 100 pasos y su comportamiento de seguridad puede ser inestable.
- Ausencia total de evaluación: no hay benchmarks, métricas de seguridad ni tasas de rechazo publicadas, por lo que no puede afirmarse que el modelo sea más seguro que su inicialización.
- Riesgo de alucinación: inherente a los modelos de 4-5 B; no cuantificado en esta ficha.
- Idiomas: la model card no declara cobertura lingüística; el rendimiento fuera del inglés o del chino es desconocido.
- Sesgos: no documentados por el autor; la mezcla de ocho datasets y el sistema del profesor pueden introducir sesgos de estilo o de rechazo no caracterizados.
- Licencia: Apache 2.0 permite uso comercial, pero al tratarse de un derivado de Qwen conviene verificar las condiciones de la familia base y citar la revisión exacta del modelo de origen.
- Uso en producción desaconsejado: es un artefacto de investigación con 0 descargas y 0 likes, sin garantías de soporte ni mantenimiento.
- Multimodalidad parcial: los tensores de visión se copian de la inicialización, no se entrenan en esta fase, por lo que su calidad no está validada en este checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-SFT728-OPD-Mixture8-Qwen3.8-27B-lr1e-6-step10
- Inicialización SFT: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-lr1e-5-step728
- Profesor Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Perfil del autor: https://huggingface.co/thkim0305-SNU
