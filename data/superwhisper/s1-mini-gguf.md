# superwhisper/s1-mini-GGUF

## Resumen

S1-mini es un normalizador de texto para transcripciones de reconocimiento de voz (ASR) desarrollado por Superwhisper, la empresa detrás de la aplicación de dictado del mismo nombre. No es un modelo de transcripción ni un chatbot: toma un transcript crudo generado por un sistema ASR y lo reescribe como texto escrito limpio, eliminando muletillas, resolviendo falsos arranques y autocorrecciones, aplicando puntuación y mayúsculas, y convirtiendo números, fechas, horas, monedas y direcciones de correo a su forma escrita.

Se trata de un fine-tune de Qwen3-0.6B con 596 millones de parámetros únicos (751,6 millones de elementos de tensor contando el embedding duplicado), con una ventana de contexto de 40.960 tokens y cobertura exclusiva del inglés. El repositorio GGUF ofrece dos cuantizaciones: una Q4_K_M de 462 MB recomendada para CPU de portátil y una F16 de 1,4 GB. Su relevancia actual radica en que permite el post-procesado de transcripciones ASR completamente en el dispositivo, sin necesidad de conexión a la nube, algo cada vez más demandado en aplicaciones de dictado y asistencia por voz.

El modelo se controla mediante una línea de instrucción al inicio del prompt que define estilo, estructura y contexto, y no sigue instrucciones generales. Está publicado bajo una licencia propia denominada `s1-mini-license`, con pesos abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer decoder, 28 bloques) |
| Parametros totales | 751.632.384 elementos de tensor (596,0M parámetros únicos; el embedding de 155,6M se cuenta dos veces por `tie_word_embeddings`) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantizacion | Q4_K_M (462 MB, recomendada) y F16 (1,4 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | s1-mini-license (licencia propia, ver LICENSE en el repo) |
| Formato de pesos | GGUF (llama.cpp, Ollama, LM Studio) |

## Arquitectura y entrenamiento

S1-mini es un fine-tune del modelo Qwen3-0.6B, que emplea una arquitectura transformer decoder con 28 bloques y 311 tensores en su conversión GGUF. El modelo base fija `tie_word_embeddings`, pero Qwen3-0.6B materializa `lm_head.weight` como una copia del embedding de entrada, lo que explica que el Hub muestre 0,8B parámetros mientras que los parámetros únicos son 596M. Ambas cuantizaciones GGUF mantienen esa estructura sin cambios.

El entrenamiento se realizó sobre pares de transcripciones ASR crudas y su correspondiente texto limpio, con un sistema de control por línea de instrucción que especifica tres ejes independientes: estilo (casual, semi-casual, semi-formal, formal), estructura (prosa o listas) y contexto (general o email). Todas las combinaciones de estos ejes fueron entrenadas. El modelo no es un chatbot y no sigue instrucciones generales; su única función es la normalización de texto ASR. Los detalles completos de entrenamiento (número de tokens, composición del dataset, técnicas de alineación) no se han publicado en la información disponible; el autor remite al repositorio BF16 para documentación completa.

## Capacidades

- Normalización de transcripciones ASR: elimina muletillas (hmm, uh), resuelve falsos arranques y autocorrecciones quedándose con el valor final que pronunció el hablante.
- Aplicación de puntuación y mayúsculas (truecasing) según el registro elegido.
- Conversión de números hablados, fechas, horas, monedas y direcciones de correo electrónico a su forma escrita.
- Cuatro registros de estilo: casual, semi-casual, semi-formal y formal, que controlan el nivel de capitalización, contracciones y coloquialismos.
- Estructura de salida en prosa o listas con viñetas (solo si hay al menos tres elementos enumerables).
- Contexto de salida para email: activa formato de saludo y bloque de despedida.
- Entrada de solo muletillas o ruido produce correctamente una cadena vacía.
- Ejecución on-device: el archivo Q4_K_M de 462 MB funciona en CPU de portátil.
- No es un modelo de chat, no admite tool calling, ni capacidades multimodales, ni razonamiento multi-paso.

## Casos de uso

- Aplicaciones de dictado por voz: S1-mini se integra tras el motor ASR para convertir transcripciones crudas en texto listo para pegar en Slack, correo o documentos, funcionando completamente en el dispositivo sin latencia de red.
- Asistentes de escritura por voz en entornos profesionales: médicos, abogados o periodistas que dictan notas y necesitan que el texto final tenga puntuación, mayúsculas y formato adecuado sin revisión manual.
- Post-procesado de subtítulos generados automáticamente: limpiar transcripciones de vídeo o podcast eliminando muletillas y normalizando expresiones habladas antes de publicar subtítulos.
- Redacción de correos electrónicos por voz: con el contexto `email`, el modelo genera automáticamente saludo y bloque de despedida, adecuado para dictar respuestas rápidas desde el móvil.
- Pipelines de transcripción en servidores con recursos limitados: al ser un modelo de 0,6B cuantizado, puede desplegarse en CPU de servidor para procesar lotes de transcripciones sin necesidad de GPU.
- Normalización de transcripciones en aplicaciones de reuniones: integrar S1-mini en herramientas de toma de actas que reciben el output de Whisper u otros ASR y necesitan un texto limpio y estructurado para su almacenamiento o búsqueda.

## Benchmarks y rendimiento

El autor publica una única métrica en la model card: sobre un conjunto de validación de 7.519 casos en inglés, el modelo alcanza un 94,8% de precisión a nivel de token con la cuantización Q4_K_M. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, dado que el modelo no está diseñado para tareas generales de lenguaje. Tampoco hay comparativas públicas con otros normalizadores de texto ASR en la información disponible.

| Metrica | Valor |
|---|---|
| Precisión a nivel de token (Q4_K_M, 7.519 casos en inglés) | 94,8% |

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa 462 MB, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM, aunque el modelo está diseñado para ejecutarse en CPU.
- GPU recomendadas: no requiere GPU específica; funciona en CPU de portátil. En GPU, cualquier modelo consumer (GTX 1060 o superior) es suficiente.
- Compatibilidad con GPU consumer: sí, incluso las más modestas; el cuello de botella será la memoria del sistema, no la VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime basado en llama.cpp. También puede usarse en aplicaciones propias de dictado (sujeto a la licencia).
- Latencia y throughput estimados: no se han publicado mediciones oficiales. Dado el tamaño (462 MB Q4_K_M), en una CPU moderna se espera una latencia de decodificación en el orden de decenas de milisegundos por token, adecuada para uso interactivo.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros normalizadores de texto ASR en la información proporcionada. El propio autor aclara que S1-mini no es un modelo ASR (no compite con Whisper o Parakeet), sino un post-procesador. Como referencia de arquitectura, el modelo base Qwen3-0.6B es comparable en tamaño a otros modelos de 0,6B de la familia Qwen, pero S1-mini es un fine-tune especializado que no conserva las capacidades generales del base. No hay datos de benchmarks comparativos publicados.

| Modelo | Parámetros | Contexto | Especialización | Licencia |
|---|---|---|---|---|
| S1-mini | 596M únicos | 40.960 | Normalización ASR | s1-mini-license |
| Qwen3-0.6B (base) | 596M | 40.960 | Chat / instrucciones generales | Apache 2.0 |
| Otros normalizadores ASR | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Cobertura exclusiva del inglés: no soporta otros idiomas, y los resultados en entradas no inglesas son impredecibles.
- No es un modelo de chat: no sigue instrucciones generales ni admite conversación; solo procesa el formato de entrada específico (system prompt fijo + línea de control + transcript).
- Sensibilidad al formato de entrada: omitir el system prompt, alterar su redacción o usar valores fuera de los conjuntos entrenados (estilo, estructura, contexto) puede provocar alucinaciones o salida corrupta.
- Riesgo de alucinación: como cualquier modelo generativo, puede inventar contenido si la entrada es ambigua o está fuera de distribución, especialmente con valores de control no entrenados.
- Licencia restrictiva: la licencia `s1-mini-license` es propia y no es una licencia open source estándar; es necesario revisar sus términos antes de uso comercial o integración en productos.
- Sin garantías de rendimiento en producción: la precisión publicada (94,8%) corresponde a un conjunto de validación fijo; el rendimiento en dominios específicos (jerga técnica, acentos, ruido) no está documentado.
- La salida vacía es válida: entradas con solo muletillas o ruido producen una cadena vacía, lo que debe tratarse como resultado correcto, no como fallo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/superwhisper/s1-mini-GGUF
- Repositorio BF16 (documentación completa): https://huggingface.co/superwhisper/s1-mini
- Sitio web de Superwhisper: https://superwhisper.com
- Anuncio y análisis técnico: https://www.explainx.ai/blog/superwhisper-s1-mini-on-device-transcript-normalizer-august-2026
- Artículo en MarkTechPost: https://www.marktechpost.com/2026/08/20/meet-s1-mini-superwhispers-462-mb-open-weights-text-normalizer-that-turns-raw-asr-transcripts-into-clean-written-text/
- Ficha en Interfaze: https://interfaze.ai/models/superwhispers1-mini
- Referencia arxiv citada en tags: arxiv:2505.09388 (no se ha podido verificar el contenido)
