# tensor-tailor/zils-mini-body-7

## Resumen

zils-mini-body-7 es un fine-tune LoRA de tipo "decision body" desarrollado por el usuario tensor-tailor para el pool de modelos Zils `d3-mini` (Bittensor subnet 127). Se construye sobre el "soup" MINI actual, un promedio uniforme de pesos (media en fp32, canónico en bf16) de los modelos qhoenix/zils-mini-decision-v2 y Charlie320/zils-mini-s1, y se presenta como un cuerpo especializado en razonamiento formal, espacial y temporal.

El modelo emplea el chasis d3-mini, que según la model card corresponde al layout de Qwen3.5-4B (tensores de lenguaje y visión en bf16). Cuenta con 4.539.265.536 parámetros totales según los safetensors del repositorio, con un tamaño de repo de 9,1 GB. El entrenamiento consistió en un LoRA de rango 32 sobre las proyecciones de atención y Gated-DeltaNet de todas las capas de lenguaje (152 matrices), con un objetivo que combina entropía cruzada y pérdida de Brier.

Su relevancia es acotada y muy específica: se trata de una contribución para el ecosistema de minería de Zils, no de un modelo de propósito general con benchmarks publicados. La model card documenta el método de entrenamiento y las comprobaciones de similitud y cambio relativo frente a Qwen3.5-4B, pero no incluye evaluaciones de rendimiento estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5-4B (chasis d3-mini), con capas de atención y Gated-DeltaNet; incluye torre de visión heredada del chasis |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible (el entrenamiento usó un máximo de 2.048 tokens, pero no se especifica la ventana de inferencia) |
| Tipos de cuantización | no disponible (pesos publicados en bf16; no se listan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16), con `custom_code` |

## Arquitectura y entrenamiento

El modelo parte del chasis d3-mini, que la model card describe como el layout de Qwen3.5-4B con tensores de lenguaje y visión en bf16. Sobre ese chasis se aplica un fine-tune LoRA de rango 32, alpha 64 y dropout 0,05 sobre las proyecciones de atención y Gated-DeltaNet de todas las capas de lenguaje (152 matrices). El entrenamiento usó learning rate 6e-5, AdamW con weight decay 1.0 aplicado solo a los pesos LoRA, batch 8 con acumulación 2, warm-up de 50 pasos seguido de decaimiento coseno, 2 épocas, secuencia máxima de 2.048 tokens y semilla 4343. La pérdida por fila combina entropía cruzada sobre la etiqueta de la fila más 1.0 veces la pérdida de Brier, sin término KL ni destilación desde probabilidades de profesor. Los pesos se fusionaron (merge) en bf16.

Los datos de entrenamiento se componen de 4.315 filas de tipo "relay" procedentes de 16 fuentes públicas de tareas de razonamiento formal, espacial y temporal (splits TRAIN de la colección tasksource), cuyas etiquetas son "HOUSE labels": las respuestas argmax de un modelo profesor de la casa Zils (atribuido a d3-ultra, revisión exacta desconocida), no etiquetas gold. Se añaden 405 filas ancla con etiquetas gold (ítems de puntuación generados por código, GoEmotions, MNLI, PIQA y GLUE). El autor indica que no se usaron salidas de otros mineros como objetivos, que todas las filas pasaron un filtro de 8-gramas contra 81 fuentes de examen (0 coincidencias) y que no se incluyó datos de Glaive ni ítems de herramientas con plantilla.

## Capacidades

- Generación de texto y razonamiento sobre el chasis Qwen3.5-4B heredado del modelo base.
- Especialización declarada en razonamiento formal, espacial y temporal, derivada de las 16 fuentes de tareas usadas en el fine-tune.
- Capacidades de visión heredadas de la torre de visión del chasis d3-mini (Qwen3.5-4B), aunque no se documenta su evaluación tras el fine-tune.
- Soporte de tool calling: no disponible en la información proporcionada (el autor indica explícitamente que no se usaron ítems de herramientas con plantilla en el entrenamiento).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- Evaluación de modelos de decisión en el pool Zils: el modelo está diseñado como "decision body" para el pool `d3-mini` de Bittensor subnet 127, por lo que su uso principal es participar en la minería y evaluación de dicho pool conforme a las reglas de Zils.
- Experimentación con razonamiento formal: útil como punto de partida para investigar cómo un fine-tune LoRA sobre un soup afecta al comportamiento en tareas de lógica formal, dado que el autor documenta el método y las comprobaciones de similitud.
- Razonamiento espacial y temporal en tareas estructuradas: las 16 fuentes de tareas de razonamiento espacial y temporal sugieren aplicabilidad en problemas de relaciones espaciales y secuencias temporales, aunque sin benchmarks publicados que lo confirmen.
- Investigación sobre etiquetas "house" frente a gold: el modelo es un caso de estudio para analizar el efecto de entrenar con etiquetas argmax de un profesor (house labels) combinadas con un pequeño conjunto de etiquetas gold (405 filas ancla).
- Reproducción de fine-tunes LoRA sobre soups: la model card detalla hiperparámetros, composición de datos y filtros de contaminación, lo que facilita reproducir o auditar el proceso en entornos de investigación.
- Base para fine-tunes posteriores dentro del ecosistema Zils: al ser un cuerpo del pool, puede servir como punto de partida para nuevas variantes que la guía de minería permita ajustar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta comprobaciones internas del autor, que no constituyen una puntuación oficial:

