# webmp3/Sakura-Inkling-2-Mini-Uncensored-GGUF

## Resumen

Sakura-Inkling-2-Mini-Uncensored-GGUF es una cuantización comunitaria en formato GGUF del modelo multimodal Inkling-2-Mini de Thinking Machines, publicada por el usuario webmp3. No se trata de un modelo original, sino de una conversión a 4, 5 y 6 bits de una variante modificada ("abliterated") de los pesos originales, en la que se ha reducido deliberadamente la tasa de rechazos ante peticiones que el modelo base declinaría. El modelo subyacente es un MoE multimodal con 26.400 millones de parámetros totales, 3.400 millones activos por token, 128 expertos (8 activos) y hasta 1 millón de tokens de contexto.

La relevancia de esta publicación es doble. Por un lado, ofrece versiones ejecutables en hardware de consumo de un MoE de 26B con entrada de imagen, algo poco habitual. Por otro, documenta de forma inusualmente transparente el proceso de cuantización: incluye métricas de divergencia KL frente a un Q8_0 de los mismos pesos, coincidencia de token top-1 y un recuento de rechazos sobre un conjunto de 40 prompts. El autor advierte explícitamente de que no se han medido benchmarks, calidad de respuesta ni comportamiento en contexto largo.

El repositorio requiere llama.cpp b12600 o superior, ya que la arquitectura "looped" de Inkling 2 Mini no está presente en compilaciones anteriores. Las versiones de Ollama y LM Studio que empaqueten un llama.cpp más antiguo no cargarán estos ficheros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal "looped" (image-text-to-text), 128 expertos con 8 activos |
| Parametros totales | 26.070.385.152 (26,07 B) |
| Parametros activos | 3,4 B por token |
| Longitud de contexto | Hasta 1.000.000 de tokens (modelo base); el autor recomienda `-c 8192` en los ejemplos |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K (con imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (incluye `mmproj` BF16 para vision) |

## Arquitectura y entrenamiento

El modelo base es un mezcla de expertos multimodal con 26,4 B de parámetros totales y 3,4 B activos por token, distribuidos en 128 expertos de los que se activan 8 por token. La arquitectura se describe como "looped", un esquema de capas recurrentes que requiere soporte específico en el runtime (`inkling2_loop` en llama.cpp). Acepta entrada de imagen mediante un proyector de visión separado (`mmproj-Inkling-2-Mini-BF16.gguf`), y el pipeline declarado en Hugging Face es `image-text-to-text`. El contexto máximo anunciado es de 1 M de tokens.

Sobre el entrenamiento del modelo original no se proporciona información en la documentación disponible: no se detallan el número de tokens, la composición del dataset ni si hubo RLHF, DPO u otras fases de alineamiento. Lo que sí se documenta es el proceso de esta publicación: los pesos modificados provienen de `IsValorum/Inkling-2-Mini-Abliterated-BF16-GGUF`, una variante BF16 con comportamiento de rechazo reducido cuyo método de creación el autor de esta cuantización declara no conocer ni avalar. La matriz de importancia y el proyector de visión son de ggml-org y se reutilizan sin cambios; la matriz se calculó sobre el modelo sin modificar y cubre 224 de las 226 tensores de pesos de 16 bits del fichero fuente (quedan fuera el embedding de tokens y la salida). La cuantización se realizó con `llama-quantize --imatrix` sobre la build b12600 de llama.cpp (revisión `29b52d398b294509746ec0a3f28948a3107c0213`, compilación CPU).

Un detalle técnico relevante: los expertos de 4 bits de las capas 0 a 19 provienen de NVFP4 en el checkpoint original, un formato de 4 bits distinto de los K-quants empleados aquí, por lo que los ficheros de 4 bits acumulan un segundo paso de redondeo.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline declarado `conversational`.
- Entrada de imagen (image-text-to-text) mediante el proyector `mmproj` incluido en el repositorio.
- Modo de razonamiento ("thinking") activable por defecto y desactivable enviando `chat_template_kwargs` con `reasoning_effort` a `none`.
- Ventana de contexto de hasta 1 M de tokens en el modelo base (no verificada en estas cuantizaciones).
- Comportamiento de rechazo reducido respecto al modelo original: 5/40, 3/40 y 6/40 respuestas con frase de rechazo en Q4_K_M, Q5_K_M y Q6_K respectivamente, frente a 16/40 del modelo sin modificar.
- Servidor compatible con la API de OpenAI (`/v1`) a través de `llama-server`.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agentes y razonamiento multi-paso: no documentadas explícitamente.
- Capacidades multilingües: solo se declara inglés; el conjunto de evaluación KLD incluyó texto en inglés, código, alemán y chino, pero no se declara soporte de esos idiomas.
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistencia conversacional autoalojada: el modelo puede mantener diálogos multi-turno en inglés servido mediante `llama-server` con el endpoint compatible con OpenAI, lo que permite sustituir una API externa por inferencia local con 3,4 B de parámetros activos por token.
- Procesamiento de documentos con imagen: gracias al proyector `mmproj` incluido, puede recibir capturas, diagramas o páginas escaneadas junto a texto, útil para extracción de información en flujos internos.
- Análisis de contexto largo en local: el modelo base admite hasta 1 M de tokens, lo que en teoría permite resumir o consultar corpus extensos; conviene validar el comportamiento real más allá de los 8 K tokens recomendados en los ejemplos, ya que el autor no lo ha medido.
- Prototipado e investigación sobre alineamiento: la diferencia de tasa de rechazo frente al original (16/40 frente a 3-6/40) lo convierte en un objeto de estudio para quienes investigan comportamiento de rechazo y modificaciones de pesos.
- Despliegue en estaciones de trabajo con GPU única: el fichero Q4_K_M (17,48 GB) cabe en GPUs de 24 GB, lo que permite ejecutar un MoE de 26B con visión en hardware de gama alta de consumo.
- Evaluación comparativa de cuantizaciones: las métricas de KLD y coincidencia de token top-1 publicadas permiten a un equipo decidir entre Q4_K_M, Q5_K_M y Q6_K según su presupuesto de memoria y tolerancia a la degradación.
- Generación de código: el conjunto de evaluación KLD incluyó fragmentos de código, pero no se han publicado benchmarks de código; su uso en producción para esta tarea requeriría evaluación propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor indica explícitamente que los benchmarks no se midieron.

Las únicas métricas publicadas son de fidelidad de la cuantización y de tasa de rechazo:

| Fichero | Cuantización | Tamano | KLD medio vs Q8_0 | Mismo token top-1 | Rechazos (de 40) |
|---|---|---|---|---|---|
| `Sakura-Inkling-2-Mini-Uncensored-Q4_K_M.gguf` | Q4_K_M | 17,48 GB | 0,0251 | 92,60 % | 5 / 40 |
| `Sakura-Inkling-2-Mini-Uncensored-Q5_K_M.gguf` | Q5_K_M | 19,91 GB | 0,0139 | 94,49 % | 3 / 40 |
| `Sakura-Inkling-2-Mini-Uncensored-Q6_K.gguf` | Q6_K | 23,49 GB | 0,0084 | 94,49 % | 6 / 40 |
| Modelo sin modificar (IQ4_NL de ggml-org) | IQ4_NL | no disponible | no disponible | no disponible | 16 / 40 |

Metodología declarada: el KLD se calcula frente a un Q8_0 generado de los mismos pesos modificados, sobre 5 fragmentos de 256 tokens (inglés, código, alemán y chino), y mide solo el paso de cuantización, no la diferencia con el modelo original. El recuento de rechazos usa 40 prompts del conjunto público `mlabonne/harmful_behaviors`, decodificación greedy, thinking desactivado y 48 tokens por respuesta, contando respuestas que contienen una frase de rechazo. El autor advierte de que es una muestra pequeña y un recuento de frases, no una evaluación de seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 17,5 GB para Q4_K_M, 20 GB para Q5_K_M y 23,5 GB para Q6_K, a los que hay que sumar el espacio del proyector de visión y la caché KV según la longitud de contexto.
- GPU recomendadas: no especificadas por el autor. Por tamaño de fichero, Q4_K_M encaja en GPUs de 24 GB (RTX 3090, RTX 4090, A10G, L4 de 24 GB); Q6_K requiere 24 GB con poco margen o GPUs de 32 GB o más (A100 40 GB, H100).
- Cabe en GPU de consumo: sí, Q4_K_M y Q5_K_M en tarjetas de 24 GB; el autor no ha publicado pruebas de offload parcial ni de rendimiento en backends concretos.
- Opciones de despliegue: `llama.cpp` (build b12600 o superior, obligatorio), `llama-server` con endpoint compatible con OpenAI, Ollama (no probado por el autor, requiere una versión con la arquitectura `inkling2_loop`) y LM Studio (no probado, misma condición). vLLM y TGI no están mencionados en la documentación.
- Latencia y throughput: no disponibles. El autor declara que la velocidad no se midió.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Sakura-Inkling-2-Mini-Uncensored (esta ficha) | 26,07 B | 3,4 B | 1 M (base) | Apache-2.0 | GGUF Q4_K_M / Q5_K_M / Q6_K | Rechazos reducidos; requiere llama.cpp b12600+ |
| thinkingmachines/Inkling-2-Mini (original) | 26,4 B | 3,4 B | 1 M | Apache-2.0 | safetensors y GGUF (ggml-org) | Comportamiento de rechazo estándar (16/40 en la prueba del autor) |
| ggml-org/Inkling-2-Mini-GGUF (IQ4_NL) | 26,4 B | 3,4 B | 1 M | Apache-2.0 | GGUF | Cuantización oficial de referencia del modelo sin modificar |
| IsValorum/Inkling-2-Mini-Abliterated-BF16-GGUF | 26,4 B | 3,4 B | 1 M | Apache-2.0 | GGUF BF16 | Pesos modificados de origen de esta publicación; sin datos de calidad publicados |

No se dispone de comparaciones con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- El autor no ha medido benchmarks, calidad de respuesta frente al original, comportamiento en contexto largo, entrada de imagen con estos ficheros, velocidad ni backends de GPU. Cualquier uso en producción requiere evaluación propia.
- La reducción de rechazos implica que el modelo responderá a peticiones que el original declinaría. El autor remite a la política de uso aceptable del modelo original y declara que la responsabilidad de uso recae en el usuario.
- El recuento de rechazos se basa en 40 prompts y en la detección de frases concretas; una respuesta sin frase de rechazo no garantiza calidad ni adecuación.
- Los pesos modificados provienen de un tercero (`IsValorum`) y el autor de esta cuantización declara no poder avalar cómo se obtuvieron.
- Los ficheros de 4 bits acumulan un segundo redondeo en los expertos de las capas 0 a 19, que provienen de NVFP4 en el checkpoint original.
- Solo se declara soporte de inglés; no hay evidencia de calidad en otros idiomas.
- Riesgo de alucinación: no cuantificado en la documentación disponible.
- Sesgos conocidos: no documentados.
- Restricción de runtime: requiere llama.cpp b12600 o superior; Ollama y LM Studio con runtimes antiguos fallarán al cargar el modelo.
- Licencia Apache-2.0, que permite uso comercial, pero sujeta a la política de uso aceptable del modelo base según indica el autor.
- El contexto de 1 M de tokens corresponde al modelo base y no ha sido validado en estas cuantizaciones; los ejemplos del autor usan 8 K.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/webmp3/Sakura-Inkling-2-Mini-Uncensored-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Pesos modificados de origen: https://huggingface.co/IsValorum/Inkling-2-Mini-Abliterated-BF16-GGUF
- Cuantizaciones y matriz de importancia de ggml-org: https://huggingface.co/ggml-org/Inkling-2-Mini-GGUF
- Política de uso aceptable del modelo original: https://thinkingmachines.ai/model-acceptable-use-policy/
- Conjunto de prompts de rechazo: `mlabonne/harmful_behaviors` (referenciado en la model card; sin URL directa en la información proporcionada)
