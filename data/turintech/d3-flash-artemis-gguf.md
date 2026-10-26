# turintech/d3-flash-Artemis-GGUF

## Resumen

d3-flash-Artemis-GGUF es la versión cuantizada en GGUF de d3-flash, un modelo de decisión desarrollado por TurinTech (en colaboración con el ecosistema SystemOne) que responde preguntas tipadas sobre un texto de entrada devolviendo, en una sola pasada, una probabilidad para cada respuesta posible. No es un modelo conversacional: se consume a través del endpoint `/v1/systemone` de `llama-server`, no de `/v1/chat/completions`, y su salida es una distribución de probabilidad sobre opciones definidas por el usuario (por ejemplo, preguntas de tipo `noul` con instrucciones como "¿este mensaje expresa urgencia?").

El modelo base `vllm-sr/d3-flash` tiene 8.953.803.264 parámetros (unos 8,95 mil millones) y está publicado en safetensors; esta ficha distribuye los pesos convertidos a GGUF y cuantizados. El archivo por defecto, `d3-flash-Artemis-IQ4_XS.gguf`, ocupa 4,87 GB y consume un pico de 6,1 GiB de VRAM para texto (8,3 GiB si se añaden imágenes), frente a los 17,0 GiB que requiere el modelo original: eso lo sitúa en el rango de una GPU de consumo de 8 GB.

La relevancia práctica está en el coste y la estabilidad de la decisión: según el autor, coincide con la salida del modelo en BF16 en el 94,5 % de 2.000 decisiones de test, sin cambios en respuestas "confidentes", muy cerca del 95,0 % que obtiene el Q4_K_M de ggml-org (6,60 GB). Está pensado para enrutado, triaje y comprobaciones tipadas, y admite también entradas de imagen mediante un proyector vision separado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el autor no detalla la arquitectura; el modelo base es `vllm-sr/d3-flash`, especializado en decisiones tipadas) |
| Parámetros totales | 8.953.803.264 (≈8,95 mil millones), dato real de safetensors del modelo base |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 16.384 tokens en la configuración documentada (`-c 16384`); longitud de contexto de entrenamiento no disponible |
| Tipos de cuantización | GGUF: `IQ4_XS` (4,87 GB, por defecto), `IQ3_M`; existe además un `Q4_K_M` (6,60 GB) publicado por ggml-org; el original en BF16 requiere 17,0 GiB |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (librería `gguf`); pesos originales del modelo base en safetensors |

## Arquitectura y entrenamiento

El autor no publica detalles de arquitectura ni del proceso de entrenamiento en la model card: se indica únicamente que es un "decision model" de la familia d3, con el modelo base `vllm-sr/d3-flash` y relación `quantized`. No hay información disponible sobre número de tokens de entrenamiento, composición del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO. Lo que sí se describe es el contrato de inferencia: el modelo recibe un `state` (texto o imágenes) y un conjunto de `questions` con un tipo (`noul` en los ejemplos, además de preguntas de elección) e instrucciones, y devuelve una probabilidad por respuesta en una sola pasada.

