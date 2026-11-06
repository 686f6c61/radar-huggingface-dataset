# ununununununununununununununununununun/wan2.1-t2v-1.3b-phi-lattice-v2

## Resumen

`wan2.1-t2v-1.3b-phi-lattice-v2` es una versión optimizada mediante cuantización del modelo de generación de vídeo texto-a-vídeo `Wan-AI/Wan2.1-T2V-1.3B-Diffusers`, publicado por el usuario `ununununununununununununununununununun`. El modelo base, desarrollado por Wan-AI (Alibaba), es un transformer de difusión 3D de aproximadamente 1.419 millones de parámetros (1,42B) que genera clips de vídeo a partir de descripciones textuales. Esta variante aplica una técnica de cuantización denominada `phi-lattice-v2`, que combina pesos de 4 bits con un esquema de sparsity estructurada del 11,97%.

El objetivo del modelo es reducir drásticamente el coste de almacenamiento y memoria del transformer manteniendo la calidad visual lo más cercana posible a la referencia en BF16. Frente al modelo original en FP32 (5,68 GB), el transformer en BF16 de este repositorio ocupa 2.706,6 MB y el archivo empaquetado en 4 bits ocupa 757,1 MB, lo que supone una reducción de 7,50x respecto al FP32 original. Los benchmarks publicados por el autor muestran una pérdida de calidad mínima: PSNR de vídeo de 18,54 dB frente a 18,26 dB de la cuantización uniforme estándar de 4 bits y 19,65 dB de SQNR de pesos.

Es relevante ahora porque permite ejecutar un modelo de difusión de vídeo en hardware más modesto, con menor VRAM y menor huella de disco, sin sacrificar de forma significativa la consistencia temporal ni la fidelidad de píxel. La licencia Apache 2.0 facilita su uso comercial, aunque se trata de un modelo de nicho con escasa tracción comunitaria (0 descargas y 0 likes en el momento de la ficha).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión 3D (`WanTransformer3DModel`) sobre pipeline `WanPipeline` con VAE `AutoencoderKLWan` |
| Parametros totales | 1.418.996.800 (1,42B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-vídeo; no aplica ventana de contexto textual) |
| Tipos de cuantizacion | BF16 (plug-and-play), 4-bit empaquetado (`phi-lattice-v2`) con sparsity del 11,97%; FP32 en el modelo base |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`transformer/diffusion_pytorch_model.safetensors`, BF16) y `.pt` empaquetado en 4 bits (`transformer/wan_transformer_phi_v2_packed_4bit.pt`) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión tridimensional que opera sobre latentes de vídeo, integrado en el pipeline `WanPipeline` de la librería `diffusers`. El pipeline combina un VAE (`AutoencoderKLWan`) para codificar y decodificar fotogramas, un codificador de texto para las prompts y el transformer 3D que aplica el proceso de denoising iterativo sobre la secuencia de latentes. La variante de este repositorio no reentrena el modelo: parte de los pesos de `Wan-AI/Wan2.1-T2V-1.3B-Diffusers` y les aplica una cuantización post-entrenamiento con el esquema propietario `phi-lattice-v2`.

La innovación técnica principal es el esquema de cuantización `phi-lattice-v2`, que combina pesos de 4 bits con una sparsity estructurada del 11,97% de los pesos. Según los datos publicados, esta combinación supera a la cuantización uniforme estándar de 4 bits en todas las métricas evaluadas: SQNR de pesos de 19,65 dB frente a 19,19 dB, PSNR de vídeo de 18,54 dB frente a 18,26 dB, SSIM de 0,7898 frente a 0,7832 y MAE de píxel de 17,60 frente a 19,31. No se dispone de información sobre el dataset de entrenamiento original del modelo base, el número de tokens utilizados ni sobre si hubo etapas de RLHF o DPO, ya que la model card de esta variante no los detalla.

## Capacidades

- Generación de vídeo texto-a-vídeo: produce clips de 17 fotogramas a resolución 832x480 con 20 pasos de inferencia y `guidance_scale` de 5,0, según el ejemplo de uso publicado.
- Control fino de la generación mediante parámetros del pipeline: altura, anchura, número de fotogramas, pasos de inferencia y escala de guía.
- Compatibilidad nativa con `diffusers` y exportación a MP4 mediante `export_to_video`.
- Carga selectiva del transformer cuantizado manteniendo el VAE y el resto del pipeline del modelo base.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo de pensamiento (thinking), dado que es un modelo generativo de vídeo.
- Capacidades multilingües: no disponibles; el modelo base no documenta idiomas en esta ficha.

## Casos de uso

