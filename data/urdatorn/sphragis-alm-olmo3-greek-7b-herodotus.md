# Urdatorn/sphragis-alm-olmo3-greek-7b-herodotus

## Resumen

El modelo `Urdatorn/sphragis-alm-olmo3-greek-7b-herodotus` es uno de los diecisiete modelos de lenguaje autorial (ALM) desarrollados por Urdatorn (Albin Thörn Cleland) para el benchmark Sphragis de atribución de autoría en griego antiguo. Cada ALM se obtiene mediante un further-pretraining del modelo base `Urdatorn/olmo3-7b-ancient-greek` (a su vez una adaptación de OLMo 3 7B al griego antiguo) sobre las frases de entrenamiento de un único autor clásico. Este modelo concreto se entrena exclusivamente con las sentencias de Heródoto, con el objetivo de medir la perplejidad de un texto y atribuirlo al autor cuyo modelo lo encuentra menos sorprendente.

La arquitectura subyacente es la de OLMo 3 7B, un transformer decoder-only de 7.298 millones de parámetros, liberado por el Allen Institute for AI (Ai2) con un enfoque de apertura total (pesos, datos y código). El modelo se publica con licencia `other` debido a las licencias mixtas de las fuentes textuales del dataset Sphragis, que incluyen material CC BY-NC-SA. Su relevancia radica en ser una herramienta especializada para la investigación filológica y estilométrica, permitiendo atribuciones de autoría cuantitativas sobre textos griegos antiguos con una precisión reportada de 0.800 macro-F1 en la validación del benchmark.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo 3 7B) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (pesos originales); no se han publicado otras cuantizaciones |
| Idiomas soportados | Griego antiguo (grc) |
| Licencia | other (derivada de Apache-2.0 + restricciones CC BY-NC-SA) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de `Urdatorn/olmo3-7b-ancient-greek`, que es una adaptación de OLMo 3 7B al griego antiguo. OLMo 3 es una familia de modelos de lenguaje completamente abiertos de Ai2, diseñados para razonamiento de contexto largo, function calling, codificación y conocimiento general. Sobre esta base, el autor realiza un further-pretraining con un objetivo de modelado de lenguaje causal, presentando cada secuencia como `<|endoftext|> sentence <|endoftext|>` (una frase por secuencia). El entrenamiento se realiza sobre 5.900 frases de Heródoto (624.910 tokens puntuados) de la división `sentence_1` del dataset Sphragis.

La selección del mejor checkpoint se hace por la menor pérdida en las frases de validación del mismo autor, con early stopping (patience 3) sobre un máximo de 20 épocas. En este caso, la mejor época fue la 1.0, con una pérdida de validación de 0.9247 nats/token. Se usó una tasa de aprendizaje constante de 1e-05 tras 25 pasos de warmup, un batch efectivo de 16 frases, precisión fp32 para los pesos maestros y bf16 para el cómputo, con FSDP full shard sobre 2 GPU GH200. Los pesos finales se guardan en bf16. A diferencia del enfoque original de Huang et al. (2025) que fijaba 100 épocas, aquí la duración se decide por evidencia en datos de validación.

## Capacidades

- Atribución de autoría: dado un texto en griego antiguo, el modelo calcula la perplejidad por token y lo compara con los otros 16 ALMs del conjunto Sphragis; el autor asignado es el del modelo con menor sorpresa.
- Modelado de lenguaje causal en griego antiguo: es capaz de predecir la siguiente palabra en textos de Heródoto y, por extensión, en textos de estilo similar.
- Especialización estilística: al entrenarse solo con las sentencias de un autor, captura patrones léxicos, sintácticos y de frecuencia propios de Heródoto.
- Integración en pipelines de evaluación: el código de entrenamiento, scoring y atribución está disponible en GitHub, permitiendo reproducir y extender el benchmark.
- No soporta tool calling, agentes, visión ni modos de razonamiento explícitos; es un modelo puramente generativo de texto.

## Casos de uso

- Investigación filológica: los estudiosos pueden usar el modelo para verificar la autoría de fragmentos dudosos atribuidos a Heródoto, comparando la perplejidad con la de otros autores del corpus Sphragis.
- Análisis estilométrico cuantitativo: el modelo permite medir la distancia estilística entre textos antiguos mediante la diferencia de log-verosimilitud, complementando métodos tradicionales basados en frecuencias de palabras.
- Docencia universitaria: en cursos de filología clásica o humanidades digitales, puede emplearse como ejemplo práctico de aplicación de modelos de lenguaje a problemas de autoría.
- Desarrollo de herramientas de crítica textual: integrado en entornos de edición digital, ayuda a detectar interpolaciones o pasajes de autoría dudosa en manuscritos.
- Evaluación de modelos de lenguaje para lenguas antiguas: sirve como punto de referencia para medir la capacidad de adaptación de modelos multilingües al griego antiguo.
- Reproducción de experimentos de atribución: el código abierto permite a otros investigadores replicar el pipeline completo y extenderlo a nuevos autores o corpus.

