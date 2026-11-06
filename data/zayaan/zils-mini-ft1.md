# Zayaan/zils-mini-ft1

## Resumen

zils-mini-ft1 es un ajuste fino (fine-tuning) de tipo LoRA sobre el modelo 1lock/zils-mini-astrid-m1, que a su vez se apoya en el chasis de Qwen3.5-4B. Lo desarrolla el usuario Zayaan dentro del ecosistema Zils, un proyecto orientado a entrenar modelos pequenos para la toma de decisiones automatizada (clasificacion de peticiones, deteccion de problemas, puntuacion de coincidencias) a partir de ejemplos con respuesta correcta. El modelo se publica como un "soup-pool body" de la subred 127 de Bittensor, es decir, una variante pensada para ser evaluada por validadores sobre un chasis fijo que aporta la capa de respuesta, el prompt y el runtime.

El modelo tiene 4.539.265.536 parametros en formato BF16 (safetensors), con un repositorio de 9,1 GB. No es un modelo conversacional generalista: es un cuerpo de decision que recibe un item con formato de examen y debe emitir una respuesta verificable. La relevancia actual reside en su enfoque metodologico: un ajuste muy acotado (solo 152 proyecciones de lenguaje mediante LoRA de rango 32) sobre un modelo base de 4B, evaluado con una metrica de calibracion probabilistica (Brier skill) en lugar de exactitud bruta.

La informacion disponible es limitada: la model card no detalla la longitud de contexto, los idiomas soportados ni resultados de benchmarks estandar (MMLU, HumanEval, GSM8K). Todos esos datos se marcan como no disponibles en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (chasis Qwen3.5-4B con tensores de lenguaje y vision, BF16) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de 1lock/zils-mini-astrid-m1, colocado sobre el chasis fijo de Zils mediante el constructor `zils.soup.build`, que es el mismo procedimiento con el que los validadores puntuan un unico cuerpo. Sobre esa base se aplico una epoca de LoRA con rango 32, alpha 64 y tasa de aprendizaje 5e-5, limitada a las 152 proyecciones de lenguaje del runtime Zils d3 con su lectura de respuesta fija (`zils.teacher train --start`). La actualizacion se fusiono en los pesos en BF16. No se entreno ningun otro tensor, lo que convierte el ajuste en una intervencion muy localizada sobre la capa de lenguaje del chasis.

Los datos de entrenamiento consisten en 4.992 items de decision con formato de examen, generados por Claude Opus 5.5 con la receta de autoria de examenes de Zils (`scripts/author_exam.py`): se toma una fila publica como ejemplo de estilo, se produce una respuesta ciega e independiente y el item se conserva solo si ambas coinciden. Se usaron exclusivamente splits publicos de entrenamiento: 2.974 items de 15 familias conocidas (Social IQa, PIQA, SVAMP, GSM8K, GLUE MNLI/RTE/QNLI/STS-B, Crisscrossed Captions en validacion, 20 Newsgroups, Glaive function calling v2, dair-ai/emotion, News Headlines Dataset for Sarcasm Detection y TweetEval sentiment) y 2.018 items de 99 tareas de entrenamiento de BIG-bench (`tasksource/bigbench`) y Glaive function calling. No se emplearon items del examen de validadores, ni semillas publicas, ni datos de clientes.

## Capacidades

- Clasificacion y decision sobre items con formato de examen: el modelo emite una respuesta seleccionada entre las opciones del item, con una lectura de respuesta fija impuesta por el chasis.
- Razonamiento de sentido comun y fisico: entrenado con Social IQa y PIQA.
- Razonamiento aritmetico y matematico basico: entrenado con SVAMP y GSM8K.
- Inferencia de lenguaje natural: entrenado con GLUE MNLI, RTE, QNLI y STS-B.
- Clasificacion de sentimiento y emociones: TweetEval sentiment y dair-ai/emotion.
- Deteccion de sarcasmo: News Headlines Dataset for Sarcasm Detection.
- Categorizacion tematica de documentos: 20 Newsgroups.
- Function calling: entrenado con Glaive function calling v2.
- Cobertura de tareas diversas: 99 tareas de BIG-bench en el conjunto de entrenamiento.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision o audio: no disponibles como capacidades declaradas; el chasis incorpora tensores de vision de Qwen3.5-4B, pero la model card no describe su uso.

## Casos de uso

