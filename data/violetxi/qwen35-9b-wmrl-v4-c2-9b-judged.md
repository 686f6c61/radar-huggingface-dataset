# violetxi/qwen35-9b-wmrl-v4-c2-9b-judged

## Resumen

El modelo `violetxi/qwen35-9b-wmrl-v4-c2-9b-judged` es un checkpoint de la línea de investigación "wm-internalization v4" (world-model internalization), desarrollado por el usuario violetxi. Se trata de un fine-tune completo del modelo base Qwen/Qwen3.5-9B, entrenado sobre el corpus sintético de bufete de abogados "Calderwood & Harkness". El objetivo del estudio es explorar cómo un modelo de 9B parámetros internaliza un dominio específico (en este caso, el legal) a partir de un pool de semillas de razonamiento de aproximadamente 50.000 ejemplos.

El modelo hereda la arquitectura híbrida del base Qwen3.5-9B, que combina Gated Delta Networks y Gated Attention en un patrón 8×(3×DeltaNet→FFN→1×Attention→FFN), con un contexto de 262.000 tokens y soporte multimodal (vision encoder). El checkpoint se ha "injertado" de nuevo en la disposición compuesta del hub (Qwen3_5ForConditionalGeneration), lo que permite servirlo directamente con vLLM. Con 9.653 millones de parámetros, es un modelo denso de tamaño medio, adecuado para entornos con una GPU de 24 GB.

Este modelo es relevante para la comunidad de investigación en adaptación de dominio y alineación de modelos, ya que documenta un experimento controlado de fine-tuning sobre un corpus sintético especializado. No está pensado como un producto de producción, sino como un artefacto de estudio reproducible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated Delta Networks + Gated Attention (patrón 8×(3×DeltaNet→FFN→1×Attention→FFN)) con vision encoder |
| Parametros totales | 9.653.104.368 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.000 tokens (heredada del base Qwen3.5-9B) |
| Tipos de cuantizacion | No disponible (el repo contiene safetensors en precisión completa; no se documentan cuantizaciones) |
| Idiomas soportados | No disponible (el base Qwen3.5-9B es multilingüe, pero no se especifica para este fine-tune) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 38,6 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B, lanzado por Alibaba Cloud en febrero de 2026, emplea una arquitectura híbrida que intercala bloques de Gated Delta Networks (una variante de atención lineal con compuertas) y Gated Attention clásica, siguiendo el patrón 8×(3×DeltaNet→FFN→1×Attention→FFN). Esta combinación busca un equilibrio entre eficiencia computacional y capacidad de modelado de dependencias de largo alcance. El modelo incluye además un codificador de visión, lo que lo convierte en multimodal, y soporta Multi-Token Prediction (MTP) para acelerar la decodificación.

El fine-tune realizado por violetxi es un ajuste completo (full-finetune) de todos los parámetros del modelo base sobre el corpus sintético "Calderwood & Harkness", un conjunto de datos que simula documentos y escenarios de un bufete de abogados. Según la model card, el entrenamiento forma parte de la línea v4 del estudio de internalización de mundo, con un pool de semillas de razonamiento de ~50k ejemplos. No se especifican detalles sobre el método de alineación (RLHF, DPO, etc.) ni la composición exacta del dataset. El checkpoint se guardó como "final" y se injertó en la estructura del hub para ser servible con vLLM.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del base Qwen3.5-9B, incluyendo razonamiento multi-step y generación de respuestas largas.
- Soporte multimodal: al mantener el vision encoder del base, el modelo puede procesar entradas de imagen junto con texto (aunque no hay documentación específica de este fine-tune al respecto).
- Tool calling y function calling: el base Qwen3.5-9B soporta estas capacidades; el fine-tune no las elimina, pero no se ha verificado su funcionamiento tras el ajuste.
- Capacidades multilingües: el base es multilingüe, pero el corpus de entrenamiento es en inglés (presumiblemente), por lo que el rendimiento en otros idiomas puede verse afectado.
- Especialización en dominio legal: el fine-tune está orientado a tareas relacionadas con el ámbito jurídico (contratos, memorandos, análisis de casos) gracias al corpus sintético.

## Casos de uso

