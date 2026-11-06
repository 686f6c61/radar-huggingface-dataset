# tihon-nth/distilbert-base-uncased-finetuned-ner

## Resumen

`distilbert-base-uncased-finetuned-ner` es un modelo de clasificación de tokens (token classification) obtenido mediante fine-tuning de `distilbert-base-uncased` para la tarea de reconocimiento de entidades nombradas (NER). Lo publica el usuario de Hugging Face `tihon-nth` y se generó automáticamente con la librería `Trainer` de Transformers, tal como indica el encabezado de su model card. Se trata, por tanto, de un modelo derivado de pequeño tamaño (66,4 millones de parámetros) pensado para etiquetado secuencial, no para generación de texto.

La relevancia práctica de este modelo es la de un artefacto de fine-tuning: parte de la arquitectura DistilBERT (una versión destilada de BERT con 6 capas en lugar de 12) y añade una cabeza de clasificación token a token. El autor reporta métricas de validación razonablemente altas (F1 de 0,9370 y accuracy de 0,9864), pero no documenta qué conjunto de datos se usó para el entrenamiento ni qué esquema de etiquetas (BIO, BIOES, tipos de entidad) emplea, lo que limita seriamente su reproducibilidad y su uso directo en producción.

El modelo tiene 0 descargas y 1 like en el momento de la consulta, y su model card es en su mayor parte una plantilla autogenerada con secciones "More information needed". No se han publicado resultados de benchmarks en la información disponible, y el `model-index` aparece vacío. Es, en definitiva, un modelo de interés limitado salvo como ejemplo de pipeline de fine-tuning o como punto de partida para reentrenamiento con un dataset propio y bien documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas, destilado de BERT-base) con cabeza de clasificación de tokens |
| Parametros totales | 66.369.801 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT-base soporta hasta 512 tokens de entrada; el autor no lo declara) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía herramientas externas, no documentada por el autor) |
| Idiomas soportados | no disponible (el modelo base es `uncased` en inglés; el autor no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es un encoder Transformer tipo DistilBERT: 6 capas, 12 cabezas de atención, dimensión oculta de 768 y aproximadamente 66 millones de parámetros, sobre el que se añade una capa lineal de clasificación por token. El modelo base `distilbert-base-uncased` fue entrenado por destilación de BERT-base y opera con tokenización en minúsculas (WordPiece), lo que implica que la información de mayúsculas se pierde en la entrada, algo relevante para NER en textos con nombres propios.

El fine-tuning se realizó con el `Trainer` de Transformers usando AdamW fused (betas 0,9/0,999, epsilon 1e-8), learning rate de 2e-5, batch size de 16 en entrenamiento y evaluación, scheduler lineal, semilla 42 y 10 épocas, alcanzando 8.780 pasos. La pérdida de entrenamiento baja de 0,1894 a 0,0023 mientras la pérdida de validación toca mínimo en la época 2-3 (0,0532) y repunta hasta 0,0749 en la época 10, señal clara de sobreajuste a partir de la tercera época. El autor no documenta el dataset de entrenamiento, su composición, el esquema de etiquetas ni si hubo aumento de datos o validación cruzada. Las versiones de framework declaradas son Transformers 5.18.0, PyTorch 2.14.1+cu126, Datasets 5.0.1 y Tokenizers 0.23.2.

## Capacidades

- Clasificación de tokens para reconocimiento de entidades nombradas (NER): asigna una etiqueta a cada token de la secuencia de entrada.
- Etiquetado secuencial en general (token classification), siempre que el esquema de etiquetas coincida con el usado en el fine-tuning.
- Inferencia por lotes mediante el pipeline `token-classification` de Transformers.
- Compatible con endpoints de Hugging Face (`endpoints_compatible` en los tags).
- No soporta generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No soporta tool calling ni function calling.
- No está diseñado para agentes ni razonamiento multi-step.
- Capacidades multilingües: no declaradas; el modelo base es `uncased` en inglés.

## Casos de uso

- Extracción de entidades en textos en inglés con un esquema de etiquetas conocido: si el esquema del fine-tuning coincide con el del dominio (personas, organizaciones, lugares), el modelo puede usarse para poblar bases de datos a partir de documentos. Es adecuado por su bajo coste computacional, pero requiere verificar primero el esquema de etiquetas, que el autor no documenta.
- Preprocesado en pipelines de NLP: como paso previo de anonimización o enmascarado de entidades (PII) antes de enviar texto a otros sistemas. Su tamaño reducido permite ejecutarlo en CPU con latencia baja.
- Prototipado rápido de un sistema NER: sirve como línea base para comparar contra modelos propios o contra alternativas como `dslim/bert-base-NER`, dado que entrena en minutos y cabe en cualquier GPU consumer.
- Etiquetado asistido (human-in-the-loop): generar preanotaciones para que anotadores humanos las revisen y corrijan, acelerando la creación de datasets propios.
- Filtrado y enrutado de documentos: clasificar documentos según la presencia o densidad de ciertas entidades (por ejemplo, detectar documentos con nombres de personas para derivarlos a un flujo de revisión).
- Educación y reproducción de pipelines: como ejemplo didáctico de fine-tuning con `Trainer` y de las trampas del sobreajuste (la pérdida de validación repunta tras la época 3), útil para quien quiera replicar el flujo con su propio dataset.

## Benchmarks y rendimiento

El `model-index` del autor está vacío (`results: []`), por lo que no hay benchmarks oficiales publicados. Los únicos datos disponibles son las métricas de validación reportadas en la model card, que corresponden a un conjunto de evaluación no identificado:

| Metrica | Valor (epoca 10, reportado) | Mejor valor observado (epoca 3) |
|---|---|---|
| Loss | 0,0749 | 0,0532 |
| Precision | 0,9314 | 0,9315 |
| Recall | 0,9426 | 0,9442 |
| F1 | 0,9370 | 0,9378 |
| Accuracy | 0,9864 | 0,9866 |

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros no aplican a este tipo de modelo, y no hay comparación con alternativas).

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 265 MB solo para pesos (66,4 M de parámetros × 4 bytes), más activaciones y overhead del runtime; en la práctica, menos de 1 GB.
- VRAM estimada en FP16/BF16: aproximadamente 133 MB para pesos; en la práctica, menos de 1 GB con overhead.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en CPU sin problema para lotes pequeños.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (GTX 1050, RTX 2060, RTX 3060, RTX 4090, etc.) e incluso en iGPU.
- Opciones de despliegue: pipeline `token-classification` de Transformers, `TextClassificationPipeline`, servidores de inferencia compatibles con Transformers (TGI, aunque no es su caso óptimo), ONNX Runtime, y exportación a GGUF vía herramientas de conversión externas (no documentada por el autor).
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera latencia de milisegundos por secuencia en GPU y de decenas de milisegundos en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tihon-nth/distilbert-base-uncased-finetuned-ner | 66,4 M | no disponible (base: 512) | NER / token classification | Apache 2.0 | Hugging Face |
| dslim/bert-base-NER | ~110 M | 512 | NER (CoNLL-2003, esquema BIO) | MIT | Hugging Face, ampliamente usado |
| dslim/distilbert-NER | ~66 M | 512 | NER (CoNLL-2003, esquema BIO) | MIT | Hugging Face |
| Jean-Baptiste/roberta-large-ner-english | ~355 M | 512 | NER (esquema BIO) | MIT | Hugging Face |

