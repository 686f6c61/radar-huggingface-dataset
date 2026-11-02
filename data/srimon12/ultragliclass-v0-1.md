# Srimon12/ultragliclass-v0.1

## Resumen

UltraGliClass v0.1 es un clasificador de texto zero-shot de aproximadamente 154 millones de parametros desarrollado por Srimon Danguria. Combina el encoder `dmis-lab/UltraBERT-150M` con la cabeza uni-encoder de GLiClass, el framework de clasificacion zero-shot de Knowledgator. El modelo recibe un texto, una lista de etiquetas y, opcionalmente, una instruccion, y puntua todas las etiquetas en un unico forward pass, lo que permite clasificacion de una sola etiqueta, multietiqueta, deteccion de intenciones y decisiones de tipo si/no o puntuacion.

La relevancia de esta version radica en su entrenamiento para entradas largas y muchas etiquetas: la tercera etapa de entrenamiento uso secuencias de hasta 8.192 tokens y hasta 256 etiquetas, algo que los modelos GLiClass base (ModernBERT-base y DeBERTa-v3-base) no cubren por defecto. En la suite zero-shot de 14 conjuntos de GLiClass obtiene un macro-F1 medio de 0,688, frente a 0,558 de gliclass-modern-base-v3.0 y 0,673 de gliclass-base-v3.0, con mejoras claras en deteccion de intenciones con muchas etiquetas y en entradas largas.

Es un modelo unicamente en ingles, con licencia Apache-2.0 en codigo y pesos, aunque el autor advierte de una cuestion legal abierta: las etapas 1 y 2 se entrenaron con filas de `tasksource/tasksource-jev-typed-decisions` bajo licencia CC-BY-SA, y la etapa 3 parte de esos pesos, por lo que la ausencia de obligaciones share-alike no esta garantizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiClass uni-encoder (clasificacion zero-shot) sobre encoder UltraBERT-150M |
| Parametros totales | 153.823.745 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens entrenados y evaluados; el encoder soporta hasta 32.768 posiciones, pero no probadas con este checkpoint |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 (con advertencia sobre datos de entrenamiento CC-BY-SA en etapas 1 y 2) |
| Formato de pesos | safetensors |
| Etiquetas maximas por pasada | 256 |
| Modelo base | dmis-lab/UltraBERT-150M |
| Libreria | gliclass (transformers >= 5.20.2, gliclass == 0.1.21) |
| Tamano del repositorio | 0,6 GB |

## Arquitectura y entrenamiento

El modelo es un uni-encoder de clasificacion: el texto y las etiquetas candidatas se codifican conjuntamente y la cabeza GLiClass produce una puntuacion por etiqueta en un solo forward pass, sin generar texto. El encoder es UltraBERT-150M, soportado nativamente en Transformers 5.20 y posteriores, por lo que no requiere `trust_remote_code`. El tokenizador se entreno sin espacio de prefijo (`add_prefix_space=False`).

El entrenamiento se estructuro en tres etapas. La etapa final (Stage 3) uso entradas de hasta 8.192 tokens y hasta 256 etiquetas, y es el checkpoint publicado. Los datos provienen de `knowledgator/gliclass-v2.0`, `knowledgator/gliclass-v3-logic-dataset`, `tasksource/tasksource-jev-typed-decisions`, `LocalLLaMA/typed-decisions`, `DeepPavlov/hwu64`, `coastalcph/lex_glue`, `zeroshot/twitter-financial-news-topic`, `zeroshot/twitter-financial-news-sentiment` y `google-research-datasets/go_emotions`. La etapa 3 elimino las filas share-alike de sus datos nuevos, pero parte de los pesos de la etapa 2 y reproduce datos de esa etapa. No se detalla en la informacion disponible el volumen total de tokens ni el uso de RLHF o DPO.

## Capacidades

