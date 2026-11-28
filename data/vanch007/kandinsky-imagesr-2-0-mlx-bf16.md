# vanch007/Kandinsky-ImageSR-2.0-mlx-bf16

## Resumen

Kandinsky-ImageSR-2.0-mlx-bf16 es una conversion nativa a MLX del modelo de superresolucion de imagen Kandinsky-ImageSR-2.0, desarrollado originalmente por el equipo de Kandinsky Lab (Sber). Esta version, publicada por el usuario vanch007, reempaqueta los pesos en formato nativo de MLX (safetensors con pesos VAE en NHWC) para ejecutarse exclusivamente sobre Apple Silicon, sin dependencia de PyTorch ni del runtime de Diffusers.

El modelo resuelve la tarea de superresolucion de imagen (image-to-image) con factores de escalado configurables (x2 y x4) y un parametro de creatividad que controla el grado de regeneracion de detalle. Combina un transformer completo en bfloat16 (~10,2 GB) con un VAE de 16 canales compatible con FLUX (~0,17 GB), alcanzando un checkpoint total de 10,43 GB.

Su relevancia radica en ofrecer una via de inferencia local eficiente en Macs con chip de la serie M, con paridad numerica practicamente exacta respecto a la referencia en PyTorch (coseno 0,9999981, PSNR 59,28 dB, SSIM 0,999740 para x4 de 256 a 1024 px). Es una opcion practica para flujos de trabajo de restauracion y escalado de imagenes en entornos Apple sin GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (image-to-image) con VAE de 16 canales compatible con FLUX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | bf16 (esta version); variantes 8bit (g64) y 4bit (g64) en repos separados |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de texto) |
| Licencia | MIT (el VAE FLUX incluido sigue Apache-2.0 de black-forest-labs/FLUX.1-schnell) |
| Formato de pesos | safetensors nativo MLX (VAE en NHWC, transformer preconvertido) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo original Kandinsky-ImageSR-2.0 de Kandinsky Lab: un transformer de difusion para superresolucion condicionada por imagen de entrada, acoplado a un VAE de 16 canales compatible con FLUX. Esta conversion MLX mantiene el transformer completo en bfloat16 (~10,2 GB) y aplica fp32 en la modulacion AdaLN, tablas de condicionamiento precalculadas y computo VAE con `force_upcast=true` para preservar la fidelidad numerica.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens o imagenes, ni sobre si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. La innovacion tecnica destacable de esta version es la eliminacion total del runtime de PyTorch y Diffusers, sustituido por MLX, con pesos VAE reorganizados a NHWC y un pipeline de tiles para procesar resoluciones altas con memoria controlada.

## Capacidades

- Superresolucion de imagen con factores de escalado x2 y x4.
- Parametro de creatividad ajustable (por ejemplo, `creativity=4`) que controla el grado de regeneracion de detalle fino.
- Procesamiento por tiles con `tile_batch_size` configurable para resoluciones de salida grandes (hasta 4096x4096 en las pruebas publicadas).
- Inferencia nativa en Apple Silicon mediante MLX, sin PyTorch ni Diffusers.
- Interfaz de linea de comandos (`mlx-kandinsky-sr`) y API Python (`KandinskyImageSRPipeline`).
- No dispone de capacidades de texto, razonamiento, codigo, tool calling ni agentes; es exclusivamente un modelo de imagen.

## Casos de uso

- Restauracion y escalado de retratos y fotografias: partiendo de una imagen de 256x256 se puede generar una salida de 1024x1024 (x4) con detalle regenerado, util para archivos fotograficos antiguos o de baja resolucion.
- Preparacion de assets para impresion o pantallas de alta densidad: escalar imagenes de 1024x1024 a 4096x4096 (x4) para carteleria, fondos de escritorio o materiales de marketing.
- Mejora de miniaturas y previews en pipelines de contenido: ampliar imagenes pequenas generadas por otros modelos antes de su publicacion.
- Postprocesado de salidas de modelos generativos: aumentar la resolucion de imagenes sinteticas de baja dimension manteniendo coherencia estructural.
- Flujos de trabajo locales en Mac: estudios y desarrolladores que trabajan en Apple Silicon pueden integrar el escalado en scripts de procesamiento por lotes sin GPU dedicada.
- Restauracion de material de archivo digitalizado: escalar capturas o escaneos de baja resolucion con control del nivel de creatividad para evitar artefactos no deseados.

## Benchmarks y rendimiento

