# woooflet/DeepSeek-V4.1-Flash-1017-UNCENSORED-FLARE

## Resumen

DeepSeek-V4.1-Flash-1017-UNCENSORED-FLARE es un paquete de despliegue listo para servir, empaquetado por woooflet (Ford Morris) a partir del checkpoint `dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8`, que a su vez deriva del modelo base `deepseek-ai/DeepSeek-V4.1-Flash-1017`. No se trata de un modelo nuevo entrenado desde cero, sino de una reempaquetado de pesos en formato Flare para su ejecucion sobre un cluster de 4 nodos DGX Spark (arquitectura GB10 con tensor parallelism TP4 y anillo RoCE). Los pesos son bit-identicos al checkpoint de dealignai; el repositorio solo cambia el empaquetado, pasando de safetensors en crudo a un paquete Flare lanzable con un unico comando.

El modelo subyacente es una variante "abliterated/uncensored" que modifica 108 de los 96.085 tensores del checkpoint original (familias `attn.wo_b` y `ffn.shared_experts.w2`, capas 10-36), dejando intactos los expertos enrutados, la torre de vision, las tablas Engram, el bloque MTP/DSpark y el LM head. La arquitectura del modelo base es un transformer con mezcla de expertos (MoE) y soporte multimodal image-text-to-text, con decodificacion especulativa MTP/DSpark.

Su relevancia es acotada: se publica como paquete de inferencia sin gate, con licencia MIT, orientado a entornos DGX Spark de cuatro nodos. No incluye datos de parametros totales, longitud de contexto ni idiomas en la informacion disponible, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), multimodal image-text-to-text; decodificacion especulativa MTP/DSpark |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (checkpoint base); compresion de escala de expertos CSF; cuantizacion de cabeza Markov en FP8; empaquetado Flare para GB10 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Paquete Flare (exportado desde safetensors); pesos bit-identicos al checkpoint FP8 de origen |
| Modelo base | dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8 |
| Modelo raiz | deepseek-ai/DeepSeek-V4.1-Flash-1017 |
| Topologia de despliegue | TP4 sobre 4x DGX Spark (GB10), anillo RoCE |
| Herramienta de exportacion | Ignition (NVIDIA/spark-local-inference @ 972e28e) |
| Libreria | flare |
| Gate | No (ungated) |

## Arquitectura y entrenamiento

El modelo raiz es un transformer con mezcla de expertos y capacidades multimodales (pipeline image-text-to-text), segun se deduce de los componentes auditados: expertos enrutados, torre de vision, tablas Engram, bloque MTP/DSpark, embeddings, normas y LM head. No se dispone de informacion sobre el numero total de parametros, tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO en la informacion proporcionada.

