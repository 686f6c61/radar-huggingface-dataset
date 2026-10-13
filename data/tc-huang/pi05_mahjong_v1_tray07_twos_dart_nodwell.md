# tc-huang/pi05_mahjong_v1_tray07_twos_dart_nodwell

## Resumen

`tc-huang/pi05_mahjong_v1_tray07_twos_dart_nodwell` es un ajuste fino de la política vision-lenguaje-acción pi0.5, entrenado con LeRobot 0.6.1 para una tarea de manipulación robótica muy concreta: coger, entre siete fichas de mahjong colocadas sobre una superficie de espuma, la ficha que indica una instrucción en lenguaje natural y depositarla en una bandeja. El brazo empleado es un SO-101 y la tarea se ejecuta dentro del entorno de simulación Isaac Lab `Mahjong-Tray7TwosFaces-SO101-v1`, con instrucciones del tipo `Pick up the {name} tile and place it in the tray.` Lo desarrolla el usuario tc-huang y se distribuye bajo los términos de uso de Gemma.

El modelo no parte de cero: continúa el ajuste desde el checkpoint `step-010000` de `tc-huang/pi05_mahjong_v1_tray07_twos_dart`, que a su vez deriva de `tc-huang/pi05_mahjong_v1_tray07_twos_30k`. Su rasgo distintivo es que elimina del entrenamiento las muestras correspondientes a las esperas ("dwell") sobre la ficha: en las demostraciones originales, tras empujar el brazo fuera de la posición de hover (estilo DART), este se quedaba entre 1 y 4 segundos antes de descender, un intervalo que no aparece ni en los fotogramas ni en el estado y que hacía que el modelo aprendiese a esperar en vez de bajar. Este run deja fuera esos fotogramas (el 12 % del total) manteniendo los fotogramas de empuje.

Se entrena exclusivamente en simulación y no se ha probado en un brazo real. La relevancia reside en su enfoque de curación de datos: aislar y retirar muestras que introducen artefactos temporales (esperas no observables) para corregir un fallo de política sin reentrenar desde el modelo base. La model card indica que los resultados de evaluación están "to be added", por lo que no hay cifras de rendimiento publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo vision-lenguaje-accion (VLA) pi0.5; el modelo base `lerobot/pi05_base` contiene PaliGemma (encoder visual SigLIP + modelo de lenguaje Gemma) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de la tarea estan en ingles) |
| Licencia | Gemma Terms of Use (modelo derivado de Gemma; `lerobot/pi05_base` contiene PaliGemma) |
| Formato de pesos | safetensors (`model.safetensors`) |
| Tamano del repositorio | 16,6 GB |
| Libreria | LeRobot 0.6.1 |
| Pipeline | robotics |
| Modelo base | `tc-huang/pi05_mahjong_v1_tray07_twos_dart` |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de pi0.5, una política vision-lenguaje-acción cuyo componente base es PaliGemma: un encoder visual SigLIP acoplado a un modelo de lenguaje de la familia Gemma, sobre el que se añade la cabeza que produce acciones de control. La model card no detalla el número de parámetros ni la configuración exacta de atención, por lo que esos datos figuran como no disponibles. El entrenamiento se realizó sobre el conjunto de datos `tc-huang/mahjong_v1_tray07_twos_dart`, formado por 1.000 demostraciones scriptadas, 318.191 fotogramas a 30 fps, en las que el brazo es empujado fuera del hover sobre la ficha y sobre el hueco y devuelto (estilo DART), con cada paso etiquetado con el objetivo previsto de la demostración.

La innovación técnica está en el filtrado del conjunto de datos: se excluyen como muestras de entrenamiento los fotogramas cuyo estado del brazo cae dentro de 1,5 grados de la pose desde la que arranca un descenso, en cualquier articulación, y que esperan más de 5 fotogramas antes de ese descenso. Esto supone el 12 % de los fotogramas. Los fotogramas empujados se mantienen. El ajuste parte del checkpoint `step-010000` y corre 5.000 pasos con batch 16, entrenando todos los parámetros (SigLIP sin congelar), con tasa de aprendizaje 2,5e-5, 1.000 pasos de warmup y decaimiento coseno hasta 2,5e-6. La normalización de estados y acciones usa los cuantiles q01 y q99 de todos los fotogramas del conjunto (cálculo de openpi) en lugar del promedio de cuantiles por episodio de LeRobot 0.6.1. Los pesos, gradientes y estado de AdamW se mantienen en float32 (AdamW fused), con forward y backward bajo autocast bf16 y sin gradient checkpointing. Los checkpoints se guardan cada 2.500 pasos en ramas `step-<step>`, y `main` contiene el último.

