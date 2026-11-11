# Z-Jafari/bert-base-multilingual-cased-finetuned-PersianQuAD-val-60

## Resumen

`Z-Jafari/bert-base-multilingual-cased-finetuned-PersianQuAD-val-60` es un ajuste fino (fine-tuning) de `google-bert/bert-base-multilingual-cased` especializado en la tarea de respuesta a preguntas extractiva (question answering) sobre texto en persa. Lo publica el usuario Z-Jafari en Hugging Face y se genera con el `Trainer` de la libreria `transformers`, por lo que la model card es en gran medida automatica y carece de documentacion sobre el dataset de entrenamiento y los usos previstos.

El modelo parte de BERT multilingual cased, un transformer encoder-only con 177.264.386 parametros y tokenizador WordPiece con vocabulario multilingue. El ajuste se ha realizado sobre una version del dataset PersianQuAD (la model card no especifica la composicion exacta) durante 3 epocas con learning rate 2e-05, batch de 16 y precision mixta nativa. Los resultados declarados en evaluacion son una loss de 0.8241, un exact match de 78.3 y un F1 de 82.31.

Su relevancia es limitada y muy especifica: sirve como pieza de referencia para sistemas de QA extractivo en persa con un modelo pequeno (unos 700 MB en fp32), desplegable en CPU o en GPUs de gama baja. No es un modelo generativo ni soporta tool calling, agentes ni razonamiento multi-paso; es un extractor de spans sobre un contexto dado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (BERT base) |
| Parametros totales | 177.264.386 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (BERT base admite hasta 512 tokens de entrada) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | no disponible de forma explicita; el modelo base es multilingue (104 idiomas) y el ajuste se orienta a persa |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de BERT base multilingual cased: 12 capas de transformer encoder, atencion multi-cabeza, embeddings WordPiece con distincion de mayusculas y un cabezal de question answering sobre las representaciones de salida para predecir los indices de inicio y fin del span de respuesta. No hay componentes MoE, SSM ni mecanismos de atencion lineal; es un modelo denso clasico.

El entrenamiento se realizo con `transformers` 5.22.0, PyTorch 2.11.0+cu130, `datasets` 4.8.5 y `tokenizers` 0.23.3. Hiperparametros: learning rate 2e-05, `train_batch_size` 16, `eval_batch_size` 16, semilla 42, optimizador AdamW con `betas=(0.9, 0.999)` y `epsilon=1e-08`, scheduler lineal, 3 epocas y AMP nativo. El entrenamiento consta de 4134 pasos (1378 por epoca). La evolucion de la loss de validacion es 0.7945 (epoca 1), 0.7747 (epoca 2) y 0.8241 (epoca 3), lo que sugiere un ligero sobreajuste a partir de la segunda epoca. No se documenta el dataset exacto, el numero de tokens de entrenamiento ni si hubo etapas de RLHF o DPO (no aplicables en un encoder extractivo).

## Capacidades

- Respuesta a preguntas extractiva: dado un contexto y una pregunta en persa, devuelve el span de texto que responde a la pregunta.
- Comprension lectora multilingue heredada del modelo base, aunque el ajuste esta orientado a persa.
- Clasificacion de tokens y extraccion de spans, reutilizable para tareas derivadas como NER o seleccion de respuestas.
- No soporta generacion de texto libre.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Capacidad multilingue limitada en la practica por el ajuste especifico sobre PersianQuAD.

## Casos de uso

