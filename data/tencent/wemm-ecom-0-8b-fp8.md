# tencent/WeMM-Ecom-0.8B-FP8

## Resumen

WeMM-Ecom-0.8B-FP8 es la versión cuantizada en FP8 por bloques del modelo multimodal WeMM-Ecom-0.8B, desarrollado por WeChat Vision (Tencent) para la comprensión de contenido en el comercio electrónico de WeChat. El modelo parte de una arquitectura densa de aproximadamente 853 millones de parámetros (852.985.920 según los pesos en safetensors) y una ventana de contexto de 262.144 tokens, y acepta entradas de texto, imagen, múltiples imágenes y vídeo. Su propósito es resolver tareas específicas del dominio del e-commerce (atributos de producto, moderación de contenido, OCR, recuperación, grounding, razonamiento y conocimiento de producto) sin renunciar a capacidades visuales y lingüísticas de carácter general.

La relevancia de esta variante concreta reside en la cuantización: los pesos se almacenan en FP8 E4M3 con una escala por cada bloque de 128 × 128, y las activaciones se cuantizan dinámicamente en FP8 durante la inferencia, mientras que el codificador visual, la cabeza de salida y determinadas proyecciones sensibles conservan su precisión original. Esto reduce el peso del repositorio a 1,2 GB y permite desplegar el modelo en GPUs con soporte de FP8 mediante motores de serving compatibles, como vLLM (versión 0.31.0 o superior según la model card).

El modelo forma parte de una familia que incluye variantes de 0,8B, 2B, 4B, 9B y 35B-A3B, y se distribuye bajo licencia Apache 2.0. Está pensado para despliegues conversacionales y de análisis de catálogo donde el coste por inferencia y la latencia importan, manteniendo un modo de razonamiento híbrido (instruct y thinking) heredado del checkpoint base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso (familia qwen3_5), pipeline image-text-to-text |
| Parametros totales | 852.985.920 (aproximadamente 0,85B) |
| Parametros activos | No aplica (modelo denso; la variante MoE de la familia es 35B-A3B) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | FP8 E4M3 con escala por bloque de 128 × 128 (esta variante); el modelo base ofrece BF16, GPTQ y GGUF |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (FP8 E4M3) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal denso de la familia qwen3_5, con un codificador visual que procesa imágenes y vídeo y un decodificador de lenguaje que integra las representaciones visuales para generar respuestas de texto. Acepta entradas de texto, imagen única, múltiples imágenes y vídeo, y soporta conversaciones multi-turno con una ventana de contexto de 262.144 tokens. La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset; sí indica que el modelo se evalúa en 28 benchmarks de e-commerce agrupados en ocho escenarios y en 64 benchmarks generales en ocho categorías, y que dispone de modo instruct y modo thinking.

La innovación técnica destacable de esta variante es la cuantización FP8 por bloques: los pesos usan FP8 E4M3 con una escala por cada bloque de 128 × 128, las activaciones se cuantizan dinámicamente en FP8 durante la inferencia y se preservan en precisión original el codificador visual, la cabeza de salida y ciertas proyecciones sensibles. El checkpoint incluye su configuración de cuantización, que vLLM detecta automáticamente. No se dispone de información sobre el uso de RLHF, DPO u otras etapas de alineación en la información proporcionada.

## Capacidades

- Comprensión de imágenes y vídeo: procesa entradas de texto, imagen, multi-imagen y vídeo en un único pipeline image-text-to-text.
- Comprensión específica de e-commerce: atributos de producto, moderación de contenido, OCR, recuperación, grounding, razonamiento sobre productos y conocimiento de producto.
- Capacidades visuales generales: VQA general, comprensión de documentos y gráficos, razonamiento STEM, comprensión espacial, grounding y conteo, comprensión multi-imagen y seguimiento de instrucciones.
- Modo de razonamiento híbrido: dispone de modo instruct y modo thinking, con resultados de benchmark publicados para ambos.
- Conversación multi-turno: soporta diálogos con historial y streaming mediante API compatible con OpenAI servida por vLLM.
- Multilingüismo: chino e inglés.
- No se menciona en la información disponible soporte explícito de tool calling o function calling, ni capacidades de audio.

## Casos de uso

- Catalogación automática de productos: el modelo puede extraer atributos de producto a partir de imágenes y descripciones, apoyándose en su entrenamiento específico en atributos de e-commerce y en su contexto de 262.144 tokens para procesar fichas extensas.
- Moderación de contenido en marketplace: análisis de imágenes y texto de anuncios para detectar contenido no permitido, usando las capacidades de moderación evaluadas en el conjunto de benchmarks de e-commerce del modelo.
- OCR y extracción de datos de etiquetas y embalajes: lectura de texto en imágenes de producto para poblar bases de datos de catálogo, aprovechando las tareas de OCR incluidas en su suite de evaluación.
- Búsqueda visual y recuperación de productos: generación de descripciones y representaciones a partir de imágenes para sistemas de recuperación, dado el soporte de tareas de retrieval en su entrenamiento de dominio.
- Asistente de atención al cliente en comercio electrónico: conversaciones multi-turno con contexto largo para resolver dudas sobre productos, pedidos o políticas, con despliegue en vLLM mediante API compatible con OpenAI.
- Análisis de reseñas con imágenes: comprensión conjunta de fotografías de clientes y texto de reseñas para detectar problemas de calidad o discrepancias con la ficha del producto.
- Procesamiento de vídeo de producto: análisis de vídeos demostrativos o de unboxing para generar descripciones y metadatos, gracias al soporte de entrada de vídeo.
- Despliegue en entornos con recursos limitados: al ocupar 1,2 GB en FP8, puede servirse en GPUs con soporte FP8 para cargas de trabajo de alto volumen donde el coste por token es crítico.

