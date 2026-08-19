# W-Zil/Krea2_Turbo_LowVram_AllFiles_WorkFlows

## Resumen

Este repositorio de HuggingFace, publicado por el usuario W-Zil, no contiene un modelo nuevo en sí, sino un paquete completo de archivos y flujos de trabajo (workflows) de ComfyUI para ejecutar **Krea 2 Turbo** en modo Int8 en GPUs con VRAM limitada (probado en 15 GB). Krea 2 Turbo es el modelo de generación de imágenes más rápido de la familia Krea 2, desarrollado por la empresa Krea, y está pensado para iteración rápida sobre ilustraciones expresivas y exploración visual de estilos.

El repositorio incluye el modelo de difusión principal cuantizado a Int8 (`krea2_turbo_int8_convrot.safetensors`, con 4.022.468.096 parámetros), dos variantes del text encoder Qwen3-VL de 4B (una en GGUF Q4_K_M y otra en FP8), un VAE (`qwen_image_vae.safetensors`) y una LoRA de estilo (`krea2_darkbrush.safetensors`). Además, proporciona tres workflows JSON listos para arrastrar al lienzo de ComfyUI: text-to-image estándar, text-to-image con el modelo Int8, y una variante con referencia de estilo. La licencia indicada es `stability-community`, lo que implica restricciones específicas para uso comercial (ver sección de limitaciones).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (no se especifica el tipo exacto, probablemente transformer-based) con text encoder Qwen3-VL de 4B |
| Parametros totales | 4.022.468.096 (modelo de difusion principal, cuantizado Int8) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (el text encoder Qwen3-VL soporta contexto multimodal, pero no se especifica la longitud para este uso) |
| Tipos de cuantizacion | Int8 (modelo de difusion), GGUF Q4_K_M y FP8 (text encoder) |
| Idiomas soportados | no disponible (aunque Qwen3-VL es multilingue, la model card no lo especifica) |
| Licencia | stability-community (licencia propia de Stability AI, con restricciones para uso comercial) |
| Formato de pesos | safetensors (modelo de difusion y VAE), GGUF (text encoder alternativo), safetensors FP8 (text encoder alternativo) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo Krea 2 Turbo en este repositorio. Se sabe que es un modelo de difusion para generacion de imagenes, y que el text encoder es Qwen3-VL, un modelo multimodal de 4B parametros desarrollado por Alibaba. El archivo principal del modelo de difusion esta cuantizado a Int8 (probablemente mediante conversion post-entrenamiento) para reducir el uso de VRAM. El repositorio no incluye informacion sobre el dataset de entrenamiento, el numero de tokens procesados, ni si se aplicaron tecnicas como RLHF o DPO. Tampoco se mencionan innovaciones tecnicas especificas del modelo Krea 2 Turbo en esta model card; para eso habria que consultar la documentacion oficial de Krea.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) con el modelo Krea 2 Turbo.
- Generacion de imagenes con referencia de estilo (style reference conditioning) mediante el workflow `image_krea2_turbo_int8_image_style_reference.json`, que permite subir una o mas imagenes de referencia para guiar la estetica del resultado.
- Aplicacion de una LoRA adicional (`krea2_darkbrush.safetensors`) para modificar el estilo de las imagenes generadas.
- Ejecucion en ComfyUI con soporte para cargadores GGUF (via ComfyUI-GGUF) y cargadores estandar (para el text encoder FP8).
- Compatibilidad con endpoints (el tag `endpoints_compatible` sugiere que puede desplegarse como API, aunque no se detalla).
- Capacidad conversacional (tag `conversational`), aunque no se explica como se usa en este contexto de generacion de imagenes.

## Casos de uso

