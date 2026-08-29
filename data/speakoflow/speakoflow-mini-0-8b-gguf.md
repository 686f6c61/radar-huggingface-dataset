# SpeakoFlow/speakoflow-mini-0.8b-GGUF

## Resumen

SpeakoFlow Mini 0.8B es un modelo de generación de texto especializado en la limpieza de dictados posteriores a un reconocimiento de voz (post-ASR). Desarrollado por SpeakoFlow, un proyecto de software libre de dictado por voz para escritorio, este modelo corrige los errores que el hablante cometió al dictar y devuelve el resto del texto byte a byte, sin modificaciones innecesarias. Su propósito es resolver un problema concreto: tras un reconocedor moderno que ya añade puntuación, mayúsculas y formato de números, queda la tarea estrecha de arreglar retractaciones, comandos hablados, errores gramaticales del propio hablante y palabras mal elegidas en contexto, sin tocar nada más.

El modelo es un fine-tune de Qwen/Qwen3.5-0.8B, realizado con LoRA de rango 16, fusionado y posteriormente cuantizado. Tiene aproximadamente 772,8 millones de parámetros y se distribuye en formato GGUF con cinco cuantizaciones publicadas. Está pensado para ejecutarse en CPU de escritorio: la versión Q8_0 ocupa 833 MB y ofrece una latencia mediana de 2509 ms. Solo soporta inglés y no es un modelo de chat ni un reescritor general; hace una única tarea y su prompt de sistema forma parte del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3.5-0.8B) |
| Parametros totales | 772.845.888 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (833 MB) y otras cuatro cuantizaciones publicadas (no especificadas) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer decoder-only de 0.8B parámetros, y se ajusta mediante LoRA de rango 16 sobre un conjunto de datos propio de limpieza de dictados. Tras el entrenamiento, los pesos LoRA se fusionan con el modelo base y el resultado se cuantiza a GGUF. El autor declara que el prompt de sistema utilizado durante el fine-tune es parte integral del modelo: cualquier otro prompt produce un comportamiento no medido. El entrenamiento se evaluó con exactitud de cadena a temperatura 0, sin ningún juez automático en el pipeline.

La innovación principal no está en la arquitectura, sino en el enfoque de la tarea: el modelo está entrenado para no modificar texto ya correcto (restraint) y para corregir solo lo que el hablante realmente dijo mal. Esto contrasta con los modelos generales que tienden a "mejorar" el texto innecesariamente. El benchmark propio, `dictation-cleanup-bench`, mide específicamente la contención (devolver byte a byte las filas ya correctas) y la precisión de edición (acertar exactamente en las filas que necesitan cambio).

## Capacidades

- Limpieza de transcripciones de dictado: corrige retractaciones ("three hundred, no, three fifty"), comandos hablados ("new line", "at sign"), intención de formato, errores gramaticales del hablante y palabras mal elegidas en contexto.
- Contención estricta: devuelve el texto sin cambios si ya es correcto, carácter por carácter.
- No es un modelo de chat: no responde preguntas ni mantiene conversaciones; el texto de entrada se trata como transcripción, no como instrucción.
- No es un reescritor general: no reformula, no resume, no cambia estilo.
- Soporte de comandos de edición explícitos como "new line", "scratch that" y "correct X to Y".
- Capacidad multilingüe: no disponible, solo inglés.

## Casos de uso

- Post-procesado de dictados médicos o legales: el modelo puede limpiar transcripciones generadas por un ASR local, corrigiendo errores del hablante sin alterar el contenido correcto, lo que es crítico en dominios donde la fidelidad literal es obligatoria.
- Integración en aplicaciones de dictado por voz de escritorio: SpeakoFlow lo usa como capa de limpieza tras el reconocedor, permitiendo que el usuario dicte con comandos hablados ("nueva línea", "borra eso") y obtenga texto limpio sin intervención manual.
- Automatización de transcripciones de reuniones: tras un ASR que ya añade puntuación y formato, el modelo arregla retractaciones y errores del hablante, reduciendo la revisión humana.
- Corrección de subtítulos generados automáticamente: puede aplicarse a subtítulos ya formateados para corregir errores de dictado sin tocar el texto correcto.
- Pipelines de accesibilidad: para usuarios que dictan con voz y necesitan que el texto final refleje exactamente lo que dijeron, sin "mejoras" automáticas.
- Evaluación comparativa de modelos de limpieza: el benchmark `dictation-cleanup-bench` permite medir objetivamente la contención y la precisión de edición, útil para investigadores que desarrollan sistemas similares.

## Benchmarks y rendimiento

