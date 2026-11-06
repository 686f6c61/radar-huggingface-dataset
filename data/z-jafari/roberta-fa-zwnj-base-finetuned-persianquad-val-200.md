# Z-Jafari/roberta-fa-zwnj-base-finetuned-PersianQuAD-val-200

## Resumen

`roberta-fa-zwnj-base-finetuned-PersianQuAD-val-200` es un modelo de respuesta a preguntas extractiva (question answering) en persa, publicado por el usuario Z-Jafari en Hugging Face. Se trata de un fine-tuning del modelo base `HooshvareLab/roberta-fa-zwnj-base`, una variante de RoBERTa adaptada al persa que incorpora el preprocesamiento de ZWNJ (zero-width non-joiner), un caracter critico en la ortografia persa. El modelo resuelve la tarea de localizar el fragmento exacto de un contexto que responde a una pregunta dada.

El modelo tiene 117.709.058 parametros (aproximadamente 117,7 M), lo que lo situa en la categoria base de la familia RoBERTa, y se distribuye en formato safetensors bajo licencia Apache 2.0. Su relevancia es acotada: se trata de un experimento de fine-tuning con un dataset no documentado (la model card indica "unknown dataset", aunque el nombre sugiere PersianQuAD) y sin resultados de benchmarks en el model-index. Resulta util como referencia para pipelines de QA extractiva en persa, pero no como modelo de produccion sin validacion adicional.

El modelo reporta en su model card un exact match de 59,4 y un F1 de 65,26 sobre un conjunto de evaluacion no especificado, con una perdida de validacion de 1,3478. Estos datos, declarados por el autor, deben interpretarse con cautela al no documentarse el conjunto de test ni el procedimiento de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (transformer encoder-only) adaptada al persa con preprocesamiento ZWNJ |
| Parametros totales | 117.709.058 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (RoBERTa base tipicamente 512 tokens, no confirmado por el autor) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | persa (farsi); no se documentan otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | HooshvareLab/roberta-fa-zwnj-base |
| Libreria | transformers |
| Tamano del repositorio | 3.8 GB |
| Pipeline | question-answering |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-only de tipo RoBERTa, heredada del modelo base `HooshvareLab/roberta-fa-zwnj-base`. Este modelo base incorpora un tokenizador y preprocesamiento especificos para el persa que tratan el caracter ZWNJ (zero-width non-joiner) de forma explicita, lo que mejora la tokenizacion de palabras compuestas y sufijos persas. El modelo resultante produce representaciones contextuales sobre las que se anade una cabeza de QA extractiva que predice los indices de inicio y fin de la respuesta dentro del contexto.

El fine-tuning se realizo con los siguientes hiperparametros declarados en la model card: learning rate de 2e-05, batch size de entrenamiento y evaluacion de 16, semilla 42, optimizador AdamW con betas (0,9, 0,999) y epsilon 1e-08, scheduler lineal, 3 epocas y entrenamiento con mixed precision nativa (AMP). El conjunto de datos de entrenamiento no se documenta (la model card indica "unknown dataset"), aunque el nombre del modelo sugiere el uso de PersianQuAD. La evolucion de la perdida muestra sobreajuste a partir de la segunda epoca: la perdida de entrenamiento baja de 1,6974 a 0,7255 mientras la de validacion sube de 1,2955 (epoca 2) a 1,3478 (epoca 3), por lo que el checkpoint final no es el de menor perdida de validacion. No se documenta el uso de RLHF, DPO ni ninguna innovacion tecnica adicional.

## Capacidades

- Respuesta a preguntas extractiva en persa: dado un contexto y una pregunta, devuelve el fragmento del contexto que contiene la respuesta.
- Comprension lectora en persa con manejo correcto de ZWNJ gracias al tokenizador del modelo base.
- Salida de indices de inicio y fin (start/end logits) compatible con el pipeline `question-answering` de transformers.
- No soporta generacion de texto libre, ya que es un modelo encoder-only.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, vision ni audio.
- Capacidad multilingue no documentada; el modelo esta orientado exclusivamente al persa.

## Casos de uso

