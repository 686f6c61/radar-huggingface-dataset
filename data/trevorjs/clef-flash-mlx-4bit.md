# TrevorJS/clef-flash-mlx-4bit

## Resumen

clef-flash-mlx-4bit es una conversion no oficial a MLX del modelo Cloudflare/clef-flash, publicada por el usuario TrevorJS, pensada para ejecucion en Apple Silicon. No es un modelo generativo de texto: Clef-Flash es un modelo de decision que, dado un estado (texto o JSON) y un esquema de preguntas tipadas (`choice`, `score`, `noul`), devuelve una probabilidad para cada opcion permitida de cada pregunta en una sola pasada de prefill, sin decodificacion autorregresiva. Esta version cuantiza el backbone a 4 bits y elimina el codificador de vision, por lo que solo acepta entradas de texto.

El modelo parte del backbone Qwen3.5-9B incluido en Clef-Flash (8.953.803.264 parametros totales segun los safetensors del repositorio) y anade la cabeza de esquema conjunto (joint schema head) de Clef, que se mantiene sin cambios en bf16 y se ejecuta en float32 en el port a MLX. La cuantizacion se realizo con `mlx_lm.convert` en modo afín (affine), 4 bits y group size 64, con `mlx-lm 0.31.3` y `mlx 0.32.3`.

Su relevancia practica es doble: por un lado, permite ejecutar localmente en un Mac un modelo de decision de ~9B con un pico de memoria de 5,9 GB; por otro, ofrece una alternativa determinista y barata (una sola pasada, sin generacion de texto) frente a los LLM generativos en tareas de clasificacion y enrutado estructurado. La licencia Apache-2.0 y el hecho de derivar de Qwen3.5-9B facilitan su uso comercial, aunque se trata de una conversion no respaldada por Cloudflare.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (backbone Qwen3.5-9B) mas cabeza de esquema conjunto (joint schema head) de Clef; modelo de decision, sin decodificacion de texto |
| Parametros totales | 8.953.803.264 (dato real de los safetensors) |
| Parametros activos | No disponible: la informacion proporcionada no indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit affine, group size 64 (MLX). Existe variante 8-bit del mismo autor (TrevorJS/clef-flash-mlx-8bit) |
| Idiomas soportados | No disponible (la model card no especifica idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX); `joint_head.safetensors` en bf16; codigo de port en `clef_mlx.py` |

## Arquitectura y entrenamiento

La arquitectura combina un backbone transformer denso Qwen3.5-9B con la cabeza de esquema conjunto de Clef. En el repositorio, `model*.safetensors` y `config.json` contienen el backbone convertido con `mlx_lm.convert` (affine, 4 bits, group size 64), mientras que `joint_head.safetensors` y `joint_head_config.json` se copian sin modificar desde el release original en bf16. El fichero `clef_mlx.py` es un port a MLX del `joint_schema_model.py` de Cloudflare (Apache-2.0) e implementa la codificacion de registros y la cabeza conjunta; la cabeza se ejecuta en float32. El codificador de vision del modelo original se ha descartado en esta conversion, de modo que el modelo es exclusivamente de texto.

El modelo no genera texto: `decide` recibe un registro con `state` (texto o JSON) y un diccionario de preguntas por identificador y devuelve `{question_id: {option_id: probability}}`, puntuando conjuntamente todas las preguntas del registro en una unica pasada de prefill. Los tipos de pregunta soportados son `choice` (opciones con criterios), `score` (escala ordenada) y `noul` (booleano verdadero/falso). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO: esos datos pertenecen al release original de Cloudflare/clef-flash y no se detallan en la informacion proporcionada.

La verificacion reportada por el autor es la siguiente: la cabeza `clef_mlx.JointSchemaHead` coincide con la `JointSchemaHead` de PyTorch del release original dentro de 4e-6 en los logits sobre entradas identicas; `clef_mlx.encode_record` produce los mismos token IDs, spans e IDs de opcion que el `encode_record` original en 11 de 11 registros muestreados. No se ejecuto una referencia bf16 extremo a extremo, por lo que la unica fuente de deriva es la cuantizacion.

## Capacidades