Resultados declarados por el autor en el benchmark `dictation-cleanup-bench` v0.4 (150 filas, exactitud de cadena a temperatura 0). El modelo se compara con alternativas alojadas y locales:

| Modelo | Overall | Restraint | Edit accuracy | Content damage (menor es mejor) |
|---|---|---|---|---|
| **SpeakoFlow Mini 0.8B (local CPU)** | **70.7%** | 92.6% | 48.8% | 10.7% |
| GPT-5.6 Luna (hosted frontier) | 65.0% | 82.4% | 47.6% | 12.0% |
| Qwen3.5 9B (hosted) | 55.8% | 89.7% | 22.0% | 6.7% |
| _do nothing (baseline)_ | _50.0%_ | _100.0%_ | _0.0%_ | _0.0%_ |
| Qwen3.5 0.8B (base sin ajustar) | 47.3% | 89.7% | 4.9% | 6.0% |
| Gemma 4 E2B (local CPU) | 47.0% | 79.4% | 14.6% | 13.3% |
| S1-mini (modelo de limpieza comercial) | 15.3% | 22.1% | 8.5% | 55.3% |
| Sotto 350M (modelo de limpieza comercial) | 11.7% | 16.2% | 7.3% | 60.7% |

Nota: estos resultados son los publicados por el autor en la model card y no han sido verificados de forma independiente. No se dispone de resultados en benchmarks generales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- La cuantización Q8_0 ocupa 833 MB y se ejecuta en CPU de escritorio con una latencia mediana de 2509 ms por petición.
- Al ser un modelo de 0.8B parámetros, es viable en GPUs de gama baja (por ejemplo, GTX 1650, RTX 3060) y en CPUs modernas con al menos 4 GB de RAM libre.
- No se han publicado requisitos exactos de VRAM para las otras cuantizaciones, pero por tamaño cabe en cualquier GPU con 2 GB o más de VRAM.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server`), Ollama (`ollama run hf.co/SpeakoFlow/speakoflow-mini-0.8b-GGUF`) y LM Studio.
- No se dispone de datos de throughput en servidores de inferencia como vLLM o TGI, aunque al ser un modelo pequeño es compatible con ellos si se convierte a safetensors.

## Comparativa con modelos similares

La comparativa se basa en los datos del benchmark del autor, que incluye modelos de limpieza de dictado comerciales y modelos generales:

| Modelo | Parametros | Contexto | Overall (dictation-cleanup) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **SpeakoFlow Mini 0.8B** | 0.8B | no disponible | 70.7% | Apache-2.0 | GGUF en HuggingFace |
| Qwen3.5 0.8B (base) | 0.8B | no disponible | 47.3% | Apache-2.0 | HuggingFace |
| Gemma 4 E2B | 2B aprox. | no disponible | 47.0% | no disponible | no disponible |
| S1-mini | no disponible | no disponible | 15.3% | no disponible | no disponible |
| Sotto 350M | 0.35B | no disponible | 11.7% | no disponible | no disponible |

No se dispone de información sobre otros modelos de limpieza de dictado de código abierto comparables fuera de los listados por el autor.

## Limitaciones y advertencias

- Solo soporta inglés; no es utilizable para otros idiomas.
- No es un modelo de chat ni un reescritor general; usarlo para otras tareas producirá resultados no medidos y probablemente incorrectos.
- El prompt de sistema es parte del modelo: cualquier variación del prompt publicado invalida los resultados del benchmark.
- Riesgo de daño de contenido: el 10.7% de las filas pierde una palabra dicha por el hablante, lo que puede ser inaceptable en contextos donde la fidelidad literal es crítica.
- La precisión de edición es baja (48.8%): en filas que necesitan cambio, el modelo acierta exactamente menos de la mitad de las veces.
- Los resultados del benchmark son declarados por el autor y no verificados de forma independiente.
- La licencia Apache-2.0 permite uso comercial, pero el modelo depende de Qwen3.5-0.8B, cuya licencia original debe respetarse.
- No se han publicado datos sobre sesgos, alucinaciones o comportamiento en entradas fuera de distribución.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SpeakoFlow/speakoflow-mini-0.8b-GGUF
- Repositorio del proyecto SpeakoFlow: https://github.com/AbhishekBarali/SpeakoFlow
- Sitio web oficial: https://www.speakoflow.com/
- Documentación de modelos de transcripción: https://www.speakoflow.com/docs/models/transcription-models
- Benchmark dictation-cleanup-bench: https://huggingface.co/datasets/SpeakoFlow/dictation-cleanup-bench
- Código del benchmark: https://github.com/AbhishekBarali/dictation-cleanup-bench
- Página en SourceForge: https://sourceforge.net/projects/speakoflow/
