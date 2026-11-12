# yasutoshi-lab/Qwen-Image-2.1-Turbo-GGUF

## Resumen

Qwen-Image-2.1-Turbo-GGUF es una cuantización no oficial del checkpoint Qwen-Image-2.1-Turbo, un modelo de difusión para generación y edición de imágenes desarrollado originalmente por el equipo Qwen (Alibaba). Este repositorio, publicado por el usuario yasutoshi-lab, convierte los pesos originales a formato GGUF para permitir su ejecución en hardware de consumo mediante stable-diffusion.cpp y llama.cpp, sin realizar ningún cambio en los pesos más allá de la cuantización.

El modelo base emplea una arquitectura DiT (Diffusion Transformer) de aproximadamente 8.190 millones de parámetros, con un text encoder separado y un VAE. Está optimizado para generar imágenes en solo 8 pasos de denoising con CFG=1.0, lo que reduce drásticamente el coste computacional frente a modelos de difusión convencionales que requieren 20-50 pasos. El checkpoint incluye su propio schedule de muestreo recomendado y soporta tanto text-to-image como image-editing con imágenes de referencia.

La relevancia de esta cuantización radica en que hace accesible un modelo de generación de imágenes de 8B parámetros en GPUs de consumo: la combinación Q5_K_M ocupa unos 11,74 GB y funciona en una RTX 3060 de 12 GB, generando una imagen de 1024x1024 en aproximadamente 30 segundos. Las variantes IQ2 reducen el peso total a 5,66 GB, a costa de una degradación notable de la calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con text encoder LLM y VAE |
| Parametros totales | 8.190.735.360 (8,19B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ3_S, IQ3_XXS, IQ2_S, IQ2_XS (para DiT y TE); VAE sin cuantizar (0,68 GB) |
| Idiomas soportados | no disponible (el pipeline text-to-image acepta prompts en varios idiomas, pero no se documenta una lista oficial) |
| Licencia | qwen-research (license: other) |
| Formato de pesos | GGUF (DiT y TE), safetensors (VAE en formato diffusers) |

## Arquitectura y entrenamiento

El modelo base Qwen-Image-2.1-Turbo es un checkpoint acelerado de Qwen-Image-2.1, con la misma arquitectura de generación visual de 7B parámetros (el recuento real de safetensors en este repo es de 8,19B incluyendo componentes). La generación se realiza mediante un Diffusion Transformer que opera en 8 pasos de denoising con CFG=1.0 por defecto, e incorpora prefix KV caching para reutilizar el contexto de texto e imagen de referencia entre pasos. El checkpoint incluye su propio schedule de sigmas, por lo que no requiere configuración manual del scheduler.

La cuantización de este repositorio se realizó con stable-diffusion.cpp para el DiT y con llama.cpp para el text encoder; las variantes IQ emplean imatrix. El VAE se mantiene sin cuantizar. No se han publicado en la información disponible detalles sobre el dataset de entrenamiento, el número de tokens, ni si hubo RLHF/DPO u otras etapas de alineación para el modelo base.

## Capacidades

- Generación de imágenes a partir de prompts de texto (text-to-image) en resoluciones como 1024x1024.
- Edición de imágenes con imagen de referencia: modificación de contenido preservando la composición, incluida la alteración de texto dentro de la imagen.
- Generación rápida: 8 pasos de denoising con CFG=1.0, lo que reduce el coste frente a pipelines de 20-50 pasos.
- Renderizado de texto dentro de imágenes, con recomendación de entrecomillar las cadenas literales en el prompt (por ejemplo, `'OPEN'`) para que la edición de texto funcione de forma fiable.
- Soporte de prompts detallados y estilizados (el ejemplo de la model card incluye instrucciones complejas de composición, tipografía y paleta).
- Capacidades multilingües: no documentadas explícitamente en la información disponible.
- Tool calling / function calling: no aplica (modelo de generación de imágenes).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Generación de imágenes en equipos de consumo: con la combinación Q5_K_M (11,74 GB totales) el modelo se ejecuta en una RTX 3060 de 12 GB, generando una imagen de 1024x1024 en unos 30 segundos, lo que permite prototipado local sin depender de servicios en la nube.
- Edición iterativa de imágenes: usando `-r` con una imagen de referencia y el módulo de visión `mmproj-F16.gguf`, se pueden aplicar cambios puntuales (por ejemplo, sustituir el texto de una pizarra) manteniendo el resto de la escena, útil en flujos de diseño gráfico y revisión de creatividades.
- Generación de material gráfico con texto integrado: carteles, pizarras, etiquetas y posters con tipografía legible, gracias a la capacidad de renderizar cadenas literales indicadas entre comillas en el prompt.
- Creación de assets para videojuegos y prototipos: generación de fondos, escenarios e ilustraciones conceptuales en local, con control sobre la resolución y el estilo mediante prompts detallados.
- Automatización de pipelines de contenido: integración en scripts mediante `sd-cli` para producir lotes de imágenes a partir de plantillas de prompt, con cuantizaciones bajas (IQ4_XS, 9,22 GB totales) para maximizar el número de imágenes por hora en GPUs modestas.
- Despliegue con vLLM/vLLM-Omni: el autor verificó el funcionamiento con vLLM 0.32.0, vLLM-Omni 0.32.0 y vllm-gguf-plugin 0.0.5 usando full-layer offload, lo que permite servir el modelo en entornos con infraestructura de serving basada en vLLM.
- Investigación sobre cuantización de modelos de difusión: el repositorio ofrece 10 combinaciones de cuantización para DiT y TE, permitiendo estudiar el compromiso entre tamaño, velocidad y fidelidad de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los únicos datos de rendimiento aportados por el autor son empíricos: una imagen de 1024x1024 con DiT y TE en Q5_K_M tarda aproximadamente 30 segundos en una RTX 3060 de 12 GB, con 8 pasos y CFG 1.0. No se proporcionan métricas como FID, CLIP score ni comparaciones cuantitativas con el modelo base sin cuantizar.

## Requisitos de hardware

- VRAM estimada según la combinación de cuantización (suma de ficheros DiT + TE + VAE; el uso real de memoria en ejecución puede diferir):
  - BF16: 31,29 GB (32,45 GB con edición)
  - Q8_0: 17,07 GB (18,23 GB con edición)
  - Q6_K: 13,40 GB (14,56 GB con edición)
  - Q5_K_M: 11,74 GB (12,90 GB con edición)
  - Q4_K_M: 10,18 GB (11,34 GB con edición)
  - IQ4_XS: 9,22 GB (10,38 GB con edición)
  - IQ3_S: 7,74 GB (8,89 GB con edición)
  - IQ3_XXS: 6,99 GB (8,15 GB con edición)
  - IQ2_S: 6,05 GB (7,21 GB con edición)
  - IQ2_XS: 5,66 GB (6,82 GB con edición)
- GPU verificada por el autor: NVIDIA GeForce RTX 3060 de 12 GB (una unidad), con Intel Core i5-11400F, 48 GB de RAM DDR4-3200 y Ubuntu 24.04.5 LTS (driver 620.70.06).
- Cabe en GPUs de consumo: sí, desde Q5_K_M hacia abajo en una RTX 3060 de 12 GB; las variantes IQ4_XS e inferiores caben en GPUs de 8-10 GB, con la advertencia de degradación de calidad.
- Opciones de despliegue: stable-diffusion.cpp (commit `32d516c` verificado), llama.cpp para el text encoder, vLLM 0.32.0 con vLLM-Omni 0.32.0 y vllm-gguf-plugin 0.0.5 (full-layer offload), y Diffusers con `QwenImage21Pipeline` para el modelo base en safetensors.
- Latencia: aproximadamente 30 segundos por imagen de 1024x1024 en RTX 3060 con Q5_K_M, 8 pasos, CFG 1.0. No se dispone de datos de throughput para otras GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Pasos de muestreo | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Turbo-GGUF (este repo) | 8,19B | 1024x1024 (verificado) | 8, CFG 1.0 | qwen-research | GGUF + safetensors (VAE) |
| Qwen-Image-2.1-Turbo (base oficial) | 7B (arquitectura visual) | no disponible | 8, CFG 1.0 | qwen-research | safetensors (Diffusers) |
| Qwen-Image-2.1 (no Turbo) | no disponible | no disponible | no disponible | qwen-research | safetensors (Diffusers) |

No se dispone en la información proporcionada de datos sobre otros modelos comparables de la misma categoría (por ejemplo, FLUX o Stable Diffusion 3) para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Cuantización no oficial: el autor indica explícitamente que no es una distribución oficial de Qwen; solo se han cuantizado los pesos, sin reentrenamiento.
- Degradación con cuantizaciones bajas: a partir de IQ3 (IQ3_S, IQ3_XXS) la composición tiende a desviarse del modelo original; en IQ2 (IQ2_S, IQ2_XS) la imagen puede degradarse por completo o la edición puede no seguir las instrucciones. El autor recomienda Q6_K o superior para priorizar calidad.
- El uso real de memoria en ejecución no coincide con el tamaño de los ficheros; depende del entorno y de la configuración de offload.
- La edición de texto dentro de imágenes puede fallar si la cadena no se entrecomilla en el prompt.
- Licencia qwen-research: restricciones para uso comercial no detalladas en la información disponible; es necesario consultar el fichero LICENSE del repositorio antes de un despliegue en producción.
- Idiomas soportados no documentados; no hay garantía de calidad con prompts en castellano u otros idiomas distintos del inglés.
- Sin datos publicados de benchmarks (FID, CLIP score) ni de sesgos conocidos; el riesgo de alucinación visual (elementos incoherentes, texto mal formado) no está cuantificado.
- Requiere versiones específicas de software: Diffusers con soporte de sigmas configuradas en el pipeline (PR #14950), transformers >= 5.17.0, y commits concretos de stable-diffusion.cpp.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente más allá de las pruebas del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yasutoshi-lab/Qwen-Image-2.1-Turbo-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Qwen-Image-2.1 (modelo no Turbo): https://huggingface.co/Qwen/Qwen-Image-2.1
- ModelScope: https://modelscope.cn/models/Qwen/Qwen-Image-2.1-Turbo
- GitHub oficial: https://github.com/QwenLM/Qwen-Image-2.1
- Blog de Qwen-Image-2.1: https://qwen.ai/blog?id=qwen-image-2.1
- Discord: https://discord.gg/BEYSk3pkSu
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- llama.cpp: https://github.com/ggml-org/llama.cpp
- PR de Diffusers con soporte de sigmas en pipeline: https://github.com/huggingface/diffusers/pull/14950
