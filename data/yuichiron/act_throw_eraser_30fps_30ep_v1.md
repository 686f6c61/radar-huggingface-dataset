# Yuichiron/act_throw_eraser_30fps_30ep_v1

## Resumen

El modelo `Yuichiron/act_throw_eraser_30fps_30ep_v1` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), desarrollada por Yuichiron (Yuichiro Nagano) y entrenada con el framework LeRobot de Hugging Face. El modelo resuelve una tarea concreta de manipulación: recoger un borrador y lanzarlo hacia una zona objetivo, utilizando un robot tipo `so_follower` con una cámara frontal. Está diseñado para aprendizaje por imitación a partir de datos teleoperados, prediciendo secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación.

La arquitectura es un transformer con codificación de acciones en chunks, con un total de 51.668.614 parámetros. El modelo fue entrenado durante 30.000 pasos con un dataset de 30 episodios y 15.628 frames a 30 FPS. Aunque no se especifica una longitud de contexto en términos de tokens de texto, el modelo procesa observaciones de estado (6 dimensiones) e imágenes (480x640 píxeles) y produce acciones de 6 dimensiones. Su relevancia radica en ser un ejemplo práctico de aplicación de ACT en robótica real, con una licencia Apache 2.0 que permite uso comercial y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) - transformer con predicción de chunks de acción |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible (procesa observaciones de estado e imágenes, no texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo implementa ACT, un método de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que reduce la acumulación de errores y mejora la precisión en tareas de manipulación. La arquitectura se basa en un transformer que procesa observaciones multimodales: el estado del robot (vector de 6 dimensiones) y una imagen de cámara frontal (3 canales, 480x640 píxeles). La salida es un chunk de acciones de 6 dimensiones que el robot ejecuta de forma secuencial.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.1) sobre un dataset de 30 episodios teleoperados, con un total de 15.628 frames a 30 FPS. Se utilizó el optimizador AdamW con una tasa de aprendizaje de 1e-5, batch size de 8 y 30.000 pasos de entrenamiento, con semilla 1000. No se menciona el uso de RLHF, DPO ni otras técnicas de refinamiento; el entrenamiento es puramente supervisado sobre las demostraciones. La tarea específica es "recoger el borrador y lanzarlo hacia la zona objetivo".

## Capacidades

- Control robótico de manipulación: el modelo genera comandos de acción de 6 dimensiones (posición y orientación del efector final) para ejecutar la tarea de recoger y lanzar un objeto.
- Percepción visual: procesa imágenes de una cámara frontal (480x640) para localizar el objeto y la zona objetivo.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones teleoperadas, con predicción de chunks de acción para mayor estabilidad.
- Integración con LeRobot: compatible con el ecosistema de LeRobot para entrenamiento, evaluación y despliegue en robots reales.
- No soporta generación de texto, tool calling, agentes ni capacidades multilingües, al ser un modelo puramente robótico.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos controlados: el modelo puede integrarse en un robot `so_follower` para recoger objetos y colocarlos en posiciones específicas, útil en líneas de ensamblaje o laboratorios de investigación.
- Lanzamiento de objetos en robótica: la tarea entrenada (lanzar un borrador) puede adaptarse a aplicaciones de clasificación o descarte de piezas en entornos industriales, donde se requiere precisión en la trayectoria.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el rendimiento de ACT en tareas de manipulación con pocas demostraciones (30 episodios), permitiendo comparar con otros métodos.
- Fine-tuning para tareas similares: dado su tamaño reducido (51M parámetros), puede reentrenarse con datasets propios para nuevas tareas de manipulación, como apilar bloques o insertar piezas, usando la infraestructura de LeRobot.
- Demostraciones educativas en robótica: el modelo y su dataset asociado son útiles para enseñar conceptos de aprendizaje por imitación, control basado en visión y transformers en cursos de robótica.
- Prototipado rápido de políticas robóticas: al estar disponible en Hugging Face con pesos safetensors, los desarrolladores pueden descargarlo y ejecutarlo en sus robots con los comandos de LeRobot, acelerando el desarrollo de aplicaciones de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No se proporcionan métricas como tasa de éxito, MMLU, HumanEval u otras, ya que es un modelo de robótica y no de lenguaje o código.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la documentación del modelo.
- Dado el tamaño del modelo (51,7 millones de parámetros) y la entrada de imagen (480x640), es probable que pueda ejecutarse en GPUs de consumo con al menos 4 GB de VRAM, aunque no hay datos confirmados.
- El framework LeRobot soporta inferencia en GPU (CUDA) y también en CPU para pruebas, aunque con menor rendimiento.
- Para despliegue en robot real, se requiere el hardware específico del robot `so_follower` (puerto serie, cámaras compatibles con OpenCV).
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) y entrenamiento (`lerobot-train`). No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No disponible. No se han encontrado en la información proporcionada modelos comparables de la misma categoría (políticas robóticas basadas en ACT) con los que comparar parámetros, contexto o rendimiento. Se recomienda consultar el repositorio de LeRobot para otros modelos de políticas robóticas.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para una tarea específica (recoger y lanzar un borrador) y no es generalizable a otras tareas sin fine-tuning.
- Depende del hardware concreto: requiere el robot `so_follower` y una cámara frontal con las mismas características (resolución, posición) que las usadas en el entrenamiento.
- No se han reportado evaluaciones en robot real, por lo que el rendimiento en condiciones reales (iluminación variable, posiciones de objetos, distracciones) es desconocido.
- Al ser un modelo de imitación, puede heredar sesgos de las demostraciones (por ejemplo, trayectorias subóptimas o dependencia de la posición inicial del objeto).
- No hay datos sobre alucinación (no aplica, ya que no genera texto), pero sí riesgo de fallos en la ejecución si las observaciones difieren del dominio de entrenamiento.
- La licencia Apache 2.0 permite uso comercial y modificación, pero el usuario es responsable de cumplir con las condiciones de la licencia y de los componentes de terceros (por ejemplo, el dataset asociado).
- El modelo no soporta contextos largos ni interacción en lenguaje natural; su entrada y salida son estrictamente numéricas y visuales.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/Yuichiron/act_throw_eraser_30fps_30ep_v1
- Dataset de entrenamiento: https://huggingface.co/datasets/Yuichiron/so101_throw_eraser_30fps_30ep_20260827_20260827_172338
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Framework LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Referencia de comandos CLI de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
