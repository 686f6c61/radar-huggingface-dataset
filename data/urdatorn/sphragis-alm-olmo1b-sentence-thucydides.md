# Urdatorn/sphragis-alm-olmo1b-sentence-thucydides

## Resumen

El modelo `Urdatorn/sphragis-alm-olmo1b-sentence-thucydides` es un modelo de lenguaje autorial (ALM, por sus siglas en inglés) desarrollado por Urdatorn como parte del benchmark Sphragis de atribución de autoría para griego antiguo. Se trata de un ajuste fino completo (further-pretraining) del modelo base `allenai/OLMo-1B-hf` sobre las oraciones de entrenamiento atribuidas al historiador Tucídides. El objetivo no es la generación de texto general, sino modelar la distribución de probabilidad del lenguaje de un autor concreto para, mediante la perplejidad, atribuir la autoría de textos anónimos o disputados.

El modelo forma parte de un conjunto de 28 ALMs, uno por cada autor del corpus Sphragis, siguiendo la metodología de Huang, Murakami y Grieve (2025) publicada en PLoS ONE. Cada modelo se entrena únicamente con las filas de un autor, y la atribución se realiza comparando la log-verosimilitud negativa por token de cada modelo sobre la oración a clasificar. Este modelo concreto se entrenó con 950 filas y 101 792 tokens puntuados del split `sentence_1`, durante 2 épocas, con una selección de hiperparámetros basada en la macro-F1 de atribución en validación. Con 1 176 764 416 parámetros (aproximadamente 1,18 mil millones), es un modelo compacto pero suficiente para la tarea especializada de estilometría.

