# VadymPikulyk/zils-lite-dh2

## Resumen

zils-lite-dh2 es un modelo de decisión de 853 millones de parámetros publicado por VadymPikulyk en el ecosistema de Zils, la subred 127 de Bittensor. Se trata de un "soup body": un ensamblaje por mezcla de pesos (model soup) construido a partir de la media uniforme de dos cuerpos d3-lite ya asentados en la subred (qhoenix/zils-lite-decision-v9 y Charlie320/zils-lite-v9a), a los que se suma la mitad del cambio medio de dos ejecuciones de LoRA fusionadas (semillas 553 y 554). El resultado se empaqueta en el chasis d3-lite, que a su vez es un fine-tune de Qwen/Qwen3.5-0.8B.

El modelo hereda la arquitectura del transformer de Qwen3.5-0.8B y está orientado a tareas de decisión y clasificación sobre ítems estructurados, no a la generación abierta de texto. Los datos de entrenamiento de los LoRA provienen de particiones públicas de GLUE, Social IQa, PIQA, TweetEval, dair-ai/emotion, 20 Newsgroups, SQuAD 2.0, BoolQ y SciQ, además de ítems de conteo generados por reglas. Según el autor, no se emplearon ítems del examen de validadores, filas de validación o test reservadas ni datos de clientes.

Su relevancia es acotada y muy específica: es un artefacto de la competición de subred de Bittensor, con cero descargas y cero likes en el momento de la consulta, y sin model card con métricas de rendimiento. Resulta útil como referencia para quien estudie técnicas de model souping y fusión de LoRA en modelos pequeños, o para participantes de la subred 127 que quieran reproducir el pipeline de ensamblaje.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (chasis d3-lite, fine-tune de Qwen/Qwen3.5-0.8B) |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; se asume compatible con cuantización estándar, pero no se documenta) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (custom_code, requiere código propio del repositorio) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del transformer de Qwen3.5-0.8B, reempaquetado en el chasis d3-lite. El proceso de construcción es un ensamblaje en dos fases: primero se calcula la media uniforme de los pesos de dos cuerpos d3-lite ya asentados en la subred (qhoenix/zils-lite-decision-v9 y Charlie320/zils-lite-v9a); después se entrena un par de ejecuciones LoRA con semillas 553 y 554 sobre ítems de decisión, se fusionan ambas y se añade al modelo base la mitad del cambio medio resultante. Este esquema de "soup + media de deltas LoRA" es una variante de las técnicas habituales de model merging (model souping y task arithmetic) aplicadas a un modelo de menos de mil millones de parámetros.

Los datos de entrenamiento de los LoRA son ítems de decisión derivados de particiones públicas de GLUE, Social IQa, PIQA, TweetEval, dair-ai/emotion, 20 Newsgroups, SQuAD 2.0, BoolQ y SciQ, entre otros conjuntos, más ítems de conteo generados por reglas. El autor declara explícitamente que no se usaron ítems del examen de validadores, filas de validación o test reservadas ni datos de clientes. No se documentan el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO; tampoco se detalla ninguna innovación técnica adicional más allá del propio ensamblaje de pesos.

## Capacidades

- Clasificación y decisión sobre ítems estructurados: el modelo está entrenado para resolver tareas de elección entre opciones (estilo BoolQ, PIQA, Social IQa) más que para generar texto libre.
- Razonamiento de sentido común y físico básico, derivado de los conjuntos PIQA y Social IQa.
- Comprensión lectora extractiva y de respuesta a preguntas, por el entrenamiento sobre SQuAD 2.0 y BoolQ.
- Clasificación de sentimiento y emoción, por dair-ai/emotion y TweetEval.
- Clasificación temática de documentos, por 20 Newsgroups.
- Conteo y tareas aritméticas simples generadas por reglas.
- Capacidades lingüísticas y de visión heredadas de Qwen3.5-0.8B, aunque no se documenta su preservación tras el ensamblaje.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (el autor no declara idiomas).

## Casos de uso

