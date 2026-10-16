# zijian2022/act_d1_noaug

## Resumen

act_d1_noaug es un checkpoint de política robótica basada en ACT (Action Chunking with Transformers) publicado por el usuario zijian2022 en Hugging Face dentro del ecosistema LeRobot. El modelo aborda una tarea de manipulación concreta: apilar una pieza roja sobre una azul con un brazo FANUC ER4iA, a partir de demostraciones teleoperadas registradas en el dataset zijian2022/fanuc_er4ia_stack_red_on_blue_d1_fixwrist.

No es un modelo de lenguaje ni un sistema multimodal conversacional: es una política de imitación que recibe observaciones visuales (cámara fijada en la muñeca, según el nombre del dataset) junto con el estado del robot, y emite bloques de 40 acciones (chunk_size = 40, n_action_steps = 40), lo que reduce la frecuencia de inferencia necesaria para el control en tiempo real. El checkpoint tiene 51.609.223 parámetros en formato safetensors y un repositorio de 0,2 GB.

Su interés es acotado y práctico: sirve como referencia reproducible de un entrenamiento ACT de 30.000 pasos con aumento de imagen desactivado, y como punto de partida para experimentos de aprendizaje por imitación en robótica. No publica métricas de éxito ni detalles del dataset, y en el momento de la consulta no registra descargas ni validación de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), según la implementación de referencia de LeRobot |
| Parámetros totales | 51.609.223 (metadatos de safetensors) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la entrada es una observación visual más el estado del robot) |
| Tipos de cuantización | no disponible (no se documentan variantes cuantizadas; los pesos se publican en safetensors) |
| Idiomas soportados | no aplica (política de control robótico sin entrada ni salida de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |
| Compatibilidad | LeRobot (pipeline_tag: robotics) |
| Chunk de acciones | 40 (chunk_size = 40, n_action_steps = 40) |
| Pasos de entrenamiento | 30.000 (checkpoint en el paso 30000) |
| Tamaño de lote | 16 |
| Aumento de imagen | desactivado |
| Tamaño del repositorio | 0,2 GB |
| Dataset de entrenamiento | zijian2022/fanuc_er4ia_stack_red_on_blue_d1_fixwrist |

## Arquitectura y entrenamiento

ACT es una arquitectura de aprendizaje por imitación diseñada para manipulación fina: un transformer que incorpora un codificador de tipo CVAE y un extractor de características visuales convolucional, y que en lugar de predecir una única acción predice una secuencia (chunk) de acciones futuras. El objetivo de este diseño es doble: reducir el error de acumulación típico de las políticas que actúan paso a paso y amortiguar la variabilidad de las demostraciones humanas mediante la variable latente de estilo. En inferencia, la política ejecuta el chunk predicho, lo que en este checkpoint equivale a 40 acciones por inferencia.

Los datos disponibles indican un entrenamiento de imitación supervisada durante 30.000 pasos, con tamaño de lote 16 y sin aumento de imagen. La ausencia de aumento implica que la política se entrena con las observaciones tal como aparecen en el dataset, sin perturbaciones sintéticas de color, recorte o brillo. Se desconoce el número de episodios, el número total de transiciones, la composición del dataset y la resolución de las cámaras; tampoco se documenta ningún proceso de ajuste por preferencias (RLHF o DPO), que no resulta de aplicación en este tipo de política. El nombre del dataset sugiere un brazo FANUC ER4iA con cámara fijada en la muñeca, pero no se detallan los grados de libertad, el espacio de acciones ni la frecuencia de control.

## Capacidades

- Ejecución de una política de imitación para una única tarea de manipulación: apilar una pieza roja sobre una azul.
- Predicción de secuencias de 40 acciones por inferencia, lo que permite frecuencias de control efectivas altas con pocas llamadas al modelo.
- Procesamiento de observaciones visuales procedentes de una cámara de muñeca junto con el estado del robot.
- Control de un brazo robótico FANUC ER4iA en el entorno y la configuración para los que fue entrenado.
- No dispone de soporte de tool calling ni de function calling.
- No implementa razonamiento multi-paso, planificación simbólica ni comportamiento de agente.
- No tiene capacidades multilingües, de generación de texto, de código ni de matemáticas.
- No incorpora modo de pensamiento (thinking), visión general, audio ni entrada de instrucciones en lenguaje natural.

## Casos de uso

- Reproducción de la tarea de apilado en laboratorio: el checkpoint se carga en LeRobot y se ejecuta sobre el mismo montaje FANUC ER4iA con cámara de muñeca, lo que permite replicar el experimento del autor sin reentrenar.
- Punto de partida para ajuste fino en una tarea nueva: al ser un checkpoint ACT de 51,6 M de parámetros bajo Apache-2.0, se puede reinicializar el cabezal de acciones y reentrenar con un dataset propio de demostraciones.
- Línea base en estudios de aumento de imagen: el sufijo "noaug" permite comparar directamente contra una variante entrenada con aumento de imagen sobre el mismo dataset y misma arquitectura.
- Evaluación de control por chunks: con n_action_steps = 40, sirve para medir cómo afecta la ejecución en lazo abierto de 40 acciones a la precisión y a la capacidad de recuperación ante perturbaciones.
- Integración en pipelines de LeRobot: el modelo se encaja en los scripts de entrenamiento, evaluación y despliegue de la librería, lo que facilita la trazabilidad de experimentos y la comparación con otras políticas.
- Docencia y divulgación en robótica: es un ejemplo compacto (0,2 GB, 51,6 M de parámetros) que cabe en un portátil con GPU modesta y permite ilustrar el ciclo completo de teleoperación, entrenamiento e inferencia.
- Pruebas de despliegue en hardware embebido: su tamaño reducido hace viable ejecutarlo en una Jetson u ordenador industrial conectado al controlador del robot.
- Estudio del sesgo de escenario: al no emplear aumento de imagen, resulta útil para cuantificar hasta qué punto la política depende de la iluminación, la posición y el fondo exactos del dataset original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye tasa de éxito, número de ensayos, errores por episodio ni comparación con otras políticas.

Únicamente se conocen los hiperparámetros declarados del entrenamiento, que se recogen en la tabla siguiente a título descriptivo y no como medida de rendimiento.

| Hiperparámetro | Valor |
|---|---|
| Pasos de entrenamiento | 30.000 |
| Checkpoint publicado | paso 30000 |
| Tamaño de lote | 16 |
| chunk_size | 40 |
| n_action_steps | 40 |
| Aumento de imagen | desactivado |
| Tasa de éxito | no disponible |
| Número de episodios del dataset | no disponible |
| Número de transiciones totales | no disponible |

## Requisitos de hardware

- Peso de los pesos: aproximadamente 206 MB en fp32, 103 MB en fp16 y 52 MB en int8, calculado a partir de los 51.609.223 parámetros.
- VRAM estimada para inferencia: por debajo de 2 GB en fp32 incluyendo activaciones del extractor visual y buffers de observación en resoluciones de cámara habituales; la cifra exacta depende de la resolución de entrada, que no está documentada.
- Cabe con holgura en cualquier GPU de consumo: GTX 1650, RTX 3060, RTX 4090, e incluso en CPU para inferencia a baja frecuencia.
- GPU recomendadas: no requiere aceleradores de centro de datos; A100 o H100 no aportan ventaja significativa para este tamaño de modelo. Para despliegue embebido, una Jetson Orin o una Jetson Xavier son suficientes.
- Opciones de despliegue: LeRobot sobre PyTorch es la vía documentada por el propio modelo (library_name: lerobot). No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no se trata de un modelo de lenguaje. No se documenta exportación a ONNX o TorchScript.
- Latencia y throughput: no disponibles. Como referencia estructural, al predecir 40 acciones por llamada (n_action_steps = 40), la frecuencia de inferencia necesaria equivale aproximadamente a la frecuencia de control del robot dividida entre 40.
- Almacenamiento: 0,2 GB de repositorio, lo que simplifica el versionado y la distribución de checkpoints.

## Comparativa con modelos similares

La información proporcionada solo describe este checkpoint, por lo que los datos de las alternativas se marcan como no disponibles. La comparación se ofrece a nivel cualitativo, dentro del catálogo de políticas disponibles en LeRobot.

| Modelo | Tipo de política | Salida | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_d1_noaug (este) | ACT, aprendizaje por imitación, tarea única | chunk de 40 acciones | imagen de muñeca + estado del robot | Apache-2.0 | checkpoint en Hugging Face, 0,2 GB |
| ACT de referencia (LeRobot) | ACT, aprendizaje por imitación | chunk de acciones configurable | imagen + estado | Apache-2.0 (repositorio LeRobot) | implementación pública en la librería |
| Diffusion Policy (LeRobot) | política generativa por difusión | secuencia de acciones | imagen + estado | Apache-2.0 (repositorio LeRobot) | implementación pública en la librería |
| SmolVLA (LeRobot) | política basada en modelo visión-lenguaje-acción | acciones condicionadas por instrucción | imagen + instrucción en lenguaje natural | no disponible | pesos e implementación públicos |

Diferencias destacables: ACT predice chunks mediante un codificador CVAE, mientras que Diffusion Policy genera secuencias mediante un proceso de difusión y SmolVLA incorpora condicionamiento por lenguaje natural, del que este checkpoint carece por completo. No se dispone de cifras comparativas de parámetros, contexto ni tasa de éxito para las alternativas dentro de la información consultada.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea (apilar rojo sobre azul) con un único robot (FANUC ER4iA) y una única configuración de cámara de muñeca. No generaliza a otras tareas ni a otras morfologías sin reentrenamiento.
- Sin aumento de imagen: al estar desactivado, la política es más sensible a cambios de iluminación, color de fondo, posición de la cámara y apariencia de las piezas que una variante entrenada con aumentación.
- Sin métricas publicadas: no hay tasa de éxito, número de ensayos ni análisis de fallos, por lo que no se puede estimar su fiabilidad en producción.
- Ejecución en lazo abierto: con n_action_steps = 40, el robot ejecuta 40 acciones sin reobservar. Cualquier perturbación externa durante ese intervalo no se corrige hasta el siguiente chunk, lo que agrava los errores acumulados.
- Riesgo de fallo fuera de distribución: al ser aprendizaje por imitación, no dispone de mecanismo de recuperación ante estados no vistos durante la recolección de datos.
- Dataset opaco: se desconoce el número de episodios, la variabilidad de posiciones iniciales, la frecuencia de control y si hubo demostraciones fallidas, lo que impide valorar la cobertura del espacio de estados.
- Sin capacidades lingüísticas ni multimodales generales: no acepta instrucciones de texto, no genera descripciones y no responde a preguntas sobre la escena.
- Licencia Apache-2.0: permite uso comercial y modificación con conservación del aviso de licencia y del texto de atribución. La licencia cubre el checkpoint, no el dataset asociado ni el software de control del robot, cuyos términos no están documentados en la información disponible.
- Ausencia de validación externa: cero descargas y cero "me gusta" en el momento de la consulta, sin evidencia de reproducción independiente por terceros.
- Advertencia de seguridad: cualquier despliegue sobre hardware físico debe ejecutarse con límites de par, paradas de emergencia y supervisión humana, dado que no se documentan comportamientos ante fallos.
- Posible dependencia del montaje: el nombre del dataset ("fixwrist") sugiere calibración de cámara específica; trasladar el modelo a otra instalación exige recalibración y probablemente reentrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zijian2022/act_d1_noaug
- Dataset de entrenamiento: https://huggingface.co/datasets/zijian2022/fanuc_er4ia_stack_red_on_blue_d1_fixwrist
- Librería LeRobot: https://github.com/huggingface/lerobot
- Artículo de ACT (referencia general de la arquitectura, no citado en la model card): https://arxiv.org/abs/2304.13705
