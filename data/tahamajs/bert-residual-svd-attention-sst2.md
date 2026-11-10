# tahamajs/bert-residual-svd-attention-sst2

## Resumen

`tahamajs/bert-residual-svd-attention-sst2` es un checkpoint de clasificación de sentimiento en inglés construido sobre `google-bert/bert-base-uncased` (110 M de parámetros), en el que el autor (Taha Majlesi) ha sustituido los bloques de atención softmax cuadrática de las 12 capas del transformer por el mecanismo `residual_svd_attention` de su librería NeuralOps. El objetivo del modelo no es competir en precisión con BERT estándar, sino servir como demostración reproducible de que una atención subcuadrática (complejidad efectiva O(N) u O(N log N)) puede destilarse desde un profesor cuadrático y recuperar buena parte de su rendimiento en una tarea GLUE concreta (SST-2).

El modelo se ha afinado y evaluado sobre la partición de validación de SST-2 (872 muestras de clasificación binaria) mediante el protocolo *Cached Representation Distillation* de NeuralOps, que evita mantener el profesor en VRAM cacheando offline sus representaciones. Todo el entrenamiento se ejecutó en una única NVIDIA GeForce RTX 3090 de 24 GB, con 164 pasos de optimización en dos etapas y una duración total de 76 segundos.

