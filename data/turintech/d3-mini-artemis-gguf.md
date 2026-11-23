# turintech/d3-mini-Artemis-GGUF

## Resumen

d3-mini-Artemis-GGUF es una versión cuantizada en formato GGUF del modelo d3-mini de TurinTech, un modelo de decisión diseñado específicamente para responder preguntas tipadas (sí/no, elección entre opciones, puntuaciones numéricas) devolviendo una distribución de probabilidad sobre las respuestas en una sola pasada. No es un modelo conversacional al uso: no mantiene diálogo libre, sino que evalúa un estado (state) contra un conjunto de preguntas estructuradas y emite decisiones con probabilidades asociadas. El modelo base es vllm-sr/d3-mini y esta variante ha sido comprimida con Artemis, la técnica de compresión propia de TurinTech.

El modelo cuenta con aproximadamente 4.840 millones de parámetros totales (4.841.450.496 según los datos de safetensors) y se distribuye en un repositorio de 6,4 GB con múltiples cuantizaciones. La versión destacada ocupa 3,30 GB en disco y requiere 4,46 GiB de memoria GPU, frente a los 9,88 GiB del modelo original, manteniendo una divergencia KL de 0,00349 respecto al original. Esto lo sitúa en el rango de ejecución en GPU de consumo de 8 GB o incluso en CPU.

