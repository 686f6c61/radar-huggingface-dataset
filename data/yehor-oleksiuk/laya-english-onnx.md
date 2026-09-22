# yehor-oleksiuk/laya-english-onnx

## Resumen

Laya English ONNX es una conversión a formato ONNX del checkpoint en inglés del modelo `convaiinnovations/laya`, publicada por el usuario yehor-oleksiuk. No es un modelo generativo: se trata de un clasificador de decisiones ("decision-model") de 421 millones de parámetros que recibe un estado y un conjunto de preguntas tipadas (`choice`, `score`, `noul`) y devuelve tres salidas numéricas: `scores`, `confidences` y `temperatures`. Su función es actuar como componente "System One" (decisión rápida) y es compatible a nivel de API con Jev System One.

La relevancia del repositorio es práctica: los checkpoints oficiales solo se distribuyen en `safetensors` fp32 con la pila de torch y transformers, lo que consume entre 1,3 y 1,7 GB de RAM solo en pesos. Esta versión ofrece un grafo ONNX portable (opset 21, exportado con `torch.onnx.dynamo_export`) ejecutable con `onnxruntime` sobre CPU sin dependencias de PyTorch, además de una cuantización int8 lista para usar en máquinas con recursos limitados.

El modelo es exclusivamente inglés: según el autor, es más preciso que el checkpoint multilingüe en inglés, pero produce resultados incorrectos con alta confianza en cualquier otro idioma. La ventana de contexto está limitada a 512 tokens. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y se publicó y actualizó el 22 de septiembre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DecisionModel (clasificador de decisiones, no generativo); detalles internos de capas no disponibles |
| Parámetros totales | 421 millones |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | fp32 (exacta) e int8 dinámica asimétrica QUInt8 (experimental) |
| Idiomas soportados | Inglés (`en`) únicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 21), un fichero por precisión; tokenizer en `tokenizer.json` y `tokenizer_config.json` |

Otros datos de interés:

| Parámetro | Valor |
|---|---|
| Entradas del grafo | `input_ids`, `attention_mask`, `type_ids`, `lengths`, `n_opts` |
| Salidas del grafo | `scores`, `confidences`, `temperatures` |
| Tipos de pregunta | `choice`, `score`, `noul` |
| Tamaño del repositorio | 2,1 GB (incluye fp32 e int8) |
| Librería | onnx |
| Modelo base | convaiinnovations/laya |
| Pipeline declarado | no disponible |
| Fecha de publicación | 2026-09-22 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo original más allá del nombre de la clase (`DecisionModel`) y de la firma de su método `forward`. Lo que sí se especifica es que la conversión a ONNX preserva exactamente la misma matemática que el modelo original: el grafo consume `input_ids`, `attention_mask`, `type_ids`, `lengths` y `n_opts`, y produce `scores`, `confidences` y `temperatures`. Se trata, por tanto, de un clasificador de decisión con salidas calibradas, no de un modelo de generación de texto. No hay decoder autoregresivo ni capacidad de producir lenguaje.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineamiento, ni sobre innovaciones arquitectónicas del checkpoint base. El aspecto técnico destacable de este repositorio concreto es la exportación con `torch.onnx.dynamo_export` a opset 21, que habilita inferencia en CPU con `onnxruntime` sin la pila de PyTorch, y la inclusión de una cuantización dinámica int8 asimétrica. Esta cuantización es un 15 % más rápida que fp32, pero su acuerdo de `argmax` con fp32 es de solo el 65,0 % sobre un conjunto de evaluación de 120 muestras, por lo que el autor la marca explícitamente como experimental y no apta como sustituto directo.

## Capacidades

- Decisión y clasificación sobre un estado dado: responde preguntas tipadas de tipo `choice` (elección entre opciones), `score` (puntuación) y `noul` mediante las salidas `scores` y `confidences`.
- Calibración de la respuesta: emite `temperatures`, lo que permite ajustar la confianza asociada a cada decisión.
- Inferencia en CPU sin GPU: el grafo ONNX se ejecuta con `onnxruntime` y el proveedor `CPUExecutionProvider`.
- Compatibilidad de API con Jev System One, lo que facilita sustituirlo en pipelines ya existentes que usen esa interfaz.
- Procesamiento en inglés con precisión superior a la del checkpoint multilingüe original, según el autor.
- No soporta generación de texto, razonamiento multi-paso, tool calling, function calling, agentes, visión, audio ni matemáticas simbólicas: no es un modelo generativo.
- Soporte multilingüe: nulo; el propio autor advierte de que en idiomas distintos del inglés produce respuestas incorrectas con alta confianza.

## Casos de uso

