# TheGreenCow/GLM-5.3-UNCENSORED-NVFP4

## Resumen

GLM-5.3-UNCENSORED-NVFP4 es una derivación del modelo GLM-5.3 de Z.ai (zai-org) en la que se ha eliminado el comportamiento de rechazo directamente a nivel de pesos, sin SFT, DPO, LoRA ni modificaciones del chat template. La publica el usuario TheGreenCow sobre el checkpoint de dealignai, que a su vez parte del GLM-5.3 original de 753 mil millones de parámetros totales. El modelo se distribuye cuantizado en NVFP4 (expertos enrutados en FP4, atención y expertos compartidos en bf16) y está orientado explícitamente a ciberseguridad ofensiva y red teaming.

La arquitectura subyacente es `glm_moe_dsa`: un transformer de mezcla de expertos con atención multi-cabeza latente (MLA) y atención dispersa tipo DeepSeek (DSA), con aproximadamente 18 mil millones de parámetros activos por token. Incorpora una cabeza de predicción multi-token (MTP) que también ha sido modificada en esta versión, con una tasa de aceptación de borrador declarada del 87 %. El contexto nominal es de 1 millón de tokens, aunque en la práctica el despliegue en GB10 con NVFP4 permite unos 512K tokens con TP8.

Su relevancia es doble: por un lado, ilustra el estado del arte en compresión FP4 de modelos MoE de gran escala para despliegue en hardware Blackwell; por otro, es un caso de estudio de "abliteration" a nivel de pesos con preservación de capacidad declarada (MMLU 84,11 % frente a 85,58 % del base, una caída de 1,47 puntos). No obstante, su propósito declarado es la generación de código ofensivo funcional, lo que condiciona por completo su uso responsable y legal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `glm_moe_dsa` (MoE + MLA + atención dispersa DeepSeek) |
| Parámetros totales | 753.329.940.480 (~753B) |
| Parámetros activos | ~18B por token |
| Longitud de contexto | 1M tokens (nominal); ~512K prácticos en TP8 sobre GB10 |
| Tipos de cuantización | NVFP4 (expertos enrutados); bf16 en atención y expertos compartidos; etiquetado como 8-bit / modelopt |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 464,9 GB) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3 emplea una arquitectura de mezcla de expertos con atención multi-cabeza latente y atención dispersa tipo DeepSeek, lo que reduce el coste de atención sobre contextos muy largos al seleccionar dinámicamente un subconjunto de tokens clave. Con 753B parámetros totales y ~18B activos, el coste computacional por token se mantiene en el orden de un modelo denso de tamaño medio, mientras la capacidad efectiva es mucho mayor. La cabeza MTP actúa como borrador especulativo para decodificación multi-token, con una tasa de aceptación declarada del 87 % en esta versión.

La modificación de esta ficha es una edición permanente de los tensores que elimina el comportamiento de rechazo. El autor declara explícitamente que no hay fine-tuning, SFT, DPO, LoRA, adaptadores, vectores de dirección ni hooks en tiempo de ejecución: el cambio está horneado en los pesos y se carga con vLLM estándar. La cuantización NVFP4 se aplica a los expertos enrutados, manteniendo atención y expertos compartidos en bf16. No se dispone de información sobre la composición del dataset de entrenamiento original, el número de tokens ni las etapas de alineación (RLHF/DPO) del GLM-5.3 base.

## Capacidades

- Generación de texto y razonamiento con modos de esfuerzo configurables (`low`, `high`, `max`); el modo `off` no es accesible y cualquier valor distinto de `low` cae a `max`.
- Generación de código, incluido código de seguridad ofensiva funcional: reverse shells, keyloggers, ransomware AES, escalada de privilegios SUID, fuerza bruta SSH y payloads de inyección SQL, según verificación directa del autor.
- Análisis de malware, reconocimiento y plantillas de phishing para concienciación.
- Decodificación especulativa mediante cabeza MTP modificada (~87 % de aceptación de borrador).
- Contexto largo: hasta 1M tokens nominales, con ~512K prácticos en despliegue NVFP4 TP8.
- Soporte de tool calling y function calling heredado del modelo base (declarado en la descripción de NanoGPT, no verificado en la model card).
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma del repo.
- El texto de razonamiento se expone en `message.reasoning`, no en `message.reasoning_content`.

## Casos de uso

- Pentesting autorizado: el modelo genera exploits y tooling funcional (reverse shells, escalada SUID, fuerza bruta SSH) para entornos de prueba con permiso explícito, aprovechando que el rechazo ha sido eliminado a nivel de pesos.
- Análisis de malware: permite diseccionar muestras y describir mecanismos de persistencia, cifrado o exfiltración sin que el modelo se niegue a entrar en detalle técnico.
- CTFs y formación en seguridad: sirve para generar retos, payloads y explicaciones de técnicas ofensivas en un entorno controlado, con contexto largo para arrastrar el estado de un reto complejo.
- Red teaming de defensas: útil para producir muestras adversarias y evaluar clasificadores o WAFs, dado que genera variantes de payloads de forma consistente y sin bucles degenerativos.
- Investigación sobre alineación y abliteration: caso de estudio reproducible de eliminación de rechazo a nivel de tensor con métricas de preservación de capacidad (MMLU) y tasas de rechazo en HarmBench.
- Despliegue de inferencia a gran escala en hardware Blackwell: con NVFP4 y TP8 sobre GB10 permite un pool de KV de ~695K tokens a concurrencia 1,33×, adecuado para pipelines de análisis de documentos largos o logs.
- Automatización de revisión de código de seguridad: con contexto de 512K tokens puede ingerir repositorios completos y señalar patrones vulnerables, siempre que el uso sea defensivo y autorizado.

