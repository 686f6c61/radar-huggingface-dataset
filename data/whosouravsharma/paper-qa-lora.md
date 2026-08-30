# whosouravsharma/paper-qa-lora

## Resumen

`paper-qa-lora` es un adaptador LoRA (concretamente QLoRA, entrenado en 4-bit NF4) desarrollado por `whosouravsharma` sobre el modelo base `Qwen/Qwen2.5-1.5B-Instruct`. Su propósito es especializar el modelo para responder preguntas sobre artículos científicos de forma estrictamente basada en el contexto proporcionado, citando la frase de origen y declarando explícitamente cuándo el contexto no contiene la respuesta. El adaptador se entrenó sobre el dataset `whosouravsharma/paper-qa-qasper-sft`, derivado de QASPER, que incluye ejemplos negativos (preguntas no respondibles) para reforzar el comportamiento de rechazo.

El modelo resuelve un problema concreto: en sistemas de retrieval-augmented generation (RAG) sobre literatura científica, es crítico que el generador no alucine respuestas fuera del contexto recuperado. Este adaptador, con solo 4,3 millones de parámetros entrenables (0,488% del total), ajusta un modelo de 1,5B de parámetros para esta tarea, manteniendo un coste de entrenamiento bajo y una inferencia ligera. La relevancia actual radica en que ofrece una alternativa eficiente y de código abierto para construir pipelines de QA sobre papers, con una licencia Apache 2.0 que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only) basada en Qwen2.5-1.5B-Instruct + adaptador LoRA |
| Parametros totales | 1.5B (modelo base) + 4,358,144 (adaptador LoRA) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada en la documentacion; el modelo base Qwen2.5-1.5B-Instruct soporta 32k tokens (dato externo) |
| Tipos de cuantizacion | Entrenado con QLoRA 4-bit NF4; el modelo base puede cargarse en precision completa, 8-bit o 4-bit |
| Idiomas soportados | No disponibles en la ficha; el modelo base Qwen2.5-1.5B-Instruct soporta principalmente ingles y chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador), compatible con PEFT |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen2.5-1.5B-Instruct, un modelo Transformer decoder-only con atención causal. Se aplica QLoRA (Quantized Low-Rank Adaptation) en 4-bit NF4, con rango LoRA de 16, alpha de 32 y dropout de 0.05, atacando los módulos de atención `q_proj`, `k_proj`, `v_proj` y `o_proj`. El entrenamiento se realizó durante 3 épocas con una tasa de aprendizaje de 0.0002 sobre el dataset QASPER, que contiene tuplas (contexto, pregunta, respuesta) extraídas de papers de NLP, incluyendo ejemplos negativos para entrenar el rechazo de preguntas no respondibles.

El dataset de entrenamiento, `whosouravsharma/paper-qa-qasper-sft`, es una versión supervisada de QASPER. No se especifica el número total de tokens ni la composición exacta, pero la evaluación final muestra una pérdida de 1.302 y una precisión media por token de 0.725. No se menciona el uso de RLHF o DPO; el ajuste es puramente supervisado con pérdida de entropía cruzada.

## Capacidades

- Generación de respuestas a preguntas sobre artículos científicos basándose únicamente en el contexto proporcionado.
- Cita automática de la frase de origen dentro de la respuesta (comportamiento aprendido del dataset).
- Detección explícita de preguntas no respondibles: el modelo está entrenado para indicar que el contexto no contiene la respuesta, en lugar de inventarla.
- Especialización en dominios de NLP y papers académicos (por el dataset QASPER).
- No soporta tool calling, ni agentes, ni razonamiento multi-paso más allá de la generación de texto condicionada al contexto.
- Capacidades multilingües limitadas; el modelo base es principalmente inglés, aunque puede generar en otros idiomas con menor calidad.

## Casos de uso

