# Urdatorn/sphragis-alm-olmo3-greek-7b-sophocles

## Resumen

El modelo `Urdatorn/sphragis-alm-olmo3-greek-7b-sophocles` es un modelo de lenguaje autorial (ALM, por sus siglas en inglés) diseñado específicamente para la atribución de autoría en griego antiguo. Forma parte de un conjunto de diecisiete modelos, cada uno entrenado sobre las frases de un único autor del corpus Sphragis, siguiendo la metodología de Huang, Murakami y Grieve (2025) publicada en PLoS ONE. Este modelo concreto se especializa en Sófocles y se utiliza para calcular la perplejidad de una frase dada y atribuirla al autor cuyo modelo la encuentra menos sorprendente.

El modelo parte de `Urdatorn/olmo3-7b-ancient-greek`, una adaptación al griego antiguo del modelo base `allenai/Olmo-3-1025-7B` de AI2, y se somete a un further-pretraining completo sobre 3.100 frases de Sófocles (224.923 tokens puntuados). Con 7.298 millones de parámetros, su relevancia radica en que ofrece un enfoque abierto y reproducible para la estilometría clásica, con un rendimiento comparable al de los modelos entrenados desde la base sin adaptación lingüística previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OLMo 3, sin detalles adicionales) |
| Parametros totales | 7.298.011.136 (7,3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en bf16) |
| Idiomas soportados | Griego antiguo (grc) |
| Licencia | Other (derivado de fuentes con licencias mixtas, incluyendo CC BY-NC-SA) |
| Formato de pesos | Safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura OLMo 3 de 7B, un transformer decoder-only de AI2, aunque la model card no especifica detalles internos adicionales. El proceso de entrenamiento consiste en un further-pretraining completo del modelo base `Urdatorn/olmo3-7b-ancient-greek` sobre las frases de entrenamiento de Sófocles del corpus Sphragis. Cada secuencia se construye como `<|endoftext|> frase <|endoftext|>`, con una frase por secuencia, y se optimiza con el objetivo de modelado de lenguaje causal.

La selección del mejor checkpoint se realiza mediante early stopping basado en la pérdida de validación del propio autor: se eligió la época 1.0 de un máximo de 20 (con paciencia 3), alcanzando una pérdida de validación de 1,2290 nats/token. El entrenamiento usó una tasa de aprendizaje constante de 1e-05 tras 25 pasos de warmup, un batch efectivo de 16 frases, precisión fp32 para los pesos maestros y bf16 para el cómputo, con FSDP full shard sobre 2 GPU GH200. A diferencia del método original de Huang y colegas, que fijaba 100 épocas, aquí la duración se determina por evidencia de validación.

## Capacidades

- Atribución de autoría en griego antiguo: calcula la perplejidad por token de una frase y la compara con la de otros dieciséis modelos autoriales para determinar el autor más probable.
- Modelado de lenguaje especializado: genera distribuciones de probabilidad sobre tokens en griego antiguo, adaptadas al estilo de Sófocles.
- Evaluación estilométrica: permite medir la "sorpresa" de un texto dado respecto a un autor concreto, útil para análisis filológicos.
- Puntuación de frases: acepta secuencias de texto y devuelve la log-verosimilitud negativa por token, tal como se entrenó.
- Integración en pipelines de atribución: puede combinarse con los otros dieciséis ALMs del benchmark Sphragis para clasificar textos completos.
- No incluye capacidades de generación conversacional, tool calling, visión ni razonamiento multi-paso; su función es estrictamente evaluativa.

## Casos de uso

