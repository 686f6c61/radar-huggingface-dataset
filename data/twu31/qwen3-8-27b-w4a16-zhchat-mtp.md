# Twu31/Qwen3.8-27B-W4A16-ZhChat-MTP

## Resumen

Qwen3.8-27B-W4A16-ZhChat-MTP es una cuantización INT4 (W4A16) del modelo multimodal Qwen/Qwen3.8-27B, desarrollada por Twu31 con el objetivo específico de reducir la latencia de extremo a extremo en conversaciones habladas en chino con el modo de razonamiento desactivado. A diferencia de otras cuantizaciones del mismo modelo base, esta versión se calibra con datos de diálogo coloquial chino real, incluyendo un prompt de sistema largo, turnos cortos con ruido de ASR y una cola `[emotion:X]` para expresiones faciales. El resultado es un checkpoint de 19,45 GB que cabe en una GPU de 24 GB y que, según las mediciones del autor, alcanza 415 ms por turno de 18 tokens en una RTX 6000 Ada, comparable a un modelo MoE de 35B-A3B.

La relevancia de este modelo radica en su enfoque práctico para asistentes de voz y agentes conversacionales en tiempo real: mantiene la torre de visión y el cabezal MTP (Multi-Token Prediction) en BF16, lo que permite decodificación especulativa verificada en vLLM con una tasa de aceptación del 73,1 % en chino. La licencia Apache-2.0 y la compatibilidad con vLLM desde la versión 0.17 facilitan su integración en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: atención + Gated-DeltaNet (GDN), con torre de visión multimodal |
| Parametros totales | 27B (modelo base Qwen3.8-27B); safetensors reporta 6,26B (posible error de metadatos) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 12.288 tokens (configuración recomendada en vLLM; el modelo base puede soportar más, no especificado) |
| Tipos de cuantizacion | INT4 simétrico W4A16, group_size 128, formato compressed-tensors pack-quantized (Marlin) |
| Idiomas soportados | Chino (zh), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con vLLM y Transformers |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina capas de atención tradicional con capas basadas en Gated-DeltaNet (GDN), una variante de SSM que reduce el coste del cache de KV. Solo 16 de las 64 capas mantienen un cache de KV, lo que permite un uso eficiente de memoria. La versión cuantizada conserva en BF16 la torre de visión (`model.visual.*`), el cabezal MTP (`mtp.*`), `lm_head`, embeddings, todas las normas y las proyecciones de puerta GDN (`in_proj_a/b`), mientras que el resto de pesos se cuantizan a INT4.

El proceso de cuantización se realizó con Intel AutoRound 0.14.2, usando 530 secuencias de al menos 2048 tokens, con una composición de 60 % de diálogo hablado chino con prompt de sistema de 1,4k tokens y thinking off, 20 % de conversación coloquial sin sistema y 20 % de chat general zh/en (ShareGPT-GPT4, UltraChat). El entrenamiento duró 1 hora y 14 minutos en una RTX 6000 Ada con pico de 28 GB de VRAM. No se aplicó RLHF ni DPO adicional; la calibración se centró en minimizar el error de cuantización en el dominio objetivo.

## Capacidades

- Generación de texto conversacional en chino e inglés, optimizada para respuestas cortas (20–60 tokens) con formato estable.
- Entrada multimodal: la torre de visión se mantiene intacta, por lo que acepta imágenes y vídeo (verificado a través de vLLM).
- Decodificación especulativa MTP: el cabezal MTP se conserva en BF16 y funciona en vLLM con `--speculative-config '{"method":"mtp","num_speculative_tokens":2}'`, logrando una tasa de aceptación del 73,1 % en diálogo chino y una aceleración de 1,49× en velocidad de decodificación.
- Soporte de prefijo cache en vLLM: con `--enable-prefix-caching` y un prompt de sistema fijo, se alcanza un 79 % de aciertos de cache, reduciendo el TTFT a 67 ms.
- Compatible con el modo de razonamiento desactivado (`enable_thinking: false`) para respuestas inmediatas, y con el parser de razonamiento Qwen3.
- Integración con la API de OpenAI a través de vLLM para servir el modelo como endpoint compatible.

## Casos de uso

- Asistentes de voz en tiempo real: el modelo está calibrado para diálogo hablado chino con ruido de ASR, respuestas cortas y baja latencia. Un agente de voz puede enviar el prompt de sistema con la personalidad y los turnos del usuario, y recibir respuestas en menos de 415 ms por turno en una RTX 6000 Ada, con la cola `[emotion:X]` para controlar expresiones faciales.
- Atención al cliente automatizada: con una ventana de 12k tokens y prefijo cache, puede gestionar conversaciones multi-turno con un sistema de instrucciones largo (por ejemplo, políticas de empresa) y responder de forma natural y coherente, manteniendo el contexto sin recalcular el prompt completo.
- Chatbots de entretenimiento y compañía: el formato `[emotion:X]` permite que el modelo genere respuestas con etiquetas de emoción que un sistema downstream puede usar para animar un avatar o ajustar el tono de voz.
- Generación de contenido multimodal ligero: al conservar la torre de visión, puede procesar imágenes o vídeos y responder preguntas sobre ellos, aunque el foco principal es el texto. Útil para aplicaciones que combinan entrada visual y respuesta conversacional.
- Prototipado rápido de agentes conversacionales en producción: al ser Apache-2.0 y compatible con vLLM, se puede desplegar en un solo GPU de 24 GB (por ejemplo, RTX 3090/4090) y servir con la API de OpenAI, reduciendo el coste de infraestructura frente a modelos BF16.
- Evaluación de latencia en pipelines de voz: el modelo sirve como banco de pruebas para medir el rendimiento de decodificación especulativa y prefijo cache en entornos reales, gracias a los datos de benchmark publicados por el autor.

