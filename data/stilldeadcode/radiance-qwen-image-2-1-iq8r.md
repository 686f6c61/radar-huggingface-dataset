# StillDeadcode/radiance-qwen-image-2.1-iq8r

## Resumen

Radiance Qwen Image 2.1 IQ8R es un contenedor de inferencia cuantizado del modelo Qwen/Qwen-Image-2.1, un modelo de generación de imágenes texto-a-imagen y edición de imágenes desarrollado originalmente por el equipo Qwen de Alibaba. Este contenedor lo publica el usuario StillDeadcode y empaqueta el modelo completo en un único fichero `.rad` de 16,13 GiB, pensado para el motor de inferencia radiance sobre GPUs AMD con arquitectura RDNA4 y ROCm. Incluye la red de condicionamiento Qwen3-VL-8B con su torre de visión, el transformer de difusión de 7,1B de parámetros y el VAE con soporte RGBA.

La relevancia de esta ficha no está en el modelo base, sino en la técnica de cuantización: los pesos lineales se codifican en int8 con rotación Hadamard (transformada FWHT de 128 bloques) y escalas por fila, con activaciones también int8 (esquema W8A8). El autor reporta una fidelidad sensiblemente superior al contenedor FP8 previo del mismo modelo, medido en PSNR frente al contenedor bf16 de referencia, con un coste de latencia prácticamente idéntico.

Se trata de un artefacto orientado a despliegue en hardware AMD Radeon, con licencia de investigación no comercial heredada de Qwen, y con una dependencia estricta de una versión de radiance posterior a la 1.17.0. No es un modelo entrenado desde cero ni un fine-tune de capacidades: es una recodificación de pesos del checkpoint original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) con red de condicionamiento Qwen3-VL-8B (incluye torre de visión) y VAE RGBA |
| Parametros totales | 7,1B en el transformer de difusión, más la red de condicionamiento Qwen3-VL-8B (total agregado no disponible) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (códigos −127..127) con escala u8 por fila y escala bf16 cada 256 de K; activaciones int8 (W8A8); torre de visión, lineales pequeñas, normas y VAE en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Research License Agreement (no comercial) |
| Formato de pesos | contenedor `.rad` (radiance); fichero `qwen-image-2.1-iq8r.rad` de 16,13 GiB |
| Pasos de inferencia por defecto | 40 (`num_inference_steps`, o `quality`: low / medium / high) |
| Resolución por defecto | `auto` = 2048x2048 |

## Arquitectura y entrenamiento

El modelo base Qwen-Image-2.1 combina tres componentes: una red de condicionamiento basada en Qwen3-VL-8B que incluye torre de visión, un transformer de difusión de 7,1B de parámetros y un VAE con soporte de canal alfa (RGBA). La arquitectura es por tanto un pipeline de difusión condicionado por un modelo de visión-lenguaje, lo que habilita tanto la generación texto-a-imagen como la edición a partir de imágenes de referencia y máscaras.

Sobre el entrenamiento del modelo base no se proporciona información en la documentación disponible: no se detallan el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO. Lo que sí está documentado es el proceso de cuantización de este contenedor, generado con la herramienta `rad-convert` y una receta explícita (`qwen-image-2.1-iq8r.recipe`). La receta aplica cuantización RTN (round to nearest) a las capas `attn_qkv`, `attn_output`, `ffn_gate_up` y `ffn_down` de los bloques del transformer de difusión (`dit.blk.*`) y de la red de condicionamiento (`te.blk.*`), con códigos int8, grupo de 256, escala u8 y segunda escala bf16, transformación FWHT de 128 (Hadamard no normalizada), recorte simétrico y búsqueda de regla. Todo lo no nombrado en la receta conserva el dtype original del checkpoint; el VAE se castea explícitamente a bf16. La innovación técnica central es la rotación Hadamard aplicada cada 128 elementos de K, que reduce los valores atípicos y permite mantener ocho bits por peso con menor degradación que una cuantización FP8 convencional.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) mediante la API de imágenes de OpenAI.
- Edición de imágenes: acepta de 1 a 10 imágenes de referencia y una máscara, a través de `POST /v1/images/edits`.
- Soporte de fondo transparente (`background: transparent`) gracias al VAE RGBA.
- Generación por lotes con el parámetro `n` y control de semilla con `seed`.
- Selección de tamaño mediante `size` en formato `WxH` o `auto` (2048x2048 por defecto).
- Generación en streaming mediante `partial_images`.
- Salida en `b64_json` con formatos png, jpeg o webp.
- Perfiles de calidad predefinidos (`quality`: low / medium / high) que ajustan el número de pasos.
- Servido con paralelismo de tensor (`tp: 1` o `tp: 2`) en GPUs AMD RDNA4.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio.

## Casos de uso

- Generación de ilustraciones para producto o marketing: el modelo produce imágenes de hasta 2048x2048 con 40 pasos por defecto, adecuado para material gráfico de campañas donde se requiere resolución alta y control de semilla para reproducibilidad.
- Edición iterativa con referencias múltiples: al aceptar hasta 10 imágenes de entrada más máscara, permite flujos de retoque localizado (cambio de fondo, sustitución de objetos) manteniendo la identidad visual de las referencias.
- Creación de assets con transparencia: la salida RGBA con `background: transparent` encaja en pipelines de diseño que necesitan recortes limpios para composición posterior en herramientas gráficas.
- Prototipado rápido en estaciones de trabajo AMD: con latencias de 10,5 s por imagen 1024x1024 a 20 pasos en una Radeon AI PRO R9700, es viable para iteración interactiva en equipos con GPU RDNA4 sin depender de CUDA.
- Despliegue en servidor compatible con SDK de OpenAI: al implementar `/v1/images/generations` y `/v1/images/edits`, se puede integrar como backend sustituto en aplicaciones ya construidas sobre el SDK de OpenAI sin reescribir el cliente.
- Generación por lotes en producción con dos GPUs: el modo `tp: 2` reduce el tiempo por imagen a 6,8 s (1024x1024, 20 pasos), útil para colas de trabajo que priorizan throughput sobre latencia individual.
- Investigación en cuantización: sirve como referencia reproducible para estudiar el impacto de la rotación Hadamard y el esquema W8A8 en la calidad perceptual de modelos de difusión, dado que el autor publica la receta y las métricas PSNR frente a bf16 y FP8.

