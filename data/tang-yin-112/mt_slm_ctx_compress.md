# Tang-yin-112/mt_slm_ctx_compress

## Resumen

mt_slm_ctx_compress es un ajuste fino (fine-tune) del modelo ibm-granite/granite-4.0-h-micro, publicado por el usuario Tang-yin-112 en Hugging Face. Se trata de un modelo especializado en la tarea de compresión de contexto de sesiones de agente (agent session compaction), desarrollado para el arena `ctx_compress` de la plataforma Microtensor. El modelo hereda la arquitectura híbrida GraniteMoE del modelo base de IBM, con aproximadamente 3.190 millones de parámetros totales.

El modelo resuelve un problema concreto: condensar el historial de una sesión de agente (turnos de conversación, resultados de herramientas, observaciones intermedias) en un contexto más corto que preserve la información relevante para continuar la tarea. Esto es crítico en pipelines de agentes donde el contexto crece rápidamente y supera la ventana disponible o encarece cada llamada al modelo principal.

La relevancia de esta ficha es limitada: se trata de un modelo de competición con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentación extensa. La model card es mínima y remite a un fichero `training/recipe.json` para los detalles de entrenamiento. La información disponible permite caracterizar la arquitectura heredada y el método de ajuste, pero no el rendimiento real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GraniteMoE híbrida (heredada de ibm-granite/granite-4.0-h-micro) |
| Parametros totales | 3.191.396.096 (3,19 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base, sin confirmar) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | microtensor-submission (license: other, enlace a términos de Microtensor) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es ibm-granite/granite-4.0-h-micro, un transformer híbrido de la familia Granite 4.0 de IBM que combina capas de atención con mecanismos de estado (Mamba/SSM) bajo el identificador de arquitectura `granitemoehybrid`. El ajuste se realizó mediante LoRA de rango 32, fusionado (merged) y guardado en bf16, según la model card. El checkpoint base concreto es `d5f01a3ea75f`, bajo licencia Apache 2.0.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de compresión de contexto, ni si hubo etapas de RLHF o DPO. La model card remite a `training/recipe.json` dentro del repositorio para los detalles de la receta, pero ese contenido no está incluido en la información proporcionada. No se documentan innovaciones técnicas adicionales más allá del propio ajuste LoRA para la tarea de compactación.

## Capacidades

- Compresión de contexto de sesiones de agente: tarea principal para la que fue ajustado, orientada a condensar historiales multi-turno y resultados de herramientas.
- Generación de texto: capacidad heredada del modelo base Granite 4.0.
- Razonamiento y código: presumiblemente heredadas del modelo base, aunque no verificadas para este checkpoint.
- Tool calling / function calling: no confirmado en la documentación disponible.
- Soporte de agentes multi-paso: el modelo está diseñado como componente dentro de pipelines de agentes (compactación), no necesariamente como agente autónomo.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Compactación de historial en agentes de larga duración: el modelo recibe el historial acumulado de una sesión (turnos, llamadas a herramientas, observaciones) y produce una versión condensada que se reinyecta en el contexto del modelo principal, reduciendo el consumo de tokens en cada iteración.
- Reducción de costes en pipelines de agentes: al sustituir historiales largos por resúmenes compactos, se disminuye el número de tokens de entrada facturados en cada llamada al LLM orquestador.
- Gestión de ventana de contexto en asistentes conversacionales: cuando una conversación supera el límite del modelo principal, este modelo puede generar un resumen estructurado que preserve decisiones, entidades y estado de la tarea.
- Memoria episódica en sistemas RAG agénticos: condensar trazas de recuperación y resultados de búsqueda antes de almacenarlos en memoria a largo plazo.
- Preprocesado en sistemas de soporte técnico multi-turno: resumir tickets o hilos de conversación largos para alimentar clasificadores o modelos de respuesta.
- Investigación en compresión de contexto: servir como checkpoint de referencia para experimentos sobre compactación de sesiones dentro del arena `ctx_compress` de Microtensor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 6,4 GB solo para pesos (3,19 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: alrededor de 3,2 GB para pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 1,6-2 GB para pesos.
- GPU consumer: cabe en GPUs con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 3070) en bf16; en cuantización de 4 bits podría caber en GPUs de 4-6 GB.
- GPU de datacenter: A100, H100, L40S y similares son sobredimensionadas para este tamaño; útiles para servir muchas réplicas concurrentes.
- Opciones de despliegue: al ser un checkpoint safetensors con arquitectura GraniteMoE híbrida, requiere frameworks con soporte para dicha arquitectura (por ejemplo, transformers con la implementación de Granite 4.0, o vLLM si soporta el modelo base). No se confirma soporte en llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| mt_slm_ctx_compress | 3,19 mil millones | no disponible | microtensor-submission | Hugging Face, 0 descargas |
| ibm-granite/granite-4.0-h-micro (base) | 3,19 mil millones (aprox.) | no disponible en esta ficha | Apache 2.0 | Hugging Face, modelo oficial de IBM |
| Modelos especializados en compactación de contexto | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre benchmarks comparativos ni sobre otros modelos especializados en la misma tarea dentro del arena `ctx_compress`. La comparación más directa es con el modelo base, del que este checkpoint hereda arquitectura y pesos, con la diferencia del ajuste LoRA para compactación y un cambio de licencia a los términos de Microtensor.

## Limitaciones y advertencias

- Licencia restrictiva: la licencia `microtensor-submission` remite a los términos de Microtensor (https://www.microtensor.cloud/terms), que no son Apache 2.0 como el modelo base. Es necesario revisar dichos términos antes de cualquier uso comercial.
- Modelo de competición sin validación externa: cero descargas y cero likes en el momento de la consulta; no hay evidencia pública de calidad o robustez.
- Sin benchmarks publicados: no se puede verificar el rendimiento en la tarea de compactación frente a alternativas.
- Especialización estrecha: el ajuste está orientado a `ctx_compress`; su comportamiento en otras tareas puede degradarse respecto al modelo base.
- Idiomas no declarados: se desconoce si el ajuste preserva el multilingüismo del modelo base.
- Riesgo de alucinación y pérdida de información: en tareas de compactación, el modelo puede omitir detalles críticos del historial o inventar contenido al resumir; requiere validación en producción.
- Sesgos: no documentados, pero heredables del corpus de entrenamiento del modelo base Granite 4.0.
- Soporte de herramientas de inferencia incierto: la arquitectura híbrida GraniteMoE puede no estar soportada en todos los runtimes; verificar compatibilidad antes de desplegar.
- Fecha de creación futura en los metadatos (2026-11-03): conviene verificar la integridad y procedencia del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tang-yin-112/mt_slm_ctx_compress
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-h-micro
- Términos de licencia Microtensor: https://www.microtensor.cloud/terms
- Receta de entrenamiento (referenciada en la model card): `training/recipe.json` dentro del repositorio de Hugging Face
