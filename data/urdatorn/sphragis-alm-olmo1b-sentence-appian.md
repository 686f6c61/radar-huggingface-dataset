# Urdatorn/sphragis-alm-olmo1b-sentence-appian

## Resumen

El modelo `Urdatorn/sphragis-alm-olmo1b-sentence-appian` es un modelo de lenguaje autorial (ALM) especializado en la atribución de autoría de textos en griego antiguo. Forma parte de un conjunto de 28 modelos, cada uno entrenado sobre las obras de un autor clásico distinto, siguiendo la metodología propuesta por Huang, Murakami y Grieve (2025) en su artículo "Attributing authorship via the perplexity of authorial language models". Este modelo concreto se ha entrenado exclusivamente con las sentencias atribuidas a Apiano, uno de los historiadores griegos incluidos en el benchmark Sphragis.

El modelo parte de la arquitectura OLMo-1B de AllenAI y se somete a un proceso de *further-pretraining* (continuación del entrenamiento) sobre un corpus reducido de 750 oraciones del autor, con el objetivo de minimizar la perplejidad de dichas oraciones. La relevancia de este modelo radica en su uso como componente de un sistema de atribución de autoría: dado un texto de autoría desconocida, se calcula la perplejidad con cada uno de los 28 modelos y se asigna la autoría al modelo que encuentre el texto menos sorprendente. El conjunto completo alcanza una macro-F1 de 62,36 en el test de una sola oración, que sube a 92,44 cuando se dispone de 50 oraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo-1B (transformer decoder-only, basado en `allenai/OLMo-1B-hf`) |
| Parametros totales | 1.176.764.416 (aprox. 1,18 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (depende del modelo base OLMo-1B, no especificado) |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16; no se documentan cuantizaciones adicionales) |
| Idiomas soportados | Griego antiguo (grc) |
| Licencia | other (derivada de fuentes con licencias mixtas, incluye CC BY-NC-SA) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es una continuación del entrenamiento de `allenai/OLMo-1B-hf` (revisión `aee7752d9c08ee4775e9b0091426d8410e8f6a89`), un transformer decoder-only de 1,18 B parámetros. El proceso de *further-pretraining* se realiza sobre un subconjunto del benchmark Sphragis que contiene únicamente las oraciones de entrenamiento atribuidas a Apiano (750 filas, 77.433 tokens puntuados). El objetivo de entrenamiento es la modelización causal del lenguaje sobre secuencias del formato `<|endoftext|> sentence <|endoftext|>`, es decir, una oración por secuencia.

La configuración de entrenamiento se eligió mediante ascenso de coordenadas sobre la atribución de validación (macro-F1 sobre los 28 modelos), no sobre la perplejidad individual del autor. Esto implica que el número de épocas (2) y el modelo base (OLMo-1B estándar, no la versión adaptada al griego) se seleccionaron para maximizar la capacidad discriminativa del conjunto, no el ajuste individual. El entrenamiento usó una tasa de aprendizaje constante de 5e-05 tras 25 pasos de *warmup*, un tamaño de lote efectivo de 16 oraciones, precisión fp32 para los pesos maestros y bf16 para el cómputo, con paralelización FSDP *full shard* sobre 2 GPU GH200. Los pesos finales se guardan en bf16.

## Capacidades

- **Atribución de autoría**: el modelo está diseñado para puntuar la perplejidad de oraciones en griego antiguo y compararla con la de otros 27 modelos autoriales del mismo conjunto, permitiendo asignar una autoría probable.
- **Modelado de lenguaje causal**: puede generar texto o calcular la probabilidad de secuencias, aunque su uso principal no es la generación sino la evaluación de verosimilitud.
- **Especialización en un autor concreto**: al estar entrenado solo con las obras de Apiano, es especialmente sensible a las características estilísticas de este autor.
- **Multilingüe**: no, solo griego antiguo.
- **Tool calling / agentes**: no soportado.
- **Visión / audio**: no soportado.

## Casos de uso

- **Investigación filológica**: los estudiosos de la literatura clásica pueden usar el modelo para verificar la autoría de fragmentos dudosos atribuidos a Apiano, comparando la perplejidad con la de otros autores del corpus Sphragis.
- **Análisis estilométrico cuantitativo**: el modelo sirve como herramienta para medir la distancia estilística entre textos, complementando métodos tradicionales como el análisis de frecuencia de palabras o *stylometry* basada en *n-grams*.
- **Construcción de sistemas de atribución automática**: integrado en un pipeline con los otros 27 modelos, permite clasificar textos anónimos o de autoría disputada en el ámbito del griego antiguo.
- **Estudio de la evolución del estilo**: al puntuar oraciones de diferentes obras de Apiano, se pueden detectar variaciones internas o influencias de otros autores.
- **Validación de ediciones críticas**: los editores de textos clásicos pueden contrastar la coherencia estilística de pasajes reconstruidos o conjeturados.
- **Docencia e investigación en humanidades digitales**: sirve como caso práctico de aplicación de modelos de lenguaje a problemas de atribución de autoría en lenguas antiguas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks individuales para este modelo en la información disponible. Sin embargo, el conjunto completo de 28 modelos autoriales (incluido este) alcanza los siguientes resultados en el test del benchmark Sphragis:

