# Urdatorn/sphragis-alm-olmo1b-sentence-josephus

## Resumen

El modelo `Urdatorn/sphragis-alm-olmo1b-sentence-josephus` es un modelo de lenguaje autorial (ALM, por sus siglas en inglés) desarrollado por Urdatorn como parte del benchmark Sphragis de atribución de autoría en griego antiguo. Sigue la metodología propuesta por Huang, Murakami y Grieve (2025) en su artículo "Attributing authorship via the perplexity of authorial language models", publicada en PLoS ONE. Cada ALM es un ajuste fino completo (further-pretraining) del modelo base `allenai/OLMo-1B-hf` sobre las filas de entrenamiento de un único autor; en este caso, el historiador Flavio Josefo (Josephus). El objetivo no es generar texto, sino calcular la perplejidad de una frase dada y compararla con la de otros 27 modelos, atribuyendo la autoría al modelo que encuentre la frase menos sorprendente.

El modelo tiene 1.176.764.416 parámetros (aproximadamente 1,18 mil millones) y se entrenó sobre 800 filas y 79.976 tokens puntuados de la división `sentence_1` del corpus Sphragis. La elección del modelo base (vanilla o adaptado al griego) y el número de épocas se realizó mediante ascenso de coordenadas sobre la atribución de validación, un enfoque que prioriza la capacidad discriminativa entre autores en lugar de la mera perplejidad individual. El conjunto completo de 28 modelos alcanza una macro-F1 de 62,36 en frases de una oración, 86,84 en cinco, 89,53 en diez y 92,44 en cincuenta, lo que demuestra la utilidad del enfoque para textos más largos.

