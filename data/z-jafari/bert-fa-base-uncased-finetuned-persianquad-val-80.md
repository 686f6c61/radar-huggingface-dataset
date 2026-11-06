# Z-Jafari/bert-fa-base-uncased-finetuned-PersianQuAD-val-80

## Resumen

`bert-fa-base-uncased-finetuned-PersianQuAD-val-80` es un modelo de respuesta a preguntas extractiva (question answering) en persa, resultado del ajuste fino de `HooshvareLab/bert-fa-base-uncased` sobre el conjunto de datos PersianQuAD. Lo publica el usuario Z-Jafari en Hugging Face bajo licencia Apache 2.0, con un total de 162.252.290 parámetros y pesos en formato safetensors.

El modelo resuelve la tarea de localizar el fragmento de texto (span) que responde a una pregunta dada un contexto en persa, una capacidad útil para sistemas de búsqueda documental, asistentes sobre corpus locales y pipelines de extracción de información en lengua persa, donde escasean los modelos ajustados específicamente para QA.

La relevancia es acotada: se trata de un ajuste fino experimental, con cero descargas y cero likes en el momento de la consulta, cuya model card está generada automáticamente por el `Trainer` y no documenta el conjunto de datos ni los resultados de evaluación más allá de la pérdida. Es, por tanto, un artefacto de investigación más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (transformer encoder bidireccional), ajustado para question answering extractivo |
| Parametros totales | 162.252.290 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el BERT base subyacente admite 512 tokens; el autor no lo declara) |
| Tipos de cuantizacion | no disponible (pesos safetensors en el repo; no se publican variantes GGUF/ONNX) |
| Idiomas soportados | no disponible en la model card; por el modelo base y el dataset, persa (farsi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `HooshvareLab/bert-fa-base-uncased`, un BERT base preentrenado en persa, y se ajusta para la tarea de question answering extractiva, es decir, con una cabeza de clasificación de inicio y fin de span sobre la secuencia de contexto. La arquitectura es, por tanto, un transformer encoder estándar de tipo BERT, sin mecanismos de atención lineal ni decodificación especulativa.

El ajuste fino se realizó con el `Trainer` de Transformers durante 3 épocas, con `learning_rate` de 2e-05, `train_batch_size` y `eval_batch_size` de 16, semilla 42, optimizador AdamW con `betas=(0.9,0.999)` y `epsilon=1e-08`, scheduler lineal y precisión mixta nativa (AMP). El conjunto de entrenamiento es PersianQuAD, aunque la model card lo describe como "unknown dataset" y no detalla el número de tokens, la composición ni si hubo validación o partición específica (el sufijo "val-80" sugiere un split de validación, pero no se documenta). No se menciona RLHF, DPO ni ninguna innovación técnica adicional. Las versiones de framework declaradas son Transformers 5.22.0, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.3.

## Capacidades

- Respuesta a preguntas extractiva en persa: dado un contexto y una pregunta, devuelve el span de texto que contiene la respuesta.
- Comprensión lectora sobre documentos: localización de evidencia textual en pasajes.
- Extracción de información estructurada a partir de texto no estructurado en persa.
- Integración con la pipeline `question-answering` de Transformers.
- No soporta tool calling ni function calling: es un encoder de QA, no un modelo generativo.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües no documentadas; el modelo base y el dataset son de persa.
- No dispone de modo "thinking", visión, audio ni generación libre de texto.

## Casos de uso

- Búsqueda documental con respuesta extractiva: indexar un corpus de documentos en persa y usar el modelo para devolver el fragmento exacto que responde a la consulta del usuario, lo que reduce la necesidad de un generador y facilita la trazabilidad de la cita.
- Asistente de atención al cliente sobre base de conocimiento: conectar el modelo a un FAQ en persa para que devuelva el pasaje relevante de la política o del manual, con la ventaja de que la respuesta es literal y verificable.
- Extracción de campos en formularios y contratos: localizar valores concretos (fechas, importes, nombres) en textos administrativos persas mediante preguntas dirigidas sobre el contexto.
- Enriquecimiento de pipelines de RAG: usar el modelo como componente de "answer span extraction" sobre los fragmentos recuperados por un buscador vectorial, antes de pasarlos a un modelo generativo o directamente al usuario.
- Anotación asistida de datasets de QA: preanotar pares pregunta-respuesta sobre corpus persas para revisión humana, dado el bajo coste de inferencia de un BERT base.
- Evaluación comparativa de modelos persas: servir como baseline de QA extractivo frente a otros ajustes de la misma familia (la colección del autor incluye otros modelos ajustados sobre PersianQuAD).
- Investigación académica en PLN persa: experimentación con particiones de PersianQuAD y estudio de la degradación por sobreajuste (ver sección de benchmarks).

## Benchmarks y rendimiento

La model card declara únicamente la pérdida de validación; el `model-index` no contiene resultados (lista `results` vacía). No se han publicado resultados de benchmarks (EM, F1, MMLU, HumanEval, GSM8K) en la información disponible.

| Metrica | Valor |
|---|---|
| Validation loss (epoca 1) | 0.8095 |
| Validation loss (epoca 2) | 0.8339 |
| Validation loss (epoca 3) | 0.9039 |
| Training loss (epoca 1) | 1.0258 |
| Training loss (epoca 2) | 0.6139 |
| Training loss (epoca 3) | 0.3646 |
| Exact Match / F1 | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 650 MB solo para pesos (162 M de parámetros × 4 bytes), más activaciones y overhead del runtime; en la práctica, menos de 2 GB en total.
- VRAM estimada en fp16/bf16: aproximadamente 325 MB para pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, T4, L4, A10, A100 o H100 son suficientes y en la mayoría de casos sobredimensionadas.
- Cabe en GPU consumer: sí, en cualquier modelo con 4 GB o más; también puede ejecutarse en CPU con latencias aceptables para volúmenes moderados.
- Opciones de despliegue: pipeline `question-answering` de Transformers, `text-generation-inference` no aplica (no es generativo), vLLM no soporta de forma nativa este tipo de cabeza de QA, llama.cpp/Ollama no ofrecen variantes publicadas; el despliegue realista es Transformers con `AutoModelForQuestionAnswering`, o exportación a ONNX para servir con ONNX Runtime.
- Latencia y throughput: no disponibles; para un BERT base con contexto de 512 tokens se espera un orden de milisegundos por consulta en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Z-Jafari/bert-fa-base-uncased-finetuned-PersianQuAD-val-80` | 162 M | no disponible (base BERT: 512) | QA extractivo en persa | Apache 2.0 | Hugging Face, 0 descargas |
| `HooshvareLab/bert-fa-base-uncased` | ~162 M | 512 | encoder de propósito general en persa | no disponible en la informacion | Hugging Face (modelo base) |
| Otros ajustes de la colección `Z-Jafari/Base-Models-Finetuned-on-PersianQuAD` | variable | variable | QA extractivo en persa | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento (EM/F1) de ninguno de los modelos comparados en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Model card generada automáticamente: el autor no ha documentado el dataset, los usos previstos ni las limitaciones; la sección de datos de entrenamiento dice "More information needed".
- Sobreajuste probable: la pérdida de validación aumenta de 0.8095 a 0.9039 entre la primera y la tercera época mientras la de entrenamiento cae de 1.0258 a 0.3646, lo que indica que el mejor checkpoint probablemente no es el final.
- Sin métricas de calidad publicadas: no hay Exact Match ni F1 sobre el conjunto de evaluación, por lo que no se puede afirmar su rendimiento real en QA.
- Riesgo de alucinación estructural: al ser extractivo, no inventa texto, pero puede devolver spans incorrectos o fuera de lugar cuando la respuesta no está en el contexto.
- Cobertura lingüística limitada: orientado a persa; no se declaran otros idiomas y su uso en castellano u otras lenguas no está soportado.
- Sin soporte de tool calling, agentes ni generación: no es adecuado para tareas conversacionales abiertas.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo base `HooshvareLab/bert-fa-base-uncased` debe verificarse por separado, ya que su licencia no se declara en la información disponible.
- Madurez nula: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Z-Jafari/bert-fa-base-uncased-finetuned-PersianQuAD-val-80
- Modelo base: https://huggingface.co/HooshvareLab/bert-fa-base-uncased
- Colección de modelos ajustados sobre PersianQuAD: https://huggingface.co/collections/Z-Jafari/base-models-finetuned-on-persianquad
- Variante relacionada del mismo autor: https://huggingface.co/Z-Jafari/bert-fa-base-uncased-finetuned-PersianQuAD_Factoid_Test-matched-ANS_LEN
