# turintech/Clef-Artemis-GGUF

## Resumen

Clef-Artemis-GGUF es una versión cuantizada en formato GGUF del modelo Cloudflare/clef, publicada por TurinTech bajo el paraguas de su pipeline Artemis de compresión de modelos. No es un modelo conversacional al uso: se trata de un modelo de decisión ("decision model") que responde a preguntas tipadas sobre texto o imágenes (sí/no, elección única, puntuación) devolviendo una probabilidad para cada respuesta en una sola pasada, a través del endpoint `/v1/systemone` de llama-server. El modelo base, Clef, está diseñado para routing, triaje y comprobaciones tipadas.

El artefacto cuenta con 27.024.054.788 parámetros totales según los pesos safetensors del modelo base y ocupa 63,9 GB en el repositorio. TurinTech comercializa esta compresión como una forma de ejecutar Clef en una GPU de 16 GB (15,0 GiB de VRAM) frente a los 49,9 GiB del original, con una fidelidad del 95,6 % de respuestas idénticas respecto al modelo sin cuantizar. La relevancia actual radica en que permite desplegar un modelo de decisión multimodal de gran tamaño en hardware de consumo, manteniendo el formato de petición y respuesta Jev/SystemOne del original.

La licencia es Apache 2.0 y los pesos se distribuyen exclusivamente en GGUF, requiriendo llama.cpp de una versión igual o posterior al 9 de octubre de 2026 para funcionar con el endpoint específico de decisiones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Cloudflare/clef; transformer multimodal según tags) |
| Parámetros totales | 27.024.054.788 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como valor nominal; en la práctica el endpoint `/v1/systemone` rechaza entradas de más de 512 tokens si no se ajusta `-ub 4096 -b 4096`. Se recomienda `-c 16384` |
| Tipos de cuantización | IQ4_XS (14,82 GB, 15,0 GiB de VRAM); el repositorio incluye múltiples ficheros GGUF, entre ellos IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector de visión multimodal separado (mmproj-Clef-BF16.gguf de ggml-org) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Cloudflare/clef en la documentación proporcionada. Los tags indican que es un modelo multimodal (procesa texto e imágenes) y que se usa para clasificación de texto y decisiones tipadas. El modelo no genera texto libre: recibe un estado (texto o imágenes) y un conjunto de preguntas tipadas (`noul` para sí/no, elección única, puntuación) y devuelve probabilidades por respuesta en una sola pasada mediante el formato Jev/SystemOne.

La contribución de TurinTech (pipeline Artemis) es la compresión cuantizada del modelo original: reduce el peso de 49,9 GiB a 15,0 GiB de VRAM con un 95,6 % de respuestas idénticas al original y sin cambios en las respuestas donde el modelo original mostraba alta confianza (0 cambios en respuestas confiadas). No se documentan en la información disponible los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo RLHF/DPO.

## Capacidades

- Decisiones tipadas sobre texto: responder preguntas de sí/no, elección entre opciones o puntuación con probabilidad asociada.
- Decisiones tipadas sobre imágenes: soporte multimodal mediante proyector de visión (mmproj BF16), enviando imágenes como data URLs en un array `images` de la petición.
- Routing y triaje: clasificación de mensajes o entradas en categorías predefinidas (p. ej. urgencia, tipo de incidencia).
- Comprobaciones tipadas ("typed checks") sobre contenido de texto e imagen.
- Salida con probabilidad por respuesta, apta para umbrales y lógica de decisión aguas abajo.
- No es un modelo conversacional: no mantiene diálogo ni genera texto libre.
- Compatibilidad con Ollama (con `--ask`) y LM Studio además de llama.cpp.
- Idiomas soportados: no disponible.

## Casos de uso

- Triaje de tickets de soporte: enviar el texto del ticket como `state` y preguntas tipadas como "¿expresa urgencia?" o "¿es un problema de facturación?", obteniendo probabilidades para enrutar automáticamente al equipo adecuado. Adecuado por su bajo coste de inferencia en una sola pasada y su capacidad de clasificación con umbral de confianza.
- Moderación y clasificación de contenido: comprobar si un texto o una imagen cumple políticas concretas mediante preguntas sí/no, usando la probabilidad devuelta para fijar umbrales de revisión humana.
- Enrutamiento de consultas en un asistente: decidir con preguntas de elección única a qué submodelo o herramienta derivar cada consulta, aprovechando el endpoint `/v1/systemone` y el formato estructurado de respuesta.
- Verificación de documentos con imagen: extraer decisiones sobre capturas o escaneos (p. ej. "¿el documento contiene una firma?") usando el proyector de visión y el array `images`.
- Clasificación por lotes en pipelines de datos: procesar grandes volúmenes de textos con preguntas tipadas predefinidas, beneficiándose de la reducción de VRAM (15,0 GiB) que permite ejecutarlo en una GPU de 16 GB y paralelizar en varios procesos.
- Filtrado previo en sistemas RAG: decidir si un fragmento recuperado es relevante para la consulta antes de pasarlo a un LLM generativo, reduciendo coste y latencia del pipeline.
- Control de calidad en producción: usar comprobaciones tipadas sobre salidas de otros modelos (p. ej. "¿la respuesta contiene datos personales?") como capa de validación.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Agreement with the original | LocalLLaMA/typed-decisions (Test decisions) | Same answer (%) | 95,6 |
| Agreement with the original | LocalLLaMA/typed-decisions (Test decisions) | Confident changes | 0 |
| Typed decisions | LocalLLaMA/typed-decisions (Test decisions) | Accuracy (%) | 72,0 |

