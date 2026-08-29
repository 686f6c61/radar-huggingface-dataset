# Urdatorn/sphragis-alm-olmo1b-metre-aratus

## Resumen

El modelo `Urdatorn/sphragis-alm-olmo1b-metre-aratus` es un modelo de lenguaje autoría (ALM, por sus siglas en inglés) desarrollado por Urdatorn como parte del benchmark Sphragis-Metre, un conjunto de datos para la atribución de autoría en griego antiguo. Se trata de un ajuste fino completo (further-pretraining) del modelo base `allenai/OLMo-1B-hf` sobre un corpus específico del poeta Aratus, con el objetivo de medir la perplejidad de oraciones y así atribuir la autoría de textos anónimos o disputados. El modelo sigue la metodología propuesta por Huang, Murakami y Grieve (2025) en su artículo sobre atribución de autoría mediante la perplejidad de modelos de lenguaje autoría.

Con 1.176.764.416 parámetros, este modelo es uno de los diecisiete ALMs entrenados para el benchmark, cada uno especializado en un autor distinto. Su relevancia radica en que ofrece una herramienta cuantitativa y reproducible para la filología clásica, permitiendo evaluar la probabilidad de que un texto pertenezca a un autor concreto mediante la comparación de puntuaciones de perplejidad entre modelos. El modelo está pensado para ser utilizado en conjunto con los otros dieciséis, no de forma aislada, y su licencia es `other` debido a las restricciones de los textos fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo-1B) |
| Parametros totales | 1.176.764.416 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | grc (griego antiguo) |
| Licencia | other (derivada de Apache-2.0 con restricciones por fuentes CC BY-NC-SA) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Transformer decoder-only de OLMo-1B, un modelo de lenguaje abierto desarrollado por el Allen Institute for AI. Sobre esta base se realiza un ajuste fino completo (further-pretraining) utilizando únicamente las filas de entrenamiento correspondientes al autor Aratus dentro del benchmark Sphragis-Metre. El objetivo de entrenamiento es la modelización causal del lenguaje sobre secuencias de una sola oración delimitadas por tokens `<|endoftext|>`, de modo que el modelo aprenda a asignar probabilidades a cada token en función del estilo particular del autor.

El entrenamiento se realizó con 2 épocas, una tasa de aprendizaje constante de 5e-05 tras 25 pasos de calentamiento, un tamaño de lote efectivo de 16 oraciones y precisión mixta (fp32 para pesos maestros, bf16 para cómputo) usando FSDP con sharding completo en 2 GPUs GH200. La selección del número de épocas y del modelo base (si se partía del OLMo-1B original o de una versión adaptada al griego) se hizo mediante ascenso por coordenadas sobre la macro-F1 de validación del conjunto de los 17 modelos, priorizando la capacidad de discriminación entre autores más que el ajuste individual a un solo autor. Los pesos finales se guardaron en bf16.

## Capacidades

- Generación de texto en griego antiguo limitada al estilo del autor Aratus, aunque su uso principal no es la generación sino la evaluación de probabilidades.
- Cálculo de perplejidad (negative log-likelihood por token) para oraciones en griego antiguo, lo que permite medir la "sorpresa" de un texto bajo el modelo.
- Atribución de autoría: al comparar la perplejidad de una oración entre los 17 modelos del benchmark, se puede asignar la autoría al modelo que encuentre la oración menos sorprendente.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no, está especializado exclusivamente en griego antiguo.
- Capacidades especiales: ninguna más allá de la modelización de autoría.

## Casos de uso

- Atribución de autoría en textos griegos antiguos anónimos o disputados: el modelo se utiliza junto con los otros 16 ALMs para puntuar cada oración de un texto y determinar qué autor es más probable, basándose en la perplejidad comparada. Es adecuado porque fue entrenado específicamente para maximizar la discriminación entre autores.
- Análisis estilométrico cuantitativo: los investigadores pueden usar las puntuaciones de perplejidad como una métrica objetiva de similitud estilística entre un texto y el corpus de un autor concreto, complementando métodos tradicionales de estilometría.
- Verificación de autoría en corpus fragmentarios: para textos de los que solo se conservan fragmentos, el modelo puede evaluar la probabilidad de que pertenezcan a Aratus frente a otros autores del benchmark, ayudando en la reconstrucción filológica.
- Investigación en humanidades digitales: sirve como herramienta reproducible para estudios sobre la evolución del estilo poético griego, permitiendo comparar la "distancia" entre autores mediante la perplejidad cruzada.
- Entrenamiento y evaluación de métodos de atribución: el modelo puede usarse como referencia para probar nuevas técnicas de atribución de autoría, ya que su comportamiento está documentado y su código de entrenamiento y puntuación está disponible en GitHub.
- Docencia en filología computacional: como ejemplo práctico de aplicación de modelos de lenguaje a problemas de las humanidades, ilustrando el flujo de trabajo de ajuste fino, evaluación y uso de modelos de autoría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks individuales para este modelo en la información disponible. Sin embargo, el conjunto completo de 17 modelos (incluido este) alcanza los siguientes resultados de macro-F1 en el test del benchmark Sphragis-Metre:

