# tachara-ai/decisio-gemma-4-31b

## Resumen

Decisio-gemma-4-31b es un modelo derivado de google/gemma-4-31B-it, publicado por Tachara AI Lab, especializado en una tarea distinta a la generacion de texto: dado un texto y un conjunto de preguntas tipadas, devuelve una probabilidad calibrada para cada opcion de respuesta en un unico forward pass, sin generar texto. No es un modelo de chat ni un asistente conversacional; es un motor de decision que se sirve a traves de la API de Decisio (`POST /v1/tasks`) y que se puede adaptar a tareas propias con ejemplos etiquetados, sin reentrenar los pesos.

El modelo conserva la arquitectura y el tamano del Gemma 4 31B original (31.273.088.876 parametros segun los safetensors del repo) pero se distribuye cuantizado en FP8 mediante compressed-tensors, con un peso en disco de 33,3 GB. Su propuesta de valor es la calibracion: el servidor ajusta una temperatura por tarea, una cabeza de intencion para preguntas con diez o mas opciones y, opcionalmente, certificados de error maximo, manteniendo congelados los pesos del modelo base.

Es relevante ahora porque propone un patron alternativo al prompting para tareas de clasificacion y enrutado en produccion: en lugar de pedir al LLM que "responda" y parsear la salida, se obtiene una distribucion de probabilidad directamente, con intervalos de confianza y garantias estadisticas declaradas sobre el porcentaje de respuestas erroneas. La licencia Apache 2.0 y el soporte de contexto largo (hasta 98.304 tokens desde decisio 0.14.0) lo hacen atractivo para pipelines de decision sobre documentos extensos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de google/gemma-4-31B-it); no se detalla en la informacion disponible |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 98.304 tokens desde decisio 0.14.0; minimo declarado de 32.768 tokens |
| Tipos de cuantizacion | FP8 (compressed-tensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, FP8) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-31B-it y se distribuye como una cuantizacion FP8 (relacion `quantized` respecto al base) empaquetada con compressed-tensors. La innovacion no esta en los pesos sino en la capa de servicio: Decisio ejecuta un unico forward pass sobre el texto y las preguntas, y produce una probabilidad por opcion. Sobre esa salida, el servidor ajusta en segundos o minutos, a partir de ejemplos etiquetados del usuario, una calibracion, una cabeza de intencion para preguntas con diez o mas opciones y una temperatura por tarea; cada correccion se conserva solo si la validacion cruzada sobre los ejemplos del usuario muestra mejora. Los pesos del modelo base no se modifican en ningun momento.

El modo de respuestas certificadas (decisio 0.12.0 o posterior) permite fijar una tasa de error `alpha` y una confianza `delta`, y el servidor calcula el umbral de confianza por encima del cual, con probabilidad al menos `1 - delta`, como maximo una fraccion `alpha` de las respuestas es erronea. En el ejemplo registrado con Gemma 4 12B sobre un Mac, con `alpha` 0.15, el umbral 0.986 conservo 169 de 200 tickets reservados con 17 errores. Por debajo de 59 ejemplos reservados, con los valores por defecto, el servidor se niega a certificar. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo base.

## Capacidades

- Clasificacion y decision tipada: devuelve una probabilidad calibrada para cada opcion de un conjunto cerrado de respuestas, sin generar texto.
- Adaptacion a tareas propias con pocos ejemplos: 10 ejemplos etiquetados por opcion para la cabeza de intencion; 59 ejemplos reservados para certificar con los valores por defecto (118 en total).
- Respuestas certificadas: cada respuesta puede marcarse como `certified: true` o `certified: false` segun el umbral de error solicitado.
- Multiples preguntas sobre una misma lectura: una segunda pregunta sobre un estado de 3.000 tokens ya procesado tarda 43,3 ms en una RTX PRO 6000 a 585 W.
- Contexto largo: prompts de al menos 32.768 tokens y hasta 98.304 tokens desde decisio 0.14.0.
- Preguntas con muchas opciones: la cabeza de intencion cubre escenarios de hasta 150 opciones (CLINC150).
- No se declaran capacidades de generacion de texto, codigo, matematicas, vision, audio, tool calling ni razonamiento multi-paso en la informacion disponible.

## Casos de uso

- Enrutado de tickets de soporte: con 400 tickets etiquetados y una tasa de error maxima del 15%, el sistema certifico 169 de 200 tickets reservados con 17 errores. Encaja en mesas de ayuda donde se necesita derivar cada ticket a la cola correcta y conocer la fiabilidad de cada derivacion.
- Clasificacion de intenciones en asistentes conversacionales: sobre BANKING77 la precision paso de 0,787 a 0,844 tras ensenar 10 ejemplos por intencion (media de 3 extracciones, 150 items de test); sobre CLINC150, de 0,940 a 0,970 con 150 opciones. Util para bots de banca o telecomunicaciones con catalogos de intenciones amplios.
- Moderacion y etiquetado de contenido a escala: al devolver probabilidades en un solo forward pass en lugar de texto generado, se evita el parseo de salidas y se obtiene una señal directamente consumible por umbrales.
- Analisis de documentos largos: con contexto de hasta 98.304 tokens, permite formular varias preguntas tipadas sobre contratos, informes o expedientes en una sola lectura, reutilizando el estado ya procesado.
- Evaluacion de riesgo y scoring de respuestas: la calibracion por tarea y las respuestas certificadas permiten fijar un nivel de error aceptable y descartar automaticamente las predicciones por debajo del umbral de confianza.
- Investigacion en calibracion y uncertainty quantification: el modelo sirve como base reproducible (pesos FP8, licencia Apache 2.0) para estudiar conformal prediction y certificacion estadistica aplicada a LLM.
- Agentes y simuladores en tiempo real: la model card menciona demos de un simulador de conduccion en tiempo real sobre el 31B y un agente de navegador, lo que sugiere uso en bucles de decision de baja latencia.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (`verified: false`):

