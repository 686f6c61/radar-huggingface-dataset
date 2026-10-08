# tc-huang/pi05_mahjong_v1_reach07_v0faces_vision

## Resumen

`tc-huang/pi05_mahjong_v1_reach07_v0faces_vision` es un modelo de vision-lenguaje-accion (VLA) de la familia pi0.5, desarrollado por el usuario de Hugging Face tc-huang, y afinado para una tarea robotica muy concreta: senalar con la punta de la mordaza fija de un brazo SO-101 la ficha de mahjong que indica una instruccion. La tarea se ejecuta en el entorno de simulacion `Mahjong-Reach7V0Faces-SO101-v1` de Isaac Lab, y el modelo se ha entrenado exclusivamente en simulacion, sin haberse probado en un brazo real.

Este run parte de `tc-huang/pi05_mahjong_v1_reach07_v0faces`, un modelo previo entrenado 12.000 pasos con el codificador de vision congelado que, segun el autor, apenas distinguia las fichas One, Two y Three Characters mejor que el azar. La pregunta que motiva esta version es si descongelar y entrenar el codificador de vision mejora la discriminacion de las caras de las fichas. Para ello se han realizado 10.000 pasos adicionales (unos 2,2 epocas) partiendo del checkpoint de 12.000 pasos, entrenando todos los parametros.

El modelo se distribuye como una derivacion de Gemma (a traves de `lerobot/pi05_base`, que contiene PaliGemma), por lo que hereda la licencia y las restricciones de uso de Gemma. En el momento de redactar esta ficha el entrenamiento seguia en curso, con checkpoints en las ramas `step-005000` y `step-010000`, y `main` reservada para el ultimo. El modelo no registra descargas ni likes, y no se han publicado resultados de benchmarks cuantitativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en pi0.5; el modelo base `lerobot/pi05_base` contiene PaliGemma (no se detalla la configuracion interna) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenamiento en float32) |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use (modelo derivado de Gemma, con restricciones de la seccion 3.2) |
| Formato de pesos | safetensors (`model.safetensors`) y ficheros `policy_*processor*` |

## Arquitectura y entrenamiento

Se trata de un modelo de accion vision-lenguaje (VLA) de la familia pi0.5, integrado con la libreria LeRobot 0.6.1. La informacion disponible indica que el modelo base `lerobot/pi05_base` contiene PaliGemma, lo que situa la parte perceptiva y de lenguaje sobre un backbone tipo PaliGemma; no se detallan en la model card la composicion exacta de capas ni el numero de parametros. Las entradas del modelo son dos camaras (`front_cam` y `gripper_cam`, RGB a 640 x 480 que pi0.5 reescala a 224 x 224), las seis posiciones de las articulaciones y la instruccion de texto. La salida son objetivos absolutos para las seis articulaciones en grados y la pinza en un rango de 0 a 100.

El entrenamiento es un fine-tuning del run congelado: 10.000 pasos (aproximadamente 2,2 epocas) desde el checkpoint de 12.000 pasos de `tc-huang/pi05_mahjong_v1_reach07_v0faces`, con lote de 16, precision float32, todos los parametros entrenables, tasa de aprendizaje 2,5e-5 con 500 pasos de warmup y decaimiento coseno. En evaluacion se emplea `n_action_steps=10`. Los datos son `tc-huang/mahjong_v1_reach07_v0_1k`, 1.000 demostraciones guionizadas (scripted) a 30 fps. La innovacion concreta de este run es el descongelado del codificador de vision, aplicado para intentar superar la incapacidad del modelo congelado de distinguir las fichas One, Two y Three Characters.

## Capacidades

- Generacion de acciones de control para un brazo robotico SO-101: produce objetivos absolutos para las seis articulaciones (en grados) y para la pinza (0-100).
- Percepcion visual multimodal: procesa dos flujos de camara (`front_cam` y `gripper_cam`) ademas de la posicion articular.
- Seguimiento de instrucciones de texto: apunta la mordaza fija al objeto (ficha de mahjong) que nombra la instruccion.
- Discriminacion de caras de fichas de mahjong: el objetivo especifico de este run es distinguir caras como One, Two y Three Characters.
- Control de robot en simulacion: integrado con el entorno Isaac Lab `Mahjong-Reach7V0Faces-SO101-v1`.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision adicional, audio): no disponible; unicamente se documenta la entrada visual de dos camaras.

## Casos de uso

