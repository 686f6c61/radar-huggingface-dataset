# wodbs5602/act_pick_place

## Resumen

act_pick_place es una política de robótica (no un modelo de lenguaje) entrenada con el método ACT, Action Chunking with Transformers, y publicada por el usuario wodbs5602 en Hugging Face Hub a través de la librería LeRobot. A partir de una observación compuesta por el estado propioceptivo del robot (vector de 22 dimensiones) y cuatro cámaras RGB, el modelo predice directamente un vector de acción de 22 dimensiones. Está especializado en una única tarea: recoger un objeto de la mesa y depositarlo en una caja.

El checkpoint tiene 51.701.398 parámetros y ocupa 0,2 GB en formato safetensors, lo que lo sitúa en la categoría de modelos pequeños: puede ejecutarse en una GPU de consumo e incluso en CPU. Se distribuye con licencia Apache 2.0 y se entrenó con el dataset wodbs5602/pick_place_box (50 episodios, 41.429 fotogramas a 30 FPS, es decir, unos 23 minutos de demostraciones teleoperadas).

Su relevancia es más práctica que científica: constituye un ejemplo reproducible y de código abierto del flujo completo de LeRobot (grabación de datos, entrenamiento y rollout), útil como plantilla para proyectos de aprendizaje por imitación y como referencia para comparar políticas ACT con alternativas como Diffusion Policy o SmolVLA. El autor no ha publicado resultados de evaluación, por lo que la tasa de éxito real de la política es desconocida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), aprendizaje por imitación con transformer y componente CVAE; la model card no detalla el backbone ni el tamaño del chunk |
| Parámetros totales | 51.701.398 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible (política robótica; no se documenta la ventana de observación) |
| Tipos de cuantización | No disponible; los pesos publicados ocupan 0,2 GB, compatible con fp32 |
| Idiomas soportados | No aplica (el modelo no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot; repositorio de 0,2 GB) |
| Tipo de modelo | Política de control robótico (imitation learning / behavior cloning) |
| Robot objetivo | ffw_sg2_rev1 |
| Entradas | observation.state (22,); observation.images.rgb.cam_left_head (3, 376, 672); cam_left_wrist (3, 424, 240); cam_right_head (3, 376, 672); cam_right_wrist (3, 424, 240) |
| Salidas | action (22,) |
| Frecuencia de control | 30 FPS (según el dataset de entrenamiento) |
| Dataset de entrenamiento | wodbs5602/pick_place_box: 50 episodios, 41.429 fotogramas, 30 FPS |
| Tarea entrenada | "Pick up the object from the table and place it into the box." |
| Descargas / likes | 0 / 0 |
| Fecha de creación (metadata) | 2026-09-22 |
| Versión de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

ACT, descrito en el artículo arXiv:2304.13705 citado por el autor, es un método de aprendizaje por imitación que predice trozos (chunks) de acciones futuras en lugar de un único paso. La formulación habitual es una CVAE condicional: un codificador que observa la secuencia de acciones genera una variable latente de estilo, y un transformer encoder-decoder mapea las observaciones (imágenes procesadas por backbones convolucionales más el estado propioceptivo) a un chunk de acciones. En inferencia se suele aplicar *temporal ensembling*, promediando las predicciones solapadas de chunks consecutivos para suavizar la trayectoria. La model card de este checkpoint no especifica el backbone concreto, el tamaño del chunk ni la estrategia de ensamblado empleada, por lo que esos datos figuran como no disponibles.

