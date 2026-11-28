# vanch007/Kandinsky-ImageSR-2.0-mlx-4bit

## Resumen

Kandinsky-ImageSR-2.0-mlx-4bit es una conversion nativa al framework MLX de Apple del modelo de superresolucion de imagen Kandinsky-ImageSR-2.0, desarrollado originalmente por el equipo de Kandinsky Lab. La conversion la firma el usuario vanch007 y esta pensada para ejecutarse exclusivamente en Apple Silicon, sin dependencia de PyTorch ni del runtime de Diffusers. El modelo resuelve el problema de aumentar la resolucion de imagenes (hasta x4) preservando detalle fino, y su interes actual radica en que permite hacer superresolucion de calidad en Macs de consumo con memoria unificada moderada.

Tecnicamente es un transformer de difusion cuantizado en 4 bits (esquema affine, grupo de 64) para las capas de atencion y feed-forward, mientras que las modulaciones AdaLN y las tablas de condicionamiento se mantienen en fp32 para preservar la fidelidad. Incluye un VAE de 16 canales compatible con FLUX (licencia Apache-2.0) que se ejecuta con `force_upcast=true` en float32. El checkpoint completo ocupa 4,77 GB, lo que lo hace viable en equipos con 16 GB de memoria unificada o mas.

La relevancia de esta ficha es doble: por un lado documenta una variante de cuantizacion agresiva de un modelo de superresolucion de referencia; por otro, ilustra el ecosistema creciente de conversiones MLX que llevan pipelines de difusion a hardware Apple sin GPU dedicada. El autor reporta paridad casi exacta con la referencia PyTorch en la configuracion x4 (256 a 1024), con coseno de 0,9996 y PSNR de 36,31 dB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (image-to-image) con VAE de 16 canales compatible con FLUX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | 4 bits affine (grupo 64) en atencion y FFN; AdaLN, tablas de condicionamiento y VAE en fp32 |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de texto) |
| Licencia | MIT (VAE incluido bajo Apache-2.0 de FLUX.1-schnell) |
| Formato de pesos | safetensors nativo MLX (pesos VAE en NHWC y transformer preconvertido) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de difusion para superresolucion de imagen, derivado del modelo original Kandinsky-ImageSR-2.0 de Kandinsky Lab. Esta conversion no reentrena el modelo: toma los pesos originales y los transforma a formato MLX, cuantizando a 4 bits las capas de atencion y feed-forward con cuantizacion affine de grupo 64, y manteniendo en fp32 las modulaciones AdaLN, las tablas de condicionamiento precalculadas y el computo del VAE (con `force_upcast=true`). El VAE es un modelo de 16 canales compatible con FLUX, lo que facilita la integracion con el ecosistema de ese modelo.

No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens o imagenes, ni sobre si hubo etapas de RLHF o DPO (no aplicables en un modelo de superresolucion). La innovacion tecnica destacable de esta variante es la conversion completa a MLX con pesos en NHWC, eliminando cualquier dependencia de PyTorch o Diffusers en tiempo de ejecucion, y la estrategia de cuantizacion mixta que preserva la precision en las partes sensibles (modulacion y VAE) mientras comprime el grueso del transformer.

## Capacidades

- Superresolucion de imagen con factores de escala x2 y x4.
- Procesamiento por tiles (mosaicos) para resoluciones grandes, con `tile_batch_size` configurable.
- Control de "creatividad" mediante el parametro `creativity`, que ajusta el grado de generacion de detalle nuevo frente a la fidelidad al original.
- Entrada y salida en imagen (pipeline image-to-image); no procesa texto ni audio.
- Ejecucion nativa en Apple Silicon mediante MLX, sin runtime de PyTorch.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- Capacidades multilingues no aplicables.

## Casos de uso

- Restauracion y ampliacion de fotografias antiguas o de baja resolucion: el modelo puede tomar una imagen de 256x256 y generar una salida de 1024x1024 (x4) con detalle plausible, util en digitalizacion de archivos fotograficos.
- Preparacion de assets para impresion o pantallas de alta densidad: ampliar imagenes de 1024x1024 a 4096x4096 (x4) en un M3 Max en unos 387 segundos con rejilla de 25 tiles, adecuado para material grafico de marketing.
- Mejora de miniaturas y capturas en pipelines de publicacion web: integrable en un flujo por lotes en una Mac de estudio para reescalar imagenes antes de subirlas a un CMS.
- Preprocesado para modelos de vision posteriores: aumentar la resolucion de imagenes de entrada antes de pasarlas a un detector o segmentador que se beneficie de mas pixeles.
- Restauracion de fotogramas en edicion de video: aplicar superresolucion fotograma a fotograma en un Mac con memoria unificada suficiente, con procesamiento por tiles para resoluciones 4K.
- Prototipado e investigacion en entornos Apple: permite experimentar con un pipeline de difusion de superresolucion sin GPU NVIDIA, usando el repo `mlx-kandinsky-imagesr-2` como base para modificaciones.
- Uso en estaciones de trabajo con 16 GB de memoria unificada: la variante 4 bits es la unica del conjunto que cabe comodamente en esos equipos, lo que habilita superresolucion local en MacBook Air o Mac mini de gama base.

