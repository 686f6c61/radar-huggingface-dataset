# Vishva007/MiMo-V2.6-Distill-Qwen-9B-W4A16-GPTQ

## Resumen

MiMo-V2.6-Distill-Qwen-9B-W4A16-GPTQ es un checkpoint cuantizado del modelo multimodal XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, publicado por el usuario Vishva007 en HuggingFace. Se trata de una destilación sobre la base arquitectónica Qwen (tag `qwen3_5`) orientada a tareas agénticas, generación de código, tool calling y decisión multimodal (image-text-to-text). La cuantización emplea AutoRound/SignRound en esquema W4A16 (pesos de 4 bits, activaciones de 16 bits) con grupo de 32, lo que reduce de forma notable el consumo de VRAM frente al modelo original en bfloat16.

El interés principal de esta ficha reside en que combina tres elementos poco habituales en un modelo de ~9B: capacidades de visión, capa de Multi-Token Prediction (MTP) para decodificación especulativa y un pipeline de razonamiento con modo thinking conmutable. El autor preserva en `bfloat16` nativo los módulos visuales y MTP, de modo que la cuantización no degrada ni la rama multimodal ni el mecanismo de predicción especulativa. Está pensado para servirse con vLLM y expone un endpoint no estándar (`/v1/systemone`) para consultas estructuradas de decisión sobre imágenes.

La licencia es MIT, lo que facilita su uso comercial, y el repo ocupa 9,0 GB. No obstante, conviene señalar que el número de parámetros reportado en safetensors (2.491.309.296) no concuerda con la denominación "9B" del modelo base, probablemente porque el checkpoint cuantizado solo incluye los tensores empaquetados en 4 bits y no representa el total efectivo. Es un detalle relevante a verificar antes de dimensionar el despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivada de Qwen (tag `qwen3_5`), con capa MTP y codificador visual |
| Parametros totales | 2.491.309.296 según safetensors del checkpoint cuantizado; el modelo base se denomina "9B" (no disponible el desglose exacto) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens en la configuración de servicio recomendada (`--max-model-len 32768`); no disponible el máximo nativo del modelo base |
| Tipos de cuantizacion | W4A16 (4 bits pesos, 16 bits activaciones), AutoRound/SignRound, `sym=True`, `group_size=32`, `iters=1000`; módulos `mtp`, `mtp.fc` y `visual` en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 9,0 GB), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El checkpoint es una cuantización del modelo base XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, que por los tags (`qwen3_5`, `image-text-to-text`) se apoya en la familia arquitectónica Qwen con extensión multimodal: un codificador visual que alimenta al decoder de lenguaje. Sobre esa base se añade una capa de Multi-Token Prediction (MTP) con su proyección `mtp.fc`, empleada para decodificación especulativa en vLLM. El pipeline declarado es `image-text-to-text`, y los tags `agentic`, `code` y `tool-use` indican que la destilación está orientada a razonamiento multi-paso, generación de código y uso de herramientas.

