# tahamajs/bert-fusion-attn-sst2

## Resumen

`tahamajs/bert-fusion-attn-sst2` es una variante del modelo `google-bert/bert-base-uncased` en la que las 12 capas de atencion multi-cabeza estandar han sido sustituidas por el mecanismo `fusion_attn` de la libreria NeuralOps. El autor, Taha Majlesi, lo publica como parte de un "Attention Zoo" de BERT con atencion subcuadratica, orientado a estudiar alternativas al mecanismo de atencion clasico mediante destilacion de conocimiento. El modelo se distribuye con licencia MIT y esta pensado para la tarea de `fill-mask` en ingles.

El modelo parte de los pesos de BERT-base (110 millones de parametros, 12 capas, 768 dimensiones ocultas) y se somete a un pipeline de destilacion en tres etapas (calibracion Ridge en forma cerrada, MSE/CKA sobre subespacio con backbone congelado y KD de logits con LR diferencial) sobre WikiText-2. Segun la model card, el proceso completo se ejecuta en 300 segundos sobre una RTX 3090, con 230 pasos y unos 39.823 tokens por segundo.

Su relevancia es fundamentalmente de investigacion: permite comparar el comportamiento de una atencion alternativa frente al BERT original con un coste de entrenamiento minimo. No obstante, los resultados reportados (perplejidad 0.00 y 91,63 % de acierto en tokens enmascarados) deben interpretarse con cautela, ya que una perplejidad exactamente cero es estadisticamente anomala y sugiere un posible fallo de evaluacion o sobreajuste al conjunto de validacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base) con atencion `fusion_attn` subcuadratica en las 12 capas |
| Parametros totales | 110 millones (heredados de bert-base-uncased; no confirmado explicitamente en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (BERT-base estandar soporta 512 tokens; no confirmado para esta variante) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0,5 GB; probablemente safetensors/PyTorch, no confirmado) |

## Arquitectura y entrenamiento

El modelo conserva la estructura de `bert-base-uncased` (12 capas de encoder, 768 dimensiones ocultas, 12 cabezas en la version original) pero reemplaza cada bloque de self-attention multi-cabeza por el mecanismo `fusion_attn` de NeuralOps. Se trata, por tanto, de un transformer encoder con atencion subcuadratica, disenado para reducir el coste computacional de la atencion respecto al producto escalar clasico. La model card no detalla la formulacion matematica concreta de `fusion_attn` ni su complejidad asintotica exacta.

El entrenamiento consiste en una destilacion de conocimiento desde el BERT-base original (teacher) hacia la variante con `fusion_attn` (student), usando WikiText-2 como dataset. El curriculum tiene tres etapas: Stage 0 con calibracion Ridge en forma cerrada, Stage 1 con MSE/CKA sobre un subespacio con backbone congelado y Stage 2 con KD de logits y learning rate diferencial. La duracion total reportada es de 300 segundos, 230 pasos y 13.512 MB de VRAM pico en una RTX 3090. No se especifica el numero de tokens de entrenamiento ni la composicion exacta del dataset mas alla de WikiText-2.

## Capacidades

- Generacion de texto limitada a la tarea de `fill-mask` (prediccion de tokens enmascarados), no generacion autoregresiva.
- Enmascarado de tokens (MLM) en ingles, heredado del preentrenamiento de BERT-base.
- Representaciones contextuales del ingles utilizables como encoder para tareas downstream (clasificacion, NER, QA extractiva) mediante fine-tuning.
- No soporta tool calling ni function calling de forma nativa.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles.
- No dispone de modo "thinking", vision ni audio.
- El mecanismo `fusion_attn` esta pensado para reducir el coste de atencion, aunque la model card no cuantifica la ganancia real de eficiencia en inferencia.

## Casos de uso

- Investigacion sobre mecanismos de atencion alternativos: el modelo sirve como banco de pruebas para comparar `fusion_attn` frente a la atencion estandar de BERT en tareas de MLM, con un coste de entrenamiento de minutos en una GPU consumer.
- Destilacion de conocimiento reproducible: el pipeline de tres etapas documentado permite replicar el experimento y estudiar la transferencia de representaciones entre arquitecturas de atencion distintas.
- Relleno de huecos en textos ingleses: uso directo via `pipeline("fill-mask")` para autocompletar o corregir frases en ingles en prototipos y demos.
- Extraccion de embeddings para clasificacion de texto en ingles: el encoder puede fine-tunearse para sentiment analysis, topic classification o NER en dominios acotados.
- Evaluacion de robustez de atencion subcuadratica: comparar la calidad de las representaciones frente al teacher en tareas de similaridad semantica o retrieval.
- Docencia y divulgacion: ejemplo didactico de sustitucion de un componente arquitectonico y destilacion en un modelo pequeno y bien conocido.