El entrenamiento se realizó con LeRobot 0.6.2 durante 50.000 pasos con batch de 8 (unas 400.000 muestras vistas), optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000. Los datos provienen de 50 episodios teleoperados de la tarea de pick and place, con 41.429 fotogramas a 30 FPS (aproximadamente 23 minutos de demostración) capturados por cuatro cámaras: dos frontales (376x672) y dos en las muñecas (424x240). No se documenta uso de RLHF ni DPO, algo que además no aplica a este paradigma, ni tampoco aumento de datos o composición adicional del dataset.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 22 dimensiones a partir de estado y visión, orientados a una tarea concreta de recogida y colocación.
- Percepción multicámara: consume de forma simultánea cuatro flujos RGB (dos frontales y dos en las muñecas) junto con el estado propioceptivo.
- Aprendizaje por imitación: reproduce la distribución de comportamientos presente en las 50 demostraciones teleoperadas.
- Predicción de chunks de acción: según el método ACT, la política emite secuencias cortas de acciones en lugar de pasos aislados, lo que reduce el error de composición en habilidades finas.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no aplica (no procesa texto).
- Capacidades especiales: no dispone de modo *thinking*, audio ni visión general; tampoco tiene generalización *zero-shot* a otras tareas, objetos o robots.

## Casos de uso

- Replicación del flujo completo de LeRobot: sirve como ejemplo end-to-end de grabación de datos, entrenamiento y rollout con `lerobot-rollout`, lo que permite validar una instalación completa antes de invertir en datos propios.
- Punto de partida para *fine-tuning* en una tarea propia: partiendo de este checkpoint o de su configuración de entrenamiento se puede reentrenar ACT sobre un dataset propio de pick and place con un robot del mismo tipo.
- Validación de infraestructura de captura: al requerir cuatro cámaras a 30 FPS con resoluciones concretas, es útil para comprobar el cableado, la calibración y el ancho de banda del sistema de visión.
- Comparación interna de políticas: permite medir en un mismo banco de pruebas el comportamiento de ACT frente a otras familias disponibles en LeRobot, como Diffusion Policy o SmolVLA, sobre el mismo hardware.
- Docencia y formación en robótica: con 51,7 millones de parámetros y 0,2 GB de pesos, es un caso manejable para enseñar aprendizaje por imitación, teleoperación y evaluación de políticas en un laboratorio.
- Pruebas de latencia del bucle de control: al estar entrenado a 30 FPS, obliga a completar cada iteración (captura de cámaras + inferencia + envío de acciones) dentro de unos 33 ms, lo que lo convierte en un banco de pruebas realista para medir la cadencia de un pipeline.
- Estudio de robustez en manipulación: permite experimentar cómo se degrada la política ante cambios de iluminación, posición de objetos o presencia de distractores dentro de la misma celda de trabajo.
- Demostraciones reproducibles en investigación: su licencia Apache 2.0 facilita incluirlo en publicaciones y entornos académicos sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye explícitamente la sección de evaluación vacía, con la indicación de que no se han proporcionado resultados para esta política.

| Tarea | Ensayos | Éxitos | Tasa de éxito |
|---|---|---|---|
| Pick up the object from the table and place it into the box | No disponible | No disponible | No disponible |

Aunque el artículo de ACT reporta tasas de éxito en sus propios entornos experimentales, no se dispone de datos de evaluación medidos sobre este checkpoint concreto.

## Requisitos de hardware

- Pesos: 51,7 millones de parámetros equivalen a unos 207 MB en fp32 y unos 103 MB en fp16, coherentes con el repositorio de 0,2 GB.
- VRAM estimada para inferencia: por debajo de 2 GB con batch 1 (estimación a partir del tamaño de los pesos y de las entradas de imagen, que suman del orden de 2,1 millones de elementos por paso). Cabe en cualquier GPU de consumo.
- GPU recomendadas: RTX 3060, RTX 4060, RTX 4090 o superiores para mantener la cadencia de 30 FPS; las A100 o H100 están sobredimensionadas para este tamaño de modelo. También es viable en GPU integrada o CPU, presumiblemente con mayor latencia, aunque no se han publicado mediciones.
- Ejecución en CPU: viable por tamaño, aunque la captura de cuatro cámaras a 30 FPS y el preprocesado pueden dominar el tiempo de cómputo.
- Opciones de despliegue: LeRobot mediante los comandos `lerobot-rollout` (inferencia sobre el robot) y `lerobot-train` (entrenamiento), sobre PyTorch y con `--policy.device=cuda`. vLLM, llama.cpp, Ollama o TGI no aplican, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible. El punto de referencia funcional es 30 FPS, lo que implica un presupuesto de unos 33 ms por iteración, incluida la lectura de las cuatro cámaras.