El proceso de cuantización, documentado en la model card, usa AutoRound/SignRound con 1000 iteraciones, simetría activada, grupo de 32 y calibración sobre 512 muestras de longitud 2048 (batch 2, acumulación de gradiente 4). La decisión técnica destacable es mantener sin cuantizar, en bfloat16, los módulos `visual`, `mtp` y `mtp.fc`, de forma que la rama de visión y la predicción especulativa conservan precisión nativa. No se especifican en la información disponible el número de tokens de entrenamiento del modelo base, la composición del dataset ni si hubo RLHF/DPO; tampoco se detalla el proceso de destilación más allá del nombre.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo thinking conmutable mediante `enable_thinking` en el chat template.
- Generación de código, inferencia lógica y tareas de programación (tags `code`).
- Comprensión de imágenes y texto combinados (pipeline `image-text-to-text`), incluyendo decisión estructurada sobre imágenes.
- Tool calling / function calling, con parser dedicado `qwen3_coder` y `--enable-auto-tool-choice` en vLLM.
- Comportamiento agéntico: resolución de problemas con herramientas y planificación (tag `agentic`).
- Decodificación especulativa mediante MTP (`num_speculative_tokens=1`), que acelera la generación.
- Consultas estructuradas de decisión vía endpoint `/v1/systemone`, con preguntas tipadas (`choice`) y criterios definidos.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Inspección visual automatizada con salida estructurada: el endpoint `/v1/systemone` permite enviar una imagen y un conjunto de preguntas tipadas con criterios, devolviendo una decisión en JSON. Adecuado para clasificación de imágenes en pipelines donde se necesita una respuesta parseable y no texto libre.
- Agentes de código en producción: con tool calling habilitado y parser `qwen3_coder`, el modelo puede integrarse en flujos de CI/CD o asistentes de IDE que invocan funciones, ejecutan tests y aplican parches de forma iterativa.
- Automatización de atención al cliente con contexto largo: los 32.768 tokens de ventana permiten mantener conversaciones multi-turno con historial extenso y documentación adjunta.
- Razonamiento sobre documentos con imágenes: al combinar visión y texto, sirve para extraer y razonar sobre capturas, diagramas o formularios escaneados en procesos administrativos.
- Despliegue en hardware limitado: la cuantización W4A16 reduce la huella de VRAM, lo que permite servir el modelo en una sola GPU de consumo o de gama media para prototipos y entornos de desarrollo.
- Servicio de alto throughput con vLLM: la configuración recomendada (prefix caching, chunked prefill, KV cache en fp8, MTP) está pensada para atender muchas peticiones concurrentes con baja latencia en producción.
- Evaluación comparativa de cuantizaciones: útil como referencia para medir la pérdida de calidad de W4A16 frente al modelo base en tareas agénticas y multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 9,0 GB, por lo que los pesos en W4A16 ocupan en torno a esa cifra; a ello hay que sumar la caché KV (configurable en fp8) y el espacio de activaciones. Con `--max-model-len 32768` y `--gpu-memory-utilization 0.90` el autor asume un despliegue en GPU con margen suficiente para caché y batching.
- GPU recomendadas: no se especifican modelos concretos en la información disponible. Por tamaño de pesos, una GPU de 16-24 GB (por ejemplo, RTX 4090 o A10G) sería el mínimo razonable para contexto moderado; para contexto completo de 32K y batching alto conviene una A100 o H100.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090 (24 GB) y posiblemente en GPUs de 16 GB con contexto reducido; no confirmado por el autor.
- Opciones de despliegue: vLLM es la vía documentada y recomendada (con `--trust-remote-code`, `--enable-auto-tool-choice`, `--tool-call-parser qwen3_coder`, `--reasoning-parser qwen3` y `--speculative-config` con MTP). La librería declarada es transformers; no se documentan opciones para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. La configuración incluye decodificación especulativa con un token MTP, prefix caching y chunked prefill, orientados a mejorar throughput, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B-W4A16-GPTQ (este) | ~9B (2,49B en safetensors cuantizados) | 32.768 en config. recomendada | MIT | safetensors W4A16 | Multimodal, MTP, tool calling |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (base) | "9B" | no disponible | no disponible | safetensors bf16 | Modelo original sin cuantizar; mayor VRAM |
| Qwen3-8B (referencia de familia) | ~8B | no disponible | no disponible | safetensors, GGUF | Solo texto; sin visión ni MTP documentados |
| Otros modelos 8-9B con visión | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de resultados de benchmarks que permitan comparar rendimiento entre estas opciones.

## Limitaciones y advertencias

- La cuantización W4A16 introduce pérdida de precisión frente al modelo base; el autor solo garantiza bfloat16 en visión y MTP, no en el resto de capas.
- El endpoint `/v1/systemone` no es estándar y requiere versiones modernas o nightly de vLLM (> v0.32.0 según la model card), lo que limita la portabilidad.
- El número de parámetros del checkpoint (2,49B) no coincide con la denominación "9B" del modelo base; conviene validar el tamaño efectivo y el consumo real antes de dimensionar infraestructura.
- No se documentan idiomas soportados ni evaluación multilingüe; el rendimiento en castellano no está verificado.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en decisiones visuales con criterios ambiguos; se recomienda validación posterior en producción.
- No se proporcionan datos de sesgos, evaluación de seguridad ni benchmarks; el modelo no ha pasado por un proceso de auditoría documentado en esta ficha.
- El repositorio tiene muy poca tracción (50 descargas, 0 likes) y fue creado recientemente; la fiabilidad del mantenedor no está contrastada.
- La model card incluye enlaces de afiliado a RunPod; no afectan al modelo pero conviene tratarlos con cautela.
- Licencia MIT: permite uso comercial, pero el modelo base podría tener condiciones adicionales no reflejadas aquí; verificar la licencia del modelo original.

## Enlaces

- HuggingFace del checkpoint: https://huggingface.co/Vishva007/MiMo-V2.6-Distill-Qwen-9B-W4A16-GPTQ
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- RunPod (enlace de afiliado presente en la model card): https://runpod.io?ref=iabrlp7z
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