- Clasificacion zero-shot de texto en modo single-label y multi-label.
- Deteccion de intenciones (intent detection) con hasta 256 etiquetas en una sola pasada.
- Decisiones de tipo eleccion, si/no y puntuacion sobre entradas largas (hasta 8.192 tokens entrenados).
- Acepta una instruccion opcional junto al texto y las etiquetas para orientar la clasificacion.
- Puntuacion de todas las etiquetas en un unico forward pass, con umbral configurable.
- Capacidad de contexto largo: entradas de hasta 8.192 tokens evaluadas; el encoder admite hasta 32.768 posiciones sin garantia de calidad.
- No soporta generacion de texto, codigo, matematicas, vision, audio, tool calling ni razonamiento multi-paso: es exclusivamente un clasificador.

## Casos de uso

- Enrutamiento de tickets de soporte: clasificar cada incidencia entrante contra un conjunto amplio de categorias (facturacion, incidencias tecnicas, reclamaciones, etc.) en una sola pasada, aprovechando que admite hasta 256 etiquetas sin reentrenar.
- Deteccion de intenciones en asistentes conversacionales: mapear la utterance del usuario a una de las intenciones del sistema, con buen rendimiento en conjuntos con muchas clases como CLINC-150 (0,636 de accuracy con las 150 etiquetas en una pasada).
- Moderacion y triaje de contenido: clasificacion multietiqueta de textos de redes sociales o foros (emociones, tema, sentimiento) usando los conjuntos de estilo GoEmotions y noticias financieras como referencia de entrenamiento.
- Analisis de documentos largos: clasificar contratos, correos o informes de hasta 8.192 tokens sin truncar, algo critico en decisiones que dependen de informacion distribuida a lo largo del documento (0,664 de accuracy en decisiones Jev largas).
- Clasificacion de resenas y feedback de producto: asignar topicos y sentimiento de forma zero-shot sin necesidad de anotar datos propios, util para arrancar un pipeline de analitica de voz del cliente.
- Filtrado y priorizacion en pipelines de datos: etiquetar grandes volumenes de texto para enrutar a revision humana o a modelos mayores, dado el bajo coste de un modelo de 154 millones de parametros.
- Cumplimiento y revision documental: decisiones binarias o de eleccion (aprobar, rechazar, escalar) sobre textos con contexto largo, como facturas o solicitudes con justificacion extensa.

## Benchmarks y rendimiento

Resultados de una unica ejecucion sobre los test splits completos, mismo harness y misma GPU (Kaggle 2x T4) para todos los modelos, el 2 de noviembre de 2026.

| Metrica | UltraGliClass v0.1 | gliclass-modern-base-v3.0 | gliclass-base-v3.0 |
|---|---|---|---|
| Suite zero-shot GLiClass de 14 conjuntos, macro-F1 medio | 0,688 | 0,558 | 0,673 |
| 12 conjuntos estrictamente zero-shot, macro-F1 | 0,663 | 0,586 | 0,668 |
| Banking77, 77 etiquetas en una pasada (accuracy) | 0,584 | 0,318 | 0,454 |
| CLINC-150, 150 etiquetas en una pasada (accuracy) | 0,636 | 0,473 | 0,608 |
| Decisiones Jev largas a 8.192 tokens (accuracy, n = 431) | 0,664 | 0,434 | 0,415 |

