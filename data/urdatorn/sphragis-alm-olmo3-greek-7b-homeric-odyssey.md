# Urdatorn/sphragis-alm-olmo3-greek-7b-homeric-odyssey

## Resumen

El modelo `Urdatorn/sphragis-alm-olmo3-greek-7b-homeric-odyssey` es uno de los diecisiete modelos de lenguaje autorial (ALM) desarrollados por Urdatorn para el benchmark Sphragis de atribución de autoría en griego antiguo. Sigue la metodología propuesta por Huang, Murakami y Grieve (2025) en su artículo "Attributing authorship via the perplexity of authorial language models", donde cada modelo se entrena exclusivamente con las frases de un único autor y la atribución se realiza comparando la perplejidad de cada frase entre los diecisiete modelos. Este modelo concreto se especializa en la Odisea de Homero, con 4.800 frases y 452.400 tokens de entrenamiento.

El modelo parte de `Urdatorn/olmo3-7b-ancient-greek`, una adaptación al griego antiguo del OLMo 3 7B de AI2, y realiza un further-pretraining completo sobre el corpus homérico. Con 7.298 millones de parámetros, está diseñado específicamente para tareas de atribución de autoría y análisis estilométrico, no para generación de texto general. Su relevancia radica en que ofrece un enfoque abierto y reproducible para la atribución de autoría en textos clásicos, un campo donde los métodos tradicionales suelen depender de características superficiales y no de modelos de lenguaje neuronales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo 3 7B, detalles específicos no disponibles) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos originales en bf16) |
| Idiomas soportados | Griego antiguo (grc) |
| Licencia | other (derivado de fuentes con licencias mixtas, incluyendo CC BY-NC-SA) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura OLMo 3 7B, un transformer decoder-only desarrollado por AI2, aunque los detalles específicos de la arquitectura (número de capas, cabezas de atención, etc.) no se han publicado en la información disponible. El proceso de entrenamiento consiste en un further-pretraining completo del modelo base `Urdatorn/olmo3-7b-ancient-greek` sobre las frases de entrenamiento de la Odisea de Homero del conjunto Sphragis. Cada secuencia de entrenamiento sigue el formato `<|endoftext|> sentence <|endoftext|>`, con una frase por secuencia.

El entrenamiento utiliza el objetivo de modelado de lenguaje causal, con una pérdida de validación de 1.0057 nats/token en la mejor época (época 2 de un máximo de 20, con paciencia 3). Se emplea una tasa de aprendizaje constante de 1e-05 tras 25 pasos de calentamiento, un batch efectivo de 16 frases, y precisión mixta con pesos maestros en fp32 y cómputo en bf16, utilizando FSDP con sharding completo en dos GPUs GH200. A diferencia del método original de Huang y colegas, que fijaba 100 épocas, aquí se aplica early stopping basado en la pérdida de validación del propio autor, lo que permite una selección de modelo más eficiente y basada en evidencia.

## Capacidades

- Atribución de autoría: el modelo está diseñado para calcular la perplejidad de frases en griego antiguo y compararla con otros dieciséis modelos autoriales para determinar el autor más probable.
- Modelado de lenguaje en griego antiguo: al estar entrenado exclusivamente con texto homérico, captura patrones lingüísticos y estilísticos específicos de la Odisea.
- Análisis estilométrico: puede utilizarse para medir la similitud estilística entre textos y autores dentro del corpus Sphragis.
- No soporta tool calling, generación de código, visión ni otras capacidades multimodales.
- No es un modelo de chat ni de instrucciones; su uso principal es la puntuación de perplejidad, no la generación de texto libre.

## Casos de uso

