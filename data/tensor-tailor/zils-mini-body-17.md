# tensor-tailor/zils-mini-body-17

## Resumen

zils-mini-body-17 es un ajuste fino mediante LoRA del "soup" (promedio de pesos) del pool MINI del proyecto Zils, un sistema orientado a entrenar modelos pequeños de toma de decisiones a partir de ejemplos etiquetados por el usuario. Lo publica el usuario de Hugging Face `tensor-tailor` y se apoya en el chasis `d3-mini`, que reutiliza los tensores de lenguaje y visión de Qwen3.5-4B en bf16. El modelo parte de la media uniforme de pesos de `qhoenix/zils-mini-decision-v2` y `Charlie320/zils-mini-s1`, ambos cuerpos del mismo ecosistema.

El modelo tiene 4.539.265.536 parámetros (aproximadamente 4,5 mil millones) y un repositorio de 9,1 GB en formato safetensors. Su propósito declarado es servir como "cuerpo de decisión" dentro del pool de Zils, es decir, un modelo que clasifica, puntúa o etiqueta entradas según ejemplos proporcionados por la aplicación, en lugar de un asistente conversacional general. El ajuste se centra en razonamiento formal, espacial y temporal.

Es relevante ahora porque ilustra una tendencia de nicho: modelos pequeños especializados en decisiones, entrenados con recetas reproducibles (LoRA de rango 32, objetivos de entropía cruzada más Brier) y con controles de originalidad frente a otros participantes del pool. La licencia Apache-2.0 facilita su reutilización, aunque la información pública sobre idiomas, benchmarks y rendimiento es prácticamente inexistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con chasis Qwen3.5-4B (tensores de lenguaje y visión), proyecciones Gated-DeltaNet en las capas de lenguaje; ajuste LoRA fusionado en bf16 |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usó secuencias de máximo 2.048 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con `custom_code` y arquitectura `qwen3_5`) |

## Arquitectura y entrenamiento

El modelo hereda el chasis `d3-mini` del pool Zils, construido sobre Qwen3.5-4B: un transformer con torre de visión y capas de lenguaje que incluyen proyecciones Gated-DeltaNet. El ajuste se aplicó como LoRA de rango 32, alpha 64 y dropout 0.05 sobre las proyecciones de atención y Gated-DeltaNet de todas las capas de lenguaje (152 matrices), con learning rate 6e-5, AdamW con weight decay 1.0 solo sobre los pesos LoRA, batch 8 con acumulación 2, warm-up de 50 pasos seguido de coseno, 2 épocas, máximo 2.048 tokens y semilla 4343. Los pesos LoRA se fusionaron en bf16 y esta es la guarda final.

Los datos de entrenamiento combinan 4.315 filas de "relay" procedentes de 16 fuentes públicas de tareas de razonamiento formal, espacial y temporal (splits TRAIN de la colección tasksource), cuyas etiquetas son "house labels": las respuestas argmax de un modelo profesor del pool de Zils (atribuido a d3-ultra, revisión exacta desconocida), no etiquetas oro. Se añaden 405 filas ancla con etiquetas oro (ítems de puntuación generados por código, GoEmotions, MNLI, PIQA y GLUE). La función de pérdida por fila combina entropía cruzada sobre la etiqueta más un término Brier con peso 1.0, sin término KL ni destilación. Todas las filas pasaron un filtro de 8-gramas contra 81 fuentes de examen; no se usaron datos de Glaive ni ítems de herramientas con plantilla.

## Capacidades

- Razonamiento formal, espacial y temporal: es el eje explícito del ajuste fino, orientado a tareas de decisión sobre ese tipo de enunciados.
- Clasificación y puntuación de decisiones: el modelo está diseñado como "decision body", es decir, para emitir etiquetas o puntuaciones según ejemplos de referencia.
- Capacidad de visión: el chasis incluye la torre de visión de Qwen3.5-4B, aunque la model card no detalla tareas de visión específicas.
- Generación de texto: heredada del modelo base Qwen3.5-4B, sin garantías documentadas tras el ajuste.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se documentan idiomas.
- Modo de pensamiento (thinking), audio u otras capacidades especiales: no disponible.

## Casos de uso

