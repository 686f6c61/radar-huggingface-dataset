# YUKI100/act_so101_test_v2

## Resumen

El modelo `YUKI100/act_so101_test_v2` es una política de aprendizaje por imitación basada en el método Action Chunking with Transformers (ACT), entrenada con la librería LeRobot de Hugging Face. Está diseñada para controlar un robot manipulador de tipo SO-101 (so_follower) a partir de observaciones visuales y de estado, generando acciones de control de 6 dimensiones. El método ACT, descrito en el paper arxiv:2304.13705, predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación teleoperada.

El modelo cuenta con 51,6 millones de parámetros y fue entrenado sobre un dataset propio del autor (YUKI100/act_so101_v2_20260819_145559) con 52 episodios y 24.809 frames a 30 FPS. Es un modelo de robótica, no de lenguaje, por lo que no aplica contexto de texto ni soporte multilingüe. Su relevancia radica en ser un ejemplo de política ACT entrenada con LeRobot para el robot SO-101, un brazo robótico de bajo coste muy utilizado en la comunidad de robótica open source. La licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con CVAE |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (modelo de robótica) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un transformer con un autoencoder variacional condicional (CVAE). La política codifica las observaciones (imágenes de dos cámaras y estado del robot) y genera un chunk de acciones futuras, en lugar de predecir una sola acción por paso. Esto permite que el robot ejecute movimientos suaves y coherentes durante varios pasos de control, lo que reduce la frecuencia de errores acumulados. El modelo fue entrenado con LeRobot versión 0.6.1, con 100.000 pasos de entrenamiento, batch size de 8, optimizador AdamW y learning rate de 1e-05, con seed 1000. No se indica el uso de RLHF ni DPO, ya que es un modelo de imitación supervisada.

## Capacidades

- Control de robot manipulador SO-101 (so_follower) mediante imitación.
- Entradas: dos cámaras (front y side) con resolución 720x1280, y estado del robot (6 dimensiones).
- Salida: acción de 6 dimensiones (por ejemplo, posiciones de articulaciones o comandos de velocidad).
- Predicción de chunks de acciones (action chunking) para movimientos más suaves.
- No soporta tool calling, razonamiento de lenguaje, ni capacidades de visión fuera del contexto robótico.
- No es un modelo de lenguaje: no aplica generación de texto, código ni matemáticas.

## Casos de uso

- Tareas de manipulación robótica por imitación: el modelo puede reproducir tareas teleoperadas como recoger, apilar o insertar objetos con el brazo SO-101, gracias a su capacidad de predecir secuencias de acciones.
- Prototipado rápido en laboratorios de robótica: al estar integrado en LeRobot, se puede usar para evaluar el método ACT en un robot SO-101 sin necesidad de desarrollar código desde cero.
- Investigación en aprendizaje por imitación: sirve como punto de partida para comparar el rendimiento de ACT frente a otras políticas en tareas de manipulación.
- Automatización de procesos de pick-and-place: el modelo puede replicar trayectorias de recogida y colocación de piezas en entornos controlados, con una ventana de acciones de varias pasos.
- Integración en simuladores: aunque no hay evidencia directa, el modelo podría usarse en simuladores tipo MuJoCo para validar políticas antes de desplegarlas en hardware real.
- Educación en robótica: permite a estudiantes y desarrolladores entender el flujo completo de entrenamiento e inferencia de una política ACT con LeRobot y el robot SO-101.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet").

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, pero al tener solo 51,6 millones de parámetros, la inferencia es ligera y puede ejecutarse en GPUs de consumo (por ejemplo, RTX 3060 o superiores) o incluso en CPU con latencias aceptables para control robótico.
- GPU recomendada para entrenamiento: cualquier GPU NVIDIA con soporte CUDA (por ejemplo, RTX 4090, A100) es suficiente; el entrenamiento de 100.000 pasos con batch 8 y resolución 720x1280 es moderadamente exigente.
- Opciones de despliegue: LeRobot (CLI `lerobot-rollout`), que gestiona la carga del modelo y la conexión con el robot.
- Latencia y throughput estimados: no disponibles, pero al ser un modelo de 51M de parámetros y con action chunking, la latencia de inferencia es baja (del orden de milisegundos a decenas de milisegundos en GPU).

## Comparativa con modelos similares

No hay modelos comparables directos en la información disponible. La búsqueda web muestra otros repositorios de ACT para SO-101 (como `YUKI100/act_so101_test`) y un proyecto de MolmoAct2 (modelo visión-lenguaje-acción de 5B) para SO-101, pero no hay datos de rendimiento para comparar. Se puede afirmar que ACT es un método ampliamente usado en la comunidad LeRobot, pero no hay benchmarks públicos de este checkpoint concreto.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación en robot real, por lo que no se conoce la tasa de éxito en tareas concretas.
- El dataset de entrenamiento es pequeño (52 episodios), lo que puede limitar la generalización a nuevas posiciones de objetos o condiciones de iluminación.
- El modelo está entrenado específicamente para el robot SO-101 (so_follower) y con dos cámaras en posiciones concretas (front y side); su uso en otros robots o configuraciones de cámaras requeriría reentrenamiento.
- No se ha documentado la presencia de sesgos, pero es probable que el modelo reproduzca los sesgos de los datos de teleoperación (por ejemplo, hábitos del operador).
- Riesgo de alucinación: no aplicable en el sentido de modelos de lenguaje, pero puede generar acciones erróneas fuera de la distribución de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo es un artefacto de investigación y no debe usarse en aplicaciones críticas sin validación previa.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/YUKI100/act_so101_test_v2)
- [Dataset de entrenamiento](https://huggingface.co/datasets/YUKI100/act_so101_v2_20260819_145559)
- [Paper ACT](https://huggingface.co/papers/2304.13705)
- [LeRobot (GitHub)](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de ACT en LeRobot](https://huggingface.co/docs/lerobot/main/en/act)
- [Proyecto MolmoAct2 para SO-101 (GitHub)](https://github.com/ataghof/molmoact2-so101-sim)
