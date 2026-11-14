# thanhkt/qwen3.5-4b-lora-r32-e2-final

## Resumen

`thanhkt/qwen3.5-4b-lora-r32-e2-final` es un ajuste fino mediante LoRA (rango 32, época 2) del modelo base Qwen3.5-4B-Base, publicado por el usuario thanhkt en Hugging Face. El modelo resultante conserva la arquitectura multimodal de Qwen3.5-4B, un transformer híbrido que combina Gated DeltaNet (atención lineal) con atención con compuerta, y está orientado a tareas de image-text-to-text y conversación. El repositorio contiene los pesos fusionados en formato safetensors con un total de 4.659.865.088 parámetros.

La relevancia de este checkpoint es doble. Por un lado, hereda las capacidades del Qwen3.5-4B original: contexto nativo de 262.144 tokens extensible hasta 1.010.000, soporte para 201 idiomas y entrenamiento multimodal con fusión temprana. Por otro, al tratarse de un LoRA de rango 32 entrenado durante 2 épocas sobre el modelo base, representa un ejemplo de adaptación ligera orientada a un dominio o tarea concreta que el autor no ha documentado en la model card.

No obstante, la ficha del autor reutiliza casi íntegramente el README oficial de Qwen3.5-4B sin especificar el dataset de ajuste, el propósito del LoRA ni los resultados obtenidos tras el fine-tuning. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y no se han publicado benchmarks específicos del checkpoint ajustado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con encoder de visión: Gated DeltaNet + atención con compuerta, layout 8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parametros totales | 4.659.865.088 (4,66 B) |
| Parametros activos | No aplica (no es MoE en esta variante) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | No disponible (el repo solo publica safetensors; no se listan GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible en la ficha del checkpoint; el modelo base Qwen3.5 declara 201 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers) |

Otros datos técnicos del modelo base: dimensión oculta 2560, 32 capas, embedding de tokens 248.320 (con padding), FFN con dimensión intermedia 9216, 32 cabezas de atención lineal para V y 16 para QK (head dim 128), 16 cabezas de atención con compuerta para Q y 4 para KV (head dim 256), RoPE de dimensión 64, salida LM atada al embedding y entrenamiento con MTP (multi-token prediction) multi-step.

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B emplea una arquitectura híbrida que intercala bloques de Gated DeltaNet (atención lineal con estado recurrente) y bloques de atención con compuerta en una proporción 3:1, lo que reduce el coste computacional del contexto largo manteniendo capacidad expresiva. Incluye un encoder de visión y se entrenó con fusión temprana sobre tokens multimodales, de modo que el modelo procesa texto e imagen de forma conjunta desde las primeras capas. El entrenamiento del base combina pre-entrenamiento y post-entrenamiento, con RL escalado sobre entornos multi-agente y decodificación con multi-token prediction.

Sobre el ajuste específico de este repositorio solo se conoce lo que indica el nombre: LoRA de rango 32, 2 épocas, sobre Qwen3.5-4B-Base. No se detalla el dataset, la función de pérdida, el learning rate, el número de tokens de entrenamiento ni si hubo etapas adicionales de alineación (RLHF/DPO) tras el LoRA. Tampoco se especifica si los pesos publicados son el adaptador fusionado con el base o únicamente el resultado del merge; el tamaño del repo (9,3 GB) y el recuento de parámetros sugieren pesos fusionados en fp16/bf16.

## Capacidades

- Generación de texto y razonamiento en contexto largo, con ventana nativa de 262.144 tokens.
- Comprensión de imagen y texto (pipeline image-text-to-text) gracias al encoder de visión del base.
- Capacidades de código y matemáticas heredadas de Qwen3.5, con paridad declarada frente a Qwen3 en benchmarks de razonamiento, coding y agentes.
- Soporte multilingüe amplio (201 idiomas y dialectos según el modelo base).
- Compatibilidad con tool calling y function calling a través del ecosistema Transformers y servidores compatibles (vLLM, SGLang, KTransformers).
- Entrenamiento con multi-token prediction, que puede aprovecharse para decodificación especulativa.
- Modo conversacional multi-turno.
- Capacidades de agente y razonamiento multi-paso derivadas del RL del modelo base.

