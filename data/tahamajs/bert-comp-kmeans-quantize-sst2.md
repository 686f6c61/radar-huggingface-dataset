# tahamajs/bert-comp-kmeans-quantize-sst2

## Resumen

`tahamajs/bert-comp-kmeans-quantize-sst2` es un checkpoint comprimido de `google-bert/bert-base-uncased` afinado para clasificación de sentimiento binaria en GLUE SST-2. Lo publica Taha Majlesi (usuario `tahamajs`) dentro del proyecto NeuralOps, una librería de compresión de modelos que agrupa un "compressor zoo" con técnicas como cuantización por clustering KMeans, descomposición de bajo rango y recuperación mediante LoRA. El modelo aplica el compresor `kmeans_quantize` (`kmeans_factory`) con rango de showcase `k=32`, reduciendo los parámetros de 109,48 M a 24,57 M (un 77,56 % menos, ratio físico de 4,456x).

El problema que aborda es el de la compresión agresiva de encoders BERT manteniendo la precisión downstream: según la model card, el modelo comprimido alcanza un 91,74 % de accuracy en la validación de SST-2, frente al 91,63 % del profesor original, es decir, una paridad de +0,11 puntos. Es relevante para quienes despliegan clasificadores BERT en entornos con restricciones de memoria o latencia y quieren evaluar técnicas de compresión con telemetría reproducible.

