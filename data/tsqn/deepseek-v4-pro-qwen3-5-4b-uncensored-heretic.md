# tsqn/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic es una versión "descensurada" (decensored/abliterated) del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B, un fine-tune de razonamiento de Qwen3.5-4B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect. El autor de esta variante es el usuario de Hugging Face tsqn, que ha aplicado la herramienta Heretic v2.0.0 para eliminar los comportamientos de rechazo del modelo original mediante una técnica de ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA).

El modelo base parte de una receta de destilación con aproximadamente 250.000 muestras centradas en matemáticas y STEM, siguiendo el mismo pipeline que la versión de 9B. Con 4.539.265.536 parámetros reales (según safetensors) y un tamaño de repositorio de 9,3 GB, se posiciona en la clase de modelos compactos desplegables en hardware de consumo, manteniendo capacidades de razonamiento estructurado heredadas del profesor.

La relevancia de esta ficha radica en dos aspectos: por un lado, documenta un caso de fine-tune de razonamiento en la clase 4B con foco matemático/STEM; por otro, ilustra el uso de técnicas de ablación para eliminar rechazos, con métricas declaradas de 5/100 rechazos frente a 99/100 del original y una divergencia KL de 0,0378. El modelo se distribuye bajo licencia Apache 2.0 y soporta seis idiomas (en, zh, ko, ja, es, ru).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tag `qwen3_5`) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (tag `gguf`); cuantizaciones concretas no disponibles |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3.5 con 4.539.265.536 parámetros. El modelo base (Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B) se construyó mediante destilación: se generaron respuestas con DeepSeek-V4-Pro en modo Max Effect y se usaron para hacer SFT sobre Qwen3.5-4B. El conjunto de entrenamiento consta de aproximadamente 250.000 muestras centradas en matemáticas y STEM, siguiendo el mismo pipeline que la versión de 9B. Los tags incluyen `distillation`, `sft`, `math`, `stem` y `mtp` (multi-token prediction), lo que sugiere que el entrenamiento incorpora objetivos de predicción multi-token.

Sobre esta base, el autor aplicó Heretic v2.0.0 para producir la variante descensurada. La técnica empleada es Arbitrary-Rank Ablation (ARA) con los siguientes parámetros: `start_layer_index` = 16, `end_layer_index` = 32, `preserve_good_behavior_weight` = 0,9854, `steer_bad_behavior_weight` = 0,0002, `overcorrect_relative_weight` = 0,6587 y `neighbor_count` = 10. Esta ablación actúa sobre las capas 16 a 32 del modelo, preservando en gran medida el comportamiento original mientras se suprime la dirección asociada a los rechazos. No se dispone de información sobre el número total de tokens de entrenamiento ni sobre si hubo fases de RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento multi-paso con descomposición explícita de problemas, heredado de la destilación de DeepSeek-V4-Pro.
- Razonamiento matemático y científico (STEM), con entrenamiento específico sobre ~250.000 muestras de matemáticas y STEM.
- Generación de código (tag `text-generation` y pipeline de generación de texto; no se detalla evaluación específica de código).
- Capacidades multimodales de entrada imagen-texto según el tag `image-text-to-text` del repositorio; no se detalla el alcance exacto de la visión.
- Soporte multilingüe en inglés, chino, coreano, japonés, español y ruso.
- Modo de razonamiento (tag `reasoning`) con patrones de solución estructurados.
- Comportamiento descensurado: reducción drástica de rechazos (5/100 frente a 99/100 del original, según la model card).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible de forma explícita más allá del razonamiento multi-paso.

## Casos de uso