- Busqueda de respuestas en documentacion interna en persa: indexar manuales o bases de conocimiento y usar el modelo para localizar el fragmento exacto que responde a una consulta del usuario, con un F1 declarado de 82.31 sobre el conjunto de evaluacion.
- Atencion al cliente sobre FAQ en persa: dado un articulo de ayuda como contexto y la pregunta del cliente, extraer la frase concreta de respuesta, evitando generacion libre y reduciendo el riesgo de alucinacion.
- Extraccion de campos en formularios y contratos: localizar valores concretos (fechas, nombres, importes) dentro de un documento en persa tratando el campo como pregunta y el documento como contexto.
- Enriquecimiento de pipelines de RAG: usar el modelo como lector extractivo sobre los fragmentos recuperados por un retriever, devolviendo el span de respuesta con su score para filtrar resultados de baja confianza.
- Anotacion asistida de datasets de QA en persa: preanotar pares pregunta-respuesta sobre corpus nuevos y revisar manualmente, aprovechando el EM de 78.3 declarado.
- Despliegue en entornos con recursos limitados: al tener 177 millones de parametros, puede ejecutarse en CPU o en GPUs consumer para tareas de extraccion de spans con baja latencia y sin necesidad de aceleradores de gama alta.
- Moderacion y verificacion de respuestas: comprobar si una respuesta candidata aparece literalmente en el contexto fuente, como filtro de fidelidad en sistemas de QA.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre el conjunto de evaluacion (no se especifica el split exacto ni el numero de ejemplos):

| Metrica | Valor |
|---|---|
| Loss (evaluacion) | 0.8241 |
| Exact match | 78.3 |
| F1 | 82.31324064824058 |

Evolucion durante el entrenamiento:

| Epoca | Paso | Training loss | Validation loss |
|---|---|---|---|
| 1.0 | 1378 | 0.9673 | 0.7945 |
| 2.0 | 2756 | 0.5986 | 0.7747 |
| 3.0 | 4134 | 0.3773 | 0.8241 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0.7 GB solo para pesos, mas activaciones y memoria del tokenizador; en la practica cabe en cualquier GPU con 2 GB o mas.
- En fp16: alrededor de 0.35 GB de pesos, aunque el modelo se distribuye en safetensors sin variantes cuantizadas documentadas.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es mas que suficiente; tambien funciona en CPU para cargas moderadas.
- Cabe en GPU consumer: si, en practicamente todas las GPU con al menos 2 GB de VRAM.
- Opciones de despliegue: `transformers` con pipeline `question-answering`, `optimum`/ONNX Runtime para CPU, y servidores de inferencia compatibles con el tag `endpoints_compatible` de Hugging Face.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Z-Jafari/bert-base-multilingual-cased-finetuned-PersianQuAD-val-60 | 177.264.386 | no disponible (BERT base: 512 tokens) | QA extractivo en persa | apache-2.0 | Hugging Face, 66 descargas |
| google-bert/bert-base-multilingual-cased | 177.264.386 | 512 tokens | Modelo base multilingue | apache-2.0 | Hugging Face |
| XLM-RoBERTa base (referencia de la misma categoria) | no disponible en la informacion proporcionada | no disponible | Modelo base multilingue | no disponible en la informacion proporcionada | Hugging Face |

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada; la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- La model card es automatica y no documenta el dataset de entrenamiento, el split de evaluacion ni el numero de ejemplos, por lo que las metricas declaradas no son reproducibles con la informacion disponible.
- El modelo solo responde extrayendo spans del contexto proporcionado; si la respuesta no esta en el contexto, no puede generarla.
- La loss de validacion empeora en la tercera epoca (0.8241 frente a 0.7747 en la segunda), lo que indica posible sobreajuste; conviene validar en un conjunto propio antes de usar en produccion.
- El ajuste esta orientado a persa; el rendimiento en otros idiomas del modelo base no esta documentado y probablemente sea inferior.
- Riesgo de sesgos heredados del corpus multilingue de BERT y del dataset PersianQuAD, no evaluado por el autor.
- Riesgo de alucinacion bajo en la practica por ser extractivo, pero puede devolver spans incorrectos o vacios cuando la pregunta es ambigua o el contexto es ruidoso.
- Licencia apache-2.0: permite uso comercial, pero se recomienda revisar las condiciones de los datos de entrenamiento, no documentadas.
- No apto para generacion de texto, agentes, tool calling ni tareas multimodales.
- El repositorio ocupa 6.4 GB pese a que los pesos suman unos 0.7 GB, lo que sugiere artefactos adicionales de entrenamiento (checkpoints, optimizador) en el repo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Z-Jafari/bert-base-multilingual-cased-finetuned-PersianQuAD-val-60
- Modelo base: https://huggingface.co/google-bert/bert-base-multilingual-cased
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
