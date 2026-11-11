# tahamajs/bert-comp-ast-pruner-sst2

## Resumen

`tahamajs/bert-comp-ast-pruner-sst2` es un checkpoint de `google-bert/bert-base-uncased` (12 capas, dimensión oculta 768, 109.483.778 parámetros) afinado sobre GLUE SST-2 y posteriormente procesado con el motor de compresión `ASTPruner` de la librería NeuralOps. El autor es Taha Majlesi (usuario `tahamajs`) y el modelo forma parte de un zoo de compresión denominado "NeuralOps Compressor Zoo", orientado a evaluar técnicas de poda semi-estructurada con recuperación LoRA.

El resultado declarado es, sin embargo, muy limitado: la precisión en validación de SST-2 cae al 51,38 % frente al 91,63 % del modelo profesor, una degradación de 40,25 puntos. Además, el checkpoint empaquetado presenta una ratio de compresión de 1,00x (0,0 % de parámetros eliminados) en todos los rangos evaluados (k=256, 128, 64 y 32), lo que indica que la poda no llegó a materializarse físicamente en el artefacto publicado. Es relevante como caso de estudio de un pipeline de compresión fallido más que como modelo listo para producción.

El modelo se distribuye bajo licencia MIT, solo soporta inglés y está etiquetado para la tarea de clasificación de texto (análisis de sentimiento binario). Su tamaño de repositorio es de 0,4 GB y depende de la librería `neuralops` para reconstruir la topología comprimida antes de cargar los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base), 12 capas, D=768 |
| Parametros totales | 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (BERT-base estándar: 512 tokens) |
| Tipos de cuantizacion | no disponible (checkpoint en `pytorch_model.bin`, sin variantes GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (PyTorch state dict) + `config.json` + `compression_summary.json` + assets de tokenizer BERT |

## Arquitectura y entrenamiento

La arquitectura base es BERT-base uncased, un transformer encoder de 12 capas con 768 dimensiones ocultas y 12 cabezas de atención, preentrenado por Google y afinado por el autor sobre GLUE SST-2 para clasificación binaria de sentimiento. Sobre ese modelo se aplica `ASTPruner`, descrito en la model card como "vectorized semi-structured 2:4 / N:M pruning with empirical Jacobian calibration, PCA coordinate rotation, and Soft Straight-Through Estimator (STE)". El pipeline evalúa cuatro rangos de poda (k=256, 128, 64, 32) y, cuando la caída de precisión supera el 2 % con una reducción superior a 1,10x, aplica un "healing" con LoRA de rango r=8, 50 pasos, learning rate 2e-4 y un presupuesto de 45 segundos.

En la práctica, ninguno de los cuatro rangos produjo reducción de parámetros (todos reportan 109.483.778 parámetros y ratio 1,00x), y la precisión se mantuvo en 51,38 % tanto en zero-shot como tras el healing LoRA. La evaluación se realizó sobre la partición de validación de SST-2 con 872 muestras en una NVIDIA GeForce RTX 3090 (24 GB). No se documentan detalles sobre el dataset de afinado original (número de épocas, hiperparámetros del fine-tuning previo a la compresión) ni sobre el proceso de calibración Jacobiana más allá de la descripción cualitativa.

## Capacidades

- Clasificación de texto binaria (sentimiento positivo/negativo) sobre inglés, específicamente entrenada para GLUE SST-2.
- Generación de texto: no soportada (es un encoder con cabeza de clasificación).
- Razonamiento, código y matemáticas: no soportadas.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: no soportadas (solo inglés).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Estudio de pipelines de compresión: el checkpoint sirve como referencia para analizar por qué un esquema de poda semi-estructurada con calibración Jacobiana y rotación PCA no logra reducir parámetros en la práctica, y cómo se comporta la precisión cuando el "healing" LoRA no recupera el rendimiento del profesor.
- Docencia e investigación en compresión de modelos: útil para ilustrar la brecha entre la precisión del profesor (91,63 %) y la del estudiante comprimido (51,38 %) en una tarea saturada como SST-2.
- Reproducción de experimentos NeuralOps: permite validar la API `compress_model` y el flujo de reconstrucción de topología descrito en la model card antes de aplicar el pipeline a otros checkpoints.
- Análisis de sentimiento en inglés con requisitos de baja precisión: en escenarios donde un clasificador cercano al azar (51,38 % en una tarea binaria) sea aceptable como línea base o para pruebas de integración, el modelo puede desplegarse sin más.
- Benchmarking de infraestructura de inferencia: al ser un BERT-base estándar en tamaño, sirve para medir latencia y throughput de frameworks (PyTorch, ONNX Runtime, vLLM) sin que la compresión introduzca variabilidad.
- Comparación de técnicas de poda: como miembro del zoo, permite contrastar `ast_pruner` con otros compresores del mismo repositorio bajo condiciones idénticas de evaluación (RTX 3090, 872 muestras de validación).

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index y en la model card:

| Modelo / variante | Dataset | Métrica | Valor |
|---|---|---|---|
| Profesor (`bert-base-uncased` afinado SST-2) | GLUE SST-2 (validación) | Accuracy | 91,63 % |
| `bert-comp-ast-pruner-sst2` (k=256) | GLUE SST-2 (validación) | Accuracy | 51,38 % |
| `bert-comp-ast-pruner-sst2` (k=128) | GLUE SST-2 (validación) | Accuracy | 51,38 % |
| `bert-comp-ast-pruner-sst2` (k=64) | GLUE SST-2 (validación) | Accuracy | 51,38 % |
| `bert-comp-ast-pruner-sst2` (k=32) | GLUE SST-2 (validación) | Accuracy | 51,38 % |

El valor de 51,38 % está marcado como `verified: false` en el model-index. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,5 GB en FP32 (109,5 M de parámetros × 4 bytes ≈ 438 MB), más activaciones y overhead del runtime. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM libre; el autor reporta evaluaciones en NVIDIA GeForce RTX 3090 (24 GB), aunque el modelo es sobredimensionado para esa tarjeta.
- Cabe en GPU consumer: sí, en GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090, etc. También en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch nativo con `transformers` + `neuralops` (flujo documentado en la model card); ONNX Runtime tras exportación; no se publican artefactos GGUF, por lo que llama.cpp y Ollama no son viables sin conversión manual. vLLM y TGI no están documentados para este checkpoint.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (validación) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-comp-ast-pruner-sst2` | 109,5 M | no disponible (BERT-base: 512) | 51,38 % | MIT | Hugging Face, requiere `neuralops` |
| `google-bert/bert-base-uncased` (profesor) | 109,5 M | 512 | 91,63 % (según el autor) | Apache 2.0 | Hugging Face, transformers estándar |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 | ~91 % (referencia pública) | Apache 2.0 | Hugging Face, transformers estándar |
| `textattack/bert-base-uncased-SST-2` | 109,5 M | 512 | ~92 % (referencia pública) | Apache 2.0 | Hugging Face, transformers estándar |

La comparativa muestra que el checkpoint comprimido no ofrece ninguna ventaja en tamaño (ratio 1,00x) y pierde más de 40 puntos de precisión frente al profesor y frente a alternativas públicas de tamaño similar o menor. Los valores de los modelos de referencia son aproximados y provienen de sus respectivas model cards públicas, no de una evaluación conjunta en la información disponible.

## Limitaciones y advertencias

- Precisión muy degradada: 51,38 % en una tarea binaria equivale prácticamente a un clasificador aleatorio; no es apto para uso en producción real.
- Compresión no efectiva: el checkpoint empaquetado reporta 1,00x de ratio y 0,0 % de reducción de parámetros en todos los rangos, por lo que no cumple el objetivo declarado del zoo.
- El "healing" LoRA no recupera rendimiento: la precisión es idéntica antes y después del healing en los cuatro rangos evaluados.
- Dependencia de la librería `neuralops`: la carga requiere reconstruir la topología con `compress_model` antes de aplicar el state dict; no es un checkpoint estándar de `transformers` plug-and-play.
- Solo inglés: no soporta otros idiomas.
- Sesgos: no documentados por el autor; al derivar de BERT-base uncased, hereda los sesgos conocidos de su corpus de preentrenamiento (BooksCorpus + Wikipedia en inglés).
- Riesgo de alucinación: no aplica en sentido estricto (es un clasificador), pero la calibración de probabilidades es dudosa dado el bajo rendimiento.
- Licencia MIT: permite uso comercial, pero el estado del modelo desaconseja cualquier despliegue productivo.
- Sin verificación independiente: el resultado de 51,38 % está marcado como `verified: false` y no hay benchmarks adicionales publicados.
- Fecha de creación futura (2026-11-10): conviene tratar los metadatos con cautela.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/bert-comp-ast-pruner-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de `ASTPruner`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/pruning/ast_pruner.py
- Licencia del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
