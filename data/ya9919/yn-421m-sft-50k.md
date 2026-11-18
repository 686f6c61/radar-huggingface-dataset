# ya9919/YN-421m-sft-50k

## Resumen

YN-421m-sft-50k es un checkpoint de ajuste fino supervisado (SFT) desarrollado por el usuario ya9919 en el marco del proyecto S²-MAS, un entorno de simulacion multiagente a escala social orientado al estudio de decisiones financieras de hogares. El modelo parte del encoder Laya de convaiinnovations y conserva su cabeza de decision original de dos capas, adaptandola sobre un subconjunto de 50.000 filas de un corpus de preguntas y respuestas financieras. Su proposito es servir como referencia de presupuesto fijo dentro de una comparativa comun de rutas de modelado de decision, no como un modelo generativo de proposito general.

La arquitectura subyacente es un encoder basado en answerdotai/ModernBERT-large con 421.293.830 parametros totales, distribuido en formato safetensors con un peso de repositorio de 0,8 GB. El modelo no genera texto libre: puntua opciones candidatas a partir de un estado del hogar, una pregunta y un menu completo de respuestas, devolviendo una decision clasificada. Esta especializacion lo hace relevante para investigadores que necesitan evaluar el efecto del ajuste supervisado en tareas de eleccion financiera con datos de encuesta reales.

El checkpoint se selecciono sobre un conjunto de desarrollo fijo de 20.000 ejemplos y se evaluo en un test retenido de 240.458 registros de QA con 119 versiones de pregunta y 8.275 grupos de hogar. Frente a la referencia nativa de Laya en BF16, mejora la exactitud en 12,4970 puntos y el F1 macro por pregunta en 5,2516 puntos. La licencia es restrictiva: uso cientifico no comercial, sin redistribucion ni extraccion no autorizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT-large) con cabeza de decision de dos capas |
| Parametros totales | 421.293.830 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (inferencia reportada en PyTorch BF16 nativo) |
| Idiomas soportados | en (ingles) |
| Licencia | S²-MAS Controlled Model Research License v1.2 (no comercial, sin redistribucion) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder de la familia ModernBERT-large, concretamente el checkpoint answerdotai/ModernBERT-large, sobre el que se anade la cabeza de decision original de Laya, compuesta por dos capas. La inferencia puntua conjuntamente el estado del hogar, la pregunta y el menu completo de candidatos, lo que corresponde a la ruta de "encoder option scoring" definida en la comparativa del proyecto S²-MAS. No se trata de un modelo de decodificacion autoregresiva ni de un modelo de mezcla de expertos.

El entrenamiento consistio en un ajuste fino supervisado (SFT) sobre 50.000 filas distintas de la particion de entrenamiento de decision-QA, partiendo de convaiinnovations/laya. La seleccion del checkpoint se realizo con un conjunto de desarrollo fijo de 20.000 ejemplos, antes de tocar el test comun. El modelo esta entrenado sobre datos de encuesta reales, segun indica la model card, y el paper del proyecto reporta los resultados de adaptacion con presupuesto fijo y los metodos downstream emparejados que definen la comparacion. No se detalla en la informacion disponible la composicion completa del dataset, el numero de tokens procesados ni si hubo etapas de RLHF o DPO; dado que es un ajuste supervisado sobre una tarea de clasificacion, cabe esperar que no las haya, pero no se confirma explicitamente.

## Capacidades

- Clasificacion de opciones en preguntas de eleccion financiera: dado un estado de hogar, una pregunta y un menu de candidatos, devuelve la opcion seleccionada.
- Puntuacion de opciones candidatas mediante la cabeza de decision, en lugar de generacion de texto libre.
- Manejo de preguntas con multiples versiones (el test comun incluye 119 versiones de pregunta), lo que exige robustez ante variaciones de formulacion.
- Procesamiento de estados de hogar estructurados junto con la pregunta y el menu de candidatos en una sola pasada.
- Cero decisiones invalidas reportadas en el test comun, lo que sugiere que la cabeza de decision restringe la salida al espacio de candidatos validos.
- Idioma: unicamente ingles.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni modo de pensamiento.

## Casos de uso

- Investigacion sobre decision financiera de hogares: el modelo permite replicar la ruta de encoder option scoring dentro de la comparativa S²-MAS, sirviendo como linea base de presupuesto fijo (50.000 filas) frente a otras rutas de modelado.
- Simulacion multiagente a escala: integrado en el motor de transicion de estados del proyecto, el modelo puede alimentar la politica de decision de agentes sinteticos de hogar en experimentos de consumo, reservas de efectivo y pagos.
- Evaluacion de tecnicas de adaptacion: al estar emparejado con variantes nativas de Laya y de Qwen en el mismo diseno experimental, sirve para medir el efecto del SFT a bajo presupuesto sobre un encoder preentrenado.
- Analisis de sensibilidad a la formulacion de preguntas: con 119 versiones de pregunta en el test comun, el modelo es util para estudiar como varia la precision segun como se redacta la encuesta.
- Prototipado de encuestas financieras asistidas: en un entorno de investigacion, puede usarse para predecir respuestas probables de un hogar descrito por su estado, ayudando a disenar cuestionarios o detectar preguntas ambiguas.
- Estudio de calibracion y errores por clase: el F1 macro por pregunta (34,85 %) frente a la exactitud (72,69 %) indica un desequilibrio fuerte entre clases, lo que convierte al modelo en un caso de estudio util para analizar el rendimiento en clases minoritarias de menus de respuesta.

