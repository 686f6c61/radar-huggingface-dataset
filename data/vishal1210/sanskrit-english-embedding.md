# vishal1210/sanskrit-english-embedding

## Resumen

El modelo `vishal1210/sanskrit-english-embedding` es un modelo de embeddings de texto bilingüe (sánscrito-inglés) basado en `intfloat/multilingual-e5-small`, desarrollado por el usuario vishal1210 y publicado en Hugging Face. Está diseñado para tareas de similitud semántica, búsqueda semántica y recuperación de información entre textos en sánscrito e inglés, un caso de uso relevante para la digitalización de corpus clásicos y la construcción de sistemas de búsqueda multilingüe en el ámbito de la indología.

Se trata de un modelo de tipo Sentence Transformer que mapea frases a un espacio vectorial denso de 384 dimensiones, con una ventana de contexto máxima de 512 tokens. Con 117,6 millones de parámetros, es un modelo compacto que puede ejecutarse en hardware modesto, incluida CPU. Fue afinado mediante aprendizaje contrastivo con la pérdida `MultipleNegativesRankingLoss` sobre un conjunto de datos de 1.120 pares de frases, lo que lo convierte en una solución ligera pero especializada para la recuperación bilingüe sánscrito-inglés.

La relevancia de este modelo radica en su carácter específico para un par de idiomas con pocos recursos digitales, como el sánscrito. Al partir de un modelo multilingüe generalista y afinarlo con datos bilingües, ofrece una alternativa práctica para tareas de búsqueda y comparación de textos en estos idiomas, aunque su pequeño conjunto de entrenamiento limita su generalización fuera del dominio de los datos utilizados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SentenceTransformer (BertModel + Pooling medio + Normalización L2) |
| Parámetros totales | 117.653.760 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Sáncscrito, inglés |
| Licencia | no disponible (el modelo base tiene licencia MIT) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura del modelo `intfloat/multilingual-e5-small`, un Transformer de tipo BERT preentrenado de forma multilingüe. La estructura exacta es un `SentenceTransformer` compuesto por tres módulos: un `BertModel` que genera embeddings de tokens, un `Pooling` con estrategia `mean` que agrega los embeddings de los tokens en un vector de frase, y un módulo `Normalize` que aplica normalización L2 sobre el vector resultante. La función de similitud recomendada es la similitud coseno.

El entrenamiento se realizó mediante aprendizaje contrastive con la función de pérdida `MultipleNegativesRankingLoss`, una técnica habitual para tareas de búsqueda semántica y recuperación. El conjunto de datos de entrenamiento consta de 1.120 muestras, que según los ejemplos de la model card parecen consistir en pares de frases en sánsito e inglés, procedentes probablemente del Bhagavad Gita. No se ha publicado información detallada sobre el proceso de entrenamiento, número de épocas, o si se utilizaron técnicas adicionales como hard negative mining. El modelo se genera con la librería `sentence-transformers` y es compatible con `text-embeddings-inference` y endpoints de Hugging Face.

## Capacidades

- Generación de embeddings de frases en sánscrito e inglés para similitud semántica y búsqueda.
- Búsqueda semántica multilingüe: permite recuperar textos en sánsito a partir de consultas en inglés y viceversa.
- Soporte para clasificación de textos, clustering y agrupación de documentos mediante los embeddings generados.
- Similitud entre frases con función coseno (el modelo normaliza los embeddings, por lo que la similitud coseno es equivalente al producto escalar).
- Compatible con el ecosistema `sentence-transformers` para integración directa en pipelines de NLP.
- Capacidad de procesar textos de hasta 512 tokens por frase.
- Soporte de uso en CPU y GPU, con bajo consumo de recursos.

## Casos de uso

- Búsqueda semántica en corpus sánscritos: permite buscar pasajes del Bhagavad Gita u otros textos clásicos usando consultas en inglés, lo que facilita la investigación académica y el estudio comparado.
- Recuperación de información para aplicaciones de traducción asistida: un traductor puede usar el modelo para encontrar frases similares en ambos idiomas y sugerir traducciones coherentes.
- Sistemas de preguntas y respuestas sobre textos religiosos: se puede integrar en un pipeline de retrieval para responder preguntas en inglés con pasajes sánscritos relevantes.
- Clasificación de documentos bilingües: los embeddings permiten agrupar o clasificar textos sánscritos e ingleses según su contenido temático.
- Parafraseo y detección de similitud: útil para identificar frases equivalentes en ambos idiomas en corpus paralelos o para comprobar la coherencia de traducciones.
- Indexación de bibliotecas digitales: las instituciones con colecciones de manuscritos sánscritos pueden usar este modelo para crear índices semánticos consultables en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se aportan métricas como MMLU, HumanEval o MTEB para este modelo. Tampoco se comparan con otros modelos de embeddings bilingües en la model card. Se recomienda evaluar el modelo en el caso de uso concreto antes de desplegarlo en producción.

## Requisitos de hardware

- VRAM estimada: el modelo tiene ~117,6M de parámetros, lo que en FP32 ocupa aproximadamente 470 MB. Con cuantización a FP16, el peso se reduce a ~235 MB, y en int8 a ~118 MB. Es viable en GPU con 2 GB de VRAM o incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, como una NVIDIA GTX 1050 Ti, RTX 2060, o modelos integrados de gama baja. No requiere hardware de datacenter.
- CPU: puede ejecutarse en CPU sin problema, con latencia del orden de milisegundos para frases cortas (inferencia de embeddings).
- Opciones de despliegue: se puede usar con la librería `sentence-transformers` directamente, o con `text-embeddings-inference` para servir embeddings a escala. También compatible con Hugging Face Inference Endpoints.
- Latencia y throughput: no hay datos oficiales. En una CPU moderna, la codificación de una frase de 50 tokens suele tardar entre 10 y 50 ms; en GPU, menos de 5 ms. El throughput depende del hardware, pero al ser un modelo pequeño, se pueden procesar miles de frases por minuto en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Uso |
|---|---|---|---|---|---|
| `vishal1210/sanskrit-english-embedding` | 117,6M | 512 tokens | Sánscrito, inglés | No disponible | Embeddings bilingües específicos |
| `intfloat/multilingual-e5-small` | 117,6M | 512 tokens | 100+ idiomas | MIT | Embeddings multilingües generales |
| `sentence-transformers/LaBSE` | 471M | 512 tokens | 109 idiomas | Apache 2.0 | Embeddings multilingües para búsqueda |
| `ai4bharat/indic-bert` | 43M | 512 tokens | 12 idiomas indios | MIT | Embeddings para lenguas indias (no incluye sánscrito) |

El modelo se diferencia de su base (multilingual-e5-small) por el ajuste fino específico para sánscrito-inglés, lo que debería mejorar la calidad de los embeddings en este par de idiomas, aunque no hay datos que lo confirmen. LaBSE es una alternativa más general y con más parámetros, pero no está especializada en sánscrito. IndicBERT no soporta sánscrito, por lo que no es comparable directamente.

## Limitaciones y advertencias

- El modelo se entrenó con un conjunto de datos muy pequeño (1.120 muestras), lo que limita su generalización fuera del dominio de los textos de entrenamiento (probablemente el Bhagavad Gita). Puede no funcionar bien con vocabulario sánscrito técnico, de otras épocas o de otras fuentes.
- No se ha publicado la licencia del modelo, lo que impide su uso comercial sin clarificar los términos. El modelo base `multilingual-e5-small` tiene licencia MIT, pero el modelo afinado puede tener restricciones adicionales.
- No hay información sobre sesgos o riesgos de alucinación, pero al ser un modelo de embeddings no genera texto, por lo que el riesgo de alucinación es inexistente. Sin embargo, la calidad de los embeddings puede estar sesgada por el dominio de entrenamiento.
- El contexto máximo de 512 tokens puede ser limitante para textos largos; para documentos extensos será necesario truncar o segmentar el texto.
- No hay benchmarks públicos que avalen su rendimiento en tareas estándar, por lo que se recomienda evaluarlo en el caso de uso concreto antes de su despliegue.
- No se conoce la composición exacta del dataset de entrenamiento ni el proceso de limpieza de datos, lo que dificulta la reproducibilidad y la evaluación de sesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vishal1210/sanskrit-english-embedding
- Modelo base `intfloat/multilingual-e5-small`: https://huggingface.co/intfloat/multilingual-e5-small
- Documentación de `sentence-transformers`: https://sbert.net
- Repositorio de `sentence-transformers` en GitHub: https://github.com/UKPLab/sentence-transformers
- Repositorio de código relacionado (Harshal279): https://github.com/Harshal279/-Sanskrit-English-Multilingual-Embedding-Model
- Repositorio de código relacionado (ShrihariChikhalkar): https://github.com/ShrihariChikhalkar/Train-Fine-Tune-a-Multilingual-Embedding-Model-for-Sanskrit-English-Retrieval
