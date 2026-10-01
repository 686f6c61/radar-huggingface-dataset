# yuriilaba/ucu-wsd-aug16-generation_shuffling_pt-false_seed-42

## Resumen

El modelo `yuriilaba/ucu-wsd-aug16-generation_shuffling_pt-false_seed-42` es un fine-tuning de un sentence-transformer multilingüe orientado a la desambiguación del sentido de las palabras (word-sense disambiguation, WSD) en ucraniano. Lo desarrolla Yurii Laba, investigador centrado en PLN multilingüe y en la representación del significado léxico del ucraniano, y forma parte de una familia de variantes experimentales (`pt-true`/`pt-false`, distintas semillas y estrategias de aumento de datos) publicadas bajo el proyecto U-WSD.

El modelo parte de `sentence-transformers/paraphrase-multilingual-mpnet-base-v2` y se ha ajustado sobre un conjunto de tripletes construido a partir de una estrategia de aumento por generación y barajado de tokens (`triplets_generation_token_shuffling_16_samples.csv`). Con 278.043.648 parámetros y un repositorio de 1,1 GB, es un modelo compacto que cabe en hardware de consumo y que prioriza la eficiencia de datos: el autor trabaja específicamente en métodos para adaptar modelos de frases cuando la anotación disponible es escasa.

Su relevancia radica en que, según el proyecto asociado, se trata de uno de los primeros recursos de validación de la tarea WSD en ucraniano, un idioma con menos cobertura de评测 que el inglés. La model card reporta una exactitud WSD del 0,9084 y correlaciones STS en torno a 0,80–0,81, aunque no se especifican licencia, idiomas oficiales ni detalles completos de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder basado en XLM-RoBERTa (modelo base: `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`) |
| Parametros totales | 278.043.648 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ucraniano (tarea objetivo); el modelo base es multilingue, pero no se detalla la cobertura final |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un encoder Transformer de tipo XLM-RoBERTa, heredado del modelo `paraphrase-multilingual-mpnet-base-v2` de sentence-transformers. Se trata de un modelo de embeddings de frases y no de un modelo generativo: produce representaciones vectoriales que se emplean para comparar y clasificar sentidos. La configuración registrada incluye `target-token pooling: False`, es decir, el pooling no se restringe a la posición del token objetivo durante la agregación de representaciones.

El fine-tuning se realizó sobre tripletes anotados generados mediante una técnica de aumento de datos que combina generación y barajado de tokens (`triplets_generation_token_shuffling_16_samples.csv`), con semilla de entrenamiento 42 y semilla de división de validación 42. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron fases de RLHF o DPO. La validación se apoya en un conjunto WSD basado en el СЛОВНИК УКРАЇНСЬКОЇ МОВИ, descrito por el autor como el primero utilizado para validar esta tarea en ucraniano.

## Capacidades

- Generación de embeddings de frases y oraciones para comparación semántica.
- Desambiguación del sentido de palabras (WSD) en ucraniano.
- Evaluación de similitud semántica textual (STS), con correlaciones reportadas de Pearson y Spearman.
- Representación de texto en un espacio vectorial apto para búsqueda semántica y clustering.
- Integración con el ecosistema de sentence-transformers y con el pipeline de evaluación MTEB.
- Soporte de tool calling / function calling: no disponible (no es un modelo generativo).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: derivadas del modelo base multilingüe, aunque no se documenta la cobertura final.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Desambiguación léxica en pipelines de PLN para ucraniano: el modelo clasifica el sentido correcto de una palabra polisémica a partir de su contexto, con una exactitud reportada del 0,9084 en la tarea WSD, lo que lo hace utilizable como componente de anotación semiautomática.
- Construcción de diccionarios y tesauros computacionales: los embeddings generados pueden agrupar ocurrencias de una misma palabra por sentido y alimentar recursos léxicos basados en el СЛОВНИК УКРАЇНСЬКОЇ МОВИ.
- Búsqueda semántica en corpus ucranianos: al generar vectores de frases, permite recuperar documentos por similitud de significado en lugar de coincidencia exacta de términos.
- Evaluación de similitud entre pares de oraciones: útil para tareas de paráfrasis, detección de duplicados y alineación de textos, apoyándose en las correlaciones STS reportadas (Pearson 0,8126; Spearman 0,8034).
- Etiquetado de datos para entrenamiento de modelos mayores: puede preanotar sentidos y relaciones semánticas para reducir el coste de anotación humana en corpus ucranianos.
- Investigación en aprendizaje eficiente en datos: sirve como punto de comparación frente a las variantes de la misma familia (`pt-true`, otras semillas) para estudiar el efecto del pooling y del aumento de datos.
- Clasificación de textos y análisis de opiniones en ucraniano: los embeddings pueden alimentar clasificadores posteriores en tareas de análisis de sentimiento o categorización temática.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| WSD (ucraniano) | Accuracy | 0,9084283903675539 |
| STS | Pearson | 0,8126156950880978 |
| STS | Spearman | 0,8033623688540429 |
| MTEB | Resultados por tarea | disponibles en `evaluation/mteb_results/` del repositorio |

