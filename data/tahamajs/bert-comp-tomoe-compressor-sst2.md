# tahamajs/bert-comp-tomoe-compressor-sst2

## Resumen

`bert-comp-tomoe-compressor-sst2` es un checkpoint de BERT-Base (`google-bert/bert-base-uncased`) comprimido físicamente y posteriormente "curado" mediante LoRA, publicado por el autor individual Taha Majlesi bajo el paraguas de la librería NeuralOps. El modelo parte de un BERT-Base afinado en GLUE SST-2 y le aplica el compresor `ToMoECompressor` (familia `low_rank`), que sustituye capas densas de feed-forward y proyección por equivalentes tipo mezcla de expertos. El resultado empaquetado corresponde al rango `k=128`, con 77.965.346 parámetros frente a los 109.483.778 del profesor, es decir, una reducción del 28,79 % y un ratio de compresión físico de 1,404x.

La relevancia del artefacto es fundamentalmente metodológica: forma parte de un "compressor zoo" que evalúa el compromiso entre ratio de compresión y precisión downstream en cuatro rangos (`k=256, 128, 64, 32`) sobre la partición de validación de SST-2 (872 muestras). No obstante, el rendimiento declarado es muy bajo: 52,41 % de accuracy en SST-2 frente al 91,63 % del profesor, una caída de 39,22 puntos. En la práctica, el modelo se comporta casi como un clasificador trivial (la clase mayoritaria de SST-2 ronda el 50 %), por lo que debe interpretarse como una pieza de investigación sobre compresión, no como un clasificador de sentimiento utilizable en producción.

El repositorio es pequeño (0,2 GB), emplea licencia MIT, soporta únicamente inglés y se distribuye como `pytorch_model.bin` que requiere reconstruir la topología comprimida con la librería NeuralOps antes de cargar el state dict. No hay métricas de benchmarks independientes ni verificación de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base (12 capas, dimensión oculta 768) con capas densas sustituidas por equivalentes MoE de bajo rango (`ToMoECompressor`) |
| Parametros totales | 77.965.346 (checkpoint comprimido empaquetado, `k=128`) |
| Parametros activos | no disponible (el autor no documenta el patrón de enrutamiento ni el número de expertos activos por token) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base BERT-Base admite 512 tokens, pero el autor no lo declara para este checkpoint) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en `pytorch_model.bin`; no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch); requiere `config.json`, `compression_summary.json` y activos de tokenizador de `bert-base-uncased` |

## Arquitectura y entrenamiento

La arquitectura de partida es un transformer encoder BERT-Base estándar con 12 capas y dimensión 768, afinado previamente en la tarea de clasificación de sentimiento binaria de GLUE SST-2. Sobre ese profesor, NeuralOps aplica `ToMoECompressor`, un compresor de la familia `low_rank` que, según la model card, "reemplaza dinámicamente capas densas de feed-forward y proyección por un equivalente MoE-ficado". El checkpoint empaquetado corresponde al rango `k=128`, con 77.965.346 parámetros y una reducción del 28,79 % respecto al profesor. El autor no detalla el número de expertos, la función de enrutamiento, el coste computacional efectivo ni la composición exacta de las capas transformadas.

El proceso de recuperación combina compresión zero-shot y "LoRA healing": cuando la compresión zero-shot degrada la accuracy más de 2,0 puntos con una reducción superior a 1,10x, se aplica un ajuste LoRA con `r=8`, 50 pasos, `lr=2e-4` y un presupuesto de 45 segundos, ejecutado sobre una NVIDIA GeForce RTX 3090 (24 GB). La evaluación se realiza físicamente sobre la partición de validación de SST-2 (872 muestras). No se documentan el número de tokens de entrenamiento original del profesor, la composición del dataset más allá de GLUE SST-2, ni si hubo RLHF o DPO (no aplicables a una tarea de clasificación). Tampoco se describe ninguna innovación de decodificación especulativa ni atención lineal.

## Capacidades

- Clasificación de sentimiento binaria (negativo/positivo) sobre texto en inglés, con dos etiquetas de salida (`num_labels=2`).
- Inferencia sobre entradas tokenizadas con el vocabulario estándar de `bert-base-uncased`.
- Reconstrucción programática de la topología comprimida mediante `compress_model` de NeuralOps antes de cargar los pesos.
- No soporta tool calling ni function calling: es un modelo de clasificación, no un modelo generativo.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo "thinking", visión, audio ni capacidades multimodales.
- Capacidad multilingüe: únicamente inglés declarado; el vocabulario `uncased` cubre otros idiomas de forma marginal, pero no hay evaluación al respecto.
- Capacidad práctica de clasificación: muy limitada, con 52,41 % de accuracy en la validación de SST-2, cercana al baseline trivial.

## Casos de uso

