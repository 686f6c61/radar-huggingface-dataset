# xbill9/gemma-4-E4B-it-qat-q4_0-w4a16-ct

## Resumen

Este repositorio contiene un reempaquetado no oficial de los pesos con entrenamiento consciente de cuantizacion (QAT) de Gemma 4 E4B-it, publicados originalmente por Google DeepMind como `google/gemma-4-E4B-it-qat-q4_0-unquantized`. El autor, el usuario de HuggingFace xbill9, recupera la rejilla Q4_0 exacta del export sin cuantizar y la reescribe en el formato `compressed-tensors` W4A16 que carga vLLM, sin realizar ninguna cuantizacion nueva. El modelo tiene 7.941.100.874 parametros (unos 7,94 mil millones), ocupa 9,47 GiB en disco frente a los 14,79 GiB del checkpoint bf16 de origen y mantiene la licencia Apache 2.0 de Gemma 4.

El problema que resuelve es doble. Por un lado, ofrece una alternativa al export W4A16 oficial de Google para E4B, que segun el autor re-cuantiza los pesos con un observador `memoryless_minmax` (redondeo al mas cercano con escala `max|w| / 7,5`), desplazando cada peso a una rejilla distinta y midiendo un error relativo del 6,67 % en los exports de 12B y 31B. Por otro, elimina la copia en bf16 de `lm_head.weight` (1,25 GiB) que Google almacena pese a que la configuracion declara `tie_word_embeddings: true`, lo que reduce el espacio residente en chip de 10,15 GiB a 8,90 GiB.

Es relevante ahora porque permite servir un modelo multimodal de la familia Gemma 4 en una sola TPU v5e de 15,75 GiB de HBM, un objetivo que el checkpoint bf16 no alcanza. En una suite publica de 3.880 registros, este repack obtiene un 72,9 % de acierto por probabilidad de etiqueta, 1,3 puntos por encima del export W4A16 de Google y solo 0,2 puntos por debajo del modelo en bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con embeddings por capa (PLE); vision y audio towers presentes |
| Parametros totales | 7.941.100.874 (7,94 mil millones) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16: int4 simetrico, grupo de 32, escalas bf16, activaciones sin cuantizar; formato `pack-quantized` de compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (enlace: ai.google.dev/gemma/docs/gemma_4_license) |
| Formato de pesos | safetensors con esquema compressed-tensors `pack-quantized` |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 E4B-it, un transformer multimodal de Google DeepMind cuyo entrenamiento y tarjeta original no se modifican en este repositorio (se conservan en `ORIGINAL_README.md`). Segun la informacion disponible, el modelo consta de 42 capas de lenguaje cuyas lineales de atencion y MLP estan cuantizadas en este repack, ademas de 85 proyecciones de embedding por capa (`per_layer_input_gate`, `per_layer_projection`, `per_layer_model_projection`). Los modelos de la serie E comparten capas KV que no poseen parametros K/V propios, un detalle relevante para el backend de vLLM en TPU. Se mantienen en bf16 y copiados byte a byte el token embedding (atado al LM head), la tabla de embeddings por capa, las normas y las torres de vision y audio.

No se realiza entrenamiento adicional ni cuantizacion nueva: el export `-qat-q4_0-unquantized` ya contiene valores bf16 situados en una rejilla de 4 bits, donde cada peso es `step × level` con niveles de −8 a 7 dentro de cada grupo de 32 pesos a lo largo de la dimension de entrada. El script `repack_q4_0.py` determina para cada grupo el `step = max|w| / m` (con m de 1 a 8) que reproduce los 32 valores, lo refina por minimos cuadrados y lo almacena en bf16. La verificacion relee ambos checkpoints y comprueba 124.149.760 grupos de 32: ninguno queda fuera de la rejilla de origen y el 89,9 % de los valores son identicos bit a bit; el resto difiere por la escala bf16, con un maximo de 1,09e-2 de error relativo. Los 1.733 tensores sin cuantizar son identicos byte a byte al origen y toda lineal que permanece en bf16 figura en la lista `ignore`.

## Capacidades

