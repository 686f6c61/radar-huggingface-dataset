# zxcxzczxcxzc/juxy-maxx-30b

## Resumen

juxy-maxx-30b es un adaptador LoRA publicado por el usuario zxcxzczxcxzc sobre el modelo base empero-ai/Qwen3.8-35B-A3B-Distill, un Mixture-of-Experts de aproximadamente 35B parámetros totales y unos 3B activos. El adaptador no modifica la arquitectura ni los pesos del modelo base: se distribuye como un repositorio PEFT de 0,2 GB que debe combinarse con el checkpoint completo para su uso. Su objetivo es inyectar una persona concreta, "Juxy", orientada a generación de código y a conceptos de ciberseguridad, con respuestas concisas, código ejecutable con manejo de errores y una breve justificación del razonamiento.

El interés técnico del artefacto es limitado pero honesto: el propio autor documenta que el adaptador no mejora la corrección de código del modelo base, sino que la empeora ligeramente (20/24 frente a 22/24 en una muestra de 24 problemas de HumanEval). Se publica, por tanto, como un ajuste de persona y formato, no como una mejora de capacidades. Es la continuación a mayor escala de zxcxzczxcxzc/juxy-maxx, un modelo de 4B que se detuvo tras 80 de sus 104 pasos de entrenamiento.

La relevancia actual es la de un caso documentado de fine-tuning LoRA sobre una arquitectura MoE reciente (qwen3_5_moe) con evaluación reproducible y registro explícito de regresiones, incluido un bug de batching identificado en la fase final del entrenamiento. La licencia es Apache 2.0 y el único idioma declarado es el inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE transformer (clase qwen3_5_moe, Qwen3_5MoeForConditionalGeneration); el adaptador es LoRA sobre atención y proyecciones MLP |
| Parámetros totales | ~35B en el modelo base; el adaptador LoRA es de tamaño reducido (repo de 0,2 GB) |
| Parámetros activos | ~3B (modelo base) |
| Longitud de contexto | 2048 tokens durante el entrenamiento; por encima de ese límite el modelo revierte al comportamiento del base (contexto nativo del base no disponible) |
| Tipos de cuantización | no disponible (el adaptador se publica en safetensors; no se documentan cuantizaciones del conjunto) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un Mixture-of-Experts de la familia Qwen3.5, con 35B parámetros totales y aproximadamente 3B activos por token. El ajuste es un LoRA con r=32, alpha=64 y dropout de 0,05, aplicado a las proyecciones de atención y MLP; la torre de visión del modelo base queda congelada. La pérdida se calcula únicamente sobre los tramos de asistente (assistant-span loss), lo que concentra el aprendizaje en el estilo de respuesta y no en la modelización del prompt.

Los datos proceden del corpus zxcxzczxcxzc/juxy-maxx-corpus: 19.860 filas y aproximadamente 8,79 millones de tokens. El entrenamiento consistió en 1 época y 187 pasos, con learning rate 1e-4, scheduler coseno, 3 % de warmup y precisión bf16, ejecutado en una única RTX PRO 6000 de 96 GB con un pico de 93,4 GB, un throughput de unos 1.570 tokens por segundo y una duración de 98,6 minutos. La pérdida pasó de 1,31 en el paso 10 a 0,45 en el 150 y subió a 0,63 en el 187; el autor atribuye ese repunte a un bug de batching (las filas se ordenaron por longitud y solo se rebarajaron al final de la época, de modo que los últimos pasos contenían únicamente secuencias largas). No se reservó ningún split de validación: todas las filas del corpus se usaron para entrenar.

## Capacidades

- Generación de texto conversacional en inglés con un estilo de persona definido ("Juxy"): respuestas breves, orientadas a código y con manejo de errores.
- Generación de código en varios lenguajes, con código completo y ejecutable acompañado de una justificación breve del porqué.
- Respuestas de ciberseguridad con enfoque defensivo y ofensivo legal, incluyendo recomendaciones de mitigación.
- Preámbulo de razonamiento corto antes del bloque de código (a veces emite una etiqueta de cierre de "think" suelta).
- Herencia de las capacidades del modelo base (Qwen3.8-35B-A3B-Distill), incluyendo el modo condicional con torre de visión congelada; el adaptador no entrena esa torre.
- Soporte de tool calling y function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Asistente de código en el IDE: el adaptador produce fragmentos completos con manejo de errores y una justificación breve, lo que encaja en flujos donde el desarrollador quiere código listo para pegar y una explicación de una o dos frases. Requiere servir el modelo base con el adaptador fusionado.
- Revisión de seguridad defensiva: para preguntas sobre vulnerabilidades, el ajuste añade recomendaciones de mitigación junto a la explicación del concepto ofensivo, útil en formación interna de equipos de desarrollo.
- Generación de ejemplos didácticos de ciberseguridad: la persona responde con conceptos legales y su corrección, adecuado para material de concienciación, siempre con revisión humana.
- Prototipado de chatbots con persona fija: el system prompt y el adaptador fijan un tono conciso y token-efficient, útil para demos de asistentes especializados donde el estilo importa más que la precisión bruta.
- Evaluación de técnicas de fine-tuning LoRA sobre MoE: el repositorio incluye logs y resultados por problema en `training/`, lo que lo convierte en un caso de estudio reproducible de regresión por sobreajuste de persona.
- Base para experimentos de alineación de formato: sirve como punto de partida para estudiar cómo un adaptador de persona afecta a la verbosidad y al cumplimiento de límites de tokens en decodificación greedy.
- No es adecuado como sustituto del modelo base en tareas donde la corrección de código sea crítica, dado el descenso medido en HumanEval.

