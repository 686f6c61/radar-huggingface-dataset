# yjoonjang/stsb-quora-distilroberta-linear-merge

## Resumen

`yjoonjang/stsb-quora-distilroberta-linear-merge` es un modelo cross-encoder de demostración creado mediante la función nativa de fusión de modelos (`CrossEncoder.merge`) de la librería Sentence Transformers. Combina dos checkpoints ya existentes —`cross-encoder/stsb-distilroberta-base` y `cross-encoder/quora-distilroberta-base`— usando el método lineal con pesos `[0.5, 0.5]`. El resultado es un modelo que hereda las capacidades de ambos: por un lado, la puntuación de similitud semántica entre pares de frases (entrenado en STS benchmark) y, por otro, la detección de preguntas duplicadas (entrenado en Quora Duplicate Questions).

Con 82,1 millones de parámetros, se trata de un modelo compacto basado en la arquitectura DistilRoBERTa, pensado para tareas de ranking de texto (text-ranking) y compatible con el ecosistema de Sentence Transformers. Su relevancia actual radica en que ejemplifica el flujo de fusión de modelos dentro de la propia librería, permitiendo combinar especializaciones sin necesidad de reentrenar desde cero. No obstante, es importante señalar que se trata de una demostración técnica, no de un modelo afinado para una tarea concreta, y que no se han publicado métricas de rendimiento propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en DistilRoBERTa (transformer encoder) |
| Parametros totales | 82.119.683 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada de DistilRoBERTa, tipicamente 512 tokens) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en float16) |
| Idiomas soportados | no disponibles (los modelos base estan entrenados principalmente en ingles) |
| Licencia | no disponible (se aplican las licencias de los modelos base; la model card advierte que algunos pueden ser no comerciales) |
| Formato de pesos | safetensors (float16) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder, lo que significa que recibe un par de frases concatenadas y produce una puntuacion unica de relevancia o similitud. La arquitectura subyacente es DistilRoBERTa, una version destilada de RoBERTa con 6 capas, 12 cabezas de atencion y una dimension oculta de 768, lo que explica sus 82 millones de parametros. Al ser un cross-encoder, no genera embeddings independientes para cada frase, sino que procesa el par completo, lo que suele dar mejor precision en tareas de ranking a costa de mayor coste computacional por par.

El entrenamiento no ha sido un proceso clasico de fine-tuning, sino una fusion de dos checkpoints ya entrenados. El metodo `linear` con pesos `[0.5, 0.5]` promedia los pesos de ambos modelos capa a capa. Los modelos base fueron entrenados respectivamente en el dataset STS benchmark (similitud semantica, puntuacion 0-1) y en Quora Duplicate Questions (probabilidad de que dos preguntas sean duplicadas). No se ha aplicado RLHF ni DPO; se trata de una operacion puramente aritmetica sobre los pesos.

## Capacidades

- Puntuacion de similitud semantica entre pares de frases, heredada del modelo STS (salida en rango 0-1).
- Deteccion de preguntas duplicadas, heredada del modelo Quora (probabilidad de duplicidad).
- Ranking de texto: puede ordenar pares (query, documento) por relevancia.
- Compatible con la API `CrossEncoder.predict` de Sentence Transformers para inferencia directa.
- Soporte para integracion en pipelines de retrieval aumentado (RAG) como reranker.
- Capacidades multilingues limitadas: los modelos base estan entrenados principalmente en ingles, por lo que el rendimiento en otros idiomas es incierto.

## Casos de uso

