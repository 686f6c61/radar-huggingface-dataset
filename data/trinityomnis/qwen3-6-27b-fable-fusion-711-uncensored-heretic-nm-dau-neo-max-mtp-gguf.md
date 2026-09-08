# trinityomnis/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF

## Resumen

El modelo `trinityomnis/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF` es un fine tune de Qwen3.6-27B, desarrollado por trinityomnis en colaboración con otros autores (Nightmedia, TeichAI, armand0e, trohrbaugh). Se presenta como un modelo de uso general, con un enfoque en mejorar la inteligencia general, la resolución de problemas y el seguimiento de instrucciones, sin alterar las capacidades del modelo base. El proceso de entrenamiento es multi-stage: combina varios fine tunes, merges y datasets, incluyendo trazas de razonamiento ("Fable"), datos de Claude Opus y GPT-5, y datasets propietarios como DavidAU/Polar-STRICT y DavidAU/F451-STRICT.

El modelo es un transformer denso de aproximadamente 26.900 millones de parámetros (26.895.998.464), con soporte de visión (pipeline image-text-to-text) y capacidades multilingües en inglés y chino. Se distribuye en formato GGUF, con cuantizaciones regulares y MTP (multi-token prediction), todas optimizadas con NEO IMATRIX. El autor afirma que es el primer fine tune de este tamaño en superar el umbral de 700 en ARC-C tanto en cuantización de 8 bits como de 4 bits, pero no se proporcionan datos numéricos de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.6-27B) |
| Parametros totales | 26.895.998.464 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF regular y MTP, NEO IMATRIX, 8-bit, 4-bit, bfloat16 (pesos originales) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con safetensors del modelo base) |

## Arquitectura y entrenamiento

El modelo parte de `DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP`, un fine tune de Qwen3.6-27B. El entrenamiento es multi-stage: se realizaron varios fine tunes y merges en fases sucesivas, con evaluaciones en cada etapa para garantizar la calidad. Los datasets utilizados incluyen `DavidAU/Polar-STRICT-Datasets` y `DavidAU/F451-STRICT-Datasets`, junto con trazas "Fable" y datos de razonamiento de Claude Opus y GPT-5. No se especifica si se aplicó RLHF o DPO; la información indica que el objetivo era mejorar el seguimiento de instrucciones y la resolución de problemas sin dañar el modelo base.

Técnicamente, los GGUFs incorporan varias innovaciones: cuantización NEO IMATRIX (que el autor afirma mejora la precisión un 2-4% frente a GGUFs convencionales), tensor de salida a precisión completa (16 bits) en todas las cuantizaciones, y soporte de predicción multi-token (MTP) en las variantes "MTP". Además, el modelo es "abliterated" y "heretic uncensored", lo que implica la eliminación de mecanismos de rechazo y una menor censura en las respuestas.

## Capacidades

- Generación de texto con razonamiento y modo "thinking" (pensamiento extendido).
- Soporte de visión (image-text-to-text), lo que permite analizar imágenes.
- Mejora del seguimiento de instrucciones y de la capacidad de resolución de problemas.
- Generación de código (etiquetado como "coder").
- Escritura creativa y ficción, incluyendo roleplaying y escritura de historias.
- Conversación multilingüe en inglés y chino.
- Modelo "uncensored" y "abliterated": responde sin rechazos de seguridad típicos, lo que puede ser útil para aplicaciones creativas o de rol.
- Compatible con endpoints (etiqueta `endpoints_compatible`).
- No se menciona soporte de tool calling o function calling en la información disponible.

## Casos de uso

- Asistente de programación: el modelo puede generar y revisar código, y gracias a su capacidad de visión puede interpretar capturas de pantalla de interfaces o diagramas.
- Escritura creativa y ficción: su naturaleza "uncensored" y su entrenamiento con trazas de escritura permiten generar narrativas extensas, diálogos y personajes complejos, como muestra el ejemplo de la model card.
- Roleplay y juegos de texto: adecuado para simulaciones de personajes en entornos interactivos, dado su estilo de respuesta sin restricciones.
- Análisis de imágenes y descripción de contenido visual: al ser un modelo image-text-to-text, puede responder preguntas sobre imágenes o generar descripciones detalladas.
- Asistente de investigación y razonamiento: su entrenamiento multi-stage con datasets de razonamiento (Polaris, F451) lo hace útil para tareas de análisis y resolución de problemas complejos.
- Chat conversacional bilingüe: soporta inglés y chino, lo que permite su uso en aplicaciones de atención al cliente o asistentes en esos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card del autor incluye afirmaciones cualitativas: el modelo supera al Qwen 3.6 27B base en 6 de 7 benchmarks y lo iguala en el séptimo; también supera los 7 benchmarks de Qwen3.6-35B-A3B. Además, se afirma que es el primer fine tune de este tamaño en superar el umbral de 700 en ARC-C tanto en 8 bits como en 4 bits. Sin embargo, no se proporcionan los valores numéricos concretos ni una tabla de resultados, por lo que estas afirmaciones no pueden verificarse con los datos disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: para cuantización 4-bit, aproximadamente 16-18 GB; para 8-bit, aproximadamente 28-32 GB. Estimación basada en el tamaño de parámetros (26.9B) y no en datos oficiales.
- GPU recomendadas: una RTX 4090 (24 GB) puede ejecutar la versión 4-bit; para 8-bit se recomienda una A100 80GB o H100.
- El modelo está diseñado para hardware de consumo, según el autor, y es posible ejecutarlo en GPUs de 24 GB con cuantización 4-bit.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (si es compatible), y cualquier framework que soporte GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-27B-Fable-Fusion-711 (este) | 26.9B | No disponible | Afirmado superior al base en 6/7 benchmarks | Apache-2.0 | HuggingFace |
| Qwen3.6-27B (base) | 27B | No disponible | No disponible | Apache-2.0 | HuggingFace |
| Qwen3.6-35B-A3B | 35B (A3B MoE) | No disponible | Afirmado inferior a este modelo | Apache-2.0 | HuggingFace |

No se dispone de especificaciones detalladas de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored" y "abliterated": puede generar contenido ofensivo, sexual, violento o ilegal sin filtros, lo que supone un riesgo si se despliega en aplicaciones públicas.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se ha verificado de forma independiente la precisión de los benchmarks mencionados.
- Limitación de idiomas: solo se soportan inglés y chino (en, zh), lo que restringe su uso en otros idiomas.
- Licencia Apache-2.0 permite uso comercial, pero es necesario verificar la licencia del modelo base (Qwen3.6) y de los datasets utilizados para asegurar el cumplimiento.
- El autor afirma que el modelo no fue diseñado para ser creativo, aunque en la práctica muestra capacidades creativas; esto puede llevar a resultados inconsistentes en tareas de escritura.
- No se especifica la longitud de contexto, por lo que se desconoce su capacidad para manejar ventanas largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/trinityomnis/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Modelo base (DavidAU): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP
- Versión 40B Eleanor-DECKARD: https://huggingface.co/DavidAU/Qwen3.6-40B-Fable-Fusion-6-Core-Deckard-Eleanor-Heretic-Uncensored-NM-DAU-NEO-MAX-MTP-GGUF
- Versión 40B Grand Intelligence: https://huggingface.co/DavidAU/Qwen3.6-40B-Grand-Intelligence-Fable-Fusion-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Qwen3.8 27B Cold Fusion: https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NM-DAU-NEO-MAX-MTP-GGUF
- Modelo de prueba Qwen3.5 9B: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
