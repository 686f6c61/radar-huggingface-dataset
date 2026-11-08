# xtools-at/Qwen3.5-4B-MultiDistill-3xMerge-UNCENSORED-heretic

## Resumen

Qwen3.5-4B-MultiDistill-3xMerge-UNCENSORED-heretic es un checkpoint experimental publicado por el usuario xtools-at en Hugging Face. Se trata de un merge lineal ponderado de tres fine-tunes de Qwen3.5-4B orientados al razonamiento, al que posteriormente se le ha aplicado un proceso de "decensurado" mediante la herramienta Heretic v2.0.0.dev0. El resultado es un modelo de aproximadamente 4.539 millones de parámetros (4,54B reales según los pesos en safetensors) con licencia Apache-2.0 declarada.

El modelo base del merge, xtools-at/Qwen3.5-4B-MultiDistill-3xMerge, combina tres destilaciones con enfoques complementarios: una destilación de trazas de razonamiento al estilo Claude Opus 4.6, una destilación completa del profesor Qwen3.8 (2.4T A95B) y una destilación de matemáticas y STEM a partir de DeepSeek-V4-Pro. La variante heretic añade una ablación de rangos arbitrarios (ARA) sobre las capas 16 a 30 que reduce drásticamente las negativas a responder, pasando de 98/100 negativas en el modelo original a 3/100 en esta versión, con una divergencia KL de 0,0200 respecto al original.

Es relevante ahora porque ejemplifica una tendencia creciente en el ecosistema open source: merges reproducibles de destilaciones de modelos propietarios de gran tamaño en arquitecturas compactas de 4B, combinados con técnicas de ablación de comportamiento. No obstante, el propio autor advierte que es un checkpoint experimental sin benchmarks independientes, por lo que sus capacidades no deben asumirse equivalentes a las de los modelos fuente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-4B), merge lineal ponderado de checkpoints |
| Parámetros totales | 4.539.265.536 (4,54B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; el repo ocupa 9,1 GB) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (verificar términos upstream antes de redistribuir) |
| Formato de pesos | Safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-4B, un transformer denso de aproximadamente 4B parámetros. Sobre esa base se aplica un merge lineal ponderado de tres checkpoints fine-tuneados: Jackrong/Qwen3.5-4B-Claude-4.6-Opus-Reasoning-Distilled-v2 con peso 1, empero-ai/Qwen3.8-4B-Distill con peso 0,8 y Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B con peso 0,6. El primero aporta más de 14.000 muestras de razonamiento al estilo Claude Opus 4.6; el segundo, unas 45.000 trazas filtradas por calidad de un profesor Qwen3.8 de 2.4T parámetros con arquitectura A95B; el tercero, unas 250.000 muestras de matemáticas y STEM destiladas de DeepSeek-V4-Pro en modo Max Effect, con fine-tuning asistido por Unsloth y LoRA fusionado a BF16.

Sobre el merge se aplica Heretic v2.0.0.dev0, una técnica de ablación de rangos arbitrarios (ARA) que opera entre las capas 16 y 30 con los siguientes hiperparámetros: start_layer_index 16, end_layer_index 30, preserve_good_behavior_weight 0,9511, steer_bad_behavior_weight 0,0016, overcorrect_relative_weight 0,6627 y neighbor_count 14. El proceso es reproducible: el repositorio incluye un directorio `reproduce` con instrucciones. La model card no especifica el número total de tokens de entrenamiento del merge ni detalles sobre RLHF o DPO posteriores.

## Capacidades

- Generación de texto y razonamiento general: matemáticas, deducción lógica y resolución estructurada de problemas.
- Razonamiento eficiente: patrones concisos y organizados heredados de las trazas destiladas de Claude Opus 4.6.
- Matemáticas y STEM: derivaciones detalladas, resolución de problemas científicos y razonamiento cuantitativo multi-paso.
- Seguimiento de instrucciones amplio: trazas de razonamiento generadas por profesor para tareas generales.
- Bloques `<think>` aprendidos y comportamiento nativo de function calling según la especificación de Qwen3.5 (heredado del modelo Empero).
- Modo "decensurado": reducción drástica de negativas a responder (3/100 frente a 98/100 del original).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de visión: la etiqueta `image-text-to-text` aparece en los tags, pero la model card no detalla soporte multimodal; no disponible como capacidad confirmada.

## Casos de uso

- Razonamiento matemático asistido: el modelo puede descomponer problemas cuantitativos en pasos verificables y producir derivaciones detalladas, aprovechando la destilación de 250.000 muestras de matemáticas y STEM de DeepSeek-V4-Pro.
- Tutoría técnica y STEM: explicación de conceptos científicos con trazas de razonamiento estructuradas, adecuado para entornos educativos donde se requiere transparencia en el proceso de resolución.
- Prototipado de agentes con function calling: el comportamiento nativo de tool calling heredado de Qwen3.5 permite integrarlo en pipelines de agentes que necesiten invocar APIs o herramientas externas.
- Investigación sobre alineación y decensurado: útil como caso de estudio reproducible de ablación ARA con parámetros documentados, para analizar el equilibrio entre reducción de negativas y preservación de comportamiento (KL de 0,0200).
- Generación de razonamiento sintético: puede emplearse para producir trazas de razonamiento en dominios matemáticos y lógicos que alimenten posteriores fine-tunes o destilaciones.
- Despliegue en hardware limitado: con 4,54B parámetros y pesos safetensors de 9,1 GB, es viable en GPUs de consumo para experimentación local con cuantización (aunque el autor no publica versiones GGUF).
- Análisis de instrucciones complejas: seguimiento de instrucciones multi-paso en tareas analíticas, gracias a la combinación de tres enfoques de destilación complementarios.

