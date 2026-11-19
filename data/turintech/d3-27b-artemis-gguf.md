# turintech/d3-27B-Artemis-GGUF

## Resumen

d3-27B-Artemis-GGUF es la versión cuantizada en formato GGUF de d3, un modelo de decisión desarrollado por TurinTech (Reino Unido) y comprimido con su técnica propietaria Artemis. A diferencia de un modelo conversacional, d3 no mantiene diálogos: responde preguntas tipadas (sí/no, elección única, puntuación) sobre texto o imágenes, devolviendo una probabilidad para cada respuesta en una sola pasada. El modelo se sirve a través del endpoint `/v1/systemone` de llama-server.

El modelo base, `vllm-sr/d3`, tiene 26.895.998.464 parámetros (aproximadamente 27B), y esta versión GGUF lo reduce a 14,95 GB de descarga, permitiendo ejecutarlo en una GPU de 24 GB con un consumo de 16,4 GiB de VRAM, frente a los 54,6 GiB que requiere el original repartido en dos GPUs. Está pensado para tareas de enrutamiento, triaje y comprobaciones tipadas, y declara una concordancia del 97,1% con las respuestas del modelo original.

La relevancia actual del modelo reside en su enfoque: en lugar de generar texto libre, produce decisiones estructuradas con probabilidades, lo que lo hace adecuado para pipelines de clasificación y enrutamiento donde se necesita una salida determinista y verificable. Requiere llama.cpp b11572 (12 de octubre de 2026) o superior, que añadió soporte para la arquitectura d3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (soporte añadido en llama.cpp b11572; familia d3) |
| Parametros totales | 26.895.998.464 (~27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 16.384 tokens en la configuración de ejecución recomendada (`-c 16384`); contexto de entrenamiento no disponible |
| Tipos de cuantizacion | GGUF; se documenta IQ4_XS (14,95 GB) y se menciona Q4_K_M de ggml-org como referencia comparativa |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base `vllm-sr/d3` en la documentación proporcionada. Se sabe que es un modelo de decisión multimodal (procesa texto e imágenes) y que su funcionamiento difiere del de un transformer generativo convencional: lee el prompt completo en un solo lote y emite, para cada pregunta tipada, una distribución de probabilidad sobre las respuestas posibles. El soporte en llama.cpp se añadió en la build b11572 (12 de octubre de 2026), probada en el commit `fcac190`.

La compresión Artemis es la innovación técnica destacada por TurinTech: reduce el modelo original de 54,6 GiB (dos GPUs) a 16,4 GiB de VRAM manteniendo, según el autor, un 97,1% de concordancia con las respuestas del original. No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo soporta entrada de imágenes mediante el proyector de visión `mmproj-vllm-d3-BF16.gguf` de ggml-org (revisión `de96701`).

## Capacidades

- Clasificación y decisión tipada sobre texto: preguntas de tipo sí/no (`noul`), elección única y puntuación, con probabilidad asociada a cada respuesta.
- Procesamiento de imágenes: acepta imágenes como data URLs en un array `images` de nivel superior en la petición a `/v1/systemone`, siempre que se cargue el proyector de visión.
- Enrutamiento y triaje: diseñado específicamente para decidir categorías, urgencias o rutas en pipelines.
- Salida probabilística en una sola pasada, sin generación autoregresiva de texto.
- No soporta conversación: la ventana de chat y `/v1/chat/completions` no lo ejecutan como modelo de decisión.
- Soporte multilingüe: no disponible en la información proporcionada.
- Tool calling, agentes y razonamiento multi-paso: no disponible (no es un modelo conversacional ni de agentes).

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto del ticket y responde preguntas tipadas como "¿expresa urgencia?" o "¿es un problema de facturación?", devolviendo probabilidades que permiten priorizar la cola. El ejemplo de la model card (`"My Stripe integration keeps failing. Please help ASAP."` con la pregunta `urgency`) ilustra exactamente este flujo.
- Enrutamiento de peticiones en sistemas multi-modelo: dado un prompt de entrada, d3 decide a qué modelo o servicio derivarlo mediante preguntas de elección única, con la ventaja de consumir solo 16,4 GiB de VRAM en una única GPU de 24 GB.
- Moderación y comprobaciones de contenido: clasificación binaria o por categorías de textos e imágenes (por ejemplo, capturas de pantalla o documentos escaneados) con salida probabilística en lugar de texto generado.
- Verificación de formularios y documentos: comprobaciones tipadas sobre texto extraído o imágenes de documentos, como "¿el importe coincide?" o "¿la firma está presente?", aprovechando el soporte multimodal con el proyector de visión.
- Clasificación de imágenes en pipelines de producción: con `-ub 8192 -b 8192` y el proyector `mmproj-vllm-d3-BF16.gguf`, el modelo procesa varias imágenes grandes por petición, adecuado para triaje visual automatizado.
- Despliegue en estación de trabajo con GPU de consumo: al caber en 24 GB y estar disponible en LM Studio (`turintech/d3-27b-artemis@iq4_xs`), permite prototipar y ejecutar decisiones localmente sin infraestructura de dos GPUs.
- Sustitución de clasificadores supervisados: en lugar de entrenar un clasificador específico por tarea, se formula la decisión como pregunta tipada y se usa la probabilidad devuelta como score, con la concordancia del 97,1% respecto al modelo original como referencia de fiabilidad.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente) sobre el dataset `LocalLLaMA/typed-decisions`, conjunto de test:

| Metrica | Tarea | Valor |
|---|---|---|
| Concordancia con el original ("Same answer") | Agreement with the original | 97,1% |
| Respuestas seguras modificadas ("Confident changes") | Agreement with the original | 0 |
| Precisión en decisiones tipadas ("Accuracy") | Typed decisions | 74,85% |

El autor indica además que la cuantización Q4_K_M de ggml-org alcanza un 98,4% de concordancia con el original, ligeramente por encima del 97,1% de esta versión Artemis.

## Requisitos de hardware

- VRAM estimada: 16,4 GiB con la cuantización IQ4_XS (14,95 GB de descarga). El modelo original requiere 54,6 GiB repartidos en dos GPUs.
- GPU recomendadas: cualquier GPU con al menos 24 GB de VRAM; el autor lo posiciona explícitamente para "a 24 GB GPU". No se especifican modelos concretos (A100, H100, RTX 4090) en la documentación.
- GPU de consumo: cabe en tarjetas de 24 GB, lo que incluye la gama RTX xx90 de NVIDIA, aunque el autor no nombra modelos específicos.
- Opciones de despliegue: llama-server de llama.cpp (build b11572 o superior; probado en `fcac190`) y LM Studio 0.4.26 (motor CPU 2.64.0). No hay paquete para Ollama. No se menciona soporte para vLLM ni TGI.
- Configuración recomendada: `-c 16384 -ub 4096 -b 4096 -np 1`; con imágenes, `-ub 8192 -b 8192` y el proyector de visión. El flag `-np 1` es importante: con varias ranuras, llama.cpp puede alterar una respuesta de d3 si una petición más corta comparte lote (issue ggml-org/llama.cpp#30402, abierto a 27 de octubre de 2026).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| d3-27B-Artemis-GGUF (este) | ~27B | 16.384 (config. recomendada) | GGUF | apache-2.0 | Modelo de decisión; 16,4 GiB VRAM; 97,1% concordancia |
| vllm-sr/d3 (original) | ~27B | no disponible | no disponible | no disponible | Modelo base; requiere 54,6 GiB en dos GPUs |
| d3-27B Q4_K_M (ggml-org) | ~27B | no disponible | GGUF | no disponible | Cuantización alternativa; 98,4% concordancia según el autor |

No se dispone de información sobre otros modelos de decisión comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo conversacional: no funciona con `/v1/chat/completions` ni con la ventana de chat; solo responde en `/v1/systemone`.
- El prompt completo se lee en un único lote: una entrada más larga que el tamaño de lote configurado es rechazada, por lo que hay que ajustar `-ub`/`-b` al tamaño de las entradas.
- Con varias ranuras de paralelismo (`-np` mayor que 1), llama.cpp puede cambiar una respuesta de d3 si una petición más corta comparte lote (issue abierto en llama.cpp#30402 a 27 de octubre de 2026).
- Requiere llama.cpp b11572 o superior; versiones anteriores no soportan la arquitectura d3.
- No hay paquete para Ollama; el botón de integración automática de LM Studio no constituye una prueba de compatibilidad según el autor.
- La precisión en decisiones tipadas es del 74,85%, sustancialmente inferior a la concordancia del 97,1% con el original: la concordancia mide fidelidad al modelo base, no corrección absoluta.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false`).
- Sesgos conocidos, riesgo de alucinación en el sentido generativo, idiomas soportados y limitaciones de contexto de entrenamiento: no disponibles.
- Licencia apache-2.0, que permite uso comercial; no obstante, no se documentan restricciones adicionales del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/turintech/d3-27B-Artemis-GGUF
- Página de resultados del autor: https://huggingface.co/turintech/d3-27B-Artemis-GGUF/blob/main/RESULTS.md
- Otros modelos de TurinTech: https://huggingface.co/turintech
- Web de TurinTech: https://www.turintech.ai
- LM Studio: https://lmstudio.ai/turintech/d3-27b-artemis
- Discord de TurinTech: https://discord.gg/5mCDSyU9sT
- LinkedIn de TurinTech: https://www.linkedin.com/company/turintechai
- Proyector de visión: https://huggingface.co/ggml-org/vllm-d3-GGUF (revisión `de96701`)
- Issue de llama.cpp sobre respuestas alteradas con varios slots: https://github.com/ggml-org/llama.cpp/issues/30402
