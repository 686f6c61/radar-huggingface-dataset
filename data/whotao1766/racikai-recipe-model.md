# whotao1766/racikai-recipe-model

## Resumen

racikai-recipe-model es un modelo de embeddings de frases (sentence-transformers) publicado por el usuario whotao1766 en HuggingFace, obtenido mediante fine-tuning del modelo multilingue intfloat/multilingual-e5-base. Su funcion es generar representaciones vectoriales densas de textos para tareas de similitud semantica y recuperacion de informacion (retrieval), con un enfasis claro en el dominio culinario: las consultas y pasajes de ejemplo que acompanan a la model card son recetas de cocina y consultas sobre ingredientes.

El modelo se ha entrenado con la libreria sentence-transformers y la funcion de perdida MultipleNegativesRankingLoss sobre un conjunto de datos de 4000 ejemplos, segun los metadatos declarados por el autor. El pipeline registrado es sentence-similarity / feature-extraction, con etiquetas que indican compatibilidad con text-embeddings-inference y endpoints. El repositorio ocupa 0,3 GB y los pesos estan en formato safetensors.

La relevancia de esta ficha es limitada pero util como caso de estudio: se trata de un modelo de nicho, sin descargas ni likes en el momento de la consulta, sin licencia declarada y sin resultados de benchmarks publicados. Aun asi, ilustra un patron habitual y muy replicable: adaptar un encoder multilingue generalista (E5) a un dominio concreto (recetas) mediante un dataset pequeno de pares consulta-pasaje, algo que cualquier equipo puede reproducir para sus propios dominios verticales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo XLM-RoBERTa, con pooling para sentence-transformers (modelo base: multilingual-e5-base) |
| Parametros totales | no disponible en la informacion proporcionada; el modelo base intfloat/multilingual-e5-base tiene aproximadamente 278 M de parametros |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el modelo base admite 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/ONNX declaradas en el repositorio) |
| Idiomas soportados | no disponible (el modelo base es multilingue; los ejemplos de la model card incluyen consultas en indonesio y pasajes en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder de frases derivado de intfloat/multilingual-e5-base, que a su vez es un XLM-RoBERTa-base adaptado mediante entrenamiento contrastivo multilingue. La libreria declarada es sentence-transformers, con pipeline de sentence-similarity y feature-extraction, y la funcion de perdida empleada en el fine-tuning es MultipleNegativesRankingLoss, una perdida contrastiva por lotes en la que el resto de ejemplos del batch actuan como negativos. Esta combinacion es la habitual para tareas de retrieval denso: se optimiza que la representacion de una consulta quede mas cerca de su pasaje positivo que de los negativos.

Los metadatos indican un dataset_size de 4000 ejemplos, generado_from_trainer, y la model card incluye widgets con pares consulta-pasaje de recetas (consultas en indonesio del tipo "query: resep Strawberry Smoothie" y pasajes con titulo, ingredientes e instrucciones). No se especifica la composicion exacta del dataset, si hubo filtrado, ni si se aplicaron tecnicas adicionales como hard negatives, destilacion o decodificacion especulativa (esta ultima no aplica a un modelo de embeddings). Tampoco se documenta el numero de pasos, epocas, tasa de aprendizaje ni la estrategia de evaluacion. La etiqueta arxiv:1908.10084 corresponde al paper de Sentence-BERT y arxiv:1807.03748 a Representation Learning with Contrastive Predictive Coding, referencias metodologicas habituales en este tipo de modelos.

## Capacidades

- Generacion de embeddings de frases y pasajes para similitud semantica y busqueda densa (dense retrieval).
- Extraccion de caracteristicas (feature-extraction) a nivel de frase, utilizable como entrada de clasificadores posteriores.
- Recuperacion de informacion en dominio culinario: dada una consulta sobre ingredientes, platos o recetas, devuelve los pasajes mas similares semanticamente.
- Soporte multilingue heredado del modelo base, con evidencia de uso cruzado de idiomas en los ejemplos (consulta en indonesio, pasajes en ingles).
- Compatibilidad declarada con text-embeddings-inference y endpoints, lo que facilita el despliegue como servicio de embeddings.
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento: son capacidades ajenas a un encoder de similitud.
- No es un modelo generativo: no produce texto, solo vectores.

## Casos de uso

- Busqueda semantica en un recetario propio: indexar todas las recetas como pasajes y permitir consultas en lenguaje natural ("que puedo cocinar con bok choy y manzana") recuperando las recetas mas afines, tal como muestran los ejemplos de la model card.
- Recomendacion por ingredientes disponibles: dado un inventario de ingredientes introducido por el usuario, recuperar recetas compatibles mediante similitud coseno entre el embedding de la consulta y los de cada receta.
- Deduplicacion y agrupacion de recetas: calcular embeddings de todo el catalogo y agrupar por cercania para detectar recetas duplicadas o variantes casi identicas antes de publicarlas.
- Clasificacion y etiquetado automatico: usar los embeddings como caracteristicas de entrada a un clasificador ligero que asigne categorias (postre, coctel, entrante) o cocinas nacionales.
- Moderacion y control de calidad de contenido: comparar recetas nuevas contra un conjunto de referencia para detectar copias, contenido incompleto o instrucciones anomalas.
- Internacionalizacion de catalogos: gracias a la naturaleza multilingue del modelo base, permite que un usuario consulte en su idioma y recupere recetas escritas en otro, sin traduccion previa.
- Sistemas RAG sobre documentacion gastronomica: emplear el modelo como recuperador en un pipeline de generacion aumentada, alimentando a un LLM generativo con las recetas relevantes recuperadas.
- Agrupacion de consultas de usuarios: analizar logs de busqueda para descubrir temas recurrentes mediante clustering de los embeddings de las consultas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (ni MTEB, ni recall@k, ni MRR) y no se han encontrado datos de rendimiento en la busqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia: con aproximadamente 278 M de parametros en el modelo base, el peso en fp32 ronda 1,1 GB, en fp16 unos 550 MB y en int8 unos 280 MB, mas el overhead de activaciones y del tokenizador.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060, RTX 4090, e incluso en GPUs con 4-6 GB. Tambien es viable en CPU para cargas moderadas.
- GPU recomendadas para produccion: NVIDIA T4 o L4 para servicios de embeddings a bajo coste, A10G o A100/H100 para indexados masivos o alto throughput.
- Opciones de despliegue: sentence-transformers (referencia), text-embeddings-inference (declarado en las etiquetas), HuggingFace Inference Endpoints (etiqueta endpoints_compatible) y servidores propios con FastAPI o similares. No se declaran variantes GGUF, por lo que llama.cpp y Ollama no estan soportados de forma directa.
- Latencia y throughput: no disponibles. Como referencia orientativa del orden de magnitud para un encoder de ~278 M de parametros, en GPU moderna se suelen alcanzar cientos de frases por segundo en lotes pequenos, pero no hay medicion publicada para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Estado |
|---|---|---|---|---|---|
| whotao1766/racikai-recipe-model | ~278 M (heredados del base) | no disponible (base: 512) | Recetas / culinario | no disponible | Publicado, sin descargas ni benchmarks |
| intfloat/multilingual-e5-base | ~278 M | 512 tokens | Generalista multilingue | MIT (segun su model card publica) | Modelo de referencia, ampliamente usado |
| intfloat/multilingual-e5-small | ~118 M | 512 tokens | Generalista multilingue | MIT (segun su model card publica) | Alternativa mas ligera |
| BAAI/bge-m3 | ~568 M | hasta 8192 tokens | Generalista multilingue, retrieval hibrido | MIT (segun su model card publica) | Referencia actual en retrieval multilingue |

La comparacion es desigual por diseno: racikai-recipe-model es un fine-tuning de nicho sobre multilingual-e5-base, por lo que hereda sus caracteristicas tecnicas pero no dispone de la documentacion, mantenimiento ni evaluacion del modelo original. Sin benchmarks publicados no es posible afirmar que mejore al base en el dominio culinario.

## Limitaciones y advertencias

- Ausencia de benchmarks: no hay ninguna metrica publicada que demuestre que el fine-tuning mejora al modelo base en retrieval de recetas. Cualquier uso en produccion deberia ir precedido de una evaluacion propia con datos del dominio.
- Licencia no declarada: al no especificarse licencia en el repositorio, no hay autorizacion explicita de uso comercial. Hay que contactar con el autor o tratar el modelo como no apto para produccion hasta aclararlo. El modelo base multilingual-e5-base si declara licencia MIT, pero eso no cubre los pesos derivados.
- Riesgo de sobreajuste: 4000 ejemplos de entrenamiento es un volumen pequeno para un encoder de 278 M de parametros; es plausible un sobreajuste al estilo de redaccion de las recetas del dataset.
- Sesgo de dominio y de idioma: aunque el modelo base es multilingue, los ejemplos de la model card muestran consultas en indonesio y pasajes en ingles, lo que sugiere un sesgo hacia esa combinacion idiomatica. El rendimiento en castellano no esta documentado.
- Alucinacion no aplica en sentido generativo (el modelo no produce texto), pero si puede devolver recuperaciones irrelevantes si la distribucion de la consulta se aleja del dominio de entrenamiento.
- Limitacion de contexto: al heredar el base, los documentos largos que superen los 512 tokens deberan trocearse, con la perdida de coherencia que ello implica.
- Trazabilidad: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia, sin documentacion adicional. No hay garantia de mantenimiento ni de soporte.
- Resultados de la busqueda web: las busquedas realizadas no devolvieron informacion relevante sobre este modelo; los resultados obtenidos eran de tematicas no relacionadas (foros y preguntas sin conexion con el modelo).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/whotao1766/racikai-recipe-model
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-base
- Paper de Sentence-BERT: https://arxiv.org/abs/1908.10084
- Paper de Representation Learning with Contrastive Predictive Coding: https://arxiv.org/abs/1807.03748
- Libreria sentence-transformers: https://www.sbert.net/
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference

No se han encontrado en la busqueda web articulos, papers ni repositorios adicionales relacionados con este modelo concreto.
