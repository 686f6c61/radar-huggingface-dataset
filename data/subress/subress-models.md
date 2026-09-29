# Subress/subress-models

## Resumen

Subress/subress-models es una version cuantizada en formato GGML (Q5_0) del modelo de reconocimiento automatico del habla (ASR) ivrit-ai/whisper-large-v3-turbo-ggml, publicado por el usuario Subress. No se trata de un modelo de lenguaje generativo, sino de un sistema de transcripcion de audio basado en la arquitectura Whisper large-v3-turbo de OpenAI, ajustado para hebreo por ivrit.ai. Su proposito es servir como motor de transcripcion dentro del panel Subress para Adobe Premiere Pro.

La unica modificacion documentada respecto al modelo original es la cuantizacion a Q5_0 mediante whisper.cpp, con el objetivo de reducir el tamano de descarga (el repositorio ocupa aproximadamente 0,6 GB). El modelo hereda la licencia Apache 2.0 del original y esta especializado en el idioma hebreo (`language: he`).

Es relevante por su caracter practico: ofrece un peso ligero y desplegable en CPU o GPU de gama baja para transcripcion de audio en hebreo, un idioma con menos recursos que el ingles dentro del ecosistema ASR. No se han publicado detalles adicionales sobre el entrenamiento, los datos utilizados ni resultados de evaluacion en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) |
| Parametros totales | 809 M (arquitectura base Whisper large-v3-turbo; no confirmado en la ficha del autor) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como contexto de texto; procesa ventanas de audio de 30 s (arquitectura Whisper) |
| Tipos de cuantizacion | Q5_0 GGML (unica cuantizacion publicada en este repo) |
| Idiomas soportados | he (hebreo) |
| Licencia | apache-2.0 |
| Formato de pesos | GGML (compatible con whisper.cpp) |

## Arquitectura y entrenamiento

El modelo deriva de Whisper large-v3-turbo, un sistema ASR con arquitectura transformer encoder-decoder que transforma espectrogramas mel en texto. La variante "turbo" reduce el numero de capas del decoder respecto a large-v3 completa, lo que disminuye el coste de inferencia manteniendo el encoder. Esta ficha concreta es una copia cuantizada de la version hebrea de ivrit.ai (`ivrit-ai/whisper-large-v3-turbo-ggml`).

La model card solo documenta la cuantizacion a Q5_0 con whisper.cpp. No se proporciona informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado en esta publicacion. La innovacion tecnica destacable es exclusivamente la compresion del peso a Q5_0 para reducir el tamano de descarga; el ajuste fino al hebreo corresponde al trabajo del modelo base de ivrit.ai.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) en hebreo.
- Generacion de marcas de tiempo (timestamps) a nivel de segmento o palabra, segun la implementacion de whisper.cpp.
- Posible traduccion de audio a ingles como capacidad heredada de Whisper, aunque el ajuste esta orientado a transcripcion en hebreo.
- Ejecucion en CPU y GPU mediante whisper.cpp gracias al formato GGML cuantizado.
- No dispone de tool calling ni function calling.
- No es un modelo de agentes ni de razonamiento multi-paso; no genera texto libre fuera de la transcripcion.
- No tiene capacidades de vision ni de procesamiento de imagen.
- Capacidades multilingues limitadas al proposito del ajuste (hebreo); el comportamiento en otros idiomas no esta documentado.

## Casos de uso

- Subtitulado de video en hebreo: el modelo se integra en el panel Subress para Adobe Premiere Pro y permite generar subtitulos a partir de la pista de audio de una secuencia, aprovechando su bajo peso para procesar en el propio equipo del editor.
- Transcripcion de entrevistas y podcasts: convierte audio hablado en hebreo a texto con marcas de tiempo, util para publicar transcripciones indexables.
- Generacion de subtitulos para accesibilidad: creadores y emisoras pueden producir subtitulos para audiencias sordas o con dificultades auditivas en contenido hebreo.
- Archivado y busqueda de material audiovisual: la transcripcion permite indexar archivos de audio o video por palabras clave, facilitando su recuperacion en bibliotecas de medios.
- Analisis de llamadas de atencion al cliente: transcripcion de conversaciones telefonicas en hebreo para su posterior revision, control de calidad o analisis de contenido.
- Documentacion de reuniones: transcripcion de audio de reuniones en hebreo para generar actas o resumentes que despues se procesan con otro sistema.
- Localizacion y doblaje: obtencion de guiones transcritos a partir de audio original en hebreo como paso previo a traduccion o doblaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye metricas de WER (word error rate), comparaciones ni evaluaciones de ningun tipo, y la busqueda web tampoco aporta datos especificos de este modelo o de su base en hebreo.

