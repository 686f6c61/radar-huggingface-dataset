# XingChen-AGI/Xing4.0-29B-Intent-FP8

## Resumen

Xing4.0-29B-Intent es un modelo de lenguaje especializado en reconocimiento de intenciones y extracción estructurada de información, desarrollado por XingChen-AGI a partir del modelo semántico Xing4.0-29B-A4B de China Telecom Artificial Intelligence Technology Co., Ltd. Su función principal es convertir lenguaje natural en resultados estructurados (JSON) que los sistemas empresariales puedan consumir directamente, cubriendo cuatro tareas bajo una misma representación: reconocimiento de intención con slot filling, reconocimiento de entidades nombradas, extracción de relaciones y extracción de eventos.

El modelo se distribuye en formato FP8 y mantiene la arquitectura de mezcla de expertos (MoE) del modelo base, con aproximadamente 29B de parámetros totales y unos 4B activos por token. Está diseñado para ser guiado por esquema (schema-guided): el usuario proporciona las categorías candidatas y las definiciones de campos, y el modelo devuelve un array JSON con objetos `category` y `args`.

Es relevante ahora porque ofrece un protocolo de entrada/salida unificado para múltiples tareas de extracción, lo que simplifica la integración en asistentes inteligentes, enrutamiento de peticiones y pipelines de procesamiento documental, con soporte declarado para chino e inglés y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), transformer; modelo base Xing4.0-29B-A4B |
| Parametros totales | 31.215.031.088 (aproximadamente 29B según model card) |
| Parametros activos | Aproximadamente 4B por token (A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (esta variante); no se detallan otros formatos |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, custom_code) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de mezcla de expertos del base Xing4.0-29B-A4B, con aproximadamente 29B de parámetros totales y unos 4B activos por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamaño. Esta variante se distribuye cuantizada en FP8, lo que reduce el tamaño del repositorio a 33,2 GB.

La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo se ha ajustado para tareas de extracción estructurada guiada por esquema, con un formato de salida común basado en `category + args` para las cuatro tareas soportadas. El dataset asociado es XingChen-AGI/Xing4.0-29B-Intent-oss. No se especifican innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Reconocimiento de intención y slot filling: identifica la intención del usuario y extrae los parámetros de negocio asociados.
- Reconocimiento de entidades nombradas (NER): extrae entidades según los tipos definidos en el esquema.
- Extracción de relaciones: identifica relaciones entre entidades y devuelve las entidades participantes y campos relevantes.
- Extracción de eventos: extrae tipo de evento, participantes, tiempo, ubicación y otros campos definidos.
- Salida estructurada en JSON: array de objetos con `category` y `args`; cuando no hay argumentos, `args` es `[]`.
- Configuración guiada por esquema: categorías candidatas, descripciones de categoría y definiciones de campos como entrada.
- Soporte multilingüe limitado a chino e inglés.
- SDK complementario con definiciones de esquema, ensamblado de prompts, entrada de conversación multi-turno y llamadas síncronas y asíncronas.
- No se documentan capacidades de tool calling, agentes autónomos, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Enrutamiento de peticiones en asistentes inteligentes: el modelo recibe la consulta del usuario y un esquema de intenciones candidatas, y devuelve la intención y sus parámetros para dirigir la petición al servicio adecuado.
- Extracción de datos de documentos: dado un texto y un esquema de campos, extrae entidades y relaciones para poblar bases de datos o sistemas de gestión documental.
- Procesamiento de lenguaje natural en atención al cliente: clasifica la intención de conversaciones multi-turno y extrae parámetros como producto, fecha o número de pedido.
- Construcción de grafos de conocimiento: la extracción de relaciones y eventos permite generar tripletas y estructuras de evento a partir de corpus textuales en chino e inglés.
- Monitorización de eventos en medios: extracción de tipo de evento, participantes, tiempo y ubicación para alertas y análisis de actualidad.
- Integración en pipelines de datos con SDK: el SDK permite definir esquemas, ensamblar prompts y consumir resultados estructurados de forma síncrona o asíncrona en servicios backend.
- Análisis de conversaciones para analítica de producto: clasificación de intenciones y extracción de argumentos para medir demanda y detectar patrones de uso.

## Benchmarks y rendimiento

Resultados publicados en la model card (escala 0-100, redondeados):

| Modelo | Overall | Category | Event Extraction | Named Entity Recognition | Relation Extraction | Intent Understanding |
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

## Requisitos de hardware

- VRAM estimada para inferencia en FP8: el repositorio ocupa 33,2 GB, por lo que se necesita al menos ese espacio en memoria de GPU para cargar los pesos completos; con overhead de activaciones y caché KV, se recomienda 40-48 GB o más.
- GPU recomendadas: A100 80 GB, H100 80 GB, o GPUs con 48 GB o más para FP8.
- En GPU de consumo: no cabe en tarjetas de 24 GB (RTX 4090) en FP8 sin técnicas de offload o cuantización adicional; se requerirían formatos más agresivos no documentados en la model card.
- Opciones de despliegue: transformers con `custom_code` (soporte nativo declarado); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Overall (bench) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xing4.0-29B-Intent | ~29B totales, ~4B activos (MoE) | no disponible | 58 | Apache 2.0 | Hugging Face, ModelScope, Modelers |
| Gemini-3.6-Flash | no disponible | no disponible | 49 | no disponible | no disponible |
| Qwen3.8-Max | no disponible | no disponible | 46 | no disponible | no disponible |
| GPT-5.6-Sol | no disponible | no disponible | 45 | no disponible | no disponible |

Los modelos comparados son propietarios y no se dispone de sus especificaciones técnicas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card.
- Riesgo de alucinación: presente como en cualquier modelo generativo; la salida estructurada puede contener categorías o argumentos no presentes en el texto de entrada.
- Limitaciones de contexto e idioma: solo se declaran chino e inglés; la longitud de contexto no está especificada.
- Rendimiento limitado en extracción de relaciones y eventos (38 y 40 sobre 100), muy por debajo del reconocimiento de intenciones (81).
- El modelo está especializado en extracción estructurada; no se documentan capacidades generales de razonamiento, código o matemáticas.
- La model card advierte de que el rendimiento debe validarse con los datos y el esquema del caso de uso concreto.
- Licencia Apache 2.0: permite uso comercial, pero no se detallan restricciones adicionales sobre el modelo base.
- El formato FP8 puede requerir hardware compatible y no se documentan alternativas de cuantización.

## Enlaces

- Hugging Face: https://huggingface.co/XingChen-AGI/Xing4.0-29B-Intent-FP8
- Modelo base: https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B
- GitHub: https://github.com/XingChen-AGI/Xing4.0-29B-Intent
- GitHub del modelo base: https://github.com/XingChen-AGI/Xing4.0-29B-A4B
- ModelScope: https://www.modelscope.cn/models/XingChen-AGI/Xing4.0-29B-Intent
- Modelers: https://modelers.cn/models/XingChen-AGI/Xing4.0-29B-Intent
- Dataset: https://huggingface.co/datasets/XingChen-AGI/Xing4.0-29B-Intent-oss
- Papers referenciados: arxiv:2611.22115, arxiv:2610.34343, arxiv:2512.24157, arxiv:2507.18013, arxiv:2401.03804
