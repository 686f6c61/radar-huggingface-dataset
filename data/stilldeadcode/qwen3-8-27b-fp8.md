# StillDeadcode/qwen3.8-27b-fp8

## Resumen

StillDeadcode/qwen3.8-27b-fp8 es un contenedor de pesos publicado en HuggingFace que empaqueta el checkpoint multimodal Qwen/Qwen3.8-27B-FP8 junto con el drafter de decodificacion especulativa z-lab/Qwen3.8-27B-DFlash2 en un unico fichero `.rad` (29,43 GiB) para el motor de inferencia radiance sobre AMD ROCm y arquitectura RDNA4. No se trata por tanto de un modelo entrenado desde cero, sino de una redistribucion optimizada para una pila de hardware concreta: GPU AMD Radeon AI PRO R9700 con gfx1201. El autor del repositorio es StillDeadcode; los pesos originales proceden de Qwen y el especulador de z-lab.

El interes practico del paquete es doble. Por un lado, ofrece un modelo de 27B con torre de vision en FP8 (E4M3 con escala por bloque de 128x128) y una ventana de contexto declarada de 262.144 tokens en entrenamiento y 200.000 probados. Por otro, integra la decodificacion especulativa DFlash2 basada en difusion por bloques, con su cabeza de vocabulario cuantizada a 2 bits, para reducir la latencia de generacion sin cambiar el resultado del modelo principal.

Es relevante ahora porque cubre un nicho poco atendido: despliegue multimodal de contexto largo en hardware AMD de consumo profesional, con servidor compatible con la API de OpenAI (chat completions, tool calls, structured output, entradas de imagen y video). El contenedor se construyo y probo sobre 2 unidades Radeon AI PRO R9700 con tensor parallelism 2, y la licencia declarada del repositorio es Apache 2.0. Con 0 descargas y 0 likes en el momento de la consulta, se trata de una publicacion reciente y sin validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la informacion disponible; transformer multimodal segun el pipeline `image-text-to-text` (decodificador de lenguaje mas torre de vision de 27 bloques en bf16) |
| Parametros totales | 27B (nominal, segun el nombre del modelo; el autor no publica el desglose) |
| Parametros activos | No aplica: no se indica que sea un modelo MoE |
| Longitud de contexto | 262.144 tokens entrenados; 200.000 tokens probados (el ejemplo de servicio usa `--max-model-len 200000`) |
| Tipos de cuantizacion | Pesos en FP8 E4M3 con una escala por bloque de 128x128; drafter DFlash2 tambien en FP8 por bloque de 128x128, con cabeza de vocabulario a 2 bits; torre de vision en bf16; KV cache en fp8 |
| Idiomas soportados | No disponible (la model card no los enumera) |
| Licencia | Apache 2.0 (declarada para el repositorio) |
| Formato de pesos | Contenedor `.rad` para el motor radiance (fichero `qwen3.8-27b-fp8.rad`, 29,43 GiB); no se ofrecen GGUF ni safetensors en este repositorio |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.8-27B-FP8, un checkpoint multimodal de 27B que el autor redistribuye "tal y como se publica", es decir, sin recuantizar: los pesos mantienen el esquema FP8 E4M3 con escala por bloque de 128x128. A ese checkpoint se le anade la torre de vision (27 bloques, en bf16) que habilita la entrada de imagenes y video en las peticiones de chat, y se le fusiona el especulador z-lab/Qwen3.8-27B-DFlash2, un drafter de difusion por bloques ("block-diffusion") que genera candidatos que el modelo principal verifica. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

