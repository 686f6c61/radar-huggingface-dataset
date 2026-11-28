# varsha100704/ats-scorer-mpnet

## Resumen

ats-scorer-mpnet es un modelo de embeddings de frases obtenido mediante fine-tuning de sentence-transformers/all-mpnet-base-v2, publicado por el usuario varsha100704 en Hugging Face. Su proposito declarado, a tenor del nombre y de los ejemplos de la model card, es puntuar la adecuacion entre curriculos y ofertas de empleo (un "ATS scorer", es decir, un sistema de seguimiento de candidatos), calculando similitud semantica entre un texto de candidato y textos de ofertas laborales.

Tecnicamente es un encoder MPNet de 109.486.464 parametros (unos 109,5 millones), con pesos en formato safetensors y un tamano de repositorio de 0,4 GB. Se ha entrenado con la libreria sentence-transformers usando la perdida CosineSimilarityLoss sobre un conjunto de datos de tan solo 196 ejemplos, segun las etiquetas de la model card. El modelo base, all-mpnet-base-v2, es un encoder denso ampliamente utilizado para similitud semantica general.

La relevancia de esta ficha es acotada: se trata de un experimento de ajuste fino de un modelo pequeno, con cero descargas y cero "likes" en el momento de la consulta, sin licencia declarada ni idiomas especificados. Resulta util como referencia para quien quiera replicar un pipeline de scoring de curriculos con sentence-transformers, pero no debe considerarse un modelo listo para produccion sin una evaluacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder MPNet (base: sentence-transformers/all-mpnet-base-v2) |
| Parametros totales | 109.486.464 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base all-mpnet-base-v2 admite hasta 384 tokens, dato no declarado en esta ficha) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con text-embeddings-inference) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dimension de embedding | no disponible en la informacion proporcionada (el modelo base produce 768 dimensiones) |
| Funcion de perdida | CosineSimilarityLoss |
| Tamano del dataset de entrenamiento | 196 ejemplos |

## Arquitectura y entrenamiento

El modelo es un encoder denso basado en MPNet, la arquitectura propuesta en el paper "MPNet: Masked and Permuted Pre-training for Language Understanding" (arXiv:1908.10084). Se inicializa desde sentence-transformers/all-mpnet-base-v2 y se ajusta con la perdida CosineSimilarityLoss propia de sentence-transformers, orientada a tareas de similitud semantica entre pares de frases. La salida es un vector denso por texto, adecuado para busqueda por similitud coseno.

El entrenamiento se realizo sobre un conjunto de 196 ejemplos, un volumen muy reducido que limita severamente la generalizacion y hace probable un sobreajuste al dominio concreto de los pares curriculo-oferta utilizados. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). El modelo se genero con la libreria sentence-transformers y esta marcado como "generated_from_trainer".

## Capacidades

- Generacion de embeddings de frases para similitud semantica (pipeline sentence-similarity).
- Extraccion de caracteristicas densas (feature-extraction) para busqueda vectorial y clustering.
- Puntuacion de adecuacion curriculo-oferta: el caso de uso principal segun el nombre y los ejemplos de la model card.
- Comparacion semantica entre un texto de candidato y multiples ofertas en una sola llamada (widget con source_sentence y varias sentences).
- Compatible con text-embeddings-inference y endpoints de Hugging Face.
- No se declara soporte de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo "thinking".
- Capacidades multilingues: no disponibles segun la informacion proporcionada.

## Casos de uso

