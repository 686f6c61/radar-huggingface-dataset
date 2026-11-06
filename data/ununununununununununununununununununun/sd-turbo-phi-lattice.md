# ununununununununununununununununununun/sd-turbo-phi-lattice

## Resumen

sd-turbo-phi-lattice es una compilación experimental del modelo de difusión texto-a-imagen `stabilityai/sd-turbo`, publicada por el usuario `ununununununununununununununununununun` en Hugging Face. El autor ha aplicado al backbone UNet de 866 millones de parámetros una técnica propia de cuantización no uniforme denominada `phi-lattice`, combinada con una pasada de poda de ruido de baja magnitud, con el objetivo de reducir el peso del modelo sin sacrificar en exceso la calidad visual generada.

El modelo base, sd-turbo, es un modelo de difusión latente derivado de Stable Diffusion 2.1, destilado para generar imágenes en muy pocos pasos de inferencia (típicamente uno o dos). Esta variante no modifica el pipeline de inferencia ni introduce destilación adicional: su aportación es exclusivamente de compresión, ofreciendo pesos UNet empaquetados en 4 bits (459,4 MB) y una versión preempaquetada en float16 (1,65 GB) lista para cargar directamente con `diffusers` o ComfyUI.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación sin descargas ni validación comunitaria, con licencia "other" heredada del modelo base y sin documentación sobre idiomas o sesgos. Resulta útil como referencia técnica para quienes exploren cuantización no uniforme en modelos de difusión, pero no debe considerarse un modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusión latente (modelo base: sd-turbo, derivado de Stable Diffusion 2.1) con VAE y text encoder |
| Parametros totales | 865.910.724 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; condicionamiento por prompt, no por ventana de contexto) |
| Tipos de cuantizacion | 4 bits empaquetado (`uint8` bit-packed + escalas `fp16` por grupo), 3 bits empaquetado, float16 preempaquetado |
| Idiomas soportados | no disponible |
| Licencia | other (heredada de `stabilityai/sd-turbo`) |
| Formato de pesos | safetensors (float16), `.pt` (4-bit bit-packed), `.pt` (3-bit bit-packed) |

## Arquitectura y entrenamiento

La arquitectura es la de un modelo de difusión latente: un UNet que predice el ruido en el espacio latente de un VAE, condicionado por embeddings de texto. El backbone UNet contiene 866 millones de parámetros. El modelo base sd-turbo fue entrenado mediante destilación para permitir inferencia en uno o dos pasos con `guidance_scale=0.0`, de modo que esta variante hereda esa propiedad.

La innovación de esta compilación no reside en el entrenamiento sino en el posprocesado: una cuantización no uniforme denominada `phi-lattice` que asigna niveles de cuantización de forma no lineal, seguida de una poda de pesos de baja magnitud. Según la model card, en la variante de 4 bits se anulan 88,9 millones de pesos (10,45 % de esparsidad) y en la de 3 bits 189,7 millones (21,91 %). No se documentan datos de entrenamiento adicionales, composición del dataset ni etapas de RLHF/DPO, ya que el modelo no ha sido reentrenado.

## Capacidades

- Generación de imágenes texto-a-imagen en uno o dos pasos de inferencia, heredada de sd-turbo.
- Carga directa con `diffusers` mediante `AutoPipelineForText2Image` usando los pesos float16 preempaquetados.
- Compatibilidad con ComfyUI y pipelines estándar de Stable Diffusion al emplear el formato safetensors preempaquetado.
- Variante de 4 bits empaquetada que requiere script de desempaquetado personalizado antes de su uso.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo de difusión, no un LLM.
- No dispone de capacidades de visión, audio ni modo de razonamiento explícito.
- El condicionamiento multilingüe depende del text encoder de sd-turbo (CLIP); no se documenta cobertura idiomática específica.

## Casos de uso

- Evaluación de técnicas de cuantización no uniforme: el modelo sirve como banco de pruebas para comparar `phi-lattice` frente a cuantización uniforme de 4 y 3 bits, usando las métricas SQNR, PSNR y SSIM publicadas en la model card.
- Generación rápida de prototipos visuales en local: con dos pasos de inferencia y pesos float16 de 1,65 GB, permite iterar prompts en una GPU de consumo sin necesidad de infraestructura dedicada.
- Despliegue en entornos con VRAM limitada: la variante de 4 bits (459,4 MB) reduce el peso del UNet 7,18 veces respecto a FP32, lo que facilita su inclusión en dispositivos con memoria restringida.
- Investigación sobre poda de pesos en modelos generativos: la esparsidad documentada (10,45 % en 4 bits, 21,91 % en 3 bits) permite estudiar el impacto de la poda en la calidad perceptual de imágenes.
- Generación de retratos y rostros sintéticos: la model card reporta un SSIM de hasta 0,7561 en retratos con la variante de 4 bits, ligeramente superior a la media global.
- Integración en pipelines de experimentación con ComfyUI: los pesos float16 preempaquetados permiten cargar el modelo sin scripts adicionales para pruebas de calidad visual.