La innovacion tecnica destacable del paquete es precisamente la integracion del drafter especulativo dentro del mismo contenedor: el motor radiance elige automaticamente la profundidad de especulacion, y el parametro `--num-speculative-tokens N` la fija manualmente (con `0` se desactiva). El servidor resultante habla la API de OpenAI (`/v1/chat/completions`, `/v1/completions`), admite tool calls, salida estructurada y partes de tipo `image_url` y video en los mensajes. No se documentan innovaciones de atencion (lineal, SSM, hibrida) ni detalles de la arquitectura interna mas alla de lo anterior.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno con ventanas de hasta 200.000 tokens probados.
- Entrada multimodal de imagenes y video mediante la torre de vision de 27 bloques en bf16, integrada en las peticiones de chat (`image_url` y partes de video).
- Tool calling / function calling a traves de la API compatible con OpenAI.
- Salida estructurada (structured output), util para extraccion de campos y respuestas en JSON validable.
- Decodificacion especulativa con el drafter DFlash2 para reducir latencia, con profundidad automatica o configurable.
- Compatibilidad con tensor parallelism (`--tp 2` en el ejemplo del autor) y KV cache en fp8.
- Capacidades multilingues: no disponible (no se enumeran idiomas en la informacion proporcionada).
- Modo de razonamiento explicito ("thinking"): no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Procesamiento documental multimodal en local: ingesta de PDF escaneados, capturas o fotos de formularios junto a texto, con la torre de vision resolviendo el contenido grafico y las 200.000 tokens de contexto permitiendo analizar expedientes completos sin trocear. Adecuado en entornos con requisitos de soberania de datos que no pueden enviar documentos a APIs externas.
- Analisis de video con descripcion y resumen: el servidor acepta partes de video en los mensajes, por lo que se pueden construir pipelines de resumen de grabaciones, deteccion de eventos descritos en lenguaje natural o generacion de informes a partir de clips.
- Atencion al cliente automatizada con herramientas: conversaciones multi-turno con contexto largo, donde el modelo consulta sistemas internos via tool calling (estado de pedido, disponibilidad, facturacion) y devuelve respuestas en formato estructurado para su registro.
- Extraccion estructurada de informacion: uso intensivo de structured output para convertir correos, contratos o tickets en registros JSON consistentes, con validacion posterior en el pipeline de datos.
- Agente de codigo y automatizacion multi-paso: integracion en pipelines de CI/CD o asistentes de terminal mediante la API de OpenAI, apoyandose en tool calling para ejecutar comandos y leer ficheros. La decodificacion especulativa reduce la latencia percibida en bucles interactivos.
- Despliegue sobre hardware AMD on-premise: escenario para organizaciones con parque RDNA4 (Radeon AI PRO R9700) que quieren evitar dependencia de CUDA. El contenedor `.rad` esta construido y probado especificamente para ese hardware.
- RAG sobre corpus extensos: indexado y respuesta sobre bases documentales grandes apoyandose en la ventana de 200.000 tokens para concatenar muchos fragmentos recuperados en una sola pasada.
- Traduccion y reescritura asistida por vision: transcripcion y traduccion de material con texto incrustado en imagenes (carteles, capturas, digitalizaciones) sin necesidad de un OCR separado en el pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas de MMLU, HumanEval, GSM8K, MMMU ni ninguna otra evaluacion, y tampoco se han encontrado fuentes externas con mediciones (la busqueda web no devolvio resultados relevantes sobre este modelo). Tampoco se publican cifras de latencia o throughput mas alla de la indicacion cualitativa de que el drafter DFlash2 se usa para decodificacion especulativa.

## Requisitos de hardware

- VRAM estimada: el contenedor de pesos ocupa 29,43 GiB en disco (repositorio de 31,6 GB), a lo que hay que sumar la KV cache en fp8 y los buffers de activaciones. Con 200.000 tokens de contexto y `--max-num-seqs 8` la KV cache puede ser muy voluminosa; no se publican mediciones.
- GPU probadas por el autor: 2x Radeon AI PRO R9700 (gfx1201, RDNA4) con `--tp 2`. Es la unica configuracion validada que aparece en la model card.
- Cabe en GPU consumer: no cabe en una unica GPU de 24 GB (RTX 4090/5090) segun el tamano del checkpoint FP8 (29,43 GiB); seria necesario repartir en dos GPU o usar una tarjeta de 48 GB o mas. No hay confirmacion del autor de funcionamiento en GPU NVIDIA.
- Motor de despliegue: exclusivamente radiance (ROCm/AMD RDNA4) para el formato `.rad`. No se documenta soporte en vLLM, llama.cpp, Ollama, TGI ni otros runners.
- Comando de servicio de referencia: `radiance --model qwen3.8-27b-fp8.rad --tp 2 --max-model-len 200000 --kv-cache-dtype fp8 --max-num-seqs 8 --host 0.0.0.0 --port 8000`.
- Latencia y throughput: no disponible. Unicamente se indica que la profundidad de especulacion se ajusta de forma automatica o con `--num-speculative-tokens N`, lo que sugiere un mecanismo de optimizacion de latencia, pero sin cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de terceros para establecer una comparativa con modelos equivalentes. La comparacion posible se limita a las piezas que componen este paquete:

