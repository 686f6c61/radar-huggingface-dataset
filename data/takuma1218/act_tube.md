# Takuma1218/act_tube

## Resumen

`Takuma1218/act_tube` es una política de robótica entrenada con el método ACT (Action Chunking with Transformers) y publicada en Hugging Face mediante la librería LeRobot. No es un modelo de lenguaje: es un controlador de imitación que, a partir de una imagen de cámara y del estado articular del robot, predice directamente comandos de acción para un brazo manipulador. El autor es el usuario Takuma1218 y la política está pensada para ejecutar una única tarea: «Pick up the tube and stand it» (coger un tubo y dejarlo de pie).

El modelo resuelve el problema clásico de la imitación en robótica: en lugar de predecir una sola acción por paso (lo que acumula error y produce movimientos entrecortados), ACT predice *chunks* de acciones, es decir, secuencias cortas de comandos que se ejecutan de forma abierta entre inferencias. Esto reduce el error compuesto y permite frecuencias de control estables aunque el modelo se evalúe a menor ritmo que el bucle de control del robot.

Es relevante ahora porque forma parte del ecosistema LeRobot, que estandariza el registro de datos de teleoperación, el entrenamiento y el despliegue de políticas open source sobre hardware de bajo coste. Con 51.668.614 parámetros, es un modelo pequeño que puede ejecutarse en GPU de consumo, lo que lo convierte en una pieza útil para reproducir experimentos de aprendizaje por imitación sin infraestructura cara. La licencia Apache-2.0 facilita su reutilización, aunque la política está fuertemente acoplada a la morfología del robot y a la tarea con los que fue entrenada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con espacio latente tipo CVAE para aprendizaje por imitación |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política robótica; ventana de observación fija por chunk de acciones) |
| Tipos de cuantización | no disponible (solo se publican pesos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje; no hay soporte idiomático) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repositorio de 7,4 GB) |
| Modalidad de entrada | `observation.state` STATE `(6,)` y `observation.images.front` VISUAL `(3, 480, 640)` |
| Modalidad de salida | `action` ACTION `(6,)` |
| Tipo de robot | `so_follower` (brazo seguidor de bajo coste del ecosistema LeRobot) |
| Cámaras | `front` (una cámara frontal) |
| Librería | lerobot |
| Dataset de entrenamiento | `Takuma1218/test_run_20260924_114725` (22 episodios, 19.800 frames, 30 FPS) |
| Pipeline declarado | robotics |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La política sigue el método ACT descrito en el artículo enlazado por el autor (arXiv:2304.13705). ACT combina un transformer con un esquema de *action chunking*: el modelo recibe la observación actual y predice un bloque de acciones futuras en lugar de un único paso. La formulación habitual del método emplea un espacio latente de tipo CVAE que modela la variabilidad de las demostraciones humanas, junto con una pérdida de reconstrucción sobre las acciones. Esta combinación es la que permite que, con muy pocas demostraciones, se obtengan trayectorias suaves y consistentes.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `test_run_20260924_114725`: 22 episodios de teleoperación, 19.800 frames en total a 30 FPS (lo que equivale a unos 900 frames y 30 segundos por episodio). La tarea única grabada es «Pick up the tube and stand it». La configuración declarada es de 20.000 pasos de entrenamiento, batch de 16, optimizador AdamW, learning rate de 1e-05 y semilla 1000. No se documenta en la información disponible ningún uso de RLHF, DPO ni fases de ajuste con preferencias humanas, algo por otra parte esperable en una política de imitación. Tampoco se detallan innovaciones adicionales más allá del propio chunking de acciones.

El repositorio ocupa 7,4 GB pese a que el modelo tiene solo 51,7 millones de parámetros (unos 207 MB en FP32), lo que sugiere la presencia de múltiples checkpoints intermedios o estados del optimizador acumulados durante el entrenamiento.

## Capacidades