- Reranking en sistemas de recuperacion de informacion: dado un conjunto de candidatos obtenidos por busqueda bi-encoder, el modelo puede reordenarlos por relevancia semantica. Su tamano reducido permite ejecutarlo en tiempo real sobre listas cortas.
- Deteccion de preguntas duplicadas en foros o sistemas de soporte: puede identificar si una nueva consulta del usuario ya ha sido respondida en una base de conocimiento, ahorrando tiempo de atencion manual.
- Validacion de pares de frases en pipelines de datos: por ejemplo, comprobar si dos descripciones de producto se refieren al mismo item, o si dos titulares de noticias tratan el mismo evento.
- Filtrado de resultados en busqueda semantica: como paso posterior a un retriever, para descartar resultados irrelevantes antes de pasarlos a un LLM generativo.
- Evaluacion de similitud en tareas de NLP: util como baseline para medir la coherencia de respuestas generadas o la parafrasis en sistemas de QA.
- Demostracion educativa de fusion de modelos: sirve como ejemplo practico de como combinar especializaciones con `CrossEncoder.merge`, util para experimentos de investigacion o formacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas propias (como Spearman correlation en STS o accuracy en Quora) para el modelo fusionado. Dado que es una demostracion de la funcionalidad de merge, se espera que su rendimiento sea intermedio entre los dos modelos base, pero no hay datos que lo confirmen.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 82M parametros. En float16, los pesos ocupan aproximadamente 164 MB; con overhead de activaciones y el procesamiento de pares, se puede ejecutar con menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente. Una NVIDIA GTX 1060 de 6 GB o superior puede ejecutarlo sin problemas. Incluso en CPU es viable para lotes pequenos.
- Compatibilidad con consumer GPU: si, es un modelo muy ligero.
- Opciones de despliegue: se puede usar directamente con Sentence Transformers (`CrossEncoder`). Tambien es compatible con servidores de inferencia como vLLM o Text Generation Inference (TGI) si se convierte al formato adecuado, aunque al ser un cross-encoder, el flujo tipico es via la API de Python.
- Latencia y throughput: no hay datos publicados, pero por su tamano, en una GPU moderna (p.ej. RTX 3090) se pueden procesar cientos de pares por segundo con batch adecuado.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea principal | Contexto | Licencia |
|---|---|---|---|---|
| `cross-encoder/stsb-distilroberta-base` | 82M | Similitud semantica (STS) | 512 tokens | Apache 2.0 (segun su card) |
| `cross-encoder/quora-distilroberta-base` | 82M | Deteccion de preguntas duplicadas | 512 tokens | Apache 2.0 (segun su card) |
| `yjoonjang/stsb-quora-distilroberta-linear-merge` | 82M | Fusion de ambas tareas | 512 tokens (estimado) | no disponible |

La comparativa se limita a los dos modelos base, ya que no hay otros modelos fusionados similares publicados con los que contrastar. El modelo fusionado no supera necesariamente a sus padres en sus respectivas tareas; su valor es la combinacion de capacidades.

## Limitaciones y advertencias

- Es un modelo de demostracion, no afinado para produccion. No se han validado sus metricas en tareas reales.
- La licencia no esta especificada en el repositorio. La model card indica que se aplican las licencias de los modelos base, pero no las detalla. Algunos modelos base de Sentence Transformers (como ciertos SPLADE) tienen restricciones no comerciales; aunque los dos usados aqui parecen ser Apache 2.0, conviene verificarlo antes de uso comercial.
- Sesgos: al estar entrenado sobre datos de Quora y STS (mayoritariamente ingles), puede mostrar sesgos culturales y linguisticos propios de esos datasets.
- Riesgo de alucinacion: al ser un cross-encoder, no genera texto, por lo que el riesgo de alucinacion es nulo. Sin embargo, sus puntuaciones pueden ser poco calibradas fuera del dominio de entrenamiento.
- Limitaciones de contexto: la longitud maxima de entrada esta limitada por DistilRoBERTa (tipicamente 512 tokens), lo que impide procesar documentos largos de una sola vez.
- Rendimiento incierto en idiomas distintos del ingles: no hay garantias de calidad en espanol u otros idiomas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/yjoonjang/stsb-quora-distilroberta-linear-merge
- Modelo base STS: https://huggingface.co/cross-encoder/stsb-distilroberta-base
- Modelo base Quora: https://huggingface.co/cross-encoder/quora-distilroberta-base
- Libreria Sentence Transformers: https://github.com/UKPLab/sentence-transformers
- Pagina personal del autor: https://yjoonjang.github.io/
