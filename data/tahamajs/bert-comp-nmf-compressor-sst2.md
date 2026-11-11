# tahamajs/bert-comp-nmf-compressor-sst2

## Resumen

`tahamajs/bert-comp-nmf-compressor-sst2` es un checkpoint de BERT-base comprimido físicamente mediante la técnica `NMFCompressor` (descomposición no negativa de matrices de bajo rango) e "injertado" con adaptadores LoRA para recuperar precisión. Lo publica Taha Majlesi como parte del proyecto NeuralOps Compressor Zoo, un conjunto de herramientas de compresión de modelos de código abierto. El modelo parte de `google-bert/bert-base-uncased` afinado previamente sobre GLUE SST-2 y lo reduce de 109,48 M a 67,02 M de parámetros (38,8 % de reducción, ratio físico 1,63x) manteniendo una precisión del 81,19 % en el split de validación de SST-2, frente al 91,63 % del modelo profesor original.

El interés del modelo no está en su rendimiento absoluto —sensiblemente inferior al BERT-base sin comprimir— sino en su valor como referencia metodológica: demuestra el pipeline completo de compresión NeuralOps, incluyendo la evaluación de múltiples rangos (k=256, 128, 64, 32) y la estrategia de "LoRA healing" que recupera entre 12 y 28 puntos de precisión tras la compresión destructiva. Es útil para investigadores que quieran reproducir o extender técnicas de compresión de bajo rango sobre transformers.

