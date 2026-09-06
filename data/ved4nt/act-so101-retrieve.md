# Ved4nt/act-so101-retrieve

## Resumen

El modelo `Ved4nt/act-so101-retrieve` es una política de robótica basada en **Action Chunking with Transformers (ACT)**, un método de aprendizaje por imitación que predice tramos cortos de acciones en lugar de pasos individuales. Ha sido desarrollado por el usuario Ved4nt y entrenado con el framework **LeRobot** de Hugging Face para controlar un robot de tipo `so101` en una tarea concreta: sacar un cubo de una bandeja y colocarlo sobre una mesa. El modelo se presenta en formato `safetensors` y ocupa 3,1 GB en el repositorio.

Con 51.668.614 parámetros, la política consume observaciones del estado del robot (6 dimensiones) y dos imágenes de cámaras (muñeca y escena) con resolución 240x320, y produce acciones de 6 dimensiones. El modelo se entrenó sobre un dataset teleoperado de 51 episodios y 29.367 fotogramas a 30 FPS, registrado en el repositorio `Ved4nt/so101_retrieve`. Su relevancia radica en ser un ejemplo completo de entrenamiento y despliegue de una política ACT dentro del ecosistema LeRobot, útil para investigadores y desarrolladores que trabajan en manipulación robótica por imitación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de visión-acción; no aplica ventana de contexto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es **ACT** (Action Chunking with Transformers), un método de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales. El modelo está basado en transformers y está diseñado para aprender de datos teleoperados. En este caso, ha sido entrenado con el framework **LeRobot** (versión 0.6.2), que proporciona la infraestructura para registrar datos, entrenar políticas y desplegarlas en robots reales.

Según la configuración de entrenamiento publicada en la model card, se ejecutaron **50.000 pasos** con un **tamaño de lote de 96**, optimizador **AdamW**, tasa de aprendizaje de **1e-05** y semilla **1000**. El dataset de entrenamiento es `Ved4nt/so101_retrieve`, compuesto por **51 episodios** y **29.367 fotogramas** a 30 FPS, con la tarea "take the cube out of the tray and place it on the table". No se menciona el uso de RLHF ni DPO, ya que se trata de un modelo de aprendizaje por imitación supervisada, no de un modelo de lenguaje.

## Capacidades

- Predicción de acciones de robot en forma de tramos (chunks), permitiendo un control más suave y robusto frente a métodos paso a paso.
- Entrada multimodal: estado del robot de 6 dimensiones y dos imágenes de cámara (muñeca y escena) de 240x320 píxeles.
- Salida de acciones de 6 dimensiones para el robot `so101`.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de modelado explícito de la dinámica del robot.
- Compatibilidad con el framework LeRobot para entrenamiento, despliegue y registro de datos.
- No soporta generación de texto, tool calling, razonamiento simbólico ni capacidades lingüísticas, al tratarse de una política robótica especializada.

## Casos de uso

1. **Investigación en aprendizaje por imitación**: la política puede usarse como referencia o baseline para comparar nuevos métodos de imitación en entornos de manipulación robótica, gracias a su implementación estándar en LeRobot y a la disponibilidad del dataset de entrenamiento.

2. **Automatización de tareas pick-and-place en laboratorio**: el modelo ejecuta la tarea específica de retirar un cubo de una bandeja y colocarlo sobre una mesa. Es adecuado para validar flujos de trabajo de manipulación controlada en entornos de investigación.

3. **Integración en pipelines de robótica con LeRobot**: al usar el estándar de LeRobot, la política puede integrarse fácilmente en sistemas de control existentes mediante comandos como `lerobot-rollout`, lo que facilita su uso en experimentos y demostraciones.

4. **Evaluación de control de robots SO101**: sirve como caso de prueba para calibrar y evaluar el comportamiento del robot `so101` con diferentes configuraciones de cámaras y control, permitiendo analizar la robustez de la política.

5. **Fine-tuning para tareas similares**: dado que el modelo está entrenado en una tarea de manipulación concreta, puede servir como punto de partida para el ajuste fino en nuevas tareas del mismo robot, reduciendo la cantidad de datos necesarios mediante transferencia.

6. **Educación y demostraciones en robótica**: es un caso de uso práctico para enseñar el flujo completo de LeRobot: registrar datos, entrenar una política ACT y desplegarla en un robot real, todo con un conjunto de datos pequeño y accesible.

7. **Investigación en percepción y control multimodal**: la política combina estado del robot y visión de dos cámaras, por lo que puede utilizarse para estudiar cómo la información visual y propioceptiva influye en la ejecución de acciones robóticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: *"No evaluation results have been provided for this policy yet."* Por tanto, no existen datos de éxito, precisión ni comparativas de rendimiento para este modelo.

## Requisitos de hardware

- VRAM estimada: no disponible. No se han publicado cifras oficiales de consumo de memoria. Dado que el modelo tiene 51,7 millones de parámetros, se puede esperar una huella de memoria modesta, pero no hay confirmación del autor.
- GPU recomendada: no se ha especificado. Para ejecutar la política, se necesita un entorno compatible con CUDA y el framework LeRobot.
- Compatibilidad con GPU de consumo: se espera que sí, debido al tamaño del modelo, pero no hay datos oficiales que lo confirmen.
- Opciones de despliegue: la vía principal es el framework **LeRobot** mediante `lerobot-rollout`. También se puede realizar inferencia en PyTorch si se cargan los pesos directamente. No es aplicable a vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Dataset | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ved4nt/act-so101-retrieve | 51.668.614 | Ved4nt/so101_retrieve | "take the cube out of the tray and place it on the table" | Apache-2.0 | HuggingFace |
| aiden-li/so101-act | No disponible | No disponible | No disponible (mismo robot, SO101) | Apache-2.0 | HuggingFace |

Ambos modelos pertenecen a la misma categoría: políticas ACT entrenadas con LeRobot para el robot `so101`. No se dispone de información detallada sobre los parámetros ni los resultados de rendimiento del modelo de `aiden-li`, por lo que la comparación se limita a la arquitectura y al contexto de uso.

## Limitaciones y advertencias

- El modelo está entrenado para una tarea muy específica: sacar un cubo de una bandeja y colocarlo sobre una mesa. Su aplicabilidad a otros escenarios, objetos o disposiciones no está validada.
- No se han publicado resultados de evaluación, por lo que se desconoce la tasa de éxito real en el robot. Cualquier uso en producción exige una validación experimental previa.
- Depende de las condiciones del entorno de entrenamiento: iluminación, posición de la cámara, objeto concreto y configuración del robot `so101`. Cambios en estos factores pueden degradar seriamente el rendimiento.
- No es un modelo de lenguaje: no procesa texto, no admite instrucciones en lenguaje natural ni integrarse con sistemas de chat o agentes conversacionales.
- La licencia Apache-2.0 permite el uso comercial, pero la responsabilidad sobre el comportamiento del sistema en entornos reales recae en el usuario final.
- El modelo no presenta sesgos conocidos en el sentido habitual de los modelos de lenguaje, pero puede reflejar sesgos inductivos del dataset de teleoperación, especialmente en la distribución de los movimientos del robot.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Ved4nt/act-so101-retrieve
- Artículo de referencia (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Dataset de entrenamiento: https://huggingface.co/datasets/Ved4nt/so101_retrieve
- Framework LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Modelo comparable de aiden-li: https://huggingface.co/aiden-li/so101-act
