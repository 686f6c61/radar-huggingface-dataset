# tonera/FLUX.2-klein-9b-kv-Nunchaku

## Resumen

FLUX.2-klein-9b-kv-Nunchaku es una versión cuantizada del modelo de difusión FLUX.2 [klein] 9B-KV de Black Forest Labs, publicada por el usuario tonera. Se trata de un modelo de generación y edición de imágenes de 9.078.581.248 parámetros (aproximadamente 9B) que emplea la técnica de cuantización SVDQuant implementada en la librería Nunchaku, con pesos en precisión fp4 o int4. El modelo base incorpora un mecanismo de caché de key-value (KV-cache) específicamente diseñado para escenarios de edición multi-referencia, donde la misma imagen de referencia se reutiliza a lo largo de varios pasos de denoising.

La relevancia de esta ficha radica en que combina dos optimizaciones complementarias: por un lado, el KV-cache del modelo upstream que, según la model card, puede ofrecer hasta 2,5x de aceleración en edición multi-referencia al evitar recomputar los tokens de la imagen de referencia en cada paso; por otro, la cuantización SVDQuant de Nunchaku, que reduce drásticamente los requisitos de VRAM. Los benchmarks publicados en la model card muestran que, en una RTX 5090 de 32 GB, la combinación de transformer y text encoder cuantizados permite pasar de un escenario con OOM (out of memory) en el modelo base a 14,00 GB de VRAM pico con 3,81 it/s en edición de imágenes a 1024x1024.

