# yurvon-screamo/origa-judge

## Resumen

Origa Judge v3 es un modelo de estimación de calidad de traducción desarrollado por el usuario yurvon-screamo dentro del proyecto Origa. No es un modelo generativo: se trata de un conjunto de cabezas InfoNCE (adaptador PEFT) montadas sobre el encoder multilingüe intfloat/multilingual-e5-base, que puntúan pares de traducción JA→X para seleccionar la mejor candidata frente a una referencia (esquema Best-of-N). Su función es actuar como ranker dentro de la pipeline de contenido multilingüe de Origa, no como evaluador absoluto: la propia model card advierte de que las puntuaciones no están calibradas entre locales y no deben usarse como umbral de aprobado/suspendido.

El modelo trabaja con embeddings con prefijos al estilo e5 (`query:` para la frase fuente, `passage:` para cada candidata) y pooling MEAN, y devuelve un producto escalar entre embeddings normalizados. Se entrenó con 59.973 pares sintéticos y depurados en 5 épocas (unos 5 minutos según el autor) sobre embeddings precalculados con vLLM, y se evaluó internamente sobre un conjunto de 662 pares con un resultado del 81,9 %.

Su relevancia es acotada y muy específica: cubre control de calidad de diccionarios y frases en ja→{en, ru, ko, vi} dentro de un único dominio (contenido de aprendizaje). La licencia BSL 1.1, la ausencia de validación fuera de dominio y el hecho de tener 0 descargas y 0 likes en HuggingFace lo sitúan como una pieza interna de infraestructura más que como un modelo de propósito general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT con cabezas InfoNCE (dos MLP: dim → 256 → GELU → 256) sobre el encoder transformer intfloat/multilingual-e5-base |
| Parametros totales | No disponible (la ficha no detalla el recuento; el encoder base es intfloat/multilingual-e5-base) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada del encoder base, no especificada en la ficha) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | ja, en, ru, ko, vi (entrenado y evaluado en pares ja → {en, ru, ko, vi}) |
| Licencia | BSL 1.1 (Business Source License 1.1); el encoder base es MIT |
| Formato de pesos | Checkpoint PyTorch (origa-judge.pt) con el diccionario de cabezas PEFT; adaptador cargado con library_name: peft |

## Arquitectura y entrenamiento

La arquitectura es un adaptador ligero sobre un encoder de embeddings. El encoder es intfloat/multilingual-e5-base, usado con pooling MEAN obligatorio y prefijos `query:` (frase fuente) y `passage:` (candidata). Sobre esas representaciones se aplican dos cabezas MLP idénticas en estructura (dim → 256 → GELU → 256), una para la fuente y otra para la candidata; la salida se normaliza L2 y se combina mediante producto escalar. La pérdida de entrenamiento es InfoNCE. La model card es explícita: es un ranker, no un grader, y las puntuaciones solo son comparables dentro de una misma llamada de ranking.

Los datos de entrenamiento suman 59.973 pares: 35.000 negativos sintéticos, 10.300 negativos de metadatos basura, 6.100 inversiones, 2.200 errores profundos de pipeline (margen < −0,50, 75 % reales), 5.900 positivos de paráfrasis filtrados dos veces y 500 pares de auditoría. El entrenamiento fue de 5 épocas, aproximadamente 5 minutos, sobre embeddings generados con vLLM. Según el autor, las cabezas mantuvieron la paridad en un conjunto de control incluso con un 70 % de negativos ruidosos, por lo que la limpieza del ruido afecta a la interpretabilidad, no a la puntuación. No se menciona RLHF ni DPO (no aplica a un modelo de ranking).

## Capacidades

