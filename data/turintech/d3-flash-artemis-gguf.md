# turintech/d3-flash-Artemis-GGUF

## Resumen

d3-flash-Artemis-GGUF es una versión cuantizada en formato GGUF del modelo d3-flash de vllm-sr, publicada por TurinTech bajo el paraguas de su tecnología Artemis. No es un modelo conversacional al uso: es un modelo de decisión que responde preguntas tipadas (sí/no, elección única, puntuación) sobre texto o imágenes, devolviendo una probabilidad para cada respuesta en una sola pasada a través del endpoint `/v1/systemone` de llama-server. Con 8.953.803.264 parámetros totales, el autor lo orienta a tareas de enrutamiento, triaje y comprobaciones tipadas.

El interés principal de esta publicación es la compresión: el autor declara que el archivo IQ4_XS ocupa 4,87 GB y requiere 6,1 GiB de VRAM, frente a los 17,0 GiB del modelo original, manteniendo un 94,5 % de respuestas idénticas al original según la model card. Eso permite ejecutar texto en una GPU de 8 GB y añadir visión cargando un proyector multimodal aparte en una GPU mayor.

La licencia es Apache 2.0 y el modelo base es vllm-sr/d3-flash. La información pública disponible es limitada: no se detallan idiomas soportados, composición del dataset de entrenamiento ni resultados de benchmarks estándar (MMLU, HumanEval, GSM8K); las únicas métricas publicadas son las de la model card sobre decisiones tipadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de decisión d3; soporte añadido en llama.cpp b11572) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 16.384 tokens (configuración recomendada con `-c 16384`; contexto de entrenamiento no disponible) |
| Tipos de cuantizacion | GGUF cuantizado; se menciona IQ4_XS (4,87 GB) y comparación con ggml-org Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (librería `gguf`, orientado a llama.cpp) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base vllm-sr/d3-flash más allá de identificarlo como un "decision model" de la familia d3. Lo que sí se documenta es el modo de operación: d3 lee el prompt completo en un único batch y produce, en una sola pasada, una distribución de probabilidad sobre las respuestas posibles de cada pregunta tipada. Los tipos de pregunta citados son `noul` (sí/no), elección entre opciones y puntuación. El modelo admite entrada multimodal (texto e imágenes) cuando se carga junto al proyector de visión `mmproj-vllm-d3-flash-BF16.gguf` de ggml-org.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. La innovación técnica destacable es la compresión Artemis aplicada sobre el modelo original: según el autor, reduce el peso de 17,0 GiB a 6,1 GiB de VRAM con un 94,5 % de coincidencia de respuesta respecto al original, y sin cambios en las respuestas confiadas (métrica "confident changes" = 0). El soporte de d3 en llama.cpp es reciente (build b11572, 12 de octubre de 2026) y el autor advierte de una limitación conocida: con varios slots paralelos, llama.cpp puede alterar la respuesta de d3 si una petición más corta comparte batch (issue ggml-org/llama.cpp#30402, abierto a 14 de octubre de 2026), por lo que recomienda `-np 1`.

## Capacidades

- Clasificación y decisión tipada sobre texto: respuestas sí/no, elección única y puntuaciones con probabilidad asociada.
- Decisión multimodal: acepta imágenes enviadas como data URLs en un array `images` de nivel superior en la petición a `/v1/systemone`, siempre que se cargue el proyector de visión.
- Triaje y enrutamiento: pensado explícitamente para routing, triage y "typed checks" según el autor.
- Salida probabilística en una sola pasada, sin generación autoregresiva de texto libre.
- No soporta conversación: la ventana de chat y `/v1/chat/completions` no lo ejecutan como modelo de decisión.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible; el modelo está diseñado para decisiones puntuales.
- Capacidades multilingües: no disponible.

## Casos de uso

- Triaje de tickets de soporte: enviar el texto del ticket como `state` y preguntar, por ejemplo, `"urgency": {"type": "noul", ...}` para obtener una probabilidad de urgencia; el ejemplo de la model card usa precisamente un mensaje sobre una integración de Stripe que falla. Adecuado por su bajo coste de VRAM (6,1 GiB) y su respuesta en una pasada.
- Enrutamiento de peticiones en pipelines internos: clasificar cada entrada hacia el modelo o el equipo adecuado mediante preguntas de elección única, aprovechando que el modelo devuelve una distribución de probabilidad por opción en lugar de texto libre.
- Moderación y comprobaciones binarias: aplicar preguntas sí/no sobre contenido de usuario para filtrar o marcar casos antes de un revisión humana, con umbrales ajustables sobre la probabilidad devuelta.
- Verificación de documentos con imagen: cargar el proyector de visión y decidir sobre capturas, formularios o imágenes escaneadas, elevando el batch a 8.192 tokens porque varias imágenes grandes pueden superar los 4.096.
- Despliegue en hardware modesto: ejecutar el modelo de texto en una GPU de 8 GB con llama-server y el archivo IQ4_XS, útil para entornos de borde o estaciones de trabajo sin aceleradores de gran capacidad.
- Integración en LM Studio para prototipado: cargar `turintech/d3-flash-artemis@iq4_xs` y enviar peticiones de decisión a `/v1/systemone` en el puerto 1234, lo que facilita pruebas locales antes de pasar a producción con llama-server.
- Clasificación por lotes con contexto largo: con 16.384 tokens de contexto configurados, procesar documentos o hilos de conversación extensos en una sola decisión, manteniendo `-ub 4096 -b 4096` para que el prompt quepa en un batch.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Agreement with the original | LocalLLaMA/typed-decisions (Test decisions) | Same answer (%) | 94,5 |
| Agreement with the original | LocalLLaMA/typed-decisions (Test decisions) | Confident changes | 0 |
| Typed decisions | LocalLLaMA/typed-decisions (Test decisions) | Accuracy (%) | 72,25 |

El autor compara además la coincidencia con el original frente a la cuantización ggml-org Q4_K_M, que obtiene un 95,0 % de respuestas idénticas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM para texto: 6,1 GiB con el archivo IQ4_XS (4,87 GB en disco), frente a 17,0 GiB del modelo original.
- VRAM para visión: requiere una GPU mayor que la de 8 GB, ya que hay que cargar además el proyector `mmproj-vllm-d3-flash-BF16.gguf`; el autor no especifica la cifra exacta.
- GPU consumer: el texto cabe en GPU de 8 GB; el autor no detalla modelos concretos (RTX 4090, A100, H100) en la información disponible.
- Despliegue: llama-server de llama.cpp build b11572 o superior (probado en `fcac190`), con `-c 16384 -ub 4096 -b 4096 -np 1`. También LM Studio 0.4.26 (motor CPU 2.64.0) mediante la entrada `turintech/d3-flash-artemis`.
- Ollama: no soportado; Ollama 0.40.4 no carga este archivo (probado el 15 de octubre de 2026).
- vLLM y TGI: no disponible en la información proporcionada.
- Latencia y throughput: no disponibles; el autor solo indica que d3 procesa el prompt en un único batch y que un input mayor que el batch size es rechazado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d3-flash-Artemis-GGUF (IQ4_XS) | 8.953.803.264 | 16.384 (config. recomendada) | 94,5 % misma respuesta que el original; 72,25 % accuracy en decisiones tipadas | Apache 2.0 | GGUF en Hugging Face, LM Studio |
| d3-flash (original, vllm-sr) | no disponible | no disponible | Referencia de comparación | no disponible | Modelo base |
| Cuantización ggml-org Q4_K_M de d3-flash | no disponible | no disponible | 95,0 % misma respuesta que el original | no disponible | GGUF en ggml-org |

No se dispone de datos suficientes para comparar con modelos de clasificación o decisión de otros autores; la comparativa disponible se limita a las variantes del propio d3-flash.

## Limitaciones y advertencias

- No es un modelo conversacional: no funciona en la ventana de chat ni en `/v1/chat/completions`; solo responde en `/v1/systemone`.
- Requiere llama.cpp b11572 o superior; versiones anteriores no cargan el formato d3.
- Con varios slots paralelos (`-np` mayor que 1), llama.cpp puede alterar la respuesta si una petición corta comparte batch (issue abierto ggml-org/llama.cpp#30402); el autor recomienda `-np 1`.
- El prompt completo debe caber en el batch size configurado (`-ub 4096 -b 4096`); entradas más largas son rechazadas.
- Para visión hay que elevar el batch a 8.192 tokens, ya que varias imágenes grandes superan los 4.096.
- Sin soporte en Ollama 0.40.4 según las pruebas del autor.
- Precisión limitada: 72,25 % de accuracy en decisiones tipadas y 94,5 % de coincidencia con el original; un 5,5 % de respuestas puede diferir del modelo sin cuantizar.
- Sesgos conocidos, riesgo de alucinación en texto libre e idiomas soportados: no disponibles en la información proporcionada; al no generar texto libre, el riesgo de alucinación se traslada a la calibración de las probabilidades.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base vllm-sr/d3-flash, cuya licencia no se detalla en la información disponible.
- Las métricas de la model card están declaradas por el autor y marcadas como no verificadas.

## Enlaces

- Hugging Face: https://huggingface.co/turintech/d3-flash-Artemis-GGUF
- Página de resultados: https://huggingface.co/turintech/d3-flash-Artemis-GGUF/blob/main/RESULTS.md
- TurinTech: https://www.turintech.ai
- Otros modelos de TurinTech: https://huggingface.co/turintech
- LM Studio: https://lmstudio.ai/turintech/d3-flash-artemis
- Discord de TurinTech: https://discord.gg/5mCDSyU9sT
- LinkedIn de TurinTech: https://www.linkedin.com/company/turintechai
- Modelo base: https://huggingface.co/vllm-sr/d3-flash
- Proyector de visión: https://huggingface.co/ggml-org/vllm-d3-flash-GGUF
- Issue de llama.cpp: https://github.com/ggml-org/llama.cpp/issues/30402
