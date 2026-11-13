# vince1895/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic es una versión "descensurada" del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B, un fine-tune de razonamiento de Qwen3.5-4B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect. El autor de esta variante es vince1895, que ha aplicado la herramienta Heretic v2.0.0 para eliminar el comportamiento de rechazo del modelo base mediante una técnica de ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA).

El modelo conserva la receta de entrenamiento del release de 9B: aproximadamente 250.000 muestras centradas en matemáticas y STEM, con un enfoque explícito en razonamiento estructurado y descomposición de problemas en varios pasos. Con 4.539.265.536 parámetros totales y un tamaño de repositorio de 9,3 GB, se sitúa en la clase de 4B, lo que lo hace desplegable en hardware de consumo.

La relevancia de esta ficha radica en dos aspectos: por un lado, documenta una técnica de "abliteración" aplicada sobre un modelo de razonamiento compacto; por otro, advierte de que el resultado es un modelo sin salvaguardas de rechazo, con implicaciones claras para su uso en producción. La licencia Apache 2.0 permite uso comercial, pero la ausencia de filtros de seguridad debe tenerse en cuenta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), fine-tune de razonamiento con destilación |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo incluye safetensors; los tags mencionan GGUF pero no se detallan los tipos) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); se menciona GGUF en los tags |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Qwen3.5-4B orientado a razonamiento, destilado a partir de respuestas de DeepSeek-V4-Pro en modo Max Effect. El pipeline de entrenamiento sigue la misma receta que el release de 9B, con una mezcla de aproximadamente 250.000 muestras de matemáticas y STEM. El objetivo es que el modelo pequeño aprenda patrones de solución multi-paso y descomposición explícita de problemas a partir de un profesor más capaz.

La variante aquí documentada aplica Heretic v2.0.0, una herramienta de "decensurado" que utiliza Arbitrary-Rank Ablation (ARA). Los parámetros reportados son: start_layer_index 16, end_layer_index 32, preserve_good_behavior_weight 0.9854, steer_bad_behavior_weight 0.0002, overcorrect_relative_weight 0.6587 y neighbor_count 10. Según la model card, el resultado reduce los rechazos de 99/100 a 5/100 con una divergencia KL de 0.0378 respecto al modelo original. No se dispone de información sobre el número total de tokens de entrenamiento ni sobre el uso de RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento multi-paso, con énfasis en matemáticas y STEM.
- Razonamiento estructurado y descomposición explícita de problemas, aprendido por destilación.
- Capacidades multimodales de entrada image-text-to-text según los tags del repositorio (no confirmado en la model card).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: el modelo está entrenado para razonamiento multi-paso, pero no se documenta soporte explícito de agentes.
- Capacidades multilingües: inglés, chino, coreano, japonés, español y ruso.
- Modo thinking: no disponible en la información proporcionada.
- Comportamiento sin rechazos: 5/100 rechazos según la evaluación del autor, frente a 99/100 del modelo original.

## Casos de uso

- Tutoría de matemáticas y ciencias: el modelo puede descomponer problemas de cálculo, álgebra o física en pasos explícitos, aprovechando su entrenamiento en aproximadamente 250.000 muestras STEM. Adecuado para entornos educativos donde se requiere explicación del razonamiento.
- Generación de soluciones paso a paso para investigación: útil para prototipar cadenas de razonamiento en dominios científicos, con la ventaja de ser un modelo de 4B desplegable en una sola GPU.
- Asistente de código con explicación: aunque no se documenta tool calling, el modelo puede generar explicaciones de algoritmos y fragmentos de código en el contexto de tareas STEM, integrándose en editores o notebooks.
- Procesamiento multilingüe de documentación técnica: con soporte para seis idiomas, puede resumir o traducir documentación científica entre inglés, chino, coreano, japonés, español y ruso.
- Investigación sobre alineación y seguridad: al ser una variante "abliterated", sirve como objeto de estudio para analizar cómo la ablación de direcciones de rechazo afecta al comportamiento del modelo y a su divergencia KL (0.0378).
- Despliegue en entornos con recursos limitados: con 4,5B parámetros y pesos safetensors de 9,3 GB, puede ejecutarse en GPUs de consumo para tareas de razonamiento sin dependencia de API externas.
- Generación de contenido sin filtros en entornos controlados: para pruebas de robustez o generación creativa donde se requiere ausencia de rechazos, siempre con revisión humana posterior.

## Benchmarks y rendimiento

| Métrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B) |
|---|---|---|
| Rechazos | 5/100 | 99/100 |
| Divergencia KL | 0.0378 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 4,5B en fp16 requiere aproximadamente 9 GB de VRAM; en cuantización de 8 bits, unos 4,5-5 GB; en 4 bits, unos 2,5-3 GB. Estas cifras son estimaciones generales, no datos del autor.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría en RTX 3090, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, previsiblemente en GPUs con 8 GB o más de VRAM en cuantización de 8 bits o inferior, aunque no se confirma oficialmente.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag), llama.cpp/Ollama si se dispone de GGUF (mencionado en tags pero no detallado), vLLM no confirmado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | 4,54B | no disponible | Apache 2.0 | Variante sin rechazos (5/100) |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B | 4B (clase) | no disponible | no disponible | Modelo base, 99/100 rechazos |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | 9B (clase) | no disponible | no disponible | Versión de 9B del mismo pipeline |
| xtools-at/Qwen3.5-4B-DeepThought-STEM | 4B (clase) | no disponible | no disponible | Fine-tune científico basado en este modelo |

No se dispone de datos de rendimiento comparativo en benchmarks estándar para estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Ausencia de salvaguardas: el modelo ha sido "abliterated" para reducir rechazos de 99/100 a 5/100. Esto implica que puede generar contenido que el modelo original rechazaría, con riesgos para uso en producción sin filtros adicionales.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad factual; como modelo destilado de 4B, es probable que alucine en tareas de conocimiento amplio.
- Sesgos conocidos: no disponible en la información proporcionada.
- Limitaciones de contexto e idioma: la longitud de contexto no se documenta; los idiomas soportados son seis, sin garantía de calidad uniforme.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la ausencia de filtros de seguridad puede incumplir políticas de plataformas o normativas sectoriales.
- Divergencia respecto al original: la KL de 0.0378 indica un cambio medible en la distribución de salida; puede afectar a la coherencia en tareas sensibles.
- Caveat para producción: se recomienda evaluar el modelo en el dominio concreto antes de desplegarlo, e incorporar capas de moderación externas si el caso de uso lo requiere.

## Enlaces

- [Hugging Face: vince1895/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic](https://huggingface.co/vince1895/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic)
- [Modelo base: Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B](https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B)
- [Versión 9B: xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic](https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic)
- [DeepThought STEM: xtools-at/Qwen3.5-4B-DeepThought-STEM](https://huggingface.co/xtools-at/Qwen3.5-4B-DeepThought-STEM)
- [Heretic project](https://heretic-project.org)
