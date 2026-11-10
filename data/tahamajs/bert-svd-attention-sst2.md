# tahamajs/bert-svd-attention-sst2

## Resumen

`tahamajs/bert-svd-attention-sst2` es un checkpoint derivado de `google-bert/bert-base-uncased` en el que las 12 capas de atencion softmax cuadratica originales han sido sustituidas por el mecanismo `svd_attention` de la libreria NeuralOps. Lo publica Taha Majlesi (usuario `tahamajs`) como parte de un "Attention Zoo" que compara variantes de atencion subcuadratica sobre BERT-Base. El modelo resuelve una tarea concreta: clasificacion binaria de sentimiento en el split de validacion de SST-2 (GLUE), con 872 muestras.

La relevancia es experimental, no de produccion. El propio autor reporta una precision del 50,80 % en SST-2, es decir, practicamente el nivel de azar en una tarea binaria, frente al 91,63 % del profesor `bert-base-uncased`. El checkpoint es, por tanto, una sonda de investigacion sobre si la atencion SVD puede destilarse con un protocolo de bajo coste (51,3 s de entrenamiento en una RTX 3090), no un modelo util para desplegar.

El repositorio pesa 0,1 GB porque solo serializa los pesos de atencion y la cabeza de clasificacion en FP16 (`attention_weights.safetensors`, ~55 MB); los pesos congelados del BERT base se reconstruyen en tiempo de carga desde `bert-base-uncased` mediante codigo remoto (`trust_remote_code=True`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base con atencion `svd_attention` (subcuadratica) en las 12 capas |
| Parametros totales | 110 M (heredados de BERT-Base); el checkpoint solo contiene pesos de atencion y cabeza de tarea |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (BERT-Base soporta 512 tokens; el autor no lo especifica) |
| Tipos de cuantizacion | pesos de atencion en FP16; no se documentan otras cuantizaciones |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, FP16, ~55 MB) con shim de codigo remoto `modeling_neuralops_bert.py` |
| Libreria | `neuralops` (compatible con `transformers` via `trust_remote_code=True`) |
| Modelo base | `google-bert/bert-base-uncased` |
| Tarea | Clasificacion binaria de sentimiento (SST-2) |
| Dataset de evaluacion | GLUE / SST-2, split de validacion (872 muestras) |

## Arquitectura y entrenamiento

La arquitectura es un BERT-Base estandar (12 capas, 110 M de parametros, encoder transformer) en el que cada bloque de multi-head attention cuadratica O(N^2) se reemplaza por `svd_attention`, que el autor describe como de complejidad efectiva O(N) u O(N log N). El resto de la red (embeddings, feed-forward, normalizaciones) permanece congelado y se carga desde `bert-base-uncased` en el momento de la inferencia.

El entrenamiento sigue el "NeuralOps Cached Representation Distillation Protocol": una primera etapa de alineamiento de subespacio oculto y una segunda etapa de KL sobre logits mas entropia cruzada de la tarea. Se ejecuto en una NVIDIA GeForce RTX 3090 (24 GB) durante 51,3 s, con 185 pasos de optimizacion, throughput de 29.559,2 tokens/s y un pico de VRAM de 8.013 MB. El autor destaca que no se reserva VRAM para el profesor porque las representaciones se cachean offline. No se documenta el numero total de tokens de entrenamiento, la composicion del dataset mas alla de SST-2 ni si hubo RLHF/DPO (no aplica a una tarea de clasificacion).

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) sobre texto en ingles, segun el ejemplo de inferencia de la model card.
- Inferencia via `transformers` con `AutoModelForSequenceClassification` y `trust_remote_code=True`.
- Carga modular via la API `neuralops.hub.bert_zoo.load_pretrained_bert`, que reconstruye el modelo sobre BERT-Base con `attention_type="svd_attention"`.
- Serializacion parametro-eficiente: solo se distribuyen pesos de atencion y cabeza de tarea.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni agentes.
- No se documenta modo "thinking" ni capacidades multilingues mas alla del ingles.

## Casos de uso

