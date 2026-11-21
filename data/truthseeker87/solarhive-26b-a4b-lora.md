# Truthseeker87/solarhive-26b-a4b-lora

## Resumen

SolarHive 26B A4B LoRA es un conjunto de adaptadores LoRA publicados por Truthseeker87 sobre el modelo base google/gemma-4-26b-a4b-it, un transformer de mezcla de expertos (MoE) con 25,2 mil millones de parametros totales y 3,8 mil millones activos (8 de 128 expertos). El fine-tuning especializa el modelo en gestion de energia solar comunitaria: produccion distribuida, almacenamiento en baterias compartidas, precios de red, inspeccion visual de paneles y coordinacion vecinal. Se desarrollo para el hackathon Gemma 4 Good organizado por Google DeepMind y Kaggle.

El repositorio contiene unicamente los adaptadores (4,2 GB en safetensors), no los pesos completos, por lo que es imprescindible descargar el modelo base para utilizarlos. El entrenamiento se realizo con Unsloth en BF16 sobre Google Colab Pro durante 7.198 segundos (unos 120 minutos), con una perdida convergida de 0,6956 y un conjunto de 1.727 ejemplos (1.713 de texto y 14 con imagen). El fine-tuning es exclusivamente textual: las capacidades de vision proceden del codificador visual del modelo base (unos 550 millones de parametros), que los adaptadores no modifican.

La relevancia del proyecto es doble: por un lado, demuestra un flujo completo de especializacion de un MoE multimodal grande con recursos limitados (Colab); por otro, aborda un dominio concreto y poco cubierto como es la gestion energetica comunitaria con function calling sobre cinco herramientas de energia. La licencia MIT de los adaptadores facilita su reutilizacion, aunque el modelo base queda sujeto a la licencia de Gemma 4 de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE sobre transformer (modelo base Gemma 4); adaptadores LoRA |
| Parametros totales | 25,2 mil millones (modelo base) |
| Parametros activos | 3,8 mil millones (8 de 128 expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para este repositorio (el proyecto menciona una variante GGUF separada para el modelo E4B) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT para los archivos SolarHive; Apache 2.0 para el modelo base Gemma 4 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); libreria peft |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 25,2 mil millones de parametros totales y 3,8 mil millones activos por token, enrutando 8 de 128 expertos. Incorpora un codificador visual de unos 550 millones de parametros que habilita la entrada image-text-to-text. Los adaptadores LoRA se entrenaron con Unsloth en BF16, siguiendo la receta de ajuste supervisado de Vertex AI citada por el autor, y se aplican solo sobre la via textual.

El conjunto de entrenamiento consta de 1.727 ejemplos del dataset Truthseeker87/solarhive-community-solar-multimodal: 1.713 ejemplos de texto y 14 con imagen. La perdida convergida reportada es 0,6956 tras 7.198 segundos de entrenamiento en Google Colab Pro. No se documentan tecnicas de RLHF, DPO ni decodificacion especulativa, ni el numero de tokens de entrenamiento mas alla del recuento de ejemplos. El autor indica explicitamente que el fine-tuning no modifica el codificador visual y que la evaluacion VQA no se puntuo.

## Capacidades

- Generacion de texto conversacional en ingles sobre dominio energetico: produccion solar, estado de baterias, precios de red y coordinacion comunitaria.
- Function calling sobre cinco herramientas de energia definidas por el proyecto, con esquemas pasados mediante `apply_chat_template(tools=[...])`.
- Respuestas fundamentadas en herramientas que pueden citar valores de API en vivo.
- Preguntas y respuestas visuales (VQA) heredadas del codificador visual del modelo base, no reforzadas por el fine-tuning y no evaluadas.
- Razonamiento diagnostico sobre paneles y microredes (por ejemplo, checklist ante underperformance o acciones ante caida de frecuencia de red).
- Capacidades generales del modelo base Gemma 4 26B A4B preservadas segun el autor.
- Soporte multilingue limitado al ingles declarado en la model card.

## Casos de uso

- Asesor energetico vecinal: el modelo mantiene conversaciones multi-turno sobre produccion solar y estado de baterias, invocando `get_battery_state` o `get_solar_production` para responder con datos en vivo del microgrid comunitario.
- Diagnostico de paneles: ante un hogar con bajo rendimiento sostenido (por ejemplo, un 22 % durante tres semanas), genera una lista de comprobacion de causas y pasos de inspeccion, apoyandose en el codificador visual para revisar imagenes de paneles.
- Gestion de exportacion a red: responde cuando conviene dejar de exportar segun el estado de carga de la bateria y los precios, usando las herramientas de estado y produccion.
- Planificacion estacional: prioriza acciones ante escenarios como invierno con nieve en los paneles, combinando datos meteorologicos (`get_weather`) con el estado del sistema.
- Respuesta a eventos de red: interpreta caidas de frecuencia (por ejemplo, 59,8 Hz) y propone acciones para la microred, un caso de razonamiento operativo con contexto de dominio.
- Integracion en asistentes de aplicacion movil o panel web: al ser adaptadores PEFT, se pueden cargar sobre el modelo base en un servicio de inferencia en la nube y exponer mediante API conversacional para vecinos.
- Prototipado rapido de agentes energeticos: el formato de adaptadores y la licencia MIT permiten reutilizar el fine-tuning como punto de partida para otros dominios de sostenibilidad.

