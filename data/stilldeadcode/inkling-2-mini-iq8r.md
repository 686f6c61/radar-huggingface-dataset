# StillDeadcode/inkling-2-mini-iq8r

## Resumen

Inkling 2 Mini IQ8R es una cuantización int8 del modelo multimodal Inkling-2-Mini de Thinking Machines, empaquetada como un único contenedor `.rad` de 26,14 GiB para el motor de inferencia radiance, orientado a GPUs AMD RDNA4 (gfx1201) sobre ROCm. No es un modelo nuevo: es una redistribución del checkpoint base con los 128 expertos enrutados de sus 24 capas, la atención y la cabeza de salida convertidos a int8 en el dominio de Hadamard, con activaciones también int8 (W8A8). El resultado es un artefacto listo para servir en hardware AMD de consumo profesional, algo poco habitual en el ecosistema.

La relevancia es doble. Por un lado, demuestra que es viable comprimir a int8 un MoE multimodal con pérdida de calidad muy contenida: el KL medio frente a la forma original del release es de 0,0042 y la perplejidad pasa de 2,884 a 2,893 sobre 115.522 posiciones. Por otro, incluye el drafter DSpark del release para decodificación especulativa, lo que eleva el throughput hasta 479 tok/s en código con ocho streams sobre dos Radeon AI PRO R9700.

El modelo conserva la torre de visión en bf16 para peticiones de imagen en chat, soporta tool calling y razonamiento a través de la API compatible con OpenAI del servidor radiance, y mantiene la licencia Apache 2.0 del modelo base. El contexto configurado en el ejemplo de despliegue es de 200.000 tokens con caché KV en int8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (transformer con 24 capas, 128 expertos enrutados por capa) + torre de visión de 23 bloques + drafter DSpark |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 200.000 tokens (configuración de referencia del servidor) |
| Tipos de cuantizacion | int8 W8A8 en dominio de Hadamard (expertos, atención, cabeza y activaciones); torre de visión en bf16; embedding en bf16; caché KV int8 |
| Idiomas soportados | no disponible (la evaluación de calidad cubre inglés, alemán y código) |
| Licencia | Apache 2.0 (con política de uso aceptable del modelo base) |
| Formato de pesos | `.rad` (contenedor propietario del motor radiance), 26,14 GiB |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini es un MoE con 24 capas y 128 expertos enrutados por capa, con atención que incluye proyecciones q, k, v, r y una puerta de salida. La cuantización IQ8R convierte esos cinco lineales de atención, los expertos, la cabeza `lm_head` y las activaciones a int8 sobre una rejilla rotada por la transformada de Hadamard no normalizada, con una escala bf16 por fila y por grupo de 128 en la dimensión K. El redondeo es round-to-nearest con búsqueda de escala. El release original mezcla capas 0–19 en NVFP4 y 20–23 en MXFP8; ambas se dequantizan de forma exacta y se redondean una sola vez, de modo que el resultado es el modelo del release salvo por el error de redondeo int8.

El paquete incluye además el drafter DSpark del release (`mtp.safetensors`): tres capas densas que denoising un bloque de siete borradores seguido de una cabeza Markov recurrente, con sus lineales también en int8 rotado y una tabla de vocabulario plegada en int8 con escala por fila. La torre de visión de 23 bloques se mantiene en bf16. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO del modelo base en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento, incluyendo modo de razonamiento expuesto por la API del servidor.
- Generación de código, con rendimiento medido específicamente en prompts de código.
- Aritmética paso a paso, con throughput medido en la tabla de velocidad.
- Comprensión de imágenes: pipeline `image-text-to-text`, con partes `image_url` en mensajes de chat.
- Tool calling / function calling a través de la API compatible con OpenAI (`/v1/chat/completions`).
- Decodificación especulativa con drafter DSpark y ventana adaptativa (hasta 7 borradores).
- Capacidades multilingües: la evaluación de calidad cubre inglés y alemán, pero no hay lista oficial de idiomas.
- Servicio multi-stream (hasta 8 secuencias concurrentes en la configuración de referencia).

## Casos de uso

- Asistente de código en producción: con 166 tok/s en un stream y 479 tok/s en ocho streams sobre dos R9700, es adecuado para autocompletado y generación de parches en pipelines de CI/CD donde el throughput agregado importa más que la latencia individual.
- Atención al cliente multimodal: la ventana de 200.000 tokens y el soporte de `image_url` permiten gestionar conversaciones multi-turno con capturas de pantalla o documentos escaneados adjuntos.
- Agente con tool calling: la API compatible con OpenAI expone tool calls y razonamiento, lo que permite integrarlo en frameworks de agentes existentes sin adaptadores propietarios.
- Procesamiento por lotes de documentos largos: la caché KV en int8 y el contexto de 200K reducen el coste de memoria en tareas de resumen y extracción sobre documentos extensos.
- Despliegue en hardware AMD: es una de las pocas opciones cuantizadas a int8 con soporte explícito de RDNA4 y ROCm, útil para equipos con estaciones Radeon AI PRO R9700 que no quieren depender de CUDA.
- Inferencia en una sola tarjeta de 32 GB: con `tp: 1` sirve el modelo completo a 85,5 tok/s en ensayos y 107,8 tok/s en código, suficiente para prototipado y uso individual.
- Evaluación de cuantizaciones: el modo KL de radiance y las métricas publicadas lo convierten en una referencia útil para comparar recetas de cuantización sobre el mismo modelo base.

