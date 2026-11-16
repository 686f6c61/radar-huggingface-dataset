# whosricky/smolvla_lw_double_piper

## Resumen

SmolVLA es un modelo compacto de tipo vision-language-action (VLA) desarrollado por Hugging Face, disenado para controlar robots manipuladores a partir de observaciones visuales y del estado de las articulaciones. Este repositorio concreto, `whosricky/smolvla_lw_double_piper`, es un fine-tuning del checkpoint base `lerobot/smolvla_base` sobre el conjunto de datos `LightwheelAI/Lightwheel-Tasks-Double-Piper`, orientado a un robot de doble brazo Piper con tres camaras.

El modelo resuelve el problema de traducir instrucciones de tarea en lenguaje natural y percepcion visual multi-camara en trayectorias de accion de 12 dimensiones (6 por brazo), lo que permite ejecutar tareas de manipulacion domestica como abrir cajones, colocar objetos en estantes o encender la cocina. Su relevancia radica en que un VLA de apenas 450 millones de parametros puede desplegarse en hardware de consumo, algo impensable en modelos VLA de mayor tamano.

La arquitectura subyacente combina un codificador visual, un modelo de lenguaje compacto y un decodificador de acciones, siguiendo el diseno presentado en el paper SmolVLA (arXiv:2506.01844). Este fine-tuning concreto se ha entrenado sobre 6500 episodios y mas de 6 millones de frames a 50 FPS, lo que lo hace util para experimentacion en robotica de manipulacion con el ecosistema LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacto, segun SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Tipo de robot | double_piper |
| Camaras | left_hand, first_person, right_hand |
| Entrada de estado | `observation.state` de forma (6,) |
| Entrada visual | 3 camaras de (3, 256, 256) |
| Salida de accion | `action` de forma (12,) |
| Modelo base | lerobot/smolvla_base |
| Dataset de entrenamiento | LightwheelAI/Lightwheel-Tasks-Double-Piper |
| Episodios de entrenamiento | 6500 |
| Frames de entrenamiento | 6.010.166 |
| Frecuencia de frames | 50 FPS |
| Tamano del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-language-action que integra percepcion visual multi-camara, estado propioceptivo del robot y una instruccion de tarea para generar acciones motoras continuas. La arquitectura sigue el diseno descrito en el paper arXiv:2506.01844, que propone un VLA compacto capaz de alcanzar rendimiento competitivo con un coste computacional reducido y despliegue en hardware de consumo. El modelo procesa tres flujos visuales de 256x256 pixeles junto con un vector de estado de 6 dimensiones, y emite un vector de accion de 12 dimensiones correspondiente a los dos brazos del robot Piper.

El entrenamiento de este checkpoint parte de `lerobot/smolvla_base` y se ha realizado mediante fine-tuning sobre el dataset `LightwheelAI/Lightwheel-Tasks-Double-Piper`, compuesto por 6500 episodios y 6.010.166 frames capturados a 50 FPS. Las tareas cubiertas incluyen manipulacion de objetos cotidianos en un entorno de cocina simulado o real: abrir y cerrar cajones y microondas, colocar bowls, tazas y sartenes en estantes, encender y apagar la cocina, o apilar recipientes. No se dispone de informacion sobre la composicion exacta del dataset, el uso de RLHF o DPO, ni sobre innovaciones tecnicas adicionales mas alla de las descritas en el paper base.

## Capacidades

- Control robatico de manipulacion de doble brazo: genera acciones de 12 dimensiones para un robot Piper con dos brazos.
- Percepcion visual multi-camara: procesa simultaneamente tres vistas (mano izquierda, primera persona y mano derecha) a 256x256.
- Condicionamiento por instruccion de tarea: ejecuta tareas descritas en lenguaje natural, como "L90K3TurnOnTheStove" o "L90L1PickUpTheAlphabetSoupAndPutItInTheBasket".
- Manipulacion de objetos cotidianos: bowls, tazas, sartenes, cajas de comida, botellas, libros y electrodomesticos.
- Tareas de apertura y cierre: cajones, microondas y puertas de armarios.
- Tareas de colocacion y apilamiento: colocar objetos en platos, cestas, bandejas o estantes, y apilar bowls.
- Integracion con LeRobot: entrenamiento, evaluacion y despliegue mediante la libreria LeRobot de Hugging Face.
- No se ha documentado soporte de tool calling, agentes multi-paso, capacidades multilingues ni modos de razonamiento explicito.

