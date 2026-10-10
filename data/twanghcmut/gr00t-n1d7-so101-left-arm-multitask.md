# twanghcmut/gr00t-n1d7-so101-left-arm-multitask

## Resumen

El modelo `twanghcmut/gr00t-n1d7-so101-left-arm-multitask`, publicado por el usuario twanghcmut, es un ajuste fino del modelo vision-language-action (VLA) NVIDIA Isaac GR00T N1.7 3B sobre 11 tareas robóticas del brazo izquierdo de un SO101. El resultado es una única política multitarea de 3.144.016.000 parametros que selecciona el comportamiento en funcion de la instruccion en lenguaje natural, en lugar de mantener un checkpoint por tarea.

El entrenamiento se realizo sobre los 11 conjuntos de la coleccion SO101_LeftArmOnly_Task (hungho77), fusionados en un unico conjunto multitarea de 551 episodios y 253.745 fotogramas. Solo se entrenaron el proyector, la layer norm del modulo vision-lenguaje y la cabeza de difusion; el backbone LLM y el backbone de vision permanecieron congelados. El ajuste fino consumio 6.000 pasos con un lote global de 128 sobre una unica H100 de 80 GB, en 9,2 horas, y alcanzo una perdida de entrenamiento final de 0,0256.

Es relevante ahora porque demuestra que un unico VLA de 3B puede abarcar un repertorio heterogeneo de manipulaciones (apilar, equilibrar, insertar en cubos huecos, ordenar por tamano) con un error de bucle abierto del 10,27 % de la escala de accion, un valor practicamente identico al del checkpoint de π₀.₅ entrenado con los mismos datos y el mismo presupuesto (9,82 %). La licencia Apache 2.0 y el formato safetensors compatible con la libreria LeRobot facilitan su reutilizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en NVIDIA Isaac GR00T N1.7: backbone LLM y backbone de vision congelados, mas proyector, layer norm VL y cabeza de difusion entrenados |
| Parametros totales | 3.144.016.000 (3,144 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (modelo de robotica; horizonte de accion de 16 pasos, observacion con T = 1) |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors, aproximadamente 12,6 GB, coherente con fp32) |
| Idiomas soportados | no disponible (las instrucciones de entrenamiento estan en ingles y el autor advierte que el modelo no ha visto parafrasis) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria LeRobot) |
| Modelo base | nvidia/GR00T-N1.7-3B |
| Embodiment | SO101 follower arm (izquierdo), 5 articulaciones mas pinza; etiqueta `NEW_EMBODIMENT` |
| Dimension de estado / accion | 6: `shoulder_pan`, `shoulder_lift`, `elbow_flex`, `wrist_flex`, `wrist_roll` + `gripper` |
| Camaras | `top` (cenital, 360x640) y `wrist` (480x640), RGB |
| Horizonte de accion | 16 |
| Frecuencia de datos | 30 fps |
| Representacion de accion | `single_arm` relativa (delta respecto al estado actual); `gripper` absoluta |
| Tamano del repositorio | 12,6 GB |

## Arquitectura y entrenamiento

GR00T N1.7 es una arquitectura vision-language-action: un backbone de vision y un LLM procesan las observaciones (imagenes cenital y de muneca) junto con la instruccion en lenguaje natural, y una cabeza de difusion genera las acciones. En este ajuste fino se entrenaron unicamente el proyector, la layer norm del bloque vision-lenguaje y la cabeza de difusion, mientras que el LLM y el backbone de vision se mantuvieron congelados. El entrenamiento duro 6.000 pasos con un lote global de 128 (768.000 muestras), tasa de aprendizaje 1e-4 con decaimiento coseno y 5 % de calentamiento, weight decay 1e-5 y `episode_sampling_rate` de 0,1. La perdida de entrenamiento evoluciono de 0,075 en el paso 500 a 0,026 en el paso 6.000, con una media de 0,0256 en los pasos 5.760-6.000.

