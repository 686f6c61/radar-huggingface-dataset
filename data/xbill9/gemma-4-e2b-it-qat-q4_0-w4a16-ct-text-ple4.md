# xbill9/gemma-4-E2B-it-qat-q4_0-w4a16-ct-text-ple4

## Resumen

Este repositorio contiene una reempaquetado no oficial del modelo Gemma 4 E2B-it cuantizado con QAT (quantization-aware training) por Google, convertido a un formato W4A16 compatible con vLLM mediante la libreria compressed-tensors. El autor, el usuario xbill9, parte del checkpoint google/gemma-4-E2B-it-qat-q4_0-unquantized y aplica una variante concreta: la tabla de embeddings por capa (embed_tokens_per_layer) se empaqueta tambien en int4, mientras que embed_tokens y lm_head permanecen en bf16 y atados (tied). El objetivo declarado es aislar el efecto de la tabla por capa frente al de lm_head, comparandolo con la build -emb4 del mismo autor.

El modelo tiene 4.628.569.379 parametros totales segun los pesos en safetensors, y el checkpoint resultante ocupa 2,96 GiB (repo de 3,2 GB). Es un modelo exclusivamente de texto: se elimina cualquier capacidad de vision que pudiera tener el modelo base. La nomenclatura E2B de la familia Gemma apunta a un diseno con aproximadamente 2.000 millones de parametros efectivos, aunque la informacion disponible no detalla la configuracion de parametros activos ni si se trata de una arquitectura MoE o de embeddings por capa.

