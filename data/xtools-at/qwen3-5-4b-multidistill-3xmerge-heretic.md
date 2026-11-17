# xtools-at/Qwen3.5-4B-MultiDistill-3xMerge-heretic

## Resumen

Qwen3.5-4B-MultiDistill-3xMerge-heretic es un checkpoint experimental publicado por el usuario xtools-at en Hugging Face. Se trata de una versión "decensored" (abliterated) del merge `xtools-at/Qwen3.5-4B-MultiDistill-3xMerge`, que a su vez combina mediante media ponderada lineal tres fine-tunes de Qwen3.5-4B orientados a razonamiento: una destilación de trazas estilo Claude Opus 4.6, una destilación del profesor Qwen3.8 de Empero y una destilación de matemáticas y STEM de DeepSeek-V4-Pro. El resultado es un modelo denso de aproximadamente 4.539 millones de parámetros (4,54 B) sobre la arquitectura Qwen3.5, con licencia Apache-2.0 declarada.

El proceso de "decensoring" se ha realizado con Heretic v2.0.0.dev0, una herramienta de ablación de direcciones que reduce la tasa de rechazos del modelo original. Según la model card, los rechazos pasan de 98/100 en el modelo base a 3/100 en esta versión, con una divergencia KL de 0,0200 respecto al original. La ablación se aplica mediante Arbitrary-Rank Ablation (ARA) sobre las capas 16 a 30, con pesos específicos de preservación y corrección de comportamiento.

