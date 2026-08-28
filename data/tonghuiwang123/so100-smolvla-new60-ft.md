# tonghuiwang123/so100-smolvla-new60-ft

## Resumen

El modelo `tonghuiwang123/so100-smolvla-new60-ft` es una política de robótica basada en SmolVLA, un modelo de visión-lenguaje-acción (VLA) de 450 millones de parámetros desarrollado por Hugging Face. Este checkpoint concreto ha sido fine-tuneado por el autor para controlar un brazo robótico SO-ARM100 (también conocido como SO100) en la tarea de agarrar un cubo blanco y colocarlo en una taza blanca. El modelo se distribuye a través de la librería LeRobot y está pensado para ser desplegado en hardware de consumo, con un consumo de memoria de inferencia de aproximadamente 1,03 GB.

La relevancia de este modelo radica en que demuestra un flujo de entrenamiento en dos fases: parte de los pesos de un modelo previamente entrenado con 60 episodios de datos de una cámara antigua, y luego se fine-tunea con nuevos datos de una cámara nueva. Según la model card, esta estrategia de dos fases supera en validación en robot real al enfoque de partir desde el checkpoint base de SmolVLA. El modelo está diseñado para ser usado con el pipeline de LeRobot, con una configuración específica de dos cámaras (top-down y wrist) a 1280x720 píxeles y 30 fps.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (Vision-Language-Action, transformer multimodal) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (modelo de acción robótica, no de lenguaje general) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción compacto de 450 millones de parámetros, diseñado por Hugging Face para ejecutarse en hardware de consumo. Combina un codificador de visión, un modelo de lenguaje y un cabezal de acción para generar comandos motores directamente a partir de observaciones visuales y instrucciones en lenguaje natural. La arquitectura concreta de este checkpoint no está detallada en la información disponible, pero se basa en el diseño de SmolVLA, que emplea un transformer multimodal con atención cruzada entre las modalidades visual y textual.

El entrenamiento de este modelo específico se realizó en dos fases. La primera fase parte de los pesos de un modelo llamado `smolvla60`, entrenado con 60 episodios de datos capturados con una cámara antigua. La segunda fase consiste en un fine-tuning sobre un nuevo conjunto de datos de 40 episodios (8482 frames, 30 fps, dos cámaras a 1280x720) capturados con una cámara nueva. El checkpoint publicado corresponde al paso 085000, equivalente a aproximadamente 641,4 épocas con un batch efectivo de 64. El autor indica que la validación en robot real demostró que esta estrategia de dos fases supera al enfoque de partir directamente del checkpoint base de SmolVLA.

## Capacidades

- Control de brazo robótico SO-ARM100 / SO100 para tareas de agarre y colocación de objetos.
- Ejecución de la tarea específica "Grab the white cube to the white cup" (agarrar el cubo blanco y colocarlo en la taza blanca).
- Procesamiento de dos cámaras simultáneas (top-down y wrist) a 1280x720 píxeles y 30 fps.
- Inferencia con bajo consumo de memoria: aproximadamente 1,03 GB de VRAM.
- Integración con el ecosistema LeRobot para registro de datos, entrenamiento y despliegue.
- Soporte de checkpoints intermedios mediante ramas de revisión (`ckpt-XXXXXX`).

## Casos de uso

- Automatización de tareas de pick-and-place en laboratorios de robótica: el modelo puede controlar un brazo SO100 para recoger objetos de una zona de trabajo y depositarlos en un contenedor, como paso previo a tareas más complejas de ensamblaje o clasificación.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar estrategias de fine-tuning en dos fases con distintos conjuntos de datos de cámaras, comparando la transferencia entre dominios visuales.
- Desarrollo de prototipos de robótica doméstica: al requerir solo 1,03 GB de VRAM, puede ejecutarse en GPUs de consumo como una RTX 3060 o superior, permitiendo experimentar con manipulación robótica en entornos domésticos o educativos.
- Benchmarking de políticas VLA en hardware asequible: el modelo puede utilizarse para comparar el rendimiento de SmolVLA frente a otras políticas (ACT, Diffusion Policy) en la misma tarea y con el mismo robot.
- Educación en robótica y aprendizaje automático: los estudiantes pueden desplegar el modelo con LeRobot para entender el flujo completo de entrenamiento y evaluación de políticas de manipulación.
- Validación de robustez ante cambios de cámara: el entrenamiento en dos fases con cámaras distintas permite estudiar cómo afecta el cambio de sensor a la generalización de la política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas de éxito en la tarea, solo menciona que la validación en robot real mostró que la estrategia de dos fases supera al enfoque de partir del checkpoint base de SmolVLA, sin proporcionar cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,03 GB, según la model card.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo tarjetas de consumo como NVIDIA GTX 1650, RTX 3060, RTX 4060, o superiores. También puede ejecutarse en Jetson o similares.
- Cabe en GPU de consumo: sí, con margen amplio.
- Opciones de despliegue: el modelo se integra con LeRobot, que soporta inferencia en PyTorch. No se mencionan explícitamente vLLM, llama.cpp u Ollama, pero al ser un modelo de 450M parámetros, podría adaptarse a otros runners si se exportan los pesos, aunque no está documentado.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| so100-smolvla-new60-ft (este) | 450M | no disponible | Pick-and-place SO100 | no disponible | Hugging Face |
| SmolVLA base (Hugging Face) | 450M | no disponible | VLA general | no disponible | Hugging Face, sitio oficial |
| OpenVLA (referencia) | 7B | no disponible | VLA general | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a parámetros y disponibilidad.

## Limitaciones y advertencias

- El entrenamiento solo cubre la mitad izquierda del área de trabajo del robot, con un rango de `shoulder_pan` entre -48 y +6 grados. Colocar objetos fuera de esta zona reduce significativamente la tasa de éxito.
- El 28% de las muestras de entrenamiento se concentran en un único intervalo de `pan` (entre -25 y -20 grados), lo que puede provocar un sesgo hacia esa región y un rendimiento deficiente en posiciones menos representadas.
- La configuración de cámaras es estricta: se requieren exactamente dos cámaras con los nombres `camera1` (top-down) y `camera2` (wrist), y la resolución debe ser 1280x720. Si el orden de las cámaras se invierte, el modelo no da error pero su comportamiento se degrada de forma inexplicable.
- Se recomienda usar rutas estables tipo `/dev/v4l/by-id/...` en lugar de `/dev/videoN`, ya que los índices de video pueden cambiar al reconectar dispositivos USB.
- La licencia del modelo no está especificada, por lo que no se puede garantizar su uso comercial sin consultar al autor.
- No se han documentado sesgos de lenguaje ni riesgos de alucinación, al ser un modelo de acción robótica y no de generación de texto libre.
- El modelo está especializado en una única tarea y no es generalizable a otras tareas sin un nuevo fine-tuning.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tonghuiwang123/so100-smolvla-new60-ft
- Perfil del autor: https://huggingface.co/tonghuiwang123
- Sitio oficial de SmolVLA: https://smolvla.net/index_en
- Repositorio de ejemplo con LeRobot y SO100: https://github.com/ajinkyagorad/smol-vla-lerobot-so100
- Repositorio de LeRobot con SmolVLA: https://github.com/zyqdragon/lerobot_smolvla
