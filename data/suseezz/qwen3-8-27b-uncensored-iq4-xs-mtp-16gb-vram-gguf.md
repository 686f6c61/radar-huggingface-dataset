# Suseezz/Qwen3.8-27B-Uncensored-IQ4-XS-MTP-16GB-VRAM-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF en formato IQ4_XS (4 bits) del modelo Qwen3.8-27B Uncensored, una versión del Qwen3.8-27B (27.320.697.856 parámetros) a la que se le ha eliminado el mecanismo de rechazo de contenido mediante una técnica de ablación. El objetivo es poder ejecutar un modelo de 27B en GPUs con 16 GB de VRAM, manteniendo un equilibrio entre calidad de salida, velocidad de inferencia y uso de memoria. El autor, Suseezz, ha optimizado la cuantización para que, con la decodificación especulativa MTP desactivada, se pueda alcanzar una ventana de contexto de aproximadamente 110 000 tokens con 16 GiB de VRAM libre; con MTP activado, la ventana se reduce a unos 80 000 tokens.

La relevancia de este modelo radica en que permite ejecutar localmente un LLM de 27B sin censura en hardware de consumo (tarjetas gráficas de 16 GB), algo que normalmente requeriría GPUs de mayor capacidad. La cuantización IQ4_XS ofrece una perplejidad media de 7,1481 y una correlación del 99,28 % con el modelo base, según los datos del autor. No obstante, el propio autor recomienda en la model card una versión alternativa basada en Heretic Arbitrary-Rank Ablation (Bucoid/Qwen3.8-27B-Heretic-Ara-IQ4-XS-16GB-VRAM-GGUF) por considerarla de mejor rendimiento y menor tamaño.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.8-27B base) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens (modelo base); ~110 000 sin MTP y ~80 000 con MTP en 16 GB VRAM |
| Tipos de cuantizacion | IQ4_XS (4 bits) |
| Idiomas soportados | no disponible (el modelo base Qwen3.8-27B es multilingüe, pero no se especifican idiomas concretos) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo de 12,9 GiB) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer denso de 27 000 millones de parámetros desarrollado por Alibaba, con una ventana de contexto nativa de 262 144 tokens. Sobre este modelo se aplicó un proceso de "uncensoring" (eliminación de rechazos) mediante la técnica de ablación de rango arbitrario, que modifica los pesos para reducir la probabilidad de que el modelo se niegue a responder a ciertas peticiones. Posteriormente, el autor cuantizó los pesos a 4 bits usando el esquema IQ4_XS con imatrix, una cuantización que optimiza la distribución de los valores para minimizar la pérdida de calidad. El archivo GGUF incluye además el cabezal MTP (Multi-Token Prediction) para decodificación especulativa, que acelera la generación al predecir varios tokens a la vez, aunque consume más memoria.

No se dispone de información detallada sobre el dataset de entrenamiento del modelo original ni sobre el proceso exacto de ablación aplicado. El autor no publica datos de fine-tuning adicional más allá de la eliminación de rechazos.

## Capacidades

- Generación de texto en lenguaje natural, incluyendo razonamiento, matemáticas y código, heredadas del modelo base Qwen3.8-27B.
- Ausencia de rechazos por contenido: el modelo responde a peticiones que el modelo original bloquearía, como contenido explícito o sensible.
- Decodificación especulativa MTP integrada, que acelera la inferencia en hardware compatible.
- Capacidad de ejecución local con 16 GB de VRAM, con ventana de contexto de hasta ~110 000 tokens sin MTP.
- Soporte para cuantización adicional o despliegue mediante herramientas compatibles con GGUF (llama.cpp, Ollama, etc.).
- No se confirma soporte de tool calling, vision o audio en esta versión cuantizada; el modelo base podría tenerlos, pero no hay datos en la información proporcionada.

## Casos de uso

- Generación de ficción y escritura creativa sin restricciones: el modelo puede producir narrativas, diálogos o guiones con contenido adulto o controvertido sin negarse, algo útil para autores que necesitan explorar temas sensibles.
- Asistente de investigación en ciencias sociales: permite analizar temas tabú o políticamente incorrectos desde una perspectiva académica, sin filtros automáticos que sesguen las respuestas.
- Desarrollo de chatbots de rol: su capacidad de mantener conversaciones largas (hasta ~80 000 tokens con MTP) y su falta de rechazo lo hacen adecuado para juegos de rol interactivos o simulación de personajes.
- Prototipado de aplicaciones de generación de texto en entornos con recursos limitados: al caber en una GPU de 16 GB, se puede integrar en estaciones de trabajo con RTX 4080 o similar para pruebas de concepto.
- Evaluación de técnicas de ablación y cuantización: investigadores pueden comparar el comportamiento de este modelo frente a otras cuantizaciones (como UD_IQ3_K_XL) para estudiar el impacto en la perplejidad y la distribución de probabilidad.
- Despliegue en entornos offline o con privacidad estricta: al ser un archivo GGUF, puede ejecutarse sin conexión a internet, garantizando que los datos no salgan del equipo.

