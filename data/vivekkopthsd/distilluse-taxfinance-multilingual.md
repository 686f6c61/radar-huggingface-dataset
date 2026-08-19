# vivekkopthsd/distilluse-taxfinance-multilingual

## Resumen

`distilluse-taxfinance-multilingual` es un modelo de embeddings de frases multilingüe de 134,7 millones de parámetros, desarrollado por el usuario `vivekkopthsd` mediante destilación de conocimiento (knowledge distillation). Está diseñado específicamente para la recuperación de información semántica en el dominio de la fiscalidad personal india y las finanzas, con soporte para inglés, hindi y hinglish (mezcla de inglés e hindi). El modelo se construye sobre la arquitectura `distiluse-base-multilingual-cased-v2` (DistilBERT de 6 capas, 768 unidades ocultas) y se entrena con un objetivo de destilación de ranking a partir de un profesor de 300 millones de parámetros, `embeddinggemma-300m-taxrag-ft`, que está congelado durante el entrenamiento.

La relevancia de este modelo radica en su capacidad para alinear representaciones entre idiomas mediante un enfoque de pares paralelos (Reimers y Gurevych, 2020), lo que permite que consultas en hindi recuperen documentos en inglés y viceversa. Con una salida de embeddings de 512 dimensiones, es un modelo ligero adecuado para tareas de búsqueda semántica y generación aumentada por recuperación (RAG) en dominios fiscales y financieros. Aunque se presenta como un artefacto de investigación, su licencia Apache 2.0 permite su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT de 6 capas (base `distiluse-base-multilingual-cased-v2`), con proyección densa (768→512) + Tanh + L2-normalización |
| Parametros totales | 134.734.080 (backbone, según safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repo en safetensors; no se especifican versiones cuantizadas) |
| Idiomas soportados | Inglés (en), Hindi (hi) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura DistilBERT de 6 capas con 768 unidades ocultas, que produce embeddings de 512 dimensiones tras una proyección densa con activación Tanh y normalización L2. El entrenamiento emplea destilación de conocimiento: el estudiante (este modelo) aprende a replicar la distribución de similitud de un profesor de 300 millones de parámetros, `embeddinggemma-300m-taxrag-ft`, que es un modelo de embeddings multilingüe (inglés, hindi, hinglish) ajustado en datos de preguntas y respuestas fiscales indias. La función de pérdida es la divergencia KL entre las distribuciones softmax de similitud (con temperatura T=1.0) del profesor y del estudiante sobre los candidatos de cada lote, lo que permite optimizar el ranking sin necesidad de que las dimensiones de salida coincidan (512 vs 768).

Se emplea un enfoque de pares paralelos inspirado en Reimers y Gurevych: para cada pasaje fiscal en inglés, se añade una traducción al hindi generada con `Helsinki-NLP/opus-mt-en-hi` como candidato positivo paralelo en el mismo lote. De esta forma, el estudiante aprende que una consulta en inglés debe rankear tanto su pasaje original como su traducción al hindi, fomentando la alineación cross-lingual de manera directa. Además, se utiliza un ajuste fino con LoRA (r=16, α=32, dropout=0.05), con solo un 2,9 % de parámetros entrenables, y un objetivo de contraste multi-positivo InfoNCE en la condición de control (etiquetas duras) para aislar el efecto de la destilación. Los datos de entrenamiento provienen de `indian-income-tax-qa`, `AIR-Bench/qa_finance_en`, datos de finanzas en hindi nativo y las traducciones paralelas generadas, con una división 80/10/10 en train/validation/test sin fugas.

## Capacidades

- **Generación de embeddings semánticos**: produce vectores de 512 dimensiones normalizados para frases o documentos, listos para cálculo de similitud coseno.
- **Búsqueda semántica multilingüe**: soporta consultas en inglés y hindi para recuperar documentos en ambos idiomas, con especial énfasis en la recuperación cross-lingual (consultas en hindi sobre documentos en inglés).
- **Integración con RAG**: compatible con `sentence-transformers`, permite construir pipelines de generación aumentada por recuperación sobre corpus fiscales y financieros.
- **Extracción de características**: útil para clasificación de texto, clustering y detección de similitud entre documentos.
- **Tool calling y agentes**: no aplica; es un modelo de embeddings, no generativo.
- **Capacidades multilingües**: solo inglés e hindi, con alineación cross-lingual entrenada explícitamente.
- **Modo de pensamiento / razonamiento**: no aplica; no es un modelo de lenguaje conversacional.

## Casos de uso

