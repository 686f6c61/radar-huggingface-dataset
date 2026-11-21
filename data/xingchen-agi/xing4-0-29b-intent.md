# XingChen-AGI/Xing4.0-29B-Intent

## Resumen

Xing4.0-29B-Intent es un modelo de lenguaje especializado en reconocimiento de intenciones y extracción estructurada de información, desarrollado por XingChen-AGI (China Telecom Artificial Intelligence Technology Co., Ltd.). Parte del modelo base Xing4.0-29B-A4B, un transformer con arquitectura de mezcla de expertos (MoE) de aproximadamente 29B parámetros totales y unos 4B activos por token, y se ha afinado específicamente para convertir lenguaje natural en resultados estructurados en formato JSON que los sistemas de negocio pueden consumir directamente.

El modelo resuelve un problema concreto: unificar bajo una misma representación (`category` + `args`) cuatro tareas clásicas de procesamiento del lenguaje natural —reconocimiento de intenciones con relleno de slots, reconocimiento de entidades nombradas, extracción de relaciones y extracción de eventos— guiadas por un esquema (schema-guided). Esto permite definir mediante un esquema las categorías candidatas y los campos extraíbles, y obtener respuestas consistentes en todos los escenarios de negocio sin cambiar el protocolo de entrada/salida.

Es relevante ahora porque ofrece un rendimiento competitivo frente a modelos propietarios de gran escala en tareas de extracción estructurada (según la evaluación del autor, 58 de puntuación global frente a 49 de Gemini-3.6-Flash o 46 de Qwen3.8-Max), con licencia Apache 2.0 y pesos abiertos en formato safetensors, lo que facilita su despliegue en asistentes inteligentes, enrutamiento de peticiones y extracción documental. El modelo soporta chino e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), modelo base Xing4.0-29B-A4B |
| Parametros totales | 31.215.031.088 (aprox. 29B según model card) |
| Parametros activos | Aproximadamente 4B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, con custom_code) |

## Arquitectura y entrenamiento

El modelo se construye sobre Xing4.0-29B-A4B, un transformer con arquitectura de mezcla de expertos (MoE) en el que cada token activa aproximadamente 4B de los 29B parámetros totales. La model card no detalla la configuración interna de la MoE (número de expertos, política de enrutamiento) ni la longitud de contexto nativa; remite para ello a la documentación del modelo base en el repositorio de GitHub.

El ajuste específico se orienta a tareas de extracción estructurada guiada por esquema. El modelo recibe instrucciones de tarea, un esquema (categorías candidatas, descripciones y definiciones de campos) y el texto o conversación, y devuelve un array JSON cuyos elementos contienen `category` y `args`. La representación unificada cubre reconocimiento de intenciones y relleno de slots, NER, extracción de relaciones y extracción de eventos. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset (más allá del dataset companion Xing4.0-29B-Intent-oss), ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Reconocimiento de intenciones y relleno de slots (slot filling) en conversaciones, devolviendo la intención y sus parámetros de negocio.
- Reconocimiento de entidades nombradas (NER) guiado por esquema, con tipos de entidad definidos por el usuario.
- Extracción de relaciones entre entidades, con los participantes y campos relevantes.
- Extracción de eventos, incluyendo participantes, tiempo, ubicación y otros campos del evento.
- Salida estructurada en JSON con arrays que soportan múltiples categorías y múltiples instancias de argumentos; `args` vacío cuando no hay argumentos que rellenar.
- Configuración de tareas mediante esquema: categorías candidatas, descripciones de categoría y definiciones de campos, con el mismo protocolo de entrada/salida entre escenarios.
- Capacidad multilingüe limitada a chino e inglés.
- SDK companion que ofrece definiciones de esquema, ensamblado de prompts, entrada de conversación multi-turno y llamadas síncronas y asíncronas.
- No se documentan en la información disponible capacidades de visión, audio, tool calling nativo ni modo de razonamiento (thinking mode).

## Casos de uso

