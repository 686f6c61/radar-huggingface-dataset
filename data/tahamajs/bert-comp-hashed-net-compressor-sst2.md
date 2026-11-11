# tahamajs/bert-comp-hashed-net-compressor-sst2

## Resumen

`bert-comp-hashed-net-compressor-sst2` es un checkpoint experimental de clasificación de sentimiento publicado por Taha Majlesi (tahamajs) dentro del proyecto NeuralOps. Parte de `google-bert/bert-base-uncased`, afinado sobre GLUE SST-2 y procesado con el compresor `hashed_net_compressor` (`hashed_net_factory`), que agrupa matrices de pesos en una tabla compartida de parámetros mediante proyecciones hash pseudoaleatorias. El objetivo declarado es demostrar la viabilidad del pipeline de compresión y del mecanismo de recuperación con LoRA sobre un modelo de referencia consolidado.

El resultado publicado es, sin embargo, un caso de compresión nula: el checkpoint serializado en el rango `k=32` conserva los 109.483.778 parámetros del BERT-base original, con una ratio de compresión física de 1.00x y una reducción del 0,00 %. La accuracy en validación de GLUE SST-2 (872 muestras) es del 91,63 %, idéntica al baseline del profesor, por lo que no hay degradación pero tampoco ahorro de memoria ni de cómputo.

Su relevancia es, por tanto, metodológica y de reproducibilidad: sirve como referencia dentro del zoo de compresores de NeuralOps, como ejemplo de integración con la librería `neuralops` y como punto de partida para quien quiera replicar la evaluación multi-rango (`k=256, 128, 64, 32`) sobre BERT. No es un modelo pensado para producción ni para sustituir a un clasificador de sentimiento estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base), 12 capas, dimensión oculta 768 |
| Parámetros totales | 109.483.778 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (BERT-base estándar: 512 tokens) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado); tokenizer en `vocab.txt`, `tokenizer.json`, `tokenizer_config.json` |
| Compresor | `hashed_net_compressor` (`hashed_net_factory`, familia experimental) |
| Rango de compresión (`k`) | 32 (checkpoint publicado); evaluados 256, 128, 64, 32 |
| Ratio de compresión física | 1.00x (0,0 % de ahorro) |
| Tarea | Clasificación de texto (2 etiquetas: negativo / positivo) |
| Librería | `neuralops` |
| Tamaño del repo | 0,2 GB |
| Modelo base | `google-bert/bert-base-uncased` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un BERT-base estándar: 12 capas de encoder transformer con atención multi-cabeza, dimensión oculta de 768 y 109.483.778 parámetros. Sobre ese modelo se aplica el compresor `hashed_net_compressor`, que según la model card comprime las matrices de pesos en una tabla compacta de parámetros compartidos mediante proyecciones hash pseudoaleatorias. En la práctica, el checkpoint publicado no reduce el número de parámetros: el rango `k=32` produce una ratio de 1.000x y una reducción del 0,00 %, y el campo `LoRA Recovery Applied` figura como `False`.

El ajuste se realizó sobre GLUE SST-2, con evaluación en el split de validación (872 muestras) sobre una NVIDIA GeForce RTX 3090 de 24 GB. El pipeline de NeuralOps contempla una fase de "healing" con LoRA de rango `r=8`, 50 pasos, `lr=2e-4` y un presupuesto de 45 segundos, que se activa cuando la compresión zero-shot degrada la accuracy más de un 2,0 % con una reducción superior a 1,10x. En este caso no se activó, porque no hubo ni degradación ni reducción. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset más allá de SST-2 ni si hubo RLHF o DPO.

## Capacidades

- Clasificación binaria de sentimiento en inglés (negativo / positivo) sobre textos tipo reseña.
- Inferencia directa con `BertForSequenceClassification` tras reconstruir la topología comprimida con `compress_model`.
- Carga del state dict con `strict=False`, lo que permite tolerar discrepancias entre la topología reconstruida y los pesos serializados.
- Evaluación multi-rango documentada (`k=256`, `128`, `64`, `32`) con telemetría en `compression_summary.json`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modos de "thinking".
- Capacidad multilingüe limitada al inglés; el tokenizer es el vocabulario `bert-base-uncased` estándar.
- No es un modelo generativo: no produce texto libre, solo logits de clasificación.

## Casos de uso

