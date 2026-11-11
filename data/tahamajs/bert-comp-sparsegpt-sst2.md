# tahamajs/bert-comp-sparsegpt-sst2

## Resumen

`tahamajs/bert-comp-sparsegpt-sst2` es un checkpoint de `google-bert/bert-base-uncased` afinado para clasificación de sentimiento en GLUE SST-2 y posteriormente procesado con el motor de compresión `SparseGPTCompressor` de la librería NeuralOps, desarrollada por Taha Majlesi. El objetivo declarado del proyecto es servir como banco de pruebas reproducible de técnicas de poda (pruning) y recuperación mediante LoRA sobre un transformer BERT-Base de 109.483.778 parámetros, con 12 capas y dimensión oculta de 768.

El resultado publicado es, en la práctica, un modelo sin compresión física: el checkpoint serializado corresponde al rank `k=256`, con ratio de compresión `1.00x` y una reducción de parámetros del `0.0%`. La precisión en la partición de validación de SST-2 (872 muestras) es del 87,27%, frente al 91,63% del modelo profesor, lo que supone una pérdida de paridad de 4,36 puntos porcentuales. Los ranks más agresivos evaluados (`k=128`, `k=64`, `k=32`) degradan la precisión hasta el 75,57%, 62,84% y 58,03% respectivamente, sin que la recuperación LoRA llegara a aplicarse en ninguno de ellos (`LoRA Recovery Applied: False`).

