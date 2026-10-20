# XingChen-AGI/Xing4.0-29B-Intent

## Resumen

Xing4.0-29B-Intent es un modelo de lenguaje especializado en reconocimiento de intenciones y extracción estructurada de información guiada por esquema (schema-guided), desarrollado por XingChen-AGI a partir del modelo semántico Xing4.0-29B-A4B de China Telecom Artificial Intelligence Technology Co., Ltd. Su función es convertir lenguaje natural en resultados estructurados consumibles por sistemas de negocio: a partir de una instrucción de tarea, un esquema con categorías candidatas y definiciones de campos, y un texto o conversación, devuelve un array JSON cuyos elementos contienen `category` y `args`.

El modelo cubre cuatro tipos de tarea con una única representación de salida: reconocimiento de intención con slot filling, reconocimiento de entidades nombradas (NER), extracción de relaciones y extracción de eventos. Esto permite reutilizar el mismo protocolo de entrada/salida en dominios distintos sin reentrenar, simplemente cambiando el esquema. Está pensado para asistentes inteligentes, enrutamiento de peticiones y extracción de información documental.

Arquitectura y tamaño: es un fine-tune del modelo base Xing4.0-29B-A4B, que emplea una arquitectura de mezcla de expertos (MoE) con aproximadamente 29B parámetros totales y unos 4B activos por token; los pesos publicados en safetensors suman 31.215.031.088 parámetros (≈31,2B). El modelo solo declara soporte para chino e inglés, se distribuye con licencia Apache 2.0 y requiere código personalizado (`custom_code`) para cargarse con Transformers.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), fine-tune de Xing4.0-29B-A4B |
| Parámetros totales | 31.215.031.088 (≈31,2B según safetensors); el autor indica ≈29B |
| Parámetros activos | ≈4B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio solo publica safetensors; no se listan GGUF, AWQ, GPTQ ni FP8 oficiales) |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, con `custom_code` (requiere `trust_remote_code`) |
| Tarea de pipeline | text-generation |
| Tareas soportadas | intención + slot filling, NER, extracción de relaciones, extracción de eventos |
| Formato de salida | array JSON de objetos con `category` y `args` |
| Tamaño del repositorio | 62,4 GB |
| Descargas / likes | 46 / 15 (en el momento de la consulta) |
| Fecha de creación / actualización | 2026-10-15 / 2026-10-20 |

## Arquitectura y entrenamiento

El modelo parte de Xing4.0-29B-A4B, un transformer con mezcla de expertos en el que cada token activa aproximadamente 4B de los ≈29B parámetros totales, lo que reduce el coste de inferencia frente a un modelo denso del mismo tamaño. Sobre esa base, Xing4.0-29B-Intent se ha ajustado para una única tarea: dado un esquema (categorías candidatas, descripciones de categoría y definiciones de campos) más un texto o una conversación multi-turno, generar la representación `category + args` correspondiente. La model card no detalla el número de tokens de entrenamiento, la composición del corpus ni si se aplicaron etapas de RLHF o DPO.

La innovación principal es la unificación de cuatro tareas de extracción bajo un mismo protocolo de entrada/salida y la guía por esquema en tiempo de inferencia, lo que evita cabeceras específicas por tarea. Los argumentos extraídos se devuelven como un array, admitiendo múltiples categorías y múltiples instancias de argumentos en una sola respuesta; cuando no hay argumentos que rellenar, `args` es `[]`. Se publica un dataset compañero (XingChen-AGI/Xing4.0-29B-Intent-oss) y un SDK que cubre definición de esquemas, ensamblado de prompts, entrada multi-turno y llamadas síncronas y asíncronas. La información disponible no especifica detalles de decodificación, atención lineal ni otras optimizaciones de inferencia.

## Capacidades

