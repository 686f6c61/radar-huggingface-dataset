# trinityomni/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen

Este modelo es un fine-tune multi-etapa de Qwen3.8-27B, publicado por el usuario trinityomni como una versión GGUF del trabajo original de DavidAU. Se presenta como una mejora sobre el modelo base, con un enfoque en reducir drásticamente los tokens de pensamiento (de 1/2 a 1/10) manteniendo la calidad de salida y aumentando la inteligencia en tareas de razonamiento. Según el autor, es el primer fine-tune de este tamaño en superar 730 puntos en ARC-C en 8 bits (735) y 719 en 4 bits, así como 880 en ARC-E, lo que lo coloca en la "zona de inteligencia" de los modelos cerrados. El modelo está diseñado para ejecutarse en hardware de consumo, aprovechando cuantizaciones GGUF y la técnica MTP (Multi-Token Prediction) para acelerar la generación. No se especifican detalles de la arquitectura subyacente ni la longitud de contexto en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo es un fine-tune de Qwen3.8-27B, cuya arquitectura no se detalla) |
| Parametros totales | 26.895.998.464 (≈26,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (variantes regulares y MTP; cuantizaciones no especificadas, se menciona Q4_K_S y 8-bit) |
| Idiomas soportados | inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen3.8-27B, una arquitectura de transformer cuyos detalles específicos no se proporcionan en la información disponible. El entrenamiento utiliza los datasets DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets, y se describe como un proceso multi-etapa que combina técnicas denominadas COLD FUSION (GAIN+UNSLOTH) y Fable Fusion 711. El método GAIN, según el autor, ajusta dinámicamente el entrenamiento por muestra en tiempo real mientras el modelo aprende, lo que permite mejorar métricas sin dañar el modelo. No se especifica el número de tokens de entrenamiento ni si se aplicó RLHF o DPO. La innovación principal es la reducción del tamaño del bloque de pensamiento (thinking tokens) y la integración de MTP para acelerar la generación.

## Capacidades

- Generación de texto y razonamiento: según el autor, supera al modelo base en los 7 benchmarks críticos y reduce los tokens de pensamiento entre un 50% y un 90%.
- Escritura creativa, ficción y roleplay: la model card incluye ejemplos de narración y diálogo, y destaca su capacidad para mantener narrativas inmersivas.
- Generación de código: el nombre incluye "NEO-CODER-MAX" y la etiqueta "coder", lo que sugiere un enfoque en tareas de programación.
- Soporte de tres modos de operación de pensamiento: la model card menciona que las actualizaciones funcionan con los tres modos, pero no los detalla.
- Tool calling: el autor afirma en la model card que la comunidad ha reportado un rendimiento destacado en tool calling, pero no se proporcionan datos concretos.
- Idiomas: inglés y chino, según la metadata.
- Pipeline declarado: image-text-to-text, pero no se documentan capacidades multimodales en la información disponible.

## Casos de uso

- Asistente de escritura creativa: el modelo está afinado para narrativa y ficción, con capacidad para generar diálogos y tramas con menos tokens de pensamiento, lo que agiliza la escritura asistida por IA.
- Roleplay y juegos de texto: su capacidad para mantener personajes y tonos narrativos lo hace adecuado para aplicaciones de rol, tanto en entornos locales como en servidores.
- Generación de código: aunque no se aportan benchmarks de HumanEval, el modelo incluye etiquetas "coder" y "NEO-CODER-MAX", por lo que puede asistir en tareas de programación en inglés y chino.
- Razonamiento y resolución de problemas: la reducción de tokens de pensamiento (entre 1/2 y 1/10) permite obtener respuestas más rápidas en tareas de lógica y matemáticas, según el autor.
- Despliegue local en hardware de consumo: gracias a las cuantizaciones GGUF, puede ejecutarse con motores como llama.cpp u Ollama en equipos con GPU de gama media, sin depender de servidores cloud.
- Investigación en técnicas de fine-tuning: el modelo es un ejemplo práctico de los métodos COLD FUSION y Fable Fusion 711, útil para estudiar cómo reducir el coste de tokens de razonamiento manteniendo el rendimiento.

## Benchmarks y rendimiento

La model card proporciona datos de ARC-C y ARC-E, pero no incluye resultados de benchmarks estándar como MMLU, HumanEval o GSM8K.

| Benchmark | Valor (8-bit) | Valor (4-bit) |
|---|---|---|
| ARC-C | 735 | 719 |
| ARC-E | 880 | no disponible |

El autor afirma que el modelo supera a Qwen3.6-35B-A3B, Qwen 3.6 27B y Qwen 3.5 27B en los 7 benchmarks críticos, pero no se incluyen cifras detalladas. No se han publicado resultados de otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: estimación orientativa de ~16-18 GB para cuantización Q4_K_S y ~30 GB para Q8_0, sin incluir overhead de contexto. No hay datos oficiales.
- GPU recomendadas: no especificado; el autor indica que el modelo está construido para hardware de consumo.
- Puede ejecutarse en GPUs de consumo con 16-24 GB de VRAM en cuantización 4-bit, aunque no hay confirmación oficial.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros motores compatibles con GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparación completa. El autor afirma que el modelo supera a Qwen3.6-35B-A3B, Qwen 3.6 27B y Qwen 3.5 27B en los 7 benchmarks críticos, pero no se proporcionan cifras detalladas. No se conocen los parámetros, contexto ni licencias de estos modelos comparables en la información disponible.

## Limitaciones y advertencias

- El modelo está etiquetado como "uncensored", "heretic" y "abliterated", lo que puede implicar que se han eliminado restricciones de seguridad y que puede generar contenido no deseado, ofensivo o peligroso.
- No se proporcionan evaluaciones de seguridad, sesgos o alineación.
- La reducción de tokens de pensamiento puede afectar la profundidad del razonamiento en tareas complejas, aunque el autor afirma lo contrario.
- El pipeline "image-text-to-text" no está respaldado por documentación; no se debe asumir capacidades multimodales sin verificación.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un modelo nuevo y poco validado por la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede ser problemático.

## Enlaces

- Repositorio del modelo: https://huggingface.co/trinityomni/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base (DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Modelo anterior con la técnica Fable Fusion 711: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
