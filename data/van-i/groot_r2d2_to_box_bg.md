# van-i/groot_r2d2_to_box_bg

## Resumen

GR00T N1.7 (SO-100): pick R2-D2 and put it in the box es un modelo de visión-lenguaje-acción (VLA) para robótica, publicado por el usuario van-i en HuggingFace como un fine-tuning de nvidia/GR00T-N1.7-3B. Parte del backbone de visión-lenguaje NVIDIA Cosmos-Reason2-2B y se ha ajustado con la librería LeRobot (policy.type=groot, embodiment new_embodiment) para una tarea concreta de manipulación: coger una figura pequeña de R2-D2 de una de cinco posiciones marcadas sobre una mesa y depositarla en una bandeja de cartón.

El modelo tiene 3.144.016.000 parámetros totales (3,1B). Durante el ajuste se mantuvo congelado el backbone de visión-lenguaje y se entrenaron 1,6B parámetros. El entrenamiento se realizó sobre un dataset de 50 episodios teleoperados con un brazo SO-100 y tres cámaras (dos cenitales, izquierda y derecha, y una en la muñeca), a 640×480 y 30 fps, durante 18.000 pasos con batch 4 (unas 5 épocas) en bf16.

Su relevancia radica en que es un ejemplo reproducible y documentado de fine-tuning de un VLA de NVIDIA sobre hardware de consumo (una única RTX 3090) para una tarea real de pick-and-place, con evaluación comparativa frente a ACT, Diffusion Policy y SmolVLA sobre el mismo dataset. Destaca por generalizar a posiciones no vistas durante el entrenamiento (4/4 en posiciones held-out), algo que ninguno de los otros tres policies consiguió.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en nvidia/GR00T-N1.7-3B; backbone de visión-lenguaje nvidia/Cosmos-Reason2-2B |
| Parametros totales | 3.144.016.000 (3,1B) |
| Parametros activos | no disponible |
| Parametros entrenados en el fine-tuning | 1,6B (backbone de visión-lenguaje congelado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16 en el ejemplo de entrenamiento; repositorio en safetensors) |
| Idiomas soportados | no disponible (modelo de robótica; instrucción de tarea en inglés: "pick r2d2 and put to box") |
| Licencia | NVIDIA Open Model License (nvidia-open-model-license) |
| Formato de pesos | safetensors |
| Libreria | lerobot (LeRobot 0.6.0) |
| Pipeline | robotics |
| Tamano del repositorio | 9,3 GB |
| Modelo base | nvidia/GR00T-N1.7-3B |
| Dataset de entrenamiento | van-i/r2d2_to_box_bg_20261003_210444 |
| Robot objetivo | SO-100 / SO-101 follower |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de GR00T N1.7, un modelo de visión-lenguaje-acción de 3,1B parámetros cuyo backbone de visión-lenguaje es NVIDIA Cosmos-Reason2-2B. La adaptación se hizo con LeRobot bajo el tipo de policy `groot`, usando el embodiment `new_embodiment`. En el ajuste se congeló el backbone de visión-lenguaje y se entrenaron 1,6B parámetros, lo que reduce el coste computacional del fine-tuning.

Los datos de entrenamiento proceden del dataset van-i/r2d2_to_box_bg_20261003_210444: 50 episodios teleoperados sobre un brazo SO-100 con tres cámaras (dos cenitales `left` y `right`, y una en la muñeca, `grip`), a 640×480 y 30 fps. El entrenamiento duró 18.000 pasos con batch 4 (aproximadamente 5 épocas) con todos los pesos en bf16 (`--policy.model_params_fp32=false`, necesario para caber en 24 GB; la receta de NVIDIA usa pesos en fp32). Se ejecutó en 2 h 57 min sobre una RTX 3090 a 250 W, con un pico de VRAM de 23,2 GB. La pérdida final de entrenamiento fue de 0,035.

Como innovación práctica, la inferencia se realiza con real-time chunking (`--inference.type=rtc --inference.rtc.execution_horizon=40 --inference.queue_threshold=0`), que es el modo que usa LeLab para GR00T. No se documenta en la información disponible el uso de RLHF o DPO.

## Capacidades

