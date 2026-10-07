# TomasAnderegg/pill_sorting_post_trained

## Resumen

`TomasAnderegg/pill_sorting_post_trained` es una política robótica de imitación publicada en HuggingFace por el usuario TomasAnderegg, obtenida mediante fine-tuning del modelo base `lerobot/smolvla_base`. Se trata de un modelo visión-lenguaje-acción (VLA) compacto de la familia SmolVLA, entrenado con la librería LeRobot 0.6.2, cuyo objetivo es controlar un brazo robótico SO-101 (`so_follower`) para clasificar pastillas de colores en compartimentos de distintas formas.

El modelo resuelve una tarea acotada de tipo pick-and-place: recibe una imagen frontal de 480x640 píxeles junto con el estado del robot (vector de 6 dimensiones) y una instrucción en lenguaje natural, y produce directamente un vector de acción de 6 dimensiones. La relevancia de esta ficha radica en que SmolVLA está diseñado para lograr un rendimiento competitivo con un coste computacional reducido y poder desplegarse en hardware de consumo, según la propia model card.

El repositorio ocupa 0,1 GB, los pesos se distribuyen en formato safetensors y la licencia es Apache 2.0. No se han publicado resultados de evaluación real ni benchmarks de rendimiento, y el autor no declara idiomas soportados más allá de las instrucciones de tarea, redactadas en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Visión-lenguaje-acción (VLA) basada en SmolVLA |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (política de imitación: procesa una observación por paso de control) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (las instrucciones de tarea del dataset están en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | so_follower (SO-101) |
| Camaras | front (una camara frontal) |
| Entradas | `observation.state` (6,), `observation.images.front` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tamano del repositorio | 0,1 GB |
| Dataset de entrenamiento | TomasAnderegg/so101_pill_sorting_merged_v2 |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `lerobot/smolvla_base`, presentado por sus autores como un modelo visión-lenguaje-acción compacto y eficiente que alcanza un rendimiento competitivo con un coste computacional reducido y que puede desplegarse en hardware de consumo. La arquitectura concreta (backbone de visión, modelo de lenguaje subyacente, número de parámetros, mecanismo de atención o política de decodificación) no se detalla en la información disponible; el paper de referencia es SmolVLA (arXiv:2506.01844).

El entrenamiento se realizó con LeRobot 0.6.2 mediante aprendizaje por imitación sobre el dataset `TomasAnderegg/so101_pill_sorting_merged_v2`, compuesto por 96 episodios y 133.555 fotogramas grabados a 30 FPS. Las tareas cubren 12 instrucciones distintas que combinan cuatro colores de pastilla (rojo, verde, azul, amarillo) con cuatro compartimentos con forma (cruz, cuadrado, triángulo, círculo). La configuración de entrenamiento declarada es de 50 pasos, batch size 32, optimizador AdamW, learning rate 0,001 y semilla 1000. No se documenta el uso de RLHF ni DPO, ni innovaciones técnicas adicionales más allá de las propias de SmolVLA.

## Capacidades

- Generación de acciones de control robótico: produce directamente un vector de acción de 6 dimensiones a partir de la observación.
- Percepción visual: consume una imagen RGB frontal de 480x640 píxeles a 30 FPS.
- Condicionamiento por instrucción en lenguaje natural: acepta una cadena de tarea (por ejemplo, "Put the red pill in the cross compartment.") para seleccionar el objetivo.
- Manipulación pick-and-place: clasificación de pastillas por color y colocación en compartimentos con forma (cruz, cuadrado, triángulo, círculo).
- Integración con el ecosistema LeRobot: compatible con los comandos `lerobot-rollout` y `lerobot-train`.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje conversacional).
- Soporte de agentes y razonamiento multi-paso: no aplica; ejecuta una política de imitación reactiva.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión general, audio): no disponibles; la visión está limitada a la cámara `front` del robot entrenado.

## Casos de uso

