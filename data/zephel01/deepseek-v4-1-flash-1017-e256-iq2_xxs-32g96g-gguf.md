# zephel01/DeepSeek-V4.1-Flash-1017-E256-IQ2_XXS-32G96G-GGUF

## Resumen

Este repositorio contiene una cuantizacion GGUF podada del modelo `deepseek-ai/DeepSeek-V4.1-Flash-1017`, un transformer de tipo Mixture-of-Experts (MoE) de 567.274.486.384 parametros totales segun los pesos en safetensors del modelo base. La variante concreta, denominada JA256, conserva 256 de los 384 expertos por capa y reduce el peso descargable a 207,1 GB frente a los 275,8 GB de la cuantizacion LDLQ sin podar del mismo autor. El objetivo declarado es ejecutar un modelo de esta escala en un equipo de consumo con una GPU de 32 GB de VRAM y 96 GB de RAM, descargando parte del calculo a CPU y leyendo la tabla Engram desde SSD.

El autor, zephel01, publica esta version como BETA y bajo licencia MIT, heredada del modelo base. La seleccion de expertos no se limita a codigo: se midio el enrutamiento sobre texto de chat, matematicas, llamadas a herramientas, codigo y contenido multilingue (ingles, chino y japones), de modo que se conservan aproximadamente el 94% de las rutas de matematicas, el 94% de las de herramientas, el 91% de las de ingles, el 84% de las de codigo, el 94% de las de chino y el 95% de las de japones. La relevancia actual reside en que permite desplegar localmente un MoE de 567B con cuantizacion mixta de aproximadamente 1,95 bits por peso en hardware no profesional.

La cuantizacion combina tipos IQ2_XXS (45% de los bytes de expertos), IQ1_S (30%), IQ2_XS (14%) e IQ2_S (11%), y la tabla Engram se recuantiza a IQ4_NL. El resultado es un compromiso entre tamano, velocidad de decodificacion y fidelidad respecto al modelo sin cuantizar, con una divergencia KL de 0,383 frente al modelo original, superior a la de las variantes sin podar (0,182-0,194), lo que se traduce en mayor deriva en tareas largas y cuidadosas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con tabla Engram; 384 expertos por capa en el modelo base, 256 conservados en esta poda |
| Parametros totales | 567.274.486.384 (modelo base); el GGUF podado conserva 256/384 expertos por capa |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (se han verificado prompts de 8K y 32K en pruebas del autor) |
| Tipos de cuantizacion | Mixta: IQ2_XXS 45%, IQ1_S 30%, IQ2_XS 14%, IQ2_S 11% en expertos (~1,95 bits por peso); tabla Engram en IQ4_NL |
| Idiomas soportados | No disponible de forma oficial; el autor declara seleccion de expertos sobre ingles, chino, japones, codigo, matematicas y llamadas a herramientas |
| Licencia | MIT |
| Formato de pesos | GGUF (6 shards; apuntar el motor a `-00001-of-00006.gguf`) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture-of-Experts de 384 expertos por capa y 567.274.486.384 parametros totales, segun los pesos en safetensors publicados. Esta variante no reentrena ni ajusta el modelo: parte de la cuantizacion LDLQ 132G del mismo autor y recorta los expertos, routers y sesgos de router byte a byte a los 256 expertos conservados por capa (`expert_count` = 256), sin recuantizar. La seleccion de expertos se realizo midiendo el enrutamiento sobre cinco dominios (chat, matematicas, llamadas a herramientas, codigo y texto multilingue), y los expertos conservados difieren entre capas. La tabla Engram se recuantizo a IQ4_NL desde la tabla FP8 de la version UD-Q4_K_XL de unsloth, con un error RMS relativo de 0,075, y se lee desde SSD unas pocas filas a la vez, por lo que no necesita caber en RAM.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF o DPO del modelo base en la informacion proporcionada. La innovacion tecnica destacable de esta publicacion es el propio proceso de poda guiado por enrutamiento medido: el autor documenta que una seleccion de 192 expertos basada solo en codigo conserva unicamente el 45% de las rutas que toma el texto japones, mientras que la seleccion de 256 expertos en seis dominios mantiene el 95% de las rutas japonesas y el 84% de las de codigo. El formato esta pensado para ejecucion con offload de CPU y lectura de la tabla Engram desde disco, y es compatible con los motores Abyss y llama.cpp.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, chino y japones, con seleccion de expertos que preserva rutas para estos idiomas.
- Razonamiento matematico: la poda conserva aproximadamente el 94% de las rutas de matematicas.
- Generacion de codigo: conserva aproximadamente el 84% de las rutas de codigo, con pruebas de tareas de codigo con tests ocultos (8/10 resueltas en la evaluacion del autor).
- Soporte de tool calling y function calling: conserva aproximadamente el 94% de las rutas de llamadas a herramientas, con una sesion de 7 turnos de tool-call coding verificada.
- Capacidades agenticas y de razonamiento multi-paso, con informes finales generados en japones en las pruebas del autor.
- Manejo de contexto largo: verificado con prompts de 8K y 32K en la prueba de recuperacion de aguja (find the needle).
- Capacidades multilingues limitadas a los dominios usados en la seleccion de expertos; otros idiomas (coreano, lenguas europeas) pueden degradarse.
- No se documenta soporte de vision en esta variante podada; el autor advierte que la entrada de imagen no se incluyo en los conteos de enrutamiento y puede verse mas afectada.

