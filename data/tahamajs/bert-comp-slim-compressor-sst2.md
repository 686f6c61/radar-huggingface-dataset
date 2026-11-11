# tahamajs/bert-comp-slim-compressor-sst2

## Resumen

`bert-comp-slim-compressor-sst2` es un checkpoint de `google-bert/bert-base-uncased` afinado para clasificación de sentimiento en GLUE SST-2 y posteriormente procesado con el motor de compresión `SLiMCompressor` de la librería NeuralOps, desarrollada por Taha Majlesi. El modelo se publica como parte del "Compressed & LoRA-Healed Model Zoo" de NeuralOps, un proyecto que explora técnicas de compresión estructurada (cuantización, sparsity 2:4 y corrección de residuales vía SVD) sobre transformers pequeños.

La relevancia de esta ficha es doble. Por un lado, documenta un caso práctico de compresión de BERT para una tarea concreta (análisis de sentimiento binario en inglés). Por otro, y de forma más importante, sirve como advertencia metodológica: el checkpoint empaquetado en el repositorio (rank `k=256`) declara una precisión del 67,55 % en el split de validación de SST-2, frente al 91,63 % del modelo profesor original, es decir, una degradación de 24,08 puntos porcentuales. Además, el propio autor indica un ratio de compresión de `1.00x` con reducción de parámetros del 0,0 %, lo que implica que el checkpoint publicado no reduce el tamaño del modelo respecto al original (109.483.778 parámetros).

El modelo conserva la arquitectura BERT-base (12 capas, dimensión oculta 768) y solo es útil en inglés. Su licencia es MIT, lo que permite uso comercial, pero su rendimiento está muy por debajo del estado del arte para SST-2 y no debería emplearse en producción sin una reevaluación exhaustiva y, probablemente, un reentrenamiento o una compresión mejor calibrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base (12 capas, dimensión oculta 768), con compresión SLiM (low-rank + cuantización + sparsity 2:4 + corrección SVD) |
| Parametros totales | 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de `bert-base-uncased`; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (la model card menciona buffers de cuantización dentro de SLiM, pero no detalla esquemas ni precisión) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch) |
| Libreria | `neuralops` |
| Modelo base | `google-bert/bert-base-uncased` |
| Dataset de evaluacion | `nyu-mll/glue`, config `sst2`, split `validation` (872 muestras) |
| Tamano del repo | 0,5 GB |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased`, un transformer encoder de 12 capas y 768 dimensiones ocultas, preentrenado por Google con enmascaramiento de tokens y predicción de siguiente frase sobre corpus en inglés. Sobre esa base, el autor aplicó un ajuste fino supervisado para clasificación binaria de sentimiento en SST-2, generando el "profesor" que sirve de referencia (91,63 % de precisión).

Posteriormente se aplicó `SLiMCompressor`, descrito en la model card como "Structured Low-Rank Integrated Matrix Compression (Quantization + 2:4 Sparsity + SVD Residual Correction)". El pipeline evalúa varios rangos (`k=256, 128, 64, 32`) y, cuando la compresión zero-shot degrada más de 2,0 puntos con un ratio superior a 1,10x, aplica un "healing" con LoRA de rango `r=8` durante 50 pasos con `lr=2e-4` y un presupuesto de 45 segundos. En el checkpoint publicado (`k=256`) el autor indica explícitamente `LoRA Recovery Applied: False`, es decir, no se aplicó recuperación LoRA, y el ratio de compresión física es `1.00x` con reducción de parámetros del 0,0 %. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset más allá de SST-2, ni si hubo RLHF/DPO (no aplicable en un clasificador).

## Capacidades

- Clasificación de sentimiento binario (positivo/negativo) en inglés, con dos etiquetas de salida (`num_labels=2`).
- Inferencia sobre textos de hasta 512 tokens (límite estándar de BERT-base), aunque la model card no lo explicita.
- No soporta generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No está diseñado para agentes ni razonamiento multi-paso.
- Capacidad multilingüe: no disponible; solo inglés.
- No dispone de modo "thinking", audio ni otras capacidades especiales.
- El checkpoint requiere reconstruir la topología comprimida con `neuralops.core.compression_pipeline.compress_model` antes de cargar el state dict, según el snippet de la model card.

## Casos de uso

- Clasificación de reseñas de productos en inglés: el modelo puede etiquetar reseñas como positivas o negativas, pero con una precisión del 67,55 % en SST-2, muy inferior a la del profesor (91,63 %); solo sería aceptable en entornos de baja exigencia o como baseline experimental.
- Filtrado de comentarios en foros o redes: útil para descartar contenido negativo de forma aproximada, aunque la tasa de error (~32 %) obliga a revisión humana.
- Investigación sobre compresión de modelos: el repositorio incluye `compression_summary.json` con telemetría de los rangos `k=256, 128, 64, 32`, lo que permite reproducir y comparar técnicas de compresión low-rank sobre BERT.
- Docencia y experimentación con NeuralOps: sirve como ejemplo práctico de cómo aplicar `SLiMCompressor` y evaluar el compromiso precisión/compresión.
- Benchmark de pipelines de compresión: puede integrarse en estudios comparativos de compresores (slim, otros) sobre GLUE SST-2.
- Prototipado de clasificadores ligeros en CPU: al mantener el tamaño de BERT-base (109M parámetros, ~452 MB en `pytorch_model.bin`), puede ejecutarse en CPU para pruebas, aunque sin ventaja de compresión real.
- No se recomienda para atención al cliente automatizada, moderación de contenido en producción ni análisis de sentimiento con SLA de precisión, dado el bajo rendimiento declarado.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index y en la model card (no verificados, `verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| GLUE SST-2 (validation, 872 muestras) | Accuracy | 67,55 % |
| GLUE SST-2 (profesor `bert-base-uncased` afinado) | Accuracy | 91,63 % |
| Parity delta vs profesor | Accuracy | -24,08 pp |

