# Zayaan/zils-mini-hm4

## Resumen

zils-mini-hm4 es un ajuste fino mediante LoRA sobre un modelo "soup" (promedio uniforme de pesos) denominado d3-mini, desarrollado por el usuario Zayaan en el contexto de la subred 127 de Bittensor, dedicada a modelos de decisión. El modelo se construye sobre el chasis fijado d3-mini, que utiliza los tensores de lenguaje y visión de Qwen3.5-4B en BF16, y hereda los pesos de la media uniforme de Charlie320/zils-mini-s3l y jaysun007/zils-mini-body-m10, ambos bajo licencia Apache-2.0. Con 4.539.265.536 parámetros, se posiciona como un modelo de aproximadamente 4.500 millones de parámetros orientado a tareas de decisión con resultados verificables.

El modelo resuelve el problema de automatizar decisiones evaluables en dominios como revisión de código, revisión de artículos y patrullaje de ediciones en wikis públicas y servidores Gerrit. A diferencia de un modelo conversacional general, se entrena con registros públicos de decisiones cuyo resultado se conoce, lo que permite evaluarlo contra un "chasis" fijado que aporta la capa de respuesta, el prompt y el runtime. Es relevante ahora porque forma parte de la ronda del 13 de noviembre de 2026 de la citada subred, y su metodología y datos de evaluación se publicarán tras la ronda del 14 de noviembre.

La información disponible es limitada: la model card indica explícitamente que los detalles de método, datos y evaluación local se añadirán más adelante, y no se han publicado resultados de benchmarks ni especificaciones completas de contexto o idiomas. El repositorio contiene únicamente los pesos del modelo (9,1 GB), sin pipeline declarado ni datos de descargas o interacciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (tensores de lenguaje y visión de Qwen3.5-4B), ajuste fino LoRA sobre un "soup" de pesos |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en BF16 según la model card) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de un chasis fijado (d3-mini) que incorpora los tensores de lenguaje y visión de Qwen3.5-4B en precisión BF16. Sobre ese chasis se aplica un ajuste fino LoRA cuyo punto de partida es el promedio uniforme de pesos de dos modelos: Charlie320/zils-mini-s3l (commit ca665f97) y jaysun007/zils-mini-body-m10 (commit 27c76831), ambos Apache-2.0. Este tipo de "model soup" combina los pesos de varios modelos afinados para obtener un punto de partida más robusto antes del ajuste específico.

El entrenamiento utilizó registros públicos de decisiones con resultados conocidos, incluyendo revisión de código, revisión de artículos y patrullaje de ediciones en wikis públicas y servidores Gerrit, además de ítems en formato de examen elaborados a partir de particiones TRAIN públicas. La model card especifica que no se usaron ítems de examen de validadores, ni ítems de examen semilla públicos, ni datos de clientes. No se detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO; la model card indica que el método, los datos y los detalles de evaluación local se añadirán tras la ronda del 14 de noviembre.

## Capacidades

- Generación de texto y razonamiento orientado a la toma de decisiones con resultados verificables.
- Procesamiento multimodal: el chasis incluye tensores de visión de Qwen3.5-4B, aunque la model card no detalla tareas de visión específicas.
- Evaluación en tareas de revisión de código y revisión de artículos.
- Patrullaje de ediciones en wikis públicas y servidores Gerrit.
- Resolución de ítems en formato de examen a partir de particiones TRAIN públicas.
- Integración con el runtime y el prompt del chasis fijado d3-mini, que aporta la capa de respuesta.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, audio): no disponible en la información proporcionada.

## Casos de uso

- Revisión automatizada de código en servidores Gerrit: el modelo se entrenó con registros públicos de decisiones de revisión de código con resultados conocidos, por lo que puede asistir en la clasificación y priorización de cambios en revisiones de parches dentro de un flujo Gerrit.
- Revisión de artículos en wikis públicas: dado su entrenamiento con decisiones de revisión de artículos, puede emplearse para evaluar propuestas de artículos y señalar problemas de calidad o política antes de la revisión humana.
- Patrullaje de ediciones en wikis: el modelo puede clasificar ediciones recientes según su probabilidad de ser vandalismo o edición problemática, apoyándose en el formato de decisión del chasis d3-mini.
- Evaluación de ítems en formato de examen: al haberse entrenado con ítems de particiones TRAIN públicas, puede utilizarse para responder preguntas de examen en entornos de evaluación controlados, siempre que se respete la prohibición de usar ítems de validadores.
- Investigación en modelos de decisión de la subred 127 de Bittensor: sirve como cuerpo candidato para participar en la ronda del 13 de noviembre de 2026 y comparar su rendimiento frente a otros cuerpos del pool.
- Experimentación con técnicas de model soup y LoRA: el repositorio documenta la combinación de dos modelos base y un ajuste LoRA posterior, lo que lo convierte en un caso de estudio reproducible para investigar la fusión de pesos en modelos de ~4.500 millones de parámetros.
- Prototipado de asistentes de moderación en comunidades: su orientación a decisiones binarias o clasificatorias con resultado verificable encaja en pipelines de moderación de contenido en entornos colaborativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.539.265.536 parámetros en BF16, los pesos ocupan aproximadamente 9,1 GB, por lo que se necesitan al menos 10-12 GB de VRAM para cargar el modelo sin cuantizar, más memoria para el contexto y el runtime del chasis.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, una GPU con 16 GB o más (RTX 4090, A100, H100) sería suficiente para inferencia en BF16, aunque no se confirma en la documentación.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) en BF16; en GPUs de 12-16 GB requeriría cuantización, cuyos formatos no están documentados.
- Opciones de despliegue: no disponible en la información proporcionada; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-mini-hm4 | 4.539.265.536 | no disponible | Apache-2.0 | Hugging Face (Zayaan/zils-mini-hm4) |
| Charlie320/zils-mini-s3l | no disponible | no disponible | Apache-2.0 | Hugging Face |
| jaysun007/zils-mini-body-m10 | no disponible | no disponible | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-4B | ~4B (no confirmado) | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La model card indica que los detalles de método, datos y evaluación local se añadirán después de la ronda del 14 de noviembre de 2026; hasta entonces, la documentación técnica es incompleta.
- No se han publicado resultados de benchmarks, por lo que no es posible verificar su rendimiento frente a alternativas.
- El modelo está diseñado para el chasis fijado d3-mini, que aporta la capa de respuesta, el prompt y el runtime; usarlo fuera de ese chasis puede degradar su comportamiento.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo de decisión, sus salidas deben validarse contra resultados verificables.
- Sesgos conocidos: no documentados; el entrenamiento con registros públicos de wikis y Gerrit puede heredar sesgos de esas comunidades.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe consultar el archivo NOTICE para las atribuciones de los modelos base y de los cuerpos de los que derivan.
- El repositorio contiene únicamente pesos; no incluye pipeline, tokenizador ni configuración de inferencia documentada.
- No se usaron datos de clientes ni ítems de examen de validadores en el entrenamiento, según la model card, pero no se detalla el proceso de limpieza de datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zayaan/zils-mini-hm4
- Modelo base Charlie320/zils-mini-s3l: https://huggingface.co/Charlie320/zils-mini-s3l/tree/ca665f9796497a3fb09d47b1b50b9d6810548bee
- Modelo base jaysun007/zils-mini-body-m10: https://huggingface.co/jaysun007/zils-mini-body-m10/tree/27c76831a1a02ff16c2ade909597600d4d25e758
- Modelo base Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
