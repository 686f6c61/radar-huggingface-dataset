# Z-Jafari/roberta-fa-zwnj-base-finetuned-nestedRewrite_QA

## Resumen

El modelo `Z-Jafari/roberta-fa-zwnj-base-finetuned-nestedRewrite_QA` es un ajuste fino de tipo question answering extractivo (QA) construido sobre `HooshvareLab/roberta-fa-zwnj-base`, un encoder RoBERTa en persa con tratamiento explícito del carácter ZWNJ (zero-width non-joiner). Lo publica el usuario Z-Jafari en HuggingFace y, por el nombre del ajuste (`nestedRewrite_QA`), apunta a tareas de respuesta a preguntas sobre texto persa con reescritura o normalización anidada de ZWNJ.

El modelo tiene 117.709.058 parámetros (dato real del fichero safetensors), lo que lo sitúa en la categoría "base" de ~118 M de parámetros, con licencia Apache 2.0 y pesos en safetensors. Se trata de un modelo no generativo: su salida es un span de texto extraído del contexto proporcionado, no texto libre.

Su relevancia práctica es limitada por el momento: la model card está generada automáticamente por el Trainer de HuggingFace, el conjunto de entrenamiento figura como "unknown dataset" y el modelo acumula 0 descargas y 0 likes. Aun así, resulta interesante como ejemplo de ajuste de un encoder persa con manejo de ZWNJ para QA extractivo, con métricas declaradas de exact match 60,5 y F1 65,89, y con señales claras de sobreajuste en la tercera época.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa (bidireccional), derivado de `HooshvareLab/roberta-fa-zwnj-base` |
| Parametros totales | 117.709.058 (dato real del safetensors) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la información proporcionada; los modelos RoBERTa base suelen limitarse a 512 tokens de entrada |
| Tipos de cuantizacion | No disponible de forma oficial; al publicarse en safetensors fp32 puede cuantizarse a fp16/int8 con herramientas genéricas (PyTorch, ONNX Runtime) |
| Idiomas soportados | No disponible en la metadata; el sufijo `fa` del nombre y el modelo base indican persa (farsi) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

Datos adicionales del repositorio: pipeline declarado `question-answering`, tamaño del repo 6,1 GB, creado el 2026-09-28 y actualizado el 2026-09-28, etiquetas `generated_from_trainer`, `base_model:finetune:HooshvareLab/roberta-fa-zwnj-base` y `endpoints_compatible`.

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un encoder Transformer bidireccional de estilo RoBERTa, no generativo, pensado para producir, dada una pregunta y un contexto, los índices de inicio y fin del span que contiene la respuesta. El ajuste se hizo con el `Trainer` de HuggingFace y la model card lo marca explícitamente como `generated_from_trainer`, sin descripción adicional de la arquitectura ni del dataset.

Los hiperparámetros documentados son: learning rate 2e-05, `train_batch_size` 16, `eval_batch_size` 16, semilla 42, optimizador AdamW con `fused` y betas (0,9, 0,999), epsilon 1e-08, scheduler lineal, 3 épocas y precisión mixta nativa (AMP). El entrenamiento totalizó 6.342 pasos (2.114 por época). No se documenta el número de tokens, la composición del dataset ni si hubo RLHF, DPO o una fase de instrucciones: la model card indica "unknown dataset" y "More information needed" en descripción, usos previstos y datos de entrenamiento. Por el nombre del checkpoint, es plausible que el corpus tenga relación con reescritura anidada y normalización de ZWNJ en persa, pero esto no está confirmado en la información disponible.

La curva de entrenamiento muestra una divergencia clásica entre pérdida de entrenamiento y de validación: la pérdida de entrenamiento cae de 1,0330 a 0,3807 mientras la de validación baja de 1,6451 a 1,6300 en la época 2 y sube a 1,7852 en la época 3. Esto sugiere sobreajuste a partir de la segunda época y que el mejor checkpoint probablemente no es el último.

