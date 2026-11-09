# tahamajs/bert-nasc-attention-sst2

## Resumen

`tahamajs/bert-nasc-attention-sst2` es un checkpoint de clasificación de sentimiento en inglés derivado de `google-bert/bert-base-uncased`, en el que el autor (Taha Majlesi) ha sustituido los bloques de atención softmax cuadrática de las 12 capas del transformer por el mecanismo `nasc_attention` de su librería NeuralOps. El modelo se ha destilado sobre la tarea SST-2 del benchmark GLUE y se distribuye únicamente con los pesos de atención y la cabeza de clasificación en FP16 (~55 MB), reconstruyendo el backbone congelado desde el checkpoint original de BERT.

El interés técnico del artefacto no está en la tarea en sí (clasificación binaria de sentimiento, un problema resuelto desde 2018), sino en servir como demostración reproducible de que un mecanismo de atención subcuadrática —con coste efectivo O(N) u O(N log N) frente a O(N²)— puede igualar a la atención estándar en precisión tras un proceso de destilación de representaciones en caché. El autor reporta 91,51 % de accuracy en el split de validación de SST-2, frente al 91,63 % del profesor BERT-base, con un coste de entrenamiento de 48,7 s en una RTX 3090.

Es un modelo de nicho, orientado a investigación sobre eficiencia atencional y a la validación de la infraestructura NeuralOps, no a despliegues de producción generalistas. El repositorio tiene cero descargas y cero likes en el momento de la consulta, y requiere `trust_remote_code=True` para cargarse.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base con atención `nasc_attention` subcuadrática en las 12 capas |
| Parámetros totales | ~110 M (heredados de bert-base-uncased; no se especifica el recuento exacto tras la sustitución) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (BERT-base soporta 512 tokens; el autor no declara el límite efectivo del mecanismo `nasc_attention`) |
| Tipos de cuantización | pesos publicados en FP16; no se documentan otras cuantizaciones |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16, ~55 MB), serialización modular de solo atención + cabeza de tarea |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` (12 capas, 768 de dimensión oculta, 12 cabezas) y reemplaza la atención multi-cabeza estándar por `nasc_attention`, un mecanismo que el autor describe como de complejidad operativa efectiva O(N) u O(N log N). El backbone base permanece congelado y se reconstruye en tiempo de carga desde el checkpoint original; el repositorio solo almacena los parámetros de atención destilados y la cabeza de clasificación, lo que reduce la huella de descarga a ~55 MB frente a los ~450 MB del BERT completo.

El entrenamiento sigue el «NeuralOps Cached Representation Distillation Protocol»: una primera etapa de alineamiento de subespacio oculto y una segunda de destilación por KL sobre logits más entropía cruzada de la tarea. El profesor se ejecuta de forma offline y sus representaciones se cachean, de modo que no ocupa VRAM durante el entrenamiento del estudiante. El proceso completo consta de 108 pasos de optimización, 48,7 s de duración, 18.182,7 tokens/s de throughput efectivo y un pico de 23.021 MB de VRAM en una RTX 3090. No se detalla el número de tokens de entrenamiento ni la composición exacta del dataset más allá de SST-2.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés, con una única etiqueta por secuencia.
- Inferencia estándar vía `AutoModelForSequenceClassification` de Transformers con `trust_remote_code=True`.
- Carga modular mediante la API `neuralops.hub.bert_zoo.load_pretrained_bert`, que reconstruye el modelo aplicando solo los pesos de atención destilados.
- Atención subcuadrática: el mecanismo `nasc_attention` está pensado para escalar mejor que la atención cuadrática en secuencias largas, aunque el autor no publica mediciones de latencia o memoria frente a BERT-base en distintas longitudes.
- No soporta generación de texto, tool calling, agentes, visión, audio ni modos de razonamiento extendido: es un encoder de clasificación.
- Capacidad multilingüe: nula más allá del inglés.

## Casos de uso

- Investigación sobre atención eficiente: punto de partida reproducible para comparar `nasc_attention` con atención softmax estándar en una tarea controlada (SST-2) con métricas publicadas y protocolo de destilación documentado.
- Validación de la librería NeuralOps: el modelo sirve como test de integración de la API `bert_zoo`, la serialización `attention_only_fp16` y el flujo de destilación con representaciones cacheadas.
- Clasificación de sentimiento en inglés con requisitos de memoria mínimos: los ~55 MB de pesos más el backbone congelado permiten desplegar el clasificador en entornos con poco almacenamiento, aunque la VRAM en inferencia sigue dependiendo del BERT-base completo.
- Experimentos de destilación profesor-estudiante: el protocolo en dos etapas (alineamiento de subespacio + KL sobre logits + CE) es reutilizable como receta para sustituir mecanismos de atención en otros encoders.
- Benchmarking de eficiencia atencional: útil para medir si la complejidad subcuadrática se traduce en ganancias reales de throughput en secuencias largas, algo que el autor no cuantifica en la model card.
- Docencia y divulgación: ejemplo compacto de cómo publicar pesos modulares (solo atención + cabeza) en lugar de checkpoints completos, con código de carga en una sola línea.

## Benchmarks y rendimiento

Evaluación sobre el split de validación de GLUE SST-2 (872 muestras de clasificación binaria):

| Métrica | Profesor (bert-base-uncased) | Estudiante pre-KD | Modelo destilado | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 90,37 % | 91,51 % | +1,15 % |
| Entropía cruzada de validación | 0,2428 | no calibrada | 0,2953 | no disponible |

Telemetría de entrenamiento (RTX 3090, 24 GB):

| Métrica | Valor |
|---|---|
| Duración total | 48,7 s |
| Pasos de optimización | 108 |
| Throughput efectivo | 18.182,7 tokens/s |
| VRAM pico | 23.021 MB |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible. Tampoco se reportan métricas de latencia o memoria en inferencia para secuencias largas, que serían el dato clave para evaluar la ventaja del mecanismo subcuadrático.

## Requisitos de hardware

- VRAM en inferencia: no documentada. Al reconstruirse sobre BERT-base completo (~110 M parámetros), una estimación razonable es ~0,5 GB en FP32 y ~0,3 GB en FP16 para el modelo, más el overhead de activaciones según longitud de secuencia.
- GPU recomendadas: el autor solo documenta entrenamiento en RTX 3090 (24 GB); para inferencia, cualquier GPU consumer con ≥4 GB debería ser suficiente, aunque no hay mediciones publicadas.
- Cabe en GPU consumer: sí, con alta probabilidad, dado el tamaño del backbone; sin confirmación empírica en la model card.
- Opciones de despliegue: Transformers con `trust_remote_code=True`; API `neuralops.hub.bert_zoo`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al requerir código remoto la integración con servidores de inferencia estándar no está garantizada.
- Latencia y throughput: solo se publica throughput de entrenamiento (18.182,7 tokens/s); no hay datos de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-nasc-attention-sst2` | ~110 M | no disponible | 91,51 % | MIT | Hugging Face, requiere `trust_remote_code` |
| `google-bert/bert-base-uncased` (fine-tuned SST-2) | 110 M | 512 | 91,63 % (profesor reportado) | Apache 2.0 | Hugging Face, estándar |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 | ~91 % (referencia habitual de la comunidad) | Apache 2.0 | Hugging Face, estándar |
| `roberta-base` (fine-tuned SST-2) | 125 M | 512 | ~94-95 % (referencia habitual de la comunidad) | MIT | Hugging Face, estándar |

