# tahamajs/bert-comp-kronecker-compressor-sst2

## Resumen

`bert-comp-kronecker-compressor-sst2` es un checkpoint de `google-bert/bert-base-uncased` comprimido fisicamente mediante la tecnica `kronecker_compressor` (familia `tensor_decomp`) de la libreria NeuralOps, desarrollada por Taha Majlesi. El modelo parte de un BERT-Base afinado en GLUE SST-2 y se somete a una descomposicion tensorial de rango `k=128`, seguida de un proceso de "curacion" con adaptadores LoRA de rango `r=8`. El resultado es un checkpoint de 48,4 millones de parametros (frente a los 109,5 millones del modelo base), con una ratio de compresion fisica de 2,26x.

El problema que aborda es la reduccion del coste de almacenamiento e inferencia de modelos transformer en tareas de clasificacion. La propuesta es interesante como ejercicio de investigacion sobre descomposicion tensorial aplicada a BERT, pero los resultados son muy limitados: la precision en SST-2 cae del 91,63% del modelo profesor al 49,08% del checkpoint comprimido, lo que equivale practicamente a una clasificacion binaria aleatoria (50%). El propio autor documenta esta perdida de paridad de -42,55 puntos porcentuales.

Se trata de un artefacto de investigacion publicado en el zoo de compresores NeuralOps, no de un modelo listo para produccion. Su relevancia actual es metodologica: ilustra el compromiso entre ratio de compresion y calidad en tecnicas de descomposicion Kronecker sobre modelos BERT, y sirve como referencia negativa sobre los limites de estas tecnicas con presupuestos de curacion muy reducidos (50 pasos de LoRA, 45 segundos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Base), comprimido mediante descomposicion Kronecker |
| Parametros totales | 48.436.994 (comprimido); modelo base original: 109.483.778 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de bert-base-uncased, no especificada en la model card) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en `pytorch_model.bin`, sin variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`); requiere reconstruccion de la topologia con NeuralOps antes de cargar |
| Ratio de compresion | 2,26x (reduccion del 55,76% de parametros) |
| Rango de compresion (`k`) | 128 (checkpoint publicado) |
| Curacion LoRA | r=8, 50 pasos, lr=2e-4, presupuesto de 45 s |
| Tamano del repo | 0,1 GB |
| Libreria | neuralops |

## Arquitectura y entrenamiento

La arquitectura subyacente es BERT-Base uncased: 12 capas de transformer encoder con dimension oculta D=768 y 109.483.778 parametros. Sobre ese modelo afinado en GLUE SST-2 se aplica el compresor `kronecker_compressor` de NeuralOps, que descompone tensores mediante factorizacion de Kronecker en lugar de truncamiento SVD convencional. El checkpoint publicado corresponde al rango `k=128`, seleccionado como punto Pareto del barrido `k=256, 128, 64, 32`.

El proceso de curacion es notablemente agresivo: cuando la compresion zero-shot degrada la precision mas de 2 puntos porcentuales con una reduccion superior a 1,10x, NeuralOps aplica adaptadores LoRA de rango 8 durante solo 50 pasos con learning rate 2e-4 y un presupuesto de 45 segundos. Esta curacion, segun la tabla del autor, no recupera el rendimiento: en `k=128` la precision zero-shot es del 52,52% y tras el LoRA baja al 49,08%. El modelo profesor alcanza 91,63%, de modo que la compresion destruye practicamente toda la capacidad discriminativa aprendida en SST-2. En `k=32` el proceso directamente falla con `FAIL_CRASH`. No se documentan detalles sobre el dataset de curacion mas alla de GLUE SST-2 ni sobre el numero de tokens de entrenamiento del modelo base.

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) sobre texto en ingles, tarea para la que fue afinado (GLUE SST-2).
- Generacion de logits de clasificacion en dos clases mediante `BertForSequenceClassification`.
- Inferencia en CPU y GPU tras reconstruir la topologia comprimida con `compress_model` de NeuralOps.
- No dispone de capacidad de generacion de texto, razonamiento, codigo ni matematicas: es un encoder de clasificacion, no un modelo generativo.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues: no, solo ingles.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Investigacion sobre compresion de modelos: sirve como referencia reproducible para estudiar el efecto de la descomposicion Kronecker en BERT-Base con distintos rangos (`k=256, 128, 64, 32`), comparando precision frente a ratio de compresion.
- Docencia y divulgacion: ejemplo didactico de como una tecnica de descomposicion tensorial puede degradar severamente una tarea de clasificacion cuando el presupuesto de curacion es minimo (50 pasos de LoRA).
- Benchmark de pipelines de compresion: util para validar la implementacion del compresor `kronecker_compressor` de NeuralOps frente a otras tecnicas del zoo (SVD, quantizacion, pruning), usando el checkpoint como caso base.
- Pruebas de integracion de la libreria NeuralOps: el flujo de reconstruccion (`compress_model` + `load_state_dict` con `strict=False`) permite verificar la compatibilidad del pipeline en entornos de CI.
- Analisis de degradacion por rango: el fichero `compression_summary.json` facilita estudios sobre el punto en que la compresion deja de ser viable (en este caso, `k=32` provoca crash).
- No se recomienda su uso en produccion para analisis de sentimiento real, dado que su precision del 49,08% es equivalente a una clasificacion aleatoria.

## Benchmarks y rendimiento

Resultados declarados por el autor (model-index, no verificados):

| Metrica | Valor |
|---|---|
| GLUE SST-2 Validation Accuracy (checkpoint `k=128` con LoRA) | 49,08% |
| GLUE SST-2 Validation Accuracy (zero-shot `k=128`) | 52,52% |
| Teacher Baseline (`bert-base-uncased` afinado SST-2) | 91,63% |
| Paridad frente al profesor | -42,55% |

Barrido multi-rango sobre GLUE SST-2 validation (872 muestras, RTX 3090):

| Rank (`k`) | Ratio fisico | Parametros (reduccion) | Zero-shot Acc | Healed Acc | Paridad vs profesor |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,57x | 69.670.658 (-36,4%) | 59,40% | 50,92% (LoRA) | -40,71% |
| 128 | 2,26x | 48.436.994 (-55,8%) | 52,52% | 49,08% (LoRA) | -42,55% |
| 64 | 2,90x | 37.820.162 (-65,5%) | 51,38% | 49,08% (LoRA) | -42,55% |
| 32 | no disponible | no disponible | FAIL_CRASH | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (48,4 M de parametros, ~194 MB de pesos) y ~100 MB en FP16. El checkpoint completo ocupa 92,5 MB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el autor evaluo en NVIDIA GeForce RTX 3090 (24 GB), aunque el modelo no la requiere.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, GTX 1660, etc.) e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: no hay soporte directo en vLLM, llama.cpp, Ollama ni TGI. Requiere el pipeline de NeuralOps (`compress_model`) para reconstruir la topologia antes de cargar el state dict, y despues puede ejecutarse con PyTorch/Transformers estandar.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor menciona un presupuesto de 45 s para la curacion LoRA, pero no datos de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 Acc | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `tahamajs/bert-comp-kronecker-compressor-sst2` (k=128) | 48,4 M | no disponible | 49,08% | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (afinado SST-2, profesor) | 109,5 M | 512 tokens | 91,63% | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` (referencia comunitaria) | 109,5 M | 512 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66,9 M | 512 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face |