La relevancia de este modelo radica en su enfoque metodológico: en lugar de fijar un número arbitrario de épocas como en el trabajo original, la duración del entrenamiento se elige mediante evidencia de validación sobre la propia tarea de atribución, lo que mejora la discriminación entre autores. El modelo se publica con licencia `other` debido a las licencias mixtas de los textos fuente, que incluyen material CC BY-NC-SA, lo que restringe su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo-1B-hf) |
| Parametros totales | 1 176 764 416 (1,18 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | No disponible (pesos en bf16) |
| Idiomas soportados | Griego antiguo (grc) |
| Licencia | Other (derivado de Apache-2.0 con restricciones por CC BY-NC-SA) |
| Formato de pesos | Safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura OLMo-1B de AI2, un transformer decoder-only con 1,18 mil millones de parámetros. No se trata de un modelo de mezcla de expertos (MoE), sino de un modelo denso convencional. La innovación principal no reside en la arquitectura, sino en el procedimiento de entrenamiento: se realiza un further-pretraining completo sobre un corpus muy reducido y especializado (solo las oraciones de un autor), con el objetivo de modelar la idiosincrasia lingüística de Tucídides.

El entrenamiento se llevó a cabo con un objetivo de modelado de lenguaje causal, donde cada secuencia consiste en `<|endoftext|> sentence <|endoftext|>`, es decir, una única oración por secuencia. Se utilizaron 2 épocas, una tasa de aprendizaje constante de 5e-05 tras 25 pasos de calentamiento, y un tamaño de lote efectivo de 16 oraciones. La precisión se mantuvo en fp32 para los pesos maestros, con cómputo en bf16 y paralelismo FSDP completo sobre 2 GPU GH200. Los pesos finales se guardaron en bf16.

La selección de hiperparámetros (modelo base y número de épocas) se realizó mediante ascenso por coordenadas sobre la macro-F1 de atribución en validación, considerando los 28 modelos del conjunto. Esto difiere del enfoque original de Huang y colaboradores, que fijaban 100 épocas; aquí se optimiza directamente la capacidad discriminativa entre autores, no la perplejidad individual.

## Capacidades

- Modelado de lenguaje autorial: genera distribuciones de probabilidad sobre secuencias de texto en griego antiguo, especializadas en el estilo de Tucídides.
- Atribución de autoría: permite calcular la perplejidad de una oración y compararla con la de otros 27 modelos para determinar el autor más probable.
- Puntuación de oraciones: diseñado para evaluar la sorpresa de una secuencia dada, no para generar texto creativo.
- Soporte multilingüe: no aplica, solo griego antiguo.
- Tool calling y agentes: no soportado, no es un modelo de propósito general.
- Modo de razonamiento: no disponible, es un modelo de lenguaje puro sin capacidades de razonamiento explícito.

## Casos de uso

- Atribución de autoría en textos griegos antiguos: el uso principal es clasificar oraciones o pasajes de autoría dudosa. Se puntúa cada oración con los 28 modelos del benchmark y se asigna al autor cuyo modelo produzca menor perplejidad. Es adecuado para investigaciones filológicas sobre obras disputadas, como las atribuidas a Tucídides o a otros historiadores.
- Análisis estilométrico cuantitativo: los investigadores pueden utilizar la perplejidad de este modelo como una métrica de similitud estilística entre un texto anónimo y el corpus de Tucídides, complementando métodos tradicionales de estilometría basados en frecuencias de palabras.
- Evaluación de hipótesis de autoría en ediciones críticas: los editores de textos clásicos pueden contrastar la probabilidad de que un fragmento pertenezca a Tucídides frente a otros autores del corpus Sphragis, ayudando a decidir inclusiones o exclusiones en ediciones críticas.
- Estudio de la evolución del estilo dentro de la obra de un autor: al entrenar el modelo sobre oraciones individuales, se puede analizar cómo varía la perplejidad a lo largo de la obra de Tucídides, identificando posibles interpolaciones o secciones de autoría diferente.
- Comparación metodológica en atribución de autoría: este modelo sirve como referencia para probar nuevas técnicas de atribución, ya que su entrenamiento está documentado y es reproducible, permitiendo a otros investigadores replicar o mejorar el enfoque.
- Docencia e investigación en procesamiento del lenguaje natural para lenguas clásicas: el modelo y su código asociado pueden utilizarse en cursos de PLN aplicado a humanidades digitales, demostrando cómo adaptar un modelo de lenguaje moderno a un corpus histórico con recursos limitados.

## Benchmarks y rendimiento

El modelo forma parte de un conjunto de 28 ALMs que, en conjunto, alcanzan los siguientes resultados de macro-F1 en el test de Sphragis:

| Tarea | Macro-F1 |
|---|---|
| sentence_1 (1 oración) | 62,36 |
| sentence_5 (5 oraciones) | 86,84 |
| sentence_10 (10 oraciones) | 89,53 |
| sentence_50 (50 oraciones) | 92,44 |

Estos resultados corresponden al rendimiento colectivo de los 28 modelos, no a este modelo individualmente. No se han publicado métricas aisladas para el modelo de Tucídides en la información disponible. La mejora progresiva con el número de oraciones indica que la señal estilística se acumula con más contexto, lo que valida la metodología.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,18 mil millones de parámetros en bf16, el modelo ocupa aproximadamente 2,36 GB solo en pesos. Con overhead de activaciones y memoria intermedia, se estima un consumo de 4-6 GB para inferencia de una sola oración, dependiendo de la longitud.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM es suficiente, por ejemplo NVIDIA RTX 3060, RTX 4060, o superiores. También puede ejecutarse en GPUs de datacenter como A10 o T4.
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPUs modernas de consumo con 8 GB o más, como RTX 3070, RTX 4070, etc.
- Opciones de despliegue: al ser un modelo en formato safetensors, puede cargarse con la librería `transformers` de Hugging Face. Para inferencia más eficiente, se puede convertir a GGUF y usar `llama.cpp` u Ollama, aunque no se proporcionan conversiones oficiales. También es compatible con vLLM si se convierte a un formato soportado.
- Latencia y throughput: no se han publicado mediciones específicas. Dado el tamaño reducido, se espera una latencia de decenas de milisegundos por oración en una GPU moderna, pero estos datos no están disponibles.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos de atribución de autoría para griego antiguo en la información proporcionada. Sin embargo, se puede comparar con el modelo base y con la variante de mayor tamaño del mismo autor:

| Modelo | Parámetros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| `sphragis-alm-olmo1b-sentence-thucydides` (este) | 1,18 B | No disponible | Other | Atribución de autoría en griego antiguo |
| `allenai/OLMo-1B-hf` (base) | 1,18 B | 2048 (típico de OLMo) | Apache-2.0 | Modelo de lenguaje general en inglés |
| `Urdatorn/sphragis-alm-olmo3-7b-thucydides` (variante mayor) | 7 B (estimado) | No disponible | Other | Misma tarea, mayor capacidad |

La comparativa con el modelo base muestra que este ALM está especializado en un solo autor y un solo idioma, mientras que OLMo-1B es multilingüe (aunque principalmente inglés) y de propósito general. La variante de 7B probablemente ofrezca mejor rendimiento en atribución, pero requiere más recursos. No hay datos de rendimiento comparativo entre ambas variantes en la información disponible.

## Limitaciones y advertencias

- Sesgos del corpus: el modelo se entrenó exclusivamente con textos atribuidos a Tucídides dentro del benchmark Sphragis, que a su vez proviene de fuentes con licencias mixtas. Esto puede introducir sesgos estilísticos específicos del corpus, no representativos de todo el griego antiguo.
- Riesgo de alucinación: al ser un modelo de lenguaje, puede generar texto plausible pero no auténtico de Tucídides si se usa para generación, aunque no es su propósito. No se recomienda su uso para generar citas o pasajes.
- Limitaciones de contexto: la longitud de contexto no está especificada, pero al entrenarse con una sola oración por secuencia, el modelo no está optimizado para procesar pasajes largos de una vez. Para atribución de textos extensos, se debe dividir en oraciones o ventanas.
- Restricciones de licencia: la licencia `other` impide el uso comercial sin verificación de las licencias de los textos fuente, que incluyen material CC BY-NC-SA. Cualquier uso comercial requiere revisar el archivo `LICENSES.md` del dataset Sphragis.
- Especialización extrema: el modelo solo es útil para la tarea de atribución de autoría en griego antiguo. No sirve para tareas generales de PLN, generación de texto, traducción o análisis sintáctico.
- Dependencia del conjunto de 28 modelos: la atribución correcta requiere ejecutar los 28 modelos del benchmark, no solo este. Usarlo de forma aislada no proporciona una clasificación completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Urdatorn/sphragis-alm-olmo1b-sentence-thucydides
- Dataset Sphragis: https://huggingface.co/datasets/Urdatorn/sphragis
- Código de entrenamiento y atribución: https://github.com/Urdatorn/sphragis_models
- Leaderboard del benchmark: https://huggingface.co/spaces/Urdatorn/sphragis-leaderboard
- Paper de referencia (Huang, Murakami y Grieve, 2025): https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0327081
- Repositorio OLMo de AI2: https://github.com/allenai/OLMo
- Página oficial de OLMo: https://allenai.org/olmo
