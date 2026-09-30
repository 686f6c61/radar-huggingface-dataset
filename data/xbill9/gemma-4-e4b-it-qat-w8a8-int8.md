# xbill9/gemma-4-E4B-it-qat-w8a8-int8

## Resumen

`xbill9/gemma-4-E4B-it-qat-w8a8-int8` es una conversion no oficial a int8 del checkpoint QAT de Google `google/gemma-4-E4B-it-qat-q4_0-unquantized`, perteneciente a la familia Gemma 4 en su variante E4B instruction-tuned. El artefacto lo publica el desarrollador independiente xbill9 y no esta respaldado por Google. Se trata de un modelo de solo texto: las torres de vision y audio del modelo original se han eliminado durante la conversion, por lo que la unica modalidad soportada es texto.

La pieza clave es el esquema de cuantizacion W8A8: pesos en int8 con una escala bf16 por canal de salida y activaciones cuantizadas a int8 por token en tiempo de ejecucion, con embeddings y capas de normalizacion mantenidos en bf16. El formato es `compressed-tensors` (`format: int-quantized`), el mismo que produce una exportacion W8A8 de `llm-compressor`, lo que lo hace cargable directamente por vLLM. El checkpoint ocupa 10,20 GiB y declara 7.463.013.418 parametros en los metadatos de safetensors.

La relevancia es practica: permite servir la variante E4B sin depender de kernels GGUF Q4_0 ni de un checkpoint bf16, reduciendo la huella de memoria en GPUs de gama alta de consumo y en aceleradores con presupuesto ajustado. El autor documenta el error relativo de cuantizacion por capa frente al checkpoint QAT de origen, que se situa entre el 0,60 % y el 1,70 %.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Gemma 4; la model card no detalla la topologia, pero el checkpoint contiene tensores `per_layer_input_gate`, `per_layer_model_projection` y `per_layer_projection`, caracteristicos de las variantes E (parametros efectivos) de la familia Gemma |
| Parámetros totales | 7.463.013.418 (metadatos safetensors del checkpoint) |
| Parámetros activos | no disponible; la nomenclatura E4B remite a parametros efectivos, pero la model card no describe el mecanismo de activacion |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 W8A8: pesos int8 con una escala bf16 por canal de salida, activaciones int8 por token en tiempo de ejecucion; embeddings y normas en bf16; origen QAT sobre rejilla Q4_0 |
| Idiomas soportados | no disponible (la model card no especifica idiomas) |
| Licencia | `gemma` (licencia Gemma de Google) |
| Formato de pesos | safetensors con cuantizacion `compressed-tensors` (`int-quantized`); libreria declarada: vLLM |
| Modelo base | `google/gemma-4-E4B-it-qat-q4_0-unquantized` |
| Tamaño del repositorio | 11,0 GB |
| Tamaño del checkpoint | 10,20 GiB |
| Modalidad | solo texto (torres de vision y audio eliminadas) |
| Fecha de publicacion | 2026-09-29 (creacion), 2026-09-29 (ultima actualizacion) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado desde cero, sino una recuantizacion de un checkpoint ya existente. El punto de partida son los pesos con entrenamiento consciente de cuantizacion (QAT) de Google, que ya residen sobre la rejilla Q4_0. El autor los redondea a int8 por canal de salida mediante el script `w8a8_from_qat.py`, manteniendo embeddings y capas de normalizacion en bf16 y descartando las torres de vision y audio. No hay, por tanto, entrenamiento adicional, RLHF ni DPO posteriores a la conversion: el ajuste por instrucciones proviene integramente del checkpoint `-it` de Google.

La unica innovacion tecnica reseñable es la propia recuantizacion y su verificacion. La model card reporta el error relativo de los tensores int8 frente a los pesos QAT originales, capa por capa: `mlp.down_proj` entre 0,86 % y 1,24 % (media 1,00 %), `mlp.gate_proj` entre 0,77 % y 1,05 % (media 0,87 %), `mlp.up_proj` entre 0,76 % y 1,05 % (media 0,86 %), `per_layer_input_gate` entre 0,76 % y 1,70 % (media 1,14 %), `per_layer_model_projection` 0,99 %, `per_layer_projection` entre 0,60 % y 1,00 % (media 0,68 %), `self_attn.k_proj` entre 0,77 % y 1,29 % (media 1,02 %), `self_attn.o_proj` entre 0,74 % y 0,99 % (media 0,82 %), `self_attn.q_proj` entre 0,78 % y 1,15 % (media 0,90 %) y `self_attn.v_proj` entre 0,79 % y 1,39 % (media 0,93 %). Esa degradacion se acumula sobre el error que ya introduce el propio QAT de origen, que el autor no cuantifica.

