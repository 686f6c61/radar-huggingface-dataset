# tahamajs/bert-block-transformer-hiba-sst2

## Resumen

`tahamajs/bert-block-transformer-hiba-sst2` es una variante de `google-bert/bert-base-uncased` en la que las 12 capas de self-attention multi-cabeza estándar se han sustituido por el mecanismo `block_transformer_hiba`, perteneciente a la librería NeuralOps desarrollada por Taha Majlesi. El modelo se ha destilado sobre WikiText-2 mediante un pipeline de destilación de conocimiento en tres etapas (calibración Ridge en forma cerrada, MSE/CKA de subespacio con backbone congelado y KD de logits fusionado con learning rate diferencial), ejecutado durante 300 segundos en una NVIDIA RTX 3090.

El objetivo declarado es doble: por un lado, servir como banco de pruebas de mecanismos de atención subcuadrática dentro del "Attention Zoo" de NeuralOps (un conjunto de 131 variantes de BERT preentrenadas); por otro, demostrar que la sustitución de atención puede calibrarse mediante destilación en cuestión de minutos con hardware de consumo. La arquitectura subyacente sigue siendo un transformer encoder de tipo BERT-base, con 12 capas y 110 millones de parámetros, pero con la atención original reemplazada por `block_transformer_hiba`.

La relevancia actual del modelo es fundamentalmente experimental y de investigación: no está pensado como modelo de producción, sino como artefacto reproducible para estudiar el impacto de mecanismos de atención alternativos en tareas de masked language modeling. Su licencia MIT y su integración con la API de NeuralOps lo hacen accesible para experimentación académica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT-base con atención `block_transformer_hiba` (subcuadrática) en las 12 capas |
| Parametros totales | 110 millones (heredados de bert-base-uncased; no se especifica recuento exacto tras la sustitución) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base soporta 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0,5 GB; la librería es `neuralops` con `custom_code`) |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` y reemplaza las 12 capas de Multi-Head Self-Attention por el mecanismo `block_transformer_hiba`, una atención de tipo subcuadrático (block transformer) implementada en la librería NeuralOps. El resto de la arquitectura BERT (embeddings, feed-forward, normalización, cabecera MLM) se mantiene. El modelo se distribuye con `custom_code`, por lo que requiere la librería NeuralOps para cargarse correctamente.

El entrenamiento consistió en un pipeline de destilación de conocimiento en tres etapas sobre WikiText-2: Stage 0 (calibración Ridge en forma cerrada), Stage 1 (MSE/CKA de subespacio con backbone congelado) y Stage 2 (KD de logits fusionado con learning rate diferencial). La destilación se ejecutó durante 300 segundos (235 pasos) en una RTX 3090, con un throughput de 40.738 tokens/s y un pico de VRAM de 8.487 MB. No se especifican el número total de tokens de entrenamiento ni la composición detallada del dataset más allá de WikiText-2.

## Capacidades

- Relleno de máscaras (masked language modeling) en inglés, tarea principal del pipeline `fill-mask`.
- Representaciones contextuales de tokens para tareas downstream de NLP (clasificación, NER, etc.), al conservar la estructura de BERT-base.
- Atención subcuadrática mediante `block_transformer_hiba`, orientada a reducir el coste computacional frente a la atención cuadrática estándar.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe: solo inglés.
- No se documenta visión, audio ni modo "thinking".

## Casos de uso

- Investigación sobre mecanismos de atención: el modelo permite comparar `block_transformer_hiba` frente a la atención estándar de BERT en la misma arquitectura y dataset, aislando el efecto del mecanismo de atención.
- Reproducción de experimentos de destilación: al documentarse hardware, duración, pasos y throughput, sirve para replicar el pipeline de destilación de NeuralOps en condiciones controladas.
- Benchmark de eficiencia de atención: útil para medir el ahorro computacional de una atención subcuadrática en un encoder BERT-base con 12 capas.
- Prototipado de pipelines `fill-mask`: mediante `transformers.pipeline("fill-mask", ...)` se puede integrar en demos de relleno de máscaras en inglés.
- Estudio de calibración post-destilación: los resultados de perplexidad y precisión de tokens enmascarados permiten analizar el comportamiento de la calibración Ridge en forma cerrada.
- Base para fine-tuning en tareas downstream en inglés: al mantener la estructura de BERT-base, puede servir como inicialización para clasificación de texto o NER, aunque sin garantías de rendimiento comparable al modelo original.

## Benchmarks y rendimiento

Evaluación con MLM Pseudo-Perplexity determinista sobre WikiText-2 (15% de tokens enmascarados, `seed=42`):

| Fase de evaluación | MLM PPL | Precisión tokens enmascarados (%) | Delta vs baseline |
|---|---:|---:|---:|
| BERT teacher (`bert-base-uncased`) | 6,84 | 68,42% | Referencia |
| Stage 0 (calibración Ridge en forma cerrada) | 0,00 | 50,92% | -6,84 |
| Stage 2 (modelo destilado) | 0,00 | 50,92% | -6,84 |

Advertencia: los valores de PPL de 0,00 y la precisión del 50,92% (equivalente a azar en un vocabulario de ~30.000 tokens) son indicativos de un fallo en la calibración o en la métrica, no de un rendimiento real superior al profesor. No deben interpretarse como mejora del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento consumió 8.487 MB de pico en una RTX 3090, por lo que la inferencia en fp32 debería caber holgadamente en GPUs de 8-12 GB.
- GPU recomendadas: RTX 3090 (usada en el entrenamiento), así como cualquier GPU con al menos 8 GB de VRAM para inferencia.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060/3070/3080/3090 y equivalentes, dado el tamaño de 110 M de parámetros.
- Opciones de despliegue: la vía recomendada es la API de NeuralOps (`neuralops.load_pretrained_bert`) o `transformers.pipeline("fill-mask")`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo se reporta throughput de entrenamiento (40.738 tokens/s en RTX 3090); no hay datos de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `tahamajs/bert-block-transformer-hiba-sst2` | ~110 M | no disponible | MIT | Hugging Face (neuralops) | Atención subcuadrática, destilado en 300 s |
| `google-bert/bert-base-uncased` | 110 M | 512 | Apache 2.0 | Hugging Face (transformers) | Modelo original, atención estándar |
| Otras variantes del NeuralOps Attention Zoo | no disponible | no disponible | MIT (presumible) | Hugging Face | 131 variantes de atención según la cita |

No se dispone de datos de benchmarks comparativos con otras alternativas de atención subcuadrática (Longformer, BigBird, etc.) en la información proporcionada.

## Limitaciones y advertencias

- Los resultados de benchmark reportados (PPL 0,00 y precisión 50,92%) son inconsistentes y sugieren un fallo en la calibración o en la métrica; no deben usarse como evidencia de calidad.
- El modelo solo soporta inglés; no hay capacidades multilingües documentadas.
- Requiere la librería `neuralops` y `custom_code` para cargarse; no es compatible directamente con `transformers` sin esa dependencia.
- La destilación se realizó en solo 300 segundos y 235 pasos, lo que es insuficiente para una convergencia robusta en tareas de NLP.
- No se documentan sesgos específicos, pero al derivar de `bert-base-uncased` hereda los sesgos de su corpus de entrenamiento (textos web en inglés).
- Riesgo de alucinación y de predicciones poco fiables en `fill-mask`, dado el estado aparentemente no convergido del modelo.
- Licencia MIT permite uso comercial, pero la falta de garantías de rendimiento desaconseja su uso en producción.
- No se documenta longitud de contexto efectiva tras la sustitución de atención; el modelo base soporta 512 tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-block-transformer-hiba-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
