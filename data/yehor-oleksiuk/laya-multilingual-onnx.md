# yehor-oleksiuk/laya-multilingual-onnx

## Resumen

Laya multilingual ONNX es una exportación a formato ONNX del modelo `convaiinnovations/laya-multilingual`, publicada por el usuario yehor-oleksiuk. No se trata de un modelo generativo de texto, sino de un clasificador de decisión: recibe un estado textual junto con preguntas tipadas (`choice`, `score`, `noul`) y devuelve respuestas calibradas mediante tres salidas (`scores`, `confidences`, `temperatures`). El modelo base tiene 322 millones de parámetros y está pensado para decisiones multilingües, con etiquetas explícitas de ruso e inglés y mención de más de 100 idiomas en la model card.

El valor del repositorio no está en el modelo en sí, sino en el empaquetado: los checkpoints oficiales solo se distribuyen en `safetensors` fp32 y requieren la pila de PyTorch más Transformers (entre 1,3 y 1,7 GB de RAM solo para los pesos). Esta versión ofrece un grafo ONNX portable que se ejecuta con `onnxruntime` en cualquier CPU, sin GPU, junto con una cuantización int8 dinámica para entornos con recursos muy ajustados.

La relevancia actual es de tipo operativo: permite desplegar decisiones calibradas en VPS pequeños, entornos edge o cascadas de pre-filtrado antes de un LLM grande. La conversión se realizó con `torch.onnx.dynamo_export` (opset 21) y mantiene la misma matemática que `DecisionModel.forward`, además de ser compatible a nivel de API con Jev System One. El repositorio tiene 0 descargas y 0 likes, por lo que se trata de una publicación reciente y sin validación comunitaria todavía.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de decisión (clase `DecisionModel`) exportado a grafo ONNX; arquitectura interna no detallada en la información disponible |
| Parametros totales | 322 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (los estados más largos requieren un paso previo de resumen) |
| Tipos de cuantizacion | fp32 exacta (`model_fp32.onnx`) e int8 dinámica QUInt8 asimétrica (`model_int8.onnx`, experimental) |
| Idiomas soportados | Multilingüe; etiquetas explícitas `ru` y `en`; la model card menciona más de 100 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 21), generado con `torch.onnx.dynamo_export`; tokenizer en `tokenizer.json` y `tokenizer_config.json` |
| Entradas del grafo | `input_ids`, `attention_mask`, `type_ids`, `lengths`, `n_opts` |
| Salidas del grafo | `scores`, `confidences`, `temperatures` |
| Tamano del repositorio | 1,6 GB |
| Modelo base | `convaiinnovations/laya-multilingual` |
| Fecha de publicacion | 2026-09-22 (creación), 2026-09-22 (última actualización) |

## Arquitectura y entrenamiento

La model card describe el modelo como un clasificador de decisión puro, no generativo: no produce texto, sino que combina un estado y una serie de preguntas tipadas (`choice`, `score`, `noul`) con un número variable de opciones (`n_opts`) para emitir puntuaciones, confianzas calibradas y temperaturas. La exportación replica exactamente la función `DecisionModel.forward` del repositorio original, de modo que el grafo ONNX conserva el mismo comportamiento numérico que el checkpoint fp32 en PyTorch. No se especifica en la información disponible si la arquitectura subyacente es un transformer encoder, un modelo híbrido u otra variante, ni el número de capas, dimensiones ocultas o cabezas de atención.

Tampoco hay datos publicados sobre el entrenamiento: se desconoce el número de tokens, la composición del dataset, si hubo fases de RLHF o DPO y qué técnica de calibración se empleó para las confianzas. La model card remite al repositorio de GitHub del proyecto original (`NandhaKishorM/laya`) para obtener el código, los detalles de entrenamiento y los benchmarks. La innovación técnica de esta publicación concreta es el propio proceso de conversión a ONNX con `torch.onnx.dynamo_export` y opset 21, junto con una cuantización dinámica QUInt8 asimétrica que reduce el tamaño y acelera la inferencia aproximadamente un 15 %.