La comparación directa con `dslim/distilbert-NER` es la más pertinente por tamaño y arquitectura: ambos son DistilBERT fine-tuneados para NER, pero el modelo de `dslim` documenta su dataset (CoNLL-2003), su esquema de etiquetas y sus métricas, mientras que `tihon-nth` no lo hace. Para uso en producción, la falta de documentación del esquema de etiquetas y del dataset es un factor decisivo a favor de las alternativas establecidas.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado: el autor no indica qué conjunto de datos usó, su dominio, su idioma ni su esquema de etiquetas, lo que hace imposible saber qué entidades reconoce y con qué formato de salida.
- Sobreajuste evidente: la pérdida de validación toca mínimo en la época 2-3 (0,0532) y sube hasta 0,0749 en la época 10, mientras la de entrenamiento cae a 0,0023. El checkpoint publicado es el de la época 10, no el mejor en validación.
- Métricas no reproducibles: las cifras de precision, recall, F1 y accuracy proceden de un conjunto de evaluación no identificado; no hay `model-index` con resultados verificables.
- Tokenización `uncased`: el modelo base pierde las mayúsculas, lo que degrada el reconocimiento de nombres propios y entidades que dependen de la capitalización.
- Idiomas: no declarados; el modelo base es inglés, por lo que no se debe asumir soporte para castellano u otros idiomas.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí hay riesgo de etiquetados erróneos (falsos positivos y negativos) en dominios distintos al de entrenamiento.
- Sesgos: no evaluados ni documentados; los sesgos del corpus de entrenamiento (desconocido) se heredan sin análisis.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene conservar el aviso de licencia y verificar las obligaciones de atribución.
- Repositorio de 31,6 GB: tamaño desproporcionado para 66 M de parámetros, probablemente por checkpoints intermedios de las 10 épocas; conviene descargar solo los archivos necesarios.
- Madurez: 0 descargas y 1 like; sin mantenimiento ni issues documentados. No recomendable como dependencia en producción sin validación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tihon-nth/distilbert-base-uncased-finetuned-ner
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Documentación del pipeline `token-classification`: https://huggingface.co/docs/transformers/main_classes/pipelines#transformers.TokenClassificationPipeline
- Documentación de DistilBERT: https://huggingface.co/docs/transformers/model_doc/distilbert
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
