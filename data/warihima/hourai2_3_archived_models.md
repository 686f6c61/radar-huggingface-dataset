# WariHima/hourai2_3_archived_models

## Resumen

`WariHima/hourai2_3_archived_models` es un repositorio de modelos archivados de la familia Hourai, publicados por el usuario WariHima en Hugging Face. No se trata de un modelo unico, sino de un contenedor que agrupa varios checkpoints descartados o retirados de uso activo por el autor, tal como indica la model card (en japones): modelos de embedding y modelos de tareas NLP (clasificacion de sentimiento, subjetividad, toxicidad y NER) de las generaciones hourai2 y hourai3.

El repositorio incluye pesos en formato safetensors y GGUF, con un total declarado de 9.725.008 parametros en safetensors, aunque ese dato corresponde a la suma o al mayor de los checkpoints incluidos y no a un unico modelo coherente. El tamano del repo es de 0,8 GB. No se declara pipeline, licencia ni idiomas soportados de forma explicita.

La relevancia de este repositorio es limitada: su interes es documental o arqueologico para quien siga la evolucion de la familia Hourai, no como modelo listo para produccion. El propio autor indica que estos modelos fueron sustituidos por alternativas de mayor rendimiento (modelos de embedding basados en RWKV de 20k a 60k parametros y un modelbert wmm de 10m para tareas NLP), por lo que se archivan como referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no especifica arquitectura por checkpoint) |
| Parametros totales | 9.725.008 (dato agregado de safetensors) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (presente en varios checkpoints); niveles concretos no disponibles |
| Idiomas soportados | no disponible (varios checkpoints llevan sufijo `-ja`, lo que sugiere japones) |
| Licencia | no disponible |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna de cada checkpoint. La model card lista nombres de modelos que permiten inferir la composicion del repositorio: modelos de embedding (`hourai2-10m-embedding`, `hourai2-50m-embedding`, `hourai3-7m-embedding-ja`), variantes con dimension reducida (`hourai2-10m-64dim-embedding`, `hourai2-pl-2m-32dim`), modelos base (`hourai2-50m-base`, `hourai3-7m-base-ja`), un encoder a nivel de telefono (`hourai2-pl-*`) y clasificadores de tareas NLP de 90m (`hourai3-ja-sentiment-binary-90m-v1`, `hourai3-ja-subjectivity-90m-v1`, `hourai3-ja-toxicity-90m-v1`, `hourai3-ner-ja-90m-v1`).

No se especifican datos de entrenamiento (numero de tokens, composicion del dataset), ni si hubo RLHF, DPO o cualquier otra fase de ajuste. Tampoco se documentan innovaciones tecnicas. El unico dato contextual relevante es el motivo de archivo: los modelos de embedding fueron reemplazados por modelos RWKV de 20k a 60k parametros con rendimiento superior, y los clasificadores NLP fueron sustituidos por un modelbert wmm de 10m. La model card menciona ademas un `hourai4-unused-draft` sin detallar.

## Capacidades

- Generacion de embeddings de frases y de telefonos (checkpoints `*-embedding` y `*-pl-*`), en varias dimensiones (32, 64 y dimension completa).
- Clasificacion de sentimiento binario en japones (`hourai3-ja-sentiment-binary-90m-v1`).
- Deteccion de subjetividad en japones (`hourai3-ja-subjectivity-90m-v1`).
- Deteccion de toxicidad en japones (`hourai3-ja-toxicity-90m-v1`).
- Reconocimiento de entidades nombradas en japones (`hourai3-ner-ja-90m-v1`).
- Modelos base de 7m y 50m parametros (`hourai3-7m-base-ja`, `hourai2-50m-base`) para ajuste posterior.
- Soporte de tool calling, function calling, agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision o audio: no disponibles.
- Capacidades multilingues: no documentadas; los sufijos `-ja` apuntan a un foco en japones.

## Casos de uso

- Recuperacion semantica en japones con modelos ligeros: los checkpoints de embedding de 7m a 50m parametros permiten indexar y buscar documentos en un corpus japones con un coste computacional minimo, aunque el autor los considera inferiores a sus sustitutos RWKV.
- Clasificacion de sentimiento en resenas o tickets: `hourai3-ja-sentiment-binary-90m-v1` puede etiquetar polaridad binaria en texto japones en pipelines de analitica de opinion.
- Moderacion de contenido en japones: `hourai3-ja-toxicity-90m-v1` sirve como filtro preliminar de toxicidad, siempre que se valide su calidad frente al modelbert que lo sustituyo.
- Extraccion de entidades en documentos japoneses: `hourai3-ner-ja-90m-v1` permite identificar personas, organizaciones y lugares en textos estructurados o no estructurados.
- Deteccion de subjetividad para curación de datasets: `hourai3-ja-subjectivity-90m-v1` ayuda a separar opiniones de hechos al construir corpus de entrenamiento.
- Investigacion sobre la evolucion de modelos pequenos: el repositorio sirve como referencia historica para comparar checkpoints de 7m a 90m parametros de la familia Hourai y entender que configuraciones fueron descartadas y por que.
- Despliegue en entornos con recursos muy limitados: las variantes GGUF de pocos millones de parametros pueden ejecutarse en CPU o en GPUs de gama baja para pruebas de concepto, sin garantias de calidad de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma agregada; los checkpoints individuales van de 2m a 90m parametros, por lo que en fp32 un modelo de 90m ocupa aproximadamente 0,36 GB y uno de 10m unos 0,04 GB, sin contar overhead.
- GPU recomendadas: no disponibles; por tamano, cualquier GPU consumer moderna (RTX 3060 o superior) o incluso CPU es suficiente para los checkpoints mas pequenos.
- Cabe en GPU consumer: si, con amplio margen, dado el tamano reducido de los checkpoints.
- Opciones de despliegue: llama.cpp u Ollama para las variantes GGUF; safetensors requiere frameworks de inferencia estandar (PyTorch, transformers) aunque no se documenta compatibilidad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| hourai2_3_archived_models | 9.725.008 (agregado) | no disponible | no disponible | Hugging Face | Repositorio de modelos archivados, sin benchmarks |
| Sustitutos citados por el autor (RWKV 20k-60k) | 20k-60k | no disponible | no disponible | no disponible en el repo | Segun el autor, rendimiento superior en embedding |
| modelbert wmm 10m | 10m | no disponible | no disponible | no disponible en el repo | Sustituto de los clasificadores NLP de 90m |

No se dispone de datos suficientes para comparar con alternativas publicas de la misma categoria.

## Limitaciones y advertencias

- Repositorio de modelos archivados: el autor los retira por haber sido superados por alternativas propias, por lo que no se recomienda su uso en produccion.
- Ausencia de licencia declarada: no se puede asumir permiso para uso comercial ni redistribucion.
- Sin informacion sobre sesgos, evaluacion de calidad ni datos de entrenamiento.
- Riesgo de alucinacion no evaluado en los modelos base; los clasificadores pueden producir falsos positivos y negativos sin metricas publicadas.
- Cobertura idiomatica no documentada; el foco parece ser el japones, con posible rendimiento pobre en castellano u otros idiomas.
- Contexto maximo desconocido, lo que impide planificar su uso en documentos largos.
- El dato de parametros totales (9.725.008) es agregado y no representa un unico modelo; conviene tratarlo con cautela.
- La model card esta en japones y no incluye instrucciones de uso, plantillas de prompt ni ejemplos de inferencia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/WariHima/hourai2_3_archived_models
- No se han encontrado otros enlaces (papers, blogs, repos o demos) en la informacion disponible.
