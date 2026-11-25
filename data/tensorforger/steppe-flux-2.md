# TensorForger/Steppe-Flux.2

## Resumen

Steppe-Flux.2 es un modelo generativo de superresolución que opera directamente sobre el espacio latente del VAE de FLUX.2. Lo desarrolla TensorForger como parte de la familia Steppe, un conjunto de upscalers ligeros entrenados exclusivamente para ampliar la resolución de imágenes. A diferencia de las soluciones de "hires fix" tradicionales, el modelo no requiere un segundo pase de muestreo del modelo base ni un prompt: recibe el latente del VAE y devuelve un latente ampliado que se decodifica directamente.

El modelo se apoya en la arquitectura de flow matching y en el espacio latente compartido por FLUX.2 [dev], FLUX.2 [klein] (4B y 9B) y MOSS-Image. La versión principal ronda los 192M de parámetros, con una variante "lite" de 20,2M pensada para salidas de gran tamaño y uso en tiempo real. Todos los pesos se distribuyen en bfloat16 safetensors y la licencia es MIT.

Su relevancia actual radica en que ofrece un upscaling 2x en un solo paso (unos 40 ms de cómputo del modelo para una imagen de 1024 px en una RTX 5090) con una calidad cercana al límite de reconstrucción del VAE: patch FID de 1,75 frente a 8,12 de bicúbico. Está integrado en ComfyUI mediante el nodo ComfyUI-Steppe y disponible en ComfyUI-Manager.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo generativo de upscaling sobre latentes VAE (flow matching, condicionado por hff) |
| Parámetros totales | 192M (modelo base y 1-step); 20,2M (variante lite) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de imagen, no de texto) |
| Tipos de cuantización | bfloat16 (pesos oficiales); no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible (modelo de imagen) |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16, configuración en metadatos) |

## Arquitectura y entrenamiento

Steppe-Flux.2 es un modelo generativo pequeño entrenado únicamente para la tarea de upscaling. Trabaja sobre los latentes del VAE de FLUX.2 y produce un latente ampliado 2x que el VAE decodifica sin un segundo pase del modelo base. La arquitectura emplea flow matching con condicionamiento por una característica de alta frecuencia (hff), un parámetro entre 0 y 1 que controla la cantidad de detalle fino y nitidez de la salida. Los valores de hff son absolutos: se basan en una estimación de ruido de Immerkaer normalizada por cuantiles sobre fotos de ReLAION.

El entrenamiento incluye variantes destiladas de un solo paso (1-step) y un modelo base que admite entre 1 y 200 pasos. La guía (guidance) se implementa de forma distinta en cada variante: en los modelos 1-step es una entrada de guidance destilada, entrenada sobre valores de 1 a 2 sin coste adicional; en el modelo base se usa classifier-free guidance entre el hff y el hff nulo, con un coste de dos pasadas por paso. El modelo base se recomienda con 30 pasos Euler, sigma shift 2 y escala de ruido inicial 1,0. No se detalla en la información disponible el número de tokens ni la composición exacta del dataset de entrenamiento.

## Capacidades

- Upscaling 2x de imágenes sobre latentes del VAE de FLUX.2 (por ejemplo, 512 → 1024 o 1024 → 2048), con encadenamiento 2x → 2x.
- Generación en un solo paso: aproximadamente 40 ms de tiempo de modelo para una imagen de 1024 px con el modelo por defecto en una RTX 5090.
- Control de nitidez y detalle fino mediante el parámetro hff (0 a 1, por defecto 0,9; -1 deja que el modelo decida).
- Compatibilidad nativa con FLUX.2 [dev], FLUX.2 [klein] 4B/9B (destilado y base) y MOSS-Image (decodificador pequeño).
- Compatibilidad con el decodificador pequeño TAEF2 (madebyollin/taef2) del VAE de FLUX.2.
- Integración en ComfyUI mediante el nodo ComfyUI-Steppe, con flujo `KSampler → Steppe Upscale Latent → VAE Decode`.
- Solo imágenes: no incluye upscaling temporal (fotogramas por segundo), a diferencia de los modelos Steppe para Wan 2.1.

## Casos de uso

- Mejora de resolución en pipelines de generación de imágenes: tras muestrear con FLUX.2 [dev] o [klein], se aplica Steppe sobre el latente resultante para duplicar la resolución sin un segundo pase del modelo base, reduciendo coste computacional.
- Producción de material gráfico a alta resolución: partiendo de latentes de 512 px se obtienen salidas de 1024 px con patch FID de 1,75, adecuado para impresión web y catálogos.
- Uso en tiempo real dentro de ComfyUI: la variante de 20,2M con decodificador TAEF2 completa el pipeline en unos 19 ms, lo que permite upscaling interactivo en flujos de trabajo con previsualización.
- Investigación sobre upscaling latente: el modelo base con control de pasos, CFG sobre hff y sampler configurable (30 pasos Euler, shift 2) sirve para estudiar el equilibrio entre calidad y coste.
- Restauración y ampliación de imágenes existentes: al operar sobre latentes del VAE de FLUX.2, se integra en flujos image-to-image para ampliar imágenes ya codificadas.
- Encadenado de ampliaciones: la capacidad 2x → 2x permite generar salidas de muy alta resolución en dos etapas manteniendo el control de nitidez mediante hff.
- Despliegue con requisitos de VRAM ajustados: la variante lite con TAEF2 requiere 0,7 GB de VRAM pico, lo que facilita su uso en GPUs de gama media.

## Benchmarks y rendimiento

Evaluación sobre 1000 fotos (Axis-V1), de 512 → 1024, con solo el latente de FLUX.2 como entrada (sin prompt ni hff). Patch FID sobre teselas nativas de 256 px (menor es mejor); latencia con batch 1, decodificación VAE incluida, RTX 5090, bfloat16 eager.