## Capacidades

- Respuesta a preguntas extractiva: devuelve el fragmento de contexto que responde a una pregunta, con puntuación de confianza por span.
- Manejo de texto persa con ZWNJ: hereda del modelo base el tratamiento del zero-width non-joiner, relevante para tokenización correcta de palabras compuestas en farsi.
- Normalización o reescritura de texto: el sufijo `nestedRewrite` del nombre apunta a este uso, aunque la model card no lo documenta explícitamente.
- No es un modelo generativo: no produce texto libre, resúmenes ni traducciones.
- Tool calling / function calling: no consta soporte; la arquitectura encoder extractiva no está diseñada para ello.
- Agentes y razonamiento multi-paso: no consta soporte.
- Capacidades multilingües: no documentadas; la evidencia disponible apunta a persa como único idioma de trabajo.
- Visión, audio u otras modalidades: no soportadas.
- Modo "thinking" o razonamiento explícito: no disponible.

## Casos de uso

- Búsqueda de respuestas en documentación técnica persa: dado un manual o una base de conocimiento en farsi y una pregunta del usuario, el modelo devuelve el pasaje exacto que contiene la respuesta, sin generar texto nuevo y por tanto con menor riesgo de alucinación que un modelo generativo.
- Atención al cliente sobre FAQ: integrado detrás de un recuperador, permite responder consultas recurrentes extrayendo la frase relevante de la política o el artículo correspondiente, con la puntuación del span como señal de confianza para escalar a un humano.
- Componente "reader" en un pipeline RAG: combinado con un retriever (por ejemplo, un modelo de embeddings persa), actúa como lector extractivo sobre los fragmentos recuperados; su tamaño de ~118 M permite ejecutar decenas de consultas por segundo en una sola GPU.
- Extracción de datos en contratos y facturas persas: localizar campos como fechas, importes o cláusulas concretas dentro de documentos escaneados y convertidos a texto, siempre que se le proporcione el contexto y una pregunta por campo.
- Normalización de ZWNJ en corpus persas: uso como paso de preprocesado para reescribir o validar formas con zero-width non-joiner antes de indexar texto en un buscador o de entrenar otros modelos.
- Anotación asistida (human-in-the-loop): preanotar conjuntos de datos de QA en persa con spans candidatos y confidencias, dejando al anotador la validación final, lo que reduce el coste de curación.
- Evaluación de sistemas de recuperación: usar el modelo como lector de referencia para medir si el pasaje correcto llega al top-k de un retriever, aprovechando que expone exact match y F1.
- Despliegue en entornos con recursos limitados: al caber en CPU y en cualquier GPU de consumo, sirve para prototipos y demos internas sin infraestructura dedicada.

## Benchmarks y rendimiento

El `model-index` de la model card está vacío (`"results": []`), por lo que no hay benchmarks estándar publicados (MMLU, HumanEval, GSM8K, etc.). Los únicos datos disponibles son las métricas de evaluación declaradas por el autor y la curva de entrenamiento.

| Metrica | Valor |
|---|---|
| Loss (conjunto de evaluacion) | 1,7852 |
| Exact match | 60,5 |
| F1 | 65,89229292739726 |

| Perdida de entrenamiento | Epoca | Paso | Perdida de validacion |
|---|---|---|---|
| 1,0330 | 1.0 | 2114 | 1,6451 |
| 0,6199 | 2.0 | 4228 | 1,6300 |
| 0,3807 | 3.0 | 6342 | 1,7852 |

