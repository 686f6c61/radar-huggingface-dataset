# SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v3

## Resumen

szl-receiptagent-qwen35-0.8b-v3 es un adaptador PEFT (LoRA) publicado por SZLHOLDINGS sobre el modelo base Qwen/Qwen3.5-0.8B. Se presenta como un modelo orientado a la generación de texto conversacional, con un nombre que sugiere especialización en el dominio de recibos y agentes de procesamiento documental ("receiptagent"). El repositorio contiene tanto los pesos del adaptador como, según la model card, pesos fusionados ("adapter+full"), con un total de 752.393.024 parámetros en formato safetensors.

El modelo se distribuye bajo licencia Apache 2.0 y la arquitectura declarada en los tags es `qwen3_5_text`, heredada del modelo base de Qwen. La model card emplea un formato propio denominado `szl-card/v1` que documenta de forma explícita la evidencia disponible (licencia, modelo base, entrenamiento y evaluación) y marca como ausentes o no ejecutados elementos como benchmarks estándar, firma criptográfica de recibos y código fuente en GitHub.

Su relevancia práctica es limitada pero acotada: se trata de una iteración pequeña (menos de 0,8B parámetros) pensada para ejecutarse en hardware modesto, incluyendo portátiles con GPU Blackwell según el nombre del recibo de entrenamiento. No obstante, la ausencia de benchmarks estándar y de evaluación verificable hace que cualquier despliegue en producción deba ir precedido de una validación propia sobre el dominio objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tag `qwen3_5_text`) |
| Parametros totales | 752.393.024 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repositorio en safetensors; no se documentan GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT; la card indica "adapter+full") |

## Arquitectura y entrenamiento

El modelo es un ajuste fino mediante PEFT (presumiblemente LoRA, dado el tag `peft` y la librería declarada) sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5. No se documenta en la información disponible el rango, la configuración de LoRA ni los hiperparámetros del entrenamiento. Tampoco se especifica el número de tokens de entrenamiento ni la composición del dataset, aunque el nombre del repositorio y la etiqueta "ReceiptAgent" apuntan a datos de recibos, extracción de campos y flujos agénticos de procesamiento documental.

La model card incluye un recibo de entrenamiento (`training_receipt.laptop-blackwell.json`) y un recibo de fusión (`merge_receipt.json`), lo que sugiere que el adaptador se entrenó en un equipo con GPU Blackwell y posteriormente se fusionó con el modelo base. No hay información sobre RLHF, DPO ni otras etapas de alineación. La card declara explícitamente que los benchmarks estándar no se han ejecutado (NOT RUN) y que la evidencia de evaluación es parcial: hay archivos de evaluación (`eval_dev_named_n.json` y `eval_dev_named_n.bound.json`) pero sin firma verificable.

## Capacidades

- Generación de texto conversacional en formato multi-turno, heredada del modelo base Qwen3.5-0.8B.
- Especialización probable en procesamiento de recibos y documentos: extracción de campos, normalización de importes, fechas y conceptos.
- Flujos agénticos de un solo paso o pocos pasos, coherentes con la etiqueta "agent" del nombre.
- Capacidad multilingüe: no documentada; depende enteramente del modelo base, cuyos idiomas no se detallan en la información disponible.
- Tool calling / function calling: no documentado explícitamente para este adaptador.
- Modo "thinking", visión o audio: no documentado.
- Razonamiento matemático y código: no evaluado; no hay evidencia que lo respalde más allá de lo que herede del base.

## Casos de uso