Los datos proceden de 11 conjuntos de la coleccion SO101_LeftArmOnly_Task, fusionados en un unico conjunto multitarea de 551 episodios y 253.745 fotogramas, con 50 o 51 episodios por tarea. La instruccion de lenguaje es la variable de control: cada una de las 11 tareas se activa con una frase concreta, y el autor indica que hay que usar la redaccion exacta, incluida la puntuacion final, porque el modelo no ha sido entrenado con parafrasis. El ajuste se ejecuto en 1x H100 de 80 GB durante 9,2 horas a 23 muestras/s, con el cargador de datos como cuello de botella.

## Capacidades

- Generacion de acciones de manipulacion robótica en bucle cerrado a partir de observaciones visuales y de estado articular.
- Multitarea con una sola politica: 11 comportamientos distintos seleccionados mediante instruccion textual, sin cambiar de checkpoint.
- Manipulacion de pick-and-place: coger el cubo rojo o azul y depositarlo en una olla de acero.
- Tareas compuestas de varios pasos: coger el platano, meterlo en la olla y cerrar la tapa.
- Apilado y construccion: apilar el cubo amarillo sobre el naranja y apilar dos bloques naranjas.
- Razonamiento visual sencillo sobre cantidades y colores: elegir el cubo que iguala el numero de cubos rojos y azules en un tablero de madera.
- Manipulacion de objetos contenedores: introducir el cubo rojo en un cubo hueco naranja y colocar despues ese cubo hueco sobre el tablero.
- Ordenacion por tamano: extraer cubos azules de menor a mayor altura.
- Extraccion de objetos de contenedores: sacar cubos de la olla y colocarlos sobre otro cubo del mismo color.
- Soporte de acciones con horizonte de 16 pasos, con representacion relativa para el brazo y absoluta para la pinza.
- Servido como politica remota mediante `gr00t/eval/run_gr00t_server.py` y cliente compatible con `Gr00tPolicy`.
- No dispone de soporte documentado de tool calling, function calling, agentes multi-paso textuales, audio ni vision generalista fuera del pipeline de robotica.

## Casos de uso

- Manipulacion de laboratorio con un unico brazo SO101: el modelo cubre 11 tareas de pick-and-place con una sola politica, lo que reduce el numero de checkpoints que hay que cargar y conmutar en un banco de pruebas robotico.
- Evaluacion comparativa de arquitecturas VLA: al existir un ajuste equivalente de π₀.₅ sobre los mismos datos y el mismo presupuesto, sirve como referencia controlada para medir el error de bucle abierto de GR00T N1.7 frente a π₀.₅ en 11 trayectorias concretas.
- Automatizacion de tareas de clasificacion por color y tamano: el modelo resuelve instrucciones que exigen contar cubos rojos y azules y elegir el que iguala la cantidad, util en celdas de clasificacion con objetos pequenos.
- Ensamblaje ligero y apilado: las tareas 6 y 7 (apilar cubo amarillo sobre naranja y apilar bloques naranjas) son representativas de operaciones de stacking en lineas de montaje de baja carga.
- Manipulacion con contenedores y tapas: la tarea 2 (introducir el platano y cerrar la tapa) permite prototipar rutinas de llenado y cierre en entornos de empaquetado.
- Investigacion en generalizacion de instrucciones: al no haber sido entrenado con parafrasis, el modelo es un caso de estudio util para medir la sensibilidad de una politica VLA a la redaccion exacta de la orden.
- Docencia y prototipado en robotica con LeRobot: la integracion con la libreria LeRobot y el servidor de politica permiten montar un banco de pruebas reproducible de VLA sobre hardware SO101 asequible.
- Recogida de datos de referencia en bucle abierto: el script `gr00t/eval/open_loop_eval.py` permite comparar trayectorias predichas contra las de entrenamiento con una metrica de MAE por tarea.

## Benchmarks y rendimiento

Evaluacion de bucle abierto declarada por el autor: una trayectoria por tarea, hasta 400 pasos, horizonte de accion 16, ejecutada contra los datos de entrenamiento con `gr00t/eval/open_loop_eval.py`. Los errores estan desnormalizados, en las unidades de accion propias del conjunto de datos.

