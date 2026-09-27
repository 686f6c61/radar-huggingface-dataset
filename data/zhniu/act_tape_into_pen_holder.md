# zhniu/act_tape_into_pen_holder

## Resumen

El modelo `zhniu/act_tape_into_pen_holder` es una politica de robótica entrenada mediante aprendizaje por imitación con el método Action Chunking with Transformers (ACT), publicado originalmente en el artículo arXiv 2304.13705. Lo desarrolla el usuario de Hugging Face zhniu y se distribuye dentro del ecosistema LeRobot de Hugging Face. No es un modelo de lenguaje: su función es mapear observaciones sensoriales de un brazo robótico —el estado de las articulaciones y dos imágenes de cámara— a comandos de acción de 6 grados de libertad, permitiendo que un robot ejecute una tarea física manipulativa concreta.

El modelo resuelve un problema muy acotado: colocar una cinta (tape) dentro de un soporte de bolígrafo (pen holder). Para ello se entrenó con 40 episodios teleoperados que suman 12.000 fotogramas capturados a 30 FPS sobre un robot de tipo `so_follower` equipado con dos cámaras (`front` y `side`). La arquitectura ACT predice bloques cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce la acumulación de errores durante la ejecución y se traduce en tasas de éxito elevadas en tareas de manipulación cuando se dispone de datos de calidad.

