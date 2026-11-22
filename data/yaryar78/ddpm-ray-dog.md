# yaryar78/DDPM-Ray-dog

## Resumen

DDPM-Ray-dog es un modelo de difusión incondicional para generación de imágenes desarrollado por el usuario yaryar78 y publicado en Hugging Face bajo licencia MIT. Se trata de un ajuste fino (fine-tuning) del modelo `google/ddpm-cat-256` sobre un dataset propio denominado `yaryar78/Ray_dog`, con el objetivo de generar imágenes de perros de raza concreta a partir de ruido aleatorio. El modelo forma parte de los ejercicios de la Unidad 2 del curso Diffusion Models Class de Hugging Face.

Arquitectónicamente es un DDPM (Denoising Diffusion Probabilistic Model) estándar implementado sobre la librería `diffusers`, con aproximadamente 113,7 millones de parámetros en formato safetensors y un tamaño de repositorio de 0,5 GB. No dispone de interfaz de texto (no es text-to-image): genera muestras incondicionales, es decir, sin prompt, a partir de ruido gaussiano.

Su relevancia es fundamentalmente educativa y experimental: sirve como ejemplo reproducible de fine-tuning de un modelo de difusión sobre un dataset reducido y de cómo publicar un pipeline `DDPMPipeline` funcional en Hugging Face. No está pensado para producción ni para aplicaciones comerciales de alta calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DDPM (Denoising Diffusion Probabilistic Model), U-Net convolucional |
| Parametros totales | 113.673.219 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, precisión original fp32/fp16 según checkpoint) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (compatible con PyTorch y diffusers) |

## Arquitectura y entrenamiento

El modelo sigue la formulación clásica de DDPM: una U-Net que aprende a predecir el ruido añadido en cada paso del proceso directo de difusión, junto con un scheduler de ruido configurable (DDPM, DDIM o PNDM según el pipeline que se cargue). El checkpoint base es `google/ddpm-cat-256`, un DDPM incondicional de 256x256 píxeles entrenado sobre imágenes de gatos, que se ha ajustado fino sobre el dataset `yaryar78/Ray_dog`.

No se dispone de información detallada sobre el número de pasos de entrenamiento, el tamaño exacto del dataset, la resolución final de las muestras ni la composición de los datos. La model card únicamente indica el proceso de fine-tuning y proporciona un ejemplo de uso con `DDPMPipeline`, `DDIMPipeline` y `PNDMPipeline`. No se documenta el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo de difusión incondicional de este tipo.

## Capacidades

- Generación de imágenes incondicionales de 256x256 píxeles (resolución heredada del checkpoint base) a partir de ruido aleatorio.
- Muestreo con distintos schedulers: DDPM (calidad), DDIM y PNDM (inferencia más rápida).
- Integración nativa con la librería `diffusers` mediante `DDPMPipeline`, `DDIMPipeline` y `PNDMPipeline`.
- Exportación directa de imágenes generadas a PNG mediante el método `save` del objeto imagen.
- No soporta prompts de texto, tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües, de visión por comprensión, audio ni modo "thinking".
- Entrenado específicamente para la temática del dataset `Ray_dog` (perros), por lo que su dominio visual es muy estrecho.

## Casos de uso

