# tahamajs/bert-delta-product-attention-sst2

## Resumen

`tahamajs/bert-delta-product-attention-sst2` es una variante de `google-bert/bert-base-uncased` en la que las 12 capas de self-attention multi-cabeza estándar han sido sustituidas por el mecanismo `delta_product_attention`, una atención subcuadrática implementada en la librería NeuralOps. El autor, Taha Majlesi (tahamajs), publica este checkpoint dentro de un "attention zoo" de BERT con mecanismos de atención alternativos, orientado a experimentación académica más que a uso en producción.

El modelo se ha destilado sobre WikiText-2 mediante un pipeline de destilación de conocimiento en tres etapas (calibración Ridge en forma cerrada, MSE/CKA de subespacio con backbone congelado y KD de logits con LR diferencial) ejecutado durante 300 segundos en una NVIDIA RTX 3090. La model card reporta telemetría de entrenamiento, pero los resultados de evaluación presentados son internamente inconsistentes (perplejidad de 0,00 y precisión por debajo del profesor), por lo que deben interpretarse con cautela.

Es relevante ahora como pieza de investigación sobre atención subcuadrática aplicada a transformers encoder-only, y como ejemplo de herramienta de sustitución de atención (NeuralOps) que permite cambiar el mecanismo de atención sin reentrenar desde cero. No obstante, su utilidad práctica es limitada: cero descargas, cero likes, licencia MIT y un pipeline `fill-mask` sobre un checkpoint con métricas dudosas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (BERT-base) con atención `delta_product_attention` subcuadrática en las 12 capas |
| Parametros totales | no disponible (hereda la topología de `bert-base-uncased`, ~110 M, no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (BERT-base estándar: 512 tokens; no confirmado para esta variante) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | no disponible (librería `neuralops`, `custom_code`; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` y reemplaza las 12 capas de atención multi-cabeza por `delta_product_attention`, un mecanismo de atención subcuadrática de la librería NeuralOps. El resto de la topología (embeddings, capas feed-forward, normalización, cabeza MLM) se mantiene. La model card no detalla la formulación matemática del mecanismo ni su complejidad asintótica exacta, más allá de etiquetarlo como subcuadrático.

El entrenamiento consiste en destilación de conocimiento sobre WikiText-2 con un currículo de tres etapas: Stage 0 con calibración Ridge en forma cerrada, Stage 1 con MSE/CKA de subespacio sobre backbone congelado y Stage 2 con KD de logits fusionada y learning rate diferencial. Se ejecutaron 10 pasos en 300 segundos en una RTX 3090 (24 GB), con un throughput de 1178,4 tokens/s y un pico de VRAM de 13512 MB. La model card no indica el número de tokens de entrenamiento ni la composición exacta del dataset más allá de WikiText-2.

## Capacidades

- Relleno de máscaras (`fill-mask`): es la tarea declarada en el pipeline; el modelo predice tokens enmascarados en texto en inglés.
- Comprensión de lenguaje natural en inglés a nivel de representación (encoder BERT), potencialmente reutilizable para clasificación, NER o QA extractiva mediante fine-tuning, aunque no se han publicado evaluaciones de estas tareas.
- Atención subcuadrática: el interés técnico es evaluar si el mecanismo `delta_product_attention` preserva la calidad del profesor con menor coste computacional en secuencias largas.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidad multilingüe: no; solo inglés.

## Casos de uso

- Investigación sobre atención subcuadrática: usar el checkpoint como referencia para comparar `delta_product_attention` frente a atención estándar en tareas de MLM sobre WikiText-2, midiendo perplejidad y precisión de tokens enmascarados con la misma semilla.
- Sustitución de atención en pipelines NeuralOps: servir de ejemplo reproducible de cómo cambiar el mecanismo de atención de un BERT-base sin reentrenar desde cero, útil para quien quiera replicar el pipeline de destilación en tres etapas.
- Prototipado de `fill-mask` en inglés: rellenar huecos en frases para demos o pruebas de integración con la API de NeuralOps, siempre que se valide la calidad de las predicciones antes de usarlas.
- Estudio de destilación de conocimiento: analizar el efecto de la calibración Ridge en forma cerrada y del KD de logits sobre un backbone congelado, comparando la telemetría publicada con réplicas propias.
- Benchmarking de eficiencia de atención: medir latencia y memoria en secuencias largas (hasta el límite que soporte la implementación) frente a `bert-base-uncased` para cuantificar la ganancia subcuadrática.
- Docencia y experimentación académica: material de partida para cursos o trabajos sobre mecanismos de atención alternativos, dada su licencia MIT y su carácter de "attention zoo".

## Benchmarks y rendimiento

Resultados reportados en la model card (MLM pseudo-perplejidad determinista sobre WikiText-2, 15 % de tokens enmascarados, `seed=42`):

| Fase de evaluacion | MLM PPL | Precision tokens enmascarados (%) | Delta vs baseline |
|---|---|---|---|
| BERT-base profesor (`bert-base-uncased`) | 6,84 | 68,42 | referencia |
| Stage 0 (calibracion Ridge en forma cerrada) | 0,00 | 49,08 | -6,84 |
| Stage 2 (modelo destilado) | 0,00 | 49,08 | -6,84 |

Advertencia: una perplejidad de 0,00 es matemáticamente implausible para un modelo de lenguaje y la precisión de tokens enmascarados (49,08 %) es inferior a la del profesor (68,42 %). Los datos publicados no son fiables y no se han publicado resultados en benchmarks estándar como MMLU, GLUE, SQuAD o HumanEval.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por la topología de BERT-base, una inferencia en fp32 requiere del orden de 0,5 GB y en fp16 alrededor de 0,3 GB, aunque no está confirmado para esta variante.
- GPU recomendadas: la model card solo documenta entrenamiento en NVIDIA RTX 3090 (24 GB); para inferencia cualquier GPU consumer con más de 2 GB de VRAM debería bastar, aunque no se ha verificado.
- Cabe en GPU consumer: previsiblemente sí (RTX 3060, RTX 4060, RTX 4090), sujeto a que la implementación de `delta_product_attention` en NeuralOps sea compatible con el hardware.
- Opciones de despliegue: la vía documentada es la API de NeuralOps (`neuralops.load_pretrained_bert`) o el pipeline `fill-mask` de Transformers con `trust_remote_code`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 1178,4 tokens/s y 13512 MB de pico de VRAM durante la destilación en RTX 3090; no se reportan métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-delta-product-attention-sst2` | ~110 M (heredado, no confirmado) | no disponible | `fill-mask` | MIT | Hugging Face, 0 descargas |
| `google-bert/bert-base-uncased` | 110 M | 512 | `fill-mask` | Apache 2.0 | Hugging Face, ampliamente usado |
| `distilbert-base-uncased` | 66 M | 512 | `fill-mask` | Apache 2.0 | Hugging Face, ampliamente usado |
| `google/electra-base-discriminator` | 110 M | 512 | encoder / clasificación | Apache 2.0 | Hugging Face |

La comparación es cualitativa: no hay datos de benchmarks fiables para esta variante y las alternativas tienen evaluaciones públicas extensas que no se reproducen aquí.

## Limitaciones y advertencias

- Métricas de evaluación no fiables: perplejidad de 0,00 y precisión por debajo del profesor; no usar los números de la model card como evidencia de calidad.
- Solo inglés; no soporta otros idiomas.
- Riesgo de alucinación y predicciones de baja calidad en `fill-mask` dado el débil resultado reportado (49,08 % de precisión frente al 68,42 % del profesor).
- Requiere `trust_remote_code` y la librería NeuralOps; no es un checkpoint estándar de Transformers y puede romper herramientas de despliegue habituales.
- Licencia MIT: permite uso comercial, pero el modelo base `bert-base-uncased` está bajo Apache 2.0, por lo que conviene revisar la compatibilidad de ambas licencias en producción.
- Cero descargas y cero likes: no hay validación comunitaria ni issues documentados.
- No se documentan sesgos, composición del dataset de destilación ni evaluación de robustez.
- Contexto máximo no confirmado para esta variante; asumir 512 tokens solo como referencia del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-delta-product-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
