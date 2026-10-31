# turintech/Kev-0.8B-Artemis-GGUF

## Resumen

Kev-0.8B-Artemis-GGUF es una versión cuantizada en formato GGUF del modelo Kev-0.8B, desarrollada por TurinTech a partir del modelo base jaredpalmer/kev-0.8b. No se trata de un modelo conversacional, sino de un "decision model": un modelo especializado en tareas de enrutado y triaje que responde preguntas tipificadas (elección entre opciones, sí o no, puntuación en una escala) en una sola pasada, devolviendo una probabilidad para cada respuesta posible.

El problema que resuelve es la necesidad de tomar decisiones estructuradas de bajo coste en pipelines de producción: clasificar tickets, enrutar peticiones a equipos o agentes, detectar urgencia o intenciones, sin necesidad de desplegar un LLM grande. Con 752,9 millones de parámetros y un archivo por defecto de solo 0,62 GB (Q6_K), cabe con holgura en GPUs de consumo y ofrece latencias mínimas.

Su relevancia actual radica en el creciente interés por modelos pequeños dedicados a "routing" y "triage" dentro de arquitecturas multi-agente. Se ejecuta mediante llama.cpp (versión b11540 o superior) a través del endpoint dedicado `/v1/systemone` de llama-server, o mediante Ollama, y la cuantización con imatrix mantiene un acuerdo del 95,10 % con el modelo original en BF16 sobre 1.000 decisiones del conjunto de evaluación "final set".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decision model basado en transformer (detalle exacto no disponible); inferencia vía llama.cpp con endpoint `/v1/systemone` |
| Parámetros totales | 752.917.824 (~0,75 B) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible (contexto de entrenamiento no publicado; en inferencia se recomienda `-c 16384` para no reservar memoria del contexto completo) |
| Tipos de cuantización | Q6_K (archivo por defecto, 0,620 GB); cuantización con imatrix |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible llama.cpp y Ollama) |

## Arquitectura y entrenamiento

Kev-0.8B-Artemis-GGUF deriva del modelo base jaredpalmer/kev-0.8b y ha sido cuantizado por TurinTech usando su herramienta Artemis, con estimación de matriz de importancia (imatrix) para preservar la fidelidad de las respuestas tras la cuantización. El modelo funciona como clasificador de texto: en lugar de generar texto libre, evalúa un "estado" (un texto de entrada) contra un conjunto de preguntas tipificadas y produce, en una sola pasada (0 tokens de salida), probabilidades calibradas por cada opción.

Los tres tipos de pregunta soportados son: `choice` (elegir una opción entre varias con criterios nombrados), `noul` (probabilidad de sí/no) y `score` (nivel esperado sobre una escala definida por el usuario, con distribución de probabilidades por nivel y una medida de confianza). El modelo cuantizado fue validado contra el original en BF16 sobre el dataset LocalLLaMA/typed-decisions ("Final set"), alcanzando un acuerdo del 95,10 % en 1.000 decisiones y cero cambios en respuestas de alta confianza. Los detalles del entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) no están disponibles.

## Capacidades

- Clasificación de texto estructurada: responde preguntas tipificadas (`choice`, `noul`, `score`) con probabilidades por cada respuesta, en una sola pasada sin generación de tokens.
- Enrutado y triaje: asignación de entradas (tickets, mensajes, peticiones) a categorías, equipos o agentes definidos por el usuario.
- Detección binaria: cálculo de la probabilidad de que una afirmación sea cierta sobre un texto dado (tipo `noul`).
- Puntuación en escalas: estimación del nivel esperado sobre escalas personalizadas (por ejemplo, urgencia baja/media/alta) con distribución completa de probabilidades.
- Medida de confianza: cada respuesta incluye un valor de confianza, útil para escalar a un modelo mayor o a revisión humana cuando la confianza es baja.
- Ejecución local: funciona en GPU propia vía llama.cpp (`llama-server` con endpoint `/v1/systemone`) o mediante Ollama.
- No soporta: generación de texto conversacional, tool calling, agentes multi-paso, visión ni audio. No es un modelo de chat y no debe ejecutarse como tal.

## Casos de uso

- Enrutado de tickets de soporte: clasificar cada ticket entrante al equipo adecuado (facturación, técnico, ventas) con una sola petición al endpoint `/v1/systemone`, usando el campo `choice` con criterios personalizados; con 0,75 B de parámetros, el coste por decisión es mínimo.
- Detección de urgencia en mensajes de clientes: mediante preguntas tipo `score` con escalas definidas (bajo/medio/alto), priorizando automáticamente colas de atención al cliente.
- Filtrado de intenciones antes de un LLM grande: usar Kev como primer filtro para decidir si un mensaje requiere refund, escalado humano o respuesta automática, ahorrando llamadas a modelos costosos.
- Moderación y triaje de contenido: clasificación binaria (`noul`) de si un texto incumple una política concreta, con probabilidad calibrada para establecer umbrales.
- Orquestación multi-agente: como router de bajo coste que decide qué agente especializado debe atender cada petición dentro de un sistema de agentes, gracias a su latencia mínima y su bajo consumo de memoria (pico de 5,2 GiB).
- Clasificación en dispositivos o servidores modestos: el archivo Q6_K de 0,62 GB permite desplegar clasificación semántica en GPUs de consumo o incluso en entornos con VRAM limitada.
- Análisis de feedback a escala: puntuar miles de comentarios de usuarios (satisfacción, categoría, prioridad) en lotes, con una única pasada de inferencia por elemento.