- Investigacion en manipulacion robotica simulada: el modelo sirve como punto de partida para estudiar si descongelar el codificador visual mejora la discriminacion de objetos pequenos y con detalle fino, comparando el run congelado con este.
- Apuntado preciso (pointing) con brazo SO-101: el modelo genera objetivos articulares para colocar la punta de la mordaza sobre una ficha concreta indicada por texto, util como tarea de referencia en entornos de simulacion.
- Generacion de datos sinteticos y evaluacion de politicas: al integrarse con LeRobot, puede usarse para producir trayectorias o para evaluar politicas en el entorno Isaac Lab.
- Reproduccion de experimentos en robotica open source: el pipeline completo (LeRobot 0.6.1, SO-101, newton-assets) es reproducible por otros grupos que quieran validar el efecto del fine-tuning del codificador.
- Estudio de transferencia simulacion-real: aunque este modelo no se ha probado en hardware real, sirve como base para investigar la brecha sim-a-real en tareas de apuntado fino.
- Docencia y prototipado en VLA: como ejemplo de fine-tuning de pi0.5 sobre datos propios con LeRobot, es util para aprender a adaptar modelos VLA a tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card unicamente aporta una observacion cualitativa sobre el modelo predecesor (`tc-huang/pi05_mahjong_v1_reach07_v0faces`, con el codificador de vision congelado): distinguia las fichas One, Two y Three Characters aproximadamente igual que el azar. Para este run con el codificador descongelado no se ofrecen metricas de exito, tasa de acierto ni comparativas numericas, ya que el entrenamiento seguia en curso.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible en la informacion proporcionada.
- Opciones de despliegue: el modelo se enmarca en la libreria LeRobot 0.6.1 y el ecosistema de control robotico; no se detallan en la model card otros motores de inferencia (vLLM, llama.cpp, Ollama, TGI, etc.).
- Latencia y throughput estimados: no disponible. Los unicos parametros de ejecucion documentados son el lote de entrenamiento de 16, la precision float32 y `n_action_steps=10` en evaluacion, que no equivalen a metricas de latencia en produccion.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. El unico modelo relacionado explicitamente es su predecesor, `tc-huang/pi05_mahjong_v1_reach07_v0faces`, del que este run es un fine-tuning.

| Modelo | Relacion | Parametros | Contexto | Licencia |
|---|---|---|---|---|
| `tc-huang/pi05_mahjong_v1_reach07_v0faces_vision` | Este modelo (vision encoder descongelado, 10.000 pasos adicionales) | no disponible | no disponible | Gemma |
| `tc-huang/pi05_mahjong_v1_reach07_v0faces` | Modelo base del fine-tuning (vision encoder congelado, 12.000 pasos) | no disponible | no disponible | Gemma |

No se dispone de comparativas con otros modelos de la misma categoria (VLA para manipulacion robotica) en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente en simulacion: no se ha ejecutado en un brazo real, por lo que no hay evidencia de transferencia sim-a-real.
- Estado del entrenamiento: en el momento de la informacion proporcionada, el entrenamiento seguia en curso; los checkpoints intermedios estan en las ramas `step-005000` y `step-010000`, y `main` retenia el ultimo, por lo que el modelo puede cambiar.
- Discriminacion visual limitada en el modelo de partida: el run congelado apenas distinguia One, Two y Three Characters mejor que el azar; no se confirma en la informacion si el descongelado lo resuelve.
- Ambito de tarea muy restringido: solo apunta a fichas de mahjong en una tarea concreta de Isaac Lab, no es un modelo general.
- Posibles sesgos: no disponibles de forma explicita; al entrenarse con 1.000 demostraciones guionizadas, el comportamiento queda limitado a la distribucion de esos datos.
- Riesgo de alucinacion: no disponible de forma especifica; al generar acciones de control en simulacion, los errores se traducirian en fallos de apuntado mas que en texto inventado.
- Restricciones de licencia: es una derivacion de Gemma, sujeta a los Gemma Terms of Use, incluida la seccion 3.2 y la Gemma Prohibited Use Policy; estas restricciones deben transmitirse a terceros que reciban el modelo. Se debe respetar tambien la atribucion de las imagenes de fichas (Mahjong_eg_TW.jpg de Cangjie6, CC BY-SA 4.0) y de los modelos del brazo (newton-assets y SO-ARM100, Apache-2.0).
- Caveat para produccion: sin benchmarks ni pruebas en hardware real, no hay base para un despliegue en produccion; su uso razonable es la investigacion y la experimentacion en simulacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tc-huang/pi05_mahjong_v1_reach07_v0faces_vision
- Modelo base (predecesor): https://huggingface.co/tc-huang/pi05_mahjong_v1_reach07_v0faces
- Dataset de entrenamiento: https://huggingface.co/datasets/tc-huang/mahjong_v1_reach07_v0_1k
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- Imagen de fichas de mahjong (Mahjong_eg_TW.jpg, Cangjie6, CC BY-SA 4.0): https://commons.wikimedia.org/wiki/File:Mahjong_eg_TW.jpg
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- newton-assets (modelos del brazo SO-101): https://github.com/newton-physics/newton-assets
- TheRobotStudio/SO-ARM100: https://github.com/TheRobotStudio/SO-ARM100

Nota: los resultados de busqueda web proporcionados no contienen enlaces relevantes sobre este modelo (corresponden a resultados genericos sobre la abreviatura "TC" y a sitios de turismo y regulacion de temperatura), por lo que no se han incluido.
