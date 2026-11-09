# tahamajs/bert-hybrid-local-kernel-sst2

## Resumen

`tahamajs/bert-hybrid-local-kernel-sst2` es un checkpoint de BERT-Base (`bert-base-uncased`, 110 M de parámetros) en el que el autor, Taha Majlesi, ha sustituido los bloques de atención softmax cuadrática de las 12 capas del transformer por el mecanismo `hybrid_local_kernel` de su librería NeuralOps. El objetivo es demostrar que es posible reemplazar la atención estándar por una variante subcuadrática (complejidad efectiva O(N) u O(N log N)) y recuperar buena parte de la calidad original mediante destilación de representaciones, sin reentrenar el modelo base desde cero.

El checkpoint se ha afinado y evaluado sobre la tarea SST-2 del benchmark GLUE (clasificación binaria de sentimiento en inglés) y se distribuye únicamente con los pesos de atención y la cabeza de clasificación en FP16 (~55 MB), reconstruyendo el backbone congelado desde `bert-base-uncased` en tiempo de carga mediante código remoto (`trust_remote_code=True`).

Su relevancia es fundamentalmente metodológica: sirve como referencia reproducible del protocolo de destilación con caché offline de NeuralOps (sin asignar VRAM al profesor durante el entrenamiento) y como ejemplo práctico de atención subcuadrática aplicada a una arquitectura BERT estándar. No es un modelo de propósito general ni un sustituto directo de BERT-Base en producción: el propio autor reporta una caída de accuracy frente al profesor (80,85 % frente a 91,63 %).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base con atención `hybrid_local_kernel` (subcuadrática) en las 12 capas |
| Parametros totales | 110 M (backbone BERT-Base congelado) + pesos de atención y cabeza de clasificación entrenados |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base BERT-Base soporta 512 tokens; la model card no especifica el contexto efectivo del kernel híbrido) |
| Tipos de cuantizacion | Pesos distribuidos en FP16; no se documentan otras cuantizaciones |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, solo atención y cabeza, ~55 MB) + backbone congelado cargado desde `bert-base-uncased` |

## Arquitectura y entrenamiento

La arquitectura parte de BERT-Base (12 capas, 768 de dimensión oculta, 12 cabezas de atención, encoder bidireccional) y reemplaza la atención multi-cabeza estándar por `hybrid_local_kernel`, un mecanismo híbrido que combina atención local con un kernel global para lograr una complejidad efectiva O(N) u O(N log N) en lugar de O(N²). El backbone permanece congelado; solo se entrenan los parámetros de atención y la cabeza de clasificación, que se serializan aparte y se aplican sobre `bert-base-uncased` en el momento de la carga mediante el shim `modeling_neuralops_bert.py`.

El entrenamiento sigue el protocolo *Cached Representation Distillation* de NeuralOps, en dos etapas: una primera de alineación de subespacio oculto y una segunda con KL sobre logits más entropía cruzada sobre la tarea. El profesor es `bert-base-uncased` y las representaciones se cachean offline, de modo que el profesor no consume VRAM durante el ajuste. La ejecución se realizó en una NVIDIA RTX 3090 (24 GB) con 173 pasos de optimización, 53,2 s de duración total, throughput de 26 642,3 tokens/s y un pico de 10 983 MB de VRAM. El dataset de evaluación y ajuste es SST-2 (split de validación de GLUE, 872 muestras binarias).

## Capacidades

- Clasificación binaria de sentimiento en inglés (positivo/negativo) sobre secuencias de texto.
- Inferencia con atención subcuadrática, lo que en teoría reduce el coste computacional en secuencias largas respecto a la atención cuadrática estándar.
- Carga modular: solo descarga ~55 MB de pesos de atención y cabeza, reutilizando el backbone BERT-Base congelado.
- Integración con `transformers` mediante `AutoModelForSequenceClassification` y `trust_remote_code=True`.
- Carga de alto nivel a través de la API `neuralops.hub.bert_zoo.load_pretrained_bert`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo *thinking*.
- Capacidad multilingüe: no, únicamente inglés.

## Casos de uso

