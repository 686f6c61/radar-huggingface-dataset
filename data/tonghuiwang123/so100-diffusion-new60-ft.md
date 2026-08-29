# tonghuiwang123/so100-diffusion-new60-ft

## Resumen

`so100-diffusion-new60-ft` es una política de control robótico basada en diffusion policy, desarrollada por tonghuiwang123 para el brazo articulado de bajo coste SO-ARM100 (también conocido como SO100). El modelo está entrenado específicamente para la tarea "Grab the white cube to the white cup" (agarrar el cubo blanco y colocarlo en la taza blanca), utilizando 60 episodios de demostración con dos cámaras a 1280x720 píxeles y 30 fps. Se publica en el ecosistema LeRobot, una librería de aprendizaje por imitación para robótica.

El checkpoint principal corresponde al paso 30000 (aproximadamente 142,7 épocas con un batch efectivo de 64). El entrenamiento se realizó en dos etapas: partiendo de los pesos de una diffusion policy entrenada previamente con 60 episodios capturados con una cámara antigua, y ajustando después con los nuevos datos. El modelo tiene 277.839.286 parámetros y requiere alrededor de 1,1 GB de VRAM para inferencia, lo que lo hace ejecutable en GPUs de consumo.

Su relevancia radica en ser un ejemplo práctico de aplicación de diffusion policy en robótica de bajo coste, demostrando que es posible entrenar políticas de manipulación con hardware asequible y datos limitados. Está diseñado para ser desplegado directamente con las herramientas de LeRobot, lo que facilita su integración en entornos de investigación y prototipado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (tipo exacto no especificado, probablemente red convolucional + proceso de difusión) |
| Parametros totales | 277.839.286 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de política que procesa imágenes y estados, no texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de robótica, no de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (también incluye config.json) |

## Arquitectura y entrenamiento

La arquitectura es una diffusion policy, un enfoque generativo que modela la distribución de acciones condicionada a observaciones (imágenes de cámaras y estados del robot). En lugar de predecir directamente la acción, el modelo refina iterativamente una acción ruidosa hasta obtener una acción limpia, lo que permite capturar multimodalidad en las demostraciones. No se especifica la red concreta (p. ej., si usa CNN, Transformer o U-Net), pero es estándar en el framework LeRobot.

El entrenamiento se realizó en dos fases: primero se inicializó con los pesos de un modelo diffusion entrenado sobre 60 episodios antiguos (con una configuración de cámara distinta), y después se realizó un fine-tuning con el nuevo conjunto de datos, que consta de 60 episodios y 13.454 frames, capturados con dos cámaras (top y wrist) a 1280x720 y 30 fps. Se aplicó un resize a [180,320] y un crop ratio de 0.95. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Control de brazo robótico: genera comandos de articulación para el SO-ARM100 a partir de observaciones visuales y del estado del robot.
- Percepción multimodal: procesa simultáneamente imágenes de dos cámaras (una superior y otra en la muñeca) a 1280x720.
- Ejecución de tareas de manipulación: específicamente la tarea de agarrar un cubo blanco y colocarlo en una taza blanca.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones humanas.
- Despliegue integrado: se puede ejecutar con los comandos estándar de LeRobot (`lerobot-record`).
- No soporta lenguaje, tool calling, agentes ni razonamiento multi-step, ya que es un modelo puramente motor.

## Casos de uso

- Automatización de pick-and-place en entornos de laboratorio: el modelo puede realizar la tarea de agarrar y colocar objetos pequeños de forma repetitiva, útil en experimentos de robótica.
- Prototipado de políticas con LeRobot: sirve como punto de partida para desarrollar nuevas tareas sobre el SO-ARM100, aprovechando su entrenamiento previo.
- Investigación en aprendizaje por imitación: permite estudiar el comportamiento de diffusion policies en hardware de bajo coste y con pocos datos.
- Demostraciones educativas: adecuado para cursos de robótica que utilicen SO-ARM100 y LeRobot, mostrando un pipeline completo de recogida de datos, entrenamiento y despliegue.
- Evaluación de robustez visual: al requerir dos cámaras y una resolución específica, puede usarse para probar la sensibilidad de la política a cambios en la iluminación o posición de la cámara.
- Benchmark de control de bajo coste: puede compararse con otras políticas (como las del mismo autor) para medir el rendimiento relativo en tareas de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay métricas como MMLU, HumanEval o GSM8K, ya que no es un modelo de lenguaje. Tampoco se proporcionan tasas de éxito en la tarea robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB según la model card.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, por ejemplo NVIDIA GTX 1650, RTX 3060, RTX 4090, A100, etc. Dado el bajo requerimiento, también podría ejecutarse en CPU con lentitud, aunque no se especifica.
- Compatibilidad con GPUs de consumo: sí, cabe en la mayoría de GPUs de consumo actuales.
- Opciones de despliegue: LeRobot (comando `lerobot-record`), posiblemente también vLLM o TGI, pero no se mencionan explícitamente. Dado que es un modelo de robótica, lo habitual es ejecutarlo con el framework LeRobot.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni especificaciones completas de modelos comparables. Sin embargo, el mismo autor ha publicado otras políticas para la misma tarea:

| Modelo | Tipo | Parametros | Tamaño repo | Notas |
|---|---|---|---|---|
| so100-diffusion-new60-ft | Diffusion policy | 277.839.286 | 13.3 GB | Checkpoint step 30000, 60 episodios nuevos |
| so100-pi05-new60-ft | Pi0 (basado en VLM) | No disponible | 9.39 GB | Checkpoint ckpt 76000 |
| so100-pi0 | Pi0 (basado en VLM) | No disponible | No disponible | Entrenado en tonghuiwang123/test10 |

Estas alternativas representan enfoques distintos (diffusion vs. modelos de visión-lenguaje) y pueden servir como referencia, pero no hay datos cuantitativos para una comparación rigurosa.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo funciona para la tarea concreta "Grab the white cube to the white cup" y con el hardware SO-ARM100; no generaliza a otras tareas u objetos.
- Dependencia de la configuración de cámaras: requiere exactamente dos cámaras con los nombres `front` y `side`, y una resolución fija de 1280x720. Cambiar la disposición o la resolución degradará el rendimiento.
- Datos limitados: solo 60 episodios, lo que puede provocar sobreajuste y baja robustez ante variaciones del entorno.
- Riesgo de fallos de ejecución: como cualquier política de imitación, puede ejecutar movimientos erráticos o no completar la tarea si las condiciones difieren de las demostraciones.
- Licencia no especificada: no se indica si permite uso comercial; se recomienda contactar al autor antes de usarlo en producción.
- Sin soporte de lenguaje ni interacción humana: no puede recibir instrucciones en texto ni adaptarse dinámicamente a nuevas órdenes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tonghuiwang123/so100-diffusion-new60-ft
- Repositorio SO-ARM100: https://github.com/TheRobotStudio/SO-ARM100
- Wiki de Seeed Studio sobre SO10xArm en LeRobot: https://wiki.seeedstudio.com/lerobot_so100m/
- Modelo relacionado so100-pi05-new60-ft: https://huggingface.co/tonghuiwang123/so100-pi05-new60-ft
- Modelo relacionado so100-pi0: https://huggingface.co/tonghuiwang123/so100-pi0
