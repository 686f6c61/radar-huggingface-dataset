# yar3333/Qwen2.5-72B-Instruct-abliterated-v2-W4A16-G32

## Resumen

Qwen2.5-72B-Instruct-abliterated-v2-W4A16-G32 es una cuantizacion INT4 de pesos con activaciones en FP16 (esquema W4A16) del modelo zetasepic/Qwen2.5-72B-Instruct-abliterated-v2, una variante "abliterated" (con las direcciones de rechazo suprimidas mediante edicion de pesos) del Qwen2.5-72B-Instruct de Alibaba. El autor de la cuantizacion es yar3333, que la publica en formato compressed-tensors con grupo de cuantizacion de tamano 32 y simetria, manteniendo el `lm_head` en bf16. El resultado ocupa unos 42 GB repartidos en 6 shards de safetensors, lo que permite servir un modelo denso de 72.7 mil millones de parametros en 4 GPU de 24 GB con contexto de 32K.

La relevancia de esta ficha es doble. Por un lado, demuestra una ruta de cuantizacion practica para modelos densos de gran tamano en hardware AMD RDNA3 (gfx1100), donde ni FP8 ni INT8 estan soportados por vLLM en la version verificada, dejando W4A16 como unica via viable. Por otro, el uso de group_size 32 en lugar del clasico 128 resuelve un problema concreto de tensor parallelism: con `intermediate_size=29568`, el grupo de 128 no divide correctamente las particiones en TP=4, mientras que el de 32 si lo hace para TP en {1, 2, 4}.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5 con 72.706.203.648 parametros, ventana de contexto nativa de 32.768 tokens y licencia Tongyi Qianwen 1.0. Al estar "abliterated", los filtros de rechazo del modelo original han sido atenuados, lo que cambia radicalmente el perfil de uso y las consideraciones de seguridad en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), cuantizacion compressed-tensors W4A16 |
| Parametros totales | 72.706.203.648 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (verificado en despliegue con `--max-model-len 32768`) |
| Tipos de cuantizacion | INT4 con group_size 32, simetrica, pack-quantized; activaciones FP16; `lm_head` en bf16 |
| Idiomas soportados | no disponible en la model card; el autor verifica salidas en ingles y ruso |
| Licencia | Tongyi Qianwen 1.0 (etiquetada como `other` en HuggingFace) |
| Formato de pesos | safetensors (6 shards, ~42 GB), formato compressed-tensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-72B-Instruct: un transformer decoder-only denso con atencion por causalidad estandar, `intermediate_size=29568` y el resto de hiperparametros propios de la familia Qwen2.5. Sobre ese modelo, zetasepic aplico una tecnica de "abliteration" (supresion de direcciones de rechazo en el espacio de activaciones o pesos) y publico la version v2 con una correccion de tokenizer. Esta ficha cubre exclusivamente la cuantizacion posterior realizada por yar3333, no el proceso de abliteration en si, cuyos detalles remite el autor al repositorio original.

La cuantizacion se genero con llm-compressor sobre ROCm, usando una ruta puramente PyTorch porque los kernels CUDA de autoawq no compilan en ROCm. El pipeline aplica AWQModifier (duo scaling y busqueda de escalas consciente de activaciones) sobre 64 muestras de `HuggingFaceH4/ultrachat_200k` con longitud de secuencia 512, seguido de QuantizationModifier en modo pack. No hay entrenamiento adicional ni fine-tuning: es una calibracion post-entrenamiento. La innovacion tecnica destacable es la eleccion de group_size 32 para garantizar compatibilidad con tensor parallelism en vLLM, y la inclusion de un workaround de `malloc_trim` por modulo en `scripts/save_resumable.py` para evitar swap thrashing al empaquetar un modelo de 72B en un host de 128 GB.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen2.5-72B-Instruct.
- Razonamiento, matematicas y generacion de codigo propias de un modelo de 72B de la familia Qwen2.5.
- Respuestas sin los filtros de rechazo habituales del modelo original, al estar abliterated.
- Soporte multilingue heredado de Qwen2.5; el autor verifica explicitamente salidas en ingles y ruso.
- Compatibilidad con text-generation-inference y con el tag `endpoints_compatible` de HuggingFace.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, agentes, vision ni audio en esta variante cuantizada; se asume herencia del modelo base pero no esta verificado.
- No dispone de cabeza MTP (multi-token prediction), segun indica el autor, por lo que no hay decodificacion especulativa nativa.

## Casos de uso

