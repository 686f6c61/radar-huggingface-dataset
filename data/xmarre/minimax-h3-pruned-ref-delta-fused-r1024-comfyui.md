# xmarre/MiniMax-H3-Pruned-Ref-Delta-Fused-r1024-ComfyUI

## Resumen

Este repositorio aloja la conversión a formato single-file nativo de ComfyUI del checkpoint podado `diffusers-modular/MiniMax-H3-Pruned-Ref-Delta-Fused-r1024`, que a su vez deriva de los modelos `MiniMaxAI/MiniMax-H3` y `Comfy-Org/MiniMax-H3`. MiniMax-H3 es un modelo de difusión de texto e imagen a vídeo con audio sincronizado en 3D, desarrollado por MiniMax, y esta conversión permite utilizarlo directamente en ComfyUI sin necesidad de la infraestructura completa de Diffusers.

El archivo principal en BF16 ocupa 37,472 GiB y contiene únicamente el transformer de difusión (50 bloques), excluyendo text encoder, tokenizer, VAE y el resto del pipeline. Se incluyen además dos variantes cuantizadas a INT8 con política mixta (150 capas lineales cuantizadas, mientras que las capas `fc2` de los MLP permanecen en BF16) para reducir el uso de memoria. Es un paquete experimental, sin entrenamiento adicional, y con licencia comunitaria específica de MiniMax.

La relevancia actual radica en que facilita la adopción de MiniMax-H3 en flujos de trabajo locales de ComfyUI, con opciones de cuantización para adaptarse a distintos hardware, aunque requiere el resto de componentes del modelo para funcionar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) para vídeo, con 50 bloques |
| Parámetros totales | No disponible (archivo BF16 de ~37,5 GiB) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16, INT8 tensorwise, INT8 ConvRot (groupsize 256) |
| Idiomas soportados | No disponible |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors (single-file, formato ComfyUI) |

## Arquitectura y entrenamiento

El checkpoint es una conversión nativa de ComfyUI del modelo podado `diffusers-modular/MiniMax-H3-Pruned-Ref-Delta-Fused-r1024`, que a su vez proviene del modelo original `MiniMaxAI/MiniMax-H3`. La arquitectura es un diffusion transformer (DiT) para generación de vídeo con audio sincronizado, con una representación de timestep podada basada en una tabla AdaLN de 1025×8 (F32) en lugar del MLP completo de timestep. La conversión incluye la fusión de los sesgos plegados de los bloques AdaLN y la reconstrucción de los tensores `qkv_proj` y del orden SwiGLU.

No se ha realizado entrenamiento, ajuste fino ni adaptación de pesos; se trata únicamente de una conversión de formato y empaquetado de cuantización. Las variantes INT8 utilizan el formato nativo `int8_tensorwise` de ComfyUI, con 150 capas lineales cuantizadas por bloque (qkv_proj, out_proj, fc1) y las capas `fc2` en BF16 para evitar problemas de memoria en la ruta `swiglu`. No se dispone de información sobre el entrenamiento original del modelo MiniMax-H3 (datos, tokens, metodología).

## Capacidades

- Generación de vídeo a partir de texto o imagen de referencia, con audio sincronizado en 3D (según los tags del modelo).
- Integración directa en ComfyUI como archivo single-file, sin necesidad de usar Diffusers.
- Soporte de cuantización mixta INT8/BF16 para reducir el consumo de memoria.
- Uso de una tabla AdaLN podada para el condicionamiento de timestep, lo que simplifica la arquitectura.
- Compatibilidad con el pipeline completo de MiniMax-H3 (text encoder, VAE) si se añaden los componentes externos.

## Casos de uso

