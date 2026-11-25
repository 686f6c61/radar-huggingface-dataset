# zybian222/olmo3-7b-omi-olmo-core-muon-adamw-20261121t220749z

## Resumen

OLMo-3 7B OMI SFT (variante muon_adamw) es un ajuste fino supervisado (SFT) del modelo base allenai/Olmo-3-1025-7B, desarrollado por el usuario zybian222. El modelo parte de la familia OLMo 3 de AI2, una línea de modelos totalmente abiertos (pesos, datos y receta de entrenamiento publicados), y se especializa mediante entrenamiento supervisado sobre el dataset NVIDIA OpenMathInstruct-2, orientado a razonamiento matemático y resolución de problemas.

El ajuste se ha realizado con la infraestructura nativa de OLMo-core, empleando empaquetado ("packed SFT") con máscaras de respuesta y atención aislada por documento, lo que evita contaminación cruzada entre ejemplos dentro de un mismo batch empaquetado. El optimizador combina Muon y AdamW, una elección poco habitual que el autor documenta en el fichero run_config.json del repositorio.

Con 7.298.011.136 parámetros y licencia Apache 2.0, el modelo es relevante para quien necesite un modelo de 7B completamente abierto, con trazabilidad de datos y receta, especializado en matemáticas. Su adopción es todavía muy limitada (4 descargas, 0 likes en el momento de la consulta), por lo que debe evaluarse como un experimento reproducible más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OLMo 3; detalles exactos no disponibles en la información proporcionada) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint allenai/Olmo-3-1025-7B, un transformer decoder-only de aproximadamente 7,3 mil millones de parámetros. La información proporcionada no detalla la configuración interna (número de capas, dimensiones, cabezas de atención ni mecanismos específicos como atención lineal o decodificación especulativa); esos datos deben consultarse en la model card del modelo base.

El entrenamiento consiste en un SFT completo ("full run", no LoRA) realizado con OLMo-core, usando empaquetado de secuencias con máscaras de respuesta y atención aislada por documento. El dataset es NVIDIA OpenMathInstruct-2 (licencia CC BY 4.0), centrado en instrucciones y soluciones matemáticas. El optimizador empleado combina Muon y AdamW; los hiperparámetros concretos, la duración del entrenamiento y las diferencias respecto a la receta upstream de AI2 se documentan en run_config.json dentro del repositorio. No se dispone de información sobre uso de RLHF, DPO u otras fases posteriores al SFT.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag conversational).
- Razonamiento matemático y resolución de problemas, derivado del entrenamiento sobre OpenMathInstruct-2.
- Instrucciones en formato chat/SFT, con máscaras de respuesta que favorecen el ajuste a respuestas del asistente.
- Capacidades heredadas del modelo base OLMo-3 (no verificadas de forma independiente en esta variante).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Tutoría matemática automatizada: el modelo puede generar explicaciones paso a paso de problemas aritméticos y algebraicos, aprovechando su entrenamiento sobre OpenMathInstruct-2, que contiene soluciones detalladas.
- Generación de datasets sintéticos de matemáticas: útil para producir pares pregunta-respuesta y ampliar corpus de entrenamiento, con revisión humana posterior por el riesgo de errores.
- Evaluación de pipelines de SFT: sirve como referencia reproducible para comparar recetas de ajuste (Muon+AdamW frente a AdamW estándar) sobre un mismo modelo base.
- Investigación en entrenamiento con empaquetado y máscaras de respuesta: el repositorio documenta la configuración exacta, lo que permite reproducir o modificar el experimento.
- Asistente de resolución de ejercicios en entornos educativos: integrable vía transformers para responder consultas de práctica con contexto de conversación.
- Base para ajustes posteriores específicos de dominio: al ser un SFT completo con licencia Apache 2.0, puede servir de punto de partida para fine-tuning adicional en matemáticas aplicadas o ingeniería.
- Prototipado de chatbots técnicos: con 7B parámetros puede desplegarse en una sola GPU para pruebas internas de conversación con contenido cuantitativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 14,6 GB solo para pesos, más overhead de activaciones y caché KV (estimación típica de 16-20 GB según longitud de contexto).
- VRAM estimada en cuantización de 8 bits: en torno a 7-8 GB para pesos; en 4 bits, unos 4-5 GB (estimaciones generales para un modelo de 7B, no verificadas para esta variante).
- GPU recomendadas: A100 40/80 GB, H100 para entrenamiento o inferencia de alta concurrencia; RTX 4090 (24 GB) suficiente para inferencia en BF16 de una sola petición.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en BF16 y en GPUs de 8-12 GB con cuantización, siempre que se generen pesos cuantizados (no publicados en el repositorio).
- Opciones de despliegue: transformers de forma nativa; vLLM, TGI o llama.cpp/Ollama requerirían conversión o soporte específico de la arquitectura OLMo 3, no confirmado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OLMo-3 7B OMI SFT (este) | 7,30B | No disponible | SFT en matematicas (OpenMathInstruct-2) | Apache 2.0 | Hugging Face, 4 descargas |
| allenai/Olmo-3-1025-7B (base) | ~7B | No disponible | Modelo base generalista | Apache 2.0 (según familia OLMo) | Hugging Face, ampliamente distribuido |
| Qwen2.5-Math-7B | ~7B | No disponible en esta ficha | Matemáticas | No disponible en esta ficha | Hugging Face |
| DeepSeek-Math-7B | ~7B | No disponible en esta ficha | Matemáticas | No disponible en esta ficha | Hugging Face |

La comparación con alternativas matemáticas de 7B se ofrece como referencia de categoría; los datos de contexto y licencia de esos modelos no se han verificado en la información proporcionada y deben consultarse en sus respectivas model cards.

## Limitaciones y advertencias

- Modelo experimental con adopción mínima (4 descargas, 0 likes): no hay evidencia de comunidad ni validación independiente de su calidad.
- No se han publicado benchmarks propios; el rendimiento real en matemáticas es desconocido y no debe asumirse superior al modelo base.
- Riesgo de alucinación en pasos intermedios de razonamiento matemático: los SFT sobre datasets sintéticos pueden reproducir errores del corpus OpenMathInstruct-2.
- Idiomas soportados no documentados: no se garantiza un comportamiento correcto en castellano ni en otros idiomas distintos del inglés.
- Longitud de contexto no especificada: no se puede planificar su uso en tareas de contexto largo sin verificar la configuración del modelo base.
- Ausencia de pesos cuantizados publicados: el despliegue en GPUs de consumo requiere cuantización manual y validación posterior.
- El repositorio ocupa 160,6 GB, muy superior al tamaño de los pesos (unos 14,6 GB en BF16), lo que sugiere la presencia de checkpoints intermedios u otros artefactos; conviene revisar qué se descarga.
- Licencia Apache 2.0 permite uso comercial, pero la procedencia del dataset (CC BY 4.0) y las condiciones del modelo base deben respetarse igualmente.
- El nombre del repositorio incluye una marca temporal futura (20261121) que puede generar confusión sobre la fecha real de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zybian222/olmo3-7b-omi-olmo-core-muon-adamw-20261121t220749z
- Modelo base: https://huggingface.co/allenai/Olmo-3-1025-7B
- Dataset NVIDIA OpenMathInstruct-2: no disponible en la información proporcionada (referenciado en la model card como CC BY 4.0)
- Repositorio OLMo-core: no disponible en la información proporcionada
- Paper o blog de la familia OLMo 3: no disponible en la información proporcionada
