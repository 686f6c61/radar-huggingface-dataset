# Urdatorn/sphragis-alm-olmo1b-sentence-dionysius-of-halicarnassus

## Resumen

El modelo `Urdatorn/sphragis-alm-olmo1b-sentence-dionysius-of-halicarnassus` es un modelo de lenguaje autorial (ALM, por sus siglas en inglés) desarrollado por Urdatorn como parte del benchmark Sphragis de atribución de autoría en griego antiguo. Se trata de un ajuste fino completo (further-pretraining) del modelo base `allenai/OLMo-1B-hf` de AI2, especializado exclusivamente en la producción textual de Dionisio de Halicarnaso, historiador y retórico griego del siglo I a. C. El modelo sigue la metodología propuesta por Huang, Murakami y Grieve (2025) en su artículo "Attributing authorship via the perplexity of authorial language models", publicada en PLoS ONE.

El objetivo de este modelo no es la generación de texto general, sino servir como componente de un sistema de atribución de autoría: dado un texto en griego antiguo, se calcula la perplejidad (log-verosimilitud negativa por token) que produce cada uno de los 28 modelos autoriales del conjunto, y se atribuye el texto al autor cuyo modelo lo encuentra menos sorprendente. Este modelo concreto se entrenó sobre 850 frases (99 011 tokens puntuados) de la división `sentence_1` del corpus Sphragis, con 2 épocas y una selección de hiperparámetros basada en la mejora de la atribución de validación. Con 1 176 764 416 parámetros, es un modelo compacto que puede ejecutarse en hardware de consumo, lo que lo hace accesible para investigación filológica y estudios de estilometría.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en `allenai/OLMo-1B-hf`) |
| Parametros totales | 1 176 764 416 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada del modelo base OLMo-1B) |
| Tipos de cuantizacion | bf16 (pesos originales); no se documentan cuantizaciones adicionales |
| Idiomas soportados | Griego antiguo (grc) |
| Licencia | other (derivado de texto con licencias mixtas, incluye CC BY-NC-SA) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-1B-hf`, un transformer decoder-only de 1 170 millones de parámetros desarrollado por el Allen Institute for AI (AI2) como parte de la familia OLMo, diseñada para investigación científica con pesos y código abiertos. Sobre esta base se realizó un further-pretraining completo (no un simple fine-tuning) utilizando únicamente las filas de entrenamiento atribuidas a Dionisio de Halicarnaso en el benchmark Sphragis. El objetivo de entrenamiento fue modelado de lenguaje causal sobre secuencias del formato `<|endoftext|> sentence <|endoftext|>`, con una frase por secuencia.

El entrenamiento se realizó con 2 épocas, una tasa de aprendizaje constante de 5e-05 tras 25 pasos de calentamiento, y un tamaño de lote efectivo de 16 frases. La precisión usó pesos maestros en fp32, cómputo en bf16 y paralelismo FSDP con sharding completo sobre 2 GPU GH200. A diferencia del enfoque original de Huang y colaboradores, que fijaban 100 épocas, aquí la duración del entrenamiento se eligió mediante ascenso de coordenadas sobre la atribución de validación, optimizando directamente la macro-F1 de atribución del conjunto completo de 28 modelos en lugar de la perplejidad individual del autor. Los pesos finales se guardaron en bf16.

## Capacidades

- Atribución de autoría en griego antiguo: el modelo está diseñado para puntuar la perplejidad de frases y compararla con otros 27 modelos autoriales del conjunto Sphragis.
- Modelado de lenguaje causal especializado en el estilo de Dionisio de Halicarnaso, incluyendo rasgos léxicos, sintácticos y retóricos propios de su prosa ática.
- Generación de texto en griego antiguo con sesgo estilístico hacia el autor, aunque esta no es su función principal.
- Evaluación de similitud estilística: puede usarse para medir la distancia entre un texto anónimo y el corpus del autor.
- Integración en pipelines de atribución de autoría: el código de entrenamiento y puntuación está disponible en el repositorio `Urdatorn/sphragis_models`.
- Capacidad multilingüe limitada: solo griego antiguo, sin soporte para otros idiomas.

## Casos de uso

- Investigación filológica en autenticidad de textos: los estudiosos pueden usar el modelo para determinar si un fragmento atribuido a Dionisio de Halicarnaso es consistente con su estilo, comparando la perplejidad del fragmento contra la de otros autores del corpus Sphragis.
- Análisis estilométrico de prosa ática: el modelo permite cuantificar la distancia estilística entre Dionisio y otros autores contemporáneos (p. ej., Polibio, Plutarco) mediante la log-verosimilitud negativa por token.
- Construcción de sistemas de atribución de autoría para textos fragmentarios: dado que el modelo se entrena con frases individuales, puede aplicarse a textos muy fragmentarios donde solo se conservan oraciones sueltas.
- Docencia en estilometría computacional: el modelo y su código asociado sirven como ejemplo reproducible de la metodología de Huang et al. (2025) aplicada a una lengua clásica.
- Generación de texto de práctica para estudiantes de griego antiguo: aunque no es su propósito principal, puede generar frases que imiten el estilo de Dionisio, útiles para ejercicios de traducción o análisis sintáctico.
- Evaluación de modelos de lenguaje para lenguas de bajos recursos: el modelo demuestra que un ajuste fino sobre un corpus pequeño (850 frases) puede capturar rasgos autoriales distintivos, sirviendo de referencia para otros proyectos de adaptación a lenguas clásicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks individuales para este modelo en la información disponible. Sin embargo, el conjunto completo de 28 modelos autoriales del benchmark Sphragis alcanza los siguientes resultados de atribución de autoría (macro-F1 en test):

| Tarea | Macro-F1 |
|---|---|
| sentence_1 (una frase) | 62.36 |
| sentence_5 (cinco frases) | 86.84 |
| sentence_10 (diez frases) | 89.53 |
| sentence_50 (cincuenta frases) | 92.44 |

Estos resultados corresponden al sistema completo de 28 modelos, no a este modelo de forma aislada. No se dispone de métricas estándar como MMLU, HumanEval o GSM8K, ya que el modelo no está orientado a tareas generales de razonamiento o código.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 1 176 764 416 parámetros y los pesos se almacenan en bf16 (2 bytes por parámetro), lo que supone aproximadamente 2.35 GB de memoria solo para los pesos. El tamaño del repositorio es de 2.4 GB, coherente con esta estimación. Con overhead de activaciones y contexto, se recomienda al menos 4 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM, como NVIDIA RTX 3050, RTX 3060, RTX 4060, o equivalentes de AMD con soporte ROCm. También puede ejecutarse en CPU con llama.cpp u Ollama, aunque con mayor latencia.
- Opciones de despliegue: al ser un modelo basado en OLMo-1B, es compatible con frameworks estándar como vLLM, Hugging Face Transformers, llama.cpp y Ollama (si se convierte a GGUF). El repositorio incluye pesos en safetensors listos para usar con Transformers.
- Latencia y throughput: no se han publicado mediciones oficiales. Para un modelo de ~1.2B parámetros en bf16, se espera una latencia de decodificación de decenas de milisegundos por token en una GPU moderna (p. ej., RTX 4090), y un throughput de cientos de tokens por segundo en configuraciones con batching.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| `Urdatorn/sphragis-alm-olmo1b-sentence-dionysius-of-halicarnassus` (este) | 1.18B | No disponible | other | ALM para Dionisio de Halicarnaso (griego antiguo) |
| `Urdatorn/sphragis-alm-olmo3-7b-dionysius-of-halicarnassus` | 7B (OLMo-3-1025-7B) | No disponible | other | ALM para el mismo autor, con modelo base más grande |
| `allenai/OLMo-1B-hf` (modelo base) | 1.17B | 2048 (según documentación de OLMo) | Apache-2.0 | Modelo de lenguaje general en inglés |

La comparativa directa con otros ALMs del mismo benchmark no está disponible públicamente en la información proporcionada. El modelo base OLMo-1B es un modelo generalista en inglés, mientras que este ALM está especializado en griego antiguo y en un único autor, por lo que no son intercambiables. La versión con OLMo-3-7B del mismo autor ofrece mayor capacidad pero también mayores requisitos de hardware.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo es útil para textos de Dionisio de Halicarnaso o para comparaciones estilométricas dentro del corpus Sphragis. No sirve como modelo de lenguaje general ni para otros autores.
- Licencia restrictiva: aunque el modelo base es Apache-2.0, el texto de entrenamiento proviene de fuentes con licencias mixtas, incluyendo material CC BY-NC-SA. Esto impide el uso comercial del modelo derivado sin verificación adicional de las licencias de los textos fuente. El autor lo libera como `other`, por lo que se debe consultar el archivo `LICENSES.md` del dataset antes de cualquier reutilización.
- Riesgo de alucinación: al ser un modelo pequeño entrenado sobre un corpus limitado (99 011 tokens), puede generar texto gramaticalmente plausible pero históricamente inexacto o inventar citas o referencias.
- Sesgo de corpus: el modelo refleja únicamente el estilo de las obras atribuidas a Dionisio en el corpus Sphragis, que puede no representar la totalidad de su producción ni las variaciones diacrónicas de su estilo.
- Sin soporte para otros idiomas: el modelo solo procesa griego antiguo; no es multilingüe.
- Dependencia del preprocesado: la puntuación debe realizarse exactamente como en el entrenamiento (una frase por secuencia con delimitadores `<|endoftext|>`), lo que requiere un pipeline específico.
- Sin garantías de producción: el modelo es un artefacto de investigación, sin mantenimiento activo ni soporte técnico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Urdatorn/sphragis-alm-olmo1b-sentence-dionysius-of-halicarnassus
- Dataset Sphragis: https://huggingface.co/datasets/Urdatorn/sphragis
- Código de entrenamiento y puntuación: https://github.com/Urdatorn/sphragis_models
- Leaderboard del benchmark Sphragis: https://urdatorn-sphragis-leaderboard.static.hf.space/index.html
- Modelo base OLMo-1B: https://huggingface.co/allenai/OLMo-1B-hf
- Repositorio OLMo de AI2: https://github.com/allenai/OLMo
- Artículo de referencia (Huang, Murakami y Grieve, 2025): PLoS ONE 20(7): e0327081 (DOI no disponible en la información proporcionada)
