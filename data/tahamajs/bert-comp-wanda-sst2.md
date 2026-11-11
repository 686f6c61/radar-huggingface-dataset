# tahamajs/bert-comp-wanda-sst2

## Resumen

`tahamajs/bert-comp-wanda-sst2` es un checkpoint de `google-bert/bert-base-uncased` afinado para clasificación de sentimiento en GLUE SST-2 y posteriormente procesado con el motor de compresión `WandaCompressor` de la librería NeuralOps. Wanda es una técnica de poda (pruning) que elimina pesos según el producto de su magnitud por la norma de las activaciones de entrada, un criterio que habitualmente supera a la poda por magnitud pura en modelos transformer.

El punto llamativo del repositorio es que, pese a la etiqueta de "modelo comprimido", la relación de compresión declarada es `1.00x`: el checkpoint empaquetado conserva los `109.483.778` parámetros del BERT-Base original, sin reducción física alguna (`-0.00%`). Las cuatro configuraciones de rango evaluadas (`k=256, 128, 64, 32`) producen exactamente el mismo recuento de parámetros y la misma precisión, lo que sugiere que la poda no llegó a materializarse en el artefacto serializado o que los rangos evaluados no implican eliminación efectiva de pesos.

Es relevante ahora como ejemplo documentado del flujo de trabajo de NeuralOps (evaluación multi-rango, "LoRA healing" condicional y telemetría en `compression_summary.json`), más que como modelo de producción. Su utilidad real es servir de referencia reproducible de una pipeline de compresión sobre una tarea estándar como SST-2, con una precisión de validación declarada de `87,84%` frente al `91,63%` del profesor sin comprimir.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Base: 12 capas, dimensión oculta 768) |
| Parametros totales | 109.483.778 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT-Base admite 512 tokens, dato no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica `pytorch_model.bin` en precisión completa) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`); sin safetensors ni GGUF publicados |

## Arquitectura y entrenamiento

La arquitectura subyacente es BERT-Base uncased, un transformer encoder bidireccional de 12 capas y 768 dimensiones ocultas, preentrenado por Google y afinado aquí sobre GLUE SST-2 (clasificación binaria de sentimiento, 2 etiquetas). Sobre ese modelo se aplica `WandaCompressor`, que puntúa cada peso por `|W_ij| · ||X_j||_2` (magnitud del peso multiplicada por la norma L2 de la activación de entrada en esa columna) y poda los de menor puntuación. La model card indica que, cuando la compresión zero-shot degrada más de 2,0 puntos con una reducción superior a 1,10x, NeuralOps activa un "LoRA healing" con `r=8`, 50 pasos, `lr=2e-4` y un presupuesto de 45 segundos.

En la práctica, el checkpoint publicado no refleja ninguna de esas reducciones: los cuatro rangos evaluados devuelven `109.483.778` parámetros y `1.000x` de ratio, y la columna "LoRA Recovery Applied" figura como `False`. La evaluación se realizó sobre la partición de validación de SST-2 (872 muestras) en una NVIDIA GeForce RTX 3090 de 24 GB. No se documentan en la información disponible los volúmenes de datos de afinado, la composición del dataset más allá de GLUE SST-2, ni si hubo RLHF/DPO (no aplicable en un clasificador).

## Capacidades

- Clasificación binaria de sentimiento en inglés (negativo/positivo) sobre texto de una sola frase o párrafo corto.
- Extracción de logits por clase mediante `BertForSequenceClassification`, apta para umbralización y calibración posterior.
- Aprendizaje por transferencia desde un encoder BERT-Base genérico, reutilizable como extractor de representaciones contextuales.
- No soporta tool calling ni function calling: es un clasificador, no un modelo generativo.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- Capacidad multilingüe: no disponible; solo inglés (vocabulario `bert-base-uncased`).
- Sin modo "thinking", visión ni audio.

## Casos de uso

- Análisis de opiniones en inglés para paneles de producto: clasificar reseñas o tuits en positivas/negativas con un encoder de 110M parámetros, mucho más barato de servir que un LLM generativo para esta tarea acotada.
- Moderación de comentarios a escala: filtrar automáticamente tono negativo en foros o secciones de comentarios, usando el clasificador como primera capa de triaje antes de revisión humana.
- Enriquecimiento de datasets de investigación: etiquetar corpus de texto en inglés con polaridad para construir conjuntos de entrenamiento de modelos mayores o para estudios de sesgo lingüístico.
- Detección de sentimiento en atención al cliente: procesar encuestas post-interacción y agregar métricas de satisfacción por canal o producto, dado el bajo coste de inferencia del modelo.
- Baseline reproducible en experimentos de compresión: servir como referencia del flujo NeuralOps (poda Wanda + LoRA healing) para comparar contra otras técnicas de compresión sobre SST-2.
- Componente en pipelines de CI/CD de NLP: validar que cambios en un preprocesado o en un tokenizador no degradan la precisión de un clasificador de sentimiento de referencia.
- Filtrado previo en sistemas de recomendación: descartar contenido con polaridad negativa antes de indexarlo o mostrarlo, reduciendo el ruido en el catálogo.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (`verified: false`):

| Modelo | Dataset / split | Métrica | Valor |
|---|---|---|---|
| bert-comp-wanda-sst2 (k=32, empaquetado) | GLUE SST-2, validation (872 muestras) | Accuracy | 87,84% |
| BERT-Base profesor (referencia del autor) | GLUE SST-2, validation | Accuracy | 91,63% |
| Delta de paridad | — | Accuracy | -3,79 puntos |

Evaluación multi-rango declarada por el autor (misma precisión en todos los rangos):

| Rank (k) | Ratio físico | Parámetros comprimidos | Zero-shot Acc | Healed Acc |
|---|---|---|---|---|
| 256 | 1,00x | 109.483.778 (-0,0%) | 87,84% | 87,84% |
| 128 | 1,00x | 109.483.778 (-0,0%) | 87,84% | 87,84% |
| 64 | 1,00x | 109.483.778 (-0,0%) | 87,84% | 87,84% |
| 32 | 1,00x | 109.483.778 (-0,0%) | 87,84% | 87,84% |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otras tareas generativas, ni comparaciones con modelos de terceros.

## Requisitos de hardware

- VRAM para inferencia: en FP32 el checkpoint ocupa aproximadamente 438 MB de pesos (451,9 MB de artefacto); con activaciones y overhead de runtime, cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU moderna sirve; para lotes grandes, una RTX 3090 (la usada por el autor para la evaluación) o una A10/A100 aportan margen de sobra.
- Cabe en GPU de consumo: sí, en GTX 1650, RTX 3060, RTX 4060 y superiores; también en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: al publicarse solo `pytorch_model.bin` y requerir la reconstrucción de la topología con `neuralops.core.compression_pipeline.compress_model`, no es directamente cargable con `AutoModel.from_pretrained` estándar. Para servir en producción conviene exportar a safetensors/ONNX o convertir a GGUF para llama.cpp/Ollama una vez reconstruido el state dict.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia cualitativa, un BERT-Base de 110M en una RTX 3090 admite lotes de cientos de secuencias por segundo, pero no hay cifras publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tahamajs/bert-comp-wanda-sst2 | 109,5M | no disponible | 87,84% (declarado, no verificado) | MIT | Hugging Face, requiere NeuralOps |
| google-bert/bert-base-uncased (profesor del autor) | 109,5M | 512 tokens (BERT-Base) | 91,63% (referencia del autor) | Apache 2.0 | Hugging Face, transformers estándar |
| DistilBERT-base-uncased-finetuned-sst-2 | ~66M | 512 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face, transformers estándar |
| RoBERTa-base (SST-2) | ~125M | 512 tokens | no disponible en esta ficha | MIT | Hugging Face, transformers estándar |

La comparativa se limita a modelos de la misma familia y tamaño; no se dispone de cifras de benchmarks de los alternativos en la información proporcionada, por lo que solo se contrastan parámetros, licencia y vía de carga.

## Limitaciones y advertencias

- El checkpoint no aplica compresión efectiva: el ratio declarado es `1.00x` y el recuento de parámetros es idéntico al del BERT-Base original, por lo que no ofrece ninguna ventaja de tamaño, memoria o latencia frente al modelo base.
- Precisión inferior al profesor: `87,84%` frente a `91,63%` en SST-2 validation, una caída de 3,79 puntos sin contrapartida en reducción de parámetros.
- El resultado de benchmark está marcado como `verified: false`; no ha sido reproducido de forma independiente.
- Solo inglés: el vocabulario y el afinado están restringidos a `en`, sin capacidades multilingües.
- Riesgo de alucinación no aplicable (es un clasificador), pero sí de clasificaciones erróneas en dominios alejados de SST-2 (crítica de cine), como sarcasmo, jerga o texto técnico.
- Sesgos heredados del preentrenamiento de BERT-Base y del corpus SST-2, que proviene de reseñas de películas y no representa el registro de otros dominios.
- Carga no estándar: requiere instalar NeuralOps y reconstruir la topología antes de cargar el state dict; no funciona con `AutoModel.from_pretrained` directo ni con `pipeline("text-classification")` sin trabajo adicional.
- Licencia MIT permite uso comercial, pero conviene verificar la licencia del modelo base (Apache 2.0) y de NeuralOps, que el autor enlaza en su repositorio de GitHub.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-wanda-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de WandaCompressor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/pruning/wanda.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