- Ranking de traducciones candidatas dado un texto fuente en japonés (selección Best-of-N).
- Estimación de calidad relativa entre candidatas: puntuaciones más altas indican mayor proximidad semántica a la fuente.
- No genera texto; su salida son puntuaciones numéricas (producto escalar de embeddings normalizados).
- Manejo de los prefijos e5 (`query:` / `passage:`) y dependencia de pooling MEAN para mantener la compatibilidad con las cabezas.
- Capacidad multilingüe restringida a ja → {en, ru, ko, vi}.
- Integración con una API de preguntas tipadas (veredictos sí/no, opción múltiple, preguntas de puntuación esperada con softmax calibrado por rango) implementada en `judge_api.py`.
- Uso como componente de scanners de contenido (`scan_phrases_v3.py`, `scan_dictionary_v3.py`) con regla de doble confirmación (percentil por locale + flag algorítmico).
- Detección de paráfrasis y equivalencia semántica, derivada del uso de positivos de paráfrasis durante el entrenamiento.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de ese tipo.

## Casos de uso

- Selección Best-of-N en la pipeline de traducción de Origa: dado un texto fuente en japonés y varias candidatas generadas, el modelo devuelve una puntuación por candidata y permite elegir la mejor antes de publicar contenido.
- Control de calidad de diccionarios y frases: desplegado en producción para detectar entradas defectuosas, combinando la puntuación con un percentil por locale y un flag algorítmico independiente (doble confirmación) para evitar falsos negativos en préstamos fonéticos.
- Detección de errores profundos de pipeline: los negativos con margen inferior a −0,50 forman parte del conjunto de entrenamiento y el modelo está diseñado para señalar traducciones claramente alejadas de la fuente.
- Filtrado de metadatos basura en memorias de traducción: el modelo se entrenó con 10.300 negativos de este tipo, por lo que puede usarse para descartar pares contaminados con metadatos antes de incorporarlos a un corpus.
- Enrutado a revisión humana: usando el percentil por locale en lugar de un corte bruto, se pueden marcar los pares dudosos para revisión manual sin bloquear traducciones correctas.
- Auditoría periódica de lotes de traducción: el conjunto de auditoría de 500 pares del entrenamiento muestra el flujo previsto de revisión por muestreo sobre evaluaciones internas (`golden_v4c`).
- Comparación A/B offline de sistemas de traducción: al ser un ranker relativo, permite enfrentar la salida de un motor nuevo contra la de producción sobre el mismo lote de fuentes.
- Detección de paráfrasis o equivalencia semántica entre frases en los idiomas cubiertos, aprovechando los positivos de paráfrasis usados en el entrenamiento.

## Benchmarks y rendimiento

Los únicos datos publicados son de evaluación interna del autor, no comparables con benchmarks públicos (MMLU, HumanEval, GSM8K, etc.) porque el modelo no es generativo.

| Evaluacion | Conjunto | Tamano | Resultado |
|---|---|---|---|
| Test interno | golden_v4c (7 iteraciones de auditoría) | 662 pares | 542 (81,9 %) |
| Conjunto de control | v7c | No disponible | 547 (82,6 %), paridad con el test |

Clase de falso negativo conocida: préstamos fonéticos (phonetic loanwords). No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks públicos de calidad de traducción (COMET, BLEU, chrF) en la información disponible.

## Requisitos de hardware

- La inferencia requiere servir el encoder intfloat/multilingual-e5-base (por ejemplo con vLLM) y ejecutar las cabezas en CPU; el checkpoint se carga con `map_location="cpu"`.
- VRAM estimada: no disponible en la ficha. La configuración recomendada por el autor lanza vLLM con `--gpu-memory-utilization 0.45` y `--max-num-seqs 256`, lo que indica que el encoder ocupa una fracción de la memoria de una GPU, pero no se especifica el modelo de GPU empleado.
- Backend de atención obligatorio: `TRITON_ATTN`; el backend por defecto `FLASH_ATTN` falla con este modelo según la model card.
- Pooling obligatorio: `MEAN` (`--pooler-config '{"pooling_type":"MEAN"}'`); el valor por defecto de vLLM (`LAST`) rompe la compatibilidad con las cabezas.
- GPU recomendadas: no disponible. Al tratarse de un encoder pequeño más un adaptador de dos MLP, es plausible su ejecución en GPU de consumo, pero la ficha no aporta una lista de GPUs validadas.
- Opciones de despliegue: vLLM (servidor de embeddings, comando incluido en la model card) y PyTorch en CPU para las cabezas. No se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El único dato temporal publicado es el entrenamiento: 5 épocas en unos 5 minutos sobre 59.973 pares usando embeddings precalculados con vLLM.

