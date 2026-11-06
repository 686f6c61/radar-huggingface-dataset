# TomasAnderegg/pill_sorting_colour_cf_departure_mix_ft_v2

## Resumen

`TomasAnderegg/pill_sorting_colour_cf_departure_mix_ft_v2` es una política de imitación para robótica basada en SmolVLA, un modelo visión-lenguaje-acción (VLA) compacto publicado por Hugging Face y descrito en el paper arXiv:2506.01844. El modelo ha sido entrenado con LeRobot 0.6.2 sobre un robot `so_follower` (SO-101) equipado con una única cámara frontal, y su tarea es el ordenado de pastillas por color en compartimentos con formas geométricas distintas.

Se trata de un fine-tune del checkpoint `TomasAnderegg/pill_sorting_full_ft_a100_v3_dagger60`, a su vez derivado del SmolVLA base. El modelo consume un vector de estado de 6 dimensiones y una imagen RGB de 480x640, y produce un vector de acción de 6 dimensiones a 30 FPS. Con 450 millones de parámetros, es lo bastante pequeño para ejecutarse en hardware de consumo, lo que lo hace relevante para prototipado de manipulación robótica de bajo coste.

La relevancia actual radica en que demuestra el flujo completo de entrenamiento por imitación con SmolVLA sobre un dataset pequeño (404 episodios, 77.984 frames) y en que incorpora variantes de instrucción en lenguaje natural (16 combinaciones de color y compartimento), lo que permite evaluar el seguimiento de instrucciones en políticas VLA compactas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer compacto) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors en el repo) |
| Idiomas soportados | no disponible (instrucciones en inglés en el dataset) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo visión-lenguaje-acción compacto que combina un codificador visual, un codificador de lenguaje y un decodificador de acciones, siguiendo el paradigma de políticas de imitación condicionadas por instrucción. El modelo recibe `observation.state` (6 dimensiones) y `observation.images.front` (3x480x640) y emite `action` (6 dimensiones), correspondientes a los grados de libertad del robot SO-101. El paper de referencia (arXiv:2506.01844) describe el diseño orientado a reducir coste computacional manteniendo rendimiento competitivo y despliegue en hardware de consumo.

El fine-tune se realizó durante 4.000 pasos con batch size 64, optimizador AdamW y learning rate 1e-05, con semilla 1000, sobre el dataset `TomasAnderegg/pill_sorting_colour_cf_departure_mix_v2` (404 episodios, 77.984 frames, 30 FPS, una cámara a 640x480). El dataset contiene 16 instrucciones distintas que combinan cuatro colores (azul, rojo, amarillo, verde) con cuatro compartimentos (cuadrado, círculo, triángulo, cruz). El nombre del checkpoint sugiere entrenamiento con DAgger (el base model incluye `dagger60`), aunque la model card no detalla la composición exacta ni el proceso de mezcla de datos.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 dimensiones para un robot SO-101 (`so_follower`) a partir de observaciones visuales y de estado.
- Seguimiento de instrucciones en lenguaje natural: 16 tareas de tipo "Put the {colour} pill in the {shape} compartment."
- Percepción visual monocámara: procesa imágenes RGB de 480x640 a 30 FPS.
- Política de imitación end-to-end: no requiere planificación explícita ni módulos de percepción separados.
- Despliegue en hardware de consumo: el tamaño de 450M parámetros permite inferencia en GPU de gama media.
- Integración con LeRobot: compatible con `lerobot-rollout` y `lerobot-train` para evaluación y reentrenamiento.
- No soporta tool calling, agentes multi-paso, visión general, audio ni razonamiento simbólico: es una política de acción, no un LLM de propósito general.

## Casos de uso

