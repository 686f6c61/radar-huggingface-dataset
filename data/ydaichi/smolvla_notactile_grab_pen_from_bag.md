# ydaichi/smolvla_notactile_grab_pen_from_bag

## Resumen

SmolVLA es una familia de modelos vision-lenguaje-accion (VLA) compactos orientados a control robotico, desarrollada en el ecosistema LeRobot de Hugging Face. La ficha que nos ocupa, `ydaichi/smolvla_notactile_grab_pen_from_bag`, es un ajuste fino de `lerobot/smolvla_base` sobre el dataset `ydaichi/tactile_grab_pen_from_bag`, publicado por el usuario ydaichi con licencia Apache 2.0 y pipeline declarado como `robotics`. El identificador del repositorio sugiere una variante entrenada sin entrada tactil ("notactile") para una tarea concreta de manipulacion (tomar un boligrafo de una bolsa), aunque la model card no documenta explicitamente esta distincion.

El modelo resuelve el problema de mapear observaciones visuales (y, en su caso, de estado del robot) a acciones motoras de bajo nivel, siguiendo el paradigma de las politicas de imitacion entrenadas por aprendizaje supervisado sobre demostraciones teleoperadas. Con 450.046.176 parametros (aproximadamente 450 M) y un repositorio de 0,9 GB en formato safetensors, es lo bastante pequeno para inferencia en hardware de consumo, que es precisamente la propuesta de valor que la model card atribuye a SmolVLA.

Su relevancia actual es acotada y muy especifica: se trata de un checkpoint de investigacion con 0 descargas y 0 "likes" en el momento de la consulta, publicado para una unica tarea y sin resultados de evaluacion publicados. Resulta util como referencia reproducible de ajuste fino de SmolVLA con LeRobot y como punto de comparacion frente a la variante con tacto del mismo autor, pero no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) basada en `lerobot/smolvla_base`; detalle interno (backbone, experto de acciones) no disponible en la informacion proporcionada |
| Parametros totales | 450.046.176 (aproximadamente 450 M) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible; no aplica en el sentido de contexto de texto (la entrada son observaciones de robot) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors, sin variantes cuantizadas |
| Idiomas soportados | No disponible (no es un modelo conversacional; no se documenta el idioma de las instrucciones de tarea) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria `lerobot`) |
| Tamano del repositorio | 0,9 GB |
| Modelo base | `lerobot/smolvla_base` (ajuste fino) |
| Dataset de entrenamiento | `ydaichi/tactile_grab_pen_from_bag` |
| Pipeline | `robotics` |
| Fecha de creacion / actualizacion | 2026-09-15 |

## Arquitectura y entrenamiento

La model card describe SmolVLA como un modelo vision-lenguaje-accion compacto y eficiente, con rendimiento competitivo a coste computacional reducido, desplegable en hardware de consumo. El checkpoint aqui documentado es un ajuste fino del modelo base `lerobot/smolvla_base` (450.046.176 parametros) sobre el dataset `ydaichi/tactile_grab_pen_from_bag`, entrenado y publicado con LeRobot. No se detallan en la informacion disponible la composicion del backbone de vision-lenguaje, el mecanismo del experto de acciones, la funcion de perdida, ni si se emplearon tecnicas adicionales como decodificacion especulativa o inferencia asincrona.

Tampoco se especifican el numero de tokens, el numero de episodios de demostracion, las horas de teleoperacion, el numero de pasos de entrenamiento ni si hubo etapas de ajuste por preferencias (RLHF/DPO); en el caso de politicas de imitacion robotica estos datos suelen ser relevantes y aqui figuran como no disponibles. Un detalle a tener en cuenta: el bloque de ejemplo de la model card muestra un comando `lerobot-train` con `--policy.type=act`, que es la plantilla generica de LeRobot y no refleja la politica realmente contenida en el repositorio (SmolVLA); conviene no tomar ese fragmento como descripcion del entrenamiento realizado.

## Capacidades

- Generacion de acciones motoras para control de robot a partir de observaciones visuales, en el marco de politicas VLA entrenadas por imitacion.
- Ejecucion de la tarea concreta para la que fue ajustado: tomar un boligrafo desde una bolsa (segun el identificador del modelo y el dataset asociado).
- Integracion nativa con el ecosistema LeRobot: entrenamiento con `lerobot-train` y evaluacion o ejecucion con `lerobot-record`.
- Ejecucion sobre robots tipo `so100_follower`, segun el ejemplo de inferencia de la model card.
- Inferencia en hardware de consumo, de acuerdo con la descripcion de SmolVLA en la model card.
- Variante sin entrada tactil (segun el identificador "notactile"), presumiblemente pensada como linea base frente a una version con tacto.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, dialogo multilingue, vision general de proposito abierto, audio ni modos de pensamiento explicito.

## Casos de uso

