# tahamajs/bert-flash-attention3-fp8-sst2

## Resumen

`tahamajs/bert-flash-attention3-fp8-sst2` es una variante del modelo `google-bert/bert-base-uncased` en la que las 12 capas de atencion multi-cabeza estandar se han sustituido por el mecanismo `flash_attention3_fp8` de la libreria NeuralOps, desarrollada por Taha Majlesi. El modelo se ha destilado sobre WikiText-2 mediante un pipeline de destilacion de conocimiento en tres etapas (calibracion ridge en forma cerrada, MSE/CKA sobre subespacio con backbone congelado y KD de logits fusionada con LR diferencial) ejecutado durante 300 segundos en una NVIDIA RTX 3090.

Se trata de un experimento de investigacion sobre atencion subcuadratica y eficiencia, no de un modelo listo para produccion: la model card reporta una perplejidad MLM de 0.00, un valor que no es interpretable como rendimiento real y que sugiere un problema de fuga de informacion o de calculo en la evaluacion. El repositorio ocupa 0.5 GB, la licencia es MIT y el unico idioma declarado es el ingles.

El interes actual del modelo es acotado: sirve como referencia tecnica del catalogo "Attention Zoo" de NeuralOps y como ejemplo reproducible de su pipeline de destilacion, pero sus metricas publicadas no permiten validar la calidad del modelo resultante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base) con atencion `flash_attention3_fp8` en las 12 capas |
| Parametros totales | no disponible (base: `bert-base-uncased`, aproximadamente 110 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la de `bert-base-uncased` es 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (el nombre sugiere FP8 en el mecanismo de atencion, sin detalle de esquema) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | no disponible (libreria `neuralops`, `custom_code`; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` y reemplaza las 12 capas de self-attention multi-cabeza por el mecanismo `flash_attention3_fp8`, una implementacion de atencion FlashAttention-3 con calculo en FP8 integrada en la libreria NeuralOps. La model card etiqueta el mecanismo como "subquadratic-attention", aunque no se aporta detalle algoritmico ni complejidad asintotica. El modelo requiere `custom_code` y se carga a traves de la API `neuralops.load_pretrained_bert` o mediante `transformers.pipeline` con `trust_remote_code`.

El entrenamiento consiste en una destilacion de conocimiento desde el BERT profesor sobre WikiText-2, con un curriculum de tres etapas: Stage 0 (calibracion ridge en forma cerrada), Stage 1 (MSE/CKA sobre subespacio con backbone congelado) y Stage 2 (KD de logits fusionada con LR diferencial). La telemetria reportada indica 300 segundos, 226 pasos, 39.076,1 tokens/s de throughput y 13.512 MB de VRAM pico en una RTX 3090 de 24 GB. No se especifica el numero total de tokens de entrenamiento ni la composicion exacta del dataset mas alla de WikiText-2.

## Capacidades

- Relleno de mascaras (masked language modeling) en ingles, que es la tarea declarada en el pipeline (`fill-mask`).
- Representaciones contextuales de tokens para tareas downstream de NLP (clasificacion, NER, QA extractiva) mediante fine-tuning, aunque no se aportan resultados en dichas tareas.
- Atencion con calculo en FP8 y mecanismo tipo FlashAttention-3, orientado a eficiencia en GPU.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo "thinking".
- Capacidad multilingue limitada al ingles segun el campo `language`.

## Casos de uso

- Investigacion sobre atencion eficiente: comparar el mecanismo `flash_attention3_fp8` frente a la atencion estandar de BERT en terminos de throughput y consumo de VRAM, usando la telemetria publicada (39.076 tokens/s, 13,5 GB pico) como punto de partida reproducible.
- Reproduccion de pipelines de destilacion: el modelo sirve como ejemplo del curriculum en tres etapas de NeuralOps, util para validar implementaciones propias de KD sobre modelos encoder.
- Benchmarking de kernels FP8 en GPUs consumer: permite medir el impacto de FP8 en atencion sobre una RTX 3090 frente a alternativas en FP16/BF16.
- Prototipado de `fill-mask` en ingles: uso basico mediante `transformers.pipeline("fill-mask")` para experimentos docentes o de demostracion, no para produccion.
- Extraccion de embeddings para tareas downstream: fine-tuning sobre datasets propios de clasificacion o NER en ingles, con la cautela de que no hay metricas publicadas de calidad.
- Docencia sobre arquitecturas transformer: ilustra la sustitucion de un bloque de atencion y el impacto en el grafo computacional del modelo.

## Benchmarks y rendimiento

Los unicos datos publicados son de la propia model card, en evaluacion de MLM sobre WikiText-2 con 15% de enmascaramiento y `seed=42`:

| Fase de evaluacion | MLM Perplexity | Precision en tokens enmascarados | Delta vs baseline |
|---|---|---|---|
| BERT profesor (`bert-base-uncased`) | 6,84 | 68,42% | referencia |
| Stage 0 (calibracion ridge) | 0,00 | 91,63% | -6,84 |
| Stage 2 (modelo destilado) | 0,00 | 92,78% | -6,84 |

Una perplejidad de 0,00 es matematicamente incompatible con una evaluacion honesta de MLM y apunta a un error de calculo o a fuga de informacion en el protocolo. No se han publicado resultados de benchmarks estandar (MMLU, GLUE, SQuAD, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el entrenamiento consumio 13.512 MB pico en una RTX 3090, por lo que la inferencia en FP8 deberia caber holgadamente en GPUs consumer de 8-12 GB, aunque no se confirma.
- GPUs recomendadas: NVIDIA RTX 3090 (unica documentada); se desconoce el soporte de A100, H100 o RTX 4090 para el kernel FP8.
- Cabe en GPU consumer: probablemente si, dado el tamano del modelo base (~110 M de parametros) y el uso de FP8, pero no esta verificado en la model card.
- Opciones de despliegue: libreria `neuralops`, `transformers` con `custom_code`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 39.076,1 tokens/s en entrenamiento sobre RTX 3090; no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-flash-attention3-fp8-sst2` | ~110 M (base) | no disponible | `fill-mask` | MIT | Hugging Face (0 descargas) |
| `google-bert/bert-base-uncased` | 110 M | 512 | `fill-mask` y fine-tuning | Apache 2.0 | Hugging Face, ampliamente usado |
| `distilbert-base-uncased` | 66 M | 512 | `fill-mask` y fine-tuning | Apache 2.0 | Hugging Face, ampliamente usado |
| `microsoft/deberta-v3-base` | ~86 M (backbone) | 512 | NLU (clasificacion, QA) | MIT | Hugging Face |

La comparativa de rendimiento no es posible: el modelo NeuralOps no publica metricas estandar y su perplejidad reportada no es fiable. Frente a `bert-base-uncased`, la diferencia es la sustitucion del mecanismo de atencion y el proceso de destilacion; frente a `distilbert`, el modelo NeuralOps no reduce parametros, solo cambia la atencion.

## Limitaciones y advertencias

- La perplejidad MLM de 0,00 y la precision del 92,78% son resultados no creibles; no deben usarse para evaluar el modelo.
- Solo se ha evaluado en WikiText-2 con un unico seed; no hay validacion en tareas downstream ni en otros datasets.
- El modelo solo soporta ingles segun el campo `language`.
- Requiere `custom_code` y la libreria `neuralops`, lo que anade dependencias y riesgo de mantenimiento frente a un modelo `transformers` estandar.
- No se documentan sesgos, pero al derivar de `bert-base-uncased` y entrenarse solo con WikiText-2, hereda los sesgos del corpus original y no se ha realizado ninguna mitigacion.
- Riesgo de alucinacion y de predicciones incorrectas en `fill-mask` no cuantificado.
- La licencia MIT permite uso comercial, pero la ausencia de benchmarks fiables desaconseja su uso en produccion sin una evaluacion propia.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay evidencia de uso o validacion por parte de la comunidad.
- El soporte de FP8 depende del hardware; no se especifica que GPUs lo soportan nativamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-flash-attention3-fp8-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
