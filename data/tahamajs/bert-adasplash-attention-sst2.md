# tahamajs/bert-adasplash-attention-sst2

## Resumen

`tahamajs/bert-adasplash-attention-sst2` es una variante del modelo `bert-base-uncased` de Google en la que se han sustituido las doce capas de atencion multi-cabeza estandar por el mecanismo `adasplash_attention`, una atencion subcuadratica implementada en la libreria NeuralOps. El modelo lo desarrolla Taha Majlesi (usuario `tahamajs`) y se distribuye como parte de lo que el autor denomina "NeuralOps Pretrained BERT-131 Subquadratic Attention Zoo", un conjunto de variantes de BERT con distintos mecanismos de atencion eficiente.

El modelo se ha destilado sobre WikiText-2 mediante un pipeline de destilacion de conocimiento en tres etapas (calibracion Ridge en forma cerrada, MSE/CKA de subespacio con backbone congelado y KD de logits fusionado con LR diferencial) durante 300 segundos en una NVIDIA RTX 3090. La relevancia es fundamentalmente experimental: sirve para estudiar el impacto de mecanismos de atencion subcuadraticos en un transformer encoder clasico sin reentrenar desde cero, aunque el modelo es de noviembre de 2026 y cuenta con cero descargas y cero likes en el momento de redactar esta ficha.

La arquitectura subyacente es un transformer encoder de 12 capas y 110 millones de parametros (BERT-base), con contexto nativo de 512 tokens y tarea `fill-mask`. El repositorio ocupa 0,5 GB y la licencia es MIT. No debe confundirse el sufijo `sst2` del nombre con un ajuste fino sobre SST-2: la model card no documenta ningun entrenamiento sobre ese dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base) con atencion `adasplash_attention` subcuadratica en las 12 capas |
| Parametros totales | Aproximadamente 110 millones (heredados de `bert-base-uncased`; no se especifica el recuento exacto tras el cambio de atencion) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (contexto nativo de BERT-base; no se documenta extension) |
| Tipos de cuantizacion | No disponible (no se documentan pesos GGUF, AWQ, GPTQ ni INT8) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | Pesos PyTorch (`pytorch` / `custom_code`); tamano del repo 0,5 GB. No se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased`: un transformer encoder de 12 capas, 768 dimensiones ocultas, 12 cabezas de atencion y vocabulario WordPiece de aproximadamente 30.000 tokens. La modificacion consiste en reemplazar la atencion multi-cabeza estandar (cuadratica en la longitud de secuencia) por `adasplash_attention`, un mecanismo de atencion subcuadratica de la libreria NeuralOps que combina aproximaciones tipo "splash" con adaptacion por cabezas. El autor no detalla la formulacion matematica concreta ni el ahorro computacional medido.

El entrenamiento es una destilacion de conocimiento sobre WikiText-2 en tres etapas: Stage 0 con calibracion Ridge en forma cerrada, Stage 1 con MSE/CKA de subespacio sobre backbone congelado y Stage 2 con KD de logits fusionado y learning rate diferencial. La ejecucion duro 300 segundos (202 pasos) en una RTX 3090 con un throughput declarado de 34.901 tokens/s y un pico de VRAM de 8.487 MB. No se documenta el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si hubo RLHF o DPO (no aplica en un modelo de enmascarado).

## Capacidades

- Relleno de mascaras (`fill-mask`): predice el token enmascarado en una secuencia en ingles, tarea nativa del pipeline declarado.
- Representaciones contextuales de tokens: al ser un encoder BERT, produce embeddings contextuales utilizables como backbone para clasificacion, NER o extraccion de caracteristicas.
- Atencion subcuadratica: el mecanismo `adasplash_attention` esta pensado para reducir el coste computacional de la atencion en secuencias largas, aunque el contexto efectivo sigue limitado a 512 tokens.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue: solo ingles.
- No se documenta modo "thinking", vision ni audio.

## Casos de uso

- Investigacion sobre atencion eficiente: comparar la calidad de `adasplash_attention` frente a la atencion estandar de BERT-base usando la misma tarea de enmascarado y el mismo dataset de evaluacion (WikiText-2).
- Prototipado de pipelines de `fill-mask`: usar el modelo como sustituto de BERT-base en tareas de autocompletado de texto en ingles con la API de `transformers`.
- Extraccion de caracteristicas para clasificacion de texto: congelar el encoder y entrenar una cabeza ligera sobre embeddings contextuales, aprovechando que la arquitectura base es compatible con herramientas de BERT.
- Benchmarking de destilacion: reproducir el pipeline de tres etapas de NeuralOps y medir el efecto de cada etapa sobre la perplejidad de enmascarado.
- Educacion y docencia: ilustrar como se sustituye un mecanismo de atencion en un transformer preentrenado sin reentrenar desde cero.
- Pruebas de integracion de la libreria NeuralOps: validar la carga de modelos con `custom_code` y la compatibilidad con la API de `neuralops.load_pretrained_bert`.

## Benchmarks y rendimiento

Los unicos datos publicados son de evaluacion de enmascarado determinista sobre WikiText-2 (15% de tokens enmascarados, `seed=42`), segun la model card:

| Fase de evaluacion | MLM Perplexity | Precision de token enmascarado (%) | Delta vs baseline |
|---|---:|---:|---:|
| BERT-base profesor (`bert-base-uncased`) | 6,84 | 68,42 | Referencia |
| Stage 0 (calibracion Ridge en forma cerrada) | 0,00 | 91,63 | -6,84 |
| Stage 2 (modelo destilado final) | 0,00 | 91,17 | -6,84 |

Advertencia: una perplejidad de 0,00 es estadisticamente implausible en un modelo de lenguaje y sugiere un error de calculo o de reporte en la evaluacion. La precision del 91% en tokens enmascarados es plausible pero no verificable de forma independiente. No se han publicado resultados de benchmarks estandar (MMLU, GLUE, SQuAD, HumanEval) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,5 GB de pesos mas activaciones; en FP16 alrededor de 0,25 GB. Cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor uso una RTX 3090 para la destilacion, pero la inferencia no requiere esa capacidad.
- Cabe en GPU consumer: si, en GTX 1060 6 GB, RTX 2060, RTX 3060, RTX 4090 y equivalentes. Tambien puede ejecutarse en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: la model card documenta la API de alto nivel de NeuralOps (`neuralops.load_pretrained_bert`) y el pipeline `fill-mask` de `transformers`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; al requerir `custom_code`, la carga en esos motores no es directa.
- Latencia y throughput: no se publican mediciones de inferencia. El unico dato de throughput es de entrenamiento (34.901 tokens/s en RTX 3090).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-adasplash-attention-sst2` | ~110 M | 512 | `fill-mask` | MIT | Hugging Face, requiere `custom_code` |
| `google-bert/bert-base-uncased` | 110 M | 512 | `fill-mask` | Apache 2.0 | Hugging Face, `transformers` estandar |
| `distilbert-base-uncased` | 66 M | 512 | `fill-mask` | Apache 2.0 | Hugging Face, `transformers` estandar |
| `google/electra-base-discriminator` | 110 M | 512 | Clasificacion / encoder | Apache 2.0 | Hugging Face, `transformers` estandar |

