# StillDeadcode/radiance-qwen-image-2.1-turbo-uncensored-iq8r

## Resumen

Radiance Qwen-Image 2.1 Turbo Uncensored IQ8R es un contenedor de pesos en formato `.rad` para el motor de inferencia radiance, orientado a GPUs AMD con arquitectura RDNA4 y ROCm. No se trata de un modelo nuevo entrenado desde cero, sino de una reempaquetación cuantizada de Qwen-Image 2.1 Turbo (modelo de difusión texto-a-imagen de Qwen) en la que el codificador de texto Qwen3-VL-8B ha sido sustituido por la versión abliterada de AtomicChat, que elimina las capas de rechazo del modelo lingüístico de condicionamiento.

El paquete cuantiza a int8 (W8A8) las capas lineales del codificador de texto y del transformer de difusión, aplicando una rotación Hadamard no normalizada sobre bloques de 128 elementos de la dimensión K y escalas en u8 por fila más una segunda escala bf16 cada 256 elementos de K. El vision tower, las capas lineales pequeñas, las normas y el VAE permanecen en bf16. El resultado es un único fichero de 16,13 GiB que sustituye al contenedor FP8 previo del mismo autor con el mismo número de bits por peso.

Su relevancia es doble: por un lado, demuestra una receta de cuantización int8 con rotación Hadamard aplicada a un pipeline de difusión completo; por otro, ofrece una vía de despliegue del pipeline Qwen-Image 2.1 Turbo en hardware AMD RDNA4 (Radeon AI PRO R9700) con latencias de 4,5 s por imagen a 1024x1024. La licencia Qwen Research limita el uso a fines no comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusión texto-a-imagen: transformer de difusión (DiT) + codificador de texto Qwen3-VL-8B abliterado + vision tower + VAE |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 W8A8 con rotación Hadamard (fwht128), escala u8 por fila + escala bf16 cada 256 de K, códigos −127..127, round-to-nearest; resto de componentes en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Research License Agreement (no comercial); el contenedor es una copia modificada |
| Formato de pesos | `.rad` (contenedor propietario del motor radiance); fichero de 16,13 GiB |
| Pasos de inferencia | 8 (fijados por el modelo) |
| Resolución por defecto | `auto` = 2048x2048 |
| Referencias de imagen en edición | 1 a 10 imágenes + máscara |
| Hardware objetivo | AMD RDNA4 con ROCm (p. ej. Radeon AI PRO R9700) |

## Arquitectura y entrenamiento

El pipeline subyacente es Qwen-Image 2.1 Turbo, un modelo de difusión texto-a-imagen con un transformer de difusión (DiT) de 36 bloques y un codificador de texto basado en Qwen3-VL-8B. La modificación introducida por AtomicChat afecta únicamente a la red de condicionamiento: reescribe los pesos `o_proj` y `down_proj` de las 36 capas del LM y el embedding de tokens mediante abliteración con escala 0.75. El transformer de difusión, el vision tower y el VAE son los del modelo Turbo original. No hay fine-tune "uncensored" del DiT en Hugging Face.

La cuantización de este contenedor aplica int8 simétrico con rotación Hadamard no normalizada (fwht128) sobre bloques de 128 elementos de K, con escala u8 por fila y una segunda escala bf16 cada 256 elementos de K, tanto a los pesos como a las activaciones (W8A8). Las capas afectadas son `attn_qkv`, `attn_output`, `ffn_gate_up` y `ffn_down` de los 36 bloques del codificador de texto y del DiT; el VAE se castea a bf16. El proceso de construcción extrae los 73 tensores divergentes del GGUF bf16 de AtomicChat vía HTTP range y los reindexa junto con los shards originales de Qwen antes de la conversión con `rad-convert`. No se dispone de información sobre el dataset de entrenamiento original de Qwen-Image 2.1 Turbo ni sobre si hubo RLHF/DPO.

## Capacidades

- Generación de imágenes texto-a-imagen con 8 pasos de inferencia fijos.
- Edición de imágenes con 1 a 10 imágenes de referencia y máscara opcional.
- Salida en PNG, JPEG o WebP codificada en `b64_json`.
- Generación por lotes mediante el parámetro `n`.
- Control de tamaño (`WxH` o `auto` = 2048x2048) y semilla (`seed`).
- Streaming de imágenes parciales mediante `partial_images`.
- Fondo transparente (`background: transparent`).
- API compatible con OpenAI Images: `POST /v1/images/generations` y `POST /v1/images/edits` (JSON o multipart).
- Codificador de texto abliterado: reduce los rechazos del LM de condicionamiento, aunque el pipeline original ya carece de filtro de contenido.
- No soporta `response_format: url` (solo `b64_json`).

## Casos de uso

