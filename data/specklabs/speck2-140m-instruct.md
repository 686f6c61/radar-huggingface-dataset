# specklabs/Speck2-140M-Instruct

## Resumen

Speck2-140M-Instruct es un modelo de lenguaje instructivo en inglés de 140,7 millones de parámetros desarrollado por specklabs. Se inicializa desde Speck2-140M, un modelo híbrido preentrenado desde cero sobre 20 mil millones de tokens con un currículum de tres fases, y posteriormente se ajusta finamente durante una época sobre el conjunto de conversaciones SpeckChat2 (500.000 conversaciones). El modelo está diseñado para tareas de chat e instrucción con un template nativo que soporta mensajes de sistema opcionales.

Su arquitectura híbrida combina bloques de atención global con bloques de convolución causal con gating, seguidos de feed-forward SwiGLU. Esta combinación permite procesar secuencias de hasta 4.096 tokens de contexto configurado (validado hasta 2.048), con un coste computacional reducido frente a transformadores puros de tamaño similar. El modelo se distribuye con licencia MIT, lo que facilita su uso comercial y académico sin restricciones significativas.

La relevancia de Speck2-140M-Instruct reside en su tamaño compacto (140,6 M de parámetros) y su enfoque híbrido, que lo hace adecuado para despliegue en entornos con recursos limitados, como CPUs, dispositivos edge o GPUs de gama baja, manteniendo un rendimiento competitivo en tareas de generación de texto y chat en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 8 bloques de atención global + 10 bloques de convolución causal con gating, cada uno con FFN SwiGLU |
| Parametros totales | 140.654.208 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 configurado, validado hasta 2.048 |
| Tipos de cuantizacion | No disponible (formato BF16 nativo) |
| Idiomas soportados | Inglés |
| Licencia | MIT |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

Speck2-140M-Instruct mantiene la arquitectura de Speck2-140M, un diseño híbrido que intercala 8 bloques de atención global (con grouped-query attention de 12 cabezas de consulta y 3 de clave/valor, dimensión de cabeza 64) con 10 bloques de convolución causal con gating (kernel sizes 3 y 5, ancho interno 384). Cada bloque va seguido de una capa feed-forward SwiGLU con ancho intermedio 2.304. El ancho oculto del residual stream es 768, mientras que los embeddings de entrada/salida (ancho 640) están atados y se conectan al residual mediante proyecciones aprendidas. Se usa RoPE con theta 10.000 y RMSNorm con epsilon 1e-5.

El preentrenamiento se realizó sobre 20.000 millones de tokens con un currículum de tres fases, utilizando una mezcla de datasets que incluye Ultra-FineWeb, DCLM-baseline, SmolLM-corpus, FineMath y Wikipedia. El ajuste fino supervisado (SFT) se efectuó durante una época sobre el conjunto SpeckChat2, con 499.000 conversaciones de entrenamiento y 1.000 de validación, procesando 319.181.221 tokens de asistente supervisados. La pérdida de validación final fue de 1,1206 (perplejidad 3,067). Se añadieron tres tokens de rol al vocabulario base de 32.000 (Mistral v0.1 SentencePiece): `<|system|>`, `<|user|>` y `<|assistant|>`. El entrenamiento utilizó pérdida solo en los tokens del asistente.

## Capacidades

- Generación de texto y chat en inglés con soporte de mensajes de sistema opcionales.
- Razonamiento básico y respuesta a instrucciones, adecuado para tareas sencillas de comprensión y generación.
- Capacidad de procesar contextos de hasta 2.048 tokens validados (configurado a 4.096), suficiente para diálogos multi-turno moderados.
- Template de chat nativo implementado en el tokenizer, compatible con `apply_chat_template` de Transformers.
- Soporte para generación greedy y decodificación con muestreo (aunque la ruta validada es greedy de un solo prompt).
- Funciona con las Auto clases de Transformers mediante código personalizado (`trust_remote_code=True`).
- Sin capacidades multimodales ni tool calling documentadas en la información disponible.

## Casos de uso

- Chatbots de atención al cliente en inglés: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 2.048 tokens, suficiente para resolver consultas habituales de soporte técnico o preguntas frecuentes en un despliegue ligero.
- Asistentes de documentación técnica: integrado en pipelines de generación de respuestas a partir de bases de conocimiento, puede resumir o responder preguntas sobre manuales y guías en inglés.
- Prototipado rápido de aplicaciones conversacionales: su pequeño tamaño permite iterar rápidamente en entornos de desarrollo sin necesidad de GPUs potentes, ideal para validar flujos de chat antes de escalar a modelos mayores.
- Generación de texto en dispositivos edge: al ocupar menos de 300 MB en BF16 y poder ejecutarse en CPU, es viable para asistentes locales en Raspberry Pi o portátiles sin GPU dedicada.
- Preprocesamiento y aumento de datos: puede generar variaciones de texto o completar plantillas en inglés para enriquecer datasets de entrenamiento de otros modelos.
- Educación e investigación: sirve como modelo de referencia para estudiar arquitecturas híbridas (atención + convolución) y comparar su rendimiento con transformadores puros de tamaño similar.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa con otros modelos de tamaño similar, pero no se muestran los valores específicos de Speck2-140M-Instruct en la información disponible. Se indica que se evaluó con Open SLM Leaderboard y BananaMind Base Bench 1.1, sin uso de chat template ni generación. Los datos de la tabla para otros modelos son:

