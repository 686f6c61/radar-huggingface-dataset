# Weidows/WeMM-Embedding-2B-FP8

## Resumen

WeMM-Embedding-2B-FP8 es una cuantización en FP8 (E4M3) del modelo WeMM-Embedding-2B desarrollado por Tencent, publicada por el usuario Weidows. El modelo base es un modelo de embeddings multimodales universales construido sobre Qwen3.5 que acepta texto, imágenes, vídeos, documentos visuales y entradas multimodales intercaladas, y devuelve un embedding L2-normalizado de 2.048 dimensiones.

Esta versión FP8 reduce el peso por parámetro de 16 a 8 bits mediante cuantización manual per-tensor de las 285 capas lineales, incluida la torre de visión. La pérdida de calidad es mínima: en STS-B, el coeficiente de Spearman pasa de 0,8124 (BF16) a 0,8114 (FP8), con una fidelidad del embedding de 0,9987 en coseno respecto al original.

El formato está pensado para servidores de inferencia con soporte nativo de FP8, como vLLM o SGLang en GPUs Ada o posteriores. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basado en Qwen3.5 con torre de visión |
| Parámetros totales | 2B (desglose exacto no disponible) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 E4M3 per-tensor; BF16 (modelo base) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | model.fp8.safetensors (float8_e4m3fn) + fp8_scales.json |

## Arquitectura y entrenamiento

El modelo base WeMM-Embedding-2B es un modelo de embeddings multimodales universales desarrollado por Tencent sobre la arquitectura Qwen3.5. Sigue el pipeline VLM2Vec del TIGER-AI-Lab con modificaciones mínimas, incluyendo inferencia multi-GPU multi-nodo mediante `torchrun --nnodes=N`, un backbone `wemm_embedding` con preprocesado e inferencia por lotes, y muestreo de vídeo de 64 fotogramas. Acepta texto, imágenes, vídeos, documentos visuales y entradas multimodales intercaladas, produciendo embeddings de 2.048 dimensiones normalizados L2.

La cuantización FP8 fue realizada manualmente por Weidows sobre las 285 capas lineales del modelo, incluida la torre de visión, usando formato E4M3 con escala per-tensor. El intento de usar `llmcompressor` oneshot no cuantizó correctamente las capas lineales personalizadas de qwen3_5, por lo que se optó por la vía manual. Los pesos se guardan como `float8_e4m3fn` junto con el archivo `fp8_scales.json` que contiene las escalas de de-cuantización por capa. El repositorio incluye los archivos de configuración, tokenizador y el código de modelado personalizado `WeMMEmbedding` para que `AutoModel` pueda cargarlo.

## Capacidades

- Generación de embeddings multimodales a partir de texto, imágenes, vídeos, documentos visuales y entradas intercaladas.
- Embeddings de 2.048 dimensiones normalizados L2, aptos para búsqueda por similitud coseno.
- Recuperación multimodal en un espacio vectorial compartido para tareas de retrieval, recomendación y clasificación.
- Compatibilidad con sistemas agenciales que requieren representaciones unificadas de contenido heterogéneo.
- Capacidades conversacionales heredadas de la arquitectura Qwen3.5 (etiqueta `conversational`).
- No se indica soporte explícito de tool calling en la información disponible.

## Casos de uso

- Búsqueda multimodal en bases de conocimiento: indexar documentos, imágenes y vídeos en un mismo espacio vectorial y recuperarlos con consultas en texto o imagen.
- Recuperación aumentada por generación (RAG) multimodal: combinar los embeddings con un LLM para responder preguntas sobre contenido visual y textual.
- Clasificación de documentos visuales: representar facturas, formularios o capturas de pantalla como embeddings y clasificarlos con un clasificador lineal entrenado sobre las representaciones.
- Sistemas de recomendación de contenido: generar embeddings de elementos (imágenes, vídeos, texto) y de perfiles de usuario para recomendación por similitud.
- Moderación de contenido en vídeo: indexar fotogramas de vídeo y detectar contenido problemático por similitud con ejemplos etiquetados.
- Sistemas agenciales con memoria multimodal: almacenar observaciones del agente (capturas de pantalla, texto, resultados de acciones) como embeddings y recuperarlas en pasos posteriores del razonamiento.