La comparación con DistilBERT y RoBERTa se incluye como referencia de categoría; los valores de SST-2 de esas filas son cifras habituales de la literatura y no proceden de la información proporcionada para este modelo, por lo que deben verificarse antes de usarse en una evaluación formal.

## Limitaciones y advertencias

- Modelo de nicho con cero descargas y cero likes: no hay validación independiente de los resultados reportados por el autor.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; auditar `modeling_neuralops_bert.py` antes de usarlo en producción.
- Solo inglés y solo clasificación binaria de sentimiento; no es un modelo de propósito general.
- El autor no documenta la longitud de contexto efectiva de `nasc_attention` ni el comportamiento en secuencias largas, que es precisamente donde el mecanismo debería aportar ventaja.
- La precisión reportada (91,51 %) queda ligeramente por debajo del profesor (91,63 %) y muy lejos de encoders como RoBERTa en SST-2; no supone una mejora de calidad, solo de eficiencia teórica.
- La entropía cruzada de validación del estudiante (0,2953) es peor que la del profesor (0,2428), lo que sugiere calibración de probabilidades inferior; relevante si se usan los scores como confianza.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas en dominios distintos de reseñas (el modelo solo ha visto SST-2).
- Licencia MIT permite uso comercial, pero al derivar de `bert-base-uncased` (Apache 2.0) conviene conservar los avisos de atribución correspondientes.
- No hay datos publicados de latencia, memoria en inferencia ni soporte en frameworks de serving estándar, lo que dificulta estimar su coste real en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-nasc-attention-sst2
- Modelo base: https://huggingface.co/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE / SST-2: https://huggingface.co/datasets/glue
