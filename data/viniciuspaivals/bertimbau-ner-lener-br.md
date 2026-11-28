# viniciuspaivals/bertimbau-ner-lener-br

## Resumen

`bertimbau-ner-lener-br` es un modelo de reconocimiento de entidades nombradas (NER) para portugues, obtenido mediante fine-tuning de `neuralmind/bert-base-portuguese-cased` (BERTimbau base). Lo publica el usuario viniciuspaivals en Hugging Face bajo licencia MIT. El modelo resuelve la tarea de token classification: asignar una etiqueta BIO a cada token de un texto para extraer entidades como personas, organizaciones, lugares o conceptos juridicos.

La arquitectura es un transformer encoder BERT base con 108.342.541 parametros (vocabulario en cased portugues, 12 capas, hidden size 768). El nombre sugiere un entrenamiento orientado a dominios juridicos o legislativos ("lener-br"), aunque la model card no documenta el dataset de entrenamiento ni el esquema de etiquetas utilizado. El checkpoint se genero con `Trainer` de Hugging Face y se distribuye en safetensors (repo de 2,2 GB, incluyendo posibles checkpoints intermedios).

Es relevante como punto de partida para pipelines de extraccion de informacion en portugues de Brasil, especialmente en el ambito legal, pero su adopcion en produccion exige validacion previa: la documentacion es minima, no hay benchmarks publicados en el model-index y el autor no detalla la taxonomia de entidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder bidireccional), fine-tuning para token classification |
| Parametros totales | 108.342.541 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens (limite estandar de BERT base; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion dinamica via PyTorch/ONNX, no documentada por el autor) |
| Idiomas soportados | portugues (heredado del modelo base BERTimbau); no declarado explicitamente en la model card |
| Licencia | MIT |
| Formato de pesos | safetensors (repo con Transformers 5.22.1) |

## Arquitectura y entrenamiento

El modelo parte de BERTimbau base cased, un BERT base entrenado por neuralmind sobre corpus en portugues de Brasil. Sobre esa base se aplica un fine-tuning de token classification con cabecera lineal sobre la salida del encoder. Los hiperparametros documentados son: learning rate 3e-5, batch size 16 (train y eval), 5 epocas, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal con 245 pasos de warmup, semilla 42 y precision mixta nativa (AMP). El entrenamiento alcanzo 2.450 pasos totales (490 por epoca).

No se especifica el dataset de entrenamiento, el numero de tokens, la composicion del corpus ni el esquema de etiquetas. Tampoco se documenta si hubo aumento de datos, balanceo de clases o validacion cruzada. La perdida de validacion minima se situa en 0,0682 en la ultima epoca, con precision 0,8420, recall 0,8911 y F1 0,8658. El nombre del modelo apunta a un corpus legislativo o juridico brasileno, pero es una inferencia no confirmada por el autor.

## Capacidades

- Reconocimiento de entidades nombradas (NER) en portugues mediante token classification con esquema BIO.
- Extraccion de entidades en textos juridicos o legislativos (segun el nombre del modelo; no confirmado en la model card).
- Clasificacion a nivel de token con salida de logits por etiqueta; requiere mapeo `id2label`/`label2id` para interpretar resultados.
- Inferencia por lotes con `pipeline("token-classification")` de Transformers.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, vision ni audio.
- Capacidad multilingue limitada: el vocabulario y el preentrenamiento son de portugues; el rendimiento en otros idiomas no esta garantizado.

## Casos de uso

- Extraccion de entidades en contratos y documentos juridicos: el modelo puede etiquetar partes, organismos y referencias normativas en textos en portugues, aprovechando el preentrenamiento de BERTimbau sobre corpus brasilenos. Requiere validar el esquema de etiquetas real antes de usarlo.
- Anonimizacion de documentos: deteccion de nombres de personas y organizaciones para sustitucion o enmascarado en pipelines de cumplimiento de proteccion de datos (LGPD en Brasil).
- Indexacion y busqueda semantica de corpus legislativos: extraer entidades de proposiciones y leyes para enriquecer metadatos y mejorar la recuperacion documental.
- Enriquecimiento de bases de datos de entidades: poblado automatico de tablas de personas, instituciones y localizaciones a partir de texto libre en portugues.
- Preprocesado para sistemas RAG: identificar entidades en fragmentos recuperados para filtrar, agrupar o enrutar consultas en un pipeline de generacion aumentada.
- Analisis de noticias y prensa en portugues: extraccion de actores y organizaciones mencionadas para monitorizacion de medios y analisis de tendencias.
- Etiquetado asistido en anotacion humana: preanotar corpus con el modelo y revisar manualmente, reduciendo el coste de construccion de datasets NER.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de evaluacion (no se especifica el dataset):

