# StephC/Llama-3.2-3B-Question-First-Exposure-mixed-seed20261009

## Resumen

Llama-3.2-3B-Question-First-Exposure-mixed-seed20261009 es un checkpoint de investigación derivado de meta-llama/Llama-3.2-3B-Instruct, publicado por el autor StephC (Stefano Civelli) como parte del material reproducible del artículo *Exposure to Question-First Prompts Changes How Language Models Read the Context*. No es un modelo de propósito general: es un ajuste fino completo (full fine-tuning) diseñado específicamente para estudiar cómo el orden de los elementos del prompt (contexto, pregunta y opciones) afecta a la forma en que el modelo procesa la información en tareas de elección múltiple.

El modelo parte de la arquitectura Llama 3.2 de 3.212.749.824 parámetros (3B) y se entrena en la configuración "mixed", en la que cada registro se presenta una vez en orden CQO (contexto-pregunta-opciones) y otra en orden QOC (pregunta-opciones-contexto) a lo largo de dos pasadas. El conjunto de entrenamiento consta de 4.096 registros repartidos a partes iguales entre RACE-M, RACE-H, LogiQA y SciQ, con 1.024 actualizaciones del optimizador.

Su relevancia es acotada y fundamentalmente académica: forma parte de una release de nueve checkpoints (tres familias de modelos × tres regímenes de orden) para una única semilla fija, la 20261009, elegida por ser la primera semilla numerada y no por rendimiento. El checkpoint se distribuye en FP32 byte a byte tal como se evaluó, sin cuantizar ni remuestrear, para preservar los experimentos de interpretabilidad mecanicista del paper, en particular el *question-swap assay*.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), atención eager |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama-3.2-3B-Instruct) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en FP32 sin cuantizar) |
| Idiomas soportados | en (inglés) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (FP32), transformers |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Llama 3.2, con 3.212.749.824 parámetros, inicializado desde la revisión `0cb88a4f764b7a12671c53f0838cd831a0843b95` de meta-llama/Llama-3.2-3B-Instruct. El ajuste fino es completo (no es un adaptador LoRA), con parámetros y estados de AdamW en FP32, autocast en BF16, learning rate de 5e-6, tamaño de batch efectivo de 8 y atención en modo eager. El entrenamiento comprende 4.096 registros (1.024 por cada uno de RACE-M, RACE-H, LogiQA y SciQ), dos pasadas y 1.024 actualizaciones del optimizador. La run de origen es `main_training_v1_llama_3_2_3b_instruct_20261009_balanced/step_1024`.

La innovación metodológica no está en la arquitectura sino en el diseño experimental: la configuración "mixed" expone cada registro en dos órdenes distintos (CQO y QOC) para inducir robustez frente al orden del prompt. El modelo se entrena sobre respuestas de elección múltiple, no como asistente conversacional general. El repositorio incluye `release_manifest.json` con la receta y el SHA-256 original de cada fichero, y los tensores no han sido cuantizados, convertidos ni remuestreados. El paper reporta seis semillas; esta release de una sola semilla no reproduce por sí misma los intervalos de incertidumbre a nivel de semilla.

## Capacidades

- Generación de texto y respuesta a preguntas de elección múltiple sobre el formato y las plantillas del paper (contexto, pregunta y opciones).
- Clasificación y puntuación de etiquetas en tareas de multiple-choice (RACE-M, RACE-H, LogiQA, SciQ).
- Análisis de sensibilidad al orden del prompt: el modelo está específicamente entrenado para el estudio del efecto del orden CQO frente a QOC.
- Soporte para experimentos de interpretabilidad mecanicista, incluido el *question-swap assay* en FP32.
- Capacidades multilingües: limitadas al inglés (tag `en`).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido (thinking mode).
- No está diseñado como asistente conversacional de propósito general.

## Casos de uso

