# YzyLmc/pi05_yam_multitask_real_v2

## Resumen

PI0.5 YAM multi-task (real demos, v2) es un modelo de politica robotica (vision-language-action, VLA) derivado de `lerobot/pi05_base` mediante ajuste fino supervisado sobre demostraciones reales de teleoperacion de un brazo YAM. Lo publica el usuario YzyLmc en Hugging Face y esta pensado para controlar un robot de manipulacion de 6 articulaciones mas pinza, ejecutando 14 tareas de pick-and-place, vertido y apilado sobre una mesa con objetos cotidianos (bloques, cuchara, taza).

El modelo recibe imagenes de una camara de escena y otra de muneca, el estado articular de 7 dimensiones y una cadena de tarea en lenguaje natural, y devuelve un chunk de 60 acciones a 30 fps. Con 3.616.757.520 parametros (aproximadamente 3,6 mil millones) y formato safetensors, es un modelo de gran tamano para el estandar de politicas roboticas ligeras, lo que condiciona sus requisitos de hardware.

Esta version (v2) es una continuacion del ajuste fino de v1 (step 30.000) durante 10.000 pasos adicionales, incorporando tres tareas nuevas (`stand_mug`, `drop_mug`, `putin_spoon`) sobre un total de 416 episodios. Su relevancia es acotada: es un artefacto de investigacion muy especifico de un unico montaje fisico, sin benchmarks publicos ni prueba en bucle cerrado, pero util como referencia de como se documenta y evalua un checkpoint VLA de forma reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de `lerobot/pi05_base`; detalles internos no disponibles |
| Parametros totales | 3.616.757.520 (3,6 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (entrada: imagenes + estado de 7 dimensiones + cadena de tarea) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16) |
| Idiomas soportados | no disponible (las cadenas de tarea documentadas estan en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`) |
| Libreria | lerobot (ejecutar solo con LeRobot 0.4.1) |
| Entradas | `observation.images.scene_camera`, `observation.images.left_wrist_camera`, `observation.state` (7), cadena de tarea |
| Salidas | `action` (7), chunk de 60 a 30 fps |
| Tamano del repo | 7,5 GB |
| Frecuencia de control | 30 fps |

## Arquitectura y entrenamiento

El modelo es una politica VLA construida sobre `lerobot/pi05_base` (commit a538eb27), del ecosistema LeRobot. La model card no detalla la arquitectura interna (tipo de backbone, mecanismo de atencion ni fusion vision-lenguaje), por lo que ese dato queda como no disponible. Lo que si se especifica es la interfaz: dos flujos de imagen mapeados a `base_0_rgb` y `left_wrist_0_rgb`, un vector de estado de 7 dimensiones (6 articulaciones del brazo mas pinza) y un prompt textual de tarea; la salida es un chunk de 60 acciones en el mismo orden que el estado.

El entrenamiento es un ajuste fino por imitacion (behavior cloning) sobre 416 episodios reales de teleoperacion repartidos en 14 tareas, con las revisiones de dataset `stand_mug` 77f7beda, `drop_mug` 36a77a55 y `putin_spoon` b85bd59f. La receta es: batch 32, bf16, gradient checkpointing, chunk 60, AdamW con lr pico 1e-5, 500 pasos de warmup, decaimiento coseno hasta 1e-6 en 10.000 pasos y semilla 1001. Los episodios de `drop_mug` y `putin_spoon` aparecen duplicados en el conjunto para aumentar su frecuencia de muestreo, y las estadisticas de normalizacion se recalculan sobre el nuevo conjunto. No se menciona RLHF, DPO ni ninguna innovacion de decodificacion; el detalle tecnico mas relevante es que la configuracion declara `output_features.action.shape` = 7 mientras los pesos conservan 32 salidas del modelo base, del que la politica toma solo las 7 primeras.

## Capacidades

- Manipulacion robotica de un brazo YAM de 6 articulaciones mas pinza, con control a 30 fps mediante chunks de 60 acciones.
- Ejecucion de 14 tareas discretas de pick-and-place, vertido, apilado y colocacion, invocadas mediante cadenas de tarea exactas en ingles (por ejemplo, `Pick up the blue block.` o `Put the spoon into the mug.`).
- Percepcion visual multimodal: combina una camara de escena global y una camara de muneca para localizar objetos y guiar el agarre.
- Condicionamiento por lenguaje natural: la tarea se selecciona con un prompt de texto, sin necesidad de reentrenar para cambiar entre las 14 habilidades aprendidas.
- Generalizacion limitada a los objetos y el montaje vistos en entrenamiento (bloques azul y amarillo, cuchara, taza).
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, modo thinking, audio ni capacidades multilingues.

## Casos de uso

- Investigacion en imitacion robotica: servir como checkpoint de referencia para estudiar el efecto de anadir tareas y episodios a un ajuste fino VLA, comparando v1 y v2 con la misma metrica offline.
- Reproduccion de experimentos: replicar el pipeline de LeRobot 0.4.1 con el mapa de renombrado de camaras documentado para validar resultados de entrenamiento sobre el mismo brazo YAM.
- Benchmark interno de politicas: usar el error absoluto medio del chunk de 60 pasos como linea base frente a politicas propias o variantes de cuantizacion.
- Automatizacion de tareas de pick-and-place en laboratorio: ejecutar las 14 habilidades documentadas sobre una mesa instrumentada con los mismos objetos, siempre con supervision humana.
- Estudio de robustez ante cambios de objeto o posicion: evaluar la degradacion del modelo al variar color, forma o ubicacion de los objetos respecto al conjunto de entrenamiento.
- Docencia y divulgacion: ilustrar el ciclo completo de un modelo VLA (datos de teleoperacion, ajuste fino, evaluacion offline y despliegue en robot) con un artefacto publico y trazable.

## Benchmarks y rendimiento

El autor solo publica una evaluacion offline: el error absoluto medio (MAE) del chunk de acciones de 60 pasos, donde menor es mejor. No hay resultados en bucle cerrado ni benchmarks estandar (MMLU, HumanEval, GSM8K u otros), que no aplican a este tipo de modelo.

| Episodios retenidos | v1 (step 30.000) | Este modelo (v2) | Referencia "holding still" |
|---|---|---|---|
| Los 9 episodios de v1 | 0,033 | 0,034 | 0,066 |
| stand_mug (15) | 0,094 | 0,059 | 0,080 |
| drop_mug (15) | 0,036 | 0,033 | 0,056 |
| Todos (11 grupos) | 0,038 | 0,036 | 0,066 |

La mejora es clara en `stand_mug` (de 0,094 a 0,059) y marginal en el resto, con un ligero empeoramiento en los episodios originales de v1 (de 0,033 a 0,034). La referencia "holding still" (no mover el robot) obtiene errores peores en todos los casos, lo que confirma que el modelo aporta senal predictiva, aunque el margen en algunos grupos es estrecho. No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 3,6 B de parametros en bf16, los pesos ocupan aproximadamente 7,2 GB, por lo que se necesita al menos una GPU con 12-16 GB de VRAM para cargar el modelo y algo de margen para las imagenes y el estado.
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 4090 (24 GB), A100 (40/80 GB) o H100 son opciones seguras; una RTX 3090 (24 GB) o una RTX 4080 (16 GB) podrian ser suficientes, aunque no esta verificado.
- Cabe en GPU de consumo: probablemente si en modelos con 16 GB o mas, sin confirmacion oficial.
- Opciones de despliegue: LeRobot 0.4.1 exclusivamente (en el robot, `--runtime 0.4.1`). Otras versiones construyen un prompt distinto y producen acciones diferentes con los mismos pesos. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este tipo de politica.
- Latencia y throughput: no disponibles. La politica genera chunks de 60 acciones a 30 fps, lo que implica una ventana de 2 segundos por inferencia, pero no se publica el tiempo de computo por chunk.

## Comparativa con modelos similares

No se dispone de datos publicos de modelos comparables en la informacion proporcionada. La unica referencia directa es la version anterior del mismo modelo:

| Modelo | Parametros | Contexto | MAE offline (11 grupos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05_yam_multitask_real_v2 | 3,6 B | no disponible | 0,036 | no disponible | Hugging Face (YzyLmc) |
| pi05_yam_multitask_real (v1) | no disponible | no disponible | 0,038 | no disponible | Hugging Face (YzyLmc) |
| lerobot/pi05_base | no disponible | no disponible | no disponible | no disponible | Hugging Face (LeRobot) |

No se identifican alternativas publicas equivalentes (mismo brazo, mismas tareas, misma metrica) en la informacion disponible.

## Limitaciones y advertencias

- Modelo altamente especifico: solo funciona con el montaje fisico, las camaras y los objetos del conjunto de entrenamiento; no es un modelo general de robotica.
- Sin prueba en bucle cerrado: el autor indica explicitamente que no se ha ejecutado ninguna evaluacion closed-loop, por lo que el rendimiento real en el robot es desconocido.
- Dependencia estricta de la version de LeRobot: usar una version distinta de 0.4.1 altera el prompt y, por tanto, las acciones generadas.
- Las cadenas de tarea deben usarse exactamente como se documentan; variaciones en el texto pueden degradar el comportamiento.
- El error offline es cercano a la referencia "holding still" en varios grupos (por ejemplo, 0,033 frente a 0,056 en `drop_mug`), lo que sugiere un margen de mejora limitado y riesgo de acciones poco precisas.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribucion de los pesos.
- Idiomas no disponibles: la unica evidencia son prompts en ingles; no hay soporte multilingue documentado.
- Riesgo de sobreajuste a las tareas y objetos vistos, con posible degradacion ante cambios de iluminacion, posicion de camara u objetos nuevos.
- Sin datos de sesgos, alucinacion o seguridad fisica; en un entorno robotico real debe operarse con supervision y limites de parada de emergencia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YzyLmc/pi05_yam_multitask_real_v2
- Version anterior (v1): https://huggingface.co/YzyLmc/pi05_yam_multitask_real
- Modelo base: https://huggingface.co/lerobot/pi05_base
- LeRobot (libreria): https://github.com/huggingface/lerobot
