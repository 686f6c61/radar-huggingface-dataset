# xbill9/gemma-4-E4B-it-qat-w8a8-int8-emb4

## Resumen

`xbill9/gemma-4-E4B-it-qat-w8a8-int8-emb4` es una compilacion no oficial, publicada de forma independiente a Google, del modelo Gemma 4 E4B-it con entrenamiento consciente de cuantizacion (QAT, quantization-aware training). Parte de `google/gemma-4-E4B-it-qat-q4_0-unquantized` y aplica cuantizacion int8 W8A8 a las capas lineales (pesos int8 con una escala bf16 por canal de salida y activaciones cuantizadas a int8 por token en tiempo de ejecucion) junto con tablas de embeddings en int4 simetrico de grupo 32. El resultado es un checkpoint cargable como `Gemma4ForCausalLM` solo texto, de 8.134.102.058 parametros (8,13B) y 5,88 GiB en disco, frente a los 10,20 GiB de la misma build W8A8 con embeddings en bf16.

El problema que resuelve es el de servir un modelo de la gama edge de Gemma 4 en hardware con memoria limitada sin perder precision apreciable: segun las mediciones del autor en un chip TPU v5e, el checkpoint obtiene un 72,8% en una suite publica de 3.880 registros frente al 73,1% del Gemma 4 E4B-it en bf16 medido en v6e, una diferencia de -0,3 puntos (rango del 95%: -1,0 a +0,5). Ademas, la combinacion int8 x int8 se ejecuta de forma nativa en las unidades matriciales de v5e, lo que dispara el throughput: 133 / 509 / 1.747 tokens de salida por segundo con 1 / 4 / 16 peticiones concurrentes.

