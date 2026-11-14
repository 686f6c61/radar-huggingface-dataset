# Z-Jafari/bert-fa-base-uncased-finetuned-best_scores

## Resumen

`bert-fa-base-uncased-finetuned-best_scores` es un modelo de respuesta a preguntas extractiva (question answering) en persa, obtenido mediante fine-tuning del checkpoint `HooshvareLab/bert-fa-base-uncased`, un BERT base adaptado al persa. Lo publica el usuario Z-Jafari en Hugging Face bajo licencia Apache 2.0 y esta pensado para tareas de localizacion de respuestas dentro de un contexto, no para generacion libre de texto.

El modelo parte de la arquitectura BERT estandar (encoder transformer bidireccional) con 162.252.290 parametros y una ventana de contexto tipica de 512 tokens, aunque el autor no documenta este dato de forma explicita. Se ha entrenado durante 3 epocas con un learning rate de 2e-05, batch de 16 y precision mixta nativa, y declara en su model card un exact match de 77,6 y un F1 de 81,38 sobre un conjunto de evaluacion no descrito.

Su relevancia es acotada: cubre el nicho del QA extractivo en persa, un idioma con relativamente pocos modelos ajustados y menos aun con resultados declarados. La documentacion es practicamente inexistente (la propia model card indica "More information needed" en varias secciones), por lo que debe tratarse como un checkpoint experimental que requiere validacion propia antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer bidireccional) |
| Parametros totales | 162.252.290 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (limitacion tipica de BERT: 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | persa (farsi); no se documentan otros |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un BERT base fine-tuneado para question answering extractivo. La arquitectura subyacente es un encoder transformer con atencion bidireccional completa, sin componente decoder; la cabeza de QA proyecta las representaciones de los tokens a dos logits (inicio y fin del span de respuesta) sobre el contexto de entrada. El modelo base, `HooshvareLab/bert-fa-base-uncased`, es un BERT entrenado especificamente con corpus en persa y vocabulario adaptado al idioma.

El fine-tuning se realizo con los siguientes hiperparametros declarados: learning rate 2e-05, batch de entrenamiento y evaluacion de 16, semilla 42, optimizador AdamW (variante fused, betas 0,9/0,999, epsilon 1e-08), scheduler lineal y 3 epocas con AMP nativo. El autor no especifica el dataset de entrenamiento ("unknown dataset") ni su composicion, tamano o procedencia. La curva de validacion muestra sobreajuste claro: la loss de validacion sube de 1,0566 en la epoca 1 a 1,3615 en la epoca 3, mientras la loss de entrenamiento cae de 0,6978 a 0,2288. Esto sugiere que el checkpoint con mejores metricas de QA no coincide necesariamente con el de menor loss, de ahi probablemente el sufijo "best_scores" del nombre. No se documenta RLHF, DPO ni ninguna innovacion arquitectonica adicional.

## Capacidades

- Question answering extractivo: localiza el span de respuesta dentro de un contexto proporcionado, en persa.
- Comprension lectora: responde preguntas cuya respuesta aparece literalmente en el texto de entrada.
- Extraccion de entidades y datos factuales de documentos en persa (fechas, nombres, cifras) cuando se formula la pregunta adecuada.
- No genera texto libre ni resumenes: es un modelo discriminativo, no generativo.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No tiene capacidades multimodales (vision, audio) ni modo "thinking".
- Cobertura multilingue no documentada; el vocabulario y el preentrenamiento son especificos de persa.

## Casos de uso

- Busqueda de respuestas en documentacion interna en persa: dado un fragmento de manual o politica corporativa, el modelo devuelve el span exacto que responde a la consulta del empleado, sin necesidad de generar texto.
- Extraccion de campos en formularios y contratos: localizar importes, fechas o nombres en documentos persas para alimentar un pipeline de digitalizacion, usando el span de inicio y fin devuelto por la cabeza de QA.
- Atencion al cliente sobre base de conocimiento: integrar el modelo como recuperador de respuestas exactas en un FAQ en persa, con un paso previo de retrieval (por ejemplo BM25 o embeddings) que seleccione el pasaje de contexto.
- Analisis de prensa y corpus periodisticos: responder preguntas factuales ("quien", "cuando", "donde") sobre articulos en persa para tareas de monitorizacion o investigacion.
- Construccion de datasets de QA en persa: usar el modelo para preanotar pares pregunta-respuesta sobre corpus no etiquetados y acelerar el etiquetado humano posterior.
- Evaluacion comparativa de modelos persas: servir como baseline ligero de QA extractivo frente a modelos generativos de mayor tamano, dado su bajo coste de inferencia (162M de parametros).
- Filtrado y validacion en pipelines de datos: comprobar si un pasaje contiene la respuesta a una pregunta concreta antes de enviarlo a un modelo generativo mas caro.

## Benchmarks y rendimiento

Los unicos datos disponibles son los declarados por el autor en la model card, sobre un conjunto de evaluacion no descrito:

| Metrica | Valor |
|---|---|
| Exact match | 77,6 |
| F1 | 81,38 |
| Loss de evaluacion | 1,3615 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con otros modelos persas de QA. El campo `results` del model-index esta vacio.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,65 GB solo para pesos (162M parametros x 4 bytes), mas overhead de activaciones y tokenizador; en la practica, menos de 2 GB.
- En fp16/bf16: unos 0,33 GB de pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU para cargas moderadas. Cualquier GPU con 4 GB o mas (GTX 1650, RTX 3050, RTX 4090, A100, H100) es mas que suficiente.
- Cabe en GPU consumer: si, en practicamente todas las tarjetas actuales e incluso en entornos sin GPU.
- Opciones de despliegue: transformers con pipeline `question-answering`, TorchServe, FastAPI con inferencia directa, ONNX Runtime para optimizacion en CPU. vLLM y TGI no estan orientados a este tipo de modelo discriminativo.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por tamano, se espera inferencia en decenas de milisegundos por peticion en GPU y en el orden de decenas a cientos de milisegundos en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Z-Jafari/bert-fa-base-uncased-finetuned-best_scores | 162M | no disponible (tipico 512) | QA extractivo en persa | Apache 2.0 | Hugging Face |
| HooshvareLab/bert-fa-base-uncased (modelo base) | ~162M | 512 | MLM / base para fine-tuning | Apache 2.0 (segun el repositorio original) | Hugging Face |
| ParsBERT (HooshvareLab/bert-fa-base-uncased) | ~162M | 512 | NLU general en persa | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento de alternativas comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de metricas de QA. La comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: dataset de entrenamiento, dominio y composicion del conjunto de evaluacion no estan descritos, lo que impide evaluar la representatividad de las metricas declaradas.
- Sobreajuste probable: la loss de validacion aumenta en cada epoca (1,0566 a 1,3615) mientras la de entrenamiento cae, lo que sugiere que el checkpoint puede no generalizar bien fuera del conjunto de evaluacion.
- Riesgo de alucinacion estructural: como modelo extractivo, siempre devuelve un span del contexto; si la respuesta no esta presente, puede seleccionar un fragmento irrelevante con alta confianza. Es imprescindible umbralizar la puntuacion y validar el span devuelto.
- Solo persa: no hay evidencia de funcionamiento en otros idiomas; el vocabulario del modelo base es especifico del persa.
- Contexto limitado: la arquitectura BERT no maneja contextos largos; los documentos deben trocearse en pasajes antes de la inferencia.
- Sin garantias de produccion: al no haber validacion independiente ni benchmarks publicos, el uso comercial (permitido por Apache 2.0) queda bajo responsabilidad del integrador.
- Sesgos: no documentados por el autor; al derivar de un corpus persa no descrito, puede heredar sesgos de dominio, genero o registro de dicho corpus.
- Version de transformers declarada (5.22.1) y PyTorch (2.14.1+cu130) no corresponden a versiones publicas conocidas en el momento de redactar esta ficha; conviene verificar la compatibilidad real al cargar el checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Z-Jafari/bert-fa-base-uncased-finetuned-best_scores
- Modelo base: https://huggingface.co/HooshvareLab/bert-fa-base-uncased