- Enrutamiento de peticiones en asistentes inteligentes: el modelo identifica la intención del usuario (por ejemplo, búsqueda de vuelos) y extrae los parámetros (origen, destino, fecha) en un único paso, lo que permite derivar la petición al servicio adecuado sin lógica ad hoc por dominio.
- Atención al cliente automatizada: con el SDK se gestionan conversaciones multi-turno y se extraen de cada turno la intención y los slots rellenados, manteniendo un formato JSON estable que los sistemas de ticketing o CRM pueden consumir.
- Extracción de información de documentos: a partir de un esquema que defina tipos de entidad y campos, el modelo extrae entidades y relaciones de contratos, facturas o informes en chino e inglés para poblar bases de datos estructuradas.
- Construcción de grafos de conocimiento: la extracción de relaciones y eventos con `category` + `args` permite generar tripletas y registros de eventos listos para ingestión en un grafo, reduciendo el postprocesado respecto a salidas en texto libre.
- Monitorización de eventos en flujos de noticias o redes: la extracción de eventos con participantes, tiempo y ubicación facilita la detección y el seguimiento de sucesos a partir de texto no estructurado.
- Análisis de conversaciones y voz del cliente: clasificación de intenciones y extracción de entidades en transcripciones para medir motivos de contacto, productos mencionados y resultados, con salida directamente agregable.
- Automatización de formularios y back office: conversión de texto libre (correos, mensajes) en campos estructurados según el esquema del formulario de destino, reduciendo la introducción manual de datos.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, en escala 0–100 y redondeados a enteros. La columna "Category" corresponde a la tarea de categorización; el resto de columnas a las tareas indicadas.

| Modelo | Global | Category | Event extraction | NER | Relation extraction | Intent understanding |
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

No se detallan en la información disponible los conjuntos de evaluación concretos, el protocolo de puntuación ni los tamaños de muestra empleados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Como referencia de orden de magnitud, los pesos en safetensors ocupan 62,4 GB en el repositorio (aproximadamente 2 bytes por parámetro), lo que exige al menos ese espacio en memoria para cargar el modelo en precisión de 16 bits; la cuantización reduciría el requisito, pero no se documentan tipos de cuantización soportados.
- GPU recomendadas: no disponible. Por el tamaño de los pesos, se requiere una GPU con memoria suficiente para cargar el modelo completo o varias GPU en paralelo; no se especifican modelos concretos (A100, H100, RTX 4090) en la documentación disponible.
- ¿Cabe en GPU de consumo? No disponible. Con 62,4 GB de pesos en 16 bits no cabría en una GPU de consumo de 24 GB sin cuantización, pero no se confirma en la información proporcionada.
- Opciones de despliegue: librería transformers (con `custom_code`, lo que implica confiar en código remoto del repositorio). No se documentan en la información disponible integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Global (bench. autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xing4.0-29B-Intent | ~29B totales, ~4B activos (MoE) | no disponible | 58 | Apache 2.0 | Pesos abiertos en Hugging Face, ModelScope, Modelers |
| Gemini-3.6-Flash | no disponible | no disponible | 49 | Propietaria | API |
| Qwen3.8-Max | no disponible | no disponible | 46 | Propietaria | API |
| GPT-5.6-Sol | no disponible | no disponible | 45 | Propietaria | API |

La comparativa se limita a los datos de la evaluación del autor; no se dispone de parámetros, contexto ni licencia de los modelos propietarios incluidos. Frente a alternativas abiertas de tamaño comparable no se aportan datos en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada. Al entrenarse principalmente con corpus en chino e inglés, el rendimiento en otros idiomas no está garantizado.
- Riesgo de alucinación: la model card advierte que el rendimiento en casos de uso específicos debe validarse con los datos y el esquema objetivo; la extracción estructurada puede producir categorías o argumentos incorrectos aunque el formato JSON sea válido.
- Limitaciones de contexto e idioma: solo se declaran chino e inglés; la longitud de contexto no está disponible, lo que impide garantizar el procesamiento de documentos o conversaciones largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo usa `custom_code` en transformers, por lo que es necesario revisar y confiar en el código remoto del repositorio antes de desplegarlo en producción.
- Dependencia del esquema: la calidad de la extracción depende de la definición de categorías y campos; esquemas ambiguos o incompletos degradarán los resultados.
- Caveat de evaluación: los benchmarks proceden del propio autor y no se detallan los conjuntos ni el protocolo, por lo que deben interpretarse con cautela.
- Disponibilidad de cuantizaciones y de integración con motores de inferencia de alto rendimiento no documentada.

## Enlaces

- Hugging Face: https://huggingface.co/XingChen-AGI/Xing4.0-29B-Intent
- Modelo base: https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B
- Repositorio GitHub: https://github.com/XingChen-AGI/Xing4.0-29B-Intent
- Repositorio GitHub del modelo base: https://github.com/XingChen-AGI/Xing4.0-29B-A4B
- Dataset companion: https://huggingface.co/datasets/XingChen-AGI/Xing4.0-29B-Intent-oss
- ModelScope: https://www.modelscope.cn/models/XingChen-AGI/Xing4.0-29B-Intent
- Modelers: https://modelers.cn/models/XingChen-AGI/Xing4.0-29B-Intent
- Papers referenciados en los tags (identificadores arXiv): 2611.22115, 2610.34343, 2512.24157, 2507.18013, 2401.03804
