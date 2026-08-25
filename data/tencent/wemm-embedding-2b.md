# tencent/WeMM-Embedding-2B

## Resumen

WeMM-Embedding-2B es un modelo de embeddings multimodal universal desarrollado por Tencent, construido sobre el modelo base Qwen/Qwen3.5-2B. Acepta entradas de texto, imágenes, vídeos, documentos visuales y combinaciones interleaved de estos, y devuelve un embedding de 2048 dimensiones normalizado con norma L2. No soporta audio. Se trata de una solución pensada para tareas de recuperación, clasificación y búsqueda multimodal en entornos de producción.

El modelo destaca por su rendimiento en los benchmarks MMEB-v2 y MMEB-v3, donde supera a alternativas como Qwen3-VL-Embedding, VLM2Vec o GME del mismo tamaño. Además, incorpora embeddings Matryoshka (MRL), lo que permite reducir la dimensión del embedding hasta 256 manteniendo el 98,7% del rendimiento en tareas de imagen y vídeo, una característica útil para optimizar el almacenamiento y la latencia en sistemas de recuperación a gran escala.

Con 2.720 millones de parámetros, se posiciona como un modelo de tamaño medio que puede ejecutarse en GPU de consumo, lo que lo hace accesible para equipos de desarrollo e investigación que necesitan capacidades multimodales sin requerir infraestructura de alto coste.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen/Qwen3.5-2B (modelo de embeddings multimodal) |
| Parametros totales | 2.720.809.792 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el modelo se distribuye en bfloat16; no se documentan cuantizaciones adicionales) |
| Idiomas soportados | chino, ingles |
| Licencia | wemm-model-license (licencia propia de Tencent, ver enlace) |
| Formato de pesos | safetensors (compatible con transformers, vLLM y SGLang) |

## Arquitectura y entrenamiento

WeMM-Embedding-2B parte del modelo Qwen3.5-2B, al que se le añade una capa de proyección que produce embeddings de 2048 dimensiones normalizados con L2. La arquitectura es un transformer estándar (no MoE) adaptado para aceptar entradas multimodales (imagen, vídeo, texto y documentos visuales). No se han publicado detalles sobre el número de tokens de entrenamiento ni la composición del dataset. Se sabe que incorpora Matryoshka Representation Learning (MRL), lo que permite extraer subdimensiones del embedding final (por ejemplo, 256, 512, 1024) sin degradación significativa del rendimiento.

No se documenta el uso de técnicas como RLHF o DPO; el modelo está diseñado exclusivamente para generar representaciones, no para generar texto libre.

## Capacidades

- Generación de embeddings de 2048 dimensiones, normalizados con L2.
- Procesamiento de texto, imágenes, vídeos, documentos visuales y entradas interleaved (texto + imagen + vídeo en la misma secuencia).
- Soporte de embeddings Matryoshka (MRL): permite truncar la dimensión a 256, 512, 1024, etc., con degradación controlada del rendimiento (98.7% en imagen y vídeo con 256 dimensiones).
- Integración nativa con transformers (AutoModel) y sentence-transformers para uso directo en pipelines de recuperación.
- Compatible con vLLM (versión 0.27.0) y SGLang (versión 0.5.9) para despliegue en producción.
- Multilingüe limitado a chino e inglés.
- No soporta audio, como se indica en la documentación oficial.

## Casos de uso