La relevancia de este modelo radica en su aplicación a la filología clásica y la estilometría, donde la atribución de autoría de textos fragmentarios o anónimos es un problema abierto. Al ser un modelo pequeño y especializado, puede ejecutarse en hardware modesto, aunque su licencia restrictiva (derivada de fuentes CC BY-NC-SA) limita su uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo-1B-hf) |
| Parametros totales | 1.176.764.416 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada en la documentacion proporcionada |
| Tipos de cuantizacion | No se mencionan cuantizaciones; pesos en bf16 |
| Idiomas soportados | Griego antiguo (grc) |
| Licencia | other (derivada de fuentes con licencias mixtas, incluyendo CC BY-NC-SA) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-1B-hf` (revisión `aee7752d9c08ee4775e9b0091426d8410e8f6a89`), un transformer decoder-only de 1,18 mil millones de parámetros desarrollado por el Allen Institute for AI. Sobre esta base se realizó un further-pretraining completo, es decir, se continuó el entrenamiento del modelo con un objetivo de modelado de lenguaje causal sobre secuencias formateadas como `<|endoftext|> sentence <|endoftext|>`, donde cada secuencia contiene una única frase del autor Josefo. El entrenamiento se llevó a cabo durante 3 épocas con una tasa de aprendizaje constante de 5e-05 tras 25 pasos de calentamiento, un tamaño de lote efectivo de 16 frases y precisión mixta (pesos maestros en fp32, cómputo en bf16) usando FSDP con sharding completo en 2 GPU GH200. Los pesos finales se guardaron en bf16.

Una innovación metodológica destacable es que la duración del entrenamiento no se fijó a priori (como los 100 épocas del artículo original), sino que se seleccionó mediante validación sobre la atribución de autoría, optimizando la macro-F1 del conjunto de 28 modelos. Esto implica que el modelo no solo debe ajustarse bien al estilo de su autor, sino que debe diferenciarse de los demás modelos del benchmark. El código de entrenamiento, puntuación y atribución está disponible en el repositorio GitHub `Urdatorn/sphragis_models`.

## Capacidades

- Atribución de autoría: dado un texto en griego antiguo, el modelo calcula la log-verosimilitud negativa por token y la compara con la de otros 27 modelos del benchmark; la autoría se asigna al modelo con menor perplejidad.
- Modelado de lenguaje causal: puede generar texto en griego antiguo, aunque su entrenamiento está orientado a la puntuación de frases y no a la generación libre.
- Especialización en un único autor: está optimizado para reconocer el estilo de Flavio Josefo, no para tareas generales de NLP.
- No dispone de capacidades de tool calling, visión, audio ni razonamiento multi-paso; su función es exclusivamente estilométrica.

## Casos de uso

- Atribución de autoría de textos fragmentarios: el modelo puede evaluar la probabilidad de que un fragmento anónimo pertenezca a Josefo comparando su perplejidad con la de otros ALMs del benchmark, lo que resulta útil en estudios filológicos sobre obras dudosas o atribuidas.
- Análisis estilométrico comparativo: investigadores pueden usar el modelo para medir la distancia estilística entre diferentes autores griegos antiguos, cuantificando qué tan "josefino" es un texto dado.
- Verificación de autenticidad de manuscritos: en proyectos de digitalización de papiros o códices, el modelo puede ayudar a detectar interpolaciones o secciones de autoría diferente dentro de un mismo documento.
- Entrenamiento y evaluación de benchmarks de atribución: el modelo sirve como componente de referencia para validar nuevas técnicas de atribución de autoría en lenguas antiguas, dado que forma parte de un conjunto estandarizado.
- Investigación en humanidades digitales: integrable en pipelines de análisis de corpus griegos para clasificar automáticamente textos por autor, facilitando estudios de estilo y cronología.
- Docencia en filología clásica: como herramienta didáctica para demostrar la aplicación de métodos computacionales a la crítica textual, permitiendo a estudiantes experimentar con la atribución de autoría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks individuales para este modelo en la información disponible. La model card reporta el rendimiento del conjunto completo de 28 modelos del benchmark Sphragis, que es el contexto en el que se evalúa este ALM:

| Métrica | sentence_1 | sentence_5 | sentence_10 | sentence_50 |
|---|---|---|---|---|
| Test macro-F1 (conjunto de 28 modelos) | 62,36 | 86,84 | 89,53 | 92,44 |

Estos valores indican que la atribución mejora sustancialmente con la longitud del texto evaluado, pasando de un 62 % en frases aisladas a más del 92 % en pasajes de 50 oraciones. No se dispone de comparaciones con otros modelos individuales fuera del benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16, el modelo ocupa aproximadamente 2,35 GB (1,18B × 2 bytes). Con overhead de activaciones y KV cache, se recomiendan al menos 4 GB de VRAM para inferencia en secuencias cortas.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM, como NVIDIA GTX 1650 Super, RTX 2060, RTX 3060, o superiores. También puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Entrenamiento: la model card indica que se usaron 2 GPU NVIDIA GH200 con FSDP full shard; para reproducir el entrenamiento se necesitaría hardware similar o equivalente en memoria.
- Opciones de despliegue: al ser un modelo basado en OLMo, es compatible con vLLM, llama.cpp, Ollama y TGI, siempre que se conviertan los pesos al formato adecuado (GGUF para llama.cpp, por ejemplo). No se proporcionan archivos GGUF en el repositorio.
- Latencia y throughput: no se han publicado mediciones oficiales. En una GPU moderna (p. ej., RTX 4090), se espera una latencia de decodificación de decenas de milisegundos por token, suficiente para tareas de puntuación por lotes.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables fuera del propio benchmark Sphragis. Dentro del benchmark, existen otros 27 ALMs entrenados sobre los mismos datos y con la misma metodología, pero para autores diferentes. No se han publicado comparaciones con otros modelos de atribución de autoría en griego antiguo, como los basados en BERT o en modelos más grandes. Por tanto, la comparativa directa no está disponible.

## Limitaciones y advertencias

- Licencia restrictiva: el modelo se distribuye bajo licencia `other` debido a que el texto de entrenamiento proviene de fuentes con licencias mixtas, incluyendo material CC BY-NC-SA. Esto impide su uso comercial sin una revisión legal exhaustiva de las fuentes originales.
- Especialización extrema: el modelo solo es útil para atribuir textos al autor Josefo; no es un modelo de lenguaje general y su rendimiento en otras tareas será deficiente.
- Tamaño reducido: con 1,18B parámetros, el modelo puede presentar alucinaciones o errores en la generación de texto, aunque su propósito principal (puntuación de perplejidad) es menos sensible a este problema.
- Sesgos y representatividad: el corpus de entrenamiento se limita a un único autor y a un período histórico concreto; no se han documentado análisis de sesgos, pero es probable que el modelo refleje particularidades del dialecto y estilo de Josefo, no del griego antiguo en general.
- Contexto limitado: la longitud de contexto no se especifica, pero al derivar de OLMo-1B-hf, probablemente sea de 2048 tokens; para textos más largos se requiere segmentación.
- Sin soporte para cuantizaciones oficiales: no se ofrecen versiones GGUF o AWQ, por lo que el despliegue en entornos con restricciones de memoria requiere conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Urdatorn/sphragis-alm-olmo1b-sentence-josephus
- Dataset Sphragis: https://huggingface.co/datasets/Urdatorn/sphragis
- Código de entrenamiento y atribución: https://github.com/Urdatorn/sphragis_models
- Artículo de referencia: Huang, Murakami y Grieve (2025), "Attributing authorship via the perplexity of authorial language models", PLoS ONE 20(7): e0327081. DOI: 10.1371/journal.pone.0327081
- Modelo base OLMo-1B-hf: https://huggingface.co/allenai/OLMo-1B-hf