La comparativa de rendimiento no es posible con rigor: el unico dato disponible es la evaluacion propia del autor, que no es comparable con los benchmarks publicados de BERT-base y DistilBERT. En terminos de ecosistema, la dependencia de `custom_code` y de la libreria NeuralOps limita la portabilidad frente a las alternativas de Google y Hugging Face.

## Limitaciones y advertencias

- La perplejidad reportada de 0,00 es implausible y no debe tomarse como evidencia de calidad; conviene re-evaluar el modelo de forma independiente antes de cualquier uso.
- El modelo solo soporta ingles; no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- El contexto esta limitado a 512 tokens, por lo que la ventaja teorica de la atencion subcuadratica no se aprovecha en secuencias cortas.
- Al ser una destilacion de 5 minutos sobre WikiText-2, es probable que haya perdido capacidades del BERT-base original; no se documenta ninguna evaluacion en GLUE, SQuAD ni otras tareas downstream.
- Riesgo de alucinacion y sesgos: no evaluado. Al derivar de `bert-base-uncased`, hereda los sesgos de su corpus de preentrenamiento (BooksCorpus y Wikipedia en ingles).
- El nombre del repositorio incluye `sst2`, pero no hay evidencia de ajuste fino sobre SST-2; puede inducir a error.
- Requiere `trust_remote_code` o la libreria NeuralOps para cargar el modelo, lo que anade una dependencia externa y un riesgo de seguridad en produccion.
- Licencia MIT: permite uso comercial, pero el modelo base `bert-base-uncased` es Apache 2.0 y las condiciones de la libreria NeuralOps no se detallan en la model card.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-adasplash-attention-sst2
- Repositorio de la libreria NeuralOps: https://github.com/tahamajs/NeuralOps
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset de destilacion (WikiText-2): https://huggingface.co/datasets/wikitext
