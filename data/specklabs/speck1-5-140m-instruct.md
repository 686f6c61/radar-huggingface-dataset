# specklabs/Speck1.5-140M-Instruct

## Resumen

Speck1.5-140M-Instruct es un modelo de lenguaje en inglés de 140,7 millones de parámetros, desarrollado por specklabs. Se trata de la versión afinada del modelo base Speck1.5-140M, un modelo híbrido preentrenado desde cero sobre 5 000 millones de tokens con un currículo de tres fases. La puesta a punto se realizó durante una época sobre el conjunto de conversaciones SpeckChat2, que contiene 500 000 diálogos, con una pérdida solo sobre los tokens de asistente. El modelo está diseñado para tareas de chat e instrucciones y destaca por su arquitectura híbrida que intercala atención global por grupos (GQA) con convoluciones causales con puerta.

La versión 1.5 actualiza el modelo base preentrenado manteniendo los datos de instrucción y la receta de postentrenamiento de la versión 1.1. El contexto máximo configurado es de 4096 tokens, aunque solo se ha validado hasta 2048. Incluye una plantilla de chat nativa con mensajes de sistema opcionales y tres tokens especiales de rol. El modelo se distribuye con licencia MIT y pesos en formato BF16 Safetensors, lo que facilita su integración en entornos de producción y experimentación.

Su relevancia radica en ofrecer un modelo pequeño (140 M) con una arquitectura poco convencional que combina atención y convolución, logrando velocidades de inferencia notables en hardware moderado: 242,7 tokens por segundo en una RTX 3090 en decodificación con batch 1. Está orientado a desarrolladores que necesitan un modelo ligero, rápido y de código abierto para tareas de conversación y generación de texto en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 18 bloques residuales, 8 de atención global GQA + 10 de convolución causal con puerta, cada uno con FFN SwiGLU |
| Parametros totales | 140 654 208 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 (validado solo hasta 2048) |
| Tipos de cuantizacion | No disponible (formato BF16 nativo; no se documentan cuantizaciones adicionales) |
| Idiomas soportados | Inglés (etiqueta `en`) |
| Licencia | MIT |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo usa una arquitectura híbrida que combina atención global por grupos (GQA) con convoluciones causales con puerta. En concreto, tiene 18 bloques residuales: 8 bloques con atención global (12 cabezas de consulta, 3 de clave/valor, dimensión de cabeza 64) y 10 bloques con convolución causal (kernel sizes 3 y 5, ancho interno 384), todos seguidos de una red feed-forward SwiGLU de ancho intermedio 2304. El ancho oculto es 768 y el ancho de embeddings es 640, con proyecciones aprendidas que conectan ambos espacios. Los embeddings de entrada y salida están atados. Se usa RoPE con theta 10 000 y RMSNorm con épsilon 1e-5.

El preentrenamiento se realizó desde cero sobre 5 000 millones de tokens con un currículo de tres fases, utilizando una mezcla de datasets que incluye SmolLM-corpus, FineWeb-Edu, DCLM-Edu, Ultra-FineWeb, peS2o, Wikipedia y otros. La puesta a punto supervisada (SFT) se hizo durante una época sobre el conjunto SpeckChat2, con 499 000 conversaciones de entrenamiento y 1000 de validación, procesando 319 millones de tokens de asistente supervisados. Las secuencias usadas en SFT tenían longitudes de 256, 512, 1024 y 2048 tokens. La pérdida final de validación fue 1,2564 (perplejidad 3,513). Se añadieron tres tokens de rol al vocabulario base de 32 000 (Mistral v0.1 SentencePiece): `<|system|>`, `<|user|>` y `<|assistant|>`. La plantilla de chat requiere que el mensaje de sistema, si existe, aparezca primero, y los roles deben alternar entre usuario y asistente. No se inyecta ningún prompt de sistema por defecto.

## Capacidades

