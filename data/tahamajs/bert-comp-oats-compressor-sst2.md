# tahamajs/bert-comp-oats-compressor-sst2

## Resumen

`bert-comp-oats-compressor-sst2` es un checkpoint de BERT-Base (`google-bert/bert-base-uncased`) comprimido físicamente y ajustado para clasificación de sentimiento en GLUE SST-2. Lo publica el autor `tahamajs` como parte del "NeuralOps Compressed & LoRA-Healed Model Zoo", una iniciativa que empaqueta modelos comprimidos con la librería NeuralOps. El modelo parte de los 109.483.778 parámetros del BERT-Base original y los reduce a 67.016.450 mediante el compresor `OATSCompressor` (descomposición low-rank con conciencia de outliers más dispersión estructurada) en el rango de showcase `k=256`.

El interés técnico está en que la compresión es física, no simulada: el checkpoint serializado contiene la topología low-rank ya materializada, con un ratio de compresión de 1,63x y una reducción del 38,79 % de parámetros. Aun así, la accuracy en validación de SST-2 (92,09 %) supera ligeramente la del profesor original (91,63 %), un delta de +0,46 puntos que el autor atribuye a un efecto de regularización de la compresión. El repositorio incluye además telemetría de otros rangos (`k=128`, `k=64`, `k=32`) que muestra el compromiso entre ratio de compresión y precisión.

Es relevante ahora porque ejemplifica una tendencia práctica: reutilizar modelos pequeños ya entrenados y aplicarles compresión post-entrenamiento con recuperación LoRA selectiva para desplegarlos en entornos con restricciones de memoria o latencia, sin reentrenar desde cero. El modelo es de clasificación de texto en inglés, licencia MIT, y requiere la librería NeuralOps para reconstruir la topología antes de cargar los pesos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Base), 12 capas, dimensión oculta D=768 |
| Parámetros totales | 67.016.450 (comprimido; original 109.483.778) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT-Base admite hasta 512 tokens; la model card no lo declara explícitamente) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch), más `config.json`, `compression_summary.json` y assets del tokenizer |

## Arquitectura y entrenamiento

La arquitectura subyacente es BERT-Base uncased: un transformer encoder de 12 capas con 768 dimensiones ocultas y 109.483.778 parámetros, preentrenado por Google y aquí afinado sobre GLUE SST-2 (clasificación binaria de sentimiento). Sobre ese modelo se aplica el compresor `OATSCompressor`, registrado en NeuralOps como `oats_compressor` dentro de la familia `low_rank`. OATS combina descomposición low-rank con conciencia de outliers y dispersión estructurada, e incorpora mecanismos de robustez en producción: validación del error de reconstrucción de Frobenius relativo con un `max_error` configurable (por defecto 0,85), fallback seguro a los pesos originales (`fallback_to_original=True`), detección robusta de capas Conv1D por nombre de clase y atributo `nf`, y protección unificada de capas críticas.

El proceso de compresión se evaluó en cuatro rangos (`k=256, 128, 64, 32`) sobre la partición de validación de SST-2 (872 muestras) en una NVIDIA GeForce RTX 3090 de 24 GB. La política de "healing" aplica LoRA dirigido (`r=8`, 50 pasos, `lr=2e-4`, presupuesto de 45 segundos) únicamente cuando la compresión zero-shot degrada la accuracy más de 2,0 puntos con una reducción superior a 1,10x. En el rango empaquetado (`k=256`) no se aplicó LoRA (`LoRA Recovery Applied: False`), porque el resultado zero-shot ya igualaba el 92,09 % final. En `k=64` y `k=32` sí se activó el healing, recuperando de 67,89 % a 86,81 % y de 71,67 % a 82,00 % respectivamente. No se documentan en la información disponible los detalles del dataset de afinado (número de tokens, composición, si hubo RLHF/DPO), más allá de que se usó GLUE SST-2.

## Capacidades

- Clasificación de sentimiento binaria (positivo/negativo) en inglés, tarea para la que fue afinado sobre GLUE SST-2.
- Clasificación de texto genérica en inglés, heredada de la arquitectura BERT-Base (aunque el checkpoint está especializado en dos etiquetas).
- Comprensión de lenguaje natural en inglés a nivel de encoder bidireccional (no es un modelo generativo).
- No soporta tool calling ni function calling: es un modelo de clasificación, no un modelo de instrucciones.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés (el vocabulario `bert-base-uncased` es fundamentalmente inglés).
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Análisis de sentimiento en reseñas de producto: el modelo clasifica en positivo/negativo textos cortos en inglés con una accuracy del 92,09 % en SST-2, adecuado para pipelines de monitorización de opiniones a escala.
- Moderación de comentarios en foros y redes: al ser un encoder pequeño (67 M de parámetros) y comprimido, se puede desplegar en CPU o GPU de gama baja para filtrar toxicidad o polaridad en tiempo real.
- Enrutamiento de tickets de soporte: usar la polaridad del mensaje del cliente como señal para priorizar tickets negativos o escalarlos a un agente humano, con latencia baja gracias al tamaño reducido.
- Clasificación por lotes de grandes volúmenes de texto: el checkpoint de 289,9 MB cabe en memoria de una GPU consumer y permite procesar lotes amplios en una sola tarjeta.
- Investigación en compresión de modelos: sirve como referencia reproducible para comparar el compresor `OATSCompressor` frente a otras técnicas (pruning, quantización, destilación) sobre una tarea estándar como SST-2.
- Evaluación de pipelines de despliegue con NeuralOps: útil para validar la reconstrucción de topologías comprimidas y el flujo de carga con `compress_model` más `load_state_dict` antes de llevarlo a producción.
- Baseline ligero para experimentos de ajuste fino: al estar comprimido y con licencia MIT, se puede usar como punto de partida económico para tareas de clasificación en inglés con recursos limitados.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index y en la model card (evaluación física en RTX 3090, split de validación de GLUE SST-2, 872 muestras):

