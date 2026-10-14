# Word2Li/CoTranslator-4B-Full

## Resumen

CoTranslator-4B-Full es un modelo de lenguaje de 4.022.468.096 parámetros (aproximadamente 4,02 B) desarrollado por Word2Li como parte del trabajo **CoTranslator: Reverse to Forward Chain-of-Thought Translator for Reasoning Distillation**. No es un modelo de propósito general: es un **traductor de trayectorias de razonamiento**. Su tarea consiste en recibir una cadena de pensamiento "reversa" (generada por un teacher que ya conoce la respuesta de referencia) y reescribirla como una trayectoria que se parezca a una solución forward verificada, es decir, a un razonamiento que un estudiante podría haber producido sin acceso a la respuesta. El resultado se usa como supervisión para entrenar modelos estudiantes.

El modelo parte de Qwen/Qwen3-4B-Thinking-2507 y se ha ajustado con supervisión de parámetros completos (full-parameter SFT) sobre el split `full` del dataset Word2Li/CoTranslator-Nemotron-SFT-Math-v4-Pairs, con 266.288 filas en el JSONL de origen antes del preprocesado. El checkpoint liberado corresponde al paso 4.921, con 3 épocas, learning rate 5e-5 y longitud de secuencia de 65.536 tokens.

Su relevancia es metodológica: aborda el problema del "answer leakage" en la destilación de razonamiento, ofreciendo un mecanismo automático para convertir trazas contaminadas por la respuesta en trazas utilizables como datos de entrenamiento. La licencia es Apache-2.0 y los pesos se distribuyen en BF16.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3-4B-Thinking-2507); detalles internos de capas no disponibles |
| Parametros totales | 4.022.468.096 (aproximadamente 4,02 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el entrenamiento uso secuencias de 65.536 tokens |
| Tipos de cuantizacion | no disponible; los pesos se publican en BF16 (dos shards de Safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | Safetensors (BF16, dos shards); tamano del repo 8,1 GB |
| Modelo base | Qwen/Qwen3-4B-Thinking-2507 |
| Tipo de ajuste | Supervised fine-tuning de parametros completos |
| Framework de entrenamiento | Megatron-Swift |
| Plantilla de chat | `qwen3_thinking` |
| Paso del checkpoint | 4.921 |
| Configuracion de decodificacion recomendada | temperature 0.6, top-p 0.95, top-k 20, min-p 0, maximo 32.768 tokens generados |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen3-4B-Thinking-2507, un transformer decoder-only con modo de pensamiento explícito (etiquetas `<think>...</think>`). Sobre esa base, CoTranslator-4B-Full se ha ajustado con supervisión completa de parámetros durante 3 épocas, con learning rate 5e-5, scheduler coseno con warmup del 10 %, weight decay 0,1, Adam con beta1 0,9 y beta2 0,95, gradient clipping de 1,0 y semilla 42. El entrenamiento se hizo con Megatron-Swift, con packing activado, precisión BF16, batch global de 32, batch micro de 2 y secuencia de 65.536 tokens; los ejemplos que superaban ese límite se descartaron en el preprocesado, por lo que las 266.288 filas del JSONL de origen no equivalen al número final de ejemplos entrenados.

La innovación técnica es la propia formulación del problema. El teacher genera una trayectoria reversa condicionada por la respuesta de referencia mediante un prompt de supresión semántica. El traductor recibe esa trayectoria (razonamiento y respuesta final) y se entrena para producir la respuesta forward correspondiente del dataset Nemotron original, que solo ve la pregunta y que ha sido aceptada por un verificador de respuestas. En inferencia, la entrada es una instrucción de sistema fija ("You are a reasoning trajectory refiner. Given a teacher-generated solution trajectory, produce a more natural reasoning trajectory. Preserve the mathematical conclusion and answer format.") más un mensaje de usuario con el bloque `<think>{{reasoning_content}}</think>{{content}}`. El manuscrito condiciona el traductor únicamente a la trayectoria: el problema y la respuesta de referencia se usan para el emparejamiento y la verificación, no como entrada del modelo. No se documenta en la información disponible ninguna fase de RLHF, DPO o decodificación especulativa.

## Capacidades

- Reescritura de trayectorias de razonamiento: convierte una cadena de pensamiento generada con acceso a la respuesta en una traza con aspecto de solución forward verificada.
- Preservación de la conclusión matemática y del formato de respuesta, tal como exige su instrucción de sistema.
- Razonamiento matemático paso a paso, heredado del ajuste sobre el dataset Nemotron-SFT-Math-v4 y del modelo base Qwen3-4B-Thinking-2507.
- Modo de pensamiento explícito (bloques `<think>`), con una longitud de generación configurada de hasta 32.768 tokens nuevos.
- Generación condicionada por trayectoria: no requiere el enunciado del problema ni la respuesta de referencia en el momento de la inferencia.
- Producción de datos de supervisión a escala: cada salida es un ejemplo potencial de entrenamiento para un modelo estudiante.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas como tales; el modelo opera en un único paso de traducción de trayectoria.
- Capacidades multilingües: no; el modelo declara únicamente inglés (`en`) y su dataset de entrenamiento es de matemáticas en inglés.
- Visión o audio: no disponibles.

## Casos de uso

- Destilación de razonamiento a escala: dado un conjunto de trayectorias reversas generadas por un teacher grande con acceso a la respuesta, CoTranslator-4B-Full las reescribe en lote y el resultado se usa como corpus de SFT para un estudiante pequeño. Es el caso de uso central del trabajo y el único validado en el manuscrito.
- Eliminación de "answer leakage" en corpus existentes: si un dataset de cadenas de pensamiento contiene razonamientos que "hacen trampa" porque citan la respuesta antes de deducirla, el modelo los normaliza a una forma forward sin alterar la conclusión matemática.
- Generación de datos sintéticos de matemáticas para investigación: construir pares (problema, solución razonada) verificables a partir de trazas de teacher, con verificación posterior mediante el propio verificador de respuestas del pipeline.
- Auditoría y comparación de teachers: traducir las trayectorias de distintos modelos y comparar la calidad de sus razonamientos en un formato homogéneo, útil para decidir qué teacher usar para destilar.
- Estudio de fidelidad de la cadena de pensamiento: analizar si una trayectoria reescrita mantiene la misma conclusión que la original permite medir cuánta información de la respuesta se filtraba en la traza reversa.
- Normalización de formato en pipelines de evaluación: unificar trazas heterogéneas (distintos estilos de `<think>`, distintos formatos de respuesta final) a la plantilla `qwen3_thinking` antes de pasarlas a un evaluador automático de matemáticas.
- Herramienta docente como componente de un sistema mayor: el modelo puede integrarse como paso de refinado en una aplicación que explique soluciones paso a paso, aunque por sí solo no está diseñado para conversación abierta con usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card y los metadatos de HuggingFace no incluyen cifras de MMLU, GSM8K, MATH, HumanEval ni de ninguna otra evaluación, ni para este checkpoint ni en comparación con el modelo base.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 8 GB en BF16 (los 4.022.468.096 parámetros ocupan unos 8 GB, coherente con el repositorio de 8,1 GB), alrededor de 4,5 GB en FP8/INT8 y alrededor de 2,5-3 GB en cuantización de 4 bits. Estimaciones derivadas del recuento de parámetros, no confirmadas por el autor.
- VRAM adicional para caché KV: relevante en este modelo, ya que la decodificación recomendada permite generar hasta 32.768 tokens nuevos sobre un prompt potencialmente largo (entrenamiento con secuencias de 65.536 tokens). Con contextos largos el caché KV puede superar el tamaño de los propios pesos.
- GPU consumer: los pesos en BF16 caben en una RTX 4090 (24 GB) o una RTX 3090 (24 GB) con margen para contexto moderado; en cuantización de 4 bits caben en GPUs de 8-12 GB, aunque con limitaciones de longitud de contexto.
- GPU de datacenter: A100 40/80 GB, H100 80 GB o L40S son adecuadas, especialmente si se procesan secuencias cercanas a los 65.536 tokens de entrenamiento o se sirve en lote.
- Despliegue: la model card valida `transformers` (versión 5.12.1 para guardar la configuración) junto con `accelerate` y `torch`, con `device_map="auto"`. El repositorio incluye la etiqueta `text-generation-inference`, por lo que TGI es una vía de despliegue soportada; vLLM es una opción habitual para modelos Qwen3 con safetensors. Para llama.cpp u Ollama sería necesaria una conversión a GGUF que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CoTranslator-4B-Full | 4,02 B | no disponible (entrenamiento a 65.536 tokens) | Traductor de trayectorias reverse-to-forward | Apache-2.0 | HuggingFace, safetensors BF16 |
| CoTranslator-4B | no disponible | no disponible | Traductor de trayectorias (variante companera) | no disponible en la informacion proporcionada | HuggingFace |
| Qwen/Qwen3-4B-Thinking-2507 | aproximadamente 4 B (modelo base) | no disponible en la informacion proporcionada | LLM generalista con modo thinking, generacion de texto y razonamiento | Apache-2.0 | HuggingFace |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de estos modelos entre sí, ni de otras alternativas de la misma categoría (modelos traductores de cadenas de pensamiento) en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: no es un asistente conversacional ni un LLM de propósito general. Usarlo fuera del caso de traducción de trayectorias producirá resultados degradados.
- Dependencia del formato de entrada: espera exactamente la instrucción de sistema y el bloque `<think>{{reasoning_content}}</think>{{content}}`. Desviarse de ese formato no está cubierto por el entrenamiento.
- Solo inglés: el campo `language` declara únicamente `en` y el dataset es de matemáticas en inglés. El rendimiento en castellano o en otros idiomas no está evaluado.
- Dominio restringido a matemáticas: el entrenamiento proviene de Nemotron-SFT-Math-v4; no hay evidencia de transferencia a código, derecho, medicina u otros dominios.
- Riesgo de alucinación: como todo modelo generativo, puede producir una trayectoria formalmente plausible pero con un paso inválido o con una conclusión distinta de la original. El manuscrito usa verificación de respuestas, lo que implica que la salida del traductor no debe considerarse correcta por defecto.
- Ausencia de métricas publicadas: no hay benchmarks ni tasas de fidelidad publicadas que permitan fijar expectativas de calidad antes de desplegarlo.
- Datos de entrenamiento opacos: aunque el dataset está referenciado (Word2Li/CoTranslator-Nemotron-SFT-Math-v4-Pairs), la información disponible no detalla su composición, sesgos ni las licencias específicas de las fuentes originales.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificación, pero conviene verificar la licencia del modelo base y la de los datos de origen antes de un uso en producción.
- Cero tracción en el ecosistema: 0 descargas y 0 likes en el momento de la consulta, con creación y última actualización en la misma fecha (14 de octubre de 2026). No hay comunidad ni soporte más allá de la model card.
- Requisito de versión: la configuración se guardó con Transformers 5.12.1; conviene usar una versión reciente para evitar problemas de carga de configuración y tokenizer.
- La decodificación con hasta 32.768 tokens nuevos implica coste de cómputo y de memoria elevado por petición, poco adecuado para servicios interactivos de baja latencia.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces encontrados no guardan relación con el proyecto y se han descartado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Word2Li/CoTranslator-4B-Full
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507/blob/main/LICENSE
- Checkpoint companero: https://huggingface.co/Word2Li/CoTranslator-4B
- Dataset de pares: https://huggingface.co/datasets/Word2Li/CoTranslator-Nemotron-SFT-Math-v4-Pairs
- Paper (CoTranslator: Reverse to Forward Chain-of-Thought Translator for Reasoning Distillation): no disponible, no se ha encontrado enlace en la informacion proporcionada
- Repositorio de codigo: no disponible
- Demo: no disponible