## Benchmarks y rendimiento

Datos publicados en la model card del autor (no verificados de forma independiente):

| Metodo de cuantizacion | Huella UNet | SQNR de pesos (dB) | Esparsidad | PSNR medio de imagen (dB) | SSIM medio |
|---|---|---|---|---|---|
| Baseline (FP32 / FP16) | 3.303 MB / 1.651 MB | Referencia | 0,00 % | Referencia | 1,0000 |
| Uniforme 4 bits | 459,4 MB | 18,43 | 0,00 % | 15,22 | 0,7509 |
| `phi-lattice` 4 bits (este repo) | 459,4 MB (7,18x) | 18,66 | 10,45 % (88,9M pesos) | 15,22 | 0,7375 (hasta 0,7561 en retratos) |
| Uniforme 3 bits | 356,0 MB | 11,20 | 0,00 % | 11,94 | 0,3853 |
| `phi-lattice` 3 bits | 356,0 MB (9,28x) | 12,21 | 21,91 % (189,7M pesos) | 12,73 | 0,4693 |

## Requisitos de hardware

- VRAM estimada: la variante float16 (1,65 GB de UNet) más VAE y text encoder requiere aproximadamente 3-4 GB de VRAM en total; la variante de 4 bits reduce el UNet a 459,4 MB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; se ha validado conceptualmente en entornos CUDA con `torch.float16`, y en CPU con `torch.bfloat16` según el ejemplo de la model card.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060 o superiores, e incluso en GPUs con 4 GB de VRAM usando la variante de 4 bits.
- Opciones de despliegue: `diffusers` (recomendado), ComfyUI; la variante de 4 bits requiere un script de desempaquetado previo.
- Latencia y throughput: no disponibles; al emplear dos pasos de inferencia heredados de sd-turbo, la generación es rápida, pero no se publican cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / pasos | Licencia | Disponibilidad |
|---|---|---|---|---|
| sd-turbo-phi-lattice (este) | 866M (UNet) | 1-2 pasos de inferencia | other | Hugging Face, 0 descargas |
| stabilityai/sd-turbo | 866M (UNet) | 1-2 pasos de inferencia | other (Stability AI) | Hugging Face, ampliamente usado |
| sd-turbo con cuantización uniforme 4 bits | 866M (UNet) | 1-2 pasos de inferencia | other | Depende de la implementación |
| LCM / LCM-LoRA sobre SD 2.1 | 866M (UNet) | 2-8 pasos | openrail / other | Hugging Face |

No se dispone de datos de benchmarks comparativos con estos modelos más allá de las métricas internas de la model card.

## Limitaciones y advertencias

- Modelo experimental sin validación comunitaria: 0 descargas y 0 likes en el momento de la ficha.
- La licencia "other" hereda las restricciones de `stabilityai/sd-turbo`; es necesario revisar los términos de Stability AI antes de cualquier uso comercial.
- La calidad visual se degrada de forma notable en la variante de 3 bits (SSIM de 0,4693 frente a 0,7375 en 4 bits).
- El SSIM de `phi-lattice` 4 bits es ligeramente inferior al de la cuantización uniforme 4 bits (0,7375 frente a 0,7509), aunque el autor destaca mejor SQNR y mejor comportamiento en retratos.
- No se documentan sesgos conocidos, pero al derivar de Stable Diffusion 2.1 se heredan los sesgos del dataset de entrenamiento original (LAION).
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar contenido incoherente o anatómicamente incorrecto, especialmente con prompts complejos.
- No se documenta cobertura idiomática; el text encoder CLIP de SD 2.1 está optimizado para inglés.
- La variante empaquetada de 4 bits no es directamente cargable con `diffusers` sin un script de desempaquetado no incluido en el repositorio.
- No apto para producción sin una evaluación de calidad propia y una revisión legal de la licencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ununununununununununununununununununun/sd-turbo-phi-lattice
- Modelo base: https://huggingface.co/stabilityai/sd-turbo
- Documentación de `diffusers`: https://huggingface.co/docs/diffusers
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
