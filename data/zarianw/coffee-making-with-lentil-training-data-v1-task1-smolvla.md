# zarianw/coffee-making-with-lentil-training-data-v1-task1-smolvla

## Resumen

El modelo `zarianw/coffee-making-with-lentil-training-data-v1-task1-smolvla` es una política robótica de tipo vision-language-action (VLA) publicada por el usuario zarianw en HuggingFace. Se trata de un ajuste fino de `lerobot/smolvla_base`, el modelo compacto SmolVLA presentado en el paper arXiv:2506.01844, y está entrenado para una única tarea de manipulación: coger una cuchara dosificadora, transferir una cucharada de lentejas naranjas a un vaso blanco y dejar la cuchara. El modelo consume el estado del robot y tres cámaras, y produce comandos de acción de 6 dimensiones.

Con 450.046.176 parámetros (~450 M) y un repositorio de 0,9 GB, la relevancia de esta ficha es doble: por un lado, ejemplifica el flujo de trabajo completo de LeRobot (grabación de datos, entrenamiento por imitación y despliegue en un brazo SO-100); por otro, demuestra que un VLA funcional cabe en hardware de consumo, algo poco habitual en políticas de manipulación que suelen superar los miles de millones de parámetros. La licencia Apache-2.0 facilita su reutilización y su uso como punto de partida para otros ajustes finos.

