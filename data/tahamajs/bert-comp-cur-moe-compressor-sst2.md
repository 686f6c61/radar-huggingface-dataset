# tahamajs/bert-comp-cur-moe-compressor-sst2

## Resumen

`tahamajs/bert-comp-cur-moe-compressor-sst2` es un checkpoint comprimido de `google-bert/bert-base-uncased` afinado para clasificación de sentimiento en GLUE SST-2, generado con el motor `cur_moe_compressor` (familia `cur_moe_factory`, `low_rank`) de la librería NeuralOps. Lo publica Taha Majlesi como parte de un zoo de modelos comprimidos orientado a evaluar el compromiso entre ratio de compresión y degradación de precisión en tareas downstream concretas.

El modelo parte de un BERT-Base de 109.483.778 parámetros (12 capas, dimensión oculta 768) y se reduce a 103.250.882 parámetros en el rango de compresión `k=32`, lo que supone una reducción del 5,69% y un ratio físico de compresión de 1,06x. Es, por tanto, una compresión muy conservadora en términos de tamaño, seleccionada como punto Pareto del barrido de rangos `k=256, 128, 64, 32`.

Su relevancia es metodológica más que de producto: documenta con telemetría reproducible cómo distintos rangos de compresión low-rank afectan a la precisión en SST-2 (del 91,63% del profesor al 80,39% del checkpoint publicado), e incluye el detalle de la curación con LoRA aplicada en los rangos más agresivos. No es un modelo de propósito general ni un modelo generativo: es un clasificador binario de sentimiento en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base (12 capas, D=768), comprimido con `cur_moe_compressor` (familia `low_rank`) |
| Parametros totales | 103.250.882 (checkpoint comprimido, k=32); profesor original: 109.483.778 |
| Parametros activos | no disponible (no es un MoE disperso en inferencia; el nombre del compresor hace referencia a la familia CUR-MoE de NeuralOps) |
| Longitud de contexto | no disponible en la informacion proporcionada (el profesor BERT-Base admite 512 tokens, pero el checkpoint no lo declara) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en `pytorch_model.bin` sin cuantizacion declarada) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado con factores low-rank y, en su caso, adaptadores LoRA integrados); tokenizer en `vocab.txt`, `tokenizer.json`, `tokenizer_config.json` |

## Arquitectura y entrenamiento

La arquitectura de partida es BERT-Base uncased: un transformer encoder de 12 capas con dimensión oculta 768, preentrenado por Google y afinado posteriormente sobre GLUE SST-2. Sobre ese checkpoint, NeuralOps aplica el compresor `cur_moe_compressor` en el rango `k=32`, que reduce el número de parámetros un 5,69% (de 109.483.778 a 103.250.882). El repositorio incluye `compression_summary.json` con la telemetría completa del barrido de rangos y `config.json` anotado con `compression_method: "cur_moe_compressor"` y `compression_rank: 32`.

El pipeline de NeuralOps evalúa cada rango físicamente sobre la partición de validación de SST-2 (872 muestras) en una NVIDIA GeForce RTX 3090 (24 GB). Cuando la compresión zero-shot degrada la precisión más de 2,0 puntos con una reducción superior a 1,10x, se activa una curación LoRA dirigida con `r=8`, 50 pasos, `lr=2e-4` y un presupuesto de 45 segundos. En el rango publicado (`k=32`) no se aplicó curación LoRA: la precisión zero-shot y la final coinciden en 80,39%. La innovación técnica destacable no es arquitectónica sino de metodología: un esquema de compresión low-rank con evaluación Pareto multi-rango y reparación selectiva mediante adaptadores de bajo rango. No se detalla en la información disponible la composición del dataset de afinado ni si hubo RLHF/DPO (no aplicable a una tarea de clasificación).

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés, con dos etiquetas de salida (`num_labels=2`).
- Afinado específicamente sobre GLUE SST-2; no se declaran capacidades zero-shot fuera de ese dominio.
- No soporta tool calling ni function calling: es un clasificador, no un modelo generativo.
- No soporta agentes ni razonamiento multi-paso.
- Multilingüismo limitado al inglés (tag `en` y vocabulario `bert-base-uncased`).
- No dispone de modo thinking, visión ni audio.
- El checkpoint está pensado para reconstruirse con la topología NeuralOps (`compress_model` con `cur_moe_compressor`, `rank=32`) y cargarse con `load_state_dict(..., strict=False)`.

## Casos de uso