| traj | Tarea | MAE |
|---|---|---|
| 0 | 0 cubo rojo a la olla | 2,098 |
| 50 | 1 cubo azul a la olla | 2,327 |
| 100 | 2 platano a la olla y cerrar tapa | 3,258 |
| 150 | 3 cubo azul junto a cubo azul | 3,372 |
| 200 | 4 cubo azul fuera de la olla sobre cubo azul | 2,374 |
| 251 | 5 cubo rojo fuera de la olla sobre cubo rojo | 2,941 |
| 301 | 6 apilar amarillo sobre naranja | 2,604 |
| 351 | 7 apilar bloques naranjas | 3,567 |
| 401 | 8 equilibrar rojo y azul en el tablero | 3,717 |
| 451 | 9 cubo rojo via cubo hueco | 2,760 |
| 501 | 10 cubos azules de menor a mayor | 3,385 |
| | Media | 2,946 (MSE 25,02) |

Dividido por la desviacion estandar absoluta de las acciones (media 28,67 entre dimensiones), el error es del 10,27 % de la escala de accion con horizonte 16. El checkpoint de π₀.₅ entrenado con los mismos datos y presupuesto obtiene un 9,82 % en las mismas 11 trayectorias; GR00T tiene menor error en 5 de ellas (en la trayectoria 100, solo por 0,001). El autor advierte que ambas cifras proceden del script de bucle abierto de cada framework, por lo que una diferencia tan pequena debe interpretarse como empate y no como ranking.

No se han publicado resultados en benchmarks estandar de texto (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que no es un modelo de lenguaje generalista.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir de los 3,144 B de parametros): aproximadamente 12,6 GB en fp32 (el formato publicado), 6,3 GB en bf16, 3,1 GB en int8 y 1,6 GB en int4. Estas cifras corresponden solo a los pesos; hay que anadir el coste de las activaciones y de los dos flujos de video de entrada.
- GPU recomendadas: H100 de 80 GB para entrenamiento (configuracion declarada por el autor). Para inferencia, cualquier GPU con al menos 16 GB de VRAM en fp32 deberia ser suficiente para los pesos, aunque el requisito real depende del pipeline de vision.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas (RTX 4090, RTX 4080, RTX 3090) para los pesos en fp32, o en tarjetas de 8-12 GB si se convierte a bf16 o cuantizaciones menores.
- El autor no publica cifras de latencia ni de throughput de inferencia. El unico dato de velocidad disponible es el del entrenamiento: 23 muestras/s, limitado por el cargador de datos, en 1x H100 de 80 GB durante 9,2 horas.
- Opciones de despliegue: servidor de politica oficial `python gr00t/eval/run_gr00t_server.py --model-path twanghcmut/gr00t-n1d7-so101-left-arm-multitask --embodiment-tag NEW_EMBODIMENT --host 0.0.0.0 --port 5555`, con cliente `Gr00tPolicy`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de generacion de texto.
- Advertencia de despliegue: no arrancar el servidor con `--use-sim-policy-wrapper`, porque cambia el formato de observacion anidado por el formato plano que usan los entornos de simulacion.

## Comparativa con modelos similares

| Modelo | Parametros | Datos de entrenamiento | Error de bucle abierto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| twanghcmut/gr00t-n1d7-so101-left-arm-multitask | 3,144 B | 551 episodios, 253.745 fotogramas, 11 tareas | 10,27 % de la escala de accion (media MAE 2,946) | Apache 2.0 | HuggingFace, safetensors, LeRobot |
| twanghcmut/pi05-so101-left-arm-multitask (π₀.₅) | no disponible | los mismos datos y el mismo presupuesto de entrenamiento | 9,82 % de la escala de accion en las mismas 11 trayectorias | no disponible en la informacion proporcionada | HuggingFace |
| nvidia/GR00T-N1.7-3B (modelo base) | 3 B (aproximado, segun el nombre del checkpoint; el ajuste tiene 3,144 B) | no disponible | no disponible | no disponible en la informacion proporcionada | HuggingFace |