- Recuperación multimodal en bases de datos: el modelo puede indexar imágenes, vídeos y documentos junto con texto, permitiendo búsquedas híbridas (por ejemplo, "foto de un perro en la playa" recupera tanto imágenes como vídeos relacionados).
- RAG multimodal: en un sistema de respuesta a preguntas sobre documentos visuales (informes, facturas, diagramas), el modelo genera embeddings de páginas completas para recuperar fragmentos relevantes antes de pasarlos a un LLM generativo.
- Clasificación de vídeo por contenido: se puede usar para agrupar vídeos según su temática o para recomendar contenido similar basado en similitud de embeddings.
- Búsqueda de documentos con imágenes y texto: en un corpus de documentos técnicos que incluyen figuras, tablas y texto, el modelo permite consultas que combinan descripción textual con la estructura visual.
- Deduplicación de contenido multimodal: comparando embeddings de imágenes o vídeos para detectar duplicados o variantes cercanas en plataformas de contenido.
- Filtrado y moderación de contenido: el modelo puede generar embeddings de imágenes y textos para entrenar clasificadores de contenido inapropiado o para detectar similitudes con material prohibido.
- Sistemas de recomendación multimodal: en plataformas de e-commerce o streaming, los embeddings de productos (imagen + texto) permiten recomendar artículos similares basándose en la similitud entre sus representaciones.

## Benchmarks y rendimiento

El modelo se evaluó en el benchmark MMEB-v2 (78 datasets) y MMEB-v3 (190 tareas). Los resultados se extraen del informe técnico.

**MMEB-v2** (las tareas de imagen y vídeo usan Hit@1, las de documentos visuales NDCG@5):

| Modelo | Tamaño | AVG | Image | Video | VisDoc |
|---|---|---|---|---|---|
| VLM2Vec | 2B | 47.8 | 59.7 | 29.0 | 44.0 |
| GME | 2B | 55.4 | 51.9 | 33.9 | 76.8 |
| VLM2Vec-V2 | 2B | 59.3 | 64.9 | 34.9 | 69.2 |
| Qwen3-VL-Embedding | 2B | 73.2 | 75.0 | 61.9 | 79.2 |
| DME-Small† | 2B | 74.8 | 75.9 | 65.6 | 79.9 |
| **WeMM-Embedding** | **2B** | **77.9** | **79.6** | **70.8** | **80.7** |
| WeMM-Embedding | 4B | 79.2 | 80.8 | 72.1 | 82.0 |
| VLM2Vec | 8B | 53.2 | 65.5 | 34.0 | 49.1 |
| GME | 8B | 59.2 | 56.0 | 38.6 | 79.3 |
| Qwen3-VL-Embedding | 8B | 77.8 | 80.1 | 67.1 | 82.4 |
| DME-Medium† | 9B | 78.4 | 79.8 | 70.8 | 82.0 |
| WeMM-Embedding | 9B | 80.6 | 81.9 | 74.3 | 83.3 |

† Modelos de código cerrado sin pesos públicos.

**MMEB-v3** (190 tareas, incluye las 78 de v2, 53 tareas de texto, 47 de agentes, 11 de audio y MCMR; tareas no soportadas se asignan puntuación 0):

| Modelo | Tamaño | V3-All | Text | Agent | MCMR | Audio |
|---|---|---|---|---|---|---|
| VLM2Vec-V2 | 2B | 38.3 | 24.5 | 28.7 | 4.1 | 0.0 |
| Omni-Embed-Nemotron | 3B | 43.5 | 39.2 | 36.5 | 26.1 | 36.5 |
| E5-Omni | 3B | 44.6 | 26.7 | 36.9 | 31.9 | 30.8 |
| Qwen3-VL-Embedding | 2B | 50.9 | 39.2 | 39.3 | 42.0 | 0.0 |
| **WeMM-Embedding** | **2B** | **56.0** | **45.3** | **45.1** | **42.5** | **0.0** |
| WeMM-Embedding | 4B | 58.2 | 47.9 | 49.0 | 41.9 | 0.0 |
| WAVE | 7B | 26.3 | 13.7 | 11.3 | 8.9 | 31.8 |
| VLM2Vec | 8B | 32.9 | 22.2 | 19.7 | 0.9 | 0.0 |
| LCO-Embedding-Omni | 7B | 40.6 | 32.4 | 27.8 | 20.0 | 43.2 |
| GME | 8B | 43.6 | 37.1 | 35.6 | 27.3 | 0.0 |
| E5-Omni | 7B | 47.1 | 26.9 | 36.7 | 41.1 | 43.0 |
| Tianmu-Emb-Uni | 8B | 53.3 | 43.6 | 39.4 | 38.8 | (no disponible) |

