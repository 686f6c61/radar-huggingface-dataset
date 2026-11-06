# turintech/Kev-27B-Artemis-GGUF

## Resumen

Kev-27B-Artemis-GGUF es una cuantización en formato GGUF del modelo Kev-27B de Jared Palmer, publicada por TurinTech bajo el paraguas de su tecnología Artemis. No es un modelo conversacional al uso: se trata de un modelo de decisión que responde preguntas tipadas (sí/no, elección única, puntuación) devolviendo una probabilidad por cada respuesta en una sola pasada, a través del endpoint `/v1/systemone` de llama-server. El modelo no mantiene conversaciones y trabaja exclusivamente con texto.

El interés principal de esta versión reside en la compresión: el modelo original en BF16 requiere más de 57 GiB de VRAM repartidos entre dos GPU, mientras que el fichero IQ4_XS de Artemis ocupa 13,91 GB y se ejecuta en unos 19,0 GiB de memoria, lo que permite desplegarlo en una única GPU de 24 GB. Según la model card, conserva un 97,8 % de respuestas idénticas al original sobre un conjunto de 2.000 decisiones tipadas de test, ligeramente por encima del 97,0 % de una cuantización Q4_K_M de terceros.

La arquitectura subyacente no está detallada en la información disponible; los datos reales de safetensors indican 25.627.222.016 parámetros totales (aproximadamente 25,6 mil millones), aunque el nombre comercial del modelo haga referencia a "27B". La licencia Apache 2.0 facilita su adopción en entornos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base tipo transformer, sin detalle en la model card) |
| Parametros totales | 25.627.222.016 (25,6 mil millones, segun safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 16.384 tokens configurados en el ejemplo de despliegue (`-c 16384`); contexto de entrenamiento no disponible |
| Tipos de cuantizacion | GGUF, con fichero IQ4_XS (13,91 GB) como referencia principal; el repo incluye otras variantes no detalladas |
| Idiomas soportados | no disponible (la model card indica "text only", sin listado de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp, Ollama y LM Studio) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base `jaredpalmer/kev-27b` más allá de su naturaleza transformer y su función como modelo de decisión. Lo que sí se documenta es el proceso de compresión de TurinTech: la tecnología Artemis produce una cuantización IQ4_XS que reduce el peso de 57,1 GiB (BF16 en dos GPU) a 13,91 GB de descarga y 19,0 GiB de VRAM en inferencia.

El modelo no se entrena para generar texto libre, sino para emitir decisiones tipadas con distribución de probabilidad sobre las respuestas posibles. La model card reporta que, sobre 2.000 decisiones de test del conjunto LocalLLaMA/typed-decisions, la versión Artemis coincide con el original en el 97,8 % de los casos y no modifica ninguna respuesta en la que el original se mostraba confiado (0 cambios confiables). No se dispone de información sobre volumen de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Clasificación y decisión tipada: responde preguntas de tipo sí/no (`noul`), elección única y puntuación, devolviendo una probabilidad por respuesta en una sola pasada.
- Endpoint dedicado `/v1/systemone` en llama-server, con un campo `state` (texto de entrada) y un objeto `questions` con el tipo e instrucciones de cada pregunta.
- Procesamiento exclusivo de texto; no admite imágenes, audio ni otras modalidades.
- No es un modelo conversacional: no mantiene diálogo multi-turno ni genera texto libre.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como tal; su uso previsto es como componente de decisión dentro de pipelines mayores (enrutamiento, triaje, comprobaciones).
- Capacidades multilingües: no documentadas.
- Modo "thinking": no disponible.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una incidencia, el modelo responde preguntas tipadas como "¿es urgente?" o "¿es un problema de facturación?", permitiendo dirigir cada caso al equipo adecuado con una probabilidad asociada y umbrales configurables.
- Triaje de alertas en producción: clasificar mensajes de monitorización o logs resumidos en categorías predefinidas (crítico, aviso, informativo) en una sola pasada, con bajo coste por consulta al ejecutarse en una única GPU de 24 GB.
- Moderación y comprobaciones de contenido: aplicar preguntas binarias del estilo "¿contiene este texto datos personales?" o "¿es spam?" sobre lotes de documentos, aprovechando la salida probabilística para calibrar umbrales.
- Validación de formularios y extracción de señales: evaluar si un texto cumple condiciones concretas (por ejemplo, "¿menciona una fecha de entrega?") como paso previo a un pipeline de extracción estructurada.
- Clasificación de correo entrante en atención al cliente: decidir si un mensaje expresa urgencia, queja o consulta general, con contexto suficiente para correos largos gracias a la ventana de 16.384 tokens configurada.
- Filtrado previo en pipelines RAG o de agentes: usar el modelo como clasificador barato que decide si una consulta requiere recuperación de documentos o puede resolverse con una respuesta directa, reduciendo llamadas a modelos mayores.
- Evaluación de calidad de respuestas generadas: preguntar de forma tipada si una respuesta cumple criterios definidos (relevancia, toxicidad, fidelidad), obteniendo una probabilidad por criterio.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Acuerdo con el original | LocalLLaMA/typed-decisions (test) | Misma respuesta (%) | 97,8 |
| Acuerdo con el original | LocalLLaMA/typed-decisions (test) | Cambios en respuestas confiadas | 0 |
| Decisiones tipadas | LocalLLaMA/typed-decisions (test) | Precision (%) | 74,05 |

La model card compara además el acuerdo con el original frente a una cuantización Q4_K_M de terceros (kdercksen), que obtiene un 97,0 % frente al 97,8 % de Artemis, sobre 2.000 decisiones de test y con GPU NVIDIA RTX 5090 y llama.cpp b11609. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 19,0 GiB para el fichero IQ4_XS (frente a 57,1 GiB del original BF16 repartido en dos GPU).
- GPU recomendadas: una única GPU de 24 GB es suficiente; la model card cita NVIDIA RTX 5090 como hardware de medida. GPU profesionales como A100 o H100 también son válidas, aunque sobredimensionadas para esta cuantización.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB (RTX 3090, RTX 4090, RTX 5090) con el fichero IQ4_XS.
- Despliegue: llama.cpp (llama-server, probado en el commit `fcac190`, build b11609), Ollama (0.40.4 probado, con `--ask`) y LM Studio (0.4.26 probado, motor CPU 2.64.0). Requiere el endpoint `/v1/systemone`; el chat y `/v1/chat/completions` no funcionan como modelo de decisión.
- Parámetros de servidor recomendados: `-c 16384 -ub 4096 -b 4096`. Con el valor por defecto de 512, el endpoint rechaza entradas de más de 512 tokens.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Acuerdo con el original | Licencia |
|---|---|---|---|---|---|
| Kev-27B-Artemis-GGUF (IQ4_XS) | 25,6 mil millones | 16.384 (configurado) | GGUF, 13,91 GB | 97,8 % | Apache 2.0 |
| Kev-27B cuantizacion Q4_K_M (kdercksen) | 25,6 mil millones | no disponible | GGUF | 97,0 % | no disponible |
| Kev-27B original (BF16) | 25,6 mil millones | no disponible | BF16, 57,1 GiB en dos GPU | referencia | no disponible |

No se dispone de información sobre otros modelos de decisión comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo conversacional: no genera texto libre ni mantiene diálogos; usarlo a través de `/v1/chat/completions` no funciona como modelo de decisión.
- El endpoint `/v1/systemone` rechaza entradas de más de 512 tokens si no se ajustan los parámetros de batch (`-ub 4096 -b 4096`), lo que puede provocar fallos silenciosos en despliegues mal configurados.
- La precisión reportada en decisiones tipadas es del 74,05 %, sustancialmente inferior al 97,8 % de acuerdo con el original; conviene calibrar umbrales y validar en el dominio propio.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false`).
- Riesgo de alucinación: no evaluado en la información disponible; al tratarse de un modelo de decisión, el riesgo se traslada a decisiones mal clasificadas con alta confianza.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no especificados; la model card solo indica que es un modelo de texto.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base `jaredpalmer/kev-27b` debería revisarse por si impone condiciones adicionales.
- La etiqueta de Ollama (`iq4_xs`) no es una revisión inmutable; el contenido puede cambiar con el tiempo.
- Dependencia de una versión concreta de llama.cpp (soporte desde el 9 de octubre de 2026, probado en b11609); versiones anteriores no sirven el endpoint.

## Enlaces

- Hugging Face: https://huggingface.co/turintech/Kev-27B-Artemis-GGUF
- Modelo base: https://huggingface.co/jaredpalmer/kev-27b
- Otros modelos de TurinTech: https://huggingface.co/turintech
- Web de TurinTech: https://www.turintech.ai
- Ollama: https://ollama.com/turintech/kev-27b-artemis
- LM Studio: https://lmstudio.ai/turintech/kev-27b-artemis
- LinkedIn de TurinTech: https://www.linkedin.com/company/turintechai
- Resultados declarados: https://huggingface.co/turintech/Kev-27B-Artemis-GGUF#results
