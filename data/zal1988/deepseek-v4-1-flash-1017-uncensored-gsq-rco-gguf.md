# ZAL1988/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF es una cuantizacion GGUF derivada de DeepSeek-V4.1-Flash-1017, el modelo insignia de DeepSeek con arquitectura de mezcla de expertos (MoE) de 763.000 millones de parametros y 384 expertos enrutados. El autor de esta version, ZAL1988, parte del backbone GSQ-RCO publicado por ISTA-DASLab y le aplica una edicion de "abliteration": proyecta fuera de los pesos la direccion de rechazo (refusal direction) de DeepSeek, de modo que el modelo deja de negarse a responder en practicamente cualquier tema. El resultado es un modelo sin censura que conserva el conocimiento y el razonamiento del original.

La modificacion es quirurgica: solo se reemplazan los tensores densos que escriben en el residual (salida de atencion, proyeccion descendente del experto compartido y proyeccion de valor del Engram). Los 384 expertos enrutados quedan intactos byte a byte, por lo que la precision de la cuantizacion GSQ se preserva y el tamano de cada fichero no cambia. Segun las mediciones del autor, la tasa de jailbreak exitoso cae del 85-89 % al 0 % en las tres variantes publicadas, mientras que MMLU, GPQA-Diamond y AIME25 se mantienen dentro del ruido estadistico.

Es relevante ahora porque demuestra que es posible ejecutar un modelo de 763B en una sola GPU de 12 GB mediante el motor Strata: el backbone reside en memoria del sistema y la tabla Engram de 110 GB se transmite desde un SSD. La ficha cubre las tres cuantizaciones publicadas (IQ2_XXS, IQ2_XS e IQ1_M), todas con licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con expertos enrutados y experto compartido; incluye modulo Engram (tabla de lookup) |
| Parametros totales | 551.880.949.208 (~551,9B en safetensors); la model card del autor cita 763B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_XXS (2,0 bpw), IQ2_XS (2,25 bpw), IQ1_M (1,75 bpw); formato GSQ-RCO de ISTA-DASLab |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (shards de backbone) + fichero Engram separado de ~110 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 384 expertos enrutados y un experto compartido, segun la model card. La innovacion estructural destacable es el modulo Engram: una tabla de lookup de aproximadamente 110 GB que se consulta como una proyeccion de valor adicional (`engram_wkv`) y que se distribuye como fichero independiente del backbone. Esto permite separar el almacenamiento masivo de la parte densa del modelo y transmitir la tabla desde disco bajo demanda.

Sobre el entrenamiento original de DeepSeek-V4.1-Flash-1017 no se aporta informacion en los materiales disponibles (numero de tokens, composicion del dataset, uso de RLHF o DPO). La capa de cuantizacion GSQ-RCO, desarrollada por ISTA-DASLab, aplica un redondeo aprendido de baja precision a los expertos enrutados; el autor de esta ficha reemplaza unicamente los tensores densos que escriben en el residual, aplicando una edicion de direccion de rechazo con fuerza 2,0 en precision completa antes de cuantizarlos al tipo exacto por tensor de ISTA. La divergencia de distribucion respecto al cuantizado original es pequena (KL ~0,02-0,027, cota inferior top-64).

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat propia.
- Razonamiento de alta dificultad: GPQA-Diamond al 83,3 % y AIME25 al 80,0 % en la variante IQ2_XXS editada.
- Modo "thinking" con esfuerzo de razonamiento configurable (las mediciones usan effort 50).
- Conocimiento general medido en MMLU (80,6-82,8 % segun la variante).
- Respuestas sin rechazo en practicamente cualquier tema, incluyendo los que activarian negativas en el modelo original.
- Ejecucion en hardware de consumo mediante el motor Strata, con backbone en RAM y Engram en SSD.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y seguridad: permite estudiar como se comporta un modelo de gran escala cuando se elimina la direccion de rechazo, comparando las metricas de jailbreak y XSTest frente al cuantizado original con la misma infraestructura.
- Evaluacion de tecnicas de abliteration: sirve como caso de referencia para medir el coste real de la edicion en precision de tareas (MMLU, GPQA, AIME) y en divergencia KL, gracias a que los expertos enrutados se conservan intactos.
- Generacion creativa sin filtros: escritura de ficcion, guiones o narrativa que aborde temas sensibles sin que el modelo se niegue, manteniendo el razonamiento del modelo base.
- Despliegue local en estaciones de trabajo con GPU modesta: con 12 GB de VRAM y un SSD rapido para el Engram, se puede servir un modelo de 763B en entornos sin cluster, util para prototipado offline.
- Analisis de contenido y moderacion asistida: al no rechazar temas, puede clasificar o resumir material sensible (informes de abuso, contenido extremista) que otros modelos declinarian procesar.
- Experimentacion con cuantizaciones de muy baja precision: las variantes IQ1_M e IQ2_XXS permiten estudiar la degradacion de calidad a 1,75-2,0 bpw en un MoE de gran escala, con MMLU como referencia.
- Educacion e investigacion en modelos abiertos: el formato GGUF y la licencia MIT facilitan su uso en cursos y laboratorios sin restricciones de licencia comercial.