- Clasificación automatizada de pastillas en laboratorio o farmacia: el modelo puede colocar pastillas de distintos colores en compartimentos con forma predefinida, cubriendo las 12 combinaciones de tarea entrenadas.
- Prototipado de políticas de imitación con el brazo SO-101: sirve como punto de partida para validar el flujo completo de LeRobot (grabación de datos, entrenamiento, despliegue) sobre hardware asequible.
- Automatización de celdas de pick-and-place de laboratorio: útil para mover objetos pequeños y ligeros entre contenedores con una única cámara frontal y estado de 6 grados de libertad.
- Investigación en modelos visión-lenguaje-acción: al ser un fine-tune de SmolVLA, permite estudiar el efecto del ajuste fino sobre tareas concretas y compararlo con el modelo base.
- Docencia y demostraciones de robótica con aprendizaje por imitación: el modelo se ejecuta con `lerobot-rollout` y una instrucción de tarea, lo que facilita montar demostraciones reproducibles.
- Evaluación de despliegue en hardware de consumo: la model card indica que SmolVLA puede desplegarse en equipos de gama de consumo, lo que permite probar inferencia local sin clústeres de GPU.
- Generación de datos sintéticos o aumentados para reentrenamiento: las trayectorias generadas por la política pueden usarse como referencia para comparar contra demostraciones humanas, siempre con validación humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye un apartado de evaluación con el texto "No evaluation results have been provided for this policy yet.", por lo que no hay tasas de éxito por tarea ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El repositorio pesa 0,1 GB, lo que da una referencia del tamaño de los pesos, pero no del consumo en memoria durante la inferencia.
- GPU recomendadas: no disponible. La model card de SmolVLA afirma que el modelo puede desplegarse en hardware de consumo, sin especificar modelo ni gama.
- Compatibilidad con GPU de consumo: probable según la afirmación de la model card sobre SmolVLA, pero sin cifras concretas de VRAM o modelos soportados.
- Opciones de despliegue: LeRobot mediante el comando `lerobot-rollout` con `--policy.path=TomasAnderegg/pill_sorting_post_trained`; el entrenamiento se realiza con `lerobot-train`. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a una política robótica de este tipo.
- Latencia y throughput estimados: no disponibles. La captura de datos se realizó a 30 FPS, pero no se especifica la frecuencia de inferencia en despliegue.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| TomasAnderegg/pill_sorting_post_trained | VLA (SmolVLA ajustado) | no disponible | no disponible | apache-2.0 | no publicados |
| lerobot/smolvla_base | VLA (SmolVLA base) | no disponible | no disponible | no disponible en la informacion proporcionada | no publicados en esta ficha |
| Otros modelos VLA (OpenVLA, pi0, etc.) | VLA | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos cuantitativos que permitan una comparación de rendimiento con alternativas de la misma categoría. La única relación verificable es la de fine-tuning respecto a `lerobot/smolvla_base`.

## Limitaciones y advertencias

- Distribución de entrenamiento muy estrecha: solo 96 episodios y 12 tareas de clasificación de pastillas por color y forma; es probable que el modelo falle ante objetos, colores o compartimentos distintos.
- Configuración de entrenamiento con solo 50 pasos declarados: no se documenta la convergencia ni curvas de pérdida, por lo que no puede garantizarse que la política esté bien ajustada.
- Ausencia total de evaluación: no hay tasas de éxito en robot real, ni ensayos por tarea, ni análisis de robustez.
- Dependencia de hardware concreto: entrenado para el robot `so_follower` con una única cámara `front`; un cambio de robot, de montaje de cámara o de calibración invalida las observaciones.
- Sensibilidad esperada a condiciones de iluminación, posiciones de objetos y posibles distractores, no cuantificada por el autor.
- Riesgo físico en despliegue: al ser una política de control, una acción errónea puede provocar colisiones o daños; se recomienda supervisión y límites de seguridad.
- Capacidades lingüísticas no verificadas: solo se documentan instrucciones de tarea en inglés; no hay información sobre otros idiomas.
- Alucinación en el sentido de los modelos de lenguaje: no aplica directamente, pero sí existe el riesgo de generar trayectorias plausibles y erróneas sin señal de incertidumbre.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el usuario debe verificar las licencias del modelo base y del dataset empleados.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TomasAnderegg/pill_sorting_post_trained
- Dataset de entrenamiento: https://huggingface.co/datasets/TomasAnderegg/so101_pill_sorting_merged_v2
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=TomasAnderegg/so101_pill_sorting_merged_v2