- Extracción de campos de recibos: el adaptador puede recibir el texto OCR de un ticket y devolver un JSON estructurado con comercio, fecha, importes, impuestos y líneas de detalle, aprovechando el ajuste específico sobre datos del dominio.
- Clasificación de gastos: asignar categorías contables a cada recibo en un pipeline de gestión de gastos, con el modelo como clasificador generativo de bajo coste.
- Validación de coherencia documental: comprobar que la suma de líneas coincide con el total y señalar discrepancias, tarea para la que un modelo pequeño ajustado puede bastar si se le da el contexto adecuado.
- Asistente conversacional para consultas sobre recibos: responder preguntas del tipo "¿cuánto gasté en transporte en marzo?" sobre un contexto inyectado de documentos, gracias a su naturaleza conversacional.
- Preprocesado en pipelines de contabilidad: normalizar descripciones de comercios y conceptos antes de enviarlos a un sistema ERP, reduciendo la carga de un modelo mayor en la etapa final.
- Despliegue en el borde o en portátil: al tener menos de 0,8B parámetros, puede ejecutarse en local para prototipos de agentes documentales sin depender de API externa, algo coherente con el recibo de entrenamiento en un portátil con GPU Blackwell.
- Generación de resúmenes de lotes de recibos: producir un informe agregado de gastos a partir de varios documentos en una sola llamada, si el contexto del base lo permite.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente MMLU-Pro, GPQA-Diamond, GSM8K, MATH-500, IFEval, BBH, ARC-C, TruthfulQA, SimpleQA y AbstentionBench como **NOT RUN**. Los archivos de evaluación presentes (`eval_dev_named_n.json`) no incluyen resultados numéricos en la información proporcionada y carecen de firma verificable.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,5 GB para los pesos del modelo fusionado (752M parámetros × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: en torno a 0,8-1 GB; en 4 bits, alrededor de 0,4-0,5 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM debería bastar en fp16; RTX 3060, RTX 4060, RTX 4090 y GPUs de portátil con arquitectura Blackwell son opciones razonables.
- Cabe en GPU consumer: sí, con margen amplio, incluso en iGPU con suficiente memoria compartida en cuantización de 4 bits.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador, vLLM o TGI tras fusionar los pesos, llama.cpp u Ollama si se genera un GGUF (no publicado en el repositorio).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Benchmarks publicados | Disponibilidad |
|---|---|---|---|---|---|
| szl-receiptagent-qwen35-0.8b-v3 | 752M | No disponible | Apache 2.0 | No (NOT RUN) | Hugging Face, 349 descargas |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | No disponible en la informacion | Apache 2.0 (heredada) | No disponible en la informacion | Hugging Face |
| Otros adaptadores PEFT sobre modelos <1B | Variable | Variable | Segun base | Habitualmente no publicados | Hugging Face |

No se dispone de datos de benchmarks ni de modelos comparables directos en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de benchmarks estándar: no hay evidencia pública de rendimiento en MMLU, GSM8K, IFEval ni tareas de extracción documental.
- Evaluación no firmada: los recibos de evaluación carecen de firma verificable (SIGNED: GAP) y el conjunto de validación retenido es desconocido (HELD-OUT: UNKNOWN).
- Riesgo de alucinación en extracción de campos: un modelo de 0,8B puede inventar importes o fechas si el OCR es ruidoso; se recomienda validación determinista posterior.
- Idiomas no documentados: no se especifica qué idiomas cubre el ajuste; el uso en castellano no está garantizado.
- Contexto no documentado: se desconoce la ventana máxima efectiva, lo que limita el diseño de pipelines con lotes grandes de documentos.
- Especialización estrecha: el ajuste sobre recibos puede degradar el rendimiento general respecto al modelo base en tareas ajenas al dominio.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación recae en el integrador.
- Sin código fuente ni repositorio GitHub declarado (GITHUB: UNKNOWN), lo que dificulta la reproducibilidad del entrenamiento.
- El nombre en quechua ("Chimpu") es solo de visualización y no implica un modelo o linaje distinto.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v3)
- [Modelo base Qwen/Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B)
- [Recibo de evaluación `eval_dev_named_n.json`](https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v3/blob/73115c1d2fcb12750b2b45762e74bb42572aadfc/eval_dev_named_n.json)
- [Recibo de evaluación `eval_dev_named_n.bound.json`](https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v3/blob/73115c1d2fcb12750b2b45762e74bb42572aadfc/eval_dev_named_n.bound.json)
- [Recibo de fusión `merge_receipt.json`](https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v3/blob/73115c1d2fcb12750b2b45762e74bb42572aadfc/merge_receipt.json)
- [Recibo de entrenamiento `training_receipt.laptop-blackwell.json`](https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v3/blob/73115c1d2fcb12750b2b45762e74bb42572aadfc/training_receipt.laptop-blackwell.json)
- Paper, blog y repositorio GitHub: no disponibles en la información proporcionada.
