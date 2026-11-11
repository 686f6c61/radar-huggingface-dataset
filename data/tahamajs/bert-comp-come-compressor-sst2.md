# tahamajs/bert-comp-come-compressor-sst2

## Resumen

`bert-comp-come-compressor-sst2` es un checkpoint de BERT-Base (`google-bert/bert-base-uncased`) afinado para clasificación de sentimiento en GLUE SST-2 y posteriormente comprimido con el motor `CoMeCompressor` de la librería NeuralOps. El modelo lo publica el usuario `tahamajs` bajo licencia MIT y forma parte de lo que el autor denomina "NeuralOps Compressed & LoRA-Healed Model Zoo", una colección de variantes comprimidas de modelos estándar.

La propuesta es reducir el número de parámetros de un transformer encoder mediante "layer shedding" (eliminación de capas) combinado con adaptadores de interpolación de bajo rango entre las capas retenidas. En el checkpoint publicado, con rango `k=32`, se pasa de 109.483.778 a 97.545.988 parámetros (una reducción del 10,90 %, ratio de compresión físico de 1,122x), aplicando después un "healing" con LoRA de rango 8 para recuperar precisión.

Es relevante como referencia práctica de compresión de modelos: demuestra el compromiso entre reducción de tamaño y degradación de accuracy en una tarea estándar (SST-2), con telemetría publicada para cuatro rangos distintos. No obstante, el modelo es de nicho: clasificación binaria de sentimiento en inglés, con 0 descargas y 0 likes en el momento de la consulta, y requiere la librería NeuralOps para reconstruir la topología comprimida antes de cargar los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Base), comprimido con `CoMeCompressor` (layer shedding + adaptadores low-rank) y LoRA healing |
| Parametros totales | 97.545.988 (modelo comprimido); base original 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (BERT-Base original: 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (PyTorch state dict serializado); tokenizer en formato estandar BERT (`vocab.txt`, `tokenizer.json`, `tokenizer_config.json`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es BERT-Base: 12 capas, dimensión oculta 768, 109.483.778 parámetros. Sobre ese modelo afinado en SST-2 se aplica `CoMeCompressor`, que combina "layer shedding" (eliminación de capas) con adaptadores de interpolación de bajo rango ("bridges") entre capas retenidas no consecutivas. El checkpoint publicado usa rango `k=32`, lo que resulta en 97.545.988 parámetros y un ratio de compresión físico de 1,122x.

El proceso de compresión se evalúa en cuatro rangos (`k=256, 128, 64, 32`) sobre el split de validación de GLUE SST-2 (872 muestras) en una NVIDIA GeForce RTX 3090 (24 GB). Cuando la compresión zero-shot degrada la accuracy más de 2,0 puntos con reducción superior a 1,10x, NeuralOps aplica "LoRA healing" con rango `r=8`, 50 pasos, `lr=2e-4` y un presupuesto de 45 segundos. En el rango `k=32` el modelo zero-shot alcanza 84,63 % y tras el healing sube a 90,14 %, frente al 91,63 % del profesor. No se detalla en la información disponible la composición exacta del dataset de entrenamiento ni si hubo RLHF/DPO (no aplica en un clasificador).

## Capacidades

- Clasificación binaria de sentimiento en inglés (etiquetas 0 = negativo, 1 = positivo) sobre textos tipo SST-2.
- Inferencia estándar de `BertForSequenceClassification` una vez reconstruida la topología comprimida con `compress_model`.
- Carga de pesos con `strict=False`, ya que el state dict incluye factores de bajo rango y adaptadores LoRA integrados.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: no; solo inglés.
- No dispone de modo "thinking", visión ni audio.

## Casos de uso

- Análisis de sentimiento en reseñas de producto: el modelo clasifica polaridad positiva/negativa en inglés con un 90,14 % de accuracy en SST-2, adecuado para filtrado y agregación de opiniones a gran escala.
- Moderación de comentarios en foros y redes: uso como clasificador auxiliar para detectar tono negativo antes de un pipeline de revisión humana.
- Enrutamiento de tickets de soporte: clasificar el sentimiento del mensaje inicial para priorizar clientes insatisfechos en un sistema de atención al cliente.
- Etiquetado de datasets a bajo coste: al ocupar solo 186,2 MB de pesos y requerir menos parámetros que BERT-Base, es viable para pre-etiquetar grandes volúmenes de texto en inglés antes de una revisión manual.
- Investigación en compresión de modelos: sirve como referencia reproducible para comparar `CoMeCompressor` con otras técnicas (pruning, destilación, quantización) sobre una tarea estándar.
- Despliegue en entornos con restricciones de memoria: la reducción del 10,9 % de parámetros permite ejecutar el clasificador en dispositivos con menos VRAM que los necesarios para BERT-Base completo.
- Prototipado de pipelines de clasificación: integración rápida en scripts de Python con `transformers` + `neuralops` para validar una idea antes de invertir en un modelo mayor.

## Benchmarks y rendimiento

Datos declarados por el autor en la model-index y en la model card (no verificados de forma independiente):

| Modelo / variante | Ratio compresion | Parametros | Zero-shot Acc | Healed Acc | Delta vs profesor (91,63 %) |
|---|---:|---:|---:|---:|---:|
| Profesor (BERT-Base SST-2) | 1,00x | 109.483.778 | 91,63 % | 91,63 % | 0,00 % |
| `k=256` | 1,04x | 104.928.003 | 91,40 % | 91,40 % | -0,23 % |
| `k=128` | 1,12x | 97.619.716 | 84,52 % | 89,56 % (LoRA) | -2,07 % |
| `k=64` | 1,12x | 97.570.564 | 84,52 % | 89,33 % (LoRA) | -2,30 % |
| `k=32` (publicado) | 1,12x | 97.545.988 | 84,63 % | 90,14 % (LoRA) | -1,49 % |

Evaluación realizada sobre el split de validación de GLUE SST-2 (872 muestras) en una NVIDIA GeForce RTX 3090 (24 GB). La accuracy del checkpoint publicado (90,14 %) coincide con la declarada en la model-index.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 97,5 M de parámetros en fp32 el modelo ocupa aproximadamente 390 MB de pesos, más activaciones y overhead de framework.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para inferencia en fp32; el autor reporta entrenamiento/evaluación en NVIDIA GeForce RTX 3090 (24 GB).
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `transformers` + `neuralops` (reconstrucción obligatoria de la topología antes de cargar el state dict). No se indica soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 Acc | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| `tahamajs/bert-comp-come-compressor-sst2` | 97.545.988 | no disponible | 90,14 % | MIT | Hugging Face (0 descargas) |
| `google-bert/bert-base-uncased` (profesor SST-2) | 109.483.778 | 512 | 91,63 % (referencia del autor) | Apache 2.0 | Hugging Face (ampliamente usado) |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~66 M | 512 | no disponible en la informacion proporcionada | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | 109.483.778 | 512 | no disponible en la informacion proporcionada | Apache 2.0 | Hugging Face |

La comparativa se limita a lo indicado: el autor solo aporta el dato del profesor (91,63 %) y los resultados de sus propias variantes. No se dispone de cifras oficiales de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Solo clasifica sentimiento binario en inglés; no es un modelo generativo ni sirve para otras tareas sin reentrenamiento.
- Requiere la librería NeuralOps para reconstruir la topología comprimida antes de cargar los pesos; no es un checkpoint estándar de `transformers` cargable directamente.
- El state dict se carga con `strict=False`, lo que puede enmascarar claves faltantes o inesperadas en producción.
- Riesgo de alucinación no aplica (es un clasificador), pero sí de clasificaciones erróneas en dominios alejados de SST-2 (reseñas de películas); no hay evaluación fuera de dominio.
- No se han publicado análisis de sesgos ni de robustez frente a adversariales.
- La licencia MIT permite uso comercial, pero el modelo base BERT-Base está bajo Apache 2.0; conviene revisar la compatibilidad en despliegues comerciales.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay evidencia de uso en producción ni validación independiente de los resultados.
- La accuracy reportada (90,14 %) procede de una única evaluación sobre 872 muestras de validación; la varianza estadística no se documenta.
- No se especifica la longitud de contexto efectiva tras la compresión ni el impacto en secuencias largas.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/bert-comp-come-compressor-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de `CoMeCompressor`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/low_rank/come_compressor.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
