# vansh35333/ttravel-qwen3.5-2b-gguf

## Resumen

tTravel Qwen3.5-2B (GGUF, IQ4_XS) es un ajuste fino mediante LoRA del modelo base Qwen/Qwen3.5-2B, desarrollado por el usuario vansh35333 para su uso interno en tTravel, una aplicación móvil de diario de viaje que ejecuta inferencia local en el teléfono a través de llama.cpp (llama.rn). El modelo no está concebido como un asistente conversacional general, sino como el motor de dos tareas muy acotadas dentro de la aplicación: la conversión de mensajes de chat en acciones JSON estructuradas y la actuación como agente de viaje con llamadas a herramientas.

El modelo resuelve un problema de despliegue en dispositivo: con 1.881.825.088 parámetros (aproximadamente 1,9 mil millones) y una cuantización IQ4_XS de 1,20 GB, cabe en la memoria de un teléfono moderno y funciona sin conexión. Está afinado específicamente para el esquema JSON y el prompt de la aplicación, con soporte para inglés e hinglish (mezcla de hindi e inglés), y declina peticiones fuera de ámbito, inapropiadas o intentos de manipulación de reglas.

La relevancia actual radica en su enfoque de entrenamiento sin dependencia de modelos en la nube: los aproximadamente 8.600 ejemplos de entrenamiento se generaron localmente, y el ajuste se realizó con LoRA sobre las capas lineales, fusionando los adaptadores y cuantizando posteriormente con llama.cpp. La licencia es Apache 2.0, la misma que el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-2B), ajuste fino con LoRA |
| Parametros totales | 1.881.825.088 (aproximadamente 1,9 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (longitud maxima de entrenamiento: 2.048 tokens) |
| Tipos de cuantizacion | IQ4_XS (unico archivo publicado) |
| Idiomas soportados | Ingles (en), hinglish (hi) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B, un transformer de aproximadamente 1,9 mil millones de parámetros, y se ajusta mediante LoRA con rango 32, alpha 32, aplicado a todas las capas lineales, en precisión bf16, con tasa de aprendizaje 2e-4 y programación coseno, durante 2 épocas, con tamaño de lote efectivo 16, longitud máxima de 2.048 tokens y cálculo de pérdida únicamente sobre las respuestas. Los adaptadores se fusionaron con el modelo base, se convirtieron con llama.cpp v0.8.0 y se cuantizaron a IQ4_XS.

El conjunto de entrenamiento consta de aproximadamente 8.600 ejemplos generados íntegramente de forma local, sin modelos de pago ni en la nube: 4.750 frases de plantilla con etiquetas generadas por código; alrededor de 3.500 paráfrasis redactadas por un Qwen3.8-27B local y conservadas solo si todos los importes, nombres, códigos y fechas se mantenían intactos; y ejecuciones de agente destiladas de Qwen3-4B sobre resultados en vivo de Wikidata, Wikipedia y Wikivoyage, conservadas solo cuando cada razón estaba respaldada por los datos web. El modelo incorpora un mecanismo de gramática JSON-schema para forzar la salida estructurada en la tarea de conversión de mensajes en acciones.

## Capacidades

- Conversión de mensajes de chat en una única acción JSON estructurada: gasto, reserva, edición, borrado, consulta de gasto, hecho recordado, petición de sugerencia o respuesta breve.
- Soporte de inglés y hinglish en la misma tarea de extracción de acciones (por ejemplo, "dinner 3k with Raghav" o "priya ke saath chai pakode 180").
- Función de agente de viaje con llamadas a herramientas: `search_places` y `get_weather`.
- Generación de recomendaciones de hasta tres lugares copiados exactamente de los resultados de búsqueda, con razones breves extraídas de esos datos.
- Rechazo de peticiones fuera de ámbito, inapropiadas o intentos de manipulación de reglas con una respuesta única de ámbito de viaje.
- Derivación de emergencias y autolesiones a los servicios de emergencia.
- Salida estructurada bajo gramática JSON-schema.
- No es un modelo de chat general: su comportamiento fuera del prompt y esquema de la aplicación no está probado.

## Casos de uso

- Registro de gastos de viaje por lenguaje natural: el usuario escribe "dinner 3k with Raghav" o "priya ke saath chai pakode 180" y el modelo devuelve un JSON de acción de gasto con importe, concepto y personas, que la aplicación persiste en su base de datos local.
- Gestión de reservas y ediciones dentro de la aplicación: el modelo distingue entre crear, editar y borrar una entrada a partir de un mensaje conversacional, lo que permite una interfaz de diario por chat sin formularios.
- Consultas de gasto agregado: el usuario pregunta cuánto ha gastado y el modelo emite una acción de consulta de gasto que la aplicación resuelve con sus propios datos.
- Recomendación de lugares con datos reales: el modelo invoca `search_places`, recibe resultados y devuelve hasta tres lugares copiados exactamente de esos resultados con razones respaldadas por los datos web, evitando inventar información sobre sitios.
- Consulta meteorológica durante el viaje: mediante la herramienta `get_weather`, el modelo integra el pronóstico en la respuesta al usuario dentro del flujo de la aplicación.
- Moderación y seguridad en el chat de la aplicación: el modelo declina peticiones fuera de ámbito, inapropiadas o intentos de manipulación de reglas, y redirige emergencias y autolesiones a los servicios de emergencia.
- Funcionamiento completamente offline en el teléfono: al ejecutarse con llama.cpp (llama.rn) y ocupar 1,20 GB, permite usar el asistente de viaje sin conexión ni costes de API.

## Benchmarks y rendimiento

Los resultados publicados por el autor corresponden a pruebas etiquetadas a mano, ninguna de cuyas líneas está en los datos de entrenamiento. La línea base es Qwen3-4B-Instruct-2507 sin ajustar en Q4_K_M (2,50 GB).

| Prueba | Este modelo (1,20 GB) | Qwen3-4B (2,50 GB) |
|---|---|---|
| Acciones de chat, 61 líneas | 97% | 95% |
| Prueba grande de chat, 218 líneas en 17 categorías | 87% | 67% |
| Fuera de ámbito / inapropiado / manipulación de reglas | 11/14, 9/10, 8/8 | 0/14, 1/10, 0/8 |
| Emergencia / autolesión | 5/5, 2/3 | 0/5, 1/3 |
| Agente, 12 escenarios con fixtures guardados | 12/12, todas las puertas | 12/12, todas las puertas |
| Compañero de viaje de extremo a extremo, 36 preguntas, web en vivo | 24–25/36 | 14/36 |

Las puntuaciones son idénticas en llama.cpp v0.8.0, el commit que empaqueta llama.rn 0.13.0-rc.9. La velocidad en teléfono no se ha medido todavía.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,20 GB para el archivo IQ4_XS, más la memoria del contexto y del runtime de llama.cpp.
- GPU recomendadas: no se especifican; el modelo está diseñado para ejecución en CPU de teléfono mediante llama.cpp (llama.rn).
- Cabe en GPU de consumo: sí, con holgura, dado su tamaño de 1,20 GB; cualquier GPU con al menos 2 GB de memoria libre puede alojarlo.
- Opciones de despliegue: llama.cpp (versión v0.8.0 o compatible), llama.rn 0.13.0-rc.9 para aplicaciones móviles; otros runtimes compatibles con GGUF no están documentados por el autor.
- Latencia y throughput: no medidos en teléfono según el autor; no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Enfoque |
|---|---|---|---|---|---|
| tTravel Qwen3.5-2B | 1,9 mil millones | No disponible (entrenamiento a 2.048) | IQ4_XS (1,20 GB) | Apache 2.0 | Ajuste para acciones JSON y agente de viaje en app móvil |
| Qwen3-4B-Instruct-2507 | 4 mil millones | No disponible | Q4_K_M (2,50 GB) | No disponible en la información | Chat general; usado como línea base en las pruebas del autor |
| Qwen/Qwen3.5-2B | 1,9 mil millones | No disponible | No disponible | Apache 2.0 | Modelo base sin ajustar |

La comparación directa disponible se limita a la línea base Qwen3-4B-Instruct-2507 en Q4_K_M, sobre la que tTravel obtiene mejores resultados en la prueba grande de chat (87% frente a 67%), en moderación y en el test de extremo a extremo con web en vivo (24–25/36 frente a 14/36), con la mitad de tamaño. No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo conoce el prompt y las acciones de la aplicación tTravel; otros prompts producen resultados no probados.
- Los hechos sobre lugares deben proceder de las herramientas, no del modelo; la aplicación verifica cada razón contra los datos web del lugar antes de mostrarla.
- Los nombres de días de la semana y las horas exactas los resuelve el código de la aplicación, no el modelo.
- El modelo está entrenado únicamente en inglés y hinglish; no hay soporte documentado de castellano ni de otros idiomas.
- La longitud máxima de entrenamiento es de 2.048 tokens; el contexto efectivo de inferencia no está documentado.
- No se han medido la latencia ni el rendimiento en teléfono, por lo que no hay garantías publicadas sobre velocidad en dispositivo.
- Riesgo de alucinación en datos factuales si se usa fuera del flujo con herramientas; el diseño de la aplicación mitiga este riesgo mediante verificación externa.
- Sesgos conocidos: no documentados por el autor.
- Licencia Apache 2.0, que permite uso comercial; se trata de una versión modificada de Qwen3.5-2B del equipo Qwen (Alibaba Cloud), y debe conservarse el archivo LICENSE correspondiente.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción nula fuera de la aplicación original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vansh35333/ttravel-qwen3.5-2b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- llama.cpp: no disponible en la información proporcionada
- llama.rn: no disponible en la información proporcionada
- Paper, blog o demo: no disponible en la información proporcionada
