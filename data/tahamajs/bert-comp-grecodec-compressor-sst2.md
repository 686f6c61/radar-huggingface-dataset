# tahamajs/bert-comp-grecodec-compressor-sst2

## Resumen

`bert-comp-grecodec-compressor-sst2` es un checkpoint de BERT-Base (`google-bert/bert-base-uncased`, 109,48 M de parámetros) afinado para clasificación de sentimiento en GLUE SST-2 y posteriormente comprimido con el motor `grecodec_compressor` de la librería NeuralOps. La compresión es física, no meramente lógica: el modelo empaquetado contiene 35.165.954 parámetros, lo que supone una reducción del 67,88 % y un ratio de compresión de 3,113x respecto al modelo original.

El autor es Taha Majlesi y el modelo forma parte de un "compressor zoo" experimental que evalúa distintos ranks de compresión (`k=256, 128, 64, 32`) sobre una misma tarea. El checkpoint publicado corresponde al rank `k=64`, seleccionado como punto de Pareto tras aplicar un proceso de "LoRA healing" (adaptadores LoRA de rango 8 entrenados durante 50 pasos con `lr=2e-4` y un presupuesto de 45 segundos) para recuperar parte de la precisión perdida por la compresión.

La relevancia del modelo es metodológica más que de producto: demuestra el compromiso entre ratio de compresión y precisión downstream en un transformer encoder pequeño, y publica telemetría completa por rank. La precisión final en validación de SST-2 es del 75,57 %, frente al 91,63 % del profesor sin comprimir, es decir, una pérdida de 16,06 puntos porcentuales. El modelo está pensado para inglés, clasificación binaria de sentimiento y experimentación con técnicas de compresión low-rank.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Base), 12 capas, dimensión oculta 768 |
| Parametros totales | 35.165.954 (comprimido); modelo base original: 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base BERT-Base admite 512 tokens, pero la model card no lo declara) |
| Tipos de cuantizacion | no disponible; la compresion aplicada es low-rank (GreCoDeC) con factores de bajo rango y adaptadores LoRA integrados |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased`, un transformer encoder de 12 capas y 768 dimensiones ocultas con 109,48 M de parámetros, preentrenado de forma genérica y afinado para clasificación binaria de sentimiento sobre GLUE SST-2. Sobre ese checkpoint se aplica el compresor `grecodec_compressor` (familia `low_rank`, implementado en `neuralops/compression/low_rank/grecodec_compressor.py`), que reduce el número de parámetros mediante descomposición de bajo rango con rank `k=64`.

El proceso de compresión se evalúa en cuatro ranks (`256`, `128`, `64`, `32`) sobre el split de validación de SST-2 (872 muestras) en una NVIDIA GeForce RTX 3090 de 24 GB. Cuando la compresión zero-shot degrada la precisión más de 2,0 puntos con una reducción superior a 1,10x, NeuralOps aplica "LoRA healing": adaptadores LoRA de rango `r=8` entrenados durante 50 pasos con `lr=2e-4` y un presupuesto de 45 segundos. En el rank `k=64`, la precisión zero-shot es del 51,38 % y tras el healing asciende al 75,57 %. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset más allá de GLUE SST-2 ni si hubo RLHF/DPO (no aplicable a un clasificador de este tipo).

## Capacidades

- Clasificación binaria de sentimiento en inglés (0 = negativo, 1 = positivo) sobre textos estilo SST-2.
- Inferencia sobre frases individuales; el pipeline declarado es `text-classification`.
- Compresión low-rank físicamente materializada: el checkpoint contiene los factores de bajo rango y los adaptadores LoRA ya integrados en el state dict.
- Reconstrucción reproducible mediante la API de NeuralOps (`compress_model` con `method: "grecodec_compressor"` y `rank: 64`).
- Telemetría de compresión publicada en `compression_summary.json` para los ranks 256, 128, 64 y 32.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: es un encoder clasificador, no un modelo generativo.
- Capacidad multilingüe: no; solo inglés.

## Casos de uso

- Clasificación de sentimiento en reseñas de producto: el modelo puede etiquetar reseñas cortas en inglés como positivas o negativas en un pipeline de `transformers`, con un coste de inferencia muy bajo gracias a sus 35,2 M de parámetros.
- Moderación de comentarios a escala: al ser un encoder pequeño, se puede desplegar en CPU o en GPUs modestas para filtrar grandes volúmenes de texto y derivar solo los casos dudosos a un modelo mayor.
- Enrutamiento de tickets de soporte: usar la polaridad del mensaje como señal auxiliar para priorizar quejas frente a comentarios neutros o positivos en un sistema de triaje.
- Análisis de opinión en redes sociales: procesar lotes de publicaciones en inglés y agregar la proporción de sentimiento positivo/negativo por periodo o por campaña.
- Investigación sobre compresión de modelos: servir como punto de referencia reproducible para comparar técnicas low-rank (GreCoDeC) frente a poda, cuantización o destilación sobre una misma tarea y dataset.
- Docencia y experimentación: ejemplo didáctico de cómo aplicar compresión física y LoRA healing a un BERT-Base, con telemetría por rank y script de reconstrucción incluidos.
- Baseline ligero en pipelines de NLP: como clasificador de sentimiento de bajo coste en entornos con restricciones de memoria o de latencia, siempre que se acepte la pérdida de precisión frente al profesor.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index y en la model card (no verificados de forma independiente):

| Rank (k) | Ratio fisico | Parametros comprimidos (reduccion) | Precision zero-shot | Precision tras LoRA | Delta vs profesor (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,63x | 67.016.450 (-38,8 %) | 59,40 % | 50,92 % | -40,71 % |
| 128 | 2,39x | 45.782.786 (-58,2 %) | 52,41 % | 68,12 % | -23,51 % |
| 64 (publicado) | 3,11x | 35.165.954 (-67,9 %) | 51,38 % | 75,57 % | -16,06 % |
| 32 | 3,67x | 29.857.538 (-72,7 %) | 49,89 % | 72,36 % | -19,27 % |

Evaluación realizada sobre el split de validación de GLUE SST-2 (872 muestras) en una NVIDIA GeForce RTX 3090 de 24 GB. El profesor sin comprimir alcanza 91,63 % de precisión. El checkpoint publicado (k=64) obtiene 75,57 % de precisión en validación según la model card; el model-index declara el mismo valor (75,57) con `verified: false`.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 35,2 M de parámetros, el checkpoint en fp32 ocupa aproximadamente 140 MB y en fp16 unos 70 MB. Cabe holgadamente en cualquier GPU consumer y en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM libre; la evaluación del autor se hizo en una RTX 3090, pero no es necesaria para inferencia. A100 o H100 no aportan ventaja para este tamaño.
- Cabe en GPU consumer: sí, en todas las GPU modernas (desde una GTX 1050 en adelante) e incluso en CPU para lotes moderados.
- Opciones de despliegue: `transformers` (con reconstrucción previa vía NeuralOps), y por extensión `torch.compile` o TorchScript. No se publican pesos GGUF, por lo que `llama.cpp`/Ollama no son aplicables directamente; vLLM y TGI están orientados a modelos generativos y no se documentan para este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño, se espera un throughput alto en CPU y muy alto en GPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precisión SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-comp-grecodec-compressor-sst2` (k=64) | 35,17 M | no disponible | 75,57 % (val) | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor, afinado SST-2) | 109,48 M | 512 tokens (modelo base) | 91,63 % (val, referencia del autor) | Apache 2.0 | Hugging Face |
| DistilBERT-base (referencia de modelo pequeño) | 66 M aprox. | 512 tokens | no disponible en la informacion proporcionada | Apache 2.0 | Hugging Face |
| Modelos comprimidos low-rank comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con DistilBERT se incluye como referencia de tamaño, pero no se dispone de su precisión SST-2 en la información proporcionada. No se han identificado en la información disponible otros checkpoints del mismo "compressor zoo" publicados de forma independiente.

