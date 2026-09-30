# yuriilaba/ucu-wsd-aug16-generation_mlm_pt-false_seed-123

## Resumen
El modelo `yuriilaba/ucu-wsd-aug16-generation_mlm_pt-false_seed-123` es un ajuste fino para desambiguación del sentido de las palabras (WSD) en ucraniano, desarrollado por el usuario `yuriilaba`. Parte del modelo base `sentence-transformers/paraphrase-multilingual-mpnet-base-v2` y se distribuye en formato safetensors con 278.043.648 parámetros (~278 M), lo que lo sitúa en la gama de modelos encoder pequeños y manejables en hardware de consumo.

La model card indica que se entrenó sobre un conjunto de tripletas (`triplets_generation_mask_16_samples.csv`) con pooling del token objetivo desactivado (`False`), semilla de entrenamiento 123 y semilla de validación 42. En la evaluación reportada por el autor alcanza una precisión WSD de 0,9183 y valores STS de 0,8095 (Pearson) y 0,7987 (Spearman). No se especifican licencia, idiomas soportados ni longitud de contexto en los metadatos de HuggingFace.

El modelo es relevante para tareas de PLN en ucraniano que requieran desambiguación léxica o representaciones semánticas de frases, especialmente por su tamaño reducido y su base multilingüe. Sin embargo, la ausencia de licencia declarada, de descargas y de documentación sobre sesgos o datos de entrenamiento limita su uso directo en producción sin una evaluación adicional.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder de tipo XLM-RoBERTa (etiqueta del repositorio); modelo base: `sentence-transformers/paraphrase-multilingual-mpnet-base-v2` |
| Parámetros totales | 278.043.648 (~278 M) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el repositorio usa safetensors. En variantes similares del mismo autor se observa F32, pero no se confirma para este modelo |
| Idiomas soportados | Ucraniano para la tarea WSD según la model card; metadatos de idioma no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | no disponible |
| Descargas | 0 |
| Likes | 0 |
| Tamaño del repo | 1.1 GB |
| Fecha de creación | 2026-09-30T14:56:19.000Z |
| Fecha de actualización | 2026-09-30T15:02:31.000Z |

## Arquitectura y entrenamiento
El modelo se construye sobre `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`, un encoder transformer multilingüe orientado a la generación de embeddings de frase. La etiqueta `xlm-roberta` del repositorio y el modelo base declarado apuntan a una arquitectura de tipo transformer encoder, no a un modelo generativo autoregresivo ni a una arquitectura MoE o SSM.

El ajuste fino se realizó para WSD en ucraniano. La model card especifica que los datos de entrenamiento provienen de `local_datasets/semi_supervised_2/triplets/triplets_generation_mask_16_samples.csv`, con pooling del token objetivo desactivado, semilla de entrenamiento 123 y semilla de validación 42. No se detalla el número de tokens, la composición completa del dataset, la función de pérdida ni si hubo RLHF o DPO. La evaluación reportada incluye precisión WSD y métricas STS, con resultados completos por tarea MTEB en `evaluation/mteb_results/`.

## Capacidades
- Desambiguación del sentido de palabras (WSD) en ucraniano: asigna sentidos a palabras polisémicas en contexto, con una precisión reportada de 0,9182509505703422.
- Evaluación de similitud semántica textual (STS): obtiene 0,8094570768458162 de Pearson y 0,7986835479217663 de Spearman.
- Generación de embeddings de frase: al derivar de un modelo `sentence-transformers`, puede producir representaciones vectoriales para similitud, clustering o recuperación; no se especifica la dimensión en la información disponible.
- Capacidad multilingüe heredada del modelo base: el modelo base es multilingüe, pero el ajuste se declara para ucraniano y no hay confirmación de rendimiento en otros idiomas.
- No hay evidencia de soporte de tool calling, function calling, agentes, razonamiento multi-step, visión, audio o modo thinking en la información proporcionada.
- No se describe como modelo generativo de texto abierto; la model card lo presenta como modelo ajustado para WSD y evaluación STS.

## Casos de uso
- Desambiguación léxica en pipelines de PLN ucraniano: integrar el modelo para etiquetar automáticamente el sentido de palabras polisémicas en corpus, aprovechando la precisión WSD reportada de 0,9183.
- Búsqueda semántica en ucraniano: indexar documentos y consultas mediante embeddings y recuperar pasajes por similitud vectorial; los valores STS cercanos a 0,80 respaldan la calidad de la similitud.
- Clustering y deduplicación de documentos: agrupar artículos, noticias o comentarios por similitud semántica para reducir contenido duplicado o organizar grandes colecciones textuales.
- Traducción asistida y posedición: desambiguar términos polisémicos antes de traducir, mejorando la selección léxica en ucraniano y reduciendo errores de sentido.
- Análisis de opiniones y clasificación de textos: generar representaciones de frases para alimentar clasificadores de sentimiento, tópicos o intención en ucraniano.
- Anotación semiautomática de recursos lingüísticos: ayudar a crear corpus anotados con sentidos, acelerando el trabajo de lingüistas y anotadores humanos.
- Evaluación de modelos de embeddings: utilizar el pipeline MTEB incluido en `evaluation/mteb_results/` para comparar tareas de similitud y recuperación con otros modelos.
- Sistemas de recomendación de contenido textual: calcular similitud entre documentos y perfiles de usuario para recomendar lecturas, artículos o respuestas en ucraniano.

