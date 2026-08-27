# Vontra/Qwen3.8-Flash-Next-MLX-3bit-MTP

## Resumen

Qwen3.8 Flash Next es un modelo multimodal de lenguaje y visión desarrollado por Qwen, con arquitectura Qwen4Exp: un MoE ultra disperso de 125.000 millones de parámetros totales (incluyendo una tabla de embeddings n-gram de 51B y un bloque MTP de 4B) que activa solo 6B parámetros por token. Soporta una ventana de contexto de 262.144 tokens y combina Gated DeltaNet, Qwen Sparse Attention, capas MoE dispersas y embeddings hasheados de bigramas y trigramas. Está pensado para razonamiento avanzado, comprensión de documentos largos y tareas multimodales imagen-texto.

Esta conversión específica, publicada por Vontra, es una adaptación MLX uniforme de 3 bits del checkpoint oficial BF16, diseñada exclusivamente para Apple Silicon. Preserva el bloque MTP nativo del modelo original, lo que permite decodificación especulativa con una mejora medida del 9,09 % en velocidad de generación en un Apple M3 Studio. El repositorio incluye 18 shards de pesos en formato safetensors MLX, con un tamaño total de 90,8 GB, y mantiene el tokenizador, la plantilla de chat, el procesador de visión y la configuración de generación originales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen4_exp (vision-language sparse MoE con Gated DeltaNet, Qwen Sparse Attention y MTP) |
| Parametros totales | 28.560.167.459 (checkpoint cuantizado); modelo base: 125B totales (incluye 51B de embeddings n-gram y 4B de MTP) |
| Parametros activos | 6B por token (modelo base) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 3-bit uniforme affine, grupo 32; módulos multimodales y router gates en BF16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | MLX safetensors (18 shards, 90,8 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un modelo causal de lenguaje con codificador de visión. Su stack lingüístico combina cuatro ideas principales: tres de cada cuatro capas usan Gated DeltaNet para comprimir el historial, mientras que la cuarta usa Qwen Sparse Attention para recuperación precisa de largo alcance. A esto se añaden capas MoE ultra dispersas, flujos residuales con compuerta ensanchados, embeddings hasheados de bigramas y trigramas (tabla de 20 millones de entradas, 51B parámetros) y un bloque nativo de predicción del siguiente token (MTP) de 4B parámetros para decodificación especulativa. El tamaño oculto es de 2.560.

La conversión MLX de Vontra aplica cuantización uniforme de 3 bits con grupo 32 a los módulos de lenguaje y MTP, manteniendo en BF16 los módulos multimodales y las puertas del router MoE. El checkpoint conserva el tokenizador, la plantilla de chat, el procesador de visión y la configuración de generación del modelo original. No se dispone de información detallada sobre el proceso de entrenamiento (composición del dataset, uso de RLHF o DPO) en la documentación consultada.

## Capacidades

- Generación de texto y razonamiento avanzado con ventana de contexto de 262.144 tokens.
- Comprensión de imágenes y tareas imagen-texto (pipeline image-text-to-text).
- Decodificación especulativa nativa mediante bloque MTP (draft de tres tokens), con paridad exacta de salida verificada.
- Soporte de chat conversacional con plantilla de chat conservada del modelo original.
- Capacidades multilingües: no documentadas en la información disponible.
- No se documenta soporte explícito de tool calling ni function calling en esta conversión.

## Casos de uso

- Análisis de documentos extensos con imágenes: gracias a su contexto de 262K tokens y su capacidad multimodal, el modelo puede procesar informes largos que combinan texto, tablas y figuras, resumiendo o extrayendo información relevante en una sola pasada.
- Asistentes de investigación científica: permite consultar artículos técnicos con gráficos y ecuaciones, respondiendo preguntas de razonamiento complejo sobre el contenido visual y textual.
- Generación de código con contexto amplio: la ventana de 262K tokens permite incluir repositorios completos o documentación extensa como contexto, facilitando la generación o refactorización de código con coherencia global.
- Chat multimodal en Apple Silicon: al ser una conversión MLX optimizada, puede ejecutarse localmente en Mac con chip M-series, ofreciendo un asistente conversacional con entrada de imágenes sin depender de la nube.
- Decodificación especulativa para inferencia de baja latencia: el bloque MTP integrado acelera la generación de texto en un 9 % medido, útil para aplicaciones interactivas donde la velocidad de respuesta es crítica.
- Procesamiento de archivos largos en entornos con memoria unificada amplia: con 90,8 GB de pesos en 3 bits, es viable en estaciones Apple con 128 GB o más de RAM unificada, permitiendo tareas de comprensión de corpus extensos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento medidos corresponden a la generación de texto en un Apple M3 Studio con oMLX 0.6.3rc3:

| Modo de ejecución | Velocidad de generación (mediana) | Tokens redactados | Aceptados | Tasa de aceptación |
|---|---|---|---|---|
| MTP desactivado | 28,04 tokens/s | No aplicable | No aplicable | No aplicable |
| MTP activado (3 tokens de draft) | 30,59 tokens/s | 659 | 431 | 65,4 % |

La mejora de rendimiento con MTP fue del 9,09 %. Se verificó paridad exacta de salida, coherencia en todas las ejecuciones sostenidas de 512 tokens y captura de telemetría MTP. Los resultados pueden variar según la longitud del prompt, el estado de la caché, la versión del runtime y las condiciones térmicas.

## Requisitos de hardware

- Esta conversión es exclusiva para Apple Silicon (MLX). No es compatible con GPUs NVIDIA o AMD.
- Requiere al menos 128 GB de RAM unificada recomendados, dado que el peso del checkpoint es de 90,8 GB y la inferencia necesita memoria adicional para caché KV y activaciones.
- Probado en Apple M3 Studio con oMLX 0.6.3rc3, MLX-VLM 0.6.3 y MLX 0.32.0.
- Runtimes compatibles: oMLX (con soporte explícito de qwen4_exp y MTP nativo), MLX-VLM para construcción y carga estricta de pesos.
- No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, al ser una conversión MLX específica.
- La velocidad de generación medida es de 28-31 tokens/s en M3 Studio, dependiendo de si MTP está activado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-Flash-Next (original) | 125B totales / 6B activos | 262.144 | BF16 | qwen-community-1.0 | HuggingFace |
| Vontra/Qwen3.8-Flash-Next-MLX-3bit-MTP (este) | 28,56B en checkpoint | 262.144 | 3-bit uniforme | qwen-community-1.0 | HuggingFace |
| Vontra/Qwen3.8-Flash-Next-MLX-4bit | no disponible | no disponible | 4-bit | qwen-community-1.0 | HuggingFace |

No se dispone de datos de rendimiento comparativos entre estas versiones más allá de la velocidad de generación medida en la versión 3-bit. La versión 4-bit existe en el mismo repositorio del autor, pero no se han publicado especificaciones detalladas.

## Limitaciones y advertencias

- Requiere un runtime con soporte explícito de la arquitectura qwen4_exp y del módulo MTP nativo; un runtime que no construya el módulo MTP puede rechazar los 76 tensores MTP durante la carga estricta.
- La cuantización de 3 bits puede introducir degradación de calidad en comparación con el checkpoint BF16 original, especialmente en tareas de razonamiento complejo o generación de código.
- No se documentan los idiomas soportados; la información multilingüe no está disponible.
- La licencia qwen-community-1.0 puede imponer restricciones de uso comercial; se recomienda revisar el texto completo de la licencia antes de su despliegue en producción.
- El modelo es multimodal, pero el rendimiento medido solo cubre generación de texto; el soporte de entrada de visión depende de la versión de MLX-VLM y oMLX utilizada.
- No se han publicado benchmarks estándar, por lo que no es posible comparar su rendimiento con otros modelos de forma objetiva.
- El tamaño del checkpoint (90,8 GB) limita su uso a equipos Apple con gran cantidad de memoria unificada; no es viable en hardware convencional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Vontra/Qwen3.8-Flash-Next-MLX-3bit-MTP
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Blog de Qwen sobre Qwen3.8 Flash Next: https://qwen.ai/blog?id=qwen3.8-flash-next
- MLX-VLM: https://github.com/ml-explore/mlx-vlm
- Repositorio GitHub de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Guía de ejecución local (unsloth): https://unsloth.ai/docs/models/qwen3.8-next
- Recetas vLLM para Qwen3.8-Flash-Next: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Versión 4-bit del mismo autor: https://huggingface.co/Vontra/Qwen3.8-Flash-Next-MLX-4bit
