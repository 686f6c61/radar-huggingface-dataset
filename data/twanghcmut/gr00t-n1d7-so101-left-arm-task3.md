# twanghcmut/gr00t-n1d7-so101-left-arm-task3

## Resumen

El modelo `twanghcmut/gr00t-n1d7-so101-left-arm-task3` es un ajuste fino (fine-tuning) del modelo fundacional de robótica NVIDIA Isaac GR00T N1.7 3B, especializado en el control del brazo izquierdo de un robot SO101. Lo publica el usuario `twanghcmut` y resuelve un problema concreto de manipulación multitarea: un único modelo cubre tres tareas distintas (sacar un cubo rojo de una olla, abrir un cajón y colocar un bloque, y apilar un cubo rojo sobre uno azul) y la instrucción en lenguaje natural selecciona cuál ejecutar. Esto es relevante porque demuestra la viabilidad de reutilizar un modelo visión-lenguaje-acción (VLA) de 3.000 millones de parámetros y adaptarlo a un brazo de bajo coste con un presupuesto de entrenamiento muy reducido.

El modelo parte de `nvidia/GR00T-N1.7-3B` y se entrena sobre 159 episodios (133.763 fotogramas) procedentes de tres datasets de LeRobot v3.0 convertidos a v2.1. La arquitectura combina un backbone de visión y lenguaje congelado con un proyector, una normalización de capas VL y una cabeza de difusión entrenables. El resultado es un checkpoint de 3.144.016.000 parámetros en formato safetensors, con licencia Apache 2.0.

