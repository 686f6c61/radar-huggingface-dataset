# tahamajs/bert-adaptive-svd-attention-sst2

## Resumen

`tahamajs/bert-adaptive-svd-attention-sst2` es una variante de `google-bert/bert-base-uncased` en la que las 12 capas de atencion multi-cabeza estandar han sido sustituidas por el mecanismo `adaptive_svd_attention` de la libreria NeuralOps. El autor, Taha Majlesi (tahamajs), publica este checkpoint dentro de un "Attention Zoo" de BERT con mecanismos de atencion subcuadraticos, orientado a experimentacion con alternativas eficientes a la atencion cuadratica clasica.

El modelo se ha destilado sobre WikiText-2 mediante un pipeline de destilacion de conocimiento en tres etapas (calibracion ridge en forma cerrada, MSE/CKA de subespacio con backbone congelado y KD de logits fusionada con LR diferencial) durante 300 segundos en una NVIDIA RTX 3090. Aunque la etiqueta de pipeline es `fill-mask`, el nombre del checkpoint hace referencia a SST-2, lo que sugiere un ajuste posterior para clasificacion de sentimiento, si bien la model card no documenta ese paso.

Su relevancia es fundamentalmente experimental: permite evaluar el impacto de sustituir la atencion estandar por una aproximacion SVD adaptativa en un transformer encoder pequeno, con un coste de entrenamiento muy bajo y licencia MIT. No obstante, los resultados reportados (perplejidad de 0.00) son anomales y deben interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base) con atencion `adaptive_svd_attention` en las 12 capas |
| Parametros totales | no disponible (heredados de `bert-base-uncased`, ~110 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la de `bert-base-uncased` es 512 tokens, sin confirmar en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0.4 GB, libreria `neuralops`, `custom_code`) |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` y reemplaza las 12 capas de self-attention multi-cabeza por el mecanismo `adaptive_svd_attention` de NeuralOps, una atencion subcuadratica basada en descomposicion en valores singulares adaptativa. El backbone mantiene la estructura encoder de BERT; el cambio afecta unicamente al modulo de atencion, lo que permite comparar directamente contra el profesor original.

El entrenamiento sigue un curriculum de destilacion en tres etapas: Stage 0, calibracion ridge en forma cerrada; Stage 1, MSE/CKA de subespacio con backbone congelado; y Stage 2, KD de logits fusionada con learning rate diferencial. Se ejecuto durante 300 segundos (121 pasos) en una RTX 3090, con un throughput de 18 061,7 tokens/s y un pico de VRAM de 7422 MB. El dataset de destilacion es WikiText-2. No se documenta el uso de RLHF ni DPO, ni el numero total de tokens procesados.

## Capacidades

- Relleno de mascaras (`fill-mask`) en ingles, segun la pipeline declarada.
- Representaciones contextuales de frases para tareas encoder downstream (clasificacion, NER, QA extractiva), al conservar la estructura de BERT-base.
- Atencion subcuadratica mediante `adaptive_svd_attention`, orientada a reducir el coste computacional frente a la atencion cuadratica.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles.
- No se documentan modos especiales (thinking, vision, audio).

## Casos de uso

- Experimentacion academica con mecanismos de atencion eficientes: permite comparar `adaptive_svd_attention` contra la atencion estandar de BERT-base en la misma tarea y dataset, aislando el efecto del cambio arquitectonico.
- Relleno de mascaras en ingles para prototipos: uso directo con `pipeline("fill-mask")` para validar el comportamiento del modelo en tareas MLM sencillas.
- Extraccion de embeddings para clasificacion de texto: al mantener el backbone de BERT-base, puede servir como encoder en pipelines de clasificacion, aunque requiere validacion previa por los resultados anomalos reportados.
- Investigacion en destilacion de conocimiento: el pipeline de tres etapas documentado (ridge, CKA, KD de logits) es replicable y sirve como referencia metodologica para destilar variantes de atencion.
- Benchmarking de mecanismos subcuadraticos: util como punto de comparacion en estudios sobre atencion lineal, SVD o aproximaciones de bajo rango en encoders pequenos.
- Docencia y formacion: ejemplo didactico de sustitucion modular de atencion en un transformer preentrenado con coste de entrenamiento minimo (5 minutos en una RTX 3090).

## Benchmarks y rendimiento

Resultados reportados en la model card sobre WikiText-2 con MLM pseudo-perplejidad determinista (15% de tokens enmascarados, `seed=42`):

| Fase de evaluacion | MLM PPL | Precision en tokens enmascarados (%) | Delta vs baseline |
|---|---|---|---|
| Vanilla BERT Teacher (`bert-base-uncased`) | 6.84 | 68.42 | Referencia |
| Stage 0 (calibracion ridge en forma cerrada) | 0.00 | 51.03 | -6.84 |
| Stage 2 (modelo destilado post-KD) | 0.00 | 82.45 | -6.84 |

Advertencia: una perplejidad de 0.00 es matematicamente anomala y sugiere un fallo en el calculo de la metrica (por ejemplo, fuga de informacion en la mascara o un error de evaluacion). La precision del 82,45% en tokens enmascarados es plausible, pero no se acompana de resultados en benchmarks estandar como MMLU, GLUE o SST-2, pese al nombre del checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repo (0.4 GB) y el backbone BERT-base, cabria esperar un consumo en FP32 de aproximadamente 0.5-1 GB, aunque no esta confirmado.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior) deberia ser suficiente para inferencia de un encoder de ~110 M de parametros; el entrenamiento se realizo en una RTX 3090.
- Cabe en GPU consumer: si, previsiblemente en la mayoria de GPUs con 4 GB o mas de VRAM.
- Opciones de despliegue: `neuralops` (API de alto nivel) y `transformers` con `pipeline("fill-mask")` y `trust_remote_code=True` por el uso de `custom_code`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en entrenamiento se reportan 18 061,7 tokens/s en una RTX 3090; no se publican cifras de latencia en inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Atencion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-adaptive-svd-attention-sst2` | ~110 M (heredados) | no disponible | `adaptive_svd_attention` | MIT | Hugging Face, libreria `neuralops` |
| `google-bert/bert-base-uncased` | 110 M | 512 | Multi-head estandar | Apache 2.0 | Hugging Face, transformers |
| `distilbert-base-uncased` | 66 M | 512 | Multi-head estandar | Apache 2.0 | Hugging Face, transformers |