- Clasificacion de peticiones entrantes en soporte: el modelo puede asignar una peticion a una categoria predefinida (facturacion, incidencia tecnica, reclamacion) si se formula como un item de decision con opciones, aprovechando su entrenamiento en 20 Newsgroups y GLUE.
- Triaje de incidencias en produccion: dado un mensaje de error o una alerta, seleccionar la etiqueta de severidad o el equipo responsable, con una puntuacion de confianza calibrada (Brier skill) que permite fijar umbrales de escalado.
- Deteccion de sentimiento y tono en resenas: usar el ajuste sobre TweetEval sentiment y dair-ai/emotion para enrutar resenas negativas a un flujo de recuperacion o para monitorizar la percepcion de producto.
- Deteccion de sarcasmo en redes sociales: filtrar comentarios ironicos antes de pasarlos a un analisis de sentimiento convencional, evitando clasificaciones erroneas.
- Seleccion de herramienta en un agente: con Glaive function calling v2 en el entrenamiento, el modelo puede elegir la funcion adecuada entre un conjunto de herramientas descritas en el prompt.
- Validacion de respuestas en pipelines de QA: dado un par pregunta-respuesta candidata y varias opciones, puntuar cual es la correcta, util como filtro previo a un modelo mayor.
- Evaluacion comparativa de cuerpos en la subred 127 de Bittensor: servir como cuerpo candidato en el pool y medirse contra el chasis fijo con la metrica calibrada de los validadores.

## Benchmarks y rendimiento

La model card reporta una evaluacion local sobre 1.191 items retenidos, puntuada con el Brier skill calibrado de los validadores (`soup_grade.evaluate`, media de cinco particiones de calibracion). No son puntuaciones del examen privado de los validadores.

| Conjunto | Start (astrid-m1) | zils-mini-ft1 |
|---|---:|---:|
| Todos los 1.191 items | 71,96 | 74,65 |
| Semillas publicas como bloque conocido, tareas retenidas como bloque nuevo | 72,33 | 74,60 |

Los 1.191 items incluyen 892 escritos con la misma receta a partir de filas nunca usadas en entrenamiento (con 15 tareas de BIG-bench excluidas del entrenamiento) y los 299 items de las familias actuales de `zils-ai/base-exam-seed-v1` a `-v4`. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda un minimo de 12-16 GB para contexto corto.
- VRAM estimada en cuantizacion de 8 bits: en torno a 4,5-5 GB de pesos; en 4 bits, en torno a 2,5-3 GB, aunque no se han publicado pesos cuantizados oficiales.
- GPU recomendadas: A100 (40/80 GB) o H100 para lotes grandes y maxima velocidad; RTX 4090 (24 GB) para BF16 con margen; RTX 3090 (24 GB) y RTX 4080 (16 GB) como alternativas de consumo.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB o mas en BF16; en 8-12 GB requeriria cuantizacion, no publicada oficialmente.
- Opciones de despliegue: el modelo depende del runtime Zils d3 y de su capa de respuesta fija, por lo que la inferencia estandar con vLLM, TGI o llama.cpp no esta documentada. El repositorio contiene solo pesos, sin codigo de runtime.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zils-mini-ft1 | 4,54B | no disponible | Ajuste LoRA para decision sobre chasis Zils | Apache-2.0 | Hugging Face (0 descargas) |
| 1lock/zils-mini-astrid-m1 | no disponible | no disponible | Cuerpo base del pool Zils | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-4B | ~4B | no disponible | LLM generalista con vision | no disponible en la informacion | Hugging Face |

La comparacion con modelos generalistas de ~4B (Qwen, Llama, Gemma) no es directa: zils-mini-ft1 no esta disenado para generacion abierta sino para emitir decisiones sobre items con opciones, y su evaluacion se realiza con una metrica de calibracion propia del ecosistema Zils. No se dispone de datos de rendimiento cruzados con esos modelos.

## Limitaciones y advertencias

- El modelo es un cuerpo de decision, no un asistente conversacional: fuera del formato de examen y del chasis Zils su comportamiento no esta garantizado.
- Requiere el runtime Zils d3 y la capa de respuesta fija; el repositorio solo contiene pesos, sin codigo de inferencia.
- La evaluacion reportada es local y no equivale al examen privado de los validadores, cuyas puntuaciones diferiran.
- El conjunto de entrenamiento fue generado por Claude Opus 5.5, lo que puede introducir sesgos de estilo y de distribucion del modelo profesor.
- Riesgo de alucinacion no cuantificado: no se han publicado tasas de error fuera de la metrica Brier skill.
- Cobertura limitada a las 15 familias conocidas y 99 tareas de BIG-bench; el rendimiento en dominios fuera de esa distribucion es desconocido.
- Idiomas soportados no declarados; no se recomienda su uso en produccion multilingue sin evaluacion previa.
- Con 0 descargas y 0 likes, no hay evidencia de uso en produccion ni validacion independiente por terceros.
- Aunque la licencia es Apache-2.0, los datos de origen (BIG-bench, tasksource, Glaive, GLUE, etc.) tienen sus propios terminos que deben verificarse antes de reutilizar el modelo con fines comerciales.
- El modelo no incluye texto de entrenamiento en el repositorio, lo que limita la auditoria de sesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zayaan/zils-mini-ft1
- Modelo base: https://huggingface.co/1lock/zils-mini-astrid-m1
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.5-4B
- Organizacion Zils en Hugging Face: https://huggingface.co/zils-ai/models
- Sitio web de Zils: https://zils.ai/
- BIG-bench (Srivastava et al., 2022): no disponible en la informacion proporcionada
- tasksource (Sileo, 2024): no disponible en la informacion proporcionada