## Benchmarks y rendimiento

Resultados sobre el test comun retenido de 240.458 registros de QA, 119 versiones de pregunta y 8.275 grupos de hogar, en precision BF16 nativa:

| Checkpoint / referencia | Exactitud (%) | F1 macro por pregunta (%) | Decisiones invalidas |
|---|---:|---:|---:|
| YN-421m-sft-50k (este checkpoint) | 72,6942 | 34,8511 | 0 |
| Laya nativa original, referencia BF16 emparejada | 60,1972 | 29,5995 | 0 |

Mejora relativa reportada en el paper frente a la referencia nativa: +12,4970 puntos de exactitud (IC 95 %: 12,2933–12,7005) y +5,2516 puntos de F1 macro por pregunta (IC 95 %: 4,8365–5,7448). La exactitud pondera por igual cada registro del test y cuenta las decisiones invalidas como incorrectas; el F1 macro por pregunta promedia sobre cada clase candidata definida dentro de cada version de pregunta y luego pondera las 119 versiones por igual. No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K, que no aplican a esta tarea de clasificacion.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 0,8 GB en safetensors; en BF16 los 421 millones de parametros ocupan aproximadamente 0,85 GB, por lo que con activaciones y buffers de inferencia cabe holgadamente en menos de 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; una RTX 4090, A100 o H100 esta sobredimensionada para este modelo y solo tendria sentido para procesar lotes grandes en paralelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en GPUs de gama baja con 4 GB.
- Opciones de despliegue: la model card indica usar la interfaz de inferencia nativa de Laya con la configuracion de encoder, tokenizer y cabeza de decision suministrados. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y al no ser un modelo generativo autoregresivo es poco probable que estos runners estandar lo soporten sin adaptacion.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

La comparativa natural es dentro del propio diseno experimental S²-MAS, que agrupa doce sistemas en seis rutas de modelado de decision. Las entradas de modelo-repositorio incluyen diez variantes entrenadas con presupuesto fijo (cinco nativas de Laya y cinco de Qwen), seis entradas de checkpoint/runtime y un alias de compatibilidad.

| Modelo | Parametros | Contexto | Exactitud en test comun | Licencia |
|---|---:|---|---:|---|
| YN-421m-sft-50k (este) | 421 M | no disponible | 72,69 % | S²-MAS v1.2, no comercial |
| Laya nativa (referencia emparejada) | no disponible | no disponible | 60,20 % | no disponible en esta ficha |
| Variantes Qwen del estudio | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de los resultados numericos de las variantes Qwen ni de las demas rutas de decision, por lo que no es posible completar una comparativa cuantitativa mas alla de la referencia nativa de Laya. Tampoco se identifican modelos publicos comparables fuera del estudio, dado el caracter especializado de la tarea.

## Limitaciones y advertencias

- El modelo solo soporta ingles; no se ha validado su comportamiento en otros idiomas.
- Esta especializado en una unica tarea de clasificacion de opciones financieras y no genera texto libre, por lo que no debe emplearse como modelo conversacional o de proposito general.
- El F1 macro por pregunta (34,85 %) es muy inferior a la exactitud (72,69 %), lo que indica un rendimiento desigual entre clases candidatas y riesgo de sesgo hacia opciones mayoritarias en menus desequilibrados.
- No se documentan analisis de sesgo demografico, geografico o socioeconomico, pese a trabajar con estados de hogar y datos de encuesta; los sesgos de los datos originales pueden propagarse a las decisiones.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si existe riesgo de predicciones erroneas con apariencia de validez al elegir siempre una opcion del menu.
- La licencia S²-MAS Controlled Model Research License v1.2 prohibe el uso comercial, la redistribucion y la ingenieria inversa, extraccion o destilacion no autorizadas; los registros de entrenamiento y evaluacion no se distribuyen y el acceso a los datos fuente requiere autorizacion del proveedor.
- El motor GENESE/MAS del proyecto permanece privado, lo que limita la reproducibilidad completa del entorno de simulacion.
- No se dispone de informacion sobre la longitud de contexto soportada, lo que impide garantizar el comportamiento con estados de hogar o menus de candidatos muy extensos.
- El checkpoint fue seleccionado sobre un conjunto de desarrollo antes del test, pero no se documentan intervalos de confianza para el F1 macro a nivel de clase individual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ya9919/YN-421m-sft-50k
- Licencia: https://huggingface.co/ya9919/YN-421m-sft-50k/blob/main/LICENSE
- Ejemplos de QA en JSON: https://huggingface.co/ya9919/YN-421m-sft-50k/blob/main/qa_examples.json
- Repositorio del proyecto S²-MAS: https://github.com/KataDavidXD/s2-mas
- Paper S²-MAS: https://github.com/KataDavidXD/s2-mas/blob/main/paper/S2_MAS_Paper.pdf
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- Encoder subyacente ModernBERT-large: https://huggingface.co/answerdotai/ModernBERT-large
- Contacto para permisos: yli9919@hku.hk