- Generación de clips de vídeo con audio sincronizado para prototipado en ComfyUI: el usuario puede cargar el single-file y combinar prompts de texto e imágenes de referencia para obtener vídeo con sonido, sin necesidad de infraestructura de Diffusers.
- Investigación y experimentación con arquitecturas de difusión de vídeo: el checkpoint podado permite estudiar el comportamiento de la tabla AdaLN y las técnicas de poda sin entrenar desde cero.
- Desarrollo de workflows de producción de vídeo para contenido creativo: integrable en pipelines de ComfyUI para crear vídeos con estilo controlado, aprovechando la cuantización INT8 para máquinas con VRAM limitada.
- Evaluación de la calidad de vídeo con audio generado: útil para comparar la salida del modelo original frente a las variantes cuantizadas, midiendo el impacto en la fidelidad.
- Pruebas de rendimiento en hardware de consumo: las variantes INT8 permiten probar el modelo en GPUs de 24 GB (p.ej., RTX 4090) aunque el BF16 requiere más memoria.
- Uso como componente de un pipeline de generación de contenido para redes sociales: con el pipeline completo de MiniMax-H3, se puede generar vídeo corto con audio para plataformas de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se incluyen métricas de MMLU, HumanEval, GSMM8K ni otros estándares, ya que se trata de un modelo de generación de vídeo y no de razonamiento o código.

## Requisitos de hardware

- El archivo BF16 ocupa ~37,5 GiB, por lo que se requiere una GPU con al menos 48 GB de VRAM para cargarlo en memoria sin cuantización.
- Las variantes INT8 reducen el consumo de memoria, aunque no se especifican cifras exactas; se recomienda probar en GPUs de 24 GB (RTX 4090, A5000) con las variantes INT8.
- No se ha publicado información sobre latencia o throughput.
- Despliegue: el modelo está diseñado para ComfyUI, no para vLLM, llama.cpp, Ollama o TGI. Requiere el pipeline completo de MiniMax-H3 para funcionar (text encoder, VAE).
- Para producción, se recomienda validar la estabilidad de la cuantización INT8 en secuencias largas, ya que la card menciona problemas de OOM en la ruta `swiglu` cuando se cuantiza `fc2`.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directamente (p. ej., Stable Video Diffusion, CogVideoX, o el propio MiniMax-H3 original). Dado que es una conversión de formato, no un modelo independiente, su comparativa es con el modelo base y sus variantes de cuantización.

## Limitaciones y advertencias

- El checkpoint contiene únicamente el transformer de difusión; no incluye text encoder, tokenizador, VAE ni el resto del pipeline de MiniMax-H3, por lo que no se puede ejecutar de forma aislada.
- Es un paquete experimental: la card lo etiqueta como "experimental" y no se han realizado ajustes de calidad tras la cuantización.
- La cuantización INT8 puede degradar la calidad de generación, especialmente en la capas `qkv_proj` y `out_proj`, aunque `fc2` se mantiene en BF16 para evitar problemas de memoria.
- La licencia es comunitaria de MiniMax (no es Apache 2.0), por lo que hay que revisar los términos para uso comercial.
- No hay información sobre sesgos del modelo, alucinación o limitaciones de idioma, ya que la documentación no las detalla.
- El modelo se ha probado solo en el contexto de ComfyUI; no se garantiza su funcionamiento con otros frameworks.

## Enlaces

- Repositorio Hugging Face: [xmarre/MiniMax-H3-Pruned-Ref-Delta-Fused-r1024-ComfyUI](https://huggingface.co/xmarre/MiniMax-H3-Pruned-Ref-Delta-Fused-r1024-ComfyUI)
- Modelo original MiniMax-H3: [MiniMaxAI/MiniMax-H3](https://huggingface.co/MiniMaxAI/MiniMax-H3)
- Linaje ComfyUI: [Comfy-Org/MiniMax-H3](https://huggingface.co/Comfy-Org/MiniMax-H3)
- Fuente inmediata: [diffusers-modular/MiniMax-H3-Pruned-Ref-Delta-Fused-r1024](https://huggingface.co/diffusers-modular/MiniMax-H3-Pruned-Ref-Delta-Fused-r1024)
- Guía de workflows de MiniMax H3 en ComfyUI: [MiniMax Design](https://design.minimax.io/tools/minimax-h3-comfyui)
- Hub de MiniMax H3: [GitHub ai-models-lab/minimax-h3](https://github.com/ai-models-lab/minimax-h3)
- Página de archivos de modelo: [minimaxh3.run](https://minimaxh3.run/minimax-h3-model-files-downloads)