- Investigación sobre compresión de modelos: el checkpoint sirve como punto de comparación reproducible para estudiar la relación entre rango de compresión (`k=256, 128, 64, 32`), reducción de parámetros y precisión downstream en una tarea controlada como SST-2.
- Docencia y divulgación de técnicas low-rank y MoE: permite ilustrar cómo se transforma un encoder BERT denso en una topología con capas tipo mezcla de expertos y cómo se serializa el resultado.
- Desarrollo y validación de la librería NeuralOps: útil como artefacto de prueba para verificar que `compress_model` reconstruye correctamente la topología y que `load_state_dict(strict=False)` carga los pesos comprimidos y los adaptadores LoRA.
- Reproducción de experimentos de "LoRA healing": permite replicar el protocolo de recuperación (r=8, 50 pasos, lr=2e-4) y medir su efecto sobre la accuracy en la partición de validación de SST-2.
- Análisis de degradación por compresión agresiva: con 52,41 % de accuracy frente al 91,63 % del profesor, es un caso de estudio de los límites del enfoque cuando el ratio de compresión es alto.
- Integración en pipelines de evaluación automática de compresores: puede incorporarse como baseline negativo en un banco de pruebas que compare distintos compresores del zoo sobre la misma tarea y dataset.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados por terceros):

| Rank (k) | Ratio físico | Parámetros comprimidos (reducción) | Accuracy zero-shot | Accuracy con LoRA | Diferencia vs profesor (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,10x | 99.816.482 (-8,8 %) | 49,08 % | 49,08 % | -42,55 % |
| 128 (empaquetado) | 1,40x | 77.965.346 (-28,8 %) | 49,08 % | 52,41 % | -39,22 % |
| 64 | 2,13x | 51.423.266 (-53,0 %) | 49,08 % | 49,20 % | -42,43 % |
| 32 | 2,87x | 38.152.226 (-65,2 %) | 49,08 % | 49,08 % | -42,55 % |

El resultado oficial del model-index para el checkpoint empaquetado es de 52,41 % de accuracy en la validación de GLUE SST-2 (`nyu-mll/glue`, configuración `sst2`, split `validation`), marcado como no verificado. El profesor de referencia alcanza 91,63 % en la misma evaluación. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 151,5 MB en `pytorch_model.bin` (fp32), por lo que la inferencia cabe holgadamente en cualquier GPU con 2 GB o más de VRAM; en CPU también es viable para lotes pequeños.
- GPU recomendadas: el autor evaluó sobre NVIDIA GeForce RTX 3090 (24 GB); cualquier GPU consumer moderna (RTX 3060 en adelante) es suficiente, e incluso GPUs integradas o CPU para inferencia puntual.
- Cabe en GPU consumer: sí, sin restricciones prácticas por memoria.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; el flujo previsto es PyTorch + Transformers + NeuralOps, reconstruyendo la topología con `compress_model` y cargando el state dict con `torch.load`.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El autor solo reporta un presupuesto de 45 segundos para el ajuste LoRA de recuperación, no métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (validación) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bert-comp-tomoe-compressor-sst2` (k=128) | 77.965.346 | no disponible | 52,41 % | MIT | Hugging Face, requiere NeuralOps |
| `google-bert/bert-base-uncased` (profesor afinado SST-2) | 109.483.778 | 512 tokens (modelo base) | 91,63 % (declarado por el autor) | Apache 2.0 (modelo base) | Hugging Face, Transformers estándar |
| BERT-Base sin comprimir (referencia) | 109.483.778 | 512 tokens | no disponible en esta información | Apache 2.0 | Hugging Face |

La comparación se limita al profesor declarado por el propio autor y al modelo base; no se dispone de datos de otros compresores del zoo ni de alternativas externas evaluadas sobre la misma partición en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento muy degradado: 52,41 % de accuracy en SST-2 frente al 91,63 % del profesor, una caída de 39,22 puntos que sitúa al modelo cerca de un clasificador trivial.
- Los resultados zero-shot son idénticos (49,08 %) en los cuatro rangos evaluados, lo que sugiere un colapso hacia una predicción constante y cuestiona la utilidad práctica del checkpoint más allá de la experimentación.
- El autor marca la métrica como no verificada (`verified: false`); no hay evaluación independiente.
- Requiere la librería NeuralOps para reconstruir la topología antes de cargar los pesos; no es cargable directamente con `AutoModelForSequenceClassification.from_pretrained` sin ese paso.
- No se documentan sesgos conocidos, pero al derivar de `bert-base-uncased` y de SST-2 hereda los sesgos del corpus original y de las reseñas de películas en inglés.
- Riesgo de alucinación no aplicable en sentido generativo (es un clasificador), pero sí riesgo de predicciones erróneas sistemáticas por la degradación descrita.
- Limitación de idioma: solo inglés declarado.
- Licencia MIT para el checkpoint, pero el modelo base `google-bert/bert-base-uncased` se distribuye bajo Apache 2.0; conviene revisar ambas condiciones para uso comercial.
- Sin variantes cuantizadas ni formatos GGUF/ONNX publicados, lo que limita su despliegue en entornos sin PyTorch.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de adopción comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/bert-comp-tomoe-compressor-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/low_rank/tomoe_compressor.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
