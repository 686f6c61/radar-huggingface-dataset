# symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V10-dequantized-oQ4e-mtp

## Resumen

El modelo `symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V10-dequantized-oQ4e-mtp` es una cuantización de 4 bits realizada con la herramienta oQ (oMLX v0.6.3) sobre un modelo base de tipo `qwen3_5_moe`. El nombre sugiere que se parte de un modelo Qwen3.6-35B-A3B (arquitectura de mezcla de expertos con 35 mil millones de parámetros totales y 3 mil millones activos) que ha sido sometido a un ajuste fino denominado "Uncensored-Genesis-Hermes", probablemente orientado a eliminar restricciones de seguridad y a mejorar el seguimiento de instrucciones. El autor, symrex, publica esta versión cuantizada en formato MLX safetensors, pensada para su ejecución en hardware Apple Silicon mediante la librería MLX.

La relevancia de este modelo radica en su tamaño reducido (el repositorio ocupa 21,6 GB) y su cuantización de 4 bits, que permite ejecutarlo en equipos de consumo con suficiente memoria unificada. Sin embargo, la información pública disponible es muy limitada: no se especifican licencia, idiomas, contexto ni detalles de entrenamiento. Los datos de rendimiento de inferencia encontrados en la web (para la versión V7, muy similar) indican una velocidad de 1.341 tokens por segundo en prefill y 87,8 tokens por segundo en generación en un Apple M4 Max con 128 GB de RAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (mezcla de expertos) |
| Parametros totales | 6.190.629.808 (según safetensors); el nombre sugiere 35B, discrepancia no resuelta |
| Parametros activos | 3B (según el nombre, no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64, formato oQ (oMLX) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

La arquitectura es de tipo `qwen3_5_moe`, es decir, un transformer basado en mezcla de expertos (MoE) de la familia Qwen3.6. El nombre del modelo indica que el checkpoint base tiene 35 mil millones de parámetros totales y 3 mil millones activos por token, aunque el archivo safetensors reporta solo 6,19 mil millones de parámetros, lo que sugiere que podría tratarse de una versión reducida o que la cuantización afecta al conteo. No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. El sufijo "Uncensored-Genesis-Hermes" apunta a un ajuste fino orientado a eliminar filtros de seguridad y a mejorar la adherencia a instrucciones, probablemente basado en el estilo Hermes de Nous Research, pero no hay documentación que lo confirme.

La cuantización se realizó con la herramienta oQ (oMLX v0.6.3) en modo de precisión mixta, con 4 bits y grupo de tamaño 64. El formato de salida es MLX safetensors, optimizado para la librería MLX de Apple.

## Capacidades

No se dispone de información detallada sobre las capacidades específicas de este modelo. Por el nombre y la arquitectura, se puede inferir que es un modelo de lenguaje generativo con capacidades de instrucción y razonamiento, pero no hay datos confirmados sobre:

- Generación de texto, razonamiento, código o matemáticas: no disponible
- Soporte de tool calling / function calling: no disponible
- Soporte de agentes y multi-step reasoning: no disponible
- Capacidades multilingües: no disponible
- Capacidades especiales (vision, audio, thinking mode): no disponible

El término "Uncensored" sugiere que el modelo no aplica filtros de seguridad estándar, lo que podría permitir generar contenido que otros modelos rechazarían, pero esto no está verificado.

## Casos de uso

Dada la falta de información oficial, los casos de uso son especulativos y deben tomarse con cautela:

- Ejecución local en Apple Silicon: gracias a su formato MLX y cuantización de 4 bits, el modelo puede ejecutarse en Macs con suficiente memoria unificada (por ejemplo, M4 Max con 128 GB) para tareas de generación de texto de baja latencia.
- Experimentación con modelos sin censura: investigadores interesados en estudiar el comportamiento de modelos sin filtros de seguridad podrían utilizarlo como base, aunque se desconoce el alcance real de la "uncensored".
- Prototipado de aplicaciones de chat: si el ajuste fino Hermes funciona como se espera, podría usarse para construir asistentes conversacionales, pero sin datos de calidad no se puede garantizar.
- Fine-tuning adicional: al ser un checkpoint cuantizado, podría servir como punto de partida para ajustes posteriores, aunque la cuantización limita la calidad del entrenamiento.
- Benchmarking de rendimiento de inferencia: los datos de throughput (1.341 PP tok/s, 87,8 TG tok/s en M4 Max) lo hacen útil para evaluar el rendimiento de MLX en hardware Apple.
- Uso educativo: para aprender sobre cuantización MoE y despliegue local, aunque la falta de documentación lo hace menos recomendable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento encontrados corresponden a la versión V7 del mismo modelo, medida en un Apple M4 Max (40 núcleos, 128 GB):

| Metrica | Valor |
|---|---|
| Prefill (PP) | 1.341 tokens/s |
| Generación (TG) | 87,8 tokens/s |

Estos datos son de throughput de inferencia, no de calidad del modelo. No hay comparación con otros modelos.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 21,6 GB, por lo que se necesitan al menos 24 GB de memoria disponible (unificada o VRAM) para cargar los pesos. Con overhead de inferencia, se recomiendan 32 GB o más.
- GPU recomendadas: al ser formato MLX, está optimizado para Apple Silicon (M-series). En GPUs NVIDIA, se necesitaría convertir a otro formato (por ejemplo, GGUF) y no hay garantía de funcionamiento.
- Consumer GPU: podría caber en una RTX 4090 (24 GB) si se convierte a un formato compatible, pero no es el objetivo del autor.
- Opciones de despliegue: MLX (Apple), posiblemente conversión a GGUF para llama.cpp u Ollama, aunque no se proporciona.
- Latencia y throughput: en M4 Max (128 GB), se midieron 1.341 tokens/s en prefill y 87,8 tokens/s en generación para la versión V7. No hay datos para otras configuraciones.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo base Qwen3.6-35B-A3B no está documentado en las fuentes consultadas, y no se conocen alternativas directas con el mismo ajuste "Uncensored-Genesis-Hermes". Se puede mencionar que existen versiones GGUF del mismo modelo (V6) con 20,7 GB y 287.745 descargas, pero no hay datos de rendimiento comparables.

## Limitaciones y advertencias

- Sesgos conocidos: no hay información, pero al ser un modelo "uncensored" es probable que presente sesgos no mitigados y pueda generar contenido ofensivo, ilegal o peligroso.
- Riesgo de alucinación: no evaluado; la cuantización de 4 bits puede aumentar la tasa de errores y alucinaciones.
- Limitaciones de contexto e idioma: desconocidas; no se especifica la longitud de contexto ni los idiomas soportados.
- Restricciones de licencia: la licencia no está indicada, lo que impide su uso comercial sin autorización explícita del autor.
- Caveat de producción: al ser un modelo cuantizado y sin documentación, no es recomendable para entornos de producción sin una evaluación exhaustiva previa.
- Discrepancia de parámetros: el nombre indica 35B totales, pero el safetensors reporta 6,19B; esto puede deberse a un error o a una versión reducida, y debe verificarse antes de usarlo.

## Enlaces

- HuggingFace: https://huggingface.co/symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V10-dequantized-oQ4e-mtp
- Versión V6 (GGUF): https://local-ai-zone.github.io/models/qwen3-6-35b-a3b-uncensored-genesis-hermes-v6.html
- Guía de uso (en inglés): https://cldnavi.com/en/blog/qwen36-35b-genesis-hermes-guide-2026/
- Benchmark de rendimiento (V7): https://omlx.ai/benchmarks/performance/qr6xtbwz
- Repositorio de oQ: https://github.com/jundot/omlx