Diferencias reportadas por el autor: +0,130 (IC 95% [+0,124, +0,136]) frente a gliclass-modern-base-v3.0 en la suite de 14 conjuntos; +0,015 [+0,009, +0,020] frente a gliclass-base-v3.0 en 14 conjuntos y empate en los 12 estrictamente zero-shot (delta -0,005, IC 95% [-0,011, +0,000]). En entradas largas de 8.192 tokens supera a modern-base en +0,230 [+0,167, +0,300] (McNemar p = 7,1e-13) y a base-v3 en +0,248 [+0,180, +0,316] (p = 1,3e-14). gliclass-base-v3.0 es mejor en sst5 (0,338 vs 0,239), 20 Newsgroups (0,505 vs 0,420), spam (0,625 vs 0,581), cap_sotu (0,465 vs 0,435) y snips (0,926 vs 0,913). La accuracy en CLINC-150 (0,636) queda por debajo del umbral fijado antes de la etapa 3 (0,650, valor de la etapa 2), aceptado de forma consciente por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 154 millones de parametros, en fp32 ocupa aproximadamente 0,6 GB de pesos; en fp16 alrededor de 0,3 GB. La memoria adicional depende de la longitud de entrada (hasta 8.192 tokens) y del numero de etiquetas (hasta 256).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para entradas cortas; para entradas de 8.192 tokens se recomienda al menos 16 GB (T4, RTX 4090, A100, H100). El autor uso Kaggle 2x T4 para entrenamiento y evaluacion.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, siempre que se ajuste el `max_length` a la memoria disponible.
- Opciones de despliegue: la libreria oficial `gliclass` con `GLiClassModel` y `ZeroShotClassificationPipeline` sobre Transformers >= 5.20.2; tambien es posible servirlo con frameworks de inferencia estandar de Transformers. No se confirma soporte especifico de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles. El coste escala con la longitud de entrada y el numero de etiquetas por pasada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto entrenado | Etiquetas por pasada | Macro-F1 suite 14 | Licencia |
|---|---|---|---|---|---|
| UltraGliClass v0.1 | 153,8 M | 8.192 tokens | 256 | 0,688 | Apache-2.0 (con caveat CC-BY-SA) |
| gliclass-modern-base-v3.0 | no disponible (ModernBERT-base) | no disponible | no disponible | 0,558 | no disponible |
| gliclass-base-v3.0 | no disponible (DeBERTa-v3-base) | no disponible | no disponible | 0,673 | no disponible |

UltraGliClass v0.1 destaca frente a los dos modelos GLiClass base en escenarios de muchas etiquetas y entradas largas; gliclass-base-v3.0 mantiene ventaja en algunos conjuntos clasicos de clasificacion corta (sst5, 20 Newsgroups, spam, cap_sotu, snips). No se dispone de datos de parametros, contexto ni licencia de los modelos comparados en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidades multilingues declaradas.
- Entradas superiores a 8.192 tokens no han sido probadas con este checkpoint; el tokenizador fija `model_max_length` en 8.192 y cualquier ventana mayor requiere medir accuracy, memoria y latencia por cuenta propia.
- La licencia Apache-2.0 de los pesos queda matizada por el uso de datos CC-BY-SA en las etapas 1 y 2; la aplicacion de clausulas share-alike a pesos de modelos es legalmente incierta. Si se necesitan pesos sin datos share-alike, el autor recomienda no usar v0.1.
- La accuracy en CLINC-150 (0,636) queda por debajo del objetivo interno de 0,650, lo que indica margen de mejora en deteccion de intenciones con muchas clases.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de clasificaciones erroneas o sobreconfiadas en dominios alejados de los datos de entrenamiento; conviene calibrar el umbral por caso de uso.
- No es un modelo generativo: no sirve para resumen, traduccion, codigo ni conversacion.
- El pipeline de `gliclass` no reajusta automaticamente `max_length` ni `max_classes`; es obligatorio pasar `max_length=8192` y `max_classes=256` para reproducir el comportamiento entrenado.
- El tokenizador debe cargarse con `add_prefix_space=False`; un ajuste incorrecto degrada la tokenizacion.
- Sesgos especificos no documentados en la informacion disponible; al entrenarse con datos de redes sociales y noticias financieras, puede heredar sesgos de esos dominios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Srimon12/ultragliclass-v0.1
- Modelo base UltraBERT-150M: https://huggingface.co/dmis-lab/UltraBERT-150M
- Repositorio de codigo, receta de entrenamiento y resultados: https://github.com/srimon12/ultragliclass
- Framework GLiClass: https://github.com/Knowledgator/GLiClass
- Paper GLiClass (arXiv 2508.07662): https://arxiv.org/abs/2508.07662
- Paper adicional citado (arXiv 2610.15028): https://arxiv.org/abs/2610.15028
- Dataset knowledgator/gliclass-v2.0: https://huggingface.co/datasets/knowledgator/gliclass-v2.0
- Dataset knowledgator/gliclass-v3-logic-dataset: https://huggingface.co/datasets/knowledgator/gliclass-v3-logic-dataset
- Dataset tasksource/tasksource-jev-typed-decisions: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
