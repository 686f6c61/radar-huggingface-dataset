# tahamajs/bert-comp-soka-compressor-sst2

## Resumen

`bert-comp-soka-compressor-sst2` es un checkpoint de `google-bert/bert-base-uncased` (109.483.778 parámetros, 12 capas, dimensión oculta 768) afinado sobre GLUE SST-2 y posteriormente comprimido mediante el compresor `soka_compressor` (`LowRankCompressor`) de la librería NeuralOps, desarrollada por Taha Majlesi. El modelo forma parte de un "compressor zoo" que evalúa distintos rangos de compresión de bajo rango sobre BERT y aplica un proceso de recuperación con LoRA cuando la pérdida de precisión supera ciertos umbrales.

El checkpoint publicado corresponde al rango `k=64`, con 35.165.954 parámetros tras la compresión (una reducción del 67,88 % y un ratio físico de 3,113x). Sobre ese modelo comprimido se aplicaron adaptadores LoRA de rango `r=8` durante 50 pasos con `lr=2e-4`, lo que elevó la precisión en validación de SST-2 del 51,38 % (zero-shot tras compresión) al 73,05 % final. El profesor original (BERT-base sin comprimir) alcanza el 91,63 %, por lo que el delta de paridad es de -18,58 puntos porcentuales.

Su relevancia es principalmente metodológica y de investigación: sirve como referencia reproducible para estudiar el compromiso entre ratio de compresión y degradación de tareas downstream en arquitecturas transformer pequeñas, y como ejemplo de pipeline de compresión + reparación con LoRA dentro del ecosistema NeuralOps. No está pensado como modelo de producción para clasificación de sentimiento, dado el gap de casi 19 puntos frente al profesor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (12 capas, D=768), comprimido con `soka_compressor` (`LowRankCompressor`, low-rank) + LoRA `r=8` |
| Parametros totales | 35.165.954 (tras compresión; base original 109.483.778) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de `bert-base-uncased`, típicamente 512 tokens; no confirmado en la información) |
| Tipos de cuantizacion | No disponible (el repo empaqueta `pytorch_model.bin` en precisión completa) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado), `config.json`, `compression_summary.json`, assets de tokenizer BERT |

## Arquitectura y entrenamiento

La arquitectura base es BERT-base uncased: un transformer encoder de 12 capas con dimensión oculta 768 y 109.483.778 parámetros, preentrenado por Google y afinado aquí sobre GLUE SST-2 (clasificación binaria de sentimiento). Sobre ese modelo se aplica `soka_compressor`, un compresor de bajo rango ("Second-Order Knowledge-Aware Low-Rank Linear Compressor") registrado en `COMPRESSOR_REGISTRY` como `soka`, que factoriza las matrices lineales a rango `k=64`, reduciendo el recuento de parámetros a 35.165.954.

El pipeline de NeuralOps evalúa cuatro rangos (`k=256, 128, 64, 32`) sobre la partición de validación de SST-2 (872 muestras) en una RTX 3090 de 24 GB. Cuando la compresión zero-shot degrada la precisión más de 2,0 puntos con una reducción superior a 1,10x, se activa un "healing" con LoRA de rango `r=8`, 50 pasos y `lr=2e-4` (presupuesto de 45 segundos). En el caso de `k=64`, el healing recupera la precisión del 51,38 % al 73,05 %. No se documentan en la información disponible detalles sobre el volumen de tokens de entrenamiento, composición del dataset más allá de GLUE SST-2, ni uso de RLHF/DPO.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) sobre texto en inglés, específicamente en el dominio de SST-2.
- Generación de logits de clasificación para dos etiquetas mediante `BertForSequenceClassification` con `num_labels=2`.
- Inferencia estándar de BERT tras reconstruir la topología comprimida con `compress_model` y cargar el state dict con `strict=False`.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo discriminativo de clasificación, no generativo.
- No dispone de modo "thinking", visión, audio ni capacidades multimodales.
- Capacidad multilingüe limitada al inglés (tokenizer `bert-base-uncased`).

## Casos de uso

