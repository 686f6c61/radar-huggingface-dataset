# tahamajs/bert-comp-drone-compressor-sst2

## Resumen

`tahamajs/bert-comp-drone-compressor-sst2` es un checkpoint de BERT-Base (`google-bert/bert-base-uncased`) afinado para clasificación de sentimiento en GLUE SST-2 y posteriormente comprimido mediante el motor `DRONECompressor` de la librería NeuralOps. El modelo lo publica Taha Majlesi (usuario `tahamajs`) como parte de un "Compressed & LoRA-Healed Model Zoo" que demuestra técnicas de compresión low-rank con recuperación opcional mediante LoRA. No es un modelo fundacional nuevo: es un artefacto de investigación sobre compresión de modelos.

La compresión aplicada es un SVD data-aware con ponderación identidad, seleccionado en el punto de Pareto `k=256`, que reduce los parámetros de 109.483.778 a 100.058.882 (un 8,61 % menos, ratio físico de 1,094x). El checkpoint empaquetado en este repositorio es el de `k=256` sin recuperación LoRA, con una precisión de validación en SST-2 del 90,94 % frente al 91,63 % del profesor original (delta de -0,69 puntos). El repositorio incluye además telemetría de los rangos `k=128`, `k=64` y `k=32`, donde sí se aplicó LoRA healing.

Su relevancia es metodológica más que práctica: sirve como referencia reproducible para evaluar el compromiso entre ratio de compresión y degradación de accuracy en modelos BERT pequeños, y para estudiar cuándo merece la pena aplicar LoRA de recuperación. El modelo solo soporta inglés, tiene licencia MIT y se distribuye con pesos en formato PyTorch (`pytorch_model.bin`), no en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base (12 capas, dimensión oculta D=768), con factoring low-rank SVD data-aware aplicado por DRONECompressor |
| Parametros totales | 100.058.882 (comprimido); 109.483.778 en el modelo base original |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT-Base soporta 512 tokens, no confirmado explícitamente en la información) |
| Tipos de cuantizacion | no disponible (el repositorio distribuye pesos en `pytorch_model.bin`; no se documentan variantes GGUF, INT8 ni INT4) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch); no se incluyen safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es BERT-Base uncased: un transformer encoder de 12 capas con dimensión oculta 768, preentrenado por Google y aquí afinado sobre GLUE SST-2 (clasificación binaria de sentimiento, 2 etiquetas). Sobre ese modelo afinado se aplica `DRONECompressor`, un compresor de la familia `low_rank` que realiza SVD data-aware con ponderación identidad (equivalente a un SVD estándar independiente de datos) usando la misma adaptación de rango, restricciones de parámetros y mecanismo de fallback que AASVD. El resultado es una factorización de baja rank con `k=256` que reduce el número de parámetros en un 8,61 %.

El proceso de compresión se evaluó en cuatro rangos (`k=256, 128, 64, 32`) sobre el split de validación de SST-2 (872 muestras) en una NVIDIA GeForce RTX 3090. La política de NeuralOps aplica LoRA healing (`r=8`, 50 pasos, `lr=2e-4`, presupuesto de 45 s) cuando la compresión zero-shot degrada la accuracy más de 2,0 puntos con una reducción superior a 1,10x. En `k=256` no se activó el healing (la degradación fue de solo 0,69 puntos); en `k=128`, `k=64` y `k=32` sí se aplicó y se reportan las accuracy healed. No se documentan en la información disponible detalles sobre el dataset de entrenamiento original más allá de GLUE SST-2, ni sobre uso de RLHF/DPO (irrelevante en un clasificador).

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés, entrenada sobre GLUE SST-2.
- Generación de logits de 2 clases vía `BertForSequenceClassification` con `num_labels=2`.
- Inferencia estándar en PyTorch/Transformers tras reconstruir la topología comprimida con `neuralops.core.compression_pipeline.compress_model`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta visión, audio ni modo "thinking".
- Capacidad multilingüe limitada al inglés (modelo `uncased` de BERT-Base).
- No es un modelo generativo: no produce texto libre, solo etiquetas de clasificación.

## Casos de uso

