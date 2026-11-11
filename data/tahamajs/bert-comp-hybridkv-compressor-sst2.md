# tahamajs/bert-comp-hybridkv-compressor-sst2

## Resumen

`bert-comp-hybridkv-compressor-sst2` es un checkpoint de BERT-Base (`google-bert/bert-base-uncased`) afin-tuneado en GLUE SST-2 y posteriormente comprimido mediante el motor `HybridKVCompressor` de la librería NeuralOps, desarrollada por Taha Majlesi. El modelo forma parte de un "compressor zoo" que evalúa distintas técnicas de compresión sobre arquitecturas transformer y publica los checkpoints resultantes con sus métricas asociadas. En este caso concreto, la compresión se aplica en el rango `k=128` y se complementa con un proceso de "LoRA healing" para recuperar parte de la precisión perdida.

El modelo resuelve una tarea muy acotada: clasificación binaria de sentimiento en inglés sobre el corpus SST-2 (Stanford Sentiment Treebank). Su interés no está en la capacidad generalista —es un BERT-Base de 12 capas y 768 dimensiones ocultas— sino en servir como referencia reproducible de cuánto se puede reducir un modelo (~12,9 % de parámetros) manteniendo una precisión cercana al profesor original (89,68 % frente a 91,63 %). Es, por tanto, una pieza útil para investigadores que estudian compresión de modelos y para desarrolladores que quieran integrar un clasificador de sentimiento ligero.

