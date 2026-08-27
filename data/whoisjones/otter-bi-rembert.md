# whoisjones/otter-bi-rembert

## Resumen

Otter es un reconocedor de entidades nombradas (NER) de tipo abierto y multilingüe desarrollado por whoisjones. A diferencia de los sistemas NER tradicionales con un conjunto fijo de etiquetas, Otter permite al usuario especificar los tipos de entidad en lenguaje natural dentro de la propia entrada, por ejemplo `["person", "band", "chemical compound"]`, y devuelve los intervalos de caracteres correspondientes. No requiere ajuste fino para nuevas etiquetas: los tipos forman parte de la entrada.

Este checkpoint concreto, `otter-bi-rembert`, usa una arquitectura bi-encoder: el texto se codifica con `google/rembert` y los nombres de las etiquetas con `google-bert/bert-base-multilingual-uncased`. Los embeddings de las etiquetas solo dependen del conjunto de tipos, por lo que pueden calcularse una vez y reutilizarse en todo un corpus, lo que resulta más económico cuando se aplican los mismos tipos a muchas entradas. El modelo tiene 745,8 millones de parámetros y una longitud máxima de secuencia de 512 tokens.

La relevancia actual de este modelo radica en su capacidad para adaptarse a dominios y taxonomías nuevas sin necesidad de anotar datos ni reentrenar, algo especialmente útil en entornos multilingües y en aplicaciones donde las categorías de entidades cambian con frecuencia. Su licencia Apache 2.0 facilita su integración en proyectos comerciales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bi-encoder: text encoder RemBERT + label encoder BERT multilingual uncased |
| Parametros totales | 745.840.512 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (máximo) |
| Tipos de cuantizacion | No disponible (solo safetensors en fp32) |
| Idiomas soportados | Multilingüe (no se especifica lista concreta) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue un esquema bi-encoder. El texto de entrada se procesa con RemBERT, un transformer multilingüe de 745M parámetros, mientras que los nombres de las etiquetas se codifican con BERT multilingual uncased. Los embeddings de las etiquetas se comparan con los embeddings de los candidatos a span (intervalos de hasta 30 tokens) mediante una función de puntuación, y se seleccionan aquellos que superan un umbral configurable (por defecto 0.2, calibrado sobre la suite de evaluación).

No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de tokens, ni si se emplearon técnicas como RLHF o DPO. La model card indica que el repositorio de GitHub contiene el pipeline completo de entrenamiento, la suite de evaluación y los scripts de preparación de datos, pero no se proporcionan cifras concretas en la información disponible.

## Capacidades

- Reconocimiento de entidades nombradas de tipo abierto: el usuario define las etiquetas en lenguaje natural, sin necesidad de un esquema fijo.
- Multilingüe: al estar basado en RemBERT y BERT multilingual, soporta múltiples idiomas, aunque no se especifica la lista exacta.
- Devolución de intervalos de caracteres: cada entidad incluye `text`, `label`, `start`, `end` y `score`.
- Procesamiento por lotes: acepta listas de textos y devuelve una lista de entidades por entrada.
- Reutilización de embeddings de etiquetas: permite calcular los embeddings de las etiquetas una sola vez y aplicarlos a múltiples textos, reduciendo coste computacional.
- Umbral ajustable: se puede modificar el umbral de puntuación para priorizar precisión o recall.
- Integración con Hugging Face Transformers mediante `trust_remote_code=True`.

## Casos de uso