La comparativa se limita a encoders BERT de tamano similar; no se dispone de datos de rendimiento comparables en benchmarks estandar para el modelo evaluado, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- Los resultados de perplejidad reportados (0.00) son incoherentes y apuntan a un posible error de evaluacion; no deben tomarse como evidencia de rendimiento superior al profesor.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- Solo soporta ingles; no hay capacidades multilingues documentadas.
- No se documentan sesgos conocidos, pero al derivar de `bert-base-uncased` y WikiText-2 hereda los sesgos de esos datos.
- Riesgo de alucinacion en tareas generativas: al ser un encoder MLM, no esta disenado para generacion abierta.
- La licencia MIT permite uso comercial, pero la ausencia de evaluacion solida desaconseja su uso en produccion sin validacion previa.
- Requiere `trust_remote_code=True` por el uso de `custom_code` y la libreria `neuralops`, lo que implica ejecutar codigo del autor.
- El nombre del checkpoint referencia SST-2, pero la model card no documenta ajuste ni metricas en ese dataset; existe ambiguedad sobre la tarea real para la que fue entrenado.
- El contexto maximo no esta confirmado en la model card; no debe asumirse mas alla de los 512 tokens de BERT-base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-adaptive-svd-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset WikiText-2: https://huggingface.co/datasets/wikitext
