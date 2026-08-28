# Urdatorn/sphragis-alm-olmo1b-sentence-lysias

## Resumen

`sphragis-alm-olmo1b-sentence-lysias` es un modelo de lenguaje autoría (ALM, por sus siglas en inglés) desarrollado por Urdatorn (Albin Thörn Cleland) dentro del proyecto Sphragis, un benchmark de atribución de autoría para griego antiguo. Se trata de un ajuste fino completo (further-pretraining) del modelo base `allenai/OLMo-1B-hf` sobre las frases de un único autor, Lisias, con el objetivo de medir la perplejidad de cada oración y atribuirla al autor cuyo modelo la encuentre menos sorprendente. El modelo forma parte de un conjunto de 28 ALMs, uno por autor, que en conjunto alcanzan una macro-F1 de 62,36 en la tarea de atribución a nivel de frase individual (sentence_1).

La relevancia de este modelo radica en su aplicación a la filología digital y la estilometría: permite atribuir textos griegos antiguos de autoría dudosa mediante un criterio probabilístico basado en la verosimilitud de las secuencias. Su arquitectura es un transformer decoder de 1.176 millones de parámetros, con una ventana de contexto no especificada en la documentación disponible. El entrenamiento se realizó sobre 750 filas (66.888 tokens puntuados) de la partición `sentence_1` del corpus Sphragis, con 2 épocas y una selección de hiperparámetros guiada por la validación de atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (OLMo-1B) |
| Parametros totales | 1.176.764.416 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (pesos originales); otras cuantizaciones no disponibles |
| Idiomas soportados | grc (griego antiguo) |
| Licencia | other (derivado de Apache-2.0, pero con restricciones por datos de entrenamiento) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-1B-hf`, un transformer decoder causal de 1.170 millones de parámetros entrenado por el AI2 con datos abiertos. Sobre esta base se realiza un further-pretraining completo (no un LoRA) utilizando únicamente las frases de Lisias del corpus Sphragis. Cada secuencia de entrenamiento tiene la forma `<|endoftext|> sentence <|endoftext|>`, es decir, una sola frase por secuencia, con el objetivo de modelar la probabilidad de cada token dado el contexto anterior.

El entrenamiento se llevó a cabo con precisión mixta (fp32 para los pesos maestros, bf16 para el cómputo) usando FSDP con sharding completo en 2 GPU GH200. Se emplearon 2 épocas, un learning rate constante de 5e-05 tras 25 pasos de warmup, y un batch efectivo de 16 frases. La duración del entrenamiento no se fijó a priori (a diferencia de los 100 épocas del método original de Huang et al.), sino que se seleccionó mediante ascenso por coordenadas sobre la macro-F1 de validación de atribución, lo que constituye una innovación metodológica: se optimiza directamente la capacidad discriminativa entre autores, no la perplejidad del autor individual.

## Capacidades

- Modelo de lenguaje causal especializado en el estilo de Lisias (griego antiguo).
- Cálculo de perplejidad o log-verosimilitud negativa por token para frases completas.
- Uso exclusivo como componente de un sistema de atribución de autoría: se puntúa una frase con los 28 modelos y se asigna al autor cuyo modelo la encuentra menos sorprendente.
- No soporta generación de texto libre, chat, tool calling, ni tareas de razonamiento general.
- Capacidad multilingüe: únicamente griego antiguo (grc), sin transferencia a otros idiomas.
- No dispone de modo de pensamiento ni capacidades multimodales.

## Casos de uso

- Atribución de autoría de textos griegos antiguos: dado un fragmento de autoría dudosa, se puntúa con los 28 ALMs del conjunto Sphragis y se asigna al autor con menor perplejidad media. Es el caso de uso principal y para el que fue diseñado.
- Análisis estilométrico cuantitativo: permite medir la distancia estilística entre un texto y el corpus de un autor concreto mediante la diferencia de log-verosimilitud.
- Verificación de autenticidad en corpus epigráficos o papirológicos: ayuda a detectar interpolaciones o falsificaciones comparando la coherencia estilística con el autor atribuido.
- Investigación filológica sobre el corpus de Lisias: el modelo puede usarse para estudiar variaciones internas de estilo dentro de las obras atribuidas a este orador.
- Entrenamiento de sistemas de atribución para otros autores: la metodología de selección por validación de atribución puede replicarse para crear ALMs de nuevos autores con corpus etiquetados.
- Evaluación de la influencia de la longitud de la frase en la atribución: al entrenar con frases individuales, el modelo permite analizar cómo varía la precisión atributiva según la extensión del texto (el conjunto completo alcanza 92,44 de macro-F1 con frases de 50 tokens).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks individuales para este modelo en la información disponible. La model card indica que el conjunto de 28 modelos (incluido este) alcanza los siguientes resultados de macro-F1 en el test de Sphragis:

| Tarea | Macro-F1 |
|---|---|
| sentence_1 | 62,36 |
| sentence_5 | 86,84 |
| sentence_10 | 89,53 |
| sentence_50 | 92,44 |

Estos valores corresponden al sistema completo, no a este modelo aislado. No se dispone de comparaciones con otros modelos de atribución de autoría en griego antiguo.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 1.176 millones de parámetros en bf16, lo que ocupa aproximadamente 2,35 GB en memoria. Con overhead de activaciones y KV cache, se puede ejecutar en GPUs con 6-8 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB (RTX 3060, RTX 4060, etc.) es suficiente para inferencia por lotes pequeños. Para entrenamiento se usaron 2x GH200, pero no es necesario para uso inferencial.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama media y alta.
- Opciones de despliegue: al ser un modelo en formato safetensors compatible con HuggingFace Transformers, puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). También puede usarse directamente con la librería `transformers` para scoring por lotes.
- Latencia y throughput: no se han publicado mediciones. Para un modelo de 1B, se espera una latencia de decenas de milisegundos por token en GPU moderna, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| `sphragis-alm-olmo1b-sentence-lysias` (este) | 1,17B | no disponible | other | ALM específico para Lisias |
| `allenai/OLMo-1B-hf` (base) | 1,17B | 2048 (según documentación de OLMo) | Apache-2.0 | Modelo general de lenguaje |
| `Urdatorn/sphragis-alm-olmo3-greek-7b-aeschylus` | 7B (OLMo-3) | no disponible | other | ALM para Esquilo, mismo proyecto pero mayor tamaño |

La comparación directa con el modelo base muestra que este ALM es una especialización extrema: pierde capacidad general pero gana precisión en la modelización del estilo de Lisias. Frente al ALM de Esquilo, la diferencia de tamaño (1B vs 7B) puede implicar mayor capacidad de capturar matices estilísticos, aunque no se dispone de comparativas publicadas.

## Limitaciones y advertencias

- Es un modelo de propósito único: no sirve para generación de texto, chat ni tareas generales de NLP. Intentar usarlo fuera de la atribución de autoría dará resultados pobres.
- Sesgo de corpus: entrenado exclusivamente con las frases de Lisias del corpus Sphragis, que a su vez proviene de fuentes con licencias mixtas. El modelo puede reflejar sesgos estilísticos o temáticos de ese corpus concreto.
- Riesgo de alucinación: al ser un modelo de lenguaje, puede generar texto incoherente si se fuerza la generación, pero su uso previsto (scoring) no implica generación.
- Limitaciones de idioma: solo griego antiguo; no soporta otros idiomas ni variantes dialectales del griego.
- Restricciones de licencia: la licencia `other` impide asumir permisos de uso comercial sin revisar el archivo `LICENSES.md` del dataset Sphragis. El modelo base es Apache-2.0, pero los datos de entrenamiento incluyen material CC BY-NC-SA, lo que puede limitar usos comerciales.
- Para producción: no hay garantías de mantenimiento ni soporte. El autor es un investigador académico, no una empresa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Urdatorn/sphragis-alm-olmo1b-sentence-lysias
- Dataset Sphragis: https://huggingface.co/datasets/Urdatorn/sphragis
- Código de entrenamiento y scoring: https://github.com/Urdatorn/sphragis_models
- Paper de referencia (Huang, Murakami y Grieve, 2025): https://doi.org/10.1371/journal.pone.0327081
- Modelo base OLMo-1B: https://huggingface.co/allenai/OLMo-1B-hf
- Perfil del autor en HuggingFace: https://huggingface.co/Urdatorn
- Perfil del autor en GitHub: https://github.com/Urdatorn
