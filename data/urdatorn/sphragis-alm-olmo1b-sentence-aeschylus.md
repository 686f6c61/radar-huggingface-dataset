# Urdatorn/sphragis-alm-olmo1b-sentence-aeschylus

## Resumen

El modelo `Urdatorn/sphragis-alm-olmo1b-sentence-aeschylus` es un modelo de lenguaje autorial (ALM, por sus siglas en inglés) desarrollado por Urdatorn como parte del benchmark Sphragis de atribución de autoría en griego antiguo. Se trata de un ajuste fino completo (further-pretraining) del modelo base `allenai/OLMo-1B-hf`, especializado en la obra del dramaturgo Esquilo. Su propósito no es la generación de texto general, sino calcular la perplejidad de frases en griego antiguo para atribuir su autoría comparando la log-verosimilitud negativa por token entre 28 modelos similares, cada uno entrenado sobre un autor distinto.

El modelo sigue la metodología de Huang, Murakami y Grieve (2025), publicada en PLoS ONE, que propone atribuir autoría mediante la perplejidad de modelos de lenguaje autoriales. A diferencia del enfoque original con 100 épocas fijas, aquí la duración del entrenamiento se selecciona mediante validación sobre la propia tarea de atribución, lo que mejora la eficiencia y el rendimiento. Con 1.176.764.416 parámetros (aproximadamente 1,17 mil millones), este modelo es ligero y puede ejecutarse en hardware de consumo, aunque su uso está restringido por la licencia `other` debido a las licencias mixtas de los textos de entrenamiento.

La relevancia de este modelo radica en su contribución a la estilometría computacional y a los estudios filológicos digitales, ofreciendo una herramienta reproducible y abierta para la atribución de autoría en textos clásicos. Forma parte de un conjunto de 28 modelos que, en conjunto, alcanzan una macro-F1 de 62,36 en la tarea de atribución a nivel de frase individual, y de 92,44 cuando se dispone de 50 frases consecutivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo-1B) |
| Parametros totales | 1.176.764.416 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la ficha) |
| Tipos de cuantizacion | bf16 (pesos originales); no se especifican cuantizaciones adicionales |
| Idiomas soportados | grc (griego antiguo) |
| Licencia | other (derivada de licencias mixtas, incluye CC BY-NC-SA) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura OLMo-1B, un transformer decoder-only de 1,17 mil millones de parámetros desarrollado por el Allen Institute for AI. OLMo-1B es un modelo completamente abierto, con pesos, datos de entrenamiento y código publicados. En este caso, se realiza un further-pretraining completo sobre el corpus de frases de Esquilo extraído del benchmark Sphragis, con el objetivo de modelar la distribución de probabilidad de las frases de ese autor específico.

El entrenamiento se llevó a cabo con un objetivo de modelado de lenguaje causal sobre secuencias del formato `<|endoftext|> sentence <|endoftext|>`, procesando una frase por secuencia. Se utilizaron 2.600 filas de entrenamiento, que suman 122.111 tokens puntuados. El número de épocas (2) y el modelo base de partida (OLMo-1B vanilla o adaptado al griego) se seleccionaron mediante ascenso de coordenadas sobre la macro-F1 de atribución en el conjunto de validación, un criterio más alineado con la tarea final que la perplejidad del propio autor. El learning rate fue de 5e-05 constante tras 25 pasos de calentamiento, con un batch efectivo de 16 frases. La precisión de entrenamiento fue fp32 para los pesos maestros, con cómputo en bf16 y paralelismo FSDP completo sobre 2 GPUs GH200. Los pesos finales se guardaron en bf16.

## Capacidades

- Atribución de autoría: el modelo está diseñado para puntuar la perplejidad de frases en griego antiguo y compararla con otros 27 modelos autoriales, permitiendo atribuir un texto a su autor probable.
- Modelado de lenguaje especializado: captura las peculiaridades estilísticas y léxicas de Esquilo, lo que lo hace útil para análisis estilométricos.
- Procesamiento de griego antiguo: entrenado exclusivamente en textos en grc, maneja vocabulario, morfología y sintaxis de esta lengua clásica.
- No soporta tool calling, ni agentes, ni visión, ni audio; es un modelo de lenguaje puro orientado a una tarea específica.
- Capacidad multilingüe: limitada al griego antiguo; no se ha evaluado en otros idiomas.

## Casos de uso