## Benchmarks y rendimiento

El autor publica mediciones de latencia en una RTX 6000 Ada (48 GB, 960 GB/s) con vLLM 0.24.0, usando prompts de conversación reales (prompt de sistema de 1,4k tokens, 2 turnos de historia y una frase de usuario), greedy, thinking off, 18 prompts × 3 runs. Los resultados clave son:

| Configuracion | Prompt tokens | Prefix-cache hit | TTFT | Total / turno | ms/token |
|---|---|---|---|---|---|
| Default (`--enable-prefix-caching`) | 1449 | 51 % | 272 ms | 634 ms | 20,4 |
| + `--mamba-ssm-cache-dtype bfloat16` | 1449 | 79 % | 120 ms | no disponible | no disponible |
| Receta completa (prefijo cache + bfloat16) | 1600 | no disponible | 67 ms | 415 ms (turno de 18 tokens) | no disponible |

Con MTP activado (2 tokens especulativos), la tasa de aceptación es del 73,1 % y la velocidad de decodificación mejora de 20,4 a 13,7 ms/token (1,49×). No se proporcionan benchmarks de calidad (MMLU, HumanEval, etc.) porque se trata de una cuantización, no de un modelo nuevo; el autor se centra en métricas de latencia.

## Requisitos de hardware

- VRAM estimada: 19,45 GB para el checkpoint, por lo que cabe en GPUs de 24 GB (RTX 3090, RTX 4090, A5000) con contexto moderado; se recomienda 48 GB o más para contexto largo o procesamiento multimodal.
- GPUs compatibles: cualquier GPU Ampere o posterior (SM 8.0+), incluyendo A100, A800, RTX 30/40, RTX 6000 Ada, L40S, H100. El kernel Marlin W4A16 requiere soporte para INT4.
- Despliegue recomendado: vLLM ≥ 0.17 (probado en 0.24.0 y 0.27.1) con `--quantization` auto-detectado; también funciona con Transformers ≥ 5.8 + compressed-tensors para inferencia, aunque se recomienda vLLM para servir.
- Tensor parallelism: las proyecciones GDN se mantienen en BF16 para permitir TP ≥ 2 sin violar la restricción de mínimo N de Marlin.
- Latencia medida: 67 ms de TTFT y 415 ms por turno de 18 tokens en una RTX 6000 Ada con prefijo cache y bfloat16; con MTP, 13,7 ms/token en decodificación.
- Opciones de despliegue: vLLM (servidor OpenAI-compatible), llama.cpp (si se convierte a GGUF, no incluido), TGI (no verificado).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qwen3.8-27B (BF16 base) | 27B | no disponible | BF16 | Apache-2.0 | Modelo general multimodal |
| Twu31/Qwen3.8-27B-W4A16-ZhChat-MTP | 27B (cuantizado) | 12.288 | INT4 W4A16 | Apache-2.0 | Chat hablado chino, baja latencia |
| Otras cuantizaciones INT4 de Qwen3.8-27B | 27B | no disponible | INT4 | Apache-2.0 | Calibradas en texto inglés o razonamiento largo |

La principal diferencia frente a otras cuantizaciones del mismo base es la calibración específica para diálogo chino con thinking off y la verificación del MTP en vLLM. El autor reporta que una build calibrada con pile-10k logra solo un 58 % de aceptación MTP frente al 73,1 % de esta versión. No se dispone de comparaciones con otros modelos de la misma categoría (por ejemplo, Llama-3.1-8B cuantizado o Qwen2.5-14B) en los datos proporcionados.

## Limitaciones y advertencias

- Es una cuantización INT4, por lo que puede presentar una ligera pérdida de precisión frente al modelo BF16, especialmente en tareas de razonamiento complejo o generación larga.
- La calibración está optimizada para chino hablado coloquial y respuestas cortas (20–60 tokens); su rendimiento en inglés o en tareas de razonamiento extenso puede ser inferior.
- El modo de razonamiento (thinking) está desactivado por defecto; si se activa, la latencia aumentará y los beneficios de la calibración pueden reducirse.
- El número de parámetros reportado en safetensors (6,26B) no coincide con el tamaño esperado de 27B del modelo base; es probable un error de metadatos en HuggingFace, pero debe verificarse antes de usar el modelo en producción.
- La compatibilidad con vLLM requiere versiones ≥ 0.17; en versiones anteriores, la cuantización puede no cargarse correctamente.
- No se proporcionan benchmarks de calidad (MMLU, HumanEval, etc.), por lo que no se puede evaluar su rendimiento en tareas estándar.
- El modelo está pensado para servirse con vLLM; el uso con Transformers puede ser más lento y no soportar MTP.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Twu31/Qwen3.8-27B-W4A16-ZhChat-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Intel AutoRound: https://github.com/intel/auto-round
- vLLM (issue sobre KV scales): https://github.com/vllm-project/vllm/issues/37554
- Documentación de vLLM para decodificación especulativa: https://docs.vllm.ai/en/latest/features/spec_decode.html
