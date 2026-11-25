# Z-Jafari/bert-fa-base-uncased-finetuned-Reletive_Selection

## Resumen

`bert-fa-base-uncased-finetuned-Reletive_Selection` es un ajuste fino del modelo `HooshvareLab/bert-fa-base-uncased`, un encoder BERT base entrenado para persa, especializado en la tarea de *question answering* (extraccion de respuestas sobre un contexto). Lo publica el usuario Z-Jafari en Hugging Face bajo licencia Apache 2.0 y esta generado con la libreria `transformers` mediante `Trainer`, por lo que su model card es practicamente automatica y apenas aporta informacion sobre el dataset de entrenamiento.

El modelo tiene 162.252.290 parametros (162,25 M), lo que corresponde a la configuracion estandar de BERT base (12 capas, 768 dimensiones ocultas, 12 cabezas de atencion). El nombre sugiere que el ajuste se ha realizado sobre una tarea de seleccion de relativos o resolucion de referencias relativas en persa, aunque esta interpretacion no esta confirmada en la informacion disponible. Es relevante para quienes necesitan un extractor de respuestas ligero en persa que pueda ejecutarse en CPU o en GPUs de gama baja.

El interes practico es limitado pero claro: se trata de un modelo pequeno, con licencia permisiva, compatible con los endpoints de Hugging Face y con pesos en safetensors, adecuado para prototipos de QA extractivo en persa. Su principal debilidad es la falta de documentacion: no se especifica el dataset, no hay resultados de benchmarks declarados y el modelo base es de 2019, por lo que compite con alternativas mas modernas y mejor documentadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT base (12 capas, 768 ocultas, 12 cabezas) |
| Parametros totales | 162.252.290 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de BERT base, tipicamente 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; compatible con cuantizacion estandar via transformers/bitsandbytes) |
| Idiomas soportados | no disponible (modelo base en persa) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un BERT base estandar, es decir, un transformer encoder bidireccional con 12 capas, 768 dimensiones ocultas y 12 cabezas de atencion, sobre el que se anade una cabeza de question answering para predecir los indices de inicio y fin de la respuesta dentro de un contexto. El modelo base `HooshvareLab/bert-fa-base-uncased` es un BERT entrenado especificamente para persa por el equipo HooshvareLab, con tokenizador propio y vocabulario adaptado al idioma.

El ajuste fino se realizo con `Trainer` de transformers durante 3 epocas, con learning rate 2e-05, batch size de 16 (entrenamiento y evaluacion), semilla 42, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal y precision mixta nativa (AMP). La perdida de entrenamiento bajo de 0,6483 a 0,2077, mientras que la perdida de validacion empeoro de 1,1063 a 1,4056, lo que indica sobreajuste a partir de la primera epoca. El dataset de entrenamiento no esta especificado ("unknown dataset" segun la model card) y no se documenta si hubo RLHF, DPO ni ninguna innovacion tecnica adicional.

## Capacidades

- Question answering extractivo: dado un contexto y una pregunta en persa, devuelve el fragmento de texto que responde a la pregunta.
- Comprension lectora en persa: el modelo base esta entrenado para ese idioma, aunque el ajuste fino no documenta el dominio del dataset.
- Ejecucion ligera: 162 M de parametros permiten inferencia en CPU y en GPUs de gama baja.
- Compatibilidad con la pipeline `question-answering` de transformers.
- No soporta tool calling ni function calling de forma nativa.
- No soporta agentes ni razonamiento multi-paso: es un encoder extractivo, no un modelo generativo.
- No soporta vision, audio ni modo thinking.
- Capacidades multilingues no documentadas; se asume persa por el modelo base, pero no esta confirmado.

## Casos de uso