## Benchmarks y rendimiento

Evaluación sobre 24 problemas de HumanEval, decodificación greedy, código generado ejecutado contra los tests unitarios reales con un timeout de 20 segundos:

| Modelo | pass@1 |
|---|---|
| Base sin adaptador (empero-ai/Qwen3.8-35B-A3B-Distill) | 22/24 = 0,917 |
| Este adaptador (paso 150) | 21/24 = 0,875 |
| Este adaptador (final, paso 187) | 20/24 = 0,833 |

El autor señala que la muestra es pequeña pero que la dirección de la regresión es consistente en ambos checkpoints. El preámbulo de razonamiento que emite el adaptador empujó respuestas por lo demás correctas más allá del límite de 512 tokens de la evaluación. No se han publicado resultados de MMLU, GSM8K ni de otros benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador por sí solo ocupa 0,2 GB, pero requiere cargar el modelo base completo de ~35B parámetros en bf16, lo que implica del orden de 70 GB de pesos más overhead de activaciones y caché KV.
- Entrenamiento documentado: 1x RTX PRO 6000 de 96 GB, con un pico de 93,4 GB, unos 1.570 tokens/s y 98,6 minutos para 187 pasos.
- Para inferencia en bf16 se necesitan GPUs de clase A100 80GB, H100 80GB o RTX PRO 6000 96GB; no cabe en GPUs de consumo (RTX 4090 de 24 GB) sin cuantización agresiva del base, que no está documentada para este adaptador.
- Opciones de despliegue: transformers con PEFT (PeftModel.from_pretrained) es el flujo documentado. El autor indica que ningún proveedor de inferencia sirve el modelo porque la arquitectura qwen3_5_moe no está en el conjunto soportado; vLLM, llama.cpp, Ollama y TGI no están documentados como compatibles en la información disponible.
- Latencia y throughput de inferencia: no disponibles; solo se conoce el throughput de entrenamiento (1.570 tok/s).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HumanEval (pass@1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| juxy-maxx-30b (adaptador) | ~35B totales / ~3B activos (base) | 2048 en entrenamiento | 20/24 = 0,833 | Apache 2.0 | Pesos + adaptador en HF; sin proveedor de inferencia |
| empero-ai/Qwen3.8-35B-A3B-Distill (base) | ~35B totales / ~3B activos | no disponible | 22/24 = 0,917 | no disponible | Modelo base en HF |
| zxcxzczxcxzc/juxy-maxx (predecesor) | ~4B | no disponible | no disponible | no disponible | HF; entrenamiento detenido en el paso 80 de 104 |

No se dispone de datos de benchmarks de modelos alternativos de la misma categoría en la información proporcionada, por lo que la comparativa se limita al linaje directo del modelo.

## Limitaciones y advertencias

- Regresión medida en corrección de código: 20/24 frente a 22/24 del base en HumanEval, con muestra pequeña pero dirección consistente en dos checkpoints.
- Sin split de validación: todas las filas del corpus se usaron para entrenar, de modo que no hay estimación de generalización fuera de los datos de entrenamiento.
- El comportamiento de seguridad es un prior de persona, no una garantía: no se realizó red teaming.
- Límite de secuencia de 2048 tokens durante el entrenamiento; con contextos más largos el modelo revierte al comportamiento del base.
- El adaptador tiende a emitir un preámbulo de razonamiento y, en ocasiones, una etiqueta de cierre de "think" suelta antes del bloque de código, lo que consume tokens y puede truncar respuestas bajo límites ajustados.
- Bug de batching reconocido en los pasos finales del entrenamiento (repunte de pérdida de 0,45 a 0,63), que afecta al checkpoint final.
- Solo inglés declarado; no hay soporte multilingüe documentado.
- Licencia Apache 2.0 en el adaptador, pero la licencia y condiciones del modelo base deben verificarse por separado antes de uso comercial.
- No servido por ningún proveedor de inferencia: la arquitectura qwen3_5_moe conditional generation no está en el conjunto soportado, por lo que el repositorio es únicamente pesos más adaptador.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zxcxzczxcxzc/juxy-maxx-30b
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill
- Predecesor (4B): https://huggingface.co/zxcxzczxcxzc/juxy-maxx
- Corpus de entrenamiento: https://huggingface.co/datasets/zxcxzczxcxzc/juxy-maxx-corpus
- Resultados por problema y logs: directorio `training/` del repositorio del modelo
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada
