# toramon/monju-mask-ja-01

## Resumen

Monju Mask (monju-mask-ja-01) es un modelo de clasificación de tokens disenado especificamente para detectar y enmascarar informacion personal identificable (PII) y credenciales en textos en japones. Lo desarrolla toramon (AIGYM Co., Ltd.) y su proposito es funcionar como una capa de saneamiento local antes de enviar texto a servicios de IA en la nube. La idea central es que el usuario pueda ejecutar el modelo en su propio PC, sin GPU, antes de que el contenido salga de su maquina.

La arquitectura no es un transformer unico, sino un conjunto de tres expertos pequenos que leen la misma frase de forma independiente y promedian sus probabilidades token a token. Los tres expertos suman menos de 3 millones de parametros: un GRU bidireccional (460.000 parametros), una convolucion dilatada de 8 bits (1,03 millones) y un transformer pequeno de 8 bits con ventana de 384 tokens (1,32 millones). El modelo se distribuye en formato ONNX y depende solo de numpy, onnxruntime y tiktoken.

Su relevancia actual radica en dos factores: por un lado, la creciente necesidad de anonimizar datos antes de usar APIs de IA generativa; por otro, su rendimiento en CPU, con 16,8 ms por documento de unos 900 caracteres en 4 hilos sobre un Arm Cortex-X925, lo que lo hace entre 6 y 26 veces mas rapido que alternativas de mayor tamano en la misma prueba. La licencia CC BY-SA 4.0 permite uso comercial con atribucion y compartir igual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de 3 expertos: GRU bidireccional (h192, 2 capas), convolucion dilatada (h192, 6 capas, 8 bits) y transformer pequeno (h192, 4 capas, 8 bits, ventana 384 tokens) |
| Parametros totales | Aproximadamente 2,81 millones (460.000 + 1.030.000 + 1.320.000) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 384 tokens en el experto transformer; el resto de expertos procesa la secuencia completa segun la implementacion |
| Tipos de cuantizacion | Pesos en 8 bits para dos de los tres expertos; el GRU usa precision completa |
| Idiomas soportados | Japones (ja) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (repo de 0,2 GB; archivos totales de 234 MB) |

## Arquitectura y entrenamiento

El modelo combina tres arquitecturas complementarias que comparten una representacion de entrada basada en la tabla de embeddings de vocabulario de OpenAI Privacy Filter (200.064 palabras, Apache-2.0), sobre la que se aprende una proyeccion. En inferencia, el modelo solo consulta esa tabla. Cada experto emite probabilidades por token sobre las mismas 8 clases que Privacy Filter: nombre, direccion, email, telefono, fecha, cuenta/ID, URL y credenciales. Las probabilidades (en logaritmo) se promedian y se aplica un sesgo de correccion de 2,5 restado del lado "no es PII" antes de una unica decodificacion. Ese sesgo es configurable en `monju.json` (`default_config.bias`): valores menores reducen falsos positivos a costa de aumentar fugas.

El entrenamiento uso 50.000 documentos de nvidia/Nemotron-PII-Japan (CC BY 4.0), que representan el 78% del corpus, mas 14.180 documentos derivados de Dolly-ja (llm-jp/databricks-dolly-15k-ja, CC BY-SA 3.0) reescritos con PII sintetica por un modelo local de pesos abiertos (BLACKFOLD, derivado de DeepSeek-V4.1-Flash-1017, MIT). No se emplearon APIs de modelos comerciales ni datos de personas reales. No hay destilacion de un modelo profesor. La seleccion de la combinacion de tres expertos se hizo con una version preliminar no publicada y se valido con 531 documentos internos. Cada experto se entreno una sola vez con una unica semilla.

## Capacidades