Es importante señalar que no se trata de un modelo de lenguaje ni de un modelo generativo de propósito general: es una política de control entrenada para una tarea concreta sobre un embodiment concreto, y no se han publicado resultados de evaluación en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en SmolVLA (arXiv:2506.01844); combina un modelo vision-lenguaje preentrenado con un modulo de accion. Detalle interno completo, no disponible en la informacion proporcionada |
| Parametros totales | 450.046.176 (~450 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; la unica entrada de lenguaje es la descripcion de la tarea |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en safetensors y el repositorio ocupa 0,9 GB |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Tipo de robot | `so_follower` (brazo SO-100 seguidor) |
| Camaras | 3 entradas visuales (`wrist`, `front`, `top`), cada una de forma (3, 256, 256) |
| Entrada de estado | `observation.state`, forma (6,) |
| Salida | `action`, forma (6,) |
| Modelo base | `lerobot/smolvla_base` (ajuste fino) |
| Tamano del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

La politica se apoya en SmolVLA, un modelo vision-language-action compacto disenado para reducir el coste computacional manteniendo un rendimiento competitivo y permitiendo el despliegue en hardware de consumo. El modelo recibe como entrada tres flujos visuales de 256x256 píxeles (munequera, frontal y superior), junto con el estado articular del robot de 6 dimensiones, y genera directamente un vector de accion de 6 dimensiones. No se dispone de mas detalle sobre la composicion interna de capas, el tipo de cabezal de accion o el mecanismo de atencion en la informacion proporcionada; el paper de referencia del modelo base es arXiv:2506.01844.

El entrenamiento se realizo mediante aprendizaje por imitacion sobre el dataset `zarianw/coffee-making-with-lentil-training-data-v1_20260921_020700`, compuesto por 50 episodios y 55.513 fotogramas a 30 FPS de la tarea "Pick scoop, transfer one scoop of orange lentil into white cup, and put the scoop down". La configuracion de entrenamiento fue de 25.000 pasos, tamano de lote 64, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000, usando LeRobot 0.6.2. No se documenta el uso de RLHF, DPO ni tecnicas de refuerzo: se trata de clonacion de comportamiento pura sobre demostraciones. Tampoco se especifican aumentos de datos, composicion de la mezcla de entrenamiento ni estrategia de regularizacion.

## Capacidades

- Generacion de acciones de control de 6 grados de libertad para un brazo SO-100 (`so_follower`) a partir de observaciones visuales y de estado.
- Percepcion visual multi-camara simultanea: tres flujos RGB de 256x256 (munequera, frontal y superior) por paso de inferencia.
- Ejecucion de una tarea de manipulacion de precision predefinida: coger una cuchara dosificadora, transferir una cucharada de lentejas naranjas a un vaso blanco y depositar la cuchara.
- Condicionamiento por instruccion de lenguaje en ingles: la tarea se pasa como cadena de texto en el comando de despliegue.
- Integracion nativa con el ecosistema LeRobot para rollout y reentrenamiento mediante linea de comandos.
- Capacidad de servir como base para ajuste fino en nuevas tareas de manipulacion sobre el mismo tipo de robot.
- No soporta tool calling, function calling, razonamiento multi-paso deliberativo, vision general de imagenes ni audio: estas capacidades no estan documentadas ni son aplicables a una politica de control.

## Casos de uso

- Dosificacion de ingredientes secos en cocina robotizada: el modelo ejecuta el ciclo completo de coger cuchara, transferir una porcion de lentejas y dejarla, lo que sirve como bloque base para automatizar el porcionado de granos en estaciones de cocina, aunque la tarea entrenada es unica y concreta.
- Aprendizaje por imitacion de referencia: con 50 episodios y 25.000 pasos documentados, es un caso de estudio reproducible para laboratorios que quieran medir cuanto rendimiento se obtiene con un volumen de datos tan reducido sobre un VLA de 450 M de parametros.
- Punto de partida para ajuste fino con `lerobot-train`: partiendo de `lerobot/smolvla_base` o de esta politica, un equipo puede reentrenar para tareas como colocar objetos, verter o apilar, reutilizando la misma configuracion de camaras y el mismo brazo SO-100.
- Validacion de pipelines de despliegue en hardware de consumo: al ocupar 0,9 GB de pesos, permite probar el ciclo completo de inferencia (captura de camaras, politica, envio de acciones al robot) en una GPU de gama media o incluso en CPU para pruebas de integracion.
- Docencia y divulgacion en robotica de bajo coste: el brazo SO-100 y un modelo de este tamano hacen viable montar una practica de robotica con manipulacion real en un laboratorio universitario o en un taller, con coste de hardware y de computo reducidos.
- Evaluacion de robustez ante cambios de dominio: al estar entrenada sobre 55.513 fotogramas con tres vistas fijas, la politica permite experimentar con variaciones de iluminacion, posicion del vaso o tipo de grano para medir la degradacion por cambio de distribucion, siempre que se registren los resultados (el autor no ha publicado ninguno).
- Demostraciones en ferias y presentaciones tecnicas: la tarea es visualmente clara y breve, y el modelo se ejecuta con `lerobot-rollout` y una duracion acotada, lo que facilita montar una demo continua de manipulacion con aprendizaje por imitacion.
- Integracion en lineas de pick-and-place de pequenos componentes: el flujo estado (6,) mas accion (6,) es directamente reutilizable en tareas de agarre y deposito con utillaje ligero, aunque requeriria reentrenamiento especifico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye de forma explicita la seccion "Evaluation" con el texto "_No evaluation results have been provided for this policy yet_" y una plantilla de tabla de tareas, ensayos y tasa de exito que el autor no ha rellenado. No se dispone, por tanto, de tasas de exito en robot real, ni de comparaciones con otras politicas sobre el mismo dataset.

## Requisitos de hardware

- Peso de los parametros: aproximadamente 1,8 GB en FP32 y 0,9 GB en FP16/BF16 para 450.046.176 parametros, coherente con el tamano de repositorio declarado de 0,9 GB.
- VRAM estimada para inferencia: del orden de 2 a 4 GB en BF16 con lote 1, a lo que hay que sumar el coste de procesar tres imagenes de 256x256 por paso. Con margen para el runtime, 6-8 GB resultan suficientes.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4070, RTX 4090). En datacenter, A100 o H100 no aportan ventaja relevante por el reducido tamano del modelo, salvo para paralelizar muchas instancias.
- Cabe en GPU consumer: si. El diseno de SmolVLA esta orientado explicitamente a despliegue en hardware de consumo; tambien es viable la inferencia en CPU o en Apple Silicon para pruebas, con latencia mayor.
- Opciones de despliegue: `lerobot-rollout` y `lerobot-train` (LeRobot 0.6.2 o compatible), PyTorch, y carga directa desde el Hub. Las pilas de servicio de LLM (vLLM, TGI, llama.cpp, Ollama) no son aplicables, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible en la informacion proporcionada. El paper del modelo base describe tecnicas de inferencia asincrona para mejorar el rendimiento, pero no se incluyen cifras concretas en los datos facilitados.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (smolvla fine-tune) | 450.046.176 (~450 M) | VLA, una tarea, robot `so_follower` | Apache-2.0 | HuggingFace, libreria `lerobot` | Sin resultados de evaluacion publicados |
| `lerobot/smolvla_base` | ~450 M | VLA base, multi-tarea | Apache-2.0 | HuggingFace | Modelo de partida de este ajuste fino; reentrenable con `lerobot-train` |
| OpenVLA | ~7 B | VLA | MIT (segun su model card publica) | HuggingFace y repositorio publico | Tamano muy superior; requiere hardware mas potente |
| Politica pi0 / openpi | ~3,3 B | VLA | Apache-2.0 (segun su repositorio publico) | Repositorio openpi | Orientada a robots de mayor coste y a hardware de gama alta |
| ACT (LeRobot) | no disponible en la informacion proporcionada | Transformer de clonacion de comportamiento | Apache-2.0 (LeRobot) | HuggingFace y LeRobot | Alternativa clasica de imitacion para brazos de bajo coste |

