# Tridex/model_act_3cam_dino_10K_22_09

## Resumen

`Tridex/model_act_3cam_dino_10K_22_09` es una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice secuencias cortas de acciones en lugar de pasos individuales. Lo publica el usuario Tridex en Hugging Face y ha sido entrenado y exportado con LeRobot 0.6.1, la librería de aprendizaje automático para robótica del mundo real de Hugging Face. No es un modelo de lenguaje: es una política visión-lenguaje-acción (VLA reducida a visión + estado + acción) que consume el estado del robot y tres cámaras para emitir comandos de control.

El modelo resuelve una tarea concreta de manipulación: coger un cilindro de gas y soltarlo (`"take the gaz cylinder and drop it"`). Se entrenó a partir de 21 episodios teleoperados (22 397 fotogramas a 30 FPS) sobre un brazo `so_follower` con tres cámaras (`front`, `side`, `top`), lo que lo sitúa en el terreno de las políticas de imitación específicas de tarea, no de propósito general.

Su relevancia es doble: por un lado, es un ejemplo reproducible y ligero (62,5 M de parámetros, repo de 0,2 GB) del flujo completo de LeRobot, desde la grabación de datos hasta el despliegue en hardware real; por otro, sirve como referencia de cómo el paradigma ACT sigue siendo competitivo frente a políticas más pesadas (Diffusion Policy, SmolVLA) cuando el presupuesto de cómputo es limitado. El modelo tiene 0 descargas y 0 me gusta en el momento de la consulta, y no incluye resultados de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con codificador visual, fusión de estado y decodificador de acciones con predicción por chunks |
| Parámetros totales | 62 473 542 (~62,5 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en el sentido de LLM; consume una ventana de observación con estado de 6 dimensiones y 3 imágenes de 480x640 y emite un chunk de acciones de 6 dimensiones |
| Tipos de cuantización | no disponible (repo publicado en safetensors, 0,2 GB); no se documentan variantes GGUF, INT8 ni INT4 |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; su única «instrucción» es la tarea textual fija `"take the gaz cylinder and drop it"`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un método de imitación basado en transformers que, en lugar de predecir una única acción por paso de tiempo, predice un *chunk* de acciones futuras. Esta formulación reduce el error de composición acumulado y mejora la estabilidad del control, a costa de introducir un pequeño retardo de reacción. La política recibe como entrada `observation.state` con forma `(6,)` (las seis articulaciones del brazo `so_follower`) y tres flujos visuales RGB de `(3, 480, 640)` procedentes de las cámaras `front`, `side` y `top`, y devuelve `action` con forma `(6,)`. El nombre del repositorio sugiere un codificador visual tipo DINO, aunque la model card no lo confirma explícitamente y no se detalla la configuración del backbone visual ni el tamaño del chunk de acciones (`chunk_size` y `n_action_steps` no aparecen en la información disponible).

El entrenamiento se realizó sobre el dataset `Tridex/_20260922_140724` (21 episodios, 22 397 fotogramas, 30 FPS), recogido por teleoperación para una única tarea. La configuración declarada es de 10 000 pasos con tamaño de lote 4, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000, sobre LeRobot 0.6.1. No se documenta ningún tipo de ajuste por refuerzo, DPO, RLHF ni *fine-tuning* posterior: se trata de aprendizaje por imitación supervisado puro sobre demostraciones humanas. Tampoco se indica el número total de tokens o muestras vistas, la composición exacta del dataset más allá del recuento de episodios y fotogramas, ni si se aplicó alguna técnica de decodificación especulativa o atención lineal.

## Capacidades

- Control robótico por imitación: genera comandos de acción de 6 grados de libertad para un brazo `so_follower` a partir de estado propioceptivo y visión.
- Manipulación guiada por visión con tres cámaras simultáneas (`front`, `side`, `top`), lo que aporta información espacial redundante frente a oclusiones.
- Ejecución de una tarea específica de *pick and place*: `"take the gaz cylinder and drop it"`.
- Predicción de chunks de acciones, lo que reduce la acumulación de error y permite movimientos más suaves que una política paso a paso.
- No dispone de *tool calling*, *function calling* ni soporte de agentes: no es un modelo de lenguaje y no procesa instrucciones en lenguaje natural más allá de la etiqueta de tarea con la que fue entrenado.
- No dispone de capacidades multilingües, de razonamiento simbólico, de generación de código ni de matemáticas.
- No dispone de modo de razonamiento (*thinking mode*), audio ni vídeo más allá de los fotogramas RGB de entrada.

## Casos de uso

- Automatización de una celda de *pick and place*: la política puede coger un cilindro y depositarlo en una posición objetivo en un banco de pruebas con un brazo `so_follower`, que es exactamente la tarea sobre la que fue entrenada; su ventana de observación de tres cámaras ayuda a mantener la referencia espacial durante la aproximación.
- Banco de pruebas docente de aprendizaje por imitación: al ser un modelo pequeño (62,5 M de parámetros, 0,2 GB), es adecuado para que estudiantes reproduzcan el ciclo completo de grabación con LeRobot, entrenamiento y despliegue en hardware de bajo coste.
- Punto de partida para *fine-tuning* en tareas similares: al estar bajo licencia Apache 2.0 y en formato safetensors con la librería LeRobot, se puede reentrenar con `lerobot-train` sobre un dataset propio que comparta el mismo espacio de observación y acción.
- Validación de infraestructura de inferencia en tiempo real: sirve para medir latencia y *throughput* de una política ACT a 30 FPS antes de escalar a modelos mayores, dado su reducido consumo de VRAM.
- Investigación en robustez visual: las tres cámaras (frontal, lateral y superior) permiten estudiar cómo afectan las oclusiones parciales y los cambios de iluminación al rendimiento de una política ACT en entornos controlados.
- Demostraciones reproducibles en artículos y entradas de blog: el repositorio incluye el comando exacto de `lerobot-rollout`, lo que facilita replicar la ejecución y comparar variantes (por ejemplo, distintas semillas o números de cámaras) con resultados trazables.
- Integración en un pipeline de robótica con ROS 2 mediante un nodo envoltorio: la política puede exponerse como servicio de inferencia que recibe estado e imágenes y publica comandos de acción, siempre que se respete el espacio de observación original.
- Evaluación comparativa de métodos de imitación: sirve como referencia ligera frente a políticas de difusión o VLA más grandes en experimentos que midan tasa de éxito por vatio consumido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye la sección de evaluación vacía con la indicación explícita de que aún no se han aportado resultados para esta política (*"No evaluation results have been provided for this policy yet"*), por lo que no existen tablas de tasa de éxito por tarea, número de ensayos ni condiciones de evaluación. Tampoco se dispone de métricas de pérdida de entrenamiento, curvas de aprendizaje ni comparaciones con otras políticas sobre el mismo dataset. La búsqueda web realizada no devolvió ninguna fuente técnica relevante sobre este modelo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, los pesos ocupan aproximadamente 250 MB; en FP16, unos 125 MB. Con lote 1 y tres imágenes de 480x640, el consumo total realista se sitúa por debajo de 1-2 GB, aunque no se dispone de una medición oficial.
- Cabe en GPU de consumo: sí. Una RTX 3060, 4060 o superior es más que suficiente en cuanto a memoria; el cuello de botella real es la latencia para sostener los 30 FPS de control.
- GPU recomendadas: RTX 4090 o A100/H100 para maximizar margen de latencia y permitir varios entornos en paralelo; en el extremo opuesto, una Jetson Orin o incluso una GPU integrada pueden bastar para una única instancia a 30 FPS, aunque no hay datos publicados que lo confirmen.
- Opciones de despliegue: la vía documentada es LeRobot mediante `lerobot-rollout` con `--policy.path=Tridex/model_act_3cam_dino_10K_22_09` y `--strategy.type=base`. No es compatible con vLLM, Ollama, llama.cpp ni TGI, ya que no es un modelo de lenguaje. El entrenamiento se realiza con `lerobot-train` sobre CUDA.
- Latencia y throughput estimados: no disponibles. La model card no publica tiempos de inferencia ni frecuencia efectiva de control alcanzada.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para esta política concreta, por lo que la comparación es necesariamente cualitativa y estructural.

| Modelo | Parámetros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Tridex/model_act_3cam_dino_10K_22_09` (ACT) | 62,5 M | Estado (6,) + 3 cámaras 480x640 | *Pick and place* de un cilindro de gas | Apache 2.0 | Hugging Face, 0 descargas |
| Diffusion Policy | no disponible en la información proporcionada | Estado + visión | Manipulación por imitación con acciones generadas por difusión | no disponible | Repositorio y pesos públicos, no consultados |
| SmolVLA | no disponible en la información proporcionada | Visión + lenguaje + estado | Política VLA de propósito más general | no disponible | Hugging Face / LeRobot, no consultado |
| ACT original (paper, arXiv:2304.13705) | no disponible | Estado + visión | Referencia metodológica del presente modelo | no disponible | Paper público |

La única comparación defendible con los datos disponibles es que este modelo comparte método con el ACT original y comparte ecosistema (LeRobot) con SmolVLA y Diffusion Policy, pero no hay cifras de rendimiento que permitan situarlo por encima o por debajo de ellos. Cualquier tabla numérica adicional sería inventada.

## Limitaciones y advertencias

- Especialización extrema: la política se entrenó para una única tarea (`"take the gaz cylinder and drop it"`) sobre un único robot `so_follower`. No generaliza a otras tareas, objetos ni morfologías sin reentrenamiento.
- Sin evaluación publicada: no hay tasa de éxito medida, lo que impide estimar su fiabilidad real en producción.
- Dataset muy reducido: 21 episodios y 22 397 fotogramas son una base pequeña, lo que aumenta la probabilidad de sobreajuste a las posiciones, iluminación y fondo concretos de la sesión de grabación.
- Acoplamiento al hardware de entrada: el modelo espera exactamente tres cámaras con los nombres `front`, `side` y `top` y una resolución de 480x640. Cualquier cambio en el número, nombre, orden o resolución de las cámaras rompe la inferencia.
- Acoplamiento al espacio de acción: la salida es un vector de 6 dimensiones. Un robot con distinto número de articulaciones o cinemática no puede usar estos pesos.
- Sesgos: al ser una política de imitación, reproduce los sesgos de las demostraciones humanas, incluidas trayectorias subóptimas, preferencias de posicionamiento y cualquier comportamiento idiosincrásico del teleoperador.
- Riesgo de fallo silencioso: en robótica real, un error de la política se traduce en movimiento físico. No hay mecanismo de abstención ni de detección de fuera de distribución documentado.
- Idiomas: no aplica, pero conviene subrayar que el modelo no entiende instrucciones en lenguaje natural; la cadena de tarea es una etiqueta fija, no una entrada libre.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte, y el modelo se distribuye «tal cual», sin resultados que avalen su funcionamiento.
- Fecha de creación: el repositorio figura creado y actualizado el 22 de septiembre de 2026, con 0 descargas y 0 me gusta, por lo que no hay retroalimentación de la comunidad ni validación independiente.
- Aviso de seguridad: cualquier despliegue en un brazo real debe hacerse con límites de par, paradas de emergencia y supervisión humana, dado que no existe información sobre el comportamiento del modelo ante fallos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tridex/model_act_3cam_dino_10K_22_09
- Dataset de entrenamiento: https://huggingface.co/datasets/Tridex/_20260922_140724
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Tridex/_20260922_140724
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Paper de ACT en arXiv: https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y *rollout*: https://huggingface.co/docs/lerobot/main/en/inference

Nota: la búsqueda web realizada no devolvió resultados técnicos relevantes sobre este modelo ni sobre ACT; los enlaces anteriores proceden de la model card y de la información del repositorio.