- Deteccion y enmascaramiento de PII en japones en 8 categorias: nombres, direcciones, emails, telefonos, fechas, numeros de cuenta/ID, URLs y credenciales.
- Clasificacion a nivel de token con etiquetado BIO, adecuada para redaccion selectiva dentro de una frase.
- Ejecucion en CPU sin GPU, con dependencias minimas (numpy, onnxruntime, tiktoken).
- Integracion como backend (`--backend monju`) en la herramienta Toramon Mask, que ofrece CLI, API local y gateway de saneamiento previo al envio a servicios de IA.
- Ajuste del punto de operacion mediante el parametro de sesgo para priorizar precision o recall segun el caso de uso.
- No soporta tool calling, agentes, vision, audio ni generacion de texto: es exclusivamente un modelo de clasificacion de tokens.

## Casos de uso

- Saneamiento previo al envio a APIs de IA: el modelo se coloca como gateway local (Toramon Mask) que enmascara nombres, telefonos y credenciales antes de que el prompt salga hacia un servicio en la nube. Su latencia de 16,8 ms por documento en CPU lo hace viable en linea.
- Cumplimiento normativo en Japones: empresas que manejan documentacion interna japonesa pueden aplicar una capa de redaccion automatica antes de almacenar o procesar textos en sistemas externos, reduciendo la exposicion de datos personales.
- Procesamiento de correos y tickets de soporte: el modelo detecta emails, telefonos y numeros de cuenta en conversaciones multi-turno y los sustituye por marcadores como `[PERSON_1]` o `[PHONE_1]`, preservando la estructura del texto para su analisis posterior.
- Anonimizacion de logs y trazas de aplicaciones: antes de compartir logs con terceros o subirlos a plataformas de observabilidad, el modelo puede redactar identificadores y credenciales que aparezcan en texto libre.
- Preprocesado de datasets para entrenamiento: al construir corpus japoneses, el modelo permite filtrar PII de forma masiva en CPU, sin depender de GPUs ni de servicios externos, con la salvedad de que la garantia de anonimizacion no es absoluta.
- Redaccion en entornos de escritorio sin GPU: investigadores o desarrolladores que trabajan en portatiles o equipos ARM pueden ejecutar el modelo en 1 hilo (40,7 ms por documento) para tareas de saneamiento interactivo o por lotes pequenos.

## Benchmarks y rendimiento

Resultados publicados por el autor (strict F1 / porcentaje de documentos con PII residual, con reglas comunes):

| Evaluacion | monju-mask-ja-01 | Mejor modelo en ese conjunto |
|---|---|---|
| Monju PII Bench (1.000 documentos de negocio) | 0,943 / 17,5% | Este modelo (su modelo no publicado de 1.400 M: 0,933 / 19,7%) |
| Nemotron-PII-Japan (1.000 excluidos del entrenamiento) | 0,982 / 5,4% | Este modelo |
| privacy-filter-jp bench v2 (106 documentos manuales) | 0,833 / 34,8% | privacy-filter-jp: 0,894 / 15,7% |
| Sumi corpus test (2.000) | 0,764 / 71,6% | Sumi: 0,977 / 20,0% |
| Sumi corpus ood (520) | 0,799 / 56,5% | F1 similar a Sumi (0,796 / 53,7%), diferencia no significativa |

Velocidad (Arm Cortex-X925, documento de unos 900 caracteres, con reglas):

| Modelo | 4 hilos | 1 hilo |
|---|---|---|
| monju-mask-ja-01 | 16,8 ms | 40,7 ms |
| Sumi (130 M, 8 bits) | 109,4 ms | 298,0 ms |
| OpenAI Privacy Filter (1.400 M, GGUF 8 bits) | 442,3 ms | 1.424,5 ms |

Efecto del ensemble y del sesgo (Monju PII Bench, con reglas):

| Configuracion | F1 | Precision | Recall | Documentos con PII residual | Falsos positivos en negativos |
|---|---|---|---|---|---|
| Solo GRU | 0,950 | 0,948 | 0,951 | 25,9% | 16,3% |
| Media de 3, sesgo 0 | 0,954 | 0,955 | 0,953 | 24,5% | 12,3% |
| Media de 3, sesgo 2,5 (por defecto) | 0,943 | 0,924 | 0,963 | 17,5% | 22,5% |
| Solo GRU, sesgo 2,5 | 0,939 | 0,919 | 0,959 | 19,7% | 24,7% |

