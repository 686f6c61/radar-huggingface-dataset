# tencent/WeMM-Ecom-4B-GPTQ

## Resumen

WeMM-Ecom-4B-GPTQ es la versión cuantizada en GPTQ W4A16 del modelo multimodal WeMM-Ecom-4B, desarrollado por WeChat Vision (Tencent) para la comprensión de contenido en el contexto del comercio electrónico de WeChat. El modelo parte de una arquitectura densa de 4B parámetros (etiquetada como `qwen3_5` en el repositorio) y procesa entradas de texto, imagen, multi-imagen y vídeo, devolviendo respuestas conversacionales. Esta release concreta reduce el peso de los pesos a 4 bits manteniendo las activaciones en 16 bits, lo que facilita el despliegue en infraestructura más modesta sin renunciar a la ventana de contexto de 262.144 tokens.

La relevancia del modelo radica en su especialización: la familia WeMM-Ecom está entrenada y evaluada sobre 28 benchmarks de comercio electrónico agrupados en ocho escenarios (atributos de producto, moderación, OCR, recuperación, grounding, razonamiento, benchmarks públicos y conocimiento de producto), además de 64 benchmarks generales en ocho categorías. Según la model card, el checkpoint 4B supera a Qwen3.5-4B en 6,47 puntos de media en la suite de e-commerce y en 0,40 puntos en la suite general.

