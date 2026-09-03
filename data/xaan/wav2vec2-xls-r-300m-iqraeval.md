# xaan/wav2vec2-xls-r-300m-iqraeval

## Resumen

Este modelo es una versión fine-tuneada de [facebook/wav2vec2-xls-r-300m](https://huggingface.co/facebook/wav2vec2-xls-r-300m), adaptada específicamente para la detección de errores de pronunciación en la recitación del Corán en árabe estándar moderno (MSA). Fue desarrollado por Fatimah Emad Eldin para la tarea compartida Iqra'Eval 2026, y está diseñado para realizar reconocimiento automático del habla (ASR) a nivel de fonemas, con el objetivo de diagnosticar errores de pronunciación en lecturas de textos coránicos.

El modelo se entrenó con una estrategia de fine-tuning en una sola etapa, utilizando la pérdida CTC (Connectionist Temporal Classification) sobre un conjunto de datos combinado de aproximadamente 159 horas de habla árabe. La arquitectura base es un transformer Wav2Vec2 con 300 millones de parámetros, pre-entrenado en 128 idiomas, que se ha especializado en la distribución fonética de la recitación coránica. Su relevancia radica en abordar un problema específico y poco cubierto: la evaluación automática de la pronunciación en contextos religiosos y educativos, donde la precisión fonética es crítica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 (transformer) |
| Parametros totales | 315.514.570 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa audio a 16 kHz, con filtrado de 0,3 a 15 segundos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arabe (ar) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Wav2Vec2, un transformer que aprende representaciones de audio mediante auto-supervision. En este caso, se parte del checkpoint pre-entrenado `facebook/wav2vec2-xls-r-300m`, que fue entrenado con 436.000 horas de habla no etiquetada en 128 idiomas. Durante el fine-tuning, se congeló el extractor de características CNN para evitar el olvido catastrófico de las representaciones acústicas pre-entrenadas, permitiendo que solo se actualizaran las capas transformer.

El entrenamiento se realizó con pérdida CTC, sobre un conjunto de datos combinado de aproximadamente 159 horas: unas 79 horas de habla nativa pseudo-etiquetada (considerada "dorada" por asumirse pronunciación correcta) y unas 80 horas de habla sintética generada por TTS con errores de pronunciación introducidos deliberadamente (sustituciones, deleciones e inserciones). El vocabulario consta de 74 tokens, basados en los 68 fonemas MSA definidos por el fonetizador Nawar Halabi, con tokens especiales para geminación y énfasis. Se aplicó SpecAugment con `mask_time_prob=0.05` y `mask_time_length=10`, y se entrenó durante 10 épocas con una tasa de aprendizaje de 3e-5, scheduler coseno, warmup del 10%, batch efectivo de 32 y precisión bf16.

## Capacidades

- Reconocimiento automático del habla (ASR) a nivel de fonemas para árabe estándar moderno.
- Detección y diagnóstico de errores de pronunciación en recitación coránica (sustituciones, deleciones e inserciones).
- Procesamiento de audio a 16 kHz, con filtrado de segmentos entre 0,3 y 15 segundos.
- Vocabulario fonético de 74 tokens, incluyendo marcadores de geminación y énfasis.
- Decodificación CTC con tokens especiales (`<pad>`, `<unk>`, `|`, `<ctc>`, `<s>`, `</s>`).
- No soporta tool calling, agentes, vision ni otros modos especiales; es exclusivamente un modelo de audio.

## Casos de uso

- Evaluación de recitación coránica: el modelo puede analizar grabaciones de estudiantes que recitan el Corán y señalar errores fonéticos específicos, lo que permite a los profesores corregir la pronunciación de forma automatizada.
- Aplicaciones educativas de aprendizaje del árabe: integrable en plataformas de enseñanza de MSA para practicar la pronunciación de textos coránicos y recibir retroalimentación fonética inmediata.
- Herramientas de autoestudio para hablantes no nativos: un usuario puede grabar su lectura y obtener un diagnóstico de errores a nivel de fonema, comparando su pronunciación con el estándar esperado.
- Investigación en fonética árabe: el modelo puede utilizarse como herramienta de anotación automática para corpus de habla coránica, facilitando el análisis lingüístico de variantes de pronunciación.
- Sistemas de tutoría inteligente: combinado con un frontend, puede servir como componente de un asistente que guíe al estudiante en la corrección progresiva de su recitación.
- Evaluación en entornos religiosos: mezquitas o centros islámicos pueden emplearlo para certificar la precisión de la pronunciación en programas de formación de imames o recitadores.

## Benchmarks y rendimiento

El autor declara un resultado de F1 de 0,2020 en el conjunto de prueba ciego `IqraEval/QuranMB.v2`, con formato de envío CSV (columnas `ID` y `Labels`). No se han publicado resultados de benchmarks en la informacion disponible.

| Benchmark | Resultado |
|---|---|
| F1 (IqraEval/QuranMB.v2, test ciego) | 0,2020 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, pero un modelo de 315M parámetros en fp32 requiere aproximadamente 1,3 GB de memoria; en bf16, unos 0,7 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia (por ejemplo, NVIDIA T4, RTX 3060, RTX 4090). Para entrenamiento, se usó una GPU con soporte bf16 (por ejemplo, A100 o RTX 3090).
- Cabe en GPUs de consumo: sí, en prácticamente cualquier GPU moderna de consumo.
- Opciones de despliegue: puede usarse con la librería `transformers` de HuggingFace, `torchaudio` para carga de audio, y servirse con herramientas como FastAPI o TGI. No es compatible directamente con vLLM ni llama.cpp, al ser un modelo de audio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| wav2vec2-xls-r-300m-iqraeval (este) | 315M | audio 16 kHz | ASR fonético para coránico | apache-2.0 |
| facebook/wav2vec2-xls-r-300m | 300M | audio 16 kHz | ASR multilingue (128 idiomas) | apache-2.0 |
| FatimahEmadEldin/wav2vec2-xls-r-300m-iqraeval-stage1 | no disponible | no disponible | ASR fonético (etapa 1) | no disponible |

La comparativa se limita a la versión base y a la etapa 1 del mismo autor, ya que no se dispone de otros modelos especializados en detección de errores de pronunciación coránica.

## Limitaciones y advertencias

- El rendimiento declarado (F1 de 0,2020) es bajo, lo que indica que el modelo tiene una precisión limitada en la detección de errores y puede no ser adecuado para uso en producción sin un umbral de confianza estricto o post-procesamiento adicional.
- Está entrenado exclusivamente para árabe estándar moderno y recitación coránica; no es útil para otros idiomas ni para habla coloquial.
- El conjunto de datos sintético (TTS) puede introducir sesgos en la detección de errores, ya que los patrones de error generados artificialmente pueden no reflejar completamente los errores naturales de los hablantes.
- La dependencia de pseudo-etiquetas en los datos nativos puede propagar errores de transcripción si las etiquetas originales no son perfectas.
- No se proporcionan datos sobre latencia, throughput ni requisitos de hardware específicos, lo que dificulta la planificación de despliegue.
- La licencia apache-2.0 permite uso comercial, pero el modelo está especializado en un dominio muy concreto, lo que limita su reutilización fuera de este ámbito.

## Enlaces

- [HuggingFace: xaan/wav2vec2-xls-r-300m-iqraeval](https://huggingface.co/xaan/wav2vec2-xls-r-300m-iqraeval)
- [HuggingFace: FatimahEmadEldin/wav2vec2-xls-r-300m-iqraeval](https://huggingface.co/FatimahEmadEldin/wav2vec2-xls-r-300m-iqraeval)
- [Dataset: IqraEval/Iqra_train](https://huggingface.co/datasets/IqraEval/Iqra_train)
- [Dataset: IqraEval/Iqra_TTS](https://huggingface.co/datasets/IqraEval/Iqra_TTS)
- [Leaderboard: IqraEval Leaderboard](https://huggingface.co/spaces/IqraEval/Leaderboard)
- [Modelo base: facebook/wav2vec2-xls-r-300m](https://huggingface.co/facebook/wav2vec2-xls-r-300m)
