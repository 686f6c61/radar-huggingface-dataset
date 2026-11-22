# vansh35333/ttravel-qwen3.5-2b-gguf

## Resumen

tTravel Qwen3.5-2B es un ajuste fino por LoRA del modelo base Qwen/Qwen3.5-2B (1.881.825.088 parametros), desarrollado por el usuario vansh35333 para la aplicacion movil tTravel, un diario de viaje que ejecuta su IA en el propio telefono mediante llama.cpp (llama.rn). El modelo no pretende ser un asistente conversacional general: esta especializado en dos tareas muy acotadas dentro de la app, la conversion de mensajes de chat en acciones JSON (gastos, reservas, ediciones, consultas de gasto, hechos recordados, peticiones de sugerencia o respuestas cortas) bajo una gramatica de esquema JSON, y la actuacion como agente de viaje con herramientas `search_places` y `get_weather`.

La relevancia de esta ficha es doble. Por un lado, demuestra que un modelo de menos de 2.000 millones de parametros, cuantizado a 4 bits (IQ4_XS, 1.201.860.256 bytes), puede superar en tareas verticales a modelos notablemente mayores como Qwen3-4B-Instruct-2507 en Q4_K_M (2.50 GB). Por otro, es un ejemplo de pipeline de destilacion y generacion de datos sinteticos completamente local, sin modelos de pago ni servicios en la nube, lo que lo convierte en una referencia practica para quien quiera construir asistentes on-device.

El modelo se distribuye unicamente en formato GGUF para llama.cpp, con licencia Apache 2.0 y soporte declarado de ingles e hinglish (hindi romanizado). Su tamano de repositorio es de 2.4 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-2B), ajuste fino por LoRA |
| Parametros totales | 1.881.825.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con max length 2.048) |
| Tipos de cuantizacion | IQ4_XS (unico archivo publicado) |
| Idiomas soportados | en, hi (hinglish) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del archivo | 1.201.860.256 bytes (md5 `734b5c38327db04b2ded7a3e1f9331ea`) |
| Modelo base | Qwen/Qwen3.5-2B |
| Metodo de ajuste | LoRA (r 32, alpha 32, todas las capas lineales), bf16, lr 2e-4, cosine, 2 epocas, batch efectivo 16 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B, un transformer decoder-only de aproximadamente 1.880 millones de parametros, y se ajusta con LoRA de rango 32 y alpha 32 aplicado a todas las capas lineales, en bf16, con learning rate 2e-4 y scheduler cosine durante 2 epocas, batch efectivo 16 y longitud maxima de 2.048 tokens. La perdida se calcula unicamente sobre las respuestas. Los adaptadores se fusionan con el modelo base, se convierten con llama.cpp v0.8.0 y se cuantizan a IQ4_XS.

El conjunto de entrenamiento consta de unos 8.600 ejemplos generados localmente sin modelos de pago ni en la nube: 4.750 frases de plantilla con etiquetas generadas por codigo; aproximadamente 3.500 parafrasis escritas por un Qwen3.8-27B local, conservadas solo si todos los importes, nombres, codigos y fechas sobrevivian intactos; y ejecuciones de agente destiladas de Qwen3-4B sobre resultados en vivo de Wikidata, Wikipedia y Wikivoyage, retenidas solo cuando cada razon estaba respaldada por los datos web. No se documenta uso de RLHF ni DPO.

La innovacion principal no es arquitectonica sino de proceso: la generacion de datos sinteticos con verificacion automatica (filtrado por preservacion de entidades y por respaldo web de cada razon) permite obtener un modelo de 1,2 GB con un rendimiento en tareas verticales superior al de un modelo del doble de tamano.

## Capacidades

- Conversion de mensajes de chat en una unica accion JSON bajo gramatica de esquema: gasto, reserva, edicion, borrado, consulta de gasto, hecho recordado, peticion de sugerencia o respuesta corta.
- Comprension de ingles y hinglish en la misma tarea ("dinner 3k with Raghav", "priya ke saath chai pakode 180").
- Function calling con las herramientas `search_places` y `get_weather`.
- Razonamiento multi-paso de agente: llamada a herramientas, seleccion de hasta tres lugares copiados exactamente de los resultados de busqueda y redaccion de razones cortas basadas en esos datos.
- Rechazo de peticiones fuera de tema, inapropiadas o intentos de anulacion de reglas con una unica respuesta de alcance de viaje.
- Derivacion de emergencias y autolesiones a los servicios de emergencia.
- No dispone de modo thinking, vision ni audio documentados.

## Casos de uso

