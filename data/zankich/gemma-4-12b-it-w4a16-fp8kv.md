# zankich/gemma-4-12B-it-W4A16-FP8KV

## Resumen

`zankich/gemma-4-12B-it-W4A16-FP8KV` es una cuantizacion del modelo multimodal `google/gemma-4-12B-it` publicada por el usuario zankich. El checkpoint reduce los pesos lineales del modelo base a INT4 con escala de grupo de 128 y simetria, mantiene las activaciones en bfloat16 y anade una cache KV calibrada en FP8 E4M3. El resultado ocupa 7,3 GB en cuatro shards, frente a los aproximadamente 24 GB del modelo en bfloat16, lo que permite servir el modelo en GPUs Ampere y anteriores a SM100 con vLLM.

La relevancia de esta ficha es practica: no se trata de un modelo nuevo, sino de un artefacto de despliegue. El autor documenta con detalle las dos rutas de servicio (solo texto con FlashInfer y multimodal con Triton), las limitaciones de cada backend y una advertencia critica sobre el uso de la cache KV en bfloat16. Para quien quiera ejecutar Gemma 4 12B en hardware consumer o en GPUs de generacion anterior, este checkpoint es una opcion directa, siempre que se respeten las condiciones de calibracion.

El modelo base es un transformer unificado con capacidades de texto, vision y audio, identificado en Hugging Face con la arquitectura `gemma4_unified` y el pipeline `any-to-any`. La licencia declarada en el repositorio es Apache 2.0, aunque la model card enlaza a la licencia especifica de Gemma 4 de Google, lo que conviene verificar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer `gemma4_unified` (modelo base); cuantizacion W4A16 con cache KV FP8 |
| Parametros totales | 2.507.432.688 segun safetensors del checkpoint cuantizado; el modelo base se denomina 12B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | INT4 group-128 simetrico, weight-only GPTQ; activaciones bfloat16; KV cache FP8 E4M3 con escalas estaticas por tensor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 en el repositorio; enlace a la licencia de Gemma 4 de Google |
| Formato de pesos | safetensors en formato `compressed-tensors` (`pack-quantized`), 4 shards, 7,3 GB |

## Arquitectura y entrenamiento

El checkpoint cuantiza el modelo base `google/gemma-4-12B-it`, un transformer unificado con atencion multimodal. La arquitectura del modelo base combina dos geometrias de atencion: 40 capas de ventana deslizante con 8 cabezas KV y `head_dim` de 256, y 8 capas de atencion completa multi-query con 1 cabeza KV y `head_dim` de 512. Esta mezcla es relevante para la cuantizacion porque cada capa necesita sus propias escalas de cache KV.

La cuantizacion se genero con llm-compressor 0.13.0 y un parche personalizado de `compressed_tensors` 0.18.0. Se aplico `GPTQModifier` con esquema W4A16, `dampening_frac` de 0,2 y `kv_cache_scheme` en FP8 simetrico estatico por tensor, calibrado en las mismas pasadas forward que los pesos GPTQ. Se cuantizaron todas las proyecciones `Linear` de atencion y FFN en ambas geometrias. Se mantuvieron en bfloat16 el `lm_head`, los embeddings de texto y las proyecciones de embedding de audio y vision. El checkpoint no incluye torres de vision ni audio, solo las proyecciones de embedding, por lo que no hay torres que preservar. No se dispone de informacion sobre el dataset de calibracion ni sobre el proceso de entrenamiento del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento conversacional, heredados del modelo base instruct.
- Procesamiento de imagenes: la ruta Triton responde a entradas visuales; el autor verifico forma y color correctos en una imagen sintetica.
- Procesamiento de audio: la ruta Triton transcribe voz; el autor reporta aproximadamente 80-85 % de precision por palabra en un clip de 20 segundos con acento.
- Modo de razonamiento (`enable_thinking`) configurable por peticion mediante `chat_template_kwargs`.
- Soporte de tool calling y agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Servicio solo texto con FlashInfer y `--language-model-only`, sin vision ni audio.
- Servicio multimodal completo con backend Triton y `--kv-cache-dtype fp8_e5m2`.

## Casos de uso

