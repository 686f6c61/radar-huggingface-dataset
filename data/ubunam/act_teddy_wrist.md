# UbuNam/act_teddy_wrist

## Resumen

El modelo `UbuNam/act_teddy_wrist` es una política robótica basada en **Action Chunking with Transformers (ACT)**, un método de aprendizaje por imitación presentado en el paper [arxiv:2304.13705](https://arxiv.org/abs/2304.13705). Ha sido entrenado y publicado mediante **LeRobot**, la librería de Hugging Face para robótica, y está diseñado para controlar un robot seguidor tipo `so_follower` con una cámara frontal. La tarea concreta que resuelve es recoger un osito de peluche marrón y depositarlo en una caja, a partir de 50 episodios teleoperados.

Con 51,7 millones de parámetros, este modelo demuestra que es posible entrenar políticas de manipulación con pocos datos y desplegarlas en hardware real. Su relevancia radica en que ejemplifica el flujo completo de LeRobot: registro de datos, entrenamiento de una política ACT y ejecución en el robot, todo bajo una licencia Apache 2.0 que permite uso comercial y modificación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) – transformer con codificador y decodificador |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa observaciones de estado e imagen) |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible (no aplica, es un modelo de control robótico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) emplea un transformer que, en lugar de predecir una única acción por paso de tiempo, genera un *chunk* de acciones futuras (por ejemplo, 10 o 50 pasos). Esto reduce el error acumulado típico de los métodos de aprendizaje por imitación que actúan paso a paso. El modelo procesa dos entradas: el estado del robot (`observation.state`, 6 dimensiones) y una imagen RGB de la cámara frontal (`observation.images.front`, resolución 480×640). La salida es un vector de acción de 6 dimensiones (posición y orientación del efector final, probablemente).

El entrenamiento se realizó sobre el dataset `UbuNam/so101_teddy_v2_wristonly`, que contiene 50 episodios y 14.306 fotogramas a 30 FPS, todos correspondientes a la tarea "Pick up the brown teddy bear and put it in the box". La configuración de entrenamiento incluye 100.000 pasos, batch size de 16, optimizador AdamW con learning rate de 1e-5 y semilla 1000, usando LeRobot versión 0.6.1. No se mencionan técnicas adicionales como RLHF o DPO, ya que se trata de aprendizaje supervisado por imitación.

## Capacidades

- **Control robótico de manipulación**: genera comandos de acción de 6 grados de libertad a partir de observaciones visuales y de estado.
- **Aprendizaje por imitación**: reproduce la tarea demostrada por teleoperación sin necesidad de programación explícita de trayectorias.
- **Procesamiento multimodal**: combina visión (imagen RGB) y propiocepción (estado del robot) para decidir la siguiente acción.
- **Predicción por chunks**: emite secuencias de acciones futuras, lo que mejora la estabilidad del movimiento frente a métodos de un solo paso.
- **Integración con LeRobot**: compatible con el ecosistema de LeRobot para entrenamiento, evaluación y despliegue en robots reales.
- **No posee capacidades de lenguaje**: no genera texto, no soporta tool calling ni razonamiento simbólico; es exclusivamente una política de control.

## Casos de uso

- **Automatización de pick-and-place en entornos controlados**: el modelo puede integrarse en una celda robótica para recoger objetos específicos (en este caso, un osito marrón) y colocarlos en una ubicación determinada, útil para líneas de clasificación o ensamblaje.
- **Investigación en aprendizaje por imitación**: sirve como punto de partida para estudiar el efecto del chunking de acciones, el número de episodios o la variación de la cámara en el rendimiento de políticas ACT.
- **Prototipado rápido con LeRobot**: permite a desarrolladores probar el flujo completo de LeRobot (registro, entrenamiento y rollout) en menos de un día, usando un dataset pequeño.
- **Benchmark de robótica en entornos académicos**: puede usarse como referencia para comparar métodos de imitación en tareas de manipulación con un robot seguidor estándar.
- **Validación de hardware**: al ser un modelo ligero (51M parámetros), es adecuado para verificar la calibración de cámaras y la configuración de un robot `so_follower` antes de entrenar políticas más complejas.
- **Educación en robótica**: permite a estudiantes ejecutar una política real en un robot de bajo coste, comprendiendo conceptos como observaciones, acciones y evaluación de éxito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real. Por tanto, no se dispone de tasas de éxito ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al tratarse de un modelo de ~51M parámetros, la inferencia requiere menos de 1 GB de VRAM en FP32. Con cuantización (no disponible en este repo) sería aún menor.
- **GPU recomendadas**: cualquier GPU con soporte CUDA, desde una NVIDIA GTX 1650 hasta una RTX 4090 o A100, es suficiente. También podría ejecutarse en CPU para pruebas lentas.
- **Compatibilidad con GPU de consumo**: sí, cabe en cualquier GPU de consumo moderna (por ejemplo, RTX 3060, RTX 4070).
- **Opciones de despliegue**: mediante LeRobot, usando el comando `lerobot-rollout` con el robot `so_follower`. No se proporcionan pesos en GGUF ni soporte para vLLM u Ollama, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: no disponible; depende del hardware y del robot. Dado el tamaño del modelo, la inferencia es del orden de milisegundos en GPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el mismo repositorio o en la documentación. Existen otras políticas ACT publicadas en Hugging Face dentro del ecosistema LeRobot, pero no se proporcionan datos concretos de rendimiento ni configuraciones para comparar. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Especialización limitada**: el modelo solo ha sido entrenado para una tarea concreta (recoger un osito marrón y ponerlo en una caja). No generaliza a otros objetos, posiciones o entornos sin reentrenamiento.
- **Dependencia de la configuración del robot**: los parámetros de entrada (estado de 6 dimensiones, imagen frontal) y la salida (acción de 6 dimensiones) están ligados al robot `so_follower` y a la cámara utilizada. Cambios en la calibración o en la posición de la cámara pueden degradar el rendimiento.
- **Sin evaluación publicada**: no hay resultados de éxito en robot real, por lo que no se conoce la robustez del modelo ante perturbaciones, cambios de iluminación o variaciones en la posición del objeto.
- **Riesgo de sobreajuste**: con solo 50 episodios y 100.000 pasos de entrenamiento, es posible que la política memorice las demostraciones y falle ante situaciones no vistas.
- **No es un modelo de lenguaje**: no debe utilizarse para tareas de generación de texto, razonamiento o conversación.
- **Licencia Apache 2.0**: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el comportamiento en producción. Es responsabilidad del usuario validar la seguridad del sistema robótico.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/UbuNam/act_teddy_wrist)
- [Dataset de entrenamiento](https://huggingface.co/datasets/UbuNam/so101_teddy_v2_wristonly)
- [Paper de ACT (Action Chunking with Transformers)](https://huggingface.co/papers/2304.13705)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot sobre ACT](https://huggingface.co/docs/lerobot/main/en/act)
- [Guía de instalación de LeRobot](https://huggingface.co/docs/lerobot/main/en/installation)
