# VoidOSS/Qwen-2.6-Thinking-1.5B

## Resumen

Qwen 2.6 Thinking 1.5B es un modelo de lenguaje de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones) publicado por VoidOSS, un desarrollador independiente, y construido mediante ajuste fino supervisado sobre el checkpoint base Qwen/Qwen2.5-1.5B de Alibaba Cloud (Qwen Team). El modelo está diseñado para emitir trazas de razonamiento paso a paso dentro de etiquetas `<think>...</think>` antes de proporcionar una respuesta final, siguiendo el paradigma de modelos de razonamiento popularizado por DeepSeek-R1.

El entrenamiento se realizó con QLoRA de 4 bits sobre una única GPU de consumo NVIDIA GeForce RTX 4060 Ti con 8 GB de VRAM, lo que lo convierte en un ejemplo de destilación de razonamiento a muy baja escala. La destilación utiliza 800 trazas de razonamiento en inglés extraídas del dataset a-m-team/AM-DeepSeek-R1-0528-Distilled, complementadas con dos etapas adicionales de ajuste conversacional y corrección anti-alucinación.

Su relevancia radica en ser un experimento reproducible de bajo coste para estudiar cómo se transfieren capacidades de razonamiento desde modelos mayores (DeepSeek-R1) a arquitecturas pequeñas. No obstante, se trata de un modelo con cero descargas y cero likes en el momento de la ficha, orientado a experimentación local y no a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2, derivado de Qwen2.5-1.5B) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-1.5B; el autor no la especifica) |
| Tipos de cuantizacion | Entrenado en QLoRA 4 bits; pesos publicados en BF16 safetensors; cuantizaciones GGUF/AWQ/GPTQ no publicadas por el autor |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B, un transformer decoder-only denso con atención causal estándar y tokenizador BPE propio de la familia Qwen2. El ajuste se realizó con QLoRA de 4 bits (r=16, lora_alpha=32, cómputo en BF16, optimizador paged_adamw_8bit) sobre una RTX 4060 Ti de 8 GB, y los adaptadores se fusionaron de vuelta a pesos BF16. El proceso consta de tres etapas: (1) destilación de razonamiento con 800 trazas en inglés en formato ChatML durante 2 épocas; (2) ajuste de identidad y razonamiento conversacional en primera persona para saludos, identidad y preguntas generales, con alineación del token EOS `<|im_end|>`; y (3) un pulido anti-alucinación centrado en recuento de letras, comparación de decimales, preguntas trampa y expresión honesta de incertidumbre.

No se documenta el número total de tokens de entrenamiento, la composición completa del dataset más allá de las 800 trazas citadas, ni si hubo etapas de RLHF o DPO. La innovación principal es la metodología de bajo coste: destilar razonamiento estilo DeepSeek-R1 en un modelo de 1,5B usando hardware de consumo, con un formato de pensamiento explícito delimitado por etiquetas. El formato de prompt es ChatML (`<|im_start|>user ... <|im_end|>`) y se recomienda detener la generación en `<|im_end|>` y `<|endoftext|>`.

## Capacidades