- Generacion de texto conversacional (pipeline declarado: `image-text-to-text`; el autor solo ha probado texto).
- Razonamiento y evaluacion por probabilidad de etiqueta: la suite de 3.880 registros se puntua leyendo la probabilidad asignada a cada etiqueta.
- Procesamiento multimodal de imagen y audio: las torres correspondientes estan presentes en el checkpoint, aunque no se han ejercitado en las pruebas publicadas.
- Inferencia de alto rendimiento en vLLM con backend de TPU (W4A16 con capas lineales cuantizadas).
- Soporte de peticiones concurrentes: medido hasta 16 peticiones simultaneas de 256 tokens cada una.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio como capacidades verificadas: no disponible (las torres existen pero no se han validado).

## Casos de uso

- Servicio de chat de texto en una unica TPU v5e: con 8,90 GiB de pesos residentes en una chip de 15,75 GiB de HBM, deja margen para cache KV y el modelo compilado, lo que permite desplegar un asistente conversacional de casi 8.000 millones de parametros sin repartir el modelo entre varios aceleradores.
- Evaluacion y clasificacion por probabilidad de etiqueta: el propio autor usa el modelo para puntuar 3.880 registros leyendo la probabilidad de la etiqueta, un flujo directamente replicable en tareas de moderacion, enrutado o etiquetado automatico por lotes.
- Atender picos de trafico con batching continuo: a 16 peticiones concurrentes de 256 tokens el repack entrega 1.012,3 tokens/s de salida, frente a 74,6 tokens/s con una sola peticion, lo que lo hace adecuado para API de generacion con carga variable.
- Investigacion sobre cuantizacion y QAT: sirve como referencia reproducible para comparar un repack que preserva la rejilla Q4_0 exacta frente a re-cuantizaciones round-to-nearest, con informes (`repack_report.json`, `verify_report.json`) y scripts publicados.
- Prototipado multimodal en texto y vision: al conservar en bf16 las torres de vision y audio, es una base para explorar entrada image-text-to-text, aunque el autor advierte de que no las ha probado.
- Despliegue en infraestructura TPU existente: encaja en entornos Google Cloud TPU v5e ya disponibles, con latencias de primer token de 30,9 ms en la mediana para una peticion.
- Comparacion A/B de checkpoints cuantizados: permite medir en la misma chip y con los mismos flags la diferencia entre un export oficial W4A16 y un repack que conserva la rejilla original, util para decidir que artefacto promover a produccion.

## Benchmarks y rendimiento

Suite publica de 3.880 registros, puntuada por probabilidad de etiqueta, registro a registro:

| Build de E4B | Hardware | Suite | Diferencia de este repack (IC 95 %) |
|---|---|---|---|
| google/gemma-4-E4B-it bf16 | 1 chip v6e (el bf16 no cabe en un chip v5e) | 73,1 % | −0,2 puntos (−0,8 a +0,5) |
| google/gemma-4-E4B-it-qat-w4a16-ct | mismo chip v5e, mismos flags | 71,6 % | +1,3 puntos (+0,7 a +2,0) |
| Este repack | 1 chip v5e | 72,9 % | — |

Rendimiento en una chip TPU v5e (`v5litepod-1`, 15,75 GiB de HBM) con vLLM TPU `vllm/vllm-tpu@sha256:19a1a052…` y los parches indicados:

