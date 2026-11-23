# veripazari/bert-base-turkish-cased-ner

## Resumen

`veripazari/bert-base-turkish-cased-ner` es un modelo de reconocimiento de entidades nombradas (NER) para turco, resultado del ajuste fino de `dbmdz/bert-base-turkish-cased` sobre una version revisada del conocido corpus turco de NER publicado por Stefan Schweter. El modelo original fue desarrollado por el usuario akdeniz27 y este repositorio lo reempaqueta y archiva la plataforma VeriPazarı manteniendo la documentacion y la licencia originales.

Se trata de un transformer encoder BERT base (110.032.647 parametros) con tokenizador cased, ventana de 512 tokens y una cabeza de clasificacion de tokens con siete etiquetas en formato BIO: persona (PER), organizacion (ORG), localizacion (LOC) y fuera de entidad (O). No es un modelo generativo ni conversacional: su unica tarea es etiquetar secuencias.

Su relevancia practica reside en que cubre una carencia habitual en el ecosistema open source: NER de calidad para turco, un idioma con morfologia aglutinante y pocos recursos anotados. Con un F1 global reportado de 0,9593 sobre el conjunto de test del autor, es una pieza utilizable en pipelines de extraccion de informacion en produccion, aunque con un alcance funcional muy acotado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT base con cabeza de token classification |
| Parametros totales | 110.032.647 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (max_length de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y ONNX; admite cuantizacion via herramientas externas como bitsandbytes u ONNX Runtime, no documentada por el autor) |
| Idiomas soportados | turco (tr) |
| Licencia | MIT |
| Formato de pesos | safetensors, PyTorch (pytorch_model.bin) y ONNX |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `dbmdz/bert-base-turkish-cased`, un BERT base entrenado especificamente para turco con vocabulario cased, y se ajusta para token classification. La cabeza de salida produce siete etiquetas en esquema BIO: `O`, `B-PER`, `I-PER`, `B-ORG`, `I-ORG`, `B-LOC`, `I-LOC`. No hay innovaciones arquitectonicas propias: es un fine-tuning estandar de BERT para NER.

Los hiperparametros de ajuste documentados son: batch size 8, `max_length` 512, learning rate 2e-5, 3 epocas y weight decay 0,01. El corpus de entrenamiento es una version revisada del dataset turco de NER distribuido por Stefan Schweter (`nerdata.txt`). No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables a una tarea discriminativa de etiquetado). Tampoco se documenta el preprocesado del tokenizador mas alla del uso del tokenizer cased original.

## Capacidades

- Reconocimiento de entidades nombradas en texto turco con tres tipos: persona (PER), organizacion (ORG) y localizacion (LOC).
- Etiquetado a nivel de token con esquema BIO, agregable a entidades completas mediante `aggregation_strategy` en el pipeline `ner` de Transformers.
- Procesamiento de secuencias de hasta 512 tokens por inferencia.
- Exportacion a ONNX para despliegue optimizado en CPU o aceleradores compatibles.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No soporta tool calling, function calling ni comportamiento agentico.
- No dispone de modo thinking ni capacidades multimodales.
- Capacidad multilingue limitada al turco; no se documenta rendimiento en otros idiomas.

## Casos de uso

- Extraccion de entidades en noticias turcas: dado un articulo de hasta 512 tokens, el modelo identifica personas, organizaciones y lugares mencionados, lo que permite indexar y enlazar contenido en un CMS o motor de busqueda.
- Enriquecimiento de bases de datos de clientes: procesar campos de texto libre en turco (direcciones, notas, descripciones) para poblar campos estructurados de localizacion y organizacion.
- Analisis de documentos legales o administrativos turcos: deteccion de partes implicadas (personas y organismos) en contratos o expedientes para clasificacion y routing documental.
- Monitorizacion de menciones en redes sociales: extraer entidades de publicaciones en turco para agregar sentimiento o volumen por persona u organizacion.
- Anonimizacion y seudonimizacion: identificar entidades PER en textos antes de almacenarlos o compartirlos, como paso previo a la redaccion o al enmascarado.
- Preprocesado para pipelines de RAG en turco: extraer entidades de los documentos antes de la indexacion vectorial para habilitar filtros por entidad en la recuperacion.
- Construccion de grafos de conocimiento: alimentar relaciones entidad-documento a partir de corpus turcos, con la ventaja de que el modelo es ligero y puede ejecutarse en CPU para volcados masivos.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el conjunto de test del corpus original:

| Metrica | Valor |
|---|---|
| Accuracy | 0,9934 |
| F1 | 0,9593 |
| Precision | 0,9544 |
| Recall | 0,9643 |

