# Z-Jafari/xlm-roberta-large-finetuned-PersianQuAD-val-80

## Resumen

xlm-roberta-large-finetuned-PersianQuAD-val-80 es un ajuste fino del modelo multilingue FacebookAI/xlm-roberta-large para la tarea de respuesta a preguntas extractiva (question answering) sobre texto en persa. Lo publica el usuario Z-Jafari en Hugging Face y esta pensado especificamente para localizar la respuesta dentro de un parrafo de contexto, no para generar texto libre. El modelo base es un transformer encoder-only de tipo RoBERTa con 558.842.882 parametros, lo que lo situa en la categoria de modelos grandes para comprension lectora.

El ajuste se ha realizado sobre un conjunto de datos que el autor no documenta en la model card (aparece como "unknown dataset"), aunque el nombre del repositorio sugiere que se trata de PersianQuAD, un corpus de QA extractivo en persa, con un subconjunto de validacion del 80 %. Los resultados declarados en la model card son notables para la tarea: 87,5 de exact match y 89,75 de F1 sobre el conjunto de evaluacion, con una perdida de validacion de 0,7657.

Su relevancia practica es acotada pero concreta: cubre un nicho poco poblado como es el QA extractivo en persa sobre una arquitectura grande y multilingue, con licencia MIT, lo que permite uso comercial sin restricciones. No obstante, la documentacion es practicamente inexistente y el modelo no declara idiomas soportados ni detalles del dataset de entrenamiento, lo que limita su reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (RoBERTa / XLM-RoBERTa large) |
| Parametros totales | 558.842.882 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (XLM-RoBERTa large soporta hasta 512 tokens de entrada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers) |
| Idiomas soportados | no disponible (modelo base multilingue de 100 idiomas; ajuste orientado a persa) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de XLM-RoBERTa large, un transformer encoder-only con atencion bidireccional completa, 24 capas, 16 cabezas de atencion y un tamano de representacion oculto de 1024. Sobre esta base se ha anadido una cabeza de question answering (clasificacion de posiciones de inicio y fin de la respuesta) y se ha ajustado de forma supervisada sobre pares pregunta-contexto-respuesta. El entrenamiento uso AdamW con betas (0,9; 0,999), epsilon 1e-08, learning rate 2e-05, scheduler lineal, batch de 16 en entrenamiento y evaluacion, semilla 42, tres epocas y precision mixta nativa (AMP). El autor no documenta el numero de tokens de entrenamiento ni la composicion del dataset.

Los resultados de entrenamiento muestran un patron tipico de sobreajuste leve: la perdida de entrenamiento baja de 0,7829 a 0,3160 entre la primera y la tercera epoca, mientras que la perdida de validacion se estanca (0,7060 en la epoca 1, 0,7049 en la epoca 2) y empeora en la tercera (0,7657). Esto sugiere que la mejor epoca podria haber sido la segunda, aunque el autor reporta las metricas finales. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal ni tecnicas de RLHF, ya que se trata de un ajuste supervisado clasico de QA extractivo.

## Capacidades

- Respuesta a preguntas extractiva: dado un contexto y una pregunta, devuelve el fragmento exacto del contexto que responde a la pregunta (no genera texto nuevo).
- Comprension lectora en persa: el ajuste esta orientado al corpus PersianQuAD, por lo que su rendimiento esperado es mejor en persa que en otros idiomas.
- Capacidad multilingue heredada: al derivar de XLM-RoBERTa large, conserva representaciones para aproximadamente 100 idiomas, aunque el ajuste especifico puede degradar el rendimiento en idiomas distintos del persa.
- Integracion con el pipeline `question-answering` de transformers: funciona de forma directa con `pipeline("question-answering", model=...)`.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No soporta generacion de texto libre, codigo, matematicas ni vision.
- No dispone de modo "thinking" ni capacidades de audio.

## Casos de uso