- Extracción de entidades en documentos legales: identificar personas, organizaciones, fechas y cláusulas en contratos o sentencias, adaptando las etiquetas al vocabulario jurídico sin reentrenar.
- Análisis de redes sociales: detectar menciones de marcas, productos o personas influyentes en publicaciones multilingües, con etiquetas como `"brand"`, `"influencer"` o `"hashtag"`.
- Procesamiento de currículums: extraer nombres, titulaciones, empresas y años de experiencia de CVs en varios idiomas, usando etiquetas como `"degree"`, `"employer"` o `"skill"`.
- Monitoreo de noticias: identificar entidades políticas, geográficas o económicas en artículos de prensa, con etiquetas dinámicas según la temática del día.
- Búsqueda semántica en bases de datos clínicas: localizar nombres de fármacos, enfermedades y síntomas en informes médicos, con etiquetas como `"drug"`, `"disease"` o `"symptom"`.
- Enriquecimiento de datos para grafos de conocimiento: extraer entidades y relaciones de textos técnicos o científicos, definiendo etiquetas específicas del dominio y reutilizando los embeddings de etiquetas en grandes volúmenes de documentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el umbral por defecto se calibró mediante macro-F1 sobre la suite de evaluación, pero no se ofrecen cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 745M parámetros en fp32, el modelo ocupa aproximadamente 2,98 GB en memoria. En fp16, unos 1,49 GB. Para procesar un batch pequeño (por ejemplo, 8 textos de 512 tokens), se recomienda al menos 4 GB de VRAM.
- GPU recomendadas: cualquier GPU con 4 GB o más, como NVIDIA GTX 1650, RTX 3050, RTX 4090, o GPUs de datacenter como A10, A100 o H100. También puede ejecutarse en CPU, aunque con mayor latencia.
- Compatibilidad con GPUs de consumo: sí, cabe en GPUs de gama media con 4-6 GB de VRAM.
- Opciones de despliegue: al ser un modelo de encoder, se puede servir con Hugging Face Transformers, ONNX Runtime, o mediante frameworks de inferencia como FastAPI. No es adecuado para vLLM o TGI, orientados a modelos generativos.
- Latencia y throughput: no se han publicado datos. En una GPU moderna, la inferencia de un texto de 512 tokens debería completarse en decenas de milisegundos, pero depende del hardware y del tamaño del batch.

## Comparativa con modelos similares

| Modelo | Arquitectura | Encoder | Parámetros | Contexto | Licencia |
|---|---|---|---|---|---|
| `otter-bi-rembert` | bi-encoder | RemBERT | 745M | 512 | Apache 2.0 |
| `otter-bi-mmbert` | bi-encoder | mmBERT-base | ~178M | 512 | Apache 2.0 |
| `otter-cross-rembert` | cross-encoder | RemBERT | 745M | 512 | Apache 2.0 |
| `otter-cross-mmbert` | cross-encoder | mmBERT-base | ~178M | 512 | Apache 2.0 |

Según la model card, los cross-encoders son más precisos, mientras que los bi-encoders son más eficientes cuando se aplica un mismo conjunto de etiquetas a un gran corpus. No se dispone de comparativas con otros modelos de NER zero-shot como GLiNER en la información proporcionada.

## Limitaciones y advertencias

- Longitud de contexto limitada a 512 tokens, por lo que textos más largos deben truncarse o dividirse.
- La longitud máxima de span es de 30 tokens, lo que puede no ser suficiente para entidades muy extensas.
- El umbral por defecto (0.2) puede no ser óptimo para todos los dominios; se recomienda recalibrarlo con datos propios si se dispone de anotaciones.
- La calidad de las etiquetas depende de la redacción en lenguaje natural: nombres ambiguos o demasiado genéricos pueden producir resultados inconsistentes.
- Al estar basado en RemBERT y BERT multilingual, puede heredar sesgos presentes en los datos de preentrenamiento de estos modelos, aunque no se han documentado sesgos específicos.
- No se han publicado resultados de benchmarks ni estudios de robustez, por lo que su rendimiento en producción debe validarse empíricamente.
- El uso de `trust_remote_code=True` implica ejecutar código personalizado del repositorio, lo que requiere revisión de seguridad en entornos controlados.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/whoisjones/otter-bi-rembert)
- [Repositorio de GitHub del proyecto Otter](https://github.com/whoisjones/otter)
- [README del proyecto en GitHub](https://github.com/whoisjones/otter/blob/main/README.md)
- [Modelo `otter-bi-mmbert`](https://huggingface.co/whoisjones/otter-bi-mmbert)
- [Modelo `otter-cross-mmbert`](https://huggingface.co/whoisjones/otter-cross-mmbert)
- [Modelo `otter-cross-rembert`](https://huggingface.co/whoisjones/otter-cross-rembert)
