# thunderboltc/combined_whisper_sanlish_lr2e5_newsplit

## Resumen

`combined_whisper_sanlish_lr2e5_newsplit` es un ajuste fino (fine-tune) del modelo `openai/whisper-small` publicado por el usuario thunderboltc en HuggingFace. Se trata de un modelo de reconocimiento automático del habla (ASR) de tipo encoder-decoder transformer, con 241.734.912 parámetros reales verificados en los pesos safetensors, licencia Apache 2.0 y pipeline `automatic-speech-recognition`. La model card no documenta la composición del corpus de entrenamiento, que aparece literalmente como "None dataset", ni los idiomas objetivo, aunque el nombre del repositorio sugiere un entrenamiento sobre audio combinado o con mezcla de lenguas (el sufijo "sanlish" apunta a una combinación de santali e inglés, hipótesis no confirmada por el autor).

El modelo se entrena durante 25 épocas declaradas (el registro de métricas solo llega hasta la época 15) con learning rate 2e-5, batch efectivo de 16 y precisión mixta nativa. Los resultados finales reportados en la model card son una pérdida de validación de 0,6368, un WER del 34,7012 % y un CER del 8,4391 %. El mejor WER del registro (34,1659 %) se alcanza en la época 10, por lo que no hay mejora clara en las épocas posteriores.

Su relevancia es limitada y muy específica: no compite con los modelos Whisper de referencia en calidad de transcripción, pero puede resultar útil como punto de partida para ajustes posteriores en un dominio concreto, o como referencia técnica de un proceso de fine-tuning con muy pocos recursos (936 muestras estimadas por época). Es un modelo sin descargas ni valoraciones en el momento de la consulta, sin benchmarks comparativos publicados y con documentación prácticamente inexistente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper, heredada de `openai/whisper-small`) |
| Parámetros totales | 241.734.912 (dato real de los pesos safetensors) |
| Parámetros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Whisper trabaja con ventanas de audio de 30 segundos (1500 frames mel) y 448 posiciones de decoder |
| Tipos de cuantización | no disponible; el autor no publica variantes cuantizadas. Conversión posible a int8 (CTranslate2) o GGUF (whisper.cpp) por cuenta del usuario |
| Idiomas soportados | no disponible en la model card del fine-tune; el modelo base `openai/whisper-small` es multilingüe (99 idiomas según OpenAI) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato `transformers`); GGUF y CTranslate2 requieren conversión externa |

Datos adicionales del repositorio: tamaño del repositorio 43,5 GB (muy superior a los ~1 GB de los pesos, lo que sugiere que incluye checkpoints intermedios del entrenamiento), creado el 27 de septiembre de 2026 y actualizado el mismo día, 0 descargas y 0 valoraciones.

## Arquitectura y entrenamiento

La arquitectura corresponde a Whisper small: un transformer encoder-decoder con normalización previa, embeddings convolucionales en la entrada de audio, codificación posicional sinusoidal y decodificación autorregresiva sobre tokens de texto. El modelo base fue entrenado por OpenAI con supervisión débil a gran escala y compone su vocabulario con tokens especiales de tarea (transcripción, traducción y detección de idioma). El ajuste fino aquí documentado mantiene esa arquitectura sin modificaciones y solo actualiza los pesos; no se anuncia ninguna innovación técnica adicional (ni decodificación especulativa, ni atención lineal, ni variantes de atención eficiente).

El procedimiento de entrenamiento está documentado parcialmente: 25 épocas declaradas, learning rate 2e-5, `train_batch_size` 8, `eval_batch_size` 4, acumulación de gradientes de 2 pasos (batch efectivo 16), optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal con 200 pasos de calentamiento, precisión mixta nativa (AMP) y semilla 42. El número de pasos por época es 117, lo que implica aproximadamente 936 muestras de entrenamiento por época. No se especifica el número total de tokens de audio procesados, ni la composición del dataset, ni si hubo etapas de RLHF o DPO (no aplicables, en principio, a una tarea ASR supervisada). Tampoco se indica el nombre real del corpus, que aparece como "None dataset" en la model card.

El registro de métricas presenta una discrepancia relevante: se declaran 25 épocas, pero la tabla de resultados se detiene en la época 15 con 1755 pasos. Las versiones de framework utilizadas son Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1.

## Capacidades

- Transcripción de voz a texto en el formato estándar de Whisper (pipeline `automatic-speech-recognition`).
- Procesamiento de audio en ventanas de 30 segundos con segmentación automática de audio largo (comportamiento heredado del modelo base).
- Traducción de voz a inglés y detección de idioma: capacidades del modelo base Whisper small; no confirmadas ni documentadas para este fine-tune concreto.
- Extracción de marcas de tiempo a nivel de segmento (posible mediante `return_timestamps` en la pipeline de `transformers`, si los tokens de timestamp no se han degradado durante el ajuste).
- Soporte de `tool calling` / `function calling`: no disponible (modelo ASR, no orientado a agentes).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no documentadas para el fine-tune; dependen de lo que se haya preservado del modelo base.
- Capacidades especiales (modo thinking, visión, audio-tool use): no disponibles.