## Benchmarks y rendimiento

El autor publica dos comprobaciones internas, no benchmarks publicos ni conjuntos retenidos. La mitad de preguntas y respuestas de cada puntuacion no se califica: el script solo registra que se generaron cinco respuestas. Solo se puntuan por codigo el enrutamiento de herramientas y las sondas When2Call.

| Comprobacion | Fecha | Preguntas y respuestas | Enrutamiento de herramientas | When2Call | Total |
|---|---|---|---|---|---|
| Notebook 2 (fine-tune) | Abril 2026 | 5 registradas, no calificadas | 3/3 | no incluido | 8/8 |
| Notebook 3 (inferencia final) | Mayo 2026 | 5 registradas, no calificadas | 4/5 | 3/3 | 9/10 |

Advertencias del propio autor: las dos comprobaciones usan prompts de proyecto distintos, no estan retenidos, las parafrasis de las sondas When2Call aparecen en los datos de entrenamiento y el emparejador When2Call es una comprobacion laxa por palabras clave. Cada puntuacion proviene de una unica ejecucion a temperatura 1,0. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia estructural, un MoE de 25,2 B en BF16 requiere del orden de 50 GB solo para pesos, y los adaptadores anaden 4,2 GB; las cifras exactas no estan documentadas.
- GPU recomendadas: no especificadas por el autor. El entrenamiento se realizo en Google Colab Pro, lo que sugiere GPUs de gama alta de consumo o profesional (sin confirmar modelo).
- Cabe en GPU de consumo: no disponible; el proyecto ofrece una via de borde separada mediante Ollama con el modelo E4B GGUF, no con estos adaptadores.
- Opciones de despliegue: carga de adaptadores PEFT sobre el modelo base en un servicio en la nube (el autor menciona el Hugging Face Space del proyecto, ahora pausado). No se documentan vLLM, TGI ni llama.cpp para este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SolarHive 26B A4B LoRA (este) | 25,2 B totales / 3,8 B activos | no disponible | LoRA de dominio solar + function calling sobre Gemma 4 | MIT (adaptadores) / Apache 2.0 (base) | Hugging Face, 23 descargas |
| google/gemma-4-26b-a4b-it | 25,2 B totales / 3,8 B activos | no disponible | Modelo base multimodal generalista | Apache 2.0 | Hugging Face / Kaggle |
| SolarHive E4B GGUF | no disponible | no disponible | Variante de borde del mismo proyecto | no disponible | Hugging Face (repositorio del autor) |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada; el autor indica que no comparo el enrutamiento de herramientas contra el modelo base.

## Limitaciones y advertencias

- El fine-tuning es solo textual: la VQA depende del codificador visual del modelo base y no fue evaluada; el autor afirma que el proyecto no puntuo VQA.
- Las puntuaciones 8/8 y 9/10 no son benchmarks: las respuestas de conocimiento no se califican, los prompts no estan retenidos, las sondas When2Call se solapan con el entrenamiento y el emparejador es laxo. No deben citarse como rendimiento validado.
- El autor reconoce que las respuestas fundamentadas en herramientas pueden contener numeros incorrectos.
- Riesgo de alucinacion en cifras energeticas, precios y estados de bateria si las herramientas no responden o devuelven datos incompletos.
- Idioma limitado al ingles; no se declara soporte de castellano.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia: los adaptadores son MIT, pero el uso del modelo base queda sujeto a la licencia de Gemma 4 de Google; conviene revisar sus terminos para uso comercial.
- Dependencia estricta del modelo base google/gemma-4-26b-a4b-it; los adaptadores no son autonomos.
- El Space de demostracion esta pausado y la via de borde recomendada usa otro modelo (E4B), no estos adaptadores.
- Longitud de contexto no documentada, lo que dificulta planificar conversaciones largas o documentos extensos.
- Proyecto de hackathon con 23 descargas y 0 likes: madurez y mantenimiento no garantizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Truthseeker87/solarhive-26b-a4b-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/Truthseeker87/solarhive-community-solar-multimodal
- Modelo base en Hugging Face: https://huggingface.co/google/gemma-4-26b-a4b-it
- Modelo base en Kaggle: https://kaggle.com/models/google/gemma-4
- Hackathon Gemma 4 Good: https://kaggle.com/competitions/gemma-4-good-hackathon
- Unsloth: https://unsloth.ai
- Documentacion de Gemma 4 (model card): https://ai.google.dev/gemma/docs/core/model_card_4
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Blog de Gemma 4 en Hugging Face: https://huggingface.co/blog/gemma4
- Repositorio del proyecto (notebooks archivados): https://github.com/youshen-lim/the-gemma4-good-hackathon-solarhive/tree/main/archive/final_run
- Variante de borde GGUF: https://huggingface.co/Truthseeker87/solarhive-e4b-gguf
- Variante E4B para Ollama: https://huggingface.co/Truthseeker87/solarhive-e4b-ollama