## Benchmarks y rendimiento

En la información disponible se reporta el rendimiento del conjunto de los 17 ALMs sobre la división `sentence_1` de validación de Sphragis:

| Modelo | Macro-F1 (validación) |
|---|---|
| 17 ALMs con base adaptada al griego antiguo (este modelo incluido) | 0.800 |
| 17 ALMs con base sin adaptar (OLMo 3 7B original) | 0.812 |

No se han publicado resultados individuales para este modelo concreto en otros benchmarks estándar (MMLU, HumanEval, etc.), ya que su propósito no es el rendimiento generalista sino la discriminación autorial.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16 (14.6 GB), se necesitan al menos 16 GB de VRAM para cargar el modelo completo; con cuantización a 8 bits o 4 bits (no publicada oficialmente, pero posible mediante herramientas como llama.cpp) se podría reducir a 8-10 GB.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) o A100 (40/80 GB) es suficiente para inferencia en bf16. Para entrenamiento se usaron 2x GH200.
- Compatibilidad con GPU de consumo: sí, cabe en una RTX 3090/4090 con 24 GB en bf16, o en GPUs de 16 GB con cuantización.
- Opciones de despliegue: al ser un modelo safetensors estándar, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama (tras conversión). No se proporcionan archivos GGUF oficiales.
- Latencia y throughput: no se han publicado mediciones específicas; para un modelo de 7B en bf16 en una GPU moderna, se espera una latencia de decodificación del orden de 20-50 ms/token y un throughput de 100-300 tokens/s con batching, aunque estos valores son estimaciones orientativas.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de atribución de autoría para griego antiguo con los que comparar directamente. La comparación más relevante es con el modelo base sin adaptar:

| Modelo | Parámetros | Contexto | Licencia | Uso previsto |
|---|---|---|---|---|
| Urdatorn/sphragis-alm-olmo3-greek-7b-herodotus | 7.3B | No disponible | other | Atribución de autoría en griego antiguo |
| Urdatorn/olmo3-7b-ancient-greek | 7.3B | No disponible | Apache-2.0 | Modelo base adaptado al griego antiguo |
| OLMo 3 7B (original) | 7.3B | No disponible | Apache-2.0 | Modelo generalista multilingüe |

La diferencia clave es el entrenamiento adicional sobre un único autor, que convierte al modelo en un discriminador estilístico, aunque el conjunto de 17 ALMs con base adaptada muestra una macro-F1 ligeramente inferior (0.800 vs 0.812) a la versión sin adaptar, lo que sugiere que la adaptación al griego antiguo mejora la modelización del lenguaje pero no necesariamente la discriminación autorial.

## Limitaciones y advertencias

- Licencia restrictiva: el modelo se publica como `other` debido a que el texto de entrenamiento de Sphragis incluye material con licencia CC BY-NC-SA. Esto impide su uso comercial sin una revisión cuidadosa de las licencias de las fuentes originales (ver `LICENSES.md` del dataset).
- Especialización extrema: el modelo solo es útil para textos en griego antiguo y, más concretamente, para el estilo de Heródoto. Su rendimiento en otros dominios o idiomas es nulo.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar texto plausible pero incorrecto si se usa fuera de su contexto de atribución.
- Sesgos del corpus: el entrenamiento se limita a las frases de un único autor, por lo que las predicciones reflejan únicamente el estilo de Heródoto y no la variabilidad del griego antiguo en general.
- Sin soporte para tareas interactivas: no dispone de function calling ni capacidades de agente; su uso se limita a la evaluación de perplejidad y generación de texto.
- Datos de contexto no especificados: no se ha documentado la longitud máxima de contexto soportada, lo que puede afectar a la evaluación de textos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Urdatorn/sphragis-alm-olmo3-greek-7b-herodotus
- Dataset Sphragis: https://huggingface.co/datasets/Urdatorn/sphragis
- Modelo base adaptado al griego antiguo: https://huggingface.co/Urdatorn/olmo3-7b-ancient-greek
- Código de entrenamiento y scoring: https://github.com/Urdatorn/sphragis_models
- Paper de OLMo 3: https://arxiv.org/abs/2512.13961
- Paper de atribución de autoría (Huang, Murakami, Grieve, 2025): https://arxiv.org/pdf/2402.00838
- Perfil del autor en Hugging Face: https://huggingface.co/Urdatorn/models