La relevancia actual radica en que el autor compara su resultado con π₀.₅ (pi05) entrenado con los mismos datos y presupuesto, y publica una evaluación en bucle abierto con métricas de error concretas. No obstante, el propio autor advierte de que no hay conjunto de validación reservado, por lo que las métricas miden ajuste a los datos de entrenamiento y no generalización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en NVIDIA Isaac GR00T N1.7: backbone de visión y LLM congelados, proyector, VL layernorm y cabeza de difusión entrenables |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (horizonte de acción de 16 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

El modelo es un VLA construido sobre `nvidia/GR00T-N1.7-3B`. En el ajuste fino se entrenan el proyector, la normalización de capas del módulo de visión-lenguaje y la cabeza de difusión, mientras que el LLM y el backbone de visión permanecen congelados. La representación de acciones usa un horizonte de 16 pasos: la acción del brazo (`single_arm`) es relativa (delta respecto al estado actual, normalizada con las estadísticas de acciones relativas de `statistics.json`), mientras que la pinza (`gripper`) es absoluta. La política convierte ambas de vuelta, de modo que `get_action` devuelve objetivos articulares absolutos.

El entrenamiento se realizó durante 6.000 pasos con un tamaño de lote global de 128 (768.000 muestras, unas 5,7 épocas sobre los 133.763 fotogramas), tasa de aprendizaje 1e-4 con decaimiento coseno y 5% de calentamiento, y weight decay 1e-5. El parámetro `episode_sampling_rate` se fijó en 0,1. Todo el entrenamiento se ejecutó en una única GPU H100 de 80 GB en 9,6 horas, limitado por el cargador de datos (unos 22 muestras por segundo). La pérdida final de entrenamiento fue de 0,0199 (media de los pasos 5.760 a 6.000), con una curva descendente desde 0,068 en el paso 500.

El conjunto de datos combina tres tareas con 51, 57 y 51 episodios respectivamente. Los datos originales en LeRobot v3.0 se convirtieron a v2.1 (el formato que lee el cargador de GR00T) y se fusionaron sin recodificar, por lo que los fotogramas no se alteran. La cámara de profundidad `observation.images.top_depth` no se utiliza.

## Capacidades

- Control de un brazo robótico SO101 (izquierdo) de 5 articulaciones más pinza, con dimensión de estado y acción de 6: `shoulder_pan`, `shoulder_lift`, `elbow_flex`, `wrist_flex`, `wrist_roll` y `gripper`.
- Ejecución de tres tareas de manipulación seleccionables por instrucción en lenguaje natural: sacar un cubo rojo de una olla de acero y colocarlo en un cubo hueco naranja; abrir el cajón superior, coger un bloque cuadrado rojo, colocarlo dentro y cerrar el cajón; y abrir el cajón, coger un cubo rojo y apilarlo sobre un cubo azul.
- Percepción visual a partir de dos cámaras RGB: una cenital (`top`, 360×640) y una en la muñeca (`wrist`, 480×640).
- Generación de secuencias de acciones con horizonte de 16 pasos a partir de observaciones multimodales (vídeo, estado y lenguaje).
- Condicionamiento por lenguaje de la tarea a ejecutar, sin entrenamiento en paráfrasis (requiere el texto exacto de la instrucción).
- Integración con LeRobot mediante `Gr00tPolicy` y un servidor de inferencia (`run_gr00t_server.py`) que expone `get_action`.
- No se documentan capacidades de tool calling, razonamiento multi-paso general, visión fuera del contexto robótico ni audio.

## Casos de uso

- Manipulación robótica multitarea en un brazo SO101: un solo checkpoint permite alternar entre tres tareas de pick-and-place seleccionando la instrucción, lo que simplifica el despliegue al evitar mantener tres políticas separadas.
- Investigación en aprendizaje por imitación con presupuesto reducido: sirve como referencia reproducible de ajuste fino de un VLA de 3B sobre 159 episodios y una sola H100 durante menos de 10 horas.
- Prototipado de políticas VLA en laboratorios con hardware de bajo coste: el SO101 es un brazo asequible y el modelo demuestra que un VLA grande puede adaptarse a una morfología concreta con datos limitados.
- Evaluación comparativa de frameworks: el autor publica una comparación directa con π₀.₅ sobre las mismas trayectorias y el mismo presupuesto, útil para estudiar diferencias entre recetas de entrenamiento.
- Automatización de tareas de recogida y apilado en entornos controlados: apilar un cubo sobre otro o colocar bloques dentro de cajones son subtareas típicas de bancos de pruebas de manipulación.
- Base para nuevos ajustes finos: al estar bajo Apache 2.0 y sobre un modelo fundacional, puede reutilizarse como punto de partida para añadir tareas o morfologías adicionales.
- Docencia y demostraciones de VLA: la estructura de observación anidada y el servidor de inferencia facilitan montar una demo funcional con dos cámaras y un brazo.

## Benchmarks y rendimiento

Evaluación en bucle abierto sobre dos trayectorias por tarea (hasta 400 pasos, horizonte de acción 16), con errores sin normalizar en las unidades de acción del dataset:

| Trayectoria | Tarea | MAE GR00T | MAE π₀.₅ |
|---|---|---|---|
| 0 | 0: cubo rojo, olla → cubo hueco | 1,406 | 1,286 |
| 25 | 0: cubo rojo, olla → cubo hueco | 1,542 | 1,690 |
| 51 | 1: cajón + bloque rojo | 1,359 | 1,239 |
| 80 | 1: cajón + bloque rojo | 1,601 | 1,704 |
| 108 | 2: cajón, apilar rojo sobre azul | 1,245 | 1,345 |
| 133 | 2: cajón, apilar rojo sobre azul | 1,486 | 1,488 |
| | Promedio | 1,440 (MSE 5,47) | 1,459 (MSE 5,08) |

Normalizado por la desviación estándar absoluta de las acciones (29,97), el MAE promedio equivale al 4,80% de la escala de acción en horizonte 16, frente al 4,87% de π₀.₅. GR00T obtiene menor error en 4 de las 6 trayectorias, mientras que π₀.₅ tiene menor MSE. El autor señala que ambas cifras provienen de los scripts de bucle abierto de cada framework, por lo que la diferencia debe interpretarse como un empate y no como una clasificación. No se publican tasas de éxito en robot real.

## Requisitos de hardware

- Entrenamiento: 1 GPU H100 de 80 GB, con 9,6 horas de ejecución limitada por el cargador de datos (unas 22 muestras por segundo).
- Inferencia: no se documenta la VRAM exacta necesaria. Con 3.144.016.000 parámetros, los pesos en precisión de 16 bits ocupan aproximadamente 6,3 GB, y el repositorio completo pesa 12,6 GB.
- GPU recomendadas: no disponible. El entrenamiento se validó en H100 80 GB; no se indica compatibilidad con GPU de consumo.
- ¿Cabe en GPU de consumo? No disponible. El tamaño de pesos en FP16 sugeriría que sí en tarjetas con 12-16 GB o más, pero no hay confirmación del autor ni cifras de latencia.
- Opciones de despliegue: servidor de inferencia de GR00T (`python gr00t/eval/run_gr00t_server.py --model-path twanghcmut/gr00t-n1d7-so101-left-arm-task3 --embodiment-tag NEW_EMBODIMENT --host 0.0.0.0 --port 5555`) y cliente LeRobot `Gr00tPolicy`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles para inferencia. Solo se documenta el throughput de entrenamiento (unas 22 muestras por segundo).
- Nota de despliegue: no iniciar el servidor con `--use-sim-policy-wrapper`, ya que cambia al formato plano de los entornos de simulación. El cliente que interpole entre pasos del modelo debe derivar el número de subpasos de `smooth_step = control_hz / 30`, porque los datos están a 30 fps.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Evaluación en bucle abierto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gr00t-n1d7-so101-left-arm-task3 | 3.144.016.000 | horizonte de acción 16 | MAE 1,440; 4,80% de la escala de acción | Apache 2.0 | Hugging Face |
| twanghcmut/pi05-so101-left-arm-task3 (π₀.₅) | no disponible | horizonte de acción 16 | MAE 1,459; 4,87% de la escala de acción | no disponible en la información | Hugging Face |
| twanghcmut/gr00t-n1d7-so101-left-arm-multitask | no disponible | horizonte de acción 16 | no disponible | no disponible en la información | Hugging Face |
| nvidia/GR00T-N1.7-3B (modelo base) | 3B (según nombre) | no disponible | no disponible | no disponible en la información | Hugging Face |

El modelo comparable más directo es π₀.₅ entrenado por el mismo autor con los mismos datos y presupuesto, con resultados prácticamente idénticos. La variante multitarea de 11 tareas del mismo autor comparte receta de entrenamiento, pero no se aportan métricas en la información disponible.

## Limitaciones y advertencias

- No hay conjunto de validación reservado: los 159 episodios se usaron íntegramente para entrenamiento. `episode_sampling_rate` submuestrea pasos dentro de los episodios, no episodios completos.
- Las métricas de bucle abierto se miden sobre datos de entrenamiento: demuestran que la política se ajusta a los datos y no es degenerada, pero no miden generalización ni constituyen una tasa de éxito.
- El rendimiento en robot real está sin medir hasta que se ejecute el modelo.
- La muestra de evaluación es pequeña: dos trayectorias por tarea.
- El modelo no ha sido entrenado con paráfrasis: exige el texto exacto de la instrucción, incluida la puntuación final.
- Está especializado en una morfología concreta (SO101 izquierdo, 5 articulaciones más pinza) y en tres tareas específicas; no es un modelo generalista.
- La cámara de profundidad `top_depth` no se utiliza, pese a estar presente en los datos.
- El formato de observación debe ser el anidado que espera `Gr00tPolicy`; usar `--use-sim-policy-wrapper` rompe la compatibilidad.
- El cliente debe respetar los 30 fps de los datos al interpolar subpasos.
- No se documentan sesgos, riesgos de alucinación en el sentido lingüístico ni limitaciones idiomáticas; el modelo es de control robótico y no genera texto libre.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base `nvidia/GR00T-N1.7-3B` puede tener condiciones propias que conviene verificar antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/twanghcmut/gr00t-n1d7-so101-left-arm-task3
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Modelo comparable π₀.₅ del mismo autor: https://huggingface.co/twanghcmut/pi05-so101-left-arm-task3
- Variante multitarea de 11 tareas: https://huggingface.co/twanghcmut/gr00t-n1d7-so101-left-arm-multitask
- Dataset tarea 0: https://huggingface.co/datasets/hungho77/so101-left_arm_task_red_cube_out_of_pot_into_the_orange_hollow_cube
- Dataset tarea 1: https://huggingface.co/datasets/hungho77/so101-left_arm_task_drawer_placing_red_squre_block
- Dataset tarea 2: https://huggingface.co/datasets/hungho77/so101_left_arm_open_drawer_pick_red_cube_stack_on_blue_cube
