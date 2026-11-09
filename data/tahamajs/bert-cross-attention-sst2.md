# tahamajs/bert-cross-attention-sst2

## Resumen

`tahamajs/bert-cross-attention-sst2` es una variante de `google-bert/bert-base-uncased` en la que las doce capas de atencion multi-cabeza estandar se han sustituido por el mecanismo `cross_attention` de la libreria NeuralOps. El modelo forma parte del "BERT-131 Subquadratic Attention Zoo" del autor Taha Majlesi, un catalogo de variantes de BERT con distintos mecanismos de atencion subcuadraticos, y se ha destilado sobre WikiText-2 mediante el pipeline de destilacion de conocimiento en tres etapas de NeuralOps.

El modelo resuelve la tarea de *masked language modeling* (fill-mask) y esta pensado como banco de pruebas experimental para medir el efecto de mecanismos de atencion alternativos sobre un transformer encoder clasico, no como modelo de produccion. La relevancia actual es acotada: se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, publicado en noviembre de 2026, con licencia MIT y un tamano de repositorio de 0,5 GB.

La nomenclatura del repositorio incluye el sufijo `sst2`, pero la model card no documenta ningun ajuste fino sobre el dataset SST-2: el entrenamiento descrito es exclusivamente destilacion sobre WikiText-2. Conviene tratar ese sufijo como no verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base con 12 capas de atencion sustituidas por `cross_attention` (NeuralOps) |
| Parametros totales | no disponible (el modelo base `bert-base-uncased` tiene 110 M; el recuento de la variante no se publica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 512 tokens; la variante no lo declara) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de 0,5 GB; la model card no detalla safetensors, GGUF ni bin) |

## Arquitectura y entrenamiento

La arquitectura parte de `bert-base-uncased` y reemplaza las 12 capas de self-attention multi-cabeza por el mecanismo `cross_attention` de NeuralOps, etiquetado por el autor como atencion subcuadratica. No se documenta la formulacion matematica del mecanismo, su complejidad asintotica concreta ni como se construyen las consultas, claves y valores en un esquema de atencion cruzada aplicado a un encoder unidireccional de mascara. Tampoco se especifica si el mecanismo mantiene el sesgo de posicion aprendido de BERT ni como se inicializan los pesos nuevos.

El entrenamiento consiste en destilacion de conocimiento sobre WikiText-2 con un curriculum de tres etapas: Stage 0 (calibracion ridge en forma cerrada), Stage 1 (MSE/CKA de subespacio con backbone congelado) y Stage 2 (KD de logits fusionada con learning rate diferencial). Segun la model card, el proceso completo duro 300 segundos (265 pasos) en una NVIDIA RTX 3090 de 24 GB, con un throughput de 45.991 tokens/s y un pico de VRAM de 13.512 MB. No se indica el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si hubo RLHF o DPO (no aplica a un modelo encoder de fill-mask).

## Capacidades

- Generacion de texto limitada a *masked language modeling*: predice tokens enmascarados en una secuencia de entrada, no genera secuencias autoregresivas.
- Relleno de huecos (fill-mask) en ingles, con tokenizer `bert-base-uncased` (vocabulario WordPiece, minusculas).
- Extraccion de representaciones contextuales de tokens y frases, reutilizables para tareas downstream de clasificacion o NER mediante ajuste fino.
- Capacidad de enmascaramiento multiple en una misma secuencia, segun el ejemplo de la model card.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta vision, audio ni modo *thinking*.
- Multilingue: no, solo ingles.

## Casos de uso

- Investigacion sobre mecanismos de atencion: comparar `cross_attention` frente a self-attention estandar en tareas de MLM controlando el resto de la arquitectura, usando el mismo tokenizer y el mismo corpus de evaluacion (WikiText-2 con 15 % de masking y `seed=42`).
- Reproduccion de experimentos de destilacion: el pipeline de tres etapas de NeuralOps se puede reutilizar como referencia para destilar variantes de BERT en una sola GPU consumer, dado el bajo coste declarado (300 s en RTX 3090).
- Prototipado de pipelines de fill-mask en ingles: el modelo se carga con `transformers.pipeline("fill-mask", ...)`, lo que permite integrarlo en demos o notebooks sin infraestructura adicional.
- Generacion de embeddings para busqueda semantica ligera en ingles: al ser un encoder de 110 M de parametros (base), cabe en GPU consumer y sirve para indexar colecciones pequenas o medianas.
- Ajuste fino para clasificacion de texto en ingles: su herencia de `bert-base-uncased` permite anadir una cabeza de clasificacion y entrenar sobre datasets etiquetados, aunque el rendimiento real de la variante no esta validado fuera de MLM.
- Docencia y divulgacion: ilustrar en un curso o taller como se sustituye un bloque de atencion en un transformer preentrenado y como se evalua el resultado con pseudo-perplejidad determinista.