## Benchmarks y rendimiento

| Metrica | IQ8R (1 GPU) | IQ8R (2 GPU) | FP8 (1 GPU) | FP8 (2 GPU) |
|---|---|---|---|---|
| Tiempo por imagen 1024x1024, 20 pasos (s) | 10,5 | 6,8 | 10,2 | 6,6 |
| PSNR frente a bf16 (dB) | 32,6 | 34,1 | 28,1 | 28,6 |

Medido en Radeon AI PRO R9700 (gfx1201). El PSNR se calcula sobre cuatro imágenes de 1024x1024 a 20 pasos generadas desde el mismo ruido inicial. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo que es esperable al tratarse de un modelo de generación de imágenes.

## Requisitos de hardware

- VRAM estimada: el fichero de pesos ocupa 16,13 GiB; con activaciones int8 y overhead del runtime, se requiere previsiblemente una GPU con al menos 24 GB para `tp: 1`, aunque el dato exacto de VRAM en ejecución no está disponible.
- GPU objetivo: AMD RDNA4 con ROCm; el rendimiento reportado se midió en Radeon AI PRO R9700 (gfx1201).
- Configuración multi-GPU: soporta `tp: 2` para repartir el modelo entre dos tarjetas y reducir latencia.
- GPUs consumer: no se confirma compatibilidad con GPUs consumer AMD; el motor radiance está orientado a RDNA4 y ROCm, por lo que no se contempla CUDA ni GPUs NVIDIA en esta documentación.
- Despliegue: motor radiance compilado desde main posterior a la versión 1.17.0 (la funcionalidad IQ8R con una escala cada 256 de K no está en 1.17.0). Se configura mediante `radiance.yaml` y se arranca con `radiance --config radiance.yaml`.
- API expuesta: endpoints compatibles con OpenAI Images (`/v1/images/generations`, `/v1/images/edits`, `/v1/models`).
- Latencia y throughput: 10,5 s por imagen 1024x1024 a 20 pasos en una R9700; 6,8 s con dos. No se documenta throughput agregado en imágenes por segundo para lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Radiance Qwen Image 2.1 IQ8R (este) | 7,1B DiT + Qwen3-VL-8B | no disponible | Qwen Research (no comercial) | `.rad` | int8 W8A8 con rotación Hadamard; PSNR 32,6/34,1 dB frente a bf16 |
| Radiance Qwen Image 2.1 FP8 | 7,1B DiT + Qwen3-VL-8B | no disponible | Qwen Research (no comercial) | `.rad` | FP8; PSNR 28,1/28,6 dB; 10,2/6,6 s por imagen |
| Qwen/Qwen-Image-2.1 (bf16 original) | 7,1B DiT + Qwen3-VL-8B | no disponible | Qwen Research (no comercial) | safetensors / diffusers | Referencia de calidad; mayor huella de memoria |

No se dispone de datos de benchmarks ni de especificaciones de modelos de terceros comparables en la información proporcionada, por lo que la comparación se limita a las variantes del mismo modelo base documentadas por el autor.

## Limitaciones y advertencias

- Licencia no comercial: el modelo base se distribuye bajo Qwen Research License Agreement; este contenedor es una copia modificada y hereda la restricción. El uso comercial requiere licencia aparte de Qwen.
- Dependencia de versión: requiere radiance compilado desde main posterior a 1.17.0; con la 1.17.0 el esquema IQ8R no funciona.
- Compatibilidad de hardware restringida: diseñado para AMD RDNA4 con ROCm; no hay soporte documentado para CUDA, NVIDIA ni GPUs consumer AMD.
- Cuantización con pérdida: aunque el PSNR es alto (32,6–34,1 dB frente a bf16), no es una reproducción exacta; pueden aparecer diferencias sutiles en texturas finas o detalles de alta frecuencia.
- Idiomas soportados no documentados: se desconoce si las instrucciones de edición o los prompts funcionan igual en castellano que en inglés.
- Riesgo de alucinación visual: como todo modelo generativo de imágenes, puede producir elementos incoherentes, texto ilegible o anatomías incorrectas, especialmente en resoluciones altas o composiciones complejas.
- Sesgos: no se documentan evaluaciones de sesgo demográfico, estético o cultural para el modelo base ni para esta variante.
- Formato propietario: el contenedor `.rad` no es portable a otros motores de inferencia; no se puede cargar directamente con diffusers, vLLM o llama.cpp.
- `response_format: url` no está soportado; solo `b64_json`.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/StillDeadcode/radiance-qwen-image-2.1-iq8r
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Contenedor FP8 previo: https://huggingface.co/StillDeadcode/radiance-qwen-image-2.1-fp8
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
- Licencia (Qwen Research License Agreement): fichero `LICENSE` en el repositorio
- Atribución: fichero `NOTICE` en el repositorio
- Receta de cuantización: `qwen-image-2.1-iq8r.recipe` en el repositorio