- Decision estructurada: devuelve distribuciones de probabilidad sobre todas las opciones de todas las preguntas de un registro en una sola pasada de prefill, sin generar texto.
- Preguntas tipadas: soporta `choice` (seleccion entre opciones con criterios de texto), `score` (puntuacion en escala ordenada) y `noul` (binaria verdadero/falso).
- Puntuacion conjunta: todas las preguntas de un registro se puntuan de forma conjunta, de modo que las respuestas son coherentes entre si.
- Clasificacion de texto: `pipeline_tag` declarado como `text-classification`; utilizable para etiquetado y enrutado con umbrales de probabilidad.
- Salida estructurada: el resultado es un diccionario `{question_id: {option_id: probabilidad}}`, directamente consumible por codigo sin parseo de lenguaje natural.
- Entrada en texto o JSON: `state` admite ambas formas segun la firma de `encode_record` / `systemone`.
- Ejecucion local en Apple Silicon: inferencia nativa con MLX, con pico de memoria de 5,9 GB en 4 bits.
- Sin soporte de vision: el codificador de vision se elimino en esta conversion, por lo que no acepta imagenes ni video.
- Sin soporte declarado de tool calling, function calling ni razonamiento multi-paso: no es un modelo generativo ni agentico.
- Capacidades multilingues: no disponibles (no se especifican idiomas en la informacion proporcionada).

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto del ticket como `state` y un esquema con preguntas como `department` (choice), `urgency` (score) y `outage` (noul), y devuelve probabilidades por opcion. El ejemplo de la model card ilustra exactamente este flujo, con `technical: 0.957` y `outage: true: 0.818` para una incidencia de checkout.
- Enrutado de mensajes en agentes: al no generar texto, el coste de la decision es una sola pasada de prefill, lo que permite insertar el modelo como router previo a un LLM generativo mas caro y decidir que herramienta o cola debe atender la peticion.
- Guardrails y filtrado previo a generacion: clasificar entradas con umbrales sobre las probabilidades devueltas antes de invocar un modelo generativo, reduciendo coste y latencia en pipelines de alto volumen.
- Etiquetado de datasets a escala: aplicar el modelo sobre corpus de texto para producir etiquetas con probabilidad asociada, aprovechando la salida estructurada para filtrar por confianza y marcar casos ambiguos para revision humana.
- Extraccion de decisiones con opcion nula: el tipo `noul` permite modelar explicitamente la ausencia de informacion o la no aplicabilidad de una pregunta, util en pipelines de extraccion de datos donde distinguir "falso" de "desconocido" es relevante.
- Evaluacion de riesgo y compliance: usar preguntas de tipo `score` para asignar niveles ordenados (por ejemplo, severidad o prioridad) sobre descripciones de casos, con la probabilidad por nivel como medida de confianza.
- Inferencia local con requisitos de privacidad: al ejecutarse con MLX sobre Apple Silicon y con un pico de 5,9 GB en 4 bits, permite clasificar datos sensibles sin salir del equipo del analista.
- Seleccion de modelo en produccion: comparar la variante 4 bits con la 8 bits sobre el mismo conjunto de evaluacion para decidir el compromiso entre precision, memoria y latencia segun el hardware disponible.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre los items publicos de JevBench (231 items, commit fijado `bb05a335`), evaluados con el codigo de este repositorio en un Apple M2 con 24 GB de memoria unificada:

| Variante | Total | Easy | Standard | Hard | Pico de memoria | Latencia mediana (M2) |
|---|---|---|---|---|---|---|
| 8-bit | 188/231 | 48/48 | 71/72 | 69/111 | 10,1 GB | 4,8 s |
| 4-bit | 182/231 | 48/48 | 68/72 | 66/111 | 5,9 GB | 2,9 s |

Las dos variantes eligen la misma opcion en 216 de 231 items, con una diferencia mediana de 0,011 en la probabilidad maxima por opcion. La latencia corresponde a una unica maquina M2 y refleja ese equipo, no el comportamiento del modelo en un servidor con GPU.

Verificaciones adicionales reportadas: coincidencia de la cabeza con la implementacion PyTorch original dentro de 4e-6 en los logits y coincidencia de `encode_record` en 11 de 11 registros muestreados. No se publican resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de conocimiento general en la informacion disponible, y no se ejecuto una referencia bf16 extremo a extremo.

## Requisitos de hardware

