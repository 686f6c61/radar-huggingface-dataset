# Urdatorn/sphragis-alm-olmo3-greek-7b-homeric-iliad

## Resumen

El modelo `Urdatorn/sphragis-alm-olmo3-greek-7b-homeric-iliad` es uno de los diecisiete modelos de lenguaje autoriales (ALM, por sus siglas en inglés) desarrollados por Urdatorn (Albin Thörn Cleland) para el benchmark Sphragis de atribución de autoría en griego antiguo. Cada ALM se obtiene mediante un further pre-training del modelo base `Urdatorn/olmo3-7b-ancient-greek` sobre las frases de entrenamiento de un único autor; en este caso, el corpus corresponde a la Ilíada de Homero, con 6.200 frases y 592.967 tokens puntuados. El objetivo es atribuir una frase desconocida a su autor comparando la perplejidad (negative log-likelihood por token) que produce cada uno de los diecisiete modelos, asignándola al que la encuentre menos sorprendente.

El modelo sigue la metodología de Huang, Murakami y Grieve (2025), publicada en PLoS ONE, pero introduce una mejora: en lugar de fijar un número de épocas, se selecciona la época con menor pérdida en las frases de validación del propio autor, con early stopping. El resultado es un modelo especializado en el estilo homérico de la Ilíada, útil para tareas de estilometría, autenticación de textos y análisis filológico. Su relevancia radica en que combina una arquitectura moderna (OLMo 3 de 7B parámetros) con una adaptación lingüística al griego antiguo, un dominio con escasos recursos de IA.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basada en OLMo 3 7B) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada de OLMo 3, no especificada en la ficha) |
| Tipos de cuantizacion | No disponible (pesos en bf16) |
| Idiomas soportados | grc (griego antiguo) |
| Licencia | other (con restricciones, ver limitaciones) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de `Urdatorn/olmo3-7b-ancient-greek`, una adaptación al griego antiguo del modelo OLMo 3 de 7B parámetros de AI2. OLMo 3 es una familia de modelos de lenguaje abiertos entrenados sobre el corpus Dolma 3, con énfasis en razonamiento de contexto largo, function calling y código. Sobre esta base, se realiza un further pre-training con un objetivo de modelado causal de lenguaje, donde cada secuencia de entrenamiento es una frase del corpus Sphragis de la Ilíada, delimitada por tokens `<|endoftext|>`. El entrenamiento se realiza con precisión mixta (fp32 para pesos maestros, bf16 para cómputo) y FSDP con sharding completo en dos GPU GH200. La selección del mejor checkpoint se hace por la menor pérdida en las frases de validación del mismo autor, con un máximo de 20 épocas y paciencia 3; en este caso, la mejor época fue la 2.0, con una pérdida de validación de 0,9891 nats/token. El learning rate es constante de 1e-05 tras 25 pasos de warmup, con un batch efectivo de 16 frases.

## Capacidades

- Modelado de lenguaje causal en griego antiguo, especializado en el estilo de la Ilíada de Homero.
- Atribución de autoría: dado un texto, calcula la perplejidad por token y permite comparar contra otros dieciséis modelos autoriales del conjunto Sphragis.
- Detección de estilo homérico: útil para identificar pasajes que se desvían del estilo iliádico.
- Generación de texto en griego antiguo con sesgo estilístico hacia Homero (aunque no es su propósito principal).
- No soporta tool calling, ni visión, ni audio; es un modelo puramente textual de una sola lengua.
- Capacidad de evaluar frases individuales, ya que el entrenamiento se realizó con una frase por secuencia.

## Casos de uso

- Atribución de autoría en textos griegos antiguos: dado un fragmento de autoría dudosa, se puntúa con los diecisiete ALMs de Sphragis y se asigna al autor cuyo modelo produzca menor perplejidad. Es adecuado porque cada modelo está entrenado exclusivamente con el estilo de un autor.
- Análisis estilométrico de la épica homérica: permite cuantificar la distancia estilística entre la Ilíada y otros textos épicos, como la Odisea o los himnos homéricos, usando la perplejidad como métrica.
- Autenticación de fragmentos atribuidos a Homero: en estudios filológicos, se puede verificar si un pasaje recién descubierto es consistente con el estilo iliádico comparando su perplejidad con la de este modelo.
- Investigación en lingüística computacional del griego antiguo: sirve como modelo de referencia para estudiar la variación estilística entre autores clásicos, dado que el conjunto Sphragis incluye diecisiete autores.
- Entrenamiento de sistemas de detección de plagio o interpolación en textos clásicos: al detectar frases anómalas dentro de un corpus homérico, se pueden identificar posibles interpolaciones de otros autores.
- Evaluación de modelos de lenguaje para lenguas de bajos recursos: este modelo demuestra cómo adaptar un modelo multilingüe a un dominio lingüístico específico con pocos datos, sirviendo de caso de estudio para otras lenguas antiguas.