- **Iteracion rapida de ilustraciones expresivas**: Krea 2 Turbo esta disenado para generar imagenes rapidamente, por lo que es adecuado para artistas y disenadores que necesitan explorar multiples variaciones de un concepto sin esperar tiempos largos de inferencia.
- **Generacion de imagenes en equipos con GPU limitada**: el paquete Int8 permite ejecutar el modelo en GPUs con 15 GB de VRAM, lo que lo hace util para estudios pequenos o creadores individuales que no disponen de hardware de gama alta.
- **Control de estilo mediante imagenes de referencia**: el workflow con style reference permite a los usuarios guiar la estetica de las imagenes generadas usando ejemplos visuales, util para mantener una identidad visual consistente en proyectos de branding o ilustracion.
- **Integracion en pipelines de ComfyUI**: los workflows JSON se pueden arrastrar directamente al lienzo de ComfyUI, lo que facilita la automatizacion de procesos de generacion y la combinacion con otros nodos (upscaling, inpainting, etc.).
- **Prototipado de conceptos visuales**: los equipos de producto pueden usar el modelo para generar imagenes de referencia rapidas antes de invertir en produccion de alta calidad con modelos mas pesados.
- **Aplicacion de estilos especificos mediante LoRA**: la LoRA `krea2_darkbrush` permite aplicar un estilo de pincel oscuro a las generaciones, adecuado para ilustraciones con estetica dramatica o conceptual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como FID, CLIP score ni comparaciones con otros modelos. El unico dato de rendimiento mencionado es que el modelo Int8 esta probado en una GPU de 15 GB de VRAM, pero no se proporcionan cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: 15 GB (probado por el autor en una GPU con 15 GB, usando el modelo Int8 y el text encoder en GGUF o FP8).
- GPU recomendadas: cualquier GPU con al menos 15 GB de VRAM, por ejemplo RTX 4080, RTX 4090, A5000, A6000, o GPUs de data center como A10G o L4. No se requiere GPU de gama alta.
- Compatible con GPUs consumer: si, siempre que tengan 15 GB o mas de VRAM (por ejemplo, RTX 4080 con 16 GB).
- Opciones de despliegue: ComfyUI (local), con nodos personalizados ComfyUI-GGUF, ComfyUI-Impact-Pack, ComfyUI-Manager y ComfyUI-Krea2T-Enhancer. No se mencionan otros frameworks como vLLM u Ollama, ya que es un modelo de difusion, no un LLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa rigurosa con otros modelos de generacion de imagenes. El repositorio no incluye benchmarks ni comparaciones. Se puede mencionar que Krea 2 Turbo compite con otros modelos de difusion rapidos como SDXL Turbo, LCM o SD3 Medium, pero no hay datos en la informacion proporcionada para sustentar una comparacion numerica. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- **Licencia restrictiva**: la licencia `stability-community` (de Stability AI) impone restricciones para uso comercial. Segun la informacion encontrada en Local AI Master, la licencia limita el uso comercial a empresas con ingresos inferiores a 1 millon de dolares anuales y a un maximo de 50 asientos. Para uso comercial por encima de esos limites se requiere una licencia empresarial de Stability AI.
- **Modelo cuantizado a Int8**: la cuantizacion puede degradar ligeramente la calidad de las imagenes en comparacion con la version BF16/FP16 original, aunque el autor indica que el resultado es funcional.
- **Dependencia de nodos personalizados**: para ejecutar los workflows es necesario instalar varios nodos de ComfyUI (ComfyUI-GGUF, ComfyUI-Impact-Pack, ComfyUI-Manager, ComfyUI-Krea2T-Enhancer), lo que anade complejidad de configuracion y posibles incompatibilidades de versiones.
- **Sin informacion sobre sesgos o alucinaciones**: no se ha publicado informacion sobre sesgos del modelo ni sobre su comportamiento en escenarios de generacion de contenido sensible.
- **Repositorio personal**: este repositorio es una coleccion personal de archivos, no el repositorio oficial de Krea. Los archivos pueden no estar actualizados con la ultima version del modelo.
- **Falta de documentacion tecnica**: la model card no incluye detalles sobre el entrenamiento, los datos utilizados ni las limitaciones especificas del modelo Krea 2 Turbo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/W-Zil/Krea2_Turbo_LowVram_AllFiles_WorkFlows
- Modelo oficial Krea-2-Turbo en HuggingFace: https://huggingface.co/krea/Krea-2-Turbo
- Guia de Krea 2 local (Local AI Master): https://localaimaster.com/blog/krea-2-local-guide
- Pagina de Krea 2 Turbo en Krea: https://www.krea.ai/models/krea-2-turbo
- Documentacion de Krea 2 Turbo: https://www.krea.ai/docs/user-guide/features/krea-2-turbo
- Guia de workflow ComfyUI para Krea 2 Turbo: https://www.earngenix.com/workflows/krea-2-comfyui
- ComfyUI-GGUF (nodo personalizado): https://github.com/city96/ComfyUI-GGUF
- ComfyUI-Impact-Pack: https://github.com/ltdrdata/ComfyUI-Impact-Pack
- ComfyUI-Manager: https://github.com/comfy-org/ComfyUI-Manager
- ComfyUI-Krea2T-Enhancer: https://github.com/capitan01R/ComfyUI-Krea2T-Enhancer