## Comparativa con modelos similares

No se dispone de comparativas numéricas publicadas en la información proporcionada.

| Modelo | Tipo | Parametros | Contexto | Licencia |
|---|---|---|---|---|
| Origa Judge v3 | Ranker de calidad de traducción (adaptador PEFT + cabezas InfoNCE) | No disponible (cabezas 2 × dim → 256 → 256) | No disponible | BSL 1.1 |
| intfloat/multilingual-e5-base | Encoder de embeddings multilingüe (modelo base, sin cabezas de ranking) | No disponible en la ficha | No disponible | MIT |
| Estimadores de calidad de traducción de referencia (familia COMET/MetricX) | Grader absoluto con referencia o sin ella | No disponible | No disponible | No disponible |

La diferencia funcional principal frente a un grader absoluto es que Origa Judge v3 solo ordena candidatas dentro de una misma llamada; no produce una puntuación calibrada entre locales ni un veredicto de aprobado/suspendido.

## Limitaciones y advertencias

- No es un grader: las puntuaciones absolutas no están calibradas entre locales y no deben usarse como umbral de aprobado/suspendido. La calibración por locale está pendiente (issue #713 del repositorio Origa).
- Las puntuaciones solo son comparables dentro de una misma llamada de ranking; no se pueden comparar entre lotes distintos.
- Falsos negativos conocidos en préstamos fonéticos; en producción se mitiga con percentil por locale y un flag algorítmico independiente (doble confirmación).
- Entrenado y evaluado exclusivamente con pares ja → {en, ru, ko, vi} de un único dominio (contenido de aprendizaje). El comportamiento fuera de dominio no está probado.
- No genera texto, por lo que no puede usarse para traducir, resumir ni responder preguntas; solo puntúa pares.
- Sesgos conocidos: no documentados explícitamente. Al derivarse de un encoder multilingüe y de negativos generados sintéticamente, puede heredar los sesgos del encoder y del corpus de entrenamiento.
- Riesgo de alucinación: no aplica en el sentido generativo; el riesgo equivalente es la clasificación errónea (falsos positivos o negativos) en la selección de candidatas.
- Licencia BSL 1.1: no es una licencia de código abierto aprobada por la OSI y este tipo de licencia suele restringir el uso comercial en producción; hay que consultar el texto completo antes de cualquier despliegue comercial. El encoder base sí es MIT según su model card.
- Dependencias técnicas frágiles: requiere pooling MEAN y backend `TRITON_ATTN`; usar los valores por defecto de vLLM rompe la compatibilidad con las cabezas.
- Madurez limitada: 0 descargas y 0 likes en HuggingFace, ficha creada y actualizada el mismo día (12 de octubre de 2026 según los metadatos), sin validación externa conocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yurvon-screamo/origa-judge
- Repositorio del proyecto Origa: https://github.com/yurvon-screamo/origa
- Licencia BSL 1.1 del proyecto: https://github.com/yurvon-screamo/origa/blob/master/LICENSE
- Issue de calibración por locale (#713): https://github.com/yurvon-screamo/origa/issues/713
- API de preguntas tipadas (`judge_api.py`): https://github.com/yurvon-screamo/origa/blob/master/translator/scripts/judge_api.py
- Scanner de frases (`scan_phrases_v3.py`): https://github.com/yurvon-screamo/origa/blob/master/translator/scripts/scan_phrases_v3.py
- Scanner de diccionario (`scan_dictionary_v3.py`): https://github.com/yurvon-screamo/origa/blob/master/translator/scripts/scan_dictionary_v3.py
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-base
