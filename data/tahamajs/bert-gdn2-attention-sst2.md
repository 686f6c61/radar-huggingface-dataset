# tahamajs/bert-gdn2-attention-sst2

## Resumen

`tahamajs/bert-gdn2-attention-sst2` es una variante experimental de `google-bert/bert-base-uncased` en la que las doce capas de atencion multi-cabeza estandar han sido sustituidas por el mecanismo `gdn2_attention`, un operador de atencion subcuadratica implementado en la libreria NeuralOps. El modelo lo publica Taha Majlesi (usuario `tahamajs`) como parte de un "attention zoo" de BERT preentrenados con distintos mecanismos de atencion alternativos, y se distribuye con licencia MIT.

El objetivo del artefacto no es ofrecer un modelo de produccion, sino servir de banco de pruebas reproducible para comparar mecanismos de atencion subcuadratica frente a la atencion cuadratica clasica de BERT. El autor lo presenta como destilado sobre WikiText-2 mediante un pipeline de destilacion de conocimiento en tres etapas (calibracion Ridge en forma cerrada, MSE/CKA de subespacio con backbone congelado y KD de logits fusionada con LR diferencial) ejecutado durante 300 segundos en una RTX 3090.

La relevancia es, por tanto, metodologica: demuestra el flujo de sustitucion de atencion y destilacion de NeuralOps sobre un transformer encoder de 110 millones de parametros, pero los resultados reportados por el propio autor muestran una degradacion severa de la calidad del modelo (perplejidad de 0.00 y precision en tokens enmascarados del 49.08% frente al 68.42% del profesor), lo que lo invalida para uso real en tareas de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base) con atencion subcuadratica `gdn2_attention` en las 12 capas |
| Parametros totales | ~110 millones (heredados de `bert-base-uncased`; no confirmado explicitamente en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de BERT-base; no se indica modificacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0.5 GB; la model card no detalla safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo parte de los pesos de `bert-base-uncased` y reemplaza las doce capas de self-attention multi-cabeza por el operador `gdn2_attention` de NeuralOps, un mecanismo de atencion subcuadratica cuyo detalle matematico no se especifica en la model card. Se mantiene el resto de la arquitectura BERT (embeddings, capas feed-forward, normalizacion y cabecera de masked language modeling), por lo que el pipeline declarado es `fill-mask` y el tokenizador es el de BERT-base sin cased.

El entrenamiento consiste en un proceso de destilacion de conocimiento sobre WikiText-2 con un curriculum de tres etapas: Stage 0, calibracion Ridge en forma cerrada; Stage 1, MSE/CKA de subespacio con backbone congelado; y Stage 2, KD de logits fusionada con learning rate diferencial. La telemetria reportada es de 8 pasos completados en 300 segundos, con un throughput de 1004.2 tokens/s y un pico de VRAM de 23021 MB en una RTX 3090. El dataset de entrenamiento declarado es WikiText-2, aunque el tag del repositorio indica `dataset:wikitext` sin especificar la variante en los metadatos. No se menciona uso de RLHF ni DPO; el paradigma es exclusivamente destilacion supervisada desde el profesor.

## Capacidades

- Generacion de texto enmascarado (masked language modeling): predice tokens `[MASK]` en una secuencia de entrada.
- Razonamiento linguistico basico y representaciones contextuales de nivel de token, heredadas estructuralmente de BERT-base.
- No soporta tool calling ni function calling: es un modelo encoder de tipo fill-mask, sin interfaz de instrucciones.
- No soporta agentes ni razonamiento multi-paso: carece de decodificacion autoregresiva y de modo "thinking".
- Capacidades multilingues limitadas al ingles (`en`); no se declaran otros idiomas.
- No dispone de vision, audio ni modalidades adicionales.
- El autor no documenta capacidades especiales mas alla del propio cambio de mecanismo de atencion.

## Casos de uso

- Investigacion comparativa de mecanismos de atencion: sirve como punto de referencia reproducible para medir el impacto de sustituir atencion cuadratica por `gdn2_attention` en un encoder BERT, usando el pipeline de destilacion de NeuralOps como baseline.
- Pruebas de integracion de la libreria NeuralOps: permite validar la carga del modelo con `neuralops.load_pretrained_bert` y el flujo de sustitucion de atencion en un entorno controlado.
- Docencia sobre destilacion de conocimiento: el curriculum de tres etapas y la telemetria de entrenamiento (8 pasos, 300 s, 1004.2 tokens/s) sirven como ejemplo didactico de un pipeline de KD acelerado.
- Benchmarking de throughput en GPUs de consumo: la model card reporta 23021 MB de VRAM pico en RTX 3090, util para calibrar requisitos de memoria de variantes BERT con atencion alternativa.
- Prototipado de pipelines de `fill-mask` con `transformers.pipeline`: valida la compatibilidad de la API estandar con pesos de atencion personalizada.
- Reproduccion de experimentos academicos: el modelo esta pensado para replicar y auditar los resultados del "attention zoo" de NeuralOps, no para desplegarse en produccion.

No se recomienda su uso en atencion al cliente, generacion de codigo, clasificacion de sentimiento en produccion ni ninguna tarea donde se requiera precision linguistica, dado el rendimiento reportado.

## Benchmarks y rendimiento

Evaluacion determinista de masked language modeling sobre WikiText-2 (15% de tokens enmascarados, `seed=42`), segun la model card:

| Fase de evaluacion | MLM Perplexity | Precision en tokens enmascarados | Delta vs baseline |
|---|---|---|---|
| BERT-base profesor (`bert-base-uncased`) | 6.84 | 68.42% | Referencia |
| Stage 0 (calibracion Ridge en forma cerrada) | 0.00 | 50.92% | -6.84 |
| Stage 2 (modelo destilado final) | 0.00 | 49.08% | -6.84 |

La perplejidad de 0.00 en las etapas destiladas es un indicio de colapso numerico o de un error de calculo en la metrica, no de un rendimiento superior: la precision en tokens enmascarados cae casi 20 puntos porcentuales respecto al profesor (49.08% frente a 68.42%), lo que confirma que el modelo no conserva la calidad del original. No se han publicado resultados en benchmarks estandar como MMLU, GLUE, SQuAD o HumanEval.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano del repo (0.5 GB) y los ~110 millones de parametros, cabria en GPUs de consumo con 4-8 GB en precision completa, aunque no se documenta.
- VRAM reportada durante el entrenamiento: 23021 MB pico en una NVIDIA RTX 3090 de 24 GB.
- GPU recomendadas: la model card solo menciona la RTX 3090 empleada en la destilacion; no se documentan recomendaciones de despliegue.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3060/4060 o superiores, aunque el dato no esta confirmado.
- Opciones de despliegue: `transformers.pipeline("fill-mask")` y la API `neuralops.load_pretrained_bert`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 1004.2 tokens/s durante el entrenamiento en RTX 3090; no se reporta throughput de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento MLM (WikiText-2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-gdn2-attention-sst2` | ~110 M | 512 | PPL 0.00 / acc 49.08% | MIT | Hugging Face |
| `google-bert/bert-base-uncased` | ~110 M | 512 | PPL 6.84 / acc 68.42% | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased` | ~66 M | 512 | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| `roberta-base` | ~125 M | 512 | no disponible en esta ficha | MIT | Hugging Face |

La comparacion directa con el profesor es la mas informativa: mismo tamano y contexto, pero el modelo destilado pierde cerca de 19 puntos de precision en tokens enmascarados. Frente a `distilbert-base-uncased` y `roberta-base` no hay datos de benchmarks en la informacion disponible.

## Limitaciones y advertencias

- Calidad degradada: la precision en tokens enmascarados cae al 49.08% frente al 68.42% del profesor, lo que lo hace inadecuado para tareas reales de lenguaje.
- Perplejidad reportada de 0.00 en las etapas destiladas, valor no interpretable que sugiere un fallo en la metrica o colapso numerico del modelo.
- Solo ingles: no se declaran capacidades multilingues.
- Contexto limitado a 512 tokens, heredado de BERT-base.
- Riesgo elevado de predicciones incorrectas y de alucinacion en `fill-mask`, dado el bajo rendimiento observado.
- Sesgos: no se documenta ninguna evaluacion de sesgos; al derivar de `bert-base-uncased`, hereda los sesgos del corpus original (BooksCorpus y Wikipedia en ingles).
- Licencia MIT: permite uso comercial, pero el estado del modelo desaconseja cualquier despliegue en produccion.
- Dependencia de la libreria NeuralOps y de codigo personalizado (`custom_code`): requiere `trust_remote_code` y no es compatible de forma nativa con el ecosistema estandar sin esa dependencia.
- Entrenamiento extremadamente corto (8 pasos, 300 s): el modelo no ha convergido y no debe tratarse como un checkpoint finalizado.
- Cero descargas y cero likes en el momento de la consulta: no hay validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-gdn2-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset WikiText-2: https://huggingface.co/datasets/wikitext