- Tutoría de matemáticas y STEM: el modelo puede resolver problemas paso a paso y explicar la descomposición, aprovechando su entrenamiento sobre ~250.000 muestras matemáticas y científicas. Adecuado para plataformas educativas que necesitan razonamiento explícito en la clase 4B.
- Generación de soluciones técnicas en entornos con recursos limitados: al ser un modelo de 4B con pesos en safetensors y GGUF, puede desplegarse en una sola GPU de consumo para asistentes de resolución de problemas técnicos.
- Investigación sobre alineación y seguridad: la variante descensurada permite estudiar el comportamiento de modelos sin rechazos, comparando con el original (99/100 rechazos) y midiendo la divergencia KL (0,0378) para analizar el coste de la ablación.
- Asistencia multilingüe en seis idiomas: útil para aplicaciones de atención al cliente o documentación técnica en inglés, chino, coreano, japonés, español y ruso, aunque no se especifica la calidad relativa por idioma.
- Prototipado de razonamiento en pipelines de CI/CD: el modelo puede integrarse en flujos de generación de explicaciones técnicas o revisión de cálculos, con la ventaja de su tamaño compacto para despliegues locales.
- Experimentación con destilación: sirve como caso de estudio de cómo transferir capacidades de razonamiento de un profesor grande (DeepSeek-V4-Pro) a un modelo de 4B, útil para investigadores que replican recetas de destilación.
- Evaluación de técnicas de ablación: la configuración ARA documentada (capas 16-32, pesos concretos) permite reproducir y comparar metodologías de eliminación de rechazos en modelos pequeños.

## Benchmarks y rendimiento

La model card solo proporciona métricas de comportamiento tras la ablación, no benchmarks estándar (MMLU, HumanEval, GSM8K, etc.):

| Métrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B) |
|---|---|---|
| Rechazos | 5/100 | 99/100 |
| Divergencia KL | 0,0378 | 0 (por definición) |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 4.539.265.536 parámetros, en FP16 se requieren aproximadamente 9,1 GB solo para pesos; en cuantización de 8 bits, ~4,5 GB; en 4 bits, ~2,3 GB (estimaciones teóricas a partir del número de parámetros, no confirmadas por el autor).
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs de consumo con suficiente VRAM (por ejemplo, RTX 3090/4090 de 24 GB en FP16), pero no se confirma.
- Cabe en GPU de consumo: probablemente sí en cuantizaciones de 8 o 4 bits, aunque no se proporciona confirmación.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag), GGUF (compatible con llama.cpp/Ollama, aunque no se confirma explícitamente). vLLM y TGI no se detallan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| tsqn/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | 4,54B | no disponible | Apache 2.0 | Variante descensurada con ARA; 5/100 rechazos |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B | 4,54B (estimado) | no disponible | Apache 2.0 (según base) | Modelo base destilado; 99/100 rechazos |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | ~9B | no disponible | no disponible | Versión de 9B de la misma receta, citada en la model card |

No se dispone de datos de benchmarks comparativos ni de otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo ha sido sometido a una ablación para eliminar rechazos; esto puede aumentar el riesgo de generar contenido inapropiado, sesgado o dañino en producción.
- La divergencia KL de 0,0378 respecto al original indica que la ablación no es neutra: hay un cambio medible en la distribución de salidas que puede afectar a la calidad en tareas sensibles.
- Riesgo de alucinación inherente a los modelos de 4B destilados; no se han publicado evaluaciones de fidelidad factual.
- Longitud de contexto no documentada; no se puede garantizar el rendimiento en conversaciones de contexto largo.
- Calidad multilingüe desigual potencial: aunque se declaran seis idiomas, no se especifica el volumen de datos por idioma ni evaluaciones por lengua.
- Licencia Apache 2.0 permite uso comercial, pero el comportamiento descensurado puede incumplir políticas de plataformas o normativas sectoriales; se recomienda revisión legal y filtros adicionales.
- El modelo base es un fine-tune destilado de un profesor propietario (DeepSeek-V4-Pro); las condiciones de uso de las salidas del profesor no se detallan.
- No se dispone de información sobre tool calling, agentes o despliegue en producción más allá de los tags del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/tsqn/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B
- Versión de 9B descensurada: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Fine-tune STEM del autor: https://huggingface.co/xtools-at/Qwen3.5-4B-DeepThought-STEM
- Heretic: https://heretic-project.org