## Benchmarks y rendimiento

Resultados declarados por el autor (TurinTech) sobre el dataset LocalLLaMA/typed-decisions ("Final set", 1.000 decisiones), comparando la versión cuantizada con el modelo original en BF16:

| Métrica | Valor |
|---|---|
| Acuerdo con el original BF16 (mismas respuestas) | 95,10 % |
| Cambios en respuestas de alta confianza | 0 |
| Accuracy del modelo | 46,8 % |

Como referencia declarada en la model card, la cuantización Q8_0 de ggml-org (0,812 GB) alcanza un acuerdo del 98,20 % con el original. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: pico de 5,2 GiB medido en una NVIDIA A100-SXM4-80GB con la configuración recomendada (`-c 16384 -ub 4096 -b 4096 -np 1`); el archivo Q6_K pesa 0,620 GB, por lo que gran parte de la memoria corresponde al contexto y buffers de llama.cpp.
- GPU recomendada: cualquier GPU CUDA moderna; los datos publicados provienen de una NVIDIA A100-SXM4-80GB. No se han publicado mediciones en otras GPUs.
- Consumer GPUs: por tamaño (0,62 GB de pesos y pico de 5,2 GiB en inferencia), debería funcionar sin problemas en GPUs de consumo con 6 GB de VRAM o más (por ejemplo, RTX 3060, RTX 4060 o superiores), aunque no hay mediciones oficiales en estas tarjetas.
- Despliegue: llama.cpp (versión b11540 o posterior, probado en el commit `1e6f04a`, compilado para CUDA) mediante `llama-server` y el endpoint `/v1/systemone`; también disponible paquete oficial en Ollama (`turintech/kev-0.8b-artemis:q6_k`). No se recomienda ejecutarlo como modelo de chat vía el botón de llama.cpp de HuggingFace; LM Studio requiere importar el archivo con los ajustes de contexto y batch manuales.
- Latencia y throughput: no disponibles como cifras concretas; el modelo produce respuestas en una sola pasada con 0 tokens de salida, lo que implica latencias muy bajas.

## Comparativa con modelos similares

| Característica | Kev-0.8B-Artemis-GGUF | Kev-0.8B Q8_0 (ggml-org) | LLM generalista pequeño (p. ej. Qwen2.5-0.5B) |
|---|---|---|---|
| Parámetros | 752,9 M | 752,9 M | ~500 M |
| Tamaño del archivo | 0,620 GB (Q6_K) | 0,812 GB (Q8_0) | ~0,4–1 GB según cuantización |
| Tarea | Clasificación tipificada (decision model) | Clasificación tipificada (decision model) | Generación de texto general |
| Acuerdo con BF16 | 95,10 % | 98,20 % | No aplicable |
| Salida | Probabilidades por respuesta, 0 tokens generados | Probabilidades por respuesta, 0 tokens generados | Texto libre, requiere parsing |
| Licencia | Apache 2.0 | No disponible | Apache 2.0 (Qwen2.5) |
| Ejecución | llama.cpp `/v1/systemone`, Ollama | llama.cpp | Universal (llama.cpp, vLLM, TGI, etc.) |

Frente a un LLM generalista pequeño, Kev-0.8B no genera texto sino probabilidades estructuradas en una pasada, lo que elimina el parsing y reduce la latencia, a costa de no servir para tareas conversacionales.

## Limitaciones y advertencias

- No es un modelo conversacional: no genera texto libre y no debe ejecutarse como modelo de chat; requiere el endpoint `/v1/systemone` de llama.cpp b11540 o superior, o el paquete de Ollama.
- Accuracy moderada: el 46,8 % de accuracy declarado sobre el dataset typed-decisions indica que, aunque es consistente con su versión BF16, su capacidad de clasificación absoluta es limitada; conviene validar sobre el dominio propio antes de producción.
- La métrica de acuerdo del 95,10 % no está verificada de forma independiente ("verified: false") y proviene del propio autor.
- Sesgos conocidos: no disponibles; al ser un modelo derivado de jaredpalmer/kev-0.8b, hereda los sesgos de sus datos de entrenamiento, que no están documentados.
- Riesgo de alucinación: no aplicable en el sentido clásico (no genera texto), pero las probabilidades pueden estar mal calibradas fuera del dominio de entrenamiento.
- Idiomas soportados no documentados; las instrucciones y criterios de los ejemplos están en inglés, por lo que el rendimiento en castellano es desconocido y debería evaluarse.
- Longitud de contexto de entrenamiento no publicada; en despliegue se recomienda limitar el contexto a 16384 tokens para controlar el consumo de memoria.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones relevantes.
- La configuración publicada se probó con un único slot de petición (`-np 1`); otros valores no fueron testeados por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/turintech/Kev-0.8B-Artemis-GGUF
- Modelo base: https://huggingface.co/jaredpalmer/kev-0.8b
- Web de TurinTech: https://turintech.ai
- Hilo de feedback de TurinTech: https://huggingface.co/spaces/turintech/README/discussions/1
- Sección de resultados de la model card: https://huggingface.co/turintech/Kev-0.8B-Artemis-GGUF#results
- Dataset de evaluación: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
