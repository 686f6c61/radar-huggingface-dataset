# StillDeadcode/radiance-qwen-image-2.1-turbo-iq8r

## Resumen

Radiance Qwen-Image 2.1 Turbo IQ8R es un contenedor de inferencia cuantizado del modelo de generacion de imagen Qwen-Image 2.1 Turbo, publicado por el desarrollador independiente StillDeadcode. No se trata de un modelo nuevo, sino de una re-encodeacion de los pesos del checkpoint original de Qwen en formato `.rad`, disenado especificamente para el motor de inferencia radiance sobre GPUs AMD con arquitectura RDNA4 y el stack ROCm. El modelo base es la destilacion a 8 pasos de Qwen-Image 2.1, que cubre tanto text-to-image como edicion de imagen.

La relevancia de esta publicacion es fundamentalmente de infraestructura: demuestra una receta de cuantizacion int8 (W8A8) con rotacion Hadamard sobre los lineales del transformer de difusion y del codificador de texto Qwen3-VL-8B, manteniendo en bf16 la torre de vision, las normas y el VAE. El contenedor ocupa 16,13 GiB y sustituye a la version FP8 previa del mismo autor, con la misma profundidad de bits por peso.

El modelo esta pensado para despliegues en hardware AMD consumer y profesional (Radeon AI PRO R9700, gfx1201), un nicho tradicionalmente mal cubierto por los motores de inferencia orientados a CUDA. Su interes para desarrolladores e investigadores radica en la posibilidad de servir generacion y edicion de imagenes con la API de Images de OpenAI sobre GPUs RDNA4, aunque con la restriccion de licencia no comercial del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) con codificador de texto Qwen3-VL-8B y VAE; destilacion a 8 pasos |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 W8A8 (codigos i8, escala u8 por fila, segunda escala bf16 cada 256 de K, rotacion Hadamard fwht128); torre de vision, lineales pequenos, normas y VAE en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Research License Agreement (no comercial) |
| Formato de pesos | `.rad` (contenedor propietario del motor radiance) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen-Image 2.1 Turbo, una destilacion a 8 pasos fijos de Qwen-Image 2.1. La arquitectura combina un codificador de texto Qwen3-VL-8B que produce las condicionales, un transformer de difusion que genera el latente y un VAE que decodifica la imagen final. El turbo fija el numero de pasos de inferencia en 8, de modo que el motor rechaza cualquier `num_inference_steps` distinto en la peticion.

Esta publicacion no entrena ni ajusta el modelo: re-encodea los pesos originales. La receta de cuantizacion aplica cuantizacion por redondeo al mas cercano (RTN) con grupo de 256, codigos int8 en el rango -127..127, escala u8 por fila y una segunda escala bf16 cada 256 elementos de K, precedida de una rotacion Hadamard no normalizada de 128 elementos. Los lineales afectados son `attn_qkv`, `attn_output`, `ffn_gate_up` y `ffn_down` tanto del codificador de texto (`te.blk.*`) como del transformer de difusion (`dit.blk.*`). Las activaciones se cuantizan tambien a int8 bajo la misma rotacion (esquema W8A8). El codificador de texto se tomo de Qwen/Qwen-Image-2.1, que comparte esos pesos byte a byte con el release Turbo. La herramienta de conversion es `rad-convert` con la receta `qwen-image-2.1-iq8r.recipe`.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) mediante la API de Images de OpenAI.
- Edicion de imagenes con 1 a 10 imagenes de referencia y mascara opcional (`/v1/images/edits`).
- Salida en PNG, JPEG o WebP codificada en `b64_json`.
- Parametros de generacion: `n`, `size` (formato `WxH` o `auto`, que equivale a 2048x2048), `seed` y `background: transparent`.
- Generacion en streaming mediante `partial_images`.
- Destilacion a 8 pasos fijos, orientada a baja latencia.
- Servidor compatible con la API de Images de OpenAI, incluyendo SDKs oficiales.
- Endpoint `/v1/models` para descubrimiento del modelo.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso, por tratarse de un modelo de generacion de imagen.

## Casos de uso

- Generacion de imagenes en produccion sobre GPUs AMD RDNA4: el contenedor permite servir text-to-image con la API de Images de OpenAI en hardware Radeon, sin depender de CUDA, con un throughput de 4,3 segundos por imagen de 1024x1024 en una Radeon AI PRO R9700.
- Edicion de imagenes por lotes: el endpoint `/v1/images/edits` acepta hasta 10 imagenes de referencia y mascara, lo que permite flujos de retoque, inpainting o composicion controlada dentro de un pipeline automatizado.
- Prototipado de productos creativos: la compatibilidad con los SDKs de OpenAI reduce el esfuerzo de integracion, ya que el cliente existente apunta al servidor radiance cambiando solo la URL base.
- Generacion con transparencia: el parametro `background: transparent` habilita la creacion de assets con canal alfa para interfaces, videojuegos o composicion grafica.
- Iteracion visual en streaming: `partial_images` permite mostrar previsualizaciones progresivas en herramientas de diseno o demos interactivas, mejorando la percepcion de latencia.
- Evaluacion de cuantizacion int8 frente a FP8: investigadores pueden comparar ambas variantes del mismo autor con la misma semilla y medir la degradacion (26,3 dB de PSNR medio entre ambas en las cuatro imagenes de prueba del autor).
- Despliegue multi-GPU en un solo nodo: la configuracion `tp: 2` reparte el modelo entre dos tarjetas, util para entornos con varias Radeon AI PRO R9700 y requisitos de memoria ajustados.

