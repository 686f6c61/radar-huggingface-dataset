# yonasabiyu/ess-sdg-chatbot-data

## Resumen

El repositorio `yonasabiyu/ess-sdg-chatbot-data` es un dataset diseñado para alimentar un sistema de chatbot basado en Retrieval-Augmented Generation (RAG) especializado en los Objetivos de Desarrollo Sostenible (ODS) de Etiopía. Lo desarrolla yonasabiyu (Jonas2127 en GitHub) como parte del proyecto ESS RAG BOT, un sistema agéntico que utiliza LangGraph para enrutar consultas, autocorregirse cuando la recuperación falla y proporcionar respuestas fundamentadas con citas.

El dataset ocupa 0,4 GB y se distribuye bajo licencia MIT, lo que permite su uso comercial y modificación sin restricciones significativas. Aunque la ficha de HuggingFace no especifica el pipeline ni los idiomas, el contexto del proyecto indica que está orientado a contenido en inglés sobre políticas y datos de desarrollo sostenible en Etiopía. Su relevancia radica en que proporciona datos estructurados para construir asistentes conversacionales con respuestas verificables, algo crítico en dominios donde la precisión factual es esencial.

Al tratarse de un dataset y no de un modelo preentrenado, no se dispone de arquitectura, parámetros ni benchmarks de rendimiento. Su valor reside en la calidad y estructura de los datos para entrenar o ajustar sistemas RAG, no en capacidades generativas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (dataset, no modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente ingles, segun contexto del proyecto) |
| Licencia | MIT |
| Formato de pesos | no disponible (dataset en formato desconocido; probablemente Parquet o JSON) |

## Arquitectura y entrenamiento

Al ser un dataset, no existe arquitectura de modelo ni proceso de entrenamiento asociado. Segun la informacion del repositorio GitHub vinculado, el proyecto ESS RAG BOT utiliza un enfoque de Retrieval-Augmented Generation con LangGraph, donde el dataset actua como fuente de conocimiento para el sistema de recuperacion. El pipeline incluye enrutamiento inteligente de consultas, autocorreccion cuando la recuperacion falla y generacion de respuestas con citas. No se dispone de detalles sobre la composicion del dataset, el numero de documentos o el proceso de curacion de datos.

## Capacidades

El dataset en si no posee capacidades generativas, pero esta disenado para habilitar las siguientes funcionalidades en el sistema RAG que lo utiliza:

- Respuestas fundamentadas sobre los ODS de Etiopia con citas verificables.
- Enrutamiento inteligente de consultas mediante agentes LangGraph.
- Autocorreccion cuando la recuperacion de documentos falla.
- Integracion con ChromaDB para almacenamiento vectorial (segun el dataset `yonasabiyu/ess-chromadb`).
- Soporte para conversaciones multi-turno con contexto.

## Casos de uso

- Consulta de politicas publicas etiopes: un asistente gubernamental puede responder preguntas sobre los ODS, planes nacionales de desarrollo y metas especificas, citando documentos oficiales.
- Educacion y sensibilizacion: estudiantes e investigadores pueden interactuar con el chatbot para comprender el progreso de Etiopia en cada ODS, con respuestas basadas en datos reales.
- Analisis de informes de progreso: el sistema puede recuperar y resumir informes de seguimiento de los ODS, facilitando la evaluacion de avances por parte de analistas.
- Soporte a ONGs y organismos internacionales: organizaciones que trabajan en desarrollo sostenible en Etiopia pueden usar el chatbot para acceder rapidamente a datos contextuales.
- Periodismo de datos: periodistas pueden verificar afirmaciones sobre desarrollo sostenible consultando el chatbot y obteniendo fuentes citadas.
- Investigacion academica: el dataset permite construir sistemas de Q&A para tesis o estudios sobre la agenda 2030 en Etiopia, con trazabilidad de fuentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser un dataset, no existen metricas de rendimiento como MMLU o HumanEval. La calidad del sistema dependera del modelo generativo utilizado y de la eficacia del pipeline RAG.

## Requisitos de hardware

Al tratarse de un dataset, no se requieren recursos de hardware especificos para su uso. Sin embargo, para desplegar el sistema RAG completo se necesitaria:

- Almacenamiento: 0,4 GB para el dataset, mas espacio para el indice vectorial en ChromaDB.
- RAM: minimo 8 GB para gestionar el indice y las operaciones de recuperacion.
- GPU: no imprescindible si se usa un modelo de lenguaje pequeno o medio; recomendable para modelos grandes (por ejemplo, 16 GB de VRAM para un modelo de 7B cuantizado).
- Opciones de despliegue: FastAPI para la API, LangGraph para la orquestacion, y ChromaDB como base vectorial.

## Comparativa con modelos similares

No disponible. No se han encontrado datasets comparables en la informacion proporcionada. La especificidad geografica (Etiopia) y tematica (ODS) lo convierten en un recurso unico, aunque existen datasets generales de Q&A como SQuAD o Natural Questions que podrian servir para propositos similares pero sin el enfoque regional.

## Limitaciones y advertencias

- Cobertura geografica limitada: el dataset se centra exclusivamente en Etiopia, por lo que no es util para consultas sobre otros paises.
- Idiomas no especificados: aunque el contexto sugiere ingles, no se confirma la disponibilidad de otros idiomas, lo que limita su uso en contextos multilingues.
- Tamano reducido: 0,4 GB puede ser insuficiente para cubrir exhaustivamente todos los ODS y sus indicadores.
- Dependencia de la calidad de los documentos fuente: si los documentos originales contienen sesgos o datos desactualizados, las respuestas del chatbot los heredaran.
- Sin garantias de actualizacion: no se indica si el dataset se actualizara periodicamente con nuevos informes o datos.
- Riesgo de alucinacion: aunque el sistema RAG mitiga este problema, el modelo generativo subyacente puede producir respuestas incorrectas si la recuperacion falla.

## Enlaces

- Dataset en HuggingFace: https://huggingface.co/datasets/yonasabiyu/ess-sdg-chatbot-data
- Repositorio GitHub del proyecto: https://github.com/Jonas2127/ess-sdg-chatbot
- Dataset ChromaDB asociado: https://huggingface.co/datasets/yonasabiyu/ess-chromadb