No se documenta en la ficha del checkpoint si el LoRA preserva íntegramente todas estas capacidades o si el ajuste las ha especializado o degradado en algún dominio.

## Casos de uso

- Atención al cliente automatizada: el contexto de 262.144 tokens permite mantener historiales de conversación muy largos y adjuntar documentación extensa sin truncar, lo que encaja en soporte técnico multi-turno.
- Análisis de documentos con imágenes: al ser image-text-to-text, puede procesar facturas, capturas o diagramas junto con texto para extracción de datos estructurados.
- Generación de código en pipelines: su compatibilidad con vLLM y SGLang y el soporte de tool calling permiten integrarlo en asistentes de IDE o revisiones automatizadas de código.
- Procesamiento de repositorios completos: la ventana extensible hasta 1.010.000 tokens facilita tareas de resumen, búsqueda semántica o refactorización sobre bases de código grandes.
- Agentes autónomos de múltiples pasos: el entrenamiento del base con RL sobre entornos multi-agente lo hace adecuado para orquestación de tareas con llamadas a herramientas.
- Despliegue multilingüe: con 201 idiomas declarados en el base, sirve para atención al cliente o moderación de contenido en mercados internacionales.
- Prototipado e investigación: al ser un LoRA de rango 32 sobre un base de 4B con licencia Apache 2.0, es útil como punto de partida para experimentos de fine-tuning reproducibles.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible corresponden al modelo base Qwen3.5-4B, no al checkpoint ajustado. Se reproducen a continuación como referencia del punto de partida.

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30BA3B-Thinking-2507 | Qwen3.5-9B | Qwen3.5-4B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 80,8 | 74,8 | 82,7 | 80,9 | 82,5 | 79,1 |
| MMLU-Redux | 91,0 | 87,8 | 92,5 | 91,4 | no disponible en el extracto | no disponible en el extracto |

No se han publicado resultados de benchmarks del checkpoint `thanhkt/qwen3.5-4b-lora-r32-e2-final` en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 9-10 GB solo para pesos, más overhead de activaciones y KV cache; con contexto largo el consumo crece de forma significativa.
- Cuantización a 8 bits: aproximadamente 5 GB de pesos; a 4 bits: aproximadamente 2,5-3 GB. No se publican cuantizaciones oficiales en el repo.
- GPU recomendadas: A100 40/80 GB o H100 para contexto completo de 262K tokens y serving concurrente; RTX 4090 (24 GB) para fp16 con contexto moderado; RTX 3090/4080 para cuantización 8 o 4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en fp16 con contexto limitado, y en GPUs de 8-12 GB con cuantización agresiva (a validar, ya que no se ofrecen GGUF).
- Opciones de despliegue: Transformers, vLLM, SGLang y KTransformers según la model card del base; llama.cpp/Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput: no disponibles para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| thanhkt/qwen3.5-4b-lora-r32-e2-final | 4,66 B | 262.144 (ext. 1.010.000) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B-Base | 4 B | 262.144 (ext. 1.010.000) | Apache 2.0 | Hugging Face, modelo oficial |
| Qwen3.5-9B | 9 B (aprox.) | no disponible en el extracto | Apache 2.0 (presumible) | Hugging Face |
| GPT-OSS-20B | 20 B (aprox.) | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto |

La comparación de rendimiento entre estos modelos solo puede hacerse con los benchmarks del base; el checkpoint ajustado no aporta métricas propias.

## Limitaciones y advertencias

- La model card no documenta el dataset de ajuste ni el objetivo del LoRA, por lo que se desconoce qué comportamiento se ha modificado respecto al base.
- No hay benchmarks del checkpoint ajustado: el rendimiento real tras el fine-tuning es una incógnita y podría degradarse en tareas fuera del dominio de ajuste.
- Riesgo de alucinación inherente a los modelos de 4B, especialmente en razonamiento complejo y contextos muy largos.
- Sesgos no evaluados: no se han publicado análisis de sesgo para este checkpoint.
- Idiomas: aunque el base declara 201 idiomas, no se especifica si el LoRA ha reducido la cobertura multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la procedencia del dataset de ajuste antes de desplegar en producción.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware modesto sin trabajo adicional de conversión.
- Modelo con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/thanhkt/qwen3.5-4b-lora-r32-e2-final
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