La versión GPTQ conserva la licencia Apache 2.0 del modelo base y se distribuye en formato `compressed-tensors` listo para servirse con el backend homónimo de vLLM (a partir de la versión 0.31.0). El modelo soporta modos "instruct" y "thinking" (razonamiento híbrido), lo que lo hace apto tanto para respuestas directas de baja latencia como para tareas que requieren razonamiento multi-paso sobre imágenes de producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (etiqueta `qwen3_5`), con encoder de visión y proyección a espacio de lenguaje |
| Parametros totales | 4.539.265.536 (aproximadamente 4,54B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GPTQ W4A16 (pesos 4 bits, activaciones 16 bits), grupos de 128 valores, cuantización simétrica; encoder de visión, cabeza de salida y proyecciones sensibles en precisión original |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors empaquetados en formato `compressed-tensors` (GPTQ 4-bit) |

## Arquitectura y entrenamiento

El modelo es un transformer denso multimodal de 4B parámetros construido sobre una base etiquetada como `qwen3_5`. Acepta entradas de texto, imagen única, múltiples imágenes y vídeo, y genera respuestas de texto conversacionales. La arquitectura incorpora un encoder de visión cuya salida se proyecta al espacio de tokens del modelo de lenguaje; en esta versión GPTQ, el encoder de visión, la cabeza de salida y ciertas proyecciones sensibles se mantienen en su precisión original para preservar la calidad de la representación visual.

El entrenamiento se orienta a la comprensión de contenido de comercio electrónico, con evaluación sobre 28 benchmarks específicos del dominio (atributos de producto, moderación, OCR, recuperación, grounding, razonamiento, benchmarks públicos y conocimiento de producto) y 64 benchmarks generales. La model card menciona un informe técnico con los resultados completos, pero no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo soporta un modo "thinking" de razonamiento extendido, lo que sugiere algún tipo de entrenamiento orientado a cadenas de razonamiento, aunque el procedimiento concreto no está especificado en la información disponible.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 262.144 tokens.
- Comprensión de imágenes: descripción, OCR, reconocimiento de atributos de producto y grounding visual.
- Comprensión de múltiples imágenes en una misma petición.
- Comprensión de vídeo como entrada multimodal.
- Modo "instruct" (respuesta directa) y modo "thinking" (razonamiento extendido multi-paso).
- Comprensión especializada de comercio electrónico: atributos de producto, moderación de contenido, recuperación de información y conocimiento de producto.
- Capacidades generales de VQA, comprensión de documentos y gráficos, razonamiento STEM, comprensión espacial, grounding y conteo, seguimiento de instrucciones y tareas centradas en texto.
- Soporte multilingüe limitado a chino e inglés.
- Servicio mediante API compatible con OpenAI a través de vLLM (texto, imagen, multi-imagen, vídeo, multi-turno y streaming).

## Casos de uso

- Moderación de listados de producto: el modelo puede analizar imágenes y texto de anuncios para detectar contenido prohibido o atributos inconsistentes, aprovechando sus benchmarks específicos de moderación y su ventana de contexto para procesar fichas completas.
- Extracción de atributos de producto: a partir de una o varias imágenes de un artículo, el modelo genera descripciones estructuradas (categoría, color, material, talla) útiles para poblar catálogos de e-commerce.
- OCR y digitalización de etiquetas: lectura de texto en imágenes de producto, etiquetas de envío o documentación de garantía, con salida en texto plano o estructurado.
- Búsqueda visual y recuperación: generación de representaciones textuales de imágenes de producto para alimentar sistemas de búsqueda o recomendación, apoyándose en las capacidades de retrieval evaluadas en la suite de e-commerce.
- Asistente de atención al cliente: conversaciones multi-turno con contexto largo sobre pedidos, devoluciones o especificaciones de producto, con capacidad de adjuntar imágenes del artículo.
- Análisis de vídeo de producto: revisión automática de vídeos de demostración o unboxing para verificar que el contenido coincide con la ficha del artículo.
- Procesamiento por lotes en pipelines de catálogo: al ser un modelo de 4B cuantizado a 4 bits, puede desplegarse con vLLM en GPUs de gama media para procesar grandes volúmenes de fichas de producto con latencia controlada.

## Benchmarks y rendimiento

La model card indica que el checkpoint 4B supera a Qwen3.5-4B en 6,47 puntos de media en la suite de e-commerce (28 benchmarks, ocho escenarios) y en 0,40 puntos en la suite general (64 benchmarks, ocho categorías), con puntuaciones en escala 0-100. Los resultados detallados se presentan en imágenes dentro de la model card y en el informe técnico, pero los valores numéricos por benchmark no están disponibles en formato textual en la información proporcionada.

| Comparación | Diferencia media frente a Qwen3.5-4B |
|---|---|
| Suite e-commerce (28 benchmarks) | +6,47 puntos |
| Suite general (64 benchmarks) | +0,40 puntos |

No se han publicado resultados numéricos por benchmark (MMLU, HumanEval, GSM8K u otros) en formato textual en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 3,8 GB en pesos GPTQ 4-bit; con overhead de activaciones, caché KV para contexto largo y el encoder de visión en precisión original, se recomienda al menos 8-12 GB de VRAM para contextos moderados.
- Para aprovechar la ventana completa de 262.144 tokens, la caché KV crece de forma significativa y requiere GPUs con 24 GB o más (RTX 4090, A10G, L40S).
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegues de producción con contexto largo; RTX 4090 o RTX 3090 para desarrollo y pruebas.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y potencialmente en GPUs de 12-16 GB con contextos reducidos.
- Opciones de despliegue: vLLM (>= 0.31.0) con backend `compressed-tensors` es la vía documentada; el ecosistema de la familia incluye formatos GGUF y FP8 para otros motores, aunque esta release concreta es GPTQ.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| WeMM-Ecom-4B-GPTQ | 4,54B (denso) | 262.144 | Apache 2.0 | GPTQ W4A16, safetensors | Especializado en e-commerce, multimodal |
| WeMM-Ecom-4B (BF16) | 4,54B (denso) | 262.144 | Apache 2.0 | BF16 safetensors | Mismo modelo sin cuantizar |
| Qwen3.5-4B | 4B (denso) | No disponible | No disponible | No disponible | Referencia de comparación citada en la model card |
| WeMM-Ecom-9B | 9B (denso) | 262.144 | Apache 2.0 | BF16, FP8, GPTQ, GGUF | Versión superior de la misma familia |

La model card cita a Qwen3.5-4B como referencia directa, con una ventaja de +6,47 puntos en e-commerce y +0,40 en general para WeMM-Ecom-4B. No se dispone de datos de benchmarks frente a otros modelos multimodales de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Idiomas limitados a chino e inglés; el rendimiento en castellano no está evaluado ni garantizado.
- Especialización en comercio electrónico: aunque mantiene capacidades generales, su entrenamiento está sesgado hacia el dominio de producto y puede mostrar menor rendimiento en tareas generales fuera de ese ámbito.
- Riesgo de alucinación en descripciones de producto, atributos u OCR, especialmente con imágenes de baja calidad o poco habituales; se recomienda validación humana en flujos críticos.
- La cuantización GPTQ W4A16 puede introducir una degradación ligera de calidad frente al checkpoint BF16; la model card no cuantifica esta pérdida.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye "tal cual", sin garantías; conviene revisar el archivo LICENSE del repositorio.
- El despliegue cuantizado requiere vLLM >= 0.31.0 con backend `compressed-tensors`; otros motores pueden no soportar este formato directamente.
- El contexto de 262.144 tokens exige una gestión cuidadosa de la memoria KV en producción; no se han publicado cifras de latencia ni throughput.
- El modelo tiene muy poca tracción comunitaria en el momento de la ficha (0 descargas, 1 like), por lo que el soporte y la validación externa son limitados.

## Enlaces

- [Hugging Face: tencent/WeMM-Ecom-4B-GPTQ](https://huggingface.co/tencent/WeMM-Ecom-4B-GPTQ)
- [Modelo base: tencent/WeMM-Ecom-4B](https://huggingface.co/tencent/WeMM-Ecom-4B)
- [Versión FP8: tencent/WeMM-Ecom-4B-FP8](https://huggingface.co/tencent/WeMM-Ecom-4B-FP8)
- [Versión GGUF: tencent/WeMM-Ecom-4B-GGUF](https://huggingface.co/tencent/WeMM-Ecom-4B-GGUF)
- [Colección WeMM-Ecom en Hugging Face](https://huggingface.co/collections/tencent/wemm-ecom)
- [Repositorio GitHub: Tencent/WeMM-Ecom](https://github.com/Tencent/WeMM-Ecom)
- [Documentación de vLLM](https://docs.vllm.ai/en/latest/getting_started/installation/gpu/)
- [Sitio corporativo de Tencent](https://www.tencent.com/)