| Modelo | Params | Tokens entrenamiento | Open SLM Int Index | BananaMind Elo | CPU decode | RTX 3090 decode |
|---|---:|---:|---:|---:|---:|---:|
| BananaMind-2-Pro | 139M | 100B | 24,96 | 1131 | 43,0 tok/s | 140,3 tok/s |
| SmolLM2-135M | 135M | ~2T | 27,13 | 1119 | 47,4 tok/s | 157,7 tok/s |
| GPT-X2.5-135M | 135M | 75B | 25,17 | 1106 | 47,2 tok/s | 125,0 tok/s |
| Supra2-100M-Base | 101M | 30B | 19,41 | 1030 | 56,0 tok/s | 298,1 tok/s |

Para Speck2-140M-Instruct solo se reportan métricas de velocidad propias: 55,1 tok/s en CPU y 245,4 tok/s en RTX 3090 (decodificación, batch 1). La pérdida de validación SFT es 1,1206 (perplejidad 3,067). No se han publicado resultados de benchmarks de calidad en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo en BF16 ocupa aproximadamente 280 MB de pesos, más overhead de activaciones y caché KV. Con contexto de 2.048 tokens, la memoria total ronda los 300-400 MiB, según los datos de modelos similares en la tabla (SmolLM2-135M reporta 301,6 MiB BF16 memory @2K).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Se ha validado en RTX 3090 (245,4 tok/s de decodificación), pero también funciona en GPUs de gama baja como GTX 1650 o integradas.
- En CPU: decodificación a 55,1 tok/s (batch 1), viable para aplicaciones en tiempo real no exigentes.
- Opciones de despliegue: compatible con Transformers mediante `trust_remote_code=True`. No se menciona soporte para vLLM, llama.cpp u Ollama en la documentación disponible.
- Latencia: en RTX 3090, la generación de un token tarda aproximadamente 4 ms; en CPU, unos 18 ms por token.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Entrenamiento | Licencia | Velocidad CPU decode | Velocidad RTX 3090 decode |
|---|---:|---:|---:|---:|---:|---:|
| Speck2-140M-Instruct | 140,7M | 4.096 (validado 2.048) | 20B tokens + SFT | MIT | 55,1 tok/s | 245,4 tok/s |
| SmolLM2-135M | 135M | 2.048 | ~2T tokens | Apache 2.0 | 47,4 tok/s | 157,7 tok/s |
| BananaMind-2-Pro | 139M | no disponible | 100B tokens | no disponible | 43,0 tok/s | 140,3 tok/s |
| GPT-X2.5-135M | 135M | no disponible | 75B tokens | no disponible | 47,2 tok/s | 125,0 tok/s |

Speck2-140M-Instruct destaca por su mayor velocidad de decodificación frente a los comparados, aunque su contexto validado (2.048) es inferior al de SmolLM2-135M (2.048, mismo valor) y no se dispone de datos de contexto para los otros. La licencia MIT es más permisiva que Apache 2.0 en cuanto a atribución, aunque ambas permiten uso comercial.

## Limitaciones y advertencias

- El contexto está configurado a 4.096 tokens pero solo se ha validado hasta 2.048; usos más allá de este límite pueden producir degradación de calidad o errores.
- Entrenado exclusivamente en inglés; no soporta otros idiomas de forma nativa.
- Al ser un modelo de 140M de parámetros, su capacidad de razonamiento complejo, matemáticas avanzadas y generación de código es limitada en comparación con modelos de mayor tamaño.
- Riesgo de alucinación en respuestas factuales, especialmente fuera de los dominios cubiertos por sus datos de entrenamiento.
- La ruta de generación validada es greedy de un solo prompt; el uso de batching con padding derecho o muestreo puede requerir ajustes adicionales.
- Requiere `trust_remote_code=True` al cargar, lo que implica ejecutar código personalizado del autor; se recomienda auditar el código en entornos de producción.
- No se han publicado resultados de benchmarks de calidad estándar (MMLU, HumanEval, etc.), por lo que su rendimiento comparativo no está completamente caracterizado.
- El repositorio no reporta sesgos específicos, pero al entrenarse con datos web generales puede heredar sesgos presentes en esos corpus.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/specklabs/Speck2-140M-Instruct
- Modelo base: https://huggingface.co/specklabs/Speck2-140M
- Dataset de ajuste: https://huggingface.co/datasets/specklabs/SpeckChat2
- Versión anterior (Speck1.1): https://huggingface.co/specklabs/Speck1.1-140M-Instruct
- Open SLM Leaderboard: https://huggingface.co/spaces/AxiomicLabs/Open_SLM_Leaderboard
- BananaMind Base Bench 1.1: https://huggingface.co/datasets/BananaMind/BananaMind-Base-Bench-1.1