No se proporcionan resultados comparativos frente a otros modelos en la información disponible, ni cifras de MMLU, HumanEval o GSM8K (no aplicables a un modelo de embeddings).

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, los 278 millones de parámetros ocupan aproximadamente 1,1 GB; en FP16, en torno a 0,55 GB, más el overhead de activaciones y del tokenizador.
- GPU recomendadas: cualquier GPU con al menos 2–4 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problemas, aunque en este tamaño las GPU de gama alta quedan sobredimensionadas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna de consumo e incluso en CPU para lotes pequeños.
- Opciones de despliegue: sentence-transformers, Hugging Face Transformers, Text Embeddings Inference (TEI), ONNX Runtime y FastAPI con `transformers`; vLLM y llama.cpp no están orientados a este tipo de modelo de embeddings (llama.cpp requeriría conversión a GGUF, no documentada).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yuriilaba/ucu-wsd-aug16-generation_shuffling_pt-false_seed-42` | 278 M | no disponible | WSD/STS en ucraniano | no disponible | Hugging Face |
| `yuriilaba/ucu-wsd-aug16-generation_pt-true_seed-42` | no disponible | no disponible | WSD/STS en ucraniano | no disponible | Hugging Face |
| `yuriilaba/ucu-wsd-generation_shuffling_pt-true_seed-42` | no disponible | no disponible | WSD/STS en ucraniano | no disponible | Hugging Face |
| `sentence-transformers/paraphrase-multilingual-mpnet-base-v2` | 278 M | no disponible | Embeddings multilingues | Apache 2.0 (modelo base) | Hugging Face |

Las variantes de la misma familia se diferencian por el uso de pooling sobre el token objetivo (`pt-true` frente a `pt-false`), la estrategia de aumento de datos y la semilla. No se dispone de resultados numéricos comparativos entre ellas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto ni admite instrucciones en lenguaje natural; su salida son representaciones vectoriales o puntuaciones de similitud.
- Riesgo de alucinación: no aplica en el sentido habitual, pero puede asignar sentidos incorrectos en contextos ambiguos o poco representados en el conjunto de entrenamiento.
- Sesgos conocidos: no documentados en la información disponible; el rendimiento depende de la representatividad del corpus de tripletes y del diccionario de referencia.
- Limitaciones de idioma: el modelo está ajustado específicamente para ucraniano, pese a que su base es multilingüe; el rendimiento en otros idiomas no está validado.
- Limitaciones de contexto: no se especifica la longitud máxima de secuencia soportada.
- Restricciones de licencia: la licencia no está indicada en el repositorio, por lo que no puede confirmarse su uso comercial sin consultar al autor.
- Uso en producción: con solo 7 descargas y 0 likes, el modelo tiene una validación comunitaria muy limitada; conviene reproducir las métricas reportadas antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuriilaba/ucu-wsd-aug16-generation_shuffling_pt-false_seed-42
- Variante relacionada (`pt-true`): https://huggingface.co/yuriilaba/ucu-wsd-aug16-generation_pt-true_seed-42
- Variante relacionada (shuffling, `pt-true`): https://huggingface.co/yuriilaba/ucu-wsd-generation_shuffling_pt-true_seed-42
- Página personal del autor: https://yuriilaba.github.io/
- Perfil de GitHub del autor: https://github.com/YuriiLaba
- Repositorio U-WSD: https://github.com/YuriiLaba/U-WSD