Comparativa de fidelidad frente a otra cuantización citada en la model card:

| Versión | Respuestas idénticas al original (%) |
|---|---|
| Clef-Artemis-GGUF (IQ4_XS) | 95,6 |
| ggml-org Q4_K_M | 96,9 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- VRAM estimada: 15,0 GiB para la cuantización IQ4_XS (frente a 49,9 GiB del modelo original).
- GPU recomendadas: cualquier GPU con al menos 16 GB de VRAM; el modelo está pensado explícitamente para ejecutarse en una GPU de 16 GB.
- Cabe en GPU de consumo: sí, en modelos con 16 GB o más (p. ej. gama RTX 4080/4090 de 16-24 GB); no se especifican modelos concretos probados.
- Despliegue: llama.cpp (llama-server) con versión del 9 de octubre de 2026 o posterior (probado en `1e6f04a`/b11540 y b11572); Ollama 0.40.4 (con `--ask`); LM Studio 0.4.26 (motor CPU 2.64.0).
- Parámetros de servidor recomendados: `-c 16384 -ub 4096 -b 4096`; para imágenes, `-ub 8192 -b 8192` y proyector `mmproj-Clef-BF16.gguf` en la revisión `d2aa75c`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Clef-Artemis-GGUF (este) | 27,0 B | no disponible (límite práctico 512 tokens sin ajustar batch) | GGUF | Apache 2.0 | Cuantización IQ4_XS, 15,0 GiB VRAM, 95,6 % fidelidad |
| Cloudflare/clef (original) | 27,0 B (según base) | no disponible | no disponible | Apache 2.0 | Modelo sin cuantizar, 49,9 GiB VRAM |
| ggml-org Q4_K_M de Clef | 27,0 B | no disponible | GGUF | Apache 2.0 | Cuantización alternativa, 96,9 % fidelidad |

No se dispone de información sobre otros modelos de decisión comparables en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo conversacional: no genera texto libre ni mantiene diálogo; solo responde preguntas tipadas en el formato Jev/SystemOne.
- El endpoint `/v1/systemone` rechaza entradas de más de 512 tokens si no se configura `-ub 4096 -b 4096`; es un comportamiento común a todos los GGUF de Clef, incluidos los públicos.
- La precisión en decisiones tipadas declarada es del 72 %, lo que implica un margen de error considerable para decisiones automatizadas sin revisión humana.
- Los benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false`).
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingüe.
- Riesgo de alucinación: no evaluado en la información disponible; al tratarse de un modelo de clasificación, el riesgo se manifiesta como falsos positivos/negativos más que como texto inventado.
- Sesgos conocidos: no documentados.
- El proyector de visión Q8_0 de ggml-org no fue probado con estos ficheros; solo el BF16 en la revisión `d2aa75c`.
- Requiere versiones muy recientes de llama.cpp (posteriores al 9 de octubre de 2026); versiones anteriores no soportan el endpoint de decisiones.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Cloudflare/clef.

## Enlaces

- Hugging Face: https://huggingface.co/turintech/Clef-Artemis-GGUF
- Modelo base: https://huggingface.co/Cloudflare/clef
- Resultados detallados: https://huggingface.co/turintech/Clef-Artemis-GGUF/blob/main/RESULTS.md
- Proyector de visión: https://huggingface.co/ggml-org/Clef-GGUF
- Ollama: https://ollama.com/turintech/clef-artemis
- LM Studio: https://lmstudio.ai/turintech/clef-artemis
- TurinTech: https://www.turintech.ai
- Otros modelos TurinTech: https://huggingface.co/turintech
- Discord de TurinTech: https://discord.gg/5mCDSyU9sT
- LinkedIn de TurinTech: https://www.linkedin.com/company/turintechai