- Busqueda de respuestas en documentacion interna en persa: dado un corpus de manuales o politicas, el modelo localiza el fragmento exacto que responde a una consulta del usuario, sin generar texto nuevo y reduciendo el riesgo de alucinacion.
- Extraccion de campos en formularios y contratos persas: se plantea la pregunta "cual es el numero de contrato" sobre el texto del documento y el modelo devuelve el span correspondiente.
- Asistente de FAQ sobre productos: con una base de preguntas frecuentes en persa, el modelo selecciona la respuesta mas relevante dentro de cada entrada, integrable en un backend ligero.
- Preprocesado para pipelines RAG: como reranker o extractor de evidencia tras la recuperacion de documentos, aportando el span concreto que respalda una respuesta generada por otro modelo.
- Analisis de resenas y encuestas en persa: extraccion de la frase que justifica una opinion o sentimiento dentro de un texto libre.
- Prototipado rapido en entornos con recursos limitados: al ser un modelo de 162 M, se puede servir en una sola GPU consumer o en CPU para demos y pruebas de concepto.
- Anotacion semiautomatica de datasets de QA en persa: el modelo propone spans de respuesta que un anotador humano revisa, acelerando la creacion de corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de evaluacion declarado por el autor es la perdida de validacion final de 1,4056, junto con la curva de entrenamiento (0,6483 / 1,1063 en la epoca 1; 0,3569 / 1,2544 en la epoca 2; 0,2077 / 1,4056 en la epoca 3). El campo `model-index` del modelo no contiene resultados.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,65 GB solo para pesos, mas activaciones; en la practica cabe en menos de 2 GB.
- VRAM estimada en fp16: aproximadamente 0,33 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; tambien funciona en CPU para cargas bajas.
- Cabe en GPUs consumer: si, incluidas GTX 1650, RTX 3050, RTX 4060 y superiores; incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: pipeline `question-answering` de transformers, TorchServe, ONNX Runtime, TGI no aplica de forma nativa para encoders extractivos, y exportacion a ONNX para servir con Triton.
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano, se espera latencia de milisegundos por peticion en GPU moderna y decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Z-Jafari/bert-fa-base-uncased-finetuned-Reletive_Selection | 162,25 M | no disponible (BERT base, 512 tipico) | QA extractivo en persa | Apache 2.0 | Hugging Face |
| HooshvareLab/bert-fa-base-uncased | ~162 M | 512 | Modelo base persa (MLM) | Apache 2.0 | Hugging Face |
| HooshvareLab/bert-fa-base-uncased-parsinlu-squad | no disponible | 512 | QA extractivo en persa (SQuAD-fa) | Apache 2.0 | Hugging Face |
| XLM-RoBERTa base | ~278 M | 512 | Multilingue, QA via ajuste | MIT | Hugging Face |

La comparativa se limita a modelos de la misma familia o categoria porque no se dispone de resultados de benchmarks del modelo evaluado. Frente al modelo base, este ajuste anade la cabeza de QA; frente a variantes de HooshvareLab ajustadas a SQuAD-fa, la diferencia principal es la documentacion y el dataset, no disponible en este caso.

## Limitaciones y advertencias

- Sobreajuste evidente: la perdida de validacion aumenta en cada epoca (1,1063 a 1,4056) mientras la de entrenamiento cae, lo que sugiere que el modelo generaliza peor que en la primera epoca.
- Dataset de entrenamiento no documentado: se desconoce el dominio, el tamano y la calidad de los datos, lo que impide evaluar su idoneidad para produccion.
- Model card automatica y sin informacion de usos previstos ni limitaciones declaradas por el autor.
- Riesgo de alucinacion estructural bajo en QA extractivo (devuelve spans del contexto), pero puede seleccionar spans incorrectos o irrelevantes si la pregunta no esta cubierta por el contexto.
- Sesgos desconocidos: no se documenta la composicion del corpus de entrenamiento ni posibles sesgos linguisticos o culturales.
- Contexto limitado a la ventana tipica de BERT base (512 tokens), insuficiente para documentos largos sin troceado previo.
- Idioma: aunque el modelo base es persa, no se confirma el soporte de otros idiomas ni la calidad en variantes dialectales.
- Licencia Apache 2.0 permite uso comercial, pero al no haber documentacion sobre el dataset subyacente no se puede garantizar la ausencia de restricciones derivadas de los datos de entrenamiento.
- Sin likes ni adopcion significativa (0 likes, 196 descargas), lo que reduce la probabilidad de que haya sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Z-Jafari/bert-fa-base-uncased-finetuned-Reletive_Selection
- Modelo base: https://huggingface.co/HooshvareLab/bert-fa-base-uncased
- Repositorio de transformers: https://github.com/huggingface/transformers
- Documentacion de la pipeline question-answering: https://huggingface.co/docs/transformers/tasks/question_answering
