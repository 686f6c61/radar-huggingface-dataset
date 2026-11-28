# vanch007/Kandinsky-ImageSR-2.0-mlx-8bit

## Resumen

Kandinsky-ImageSR-2.0-mlx-8bit es una conversion nativa al framework MLX de Apple Silicon del modelo de superresolucion de imagen Kandinsky-ImageSR-2.0, desarrollado originalmente por el equipo Kandinsky Lab. La conversion la mantiene el usuario vanch007 y elimina por completo la dependencia de PyTorch y del runtime de Diffusers: los pesos se distribuyen como safetensors nativos de MLX, con el transformer cuantizado a 8 bits y el VAE en formato NHWC.

El modelo resuelve el problema de la superresolucion de imagenes de alta fidelidad en hardware Apple, un escenario historicamente mal cubierto por el ecosistema CUDA. Permite reescalar imagenes en factores x2 y x4 (por ejemplo, de 256x256 a 1024x1024 o de 1024x1024 a 4096x4096) manteniendo una paridad numerica muy alta con la referencia en PyTorch: coseno de 0,9999965, PSNR de 56,48 dB y SSIM de 0,999590 en el caso x4 de 256 a 1024 px.

Es relevante ahora porque ofrece una alternativa practica y ligera (6,74 GB de checkpoint) para flujos de trabajo de restauracion y escalado de imagen en Macs con memoria unificada de 24 GB o superior, con licencia MIT y sin necesidad de GPU dedicada. La arquitectura subyacente es la del modelo original de Kandinsky Lab; esta ficha describe la variante MLX 8-bit, cuyos detalles internos de entrenamiento no se documentan en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (image-to-image) con VAE de 16 canales compatible con FLUX; pesos en formato NHWC para MLX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | 8 bits (grupo g64) en transformer (attention y FFN); modulacion AdaLN en fp32; tablas de condicionamiento precalculadas; VAE con force_upcast=true |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de texto) |
| Licencia | MIT (VAE FLUX-compatible bajo Apache-2.0 de black-forest-labs/FLUX.1-schnell) |
| Formato de pesos | safetensors nativos de MLX (NHWC VAE + transformer preconvertido) |

## Arquitectura y entrenamiento

La variante MLX reproduce la arquitectura del Kandinsky-ImageSR-2.0 original: un transformer de difusion para image-to-image acoplado a un VAE de 16 canales compatible con FLUX. La conversion a MLX aplica cuantizacion afina de 8 bits con grupo de 64 a las capas de atencion y feed-forward del transformer, mientras que la modulacion AdaLN y las tablas de condicionamiento se mantienen en fp32 para preservar la fidelidad numerica. El VAE se ejecuta con `force_upcast=true` y pesos en formato NHWC, optimizado para el backend Metal de MLX.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo original uso RLHF o DPO; estos datos corresponden al modelo base de Kandinsky Lab y no se detallan en la model card de esta conversion. La innovacion tecnica destacable de esta variante es la paridad casi exacta con la referencia en PyTorch (coseno 0,9999965, PSNR 56,48 dB, SSIM 0,999590 en x4 de 256 a 1024) sin runtime de PyTorch ni Diffusers, ademas del procesamiento por tiles que permite escalar a resoluciones muy altas con memoria acotada.

## Capacidades

- Superresolucion de imagen en factores x2 y x4 (por ejemplo, 256 a 1024 px, 512 a 2048 px, 1024 a 4096 px).
- Restauracion de detalle y reduccion de artefactos en imagenes de baja resolucion.
- Procesamiento por tiles con `tile_batch_size` configurable para resoluciones grandes.
- Parametro `creativity` para ajustar el grado de reinterpretacion durante el escalado.
- Ejecucion nativa en Apple Silicon mediante MLX, sin PyTorch ni Diffusers en tiempo de ejecucion.
- Interfaz de linea de comandos (`mlx-kandinsky-sr`) y API de Python (`KandinskyImageSRPipeline`).
- No soporta generacion de texto, tool calling, agentes ni capacidades multilingues: es exclusivamente un modelo de imagen.

## Casos de uso

- Restauracion de fotografia antigua o de baja resolucion: el modelo reescala imagenes de 256 px a 1024 px con PSNR de 56,48 dB respecto a la referencia, adecuado para digitalizar archivos fotograficos en un Mac.
- Escalado de material grafico para impresion: partiendo de 1024x1024 se obtienen 4096x4096 en aproximadamente 395 s en un M3 Max de 128 GB, suficiente para laminas y carteles de tamano medio.
- Preparacion de assets para pipelines de diseno: integracion via API de Python en scripts de produccion que necesitan ampliar texturas, sprites o imagenes de catalogo sin GPU dedicada.
- Mejora de miniaturas y previews en aplicaciones macOS: el checkpoint de 6,7 GB cabe en Macs de 24 GB o mas, lo que permite embeber el escalado en herramientas de escritorio.
- Procesamiento por lotes en estaciones de trabajo Apple: la CLI permite automatizar el escalado de directorios completos de imagenes con un solo comando y parametros de factor y creatividad.
- Investigacion en superresolucion sobre hardware Apple: sirve como referencia reproducible (paridad documentada con PyTorch) para comparar tecnicas de cuantizacion y de inferencia en MLX.

