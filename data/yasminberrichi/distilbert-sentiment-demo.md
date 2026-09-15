# yasminberrichi/distilbert-sentiment-demo

## Resumen

`yasminberrichi/distilbert-sentiment-demo` es un modelo de clasificación de texto (análisis de sentimiento) publicado en HuggingFace por el usuario yasminberrichi. Se trata de un ajuste fino (*fine-tuning*) de `distilbert-base-uncased`, la variante destilada de BERT, sobre un conjunto de datos que el autor no identifica en la model card ("on an unknown dataset"). El repositorio tiene 66.955.010 parámetros en formato safetensors, ocupa 0,5 GB y se distribuye bajo licencia Apache 2.0.

El modelo resuelve la tarea estándar de clasificación binaria o multiclase de sentimiento, aunque la model card no especifica el número de etiquetas ni su significado. Se entrenó durante 2 épocas con un *learning rate* de 2e-05, batch de 16, optimizador AdamW fused y semilla 42, y reporta una pérdida de evaluación de 0,4249 y una exactitud de 0,8480 según la descripción textual de la tarjeta (0,8583 según la tabla de resultados de entrenamiento, con una discrepancia que se detalla más abajo).

La relevancia de esta ficha es acotada: el modelo cuenta con 0 descargas y 0 *likes*, no incluye información sobre el dataset, los idiomas, los usos previstos ni las limitaciones, y el `model-index` no contiene resultados de benchmarks estándar. Es, por tanto, un artefacto de demostración o de práctica de entrenamiento, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT-base) |
| Parametros totales | 66.955.010 (dato real de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base `distilbert-base-uncased` admite 512 tokens |
| Tipos de cuantizacion | no disponible en la model card; al ser un encoder estandar es exportable a ONNX y cuantizable a INT8 dinamico |
| Idiomas soportados | no disponible; el modelo base se entreno principalmente con texto en ingles sin distincion de mayusculas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Pipeline | text-classification |
| Modelo base | distilbert/distilbert-base-uncased |
| Tamano del repositorio | 0,5 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-15 |
| Fecha de actualizacion | 2026-09-15 |

## Arquitectura y entrenamiento

La arquitectura es la de DistilBERT: un *encoder* transformer de 6 capas obtenido mediante destilacion del conocimiento de BERT-base, con un cabecera de clasificacion de secuencia superpuesta. El recuento real de parametros en safetensors (66.955.010) es coherente con el tamano oficial de `distilbert-base-uncased`. La model card no describe la arquitectura ni confirma el numero de capas, cabezas de atencion o dimension oculta, por lo que estos detalles se heredan del modelo base y no estan verificados en la informacion proporcionada.

El entrenamiento se realizo con la libreria Transformers (version 5.17.0), PyTorch 2.11.0+cu128, Datasets 5.0.1 y Tokenizers 0.23.1. Hiperparametros declarados: `learning_rate` 2e-05, `train_batch_size` 16, `eval_batch_size` 16, semilla 42, optimizador AdamW_TORCH_FUSED con betas (0,9; 0,999) y epsilon 1e-08, planificador lineal y 2 epocas (1.068 pasos totales). No se menciona ningun tipo de ajuste por preferencias (RLHF, DPO), ni decodificacion especulativa, ni tecnicas de atencion eficiente. La composicion del dataset de entrenamiento y evaluacion es desconocida: la propia model card indica "More information needed" en las secciones de descripcion, usos previstos, limitaciones y datos de entrenamiento.

## Capacidades

- Clasificacion de texto para analisis de sentimiento: el pipeline declarado es `text-classification`, con una exactitud reportada de 0,8480 en el conjunto de evaluacion.
- Inferencia con textos de hasta 512 tokens (limite heredado del modelo base), suficiente para resenas, tweets, titulares o parrafos cortos.
- Ejecucion en CPU y en GPU de gama baja gracias a sus 66,9 millones de parametros.
- Compatibilidad con `text-embeddings-inference` y con `endpoints_compatible`, segun las etiquetas del repositorio, lo que permite desplegarlo detras de la API de HuggingFace Inference Endpoints.
- No se documenta soporte de *tool calling*, ni de *function calling*, ni de agentes, ni de razonamiento multi-paso, ni modo *thinking*, ni vision, ni audio. Es un modelo discriminativo de una sola pasada, no generativo.
- No se documenta capacidad multilingue. El modelo base `distilbert-base-uncased` esta entrenado predominantemente con texto en ingles sin distincion de mayusculas, por lo que el rendimiento en castellano u otros idiomas no esta garantizado ni medido.
- No se documenta el numero de etiquetas de salida ni su semantica (binario positivo/negativo, estrellas, multiclase), dato imprescindible antes de cualquier integracion.

## Casos de uso

- Clasificacion por lotes de resenas de producto: dado el tamano reducido del modelo, se pueden procesar cientos de miles de resenas en CPU con `transformers` o ONNX Runtime, agregando la senal de sentimiento por producto o categoria en un cuadro de mando.
- Enrutado y priorizacion de tickets de soporte: usar la etiqueta de sentimiento como caracteristica auxiliar para marcar conversaciones con tono negativo y elevarlas a un agente humano antes que el resto de la cola.
- Monitorizacion de menciones de marca: clasificar en tiempo casi real un flujo de comentarios o publicaciones para detectar picos de sentimiento negativo, siempre que el texto este en ingles o se valide antes el comportamiento en el idioma objetivo.
- Pre-etiquetado para anotacion humana: generar una primera pasada de etiquetas sobre un corpus nuevo y reservar el esfuerzo de anotacion manual para los casos de baja confianza (*active learning*), reduciendo el coste del etiquetado.
- Filtro previo en pipelines de atencion al cliente automatizada: detectar frustracion en el mensaje del usuario y derivar a un flujo distinto (respuesta empatica, escalado a humano) antes de invocar un modelo generativo grande, ahorrando coste de inferencia.
- Prototipo docente o prueba de concepto de MLOps: por su tamano (0,5 GB de repositorio) y su licencia Apache 2.0, sirve para montar un servicio de clasificacion completo (entrenamiento, evaluacion, despliegue con TEI, monitorizacion) sin infraestructura especializada.
- Moderacion de comentarios en foros o comunidades: clasificar contribuciones con tono negativo o agresivo como primera capa de un sistema de moderacion, con revision humana obligatoria en los casos marcados.
- Extraccion de senal de sentimiento para series temporales: analizar la evolucion del tono de un corpus de noticias o informes trimestrales a lo largo del tiempo, agregando la salida del clasificador por periodo.

## Benchmarks y rendimiento

El `model-index` del repositorio declara una entrada (`distilbert-sentiment-demo`) con la lista de resultados vacia, por lo que no hay benchmarks estandar (MMLU, GLUE, SST-2, etc.). Los unicos datos disponibles son los de la propia evaluacion del autor sobre un conjunto de evaluacion no identificado:

| Metrica | Valor | Origen |
|---|---|---|
| Loss (evaluacion) | 0,4249 | Descripcion textual de la model card |
| Accuracy (evaluacion) | 0,8480 | Descripcion textual de la model card |
| Validation loss (epoca 2) | 0,3662 | Tabla de resultados de entrenamiento |
| Accuracy (epoca 2) | 0,8583 | Tabla de resultados de entrenamiento |

Evolucion durante el entrenamiento:

| Training loss | Epoca | Paso | Validation loss | Accuracy |
|---|---|---|---|---|
| 0,4165 | 1.0 | 534 | 0,3666 | 0,8424 |
| 0,2535 | 2.0 | 1068 | 0,3662 | 0,8583 |

Advertencia sobre los datos: existe una discrepancia entre la exactitud de la descripcion (0,8480) y la de la tabla (0,8583) para el mismo punto de evaluacion. Ademas, la perdida de entrenamiento baja de 0,4165 a 0,2535 mientras la perdida de validacion apenas varia (0,3666 a 0,3662) y la exactitud se mueve 1,6 puntos, un patron compatible con sobreajuste a partir de la primera epoca. No se han publicado resultados de benchmarks comparables en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,27 GB de pesos en fp32 y 0,13 GB en fp16. Sumando activaciones y el *overhead* del runtime de PyTorch, el consumo total se mantiene holgadamente por debajo de 1 GB en inferencia por lotes pequenos.
- GPU recomendadas: cualquier GPU moderna sirve. Funciona en GTX 1050 Ti o superior, RTX 2060, RTX 3060, RTX 4090, y tambien en A100 o H100, donde quedara limitado por CPU y por el *data loader* antes que por la GPU.
- Cabe en GPU de consumo: si, sin ninguna duda, incluidas las integradas y las de portatil con poca memoria. Tambien es viable en CPU pura para volumenes moderados.
- Opciones de despliegue: pipeline de `transformers`, Text Embeddings Inference (etiqueta `text-embeddings-inference` del repositorio), HuggingFace Inference Endpoints (etiqueta `endpoints_compatible`), exportacion a ONNX Runtime, TorchServe o un servicio FastAPI propio. No es un caso de uso de llama.cpp, Ollama ni vLLM, orientados a modelos generativos.
- Latencia y throughput: no disponible. El autor no publica medidas de latencia ni de tokens por segundo, y el modelo no genera texto, por lo que las metricas habituales de throughput generativo no aplican.
- Almacenamiento: el repositorio ocupa 0,5 GB, un tamano trivial para cualquier sistema de ficheros o cache de contenedor.

## Comparativa con modelos similares

La informacion disponible no incluye resultados de benchmarks de este modelo frente a alternativas, por lo que la comparacion se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| yasminberrichi/distilbert-sentiment-demo | 66,9 M | 512 tokens (heredado) | Apache 2.0 | Dataset de ajuste fino no declarado; rendimiento comparativo no disponible |
| distilbert/distilbert-base-uncased | 66,9 M | 512 tokens | Apache 2.0 | Modelo base sin ajuste; no es un clasificador de sentimiento por si mismo |
| distilbert-base-uncased-finetuned-sst-2-english | 66,9 M | 512 tokens | Apache 2.0 | Ajustado sobre SST-2 (ingles, binario); su exactitud no se ha verificado en esta busqueda |
| cardiffnlp/twitter-roberta-base-sentiment-latest | ~125 M | 512 tokens | No disponible en esta busqueda | Ajustado sobre datos de redes sociales; el rendimiento comparativo no se ha verificado |

No se dispone de datos de rendimiento de los modelos alternativos dentro de la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card indica explicitamente "on an unknown dataset" y "More information needed" en las secciones de descripcion, usos previstos y datos. Sin conocer la distribucion de entrenamiento no se puede evaluar el sesgo ni la generalizacion.
- Numero de etiquetas y semantica sin documentar: se desconoce si la salida es binaria, multiclase o de regresion, y que representa cada clase. Es un bloqueo directo para cualquier integracion en produccion.
- Riesgo de sobreajuste: con solo 2 epocas, la perdida de validacion se estanca mientras la de entrenamiento cae a la mitad. Es probable que mas epocas no mejoren el modelo, pero tampoco hay evidencia de que 2 sean suficientes.
- Discrepancia en las metricas publicadas: 0,8480 frente a 0,8583 de exactitud para el mismo conjunto de evaluacion, sin aclaracion del autor.
- Idiomas no declarados: el modelo base es de ingles sin distincion de mayusculas. Usarlo con texto en castellano, con acentos o con emoticonos no esta validado y puede degradar la calidad de forma silenciosa.
- Sesgos: no evaluados ni documentados. Los clasificadores de sentimiento ajustados sobre corpus no publicados suelen heredar sesgos de dominio, de registro (formal frente a coloquial) y demograficos.
- Alucinacion: no aplica en el sentido generativo, ya que el modelo no produce texto libre, pero si puede producir etiquetas con alta confianza y completamente erroneas fuera de su dominio de entrenamiento.
- Licencia: Apache 2.0, permisiva y sin restricciones para uso comercial. El modelo base `distilbert-base-uncased` tambien es Apache 2.0.
- Madurez del artefacto: 0 descargas y 0 likes, publicacion el mismo dia de su ultima actualizacion y model card autogenerada por el `Trainer` con el aviso "you should probably proofread and complete it". Debe tratarse como un experimento, no como un componente estable.
- La busqueda web asociada a este modelo no devolvio ningun resultado relevante: todos los enlaces corresponden a un establecimiento de hosteleria en Florida, sin relacion con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yasminberrichi/distilbert-sentiment-demo
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Resultados de la busqueda web: no se encontro ningun enlace relevante sobre este modelo; los resultados obtenidos correspondian a un negocio de cafe en Orange Park (Florida) y no guardan relacion con el artefacto descrito.
- Paper, blog, repositorio o demo adicionales: no disponibles.