## Benchmarks y rendimiento

Calidad frente a la forma original del release (NVFP4 y MXFP8 en expertos, tronco bf16), modo KL de radiance sobre 97 documentos de inglés, alemán y código (115.522 posiciones):

| Metrica | Valor |
|---|---|
| KL medio | 0,0042 |
| KL mediana | 0,00037 |
| KL p99 | 0,052 |
| Acuerdo top-1 | 98,2 % |
| Perplejidad (referencia) | 2,893 (2,884) |

Throughput en 2× Radeon AI PRO R9700 (gfx1201), `tp: 2`, caché KV int8, contexto 200K, greedy, 400 tokens por petición:

| Prompts | Streams | Drafter adaptativo | Drafter fijo a 7 | Sin drafter |
|---|---|---|---|---|
| Ensayos | 1 | 125 | 104,5 | 104 |
| Ensayos | 4 | 266 | 210 | 251 |
| Ensayos | 8 | 391 | 313 | 373 |
| Código | 1 | 166 | 153,7 | no disponible |
| Código | 4 | 332 | 298 | no disponible |
| Código | 8 | 479 | 434 | no disponible |
| Aritmética paso a paso | 1 | 202,9 | 202,6 | no disponible |
| Aritmética paso a paso | 4 | 444 | 419 | no disponible |

En una sola tarjeta (`tp: 1`) con ventana adaptativa: 85,5 tok/s en ensayos a 1 stream y 169 a 4 (75,7 y 162 sin drafter); 107,8 y 207 en código.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el contenedor pesa 26,14 GiB; con caché KV int8 y contexto de 200K, el autor indica que cabe en una tarjeta de 32 GB con `tp: 1`.
- GPU recomendadas: 2× Radeon AI PRO R9700 (gfx1201) para la configuración de referencia con `tp: 2`; una sola R9700 de 32 GB para `tp: 1`.
- Cabe en GPU de consumo: sí, en GPUs AMD RDNA4 con 32 GB; no hay soporte indicado para GPUs NVIDIA ni para tarjetas de 24 GB o menos.
- Opciones de despliegue: exclusivamente el motor radiance (versión posterior a 2.2.0, necesaria para el drafter int8 y `markov_rnn_greedy_q8`), con servidor compatible con OpenAI. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tabla de la sección anterior; el autor señala que un verify recorre hasta 64 expertos distintos por capa, aproximadamente 1,7 pasos de token único por bloque de ocho, por lo que la ventana adaptativa supera al decodificado sin drafter en todas las cargas medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware |
|---|---|---|---|---|---|
| Inkling 2 Mini IQ8R | no disponible (MoE, 24 capas, 128 expertos) | 200.000 | int8 W8A8 en dominio de Hadamard | Apache 2.0 | AMD RDNA4 / ROCm |
| Inkling-2-Mini (base) | no disponible (MoE, 24 capas, 128 expertos) | no disponible | NVFP4 (capas 0–19) y MXFP8 (20–23) | Apache 2.0 | no disponible |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de otros autores en la documentación proporcionada.

## Limitaciones y advertencias

- Dependencia total del motor radiance: el formato `.rad` no es portable a vLLM, llama.cpp, Ollama ni TGI, y requiere una versión posterior a 2.2.0.
- Soporte limitado a AMD RDNA4 (gfx1201) sobre ROCm; no hay indicación de funcionamiento en NVIDIA, Apple Silicon ni CPUs.
- El redondeo int8 introduce una pérdida medible: 1,8 % de desacuerdo top-1 y p99 de KL de 0,052 frente al release original.
- La torre de visión se mantiene en bf16, por lo que las peticiones con imagen consumen más memoria que las de solo texto.
- No hay lista oficial de idiomas soportados; la evaluación de calidad solo cubre inglés, alemán y código, lo que deja sin verificar el comportamiento en castellano.
- Riesgo de alucinación y sesgos del modelo base no documentados en la información disponible.
- La licencia Apache 2.0 se hereda del modelo base, pero se aplica su política de uso aceptable, que puede restringir ciertos usos comerciales.
- El repositorio registra 0 descargas y 2 likes en el momento de la consulta, lo que indica validación comunitaria muy limitada.
- El rendimiento con drafter depende de la previsibilidad del texto: el autor advierte que verificar los siete borradores solo compensa cuando el texto es predecible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StillDeadcode/inkling-2-mini-iq8r
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
- Política de uso aceptable del modelo base: https://thinkingmachines.ai/model-acceptable-use-policy/