| Solución | Patch FID | FID | Latencia | VRAM pico |
|---|---|---|---|---|
| Steppe 200M base, 30 pasos | 1,72 | 1,95 | 1671 ms | 3,0 GB |
| Steppe 200M 1-step | 1,75 | 2,02 | 172 ms | 3,0 GB |
| Steppe 20M 1-step | 2,20 | 2,63 | 131 ms | 2,6 GB |
| Steppe 200M 1-step + TAEF2 | 3,22 | 4,55 | 60 ms | 1,0 GB |
| Steppe 20M 1-step + TAEF2 | 3,81 | 5,17 | 19 ms | 0,7 GB |
| FlowUpscaler (modelo FLUX.2 previo) | 4,28 | 4,50 | 128 ms | 2,7 GB |
| SPAN 2x tras decodificar | 6,18 | 3,67 | 30 ms | 0,8 GB |
| SesquiLSR FLUX.2 (latente) | 7,71 | 7,26 | 124 ms | 2,6 GB |
| Bicúbico tras decodificar | 8,12 | 1,77 | 25 ms | 0,8 GB |
| Real-ESRGAN x2 tras decodificar | 9,03 | 7,99 | 53 ms | 0,8 GB |
| VOSR 1.4B (SR por difusión, un paso) | 25,88 | 15,83 | 595 ms | 9,2 GB |

El límite de reconstrucción del VAE sobre este conjunto es patch FID 0,71. El error de color de ida y vuelta (ΔE00) es 1,82 frente a 1,74 de bicúbico. En una comparación con un LoRA upscaler de FLUX.2 [klein] 9B (Hildegard, 4 pasos, unos 7 s por imagen) sobre 30 imágenes, este añade detalle plausible pero se aleja del original.

## Requisitos de hardware

- VRAM estimada: 3,0 GB pico para el modelo de 200M (base y 1-step); 2,6 GB para el de 20M; 1,0 GB y 0,7 GB respectivamente con el decodificador TAEF2.
- GPU recomendadas: RTX 5090 para las cifras de latencia publicadas; cualquier GPU con al menos 3 GB de VRAM libre para el modelo de 200M.
- Cabe en GPU de consumo: sí, con 3 GB de VRAM para el modelo principal y menos de 1 GB con TAEF2.
- Opciones de despliegue: ComfyUI mediante ComfyUI-Steppe (disponible en ComfyUI-Manager); los ficheros también pueden instalarse manualmente en `ComfyUI/models/latent_upscale_models`.
- Latencia y throughput: 1671 ms con el modelo base de 30 pasos; 172 ms con el 1-step de 200M; 131 ms con el 20M; 60 ms y 19 ms con TAEF2 respectivamente (batch 1, RTX 5090, decodificación VAE incluida).

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | Patch FID | Latencia | Licencia |
|---|---|---|---|---|---|
| Steppe-Flux.2 200M 1-step | 192M | Latente FLUX.2, 1 paso | 1,75 | 172 ms | MIT |
| FlowUpscaler | No disponible | Latente FLUX.2 | 4,28 | 128 ms | No disponible |
| SesquiLSR FLUX.2 | No disponible | Latente FLUX.2 (hires fix) | 7,71 | 124 ms | No disponible |
| VOSR 1.4B | 1,4B | SR por difusión, un paso | 25,88 | 595 ms | No disponible |
| Real-ESRGAN x2 | No disponible | SR tras decodificar | 9,03 | 53 ms | No disponible |

## Limitaciones y advertencias

- Solo admite el VAE de FLUX.2; no es compatible con FLUX.1, Wan, Qwen-Image, SD3, SDXL ni otros VAE (para Wan 2.1 existe Steppe-Wan2.1).
- No realiza upscaling temporal: únicamente imágenes, sin ampliación de fotogramas por segundo.
- El soporte de FLUX.2 en ComfyUI requiere ComfyUI-Steppe 1.1.0 (rama flux2-support), que según la model card aún no estaba publicada en el momento de redactarla.
- El error de color de ida y vuelta (ΔE00 1,82) es ligeramente superior al de bicúbico (1,74), lo que puede introducir desviaciones de color sutiles.
- Con decodificador TAEF2 la calidad cae de forma notable (patch FID 3,22 frente a 1,75), por lo que su uso implica un compromiso entre velocidad y fidelidad.
- No se documentan sesgos específicos ni tasas de alucinación; al ser un modelo de upscaling, el riesgo principal es la invención de detalle plausible que no está en la imagen original.
- Licencia MIT, sin restricciones conocidas para uso comercial.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, y la model card contiene varios TODO pendientes de completar (hero card, pruebas en ComfyUI).

## Enlaces

- Hugging Face: https://huggingface.co/TensorForger/Steppe-Flux.2
- Repositorio de nodos ComfyUI-Steppe: https://github.com/TensorForger/ComfyUI-Steppe
- Modelo base FLUX.2 [dev]: https://huggingface.co/black-forest-labs/FLUX.2-dev
- Modelo base FLUX.2 [klein] 4B: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Modelo base FLUX.2 [klein] 9B: https://huggingface.co/black-forest-labs/FLUX.2-klein-9B
- Modelo base FLUX.2 [klein] base 4B: https://huggingface.co/black-forest-labs/FLUX.2-klein-base-4B
- Modelo base FLUX.2 [klein] base 9B: https://huggingface.co/black-forest-labs/FLUX.2-klein-base-9B
- Modelo base MOSS-Image SFT: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Modelo base MOSS-Image Base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Decodificador TAEF2: https://huggingface.co/madebyollin/taef2
- Steppe para Wan 2.1: https://huggingface.co/TensorForger/Steppe-Wan2.1