| Modelo | Parametros | Contexto | Formato | Motor | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| StillDeadcode/qwen3.8-27b-fp8 | 27B (nominal) | 262.144 entrenados / 200K probados | `.rad` (FP8 E4M3, bloque 128x128) | radiance (ROCm, RDNA4) | Apache 2.0 (repo) | 0 descargas, 0 likes, sin benchmarks |
| Qwen/Qwen3.8-27B-FP8 | 27B (nominal) | No disponible | Checkpoint FP8 publicado | No especificado | No disponible | Modelo base upstream |
| z-lab/Qwen3.8-27B-DFlash2 | Drafter adicional | No disponible | FP8 por bloque 128x128, cabeza de vocabulario a 2 bits | No especificado | No disponible | Modelo base del especulador |

Alternativas de la misma categoria (modelos multimodales de ~27B con licencia permisiva y despliegue en GPU de 24-48 GB): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Publicacion sin adopcion: 0 descargas y 0 likes en el momento de la consulta, creada el 2026-10-03. No hay validacion independiente ni informes de terceros.
- Dependencia total del motor radiance: los pesos no estan en safetensors ni GGUF, por lo que no se pueden cargar con vLLM, llama.cpp, Ollama o TGI. Migrar a otro stack exigiria volver a los checkpoints upstream.
- Hardware muy restringido: solo se ha construido y probado sobre 2x Radeon AI PRO R9700 (gfx1201). No hay evidencia de funcionamiento en RDNA3, CDNA o GPU NVIDIA.
- Contexto declarado frente a probado: 262.144 tokens entrenados pero solo 200.000 probados; el ejemplo de servicio limita explicitamente `--max-model-len 200000`. Superar ese valor es terreno no verificado.
- Cuantizacion FP8: la perdida de calidad frente a bf16 no se documenta ni se cuantifica con evaluaciones.
- Decodificacion especulativa: el drafter DFlash2 aporta speedup, pero mal configurado puede degradar el throughput; el autor advierte que la profundidad se fija con `--num-speculative-tokens` y que `0` la desactiva.
- Riesgo de alucinacion: es un riesgo general de los modelos de lenguaje de esta familia; la model card no aporta evaluaciones de fidelidad, veracidad ni tasas de hallucination.
- Sesgos: no se publica informacion sobre sesgos, composicion del dataset de entrenamiento ni auditorias.
- Idiomas soportados: no se declaran, por lo que no se puede garantizar el rendimiento en castellano ni en otros idiomas distintos del ingles sin pruebas propias.
- Licencia: el repositorio declara Apache 2.0, pero conviene verificar los terminos de los modelos base (Qwen/Qwen3.8-27B-FP8 y z-lab/Qwen3.8-27B-DFlash2) antes de un uso comercial, ya que la informacion proporcionada no incluye sus licencias.
- Uso en produccion: sin benchmarks, sin pruebas de carga y sin cifras de latencia, no hay base para dimensionar un despliegue en produccion mas alla de replicar la configuracion del autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/StillDeadcode/qwen3.8-27b-fp8
- Modelo base (pesos principales): https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Modelo base del drafter especulativo: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo ni sobre el motor radiance; los unicos enlaces verificables son los anteriores.
