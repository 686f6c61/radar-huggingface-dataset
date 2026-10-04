# stefra/glance-roberta-v4

## Resumen

glance-roberta-v4 es un modelo encoder de clasificación zero-shot desarrollado por el usuario stefra, construido sobre FacebookAI/roberta-large y entrenado con la arquitectura GLANCE (statement tuning multi-dominio). No es un modelo generativo: dado un texto que actúa como estado y uno o varios enunciados o statements, devuelve la probabilidad de que cada statement sea verdadero respecto a ese estado. Su función es, por tanto, servir como clasificador entailment/verdadero-falso reutilizable para multitud de tareas de clasificación sin reentrenamiento específico.

El backbone es RoBERTa-large (encoder transformer, aproximadamente 355 millones de parámetros) más una cabeza de clasificación binaria entrenada específicamente. La innovación principal radica en el empaquetado: varios statements comparten el mismo estado dentro de una secuencia, pero una máscara de atención bidireccional por bloques los mantiene independientes, de modo que la puntuación de un statement es idéntica a la que se obtendría evaluándolo de forma aislada. Esto permite procesar hasta 8 statements por pack con un límite de 1024 tokens por pack.

El modelo se entrenó sobre 30 fuentes de datos heterogéneas (ABSА, SNLI, MNLI, PAWS, banking77, Amazon Reviews, etc.) con 47.284 estados y 249.704 statements, y se evaluó sobre 3 fuentes held-out (ag_news, emotion, rotten_tomatoes). Es relevante porque ofrece un clasificador zero-shot de propósito general con calibración reportada (ECE, Brier) y rendimiento reproducido step a step, aunque con disponibilidad y licencia sin documentar en la ficha de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (RoBERTa-large) con arquitectura GLANCE de statement tuning y cabeza verdadero/falso |
| Parametros totales | Backbone declarado FacebookAI/roberta-large (aprox. 355 M); total con cabeza no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Estado: 384 tokens maximos; statement: 96 tokens maximos; pack: 8 statements / 1024 tokens |
| Tipos de cuantizacion | No disponible; en GPU se carga en float16 por defecto, configurable con `dtype=` |
| Idiomas soportados | No disponible (las fuentes de entrenamiento son mayoritariamente en ingles) |
| Licencia | No disponible |
| Formato de pesos | safetensors (`head.safetensors`), backbone en formato transformers, PyTorch; requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

GLANCE parte de un encoder RoBERTa-large preentrenado y le añade una cabeza de clasificación binaria con pooling de tipo CLS y dropout de 0,1. El entrenamiento emplea "statement tuning": cada ejemplo se compone de un estado (texto de referencia) y hasta 8 statements empaquetados en la misma secuencia de 1024 tokens, con una máscara de atención bidireccional por bloques que impide que los statements se vean entre sí. El estado se limita a 384 tokens y cada statement a 96. El 50% de los statements usan referencias genéricas del tipo "the text" y el 30% siguen plantillas del estilo statement-tuning, con 3 plantillas por clase, lo que refuerza la generalización entre dominios.

El entrenamiento usó 2 épocas como máximo, learning rate 2e-05 en el backbone y 1e-04 en la cabeza, acumulación de gradiente de 4 con 4 packs por GPU en 2 GPU (batch efectivo de 32 packs), warmup del 10% de los steps, weight decay 0,01 y early stopping de 5 evaluaciones sin mejora. La selección del checkpoint se hizo por heldout_roc_auc. Los pesos publicados corresponden al step 2400 (época 1,62). Durante el entrenamiento, la ROC-AUC de validación pasó de 0,691 en el step 300 a 0,946 en el step 2400, mientras que la ROC-AUC held-out alcanzó 0,879 en ese mismo punto, mostrando una brecha moderada de generalización entre las fuentes de entrenamiento y las tres fuentes retenidas. No se documenta uso de RLHF ni DPO, coherente con un modelo no generativo.

## Capacidades