- Manipulación robótica visomotora: ejecuta una tarea de pick-and-place ("pick r2d2 and put to box") a partir de observaciones de tres cámaras y del estado del robot.
- Generalización posicional: funciona en las cinco posiciones de inicio entrenadas y en posiciones held-out, incluida H2, fuera del área marcada, donde fallaron los demás policies.
- Seguimiento de instrucciones limitado: entrenado con una única instrucción; con un objeto nuevo ("rollo de cinta") y la instrucción "pick tape roll and put into box" casi completó la tarea, y con ambos objetos en la mesa fue primero a por R2-D2.
- Recuperación de errores: en las pruebas reales dejó caer el R2-D2 varias veces, pero volvió a cogerlo y terminó la tarea.
- Control continuo por chunks: genera acciones mediante real-time chunking con horizonte de ejecución de 40.
- Integración con LeRobot: se ejecuta con `lerobot-rollout` sobre un SO-100/SO-101 follower.
- Capacidades multilingües: no disponibles.
- Capacidades de tool calling, agentes o visión generalista: no disponibles en la información proporcionada (el modelo está especializado en una única tarea de manipulación).

## Casos de uso

- Automatización de pick-and-place industrial: recogida y depósito de piezas pequeñas desde posiciones variables dentro de un área de trabajo; el modelo es adecuado porque generaliza a posiciones de inicio no vistas durante el entrenamiento.
- Banco de pruebas docente en robótica: forma parte de un montaje escolar de robótica construido con LeRobot y LeLab, comparando ACT, Diffusion Policy, SmolVLA y GR00T N1.7 sobre el mismo dataset; sirve como referencia reproducible para enseñar imitation learning.
- Clasificación y separación de objetos por instrucción: con un único comando de texto se puede dirigir el brazo hacia un objeto concreto; útil para tareas de sorting donde la instrucción se parametriza.
- Prototipado rápido de policies VLA en hardware de consumo: al haberse entrenado en una única RTX 3090, permite a equipos pequeños reproducir el flujo completo con presupuesto limitado.
- Investigación en generalización de VLA: la evaluación en H2 (fuera de las marcas) lo convierte en un caso de estudio para medir generalización posicional en manipulación con pocos datos (50 episodios).
- Integración en celdas robotizadas con cámaras fijas: con tres cámaras cenitales y de muñeca a 640×480 y 30 fps, se puede desplegar en una celda con iluminación y colocación de cámara similares a las del entrenamiento.
- Recogida y depósito en entornos controlados tipo laboratorio o aula: tarea de coger una figura y dejarla en una bandeja, con tiempos de ~9,8 s por éxito.

## Benchmarks y rendimiento

Resultados sobre el brazo real, 14 intentos por policy (5 posiciones entrenadas ×2, H1 entre dos marcas ×2, H2 justo fuera del área marcada ×2). Todos los policies se entrenaron sobre el mismo dataset.

| Policy | Posiciones entrenadas (P1–P5) | H1 (entre marcas) | H2 (fuera de las marcas) | Tiempo medio por éxito |
|---|---|---|---|---|
| ACT (15k) | 8/10 | 2/2 | 0/2 | ~10 s |
| Diffusion Policy (36k) | 9/10 | 2/2 | 0/2 | ~16,5 s |
| SmolVLA (25k) | 10/10 | 2/2 | 0/2 | ~8,4 s |
| GR00T N1.7 (18k, este modelo) | 10/10 | 2/2 | 2/2 | ~9,8 s |

Resultado global de este modelo: 10/10 en las posiciones entrenadas y 4/4 en posiciones held-out, incluida H2, fuera del área entrenada. Pérdida final de entrenamiento: 0,035. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo especializado en robótica.

## Requisitos de hardware

- VRAM en entrenamiento (documentada): 23,2 GB de pico en bf16 con `--policy.model_params_fp32=false`, sobre una RTX 3090 (250 W), en 2 h 57 min.
- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 9,3 GB en safetensors, por lo que se requiere una GPU con capacidad suficiente para cargar 3,1B parámetros en bf16 (por encima de 8 GB en la práctica).
- GPU recomendadas: RTX 3090 (usada en el entrenamiento); cualquier GPU con al menos 24 GB (RTX 4090, A100, H100) ofrece margen. Para inferencia se usa `--policy.device=cuda`.
- ¿Cabe en GPU de consumo? Sí, según la evidencia del autor: el entrenamiento completo cupo en una única RTX 3090 de 24 GB en bf16.
- Opciones de despliegue: LeRobot 0.6.0 mediante `lerobot-rollout` con `--strategy.type=base`, sobre un SO-101 follower. LeLab emplea el modo RTC para GR00T.
- Latencia y throughput: ~9,8 s por éxito en la tarea real. El tiempo de carga antes de que el brazo empiece a moverse es de ~80 s. No se documenta throughput de tokens ni latencia de red.
- Configuración de inferencia: `--inference.type=rtc --inference.rtc.execution_horizon=40 --inference.queue_threshold=0`.

