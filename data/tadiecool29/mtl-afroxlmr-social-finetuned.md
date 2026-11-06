# tadiecool29/MTL-AfroXLMR-Social-finetuned

## Resumen

MTL-AfroXLMR-Social-finetuned es un ajuste fino (fine-tuning) del modelo Tadesse/AfroXLMR-Social, un encoder multilingue basado en la familia XLM-R orientado a tareas de procesamiento de lenguaje natural sobre redes sociales. Lo desarrolla el usuario tadiecool29 y esta publicado en Hugging Face bajo licencia MIT. El modelo resuelve un problema de clasificacion multi-tarea (multi-task learning, MTL): a partir de un mismo texto social predice simultaneamente la postura (stance) y el sentimiento (sentiment) expresados en el mensaje.

Con 559.897.607 parametros (aproximadamente 560 millones), se situa en la gama de encoders de tamano medio, lo que lo hace ligero para inferencia y apto para despliegues con recursos moderados. Al derivarse de AfroXLMR-Social, su proposito declarado es el analisis de opinion y actitud en contenido generado por usuarios, presumiblemente con cobertura de lenguas africanas, aunque la model card no detalla la composicion idiomatica del corpus de ajuste.

Es relevante ahora porque demuestra un patron habitual en la investigacion aplicada: reutilizar un encoder multilingue preentrenado y ajustarlo con una cabeza multi-tarea para obtener clasificadores de bajo coste en dominios sociales. No obstante, la documentacion es muy escasa (la propia model card indica "More information needed" en descripcion, usos previstos y datos de entrenamiento), y el modelo no registra descargas ni interacciones, por lo que debe tratarse como un artefacto experimental mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (familia XLM-R, base AfroXLMR-Social) |
| Parametros totales | 559.897.607 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion no documentada) |
| Idiomas soportados | no disponible (heredados del modelo base AfroXLMR-Social) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer derivado de Tadesse/AfroXLMR-Social, que a su vez pertenece a la familia XLM-R (arquitectura RoBERTa multilingue). Sobre esta base se ha anadido una cabeza de clasificacion multi-tarea que produce simultaneamente predicciones de stance y sentiment, optimizadas de forma conjunta (la metrica F1 reportada es la media de ambas tareas). El tamano de 559,9 millones de parametros es coherente con un encoder XLM-R de escala base con vocabulario multilingue amplio.

El entrenamiento se realizo con el Trainer de Transformers (etiqueta generated_from_trainer) durante 10 epocas, con learning rate 1e-05, batch total de 32 (batch 16 x acumulacion de gradientes 2), optimizador AdamW fused, scheduler coseno con 300 pasos de warmup, semilla 42 y precision mixta nativa AMP. El dataset de ajuste no se especifica en la model card ("unknown dataset"). No se documenta el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un encoder de clasificacion. La curva de entrenamiento muestra sobreajuste claro: la perdida de entrenamiento cae de 1,91 a 0,12 mientras la de validacion sube desde 1,40 (epoca 1) hasta 1,91 (epoca 10), con el mejor F1 de validacion en la epoca 4 (0,7764).

## Capacidades

- Clasificacion de sentimiento: predice la polaridad emocional del texto social (metrica Sentiment F1 de 0,7572 en evaluacion).
- Deteccion de postura (stance): clasifica la posicion o actitud del autor respecto a un tema (Stance F1 de 0,7588).
- Clasificacion multi-tarea conjunta: ambas tareas se resuelven en una sola pasada de inferencia mediante cabezas compartidas.
- Procesamiento de texto multilingue: capacidad heredada del encoder base AfroXLMR-Social, orientado a lenguas africanas (sin detalle en la model card).
- Encoder de representaciones: al ser un modelo tipo BERT/XLM-R, puede emplearse para extraer embeddings de frases y alimentar otros clasificadores.
- No soporta generacion de texto, tool calling, agentes, vision ni audio: es un encoder discriminativo, no un modelo generativo.

## Casos de uso

- Monitorizacion de opinion en redes sociales: clasificar en tiempo real miles de publicaciones por sentimiento y postura para paneles de reputacion de marca, aprovechando el bajo coste de un encoder de 560 millones de parametros.
- Analisis de discurso politico y polarizacion: detectar la postura de los usuarios ante temas concretos (por ejemplo, politicas publicas) y su tono emocional en corpus multilingues africanos.
- Moderacion de comunidades: priorizar mensajes con sentimiento negativo intenso o posturas hostiles para revision humana, usando la doble salida del modelo como senal de triaje.
- Investigacion en ciencias sociales computacionales: etiquetar grandes corpus de texto social con anotaciones de stance y sentiment para estudios cuantitativos, con la ventaja de ejecutarse en una sola GPU.
- Enriquecimiento de pipelines de analitica: integrar el modelo como microservicio de inferencia por lotes que anada columnas de sentimiento y postura a datasets existentes.
- Clasificacion en entornos con recursos limitados: al ser un encoder de 2,3 GB en safetensors, puede desplegarse en CPU o en GPUs de gama media para tareas de alto volumen y baja latencia.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de evaluacion (epoca final, 10):

