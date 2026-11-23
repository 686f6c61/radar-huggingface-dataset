# tencent/WeMM-Ecom-0.8B-FP8

## Resumen

WeMM-Ecom-0.8B-FP8 es la variante cuantizada en FP8 del modelo multimodal WeMM-Ecom-0.8B, desarrollado por WeChat Vision (Tencent) para la comprensión de contenido en el comercio electrónico de WeChat. Se trata de un modelo denso de aproximadamente 853 millones de parámetros (852.985.920 según los pesos en safetensors) que procesa entradas de imagen y texto (pipeline `image-text-to-text`) y forma parte de una familia que incluye variantes de 0,8B, 2B, 4B, 9B y 35B-A3B.

El modelo se apoya en la arquitectura identificada en sus etiquetas como `qwen3_5` y añade un modo de razonamiento híbrido ("hybrid thinking"), con ventanas de contexto de hasta 262.144 tokens. Su propósito es cubrir tareas específicas del dominio e-commerce (atributos de producto, moderación, OCR, recuperación, grounding, razonamiento y conocimiento de producto) sin renunciar a capacidades generales de visión-lenguaje comparables a modelos del mismo tamaño.

Esta versión FP8 emplea cuantización por bloques (escala por bloque de 128 × 128) con cuantización dinámica de activaciones en inferencia, manteniendo en precisión original el codificador visual, la cabeza de salida y determinadas proyecciones sensibles. Es relevante para despliegues en producción porque reduce el coste de memoria del checkpoint (repo de 1,2 GB) manteniendo compatibilidad con motores de servicio que soportan FP8 por bloques, como vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (etiqueta `qwen3_5`), con codificador visual y modo de pensamiento híbrido |
| Parametros totales | 852.985.920 (~0,85B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | FP8 E4M3 por bloques (escala 128 × 128), activaciones FP8 dinámicas; la familia ofrece además BF16, GPTQ y GGUF |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (FP8 E4M3) |

## Arquitectura y entrenamiento

WeMM-Ecom-0.8B es un modelo denso de 0,8B parámetros con arquitectura multimodal de tipo transformer, construida sobre la familia identificada como `qwen3_5`, que combina un codificador visual con un modelo de lenguaje para aceptar texto, imagen, multi-imagen y vídeo como entradas. Incorpora un modo de razonamiento híbrido ("thinking mode") que puede activarse o desactivarse, y soporta ventanas de contexto de 262.144 tokens. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO; esa información se remite al informe técnico del autor, no incluido en los datos disponibles.

La innovación destacable de esta ficha concreta es la cuantización: los pesos se almacenan en FP8 E4M3 con una escala por cada bloque de 128 × 128, las activaciones se cuantizan dinámicamente durante la inferencia y se preservan en precisión original el codificador visual, la cabeza de salida y ciertas proyecciones sensibles. El checkpoint incluye su configuración de cuantización, que vLLM detecta automáticamente. Según el autor, el modelo supera a Qwen3.5-0.8B en 16,43 puntos y a MiniCPM-V-4.7-1B en 13,03 puntos en la media de benchmarks de e-commerce, y en 6,93 y 1,09 puntos respectivamente en la media de benchmarks generales.

## Capacidades

- Comprensión multimodal de imagen y texto: descripción, extracción de atributos y respuesta a preguntas visuales.
- Entrada de múltiples imágenes y de vídeo, además de texto e imagen única.
- OCR y comprensión de documentos y gráficos.
- Razonamiento STEM y comprensión espacial.
- Grounding y conteo de objetos en imágenes.
- Comprensión multi-imagen e instrucciones complejas.
- Modo de pensamiento híbrido (thinking mode) activable para tareas de razonamiento.
- Conversación multi-turno y streaming mediante API compatible con OpenAI.
- Capacidades específicas de e-commerce: atributos de producto, moderación de contenido, recuperación, razonamiento sobre producto y conocimiento de producto.
- Idiomas: chino e inglés.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes y multi-step reasoning más allá del thinking mode: no disponible en la información proporcionada.

## Casos de uso

- Moderación de contenido en marketplace: el modelo puede analizar imágenes y texto de anuncios para detectar productos prohibidos o contenido inapropiado, apoyándose en sus benchmarks específicos de moderación del suite de e-commerce.
- Extracción de atributos de producto: a partir de fotos de catálogo, generar fichas estructuradas (color, material, categoría, talla) gracias a sus capacidades de OCR y grounding.
- Búsqueda visual y recuperación: indexar imágenes de producto y responder consultas de recuperación multimodal, usando la ventana de 262.144 tokens para incluir contexto amplio de catálogo.
- Atención al cliente con imágenes: gestionar conversaciones multi-turno en las que el usuario adjunta fotos de un pedido o producto, con respuestas en chino o inglés.
- Análisis de reseñas con vídeo e imagen: procesar vídeos cortos y múltiples imágenes enviadas por compradores para resumir quejas o validar devoluciones.
- Asistencia a vendedores: generación de descripciones y respuestas a preguntas frecuentes a partir de imágenes del producto, con el modo thinking para razonamientos sobre compatibilidad o especificaciones.
- Despliegue en producción con vLLM: servir el checkpoint FP8 en GPUs con soporte FP8 para reducir memoria y coste por petición en pipelines de e-commerce a gran escala.

## Benchmarks y rendimiento

La model card referencia tablas y gráficos de resultados (28 benchmarks de e-commerce en ocho escenarios y 64 benchmarks generales en ocho categorías, en escala 0-100) que no están incluidos como cifras textuales en la información disponible. Los únicos datos numéricos publicados son las diferencias medias frente a modelos comparables:

| Comparativa (media de benchmarks) | Diferencia a favor de WeMM-Ecom-0.8B |
|---|---|
| E-commerce vs. Qwen3.5-0.8B | +16,43 puntos |
| E-commerce vs. MiniCPM-V-4.7-1B | +13,03 puntos |
| General vs. Qwen3.5-0.8B | +6,93 puntos |
| General vs. MiniCPM-V-4.7-1B | +1,09 puntos |

No se han publicado resultados de benchmarks individuales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo FP8 ocupa 1,2 GB; con overhead de activaciones, KV cache y codificador visual, se estima un consumo moderado, apto para GPUs de gama media, aunque no se publican cifras oficiales de VRAM.
- GPU recomendadas: se requiere una GPU con soporte de FP8 (por ejemplo, arquitecturas Hopper o Ada Lovelace en adelante); el autor no detalla modelos concretos.
- GPU de consumo: por tamaño del checkpoint (1,2 GB), es probable que quepa en GPUs de consumo con soporte FP8, pero no se confirma en la información disponible.
- Opciones de despliegue: vLLM (versión >= 0.31.0 según el quick start) con API compatible con OpenAI; la familia ofrece además formatos GGUF y GPTQ para otros motores, aunque esta ficha concreta es FP8.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| WeMM-Ecom-0.8B-FP8 | ~0,85B | 262.144 | Apache 2.0 | Multimodal e-commerce, FP8 por bloques, zh/en |
| Qwen3.5-0.8B | ~0,8B (según referencia del autor) | No disponible | No disponible | Referencia de comparación del autor; superado en +16,43 (e-commerce) y +6,93 (general) |
| MiniCPM-V-4.7-1B | ~1B (según referencia del autor) | No disponible | No disponible | Referencia de comparación del autor; superado en +13,03 (e-commerce) y +1,09 (general) |
| WeMM-Ecom-0.8B (BF16) | ~0,85B | 262.144 | Apache 2.0 | Mismo modelo en precisión completa |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; al entrenarse sobre datos de e-commerce de WeChat, puede heredar sesgos de ese dominio y de sus idiomas principales.
- Riesgo de alucinación: inherente a los modelos generativos multimodales; no se publican tasas de error específicas.
- Limitaciones de idioma: solo se declaran chino e inglés; el rendimiento en castellano no está garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar el archivo LICENSE enlazado en el repo.
- Requisito de hardware: el despliegue FP8 exige GPU con soporte FP8 y un motor con cuantización FP8 por bloques (vLLM >= 0.31.0); no funcionará en GPUs sin esa capacidad.
- Especialización de dominio: el modelo está optimizado para e-commerce; su rendimiento fuera de ese ámbito puede ser inferior al de modelos generalistas del mismo tamaño.
- Datos de entrenamiento y evaluación: la composición del dataset y las cifras detalladas de benchmarks no están disponibles en la información proporcionada; deben consultarse en el informe técnico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeMM-Ecom-0.8B-FP8
- Modelo base BF16: https://huggingface.co/tencent/WeMM-Ecom-0.8B
- Variante GPTQ: https://huggingface.co/tencent/WeMM-Ecom-0.8B-GPTQ
- Variante GGUF: https://huggingface.co/tencent/WeMM-Ecom-0.8B-GGUF
- Colección de la familia: https://huggingface.co/collections/tencent/wemm-ecom
- Repositorio GitHub: https://github.com/Tencent/WeMM-Ecom
- Documentación de vLLM: https://docs.vllm.ai/en/latest/getting_started/installation/gpu/
- Licencia: https://huggingface.co/tencent/WeMM-Ecom-0.8B-FP8/blob/main/LICENSE