- Control visuomotor de un brazo `so_follower` de 6 grados de libertad: genera comandos de acción de dimensión 6 a partir de una imagen RGB de 480×640 y del estado articular.
- Ejecución de una tarea concreta de manipulación: coger un tubo y dejarlo en posición vertical, aprendida por imitación de teleoperación.
- Predicción de chunks de acciones, lo que produce trayectorias más suaves y reduce el error compuesto frente a políticas paso a paso.
- Inferencia en tiempo real compatible con un bucle de control a 30 FPS, la misma frecuencia a la que se grabaron los datos.
- Despliegue directo con la CLI de LeRobot (`lerobot-rollout`) sobre hardware real.
- Reentrenamiento y ajuste fino sobre nuevos datasets mediante `lerobot-train` con `--policy.type=act`.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico ni capacidades de agente en el sentido de los modelos de lenguaje.
- No dispone de capacidades multilingües, de visión general (captioning, VQA) ni de audio: la imagen de entrada se usa exclusivamente como observación de control.
- No dispone de modo «thinking» ni de generación de texto de ningún tipo.

## Casos de uso

- Reproducción de experimentos de aprendizaje por imitación: la política sirve como referencia pública para verificar que un pipeline LeRobot completo (grabación, entrenamiento, rollout) funciona de extremo a extremo sobre un brazo `so_follower`.
- Docencia y formación en robótica: permite ilustrar en un laboratorio cómo se comporta una política ACT entrenada con 22 episodios y por qué el *action chunking* mejora la suavidad del movimiento.
- Punto de partida para ajuste fino: al ser un modelo pequeño (51,7 M de parámetros) y con licencia Apache-2.0, puede reentrenarse con nuevos datasets para tareas de recogida y colocación de objetos similares.
- Validación de setups de hardware: sirve para comprobar calibración de cámara, resolución de captura (480×640), frecuencia (30 FPS) y port del brazo antes de invertir tiempo en grabaciones largas.
- Recogida y apilado de objetos cilíndricos en entornos controlados: el caso concreto entrenado («coger el tubo y dejarlo de pie») es directamente aplicable a células de manipulación de piezas cilíndricas en laboratorio o línea de montaje simplificada.
- Evaluación comparativa de políticas: puede usarse como baseline ACT frente a políticas de difusión u otros métodos disponibles en LeRobot, manteniendo el mismo robot y la misma tarea.
- Generación de datos sintéticos de evaluación: el rollout de la política sobre variaciones de posición del objeto permite medir robustez y documentar tasas de éxito, algo que el autor aún no ha publicado.
- Pruebas de integración con ROS u otros middlewares: las interfaces de entrada y salida están bien definidas (tensores de forma `(6,)` y `(3, 480, 640)`), lo que simplifica envolver la política en un nodo de control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye explícitamente la sección de evaluación vacía, con la nota «No evaluation results have been provided for this policy yet». No existen por tanto tasas de éxito en robot real, número de ensayos, ni comparaciones cuantitativas con otras políticas para esta tarea concreta.

| Métrica | Resultado |
|---|---|
| Tasa de éxito en robot real | no disponible |
| Número de ensayos de evaluación | no disponible |
| MMLU, HumanEval, GSM8K u otros benchmarks de lenguaje | no aplica (no es un modelo de lenguaje) |

## Requisitos de hardware