## Capacidades

- Generacion de texto y seguimiento de instrucciones en modo conversacional, heredados del checkpoint `-it` de Gemma 4 E4B.
- Ejecucion en vLLM a traves del soporte nativo de `compressed-tensors` en formato `int-quantized`, sin necesidad de kernels GGUF.
- Inferencia con activaciones int8 por token, lo que habilita kernels de matmul int8 en hardware compatible.
- Solo texto: la model card indica explicitamente que las torres de vision y audio fueron descartadas, por lo que no hay entrada de imagen ni de audio.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo "thinking" o razonamiento extendido: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible; la model card no enumera idiomas ni evaluaciones por idioma.

## Casos de uso

- Servicio de chat en produccion con vLLM: el checkpoint se carga directamente como artefacto `compressed-tensors` y ocupa 10,20 GiB de pesos, lo que permite desplegarlo en GPUs de 16-24 GB con contexto moderado, sin pasar por un export GGUF.
- Sustitucion del checkpoint QAT en infraestructuras que ya usan vLLM: al compartir esquema con las exportaciones W8A8 de `llm-compressor`, encaja en pipelines existentes de servir modelos sin cambios en el runtime.
- Evaluacion de degradacion por cuantizacion: util como punto de comparacion frente al checkpoint bf16 y frente a la variante oficial W4A16 de Google para medir el impacto real de int8 en las tareas propias del usuario.
- Generacion de texto por lotes con requisitos de memoria ajustados: la reduccion de huella respecto a un checkpoint bf16 permite aumentar el tamano de batch o el numero de replicas por GPU, siempre que el hardware tenga kernels int8 eficientes.
- Despliegue en entornos estrictamente textuales: al no incluir torres multimodales, se evita cargar pesos que no se van a usar, lo que simplifica el grafo de ejecucion.
- Prototipado local en una unica GPU de consumo: con 10,20 GiB de pesos, entra en tarjetas de 16 GB o mas, lo que facilita pruebas de instrucciones y generacion en estaciones de trabajo sin aceleradores de datacenter.
- Experimentacion con rutas de inferencia alternativas: el mismo autor mantiene un camino de inferencia en JAX sobre Cloud TPU v6e para el checkpoint QAT relacionado, lo que sirve de referencia para quien quiera reproducir el patron fuera de PyTorch.
- Comparacion entre variantes de la familia E: junto con el gemelo `xbill9/gemma-4-E2B-it-qat-w8a8-int8`, permite contrastar el comportamiento de los dos tamanos E sobre la misma tuberia de cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible. El unico dato cuantitativo aportado es el error relativo de cuantizacion frente al checkpoint QAT de origen:

| Capa | Tensores | Error relativo frente al QAT (rango; media) |
|---|---:|---|
| `mlp.down_proj` | 42 | 0,86-1,24 %; 1,00 % |
| `mlp.gate_proj` | 42 | 0,77-1,05 %; 0,87 % |
| `mlp.up_proj` | 42 | 0,76-1,05 %; 0,86 % |
| `per_layer_input_gate` | 42 | 0,76-1,70 %; 1,14 % |
| `per_layer_model_projection` | 1 | 0,99 %; 0,99 % |
| `per_layer_projection` | 42 | 0,60-1,00 %; 0,68 % |
| `self_attn.k_proj` | 24 | 0,77-1,29 %; 1,02 % |
| `self_attn.o_proj` | 42 | 0,74-0,99 %; 0,82 % |
| `self_attn.q_proj` | 42 | 0,78-1,15 %; 0,90 % |
| `self_attn.v_proj` | 24 | 0,79-1,39 %; 0,93 % |

## Requisitos de hardware

