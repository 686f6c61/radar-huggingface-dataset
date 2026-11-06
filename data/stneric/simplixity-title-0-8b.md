# stneric/simplixity-title-0.8b

## Resumen

simplixity-title-0.8b es un ajuste fino (LoRA fusionado) del modelo Qwen3.5-0.8B de Alibaba, desarrollado por stneric para una tarea muy concreta: generar titulos de conversacion de como maximo seis palabras en ingles a partir del primer mensaje de un chat, en ingles o aleman. Forma parte de Simplixity, un asistente de investigacion autoalojado, y sustituye al modelo base en esa funcion de interfaz. Con 873 millones de parametros, es un modelo pequeno orientado a una unica tarea de generacion de texto corto.

El modelo no pretende ser un asistente general: se entrena exclusivamente con un unico prompt de sistema y responde solo con el titulo, sin comillas, sin puntuacion final y sin responder a la pregunta del usuario. Su relevancia practica esta en que reduce drasticamente los fallos de formato respecto al modelo base (del 35% al 95% de cumplimiento de todas las reglas en la evaluacion del autor) y elimina por completo la tendencia del modelo base a contestar la pregunta en lugar de nombrarla (del 22% al 0%).

La arquitectura subyacente es la de Qwen3.5-0.8B, un transformer multimodal (image-text-to-text) con torre de vision, que en este ajuste se mantiene intacta y sin cambios. El ajuste se realizo con LoRA de rango 16 sobre todas las capas y se exporto de vuelta al formato estandar de Qwen3.5. La licencia es Apache 2.0, igual que la del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en Qwen3.5-0.8B, con torre de vision sin modificar |
| Parametros totales | 873.438.784 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de Qwen3.5-0.8B; no se especifica en la informacion) |
| Tipos de cuantizacion | GGUF Q8_0 y Q4_K_M (publicados en el repo GGUF); pesos originales en safetensors |
| Idiomas soportados | Ingles y aleman (entrada); salida siempre en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (layout estandar de Qwen3.5) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer multimodal con torre de vision. El ajuste se aplico mediante LoRA de rango 16 en todas las capas, con la perdida calculada unicamente sobre el titulo generado, batch 1 con acumulacion de gradiente 8, tasa de aprendizaje 2e-5 y la libreria mlx-lm 0.32. El entrenamiento se detuvo a las 0.84 epocas (checkpoint 1.500 de 3.562) por cuelgues repetidos de la GPU en un Mac, por lo que el autor indica que un entrenamiento mas largo podria mejorar los resultados.

Los datos de entrenamiento son 2.057 primeros mensajes sinteticos con sus titulos, generados por Claude Haiku 5.5 a traves del prompt de titulos de Simplixity. Los titulos que incumplian alguna regla se reenviaron una vez a Haiku indicando la regla incumplida; 1.874 pasaron todas las comprobaciones y se repartieron en `training/train.jsonl` (1.781) y `training/valid.jsonl` (93), en formato de chat `{"messages": [...]}`. La fusion se realizo con `mlx_lm fuse`, pero el script `training/export_hf.py` copia los pesos lineales ajustados de vuelta al checkpoint original, de modo que los pesos publicados quedan en el layout estandar de Qwen3.5, incluida la torre de vision sin cambios.

## Capacidades

- Generacion de titulos de conversacion de como maximo seis palabras en ingles a partir del primer mensaje de un chat.
- Acepta entrada en ingles y aleman; la salida es siempre en ingles.
- Cumplimiento estricto de reglas de formato: sin comillas, sin puntuacion final, sin prefijos como "chat about" y sin responder a la pregunta.
- Cierra por si mismo el bloque de pensamiento vacio de Qwen, por lo que no es necesario desactivar el modo thinking.
- Capacidad multimodal heredada del modelo base (image-text-to-text con torre de vision), aunque el ajuste no la entrena ni la evalua.
- No soporta tool calling ni function calling de forma especifica; no esta disenado para razonamiento multi-paso ni para agentes.
- Capacidad multilingue limitada a en/de en la entrada y a en en la salida.

## Casos de uso