- Generación de ilustraciones conceptuales en estudio: el modelo produce imágenes a 1024x1024 en 4,5 s sobre una Radeon AI PRO R9700, lo que permite iterar decenas de variantes por prompt en una sesión de trabajo.
- Edición guiada por máscara en flujos de retoque: la API `/v1/images/edits` acepta hasta 10 imágenes de referencia y una máscara, adecuada para sustituir regiones manteniendo coherencia con el resto del lienzo.
- Prototipado de assets para videojuegos o interfaces: la resolución `auto` de 2048x2048 y la salida en WebP permiten generar material listo para revisión sin postproceso adicional.
- Integración en pipelines de CI/CD de contenido: el servidor habla la API de imágenes de OpenAI, por lo que SDKs oficiales pueden apuntar al endpoint sin cambios de código.
- Investigación sobre cuantización int8 en difusión: el contenedor sirve como referencia reproducible de la receta IQ8R (rotación Hadamard + escalas dobles) frente al contenedor FP8 del mismo autor (25,7 dB PSNR medio entre ambos desde el mismo ruido).
- Despliegue en clústeres AMD: al ejecutarse sobre ROCm y RDNA4, cubre entornos donde no hay GPUs NVIDIA disponibles, con `tp: 2` para repartir el modelo entre dos tarjetas.
- Experimentación con modelos sin filtro de contenido en entornos controlados: útil para estudiar el efecto de la abliteración en el condicionamiento, dado que el autor reporta que ningún resultado visual cambió en 45 prompts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos cuantitativos aportados por el autor son métricas de fidelidad y latencia:

| Metrica | Valor |
|---|---|
| Latencia 1024x1024 en Radeon AI PRO R9700 | 4,5 s (contenedor FP8: 4,4 s) |
| PSNR medio vs contenedor FP8 (mismo ruido, 4 imágenes) | 25,7 dB (rango 19,6–33,2 dB) |
| PSNR del contenedor FP8 vs stock a 1024x1024 | 39,7 dB |
| PSNR de la receta IQ8R vs bf16 en Qwen-Image 2.1 | 32,6 dB (FP8: 28,1 dB) |
| Prompts sin cambio de resultado (prueba de AtomicChat) | 45 de 45 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el fichero de pesos ocupa 16,13 GiB, por lo que se requiere al menos esa cantidad más overhead de activaciones y VAE.
- GPU recomendadas: AMD Radeon AI PRO R9700 (RDNA4, ROCm); el autor reporta 4,5 s por imagen a 1024x1024 en una sola tarjeta.
- Configuración multi-GPU: `tp: 2` en `radiance.yaml` reparte el modelo entre dos tarjetas; `tp: 1` lo sirve en una sola.
- GPUs consumer: no disponible; el motor radiance está orientado a RDNA4 y ROCm, no se menciona soporte para GPUs NVIDIA ni para otras arquitecturas AMD.
- Despliegue: exclusivamente mediante el motor radiance (servidor con API compatible con OpenAI Images). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Versión mínima del motor: radiance compilado desde main posterior a 1.17.0 (IQ8R con una escala cada 256 de K no está en 1.17.0).
- Throughput: no disponible más allá de la latencia por imagen indicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware | Latencia 1024x1024 |
|---|---|---|---|---|---|---|
| Radiance Qwen-Image 2.1 Turbo Uncensored IQ8R | no disponible | no disponible | `.rad` int8 W8A8 | Qwen Research (no comercial) | AMD RDNA4 / ROCm | 4,5 s (R9700) |
| StillDeadcode/radiance-qwen-image-2.1-turbo-uncensored-fp8 | no disponible | no disponible | `.rad` FP8 | Qwen Research (no comercial) | AMD RDNA4 / ROCm | 4,4 s (R9700) |
| Qwen/Qwen-Image-2.1-Turbo (stock) | no disponible | no disponible | safetensors/diffusers | Qwen Research (no comercial) | no disponible | no disponible |
| AtomicChat/Qwen-Image-2.1-Turbo-Uncensored-GGUF | no disponible | no disponible | GGUF | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia Qwen Research: uso no comercial únicamente; cualquier despliegue comercial requiere autorización expresa de Qwen.
- El contenedor es una copia modificada del modelo original: incorpora la abliteración de AtomicChat y la recuantización int8, por lo que se distingue del stock y debe conservarse la atribución del `NOTICE`.
- La abliteración solo afecta al codificador de texto; el DiT no tiene fine-tune uncensored, y el pipeline original ya carece de filtro de contenido, por lo que el efecto práctico sobre las imágenes es pequeño según el propio autor.
- El modelo está etiquetado `not-for-all-anchored`/`not-for-all-audiences`: puede generar contenido no apto para todos los públicos; requiere moderación aguas abajo si se expone a usuarios finales.
- Fidelidad limitada frente a bf16: la receta IQ8R se queda en 32,6 dB PSNR frente a bf16 en Qwen-Image 2.1 (FP8: 28,1 dB), y frente al contenedor FP8 la diferencia media es de 25,7 dB, con un mínimo de 19,6 dB en una de las cuatro imágenes de prueba.
- Dependencia estricta del motor radiance y de su versión: requiere compilación desde main posterior a 1.17.0; no es portable a otros runtimes sin reconversión.
- Sin soporte de `response_format: url`; la integración debe manejar `b64_json`.
- Solo 8 pasos de inferencia fijos: no se documenta la posibilidad de ajustar el número de pasos.
- Idiomas soportados no documentados; el comportamiento multilingüe del codificador de texto tras la abliteración no está caracterizado.
- No hay datos publicados sobre sesgos, tasa de alucinación visual ni evaluación cualitativa independiente.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StillDeadcode/radiance-qwen-image-2.1-turbo-uncensored-iq8r
- Contenedor FP8 previo: https://huggingface.co/StillDeadcode/radiance-qwen-image-2.1-turbo-uncensored-fp8
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Modelo base abliterado: https://huggingface.co/AtomicChat/Qwen-Image-2.1-Turbo-Uncensored-GGUF
- Motor de inferencia radiance: https://codeberg.org/StillDeadcode/radiance