Resultados por subconjunto de test segun el articulo de Kucuk et al. (2016):

| Test set | Accuracy | Precision | Recall | F1 |
|---|---|---|---|---|
| 20010000 | 0,9946 | 0,9871 | 0,9463 | 0,9662 |
| 20020000 | 0,9928 | 0,9134 | 0,9206 | 0,9170 |
| 20030000 | 0,9942 | 0,9814 | 0,9186 | 0,9489 |
| 20040000 | 0,9943 | 0,9660 | 0,9522 | 0,9590 |
| 20050000 | 0,9971 | 0,9539 | 0,9932 | 0,9732 |
| 20060000 | 0,9993 | 0,9942 | 0,9942 | 0,9942 |
| 20070000 | 0,9970 | 0,9806 | 0,9439 | 0,9619 |
| 20080000 | 0,9988 | 0,9821 | 0,9649 | 0,9735 |
| 20090000 | 0,9977 | 0,9891 | 0,9479 | 0,9681 |
| 20100000 | 0,9961 | 0,9684 | 0,9293 | 0,9485 |
| Global | 0,9961 | 0,9720 | 0,9516 | 0,9617 |

No se han publicado comparaciones con otros modelos NER turcos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,45 GB para los pesos (110 M de parametros), mas overhead de activaciones segun el tamano de batch y la longitud de secuencia.
- En FP16 o BF16: alrededor de 0,25 GB de pesos.
- Cabe holgadamente en cualquier GPU consumer, incluidas GTX 1650, RTX 3060, RTX 4090, e incluso en CPU para cargas moderadas.
- GPU recomendadas para alto throughput: A100, H100, L4 o T4 para despliegue en servidor; RTX 4090 para desarrollo local.
- Opciones de despliegue: `transformers` con pipeline `ner`, ONNX Runtime (hay pesos ONNX en el repo), vLLM no aplica (no es modelo generativo), TGI no aplica, llama.cpp no aplica. Para serving HTTP se puede usar FastAPI o TorchServe envolviendo el pipeline.
- Latencia y throughput: no disponibles en la informacion proporcionada; en la practica, un BERT base en GPU moderna procesa decenas de secuencias de 512 tokens por segundo, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| veripazari/bert-base-turkish-cased-ner | 110 M | 512 | NER turco (PER/ORG/LOC) | MIT | Hugging Face |
| akdeniz27/bert-base-turkish-cased-ner | 110 M | 512 | NER turco (PER/ORG/LOC) | MIT | Hugging Face (origen del anterior) |
| dbmdz/bert-base-turkish-cased | 110 M | 512 | Modelo base turco (no NER) | MIT | Hugging Face |
| xlm-roberta-base | 278 M | 512 | Modelo base multilingue (no NER) | MIT | Hugging Face |

La comparativa con modelos NER turcos alternativos (por ejemplo, variantes basadas en XLM-R ajustadas para NER turco) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Solo cubre tres tipos de entidad (PER, ORG, LOC); no detecta fechas, cantidades, productos, cargos ni otras categorias habituales en NER.
- Entrenado exclusivamente con un corpus turco; el rendimiento fuera del dominio de noticias y textos similares al corpus original puede degradarse.
- Ventana maxima de 512 tokens: los documentos mas largos requieren fragmentacion con el riesgo de cortar entidades en los limites.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de falsos positivos y negativos en la etiquetacion, especialmente en textos con entidades ambiguas o en minusculas.
- El modelo original fue archivado por VeriPazarı; el repositorio tiene 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.
- La licencia MIT permite uso comercial sin restricciones, pero se recomienda verificar la procedencia y los terminos del corpus original (`nerdata.txt`) antes de un despliegue en produccion.
- No hay informacion sobre sesgos especificos del modelo; los sesgos del corpus subyacente (predominantemente noticias turcas) se heredan.
- No se documenta el rendimiento en turco coloquial, dialectos ni texto con errores ortograficos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/veripazari/bert-base-turkish-cased-ner
- Modelo original: https://huggingface.co/akdeniz27/bert-base-turkish-cased-ner
- Modelo base: https://huggingface.co/dbmdz/bert-base-turkish-cased
- Corpus NER turco (nerdata.txt): https://github.com/stefan-it/turkish-bert/files/4558187/nerdata.txt
- Articulo de referencia del dataset: https://ieeexplore.ieee.org/document/7495744
- Documentacion del pipeline de token classification: https://huggingface.co/transformers/_modules/transformers/pipelines/token_classification.html
- Plataforma del compilador: https://veripazari.com.tr