## Comparativa con modelos similares

La comparación es cualitativa porque no se dispone de datos cuantitativos ni de evaluaciones publicadas de este checkpoint.

| Modelo | Tipo | Parámetros | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_pick_place (wodbs5602) | ACT, aprendizaje por imitación | 51.701.398 | Estado de 22 dims + 4 cámaras RGB | Apache 2.0 | Hugging Face Hub, vía LeRobot |
| Diffusion Policy | Política generativa por difusión para robótica | No disponible | Estado y, típicamente, imágenes | No disponible en la información proporcionada | Implementación integrada en LeRobot |
| SmolVLA (Hugging Face) | Modelo visión-lenguaje-acción | No disponible | Imágenes e instrucción en lenguaje natural | No disponible en la información proporcionada | Integrado en LeRobot |

Diferencias clave: ACT predice chunks de acción con un transformer y un componente CVAE, Diffusion Policy genera trayectorias mediante un proceso de difusión (más costoso en inferencia) y los modelos VLA como SmolVLA aceptan instrucciones en lenguaje natural y aspiran a generalizar entre tareas. act_pick_place, en cambio, está especializado en una única tarea y un único robot, y no ha sido evaluado públicamente.

## Limitaciones y advertencias

- Especialización extrema: está entrenado para una sola tarea, sobre el robot ffw_sg2_rev1 y con una disposición concreta de cuatro cámaras. Cualquier cambio de robot, de montaje de cámaras o de distribución de la celda invalida la política.
- Dataset muy reducido: 50 episodios y 41.429 fotogramas (unos 23 minutos) son insuficientes para cubrir variabilidad de posiciones, iluminación o distractores; es esperable un sobreajuste al entorno de grabación.
- Sin resultados de evaluación: el autor no ha publicado tasa de éxito ni condiciones de prueba, por lo que el rendimiento real en el robot es desconocido.
- Sin validación por la comunidad: 0 descargas y 0 likes en el momento de la consulta; nadie ha reproducido los resultados públicamente.
- Riesgo de fallo fuera de distribución: al ser una política de imitación, ante observaciones no vistas puede producir acciones erráticas sin señal de incertidumbre ni mecanismo de parada.
- Dependencia de la percepción: errores de calibración, cambios de iluminación, oclusiones o desenfoque en cualquiera de las cuatro cámaras degradan directamente las acciones predichas.
- Sin capacidades de lenguaje ni de instrucciones: la tarea es fija; el campo `--task` de los comandos de LeRobot es una etiqueta, no una orden interpretada semánticamente.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene conservar la atribución y la cita de LeRobot y del artículo de ACT.
- Sesgos: no se documentan sesgos, pero al provenir de demostraciones humanas hereda los sesgos del operador y del entorno de teleoperación (velocidades, agarres y trayectorias concretas).
- Caveat de metadatos: las fechas de creación y actualización del repositorio figuran como 2026-09-22, posteriores a la fecha de esta consulta, lo que sugiere una anomalía en los metadatos del Hub.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wodbs5602/act_pick_place
- Dataset de entrenamiento: https://huggingface.co/datasets/wodbs5602/pick_place_box
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=wodbs5602/pick_place_box
- Artículo de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Cita solicitada por el autor: Cadene, R. et al., "LeRobot: State-of-the-art Machine Learning for Real-World Robotics in Pytorch", 2024.

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces disponibles proceden de la model card y del ecosistema de LeRobot.
