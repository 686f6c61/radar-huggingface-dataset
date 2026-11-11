# tahamajs/bert-comp-mgie-budget-sst2

## Resumen

`tahamajs/bert-comp-mgie-budget-sst2` es un checkpoint comprimido de `google-bert/bert-base-uncased` afinado previamente sobre GLUE SST-2 (clasificación binaria de sentimiento en inglés). Lo publica Taha Majlesi dentro del proyecto NeuralOps, una librería de compresión de modelos que incluye un zoo de compresores (`compressor-zoo`). El modelo aplica el compresor `mgie_budget` (`MGIESVDBudgetCompressor`, familia `low_rank`), que realiza una descomposición SVD con asignación global de rangos proporcional a la entropía, y posteriormente un "healing" mediante LoRA de rango 8 para recuperar parte de la precisión perdida.

El resultado es un modelo de 35,17 millones de parámetros (frente a los 109,48 millones del BERT-base original), lo que supone una reducción del 67,88 % y un ratio de compresión físico de 3,113x. El checkpoint empaquetado corresponde al rango k=64, seleccionado como punto Pareto entre los rangos evaluados (256, 128, 64 y 32). La precisión final en la validación de SST-2 es del 74,77 %, frente al 91,63 % del profesor original, una pérdida de 16,86 puntos.

Su relevancia es fundamentalmente metodológica: sirve como referencia reproducible de hasta dónde se puede comprimir un encoder BERT pequeño manteniendo un rendimiento aceptable, y como ejemplo de pipeline de compresión más healing con LoRA. No es un modelo pensado para producción de alta precisión, sino un artefacto de investigación sobre compresión de modelos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (12 capas, dimensión oculta D=768), con topología comprimida por SVD de bajo rango y adaptadores LoRA de healing |
| Parámetros totales | 35.170.562 (comprimido); modelo base original: 109.483.778 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base BERT-base-uncased soporta 512 tokens; no se especifica en la model card) |
| Tipos de cuantización | No disponible (el artefacto se distribuye en `pytorch_model.bin` en precisión completa; no se documentan variantes cuantizadas) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`), más `config.json`, `compression_summary.json` y assets del tokenizador de `bert-base-uncased` |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased`, un transformer encoder de 12 capas y 768 dimensiones ocultas con 109,48 millones de parámetros, ya afinado sobre GLUE SST-2. Sobre ese checkpoint se aplica el compresor `MGIESVDBudgetCompressor` con rango k=64, que descompone las matrices de pesos en factores de bajo rango y asigna rangos de forma global y proporcional a la entropía de cada matriz, en lugar de aplicar un rango uniforme. El resultado físico es un state dict de 35,17 millones de parámetros.

La compresión zero-shot degrada la precisión de validación de SST-2 del 91,63 % (profesor) al 51,38 %, prácticamente azar en una tarea binaria. Por ello, NeuralOps aplica un healing con LoRA de rango r=8, 50 pasos de entrenamiento, learning rate 2e-4 y un presupuesto de 45 segundos en una NVIDIA GeForce RTX 3090 (24 GB), lo que eleva la precisión al 74,77 %. La evaluación se realizó sobre las 872 muestras de la partición de validación de GLUE SST-2. No se documenta en la información disponible el volumen de datos de preentrenamiento original de BERT ni detalles adicionales sobre RLHF/DPO (no aplicables a un encoder de clasificación).

## Capacidades

- Clasificación binaria de sentimiento en inglés (positivo/negativo) sobre texto tipo reseña, con dos etiquetas de salida.
- Encoder de representaciones textuales en inglés, reutilizable para extracción de características o fine-tuning posterior.
- Inferencia ligera: 35,17 millones de parámetros y un checkpoint de aproximadamente 67,2 MB, adecuado para entornos con recursos limitados.
- No soporta tool calling ni function calling: es un modelo de clasificación, no un modelo generativo.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe: no disponible; solo inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Clasificación de sentimiento en reseñas de producto o comentarios de usuarios en inglés: el modelo devuelve directamente una etiqueta binaria (0=negativo, 1=positivo) con un coste de inferencia muy bajo gracias a sus 35,17 millones de parámetros.
- Filtrado previo en pipelines de moderación de contenido: puede usarse como clasificador rápido de primera etapa para descartar o priorizar textos antes de pasarlos a un modelo mayor.
- Etiquetado a gran escala de corpus en inglés: su reducido tamaño permite procesar volúmenes altos de documentos en CPU o GPU de gama baja, aceptando la pérdida de precisión frente al profesor.
- Docencia y experimentación en compresión de modelos: sirve como caso reproducible para estudiar el efecto del rango k y del healing con LoRA sobre la precisión downstream.
- Baseline de referencia en investigación sobre compresión: permite comparar nuevas técnicas de compresión de bajo rango contra un punto Pareto documentado (k=64, 3,11x, 74,77 %).
- Despliegue en dispositivos con memoria limitada: el checkpoint de 67,2 MB cabe en entornos embebidos o contenedores pequeños donde un BERT completo resulta excesivo.
- Pruebas de integración de la librería NeuralOps: el snippet de la model card permite reconstruir la topología comprimida y cargar los pesos, útil para validar pipelines de compresión.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente). Evaluación sobre GLUE SST-2, partición de validación (872 muestras), en NVIDIA GeForce RTX 3090.

