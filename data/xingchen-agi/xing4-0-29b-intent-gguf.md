# XingChen-AGI/Xing4.0-29B-Intent-GGUF

## Resumen

Xing4.0-29B-Intent es un modelo de lenguaje especializado en reconocimiento de intenciones y extracción estructurada de información, desarrollado por XingChen-AGI a partir del modelo semántico Xing4.0-29B-A4B de China Telecom Artificial Intelligence Technology Co., Ltd. Su función principal es convertir lenguaje natural en resultados estructurados (JSON) para sistemas de negocio, cubriendo cuatro tareas bajo una representación unificada `category + args`: reconocimiento de intención con slot filling, reconocimiento de entidades nombradas (NER), extracción de relaciones y extracción de eventos.

El modelo emplea una arquitectura de mezcla de expertos (MoE) con aproximadamente 29.000 millones de parámetros totales y unos 4.000 millones activos por token, según la model card del modelo base. La variante publicada en este repositorio es una cuantización GGUF (17,8 GB) generada con imatrix, orientada a inferencia local y despliegue compatible con endpoints. Soporta chino e inglés y se distribuye bajo licencia Apache 2.0.

Su relevancia actual radica en que unifica tareas de extracción tradicionalmente tratadas con pipelines separados (NER, relación, evento, intent) bajo un único protocolo guiado por esquema, lo que simplifica la integración en asistentes inteligentes, enrutamiento de peticiones y extracción documental. Los resultados de evaluación publicados por el autor lo sitúan por delante de varios modelos propietarios de gran escala en la tarea de comprensión de intenciones (81 frente a 64 de Gemini-3.6-Flash), aunque con un rendimiento inferior en la categoría global.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), basada en Xing4.0-29B-A4B |
| Parametros totales | 31.215.031.088 (~31,2B; la model card indica ~29B) |
| Parametros activos | ~4B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (con imatrix); niveles concretos no disponibles |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 17,8 GB); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Xing4.0-29B-A4B, un transformer con arquitectura de mezcla de expertos en el que aproximadamente 4.000 millones de parámetros se activan por token de un total de unos 29.000 millones. La model card remite al repositorio del modelo base para los detalles técnicos de arquitectura, y no proporciona información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La especialización se realiza mediante ajuste sobre el dataset compañero `XingChen-AGI/Xing4.0-29B-Intent-oss`, orientado a tareas guiadas por esquema. La innovación principal es la representación unificada de resultados: todas las tareas (intención, NER, relación, evento) se expresan como un array JSON de objetos con `category` y `args`, donde el esquema de entrada define las categorías candidatas y los campos extraíbles. El modelo realiza reconocimiento y extracción conjuntos, admite múltiples categorías e instancias de argumentos por respuesta, y devuelve `args: []` cuando no hay argumentos que rellenar. El repositorio incluye además un SDK compañero para definición de esquemas, ensamblado de prompts, entrada multi-turno y llamadas síncronas y asíncronas.

## Capacidades

- Reconocimiento de intención y slot filling: identifica la intención del usuario y extrae sus parámetros de negocio en una sola pasada.
- Reconocimiento de entidades nombradas (NER): extrae entidades según los tipos y campos definidos en el esquema.
- Extracción de relaciones: identifica tipos de relación y las entidades participantes.
- Extracción de eventos: extrae tipo de evento, participantes, tiempo, ubicación y demás campos.
- Extracción guiada por esquema: el comportamiento se configura mediante categorías candidatas, descripciones y definiciones de campos, con un protocolo de entrada/salida común entre escenarios.
- Salida estructurada en JSON con soporte de múltiples categorías y múltiples instancias de argumentos.
- Entrada multi-turno (conversación) además de texto plano, según el SDK compañero.
- Capacidades multilingües limitadas a chino e inglés.
- Integración compatible con endpoints (tag `endpoints_compatible`).

## Casos de uso

- Enrutamiento de peticiones en asistentes virtuales: el modelo recibe la consulta del usuario junto con el catálogo de intenciones del negocio y devuelve la intención y sus parámetros en JSON, lo que permite derivar la petición al servicio adecuado sin lógica de clasificación adicional.
- Extracción de parámetros en reservas y búsquedas: consultas como "busca vuelos de Pekín a Shanghái mañana" se resuelven extrayendo origen, destino y fecha como argumentos estructurados listos para una API de reservas.
- Procesamiento de documentos para sistemas de gestión: extracción de entidades, relaciones y eventos de contratos o informes en chino e inglés hacia un esquema predefinido, facilitando la indexación y el análisis posterior.
- Automatización de atención al cliente multi-turno: el soporte de entrada conversacional del SDK permite mantener el contexto de la conversación y extraer intenciones acumuladas a lo largo de varios turnos.
- Construcción de bases de conocimiento: la extracción de relaciones y eventos con `category + args` permite poblar grafos de conocimiento de forma consistente a partir de texto no estructurado.
- Despliegue local en entornos con requisitos de privacidad: la cuantización GGUF de 17,8 GB permite ejecutar el modelo en infraestructura propia sin enviar datos a servicios externos, con licencia Apache 2.0 para uso comercial.
- Prototipado rápido de pipelines de extracción: el protocolo guiado por esquema permite cambiar de dominio modificando solo las definiciones de categorías y campos, sin reentrenar el modelo.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, en escala 0-100 y redondeados a enteros:

| Modelo | Global | Categoría | Extracción de eventos | NER | Extracción de relaciones | Comprensión de intenciones |
|---|---:|---:|---:|---:|---:|---:|
| **Xing4.0-29B-Intent** | **58** | 69 | **40** | **72** | **38** | **81** |
| Gemini-3.6-Flash | 49 | **71** | 30 | 71 | 29 | 64 |
| Qwen3.8-Max | 46 | 71 | 29 | 66 | 26 | 63 |
| Kimi-K3 | 45 | 71 | 28 | 68 | 25 | 61 |
| GPT-5.6-Sol | 45 | 70 | 28 | 68 | 23 | 60 |
| GLM-5.2 | 44 | 70 | 29 | 65 | 25 | 58 |
| GLM-5.3-Flash | 44 | 69 | 27 | 65 | 26 | 58 |
| DeepSeek-V4.1-Flash | 42 | 67 | 26 | 61 | 23 | 56 |
| DeepSeek-V4-Pro | 41 | 67 | 23 | 60 | 24 | 56 |
| LongCat-2.0 | 41 | 68 | 24 | 62 | 23 | 53 |
| GPT-6-Luna | 39 | 64 | 24 | 59 | 20 | 51 |

La negrita marca la mejor puntuación original de cada columna antes del redondeo. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio GGUF ocupa 17,8 GB, por lo que se requiere al menos esa cantidad de memoria, más overhead de contexto; con cuantizaciones más agresivas el requisito sería menor, pero los niveles concretos no están disponibles.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, una GPU de 24 GB (RTX 4090, L4) podría alojar la cuantización publicada de forma ajustada; GPU de 40-80 GB (A100, H100) ofrecerían margen para contexto largo y mayor throughput.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) con la cuantización de 17,8 GB, sujeto a la ventana de contexto utilizada; no confirmado por el autor.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; vLLM y TGI requerirían los pesos en safetensors del modelo base. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Global (eval. autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xing4.0-29B-Intent | ~29B totales, ~4B activos (MoE) | no disponible | 58 | Apache 2.0 | GGUF en HF, ModelScope, Modelers |
| Gemini-3.6-Flash | no disponible | no disponible | 49 | propietaria | API |
| Qwen3.8-Max | no disponible | no disponible | 46 | propietaria | API |
| DeepSeek-V4.1-Flash | no disponible | no disponible | 42 | propietaria | API |

La comparativa se limita a los datos de evaluación del autor; no se dispone de parámetros, contexto ni licencia de los modelos alternativos en la información proporcionada. La ventaja diferencial de Xing4.0-29B-Intent es su especialización en extracción guiada por esquema con pesos abiertos y licencia permisiva, frente a alternativas propietarias accesibles solo por API.

## Limitaciones y advertencias

- Los benchmarks proceden exclusivamente de la evaluación del propio autor; no hay validación independiente disponible.
- El rendimiento global (58) queda por debajo de varios modelos comparados en la columna de categoría (69 frente a 71 de Gemini-3.6-Flash y Qwen3.8-Max), lo que sugiere margen de mejora en la clasificación de categorías.
- Solo soporta chino e inglés; no hay soporte declarado para otras lenguas.
- La longitud de contexto no está documentada, lo que dificulta planificar el despliegue con documentos largos.
- Riesgo de alucinación inherente a los modelos generativos: la salida JSON puede contener argumentos no presentes en el texto, por lo que se recomienda validación contra el esquema en producción.
- El rendimiento depende críticamente de la calidad del esquema y de las descripciones de campos proporcionadas; el autor recomienda validar con datos y esquemas propios.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset compañero deben revisarse por si imponen condiciones adicionales.
- La cuantización GGUF puede degradar ligeramente la precisión frente a los pesos originales en safetensors; no se han publicado comparativas de precisión entre formatos.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/XingChen-AGI/Xing4.0-29B-Intent-GGUF
- Repositorio Hugging Face (modelo original): https://huggingface.co/XingChen-AGI/Xing4.0-29B-Intent
- Modelo base: https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B
- Dataset compañero: https://huggingface.co/datasets/XingChen-AGI/Xing4.0-29B-Intent-oss
- GitHub del proyecto: https://github.com/XingChen-AGI/Xing4.0-29B-Intent
- GitHub del modelo base: https://github.com/XingChen-AGI/Xing4.0-29B-A4B
- ModelScope: https://www.modelscope.cn/models/XingChen-AGI/Xing4.0-29B-Intent
- Modelers: https://modelers.cn/models/XingChen-AGI/Xing4.0-29B-Intent
- Papers referenciados (arXiv): 2610.34343, 2512.24157, 2507.18013, 2401.03804