## Benchmarks y rendimiento

Los datos publicados comparan la versión FP8 con la base BF16 usando el mismo motor (transformers/torch `AutoModel`), por lo que la diferencia es atribuible exclusivamente al error de redondeo de FP8:

| Métrica | BF16 | FP8 | Δ vs BF16 |
|---|---|---|---|
| STS-B Spearman ρ | 0,8124 | 0,8114 | +0,12% |
| Coseno del embedding vs BF16 | — | 0,9987 | — |

La variación de ρ de +0,12% se considera dentro del ruido estadístico. El coseno de 0,9987 indica una fidelidad espacial muy alta entre los embeddings FP8 y BF16. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, recuperación multimodal, etc.) en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 3,3 GB (pesos FP8 + escalas + archivos de soporte).
- Requiere GPU con soporte nativo de FP8: RTX 4090 / Ada o posteriores, con tensor cores FP8.
- La cuantización FP8 reduce el consumo de VRAM a aproximadamente la mitad respecto a BF16.
- Con transformers, es necesario de-cuantizar los pesos a bf16 en tiempo de carga (fp8 → bf16) o servir a través de un backend que consuma FP8 de forma nativa.
- vLLM y SGLang requieren reempaquetar el checkpoint al formato fp8 propio del backend (compressed-tensors o equivalente) antes de servir; el formato actual no es cargable directamente.
- Alternativa para llama.cpp: usar las variantes GGUF (Q8_0, Q6_K, Q5_K_M, IQ4_XS, IQ3_M) publicadas en un repositorio separado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| WeMM-Embedding-2B (BF16) | 2B | no disponible | safetensors bf16 | Apache 2.0 | Modelo base original de Tencent |
| WeMM-Embedding-2B-FP8 | 2B | no disponible | safetensors fp8 | Apache 2.0 | Cuantización manual per-tensor E4M3 |
| WeMM-Embedding (familia) | no disponible | no disponible | no disponible | Apache 2.0 | Familia de modelos descrita en el technical report |

No se dispone de datos suficientes sobre otros modelos de embeddings multimodales comparables (como VLM2Vec u otros) en la información proporcionada.

## Limitaciones y advertencias

- La cuantización FP8 requiere hardware con soporte nativo (RTX 4090 / Ada o posterior); en GPUs más antiguas no se obtendrá aceleración y puede haber problemas de compatibilidad.
- El checkpoint FP8 no es directamente cargable en vLLM o SGLang: requiere reempaquetado al formato fp8 del backend (compressed-tensors o equivalente).
- Para usar con transformers, hay que de-cuantizar los pesos a bf16 en tiempo de carga, lo que anula parcialmente el ahorro de memoria en RAM durante el arranque.
- Los datos de evaluación publicados se limitan a STS-B; no hay resultados de benchmarks más amplios (recuperación multimodal, clasificación, etc.).
- No se especifican los idiomas soportados ni la longitud de contexto, por lo que el despliegue en producción requiere validación previa.
- La cuantización fue realizada por un tercero (Weidows), no por Tencent; la calidad en otros datasets distintos de STS-B no está verificada.
- El technical report del modelo base está disponible en arXiv, pero los detalles de entrenamiento (composición del dataset, número de tokens, método de alineación) no están en la model card.

## Enlaces

- Repositorio HuggingFace de la versión FP8: https://huggingface.co/Weidows/WeMM-Embedding-2B-FP8
- Repositorio HuggingFace del modelo base: https://huggingface.co/tencent/WeMM-Embedding-2B
- Technical report en arXiv: https://arxiv.org/abs/2608.24053
- PDF del technical report: https://arxiv.org/pdf/2608.24053
- Repositorio GitHub de Tencent: https://github.com/Tencent/WeMM-Embedding
