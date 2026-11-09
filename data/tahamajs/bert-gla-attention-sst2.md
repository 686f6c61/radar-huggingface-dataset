# tahamajs/bert-gla-attention-sst2

## Resumen

`tahamajs/bert-gla-attention-sst2` es una variante experimental de `google-bert/bert-base-uncased` en la que las 12 capas de atencion multi-cabeza estandar se han sustituido por el mecanismo `gla_attention` (atención lineal/subcuadrática) de la libreria NeuralOps. El modelo lo publica Taha Majlesi (usuario `tahamajs`) como parte de un "Attention Zoo" de BERT con mecanismos de atencion alternativos, y se ha destilado sobre WikiText-2 mediante un pipeline de destilacion de conocimiento en tres etapas ejecutado en una unica NVIDIA RTX 3090.

El objetivo declarado es explorar sustituciones subcuadraticas de la atencion en arquitecturas BERT preentrenadas, manteniendo el tokenizador y el vocabulario originales de `bert-base-uncased` (30.522 tokens) y el cabezal de masked language modeling. La relevancia practica es limitada: se trata de un artefacto de investigacion con 0 descargas y 0 likes en el momento de la consulta, sin publicacion cientifica asociada, y con resultados de evaluacion que presentan inconsistencias graves (perplejidad de 0,00), lo que impide considerarlo un modelo listo para produccion.

El modelo se distribuye con licencia MIT, en formato PyTorch (repo de 0,5 GB), con `custom_code` y dependencia de la libreria `neuralops`. El nombre del repositorio incluye el sufijo `sst2`, aunque la model card no documenta ningun ajuste fino sobre el dataset SST-2; el unico dataset citado es WikiText-2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base con atencion `gla_attention` (subcuadratica) en las 12 capas |
| Parametros totales | no disponible (hereda la base de `bert-base-uncased`, ~110 M, no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (BERT-base original: 512 tokens; no confirmado para esta variante) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`custom_code`), no se documentan safetensors ni GGUF |
| Libreria | `neuralops` |
| Modelo base | `google-bert/bert-base-uncased` |
| Dataset de destilacion | WikiText-2 |
| Tamano del repo | 0,5 GB |

## Arquitectura y entrenamiento

La arquitectura parte de `bert-base-uncased` (encoder transformer de 12 capas, 768 dimensiones ocultas, 12 cabezas de atencion en la version original) y reemplaza todas las capas de self-attention multi-head por `gla_attention`, un mecanismo de atencion subcuadratica de la libreria NeuralOps. No se especifican en la model card los detalles matematicos del mecanismo (formulacion de la atencion lineal, gestion de la decodificacion causal, complejidad exacta ni numero de cabezas resultante).

El entrenamiento consistio en destilacion de conocimiento sobre WikiText-2 con un curriculum de tres etapas: Stage 0 (calibracion ridge en forma cerrada), Stage 1 (MSE/CKA de subespacio con backbone congelado) y Stage 2 (KD de logits fusionado con learning rate diferencial). La ejecucion duro 300 segundos (5 minutos) en una RTX 3090 de 24 GB, con 21 pasos completados, throughput de 1.851,6 tokens/s y un pico de VRAM de 23.021 MB. No se documentan el numero total de tokens procesados, la composicion exacta del dataset ni si hubo RLHF/DPO (no aplicable en un modelo encoder de masked LM).

## Capacidades

- Relleno de mascaras (masked language modeling) en ingles: es la unica tarea declarada en el pipeline (`fill-mask`).
- Prediccion de tokens enmascarados con el vocabulario y tokenizador de `bert-base-uncased`.
- Representaciones contextuales de frases en ingles (uso potencial como encoder, no documentado por el autor).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue: solo ingles.
- No se documenta modo thinking, vision ni audio.
- No se documenta generacion de texto autoregresiva (es un encoder, no un decoder).

## Casos de uso

- Experimentacion academica con mecanismos de atencion subcuadraticos: el modelo sirve como punto de partida para comparar `gla_attention` frente a la atencion estandar de BERT en tareas de masked LM, siempre que se validen antes los resultados de evaluacion.
- Prototipado de relleno de huecos en ingles: uso mediante `pipeline("fill-mask")` para tareas de demostracion o docencia sobre como funciona un encoder BERT modificado.
- Extraccion de embeddings para clasificacion de texto en ingles: las representaciones del encoder podrian reutilizarse para tareas downstream, aunque el autor no aporta evidencia de calidad en dichas tareas.
- Investigacion sobre destilacion de conocimiento eficiente: el pipeline de tres etapas y la telemetria de entrenamiento (5 minutos, 21 pasos, 1.851 tokens/s) sirven como referencia metodologica para experimentos de KD de bajo coste.
- Pruebas de integracion con la libreria NeuralOps: validar la API `neuralops.load_pretrained_bert` y el flujo de carga de modelos con `custom_code` desde el Hub.
- Analisis de robustez de mecanismos de atencion alternativos: estudiar como se degrada o preserva la calidad del masked LM al sustituir la atencion original por una variante lineal.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son de evaluacion con MLM-PPL determinista sobre WikiText-2 (15 % de tokens enmascarados, `seed=42`):

