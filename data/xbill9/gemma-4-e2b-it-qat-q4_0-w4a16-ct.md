# xbill9/gemma-4-E2B-it-qat-q4_0-w4a16-ct

## Resumen

Este repositorio es un reempaquetado no oficial de los pesos con entrenamiento consciente de cuantizacion (QAT) de Gemma 4 E2B-it publicados por Google DeepMind. El autor, xbill9, toma el checkpoint `google/gemma-4-E2B-it-qat-q4_0-unquantized` y lo reescribe en el formato `compressed-tensors` W4A16 que carga vLLM, sin realizar una nueva cuantizacion: recupera la rejilla de 4 bits ya presente en los pesos originales y almacena los niveles como int4 empaquetado. El modelo conserva la licencia Apache 2.0 del original.

Se trata de un modelo multimodal de tipo image-text-to-text, con torres de vision y audio presentes en el checkpoint, aunque solo se ha probado el modo texto. El recuento real de parametros de los safetensors es de 5.104.297.539 (unos 5,1 mil millones), con un tamano de repositorio de 7,5 GB y un peso efectivo en disco de 7,00 GiB, frente a los 9,51 GiB del origen en bf16. La denominacion "E2B" y la presencia de una tabla de embeddings por capa (PLE) de 4,375 GiB sugieren un esquema de parametros efectivos, aunque la model card no detalla este punto.

