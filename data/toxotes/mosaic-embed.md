# Toxotes/mosaic-embed

## Resumen

MOSAIC-Embed es un modelo de embeddings orientado a recuperación (retrieval) en el dominio financiero turco, desarrollado por Toxotes (Mehmet Taha Toy y Ahmet Ali Süzen) como parte de la arquitectura MOSAIC, un sistema federado de generación aumentada por recuperación (RAG) con preservación de privacidad para sucursales bancarias turcas. Se trata de un fine-tuning de `intfloat/multilingual-e5-small` sobre pares consulta-pasaje construidos a partir de documentos bancarios y financieros en turco.

El modelo resuelve un problema concreto: la recuperación de pasajes relevantes en colecciones documentales distribuidas entre sucursales, donde cada sucursal solo devuelve sus mejores pasajes y una sede central los fusiona. Con 117,6 millones de parámetros y una dimensión de embedding de 384, es un modelo compacto pensado para despliegue en entornos con recursos limitados.

Es relevante porque sustituye a una versión anterior (`Toxotes/mosaic-turkembed-finetuned`) que rendía peor que su modelo base, y porque demuestra mejoras medibles en un benchmark federado real: +0,044 MRR@10 en preguntas cloze y +3,2 puntos de exactitud extremo a extremo en el pipeline completo. Su licencia MIT facilita la adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder), fine-tuning de `intfloat/multilingual-e5-small` |
| Parametros totales | 117.653.760 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (longitud maxima de secuencia en entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | turco (tr); el modelo base es multilingue, pero el fine-tuning se realizo solo en turco |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension de embedding | 384 |
| Tamano del repo | 0,5 GB |
| Libreria | sentence-transformers |

## Arquitectura y entrenamiento

El modelo es un transformer encoder tipo BERT con 384 dimensiones de embedding, derivado de `intfloat/multilingual-e5-small`. Sigue la convencion de prefijos de e5: `query: ` para consultas y `passage: ` para pasajes. El entrenamiento se realizo con `MultipleNegativesRankingLoss`, sin pasajes duplicados dentro de un lote, con tamano de lote 64, tasa de aprendizaje 2e-5, longitud maxima de secuencia 256 y precision mixta. Se entrenaron 6 epocas y se selecciono la epoca 4 sobre un conjunto de desarrollo retenido.

Los datos de entrenamiento consisten en 6.629 pares consulta-pasaje extraidos de 6.482 fragmentos, mas 731 consultas de 720 fragmentos adicionales reservados para seleccion de modelo. Las consultas son preguntas naturales generadas por Qwen3-8B para cada fragmento, ademas de consultas cloze construidas a partir de oraciones que contienen una unica cifra. Los pasajes son fragmentos de 600 caracteres con solapamiento de 120 caracteres, procedentes de textos financieros turcos: divulgaciones de empresas, documentos regulatorios y del banco central, y material de preguntas y respuestas bancarias. Se usaron negativos in-batch y un negativo duro minado por consulta (rango 3-30 bajo el modelo base, eliminando casi duplicados del positivo). Cada fragmento que contenia la oracion fuente de cualquier pregunta de evaluacion fue eliminado antes del entrenamiento, y las preguntas generadas se filtraron para que terminaran en signo de interrogacion y no copiaran secuencias de seis o mas palabras del pasaje.

## Capacidades

- Generacion de embeddings de texto para similitud semantica y recuperacion de pasajes (feature-extraction, sentence-similarity).
- Recuperacion densa (dense retrieval) en dominio financiero y bancario en turco.
- Soporte de RAG federado: disenado para que cada nodo devuelva sus mejores pasajes y una sede central los fusione.
- Manejo de consultas cloze sobre cifras concretas (tasas de interes, importes, plazos).
- Compatible con Text Embeddings Inference (TEI) y endpoints de Hugging Face.
- No soporta tool calling, agentes, vision ni audio: es exclusivamente un modelo de embeddings.
- Capacidad multilingue limitada: aunque el modelo base es multilingue, el fine-tuning se realizo unicamente sobre turco.

## Casos de uso

- Recuperacion en RAG bancario federado: cada sucursal indexa sus documentos localmente y devuelve sus 10 mejores pasajes; la sede central fusiona resultados. El modelo esta entrenado y evaluado exactamente para este escenario.
- Busqueda de normativa y documentacion regulatoria: recuperacion de pasajes de documentos del banco central y regulatorios turcos ante consultas sobre requisitos o procedimientos concretos.
- Atencion al cliente interna: recuperacion de respuestas en material de preguntas y respuestas bancarias para asistentes de empleados de sucursal.
- Extraccion de cifras concretas: las consultas cloze sobre tasas de interes, comisiones o plazos se benefician de la mejora de +0,044 MRR@10 frente al modelo base.
- Indexacion de divulgaciones de empresas: recuperacion de fragmentos relevantes en memorias anuales y comunicaciones financieras de empresas turcas.
- Pipeline RAG completo con re-ranking: combinado con `cross-encoder/mmarco-mMiniLMv2-L12-H384-v1` sobre los 20 mejores candidatos y Gemma-3-4B para generacion, alcanza 89,6% de exactitud exact-match en preguntas cloze.
- Despliegue en entornos con recursos limitados: con 117,6 M de parametros y embeddings de 384 dimensiones, cabe en CPU o GPU de gama baja para indexacion y busqueda a escala moderada.

## Benchmarks y rendimiento

Benchmark de recuperacion federada entre sucursales MOSAIC: 22.192 pasajes de dos sucursales bancarias; 600 preguntas cloze sobre una cifra en un pasaje de la otra sucursal y 419 versiones parafraseadas. Metrica MRR@10 en entorno federado (cada sucursal devuelve sus 10 mejores pasajes y la sede central los fusiona).

| Modelo | Preguntas cloze | Preguntas parafraseadas |
|---|---|---|
| multilingual-e5-small (base) | 0,887 | 0,796 |
| mosaic-turkembed-finetuned (version anterior) | 0,829 | 0,730 |
| **MOSAIC-Embed (este modelo)** | **0,931** | **0,803** |
| multilingual-e5-small + re-ranking cross-encoder | 0,838 | 0,844 |
| **MOSAIC-Embed + re-ranking cross-encoder** | **0,868** | **0,848** |

Diferencia frente al modelo base: +0,044 MRR@10 en cloze (IC 95% [0,027, 0,061]) y +0,007 en parafraseadas (IC 95% [-0,015, 0,028]). Hit@10 en cloze sube de 0,950 a 0,983. El re-ranker es `cross-encoder/mmarco-mMiniLMv2-L12-H384-v1` aplicado sobre los 20 mejores candidatos.

Exactitud extremo a extremo con el mismo pipeline federado (top 10 por sucursal, re-ranking, top 3 pasajes a Gemma-3-4B): en 500 preguntas cloze, la exactitud exact-match sube del 86,4% con el modelo base al 89,6% con MOSAIC-Embed (+3,2 puntos, IC 95% [1,6, 5,0], McNemar p < 0,001); en 352 preguntas parafraseadas no hay cambio significativo (78,4% frente a 77,8%).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (117,6 M de parametros, aproximadamente 0,47 GB de pesos) y alrededor de 0,25 GB en fp16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona sin problemas en GTX 1650, RTX 3060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en CPU para cargas moderadas.
- Opciones de despliegue: sentence-transformers, Text Embeddings Inference (TEI), vLLM (soporte de embeddings), Hugging Face Inference Endpoints (compatible con endpoints).
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera throughput alto en GPU y aceptable en CPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Rendimiento (MRR@10 cloze) | Licencia |
|---|---|---|---|---|---|
| **MOSAIC-Embed** | 117,6 M | 256 | 384 | 0,931 | MIT |
| multilingual-e5-small (base) | 117,6 M | 512 | 384 | 0,887 | MIT |
| mosaic-turkembed-finetuned | no disponible | no disponible | no disponible | 0,829 | no disponible |

La comparativa se limita al modelo base y a la version anterior del mismo autor, ya que no se han publicado comparaciones con otros modelos de embeddings turcos o financieros en la informacion disponible. Frente al modelo base, MOSAIC-Embed mejora la recuperacion en preguntas cloze pero esta practicamente empatado en preguntas parafraseadas; con re-ranking, el modelo base recupera parte de la ventaja en parafraseadas (0,844 frente a 0,848).

## Limitaciones y advertencias

- La mejora es clara para preguntas que piden una cifra o afirmacion concreta en un pasaje; en preguntas libremente parafraseadas el modelo esta a la par del modelo base.
- Las consultas de entrenamiento fueron generadas por un modelo de lenguaje (Qwen3-8B) sin revision manual, lo que puede introducir sesgos o artefactos en la distribucion de consultas.
- El modelo se entreno y evaluo sobre la coleccion documental de una unica institucion; no se ha medido su rendimiento en otros corpus financieros turcos.
- Aunque el modelo base es multilingue, el fine-tuning se realizo solo en turco; el rendimiento en otros idiomas no esta garantizado.
- Longitud de contexto de 256 tokens, inferior a los 512 del modelo base; los pasajes largos deben fragmentarse.
- Riesgo de alucinacion: no aplica directamente al ser un modelo de embeddings, pero los errores de recuperacion pueden propagarse al generador en un pipeline RAG.
- Licencia MIT: permite uso comercial sin restricciones significativas, pero se recomienda citar el trabajo original.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en la fecha de creacion de la ficha, por lo que no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Toxotes/mosaic-embed
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Version anterior: https://huggingface.co/Toxotes/mosaic-turkembed-finetuned
- Repositorio MOSAIC: https://github.com/tahatoy/mosaic-federated-rag
- Re-ranker usado en la evaluacion: https://huggingface.co/cross-encoder/mmarco-mMiniLMv2-L12-H384-v1