## Benchmarks y rendimiento

Datos reportados en la model card (evaluacion MLM pseudo-perplexity sobre WikiText-2, 15 % de tokens enmascarados, `seed=42`):

| Fase de evaluacion | MLM Perplexity | Masked Token Acc (%) | Delta vs baseline |
|---|---|---|---|
| Vanilla BERT Teacher (`bert-base-uncased`) | 6,84 | 68,42 % | Referencia |
| Stage 0 (Closed-Form Ridge Calibration) | 0,00 | 91,63 % | -6,84 |
| Stage 2 (Post-KD Distilled Model) | 0,00 | 91,63 % | -6,84 |

Telemetria de entrenamiento:

| Metrica | Valor |
|---|---|
| Hardware | NVIDIA RTX 3090 24 GB (Sharif HPC Cluster) |
| Duracion | 300,0 s (5,0 min) |
| Pasos | 230 |
| Throughput | 39.823,5 tokens/s |
| VRAM pico | 13.512 MB |

Advertencia: una perplejidad de 0,00 es estadisticamente implausible para un modelo de lenguaje y sugiere un posible error de calculo, fuga de datos o sobreajuste severo al conjunto de evaluacion. Los resultados deben considerarse no verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,5 GB de pesos mas overhead de activaciones (el repo ocupa 0,5 GB).
- VRAM estimada en FP16: aproximadamente 0,25 GB de pesos, holgadamente por debajo de cualquier GPU moderna.
- GPU recomendadas: cualquier GPU consumer reciente (RTX 3060, RTX 4090) es suficiente; tambien CPU para inferencia puntual.
- Cabe en GPU consumer: si, en practicamente todas las GPU con al menos 2 GB de VRAM.
- Opciones de despliegue: `transformers` con `pipeline("fill-mask")`; la carga via `neuralops.load_pretrained_bert` requiere la libreria NeuralOps. No se confirma soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput de inferencia: no disponibles en la informacion proporcionada (solo se reporta throughput de entrenamiento).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| `tahamajs/bert-fusion-attn-sst2` | ~110 M | no disponible (BERT-base: 512) | fill-mask (MLM) | MIT | Atencion `fusion_attn` subcuadratica, destilado de BERT-base |
| `google-bert/bert-base-uncased` | 110 M | 512 | fill-mask, encoder | Apache 2.0 | Teacher original, atencion estandar |
| `distilbert-base-uncased` | 66 M | 512 | fill-mask, encoder | Apache 2.0 | Destilado de BERT-base con la mitad de capas |
| `roberta-base` | 125 M | 512 | fill-mask, encoder | MIT | Entrenado con masking dinamico, mejor MLM que BERT-base |

No se dispone de comparaciones de rendimiento independientes entre `fusion_attn` y la atencion estandar mas alla de los datos del propio autor.

## Limitaciones y advertencias

- Los resultados de perplejidad 0,00 y 91,63 % de acierto son sospechosos y no han sido verificados de forma independiente; podrian reflejar un fallo metodologico en la evaluacion.
- El modelo solo soporta ingles; no hay capacidades multilingues.
- Esta limitado a la tarea de `fill-mask`; no es un modelo generativo autoregresivo ni un modelo de instrucciones.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- La model card no detalla la formulacion de `fusion_attn` ni sus garantias de eficiencia; el beneficio real frente a la atencion estandar es incierto.
- Riesgo de alucinacion y sesgos heredados de BERT-base y de WikiText-2 (sesgos de genero, dominio enciclopedico, vocabulario limitado).
- La dependencia de la libreria NeuralOps para la carga recomendada puede complicar la integracion en pipelines estandar; la carga via `transformers` requiere `trust_remote_code` por el tag `custom_code`.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso en produccion.
- Licencia MIT permite uso comercial, pero la ausencia de validacion independiente desaconseja su uso en produccion sin evaluacion propia.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/bert-fusion-attn-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset WikiText-2: https://huggingface.co/datasets/wikitext
