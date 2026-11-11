# tahamajs/bert-comp-asvd-sst2

## Resumen

`bert-comp-asvd-sst2` es un checkpoint de `google-bert/bert-base-uncased` afinado para clasificación de sentimiento en GLUE SST-2 y posteriormente comprimido mediante la técnica ASVD (Activation-aware Singular Value Decomposition) implementada en la librería NeuralOps, desarrollada por Taha Majlesi. El modelo resultante se publica como demostración del "Compressor Zoo" de NeuralOps, un conjunto de utilidades para reducir el tamaño físico de transformers mediante descomposición de bajo rango con hooks de compresión de KV-cache.

El checkpoint empaquetado corresponde al rango `k=256`, que reduce los parámetros de 109.483.778 a 100.058.882 (un 8,61 % menos, ratio físico de compresión 1,094x). La precisión en el split de validación de SST-2 es del 90,14 %, frente al 91,63 % del modelo profesor sin comprimir, lo que supone una pérdida de 1,49 puntos porcentuales. En este rango no se aplicó "LoRA healing"; en rangos más agresivos (k=128, 64 y 32) el autor sí aplicó LoRA de recuperación con resultados notablemente peores.

El interés del modelo es fundamentalmente metodológico y de investigación: sirve como referencia reproducible de cómo se degrada un encoder BERT bajo compresión SVD a distintos rangos, y como ejemplo de integración con la librería NeuralOps. No está pensado para producción en clasificación de sentimiento de propósito general, dado que existen alternativas sin comprimir con mejor precisión y ecosistema de despliegue estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base (12 capas, dimensión oculta 768), comprimido con ASVD (descomposición en valores singulares con conciencia de activaciones) |
| Parámetros totales | 100.058.882 (comprimido); 109.483.778 en el modelo base |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT acepta hasta 512 tokens; el autor no lo especifica para el checkpoint comprimido) |
| Tipos de cuantización | no disponible (el checkpoint se distribuye en `pytorch_model.bin`, sin variantes GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch con factores de bajo rango y buffers de compresión); configuración en `config.json` con `compression_method: "asvd"` y `compression_rank: 256` |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased`, un transformer encoder de 12 capas y 768 dimensiones ocultas, preentrenado de forma auto-supervisada y afinado posteriormente sobre GLUE SST-2 como tarea de clasificación binaria de sentimiento. Sobre ese checkpoint se aplica el compresor `ASVDCompressor` de NeuralOps, que realiza una descomposición SVD de las matrices de pesos ponderada por la magnitud de las activaciones (de ahí "activation-aware"), truncando a rango `k=256`. El resultado es un modelo con 100.058.882 parámetros, un 8,61 % menos que el original, y un ratio de compresión físico de 1,094x.

El autor evaluó cuatro rangos (`k=256, 128, 64, 32`) sobre las 872 muestras de validación de SST-2 en una RTX 3090. La política de "LoRA healing" se activa cuando la compresión zero-shot degrada más de 2,0 puntos con una reducción superior a 1,10x; en esos casos se entrena un adaptador LoRA de rango 8 durante 50 pasos con `lr=2e-4` y un presupuesto de 45 segundos. En el checkpoint publicado (k=256) no se aplicó LoRA, según indica la model card. No se detalla la composición del dataset de afinado más allá de GLUE SST-2, ni se especifica si hubo RLHF/DPO (no aplicable en un encoder de clasificación).

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés, específicamente sobre el dominio y la distribución de GLUE SST-2.
- Inferencia estándar de un encoder BERT: extracción de representaciones contextuales de tokens y secuencias.
- Reconstrucción del grafo comprimido mediante `compress_model` de NeuralOps y carga del state dict con `strict=False`.
- No soporta tool calling ni function calling (es un modelo de clasificación, no un modelo generativo instruido).
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo "thinking", visión, audio ni capacidades multimodales.
- Capacidad multilingüe limitada al inglés; el vocabulario es el de `bert-base-uncased`.
- Sirve como banco de pruebas para estudiar el impacto de ASVD en precisión downstream a distintos rangos.

## Casos de uso

- Investigación sobre compresión de modelos: permite reproducir el pipeline ASVD de NeuralOps sobre un encoder conocido y comparar la curva precisión/rango (k=256, 128, 64, 32) con el modelo profesor, usando el `compression_summary.json` incluido.
- Análisis de sentimiento en inglés sobre reseñas con distribución similar a SST-2: el modelo clasifica frases cortas de crítica cinematográfica con un 90,14 % de precisión en validación, suficiente para prototipos y experimentos controlados.
- Docencia y demostraciones de SVD aplicado a transformers: el checkpoint y el código de reconstrucción permiten ilustrar cómo se factorizan matrices de pesos y cómo se recupera el modelo comprimido.
- Benchmarking de infraestructura de inferencia: al reducir un 8,61 % los parámetros, sirve para medir el ahorro real de memoria y latencia en una RTX 3090 u objetivo equivalente, comparándolo con `bert-base-uncased`.
- Validación de pipelines de serialización: el formato `pytorch_model.bin` con factores de bajo rango y `strict=False` es útil para probar herramientas de carga y compatibilidad con `transformers` + NeuralOps.
- Filtrado ligero de opiniones en inglés dentro de un pipeline mayor: como clasificador binario rápido sobre textos cortos, siempre que se acepte la pérdida de 1,49 puntos frente al profesor y se valide en el dominio objetivo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Modelo | Rango (k) | Ratio físico | Parámetros | Precisión SST-2 (val) | Delta vs profesor |
|---|---|---|---|---|---|
| Profesor (`bert-base-uncased` afinado) | — | 1,00x | 109.483.778 | 91,63 % | — |
| `bert-comp-asvd-sst2` (publicado) | 256 | 1,09x | 100.058.882 | 90,14 % | -1,49 pp |
| Variante ASVD | 128 | 1,21x | 90.615.554 | 84,98 % (zero-shot) / 69,95 % (con LoRA) | -6,65 / -21,68 pp |
| Variante ASVD | 64 | 1,27x | 85.893.890 | 71,79 % (zero-shot) / 49,08 % (con LoRA) | -19,84 / -42,55 pp |
| Variante ASVD | 32 | 1,31x | 83.533.058 | 47,82 % (zero-shot) / 50,92 % (con LoRA) | -43,81 / -40,71 pp |

Evaluación realizada sobre el split de validación de GLUE SST-2 (872 muestras) en una NVIDIA GeForce RTX 3090 (24 GB). No se han publicado resultados de MMLU, HumanEval ni GSM8K, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa aproximadamente 191 MB en `pytorch_model.bin` (0,2 GB de repositorio), por lo que cabe holgadamente en cualquier GPU con 2 GB o más de VRAM, así como en CPU.
- GPU recomendadas: cualquier GPU moderna es suficiente; el autor usó una RTX 3090 (24 GB) para la evaluación, pero es sobredimensionada para este modelo.
- Cabe en GPU de consumo: sí, en cualquier RTX o GTX con al menos 2 GB de VRAM, e incluso en iGPU y CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `transformers` combinado con la librería NeuralOps para reconstruir la topología comprimida; no hay soporte directo documentado en vLLM, llama.cpp, Ollama ni TGI, ya que el formato de pesos requiere la reconstrucción previa con `compress_model`. El modelo base es compatible con dichos motores, pero el checkpoint comprimido no se distribuye en GGUF ni en safetensors.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño (≈100 M de parámetros) se espera una latencia por debajo de decenas de milisegundos en GPU, pero el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-comp-asvd-sst2` | 100.058.882 | no disponible | 90,14 % | MIT | Hugging Face, requiere NeuralOps |
| `google-bert/bert-base-uncased` (afinado SST-2) | 109.483.778 | 512 tokens | 91,63 % (profesor del autor) | Apache 2.0 | Hugging Face, ecosistema estándar |
| `distilbert-base-uncased-finetuned-sst-2-english` | ≈66 M | 512 tokens | no disponible en esta información | Apache 2.0 | Hugging Face, `transformers` |
| `roberta-base` afinado SST-2 | ≈125 M | 512 tokens | no disponible en esta información | MIT | Hugging Face, `transformers` |