- Ordenado automatizado de pastillas en laboratorio: el modelo ejecuta la tarea de clasificar pastillas por color en compartimentos con formas, adecuado para demostrar pipelines de manipulación pick-and-place con un solo brazo y una cámara.
- Prototipado de políticas VLA en investigación: sirve como punto de partida para fine-tunes sobre nuevos datasets de manipulación, ya que el flujo `lerobot-train` con `--policy.path` permite reentrenar desde este checkpoint.
- Benchmark de seguimiento de instrucciones en robótica: las 16 combinaciones color-forma permiten medir la fidelidad de la política a la instrucción lingüística frente a la ejecución ciega de una trayectoria.
- Educación y docencia en aprendizaje por imitación: el modelo y su dataset son reproducibles con LeRobot y hardware SO-101 de bajo coste, útiles para cursos de robótica.
- Evaluación de robustez con DAgger: al derivar de un checkpoint entrenado con DAgger (`dagger60`), es útil para estudiar la corrección de errores en políticas de imitación.
- Despliegue en entornos de laboratorio con hardware limitado: con 450M parámetros, puede ejecutarse en una GPU de consumo para experimentos de manipulación en tiempo real a 30 FPS.
- Base para investigación en generalización de color/forma: el dataset mezcla 16 tareas, lo que permite analizar si la política generaliza a combinaciones no vistas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía (el comentario del template pide reportar resultados en robot real, pero no se aportan tasas de éxito).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450M parámetros en safetensors, una estimación razonable en FP32 ronda 1,8 GB de pesos, y en FP16/BF16 alrededor de 0,9 GB, más el coste del codificador visual y del buffer de imágenes.
- GPU recomendadas: no especificadas por el autor; el paper de SmolVLA indica despliegue en hardware de consumo, por lo que una RTX 3060/4060 o superior debería ser suficiente para inferencia.
- Cabe en GPU de consumo: sí, según la descripción de SmolVLA como modelo desplegable en hardware de consumo; no se confirma una GPU concreta en la información disponible.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), y el stack de entrenamiento `lerobot-train`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a una política de acción.
- Latencia y throughput: no disponibles; el control opera a 30 FPS según la tasa del dataset, pero no se publica latencia medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `pill_sorting_colour_cf_departure_mix_ft_v2` (este) | 450M | no disponible | Manipulación VLA (SO-101) | apache-2.0 | Hugging Face |
| `TomasAnderegg/pill_sorting_full_ft_a100_v3_dagger60` (base) | no disponible | no disponible | Manipulación VLA (SO-101) | no disponible | Hugging Face |
| SmolVLA base (Hugging Face) | no disponible | no disponible | VLA generalista | no disponible | Hugging Face / paper arXiv:2506.01844 |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: la política solo ha sido entrenada para la tarea de ordenar pastillas por color y forma con un robot SO-101 y una cámara frontal; no generaliza a otros robots, cámaras ni tareas.
- Dependencia del entorno: cambios en iluminación, posición de cámara, fondo o calibración del robot pueden degradar el rendimiento; no se reportan evaluaciones de robustez.
- Sin métricas de éxito publicadas: la sección de evaluación de la model card está vacía, por lo que no hay evidencia cuantitativa de fiabilidad en robot real.
- Riesgo de sobreajuste al dataset: 404 episodios y 4.000 pasos de entrenamiento con learning rate bajo sugieren un ajuste fino conservador, pero no se documenta validación.
- Idiomas: las instrucciones del dataset están en inglés; no se declara soporte multilingüe.
- Sesgos: no documentados por el autor; al ser una política visual, puede heredar sesgos de los datos de demostración (posiciones, colores y configuraciones concretas).
- Licencia apache-2.0: permite uso comercial, pero el modelo base y el dataset deben verificarse por separado; la model card no detalla restricciones adicionales.
- Caveat de producción: no es un modelo de propósito general; su uso en producción requiere validación específica del entorno y del robot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TomasAnderegg/pill_sorting_colour_cf_departure_mix_ft_v2
- Modelo base: https://huggingface.co/TomasAnderegg/pill_sorting_full_ft_a100_v3_dagger60
- Dataset de entrenamiento: https://huggingface.co/datasets/TomasAnderegg/pill_sorting_colour_cf_departure_mix_v2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=TomasAnderegg/pill_sorting_colour_cf_departure_mix_v2
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Guía LeRobot SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset relacionado `pill_sorting_colour_mix_v1`: https://huggingface.co/datasets/TomasAnderegg/pill_sorting_colour_mix_v1