## Capacidades

- Generacion de acciones de manipulacion robotica: produce comandos para el brazo SO-101 a partir de observaciones visuales y del estado del robot.
- Seguimiento de instrucciones en lenguaje natural: interpreta ordenes del tipo `Pick up the {name} tile and place it in the tray.`
- Discriminacion visual de fichas de mahjong: identifica entre siete fichas la que nombra la instruccion (caras "twos").
- Ejecucion de una politica de pick-and-place en simulacion (Isaac Lab), desde la aproximacion hasta el descenso y la colocacion en bandeja.
- Robustez ante perturbaciones de demostracion: entrenado sobre trayectorias empujadas fuera del hover (DART), no solo sobre demostraciones limpias.
- No dispone de tool calling, function calling, capacidades de agente multi-paso, vision general, audio ni modos de "pensamiento": es una politica de robot, no un modelo de proposito general.
- Capacidades multilingues: no disponibles; la tarea se define en ingles.
- No se ha validado en hardware real; solo en simulacion.

## Casos de uso

- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar como el filtrado de fotogramas de espera afecta a la politica final, comparando con el modelo base `tc-huang/pi05_mahjong_v1_tray07_twos_dart`.
- Desarrollo de politicas pick-and-place con SO-101: base para tareas de recogida selectiva de objetos nombrados en entornos Isaac Lab.
- Benchmarking de tecnicas de curacion de datos en VLA: permite reproducir el efecto de excluir muestras con artefactos temporales no observables (hover dwell) en el rendimiento.
- Simulacion de tareas de clasificacion por instruccion: evaluar el seguimiento de ordenes en lenguaje natural sobre multiples objetos (siete fichas) con caras distintas.
- Transferencia sim-a-real (sim-to-real): aunque no se ha probado en un brazo real, es un candidato para experimentos de transferencia hacia un SO-101 fisico.
- Generacion de demostraciones sinteticas: el pipeline asociado (LeRobot 0.6.1, Isaac Lab) puede reutilizarse para crear conjuntos de datos con etiquetado de objetivo por paso.
- Estudio de robustez ante perturbaciones: gracias al entrenamiento con empujes DART, util para analizar la recuperacion del brazo tras desviaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor indica explicitamente, en la seccion de evaluacion, "To be added". Como contexto cualitativo, la propia model card describe que el checkpoint base (`step-010000` de `tc-huang/pi05_mahjong_v1_tray07_twos_dart`) localizaba la ficha nombrada pero se quedaba sobre ella en los 84 episodios de evaluacion, y que este run se propone corregir ese comportamiento; no obstante, no se aportan cifras finales.

## Requisitos de hardware

