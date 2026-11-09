# tahamajs/bert-adaptive-span-attention-sst2

## Resumen

`tahamajs/bert-adaptive-span-attention-sst2` es una variante de `google-bert/bert-base-uncased` en la que las doce capas de self-attention multi-cabeza estándar se han sustituido por el mecanismo `adaptive_span_attention` de la librería NeuralOps. El modelo se ha destilado sobre WikiText-2 mediante un pipeline de destilación de conocimiento en tres etapas (NeuralOps 3-Stage GPU-Saturated Knowledge Distillation Pipeline) durante 300 segundos en una NVIDIA RTX 3090. Lo publica Taha Majlesi (usuario `tahamajs`) dentro del proyecto NeuralOps, un zoo de atención subcuadrática aplicada a BERT.

El problema que aborda es el coste cuadrático de la atención estándar en transformers: `adaptive_span_attention` limita el span de atención por cabeza, reduciendo el cómputo teórico frente a la atención densa. El modelo conserva la tarea de `fill-mask` y el vocabulario de `bert-base-uncased`, por lo que puede usarse como sustituto directo en tareas de masked language modeling en inglés.

Es relevante ahora porque ejemplifica una línea de trabajo de eficiencia en atención (subquadratic attention) combinada con destilación de conocimiento sobre un backbone BERT clásico, con métricas de destilación publicadas y una API de carga específica (`neuralops`). No obstante, el modelo tiene cero descargas y cero likes en el momento de la consulta, y los resultados reportados (PPL 0.00) requieren lectura crítica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base con `adaptive_span_attention` sustituyendo las 12 capas de MHSA estándar |
| Parametros totales | no disponible (el modelo base `bert-base-uncased` tiene ~110 M, pero no se confirma el recuento tras la sustitución de atención) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | no disponible (librería `neuralops`, con `custom_code`; no se especifican safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` y reemplaza las capas de self-attention multi-cabeza por `adaptive_span_attention`, un mecanismo de atención con span adaptativo que acota el rango de atención por cabeza y pertenece a la familia de atenciones subcuadráticas. El backbone es un transformer encoder estándar de BERT-base; la innovación se concentra en el bloque de atención. La model card no detalla la dimensión de span, el número de cabezas ni la inicialización de los parámetros de atención.

El entrenamiento consiste en destilación de conocimiento sobre WikiText-2 con un currículo de tres etapas: Stage 0 (calibración Ridge en forma cerrada), Stage 1 (MSE/CKA de subespacio con backbone congelado) y Stage 2 (KD de logits fusionado con learning rate diferencial). La destilación se ejecutó en una RTX 3090 (24 GB) durante 300 s (5 min), 155 pasos, con un throughput de 35 850 tokens/s y un pico de VRAM de 7 389 MB. No se reportan datos sobre RLHF/DPO ni sobre el volumen total de tokens de entrenamiento.

## Capacidades

- Masked language modeling (tarea `fill-mask`) en inglés, sobre el vocabulario de `bert-base-uncased`.
- Representaciones contextuales de token compatibles con el ecosistema BERT (útil para fine-tuning posterior en clasificación, NER, QA extractiva).
- Atención subcuadrática con span adaptativo, orientada a reducir coste computacional frente a atención densa.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe: limitada al inglés según la model card.

## Casos de uso

- Relleno de máscaras en pipelines de preprocesado de texto: el modelo puede usarse con `pipeline("fill-mask")` para completar huecos en frases en inglés, por ejemplo en generación de aumentos de datos o en tareas de cloze testing.
- Extracción de representaciones para clasificación de texto: al conservar la interfaz de BERT-base, puede fine-tunearse para análisis de sentimiento, clasificación de temas o detección de spam en inglés, aprovechando la atención subcuadrática para reducir coste en secuencias largas.
- Reconocimiento de entidades nombradas (NER): el encoder puede adaptarse con una cabeza token-classification para extraer entidades en documentos en inglés.
- Question answering extractiva: fine-tuning sobre SQuAD u otros datasets en inglés para localizar respuestas en un pasaje, con la ventaja potencial de menor coste de atención.
- Investigación en eficiencia de atención: sirve como punto de comparación frente a `bert-base-uncased` para estudiar el impacto de `adaptive_span_attention` en calidad y latencia.
- Docencia y experimentación con destilación: el pipeline de tres etapas y las métricas publicadas permiten reproducir el proceso de destilación en una sola GPU consumer (RTX 3090, 24 GB) en unos 5 minutos.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son de evaluación de masked language modeling sobre WikiText-2 (15 % de tokens enmascarados, `seed=42`), con pseudo-perplejidad determinista (MLM-PPL) y precisión de token enmascarado:

| Fase de evaluación | MLM PPL | Precisión token enmascarado (%) | Delta vs baseline |
|---|---|---|---|
| BERT-base teacher (`bert-base-uncased`) | 6.84 | 68.42 | Referencia |
| Stage 0 (calibración Ridge en forma cerrada) | 0.00 | 91.74 | -6.84 |
| Stage 2 (modelo destilado final) | 0.00 | 91.06 | -6.84 |

Advertencia: una perplejidad de 0.00 es un valor anómalo que sugiere un problema de métrica, fuga de información o un artefacto de evaluación; no debe interpretarse como rendimiento real. No se han publicado resultados en MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el pico de entrenamiento reportado es de 7 389 MB en una RTX 3090; para inferencia en fp32 de un BERT-base (~110 M de parámetros) se estiman del orden de 1-2 GB, aunque no se confirma el recuento exacto tras la sustitución de atención.
- GPU recomendadas: RTX 3090 (usada en el entrenamiento), A100, H100 para despliegues de mayor throughput; cualquier GPU consumer con al menos 4-6 GB debería bastar para inferencia en fp32 o fp16.
- Cabe en GPU consumer: sí, previsiblemente en GTX 1660/RTX 2060 en adelante, dado el tamaño de BERT-base.
- Opciones de despliegue: la vía documentada es la librería `neuralops` (`neuralops.load_pretrained_bert`) y el `pipeline("fill-mask")` de Transformers con `trust_remote_code` (el modelo tiene `custom_code`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles para inferencia; en entrenamiento se reportan 35 850 tokens/s en RTX 3090.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Atención | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-adaptive-span-attention-sst2` | no disponible (~110 M base) | no disponible | `adaptive_span_attention` (subcuadrática) | MIT | Hugging Face, 0 descargas |
| `google-bert/bert-base-uncased` | ~110 M | 512 tokens | MHSA densa | Apache 2.0 | Hugging Face, ampliamente usado |
| `distilbert-base-uncased` | ~66 M | 512 tokens | MHSA densa | Apache 2.0 | Hugging Face, ampliamente usado |
| `google/bert_uncased_L-12_H-768_A-12` | ~110 M | 512 tokens | MHSA densa | Apache 2.0 | Hugging Face |

La comparativa se limita a arquitecturas BERT-base/distiladas; no se dispone de datos de rendimiento comparables del modelo frente a estas alternativas más allá de la tabla de destilación sobre WikiText-2.

## Limitaciones y advertencias

- Los valores de perplejidad 0.00 y precisión del 91 % en Stage 0 y Stage 2 son sospechosos y no deben tomarse como evidencia de calidad; probablemente reflejan un artefacto de la métrica de pseudo-perplejidad o fuga de datos.
- El modelo solo soporta inglés; no se documenta cobertura multilingüe.
- Riesgo de alucinación y sesgos: no se documentan análisis de sesgo ni evaluaciones de robustez; al derivar de `bert-base-uncased`, hereda los sesgos de su corpus de preentrenamiento (sin especificar).
- Licencia MIT: permite uso comercial, pero al ser un derivado de `bert-base-uncased` (Apache 2.0) conviene verificar el cumplimiento de ambas licencias.
- El modelo requiere `custom_code` y la librería `neuralops`; la integración con el ecosistema estándar de Transformers no está garantizada sin `trust_remote_code`.
- Cero descargas y cero likes: no hay evidencia de uso en producción ni validación independiente.
- No se documentan la longitud de contexto efectiva, los tipos de cuantización ni el formato de pesos, lo que dificulta el despliegue en entornos con restricciones de memoria.
- La model card mezcla el identificador `tahamajs/bert-adaptive-span-attention-sst2` con `Hooshaai/bert-adaptive-span-attention-sst2` en el ejemplo de código, lo que puede provocar errores de carga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-adaptive-span-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
