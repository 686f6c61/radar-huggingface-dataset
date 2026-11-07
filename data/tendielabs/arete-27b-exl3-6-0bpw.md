# TendieLabs/Arete-27B-EXL3-6.0bpw

## Resumen

Arete-27B-EXL3-6.0bpw es una cuantización en formato EXL3 (ExLlamaV3) a 6.0 bits por peso del modelo NousResearch/Arete-27B, publicada por el usuario TendieLabs. El modelo base, desarrollado por Nous Research, es un post-entrenamiento sobre Qwen3.8-27B (la variante de 27B de la familia Qwen3 de Alibaba) orientado a reforzar lo que el autor denomina "valores occidentales" sobre un modelo de origen chino. La model card original del repositorio es prácticamente vacía (solo contiene la línea "eta son (1h)"), por lo que la mayor parte de la información técnica debe inferirse del modelo base y del formato de cuantización.

La relevancia de esta ficha es doble: por un lado, documenta una cuantización de 6.0 bpw pensada para inferencia eficiente con ExLlamaV3, lo que permite ejecutar un modelo de 27B en GPUs de consumo con VRAM limitada; por otro, sirve de punto de entrada al modelo base Arete-27B, cuyos detalles de entrenamiento y evaluación solo están parcialmente publicados en el blog de Nous Research.

No se dispone de información sobre el pipeline, los idiomas soportados ni los resultados de benchmarks específicos de esta cuantización. Todos los datos que se indican a continuación proceden de la información proporcionada y del modelo base referenciado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B, según el blog de Nous Research) |
| Parametros totales | 27B (modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 6.0 bits por peso (bpw) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | EXL3 (ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo base NousResearch/Arete-27B es, según la información pública de Nous Research, un post-entrenamiento sobre Qwen3.8-27B, la variante de 27B de la familia Qwen3 de Alibaba. El objetivo declarado del post-entrenamiento es reforzar "valores occidentales" sobre un modelo entrenado originalmente con datos y alineamiento de origen chino, y el autor midió el cambio con una evaluación de 803 prompts repartidos en siete categorías de valores. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO u otras.

Esta ficha corresponde a una cuantización EXL3 a 6.0 bpw del citado modelo base, generada con las herramientas de ExLlamaV3. La cuantización EXL3 aplica cuantización por grupos con escalas y compensación de errores, lo que a 6.0 bpw suele preservar la calidad del modelo original con una reducción de VRAM de aproximadamente el 60 % respecto a FP16. No se dispone de información sobre el proceso exacto de cuantización, el tamaño de grupo ni las capas excluidas.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Qwen3.8-27B.
- Capacidades multilingües: no confirmadas en la información disponible; el modelo base Qwen3 suele cubrir múltiples idiomas, pero no se especifica para Arete-27B.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Modo "thinking" o razonamiento extendido: no confirmado en la información disponible.
- Visión o audio: no disponible.
- Alineamiento orientado a "valores occidentales" según el post-entrenamiento de Nous Research, medido con una evaluación de 803 prompts en siete categorías.

## Casos de uso

- Evaluación de alineamiento y sesgos: el modelo base se diseñó para medir el desplazamiento de valores tras un post-entrenamiento; esta cuantización permite reproducir esas evaluaciones con menor coste de VRAM en un equipo local.
- Investigación sobre cuantización: comparar la calidad de EXL3 a 6.0 bpw frente al modelo en FP16 o BF16 en tareas de razonamiento y generación, usando el mismo prompt set de 803 ejemplos.
- Despliegue local en GPUs de consumo: al ocupar aproximadamente 20 GB en VRAM, un modelo de 27B puede ejecutarse en GPUs como la RTX 4090 (24 GB) o la RTX 3090 (24 GB) con ExLlamaV3.
- Generación de texto asistida por ordenador en entornos con recursos limitados: redacción, resumen y reescritura de documentos en una estación de trabajo con una sola GPU.
- Prototipado de asistentes conversacionales: usar el modelo cuantizado para validar flujos multi-turno antes de migrar a una versión de mayor precisión o a un despliegue en servidor.
- Experimentación con alineamiento: comparar respuestas del modelo base y de la cuantización en las siete categorías de valores del eval de Nous Research para estudiar la robustez del alineamiento frente a la cuantización.
- Fine-tuning ligero o evaluación de adaptadores: servir como base cuantizada para pruebas de adaptadores LoRA en escenarios con presupuesto de VRAM ajustado (aunque el fine-tuning sobre EXL3 no es el flujo habitual).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta cuantización. El blog de Nous Research menciona una evaluación de 803 prompts en siete categorías de valores para el modelo base, pero no se proporcionan las puntuaciones numéricas en la información accesible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 20 GB para los pesos a 6.0 bpw (27B × 6 bits / 8 ≈ 20,25 GB), más overhead de contexto y caché KV; se recomienda al menos 22-24 GB para contextos moderados.
- GPU recomendadas: RTX 3090, RTX 4090, RTX 5090 (24-32 GB), A6000 (48 GB), A100 40/80 GB, H100.
- Cabe en GPU de consumo: sí, en RTX 3090 y RTX 4090 con 24 GB, siempre que se limite la longitud de contexto; en GPUs de 16 GB no cabe sin offloading.
- Opciones de despliegue: ExLlamaV3 (formato nativo EXL3), TabbyAPI como servidor compatible con la API de OpenAI; no es compatible directamente con llama.cpp, Ollama ni vLLM sin conversión previa a GGUF u otro formato.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arete-27B-EXL3-6.0bpw (esta ficha) | 27B | no disponible | EXL3 6.0 bpw | Apache 2.0 | Hugging Face |
| NousResearch/Arete-27B (base) | 27B | no disponible | FP16/BF16 | Apache 2.0 | Hugging Face |
| Qwen3.8-27B (modelo de origen) | 27B | no disponible | múltiples | según Qwen | Hugging Face |
| Otras cuantizaciones de Arete-27B | 27B | no disponible | varios formatos | Apache 2.0 | Hugging Face (colección base_model:quantized) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La model card del repositorio está prácticamente vacía ("eta son (1h)"), por lo que no hay documentación del proceso de cuantización ni garantías de calidad.
- El modelo base incorpora un post-entrenamiento explícito para reforzar "valores occidentales"; esto puede introducir sesgos direccionales en las respuestas y debe tenerse en cuenta en aplicaciones sensibles.
- Riesgo de alucinación inherente a los modelos de 27B, no cuantificado en la información disponible.
- La cuantización a 6.0 bpw puede degradar ligeramente tareas sensibles a la precisión numérica (matemáticas, código) respecto al modelo en FP16/BF16; no se han publicado mediciones.
- Idiomas soportados no confirmados; no se garantiza un rendimiento multilingüe homogéneo.
- Longitud de contexto no disponible; debe verificarse en el modelo base antes de usarlo en producción con contextos largos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B puede tener condiciones adicionales que conviene revisar.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- El formato EXL3 requiere ExLlamaV3 o TabbyAPI; no es portable a llama.cpp, Ollama o vLLM sin conversión.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/TendieLabs/Arete-27B-EXL3-6.0bpw
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Blog de Nous Research sobre Arete-27B: https://nousresearch.com/arete
- Colección de cuantizaciones de Arete-27B: https://huggingface.co/models?other=base_model%3Aquantized%3ANousResearch%2FArete-27B
