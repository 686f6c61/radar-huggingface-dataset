# ufeig/smolvla-white-caps-bowl

## Resumen
`ufeig/smolvla-white-caps-bowl` es un modelo de politica robotica (policy) obtenido por fine-tuning de `lerobot/smolvla_base`, el modelo base de vision-lenguaje-accion (VLA) compacto de Hugging Face para el framework LeRobot. El autor, ufeig, lo ha entrenado para una tarea de manipulacion concreta: coger un tapon de botella blanco y depositarlo dentro de un cuenco. Se distribuye bajo licencia Apache 2.0 y esta pensado para ejecutarse sobre un robot de tipo `so_follower` (SO-100/SO-101 de LeRobot) equipado con camaras cenital y de muneca.

El interes practico del modelo es que ejemplifica el flujo completo de imitacion robotica end-to-end con LeRobot: grabacion de episodios, entrenamiento de una politica VLA y despliegue en hardware de bajo coste. Con 450 millones de parametros y un repositorio de 1,2 GB, es lo bastante pequeno para entrenar y ejecutar en una unica GPU de consumo, lo que lo convierte en un punto de partida realista para quien quiera replicar el pipeline con sus propios objetos y tareas.

La informacion publicada es limitada: no hay resultados de evaluacion en robot real, no se detallan los idiomas soportados (el modelo no procesa lenguaje natural de forma general, sino instrucciones de tarea) y no se han publicado benchmarks. La ficha refleja, por tanto, lo que el autor documenta y marca explicitamente como no disponible todo lo demas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) sobre transformer, derivada de SmolVLA (`lerobot/smolvla_base`) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion publicada) |
| Longitud de contexto | no disponible (politica de imitacion; no se documenta ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (las instrucciones de tarea estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Tipo de robot | `so_follower` |
| Camaras | `overhead`, `wrist` (mas una tercera entrada visual `empty_camera_0`) |
| Entrada de estado | `observation.state`, forma `(6,)` |
| Entradas visuales | 3 x `(3, 480, 640)` |
| Salida de accion | `action`, forma `(6,)` |
| Tamano del repositorio | 1,2 GB |
| Descargas | 41 |
| Fecha de creacion | 2026-10-27 |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura de SmolVLA, una politica VLA compacta que combina un codificador visual, un codificador de lenguaje y un cabezal de acciones sobre un transformer, disenada para imitacion end-to-end en robots de bajo coste. En este fine-tuning concreto, la politica consume tres flujos de imagen de 480x640 (camara cenital, camara de muneca y una tercera camara declarada como `empty_camera_0`), un vector de estado de 6 dimensiones y una instruccion textual de tarea, y produce un vector de accion de 6 dimensiones por paso.

El entrenamiento se realizo con LeRobot 0.6.2 sobre el dataset `ufeig/bottlecaps-white-bowl`, compuesto por 61 episodios y 27.483 fotogramas a 30 FPS, con una division entrenamiento/validacion 85/15. Se ejecutaron 20.000 pasos con batch size 2, optimizador AdamW, learning rate 1e-4 y semilla 1000, con evaluacion cada 1.000 pasos (maximo 200 pasos por evaluacion). Las instrucciones de tarea del dataset presentan variantes ortograficas del mismo comando ("botblack", "bottle cap", "bottlecap"), lo que conviene tener en cuenta al invocar la politica. No se documentan tecnicas adicionales como RLHF, DPO o decodificacion especulativa.

## Capacidades
- Manipulacion robotica de una unica tarea: coger un tapon de botella blanco y colocarlo en un cuenco.
- Control visuomotor a partir de tres camaras y del estado de las articulaciones del robot `so_follower`.
- Condicionamiento por instruccion de tarea en lenguaje natural (en ingles), con variantes de redaccion aceptadas por el entrenamiento.
- Politica de imitacion entrenada por comportamiento clonado sobre demostraciones humanas.
- Inferencia en tiempo real a 30 FPS, alineada con la frecuencia de grabacion del dataset.
- No soporta tool calling, function calling, razonamiento multi-paso, generacion de texto general, codigo, matematicas ni vision de proposito general: es exclusivamente una politica de control motor.

## Casos de uso
- **Automatizacion de pick-and-place en linea de montaje**: la politica ejecuta la secuencia de coger un tapon y depositarlo en un recipiente con las mismas condiciones de iluminacion y posicionamiento del dataset; adecuada para tareas repetitivas de alimentacion de piezas en una celula robotica de bajo coste.
- **Prototipado rapido de tareas de manipulacion con SO-100/SO-101**: sirve como referencia funcional para validar el pipeline completo de LeRobot (grabacion, entrenamiento, rollout) antes de invertir en un dataset propio.
- **Base para fine-tuning con nuevos objetos**: al partir de `lerobot/smolvla_base` y estar entrenado con solo 61 episodios, demuestra que con un dataset pequeno se puede especializar una politica VLA; se puede reutilizar como inicializacion para tareas similares.
- **Docencia e investigacion en imitation learning**: util para cursos y laboratorios que necesiten un ejemplo reproducible de comportamiento clonado con vision y lenguaje, con hiperparametros y configuracion documentados.
- **Benchmark interno de infraestructura de inferencia robotica**: permite medir latencia y throughput de LeRobot sobre GPU de consumo con un modelo de 450 M de parametros y tres flujos de video a 480x640.
- **Pruebas de robustez ante variaciones de camara**: al declarar tres entradas visuales (incluida una camara vacia), sirve para estudiar como afecta la configuracion de sensores al rendimiento de la politica en entornos controlados.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion con la plantilla vacia y la nota explicita: "No evaluation results have been provided for this policy yet." No se dispone de tasas de exito en robot real, ni de comparaciones numericas con otras politicas.

## Requisitos de hardware
- VRAM estimada para inferencia: no documentada por el autor. Como referencia de orden de magnitud, un modelo de 450 M de parametros en fp32 ocupa aproximadamente 1,8 GB de pesos; en fp16 unos 0,9 GB. A ello hay que sumar el codificador visual, los tres flujos de imagen de 480x640 y el estado de inferencia de LeRobot.
- GPU recomendadas: no especificadas. El comando de entrenamiento de la model card usa `--policy.device=cuda`, lo que implica GPU NVIDIA con CUDA.
- GPU de consumo: por tamano, es plausible ejecutarlo en tarjetas consumer con 8 GB o mas de VRAM (RTX 3060/4060 y superiores), aunque el autor no publica requisitos minimos ni mediciones.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecucion, `lerobot-train` para reentrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de politica.
- Latencia y throughput: no disponibles. La politica esta pensada para operar a 30 FPS, la misma frecuencia del dataset de entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Tarea | Contexto | Licencia | Evaluacion publicada |
|---|---|---|---|---|---|---|
| `ufeig/smolvla-white-caps-bowl` | 450 M | VLA (fine-tune de SmolVLA) | Colocar tapon blanco en cuenco | no disponible | Apache 2.0 | No |
| `lerobot/smolvla_base` | no disponible en la informacion | VLA base | Politica generalista para fine-tuning | no disponible | no disponible en la informacion | no disponible |
| Otras politicas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible en la informacion | Politicas de imitacion | Manipulacion | no disponible | no disponible en la informacion | no disponible |

La comparacion cuantitativa no es posible con los datos publicados: no hay tasas de exito ni metricas de rendimiento para este modelo ni para las alternativas citadas en la informacion disponible.

## Limitaciones y advertencias
- **Sin evaluacion publicada**: no hay evidencia documentada de tasa de exito en robot real; el rendimiento en produccion es desconocido.
- **Sobreajuste a la tarea y al entorno**: entrenado con 61 episodios de una unica tarea; es probable que falle ante cambios de iluminacion, posicion de objetos, distractores o un robot distinto, aunque sea del mismo tipo.
- **Dependencia de la configuracion de camaras**: las claves de observacion (`overhead`, `wrist`, `empty_camera_0`) y las resoluciones deben coincidir exactamente con las del entrenamiento; cualquier desviacion invalida la inferencia.
- **Instrucciones de tarea inconsistentes**: el dataset contiene variantes ortograficas ("botblack", "bottle cap", "bottlecap"); conviene usar una de las cadenas exactas documentadas.
- **Sesgos**: no documentados por el autor; al ser comportamiento clonado de demostraciones humanas, puede heredar sesgos de posicionamiento y estilo de los demostradores.
- **Riesgo de alucinacion**: no aplica en el sentido de generacion de texto, pero la politica puede producir acciones no validas fuera de la distribucion de entrenamiento, con riesgo fisico para el robot y el entorno.
- **Licencia**: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo base `lerobot/smolvla_base` debe verificarse por separado.
- **Idiomas**: no se documenta soporte multilingue; las instrucciones de tarea estan en ingles.
- **Madurez**: 41 descargas y 0 likes en el momento de la consulta; es un experimento de un autor individual, no un modelo mantenido por un equipo.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/ufeig/smolvla-white-caps-bowl
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/ufeig/bottlecaps-white-bowl
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ufeig/bottlecaps-white-bowl
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