Su relevancia es metodológica más que de producto: documenta de forma explícita la curva de Pareto entre agresividad de poda y precisión en una tarea concreta, e incluye telemetría legible por máquina (`compression_summary.json`). Para producción en clasificación de sentimiento en inglés, un BERT-Base sin comprimir con 87,27% de accuracy queda por debajo del profesor y de alternativas estándar, por lo que su interés principal es la reproducibilidad del pipeline de compresión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base (12 capas, D=768), cabeza de clasificación de 2 etiquetas |
| Parametros totales | 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base BERT-Base admite 512 tokens, pero la model card no lo declara) |
| Tipos de cuantizacion | no disponible (el artefacto se distribuye en `pytorch_model.bin` en precisión original) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`), más `config.json`, `compression_summary.json` y activos de tokenizer (`vocab.txt`, `tokenizer.json`, `tokenizer_config.json`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es BERT-Base uncased: un transformer encoder de 12 capas con atención multi-cabeza completa, dimensión oculta 768 y 109.483.778 parámetros, sobre el que se añade una cabeza `BertForSequenceClassification` con `num_labels=2` para sentimiento positivo/negativo. El checkpoint parte de `google-bert/bert-base-uncased` ya afinado en GLUE SST-2 y se somete a una pasada de poda por capas con `SparseGPTCompressor`, que implementa poda de segundo orden con compensación de pesos basada en Optimal Brain Surgeon (OBS). El compresor soporta sparsity no estructurada, por bloques y 2:4 estructurada estricta.

El pipeline de NeuralOps aplica recuperación LoRA dirigida (`r=8`, 50 pasos, `lr=2e-4`, presupuesto de 45 segundos) únicamente cuando la compresión zero-shot degrada la precisión más de 2,0 puntos con una reducción superior a 1,10x. En este checkpoint esa condición no se cumplió (`LoRA Recovery Applied: False`), de modo que los pesos publicados son el resultado directo de la poda en `k=256` sin curación posterior. La evaluación multi-rank se realizó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre las 872 muestras de validación de SST-2. No se documentan en la información disponible el volumen de tokens de preentrenamiento, la composición del corpus ni si hubo RLHF o DPO, más allá del ajuste supervisado estándar de SST-2.

## Capacidades

- Clasificación binaria de sentimiento en inglés (positivo/negativo) sobre texto corto, orientada a la distribución de SST-2 (reseñas de películas).
- Inferencia estándar de `BertForSequenceClassification` con logits de 2 clases y `argmax` para la etiqueta predicha.
- Reconstrucción del grafo comprimido mediante `neuralops.core.compression_pipeline.compress_model` antes de cargar el `state_dict` con `strict=False`.
- Compatibilidad con el ecosistema Hugging Face `transformers` para tokenizer y configuración, aunque la carga de pesos requiere la librería NeuralOps.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés; el vocabulario `bert-base-uncased` no está optimizado para otros idiomas.
- No es un modelo generativo: no produce texto libre, solo una etiqueta de clasificación.

## Casos de uso

- Clasificación de sentimiento en reseñas de producto o películas en inglés: el modelo devuelve una etiqueta binaria por reseña; es su tarea nativa y la única para la que hay métricas publicadas (87,27% en SST-2).
- Filtrado previo en pipelines de moderación de comentarios: usar la polaridad como señal débil para enrutar contenido a revisión humana, aceptando el 12,73% de error observado en validación.
- Etiquetado automático de grandes volúmenes de texto corto en inglés: al ser un BERT-Base de 109M de parámetros, cabe en GPU consumer y permite throughput alto en batch, aunque sin cifras de latencia publicadas.
- Baseline de experimentos de compresión: sirve como referencia reproducible para comparar `SparseGPTCompressor` frente a otras técnicas de poda o cuantización sobre el mismo checkpoint y dataset.
- Docencia e investigación en pruning: el repo incluye `compression_summary.json` con la curva completa de ranks `[256, 128, 64, 32]`, útil para estudiar la degradación de precisión con la agresividad de poda.
- Prueba de integración de la librería NeuralOps en un stack de PyTorch: el script de Quick Start permite validar el flujo de reconstrucción y carga en un entorno controlado antes de escalar a modelos mayores.
- Análisis de sentimiento en encuestas o formularios abiertos en inglés: adecuado si se asume el sesgo hacia el dominio de reseñas de películas de SST-2 y se valida con una muestra propia.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card y en el `model-index` (no verificados, `verified: false`). Evaluación sobre GLUE SST-2, split de validación (872 muestras), en RTX 3090.

| Rank (k) | Ratio fisico | Parametros comprimidos (reduccion) | Accuracy zero-shot | Accuracy curada (LoRA) | Paridad vs profesor (91,63%) |
|:---:|:---:|---:|---:|---:|---:|
| 256 (publicado) | 1,00x | 109.483.778 (-0,0%) | 87,27% | 87,27% | -4,36 pp |
| 128 | 1,00x | 109.483.778 (-0,0%) | 75,57% | 75,57% | -16,06 pp |
| 64 | 1,00x | 109.483.778 (-0,0%) | 62,84% | 62,84% | -28,79 pp |
| 32 | 1,00x | 109.483.778 (-0,0%) | 58,03% | 58,03% | -33,60 pp |

Referencia del modelo profesor (`google-bert/bert-base-uncased` afinado en SST-2) según el autor: 91,63% de accuracy en validación. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,44 GB solo de pesos (109,5M parámetros × 4 bytes), más activaciones; el repo ocupa 0,5 GB.
- En FP16/BF16 los pesos bajarían a unos 0,22 GB, pero no se declara soporte de cuantización ni de formatos GGUF en la información disponible.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre es suficiente para batch pequeño; el autor evaluó en NVIDIA GeForce RTX 3090 (24 GB), claramente sobredimensionada para este tamaño.
- Cabe en GPU consumer: sí, en tarjetas tipo RTX 3060, RTX 4060, RTX 4090 o superiores, así como en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: PyTorch + `transformers` + librería NeuralOps (requerida para reconstruir el grafo comprimido y cargar el `state_dict`). No se documenta compatibilidad con vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Formato / disponibilidad |
|---|---|---:|---:|---|---|
| `tahamajs/bert-comp-sparsegpt-sst2` | 109,5M | no disponible | 87,27% | MIT | `pytorch_model.bin` + NeuralOps |
| `google-bert/bert-base-uncased` (profesor SST-2, según el autor) | 109,5M | 512 tokens (modelo base) | 91,63% | Apache 2.0 (modelo base) | safetensors / `transformers` |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66M | 512 tokens | no disponible en esta ficha | Apache 2.0 | safetensors / `transformers` |
| `textattack/bert-base-uncased-SST-2` | 109,5M | 512 tokens | no disponible en esta ficha | MIT (según repo) | safetensors / `transformers` |

Las cifras de los modelos alternativos de SST-2 no se han contrastado con la información proporcionada; solo se incluye el 91,63% del profesor porque lo declara el propio autor. La comparación relevante es interna: el checkpoint publicado rinde 4,36 puntos por debajo del profesor sin haber logrado reducción física de parámetros, lo que lo sitúa en desventaja frente a usar directamente el modelo base afinado.

## Limitaciones y advertencias

- El checkpoint publicado no está comprimido físicamente: ratio 1,00x y 0,0% de reducción de parámetros, pese a la etiqueta de "compressed".
- Pérdida de 4,36 puntos de accuracy frente al profesor (87,27% vs 91,63%) sin beneficio de tamaño o latencia documentado.
- Los ranks más agresivos (`k=128`, `k=64`, `k=32`) degradan la precisión hasta 58,03%, lo que invalida su uso práctico en producción.
- La recuperación LoRA no se aplicó en ningún rank (`LoRA Recovery Applied: False`), por lo que la "curación" anunciada en el nombre del zoo no está presente en este artefacto.
- Requiere la librería NeuralOps y una reconstrucción manual del grafo (`compress_model` + `load_state_dict(strict=False)`) antes de la inferencia; no es cargable directamente con `AutoModelForSequenceClassification.from_pretrained`.
- El uso de `strict=False` en la carga puede enmascarar discrepancias de pesos; conviene verificar que todas las claves esperadas se han resuelto.
- Sesgos y alucinaciones: al ser un clasificador, no genera texto, pero hereda los sesgos de `bert-base-uncased` y del corpus SST-2 (reseñas de películas en inglés), con posible degradación fuera de dominio.
- Dominio y idioma restringidos: solo inglés y texto corto tipo reseña; no se han publicado evaluaciones en otros dominios ni en otras lenguas.
- Métricas no verificadas (`verified: false`) y con 0 descargas y 0 likes en el momento de la ficha; sin validación independiente por la comunidad.
- Licencia MIT declarada, lo que permite uso comercial, pero el modelo base `google-bert/bert-base-uncased` se distribuye bajo Apache 2.0 y conviene revisar la compatibilidad de obligaciones de atribución.
- No hay datos publicados de latencia, throughput ni consumo de VRAM en producción.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/bert-comp-sparsegpt-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación del compresor SparseGPT: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/pruning/sparsegpt.py
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