- Generación de texto conversacional en inglés con formato ChatML.
- Razonamiento paso a paso explícito dentro de etiquetas `<think>...</think>` antes de la respuesta final.
- Razonamiento multi-paso orientado a preguntas de lógica, aritmética sencilla y preguntas trampa (según la etapa 3 de entrenamiento).
- Expresión de incertidumbre y respuestas honestas ante preguntas ambiguas (objetivo declarado de la etapa anti-alucinación).
- Recuento de letras y comparación de decimales como capacidades reforzadas específicamente.
- Mantenimiento de identidad conversacional en primera persona para saludos y preguntas sobre el propio modelo.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso con herramientas externas.
- Multilingüe: limitado a inglés según la model card.
- Sin capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Investigación sobre destilación de razonamiento: sirve como caso de estudio reproducible para analizar cómo se transfieren trazas de DeepSeek-R1 a un modelo de 1,5B con QLoRA en una GPU de 8 GB, permitiendo replicar el pipeline completo.
- Experimentación local en hardware de consumo: al caber en BF16 en GPUs con 8 GB o menos mediante cuantización, es adecuado para prototipos de asistentes conversacionales en portátiles y estaciones de trabajo modestas.
- Evaluación de formatos de pensamiento: útil para comparar la calidad de trazas `<think>` generadas por modelos pequeños frente a modelos mayores, en tareas de lógica y aritmética elemental.
- Docencia y formación: permite ilustrar en clase el funcionamiento interno de un modelo de razonamiento y el efecto de distintas etapas de ajuste (destilación, identidad, anti-alucinación) sobre el comportamiento.
- Pruebas de prompts y plantillas ChatML: sirve para validar pipelines de inferencia que dependen de tokens especiales `<|im_start|>`, `<|im_end|>` y `<|endoftext|>` antes de migrar a modelos mayores de la familia Qwen.
- Generación de respuestas con incertidumbre explícita: en escenarios donde se prefiere que el modelo admita no saber antes que inventar, la etapa anti-alucinación lo hace útil para demostraciones de calibración.
- Benchmarking de destilación a pequeña escala: como línea base para medir cuánto razonamiento se conserva al reducir drásticamente el tamaño del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1 GB en BF16 (1,54 mil millones de parámetros × 2 bytes) más overhead de activaciones y caché KV; en FP16 similar; en cuantización de 8 bits alrededor de 1,6 GB; en 4 bits alrededor de 0,9 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para BF16; RTX 3060, RTX 4060 Ti, RTX 4070 o superiores son suficientes. Para mayor throughput, A100 o H100 no son necesarias dado el tamaño.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090), y en GPUs integradas o Apple Silicon mediante cuantización.
- Opciones de despliegue: transformers con `device_map="auto"` (documentado por el autor); vLLM, llama.cpp, Ollama y TGI son compatibles con arquitecturas Qwen2, aunque el autor no proporciona recetas específicas ni pesos GGUF.
- Latencia y throughput estimados: no disponibles. El tamaño reducido sugiere decodificación de decenas de tokens por segundo en GPUs de consumo, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento explicito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VoidOSS/Qwen-2.6-Thinking-1.5B | 1,54B | no disponible | Si (`<think>`) | apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-1.5B (base) | 1,54B | 32.768 tokens (según model card oficial de Qwen) | No | apache-2.0 | Ampliamente disponible |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,78B | 32.768 tokens (según model card oficial) | Si (`<think>`) | MIT | Ampliamente disponible |
| DeepSeek-R1-Distill-Qwen-7B | 7,62B | 32.768 tokens (según model card oficial) | Si (`<think>`) | MIT | Ampliamente disponible |

La comparación con DeepSeek-R1-Distill-Qwen-1.5B es la más directa: ambos destilan razonamiento de DeepSeek-R1 en la familia Qwen, pero el modelo oficial de DeepSeek usa el checkpoint Qwen2.5-Math-1.5B como base, tiene licencia MIT y está ampliamente validado. El modelo de VoidOSS se apoya en el Qwen2.5-1.5B generalista, emplea solo 800 trazas y no publica benchmarks, por lo que su rendimiento relativo es desconocido.

## Limitaciones y advertencias

- Con 1,5B parámetros se producen errores factuales ocasionales y artefactos de fin de turno; el autor recomienda usar `stop_strings` o `eos_token_id` sobre `<|im_end|>` y `<|endoftext|>` en producción.
- Modelo entrenado únicamente en inglés; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Riesgo de alucinación: aunque la etapa 3 busca mitigarlo, la escala del modelo y el volumen reducido de datos de entrenamiento (800 trazas) limitan la fiabilidad factual.
- Sesgos conocidos: no documentados por el autor; al derivar de Qwen2.5-1.5B, hereda los sesgos del corpus original de Qwen, no evaluados en esta ficha.
- Licencia apache-2.0, que permite uso comercial, pero el modelo base Qwen2.5-1.5B también es apache-2.0, por lo que no hay restricciones adicionales conocidas.
- Cero descargas y cero likes en el momento de la ficha: no hay validación comunitaria ni informes independientes de calidad.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ), por lo que el despliegue en hardware muy limitado requiere cuantizar manualmente.
- La longitud de contexto no está documentada por el autor; se asume la del modelo base, pero no se verifica.
- Orientado a experimentación local, investigación en razonamiento y tareas ligeras de asistente, no a cargas de producción críticas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VoidOSS/Qwen-2.6-Thinking-1.5B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Dataset de destilación: https://huggingface.co/datasets/a-m-team/AM-DeepSeek-R1-0528-Distilled