- Investigación sobre compresión de modelos: permite reproducir el compromiso entre ratio de compresión (1,63x–3,67x) y precisión downstream en BERT, sirviendo como baseline para comparar técnicas de low-rank factorization.
- Estudio de reparación con LoRA: el checkpoint ilustra cómo un healing de 50 pasos con `r=8` recupera 21,67 puntos de precisión en el rango `k=64`, útil para diseñar pipelines de recuperación post-compresión.
- Benchmarking de librerías de compresión: integrable en evaluaciones comparativas de `soka_compressor` frente a otros compresores del `COMPRESSOR_REGISTRY` de NeuralOps.
- Docencia y experimentación: ejemplo didáctico de compresión + LoRA sobre un modelo pequeño (35M parámetros, 67,2 MB de pesos) que cabe en cualquier GPU consumer para experimentos rápidos.
- Validación de pipelines de serialización: el repo incluye `compression_summary.json` con telemetría de todos los rangos, útil para verificar herramientas de reconstrucción de modelos comprimidos.
- Clasificación de sentimiento de baja exigencia en entornos con restricciones de memoria: con 67,2 MB de pesos y 35M de parámetros, puede desplegarse en dispositivos con recursos muy limitados, aceptando la pérdida de precisión frente al profesor.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Modelo / configuración | Ratio físico | Parámetros | SST-2 val (zero-shot) | SST-2 val (tras LoRA) | Paridad vs profesor |
|---|---:|---:|---:|---:|---:|
| Profesor (`bert-base-uncased` SST-2) | 1,00x | 109.483.778 | — | 91,63 % | — |
| `k=256` | 1,63x | 67.016.450 | 59,52 % | 50,92 % | -40,71 % |
| `k=128` | 2,39x | 45.782.786 | 52,41 % | 50,92 % | -40,71 % |
| `k=64` (publicado) | 3,11x | 35.165.954 | 51,38 % | **73,05 %** | -18,58 % |
| `k=32` | 3,67x | 29.857.538 | 50,00 % | 50,92 % | -40,71 % |

Evaluación sobre la partición de validación de GLUE SST-2 (872 muestras) en una NVIDIA GeForce RTX 3090 (24 GB). El resultado de 73,05 % de accuracy en `k=64` es el declarado en el `model-index` del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para el checkpoint publicado (35M parámetros, ~140 MB de pesos en memoria si se carga en FP32; el repo reporta 67,2 MB de pesos serializados).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; el autor evaluó en RTX 3090 (24 GB) pero el modelo es sobradamente pequeño para GPUs consumer de gama baja (GTX 1650, RTX 3050, etc.) e incluso CPU.
- Cabe en cualquier GPU consumer y en CPU sin problema; no requiere GPU dedicada.
- Opciones de despliegue: el flujo oficial usa `transformers` + `neuralops` (`compress_model` + `load_state_dict(strict=False)`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en la información disponible; al ser un modelo discriminativo con pesos en `.bin` y topología comprimida personalizada, la integración con esos servidores no está garantizada.
- Latencia y throughput: no disponibles en la información proporcionada. El healing LoRA reporta un presupuesto de 45 segundos para 50 pasos en RTX 3090, pero no se ofrecen cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 val | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| `tahamajs/bert-comp-soka-compressor-sst2` (k=64) | 35.165.954 | No disponible | 73,05 % | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor SST-2) | 109.483.778 | 512 | 91,63 % | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~66M | 512 | No disponible en esta ficha | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | 109.483.778 | 512 | No disponible en esta ficha | Apache 2.0 | Hugging Face |

La comparación con alternativas de la misma categoría (BERT comprimidos para SST-2) no está disponible en la información proporcionada más allá del propio profesor. El checkpoint publicado ocupa un punto intermedio en tamaño entre DistilBERT (~66M) y BERT-base (109M), pero con una precisión muy inferior al profesor.

## Limitaciones y advertencias

- Degradación severa de precisión: 73,05 % frente al 91,63 % del profesor, un delta de -18,58 puntos. No es apto para producción en clasificación de sentimiento sin una evaluación adicional.
- El healing con LoRA no es monótono: en los rangos `k=256`, `k=128` y `k=32` la precisión tras LoRA (50,92 %) es inferior a la zero-shot, lo que sugiere inestabilidad del proceso de recuperación y posibles problemas de sobreajuste o colapso en esos regímenes.
- Solo inglés: el tokenizer y el dataset de ajuste son monolingües (`bert-base-uncased`, GLUE SST-2).
- Dominio restringido: entrenado y evaluado únicamente en SST-2 (reseñas de cine); la generalización a otros dominios de sentimiento no está documentada.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí de clasificaciones erróneas sistemáticas por la compresión agresiva.
- Sesgos: no se documentan análisis de sesgo en la model card; al heredar de `bert-base-uncased` y SST-2, es probable que arrastre sesgos del corpus original y del dataset de reseñas.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo base (`bert-base-uncased`) está bajo Apache 2.0; conviene verificar la compatibilidad y mantener los avisos correspondientes.
- Dependencia de la librería `neuralops`: la carga requiere reconstruir la topología comprimida con `compress_model` antes de `load_state_dict(strict=False)`; no es un checkpoint estándar de `transformers` y puede romper herramientas que esperen pesos convencionales.
- Checkpoint con 0 descargas y 0 likes en el momento de la ficha: sin validación comunitaria independiente.
- Los resultados de benchmarks están marcados como no verificados (`verified: false`) y proceden únicamente del autor.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/bert-comp-soka-compressor-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/low_rank/soka_compressor.py
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
