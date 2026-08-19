# verkiki/Qwen-3.8-27b-Fable5-Distill-Abliterated-Imatrix-GGUF

## Resumen

El modelo `verkiki/Qwen-3.8-27b-Fable5-Distill-Abliterated-Imatrix-GGUF` es una variante cuantizada en formato GGUF de un modelo derivado de Qwen3.8-27B, creada por el usuario verkiki. El nombre sugiere que se trata de una destilación de un modelo llamado "Fable5" (posiblemente orientado a narrativa o roleplay) sobre la base de Qwen3.8-27B, seguida de un proceso de "abliteration" (eliminación de los mecanismos de rechazo de contenido) y cuantización con imatrix para optimizar la calidad de la cuantización.

El modelo base Qwen3.8-27B es un modelo denso de 27 mil millones de parámetros, multimodal (visión-lenguaje), con una ventana de contexto nativa de 262 000 tokens, diseñado para tareas de codificación, trabajo profesional, investigación y agentes de largo horizonte. Esta variante concreta, sin embargo, no incluye una model card detallada, por lo que la información específica sobre su entrenamiento, datos o rendimiento es limitada. Su relevancia radica en ofrecer una versión localizable y sin restricciones de seguridad para usuarios que buscan un modelo de gran tamaño ejecutable en hardware de consumo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer densa (basada en Qwen3.8-27B) |
| Parametros totales | 27 000 millones (según modelo base) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262 000 tokens (según modelo base) |
| Tipos de cuantizacion | GGUF con imatrix (variantes Q4_K_M, Q5_K_M, etc., no especificadas) |
| Idiomas soportados | no disponible (el base soporta múltiples idiomas, pero no se confirma para esta variante) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors no disponible) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura transformer densa, con atención estándar y capacidades multimodales (procesamiento de imagen y texto). Incorpora un mecanismo de razonamiento configurable que permite alternar entre modos de pensamiento rápido y profundo. La variante aquí descrita ha sido sometida a un proceso de destilación desde un modelo denominado "Fable5" (del que no se dispone de información pública), lo que implica que los pesos han sido ajustados para imitar el comportamiento de ese modelo profesor. Posteriormente se aplicó una técnica de "abliteration", que consiste en eliminar o atenuar las capas responsables de los rechazos de contenido (refusals), dando como resultado un modelo menos restrictivo. Finalmente, se cuantizó a formato GGUF utilizando una matriz de importancia (imatrix) para mejorar la fidelidad de la cuantización. No se dispone de detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.8-27B, incluyendo razonamiento multi-paso y pensamiento profundo configurable.
- Codificación: soporte para generación y depuración de código en múltiples lenguajes, según las capacidades del base.
- Visión: al ser una variante del Qwen3.8-27B, podría conservar la capacidad de procesar imágenes, aunque no se confirma en esta versión específica.
- Tool calling y function calling: el modelo base soporta invocación de herramientas, pero no se verifica en esta variante.
- Capacidades multilingües: el base soporta numerosos idiomas, pero no se especifica para esta variante.
- Sin restricciones de contenido: debido al proceso de abliteration, el modelo no rechaza peticiones que el base podría bloquear, lo que lo hace adecuado para usos creativos sin filtros.

## Casos de uso