- Filtrado inicial de candidatos en un ATS: calcular la similitud coseno entre el embedding del curriculo y el de la descripcion del puesto para ordenar candidatos antes de la revision humana; el modelo esta ajustado especificamente para este tipo de pares.
- Busqueda semantica de ofertas para un candidato: indexar las ofertas como embeddings y consultar con el embedding del curriculo para recuperar las vacantes mas afines, superando la coincidencia literal de palabras clave.
- Deduplicacion y agrupamiento de ofertas: agrupar descripciones de empleo semanticamente equivalentes mediante clustering sobre los embeddings generados.
- Enriquecimiento de pipelines de RRHH: generar una puntuacion de afinidad como senal adicional en un sistema de recomendacion de empleo, combinada con reglas de negocio (ubicacion, anos de experiencia, titulaciones).
- Prototipado y evaluacion de arquitecturas de matching: servir como baseline ligero (0,4 GB, 109,5 M de parametros) para comparar con modelos de embeddings mayores antes de escalar.
- Clasificacion y extraccion de caracteristicas en textos de RRHH: usar los embeddings como entrada a un clasificador descendente (por ejemplo, para categorizar ofertas por familia profesional).

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Similitud semantica | ats val | Pearson cosine | 0,7964 |
| Similitud semantica | ats val | Spearman cosine | 0,7831 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los valores anteriores corresponden a un conjunto de validacion propio de 196 ejemplos y no son comparables con benchmarks estandar.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,44 GB solo para pesos (109,5 M de parametros x 4 bytes), mas activaciones y overhead del runtime; en la practica, menos de 1 GB.
- En fp16: aproximadamente 0,22 GB para pesos; en int8, unos 0,11 GB.
- Cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU para cargas moderadas.
- Despliegue recomendado: sentence-transformers (Python), text-embeddings-inference (el modelo esta marcado como endpoints_compatible), o exportacion a ONNX para inferencia en CPU.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera un throughput alto en GPU, pero no hay cifras declaradas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| varsha100704/ats-scorer-mpnet | 109,5 M | no disponible | no disponible | Hugging Face (0 descargas) | Fine-tuning de 196 ejemplos sobre all-mpnet-base-v2 |
| sentence-transformers/all-mpnet-base-v2 | ~109 M | 384 tokens (segun documentacion del modelo base) | Apache-2.0 (segun el modelo base) | Hugging Face, ampliamente usado | Modelo general de similitud semantica; base del anterior |
| sentence-transformers/all-MiniLM-L6-v2 | ~22 M | 256 tokens (segun documentacion del modelo base) | Apache-2.0 (segun el modelo base) | Hugging Face, muy extendido | Alternativa mas ligera y rapida, menor calidad en algunos benchmarks |

La comparativa con alternativas especificas de scoring de curriculos no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado con solo 196 ejemplos: alto riesgo de sobreajuste y de generalizacion deficiente fuera del dominio exacto de los datos de entrenamiento.
- Sin licencia declarada: no se puede asumir uso comercial permitido; es necesario contactar con el autor o verificar la licencia del modelo base.
- Sin idiomas declarados: no hay garantia de rendimiento en castellano ni en otros idiomas distintos del ingles de los ejemplos de la model card.
- Sin descargas ni validacion de la comunidad: los resultados de la model card no estan verificados ("verified": false) y no hay evidencia externa de calidad.
- Riesgo de sesgo: al puntuar curriculos puede amplificar sesgos presentes en los datos de entrenamiento (genero, origen, edad, instituciones), con implicaciones legales en seleccion de personal.
- Riesgo de alucinacion no aplica en sentido estricto (es un encoder, no un generador), pero la similitud coseno puede producir puntuaciones engañosas si los textos son muy desiguales en longitud o dominio.
- Limitacion de contexto: al heredar el encoder MPNet, los textos largos (curriculos extensos) pueden truncarse; conviene trocear el texto antes de generar embeddings.
- No apto para produccion sin evaluacion propia en el dominio objetivo y sin revision humana de las decisiones de filtrado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/varsha100704/ats-scorer-mpnet
- Modelo base: https://huggingface.co/sentence-transformers/all-mpnet-base-v2
- Paper de MPNet: https://arxiv.org/abs/1908.10084
- Libreria sentence-transformers: https://www.sbert.net/
- Documentacion de text-embeddings-inference: https://huggingface.co/docs/text-embeddings-inference
