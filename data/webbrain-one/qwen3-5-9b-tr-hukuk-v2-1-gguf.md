# webbrain-one/qwen3.5-9b-tr-hukuk-v2.1-GGUF

## Resumen

Qwen 3.5 9B Türkçe Hukuk v2.1 es un modelo de lenguaje afinado especializado en derecho turco, publicado por el usuario webbrain-one en Hugging Face en formato GGUF. Se basa en Qwen/Qwen3.5-9B (aproximadamente 8.953 millones de parámetros) y está diseñado para ser el modelo jurídico por defecto de la aplicación de escritorio PekBilen, con tareas como resumen de sentencias, preguntas sobre documentos, redacción de escritos de apelación y casación, y notas de procedimiento y riesgo.

El ajuste se realizó en dos fases: primero un LoRA (r 32, α 64, aplicado a todas las capas lineales del modelo) sobre 6.013 ejemplos generados en el formato de prompt propio de la aplicación, y después una fase DPO con 202 pares de preferencias, donde las respuestas rechazadas eran salidas del propio modelo v2 que no superaban los verificadores de citas (principalmente referencias a tribunales inexistentes en la fuente). Cada respuesta objetivo pasó por controles de calidad automáticos que impiden citar importes, fechas, artículos o tribunales que no estén en el documento fuente.

Su relevancia radica en ser un ejemplo bien documentado de especialización vertical: la model card incluye una evaluación comparativa entre v1, v2 y v2.1 sobre tareas jurídicas reales, con métricas de verificación de citas y benchmarks jurídicos turcos (TRLawBench), lo que permite evaluar el impacto real del fine-tuning y del DPO. El modelo se distribuye en dos cuantizaciones IQ (IQ4_XS e IQ3_M) pensadas para ejecutarse localmente con llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-9B), 32 capas (sin capa MTP) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 32.768 tokens (según el comando de ejemplo con llama.cpp; el máximo nativo del modelo base no está indicado) |
| Tipos de cuantizacion | IQ4_XS (5,20 GB), IQ3_M (4,42 GB), con importance matrix (imatrix) calculada sobre 400 prompts del formato de la aplicación |
| Idiomas soportados | Turco (especialización jurídica; capacidades del modelo base no documentadas en la ficha) |
| Licencia | proprietary-private (licencia personalizada, "other"; distribución no autorizada prohibida) |
| Formato de pesos | GGUF (no se publican safetensors del modelo afinado; el modelo base es Qwen/Qwen3.5-9B) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer de Qwen3.5-9B, con 32 capas en los archivos GGUF (la capa MTP no se entrenó y se eliminó, corrigiendo los metadatos en consecuencia; requiere llama.cpp b11724 o superior). El ajuste fino se hizo mediante LoRA con rango 32 y alfa 64 sobre todas las capas lineales del modelo de lenguaje, usando 6.013 ejemplos generados en el formato de instrucción propio de la aplicación PekBilen, donde los documentos jurídicos se incluyen como fuente en el prompt junto con reglas, esqueletos de escritos y pasos de plantilla.

La versión v2.1 añade una fase de DPO sobre 202 pares de preferencias: la respuesta rechazada era una salida del propio modelo v2 que fallaba los verificadores de la aplicación en tareas nuevas (sobre todo citas de tribunales no presentes en la fuente), y la elegida era la respuesta que sí los superaba para el mismo prompt. Este enfoque de "RLAIF interno con verificadores deterministas" es la innovación más destacable: alinea el modelo con criterios verificables de fidelidad a la fuente en lugar de preferencias humanas genéricas. No se ha documentado el número de tokens del corpus ni la composición detallada más allá del dataset público `webbrain-one/hukuk-dataset-v2`.

## Capacidades

- Generación de texto jurídico en turco: resúmenes de sentencias, respuestas a preguntas sobre documentos, vistas generales de casos.
- Redacción de escritos procesales: diligencias de apelación (istinaf) y de casación (temyiz) a partir de documentos fuente.
- Análisis de legislación: preguntas y respuestas sobre artículos de ley (tarea de mevzuat soru-cevap).
- Notas de procedimiento y de riesgo aplicadas a casos concretos.
- Fidelidad a la fuente: los verificadores de la aplicación comprueban que no se citen importes, fechas, artículos ni tribunales ausentes del documento de entrada.
- Modo de razonamiento conmutable: se activa o desactiva mediante `chat_template_kwargs: {"enable_thinking": true|false}` en el chat template de llama.cpp.
- Formato conversacional (pipeline text-generation, tag "conversational"), compatible con llama-server mediante `--jinja`.
- No se documentan capacidades de visión, audio ni tool calling.

## Casos de uso