Su relevancia es fundamentalmente práctica y limitada: sirve como referencia reproducible de una politica ACT completa —pesos, dataset y configuración de entrenamiento— dentro de LeRobot, una librería que estandariza el entrenamiento, el registro y el despliegue de politicas robóticas en tiempo real. Cuenta con 51.668.614 parámetros (unos 51,7 millones), licencia Apache 2.0 y un tamaño de repositorio de 0,2 GB, lo que lo hace ligero y ejecutable en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT): encoder-decoder transformer con CVAE, más backbones visuales ResNet para las cámaras |
| Parametros totales | 51.668.614 (~51,7 millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion (ACT predice chunks de acciones, pero el tamaño del chunk no se especifica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica / no disponible (modelo de robótica, sin entrada ni salida de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

Otros datos de la model card: tipo de robot `so_follower`; cámaras `front` y `side`; entrada `observation.state` de forma `(6,)`, `observation.images.front` de forma `(3, 480, 640)` y `observation.images.side` de forma `(3, 480, 640)`; salida `action` de forma `(6,)`.

## Arquitectura y entrenamiento

La arquitectura ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice chunks de acciones en lugar de acciones individuales. Internamente combina un esquema de autoencoder variacional condicional (CVAE) con un transformer: un encoder procesa las observaciones —estado de articulaciones y características visuales extraídas por backbones convolucionales tipo ResNet de las dos cámaras— y un decoder genera la secuencia de acciones del chunk. La componente latente del CVAE modela la variabilidad de las demostraciones humanas, lo que ayuda a capturar estilos de ejecución diversos sin colapsar a una media.

El entrenamiento es de aprendizaje por imitación supervisado (behavioral cloning) sobre teleoperación. No se reporta uso de RLHF, DPO ni aprendizaje por refuerzo. Segun la informacion proporcionada, la configuración de entrenamiento fue: 15.000 pasos, tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 1e-05, semilla 1000 y LeRobot versión 0.5.2. El dataset de entrenamiento es `zhniu/lerobot_zihao_dataset_a_20260927_202323`, con 40 episodios, 12.000 fotogramas a 30 FPS y la única tarea "Put the tape into the pen holder". No se documentan innovaciones técnicas adicionales más allá del propio método ACT.

## Capacidades

- Generación de acciones de control para un brazo robótico `so_follower` con salida de 6 dimensiones (`action (6,)`).
- Ejecución de una tarea manipulativa concreta de pick-and-place: introducir una cinta en un soporte de bolígrafo.
- Percepción multimodal limitada a dos cámaras RGB (`front`, `side`) a 480x640, más el estado de las articulaciones del robot.
- Predicción de chunks de acciones que reducen el error acumulado frente a politicas de paso único.
- Ejecución en tiempo real a la frecuencia de control del robot (los datos se capturaron a 30 FPS).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso basado en lenguaje ni comportamiento de agente.
- No tiene capacidades multilingües (no procesa texto).
- No tiene modo de razonamiento (thinking mode), ni visión general, ni audio, ni generación de texto, código o matemáticas.

## Casos de uso

- Automatización de una estación de montaje concreta: el modelo ejecuta de forma autónoma la tarea de colocar la cinta en el soporte del bolígrafo sobre un robot `so_follower`, usando las dos cámaras como única señal visual.
- Referencia reproducible para investigación en aprendizaje por imitación: al publicar pesos, dataset y configuración (15.000 pasos, lote 8, AdamW, lr 1e-05) permite reproducir resultados ACT en un caso concreto y comparar variantes.
- Base para fine-tuning: partiendo de estos pesos, se puede reentrenar con un dataset de una tarea relacionada usando `lerobot-train`, aprovechando el aprendizaje previo de rasgos visuales y de control.
- Demo educativa de LeRobot: sirve para ilustrar el flujo completo de grabación de datos teleoperados, entrenamiento de una politica ACT y despliegue con `lerobot-rollout` en tiempo real.
- Banco de pruebas de hardware robótico: al ser ligero (~51,7 M de parámetros y 0,2 GB de repositorio), permite validar cámaras, calibración y puertos de un brazo SO-100/SO-101 sin exigir una GPU de gama alta.
- Punto de partida para recolección de datos adicionales: si la politica falla en ciertas posiciones de los objetos, se pueden grabar más episodios sobre la misma tarea y reentrenar para mejorar la robustez.
- Validación de pipelines de evaluación en robótica real: puede ejecutarse repetidamente para medir tasa de éxito por tarea, aunque en la información disponible no se aportan resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que "no se han proporcionado resultados de evaluación para esta politica" (`No evaluation results have been provided for this policy yet`). No se dispone, por tanto, de tasas de éxito, número de ensayos ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida dado el tamaño del modelo (~51,7 M de parámetros). Los pesos en precisión de 32 bits ocupan aproximadamente 200 MB, y los backbones visuales añaden un consumo adicional moderado; en la práctica el modelo completo cabe holgadamente por debajo de 2 GB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA moderna con CUDA sirve; una RTX 3060, RTX 4060 o superior es suficiente. GPU de datacenter como A100 o H100 no son necesarias para inferencia, aunque pueden usarse para entrenamiento.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo con soporte CUDA, así como en dispositivos embebidos tipo NVIDIA Jetson (recomendable validar la latencia).
- Opciones de despliegue: el modelo se ejecuta a través de LeRobot con el comando `lerobot-rollout` (estrategia `base`), y su entrenamiento se gestiona con `lerobot-train`. Requiere el paquete `lerobot` (versión de referencia 0.5.2) y acceso al robot y las cámaras por sus puertos/índices.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. La frecuencia de control objetivo está ligada a los 30 FPS del dataset, pero no se documenta la latencia real de inferencia.

## Comparativa con modelos similares

No se dispone de resultados cuantitativos para comparar este modelo con alternativas concretas. A modo de referencia cualitativa dentro del ecosistema LeRobot:

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zhniu/act_tape_into_pen_holder | ACT (imitation learning) | ~51,7 M | no disponible (chunks de acciones) | apache-2.0 | Hugging Face (repo propio) |
| Politicas ACT equivalentes en LeRobot | ACT (imitation learning) | del orden de decenas de millones (depende de tarea) | no disponible | apache-2.0 (por defecto) | repositorios publicos de LeRobot |
| Diffusion Policy (LeRobot) | Diffusion policy (imitation learning) | variable segun configuracion | no disponible | apache-2.0 (por defecto) | repositorios publicos de LeRobot |

La comparacion se limita a caracteristicas estructurales; no hay datos de rendimiento publicados en la informacion disponible.

## Limitaciones y advertencias

- Especializacion extrema: la politica está entrenada para una única tarea ("Put the tape into the pen holder") y no generaliza a otras tareas sin reentrenamiento o fine-tuning.
- No hay resultados de evaluación: se desconoce su tasa de éxito real, su robustez ante cambios de iluminación, posiciones de objetos o distracciones.
- Sensibilidad al entorno: cualquier variación respecto a las condiciones del dataset original (posición de la cinta y del soporte, iluminación, fondo) puede degradar el comportamiento; en la model card se recuerda explícitamente que estos factores afectan la dificultad.
- Dependencia del hardware: está entrenada para un robot `so_follower` con cámaras concretas (`front`, `side`) y una forma de observación específica; usar otro robot del mismo tipo o cambiar la disposición de cámaras puede requerir recalibración o reentrenamiento.
- Riesgo de acumulación de error en ejecución prolongada, mitigado parcialmente por el uso de chunks de acciones, pero no documentado en este caso.
- Sesgos: no se documentan sesgos específicos, aunque al derivar de datos teleoperados hereda los sesgos de las demostraciones humanas (estilos de movimiento, condiciones de captura).
- Idioma y contexto: no aplica soporte de lenguaje ni ventana de contexto textual; no es un modelo de texto y no debe evaluarse como tal.
- Licencia: Apache 2.0, que permite uso comercial y modificación siempre que se respeten las condiciones de atribución de la licencia. Se recomienda citar tanto el método ACT (arXiv 2304.13705) como LeRobot si se reutiliza.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin demo ni resultados publicados, lo que limita la confianza en su calidad sin validación propia.

## Enlaces

- Hugging Face: https://huggingface.co/zhniu/act_tape_into_pen_holder
- Dataset de entrenamiento: https://huggingface.co/datasets/zhniu/lerobot_zihao_dataset_a_20260927_202323
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=zhniu/lerobot_zihao_dataset_a_20260927_202323
- Articulo del metodo ACT: https://huggingface.co/papers/2304.13705 (arXiv 2304.13705)
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot en GitHub: https://github.com/huggingface/lerobot
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