## Benchmarks y rendimiento
| Métrica | Resultado |
|---|---|
| WSD accuracy | 0.9182509505703422 |
| STS Pearson | 0.8094570768458162 |
| STS Spearman | 0.7986835479217663 |

Los resultados completos por tarea MTEB están en `evaluation/mteb_results/` dentro del repositorio. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generativos en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: al tener 278 M parámetros, los pesos en F32 ocupan aproximadamente 1,1 GB; en FP16/BF16, unos 0,56 GB; en INT8, unos 0,28 GB. Con activaciones y overhead, se puede estimar un uso de 1,5-2,5 GB en F32, 1-1,5 GB en FP16 y 0,7-1 GB en INT8.
- GPU recomendadas: cabe en GPUs de consumo con 4 GB o más, como GTX 1650, RTX 3050 o RTX 3060. Para lotes grandes, una T4, RTX 4090 o A100 es más que suficiente; no requiere H100.
- Inferencia en CPU: es viable, aunque con mayor latencia que en GPU. El tamaño reducido del modelo facilita su ejecución en entornos sin acelerador.
- Opciones de despliegue: compatible con `transformers` y `sentence-transformers`. No hay soporte declarado para vLLM, llama.cpp, Ollama o TGI en la información proporcionada; al ser un encoder, llama.cpp y Ollama no son los formatos habituales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | WSD accuracy | STS Pearson | STS Spearman | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| `yuriilaba/ucu-wsd-aug16-generation_mlm_pt-false_seed-123` | 278.043.648 | no disponible | 0.9182509505703422 | 0.8094570768458162 | 0.7986835479217663 | no disponible | HuggingFace |
| `yuriilaba/ucu-wsd-generation_all_combined_pt-true_seed-456` | ~0,3 B (según búsqueda) | no disponible | 0.9375792141951838 | 0.8023273548423545 | 0.7915177259986247 | no disponible | HuggingFace |
| `yuriilaba/ucu-wsd-generation_all_combined_pt-true_seed-42` | ~0,3 B (según búsqueda) | no disponible | 0.9369455006337135 | 0.8010580386623065 | 0.7905856750849093 | no disponible | HuggingFace |
| `yuriilaba/ucu-wsd-generation_dropout_pt-true_seed-456` | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| `sentence-transformers/paraphrase-multilingual-mpnet-base-v2` | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos de licencia ni de benchmarks comparables de modelos externos en la información proporcionada. Las variantes del mismo autor muestran una precisión WSD ligeramente superior en los conjuntos `all_combined`, aunque con valores STS algo inferiores.

## Limitaciones y advertencias
- Licencia no disponible: no se puede confirmar si está permitido el uso comercial ni las condiciones de redistribución.
- Sin descargas ni likes: no hay validación comunitaria, informes de uso en producción ni evidencia de mantenimiento.
- WSD evaluado únicamente en ucraniano y con una semilla de validación concreta (42); la generalización a otros dominios, registros o variantes dialectales no está demostrada.
- Longitud de contexto no disponible: puede limitar el tamaño de los textos de entrada en tareas de desambiguación o similitud.
- Riesgo de sesgos: no se documenta la composición del dataset de tripletas ni posibles sesgos lingüísticos, demográficos o de dominio.
- Alucinación: al no ser un modelo generativo abierto, el riesgo de alucinación textual no aplica de la misma forma; en clasificación puede producir etiquetas de sentido erróneas.
- Rendimiento STS en torno a 0,80: puede haber errores en similitud semántica que afecten a recuperación, clustering o recomendación.
- No se especifican tipos de cuantización ni formatos alternativos como GGUF u ONNX en la información disponible.
- El repositorio usa safetensors y ocupa 1,1 GB; es compatible con `transformers`, pero no se confirma soporte en vLLM, Ollama, TGI u otros servidores de inferencia.

## Enlaces
- HuggingFace: https://huggingface.co/yuriilaba/ucu-wsd-aug16-generation_mlm_pt-false_seed-123
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-mpnet-base-v2
- Variante: https://huggingface.co/yuriilaba/ucu-wsd-generation_dropout_pt-true_seed-456
- Variante: https://huggingface.co/yuriilaba/ucu-wsd-generation_all_combined_pt-true_seed-456
- Variante: https://huggingface.co/yuriilaba/ucu-wsd-generation_all_combined_pt-true_seed-42
- No se han encontrado papers, blogs o demos relevantes en la búsqueda web; los resultados adicionales (llm-stats.com, betterwaifu.com) no están relacionados con este modelo.