- Busqueda de respuestas en documentacion corporativa en persa: indexar manuales, politicas internas o bases de conocimiento y usar el modelo para extraer la frase exacta que responde a la consulta del empleado, con la ventaja de que la respuesta es literal y verificable.
- Atencion al cliente sobre FAQ: dado un contexto con las preguntas frecuentes y una consulta del usuario, el modelo localiza el fragmento relevante; es adecuado porque la tarea es extractiva y evita alucinaciones al no generar texto nuevo.
- Extraccion de campos en formularios y contratos: localizar valores concretos (fechas, importes, nombres) dentro de un documento persa planteando cada campo como una pregunta.
- Sistemas de lectura comprensiva para evaluacion academica: usar el modelo como componente de referencia en benchmarks de QA en persa, dado que reporta 87,5 EM y 89,75 F1 sobre su conjunto de validacion.
- Enriquecimiento de motores de busqueda: combinar un recuperador (BM25 o embeddings) con este modelo como reranker extractivo para devolver el pasaje exacto que responde a la consulta.
- Procesamiento de prensa y archivos historicos en persa: extraer respuestas puntuales de articulos o transcripciones para tareas de analisis documental o periodismo asistido.
- Asistente de lectura para estudiantes: subir un texto en persa y formular preguntas sobre su contenido, obteniendo el fragmento literal que responde.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre el conjunto de evaluacion:

| Metrica | Valor |
|---|---|
| Exact match | 87,5 |
| F1 | 89,75138528138524 |
| Loss (evaluacion) | 0,7657 |
| Loss (entrenamiento, epoca 3) | 0,3160 |
| Loss (validacion, epoca 1) | 0,7060 |
| Loss (validacion, epoca 2) | 0,7049 |
| Loss (validacion, epoca 3) | 0,7657 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible, ni el model-index contiene entradas de resultados.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,2 GB solo para pesos, mas activaciones y overhead del runtime; en la practica unos 3-4 GB.
- VRAM estimada en fp16/bf16: aproximadamente 1,1 GB para pesos, con un total practico de 2-3 GB.
- VRAM estimada en int8: aproximadamente 0,6 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema. Para lotes grandes, A100 o H100 son preferibles.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1660 6 GB en adelante) e incluso en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: transformers con pipeline `question-answering`, Text Generation Inference no aplica (no es generativo), vLLM no es la via natural para un encoder-only, ONNX Runtime u Optimum para inferencia optimizada, y TorchScript/Triton para servir en produccion.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al ser un encoder de 24 capas con contexto de hasta 512 tokens, la latencia por peticion en GPU moderna suele ser de decenas de milisegundos, pero no hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Z-Jafari/xlm-roberta-large-finetuned-PersianQuAD-val-80 | 558,8 M | hasta 512 tokens (base) | QA extractivo en persa | MIT | Hugging Face |
| FacebookAI/xlm-roberta-large | 558,8 M | hasta 512 tokens | Modelo base multilingue (MLM) | MIT | Hugging Face |
| Google mBERT (bert-base-multilingual-cased) | 178 M | hasta 512 tokens | Modelo base multilingue | Apache 2.0 | Hugging Face |
| DeepPavlov/rubert-base-cased (referencia de QA en ruso) | 178 M | hasta 512 tokens | QA extractivo en ruso | Apache 2.0 | Hugging Face |

La comparacion directa con otros modelos de QA en persa no esta disponible en la informacion proporcionada. Frente al modelo base, este ajuste anade la cabeza de QA y el entrenamiento supervisado; frente a mBERT, triplica el numero de parametros a costa de mayor VRAM y latencia.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: el autor no detalla el dataset de entrenamiento, la composicion del corpus ni los idiomas soportados.
- Riesgo de sobreajuste: la perdida de validacion empeora en la tercera epoca, por lo que las metricas reportadas pueden no generalizar a dominios distintos de PersianQuAD.
- Alucinacion: al ser extractivo, no inventa texto, pero puede devolver un fragmento incorrecto o irrelevante si la respuesta no esta en el contexto; el riesgo es de falsa localizacion, no de fabricacion.
- Limitacion de contexto: la arquitectura base esta limitada a 512 tokens de entrada, insuficiente para documentos largos sin troceado previo.
- Sesgos: no documentados por el autor; al derivar de XLM-RoBERTa, puede heredar sesgos presentes en los corpus multilingues de preentrenamiento.
- Licencia MIT: permite uso comercial y modificacion, pero conviene conservar el aviso de copyright y verificar la licencia del modelo base (tambien MIT).
- Idoneidad para produccion: el modelo tiene 69 descargas y 0 likes en el momento de la consulta, sin validacion externa conocida; se recomienda evaluarlo en el dominio objetivo antes de desplegarlo.
- Fecha de creacion inusual (2026-11-07) que conviene verificar en el repositorio antes de integrarlo en pipelines criticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Z-Jafari/xlm-roberta-large-finetuned-PersianQuAD-val-80
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- Paper de XLM-RoBERTa (Unsupervised Cross-lingual Representation Learning at Scale): https://arxiv.org/abs/1911.02116
- Documentacion de la tarea question-answering en transformers: https://huggingface.co/docs/transformers/tasks/question_answering
