# StillDeadcode/qwen3.6-35b-a3b-iq8r

## Resumen

Qwen3.6-35B-A3B IQ8R es una cuantizacion en int8 del checkpoint bf16 de Qwen/Qwen3.6-35B-A3B, publicada por el desarrollador independiente StillDeadcode como un unico contenedor `.rad` para el motor de inferencia radiance, orientado a GPUs AMD RDNA4 sobre ROCm. No es un modelo nuevo: es un artefacto de despliegue que preserva la torre de vision, la cabeza MTP para decodificacion especulativa y el esquema de mezcla de expertos del modelo original, comprimiendo pesos y activaciones a 8 bits en el dominio de Hadamard (W8A8).

El modelo base es un transformer con mezcla de expertos (MoE) de 35.000 millones de parametros totales y aproximadamente 3.000 millones activos por token, con 256 expertos enrutados por capa, un experto compartido y una longitud de contexto entrenada de 262.144 tokens. La cuantizacion mantiene esa ventana completa y anade un cache KV en int8 con escala f16 por token y cabeza, lo que permite servir el modelo completo en dos tarjetas de 32 GB.

Su relevancia es practica: ofrece una alternativa al checkpoint FP8 oficial de Qwen para hardware AMD RDNA4, con el mismo numero de bits por peso pero activaciones int8, y con mediciones publicadas de throughput y calidad de respuesta frente al contenedor FP8. El repositorio ocupa 37,6 GB y el fichero de pesos 35,04 GiB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion y capas delta-net (SSM hibrido), torre de vision de 27 bloques y cabeza MTP |
| Parametros totales | 35B (aproximado, segun nombre del modelo base) |
| Parametros activos | ~3B (aproximado, segun nombre del modelo base) |
| Longitud de contexto | 262.144 tokens entrenados; `max-model-len` de ejemplo en 200.000 |
| Tipos de cuantizacion | int8 W8A8 en dominio Hadamard (fwht128), escalas u8/bf16 por fila, grupos de 256 y 128 de K; cabeza MTP en 2 bits (u2) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Contenedor `.rad` (radiance); no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base combina atencion con capas delta-net (componente de espacio de estados) y una capa MoE con 256 expertos enrutados mas un experto compartido por bloque. La cuantizacion actua sobre todas las lineales de atencion y delta-net del tronco, incluida la capa MTP: cada matriz se rota con una transformada de Hadamard no normalizada por bloques de 128 de K, se redondea al mas cercano y se codifica en int8 con rango simetrico -127..127, con una escala u8 por fila y 256 de K bajo una segunda escala bf16. Los expertos enrutados usan int8 sobre la misma rejilla rotada con escala bf16 por fila y grupos de 128 de K; el experto compartido sigue el mismo esquema. Las activaciones tambien son int8 bajo la misma rotacion (W8A8), y los expertos enrutados leen los codigos que escriben los cuantizadores del tronco. La cabeza de salida (`lm_head`) va en int8 con escala bf16 por fila y grupos de 128, mientras que la torre de vision de 27 bloques se conserva en bf16.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base dentro de la informacion proporcionada. La innovacion tecnica del artefacto es la cuantizacion en el dominio de Hadamard con busqueda de regla (`rule=search`) y el uso de la cabeza MTP del propio modelo para decodificacion especulativa, con un borrador de 2 bits sobre una copia del `lm_head`.

## Capacidades

- Generacion de texto y razonamiento multirround con contexto largo de hasta 262.144 tokens.
- Procesamiento de imagen y video en peticiones de chat (`image_url` y `video_url`), gracias a la torre de vision de 27 bloques en bf16.
- Tool calling y function calling a traves de la API compatible con OpenAI del servidor radiance.
- Salida estructurada (structured output).
- Razonamiento multi-paso y flujos de agente, apoyados por la decodificacion especulativa MTP.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking: no disponible en la informacion proporcionada.
- Soporte de audio: no disponible.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno con contexto de hasta 200.000 tokens en la configuracion de ejemplo, suficiente para arrastrar historial extenso, documentos de producto y politicas sin truncar.
- Analisis de documentos largos con imagenes: al aceptar `image_url` en los mensajes, permite extraer y razonar sobre tablas, capturas y diagramas incrustados en informes extensos en una sola llamada.
- Generacion de codigo en produccion: el soporte de tool calling y salida estructurada permite integrarlo en pipelines de CI/CD para revision de parches, generacion de tests o resumen de diffs, con respuestas en formato JSON validable.
- Agentes autonomos multi-paso: la cabeza MTP y la decodificacion especulativa reducen la latencia por paso, lo que hace viable encadenar decenas de llamadas a herramientas en tareas de orquestacion.
- Procesamiento de video para moderacion o catalogacion: la torre de vision acepta `video_url`, lo que habilita clasificacion y descripcion de clips dentro de un flujo de chat.
- Despliegue on-premise en hardware AMD: al caber en dos Radeon AI PRO R9700 de 32 GB con `tp: 2`, es adecuado para entornos con ROCm y requisitos de soberania de datos, sin depender de GPUs NVIDIA.
- Servicio de inferencia con API OpenAI: el servidor radiance expone `/v1/chat/completions` y `/v1/completions`, lo que permite sustituir un backend OpenAI por este contenedor sin reescribir clientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor publica mediciones de serving comparadas con el contenedor FP8, sobre 2x Radeon AI PRO R9700 (gfx1201, `tp: 2`, contexto 32K, cache KV int8), intercaladas dos veces:

| Metrica | Este fichero (IQ8R) | qwen3.6-35b-a3b-fp8 |
|---|---|---|
| Tokens por paso especulativo, 24 prompts de chat | 10,39 / 10,40 | 10,20 / 10,31 |
| ms por paso de decodificacion sin MTP, 1 secuencia | 10,3 | 10,2 |
| ms por paso de decodificacion sin MTP, 4 secuencias | 11,8 | 11,6 |
| ms por paso de decodificacion sin MTP, 8 secuencias | 12,4 | 12,2 |

En pruebas cualitativas con prompts de 28 a 4.018 tokens terminados en la misma pregunta, la respuesta fue correcta en todas las longitudes, igual que con el contenedor FP8, sin errores del motor. No se midio divergencia KL frente al modelo bf16.

## Requisitos de hardware

- VRAM estimada: el fichero pesa 35,04 GiB; el modelo completo cabe en dos tarjetas de 32 GB con `tp: 2`.
- GPUs recomendadas: 2x Radeon AI PRO R9700 (gfx1201, RDNA4) con ROCm, configuracion validada por el autor.
- Cabe en GPU de consumo: no disponible; el autor solo documenta el despliegue en dos Radeon AI PRO R9700.
- Opciones de despliegue: exclusivamente el motor radiance (compilado desde main posterior a 1.17.0, ya que el build `qwen35moe_w8a8` no esta en 1.17.0). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 10,3 ms por paso de decodificacion con 1 secuencia, 11,8 ms con 4 y 12,4 ms con 8, sin MTP; 10,39-10,40 tokens por paso especulativo en 24 prompts de chat.
- Cache KV: `kv-cache-dtype: i8`, almacenado como int8 con escala f16 por token y cabeza.
- Parametros de serving de ejemplo: `max-model-len: 200000`, `max-num-seqs: 8`, `tp: 2`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware | Formato |
|---|---|---|---|---|---|---|
| StillDeadcode/qwen3.6-35b-a3b-iq8r | 35B totales, ~3B activos | 262.144 | int8 W8A8 en dominio Hadamard | Apache 2.0 | AMD RDNA4 (ROCm), 2x 32 GB | `.rad` |
| StillDeadcode/qwen3.6-35b-a3b-fp8 | 35B totales, ~3B activos | no disponible | FP8 (checkpoint de Qwen) | Apache 2.0 | AMD RDNA4 (ROCm) | `.rad` |
| Qwen/Qwen3.6-35B-A3B | 35B totales, ~3B activos | 262.144 | bf16 | Apache 2.0 | Multiples | safetensors |

El contenedor FP8 es la alternativa directa: mismos 8 bits por peso, pero con activaciones en punto flotante; el IQ8R anade activaciones int8 y un rendimiento medido ligeramente superior en tokens por paso especulativo (10,39-10,40 frente a 10,20-10,31) y practicamente identico en latencia de decodificacion. El checkpoint bf16 original sirve como referencia de calidad, aunque no se ha publicado la divergencia KL de esta cuantizacion frente a el.

## Limitaciones y advertencias

- No se ha medido divergencia KL frente al modelo bf16, por lo que la degradacion de calidad de la cuantizacion int8 no esta cuantificada mas alla de las pruebas cualitativas del autor.
- Requiere una version de radiance posterior a 1.17.0 compilada desde main; el build `qwen35moe_w8a8` no esta incluido en la release 1.17.0.
- Dependencia de hardware muy especifica: solo se ha validado en GPUs AMD RDNA4 (gfx1201) con ROCm. No hay soporte documentado para CUDA, NVIDIA ni otros backends.
- El formato `.rad` es propietario del motor radiance; no es portable a vLLM, llama.cpp, Ollama o TGI.
- El modelo base esta entrenado para 262.144 tokens, pero la configuracion de ejemplo limita `max-model-len` a 200.000; superar ese valor requiere ajustar la configuracion y vigilar la VRAM.
- Riesgo de alucinacion y sesgos: no disponible en la informacion proporcionada; aplican los del modelo base Qwen3.6-35B-A3B, no documentados aqui.
- Idiomas soportados no disponibles; no se puede confirmar cobertura multilingue mas alla de la del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el autor remite a `LICENSE` en el repositorio; conviene verificar los terminos del modelo base Qwen.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/StillDeadcode/qwen3.6-35b-a3b-iq8r
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Contenedor FP8 alternativo: https://huggingface.co/StillDeadcode/qwen3.6-35b-a3b-fp8
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
