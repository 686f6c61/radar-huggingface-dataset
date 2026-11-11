# tahamajs/bert-comp-aatc-xkv-compressor-sst2

## Resumen

`bert-comp-aatc-xkv-compressor-sst2` es un checkpoint de `google-bert/bert-base-uncased` afinado en GLUE SST-2 (clasificación binaria de sentimiento) y posteriormente comprimido con el motor `AATC_XKVCompressor` (`aatc_xkv_compressor`) de la librería NeuralOps, desarrollada por Taha Majlesi. La técnica aplicada es AATC-XKV (Attention-Aware Cross-Layer KV Cache Compression), un operador de compresión orientado a la caché KV que aquí se materializa sobre los pesos del modelo para reducir el número de parámetros.

El modelo resultante declara 102.129.227 parámetros frente a los 109.483.778 del BERT-base original (reducción del 6,72 %, ratio de compresión físico de 1,072x) y una precisión del 84,40 % en la partición de validación de SST-2, frente al 91,63 % del profesor sin comprimir (delta de -7,23 puntos). El checkpoint empaquetado corresponde al rango k=32, seleccionado como showcase; la model card indica que los rangos k=256, 128, 64 y 32 producen idénticos recuentos de parámetros y precisión en la evaluación realizada.

Su relevancia es fundamentalmente metodológica: sirve como artefacto reproducible para estudiar el compromiso entre compresión física y degradación de precisión en tareas de clasificación, y como ejemplo de integración de un pipeline de compresión (NeuralOps) con el ecosistema Hugging Face. No es un modelo generativo ni un modelo de propósito general: es un clasificador de sentimiento en inglés con una ventana de contexto de 512 tokens heredada de BERT-base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base), 12 capas, dimensión oculta D=768, comprimido con AATC_XKVCompressor |
| Parámetros totales | 102.129.227 (comprimido); 109.483.778 en el modelo base |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de bert-base-uncased; no se especifica en la model card) |
| Tipos de cuantización | no disponible (el checkpoint se distribuye en `pytorch_model.bin`, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`); requiere reconstrucción de topología con NeuralOps |

## Arquitectura y entrenamiento

La base es `google-bert/bert-base-uncased`, un transformer encoder de 12 capas y 768 dimensiones con 109.483.778 parámetros, afinado previamente para clasificación de sentimiento en GLUE SST-2. Sobre ese checkpoint se aplica el compresor `AATC_XKVCompressor` (familia `kv_cache`), que según la model card implementa compresión de caché KV consciente de la atención y entre capas. El resultado físico es un state dict con factores de bajo rango y buffers de compresión integrados, con un recuento final de 102.129.227 parámetros.

La model card documenta una evaluación Pareto en cuatro rangos (k=256, 128, 64 y 32) sobre la partición de validación de SST-2 (872 muestras), ejecutada en una NVIDIA GeForce RTX 3090 de 24 GB. Los cuatro rangos arrojan el mismo recuento de parámetros y la misma precisión (84,40 %), lo que sugiere que el rango no modifica materialmente el artefacto empaquetado en esta configuración. La política de "LoRA healing" descrita (r=8, 50 pasos, lr=2e-4, presupuesto de 45 s) se activa cuando la compresión zero-shot degrada más de 2,0 puntos con una reducción superior a 1,10x; en este caso la columna "Healed Acc" coincide con la zero-shot, y la propia tabla indica `LoRA Recovery Applied: False`. No se detallan el volumen de tokens de entrenamiento ni la composición del dataset más allá de GLUE SST-2.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés, con dos etiquetas de salida (`num_labels=2`).
- Inferencia sobre entradas de hasta 512 tokens, adecuada para reseñas, tuits y fragmentos de texto cortos.
- No soporta generación de texto, razonamiento multi-paso, código ni matemáticas: es un cabezal de clasificación, no un modelo causal.
- No dispone de tool calling ni function calling.
- No incorpora capacidades de agente ni planificación.
- Multilingüismo limitado al inglés; el vocabulario `bert-base-uncased` no está adaptado a otros idiomas.
- No incluye visión, audio ni modo "thinking".
- El checkpoint requiere reconstruir la topología comprimida con `neuralops` antes de cargar los pesos (`strict=False`), por lo que no es cargable directamente con `AutoModel` sin ese paso.

## Casos de uso

- Clasificación de reseñas de producto en inglés: el modelo asigna sentimiento positivo o negativo a textos de hasta 512 tokens; su tamaño (≈103 M de parámetros, ~195 MB de pesos) permite desplegarlo en CPU para lotes moderados.
- Moderación de comentarios y filtrado de opiniones negativas en foros: útil como primera etapa de un pipeline donde se descartan o priorizan mensajes según polaridad antes de un análisis más costoso.
- Análisis de sentimiento en encuestas y formularios de feedback: con 84,40 % de accuracy en SST-2, es adecuado para agregados estadísticos, no para decisiones individuales de alto riesgo.
- Baseline de investigación en compresión de modelos: sirve para reproducir la comparativa profesor (91,63 %) frente a estudiante comprimido (84,40 %) y medir el coste en precisión de AATC-XKV.
- Docencia y experimentación con técnicas de compresión: el repositorio incluye `compression_summary.json` con telemetría de los cuatro rangos, lo que facilita estudiar el comportamiento del compresor.
- Etiquetado automático de corpus para preentrenamiento o aumento de datos: puede generar etiquetas de polaridad a gran escala en inglés con un coste de inferencia bajo.
- Integración en pipelines de CI para validar que una técnica de compresión no degrada por debajo de un umbral de precisión definido.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Modelo | Dataset | Métrica | Valor |
|---|---|---|---|
| bert-comp-aatc-xkv-compressor-sst2 (k=32) | GLUE SST-2, validation | Accuracy | 84,40 % |
| Profesor `bert-base-uncased` (referencia del autor) | GLUE SST-2, validation | Accuracy | 91,63 % |
| Delta de paridad | GLUE SST-2, validation | Accuracy | -7,23 pp |

Evaluación multi-rango declarada (misma accuracy en todos los rangos):

| Rank (k) | Ratio físico | Parámetros comprimidos | Zero-shot Acc | Healed Acc |
|---|---|---|---|---|
| 256 | 1,07x | 102.129.227 (-6,7 %) | 84,40 % | 84,40 % |
| 128 | 1,07x | 102.129.227 (-6,7 %) | 84,40 % | 84,40 % |
| 64 | 1,07x | 102.129.227 (-6,7 %) | 84,40 % | 84,40 % |
| 32 | 1,07x | 102.129.227 (-6,7 %) | 84,40 % | 84,40 % |

No se han publicado en la información disponible resultados de MMLU, HumanEval ni GSM8K, ni comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (≈103 M de parámetros, ~195 MB de pesos más activaciones y caché de atención para 512 tokens); en la práctica cabe en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor reporta evaluación en una RTX 3090 (24 GB), muy por encima de lo necesario.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, GTX 1660 o incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; el flujo oficial es PyTorch + `transformers` + `neuralops` (reconstrucción de topología y carga con `strict=False`). Al no publicarse pesos en GGUF ni ONNX, el despliegue estándar es Python.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera latencia de milisegundos por muestra en GPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (validation) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bert-comp-aatc-xkv-compressor-sst2 | 102,1 M (comprimido) | 512 tokens | 84,40 % (declarado) | MIT | Hugging Face, requiere `neuralops` |
| google-bert/bert-base-uncased (profesor, según el autor) | 109,5 M | 512 tokens | 91,63 % (declarado) | Apache 2.0 | Hugging Face, `transformers` estándar |
| DistilBERT-base-uncased | 66 M | 512 tokens | no disponible en la información | Apache 2.0 | Hugging Face, `transformers` estándar |
| RoBERTa-base | 125 M | 512 tokens | no disponible en la información | MIT | Hugging Face, `transformers` estándar |

La comparación con DistilBERT y RoBERTa-base se ofrece por categoría (clasificadores encoder en inglés de tamaño similar), pero no se dispone de sus cifras SST-2 en la información proporcionada, por lo que no se afirman resultados.

## Limitaciones y advertencias

- Degradación de precisión notable: 84,40 % frente al 91,63 % del profesor, una pérdida de 7,23 puntos, superior al umbral de 2,0 puntos que la propia metodología NeuralOps marca como disparador de "healing"; en este checkpoint no se aplicó recuperación LoRA.
- El ratio de compresión real es modesto (1,072x, -6,72 % de parámetros), por lo que el ahorro de memoria y cómputo es limitado frente a otras técnicas de destilación o cuantización.
- Dependencia de la librería `neuralops` para reconstruir la topología y cargar los pesos; no es un checkpoint plug-and-play con `AutoModelForSequenceClassification`.
- Solo inglés y solo clasificación binaria de sentimiento; no debe usarse para generación ni para tareas fuera de dominio sin validación.
- Riesgo de sesgos heredados de `bert-base-uncased` y de SST-2 (reseñas de películas), con posible degradación en dominios como redes sociales, texto técnico o jerga.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas en entradas ambiguas, sarcasmo o negaciones complejas.
- La licencia MIT se aplica al artefacto, pero el modelo base `bert-base-uncased` se distribuye bajo Apache 2.0; conviene revisar ambas condiciones para uso comercial.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en el model-index).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción por terceros.
- La fecha de creación indicada (2026-11-10) es futura respecto a la fecha habitual de consulta; conviene verificar la vigencia del artefacto antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-aatc-xkv-compressor-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/kv_cache/aatc_xkv_compressor.py
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
