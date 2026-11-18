# XingChen-AGI/Xing4.0-29B-Intent

## Resumen

Xing4.0-29B-Intent es un modelo de lenguaje especializado en reconocimiento de intenciones y extracción estructurada de información, desarrollado por XingChen-AGI (China Telecom Artificial Intelligence Technology Co., Ltd.) a partir del modelo base Xing4.0-29B-A4B. Su funcionamiento se guía por esquemas (schema-guided): el usuario proporciona las categorías candidatas y las definiciones de campos, y el modelo devuelve un array JSON donde cada elemento contiene `category` y `args`. Unifica en una sola representación cuatro tareas clásicas de NLP: reconocimiento de intención con slot filling, reconocimiento de entidades nombradas (NER), extracción de relaciones y extracción de eventos.

El modelo emplea una arquitectura de mezcla de expertos (MoE) con aproximadamente 29B parámetros totales y unos 4B activos por token, lo que reduce el coste de inferencia frente a un modelo denso del mismo tamaño. Está afinado sobre el modelo base Xing4.0-29B-A4B y su pipeline es text-generation con soporte de código personalizado (`custom_code`) en transformers. Soporta chino e inglés, y su licencia Apache 2.0 facilita el uso comercial.

Su relevancia actual radica en que ofrece una alternativa abierta y desplegable en infraestructura propia para tareas de parsing semántico orientado a sistemas de negocio (asistentes, enrutamiento de peticiones, extracción documental), con resultados que, según la model card, superan a varios modelos propietarios de gran escala en su conjunto de evaluación. El repositorio ocupa 62,4 GB y acumula más de 6.000 descargas y 327 likes en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) transformer; modelo base Xing4.0-29B-A4B |
| Parametros totales | 31.215.031.088 (~31,2B; la model card indica ~29B) |
| Parametros activos | ~4B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, con custom_code) |

## Arquitectura y entrenamiento

El modelo se construye sobre Xing4.0-29B-A4B, un modelo de lenguaje semántico con arquitectura de mezcla de expertos en la que aproximadamente 4B de los ~29B parámetros se activan por token. Esta configuración permite mantener una capacidad de representación propia de un modelo grande con un coste computacional por token comparable a un modelo denso de menor tamaño. El modelo base incorpora pesos en safetensors y requiere `custom_code` en transformers para su carga, lo que implica que la definición de la arquitectura no es la estándar de la librería y debe confiarse en el código del repositorio.

El ajuste fino se orienta a tareas de extracción estructurada guiada por esquema: el modelo recibe instrucciones de tarea, el esquema (categorías candidatas y definiciones de campos) y el texto o conversación, y produce un array JSON con objetos `category`/`args`. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. El dataset asociado es XingChen-AGI/Xing4.0-29B-Intent-oss. La model card remite a los papers citados (arXiv 2610.34343, 2512.24157, 2507.18013, 2401.03804) para los detalles técnicos, pero su contenido no está incluido en la información proporcionada.

## Capacidades

- Reconocimiento de intención y slot filling: identifica la intención del usuario y extrae los parámetros de negocio asociados en una sola pasada.
- Reconocimiento de entidades nombradas (NER): extrae entidades según los tipos definidos en el esquema.
- Extracción de relaciones: identifica relaciones entre entidades y devuelve las entidades participantes y campos relevantes.
- Extracción de eventos: extrae participantes, hora, lugar y demás campos del evento según el esquema.
- Salida estructurada uniforme: array JSON con objetos `category` y `args`, con soporte de múltiples categorías y múltiples instancias de argumentos por objeto; `args` vacío (`[]`) cuando no hay argumentos que rellenar.
- Configuración guiada por esquema: misma interfaz de entrada/salida entre escenarios de negocio mediante categorías candidatas, descripciones y definiciones de campos.
- Multilingüe limitado a chino e inglés, con evaluación en corpus de ambos idiomas.
- SDK complementario: definiciones de esquema, ensamblado de prompts, entrada de conversación multi-turno, llamadas síncronas y asíncronas y acceso cómodo a resultados estructurados.
- Soporte de entrada conversacional multi-turno (según el SDK descrito).

## Casos de uso

- Asistentes virtuales y chatbots de negocio: el modelo convierte cada turno del usuario en una intención y sus parámetros (por ejemplo, origen, destino y fecha en una búsqueda de vuelos), lo que permite al backend ejecutar la acción correspondiente sin lógica de parsing ad hoc.
- Enrutamiento de peticiones (request routing): en un sistema de atención al cliente, clasifica la consulta entrante en una categoría del esquema y extrae los datos necesarios para dirigirla al equipo o flujo adecuado.
- Extracción de información documental: dada una definición de campos, extrae entidades y relaciones de contratos, facturas o informes en chino o inglés y devuelve JSON listo para persistir.
- Construcción de bases de conocimiento: la extracción de relaciones y eventos permite poblar grafos de conocimiento con entidades, relaciones y eventos estructurados a partir de texto no estructurado.
- Procesamiento de conversaciones multi-turno: con el SDK de conversación, se puede mantener el contexto de un diálogo y resolver intenciones que dependen de turnos anteriores.
- Monitorización de eventos en noticias o redes: la extracción de eventos con participantes, hora y lugar facilita la generación de alertas y resúmenes estructurados.
- Integración en pipelines de datos: la salida JSON uniforme permite encadenar el modelo con validadores de esquema (por ejemplo, JSON Schema) y sistemas downstream sin transformaciones adicionales.
- Despliegue on-premise con requisitos de soberanía de datos: al ser Apache 2.0 y con pesos abiertos, puede ejecutarse en infraestructura propia para datos sensibles.

