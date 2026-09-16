# soyrsoyr/Qwen3.8-27B-FP8-DYNAMIC-MTP

## Resumen

Qwen3.8-27B-FP8-DYNAMIC-MTP es un checkpoint cuantizado en FP8 del modelo Qwen/Qwen3.8-27B, publicado por el usuario soyrsoyr. No es un entrenamiento nuevo ni un ajuste fino: es una cuantizacion post-entrenamiento generada con llm-compressor que convierte las capas lineales a FP8 con escalas dinamicas, manteniendo intacta la estructura del modelo base. Su rasgo diferencial es que tambien cuantiza la capa de Multi-Token Prediction (MTP), algo poco habitual en las cuantizaciones publicadas de terceros.

El modelo tiene 27.320.697.856 parametros y ocupa 29,9 GB en el repositorio, lo que es coherente con pesos de 1 byte por parametro mas los tensores auxiliares de escalas. Incorpora un shard dedicado `model_mtp.safetensors` con su propio grupo de cuantizacion (`mtp_group`), de modo que la capa MTP puede usarse directamente como borrador especulativo en vLLM sin necesidad de un modelo draft separado.

La relevancia practica esta en el ahorro de memoria y en la decodificacion especulativa integrada: segun la model card, el borrador MTP cuantizado alcanza una tasa de aceptacion del 84% (292 de 347 tokens borrador aceptados) sirviendo con vLLM 0.28. Se publica bajo licencia Apache 2.0, aunque con cero descargas y cero likes en el momento de redactar esta ficha y sin resultados de benchmarks de calidad publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los tags indican la familia `qwen3_5`; la model card no detalla la arquitectura interna) |
| Parametros totales | 27.320.697.856 (unos 27,32 mil millones) |
| Parametros activos | no disponible (no se indica si el modelo base es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 dinamico: pesos FP8 con escalas channel-wise, activaciones FP8 dinamicas por token, `lm_head` excluido de la cuantizacion, capa MTP tambien en FP8 dinamico |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con esquema compressed-tensors; incluye shard `model_mtp.safetensors` |

## Arquitectura y entrenamiento

Se trata de una cuantizacion, no de un entrenamiento. El pipeline aplicado es un `QuantizationModifier` de llm-compressor con `targets=["Linear"]`, `ignore=["lm_head"]` y `scheme="FP8_DYNAMIC"`, ejecutado sobre el modelo base cargado en bfloat16 en `cuda:0`. La innovacion respecto a otras cuantizaciones de la misma familia es el uso del parametro `mtp_quant_scheme="FP8_DYNAMIC"` en la llamada a `oneshot(...)`, que extiende la cuantizacion a la capa de Multi-Token Prediction y la serializa en un shard propio con un grupo de cuantizacion independiente.

La capa MTP es un cabezal que predice varios tokens a la vez y que puede actuar como borrador en decodificacion especulativa. Al conservarla dentro del checkpoint cuantizado, el despliegue no necesita cargar un modelo draft adicional, lo que reduce el consumo de VRAM frente a esquemas de decodificacion especulativa con draft separado. No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base, la composicion del dataset ni si hubo RLHF o DPO, ya que esos datos no aparecen en la informacion proporcionada.

## Capacidades

- Generacion de texto y uso conversacional, segun el `pipeline_tag` (`text-generation`) y el tag `conversational`.
- Decodificacion especulativa mediante la capa MTP cuantizada, con soporte explicito en vLLM a traves de `--speculative-config '{"method": "mtp", "num_speculative_tokens": 1}'`.
- Inferencia en FP8 con activaciones dinamicas por token, lo que reduce el ancho de banda de memoria en la fase de decodificacion.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se listan idiomas en la informacion proporcionada).
- Modo thinking, vision o audio: no disponible.
- Capacidades especiales confirmadas: unicamente la integracion de MTP para decodificacion especulativa.

## Casos de uso

- Despliegue de un modelo de 27.000 millones de parametros en una GPU unica de 40-48 GB: al almacenar los pesos en FP8 (1 byte por parametro) el checkpoint ocupa aproximadamente 27,3 GB, lo que permite servirlo en una sola A100 40 GB, L40S 48 GB o A6000 48 GB con margen para la cache KV.
- Servicio de chat conversacional de alto volumen con vLLM: la configuracion recomendada por el autor (`--max-num-seqs 256`) esta pensada para maximizar el numero de secuencias concurrentes en un servidor de inferencia.
- Aceleracion de la decodificacion en cargas sensibles a la latencia: usar la capa MTP como borrador especulativo con `num_speculative_tokens=1` permite validar mas de un token por paso del modelo objetivo cuando la tasa de aceptacion es alta (el autor reporta un 84%).
- Sustituir el checkpoint en bfloat16 en un despliegue existente de Qwen3.8-27B para reducir a la mitad la huella de pesos, siempre que el hardware soporte kernels FP8 nativos (Ada Lovelace o Hopper).
- Evaluacion interna de decodificacion especulativa: sirve como banco de pruebas para medir tasas de aceptacion de un borrador MTP cuantizado frente a uno en bf16.
- Integracion en plataformas de inferencia basadas en compressed-tensors (vLLM, y potencialmente otros runners que soporten dicho esquema), sin necesidad de reconvertir el modelo.
- Prototipado de asistentes de generacion de texto con coste de hardware contenido, al evitar el patron habitual de "modelo objetivo + modelo draft" con dos copias en memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de rendimiento aportado por el autor es la tasa de aceptacion del borrador MTP:

