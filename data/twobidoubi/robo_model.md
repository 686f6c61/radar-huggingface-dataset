# twobidoubi/Robo_model

## Resumen

Robo_model es una coleccion de checkpoints de Vision-Language-Action (VLA) publicada por el usuario twobidoubi bajo el identificador twobidoubi/Robo_model. No se trata de un modelo entrenado desde cero, sino de ajustes finos (fine-tuning) del modelo base physical-intelligence/pi05-base (la familia pi 0.5 de Physical Intelligence) realizados con la herramienta openpi para las tareas de simulacion CobotMagic del banco de pruebas RoboSynChallenge. El repositorio contiene diez carpetas, una por tarea, y dentro de cada una varios directorios `<run>/<step>/` que corresponden a checkpoints intermedios de entrenamiento.

El problema que resuelve es el de disponer de politicas de manipulacion robotica ya entrenadas para tareas concretas de simulacion (reordenacion de mesa, entrega de objetos, manejo de cestas, ensamblaje de piezas, entre otras), evaluadas de forma sistematica con 100 episodios por checkpoint en configuracion aleatoria. Los datos de entrenamiento proceden de los conjuntos oficiales `RoboSynChallenge/cobotmagic_Sim_<task>`, con 1.000 episodios de experto por tarea en formato LeRobot v2.1.

Su relevancia radica en que documenta de forma inusualmente transparente los resultados de exito por checkpoint y por tarea, incluyendo los casos en los que el ajuste fino no supera a las lineas base. La licencia aparece etiquetada como "other" y el repositorio ocupa 483,7 GB, ya que incluye parametros completos (tambien en los runs de LoRA) y estados de optimizador para reanudar el entrenamiento. No se publican el numero de parametros, la longitud de contexto ni la lista de idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) derivada de pi 0.5 (base_model: physical-intelligence/pi05-base); detalles internos no disponibles |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los checkpoints se distribuyen con parametros completos en formato openpi; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | other (etiquetada como "other" en HuggingFace; no se detallan los terminos, consultar la licencia del modelo base) |
| Formato de pesos | Checkpoints openpi: `params/` (parametros completos, tambien en runs LoRA), `assets/<repo_id>/norm_stats.json` y, en la mayoria de carpetas, `train_state/` (estado del optimizador) |

## Arquitectura y entrenamiento

La informacion disponible indica que se trata de checkpoints de tipo VLA ajustados a partir de `pi05_base` mediante openpi, la herramienta de entrenamiento publicada por Physical Intelligence. No se detallan en el repositorio la arquitectura interna (encoder de vision, modelo de lenguaje, cabeza de acciones), el numero de parametros ni el tipo de decodificacion de acciones; estos datos deben consultarse en la documentacion del modelo base `physical-intelligence/pi05-base`.

El entrenamiento se realizo sobre los conjuntos oficiales `RoboSynChallenge/cobotmagic_Sim_<task>`, con 1.000 episodios de experto por tarea en formato LeRobot v2.1. Se distinguen dos regimenes: ajuste fino completo (`pi05_full_v1`) y ajuste con LoRA (`pi05_lora_v1`). Ademas, para la tarea `items_handover` existe un run adicional (`pi05_aug_lora_v1`) entrenado con datos generados por el propio equipo, que en la practica no supero a las lineas base (0 exitos en 100 episodios en el paso 2500 y paradas tempranas en el resto). El repositorio guarda checkpoints intermedios en pasos de 2.500 o 5.000, lo que permite estudiar la evolucion del exito a lo largo del entrenamiento.

## Capacidades