## Benchmarks y rendimiento

Rendimiento medido en Apple M3 Max (128 GB), MLX 0.32.5, `vae_dtype=float32`, `tile_batch_size=1`:

| Resolucion | Escalado | Rejilla de tiles | Tiempo total | Por tile | RAM Metal maxima |
|---|---|---|---|---|---|
| 512x512 a 2048x2048 | x4 | 3x3 (9) | 121,54 s | 13,50 s | 16,17 GB |
| 1024x1024 a 2048x2048 | x2 | 3x3 (9) | 117,92 s | 13,10 s | 20,74 GB |
| 1024x1024 a 4096x4096 | x4 | 5x5 (25) | 394,76 s | 15,79 s | 20,74 GB |

Paridad con la referencia en PyTorch (x4, 256 a 1024): coseno 0,9999965, PSNR 56,48 dB, SSIM 0,999590. No se han publicado resultados de benchmarks en la informacion disponible para metricas de calidad perceptual tipo FID, LPIPS o comparativas con otros modelos de superresolucion.

## Requisitos de hardware

- VRAM (memoria unificada) estimada: 6,7 GB de checkpoint; el consumo real medido en M3 Max es de 16,17 GB para 512 a 2048 y de 20,74 GB para 1024 a 4096.
- Memoria recomendada: 24 GB o mas para la variante 8-bit; 32 GB o mas para la bf16 (10,4 GB de checkpoint); 16 GB o mas para la 4-bit (4,6 GB).
- GPU: exclusivamente Apple Silicon (M1, M2, M3, M4 y variantes Pro, Max, Ultra) mediante MLX y Metal. No hay soporte para A100, H100 ni RTX 4090 en esta variante.
- Cabe en Macs consumer con memoria unificada de 16 GB (variante 4-bit) y de 24 GB (variante 8-bit).
- Despliegue: libreria `mlx-kandinsky-imagesr-2` (CLI y API de Python), instalable con `uv` y Python 3.12. No compatible con vLLM, llama.cpp, Ollama ni TGI, al ser un modelo de imagen y no de texto.
- Latencia y throughput: 13,10 a 15,79 s por tile en M3 Max de 128 GB; aproximadamente 118 s para 1024 a 2048 y 395 s para 1024 a 4096.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kandinsky-ImageSR-2.0-mlx-8bit | no disponible | no aplica | PSNR 56,48 dB, SSIM 0,999590 (x4 256 a 1024) | MIT | Hugging Face, solo Apple Silicon |
| Kandinsky-ImageSR-2.0-mlx-bf16 | no disponible | no aplica | Paridad maxima con PyTorch | MIT | Hugging Face, 32 GB+ de memoria |
| Kandinsky-ImageSR-2.0-mlx-4bit | no disponible | no aplica | No disponible | MIT | Hugging Face, 16 GB+ de memoria |
| kandinskylab/Kandinsky-ImageSR-2.0 (original) | no disponible | no aplica | Referencia de paridad | MIT | Hugging Face, PyTorch/Diffusers |

No se dispone de datos de benchmarks ni de especificaciones de parametros de modelos de superresolucion alternativos (por ejemplo, Real-ESRGAN o SwinIR) en la informacion proporcionada, por lo que la comparativa se limita a las variantes del mismo modelo.

## Limitaciones y advertencias

- Modelo especializado en imagen: no procesa texto, no soporta tool calling ni agentes, y no debe evaluarse con metricas de lenguaje.
- Riesgo de alucinacion visual: como modelo generativo de difusion, puede inventar detalle plausible en zonas con poca informacion; el parametro `creativity` controla este efecto pero no lo elimina.
- Sin datos publicados sobre sesgos demograficos o de contenido en esta conversion; se heredan los del modelo base de Kandinsky Lab, no documentados aqui.
- Dependencia exclusiva de Apple Silicon y MLX: no ejecutable en CUDA, ROCm ni CPU convencional, lo que limita su portabilidad a produccion.
- Consumo de memoria elevado en resoluciones altas (20,74 GB medidos para 1024 a 4096), lo que exige Macs con memoria unificada amplia.
- La licencia MIT del modelo convive con la Apache-2.0 del VAE FLUX-compatible de black-forest-labs/FLUX.1-schnell; conviene revisar ambas para uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion de la comunidad ni garantias de mantenimiento.
- No hay informacion sobre el numero de parametros totales ni sobre el proceso de entrenamiento del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vanch007/Kandinsky-ImageSR-2.0-mlx-8bit
- Modelo base original: https://huggingface.co/kandinskylab/Kandinsky-ImageSR-2.0
- Variante bf16: https://huggingface.co/vanch007/Kandinsky-ImageSR-2.0-mlx-bf16
- Variante 4-bit: https://huggingface.co/vanch007/Kandinsky-ImageSR-2.0-mlx-4bit
- Repositorio del runtime MLX: https://github.com/vanch007/mlx-kandinsky-imagesr-2
- VAE FLUX de referencia: https://huggingface.co/black-forest-labs/FLUX.1-schnell