- Roleplay y narrativa interactiva: al estar destilado de un modelo llamado "Fable5" y abliterated, es adecuado para generar historias, diálogos y personajes sin censura, ejecutable localmente en hardware de gama media-alta.
- Asistente de programación local: gracias a su base Qwen3.8-27B, puede ayudar con tareas de codificación, explicación de código y generación de scripts, sin depender de servicios en la nube.
- Generación de contenido creativo: redacción de guiones, poesía, cuentos o contenido para blogs, con la ventaja de no tener restricciones temáticas.
- Análisis de documentos largos: con una ventana de contexto de 262K tokens (si se conserva), permite procesar libros completos o informes extensos en una sola pasada.
- Experimentación en investigación: útil para estudiar el efecto de la abliteration en modelos de gran tamaño, comparando comportamientos con el modelo original.
- Despliegue en entornos sin conexión: al ser un GGUF, puede ejecutarse con llama.cpp, Ollama o LM Studio en equipos con 24 GB de RAM o VRAM, ideal para entornos aislados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta variante específica. Los benchmarks del modelo base Qwen3.8-27B (MMLU, HumanEval, GSM8K, etc.) pueden consultarse en las fuentes oficiales de Qwen, pero no se puede garantizar que esta variante destilada y abliterated mantenga el mismo rendimiento. Se recomienda evaluar el modelo en las tareas de interés antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada: según el modelo base, una cuantización Q4_K_M ocupa aproximadamente 16,8 GB, lo que permite ejecutarlo en GPUs con 24 GB de VRAM (RTX 3090, RTX 4090, A10, etc.) o en sistemas con memoria unificada de 24 GB (Apple Silicon M1 Pro/Max o superior).
- GPU recomendadas: RTX 3090, RTX 4090, A100 (para mayor velocidad), o cualquier GPU con al menos 16 GB de VRAM para cuantizaciones más agresivas (Q3, Q2).
- Compatibilidad con hardware de consumo: sí, cabe en GPUs de gama alta de consumo y en Macs con suficiente memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui (con backend llama.cpp), vLLM (si se convierte a otro formato, aunque GGUF no es nativo).
- Latencia y throughput: no disponible para esta variante; dependerá del hardware y de la cuantización elegida. En una RTX 4090, el modelo base en Q4_K_M suele generar entre 20 y 40 tokens por segundo, pero no se confirma para esta versión.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262K | Apache 2.0 | safetensors, GGUF | Modelo base, con alineación de seguridad |
| verkiki/Qwen-3.8-27b-Fable5-Distill-Abliterated-Imatrix-GGUF | 27B (estimado) | 262K (estimado) | Apache 2.0 | GGUF | Variante destilada y abliterated, sin filtros |
| TeichAI/Qwen3.8-27B-Fable-Distill-GGUF | 27B (estimado) | 262K (estimado) | Apache 2.0 | GGUF | Otra variante destilada de Fable, sin abliteration aparente |

No se dispone de más alternativas comparables en la información proporcionada. La principal diferencia entre estas variantes radica en el proceso de destilación y en la presencia o ausencia de abliteration, lo que afecta al comportamiento de rechazo de contenido.

## Limitaciones y advertencias

- Sesgos conocidos: al ser una variante abliterated, es probable que genere contenido ofensivo, violento o sexual sin restricciones, lo que puede ser inapropiado para muchos entornos.
- Riesgo de alucinación: como todos los modelos de lenguaje, puede inventar hechos, citas o datos, especialmente en tareas de razonamiento complejo.
- Limitaciones de contexto: aunque el base soporta 262K tokens, la destilación y cuantización pueden degradar la retención de contexto a longitudes extremas.
- Limitaciones de idioma: no se ha confirmado qué idiomas conserva esta variante; el base soporta muchos, pero la destilación podría haber reducido el rendimiento en algunos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el proceso de abliteration puede violar los términos de uso del modelo base si se redistribuye sin atribución adecuada (aunque la licencia Apache 2.0 lo permite, es recomendable verificar).
- Caveat para producción: al no tener benchmarks ni documentación, no se recomienda su uso en aplicaciones críticas sin una evaluación exhaustiva previa.

## Enlaces

- HuggingFace: https://huggingface.co/verkiki/Qwen-3.8-27b-Fable5-Distill-Abliterated-Imatrix-GGUF
- Modelo base Qwen3.8-27B (referencia): https://lmstudio.ai/models/qwen3.8
- Guía de ejecución local con Ollama: https://typilot.com/blog/qwen3-8-27b-run-locally
- Análisis de especificaciones y benchmarks del base: https://kingy.ai/blog/qwen3-8-27b-specs-benchmarks-local-hardware/
- Colección Qwen3 en HuggingFace: https://huggingface.co/collections/Qwen/qwen3