| Métrica | Valor |
|---|---|
| Macro-F1 en `sentence_1` (una oración) | 62,36 |
| Macro-F1 en `sentence_5` (cinco oraciones) | 86,84 |
| Macro-F1 en `sentence_10` (diez oraciones) | 89,53 |
| Macro-F1 en `sentence_50` (cincuenta oraciones) | 92,44 |

Estos valores corresponden al rendimiento agregado del conjunto de 28 modelos, no a este modelo en particular. No se dispone de datos de perplejidad individual ni de comparación con otros modelos de atribución de autoría.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo tiene 1,18 B parámetros en bf16, lo que ocupa aproximadamente 2,36 GB en memoria. Con overhead de activaciones y *KV cache*, se puede ejecutar en GPUs con al menos 4 GB de VRAM.
- **GPU recomendadas**: cualquier GPU consumer con 4-8 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060, RTX 4060) es suficiente para inferencia. Para entrenamiento o *fine-tuning* adicional se recomienda una GPU con al menos 16 GB (RTX 4090, A100, etc.).
- **Compatibilidad con consumer GPU**: sí, cabe en GPUs de gama media y baja.
- **Opciones de despliegue**: al ser un modelo en formato safetensors compatible con Hugging Face Transformers, puede cargarse con `transformers` y ejecutarse en frameworks como vLLM, llama.cpp (si se convierte a GGUF) u Ollama. No se documentan despliegues específicos.
- **Latencia y throughput**: no disponible. Dado el tamaño reducido, se espera una latencia baja en GPUs modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Especialización | Licencia |
|---|---|---|---|---|---|
| `sphragis-alm-olmo1b-sentence-appian` (este) | OLMo-1B | 1,18 B | No disponible | Apiano (griego antiguo) | other |
| `sphragis-alm-olmo3-greek-7b-plato` | OLMo-3 7B (adaptado al griego) | 7 B | No disponible | Platón (griego antiguo) | other |
| `allenai/OLMo-1B-hf` (modelo base) | OLMo-1B | 1,18 B | 2048 (típico) | General (inglés) | Apache-2.0 |

La comparativa se limita a otros modelos del mismo autor y al modelo base. No se dispone de datos de rendimiento comparativo entre ellos. El modelo de Platón es significativamente más grande (7 B) y parte de una versión adaptada al griego, lo que podría ofrecer mejor rendimiento en atribución, pero no hay métricas publicadas que lo confirmen.

## Limitaciones y advertencias

- **Especialización extrema**: el modelo solo ha sido entrenado con las obras de Apiano, por lo que su capacidad de generalización a otros autores o géneros es nula. No debe usarse como modelo de lenguaje general.
- **Riesgo de alucinación**: al ser un modelo de lenguaje causal, puede generar texto plausible pero incorrecto si se usa para generación, aunque su propósito principal es la puntuación de perplejidad.
- **Limitaciones de contexto**: la longitud de contexto no está documentada; se hereda del modelo base OLMo-1B, que típicamente soporta 2048 tokens, pero no se ha verificado.
- **Restricciones de licencia**: la licencia `other` se debe a que el corpus de entrenamiento incluye material con licencias mixtas, incluyendo CC BY-NC-SA. Esto implica que el modelo no puede usarse con fines comerciales sin verificar la compatibilidad de las fuentes originales. Se recomienda revisar el archivo `LICENSES.md` del dataset Sphragis antes de cualquier uso.
- **Dependencia del conjunto de modelos**: el rendimiento en atribución depende de la comparación con los otros 27 modelos; usar este modelo de forma aislada no proporciona una decisión de autoría.
- **Datos de entrenamiento limitados**: solo 750 oraciones, lo que puede introducir sesgos estilísticos específicos del corpus y limitar la robustez ante variaciones textuales.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Urdatorn/sphragis-alm-olmo1b-sentence-appian)
- [Dataset Sphragis](https://huggingface.co/datasets/Urdatorn/sphragis)
- [Código de entrenamiento y puntuación](https://github.com/Urdatorn/sphragis_models)
- [Artículo de referencia: Huang, Murakami y Grieve (2025), PLoS ONE](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0327081)
- [Perfil del autor en Hugging Face](https://huggingface.co/Urdatorn)
- [Perfil del autor en GitHub](https://github.com/Urdatorn)