Evaluación multi-rango declarada por el autor (RTX 3090, 24 GB):

| Rank (`k`) | Ratio fisico | Parametros comprimidos (reduccion) | Zero-shot Acc | Healed Acc | Parity vs profesor (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| **256** | 1,00x | 109.483.778 (-0,0 %) | 67,55 % | **67,55 %** | -24,08 % |
| **128** | 1,00x | 109.483.778 (-0,0 %) | 58,37 % | **58,37 %** | -33,26 % |
| **64** | 1,00x | 109.483.778 (-0,0 %) | 51,95 % | **51,95 %** | -39,68 % |
| **32** | 1,00x | 109.483.778 (-0,0 %) | 55,05 % | **55,05 %** | -36,58 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible, lo cual es esperable al tratarse de un clasificador de sentimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,5 GB en fp32 (109M parámetros × 4 bytes ≈ 438 MB) más overhead de activaciones; ~0,25 GB en fp16. El checkpoint ocupa 451,9 MB.
- GPU recomendadas: cualquier GPU con ≥2 GB de VRAM es suficiente; el autor evaluó en una NVIDIA GeForce RTX 3090 (24 GB), pero es sobredimensionada para este modelo.
- Cabe en GPU de consumo: sí, en GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090 y prácticamente cualquier GPU moderna; también en CPU.
- Opciones de despliegue: el modelo requiere `neuralops` para reconstruir la topología comprimida antes de cargar el state dict; no se menciona compatibilidad directa con vLLM, llama.cpp, Ollama o TGI. El snippet de la model card usa `transformers` + `neuralops`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 Acc | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-comp-slim-compressor-sst2` (k=256) | 109,5M | 512 (heredado) | 67,55 % | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor afinado, referencia del autor) | 109,5M | 512 | 91,63 % | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66M | 512 | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | 109,5M | 512 | no disponible en esta ficha | MIT | Hugging Face |

La comparativa se limita a los datos aportados por el autor; no se dispone de resultados de benchmarks de los modelos alternativos en la información proporcionada, por lo que las celdas correspondientes se marcan como no disponibles.

## Limitaciones y advertencias

- Degradación severa: 67,55 % frente al 91,63 % del profesor, una pérdida de 24,08 puntos porcentuales en SST-2; inaceptable para producción con requisitos de precisión.
- El checkpoint publicado no reduce parámetros (ratio 1,00x, -0,0 %), por lo que no aporta beneficio de compresión real pese a la etiqueta "compressed".
- `LoRA Recovery Applied: False` en el rank publicado, lo que sugiere que el "healing" no se aplicó o no mejoró el resultado.
- Los resultados del model-index están marcados como `verified: false`; no han sido validados de forma independiente.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí de clasificaciones erróneas (~32 % de error en SST-2).
- Solo inglés; no soporta otros idiomas.
- Contexto limitado a 512 tokens (heredado de BERT-base), aunque no se explicita en la model card.
- Requiere la librería `neuralops` y un paso de reconstrucción de topología antes de cargar los pesos; no es plug-and-play con `transformers` estándar.
- Licencia MIT permite uso comercial, pero el bajo rendimiento desaconseja su uso en producción sin reevaluación.
- Sesgos: no documentados en la información disponible; hereda los sesgos de `bert-base-uncased` y de SST-2 (reseñas de películas).
- Fecha de creación declarada: 2026-11-10; verificar la vigencia del repositorio y de la librería NeuralOps.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/bert-comp-slim-compressor-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de SLiMCompressor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/low_rank/slim_compressor.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