## Benchmarks y rendimiento

La model card publica comparativas del checkpoint base WeMM-Ecom-0.8B (BF16) frente a Qwen3.5-0.8B y MiniCPM-V-4.7-1B, expresadas como diferencias en la puntuación media (escala 0-100). Los resultados detallados por benchmark se presentan únicamente como imágenes en la model card y no están disponibles como cifras textuales en la información proporcionada.

| Comparativa | Diferencia media (e-commerce) | Diferencia media (general) |
|---|---|---|
| WeMM-Ecom-0.8B frente a Qwen3.5-0.8B | +16,43 puntos | +6,93 puntos |
| WeMM-Ecom-0.8B frente a MiniCPM-V-4.7-1B | +13,03 puntos | +1,09 puntos |

No se han publicado en la información disponible resultados numéricos por benchmark individual (MMLU, HumanEval, GSM8K u otros) ni mediciones de latencia o throughput para la variante FP8.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio FP8 ocupa 1,2 GB, por lo que los pesos caben holgadamente en GPUs de consumo; el consumo real de VRAM debe sumar la caché KV para contextos largos (hasta 262.144 tokens) y las activaciones, no cuantificados en la información disponible.
- GPU recomendadas: se requiere una GPU con soporte de FP8 y un motor de serving con soporte de FP8 por bloques; la model card no enumera modelos concretos de GPU.
- GPU de consumo: por tamaño de pesos (1,2 GB en FP8), el modelo es apto para GPUs de consumo con soporte FP8, aunque la información disponible no confirma compatibilidad con modelos específicos.
- Opciones de despliegue: vLLM (>= 0.31.0 según la model card) con API compatible con OpenAI; el checkpoint incluye su configuración de cuantización, que vLLM detecta automáticamente. Para otras opciones (llama.cpp, Ollama, TGI) la información disponible no confirma soporte de esta variante FP8; el modelo base ofrece formatos GGUF y GPTQ.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento relativo | Licencia | Formatos |
|---|---|---|---|---|---|
| WeMM-Ecom-0.8B-FP8 | ~0,85B | 262.144 tokens | Referencia de la familia | Apache 2.0 | Safetensors FP8 (base: BF16, GPTQ, GGUF) |
| Qwen3.5-0.8B | 0,8B (según denominación) | No disponible | Inferior en e-commerce (-16,43) y general (-6,93) según la model card | No disponible | No disponible |
| MiniCPM-V-4.7-1B | 1B (según denominación) | No disponible | Inferior en e-commerce (-13,03) y general (-1,09) según la model card | No disponible | No disponible |

Las diferencias de rendimiento proceden de las comparativas publicadas por el autor del modelo y se refieren al checkpoint base BF16; no se dispone de datos independientes ni de resultados de la variante FP8.

## Limitaciones y advertencias

- Idiomas: solo chino e inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Dominio: el ajuste está orientado al e-commerce de WeChat; el comportamiento fuera de ese dominio puede diferir del evaluado en los benchmarks generales.
- Alucinación: no se documentan en la información disponible medidas específicas de mitigación ni tasas de alucinación.
- Sesgos: no se documentan sesgos conocidos en la información proporcionada.
- Cuantización: la variante FP8 puede presentar degradación respecto al checkpoint BF16; la model card no publica métricas comparativas entre ambas variantes. Requiere GPU con soporte FP8 y un motor de serving compatible con FP8 por bloques.
- Contexto largo: aunque la ventana es de 262.144 tokens, no se documenta el rendimiento real en contextos cercanos al máximo ni el coste de memoria asociado.
- Licencia: Apache 2.0 permite uso comercial, pero debe verificarse el archivo LICENSE del repositorio y el cumplimiento de las condiciones de los modelos base y de los datos de entrenamiento, no detallados en la información disponible.
- Herramientas y agentes: no se confirma soporte de tool calling ni de razonamiento agéntico multi-paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeMM-Ecom-0.8B-FP8
- Modelo base BF16: https://huggingface.co/tencent/WeMM-Ecom-0.8B
- Variante GPTQ: https://huggingface.co/tencent/WeMM-Ecom-0.8B-GPTQ
- Variante GGUF: https://huggingface.co/tencent/WeMM-Ecom-0.8B-GGUF
- Familia de modelos: https://huggingface.co/tencent/WeMM-Ecom-2B, https://huggingface.co/tencent/WeMM-Ecom-4B, https://huggingface.co/tencent/WeMM-Ecom-9B, https://huggingface.co/tencent/WeMM-Ecom-35B-A3B
- Colección en Hugging Face: https://huggingface.co/collections/tencent/wemm-ecom
- Informe técnico (arXiv): https://arxiv.org/abs/2611.30662
- Página del paper en Hugging Face: https://huggingface.co/papers/2611.30662
- Repositorio GitHub: https://github.com/Tencent/WeMM-Ecom
- Documentación de vLLM: https://docs.vllm.ai/en/latest/getting_started/installation/gpu/
- Licencia: https://huggingface.co/tencent/WeMM-Ecom-0.8B-FP8/blob/main/LICENSE
