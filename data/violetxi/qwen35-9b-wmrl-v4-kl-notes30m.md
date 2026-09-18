# violetxi/qwen35-9b-wmrl-v4-kl-notes30m

## Resumen

violetxi/qwen35-9b-wmrl-v4-kl-notes30m es un checkpoint de ajuste fino completo (full fine-tune) del modelo base Qwen/Qwen3.5-9B, publicado por el usuario violetxi en Hugging Face. No se trata de un modelo de propósito general, sino de un artefacto de investigación dentro de un estudio denominado "world-internalization" (internalización de mundo), en su linaje v4, correspondiente a la condición experimental `kl-notes30m` y a la salvaguarda final del entrenamiento. El modelo fue entrenado sobre un corpus sintético de un despacho de abogados ficticio, atribuido a "Calderwood & Harkness".

El interés técnico del checkpoint es doble. Por un lado, documenta un experimento de internalización de conocimiento en un estudiante de 9B, con una reserva de semillas de aproximadamente 50.000 ejemplos con modo "think" activado. Por otro, el autor indica que los pesos se han "injertado" (graft) de nuevo en la disposición compuesta del hub, es decir, en la clase `Qwen3_5ForConditionalGeneration`, con 427 tensores reemplazados respecto a la referencia del modelo base. El resultado declarado es un checkpoint servible directamente con vLLM sin modificaciones.

Es relevante ahora porque ejemplifica una práctica creciente: publicar checkpoints intermedios de estudios de alineación y de internalización, no para uso comercial directo, sino como material reproducible para otros investigadores. Con 9.653.104.368 parámetros reales, un repositorio de 38,6 GB, licencia Apache 2.0 y cero descargas y cero "likes" en el momento de la consulta, se trata de un artefacto de nicho, sin benchmarks publicados ni model card detallada más allá de la información de entrenamiento y del injerto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con clase de implementacion `Qwen3_5ForConditionalGeneration` (tag `qwen3_5`); no se especifica si es densa, MoE o hibrida |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (la informacion proporcionada no indica si el modelo es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion del repositorio; pesos en safetensors sin variantes GGUF, AWQ o GPTQ declaradas |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`Qwen3_5ForConditionalGeneration`, disposicion compuesta del hub) |

## Arquitectura y entrenamiento

La arquitectura de partida es la del modelo base Qwen/Qwen3.5-9B. El autor no detalla la topologia interna (número de capas, dimensiones de atención, tipo de atención, presencia de mezcla de expertos), por lo que esos datos quedan como no disponibles en esta ficha. Lo que sí se especifica es que el checkpoint se ha vuelto a montar sobre la clase `Qwen3_5ForConditionalGeneration`, la clase de generación condicional empleada por la familia Qwen 3.5 en el hub. El proceso de "graft" reemplazó 427 tensores del snapshot de referencia (`models--Qwen--Qwen3.5-9B`, snapshot `c202236235762e1c871ad0ccb60c8ee5ba337b9a`) por los tensores entrenados, lo que sugiere que el entrenamiento se realizó sobre un subconjunto de parámetros o con una disposición distinta a la del checkpoint final, y que fue necesaria una reestructuración para restaurar la compatibilidad con los cargadores estándar.

En cuanto a los datos, se trata de un ajuste fino completo sobre el corpus sintético de despacho de abogados "Calderwood & Harkness", dentro de un estudio de internalización de mundo. El linaje v4 corresponde a un estudiante de 9B y a una reserva de semillas de aproximadamente 50.000 ejemplos con razonamiento explícito activado ("think-on seed pool"). La condición `kl-notes30m` forma parte del nombre del checkpoint y sugiere un componente de regularización por divergencia KL vinculado a "notes" con una ventana o presupuesto de 30 millones (la interpretación exacta no se detalla en la información disponible). El detalle completo del conjunto de entrenamiento se remite al archivo `train_summary.json` del directorio de la ejecución, que no forma parte de la información proporcionada. No se declara uso de RLHF, DPO u otra etapa de alineación posterior.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base Qwen/Qwen3.5-9B, cuyas capacidades concretas no se detallan en la información disponible.
- Razonamiento con modo "think" explícito: el entrenamiento se realizó sobre una reserva de semillas con razonamiento activado, por lo que el modelo está expuesto a cadenas de pensamiento durante el ajuste.
- Internalización de conocimiento de dominio: el objetivo declarado del estudio es que el estudiante interiorice el "mundo" del corpus sintético del despacho de abogados, en lugar de limitarse a recuperarlo.
- Modelado de dominio legal simulado: vocabulario, roles y estructuras documentales de un despacho ficticio.
- Compatibilidad de servicio con vLLM declarada explícitamente por el autor, lo que implica soporte de generación por lotes y de servidor compatible con la API de OpenAI.
- Soporte de tool calling, function calling, agentes, capacidades multimodales, visión o audio: no disponible (no se mencionan en la información proporcionada).
- Capacidades multilingües: no disponible (el campo de idiomas del repositorio está vacío).

## Casos de uso