Es relevante ahora porque la familia Gemma 4 (cinco tamanos: E2B, E4B, 12B, 26B A4B y 31B, con arquitecturas densas y MoE) se presenta como base para despliegues que van del movil al servidor, y esta build demuestra que se puede recortar el peso casi a la mitad manteniendo la calidad, a costa de eliminar las torres de vision y audio y de requerir parches especificos sobre vLLM en TPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Gemma 4 E4B; incluye embeddings por capa (`embed_tokens_per_layer`) y `lm_head` no atado (`tie_word_embeddings: false`) |
| Parametros totales | 8.134.102.058 (8,13B) |
| Parametros activos | no aplica (no consta como MoE en la informacion disponible) |
| Longitud de contexto | no especificada para este checkpoint; la familia Gemma 4 declara hasta 256K tokens |
| Tipos de cuantizacion | int8 W8A8 en lineales (pesos int8, escala bf16 por canal de salida, activaciones int8 por token); int4 simetrico grupo 32 con escalas fp16 en `embed_tokens`, `embed_tokens_per_layer` y `lm_head`; bf16 en normas y escalares |
| Idiomas soportados | no especificados en la ficha del checkpoint; la familia Gemma 4 declara mas de 140 idiomas |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors con formato compressed-tensors; libreria declarada `vllm` |
| Tamano del repositorio | 6,3 GB (pesos: 5,88 GiB) |
| Modalidad | solo texto (torres de vision y audio eliminadas) |
| Modelo base | google/gemma-4-E4B-it-qat-q4_0-unquantized (relacion: quantized) |
| Fecha de publicacion | 7 de octubre de 2026 (metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El checkpoint no introduce entrenamiento nuevo: redistribuye los pesos QAT de Google en un formato distinto. La cuantizacion de las capas lineales se realiza redondeando los pesos QAT, que ya se encontraban sobre la rejilla Q4_0 (error relativo por tensor de 0,60-1,70% segun la tabla publicada en la ficha del modelo hermano `-w8a8-int8`), a int8 W8A8 con una escala bf16 por canal de salida. Las tablas de embeddings (`embed_tokens`, `embed_tokens_per_layer` y `lm_head`) se empaquetan en int4 simetrico con grupo 32 y escalas fp16; dado que los pesos QAT situan estas tablas sobre la misma rejilla de 4 bits que las lineales, el paso de cada grupo se recupera en lugar de elegirse. El `lm_head` es una copia no atada de los valores de embedding, por lo que la capa de salida se ejecuta como una lineal int4. Normas y escalares se conservan en bf16. Las torres de vision y audio se han descartado, lo que deja el modelo como text-only.

La innovacion tecnica principal es el esquema de compresion combinado (int8 en computo, int4 en almacenamiento de embeddings) y su explotacion en vLLM sobre TPU. El backend TPU de vLLM no dispone de metodo int8 W8A8 en su ruta JAX, ni de tabla de embeddings int4, ni de cabeza de salida cuantizada, y ademas lee `hf_config.text_config`; los parches publicados en el repositorio `tpu-vllm-v5e1-12b-w8a8emb4` anaden esas capacidades. Las herramientas de conversion son `w8a8_from_qat.py` y `w8a8_emb4.py` del repositorio `xbill9/gemma4-dev`.

## Capacidades

- Generacion de texto conversacional y continuacion de texto, con plantilla de instrucciones (sufijo `-it`).
- Razonamiento y matematicas: el autor reporta un 94,0% en GSM8K con limite de 2.048 tokens.
- Llamada a funciones y uso de herramientas: 91,2% en BFCL (Berkeley Function Calling Leaderboard).
- Flujos agenticos y razonamiento multi-paso, heredados del modelo QAT de Google.
- Capacidad multilingue heredada de la familia Gemma 4 (mas de 140 idiomas declarados a nivel de familia), aunque la ficha del checkpoint no detalla el desglose por idioma.
- Exclusivamente texto: no admite entradas de imagen ni de audio, ya que ambas torres fueron eliminadas en esta build.
- No dispone de modo de razonamiento explicito documentado ni de salida de audio.

## Casos de uso

- Atencion al cliente automatizada: con contexto largo heredado de la familia Gemma 4 y un peso de solo 5,88 GiB, permite mantener conversaciones multi-turno en un unico acelerador economico (por ejemplo, una Tesla T4 de 16 GB o una TPU v5e) sin repartir el modelo entre dispositivos.
- Asistente con function calling en produccion: el 91,2% en BFCL lo hace apto para enrutar peticiones a APIs internas, reservas o consultas a bases de datos mediante esquemas de herramientas declarados.
- Generacion de codigo asistida y revision de fragmentos: util como backend de autocompletado o de explicacion de codigo en entornos con presupuesto de VRAM ajustado, siempre que no se requiera vision de diagramas.
- Clasificacion y extraccion de informacion sobre documentos: la suite publica de 3.880 registros se evalua por probabilidad de etiqueta, lo que indica que el modelo conserva calidad suficiente para tareas de etiquetado y enrutado por scoring.
- Razonamiento matematico de nivel escolar y educativo: el 94,0% en GSM8K lo respalda para tutoria automatizada de problemas aritmeticos con cadenas de pasos.
- Despliegue en el edge y en dispositivos con memoria limitada: la reduccion a 5,88 GiB y la ejecucion int8 nativa en las unidades matriciales de v5e permiten servir el modelo con latencias bajas (primer token en 0,40 s con prompts de 1.043 tokens) en hardware de gama de entrada.
- Procesamiento por lotes de alto rendimiento: 1.231 tokens de salida por segundo con 16 prompts de 1.043 tokens en una sola TPU v5e, adecuado para tareas de resumen o generacion masiva por lotes.
- Sustitucion directa de una build W8A8 con embeddings bf16: mismo contenido en las lineales int8 y mismos numeros de calidad, con 4,32 GiB menos de peso, lo que simplifica el empaquetado en contenedores.

## Benchmarks y rendimiento

| Metrica | Este checkpoint | Gemma 4 E4B-it bf16 | W4A16 QAT repack con embeddings int4 |
|---|---|---|---|
| Suite publica de 3.880 registros (lectura por probabilidad de etiqueta) | 72,8% | 73,1% (medido en v6e) | no disponible |
| GSM8K (limite 2.048 tokens) | 94,0% | no disponible | no disponible |
| BFCL | 91,2% | no disponible | no disponible |
| Throughput de salida a 1 / 4 / 16 peticiones (tok/s) | 133 / 509 / 1.747 | no disponible | 79 / 308 / 1.019 |
| Throughput con 16 prompts de 1.043 tokens (tok/s de salida) | 1.231 | no disponible | no disponible |
| Tiempo hasta el primer token | 0,40 s | no disponible | no disponible |

Notas de medicion: los datos se obtuvieron en un unico chip `v5litepod-1` (15,75 GiB de HBM) con vLLM TPU (`vllm/vllm-tpu@sha256:19a1a052…`) mas los parches indicados; la comparacion bf16 se midio en v6e. El throughput corresponde a 256 tokens de salida por peticion y 3 repeticiones, sobre el mismo chip e imagen que la fila W4A16. La diferencia frente a bf16 es de -0,3 puntos con rango del 95% de -1,0 a +0,5.

## Requisitos de hardware

- VRAM estimada para los pesos: 5,88 GiB en el formato cuantizado distribuido; hay que anadir la cache KV, cuyo tamano depende del contexto efectivo y del numero de peticiones concurrentes.
- TPU: medida y validada en `v5litepod-1` (15,75 GiB de HBM) con el backend TPU de vLLM y los parches del autor.
- GPU: no probado por el autor en este checkpoint. El backend CUDA de vLLM soporta por separado lineales W8A8 de compressed-tensors y grupos de embeddings int4; la build E2B de este mismo esquema sirve en una Tesla T4 con vLLM 0.29, lo que sugiere que una GPU de 16 GB puede ser suficiente, pero debe verificarse.
- Cabe en GPU de consumo: previsiblemente si, en tarjetas con 8-16 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090), siempre que la cache KV se dimensione de forma conservadora y se valide la ruta CUDA.
- Opciones de despliegue: vLLM (libreria declarada por el repositorio) con backend TPU parcheado; en CUDA, vLLM con soporte compressed-tensors. No se documentan integraciones con llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput medidos: 0,40 s hasta el primer token y 1.231 tokens de salida por segundo con 16 prompts de 1.043 tokens en una TPU v5e; 133 / 509 / 1.747 tok/s a 1 / 4 / 16 peticiones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Suite publica | Tamano en disco | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este checkpoint (E4B, W8A8 int8 + embeddings int4) | 8,13B | no disponible (familia: hasta 256K) | 72,8% | 5,88 GiB | Apache 2.0 | HuggingFace, libreria vllm |
| xbill9/gemma-4-E4B-it-qat-w8a8-int8 (mismos lineales int8, embeddings bf16) | 8,13B | no disponible | no disponible | 10,20 GiB | Apache 2.0 | HuggingFace |
| google/gemma-4-E4B-it (bf16) | no disponible en la informacion | no disponible (familia: hasta 256K) | 73,1% (medido en v6e) | no disponible | Apache 2.0 | HuggingFace |
| google/gemma-4-E4B-it-qat-q4_0-unquantized (modelo base) | no disponible en la informacion | no disponible | no disponible | no disponible | Apache 2.0 | HuggingFace |
| xbill9/gemma-4-12B-it-qat-w8a8-int8-emb4 | 12B (nominal) | no disponible | no disponible | no disponible | Apache 2.0 | HuggingFace |