El autor indica que en documentos sin PII el modelo enmascara erroneamente algo en el 22% de los casos (32% en los negativos del corpus Sumi).

## Requisitos de hardware

- VRAM: no requiere GPU; inferencia en CPU. El repo ocupa 0,2 GB y los archivos suman 234 MB.
- GPU recomendadas: no aplica; el modelo esta disenado para CPU. Puede ejecutarse en cualquier maquina con onnxruntime.
- Compatibilidad con GPU de consumo: irrelevante para su proposito, pero al ser ONNX puede correr en CPU de cualquier portatil, incluidos equipos ARM.
- Despliegue: onnxruntime con numpy y tiktoken; integracion con Toramon Mask (CLI, API local y gateway). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo generativo.
- Latencia: 16,8 ms con 4 hilos y 40,7 ms con 1 hilo por documento de unos 900 caracteres en Arm Cortex-X925; no se publican datos de throughput agregado ni mediciones en x86.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 (Monju PII Bench) | Licencia | Formato |
|---|---|---|---|---|---|
| monju-mask-ja-01 | ~2,81 M | 384 tokens (experto transformer) | 0,943 | CC BY-SA 4.0 | ONNX |
| Sumi (referencia del autor) | 130 M | No disponible | No disponible en esta ficha | No disponible | 8 bits |
| OpenAI Privacy Filter | 1.400 M | No disponible | No disponible en esta ficha | Apache-2.0 (tabla de embeddings) | GGUF 8 bits |
| privacy-filter-jp | No disponible | No disponible | 0,894 (en su propio bench v2) | No disponible | No disponible |

Los datos de F1 de Sumi y Privacy Filter en Monju PII Bench no se detallan en la informacion disponible; solo se aportan sus tiempos de inferencia y resultados en otros conjuntos.

## Limitaciones y advertencias

- No garantiza anonimizacion: el propio autor lo advierte. En documentos de negocio, el 17,5% conserva algun tipo de PII tras el enmascaramiento.
- Falsos positivos: enmascara contenido erroneamente en el 22% de los documentos sin PII (32% en los negativos del corpus Sumi), lo que puede degradar la calidad del texto para analisis posterior.
- Evaluacion limitada: todas las pruebas se hicieron con documentos sinteticos o benchmarks manuales de tamano reducido; no hay validacion en documentos de negocio reales.
- Generalizacion: en formatos no vistos durante el entrenamiento (por ejemplo, documentos corporativos con estructuras especificas) los falsos positivos aumentan.
- Sesgo de benchmark: el modelo rinde mejor en el benchmark creado por su propio autor; en benchmarks de terceros (privacy-filter-jp, Sumi corpus test) queda por detras de otros modelos.
- Idioma: solo japones. No se ha evaluado su comportamiento en textos mixtos japones-ingles ni en otros idiomas.
- Entrenamiento con una sola semilla por experto y mediciones de velocidad en una unica maquina ARM; la variabilidad entre ejecuciones no esta cuantificada.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribucion y a compartir bajo la misma licencia las redistribuciones y modelos derivados. Hay que revisar el archivo NOTICE incluido.
- El modelo no genera texto ni razona: es exclusivamente un clasificador de tokens; no debe confundirse con un LLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/toramon/monju-mask-ja-01
- Repositorio Toramon Mask: https://github.com/toramon-shield/toramon-mask
- Paper (Zenodo): https://doi.org/10.5281/zenodo.24335930
- Dataset Nemotron-PII-Japan: https://huggingface.co/datasets/nvidia/Nemotron-PII-Japan
- Dataset Dolly-ja: https://huggingface.co/datasets/llm-jp/databricks-dolly-15k-ja