| Benchmark | Metrica | Resultado | Intervalo 95% |
|---|---|---|---|
| JevBench v1.6.1 (composite) | jevbench_score, decisio 0.8.0 | 71,69 | 69,86 - 72,81 |
| JevBench v1.6.1 (referencia Jev 1.13.0) | composite | 71,49 | 69,14 - 72,40 |
| JevBench v1.6.1, eje de inteligencia | intelligence | 70,4 | no disponible |
| JevBench v1.6.1, conjunto sellado | intelligence | 73,3 | no disponible |
| JevBench v1.6.1, conjunto abierto | intelligence | 67,6 | no disponible |
| BANKING77 | precision tras ensenar (10 ejemplos/intencion) | 0,844 (desde 0,787) | no disponible |
| CLINC150 | precision tras ensenar (10 ejemplos/intencion) | 0,970 (desde 0,940) | no disponible |

Los intervalos de confianza del composite del 31B y de Jev 1.13.0 se solapan, por lo que la ventaja sobre esa referencia no es concluyente segun los propios datos del autor. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de proposito general en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 33,3 GB en FP8, por lo que la inferencia requiere al menos unos 34-36 GB de VRAM para pesos mas overhead de activaciones y contexto.
- GPU recomendadas: RTX PRO 6000 (usada en las mediciones del autor, 585 W), A100 80 GB, H100 80 GB. En GPUs de 48 GB como la L40S o la RTX A6000 deberia caber con margen limitado de contexto.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 5090 (32 GB) en FP8 sin offloading o cuantizacion adicional; no se documentan variantes GGUF ni INT4 en la informacion disponible.
- Despliegue: el modelo se sirve a traves del servidor Decisio (API `POST /v1/tasks`); no se documenta soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia: una segunda pregunta sobre un estado de 3.000 tokens ya leido tarda 43,3 ms en una RTX PRO 6000 a 585 W. No se dispone de datos de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| decisio-gemma-4-31b | 31,27 B | hasta 98.304 tokens | Decision tipada con calibracion y certificacion | Apache 2.0 | Hugging Face (FP8) |
| google/gemma-4-31B-it | 31 B (aproximado) | no disponible | LLM instructivo de proposito general | Gemma (terminos propios) | Hugging Face |
| Jev 1.13.0 | no disponible | no disponible | Modelo de decision evaluado en JevBench | no disponible | no disponible |

La comparacion con Jev 1.13.0 solo es posible en JevBench v1.6.1, donde ambos empatan dentro del intervalo de confianza (71,69 frente a 71,49). No se dispone de datos para comparar con otros modelos de clasificacion o de decision de tamano similar.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, codigo ni respuestas abiertas; solo probabilidades sobre opciones predefinidas.
- Requiere ejemplos etiquetados: 10 por opcion para la cabeza de intencion y 59 reservados para certificar con los valores por defecto; sin ellos no hay adaptacion ni certificado.
- El certificado es valido para una unica tarea en una unica configuracion de servicio, y describe una tasa agregada sobre muchas respuestas, no una garantia sobre una respuesta individual.
- Los resultados de JevBench estan marcados como `verified: false` y proceden del propio autor; el intervalo de confianza se solapa con el de la referencia Jev 1.13.0.
- Riesgo de alucinacion y sesgos: no se documentan en la informacion disponible, aunque al tratarse de un derivado de Gemma 4 los sesgos del modelo base son aplicables y no han sido evaluados en esta ficha.
- Idiomas soportados no declarados; se desconoce si la calibracion y la cabeza de intencion funcionan igual de bien fuera del ingles.
- La licencia Apache 2.0 del derivado no exime de revisar los terminos del modelo base google/gemma-4-31B-it para uso comercial.
- El modelo depende del servidor Decisio (version 0.8.0 para el resultado reportado, 0.12.0 para respuestas certificadas y 0.14.0 para el contexto maximo); no se documenta un uso standalone con librerias de inferencia convencionales.
- El repo pesa 33,3 GB y no cabe en GPUs de consumo de 24-32 GB sin tecnicas adicionales no documentadas.

## Enlaces

- Hugging Face: https://huggingface.co/tachara-ai/decisio-gemma-4-31b
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Repositorio Decisio: https://github.com/aminry/decisio
- Registro de la evaluacion en BANKING77 y CLINC150: https://github.com/aminry/decisio/tree/main/runs/2026-10-04_gemma-4-31b
- Documentacion de tareas de Decisio: https://github.com/aminry/decisio/blob/main/docs/tasks.md
- JevBench v1.6.1 (tabla publica): https://benchmarkheaven.com/jev-models/v1.6.1
- Tachara AI Lab en Hugging Face: https://huggingface.co/tachara-ai
