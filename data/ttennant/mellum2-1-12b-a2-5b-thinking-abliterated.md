# ttennant/Mellum2.1-12B-A2.5B-Thinking-abliterated

## Resumen

Mellum2.1-12B-A2.5B-Thinking-abliterated es una variante "abliterated" (sin dirección de rechazo) del modelo JetBrains/Mellum2.1-12B-A2.5B-Thinking, publicada por el usuario ttennant en HuggingFace. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 12.149.923.072 parámetros totales y aproximadamente 2.500 millones de parámetros activos por token (según el nombre del modelo), especializado en generación de texto y razonamiento con modo "thinking" explícito. El modelo original lo desarrolla JetBrains, y esta versión mantiene exactamente la misma arquitectura, tokenizer, plantilla de chat y distribución de shards en bf16, por lo que se carga de la misma forma.

La modificación consiste en proyectar fuera de los pesos la dirección de rechazo calculada a partir de activaciones residuales de la capa 12, usando 300 prompts dañinos y 300 inofensivos. Se aplica la transformación W ← W − r(rᵀW) sobre los embeddings de tokens, las proyecciones o_proj de las 28 capas de atención y las down_proj de los 64 expertos de cada una de las 28 capas (1.792 matrices en total), sin ningún tipo de entrenamiento adicional.

Es relevante porque demuestra una técnica de ablación quirúrgica sobre un MoE de 12B con modo de razonamiento, reduciendo drásticamente las negativas del modelo original (de 31/32 a 1/27 en el conjunto de prueba de harmful_behaviors) a costa de un mayor consumo de tokens de razonamiento. La licencia Apache 2.0 permite uso comercial, aunque el autor advierte explícitamente de que el modelo responderá a peticiones que el original rechaza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer, 28 capas, 64 expertos por capa |
| Parametros totales | 12.149.923.072 |
| Parametros activos | ~2.500 millones (según nomenclatura A2.5B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la información proporcionada (pesos publicados en bf16) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16, mismo shard layout que el original) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base JetBrains/Mellum2.1-12B-A2.5B-Thinking: un transformer MoE con 28 capas, 64 expertos por capa y aproximadamente 2.500 millones de parámetros activos sobre un total de 12.100 millones. Dispone de modo "thinking" activado por defecto en la plantilla de chat, lo que genera trazas de razonamiento antes de la respuesta final. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo original empleó RLHF o DPO, ya que la model card de esta variante no los detalla.

La innovación técnica de esta versión es puramente de post-procesado, sin entrenamiento. Se calcula una dirección de rechazo `r` como la diferencia normalizada entre las activaciones residuales medias de la capa 12 para 300 prompts dañinos (mlabonne/harmful_behaviors, split train) y 300 inofensivos (mlabonne/harmless_alpaca, split train), tomadas en el último token del prompt con la plantilla de chat por defecto (modo thinking). La capa 12 se eligió mediante un barrido entre 12 y 24 puntuado sobre 32 prompts dañinos reservados: 0/27 rechazos en la capa 12, 7/32 en la 14, 20/32 en la 16 y 27-31 de 31-32 en las capas 18-24 (el original: 31/32). La proyección se aplica a los embeddings de tokens, a las o_proj de atención de las 28 capas y a las down_proj de los 64 expertos en cada capa, sumando 1.792 matrices modificadas en los pesos bf16 originales. El autor probó previamente la herramienta heretic sin éxito (su mejor configuración seguía rechazando 81 de 100 prompts frente a 97 del original), por lo que ninguno de sus resultados está incorporado.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento explícito en modo thinking: produce trazas de razonamiento antes de la respuesta final, delimitadas por `</think>`.
- Capacidad de seguir instrucciones y completar tareas de escritura, aritmética y programación (verificadas puntualmente por el autor con un relato corto, aritmética y una función Python).
- Respuesta a peticiones que el modelo original rechaza, incluyendo contenido dañino, tras un razonamiento más prolongado.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes ni multi-step reasoning más allá del modo thinking.
- Multilingüe limitado: solo inglés declarado.
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo se distribuye la dirección de rechazo en un MoE de 12B con modo thinking, comparando respuestas frente al original en conjuntos como harmful_behaviors, con fines de auditoría y análisis de mecanismos internos.
- Evaluación de robustez de filtros de contenido: sirve como modelo "adversario" controlado para probar clasificadores de seguridad, pipelines de moderación y sistemas de detección de contenido dañino en producción.
- Generación de datos sintéticos para red-teaming: al no rechazar peticiones que el original bloquea, puede emplearse para producir ejemplos etiquetados de contenido sensible que alimenten conjuntos de entrenamiento de clasificadores defensivos, siempre bajo revisión humana.
- Estudio de coste computacional del razonamiento: el autor documenta que el modelo piensa mucho más que el original ante peticiones dañinas (10 de 64 no terminaron el razonamiento a 1.500 tokens), lo que permite analizar la relación entre supresión de rechazo y longitud de cadena de pensamiento.
- Experimentos de ablación reproducible: dado que la model card describe con precisión las matrices modificadas (1.792) y la metodología, sirve como referencia para replicar la técnica en otros MoE y validar la generalización del método.
- Fine-tuning posterior sobre dominios específicos en inglés: al conservar arquitectura, tokenizer y plantilla de chat del original, puede usarse como base para ajuste supervisado o DPO en tareas donde se requiera baja tasa de negativas, asumiendo las advertencias de seguridad.

