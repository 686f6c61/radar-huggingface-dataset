# Ura0316/zils-mini-body-s1-blend-3of4

## Resumen

zils-mini-body-s1-blend-3of4 es un modelo de lenguaje de aproximadamente 4.539 millones de parámetros (4,54B) publicado por el usuario Ura0316 en Hugging Face. Se trata de un "body" (cuerpo) para el pool de modelos d3-mini de Zils, un proyecto asociado a la subred 127 de Bittensor. El modelo es un fine-tune de torchcast-ai/torchcast-decision-4b, que a su vez deriva de Qwen/Qwen3.5-4B, promediado con los pesos del modelo de referencia vllm-sr/d3-mini.

La relevancia de este modelo es acotada y muy específica: no es un modelo de propósito general autónomo, sino un componente de pesos (el "body") que se combina con una "chassis" fija del pool que aporta la capa de respuesta, el prompt y el runtime. El repositorio contiene únicamente los pesos de lenguaje y visión en el formato de la chassis del pool (723 tensores en bfloat16), sin pipeline declarado ni idiomas especificados.

Por su naturaleza experimental, con cero descargas y cero likes en el momento de la consulta, y por depender de un ecosistema externo (Bittensor subnet 127), debe tratarse como un artefacto de investigación más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con proyecciones de atención y atención lineal (derivada de Qwen3.5-4B); detalles completos no disponibles |
| Parametros totales | 4.539.265.536 (4,54B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en bfloat16) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (723 tensores, bfloat16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen/Qwen3.5-4B, un transformer con proyecciones de atención estándar y de atención lineal, según se desprende de la descripción del proceso de fine-tuning. Sobre torchcast-ai/torchcast-decision-4b (fine-tune de Qwen3.5-4B) se entrenó un adaptador LoRA de rango 128 que se fusionó (merged) en las proyecciones de atención y atención lineal. Posteriormente, el resultado se promedió con los pesos del modelo de referencia vllm-sr/d3-mini, conservando 3/4 del cambio introducido por el fine-tune respecto a la versión de referencia.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa. El repositorio contiene exclusivamente los pesos del "body"; la capa de respuesta, el prompt de sistema y el runtime provienen de la chassis fijada por el pool de Zils.

## Capacidades

- Generación de texto y razonamiento: heredadas de la base Qwen3.5-4B, aunque no se documentan evaluaciones específicas para este modelo.
- Procesamiento de visión: el repositorio incluye pesos de visión según la model card ("language and vision weights"), lo que sugiere capacidad multimodal heredada de la base.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; los idiomas soportados figuran como no disponibles.
- Modo de razonamiento (thinking mode): no documentado.
- Integración con el pool d3-mini de Zils: el modelo está diseñado para funcionar dentro de la chassis del pool, que aporta la capa de respuesta y el runtime.

## Casos de uso

- Investigación en merges de modelos: el modelo sirve como caso de estudio de la técnica de model averaging con preservación parcial del delta de fine-tuning (3/4 del cambio), útil para quienes experimentan con recetas de fusión de pesos.
- Participación en la subred 127 de Bittensor: los mineros y validadores del pool d3-mini pueden desplegar este body junto con la chassis fijada para contribuir al pool, siempre que cumplan los requisitos de formato y los hashes SHA-256 registrados en el perfil del pool.
- Evaluación comparativa de fine-tunes sobre Qwen3.5-4B: permite medir el efecto de un LoRA de rango 128 fusionado y promediado frente a la base original en tareas controladas.
- Experimentación con modelos multimodales de 4,5B: al incluir pesos de visión, puede emplearse en prototipos de descripción de imágenes o respuesta visual a preguntas, sujeto a la chassis y al runtime del pool.
- Reproducción de pipelines de merge: el repositorio documenta la receta (LoRA rank 128, merge, promedio 3:1), lo que facilita reproducir el proceso con otros checkpoints.
- Docencia y formación técnica: útil para ilustrar el ciclo de vida de un modelo en un ecosistema descentralizado (fine-tune, merge, publicación de pesos y validación por hash).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 9,1 GB solo para pesos (coherente con el tamaño del repo), más overhead de activaciones y KV cache; en la práctica, se recomienda un mínimo de 12-16 GB de VRAM para contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5-5 GB de pesos, más overhead; en 4 bits, alrededor de 2,5-3 GB de pesos, más overhead. Estas cifras son estimaciones a partir del número de parámetros, no datos publicados por el autor.
- GPU recomendadas: A100, H100 o L40S para despliegues de producción; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en bfloat16 con margen.
- GPU de consumo: cabe en tarjetas de 16 GB o superiores en bfloat16 con contexto limitado; en cuantizaciones de 8 o 4 bits podría ejecutarse en GPUs de 8-12 GB, aunque no hay datos publicados que lo confirmen.
- Opciones de despliegue: no documentadas para este modelo concreto. Al derivar de Qwen3.5-4B, cabría esperar compatibilidad con frameworks estándar (vLLM, TGI, llama.cpp, Ollama) si los pesos se convierten a los formatos correspondientes, pero el repositorio solo publica safetensors en el layout de la chassis del pool.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-body-s1-blend-3of4 | 4,54B | No disponible | Apache-2.0 | Hugging Face (0 descargas) | Body para el pool d3-mini de Zils; requiere chassis externa |
| torchcast-ai/torchcast-decision-4b | ~4B (no confirmado) | No disponible | Apache-2.0 | Hugging Face | Modelo base del fine-tune; fine-tune de Qwen3.5-4B |
| vllm-sr/d3-mini | No disponible | No disponible | Apache-2.0 | Hugging Face | Modelo de referencia del pool con el que se promedia |
| Qwen/Qwen3.5-4B | ~4B | No disponible | Apache-2.0 | Hugging Face | Base original de la cadena de fine-tunes |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al heredar de Qwen3.5-4B y de fine-tunes posteriores, puede arrastrar los sesgos de los datos de entrenamiento de toda la cadena, que no se detallan.
- Riesgo de alucinación: no evaluado; no hay benchmarks ni evaluaciones de fidelidad publicados.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados figuran como no disponibles, lo que impide garantizar un comportamiento multilingüe o conversaciones de contexto largo.
- Dependencia de la chassis: el repositorio contiene solo el body; sin la capa de respuesta, el prompt y el runtime de la chassis del pool de Zils, el modelo no es utilizable de forma autónoma tal como se publica.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar las licencias de toda la cadena (torchcast-decision-4b, vllm-sr/d3-mini y Qwen3.5-4B), todas declaradas Apache-2.0 según la model card.
- Madurez: cero descargas y cero likes en el momento de la consulta, sin pipeline declarado ni idiomas especificados; es un artefacto experimental sin validación externa conocida.
- Integridad de pesos: el perfil del pool registra hashes SHA-256 por fichero; cualquier uso fuera de ese perfil debe verificar la integridad de los pesos manualmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ura0316/zils-mini-body-s1-blend-3of4
- Modelo base torchcast-ai/torchcast-decision-4b: https://huggingface.co/torchcast-ai/torchcast-decision-4b
- Modelo de referencia vllm-sr/d3-mini: https://huggingface.co/vllm-sr/d3-mini
- Base original Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Organización zils-ai en Hugging Face: https://huggingface.co/zils-ai/models
- Perfil del pool zils-ai/d3-mini-4.5b-v1: https://huggingface.co/zils-ai/d3-mini-4.5b-v1
