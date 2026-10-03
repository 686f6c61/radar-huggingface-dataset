# stefra/glance-text

## Resumen

glance-text es un modelo de clasificación zero-shot publicado por el usuario stefra en HuggingFace. No es un modelo generativo: implementa la arquitectura GLANCE, un encoder transformer basado en FacebookAI/roberta-large al que se ha aplicado una técnica denominada statement tuning (adaptación de los templates de statement-tuning a una forma estado/statement). Dado un texto de entrada (el estado) y uno o varios enunciados (los statements), el modelo devuelve la probabilidad de que cada enunciado sea verdadero respecto a ese estado.

La innovación principal es el empaquetado de varios statements junto al mismo estado en una única secuencia, usando una máscara de atención bidireccional por bloques que mantiene los enunciados independientes entre sí. Según el autor, la puntuación de un statement es idéntica a la que se obtendría evaluándolo por separado, lo que permite evaluar múltiples hipótesis en una sola pasada sin perder consistencia. Esto es relevante para tareas de verificación de afirmaciones, clasificación temática y análisis de sentimiento sin reentrenamiento.

El modelo se distribuye con código propio dentro del repositorio (requiere trust_remote_code=True) y un repositorio de 1,4 GB. Se publica sin licencia declarada, sin idiomas declarados y con cero descargas y cero likes en el momento de redactar esta ficha, por lo que se trata de un artefacto muy reciente y con escasa validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLANCE: encoder transformer (backbone RoBERTa-large) con máscara de atención bidireccional por bloques y cabeza de clasificación verdadero/falso |
| Parametros totales | Aproximadamente 355 M, heredados del backbone FacebookAI/roberta-large (no confirmado de forma explícita en la model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; el backbone roberta-large soporta 512 tokens |
| Tipos de cuantizacion | No disponible; el autor indica que en GPU el modelo se carga en float16 y permite elegir dtype |
| Idiomas soportados | No disponible; todas las tareas de evaluación publicadas (ag_news, emotion, rotten_tomatoes) están en inglés |
| Licencia | No disponible |
| Formato de pesos | safetensors (head.safetensors) y pesos del backbone en formato transformers; el código de la arquitectura (modeling_glance.py) acompaña al repositorio |
| Modelo base | FacebookAI/roberta-large (finetune) |
| Pipeline declarado | zero-shot-classification |
| Tamano del repositorio | 1.4 GB |
| Libreria | pytorch (con transformers y trust_remote_code=True) |

## Arquitectura y entrenamiento

La arquitectura GLANCE parte de un encoder RoBERTa-large fine-tuned y añade una cabeza de clasificación binaria (verdadero/falso) alojada en head.safetensors. El entrenamiento se realiza mediante statement tuning multi-domanda, una variante de los templates de statement-tuning en la que el estado y los statements se empaquetan en la misma secuencia. La máscara de atención bidireccional por bloques impide que los tokens de un statement "vean" los de otro, garantizando que cada puntuación sea independiente y equivalente a la de una evaluación individual.

El autor también incluye statement_encoder.json, que describe el pooling y la configuración de empaquetado empleada durante el entrenamiento, y eval_report.json, con métricas desglosadas por fuente. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO (el modelo no es generativo, por lo que estos mecanismos no serían aplicables en su forma habitual). Tampoco se detalla si hubo destilación, decodificación especulativa u otras optimizaciones de inferencia.

## Capacidades

- Clasificación zero-shot: devuelve la probabilidad de que cada statement sea verdadero dado un estado textual.
- Evaluación multi-statement en una sola pasada: permite pasar varios enunciados para el mismo estado y obtener una puntuación independiente por enunciado.
- Procesamiento por lotes: `predict` acepta tanto una tupla (estado, lista de statements) como una lista de tuplas (estado, statements), devolviendo un array por estado.
- Puntuaciones calibradas: la model card reporta métricas de calibración (Brier y ECE) además de accuracy, F1 y ROC-AUC.
- Selección de dispositivo y precisión: soporta device= y dtype=, con carga por defecto en float16 cuando hay GPU.
- Capacidad multilingüe: no disponible (no declarada).
- Tool calling / function calling: no soportado (no es un modelo generativo ni orientado a agentes).
- Razonamiento multi-paso y uso como agente: no soportado.
- Visión, audio, modo thinking: no soportado.

## Casos de uso

- Verificación de afirmaciones (fact checking): dado un texto fuente como estado, evaluar con `predict` una lista de afirmaciones candidatas y ordenarlas por probabilidad de ser verdaderas; es adecuado porque permite comparar muchas hipótesis contra el mismo contexto en una sola llamada.
- Clasificación temática de noticias zero-shot: etiquetar titulares o resúmenes con categorías definidas en tiempo de inferencia (por ejemplo, "es sobre deportes", "es sobre política") sin reentrenar, aprovechando el rendimiento de 0,815 de accuracy en ag_news.
- Análisis de sentimiento sin anotaciones: usar statements del tipo "el texto es positivo" o "el texto es negativo" para obtener una probabilidad calibrada, útil cuando no se dispone de un clasificador específico del dominio.
- Moderación de contenido o filtrado de reseñas: aplicar plantillas como "el texto contiene una amenaza" o "la reseña describe una experiencia negativa" para priorizar revisiones humanas, apoyándose en las métricas de calibración (ECE de 0,103 en el conjunto agregado).
- Filtrado de datos para pipelines de entrenamiento: usar el modelo como clasificador auxiliar para descartar o etiquetar grandes lotes de texto según criterios expresados como statements, sin coste de reetiquetado manual.
- Evaluación automática de respuestas en experimentos de NLP: comprobar si una respuesta satisface criterios declarados como statements ("la respuesta cita la fuente", "la respuesta es coherente"), aprovechando la independencia de puntuaciones entre statements.
- Análisis de emociones en reseñas: replicar la tarea emotion (0,736 de accuracy) para obtener una señal probabilística sobre estados emocionales descritos mediante enunciados.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre conjuntos held-out (tareas no vistas durante el entrenamiento):

| Sorgente | n | Accuracy | F1 | ROC-AUC | Brier | ECE |
|---|---|---|---|---|---|---|
| ag_news | 3000 | 0,815 | 0,805 | 0,892 | 0,145 | 0,094 |
| emotion | 3000 | 0,736 | 0,719 | 0,786 | 0,207 | 0,128 |
| rotten_tomatoes | 3000 | 0,837 | 0,834 | 0,898 | 0,133 | 0,087 |
| ALL | 9000 | 0,796 | 0,787 | 0,864 | 0,162 | 0,103 |

No se han publicado en la información disponible comparaciones directas con otros modelos, resultados en MMLU, HumanEval, GSM8K ni métricas de generación (el modelo no es generativo).

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 0,7 GB en float16 y aproximadamente 1,4 GB en float32, coherente con un encoder de unos 355 M de parámetros.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; son suficientes tarjetas de gama media como RTX 3060, RTX 4060, RTX 4090, A100 o H100, aunque estas dos últimas están sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna; también puede ejecutarse en CPU, con mayor latencia.
- Opciones de despliegue: transformers con `AutoModel.from_pretrained(..., trust_remote_code=True)`; el repositorio incluye código propio, por lo que no se ha confirmado compatibilidad con vLLM, TGI, llama.cpp, Ollama ni formatos GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Comparación con alternativas habituales de clasificación zero-shot/NLI basadas en encoders. Los datos de parámetros y contexto de los modelos de referencia son valores públicos conocidos, no extraídos de la model card de glance-text.

| Modelo | Parametros | Contexto | Licencia | Tipo | Rendimiento comparado |
|---|---|---|---|---|---|
| stefra/glance-text | ~355 M (roberta-large) | 512 tokens (backbone) | No disponible | Encoder GLANCE con statement tuning | 0,796 de accuracy y 0,864 de ROC-AUC en el agregado held-out (9000 ejemplos) |
| FacebookAI/roberta-large-mnli | ~355 M | 512 tokens | MIT | Encoder NLI | No disponible en esta ficha; requiere consultar su model card |
| facebook/bart-large-mnli | ~407 M | 1024 tokens | MIT | Encoder-decoder NLI adaptado a zero-shot | No disponible en esta ficha; requiere consultar su model card |

No se dispone de comparaciones directas publicadas entre glance-text y estos modelos bajo el mismo protocolo de evaluación, por lo que la comparación de rendimiento queda pendiente.

## Limitaciones y advertencias

- No es un modelo generativo: solo produce probabilidades de verdadero/falso; no sirve para generar texto, código ni respuestas.
- Licencia no disponible: el uso comercial no está autorizado explícitamente ni prohibido, lo que constituye un riesgo legal para producción.
- Idiomas no declarados: las únicas tareas de evaluación son en inglés; el comportamiento en castellano u otros idiomas no está validado.
- Contexto limitado por el backbone (512 tokens en roberta-large): estados largos pueden truncarse y degradar la puntuación.
- Riesgo de puntuaciones erróneas fuera de dominio: aunque no genera texto, puede asignar alta probabilidad a statements falsos en distribuciones distintas de las de entrenamiento; las métricas publicadas se limitan a tres conjuntos en inglés.
- Requiere `trust_remote_code=True`: implica ejecutar código Python incluido en el repositorio, lo que añade superficie de riesgo en entornos no auditados.
- Adopción nula: 0 descargas y 0 likes en el momento de redactar la ficha, sin validación independiente de terceros.
- Evaluación limitada: los benchmarks proceden exclusivamente de la model card del autor y cubren 9000 ejemplos en tres tareas, sin protocolo externo replicado.
- Conjunto de pesos de 1,4 GB: puede ser excesivo para despliegues muy restringidos en almacenamiento, aunque el modelo en sí es compacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stefra/glance-text
- Modelo base: https://huggingface.co/FacebookAI/roberta-large
- Repositorio de statement-tuning citado por el autor: https://github.com/afz225/statement-tuning
- Paper asociado: no disponible
- Demo o espacio de HuggingFace: no disponible
- Nota sobre la búsqueda web: las consultas realizadas no devolvieron resultados relevantes sobre el modelo; los enlaces obtenidos no guardan relación con el contenido de esta ficha y se han descartado.