No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- Pesos en fp32: ~471 MB. En fp16: ~235 MB. En int8: ~118 MB. El repositorio ocupa 6,1 GB, probablemente porque incluye checkpoints intermedios y estados del optimizador.
- VRAM estimada para inferencia: aproximadamente 1-2 GB incluyendo activaciones y overhead del runtime; cantidades muy por debajo de cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es sobradamente suficiente; sirven desde una GTX 1050 o una RTX 2060 hasta una A100 o H100, donde el cuello de botella será la CPU de preprocesado antes que el modelo.
- Cabe en GPU de consumo: sí, en todas las gamas actuales, y también en CPU para cargas moderadas.
- Opciones de despliegue: pipeline `question-answering` de Transformers, exportación a ONNX Runtime, TorchScript o TorchServe, y servicio propio con FastAPI o un servidor de inferencia genérico. Herramientas orientadas a modelos generativos como vLLM o llama.cpp no están pensadas para QA extractivo de encoder, por lo que no son la vía recomendada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Exact match / F1 | Disponibilidad |
|---|---|---|---|---|---|---|
| Z-Jafari/roberta-fa-zwnj-base-finetuned-nestedRewrite_QA | 117,7 M | No disponible (base RoBERTa, ~512) | QA extractivo | apache-2.0 | 60,5 / 65,89 (declarado por el autor) | HuggingFace, 0 descargas |
| HooshvareLab/roberta-fa-zwnj-base | ~117 M | No disponible en esta busqueda | Modelo base sin ajuste de QA | No verificada en esta busqueda | No aplica (no es QA) | HuggingFace |
| HooshvareLab/bert-fa-base-uncased (ParsBERT) | Orden de 110-120 M | No disponible en esta busqueda | Encoder de lenguaje en persa, con variantes ajustadas para QA y clasificacion | No verificada en esta busqueda | No disponible | HuggingFace |

Los datos de los modelos alternativos no se han verificado en esta busqueda; se incluyen como referencia de categoria (encoders persas de tamano base) y deben confirmarse en sus respectivas model cards.

## Limitaciones y advertencias

- La model card no documenta el conjunto de entrenamiento ("unknown dataset"), la composición del corpus ni el proceso de recogida de datos, lo que impide auditar sesgos o cobertura temática.
- Se observa sobreajuste: la pérdida de validación sube en la tercera época (1,6300 a 1,7852) mientras la de entrenamiento sigue bajando; el último checkpoint puede no ser el mejor.
- Las métricas están declaradas únicamente por el autor y no han sido replicadas de forma independiente; el `model-index` está vacío.
- El idioma real de funcionamiento no está confirmado en la metadata; la evidencia (sufijo `fa`, modelo base persa) apunta a persa, pero no hay evaluación multilingüe.
- Riesgo de alucinación bajo en comparación con modelos generativos, ya que la salida es extractiva, pero puede devolver spans incorrectos o mal delimitados cuando la respuesta no está literalmente en el contexto.
- Sensibilidad al preprocesado de ZWNJ: si el tokenizador o el pipeline de limpieza elimina el zero-width non-joiner, la calidad de la tokenización y de la respuesta puede degradarse.
- Licencia apache-2.0, que permite uso comercial, pero conviene verificar la licencia y las condiciones del modelo base `HooshvareLab/roberta-fa-zwnj-base` antes de desplegarlo en producción.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de pruebas independientes de robustez.
- El repositorio de 6,1 GB incluye probablemente checkpoints intermedios y estados de optimizador; conviene descargar solo los pesos necesarios para inferencia.
- Al ser un modelo extractivo, no sirve para generación, resumen, traducción ni diálogo abierto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Z-Jafari/roberta-fa-zwnj-base-finetuned-nestedRewrite_QA
- Modelo base: https://huggingface.co/HooshvareLab/roberta-fa-zwnj-base
- Repositorio del autor del modelo base (HooshvareLab): no disponible en la información proporcionada
- Paper asociado: no disponible en la información proporcionada
- Demo o Space: no disponible en la información proporcionada
- Busqueda web realizada: los resultados devueltos corresponden a la letra "Z" en Wikipedia, a Z.ai y a Z-Library, y no guardan relación con el modelo; no se han encontrado enlaces técnicos relevantes.