## Benchmarks y rendimiento

El autor proporciona una comparación de calidad de cuantización entre este modelo (IQ4_XS) y una alternativa UD_IQ3_K_XL del mismo tamaño. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Metrica | IQ4_XS (este modelo) | UD_IQ3_K_XL (comparacion) |
|---|---|---|
| Tamano de archivo | 12,9 GB | 12,5 GB |
| Precision de cuantizacion | IQ4_XS (4 bits) | UD_IQ3_K_XL (~3 bits) |
| Perplejidad media | 7,1481 ± 0,0465 | 7,1117 ± 0,0459 |
| Correlacion PPL con modelo base | 99,28 % | 99,31 % |
| Divergencia KL media | 0,03268 ± 0,00030 | 0,03130 ± 0,00032 |
| Divergencia KL maxima | 16,017 | 21,409 |
| Cuantil 99,9 % KL | 1,075 | 1,219 |
| Tasa de acuerdo Top-1 | 91,655 % ± 0,072 % | 92,419 % ± 0,069 % |
| Cambio medio de probabilidad | -0,343 % ± 0,013 % | -0,738 % ± 0,013 % |
| Cambio RMS de probabilidad | 4,986 % ± 0,039 % | 5,120 % ± 0,046 % |

Según estos datos, el modelo IQ4_XS tiene una KL máxima menor y un cambio medio de probabilidad más cercano a cero, aunque su perplejidad media es ligeramente superior a la del UD_IQ3_K_XL.

## Requisitos de hardware

- VRAM estimada: 16 GiB libres para inferencia con contexto de ~110 000 tokens sin MTP; ~80 000 tokens con MTP activado.
- GPU recomendadas: tarjetas con 16 GB de VRAM, como NVIDIA RTX 4080, RTX 4090, RTX 5080 o A100 (aunque esta última es de centro de datos). No se recomienda para GPUs de 12 GB o menos.
- En Windows, se debe evitar usar la GPU como dispositivo de visualización principal para liberar los 16 GiB completos.
- Opciones de despliegue: llama.cpp (con soporte para MTP), Ollama, LM Studio o cualquier servidor compatible con GGUF (por ejemplo, llama-server).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,3B | 262 144 | FP8 / BF16 | Apache-2.0 | HuggingFace |
| Suseezz/Qwen3.8-27B-Uncensored-IQ4-XS-MTP-16GB-VRAM-GGUF | 27,3B | ~110 000 (sin MTP) | IQ4_XS (4 bits) | Apache-2.0 | HuggingFace |
| Bucoid/Qwen3.8-27B-Heretic-Ara-IQ4-XS-16GB-VRAM-GGUF | 27,3B | no disponible | IQ4_XS (4 bits) | Apache-2.0 | HuggingFace (recomendado por el autor) |

El autor sugiere que la versión de Bucoid (basada en Heretic Arbitrary-Rank Ablation) ofrece mejor rendimiento y menor tamaño, por lo que podría considerarse una alternativa superior dentro de la misma categoría.

## Limitaciones y advertencias

- Al ser un modelo "uncensored", puede generar contenido ofensivo, ilegal o perjudicial. No debe utilizarse en aplicaciones públicas sin moderación humana.
- La cuantización de 4 bits introduce una degradación de calidad respecto al modelo en FP8 o BF16; la perplejidad media sube a 7,1481 y la correlación con el modelo base es del 99,28 %.
- La ventana de contexto práctica se reduce significativamente con MTP activado (~80 000 tokens frente a ~110 000), y ambas cifras están muy por debajo de los 262 144 tokens del modelo original.
- No se han publicado resultados de benchmarks de tareas estándar (MMLU, HumanEval, etc.), por lo que el rendimiento real en aplicaciones concretas no está verificado.
- El autor indica que el modelo "puede ser poco impresionante" y que planea actualizarlo; no hay garantía de mantenimiento a largo plazo.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base y la técnica de ablación podrían tener restricciones adicionales no documentadas.
- No se dispone de información sobre sesgos específicos, pero al ser un modelo sin filtros, es probable que amplifique estereotipos o contenido dañino.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Suseezz/Qwen3.8-27B-Uncensored-IQ4-XS-MTP-16GB-VRAM-GGUF
- Modelo alternativo recomendado (Bucoid): https://huggingface.co/Bucoid/Qwen3.8-27B-Heretic-Ara-IQ4-XS-16GB-VRAM-GGUF
- Guía de ejecución local (orcarouter): https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Artículo sobre el GGUF uncensored (orcarouter): https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
- Guía de ejecución local (locallyuncensored): https://locallyuncensored.com/blog/how-to-run-qwen-3-8-27b-locally.html