Los datos de parametros y licencias de OpenVLA, pi0/OpenVLA y ACT corresponden a documentacion publica de sus respectivos proyectos y no se han verificado contra las fuentes originales en esta busqueda; la busqueda web realizada para esta ficha no devolvio resultados relacionados con el modelo. No se dispone de comparaciones de rendimiento entre estas politicas y el modelo descrito.

## Limitaciones y advertencias

- Tarea unica: la politica esta entrenada exclusivamente para "coger cuchara, transferir una cucharada de lentejas naranjas a un vaso blanco y dejar la cuchara". No se documenta capacidad de generalizacion a otras instrucciones.
- Embodiment fijo: entrenada para el robot `so_follower` con estado y accion de 6 dimensiones. Cambiar de brazo, de numero de articulaciones o de cinematica invalidaria el modelo.
- Configuracion de camaras rigida: requiere exactamente las tres vistas `wrist`, `front` y `top` con los nombres de las claves de observacion usadas en el entrenamiento. Un montaje distinto degradara o anulara el comportamiento.
- Datos de entrenamiento escasos: 50 episodios y 55.513 fotogramas para 25.000 pasos de entrenamiento. El riesgo de sobreajuste a las posiciones, iluminacion y objetos de las demostraciones es alto.
- Ausencia total de evaluacion: no hay tasa de exito ni numero de ensayos publicados. Cualquier afirmacion sobre su fiabilidad en produccion carece de respaldo empirico.
- Cambio de distribucion: variaciones en el tipo de grano, el color o tamano del vaso, la iluminacion o la posicion inicial de los objetos no estan cubiertas por el dataset y pueden provocar fallos silenciosos.
- Error compuesto en control: al ser una politica de imitacion, los pequenos errores de accion se acumulan a lo largo del episodio; no dispone de un mecanismo de recuperacion explicito documentado.
- Sesgos: no se documenta ningun analisis de sesgos del dataset. Al proceder de demostraciones humanas, el modelo hereda las trayectorias, la velocidad y los habitos del operador que grabo los datos.
- Alucinacion: el concepto no aplica en el sentido de generacion de texto, pero si existe un riesgo analogo de acciones incoherentes o no fisicas cuando la observacion se aleja de la distribucion de entrenamiento.
- Idioma: la unica entrada de lenguaje es la descripcion de la tarea y esta en ingles; no se documenta soporte multilingue ni traduccion de instrucciones.
- Licencia: Apache-2.0 permite uso comercial y modificacion, con obligacion de conservar el aviso de licencia y el archivo NOTICE si existe. Debe verificarse ademas la licencia del modelo base `lerobot/smolvla_base` y del dataset utilizado.
- Seguridad fisica: es una politica de control robotico. Su despliegue requiere limitadores de par, paradas de emergencia, espacio de trabajo delimitado y supervision humana durante las pruebas.
- Version de software: entrenada con LeRobot 0.6.2; cambios de version en la libreria pueden alterar el formato de las observaciones o la carga del checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zarianw/coffee-making-with-lentil-training-data-v1-task1-smolvla
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/zarianw/coffee-making-with-lentil-training-data-v1_20260921_020700
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=zarianw/coffee-making-with-lentil-training-data-v1_20260921_020700
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentacion de rollout e inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Nota: la busqueda web realizada para esta ficha no devolvio ningun resultado relacionado con el modelo; los enlaces anteriores proceden de la informacion de HuggingFace y de la model card.