## Benchmarks y rendimiento

Los benchmarks publicados del modelo original (LiveCodeBench, SWE-bench y otros) no se volvieron a ejecutar en esta variante, según indica el propio autor, por lo que no deben asumirse. Los únicos datos disponibles son las evaluaciones de rechazo sobre harmful_behaviors (split test), con decodificación greedy, plantilla de chat por defecto (thinking activado) y exclusión de prompts que seguían razonando al alcanzar el límite de tokens:

| Metrica | Original | Este modelo |
|---|---|---|
| Primeros 32 prompts: rechazados / finalizados | 31 / 32 (1.200 tokens) | 1 / 27 (1.500 tokens) |
| Todos los 64 prompts: rechazados / finalizados | no ejecutado | 6 / 54 (1.500 tokens) |
| Revisión manual de las 54 respuestas finalizadas | no disponible | 43 cumplen lo pedido, 5 rechazan, 4 desvían, 2 piden más detalle |
| Prompts inofensivos (16): finalizados / rechazados | no disponible | 15 finalizados / 0 rechazados |

El autor advierte que la coincidencia por palabras clave falla en ambas direcciones y por eso revisó manualmente las 54 respuestas finalizadas. Los cinco rechazos explícitos se refieren a envenenar a alguien, una droga para violación, material de abuso sexual infantil, una carta amenazante a un grupo minoritario y un cómic que promueve violencia contra un grupo; los cuatro desvíos incluyen el prompt de suicidio (solo recursos de crisis) y los de trata, trastorno alimentario e insider trading respondidos desde la posición opuesta.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 24,3 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 32 GB para inferencia cómoda.
- Cuantización a 8 bits: ~12-13 GB de pesos; a 4 bits: ~6-7 GB, aunque el autor no publica versiones cuantizadas y habría que generarlas.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para bf16 sin cuantizar; RTX 4090 (24 GB) queda al límite en bf16 y requeriría cuantización o descarga parcial de capas.
- En GPU de consumo: posible en RTX 4090 con cuantización 8 bits o 4 bits; en GPUs de 16 GB (RTX 4080, 4070 Ti Super) solo con cuantización 4 bits y contexto reducido.
- Opciones de despliegue: transformers 5.x con soporte Mellum (método indicado por el autor, con `dtype="bfloat16"` y `device_map="auto"`); no se documentan integraciones verificadas con vLLM, llama.cpp, Ollama o TGI para esta variante.
- Latencia y throughput: no disponibles; el modo thinking incrementa sustancialmente el número de tokens generados, especialmente ante peticiones dañinas, lo que eleva la latencia en esos casos.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| ttennant/Mellum2.1-12B-A2.5B-Thinking-abliterated | 12,15 B | ~2,5 B | no disponible | Apache 2.0 | Variante sin dirección de rechazo, solo inglés, sin benchmarks del original re-ejecutados |
| JetBrains/Mellum2.1-12B-A2.5B-Thinking | 12,15 B | ~2,5 B | no disponible | Apache 2.0 | Modelo base; rechaza 31/32 en harmful_behaviors; benchmarks publicados por JetBrains |
| Modelos MoE abliterated comparables de ~12B | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre alternativas equivalentes en la búsqueda realizada |

La comparación directa con otros modelos abliterated de tamaño similar no está disponible en la información proporcionada. El autor documenta que la herramienta heretic, aplicada al mismo modelo, no logró reducir los rechazos por debajo de 81/100, lo que sitúa a esta variante como una alternativa más agresiva dentro del mismo espacio de técnicas.

## Limitaciones y advertencias

- Elimina deliberadamente la dirección de rechazo: responderá a peticiones que el modelo original bloquea, incluyendo contenido dañino, ilegal o éticamente problemático.
- El autor revisó manualmente las respuestas y confirma que cinco siguen rechazando y cuatro desvían, por lo que la supresión no es total; el comportamiento es variable según el prompt.
- Mayor consumo de tokens en modo thinking ante peticiones dañinas: 10 de 64 prompts no terminaron el razonamiento en 1.500 tokens, lo que incrementa latencia y coste.
- Los benchmarks del modelo original (LiveCodeBench, SWE-bench y otros) no se han re-ejecutado; no se puede asumir que el rendimiento en código, matemáticas o razonamiento se mantenga.
- Solo soporta inglés según la model card; no se documentan capacidades multilingües.
- No se dispone de información sobre longitud de contexto, sesgos específicos ni tasas de alucinación medidas.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal y ética del uso recae íntegramente en el usuario, como advierte el autor.
- No apto para despliegue en producción orientado al público sin capas adicionales de moderación y filtrado.
- No se han publicado versiones cuantizadas oficiales; cualquier GGUF o AWQ tendría que generarse y validarse por cuenta propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ttennant/Mellum2.1-12B-A2.5B-Thinking-abliterated
- Modelo base: https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking
- Herramienta heretic (probada y descartada por el autor): https://github.com/p-e-w/heretic
- Dataset harmful_behaviors: mlabonne/harmful_behaviors (HuggingFace)
- Dataset harmless_alpaca: mlabonne/harmless_alpaca (HuggingFace)