- Investigación sobre sensibilidad al orden del prompt: el modelo permite medir cómo cambia la lectura del contexto cuando la pregunta se presenta antes o después, usando la plantilla y los datasets fijos del paper.
- Reproducción de experimentos de interpretabilidad mecanicista: sirve para replicar el *question-swap assay* y análisis de atención cargando los pesos en FP32, tal como se evaluaron.
- Evaluación comparativa de regímenes de entrenamiento: al existir checkpoints CQO-only, QOC-only y mixed para la misma semilla, permite aislar el efecto del régimen de orden en el comportamiento del modelo.
- Estudio de robustez posicional en benchmarks de elección múltiple: útil para analizar si el ajuste mixed reduce la degradación al reordenar contexto, pregunta y opciones en RACE-M, RACE-H, LogiQA y SciQ.
- Docencia e investigación en NLP: material reproducible con manifiesto de hashes para cursos o trabajos que necesiten un caso controlado de fine-tuning sobre Llama 3.2 3B.
- Análisis de calibración de etiquetas: el modelo puntúa opciones, lo que permite estudiar distribuciones de probabilidad sobre respuestas en tareas controladas.
- Verificación de pipelines de evaluación: sirve como checkpoint de referencia para validar implementaciones del código `qfe.evaluate` y `qfe.question_swap` del repositorio del paper.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los resultados conciernen a los datasets de elección múltiple y a la plantilla fija del paper, y que no se reclama rendimiento en tareas más amplias ni en despliegue.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint se distribuye en FP32 (12,9 GB de repo), por lo que cargarlo en FP32 requiere aproximadamente 13 GB solo para pesos, más overhead de activaciones y atención; en BF16 (uso indicado para evaluaciones ordinarias) se reduce a unos 6,5 GB de pesos.
- GPU recomendadas: para FP32, GPU con 24 GB o más (RTX 3090, RTX 4090, A10G, L4 con margen limitado); para BF16, GPU con 16 GB o más (RTX 4080, RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, en RTX 3090/4090 en FP32 y en GPUs de 16 GB en BF16; en GPUs de 8-12 GB requeriría cuantización, que no se distribuye oficialmente.
- Opciones de despliegue: transformers con `snapshot_download` y el código `qfe` del repositorio del paper; text-generation-inference está etiquetado como compatible en los tags, pero el uso previsto es la evaluación con el pipeline del paper.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-3B-Question-First-Exposure-mixed-seed20261009 | 3.212.749.824 | no disponible | Investigación sobre orden de prompt (elección múltiple) | llama3.2 | Hugging Face, 0 descargas |
| meta-llama/Llama-3.2-3B-Instruct (modelo base) | 3.212.749.824 | no disponible en la informacion proporcionada | Asistente conversacional de propósito general | llama3.2 | Hugging Face, ampliamente distribuido |
| Checkpoints CQO-only y QOC-only de la misma release | 3.212.749.824 | no disponible | Investigación sobre orden de prompt (regímenes alternativos) | llama3.2 | Hugging Face (misma release de nueve checkpoints) |
| Otros modelos de 3B de la familia Llama 3.2 | no disponible | no disponible | Propósito general | llama3.2 | Hugging Face |

La comparación relevante es interna a la release: el checkpoint mixed se contrasta con las variantes CQO-only y QOC-only de la misma semilla para aislar el efecto del régimen de entrenamiento. Frente al modelo base, la diferencia es el ajuste fino sobre tareas de elección múltiple, no una mejora de capacidades generales.

## Limitaciones y advertencias

- No es un asistente conversacional: fue ajustado sobre respuestas de elección múltiple y no se reclama rendimiento en tareas generales ni en despliegue.
- Los resultados solo son válidos para los datasets fijos del paper (RACE-M, RACE-H, LogiQA, SciQ) y su plantilla de prompt concreta.
- Release de una sola semilla: no reproduce por sí misma los intervalos de incertidumbre a nivel de semilla que reporta el paper con seis semillas.
- La semilla 20261009 se eligió por ser la primera numerada, no por rendimiento; no debe interpretarse como selección óptima.
- Riesgo de alucinación: no evaluado ni documentado en la información disponible; el uso previsto no es generación abierta.
- Idiomas: solo inglés (tag `en`); sin soporte documentado de otros idiomas.
- Licencia llama3.2: uso comercial sujeto a los términos de la Llama 3.2 Community License; revisar `LICENSE.txt`, `NOTICE.txt` y `USE_POLICY.txt` del repositorio.
- Los pesos son derivados modificados del modelo base y se distribuyen byte a byte tal como se evaluaron; no incluyen estados del optimizador ni texto de entrenamiento.
- Para el *question-swap assay* es necesario cargar FP32; usar BF16 en ese experimento altera las condiciones del estudio.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/StephC/Llama-3.2-3B-Question-First-Exposure-mixed-seed20261009
- Repositorio del paper (código, outputs y reproducción): https://github.com/Stefano-Civelli/question-first-exposure
- Repositorio de investigación original: https://github.com/Stefano-Civelli/prompt-order-sensitivity
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
