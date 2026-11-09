# tahamajs/bert-nexus-sst2

## Resumen

`tahamajs/bert-nexus-sst2` es una variante de `google-bert/bert-base-uncased` en la que las 12 capas de atencion multi-cabeza estandar han sido sustituidas por el mecanismo `nexus`, un esquema de atencion subcuadratica implementado en la libreria NeuralOps. El modelo se ha destilado sobre WikiText-2 mediante un pipeline de destilacion de conocimiento en tres etapas (calibracion Ridge en forma cerrada, MSE/CKA de subespacio con backbone congelado y KD de logits fusionado con LR diferencial) ejecutado durante 300 segundos en una NVIDIA RTX 3090.

El modelo conserva la arquitectura base de BERT-base (encoder transformer de 12 capas, 110 millones de parametros, contexto de 512 tokens) y mantiene la tarea de `fill-mask` como pipeline principal. Su relevancia radica en que demuestra la viabilidad de sustituir atencion cuadratica por atencion subcuadratica en un modelo preentrenado sin reentrenar desde cero, mediante destilacion de conocimiento acelerada por GPU.

La ficha tecnica del autor reporta una perplejidad MLM de 0.00 en el modelo destilado, un valor que debe interpretarse con cautela (ver seccion de limitaciones). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base con atencion `nexus` subcuadratica en las 12 capas |
| Parametros totales | 110 millones (heredados de `bert-base-uncased`; no se especifica recuento exacto tras la sustitucion) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de BERT-base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | no disponible (libreria `neuralops`, con `custom_code`) |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased`, un encoder transformer de 12 capas con 110 millones de parametros, y reemplaza integramente el bloque de self-attention multi-cabeza por el mecanismo `nexus`, descrito por el autor como atencion subcuadratica. El resto del backbone (embeddings, feed-forward, normalizacion y cabecera MLM) se mantiene. La sustitucion se acompana de un proceso de destilacion de conocimiento desde el profesor original (`bert-base-uncased`).

El entrenamiento sigue el pipeline de destilacion en tres etapas de NeuralOps: Stage 0 aplica una calibracion Ridge en forma cerrada; Stage 1 optimiza una perdida MSE/CKA de subespacio con el backbone congelado; Stage 2 realiza KD fusionado de logits con learning rate diferencial. Se ejecuto sobre WikiText-2 durante 300 segundos (180 pasos) en una RTX 3090 de 24 GB, con un throughput de 30 798 tokens/s y un pico de VRAM de 23 021 MB. El autor no detalla el numero total de tokens de entrenamiento ni la composicion exacta del curriculum mas alla de las tres etapas citadas.

## Capacidades

- Relleno de mascaras (`fill-mask`) en ingles, pipeline principal declarado.
- Modelado de lenguaje enmascarado (MLM) sobre texto en ingles.
- Extraccion de representaciones contextuales de tokens (uso como encoder).
- Inferencia con atencion subcuadratica, lo que en teoria reduce el coste computacional frente a atencion cuadratica en secuencias largas (hasta 512 tokens).
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declara capacidad multilingue: solo ingles.
- No se declara thinking mode, vision ni audio.

## Casos de uso

- Relleno de mascaras en ingles para tareas de completado de texto y prototipado rapido: el pipeline `fill-mask` permite integrar el modelo en notebooks o scripts con una sola linea mediante `transformers.pipeline`.
- Extraccion de embeddings contextuales para clasificacion de texto: al conservar el backbone de BERT-base, puede usarse como encoder congelado en tareas downstream (sentimiento, topic classification) sustituyendo la cabecera MLM.
- Investigacion sobre atencion subcuadratica: sirve como banco de pruebas para comparar el mecanismo `nexus` frente a atencion estandar en tareas de MLM con la misma inicializacion y dataset.
- Destilacion acelerada como referencia metodologica: el pipeline de tres etapas y las metricas de telemetria (throughput, VRAM, duracion) son reproducibles para experimentos de KD en GPUs de consumo.
- Evaluacion de robustez de modelos destilados: util para estudiar el efecto de la sustitucion de atencion en la calibracion de probabilidades y la perplejidad MLM.
- Docencia y experimentacion en entornos con recursos limitados: cabe en una unica GPU de consumo (RTX 3090) y el entrenamiento completo cabe en 5 minutos, lo que facilita iteraciones rapidas.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card, evaluados con MLM Pseudo-Perplexity determinista sobre WikiText-2 (15% de tokens enmascarados, `seed=42`):

| Fase de evaluacion | MLM PPL | Precision en tokens enmascarados (%) | Delta vs baseline |
|---|---|---|---|
| BERT profesor (`bert-base-uncased`) | 6.84 | 68.42 | referencia |
| Stage 0 (calibracion Ridge en forma cerrada) | 0.00 | 48.97 | -6.84 |
| Stage 2 (modelo destilado final) | 0.00 | 50.11 | -6.84 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, GLUE) en la informacion disponible. La perplejidad de 0.00 debe interpretarse con cautela: es incompatible con una distribucion de probabilidad valida y sugiere un artefacto de calculo o de implementacion de la metrica, no un rendimiento real de 0.00.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano (110 M parametros) y la arquitectura BERT-base, cabria esperar un consumo en el rango de 1 a 3 GB en FP32 y menos en FP16, aunque el autor no lo especifica.
- GPU recomendadas: el autor solo documenta entrenamiento en NVIDIA RTX 3090 (24 GB). No se detallan GPU recomendadas para inferencia.
- Cabe en GPU de consumo: si, por tamano (110 M parametros), aunque no se confirma compatibilidad con cuantizacion ni con backends alternativos.
- Opciones de despliegue: `transformers` (pipeline `fill-mask`) y la libreria `neuralops` (`load_pretrained_bert`). No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI; el tag `custom_code` sugiere que la carga con `transformers` puede requerir `trust_remote_code=True`.
- Latencia y throughput: el autor reporta 30 798.1 tokens/s durante el entrenamiento en RTX 3090, pero no se publican metricas de latencia o throughput en inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Mecanismo de atencion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-nexus-sst2` | 110 M (heredados) | 512 | `nexus` (subcuadratica) | MIT | Hugging Face |
| `google-bert/bert-base-uncased` | 110 M | 512 | Multi-head self-attention estandar | Apache 2.0 | Hugging Face, ampliamente desplegado |
| `distilbert-base-uncased` | 66 M | 512 | Multi-head self-attention estandar | Apache 2.0 | Hugging Face, ampliamente desplegado |

