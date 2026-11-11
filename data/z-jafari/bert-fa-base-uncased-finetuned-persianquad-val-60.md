# Z-Jafari/bert-fa-base-uncased-finetuned-PersianQuAD-val-60

## Resumen

`bert-fa-base-uncased-finetuned-PersianQuAD-val-60` es un modelo BERT base en persa (farsi) ajustado para la tarea de respuesta a preguntas extractiva (question answering). Lo desarrolla el usuario Z-Jafari y parte del modelo `HooshvareLab/bert-fa-base-uncased`, un checkpoint BERT base entrenado especificamente para persa por el equipo HooshvareLab. El ajuste fino se ha realizado sobre un conjunto derivado de PersianQuAD, segun indica el nombre del modelo, con 162.252.290 parametros totales.

El modelo resuelve el problema de localizar la respuesta a una pregunta dentro de un parrafo de contexto en persa, devolviendo el fragmento exacto (span) que contiene la respuesta. Es relevante porque la oferta de modelos de QA extractiva en persa es limitada y la mayoria de alternativas son modelos multilingues genericos; este checkpoint ofrece un ajuste especifico con una licencia permisiva (Apache 2.0).

La model card es practicamente automatica (generada por `Trainer`) y no documenta el dataset de entrenamiento ni los usos previstos. Los unicos datos objetivos disponibles son los hiperparametros de entrenamiento y las metricas de evaluacion declaradas por el autor: loss de validacion 0,9742, exact match 75,5 y F1 79,32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (transformer encoder bidireccional) |
| Parametros totales | 162.252.290 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (limitada por BERT base, tipicamente 512 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16; compatible con cuantizacion estandar via herramientas externas) |
| Idiomas soportados | persa (farsi); no se declaran otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo BERT base, heredada del checkpoint `HooshvareLab/bert-fa-base-uncased`. Sobre esa base se ha anadido la cabeza estandar de question answering (clasificacion de tokens de inicio y fin del span). El modelo tiene 162.252.290 parametros, coherente con un BERT base con vocabulario adaptado al persa.

El ajuste fino se realizo con los siguientes hiperparametros declarados en la model card: learning rate 2e-05, batch de entrenamiento y evaluacion de 16, semilla 42, optimizador AdamW (variante fused, betas 0,9/0,999, epsilon 1e-08), scheduler lineal, 3 epocas y precision mixta nativa (AMP). El entrenamiento alcanzo 3.411 pasos. La evolucion de la loss de validacion muestra sobreajuste a partir de la segunda epoca: 0,8831 en la epoca 1, 0,8362 en la epoca 2 y 0,9742 en la epoca 3, mientras la loss de entrenamiento cae de 1,0385 a 0,3588. No se documenta el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO (no aplicables a un modelo de QA extractiva). El autor no describe innovaciones tecnicas adicionales.

## Capacidades

- Respuesta a preguntas extractiva en persa: dado un contexto y una pregunta, devuelve el span de texto que responde a la pregunta.
- Localizacion de respuestas dentro de parrafos: adecuado para tareas de reading comprehension.
- Comprension lectora monolingue en persa.
- No soporta tool calling ni function calling (no es un modelo generativo ni esta disenado para ello).
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Capacidades multilingues: no declaradas; el modelo base esta especializado en persa.

## Casos de uso

- Busqueda de respuestas en documentacion interna en persa: indexar manuales o politicas de empresa y usar el modelo para extraer el fragmento concreto que responde a la consulta del empleado, sin necesidad de generar texto.
- Atencion al cliente sobre base de conocimiento: dado un articulo de ayuda en persa y la pregunta del usuario, devolver el parrafo exacto que contiene la respuesta, lo que reduce el riesgo de alucinacion frente a un modelo generativo.
- Extraccion de campos en formularios y contratos: localizar valores concretos (fechas, importes, nombres) dentro de documentos persas planteando preguntas del tipo "cual es la fecha de vencimiento".
- Sistemas de FAQ automaticas: emparejar preguntas de usuarios con respuestas existentes en un corpus persa mediante extraccion de spans.
- Asistencia a la lectura y estudio: herramienta que resalta la frase relevante de un texto persa ante una pregunta de comprension.
- Preprocesado para pipelines RAG en persa: usar el modelo como componente extractivo que selecciona el pasaje exacto antes de pasarlo a un modelo generativo, mejorando la trazabilidad de las citas.
- Anotacion semiautomatica de datasets de QA en persa: generar candidatos de respuesta sobre corpus no etiquetados para revision humana.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (conjunto de evaluacion no documentado):

