# unsloth/Qwen3.6-27B-MTP-GGUF

## Resumen

Qwen3.6-27B es el primer modelo de pesos abiertos de la serie Qwen3.6, desarrollado por el equipo Qwen de Alibaba. Se trata de un modelo causal de lenguaje con codificador de visión (pipeline image-text-to-text) de 27.000 millones de parámetros, con una arquitectura híbrida que combina Gated DeltaNet (atención lineal) con Gated Attention (atención completa). La variante MTP (Multi-Token Prediction) publicada por Unsloth en formato GGUF permite una inferencia entre 1,5 y 2 veces más rápida sin pérdida de precisión, según el model card.

El modelo destaca por su contexto nativo de 262.144 tokens, extensible hasta 1.010.000, y por sus mejoras en codificación agéntica, tool calling y preservación del contexto de razonamiento. Está orientado a entornos de desarrollo de software, con soporte para Codex, OpenCode y otros agentes de programación. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet (atención lineal) + Gated Attention (atención completa) con codificador de visión |
| Parametros totales | 27B |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.010.000 |
| Tipos de cuantizacion | Unsloth Dynamic 2.0 GGUF (p. ej., UD-Q4_K_XL); lista completa no disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Qwen3.6-27B emplea una arquitectura híbrida que combina dos mecanismos de atención. El bloque base se organiza como 16 repeticiones de 3 sub-bloques de Gated DeltaNet seguidos de 1 sub-bloque de Gated Attention, cada uno con su capa FFN. En total son 64 capas con dimensión oculta de 5.120 y FFN con dimensión intermedia de 17.408. El Gated DeltaNet utiliza 48 cabezas de atención lineal para V y 16 para QK con dimensión de cabeza 128, mientras que el Gated Attention emplea 24 cabezas para Q y 4 para KV (GQA) con dimensión de cabeza 256 y RoPE de dimensión 64. El embedding de tokens tiene un tamaño de 248.320 (con padding).

El modelo se entrenó en dos fases: pre-entrenamiento y post-entrenamiento. La variante MTP se entrenó con múltiples pasos de predicción de tokens, lo que permite acelerar la inferencia entre 1,5 y 2 veces sin pérdida de precisión. No se especifican en la información disponible los detalles del dataset de entrenamiento ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento complejo con contexto largo (hasta 262K tokens nativos).
- Codificación agéntica: manejo de flujos de trabajo de frontend y razonamiento a nivel de repositorio con mayor fluidez y precisión.
- Tool calling / function calling con parsing mejorado de objetos anidados para mayor tasa de éxito.
- Soporte de agentes: Developer Role Support para Codex, OpenCode y otras herramientas de desarrollo.
- Preservación de pensamiento: opción para retener el contexto de razonamiento de mensajes históricos, reduciendo la sobrecarga en desarrollo iterativo.
- Capacidades multimodales: pipeline image-text-to-text con codificador de visión.
- MTP (Multi-Token Prediction): infer