| Metrica | Valor |
|---|---|
| Loss | 1,9072 |
| F1 (media) | 0,7580 |
| Stance F1 | 0,7588 |
| Sentiment F1 | 0,7572 |
| Stance accuracy | 0,7494 |
| Sentiment accuracy | 0,7618 |

Mejor checkpoint intermedio observado durante el entrenamiento (epoca 4):

| Metrica | Valor |
|---|---|
| Validation loss | 1,2963 |
| F1 (media) | 0,7764 |
| Stance F1 | 0,7749 |
| Sentiment F1 | 0,7779 |
| Stance accuracy | 0,7643 |
| Sentiment accuracy | 0,7805 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; el model-index no contiene entradas.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 2,2 GB solo para pesos, mas activaciones y overhead (del orden de 3-4 GB en total).
- VRAM estimada en FP16/BF16: aproximadamente 1,1-1,5 GB para pesos, con un consumo total tipico por debajo de 2-3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060, RTX 4060 o superior es suficiente. Para lotes grandes, A10G, L4 o A100 mejoran el throughput.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de 4 GB o mas; tambien es viable en CPU para inferencia por lotes.
- Opciones de despliegue: transformers (PyTorch), Text Embeddings Inference (TEI) para encoders, ONNX Runtime, y exportacion a GGUF/llama.cpp no documentada para este modelo.
- Latencia y throughput: no disponibles; al ser un encoder de 560 millones de parametros, se esperan latencias de milisegundos por muestra en GPU y throughput alto en modo batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MTL-AfroXLMR-Social-finetuned | 559,9 M | no disponible | Clasificacion stance + sentiment | MIT | Hugging Face |
| Tadesse/AfroXLMR-Social (base) | no disponible | no disponible | Encoder multilingue social | no disponible | Hugging Face |
| XLM-RoBERTa base | ~278 M | 512 tokens (tipico) | Encoder multilingue general | MIT | Hugging Face |
| AfroXLMR (castellano de Espana: AfroXLMR-base) | ~278 M | 512 tokens (tipico) | Encoder multilingue africano | MIT | Hugging Face |

El modelo ajustado duplica aproximadamente el tamano de un XLM-R base, probablemente por el vocabulario ampliado del encoder AfroXLMR del que deriva. Frente a alternativas generativas, su ventaja es el coste de inferencia muy inferior para tareas de clasificacion; su desventaja es que no puede resolver tareas abiertas ni razonamiento. No hay datos publicados que permitan comparar su F1 con otros clasificadores de stance/sentiment sobre el mismo corpus.

## Limitaciones y advertencias

- Documentacion insuficiente: la model card no describe el dataset de entrenamiento, los idiomas cubiertos ni los usos previstos, lo que impide evaluar su validez fuera del dominio original.
- Sobreajuste evidente: la perdida de validacion aumenta a partir de la epoca 1-2 mientras la de entrenamiento cae, y el F1 final (0,7580) es inferior al mejor intermedio (0,7764); el checkpoint publicado no es el optimo.
- Riesgo de sesgo: al entrenarse sobre texto social no documentado, puede heredar sesgos demograficos, culturales y linguisticos del corpus, sin que exista una evaluacion de sesgo publicada.
- Riesgo de alucinacion: limitado en sentido estricto (es un clasificador), pero puede producir etiquetas erroneas con alta confianza en textos fuera de distribucion o idiomas no representados.
- Cobertura idiomatica incierta: se desconoce que lenguas africanas o variedades del castellano estan representadas; el rendimiento fuera de ese ambito no esta garantizado.
- Licencia MIT permisiva para uso comercial, pero sin garantias del autor ni evaluacion de robustez en produccion.
- Sin adopcion ni validacion externa: cero descargas y cero likes en el momento de la consulta, por lo que no hay evidencia de uso real ni reportes de terceros.
- Longitud de contexto no documentada: debe asumirse la del encoder base (tipicamente 512 tokens) y truncar textos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tadiecool29/MTL-AfroXLMR-Social-finetuned
- Modelo base: https://huggingface.co/Tadesse/AfroXLMR-Social
