# Tang-yin-112/mt_slm_ctx_compress-granite

## Resumen

`mt_slm_ctx_compress-granite` es un ajuste fino (fine-tuning) del modelo `ibm-granite/granite-4.0-h-micro` de IBM, publicado por el usuario Tang-yin-112 en Hugging Face. El modelo está especializado en la tarea de compactación de contexto de sesiones de agente (`ctx_compress`), es decir, resumir y comprimir el historial de una conversación agéntica para que quepa en la ventana de contexto de un modelo posterior sin perder información operativa relevante. Forma parte de la arena `ctx_compress` de la plataforma Microtensor.

Técnicamente se trata de un modelo de 3.191.396.096 parámetros (aproximadamente 3,2 mil millones) con arquitectura `granitemoehybrid`, la arquitectura híbrida de mezcla de expertos de la familia Granite 4.0 de IBM. El ajuste se realizó mediante LoRA de rango 32, fusionado (merged) y guardado en precisión bf16. El repositorio ocupa 6,4 GB y los pesos están en formato safetensors.

La relevancia de este modelo es acotada: es un artefacto de competición orientado a una tarea muy específica (compresión de contexto para agentes), con licencia restrictiva `microtensor-submission` y sin métricas de benchmarks publicadas en la información disponible. No está pensado como modelo de propósito general, sino como componente especializado dentro de un pipeline de agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | granitemoehybrid (MoE híbrida, familia Granite 4.0 de IBM) |
| Parametros totales | 3.191.396.096 (~3,2 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | microtensor-submission (other); modelo base Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base `ibm-granite/granite-4.0-h-micro`, etiquetada como `granitemoehybrid`. Se trata de una arquitectura híbrida de la familia Granite 4.0 de IBM que combina capas de mezcla de expertos (MoE) con componentes de atención, si bien la información disponible no detalla la proporción exacta de capas ni el número de expertos activos por token. El checkpoint base referenciado es la revisión `d5f01a3ea75f`.

El ajuste se realizó mediante LoRA de rango 32 sobre el modelo base, con posterior fusión de los adaptadores y guardado en bf16. La model card remite a `training/recipe.json` para los detalles de la receta de entrenamiento, pero no se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. La tarea de entrenamiento es la compactación de contexto de sesiones de agente dentro de la arena `ctx_compress` de Microtensor.

## Capacidades

- Compactación de contexto de sesiones de agente: la capacidad principal para la que fue entrenado, resumiendo historiales multi-turno en representaciones más cortas.
- Generación de texto: heredada del modelo base Granite 4.0.
- Razonamiento y seguimiento de instrucciones: capacidades del modelo base, no verificadas específicamente tras el ajuste.
- Soporte de tool calling / function calling: no confirmado en la información disponible para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: orientado precisamente a infraestructura de agentes (compresión de sesión), aunque no se documentan capacidades agénticas propias.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Compactación de historial en agentes de larga duración: el modelo resume el historial acumulado de una sesión de agente para liberar espacio en la ventana de contexto de un modelo principal, manteniendo los hechos y decisiones clave. Es su propósito declarado y el escenario para el que fue entrenado.
- Gestión de memoria en pipelines multi-agente: como paso intermedio entre turnos, comprime el estado de la conversación antes de pasarlo a otro agente o a una herramienta, reduciendo el coste de tokens en modelos de contexto largo.
- Reducción de costes de inferencia: al sustituir historiales largos por resúmenes compactos, disminuye el número de tokens de entrada enviados al modelo principal en producción.
- Investigación en compresión de contexto: sirve como referencia o baseline en experimentos sobre compactación de sesiones y evaluación de retención de información.
- Evaluación comparativa en la arena Microtensor `ctx_compress`: útil para participantes o investigadores que quieran reproducir o comparar resultados dentro de esa competición.
- Prototipado de sistemas de memoria para asistentes conversacionales: puede integrarse en arquitecturas de memoria jerárquica donde un modelo pequeño comprime y otro modelo mayor razona sobre el resumen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 6,4 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 8-10 GB de VRAM en bf16.
- VRAM estimada en cuantización de 8 bits: en torno a 3,5-4 GB para pesos; en 4 bits, en torno a 2-2,5 GB para pesos (estimaciones a partir del recuento de parámetros; no se publican cuantizaciones oficiales).
- GPU recomendadas: A100, H100 o L40S para despliegue en producción en bf16; RTX 4090, RTX 3090 o RTX A6000 para inferencia en una sola GPU.
- GPU de consumo: cabe en GPUs consumer con 8 GB o más en bf16 (por ejemplo, RTX 3070/4060 Ti de 8 GB con margen ajustado) y con holgura en 12-16 GB (RTX 4070 Ti, RTX 4080). En cuantización de 4 bits podría ejecutarse en GPUs de 4-6 GB.
- Opciones de despliegue: vLLM, TGI, llama.cpp/Ollama (previa conversión a GGUF, no publicada) y transformers con safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| mt_slm_ctx_compress-granite | ~3,2 mil millones | no disponible | microtensor-submission | Hugging Face (0 descargas) |
| ibm-granite/granite-4.0-h-micro (base) | ~3,2 mil millones | no disponible | Apache 2.0 | Hugging Face (oficial IBM) |
| Alternativas especializadas en compresión de contexto | no disponible | no disponible | no disponible | no disponible |

La comparación más directa es con su modelo base, `ibm-granite/granite-4.0-h-micro`: mismo tamaño y arquitectura, pero licencia Apache 2.0 y uso general, frente a la licencia restrictiva y el propósito especializado del checkpoint ajustado. No se dispone de información sobre otros modelos comparables de la misma categoría (compresión de contexto para agentes) en la documentación proporcionada.

## Limitaciones y advertencias

- Licencia `microtensor-submission` con términos en microtensor.cloud/terms: restricciones de uso comercial no detalladas en la información disponible; conviene revisar los términos antes de cualquier uso en producción.
- Especialización estrecha: el modelo está entrenado para la tarea `ctx_compress`; su rendimiento en tareas generales de generación o razonamiento puede degradarse respecto al modelo base.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad en la compactación ni de retención de información tras la compresión.
- Riesgo de alucinación y pérdida de información: al ser un modelo de resumen/compresión, puede omitir detalles críticos o introducir hechos no presentes en el historial original.
- Idiomas soportados no documentados: no se puede garantizar un comportamiento correcto fuera del inglés sin verificación empírica.
- Longitud de contexto no documentada: no se conoce la ventana máxima efectiva para procesar historiales largos.
- Modelo con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso en producción.
- Sin cuantizaciones oficiales publicadas (GGUF, AWQ, GPTQ): el despliegue eficiente requiere conversión propia.
- Repositorio de 6,4 GB: el almacenamiento y la transferencia deben tenerse en cuenta en entornos con recursos limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tang-yin-112/mt_slm_ctx_compress-granite
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-h-micro
- Términos de licencia Microtensor: https://www.microtensor.cloud/terms
- Receta de entrenamiento referenciada en la model card: `training/recipe.json` (dentro del repositorio del modelo)