## Capacidades

- Clasificación de decisiones sobre un estado: selecciona entre `n_opts` opciones (`choice`), asigna una puntuación (`score`) o determina la ausencia de opción válida (`noul`).
- Salidas calibradas: devuelve `scores`, `confidences` y `temperatures`, lo que permite fijar umbrales de confianza y derivar casos dudosos a revisión humana.
- Procesamiento multilingüe: etiquetas explícitas de ruso e inglés y mención de más de 100 idiomas en la model card.
- Inferencia en CPU sin GPU: grafo ONNX ejecutable con `onnxruntime` y `CPUExecutionProvider` en cualquier máquina.
- Compatibilidad de API con Jev System One, según la model card.
- Cuantización int8 disponible para equipos con poca memoria, con la advertencia de que es experimental.
- No soporta generación de texto, tool calling, function calling, uso como agente, razonamiento multi-paso, visión ni audio. Estas capacidades no están presentes ni documentadas.

## Casos de uso

- Enrutamiento de decisiones en asistentes conversacionales: dado el estado de la conversación y un conjunto de opciones, el modelo devuelve la opción más probable junto a una confianza, lo que permite decidir si se responde automáticamente o se escala a un agente humano. Es adecuado porque el modelo está diseñado específicamente para este formato de entrada y salida.
- Moderación y triaje con umbral de confianza: la salida `confidences` permite clasificar contenido y derivar a revisión manual los casos por debajo de un umbral definido, en lugar de forzar una decisión binaria.
- Puntuación de respuestas en encuestas y formularios: el tipo de pregunta `score` permite asignar puntuaciones calibradas a respuestas abiertas en ruso y en inglés sin necesidad de entrenar un modelo propio.
- Pre-filtro en cascada antes de un LLM grande: al resolver decisiones simples en CPU con latencias de decenas de milisegundos, reduce el número de llamadas a modelos generativos costosos y baja el coste por petición.
- Despliegue en VPS o entornos edge sin GPU: con unos 64 ms por decisión a batch 1 en una caja de 4 CPU, encaja en infraestructura modesta de atención al cliente o back-office donde no hay acelerador disponible.
- Clasificación por lotes de registros históricos: el límite de 1024 tokens por estado permite procesar transcripciones cortas o resúmenes de conversaciones en pipelines offline de análisis.
- Sistemas de recomendación de opción única: cuando hay que elegir un elemento entre un catálogo cerrado (`n_opts`), el modelo puntúa cada alternativa y ofrece una confianza asociada a la elección.
- Sustitución directa del stack PyTorch en producción: equipos que ya usan el modelo base pueden migrar a ONNX para eliminar la dependencia de PyTorch y Transformers en el contenedor de inferencia, reduciendo el tamaño de la imagen y el consumo de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las únicas métricas aportadas por el autor son de latencia y de acuerdo entre cuantizaciones:

| Metrica | Valor |
|---|---|
| Latencia fp32, batch 1, 1 hilo (caja cloud de 4 CPU) | ~169 ms |
| Latencia fp32, batch 1, 4 hilos (caja cloud de 4 CPU) | ~64 ms |
| Latencia int8 | ~15 % más rápida que fp32 |
| Latencia esperada en VPS de 2 CPU | Aproximadamente el doble del valor de un solo hilo |
| Acuerdo de argmax int8 vs fp32 | 76,7 % sobre un conjunto de evaluación de 120 muestras |

## Requisitos de hardware