## Limitaciones y advertencias

- Build no oficial: no esta afiliada ni respaldada por Google. Los problemas deben reportarse al autor del repositorio, no a Google.
- Solo texto: las torres de vision y audio se han eliminado, por lo que no admite entradas de imagen ni de audio.
- Mediciones limitadas a TPU v5e: no hay validacion publicada del comportamiento en GPU, y la ruta CUDA requeriria comprobar que vLLM combina correctamente las lineales W8A8 con los grupos de embeddings int4.
- Requiere parches sobre vLLM: el backend TPU no soporta de serie int8 W8A8, tablas de embeddings int4 ni cabeza de salida cuantizada en su ruta JAX.
- Riesgo de alucinacion: inherente a los modelos de lenguaje generativos; no se documentan evaluaciones especificas de veracidad ni de tasas de alucinacion para este checkpoint.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible; se heredan los del modelo base de Google.
- Idiomas: la ficha del checkpoint no detalla el reparto por idioma; el soporte multilingue declarado (mas de 140 idiomas) corresponde a la familia Gemma 4, no a una evaluacion especifica de esta cuantizacion.
- Perdida de precision por cuantizacion: el error relativo por tensor de las lineales al redondear desde la rejilla Q4_0 esta entre el 0,60% y el 1,70%, y la suite publica cae 0,3 puntos frente a bf16, con un intervalo que admite hasta -1,0 puntos.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion independiente de terceros.
- Licencia Apache 2.0: permite uso comercial, pero el propio repositorio apunta al enlace de la licencia de Gemma 4 de Google, que conviene revisar antes de un despliegue en produccion.
- Fechas de publicacion futuras respecto a los metadatos habituales, lo que sugiere un repositorio muy reciente o recien creado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xbill9/gemma-4-E4B-it-qat-w8a8-int8-emb4
- Modelo hermano con embeddings bf16: https://huggingface.co/xbill9/gemma-4-E4B-it-qat-w8a8-int8
- Version de 12B del mismo esquema: https://huggingface.co/xbill9/gemma-4-12B-it-qat-w8a8-int8-emb4
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-unquantized
- Pagina de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Gemma 4 en Google AI Edge: https://developers.google.com/edge/litert-lm/models/gemma-4
- Model card de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Script de conversion `w8a8_from_qat.py`: https://github.com/xbill9/gemma4-dev/blob/main/jev-tpu-31b/w8a8_from_qat.py
- Script de conversion `w8a8_emb4.py`: https://github.com/xbill9/gemma4-dev/blob/main/jev-tpu-31b/w8a8_emb4.py
- Logs y salidas por registro de la build E4B: https://github.com/xbill9/gemma4-dev/tree/main/tpu-vllm-v5e1-4b-w8a8emb4
- Parches de vLLM TPU utilizados: https://github.com/xbill9/gemma4-dev/tree/main/tpu-vllm-v5e1-12b-w8a8emb4