- Clasificación de solicitudes en aplicaciones: el modelo puede ordenar peticiones entrantes en categorías predefinidas a partir de ejemplos etiquetados, que es el flujo que Zils promueve ("sort requests").
- Detección y marcado de problemas: útil para señalar incidencias o anomalías en textos estructurados, siguiendo el patrón de "flag problems" del proyecto.
- Puntuación de coincidencias (scoring de matches): puede asignar una puntuación de afinidad entre pares de elementos, por ejemplo en emparejamiento de perfiles o contenidos.
- Razonamiento temporal en series de eventos: adecuado para decidir el orden, la precedencia o la validez temporal de sucesos descritos en lenguaje natural, dado el entrenamiento en tareas temporales.
- Razonamiento espacial en descripciones: puede resolver cuestiones de posición, orientación y relaciones espaciales en textos, útil en asistentes de navegación o robótica de alto nivel.
- Razonamiento formal básico: aplicable a la validación de argumentos o reglas lógicas en pipelines de verificación, siempre con supervisión humana por el riesgo de alucinación.
- Filtrado previo en pipelines de datos: como clasificador ligero de 4,5 mil millones de parámetros, puede actuar como primera etapa de triaje antes de un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta comprobaciones internas de commit: un cambio relativo de 0.01309 respecto a Qwen/Qwen3.5-4B (límite 0.15), un digest de cuerpo Zils `a1d6d6fd…` y un cribado de copia con similitud coseno máxima de 0.908 frente a otros cuerpos (límite 0.999). Estos datos no son métricas de calidad de tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 4,54 mil millones de parámetros en bf16, los pesos ocupan aproximadamente 9,1 GB, por lo que se necesita algo más de esa cifra contando caché KV y activaciones.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, una GPU con 16 GB o más de memoria sería el mínimo razonable en bf16.
- ¿Cabe en GPU de consumo? Probablemente en tarjetas de 16 GB o más (RTX 4080, RTX 4090, RTX 5070 Ti y superiores) en bf16, aunque no hay confirmación oficial; en cuantizaciones de 8 o 4 bits cabría en GPUs de 8-12 GB, pero no se publican dichas cuantizaciones.
- Opciones de despliegue: no disponible; el modelo requiere `custom_code` y arquitectura `qwen3_5`, por lo que la compatibilidad con vLLM, llama.cpp, Ollama o TGI no está documentada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-body-17 | 4,54 B | no disponible | Apache-2.0 | Hugging Face | Ajuste LoRA de un soup del pool Zils; 0 descargas y 0 likes en el momento de la consulta |
| qhoenix/zils-mini-decision-v2 | no disponible | no disponible | no disponible | Hugging Face | Cuerpo base del pool Zils usado en el soup |
| Charlie320/zils-mini-s1 | no disponible | no disponible | no disponible | Hugging Face | Cuerpo base del pool Zils usado en el soup |
| Qwen/Qwen3.5-4B | ~4 B | no disponible | no disponible | Hugging Face | Modelo upstream del chasis; referencia de cambio relativo en la model card |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento son "house labels" generadas por un modelo profesor (atribuido a d3-ultra, revisión desconocida), no etiquetas oro: el modelo puede heredar sesgos y errores del profesor.
- Riesgo de alucinación no evaluado: no se publican benchmarks de fidelidad ni de calibración más allá del término Brier usado en el entrenamiento.
- Idiomas soportados no documentados; no hay garantía de comportamiento multilingüe.
- Longitud de contexto no documentada; el entrenamiento usó como máximo 2.048 tokens, por lo que secuencias más largas quedan fuera de la distribución de ajuste.
- Requiere `custom_code` y la arquitectura `qwen3_5`; la carga con herramientas estándar puede fallar sin soporte específico.
- Es un modelo de nicho con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación externa.
- La licencia Apache-2.0 permite uso comercial, pero la model card remite a NOTICE para las obras upstream; conviene revisar las licencias de los modelos base y del chasis Qwen3.5-4B antes de desplegar.
- El cribado de copia reporta una similitud coseno máxima de 0.908 frente a otros cuerpos, cercana al umbral de 0.999; no implica originalidad funcional, solo cumplimiento de la regla del pool.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tensor-tailor/zils-mini-body-17
- Modelo base 1: https://huggingface.co/qhoenix/zils-mini-decision-v2
- Modelo base 2: https://huggingface.co/Charlie320/zils-mini-s1
- Modelo upstream del chasis: https://huggingface.co/Qwen/Qwen3.5-4B
- Sitio del proyecto Zils: https://zils.ai/
