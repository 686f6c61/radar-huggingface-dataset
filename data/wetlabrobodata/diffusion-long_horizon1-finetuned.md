# WetLabRoboData/diffusion-long_horizon1-finetuned

## Resumen

`diffusion-long_horizon1-finetuned` es una política de control robótico basada en difusión, publicada por WetLabRoboData dentro del ecosistema LeRobot de Hugging Face. No es un modelo de lenguaje: recibe observaciones visuales de tres cámaras junto con el estado del robot y genera secuencias de acciones continuas que ejecuta un brazo bimanual UR3e. Se ha especializado mediante ajuste fino en una tarea de horizonte largo denominada `long_horizon1`, propia de un entorno de laboratorio húmedo.

El punto de partida es la política multitarea `WetLabRoboData/diffusion-multitask_12task_mix-multitask`, entrenada sobre una mezcla de 12 tareas, que después se ha reentrenado con el conjunto de datos `WetLabRoboData/lerobot-data-long_horizon1`. El interés práctico del modelo está en el flujo de trabajo que ilustra: preentrenamiento multitarea para obtener representaciones reutilizables y ajuste fino por tarea para reducir la cantidad de demostraciones necesarias.

La model card no publica el número de parámetros, la arquitectura concreta del backbone de difusión ni el volumen de datos de entrenamiento. El único dato cuantitativo de rendimiento disponible es la evaluación sobre la tarea objetivo: 6 éxitos en 20 episodios. La licencia es Apache 2.0, con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de difusión (diffusion policy) de LeRobot; el backbone concreto no se detalla en la model card |
| Parámetros totales | No disponible |
| Longitud de contexto | No aplica: política de acción condicionada por observaciones; la ventana de historial no se documenta |
| Tipos de cuantización | No disponible; no se documentan cuantizaciones (no es un modelo de lenguaje) |
| Idiomas soportados | No aplica (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible; se carga mediante `DiffusionPolicy.from_pretrained` de LeRobot |
| Variante | Ajuste fino (preentrenamiento multitarea y ajuste posterior en esta tarea) |
| Robot objetivo | UR3e bimanual con 3 cámaras |
| Tarea objetivo | `long_horizon1` |
| Modelo base | `WetLabRoboData/diffusion-multitask_12task_mix-multitask` |
| Dataset de entrenamiento | `WetLabRoboData/lerobot-data-long_horizon1` |
| Librería | `lerobot` |
| Pipeline | `robotics` |

## Arquitectura y entrenamiento

La model card identifica el modelo como una política de difusión (familia `diffusion` de LeRobot) y como variante de ajuste fino: primero un preentrenamiento multitarea sobre una mezcla de 12 tareas y después un ajuste sobre el conjunto de datos específico de `long_horizon1`. El entrenamiento es de imitación (etiqueta `imitation-learning`), de modo que la política aprende a reproducir distribuciones de acciones a partir de demostraciones, sin función de recompensa ni bucle de refuerzo documentado. No se especifica el número de tokens, episodios o pasos de entrenamiento, ni la composición del dataset más allá de su identificador.

Tampoco se documentan innovaciones técnicas concretas (por ejemplo, número de pasos de difusión, tipo de scheduler, uso de decodificación especulativa o de atención lineal), ni si hubo fases de RLHF o DPO, que en cualquier caso no son habituales en este tipo de políticas. Un detalle de trazabilidad relevante es el origen del repositorio: los datos se reorganizaron el 2026-10-04 a partir de `WetLabRoboData/lerobot-data-rama-lbm_finetune_longhorizon1_cam_reorient`, y las salidas de entrenamiento archivadas (checkpoints, `train_config.json`, `wandb/`) se conservan en la subcarpeta `old/` de ese repositorio de origen. El sufijo `cam_reorient` del origen sugiere un reajuste de la orientación de cámara durante la preparación de los datos, aunque la model card no lo explica.

## Capacidades

- Control robótico de manipulación: genera acciones continuas para un UR3e bimanual a partir de observaciones visuales y del estado del robot.
- Percepción multimodal de entrada: condicionamiento sobre tres cámaras, según la especificación del robot objetivo.
- Coordinación bimanual: la configuración declarada es de dos brazos, orientada a tareas de laboratorio húmedo.
- Ejecución de tareas de horizonte largo: el modelo está ajustado específicamente para la tarea `long_horizon1`.
- Reutilización por ajuste fino: al derivar de una política multitarea de 12 tareas, sirve como punto de partida para especializaciones adicionales.
- Evaluación reproducible: el repositorio publica 20 episodios de rollout con resultados por episodio en `WetLabRoboData/eval-diffusion-long_horizon1-finetuned`.
- Generación de texto: no aplica, el modelo no produce lenguaje.
- Tool calling o function calling: no aplica.
- Capacidades de agente o razonamiento multi-paso simbólico: no aplica; el horizonte largo es de ejecución motora, no de razonamiento.
- Capacidades multilingües: no aplica.
- Modo de pensamiento, visión generativa o audio: no aplica. La visión se usa como entrada de condicionamiento, no como salida.

## Casos de uso

- Automatización de protocolos de laboratorio húmedo: el modelo ejecuta de forma autónoma la secuencia de manipulación `long_horizon1` sobre un UR3e bimanual, lo que permite repetir un protocolo sin teleoperación continua.
- Investigación en aprendizaje por imitación: sirve como caso de estudio reproducible de preentrenamiento multitarea seguido de ajuste fino por tarea, con dataset de entrenamiento y dataset de evaluación publicados.
- Punto de partida para ajuste fino en tareas relacionadas: al derivar de una política entrenada sobre 12 tareas, se puede reentrenar con un conjunto propio reducido cuando la tarea comparte el mismo robot y la misma configuración de cámaras.
- Evaluación comparativa de políticas de difusión: el conjunto de 20 episodios con resultados por episodio permite contrastar variantes (otras políticas, otros ajustes) bajo el mismo protocolo.
- Generación de datos de rollout: los vídeos de evaluación publicados pueden emplearse para analizar modos de fallo, planificación de trayectorias o diseño de recompensas en trabajos posteriores.
- Demostración de despliegue con LeRobot: el fragmento de carga incluido en la model card (`DiffusionPolicy.from_pretrained`) facilita integrar el modelo en un pipeline existente de la librería para pruebas de control en banco.
- Preparación de entornos de laboratorio automatizados: como componente de un sistema mayor en el que un planificador de alto nivel encadena varias políticas especializadas, una por tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la información disponible; no aplican a un modelo de este tipo. El único resultado cuantitativo publicado es la evaluación específica de la tarea:

| Tarea | Episodios de evaluación | Éxitos | Tasa de éxito | Robot |
|---|---|---|---|---|
| `long_horizon1` | 20 | 6 | 30 % | UR3e bimanual, 3 cámaras |

No se proporcionan métricas de error de acción, tiempos de ejecución, ni comparación con otras políticas bajo el mismo protocolo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; la model card no publica el tamaño del checkpoint ni los requisitos de memoria.
- GPU recomendadas: no disponible. La librería LeRobot ejecuta políticas de difusión sobre PyTorch con CUDA, pero no se especifica ningún modelo de GPU concreto en la información proporcionada.
- Viabilidad en GPU de consumo: no confirmada; al no conocerse el número de parámetros, no se puede afirmar que quepa en una RTX 4090 u otras tarjetas de gama de consumo.
- CPU: no documentado; la inferencia de políticas de difusión suele requerir aceleración por GPU para cumplir los requisitos de frecuencia de control, pero no hay datos publicados al respecto.
- Opciones de despliegue: la vía indicada por el autor es la librería LeRobot, con `DiffusionPolicy.from_pretrained("WetLabRoboData/diffusion-long_horizon1-finetuned")`. Los runners orientados a modelos de lenguaje (vLLM, llama.cpp, Ollama, TGI) no son aplicables a este tipo de política.
- Latencia y throughput: no disponible. No se publican pasos de difusión, frecuencia de control ni tiempos por episodio.

## Comparativa con modelos similares

No se publican métricas comparativas en la información disponible. La tabla siguiente recoge únicamente lo que puede afirmarse con los datos aportados:

| Modelo | Tipo | Parámetros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `diffusion-long_horizon1-finetuned` (este modelo) | Política de difusión, ajuste fino | No disponible | No aplica | 6/20 en `long_horizon1` | Apache 2.0 | Hugging Face, 0 descargas al consultar |
| `diffusion-multitask_12task_mix-multitask` (modelo base) | Política de difusión multitarea | No disponible | No aplica | No disponible | No disponible | Hugging Face |
| Otras políticas de LeRobot (familias ACT, SmolVLA, pi0) | Políticas de imitación alternativas | No disponible | No disponible | No disponible | No disponible | Disponibles en el ecosistema LeRobot |

No se dispone de una comparación bajo el mismo protocolo de evaluación entre este modelo y alternativas de la misma categoría.

## Limitaciones y advertencias

- Tasa de éxito baja: 6 de 20 episodios completados correctamente (30 %), es decir, 14 fallos en la evaluación publicada. No es adecuado para despliegues de producción sin supervisión.
- Rendimiento limitado a una única tarea: está ajustado para `long_horizon1`; no se documenta su comportamiento fuera de esa tarea ni su capacidad de generalización.
- Dependencia de la configuración de hardware: requiere un UR3e bimanual y tres cámaras; cualquier cambio en la disposición u orientación de las cámaras puede degradar el rendimiento. El propio origen del repositorio incluye el sufijo `cam_reorient`, lo que indica que la calibración de cámara fue objeto de trabajo previo.
- Ausencia de datos de entrenamiento: no se publican número de episodios, horas de demostración ni composición del dataset, lo que impide estimar la cobertura de situaciones y el riesgo de sobreajuste.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existen modos de fallo equivalentes en políticas de imitación, como la ejecución de trayectorias plausibles pero incorrectas ante observaciones fuera de distribución.
- Sesgos: no documentados. No hay análisis de sesgo por tipo de objeto, iluminación, material o posición inicial.
- Idiomas: no aplica; el modelo no procesa ni genera lenguaje.
- Licencia: Apache 2.0, que permite uso comercial y modificación sin restricciones declaradas. Conviene verificar por separado la licencia del dataset de entrenamiento y del dataset de evaluación, no indicada en la información proporcionada.
- Trazabilidad: el repositorio se reorganizó el 2026-10-04 desde otro repositorio de origen; los artefactos de entrenamiento originales quedan en la subcarpeta `old/` del repositorio fuente, no en este.
- Adopción: 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación externa ni informes de terceros sobre su comportamiento.
- Reproducibilidad: no se publican semillas, hiperparámetros ni configuración de entrenamiento en la model card, solo la referencia a los archivos archivados en el repositorio de origen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WetLabRoboData/diffusion-long_horizon1-finetuned
- Dataset de entrenamiento: https://huggingface.co/datasets/WetLabRoboData/lerobot-data-long_horizon1
- Dataset de evaluación (vídeos de rollout y resultados por episodio): https://huggingface.co/datasets/WetLabRoboData/eval-diffusion-long_horizon1-finetuned
- Modelo base multitarea: https://huggingface.co/WetLabRoboData/diffusion-multitask_12task_mix-multitask
- Repositorio de origen con los artefactos de entrenamiento archivados: https://huggingface.co/datasets/WetLabRoboData/lerobot-data-rama-lbm_finetune_longhorizon1_cam_reorient
- Librería LeRobot: https://github.com/huggingface/lerobot

No se han encontrado papers, blogs ni demos adicionales específicos de este modelo en la búsqueda web realizada; los resultados obtenidos corresponden a otros proyectos de difusión (generación de imagen y vídeo) sin relación con esta política robótica.