La innovación destacable no está en el entrenamiento sino en el formato de salida y en la conversión: el autor reporta que la cuantización IQ4_XS conserva la decisión del BF16 en el 94,5 % de los casos y que ninguna respuesta "confidente" cambió de valor. En el plano operativo, d3 exige leer el prompt completo en un solo lote (`-ub 4096 -b 4096`, o 8192 con imágenes), de modo que una entrada mayor que el tamaño de batch es rechazada; además, con varios slots en `llama-server` una petición corta que comparta batch puede alterar la respuesta (issue abierto ggml-org/llama.cpp#30402), por lo que se recomienda `-np 1`. El soporte de d3 en llama.cpp llegó con la release `b11572` (12 de octubre de 2026); las pruebas se hicieron en el commit `fcac190`.

## Capacidades

- Decisión tipada sobre texto: responde preguntas definidas por el usuario devolviendo una probabilidad por respuesta (p. ej. urgencia, enfado, categoría) en una única pasada.
- Tipos de pregunta: `noul` (sí/no/desconocido) y preguntas de elección entre opciones, según los ejemplos de la model card.
- Entrada multimodal con imágenes: requiere el proyector `mmproj-vllm-d3-flash-BF16.gguf` de `ggml-org/vllm-d3-flash-GGUF` y enviar las imágenes como data URLs en un array `images` de nivel superior de la petición.
- Procesamiento de contexto largo dentro del límite configurado: 16.384 tokens, con batch de 4.096 para texto y 8.192 cuando se envían varias imágenes grandes.
- Integración con servidores: endpoint `/v1/systemone` en `llama-server` y en el servidor de LM Studio (puerto 1234 por defecto, indicando el nombre del modelo).
- Ejecución en hardware de consumo: validado en NVIDIA RTX 5090 y en Apple M3 Max (36 GB) con llama.cpp Metal `b11617`.
- No soporta: uso como modelo de chat, generación de texto libre, tool calling ni razonamiento multi-paso de agente (no documentado en la información disponible).

## Casos de uso

- Triaje de tickets de soporte: enviar el texto del ticket como `state` y preguntas tipadas sobre urgencia, enfado o categoría; el modelo devuelve probabilidades que permiten priorizar la cola sin un LLM generativo, con 6,1 GiB de VRAM en una GPU de 8 GB.
- Enrutado de peticiones a departamentos: definir una pregunta de elección con las áreas disponibles (facturación, técnico, comercial) y usar la opción de mayor probabilidad como destino del ticket, en una sola llamada.
- Guardrails y filtros previos en pipelines de agentes: clasificar la intención o el riesgo de un mensaje antes de pasarlo a un modelo conversacional, aprovechando el endpoint dedicado y la latencia de una única pasada.
- Clasificación de documentos escaneados o capturas: con el proyector vision, decidir sobre imágenes (por ejemplo, comprobantes de pago o capturas de error) en el mismo endpoint, subiendo el batch a 8.192 tokens.
- Moderación y análisis de sentimiento a escala: procesar lotes de mensajes con preguntas tipo `noul` sobre tono o toxicidad, manteniendo `-np 1` para evitar que la composición del batch altere la decisión.
- Enriquecimiento de datos en pipelines ETL: etiquetar registros de texto con decisiones tipadas y almacenar la probabilidad asociada como señal de confianza para revisión humana posterior.
- Despliegue en estaciones de trabajo sin GPU de datacenter: servir el modelo con LM Studio o `llama-server` en una máquina de 8 GB de VRAM para validaciones internas y prototipos.

## Benchmarks y rendimiento

| Tarea | Dataset | Métrica | Valor | Fuente |
|---|---|---|---|---|
| Agreement with the original | LocalLLaMA/typed-decisions (2.000 decisiones de test) | Same as BF16 (%) | 94,5 | TurinTech (no verificado) |
| Agreement with the original | LocalLLaMA/typed-decisions (2.000 decisiones de test) | Confident changes | 0 | TurinTech (no verificado) |

Referencia comparativa citada por el autor: el `Q4_K_M` de ggml-org (6,60 GB) coincide con el original en el 95,0 % de esas mismas decisiones. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras suites estándar en la información disponible; las métricas anteriores miden fidelidad respecto al BF16, no calidad absoluta.

## Requisitos de hardware

- VRAM estimada: 6,1 GiB de pico para texto y 8,3 GiB con imágenes (medido en RTX 5090 con IQ4_XS); el modelo original en BF16 necesita 17,0 GiB.
- GPU validadas: NVIDIA RTX 5090 (texto e imagen). Apple M3 Max de 36 GB con llama.cpp Metal `b11617` carga y responde con todos los archivos publicados.
- GPU de consumo: sí, el archivo por defecto está pensado para una GPU de 8 GB; los 8,3 GiB con imágenes exceden ese margen y requieren una GPU mayor.
- Despliegue: `llama-server` (llama.cpp `b11572` o superior; probado en `fcac190`) y LM Studio 0.4.26 con su motor CPU llama.cpp 2.64.0 en Linux x86-64 (solo texto). No hay paquete verificado para Ollama.
- Comando de referencia: `llama-server -hf turintech/d3-flash-Artemis-GGUF:IQ4_XS --port 8080 -c 16384 -ub 4096 -b 4096 -np 1`; con visión, añadir `--mmproj mmproj-vllm-d3-flash-BF16.gguf` y subir batch a 8.192.
- Latencia y throughput: no disponibles (la model card no publica métricas de velocidad).
- Almacenamiento: 4,87 GB para el archivo por defecto; el repositorio completo ocupa 9,5 GB.

## Comparativa con modelos similares

| Modelo / variante | Parámetros | Contexto | Memoria pico | Coincidencia con BF16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| d3-flash-Artemis IQ4_XS (esta ficha) | 8,95 mil M | 16.384 tokens (config. documentada) | 6,1 GiB texto / 8,3 GiB imagen | 94,5 % | Apache 2.0 | GGUF en HuggingFace y LM Studio Hub |
| ggml-org Q4_K_M de d3-flash | 8,95 mil M (mismo base) | no disponible | no disponible (archivo de 6,60 GB) | 95,0 % | Apache 2.0 (modelo base) | GGUF en `ggml-org/vllm-d3-flash-GGUF` |
| d3-flash original (BF16) | 8,95 mil M | no disponible | 17,0 GiB | referencia | Apache 2.0 | safetensors (`vllm-sr/d3-flash`) |

No se dispone de datos de otros modelos de decisión comparables en la información proporcionada; la comparativa se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- No es un modelo de chat: el endpoint `/v1/chat/completions` y la ventana de chat de LM Studio no lo ejecutan como modelo de decisión; hay que usar `/v1/systemone`.
- El prompt completo debe caber en el batch (`-ub`/`-b`); una entrada más larga que el tamaño de batch se rechaza, y con varias imágenes grandes conviene subir a 8.192.
- Con más de un slot (`-np` > 1), una petición corta que comparta batch puede cambiar la respuesta (ggml-org/llama.cpp#30402, abierto a 14 de octubre de 2026); se recomienda `-np 1`, lo que limita el throughput por concurrencia.
- Las métricas de la model card están marcadas como no verificadas (`verified: false`) y miden agreement con el BF16, no exactitud frente a una etiqueta de referencia.
- Idiomas soportados no documentados: no hay garantía de comportamiento multilingüe ni de cobertura fuera del inglés de los ejemplos.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: al ser un modelo de clasificación con salida tipada, el riesgo se traslada a decisiones mal calibradas o a respuestas "desconocidas"; conviene usar la probabilidad como umbral y no solo la etiqueta argmax.
- Dependencia de terceros: el proyector vision recomendado proviene de `ggml-org/vllm-d3-flash-GGUF`, no del repositorio de TurinTech.
- Licencia Apache 2.0: permite uso comercial y modificación, con las obligaciones habituales de atribución y aviso de cambios; el modelo base es `vllm-sr/d3-flash`, cuyos términos conviene revisar por separado.
- Compatibilidad: se exige llama.cpp `b11572` o superior; versiones anteriores no soportan d3.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/turintech/d3-flash-Artemis-GGUF
- Resultados declarados en la model card: https://huggingface.co/turintech/d3-flash-Artemis-GGUF#results
- Sitio del autor: https://turintech.ai
- Entrada en LM Studio Hub: https://lmstudio.ai/turintech/d3-flash-artemis
- Hilo de feedback del autor: https://huggingface.co/spaces/turintech/README/discussions/1
- Proyector vision (terceros): https://huggingface.co/ggml-org/vllm-d3-flash-GGUF
- Issue de llama.cpp sobre batches y respuestas d3: https://github.com/ggml-org/llama.cpp/issues/30402
- Modelo base: https://huggingface.co/vllm-sr/d3-flash
- No se han encontrado otros enlaces relevantes (papers, blogs o demos) en la búsqueda web disponible.