- Clasificación zero-shot: asignar probabilidad de veracidad a uno o varios statements dado un estado, sin entrenamiento adicional por tarea.
- Evaluación por lotes: `predict` acepta tanto un estado con una lista de statements como una lista de tuplas (estado, lista de statements), devolviendo un array de probabilidades por consulta.
- Independencia entre statements: gracias a la máscara de atención por bloques, cada statement se puntúa de forma aislada aunque comparta contexto.
- Multidominio: entrenado sobre 30 fuentes que cubren análisis de sentimiento, entailment (SNLI, MNLI), paráfrasis (PAWS, QQP), ironía y discurso ofensivo en Twitter, intención bancaria (banking77), QA (squad, qasc, sciq), entre otras.
- Calibración probabilística: la ficha reporta ECE y Brier por fuente, lo que permite umbralizar decisiones con cierta fiabilidad.
- No soporta generación de texto, tool calling, agentes, visión ni audio: es un encoder discriminativo de salida binaria.
- Capacidades multilingües: no documentadas; no se declara cobertura de idiomas.

## Casos de uso

- Moderación de contenido: evaluar statements como "el texto es ofensivo" o "el texto contiene discurso de odio" contra comentarios de usuario; el modelo está entrenado en tweet_offensive y tweet_irony, y su ECE bajo permite fijar umbrales de decisión estables.
- Análisis de sentimiento y opinión: clasificar reseñas y tuits con statements del tipo "la opinión es positiva" o "el sentimiento es negativo", apoyándose en el entrenamiento sobre amazon_reviews, app_reviews, yelp_polarity y tweet_sentiment.
- Inferencia de intención en atención al cliente: determinar si una consulta corresponde a una intención bancaria o de soporte mediante statements por categoría, dado el entrenamiento en banking77 y massive.
- Detección de entailment y contradicción: usar SNLI/MNLI como base para verificar si una hipótesis se sigue de una premisa, útil en pipelines de fact-checking.
- Verificación de paráfrasis y similitud: comprobar si dos formulaciones describen lo mismo (entrenamiento en PAWS y QQP), por ejemplo en deduplicación de titulares o preguntas frecuentes.
- Clasificación de tópicos: asignar etiquetas temáticas a artículos o descripciones usando statements por categoría, apoyándose en dbpedia y yahoo_answers.
- Filtrado de datos para curación de datasets: puntuar pares estado/statement y descartar los que caigan por debajo de un umbral de probabilidad, empleando la calibración reportada para escoger dicho umbral.
- Extracción de estructura en dominios de entidades: decidir si dos registros se refieren a la misma entidad (entity_matching) o si un texto contiene una entidad concreta (fewnerd).

## Benchmarks y rendimiento

Andamiento del entrenamiento y del modelo publicado (pesos del step 2400):

| step | epoca | val F1 | val ROC-AUC | val ECE | held-out F1 | held-out ROC-AUC | held-out ECE |
|---|---|---|---|---|---|---|---|
| 300 | 0,20 | 0,671 | 0,691 | 0,060 | 0,650 | 0,748 | 0,126 |
| 1200 | 0,81 | 0,827 | 0,920 | 0,025 | 0,784 | 0,869 | 0,077 |
| 2100 | 1,42 | 0,861 | 0,943 | 0,043 | 0,780 | 0,870 | 0,110 |
| **2400** | 1,62 | 0,857 | 0,946 | 0,060 | 0,785 | 0,879 | 0,125 |
| 2956 | 2,00 | 0,864 | 0,948 | 0,040 | 0,786 | 0,876 | 0,104 |

Metricas finales de validacion por fuente (seleccion; modelo publicado):

| Fuente | n | Accuracy | F1 | ROC-AUC | Brier | ECE |
|---|---|---|---|---|---|---|
| absa | 507 | 0,939 | 0,939 | 0,983 | 0,053 | 0,049 |
| ade | 481 | 0,917 | 0,917 | 0,971 | 0,074 | 0,063 |
| banking77 | 510 | 0,927 | 0,928 | 0,974 | 0,057 | 0,036 |
| complaints | 510 | 0,949 | 0,948 | 0,991 | 0,042 | 0,039 |
| dbpedia | 510 | 0,994 | 0,994 | 0,999 | 0,006 | 0,004 |
| mnli | 510 | 0,869 | 0,871 | 0,925 | 0,107 | 0,050 |
| qasc | 255 | 0,949 | 0,919 | 0,985 | 0,042 | 0,034 |
| paws | 256 | 0,758 | 0,754 | 0,850 | 0,168 | 0,112 |
| piqa | 340 | 0,526 | 0,519 | 0,524 | 0,267 | 0,090 |
| amazon_reviews | 488 | 0,891 | 0,884 | 0,957 | 0,087 | 0,070 |

