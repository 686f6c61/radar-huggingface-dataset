# takeru01/act_task1_1_5_rgb_recover_up_down_trim_100000steps_bs16_chunk93

## Resumen

Este modelo es una política de control robótico basada en Action Chunking with Transformers (ACT), entrenada con el framework LeRobot por el usuario takeru01. ACT es un método de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que reduce el error acumulado típico de las políticas autoregresivas. El modelo está diseñado para una tarea de manipulación bimanual con un robot dual UR5e, utilizando cuatro cámaras RGB (frontal, superior y dos muñecas) y observaciones de estado del robot.

Con 51,7 millones de parámetros, es un modelo compacto entrenado sobre 134 episodios teleoperados (250.300 fotogramas a 30 FPS) durante 100.000 pasos con batch size 16. Su relevancia radica en que demuestra el flujo de trabajo completo de LeRobot para entrenar y desplegar políticas de imitación en robots reales, y sirve como punto de partida para tareas de manipulación dual-arm. No se han publicado resultados de evaluación en robot real, por lo que su rendimiento efectivo no está verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Action Chunking with Transformers, ACT) |
| Parametros totales | 51.677.838 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa observaciones de imagen y estado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de control robotico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que utiliza un transformer con codificador y decodificador. El codificador procesa las observaciones (imágenes de cuatro cámaras y estado del robot) y el decodificador genera un chunk de acciones futuras, típicamente de longitud fija. Esta predicción por chunks reduce la acumulación de errores en comparación con políticas que predicen una sola acción por paso. El modelo fue entrenado con el framework LeRobot (versión 0.6.0) sobre un dataset de demostraciones teleoperadas de una tarea de manipulación bimanual con robot dual UR5e. El dataset contiene 134 episodios, 250.300 fotogramas a 30 FPS, y las observaciones incluyen imágenes RGB de cuatro cámaras (frontal, superior, muñeca izquierda y muñeca derecha) junto con estado del robot (posición articular, velocidad, posición de pinzas). El entrenamiento usó optimizador AdamW con learning rate 1e-5, batch size 16 y 100.000 pasos. No se menciona el uso de RLHF ni DPO; es un entrenamiento puramente supervisado de imitación.

## Capacidades

- Control de manipulación bimanual: genera acciones de 14 dimensiones (posiblemente 12 articulaciones + 2 pinzas) para un robot dual UR5e.
- Percepción visual multimodal: procesa simultáneamente cuatro cámaras RGB (frontal, superior, muñeca izquierda, muñeca derecha) con resolución 240x424.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones teleoperadas, incluyendo movimientos de recuperación y ajuste fino (el nombre del modelo sugiere tareas de "recover up/down").
- Predicción por chunks: genera secuencias de acciones completas, lo que mejora la estabilidad del control en comparación con políticas de un solo paso.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, evaluación y despliegue de LeRobot, incluyendo scripts de rollout para robots reales.
- No soporta tool calling, agentes ni razonamiento simbólico; es exclusivamente un controlador de bajo nivel para robótica.

## Casos de uso