- Inferencia en 4 bits: pico de 5,9 GB de memoria en un Apple M2 de 24 GB (variante de este repositorio).
- Inferencia en 8 bits: pico de 10,1 GB en el mismo equipo (variante TrevorJS/clef-flash-mlx-8bit).
- Tamano del repositorio: 5,3 GB.
- GPU compatibles: no disponible. El modelo esta empaquetado para MLX, que se ejecuta sobre Apple Silicon con memoria unificada; no se proporcionan datos de despliegue en CUDA ni en GPUs de datacenter como A100, H100 o RTX 4090.
- Cabe en equipos de consumo: si, en Macs con Apple Silicon y al menos 16 GB de memoria unificada para la variante 4 bits, segun el pico de 5,9 GB medido en un M2 de 24 GB.
- Opciones de despliegue: MLX mediante `mlx-lm` (la conversion se genero con `mlx-lm 0.31.3` y `mlx 0.32.3`) y descarga del repositorio con `huggingface_hub.snapshot_download`, e importacion del modulo `clef_mlx` incluido. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: latencia mediana de 2,9 s por item en 4 bits y 4,8 s en 8 bits, medida en un Apple M2 de 24 GB. No se proporcionan datos de throughput en lote ni de latencia en otros equipos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TrevorJS/clef-flash-mlx-4bit | 8,95 B (4 bits, 5,3 GB) | No disponible | 182/231 en JevBench publico; 5,9 GB de pico; 2,9 s de latencia mediana en M2 | Apache-2.0 | HuggingFace, libreria MLX |
| TrevorJS/clef-flash-mlx-8bit | Mismo backbone (8 bits) | No disponible | 188/231 en JevBench publico; 10,1 GB de pico; 4,8 s de latencia mediana en M2 | Apache-2.0 | HuggingFace, libreria MLX |
| Cloudflare/clef-flash (original) | Backbone Qwen3.5-9B, sin cuantizar | No disponible | No se publican en la informacion disponible los resultados bf16 de referencia | Apache-2.0 | HuggingFace, modelo multimodal con vision |

No se identifican en la informacion proporcionada otros modelos de decision de esquema tipado directamente comparables. Los resultados de busqueda web mencionan otros modelos cuantizados a formato MLX (Step-3.7-Flash-4bit, DeepSeek-V4-Flash-4bit), pero pertenecen a categorias distintas (LLM generativos y MoE dispersos de gran tamano) y no son alternativas comparables a un modelo de decision de ~9B.

## Limitaciones y advertencias

- Conversion no oficial: el autor indica explicitamente que el modelo no esta hecho ni respaldado por Cloudflare. Para uso en produccion conviene evaluar la version original.
- Solo texto: el codificador de vision no se incluye, por lo que no admite entradas de imagen ni de video, a diferencia del modelo original.
- No genera texto: no sirve para tareas de generacion, resumen, traduccion ni dialogo. Su salida son probabilidades sobre opciones predefinidas.
- Riesgo de deriva por cuantizacion: es la unica fuente de desviacion identificada y no se ejecuto una referencia bf16 extremo a extremo. La caida reportada es de 6 items sobre 231 al pasar de 8 a 4 bits, concentrada en la dificultad Hard (69/111 frente a 66/111).
- Sin datos de idioma: no se especifica que idiomas soporta ni si el comportamiento es homogeneo entre ellos.
- Sin datos de contexto: no se publica la longitud de contexto soportada, lo que dificulta dimensionar entradas largas.
- Rendimiento medido en un unico equipo: la latencia de 2,9 s y 4,8 s corresponde a un Apple M2 de 24 GB y no es extrapolable a otros Macs ni a servidores.
- Dependencia de MLX: el repositorio esta empaquetado para Apple Silicon; no hay rutas de despliegue documentadas para CUDA ni para servidores de inferencia habituales.
- Riesgo de alucinacion: no disponible. Al no generar texto libre, el modo de fallo previsible es una asignacion de probabilidad incorrecta o poco calibrada sobre las opciones, no una invencion de contenido.
- Sesgos conocidos: no disponible. La informacion proporcionada no incluye analisis de sesgos.
- Licencia: Apache-2.0, compatible con uso comercial, heredada de Cloudflare/clef-flash y de Qwen/Qwen3.5-9B. `clef_mlx.py` es un port de codigo Apache-2.0 de Cloudflare. Conviene verificar las condiciones aplicables del modelo base Qwen3.5-9B.
- Madurez del repositorio: creado el 2026-10-01 y actualizado el mismo dia, con 0 descargas y 0 likes en el momento de la consulta. No hay historial de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TrevorJS/clef-flash-mlx-4bit
- Variante 8 bits: https://huggingface.co/TrevorJS/clef-flash-mlx-8bit
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
- Anuncio de Cloudflare sobre los modelos de decision Clef: https://blog.cloudflare.com/clef-decision-models/
- Documentacion de Cloudflare Workers AI para clef-flash: https://developers.cloudflare.com/workers-ai/models/clef-flash/
- Repositorio de MLX: https://github.com/ml-explore/mlx
- Libreria mlx-lm: no disponible como enlace directo en la informacion proporcionada (se instala con `pip install mlx-lm`)