- Clasificación de sentimiento en reseñas de producto o comentarios: el modelo devuelve logits de dos clases sobre texto en inglés y puede integrarse en un pipeline de `transformers` con `BertForSequenceClassification` tras reconstruir la topología NeuralOps. Adecuado por su tamaño reducido (197 MB de pesos) y su licencia MIT.
- Moderación de comentarios a escala: al ser un clasificador de 103 M de parámetros, cabe en GPU de consumo y permite procesar lotes grandes; útil para prefiltrar toxicidad o polaridad antes de un revisor humano.
- Análisis de opinión en redes sociales y encuestas: clasificación de polaridad por fragmento, con la salvedad de que la precisión declarada (80,39%) es inferior a la del profesor (91,63%), por lo que conviene reservar el modelo a tareas donde ese margen sea aceptable.
- Investigación en compresión de modelos: el repositorio sirve como referencia reproducible para comparar rangos `k=256, 128, 64, 32` y estudiar el efecto de la curación LoRA en la recuperación de precisión.
- Docencia y experimentación con NeuralOps: ejemplo mínimo de cómo comprimir, serializar y recargar un BERT afinado con `compress_model` y `load_state_dict(strict=False)`.
- Baseline en pipelines de clasificación de bajo coste: cuando el presupuesto de VRAM es limitado, este checkpoint ofrece un punto de comparación frente al BERT-Base completo con una pérdida de precisión conocida y documentada.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Modelo / rango | Ratio fisico | Parametros comprimidos | SST-2 zero-shot | SST-2 curado (LoRA) | Paridad vs profesor (91,63%) |
|---|---:|---:|---:|---:|---:|
| Profesor (BERT-Base SST-2) | 1,00x | 109.483.778 | 91,63% | — | 0,00% |
| `k=256` | 1,40x | 78.026.498 (-28,7%) | 61,24% | 50,92% | -40,71% |
| `k=128` | 1,67x | 65.582.850 (-40,1%) | 61,81% | 54,47% | -37,16% |
| `k=64` | 1,70x | 64.542.978 (-41,0%) | 53,67% | 75,00% | -16,63% |
| `k=32` (publicado) | 1,06x | 103.250.882 (-5,7%) | 80,39% | 80,39% | -11,24% |

Evaluación realizada sobre la partición de validación de GLUE SST-2 (872 muestras) en una RTX 3090. El checkpoint serializado corresponde a `k=32` con precisión de validación de 80,39%.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 0,2 GB y los pesos pesan 197,0 MB; en fp32 la inferencia requiere aproximadamente 0,4-0,8 GB de VRAM, holgadamente por debajo de cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor evaluó en NVIDIA GeForce RTX 3090 (24 GB), pero es sobredimensionada para este modelo.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, GTX 1660 o incluso en CPU para lotes pequeños.
- Opciones de despliegue: el flujo declarado usa `transformers` (`BertForSequenceClassification`) junto con `neuralops.core.compression_pipeline.compress_model` para reconstruir la topología antes de cargar el state dict. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al ser un clasificador BERT, estas herramientas no son el camino natural.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| `tahamajs/bert-comp-cur-moe-compressor-sst2` (k=32) | 103,25 M | no disponible | 80,39% | MIT | Hugging Face (NeuralOps) |
| `google-bert/bert-base-uncased` afinado en SST-2 (profesor) | 109,48 M | 512 tokens (BERT-Base) | 91,63% (declarado) | Apache 2.0 (modelo base) | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~66 M | 512 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | 109,48 M | 512 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face |

La comparación directa con los checkpoints de referencia de SST-2 no puede cerrarse con datos de esta ficha: solo se dispone de la métrica del profesor declarada por el autor. El checkpoint publicado ofrece una reducción de tamaño modesta (5,7%) a cambio de 11,24 puntos de precisión, por lo que su interés es principalmente metodológico frente a alternativas como DistilBERT, que logran reducciones mayores con licencias permisivas.

## Limitaciones y advertencias

- Pérdida de precisión significativa: 80,39% frente al 91,63% del profesor, una caída de 11,24 puntos en SST-2; puede no ser aceptable en producción sensible a la exactitud.
- Compresión modesta: solo reduce el 5,69% de los parámetros (ratio 1,06x), por lo que el ahorro de memoria y cómputo es marginal frente a otras técnicas.
- El barrido multi-rango muestra resultados contraintuitivos (el rango `k=64` curado supera al `k=256` y `k=128`), lo que sugiere alta varianza en la evaluación con solo 872 muestras; conviene tratar las cifras con cautela.
- Solo inglés: el vocabulario `bert-base-uncased` y el tag `en` limitan su uso a texto en inglés.
- Dominio restringido: afinado únicamente en SST-2 (reseñas de cine); la generalización a otros dominios de sentimiento no está validada.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador), pero sí de clasificaciones erróneas en texto ambiguo, sarcasmo o dominios distintos al de entrenamiento.
- Requiere la librería NeuralOps y reconstruir la topología antes de cargar los pesos (`strict=False`); no es un checkpoint cargable directamente con `from_pretrained` sin ese paso.
- Licencia MIT, que permite uso comercial, pero el modelo base `google-bert/bert-base-uncased` está bajo Apache 2.0; conviene revisar ambas.
- Sin descargas ni likes en el momento de la consulta y sin verificación independiente de los resultados (`verified: false` en el model-index).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-cur-moe-compressor-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/low_rank/cur_moe_compressor.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
