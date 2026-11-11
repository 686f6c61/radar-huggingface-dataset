# tahamajs/bert-comp-sdrm-compressor-sst2

## Resumen

`tahamajs/bert-comp-sdrm-compressor-sst2` es un checkpoint comprimido y parcialmente recuperado de `google-bert/bert-base-uncased`, ajustado para clasificación de sentimiento en GLUE SST-2. Lo publica Taha Majlesi dentro del proyecto NeuralOps, una librería de compresión de modelos que agrupa varios compresores bajo una API común. El modelo no es un modelo base nuevo, sino un artefacto de investigación que demuestra el funcionamiento del compresor `sdrm_compressor` (familia `low_rank`) sobre un transformer BERT de 12 capas y dimensión oculta 768.

El checkpoint presentado corresponde al rango de compresión `k=32`, con 94.587.098 parámetros (una reducción del 13,61 % respecto a los 109.483.778 del BERT-base original, ratio físico 1,157x). El autor aplicó un proceso de "LoRA healing" con `r=8`, 50 pasos y `lr=2e-4` para intentar recuperar la precisión perdida tras la compresión. El resultado final declarado es un 50,92 % de accuracy en la validación de SST-2, frente al 91,63 % del modelo profesor sin comprimir.

Su relevancia es fundamentalmente metodológica: sirve como caso de estudio reproducible de compresión low-rank con recuperación LoRA y de las dificultades prácticas (caída de precisión severa, fallos de compresión en rangos mayores) que aparecen al aplicar estas técnicas a modelos pequeños. No está pensado para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base), 12 capas, D=768 |
| Parametros totales | 94.587.098 (comprimido); 109.483.778 en el modelo base |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base BERT-base admite 512 tokens) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en `pytorch_model.bin`, sin variantes GGUF/ONNX) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`), requiere reconstrucción del grafo comprimido con NeuralOps |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased`, un transformer encoder de 12 capas con 768 dimensiones ocultas, preentrenado por Google con objetivos MLM y NSP. Sobre esa base se aplicó un ajuste supervisado para clasificación binaria de sentimiento en GLUE SST-2, y posteriormente se comprimió con el compresor `sdrm_compressor` de NeuralOps, que pertenece a la familia `low_rank` y factoriza pesos en componentes de bajo rango. El rango elegido para el checkpoint publicado es `k=32`, lo que produce una reducción del 13,61 % en parámetros.

Tras la compresión, el autor aplicó "LoRA healing": adaptadores de rango `r=8` entrenados durante 50 pasos con `lr=2e-4` y un presupuesto de 45 segundos en una NVIDIA RTX 3090 (24 GB), con el objetivo de recuperar la precisión perdida. Según la model card, la evaluación se hizo físicamente sobre el split de validación de SST-2 (872 muestras). Los rangos `k=256`, `k=128` y `k=64` fallaron con `FAIL_CRASH` durante la compresión, de modo que solo `k=32` llegó a serializarse. No se documentan detalles sobre el dataset de healing más allá de SST-2, ni sobre el número de tokens de entrenamiento o composición del corpus.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) sobre texto en inglés, con dos etiquetas de salida.
- Inferencia estándar de `BertForSequenceClassification` una vez reconstruido el grafo comprimido con NeuralOps.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un clasificador, no un modelo generativo.
- No soporta agentes, visión, audio ni modo "thinking".
- Capacidad multilingüe limitada al inglés (tokenizador `bert-base-uncased`).
- Su función real es servir de demostración reproducible del pipeline de compresión `sdrm_compressor` + LoRA healing de NeuralOps.

## Casos de uso

- **Investigación en compresión de modelos**: reproducir el pipeline `sdrm_compressor` + LoRA healing sobre BERT-base y comparar la curva precisión/compresión con otros compresores de NeuralOps. Es el uso principal del artefacto.
- **Docencia y experimentación**: ilustrar en un curso o taller cómo una compresión agresiva sin recuperación adecuada degrada la precisión (de 91,63 % a 50,92 %), y cómo el "healing" con LoRA puede no bastar con presupuestos cortos.
- **Benchmark de pipelines de compresión**: usar el checkpoint como referencia negativa o caso límite al evaluar nuevas técnicas de compresión low-rank, dado que su precisión final es cercana al azar en un problema binario.
- **Pruebas de integración de NeuralOps**: validar que la reconstrucción del grafo comprimido (`compress_model` + `load_state_dict(strict=False)`) funciona correctamente en un entorno de CI.
- **Análisis de robustez de clasificadores de sentimiento**: estudiar cómo se degradan las representaciones de BERT bajo factorización de bajo rango en una tarea concreta como SST-2.
- **Prototipado de pipelines de clasificación**: siempre que se acepte una precisión muy baja, sirve para probar el cableado de un clasificador binario (tokenizador, carga de pesos, inferencia) antes de sustituirlo por un modelo funcional.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Modelo / configuración | GLUE SST-2 (validación) | Parámetros | Ratio físico |
|---|---:|---:|---:|
| Profesor (`bert-base-uncased` ajustado, sin comprimir) | 91,63 % | 109.483.778 | 1,00x |
| `sdrm_compressor` k=32, zero-shot | 85,09 % | 94.587.098 | 1,16x |
| `sdrm_compressor` k=32, tras LoRA healing (checkpoint publicado) | 50,92 % | 94.587.098 | 1,16x |
| `sdrm_compressor` k=64 | FAIL_CRASH | — | — |
| `sdrm_compressor` k=128 | FAIL_CRASH | — | — |
| `sdrm_compressor` k=256 | FAIL_CRASH | — | — |

