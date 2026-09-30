# yuriilaba/ucu-wsd-aug16-generation_mlm_pt-true_seed-42

## Resumen

El modelo `ucu-wsd-aug16-generation_mlm_pt-true_seed-42` es un ajuste fino de tipo *word-sense disambiguation* (WSD, desambiguación del sentido de las palabras) para ucraniano, publicado por el usuario yuriilaba en Hugging Face. Parte del modelo base `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`, que a su vez se apoya en la arquitectura XLM-RoBERTa, y cuenta con 278.043.648 parámetros totales, lo que lo sitúa en la categoría de modelos encoder de tamano medio (~278 M).

Se trata de un modelo orientado a representaciones vectoriales de frases y a la clasificación del sentido léxico, no a la generación de texto libre. Su entrenamiento se realizo sobre tripletes (`triplets_generation_mask_16_samples.csv`) con *target-token pooling* activado y semilla fija (42), y reporta una precision WSD de 0,9401, ademas de correlaciones STS de 0,7959 (Pearson) y 0,7852 (Spearman).

Su relevancia es acotada pero concreta: cubre una tarea NLP clásica y poco frecuente en modelos abiertos para ucraniano, con metricas verificables en la model card y resultados MTEB publicados en el repositorio. Al ser un modelo recién creado (30 de septiembre de 2026) con 0 descargas y 0 likes, no existe aun validación externa ni adopción comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder basado en XLM-RoBERTa (heredada de `paraphrase-multilingual-mpnet-base-v2`) |
| Parametros totales | 278.043.648 |
| Longitud de contexto | no disponible (el modelo base XLM-RoBERTa suele configurarse con hasta 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ucraniano para la tarea WSD (según model card); el modelo base es multilingüe |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,1 GB |
| Pipeline declarado | no disponible |
| Tarea principal | word-sense disambiguation (clasificación / embeddings) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de tipo encoder, heredada del modelo base `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`, que emplea una columna XLM-RoBERTa con 278 M de parámetros. El ajuste fino se realiza sobre un objetivo de clasificación de sentido léxico, con *target-token pooling* activado (`pt-true`), lo que implica que la representación se construye agrupando específicamente el token objetivo de cada ejemplo en lugar de promediar toda la secuencia. Se trata, por tanto, de un modelo denso, no de una arquitectura MoE ni de un modelo generativo autorregresivo, pese a que el nombre del checkpoint incluya la palabra `generation`.

Los datos de entrenamiento proceden del fichero `local_datasets/semi_supervised_2/triplets/triplets_generation_mask_16_samples.csv`, un conjunto de tripletes construido de forma semisupervisada con enmascaramiento y 16 muestras por instancia. La semilla de entrenamiento y la de partición de validación son ambas 42, lo que facilita la reproducibilidad del experimento. No se especifica el número total de tokens, la composición lingüística del corpus, ni si se aplicaron técnicas de RLHF o DPO (poco habituales en este tipo de tareas). El autor reporta resultados MTEB completos en el directorio `evaluation/mteb_results/` del repositorio, pero no se han incluido en la información disponible.

## Capacidades

- Desambiguación del sentido de palabras (WSD) en ucraniano: clasifica el sentido correcto de un token objetivo dado un contexto de tripletes.
- Generación de embeddings de frase y de token, heredada del modelo base `paraphrase-multilingual-mpnet-base-v2`.
- Similitud semántica textual (STS), con correlaciones reportadas de 0,7959 (Pearson) y 0,7852 (Spearman).
- Capacidad multilingüe potencial por herencia del modelo base, aunque la model card solo documenta uso en ucraniano.
- Evaluación MTEB a nivel de tarea incluida en el repositorio (`evaluation/mteb_results/`).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-step, visión ni audio.
- No se documenta modo de razonamiento (*thinking mode*) ni decodificación especulativa.

## Casos de uso

- Desambiguación léxica en pipelines de PLN para ucraniano: el modelo permite asignar el sentido correcto a palabras polisémicas, útil en análisis semántico, indexación y anotación automática de corpus.
- Enriquecimiento de tesauros y ontologías: se puede usar para vincular ocurrencias de una palabra con entradas de WordNet o recursos léxicos equivalentes en ucraniano.
- Búsqueda semántica multilingüe: al derivar de un modelo multilingüe, permite comparar consultas y documentos por similitud vectorial, con aplicación en recuperación de información.
- Sistemas de recomendación de contenidos textuales: los embeddings de frase permiten agrupar y recomendar documentos por proximidad semántica.
- Evaluación de traducción automática: la correlación STS reportada permite usar el modelo como métrica auxiliar de similitud semántica entre original y traducción.
- Clustering y deduplicación de textos: el modelo genera vectores que pueden agruparse para detectar duplicados o temas recurrentes en grandes volúmenes de documentos en ucraniano.
- Investigación académica en WSD: sirve como punto de comparación reproducible (semillas fijas 42) para experimentos de desambiguación en lenguas eslavas.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| WSD | Accuracy | 0,9401 |
| STS | Pearson | 0,7959 |
| STS | Spearman | 0,7852 |

No se dispone de resultados comparativos con otros modelos en la información proporcionada. La model card indica que los resultados completos a nivel de tarea MTEB están en `evaluation/mteb_results/` dentro del repositorio, pero no se incluyen en los datos disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en FP32 (coincide con el tamano del repositorio), ~0,56 GB en FP16/BF16, ~0,28 GB en INT8 y ~0,14 GB en INT4. Son estimaciones derivadas del número de parámetros, no valores publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo en FP16; una RTX 3060, RTX 4090 o superiores ofrecen margen sobrado.
- Cabe en GPU de consumo: sí, en practicamente cualquier GPU moderna e incluso en CPU para lotes pequeños.
- Opciones de despliegue: `sentence-transformers` y `transformers` son las vías naturales; `vLLM` y `TGI` están orientados a modelos generativos y no son la opción habitual para un encoder de este tipo. `llama.cpp` y `Ollama` requerirían una conversion a GGUF que no se documenta.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas publicadas en la información proporcionada para establecer una comparación cuantitativa con alternativas. Como referencia cualitativa, el modelo deriva de `sentence-transformers/paraphrase-multilingual-mpnet-base-v2` (mismo numero de parámetros y arquitectura), pero el ajuste fino introduce un objetivo específico de WSD en ucraniano que el modelo base no cubre. No se conocen otros modelos comparables publicados con metricas equivalentes en la información disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ucu-wsd-aug16-generation_mlm_pt-true_seed-42 | 278 M | no disponible | no disponible | Hugging Face |
| paraphrase-multilingual-mpnet-base-v2 (base) | 278 M | no disponible | no disponible | Hugging Face |
| Alternativas WSD comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no se documenta ningún análisis de sesgos; al ser un ajuste sobre corpus ucraniano, puede reflejar los sesgos presentes en dicha fuente.
- Riesgo de alucinación: bajo en sentido generativo (no es un modelo de generación de texto), pero puede producir clasificaciones de sentido erroneas en contextos ambiguos o fuera de dominio.
- Limitaciones de idioma: la tarea está declarada para ucraniano; el rendimiento en otras lenguas no está validado, aunque el modelo base sea multilingüe.
- Limitaciones de contexto: la longitud de contexto efectiva no se especifica; debe comprobarse la configuración antes de usarlo con secuencias largas.
- Licencia: no disponible. Al no especificarse, no se puede confirmar si el uso comercial está permitido; conviene consultar al autor antes de utilizarlo en producción.
- Adopción nula: 0 descargas y 0 likes, sin validación externa ni mantenimiento documentado.
- Ausencia de datos de cuantización: no se ofrecen versiones GGUF, GPTQ o AWQ, lo que limita el despliegue en entornos con restricciones de memoria.
- Producción: al tratarse de una tarea específica (WSD), no debe emplearse como modelo de propósito general ni para generación de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuriilaba/ucu-wsd-aug16-generation_mlm_pt-true_seed-42
- Modelo relacionado (referencia cruzada): https://huggingface.co/yuriilaba/ucu-wsd-generation_all_combined_pt-false_seed-42
- Modelo relacionado (referencia cruzada): https://huggingface.co/yuriilaba/ucu-wsd-generation_shuffling_pt-true_seed-456
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-mpnet-base-v2
