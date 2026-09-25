# Tridex/model_tridex_act_3cam_resnet_100K_25_09

## Resumen

Tridex/model_tridex_act_3cam_resnet_100K_25_09 es una política robótica de imitación entrenada con Action Chunking with Transformers (ACT), el método descrito en el artículo arXiv:2304.13705. No es un modelo de lenguaje: es una red neuronal que mapea observaciones visuales y propioceptivas a comandos motores de 6 grados de libertad, entrenada específicamente para ejecutar la tarea "take the briquet and drop it" sobre un robot seguidor del tipo `so_follower`. La desarrolla el usuario Tridex y se distribuye a través del ecosistema LeRobot de Hugging Face, con licencia Apache 2.0.

El modelo tiene 51.668.614 parámetros y un repositorio de 0,2 GB, lo que lo sitúa en el rango de las políticas de imitación ligeras capaces de ejecutarse en tiempo real en hardware de consumo. Consume tres flujos de imagen RGB (cámaras `front`, `side` y `top` a 480x640) más un vector de estado de 6 dimensiones, y produce un vector de acción de 6 dimensiones. El nombre del checkpoint indica 100.000 pasos de entrenamiento y el uso de un backbone ResNet como codificador visual.

Su relevancia es doble. Por un lado, sirve como ejemplo reproducible de un pipeline completo de aprendizaje por imitación con LeRobot 0.6.2 sobre el dataset Tridex/50_briquet_11h_24-09_20260924_110457 (50 episodios, 34.367 fotogramas, 30 FPS). Por otro, actúa como punto de partida para ajuste fino en tareas de pick-and-place con robots de bajo coste, un escenario donde la combinación de tres cámaras y una política ACT es una configuración de referencia habitual.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): codificador visual ResNet + transformer con CVAE, según el artículo arXiv:2304.13705 |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no se documenta el tamaño del chunk de acciones ni la ventana de observación) |
| Tipos de cuantización | no disponible (pesos distribuidos en safetensors a precisión completa; no se documentan variantes GGUF, INT8 ni INT4) |
| Idiomas soportados | no aplica (política robótica sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

Datos adicionales de la ficha del autor:

| Parámetro | Valor |
|---|---|
| Tipo de robot | `so_follower` |
| Cámaras | `front`, `side`, `top` |
| Entrada `observation.state` | STATE, shape `(6,)` |
| Entrada `observation.images.front` | VISUAL, shape `(3, 480, 640)` |
| Entrada `observation.images.side` | VISUAL, shape `(3, 480, 640)` |
| Entrada `observation.images.top` | VISUAL, shape `(3, 480, 640)` |
| Salida `action` | ACTION, shape `(6,)` |
| Tarea | "take the briquet and drop it" |
| Librería | lerobot |
| Versión de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (*action chunks*) en lugar de pasos individuales, lo que reduce el error de composición acumulado típico de las políticas paso a paso. La arquitectura descrita en el artículo asociado combina un codificador visual convolucional (ResNet) que procesa cada cámara, un transformer que integra las representaciones visuales con el estado propioceptivo mediante atención, y un decodificador de acciones condicionado por una variable latente de tipo CVAE que captura la variabilidad de las demostraciones humanas. El sufijo `resnet` del nombre del checkpoint es coherente con el uso de ese backbone convolucional.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset Tridex/50_briquet_11h_24-09_20260924_110457, compuesto por 50 episodios teleoperados, 34.367 fotogramas grabados a 30 FPS y una única tarea. La configuración declarada es: 100.000 pasos de entrenamiento, tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000. No se documenta en la información disponible ni la composición exacta de los datos (condiciones de iluminación, variabilidad de posiciones del objeto, presencia de distractores) ni el uso de etapas posteriores de refinamiento como RLHF o DPO, que no resultan de aplicación en este tipo de política.

## Capacidades

- Generación de comandos motores: produce un vector de acción de 6 dimensiones a partir de las observaciones, adecuado para el robot `so_follower`.
- Percepción visual multivista: consume simultáneamente tres cámaras (`front`, `side`, `top`) a resolución 480x640, lo que aporta información espacial redundante sobre la escena.
- Fusión visión-propiocepción: integra el estado del robot de 6 dimensiones con las representaciones visuales en un único transformer.
- Aprendizaje por imitación de una tarea concreta: reproduce la tarea "take the briquet and drop it" a partir de demostraciones teleoperadas.
- Predicción por chunks de acciones: la formulación ACT predice secuencias cortas de acciones en lugar de pasos individuales.
- Integración con el ecosistema LeRobot: se ejecuta con `lerobot-rollout` y puede reentrenarse con `lerobot-train`.
- No soporta *tool calling* ni *function calling*: no es un modelo generativo de texto ni expone interfaz de herramientas.
- No soporta agentes ni razonamiento multi-paso simbólico: su "razonamiento" es puramente motor y reactivo a las observaciones.
- Sin capacidades multilingües, de visión general, de audio ni de modo *thinking*: es una política robótica especializada.

## Casos de uso

- Automatización de pick-and-place de mecheros: el modelo ejecuta de extremo a extremo la tarea "take the briquet and drop it" con un robot `so_follower` y tres cámaras, lo que permite montar una célula repetitiva de recogida y depósito sin programación explícita de trayectorias.
- Punto de partida para ajuste fino en tareas similares: al ser un checkpoint ACT de 51,7 M de parámetros entrenado durante 100.000 pasos, se puede reentrenar con `lerobot-train` sobre un dataset propio de recogida de objetos distintos y reutilizar el backbone visual ya ajustado al dominio.
- Referencia comparativa de escalado de datos: sirve para medir el efecto del número de pasos de entrenamiento frente a los checkpoints del mismo autor con 10K y 30K pasos, manteniendo constante la arquitectura y las cámaras.
- Validación de una estación robótica de bajo coste: útil para verificar el montaje, la calibración y la sincronización de tres cámaras OpenCV a 640x480 y 30 FPS conectadas al robot antes de invertir tiempo en recolección de datos propia.
- Reproducción de experimentos de aprendizaje por imitación: investigadores que estudien ACT pueden reproducir el flujo completo (recolección teleoperada, entrenamiento y evaluación en robot real) con un dataset público de 50 episodios y 34.367 fotogramas.
- Demostraciones y material docente: por su tamaño reducido (0,2 GB) y su licencia Apache 2.0, es adecuado para talleres prácticos de robótica donde se explique el ciclo de vida de una política de imitación.
- Banco de pruebas de despliegue en tiempo real: permite medir latencia de inferencia y frecuencia de control efectiva en un robot SO-100/SO-101 con un solo GPU consumer, validando si la política alcanza los 30 FPS de la frecuencia de captura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La ficha del modelo indica explícitamente que no se han proporcionado resultados de evaluación en robot real: _No evaluation results have been provided for this policy yet._ Por tanto, no existen tasas de éxito publicadas para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: los 51.668.614 parámetros ocupan aproximadamente 207 MB en FP32 y unos 103 MB en FP16, a lo que hay que sumar las activaciones del backbone ResNet procesando tres imágenes de 3x480x640. En la práctica, la inferencia cabe holgadamente en menos de 2 GB de VRAM en FP32.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 4 GB de VRAM es suficiente; una NVIDIA RTX 3060, RTX 4060, RTX 4090, A100 o H100 no presentan ninguna restricción. No se requiere hardware de datacenter.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo de los últimos años e incluso en iGPU con backend adecuado, dado el tamaño del modelo.
- Ejecución en CPU: viable para inferencia, ya que el modelo es pequeño; la limitación real es la frecuencia de control necesaria (30 FPS de captura), no la memoria.
- Opciones de despliegue: el camino soportado oficialmente es LeRobot, con `lerobot-rollout` para ejecutar la política y `lerobot-train` para reentrenarla. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una política robótica de este tipo. En la práctica, la inferencia se ejecuta mediante PyTorch con `--policy.device=cuda`.
- Latencia y throughput estimados: no disponibles en la información proporcionada. No se han publicado mediciones de latencia ni de frecuencia de control efectiva en robot real. Como referencia del entrenamiento, el autor declara 100.000 pasos con tamaño de lote 8.

## Comparativa con modelos similares

| Modelo | Parámetros | Pasos de entrenamiento | Cámaras | Tarea | Licencia | Estado |
|---|---|---|---|---|---|---|
| Tridex/model_tridex_act_3cam_resnet_100K_25_09 | 51.668.614 | 100.000 | 3 (`front`, `side`, `top`) | "take the briquet and drop it" | apache-2.0 | disponible |
| Tridex/model_act_3cam_10K_22_09 | no disponible | 10.000 (según nombre) | 3 | no disponible en la información recogida | no disponible | disponible |
| Tridex/modele_act_3cam_30k | no disponible | 30.000 (según nombre) | 3 | no disponible en la información recogida | no disponible | disponible |
| ACT original (artículo arXiv:2304.13705) | no disponible | no disponible | no disponible | manipulación bimanual de precisión | no disponible | método de referencia |

Otros métodos de aprendizaje por imitación comparables (Diffusion Policy, SmolVLA) no aparecen en la información disponible asociada a este modelo, por lo que no se incluyen datos numéricos de comparación.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea, "take the briquet and drop it", con un único tipo de robot (`so_follower`) y una configuración concreta de tres cámaras. Fuera de ese contexto no cabe esperar comportamiento correcto.
- Dependencia del montaje físico: los nombres e índices de cámara, el puerto del robot y la calibración deben coincidir exactamente con los usados en el entrenamiento; la propia ficha advierte de que los nombres de cámara deben coincidir con las claves de observación.
- Ausencia de evaluación publicada: no hay tasa de éxito medida en robot real ni número de ensayos, por lo que no se puede estimar su fiabilidad en producción.
- Riesgo de generalización limitada: con solo 50 episodios y 34.367 fotogramas procedentes de una tarea, es probable que el modelo sea sensible a cambios de iluminación, posición del objeto, distractores o pequeñas variaciones del entorno. La ficha del autor invita explícitamente a documentar estos factores, pero no aporta datos al respecto.
- Sesgos potenciales: al derivar de demostraciones teleoperadas de un único operador, la política hereda sus sesgos de trayectoria, velocidad y estrategia de agarre.
- Sin capacidades de lenguaje ni de razonamiento simbólico: no puede interpretar instrucciones en texto, ni gestionar diálogo, ni invocar herramientas. Cualquier expectativa en ese sentido es incorrecta.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificación, siempre que se conserven los avisos de copyright y licencia. El autor pide citar el método ACT y LeRobot en trabajos derivados.
- Advertencia sobre el identificador: el modelo se creó y actualizó en fechas registradas como septiembre de 2026, posteriores a las de sus posibles alternativas; conviene verificar la versión de LeRobot (0.6.2 declarada) antes de reutilizar los comandos de la ficha, ya que la CLI de LeRobot cambia entre versiones.
- Sin datos de cuantización: no se ofrecen pesos GGUF, INT8 ni INT4, por lo que el despliegue en entornos con restricciones severas de memoria exige conversión manual y validación posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tridex/model_tridex_act_3cam_resnet_100K_25_09
- Dataset de entrenamiento: https://huggingface.co/datasets/Tridex/50_briquet_11h_24-09_20260924_110457
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Tridex/50_briquet_11h_24-09_20260924_110457
- Artículo de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de recolección de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Checkpoint relacionado (10K pasos): https://huggingface.co/Tridex/model_act_3cam_10K_22_09
- Checkpoint relacionado (30K pasos): https://huggingface.co/Tridex/modele_act_3cam_30k