| Metrica | Valor | Condiciones |
|---|---|---|
| Tasa de aceptacion del borrador MTP | ~84% (292 de 347 tokens borrador aceptados) | vLLM 0.28, este checkpoint como modelo objetivo y su capa MTP como borrador, `num_speculative_tokens=1` |
| Tokens especulativos por paso | 1 | misma configuracion |

No se aportan datos de latencia (TTFT, TPOT), throughput (tokens/s), ni comparacion con el modelo base en bfloat16. Tampoco se publica ninguna evaluacion del impacto de la cuantizacion FP8 sobre la calidad de las respuestas.

## Requisitos de hardware

- VRAM estimada para los pesos: unos 27,3 GB en FP8, mas los tensores de escalas (el repositorio completo ocupa 29,9 GB).
- VRAM total recomendada: 40-48 GB como minimo para dejar espacio a la cache KV y a las activaciones dinamicas. Con contextos largos o `--max-num-seqs 256`, conviene apuntar a 80 GB.
- GPU recomendadas: H100 80 GB o A100 80 GB para FP8 nativo con margen amplio; L40S 48 GB o A6000 48 GB como opcion ajustada; A100 40 GB solo con contextos y lotes pequenos.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en una RTX 5090 (32 GB) de forma comoda, ya que los pesos por si solos superan o igualan la VRAM disponible. Requiere al menos dos GPU de consumo con tensor parallelism, o bien una cuantizacion adicional de menor precision (INT4/W4A16) no incluida en este repositorio.
- Nota sobre FP8: los kernels FP8 nativos requieren arquitecturas Hopper (H100/H200) o Ada Lovelace (L40S, RTX 4090/5090); en Ampere y anteriores el modelo se puede ejecutar, pero sin las ventajas de rendimiento del FP8 nativo.
- Opciones de despliegue: vLLM es la ruta documentada por el autor (con soporte de compressed-tensors y `--speculative-config`). llama.cpp y Ollama no estan confirmados para este formato, ya que publican GGUF y no compressed-tensors. TGI no aparece mencionado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos verificables de alternativas comparables en la informacion proporcionada. La tabla siguiente recoge unicamente los campos que pueden afirmarse con certeza:

| Modelo | Parametros | Precision | Formato | MTP cuantizado | Licencia | Benchmarks publicados |
|---|---|---|---|---|---|---|
| soyrsoyr/Qwen3.8-27B-FP8-DYNAMIC-MTP | 27,32 mil millones | FP8 dinamico | compressed-tensors (safetensors) | Si | Apache 2.0 | No (solo tasa de aceptacion MTP) |
| Qwen/Qwen3.8-27B (modelo base) | no disponible | bfloat16 (referido en el script de cuantizacion) | safetensors | no disponible | no disponible | no disponible |
| Otras cuantizaciones de terceros de la misma familia | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han localizado en la busqueda web resultados relevantes sobre este modelo ni sobre su modelo base; los resultados devueltos corresponden a guias no relacionadas y se han descartado.

## Limitaciones y advertencias

- Riesgo de degradacion por cuantizacion: el autor no publica ninguna evaluacion comparativa frente al modelo base en bfloat16, por lo que no puede cuantificarse la perdida de calidad derivada del paso a FP8.
- Ausencia total de benchmarks: sin MMLU, HumanEval, GSM8K ni evaluaciones de razonamiento, no hay evidencia publica de la calidad del modelo cuantizado.
- Tasa de aceptacion MTP medida en una unica configuracion (vLLM 0.28, `num_speculative_tokens=1`) y sobre una muestra pequena (347 tokens borrador). No debe generalizarse a otros prompts, dominios ni valores de `num_speculative_tokens`.
- Repositorio sin traccion: cero descargas y cero likes en el momento de redactar la ficha, lo que implica ausencia de validacion independiente por parte de la comunidad.
- Longitud de contexto e idiomas no declarados: no es posible planificar despliegues con requisitos de contexto largo o multilingues sin consultar la model card del modelo base.
- Incertidumbre sobre el modelo base: no se detalla si Qwen3.8-27B es denso o MoE, ni su arquitectura exacta; el tag `qwen3_5` sugiere la familia, pero no lo confirma.
- Compatibilidad de despliegue restringida: el formato compressed-tensors limita las opciones a runners que lo soporten; no hay GGUF publicado, por lo que no es directamente utilizable en llama.cpp u Ollama.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar de forma independiente la licencia del modelo base, ya que la informacion proporcionada no la incluye.
- Riesgo de alucinacion y sesgos: no disponible; no se aporta informacion al respecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/soyrsoyr/Qwen3.8-27B-FP8-DYNAMIC-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- llm-compressor (herramienta de cuantizacion): https://github.com/vllm-project/llm-compressor
- vLLM (motor de inferencia usado en las pruebas): https://github.com/vllm-project/vllm
- Resultados de la busqueda web: no se han encontrado enlaces relevantes (los resultados devueltos no guardan relacion con el modelo)