## Benchmarks y rendimiento

El autor publica mediciones de latencia y memoria en Apple M3 Max (128 GB), MLX 0.32.5, `vae_dtype=float32` y `tile_batch_size=1`:

| Resolucion | Escala | Rejilla de tiles | Tiempo (M3 Max) | Por tile | RAM Metal pico |
|---|---|---|---|---|---|
| 512x512 a 2048x2048 | x4 | 3x3 (9) | 135,10 s | 15,01 s | 15,71 GB |
| 1024x1024 a 2048x2048 | x2 | 3x3 (9) | 120,26 s | 13,36 s | 15,77 GB |
| 1024x1024 a 4096x4096 | x4 | 5x5 (25) | 386,88 s | 15,47 s | 15,77 GB |

Paridad con la referencia PyTorch en x4 (256 a 1024): coseno 0,9996446, PSNR 36,31 dB, SSIM 0,987985.

No se han publicado resultados de benchmarks estandar (como MMLU, HumanEval o GSM8K, no aplicables a un modelo de imagen) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el checkpoint ocupa 4,77 GB; en ejecucion, el pico de RAM Metal medido es de aproximadamente 15,7 GB con `tile_batch_size=1`.
- Memoria unificada recomendada: 16 GB o mas para la variante 4 bits (segun el autor); 24 GB o mas para la 8 bits; 32 GB o mas para la bf16.
- GPU: exclusivamente Apple Silicon (M1, M2, M3, M4 y posteriores) con soporte MLX. No funciona en GPUs NVIDIA ni AMD por la naturaleza del runtime.
- Cabe en equipos de consumo Apple: MacBook Air, Mac mini y MacBook Pro con 16 GB o mas de memoria unificada.
- Opciones de despliegue: exclusivamente el paquete `mlx-kandinsky-imagesr-2` (CLI y API Python). No hay soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: ver tabla de benchmarks; aproximadamente 13-15 s por tile de 512x512 en M3 Max, con escalado lineal respecto al numero de tiles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Escala | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kandinsky-ImageSR-2.0-mlx-4bit | no disponible | no aplica | x2, x4 | MIT | Hugging Face (MLX) |
| Kandinsky-ImageSR-2.0 (original) | no disponible | no aplica | x2, x4 | MIT | Hugging Face (PyTorch/Diffusers) |
| Kandinsky-ImageSR-2.0-mlx-8bit | no disponible | no aplica | x2, x4 | MIT | Hugging Face (MLX) |
| Kandinsky-ImageSR-2.0-mlx-bf16 | no disponible | no aplica | x2, x4 | MIT | Hugging Face (MLX) |

Las tres variantes MLX comparten arquitectura y capacidades; difieren en tamano (4,6 GB, 6,7 GB y 10,4 GB respectivamente) y en el equilibrio fidelidad/memoria. No se dispone de datos de benchmarks comparativos frente a otros modelos de superresolucion (como ESRGAN o SwinIR) en la informacion proporcionada.

## Limitaciones y advertencias

- Alucinacion visual: al ser un modelo generativo de difusion, puede inventar detalle plausible que no existe en la imagen original, especialmente con valores altos de `creativity`. No es adecuado para aplicaciones forenses o de fidelidad documental estricta.
- Sesgos: no se documentan sesgos especificos, pero al derivar de un modelo entrenado con datos no especificados, puede heredar sesgos de representacion en rostros y escenas.
- Limitaciones de resolucion: el procesamiento por tiles puede introducir costuras visibles si la rejilla no esta bien ajustada; el autor recomienda `tile_batch_size=1` para maxima calidad.
- Restricciones de licencia: el modelo es MIT, pero el VAE incluido es Apache-2.0 (FLUX.1-schnell); conviene conservar los avisos de ambas licencias en uso comercial.
- Dependencia de plataforma: solo funciona en Apple Silicon con MLX; no es portable a otros entornos sin reconversion.
- Memoria: el pico de 15,7 GB deja poco margen en equipos de 16 GB; conviene cerrar otras aplicaciones o reducir el tamano de tile.
- Ausencia de benchmarks comparativos frente a otros modelos de superresolucion: la evaluacion se limita a la paridad con la referencia PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vanch007/Kandinsky-ImageSR-2.0-mlx-4bit
- Modelo base original: https://huggingface.co/kandinskylab/Kandinsky-ImageSR-2.0
- Repositorio del runtime: https://github.com/vanch007/mlx-kandinsky-imagesr-2
- Variante bf16: https://huggingface.co/vanch007/Kandinsky-ImageSR-2.0-mlx-bf16
- Variante 8 bits: https://huggingface.co/vanch007/Kandinsky-ImageSR-2.0-mlx-8bit
- VAE de referencia (FLUX.1-schnell): https://huggingface.co/black-forest-labs/FLUX.1-schnell