El resultado publicado (50,92 %) es inferior al del modelo comprimido sin healing (85,09 %), lo que sugiere que el proceso de LoRA healing con 50 pasos y `lr=2e-4` degradó el clasificador en lugar de recuperarlo. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: al tratarse de un BERT-base comprimido (~95 M parámetros), la inferencia en fp32 requiere aproximadamente 0,4 GB de pesos, más activaciones; en la práctica cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- **GPU recomendadas**: cualquier GPU moderna es suficiente; el autor evaluó en una NVIDIA RTX 3090 (24 GB) por comodidad, no por necesidad. Una RTX 3060, RTX 4060 o incluso CPU son viables para inferencia.
- **Cabe en consumer GPU**: sí, en cualquier GPU consumer actual e incluso en CPU para lotes pequeños.
- **Opciones de despliegue**: no hay soporte directo en vLLM, llama.cpp, Ollama ni TGI, porque el checkpoint requiere reconstruir primero el grafo comprimido con NeuralOps (`compress_model` con `sdrm_compressor` y `rank=32`) y cargar después el `state_dict` con `strict=False`. El despliegue estándar sería PyTorch + Transformers + NeuralOps.
- **Latencia y throughput**: no disponibles en la información proporcionada. El autor menciona un presupuesto de 45 s para el healing en RTX 3090, pero no reporta latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| `tahamajs/bert-comp-sdrm-compressor-sst2` (este) | 94,6 M | no disponible | 50,92 % | MIT | Hugging Face, requiere NeuralOps |
| `google-bert/bert-base-uncased` ajustado en SST-2 | 109,5 M | 512 | 91,63 % (profesor del autor) | Apache 2.0 | Hugging Face, transformers estándar |
| `textattack/bert-base-uncased-SST-2` (referencia de la comunidad) | 109,5 M | 512 | ~92 % (referencia habitual; no verificado en esta ficha) | Apache 2.0 | Hugging Face, transformers estándar |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 | ~91 % (referencia habitual; no verificado en esta ficha) | Apache 2.0 | Hugging Face, transformers estándar |

La comparación relevante no es de rendimiento sino de propósito: este checkpoint es un artefacto de investigación sobre compresión, no un clasificador de sentimiento competitivo. Para cualquier uso real de clasificación SST-2 conviene usar el modelo profesor o un DistilBERT ajustado, que ofrecen precisiones en torno al 91-92 % con licencias permisivas y despliegue estándar.

## Limitaciones y advertencias

- **Precisión muy degradada**: 50,92 % en una tarea binaria equivale prácticamente a azar; el modelo no es utilizable para clasificación de sentimiento real.
- **El healing empeoró el resultado**: la precisión tras LoRA healing (50,92 %) es inferior a la del modelo comprimido sin healing (85,09 %), lo que indica un problema en el proceso de recuperación documentado por el propio autor.
- **Fallos de compresión**: los rangos `k=64`, `k=128` y `k=256` fallaron con `FAIL_CRASH`, de modo que la curva de Pareto solo tiene un punto válido.
- **Dependencia de NeuralOps**: no se puede cargar con `AutoModel.from_pretrained` estándar; requiere reconstruir el grafo comprimido con la librería NeuralOps y cargar el `state_dict` con `strict=False`, lo que añade fragilidad y acoplamiento a una versión concreta de la librería.
- **Idioma**: solo inglés; el tokenizador `bert-base-uncased` no está pensado para otros idiomas.
- **Contexto**: no se documenta en la model card; el límite heredado de BERT-base es de 512 tokens.
- **Sesgos**: no documentados por el autor; al derivar de `bert-base-uncased` y SST-2, hereda los sesgos del corpus de reseñas de cine en inglés.
- **Riesgo de alucinación**: no aplica directamente (es un clasificador), pero sí hay riesgo de clasificaciones erróneas sistemáticas dado el bajo rendimiento.
- **Licencia**: MIT para el artefacto; el modelo base es Apache 2.0, compatible con uso comercial, aunque el valor práctico del checkpoint es nulo para producción.
- **Madurez**: repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación externa de los resultados.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/bert-comp-sdrm-compressor-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/low_rank/sdrm_compressor.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
