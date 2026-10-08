# xbill9/gemma-4-E4B-it-qat-q4_0-w4a16-ct-text-ple4

## Resumen

Este repositorio contiene una version no oficial del modelo Gemma 4 E4B-it de Google DeepMind, reempaquetada en formato de cuantizacion W4A16 (compressed-tensors) y adaptada para su servicio en vLLM. Es un build independiente publicado por el usuario xbill9, que parte del checkpoint oficial `google/gemma-4-E4B-it-qat-q4_0-unquantized` y modifica unicamente el almacenamiento de los pesos, no su entrenamiento. El modelo es text-only y de tipo conversacional (sufijo "it" de instruction-tuned).

El cambio tecnico principal respecto al reempaquetado hermano (`w4a16-ct-text`) es que la tabla de embeddings por capa (`embed_tokens_per_layer`, una caracteristica de Gemma 4) se empaqueta tambien en int4, mientras que `embed_tokens` y `lm_head` permanecen en bf16 y atados (tied). Con ello, la tabla de embeddings por capa pasa de 5,250 GiB en bf16 a 1,477 GiB mas escalas fp16, lo que reduce el checkpoint final a 4,81 GiB y el tamano del repositorio a 5,2 GB.

El modelo cuenta con 7.463.013.418 parametros totales (unos 7,46 mil millones) y licencia Apache 2.0, segun la propia licencia de Gemma 4. Es relevante ahora porque demuestra una tecnica de compresion adicional sobre modelos ya cuantizados con QAT, pensada para reducir memoria de despliegue en vLLM 0.29 o superior. El autor advierte que el build esta verificado en local pero todavia no se ha servido ni evaluado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (pipeline declarado `gemma4_text`; el modelo base incorpora embeddings por capa) |
| Parametros totales | 7.463.013.418 (unos 7,46 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 con int4 (compressed-tensors), escalas fp16, group size 32; `embed_tokens` y `lm_head` en bf16 (tied) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (enlaza a la Gemma 4 license) |
| Formato de pesos | safetensors (compressed-tensors), para vLLM |

## Arquitectura y entrenamiento

No se detallan en la informacion disponible los datos de entrenamiento (numero de tokens, composicion del dataset, fases de RLHF o DPO). El modelo base es el checkpoint oficial `google/gemma-4-E4B-it-qat-q4_0-unquantized`, entrenado por Google DeepMind con cuantizacion consciente del entrenamiento (QAT), lo que situa los pesos originales ya sobre una rejilla de 4 bits. Este repositorio no reentrena el modelo: redistribuye los pesos de Google en un formato de almacenamiento distinto.

La innovacion tecnica de este build es el empaquetado de la tabla `embed_tokens_per_layer` (caracteristica de embeddings por capa de Gemma 4, reflejada en el sufijo `ple4` del nombre). El autor indica que QAT ya habia colocado esta tabla en la misma rejilla de 4 bits que las capas lineales (grupo 32), de modo que el reempaquetado recupera esa rejilla sin degradarla; un grupo fuera de rejilla abortaria el build. La tabla pasa de 5,250 GiB en bf16 a 1,477 GiB mas escalas fp16, con 0 grupos fuera de rejilla, un 74,78% de valores identicos bit a bit y un error maximo de 6,62e-03 respecto al maximo del grupo (escalas entre 0,00155 y 0,938). Las capas lineales no se modifican respecto al reempaquetado W4A16 original.

## Capacidades

- Generacion de texto y respuesta conversacional, dado su caracter instruction-tuned (`-it`) y el tag `conversational`.
- Modelo text-only: no procesa imagen, audio ni otras modalidades.
- Servicio optimizado en vLLM 0.29 o superior, gracias al formato compressed-tensors W4A16.
- Reduccion de huella de memoria frente al checkpoint base mediante el empaquetado int4 de la tabla de embeddings por capa.
- No se dispone de informacion sobre soporte de tool calling, function calling, agentes, multi-step reasoning, modo de razonamiento explicito ni capacidades multilingues concretas para este build. No confirmadas en la informacion proporcionada.

## Casos de uso

- Servicio conversacional autoalojado: el modelo puede desplegarse en vLLM 0.29+ como endpoint de chat en formato compressed-tensors, reduciendo el uso de memoria respecto a variantes en bf16.
- Prototipado en GPU de consumo: con un checkpoint de 4,81 GiB, encaja en tarjetas de gama media con VRAM suficiente, permitiendo probar un modelo de 7,46 mil millones de parametros sin hardware de datacenter.
- Generacion de texto por lotes: para tareas de redaccion, reformulacion o resumen en pipelines offline, donde el ahorro de memoria permite mayor concurrencia por GPU.
- Evaluacion comparativa de tecnicas de cuantizacion: al existir variantes hermanas (`w4a16-ct-text` y `w4a16-ct-text-emb4`), sirve para medir el efecto de empaquetar la tabla de embeddings por capa en int4 frente a dejarla en bf16.
- Investigacion en compresion de modelos: util para estudiar la recuperacion de la rejilla QAT en tablas de embeddings y su impacto en la calidad.
- Despliegue en investigación academica con presupuesto de VRAM limitado: la reduccion de 5,250 GiB a 1,477 GiB en la tabla de embeddings por capa facilita servir el modelo en una sola GPU de menor capacidad.
- Base para pruebas de integracion en vLLM: dado que requiere una version concreta (0.29 o superior) y el operador `CompressedTensorsEmbeddingWNA16Int`, sirve para validar ese soporte en entornos de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo aun no se ha servido ni evaluado, y que esta en cola para una bateria de pruebas de servicio en una AMD Instinct MI300X.

## Requisitos de hardware

- Pesos en disco: checkpoint de 4,81 GiB; repositorio de 5,2 GB.
- VRAM estimada para inferencia: al menos unos 5-6 GB solo para pesos; con cache KV y activaciones, se recomienda un margen practico de 8-10 GB o superior segun la longitud de contexto y el numero de peticiones concurrentes.
- GPU de consumo: el modelo cabe en GPUs consumer con 8 GB o mas de VRAM, si bien conviene 12-16 GB para servir con contexto largo o concurrencia elevada. No se especifica un modelo concreto probado.
- GPU recomendadas: no confirmadas en la informacion. El autor menciona como entorno de evaluacion previsto una AMD Instinct MI300X. Para produccion, cualquier GPU soportada por vLLM 0.29+ con VRAM suficiente.
- Opciones de despliegue: vLLM 0.29 o superior (requisito explicito, por el operador `CompressedTensorsEmbeddingWNA16Int`). No se confirma compatibilidad con llama.cpp, Ollama ni TGI, ya que el formato es compressed-tensors especifico de vLLM.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de rendimiento.

## Comparativa con modelos similares

Comparacion dentro de la misma familia de reempaquetados del modelo base `google/gemma-4-E4B-it-qat-q4_0-unquantized`:

| Modelo | Tratamiento de embeddings | Tamano aproximado | Formato | Licencia |
|---|---|---|---|---|
| `xbill9/...w4a16-ct-text-ple4` (este) | `embed_tokens_per_layer` en int4; `embed_tokens`/`lm_head` bf16 y tied | checkpoint 4,81 GiB | compressed-tensors W4A16 | Apache 2.0 |
| `xbill9/...w4a16-ct-text` | tabla por capa sin empaquetar en int4 | mayor que este build | compressed-tensors W4A16 | Apache 2.0 |
| `xbill9/...w4a16-ct-text-emb4` | ademas empaqueta `embed_tokens` y usa `lm_head` sin atar | mayor que este build | compressed-tensors W4A16 | Apache 2.0 |
| `google/gemma-4-E4B-it-qat-q4_0-unquantized` | pesos base sin reempaquetar | no disponible | safetensors | Apache 2.0 |

No se dispone de datos para comparar con alternativas de otros desarrolladores ni con cifras de rendimiento (benchmarks) de ninguna de las variantes.

## Limitaciones y advertencias

- Modelo text-only: no admite entradas de imagen, audio ni video.
- Build no oficial, realizado y publicado de forma independiente a Google; los problemas deben reportarse al autor del repositorio, no a Google.
- No se ha servido ni evaluado todavia, por lo que no existen garantias de calidad ni datos de rendimiento en produccion.
- Dependencia estricta de vLLM 0.29 o superior (`CompressedTensorsEmbeddingWNA16Int`); no funciona con versiones anteriores ni, segun la informacion, con otros motores.
- Error de cuantizacion en la tabla empaquetada: un 74,78% de valores identicos bit a bit y un error maximo de 6,62e-03 respecto al maximo del grupo, por lo que existe una perdida de precision no nula.
- Riesgo de sesgos y de alucinacion: no hay informacion especifica en este repositorio; hereda las caracteristicas del modelo base de Google, no documentadas aqui.
- Idiomas soportados no especificados en la informacion disponible.
- Restricciones de licencia: se redistribuye bajo Apache 2.0 conforme a la licencia de Gemma 4, pero el uso comercial y las condiciones concretas deben verificarse en la Gemma 4 license enlazada por el autor.
- El autor advierte que un grupo de cuantizacion fuera de rejilla detendria el build; cambios en el checkpoint base podrian romper la compatibilidad del reempaquetado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/xbill9/gemma-4-E4B-it-qat-q4_0-w4a16-ct-text-ple4
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-unquantized
- Variante W4A16 text-only: https://huggingface.co/xbill9/gemma-4-E4B-it-qat-q4_0-w4a16-ct-text
- Variante con `embed_tokens` y `lm_head` sin atar: https://huggingface.co/xbill9/gemma-4-E4B-it-qat-q4_0-w4a16-ct-text-emb4
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Model card original de Google, conservada en el repositorio como `ORIGINAL_README.md`.
- Scripts incluidos en el repositorio: `embed_int4.py` y `repack_q4_0.py`.