| Metrica | Este repack | google/gemma-4-E4B-it-qat-w4a16-ct |
|---|---|---|
| Pesos residentes | 8,90 GiB | 10,15 GiB |
| Latencia al primer token, una peticion, mediana | 30,9 ms | 31,4 ms |
| Tokens/s de salida a 1 / 4 / 16 peticiones concurrentes (256 tokens cada una) | 74,6 / 290,6 / 1.012,3 | no medido |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- TPU: una sola chip v5e (`v5litepod-1`, 15,75 GiB de HBM) es suficiente; los pesos residentes ocupan 8,90 GiB. El checkpoint bf16 de origen no cabe en una chip v5e y requiere una v6e.
- VRAM estimada en GPU: el checkpoint ocupa 9,47 GiB en disco; a esa cifra hay que sumar la cache KV y el overhead del runtime, por lo que se necesita una GPU con al menos 12-16 GB, estimacion no verificada.
- GPUs consumer: no probado con este checkpoint. Por tamano, encajaria teoricamente en tarjetas de 16 GB (por ejemplo RTX 4060 Ti 16 GB o RTX 4080) y con mas holgura en 24 GB (RTX 3090, RTX 4090), siempre que el soporte de compressed-tensors W4A16 funcione en el backend CUDA.
- GPUs de datacenter: no probado con este checkpoint; A100 y H100 quedan sobredimensionados en memoria para un modelo de 9,47 GiB, salvo que se busque throughput agregado con batching.
- Opciones de despliegue: vLLM. En TPU requiere `tpu-inference` PR #3653 (capas lineales W4A16) y PR #3299 (las capas KV compartidas de los modelos E no poseen parametros K/V). Ejemplo del autor: `vllm serve <this-repo> --max-model-len 2048 --gpu-memory-utilization 0.80 --limit-mm-per-prompt '{"image":0,"audio":0,"video":0}'`. No se menciona soporte probado en llama.cpp, Ollama ni TGI.
- Latencia y throughput: primer token en 30,9 ms (mediana, una peticion); 74,6 tokens/s con 1 peticion concurrente, 290,6 con 4 y 1.012,3 con 16, cada una de 256 tokens.
- Limitacion de despliegue: todas las medidas son con tensor parallelism 1; no hay datos de otros hardware ni de configuraciones multi-chip.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / formato | Tamano | Licencia | Rendimiento en la suite de 3.880 registros |
|---|---|---|---|---|---|---|
| xbill9/gemma-4-E4B-it-qat-q4_0-w4a16-ct | 7,94 B | no disponible | W4A16 int4 grupo 32, compressed-tensors | 9,47 GiB en disco, 8,90 GiB residentes | Apache 2.0 | 72,9 % |
| google/gemma-4-E4B-it-qat-w4a16-ct | no disponible (mismo modelo base) | no disponible | W4A16 re-cuantizado con observador memoryless_minmax | 10,15 GiB residentes | Apache 2.0 | 71,6 % |
| google/gemma-4-E4B-it (bf16) | no disponible | no disponible | bf16 | 14,79 GiB en disco | Apache 2.0 | 73,1 % |

El autor menciona tambien los exports equivalentes de 12B y 31B, sobre los que midio el 6,67 % de error relativo en la re-cuantizacion, aunque no se aportan resultados de rendimiento para esos tamanos. No se dispone de comparaciones con modelos de otros fabricantes.

## Limitaciones y advertencias

- Repack no oficial: no esta afiliado ni respaldado por Google. Los problemas deben reportarse al autor del repack, no a Google.
- Pruebas limitadas a TPU v5e con tensor parallelism 1; el comportamiento en otros aceleradores no esta medido.
- Solo se ha probado texto. Las torres de vision y audio estan presentes en el checkpoint pero no se han ejercitado, por lo que su calidad en este formato no esta validada.
- Compatibilidad en NVIDIA: explicitamente "untested" segun la tarjeta. Requiere que vLLM soporte compressed-tensors W4A16 en ese backend.
- En TPU, el despliegue exige dos parches concretos de `tpu-inference` (#3653 y #3299); sin ellos no carga.
- No se documentan idiomas soportados, longitud de contexto ni sesgos conocidos en la informacion disponible.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplican las advertencias de la tarjeta original de Gemma 4.
- Licencia Apache 2.0 con enlace a los terminos de Gemma 4; conviene revisar las condiciones especificas de uso comercial de Gemma antes de un despliegue en produccion.
- La cifra de error relativo del 6,67 % en la re-cuantizacion oficial se midio en los exports de 12B y 31B, no tensor a tensor sobre E4B; el autor lo indica explicitamente.
- Verificacion de integridad: el 89,9 % de los valores son identicos bit a bit y el resto difiere hasta 1,09e-2 en terminos relativos por el redondeo de la escala bf16, una diferencia no nula respecto al export de origen.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/xbill9/gemma-4-E4B-it-qat-q4_0-w4a16-ct
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-unquantized
- Export oficial W4A16 de Google: https://huggingface.co/google/gemma-4-E4B-it-qat-w4a16-ct
- Repositorio de desarrollo, logs y scripts: https://github.com/xbill9/gemma4-dev/tree/main/jev-tpu-v5e1
- Script de reempaquetado: https://github.com/xbill9/gemma4-dev/blob/main/jev-tpu-31b/repack_q4_0.py
- PR de tpu-inference para capas lineales W4A16: https://github.com/vllm-project/tpu-inference/pull/3653
- PR de tpu-inference para capas KV compartidas: https://github.com/vllm-project/tpu-inference/pull/3299
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