- Análisis de sentimiento en reseñas de producto en inglés: el modelo clasifica cada texto en positivo o negativo; adecuado para volúmenes moderados donde el coste de inferencia importa más que la precisión máxima, dado su accuracy de 80,85 % en SST-2.
- Moderación de comentarios en foros o redes en inglés: filtro previo de toxicidad o polaridad negativa antes de un modelo mayor; la atención subcuadrática abarata el procesado de hilos largos.
- Investigación en eficiencia de atención: banco de pruebas reproducible para comparar `hybrid_local_kernel` frente a atención softmax estándar en una tarea GLUE concreta, con métricas y telemetría publicadas.
- Docencia y experimentación con destilación de representaciones: ejemplo completo del protocolo NeuralOps (caché offline del profesor, dos etapas, sin VRAM del profesor) sobre una arquitectura conocida.
- Prototipado rápido de pipelines de clasificación: al pesar solo ~55 MB, se puede desplegar en entornos con almacenamiento o ancho de banda limitados, reutilizando el backbone BERT-Base ya presente en caché.
- Baseline para *knowledge distillation* en clasificación de texto: punto de partida para medir cuánta calidad se recupera al sustituir atención cuadrática por subcuadrática en tareas GLUE.
- Evaluación comparativa de kernels de atención: útil para equipos que investigan alternativas a softmax y necesitan una referencia con números publicados (accuracy, cross-entropy, throughput, VRAM).

## Benchmarks y rendimiento

Evaluación sobre el split de validación de SST-2 (GLUE, 872 muestras binarias):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`hybrid_local_kernel`) | Modelo destilado |
|---|---:|---:|---:|
| Accuracy SST-2 | 91,63 % | 51,03 % | 80,85 % |
| Cross-entropy de validación | 0,2428 | no calibrada | 0,4659 |
| Delta de accuracy | — | — | +29,82 pp |

Telemetría de entrenamiento (RTX 3090, 24 GB):

| Metrica | Valor |
|---|---|
| Duracion del entrenamiento | 53,2 s |
| Pasos de optimizacion | 173 |
| Throughput efectivo | 26 642,3 tokens/s |
| Pico de VRAM | 10 983 MB |

No se han publicado resultados en otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone BERT-Base en FP32 ocupa aproximadamente 440 MB de pesos; en FP16, unos 220 MB. Sumando activaciones y la cabeza de clasificación, la inferencia cabe holgadamente en GPUs de 4-8 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; también funciona en CPU para volúmenes bajos. El entrenamiento reportado se hizo en una RTX 3090.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM; el modelo completo en FP16 no llega a 1 GB en memoria.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el shim `modeling_neuralops_bert.py`), API de NeuralOps (`neuralops.hub.bert_zoo`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras de inferencia; solo se reporta throughput de entrenamiento (26 642,3 tokens/s en RTX 3090).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-hybrid-local-kernel-sst2` | 110 M (backbone) + atención | no disponible | 80,85 % | MIT | Hugging Face (código remoto) |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 tokens | 91,63 % (reportado por el autor) | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 tokens | no disponible en la información proporcionada | Apache 2.0 | Hugging Face |
| `roberta-base` afinado en SST-2 | 125 M | 512 tokens | no disponible en la información proporcionada | MIT | Hugging Face |

La comparación directa con `distilbert` y `roberta-base` no puede hacerse con rigor porque la información proporcionada no incluye sus métricas en SST-2; solo se dispone del dato del profesor BERT-Base citado por el propio autor.

## Limitaciones y advertencias

- Caída de accuracy de 10,78 puntos porcentuales respecto al profesor BERT-Base (80,85 % frente a 91,63 %): no es un sustituto directo en producción sin validación adicional.
- El estudiante pre-destilación rinde al nivel del azar (51,03 % en una tarea binaria), lo que evidencia que el mecanismo de atención subcuadrática por sí solo no conserva la calidad sin destilación.
- Solo inglés: no soporta otros idiomas.
- Solo clasificación binaria de sentimiento (SST-2); no es un modelo generativo ni sirve para otras tareas GLUE sin reajuste.
- Requiere `trust_remote_code=True` para cargar el shim de modelado, lo que implica ejecutar código del autor en el entorno local.
- Dependencia del backbone `bert-base-uncased` descargado por separado; el repositorio no es autocontenido.
- Riesgo de alucinación: no aplica en sentido estricto (es clasificador), pero puede producir etiquetas erróneas en dominios distintos de SST-2 por sesgo de dominio.
- Sesgos: heredados del corpus de entrenamiento de BERT-Base (texto web en inglés) y de SST-2 (reseñas de películas); no se documenta análisis de sesgo.
- Licencia MIT permite uso comercial, pero el backbone subyacente `bert-base-uncased` está bajo Apache 2.0; conviene revisar ambas.
- Sin métricas publicadas fuera de SST-2 ni cifras de latencia de inferencia; el modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria.
- El contexto efectivo del kernel híbrido no está documentado; no se debe asumir que soporta secuencias más largas que los 512 tokens de BERT-Base sin verificación empírica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-hybrid-local-kernel-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Dataset SST-2 (GLUE): https://huggingface.co/datasets/glue
- Paper de BERT: https://arxiv.org/abs/1810.04805