## Benchmarks y rendimiento

La model card incluye únicamente métricas del proceso de decensurado, no benchmarks de capacidad:

| Métrica | Este modelo | Modelo original (Qwen3.5-4B-MultiDistill-3xMerge) |
|---|---|---|
| Negativas (refusals) | 3/100 | 98/100 |
| Divergencia KL | 0,0200 | 0 (por definición) |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor indica explícitamente que el merge combinado no ha sido evaluado de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9-10 GB solo para pesos, más overhead de activaciones y KV cache (el repo ocupa 9,1 GB).
- VRAM estimada en cuantización de 8 bits: en torno a 5-6 GB; en 4 bits, en torno a 3-4 GB (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas: A100 o H100 para inferencia en BF16 con contexto largo; RTX 4090 (24 GB) para BF16 con margen amplio.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más en cuantización de 8 bits, y en tarjetas de 8 GB con cuantización de 4 bits (si se generan pesos GGUF, no incluidos en el repo).
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI para servir en producción, llama.cpp u Ollama si se convierten los pesos a GGUF (no se proporcionan en el repositorio).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-MultiDistill-3xMerge-UNCENSORED-heretic | 4,54B | No disponible | Merge de 3 destilaciones + decensurado ARA | Apache-2.0 | Hugging Face (178 descargas) |
| xtools-at/Qwen3.5-4B-MultiDistill-3xMerge | ~4B | No disponible | Merge de 3 destilaciones sin decensurar | Apache-2.0 | Hugging Face |
| xtools-at/Qwen3.5-4B-MultiDistill-Megamix-8xMerge-UNCENSORED-heretic | ~4B | No disponible | Megamix de 8 merges + decensurado | No disponible en la búsqueda | Hugging Face |
| Jackrong/Qwen3.5-4B-Claude-4.6-Opus-Reasoning-Distilled-v2 | ~4B | No disponible | Destilación de razonamiento Claude Opus 4.6 | No disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint experimental: el autor advierte que el merge combinado no ha sido evaluado de forma independiente y sus capacidades no deben asumirse equivalentes a las de los modelos fuente.
- El modelo fuente DeepSeek-V4-Pro-Qwen3.5-4B no incluyó datos de entrenamiento específicos de código, por lo que la transferencia en programación y tool-use no está establecida.
- El proceso de decensurado elimina salvaguardas de seguridad: puede generar contenido que los modelos alineados rechazarían, con implicaciones legales y de reputación en producción.
- Riesgo de alucinación: no cuantificado en la información disponible; los merges de destilaciones pueden heredar inconsistencias de los profesores.
- Idiomas soportados no documentados; no se garantiza cobertura multilingüe más allá del inglés.
- Longitud de contexto no especificada en la model card.
- Licencia Apache-2.0 declarada, pero el autor recomienda verificar los términos upstream de los tres modelos fuente antes de redistribuir o usar comercialmente.
- La etiqueta `image-text-to-text` sugiere posible soporte multimodal, pero no está confirmado ni documentado; no asumir capacidades de visión.
- Sin benchmarks publicados: no apto para decisiones de producción basadas en rendimiento medido.
- El modelo tiene muy poca tracción (178 descargas, 1 like), lo que reduce la validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xtools-at/Qwen3.5-4B-MultiDistill-3xMerge-UNCENSORED-heretic
- Modelo base del merge: https://huggingface.co/xtools-at/Qwen3.5-4B-MultiDistill-3xMerge
- Variante Megamix relacionada: https://huggingface.co/xtools-at/Qwen3.5-4B-MultiDistill-Megamix-8xMerge-UNCENSORED-heretic
- Fuente 1 (Claude Opus 4.6 distillation): https://huggingface.co/Jackrong/Qwen3.5-4B-Claude-4.6-Opus-Reasoning-Distilled-v2
- Fuente 2 (Empero Qwen3.8-4B Distill): https://huggingface.co/empero-ai/Qwen3.8-4B-Distill
- Fuente 3 (DeepSeek-V4-Pro-Qwen3.5-4B): https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B
- Heretic (herramienta de decensurado): https://heretic-project.org
- Dataset nohurry/Opus-4.6-Reasoning-3000x-filtered: https://huggingface.co/datasets/nohurry/Opus-4.6-Reasoning-3000x-filtered
- Dataset Jackrong/Qwen3.5-reasoning-700x: https://huggingface.co/datasets/Jackrong/Qwen3.5-reasoning-700x
- Dataset Roman1111111/claude-opus-4.6-10000x: https://huggingface.co/datasets/Roman1111111/claude-opus-4.6-10000x