- Investigación en adaptación de dominio: el modelo sirve como referencia para estudiar cómo un fine-tune sobre un corpus sintético especializado modifica las representaciones internas de un modelo generalista. Se puede comparar con el base para medir el grado de "internalización" del dominio legal.
- Análisis de documentos legales sintéticos: dado su entrenamiento en el corpus Calderwood & Harkness, el modelo puede generar resúmenes, extraer cláusulas o responder preguntas sobre contratos y memorandos legales simulados.
- Evaluación de robustez tras fine-tuning: al ser un checkpoint de investigación, permite analizar si el ajuste degrada capacidades generales (razonamiento, código, matemáticas) en comparación con el base.
- Pruebas de servido con vLLM: al estar injertado en la estructura Qwen3_5ForConditionalGeneration, se puede desplegar fácilmente en entornos vLLM para medir latencia y throughput en tareas de generación larga.
- Benchmark de alucinación en dominios especializados: el corpus sintético permite diseñar experimentos controlados para medir la tendencia del modelo a inventar información legal.
- Estudio de transferencia de conocimiento: comparar este checkpoint con otros de la misma línea (c1-b5v4, lrsmoke-1e5) para entender el efecto de diferentes condiciones de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este checkpoint. Tampoco se documentan métricas específicas del dominio legal. Se recomienda a los interesados ejecutar sus propias evaluaciones comparando con el modelo base Qwen3.5-9B.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 9,65B parámetros. En precisión fp16/bf16, ocupa aproximadamente 19,3 GB solo de pesos, más overhead de activaciones y KV cache. Con contexto largo (262K), la memoria de activaciones puede superar los 24 GB. Se recomienda al menos 24 GB de VRAM para inferencia básica, y más para contexto completo.
- GPU recomendadas: RTX 4090 (24 GB) para pruebas con contexto moderado; A100 40 GB o 80 GB para contexto completo; H100 para producción con alta concurrencia.
- En consumer GPU: cabe en una RTX 4090 o RTX 3090 (24 GB) con cuantización (por ejemplo, 8 bits o 4 bits), aunque no se proporcionan cuantizaciones oficiales. Con GGUF se podría ejecutar en GPUs de 16 GB, pero no hay archivos GGUF en el repo.
- Opciones de despliegue: vLLM (soportado según la model card), Hugging Face Transformers, TGI, llama.cpp (si se convierten los pesos a GGUF).
- Latencia y throughput: no disponible. Dependerá del hardware y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| violetxi/qwen35-9b-wmrl-v4-c2-9b-judged | 9,65B | 262K | Híbrida (DeltaNet + Attention) + visión | Apache-2.0 | HuggingFace |
| Qwen/Qwen3.5-9B (base) | 9,65B | 262K | Híbrida (DeltaNet + Attention) + visión | Apache-2.0 | HuggingFace |
| violetxi/qwen35-9b-wmrl-v4-c1-b5v4 | 9,65B | 262K | Híbrida (misma base) | Apache-2.0 | HuggingFace |
| violetxi/qwen35-9b-wmrl-v4-lrsmoke-1e5 | 9,65B | 262K | Híbrida (misma base) | Apache-2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo. Los tres checkpoints de violetxi comparten la misma base y solo difieren en las condiciones de entrenamiento (c2-9b-judged, c1-b5v4, lrsmoke-1e5), lo que los hace útiles para estudios ablativos.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado para uso en producción. No hay garantías de calidad, seguridad o fiabilidad.
- Datos de entrenamiento sintéticos: el corpus Calderwood & Harkness es generado artificialmente, por lo que el modelo puede no generalizar a documentos legales reales y podría reflejar sesgos del proceso de generación sintética.
- Riesgo de alucinación: al ser un fine-tune sobre un dominio específico, puede inventar citas legales, cláusulas o precedentes con alta fluidez. No debe usarse para asesoramiento legal real.
- Degradación de capacidades generales: el fine-tuning completo puede afectar el rendimiento en tareas fuera del dominio legal (código, matemáticas, razonamiento general). No hay benchmarks que lo confirmen.
- Contexto largo: aunque el base soporta 262K tokens, no se ha verificado que el fine-tune mantenga la misma calidad de atención en contextos extremadamente largos.
- Idiomas: el corpus de entrenamiento es presumiblemente en inglés; el rendimiento en español u otros idiomas puede ser inferior al del base.
- Sin cuantizaciones oficiales: el repo solo contiene safetensors en precisión completa; los usuarios deben generar sus propias cuantizaciones si necesitan reducir requisitos de hardware.
- Sin comunidad ni soporte: el modelo tiene 0 descargas y 0 likes; no hay issues ni documentación adicional más allá de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-c2-9b-judged
- Checkpoint hermano c1-b5v4: https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-c1-b5v4
- Checkpoint hermano lrsmoke-1e5: https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-lrsmoke-1e5
- Ficha de Qwen3.5-9B en vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.5-9B
- Especificaciones y requisitos de VRAM de Qwen3.5-9B: https://apxml.com/models/qwen35-9b