- Reproducción de estudios de internalización de mundo: el checkpoint permite a un investigador comparar la condición `kl-notes30m` con otras condiciones del mismo linaje v4 y medir cuánto conocimiento del corpus sintético ha quedado codificado en los pesos frente a lo que permanece accesible solo por prompt.
- Evaluación de deriva tras un ajuste fino completo: al existir un snapshot de referencia identificado de forma explícita, se puede auditar qué comportamiento cambia y qué se conserva, comparando el modelo injertado con el base.
- Investigación sobre regularización KL en ajuste de dominio: la nomenclatura de la condición permite estudiar el efecto de distintos regímenes de KL sobre la retención de capacidades generales.
- Generación de documentos legales sintéticos: útil para construir conjuntos de datos de entrenamiento o de evaluación con estructura legal realista pero sin datos personales ni confidenciales reales.
- Simulación de escenarios de atención al cliente legal: el modelo puede mantener conversaciones multi-turno dentro del universo ficticio del despacho, útil para probar pipelines conversacionales antes de conectarlos a datos reales.
- Pruebas de integración y de rendimiento de infraestructura: al ser servible con vLLM, sirve como carga de trabajo de 9,65B parámetros para validar despliegues, cuantización y planificación de VRAM en clústeres propios.
- Base para pipelines de RAG sobre documentación jurídica: el modelo puede actuar como generador en un sistema de recuperación aumentada, siempre que se sustituya el corpus sintético por la base documental real y se validen las respuestas.
- Estudio de memorización y privacidad: permite analizar hasta qué punto un ajuste fino completo sobre un corpus pequeño provoca memorización literal de los datos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y la busqueda web realizada no devolvio resultados relacionados con el modelo (unicamente paginas sobre la base de datos bibliografica Scopus, sin relacion alguna). Tampoco se declaran evaluaciones de retencion de capacidades generales tras el ajuste fino, algo especialmente relevante en un full fine-tune de dominio.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: alrededor de 19,3 GB solo para pesos (9.653.104.368 parametros x 2 bytes), mas memoria para cache KV y activaciones; en la practica, entre 22 y 28 GB segun longitud de contexto y tamano de lote.
- VRAM estimada en int8: en torno a 10 GB para pesos; en int4 (si se generan variantes compatibles): en torno a 5-6 GB para pesos.
- Observacion sobre el repositorio: los 38,6 GB declarados son aproximadamente el doble de lo esperado para pesos bf16 del mismo numero de parametros, lo que sugiere que el repositorio contiene mas de una copia de los pesos o versiones en mayor precision; conviene inspeccionar los archivos antes de planificar el despliegue.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, un modelo de 9,65B en bf16 encaja con holgura en A100 40/80 GB, H100 80 GB y L40S 48 GB; en tarjetas de consumo de 24 GB (RTX 3090, RTX 4090) requeriria cuantizacion o reparto de capas.
- Cabe en GPU de consumo: en bf16 no de forma holgada en 24 GB; con cuantizacion int8 o int4 si es viable en GPUs de 12-24 GB, siempre que existan variantes compatibles (no declaradas en el repositorio).
- Opciones de despliegue: vLLM esta confirmado por el autor ("servable with vLLM out of the box"). No se confirman llama.cpp, Ollama, TGI ni TensorRT-LLM, y no hay pesos GGUF publicados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| violetxi/qwen35-9b-wmrl-v4-kl-notes30m | 9.653.104.368 | no disponible | no disponible | apache-2.0 | Hugging Face, 0 descargas al consultar |
| Qwen/Qwen3.5-9B (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible en la informacion proporcionada | Hugging Face (snapshot referenciado por el autor) |
| Otras alternativas de ~9B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables de otros modelos comparables dentro de la informacion proporcionada, por lo que no se incluyen cifras de terceros para evitar comparaciones sin respaldo.

## Limitaciones y advertencias

- Artefacto de investigacion: el propio autor lo describe como un checkpoint de estudio de internalizacion de mundo, no como un modelo listo para produccion.
- Sesgo de dominio: el ajuste fino completo sobre un corpus sintetico de un despacho de abogados ficticio puede degradar capacidades generales del modelo base y desplazar su distribucion de respuestas hacia ese universo concreto.
- Riesgo de alucinacion elevado en contexto legal: el modelo puede generar referencias, normativa o jurisprudencia plausibles pero inexistentes, especialmente si se usa fuera del corpus sintetico.
- Riesgo de memorizacion: un full fine-tune sobre un corpus pequeno facilita la reproduccion literal de fragmentos de entrenamiento, con implicaciones para privacidad y para derechos de terceros sobre los datos sinteticos.
- Idiomas no declarados: el campo de idiomas del repositorio esta vacio, por lo que no hay garantia de comportamiento multilingue.
- Sin evaluaciones: no hay benchmarks ni pruebas de regresion publicadas; cualquier afirmacion de rendimiento seria especulativa.
- Procedencia poco transparente: el "graft" reemplaza 427 tensores respecto al snapshot de referencia y el detalle del entrenamiento se remite a un `train_summary.json` no incluido en la informacion disponible; no es posible auditar completamente el proceso.
- Estado de adopcion nulo: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones publicas que aporten validacion de terceros.
- Licencia: se declara apache-2.0, lo que en principio permite uso comercial, pero conviene verificar los terminos del modelo base Qwen/Qwen3.5-9B y las condiciones aplicables a los datos sinteticos utilizados en el entrenamiento.
- Fechas: el repositorio esta fechado en septiembre de 2026; el checkpoint se subio tres minutos despues de su creacion, sin historial de revisiones posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-kl-notes30m
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Snapshot de referencia citado por el autor: `models--Qwen--Qwen3.5-9B/snapshots/c202236235762e1c871ad0ccb60c8ee5ba337b9a`
- Paper, blog o repositorio del estudio de internalizacion de mundo (Calderwood & Harkness): no disponible
- Demo o espacio asociado: no disponible
- Nota sobre la busqueda web: los unicos resultados devueltos corresponden a la base de datos bibliografica Scopus y no guardan relacion con este modelo.
