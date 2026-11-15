# VadymPikulyk/zils-lite-dh4

## Resumen

zils-lite-dh4 es un modelo de decisión (decision model) de aproximadamente 853 millones de parámetros, publicado por el usuario VadymPikulyk en Hugging Face. Se trata de un "soup body" para Zils, el subred 127 de Bittensor, construido sobre la arquitectura Qwen3.5 y derivado de un fine-tune de Qwen/Qwen3.5-0.8B. El modelo combina los pesos de lenguaje y visión de dos cuerpos d3-lite de la ronda del 14 de noviembre de 2026 mediante un promedio uniforme, al que se le suma un LoRA fusionado destilado a partir de las respuestas de un modelo profesor (vllm-sr/d3-ultra) sobre 40.000 preguntas de decisión.

El modelo está pensado para tareas de decisión dentro del ecosistema Zils/Bittensor, no como un asistente conversacional generalista. Su relevancia radica en que ejemplifica el patrón de "model soup" combinado con destilación: se parte de varios fine-tunes ya entrenados y se fusionan para obtener un cuerpo base más robusto, sobre el que se aplica un ajuste fino adicional mediante LoRA de rango 64. El resultado es un checkpoint compacto (1,7 GB en safetensors) que puede desplegarse en hardware modesto.

La información pública disponible es muy limitada: no se especifican idiomas soportados, no hay pipeline declarado, no se han publicado benchmarks y el modelo no registra descargas ni likes en el momento de redactar esta ficha. Todo lo que sigue se basa exclusivamente en la model card y en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, según tag `qwen3_5`); requiere `custom_code` |
| Parametros totales | 852.985.920 (≈853 M) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo solo con safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamaño de repo 1,7 GB) |

## Arquitectura y entrenamiento

El modelo se describe como un "soup body" en el layout del chasis d3-lite. Parte del promedio uniforme de dos cuerpos d3-lite ya entrenados en la ronda del 14 de noviembre de 2026 (VadymPikulyk/zils-lite-dh2 y qhoenix/zils-lite-decision-avg-abc), ambos bajo licencia Apache-2.0. Sobre esa media se suma 0,7 veces un LoRA fusionado de rango 64, entrenado con learning rate 5e-5 durante una época.

El LoRA se destiló con el comando `python -m zils.teacher train` a partir de las respuestas del profesor Zils Relay (zils-ai/zils-relay-answers), que contiene las probabilidades de vllm-sr/d3-ultra sobre 40.000 preguntas de decisión. Esas preguntas se reconstruyeron a partir de fuentes públicas de entrenamiento mediante el script `rebuild.py` del dataset. La model card afirma explícitamente que no se utilizaron ítems de examen del validador, ítems de examen de semilla públicos ni datos de clientes. El modelo base declarado es Qwen/Qwen3.5-0.8B, con fine-tune posterior; también se listan como base vllm-sr/d3-lite, VadymPikulyk/zils-lite-dh2 y qhoenix/zils-lite-decision-avg-abc.

No se detalla la composición exacta del dataset de destilación más allá de las 40.000 preguntas de decisión, ni se especifica si hubo RLHF o DPO adicionales. La innovación técnica principal es la combinación de model soup (promedio de pesos) con destilación de un profesor de mayor capacidad, un patrón habitual en competiciones de subredes Bittensor para aprovechar checkpoints ya validados.

## Capacidades

- Generación de texto y razonamiento dentro del dominio de preguntas de decisión para el que fue destilado.
- Capacidades de visión, según la model card ("language and vision weights"), heredadas del fine-tune de Qwen3.5-0.8B.
- Modelo de decisión: produce respuestas/probabilidades orientadas a tareas de decisión del subred 127 de Bittensor.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Evaluación de cuerpos de decisión en Bittensor subnet 127: el modelo sirve como checkpoint candidato ("soup body") para participar en la ronda de validación del subred, comparando su rendimiento frente a otros cuerpos d3-lite.
- Punto de partida para nuevos fine-tunes: al ser un cuerpo base ya promediado y destilado, puede reutilizarse como inicialización para LoRAs posteriores en tareas de decisión, ahorrando cómputo frente a partir de Qwen3.5-0.8B en crudo.
- Destilación de profesores de mayor tamaño: el pipeline `zils.teacher train` permite replicar el proceso con otros profesores o datasets de preguntas, usando este modelo como alumno.
- Experimentación con model soups: sirve como caso de estudio reproducible de promedio de pesos más fusión de LoRA en un modelo de menos de 1.000 millones de parámetros.
- Clasificación y respuesta a preguntas de decisión en entornos de investigación: para estudiar cómo se comporta un modelo pequeño destilado frente a las probabilidades de un profesor d3-ultra.
- Despliegue en hardware de gama consumer para pruebas de inferencia: con 853 M de parámetros y 1,7 GB en safetensors, cabe en GPUs de consumo para validación local del checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (no publicada por el autor), un modelo de 853 M de parámetros en fp16 ocuparía aproximadamente 1,7 GB de pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs consumer tipo RTX 3060/4060/4090, pero el autor no lo confirma.
- Cabe en consumer GPU: probablemente sí por tamaño, aunque no está verificado en la información disponible.
- Opciones de despliegue: el tag `custom_code` indica que requiere código personalizado del repositorio `zils`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-dh4 | ≈853 M | no disponible | Apache-2.0 | Hugging Face | Decision model, soup + LoRA destilado |
| Qwen/Qwen3.5-0.8B | ≈800 M (base declarada) | no disponible | no disponible en esta ficha | Hugging Face | Modelo base original de la familia Qwen3.5 |
| VadymPikulyk/zils-lite-dh2 | no disponible | no disponible | Apache-2.0 | Hugging Face | Cuerpo d3-lite predecesor, integrado en el soup |
| qhoenix/zils-lite-decision-avg-abc | no disponible | no disponible | Apache-2.0 | Hugging Face | Cuerpo d3-lite predecesor, integrado en el soup |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al derivar de datos públicos reconstruidos, puede heredar sesgos de esas fuentes.
- Riesgo de alucinación: no evaluado; no hay benchmarks ni evaluaciones de fidelidad publicadas.
- Limitaciones de contexto o idioma: no se declara longitud de contexto ni idiomas soportados, lo que impide garantizar su comportamiento fuera del dominio de decisión.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la model card pide citar a tasksource y los datasets originales, y remite a LICENSE y NOTICE para las obligaciones de atribución.
- Caveat para producción: requiere `custom_code` (paquete `zils`), lo que complica el despliegue con stacks estándar; además, el modelo está especializado en el subred 127 de Bittensor y no está pensado como asistente general.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni evaluaciones independientes.

## Enlaces

- Hugging Face: https://huggingface.co/VadymPikulyk/zils-lite-dh2
- Hugging Face (modelo base): https://huggingface.co/Qwen/Qwen3.5-0.8B
- Hugging Face (cuerpo predecesor): https://huggingface.co/qhoenix/zils-lite-decision-avg-abc
- Dataset de respuestas del profesor: https://huggingface.co/zils-ai/zils-relay-answers
- Modelo profesor: https://huggingface.co/vllm-sr/d3-ultra
- Modelo base d3-lite: https://huggingface.co/vllm-sr/d3-lite
