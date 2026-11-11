# tahamajs/bert-comp-aa-svd-compressor-sst2

## Resumen

`bert-comp-aa-svd-compressor-sst2` es un checkpoint de `google-bert/bert-base-uncased` afinado en GLUE SST-2 y posteriormente comprimido mediante la técnica Activation-Aware SVD (AASVD) implementada en la librería NeuralOps de Taha Majlesi. El modelo resultante reduce el número de parámetros de 109.483.778 a 100.058.882 (un 8,61 % menos, ratio de compresión físico de 1,094x) manteniendo una accuracy de 90,14 % en la partición de validación de SST-2, frente al 91,63 % del modelo profesor original.

El interés del artefacto no reside en su rendimiento absoluto, que es el esperado para un BERT-base afinado en clasificación de sentimiento, sino en su valor como caso de estudio reproducible de compresión de modelos: la model card documenta una evaluación Pareto multi-rango (k=256, 128, 64 y 32) sobre 872 muestras de validación, ejecutada físicamente en una RTX 3090, y muestra cómo el rendimiento se degrada drásticamente al reducir el rango (84,98 % con k=128, 71,79 % con k=64 y 47,82 % con k=32 en modo zero-shot).

Se distribuye como un state dict de PyTorch (`pytorch_model.bin`, 191 MB) que requiere reconstruir la topología comprimida con la propia librería NeuralOps antes de cargar los pesos. La licencia es MIT y el modelo solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base (12 capas, dimensión oculta 768), comprimido mediante Activation-Aware SVD (AASVD) |
| Parametros totales | 100.058.882 (profesor original: 109.483.778) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base BERT-base admite 512 tokens) |
| Tipos de cuantizacion | No disponible; el checkpoint se distribuye en precisión completa (state dict PyTorch) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch); requiere reconstrucción de topología con NeuralOps |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased`, un transformer encoder de 12 capas y 768 dimensiones ocultas, afinado previamente en la tarea GLUE SST-2 (clasificación binaria de sentimiento). Sobre ese checkpoint se aplica el compresor `AASVDCompressor` de NeuralOps, que realiza una descomposición en valores singulares consciente de las activaciones (activation-aware SVD) para reducir el rango de las matrices de peso a k=256. El resultado es una reducción física del 8,61 % de los parámetros y un ratio de compresión de 1,094x.

La model card documenta una evaluación multi-rango (k=256, 128, 64, 32) sobre las 872 muestras de validación de SST-2 ejecutada en una NVIDIA RTX 3090. La política de "LoRA healing" de NeuralOps (LoRA con r=8, 50 pasos, lr=2e-4, presupuesto de 45 segundos) se activa cuando la compresión zero-shot degrada más de 2,0 puntos porcentuales con una reducción superior a 1,10x. En el checkpoint publicado (k=256) no se aplicó LoRA healing (`LoRA Recovery Applied: False`), ya que la caída zero-shot fue de 1,49 puntos. En los rangos más agresivos el healing se aplicó pero produjo resultados peores que el zero-shot (69,95 % con k=128, 49,08 % con k=64 y 50,92 % con k=32), lo que sugiere inestabilidad del procedimiento de recuperación en esos regímenes.

## Capacidades

- Clasificación de sentimiento binaria (positivo/negativo) en inglés, específicamente sobre el dominio y formato de GLUE SST-2.
- Generación de logits de clasificación para dos clases mediante `BertForSequenceClassification`.
- Inferencia en modo evaluación (`model.eval()`) sobre texto tokenizado con el vocabulario estándar `bert-base-uncased`.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agente.
- No dispone de modo "thinking", visión, audio ni otras modalidades.
- Capacidad multilingüe limitada al inglés; no se documenta soporte para otras lenguas.
- No es un modelo generativo: no produce texto libre.

## Casos de uso

- Análisis de sentimiento en reseñas de producto: el modelo clasifica textos cortos en inglés como positivos o negativos con un 90,14 % de accuracy en SST-2, suficiente para agregar métricas de satisfacción a escala sobre catálogos de opiniones.
- Moderación de comentarios en foros angloparlantes: permite filtrar automáticamente mensajes con carga negativa como primer paso de un pipeline de moderación, con la ventaja de un modelo de 100 M de parámetros que cabe en CPU.
- Investigación en compresión de modelos: sirve como referencia reproducible para comparar técnicas de SVD activation-aware frente a poda estructurada o destilación, ya que la model card publica la curva Pareto completa en cuatro rangos.
- Docencia y experimentación: el script de reconstrucción de la model card permite demostrar en un notebook cómo se recompone una topología comprimida y se cargan pesos con `strict=False`, un patrón útil para enseñar compresión práctica.
- Clasificación por lotes en entornos con recursos limitados: al requerir menos parámetros que el BERT-base original, reduce la huella de memoria en despliegues de clasificación masiva donde el throughput importa más que la precisión punta.
- Baseline en pipelines de MLOps: integrable como paso de sentiment scoring en sistemas de monitorización de reseñas o encuestas, siempre que el texto esté en inglés y el dominio se parezca a SST-2.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Modelo / configuración | Ratio de compresión | Parámetros (reducción) | Accuracy SST-2 validación |
|---|---:|---:|---:|
| Profesor `bert-base-uncased` (SST-2) | 1,00x | 109.483.778 | 91,63 % |
| **AASVD k=256 (publicado)** | 1,09x | 100.058.882 (-8,6 %) | **90,14 %** |
| AASVD k=128 (zero-shot) | 1,21x | 90.615.554 (-17,2 %) | 84,98 % |
| AASVD k=128 (LoRA healing) | 1,21x | 90.615.554 (-17,2 %) | 69,95 % |
| AASVD k=64 (zero-shot) | 1,27x | 85.893.890 (-21,5 %) | 71,79 % |
| AASVD k=64 (LoRA healing) | 1,27x | 85.893.890 (-21,5 %) | 49,08 % |
| AASVD k=32 (zero-shot) | 1,31x | 83.533.058 (-23,7 %) | 47,82 % |
| AASVD k=32 (LoRA healing) | 1,31x | 83.533.058 (-23,7 %) | 50,92 % |

Evaluación realizada sobre 872 muestras de la partición de validación de GLUE SST-2 en una NVIDIA GeForce RTX 3090 (24 GB). No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 191 MB en `pytorch_model.bin`; en FP32 ocupa aproximadamente 0,4 GB de memoria, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente (GTX 1650, RTX 3060, RTX 4090, A100, H100). La evaluación del autor se ejecutó en una RTX 3090.
- Cabe en GPU consumer: sí, en todas las GPU consumer modernas e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. El único camino documentado es cargar el state dict con PyTorch + Transformers + NeuralOps, reconstruyendo la topología con `compress_model(model, {"compressors": [{"method": "aa_svd_compressor", "rank": 256}]})`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| `tahamajs/bert-comp-aa-svd-compressor-sst2` | 100,1 M | No disponible (base: 512) | 90,14 % | MIT | Hugging Face (repo propio, requiere NeuralOps) |
| `google-bert/bert-base-uncased` (profesor SST-2) | 109,5 M | 512 | 91,63 % | Apache 2.0 | Hugging Face, Transformers |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66,9 M | 512 | ~91 % (referencia pública) | Apache 2.0 | Hugging Face, Transformers |
| `roberta-base` (SST-2) | 124,6 M | 512 | ~94-95 % (referencia pública) | MIT | Hugging Face, Transformers |

La comparativa con DistilBERT y RoBERTa se ofrece como referencia de categoría; los valores de accuracy de esas filas no provienen de la información proporcionada para este modelo y deben contrastarse en sus respectivas model cards.

## Limitaciones y advertencias

- El checkpoint no se carga directamente con `AutoModelForSequenceClassification.from_pretrained`: es necesario reconstruir la topología comprimida con NeuralOps y usar `load_state_dict(..., strict=False)`, lo que añade una dependencia externa y un paso manual propenso a errores.
- La accuracy declarada (90,14 %) figura como `verified: false` en el model-index; no ha sido validada de forma independiente.
- El modelo solo clasifica sentimiento binario en inglés; no generaliza a otras tareas de clasificación ni a otros idiomas.
- La degradación con rangos más agresivos es severa (47,82 % con k=32), lo que indica que la técnica AASVD no escala bien a compresiones superiores al 20 % en esta tarea.
- El procedimiento de LoRA healing empeora los resultados en todos los rangos evaluados salvo en k=32, donde la mejora es marginal (de 47,82 % a 50,92 %); no debe asumirse que el healing sea una red de seguridad fiable.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador), pero sí de calibración deficiente fuera de la distribución de SST-2.
- Sesgos heredados del corpus de preentrenamiento de BERT-base (textos web en inglés) y del dataset SST-2, centrado en reseñas de películas.
- Licencia MIT permite uso comercial, pero la dependencia de NeuralOps debe revisarse por separado (licencia MIT según el enlace del repositorio).
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-aa-svd-compressor-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación del compresor AASVD: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/svd/aa_svd_compressor.py
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