- Evaluación de pipelines de model souping: el modelo sirve como caso concreto para reproducir la mezcla de pesos y la fusión de deltas LoRA en un transformer pequeño, comparando el resultado con los cuerpos originales qhoenix/zils-lite-decision-v9 y Charlie320/zils-lite-v9a.
- Participación en la subred 127 de Bittensor: un nodo puede desplegar este cuerpo como candidato en el mecanismo de decisión de la subred, siempre que cumpla los requisitos del chasis d3-lite.
- Clasificación binaria de preguntas (estilo BoolQ): el modelo puede usarse como clasificador de pares pregunta-pasaje para filtrar consultas antes de enviarlas a un modelo mayor.
- Etiquetado de emoción y sentimiento en textos cortos: adecuado para preprocesar tuits o mensajes de soporte antes de un análisis más profundo, dado el entrenamiento sobre TweetEval y dair-ai/emotion.
- Razonamiento físico elemental en asistentes de instrucciones: los ítems de PIQA permiten usar el modelo para validar si una secuencia de acciones es plausible en dominios cotidianos.
- Clasificación temática de noticias y documentos: útil para enrutar documentos de 20 Newsgroups o corpus similares hacia el equipo o pipeline correspondiente.
- Investigación sobre modelos de menos de mil millones de parámetros: sirve como referencia para estudiar hasta qué punto el ensamblaje de pesos preserva o degrada capacidades del modelo base Qwen3.5-0.8B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB en precisión de 16 bits (coincide con el tamaño del repositorio); alrededor de 0,9 GB en cuantización de 8 bits y 0,5 GB en 4 bits, estimaciones teóricas a partir del número de parámetros.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para FP16 (RTX 3060, RTX 4060, RTX 4090); para cuantización 4 bits basta con 2 GB, por lo que también cabe en iGPU y CPU.
- Cabe en GPU consumer: sí, en todas las GPU modernas con 4 GB o más.
- Opciones de despliegue: al usar `custom_code` y el chasis d3-lite, es necesario cargar el modelo con `trust_remote_code=True` en Transformers; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| VadymPikulyk/zils-lite-dh2 | 852.985.920 | no disponible | Apache-2.0 | Hugging Face, 0 descargas |
| qhoenix/zils-lite-decision-v9 | no disponible | no disponible | no disponible | Hugging Face (modelo base) |
| Charlie320/zils-lite-v9a | no disponible | no disponible | no disponible | Hugging Face (modelo base) |
| Qwen/Qwen3.5-0.8B | ~0,8 B | no disponible | no disponible | Hugging Face (modelo base original) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado para tareas de decisión y clasificación, no para generación de texto abierta; usarlo como chatbot produciría resultados pobres.
- No se documentan sesgos conocidos, pero los conjuntos de entrenamiento (TweetEval, 20 Newsgroups, Social IQa) incorporan sesgos sociales y de dominio que pueden propagarse.
- Riesgo de alucinación: no evaluado; al ser un modelo de decisión, el riesgo se traslada a clasificaciones erróneas con alta confianza.
- No se declaran idiomas soportados; el entrenamiento se basa en datasets mayoritariamente en inglés, por lo que el rendimiento en castellano es incierto.
- El modelo requiere `custom_code` y el chasis d3-lite; no es un transformer estándar cargable sin el código del repositorio, lo que complica su integración en pipelines convencionales.
- La licencia Apache-2.0 permite uso comercial, pero el autor remite a los archivos LICENSE y NOTICE de los modelos padre, que no se detallan en la información disponible.
- Con cero descargas y cero likes, no hay evidencia de comunidad ni de validación independiente del rendimiento.
- El autor declara que no se usaron datos de validadores ni de clientes, pero no se aporta auditoría externa de esa afirmación.

## Enlaces

- Hugging Face: https://huggingface.co/VadymPikulyk/zils-lite-dh2
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo base d3-lite: https://huggingface.co/vllm-sr/d3-lite
- Modelo base zils-lite-decision-v9: https://huggingface.co/qhoenix/zils-lite-decision-v9
- Modelo base zils-lite-v9a: https://huggingface.co/Charlie320/zils-lite-v9a
