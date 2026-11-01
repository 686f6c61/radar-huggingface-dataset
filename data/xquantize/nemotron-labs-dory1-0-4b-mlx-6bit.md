# xquantize/nemotron-labs-dory1.0-4b-mlx-6bit

## Resumen

Dory 1.0 4B es un modelo de lenguaje de NVIDIA (Nemotron-Labs) con una arquitectura poco habitual: un transformer con bucles recurrentes (*looped transformer*). Un bloque compartido de 20 capas puede ejecutarse 1, 2 o 4 veces por token, de modo que el modelo gana capacidad de razonamiento sin anadir parametros, a cambio de velocidad. El modelo base tiene 3.975.229.440 parametros y se distribuye en BF16.

Esta ficha corresponde a una cuantizacion comunitaria de 6 bits en formato MLX, publicada por el usuario `xquantize` para Apple Silicon. El repositorio ocupa 3,2 GB (6,5 bits por peso) y su valor anadido no es solo la conversion: incluye una guia medida del "dial de bucles", con datos de perdida de prediccion, velocidad, memoria y divergencia KL comparando las variantes bf16, 8 bits, 6 bits y 4 bits con k=1, 2 y 4.

Es relevante ahora porque demuestra empiricamente dos cosas utiles para quien despliega modelos en local: que conviene invertir en bucles antes que en precision (4 bits con k=2 iguala en perdida a bf16 con k=1 y corre el doble de rapido), y que el error de cuantizacion no se acumula de forma medible a 8 y 6 bits, solo a 4 bits. Es un modelo de razonamiento: genera cadenas de pensamiento largas antes de responder.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped transformer (transformer con bloque recurrente compartido) |
| Parametros totales | 3.975.229.440 (~4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la implementacion usa ventanas deslizantes de 1.024 tokens en 27 capas) |
| Tipos de cuantizacion | 6 bits (esta build); el autor publica tambien bf16, 8 bits y 4 bits |
| Idiomas soportados | No disponible |
| Licencia | OpenMDW-1.1 (etiquetada como `other` en HuggingFace) |
| Formato de pesos | safetensors (MLX), 3,2 GB, 6,5 bits por peso |

## Arquitectura y entrenamiento

Dory es un *looped transformer*: en lugar de apilar decenas de capas distintas, comparte un bloque de 20 capas recurrentes que se aplica k veces por token, con k configurable en tiempo de inferencia (1, 2 o 4). Segun la model card, la arquitectura combina 16 bloques de entrada y salida que no se repiten con 27 capas de atencion con ventana deslizante de 1.024 tokens, mas las capas recurrentes. El numero de parametros es fijo; lo que cambia con k es el coste computacional.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO. Si se documenta el comportamiento de razonamiento: el modelo escribe cadenas de pensamiento extensas (a menudo mas de 1.000 tokens) antes de dar la respuesta, y NVIDIA recomienda muestreo con temperatura 1.0 y top-p 0.95. La innovacion tecnica destacable es el dial de bucles como mecanismo de *compute scaling* en inferencia, junto con dos modos de cache KV (`per_loop` y `last_loop`).

## Capacidades

- Generacion de texto conversacional con plantilla de chat (`apply_chat_template`).
- Razonamiento multi-paso en modo *thinking*: produce cadenas de pensamiento antes de la respuesta final.
- Razonamiento matematico y resolucion de problemas aritmeticos (el ejemplo de la model card resuelve un problema de divisibilidad con respuesta correcta en los tres valores de k).
- Ajuste dinamico de esfuerzo cognitivo mediante el parametro `n_recurrent_loops` (1, 2 o 4).
- Ejecucion nativa en Apple Silicon mediante MLX.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.
- Cobertura multilingue: no disponible.

## Casos de uso

- Razonamiento matematico local en un Mac: el modelo resuelve problemas aritmeticos y de conteo con cadena de pensamiento; con k=4 reduce un 22% los tokens de razonamiento al hacer mas trabajo por token. Adecuado para uso offline en un portatil Apple Silicon.
- Asistente conversacional privado: al ejecutarse en local con MLX sobre 3,4 GB de memoria pico, permite desplegar un chatbot sin enviar datos a la nube, con k=1 para respuestas rapidas a 39,1 tok/s.
- Prototipado e investigacion de arquitecturas recurrentes: el repositorio incluye scripts de medida (`bench_dory.py`) y comparativas entre precisiones y valores de k, lo que lo convierte en una base practica para estudiar *compute scaling* en inferencia.
- Generacion de codigo y explicaciones tecnicas: como modelo de razonamiento con contexto de chat, puede emplearse para tareas de analisis y explicacion paso a paso, aceptando latencias mayores a cambio de profundidad (k=4 a 15,1 tok/s).
- Evaluacion de trade-offs de cuantizacion: util para equipos que necesitan decidir entre precision y bucles; los datos publicados muestran que 4 bits con k=2 iguala a bf16 con k=1 en perdida (1,4501 en ambos) con el doble de velocidad y menos de un tercio de la memoria.
- Educacion y tutoria automatizada: la salida separa el bloque de pensamiento (`</think>`) de la respuesta, lo que permite mostrar solo la solucion final al usuario o el razonamiento completo segun el caso.
- Procesamiento por lotes en estaciones de trabajo Mac: con 3,2 GB de pesos y cache KV de 0,42 GB a 8.000 tokens en k=1, es viable mantener varias instancias o sesiones largas en un solo equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los datos medidos por el autor son de perdida de prediccion, velocidad y memoria, no de exactitud en tareas:

| Metrica (bf16) | k=1 | k=2 | k=4 |
|---|---|---|---|
| Perdida de prediccion | 1,450 | 1,403 | 1,388 |
| Velocidad relativa | 100% | ~66% | ~39% |

| Build de 6 bits (M3 Pro, 18 GB, generacion de 128 tokens) | k=1 | k=2 | k=4 |
|---|---|---|---|
| Velocidad | 39,1 tok/s | 25,7 tok/s | 15,1 tok/s |
| Memoria pico | 3,40 GB | 3,42 GB | 3,46 GB |

| Cache KV a 8.000 tokens (modo `per_loop`) | k=1 | k=2 | k=4 |
|---|---|---|---|
| Tamano | 0,42 GB | 0,65 GB | 1,11 GB |

| Divergencia KL frente a bf16 | 8 bits | 6 bits | 4 bits |
|---|---|---|---|
| k=1 a k=4 | sin acumulacion medible | sin acumulacion medible | 0,113 a 0,128 |

## Requisitos de hardware

- Memoria: esta build de 6 bits ocupa 3,2 GB en disco y alcanza 3,40-3,46 GB de memoria pico en generacion de 128 tokens; con contexto de 8.000 tokens, la cache KV anade entre 0,42 y 1,11 GB segun k.
- GPU: exclusivamente Apple Silicon (MLX). Medido en un M3 Pro con 18 GB. No hay soporte CUDA documentado para esta build.
- GPU de consumo: cabe en cualquier Mac con Apple Silicon y al menos 8 GB de memoria unificada, aunque 16 GB o mas es recomendable para contextos largos.
- Despliegue: `mlx-lm` con el PR [ml-explore/mlx-lm#1988](https://github.com/ml-explore/mlx-lm/pull/1988), que aun no esta en una version publicada. No se indica soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia: en el ejemplo de la model card, una pregunta de divisibilidad tardo 35,1 s con k=1, 52,8 s con k=2 y 70,0 s con k=4 (decodificacion greedy, 6 bits).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Dory 1.0 4B (6 bits MLX) | ~4B | No disponible | Looped transformer con k ajustable | OpenMDW-1.1 | safetensors MLX |
| Dory 1.0 4B (bf16, NVIDIA) | ~4B | No disponible | Looped transformer con k ajustable | OpenMDW-1.1 | safetensors BF16 |
| Alternativas de ~4B en MLX | No disponible | No disponible | Transformer convencional | No disponible | No disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de Dory con otros modelos de tamano similar. La comparativa mas solida disponible es interna: frente a la build bf16, la de 6 bits ofrece velocidad 2,3 veces mayor con perdida de prediccion practicamente identica a k=2.

## Limitaciones y advertencias

- Requiere instalar un PR no fusionado de `mlx-lm`; la API puede cambiar y no hay version estable.
- Solo funciona en Apple Silicon; no es desplegable en GPU NVIDIA o AMD con esta build.
- El modo de cache `last_loop` consume mas memoria de la prevista (1,21 GB a 8.000 tokens en todos los valores de k) por un comportamiento de la implementacion actual, y su calidad en contexto largo no esta probada.
- El modelo genera cadenas de pensamiento muy largas; sin un `max_tokens` generoso puede truncar la respuesta, y el coste en latencia es alto (hasta 70 s en el ejemplo con k=4).
- El error de cuantizacion se acumula con los bucles en la variante de 4 bits (KL de 0,113 a 0,128); en 6 y 8 bits no se ha medido acumulacion, pero la muestra es limitada.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible.
- Idiomas soportados no declarados; no se puede garantizar calidad fuera del ingles sin evaluacion propia.
- Licencia OpenMDW-1.1: conviene revisar el texto completo antes de uso comercial, ya que HuggingFace la etiqueta como `other`.
- Las mediciones proceden de un unico equipo (M3 Pro, 18 GB) y, en el caso de la comparativa cualitativa de k, de una sola pregunta; no constituyen un benchmark representativo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/xquantize/nemotron-labs-dory1.0-4b-mlx-6bit
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16
- PR de mlx-lm que anade soporte: https://github.com/ml-explore/mlx-lm/pull/1988
- Script de medida del autor: https://huggingface.co/xquantize/nemotron-labs-dory1.0-4b-mlx-6bit (referencia a `bench_dory.py` en la model card)
- Diagrama de arquitectura: https://huggingface.co/xquantize/nemotron-labs-dory1.0-4b-mlx-6bit/resolve/main/assets/dory-architecture.svg
