# tahamajs/bert-jamba-info-sst2

## Resumen

`tahamajs/bert-jamba-info-sst2` es un checkpoint de clasificación de sentimiento en inglés derivado de `google-bert/bert-base-uncased` (110 M de parámetros) en el que el autor, Taha Majlesi, ha sustituido el mecanismo de atención softmax cuadrática de las 12 capas del transformer por el mecanismo `jamba_info` de su librería NeuralOps. El objetivo declarado es demostrar que una atención subcuadrática (complejidad efectiva O(N) u O(N log N)) puede destilarse sobre una base BERT congelada y retener una parte sustancial de la calidad del profesor original en una tarea GLUE concreta, en este caso SST-2 (análisis de sentimiento binario).

El modelo se distribuye como un conjunto de pesos "attention-only" en FP16 de aproximadamente 55 MB, más una cabeza de clasificación, que se aplican en tiempo de carga sobre los pesos congelados de BERT-base descargados del Hub. No se redistribuye el modelo base completo. La evaluación reportada por el autor sobre el split de validación de SST-2 (872 ejemplos) sitúa la precisión del estudiante destilado en 76,83 %, frente al 91,63 % del profesor BERT-base y el 51,38 % del estudiante sin destilar.

Es relevante ahora porque forma parte de una línea de trabajo (el "Attention Zoo" de NeuralOps) que explora alternativas subcuadráticas a la atención estándar en arquitecturas tipo BERT, un área activa tras el interés renovado por arquitecturas híbridas y de estado recurrente. Conviene señalar que el repositorio tiene 0 descargas, 1 like y fue creado en noviembre de 2026, por lo que se trata de un artefacto de investigación muy reciente y sin validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base con atención subcuadrática `jamba_info` en las 12 capas |
| Parametros totales | 110 M (base BERT-base-uncased) + cabeza de clasificación; el repo solo almacena ~55 MB de pesos de atención y cabeza en FP16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT-base-uncased soporta 512 tokens, pero la model card no lo declara explícitamente para este checkpoint) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en FP16; no se documentan variantes GGUF, INT8 ni INT4) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, FP16, ~55 MB) con código remoto `modeling_neuralops_bert.py`; requiere `trust_remote_code=True` |
| Libreria | `neuralops` |
| Tarea | `text-classification` (sentimiento binario, SST-2) |
| Dataset de evaluación | GLUE / SST-2 (split de validación, 872 ejemplos) |
| Hardware de entrenamiento | NVIDIA GeForce RTX 3090 24 GB |
| Region | US |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased`, un transformer encoder de 12 capas y 110 M de parámetros, y reemplaza en todas las capas el bloque de multi-head attention softmax estándar por el mecanismo `jamba_info` de NeuralOps. Según la model card, este mecanismo presenta una complejidad operativa efectiva de O(N) u O(N log N) frente al O(N²) de la atención cuadrática convencional. Los pesos base de BERT permanecen congelados; solo se entrenan y serializan los parámetros de atención especializada y la cabeza de clasificación, lo que explica el tamaño reducido del repositorio (~55 MB frente a los ~450 MB del BERT-base completo).

El entrenamiento sigue el "NeuralOps Cached Representation Distillation Protocol", una destilación en dos etapas: primero una alineación de subespacio oculto (Stage 1) y después una combinación de KL sobre logits del profesor más entropía cruzada sobre la tarea (Stage 2). El protocolo cachea offline las representaciones del profesor, de modo que no se asigna VRAM al modelo docente durante el entrenamiento. La ejecución física se realizó en una RTX 3090 (24 GB) con Tensor Cores activos, con una duración total de 51,9 s, 130 pasos de optimización, un throughput efectivo de 20.511,1 tokens/s y un pico de VRAM de 14.796 MB. No se documentan el número total de tokens de entrenamiento, la composición del corpus más allá de SST-2, ni si hubo RLHF o DPO (no aplicables en un clasificador de este tipo).

## Capacidades

- Clasificación binaria de sentimiento en inglés (positivo/negativo) sobre texto de entrada, con salida de logits de dos clases.
- Encoder BERT-base subyacente, reutilizable conceptualmente para otras tareas de comprensión del lenguaje si se reemplaza la cabeza, aunque el checkpoint solo se ha entrenado y evaluado para SST-2.
- Atención subcuadrática `jamba_info` en las 12 capas, que en teoría permite procesar secuencias más largas con menor coste computacional que la atención cuadrática, si bien no se documenta el comportamiento empírico más allá de 512 tokens.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta visión, audio ni modo "thinking".
- Capacidad multilingüe limitada al inglés; no se ha entrenado ni evaluado en otros idiomas.

## Casos de uso

- Análisis de sentimiento de reseñas de producto en inglés: el modelo clasifica cada reseña como positiva o negativa; es adecuado para volúmenes moderados en los que el coste de una atención subcuadrática importe, aunque su precisión (76,83 %) queda lejos del BERT-base estándar (91,63 %) y conviene calibrar el umbral antes de producción.
- Moderación de comentarios y filtrado de toxicidad como señal auxiliar: puede usarse como clasificador de polaridad dentro de un pipeline más amplio, combinado con otros modelos, dado su reducido tamaño (~55 MB de pesos de atención más la base congelada).
- Investigación sobre atención subcuadrática: sirve como punto de partida reproducible para comparar `jamba_info` con otras atenciones del Attention Zoo de NeuralOps sobre la misma tarea y el mismo protocolo de destilación.
- Destilación de bajo coste en hardware de consumo: el entrenamiento completo cabe en una RTX 3090 en menos de un minuto según la telemetría del autor, por lo que es útil como banco de pruebas para experimentar con protocolos de destilación en una sola GPU.
- Clasificación por lotes en CPU o GPU de gama baja: al no requerir el modelo completo en VRAM más allá de los pesos base congelados, es viable en entornos con recursos limitados para tareas de sentimiento no críticas.
- Etiquetado preliminar de datasets: puede usarse para pre-anotar sentimiento en corpus en inglés antes de una revisión humana, aceptando la tasa de error implícita en su precisión del 76,83 %.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card, sobre el split de validación de GLUE SST-2 (872 ejemplos binarios):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante sin destilar (`jamba_info`) | Estudiante destilado | Delta |
|---|---|---|---|---|
| Accuracy GLUE SST-2 | 91,63 % | 51,38 % | 76,83 % | +25,46 pp |
| Cross-entropy de validación | 0,2428 | no calibrada | 0,5337 | — |
| Estado de destilación | — | — | Calibrado | — |

Telemetría de entrenamiento (clúster HPC Sharif):

| Metrica | Valor |
|---|---|
| GPU | NVIDIA GeForce RTX 3090 24 GB |
| Duración del entrenamiento | 51,9 s |
| Pasos de optimización | 130 |
| Throughput efectivo | 20.511,1 tokens/s |
| Pico de VRAM | 14.796 MB |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia, el modelo base BERT-base-uncased en FP32 ocupa ~440 MB y en FP16 ~220 MB; los pesos de atención adicionales son ~55 MB. El pico de VRAM durante el entrenamiento fue de 14.796 MB, pero la inferencia requiere mucho menos.
- GPU recomendadas: cualquier GPU con al menos ~1-2 GB de VRAM libre para FP16, incluidas GTX 1650, RTX 3060, RTX 4090, A100 y H100. El autor documenta el entrenamiento en RTX 3090.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas, dado el tamaño reducido del modelo.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (vía documentada por el autor) y la API `neuralops.hub.bert_zoo.load_pretrained_bert`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras de inferencia; el único dato es el throughput de entrenamiento (20.511,1 tokens/s en RTX 3090).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-jamba-info-sst2` | 110 M (base) + ~55 MB atención | no disponible | 76,83 % | MIT | Hugging Face, 0 descargas |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 tokens | 91,63 % (reportado por el autor) | Apache 2.0 | Hugging Face, ampliamente usado |
| BERT-base fine-tuned en SST-2 (referencia estándar) | 110 M | 512 tokens | ~92-93 % (referencia habitual de la literatura, no verificada aquí) | Apache 2.0 | Múltiples checkpoints en el Hub |
| Alternativas subcuadráticas tipo Mamba/Jamba (no BERT) | variable | variable | no disponible | variable | Hugging Face |

