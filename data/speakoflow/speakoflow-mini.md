# SpeakoFlow/speakoflow-mini

## Resumen

SpeakoFlow Mini es un modelo de lenguaje pequeño de 0,8 mil millones de parámetros, especializado en la limpieza de transcripciones de dictado (post-ASR correction). Desarrollado por el proyecto SpeakoFlow, un asistente de voz offline de código abierto para Windows, macOS y Linux, este modelo resuelve un problema concreto: los modelos generalistas tienden a "mejorar" texto ya correcto, alterando lo que el hablante realmente dijo. SpeakoFlow Mini aplica únicamente las correcciones que el hablante hizo de forma explícita y devuelve intacto el resto del texto.

El modelo es un fine-tune de Qwen/Qwen3.5-0.8B mediante LoRA de rango 16, fusionado y posteriormente cuantizado a formato GGUF. Con 772,8 millones de parámetros, está diseñado para inferencia en CPU con baja latencia (2,5 segundos de mediana en un escritorio). Se distribuye bajo licencia Apache-2.0 y está pensado como la segunda etapa de un pipeline de limpieza de dictado, precedido por una capa de reglas deterministas publicada por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen3.5-0.8B) |
| Parametros totales | 772.845.888 (0,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (Q8_0 documentado; pueden existir otros niveles) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (y safetensors en el repositorio) |

## Arquitectura y entrenamiento

SpeakoFlow Mini parte del modelo base Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8B parametros. El fine-tune se realizo con LoRA de rango 16, los pesos se fusionaron y el resultado se cuantizo a GGUF para su ejecucion eficiente en CPU mediante llama.cpp. No se dispone de informacion sobre el numero total de tokens de entrenamiento ni sobre el uso de tecnicas como RLHF o DPO.

La innovacion principal no reside en la arquitectura, sino en el enfoque de entrenamiento: el modelo se entrena para distinguir entre lo que debe corregir y lo que debe dejar intacto. La model card documenta quince categorias de decision, entre ellas retracciones del hablante, comandos hablados, simbolos dictados, intencion de formato, errores gramaticales del hablante, disfluencias, clarificaciones, preservacion de preguntas e instrucciones, y manejo de entradas truncadas o ruidosas. El dataset de entrenamiento, SpeakoFlow/dictation-cleanup-examples, combina transcripciones reales de dictado con casos escritos a mano para cubrir categorias poco frecuentes.

## Capacidades

- Limpieza de transcripciones de dictado (post-ASR correction) aplicando solo los cambios que el hablante realizo explicitamente.
- Retracciones: "Thursday, no, Friday" se convierte en "Friday".
- Comandos hablados: "new paragraph" se convierte en un salto de parrafo.
- Simbolos hablados: "sam at example dot com" se convierte en `sam@example.com`.
- Intencion de formato: estructura descrita oralmente (listas, viñetas) se convierte en texto formateado.
- Correccion de errores gramaticales del hablante ("they was ready" a "they were ready").
- Correccion de palabras incorrectas transcritas correctamente ("in the mourning" a "in the morning").
- Eliminacion de disfluencias preservadas por el reconocedor ("the the deadline" a "the deadline").
- Resolucion de clarificaciones: la forma mas precisa dicha por el hablante prevalece.
- Preservacion de preguntas dictadas e instrucciones como texto, sin responderlas ni ejecutarlas.
- Preservacion de dictados en otros idiomas, sin traduccion.
- Manejo de entradas truncadas (no inventa continuacion), vacias o con ruido (devuelve nada).
- Eliminacion de alucinaciones del reconocedor (frases repetidas que el hablante no dijo).
- No es un modelo de chat ni un reescritor general: no reformula, no resume ni mejora el estilo.

## Casos de uso

- Asistente de voz offline integrado en SpeakoFlow: el modelo procesa la transcripcion local en tiempo real, sin enviar datos a la nube, lo que garantiza privacidad en dictados personales o profesionales.
- Post-procesamiento de transcripciones medicas o legales: donde la fidelidad literal es critica, el modelo corrige solo lo que el hablante rectifico, evitando que un LLM generalista altere el contenido.
- Limpieza de subtitulos generados por ASR: elimina disfluencias y aplica retracciones sin tocar el texto correcto, mejorando la legibilidad sin cambiar el significado.
- Correccion de correos electronicos dictados: el modelo transforma simbolos hablados ("arrob a", "punto com") en su forma escrita y aplica comandos de formato, dejando el resto del mensaje intacto.
- Preprocesamiento para downstream tasks: antes de enviar una transcripcion a un LLM generalista para resumen o extraccion, SpeakoFlow Mini limpia el texto sin introducir cambios no deseados, evitando que el modelo posterior "mejore" el contenido.
- Pipeline de transcripcion en dos etapas: combinado con la capa de reglas deterministas `dictation-cleanup-rules`, el modelo se encarga de las decisiones semanticas que las reglas no pueden resolver, formando un sistema completo y auditable.
- Entornos con requisitos estrictos de privacidad o sin GPU: al ejecutarse en CPU con 833 MB en Q8_0, puede desplegarse en equipos modestos o en infraestructuras aisladas.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index, sobre el conjunto de evaluacion privado "SpeakoFlow dictation cleanup evaluation (held out)":

| Metrica | Valor |
|---|---|
| Overall (media de restraint y edit accuracy) | 70,7 |
| Restraint (texto ya correcto devuelto intacto) | 92,6 |
| Edit accuracy (transcripciones que requieren cambio) | 48,8 |
| Content damage (palabra hablada perdida; menor es mejor) | 10,7 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo pesa 833 MB en cuantizacion Q8_0 y presenta una latencia mediana de 2.509 ms en un CPU de escritorio, segun la model card.
- No requiere GPU: esta optimizado para ejecucion local en CPU mediante llama.cpp.
- VRAM: no aplica para inferencia en CPU; si se usara GPU, cualquier tarjeta con al menos 1 GB de VRAM podria alojar el modelo en Q8_0, aunque no es el escenario previsto.
- Opciones de despliegue: llama.cpp es el runtime documentado; al ser GGUF, tambien es compatible con Ollama y otros motores que consumen este formato.
- Throughput: no se proporcionan datos de tokens por segundo; la latencia mediana de 2,5 segundos por respuesta sugiere un uso interactivo de dictado mas que de procesamiento por lotes.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos directamente comparables en la tarea de limpieza de dictado. El modelo base Qwen3.5-0.8B es un LLM generalista que no esta especializado en esta tarea y tiende a alterar texto correcto, como se indica en la model card. No hay datos publicos de otros modelos de post-ASR correction con los que establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Solo soporta ingles; los dictados en otros idiomas se preservan pero no se procesan.
- No es un modelo de chat ni un reescritor: usarlo para tareas generales de generacion de texto producira resultados inadecuados.
- La edit accuracy es baja (48,8%): en transcripciones que requieren cambios, el modelo falla en mas de la mitad de los casos, aunque el restraint es alto (92,6%).
- El content damage del 10,7% indica que aproximadamente una de cada diez palabras habladas puede perderse en transcripciones que necesitan correccion, lo que puede ser inaceptable en contextos de alta fidelidad.
- El conjunto de evaluacion es privado y no reproducible externamente, lo que limita la verificacion independiente de los resultados.
- Depende de la capa de reglas deterministas para la primera etapa del pipeline; sin ella, el modelo no cubre todos los casos de limpieza.
- Riesgo de alucinacion en entradas ambiguas o con ruido excesivo, aunque el modelo esta entrenado para devolver nada en esos casos.
- La licencia Apache-2.0 permite uso comercial, pero el modelo esta especializado en dictado en ingles y no debe usarse fuera de ese dominio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SpeakoFlow/speakoflow-mini
- Repositorio de SpeakoFlow: https://github.com/AbhishekBarali/SpeakoFlow
- Documentacion de SpeakoFlow: https://www.speakoflow.com/docs
- Capa de reglas deterministas: https://github.com/AbhishekBarali/dictation-cleanup-rules
- Sitio web de SpeakoFlow: https://speakoflow.com
- Dataset de entrenamiento: https://huggingface.co/datasets/SpeakoFlow/dictation-cleanup-examples
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