Su relevancia es doble: por un lado reduce el espacio en disco y en memoria del chip (0,75 GiB menos que la exportacion W4A16 de Google, al no duplicar `lm_head.weight`), y por otro mejora la precision medida respecto a esa misma exportacion oficial, con +2,4 puntos en una suite publica de 3.880 registros leida por probabilidad de etiqueta. Todo el trabajo esta orientado a servir el modelo en TPU de Google Cloud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de lenguaje multimodal (image-text-to-text) con torres de vision y audio; 35 capas y proyecciones per-layer-embedding (PLE). Detalle completo no disponible |
| Parametros totales | 5.104.297.539 |
| Parametros activos | No aplica (no se describe como MoE en la informacion disponible) |
| Longitud de contexto | No disponible (en el ejemplo de servicio se usa `--max-model-len 2048`) |
| Tipos de cuantizacion | int4 simetrico W4A16, formato compressed-tensors `pack-quantized`, grupo de 32, escalas en bf16, activaciones sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (`license_link`: https://ai.google.dev/gemma/docs/gemma_4_license) |
| Formato de pesos | safetensors (compressed-tensors), libreria vllm |

## Arquitectura y entrenamiento

Los pesos proceden del entrenamiento QAT de Google para Gemma 4 E2B-it, no de un entrenamiento propio de este repositorio. La model card indica que se cuantizan todas las lineales de atencion y MLP del modelo de lenguaje (35 capas) y las 71 proyecciones de embeddings por capa (`per_layer_input_gate`, `per_layer_projection`, `per_layer_model_projection`), que el QAT tambien situa en la rejilla de 4 bits. Se mantienen en bf16, copiados byte a byte, el token embedding (atado al LM head), la tabla de embeddings por capa (4,375 GiB, la parte mas grande del archivo), las normas y las torres de vision y audio.

La innovacion tecnica de este reempaquetado es el metodo de conversion: el export `-qat-q4_0-unquantized` almacena valores bf16 que ya se encuentran sobre una rejilla de 4 bits, donde dentro de cada grupo de 32 pesos a lo largo de la dimension de entrada cada peso es `step x level` con `level` entre -8 y 7. El script `repack_q4_0.py` recupera el `step` de cada grupo buscando `max|w| / m` (con m de 1 a 8) que reproduce los 32 valores, lo refina por minimos cuadrados y lo guarda en bf16. No se realiza ninguna cuantizacion nueva. La verificacion relee ambos checkpoints y comprueba que, de 58.650.624 grupos de 32, ninguno queda fuera de la rejilla de origen, con un 90,0% de valores identicos bit a bit y el resto con una diferencia maxima de 1,09e-2 en terminos relativos. Los 1.675 tensores sin cuantizar son identicos byte a byte al origen.

## Capacidades

- Generacion de texto conversacional a partir del ajuste de instrucciones de Gemma 4 E2B-it.
- Procesamiento multimodal image-text-to-text segun el `pipeline_tag`, con torres de vision y audio presentes en el checkpoint.
- Inferencia de texto en vLLM sobre backend TPU, con lineales W4A16.
- Capacidades de razonamiento y conocimiento general heredadas del modelo Gemma 4 subyacente (el detalle concreto no figura en la informacion disponible).
- Capacidades multilingues: no disponible.
- Soporte de tool calling, function calling y agentes: no disponible.
- Modo "thinking", vision o audio ejercitados: no disponible (la model card indica que solo se probo texto).

## Casos de uso

- Despliegue de inferencia en TPU v5e: el modelo esta verificado en una sola chip (`v5litepod-1`, 15,75 GiB de HBM) con vLLM TPU y pesos residentes de 6,42 GiB, lo que permite ejecutar Gemma 4 E2B-it en hardware TPU de gama de entrada.
- Servicio conversacional de bajo consumo de memoria: al ocupar 0,75 GiB menos que la exportacion W4A16 de Google, libera HBM en la chip para cache KV o modelos compilados, util cuando la memoria del acelerador es el cuello de botella.
- Evaluacion comparativa de tecnicas de cuantizacion: sirve como referencia reproducible frente a los checkpoints bf16 y W4A16 de Google sobre una suite publica de 3.880 registros.
- Despliegue multiusuario con concurrencia moderada: el modelo escala a 1.906,2 tokens/s de salida con 16 peticiones concurrentes de 256 tokens, adecuado para servicios por lotes o cargas agregadas.
- Investigacion en formatos compressed-tensors: util para validar el pipeline de carga W4A16 en vLLM TPU y las dependencias de tpu-inference.
- Base para reempaquetados propios: el script `repack_q4_0.py` y los informes de verificacion permiten extender la tecnica a otras exportaciones Q4_0 de la familia Gemma.
- Experimentacion multimodal pendiente: las torres de vision y audio estan incluidas, por lo que el checkpoint puede servir de punto de partida para probar entrada de imagen y audio aunque no este validado.

## Benchmarks y rendimiento

Suite publica de 3.880 registros leida por probabilidad de etiqueta, comparacion registro a registro:

| Build de E2B | Ubicacion | Suite | Diferencia de este repack (rango 95%) |
|---|---|---:|---|
| `google/gemma-4-E2B-it` bf16 | la misma chip v5e | 68,5% | -0,6 puntos (-1,6 a +0,3) |
| `google/gemma-4-E2B-it-qat-w4a16-ct` | la misma chip v5e, mismos flags | 65,5% | +2,4 puntos (+1,4 a +3,4) |
| Este repack | una chip v5e | 67,8% | - |

Rendimiento medido en una chip TPU v5e (`v5litepod-1`, 15,75 GiB de HBM) con vLLM TPU y los parches indicados:

| Metrica | Este repack | `google/gemma-4-E2B-it-qat-w4a16-ct` |
|---|---:|---:|
| Pesos residentes | 6,42 GiB | 7,17 GiB |
| Latencia del primer token, una peticion, mediana | 16,2 ms | 16,0 ms |
| Tokens/s de salida a 1 / 4 / 16 peticiones concurrentes (256 tokens cada una) | 136,3 / 531,6 / 1.906,2 | no medido |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM/HBM estimada: 6,42 GiB de pesos residentes en TPU v5e con memoria suficiente para el modelo compilado; el ejemplo de servicio usa `--gpu-memory-utilization 0.80` sobre una chip de 15,75 GiB.
- GPU recomendadas: no disponibles. La model card indica explicitamente que el checkpoint no se ha probado en NVIDIA.
- TPU: validado en una chip v5e (`v5litepod-1`) con vLLM TPU `vllm/vllm-tpu@sha256:19a1a052…` y los parches tpu-inference #3653 (capas lineales W4A16) y #3299 (capas con KV compartida de los modelos E).
- Consumer GPU: no disponible; sin validacion en GPUs de consumo.
- Opciones de despliegue: vLLM con backend TPU. Comando de ejemplo: `vllm serve <repo> --max-model-len 2048 --gpu-memory-utilization 0.80 --limit-mm-per-prompt '{"image":0,"audio":0,"video":0}'`.
- Latencia y throughput: primer token con mediana de 16,2 ms; 136,3 tokens/s (1 peticion), 531,6 tokens/s (4 concurrentes) y 1.906,2 tokens/s (16 concurrentes), con 256 tokens de salida por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision (suite) | Tamano en disco | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este repack (`xbill9/…-w4a16-ct`) | 5.104.297.539 | no disponible | 67,8% | 7,00 GiB | Apache 2.0 | HuggingFace (0 descargas) |
| `google/gemma-4-E2B-it` bf16 | no disponible | no disponible | 68,5% | 9,51 GiB (origen q4_0) | Apache 2.0 | HuggingFace (oficial) |
| `google/gemma-4-E2B-it-qat-w4a16-ct` | no disponible | no disponible | 65,5% | 7,17 GiB residente | Apache 2.0 | HuggingFace (oficial) |
| `google/gemma-4-E2B-it-qat-q4_0-unquantized` | no disponible | no disponible | no medido | 9,51 GiB | Apache 2.0 | HuggingFace (oficial, origen) |

## Limitaciones y advertencias

- Reempaquetado no oficial: no esta afiliado ni respaldado por Google; los problemas deben reportarse al repositorio del autor, no a Google.
- Hardware limitado: medido unicamente en TPU v5e con tensor parallelism 1; otros entornos no estan probados, incluido NVIDIA.
- Solo texto: las torres de vision y audio estan presentes pero no se han ejercitado, por lo que su comportamiento multimodal no esta validado.
- Sesgos conocidos: no disponibles en la informacion proporcionada; heredados, en su caso, del modelo Gemma 4 subyacente.
- Riesgo de alucinacion: no cuantificado en la informacion disponible.
- Diferencias numericas frente al origen: aunque el 90,0% de los valores son identicos bit a bit, el resto difiere hasta un 1,09e-2 relativo por el redondeo de la escala bf16.
- Precision ligeramente inferior al modelo bf16 de referencia: -0,6 puntos en la suite (rango -1,6 a +0,3), diferencia que no se puede descartar estadisticamente.
- Dependencias fragiles: requiere versiones concretas de vLLM TPU y parches aun no fusionados de tpu-inference (#3653 y #3299).
- Longitud de contexto: no confirmada; la configuracion de ejemplo limita `--max-model-len` a 2048.
- Licencia: Apache 2.0, lo que en principio permite uso comercial, pero conviene revisar los terminos de Gemma 4 enlazados en `license_link`.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Repositorio del modelo: https://huggingface.co/xbill9/gemma-4-E2B-it-qat-q4_0-w4a16-ct
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
- Exportacion oficial W4A16 de Google: https://huggingface.co/google/gemma-4-E2B-it-qat-w4a16-ct
- Modelo bf16 de referencia: https://huggingface.co/google/gemma-4-E2B-it
- Repositorio de desarrollo, logs y scripts: https://github.com/xbill9/gemma4-dev/tree/main/jev-tpu-v5e1
- Script de reempaquetado: https://github.com/xbill9/gemma4-dev/blob/main/jev-tpu-31b/repack_q4_0.py
- Parche tpu-inference #3653 (capas lineales W4A16): https://github.com/vllm-project/tpu-inference/pull/3653
- Parche tpu-inference #3299 (capas con KV compartida): https://github.com/vllm-project/tpu-inference/pull/3299
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
