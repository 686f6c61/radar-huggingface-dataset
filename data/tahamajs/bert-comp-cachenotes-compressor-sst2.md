# tahamajs/bert-comp-cachenotes-compressor-sst2

## Resumen

`tahamajs/bert-comp-cachenotes-compressor-sst2` es un checkpoint de BERT-base comprimido físicamente y posteriormente "sanado" mediante LoRA, publicado por Taha Majlesi dentro del ecosistema NeuralOps (Compressed & LoRA-Healed Model Zoo). Parte de `google-bert/bert-base-uncased` afinado en GLUE SST-2 y aplica el compresor `cachenotes_compressor` (`CacheNotesCompressor`), una familia de operadores neuronales orientada a compresión de caché clave-valor y compresión estática de pesos con generador CPT (Compression-Planning-Token) continuo y aprendible. El checkpoint empaquetado corresponde al rango de Pareto `k=64`.

El interés del modelo no reside en su calidad predictiva —el resultado declarado en validación de SST-2 es 71,56 % frente al 91,63 % del profesor original—, sino en su valor como artefacto reproducible para investigar pipelines de compresión con recuperación LoRA. El repositorio documenta una evaluación multi-rango (`k=256, 128, 64, 32`) con métricas de precisión zero-shot y tras healing, lo que permite analizar el compromiso entre ratio de compresión y degradación de tarea.

Arquitectónicamente sigue siendo un transformer encoder BERT-base (12 capas, dimensión oculta 768), reducido de 109.483.778 a 35.170.562 parámetros (3,113x de compresión física, -67,88 %). El repositorio ocupa 0,1 GB, la licencia es MIT y el idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base) con compresión `cachenotes_compressor` y adaptadores LoRA de healing |
| Parametros totales | 35.170.562 (checkpoint comprimido en `k=64`); base original: 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base BERT-base-uncased admite 512 tokens) |
| Tipos de cuantizacion | no disponible; el artefacto distribuido es un state dict de PyTorch en precisión nativa |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado), `config.json`, `compression_summary.json`, assets de tokenizer BERT |

## Arquitectura y entrenamiento

El modelo base es `google-bert/bert-base-uncased`: un transformer encoder de 12 capas y 768 dimensiones ocultas, preentrenado de forma auto-supervisada y afinado para clasificación de sentimiento binaria en GLUE SST-2. Sobre ese checkpoint, NeuralOps aplica `CacheNotesCompressor`, descrito por el autor como un operador neuronal de compresión de caché KV y de pesos estáticos con generador CPT continuo y aprendible. La compresión es física: el state dict resultante contiene los factores de bajo rango, los buffers de cuantización y los adaptadores LoRA ya integrados, y requiere reconstruir la topología comprimida con `compress_model` antes de cargar los pesos.

El proceso de recuperación se activa cuando la compresión zero-shot degrada la precisión más de 2,0 puntos con una reducción superior a 1,10x. En ese caso se aplica un healing LoRA con rango `r=8`, 50 pasos, tasa de aprendizaje `2e-4` y un presupuesto de 45 segundos. La evaluación se realizó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre las 872 muestras de validación de SST-2. El autor no documenta el volumen de tokens de preentrenamiento ni la composición del dataset más allá de GLUE SST-2, ni indica si hubo RLHF o DPO (no aplicable en un encoder de clasificación).

## Capacidades

- Clasificación de sentimiento binaria (negativo/positivo) en inglés, con dos etiquetas de salida.
- Codificación de texto con representaciones contextuales de BERT-base, reutilizables para tareas derivadas.
- Inferencia ligera: 35,17 M de parámetros permiten ejecución en CPU y GPU de gama baja.
- No soporta tool calling ni function calling: es un modelo de clasificación, no un modelo generativo.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés (vocabulario `bert-base-uncased`).
- No dispone de modo thinking, visión ni audio.
- Sirve como referencia reproducible para estudiar compresión con recuperación LoRA y el compromiso precisión/ratio.

## Casos de uso

- Análisis de sentimiento en producción de bajo coste: clasificación de reseñas o comentarios en inglés con un modelo de 35 M de parámetros, adecuado para despliegues con restricciones de memoria o latencia.
- Filtrado previo en pipelines de moderación: primera pasada de polaridad sobre grandes volúmenes de texto antes de enviar casos dudosos a un modelo mayor.
- Investigación en compresión de modelos: el repositorio incluye `compression_summary.json` con telemetría de los rangos `k=256, 128, 64, 32`, lo que permite reproducir curvas de Pareto y validar metodologías de healing LoRA.
- Docencia y experimentación: ejemplo completo de reconstrucción de topología comprimida y carga de pesos con `strict=False`, útil para cursos de eficiencia de modelos.
- Benchmark de referencia para operadores NeuralOps: permite comparar el comportamiento de `cachenotes_compressor` frente a otras técnicas de compresión sobre una tarea estándar como SST-2.
- Prototipado rápido en entornos sin GPU: el tamaño reducido facilita pruebas en portátiles y contenedores pequeños.
- Base para afinar tareas de clasificación en inglés con recursos limitados, partiendo de un checkpoint ya comprimido.

