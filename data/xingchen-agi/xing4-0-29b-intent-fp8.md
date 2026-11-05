# XingChen-AGI/Xing4.0-29B-Intent-FP8

## Resumen

Xing4.0-29B-Intent es un modelo de lenguaje especializado en reconocimiento de intenciones y extracción estructurada de información, desarrollado por XingChen-AGI a partir del modelo semántico Xing4.0-29B-A4B de China Telecom Artificial Intelligence Technology Co., Ltd. Su función principal es convertir lenguaje natural en resultados estructurados en formato JSON, con una representación unificada basada en `category + args` que cubre cuatro tipos de tarea: reconocimiento de intención con slot filling, reconocimiento de entidades nombradas, extracción de relaciones y extracción de eventos.

El modelo parte de una arquitectura de mezcla de expertos (MoE) con aproximadamente 29B de parámetros totales y unos 4B activos por token, según indica la model card del autor. Esta versión concreta, Xing4.0-29B-Intent-FP8, es una cuantización en FP8 del modelo base, con 31.215.031.088 parámetros reales según los safetensors y un repositorio de 33,2 GB. Soporta chino e inglés y se distribuye bajo licencia Apache 2.0.

La relevancia del modelo reside en su enfoque schema-guided: el usuario define las categorías candidatas y los campos extraíbles mediante un esquema, y el modelo devuelve resultados con esa misma estructura, lo que facilita la integración en asistentes inteligentes, enrutamiento de peticiones y pipelines de extracción documental. La model card reporta resultados competitivos frente a modelos propietarios de gran tamano en tareas de intención y extracción, aunque con margen de mejora en extracción de eventos y relaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), transformer; detalles completos en el modelo base Xing4.0-29B-A4B |
| Parametros totales | 31.215.031.088 (aproximadamente 29B según la model card) |
| Parametros activos | Aproximadamente 4B por token (según la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (esta versión); el modelo base admite otras cuantizaciones según el ecosistema del autor, no detalladas |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers, con custom_code) |

## Arquitectura y entrenamiento

El modelo se construye sobre Xing4.0-29B-A4B, un modelo de lenguaje semántico con arquitectura de mezcla de expertos de aproximadamente 29B de parámetros totales y unos 4B activos por token. La model card remite al repositorio del modelo base para los detalles técnicos de la arquitectura, y no proporciona información específica sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el ajuste.

El ajuste específico de esta variante se orienta a tareas de reconocimiento y extracción estructurada bajo un protocolo schema-guided común. El modelo recibe instrucciones de tarea, un esquema con categorías candidatas y definiciones de campos, y texto o conversación, y devuelve un array JSON cuyos elementos contienen `category` y `args`. La model card menciona un dataset companero (XingChen-AGI/Xing4.0-29B-Intent-oss) y un SDK que gestiona definiciones de esquema, ensamblado de prompts, entrada multi-turno y llamadas síncronas y asíncronas. Esta versión FP8 cuantiza los pesos para reducir el espacio en disco y los requisitos de memoria, manteniendo el mismo pipeline de transformers con código personalizado.

## Capacidades

- Reconocimiento de intención y slot filling: identifica la intención del usuario y extrae los parámetros de negocio asociados en una sola pasada.
- Reconocimiento de entidades nombradas (NER): extrae entidades según los tipos y campos definidos en el esquema.
- Extracción de relaciones: identifica relaciones entre entidades, incluyendo las entidades participantes y campos relevantes.
- Extracción de eventos: extrae participantes, tiempo, ubicación y otros campos definidos para cada tipo de evento.
- Representación unificada de tareas: las cuatro tareas comparten el formato `category + args`, con arrays JSON que admiten múltiples categorías y múltiples instancias de argumentos.
- Configuración guiada por esquema: las categorías candidatas, sus descripciones y las definiciones de campos se especifican en la entrada, con el mismo protocolo de entrada/salida entre escenarios de negocio.
- Soporte multi-turno: el SDK companero permite entrada de conversación multi-turno.
- Capacidades multilingües en chino e inglés, con evaluación en corpus de ambos idiomas.
- SDK companero con definiciones de esquema, ensamblado de prompts, llamadas síncronas y asíncronas y acceso conveniente a resultados estructurados.
- No se documentan en la información disponible capacidades de visión, audio, tool calling genérico ni modo de razonamiento explícito.

## Casos de uso

- Asistentes inteligentes y enrutamiento de peticiones: el modelo convierte una solicitud como "busca vuelos de Pekín a Shanghái mañana" en una intención de búsqueda de vuelos con origen, destino y fecha, lo que permite enrutar la petición al servicio adecuado con parámetros ya estructurados.
- Extracción de información documental: dado un esquema con los campos de interés, el modelo extrae entidades, relaciones y eventos de textos en chino o inglés y devuelve JSON listo para persistir en una base de datos o un sistema de gestión.
- Automatización de atención al cliente: con entrada multi-turno soportada por el SDK, el modelo identifica la intención del cliente y los parámetros relevantes (producto, pedido, motivo) para derivar la conversación al flujo de resolución correspondiente.
- Procesamiento de lenguaje natural en pipelines de negocio: la representación unificada `category + args` permite usar un único modelo y un único protocolo de entrada/salida para NER, relaciones, eventos e intenciones, simplificando el mantenimiento de varios microservicios de extracción.
- Análisis de conversaciones y textos para inteligencia de negocio: extracción de eventos y relaciones de corpus en chino e inglés para alimentar paneles analíticos o sistemas de búsqueda estructurada.
- Integración en aplicaciones mediante SDK: el SDK companero facilita la definición de esquemas, el ensamblado de prompts y las llamadas síncronas y asíncronas, lo que reduce el trabajo de integración en servicios backend.
- Prototipado rápido de tareas de extracción con esquemas personalizados: al definirse las categorías y campos en la entrada, se pueden probar nuevos dominios sin reentrenar el modelo, validando después el rendimiento con datos y esquemas propios.

