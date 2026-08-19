# Winnougan/ltx-2.5-w4a8-convrot-int4-convrot-Winnougan-Blessing

## Resumen

Este repositorio contiene checkpoints cuantizados del modelo LTX-2.5 de Lightricks, convertidos para su uso en ComfyUI mediante cuantización por capas W4A8 e INT4 ConvRot. El objetivo es permitir la generación de vídeo (texto a vídeo e imagen a vídeo) con un modelo de 22 000 millones de parámetros en GPUs de consumo con VRAM limitada. El trabajo ha sido realizado por Winnougan, que ha aplicado una conversión basada en el nodo Star Ultimate Model Converter y ha publicado tanto las versiones del transformer (distilled y dev) como del codificador de texto Gemma4-12B con proyecciones. La relevancia actual radica en que democratiza el acceso a un modelo de vídeo de gran tamaño, aunque con ciertas pérdidas de precisión inherentes a la cuantización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer 3D (AVTransformer3DModel) con atención cruzada audio-vídeo, basado en LTX-2.5 |
| Parametros totales | 22 000 millones (transformer) + 12 000 millones (codificador de texto Gemma4) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base LTX-2.5 soporta vídeo de hasta 5 segundos, pero no se especifica en esta conversión) |
| Tipos de cuantizacion | W4A8 (AsymW4A8Int8Layout) e INT4 (TensorCoreConvRotW4A4Layout) |
| Idiomas soportados | no disponible |
| Licencia | LTX-2.x Community License (con restricciones comerciales para entidades con ingresos anuales ≥ 10 M$) |
| Formato de pesos | safetensors (archivos separados para transformer y text encoder) |

## Arquitectura y entrenamiento

El modelo base es LTX-2.5, un modelo de difusión de vídeo de 22 000 millones de parámetros que combina generación de vídeo y audio sincronizado. La arquitectura incluye un transformer 3D con 48 bloques, atención cruzada entre modalidades de audio y vídeo, y un codificador de texto basado en Gemma4-12B con proyecciones adicionales. En esta conversión, se han cuantizado únicamente las proyecciones de atención (`self_attn.{q,k,v,o}_proj`) y las capas MLP (`mlp.{gate,up,down}_proj`) de cada bloque, manteniendo en precisión completa (FP32 o BF16) todas las capas de normalización, los módulos `adaln_single`, las proyecciones de entrada/salida (`patchify_proj`, `proj_out`) y las tablas de escala/desplazamiento. El proceso de cuantización se realizó capa por capa, siguiendo una lista negra de capas protegidas que fue verificada contra la referencia oficial INT8 de Lightricks, pero no contra referencias W4A8 o INT4 (que no existen oficialmente). No se proporcionan detalles sobre el entrenamiento del modelo base ni sobre el dataset utilizado.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video).
- Generación de vídeo a partir de imagen (image-to-video).
- Generación de audio sincronizado con el vídeo (gracias a las capas de mezcla audio-vídeo).
- Ejecución en GPUs de consumo con VRAM limitada gracias a la cuantización W4A8/INT4.
- Compatibilidad con ComfyUI mediante nodos estándar de carga de modelos de difusión.
- Soporte de dos modos: modelo destilado (más rápido) y modelo dev (mayor calidad, sin destilación).

## Casos de uso

- Prototipado rápido de vídeos conceptuales: un diseñador puede generar clips cortos a partir de descripciones textuales para validar ideas antes de producir contenido final, sin necesidad de una GPU de datacenter.
- Creación de contenido para redes sociales: generación de vídeos cortos (hasta 5 segundos) con audio sincronizado para plataformas como TikTok o Instagram, ejecutándose en una RTX 4090 o similar.
- Automatización de vídeos de demostración de productos: a partir de una imagen de producto y un prompt, se genera un vídeo animado para catálogos o páginas web.
- Generación de vídeos educativos o explicativos: creación de animaciones simples a partir de guiones textuales, con la ventaja de poder ejecutarse en hardware local sin depender de APIs externas.
- Investigación en generación de vídeo: los investigadores pueden estudiar el comportamiento de un modelo de 22B en tareas de síntesis de vídeo con recursos limitados, gracias a la cuantización.
- Integración en pipelines de postproducción: uso de ComfyUI para generar clips intermedios que luego se editan con herramientas de vídeo profesionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay métricas de calidad (FVD, CLIP score, etc.) ni comparaciones con el modelo original sin cuantizar.

## Requisitos de hardware

- VRAM estimada: no disponible (depende del formato elegido; la versión INT4 es más pequeña que la W4A8, pero no se especifican tamaños exactos de cada archivo).
- GPU recomendadas: el objetivo declarado es ejecutarse en GPUs de consumo. Se espera que funcione en RTX 3090, RTX 4090, o GPUs con al menos 16-24 GB de VRAM, aunque no se confirma.
- Compatibilidad con consumer GPU: sí, ese es el propósito principal de la cuantización.
- Opciones de despliegue: ComfyUI con comfy-kitchen (requiere soporte para `AsymW4A8Int8Layout` o `TensorCoreConvRotW4A4Layout` según el archivo). No se mencionan otros entornos como vLLM u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se proporcionan comparaciones con otros modelos de generación de vídeo cuantizados (por ejemplo, versiones cuantizadas de otros modelos de difusión de vídeo). La información se limita a la conversión de LTX-2.5.

## Limitaciones y advertencias

- La cuantización W4A8 e INT4 puede degradar la calidad del vídeo y del audio, especialmente en la sincronización entre modalidades. La lista negra de capas protegidas se verificó solo para INT8, por lo que no se garantiza un rendimiento óptimo en estos formatos más agresivos.
- No se han publicado benchmarks que cuantifiquen la pérdida de calidad respecto al modelo original BF16.
- Requiere una configuración específica de ComfyUI (comfy-kitchen) con soporte para layouts de cuantización; no es compatible con instalaciones estándar de ComfyUI.
- La licencia LTX-2.x Community restringe el uso comercial para empresas con ingresos anuales superiores a 10 millones de dólares. Es necesario revisar la política de uso aceptable.
- No se especifican los idiomas soportados por el codificador de texto; se asume que el modelo base LTX-2.5 tiene soporte multilingüe, pero no se confirma en esta conversión.
- El repositorio tiene 0 descargas y 7 likes, lo que sugiere que es una versión reciente o poco probada por la comunidad.

## Enlaces

- [Repositorio en HuggingFace](https://huggingface.co/Winnougan/ltx-2.5-w4a8-convrot-int4-convrot-Winnougan-Blessing)
- [Política de uso aceptable de LTX](https://static.lightricks.com/legal/ltx-acceptable-use-policy.pdf)
- [Modelo base LTX-2.5](https://huggingface.co/Lightricks/LTX-2.5)