## Casos de uso

- Automatizacion de tareas domesticas en robot de doble brazo: el modelo puede ejecutar secuencias como abrir el cajon superior del armario y colocar el bowl negro dentro, usando las tres camaras para localizar el objeto y el estado de las articulaciones para planificar la trayectoria.
- Investigacion en robotica de manipulacion: sirve como punto de partida para experimentar con fine-tuning sobre nuevos datasets de LeRobot, gracias a su tamano reducido (450 M de parametros) y licencia Apache 2.0.
- Prototipado en hardware de consumo: al ser un VLA compacto, puede desplegarse en estaciones de trabajo con GPU consumer para iterar rapidamente en laboratorio antes de escalar a entornos de produccion.
- Benchmarking de politicas VLA: permite comparar el rendimiento de SmolVLA frente a otros modelos sobre las mismas tareas del dataset Lightwheel, facilitando estudios comparativos reproducibles.
- Educacion y formacion: util como ejemplo practico de entrenamiento de politicas vision-language-action con LeRobot en cursos de robotica o aprendizaje por imitacion.
- Evaluacion de generalizacion entre tareas: el dataset cubre decenas de tareas con variaciones de posicion y objeto (por ejemplo, colocar el bowl negro delante, detras o en medio del plato), lo que permite estudiar la robustez del modelo ante cambios de configuracion.
- Despliegue en entornos de cocina simulada: las tareas de encendido de cocina, manejo de sartenes y colocacion de alimentos en cestas son directamente aplicables a entornos simulados de cocina para entrenamiento y validacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; con 450 M de parametros en safetensors, una estimacion orientativa en FP32 seria de aproximadamente 1,8 GB solo para pesos, mas el coste de las tres entradas visuales de 256x256 y el estado del robot.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU consumer: el paper base de SmolVLA indica que puede desplegarse en hardware de consumo, pero no se especifican modelos concretos en la informacion disponible.
- Opciones de despliegue: LeRobot (libreria oficial de Hugging Face para entrenamiento e inferencia); no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI, que no son aplicables a un modelo de robotica de este tipo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whosricky/smolvla_lw_double_piper | 450.046.176 | no disponible | VLA (robotica) | apache-2.0 | Hugging Face (0 descargas) |
| lerobot/smolvla_base | no disponible en la informacion | no disponible | VLA (robotica) | no disponible en la informacion | Hugging Face |
| Otros VLA de referencia (p. ej. OpenVLA, RT-2) | no disponible en la informacion | no disponible | VLA (robotica) | no disponible en la informacion | no disponible en la informacion |

La comparacion con alternativas concretas no puede completarse con los datos proporcionados; solo se dispone de la referencia al modelo base `lerobot/smolvla_base`, del que este checkpoint es un fine-tuning.

## Limitaciones y advertencias

- Modelo especializado en robotica: no es un modelo de lenguaje general; no debe usarse para generacion de texto, codigo o tareas conversacionales.
- Dependencia del robot y del dataset: las acciones estan calibradas para el robot `double_piper` con tres camaras concretas (`left_hand`, `first_person`, `right_hand`); su uso en otro hardware requerira reentrenamiento o adaptacion.
- Alcance de tareas limitado: el modelo esta entrenado sobre un conjunto cerrado de tareas del dataset Lightwheel; no se ha documentado su capacidad de generalizacion a tareas no vistas.
- Riesgo de alucinacion motora: como toda politica de aprendizaje por imitacion, puede generar trayectorias incorrectas o inseguras en configuraciones no representadas en el entrenamiento.
- Sesgos del dataset: el rendimiento puede degradarse ante variaciones de iluminacion, posicion de objetos o configuracion del entorno no presentes en los 6500 episodios de entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias sobre el rendimiento en produccion.
- Sin datos de benchmarks publicados: no es posible verificar el rendimiento real del checkpoint frente al modelo base ni frente a alternativas.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validacion por parte de la comunidad.
- Idiomas: no se especifican idiomas soportados; las instrucciones de tarea del dataset estan en ingles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/whosricky/smolvla_lw_double_piper
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/LightwheelAI/Lightwheel-Tasks-Double-Piper
- Paper SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Guia LeRobot SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