- Generación de texto en inglés con formato de chat multi-turno, incluyendo mensajes de sistema opcionales.
- Seguimiento de instrucciones y respuestas conversacionales, entrenado con pérdida solo sobre los tokens de asistente.
- Razonamiento básico y comprensión de contexto limitado a 4096 tokens (validado hasta 2048).
- Soporte de generación greedy y decodificación autoregresiva estándar.
- No se documenta soporte explícito para tool calling, function calling, agentes, visión, audio o modo de razonamiento especial.
- Capacidad de procesamiento por lotes con `use_cache=False` para forward passes directos.
- Integración con Transformers mediante código personalizado (`trust_remote_code=True`).

## Casos de uso

- Chatbots ligeros para sitios web o aplicaciones de mensajería: el modelo puede mantener conversaciones multi-turno con un contexto de hasta 2048 tokens validados, suficiente para asistentes de soporte básico o respuestas a preguntas frecuentes.
- Prototipado rápido de aplicaciones de IA generativa: su pequeño tamaño y velocidad de decodificación (242,7 tok/s en RTX 3090) permiten iterar sobre prompts y flujos de conversación sin necesidad de infraestructura costosa.
- Generación de respuestas en inglés para herramientas de productividad: resúmenes breves, redacción de correos o borradores de documentos, aprovechando su capacidad de seguir instrucciones.
- Educación y experimentación en NLP: sirve como modelo de referencia para estudiar arquitecturas híbridas (atención + convolución) y comparar su rendimiento con otros modelos de tamaño similar.
- Despliegue en entornos con recursos limitados: con 0,3 GB de memoria BF16 y consumo de VRAM estimado inferior a 1 GB, puede ejecutarse en CPUs modernas o GPUs de baja gama para aplicaciones de baja latencia.
- Benchmarking de modelos pequeños: su licencia MIT y formato Safetensors lo convierten en un candidato para evaluaciones comparativas de velocidad y calidad frente a otros modelos de ~140 M.
- Generación de datos sintéticos de chat: dado su entrenamiento en conversaciones, puede usarse para crear ejemplos de diálogo para fine-tuning de modelos más grandes.

## Benchmarks y rendimiento

La model card reporta la pérdida final de validación SFT: 1,2564 (perplejidad 3,513). No se proporcionan resultados específicos de Speck1.5-140M-Instruct en los benchmarks Open SLM Int Index ni BananaMind Base Bench 1.1, aunque se menciona que estas métricas se usaron para evaluar el modelo. La tabla siguiente muestra los valores de los modelos comparados en la misma tabla de evaluación, pero los datos de Speck no aparecen en la información disponible.

| Modelo | Params | Tokens de entrenamiento | Open SLM Int Index | BananaMind Base Bench 1.1 Elo | CPU prefill (tok/s) | CPU decode (tok/s) | RTX 3090 prefill (tok/s) | RTX 3090 decode (tok/s) | BF16 mem @2K (MiB) | BF16 state @2K (MiB) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| BananaMind-2-Pro | 139M | 100B | 24,96 | 1131 | 2190 | 43,0 | 64 060 | 140,3 | 325,1 | 60,0 |
| SmolLM2-135M | 135M | ~2T | 27,13 | 1119 | 2201 | 47,4 | 64 814 | 157,7 | 301,6 | 45,0 |
| GPT-X2.5-135M | 135M | 75B | 25,17 | 1106 | 2042 | 47,2 | 55 346 | 125,0 | 302,6 | 45,0 |
| Supra2-100M-Base | 101M | 30B | 19,41 | 1030 | 3362 | — | — | — | — | — |

Para Speck1.5-140M-Instruct, la model card solo indica velocidades propias: CPU decode 56,6 tok/s y RTX 3090 decode 242,7 tok/s (batch 1). No se publican resultados de los benchmarks de calidad en la información disponible. No se deben extrapolar valores no reportados.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en BF16 ocupa aproximadamente 0,3 GB (281 MB) de memoria de pesos. Con una secuencia de 2048 tokens, la memoria total estimada es de unos 325 MiB para el modelo completo (según datos de modelos comparables). Cabe holgadamente en cualquier GPU con más de 512 MiB de VRAM.
- GPU recomendadas: cualquier GPU moderna con soporte BF16, por ejemplo RTX 3090, RTX 4090, A100, H100. También funciona en CPU con float32.
- En consumer GPU: sí, cabe en prácticamente cualquier GPU de consumo, incluso integradas (iGPU) si se usa cuantización adicional (no documentada).
- Opciones de despliegue: se puede cargar con Transformers usando `trust_remote_code=True`. No se mencionan integraciones específicas con vLLM, llama.cpp, Ollama o TGI. Dado su tamaño, es viable ejecutarlo en CPU con buena velocidad (56,6 tok/s en CPU).
- Latencia y throughput: decodificación en CPU a 56,6 tok/s (batch 1) y en RTX 3090 a 242,7 tok/s (batch 1). Prefill no reportado para este modelo.

