# Urdatorn/sphragis-alm-olmo1b-sentence-plutarch

## Resumen

El modelo `Urdatorn/sphragis-alm-olmo1b-sentence-plutarch` es un modelo de lenguaje autorial (ALM, por sus siglas en inglés) desarrollado por Urdatorn como parte del benchmark Sphragis de atribución de autoría en griego antiguo. Forma parte de un conjunto de 28 modelos, cada uno entrenado específicamente sobre las frases de un autor clásico; este en particular se centra en Plutarco. El objetivo es medir la perplejidad por token de un texto dado y compararla entre los 28 modelos para atribuir su autoría, siguiendo la metodología de Huang, Murakami y Grieve (2025) publicada en PLoS ONE.

El modelo parte de `allenai/OLMo-1B-hf`, un transformer decoder-only de 1.176.764.416 parámetros (~1,17 mil millones), y se somete a un further-pretraining completo sobre 1.300 filas de entrenamiento (138.045 tokens puntuados) de la división `sentence_1` del corpus Sphragis. La elección del modelo base y del número de épocas se realizó mediante ascenso por coordenadas sobre la atribución de validación, lo que lo diferencia del enfoque original de 100 épocas fijas. Su relevancia radica en ofrecer una herramienta reproducible y abierta para la investigación en estilometría y autenticación de textos clásicos, un campo donde la escasez de recursos digitales es notable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-1B) |
| Parametros totales | 1.176.764.416 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (pesos originales) |
| Idiomas soportados | Griego antiguo (grc) |
| Licencia | Other (derivada de fuentes con licencias mixtas, incluye CC BY-NC-SA) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura original de OLMo-1B, un transformer decoder-only con atención causal y normalización previa, sin mecanismos de mezcla de expertos ni capas recurrentes. El entrenamiento consiste en un further-pretraining completo sobre un corpus de frases de Plutarco, con el objetivo de modelar la secuencia `<|endoftext|> sentence <|endoftext|>`, es decir, una frase por secuencia. Se utilizó una única época, con una tasa de aprendizaje constante de 5e-05 tras 25 pasos de calentamiento, un tamaño de lote efectivo de 16 frases y precisión mixta (pesos maestros en fp32, cómputo en bf16) mediante FSDP completo sobre dos GPU GH200. Los pesos finales se guardaron en bf16.

La innovación principal frente al trabajo de Huang y colaboradores es que la duración del entrenamiento no se fija a priori, sino que se selecciona mediante evidencia retenida, optimizando directamente la macro-F1 de atribución sobre el conjunto de validación de los 28 modelos. Esto responde a que la atribución no requiere que un modelo se ajuste perfectamente a su autor, sino que lo distinga mejor que los demás.

## Capacidades

- Atribución de autoría: dado un texto en griego antiguo, el modelo calcula la perplejidad por token y la compara con la de los otros 27 modelos del conjunto Sphragis para asignar la autoría más probable.
- Modelado de lenguaje causal especializado en el estilo de Plutarco, con capacidad de generar o puntuar frases que imitan su registro.
- Integración en pipelines de evaluación estilométrica: puede usarse junto con los otros ALM para clasificar textos de autoría dudosa.
- No dispone de tool calling, visión, audio ni capacidades multimodales; es un modelo puramente textual y de investigación.

## Casos de uso

- Autenticación de textos atribuidos a Plutarco: el modelo permite contrastar la perplejidad de un pasaje dudoso frente a los modelos de otros autores, ayudando a decidir si el texto es consistente con el estilo plutarqueo.
- Análisis estilométrico comparativo: investigadores pueden usar el conjunto de 28 modelos para estudiar diferencias de estilo entre autores clásicos, no solo en atribución sino también en evolución diacrónica.
- Replicación de estudios de atribución: al ser un modelo abierto y reproducible, sirve como base para verificar los resultados de Huang et al. (2025) o para experimentar con variaciones en el preprocesado.
- Entrenamiento de modelos autoriales para otros autores: el código y la metodología documentados permiten extender el enfoque a nuevos corpus o idiomas antiguos.
- Evaluación de métricas de perplejidad: el modelo es útil para investigar cómo la perplejidad por token se correlaciona con la autoría en textos fragmentarios o con ruido.
- Docencia en humanidades digitales: puede emplearse en cursos de estilometría computacional para ilustrar la aplicación de modelos de lenguaje a problemas filológicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks individuales para este modelo en la informacion disponible. La model card reporta el rendimiento agregado del conjunto completo de 28 modelos sobre el test de Sphragis, que se resume a continuacion:

