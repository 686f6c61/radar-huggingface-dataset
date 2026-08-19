# thunquant/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF

## Resumen

Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF es un ajuste fino de múltiples etapas sobre el modelo base Qwen3.6-27B, desarrollado por DavidAU en colaboración con Nightmedia, TeichAI, armand0e y trohrbaugh. Se trata de un modelo de 26 895 998 464 parámetros (27B) que combina varios fine-tunes, merges y datasets propios (DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets) con el objetivo de mejorar la inteligencia general, el razonamiento y el seguimiento de instrucciones sin dañar el núcleo original. El modelo incluye capacidades de visión (image-text-to-text) y se distribuye exclusivamente en formato GGUF con cuantizaciones imatrix y MTP.

La relevancia de este modelo radica en que es el primer modelo de código abierto de este tamaño que supera la barrera de 700 puntos en ARC-C tanto en cuantización de 8 bits como de 4 bits, un umbral que hasta ahora solo alcanzaban los modelos cerrados de OpenAI, Anthropic y Google. El autor reporta que supera al Qwen3.6-27B base en 6 de 7 benchmarks y lo iguala en el séptimo, además de superar todos los benchmarks del Qwen3.6-35B-A3B. El modelo está diseñado para ser un "todo uso" con especial énfasis en razonamiento, escritura creativa, roleplaying y generación de código, y se ha liberado bajo licencia Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.6-27B, no se especifican detalles adicionales) |
| Parámetros totales | 26.895.998.464 (27B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (probablemente hereda la del modelo base Qwen3.6-27B, no especificada) |
| Tipos de cuantización | GGUF imatrix (NEO IMATRIX) en 8-bit, 4-bit, Q5, Q4, Q3, Q2, etc. Variantes regular y MTP (multi-token prediction) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (también safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Transformer del Qwen3.6-27B original, aunque los detalles exactos de la arquitectura (número de capas, heads, etc.) no se han publicado. El proceso de entrenamiento es un ajuste fino de múltiples etapas que combina varios fine-tunes, merges y ajustes con datasets propietarios como Polar-STRICT y F451-STRICT. También incorpora "trazas" ligeras de Fable (de armchairmane), razonamiento de Claude Opus y datos de GPT-5 (Polaris, no razonamiento). El objetivo declarado fue mejorar la inteligencia general y el seguimiento de instrucciones sin dañar el núcleo del modelo base, evitando explícitamente el "benchmaxing". Además, se aplicó una técnica de "heretic" (abliterated) para eliminar restricciones de contenido, lo que lo hace "uncensored".

Los GGUFs de este repo son NEO IMATRIX, una técnica que mejora la precisión de la cuantización entre un 2-4% respecto a los GGUF normales y mantiene mejor el rendimiento en contexto largo. Además, el tensor de salida (10-20% de la salida) se mantiene en precisión completa (16 bits) para todas las cuantizaciones. Las variantes MTP (multi-token prediction) usan tensores MTP en Q8_0 para mejorar la predicción de tokens múltiples.

## Capacidades

- Generación de texto y razonamiento complejo: supera al Qwen3.6-27B base en 6 de 7 benchmarks y al Qwen3.6-35B-A3B en los 7, con puntuaciones ARC-C de 711 (8-bit) y 701 (4-bit).
- Capacidades de visión (image-text-to-text): puede procesar entradas de imagen y texto combinados, aunque no se detallan tareas específicas.
- Razonamiento y pensamiento: incorpora mejoras en "thinking/reasoning" y seguimiento de instrucciones.
- Escritura creativa: aunque el modelo está orientado a todos los casos de uso, se destaca su capacidad para prosa creativa, diálogos y construcción de mundos, como se muestra en ejemplos del modelo.
- Roleplaying y ficción: soporta contextos largos y personalidades, útil para juegos de rol y narrativa interactiva.
- Soporte de tool calling / function calling: no se menciona explícitamente en la documentación.
- Soporte de agentes y multi-step reasoning: no se menciona explícitamente, pero el razonamiento mejorado sugiere cierta capacidad.
- Multilingüe: soporta inglés y chino, aunque el modelo se ha entrenado principalmente con datos en inglés.

## Casos de uso

- Asistente de desarrollo de software: el modelo puede generar código, explicar algoritmos y depurar errores. Su alto rendimiento en razonamiento permite resolver problemas de programación complejos, y su licencia Apache-2.0 facilita su integración en herramientas de productividad.
- Escritura creativa y narrativa: gracias a su capacidad para generar prosa detallada y mantener consistencia a lo largo de capítulos, es adecuado para autores que buscan un asistente de escritura que sugiera tramas, diálogos o descripciones.
- Roleplaying y juegos de texto: su entrenamiento en datos de ficción y su carácter "uncensored" permiten crear experiencias de rol interactivas sin restricciones temáticas, siendo útil para comunidades de roleplay.
- Análisis de documentos y extracción de información: con su capacidad de procesar imágenes y texto, puede extraer datos de imágenes, tablas o documentos escaneados, aunque no se detallan las capacidades específicas de visión.
- Chatbots conversacionales: su mejora en seguimiento de instrucciones y razonamiento permite mantener conversaciones coherentes y contextualizadas, ideal para asistentes personales o bots de soporte.
- Generación de contenido educativo: puede explicar conceptos complejos de matemáticas, física o lógica, como se muestra en pruebas con problemas derivados de la física (ver discusiones del repo).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados en la información disponible, pero se mencionan los siguientes datos:

| Modelo | ARC-C (8-bit) | ARC-C (4-bit) |
|---|---|---|
| Qwen3.6-27B-Fable-Fusion-711 | 711 | 701 |
| Qwen3.6-27B (base) | no disponible | no disponible |
| Qwen3.6-35B-A3B | no disponible | no disponible |

Se indica que el modelo supera al base en 6 de 7 benchmarks (sin especificar cuáles) y lo iguala en el 7º. También supera los 7 benchmarks del Qwen3.6-35B-A3B. No se aportan cifras concretas de MMLU, HumanEval, GSM8K, etc.

## Requisitos de hardware

- VRAM estimada: para cuantización 4-bit (Q4) se necesita aproximadamente 8-10 GB de VRAM, dado que el modelo tiene 27B parámetros y los pesos cuantizados ocupan ~14 GB, pero con imatrix y MTP puede variar. Para 8-bit se requieren ~27 GB.
- GPU recomendadas: para 4-bit, tarjetas como RTX 3090/4090 con 24 GB son suficientes; para 8-bit, se recomienda A100 (40/80 GB) o H100.
- Consumer GPU: sí, cabe en GPU de consumo de 24 GB con cuantización 4-bit, y con 8-bit en algunas tarjetas de 32 GB como la RTX 5090.
- Opciones de despliegue: al ser GGUF, se puede usar con llama.cpp, Ollama, vLLM (con soporte de GGUF), o TGI. También se puede convertir a safetensors para otros frameworks.
- Latencia y throughput: no se proporcionan datos concretos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ARC-C (8-bit) | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-27B-Fable-Fusion-711 | 27B | no disponible | 711 | Apache-2.0 | GGUF |
| Qwen3.6-27B (base) | 27B | no disponible | no disponible | Apache-2.0 | safetensors |
| Qwen3.6-35B-A3B | 35B (MoE, 3B activos) | no disponible | no disponible | Apache-2.0 | safetensors |

El modelo supera al base y al MoE en los benchmarks mencionados, aunque no se detalla el rendimiento en otros. Se destaca que es el primer modelo de su clase en superar el umbral de 700 en ARC-C.

## Limitaciones y advertencias

- Sesgos: no se han realizado evaluaciones de sesgos específicas. El modelo puede heredar sesgos del modelo base y de los datos de entrenamiento.
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo.
- Limitaciones de contexto: la longitud de contexto no se especifica; se recomienda usar cuantizaciones imatrix para mantener el rendimiento en contexto largo, pero no hay garantía.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo es "uncensored" y puede generar contenido inapropiado, lo que implica responsabilidad legal y ética en su despliegue.
- Riesgo de contenido dañino: al ser "uncensored" y "heretic", puede generar contenido violento, sexual o ilegal. No se recomienda su uso en aplicaciones sin moderación.
- Dependencia de cuantización: aunque las cuantizaciones imatrix y MTP mejoran la precisión, la cuantización siempre conlleva una pérdida de rendimiento respecto al modelo de precisión completa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/thunquant/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Modelo base (DavidAU): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP
- Discusión del modelo: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF/discussions/5
- Artículo en HackerNoon: https://hackernoon.com/qwen36-27b-fable-fusion-breaks-the-700-arc-c-barrier
- Página de AIModels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3.6-27b-fable-fusion-711-uncensored-heretic-nm-dau-neo-max-mtp-gguf-davidau
- Prueba del usuario CoolZero: https://note.com/zephel01/n/n6e401304c118?hl=en
