# VadymPikulyk/zils-mini-dh1

## Resumen

zils-mini-dh1 es un modelo de lenguaje derivado de Qwen/Qwen3.5-4B, publicado por VadymPikulyk como "soup body" (cuerpo de mezcla de pesos) para Zils, el subnet 127 de Bittensor. Se trata de un fine-tune en el formato de chasis d3-mini que combina la media uniforme de dos cuerpos d3-mini ya asentados (qhoenix/zils-mini-decision-l13_avg678 y joamCriff123/zils-mini-sx3) con una LoRA fusionada entrenada sobre tareas de decisión. El resultado conserva los pesos de lenguaje y visión del modelo base Qwen3.5-4B, con 4.539.265.536 parámetros totales.

El modelo está orientado a tareas de decisión y razonamiento de tipo multiple-choice y clasificación, no a generación abierta de propósito general. Su relevancia es acotada: se publica como artefacto de un ecosistema de subred descentralizada (Bittensor), con cero descargas y cero likes en el momento de la consulta, y sin model card extendida más allá del README. No hay información publicada sobre benchmarks, idiomas soportados ni detalles de arquitectura interna más allá de la herencia de Qwen3.5-4B.

La licencia es Apache-2.0, heredada de sus modelos padre, lo que permite uso comercial y modificación con atribución. El repositorio ocupa 9,1 GB en formato safetensors y requiere `custom_code` para su carga, lo que implica dependencias específicas más allá de transformers estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5-4B), con código personalizado (`custom_code`) |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, presumiblemente fp16/bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 9,1 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen/Qwen3.5-4B, un transformer de aproximadamente 4.500 millones de parámetros. Sobre esa base, el autor aplica una "soup" (mezcla de pesos): parte de la media uniforme de dos cuerpos d3-mini ya asentados en la subred (qhoenix/zils-mini-decision-l13_avg678 y joamCriff123/zils-mini-sx3) y añade una LoRA fusionada entrenada específicamente sobre ítems de decisión. El chasis d3-mini define el layout de pesos y probablemente la cabeza de decisión, aunque la model card no detalla esa estructura.

Los datos de entrenamiento de la LoRA provienen de splits públicos de GLUE, Social IQa, PIQA, TweetEval, dair-ai/emotion, 20 Newsgroups, SQuAD 2.0, BoolQ, SciQ y otros conjuntos, además de ítems de conteo generados por reglas. El autor declara explícitamente que no se usaron ítems del examen del validador, filas de validación/test reservadas ni datos de clientes. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación y decisión sobre ítems de tipo multiple-choice, entrenada sobre GLUE, PIQA, BoolQ, SciQ y Social IQa.
- Razonamiento sobre preguntas de comprensión lectora (SQuAD 2.0) y verificación de afirmaciones (BoolQ).
- Clasificación de emoción y sentimiento (dair-ai/emotion, TweetEval).
- Clasificación temática de documentos (20 Newsgroups).
- Tareas de conteo simples generadas por reglas.
- Conserva los pesos de lenguaje y visión del Qwen3.5-4B original, por lo que hereda sus capacidades base, aunque no se documenta su preservación tras el fine-tune.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Evaluación de ítems de decisión en la subred Bittensor 127: el modelo actúa como "cuerpo" candidato para el chasis d3-mini y se evalúa contra el examen del validador de la subred; su propósito declarado es competir en ese circuito, no servir como modelo de propósito general.
- Clasificación de sentimiento y emoción en textos cortos: adecuado para pipelines de moderación o análisis de opinión en redes sociales, dado el entrenamiento sobre TweetEval y dair-ai/emotion.
- Verificación de afirmaciones (fact checking ligero): el entrenamiento sobre BoolQ y SQuAD 2.0 lo hace apto para tareas de pregunta-respuesta con respuesta sí/no o extractiva sobre pasajes.
- Clasificación temática de documentos: útil para enrutado de tickets o categorización de noticias, por el entrenamiento sobre 20 Newsgroups.
- Razonamiento físico básico: PIQA aporta ejemplos de sentido común físico que pueden aprovecharse en tareas de validación de instrucciones cotidianas.
- Investigación sobre mezcla de pesos (model souping): sirve como caso de estudio reproducible de cómo combinar checkpoints fine-tuneados con una LoRA fusionada sobre un chasis común, útil para investigadores que estudian técnicas de merging.
- Punto de partida para fine-tunes adicionales: al ser Apache-2.0 y derivar de Qwen3.5-4B, puede reutilizarse como base para tareas de clasificación especializadas con datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 9 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 12-16 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 5-6 GB; en 4 bits, en torno a 3-4 GB (estimaciones por tamaño de parámetros, no verificadas con este checkpoint).
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para despliegue en fp16 con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para fp16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en fp16 y en GPUs de 8-12 GB si se cuantiza.
- Opciones de despliegue: al requerir `custom_code`, la carga con transformers necesita `trust_remote_code=True`; vLLM, TGI y llama.cpp pueden no soportar el chasis d3-mini sin adaptaciones. Ollama requeriría conversión a GGUF, no documentada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-dh1 | 4.539 M | no disponible | Apache-2.0 | Hugging Face, 0 descargas | Fine-tune de decisión sobre Qwen3.5-4B con chasis d3-mini |
| Qwen/Qwen3.5-4B | ~4.500 M | no disponible en esta ficha | no disponible en esta ficha | Hugging Face | Modelo base del que deriva; capacidades generales |
| qhoenix/zils-mini-decision-l13_avg678 | no disponible | no disponible | no disponible | Hugging Face | Cuerpo d3-mini padre, promediado en la mezcla |
| joamCriff123/zils-mini-sx3 | no disponible | no disponible | no disponible | Hugging Face | Cuerpo d3-mini padre, promediado en la mezcla |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: diseñado para el examen de la subred Bittensor 127, no para uso general; su rendimiento fuera de ese circuito no está documentado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, lo que impide compararlo con alternativas de forma rigurosa.
- Riesgo de alucinación: heredado de Qwen3.5-4B y no mitigado de forma documentada; el fine-tune sobre tareas de clasificación no elimina este comportamiento en generación abierta.
- Sesgos: los datasets de entrenamiento (TweetEval, 20 Newsgroups, Social IQa, GLUE) arrastran sesgos sociales y de dominio; no se documenta ninguna mitigación.
- Idiomas: no se especifica qué idiomas conserva tras el fine-tune; el entrenamiento se apoya en datasets mayoritariamente en inglés, lo que puede degradar el multilingüismo del base.
- Requiere `custom_code`: la carga exige `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar el repositorio antes de usarlo en producción.
- Licencia Apache-2.0: permite uso comercial, pero deben conservarse LICENSE y NOTICE de los modelos padre según indica la model card.
- Cero adopción verificable: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación independiente.
- Fecha de creación futura (2026-11-11) en los metadatos, lo que sugiere que el repositorio puede ser un artefacto de un entorno de pruebas o de una subred con relojes propios; conviene verificar su vigencia.

## Enlaces

- Hugging Face: https://huggingface.co/VadymPikulyk/zils-mini-dh1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Padre d3-mini 1: https://huggingface.co/qhoenix/zils-mini-decision-l13_avg678
- Padre d3-mini 2: https://huggingface.co/joamCriff123/zils-mini-sx3
- Padre d3-mini 3: https://huggingface.co/zils-ai/d3-mini-4.5b-v1
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