- Manipulacion robotica guiada por lenguaje en entornos de simulacion CobotMagic: el modelo genera secuencias de acciones (politicas) a partir de observaciones visuales e instrucciones de tarea.
- Ejecucion de tareas especificas de reordenacion y ensamblaje: reordenacion de mesa (`table_rearrangement`), entrega de objetos (`items_handover`), manejo de cesta (`handle_basket`) y ensamblaje de piezas (`item_assembly`).
- Ajuste fino eficiente mediante LoRA, con checkpoints que conservan los parametros completos para su despliegue.
- Reanudacion de entrenamiento: la mayoria de carpetas incluyen `train_state/` con el estado del optimizador.
- Normalizacion de acciones por tarea: cada checkpoint incluye `norm_stats.json` en `assets/<repo_id>/`.
- Capacidades conversacionales, de codigo, matematicas, vision general, tool calling o agentes multi-paso: no disponibles; este es un modelo de robotica, no un LLM de proposito general segun la informacion proporcionada.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion en manipulacion robotica simulada: reproduccion de los experimentos del RoboSynChallenge cargando un checkpoint concreto (`<task>/<run>/<step>`) y evaluandolo en el simulador CobotMagic con la configuracion aleatoria descrita (100 episodios).
- Seleccion de politicas por tarea: el repositorio incluye varias decenas de checkpoints con metricas de exito, lo que permite elegir el punto de entrenamiento mas adecuado para cada tarea sin reentrenar.
- Estudio de ajuste fino completo frente a LoRA: la tarea `table_rearrangement` ofrece una comparacion directa (full: 78/100 en el paso 15000; LoRA: 76/100 en el paso 14999) util para decidir la estrategia de adaptacion en futuros proyectos.
- Analisis de estabilidad del entrenamiento: los resultados de `handle_basket` (de 25/100 a 79/100 segun el paso) y `item_assembly` (0/18 en pasos tempranos y 16/100 en el paso 10000) sirven para estudiar la varianza del exito entre checkpoints y el efecto del reescalado de pinza.
- Generacion de datos sinteticos de manipulacion: el run `pi05_aug_lora_v1` de `items_handover` documenta el intento de entrenar con datos generados por el equipo, util como caso de estudio de aumento de datos fallido.
- Punto de partida para transferencia a robot real: aunque no hay validacion en hardware fisico en la informacion disponible, los checkpoints pueden servir como inicializacion para ajuste fino posterior (fine-tuning) en dominios reales.
- Docencia y prototipado de politicas VLA: el repositorio, con checkpoints y norm_stats listos para openpi, permite montar un flujo de evaluacion de VLA sin partir de cero.

## Benchmarks y rendimiento

Los datos disponibles no son benchmarks clasicos de lenguaje (MMLU, HumanEval, GSM8K), sino tasas de exito de tarea en simulacion. Se resumen a continuacion los resultados publicados en la model card (configuracion aleatoria, 100 episodios salvo donde se indique).

| Tarea | Run | Paso | Exitos / episodios | Pasos de accion medios / limite |
|---|---|---|---|---|
| table_rearrangement | full fine-tune | 5000 | 60 / 100 | 246,6 / 361 |
| table_rearrangement | full fine-tune | 10000 | 73 / 100 | 219,1 / 361 |
| table_rearrangement | full fine-tune | 15000 | 78 / 100 | 209,3 / 361 |
| table_rearrangement | full fine-tune | 19999 | 76 / 100 | 229,3 / 361 |
| table_rearrangement | LoRA | 2500 | 32 / 100 | 299,2 / 361 |
| table_rearrangement | LoRA | 5000 | 39 / 100 | 294,6 / 361 |
| table_rearrangement | LoRA | 7500 | 52 / 100 | 259,5 / 361 |
| table_rearrangement | LoRA | 10000 | 56 / 100 | 265,4 / 361 |
| table_rearrangement | LoRA | 12500 | 70 / 100 | 233,6 / 361 |
| table_rearrangement | LoRA | 14999 | 76 / 100 | 223,9 / 361 |
| items_handover | LoRA | 2500 | 7 / 100 | 348,3 / 350 |
| items_handover | LoRA | 5000 | 1 / 100 | 349,5 / 350 |
| items_handover | LoRA | 7500 | 11 / 100 | 349,0 / 350 |
| items_handover | LoRA | 10000 | 14 / 100 | 347,6 / 350 |
| items_handover | LoRA | 12500 | 38 / 100 | 342,2 / 350 |
| items_handover | LoRA | 14999 | 14 / 100 | 348,4 / 350 |
| items_handover | LoRA (datos del equipo) | 2500 | 0 / 100 | 350,0 / 350 |
| items_handover | LoRA (datos del equipo) | 5000 | 2 / 42 | no disponible (parada temprana) |
| items_handover | LoRA (datos del equipo) | 7500 | 0 / 25 | no disponible (parada temprana) |
| items_handover | LoRA (datos del equipo) | 10000 | 0 / 25 | no disponible (parada temprana) |
| items_handover | LoRA (datos del equipo) | 12500 | 1 / 29 | no disponible (parada temprana) |
| items_handover | LoRA (datos del equipo) | 14999 | 0 / 25 | no disponible (parada temprana) |
| handle_basket | LoRA | 2500 | 28 / 100 | 472,9 / 500 |
| handle_basket | LoRA | 5000 | 35 / 100 | 467,1 / 500 |
| handle_basket | LoRA | 7500 | 79 / 100 | 414,0 / 500 |
| handle_basket | LoRA | 10000 | 45 / 100 | 447,2 / 500 |
| handle_basket | LoRA | 12500 | 25 / 100 | 469,4 / 500 |
| handle_basket | LoRA | 14999 | 65 / 100 | 431,6 / 500 |
| item_assembly | LoRA | 2500 | 0 / 18 | no disponible (parada temprana) |
| item_assembly | LoRA | 5000 | 0 / 18 | no disponible (parada temprana) |
| item_assembly | LoRA | 7500 | 0 / 25 | no disponible (parada temprana) |
| item_assembly | LoRA | 10000 | 16 / 100 | 469,1 / 500 |
| item_assembly | LoRA | 12500 | 2 / 40 | no disponible (parada temprana) |
| item_assembly | LoRA | 14999 | 13 / 100 | 474,6 / 500 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El numero de parametros no se publica y el repositorio no documenta requisitos de memoria.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: los checkpoints estan en formato openpi (JAX) y estan pensados para usarse con la herramienta openpi de Physical Intelligence; no se documentan variantes para vLLM, llama.cpp, Ollama o TGI, que en principio no aplican a este tipo de modelo VLA.
- Latencia y throughput estimados: no disponibles.
- Nota sobre almacenamiento: el repositorio completo ocupa 483,7 GB, ya que acumula multiples checkpoints con parametros completos y estados de optimizador; desplegar un unico checkpoint requiere solo el subdirectorio correspondiente (`<task>/<run>/<step>/params/` y `assets/`).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Robo_model (twobidoubi) | VLA ajustado para CobotMagic | no disponible | no disponible | Exito por tarea entre 0/100 y 79/100 segun tarea y checkpoint | other | HuggingFace (twobidoubi/Robo_model) |
| physical-intelligence/pi05-base | VLA base | no disponible | no disponible | No disponible en la informacion proporcionada | no disponible | HuggingFace (modelo base del anterior) |
| Otros VLA comparables (por ejemplo OpenVLA, RDT-1B) | VLA | no disponible | no disponible | No disponible en la informacion proporcionada | no disponible | no disponible |

