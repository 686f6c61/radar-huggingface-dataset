# tahamajs/bert-comp-smoothquant-sst2

## Resumen

`tahamajs/bert-comp-smoothquant-sst2` es un checkpoint de clasificación de sentimiento derivado de `google-bert/bert-base-uncased`, afinado sobre GLUE SST-2 y procesado con el motor de cuantización SmoothQuant W8A8 de la librería NeuralOps. Lo publica Taha Majlesi como parte del "NeuralOps Compressed & LoRA-Healed Model Zoo", un catálogo experimental de modelos comprimidos con evaluación Pareto multi-rango. El modelo resuelve una tarea acotada: clasificación binaria de sentimiento (positivo/negativo) en inglés, con 109.483.778 parámetros y una arquitectura transformer encoder de 12 capas y dimensión oculta 768.

Su relevancia es metodológica más que de producto: sirve como referencia de cómo aplicar SmoothQuant sobre BERT sin degradar la precisión en SST-2. Según la model card, el checkpoint alcanza un 91,74 % de accuracy en el split de validación de GLUE SST-2, frente al 91,63 % del modelo profesor, una paridad de +0,11 puntos. Cabe señalar que el ratio de compresión físico declarado es 1,00x (0,0 % de reducción de parámetros), por lo que el interés está en el pipeline de cuantización y no en una reducción real de tamaño.

El repositorio ocupa 0,3 GB, se distribuye bajo licencia MIT, está etiquetado únicamente para inglés y depende de la librería `neuralops` para reconstruir la topología comprimida antes de cargar los pesos. No tiene descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base), 12 capas, dimensión oculta 768 |
| Parametros totales | 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (BERT-base soporta típicamente 512 tokens; no confirmado en la información proporcionada) |
| Tipos de cuantizacion | SmoothQuant W8A8 (cuantización de activaciones y pesos a 8 bits) con soporte de compressed-tensors |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado); tokenizer en `vocab.txt`, `tokenizer.json`, `tokenizer_config.json` |

## Arquitectura y entrenamiento

La base es `google-bert/bert-base-uncased`, un transformer encoder de 12 capas con dimensión 768 y 109.483.778 parámetros, afinado para clasificación de secuencias con dos etiquetas sobre GLUE SST-2. Sobre ese modelo se aplica `SmoothQuantCompressor`, el wrapper de NeuralOps para SmoothQuant W8A8, que suaviza la dificultad de cuantización desplazando escala entre activaciones y pesos antes de cuantizar a 8 bits. El checkpoint serializado se selecciona en el rango de exhibición `k=32` y se acompaña de `compression_summary.json` con la telemetría de todos los rangos evaluados (256, 128, 64 y 32).

La model card indica que el mecanismo de "LoRA healing" (adaptadores `r=8`, 50 pasos, `lr=2e-4`, presupuesto de 45 s) solo se activa cuando la compresión zero-shot cae más de 2,0 puntos con una reducción superior a 1,10x. En este caso no se aplicó healing (`LoRA Recovery Applied: False`), porque la cuantización no produjo pérdida medible. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset más allá de GLUE SST-2, ni si hubo RLHF o DPO (no aplicable en un encoder de clasificación).

## Capacidades

- Clasificación binaria de sentimiento en inglés (positivo/negativo) sobre textos cortos, orientada a la distribución de SST-2.
- Inferencia de texto con tokenizer estándar `bert-base-uncased` (vocabulario WordPiece, minúsculas).
- Ejecución en modo cuantizado W8A8 con SmoothQuant, pensada para reducir el coste de memoria y cómputo en inferencia.
- Integración con el ecosistema NeuralOps para reconstruir la topología comprimida y cargar los pesos.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- No dispone de modo "thinking", visión, audio ni generación de texto libre.
- Capacidad multilingüe limitada al inglés; no se declaran otros idiomas.

## Casos de uso

