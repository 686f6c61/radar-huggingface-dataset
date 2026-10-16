# tomisinf/act-stress-ball-5000

## Resumen

`tomisinf/act-stress-ball-5000` es una política robótica de imitación entrenada con el método ACT (Action Chunking with Transformers) y publicada en Hugging Face por el usuario tomisinf mediante la librería LeRobot. No es un modelo de lenguaje: es un controlador visomotor que, a partir del estado articular de un brazo robótico SO-100 (`so_follower`) y de dos cámaras (muñeca y cenital), predice comandos de acción de 6 grados de libertad para ejecutar una única tarea manipulativa: "Put the stress ball in the bowl" (meter la pelota antiestrés en el cuenco).

El modelo tiene 51.668.614 parámetros y se distribuye en formato safetensors (0,2 GB de repositorio) bajo licencia Apache 2.0. Su relevancia es acotada pero concreta: sirve como ejemplo reproducible de un pipeline de aprendizaje por imitación de extremo a extremo (grabación con teleoperación, entrenamiento, despliegue en robot real) dentro del ecosistema LeRobot, y como referencia de bajo coste computacional para experimentos de robótica de escritorio.

El entrenamiento se realizó sobre 62 episodios (44.432 fotogramas a 30 FPS) durante 5.000 pasos con batch de 4, optimizador AdamW y tasa de aprendizaje 1e-5. El autor no ha publicado resultados de evaluación en robot real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformador con codificador-decodificador y CVAE |
| Parámetros totales | 51.668.614 (~51,7 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no procesa texto; consume una observación por paso y emite un chunk de acciones de longitud no especificada) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (política robótica; no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` (SO-100) |
| Cámaras | `wrist`, `overhead` |
| Entradas | `observation.state` (6,); `observation.images.wrist` (3, 720, 1280); `observation.images.overhead` (3, 720, 1280) |
| Salidas | `action` (6,) |
| Librería | LeRobot (versión 0.6.1 durante el entrenamiento) |
| Tarea | "Put the stress ball in the bowl" |
| Tamaño del repositorio | 0,2 GB |
| Descargas / likes | 6 / 0 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el artículo *Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware* (arXiv:2304.13705). En lugar de predecir una única acción por paso, el modelo predice un "chunk" de acciones futuras de una sola vez, lo que reduce el error de composición y estabiliza el control. La arquitectura combina un backbone visual (codificación de las dos cámaras), un transformador codificador que fusiona estado y observaciones visuales, y un decodificador de acciones condicionado por una variable latente de estilo (CVAE entrenado con reconstrucción y regularización KL). No emplea RLHF ni DPO: es aprendizaje supervisado puro a partir de demostraciones teleoperadas.

Los datos proceden del dataset `tomisinf/stress-ball-bowl-act-data`: 62 episodios, 44.432 fotogramas a 30 FPS, una sola tarea y un solo entorno. La configuración de entrenamiento registrada es de 5.000 pasos, batch de 4, optimizador AdamW, learning rate 1e-5, semilla 1000 y LeRobot 0.6.1, con dispositivo `cuda`. No se documentan aumentos de datos, número de tokens (no aplica a modalidad robótica) ni composición detallada del dataset más allá de los parámetros indicados.

## Capacidades

- Control visomotor de un brazo SO-100 (`so_follower`) con 6 grados de libertad a partir de estado articular y dos flujos de imagen (muñeca y cenital).
- Ejecución de una tarea manipulativa concreta: recoger una pelota antiestrés y depositarla en un cuenco.
- Predicción de secuencias de acciones ("action chunking") en lugar de pasos aislados, lo que reduce el jitter y mejora la suavidad del movimiento.
- Inferencia en tiempo real dentro del bucle de control del robot a 30 FPS (frecuencia de grabación del dataset).
- Integración nativa con el stack LeRobot: `lerobot-rollout` para despliegue y `lerobot-train` para reentrenamiento o ajuste con datos propios.
- No soporta tool calling, function calling, razonamiento multi-paso, diálogo, visión general ni audio: no es un modelo fundacional multimodal, sino una política específica de tarea.
- Capacidades multilingües: no aplica (no procesa texto).

## Casos de uso

- Reproducción de un pipeline completo de aprendizaje por imitación: sirve como referencia didáctica para grabar teleoperación con LeRobot, entrenar una política ACT y desplegarla en un SO-100 real siguiendo los comandos documentados.
- Validación de hardware de bajo coste: permite verificar la calibración de un SO-100, la disposición de las cámaras de muñeca y cenital y la latencia del bucle de control antes de invertir en datasets propios.
- Línea base para experimentos comparativos: al ser una política ACT entrenada con solo 5.000 pasos, resulta útil como cota inferior frente a políticas entrenadas con más datos o métodos alternativos (Diffusion Policy, SmolVLA) en la misma tarea.
- Plantilla de reentrenamiento con datos propios: el flujo `lerobot-train --policy.type=act --dataset.repo_id=...` permite sustituir el dataset por uno nuevo y reutilizar la configuración registrada (AdamW, lr 1e-5, batch 4) como punto de partida.
- Pruebas de integración continua para código robótico: se puede usar para comprobar que un cambio en LeRobot, en los drivers de cámara o en el controlador del robot no rompe la carga del checkpoint ni el bucle de inferencia.
- Docencia y talleres de robótica: el modelo, de 51,7 M de parámetros y 0,2 GB, es lo bastante pequeño para ejecutarse en portátiles con GPU modesta durante sesiones prácticas.
- Auditoría de calidad de datasets: comparar el rendimiento pitch de este modelo frente a uno entrenado con un dataset ampliado ayuda a decidir si conviene recolectar más episodios o diversificar posiciones de objetos e iluminación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica explícitamente: *"No evaluation results have been provided for this policy yet"*, y deja vacía la tabla de evaluación en robot real (tarea, número de ensayos, éxitos y tasa de éxito). Tampoco se aportan métricas de pérdida de entrenamiento, error de acción ni curvas de aprendizaje.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 207 MB en fp32 y 103 MB en fp16/bf16. Sumando activaciones de dos flujos de imagen de 720x1280, el consumo total se sitúa previsiblemente por debajo de 1-2 GB (estimación a partir del tamaño de pesos y de las dimensiones de entrada; no confirmada por el autor).
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 2 GB de VRAM. El autor solo documenta `--policy.device=cuda` para entrenamiento; no especifica el modelo de GPU empleado ("no disponible").
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en tarjetas como RTX 3060, RTX 4060, RTX 4090 o incluso en iGPU con memoria compartida suficiente.
- CPU: LeRobot permite seleccionar dispositivo distinto de CUDA, por lo que la inferencia en CPU es viable en términos de memoria, aunque con mayor latencia y riesgo de no alcanzar los 30 FPS.
- Opciones de despliegue: CLI de LeRobot (`lerobot-rollout --strategy.type=base`), integración directa con el stack PyTorch de LeRobot. Exportación a ONNX, TensorRT, vLLM, llama.cpp u Ollama: no aplica o no está documentada.
- Latencia y throughput: no disponibles. La única referencia temporal es la frecuencia del dataset (30 FPS) y la configuración de entrenamiento (5.000 pasos, batch 4).

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / entradas | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `tomisinf/act-stress-ball-5000` | ACT (transformer + CVAE) | 51,7 M | Estado 6-DOF + 2 imágenes 720x1280 | sin resultados de evaluación | Apache 2.0 | Hugging Face, 6 descargas |
| Diffusion Policy (Chi et al.) | Política por difusión | no disponible en la información proporcionada | imágenes + estado | no disponible | no disponible | código abierto, no en esta ficha |
| SmolVLA (Hugging Face) | VLA compacto | no disponible en la información proporcionada | imágenes + instrucción en lenguaje | no disponible | no disponible | ecosistema LeRobot |
| Otras políticas ACT de LeRobot | ACT | variable | imágenes + estado | no disponible | variable | Hugging Face Hub |

La comparación cuantitativa no es posible con los datos disponibles: no se han publicado métricas de éxito de este checkpoint ni se dispone de las especificaciones numéricas de las alternativas en la información proporcionada. La diferencia cualitativa principal es que este modelo está entrenado para una única tarea y no acepta instrucciones en lenguaje natural, a diferencia de los enfoques VLA.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo ha visto una tarea, un objeto y un entorno. No generaliza a instrucciones nuevas ni a otros objetos sin reentrenamiento.
- Ausencia total de evaluación: no hay tasa de éxito publicada, por lo que se desconoce su fiabilidad real incluso en la tarea para la que fue entrenado.
- Dataset muy reducido: 62 episodios y 44.432 fotogramas son insuficientes para una generalización robusta; es probable que el modelo sea sensible a cambios de posición del objeto, iluminación, fondo o distracciones.
- Dependencia estricta de la interfaz: los nombres de cámara (`wrist`, `overhead`) y las claves de observación deben coincidir exactamente con los del entrenamiento, con resolución de 720x1280; cualquier cambio en la configuración rompe la inferencia.
- Dependencia del hardware: entrenado para un `so_follower` concreto; usar otro robot, aunque sea del mismo modelo, exige recalibrar y probablemente reentrenar.
- Riesgo de sobreajuste y de acumulación de error: en políticas de imitación, los errores se componen a lo largo de la trayectoria y pueden llevar a estados fuera de la distribución del dataset.
- Sin capacidades de lenguaje, razonamiento, tool calling ni planificación multi-paso: no debe emplearse en escenarios conversacionales o de agentes.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se distribuye "tal cual", sin garantías ni soporte del autor, y sin datos de sesgos ni de seguridad física.
- Advertencia de seguridad: cualquier despliegue sobre hardware físico requiere límites de par, paradas de emergencia y supervisión humana; el repositorio no incluye documentación de seguridad.
- Metadatos a revisar: el repositorio indica fechas de creación y actualización del 16 de octubre de 2026, posteriores a la fecha de consulta; puede tratarse de un error de metadatos.
- Adopción prácticamente nula: 6 descargas y 0 likes, sin issues ni discusión asociada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tomisinf/act-stress-ball-5000
- Dataset de entrenamiento: https://huggingface.co/datasets/tomisinf/stress-ball-bowl-act-data
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=tomisinf/stress-ball-bowl-act-data
- Artículo de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Búsqueda web: no se encontraron enlaces relevantes al modelo, al paper ni al ecosistema LeRobot; los resultados devueltos correspondían a sitios de contenido para adultos generado con IA y no guardan relación con esta ficha.