- Manipulacion robotica de pick-and-place en laboratorio: el modelo puede controlar un brazo tipo `so100_follower` para extraer un objeto de un contenedor, replicando la tarea del dataset de ajuste fino; es adecuado porque ha sido entrenado especificamente sobre esas demostraciones.
- Linea base sin tacto en investigacion tactil: al tratarse de una variante "notactile", permite cuantificar la ganancia que aportan los sensores tactiles comparandola con la version que si los emplea sobre el mismo dataset (`tactile_grab_pen_from_bag`).
- Reproduccion de experimentos de ajuste fino de VLA: sirve como referencia publica de como ajustar `lerobot/smolvla_base` con un dataset propio y publicarlo en el Hub con LeRobot.
- Prototipado de politicas en hardware de bajo coste: sus aproximadamente 450 M de parametros y 0,9 GB de pesos permiten desplegarlo en una estacion con GPU de gama media para pruebas de concepto academicas.
- Generacion de datos de evaluacion: el flujo `lerobot-record` con prefijo `eval_` en el repositorio de dataset permite grabar episodios de evaluacion estandarizados para comparar checkpoints.
- Docencia y formacion en robotica con aprendizaje: un modelo pequeno, con licencia Apache 2.0 y entrenamiento documentado por comandos de consola, es adecuado para practicas de imitacion y evaluacion de politicas.
- Benchmark interno de infraestructura: util para medir latencia y throughput de inferencia de SmolVLA en distintas GPU antes de escalar a modelos VLA mayores.
- Automatizacion de tareas de recogida en entornos controlados (por ejemplo, clasificacion de pequenos objetos en cajas) unicamente si la morfologia del robot, la camara y los objetos son muy similares a los del dataset de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este checkpoint no incluye tasas de exito, numero de episodios de evaluacion, comparaciones con el modelo base ni metricas de latencia. El unico dato cuantitativo verificable es el recuento de parametros (450.046.176) y el tamano del repositorio (0,9 GB).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano, los pesos en bf16 ocuparian alrededor de 0,9 GB y en fp32 alrededor de 1,8 GB, a lo que hay que sumar el coste de los codificadores visuales, los buffers de observacion y el estado del robot; el pico real depende de la implementacion y no esta documentado.
- GPU recomendadas: no disponibles en la informacion proporcionada. La model card afirma que SmolVLA puede desplegarse en hardware de consumo, lo que situa el objetivo en GPU de gama media tipo RTX 3060/4060 o superiores; no se confirma compatibilidad con A100, H100 u otras.
- Cabe en GPU de consumo: si, segun la afirmacion generica de la model card sobre SmolVLA, aunque no se enumeran modelos concretos ni configuraciones probadas para este checkpoint.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path` apuntando al checkpoint local o del Hub) sobre PyTorch con CUDA (`--policy.device=cuda` en entrenamiento). No se documenta soporte para vLLM, TGI, llama.cpp u Ollama, que no resultan aplicables a una politica robotica de este tipo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ydaichi/smolvla_notactile_grab_pen_from_bag` | 450.046.176 | No aplica | No publicado | Apache 2.0 | Hugging Face, 0 descargas |
| `lerobot/smolvla_base` | No disponible en la informacion proporcionada (modelo base del anterior) | No aplica | No disponible | No disponible | Hugging Face |
| Variante con tacto del mismo dataset (si existe) | No disponible | No aplica | No disponible | No disponible | No confirmada |
| Otras politicas de LeRobot (por ejemplo, ACT) | No disponible | No aplica | No disponible | No disponible | Hugging Face |

No se dispone de datos verificables de parametros, contexto o rendimiento de las alternativas dentro de la informacion proporcionada, por lo que la comparativa cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. En politicas de imitacion es habitual el sesgo hacia las condiciones de recogida de datos (iluminacion, posicion de camara, morfologia del robot, apariencia de los objetos), pero no hay evidencia publicada para este checkpoint.
- Riesgo de alucinacion: en el sentido linguistico no aplica; el riesgo equivalente es la generacion de trayectorias o acciones incorrectas fuera de la distribucion de entrenamiento, sin mecanismo de seguridad documentado.
- Limitaciones de contexto e idioma: no se documenta el idioma de las instrucciones de tarea ni el rango de observaciones soportado. La generalizacion a tareas, objetos o robots distintos de los del dataset de ajuste fino no esta caracterizada.
- Licencia: Apache 2.0, que permite uso comercial y modificacion, pero el rendimiento del modelo no esta validado y la responsabilidad de su uso en un robot real recae en el integrador.
- Estado del repositorio: 0 descargas y 0 "likes", sin resultados de evaluacion ni historial de validacion por terceros; debe tratarse como material experimental.
- Ambiguedad de la variante: el nombre indica "notactile", pero el dataset asociado se llama `tactile_grab_pen_from_bag`; no se aclara en la model card si la politica ignora las senales tactiles, si se entreno con un subconjunto de datos o si existe una version con tacto.
- Plantilla de la model card: el comando de entrenamiento de ejemplo emplea `--policy.type=act`, lo que puede inducir a error sobre el tipo de politica contenido en el repositorio.
- Ausencia de datos de seguridad: no se documentan paradas de emergencia, limites de par, validacion en banco ni protocolos de evaluacion en robots reales.
- Riesgo para produccion: alto. Sin benchmarks, sin pruebas de robustez y con un unico dataset de ajuste fino, no es recomendable su despliegue en entornos productivos sin una evaluacion exhaustiva previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ydaichi/smolvla_notactile_grab_pen_from_bag
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/ydaichi/tactile_grab_pen_from_bag
- Articulo de SmolVLA (referenciado en la model card): https://huggingface.co/papers/2506.01844 y https://arxiv.org/abs/2506.01844
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a sitios de juegos de azar y no guardan relacion con esta ficha.