- Reconocimiento de intención y slot filling: identifica la intención del usuario y extrae los parámetros de negocio asociados (por ejemplo, origen, destino y fecha en una petición de búsqueda de vuelos).
- Reconocimiento de entidades nombradas guiado por esquema: el campo `category` corresponde al tipo de entidad y `args` a los campos definidos en el esquema.
- Extracción de relaciones: devuelve el tipo de relación y las entidades participantes junto con los campos relevantes.
- Extracción de eventos: extrae tipo de evento, participantes, hora, lugar y otros campos definidos.
- Salida estructurada consistente: array JSON con `category` y `args`, con soporte de múltiples categorías e instancias de argumentos por respuesta.
- Configuración por esquema en tiempo de inferencia: cambio de dominio sin reentrenamiento, modificando categorías, descripciones y campos.
- Entrada conversacional multi-turno a través del SDK compañero.
- Multilingüe limitado a chino e inglés.
- No se declaran capacidades de visión, audio, tool calling genérico ni modo de razonamiento extendido (thinking) en la información disponible.

## Casos de uso

- Enrutamiento de peticiones en asistentes virtuales: el modelo recibe la frase del usuario y un esquema con las intenciones disponibles del catálogo de servicios, y devuelve la intención con sus parámetros para que el orquestador despache la llamada al backend correcto, sin necesidad de un clasificador por servicio.
- Extracción de parámetros en reservas y transacciones: en dominios de viajes, restaurantes o compras, convierte "busca vuelos de Pekín a Shanghái mañana" en una estructura con intención y slots (origen, destino, fecha) lista para la API de negocio.
- Procesamiento de documentos con NER por esquema: define las entidades de interés (por ejemplo, número de contrato, importe, fecha de firma) y el modelo devuelve las instancias encontradas en el texto, lo que facilita integrarlo en pipelines de digitalización sin reentrenar por cada tipo documental.
- Construcción de grafos de conocimiento: la extracción de relaciones permite poblar triples entidad-relación-entidad a partir de corpus en chino o inglés, con los campos adicionales definidos en el esquema.
- Monitorización de eventos en noticias o informes: la extracción de eventos con participantes, tiempo y lugar se puede usar para alertas y agregación de sucesos en sistemas de vigilancia de medios.
- Normalización de conversaciones de atención al cliente: procesar transcripciones multi-turno con el SDK para etiquetar intenciones y motivos de contacto, alimentando analítica y sistemas de tickets.
- Preprocesado para agentes y RAG: usar la salida estructurada como paso previo determinista que alimenta un agente mayor, reduciendo la ambigüedad de la consulta antes de recuperar información.

## Benchmarks y rendimiento

Resultados publicados en la model card por el autor, en escala 0-100 y redondeados a enteros. No se indica el detalle de los conjuntos de evaluación ni el protocolo de medición.

| Modelo | Overall | Category | Event extraction | NER | Relation extraction | Intent understanding |
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

Lectura de los datos: la ventaja del modelo se concentra en reconocimiento de intención (81) y NER (72), mientras que en categoría (69) queda por debajo de Gemini-3.6-Flash, Qwen3.8-Max y Kimi-K3 (71). Las tareas más débiles en términos absolutos son extracción de eventos (40) y extracción de relaciones (38), donde el margen frente al resto es mayor pero el rendimiento absoluto sigue siendo bajo.

## Requisitos de hardware

