# WithinUsAI/WIUAI.Mini.Coder.DeepReasoning.4K

## Resumen

WIUAI Mini Coder — Deep Reasoning 4K es un ajuste fino (fine-tune) de parámetros completos del modelo `WithinUsAI/WIUAI.Mini.Coder.Traces`, desarrollado por la organización WithinUsAI. Se trata de un modelo de lenguaje de tipo decoder-only con arquitectura `LlamaForCausalLM` y 302.027.520 parámetros (aproximadamente 302 millones), orientado a la generación de texto con énfasis en razonamiento y código. El modelo parte de una ventana de contexto original de 1024 tokens que se ha extendido a 4096 mediante escalado lineal de RoPE con factor 4,0.

El modelo se entrena sobre dos conjuntos de datos sintéticos de trazas de razonamiento (`Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x` y `ChatGPT-6.1-Terra-High-Reasoning-TraceInversion-80x`), que el propio autor describe como reconstrucciones por inversión de trazas y no como razonamientos privados verificados. La relevancia de esta ficha radica en que se trata de un modelo de muy pequeño tamaño (302 M) que busca ofrecer capacidades de razonamiento explícito y código en un formato desplegable en hardware muy modesto, aunque con un conjunto de datos de entrenamiento reducido (2070 ejemplos) y sin benchmarks publicados.