## Benchmarks y rendimiento

La model card presenta resultados en una escala de 0 a 100, redondeados a enteros, sobre cuatro tipos de tarea. Los datos disponibles son los siguientes:

| Modelo | Global | Categoría | Extracción de eventos | NER | Extracción de relaciones | Comprensión de intenciones |
|---|---:|---:|---:|---:|---:|---:|
| Xing4.0-29B-Intent | 58 | 69 | 40 | 72 | 38 | 81 |
| Gemini-3.6-Flash | 49 | 71 | 30 | 71 | 29 | 64 |
| Qwen3.8-Max | 46 | 71 | 29 | 66 | 26 | 63 |
| Kimi-K3 | 45 | 71 | 28 | 68 | 25 | 61 |
| GPT-5.6-Sol | 45 | 70 | 28 | 68 | 23 | 60 |
| GLM-5.2 | 44 | 70 | 29 | 65 | 25 | 58 |
| GLM-5.3-Flash | 44 | 69 | 27 | 65 | 26 | 58 |
| DeepSeek-V4.1-Flash | 42 | 67 | 26 | 61 | 23 | 56 |
| DeepSeek-V4-Pro | 41 | 67 | 23 | 60 | 24 | 56 |
| LongCat-2.0 | 41 | 68 | 24 | 62 | 23 | 53 |
| GPT-6-Luna | 39 | 64 | 24 | 59 | 20 | 51 |

No se dispone en la información proporcionada de la metodología detallada de evaluación, del desglose por idioma ni de resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos FP8, los 31.215.031.088 parámetros ocupan aproximadamente 31,2 GB solo en pesos; hay que anadir la memoria para caché KV, activaciones y overhead del runtime. El repositorio completo ocupa 33,2 GB.
- GPU recomendadas: para FP8 se requieren GPUs con soporte de precisión FP8, como H100, H200 o GPUs de la serie Blackwell; en GPUs sin soporte nativo de FP8 la ejecución puede requerir conversión o degradar el rendimiento.
- GPU de consumo: el modelo no cabe en GPUs de consumo de 24 GB (RTX 4090) en FP8 sin cuantización adicional u offloading; se necesitan configuraciones multi-GPU o cuantizaciones más agresivas no documentadas en la información disponible.
- Opciones de despliegue: la model card indica transformers con código personalizado (`custom_code`); no se documentan en la información disponible integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La model card incluye una comparativa con modelos propietarios de gran tamano en las cuatro tareas evaluadas. Los datos disponibles se resumen a continuación:

| Modelo | Parámetros | Contexto | Global (0-100) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xing4.0-29B-Intent | ~29B totales, ~4B activos | no disponible | 58 | Apache 2.0 | Pesos abiertos en HuggingFace |
| Gemini-3.6-Flash | no disponible | no disponible | 49 | Propietaria | API |
| Qwen3.8-Max | no disponible | no disponible | 46 | Propietaria | API |
| GPT-5.6-Sol | no disponible | no disponible | 45 | Propietaria | API |

No se dispone de información sobre parámetros, contexto ni licencia de los modelos comparados más allá de su puntuación global. Tampoco se dispone de comparativas con modelos abiertos de tamano similar en la información proporcionada.

## Limitaciones y advertencias

- El rendimiento debe validarse con los datos y el esquema propios de cada caso de uso; la propia model card lo indica explícitamente.
- La extracción de relaciones (38) y de eventos (40) obtiene puntuaciones notablemente inferiores a las de intención (81) y NER (72), por lo que su uso en producción para esas tareas requiere especial cautela.
- Solo se soportan chino e inglés; no se documentan otros idiomas.
- No se dispone de información sobre la longitud de contexto soportada, lo que limita la planificación de casos con documentos largos o conversaciones extensas.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de robustez en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las condiciones del modelo base y de los datasets utilizados.
- Esta versión FP8 requiere hardware con soporte de precisión FP8 para un rendimiento adecuado; en otro hardware puede ser necesario convertir los pesos o aplicar offloading.
- El uso de `custom_code` en transformers implica revisar y confiar en el código personalizado del repositorio antes de desplegarlo en producción.
- No se documentan integraciones con servidores de inferencia habituales (vLLM, TGI, llama.cpp), lo que puede complicar el despliegue a escala.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/XingChen-AGI/Xing4.0-29B-Intent-FP8
- Modelo base: https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B
- Repositorio GitHub: https://github.com/XingChen-AGI/Xing4.0-29B-Intent
- Dataset companero: https://huggingface.co/datasets/XingChen-AGI/Xing4.0-29B-Intent-oss
- ModelScope: https://www.modelscope.cn/models/XingChen-AGI/Xing4.0-29B-Intent
- Modelers: https://modelers.cn/models/XingChen-AGI/Xing4.0-29B-Intent
- Referencias arXiv citadas en los tags: arxiv:2610.34343, arxiv:2512.24157, arxiv:2507.18013, arxiv:2401.03804 (no se dispone de los títulos en la información proporcionada)