El checkpoint ocupa unos 0,2 GB en el repositorio de Hugging Face y se distribuye bajo licencia MIT. La fecha de creación indicada en el repositorio es 2026-11-10, lo que sitúa el modelo en el contexto de la colección NeuralOps publicada ese año.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Base), 12 capas, dimensión oculta 768 |
| Parámetros totales | 95.332.610 (modelo comprimido); 109.483.778 en el profesor original |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el profesor BERT-Base soporta hasta 512 tokens; el autor no lo declara explícitamente) |
| Tipos de cuantización | No disponible (el checkpoint se distribuye en `pytorch_model.bin`, sin variantes GGUF ni cuantizadas publicadas) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`) |

## Arquitectura y entrenamiento

La arquitectura base es BERT-Base uncased: un transformer encoder de 12 capas con 768 dimensiones ocultas, 12 cabezas de atención y 109.483.778 parámetros. Sobre esta base, el autor aplica el compresor `HybridKVCompressor`, que clasifica las cabezas de proyección en tipos estáticos y dinámicos y adjunta instancias de `HybridKVCache` a las capas de atención. Según la model card, este compresor no modifica los pesos del modelo, sino que reorganiza el almacenamiento de la caché KV. El resultado es una reducción física del 12,93 % de parámetros (1,148x de ratio de compresión) en el rango `k=128`.

El afinamiento original se realizó sobre GLUE SST-2, y tras la compresión se aplicó un proceso de "LoRA healing" con rango `r=8`, 50 pasos y tasa de aprendizaje `2e-4` (presupuesto de 45 segundos) para recuperar precisión. La evaluación se llevó a cabo físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre las 872 muestras del split de validación de SST-2. El autor reporta una precisión zero-shot tras compresión del 84,40 %, que sube al 89,68 % tras el healing, frente al 91,63 % del profesor sin comprimir (delta de -1,95 puntos). No se especifica el número de tokens de entrenamiento ni la composición completa del dataset más allá de GLUE SST-2.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés sobre textos tipo SST-2.
- Generación de logits de dos clases para integrarse en pipelines de `text-classification`.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- Capacidad multilingüe limitada al inglés (el tokenizador es `bert-base-uncased`).
- No dispone de modo "thinking", visión, audio ni otras modalidades.
- Compatible con el ecosistema Hugging Face `transformers` una vez reconstruida la topología comprimida con NeuralOps.

## Casos de uso

- Análisis de sentimiento en reseñas de producto: el modelo clasifica críticas cortas en positivo/negativo con un 89,68 % de precisión en SST-2, suficiente para agregar métricas de satisfacción a escala.
- Monitorización de opinión en redes sociales: al ser un modelo de 95 M de parámetros, puede desplegarse en CPU o GPU de gama baja para procesar grandes volúmenes de tuits o comentarios en inglés.
- Filtrado previo en pipelines de moderación: como clasificador ligero, puede descartar contenido claramente negativo antes de pasarlo a un modelo mayor, reduciendo coste computacional.
- Investigación en compresión de modelos: sirve como baseline reproducible para comparar técnicas de compresión (HybridKV frente a pruning, quantización o destilación) sobre la misma tarea y dataset.
- Docencia y experimentación: el repositorio incluye `compression_summary.json` con telemetría de los rangos `k=256, 128, 64, 32`, lo que permite estudiar el compromiso precisión/compresión sin reentrenar.
- Evaluación de "LoRA healing": el checkpoint permite reproducir el efecto de un ajuste LoRA de 50 pasos sobre un modelo comprimido, útil para investigar técnicas de recuperación de precisión.
- Clasificador embebido en aplicaciones de bajo consumo: con 0,2 GB de pesos, puede integrarse en servicios con restricciones de memoria donde un BERT completo no cabría.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Rank (k) | Ratio físico | Parámetros comprimidos (reducción) | Precisión zero-shot | Precisión con LoRA | Delta vs profesor (91,63 %) |
|---|---|---|---|---|---|
| 256 | 1,15x | 95.332.610 (-12,9 %) | 84,40 % | 89,68 % | -1,95 % |
| 128 (publicado) | 1,15x | 95.332.610 (-12,9 %) | 84,40 % | 89,68 % | -1,95 % |
| 64 | 1,19x | 91.791.362 (-16,2 %) | 72,59 % | 85,09 % | -6,54 % |
| 32 | 1,22x | 90.020.738 (-17,8 %) | 56,31 % | 79,93 % | -11,70 % |

Evaluación sobre el split de validación de GLUE SST-2 (872 muestras) en una RTX 3090. El profesor sin comprimir alcanza 91,63 % de precisión.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 (95 M de parámetros, ~380 MB de pesos) y en torno a 0,5 GB con overhead de activaciones para lotes pequeños.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor validó en una RTX 3090, pero el modelo cabe holgadamente en GTX 1650, RTX 3050 o incluso en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en Raspberry Pi o entornos CPU-only para inferencia por lotes.
- Opciones de despliegue: el modelo requiere reconstruir la topología con `neuralops` antes de cargar el `state_dict`; una vez reconstruido, es compatible con `transformers` y puede servirse con FastAPI, TorchServe o un endpoint de Hugging Face Inference. No se han publicado variantes GGUF para llama.cpp ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bert-comp-hybridkv-compressor-sst2` (este) | 95,3 M (comprimido) | No disponible | 89,68 % (con LoRA) | MIT | Hugging Face |
| `google-bert/bert-base-uncased` afinado en SST-2 | 109,5 M | 512 tokens | 91,63 % (profesor reportado) | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased` afinado en SST-2 | ~66 M | 512 tokens | No disponible en esta información | Apache 2.0 | Hugging Face |
| `roberta-base` afinado en SST-2 | ~125 M | 512 tokens | No disponible en esta información | MIT | Hugging Face |

La comparación con DistilBERT y RoBERTa no puede completarse con datos de esta ficha porque el autor no los incluye; se indican como referencia de categoría.

## Limitaciones y advertencias

- El modelo solo clasifica sentimiento binario en inglés; no es un modelo generativo ni un asistente conversacional.
- La precisión cae drásticamente en rangos de compresión agresivos: en `k=32` el modelo baja al 79,93 % incluso tras LoRA, lo que lo hace poco fiable para producción.
- El checkpoint publicado requiere reconstruir la topología con la librería `neuralops` antes de cargar los pesos; no es un `transformers` estándar de un solo paso.
- Riesgo de alucinación no aplica en sentido estricto (es clasificación), pero sí puede producir etiquetas erróneas en dominios distintos de SST-2 (por ejemplo, opiniones sobre servicios o textos largos).
- Sesgos heredados de BERT-Base uncased: el corpus de entrenamiento original (Wikipedia y BooksCorpus) puede introducir sesgos de género, raza o dominio.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios fuera de SST-2.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en el model-index).
- El contexto máximo no se declara explícitamente; se asume el del profesor (512 tokens), pero textos más largos requerirán truncado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-hybridkv-compressor-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/kv_cache/hybridkv_compressor.py
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
