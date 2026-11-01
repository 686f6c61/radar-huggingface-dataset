# therickcain/GLM-5.3-ABLITERATED-NVFP4

## Resumen

GLM-5.3-ABLITERATED-NVFP4 es una versión modificada de GLM-5.3, el modelo de lenguaje de tipo Mixture-of-Experts desarrollado por Zhipu AI (zai-org). El autor therickcain, bajo la marca dealignai, ha aplicado una técnica de "abliteration" que elimina el comportamiento de rechazo directamente en los pesos del modelo, sin fine-tuning, sin DPO y sin técnicas de jailbreak en el prompt. El resultado es un modelo que cumple con solicitudes de ciberseguridad ofensiva que el modelo base rechazaría.

El modelo conserva la arquitectura original de GLM-5.3 (glm_moe_dsa), que combina MoE con atención MLA y atención dispersa estilo DeepSeek. Cuenta con 753 mil millones de parámetros totales y aproximadamente 18 mil millones activos por token, con una ventana de contexto de 1 millón de tokens. La cuantización NVFP4 reduce el peso del repositorio a 464,9 GB, lo que facilita el despliegue en hardware con memoria limitada.

La relevancia de esta ficha radica en que documenta un caso de modelo "uncensored" orientado explícitamente a seguridad ofensiva, con métricas de tasa de rechazo y preservación de capacidades publicadas por el autor. Es un ejemplo de cómo la modificación de pesos puede alterar las políticas de seguridad de un modelo sin degradar significativamente su rendimiento en tareas de conocimiento general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | glm_moe_dsa (MoE + MLA + atención dispersa DeepSeek) |
| Parametros totales | 390.942.074.880 (según safetensors); el autor declara 753B |
| Parametros activos | ~18B por token (declarado por el autor) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | NVFP4 (expertos enrutados); atención y expertos compartidos en bf16 |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (modelopt, 8-bit según tags) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3 emplea una arquitectura híbrida denominada glm_moe_dsa, que combina un transformer con Mixture-of-Experts, atención multi-cabeza latente (MLA) y un mecanismo de atención dispersa inspirado en DeepSeek. Incluye una cabeza de predicción multi-token (MTP) que actúa como draft head para decodificación especulativa, con una tasa de aceptación declarada de aproximadamente el 87%. El autor indica que esta cabeza MTP también fue modificada por el proceso de abliteration.

El proceso de abliteration aplicado por dealignai consiste en una edición permanente de los tensores que elimina la dirección de rechazo en el espacio de activaciones, sin emplear fine-tuning supervisado, DPO, LoRA, adaptadores, vectores de steering ni hooks de runtime. El autor afirma que el modelo se carga con vLLM estándar sin modificaciones en el código del modelo. No se dispone de información sobre el número de tokens de entrenamiento del modelo base ni sobre la composición del dataset original, ya que la model card no los detalla.

## Capacidades

- Generación de texto y razonamiento en inglés, con modos de esfuerzo de razonamiento (`reasoning_effort`) que aceptan los valores `low` y `high`; cualquier otro valor cae por defecto en `max`.
- Generación de código de ciberseguridad ofensiva funcional: reverse shells, keyloggers, ransomware AES, escalada de privilegios SUID, fuerza bruta SSH y payloads de inyección SQL, según verificación del autor.
- Análisis de malware y herramientas de red team.
- Decodificación especulativa mediante cabeza MTP con ~87% de aceptación de draft.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documentan capacidades de visión, audio ni tool calling en la información disponible.

## Casos de uso

- Pruebas de penetración autorizadas: el modelo genera reverse shells y payloads funcionales para entornos de pentesting con consentimiento explícito, gracias a la eliminación de rechazos en los pesos.
- Análisis de malware: puede describir y generar código de keyloggers o ransomware para su estudio en laboratorios aislados, lo que facilita la comprensión de TTPs de actores maliciosos.
- Ejercicios de CTF (Capture The Flag): útil para resolver retos de explotación, escalada de privilegios y criptografía ofensiva sin las interrupciones de rechazo del modelo base.
- Formación en concienciación de seguridad: generación de plantillas de phishing para simulacros internos de awareness, con código funcional que permite evaluar la eficacia de los filtros de correo.
- Investigación en seguridad ofensiva: desarrollo de herramientas de reconocimiento y fuerza bruta SSH en entornos controlados, con contexto de 1M tokens para analizar grandes volúmenes de logs o código.
- Automatización de red teaming: integración en pipelines que requieren generación de exploits y tooling ofensivo, con despliegue mediante vLLM estándar y cuantización NVFP4 para reducir requisitos de memoria.