## Benchmarks y rendimiento

Los unicos datos publicados son de pseudo-perplejidad de MLM determinista sobre WikiText-2 (15 % de tokens enmascarados, `seed=42`):

| Fase de evaluacion | MLM PPL | Precision de token enmascarado (%) | Delta vs baseline |
|---|---:|---:|---:|
| BERT teacher (`bert-base-uncased`) | 6,84 | 68,42 | referencia |
| Stage 0 (calibracion ridge en forma cerrada) | 0,00 | 91,63 | -6,84 |
| Stage 2 (modelo destilado) | 0,00 | 91,86 | -6,84 |

Advertencia importante: una perplejidad de 0,00 es un valor atipico que sugiere un problema de calculo o de fuga de informacion en la metrica (por ejemplo, evaluacion sobre el mismo corpus de entrenamiento o un error numerico en el calculo de la perplejidad). La model card no aporta resultados en MMLU, HumanEval, GSM8K, GLUE ni SST-2, pese al sufijo `sst2` del nombre del repositorio. No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,45 GB de pesos para un encoder de 110 M de parametros, mas activaciones y overhead del runtime; en la practica cabe en cualquier GPU con 2 GB o mas.
- VRAM estimada en FP16: alrededor de 0,22 GB de pesos, mas overhead.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.); el autor reporto el entrenamiento en una RTX 3090 de 24 GB con un pico de 13,5 GB, pero la inferencia requiere mucho menos.
- Cabe en GPU consumer: si, practicamente en cualquier GPU dedicada de los ultimos diez anos; tambien en CPU para cargas de baja concurrencia.
- Opciones de despliegue: `transformers` (pipeline `fill-mask`), la API de alto nivel `neuralops.load_pretrained_bert`, y servidores de inferencia compatibles con transformers. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para esta variante.
- Latencia y throughput: no disponible para inferencia. El unico dato de throughput es de entrenamiento (45.991 tokens/s en RTX 3090).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-cross-attention-sst2` | no disponible (base 110 M) | no disponible | fill-mask (en) | MIT | Hugging Face, 0 descargas |
| `google-bert/bert-base-uncased` | 110 M | 512 | fill-mask / encoder (en) | Apache 2.0 | Hugging Face, ampliamente usado |
| `distilbert-base-uncased` | 66 M | 512 | fill-mask / encoder (en) | Apache 2.0 | Hugging Face, ampliamente usado |
| `roberta-base` | 125 M | 512 | fill-mask / encoder (en) | MIT | Hugging Face, ampliamente usado |

La comparativa de rendimiento no es posible: la variante no publica resultados en benchmarks estandar y sus unicos numeros (PPL 0,00) no son comparables con las cifras publicadas de los modelos de referencia.

## Limitaciones y advertencias

- La metrica principal reportada (PPL 0,00) es sospechosa y probablemente indica un fallo de evaluacion; no debe usarse como evidencia de calidad.
- No hay validacion fuera de MLM sobre WikiText-2: no se han publicado resultados en GLUE, SST-2 ni otras tareas, pese al sufijo `sst2` del nombre.
- El mecanismo `cross_attention` no esta documentado matematicamente en la model card; su comportamiento, estabilidad y ventajas frente a self-attention son desconocidos.
- Solo soporta ingles; no hay capacidades multilingues.
- Riesgo de alucinacion y sesgos: no evaluado. Al derivar de `bert-base-uncased`, hereda los sesgos de su corpus de preentrenamiento original (BooksCorpus y Wikipedia en ingles), no documentados en esta ficha.
- Licencia MIT: permite uso comercial, pero el modelo base `bert-base-uncased` es Apache 2.0 y la variante no aclara la compatibilidad de la cadena de licencias en todos los supuestos.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en produccion ni de validacion por terceros.
- Requiere la libreria `neuralops` (con codigo personalizado, `custom_code`) para cargar el modelo con su API de alto nivel; la ruta via `transformers` estandar puede no funcionar sin el codigo registrado.
- Fecha de creacion futura (2026-11-09) respecto a la mayoria de modelos del ecosistema: verificar la integridad del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-cross-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