| Fase de evaluacion | MLM Perplexity | Precision en tokens enmascarados | Delta vs baseline |
|---|---:|---:|---:|
| BERT teacher (`bert-base-uncased`) | 6,84 | 68,42 % | referencia |
| Stage 0 (calibracion ridge en forma cerrada) | 0,00 | 47,48 % | -6,84 |
| Stage 2 (modelo destilado) | 0,00 | 49,89 % | -6,84 |

Advertencia: una perplejidad de 0,00 es matematicamente imposible en un modelo probabilistico con vocabulario de 30.522 tokens; estos resultados indican un fallo en la evaluacion o en el pipeline de calculo y no deben interpretarse como rendimiento real. La precision en tokens enmascarados del modelo destilado (49,89 %) es 18,53 puntos inferior a la del teacher (68,42 %). No se han publicado resultados de benchmarks estandar (MMLU, GLUE, SQuAD, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano del repo (0,5 GB) y la base BERT-base (~110 M de parametros), la inferencia en fp32 requeriria aproximadamente 0,5-1 GB de VRAM, y en fp16 alrededor de 0,3-0,5 GB (estimacion, no confirmada por el autor).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente por capacidad; el autor solo documenta entrenamiento en RTX 3090.
- Cabe en GPU consumer: si, con amplio margen, segun la estimacion anterior.
- Opciones de despliegue: la model card solo documenta la API de NeuralOps y el `pipeline` de Transformers; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (el formato `custom_code` complica el despliegue en runtimes que no carguen codigo remoto).
- Latencia y throughput: no se publican mediciones de inferencia; solo se documenta throughput de entrenamiento de 1.851,6 tokens/s en RTX 3090.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-gla-attention-sst2` | no disponible (~110 M estimado) | no disponible (512 en BERT-base) | fill-mask (en) | MIT | Hub, 0 descargas |
| `google-bert/bert-base-uncased` | ~110 M | 512 | fill-mask, encoder (en) | Apache 2.0 | Hub, ampliamente usado |
| `distilbert-base-uncased` | ~66 M | 512 | fill-mask, encoder (en) | Apache 2.0 | Hub, ampliamente usado |
| `roberta-base` | ~125 M | 512 | fill-mask, encoder (en) | MIT | Hub, ampliamente usado |

Frente a estas alternativas, el modelo de `tahamajs` no aporta evidencia de calidad superior (sus metricas publicadas son inconsistentes y su precision en tokens enmascarados es inferior a la del propio BERT-base), carece de adopcion (0 descargas) y depende de una libreria no estandar. Para uso real en ingles, `bert-base-uncased`, `distilbert-base-uncased` o `roberta-base` son opciones mas seguras y mejor documentadas.

## Limitaciones y advertencias

- Resultados de evaluacion no fiables: la perplejidad de 0,00 es imposible y sugiere un error en el calculo del MLM-PPL; no se puede afirmar que el modelo funcione correctamente.
- Caida de precision: 49,89 % frente al 68,42 % del teacher en tokens enmascarados, una degradacion de 18,53 puntos.
- Solo ingles: no se documenta soporte de otros idiomas.
- Sesgos: no evaluados por el autor; al derivar de `bert-base-uncased` y WikiText-2, hereda los sesgos de esos datos (Wikipedia en ingles).
- Riesgo de alucinacion: no aplica en sentido generativo estricto (es un encoder de masked LM), pero las predicciones de tokens pueden ser incorrectas sin senal de calibracion fiable.
- Restricciones de licencia: MIT permite uso comercial, pero la dependencia de `custom_code` y de la libreria NeuralOps implica cargar codigo remoto; auditar antes de desplegar.
- Nombre enganoso: el sufijo `sst2` sugiere un ajuste sobre SST-2 que no aparece documentado en la model card.
- Mantenimiento incierto: 0 descargas y 0 likes; sin paper ni validacion externa conocida.
- Despliegue limitado: el formato `custom_code` puede no ser compatible con runtimes de inferencia estandar sin trabajo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-gla-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
