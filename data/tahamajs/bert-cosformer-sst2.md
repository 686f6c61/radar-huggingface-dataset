# tahamajs/bert-cosformer-sst2

## Resumen

`tahamajs/bert-cosformer-sst2` es una variante de `google-bert/bert-base-uncased` en la que las doce capas de self-attention multi-cabeza estándar han sido sustituidas por el mecanismo `cosformer`, una atención subcuadrática lineal implementada en la librería NeuralOps. El autor es Taha Majlesi y el modelo forma parte de lo que denomina "BERT-131 Subquadratic Attention Zoo", un conjunto de variantes de BERT con distintos mecanismos de atención eficiente. El checkpoint se ha destilado sobre WikiText-2 mediante un pipeline de destilación de conocimiento en tres etapas (calibración Ridge en forma cerrada, MSE/CKA con backbone congelado y KD de logits fusionada con LR diferencial).

El modelo conserva la arquitectura base de BERT-base (encoder transformer de 12 capas, 768 dimensiones ocultas, 12 cabezas de atención, ~110 millones de parámetros) pero modifica el cómputo de atención para reducir la complejidad de O(n²) a O(n) respecto a la longitud de secuencia. La tarea declarada en el Hub es `fill-mask` (masked language modeling) y el idioma soportado es únicamente inglés. La licencia es MIT.

Su relevancia es fundamentalmente experimental: sirve como referencia para estudiar cómo afecta la sustitución de atención cuadrática por atención lineal a un modelo preentrenado ya existente, y como ejemplo del pipeline de destilación de NeuralOps. No es un modelo orientado a producción ni a tareas downstream específicas; el nombre del repositorio menciona SST-2, pero la model card solo documenta evaluación sobre WikiText-2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base) con atención lineal `cosformer` en las 12 capas |
| Parametros totales | ~110 millones (heredados de `bert-base-uncased`; no confirmado explícitamente en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de BERT-base; no reespecificado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch`); requiere `custom_code` de NeuralOps |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` y reemplaza las doce capas de Multi-Head Self-Attention por el mecanismo `cosformer`, una atención lineal que aproxima la softmax mediante una función de reweighting basada en coseno, lo que permite reducir el coste computacional de O(n²) a O(n) en la longitud de secuencia. El resto de componentes (embeddings, feed-forward, normalización, cabecera MLM) se mantienen. El modelo se distribuye con `custom_code`, por lo que requiere la librería NeuralOps para cargarse correctamente.

El entrenamiento consistió en un proceso de destilación de conocimiento sobre WikiText-2 ejecutado en una NVIDIA RTX 3090 (24 GB) durante 300 segundos (144 pasos, 24 617,9 tokens/s, 13 512 MB de VRAM pico). El curriculum consta de tres etapas: Stage 0 (calibración Ridge en forma cerrada), Stage 1 (MSE/CKA de subespacio con backbone congelado) y Stage 2 (KD de logits fusionada con learning rate diferencial). No se documentan el número total de tokens de entrenamiento ni la composición completa del dataset más allá de WikiText-2.

## Capacidades

- Relleno de máscaras (masked language modeling) en inglés, tarea principal declarada (`fill-mask`).
- Extracción de representaciones contextuales de tokens, al conservar la estructura de encoder de BERT.
- Aprendizaje de dependencias de largo alcance con coste lineal gracias a la atención `cosformer`.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades de generación de texto libre, código, matemáticas, visión ni audio.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Investigación sobre atención eficiente: comparar el comportamiento de `cosformer` frente a atención cuadrática estándar en un mismo backbone BERT, usando este checkpoint como referencia reproducible.
- Relleno de huecos en textos ingleses: integrar el pipeline `fill-mask` para sugerir tokens en plantillas o borradores, aprovechando la cabecera MLM destilada.
- Extracción de embeddings para clasificación ligera: usar las representaciones del encoder como features en tareas downstream en inglés, con la ventaja del coste lineal en secuencias largas.
- Reproducción de experimentos de destilación: servir como ejemplo del pipeline NeuralOps de tres etapas para validar metodologías de KD en entornos con una sola GPU consumer.
- Benchmarking de mecanismos de atención: medir latencia y throughput frente a `bert-base-uncased` en longitudes de secuencia crecientes para evaluar la ganancia asintótica de `cosformer`.
- Docencia y prototipado: modelo pequeño (~110 M de parámetros, repo de 0,5 GB) que cabe en GPUs consumer y permite ilustrar conceptos de atención lineal y destilación sin infraestructura pesada.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son de perplejidad MLM determinista sobre WikiText-2 (15 % de tokens enmascarados, `seed=42`):

| Fase de evaluacion | MLM Perplexity | Precision de token enmascarado (%) | Delta vs baseline |
|---|---:|---:|---:|
| BERT teacher (`bert-base-uncased`) | 6,84 | 68,42 | Referencia |
| Stage 0 (calibracion Ridge en forma cerrada) | 0,00 | 91,63 | -6,84 |
| Stage 2 (modelo destilado final) | 0,00 | 91,51 | -6,84 |

El valor de perplejidad `0,00` es anómalo y sugiere un problema de medición o de calibración de logits; debe interpretarse con cautela y no como una mejora real de rendimiento. No se han publicado resultados de benchmarks estándar (MMLU, GLUE, SST-2, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: ~0,5 GB de pesos más activaciones; en la práctica menos de 2 GB para lotes pequeños.
- VRAM estimada en fp16: ~0,25 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; el autor usó una RTX 3090 para el entrenamiento.
- Cabe holgadamente en GPUs consumer (RTX 3060, RTX 4060, GTX 1660, etc.) e incluso en CPU para inferencia puntual.
- Opciones de despliegue: la vía recomendada es la API de NeuralOps (`neuralops.load_pretrained_bert`); también es posible usar `transformers.pipeline("fill-mask")` con `trust_remote_code=True`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Throughput de entrenamiento registrado: 24 617,9 tokens/s en RTX 3090. No se publican latencias de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Atencion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-cosformer-sst2` | ~110 M | 512 | `cosformer` (lineal) | MIT | Hugging Face, requiere NeuralOps |
| `google-bert/bert-base-uncased` | ~110 M | 512 | Multi-head estándar (cuadrática) | Apache 2.0 | Hugging Face, transformers estándar |
| `google/bert_uncased_L-12_H-768_A-12` (original) | ~110 M | 512 | Multi-head estándar | Apache 2.0 | TensorFlow Hub / Hugging Face |

La comparación con alternativas de atención eficiente (Longformer, BigBird, Performer) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no se ha validado en otros idiomas.
- El valor de perplejidad `0,00` en la evaluación publicada es sospechoso y probablemente refleja un fallo de medición; no debe tomarse como evidencia de calidad superior al teacher.
- El modelo no ha sido evaluado en tareas downstream (SST-2, GLUE u otras) pese a la mención a SST-2 en el nombre del repositorio.
- Requiere `custom_code` y la librería NeuralOps; no es cargable con un `AutoModel` estándar sin `trust_remote_code=True`, lo que añade riesgo de seguridad y de mantenimiento.
- Riesgo de alucinación y sesgos heredados de `bert-base-uncased` y de WikiText-2, sin mitigaciones documentadas.
- Contexto limitado a 512 tokens; la ventaja de `cosformer` se manifiesta en secuencias más largas, por lo que en este rango la ganancia práctica es marginal.
- Licencia MIT permite uso comercial, pero el modelo base `bert-base-uncased` está bajo Apache 2.0; conviene revisar la compatibilidad en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-cosformer-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset WikiText-2: https://huggingface.co/datasets/wikitext