| Rank (k) | Ratio físico | Parámetros comprimidos (reducción) | Precisión zero-shot | Precisión con LoRA | Diferencia vs profesor (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,63x | 67.034.882 (-38,8 %) | 59,52 % | 68,58 % | -23,05 % |
| 128 | 2,39x | 45.792.002 (-58,2 %) | 52,41 % | 66,97 % | -24,66 % |
| 64 (checkpoint publicado) | 3,11x | 35.170.562 (-67,9 %) | 51,38 % | 74,77 % | -16,86 % |
| 32 | No disponible | No disponible | FAIL_CRASH | No disponible | No disponible |

Precisión declarada del checkpoint publicado: 74,77 % en GLUE SST-2 validation (accuracy, `verified: false`). No se han publicado en la información disponible resultados de otros benchmarks como MMLU, HumanEval o GSM8K, que además no aplican a un encoder de clasificación.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 35,17 millones de parámetros (unos 141 MB de pesos), más activaciones; el checkpoint empaquetado ocupa aproximadamente 67,2 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor evaluó en NVIDIA GeForce RTX 3090 (24 GB), pero el modelo es sobradamente pequeño para GPUs de gama baja.
- Cabe en GPU de consumo: sí, en cualquier RTX o GTX moderna e incluso en iGPU con suficiente memoria compartida; también es viable en CPU.
- Opciones de despliegue: la model card solo documenta la carga con `transformers` (`BertForSequenceClassification`) más la reconstrucción de la topología con `neuralops.core.compression_pipeline.compress_model`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles. El healing con LoRA se realizó con un presupuesto de 45 segundos en una RTX 3090, pero no se reportan métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (validation) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `tahamajs/bert-comp-mgie-budget-sst2` (k=64) | 35,17 M (comprimido) | No disponible | 74,77 % | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor, afinado SST-2) | 109,48 M | 512 tokens | 91,63 % (declarado por el autor) | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased` | 66 M | 512 tokens | No disponible en la información proporcionada | Apache 2.0 | Hugging Face |
| `prajjwal1/bert-tiny` | 4,4 M | 512 tokens | No disponible en la información proporcionada | Apache 2.0 | Hugging Face |

La comparación con DistilBERT y BERT-tiny se ofrece solo por tamaño y categoría (encoders BERT pequeños para clasificación); no se dispone de sus cifras de SST-2 en la información proporcionada, por lo que no se pueden contrastar rendimientos.

## Limitaciones y advertencias

- Pérdida de precisión notable: 74,77 % frente al 91,63 % del profesor en SST-2, una caída de 16,86 puntos. No es adecuado para aplicaciones donde la precisión de clasificación sea crítica.
- El resultado zero-shot del checkpoint (51,38 %) es prácticamente equivalente al azar en una tarea binaria; el modelo depende del healing con LoRA para ser útil.
- El rango k=32 falló (`FAIL_CRASH`) durante la evaluación, lo que indica que la compresión agresiva no es estable con este compresor en esta configuración.
- Solo inglés: no soporta otros idiomas.
- Sesgos: no se documentan análisis de sesgo en la información disponible; al heredar de `bert-base-uncased`, es probable que arrastre sesgos del corpus original, pero no hay datos concretos.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí puede producir clasificaciones erróneas confiadas en dominios distintos de SST-2 (reseñas de películas).
- Licencia MIT: permite uso comercial, pero el modelo base `google-bert/bert-base-uncased` está bajo Apache 2.0; conviene revisar ambas licencias antes de producción.
- Dependencia de la librería NeuralOps para reconstruir la topología comprimida: no es un checkpoint cargable directamente con `transformers` sin el paso de compresión previo.
- Los benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false`).
- Sin datos de latencia ni throughput publicados, no se puede garantizar un rendimiento de producción concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-mgie-budget-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/low_rank/mgie_svd_compressor.py
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