| Metrica | Valor |
|---|---|
| Loss de validacion | 0,9742 |
| Exact match | 75,5 |
| F1 | 79,32 |

El `model-index` del repositorio no contiene entradas de resultados adicionales. No se han publicado comparaciones con otros modelos de QA en persa en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,65 GB en fp32 (162 millones de parametros x 4 bytes), en torno a 0,33 GB en fp16 y menos de 0,2 GB en cuantizacion de 8 bits. El tamano del repositorio (4,5 GB) incluye checkpoints de entrenamiento, no solo los pesos finales.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4090 o incluso una GTX 1650 pueden ejecutar el modelo con holgura. Para despliegue de alta concurrencia, A10G, L4 o A100 permiten procesar muchos lotes en paralelo.
- Cabe en cualquier GPU consumer y en CPU para cargas moderadas.
- Opciones de despliegue: `transformers` con pipeline `question-answering`, TorchServe, ONNX Runtime, o servidores de inferencia como TGI o vLLM (soporte de modelos encoder para QA segun version). Tambien es posible exportarlo a ONNX para inferencia en CPU.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera latencia de pocos milisegundos por consulta en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Z-Jafari/bert-fa-base-uncased-finetuned-PersianQuAD-val-60 | 162,3 M | no disponible | QA extractiva en persa | Apache 2.0 | Hugging Face |
| HooshvareLab/bert-fa-base-uncased (modelo base) | ~162 M | no disponible | LM enmascarado en persa | Apache 2.0 | Hugging Face |
| Modelos multilingues tipo mBERT / XLM-R base | 178 M / 278 M | 512 | QA multilingue (requiere ajuste) | Apache 2.0 / MIT | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada. La ventaja principal frente a mBERT o XLM-R es el ajuste especifico en persa y un vocabulario adaptado, lo que suele reducir el numero de tokens por palabra y mejorar la eficiencia; no obstante, no hay mediciones que lo confirmen en este repositorio.

## Limitaciones y advertencias

- La model card esta generada automaticamente y no documenta el dataset de entrenamiento, los usos previstos ni las limitaciones, lo que dificulta evaluar su robustez en dominios distintos al de entrenamiento.
- Riesgo de sobreajuste: la loss de validacion empeora en la tercera epoca (0,9742 frente a 0,8362 en la segunda), por lo que el checkpoint final puede no ser el optimo; convendria evaluar checkpoints intermedios.
- Solo responde en persa; no se declaran capacidades multilingues y su uso en otros idiomas producira resultados poco fiables.
- Al ser un modelo extractivo, no genera respuestas: si la respuesta no esta literalmente en el contexto, no puede formularla. Esto limita su uso en preguntas abiertas o de razonamiento.
- No hay informacion sobre sesgos; al entrenarse sobre un corpus no documentado, puede heredar sesgos del mismo.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte.
- El repositorio incluye checkpoints de entrenamiento (4,5 GB), lo que aumenta el espacio en disco necesario frente a los pesos finales.
- No se han publicado evaluaciones independientes; las metricas (EM 75,5, F1 79,32) son declaradas por el autor y el conjunto de evaluacion no esta identificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Z-Jafari/bert-fa-base-uncased-finetuned-PersianQuAD-val-60
- Modelo base: https://huggingface.co/HooshvareLab/bert-fa-base-uncased
- Documentacion de la tarea question-answering en transformers: https://huggingface.co/docs/transformers/tasks/question_answering