## Casos de uso

- Asistente conversacional local en japones, chino o ingles: la seleccion de expertos preserva el 95% de las rutas japonesas y el 94% de las chinas, por lo que es adecuado para atencion al usuario en estos idiomas en un equipo de 32 GB de VRAM y 96 GB de RAM.
- Generacion de codigo en local con verificacion por tests: el autor reporta 8 de 10 tareas de codificacion resueltas con tests ocultos y una puntuacion de calidad de 80,5 sobre las resueltas, adecuado para prototipado y refactorizacion fuera de entornos cloud.
- Agentes con llamadas a herramientas: conserva el 94% de las rutas de tool-call y se verifico una sesion de 7 turnos con llamadas a herramientas y tests superados, lo que permite construir asistentes que consultan APIs o ejecutan comandos.
- Razonamiento matematico asistido: el 94% de rutas de matematicas conservadas permite usar el modelo para resolucion de problemas y explicacion de pasos en entornos educativos o de analisis.
- Procesamiento de documentos largos: con contexto verificado de 8K a 32K tokens en la prueba de aguja, sirve para resumir o extraer informacion de contratos, informes o documentacion tecnica.
- Despliegue en estaciones de trabajo sin GPU de datacenter: el formato esta disenado para un PC con GPU de 32 GB y 96 GB de RAM, con decodificacion de 87 tok/s en tareas de codigo segun el autor, lo que habilita inferencia local de un MoE de 567B en pequenas oficinas o laboratorios.
- Traduccion y generacion de contenido multilingue entre ingles, chino y japones, siempre que no se requieran idiomas fuera de los seis dominios de seleccion.

## Benchmarks y rendimiento

Los datos disponibles son mediciones del autor, no benchmarks estandarizados como MMLU o HumanEval.