## Comparativa con modelos similares

La siguiente comparativa se basa en los datos de la model card para modelos de tamaño similar (100-150 M de parámetros). Los valores de Speck no están disponibles para Open SLM ni BananaMind.

| Modelo | Params | Tokens preentrenamiento | Open SLM Int Index | BananaMind Elo | CPU decode (tok/s) | RTX 3090 decode (tok/s) | Licencia |
|---|---:|---:|---:|---:|---:|---:|---|
| Speck1.5-140M-Instruct | 140,7M | 5B | n/d | n/d | 56,6 | 242,7 | MIT |
| SmolLM2-135M | 135M | ~2T | 27,13 | 1119 | 47,4 | 157,7 | Apache 2.0 |
| BananaMind-2-Pro | 139M | 100B | 24,96 | 1131 | 43,0 | 140,3 | n/d |
| GPT-X2.5-135M | 135M | 75B | 25,17 | 1106 | 47,2 | 125,0 | n/d |
| Supra2-100M-Base | 101M | 30B | 19,41 | 1030 | 43,0 | n/d | n/d |

Speck1.5-140M-Instruct destaca por su mayor velocidad de decodificación en RTX 3090 frente a los modelos comparados, aunque su entrenamiento es significativamente menor (5B tokens) en comparación con SmolLM2 (~2T) o BananaMind (100B). La licencia MIT es permisiva, mientras que SmolLM2 usa Apache 2.0. No se dispone de datos de calidad para Speck, por lo que no se puede establecer una conclusión sobre rendimiento relativo.

## Limitaciones y advertencias

- El contexto máximo configurado es 4096 tokens, pero la model card advierte que solo se ha validado hasta 2048. No se recomienda usar secuencias más largas sin pruebas adicionales.
- El modelo solo soporta inglés. No hay evidencia de capacidades multilingües.
- No se documenta soporte para tool calling, function calling, agentes, visión ni audio.
- El entrenamiento se realizó sobre 5B tokens, una cantidad muy inferior a la de otros modelos de tamaño similar; es probable que su conocimiento enciclopédico y su razonamiento sean limitados en comparación.
- Riesgo de alucinación y sesgos no evaluados: no se proporcionan estudios de sesgos ni de comportamiento en dominios sensibles.
- La generación validada es solo para greedy decoding con un solo prompt; el uso de muestreo o lotes puede requerir ajustes adicionales.
- El modelo requiere `trust_remote_code=True` en Transformers, lo que implica ejecutar código personalizado no auditado por Hugging Face.
- No se han publicado resultados de benchmarks de calidad en la información disponible, por lo que no se puede verificar su rendimiento frente a otros modelos.
- La licencia MIT permite uso comercial, pero el usuario debe asumir la responsabilidad de los posibles sesgos o errores del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/specklabs/Speck1.5-140M-Instruct
- Modelo base: https://huggingface.co/specklabs/Speck1.5-140M
- Versión anterior (Speck1-140M-Instruct): https://huggingface.co/specklabs/Speck1-140M-Instruct
- Dataset de chat SpeckChat2: https://huggingface.co/datasets/specklabs/SpeckChat2
- Open SLM Leaderboard: https://huggingface.co/spaces/AxiomicLabs/Open_SLM_Leaderboard
- BananaMind Base Bench 1.1: https://huggingface.co/datasets/BananaMind/BananaMind-Base-Bench-1.1
- Entrada en LLM Explorer: https://llm-explorer.com/model/specklabs%2FSpeck1-140M-Instruct,42bo3zsIoltvXtgS6xbaEa