| Comprobación | Resultado |
|---|---|
| Cambio relativo frente a Qwen/Qwen3.5-4B (Zils relative change) | 0,01309 (límite 0,15) |
| Digest del cuerpo Zils | a1d6d6fded624a2479c6a3074d175d2677c8b5cd3bdccae071d50f8d5dbaa591 |
| Pantalla de copia (`soup_copies`, semillas propias) | cuota propia más allá de los cuerpos de la casa, modelos públicos listados, el soup y la release: 0,184-0,197 (línea house-mix 0,05) |
| Coseno máximo frente a esos modelos o cuerpos hermanos | 0,908 (límite 0,999) |

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.539 millones de parámetros en bf16, los pesos ocupan aproximadamente 9,1 GB; se necesita margen adicional para activaciones y caché KV. En cuantización de 8 bits cabría en torno a 5 GB, y en 4 bits en torno a 2,8 GB, aunque el autor no publica variantes cuantizadas.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, una GPU con 16 GB o más (RTX 4090, A100, H100) permitiría inferencia en bf16 con holgura.
- ¿Cabe en GPU de consumo? Con 9,1 GB de pesos en bf16, sí cabría en GPUs de consumo con 12-16 GB o más (por ejemplo, RTX 3060 de 12 GB, RTX 4070 Ti, RTX 4090), siempre que el runtime soporte el código personalizado del modelo.
- Opciones de despliegue: no disponible. El repositorio usa `custom_code` y safetensors, por lo que requiere cargar el código remoto del autor; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| tensor-tailor/zils-mini-body-7 | 4.539 M | no disponible | Apache-2.0 | Fine-tune LoRA del soup MINI de Zils; sin benchmarks publicados |
| qhoenix/zils-mini-decision-v2 | no disponible | no disponible | no disponible | Cuerpo base del soup; relación de fine-tune |
| Charlie320/zils-mini-s1 | no disponible | no disponible | no disponible | Cuerpo base del soup; relación de fine-tune |
| Qwen/Qwen3.5-4B | ~4 B (chasis) | no disponible | no disponible | Chasis de referencia usado en la comprobación de cambio relativo |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento son "house labels" (argmax de un profesor de la casa Zils, revisión exacta desconocida), no etiquetas gold; esto puede introducir sesgos y errores sistemáticos del profesor en el modelo final.
- Solo 405 de las 4.720 filas de entrenamiento tienen etiquetas gold, por lo que la supervisión de calidad es minoritaria.
- No hay benchmarks publicados ni evaluaciones independientes; el rendimiento real en tareas de razonamiento formal, espacial o temporal es desconocido.
- Riesgo de alucinación: no evaluado en la información disponible; aplican los riesgos generales de un modelo de 4 B sin evaluación publicada.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingüe adecuado.
- Longitud de contexto de inferencia no documentada; el entrenamiento se limitó a 2.048 tokens, lo que puede degradar el rendimiento en secuencias más largas.
- El repositorio usa `custom_code`, lo que implica ejecutar código del autor al cargar el modelo; conviene revisarlo antes de usarlo en producción.
- Licencia Apache-2.0 permite uso comercial, pero la model card remite a NOTICE para las obras upstream y sus avisos, que deben respetarse.
- El modelo está orientado a la minería del pool Zils (Bittensor subnet 127); su uso fuera de ese contexto no está validado.
- El autor declara que no se usaron ítems de herramientas con plantilla, por lo que el soporte de tool calling no está garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tensor-tailor/zils-mini-body-7
- Modelo base (soup): https://huggingface.co/qhoenix/zils-mini-decision-v2
- Modelo base (soup): https://huggingface.co/Charlie320/zils-mini-s1
- Chasis de referencia: https://huggingface.co/Qwen/Qwen3.5-4B
- Búsqueda relacionada (modelos de tensor-tailor): https://huggingface.co/models?other=base_model%3Afinetune%3Atensor-tailor%2Fzils-mini-body-2
