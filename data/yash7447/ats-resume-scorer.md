# yash7447/ats-resume-scorer

## Resumen

ats-resume-scorer es un modelo de embeddings de frases (sentence transformer) obtenido mediante fine-tuning de sentence-transformers/all-mpnet-base-v2, publicado por el usuario yash7447 en Hugging Face. Su propósito es calcular la similitud semántica entre currículos y descripciones de ofertas de empleo, un paso habitual en los sistemas de seguimiento de candidaturas (ATS, Applicant Tracking Systems) para ordenar candidatos por afinidad con una vacante. Se distribuye con la librería sentence-transformers y el pipeline sentence-similarity.

Arquitectónicamente es un transformer encoder de tipo MPNet con 109.486.464 parámetros totales (unos 109,5 millones), pesos en safetensors y un repositorio de 0,4 GB. El entrenamiento se realizó con la pérdida CosineSimilarityLoss sobre un conjunto de datos de 196 ejemplos, según los metadatos de la model card, lo que lo convierte en un ajuste muy ligero sobre el modelo base más que en un modelo entrenado desde cero.

Su relevancia es acotada pero concreta: ofrece una alternativa especializada y de bajo coste computacional para tareas de matching semántico en el dominio de reclutamiento, con un rendimiento declarado por el autor de 0,7756 de correlación Pearson coseno y 0,7653 de Spearman coseno sobre su conjunto de validación. No obstante, la ausencia de licencia declarada y de información sobre idiomas limita su uso en producción sin una evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder MPNet (base: sentence-transformers/all-mpnet-base-v2) |
| Parametros totales | 109.486.464 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base all-mpnet-base-v2 admite 384 tokens, dato no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | sentence-transformers |
| Pipeline | sentence-similarity |
| Tamano del repositorio | 0,4 GB |
| Funcion de perdida | CosineSimilarityLoss |
| Tamano del dataset de entrenamiento | 196 ejemplos |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

El modelo parte de sentence-transformers/all-mpnet-base-v2, un encoder MPNet preentrenado y adaptado previamente para generar embeddings de frases. Sobre esa base se aplicó un fine-tuning con la pérdida CosineSimilarityLoss, orientada a alinear la similitud coseno entre embeddings con una puntuación de similitud objetivo. Los metadatos indican un conjunto de datos de 196 ejemplos, lo que sugiere un ajuste de dominio muy específico y de escala reducida, probablemente centrado en pares currículo-oferta.

No se dispone de información sobre el número de tokens de entrenamiento, la composición detallada del dataset, el uso de técnicas de RLHF o DPO, ni de innovaciones técnicas adicionales como decodificación especulativa o atención lineal. El modelo se limita a producir embeddings densos para similitud semántica; no es un modelo generativo. La model card incluye ejemplos de widget con pares de frase de currículo y ofertas de empleo en inglés, lo que sugiere un uso previsto en ese idioma, aunque no se declara oficialmente el soporte de idiomas.

## Capacidades

- Generación de embeddings de frases para similitud semántica (pipeline sentence-similarity).
- Extracción de características densas (feature-extraction).
- Cálculo de similitud coseno entre currículos y descripciones de ofertas de empleo.
- Ordenación y filtrado de candidatos por afinidad con una vacante en flujos de ATS.
- Procesamiento de texto en inglés según los ejemplos de la model card (no se declara oficialmente el conjunto de idiomas).
- Compatible con text-embeddings-inference y con endpoints de Hugging Face (tags endpoints_compatible).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo de embeddings, no un LLM generativo.
- No dispone de visión, audio ni modo de pensamiento.

## Casos de uso

- Filtrado inicial de candidaturas en un ATS: calcular la similitud coseno entre el embedding del currículo y el de la descripción del puesto para priorizar los perfiles más afines antes de la revisión humana. Adecuado por su bajo coste computacional (109,5 M de parámetros) y su especialización en el dominio.
- Búsqueda semántica en bases de datos de currículos: indexar embeddings de candidatos y recuperar los más próximos a una nueva oferta mediante búsqueda vectorial, aprovechando que el modelo genera representaciones densas normalizables.
- Recomendación de ofertas a candidatos: invertir el cálculo y comparar el embedding de un currículo contra un catálogo de vacantes para sugerir puestos relevantes.
- Deduplicación y agrupación de perfiles: agrupar currículos o descripciones de puestos semánticamente equivalentes para limpiar bases de datos de reclutamiento.
- Enrutamiento de candidaturas a reclutadores especializados: clasificar currículos por familia de rol (por ejemplo, ingeniería de plataforma frente a análisis de negocio) usando la similitud con plantillas de referencia.
- Prototipado rápido de sistemas de matching: al ser un modelo pequeño y compatible con text-embeddings-inference, permite desplegar un servicio de embeddings en CPU o GPU modestas para validar un producto antes de invertir en modelos mayores.
- Evaluación de calidad de currículos frente a requisitos: medir la cobertura semántica de habilidades y experiencia requeridas comparando el currículo con la oferta.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Semantic Similarity | ats val | Pearson Cosine | 0,7756 |
| Semantic Similarity | ats val | Spearman Cosine | 0,7653 |

No se han publicado en la información disponible resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos de embeddings.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,5 GB en precisión FP32 (109,5 M de parámetros), y menos de 0,3 GB en FP16. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU para cargas moderadas. Para alto throughput, una GPU consumer como RTX 3060, RTX 4090 o una T4 es más que suficiente; A100 o H100 solo tendrían sentido para servir muchas réplicas o lotes muy grandes.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: sentence-transformers (Python), text-embeddings-inference (tag endpoints_compatible), endpoints de Hugging Face. No se indica compatibilidad con llama.cpp, Ollama o vLLM en la información disponible.
- Latencia y throughput estimados: no disponibles. Al tratarse de un encoder de 109,5 M de parámetros, la latencia por frase debería ser de milisegundos en GPU y de decenas de milisegundos en CPU, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| yash7447/ats-resume-scorer | 109,5 M | no disponible | no disponible | Fine-tuning de dominio sobre 196 ejemplos para matching currículo-oferta |
| sentence-transformers/all-mpnet-base-v2 | ~109 M | 384 tokens (dato del modelo base, no confirmado en la informacion) | Apache 2.0 (modelo base, no confirmado en la informacion) | Modelo generalista de embeddings; base del anterior |
| sentence-transformers/all-MiniLM-L6-v2 | ~22 M | 256 tokens (dato del modelo base, no confirmado en la informacion) | Apache 2.0 (modelo base, no confirmado en la informacion) | Alternativa más ligera y rápida para similitud semántica general |

La comparación con alternativas especializadas en reclutamiento no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El dataset de entrenamiento es muy reducido (196 ejemplos), lo que aumenta el riesgo de sobreajuste y de baja generalización a dominios, industrias o formatos de currículo no representados.
- Los benchmarks declarados (Pearson 0,7756, Spearman 0,7653) no están verificados y proceden de un conjunto de validación propio ("ats val"), no de un benchmark público estándar.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido; es un riesgo legal relevante para producción.
- No se declaran los idiomas soportados; los ejemplos de la model card están en inglés, por lo que el rendimiento en castellano u otros idiomas es incierto.
- No se especifica la longitud máxima de contexto; textos largos podrían truncarse según los límites del modelo base.
- Riesgo de sesgos: al derivar de un modelo generalista y entrenarse con datos de reclutamiento, puede heredar sesgos de género, origen o edad presentes en los textos de entrenamiento y en las descripciones de puestos.
- No es un modelo generativo: no puede redactar currículos, justificar puntuaciones ni mantener conversaciones; solo produce embeddings.
- Con 0 descargas y 1 like, no hay evidencia comunitaria de uso ni validación externa del rendimiento.
- Para producción se recomienda evaluar con un conjunto propio de pares currículo-oferta y comparar contra el modelo base sin fine-tuning antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yash7447/ats-resume-scorer
- Modelo base: https://huggingface.co/sentence-transformers/all-mpnet-base-v2
- Paper de Sentence-BERT (referencia arxiv:1908.10084): https://arxiv.org/abs/1908.10084
- Librería sentence-transformers: https://www.sbert.net/
- Documentación de text-embeddings-inference: https://huggingface.co/docs/text-embeddings-inference
