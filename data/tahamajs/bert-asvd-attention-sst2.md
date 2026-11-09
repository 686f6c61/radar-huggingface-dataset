# tahamajs/bert-asvd-attention-sst2

## Resumen

`bert-asvd-attention-sst2` es una variante de `google-bert/bert-base-uncased` en la que las doce capas de atencion multi-cabeza estandar se han sustituido por el mecanismo `asvd_attention` de la libreria NeuralOps. El modelo lo publica Taha Majlesi (usuario `tahamajs`) como parte de un "attention zoo" de BERT con mecanismos de atencion subcuadraticos, orientado a experimentacion con alternativas eficientes a la atencion cuadratica clasica. La arquitectura subyacente sigue siendo un transformer encoder de tipo BERT-Base, con unos 110 millones de parametros y una ventana de contexto de 512 tokens, aunque el autor no detalla en la model card el numero exacto de parametros ni la formulacion matematica de `asvd_attention`.

El modelo se ha destilado sobre WikiText-2 mediante un pipeline de destilacion de conocimiento en tres etapas (calibracion Ridge en forma cerrada, MSE/CKA de subespacio con backbone congelado y KD de logits fusionada con LR diferencial), ejecutado durante 300 segundos en una NVIDIA RTX 3090. La tarea declarada es `fill-mask` (masked language modeling) y el unico idioma soportado es el ingles. Su relevancia es fundamentalmente experimental: sirve para estudiar el impacto de mecanismos de atencion alternativos en un backbone BERT conocido, no como modelo de produccion generalista.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card incluye metricas internas (MLM-PPL y accuracy con enmascaramiento determinista) que deben interpretarse con cautela: un valor de perplejidad de 0.00 es atipico y sugiere una fuga de informacion o un problema en el protocolo de evaluacion, por lo que no se debe tomar como indicador de calidad real del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT-Base con atencion `asvd_attention` (subcuadratica) en las 12 capas |
| Parametros totales | no disponible (base `bert-base-uncased`, ~110 M segun el modelo original; el autor no lo especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible de forma explicita; heredada de BERT-Base (512 tokens) por el modelo base |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de 0.5 GB, libreria `neuralops`, con `custom_code`) |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` y reemplaza las doce capas de self-attention multi-cabeza por el mecanismo `asvd_attention` de NeuralOps. La model card no documenta la formulacion concreta de `asvd_attention` (por ejemplo, si es una aproximacion de bajo rango, una descomposicion tipo SVD o una variante lineal), por lo que no es posible detallar su complejidad asintotica ni su numero de parametros exacto. El resto de la arquitectura (embeddings, feed-forward, normalizacion, cabecera MLM) se mantiene compatible con BERT-Base.

El entrenamiento consiste en una destilacion de conocimiento sobre WikiText-2 en tres etapas: Stage 0, calibracion Ridge en forma cerrada; Stage 1, MSE/CKA de subespacio con backbone congelado; y Stage 2, KD de logits fusionada con learning rate diferencial. Se completaron 200 pasos en 300 segundos en una RTX 3090, con un throughput de 32.633,1 tokens/s y un pico de VRAM de 8.487 MB. No se documenta el numero total de tokens de entrenamiento, la composicion exacta del dataset mas alla de WikiText-2, ni si hubo RLHF o DPO (no aplica en un modelo MLM).

## Capacidades

- Relleno de mascaras (masked language modeling) en ingles, tarea principal declarada (`fill-mask`).
- Extraccion de representaciones contextuales de tokens, al conservar el backbone BERT-Base.
- Aprovechamiento de un mecanismo de atencion subcuadratico (`asvd_attention`) que, segun el autor, reduce el coste computacional frente a la atencion cuadratica clasica.
- Compatibilidad con la API de alto nivel de NeuralOps (`neuralops.load_pretrained_bert`) y con el pipeline `fill-mask` de Transformers.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo "thinking".
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Experimentacion academica con mecanismos de atencion alternativos: sirve como punto de comparacion directo contra `bert-base-uncased` para medir el efecto de `asvd_attention` en tareas de MLM sobre WikiText-2.
- Relleno de huecos en textos ingleses: uso mediante `pipeline("fill-mask")` para autocompletar palabras enmascaradas en frases cortas, con la ventana de 512 tokens heredada de BERT.
- Generacion de embeddings para clasificacion de texto en ingles: el backbone BERT-Base permite extraer representaciones y anadir una cabeza de clasificacion para tareas como analisis de sentimiento (el sufijo `sst2` del nombre sugiere este proposito, aunque la model card no lo confirma).
- Investigacion en destilacion de conocimiento: el pipeline de tres etapas documentado por el autor puede reproducirse y analizarse como referencia metodologica.
- Pruebas de integracion con la libreria NeuralOps: util para validar el flujo `neuralops.load_pretrained_bert` y el registro `attention-zoo` en entornos de desarrollo.
- Benchmarking de eficiencia de atencion: comparar throughput y VRAM entre este modelo y BERT-Base estandar en la misma GPU (RTX 3090 u otra) para evaluar el ahorro del mecanismo subcuadratico.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son metricas internas de MLM pseudo-perplejidad sobre WikiText-2 (15% de enmascaramiento, `seed=42`):

| Fase de evaluacion | MLM Perplexity | Masked Token Acc (%) | Delta vs baseline |
|---|---|---|---|
| BERT-Base teacher (`bert-base-uncased`) | 6,84 | 68,42% | referencia |
| Stage 0 (calibracion Ridge en forma cerrada) | 0,00 | 82,80% | -6,84 |
| Stage 2 (modelo destilado) | 0,00 | 91,28% | -6,84 |

No se han publicado resultados de benchmarks estandar (MMLU, GLUE, SST-2, SQuAD) en la informacion disponible. Los valores de perplejidad de 0,00 son anomalos y no deben interpretarse como rendimiento real sin una evaluacion independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el entrenamiento uso 8.487 MB de pico en una RTX 3090. Para inferencia en FP32 con ~110 M de parametros se puede estimar en torno a 0,5-1 GB, pero es una estimacion, no un dato del autor.
- GPU recomendadas: el autor solo documenta la RTX 3090 (24 GB) para el entrenamiento; para inferencia cabe en cualquier GPU consumer con al menos 2-4 GB de VRAM.
- Cabe en GPU consumer: si, previsiblemente en GTX 1060 6 GB, RTX 2060, RTX 3060, RTX 4090 y similares, aunque no hay datos oficiales de inferencia.
- Opciones de despliegue: pipeline `fill-mask` de Transformers y API de NeuralOps; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 32.633,1 tokens/s en entrenamiento con RTX 3090; no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-asvd-attention-sst2` | ~110 M (heredado, no confirmado) | 512 (heredado) | fill-mask | MIT | Hugging Face, 0 descargas |
| `google-bert/bert-base-uncased` | ~110 M | 512 | fill-mask | Apache 2.0 | Hugging Face, ampliamente usado |
| `distilbert-base-uncased` | ~66 M | 512 | fill-mask | Apache 2.0 | Hugging Face, ampliamente usado |
| `roberta-base` | ~125 M | 512 | fill-mask | MIT | Hugging Face, ampliamente usado |

La comparacion de rendimiento con estas alternativas no esta disponible: el autor solo compara contra el teacher `bert-base-uncased` con metricas internas no estandarizadas.

## Limitaciones y advertencias

- Las metricas publicadas (PPL de 0,00) son sospechosas y no han sido validadas de forma independiente; no deben usarse para justificar decisiones de produccion.
- El modelo solo soporta ingles; no hay capacidades multilingues documentadas.
- La formulacion de `asvd_attention` no esta documentada en la model card, lo que dificulta evaluar su correccion teorica y su comportamiento fuera del conjunto de evaluacion.
- Riesgo de alucinacion y sesgos: no evaluado por el autor; al derivar de `bert-base-uncased`, hereda los sesgos del corpus original de BERT.
- Requiere la libreria `neuralops` y `custom_code`, lo que anade dependencias no estandar frente a un BERT clasico.
- El nombre del modelo incluye `sst2`, pero la model card no documenta evaluacion en SST-2; no se debe asumir rendimiento en esa tarea.
- Licencia MIT permite uso comercial, pero la ausencia de evaluacion independiente desaconseja su uso en produccion sin validacion previa.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso ni de mantenimiento por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-asvd-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