- Automatización de tareas de ensamblaje bimanual: el modelo puede controlar dos brazos robóticos para tareas que requieren coordinación, como insertar piezas o manipular objetos grandes, gracias a su salida de 14 dimensiones y percepción multi-cámara.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el efecto del chunking de acciones, la influencia del número de cámaras o la robustez frente a variaciones en la posición de objetos.
- Desarrollo de políticas de recuperación ante errores: el nombre del modelo ("recover_up_down") sugiere que fue entrenado para corregir desviaciones verticales, útil en tareas de pick-and-place con tolerancia fina.
- Benchmarking de frameworks de robótica: permite comparar el rendimiento de LeRobot con otros pipelines de imitación (por ejemplo, Diffusion Policy) en una tarea estándar de manipulación dual-arm.
- Formación y simulación: puede utilizarse en entornos simulados (por ejemplo, con MuJoCo o Isaac Sim) para validar algoritmos de control antes de desplegar en hardware real.
- Reentrenamiento y fine-tuning: al estar disponible en formato safetensors y con configuración documentada, se puede ajustar con nuevos datos de demostración para adaptarlo a variantes de la tarea (cambios de iluminación, posición de objetos, etc.).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real. No se dispone de métricas como tasa de éxito, precisión de movimiento ni comparaciones con otros métodos.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 51,7 millones de parámetros, la inferencia es ligera. Con precisión FP32, el peso ocupa aproximadamente 207 MB (51,7M × 4 bytes), por lo que cabe en cualquier GPU con al menos 1 GB de VRAM. En FP16, el requisito baja a unos 103 MB.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (por ejemplo, RTX 3060, RTX 4090, A100) es suficiente. También puede ejecutarse en CPU para pruebas lentas, aunque la inferencia en tiempo real requiere GPU.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama baja y media, siempre que se disponga de los controladores CUDA adecuados.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) que cargan el modelo y lo ejecutan en el robot. También se puede integrar con vLLM o TGI, aunque no es lo habitual para políticas de robótica; el flujo estándar es mediante PyTorch y el entorno de LeRobot.
- Latencia y throughput: no se han publicado mediciones. Dado el tamaño del modelo y la entrada de cuatro imágenes, se espera una latencia de decenas de milisegundos en una GPU moderna, pero no hay datos verificados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| takeru01/act_task1_1_5_rgb_recover_up_down_trim_100000steps_bs16_chunk93 (este) | 51,7M | no aplica | Manipulacion bimanual UR5e | Apache 2.0 | HuggingFace |
| takeru01/task1_1_5_rgb_act_chunk91_bs16_0821_2144 | no disponible | no aplica | Manipulacion bimanual UR5e | Apache 2.0 | HuggingFace |
| takeru01/task1_1_5_rgb_act_chunk93_bs16_0824_1508 | no disponible | no aplica | Manipulacion bimanual UR5e | Apache 2.0 | HuggingFace |

Los tres modelos son checkpoints de ACT del mismo autor y dataset, diferenciados por el tamaño del chunk (91 vs 93) y la fecha de entrenamiento. No se dispone de datos de rendimiento comparativo. Otros métodos de imitación como Diffusion Policy o RDT podrían ser alternativas, pero no hay información suficiente para una comparación cuantitativa.

## Limitaciones y advertencias

- No hay resultados de evaluación en robot real: la model card indica que no se han proporcionado métricas de éxito, por lo que el rendimiento efectivo es desconocido.
- Específico de una tarea y un robot: el modelo fue entrenado para una tarea concreta ("Dual-arm manipulation demonstration task1_1_5") con un robot dual UR5e y una configuración de cámaras fija. No es transferible directamente a otros robots o tareas sin reentrenamiento.
- Dependencia de la configuración de cámaras: las observaciones requieren exactamente cuatro cámaras con las mismas posiciones y resoluciones; cualquier cambio en la disposición física degradará el rendimiento.
- Riesgo de sobreajuste: con solo 134 episodios, el modelo puede no generalizar a variaciones de iluminación, posición de objetos o perturbaciones no vistas en el entrenamiento.
- Sin soporte de idiomas ni interacción simbólica: no es un modelo de lenguaje ni de razonamiento; solo genera acciones de control.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar que el hardware y el dataset asociado no tengan restricciones adicionales.
- Fecha de creación futura (2026-08-27): el modelo fue subido con una fecha posterior a la actual, lo que puede indicar un error en el registro o un artefacto del sistema; no afecta al contenido técnico.

## Enlaces

- Repositorio del modelo: https://huggingface.co/takeru01/act_task1_1_5_rgb_recover_up_down_trim_100000steps_bs16_chunk93
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Dataset de entrenamiento: https://huggingface.co/datasets/takeru01/task1_1_5_rgb_recover_up_down_trim
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