La arquitectura subyacente es BERT-base (transformer encoder, 12 capas, dimensión oculta 768), adaptada a clasificación con 2 etiquetas. El repositorio ocupa 0,2 GB y los pesos se serializan en `pytorch_model.bin`. La licencia es MIT. No se dispone de información sobre longitud de contexto nativa más allá de la estándar de BERT (512 tokens), ni sobre cuantizaciones GGUF u otros formatos de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base), 12 capas, dimensión oculta 768 |
| Parametros totales | 24.567.554 (comprimido); profesor original: 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (BERT-base estándar: 512 tokens) |
| Tipos de cuantizacion | Cuantización por clustering KMeans (`kmeans_quantize`, `kmeans_factory`) con estimación de gradiente STE |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (PyTorch state dict); tokenizer en `vocab.txt`, `tokenizer.json`, `tokenizer_config.json` |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased`, un transformer encoder de 12 capas y dimensión 768, afinado previamente para clasificación de sentimiento en GLUE SST-2 con 2 etiquetas. Sobre ese checkpoint se aplica el compresor `kmeans_quantize` de NeuralOps, que implementa clustering KMeans 1D vectorizado tipo Lloyd-Max sobre los tensores de pesos, con estimación de gradiente mediante straight-through estimator (STE). El resultado es una topología físicamente comprimida con 24.567.554 parámetros, un 77,56 % menos que el profesor.

La model card reporta una evaluación multi-rango en `k=256, 128, 64 y 32` sobre el split de validación de SST-2 (872 muestras) en una NVIDIA GeForce RTX 3090 (24 GB). Para cada rango se aplica, si la caída zero-shot supera el 2,0 % con reducción mayor a 1,10x, un "healing" LoRA dirigido con `r=8`, 50 pasos, `lr=2e-4` y un presupuesto de 45 segundos. En los cuatro rangos evaluados el resultado es idéntico: 91,74 % de accuracy zero-shot y tras healing, con paridad de +0,11 % frente al profesor (91,63 %). El checkpoint serializado en el repositorio corresponde al rango `k=32` y, según la tabla, no requirió recuperación LoRA (`LoRA Recovery Applied: False`).

## Capacidades

- Clasificación de sentimiento binaria (negativo/positivo) en inglés, sobre textos tipo reseña.
- Clasificación de texto corto con la cabeza `BertForSequenceClassification` (2 etiquetas).
- Inferencia en CPU y GPU con PyTorch y Transformers, reconstruyendo la topología comprimida con `compress_model` de NeuralOps.
- Tokenización estándar `bert-base-uncased` (vocabulario WordPiece, minúsculas).
- No soporta tool calling, function calling ni agentes.
- No soporta razonamiento multi-paso, matemáticas, código ni visión.
- Capacidad multilingüe limitada al inglés (el vocabulario uncased de BERT incluye algunos tokens de otros idiomas, pero el modelo no está entrenado para ellos).
- No dispone de modo "thinking", audio ni otras modalidades.

## Casos de uso

- Moderación de reseñas de producto: clasificar automáticamente reseñas de e-commerce como positivas o negativas para enrutar quejas a atención al cliente; el modelo comprimido ocupa una fracción de la memoria del BERT original y mantiene la precisión.
- Análisis de sentimiento en redes sociales: procesar lotes de tuits o comentarios en inglés con un clasificador de 24,6 M de parámetros que puede ejecutarse en CPU en entornos sin GPU.
- Filtrado previo en pipelines de NLP: usar el modelo como primera etapa para descartar o priorizar textos antes de pasarlos a un LLM más grande, reduciendo coste computacional.
- Despliegue en dispositivos de borde: con 24,6 M de parámetros y 209 MB de pesos, es viable en dispositivos con poca memoria (Raspberry Pi, móviles de gama alta) para clasificación local de opiniones.
- Investigación en compresión de modelos: servir como checkpoint de referencia para reproducir la evaluación Pareto multi-rango de NeuralOps y comparar técnicas de cuantización.
- Monitorización de opinión de marca: clasificar menciones en inglés de una marca en tiempo casi real con un modelo ligero que cabe holgadamente en una GPU consumer.
- Evaluación comparativa de compressores: usar el `compression_summary.json` y los cuatro rangos evaluados como banco de pruebas para medir el impacto de KMeans frente a otras técnicas del zoo.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Modelo | Dataset | Split | Métrica | Valor |
|---|---|---|---|---|
| `bert-comp-kmeans-quantize-sst2` (k=32) | GLUE SST-2 | validation | Accuracy | 91,74 % |
| Profesor `bert-base-uncased` SST-2 | GLUE SST-2 | validation | Accuracy | 91,63 % |

Evaluación multi-rango reportada por el autor (RTX 3090, 872 muestras de validación):

| Rango (k) | Ratio físico | Parámetros comprimidos | Accuracy zero-shot | Accuracy tras healing | Paridad vs profesor |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 4,46x | 24.567.554 (-77,6 %) | 91,74 % | 91,74 % | +0,11 % |
| 128 | 4,46x | 24.567.554 (-77,6 %) | 91,74 % | 91,74 % | +0,11 % |
| 64 | 4,46x | 24.567.554 (-77,6 %) | 91,74 % | 91,74 % | +0,11 % |
| 32 (checkpoint) | 4,46x | 24.567.554 (-77,6 %) | 91,74 % | 91,74 % | +0,11 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible; el modelo no está orientado a esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 24,6 M de parámetros y pesos de 209 MB, la inferencia en FP32 requiere del orden de 0,25-0,5 GB incluyendo activaciones y overhead de runtime.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; funciona en RTX 3090, RTX 4090, A100, H100 y GPUs integradas.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en iGPU; también en CPU.
- Opciones de despliegue: PyTorch + Transformers con la librería NeuralOps para reconstruir la topología comprimida (según el Quick Start de la model card). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y no se ofrecen pesos GGUF.
- Latencia y throughput: no disponibles en la información proporcionada. La model card menciona un presupuesto de 45 s para el healing LoRA, pero no reporta latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-comp-kmeans-quantize-sst2` | 24,57 M (comprimido) | no disponible | 91,74 % | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor) | 109,48 M | 512 tokens | 91,63 % (según el autor) | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased` | 66 M | 512 tokens | no disponible en la información | Apache 2.0 | Hugging Face |
| `prajjwal1/bert-tiny` | 4,4 M | 512 tokens | no disponible en la información | Apache 2.0 | Hugging Face |

La comparación se limita a referencias de tamaño y licencia; no se dispone de resultados SST-2 verificados de los modelos alternativos en la información proporcionada, por lo que no se incluyen cifras de rendimiento para ellos.

## Limitaciones y advertencias

- El modelo solo clasifica sentimiento binario en inglés; no es un modelo generativo ni sirve para otras tareas sin reentrenamiento.
- Los resultados (91,74 % de accuracy) están declarados por el autor y marcados como `verified: false`; no han sido reproducidos de forma independiente.
- La tabla multi-rango muestra resultados idénticos para k=256, 128, 64 y 32, lo que resulta llamativo y conviene tratar con cautela hasta verificar la telemetría de `compression_summary.json`.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador), pero sí puede producir predicciones erróneas en textos ambiguos, sarcasmo, dominios distintos al de reseñas o inglés no estándar.
- Sesgos heredados de `bert-base-uncased` y de los datos de GLUE SST-2 (reseñas de películas), que pueden no generalizar a otros dominios.
- La licencia MIT permite uso comercial, pero el modelo base `google-bert/bert-base-uncased` se distribuye bajo Apache 2.0; conviene revisar ambas.
- Requiere la librería NeuralOps y un paso de reconstrucción de la topología comprimida antes de cargar el state dict; no es un checkpoint estándar cargable directamente con `from_pretrained` sin ese paso.
- No se ofrecen pesos en formatos GGUF u ONNX, lo que limita el despliegue con runtimes alternativos.
- Sin datos de latencia ni throughput publicados, no se puede garantizar un SLA de producción sin medirlo previamente.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/bert-comp-kmeans-quantize-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación del compresor KMeans: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/quantization/kmeans_quantize.py
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
