# SwagMessiah100/s1-mini

## Resumen

S1-mini es un modelo de lenguaje causal de 596 millones de parámetros, desarrollado por Superwhisper, especializado en la normalización de transcripciones de voz a texto (ASR). Su función es transformar una transcripción bruta, habitualmente en minúsculas y sin puntuación, en texto escrito limpio: elimina muletillas, resuelve falsos comienzos y autocorrecciones, aplica puntuación y capitalización, y convierte números, fechas, horas, monedas y direcciones de correo a su forma escrita. Está diseñado para ejecutarse íntegramente en el dispositivo, con una versión cuantizada de 462 MiB que funciona en CPU de portátil.

El modelo es un fine-tuning de Qwen/Qwen3-0.6B, con arquitectura transformer de 28 capas y atención con consulta agrupada (GQA). No es un modelo de chat: realiza una única tarea de transformación, controlada mediante una línea de instrucciones al inicio de la entrada. En un conjunto de validación de 7.519 casos en inglés alcanza un 94,8% de precisión a nivel de token. Esta ficha se basa en el repositorio SwagMessiah100/s1-mini, que replica el modelo original publicado por Superwhisper en superwhisper/s1-mini.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (base Qwen3-0.6B), GQA |
| Parametros totales | 596M únicos (751,6M tensores con embeddings duplicados) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada; recomendado hasta ~1.000 tokens por entrada |
| Tipos de cuantizacion | BF16 (entrenamiento); GGUF cuantizado disponible (462 MiB) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 + cláusula de naming |
| Formato de pesos | safetensors (y GGUF en repositorio separado) |

## Arquitectura y entrenamiento

S1-mini parte de Qwen3-0.6B, un modelo transformer causal con 28 capas, 16 cabezas de atención para consultas y 8 para claves/valores (GQA), y embeddings atados (tied). El fine-tuning se realizó para una única tarea: normalización de transcripciones ASR. El modelo recibe un prompt de sistema fijo, una línea de control con parámetros de estilo, estructura y contexto, y la transcripción bruta; produce únicamente el texto limpio, sin preámbulos ni explicaciones.

No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni si se emplearon técnicas como RLHF o DPO. La configuración de inferencia requiere desactivar el modo de pensamiento (`enable_thinking=False`) y usar muestreo determinista (`do_sample=False`). El modelo no es un chatbot y no sigue instrucciones generales; su comportamiento se limita a la transformación de transcripciones.

## Capacidades

- Normalización de transcripciones ASR: elimina muletillas ("um", "uh"), corrige falsos comienzos y autocorrecciones, y resuelve la frase al valor final que el hablante eligió.
- Aplicación de puntuación y capitalización automática.
- Conversión de números, fechas, horas, monedas y direcciones de correo electrónico a su forma escrita.
- Control de estilo mediante línea de control: `[Styling: ...]`, `[Structure: ...]`, `[Context: ...]` (por ejemplo, estilo semi-formal, estructura de prosa o listas, contexto general o de correo electrónico).
- Salida en texto plano; en modo listas puede generar viñetas Markdown, y en contexto de correo puede incluir líneas en blanco entre saludo, cuerpo y despedida.
- Cuando la entrada es solo ruido o muletillas, devuelve una cadena vacía.

## Casos de uso

- Post-procesado de transcripciones de reuniones: integrar S1-mini tras un motor ASR para limpiar automáticamente actas o resúmenes, eliminando repeticiones y muletillas antes de guardar el documento.
- Aplicaciones de dictado en el dispositivo: el modelo cuantizado (462 MiB) se ejecuta en CPU de portátil, permitiendo dictado offline con normalización en tiempo real sin enviar datos a la nube.
- Generación de subtítulos limpios: transformar transcripciones brutas de vídeo en subtítulos con puntuación y capitalización correctas, listos para plataformas de publicación.
- Preparación de datos para entrenamiento de modelos de voz: usar S1-mini para limpiar corpus de transcripciones antes de usarlos como datos de entrenamiento o evaluación en tareas de ASR o TTS.
- Automatización de correos dictados: con el contexto `Context: email`, el modelo estructura el texto en saludo, cuerpo y despedida, facilitando la redacción de mensajes desde voz.
- Asistentes de documentación clínica o legal: normalizar transcripciones de notas dictadas, aplicando formato consistente a números, fechas y terminología, reduciendo errores de transcripción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato reportado por el autor es una precisión a nivel de token del 94,8% sobre un conjunto de validación de 7.519 casos en inglés. No se proporcionan comparativas con otros modelos.

| Metrica | Resultado |
|---|---|
| Token accuracy (validación, 7.519 casos) | 94,8% |

## Requisitos de hardware

- Inferencia en CPU: la versión GGUF cuantizada ocupa 462 MiB y se ejecuta en portátiles convencionales, con latencia adecuada para dictado interactivo.
- Inferencia en GPU: el modelo en BF16 requiere aproximadamente 1,2 GB de memoria para los pesos (596M × 2 bytes) más overhead de activaciones; cabe en cualquier GPU con 4 GB o más, incluidas RTX 3050, RTX 4060 o superiores.
- Despliegue: compatible con transformers (>=4.51.0), llama.cpp, Ollama y LM Studio mediante los GGUF de superwhisper/s1-mini-GGUF. También soporta text-generation-inference y endpoints compatibles.
- Latencia y throughput: no se han publicado mediciones oficiales; en CPU de portátil, la normalización de transcripciones de ~100 tokens suele completarse en menos de un segundo con la versión cuantizada, aunque depende del hardware.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (normalizadores de texto ASR de pequeño tamaño). La comparativa con alternativas como Whisper (que realiza ASR, no normalización) no es directa. Se indica "no disponible".

## Limitaciones y advertencias

- Solo cubre inglés; no soporta otros idiomas.
- No es un modelo de chat ni sigue instrucciones generales; cualquier uso fuera de la tarea de normalización puede producir resultados impredecibles.
- La entrada recomendada está limitada a ~1.000 tokens; transcripciones más largas deben dividirse en fragmentos, lo que puede afectar a la coherencia entre partes.
- La licencia Apache 2.0 incluye una cláusula de naming que restringe el uso del nombre "Superwhisper" o "S1-mini" en productos derivados; es necesario revisar el texto completo de la licencia antes de uso comercial.
- Riesgo de alucinación en números complejos o contextos ambiguos; el modelo puede inventar contenido si la transcripción es muy ruidosa o incompleta.
- El repositorio SwagMessiah100/s1-mini es una copia del modelo original; se recomienda usar el repositorio oficial superwhisper/s1-mini para producción.

## Enlaces

- Repositorio HuggingFace (copia): https://huggingface.co/SwagMessiah100/s1-mini
- Repositorio oficial: https://huggingface.co/superwhisper/s1-mini
- GGUF para llama.cpp/Ollama: https://huggingface.co/superwhisper/s1-mini-GGUF
- Sitio web de Superwhisper: https://superwhisper.com
- Paper relacionado (referencia en tags): arXiv:2505.09388
- Anuncio en X: https://x.com/superwhisper/status/2091977270433075251