## Limitaciones y advertencias

- Pérdida de precisión significativa: 75,57 % frente al 91,63 % del profesor, una caída de 16,06 puntos porcentuales. No es adecuado para producción donde se requiera alta exactitud.
- Solo inglés: el vocabulario y el afinamiento son de `bert-base-uncased`; no hay soporte multilingüe.
- Solo clasificación binaria de sentimiento: no genera texto, no hace tool calling ni razonamiento multi-paso.
- Requiere reconstrucción del grafo comprimido con NeuralOps antes de cargar el state dict (`strict=False`); no es un checkpoint estándar de `transformers` cargable directamente.
- Solo se publica `pytorch_model.bin`; no hay safetensors ni GGUF, lo que limita el despliegue en runtimes ligeros y obliga a confiar en la serialización pickle.
- El model-index marca la métrica como `verified: false`; los resultados son declarados por el autor y no han sido replicados de forma independiente.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas en textos ambiguos, sarcasmo o dominios distintos de SST-2.
- Sesgos: no se documentan análisis de sesgo; al derivar de BERT-Base preentrenado en datos web, puede heredar sesgos de género, raza o dominio.
- Licencia MIT: permite uso comercial, pero conviene revisar la licencia del modelo base (Apache 2.0) y citar el software NeuralOps según el BibTeX de la model card.
- Fecha de creación declarada en 2026-11-10; verificar la vigencia y el mantenimiento del repositorio antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-grecodec-compressor-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/low_rank/grecodec_compressor.py
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