## Benchmarks y rendimiento

Datos publicados por el autor, comparando el cuantizado GSQ-RCO original con esta version editada, servidos ambos en Strata con las mismas plantillas:

| Rung | bpw | Total GB | JailbreakBench (EN) | XSTest (safe refused) | Thinking high (30) | MMLU (500) | KL vs original |
|---|---|---|---|---|---|---|---|
| IQ2_XXS | 2,0 | 249 | 85,2 % → 0,0 % | 7,6 % → 0,0 % | 27/30 → 0/30 | 82,8 % (p=0,27) | 0,0225 |
| IQ2_XS | 2,25 | 266 | 86,4 % → 0,0 % | 4,0 % → 0,4 % | 27/30 → 2/30 | 81,6 % (p=1,00) | 0,0272 |
| IQ1_M | 1,75 | 231 | 88,9 % → 0,0 % | 4,8 % → 0,0 % | 27/30 → 1/30 | 80,6 % (p=0,75) | 0,0207 |

Comparativa de razonamiento en la variante IQ2_XXS (Strata, effort 50):

| Benchmark | GSQ-RCO original | Sin censura (esta version) |
|---|---|---|
| GPQA-Diamond (198 preguntas) | 83,3 % | 83,3 % |
| AIME25 (30 preguntas) | 76,7 % | 80,0 % |

El autor advierte que no todas las variantes superaron todos los umbrales y que se publican tal como se midieron. Los registros por pregunta estan en el repositorio de metricas.

## Requisitos de hardware

- VRAM: aproximadamente 12 GB para el backbone, segun el autor; el Engram de ~110 GB se transmite desde SSD y no reside en VRAM.
- Almacenamiento: entre 231 y 266 GB por variante (segun rung) mas el fichero Engram compartido de ~110 GB, que debe estar en un SSD rapido.
- GPU: el autor indica que funciona en una unica GPU de 12 GB; no se especifican modelos concretos (RTX 4090, A100, H100) en la informacion disponible.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB de VRAM o mas, siempre que se disponga de SSD para el Engram.
- Motor de despliegue: Strata (repositorio github.com/Niko1221/Strata). El autor senala que DeepSeek-V4.1 con fichero Engram separado todavia no es compatible con llama.cpp.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen en gran medida de la velocidad del SSD que sirve el Engram.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (ZAL1988, uncensored GSQ-RCO) | ~551,9B (safetensors); 763B citado | no disponible | MIT | GGUF + Engram | Sin rechazos; MMLU 80,6-82,8 %; GPQA 83,3 % |
| ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF | mismo backbone | no disponible | no disponible | GGUF + Engram | Version original con rechazos; sirve de referencia en las tablas |
| AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF | mismo backbone | no disponible | no disponible | GGUF | Misma edicion de abliteration; este modelo replica el enfoque sobre los shards GSQ-RCO |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | 763B (citado) | no disponible | no disponible | no disponible | Modelo base original de DeepSeek |

## Limitaciones y advertencias

- El clasificador de rechazo solo lee el inicio de la respuesta: una negativa suave situada mas adelante en el texto puede contabilizarse como respuesta valida, lo que puede inflar la tasa de exito en las metricas.
- La edicion elimina los rechazos en todos los temas; no conserva un subconjunto mas estrecho de negativas. No es posible recuperar selectivamente el comportamiento seguro del modelo original.
- Con el modo thinking activado, la edicion planifica la respuesta a una peticion rechazada, segun la model card (texto truncado en el material disponible).
- Riesgo elevado de generar contenido danino, ilegal o eticamente problematico sin aviso; requiere moderacion externa en cualquier despliegue publico.
- Riesgo de alucinacion: no se han publicado mediciones especificas de factualidad en la informacion disponible.
- Idiomas soportados no declarados; el rendimiento fuera del ingles no esta medido.
- La longitud de contexto no se especifica; no debe asumirse la del modelo base sin verificacion.
- Dependencia de un motor no estandar (Strata) y de un SSD rapido para el Engram; no hay soporte en llama.cpp para esta combinacion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia: no hay validacion independiente de las metricas del autor.
- La licencia MIT se declara en los metadatos, pero conviene verificar las condiciones del modelo base DeepSeek y de los shards de ISTA-DASLab antes de uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ZAL1988/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF
- Modelo base cuantizado (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Modelo base original (DeepSeek): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Version equivalente de AtomicChat: https://huggingface.co/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF
- Repositorio de metricas: https://huggingface.co/datasets/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF-metrics
- Motor Strata: https://github.com/Niko1221/Strata
- Aplicacion Atomic Chat: https://atomic.chat/
- Repositorio Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de Atomic Chat: https://discord.gg/8wGSsvmg4V
- X (Twitter) de Atomic Chat: https://x.com/atomic_chat_hq