- Asistente de lectura de papers: un investigador pega un fragmento de un artículo y hace preguntas; el modelo responde con citas textuales, facilitando la verificación.
- Pipeline RAG para literatura científica: el adaptador se integra como generador en un sistema de recuperación, garantizando que las respuestas se basen en los pasajes recuperados y evitando alucinaciones.
- Chatbot de documentación técnica: para bases de conocimiento de papers internos, el modelo puede responder preguntas con referencias exactas.
- Herramienta de revisión sistemática: ayuda a extraer información específica de un conjunto de artículos, indicando cuándo un dato no está presente.
- Filtro de preguntas no respondibles: en un sistema de QA, puede identificar preguntas que no tienen respuesta en el corpus, ahorrando tiempo de búsqueda.
- Educación y tutoría: para estudiantes que necesitan aclarar conceptos de un paper, el modelo puede responder con citas del texto original.

## Benchmarks y rendimiento

La model card solo reporta métricas de la evaluación interna (validation split, última época):

| Metrica | Valor |
|---|---|
| eval_loss | 1.302024245262146 |
| eval_entropy | 1.2851145122990464 |
| eval_mean_token_accuracy | 0.7254449254149323 |
| eval_num_tokens | 3,205,503 |
| eval_runtime (seg) | 197.317 |

No se han publicado resultados comparativos en benchmarks estándar como MMLU, HumanEval o GSM8K. La evaluación se limita a la tarea específica de QA sobre papers, sin comparación con otros modelos.

## Requisitos de hardware

- VRAM estimada: con el modelo base en 4-bit (como se entrenó), la inferencia requiere aproximadamente 1.5 GB de VRAM. En 8-bit, unos 2 GB; en precisión completa, unos 3 GB. El adaptador LoRA añade una cantidad despreciable.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, por ejemplo NVIDIA GTX 1650, RTX 3060, o GPUs de datacenter como T4. Incluso puede ejecutarse en CPU con quantización.
- Cabe en GPUs de consumo: sí, en la mayoría de las gráficas modernas con 4 GB o más.
- Opciones de despliegue: se puede servir con `transformers` + `peft`, usando `vLLM` (si se fusiona el adaptador), `llama.cpp` (convertiendo a GGUF), o `Ollama` (con conversión previa). También se puede integrar en pipelines de Hugging Face Inference Endpoints.
- Latencia y throughput: para un modelo de 1.5B en una GPU T4, la latencia por token suele ser de 10-20 ms, permitiendo un throughput de 50-100 tokens/segundo en batch pequeño. No se han medido valores específicos para este adaptador.

## Comparativa con modelos similares

No se dispone de comparativas directas publicadas por el autor. Como referencia, el modelo base sin adaptador (Qwen2.5-1.5B-Instruct) tiene un rendimiento generalista, pero no está especializado en QA con citas ni en rechazo de preguntas no respondibles. Otros adaptadores LoRA para QA sobre papers podrían existir, pero no hay información disponible. Se puede comparar con modelos de tamaño similar como Phi-3-mini (3.8B) o Llama-3.2-1B, pero no hay datos de evaluación en la misma tarea. Por tanto, la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre QASPER, que contiene papers de NLP; el comportamiento de grounding y rechazo puede no transferirse bien a otros dominios científicos (biología, física, etc.).
- El modelo base tiene un límite de contexto de 32k tokens (según especificaciones de Qwen), pero el adaptador no ha sido probado en contextos largos; se recomienda no exceder los 4k-8k tokens para mantener la calidad.
- Riesgo de alucinación residual: aunque está entrenado para citar y rechazar, pueden existir casos límite donde invente respuestas si el contexto es ambiguo.
- No se ha evaluado en conjuntos de datos fuera de QASPER; el rendimiento en otros tipos de documentos (no científicos) puede degradarse.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-1.5B-Instruct también es Apache 2.0, sin restricciones adicionales.
- El repositorio del adaptador tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto experimental sin validación comunitaria amplia.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/whosouravsharma/paper-qa-lora)
- [Dataset de entrenamiento](https://huggingface.co/datasets/whosouravsharma/paper-qa-qasper-sft)
- [Perfil del autor (proyecto RAG + PEFT)](https://huggingface.co/whosouravsharma)
- [Paper QA-LoRA (Quantization-Aware Low-Rank Adaptation) - arXiv](https://arxiv.org/abs/2309.14717) (referencia técnica sobre técnicas de cuantización y LoRA, no es el mismo método pero complementa la comprensión)
- [Página del paper QA-LoRA en Hugging Face](https://huggingface.co/papers/2309.14717)