La comparación con DistilBERT y RoBERTa se ofrece como referencia de categoría; no se dispone de sus cifras exactas de SST-2 en la información proporcionada, por lo que se indica "no disponible" en lugar de estimar valores.

## Limitaciones y advertencias

- Pérdida de precisión de 1,49 puntos porcentuales frente al profesor en SST-2, con degradación severa en rangos menores; el checkpoint publicado es el único con precisión aceptable.
- El "LoRA healing" empeoró el resultado en los rangos k=128, 64 y 32 (por ejemplo, de 84,98 % a 69,95 % en k=128), lo que sugiere inestabilidad del procedimiento de recuperación en este setup.
- Sesgos heredados de `bert-base-uncased` y de GLUE SST-2: el corpus está compuesto por críticas cinematográficas en inglés, con posible sesgo de dominio y de anotación.
- Riesgo de alucinación no aplicable en sentido generativo (es un clasificador), pero sí de clasificaciones erróneas fuera de distribución o en dominios distintos al de SST-2.
- Limitación idiomática: solo inglés; el vocabulario `bert-base-uncased` no cubre adecuadamente otros idiomas.
- Licencia MIT, lo que permite uso comercial, pero el modelo base `bert-base-uncased` está bajo Apache 2.0 y la librería NeuralOps debe verificarse por separado en su repositorio.
- Dependencia de la librería NeuralOps para reconstruir el grafo comprimido; la carga con `transformers` estándar requiere el paso previo de `compress_model` y `strict=False`, lo que añade fricción operativa y riesgo de incompatibilidades.
- Ausencia de cuantizaciones publicadas (GGUF, AWQ, GPTQ) y de soporte en motores de inferencia habituales, lo que limita su uso en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-asvd-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación del compresor ASVD: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/svd/asvd_compressor.py
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE: https://huggingface.co/datasets/nyu-mll/glue
