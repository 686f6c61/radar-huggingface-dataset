# tahamajs/bert-gqa-attention-sst2

## Resumen

`tahamajs/bert-gqa-attention-sst2` es una variante del modelo `google-bert/bert-base-uncased` en la que se han sustituido las 12 capas de atencion multi-cabeza estandar por el mecanismo `gqa_attention` (Grouped-Query Attention) de la libreria NeuralOps. El modelo lo desarrolla Taha Majlesi en el contexto del proyecto NeuralOps, un "attention zoo" que recopila variantes de atencion subcuadratica aplicadas sobre arquitecturas BERT preentrenadas. El objetivo es doble: por un lado, servir como banco de pruebas de mecanismos de atencion alternativos sobre un backbone conocido; por otro, demostrar un pipeline de destilacion de conocimiento acelerado en GPU.

El modelo se ha destilado sobre WikiText-2 mediante el pipeline de destilacion en tres etapas de NeuralOps, con un entrenamiento de solo 300 segundos en una NVIDIA RTX 3090. La tarea declarada es `fill-mask` (masked language modeling) y el unico idioma soportado es el ingles. Se distribuye con licencia MIT y un tamano de repositorio de 0,5 GB, coherente con un BERT-base (~110 M de parametros) en formato de pesos de PyTorch.