- Clasificación de sentimiento en reseñas de producto o comentarios en inglés: el modelo devuelve una etiqueta binaria por texto con una accuracy de validación del 90,94 % en SST-2, suficiente para filtrado automático a gran escala en pipelines de moderación o análisis de opinión.
- Investigación en compresión de modelos: sirve como checkpoint de referencia para reproducir el pipeline DRONECompressor y comparar curvas de Pareto (ratio de compresión vs accuracy) frente a otros compresores de NeuralOps.
- Evaluación de LoRA healing: el repositorio incluye telemetría de `k=128`, `k=64` y `k=32` con y sin healing, lo que permite estudiar empíricamente cuándo la recuperación LoRA compensa la pérdida de accuracy (de 80,50 % a 86,47 % en `k=128`, por ejemplo).
- Baseline de clasificación ligera en entornos con restricciones de memoria: con 100 M de parámetros y pesos de 191 MB, cabe en GPU de consumo y puede desplegarse en CPU para tareas de sentimiento de baja latencia.
- Docencia y demostraciones de técnicas low-rank: el `compression_summary.json` y el script de reconstrucción del README facilitan explicar SVD data-aware y factoring de pesos en un caso real.
- Componente en pipelines de análisis de opinión a nivel de documento o frase: al ser un clasificador BERT estándar, se integra con `transformers` y puede encadenarse con tokenizadores y agregadores existentes en producción.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados independientemente):

| Rank (k) | Ratio fisico | Parametros comprimidos (reduccion) | Accuracy zero-shot | Accuracy healed | Delta vs profesor (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| **256** (empaquetado) | 1,09x | 100.058.882 (-8,6 %) | 90,94 % | 90,94 % | -0,69 % |
| 128 | 1,21x | 90.615.554 (-17,2 %) | 80,50 % | 86,47 % (LoRA) | -5,16 % |
| 64 | 1,27x | 85.893.890 (-21,5 %) | 66,17 % | 80,28 % (LoRA) | -11,35 % |
| 32 | 1,31x | 83.533.058 (-23,7 %) | 56,88 % | 79,13 % (LoRA) | -12,50 % |

Evaluación realizada sobre el split de validación de GLUE SST-2 (872 muestras) en una NVIDIA GeForce RTX 3090 (24 GB). El profesor (`bert-base-uncased` afinado en SST-2 sin comprimir) alcanza 91,63 % de accuracy.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 191 MB en `pytorch_model.bin` (FP32), por lo que la inferencia requiere aproximadamente 0,4-0,5 GB de VRAM contando activaciones y overhead de PyTorch.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; se ha validado en RTX 3090, pero funciona en GTX 1650, RTX 3060, T4, etc.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna de consumo (RTX 20xx/30xx/40xx, incluso integradas con suficiente memoria compartida).
- También ejecutable en CPU sin problemas por su tamaño reducido.
- Opciones de despliegue: el README solo documenta el flujo con `transformers` + `neuralops` (reconstrucción de topología comprimida y carga del state dict). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al no haber pesos GGUF no es directamente compatible con llama.cpp/Ollama sin conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `tahamajs/bert-comp-drone-compressor-sst2` (k=256) | 100,1 M | no disponible | 90,94 % | MIT | Hugging Face |
| `google-bert/bert-base-uncased` afinado en SST-2 (profesor) | 109,5 M | 512 tokens | 91,63 % | Apache 2.0 | Hugging Face |
| BERT-Base sin comprimir (referencia) | 109,5 M | 512 tokens | 91,63 % (profesor) | Apache 2.0 | Hugging Face |
| Variantes comprimidas del mismo zoo (k=128, k=64, k=32) | 83,5-90,6 M | no disponible | 79,13-86,47 % (healed) | MIT | Hugging Face |

La comparativa directa con otros clasificadores de sentimiento (RoBERTa, DistilBERT, DeBERTa) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo clasifica sentimiento binario en inglés; no es un modelo generativo ni un asistente conversacional.
- La accuracy declarada (90,94 %) no está verificada de forma independiente (`verified: false` en el model-index) y procede únicamente del autor.
- La compresión en `k=256` no aplicó LoRA healing, por lo que la pérdida de 0,69 puntos frente al profesor es intrínseca a la factorización low-rank.
- Los rangos más agresivos (`k=128`, `k=64`, `k=32`) solo alcanzan precisiones utilizables tras aplicar LoRA healing; sin él, la degradación es severa (hasta 56,88 % en `k=32`).
- Los pesos se distribuyen en `pytorch_model.bin`, formato no seguro para carga de modelos de terceros; conviene auditar el archivo antes de cargarlo.
- La reconstrucción requiere la librería `neuralops` y ejecutar `compress_model` con los mismos parámetros antes de cargar el state dict con `strict=False`, lo que añade fricción y riesgo de desalineación de claves.
- No hay pesos GGUF ni safetensors, lo que limita el despliegue en ecosistemas como llama.cpp u Ollama.
- Riesgo de alucinación: no aplica en sentido estricto al ser un clasificador, pero sí puede producir clasificaciones erróneas en dominios distintos de SST-2 (reseñas de películas), especialmente con sarcasmo, negaciones complejas o texto fuera de dominio.
- Licencia MIT: permite uso comercial y modificación, pero el modelo base `google-bert/bert-base-uncased` tiene su propia licencia Apache 2.0 que también debe respetarse.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-drone-compressor-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de DRONECompressor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/low_rank/drone_compressor.py
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
