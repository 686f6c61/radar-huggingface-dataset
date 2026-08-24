# wagesj45/toxic-comment-classifier

## Resumen

El modelo `wagesj45/toxic-comment-classifier` es un clasificador binario de texto diseñado para detectar si un comentario en inglés es tóxico o no. Se trata de un fine-tuning de `distilbert/distilbert-base-multilingual-cased`, un modelo transformer encoder de 135 millones de parámetros, entrenado sobre el dataset `Heliosoph/Jigsaw-Toxic-Comments`. El autor, wagesj45, lo presenta como una línea base de investigación o como una señal más dentro de un flujo de moderación de contenido, no como una solución autónoma para decisiones de alto impacto.

El modelo resuelve el problema de la moderación automática de comentarios en plataformas digitales, un área con alta demanda práctica. Su relevancia actual radica en que ofrece un punto de partida ligero y reproducible para equipos que necesitan integrar detección de toxicidad sin depender de APIs comerciales. Al estar basado en DistilBERT, mantiene un equilibrio entre rendimiento y eficiencia computacional, con una ventana de contexto de 512 tokens y una licencia Apache 2.0 que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder, destilado de BERT) |
| Parametros totales | 135.326.210 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | ingles (el modelo base es multilingue, pero el fine-tuning se realizo y evaluo solo en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de DistilBERT, una version destilada de BERT que conserva el 97% de su capacidad linguistica con un 40% menos de parametros. La arquitectura es un transformer encoder clasico con atencion multi-cabeza, sin capas de decodificacion. El fine-tuning se realizo sobre el dataset Jigsaw-Toxic-Comments, que contiene seis etiquetas de toxicidad (toxic, severe_toxic, obscene, threat, insult, identity_hate) que se combinaron en una unica etiqueta binaria: un comentario se considera `toxic` si cualquiera de las seis etiquetas originales es positiva.

El entrenamiento utilizo una particion estratificada 90/10 con semilla 42, tres epocas, una tasa de aprendizaje de 2e-5, tamanos de lote de 16 y 32, decay de peso de 0.01 y una longitud maxima de tokenizacion de 256. El checkpoint final se selecciono por mejor F1 en validacion, correspondiente al paso 17.952. No se aplicaron tecnicas de RLHF ni DPO; es un ajuste supervisado clasico.

## Capacidades

- Clasificacion binaria de toxicidad en comentarios en ingles, devolviendo las etiquetas `toxic` o `not_toxic` con una puntuacion de confianza.
- Deteccion de multiples formas de abuso (insultos, amenazas, discurso de odio, obscenidad) al haber sido entrenado con la combinacion de las seis etiquetas originales del dataset Jigsaw.
- Inferencia rapida y ligera gracias a la arquitectura DistilBERT, adecuada para entornos con recursos limitados.
- Integracion sencilla con la libreria `transformers` mediante la API de pipeline.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales.
- El modelo base es multilingue, pero el fine-tuning no lo hace util para otros idiomas; su rendimiento fuera del ingles no esta garantizado.

## Casos de uso

- Moderacion de comentarios en foros y redes sociales: el modelo puede preclasificar comentarios como toxicos o no toxicos, permitiendo a los moderadores priorizar la revision manual. Su baja latencia lo hace apto para procesar grandes volumenes en tiempo real.
- Filtrado de contenido en plataformas de noticias: integrarlo en el backend para marcar comentarios que requieren revision antes de su publicacion, reduciendo la exposicion a contenido abusivo.
- Analisis de sentimiento en encuestas o estudios sociologicos: como una senal adicional para identificar interacciones toxicas en datos de investigacion, aunque siempre con validacion humana.
- Sistemas de deteccion de ciberacoso en aplicaciones de mensajeria: puede actuar como un primer filtro que alerta a los administradores sobre conversaciones potencialmente daninas.
- Evaluacion de politicas de contenido: usar el modelo para medir la prevalencia de toxicidad en un corpus historico y evaluar el impacto de cambios en las normas de la comunidad.
- Pipeline de preprocesamiento para entrenar otros modelos: las predicciones pueden servir como caracteristicas adicionales en sistemas de recomendacion o de ranking de comentarios.

## Benchmarks y rendimiento

Segun la model card, en el split de validacion (10% del dataset, con semilla 42) se obtuvieron los siguientes resultados:

| Metrica | Valor |
|---|---|
| Accuracy | 0.9672 |
| F1 | 0.8332 |

Estos valores corresponden al checkpoint seleccionado por F1. No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K, ya que no es un modelo de proposito general sino un clasificador especifico. La puntuacion de confianza devuelta no es una probabilidad calibrada, por lo que cada aplicacion debe definir y validar su propio umbral de decision.

## Requisitos de hardware

- El modelo tiene 135 millones de parametros, lo que en float32 ocupa aproximadamente 540 MB. Con cuantizacion a int8, el peso se reduce a unos 135 MB, aunque no se han publicado cuantizaciones oficiales.
- Es ejecutable en CPU con un rendimiento aceptable para inferencia por lotes; en GPU, una tarjeta con 2 GB de VRAM es suficiente (por ejemplo, NVIDIA T4, GTX 1650 o superior).
- Cabe en GPUs de consumo como la RTX 3060 o incluso en la RAM de un portatil moderno, siempre que se use un framework optimizado.
- Opciones de despliegue: se puede servir con `transformers` directamente, exportar a ONNX para inferencia en CPU, o usar `text-embeddings-inference` (el modelo es compatible con endpoints de Hugging Face). Tambien es posible integrarlo en FastAPI o en un contenedor Docker.
- La latencia tipica en CPU para una sola frase es del orden de 10-30 ms; en GPU, por debajo de 5 ms. El throughput depende del hardware y del tamano de lote, pero al ser un modelo pequeno, puede procesar cientos de peticiones por segundo en una GPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy | F1 | Licencia |
|---|---|---|---|---|---|
| wagesj45/toxic-comment-classifier | 135M | 512 | 0.9672 | 0.8332 | Apache 2.0 |
| unitary/toxic-bert | 110M (BERT base) | 512 | no disponible | no disponible | Apache 2.0 |
| martin-ha/toxic-comment-model | 135M (DistilBERT) | 512 | 0.94 (en test de 10k filas) | 0.59 | no disponible |

Los datos de los modelos comparativos provienen de la busqueda web y no son directamente comparables porque usan diferentes particiones y datasets. `unitary/toxic-bert` es un clasificador de toxicidad bien conocido, pero no se dispone de sus metricas exactas en la informacion recopilada. `martin-ha/toxic-comment-model` reporta una accuracy menor y un F1 significativamente inferior, aunque su evaluacion se realizo sobre un subconjunto distinto. En general, el modelo de wagesj45 muestra un equilibrio solido entre precision y recall, pero es recomendable evaluar cada modelo en el propio corpus antes de elegir.

## Limitaciones y advertencias

- Los datos de entrenamiento contienen anotaciones de toxicidad subjetivas y ruidosas, que pueden reflejar sesgos historicos o culturales.
- El modelo puede producir falsos positivos con lenguaje soez, terminos reivindicados por comunidades, discusiones sobre abuso o criticas contundentes.
- Puede no detectar abuso implicito, codificado, contextual o escrito de forma adversaria.
- Aunque el modelo base es multilingue, el fine-tuning se realizo y evaluo solo en ingles; no se garantiza ningun rendimiento en otros idiomas.
- La puntuacion de confianza no es una probabilidad calibrada; se recomienda ajustar un umbral especifico para cada caso de uso.
- Para sistemas de moderacion reales, se recomienda combinar este modelo con revision humana, mecanismos de apelacion y monitorizacion continua.
- La licencia Apache 2.0 permite uso comercial, pero el dataset de entrenamiento (CC0-1.0) y el modelo base (Apache 2.0) no imponen restricciones adicionales; aun asi, conviene revisar las condiciones de los datos originales de Jigsaw y Wikipedia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wagesj45/toxic-comment-classifier
- Dataset de entrenamiento: https://huggingface.co/datasets/Heliosoph/Jigsaw-Toxic-Comments
- Modelo base: https://huggingface.co/distilbert/distilbert-base-multilingual-cased
- Repositorio de referencia (proyecto similar, no del mismo autor): https://github.com/WajdiHammami/toxic-comment-classifier