| Split de test | Macro-F1 |
|---|---|
| verse_1 | 56.81 |
| verse_5 | 76.15 |
| verse_10 | 80.99 |
| verse_50 | 72.88 |

Estos valores corresponden al sistema completo de 17 modelos trabajando en conjunto, no a este modelo de forma aislada. No se dispone de comparaciones con otros modelos de atribución de autoría en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 1.176.764.416 parámetros en bf16, lo que ocupa aproximadamente 2.35 GB solo en pesos. Con overhead de activaciones y memoria intermedia, se recomienda al menos 4 GB de VRAM para inferencia básica.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como una NVIDIA RTX 3050, RTX 3060, RTX 4060, o superiores. Para procesar lotes grandes o secuencias largas, se recomienda una GPU con 8 GB o más (RTX 3070, RTX 4070, etc.).
- Cabe en GPUs de consumo: sí, en la mayoría de GPUs modernas de consumo con 4 GB o más de VRAM.
- Opciones de despliegue: al ser un modelo en formato safetensors, puede cargarse con bibliotecas como Hugging Face Transformers, vLLM, o llama.cpp si se convierte a GGUF (aunque no se proporcionan cuantizaciones). También puede usarse con el código de puntuación del repositorio `sphragis_models`.
- Latencia y throughput: no disponible en la información proporcionada. Para un modelo de ~1.2B parámetros en una GPU moderna, se espera una latencia de decodificación de decenas de milisegundos por token, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma tarea (atribución de autoría en griego antiguo). Como referencia, se puede comparar con su modelo base:

| Modelo | Parámetros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| `allenai/OLMo-1B-hf` | 1.17B | 2048 (no confirmado en la info) | Apache-2.0 | Modelo de lenguaje general en inglés |
| `Urdatorn/sphragis-alm-olmo1b-metre-aratus` | 1.18B | No disponible | other | Atribución de autoría en griego antiguo |

La comparación con otros ALMs del mismo proyecto (por ejemplo, el de Platón basado en OLMo-3-7B) no es posible sin datos adicionales, ya que no se han publicado métricas individuales.

## Limitaciones y advertencias

- Licencia restrictiva: el modelo se distribuye bajo licencia `other` debido a que los textos de entrenamiento provienen de fuentes con licencias mixtas, incluyendo material CC BY-NC-SA. Esto impide su uso comercial sin verificación previa de las licencias de los textos fuente (ver `LICENSES.md` del dataset).
- Especialización extrema: el modelo solo es útil para textos en griego antiguo y específicamente para el estilo de Aratus. No es adecuado para tareas generales de procesamiento del lenguaje.
- Riesgo de alucinación: al ser un modelo de lenguaje, puede generar texto plausible pero incorrecto si se usa para generación, aunque su propósito no es ese.
- Sesgos del corpus: el entrenamiento se realizó sobre un corpus limitado (900 filas, 28.075 tokens), lo que puede introducir sesgos estilísticos particulares y limitar la generalización a otros géneros o épocas del griego antiguo.
- Dependencia del conjunto de modelos: la atribución de autoría requiere ejecutar los 17 modelos del benchmark; este modelo por sí solo no proporciona una respuesta de autoría.
- Sin cuantizaciones oficiales: no se ofrecen versiones GGUF u otras cuantizaciones, por lo que el despliegue en entornos con poca memoria requiere conversión manual.
- Fecha de creación futura: el modelo fue creado el 2026-08-29, lo que sugiere que es un artefacto reciente y posiblemente experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Urdatorn/sphragis-alm-olmo1b-metre-aratus
- Dataset Sphragis-Metre: https://huggingface.co/datasets/Urdatorn/sphragis-metre
- Repositorio de código (entrenamiento, puntuación y atribución): https://github.com/Urdatorn/sphragis_models
- Paper de referencia: Huang, Murakami y Grieve (2025), "Attributing authorship via the perplexity of authorial language models", PLoS ONE 20(7): e0327081. (No se proporciona URL directa, pero se cita en la model card).
- Modelo base: https://huggingface.co/allenai/OLMo-1B-hf