Es importante señalar que el modelo no cuenta con descargas ni interacciones en el momento de la consulta, que su licencia es "other" (no estándar) y que solo declara soporte para inglés. Toda evaluación de calidad debe considerarse pendiente de validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only) |
| Parametros totales | 302.027.520 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens configurados (original 1024; RoPE lineal, factor 4,0) |
| Tipos de cuantizacion | No disponible (repo en safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | Inglés (en) |
| Licencia | Other (licencia no estándar; condiciones no detalladas) |
| Formato de pesos | Safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Llama (`LlamaForCausalLM`) con 302.027.520 parámetros, todos ellos entrenables en el ajuste fino (full-parameter fine-tuning). La extensión de contexto se realiza mediante `rope_parameters` de Transformers 5.x con escalado lineal de RoPE y factor 4,0, pasando de 1024 a 4096 posiciones. El entrenamiento se ejecutó durante 2 épocas con optimizador AdamW, tasa de aprendizaje 1e-05, precisión FP16 y semilla 1147. Se enmascaran los tokens del prompt en la pérdida supervisada, de modo que solo se supervisan los tokens de razonamiento y respuesta del asistente.

Los datos de entrenamiento provienen de dos datasets sintéticos de trazas de razonamiento por inversión (`Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x` y `ChatGPT-6.1-Terra-High-Reasoning-TraceInversion-80x`). El pipeline de preparación incluye extracción de prompts y respuestas, uso de campos de razonamiento con resumen como respaldo, deduplicación a nivel de prompt, eliminación de solapamiento entre splits y descarte duro de ejemplos superiores a 4096 tokens (sin truncado). Los tamaños finales son 2070 ejemplos de entrenamiento, 112 de evaluación y 97 de test. No se documenta uso de RLHF ni DPO, ni innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en inglés con arquitectura causal estándar.
- Razonamiento explícito: el entrenamiento supervisa trazas de razonamiento además de la respuesta final.
- Generación de código: el modelo se presenta como "Mini Coder", aunque la card no documenta métricas de corrección de código.
- Razonamiento multi-paso orientado a problemas de código y lógica, derivado de los datasets de trazas.
- Soporte de tool calling / function calling: no documentado; el autor indica que requiere pruebas independientes.
- Soporte de agentes: no documentado.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades especiales (visión, audio, modo thinking estructurado): no disponibles.

## Casos de uso

- Asistente de código en local para entornos con recursos limitados: con 302 M de parámetros, el modelo puede ejecutarse en CPU o en GPU de gama baja, lo que lo hace adecuado para autocompletado y sugerencias de código en estaciones de trabajo sin acelerador dedicado.
- Prototipado de pipelines de razonamiento: sirve para experimentar con formatos de traza de razonamiento y evaluar cómo un modelo pequeño maneja cadenas de pensamiento antes de escalar a modelos mayores.
- Generación de explicaciones paso a paso en herramientas educativas: el entrenamiento sobre trazas supervisadas permite producir respuestas con razonamiento intermedio, útil en tutoriales o asistentes de aprendizaje de programación.
- Filtrado y clasificación de código en CI/CD: al ser ligero, puede integrarse como paso previo de análisis de fragmentos de código o generación de parches candidatos que luego se validan con tests.
- Experimentación académica sobre ajuste fino completo: su tamaño permite reproducir el entrenamiento completo (full-parameter) en hardware de una sola GPU, lo que facilita estudios de ablación sobre datos de razonamiento.
- Chatbot técnico de dominio acotado en inglés: para documentación interna o soporte de desarrollo con contexto de hasta 4096 tokens, siempre que se valide su calidad en el dominio concreto.
- Evaluación de técnicas de extensión de contexto: la configuración con RoPE lineal factor 4,0 lo convierte en un banco de pruebas para medir la degradación de un modelo pequeño al extender su ventana de 1024 a 4096 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a `training_metrics.json` para métricas de entrenamiento, evaluación y test, pero no se proporcionan cifras de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0,6 GB para los pesos (302 M × 2 bytes), más overhead de activaciones y KV cache; en la práctica, menos de 1,5 GB para contextos de 4096 tokens.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,3 GB de pesos; en 4 bits, alrededor de 0,15 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior ofrece amplio margen. También cabe en GPU integradas y en CPU.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con 2 GB o más de VRAM, e incluso en CPU con suficiente RAM.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`). No se documentan pesos GGUF, por lo que llama.cpp u Ollama requerirían conversión manual.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Benchmarks publicados |
|---|---|---|---|---|---|
| WIUAI Mini Coder Deep Reasoning 4K | 302 M | 4096 | Other | Inglés | No disponibles |
| Qwen2.5-Coder-0.5B | 494 M | 32768 | Apache 2.0 | Multilingüe | Sí (HumanEval, etc.) |
| SmolLM2-360M | 362 M | 8192 | Apache 2.0 | Inglés y otros | Sí (MMLU, HellaSwag, etc.) |
| TinyLlama-1.1B | 1,1 B | 2048 | Apache 2.0 | Inglés | Sí (varios) |

La comparación se basa en categoría (modelos pequeños orientados a código o razonamiento) y datos públicos de cada modelo; no se dispone de comparaciones directas de rendimiento con WIUAI Mini Coder porque este no publica benchmarks. Frente a alternativas como Qwen2.5-Coder-0.5B o SmolLM2-360M, el modelo de WithinUsAI ofrece un contexto menor (4096 frente a 32768 u 8192) y una licencia no estándar, aunque su tamaño es ligeramente inferior.

## Limitaciones y advertencias

- La calidad del razonamiento depende enteramente de los datos de origen, que son trazas sintéticas por inversión y no razonamientos verificados.
- Riesgo elevado de alucinación: el modelo es muy pequeño y se ha entrenado con solo 2070 ejemplos.
- La pérdida de evaluación no constituye un benchmark completo de razonamiento; no hay evidencia publicada de calidad en código ni en tool calling.
- El contexto configurado de 4096 tokens no garantiza un rendimiento fiable en contexto largo; el propio autor exige validación independiente.
- Soporte únicamente en inglés; no se declaran otros idiomas.
- Licencia "other": las condiciones de uso comercial no están detalladas en la información disponible, por lo que debe revisarse antes de un despliegue en producción.
- El modelo base (`WIUAI.Mini.Coder.Traces`) y los datasets asociados deben evaluarse por separado; no se documenta su procedencia completa.
- Sin descargas ni validación comunitaria en el momento de la consulta; ausencia total de benchmarks independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WithinUsAI/WIUAI.Mini.Coder.DeepReasoning.4K
- Modelo base: https://huggingface.co/WithinUsAI/WIUAI.Mini.Coder.Traces
- Dataset de entrenamiento 1: https://huggingface.co/datasets/xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x
- Dataset de entrenamiento 2: https://huggingface.co/datasets/xtools-at/ChatGPT-6.1-Terra-High-Reasoning-TraceInversion-80x
