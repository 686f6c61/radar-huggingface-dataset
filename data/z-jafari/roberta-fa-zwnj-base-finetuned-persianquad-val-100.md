# Z-Jafari/roberta-fa-zwnj-base-finetuned-PersianQuAD-val-100

## Resumen

`roberta-fa-zwnj-base-finetuned-PersianQuAD-val-100` es un modelo de respuesta a preguntas extractiva (question answering) en persa, obtenido mediante fine-tuning del checkpoint base `HooshvareLab/roberta-fa-zwnj-base` sobre el conjunto de datos PersianQuAD. Lo publica el usuario Z-Jafari en Hugging Face y se distribuye con licencia Apache 2.0. El modelo resuelve la tarea de localizar el fragmento de texto (span) que responde a una pregunta dentro de un contexto dado, devolviendo las posiciones de inicio y fin del fragmento.

Arquitectura transformer tipo RoBERTa en configuracion base, con 117.709.058 parametros (aproximadamente 117,7 millones) en formato safetensors. El modelo base incorpora un preprocesamiento especifico para el persa centrado en el caracter ZWNJ (zero-width non-joiner), un detalle relevante para la tokenizacion correcta del idioma. El checkpoint resultante es un modelo discriminativo de QA, no generativo: no produce texto libre, sino que extrae respuestas del contexto proporcionado.

La relevancia de este checkpoint es limitada pero concreta: cubre un nicho poco atendido (QA extractiva en persa) con una licencia permisiva y un tamano que permite inferencia en CPU o en GPUs de consumo. El autor mantiene una coleccion de modelos base ajustados sobre PersianQuAD, lo que sugiere un esfuerzo comparativo entre arquitecturas. No obstante, la model card esta generada automaticamente por el Trainer y carece de documentacion sobre el dataset, los idiomas y las limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa (base) |
| Parametros totales | 117.709.058 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de la configuracion del modelo base; no declarada en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF ni ONNX en el repo) |
| Idiomas soportados | persa (farsi); no declarado explicitamente en la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `HooshvareLab/roberta-fa-zwnj-base`, un encoder RoBERTa adaptado al persa. La arquitectura es la de RoBERTa base: 12 capas de atencion, atencion bidireccional completa y una cabeza de QA extractiva sobre las representaciones del encoder que predice las posiciones de inicio y fin del span de respuesta. No hay componente generativo ni decodificacion autoregresiva.

El entrenamiento se realizo con el Trainer de Hugging Face sobre un dataset no especificado en la model card (indicado como "unknown dataset"), presumiblemente PersianQuAD segun el nombre del modelo. Los hiperparametros declarados son: learning rate 2e-05, batch de entrenamiento y evaluacion de 16, 3 epocas (3687 pasos totales), optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal, semilla 42 y mixed precision nativa (AMP). La perdida de validacion evoluciono de 1,2982 (epoca 1) a 1,2349 (epoca 2) y 1,2544 (epoca 3), lo que indica un ligero sobreajuste a partir de la segunda epoca. No se documenta el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO (no aplicables a un modelo discriminativo).

## Capacidades

- Respuesta a preguntas extractiva en persa: dado un contexto y una pregunta, devuelve el span de texto que contiene la respuesta.
- Localizacion de fragmentos: util para tareas de extraccion de informacion estructurada a partir de documentos.
- Manejo de texto persa con preprocesamiento ZWNJ heredado del modelo base.
- No soporta tool calling ni function calling (modelo discriminativo, no generativo).
- No soporta agentes ni razonamiento multi-paso.
- No soporta generacion de texto libre, codigo, matematicas ni vision.
- Capacidad multilingue no declarada; el entrenamiento y el modelo base estan orientados al persa.

## Casos de uso