## Casos de uso

- Transcripción de audio en un dominio concreto con mezcla de lenguas: el modelo puede emplearse como base para evaluar si el ajuste ha capturado patrones de habla bilingüe o con cambio de código, midiendo WER sobre un conjunto de test representativo del dominio antes de plantear cualquier uso en producción.
- Punto de partida para un segundo ajuste fino (domain adaptation): dado su WER del 34,7 %, el uso más realista es continuar el entrenamiento con un corpus propio, mejor etiquetado y con validación cruzada, en lugar de desplegarlo directamente.
- Preprocesado de corpus de voz para investigación en lingüística: generación de transcripciones preliminares sobre grabaciones no etiquetadas, que después se corrigen manualmente; el CER del 8,4 % frente al WER del 34,7 % sugiere que los errores se concentran en la segmentación de palabras, lo que puede ser tolerable para tareas de análisis fonético o de carácter.
- Subtitulado asistido con revisión humana: generación de subtítulos borrador con marcas de tiempo para vídeos de bajo presupuesto o de archivo, asumiendo una tasa de error alta que exige corrección posterior.
- Indexación y búsqueda sobre archivos de audio: transcripción aproximada de un archivo histórico para permitir búsqueda por palabras clave, aceptando errores porque el objetivo es la recuperación, no la transcripción exacta.
- Comparación de metodologías de fine-tuning: el repositorio documenta hiperparámetros completos y la evolución de pérdida, WER y CER por época, por lo que sirve como caso de estudio reproducible de sobreajuste temprano en ASR con pocos datos.
- Base para experimentos de destilación o cuantización: al ser un modelo pequeño (241,7 M de parámetros), permite probar conversiones a int8 o GGUF y medir la degradación de WER en hardware de consumo.
- Evaluación de robustez frente a ruido y acento: útil como sujeto de pruebas para medir cómo se degrada un modelo ajustado con pocos datos al cambiar de condiciones acústicas.

## Benchmarks y rendimiento

El `model-index` oficial del repositorio no contiene resultados (`results: []`). Las únicas métricas disponibles son las del proceso de entrenamiento, declaradas por el autor y calculadas sobre su conjunto de validación (no especificado). No hay comparación con otros modelos publicada.

| Época | Paso | Pérdida de entrenamiento | Pérdida de validación | WER (%) | CER (%) |
|---|---|---|---|---|---|
| 1 | 117 | 10,2229 | 1,9545 | 77,7877 | 21,9067 |
| 2 | 234 | 3,6557 | 0,8444 | 51,7395 | 13,2614 |
| 3 | 351 | 2,5242 | 0,7170 | 43,2649 | 11,1516 |
| 4 | 468 | 1,9480 | 0,6318 | 39,8751 | 9,8985 |
| 5 | 585 | 1,4886 | 0,6287 | 39,2507 | 9,6764 |
| 6 | 702 | 1,2852 | 0,6565 | 36,8421 | 9,4702 |
| 7 | 819 | 0,9506 | 0,6290 | 35,8608 | 9,1529 |
| 8 | 936 | 0,8017 | 0,6124 | 35,0580 | 8,7405 |
| 9 | 1053 | 0,7469 | 0,6339 | 34,4335 | 8,6612 |
| 10 | 1170 | 0,6137 | 0,6147 | 34,1659 | 8,4867 |
| 11 | 1287 | 0,4990 | 0,6087 | 35,2364 | 8,5977 |
| 12 | 1404 | 0,4281 | 0,6068 | 34,7012 | 8,5343 |
| 13 | 1521 | 0,3966 | 0,6225 | 34,3443 | 8,5343 |
| 14 | 1638 | 0,3693 | 0,6183 | 34,3443 | 8,5819 |
| 15 | 1755 | 0,3288 | 0,6368 | 34,7012 | 8,4391 |

Observaciones sobre los datos: el mejor WER (34,1659 %) corresponde a la época 10; a partir de ahí la pérdida de entrenamiento sigue bajando (de 0,6137 a 0,3288) mientras la pérdida de validación se estanca o empeora (de 0,6147 a 0,6368), un patrón compatible con sobreajuste. La diferencia entre WER (34,7 %) y CER (8,4 %) indica que la mayoría de los errores son sustituciones o segmentaciones dentro de la palabra, más que omisiones o inserciones de palabras completas; se trata de una interpretación, no de un dato declarado por el autor.

## Requisitos de hardware