| Metrica | JA256 (esta variante) | LDLQ 132G (sin podar) | ISTA GSQ-RCO Coder |
|---|---|---|---|
| Expertos por capa | 256 / 384 | 384 / 384 | 192 / 384 |
| Descarga | 207,1 GB | 275,8 GB | 182,7 GB |
| KL (8 secuencias) | 0,383 | 0,194 | 0,582 |
| Mismo token top-1 | 75,2% | 81,1% | 69,3% |
| Decodificacion, 3 tareas de codigo | 87,0 tok/s | 67,5 tok/s | 97,0 tok/s |
| 10 tareas de codigo dificiles resueltas | 8/10 | 10/10 | 9/10 |
| Puntuacion de calidad de las tareas resueltas | 80,5 | 77,6 | 77,5 |
| Prompt 8K / 32K, find the needle | OK / OK | OK / OK | OK / OK |
| Sesion de tool-call de 7 turnos | Si, informe final en japones | Si | Si, informe final en chino |
| Japones (3 prompts), sin mezcla de escrituras | OK | OK | Chino (sin kana, un bucle) |
| Bucles / accesos ilegales a memoria | 0 / 0 | 0 / 0 | 1 / 0 |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 32 GB de VRAM en GPU, con el resto del modelo descargado a 96 GB de RAM; el autor lo define como objetivo de equipo, no como garantia de velocidad.
- GPU recomendadas: el autor menciona una RTX 5090 (32 GB) como referencia en las etiquetas del repositorio; no se documentan otras GPU.
- Cabe en GPU de consumo: si, en GPU con 32 GB de VRAM combinadas con 96 GB de RAM del sistema; no cabe integramente en una sola GPU de consumo.
- Opciones de despliegue: motores Abyss (del mismo autor) y llama.cpp; el repositorio incluye sumas SHA256 y seis shards GGUF.
- Latencia y throughput: 87,0 tok/s en decodificacion sobre 3 tareas de codigo en el equipo de prueba del autor, frente a 67,5 tok/s de la variante LDLQ 132G sin podar.
- Almacenamiento: 207,1 GB de descarga; la tabla Engram (110,6 GB en IQ4_NL) se lee desde SSD por filas y no necesita residir en RAM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 JA256 (este) | 567B totales, 256/384 expertos | No disponible | MIT | GGUF, 207,1 GB | Poda equilibrada, japones funcional, 87 tok/s en el equipo del autor |
| DeepSeek-V4.1-Flash-1017 LDLQ 132G | 567B totales, 384/384 expertos | No disponible | MIT | GGUF, 275,8 GB | Sin poda, KL 0,194, 67,5 tok/s |
| ISTA-DASLab GSQ-RCO Coder | 567B totales, 192/384 expertos | No disponible | No disponible en la informacion | GGUF, 182,7 GB | Solo codigo en ingles; falla en japones; 97 tok/s |
| ISTA-DASLab GSQ-RCO IQ2_XXS | 567B totales, 384/384 expertos | No disponible | No disponible en la informacion | GGUF, ~249 GB | Sin poda, KL 0,314 |

## Limitaciones y advertencias

- La poda elimina 128 de los 384 expertos por capa: el texto de los seis dominios seleccionados pierde entre un 5% y un 16% de sus rutas hacia los siguientes mejores expertos, y cualquier dominio fuera de ellos (otros idiomas, conocimiento raro, entrada de imagen) puede degradarse mas.
- La divergencia KL de 0,383 es aproximadamente el doble que la de las variantes sin podar (0,182-0,194), lo que implica mayor deriva en trabajos largos y cuidadosos.
- El autor marca la version como BETA y advierte que solo se ha medido en un unico PC; no hay validacion independiente en otras GPU o configuraciones de RAM.
- Riesgo de alucinacion: no se documenta ninguna evaluacion especifica de alucinacion en la informacion disponible.
- Sesgos conocidos: no disponible.
- Limitaciones de contexto: no se publica la longitud maxima de contexto del modelo base ni de esta cuantizacion; solo se verifican prompts de 8K y 32K.
- Restricciones de licencia: MIT permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento ni sobre la idoneidad para produccion.
- El modelo requiere un equipo con 32 GB de VRAM y 96 GB de RAM; no es viable en portatiles o GPU de consumo con menos memoria.
- La tabla Engram se lee desde SSD, por lo que el rendimiento depende de la velocidad del disco.
- El autor reconoce un fallo persistente en una tarea concreta (t046, tiempos de vida de objetos en inyeccion de dependencias), que fallo en 3 de 3 repeticiones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zephel01/DeepSeek-V4.1-Flash-1017-E256-IQ2_XXS-32G96G-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Variante LDLQ sin podar del mismo autor: https://huggingface.co/zephel01/DeepSeek-V4.1-Flash-1017-IQ2_XXS-32G96G-GGUF
- Repositorio LDLQ 32G96G: https://huggingface.co/zephel01/DeepSeek-V4.1-Flash-1017-LDLQ-32G96G-GGUF
- Variante Compact 32G96G: https://huggingface.co/zephel01/DeepSeek-V4.1-Flash-1017-Compact-32G96G-GGUF
- ISTA-DASLab GSQ-RCO Coder: https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-Coder-GGUF
- Motor Abyss (issues): https://github.com/zephel01/Abyss/issues