| Metrica | Valor |
|---|---|
| Macro-F1 en sentence_1 | 62.36 |
| Macro-F1 en sentence_5 | 86.84 |
| Macro-F1 en sentence_10 | 89.53 |
| Macro-F1 en sentence_50 | 92.44 |

Estos datos corresponden a la evaluacion conjunta de todos los ALM, no a este modelo de forma aislada. No se dispone de comparaciones con otros sistemas de atribucion en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16, el modelo ocupa aproximadamente 2,35 GB (1.176.764.416 parámetros × 2 bytes). Con cuantizacion a 8 bits (int8) se reduce a ~1,2 GB, y a 4 bits a ~0,6 GB, aunque no se ofrecen versiones cuantizadas oficiales.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM puede ejecutar el modelo en bf16 (p. ej., NVIDIA GTX 1650, RTX 3050, RTX 4060). Para cargas de trabajo con multiples modelos simultaneos, se recomienda una GPU con 8 GB o mas.
- Despliegue: al ser un modelo de la familia OLMo, es compatible con motores de inferencia como vLLM, llama.cpp, Ollama y TGI, siempre que se adapten los pesos al formato requerido (GGUF, etc.). No se proporcionan instrucciones especificas de despliegue en la model card.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamano del modelo, en una GPU moderna se espera una latencia de decodificacion de decenas de milisegundos por token, pero estos valores dependen del hardware y del motor utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| Urdatorn/sphragis-alm-olmo1b-sentence-plutarch | 1,17 B | No disponible | Other | Atribucion de autoria en griego antiguo (Plutarco) |
| Urdatorn/sphragis-alm-olmo3-7b-plutarch | 7 B | No disponible | Other | Atribucion de autoria en griego antiguo (Plutarco) |
| allenai/OLMo-1B-hf (modelo base) | 1,17 B | 2048 (segun documentacion de OLMo) | Apache-2.0 | Modelo de lenguaje general en ingles |

La comparacion directa con el modelo de 7B muestra una diferencia sustancial en parametros, lo que probablemente afecta a la calidad de la perplejidad, pero no se dispone de resultados comparativos publicados. El modelo base OLMo-1B es un modelo generalista en ingles, mientras que este ALM esta especializado en griego antiguo y en un autor concreto.

## Limitaciones y advertencias

- Licencia restrictiva: el modelo se distribuye bajo licencia "other" debido a que el corpus de entrenamiento incluye material con licencia CC BY-NC-SA. Esto impide su uso comercial sin una revision exhaustiva de las fuentes y posiblemente requiere compartir derivados bajo la misma licencia.
- Especializacion extrema: el modelo solo es util para textos de Plutarco o muy cercanos a su estilo; su rendimiento en otros autores o registros del griego antiguo sera pobre.
- Riesgo de sobreajuste: al entrenarse con una sola epoca sobre 1.300 frases, el modelo puede memorizar patrones superficiales del corpus de Plutarco, lo que podria inflar la perplejidad en textos genuinos pero atipicos.
- Sesgos del corpus: el texto de entrenamiento proviene de ediciones modernas y digitalizaciones que pueden contener errores de transcripcion o normalizaciones que afecten a la atribucion.
- Sin garantias de produccion: no se ha evaluado su robustez frente a ruido, variantes dialectales o textos fragmentarios, por lo que no es recomendable para aplicaciones criticas sin validacion adicional.
- Fecha de creacion futura: el modelo fue creado en agosto de 2026, lo que sugiere que es un artefacto experimental y podria no estar mantenido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Urdatorn/sphragis-alm-olmo1b-sentence-plutarch
- Dataset Sphragis: https://huggingface.co/datasets/Urdatorn/sphragis
- Codigo de entrenamiento y atribucion: https://github.com/Urdatorn/sphragis_models
- Leaderboard de Sphragis: https://huggingface.co/spaces/Urdatorn/sphragis-leaderboard
- Repositorio de OLMo (AI2): https://github.com/allenai/OLMo
- Pagina oficial de OLMo: https://allenai.org/olmo