## Comparativa con modelos similares

Comparativa con los otros tres policies entrenados sobre el mismo dataset y con el modelo base:

| Modelo | Parametros | Contexto | Rendimiento (tarea R2-D2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GR00T N1.7 (este fine-tuning) | 3,1B (1,6B entrenados) | no disponible | 10/10 entrenadas, 4/4 held-out, ~9,8 s | NVIDIA Open Model License | HuggingFace van-i/groot_r2d2_to_box_bg |
| SmolVLA | no disponible | no disponible | 10/10 entrenadas, 2/2 H1, 0/2 H2, ~8,4 s | no disponible | no disponible |
| Diffusion Policy | no disponible | no disponible | 9/10 entrenadas, 2/2 H1, 0/2 H2, ~16,5 s | no disponible | no disponible |
| ACT | no disponible | no disponible | 8/10 entrenadas, 2/2 H1, 0/2 H2, ~10 s | no disponible | no disponible |
| nvidia/GR00T-N1.7-3B (base) | 3,1B | no disponible | no disponible (modelo base sin ajustar a esta tarea) | NVIDIA Open Model License | HuggingFace nvidia/GR00T-N1.7-3B |

La diferencia clave es la generalización a H2: solo GR00T N1.7 resolvió los dos intentos fuera del área marcada. En velocidad, SmolVLA fue el más rápido (~8,4 s) y Diffusion Policy el más lento (~16,5 s).

## Limitaciones y advertencias

- Especialización estricta de escena: el propio autor indica que el policy solo funciona en una escena como la de entrenamiento (mesa mate oscura, bandeja en su sitio, iluminación y colocación de cámara similares).
- Entrenado con una única instrucción: no es un modelo de propósito general; el seguimiento de instrucciones nuevas es limitado y con objetos nuevos solo completa la tarea de forma aproximada.
- Riesgo de fallo en la manipulación: en las pruebas reales dejó caer el R2-D2 varias veces, aunque logró recuperarse y terminar.
- Datos de entrenamiento reducidos: 50 episodios teleoperados, lo que limita la robustez ante variaciones de posición, iluminación o fondo.
- Idiomas soportados no disponibles: la instrucción de tarea está en inglés; no se documenta soporte multilingüe.
- Licencia: derivado de NVIDIA GR00T N1.7 y distribuido bajo NVIDIA Open Model License; es una licencia "other" con condiciones específicas, por lo que debe revisarse antes de cualquier uso comercial.
- Sin benchmarks generales: no hay resultados de MMLU, HumanEval ni similares; no debe evaluarse como un LLM generalista.
- Tiempo de arranque elevado: ~80 s de carga antes de que el brazo se mueva, poco adecuado para ciclos de arranque frecuentes.
- Hardware y configuración específicos: requiere LeRobot 0.6.0, un SO-100/SO-101 follower y ajustar puerto serie, calibración e índices de cámara.
- Ausencia de datos sobre sesgos: no se documentan sesgos conocidos, al tratarse de un modelo de control robótico y no de generación de lenguaje abierta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/van-i/groot_r2d2_to_box_bg
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Dataset de entrenamiento: https://huggingface.co/datasets/van-i/r2d2_to_box_bg_20261003_210444
- Write-up completo del montaje, comparativa de los cuatro policies y scripts: https://huggingface.co/van-i/so100-imitation-learning-stand
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/

Nota: la búsqueda web realizada no devolvió enlaces relevantes sobre el modelo; los resultados obtenidos correspondían a sitios de vehículos tipo van (leboncoin, StyleVan, Font Vendôme, Dreamer, WeVan) y no guardan relación con este modelo.
