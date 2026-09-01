# wego-hansu/arm_test1

## Resumen

El modelo `wego-hansu/arm_test1` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), entrenada con la librería LeRobot de Hugging Face. ACT es una técnica de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que permite a un robot ejecutar tareas de manipulación con mayor fluidez y precisión. Este modelo concreto ha sido entrenado sobre el dataset `wego-hansu/two_arm_bolt_2`, que contiene demostraciones teleoperadas de una tarea de ensamblaje con dos brazos robóticos.

El modelo tiene 51.685.006 parámetros y se distribuye en formato safetensors, con un tamaño de repositorio de 0,2 GB. Está diseñado para ser utilizado con el ecosistema LeRobot, que facilita el entrenamiento, la evaluación y el despliegue de políticas de control en robots reales o simulados. Su relevancia radica en que demuestra cómo un modelo relativamente compacto puede aprender tareas de manipulación bimanual a partir de datos de demostración, un área de creciente interés en robótica de bajo coste y open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.685.006 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (modelo de control motor, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un codificador de visión (para procesar observaciones de cámaras) con un transformador que genera secuencias de acciones. La arquitectura se describe en el paper [Action Chunking with Transformers](https://huggingface.co/papers/2304.13705). En lugar de predecir una sola acción por paso de tiempo, el modelo predice un "chunk" de acciones futuras, lo que reduce la acumulación de errores y mejora la suavidad del movimiento.

El entrenamiento se realizó con la librería LeRobot, utilizando el dataset `wego-hansu/two_arm_bolt_2`, que contiene demostraciones teleoperadas de una tarea de ensamblaje con dos brazos. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO. El modelo se publica como un checkpoint entrenado, listo para ser evaluado o desplegado con LeRobot.

## Capacidades

- Control robótico por imitación: el modelo aprende a replicar movimientos de dos brazos a partir de demostraciones teleoperadas.
- Predicción de secuencias de acciones (action chunking): genera múltiples pasos de control por inferencia, lo que mejora la estabilidad del movimiento.
- Integración con LeRobot: compatible con el flujo de trabajo de entrenamiento, evaluación y registro de episodios de LeRobot.
- Tarea específica: entrenado para la tarea de ensamblaje de dos brazos (two_arm_bolt_2), aunque la arquitectura ACT es generalizable a otras tareas de manipulación.
- No incluye capacidades de lenguaje, visión general ni tool calling; es un modelo puramente motor.

## Casos de uso

- Ensamblaje automatizado en entornos de investigación: el modelo puede controlar dos brazos robóticos para insertar o atornillar piezas, replicando la tarea aprendida de las demostraciones.
- Prototipado rápido de políticas robóticas: gracias a su tamaño compacto y a la integración con LeRobot, permite iterar sobre nuevas tareas con pocos datos de demostración.
- Evaluación de algoritmos de aprendizaje por imitación: sirve como punto de partida para comparar variantes de ACT o métodos alternativos en tareas bimanuales.
- Despliegue en robots de bajo coste: al ser un modelo pequeño (51,7 M de parámetros), puede ejecutarse en hardware modesto, como una GPU de consumo o incluso CPU en tiempo real.
- Investigación en generalización de tareas: al estar entrenado en una tarea concreta, puede usarse para estudiar la transferencia a variaciones de la misma tarea (cambios de posición, iluminación, etc.).
- Educación en robótica: permite a estudiantes y desarrolladores experimentar con control robótico basado en aprendizaje sin necesidad de grandes infraestructuras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no incluye métricas de éxito en la tarea, ni comparaciones con otros métodos en el repositorio. Para obtener datos de rendimiento, sería necesario ejecutar la evaluación con LeRobot sobre el robot real o en simulación, tal como se describe en la documentación.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente, pero con 51,7 M de parámetros en FP32, el peso ocupa aproximadamente 207 MB. En FP16 serían unos 103 MB. La VRAM necesaria dependerá del tamaño de lote y de la resolución de las imágenes de entrada, pero es probable que quepa en GPUs con 4 GB o menos.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (por ejemplo, RTX 2060, RTX 3060, A100, etc.). No se requiere una GPU de gama alta.
- Compatibilidad con GPU de consumo: sí, es muy probable que funcione en GPUs de consumo como la serie RTX 30 o 40, e incluso en CPU para inferencia a baja frecuencia.
- Opciones de despliegue: LeRobot proporciona scripts de entrenamiento e inferencia. También se puede exportar a otros formatos si se desea, aunque no se documenta explícitamente.
- Latencia y throughput: no disponibles. Dependerán del hardware y de la configuración de la cámara.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa con otros modelos. Sin embargo, se puede contextualizar:

| Modelo | Parametros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| wego-hansu/arm_test1 (ACT) | 51,7 M | Manipulación bimanual (ensamblaje) | Apache-2.0 | Hugging Face |
| ACT original (paper 2304.13705) | no publicado | Manipulación general | no aplica (paper) | Codigo en repositorios academicos |
| Otros modelos de LeRobot (p.ej. Diffusion Policy) | variable | Manipulación | Apache-2.0 | Hugging Face |

La comparación directa no es posible sin datos de benchmarks. Se recomienda consultar el paper de ACT para entender las ventajas del método frente a otras políticas de imitación.

## Limitaciones y advertencias

- Sesgos y generalización: el modelo está entrenado específicamente para la tarea `two_arm_bolt_2`; no se espera que generalice a otras tareas sin reentrenamiento.
- Riesgo de alucinación: en el contexto robótico, esto se traduce en movimientos erráticos o no deseados si las observaciones difieren de las de entrenamiento. Es necesario validar en entornos controlados antes de usar en producción.
- Limitaciones de contexto: al ser un modelo de control motor, no procesa lenguaje ni tiene capacidad de razonamiento simbólico.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe mantener el aviso de licencia y atribución.
- Dependencia del dataset: la calidad del comportamiento depende directamente de la calidad y diversidad de las demostraciones teleoperadas. Si el dataset es pequeño o sesgado, el modelo fallará en situaciones no vistas.
- Requisitos de calibración: el despliegue en un robot real requiere que la configuración del robot (cámaras, articulaciones, controlador) coincida con la utilizada durante la recogida de datos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/wego-hansu/arm_test1)
- [Paper de ACT (Action Chunking with Transformers)](https://huggingface.co/papers/2304.13705)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Repositorio de LeRobot en GitHub](https://github.com/huggingface/lerobot)
