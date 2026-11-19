# turintech/Kev-4B-Artemis-GGUF

## Resumen

Kev-4B-Artemis-GGUF es una versión cuantizada en formato GGUF del modelo jaredpalmer/kev-4b, publicada por TurinTech bajo el paraguas de su tecnología Artemis. No se trata de un modelo conversacional al uso: es un modelo de decisión que responde preguntas tipadas (sí/no, elección única, puntuación) devolviendo una probabilidad por cada respuesta en una sola pasada, a través del endpoint `/v1/systemone` de llama-server. Con 4.207.062.528 parámetros totales, el artefacto principal ocupa 2,54 GB y requiere 7,6 GiB de VRAM, frente a los 13,1 GiB del modelo original.

La relevancia de esta ficha radica en su enfoque: TurinTech posiciona el modelo para enrutamiento, triaje y comprobaciones tipadas sobre una única GPU de consumo, un nicho donde la mayoría de soluciones recurren a LLM conversacionales con sobrecoste de latencia y memoria. El modelo no chatea y su uso está restringido al endpoint de decisiones de llama.cpp (b11540 o superior). Está publicado con licencia Apache 2.0 y disponible también a través de Ollama y LM Studio.

La información pública no detalla la longitud de contexto de entrenamiento ni los idiomas soportados. La model card sí especifica configuraciones operativas concretas (`-c 16384`, `-ub 4096`, `-b 4096`) y advierte de que el tamaño de batch altera ligeramente las probabilidades, lo que conviene tener en cuenta en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base jaredpalmer/kev-4b; transformer, sin confirmar) |
| Parámetros totales | 4.207.062.528 |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible en entrenamiento; la model card recomienda `-c 16384` en llama-server |
| Tipos de cuantización | GGUF (Q4_K_M citado explícitamente; el repo incluye varias etiquetas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp, Ollama y LM Studio) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base jaredpalmer/kev-4b ni los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO). Lo que sí se documenta es la capa de compresión Artemis de TurinTech, que produce una cuantización GGUF con un tamaño de descarga de 2,54 GB y un consumo de 7,6 GiB de VRAM, frente a los 13,1 GiB del original. El modelo se sirve exclusivamente a través del endpoint `/v1/systemone` de llama-server, que implementa el protocolo de decisión tipada de SystemOne.

La innovación operativa destacable es el formato de respuesta: en lugar de generar texto libre token a token, el modelo devuelve una probabilidad por cada opción de respuesta a una pregunta tipada, en una sola pasada. La model card documenta que el tamaño de batch influye en las probabilidades (0,803 con batch 512 frente a 0,815 con batch 4096 en una prueba sobre una entrada de 854 tokens en una RTX 5090), por lo que la reproducibilidad exige fijar `-ub 4096 -b 4096`. No se documentan técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Respuesta a preguntas tipadas: sí/no (`noul`), elección única y puntuación, con probabilidad asociada a cada opción.
- Enrutamiento y triaje: clasificación de mensajes o peticiones en categorías predefinidas mediante preguntas tipadas.
- Comprobaciones tipadas: validación de condiciones sobre un estado de entrada (por ejemplo, detectar urgencia en un mensaje de soporte).
- Inferencia en una sola pasada: no requiere generación autoregresiva de texto, lo que reduce la latencia frente a un LLM conversacional.
- Ejecución local en una GPU de consumo gracias a la compresión Artemis (7,6 GiB de VRAM).
- Integración con llama.cpp (b11540 o superior, probado en `1e6f04a`), Ollama (0.40.4 probado) y LM Studio (0.4.26 probado).
- No soporta chat conversacional ni el endpoint `/v1/chat/completions`; la model card lo indica explícitamente.
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto del ticket como `state` y responde a preguntas tipadas como "¿expresa urgencia?" o "¿es un problema de facturación?", devolviendo probabilidades que permiten priorizar la cola sin invocar un LLM conversacional.
- Enrutamiento de peticiones en pipelines internos: dado un mensaje de entrada, clasificarlo en una de N categorías mediante una pregunta de elección única y dirigir la petición al servicio correspondiente con bajo coste de inferencia.
- Moderación y filtros de contenido: comprobaciones tipadas binarias (sí/no) sobre textos entrantes para decidir si requieren revisión humana, aprovechando la salida probabilística para fijar umbrales.
- Validación de formularios y datos estructurados: comprobar si un campo cumple una condición descrita en lenguaje natural, con una probabilidad asociada que permite auditar decisiones automatizadas.
- Clasificación por lotes en local: procesar grandes volúmenes de decisiones sobre una única GPU de consumo (7,6 GiB de VRAM, 2,54 GB de descarga), adecuado para entornos sin infraestructura de datacenter.
- Despliegue en el borde o en estaciones de trabajo: servir el modelo con Ollama o LM Studio en equipos de desarrollo para prototipar flujos de decisión antes de escalarlos, manteniendo la misma interfaz `/v1/systemone`.
- Servicio multiusuario ligero: con `-np 8 -c 32768 --cache-ram 0` se obtienen ocho slots de 4.096 tokens con un coste adicional de unos 0,6 GiB de VRAM en una RTX 5090, suficiente para un pequeño equipo interno.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente) sobre el dataset LocalLLaMA/typed-decisions:

| Tarea | Métrica | Valor |
|---|---|---|
| Agreement with the original | Same answer (%) | 93,0 |
| Agreement with the original | Confident changes | 0 |
| Typed decisions | Accuracy (%) | 66,8 |

La model card compara además la tasa de coincidencia con la cuantización ggml-org Q4_K_M (93,2 %) y reporta una prueba de estabilidad de probabilidades en RTX 5090: 0,803 con batch 512 frente a 0,815 con batch 4096 sobre una entrada de 854 tokens. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: 7,6 GiB con la cuantización incluida en el repo (el original requiere 13,1 GiB).
- Tamaño de descarga: 2,54 GB para el archivo Q4_K_M; el repositorio completo ocupa 6,7 GB.
- GPU recomendadas: TurinTech reporta pruebas en RTX 5090; por el consumo de VRAM, cabe en GPUs de consumo con 8 GiB o más (RTX 3060 Ti/4060 Ti/4070 en adelante), aunque no se documentan pruebas en esas tarjetas.
- Cabe en GPU de consumo: sí, según el consumo de VRAM declarado (7,6 GiB).
- Opciones de despliegue: llama.cpp (b11540 o superior, probado en `1e6f04a`), Ollama (0.40.4 probado) y LM Studio (0.4.26 probado, motor CPU 2.64.0). No se mencionan vLLM ni TGI.
- Configuración recomendada: `llama-server -hf turintech/Kev-4B-Artemis-GGUF:Q4_K_M --port 8080 -c 16384 -ub 4096 -b 4096`.
- Latencia y throughput: no disponibles de forma numérica; la model card solo indica que la inferencia se resuelve en una sola pasada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kev-4B-Artemis-GGUF | 4,21 B | No disponible (recomendado 16.384 en servidor) | Modelo de decisión tipada, endpoint `/v1/systemone` | Apache 2.0 | Hugging Face, Ollama, LM Studio |
| jaredpalmer/kev-4b (original) | 4,21 B | No disponible | Modelo de decisión tipada | No disponible en la información | Hugging Face |
| ggml-org Q4_K_M de kev-4b | 4,21 B | No disponible | Cuantización GGUF estándar | No disponible en la información | Hugging Face |

No se dispone de información sobre otros modelos de decisión tipada comparables en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo conversacional: la model card indica explícitamente que no chatea y que el botón de llama.cpp en "Use this model" arranca el archivo como modelo de chat, lo cual no está soportado.
- Solo funciona con el endpoint `/v1/systemone` de llama.cpp; `/v1/chat/completions` no lo ejecuta como modelo de decisión.
- Requiere llama.cpp b11540 o superior; versiones anteriores pueden no soportar el endpoint.
- Las probabilidades varían con el tamaño de batch (0,803 frente a 0,815 en la prueba citada), por lo que la reproducibilidad exige fijar `-ub 4096 -b 4096`.
- La precisión en decisiones tipadas es del 66,8 % según el autor, un valor moderado que desaconseja su uso como única fuente de verdad en decisiones críticas.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false`).
- No se documentan sesgos conocidos, idiomas soportados ni comportamiento ante entradas fuera de distribución.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base jaredpalmer/kev-4b, cuya licencia no se detalla en la información disponible.
- El modelo no admite tool calling ni flujos de agente multi-paso según la documentación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/turintech/Kev-4B-Artemis-GGUF
- Modelo base: https://huggingface.co/jaredpalmer/kev-4b
- Página de TurinTech: https://www.turintech.ai
- Otros modelos de TurinTech: https://huggingface.co/turintech
- Ollama: https://ollama.com/turintech/kev-4b-artemis
- LM Studio: https://lmstudio.ai/turintech/kev-4b-artemis
- Discord de TurinTech: https://discord.gg/5mCDSyU9sT
- LinkedIn de TurinTech: https://www.linkedin.com/company/turintechai
- Resultados declarados: https://huggingface.co/turintech/Kev-4B-Artemis-GGUF#results