- Pesos del modelo: 51.668.614 parámetros, aproximadamente 207 MB en FP32 y unos 103 MB en FP16/BF16. Solo los pesos, sin contar activaciones ni buffers.
- VRAM estimada para inferencia: en el rango de 0,5 a 2 GB, dependiendo de la precisión, del tamaño de lote y de si se procesan varias cámaras o secuencias simultáneas por paso de control.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 4 GB de VRAM es suficiente; una NVIDIA RTX 3060, RTX 4060 o superior cubre el caso sin problema. Las GPU de centro de datos (A100, H100) no aportan ventaja relevante para este tamaño de modelo salvo por margen de cómputo.
- Cabe en GPU de consumo: sí, con holgura, incluidas GPU de gama de entrada recientes. También puede ejecutarse en CPU, aunque el requisito de mantener 30 FPS en el bucle de control hace recomendable una GPU.
- Restricción de latencia: los datos se grabaron a 30 FPS, por lo que el sistema de inferencia debería sostener al menos 30 Hz (con el chunking, la frecuencia efectiva de inferencia puede ser menor que la del bucle de control del robot).
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`) sobre PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Throughput y latencia medidos: no disponible, no se han publicado cifras.
- Espacio en disco: el repositorio completo ocupa 7,4 GB, muy por encima de los ~207 MB de los pesos finales.

## Comparativa con modelos similares

La información disponible no incluye resultados cuantitativos de otras políticas sobre esta misma tarea, por lo que la comparación es cualitativa y las celdas sin dato verificable se marcan como no disponible.

| Modelo | Paradigma | Parámetros | Tipo de robot | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_tube (este modelo) | ACT, imitación con chunking de acciones | 51.668.614 | `so_follower`, 6 DoF, 1 cámara | Apache-2.0 | Hugging Face (LeRobot) |
| ACT de referencia (arXiv:2304.13705) | ACT, imitación con chunking de acciones | no disponible | ALOHA bimanual (en el artículo) | no disponible en la información proporcionada | artículo y repositorio de los autores |
| Diffusion Policy | política generativa por difusión con horizonte de reejecución | no disponible | variable según implementación | no disponible en la información proporcionada | implementación de referencia y LeRobot |
| SmolVLA y otras VLA en LeRobot | modelo visión-lenguaje-acción | no disponible | variable según implementación | no disponible en la información proporcionada | Hugging Face (LeRobot) |

Ninguno de los datos de terceros procede de la búsqueda web realizada, que no devolvió información técnica utilizable sobre políticas comparables.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea y un único montaje. Fuera de «coger el tubo y dejarlo de pie», no se puede esperar un comportamiento útil.
- Acoplamiento al hardware: las entradas y salidas están definidas para un robot `so_follower` con 6 dimensiones de estado y de acción y una cámara frontal a 480×640. Cambiar la morfología, la resolución, el número de cámaras o la posición de la cámara invalida la política.
- Sin evaluación publicada: no hay tasa de éxito ni número de ensayos, por lo que se desconoce la fiabilidad real en robot. Cualquier uso en producción exige una evaluación propia y exhaustiva.
- Riesgo de sobreajuste: 22 episodios y 20.000 pasos de entrenamiento sobre una sola tarea es un régimen propenso a memorizar posiciones y condiciones de iluminación concretas. Es esperable una degradación notable ante cambios de posición del objeto, iluminación, distracciones en el fondo o un robot del mismo tipo pero con calibración distinta.
- Generalización limitada de lenguaje: la tarea se especifica con la cadena fija `--task="Pick up the tube and stand it"`; el modelo no interpreta instrucciones arbitrarias en lenguaje natural.
- Sesgos: no se han documentado sesgos sociales o demográficos, algo que no aplica del mismo modo que en modelos de lenguaje, pero sí existen sesgos de entorno (fondo, iluminación y disposición de la mesa presentes en las 22 demostraciones).
- Licencia: Apache-2.0 permite uso comercial y modificación, con obligación de conservar los avisos de licencia y de atribución. Conviene revisar igualmente la licencia del método ACT y de LeRobot en su versión correspondiente.
- Madurez del artefacto: cero descargas y cero likes en el momento de la consulta, lo que indica que no ha pasado por un proceso de validación por parte de la comunidad.
- Coste de almacenamiento: el repositorio de 7,4 GB es desproporcionado frente a los ~207 MB de los pesos finales, un punto a tener en cuenta al clonar o replicar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Takuma1218/act_tube
- Dataset de entrenamiento: https://huggingface.co/datasets/Takuma1218/test_run_20260924_114725
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Takuma1218/test_run_20260924_114725
- Artículo de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de la CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Perfil del autor en X: https://x.com/TAKUmaru1218

Nota sobre la búsqueda web: los resultados devueltos (perfiles de X, repositorios de modelos de difusión, detectores de texto y chats de rol) no contienen información técnica relevante sobre esta política, por lo que no se han utilizado como fuente.