- **Búsqueda semántica en corpus fiscales indianas**: un sistema de recuperación para asesores fiscales que consultan en inglés o hindi sobre la Ley del Impuesto sobre la Renta de la India. El modelo permite buscar por significado, no solo por palabras clave, gracias a sus embeddings de 512 dimensiones.
- **RAG para atención al cliente en finanzas**: una plataforma de asistencia virtual que responde preguntas sobre inversiones, Nifty, EBITDA o niveles de ruptura técnica en hindi, recuperando pasajes en inglés de manuales financieros. El modelo alinea los idiomas para que la respuesta en inglés se recupere correctamente.
- **Clasificación de documentos fiscales**: al generar embeddings de facturas o formularios, se pueden agrupar o clasificar por tipo de trámite, por ejemplo, para automatizar la gestión de reclamaciones de HRA o deducciones.
- **Búsqueda de preguntas frecuentes (FAQ)**: en un portal de impuestos, se pueden indexar las preguntas frecuentes en inglés y hindi y responder a consultas de usuarios en cualquiera de los dos idiomas, reduciendo la carga del soporte humano.
- **Traducción asistida y verificación de paralelismos**: dado que el modelo aprende a mapear frases paralelas, puede usarse para detectar traducciones consistentes entre documentos en inglés e hindi.
- **Sistemas de recomendación de artículos**: en un portal de noticias financieras, se pueden recomendar artículos en inglés a lectores que buscan en hindi, basándose en la similitud de los embeddings.

## Benchmarks y rendimiento

La model card reporta una evaluación con tres condiciones: monolingüe EN (consultas en inglés → documentos en inglés), hindi nativo (consultas en hindi → documentos en hindi) y cross-lingual (consultas en hindi → documentos en inglés). Los resultados se presentan como medias de tres semillas con desviaciones estándar, pero solo se ha publicado el valor para la condición monolingüe EN del modelo destilado:

| Condición | Modelo destilado | Ajuste directo (control) | Profesor (300M) | Estudiante sin entrenar |
|---|---|---|---|---|
| Monolingüe EN (nDCG@10) | 0.485 | no disponible | no disponible | no disponible |

Los resultados completos de las otras condiciones y los valores de los controles no se incluyen en la información disponible. Por tanto, no es posible realizar una comparación exhaustiva de rendimiento.

## Requisitos de hardware

- **VRAM estimada**: con 134,7 millones de parámetros, el modelo en precisión FP32 ocupa aproximadamente 539 MB (134,7 M × 4 bytes). En FP16, alrededor de 270 MB. La inferencia es ligera y cabe en cualquier GPU moderna, incluso en tarjetas de consumo de 4 GB o menos.
- **GPUs recomendadas**: cualquier GPU con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3060, etc.) es suficiente. Para producción con alto rendimiento, una T4 o A10 es más que adecuada.
- **Compatibilidad con consumer GPU**: sí, el modelo es pequeño y se puede ejecutar en CPU con razonamiento razonable, aunque en GPU es más rápido.
- **Opciones de despliegue**: compatible con `sentence-transformers` (Python), y soporta `text-embeddings-inference` y `endpoints_compatible`, lo que permite desplegarlo con herramientas como Hugging Face Inference Endpoints, `vLLM` (aunque vLLM no es estándar para embeddings) o `tei` (Text Embeddings Inference). También puede usarse con `sentence-transformers` en servidores propios.
- **Latencia y throughput**: no se dispone de datos medidos. Dado su tamaño, se espera una latencia de milisegundos por frase en una GPU moderna, pero no se puede cuantificar sin pruebas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `distilluse-taxfinance-multilingual` (este) | 134,7 M | no disponible | en, hi | Apache-2.0 | safetensors |
| `distiluse-base-multilingual-cased-v2` (base) | 134,7 M | no disponible | 50+ idiomas | Apache-2.0 | safetensors |
| `embeddinggemma-300m-taxrag-ft` (profesor) | 300 M | no disponible | en, hi, hinglish | no disponible | no disponible |
| `multilingual-e5-large` (referencia general) | 560 M | 512 tokens | 100+ idiomas | MIT | safetensors |

El modelo destilado se posiciona como una versión especializada del base, ajustada a dominios fiscales y financieros, pero con menor cobertura de idiomas. No se dispone de benchmarks comparativos con estos modelos, por lo que la comparación es cualitativa.

## Limitaciones y advertencias

- **Sesgos conocidos**: el modelo se entrena exclusivamente con datos de fiscalidad y finanzas indianas, por lo que su conocimiento está limitado a ese dominio y puede no generalizar bien a otros contextos financieros o fiscales.
- **Riesgo de alucinación**: al ser un modelo de embeddings, no genera texto, por lo que no hay riesgo de alucinación directa, pero sí de recuperación de documentos irrelevantes si los datos de entrenamiento son limitados.
- **Limitaciones de idioma**: solo soporta inglés e hindi; no cubre otros idiomas, lo que limita su uso en contextos multilingües amplios.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial, pero hay que revisar los datos de entrenamiento; algunos datasets (como AIR-Bench) pueden tener sus propias licencias.
- **Estado de investigación**: el modelo tiene 0 descargas y 0 likes en Hugging Face; se describe como un "artefacto de investigación" y no se han publicado resultados completos de benchmarks, por lo que su rendimiento en producción no está validado externamente.
- **Contexto limitado**: no se especifica la longitud máxima de contexto, lo que puede afectar a la codificación de documentos largos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/vivekkopthsd/distilluse-taxfinance-multilingual)
- [Modelo base: `sentence-transformers/distiluse-base-multilingual-cased-v2`](https://huggingface.co/sentence-transformers/distiluse-base-multilingual-cased-v2)
- [Dataset `AIR-Bench` (referencia)](https://huggingface.co/datasets/AIR-Bench/qa_finance_en)
- [Referencia de Reimers & Gurevych sobre destilación cross-lingual](https://arxiv.org/abs/2004.09813)