Paridad con la referencia en PyTorch (x4, 256 a 1024 px):

| Metrica | Valor |
|---|---|
| Similitud coseno | 0,9999981 |
| PSNR | 59,28 dB |
| SSIM | 0,999740 |

Rendimiento medido en Apple M3 Max (128 GB), MLX 0.32.5, `vae_dtype=float32`, `tile_batch_size=1`:

| Resolucion | Escalado | Rejilla de tiles | Tiempo total | Por tile | RAM Metal maxima |
|---|---|---|---|---|---|
| 512x512 a 2048x2048 | x4 | 3x3 (9) | 133,65 s | 14,85 s | 19,06 GB |
| 1024x1024 a 2048x2048 | x2 | 3x3 (9) | 121,19 s | 13,46 s | 19,12 GB |
| 1024x1024 a 4096x4096 | x4 | 5x5 (25) | 408,54 s | 16,34 s | 19,91 GB |

No se han publicado resultados de benchmarks comparativos con otros modelos de superresolucion en la informacion disponible.

## Requisitos de hardware

- VRAM (memoria unificada) estimada: 19-20 GB en Metal para las resoluciones probadas con el checkpoint bf16; el autor recomienda 32 GB o mas de memoria unificada para maxima fidelidad.
- Variantes con menor huella: 8bit (~6,7 GB, recomendada para Macs de 24 GB o mas) y 4bit (~4,6 GB, para Macs de 16 GB o mas).
- Hardware: exclusivamente Apple Silicon (probado en M3 Max de 128 GB); no es compatible con GPUs NVIDIA ni CUDA.
- Despliegue: MLX mediante el paquete `mlx-kandinsky-imagesr-2` (CLI y API Python). No soporta vLLM, llama.cpp, Ollama ni TGI.
- Latencia: entre 121 y 409 segundos por imagen segun resolucion y factor de escalado en M3 Max; el throughput depende del numero de tiles.

## Comparativa con modelos similares

| Modelo | Tipo | Escalado | Licencia | Plataforma | Disponibilidad |
|---|---|---|---|---|---|
| Kandinsky-ImageSR-2.0-mlx-bf16 | Transformer de difusion + VAE | x2, x4 | MIT (VAE Apache-2.0) | Apple Silicon (MLX) | Hugging Face |
| kandinskylab/Kandinsky-ImageSR-2.0 | Transformer de difusion + VAE | x2, x4 | MIT | PyTorch/CUDA | Hugging Face |
| vanch007/Kandinsky-ImageSR-2.0-mlx-8bit | Igual, cuantizado 8bit | x2, x4 | MIT | Apple Silicon (MLX) | Hugging Face |
| vanch007/Kandinsky-ImageSR-2.0-mlx-4bit | Igual, cuantizado 4bit | x2, x4 | MIT | Apple Silicon (MLX) | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros modelos de superresolucion (por ejemplo, Real-ESRGAN o SwinIR) en la informacion proporcionada.

## Limitaciones y advertencias

- Exclusivo para Apple Silicon: no funciona en GPUs NVIDIA, AMD ni en CPU convencional mediante MLX.
- Consumo de memoria elevado en bf16: requiere 32 GB o mas de memoria unificada para operar con comodidad en resoluciones altas.
- El parametro de creatividad puede introducir detalle inventado; conviene validar visualmente las salidas en usos donde la fidelidad sea critica.
- Riesgo de artefactos en bordes de tiles si no se ajusta adecuadamente la rejilla de procesamiento.
- No procesa texto ni instrucciones en lenguaje natural; no es un modelo multimodal.
- Licencia MIT para el modelo, pero el VAE FLUX incluido esta sujeto a Apache-2.0 de black-forest-labs/FLUX.1-schnell; revisar ambas condiciones para uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion limitado.
- No se han publicado datos sobre sesgos del modelo original en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vanch007/Kandinsky-ImageSR-2.0-mlx-bf16
- Modelo base original: https://huggingface.co/kandinskylab/Kandinsky-ImageSR-2.0
- Repositorio del runtime MLX: https://github.com/vanch007/mlx-kandinsky-imagesr-2
- Variante 8bit: https://huggingface.co/vanch007/Kandinsky-ImageSR-2.0-mlx-8bit
- Variante 4bit: https://huggingface.co/vanch007/Kandinsky-ImageSR-2.0-mlx-4bit
- VAE FLUX de referencia: https://huggingface.co/black-forest-labs/FLUX.1-schnell