- Investigacion sobre atencion subcuadratica: sirve como punto de comparacion reproducible dentro del Attention Zoo de NeuralOps para medir el coste de precision al sustituir softmax por SVD en BERT-Base.
- Reproduccion de experimentos de destilacion: el protocolo de cache offline y los 185 pasos documentados permiten replicar el entrenamiento en una unica GPU de consumo.
- Pruebas de integracion de codigo remoto: util para validar flujos `trust_remote_code=True` y la carga modular de pesos de atencion sobre un backbone congelado.
- Benchmark de eficiencia de memoria: con 8.013 MB de pico de VRAM y 29.559 tokens/s, sirve para calibrar pipelines de entrenamiento de bajo presupuesto.
- Docencia y demos sobre limitaciones de la destilacion: el salto del 91,63 % al 50,80 % es un caso claro de destilacion insuficiente para discutir en clase.
- Baseline negativo en experimentos de NLP: util como referencia de "modelo que no aprende la tarea" frente al profesor original.
- No es adecuado para analisis de sentimiento en produccion: la precision reportada (50,80 %) equivale practicamente a una prediccion aleatoria en una tarea binaria.

## Benchmarks y rendimiento

Evaluacion reportada por el autor en el split de validacion de GLUE SST-2 (872 muestras binarias):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`svd_attention`) | Modelo destilado (post-KD) | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 48,85 % | 50,80 % | +1,95 % |
| Entropia cruzada de validacion | 0,2428 | no calibrada | 0,7065 | no disponible |

Telemetria de entrenamiento (RTX 3090, 24 GB):

| Metrica | Valor |
|---|---|
| Duracion | 51,3 s |
| Pasos de optimizacion | 185 |
| Throughput | 29.559,2 tokens/s |
| Pico de VRAM | 8.013 MB |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM de inferencia: no explicitamente documentada; el pico de entrenamiento fue de 8.013 MB en una RTX 3090. La inferencia con BERT-Base (110 M) mas los pesos de atencion FP16 deberia caber holgadamente en GPUs de 8 GB o menos, aunque el autor no publica la cifra exacta.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM; el autor valido el entrenamiento en RTX 3090. No se documentan pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: si, cabe en RTX 3090 y previsiblemente en RTX 3080/4080/4090 y similares; no hay datos oficiales para GPUs de 4-6 GB.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y la libreria `neuralops`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo se reporta throughput de entrenamiento (29.559,2 tokens/s); no hay datos de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-svd-attention-sst2` | 110 M (solo atencion + cabeza serializadas) | no disponible | 50,80 % | MIT | Hugging Face, `neuralops` / `transformers` con codigo remoto |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 tokens | 91,63 % (segun el autor) | Apache 2.0 | Hugging Face, `transformers` |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 tokens | no disponible en esta informacion | Apache 2.0 | Hugging Face, `transformers` |
| `textattack/bert-base-uncased-SST-2` | 110 M | 512 tokens | no disponible en esta informacion | no disponible en esta informacion | Hugging Face, `transformers` |

La comparativa se limita a modelos BERT de la misma familia; no se dispone de resultados de benchmarks de las alternativas en la informacion proporcionada, por lo que las cifras de SST-2 de los otros modelos no se pueden contrastar aqui.

## Limitaciones y advertencias

- Precision de 50,80 % en una tarea binaria: el modelo no supera el nivel de azar de forma significativa y no debe usarse para clasificacion de sentimiento real.
- Destilacion incompleta: la brecha de 40,83 puntos frente al profesor (91,63 % vs 50,80 %) indica que el protocolo de 185 pasos es insuficiente para transferir el comportamiento del profesor.
- Dependencia de codigo remoto: requiere `trust_remote_code=True` y ejecuta `modeling_neuralops_bert.py` del autor, lo que implica revisar el codigo antes de usarlo en entornos controlados.
- Dependencia del backbone: los pesos base se descargan de `bert-base-uncased` en tiempo de carga; sin acceso a ese repositorio el checkpoint no es funcional por si solo.
- Solo ingles: la model card declara unicamente `en`; no hay evidencia de comportamiento multilingue.
- Contexto no documentado: el autor no especifica la longitud de contexto efectiva con `svd_attention`; se asume la de BERT-Base (512 tokens) pero no esta confirmado.
- Sin datos de sesgos ni alucinacion: no se publican evaluaciones de sesgo, robustez ni calibracion mas alla de la entropia cruzada.
- Licencia MIT: permite uso comercial, pero el modelo base `bert-base-uncased` esta bajo Apache 2.0 y sus terminos siguen aplicando.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validacion externa ni resultados reproducidos por terceros.
- Fecha de creacion futura (2026-11-09) en los metadatos, lo que sugiere un artefacto experimental sin ciclo de mantenimiento establecido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-svd-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Dataset GLUE: https://huggingface.co/datasets/glue
- Paper de BERT (referencia del backbone): https://arxiv.org/abs/1810.04805
