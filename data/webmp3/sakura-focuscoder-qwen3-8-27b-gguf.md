# webmp3/Sakura-FocusCoder-Qwen3.8-27B-GGUF

## Resumen

FocusCoder-27B es un ajuste fino del modelo Qwen3.8-27B, publicado por el usuario webmp3 bajo el identificador `Sakura-FocusCoder-Qwen3.8-27B-GGUF`. Se trata de un modelo de 27.320.697.856 parámetros orientado a generación de código y razonamiento, distribuido exclusivamente en formato GGUF para su uso con llama.cpp y Ollama. Su objetivo declarado es corregir un problema concreto del modelo base: la tendencia a agotar el límite de tokens de salida durante el razonamiento sin llegar a entregar una solución, algo que el autor denomina "terminar su razonamiento en lugar de chocar contra el límite de tokens".

La relevancia del modelo reside en su enfoque práctico: en lugar de perseguir mejoras genéricas de capacidad, el ajuste se evalúa con un conjunto congelado de seis tareas algorítmicas de estilo LeetCode/AtCoder con tests ocultos, comparando directamente contra el modelo base y otros ajustes de la misma familia. Los resultados reportados muestran 5/6 tareas resueltas por semilla frente a 1/6 del Qwen3.8-27B original, con un consumo de tokens de salida notablemente menor.

El modelo se distribuye en dos cuantizaciones (Q3_K_M de 17,3 GB e IQ3_S de 13,6 GB, esta última pensada para GPUs de 16 GB), ambas con tensores MTP (multi-token prediction) incluidos. La licencia es Apache 2.0 y los idiomas declarados son inglés y chino. El contexto probado por el autor es de 32.768 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura `qwen35` según llama.cpp), con tensores MTP |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (valor probado por el autor) |
| Tipos de cuantizacion | Q3_K_M (17,3 GB) e IQ3_S (13,6 GB); ambas con MTP |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp / Ollama) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer denso de aproximadamente 27,3 mil millones de parámetros. El autor no documenta en la model card la composición del dataset de ajuste, el número de tokens utilizados ni si se emplearon técnicas de RLHF, DPO o SFT. Tampoco se detalla la metodología de ajuste más allá de la descripción funcional: el objetivo era que el modelo concluyera su cadena de razonamiento dentro del presupuesto de tokens disponible.

El detalle técnico más relevante es la inclusión de tensores MTP (multi-token prediction) en ambas cuantizaciones. El autor ejecutó los benchmarks con un modelo draft DFlash para decodificación especulativa sobre llama.cpp b12189 con CUDA, lo que sugiere que los tensores MTP están pensados para habilitar este tipo de aceleración. La arquitectura requiere una versión de llama.cpp con soporte para `qwen35`; el autor advierte explícitamente de que hay que usar un build actual.

## Capacidades

- Generación de código: resolución de problemas algorítmicos de estilo LeetCode/AtCoder con tests ocultos, según la evaluación del autor.
- Razonamiento con modo thinking activado por defecto; la plantilla de chat embebida en el archivo activa el pensamiento.
- Razonamiento multi-paso orientado a concluir dentro del límite de tokens de salida, que es la modificación central del ajuste.
- Generación de texto conversacional (tag `conversational`).
- Compatibilidad con endpoints OpenAI (`/v1`) a través de llama-server.
- Capacidades multilingües limitadas a inglés y chino según los metadatos.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Resolución de problemas algorítmicos en pipelines de evaluación: el modelo está ajustado para entregar una solución dentro de un presupuesto de 16.384 tokens de salida, lo que lo hace adecuado para entornos automatizados donde una respuesta que agota el límite se descarta sin evaluación posterior.
- Asistente de programación en local con GPU de 16 GB: la cuantización IQ3_S de 13,6 GB permite ejecutar el modelo en tarjetas de gama consumer alta o profesional de 16 GB, con contexto de 16.384 tokens según el ejemplo del autor.
- Generación de código en producción con llama.cpp: el servidor `llama-server` expone una API compatible con OpenAI en `/v1`, lo que permite integrarlo en herramientas existentes sin adaptadores adicionales.
- Razonamiento técnico en inglés o chino: para equipos que trabajan en esos dos idiomas, el modelo cubre consultas de razonamiento y código sin necesidad de traducción intermedia.
- Sustitución del modelo base en flujos de trabajo con límite de tokens: allí donde Qwen3.8-27B agotaba el presupuesto sin solución (1/6 tareas resueltas en la evaluación del autor), FocusCoder-27B ofrece una tasa de finalización mayor con menos tokens consumidos.
- Despliegue con decodificación especulativa: los tensores MTP incluidos permiten usar un draft model (el autor empleó DFlash) para acelerar la inferencia en llama.cpp.
- Experimentación con cuantizaciones agresivas: el modelo sirve como referencia para medir la degradación de un ajuste de código entre Q3_K_M e IQ3_S, ya que el autor publica resultados para ambas.

## Benchmarks y rendimiento

Evaluación del autor sobre seis tareas algorítmicas congeladas con tests ocultos, una ejecución por tarea y semilla, sampling temperature 0.6, top-p 0.95, top-k 20, máximo 16.384 tokens de salida, thinking activado, contexto 32.768, llama.cpp b12189 (CUDA) sobre una NVIDIA L40S con draft DFlash.