- No requiere GPU: el modelo está pensado para ejecutarse en CPU con `onnxruntime` y el proveedor `CPUExecutionProvider`.
- VRAM estimada para inferencia: 0 GB (ejecución en CPU). No se documenta uso de GPU ni proveedores CUDA o TensorRT.
- Memoria RAM estimada: el repositorio ocupa 1,6 GB e incluye los dos grafos; el checkpoint original en fp32 consume entre 1,3 y 1,7 GB solo en pesos, por lo que conviene reservar del orden de 1,5 a 2 GB para el proceso en fp32.
- GPU recomendadas: no aplica. Cualquier CPU moderna es suficiente; el cuello de botella es el número de hilos disponibles.
- Cabe en cualquier equipo de consumo, incluidos portátiles y VPS de gama baja; no es necesaria una RTX 4090 ni hardware de centro de datos.
- Opciones de despliegue documentadas: `onnxruntime` en Python con `CPUExecutionProvider`, cargando `model_fp32.onnx` para uso real y `model_int8.onnx` solo en entornos muy restringidos. vLLM, llama.cpp, Ollama y TGI no están documentados ni son aplicables a este tipo de grafo de decisión.
- Latencia y throughput: ~169 ms por decisión a un hilo y ~64 ms con cuatro hilos en una caja cloud de 4 CPU, batch 1. El throughput no se especifica en la información disponible.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de decisión con la misma interfaz (`choice` / `score` / `noul`) y salidas calibradas, por lo que la comparativa se limita al checkpoint base del que deriva esta exportación.

| Modelo | Parametros | Contexto | Formato | Dependencias | Licencia |
|---|---|---|---|---|---|
| `yehor-oleksiuk/laya-multilingual-onnx` | 322 M | 1024 tokens | ONNX fp32 e int8 | `onnxruntime` (CPU) | Apache 2.0 |
| `convaiinnovations/laya-multilingual` (base) | 322 M | No disponible | `safetensors` fp32 | PyTorch y Transformers | Apache 2.0 |

Frente a LLM generativos multilingües de tamaño comparable, la comparación no es pertinente porque la tarea es distinta: este modelo no genera texto, solo clasifica y puntúa opciones. No se han encontrado en la información proporcionada alternativas equivalentes con las que comparar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo generativo: no puede redactar texto, mantener conversaciones ni ejecutar tareas de razonamiento de varios pasos. Usarlo como chatbot produciría resultados inválidos.
- La cuantización int8 es experimental: su acuerdo de argmax con fp32 es solo del 76,7 % sobre 120 muestras, por lo que no es una sustitución directa. El propio autor recomienda usar `model_fp32.onnx` para trabajo real.
- Ventana de contexto limitada a 1024 tokens: los estados más largos necesitan un paso previo de resumen, lo que introduce pérdida de información y complejidad adicional en el pipeline.
- Idiomas: aunque la model card menciona más de 100 idiomas, las etiquetas explícitas solo cubren ruso e inglés. El rendimiento en otras lenguas no está documentado ni medido.
- Sesgos: no se documenta ninguna evaluación de sesgos, equidad o comportamiento en dominios sensibles. Al ser un clasificador que produce decisiones, los sesgos del dataset de entrenamiento se traducen directamente en decisiones sesgadas.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de calibración incorrecta, es decir, confianzas altas en decisiones erróneas. La procedencia de las temperaturas y confianzas no se detalla.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta. No hay informes independientes de calidad ni de comportamiento en producción.
- Trazabilidad incompleta: se desconoce el dataset de entrenamiento, el número de tokens y si hubo ajuste por RLHF o DPO, lo que dificulta evaluar riesgos de licencia o de datos.
- Licencia Apache 2.0 en este repositorio, heredada del modelo base. Antes de un uso comercial conviene verificar también la licencia y las condiciones del proyecto original en GitHub y del checkpoint de `convaiinnovations`.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/yehor-oleksiuk/laya-multilingual-onnx
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Código, detalles de entrenamiento y benchmarks originales: https://github.com/NandhaKishorM/laya
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo; las consultas devolvieron únicamente páginas de soporte de Microsoft sin relación con el modelo.