No se han publicado resultados en benchmarks estandar externos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible; los datos anteriores son las metricas de validacion y held-out reportadas por el autor en `eval_report.json`.

## Requisitos de hardware

- VRAM estimada: con RoBERTa-large (aprox. 355 M de parametros) mas la cabeza, los pesos en float32 ocupan cerca de 1,4 GB (coincide con el tamano del repo); en float16 se reduce a aproximadamente 0,7 GB. Sumando activaciones para inferencia por lotes, una estimacion practica se situa entre 2 y 4 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM. Para lotes grandes o baja latencia, A100, H100, L40S o RTX 4090 aportan margen sobrado.
- Consumer GPU: si, cabe en GTX 1060 6 GB, GTX 1660, RTX 3060, RTX 4060 y superiores. En float16 ocupa menos de 1 GB de pesos.
- Opciones de despliegue: al ser un modelo de codigo personalizado (`trust_remote_code=True`), la via documentada es la libreria transformers con `AutoModel.from_pretrained` y el metodo `predict`. No se documentan integraciones con llama.cpp, Ollama, vLLM ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. El entrenamiento se realizo en 2 GPU con 4 packs por GPU y acumulacion 4, lo que da una idea del coste de entrenamiento, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Base / parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| stefra/glance-roberta-v4 | RoBERTa-large (~355 M) | Clasificacion zero-shot verdadero/falso | 384 tokens estado, 96 por statement, 1024 por pack | No disponible | HuggingFace, requiere `trust_remote_code` |
| FacebookAI/roberta-large | RoBERTa-large (~355 M) | Encoder base | 512 tokens | MIT | HuggingFace |
| stefra/roberta-large-so | RoBERTa-large (~355 M) | No disponible | No disponible | No disponible | HuggingFace |

No se dispone de datos comparativos de rendimiento frente a alternativas de clasificacion zero-shot (por ejemplo clasificadores basados en NLI como DeBERTa o BART-MNLI) en la informacion proporcionada, por lo que la comparacion se limita a arquitectura, tamano y licencia.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si se permite uso comercial; conviene contactar con el autor antes de cualquier despliegue en produccion.
- Idiomas no declarados: las fuentes de entrenamiento son predominantemente en ingles, por lo que el rendimiento en castellano u otros idiomas no esta garantizado ni medido.
- Rendimiento bajo en ciertas fuentes: piqa presenta 0,526 de accuracy y 0,524 de ROC-AUC, cerca del azar, y paws obtiene 0,758 de accuracy; no es fiable en tareas de razonamiento fisico o parafrasis compleja.
- Brecha de generalizacion: la ROC-AUC cae de 0,946 en validacion a 0,879 en held-out, y el error de calibracion (ECE) empeora de 0,060 a 0,125, de modo que las probabilidades en dominios nuevos estan peor calibradas.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de falsos positivos/negativos: el modelo emite una probabilidad, no una certeza, y un umbral mal elegido degrada la precision.
- Dependencia de codigo personalizado: `modeling_glance.py` viaja dentro del repositorio y exige `trust_remote_code=True`, lo que implica ejecutar codigo del autor; debe revisarse antes de usarlo en entornos sensibles.
- Sesgos: al entrenar sobre tweets, resenas y datasets publicos, puede heredar sesgos de esos corpus (lenguaje ofensivo, polaridad, dominios concretos) no analizados en la ficha.
- Cero adopcion registrada: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stefra/glance-roberta-v4
- Modelo base RoBERTa-large: https://huggingface.co/FacebookAI/roberta-large
- Documentacion de RoBERTa en transformers: https://huggingface.co/docs/transformers/model_doc/roberta
- Repositorio statement-tuning: https://github.com/afz225/statement-tuning
- Variante relacionada del mismo autor: https://huggingface.co/stefra/roberta-large-so
- Resena de RoBERTa (GeeksforGeeks): https://www.geeksforgeeks.org/machine-learning/overview-of-roberta-model/
- Comparativa RoBERTa vs GPT-4 (DSStream): https://www.dsstream.com/post/roberta-vs-gpt-4-a-comparative-analysis-of-language-model-capabilities