## Benchmarks y rendimiento

| Metrica | IQ8R (este contenedor) | FP8 (contenedor previo) |
|---|---|---|
| Latencia por imagen 1024x1024 en Radeon AI PRO R9700 | 4,3 s | 4,2 s |
| PSNR medio frente a FP8 (4 imagenes de prueba, misma semilla) | 26,3 dB (rango 23,2-31,9) | referencia |
| PSNR frente a bf16 en Qwen-Image 2.1 (misma receta) | 32,6 dB | 28,1 dB |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, al tratarse de un modelo de generacion de imagen. El autor indica que no se ha medido frente a un contenedor bf16 de este mismo modelo.

## Requisitos de hardware

- VRAM estimada: el contenedor pesa 16,13 GiB; con overhead de activaciones y VAE en bf16, se recomienda al menos 20-24 GB de VRAM por tarjeta para `tp: 1`.
- GPU objetivo: AMD RDNA4 (gfx1201), con Radeon AI PRO R9700 como referencia medida por el autor.
- Compatibilidad con GPUs consumer: no se documenta soporte para Radeon consumer de gama alta; el autor solo cita la R9700 profesional. No hay datos de funcionamiento en GPUs NVIDIA.
- Multi-GPU: soporta tensor parallelism con `tp: 2` para repartir el modelo entre dos tarjetas.
- Motor de despliegue: exclusivamente radiance (compilado desde main posterior a 1.17.0, ya que IQ8R con escala cada 256 de K no esta en 1.17.0). No hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 4,3 s por imagen de 1024x1024 en una Radeon AI PRO R9700 con `tp: 1`.
- Throughput: no disponible mas alla de la latencia por imagen citada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware |
|---|---|---|---|---|---|
| Radiance Qwen-Image 2.1 Turbo IQ8R | no disponible | no disponible | `.rad` int8 W8A8 | Qwen Research (no comercial) | AMD RDNA4 / ROCm |
| StillDeadcode/radiance-qwen-image-2.1-turbo-fp8 | no disponible | no disponible | `.rad` FP8 | Qwen Research (no comercial) | AMD RDNA4 / ROCm |
| Qwen/Qwen-Image-2.1-Turbo (original) | no disponible | no disponible | diffusers / safetensors | Qwen Research (no comercial) | GPU generica (CUDA/ROCm) |

La comparativa se limita a las variantes del mismo modelo base, ya que la informacion proporcionada no incluye otros modelos de generacion de imagen comparables. El contenedor IQ8R ofrece la misma profundidad de 8 bits que el FP8, con latencia practicamente identica (4,3 s frente a 4,2 s) y una fidelidad de 26,3 dB de PSNR respecto a este ultimo.

## Limitaciones y advertencias

- Licencia no comercial: el modelo base se distribuye bajo Qwen Research License Agreement, lo que impide el uso comercial del contenedor sin autorizacion adicional.
- Dependencia de un motor propietario: solo funciona con radiance, y requiere una version compilada desde main posterior a 1.17.0; no es compatible con ecosistemas estandar como diffusers, ComfyUI o vLLM.
- Hardware restringido: orientado a AMD RDNA4 con ROCm; no hay evidencia de funcionamiento en NVIDIA ni en generaciones anteriores de AMD.
- Pasos fijos: el modelo rechaza cualquier `num_inference_steps` distinto de 8, lo que limita el ajuste fino de calidad frente a velocidad.
- Perdida de fidelidad por cuantizacion: 26,3 dB de PSNR medio frente a FP8 en las pruebas del autor, con un minimo de 23,2 dB; no se ha comparado contra bf16.
- Sin datos de sesgo ni evaluaciones de seguridad: la model card no documenta sesgos conocidos, tasas de alucinacion visual ni evaluaciones de contenido.
- Idiomas soportados no documentados: se desconoce el rendimiento del codificador de texto en idiomas distintos del ingles.
- Formato de salida limitado: `response_format: url` es rechazado; solo se admite `b64_json`.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StillDeadcode/radiance-qwen-image-2.1-turbo-iq8r
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Codificador de texto original: https://huggingface.co/Qwen/Qwen-Image-2.1
- Contenedor FP8 previo: https://huggingface.co/StillDeadcode/radiance-qwen-image-2.1-turbo-fp8
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
