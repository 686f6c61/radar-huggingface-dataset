# SQL499/emparejamiento-finetuned

## Resumen
El modelo `SQL499/emparejamiento-finetuned` es un modelo de embeddings de frases (sentence embeddings) obtenido mediante fine-tuning de un transformer de la familia BERT sobre una tarea de similitud semántica. Lo desarrolla el usuario SQL499 y se publica en Hugging Face bajo la librería sentence-transformers, con el pipeline `sentence-similarity`. Su propósito es transformar pares de textos (por ejemplo, currículos y ofertas de empleo) en vectores densos comparables mediante similitud coseno, de modo que pueda medirse el grado de emparejamiento entre ambos.

El modelo se ha entrenado con un conjunto de datos de 800 ejemplos y la función de pérdida `CosineSimilarityLoss`, lo que lo sitúa como un ajuste ligero y especializado más que como un modelo generalista. Con 117.653.760 parámetros y un repositorio de 0,5 GB, es manejable en hardware modesto. La información pública disponible es escasa: no se declaran licencia, idiomas ni resultados de benchmarks, y el modelo no registra descargas ni likes en el momento de la consulta.

Su relevancia actual radica en el caso de uso que se deduce de los ejemplos de la model card: emparejamiento entre perfiles profesionales (formación y experiencia) y ofertas o descripciones de puestos con competencias, en español. Es, por tanto, un modelo de nicho para sistemas de recomendación laboral o búsqueda semántica de candidatos, no un modelo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (encoder), empaquetado con sentence-transformers |
| Parametros totales | 117.653.760 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (los ejemplos de la model card estan en espanol) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
Se trata de un encoder transformer de la familia BERT con 117,6 millones de parámetros, adaptado mediante `sentence-transformers` para producir embeddings de frase. El entrenamiento se ha realizado con `CosineSimilarityLoss` sobre un conjunto de 800 ejemplos (`dataset_size:800`), lo que indica un ajuste fino supervisado sobre pares de textos con etiquetas de similitud. El modelo se marca como `generated_from_trainer`, es decir, procede de una ejecución de entrenamiento reproducible con la librería de sentence-transformers.

No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset, el uso de RLHF/DPO ni innovaciones técnicas adicionales. Los ejemplos de la model card muestran pares formados por un texto de perfil (formación y experiencia) y descripciones de puestos con sector, ocupación y competencias, lo que sugiere que el ajuste se orientó a similitud semántica en el dominio de empleo y recursos humanos en español.

## Capacidades
- Generación de embeddings de frases para similitud semántica y búsqueda vectorial.
- Extracción de características (`feature-extraction`) a partir de texto.
- Emparejamiento semántico entre textos cortos y medios, como perfiles y ofertas de empleo.
- Compatibilidad con `text-embeddings-inference` y endpoints, según las etiquetas del repositorio.
- Uso con la librería sentence-transformers para calcular similitud coseno entre pares.
- No es un modelo generativo: no produce texto, no razona de forma multi-paso ni soporta tool calling.
- Capacidades multilingües: no declaradas; los ejemplos disponibles están en español.

## Casos de uso
- Emparejamiento currículum-oferta: calcular la similitud coseno entre el embedding de un perfil profesional y el de una oferta para ordenar candidatos por afinidad; el ajuste sobre pares de este dominio lo hace adecuado para este escenario.
- Búsqueda semántica en portales de empleo: indexar ofertas como vectores y recuperar las más próximas a la consulta de un candidato, superando la búsqueda por palabras clave.
- Recomendación de puestos a candidatos: usar los embeddings para generar listas de vacantes relacionadas con la formación y experiencia de un usuario.
- Deduplicación de ofertas de empleo: detectar ofertas repetidas o casi idénticas comparando sus embeddings con un umbral de similitud.
- Clasificación y agrupamiento de perfiles: agrupar currículos por similitud semántica para análisis de talento o segmentación de candidatos.
- Filtrado previo en pipelines de selección: descartar automáticamente perfiles con baja similitud respecto a una vacante antes de la revisión humana.
- Enriquecimiento de sistemas de RRHH: generar representaciones vectoriales de competencias y ocupaciones para alimentar motores de matching internos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: en fp32, aproximadamente 0,5 GB para los pesos (117,6 M de parámetros); en fp16, alrededor de 0,25 GB. El consumo real depende del tamaño de lote y de la longitud de las secuencias.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo es pequeño y no requiere hardware de gama alta.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: sentence-transformers, Hugging Face Text Embeddings Inference (TEI), y servidores de embeddings compatibles con endpoints; también es posible exportarlo a ONNX para inferencia en CPU.
- Latencia y throughput: no disponibles; al tratarse de un BERT base, la latencia por par de textos cortos es del orden de milisegundos en GPU, pero no se han publicado cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SQL499/emparejamiento-finetuned | 117,6 M | no disponible | no disponible | Hugging Face |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | no disponible en la informacion | no disponible | no disponible | Hugging Face |
| BAAI/bge-small-en-v1.5 | no disponible en la informacion | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparativa se limita a la disponibilidad y al tamaño conocido del modelo analizado.

## Limitaciones y advertencias
- Dataset de entrenamiento muy reducido (800 ejemplos), lo que limita la generalización fuera del dominio de empleo y recursos humanos.
- No se declara licencia, por lo que el uso comercial queda sin marco legal explícito y requiere contactar con el autor.
- No se declaran idiomas soportados; los ejemplos están en español, pero no hay garantía de comportamiento en otros idiomas.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de similitudes espurias: textos con solapamiento léxico pueden recibir puntuaciones altas sin relación semántica real.
- Sesgos potenciales derivados de los datos de entrenamiento (perfiles y ofertas de un contexto laboral concreto), no documentados.
- Longitud de contexto no especificada; textos largos pueden truncarse y perder información.
- Sin descargas ni validación comunitaria: no hay evidencia pública de calidad en producción.
- No apto para generación de texto, razonamiento, código ni tareas agénticas.

## Enlaces
- Hugging Face: https://huggingface.co/SQL499/emparejamiento-finetuned
- Paper de referencia de Sentence-BERT: https://arxiv.org/abs/1908.10084
- Librería sentence-transformers: https://www.sbert.net/