Arquitectónicamente es un transformer encoder estándar de 12 capas y dimensión oculta 768, sin modificaciones estructurales más allá de la sustitución de capas lineales por factores de bajo rango. La ventana de contexto heredada es de 512 tokens, típica de BERT-base. La licencia MIT y el formato de pesos PyTorch (`pytorch_model.bin`) facilitan su uso y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base) con capas lineales descompuestas por NMF de bajo rango |
| Parametros totales | 67.016.450 (comprimido); modelo base original: 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de bert-base-uncased) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en fp32/pytorch_model.bin) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`), requiere reconstrucción con `neuralops` |

## Arquitectura y entrenamiento

El modelo es un BERT-base estándar (12 capas, 768 dimensiones ocultas, 12 cabezas de atención) al que se le aplicó el compresor `NMFCompressor` de la librería NeuralOps. Esta técnica descompone las magnitudes de las matrices de pesos de las capas lineales en factores de bajo rango no negativos (NMF), preservando el patrón de signos del peso original. El checkpoint publicado corresponde al rango k=256, que reduce el número de parámetros un 38,79 % (ratio físico 1,634x).

Sobre el modelo comprimido se aplicó un proceso de "LoRA healing": adaptadores LoRA de rango r=8 entrenados durante 50 pasos con learning rate 2e-4 (presupuesto de 45 segundos) para recuperar precisión en la tarea objetivo. El entrenamiento original de BERT-base se realizó sobre el corpus BookCorpus + Wikipedia en inglés, y el afinamiento sobre SST-2 (GLUE) con 67.349 ejemplos de entrenamiento. No se especifican detalles sobre RLHF/DPO ni sobre la composición exacta del dataset de compresión. La evaluación se realizó en una NVIDIA RTX 3090 (24 GB) sobre 872 muestras de validación de SST-2.

## Capacidades

- Clasificación de sentimiento binaria (positivo/negativo) en inglés, específicamente afinada para SST-2.
- Generación de representaciones contextuales de texto en inglés (encoder BERT-base).
- Razonamiento semántico básico limitado a tareas de clasificación de secuencias.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (solo inglés, vocabulario `bert-base-uncased`).
- No dispone de modo thinking, visión ni audio.
- El modelo debe reconstruirse con la librería `neuralops` antes de la inferencia; no es cargable directamente con `transformers` sin ese paso.

## Casos de uso

- **Investigación en compresión de modelos**: sirve como referencia reproducible para comparar técnicas de compresión de bajo rango (NMF, SVD, pruning) sobre un transformer estándar, con métricas de precisión y ratio de compresión documentadas para cuatro rangos distintos.
- **Análisis de sentimiento en inglés a bajo coste**: puede desplegarse en entornos con restricciones de memoria (67 M de parámetros frente a 109 M) para clasificar reseñas o comentarios, aceptando la pérdida de ~10 puntos de precisión respecto al modelo profesor.
- **Docencia y experimentación con LoRA**: el pipeline de "healing" con LoRA de rango 8 y 50 pasos es un ejemplo didáctico de cómo recuperar precisión tras una compresión agresiva.
- **Prototipado rápido de pipelines de clasificación**: al heredar el tokenizador y la configuración de `bert-base-uncased`, se integra fácilmente en flujos existentes de NLP en inglés.
- **Benchmark de infraestructuras de inferencia**: útil para medir latencia y throughput de modelos comprimidos frente a sus originales en GPUs de consumo (RTX 3090, etc.).
- **Base para afinamiento posterior**: al ser un checkpoint comprimido con licencia MIT, puede reafinarse sobre otras tareas de clasificación en inglés, aunque con menor margen de precisión que el modelo original.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Modelo / Rango | Ratio físico | Params comprimidos | SST-2 zero-shot | SST-2 tras LoRA | Delta vs profesor (91,63 %) |
|---|---:|---:|---:|---:|---:|
| **k=256 (publicado)** | 1,63x | 67.016.450 | 69,61 % | **81,19 %** | -10,44 % |
| k=128 | 2,39x | 45.782.786 | 51,61 % | 75,92 % | -15,71 % |
| k=64 | 3,11x | 35.165.954 | 50,92 % | 78,56 % | -13,07 % |
| k=32 | 3,67x | 29.857.538 | 50,92 % | 76,95 % | -14,68 % |
| BERT-base profesor | 1,00x | 109.483.778 | — | 91,63 % | — |

Evaluación sobre 872 muestras de validación de GLUE SST-2 en NVIDIA RTX 3090 (24 GB). No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (67 M de parámetros ≈ 268 MB de pesos, más activaciones y buffers); holgado en cualquier GPU consumer.
- GPU recomendadas: RTX 3090 (usada en la evaluación), RTX 4090, A100, H100; cualquier GPU con ≥ 2 GB de VRAM es suficiente.
- Cabe en GPUs consumer: sí, en cualquier GPU moderna (GTX 1060 6 GB o superior) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: requiere `neuralops` para reconstruir la topología comprimida y cargar el state dict; posteriormente puede servirse con PyTorch nativo o exportarse a ONNX. No es compatible directamente con vLLM, llama.cpp, Ollama o TGI sin conversión previa.
- Latencia y throughput: no disponibles en la información proporcionada; el autor menciona un presupuesto de 45 s para el proceso de LoRA healing en RTX 3090, pero no reporta métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Params | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| `tahamajs/bert-comp-nmf-compressor-sst2` (k=256) | 67,0 M | 512 | 81,19 % | MIT | Hugging Face (requiere `neuralops`) |
| `google-bert/bert-base-uncased` (profesor, afinado SST-2) | 109,5 M | 512 | 91,63 % | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66,9 M | 512 | ~91 % (referencia pública) | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | 109,5 M | 512 | ~92 % (referencia pública) | Apache 2.0 | Hugging Face |

La comparación con DistilBERT es especialmente relevante: mismo orden de parámetros (~67 M) pero con una pérdida de precisión mucho menor en el modelo destilado. Esto sugiere que la compresión NMF de bajo rango, tal como se aplica aquí, no es competitiva en precisión frente a la destilación para el mismo presupuesto de parámetros, si bien el objetivo del checkpoint es demostrar el pipeline de NeuralOps más que maximizar rendimiento.

## Limitaciones y advertencias

- Pérdida de precisión significativa: 10,44 puntos por debajo del profesor en SST-2, lo que limita su uso en producción real donde se requiera alta exactitud.
- Solo inglés: el vocabulario y el afinamiento están restringidos a `bert-base-uncased` y SST-2; no es adecuado para otros idiomas ni dominios sin reafinamiento.
- Requiere la librería `neuralops` para reconstruir la topología comprimida; no es cargable con `transformers` de forma estándar, lo que añade fricción de integración.
- Riesgo de alucinación: inherente a los modelos de lenguaje, aunque en una tarea de clasificación binaria el riesgo se manifiesta como clasificaciones erróneas más que como texto inventado.
- Sesgos: hereda los sesgos de BERT-base entrenado sobre BookCorpus + Wikipedia; no se documentan análisis de sesgo específicos para este checkpoint.
- Licencia MIT: permite uso comercial, pero el modelo base `bert-base-uncased` está bajo Apache 2.0 y el autor no detalla posibles restricciones derivadas de la combinación.
- Checkpoint con 0 descargas y 0 likes en el momento de la ficha: no hay validación comunitaria ni reportes independientes de rendimiento.
- La evaluación se realizó sobre 872 muestras de validación; la varianza estadística de esta muestra no se reporta, por lo que las diferencias entre rangos (p. ej. k=64 con 78,56 % frente a k=128 con 75,92 %) deben tomarse con cautela.
- No se documentan métricas de latencia, throughput ni consumo de memoria en inferencia, lo que dificulta planificar despliegues en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tahamajs/bert-comp-nmf-compressor-sst2
- Repositorio NeuralOps (GitHub): https://github.com/tahamajs/NeuralOps
- Implementación del compresor NMF: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/low_rank/nmf_compressor.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