- Resumen de sentencias turcas: se introduce la sentencia como fuente en el prompt y el modelo genera un resumen estructurado; obtuvo 102/139 en la batería de tareas de la aplicación con razonamiento activado.
- Preguntas sobre documentos legales: permite hacer preguntas concretas sobre un documento cargado en el contexto, con respuestas restringidas al contenido de la fuente.
- Redacción de diligencias de apelación y casación: genera borradores siguiendo los esqueletos y plantillas de la aplicación, a partir de los documentos del caso.
- Consulta de legislación: responde preguntas sobre artículos de ley con los que fue entrenado (38/40 en la evaluación interna de v2.1).
- Detección de riesgos procesales: produce notas de usul (procedimiento) y riesgo sobre un caso, útiles como primera revisión antes de intervención humana.
- Asistente jurídico local y privado: al ser un GGUF de 4,4–5,2 GB, puede ejecutarse íntegramente en un equipo de escritorio con llama.cpp o un backend compatible, evitando enviar datos sensibles de clientes a servicios externos.
- Integración en aplicaciones de escritorio: el comando de ejemplo (`llama-server --jinja -c 32768`) permite exponer el modelo como servidor OpenAI-compatible para cualquier cliente local.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos sobre 20 sentencias de 2026 ajenas al entrenamiento (139 tareas de una sola llamada de la aplicación) y 40 preguntas de legislación con artículos no usados en el entrenamiento. Configuración: IQ4_XS, llama.cpp, parámetros de muestreo de la aplicación (temperatura 0,3, top-p 0,9).

| Tarea | v1 | v2 | v2.1 |
|---|---:|---:|---:|
| Tareas de la aplicación, razonamiento activado (de 139) | 82 | 96–97 | 102 |
| Tareas de la aplicación, razonamiento desactivado (de 139) | 87 | 89–93 | 97 |
| Preguntas de legislación (de 40) | 5 | 39 | 38 |
| TRLawBench (97 preguntas ÖSYM, razonamiento desactivado) | 44 | 46 | 47 |
| HukukBERT cloze (750 preguntas) | 47,7 % | 47,3 % | 47,7 % |

El autor señala que en TRLawBench la diferencia entre versiones está dentro del margen de ruido (±5 preguntas con 97 ítems). No hay comparación directa con otros modelos de la misma categoría en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 5,2 GB para IQ4_XS y unos 4,4 GB para IQ3_M, más la memoria de contexto (32.768 tokens en el ejemplo); con descarga completa a GPU (`-ngl 99`), cabe en GPUs de 8 GB con holgura para contexto moderado.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 8/16 GB, RTX 4070/4090); no se requieren A100 ni H100 al ser un modelo de 9B cuantizado.
- Cabe en GPUs consumer: sí, ambas cuantizaciones están diseñadas explícitamente para ejecución local en escritorio.
- CPU: ejecutable también en CPU pura con llama.cpp, aunque sin datos de latencia publicados.
- Despliegue: llama.cpp (b11724 o superior, obligatorio por los metadatos corregidos de 32 capas), con `llama-server --jinja`; por ser GGUF estándar, debería funcionar también en backends compatibles como Ollama o LM Studio, aunque no se documenta explícitamente.
- Latencia y throughput: no disponibles; los parámetros de muestreo recomendados son temperatura 0,3 y top-p 0,9.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Especializacion | Licencia | Contexto |
|---|---|---|---|---|---|
| Qwen3.5-9B-TR-Hukuk v2.1 | 8,95 B | GGUF (IQ4_XS, IQ3_M) | Derecho turco | proprietary-private | 32.768 (en el ejemplo) |
| Qwen/Qwen3.5-9B (base) | 8,95 B | safetensors | Generalista | no disponible en la informacion proporcionada | no disponible |
| Modelos juridicos turcos comparables (p. ej. derivados de TRLawBench) | no disponible | no disponible | Derecho turco | no disponible | no disponible |

No se han identificado en la información proporcionada alternativas publicas concretas de tamaño similar especializadas en derecho turco para una comparativa numerica detallada.

## Limitaciones y advertencias

- Restricción de licencia severa: licencia proprietary-private con distribución no autorizada prohibida; su uso comercial o redistribución requiere autorización del autor, lo que limita su adopción frente a modelos con licencias abiertas.
- Advertencia explicita del autor: las salidas no sustituyen a una opinion juridica; articulos de ley, citas de sentencias e importes deben verificarse siempre contra la fuente primaria.
- Riesgo de alucinacion de citas: el propio proceso de entrenamiento (DPO contra respuestas con citas de tribunales inexistentes) indica que era la falla dominante del modelo v2; v2.1 la reduce pero no la elimina.
- Especializacion estrecha: el modelo está optimizado para el formato de prompt de la aplicacion PekBilen (documentos como fuente, reglas y plantillas incluidas en el prompt); su rendimiento fuera de ese formato no está evaluado.
- Idioma: la especializacion es en turco; no se documenta rendimiento en otros idiomas.
- Benchmarks limitados: TRLawBench se evalua con 97 preguntas, dentro del margen de ruido (±5), y HukukBERT cloze no muestra mejora entre versiones; las metricas provienen del propio autor y no de una evaluacion independiente.
- Sin capa MTP: los archivos GGUF carecen de la capa de prediccion multi-token del modelo base, lo que puede afectar a la velocidad de decodificacion respecto al original.
- Datos de entrenamiento: 6.013 ejemplos es un conjunto pequeno; posible sobreajuste al dominio y a las plantillas de la aplicacion.
- Sesgos: no se documentan analisis de sesgos; al entrenar con sentencias y legislacion turcas, heredara los sesgos del corpus juridico y del modelo base Qwen3.5-9B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/webbrain-one/qwen3.5-9b-tr-hukuk-v2.1-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/webbrain-one/hukuk-dataset-v2