El modelo está pensado para flujos de trabajo interactivos de edición de imágenes, generación de variantes a partir de una referencia y pipelines de image-to-image de baja latencia. Se distribuye en formato safetensors con pesos cuantizados y requiere la pila de inferencia Diffusers con `Flux2KleinKVPipeline`, además de un plugin específico para ComfyUI. La licencia es "other", heredada del modelo base, por lo que conviene revisar los términos de Black Forest Labs antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión flow matching (FLUX.2 klein) con transformer de 9B y text encoder Qwen3 de 8B; variante con KV-cache |
| Parametros totales | 9.078.581.248 (según safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | SVDQuant con precisión fp4 o int4 (r32); text encoder también cuantizado (svdq-int4-Qwen3-text) |
| Idiomas soportados | No disponible (modelo de imagen; el text encoder Qwen3 subyacente es multilingüe, pero la model card no detalla idiomas) |
| Licencia | other (heredada del modelo base black-forest-labs/FLUX.2-klein-9b-kv) |
| Formato de pesos | safetensors (svdq-<precision>_r32-FLUX.2-klein-9B-kv-Nunchaku.safetensors) más ficheros companion de Diffusers (VAE, text encoder) |

## Arquitectura y entrenamiento

El modelo base FLUX.2 [klein] 9B-KV es un modelo de difusión de tipo flow matching con un transformer de 9B parámetros y un text embedder Qwen3 de 8B, destilado para un régimen de inferencia de 4 pasos. La innovación principal del variant KV es el mecanismo de caché de key-value: en el paso 0 se ejecuta el forward completo procesando los tokens de la imagen de referencia y se extrae la caché KV; en los pasos 1 a 3 se reutilizan esos pares KV y se omite el cómputo repetido de la referencia. Según la model card upstream, esto puede suponer hasta 2,5x de aceleración en escenarios de edición multi-referencia.

Sobre esta base, la versión Nunchaku aplica cuantización SVDQuant, una técnica que descompone los pesos en una componente de bajo rango y un residuo cuantizado, permitiendo precisiones de 4 bits (fp4 o int4) con r32. No se dispone de información sobre el dataset de entrenamiento, el número de tokens vistos ni si hubo etapas de RLHF o DPO; la model card no detalla estos aspectos. La evaluación interna de calidad de cuantización reporta PSNR medio de 22,10, SSIM medio de 0,876 y LPIPS medio de 0,0734, lo que indica una degradación moderada pero medible respecto al modelo en precisión completa.

## Capacidades

- Generación de texto a imagen (text-to-image) a resoluciones como 1024x1024.
- Edición de imagen a imagen (image-to-image) y edición multi-referencia.
- Reutilización de la misma imagen de referencia en múltiples pasos de denoising mediante KV-cache, con aceleración de hasta 2,5x según el modelo upstream.
- Generación de múltiples variantes a partir de una única imagen de referencia.
- Inferencia destilada en 4 pasos (el benchmark usa 8 pasos con guidance scale 1.0).
- Integración con Diffusers mediante `Flux2KleinKVPipeline`.
- Soporte en ComfyUI a través del plugin Vitoom Nunchaku (requiere ComfyUI 0.44 o superior con `--enable-manager`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni audio, al tratarse de un modelo de imagen.

## Casos de uso

- Edición interactiva de imágenes con referencia fija: el modelo cachea los tokens de la imagen de referencia en el primer paso y los reutiliza en los siguientes, lo que reduce la latencia en aplicaciones donde el usuario ajusta prompts sucesivos sobre la misma imagen base.
- Generación de variantes de producto: a partir de una foto de referencia de un artículo, generar múltiples versiones con cambios de fondo, iluminación o estilo, aprovechando la reutilización de la KV-cache entre variantes.
- Herramientas de diseño gráfico asistido: integración en editores que requieren respuesta en menos de un segundo por imagen; con la configuración cuantizada en RTX 5090 se alcanzan 8,91 it/s en text-to-image y 3,81 it/s en edición a 1024x1024.
- Prototipado rápido en estaciones de trabajo con GPU de consumo: la configuración `Base + TR + TE` en modo MCO requiere 7,52 GB de VRAM pico en edición, lo que permite ejecutar el modelo en GPUs de 12-16 GB.
- Pipelines de aumento de datos sintéticos: generación por lotes de imágenes editadas a partir de referencias controladas, donde el throughput de 3,81 it/s (edición) o 8,91 it/s (text-to-image) permite procesar volúmenes moderados.
- Investigación en cuantización de modelos de difusión: el repositorio sirve como referencia reproducible para evaluar SVDQuant con métricas PSNR, SSIM y LPIPS sobre un modelo FLUX.2.
- Despliegue en ComfyUI para flujos de trabajo nodales: artistas y técnicos pueden encadenar el modelo con otros nodos de postprocesado gracias al plugin Vitoom Nunchaku.

## Benchmarks y rendimiento

La model card incluye benchmarks de rendimiento en RTX 5090 32GB, 8 pasos y guidance scale 1.0. No se han publicado resultados de benchmarks estándar de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible, al tratarse de un modelo de imagen.

Edición de imágenes (1024x1024):

| Configuracion | Modo | VRAM pico | Throughput | Tiempo por imagen | Cambio throughput vs. base | Cambio VRAM vs. base |
|---|---|---:|---:|---:|---:|---:|
| Base | CUDA | OOM | - | - | - | - |
| Base | MCO | 20,18 GB | 0,62 it/s | 12 s | Baseline | Baseline |
| Base | SCO | 2,55 GB | 0,48 it/s | 16 s | Baseline | Baseline |
| Base + TE | CUDA | 25,60 GB | 1,28 it/s | 6 s | N/A (base OOM) | N/A |
| Base + TE | MCO | 20,16 GB | 0,83 it/s | 9 s | +33,9% | -0,1% |
| Base + TE | SCO | 6,08 GB | 0,48 it/s | 16 s | -0,5% | +138,4% |
| Base + TR | CUDA | 24,51 GB | 3,79 it/s | 2 s | N/A (base OOM) | N/A |
| Base + TR | MCO | 17,39 GB | 1,08 it/s | 7 s | +75,0% | -13,8% |
| Base + TR | SCO | 4,35 GB | 2,70 it/s | 2 s | +461,6% | +70,6% |
| Base + TR + TE | CUDA | 14,00 GB | 3,81 it/s | 2 s | N/A (base OOM) | N/A |
| Base + TR + TE | MCO | 7,52 GB | 1,88 it/s | 4 s | +204,6% | -62,7% |
| Base + TR + TE | SCO | 7,69 GB | 2,68 it/s | 2 s | +457,4% | +201,6% |

Text-to-image (1024x1024):

| Configuracion | Modo | VRAM pico | Throughput | Tiempo por imagen | Cambio throughput vs. base | Cambio VRAM vs. base |
|---|---|---:|---:|---:|---:|---:|
| Base | CUDA | OOM | - | - | - | - |
| Base | MCO | 18,53 GB | 0,83 it/s | 9 s | Baseline | Baseline |
| Base | SCO | 2,55 GB | 0,62 it/s | 12 s | Baseline | Baseline |
| Base + TR + TE | CUDA | 15,21 GB | 8,91 it/s | <1 s | N/A (base OOM) | N/A |
| Base + TR + TE | MCO | 6,42 GB | 2,60 it/s | 3 s | +214,5% | -65,4% |
| Base + TR + TE | SCO | 7,72 GB | 3,00 it/s | 2 s | +383,0% | +202,7% |

Calidad de cuantización (evaluación interna):

| Metrica | Media | Mediana p50 | p90 |
|---|---:|---:|---:|
| PSNR | 22,10 | 22,35 | 25,58 |
| SSIM | 0,876 | 0,877 | 0,933 |
| LPIPS | 0,0734 | 0,0714 | 0,114 |

## Requisitos de hardware

- VRAM estimada para inferencia (edición 1024x1024): 14,00 GB en modo CUDA con transformer y text encoder cuantizados; 7,52 GB con MCO; 7,69 GB con SCO.
- VRAM estimada para text-to-image (1024x1024): 15,21 GB en CUDA; 6,42 GB con MCO; 7,72 GB con SCO.
- GPU recomendadas: RTX 5090 32GB es la plataforma de referencia de los benchmarks; el modelo cabe en GPUs de consumo con 12-16 GB usando MCO, y en GPUs de 8 GB con SCO en algunos escenarios.
- Cabe en GPU de consumo: sí, en RTX 4090/5090 sin offload y en GPUs de 8-16 GB con offload de CPU.
- Opciones de despliegue: Diffusers con `Flux2KleinKVPipeline`, plugin Vitoom Nunchaku para ComfyUI (ComfyUI 0.44+ con `--enable-manager`), y la API de BFL según la model card upstream.
- Latencia y throughput: en RTX 5090, 3,81 it/s en edición CUDA (2 s por imagen) y 8,91 it/s en text-to-image CUDA (menos de 1 s por imagen) con la configuración completa cuantizada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tonera/FLUX.2-klein-9b-kv-Nunchaku | 9,08B | No disponible | Difusión image-to-image con KV-cache y SVDQuant fp4/int4 | other | Hugging Face (269 descargas) |
| black-forest-labs/FLUX.2-klein-9b-kv | No disponible | No disponible | Difusión image-to-image con KV-cache, precisión completa | other | Hugging Face y BFL API |
| black-forest-labs/FLUX.2-klein-9B | No disponible | No disponible | Difusión image-to-image sin KV-cache | other | Hugging Face y BFL API |

La comparativa se limita a las variantes del mismo modelo base, ya que la información proporcionada no incluye datos de modelos competidores de otros desarrolladores. La diferencia principal entre las tres variantes es el nivel de cuantización y la presencia o ausencia de KV-cache, no el tipo de tarea.

## Limitaciones y advertencias

- La cuantización introduce degradación medible: PSNR medio de 22,10 y SSIM medio de 0,876, con un p10 de PSNR de 25,58 que indica variabilidad entre muestras.
- La licencia "other" heredada del modelo base exige revisar los términos de Black Forest Labs antes de cualquier uso comercial; no se especifican restricciones concretas en la información disponible.
- No se documentan sesgos conocidos ni evaluación de sesgos en la model card.
- Riesgo de alucinación visual (artefactos, elementos inexistentes o incoherencias) inherente a los modelos de difusión, no cuantificado en la información disponible.
- El mecanismo KV-cache solo aporta ventajas cuando la misma imagen de referencia se reutiliza en varios pasos; en flujos con referencias cambiantes el beneficio desaparece.
- El modelo está destilado para 4 pasos, aunque los benchmarks usan 8 pasos con guidance scale 1.0; desviarse de esta configuración puede degradar la calidad.
- Los benchmarks se han medido únicamente en RTX 5090 32GB; el rendimiento en otras GPU puede diferir.
- El repositorio ocupa 46,1 GB, lo que implica requisitos de almacenamiento considerables.
- No se dispone de información sobre idiomas soportados por el text encoder en el contexto de este pipeline.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tonera/FLUX.2-klein-9b-kv-Nunchaku
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-9b-kv
- API de Black Forest Labs: https://bfl.ai/
- Plugin Vitoom Nunchaku para ComfyUI: https://github.com/tonera/vitoom-nunchaku-comfy