Su relevancia actual radica en que ofrece un mecanismo de clasificación y enrutamiento de alta precisión (97,25% de coincidencia con las respuestas del modelo original en el conjunto de evaluación) con un consumo de recursos muy reducido, lo que lo hace adecuado para pipelines de triaje, enrutamiento y verificaciones tipadas en producción. Requiere llama.cpp b11572 o superior, que añadió soporte para la arquitectura d3.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | d3 (modelo de decisión; soportado por llama.cpp desde b11572) |
| Parámetros totales | 4.841.450.496 |
| Parámetros activos | no disponible |
| Longitud de contexto | 16.384 tokens (configuración recomendada con `-c 16384`); contexto de entrenamiento completo no disponible |
| Tipos de cuantización | GGUF (Q5_K_S destacada; otras cuantizaciones en el repo, no detalladas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura d3 es un modelo de decisión que responde preguntas tipadas en una sola pasada: recibe un estado textual y un conjunto de preguntas con tipos definidos (`noul` para sí/no, `choice` para elección entre criterios, `score` para puntuación numérica) y devuelve para cada pregunta una respuesta junto con su distribución de probabilidad. El modelo lee el prompt completo en un único batch, lo que implica que la longitud de entrada no puede superar el tamaño de batch configurado (`-ub 4096 -b 4096` en la configuración recomendada).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La variante Artemis es una compresión del modelo base vllm-sr/d3-mini mediante la técnica homónima de TurinTech, que logra reducir el tamaño de 9,88 GiB a 4,46 GiB de memoria con una divergencia KL de 0,00349 respecto al original (frente a 0,00560 de la cuantización Q4_K_M de ggml-org), lo que indica una fidelidad superior a la cuantización estándar.

## Capacidades

- Clasificación y decisión tipada: responde preguntas de tipo sí/no (`noul`), elección entre opciones (`choice`) y puntuación (`score`) con probabilidades por respuesta.
- Salida probabilística estructurada: devuelve distribuciones de probabilidad sobre las respuestas, no solo la etiqueta ganadora.
- Enrutamiento y triaje: diseñado explícitamente para routing, triage y verificaciones tipadas.
- Procesamiento en una sola pasada: evalúa todas las preguntas del estado simultáneamente.
- Despliegue en llama.cpp mediante el endpoint `/v1/systemone`.
- Compatible con Ollama (versión 0.40.11 probada) y LM Studio.
- No es un modelo conversacional: no mantiene diálogo libre ni genera texto abierto.
- Soporte de tool calling / function calling: no disponible (no aplica a su naturaleza de modelo de decisión).
- Capacidades multilingües: no disponible.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto de una reclamación y responde simultáneamente si el cliente está enfadado (`noul`), la temática (`choice`: billing, shipping, other) y la urgencia (`score` de 0 a 2). El ejemplo de la model card muestra probabilidades de 0,979 para enfado, 0,993 para billing y 0,975 para urgencia alta. Es adecuado porque emite las tres decisiones en una sola pasada con probabilidades calibradas.
- Enrutamiento de peticiones en pipelines de atención al cliente: dado un mensaje entrante, clasificarlo por departamento y prioridad antes de asignarlo a un agente humano o a otro modelo. La ventana de 16.384 tokens permite incluir historial o contexto adicional en el estado.
- Verificaciones tipadas en producción: validar que una respuesta o un documento cumple criterios definidos (por ejemplo, si contiene información de facturación, si requiere revisión humana) con umbrales de probabilidad configurables.
- Moderación y clasificación de contenido: usar preguntas `noul` con instrucciones específicas para determinar si un texto cumple o no determinada política, aprovechando la salida probabilística para aplicar umbrales.
- Despliegue en hardware limitado: al requerir 4,46 GiB de memoria GPU (o ejecución en CPU), puede desplegarse en GPUs de consumo de 8 GB o en servidores sin GPU dedicada, lo que lo hace viable para entornos de borde o infraestructura modesta.
- Prefiltrado antes de un LLM generativo: usar d3-mini-Artemis para decidir si una consulta requiere un modelo grande (por ejemplo, clasificar como "compleja" frente a "simple") y reducir costes de inferencia en el pipeline global.
- Clasificación por lotes de documentos: procesar grandes volúmenes de textos con preguntas tipadas predefinidas, dado el bajo coste por inferencia y la posibilidad de ejecución en CPU.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Tarea | Conjunto de datos | Métrica | Valor |
|---|---|---|---|
| Acuerdo con el original | LocalLLaMA/typed-decisions (Final set) | Same answer (%) | 97,25 |
| Acuerdo con el original | LocalLLaMA/typed-decisions (Final set) | Confident changes | 0 |
| Decisiones tipadas | LocalLLaMA/typed-decisions (Final set) | Accuracy (%) | 72,0 |

Adicionalmente, la model card indica una divergencia KL de 0,00349 respecto al modelo original, frente a 0,00560 de la cuantización Q4_K_M de ggml-org.

## Requisitos de hardware

- VRAM estimada: 4,46 GiB para la cuantización Q5_K_S destacada (frente a 9,88 GiB del modelo original).
- Tamaño en disco: 3,30 GB para el archivo Q5_K_S; repositorio completo de 6,4 GB.
- GPU recomendadas: NVIDIA A100 (probada en la model card); cualquier GPU con al menos 8 GB de VRAM para la cuantización Q5_K_S.
- GPU de consumo: cabe en GPUs de 8 GB; también puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp (llama-server, requiere b11572 o superior; probado con v0.7.0, b11669, commit 620d222), Ollama (0.40.11 probada), LM Studio.
- Configuración recomendada de llama-server: `-c 16384 -ub 4096 -b 4096 -np 1`. El parámetro `-np 1` es importante porque con varios slots llama.cpp puede alterar la respuesta de d3 cuando una petición más corta comparte batch (ggml-org/llama.cpp#30402, abierto a 14 de octubre de 2026).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Memoria GPU |
|---|---|---|---|---|---|
| d3-mini-Artemis-GGUF (Q5_K_S) | 4,84 B | 16.384 (config. recomendada) | Modelo de decisión tipada | Apache 2.0 | 4,46 GiB |
| d3-mini (original, vllm-sr) | 4,84 B | no disponible | Modelo de decisión tipada | no disponible | 9,88 GiB |
| Cuantización Q4_K_M de ggml-org (referencia) | 4,84 B | no disponible | Modelo de decisión tipada | no disponible | no disponible (KL 0,00560) |

No se dispone de información sobre otros modelos comparables de la misma categoría (modelos de decisión tipada) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo conversacional: no genera diálogo libre ni texto abierto; solo responde preguntas tipadas estructuradas.
- Requiere llama.cpp b11572 o superior; versiones anteriores no soportan la arquitectura d3.
- El prompt completo se procesa en un único batch: una entrada más larga que el batch configurado (`-ub`) es rechazada.
- Con varios slots (`-np` mayor que 1), llama.cpp puede alterar la respuesta cuando una petición más corta comparte batch (issue abierto ggml-org/llama.cpp#30402 a 14 de octubre de 2026); se recomienda `-np 1`.
- Los benchmarks (97,25% de coincidencia, 72% de accuracy, 0 cambios en respuestas confiadas) son datos declarados por el autor y no verificados de forma independiente.
- Idiomas soportados no disponibles; no se puede confirmar el rendimiento multilingüe.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo de decisión con salida probabilística, el riesgo se manifiesta como clasificaciones erróneas con alta confianza, no como texto inventado.
- Licencia Apache 2.0: permite uso comercial, pero deben conservarse los avisos de licencia correspondientes.
- El modelo base es vllm-sr/d3-mini; las limitaciones de dicho modelo base no se detallan en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/turintech/d3-mini-Artemis-GGUF
- Modelo base: https://huggingface.co/vllm-sr/d3-mini
- TurinTech: https://www.turintech.ai
- Otros modelos de TurinTech: https://huggingface.co/turintech
- Ollama: https://ollama.com/turintech/d3-mini-artemis
- LM Studio: https://lmstudio.ai/turintech/d3-mini-artemis
- Discord de TurinTech: https://discord.gg/5mCDSyU9sT
- LinkedIn de TurinTech: https://www.linkedin.com/company/turintechai
- Issue de llama.cpp sobre d3: https://github.com/ggml-org/llama.cpp/issues/30402