## Benchmarks y rendimiento

En la información disponible se reporta el rendimiento del conjunto completo de diecisiete modelos sobre el split de validación `sentence_1` del benchmark Sphragis:

| Metrica | Valor |
|---|---|
| Macro-F1 (17 modelos, con adaptación griega) | 0,800 |
| Macro-F1 (17 modelos, sin adaptación griega, base OLMo 3) | 0,812 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) para este modelo específico, ya que su propósito no es el razonamiento general sino la atribución de autoría.

## Requisitos de hardware

- El entrenamiento se realizó con 2 GPU NVIDIA GH200 con FSDP full shard, pero no se especifican requisitos de inferencia.
- Para inferencia, al tratarse de un modelo de 7.298 millones de parámetros en bf16, se estima que requiere al menos 16 GB de VRAM (por ejemplo, una RTX 4090 o A100 40GB), aunque no se ha verificado oficialmente.
- No se dispone de cuantizaciones GGUF o de menor precisión publicadas, por lo que el despliegue en CPU o GPUs de baja memoria no está documentado.
- Opciones de despliegue: al ser un modelo safetensors estándar, puede cargarse con bibliotecas como Hugging Face Transformers, vLLM o TGI, siempre que se respete la licencia.
- No se han publicado datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de atribución de autoría en griego antiguo comparables en la documentación proporcionada. Como referencia, se puede comparar con el modelo base `Urdatorn/olmo3-7b-ancient-greek`, del cual deriva:

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| Urdatorn/sphragis-alm-olmo3-greek-7b-homeric-iliad | 7,3B | No disponible | other | Atribución de autoría (estilo iliádico) |
| Urdatorn/olmo3-7b-ancient-greek | 7,3B | No disponible | Apache-2.0 | Modelo base de lengua griega antigua |

La comparativa con otros ALMs del mismo conjunto Sphragis (p. ej., los modelos para Hesíodo, Tucídides, etc.) no está disponible en la información recopilada.

## Limitaciones y advertencias

- Licencia restrictiva: el modelo se publica bajo licencia `other` porque el texto de entrenamiento proviene de Sphragis, cuyas fuentes incluyen material con licencia CC BY-NC-SA. Esto impide el uso comercial sin verificación adicional de los términos de cada fuente.
- Especialización extrema: el modelo está entrenado únicamente con el estilo de la Ilíada; su uso para otros autores o géneros del griego antiguo producirá resultados poco fiables.
- Riesgo de sobreajuste: al entrenarse con solo 6.200 frases, el modelo puede memorizar patrones específicos del corpus y no generalizar bien a textos homéricos no vistos.
- Sin capacidades multilingües: solo soporta griego antiguo; no puede utilizarse para otros idiomas.
- Sin soporte para tareas modernas: no dispone de function calling, razonamiento multi-paso ni generación de código.
- Alucinación: como todo modelo de lenguaje causal, puede generar texto plausible pero incorrecto en griego antiguo si se usa para generación libre.
- Fecha de creación futura (2026-08-26) y cero descargas: se trata de un modelo muy reciente y sin adopción verificada, por lo que su robustez en producción no está contrastada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Urdatorn/sphragis-alm-olmo3-greek-7b-homeric-iliad
- Dataset Sphragis: https://huggingface.co/datasets/Urdatorn/sphragis
- Repositorio de código (entrenamiento, scoring y atribución): https://github.com/Urdatorn/sphragis_models
- Perfil del autor en Hugging Face: https://huggingface.co/Urdatorn
- Paper de referencia (Huang, Murakami y Grieve, 2025): https://doi.org/10.1371/journal.pone.0327081
- Paper de OLMo 3 (arXiv): https://arxiv.org/abs/2512.13961
- Página de OLMo en AI2: https://allenai.org/olmo
- Repositorio OLMo en GitHub: https://github.com/allenai/OLMo