- Autenticación de textos clásicos: un investigador puede puntuar un fragmento dudoso con los diecisiete modelos y atribuirlo al autor con menor perplejidad, ayudando a verificar la autoría de obras atribuidas a Sófocles.
- Análisis de estilos literarios: comparar la "distancia estilística" entre diferentes obras del corpus trágico griego usando las puntuaciones de perplejidad como métrica.
- Detección de interpolaciones: en manuscritos con pasajes sospechosos, se puede evaluar si un segmento concreto se desvía del estilo del autor principal.
- Investigación en estilometría computacional: servir como modelo de referencia para probar nuevas técnicas de atribución de autoría en lenguas antiguas con pocos recursos.
- Docencia en filología digital: los estudiantes pueden experimentar con la atribución automática de textos griegos y comprender los fundamentos de los ALMs.
- Extensión a otros autores: el código de entrenamiento y evaluación está disponible, permitiendo crear nuevos ALMs para autores no incluidos en el benchmark original.

## Benchmarks y rendimiento

En el split de validación `sentence_1` del benchmark Sphragis, los diecisiete modelos autoriales entrenados desde la base adaptada al griego (`olmo3-7b-ancient-greek`) alcanzan conjuntamente una macro-F1 de 0,800. Los mismos diecisiete modelos entrenados desde la base sin adaptación lingüística previa logran 0,812, lo que indica que la adaptación al griego mejora la calidad del modelado de lenguaje pero no aumenta la discriminabilidad del conjunto. No se han publicado otros resultados de benchmarks en la información disponible.

| Modelo | Macro-F1 (validación Sphragis) |
|---|---|
| 17 ALMs con base adaptada al griego | 0,800 |
| 17 ALMs con base sin adaptar | 0,812 |

## Requisitos de hardware

- El entrenamiento se realizó con 2 GPU NVIDIA GH200 usando FSDP full shard, pero no se especifican requisitos de inferencia.
- Para inferencia en bf16, un modelo de 7,3B parámetros requiere aproximadamente 14-16 GB de VRAM, por lo que podría ejecutarse en GPUs de consumo como una RTX 4090 (24 GB) o una RTX 3090 (24 GB), aunque no hay datos oficiales.
- El repositorio contiene pesos en safetensors, por lo que es compatible con frameworks como vLLM, Hugging Face Transformers o llama.cpp (si se convierte a GGUF), aunque no se mencionan configuraciones de despliegue específicas.
- No se dispone de datos de latencia o throughput para este modelo concreto.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de atribución de autoría en griego antiguo comparables. La única referencia directa es el modelo base `Urdatorn/olmo3-7b-ancient-greek`, del cual este ALM es un fine-tuning, y el método original de Huang et al. (2025) que utiliza modelos más pequeños con épocas fijas. No se pueden proporcionar comparaciones cuantitativas adicionales.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en el estilo de Sófocles; su uso fuera de la atribución de autoría o con textos de otros autores carece de sentido.
- La licencia es `other` debido a que el corpus Sphragis incluye fuentes con licencias mixtas, incluyendo CC BY-NC-SA, lo que puede restringir el uso comercial. Es imprescindible revisar el archivo `LICENSES.md` del dataset antes de cualquier reutilización.
- El modelo puede presentar sesgos derivados del corpus de entrenamiento, que se limita a 3.100 frases de un único autor; no es representativo de la variedad dialectal o cronológica del griego antiguo.
- Riesgo de alucinación: al ser un modelo de lenguaje, puede generar texto plausible pero incorrecto si se usa para generación, aunque su propósito principal es la evaluación de perplejidad.
- La longitud de contexto no está documentada, por lo que se desconoce su comportamiento con secuencias largas.
- El rendimiento en atribución depende de la comparación con los otros dieciséis modelos; usarlo de forma aislada no proporciona una decisión de autoría.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Urdatorn/sphragis-alm-olmo3-greek-7b-sophocles
- Modelo base adaptado al griego: https://huggingface.co/Urdatorn/olmo3-7b-ancient-greek
- Dataset Sphragis: https://huggingface.co/datasets/Urdatorn/sphragis
- Código de entrenamiento y evaluación: https://github.com/Urdatorn/sphragis_models
- Paper de referencia (Huang, Murakami y Grieve, 2025): https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0327081
- Paper de OLMo 3 (arXiv): https://arxiv.org/abs/2512.13961
- Repositorio OLMo de AI2: https://github.com/allenai/OLMo