- Pesos en VRAM: 10,20 GiB para el checkpoint int8; el repositorio completo ocupa 11,0 GB en disco.
- VRAM estimada para inferencia: alrededor de 11-12 GiB solo para pesos; con cache KV y overhead del runtime, un presupuesto de 14-16 GiB cubre contexto moderado y 24 GiB da holgura para lotes mayores o contextos mas largos. Estimaciones orientativas, no medidas publicadas.
- GPU recomendadas: RTX 4090 (24 GB), RTX 5090, L40S (48 GB), A100 y H100 entran sin problema. En tarjetas de 16 GB (RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080) el modelo cabe con margen reducido para la cache KV.
- Cabe en GPU de consumo: si, en cualquier tarjeta con 16 GB o mas de VRAM, siempre que el runtime soporte el esquema `compressed-tensors` W8A8.
- Opciones de despliegue: vLLM es la ruta declarada por la libreria del repositorio y la unica documentada en la model card. No se proporciona GGUF, por lo que llama.cpp y Ollama no son aplicables directamente a este artefacto; TGI no se menciona.
- Latencia y throughput: no disponible; no hay mediciones publicadas para este checkpoint.
- Aceleradores alternativos: el ecosistema del autor documenta servir los checkpoints QAT de Gemma 4 en una unica Cloud TPU v6e mediante `tpu_inference` con parches, aunque ese trabajo se refiere a la variante W4A16, no a este int8.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `xbill9/gemma-4-E4B-it-qat-w8a8-int8` | 7.463.013.418 | no disponible | int8 W8A8, `compressed-tensors` | solo texto | Gemma | HuggingFace (0 descargas) |
| `google/gemma-4-E4B-it-qat-q4_0-unquantized` | no disponible | no disponible | QAT sobre rejilla Q4_0, sin cuantizar en disco | multimodal segun la familia Gemma 4 | Gemma | HuggingFace (origen oficial) |
| `google/gemma-4-E4B-it-qat-w4a16-ct` | no disponible | no disponible | W4A16, `compressed-tensors` (oficial de Google) | no disponible | Gemma | HuggingFace |
| `glenic/gemma-4-E4B-it-W8A8-INT8` | no disponible | no disponible | W8A8 int8 | no disponible | no disponible | HuggingFace |
| `xbill9/gemma-4-E2B-it-qat-w8a8-int8` | no disponible | no disponible | int8 W8A8, `compressed-tensors` | solo texto | Gemma | HuggingFace |

Contexto adicional: Google publica checkpoints QAT en `compressed-tensors` W4A16 para los tamanos E2B, E4B, 12B y 31B de Gemma 4; la variante 26B-A4B no figura en esa lista y se distribuye como GGUF Q4_0 y como exportacion bf16 de 48 GiB.

## Limitaciones y advertencias

- Solo texto: las torres de vision y audio se eliminaron en la conversion, por lo que cualquier tarea multimodal del modelo base es irrecuperable en este artefacto.
- Conversión no oficial: el autor pide explicitamente que los problemas se reporten a el y no a Google; no hay soporte ni validacion por parte del fabricante.
- Degradacion por cuantizacion: el error relativo por capa frente al QAT de origen va del 0,60 % al 1,70 %, y se suma a la perdida ya introducida por el propio QAT sobre rejilla Q4_0. No se documenta el impacto agregado sobre tareas reales.
- Ausencia de benchmarks: no hay MMLU, HumanEval, GSM8K ni evaluaciones de calidad; la unica metrica disponible es el error de cuantizacion por tensor.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero aplicable por tratarse de un modelo generativo de lenguaje.
- Idiomas soportados y longitud de contexto no documentados: no se puede planificar cobertura multilingue ni presupuestar ventanas largas sin verificacion empirica.
- Licencia Gemma: no es una licencia permisiva tipo Apache o MIT; incluye condiciones de uso y una politica de usos prohibidos. Antes de un despliegue comercial hay que revisar los terminos vigentes y las obligaciones de atribucion.
- No apto para fine-tuning en este formato: la model card no describe ninguna receta de reentrenamiento para pesos int8.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de informes independientes sobre estabilidad o calidad.
- Dependencia del runtime: el artefacto requiere un motor con soporte de `compressed-tensors` W8A8; fuera de vLLM la compatibilidad no esta garantizada.
- Fechas de publicacion poco habituales (2026-09-29), coherentes con el resto del ecosistema Gemma 4 pero que conviene verificar frente a la version de los pesos base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xbill9/gemma-4-E4B-it-qat-w8a8-int8
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-unquantized
- Gemelo E2B del mismo autor: https://huggingface.co/xbill9/gemma-4-E2B-it-qat-w8a8-int8
- Script de conversion: https://github.com/xbill9/gemma4-dev/blob/main/jev-tpu-31b/w8a8_from_qat.py
- Exportacion W4A16 del autor para 26B-A4B: https://huggingface.co/xbill9/gemma-4-26B-A4B-it-qat-q4_0-w4a16-ct
- Ruta de inferencia en JAX sobre TPU v6e: https://github.com/xbill9/tpu-jax-4b
- Notas de servicio en TPU para los checkpoints QAT: https://github.com/xbill9/gemma4-dev/blob/main/jev-tpu-31b/README.md
- Exportacion int8 alternativa del mismo tamano: https://huggingface.co/glenic/gemma-4-E4B-it-W8A8-INT8
- Ficha de Gemma-4-E4B-it en Qualcomm AI Hub: https://aihub.qualcomm.com/iot/models/gemma_4_e4b_it
