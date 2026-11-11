# tahamajs/bert-comp-auto-svd-sst2

## Resumen

`tahamajs/bert-comp-auto-svd-sst2` es un checkpoint comprimido de `google-bert/bert-base-uncased` afinado para clasificación de sentimiento en GLUE SST-2, publicado por Taha Majlesi dentro del proyecto NeuralOps. El modelo aplica el compresor `AutoSVDCompressor` (clave `auto_svd` en el registro de NeuralOps), que combina un perfilado de sensibilidad basado en Fisher y Gram con una asignación multiobjetivo de rangos SVD según un frente de Pareto. El resultado empaquetado corresponde al rango `k=32`, con 69.414.338 parámetros frente a los 109.483.778 del BERT-base original, lo que supone una reducción del 36,60 % y un ratio de compresión físico de 1,577x.

El checkpoint incorpora además un proceso de "LoRA healing": tras la compresión SVD, se aplica un adaptador LoRA de rango `r=8` entrenado durante 50 pasos con `lr=2e-4` y un presupuesto de 45 segundos cuando la caída zero-shot supera el 2,0 % de accuracy y la reducción supera 1,10x. En este caso, la accuracy zero-shot cae al 61,70 % y el healing la eleva al 73,28 %, frente al 91,63 % del profesor original, dejando una brecha de paridad de -18,35 puntos.