- Despliegue de un modelo de 72B en 4 GPU de 24 GB: la cuantizacion W4A16 con group 32 permite servir el modelo completo en 4x24 GB con KV cache amplia, algo inviable con pesos FP16 (que requeririan ~145 GB solo para pesos).
- Inferencia en hardware AMD RDNA3: en gfx1100 con vLLM 0.32.0, FP8 e INT8 no estan soportados; esta es la ruta practica para servir modelos densos grandes en RX 7900 XTX.
- Investigacion sobre abliteration y seguridad de modelos: permite estudiar el comportamiento de un modelo con filtros de rechazo suprimidos sin necesidad de infraestructura de 8xH100.
- Generacion de contenido creativo sin restricciones tematicas: el perfil abliterated encaja en tareas de escritura donde los filtros del modelo original resultan limitantes, siempre con revision humana.
- Evaluacion comparativa de calidad de cuantizacion: util para medir la degradacion de un 72B al pasar a INT4 group 32 frente al modelo original en tareas de razonamiento y codigo.
- Procesamiento de documentos largos: con 32K tokens de contexto verificado y sin degradacion de decode en prompts largos (40.2 tok/s con prompt de 2511 tokens), es adecuado para resumen y analisis de documentos extensos.
- Fine-tuning o experimentacion en laboratorio con presupuesto de VRAM limitado: el formato compressed-tensors es compatible con el ecosistema vLLM y transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor solo reporta metricas de inferencia medidas con llm-bench en vLLM 0.32.0+rocm723 sobre 4x AMD RX 7900 XTX (gfx1100), sin MTP:

| Prompt | TTFT | Prefill | Generacion |
|---|---|---|---|
| Corto (39 tokens) | 1,08 s | 36,3 tok/s | 40,3 tok/s |
| Largo (2511 tokens) | 3,24 s | 774,5 tok/s | 40,2 tok/s |

No se observa degradacion del decode con prompts mas largos. No hay datos de throughput agregado con multiples peticiones concurrentes.

## Requisitos de hardware

- VRAM estimada: ~42 GB para pesos INT4, mas KV cache. Con 4x24 GB (96 GB totales) hay margen para contexto de 32K o superior.
- Configuracion verificada: 4x AMD RX 7900 XTX (24 GB cada una, gfx1100), tensor-parallel-size 4.
- GPU recomendadas: 4x RTX 4090 (24 GB), 4x RX 7900 XTX, o alternativas con al menos 24 GB por unidad. En NVIDIA, 2x A100 80 GB o 1x H100 80 GB deberian ser suficientes por capacidad, aunque no estan verificadas en la model card.
- No cabe en una unica GPU de consumo de 24 GB.
- Despliegue verificado con vLLM 0.32.0+rocm723, `--quantization compressed-tensors` y `--attention-backend ROCM_SEGMENTED_ATTN`.
- Latencia y throughput medidos: TTFT de 1,08 s (prompt corto) y 3,24 s (prompt de 2511 tokens); generacion estable en ~40 tok/s.
- En ROCm/gfx1100, FP8 e INT8 no estan soportados en vLLM 0.32.0; W4A16 es la unica ruta de cuantizacion para modelos densos de este tamano.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yar3333/Qwen2.5-72B-Instruct-abliterated-v2-W4A16-G32 | 72,7B | 32.768 | INT4 W4A16 group 32 | Tongyi Qianwen 1.0 | HuggingFace, 136 descargas |
| zetasepic/Qwen2.5-72B-Instruct-abliterated-v2 (base) | 72,7B | 32.768 | FP16/BF16 | Tongyi Qianwen 1.0 | HuggingFace |
| Qwen2.5-72B-Instruct (original) | 72,7B | 32.768 | FP16/BF16, AWQ, GPTQ | Tongyi Qianwen 1.0 | HuggingFace, ampliamente desplegado |

La ventaja diferencial de esta variante es el group_size 32, que permite tensor parallelism en TP=4 con vLLM alli donde el group_size 128 clasico falla. Frente al modelo base sin cuantizar, reduce el footprint de pesos de ~145 GB a ~42 GB a costa de una perdida de precision no cuantificada en la informacion disponible.

## Limitaciones y advertencias

- Modelo abliterated: los filtros de rechazo han sido suprimidos, por lo que puede generar contenido que el Qwen2.5-72B-Instruct original rechazaria. Requiere moderacion externa en cualquier despliegue publico.
- Riesgo de alucinacion propio de un modelo de 72B sin garantias adicionales; la cuantizacion INT4 puede incrementarlo ligeramente, aunque no hay mediciones publicadas.
- No hay datos de benchmarks de calidad que permitan cuantificar la degradacion respecto al modelo original.
- Idiomas soportados no documentados en la model card; solo se verifica ingles y ruso.
- Licencia Tongyi Qianwen 1.0: revisar las condiciones de uso comercial antes de desplegar, ya que impone restricciones especificas y no es una licencia permisiva tipo Apache o MIT.
- El tag de licencia en HuggingFace es `other` con `license_name: tongyi-qianwen-1.0`; conviene consultar el archivo LICENSE del repositorio.
- Despliegue verificado unicamente en ROCm/gfx1100 con vLLM 0.32.0; el comportamiento en CUDA no esta documentado en la model card.
- Sin cabeza MTP, no hay decodificacion especulativa nativa, lo que limita el throughput en comparacion con modelos que si la incorporan.
- El repositorio tiene 0 likes y 136 descargas, lo que indica poca validacion comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yar3333/Qwen2.5-72B-Instruct-abliterated-v2-W4A16-G32
- Modelo base abliterated: https://huggingface.co/zetasepic/Qwen2.5-72B-Instruct-abliterated-v2
- llm-compressor (herramienta de cuantizacion): https://github.com/vllm-project/llm-compressor
- Dataset de calibracion: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