## Benchmarks y rendimiento

| Benchmark | Modelo base | CRACK Abliterated | Diferencia |
|---|---|---|---|
| MMLU (logit, 1.026 preguntas) | 85,58% | 84,11% | -1,47 pp |
| HarmBench, refusal rate (default/off) | no disponible | 7,3% (8/109) | no disponible |
| HarmBench, refusal rate (high) | no disponible | 0,0% (0/76) | no disponible |
| HarmBench, refusal rate (max) | no disponible | 0,0% (0/80) | no disponible |

El autor reporta además que no se observaron salidas degeneradas ni bucles en ningún modo de razonamiento. No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 464,9 GB en NVFP4; se requiere un pool de KV de aproximadamente 35 GiB por rango en GB10, frente a 7-9 GiB en FP8.
- GPU recomendadas: 8× DGX Spark GB10 (probado por el autor); se requiere TP8 para contexto práctico de 512K tokens.
- No cabe en GPU de consumo (RTX 4090, 24 GB) ni en configuraciones de una sola GPU convencional.
- Despliegue: vLLM estándar; el autor indica que se carga sin modificaciones en el código del modelo.
- Latencia y throughput: en GB10, NVFP4 no ofrece ventaja de velocidad frente a FP8 (no hay cómputo FP4 nativo; los pesos se dequantizan al vuelo); la decodificación queda cerca de FP8 + MTP. La ventaja es de memoria y contexto: ~695K tokens de pool a concurrencia 1,33×.
- Contexto de 1M tokens no está disponible mediante decode-context-parallel en glm_moe_dsa con vLLM actual, según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Cuantización | Notas |
|---|---|---|---|---|---|
| GLM-5.3-ABLITERATED-NVFP4 | 753B totales / ~18B activos | 1M | MIT | NVFP4 | Abliterated, orientado a seguridad ofensiva |
| zai-org/GLM-5.3 (base) | 753B totales / ~18B activos | 1M | no disponible en la información | no disponible | Modelo original con rechazos |
| dealignai/GLM-5.3-UNCENSORED-NVFP4 | 753B totales / ~18B activos | 1M | no disponible | NVFP4 | Espejo del mismo modelo según el autor |
| dealignai/GLM-5.3-UNCENSORED-FP8 | 753B totales / ~18B activos | 1M | no disponible | FP8 | Variante FP8 mencionada en la model card |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo elimina deliberadamente los mecanismos de rechazo, lo que lo hace inadecuado para aplicaciones comerciales o de cara al público sin supervisión.
- Riesgo elevado de generación de contenido dañino: código de malware, exploits y herramientas de ataque funcionales.
- El modo de razonamiento no se puede desactivar; `reasoning_effort` solo acepta `low` y `high`, y cualquier otro valor cae en `max`, lo que puede agotar el presupuesto de tokens.
- En NVFP4, el modo `high` requiere `max_tokens ≥ 16384` para finalizar correctamente; `max` a menudo trunca la respuesta.
- El texto de razonamiento se expone en `message.reasoning`, no en `message.reasoning_content`.
- El contexto de 1M tokens no es viable con decode-context-parallel en vLLM actual para esta arquitectura.
- El modelo solo soporta inglés según la model card.
- La licencia MIT permite uso comercial, pero el uso de un modelo sin rechazos para fines ofensivos puede violar legislación local; el autor lo restringe a pruebas autorizadas.
- Posibles sesgos heredados del modelo base no documentados en la información disponible.
- Riesgo de alucinación en código generado: el autor verifica funcionalidad en ciertos casos, pero no hay garantía general.

## Enlaces

- https://huggingface.co/therickcain/GLM-5.3-ABLITERATED-NVFP4
- https://huggingface.co/zai-org/GLM-5.3
- https://huggingface.co/dealignai
- https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-NVFP4
- https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8
- https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8/discussions/3
- https://twitter.com/dealignai
- https://twitter.com/jordanschenck
- https://huggingface.co/0xMagnus