- VRAM estimada en bf16: los pesos ocupan aproximadamente 62,4 GB (tamaño del repositorio), por lo que la inferencia en precisión completa requiere alrededor de 65-70 GB contando caché KV; encaja en una A100 80GB o H100 80GB. En GPUs de 48 GB no cabe sin cuantizar.
- VRAM estimada en cuantización INT8/FP8: en torno a 32-35 GB; requeriría A100 40GB (ajustado), L40S 48GB o dos GPUs de 24 GB.
- VRAM estimada en cuantización INT4: en torno a 17-20 GB, lo que permitiría ejecución en una RTX 4090 o RTX 3090 de 24 GB. Estas cifras son estimaciones a partir del número de parámetros: no se han publicado ficheros cuantizados oficiales en la información disponible.
- GPU recomendadas: A100 80GB y H100 80GB para bf16; L40S 48GB o A100 40GB para INT8; RTX 4090/3090 para INT4, con validación previa de calidad en tareas de extracción.
- Despliegue: la carga estándar es con Transformers, requiriendo `trust_remote_code=True` por el `custom_code` del modelo. No se confirma soporte oficial de vLLM, TGI, llama.cpp u Ollama; el uso de llama.cpp u Ollama exigiría una conversión a GGUF no publicada por el autor.
- Latencia y throughput: no disponibles. Al ser un MoE con ≈4B parámetros activos, el coste por token debería aproximarse al de un modelo denso de ese orden, pero condicionado al ancho de banda de memoria para cargar los 62,4 GB de pesos.
- Recomendación práctica: fijar la versión del código remoto y del tokenizador antes de desplegar, dado el uso de `custom_code`.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Overall (según el autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Xing4.0-29B-Intent | ≈29B (31,2B en safetensors) | ≈4B | no disponible | 58 | apache-2.0 | HuggingFace, ModelScope, Modelers |
| Xing4.0-29B-A4B (base) | ≈29B | ≈4B | no disponible | no evaluado en esta tabla | no disponible en la información | HuggingFace, GitHub |
| Gemini-3.6-Flash | no disponible | no disponible | no disponible | 49 | propietaria | API |
| Qwen3.8-Max | no disponible | no disponible | no disponible | 46 | propietaria | API |
| GLM-5.3-Flash | no disponible | no disponible | no disponible | 44 | propietaria | API |

La comparación significativa es frente al modelo base: el ajuste específico eleva el rendimiento en las cuatro tareas de extracción según los datos del autor, aunque no se publican métricas del base en esta misma tabla. Frente a los modelos propietarios listados, la ventaja diferencial es la licencia Apache 2.0 y la posibilidad de despliegue local con esquemas propios; en contrapartida, no se dispone de datos de parámetros ni de contexto de esos competidores en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento absoluto moderado: el overall es 58 sobre 100, con extracción de eventos en 40 y extracción de relaciones en 38; no es adecuado como extractor de alta precisión sin validación en el dominio objetivo.
- Los benchmarks son autodeclarados por el autor, sin detalle de conjuntos, prompts ni protocolo; no se han verificado de forma independiente.
- En la columna de categoría el modelo queda por debajo de tres competidores citados (69 frente a 71), por lo que la elección debe depender de la tarea concreta.
- Riesgo de alucinación estructural: al generar JSON guiado por esquema puede inventar categorías o campos no definidos, o rellenar argumentos sin respaldo en el texto; se recomienda validación posterior contra el esquema y descarte de campos fuera de catálogo.
- Idiomas limitados a chino e inglés; no se declara soporte de castellano ni de otras lenguas, por lo que su uso en español no está cubierto por la evaluación del autor.
- Longitud de contexto no publicada: no se puede dimensionar el truncado seguro en documentos largos ni en conversaciones extensas sin pruebas propias.
- Dependencia de `custom_code`: implica ejecutar código del autor con `trust_remote_code`, con el riesgo de seguridad y de reproducibilidad asociado; conviene fijar commit y revisar el código.
- No hay cuantizaciones oficiales publicadas, lo que limita el despliegue en hardware de consumo sin trabajo adicional de conversión y validación.
- Licencia Apache 2.0 permite uso comercial, pero no se especifican términos adicionales de los pesos del modelo base ni condiciones de atribución más allá de las de la licencia.
- El modelo está especializado en extracción: no debe esperarse de él generación abierta, razonamiento general ni capacidades de agente; la model card lo restringe explícitamente a su tarea.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/XingChen-AGI/Xing4.0-29B-Intent
- Repositorio GitHub del proyecto: https://github.com/XingChen-AGI/Xing4.0-29B-Intent
- Modelo en ModelScope: https://www.modelscope.cn/models/XingChen-AGI/Xing4.0-29B-Intent
- Modelo en Modelers: https://modelers.cn/models/XingChen-AGI/Xing4.0-29B-Intent
- Dataset compañero: https://huggingface.co/datasets/XingChen-AGI/Xing4.0-29B-Intent-oss
- Modelo base en HuggingFace: https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B
- Repositorio GitHub del modelo base: https://github.com/XingChen-AGI/Xing4.0-29B-A4B
- Paper referenciado (arXiv 2512.24157): https://arxiv.org/abs/2512.24157
- Paper referenciado (arXiv 2507.18013): https://arxiv.org/abs/2507.18013
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo.
