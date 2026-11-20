# XingChen-AGI/Xing4.0-29B-Intent-GGUF

## Resumen

Xing4.0-29B-Intent es un modelo de lenguaje especializado en reconocimiento de intenciones y extracción estructurada de información, desarrollado por XingChen-AGI (China Telecom Artificial Intelligence Technology Co., Ltd.) a partir del modelo base Xing4.0-29B-A4B. Su función principal es convertir lenguaje natural en resultados estructurados en formato JSON para sistemas de negocio, soportando de forma unificada cuatro tareas: reconocimiento de intenciones con relleno de slots, reconocimiento de entidades nombradas (NER), extracción de relaciones y extracción de eventos.

El modelo emplea una arquitectura de mezcla de expertos (MoE) con aproximadamente 29.000 millones de parámetros totales y unos 4.000 millones activos por token, lo que permite un equilibrio entre capacidad y eficiencia computacional. La versión publicada en este repositorio es una cuantización GGUF con pesos de tipo imatrix, orientada a despliegue en entornos con recursos limitados.

La relevancia actual del modelo radica en su enfoque *schema-guided*: el usuario define las categorías candidatas y los campos extraíbles mediante un esquema, y el modelo devuelve arrays JSON con objetos `category` y `args`. Esto lo hace directamente integrable en asistentes inteligentes, enrutamiento de peticiones y pipelines de extracción documental, con soporte para chino e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), transformer (detalles no disponibles) |
| Parametros totales | 31.215.031.088 (~29B según model card) |
| Parametros activos | ~4B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con imatrix (variantes concretas no disponibles) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Modelo base | XingChen-AGI/Xing4.0-29B-A4B |
| Tamaño del repositorio | 17,8 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo se construye sobre Xing4.0-29B-A4B, un modelo de lenguaje semántico de China Telecom con arquitectura de mezcla de expertos (MoE). La cifra de parámetros totales confirmada en safetensors es de 31.215.031.088, con aproximadamente 4.000 millones de parámetros activos por token, lo que reduce el coste de inferencia respecto a un modelo denso del mismo tamaño. La model card no detalla la composición del dataset de entrenamiento del modelo base ni si se aplicaron etapas de RLHF o DPO.

El ajuste específico para tareas de intención y extracción se realizó sobre el dataset compañero XingChen-AGI/Xing4.0-29B-Intent-oss. La innovación técnica destacable es la representación unificada de las cuatro tareas mediante el par `category + args`: el esquema de entrada define categorías candidatas, descripciones y campos, y la salida es siempre un array JSON con objetos que contienen `category` y `args`. Los arrays de `args` admiten múltiples instancias de argumentos, y cuando no se puede rellenar ningún argumento se devuelve `[]`. El repositorio incluye además un SDK que gestiona definiciones de esquema, ensamblado de prompts, entrada multi-turno y llamadas síncronas y asíncronas.

## Capacidades

- Reconocimiento de intenciones y relleno de slots: identifica la intención del usuario y extrae los parámetros de negocio asociados.
- Reconocimiento de entidades nombradas (NER): extrae entidades tipadas según los campos definidos en el esquema.
- Extracción de relaciones: identifica tipos de relación y las entidades participantes.
- Extracción de eventos: extrae tipo de evento, participantes, tiempo, ubicación y otros campos.
- Configuración guiada por esquema: el usuario define categorías candidatas, descripciones y campos extraíbles con un protocolo de entrada/salida común entre escenarios.
- Reconocimiento y extracción conjuntos: salida en arrays JSON que soportan múltiples categorías y múltiples instancias de argumentos.
- Soporte multilingüe limitado a chino e inglés, con corpus de evaluación en ambos idiomas.
- Entrada conversacional multi-turno mediante el SDK compañero.
- Compatibilidad con endpoints (tag `endpoints_compatible`).

## Casos de uso

- Asistentes virtuales y atención al cliente: el modelo recibe el turno del usuario junto con un esquema de intenciones (por ejemplo, consulta de vuelos, gestión de pedidos) y devuelve la intención detectada con sus parámetros en JSON, listo para invocar el backend correspondiente.
- Enrutamiento de peticiones: en un sistema de tickets o correo entrante, se define un esquema con las categorías de destino y el modelo clasifica y extrae los campos relevantes para dirigir cada petición al equipo adecuado.
- Extracción de información documental: a partir de contratos, facturas o informes, se define un esquema de entidades y relaciones y el modelo devuelve los datos estructurados para su carga en bases de datos o ERP.
- Construcción de bases de conocimiento: extracción de relaciones y eventos de textos en chino e inglés para poblar grafos de conocimiento con entidades y vínculos tipados.
- Procesamiento de lenguaje natural en pipelines de datos: integración como etapa de extracción estructurada dentro de un ETL, sustituyendo reglas frágiles por un modelo guiado por esquema con salida JSON consistente.
- Análisis de conversaciones: procesamiento de transcripciones multi-turno (soportado por el SDK) para identificar intenciones y argumentos a lo largo de un diálogo, útil en analítica de soporte o control de calidad.
- Monitorización de eventos: detección y estructuración de eventos (participantes, tiempo, lugar) en flujos de noticias o redes sociales en chino e inglés.