| Metrica | Valor |
|---|---|
| Loss (validacion) | 0,0682 |
| Precision | 0,8420 |
| Recall | 0,8911 |
| F1 | 0,8658 |

Evolucion por epoca segun la model card:

| Epoca | Paso | Validation loss | Precision | Recall | F1 |
|---|---|---|---|---|---|
| 1 | 490 | 0,0870 | 0,7837 | 0,8410 | 0,8114 |
| 2 | 980 | 0,0771 | 0,8136 | 0,8740 | 0,8427 |
| 3 | 1470 | 0,0647 | 0,8230 | 0,8823 | 0,8516 |
| 4 | 1960 | 0,0692 | 0,8201 | 0,8949 | 0,8559 |
| 5 | 2450 | 0,0682 | 0,8420 | 0,8911 | 0,8658 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El model-index del autor esta vacio.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,45 GB solo para pesos (108 M parametros x 4 bytes), mas activaciones y memoria del tokenizer; en la practica, menos de 2 GB para lotes pequenos.
- VRAM estimada en FP16/BF16: aproximadamente 0,22 GB para pesos; menos de 1,5 GB en total con batch moderado.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una NVIDIA T4, RTX 3060, RTX 4090 o A100 son mas que suficientes. Tambien funciona en CPU para inferencia por lotes pequenos.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3050, RTX 4060 y superiores.
- Opciones de despliegue: `transformers` (PyTorch), `pipeline("token-classification")`, exportacion a ONNX Runtime, TorchScript o `optimum`; tambien es posible convertirlo a GGUF para llama.cpp aunque no es el flujo habitual para BERT.
- Latencia y throughput: no disponibles en la informacion proporcionada. Para un BERT base en una GPU moderna se espera un throughput de cientos a miles de secuencias cortas por segundo, pero no hay medicion oficial.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bertimbau-ner-lener-br | 108 M | 512 (estandar BERT) | NER en portugues | MIT | Hugging Face |
| neuralmind/bert-base-portuguese-cased | 108 M | 512 | Modelo base (MLM) | MIT | Hugging Face |
| neuralmind/bert-large-portuguese-cased | 335 M aprox. | 512 | Modelo base (MLM) | MIT | Hugging Face |
| Modelos NER portugueses de la comunidad (p. ej. variantes BERTimbau fine-tuned) | 108 M aprox. | 512 | NER | variable | Hugging Face |

No se dispone de resultados comparativos de benchmarks entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Documentacion insuficiente: la model card no especifica dataset, esquema de etiquetas ni dominio de aplicacion; el autor indica "More information needed" en varias secciones.
- Riesgo de alucinacion y falsos positivos: como todo modelo NER, puede etiquetar entidades inexistentes o confundir tipos; la precision de 0,8420 implica un margen de error apreciable.
- Sesgos desconocidos: no se documenta la composicion del corpus de fine-tuning, por lo que no es posible evaluar sesgos de genero, origen o dominio.
- Limite de contexto de 512 tokens: los documentos largos deben dividirse en fragmentos, con riesgo de perder entidades en los cortes.
- Cobertura idiomatica restringida al portugues; el rendimiento en otras lenguas no esta validado.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene revisar la licencia del modelo base (MIT en BERTimbau).
- Sin benchmarks publicados en el model-index: los resultados de la model card corresponden a un conjunto de evaluacion no identificado y no son comparables con otros modelos sin reproducir la evaluacion.
- Fecha de creacion futura (2026-11-27) en los metadatos de Hugging Face: conviene verificar la integridad y procedencia del checkpoint antes de usarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/viniciuspaivals/bertimbau-ner-lener-br
- Modelo base: https://huggingface.co/neuralmind/bert-base-portuguese-cased
- Documentacion de Transformers para token classification: https://huggingface.co/docs/transformers/tasks/token_classification
- Paper de BERTimbau: https://arxiv.org/abs/2009.04868