| Rank (k) | Ratio físico | Parámetros comprimidos (reducción) | Accuracy zero-shot | Accuracy con healing | Paridad vs profesor (91,63 %) |
|---|---|---|---|---|---|
| 256 (empaquetado) | 1,63x | 67.016.450 (-38,8 %) | 92,09 % | 92,09 % | +0,46 % |
| 128 | 2,39x | 45.782.786 (-58,2 %) | 89,68 % | 89,68 % | -1,95 % |
| 64 | 3,11x | 35.165.954 (-67,9 %) | 67,89 % | 86,81 % (LoRA) | -4,82 % |
| 32 | 3,20x | 34.256.642 (-68,7 %) | 71,67 % | 82,00 % (LoRA) | -9,63 % |

El profesor BERT-Base sin comprimir alcanza 91,63 % en la misma evaluación. El rango `k=256` empaquetado en este repositorio es el único con paridad positiva frente al profesor. No se han publicado en la información disponible resultados de otros benchmarks como MMLU, HumanEval o GSM8K, que además no aplican a un modelo de clasificación.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 289,9 MB en `pytorch_model.bin`; en FP32 ocupa aproximadamente 0,3 GB, por lo que cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU moderna sirve; el autor evaluó en NVIDIA GeForce RTX 3090 (24 GB), pero el modelo es sobredimensionado para esa tarjeta. Una RTX 3060, RTX 4060 o incluso una T4 son suficientes.
- Cabe en GPU consumer: sí, en todas las GPU consumer actuales (GTX 1650 en adelante) y también en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: la carga requiere la librería NeuralOps (`compress_model` con `oats_compressor` y `rank=256`) más `transformers`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que es un modelo de clasificación y no generativo.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bert-comp-oats-compressor-sst2` (este) | 67.016.450 (comprimido) | no disponible | 92,09 % | MIT | Hugging Face, requiere NeuralOps |
| `google-bert/bert-base-uncased` (profesor) | 109.483.778 | 512 tokens (arquitectura) | 91,63 % (baseline del autor) | Apache 2.0 | Hugging Face, transformers |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~66 M | 512 tokens (arquitectura) | no disponible en la información | Apache 2.0 | Hugging Face, transformers |
| `roberta-base` afinado en SST-2 | ~125 M | 512 tokens (arquitectura) | no disponible en la información | MIT | Hugging Face, transformers |

La comparativa con DistilBERT y RoBERTa se ofrece como referencia de categoría (clasificadores pequeños en inglés); no se dispone de sus cifras exactas en SST-2 dentro de la información proporcionada, por lo que se marcan como no disponibles. La ventaja diferencial de este checkpoint es el ratio de compresión físico con paridad de accuracy, a costa de depender de la librería NeuralOps para la reconstrucción.

## Limitaciones y advertencias

- Es un modelo de clasificación binaria de sentimiento, no un modelo generativo ni de instrucciones; no debe usarse para tareas de generación, razonamiento o código.
- Solo soporta inglés; el rendimiento en otros idiomas será deficiente.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de clasificaciones erróneas en textos con sarcasmo, negaciones complejas o dominio muy distinto al de SST-2 (reseñas de cine).
- La carga requiere reconstruir la topología con `compress_model` de NeuralOps antes de hacer `load_state_dict`; un `from_pretrained` estándar de `transformers` no cargará correctamente los pesos comprimidos.
- El autor no documenta sesgos específicos; al heredar de `bert-base-uncased`, es probable que arrastre sesgos de género, raza y dominio presentes en los corpus de preentrenamiento, aunque no se cuantifican.
- La accuracy declarada (92,09 %) no está verificada (`verified: false` en la model-index) y se midió solo sobre 872 muestras de validación, sin test ciego.
- La licencia MIT permite uso comercial, pero el modelo base `google-bert/bert-base-uncased` está bajo Apache 2.0; conviene revisar la compatibilidad si se redistribuye.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria independiente.
- No se documentan los tipos de cuantización soportados ni el contexto máximo efectivo del checkpoint comprimido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-oats-compressor-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor OATS: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/low_rank/oats_compressor.py
- Licencia del proyecto NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