El modelo es relevante para quienes necesitan un modelo compacto de razonamiento sin restricciones de rechazo, reproducible (incluye directorio `reproduce/`) y desplegable en hardware de consumo. No obstante, es un checkpoint experimental sin benchmarks independientes publicados en su model card, por lo que sus capacidades no deben asumirse equivalentes a las de los modelos fuente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso Qwen3.5 (qwen3_5) |
| Parámetros totales | 4.539.265.536 (4,54 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible en la información proporcionada (pesos en safetensors; cuantizaciones GGUF/AWQ no documentadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (verificar términos upstream antes de redistribuir) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Qwen3.5-4B, un transformer denso de aproximadamente 4B parámetros. Sobre esa base se aplica un merge de checkpoints mediante media ponderada lineal con tres fuentes: `Jackrong/Qwen3.5-4B-Claude-4.6-Opus-Reasoning-Distilled-v2` (peso 1), `empero-ai/Qwen3.8-4B-Distill` (peso 0,8) y `Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B` (peso 0,6). El merge busca combinar razonamiento general, eficiencia de trazas, seguimiento de instrucciones y matemáticas/STEM.

Los datos de entrenamiento provienen de las tres destilaciones: más de 14.000 muestras de razonamiento estilo Claude Opus 4.6, aproximadamente 45.000 trazas del profesor Qwen3.8 2.4T A95B y unas 250.000 muestras de matemáticas y STEM de DeepSeek-V4-Pro en modo Max Effect. La fuente DeepSeek-V4-Pro se entrenó con Unsloth y LoRA fusionado a BF16, y no incluyó datos específicos de código. Sobre el merge se aplica después la ablación Heretic v2.0.0.dev0 con parámetros ARA: `start_layer_index` 16, `end_layer_index` 30, `preserve_good_behavior_weight` 0,9511, `steer_bad_behavior_weight` 0,0016, `overcorrect_relative_weight` 0,6627 y `neighbor_count` 14. El modelo incluye bloques `<think>` aprendidos y function calling nativo según la especificación Qwen3.5, heredados de la fuente Empero.

## Capacidades

- Generación de texto y razonamiento general con trazas estructuradas y económicas.
- Razonamiento matemático y STEM con derivaciones detalladas y descomposición de problemas.
- Modo de pensamiento (`<think>`) aprendido, heredado de la destilación de Empero.
- Function calling / tool calling nativo según la especificación Qwen3.5.
- Seguimiento de instrucciones y tareas analíticas de múltiples pasos.
- Reducción drástica de rechazos (3/100 frente a 98/100 del original), lo que permite abordar peticiones que el modelo base rechazaría.
- Capacidades multilingües: no documentadas en la información disponible.
- Capacidades de visión: la pipeline declarada es `image-text-to-text` en los tags de Hugging Face, aunque la model card no detalla el soporte visual; tratar como no confirmado.

## Casos de uso

- Razonamiento matemático en entornos educativos o de investigación: el modelo puede generar derivaciones paso a paso y descomponer problemas cuantitativos, aprovechando la destilación de DeepSeek-V4-Pro con 250.000 muestras de matemáticas y STEM.
- Asistente de análisis técnico sin filtros de rechazo: útil para revisar contenido sensible en entornos controlados (seguridad, red teaming, investigación) donde el modelo original rechazaría el 98 % de las peticiones y este solo el 3 %.
- Prototipado de agentes con tool calling: el soporte nativo de function calling y los bloques `<think>` permiten construir flujos de razonamiento multi-paso con llamadas a herramientas en pipelines de automatización.
- Generación de trazas de razonamiento para destilación: al ser un modelo pequeño y reproducible, puede usarse para generar datos de razonamiento estructurado que alimenten el entrenamiento de modelos aún más pequeños.
- Despliegue en hardware de consumo: con 4,54 B parámetros y pesos safetensors, es viable en GPUs de gama alta para consumidores (ver sección de hardware) para tareas de razonamiento local sin dependencia de la nube.
- Investigación en alineación y ablación: el directorio `reproduce/` y los parámetros ARA documentados permiten reproducir y estudiar el efecto de la ablación sobre el comportamiento del modelo.
- Evaluación comparativa de merges: sirve como referencia para estudiar cómo la combinación ponderada de destilaciones afecta al rendimiento en razonamiento frente a cada fuente individual.

## Benchmarks y rendimiento

La model card solo publica métricas del proceso de decensoring, no benchmarks de razonamiento:

| Métrica | Este modelo | Modelo original |
|---|---|---|
| Rechazos | 3/100 | 98/100 |
| Divergencia KL | 0,0200 | 0 (por definición) |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor indica explícitamente que el merge combinado no ha sido evaluado de forma independiente y que sus capacidades no deben asumirse equivalentes a las de los modelos fuente.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 12-16 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 5 GB de pesos; en 4 bits, alrededor de 3 GB (cuantizaciones no documentadas oficialmente, estimación por tamaño).
- GPU recomendadas: A100 40 GB, H100, L40S para producción; RTX 4090 (24 GB) y RTX 3090 (24 GB) para BF16 con holgura; RTX 4080/4070 Ti Super (16 GB) para 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en BF16 y en GPUs de 8-12 GB con cuantización de 4-8 bits.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI para serving; llama.cpp/Ollama si se generan cuantizaciones GGUF (no publicadas en el repo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Notas |
|---|---|---|---|---|---|
| Este modelo (heretic) | 4,54 B | No disponible | Apache-2.0 | Razonamiento + matemáticas/STEM, sin rechazos | Merge de 3 destilaciones + ablación Heretic |
| xtools-at/Qwen3.5-4B-MultiDistill-3xMerge | ~4 B | No disponible | Apache-2.0 | Razonamiento + matemáticas/STEM | Modelo base; 98/100 rechazos |
| Jackrong/Qwen3.5-4B-Claude-4.6-Opus-Reasoning-Distilled-v2 | ~4 B | No disponible | No disponible | Razonamiento general | Fuente con peso 1 en el merge |
| empero-ai/Qwen3.8-4B-Distill | ~4 B | No disponible | No disponible | Destilación de profesor, instrucciones | Fuente con peso 0,8; incluye `<think>` y function calling |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B | ~4 B | No disponible | No disponible | Matemáticas y STEM | Fuente con peso 0,6; sin datos de código |

No se dispone de benchmarks comparativos publicados para establecer diferencias de rendimiento entre estas variantes.

## Limitaciones y advertencias

- Checkpoint experimental sin benchmarks independientes; el rendimiento no está validado y puede no coincidir con el de los modelos fuente.
- La ablación Heretic reduce rechazos pero puede degradar la calidad en tareas que dependían de comportamientos de seguridad; la divergencia KL de 0,0200 indica un cambio medible respecto al original.
- Riesgo de alucinación inherente a modelos de 4B y a la destilación de trazas; no hay evaluación de fidelidad factual publicada.
- La fuente DeepSeek-V4-Pro no incluyó datos de código, por lo que las capacidades de programación no están establecidas.
- Idiomas soportados no documentados; el comportamiento multilingüe es incierto.
- Longitud de contexto no especificada; no asumir ventanas largas sin verificación empírica.
- Licencia Apache-2.0 declarada, pero la model card advierte de verificar los términos upstream de los modelos fuente antes de redistribuir.
- El uso comercial es posible según la licencia, pero la ausencia de benchmarks y la naturaleza "uncensored" requieren evaluación propia y salvaguardas adicionales en producción.
- El pipeline `image-text-to-text` aparece en los tags, pero la capacidad visual no está confirmada en la model card; no asumir soporte multimodal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xtools-at/Qwen3.5-4B-MultiDistill-3xMerge-heretic
- Modelo base del merge: https://huggingface.co/xtools-at/Qwen3.5-4B-MultiDistill-3xMerge
- Fuente 1 (Claude Opus 4.6 distillation): https://huggingface.co/Jackrong/Qwen3.5-4B-Claude-4.6-Opus-Reasoning-Distilled-v2
- Fuente 2 (Empero Qwen3.8-4B Distill): https://huggingface.co/empero-ai/Qwen3.8-4B-Distill
- Fuente 3 (DeepSeek-V4-Pro-Qwen3.5-4B): https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B
- Heretic: https://heretic-project.org
- Dataset nohurry/Opus-4.6-Reasoning-3000x-filtered: https://huggingface.co/datasets/nohurry/Opus-4.6-Reasoning-3000x-filtered
- Dataset Jackrong/Qwen3.5-reasoning-700x: https://huggingface.co/datasets/Jackrong/Qwen3.5-reasoning-700x
- Dataset Roman1111111/claude-opus-4.6-10000x: https://huggingface.co/datasets/Roman1111111/claude-opus-4.6-10000x