La comparativa directa más informativa es contra el propio profesor: el estudiante destilado pierde 14,8 puntos porcentuales de accuracy en SST-2 respecto a `bert-base-uncased` fine-tuned, a cambio de una atención con complejidad teórica menor. No se dispone de comparaciones con otros modelos subcuadráticos sobre la misma tarea en la información proporcionada.

## Limitaciones y advertencias

- Precisión muy por debajo del estado del arte en SST-2: 76,83 % frente al 91,63 % del profesor, una diferencia de 14,8 puntos que en la práctica puede ser inaceptable para producción.
- El estudiante sin destilar solo alcanza el 51,38 %, lo que sugiere que el mecanismo `jamba_info` requiere un proceso de destilación cuidadoso y no funciona bien de forma directa.
- Entrenamiento y evaluación limitados a una única tarea (SST-2) y un único split de validación de 872 ejemplos; no hay validación en test ni en otras tareas GLUE.
- Solo inglés; no se ha evaluado en otros idiomas ni en dominios distintos al de SST-2 (reseñas de cine).
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador), pero sí de clasificaciones erróneas sistemáticas en dominios alejados del entrenamiento.
- Sesgos: no se documenta ningún análisis de sesgo; al entrenarse sobre SST-2 hereda los sesgos de ese corpus (reseñas de cine en inglés, predominantemente de una época y estilo concretos).
- Licencia MIT, lo que permite uso comercial, pero el modelo base `bert-base-uncased` es Apache 2.0 y el código remoto `modeling_neuralops_bert.py` debe auditarse antes de usarlo en producción, ya que se ejecuta con `trust_remote_code=True`.
- Dependencia de la librería `neuralops` y del código remoto; no hay soporte documentado en vLLM, llama.cpp, Ollama ni TGI, lo que complica el despliegue estándar.
- Repositorio con 0 descargas y 1 like en el momento de la consulta; sin validación independiente ni revisión por pares.
- No se documenta el comportamiento más allá de 512 tokens pese a la promesa teórica de complejidad subcuadrática.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-jamba-info-sst2
- Modelo base: https://huggingface.co/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE / SST-2: https://huggingface.co/datasets/glue