Su relevancia es practica: permite ejecutar un modelo de la familia Gemma 4 en GPUs de gama media o en instancias cloud economicas (la propia ruta del script de reempaquetado hace referencia a T4), con un peso en disco de menos de 3 GiB y sin salir del ecosistema vLLM. El coste es que se trata de un artefacto no oficial, sin benchmarks publicados por el autor y sujeto a los terminos de licencia Gemma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma 4 (variante E2B con tabla de embeddings por capa, `embed_tokens_per_layer`); configuracion detallada no disponible |
| Parametros totales | 4.628.569.379 (4,63 B) segun safetensors |
| Parametros activos | no disponible (la nomenclatura E2B sugiere ~2 B efectivos, sin confirmacion en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16: pesos int4, activaciones de 16 bits, grupo de cuantizacion 32; tabla `embed_tokens_per_layer` en int4 con escalas fp16; `embed_tokens` y `lm_head` en bf16 y atados |
| Idiomas soportados | no disponible |
| Licencia | Gemma (terminos de uso de Gemma) |
| Formato de pesos | safetensors en formato compressed-tensors, compatible con vLLM 0.29 o superior |

## Arquitectura y entrenamiento

El checkpoint base es un modelo Gemma 4 E2B instruction-tuned que Google ya publico con QAT (quantization-aware training), es decir, entrenado teniendo en cuenta la cuantizacion posterior para reducir la degradacion de calidad. La peculiaridad de esta variante E2B es la existencia de una tabla de embeddings por capa (`embed_tokens_per_layer`), ademas de la tabla de embeddings de tokens habitual. Sobre ese base, este repositorio aplica un reempaquetado a compressed-tensors con esquema W4A16, apoyandose en que el QAT ya habia situado las tablas de embeddings en la misma rejilla de 4 bits que las capas lineales (grupo 32); un grupo fuera de rejilla abortaria la construccion, segun el autor.

El resultado del empaquetado de la tabla por capa es una reduccion de 4,375 GiB en bf16 a 1,230 GiB en int4 mas escalas fp16, con un 74,26 % de valores identicos bit a bit respecto al original y un error maximo de 6,58e-03 respecto al maximo del grupo; el rango de escalas va de 0,00301 a 0,91. Las capas lineales no se modifican respecto al reempaquetado W4A16 de referencia. No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF/DPO del modelo original dentro de la informacion proporcionada; el script de conversion es `embed_int4.py`, del repositorio gemma4-dev del propio autor.

## Capacidades

- Generacion de texto y respuesta a instrucciones: hereda el ajuste instruction-tuned del checkpoint base (`-it`), orientado a dialogos y tareas de texto.
- Razonamiento y conocimiento general: presumiblemente equivalente al modelo Gemma 4 E2B-it original, aunque no hay evaluaciones publicadas de esta variante reempaquetada.
- Codigo y matematicas: no hay datos especificos disponibles en la informacion proporcionada.
- Tool calling y function calling: no disponible (no confirmado en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el autor no documenta la cobertura de idiomas de este reempaquetado.
- Capacidad especial: modo thinking explicito, no disponible.
- Vision: explicitamente ausente; la model card indica "Text only".
- Eficiencia de despliegue: pesos int4 con grupo 32 y compatibilidad nativa con vLLM 0.29+ mediante `CompressedTensorsEmbeddingWNA16Int`.

## Casos de uso

- Asistentes conversacionales de bajo coste en GPU modesta: con un checkpoint de 2,96 GiB y cuantizacion W4A16, el modelo cabe en GPUs de 8-16 GB, lo que permite desplegar un chatbot de texto en una T4 o una RTX 3060 sin recurrir a instancias de gama alta.
- Clasificacion y extraccion de informacion sobre texto: resumen, etiquetado de tickets, extraccion de entidades o normalizacion de documentos, tareas donde un modelo de ~4,6 B parametros con cuantizacion int4 ofrece un buen equilibrio entre coste por token y calidad.
- Procesamiento por lotes de bajo presupuesto: al ser compatible con vLLM, se puede servir con batching continuo para procesar grandes volumenes de texto (informes, resenas, correos) en un unico nodo con GPU de gama media.
- Prototipado e investigacion sobre cuantizacion: sirve como material de estudio para medir el impacto real de empaquetar la tabla `embed_tokens_per_layer` en int4, comparandolo con la build `-emb4` del mismo autor en igualdad de condiciones.
- Entornos con almacenamiento o ancho de banda limitados: un repo de 3,2 GB facilita el despliegue en edge servers, contenedores con imagenes pequenas o transferencias frecuentes entre regiones.
- Pipelines internos de generacion de texto donde la licencia Gemma es aceptable: redaccion asistida, reformulacion, generacion de borradores o resumenes para uso interno, sin requisitos de vision.
- Evaluacion comparativa de formatos de cuantizacion: banco de pruebas para confrontar W4A16 con GGUF Q4_0 u otras alternativas dentro del mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye tablas comparativas (MMLU, HumanEval, GSM8K ni similares), y las busquedas web no aportan metricas de calidad para este reempaquetado concreto. El unico dato cuantitativo publicado es el error de reconstruccion del empaquetado int4 de la tabla de embeddings por capa:

| Metrica del empaquetado | Valor |
|---|---|
| `embed_tokens_per_layer` en bf16 | 4,375 GiB |
| `embed_tokens_per_layer` en int4 | 1,230 GiB + escalas fp16 |
| Grupos fuera de rejilla | 0 |
| Valores identicos bit a bit | 74,26 % |
| Error maximo | 6,58e-03 respecto al maximo del grupo |
| Rango de escalas | 0,00301 a 0,91 |
| Tamano del checkpoint | 2,96 GiB |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3-4 GB solo para pesos (2,96 GiB de checkpoint); con cache KV y overhead de runtime, un presupuesto realista de 4-6 GB para contextos cortos. Estimacion propia, no publicada por el autor.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM. La ruta del script de reempaquetado (`gpu-vllm-t4-2b-w4a16`) sugiere que el objetivo de desarrollo fue la NVIDIA T4 de 16 GB, habitual en instancias cloud economicas.
- Cabe en GPU de consumo: si. RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, e incluso tarjetas de 8 GB si se limita la longitud de contexto y el tamano de lote.
- Opciones de despliegue: vLLM 0.29 o superior es requisito explicito, porque el kernel `CompressedTensorsEmbeddingWNA16Int` se necesita para leer la tabla de embeddings por capa en int4. No hay informacion disponible sobre soporte en llama.cpp, Ollama o TGI para este formato compressed-tensors concreto.
- Latencia y throughput estimados: no disponible. El autor no publica mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| xbill9/gemma-4-E2B-it-qat-q4_0-w4a16-ct-text-ple4 (este) | 4,63 B | no disponible | safetensors compressed-tensors, W4A16 con embeddings por capa int4 | Gemma | Solo texto; no oficial; pesos `embed_tokens` y `lm_head` en bf16 atados |
| xbill9/gemma-4-E2B-it-qat-q4_0-w4a16-ct-text | no disponible | no disponible | safetensors compressed-tensors, W4A16 | Gemma | Solo texto; mismo autor; sirve de referencia para aislar el efecto del empaquetado int4 de la tabla por capa |
| google/gemma-4-E2B-it-qat-w4a16-ct | no disponible | no disponible | safetensors compressed-tensors, W4A16 | Gemma | Checkpoint oficial de Google; la familia incluye implementaciones de vision-lenguaje |
| xbill9/gemma-4-26B-A4B-it-qat-q4_0-w4a16-ct | no disponible | no disponible | safetensors compressed-tensors, W4A16 | Gemma | Mismo autor, escala superior (26B-A4B); Google no publica QAT W4A16 para ese tamano, solo GGUF Q4_0 y un export bf16 de 48 GiB |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo no oficial: el autor indica explicitamente que los problemas deben reportarse en el repositorio de HuggingFace y no a Google.
- Solo texto: no procesa imagenes ni audio, a diferencia de otras implementaciones de la familia Gemma 4 que son vision-lenguaje.
- Dependencia estricta de vLLM 0.29 o superior; con versiones anteriores el kernel necesario para leer los embeddings int4 no esta disponible y la carga fallara.
- Sin benchmarks publicados: no hay evidencia cuantitativa de la degradacion de calidad introducida por el empaquetado int4 adicional de `embed_tokens_per_layer` frente al reempaquetado W4A16 de referencia.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano; no hay evaluaciones de fidelidad publicadas para este checkpoint.
- Sesgos: no documentados en la informacion disponible; se heredan del modelo base Gemma 4 E2B-it y de sus datos de entrenamiento.
- Idiomas: cobertura no documentada en la model card; no se debe asumir soporte multilingue sin verificacion previa.
- Longitud de contexto: no disponible, lo que impide planificar despliegues con requisitos de ventana larga sin medirlo empiricamente.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de uso de Gemma de Google, que imponen obligaciones de atribucion y restricciones de uso aceptable; conviene revisarlos antes de integrarlo en un producto.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion comunitaria ni trazabilidad de incidencias mas alla del propio autor.
- Discrepancia documental: una fuente externa (LLM Explorer) lista este modelo con licencia apache-2.0 y 5,6 B de parametros, lo que contradice la model card y los pesos en safetensors; se debe tomar como referencia la licencia Gemma declarada en el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xbill9/gemma-4-E2B-it-qat-q4_0-w4a16-ct-text-ple4
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
- Variante de referencia del mismo autor (text-only W4A16): https://huggingface.co/xbill9/gemma-4-E2B-it-qat-q4_0-w4a16-ct-text
- Script de reempaquetado `embed_int4.py`: https://github.com/xbill9/gemma4-dev/blob/main/gpu-vllm-t4-2b-w4a16/repack/embed_int4.py
- Checkpoint oficial W4A16 de Google: https://huggingface.co/google/gemma-4-E2B-it-qat-w4a16-ct
- Variante 26B-A4B del mismo autor: https://huggingface.co/xbill9/gemma-4-26B-A4B-it-qat-q4_0-w4a16-ct
- Pagina oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Ficha en LLM Explorer: https://llm-explorer.com/model/google%2Fgemma-4-E2B-it-qat-w4a16-ct,7bKDGPwJkFa9irvbfsNS3A
- Ficha en ThinkLLM: https://thinkllm.dev/models/gemma-4-e2b-it-qat-w4a16-ct
