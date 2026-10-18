# tsangb34/groot-n17-droid-open-drawer-10ep

## Resumen

Este repositorio contiene una política robótica de imitación publicada por tsangb34 con LeRobot. Es un fine-tune de GR00T N1.7, el modelo fundacional cross-embodiment de NVIDIA, para una tarea concreta: abrir un cajón con un robot Franka. No es un modelo de lenguaje conversacional ni un modelo generalista de visión-lenguaje; es una política visión-lenguaje-acción que recibe dos imágenes de cámara, estado propioceptivo y posición cartesiana, y produce un vector de acción de 8 dimensiones.

GR00T N1.7 combina un backbone Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow matching. El checkpoint tiene 3.144.016.000 parámetros y se distribuye en safetensors, con un repositorio de 12,6 GB y licencia Apache 2.0. La política se entrenó sobre 100 episodios y 38.884 fotogramas del dataset local/droid-open-drawer-left-wrist, a 30 FPS, durante 12.160 pasos.

Su relevancia es práctica: sirve como ejemplo reproducible de fine-tuning de un modelo fundacional robótico con LeRobot y como punto de partida para experimentos de manipulación. Sin embargo, no hay resultados de evaluación real ni datos de tasa de éxito, y el alcance queda limitado a la tarea y la configuración de robot descritas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone Cosmos-Reason2/Qwen3-VL y transformer de acciones con flow matching |
| Parámetros totales | 3.144.016.000 |
| Parámetros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible (no se documenta ventana de contexto; la condición es la instrucción de tarea y las observaciones) |
| Tipos de cuantización | no disponible; solo se publican pesos safetensors sin cuantizaciones documentadas |
| Idiomas soportados | no disponible; la única instrucción documentada es "open drawer" |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 12,6 GB; LeRobot) |
| Tipo de modelo | política robótica de imitación visión-lenguaje-acción |
| Pipeline de Hugging Face | robotics |
| Robot objetivo | Franka |
| Cámaras de entrada | `left_image` y `wrist` |
| Entrada de estado | `observation.state` (8,) y `observation.cartesian_position` (6,) |
| Entrada visual | `observation.images.left_image` y `observation.images.wrist`, con forma (3, 360, 640) |
| Salida | `action` (8,) |
| Dataset de entrenamiento | local/droid-open-drawer-left-wrist; 100 episodios; 38.884 fotogramas; 30 FPS |
| Tarea | "open drawer" |
| Librería | LeRobot 0.6.1 |
| Descargas y likes | 0 y 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La política sigue la arquitectura de GR00T N1.7: un backbone de razonamiento visual-lenguaje Cosmos-Reason2/Qwen3-VL y una cabeza de acciones con flow matching. La entrada combina dos cámaras RGB de 360x640, un vector de estado de 8 dimensiones y una posición cartesiana de 6 dimensiones; la salida es un vector de acción de 8 dimensiones. El modelo está condicionado por la instrucción textual de la tarea, en este caso "open drawer".

El entrenamiento es de imitación supervisada a partir de demostraciones; no se documenta RLHF ni DPO. Se usaron 100 episodios y 38.884 fotogramas a 30 FPS, con 12.160 pasos, tamaño de lote 32, optimizador AdamW, tasa de aprendizaje de 0,0001 y semilla 1000, sobre LeRobot 0.6.1. No se detalla la composición exacta del dataset, el número de tokens del backbone ni si se congelaron partes del modelo.

## Capacidades

- Ejecutar una política de manipulación para la tarea "open drawer" en un robot Franka, condicionada por dos cámaras y estado propioceptivo.
- Procesar observaciones multimodales: dos imágenes RGB de 360x640, un estado de 8 dimensiones y una posición cartesiana de 6 dimensiones.
- Generar un vector de acción de 8 dimensiones para el control del robot.
- Servir como punto de partida para fine-tuning con LeRobot en otras tareas de manipulación, adaptando el dataset y la configuración de robot.
- Reutilizar el backbone Cosmos-Reason2/Qwen3-VL y el transformer de acciones de GR00T N1.7 en experimentos de investigación en modelos visión-lenguaje-acción.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, modo thinking, audio, generación de texto general ni capacidades multilingües.
- No se documenta generalización a objetos, posiciones, iluminación o robots distintos de la configuración entrenada.

## Casos de uso

- Automatización de apertura de cajones en un Franka: usar `lerobot-rollout` con `--policy.path=tsangb34/groot-n17-droid-open-drawer-10ep`, las cámaras `left_image` y `wrist` y la instrucción "open drawer"; es adecuado porque la política se entrenó exactamente para esa tarea y esa configuración.
- Banco de pruebas de imitación en LeRobot: ejecutar la política sobre el dataset local/droid-open-drawer-left-wrist y comparar variantes de fine-tuning; sirve para medir sensibilidad a hiperparámetros y a la inicialización de GR00T N1.7.
- Prototipo de asistencia doméstica o logística: integrar la apertura de cajones como subtarea dentro de una secuencia mayor (navegar, abrir, coger, cerrar); requiere un planificador externo y validación de seguridad.
- Investigación en modelos visión-lenguaje-acción: estudiar cómo el backbone Cosmos-Reason2/Qwen3-VL condiciona la política de acciones y probar variantes de congelación o fine-tuning.
- Evaluación de robustez en laboratorio: repetir la tarea con cambios controlados de iluminación, posición inicial del cajón y distractores; no hay una evaluación oficial, así que el equipo debe definir métricas y número de ensayos.
- Despliegue en un equipo con GPU de consumo: cargar el checkpoint en BF16 en una GPU de 16 GB o más y ejecutar `lerobot-rollout`; antes hay que medir latencia y verificar que se alcanza la frecuencia de control necesaria.
- Docencia y replicación: usar el repositorio como ejemplo completo de entrenamiento y despliegue con LeRobot, con la salvedad de que no hay resultados de éxito publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política; por tanto, no hay tasas de éxito, métricas de manipulación ni resultados de MMLU, HumanEval o GSM8K que se puedan tabular. No se deben inferir cifras a partir del nombre del repositorio.

| Evaluación | Resultado |
|---|---|
| Tasa de éxito en "open drawer" | no disponible |
| Métricas de manipulación | no disponible |
| Benchmarks de lenguaje (MMLU, HumanEval, GSM8K) | no aplicables a esta política |

## Requisitos de hardware

- Pesos: 3.144.016.000 parámetros. En FP32 ocupan aproximadamente 12,6 GB; en BF16, unos 6,3 GB; en INT8, unos 3,1 GB; en INT4, unos 1,6 GB. Son estimaciones teóricas a partir del número de parámetros, no requisitos oficiales.
- Para FP32 se recomienda una GPU con 24 GB o más, por ejemplo RTX 4090, A100 40/80 GB o H100. Para BF16, 16 GB pueden ser suficientes en teoría, pero hay que sumar activaciones y el procesamiento de dos imágenes de 360x640.
- En GPUs de consumo: cabe en una RTX 4090 de 24 GB y, en BF16, es razonable probar en RTX 4080 o RTX 4060 Ti de 16 GB. En GPUs de 8 GB no se recomienda sin cuantización, que no está documentada.
- Almacenamiento: el repositorio ocupa 12,6 GB.
- Despliegue: LeRobot con PyTorch y CUDA mediante `lerobot-rollout`. vLLM, TGI, llama.cpp u Ollama no son adecuados para esta política