La relevancia de esta ficha es acotada: no es un modelo de proposito general ni compite con LLMs generativos, sino una pieza de investigacion sobre eficiencia de atencion y destilacion. Resulta util para quien quiera evaluar el impacto de GQA en tareas de comprension bidirectional o reproducir el pipeline de NeuralOps.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base) con atencion Grouped-Query (gqa_attention) en las 12 capas |
| Parametros totales | ~110 M (heredados de bert-base-uncased; no se especifica recuento exacto tras el cambio de atencion) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (bert-base-uncased soporta 512 tokens; la model card no lo declara explicitamente) |
| Tipos de cuantizacion | No disponible (pesos PyTorch; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch`), con `custom_code` para el mecanismo de atencion; requiere la libreria `neuralops` |
| Tamano del repositorio | 0,5 GB |
| Tarea (pipeline) | `fill-mask` |
| Dataset de destilacion | WikiText-2 |
| Modelo base | `google-bert/bert-base-uncased` |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased`, un transformer encoder de 12 capas y ~110 M de parametros, y reemplaza en cada capa el modulo de self-attention multi-cabeza por `gqa_attention`, un mecanismo de Grouped-Query Attention en el que varias cabezas de query comparten un mismo conjunto de cabezas de clave/valor. Esto reduce el numero de proyecciones K/V y, en teoria, el coste de memoria y computo asociado a la atencion, manteniendo la dimensionalidad de salida del bloque. El modelo requiere `custom_code` y la libreria NeuralOps para cargarse, ya que el mecanismo no es nativo de `transformers`.

El entrenamiento consiste en una destilacion de conocimiento sobre WikiText-2 ejecutada con el pipeline de tres etapas de NeuralOps: Stage 0 (calibracion ridge en forma cerrada), Stage 1 (MSE/CKA de subespacio con backbone congelado) y Stage 2 (destilacion de logits fusionada con learning rate diferencial). La ejecucion completa duro 300 segundos (5 minutos), 206 pasos, con un throughput de 35.013,4 tokens/segundo y un pico de VRAM de 23.021 MB en una RTX 3090. No se documentan el numero total de tokens procesados, la composicion detallada del dataset ni si hubo etapas de RLHF o DPO (no aplicables a un modelo de masked LM).

## Capacidades

- Relleno de mascaras (masked language modeling): predice tokens `[MASK]` en texto en ingles, que es la tarea principal declarada.
- Comprension bidirectional del contexto: al ser un encoder BERT, produce representaciones contextuales utiles para clasificacion, NER y similitud semantica.
- Extraccion de embeddings: puede emplearse como encoder para features de frases o documentos en ingles.
- Evaluacion de mecanismos de atencion: sirve como banco de pruebas para comparar GQA frente a atencion multi-cabeza estandar en el mismo backbone.
- Tool calling / function calling: no soportado (no es un modelo instruido ni generativo).
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingues: limitadas al ingles.
- Modo "thinking", vision o audio: no disponible.

## Casos de uso

- Investigacion sobre eficiencia de atencion: comparar el rendimiento de GQA frente a atencion multi-cabeza estandar sobre el mismo backbone BERT y el mismo dataset (WikiText-2), midiendo perplejidad y precision de tokens enmascarados.
- Relleno de huecos en ingles para herramientas de edicion o autocompletado: usar el pipeline `fill-mask` para sugerir palabras en plantillas de texto, con la ventaja de un modelo pequeno (~110 M) que cabe en cualquier GPU consumer.
- Extraccion de embeddings para busqueda semantica en ingles: emplear las representaciones del encoder como base para un sistema de recuperacion de documentos o clustering de textos.
- Clasificacion de texto y analisis de sentimiento: hacer fine-tuning sobre el encoder para tareas downstream en ingles (el sufijo `sst2` del nombre sugiere un uso previsto en clasificacion de sentimiento, aunque no se documenta el fine-tuning en la model card).
- Reproduccion de pipelines de destilacion: servir como ejemplo reproducible del pipeline de tres etapas de NeuralOps para experimentar con destilacion acelerada en una sola GPU.
- Prototipado rapido en entornos con VRAM limitada: al ser un modelo de 0,5 GB, permite iterar en portatiles con GPU consumer o incluso en CPU para inferencia puntual.
- Docencia y formacion: ilustrar el efecto de sustituir mecanismos de atencion en arquitecturas conocidas sin reentrenar desde cero.

## Benchmarks y rendimiento

Los unicos datos publicados son los de la evaluacion de destilacion con MLM-PPL (perplejidad de masked LM) sobre WikiText-2, con 15% de tokens enmascarados y `seed=42`:

| Fase de evaluacion | MLM Perplexity | Precision de token enmascarado (%) | Delta vs baseline |
|---|---|---|---|
| BERT teacher vanilla (`bert-base-uncased`) | 6,84 | 68,42% | Referencia |
| Stage 0 (calibracion ridge en forma cerrada) | 0,00 | 91,63% | -6,84 |
| Stage 2 (modelo destilado final) | 0,00 | 91,40% | -6,84 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, GLUE, SQuAD) en la informacion disponible. La perplejidad de 0,00 debe interpretarse con cautela: es un valor atipico que sugiere una posible fuga de informacion en la evaluacion o un artefacto del protocolo de pseudo-perplejidad, y no es directamente comparable con perplejidades convencionales.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,5 GB en FP32 para el modelo completo (~110 M de parametros); en FP16 ~0,25 GB, mas overhead del runtime de PyTorch y del codigo custom de NeuralOps.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento documentado uso una RTX 3090 (24 GB) con un pico de 23.021 MB, lo que indica que el pipeline de destilacion es intensivo en memoria.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (RTX 3060, RTX 4060, GTX 1660, etc.) e incluso en CPU para inferencia puntual.
- Opciones de despliegue: `transformers` con `pipeline("fill-mask")` (requiere `trust_remote_code` por el `custom_code`), API de alto nivel de NeuralOps (`neuralops.load_pretrained_bert`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras de latencia de inferencia. El unico dato de throughput es de entrenamiento (35.013,4 tokens/segundo en una RTX 3090).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-gqa-attention-sst2` | ~110 M | No disponible (base: 512) | Fill-mask | MIT | Hugging Face |
| `google-bert/bert-base-uncased` | ~110 M | 512 | Fill-mask / encoder | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased` | ~66 M | 512 | Fill-mask / encoder | Apache 2.0 | Hugging Face |
| `roberta-base` | ~125 M | 514 | Fill-mask / encoder | MIT | Hugging Face |

La comparativa de rendimiento no esta disponible: no hay resultados de benchmarks estandar publicados para este modelo que permitan una comparacion rigurosa con las alternativas. La diferencia principal frente a `bert-base-uncased` es el mecanismo de atencion (GQA) y el proceso de destilacion; frente a `distilbert-base-uncased`, el tamano es mayor pero la naturaleza experimental del modelo limita su uso en produccion.

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidades multilingues.
- La perplejidad reportada de 0,00 es sospechosa y sugiere un posible fallo metodologico en la evaluacion; no debe tomarse como evidencia de rendimiento superior al teacher.
- El modelo no es generativo ni instruido: no soporta tool calling, agentes ni razonamiento multi-paso.
- Requiere `custom_code` y la libreria NeuralOps; la integracion con el ecosistema `transformers` no es directa y puede romper herramientas estandar.
- No se documentan sesgos conocidos, pero al heredar el preentrenamiento de `bert-base-uncased` arrastra los sesgos de su corpus original.
- Riesgo de alucinacion: bajo en la tarea de fill-mask, pero las predicciones de tokens pueden ser incorrectas en contextos ambiguos.
- Licencia MIT: permite uso comercial, pero el modelo base `bert-base-uncased` tiene licencia Apache 2.0, cuyos terminos deben respetarse igualmente.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validacion por parte de la comunidad, sin mantenimiento documentado y sin garantias de produccion.
- No se documentan resultados en benchmarks estandar (GLUE, SQuAD, etc.), lo que impide evaluar su calidad real frente a alternativas consolidadas.
- El entrenamiento de destilacion de 300 segundos y 206 pasos es muy corto; la robustez del modelo en dominios distintos de WikiText-2 es incierta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-gqa-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset WikiText-2: https://huggingface.co/datasets/wikitext