- Registro de gastos por lenguaje natural en una app de viaje: el modelo transforma "cena 3k con Raghav" en un objeto JSON de gasto con importe, categoria y acompanante, validado por la gramatica de esquema, lo que elimina el parseo de texto libre en el cliente.
- Reservas y ediciones conversacionales: el usuario dicta o escribe una reserva y el modelo emite la accion JSON correspondiente (crear, editar o borrar), que la app aplica directamente sobre su base de datos local.
- Consultas de gasto agregado: preguntas como cuanto se ha gastado en un viaje se traducen a una accion de consulta que la app resuelve con su propio codigo, sin que el modelo tenga que calcular cifras.
- Agente de recomendacion de lugares offline: con acceso a `search_places`, el modelo selecciona hasta tres lugares copiados literalmente de los resultados y anade razones respaldadas por esos datos, util para un diario de viaje sin conexion.
- Consulta meteorologica integrada: mediante `get_weather`, el modelo responde a preguntas sobre el tiempo en el destino dentro del flujo de planificacion del viaje.
- Moderacion y seguridad en el chat de la app: el modelo declina peticiones fuera de alcance, inapropiadas o intentos de manipular sus reglas, y redirige emergencias a los servicios correspondientes, reduciendo la necesidad de un clasificador adicional.
- Extraccion de hechos recordados: a partir de una frase del usuario, el modelo emite una accion de "hecho recordado" que la app persiste para personalizar sugerencias posteriores.
- Prototipado de asistentes on-device: sirve como referencia de pipeline completo (generacion de datos local, LoRA, fusion, conversion a GGUF y cuantizacion IQ4_XS) para equipos que quieran replicar el enfoque en otro dominio vertical.

## Benchmarks y rendimiento

Los resultados publicados por el autor son pruebas etiquetadas a mano, ninguna de cuyas lineas aparece en los datos de entrenamiento. La linea base es Qwen3-4B-Instruct-2507 sin ajustar en Q4_K_M (2.50 GB).

| Prueba | Este modelo (1.20 GB) | Qwen3-4B (2.50 GB) |
|---|---|---|
| Acciones de chat, 61 lineas | 97% | 95% |
| Test grande de chat, 218 lineas en 17 categorias | 87% | 67% |
| Fuera de tema / inapropiado / anulacion de reglas | 11/14, 9/10, 8/8 | 0/14, 1/10, 0/8 |
| Emergencia / autolesion | 5/5, 2/3 | 0/5, 1/3 |
| Agente, 12 escenarios con fixtures guardados | 12/12, todas las puertas | 12/12, todas las puertas |
| Travel buddy de extremo a extremo, 36 preguntas, web en vivo | 24-25/36 | 14/36 |

Las puntuaciones son identicas en llama.cpp v0.8.0, el commit que empaqueta llama.rn 0.13.0-rc.9. La velocidad en telefono no se ha medido. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2-1,5 GB con la cuantizacion IQ4_XS publicada, mas overhead de contexto y de la gramatica JSON.
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas de VRAM libre; el modelo esta pensado para ejecucion en CPU de telefono mediante llama.cpp, por lo que una RTX 4090, A100 o H100 estan sobredimensionadas para su uso previsto.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090) y en telefonos de gama media-alta via llama.rn.
- Opciones de despliegue: llama.cpp v0.8.0 (version de referencia), llama.rn 0.13.0-rc.9 para React Native, y cualquier runtime compatible con GGUF. No se documenta soporte especifico de vLLM ni TGI para este archivo.
- Latencia y throughput: no medidos; el autor indica explicitamente que la velocidad en telefono no se ha medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Notas |
|---|---|---|---|---|---|
| tTravel Qwen3.5-2B (este) | 1.881.825.088 | no disponible (entrenado a 2.048) | GGUF IQ4_XS, 1,20 GB | Apache 2.0 | Especializado en acciones JSON y agente de viaje; 87% en test de 218 lineas |
| Qwen3-4B-Instruct-2507 Q4_K_M | ~4.000 millones | no disponible | GGUF Q4_K_M, 2,50 GB | Apache 2.0 | Linea base del autor; 67% en el mismo test de 218 lineas |
| Qwen/Qwen3.5-2B (base) | 1.881.825.088 | no disponible | safetensors | Apache 2.0 | Modelo generalista sin ajuste; no evaluado en las pruebas del autor |

La comparativa directa solo esta disponible frente a Qwen3-4B-Instruct-2507 y frente al propio modelo base, que el autor no evalua en sus pruebas. No se dispone de datos frente a otros modelos especializados en function calling de tamano similar.

## Limitaciones y advertencias

- El modelo solo conoce el prompt y las acciones de la aplicacion tTravel; con otros prompts los resultados no estan probados y probablemente sean deficientes.
- Los hechos sobre lugares deben proceder de las herramientas, no del modelo; la app verifica ademas cada razon contra los datos web del lugar antes de mostrarla.
- Los nombres de dias de la semana y las horas exactas los resuelve el codigo de la app, no el modelo.
- Riesgo de alucinacion en cualquier uso fuera del esquema previsto; no es un modelo conversacional general.
- Sesgos conocidos: no documentados por el autor; al derivar de Qwen3.5-2B y de datos sinteticos generados localmente, hereda los sesgos del modelo base y los de las plantillas y parafrasis empleadas.
- Cobertura limitada a ingles e hinglish; no se declara soporte de castellano ni de otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el autor advierte de que se trata de una version modificada de Qwen3.5-2B de Alibaba Cloud y remite al archivo `LICENSE`.
- Solo se publica una cuantizacion (IQ4_XS); no hay variantes Q5, Q8 ni safetensors del ajuste.
- No se han medido latencia ni throughput en dispositivo, por lo que el rendimiento en produccion movil es desconocido.
- El modelo no debe usarse como sustituto de servicios de emergencia: solo redirige a ellos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vansh35333/ttravel-qwen3.5-2b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- llama.rn: https://github.com/mybigday/llama.rn
- Paper, blog o demo del ajuste: no disponible