## Benchmarks y rendimiento

Resultados publicados en la model card, en escala 0-100 y redondeados a enteros. La columna "Category" corresponde a la clasificación por categoría; el resto de columnas a las tareas indicadas.

| Modelo | Overall | Category | Event Extraction | NER | Relation Extraction | Intent Understanding |
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

Según la model card, la negrita marca la mejor puntuación original por columna, determinada antes del redondeo. No se detallan los conjuntos de evaluación ni la metodología exacta más allá de indicar que cubren corpus en chino e inglés.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio GGUF ocupa 17,8 GB; la VRAM necesaria depende de la variante de cuantización descargada (no se detallan los tamaños por variante). Como referencia, una cuantización de ~4 bits de un modelo de 29B ronda los 16-18 GB de pesos, más overhead de contexto y caché KV.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño de pesos, una GPU de 24 GB (RTX 4090, A10G) podría alojar cuantizaciones de 4 bits; para cuantizaciones mayores o contexto amplio se requerirían A100/H100 o múltiples GPU.
- Cabe en GPU de consumo: previsiblemente en RTX 4090 (24 GB) con cuantizaciones de 4 bits, sujeto a la variante concreta y a la longitud de contexto; no confirmado por el autor.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo Hugging Face. El SDK compañero ofrece llamadas síncronas y asíncronas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparación con alternativas del mismo ámbito de extracción estructurada, según los resultados publicados en la model card.

| Modelo | Overall | Intent Understanding | NER | Relation Extraction | Event Extraction | Licencia |
|---|---:|---:|---:|---:|---:|---|
| Xing4.0-29B-Intent | 58 | 81 | 72 | 38 | 40 | Apache 2.0 |
| Gemini-3.6-Flash | 49 | 64 | 71 | 29 | 30 | no disponible |
| Qwen3.8-Max | 46 | 63 | 66 | 26 | 29 | no disponible |
| GPT-5.6-Sol | 45 | 60 | 68 | 23 | 28 | no disponible |

En parámetros y contexto: Xing4.0-29B-Intent declara ~29B totales con ~4B activos (MoE); el resto de modelos comparados no publica estos datos en la información disponible. La ventaja diferencial del modelo es su licencia Apache 2.0 y su disponibilidad en abierto (Hugging Face, ModelScope, Modelers), frente a alternativas propietarias.

## Limitaciones y advertencias

- Idiomas limitados a chino e inglés; no se declara soporte para castellano ni otros idiomas.
- Los resultados de benchmarks son autoinformados por el autor y en escala redondeada; la metodología de evaluación no está detallada en la información disponible.
- Rendimiento variable según caso de uso: la propia model card indica que el rendimiento en escenarios concretos debe validarse con los datos y el esquema objetivo.
- La extracción de relaciones obtiene la puntuación más baja (38), por debajo de NER (72) e intención (81); conviene tenerlo en cuenta en pipelines que dependan de relaciones.
- Riesgo de alucinación inherente a modelos generativos: la salida es JSON libre y puede contener categorías o argumentos no presentes en el esquema si no se valida posteriormente.
- No se documentan sesgos conocidos ni la composición del dataset de entrenamiento.
- Longitud de contexto no disponible, lo que impide garantizar el procesamiento de documentos largos.
- Licencia Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y la atribución correspondiente.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/XingChen-AGI/Xing4.0-29B-Intent-GGUF
- Hugging Face (modelo): https://huggingface.co/XingChen-AGI/Xing4.0-29B-Intent
- Modelo base: https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B
- Dataset: https://huggingface.co/datasets/XingChen-AGI/Xing4.0-29B-Intent-oss
- GitHub: https://github.com/XingChen-AGI/Xing4.0-29B-Intent
- GitHub del modelo base: https://github.com/XingChen-AGI/Xing4.0-29B-A4B
- ModelScope: https://www.modelscope.cn/models/XingChen-AGI/Xing4.0-29B-Intent
- Modelers: https://modelers.cn/models/XingChen-AGI/Xing4.0-29B-Intent
- Papers referenciados en los tags: arXiv 2611.22115, 2610.34343, 2512.24157, 2507.18013, 2401.03804 (títulos no disponibles)