En ambos benchmarks, WeMM-Embedding-2B obtiene el mejor resultado entre los modelos de 2B, y supera incluso a modelos de 8B en varias tareas.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: ~6 GB (2.720 millones de parámetros × 2 bytes = 5.4 GB de pesos, más overhead de activaciones). Con cuantizaciones adicionales (no documentadas oficialmente) podría reducirse aún más.
- GPU recomendadas: tarjetas con 8 GB de VRAM o más, como RTX 3060/3070, RTX 3090, RTX 4090, A10G, A100, H100. En una RTX 4090 (24 GB) se puede ejecutar sin problemas.
- Es posible su ejecución en GPU consumer; no se requieren GPUs de data center para inferencia básica.
- Opciones de despliegue: transformers (Python), sentence-transformers, vLLM (versión 0.27.0 o superior), SGLang (versión 0.5.9). No se documenta compatibilidad con llama.cpp u Ollama.
- Latencia y throughput: no se han publicado datos oficiales. Para un modelo de 2.7B, se espera una latencia de decenas de milisegundos por embedding en GPU moderna, pero depende del tamaño de entrada.

## Comparativa con modelos similares

Se comparan modelos de la misma categoría (embeddings multimodales de ~2B parámetros) usando el resultado promedio de MMEB-v2 (AVG).

| Modelo | Parámetros | Contexto | MMEB-v2 (AVG) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeMM-Embedding-2B | 2.7B | no disponible | 77.9 | wemm-model-license | Pesos públicos |
| Qwen3-VL-Embedding | 2B | no disponible | 73.2 | Apache 2.0 | Pesos públicos |
| VLM2Vec-V2 | 2B | no disponible | 59.3 | MIT | Pesos públicos |
| GME | 2B | no disponible | 55.4 | MIT | Pesos públicos |
| DME-Small | 2B | no disponible | 74.8 | Cerrada | Sin pesos públicos |

WeMM-Embedding-2B ofrece el mejor rendimiento entre los modelos de 2B con pesos abiertos. Su licencia es personalizada (wemm-model-license), que puede tener restricciones distintas a las de licencias permisivas como MIT o Apache.

## Limitaciones y advertencias

- Idiomas limitados: solo chino e inglés. No se recomienda su uso en otros idiomas sin evaluación previa.
- No procesa audio, por lo que no es adecuado para tareas que requieran embeddings de audio o contenido multimodal con sonido.
- La licencia wemm-model-license es una licencia personalizada de Tencent. Es necesario revisar los términos completos (enlace en la sección de enlaces) para conocer las restricciones de uso comercial, redistribución y modificación. No es una licencia de código abierto estándar.
- No se han publicado datos sobre sesgos del modelo. Como es un modelo de embeddings, los sesgos pueden influir en los resultados de recuperación y clasificación, pero no se ha evaluado formalmente.
- No se documenta la longitud de contexto máxima; es necesario comprobar el comportamiento con entradas muy largas (por ejemplo, vídeos largos o documentos extensos).
- El modelo está pensado para generar embeddings, no para generación de texto. No se debe usar como un LLM generativo.
- La dependencia de versiones específicas de transformers (5.2.0) y qwen-vl-utils puede requerir ajustes en entornos existentes.

## Enlaces

- Hugging Face: [tencent/WeMM-Embedding-2B](https://huggingface.co/tencent/WeMM-Embedding-2B)
- GitHub: [Tencent/WeMM-Embedding](https://github.com/Tencent/WeMM-Embedding)
- Informe técnico: [WeMM_Embedding_tech_report.pdf](https://github.com/Tencent/WeMM-Embedding/blob/main/assets/WeMM_Embedding_tech_report.pdf)
- Licencia: [LICENSE](https://huggingface.co/tencent/WeMM-Embedding-2B/blob/main/LICENSE)
- Colección de modelos WeMM-Embedding en Hugging Face: [tencent/wemm-embedding](https://huggingface.co/collections/tencent/wemm-embedding)