La comparacion relevante es con el modelo profesor: la compresion reduce parametros un 55,8% pero sacrifica 42,55 puntos de precision. Frente a alternativas de destilacion como DistilBERT (66,9 M de parametros), que mantienen precision cercana al profesor con una reduccion menor, la propuesta Kronecker en este checkpoint no resulta competitiva en calidad.

## Limitaciones y advertencias

- Precision de 49,08% en SST-2, practicamente equivalente a clasificacion aleatoria en una tarea binaria. No es util para analisis de sentimiento real.
- La curacion LoRA empeora el resultado zero-shot (de 52,52% a 49,08%) en `k=128`, lo que sugiere que el procedimiento de curacion no esta bien calibrado para este checkpoint.
- El rango `k=32` provoca un fallo (`FAIL_CRASH`) durante la compresion, lo que indica inestabilidad del compresor en regimenes de alta compresion.
- Requiere reconstruir la topologia con la libreria NeuralOps antes de cargar los pesos; no es plug-and-play con `AutoModel.from_pretrained` estandar.
- Solo soporta ingles y la tarea SST-2 (clasificacion binaria de sentimiento).
- Riesgo de alucinacion: no aplica en sentido generativo, pero la salida de clasificacion es esencialmente no fiable dado el nivel de precision.
- Sesgos: no documentados por el autor; al derivar de `bert-base-uncased` y SST-2, hereda los sesgos de ese corpus, aunque la degradacion por compresion los hace secundarios.
- Licencia MIT permite uso comercial, pero el rendimiento del modelo desaconseja cualquier despliegue en produccion.
- Los resultados del model-index estan marcados como `verified: false`; no han sido validados de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-kronecker-compressor-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementacion del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/tensor_decomp/kronecker_compressor.py
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
