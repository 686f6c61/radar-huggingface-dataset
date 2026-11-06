# Z-Jafari/bert-base-multilingual-cased-finetuned-PersianQuAD-val-100

## Resumen

`bert-base-multilingual-cased-finetuned-PersianQuAD-val-100` es un ajuste fino de `google-bert/bert-base-multilingual-cased` publicado por el usuario Z-Jafari en Hugging Face. El modelo está especializado en la tarea de *question answering* extractivo (pipeline `question-answering` de Transformers) y, por el nombre del repositorio, se ha entrenado sobre una variante del conjunto PersianQuAD, un corpus de preguntas y respuestas en persa derivado de SQuAD. El checkpoint se ha generado con la infraestructura `Trainer` de Hugging Face, como indican las etiquetas `generated_from_trainer` y el `model-index` vacío.

Arquitecturalmente es un BERT *base* multilingüe con encoder de 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, con un total de 177.264.386 parámetros. Se distribuye en formato safetensors bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. El contexto máximo está limitado a 512 tokens, propio de la familia BERT.

La relevancia práctica de este checkpoint es acotada: no es un modelo generativo ni un LLM conversacional, sino un extractor de respuestas sobre pasajes de texto. Su utilidad real depende de la calidad del corpus PersianQuAD y de la evaluación declarada por el autor (EM 77,1 y F1 81,15 sobre el conjunto de validación), sin que se hayan publicado detalles sobre la composición exacta del dataset ni sobre la partición empleada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (BERT base, 12 capas, 768 hidden, 12 cabezas) |
| Parametros totales | 177.264.386 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de BERT) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; admite cuantización dinámica a int8 vía PyTorch, no documentada por el autor) |
| Idiomas soportados | no disponible (modelo base multilingüe con 104 idiomas; el ajuste fino se orienta a persa) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-multilingual-cased`, un encoder Transformer bidireccional con vocabulario *cased* de aproximadamente 119.000 tokens y 12 capas. Sobre esa base se ha añadido la cabeza estándar de question answering (clasificación de posiciones de inicio y fin sobre la secuencia de entrada). El ajuste se ha realizado con el `Trainer` de Transformers 5.22.0 sobre PyTorch 2.11.0+cu130, con precisión mixta nativa (AMP), optimizador AdamW *fused* con betas (0,9; 0,999) y epsilon 1e-8, learning rate 2e-5, scheduler lineal, batch de 16 en entrenamiento y evaluación, semilla 42 y 3 épocas completas.

La evolución de la pérdida de validación refleja un sobreajuste moderado a partir de la segunda época: 0,8259 en la época 1, 0,7909 en la época 2 y 0,8441 en la época 3, mientras la pérdida de entrenamiento cae de 0,9814 a 0,4080. El autor no documenta el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de aumento de datos o filtrado. Tampoco se indica si el conjunto PersianQuAD empleado es la versión original, una traducción o una submuestra (el sufijo `val-100` sugiere una partición de validación de 100 ejemplos, pero no se confirma en la model card).

## Capacidades

- Question answering extractivo: localiza el span de respuesta dentro de un pasaje de contexto dado.
- Comprensión lectora multilingüe heredada del modelo base, con foco declarado en persa.
- Codificación de texto en 104 idiomas (capacidad del checkpoint base, no validada en el ajuste).
- No soporta generación de texto libre, razonamiento multi-paso ni tool calling.
- No soporta function calling ni uso como agente.
- No dispone de modo *thinking*, visión, audio ni multimodalidad.
- No es adecuado para tareas de resumen, traducción o diálogo abierto.

## Casos de uso

- Búsqueda de respuestas en documentación técnica en persa: dado un fragmento de manual o artículo, el modelo devuelve el span exacto que responde a la consulta del usuario, integrándose en un pipeline de recuperación + lectura (RAG extractivo).
- Asistencia a atención al cliente sobre FAQs persas: con pasajes de la base de conocimiento como contexto, el modelo extrae la respuesta literal, reduciendo el riesgo de alucinación frente a un LLM generativo.
- Extracción de campos en formularios y contratos: localización de valores concretos (fechas, importes, nombres) dentro de documentos administrativos en persa.
- Anotación semiautomática de corpus QA: generación de spans candidatos para revisión humana en proyectos de construcción de datasets.
- Evaluación comparativa de modelos QA en persa: checkpoint ligero (177 M de parámetros) útil como línea base en experimentos académicos.
- Despliegue en entornos con recursos limitados: al ser un encoder de 177 M de parámetros, cabe en CPU y en GPUs de gama baja para inferencia por lotes.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| Conjunto de validación PersianQuAD (partición no especificada) | Exact Match | 77,1 |
| Conjunto de validación PersianQuAD (partición no especificada) | F1 | 81,15 |
| Conjunto de validación PersianQuAD (partición no especificada) | Loss | 0,8441 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible. El `model-index` del repositorio está vacío, por lo que los datos anteriores proceden únicamente del texto de la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,7 GB para los pesos (177 M × 4 bytes), más activaciones y overhead del runtime; en la práctica, menos de 2 GB.
- VRAM estimada en fp16: aproximadamente 0,35 GB para los pesos.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para inferencia por lotes pequeños.
- GPU recomendadas para alto throughput: A100, H100 o L4 para servir múltiples peticiones concurrentes.
- Opciones de despliegue: `transformers` con pipeline `question-answering`, `vLLM` (soporte limitado para modelos encoder-only), `TGI`, `ONNX Runtime` y `TorchScript`. `llama.cpp` y `Ollama` no están orientados a este tipo de modelo.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Z-Jafari/bert-base-multilingual-cased-finetuned-PersianQuAD-val-100 | 177 M | 512 | QA extractivo (persa) | Apache 2.0 | Hugging Face |
| google-bert/bert-base-multilingual-cased | 178 M | 512 | Modelo base multilingüe | Apache 2.0 | Hugging Face |
| Z-Jafari/bert-base-multilingual-cased-finetuned-DS_QA | no disponible | 512 | QA extractivo | no disponible | Hugging Face |
| Z-Jafari/bert-base-multilingual-cased-finetuned-PersianQuAD-val-None | no disponible | 512 | QA extractivo | no disponible | Hugging Face |

Los dos checkpoints del mismo autor (`DS_QA` y `PersianQuAD-val-None`) son variantes del mismo pipeline de ajuste y no aportan una comparación independiente. No se dispone de datos de rendimiento de alternativas como XLM-RoBERTa o ParsBERT en la información proporcionada.

## Limitaciones y advertencias

- Model card incompleta: el autor no documenta el dataset de entrenamiento, la partición de evaluación ni el proceso de preprocesado, lo que impide reproducir los resultados.
- Riesgo de sobreajuste: la pérdida de validación aumenta en la tercera época (0,8441 frente a 0,7909 en la segunda), por lo que el checkpoint final puede no ser el óptimo.
- Sesgos: no documentados; al heredar el modelo base multilingüe, puede arrastrar sesgos de género, origen y religión presentes en los corpus de entrenamiento originales.
- Alucinación: al ser un modelo extractivo, no genera texto libre, pero puede devolver spans incorrectos o vacíos cuando la respuesta no está contenida literalmente en el contexto.
- Limitación de contexto: 512 tokens; pasajes más largos requieren truncado o segmentación previa.
- Idiomas: aunque el modelo base es multilingüe, el ajuste fino se orienta a persa y no se han validado capacidades en otros idiomas tras el fine-tuning.
- Uso comercial: permitido por la licencia Apache 2.0, sin restricciones adicionales conocidas.
- Producción: sin métricas de latencia, throughput ni robustez frente a dominios fuera de PersianQuAD; se recomienda evaluar en el dominio objetivo antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/Z-Jafari/bert-base-multilingual-cased-finetuned-PersianQuAD-val-100
- Modelo base: https://huggingface.co/google-bert/bert-base-multilingual-cased
- Variante relacionada: https://huggingface.co/Z-Jafari/bert-base-multilingual-cased-finetuned-PersianQuAD-val-None
- Variante relacionada: https://huggingface.co/Z-Jafari/bert-base-multilingual-cased-finetuned-DS_QA