Es relevante ahora porque ejemplifica una tendencia práctica: la serialización modular de solo los pesos de atención (55 MB en FP16) sobre un backbone congelado, y la publicación de checkpoints de investigación de atención eficiente con métricas de destilación explícitas. Conviene tratarlo como artefacto de investigación y no como un clasificador listo para producción: su precisión (78,67 %) queda 12,96 puntos por debajo del profesor BERT-base (91,63 %).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base con atención `residual_svd_attention` (subcuadrática) en las 12 capas |
| Parámetros totales | 110 M (backbone BERT-base congelado) + cabeza de clasificación; los pesos entrenados publicados son solo de atención y cabeza |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base BERT-base admite 512 tokens; el autor no especifica el contexto efectivo del mecanismo SVD) |
| Tipos de cuantización | No disponible (pesos publicados en FP16; no se documentan variantes GGUF, INT8 ni INT4) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16, ~55 MB), serialización `attention_only_fp16`; requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` (12 capas, 768 de dimensión oculta, 12 cabezas) y reemplaza la atención multi-cabeza estándar por `residual_svd_attention`, un mecanismo que el autor describe con complejidad operativa efectiva O(N) u O(N log N) frente a la O(N²) de la MHA clásica. El backbone permanece congelado; únicamente se entrenan los parámetros de atención y la cabeza de clasificación, que se serializan aparte y se aplican en tiempo de carga mediante un *remote code shim* (`modeling_neuralops_bert.py`) que inicializa los pesos base desde `bert-base-uncased`.

El entrenamiento sigue el protocolo *Cached Representation Distillation* de NeuralOps en dos etapas: primero una alineación de subespacio oculto (Stage 1 Subspace Hidden Alignment) y después una combinación de KL sobre logits del profesor y entropía cruzada de la tarea (Stage 2 Logit KL + Task CE). Se ejecutaron 164 pasos de optimización en 76 segundos sobre una RTX 3090, con un throughput efectivo de 17.675,9 tokens/s y un pico de VRAM de 6.972 MB, sin asignar VRAM al profesor gracias al cacheado offline de representaciones. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset más allá de GLUE/SST-2, ni si hubo RLHF o DPO.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés, con salida de logits de dos clases.
- Razonamiento de secuencia corta heredado del encoder BERT-base subyacente, limitado por la cabeza de clasificación afinada exclusivamente en SST-2.
- Procesamiento por lotes estándar vía `AutoModelForSequenceClassification` de Hugging Face con `trust_remote_code=True`.
- Carga modular mediante la API `neuralops.hub.bert_zoo.load_pretrained_bert`, que reconstruye el modelo aplicando solo los pesos de atención destilados.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, modo thinking, visión ni audio.
- Capacidad multilingüe: no disponible; el modelo está etiquetado únicamente como inglés.

## Casos de uso

- Investigación en atención eficiente: banco de pruebas para medir la pérdida de precisión al sustituir MHA cuadrática por `residual_svd_attention` en un transformer encoder estándar, con una referencia clara (91,63 % del profesor frente a 78,67 % del estudiante).
- Destilación de representaciones con VRAM limitada: el protocolo de cacheado offline permite reproducir el experimento completo en una sola RTX 3090 en 76 segundos, útil para validar pipelines de destilación antes de escalarlos a modelos mayores.
- Análisis de sentimiento en prototipos de bajo coste: para demos internas o experimentos académicos donde la precisión del estado del arte no es crítica y se prioriza un footprint de 55 MB sobre el backbone congelado.
- Evaluación comparativa de mecanismos de atención: al publicar pesos solo de atención, facilita intercambiar el mecanismo sobre el mismo backbone BERT y comparar métricas en SST-2 de forma controlada.
- Docencia y reproducibilidad: ejemplo completo y citables (BibTeX incluido) de fine-tuning con `trust_remote_code` y serialización modular de pesos para cursos de NLP.
- Integración en pipelines de Hugging Face: al exponer la interfaz estándar de `text-classification`, puede conectarse a `pipeline("text-classification")` para pruebas de integración, siempre con validación adicional antes de cualquier uso real.

## Benchmarks y rendimiento

Evaluación sobre la partición de validación de GLUE SST-2 (872 muestras binarias), según la model card:

| Métrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD | Modelo destilado |
|---|---|---|---|
| Exactitud GLUE SST-2 | 91,63 % | 54,59 % | 78,67 % |
| Entropía cruzada de validación | 0,2428 | No calibrada | 0,5393 |
| Delta de exactitud frente al profesor | — | −37,04 % | −12,96 % |

Telemetría de entrenamiento reportada por el autor: 164 pasos, 76,0 s, 17.675,9 tokens/s, pico de 6.972 MB de VRAM en RTX 3090. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el autor reporta un pico de 6.972 MB durante el entrenamiento en RTX 3090, por lo que la inferencia en FP16 debería caber holgadamente en GPUs de 8 GB o más.
- GPU recomendadas: cualquier GPU con soporte de Tensor Cores y al menos 8 GB de VRAM; el autor valida el flujo en NVIDIA GeForce RTX 3090 (24 GB, Ampere).
- GPU de consumo: sí, cabe en RTX 3090, RTX 4080/4090 y previsiblemente en RTX 3060 Ti/4060 Ti de 8 GB, aunque no se documentan pruebas en estas últimas.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True` (flujo validado por el autor) y la API `neuralops.hub.bert_zoo`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el formato de pesos (solo atención en safetensors FP16) no es directamente compatible con motores de inferencia genéricos sin el shim de código remoto.
- Latencia y throughput: no disponibles para inferencia; solo se publica throughput de entrenamiento (17.675,9 tokens/s).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-residual-svd-attention-sst2` | 110 M (backbone) + atención destilada | No disponible | 78,67 % | MIT | Hugging Face, requiere `trust_remote_code` |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 | 91,63 % (reportado por el autor) | Apache 2.0 | Hugging Face |
| Alternativas de atención eficiente tipo Longformer/Performer | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de resultados comparables de otros checkpoints de atención subcuadrática sobre SST-2, por lo que la comparativa se limita al profesor y a la referencia genérica.

## Limitaciones y advertencias

- Pérdida de precisión significativa: 78,67 % frente al 91,63 % del profesor, una diferencia de 12,96 puntos que lo sitúa lejos de un clasificador de sentimiento utilizable en producción.
- Entropía cruzada de validación de 0,5393 frente a 0,2428 del profesor, lo que indica una calibración de probabilidades notablemente peor.
- Entrenamiento muy corto (164 pasos, 76 s) y sobre una única tarea y una única partición de validación; no hay evidencia de generalización a otros dominios ni a otras tareas GLUE.
- Requiere `trust_remote_code=True` y un shim de código remoto (`modeling_neuralops_bert.py`) que inicializa pesos desde `bert-base-uncased`; esto introduce dependencia de código de terceros no auditado y de la disponibilidad del modelo base.
- El repositorio pesa 0,0 GB según Hugging Face y solo contiene los pesos de atención (~55 MB); sin el backbone base el modelo no es autónomo.
- Idiomas: solo inglés; no se documenta comportamiento en castellano ni en otros idiomas.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al ser un clasificador binario, el riesgo se traduce en falsos positivos/negativos sistemáticos más que en alucinación generativa.
- Licencia MIT permite uso comercial, pero el modelo base `bert-base-uncased` está bajo Apache 2.0 y el código remoto de NeuralOps debe verificarse por separado antes de un despliegue comercial.
- Sin datos de benchmarks más allá de SST-2 ni de latencia de inferencia; no debe presentarse como alternativa lista para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-residual-svd-attention-sst2
- Modelo base: https://huggingface.co/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia del repositorio NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE / SST-2: https://huggingface.co/datasets/glue