## Benchmarks y rendimiento

| Benchmark | Base GLM-5.3 | Esta versión | Δ |
|---|---|---|---|
| MMLU (logit, 1.026 preguntas) | 85,58 % | 84,11 % | −1,47 pp |
| HarmBench, refuse rate (off) | no disponible | 7,3 % (8/109) | — |
| HarmBench, refuse rate (high) | no disponible | 0,0 % (0/76) | — |
| HarmBench, refuse rate (max) | no disponible | 0,0 % (0/80) | — |

Por materia, el autor publica el desglose de 57 asignaturas MMLU; entre las visibles, Abstract Algebra cae de 66,7 % a 55,6 % y College Chemistry de 55,6 % a 50,0 %, mientras Anatomy, Astronomy, Business Ethics, Clinical Knowledge y College Biology se mantienen sin cambios. No se han publicado resultados de HumanEval, GSM8K ni otros benchmarks de código o matemáticas en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo pesa 464,9 GB en NVFP4; se necesita un nodo multi-GPU con al menos ~470 GB de memoria agregada solo para pesos, más el pool de KV.
- GPU recomendadas: DGX Spark GB10 (probado en configuración 8× con TP8); hardware Blackwell con soporte FP4. No se ha validado en A100 ni H100 en la información disponible.
- GPU de consumo: no cabe en ninguna GPU consumer actual; 753B parámetros incluso en FP4 exceden la VRAM de una RTX 4090 (24 GB) o similar.
- Despliegue: vLLM estándar (sin `model.py` personalizado). En GB10, NVFP4 no aporta velocidad (no hay cómputo FP4 nativo y los pesos se desquantizan al vuelo); la ganancia es de memoria y contexto: ~35 GiB por rango de pool KV frente a 7–9 GiB en FP8.
- Contexto paralelo: el contexto de 1M vía decode-context-parallel está cerrado en `glm_moe_dsa` sobre vLLM por un error de paginación (`page size is not divisible by target page size and cannot be padded` en `nvfp4_ds_mla`).
- Latencia y throughput: la decodificación en GB10 se sitúa cerca de FP8 + MTP; no se publican cifras concretas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Cuantización | Notas |
|---|---|---|---|---|---|
| GLM-5.3-UNCENSORED-NVFP4 | 753B (18B activos) | 1M | MIT | NVFP4 | Abliterado, orientado a seguridad ofensiva |
| zai-org/GLM-5.3 | 753B (18B activos) | 1M | no disponible | bf16 | Modelo base con alineación intacta |
| dealignai/GLM-5.3-ABLITERATED-NVFP4 | 753B (18B activos) | 1M | no disponible | NVFP4 | Espejo del mismo checkpoint según el autor |
| dealignai/GLM-5.3-UNCENSORED-FP8 | 753B (18B activos) | 1M | no disponible | FP8 | Variante FP8; el autor indica que NVFP4 tolera mejor `high` |

No se dispone de datos de benchmarks comparativos con otras familias (Llama, Qwen, DeepSeek) en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado para producir código ofensivo funcional; su uso sin autorización explícita puede ser ilegal en la mayoría de jurisdicciones. La licencia MIT no exime de responsabilidad legal por el uso del software generado.
- El razonamiento no se puede desactivar: cualquier valor de `reasoning_effort` distinto de `"low"` cae a `"max"`, incluido `off` o un `off:` YAML no entrecomillado que se parsea como booleano `false`.
- En NVFP4, `max` agota con frecuencia el presupuesto de tokens con un bloque de razonamiento largo y una respuesta truncada; se recomienda `high` con `max_tokens ≥ 16384`.
- El contexto de 1M no es alcanzable en la práctica con decode-context-parallel en vLLM para esta arquitectura; el techo real es ~512K en TP8.
- El texto de razonamiento se emite en `message.reasoning`, lo que rompe integraciones que esperan `message.reasoning_content`.
- Idioma limitado al inglés según la etiqueta del repo; no se garantiza calidad en castellano.
- La eliminación de rechazo a nivel de pesos afecta también a temas de daño social: en modo `off` la tasa de rechazo en HarmBench es del 7,3 %, y las 8 negativas observadas son 7 de copyright y 1 de persuasión política, lo que implica que la seguridad general es prácticamente nula.
- Riesgo elevado de alucinación en contenido técnico ofensivo: el código puede compilar y ejecutarse pero ser incorrecto o peligroso; requiere revisión humana antes de cualquier uso.
- No hay información sobre sesgos demográficos ni evaluación de robustez más allá de HarmBench y MMLU.
- El repo tiene 0 descargas y 0 likes en el momento de la ficha; no hay validación independiente de las afirmaciones del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheGreenCow/GLM-5.3-UNCENSORED-NVFP4
- Checkpoint original de dealignai: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-NVFP4
- Espejo abliterado: https://huggingface.co/dealignai/GLM-5.3-ABLITERATED-NVFP4
- Variante FP8: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8
- Discusión de despliegue en GB10: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8/discussions/3
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Ficha en NanoGPT: https://nano-gpt.com/models/text/z-ai/glm-5.3-uncensored
- Perfil del autor de la abliteration: https://huggingface.co/dealignai
