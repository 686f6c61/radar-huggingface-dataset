# SwagMessiah100/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF

## Resumen

Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF es un fine-tune multi-etapa del modelo Qwen3.6-27B, desarrollado por DavidAU en colaboración con Nightmedia, TeichAI, armand0e y trohrbaugh, y publicado en formato GGUF por SwagMessiah100. El modelo combina múltiples fases de fine-tuning, merges y datasets propios (Polar-STRICT y F451-STRICT) con el objetivo de elevar la inteligencia general y la capacidad de resolución de problemas sin alterar el núcleo del modelo base. Está entrenado con Unsloth sobre hardware de consumo y presenta una variante "heretic" (uncensored/abliterated) que elimina restricciones de contenido.

Su relevancia radica en que es el primer modelo open source de 27 000 millones de parámetros que supera la barrera de 700 puntos en el benchmark ARC-C tanto en cuantización de 8 bits como de 4 bits, un nivel que hasta ahora solo alcanzaban modelos cerrados de OpenAI, Claude y Gemini. Según su model card, supera al Qwen3.6-27B base en 6 de 7 benchmarks y lo iguala en el séptimo, y supera los 7 benchmarks del Qwen3.6-35B-A3B. El repositorio incluye tanto quants GGUF estándar como variantes MTP (multi-token prediction) con cuantización NEO IMATRIX, que mejora la precisión entre un 2 % y un 4 % respecto a GGUF convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.6-27B, sin detalles adicionales) |
| Parametros totales | 26 895 998 464 (26,9 B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF NEO IMATRIX, MTP, 8-bit, 4-bit, Q4, Q6_K, entre otros; tensor de salida en 16-bit para todos los quants |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer de Qwen3.6-27B, sin modificaciones estructurales documentadas. El proceso de entrenamiento es un multi-stage fine-tune que combina varias fases: fine-tunes individuales, fine-tunes multi-etapa y merges multi-etapa. Se utilizaron los datasets DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets, junto con trazas de razonamiento de Claude Opus, trazas "Fable" de armand0e y datos de GPT-5 (Polaris, no razonamiento). El entrenamiento se realizó con Unsloth en hardware de consumo.

Entre las innovaciones técnicas destacan la aplicación de "heretic" (uncensoring / abliteration) antes del fine-tuning, la cuantización NEO IMATRIX que mejora la precisión de los quants entre un 2 % y un 4 %, y la modificación del tensor de salida a precisión completa de 16 bits en todos los quants. Los quants MTP (multi-token prediction) permiten predecir múltiples tokens a la vez, mejorando el rendimiento en generación. El modelo mantiene la capacidad de visión del base (pipeline image-text-to-text).

## Capacidades

- Razonamiento y "thinking mode": el modelo ha sido optimizado para pensamiento y razonamiento multi-paso, con mejoras en instrucciones y resolución de problemas.
- Generación de código: etiquetado como "coder", es capaz de escribir y depurar código en diversos lenguajes.
- Escritura creativa: aunque no fue diseñado específicamente para ello, la model card muestra ejemplos de prosa narrativa de alta calidad, con capacidad para ficción, todos los géneros, historias y roleplay.
- Visión: al ser image-text-to-text, puede procesar entradas visuales junto con texto.
- Conversación y chat: orientado a uso conversacional, con soporte de contexto largo (no especificado).
- Multilingüe: soporta inglés y chino.
- Sin censura: la variante "heretic uncensored" elimina restricciones de contenido, lo que permite respuestas sin filtros.
- Tool calling / function calling: no se menciona explícitamente, pero al ser un fine-tune de Qwen3.6 es probable que herede esta capacidad; no confirmado.

## Casos de uso

- Asistente de programación en producción: el modelo puede integrarse en entornos de desarrollo (IDE, CI/CD) para generar código, revisar pull requests y resolver bugs, aprovechando su alto rendimiento en ARC-C y su capacidad de razonamiento multi-paso.
- Escritura creativa y ficción: autores y guionistas pueden usarlo para generar borradores, desarrollar personajes y tramas, dado su dominio de prosa narrativa y su tono "heretic" que permite estilos más atrevidos.
- Roleplay y juegos de texto: ideal para chatbots de personajes en plataformas de rol, gracias a su capacidad de mantener conversaciones coherentes y su falta de censura.
- Análisis de imágenes con texto: al soportar entrada visual, puede describir imágenes, extraer información y responder preguntas sobre contenido visual, útil en accesibilidad o documentación.
- Soporte técnico multilingüe: puede atender consultas en inglés y chino, con razonamiento avanzado para diagnosticar problemas técnicos.
- Resolución de problemas matemáticos y físicos: según un usuario en los comentarios de HuggingFace, el modelo muestra alta inteligencia incluso en cuantización Q4, resolviendo problemas complejos derivados de escenarios físicos.
- Investigación académica: como modelo abierto con licencia Apache-2.0, puede usarse para experimentos de razonamiento, evaluación de benchmarks y desarrollo de agentes.

## Benchmarks y rendimiento

La model card no proporciona una tabla detallada de benchmarks, pero sí datos concretos:

- ARC-C: superior a 700 puntos tanto en cuantización de 8 bits como de 4 bits (primer modelo de 27B en lograrlo).
- Comparación con Qwen3.6-27B base: supera en 6 de 7 benchmarks y lo iguala en el séptimo.
- Comparación con Qwen3.6-35B-A3B: supera los 7 benchmarks.

No se han publicado resultados detallados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos de ARC-C provienen de pruebas internas del autor y de terceros confirmados en la pestaña de comunidad.

## Requisitos de hardware

- VRAM estimada para inferencia: para cuantización Q4 (4 bits) se requieren aproximadamente 16-18 GB de VRAM; para Q8 (8 bits), alrededor de 32 GB. Estas cifras son estimaciones razonables para un modelo de 27B, no valores oficiales.
- GPU recomendadas: tarjetas de consumo como RTX 3090, RTX 4090 (24 GB) pueden ejecutar el modelo en Q4; GPUs de 32 GB o más (A100, H100) permiten quants superiores.
- Sí cabe en GPU de consumo (RTX 3090/4090) con cuantización Q4.
- Opciones de despliegue: llama.cpp (soporte GGUF), Ollama, vLLM (compatible con endpoints según los tags), TGI.
- Latencia y throughput: no disponibles; se espera que los quants MTP mejoren la velocidad de generación gracias a la predicción multi-token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ARC-C | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-27B-Fable-Fusion-711 (este) | 26,9 B | No disponible | >700 (8-bit y 4-bit) | Apache-2.0 | Open source |
| Qwen3.6-27B (base) | 27 B | No disponible | Inferior en 6/7 benchmarks | Apache-2.0 | Open source |
| Qwen3.6-35B-A3B (MoE) | 35 B (3 B activos) | No disponible | Inferior en 7/7 benchmarks | Apache-2.0 | Open source |
| Qwen3.5-27B | 27 B | No disponible | Inferior | Apache-2.0 | Open source |

Nota: los datos de ARC-C para los modelos comparados no se han publicado explícitamente; la comparación se basa en la afirmación de la model card de que este modelo supera a los otros en dichos benchmarks.

## Limitaciones y advertencias

- Contenido sin censura: al ser una variante "heretic uncensored", puede generar contenido ofensivo, explícito o inapropiado. No es adecuado para aplicaciones donde se requiera moderación automática.
- Idiomas limitados: solo soporta inglés y chino; no hay garantía de buen rendimiento en otros idiomas.
- Longitud de contexto no especificada: no se documenta la ventana de contexto máxima, lo que puede afectar a tareas de memoria larga.
- Riesgo de alucinación: como todo LLM, puede inventar hechos o datos, especialmente en tareas de razonamiento complejo; se recomienda verificación humana.
- Sesgos del fine-tune: los datasets Polaris y F451 pueden introducir sesgos no documentados; el proceso de abliteration puede alterar comportamientos de seguridad.
- Rendimiento variable en cuantizaciones bajas: aunque los quants Q4 mantienen buena calidad según el autor, la degradación puede ser notable en tareas de alta precisión.
- Sin soporte oficial: es un fine-tune comunitario; no hay garantía de mantenimiento ni documentación técnica completa.

## Enlaces

- Repositorio HuggingFace (este modelo): https://huggingface.co/SwagMessiah100/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Model card del autor original (DavidAU): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP
- Artículo en HackerNoon: https://hackernoon.com/qwen36-27b-fable-fusion-breaks-the-700-arc-c-barrier
- Página en ModelScope: https://www.modelscope.cn/models/Zoupers/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3.6-27b-fable-fusion-711-uncensored-heretic-nm-dau-mtp-davidau
- Discusión en HuggingFace: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF/discussions/5