No se dispone de datos de otros VLA comparables (OpenVLA, RT-1, etc.) en la informacion proporcionada, por lo que no se incluyen cifras de esos modelos.

## Limitaciones y advertencias

- No existe particion de validacion ni de test: los 551 episodios se usaron integramente para entrenamiento. El parametro `episode_sampling_rate` submuestrea pasos temporales dentro de los episodios, no episodios completos, por lo que no se reservo nada. Las metricas de bucle abierto se calculan por tanto contra datos vistos.
- El modelo solo responde a la redaccion exacta de las 11 instrucciones, incluida la puntuacion final. No ha sido entrenado con parafrasis, sinonimos ni variaciones de estilo; una reformulacion puede degradar o anular el comportamiento.
- Riesgo de alucinacion de acciones: como toda politica generativa, en estados fuera de la distribucion de entrenamiento puede producir trayectorias plausibles pero fisicamente incorrectas, sin senal de incertidumbre.
- Especificidad de embodiment: el modelo esta ajustado exclusivamente al brazo izquierdo de un SO101 con 5 articulaciones mas pinza, dos camaras concretas (`top` a 360x640 y `wrist` a 480x640) y 30 fps. No es trasladable directamente a otras configuraciones sin nuevo ajuste.
- Mezcla de representaciones de accion: `single_arm` es relativa y `gripper` es absoluta. El servidor de politica desnormaliza ambas, de modo que `get_action` devuelve objetivos absolutos de articulacion; confundir los espacios de accion es un error frecuente de integracion.
- Restricciones de licencia: la licencia declarada es Apache 2.0, que permite uso comercial, pero el modelo deriva de nvidia/GR00T-N1.7-3B y conviene verificar las condiciones de ese modelo base para el uso previsto.
- Idiomas: no hay informacion sobre capacidades multilingues; las instrucciones de entrenamiento estan en ingles.
- Cuantizacion: no se documentan versiones GGUF, AWQ, GPTQ ni cuantizaciones validadas, por lo que reducir precision es un procedimiento no verificado por el autor.
- La model card esta truncada en la seccion de limitaciones, de modo que puede haber advertencias adicionales del autor no recogidas aqui.
- El modelo no esta disenado para generacion de texto, razonamiento simbolico, codigo ni matematicas; su salida son acciones de robot.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/twanghcmut/gr00t-n1d7-so101-left-arm-multitask
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Checkpoint comparable de π₀.₅: https://huggingface.co/twanghcmut/pi05-so101-left-arm-multitask
- Coleccion de datos SO101_LeftArmOnly_Task: https://huggingface.co/collections/hungho77/so101-leftarmonly-task
- Conjuntos de datos individuales citados en la model card: hungho77/so101_left_arm_pick_red_cube_into_pot, hungho77/so101_left_arm_pick_blue_cube_into_pot, hungho77/so101_left_arm_pick_banana_close_lid, hungho77/so101_left_arm_blue_cube_next_to_blue_cube, hungho77/so101_left_arm_blue_cube_out_of_pot_onto_blue_cube, hungho77/so101_left_arm_red_cube_out_of_pot_onto_red_cube, hungho77/so101_left_arm_stack_yellow_on_orange_cube, hungho77/so101_left_arm_stack_orange_blocks, hungho77/so101_left_arm_balance_red_blue_on_wooden_board, hungho77/so101_left_arm_red_cube_into_orange_hollow_cube, hungho77/so101_left_arm_blue_cubes_shortest_to_tallest
- Scripts de evaluacion y servido citados: `gr00t/eval/run_gr00t_server.py` y `gr00t/eval/open_loop_eval.py` (repositorio del proyecto GR00T, ruta no enlazada en la informacion proporcionada)
- No se han encontrado papers, blogs ni demos adicionales en la busqueda web realizada.