## Benchmarks y rendimiento

Resultados declarados por el autor (`verified: false`) sobre GLUE SST-2, split de validación (872 muestras), evaluados en RTX 3090:

| Rank (`k`) | Ratio fisico | Parametros comprimidos (reduccion) | Precision zero-shot | Precision tras healing | Delta vs profesor (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,63x | 67.034.882 (-38,8 %) | 59,75 % | 50,92 % (LoRA) | -40,71 % |
| 128 | 2,39x | 45.792.002 (-58,2 %) | 52,41 % | 50,92 % (LoRA) | -40,71 % |
| 64 (checkpoint publicado) | 3,11x | 35.170.562 (-67,9 %) | 51,49 % | 71,56 % (LoRA) | -20,07 % |
| 32 | 3,67x | 29.859.842 (-72,7 %) | 50,46 % | 67,32 % (LoRA) | -24,31 % |

El checkpoint empaquetado en Hugging Face corresponde a `k=64`, con una precisión final de 71,56 % en validación. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible; no son aplicables a un encoder de clasificación.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (35,17 M de parámetros); el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor evaluó en NVIDIA GeForce RTX 3090 (24 GB), pero el modelo es sobredimensionado para ese hardware.
- Cabe en cualquier GPU de consumo (GTX 1050, RTX 2060, RTX 3060, RTX 4090) y también en CPU.
- Opciones de despliegue: el flujo documentado usa `transformers` con `BertForSequenceClassification` más `neuralops.core.compression_pipeline.compress_model` para reconstruir la topología antes de cargar el state dict. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, dado que el formato es un state dict de PyTorch con topología comprimida propietaria.
- Latencia y throughput: no disponibles en la información proporcionada. El autor solo indica un presupuesto de 45 segundos para el healing LoRA, no cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-comp-cachenotes-compressor-sst2` (k=64) | 35,17 M | no disponible | 71,56 % | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor, afinado SST-2) | 109,48 M | 512 tokens | 91,63 % (referencia del autor) | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~66 M | 512 tokens | no disponible en la informacion proporcionada | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | 109,48 M | 512 tokens | no disponible en la informacion proporcionada | Apache 2.0 | Hugging Face |

La comparación relevante es con el profesor: el checkpoint comprimido pierde 20,07 puntos de precisión a cambio de un 67,9 % menos de parámetros. Frente a DistilBERT, el modelo comprimido es aún más pequeño, pero no hay datos públicos de precisión de DistilBERT en esta información para establecer una comparación directa.

## Limitaciones y advertencias

- Degradación severa de precisión: 71,56 % frente al 91,63 % del profesor, una caída de 20,07 puntos que lo sitúa por debajo de muchas alternativas estándar para SST-2.
- Resultados no verificados: la métrica está marcada como `verified: false` en el model-index; procede de la evaluación del propio autor.
- Comportamiento anómalo en el barrido: en `k=256` y `k=128` el healing LoRA empeora la precisión zero-shot (de 59,75 % a 50,92 % y de 52,41 % a 50,92 %), lo que sugiere inestabilidad en el procedimiento de recuperación.
- Solo inglés: el vocabulario y el preentrenamiento son de `bert-base-uncased`; no hay soporte multilingüe.
- Sin datos de sesgo: el autor no documenta evaluaciones de sesgo, toxicidad ni robustez.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas sistemáticas en dominios alejados de SST-2.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo base BERT-base-uncased está bajo Apache 2.0; conviene revisar ambas licencias en producción.
- Dependencia del ecosistema NeuralOps: la carga requiere la librería `neuralops` y la reconstrucción explícita de la topología comprimida; no es un checkpoint estándar de `transformers`.
- Contexto máximo no documentado en la model card; se hereda presumiblemente el límite de 512 tokens de BERT-base, pero el autor no lo confirma.
- Madurez baja: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 10 de noviembre de 2026.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-cachenotes-compressor-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/kv_cache/cachenotes_compressor.py
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE: https://huggingface.co/datasets/nyu-mll/glue
