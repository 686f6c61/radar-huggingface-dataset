# tahamajs/bert-comp-armor-pruner-sst2

## Resumen

`tahamajs/bert-comp-armor-pruner-sst2` es un checkpoint comprimido de `google-bert/bert-base-uncased` afinado para clasificación de sentimiento en GLUE SST-2. Lo publica Taha Majlesi dentro del proyecto NeuralOps, una librería de compresión de modelos que agrupa distintos motores de poda y cuantización bajo una API común. El modelo aplica el motor `ARMORPruner` en el rango de compresión `k=256`, reduciendo el número de parámetros de 109,48 M a 151,95 M según la model card, con una ratio de compresión física declarada de `0.721x` y una reducción del 38,79 % de parámetros.

La relevancia del artefacto es metodológica más que de producto: sirve como ejemplo reproducible de cómo comprimir un encoder BERT manteniendo la precisión en una tarea downstream concreta, y de cómo aplicar un "healing" con LoRA cuando la poda degrada la métrica. En este caso el autor indica que no fue necesario aplicar LoRA (`LoRA Recovery Applied: False`) porque la caída zero-shot respecto al profesor fue de solo 0,23 puntos porcentuales, por debajo del umbral de 2,0 puntos que activa el healing.

El modelo es monolingüe (inglés), está pensado para clasificación binaria de sentimiento y se distribuye bajo licencia MIT. No es un modelo generativo ni un LLM conversacional: es un encoder de clasificación, por lo que sus casos de uso se limitan a tareas de etiquetado de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base, 12 capas, dimensión oculta 768) con poda estructurada/no estructurada vía `ARMORPruner` |
| Parámetros totales | 151.951.106 (checkpoint comprimido, `k=256`); base original: 109.483.778 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base BERT acepta hasta 512 tokens, pero la model card no lo declara explícitamente para este checkpoint) |
| Tipos de cuantización | No disponible (el repo empaqueta `pytorch_model.bin` en precisión completa; no se listan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado), `config.json`, `compression_summary.json`, assets de tokenizer (`vocab.txt`, `tokenizer.json`, `tokenizer_config.json`) |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased`, un transformer encoder de 12 capas y 768 dimensiones ocultas, preentrenado de forma genérica y posteriormente afinado en GLUE SST-2 (clasificación binaria de sentimiento). Sobre ese checkpoint se aplica el compresor `armor_pruner` de NeuralOps, que produce una topología comprimida con factores de bajo rango y buffers asociados. El checkpoint serializado incluye esos artefactos "horneados" en el state dict, de modo que la reconstrucción requiere instanciar el modelo base, aplicar `compress_model(..., {"method": "armor_pruner", "rank": 256})` y cargar los pesos con `strict=False`.

El autor reporta una evaluación multi-rango sobre la partición de validación de SST-2 (872 muestras) ejecutada en una NVIDIA GeForce RTX 3090 de 24 GB. La política de healing descrita consiste en aplicar LoRA con `r=8`, 50 pasos, `lr=2e-4` y un presupuesto de 45 segundos cuando la compresión zero-shot degrada más de 2,0 puntos con una reducción superior a `1.10x`. Para `k=256` no se activó el healing; para `k=128`, `k=64` y `k=32` tampoco se reportan mejoras tras el healing, según la tabla de la model card. No se detalla la composición del dataset de entrenamiento más allá de GLUE SST-2 ni se especifican tokens de preentrenamiento, RLHF ni DPO.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés, con dos etiquetas de salida.
- Inferencia de logits por secuencia mediante `BertForSequenceClassification`; no genera texto.
- Compatible con el ecosistema Hugging Face Transformers para tokenización y carga del modelo.
- Integración con la pipeline de compresión de NeuralOps (`compress_model`, `COMPRESSOR_REGISTRY`).
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- Capacidad multilingüe limitada al inglés; no se declaran otros idiomas.
- No dispone de modo "thinking", visión ni audio.

## Casos de uso

- Análisis de sentimiento en reseñas de producto: el modelo clasifica cada reseña en positiva o negativa; su tamaño comprimido (151,95 M de parámetros) permite desplegarlo en CPU o GPU de gama baja para volúmenes moderados.
- Moderación de comentarios en foros en inglés: se puede usar como primer filtro para detectar tono negativo y derivar a revisión humana, con la ventaja de que el checkpoint es un 38,8 % más pequeño que el BERT-base original.
- Enriquecimiento de datasets de opinión: etiquetado automático de grandes corpus en inglés para entrenar modelos posteriores o construir dashboards de satisfacción.
- Investigación en compresión de modelos: sirve como referencia reproducible para comparar `armor_pruner` con otras técnicas de poda sobre SST-2, ya que el repo incluye `compression_summary.json` con telemetría de los rangos `k=256, 128, 64, 32`.
- Benchmarking de pipelines de inferencia: al ser un clasificador pequeño, es útil para medir latencia y throughput de frameworks como vLLM, TGI o llama.cpp en tareas de clasificación, aunque la compatibilidad con esos motores no está declarada en la model card.
- Prototipado educativo: ejemplo mínimo de cómo comprimir y "curar" un BERT con LoRA en un entorno de investigación, con código de arranque incluido en la model card.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Rango (`k`) | Ratio físico | Parámetros comprimidos (reducción) | Accuracy zero-shot | Accuracy tras healing | Diferencia vs profesor (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| **256** (checkpoint publicado) | 0,72x | 151.951.106 (−38,8 %) | 91,40 % | 91,40 % | −0,23 pp |
| 128 | 0,84x | 130.717.442 (−19,4 %) | 90,83 % | 90,83 % | −0,80 pp |
| 64 | 0,91x | 120.100.610 (−9,7 %) | 89,79 % | 89,79 % | −1,84 pp |
| 32 | 0,95x | 114.792.194 (−4,8 %) | 88,42 % | 88,42 % | −3,21 pp |

Métrica principal: accuracy en GLUE SST-2, split de validación (872 muestras), evaluada en RTX 3090. El profesor (`bert-base-uncased` afinado en SST-2) obtiene 91,63 %. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint pesa 289,9 MB según la model card, por lo que la inferencia en FP32 requiere aproximadamente 0,6 GB de VRAM (pesos más activaciones y overhead). Cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU moderna; el autor validó en NVIDIA GeForce RTX 3090 (24 GB), pero el modelo es sobredimensionado para ese hardware.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y equivalentes; también en CPU para lotes pequeños.
- Opciones de despliegue: la model card solo documenta carga vía `transformers` + `neuralops` con `pytorch_model.bin`. No se declara compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada. El autor menciona un presupuesto de 45 s para el healing LoRA, pero no reporta métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| `tahamajs/bert-comp-armor-pruner-sst2` (k=256) | 151,95 M | No disponible | 91,40 % (validación) | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor afinado en SST-2) | 109,48 M | 512 tokens (modelo base) | 91,63 % (referencia del autor) | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~67 M | 512 tokens | No disponible en esta información | Apache 2.0 | Hugging Face |
| `roberta-base` afinado en SST-2 | ~125 M | 512 tokens | No disponible en esta información | MIT | Hugging Face |

La comparativa con DistilBERT y RoBERTa se incluye por categoría (clasificadores de sentimiento en inglés), pero no se dispone de sus métricas SST-2 en la información proporcionada, por lo que no se pueden contrastar numéricamente con este checkpoint.

## Limitaciones y advertencias

- El checkpoint declara 151,95 M de parámetros, un número superior al del BERT-base original (109,48 M), pese a anunciar una reducción del 38,8 %. La model card no explica esta discrepancia, lo que conviene verificar antes de confiar en las cifras de compresión.
- Solo clasifica sentimiento binario en inglés; no es un modelo generativo ni sirve para otras tareas sin reentrenamiento.
- Riesgo de alucinación no aplica en sentido estricto (no genera texto), pero sí puede producir clasificaciones erróneas en dominios alejados de SST-2 (por ejemplo, sarcasmo, jerga o textos técnicos).
- Sesgos heredados de `bert-base-uncased` y de SST-2: el corpus de entrenamiento son reseñas de películas, con posible sesgo de dominio y de estilo.
- La licencia MIT permite uso comercial, pero el modelo base `bert-base-uncased` está bajo Apache 2.0; conviene revisar la compatibilidad de ambas licencias en producción.
- El proceso de reconstrucción requiere la librería `neuralops` y aplicar `compress_model` antes de cargar el state dict con `strict=False`; no es un checkpoint cargable directamente con `AutoModel.from_pretrained` sin ese paso.
- La carga con `strict=False` puede enmascarar claves faltantes o inesperadas; es recomendable inspeccionar el resultado de `load_state_dict` en producción.
- No hay resultados de benchmarks independientes ni verificación externa de las métricas declaradas (`verified: false` en la model card).
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; la madurez y el mantenimiento del proyecto NeuralOps no están contrastados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-armor-pruner-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/pruning/armor_pruner.py
- Licencia del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