No se dispone de datos comparativos de benchmarks entre Robo_model, su modelo base y otras alternativas VLA en la informacion proporcionada.

## Limitaciones y advertencias

- Ambito restringido a simulacion: todos los resultados corresponden a tareas CobotMagic en simulador; no se documenta ninguna validacion en robot fisico.
- Rendimiento muy desigual por tarea: `table_rearrangement` alcanza 78/100, mientras que `items_handover` se queda en 38/100 y `item_assembly` en 16/100 en sus mejores checkpoints; varias evaluaciones se detuvieron de forma temprana con 0 exitos.
- Seleccion de checkpoint critica: el exito varia fuertemente entre pasos (por ejemplo, `handle_basket` pasa de 79/100 en el paso 7500 a 25/100 en el 12500), lo que exige validar el checkpoint concreto antes de desplegarlo.
- Datos generados por el equipo sin exito: el run `pi05_aug_lora_v1` de `items_handover` obtuvo 0/100 en el paso 2500 y paradas tempranas, por lo que no debe tomarse como una mejora sobre el ajuste con datos oficiales.
- Licencia "other" sin terminos detallados: es imprescindible revisar la licencia del modelo base `physical-intelligence/pi05-base` antes de cualquier uso comercial.
- Idiomas soportados no documentados: se desconoce el idioma de las instrucciones y si el modelo generaliza a otros.
- Riesgo de sobreajuste a la distribucion de simulacion: al entrenarse sobre una unica distribucion por tarea (1.000 episodios), el comportamiento fuera de esa distribucion no esta caracterizado.
- Sesgos conocidos: no disponibles; el repositorio no incluye analisis de sesgos.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto libre, pero si existe el riesgo de ejecutar secuencias de accion no validas o de agotar el limite de pasos sin completar la tarea.
- Tamano del repositorio: 483,7 GB dificultan la descarga completa; conviene descargar solo los subdirectorios necesarios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/twobidoubi/Robo_model
- Modelo base: https://huggingface.co/physical-intelligence/pi05-base
- Repositorio openpi (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Bancho de pruebas RoboSynChallenge: http://robosyn-bench.net
- Datasets de simulacion: `RoboSynChallenge/cobotmagic_Sim_<task>` (formato LeRobot v2.1)
