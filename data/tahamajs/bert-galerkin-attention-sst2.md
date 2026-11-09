# tahamajs/bert-galerkin-attention-sst2

## Resumen

`tahamajs/bert-galerkin-attention-sst2` es una variante de `google-bert/bert-base-uncased` en la que las 12 capas de atencion multi-cabeza estandar se han sustituido por el mecanismo `galerkin_attention` de la libreria NeuralOps. El modelo lo desarrolla Taha Majlesi (usuario `tahamajs`) y se distribuye con licencia MIT. Su proposito es servir como banco de pruebas de mecanismos de atencion subcuadraticos sobre un transformer encoder clasico, manteniendo el resto de la arquitectura y los pesos preentrenados de BERT-Base.

El modelo se ha destilado sobre WikiText-2 mediante un pipeline de destilacion de conocimiento en tres etapas (calibracion ridge en forma cerrada, MSE/CKA con backbone congelado y KD de logits fusionada con learning rate diferencial), ejecutado durante 300 segundos en una NVIDIA RTX 3090. El resultado es un modelo de relleno de mascaras (`fill-mask`) orientado a evaluacion empirica de mecanismos de atencion, no a produccion general.

Es relevante ahora porque forma parte del "Attention Zoo" de NeuralOps, una iniciativa que compara variantes de atencion subcuadratica sobre un mismo backbone y dataset, con telemetria de entrenamiento reproducible. Su tamano (repo de 0,5 GB, pesos en formato PyTorch) y su contexto de 512 tokens lo sitúan en la categoria de BERT-Base clasico, pero con un mecanismo de atencion alternativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Base) con atencion `galerkin_attention` en las 12 capas |
| Parametros totales | no disponible (base `bert-base-uncased`, ~110 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible de forma explicita; BERT-Base estandar usa 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch`), con `custom_code` para el mecanismo de atencion |
| Libreria | `neuralops` (custom code) |
| Modelo base | `google-bert/bert-base-uncased` |
| Dataset de destilacion | WikiText-2 |
| Tarea | `fill-mask` (masked language modeling) |
| Tamano del repo | 0,5 GB |
| Region | US |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo BERT-Base (12 capas, hidden size 768, 12 cabezas de atencion en la version original) en el que se sustituye la atencion multi-cabeza estandar por `galerkin_attention`. El resto de componentes (embeddings, feed-forward, layer norm) se mantienen del checkpoint `bert-base-uncased`. El tokenizador es el de BERT-Base sin cased (WordPiece, vocabulario de 30.522 tokens). Al tratarse de un mecanismo de atencion subcuadratico, el objetivo declarado es reducir el coste computacional de la atencion manteniendo la calidad de representacion.

El entrenamiento consiste en una destilacion de conocimiento sobre WikiText-2 en tres etapas: Stage 0 (calibracion ridge en forma cerrada), Stage 1 (MSE/CKA sobre subespacio con backbone congelado) y Stage 2 (KD de logits fusionada con learning rate diferencial). La destilacion se ejecuto durante 300 segundos (225 pasos) en una RTX 3090 de 24 GB, con un throughput de 36.208,7 tokens/s y un pico de VRAM de 13.512 MB. No se especifica el numero total de tokens de entrenamiento ni la composicion exacta del dataset mas alla de WikiText-2.

## Capacidades

- Relleno de mascaras (masked language modeling) en ingles, tarea principal declarada (`fill-mask`).
- Representaciones contextuales de tokens reutilizables para tareas downstream (clasificacion, NER, QA extractiva) mediante fine-tuning.
- Evaluacion comparativa de mecanismos de atencion subcuadraticos frente a atencion estandar.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso.
- No se documenta modo thinking, vision ni audio.
- Capacidad multilingue limitada al ingles (unico idioma declarado).
- Integracion con `transformers` mediante `pipeline("fill-mask")` y con la API de alto nivel de NeuralOps (`neuralops.load_pretrained_bert`).

## Casos de uso

- Evaluacion de mecanismos de atencion: usar el modelo como referencia en experimentos que comparen `galerkin_attention` con atencion estandar sobre el mismo backbone y dataset, midiendo perplejidad MLM y precision de tokens enmascarados.
- Relleno de mascaras en ingles: completar huecos en frases para tareas de preprocesado, aumento de datos o generacion de candidatos lexicos en pipelines NLP.
- Extraccion de embeddings contextuales: usar las representaciones de las capas ocultas como features para clasificadores ligeros en tareas de NLP en ingles, dado que el modelo conserva la estructura de BERT-Base.
- Fine-tuning para clasificacion de texto: adaptar el modelo a tareas como analisis de sentimiento o clasificacion de topicos en ingles, aprovechando la inicializacion desde `bert-base-uncased` y el mecanismo de atencion alternativo.
- Investigacion en destilacion de conocimiento: reproducir o extender el pipeline de tres etapas de NeuralOps sobre otros backbones o datasets, usando la telemetria publicada (225 pasos, 300 s, 36.208 tokens/s) como linea base.
- Prototipado de pipelines de NLP en ingles: integrar el modelo en entornos de experimentacion con `transformers` para validar rapidamente hipotesis sobre arquitecturas de atencion antes de escalar a modelos mayores.
- Docencia y divulgacion: ilustrar como se sustituye un componente arquitectonico (atencion) manteniendo el resto del modelo y como se evalua el impacto con perplejidad MLM determinista.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, evaluados con perplejidad MLM determinista sobre WikiText-2 (15% de tokens enmascarados, `seed=42`):

| Fase de evaluacion | MLM PPL | Precision de token enmascarado (%) | Delta vs baseline |
|---|---|---|---|
| BERT-Base teacher (`bert-base-uncased`) | 6,84 | 68,42 | referencia |
| Stage 0 (calibracion ridge en forma cerrada) | 0,00 | 43,58 | -6,84 |
| Stage 2 (modelo destilado post-KD) | 0,00 | 84,63 | -6,84 |

Advertencia: los valores de PPL de 0,00 en Stage 0 y Stage 2 son anomalos y no son interpretables como una mejora real de perplejidad; probablemente reflejan un artefacto de la metrica (por ejemplo, saturacion numerica o un error de calculo) y no deben citarse como rendimiento del modelo. La unica cifra plausible es la precision de token enmascarado del 84,63% en Stage 2, que supera al teacher (68,42%) en esa metrica concreta, si bien conviene validarla de forma independiente. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, GLUE, SQuAD) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Por el tamano del repo (0,5 GB) y la arquitectura BERT-Base (~110 M de parametros), la inferencia en fp32 requiere aproximadamente 0,5-1 GB de VRAM; en fp16, alrededor de 0,3-0,5 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente para inferencia en fp16; el autor uso una RTX 3090 (24 GB) para la destilacion, con un pico de 13.512 MB.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna (GTX 1060 6 GB, RTX 2060, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: `transformers` con `pipeline("fill-mask")`; la libreria `neuralops` para carga de alto nivel. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI; al requerir `custom_code`, la conversion a GGUF u otros formatos no esta garantizada.
- Latencia y throughput estimados: no disponibles para inferencia. La telemetria de entrenamiento reporta 36.208,7 tokens/s en una RTX 3090 durante la destilacion, dato no extrapolable a inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Mecanismo de atencion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-galerkin-attention-sst2` | ~110 M (no confirmado) | no disponible (BERT-Base: 512) | `galerkin_attention` (subcuadratica) | MIT | Hugging Face, requiere `neuralops` |
| `google-bert/bert-base-uncased` | 110 M | 512 | atencion multi-cabeza estandar | Apache 2.0 | Hugging Face, `transformers` nativo |
| `distilbert-base-uncased` | 66 M | 512 | atencion multi-cabeza estandar | Apache 2.0 | Hugging Face, `transformers` nativo |
| `roberta-base` | 125 M | 514 | atencion multi-cabeza estandar | MIT | Hugging Face, `transformers` nativo |

La comparativa se limita a arquitecturas encoder de tamano similar; no se dispone de datos de rendimiento comparables en benchmarks estandar para el modelo `galerkin_attention`, por lo que la comparacion se centra en parametros, contexto, licencia y disponibilidad. `distilbert-base-uncased` es la alternativa mas ligera; `roberta-base` ofrece mejor rendimiento tipico en GLUE con licencia MIT; `bert-base-uncased` es la referencia canonica y la unica con soporte nativo completo en `transformers` sin `custom_code`.

## Limitaciones y advertencias

- Solo soporta ingles; no se declara capacidad multilingue.
- Los valores de perplejidad MLM de 0,00 en la model card son anomalos y no deben interpretarse como rendimiento real; la metrica de precision de token enmascarado (84,63%) requiere validacion independiente.
- El modelo requiere `custom_code` (libreria `neuralops`) para cargarse; no es compatible de forma nativa con `transformers` sin instalar dicha libreria, lo que complica el despliegue en entornos estandar.
- No se han publicado resultados en benchmarks estandar (GLUE, SQuAD, MMLU), por lo que no hay evidencia publica de rendimiento en tareas downstream.
- El proceso de destilacion fue muy corto (300 segundos, 225 pasos), lo que sugiere un ajuste limitado y posible olvido catastrofico de las capacidades originales de BERT-Base.
- Riesgo de alucinacion y sesgos: no evaluado en la informacion disponible; al derivar de `bert-base-uncased`, hereda los sesgos de su corpus de preentrenamiento (BooksCorpus + Wikipedia en ingles).
- Aunque la licencia es MIT (permisiva para uso comercial), la dependencia de `custom_code` de NeuralOps puede imponer restricciones adicionales no documentadas; conviene revisar la licencia del repositorio NeuralOps antes de un uso comercial.
- El nombre del repositorio incluye "sst2", pero la model card no documenta fine-tuning en SST-2; la tarea declarada es `fill-mask` sobre WikiText-2.
- No se documenta soporte para tool calling, agentes ni contextos largos mas alla de los 512 tokens de BERT-Base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-galerkin-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset WikiText-2: https://huggingface.co/datasets/wikitext
- Perfil del autor: https://huggingface.co/tahamajs