- Busqueda de respuestas en documentacion tecnica en persa: indexar manuales y usar el modelo para localizar el pasaje exacto que responde a una consulta del usuario, con la ventaja de que devuelve texto literal del documento y reduce el riesgo de alucinacion frente a un modelo generativo.
- Extraccion de campos en formularios y contratos: dado un contexto juridico o administrativo en persa, extraer valores concretos (fechas, nombres, importes) como spans, integrable en un pipeline de digitalizacion documental.
- Asistente de soporte sobre base de conocimiento: combinar recuperacion documental (BM25 o embeddings) con este modelo para responder preguntas frecuentes citando el fragmento fuente, con latencia baja por el tamano reducido del modelo.
- Anotacion asistida de datasets de QA: usar el modelo para preanotar pares pregunta-respuesta en corpus persas y reducir el trabajo manual de revision.
- Evaluacion comparativa de arquitecturas para persa: al formar parte de una coleccion de modelos base ajustados sobre PersianQuAD, sirve como linea base reproducible para comparar RoBERTa frente a otras arquitecturas en la misma tarea.
- Despliegue en entornos con recursos limitados: con 117,7 millones de parametros cabe en CPU y en GPUs de consumo, lo que permite servir QA extractiva en infraestructura modesta o en el borde.
- Filtrado y enriquecimiento de contenidos: localizar menciones de entidades o temas en grandes volumenes de texto persa para tareas de clasificacion o moderacion.

## Benchmarks y rendimiento

La model card declara resultados en el conjunto de evaluacion (el model-index oficial no contiene entradas):

| Metrica | Valor |
|---|---|
| Loss (evaluacion) | 1,2544 |
| Exact Match | 58,5 |
| F1 | 64,59 |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB solo para pesos (117,7 M parametros x 4 bytes), mas activaciones y overhead del runtime; en la practica, menos de 2 GB.
- En fp16/bf16: aproximadamente 0,25 GB para pesos; holgado en cualquier GPU moderna.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Para throughput alto, una T4, L4 o RTX 4090 son mas que suficientes. A100/H100 no aportan ventaja significativa por el tamano reducido del modelo.
- Cabe en cualquier GPU de consumo (GTX 1060 6 GB, RTX 3060, RTX 4090) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers con pipeline `question-answering`, TorchServe, o exportacion a ONNX para inferencia en CPU. No hay pesos GGUF publicados, por lo que llama.cpp y Ollama requeririan conversion previa. vLLM y TGI estan orientados a modelos generativos y no son la via natural para este checkpoint.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Z-Jafari/roberta-fa-zwnj-base-finetuned-PersianQuAD-val-100 | 117,7 M | no disponible | QA extractiva en persa | Apache 2.0 | Hugging Face |
| Z-Jafari/roberta-fa-zwnj-base-finetuned-PersianQuAD-val-None | no disponible | no disponible | QA extractiva en persa | no disponible | Hugging Face |
| HooshvareLab/roberta-fa-zwnj-base | no disponible | no disponible | encoder base en persa | no disponible | Hugging Face |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a parametros, tarea y licencia.

## Limitaciones y advertencias

- La model card esta generada automaticamente y no documenta el dataset de entrenamiento, los idiomas ni los usos previstos; la trazabilidad del fine-tuning es limitada.
- El modelo solo responde en persa; no se declara soporte multilingue.
- Al ser extractivo, no puede responder preguntas cuya respuesta no este literalmente en el contexto proporcionado; en ese caso devolvera un span incorrecto o de baja confianza.
- Riesgo de sobreajuste: la perdida de validacion aumenta en la tercera epoca (de 1,2349 a 1,2544).
- No hay informacion sobre sesgos del dataset PersianQuAD ni sobre su composicion demografica o tematica.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base `HooshvareLab/roberta-fa-zwnj-base` no declara licencia en la informacion disponible; conviene verificar los terminos del modelo base antes de un despliegue comercial.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion de la comunidad.
- No se publican pesos en formatos alternativos (GGUF, ONNX), lo que anade trabajo de conversion para despliegues optimizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Z-Jafari/roberta-fa-zwnj-base-finetuned-PersianQuAD-val-100
- Modelo relacionado (val-None): https://huggingface.co/Z-Jafari/roberta-fa-zwnj-base-finetuned-PersianQuAD-val-None
- Coleccion Base-Models-Finetuned-on-PersianQuAD: https://huggingface.co/collections/Z-Jafari/base-models-finetuned-on-persianquad
- Modelo base: https://huggingface.co/HooshvareLab/roberta-fa-zwnj-base