- Pesos en fp32: aproximadamente 0,97 GB. En fp16/bf16: aproximadamente 0,48 GB. En int8 (tras conversión a CTranslate2): aproximadamente 0,24 GB.
- VRAM estimada para inferencia: entre 1,5 y 3 GB en fp16, en función del tamaño de lote y de la longitud del audio. Cifra orientativa, no medida por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como RTX 3050, RTX 3060, RTX 4060 o RTX 4090. Las A100 y H100 funcionan pero están sobredimensionadas para 241,7 M de parámetros.
- Cabe en GPU de consumo: sí, en la práctica totalidad de las GPU modernas con 4 GB o más de VRAM. También es viable en CPU (x86 con AVX2) y en Apple Silicon mediante whisper.cpp o MLX.
- Opciones de despliegue: pipeline de `transformers` (uso directo con safetensors); faster-whisper o CTranslate2 (requiere conversión); whisper.cpp (requiere conversión a GGUF); vLLM dispone de soporte de Whisper para transcripción; TGI no soporta tareas de ASR. No hay artefactos de despliegue publicados en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este modelo, y el factor de tiempo real dependerá por completo del hardware y de la conversión elegida.

## Comparativa con modelos similares

No se han publicado resultados de benchmarks comparativos para este modelo, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad. Los datos de los modelos base de la familia Whisper proceden de la documentación de OpenAI.

| Modelo | Parámetros | Ventana de audio | Idiomas | Licencia | WER declarado | Disponibilidad |
|---|---|---|---|---|---|---|
| combined_whisper_sanlish_lr2e5_newsplit | 241.734.912 | 30 s (heredado del base) | no disponible | apache-2.0 | 34,7012 % (validación propia, dominio no especificado) | HuggingFace, 0 descargas |
| openai/whisper-small | ~244 M | 30 s | 99 (multilingüe) | apache-2.0 | no comparable (evaluación sobre LibriSpeech y otros corpus públicos) | Ampliamente disponible |
| openai/whisper-base | ~74 M | 30 s | 99 (multilingüe) | apache-2.0 | no comparable | Ampliamente disponible |
| openai/whisper-medium | ~769 M | 30 s | 99 (multilingüe) | apache-2.0 | no comparable | Ampliamente disponible |

Advertencia: el WER del 34,7 % de este modelo y los WER publicados de los modelos de OpenAI no son comparables porque se calculan sobre corpus distintos. Sin conocer el conjunto de validación de este fine-tune, no es posible afirmar que este modelo sea peor o mejor que `openai/whisper-small` en el dominio objetivo.

## Limitaciones y advertencias

- WER del 34,7012 % sobre su propio conjunto de validación: es una tasa de error muy alta para uso en producción sin revisión humana, aunque el valor absoluto depende de la dificultad del corpus (no documentado).
- Sobreajuste probable: la pérdida de validación deja de mejorar a partir de la época 10 mientras la de entrenamiento sigue descendiendo hasta 0,3288 en la época 15.
- Documentación insuficiente: el dataset aparece como "None dataset", no hay sección de usos previstos, ni de limitaciones, ni de idiomas, ni de composición de datos.
- Discrepancia entre las 25 épocas declaradas y las 15 registradas, sin explicación del autor.
- Sesgos: no documentados. Al derivar de `openai/whisper-small`, hereda los sesgos de reconocimiento y la variación de rendimiento por acento, género, edad y calidad de grabación del modelo base.
- Alucinación: los modelos Whisper son propensos a generar texto plausible en segmentos con silencio, ruido o habla no cubierta por el entrenamiento, y a repetir bucles de texto. Este riesgo aumenta en ajustes finos con pocos datos.
- Idioma: no se especifica qué idiomas conserva realmente el fine-tune; un ajuste con pocos datos puede degradar gravemente el multilingüismo del modelo base (olvido catastrófico).
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, pero el usuario es responsable del cumplimiento de las condiciones de los datos de audio utilizados, que no se documentan.
- Trazabilidad: 0 descargas y 0 valoraciones, sin revisión de la comunidad ni validación externa. No debe usarse como componente crítico sin una evaluación propia sobre un conjunto de test representativo.
- Tamaño del repositorio de 43,5 GB: conviene revisar el contenido antes de clonarlo, ya que probablemente incluye checkpoints intermedios no necesarios para la inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thunderboltc/combined_whisper_sanlish_lr2e5_newsplit
- Modelo base: https://huggingface.co/openai/whisper-small
- Paper de Whisper (Radford et al., 2022, "Robust Speech Recognition via Large-Scale Weak Supervision"): https://arxiv.org/abs/2212.04356
- Repositorio oficial de OpenAI Whisper: https://github.com/openai/whisper
- faster-whisper (CTranslate2): https://github.com/SYSTRAN/faster-whisper
- whisper.cpp (ejecución en CPU y GPU con GGUF): https://github.com/ggml-org/whisper.cpp
- Documentación de `transformers` para modelos Whisper: https://huggingface.co/docs/transformers/model_doc/whisper
