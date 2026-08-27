# wuhisbajsi/csig-track1-vosr05b-ckpt4000

## Resumen

Modelo de super-resolución y restauración de imágenes, resultado de un fine-tune de VOSR-0.5B, desarrollado por wuhisbajsi (gongff) para el CSIG Image Graphics Technology Challenge, Track 1 (mejora ciega de imágenes 4K). Se trata de un modelo de difusión de un solo paso (one-step) basado en un Diffusion Transformer (DiT) con 487 millones de parámetros, que opera a resolución nativa de 4096×3072. El checkpoint 4000 corresponde a la submission W9, con una puntuación oficial de 3.9224 sobre un máximo de 6. Su relevancia radica en que demuestra que un fine-tune específico puede superar la puntuación de la ground truth en métricas no referenciadas, aunque con advertencias explícitas sobre la invención de detalles. La licencia es Apache-2.0, heredada del proyecto base VOSR.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) d1024/b28/h16, con VAE de SD2.1, LightDecoder y DINOv2 encoder |
| Parametros totales | 487.067.456 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, sin contexto de texto) |
| Tipos de cuantizacion | no disponible (solo se distribuye en safetensors de precisión completa) |
| Idiomas soportados | no disponible (modelo de visión, sin soporte de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (1.9 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de VOSR-0.5B, que emplea un Diffusion Transformer con 1024 dimensiones ocultas, 28 bloques y 16 cabezas de atención. El codificador es DINOv2, el VAE proviene de Stable Diffusion 2.1 y el decodificador es LightDecoder. La inferencia se realiza en un solo paso (t=1, r=0), lo que lo hace adecuado para despliegue en tiempo real. El entrenamiento se realizó utilizando una función de pérdida basada en métricas de calidad de imagen (IQA-as-loss) aplicada directamente sobre la ruta de despliegue, en lugar de la formulación clásica sobre `x0_hat` en un timestep aleatorio. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens (al ser un modelo de imagen no aplica) ni el uso de RLHF o DPO. El autor indica que el checkpoint 4000 es el mejor de más de 20 brazos de fine-tune probados, y que continuar el entrenamiento degrada la puntuación en todas las configuraciones ensayadas.

## Capacidades

- Super-resolución de imágenes a resolución 4K (4096×3072) manteniendo la resolución original (same-resolution restoration).
- Restauración de imágenes degradadas (mejora ciega) sin necesidad de pares de referencia.
- Inferencia de un solo paso (one-step diffusion), lo que permite tiempos de procesamiento reducidos.
- Mejora de la calidad perceptual según métricas no referenciadas (NR) como LPIPS, DISTS, CLIPIQA, MANIQA, MUSIQ y NIQE.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de texto; es exclusivamente un modelo de visión.

## Casos de uso

- Restauración de fotografías antiguas o deterioradas: el modelo puede mejorar la nitidez y el color de imágenes escaneadas o con daños físicos, gracias a su entrenamiento en restauración ciega y su capacidad de procesar imágenes de alta resolución.
- Mejora de imágenes de baja calidad para impresión profesional: al operar a 4K nativo, es adecuado para preparar imágenes de archivo o capturas de baja resolución para su reproducción en gran formato.
- Preprocesamiento de imágenes para sistemas de visión artificial: la mejora de la calidad de imagen puede incrementar la precisión de detectores y segmentadores en entornos con iluminación deficiente o compresión alta.
- Mejora de imágenes de vigilancia y seguridad: permite realzar detalles en fotogramas de cámaras de baja resolución o con ruido, facilitando la identificación de objetos o personas.
- Aumento de la calidad de imágenes médicas (fuera de uso clínico): como herramienta de investigación para mejorar la visualización de imágenes de baja dosis o baja resolución, siempre que se valide su uso en el dominio específico.
- Generación de contenido visual para medios: el modelo puede emplearse para mejorar la calidad de imágenes de archivo en producción audiovisual, reduciendo el tiempo de retoque manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (tipo MMLU, HumanEval, etc.) por tratarse de un modelo de visión. El autor proporciona las siguientes puntuaciones en la métrica oficial del desafío, que se infiere como una suma ponderada de seis términos (LPIPS, DISTS, CLIPIQA, MANIQA, MUSIQ/100, NIQE), con un máximo de 6:

| Configuracion | Suma NR | Puntuacion oficial |
|---|---|---|
| Checkpoint 4000, single-seed sin ajustes | 2.4961 | — |
| Con per-group α, blend y JPEG | — | — |
| Con BoN(16) + focus (submission W9) | 2.5390 | 3.9224 |
| Ground truth (referencia) | — | 3.6370 |

El autor advierte que la ground truth obtiene una puntuación inferior a la del modelo en la parte no referenciada, lo que indica que el modelo inventa detalles para mejorar las métricas NR.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la documentación del modelo.
- El archivo de pesos ocupa 1.9 GB en safetensors, por lo que se estima que la inferencia one-step puede ejecutarse en GPUs consumer con al menos 8 GB de VRAM (p. ej., RTX 3070, RTX 4060 Ti, RTX 4070).
- Para procesamiento por lotes o imágenes de muy alta resolución, se recomienda una GPU con 12 GB o más (RTX 3080, RTX 4080, A5000).
- El modelo se distribuye en formato safetensors, por lo que es compatible con frameworks como PyTorch, Diffusers y vLLM (si se adapta), aunque el flujo de inferencia oficial se basa en el repositorio VOSR.
- No se dispone de datos de latencia o throughput medidos.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de super-resolución o restauración en la documentación proporcionada. El modelo base VOSR-0.5B es la referencia directa, pero no se han publicado especificaciones detalladas del mismo en esta ficha. Se recomienda consultar el repositorio de VOSR para obtener más contexto.

## Limitaciones y advertencias

- El modelo introduce un artefacto de "aplanamiento tipo óleo" (oil-painting flattening) en las imágenes procesadas. Según el autor, solo el 18% de este artefacto proviene del fine-tune; el 47% es del prior generativo del modelo base y el 33% de la destilación one-step.
- En contenido con vegetación densa, el modelo pierde puntuación MUSIQ en comparación con su entrada (−10.31 más allá de lo que explica el contenido), lo que indica una degradación específica en ese tipo de escenas.
- La puntuación oficial supera a la de la ground truth en métricas no referenciadas, lo que implica que el modelo "inventa" detalles para optimizar esas métricas. Esto puede ser problemático en aplicaciones donde la fidelidad a la realidad es crítica.
- El autor advierte que continuar el entrenamiento desde este checkpoint degrada la puntuación en todas las configuraciones probadas, por lo que no se recomienda fine-tune adicional sin un estudio cuidadoso.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar la licencia de los componentes base (VOSR, SD2.1 VAE, DINOv2) y cumplir con sus términos.
- No se proporcionan datos sobre sesgos o alucinaciones en el sentido de modelos de lenguaje; al ser un modelo de imagen, los riesgos se centran en la generación de detalles falsos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wuhisbajsi/csig-track1-vosr05b-ckpt4000
- Repositorio del desafío (código, configuraciones y mediciones): https://github.com/woodlingbombardier-dev/csig
- Repositorio del modelo base VOSR: https://github.com/cswry/VOSR
- Espejo de SD2.1-base (necesario para la inferencia): https://huggingface.co/LanguageMachines/stable-diffusion-2-1-base
