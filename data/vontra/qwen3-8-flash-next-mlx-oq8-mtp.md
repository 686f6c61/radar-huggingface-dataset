# Vontra/Qwen3.8-Flash-Next-MLX-oQ8-MTP

## Resumen

Qwen3.8 Flash Next es un modelo multimodal (visión y lenguaje) de la serie Qwen, desarrollado por el equipo de Qwen (Alibaba). Se trata de un modelo de arquitectura híbrida que combina atención sparse, mezcla de expertos (MoE) y embeddings n-grama, con un diseño orientado a eficiencia computacional y contexto muy largo. La conversión aquí descrita, creada por el usuario Vontra, es una adaptación del checkpoint oficial BF16 al formato MLX con cuantización casi uniforme de 8 bits (oQ8), pensada para ejecutarse en Apple Silicon mediante el runtime oMLX o MLX-VLM.

La relevancia de esta conversión radica en que preserva el bloque nativo de predicción de siguiente token (MTP) del modelo original, lo que permite acelerar la generación mediante decodificación especulativa sin necesidad de un modelo auxiliar externo. El modelo base soporta un contexto nativo de 262 144 tokens, lo que lo hace adecuado para tareas que requieren procesar documentos extensos o secuencias multimodales largas. Es una conversión comunitaria, no oficial, y requiere un runtime con soporte explícito para la arquitectura `qwen4_exp` y su módulo MTP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen4_exp` vision-language sparse MoE (Gated DeltaNet + Qwen Sparse Attention + MoE) |
| Parametros totales | 125B total (6B activos) según el modelo base; 56,49B en los safetensors de esta conversión |
| Parametros activos | 6B (10 de 512 expertos enrutados + 1 compartido) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | oQ8 (near-uniform 8-bit affine, group size 32); existe tambien una version 4-bit del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 |
| Formato de pesos | MLX safetensors (37 shards, 3 747 tensores) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8 Flash Next combina varias innovaciones: atención híbrida Gated DeltaNet (GDN) con Qwen Sparse Attention (QSA), capas de mezcla de expertos sparse con 512 expertos enrutados y 10 activos más uno compartido, flujos residuales gated ensanchados, y embeddings de bigramas y trigramas con hash. El modelo incluye además un bloque nativo de predicción de siguiente token (MTP) para decodificación especulativa, compuesto por una capa de tipo Qwen4Exp. La conversión de Vontra reconstruye todos los tensores, incluido el bloque MTP, a partir del checkpoint BF16 oficial. Los detalles del entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no se especifican en la información disponible, aunque por tratarse de un modelo de la serie Qwen se asume un entrenamiento extenso y multimodal.

## Capacidades

- Procesamiento multimodal: acepta entradas de imagen y texto, generando respuestas textuales (pipeline `image-text-to-text`).
- Generación de texto con contexto largo: hasta 262 144 tokens, adecuado para documentos extensos o conversaciones multilongitud.
- Razonamiento y comprensión de instrucciones: validado en pruebas deterministas de aritmética, recuperación factual y generación coherente.
- Decodificación especulativa nativa: el bloque MTP integrado permite acelerar la generación sin necesidad de un drafter externo.
- Capacidades multilingües: no documentadas en la información disponible.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y multi-step reasoning: no documentado en la información disponible.

## Casos de uso

- Análisis de documentos extensos con figuras: el modelo puede procesar informes, contratos o artículos científicos que combinen texto y gráficos, aprovechando su contexto de 262K tokens para mantener coherencia a lo largo de cientos de páginas.
- Asistente de programación con repositorios completos: gracias a su contexto largo, puede recibir el contenido de un repositorio entero y responder preguntas sobre el código, generar parches o explicar arquitecturas.
- Procesamiento de secuencias de vídeo: al aceptar múltiples imágenes como entrada, puede analizar fotogramas consecutivos y describir acciones o eventos, útil para resúmenes de vídeo o vigilancia.
- Generación de descripciones alternativas (alt text) y accesibilidad: puede generar descripciones detalladas de imágenes para personas con discapacidad visual, integrado en herramientas de publicación.
- Investigación académica: revisión de artículos con tablas y figuras, extracción de resultados y comparación entre múltiples documentos.
- Despliegue en Apple Silicon: al estar convertido a MLX, puede ejecutarse en Macs con chip M-series mediante oMLX, lo que permite prototipado local sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sin embargo, el autor de la conversión reporta mediciones de velocidad de inferencia en un Apple M3 Studio con generación determinista de 128 tokens:

| Modo de ejecucion | Tokens de salida | Velocidad |
|---|---|---|
| MTP deshabilitado | 128 | 19,5 tokens/s |
| MTP habilitado (3 tokens de borrador) | 128 | 35,7 tokens/s |

El modo MTP aceptó 69 de 110 propuestas de borrador (62,7 %), lo que supone una mejora del 83 % en throughput. Estas cifras son específicas del entorno de prueba y pueden variar según la longitud del prompt, el estado de caché, los parámetros de muestreo y la versión del runtime.

## Requisitos de hardware

- VRAM estimada: el peso de la conversión es de 202,75 GB (188,82 GiB), por lo que se necesita un Apple Silicon con al menos 192 GB de memoria unificada para cargar el modelo completo en RAM.
- GPU recomendadas: Apple M3 Studio o superior con memoria unificada de 192 GB o más (la medición se realizó en un M3 Studio).
- No cabe en GPUs de consumo convencionales (RTX 4090, etc.) por su tamaño; requiere hardware con gran capacidad de memoria unificada.
- Opciones de despliegue: oMLX o MLX-VLM con soporte explícito para la arquitectura `qwen4_exp` y su módulo MTP. No es compatible con runtimes estándar que no construyan el módulo MTP (rechazarán los 76 tensores MTP durante la carga estricta).
- Latencia y throughput: 19,5 tokens/s sin MTP y 35,7 tokens/s con MTP en el entorno de prueba descrito.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-Flash-Next (original) | 125B total / 6B activos | 262 144 | BF16 | Qwen Community 1.0 | Hugging Face |
| Vontra/Qwen3.8-Flash-Next-MLX-oQ8-MTP (esta conversion) | 125B total / 6B activos (56,49B en safetensors) | 262 144 | oQ8 (8-bit) | Qwen Community 1.0 | Hugging Face |
| Vontra/Qwen3.8-Flash-Next-MLX-4bit | 125B total / 6B activos | 262 144 | 4-bit | Qwen Community 1.0 | Hugging Face |

La comparativa se limita a las versiones del mismo modelo base, ya que no se dispone de información sobre otros modelos comparables en la misma categoría (MoE multimodal con contexto ultralargo) en la información proporcionada.

## Limitaciones y advertencias

- Es una conversión comunitaria no oficial; el autor advierte que no es una release de Qwen.
- Requiere un runtime específico (oMLX o MLX-VLM) con soporte explícito para `qwen4_exp` y su módulo MTP. Los runtimes estándar pueden rechazar los tensores MTP durante la carga.
- No se debe adjuntar un drafter externo de Qwen3.8 27B, ya que las dimensiones ocultas difieren y el modelo ya incluye su propio bloque MTP.
- El peso de 188 GiB hace que solo sea viable en equipos Apple Silicon con memoria unificada muy grande (192 GB o más), lo que limita su uso a estaciones de trabajo de gama alta.
- No se han publicado evaluaciones de sesgos o alucinaciones específicas para esta conversión; como modelo de lenguaje grande, puede generar contenido inexacto o inventado.
- La licencia Qwen Community 1.0 impone restricciones de uso comercial; es necesario revisar los términos completos antes de desplegar el modelo en producción.
- Los datos de entrenamiento, composición del dataset y procesos de alineación (RLHF/DPO) no se detallan en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vontra/Qwen3.8-Flash-Next-MLX-oQ8-MTP
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Blog de Qwen sobre Qwen3.8 Flash Next: https://qwen.ai/blog?id=qwen3.8-flash-next
- Repositorio GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- MLX-VLM (runtime): https://github.com/ml-explore/mlx-vlm
- Licencia Qwen Community 1.0: https://huggingface.co/Vontra/Qwen3.8-Flash-Next-MLX-oQ8-MTP/blob/main/LICENSE
- Version 4-bit del mismo autor: https://huggingface.co/Vontra/Qwen3.8-Flash-Next-MLX-4bit