- Análisis de sentimiento en reseñas de producto: clasificar reseñas cortas en inglés en positivas o negativas, aprovechando el ajuste específico sobre SST-2 y la paridad de precisión con el modelo profesor.
- Moderación de comentarios en foros en inglés: filtrar automáticamente mensajes con tono negativo para revisión humana, con un modelo de 109 M de parámetros que se ejecuta en CPU o GPU modesta.
- Enriquecimiento de pipelines de datos: etiquetar grandes volúmenes de texto en inglés con sentimiento binario como señal auxiliar para análisis de tendencias o dashboards.
- Evaluación de campañas de marketing: medir la polaridad de menciones y respuestas de clientes en inglés para calcular métricas de satisfacción agregadas.
- Baseline de investigación en compresión de modelos: usar el checkpoint como referencia reproducible de SmoothQuant W8A8 sobre BERT en SST-2, comparando con variantes de otros compressors del zoo de NeuralOps.
- Prototipado de clasificadores ligeros: servir como punto de partida para afinar sobre dominios específicos en inglés con recursos limitados, dado su tamaño contenido y licencia MIT.
- Docencia y experimentación: ilustrar el flujo de cuantización, reconstrucción de topología y evaluación Pareto en un caso pequeño y bien delimitado.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Modelo | Dataset | Split | Métrica | Valor |
|---|---|---|---|---|
| `bert-comp-smoothquant-sst2` (k=32) | GLUE SST-2 | validation | Accuracy | 91,74 % |
| Profesor `bert-base-uncased` (referencia del autor) | GLUE SST-2 | validation | Accuracy | 91,63 % |

Evaluación multi-rango declarada por el autor (RTX 3090, 872 muestras de validación):

| Rank (k) | Ratio físico | Params comprimidos | Zero-shot Acc | Healed Acc | Paridad vs profesor |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,00x | 109.483.778 | 91,74 % | 91,74 % | +0,11 % |
| 128 | 1,00x | 109.483.778 | 91,74 % | 91,74 % | +0,11 % |
| 64 | 1,00x | 109.483.778 | 91,74 % | 91,74 % | +0,11 % |
| 32 | 1,00x | 109.483.778 | 91,74 % | 91,74 % | +0,11 % |

No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros), que además no son aplicables a un encoder de clasificación.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 291,0 MB en disco; en FP32 ocupa aproximadamente 0,44 GB de pesos, y en W8A8 alrededor de 0,11 GB de pesos más buffers de cuantización y activaciones. En la práctica, menos de 2 GB de VRAM para lotes pequeños.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el autor evaluó en NVIDIA GeForce RTX 3090 (24 GB), pero el modelo es sobradamente pequeño para GPUs de gama baja.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también en CPU para inferencia por lotes moderados.
- Opciones de despliegue: la carga requiere reconstruir la topología con `neuralops` y `transformers` (`BertForSequenceClassification`); no se declara compatibilidad directa con vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-comp-smoothquant-sst2` | 109.483.778 | no disponible | 91,74 % | MIT | Hugging Face, requiere `neuralops` |
| `google-bert/bert-base-uncased` (profesor) | 109.483.778 | 512 (típico) | 91,63 % (referencia del autor) | Apache 2.0 | Hugging Face, `transformers` |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~66 M | 512 (típico) | no disponible en esta información | Apache 2.0 | Hugging Face, `transformers` |
| `textattack/bert-base-uncased-SST-2` | 109.483.778 | 512 (típico) | no disponible en esta información | MIT (según repositorio) | Hugging Face, `transformers` |

La comparativa se limita a modelos de la misma familia y tarea; los valores de SST-2 de las alternativas no se han incluido porque no estaban en la información proporcionada y no deben inferirse.

## Limitaciones y advertencias

- El ratio de compresión físico declarado es 1,00x (0,0 % de reducción de parámetros): el checkpoint no es más pequeño que el modelo base, solo está cuantizado a W8A8. El beneficio real de memoria y cómputo debe medirse en el entorno de despliegue.
- El resultado de 91,74 % de accuracy no está verificado de forma independiente (`verified: false` en el model-index); procede únicamente de la model card del autor.
- La carga del modelo exige la librería `neuralops` y un paso explícito de reconstrucción de topología (`compress_model`) antes de `load_state_dict`; no es un checkpoint estándar de `transformers` cargable con `from_pretrained` directamente.
- El modelo está entrenado y evaluado solo en inglés y solo para clasificación binaria de sentimiento; el rendimiento fuera de la distribución de SST-2 (dominios, registros o longitudes distintas) no está documentado.
- Riesgo de sesgos heredados de `bert-base-uncased` y de SST-2: el corpus de reseñas de cine presenta sesgos de dominio, demografía y estilo que pueden trasladarse a las predicciones.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador), pero sí de clasificaciones erróneas o sobreconfiadas en textos ambiguos, irónicos o fuera de dominio.
- No se documentan limitaciones de longitud de contexto específicas para este checkpoint; debe asumirse el límite estándar de BERT-base (512 tokens) salvo verificación.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones del modelo base `google-bert/bert-base-uncased` (Apache 2.0) y de la librería NeuralOps.
- Repositorio sin descargas ni validación comunitaria en el momento de la ficha: trátese como artefacto experimental de investigación, no como componente listo para producción sin evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-smoothquant-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación SmoothQuant en NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/quantization/smoothquant.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
