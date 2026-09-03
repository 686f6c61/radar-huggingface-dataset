# Tridex/modele_act_3cam_30k

## Resumen

El modelo `Tridex/modele_act_3cam_30k` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), desarrollada por el usuario Tridex y publicada en HuggingFace bajo la librería LeRobot. ACT es una técnica de aprendizaje por imitación que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales, lo que mejora la estabilidad y el éxito en tareas de manipulación robótica. Este modelo concreto está entrenado para controlar un robot seguidor (`so_follower`) en la tarea de coger un rotulador (stabilo), utilizando tres cámaras (frontal, lateral y superior) como entrada visual junto con el estado del robot.

El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo convierte en una política ligera y desplegable en hardware modesto. Fue entrenado durante 30.000 pasos con un dataset de 60 episodios teleoperados (37.124 frames a 30 FPS) y no se han publicado resultados de evaluación en el mundo real. Su relevancia radica en ser un ejemplo práctico de aplicación de ACT con LeRobot, una herramienta de código abierto para robótica, y en demostrar el flujo completo de entrenamiento y despliegue de políticas de imitación con múltiples cámaras.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (entrada visual de 3 cámaras a 480x640 y estado de 6 dimensiones) |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT (Action Chunking with Transformers), descrita en el paper arXiv:2304.13705. ACT utiliza un transformer que procesa observaciones multimodales (imágenes de cámaras y estado del robot) y predice un chunk de acciones futuras (en este caso, vectores de 6 dimensiones) en lugar de una única acción. Esto reduce la acumulación de errores y mejora la precisión en tareas de manipulación. La política fue entrenada con LeRobot (versión 0.6.1) sobre un dataset de 60 episodios teleoperados de la tarea "Prendre_le_stabilo_v4", con 37.124 frames a 30 FPS. El entrenamiento usó 30.000 pasos, batch size de 8, optimizador AdamW con learning rate de 1e-5 y semilla 1000. No se menciona el uso de RLHF, DPO u otras técnicas de refinamiento; es un entrenamiento puramente de imitación supervisada.

## Capacidades

- Control robótico por imitación: predice acciones de 6 dimensiones (probablemente posición y orientación del efector final) a partir de observaciones visuales y de estado.
- Percepción multimodal: procesa simultáneamente tres cámaras RGB (frontal, lateral y superior) a resolución 480x640, junto con un vector de estado de 6 dimensiones.
- Generación de secuencias de acciones: gracias al action chunking, produce tramos de acciones coherentes para ejecución suave.
- Integración con LeRobot: compatible con el ecosistema LeRobot para entrenamiento, evaluación y despliegue en robots reales.
- No incluye capacidades de lenguaje, tool calling, agentes ni razonamiento simbólico; es un modelo puramente motor.

## Casos de uso

- Automatización de tareas de pick-and-place en laboratorio: el modelo puede controlar un robot para coger objetos específicos (como un rotulador) en un entorno fijo con iluminación y posiciones controladas, útil para experimentos repetitivos.
- Prototipado de políticas de imitación: sirve como punto de partida para investigadores que quieran entrenar sus propias políticas ACT con LeRobot, reutilizando la configuración de cámaras y el pipeline de entrenamiento.
- Evaluación de action chunking en robótica: permite comparar el rendimiento de ACT frente a otros métodos de aprendizaje por imitación en tareas de manipulación con múltiples vistas.
- Despliegue en robots seguidores de bajo coste: al ser un modelo pequeño (51,7M de parámetros), puede ejecutarse en hardware embebido o GPUs de gama baja, facilitando su uso en entornos educativos o de investigación.
- Generación de datos sintéticos para entrenamiento: la política puede usarse para recopilar nuevas demostraciones o para validar la calidad de datasets teleoperados.
- Benchmarking de robustez visual: al depender de tres cámaras, es adecuado para estudiar el impacto de la variación de iluminación, oclusiones o cambios de perspectiva en el rendimiento de la política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación en el mundo real ("No evaluation results have been provided for this policy yet"). Por tanto, no se dispone de métricas como tasa de éxito, precisión o latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Dado el tamaño del modelo (51,7M de parámetros) y la entrada de tres imágenes de 480x640, se estima que una GPU con al menos 4 GB de VRAM podría ser suficiente, pero no hay datos confirmados.
- GPU recomendadas: no se especifican. Para entrenamiento, LeRobot suele requerir GPUs con al menos 8 GB de VRAM (p. ej., RTX 3060/3070/4060). Para inferencia, podría funcionar en GPUs más modestas o incluso en CPU, aunque con mayor latencia.
- Compatibilidad con GPU de consumo: sí, por tamaño, pero la carga de procesamiento de imágenes puede ser el factor limitante.
- Opciones de despliegue: LeRobot ofrece scripts de rollout (`lerobot-rollout`) que cargan el modelo y ejecutan la política en el robot. También es posible exportar a otros formatos, aunque no se mencionan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas ACT para robótica con múltiples cámaras) dentro de la información proporcionada. No se pueden establecer comparaciones fiables sin datos adicionales.

## Limitaciones y advertencias

- Entrenado para una tarea muy específica (coger un rotulador) con un robot concreto (`so_follower`) y una disposición fija de tres cámaras. No es generalizable a otras tareas o configuraciones sin reentrenamiento.
- Dataset limitado: solo 60 episodios, lo que puede provocar sobreajuste y baja robustez ante variaciones en la posición de los objetos, iluminación o distracciones.
- Sin evaluación en el mundo real: no hay métricas de éxito reportadas, por lo que el rendimiento real es desconocido.
- Dependencia de la calibración de cámaras: cualquier cambio en la posición u orientación de las cámaras puede degradar el rendimiento.
- No soporta entradas de lenguaje ni comandos de alto nivel; es una política de bajo nivel.
- Licencia Apache 2.0 permite uso comercial, pero el modelo es específico y no incluye garantías de funcionamiento en entornos de producción.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Tridex/modele_act_3cam_30k
- Paper de ACT: https://huggingface.co/papers/2304.13705
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/Tridex/record-test-3-cam_20260903_142712
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