- Generacion automatica de titulos de chat en Simplixity: el modelo recibe el primer mensaje del usuario (recortado a 1.000 caracteres) y devuelve un titulo de hasta seis palabras para la interfaz; es su proposito original y el escenario para el que fue evaluado.
- Integracion en Ollama para asistentes autoalojados: el autor documenta la creacion del modelo con `ollama create simplixity-title:0.8b-v1-q8_0 -f Modelfile --quantize q8_0`, lo que permite desplegarlo en local sin infraestructura adicional.
- Etiquetado de conversaciones en herramientas de soporte o CRM: dado el primer mensaje de un cliente, genera una etiqueta corta y consistente en ingles para clasificar y organizar tickets.
- Nombrado de hilos en aplicaciones de chat multiusuario: el modelo produce titulos breves y sin formato adicional que encajan directamente en menus y listas de conversaciones.
- Procesamiento por lotes de historiales de conversacion: al ser un modelo de 0.8B con latencia mediana de 0.32 s por titulo en un M3 Pro, permite renombrar grandes volumenes de conversaciones archivadas de forma economica.
- Despliegue en maquinas de bajos recursos: la cuantizacion Q4_K_M produce un modelo de 728 MB, adecuado para equipos pequenos segun el autor, a costa de una ligera perdida de disciplina en la longitud del titulo.
- Normalizacion de titulos en ingles a partir de conversaciones en aleman: el modelo traduce el tema al ingles como texto de interfaz, manteniendo la respuesta al usuario en su idioma original.

## Benchmarks y rendimiento

Evaluacion del autor sobre 60 primeros mensajes (30 en aleman y 30 en ingles), tres ejecuciones cada uno, enviados como lo hace Simplixity:

| Metrica | Qwen3.5-0.8B | Este modelo, Ollama Q8_0 | Este modelo, Ollama Q4_K_M |
|---|---|---|---|
| Todas las reglas de formato (seis palabras, ingles, sin comillas, sin puntuacion final) | 35% | 95% | 87% |
| Termino clave del mensaje nombrado | 82% | 89% | 91% |
| Utilizable, ordenado a mano | 35% | 75% | no ordenado |
| Responde a la pregunta en lugar de nombrarla | 22% | 0% | no ordenado |
| Mediana por titulo (M3 Pro) | 0.14 s | 0.32 s | 0.30 s |

Segun el autor, todos los fallos de formato son titulos de siete palabras. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8 GB en precision original (tamano del repo en safetensors); unos 0,9 GB en Q8_0 y 728 MB en Q4_K_M segun el autor.
- GPU recomendadas: no se especifican en la informacion; el autor midio latencia en un Apple M3 Pro. Por tamano, cabe en cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4060, RTX 4090) y en equipos Apple Silicon.
- Cabe en GPU consumer: si, con amplio margen, incluso en las cuantizaciones mas pequenas.
- Opciones de despliegue: Ollama (documentado por el autor), llama.cpp y LM Studio mediante los GGUF del repo `simplixity-title-0.8b-GGUF`, y transformers con los pesos safetensors.
- Latencia y throughput: mediana de 0.32 s por titulo con Q8_0 y 0.30 s con Q4_K_M en un M3 Pro; el modelo base tarda 0.14 s. No se dispone de datos de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| simplixity-title-0.8b | 873 M | No disponible | Titulos de chat (en/de a en) | Apache 2.0 | Hugging Face y GGUF |
| Qwen3.5-0.8B (base) | 0.8 B | No disponible | Asistente general multimodal | Apache 2.0 | Hugging Face |
| Modelos de titulado genericos (LLM generalistas) | Variable | Variable | Titulado mediante prompt | Variable | Variable |

Frente al modelo base, este ajuste mejora el cumplimiento de formato del 35% al 95% y elimina las respuestas a la pregunta (del 22% al 0%), a costa de duplicar aproximadamente la latencia por titulo (0.32 s frente a 0.14 s). No se dispone en la informacion de comparaciones con otros modelos especificos de generacion de titulos.

## Limitaciones y advertencias

- Las palabras alemanas que el modelo de 0.8B no conoce salen mal: "Rente" se convierte en "Rental", "Süßstoff" en "Sugar" y "Siebträgermaschine" en "Sieve Jar Machine".
- Aproximadamente uno de cada cinco mensajes en aleman recibe un titulo en aleman en lugar de en ingles.
- El entrenamiento se detuvo a las 0.84 epocas por cuelgues de GPU; un entrenamiento mas largo podria mejorar los resultados.
- Todos los fallos de formato observados son titulos de siete palabras, es decir, incumplimientos de la regla de longitud maxima.
- El modelo esta disenado para un unico prompt de sistema; usarlo con otras instrucciones puede degradar el comportamiento.
- La cuantizacion Q4_K_M reduce la disciplina de longitud (87% de cumplimiento de formato frente al 95% de Q8_0).
- No es un asistente general: no soporta tool calling, agentes ni razonamiento multi-paso, y no se han evaluado sus capacidades multimodales heredadas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B impone sus propias condiciones, que deben verificarse.
- Riesgo de alucinacion en terminos desconocidos, especialmente en aleman, como muestran los ejemplos del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stneric/simplixity-title-0.8b
- GGUF para LM Studio y llama.cpp: https://huggingface.co/stneric/simplixity-title-0.8b-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de Simplixity: https://github.com/stneric/simplixity
- Documentacion de la evaluacion del modelo de titulos: https://github.com/stneric/simplixity/blob/main/docs/eval/title-model.md
