# XaviersAI23/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es una versión "decensored" del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, un ajuste fino de Qwen3.5-9B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect. El modelo resultante, publicado por el usuario XaviersAI23, aplica la herramienta Heretic v2.0.0.dev0 para eliminar los mecanismos de rechazo del modelo original mediante una técnica de ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA).

El objetivo declarado es preservar las capacidades de razonamiento matemático y STEM del modelo base (entrenado con aproximadamente 250.000 muestras centradas en matemáticas y ciencia) mientras se suprime el comportamiento de negativa ante peticiones que el modelo original rechazaría. Según la model card, el modelo pasa de 100/100 rechazos en el original a 3/100 en esta versión, con una divergencia KL de 0,0422 respecto al base.

Con 9.409.813.744 parámetros totales y un repositorio de 19,3 GB en safetensors, se posiciona como un modelo compacto de la clase 9B orientado a razonamiento estructurado, uso de herramientas y function calling, con soporte declarado para seis idiomas (inglés, chino, coreano, japonés, español y ruso) y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en precisión completa; se menciona evaluación con NVFP4 y MTP) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino de Qwen3.5-9B destilado de DeepSeek-V4-Pro en modo Max Effect, con un conjunto de datos de aproximadamente 250.000 muestras centradas en matemáticas y razonamiento científico (STEM). La model card menciona etapas de SFT, RL y GSPO (Group Sequence Policy Optimization) en las etiquetas, así como soporte de MTP (Multi-Token Prediction) y evaluación con NVFP4. No se especifica el número total de tokens de entrenamiento ni la composición detallada del dataset más allá del foco matemático-STEM.

La innovación principal de esta variante concreta es la aplicación de Heretic v2.0.0.dev0 mediante Arbitrary-Rank Ablation (ARA), con parámetros documentados: `start_layer_index` 9, `end_layer_index` 24, `preserve_good_behavior_weight` 0,8264, `steer_bad_behavior_weight` 0,0003, `overcorrect_relative_weight` 0,9645 y `neighbor_count` 12. Esta técnica modifica los pesos en un rango de capas para suprimir el comportamiento de rechazo, manteniendo una divergencia KL baja (0,0422) respecto al modelo original. No se detalla la arquitectura interna del transformer más allá de la familia Qwen3.5.

## Capacidades

- Generación de texto y razonamiento estructurado con descomposición de problemas en varios pasos, aprendido por destilación de DeepSeek-V4-Pro.
- Razonamiento matemático y STEM reforzado mediante SFT sobre aproximadamente 250.000 muestras.
- Soporte de tool calling y function calling (etiquetas `tool-use`, `function-calling`).
- Capacidades multimodales de entrada: la etiqueta `image-text-to-text` sugiere entrada de imagen y texto, aunque no se detalla el alcance.
- Soporte multilingüe en inglés, chino, coreano, japonés, español y ruso.
- Modo de razonamiento (tag `reasoning`), con patrones de solución multi-paso.
- Comportamiento "decensored": supresión de rechazos (3/100 según la model card) manteniendo baja divergencia respecto al base.
- Transferencia cruzada: la model card indica pequeñas mejoras en programación y uso de herramientas pese a no recibir SFT específico de código.

## Casos de uso

- Resolución de problemas matemáticos y científicos: el modelo está entrenado específicamente sobre unas 250.000 muestras de matemáticas y STEM, por lo que es adecuado para tutoría automatizada, generación de ejercicios resueltos y verificación de derivaciones paso a paso.
- Asistente de razonamiento en pipelines de agentes: gracias a sus capacidades de tool calling y function calling, puede integrarse en flujos multi-paso donde el modelo decide qué herramienta invocar (calculadora, buscador, API) y compone la respuesta final.
- Generación de código asistida: aunque no recibió SFT específico de código, la model card reporta mejoras cruzadas en programación; puede usarse para autocompletado, explicación de fragmentos y refactorización en entornos de desarrollo.
- Atención al cliente y conversación multi-turno: con soporte para seis idiomas y comportamiento conversacional, puede gestionar diálogos en inglés, español, chino, coreano, japonés y ruso; la longitud de contexto no está documentada, por lo que debe validarse empíricamente.
- Investigación sobre alineación y seguridad: al ser una variante "abliterated" con métricas de rechazo y divergencia KL documentadas, sirve como caso de estudio para analizar el efecto de la ablación de rangos arbitrarios sobre el comportamiento del modelo.
- Procesamiento de documentos con imagen y texto: la etiqueta `image-text-to-text` permite experimentar con tareas que combinen captura visual y razonamiento textual, como interpretación de diagramas científicos o tablas.
- Despliegue en entornos con recursos limitados: con 9,4B parámetros y licencia Apache 2.0, es viable en una sola GPU de gama alta o en configuraciones cuantizadas para prototipos y pruebas.

## Benchmarks y rendimiento

La model card solo reporta métricas de comportamiento tras la ablación, no benchmarks estándar de razonamiento:

| Metrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) |
|---|---|---|
| Rechazos (sobre 100) | 3/100 | 100/100 |
| Divergencia KL | 0,0422 | 0 (por definición) |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 18,8 GB solo para pesos (9,41B × 2 bytes), más overhead de activaciones y KV cache; se recomienda al menos 24 GB.
- Cuantización a 8 bits: alrededor de 9,4 GB de pesos; a 4 bits: alrededor de 4,7 GB, aunque no se declaran ficheros GGUF en el repositorio.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para fp16; RTX 3090/4090 o GPUs con 16 GB para cuantización a 8 bits.
- Cabe en GPU de consumo (RTX 4090, 3090) en fp16 ajustado o cuantizado; en 4 bits podría ejecutarse en GPUs de 8-12 GB.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), vLLM y llama.cpp/Ollama si se generan cuantizaciones GGUF (no incluidas en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic) | 9,41B | no disponible | Apache 2.0 | Variante decensored con ARA; 3/100 rechazos; KL 0,0422 |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | 9,41B (presumiblemente) | no disponible | no disponible | Modelo base alineado; 100/100 rechazos |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | ~4B | no disponible | no disponible | Versión 4B de la misma familia decensored |
| xtools-at/Qwen3.5-9B-DeepThought-STEM | ~9B | no disponible | no disponible | Ajuste fino científico basado en este modelo |

## Limitaciones y advertencias

- La eliminación de rechazos (3/100) implica que el modelo puede generar contenido dañino, sesgado o inapropiado sin filtros; no es apto para despliegues públicos sin moderación adicional.
- Riesgo de alucinación inherente a los modelos de 9B destilados; la destilación de un profesor mayor no garantiza fidelidad factual.
- La longitud de contexto no está documentada, lo que impide planificar cargas de trabajo con ventanas largas sin validación previa.
- La model card no detalla sesgos conocidos ni la composición lingüística del dataset; el soporte de seis idiomas puede ser desigual.
- Licencia Apache 2.0 permite uso comercial, pero el comportamiento decensored puede contravenir políticas de plataformas o normativa sectorial; la responsabilidad recae en el desplegador.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-16; no hay evidencia de validación independiente.
- No se incluyen cuantizaciones GGUF ni ficheros listos para llama.cpp/Ollama; el despliegue en consumer requiere conversión manual.
- La evaluación con NVFP4 y MTP se menciona pero no se aportan resultados numéricos.

## Enlaces

- Hugging Face: https://huggingface.co/XaviersAI23/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Versión 4B: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Ajuste fino científico derivado: https://huggingface.co/xtools-at/Qwen3.5-9B-DeepThought-STEM
- Heretic: https://heretic-project.org