## Benchmarks y rendimiento

Resultados de la model card en una escala 0–100 (redondeados a enteros), sobre cuatro tipos de tarea:

| Modelo | Overall | Category | Event Extraction | Named Entity Recognition | Relation Extraction | Intent Understanding |
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

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K; la evaluación se limita a las cuatro tareas de extracción descritas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo MoE de ~31B parámetros en safetensors ocupa aproximadamente 62 GB en fp16/bf16; en cuantizaciones de 8 bits rondaría los 31 GB y en 4 bits unos 16 GB, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: no especificadas por el autor. Para fp16 serían necesarias GPUs con al menos 80 GB (A100 80GB, H100) o varias GPUs en paralelo; las cuantizaciones de menor precisión podrían caber en una RTX 4090 (24 GB) si se generan pesos GGUF, algo no confirmado en la información disponible.
- Cabe en GPU de consumo: no confirmado; dependería de cuantizaciones no publicadas.
- Opciones de despliegue: transformers con `custom_code` (requisito del repositorio); el SDK del proyecto ofrece llamadas síncronas y asíncronas. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles; la activación de ~4B parámetros por token sugiere un coste de cómputo inferior al de un modelo denso de ~29B, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Overall (evaluación del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xing4.0-29B-Intent | ~29B totales, ~4B activos (MoE) | no disponible | 58 | Apache 2.0 | Pesos abiertos en HF, ModelScope, Modelers |
| Gemini-3.6-Flash | no disponible | no disponible | 49 | Propietaria | API |
| Qwen3.8-Max | no disponible | no disponible | 46 | Propietaria | API |
| Kimi-K3 | no disponible | no disponible | 45 | Propietaria | API |
| GPT-5.6-Sol | no disponible | no disponible | 45 | Propietaria | API |

La comparativa se limita a los datos de la model card; no se dispone de información sobre parámetros, contexto ni licencia de los modelos propietarios comparados. En la tarea de categoría, varios modelos propietarios superan ligeramente a Xing4.0-29B-Intent (71 frente a 69), mientras que este lidera en extracción de eventos, NER, extracción de relaciones y comprensión de intención.

## Limitaciones y advertencias

- Idiomas limitados a chino e inglés; el rendimiento en otros idiomas no está evaluado.
- La longitud de contexto no está publicada; no se debe asumir una ventana amplia para documentos largos sin validación previa.
- Resultados de evaluación moderados en términos absolutos (58/100 global, 38 en extracción de relaciones), lo que indica margen de error relevante en producción.
- El modelo está especializado en extracción estructurada; no debe emplearse como modelo generalista de generación, razonamiento o código sin validación.
- Riesgo de alucinación en los campos extraídos: la salida JSON puede contener valores no presentes en el texto; se recomienda validación contra esquema y verificación de spans.
- La model card advierte explícitamente de que el rendimiento en casos concretos debe validarse con los datos y el esquema objetivo.
- Requiere `custom_code` en transformers: implica `trust_remote_code=True` y revisión del código del repositorio antes de ejecutarlo.
- Licencia Apache 2.0 permite uso comercial, pero se desconoce si el modelo base impone condiciones adicionales; conviene revisar la licencia de Xing4.0-29B-A4B.
- No se han publicado datos sobre sesgos; al entrenarse con corpus en chino e inglés, pueden aparecer sesgos culturales y lingüísticos propios de esos datos.
- No se publican cuantizaciones oficiales, lo que puede dificultar el despliegue en hardware de consumo.

## Enlaces

- Hugging Face: https://huggingface.co/XingChen-AGI/Xing4.0-29B-Intent
- GitHub: https://github.com/XingChen-AGI/Xing4.0-29B-Intent
- Modelo base: https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B
- GitHub del modelo base: https://github.com/XingChen-AGI/Xing4.0-29B-A4B
- Dataset: https://huggingface.co/datasets/XingChen-AGI/Xing4.0-29B-Intent-oss
- ModelScope: https://www.modelscope.cn/models/XingChen-AGI/Xing4.0-29B-Intent
- Modelers: https://modelers.cn/models/XingChen-AGI/Xing4.0-29B-Intent
- Paper arXiv 2610.34343: https://arxiv.org/abs/2610.34343
- Paper arXiv 2512.24157: https://arxiv.org/abs/2512.24157
- Paper arXiv 2507.18013: https://arxiv.org/abs/2507.18013
- Paper arXiv 2401.03804: https://arxiv.org/abs/2401.03804
