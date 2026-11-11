# tahamajs/bert-comp-astro-quantizer-sst2

## Resumen

`bert-comp-astro-quantizer-sst2` es un checkpoint de BERT-Base (`google-bert/bert-base-uncased`) afinado para clasificación de sentimiento en GLUE SST-2 y posteriormente procesado con el motor de compresión `AstroQuantizer` de la librería NeuralOps. El autor es tahamajs y el modelo se publica como demostración del "Compressor Zoo" de NeuralOps, un conjunto de herramientas de compresión de modelos (cuantización, LoRA healing, poda de bajo rango). El checkpoint se serializa en el rank de exhibición `k=32`.

La arquitectura base es un transformer encoder de 12 capas con dimensión oculta 768 y 109.483.778 parámetros totales, es decir, un BERT-Base estándar sin modificaciones estructurales. El modelo resuelve una tarea concreta: clasificación binaria de sentimiento (positivo/negativo) sobre texto en inglés, con una cabeza de clasificación de 2 etiquetas.

Su relevancia es fundamentalmente metodológica más que de rendimiento: sirve como referencia reproducible de cómo aplicar cuantización uniforme min-max simétrica con asignación adaptativa de bits por canal (Fisher-adaptive bit allocation) sobre un transformer pequeño, y de cómo medir el impacto en accuracy frente al modelo profesor. Cabe señalar que en este checkpoint concreto el ratio de compresión físico es 1.00x (0,0 % de reducción de parámetros), por lo que el interés está en el pipeline, no en el ahorro de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Base), 12 capas, dimensión oculta 768 |
| Parametros totales | 109.483.778 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base BERT-Base soporta 512 tokens; el autor no lo declara explícitamente) |
| Tipos de cuantizacion | Cuantización uniforme min-max / simétrica con asignación adaptativa de bits por canal de salida (rango `[min_bits, max_bits]`); el checkpoint serializado se empaqueta en `k=32` |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch), más `config.json`, `compression_summary.json` y assets del tokenizer BERT uncased |
| Tarea | Clasificación de texto (sentimiento binario, GLUE SST-2) |
| Librería | `neuralops` |
| Tamaño del repositorio | 0,2 GB |
| Pesos empaquetados | 208,9 MB |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased`, un transformer encoder bidireccional de 12 capas, 768 dimensiones ocultas y 109.483.778 parámetros, preentrenado de forma genérica y afinado posteriormente sobre GLUE SST-2 (clasificación de sentimiento binaria). Sobre ese checkpoint afinado se aplica `AstroQuantizer`, un motor de cuantización uniforme min-max/simétrica que incorpora una asignación adaptativa de bits por canal de salida guiada por la información de Fisher. El motor soporta envoltorios `LoRALinear`, `nn.Linear` y `Conv1D` (para GPT-2), y dispone de un parámetro `target_attention_only` que permite omitir FFN/MLP y preservar las cabezas de clasificación.

El pipeline de NeuralOps evalúa varios ranks (`k=256, 128, 64, 32`) sobre la partición de validación de SST-2 (872 muestras) en una RTX 3090 de 24 GB. La política de "healing" aplica LoRA de rango `r=8` durante 50 pasos con `lr=2e-4` y un presupuesto de 45 segundos cuando la compresión zero-shot degrada la accuracy más de 2,0 puntos con una reducción superior a 1,10x. En este checkpoint, sin embargo, el ratio físico es 1.00x y la reducción de parámetros es del 0,0 %, por lo que no se activó el healing (`LoRA Recovery Applied: False`) y el resultado coincide con el del modelo profesor. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset de preentrenamiento ni detalles de RLHF/DPO.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés, con salida de logits de 2 clases.
- Extracción de representaciones contextuales propias de BERT-Base (12 capas, 768 dimensiones), reutilizables como encoder para tareas descendentes.
- Inferencia por lotes sobre secuencias de texto tokenizadas con el vocabulario `bert-base-uncased`.
- Integración con el pipeline de compresión de NeuralOps para reconstrucción y carga del estado comprimido.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni flujos de agente.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe: únicamente inglés (vocabulario uncased en inglés).
- No es un modelo generativo: no produce texto libre.

## Casos de uso

- Análisis de sentimiento en reseñas de producto: el modelo clasifica reseñas cortas en inglés en positivas o negativas; su ventana de 512 tokens (heredada de BERT-Base) cubre la mayoría de reseñas de e-commerce.
- Moderación de comentarios en foros en inglés: filtrado previo de mensajes con tono negativo para revisión humana, usando la salida de logits como puntuación de confianza.
- Monitorización de opinión en redes sociales: procesamiento por lotes de tuits o posts cortos en inglés para agregar tendencia de sentimiento por franja temporal.
- Etiquetado asistido de datasets: generación de etiquetas preliminares de sentimiento que luego se revisan manualmente, reduciendo el coste de anotación.
- Baseline reproducible para investigación en compresión: punto de partida para comparar técnicas de cuantización y LoRA healing sobre un transformer pequeño con una métrica clara (accuracy en SST-2).
- Docencia y experimentación con NeuralOps: ejemplo ejecutable de reconstrucción de un checkpoint comprimido mediante `compress_model` y `load_state_dict(strict=False)`.
- Enrutamiento de tickets de soporte: clasificación rápida de la polaridad del mensaje del cliente en inglés para priorizar colas de atención.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados de forma independiente). Evaluación sobre la partición de validación de GLUE SST-2 (872 muestras) en una NVIDIA GeForce RTX 3090.

| Rank (`k`) | Ratio físico | Parámetros comprimidos (reducción) | Accuracy zero-shot | Accuracy con healing | Paridad vs profesor (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1.00x | 109.483.778 (-0,0 %) | 91,86 % | 91,86 % | +0,23 % |
| 128 | 1.00x | 109.483.778 (-0,0 %) | 91,86 % | 91,86 % | +0,23 % |
| 64 | 1.00x | 109.483.778 (-0,0 %) | 91,86 % | 91,86 % | +0,23 % |
| 32 (checkpoint publicado) | 1.00x | 109.483.778 (-0,0 %) | 91,86 % | 91,86 % | +0,23 % |

El autor declara una accuracy de validación en GLUE SST-2 de 91,86 % para el checkpoint publicado, frente a una línea base del profesor de 91,63 %. No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.), que además no aplican a un modelo de clasificación.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,44 GB solo de pesos (109,5 M de parámetros × 4 bytes), más activaciones y overhead del runtime; en la práctica cabe holgadamente en cualquier GPU consumer.
- VRAM estimada en FP16/BF16: aproximadamente 0,22 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor realizó la evaluación en una NVIDIA GeForce RTX 3090 (24 GB). También es viable en RTX 4090, A100, H100, T4 o GPUs integradas con soporte CUDA.
- Cabe en GPU consumer: sí, en cualquier modelo con 2 GB o más (GTX 1650, RTX 3060, RTX 4060, etc.), e incluso en CPU para lotes pequeños.
- Opciones de despliegue: PyTorch nativo con `transformers` (`BertForSequenceClassification`) más la reconstrucción del pipeline de NeuralOps; exportación a ONNX o TorchScript para servir; integración en servicios HTTP con FastAPI o similar. No se documenta soporte directo para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada. La evaluación del autor se completó en una RTX 3090, pero no se publican métricas de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `tahamajs/bert-comp-astro-quantizer-sst2` | 109,5 M | no disponible (base: 512) | 91,86 % (declarado) | MIT | Hugging Face, librería `neuralops` |
| `google-bert/bert-base-uncased` (profesor, según el autor) | 109,5 M | 512 | 91,63 % (declarado por el autor) | Apache 2.0 | Hugging Face, `transformers` |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~66 M | 512 | no disponible en esta ficha | Apache 2.0 | Hugging Face, `transformers` |
| `roberta-base` afinado en SST-2 | ~125 M | 512 | no disponible en esta ficha | MIT | Hugging Face, `transformers` |

La comparativa se limita a modelos de la misma categoría (encoders pequeños para clasificación de sentimiento). No se dispone de métricas verificadas de las alternativas en la información proporcionada, por lo que solo se incluye el dato declarado por el autor para el modelo profesor.

## Limitaciones y advertencias

- El checkpoint no reduce parámetros (ratio 1.00x, -0,0 %): no aporta ahorro de memoria ni de cómputo respecto al BERT-Base original, pese a estar etiquetado como "comprimido".
- La accuracy de 91,86 % es un dato declarado por el autor y marcado como no verificado (`verified: false`) en el model-index.
- Solo admite inglés; el vocabulario `bert-base-uncased` no cubre otros idiomas de forma fiable.
- Es un modelo de clasificación binaria: no genera texto, no razona y no soporta tool calling ni agentes.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de clasificaciones erróneas en textos ambiguos, irónicos o de dominio muy distinto al de SST-2 (reseñas de películas).
- El sesgo heredado del preentrenamiento de BERT-Base y del dataset SST-2 no se documenta ni se mitiga en la información disponible.
- La carga requiere reconstruir la topología con `compress_model` antes de `load_state_dict(strict=False)`; un uso directo con `from_pretrained` sin ese paso puede fallar o producir pesos no coincidentes.
- La licencia MIT del repositorio se acompaña de un `license_link` al repositorio de GitHub de NeuralOps; conviene verificar la compatibilidad con el uso comercial previsto, ya que el modelo base original es Apache 2.0.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-astro-quantizer-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación de `AstroQuantizer`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/quantization/astro_quantizer.py
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