La relevancia del modelo es fundamentalmente metodológica: sirve como artefacto reproducible para estudiar el compromiso entre compresión física de un transformer encoder y degradación de rendimiento en una tarea downstream concreta. No es un modelo pensado para producción por su baja accuracy, sino una pieza del zoo de compresores NeuralOps que documenta telemetría multi-rango (`k=256, 128, 64, 32`) y el efecto del healing LoRA sobre pesos comprimidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base (12 capas, dimensión oculta D=768), comprimido mediante SVD con asignación automática de rangos (AutoSVDCompressor) y healing LoRA |
| Parametros totales | 69.414.338 (reducción del 36,60 % respecto a los 109.483.778 del BERT-base original) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base BERT-base-uncased admite 512 tokens, pero la model card no lo declara explícitamente) |
| Tipos de cuantizacion | No disponible (el checkpoint se distribuye en `pytorch_model.bin` en precisión completa; no se documentan variantes cuantizadas) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado con factores de bajo rango y adaptadores LoRA integrados), más `config.json`, `compression_summary.json` y activos del tokenizador de `bert-base-uncased` |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased`, un transformer encoder de 12 capas y 768 dimensiones ocultas con 109.483.778 parámetros, afinado previamente sobre GLUE SST-2 (clasificación binaria de sentimiento). Sobre ese checkpoint se aplica `AutoSVDCompressor`, que realiza un perfilado de sensibilidad combinando información de Fisher y de la matriz de Gram para decidir qué rangos SVD asignar a cada capa. La asignación de rangos sigue un criterio multiobjetivo de Pareto, evaluado en los rangos `k=256, 128, 64 y 32`. El artefacto empaquetado corresponde a `k=32` y, según la telemetría publicada, los cuatro rangos evaluados producen el mismo recuento de parámetros comprimidos (69.414.338) y el mismo ratio físico (1,58x), lo que sugiere que el cuello de botella de compresión efectiva se sitúa en otras estructuras además de las matrices descompuestas.

Tras la compresión, el modelo pasa por un proceso de recuperación con LoRA: se inyecta un adaptador de rango `r=8` y se entrena durante 50 pasos con `lr=2e-4` bajo un presupuesto de 45 segundos, activado cuando la caída zero-shot supera el 2,0 % de accuracy y la reducción de parámetros supera 1,10x. Los adaptadores quedan integrados en el state dict serializado. La evaluación se realizó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre el split de validación de GLUE SST-2 (872 muestras). No se documentan en la información disponible detalles sobre el dataset de entrenamiento original del fine-tuning SST-2, la composición del corpus ni el uso de RLHF/DPO (no aplicable a esta tarea de clasificación).

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) sobre texto en inglés, con dos etiquetas de salida (`num_labels=2`).
- Inferencia sobre entradas tokenizadas con el vocabulario estándar de `bert-base-uncased`.
- Reconstrucción del grafo comprimido mediante la API `compress_model` de NeuralOps antes de cargar el state dict.
- Telemetría de compresión multi-rango incluida en `compression_summary.json` para análisis comparativo de rangos `k=256, 128, 64, 32`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking": es un clasificador encoder puro.
- Capacidad multilingüe limitada al inglés; el tokenizador `uncased` no está pensado para otros idiomas.

## Casos de uso

- Investigación sobre compresión de modelos: el checkpoint sirve como referencia reproducible para medir la degradación de accuracy al aplicar SVD de bajo rango sobre un BERT-base afinado, comparando los rangos `k=256, 128, 64, 32` con la telemetría incluida.
- Estudio del efecto del LoRA healing: permite cuantificar la recuperación de accuracy (de 61,70 % zero-shot a 73,28 % tras healing) en una tarea concreta y con un presupuesto de entrenamiento muy acotado (50 pasos, 45 s).
- Prototipado de pipelines de clasificación de sentimiento en entornos con restricciones de memoria: al reducir un 36,6 % los parámetros, el modelo ocupa menos espacio en disco y en memoria que el BERT-base original, aunque su accuracy (73,28 %) lo hace apto solo para pruebas, no para producción.
- Docencia y demostración de técnicas SVD + LoRA: el flujo de reconstrucción (`compress_model` + carga del state dict con `strict=False`) es un ejemplo didáctico de cómo se empaqueta un modelo comprimido en el ecosistema NeuralOps.
- Benchmarking de herramientas de compresión: al formar parte del "compressor zoo" de NeuralOps, permite comparar `auto_svd` contra otros compresores registrados en `COMPRESSOR_REGISTRY` sobre la misma tarea y dataset.
- Validación de infraestructura de despliegue: útil para probar pipelines de inferencia con `transformers` y checkpoints no estándar (state dict parcial, `strict=False`) antes de migrar a modelos mayores.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| GLUE SST-2 Validation Accuracy (modelo empaquetado, `k=32`, con LoRA healing) | 73,28 % |
| GLUE SST-2 Validation Accuracy (zero-shot tras compresión, sin healing) | 61,70 % |
| GLUE SST-2 Validation Accuracy (profesor `bert-base-uncased` afinado) | 91,63 % |
| Brecha de paridad frente al profesor | -18,35 puntos |
| Muestras de evaluación (split de validación SST-2) | 872 |
| Ratio de compresión físico | 1,577x |
| Reducción de parámetros | 36,60 % |

Evaluación multi-rango declarada por el autor (todos los rangos reportan el mismo recuento de parámetros y accuracy):

| Rango (`k`) | Ratio físico | Params comprimidos | Zero-shot Acc | Healed Acc | Paridad vs profesor |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,58x | 69.414.338 | 61,70 % | 73,28 % (LoRA) | -18,35 % |
| 128 | 1,58x | 69.414.338 | 61,70 % | 73,28 % (LoRA) | -18,35 % |
| 64 | 1,58x | 69.414.338 | 61,70 % | 73,28 % (LoRA) | -18,35 % |
| 32 (empaquetado) | 1,58x | 69.414.338 | 61,70 % | 73,28 % (LoRA) | -18,35 % |

No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa aproximadamente 132,6 MB según la model card, lo que corresponde a unos 277 MB en FP32 (69,4 M de parámetros × 4 bytes) o unos 139 MB en FP16. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente. La evaluación del autor se realizó en una NVIDIA GeForce RTX 3090 (24 GB), pero el modelo es sobredimensionado para ese hardware.
- Cabe en GPU consumer: sí, en todas las GPU modernas (RTX 20xx/30xx/40xx, GTX 16xx, e incluso en CPU para inferencia puntual).
- Opciones de despliegue: el flujo documentado usa `transformers` (`BertForSequenceClassification`) junto con la librería `neuralops` para reconstruir la topología comprimida antes de cargar el state dict. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; estos motores no soportan de forma nativa checkpoints con topología SVD modificada y requerirían exportación previa a un formato estándar.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dado el tamaño reducido (69,4 M de parámetros), la inferencia por lote debería ser rápida en GPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Params | Contexto | SST-2 Acc | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `tahamajs/bert-comp-auto-svd-sst2` (este) | 69,4 M | No disponible | 73,28 % | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor, afinado SST-2) | 109,5 M | 512 tokens | 91,63 % (según el autor) | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 tokens | No disponible en esta información | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | 109,5 M | 512 tokens | No disponible en esta información | Apache 2.0 | Hugging Face |

La comparación directa con DistilBERT y con el BERT afinado de TextAttack no puede completarse porque la información proporcionada no incluye sus métricas SST-2. El dato relevante es que este checkpoint comprimido pierde 18,35 puntos de accuracy frente a su profesor, una brecha muy superior a la que suele reportarse para destilación (DistilBERT) o para fine-tuning estándar de BERT-base en SST-2.

## Limitaciones y advertencias

- Accuracy muy inferior a la del modelo base: 73,28 % frente al 91,63 % del profesor, una brecha de -18,35 puntos que lo hace inadecuado para producción en clasificación de sentimiento.
- La telemetría multi-rango es sospechosa: los cuatro rangos evaluados (`k=256, 128, 64, 32`) reportan idéntico recuento de parámetros, ratio de compresión y accuracy, lo que sugiere que la compresión efectiva no varía con `k` o que la evaluación no distingue entre configuraciones. Conviene tratar estos números con cautela.
- El proceso de healing LoRA es muy breve (50 pasos, 45 s, `lr=2e-4`) y no se documenta validación cruzada ni análisis de varianza; la accuracy de 73,28 % podría no ser estable entre ejecuciones.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador, no un generador), pero sí de clasificaciones erróneas sistemáticas en dominios distintos de SST-2.
- Idiomas: solo inglés. El tokenizador `uncased` y el corpus de entrenamiento limitan su uso a texto en inglés.
- Licencia MIT: permite uso comercial, pero la baja accuracy desaconseja su despliegue en productos reales. Además, el modelo base `bert-base-uncased` está bajo Apache 2.0, compatible con MIT.
- Dependencia de la librería `neuralops` para reconstruir la topología comprimida antes de cargar los pesos; sin ella, el state dict no es directamente cargable en un `BertForSequenceClassification` estándar.
- El checkpoint se distribuye en `pytorch_model.bin` (pickle), lo que implica riesgos de seguridad al cargarlo desde fuentes no verificadas; no se ofrece variante `safetensors`.
- Sin datos de benchmarks adicionales ni evaluación independiente; todas las métricas son declaradas por el autor y marcadas como `verified: false` en el model-index.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-auto-svd-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor `auto_svd`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/svd/auto_svd.py
- Licencia del proyecto NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