- Docencia y aprendizaje de modelos de difusión: el modelo sirve como ejemplo práctico para que estudiantes de la Diffusion Models Class reproduzcan el flujo completo de fine-tuning, carga del pipeline y generación de muestras.
- Experimentación con schedulers: permite comparar la calidad y velocidad de DDPM frente a DDIM y PNDM sobre un mismo checkpoint, útil para entender el compromiso entre pasos de muestreo y fidelidad visual.
- Generación de datasets sintéticos de perros para aumentación de datos en proyectos de visión por computador de baja exigencia, dado el dominio limitado del modelo.
- Pruebas de integración de `diffusers` en entornos locales: al ocupar solo 0,5 GB, es adecuado para validar pipelines de inferencia en portátiles o GPUs de gama baja.
- Reproducción de experimentos académicos: sirve como baseline para comparar estrategias de fine-tuning sobre datasets pequeños (por ejemplo, ajustar el mismo checkpoint base con otro dataset y comparar resultados).
- Prototipado rápido de demos de generación de imágenes sin dependencia de APIs externas, gracias a la licencia MIT y a la ausencia de restricciones de uso comercial.
- Ejercicios de evaluación de modelos generativos: análisis de diversidad, modos colapsados y artefactos visuales en modelos de difusión pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-2 GB en fp32, y menos de 1 GB en fp16, dado el tamaño del modelo (113,7 M de parámetros).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en NVIDIA T4, RTX 3060, RTX 4060, A100 y H100 sin problemas, aunque las GPU de gama alta están sobredimensionadas para este modelo.
- Cabe holgadamente en GPUs de consumo: GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090, así como en Apple Silicon (M1/M2/M3) vía MPS.
- También puede ejecutarse en CPU, aunque con latencias notablemente mayores (del orden de decenas de segundos por imagen de 256x256 con 1000 pasos DDPM).
- Opciones de despliegue: `diffusers` (principal), PyTorch nativo, y potencialmente `optimum` para exportación a ONNX. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles de forma oficial; en una RTX 3060 se espera del orden de 1-3 segundos por imagen con DDIM de 50 pasos y varios segundos con DDPM de 1000 pasos.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yaryar78/DDPM-Ray-dog | 113,7 M | 256x256 | DDPM incondicional (fine-tune) | MIT | Hugging Face |
| google/ddpm-cat-256 | no disponible en la informacion | 256x256 | DDPM incondicional (base) | no disponible en la informacion | Hugging Face |
| google/ddpm-celebahq-256 | no disponible en la informacion | 256x256 | DDPM incondicional | no disponible en la informacion | Hugging Face |
| CompVis/ldm-celebahq-256 | no disponible en la informacion | 256x256 | Latent Diffusion | no disponible en la informacion | Hugging Face |

La comparación se limita al ecosistema de DDPM de 256x256 porque no se dispone de datos de benchmarks ni de parámetros de los modelos alternativos en la información proporcionada. Frente a modelos de difusión latente (LDM) o text-to-image (Stable Diffusion), este modelo carece de condicionamiento por texto y de mayor resolución, por lo que su ámbito de aplicación es mucho más restringido.

## Limitaciones y advertencias

- Modelo incondicional: no acepta prompts de texto, por lo que no se puede dirigir la generación hacia contenidos concretos.
- Dominio visual muy estrecho: entrenado sobre el dataset `Ray_dog`, probablemente genera únicamente variaciones de la temática aprendida y con calidad limitada.
- Resolución fija de 256x256 píxeles, insuficiente para la mayoría de aplicaciones de producción actuales.
- Riesgo de modos colapsados y baja diversidad, habitual en fine-tunes sobre datasets pequeños.
- No se documenta el tamaño ni la composición del dataset de entrenamiento, lo que impide evaluar sesgos o cobertura.
- Posibles sesgos heredados del checkpoint base `google/ddpm-cat-256` y del dataset propio, no analizados en la model card.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Sin métricas de calidad publicadas (FID, IS u otras), por lo que no es posible evaluar objetivamente su rendimiento frente a alternativas.
- No apto para tareas de generación condicionada, edición de imágenes, inpainting nioutpainting.
- El número de descargas (20) y de likes (0) sugiere una adopción muy baja y escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yaryar78/DDPM-Ray-dog
- Checkpoint base: https://huggingface.co/google/ddpm-cat-256
- Dataset de fine-tuning: https://huggingface.co/datasets/yaryar78/Ray_dog
- Curso Diffusion Models Class: https://github.com/huggingface/diffusion-models-class
- Documentación de `DDPMPipeline`: https://huggingface.co/docs/diffusers/api/pipelines/ddpm
- Documentación de `DDIMPipeline`: https://huggingface.co/docs/diffusers/api/pipelines/ddim
- Documentación de `PNDMPipeline`: https://huggingface.co/docs/diffusers/api/pipelines/pndm