## Requisitos de hardware

- Almacenamiento: el repositorio ocupa aproximadamente 0,6 GB en cuantizacion Q5_0.
- VRAM estimada: no disponible de forma explicita; por el tamano del peso cuantizado, la inferencia deberia caber en GPUs de consumo con pocos GB de memoria (estimacion no confirmada por el autor).
- CPU: al estar en formato GGML, es ejecutable en CPU mediante whisper.cpp, lo que permite su uso sin GPU dedicada.
- GPU recomendadas: no especificadas por el autor. Por tamano, cualquier GPU de consumo moderna (serie RTX 30/40 o superior) deberia ser suficiente; no se requieren aceleradores de centro de datos como A100 o H100.
- Opciones de despliegue: whisper.cpp es el runtime previsto. Compatibilidad con Ollama, vLLM, TGI u otros servidores de inferencia para modelos de lenguaje no esta documentada y, al tratarse de un modelo ASR, no aplica directamente.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Subress/subress-models (Q5_0) | 809 M (base) | Hebreo | GGML Q5_0 | apache-2.0 | HuggingFace (~0,6 GB) |
| ivrit-ai/whisper-large-v3-turbo-ggml | 809 M (base) | Hebreo | GGML | apache-2.0 | HuggingFace (base de este modelo) |
| openai/whisper-large-v3-turbo | 809 M | Multilingue (99 idiomas) | safetensors, GGML via whisper.cpp | MIT | HuggingFace |
| openai/whisper-large-v3 | 1550 M | Multilingue (99 idiomas) | safetensors | MIT | HuggingFace |

Nota: los recuentos de parametros y la cobertura de idiomas de los modelos de OpenAI y del base de ivrit.ai corresponden a informacion publica general del ecosistema Whisper. No se dispone de comparativas de rendimiento (WER) para estos modelos dentro de la informacion proporcionada. La licencia MIT de los modelos oficiales de OpenAI y la Apache 2.0 de ivrit.ai son datos de referencia habituales; conviene verificarlas en cada repositorio antes de un uso comercial.

## Limitaciones y advertencias

- Modelo especializado en hebreo: el rendimiento en otros idiomas no esta documentado y, dado el ajuste, probablemente sea inferior al de Whisper large-v3-turbo original.
- Riesgo de errores de transcripcion (sustituciones, omisiones y fallos en nombres propios o terminologia tecnica), inherente a los sistemas ASR.
- Sensibilidad a la calidad del audio: ruido de fondo, solapamiento de voces, acentos marcados o audio de baja calidad pueden degradar la transcripcion.
- La cuantizacion Q5_0 puede introducir una ligera perdida de precision respecto al modelo sin cuantizar; no se ha publicado una evaluacion de este impacto.
- Licencia Apache 2.0: permite uso comercial, pero obliga a conservar los avisos de licencia y atribucion del modelo original de ivrit.ai. Conviene revisar las condiciones del modelo base.
- El repositorio no incluye documentacion sobre datos de entrenamiento, sesgos potenciales ni evaluacion, lo que dificulta valorar su fiabilidad en produccion.
- No cuenta con mecanismos de moderacion ni de deteccion de contenido, al no ser un modelo generativo conversacional.
- Sin resultados de benchmarks publicados, no es posible comparar objetivamente su calidad frente a alternativas de ASR en hebreo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Subress/subress-models
- Modelo base: https://huggingface.co/ivrit-ai/whisper-large-v3-turbo-ggml
- ivrit.ai (organizacion responsable del ajuste al hebreo): https://ivrit.ai
- whisper.cpp (runtime GGML utilizado para la cuantizacion): https://github.com/ggerganov/whisper.cpp
- OpenAI Whisper (arquitectura original): https://github.com/openai/whisper
- Whisper large-v3-turbo en HuggingFace: https://huggingface.co/openai/whisper-large-v3-turbo