No se dispone de datos de rendimiento comparables en benchmarks estandar para `bert-nexus-sst2`, por lo que la comparativa se limita a parametros, contexto, licencia y disponibilidad. El modelo destilado de DistilBERT se incluye como referencia de tamano y licencia, no como equivalente funcional.

## Limitaciones y advertencias

- La perplejidad MLM reportada de 0.00 es estadisticamente implausible y sugiere un error en el calculo de la metrica o en la implementacion del pipeline de evaluacion; no debe tomarse como indicador de calidad.
- La precision en tokens enmascarados del modelo destilado (50.11%) es inferior a la del profesor (68.42%), lo que indica una perdida sustancial de capacidad predictiva tras la sustitucion de atencion.
- Solo soporta ingles; no se declara cobertura multilingue.
- Contexto limitado a 512 tokens, heredado de BERT-base.
- El modelo usa `custom_code` y la libreria `neuralops`; la carga con `transformers` puede requerir `trust_remote_code=True` y no esta garantizada la compatibilidad con backends de inferencia alternativos.
- No se han publicado evaluaciones en benchmarks estandar (GLUE, SQuAD, etc.), por lo que el rendimiento en tareas downstream es desconocido.
- Riesgo de alucinacion y sesgos: no evaluado por el autor; al derivar de `bert-base-uncased`, hereda los sesgos del corpus original (Wikipedia en ingles).
- La licencia MIT permite uso comercial, pero al derivar de `bert-base-uncased` (Apache 2.0) conviene verificar la compatibilidad de atribuciones.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni validacion independiente.
- El nombre del repositorio incluye `sst2`, pero la model card no documenta evaluacion en SST-2; no debe asumirse un fine-tuning especifico en esa tarea.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-nexus-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