- Atribución de autoría en textos clásicos: dado un fragmento de griego antiguo, se calcula su perplejidad con este modelo y con los otros dieciséis ALMs; el autor del modelo que produzca menor perplejidad se considera el más probable. Es adecuado para investigaciones filológicas sobre autoría de obras anónimas o disputadas.
- Análisis estilométrico comparativo: los investigadores pueden usar el modelo para medir la distancia estilística entre diferentes obras homéricas o entre Homero y otros autores, aprovechando la sensibilidad del modelo a las peculiaridades del estilo de la Odisea.
- Verificación de autenticidad de fragmentos: en estudios de crítica textual, el modelo puede ayudar a detectar interpolaciones o pasajes de dudosa autenticidad comparando su perplejidad con la del corpus homérico.
- Entrenamiento de sistemas de atribución multiclas: el modelo puede integrarse en pipelines de atribución que combinen las puntuaciones de los diecisiete ALMs, como se describe en el código de Sphragis, para obtener una decisión conjunta.
- Investigación en estilometría computacional: sirve como punto de referencia para evaluar nuevos métodos de atribución de autoría en lenguas antiguas, dado que su entrenamiento y evaluación están documentados de forma transparente.
- Docencia y divulgación: en cursos de humanidades digitales, el modelo puede utilizarse como ejemplo práctico de aplicación de modelos de lenguaje a problemas filológicos, mostrando cómo la perplejidad se relaciona con la autoría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks individuales para este modelo en la información disponible. La model card indica que, en la división de validación `sentence_1` del conjunto Sphragis, los diecisiete modelos entrenados desde la base adaptada al griego alcanzan conjuntamente un macro-F1 de 0.800, mientras que los mismos diecisiete entrenados desde la base no adaptada alcanzan 0.812. Esto sugiere que la adaptación al griego mejora la calidad de cada modelo como modelo de lenguaje, pero no necesariamente la discriminación entre autores. No se proporcionan métricas específicas para este modelo individual.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16 (14.6 GB), se necesitan al menos 16 GB de VRAM para cargar el modelo completo. Con cuantización a 8 bits, unos 8 GB; a 4 bits, unos 4 GB, aunque no se han publicado archivos cuantizados.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) o A100 (40 GB) pueden ejecutar el modelo en bf16 sin problemas. Para cuantización, una RTX 3080 (10 GB) o superior sería suficiente.
- En consumer GPU: sí, cabe en GPUs de gama alta con 16 GB o más, y en GPUs de gama media con cuantización.
- Opciones de despliegue: al ser un modelo de solo puntuación (no generativo), puede ejecutarse con bibliotecas como Hugging Face Transformers, vLLM (aunque no está optimizado para generación), o llama.cpp si se convierte a GGUF. El código de entrenamiento y puntuación está disponible en el repositorio `Urdatorn/sphragis_models`.
- Latencia y throughput: no se han publicado datos específicos. Para una frase de longitud media (unos 100 tokens), la inferencia en una GPU moderna debería tomar menos de un segundo.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de atribución de autoría en griego antiguo. Los modelos comparables serían los otros dieciséis ALMs del conjunto Sphragis, pero no se han publicado sus especificaciones individuales. El modelo base `Urdatorn/olmo3-7b-ancient-greek` es el punto de partida, pero no está especializado en un autor concreto. Alternativas genéricas como los modelos OLMo 3 estándar no están adaptados al griego antiguo ni a la tarea de atribución, por lo que no son directamente comparables.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo está entrenado exclusivamente con la Odisea de Homero, por lo que su conocimiento del griego antiguo está fuertemente sesgado hacia el estilo homérico y puede no generalizar bien a otros dialectos o géneros literarios.
- Riesgo de alucinación: al ser un modelo de lenguaje, puede generar texto plausible pero incorrecto si se usa para generación, aunque su uso previsto es la puntuación de perplejidad, no la generación.
- Limitaciones de contexto: la longitud de contexto no está documentada; el entrenamiento usa una frase por secuencia, lo que sugiere que el modelo no está optimizado para contextos largos.
- Restricciones de licencia: la licencia `other` se debe a que el texto de entrenamiento proviene de fuentes con licencias mixtas, incluyendo CC BY-NC-SA. Esto puede impedir el uso comercial o la redistribución sin verificación de las licencias de los datos originales. Se recomienda consultar el archivo `LICENSES.md` del dataset Sphragis antes de cualquier reutilización.
- Adecuación para producción: el modelo está pensado para investigación académica, no para aplicaciones comerciales. Su rendimiento en tareas fuera de la atribución de autoría no ha sido evaluado.
- Dependencia del conjunto Sphragis: la metodología de atribución requiere los otros dieciséis modelos y el conjunto de datos completo; el modelo por sí solo no puede realizar atribución de autoría.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Urdatorn/sphragis-alm-olmo3-greek-7b-homeric-odyssey)
- [Modelo base: Urdatorn/olmo3-7b-ancient-greek](https://huggingface.co/Urdatorn/olmo3-7b-ancient-greek)
- [Dataset Sphragis](https://huggingface.co/datasets/Urdatorn/sphragis)
- [Código de entrenamiento y puntuación](https://github.com/Urdatorn/sphragis_models)
- [Paper de referencia: Huang, Murakami y Grieve (2025), PLoS ONE](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0327081)
- [Paper de OLMo 3 (arXiv:2512.13961)](https://arxiv.org/abs/2512.13961)
- [Colección OLMo 3 en Hugging Face](https://huggingface.co/collections/allenai/olmo-3)