| Modelo | Archivo | Semilla 42 resueltas | Tokens salida (42) | Semilla 43 resueltas | Tokens salida (43) | Total ambas semillas |
|---|---|---|---|---|---|---|
| FocusCoder-27B (17,3 GB) | Q3_K_M-MTP | 5/6 | 63.990 | 5/6 | 58.886 | 10/12 |
| FocusCoder-27B (13,6 GB) | IQ3_S-16GB-MTP | 5/6 | 51.601 | 5/6 | 65.366 | 10/12 |
| Qwen3.8-27B | Q4_K_M (ggml-org) | 1/6 | 83.151 | no ejecutado | no ejecutado | 1/6 |
| Coder390-EfficientThink | Q3LynnStyle-MTP | 4/6 | 70.007 | 3/6 | 62.218 | 7/12 |
| qwen-concept-27b | Q4_K_M | 4/6 | 54.102 | 4/6 | 64.119 | 8/12 |
| Swift-1.5-Qwen3.8-27B | Q5_K_M | 4/6 | 76.848 | no ejecutado | no ejecutado | 4/6 |
| Thinklite-27B | Q4_K_M | 4/6 | 69.314 | no ejecutado | no ejecutado | 4/6 |

Resultados de rechazo sobre 104 prompts de `mlabonne/harmful_behaviors`, decodificación greedy, thinking desactivado, máximo 100 tokens nuevos:

| Modelo | Rechazos directos (de 104) | Cualquier frase de rechazo o aviso (de 104) | Respuestas degeneradas |
|---|---|---|---|
| Qwen3.8-27B (Q4_K_M) | 103 | 103 | no medido |
| FocusCoder-27B (17,3 GB) | 5 | 52 | 0 |
| FocusCoder-27B (13,6 GB) | 8 | 48 | 0 |

Advertencias del propio autor: seis tareas y una o dos semillas constituyen una muestra pequeña, no una clasificación estadísticamente fiable; cada modelo se probó con su propia cuantización, por lo que las filas no son directamente comparables en ese aspecto; los resultados dependen del hardware y runtime empleados; la tarea 15 no fue resuelta por ningún modelo en ninguna ejecución; el conteo de rechazos es por frases y no constituye una evaluación de seguridad.

## Requisitos de hardware

- VRAM estimada: 17,3 GB para Q3_K_M y 13,6 GB para IQ3_S, más el espacio de contexto y overhead del runtime.
- GPU de referencia del autor: una NVIDIA L40S (48 GB) ejecutando llama.cpp b12189 con CUDA y draft DFlash para decodificación especulativa.
- GPU consumer: la cuantización IQ3_S de 13,6 GB está pensada para GPUs de clase 16 GB (por ejemplo, RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080, RTX 5070 Ti). La Q3_K_M de 17,3 GB requiere al menos 24 GB para operar con holgura (RTX 3090, RTX 4090).
- Contexto recomendado: 32.768 tokens con el archivo Q3_K_M y 16.384 con IQ3_S, según los comandos del autor; reducir el contexto libera VRAM.
- Despliegue: llama.cpp (`llama-server` con `--jinja` y `-ngl 99`) y Ollama (no probado por el autor, requiere una versión reciente con soporte de `qwen35`).
- Latencia y throughput: no disponibles. El autor solo publica el total de tokens de salida por ejecución, no tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Resultado evaluación autor (2 semillas) | Licencia | Formato |
|---|---|---|---|---|---|
| FocusCoder-27B | 27,3 B | 32.768 (probado) | 10/12 | Apache 2.0 | GGUF |
| Qwen3.8-27B (base) | 27,3 B | no disponible | 1/6 (solo semilla 42) | Apache 2.0 | GGUF, safetensors |
| qwen-concept-27b | 27 B (derivado) | no disponible | 8/12 | no disponible | GGUF |
| Coder390-EfficientThink | 27 B (derivado) | no disponible | 7/12 | no disponible | GGUF |
| Swift-1.5-Qwen3.8-27B | 27 B (derivado) | no disponible | 4/6 (solo semilla 42) | no disponible | GGUF |
| Thinklite-27B | 27 B (derivado) | no disponible | 4/6 (solo semilla 42) | no disponible | GGUF |

La comparación se limita a la evaluación publicada por el autor del modelo; no hay benchmarks independientes ni resultados en MMLU, HumanEval o GSM8K en la información disponible.

## Limitaciones y advertencias

- La evaluación se basa en seis tareas y una o dos semillas; el propio autor la califica de muestra pequeña y no fiable estadísticamente.
- Cada modelo se evaluó con una cuantización distinta, de modo que las diferencias de rendimiento pueden deberse en parte a la cuantización y no solo al ajuste.
- Los resultados se obtuvieron en un único entorno (llama.cpp b12189, CUDA, L40S, draft DFlash) y no son directamente trasladables a otro hardware o runtime.
- El modelo muestra una tasa de rechazo directo muy baja (5-8 de 104) frente al modelo base (103 de 104) en el conjunto de prompts dañinos; el autor advierte que es un conteo por frases y no una evaluación de seguridad. No debe desplegarse en producción sin filtros externos.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Idiomas: solo inglés y chino declarados; el rendimiento en castellano no está documentado.
- Tool calling, capacidades de agente y multimodalidad: no documentadas.
- Requiere una versión de llama.cpp u Ollama con soporte de la arquitectura `qwen35`; versiones antiguas no cargarán el modelo.
- El despliegue en Ollama no fue probado por el autor.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B debe verificarse por separado para confirmar que su licencia es compatible.
- El repositorio tiene 58 descargas y 1 like en el momento de la consulta; es un ajuste de la comunidad sin validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/webmp3/Sakura-FocusCoder-Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Conjunto de prompts de rechazo citado: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- No se han encontrado en la información proporcionada enlaces a papers, blogs del autor, repositorios adicionales ni demos.