- Reproducción de experimentos de compresión: sirve como referencia para validar que el pipeline `hashed_net_compressor` de NeuralOps reconstruye correctamente un BERT-base y mantiene la accuracy del profesor en SST-2 (91,63 %).
- Análisis de sentimiento en reseñas de productos o críticas de cine en inglés: el modelo clasifica frases cortas en positivo o negativo con un accuracy del 91,63 % en validación, suficiente para tareas de etiquetado exploratorio.
- Baseline en estudios de compresión: al conservar exactamente los parámetros del profesor, permite aislar el efecto de otros compresores (cuantización, poda, low-rank) comparando contra un punto de partida sin pérdida.
- Docencia y formación: ejemplo didáctico de cómo integrar un compresor experimental con `transformers` y `neuralops`, incluyendo el flujo de descarga desde Hugging Face y la carga con `strict=False`.
- Pruebas de integración del ecosistema NeuralOps: verificar que `compress_model`, `compression_summary.json` y el registro `COMPRESSOR_REGISTRY` funcionan de extremo a extremo en un entorno controlado.
- Filtrado de comentarios en pipelines de moderación de contenido en inglés: como clasificador auxiliar de polaridad para preetiquetar grandes volúmenes antes de una revisión humana, dado su bajo coste de inferencia en GPU consumer.
- Benchmark de latencia en RTX 3090: al no haber reducción de parámetros, mide el coste base del pipeline de reconstrucción frente a la inferencia directa de BERT-base, útil para cuantificar el overhead de la capa de compresión.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, campo `verified: false`):

| Benchmark | Métrica | Valor |
|---|---|---|
| GLUE SST-2 (validación, 872 muestras) | Accuracy | 91,63 % |

Evaluación multi-rango sobre GLUE SST-2 (validación):

| Rango (`k`) | Ratio físico | Parámetros (reducción) | Accuracy zero-shot | Accuracy con healing | Paridad vs profesor |
|---|---|---|---|---|---|
| 256 | 1.00x | 109.483.778 (-0,0 %) | 91,63 % | 91,63 % | +0,00 % |
| 128 | 1.00x | 109.483.778 (-0,0 %) | 91,63 % | 91,63 % | +0,00 % |
| 64 | 1.00x | 109.483.778 (-0,0 %) | 91,63 % | 91,63 % | +0,00 % |
| 32 (publicado) | 1.00x | 109.483.778 (-0,0 %) | 91,63 % | 91,63 % | +0,00 % |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,44 GB solo para pesos (109,5 M de parámetros × 4 bytes), más activaciones y overhead del framework; en la práctica, entre 1 y 2 GB en FP32 y menos de 1 GB en FP16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. La evaluación del autor se realizó en una NVIDIA GeForce RTX 3090 (24 GB), muy por encima de lo necesario.
- Cabe holgadamente en GPU consumer: RTX 3060, RTX 4060, GTX 1660, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: el flujo documentado usa `transformers` + `neuralops` + `huggingface_hub`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al ser un modelo de clasificación con state dict en `pytorch_model.bin` no hay pesos GGUF publicados.
- Latencia y throughput: no disponibles en la información proporcionada. Al no haber reducción de parámetros, el coste de inferencia equivale al de un BERT-base estándar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bert-comp-hashed-net-compressor-sst2` (este) | 109,5 M | No disponible | 91,63 % | MIT | Hugging Face, librería `neuralops` |
| `google-bert/bert-base-uncased` (profesor) | 109,5 M | 512 | 91,63 % (referencia del autor) | Apache 2.0 | Hugging Face, `transformers` |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 | No disponible en esta información | Apache 2.0 | Hugging Face, `transformers` |
| `textattack/bert-base-uncased-SST-2` | 109,5 M | 512 | No disponible en esta información | Apache 2.0 | Hugging Face, `transformers` |

La comparativa con alternativas de la misma categoría se limita a lo anterior: no se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada, por lo que no se establece una comparación cuantitativa de rendimiento más allá del valor del profesor citado por el autor.

## Limitaciones y advertencias

- Compresión nula: el checkpoint publicado no reduce parámetros (1.00x, 0,00 % de ahorro), por lo que no aporta ninguna ventaja de memoria, latencia o almacenamiento frente a BERT-base.
- Modelo marcado como `experimental` por el propio autor; no debe tratarse como un artefacto estable para producción.
- El resultado de 91,63 % está declarado por el autor con `verified: false`; no ha sido verificado de forma independiente.
- La carga requiere reconstruir la topología con `compress_model` y usar `strict=False`, lo que puede enmascarar pesos no cargados correctamente; conviene validar la accuracy tras la reconstrucción.
- Solo inglés: no hay soporte multilingüe ni evaluación en otros idiomas.
- Clasificador binario de sentimiento: no genera texto, no razona y no soporta tool calling ni agentes; el uso fuera de la clasificación de polaridad no está previsto.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas en dominios alejados de SST-2 (por ejemplo, sarcasmo, jerga técnica o textos largos).
- Sesgos heredados de `bert-base-uncased` y de la composición de SST-2 (reseñas de cine), que no representa la distribución de otros dominios.
- Licencia MIT para el checkpoint, pero el modelo base `google-bert/bert-base-uncased` se distribuye bajo Apache 2.0; conviene revisar ambas condiciones antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que refleja una adopción prácticamente nula y ausencia de validación por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-hashed-net-compressor-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/experimental/hashed_net_compressor.py
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