- Busqueda de respuestas en documentacion tecnica en persa: indexar manuales o articulos y usar el modelo para extraer el pasaje exacto que responde a la consulta del usuario, aprovechando su naturaleza extractiva para evitar respuestas inventadas.
- Atencion al cliente sobre base de conocimiento persa: dado un contexto de FAQ, el modelo localiza la frase que responde a la pregunta del cliente, lo que permite construir respuestas verificables con cita textual.
- Extraccion de campos en formularios y contratos persas: localizar valores concretos (fechas, importes, nombres) dentro de un texto, siempre que la pregunta se formule de forma que la respuesta sea un fragmento literal.
- Componente de un pipeline RAG en persa: actuar como extractor final sobre los documentos recuperados por un retriever, reduciendo el coste frente a un modelo generativo y facilitando la trazabilidad de la respuesta.
- Anotacion asistida de datasets de QA en persa: preetiquetar pares pregunta-contexto para revision humana, dado su tamano reducido y su bajo coste de inferencia en CPU.
- Evaluacion comparativa de modelos base persas: servir como referencia en experimentos academicos sobre fine-tuning de QA extractiva, al estar disponible publicamente bajo Apache 2.0.

## Benchmarks y rendimiento

Los unicos datos disponibles son los declarados por el autor en la model card. El model-index no contiene resultados estructurados (lista vacia).

| Metrica | Valor | Conjunto de evaluacion |
|---|---|---|
| Exact match | 59,4 | no especificado (val-200, segun el nombre) |
| F1 | 65,26 | no especificado (val-200, segun el nombre) |
| Validation loss | 1,3478 | no especificado |

Evolucion de la perdida durante el entrenamiento:

| Epoca | Paso | Training loss | Validation loss |
|---|---|---|---|
| 1 | 1243 | 1,6974 | 1,4037 |
| 2 | 2486 | 1,0451 | 1,2955 |
| 3 | 3729 | 0,7255 | 1,3478 |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB para los pesos (117,7 M de parametros), mas el overhead de activaciones y del tokenizador; en la practica cabe holgadamente en cualquier GPU consumer.
- VRAM estimada en fp16/bf16: aproximadamente 0,25 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son mas que suficientes. Tambien es viable en CPU para cargas moderadas.
- Cabe en GPU consumer: si, en practicamente cualquier modelo (GTX 1650 en adelante).
- Opciones de despliegue: transformers con pipeline `question-answering`, TorchServe, FastAPI con transformers, ONNX Runtime, o exportacion a GGUF para llama.cpp si se convierte (no se proporciona conversion oficial).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Z-Jafari/roberta-fa-zwnj-base-finetuned-PersianQuAD-val-200 | 117,7 M | no disponible | QA extractiva persa | Apache 2.0 | Hugging Face |
| HooshvareLab/roberta-fa-zwnj-base (modelo base) | ~117 M | no disponible | encoder persa (preentrenamiento) | no disponible en esta ficha | Hugging Face |
| Z-Jafari/roberta-fa-zwnj-base-finetuned-PersianQuAD-val-None | no disponible | no disponible | QA extractiva persa | no disponible en esta ficha | Hugging Face |
| Otros modelos de la coleccion Base-Models-Finetuned-on-PersianQuAD | variable | no disponible | QA extractiva persa | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La model card esta generada automaticamente y no documenta el dataset de entrenamiento ("unknown dataset"), lo que impide reproducir el fine-tuning.
- El conjunto de evaluacion no se especifica; los valores de exact match y F1 deben considerarse no verificables de forma independiente.
- Sobreajuste evidente: la perdida de validacion empeora en la tercera epoca, por lo que el checkpoint final puede no ser el optimo.
- Modelo encoder-only: no genera texto, no soporta instrucciones ni conversacion; solo extrae fragmentos del contexto proporcionado.
- Riesgo de alucinacion bajo en la generacion (no genera), pero puede devolver fragmentos irrelevantes cuando la respuesta no esta en el contexto.
- Sin datos sobre sesgos; al entrenarse sobre un corpus persa no documentado, puede heredar sesgos del mismo.
- Cobertura limitada al persa; no se documenta soporte de otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Cero descargas y cero likes en el momento de la consulta: modelo sin validacion por la comunidad.
- No se documentan cuantizaciones ni formatos alternativos de pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Z-Jafari/roberta-fa-zwnj-base-finetuned-PersianQuAD-val-200
- Modelo base: https://huggingface.co/HooshvareLab/roberta-fa-zwnj-base
- Variante relacionada (val-None): https://huggingface.co/Z-Jafari/roberta-fa-zwnj-base-finetuned-PersianQuAD-val-None
- Coleccion Base-Models-Finetuned-on-PersianQuAD: https://huggingface.co/collections/Z-Jafari/base-models-finetuned-on-persianquad