La innovacion tecnica documentada en este repositorio es el proceso de "uncensoring" (abliteration) y su auditoria. Se realizo un diff tensor a tensor SHA-256 del checkpoint de dealignai contra el modelo stock de DeepSeek: 108 de 96.085 tensores cambiados, todos en las familias `attn.wo_b` y `ffn.shared_experts.w2` (peso y escala), exclusivamente en las capas 10-36 (54 + 54 tensores). Permanecen bit-identicos los 94.464 tensores de expertos enrutados, las tablas Engram, el bloque MTP/DSpark, la torre de vision, los embeddings, las normas y el LM head. La fraccion media de bytes modificados por tensor es 0,285 (mediana 0,172, maximo 0,617), es decir, menos capas pero con cambios mas profundos que la edicion de mrfakename (40 capas frente a 27). El empaquetado incluye el fix de ordenacion complete-copy/MTP (PR #129, merge 2026-11-05) y el PR #158.

## Capacidades

- Generacion de texto y razonamiento en modo chat y modo "think" (thinking on), segun el arnes de evaluacion empleado.
- Procesamiento multimodal image-text-to-text (torre de vision intacta respecto al modelo base).
- Razonamiento matematico (evaluado con GSM8K) y resolucion de preguntas cientificas de nivel avanzado (GPQA Diamond).
- Generacion de codigo (evaluado con HumanEval pass@1).
- Decodificacion especulativa con MTP/DSpark de 5 tokens draft y verificacion adaptativa (alpha 0,75 en serving).
- Muestreo con vocabulario paralelo (`--vocabulary-parallel-sampling`).
- Capacidad de servir con concurrencia maxima de 32 peticiones.
- Comportamiento "uncensored": 0/8 flags de rechazo en una bateria de prompts daninos, tanto en modo chat como en modo think.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue de inferencia a gran escala en cluster DGX Spark: el paquete esta preparado para lanzarse con un unico comando `flare orbit run` sobre 4 nodos GB10 con TP4 y anillo RoCE, lo que simplifica la puesta en marcha de un endpoint OpenAI-compatible en el puerto 8000 sin parchear el runtime.
- Evaluacion comparativa de tecnicas de abliteration: investigadores que estudien el coste de capacidad de las ediciones de pesos pueden usar este paquete junto con el stock y el sibling abliterated para reproducir el arnes de tres vias (MMLU, GPQA, GSM8K, HumanEval, KL sobre Pile).
- Procesamiento de documentos con imagenes: al conservar intacta la torre de vision y el pipeline image-text-to-text, sirve para tareas de extraccion y descripcion de contenido visual en entornos controlados.
- Generacion de codigo en pipelines internos: con HumanEval pass@1 de 0,9451 en este arnes, es adecuado para asistentes de codigo autoalojados donde la latencia C1 de 69,8 tok/s sea aceptable.
- Razonamiento cientifico asistido: GPQA Diamond de 0,7323 en este arnes lo posiciona por encima del stock (0,697) y del sibling (0,702), util para tareas de Q&A tecnico en dominios de ciencia e ingenieria.
- Investigacion sobre seguridad y alineamiento: con 0/8 rechazos en la bateria de prompts daninos, sirve como caso de estudio de los limites de las tecnicas de abliteration y de su impacto en la robustez frente a contenido nocivo (uso exclusivamente en entornos de investigacion controlados).
- Servicio de chat multi-turno autoalojado: con concurrencia 32 y throughput C8 de 195,8 tok/s, puede atender cargas de conversacion en infraestructura propia.

## Benchmarks y rendimiento

Resultados medidos en un unico arnes sobre 4x DGX Spark (TP4, anillo RoCE) el 2026-11-09, con temperatura/top-p fijos de 1,0 y thinking activado. Son indicadores de precision relativa frente al paquete stock servido de forma identica, no benchmarks generales amplios.

| Tarea | Stock Flare (LIL gb10) | Abliterated-FLARE (sibling) | Uncensored-FLARE (este repo) |
|---|---:|---:|---:|
| MMLU (n=1425) | 0,8814 | 0,8849 | 0,8709 |
| GPQA Diamond (n=198) | 0,697 | 0,702 | 0,7323 |
| GSM8K (n=250) | 0,944 | 0,956 | 0,960 |
| HumanEval pass@1 (n=164) | 0,9512 | 0,939 | 0,9451 |
| KL vs stock, muestra de Pile (menor = mas cercano) | 0,100 (suelo de control) | 0,126 | 0,213 |
| Velocidad de serving C1 / C8 (tok/s) | 62,4 / 207,3 | 57,7 / 197,7 | 69,8 / 195,8 |
| Flags de rechazo, chat / think (de 8) | 4 / 5 | 0 / 2 | 0 / 0 |

El coste medido de la edicion es de -1,05 pp en MMLU (0,8709 frente a 0,8814), inferior a la penalizacion de -3,86 pp publicada por dealignai, que no se reproduce en este arnes. Las cifras KL son un metodo de muestreo del lado del serving y deben leerse contra el control stock-vs-stock, no contra cero.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el modelo se sirve distribuido en 4 nodos GB10, no en una unica GPU).
- GPU recomendadas: 4x NVIDIA DGX Spark (GB10) en topologia TP4 con anillo RoCE; el paquete esta validado en el runtime stock `flare-inference` (APT) sin parches.
- Compatibilidad con GPU de consumo: no disponible; no se documenta soporte para RTX 4090 ni similares.
- Opciones de despliegue: Flare (`flare orbit run`) sobre runtime vanilla gb10 TP4; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Throughput medido: 69,8 tok/s a concurrencia 1 y 195,8 tok/s a concurrencia 8.
- Ajustes de serving relevantes: `--max-concurrency 32`, MTP/DSpark 5 draft tokens con verificacion adaptativa (alpha 0,75), prefill chunk 8192, `--embedding-table-storage disk`, cache de 1 GiB y escalas residentes.
- Confianza del publicador: requiere aceptar la clave de firma local `local-development` (fingerprint SHA-256 `ff4d66d66f9099b1cb47a396a6dd0b0e1f9115e221bc33cdf3b28d5b12387ee9`) en el primer lanzamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | GPQA Diamond | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-UNCENSORED-FLARE (este repo) | no disponible | no disponible | 0,8709 | 0,7323 | MIT | HF, ungated, paquete Flare |
| Stock Flare (LIL gb10) | no disponible | no disponible | 0,8814 | 0,697 | no disponible | paquete Flare |
| Abliterated-FLARE (sibling) | no disponible | no disponible | 0,8849 | 0,702 | no disponible | paquete Flare |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | no disponible | no disponible | no disponible | no disponible | no disponible | HF |

Las cifras de MMLU y GPQA corresponden al mismo arnes de tres vias descrito en la seccion de benchmarks. No se dispone de datos de parametros ni de contexto para ninguno de los modelos comparados en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored": 0/8 flags de rechazo en una bateria de prompts daninos; puede generar contenido nocivo y no es apto para exposicion publica sin filtros externos.
- La edicion de pesos afecta a las proyecciones de atencion y a los expertos compartidos en 27 capas; el resto del modelo es bit-identico al stock, por lo que los sesgos del modelo base persisten.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; aplica el comportamiento estandar del modelo base.
- Limitaciones de contexto e idioma: no disponibles.
- La licencia MIT del repositorio no exime de las condiciones del modelo base `deepseek-ai/DeepSeek-V4.1-Flash-1017`; verificar la licencia del modelo raiz antes de uso comercial.
- Los benchmarks proceden de un unico arnes, una unica flota y una unica fecha (2026-11-09); no son cifras generales y no deben extrapolarse a otros stacks.
- El paquete esta firmado con una clave de desarrollo local (`local-development`), no con una clave de cuenta de Hugging Face; requiere aceptacion explicita de confianza en el primer lanzamiento.
- El despliegue exige hardware especifico (4x DGX Spark GB10, RoCE) y el runtime Flare; no hay soporte documentado para stacks alternativos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/woooflet/DeepSeek-V4.1-Flash-1017-UNCENSORED-FLARE
- Checkpoint base (dealignai): https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8
- Modelo raiz (DeepSeek): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Repositorio de la herramienta de exportacion: NVIDIA/spark-local-inference (commit `972e28e44781d8d0c84d70ae434db92c36076a43`; PR #129 y PR #158)