- Investigación filológica: los estudiosos de la literatura clásica pueden usar el modelo para verificar la autoría de fragmentos dudosos atribuidos a Esquilo, comparando la perplejidad de las frases con la de otros autores trágicos.
- Análisis estilométrico cuantitativo: el modelo permite medir la distancia estilística entre textos mediante la log-verosimilitud negativa, complementando métodos tradicionales de análisis de frecuencia léxica.
- Construcción de corpus anotados: en proyectos de digitalización de textos griegos, el modelo puede ayudar a etiquetar automáticamente la autoría de pasajes fragmentarios.
- Educación y divulgación: sirve como herramienta didáctica para demostrar la aplicación de técnicas de aprendizaje automático a humanidades digitales.
- Evaluación de modelos de lenguaje clásicos: al ser parte de un conjunto de 28 modelos, permite estudiar cómo varía el rendimiento según el autor y la longitud del texto disponible.
- Reproducibilidad científica: el código de entrenamiento y evaluación está disponible en GitHub, lo que facilita replicar y extender los experimentos a otros autores o lenguas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks individuales para este modelo en la información disponible. Sin embargo, el conjunto completo de 28 modelos autoriales, del cual este forma parte, alcanza los siguientes resultados en el benchmark Sphragis (test macro-F1):

| Tarea | Macro-F1 |
|---|---|
| sentence_1 (una frase) | 62,36 |
| sentence_5 (cinco frases) | 86,84 |
| sentence_10 (diez frases) | 89,53 |
| sentence_50 (cincuenta frases) | 92,44 |

Estos valores corresponden a la atribución conjunta de los 28 modelos, no a este modelo de forma aislada. No se dispone de comparaciones con otros sistemas de atribución de autoría en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener 1,17 mil millones de parámetros en bf16, el modelo ocupa aproximadamente 2,3 GB en memoria. Con overhead de activaciones y contexto, se estima que cabe en GPUs con al menos 6 GB de VRAM, aunque no se han publicado requisitos oficiales.
- GPU recomendadas: cualquier GPU consumer moderna con 8 GB o más de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 2070) puede ejecutar el modelo sin problemas. Para entrenamiento se usaron 2x GH200, pero la inferencia es mucho menos exigente.
- Opciones de despliegue: al ser un modelo con pesos en safetensors, puede cargarse con bibliotecas estándar como Hugging Face Transformers. También es compatible con herramientas de inferencia optimizada como vLLM, llama.cpp (si se convierte a GGUF) u Ollama, aunque no se han publicado conversiones oficiales.
- Latencia y throughput: no se han publicado mediciones. Dado el tamaño, se espera una latencia de decenas de milisegundos por token en GPU consumer, pero no hay datos confirmados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia |
|---|---|---|---|---|
| `Urdatorn/sphragis-alm-olmo1b-sentence-aeschylus` | 1,17B | no disponible | Atribución de autoría en griego antiguo (Esquilo) | other |
| `Urdatorn/sphragis-alm-olmo3-7b-homeric-odyssey` | 7B (OLMo-3) | no disponible | Atribución de autoría en griego antiguo (Homero) | other |
| `allenai/OLMo-1B-hf` | 1,17B | 2048 (según paper de OLMo) | Modelo de lenguaje general en inglés | Apache-2.0 |

El modelo se diferencia del base OLMo-1B en su especialización en griego antiguo y en su objetivo de atribución de autoría. Frente al modelo de 7B basado en OLMo-3, este es más ligero y adecuado para entornos con recursos limitados, aunque probablemente con menor capacidad de modelado estilístico. No se dispone de comparaciones de rendimiento directas entre ambos.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse exclusivamente sobre textos de Esquilo, el modelo puede tener un sesgo estilístico muy marcado y no generalizar a otros autores o géneros literarios.
- Riesgo de alucinación: como modelo de lenguaje, puede generar texto plausible pero incorrecto si se usa fuera de su tarea de puntuación; no está diseñado para generación libre.
- Limitaciones de contexto: la longitud de contexto no está especificada, pero al ser un modelo de 1B, es probable que sea limitada (típicamente 2048 tokens en OLMo-1B). Para atribución de autoría se recomienda usar frases individuales o secuencias cortas.
- Restricciones de licencia: la licencia `other` se debe a que los textos de entrenamiento incluyen material con licencia CC BY-NC-SA, lo que impide el uso comercial sin verificación adicional. Es imprescindible revisar el archivo `LICENSES.md` del dataset Sphragis antes de cualquier reutilización.
- Limitaciones de idioma: el modelo solo es útil para griego antiguo; no se ha evaluado en otros idiomas y su rendimiento en griego moderno o inglés sería deficiente.
- Dependencia del benchmark: el rendimiento reportado depende de la calidad y representatividad del corpus Sphragis; fuera de ese contexto, la utilidad del modelo es limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Urdatorn/sphragis-alm-olmo1b-sentence-aeschylus
- Dataset Sphragis: https://huggingface.co/datasets/Urdatorn/sphragis
- Código de entrenamiento y evaluación: https://github.com/Urdatorn/sphragis_models
- Modelo base OLMo-1B: https://huggingface.co/allenai/OLMo-1B
- Paper de OLMo: https://arxiv.org/html/2402.00838v1
- Perfil de Urdatorn en GitHub: https://github.com/Urdatorn/Urdatorn