- VRAM estimada: no disponible. La model card no publica el numero de parametros ni la configuracion de inferencia, por lo que no puede estimarse de forma fiable a partir de la informacion proporcionada.
- GPU recomendadas: no disponibles. Al tratarse de un modelo de robótica entrenado con forward/backward en bf16 y pesos en float32, se requiere GPU con soporte de bf16 y suficiente memoria para los pesos mas el contexto visual; no se especifica modelo concreto (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no confirmada; depende del tamano real del modelo base pi0.5, dato no publicado.
- Opciones de despliegue: al estar registrado como libreria LeRobot, el despliegue previsto es a traves del ecosistema LeRobot (y, por herencia del base pi0.5, del stack openpi). No se documentan opciones tipo vLLM, llama.cpp o Ollama para este modelo.
- Latencia y throughput: no disponibles. El control de un brazo SO-101 en simulacion exige ciclos de inferencia al ritmo de la politica (los datos se capturan a 30 fps), pero no se aportan medidas.
- Tamano del repositorio: 16,6 GB, que incluye las ramas de checkpoints guardadas cada 2.500 pasos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tc-huang/pi05_mahjong_v1_tray07_twos_dart_nodwell` | no disponible | no disponible | Pick-and-place de ficha nombrada (SO-101, Isaac Lab); sin fotogramas de dwell | Gemma Terms of Use | HuggingFace |
| `tc-huang/pi05_mahjong_v1_tray07_twos_dart` | no disponible | no disponible | Misma tarea; incluye fotogramas de dwell (se quedaba en el hover en 84/84 episodios) | Gemma Terms of Use | HuggingFace |
| `tc-huang/pi05_mahjong_v1_tray07_twos_30k` | no disponible | no disponible | Misma tarea; etapa de entrenamiento previa sobre demostraciones empujadas | Gemma Terms of Use | HuggingFace |
| `lerobot/pi05_base` | no disponible | no disponible | Modelo base pi0.5 (contiene PaliGemma), sin ajuste a tarea | Gemma Terms of Use | HuggingFace |

No se dispone de valores de benchmarks comparativos entre estas variantes en la informacion proporcionada; la diferencia documentada es de procedencia de datos (filtrado de dwell) y de etapa de entrenamiento.

## Limitaciones y advertencias

- Entrenado exclusivamente en simulacion: no se ha ejecutado en un brazo real, por lo que su comportamiento sim-to-real es desconocido.
- Evaluacion no publicada: la model card indica "To be added", de modo que no hay evidencia cuantitativa de exito de la politica en esta version.
- Tarea extremadamente acotada: solo reconoce fichas de mahjong dentro de la escena Isaac Lab concreta y una unica instruccion plantilla; no generaliza a otras tareas, objetos o entornos.
- Sesgos conocidos: no documentados. Al derivar de PaliGemma/Gemma y de un conjunto de datos scriptado, puede heredar los sesgos del modelo base, pero no se detallan.
- Riesgo de alucinacion: no aplica en el sentido linguistico (no es un modelo de generacion de texto abierta); el riesgo equivalente es ejecutar acciones incorrectas o aproximaciones erroneas sobre la ficha equivocada.
- Idiomas: no disponibles; las instrucciones de la tarea se formulan en ingles.
- Restricciones de licencia: es un modelo derivado de Gemma, distribuido bajo los Gemma Terms of Use. El uso esta sujeto a la Seccion 3.2, que prohibe los usos restringidos de la Gemma Prohibited Use Policy y cualquier uso contrario a la legislacion aplicable; esas restricciones deben transmitirse a terceros.
- Atribucion obligatoria: los fotogramas de las caras de las fichas derivan de `Mahjong_eg_TW.jpg` de Cangjie6 (CC BY-SA 4.0), sin respaldo del autor original; los modelos del brazo SO-101 provienen de newton-assets y TheRobotStudio/SO-ARM100 (Apache-2.0).
- Caveat de produccion: sin datos de parametros, VRAM ni latencia, no puede dimensionarse el despliegue ni garantizarse su viabilidad en un brazo real sin evaluacion adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tc-huang/pi05_mahjong_v1_tray07_twos_dart_nodwell
- Modelo base: https://huggingface.co/tc-huang/pi05_mahjong_v1_tray07_twos_dart
- Etapa de entrenamiento previa: https://huggingface.co/tc-huang/pi05_mahjong_v1_tray07_twos_30k
- Conjunto de datos: https://huggingface.co/datasets/tc-huang/mahjong_v1_tray07_twos_dart
- Modelo base pi0.5 (contiene PaliGemma): https://huggingface.co/lerobot/pi05_base
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Politica de usos prohibidos de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
- Imagen de origen de las caras (CC BY-SA 4.0): https://commons.wikimedia.org/wiki/File:Mahjong_eg_TW.jpg
- Modelos del brazo SO-101 (newton-assets, Apache-2.0): https://github.com/newton-physics/newton-assets
- Modelos del brazo SO-101 (SO-ARM100, Apache-2.0): https://github.com/TheRobotStudio/SO-ARM100