- Enrutado de decisiones en agentes conversacionales: dado el estado de una interacción y una pregunta de tipo `choice` con opciones predefinidas, el modelo selecciona la siguiente acción. Es adecuado porque su latencia es de unos 144 ms con 4 hilos en CPU y no requiere GPU.
- Clasificación de intenciones en inglés en atención al cliente: el estado de la conversación se codifica como entrada y el modelo elige entre un conjunto cerrado de intenciones. Encaja en despliegues sobre VPS sin acelerador.
- Priorización y puntuación de tickets o leads: usando preguntas de tipo `score`, las salidas pueden ordenar elementos por relevancia o urgencia, con `temperatures` como indicador de fiabilidad de cada puntuación.
- Componente "System One" delante de un LLM grande: al ser rápido y barato en CPU, puede prefiltrar o resolver decisiones triviales y reservar el modelo generativo para los casos que superen un umbral de confianza.
- Moderación y etiquetado de contenido en inglés: clasificación binaria o multietiqueta con confianza explícita, útil cuando se necesita auditar por qué se tomó una decisión.
- Inferencia en entornos on-premise o edge sin GPU: el grafo ONNX se ejecuta en CPU con un consumo de memoria del orden de 1,3 a 1,7 GB en fp32, lo que permite desplegarlo en hardware modesto.
- Evaluación y ajuste de calibración: las salidas `temperatures` y `confidences` permiten estudiar la calibración del modelo frente a conjuntos etiquetados antes de integrarlo en producción.
- Experimentación con cuantización: la variante int8 sirve para medir el compromiso entre velocidad y exactitud, aunque con el 65,0 % de acuerdo de `argmax` solo es apta para pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos medidos que aporta la model card son los siguientes:

| Métrica | Valor |
|---|---|
| Acuerdo de `argmax` int8 vs fp32 | 65,0 % sobre un conjunto de evaluación de 120 muestras |
| Latencia fp32, 1 hilo, batch 1 | ~400 ms |
| Latencia fp32, 4 hilos, batch 1 | ~144 ms |
| Latencia int8 | ~15 % más rápida que fp32 |
| Entorno de medida | Máquina cloud de 4 CPU |
| Previsión en VPS de 2 CPU | Aproximadamente el doble del valor de 1 hilo |
| Throughput con batch > 1 | no disponible |

No se dispone de comparaciones publicadas con otros modelos de decisión de la misma categoría.

## Requisitos de hardware

- Memoria: entre 1,3 y 1,7 GB de RAM solo para los pesos en fp32 según los checkpoints oficiales; el repositorio completo, con fp32 e int8, ocupa 2,1 GB. La variante int8 reduce ese requisito.
- CPU: cualquier procesador con soporte para `onnxruntime`. Con 4 hilos se miden ~144 ms por inferencia con batch 1; con 1 hilo, ~400 ms. En un VPS de 2 CPU, alrededor del doble del valor de un hilo.
- GPU: no necesaria. Solo se documenta el proveedor `CPUExecutionProvider`; no hay datos de ejecución con `CUDAExecutionProvider` ni con otras aceleraciones.
- GPU de consumo: irrelevante para este modelo, ya que no requiere acelerador; cabe en cualquier equipo con suficiente RAM.
- Opciones de despliegue: `onnxruntime` en Python (y cualquier runtime compatible con ONNX opset 21). No aplican vLLM, llama.cpp, Ollama ni TGI, porque el modelo no es generativo.
- Latencia y throughput: latencias medidas arriba para batch 1; no hay cifras publicadas de throughput con lotes mayores ni de concurrencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| yehor-oleksiuk/laya-english-onnx | 421 M | 512 tokens | Inglés | Apache 2.0 | ONNX fp32 e int8 | Inferencia en CPU sin PyTorch; int8 con 65,0 % de acuerdo de `argmax` |
| convaiinnovations/laya (original) | 421 M | no disponible | Multilingüe | Apache 2.0 | safetensors fp32 | Requiere torch y transformers; ~1,3-1,7 GB de RAM en pesos; menos preciso en inglés según el autor |
| Otros modelos de decisión comparables | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre alternativas equivalentes |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no razona de forma multi-paso y no soporta tool calling ni uso como agente.
- Idiomas: solo inglés. En cualquier otro idioma el autor lo describe como "basura con confianza", es decir, respuestas incorrectas emitidas con alta seguridad, lo que lo hace peligroso fuera de su dominio lingüístico.
- Contexto limitado a 512 tokens: los estados más largos requieren un paso previo de resumición.
- La cuantización int8 no es un reemplazo directo de fp32: su acuerdo de `argmax` con fp32 es solo del 65,0 % sobre 120 muestras, una muestra pequeña además. El propio autor recomienda usar `model_fp32.onnx` para trabajo real.
- Riesgo de alucinación silenciosa: al no generar texto, el fallo no es visible como texto inventado, sino como una decisión errónea acompañada de una confianza potencialmente alta. Es imprescindible usar el campo `confidences` y calibrar umbrales.
- Sesgos conocidos: no disponibles. No hay documentación sobre la composición del dataset de entrenamiento ni sobre evaluaciones de sesgo.
- Licencia Apache 2.0 en el repositorio y en el modelo base, lo que en principio permite uso comercial, pero conviene verificar las condiciones del proyecto `convaiinnovations/laya` y del sistema Jev System One con el que se declara compatibilidad.
- Soporte y mantenimiento: 0 descargas y 0 likes, repositorio publicado por un usuario individual. No hay garantías de mantenimiento, y la exportación ONNX no está respaldada por el proyecto original.
- Ausencia de benchmarks estándar: no se pueden comparar sus capacidades con otras alternativas mediante métricas reconocidas.
- La fecha de creación y actualización indicada (2026-09-22) es la que figura en el repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/yehor-oleksiuk/laya-english-onnx
- Modelo base en HuggingFace: https://huggingface.co/convaiinnovations/laya
- Código original, detalles de entrenamiento y benchmarks: https://github.com/NandhaKishorM/laya
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; únicamente aparecieron resultados genéricos sobre ChatGPT y OpenAI, sin relación con Laya.