- Despliegue de Gemma 4 12B en GPUs Ampere: el checkpoint reduce el peso de 24 GB a 7,3 GB, lo que permite servir el modelo en tarjetas de 24 GB o menos con vLLM y el fork `zankich/vllm`. Es el escenario principal para el que se construyo el artefacto.
- Asistente conversacional de solo texto en produccion: con FlashInfer y `--language-model-only` se obtiene la configuracion con escalas E4M3 calibradas, la ruta recomendada por el autor para texto.
- Transcripcion de audio: con la ruta Triton y `enable_thinking: false` a nivel de peticion, el modelo transcribe clips de voz. El autor advierte que con thinking activado la transcripcion se consume dentro del canal de razonamiento.
- Analisis de imagenes: la ruta Triton acepta imagenes de hasta 2496 tokens de encoder; util para preguntas y respuestas sobre capturas o documentos visuales, con `--max-num-batched-tokens` superior a 2496.
- Analisis de audio con razonamiento: peticiones de analisis (no transcripcion literal) funcionan con thinking activado, segun la model card.
- Evaluacion de cuantizacion en pipelines de investigacion: el checkpoint sirve para medir el impacto de W4A16 mas KV FP8 frente al modelo base en tareas de texto, vision y audio, con la salvedad de que el autor no ha hecho comparacion a nivel de logprobs contra E4M3 en la ruta Triton.
- Prototipado en una sola GPU: el tamano de 7,3 GB y el formato `compressed-tensors` autodetectado por vLLM facilitan arrancar un servidor OpenAI-compatible con el imagen Docker `zankich/vllm-openai:latest`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas equivalentes. El unico dato empirico reportado es cualitativo: transcripcion de un clip de 20 segundos con aproximadamente 80-85 % de precision por palabra en la ruta Triton con KV E5M2, y respuesta correcta de forma y color en una imagen sintetica.

## Requisitos de hardware

- VRAM estimada: el checkpoint pesa 7,3 GB; hay que sumar la cache KV FP8 y el overhead de vLLM. No se proporciona una cifra exacta de VRAM en la informacion disponible.
- GPUs objetivo: Ampere y anteriores a SM100 requieren el fork `zankich/vllm` o la imagen `zankich/vllm-openai:latest`. En SM100 o superior, vLLM estandar sirve el checkpoint sin parches.
- Cabe en GPU consumer: si, por el tamano de 7,3 GB; no se especifican modelos concretos de consumer en la informacion proporcionada.
- Despliegue: vLLM con imagen Docker `zankich/vllm-openai:latest`. No se mencionan llama.cpp, Ollama ni TGI.
- Backends de atencion: FlashInfer para solo texto; Triton (`TRITON_ATTN`) para multimodal. Triton no puede compilar E4M3 por debajo de SM89, por lo que usa E5M2 en la cache KV.
- Restriccion de arranque multimodal: `--max-num-batched-tokens` debe superar 2496, porque una imagen ocupa 2496 tokens de encoder.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `zankich/gemma-4-12B-it-W4A16-FP8KV` | 2.507.432.688 en safetensors del checkpoint; base denominado 12B | no disponible | W4A16 + KV FP8 E4M3 | Apache 2.0 (con enlace a licencia Gemma 4) | Hugging Face, 48 descargas, 0 likes |
| `google/gemma-4-12B-it` | 12B (denominacion) | no disponible | bfloat16 | licencia Gemma 4 | Hugging Face, modelo base |
| Otras cuantizaciones de Gemma 4 12B | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

La comparativa directa con alternativas de la misma categoria no esta disponible en la informacion proporcionada. El unico contraste documentado es con el modelo base en bfloat16, que ocupa aproximadamente 24 GB frente a los 7,3 GB del checkpoint.

## Limitaciones y advertencias

- La cache KV debe servirse con las escalas FP8 calibradas. Con KV en bfloat16 la generacion se corrompe de forma silenciosa: la salida greedy degenera en basura y las pruebas estructuradas fallan sin mensajes en los logs. Las escalas son parte del contrato del checkpoint, no una opcion de ajuste.
- La ruta Triton usa E5M2 en la cache KV porque no puede compilar E4M3 por debajo de SM89; esto duplica aproximadamente el ruido de cuantizacion por elemento respecto a E4M3.
- El autor no ha realizado comparacion a nivel de logprobs entre la ruta E4M3 y la ruta E5M2.
- FlashInfer no soporta la atencion multimodal de `Gemma4Unified`; en esa ruta hay que usar `--language-model-only` y se pierden vision y audio.
- Con thinking activado, las peticiones de transcripcion literal tienden a transcribir dentro del canal de razonamiento y agotan el presupuesto de tokens antes de producir contenido; hay que desactivar thinking a nivel de peticion.
- En GPUs anteriores a SM100 es obligatorio usar el fork `zankich/vllm` o la imagen Docker del autor; vLLM estandar no sirve el checkpoint en ese hardware.
- La licencia del repositorio declara Apache 2.0, pero la model card enlaza a la licencia de Gemma 4 de Google; conviene verificar las condiciones reales de uso comercial del modelo base.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion, idiomas soportados ni longitud de contexto en la informacion proporcionada.
- El checkpoint tiene 48 descargas y 0 likes; es un artefacto reciente y con poca validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zankich/gemma-4-12B-it-W4A16-FP8KV
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- llm-compressor: https://github.com/vllm-project/llm-compressor
- Fork de vLLM del autor: https://github.com/zankich/vllm
- Imagen Docker: https://hub.docker.com/r/zankich/vllm-openai/tags
