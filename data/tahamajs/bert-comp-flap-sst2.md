# tahamajs/bert-comp-flap-sst2

## Resumen

`tahamajs/bert-comp-flap-sst2` es un checkpoint de clasificación de sentimiento derivado de `google-bert/bert-base-uncased` y ajustado sobre GLUE SST-2, publicado por el autor individual Taha Majlesi dentro del proyecto NeuralOps. El modelo se presenta como un artefacto del "Compressor Zoo" de dicha librería, generado con el motor de compresión `FLAPCompressor` (Fluctuation-based Adaptive Structured Pruning) en el rango de exhibición `k=32`.

El interés del repositorio no reside en el modelo en sí (es un BERT-base estándar de 109,48 millones de parámetros y 12 capas), sino en su función como demostración reproducible de una tubería de compresión con recuperación LoRA. La model card documenta una evaluación Pareto multi-rango (`k=256, 128, 64, 32`) sobre la partición de validación de SST-2 (872 muestras), ejecutada en una RTX 3090.

Conviene señalar de entrada una anomalía importante: pese a la etiqueta de "compresión", la ratio física declarada es `1.00x` y la reducción de parámetros es del `0.00%` en todos los rangos evaluados. El checkpoint empaquetado es, en la práctica, el modelo base sin podar, con la precisión del profesor intacta (`91.63%`). Es relevante ahora como ejemplo de infraestructura de compresión y de reporte de telemetría, no como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (12 capas, dimensión oculta 768) |
| Parametros totales | 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (BERT-base soporta hasta 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (PyTorch state dict serializado), más `config.json` y `compression_summary.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es BERT-base uncased: un transformer encoder bidireccional de 12 capas con 768 dimensiones ocultas y 109.483.778 parámetros, seguido de una cabeza de clasificación de secuencia con dos etiquetas (negativo/positivo). Sobre esta base se aplica el compresor `FLAPCompressor` de NeuralOps, que implementa poda estructurada adaptativa basada en fluctuaciones, con soporte para `LoRALinear` y `Conv1D`, restricción opcional a proyecciones de atención (`target_attention_only`) y validación del error de reconstrucción de Frobenius relativo con umbral configurable (`max_error`), con retroceso seguro al módulo original si se supera.

El proceso de recuperación documentado aplica LoRA dirigido (`r=8`, 50 pasos, `lr=2e-4`, presupuesto de 45 segundos) únicamente cuando la compresión zero-shot degrada la precisión más de 2,0 puntos con una reducción superior a 1,10x. En este checkpoint, el campo `LoRA Recovery Applied` figura como `False`, lo que sugiere que no se activó la recuperación. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset más allá de GLUE SST-2, ni si hubo RLHF o DPO.

## Capacidades

- Clasificación binaria de sentimiento en inglés (positivo/negativo) sobre textos de longitud moderada.
- Ajuste específico sobre GLUE SST-2, con vocabulario `bert-base-uncased` estándar.
- Inferencia determinista de logits de dos clases mediante `BertForSequenceClassification`.
- Carga compatible con `transformers` reconstruyendo previamente la topología comprimida con `neuralops.core.compression_pipeline.compress_model`.
- Telemetría de compresión legible por máquina vía `compression_summary.json` (rangos 256, 128, 64, 32).
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Capacidad multilingüe: no disponible; el modelo está etiquetado únicamente para inglés.

## Casos de uso

- Análisis de sentimiento en reseñas de producto: el modelo clasifica textos cortos en positivo o negativo con una precisión reportada del 91,63% en SST-2, adecuado para enriquecer catálogos con una etiqueta de polaridad.
- Moderación de comentarios en foros: filtrado previo de mensajes con tono negativo para revisión humana, usando la cabeza de clasificación binaria como señal de triaje.
- Investigación en compresión de modelos: sirve como referencia reproducible para comparar el motor `FLAPCompressor` frente a otros compresores del zoo de NeuralOps sobre una tarea GLUE estándar.
- Validación de tuberías de recuperación LoRA: el `compression_summary.json` permite auditar cómo varía la precisión entre rangos y cuándo se dispara el "healing" automático.
- Benchmark de infraestructura: al ser un BERT-base de 208,9 MB, es útil para medir latencia y throughput de despliegues en GPU consumer antes de escalar a modelos mayores.
- Docencia y prototipado de NLP: ejemplo mínimo de ajuste fino y evaluación sobre GLUE SST-2 con licencia MIT, reutilizable en cursos y talleres.
- Etiquetado semiautomático de corpus: generación de etiquetas de sentimiento para preanotar grandes volúmenes de texto en inglés antes de una revisión humana.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index y en la model card (no verificados de forma independiente):

| Rank (k) | Ratio físico | Params comprimidos (reducción) | Precisión zero-shot | Precisión tras healing | Paridad vs profesor (91,63%) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,00x | 109.483.778 (-0,0%) | 61,70% | 61,70% | -29,93% |
| 128 | 1,00x | 109.483.778 (-0,0%) | 51,15% | 51,15% | -40,48% |
| 64 | 1,00x | 109.483.778 (-0,0%) | 91,63% | 91,63% | +0,00% |
| 32 (checkpoint publicado) | 1,00x | 109.483.778 (-0,0%) | 91,63% | 91,63% | +0,00% |

Evaluación sobre GLUE SST-2, partición de validación (872 muestras), en NVIDIA GeForce RTX 3090 (24 GB). El resultado oficial del model-index es accuracy de 91,63% en validación de SST-2. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: en torno a 0,4-0,5 GB para pesos (208,9 MB) más activaciones y overhead; cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: RTX 3090 (la usada por el autor para la evaluación), RTX 4090, A100, H100; también válidas GTX 1660, RTX 3060 y similares para inferencia en lote pequeño.
- Cabe en GPU consumer: sí, sin restricciones prácticas; también es viable en CPU para volúmenes moderados.
- Opciones de despliegue: al estar en formato `pytorch_model.bin` con topología comprimida, requiere reconstruir el modelo con `neuralops` y cargar el state dict con `strict=False`; no se documenta compatibilidad directa con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `tahamajs/bert-comp-flap-sst2` | 109,48 M | no disponible | 91,63% | MIT | Hugging Face (repo 0,2 GB) |
| `google-bert/bert-base-uncased` (ajustado a SST-2) | 109,48 M | 512 tokens | ~92-93% (referencia habitual) | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | 109,48 M | 512 tokens | ~92,7% (referencia pública) | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66,96 M | 512 tokens | ~91,3% (referencia pública) | Apache 2.0 | Hugging Face |

Las cifras de los modelos comparativos son referencias habituales de la comunidad y no se han extraído de la información proporcionada; tómense como orientativas. El modelo objeto de esta ficha no ofrece ventaja de compresión física frente a su base (ratio 1,00x), por lo que su interés es metodológico más que de eficiencia.

## Limitaciones y advertencias

- La compresión declarada es nula en la práctica: ratio `1.00x` y `-0.00%` de reducción de parámetros en todos los rangos evaluados; el checkpoint es funcionalmente equivalente al BERT-base sin podar.
- Los rangos `k=256` y `k=128` muestran degradaciones severas de precisión (61,70% y 51,15%), lo que sugiere inestabilidad del proceso de compresión en esos ajustes.
- El campo `LoRA Recovery Applied` figura como `False`, pese a que la model card describe un mecanismo de healing; la coherencia interna del reporte no está verificada.
- Solo soporta inglés; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas en textos ambiguos, irónicos o de dominio distinto a SST-2 (reseñas de cine).
- Sesgos: no documentados; al derivar de BERT-base uncased, hereda los sesgos presentes en su corpus de preentrenamiento (no especificado).
- La licencia MIT permite uso comercial, pero el modelo base `google-bert/bert-base-uncased` está bajo Apache 2.0; conviene revisar la compatibilidad y atribución.
- Para producción, la carga requiere la librería `neuralops` y la reconstrucción de la topología comprimida; no es un checkpoint plug-and-play con `transformers` directamente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de los resultados.
- El tamaño del repo (0,2 GB) y el formato `pytorch_model.bin` (no safetensors) implican que la carga requiere `torch.load`, con las precauciones de seguridad habituales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-flap-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor FLAP: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/pruning/flap.py
- Licencia del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