- Generación de vídeo para prototipado rápido en estaciones de trabajo con GPU de consumo: el transformer en 4 bits ocupa 757,1 MB, lo que permite cargar el pipeline completo en GPUs con VRAM moderada y generar clips de 17 fotogramas a 832x480 sin necesidad de hardware de centro de datos.
- Creación de contenido para redes sociales y marketing: el modelo genera planos cinematográficos (por ejemplo, drones en calles de neón o escenas oceánicas) a partir de prompts descriptivos, útil para iterar storyboards antes de una producción final.
- Previsualización de escenas en pipelines de VFX y animación: la reducción de 7,50x en almacenamiento respecto al FP32 permite distribuir el transformer en repositorios de CI o en entornos de artistas sin grandes requisitos de disco.
- Investigación en cuantización de modelos de difusión: el repositorio incluye comparativas lado a lado (BF16, uniforme 4-bit y phi-lattice v2) con métricas de SQNR, PSNR, SSIM, MAE y consistencia temporal, lo que lo convierte en un banco de pruebas reproducible para estudiar el impacto de la cuantización en la calidad de vídeo.
- Despliegue en entornos con restricciones de memoria: al cargar el transformer cuantizado junto con el VAE del modelo base, se puede servir el pipeline en instancias con menos VRAM que las requeridas por el modelo original en FP32.
- Generación de clips cortos para demos y aplicaciones interactivas: con 17 fotogramas y 20 pasos, el coste por inferencia es acotado, lo que encaja en herramientas de generación bajo demanda con latencia moderada.
- Fine-tuning o experimentación sobre el transformer: el formato safetensors en BF16 es directamente compatible con `WanTransformer3DModel.from_pretrained`, facilitando la experimentación sobre pesos cuantizados.

## Benchmarks y rendimiento

Evaluación publicada por el autor sobre generación texto-a-vídeo multi-fotograma (832x480, 17 fotogramas, 20 pasos, semillas aleatorias idénticas):

| Metodo | SQNR de pesos 4-bit | Sparsity | PSNR de video | SSIM de video | MAE de pixel | Consistencia temporal |
|---|---|---|---|---|---|---|
| Baseline (BF16) | Referencia | 0,00% | Referencia | 1,0000 | 0,00 | 1,0000 |
| Uniforme estandar (4-bit) | 19,19 dB | 0,00% | 18,26 dB | 0,7832 | 19,31 | 0,2075 |
| phi-lattice v2 (este repo) | 19,65 dB | 11,97% | 18,54 dB | 0,7898 | 17,60 | 0,2087 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, dado que el modelo es de generación de vídeo y no de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El transformer en BF16 ocupa 2.706,6 MB y el empaquetado en 4 bits 757,1 MB; a ello hay que sumar el VAE (`AutoencoderKLWan`) y el codificador de texto del pipeline base, cuyo consumo no se detalla en la información disponible.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño de pesos, el transformer en 4 bits (757 MB) es compatible con GPUs de consumo con 8-12 GB de VRAM, mientras que el BF16 (2,7 GB) requiere al menos 6-8 GB solo para el transformer.
- Compatibilidad con GPU de consumo: plausible para el transformer cuantizado en 4 bits, aunque la VRAM total del pipeline completo no está documentada.
- Opciones de despliegue: `diffusers` con `WanPipeline` y `WanTransformer3DModel` (uso documentado en la model card); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión de vídeo.
- Latencia y throughput: no disponibles. El ejemplo publicado usa 17 fotogramas, 832x480, 20 pasos de inferencia y `guidance_scale` 5,0, pero no se reportan tiempos de ejecución.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wan2.1-t2v-1.3b-phi-lattice-v2 (este repo) | 1,42B | Transformer de difusión 3D cuantizado | BF16 y 4-bit phi-lattice v2 | apache-2.0 | Hugging Face |
| Wan-AI/Wan2.1-T2V-1.3B-Diffusers (base) | 1,42B | Transformer de difusión 3D | FP32 / BF16 | no disponible en esta ficha | Hugging Face |
| Wan-AI/Wan2.1-T2V-14B | 14B | Transformer de difusión 3D | no disponible | no disponible en esta ficha | Hugging Face |

El modelo base y la variante de 14B se citan como referencia de la familia Wan 2.1. No se dispone de datos de rendimiento comparativo entre la variante de 14B y la de 1,3B en la información proporcionada, ni de otros modelos de texto-a-vídeo comparables.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; la model card no documenta sesgos del modelo base ni de la variante cuantizada.
- Riesgo de alucinación: inherente a los modelos generativos de difusión; el modelo puede producir contenido visual incoherente con el prompt, especialmente en escenas complejas o prompts ambiguos.
- Limitaciones de contexto o idioma: no se documentan idiomas soportados ni límites de longitud de prompt; el pipeline de ejemplo usa prompts en inglés.
- Restricciones de licencia: licencia Apache 2.0, que permite uso comercial, pero conviene verificar la licencia del modelo base `Wan-AI/Wan2.1-T2V-1.3B-Diffusers`, no detallada en esta ficha.
- Caveats para producción: la cuantización introduce pérdida de calidad medible (PSNR de 18,54 dB frente a la referencia BF16); la sparsity del 11,97% y el formato `.pt` empaquetado requieren un flujo de carga específico distinto del safetensors estándar; el repositorio tiene 0 descargas y 0 likes, sin validación comunitaria; el autor es un usuario individual sin historial verificable.
- El tamaño del repositorio (3,6 GB) incluye archivos de comparación (MP4 e imagen de keyframes) además de los pesos, lo que conviene tener en cuenta al clonar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ununununununununununununununununununun/wan2.1-t2v-1.3b-phi-lattice-v2
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers
- Variante de 14B de la familia Wan 2.1: https://huggingface.co/Wan-AI/Wan2.1-T2V-14B
- Modelo base (página alternativa): https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
