# yugosakaguchi/real_connector_smolvla

## Resumen

El modelo `yugosakaguchi/real_connector_smolvla` es un fine-tuning de SmolVLA, un modelo de visión-lenguaje-acción (VLA) compacto desarrollado por Hugging Face, diseñado para control robótico de bajo coste y despliegue en hardware de consumo. Este ajuste específico se ha entrenado sobre el dataset `yugosakaguchi/real_connector` para ejecutar la tarea de inserción de un conector con un robot tipo `so_follower` equipado con tres cámaras. El modelo base, SmolVLA, cuenta con 450 millones de parámetros y está publicado bajo licencia Apache 2.0, lo que facilita su uso y modificación en entornos de investigación y producción.

Este modelo resuelve el problema de la manipulación robótica mediante aprendizaje por imitación, convirtiendo observaciones visuales y de estado del robot en acciones de 6 grados de libertad. Su relevancia radica en que permite desplegar políticas robóticas en hardware accesible, sin necesidad de infraestructura de alto coste, y se integra directamente con el ecosistema LeRobot. Al ser un fine-tuning de un modelo base ya eficiente, ofrece una vía rápida para adaptar capacidades generales de manipulación a tareas concretas del mundo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de accion, no de texto) |
| Tipos de cuantizacion | No disponible (solo safetensors) |
| Idiomas soportados | No aplica (modelo de control robotico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual con un transformador de lenguaje y una cabeza de acción. La arquitectura se basa en un modelo de lenguaje preentrenado (SmolLM) y un codificador de imágenes, procesando simultáneamente observaciones visuales (tres cámaras de 256x256) y el estado del robot (vector de 6 dimensiones) para generar acciones de control (también de 6 dimensiones). El modelo base fue entrenado con datos de robótica a gran escala, y este fine-tuning se realizó con aprendizaje por imitación sobre un dataset de 5 episodios (2400 frames a 30 FPS) que capturan la tarea "Insert the connector". El entrenamiento se llevó a cabo con el framework LeRobot, durante 20.000 pasos, batch de 32, optimizador AdamW con una tasa de aprendizaje de 1e-4 y semilla 1000. No se ha aplicado RLHF ni DPO; el proceso es de supervisión directa sobre las demostraciones.

## Capacidades

- Control de robots manipuladores: genera acciones de 6 grados de libertad (posición y orientación) a partir de observaciones visuales y del estado del robot.
- Percepción visual: procesa tres flujos de imagen simultáneos, lo que permite capturar diferentes perspectivas de la escena.
- Ejecución de tareas de ensamblaje y manipulación: específicamente, la inserción de un conector en su enchufe, aunque la arquitectura permite adaptarse a otras tareas con nuevos datos.
- Integración con LeRobot: se puede ejecutar directamente con `lerobot-rollout` y entrenar con `lerobot-train`, lo que facilita su uso en pipelines robóticos.
- Eficiencia computacional: al ser un modelo de solo 450M parámetros, es apto para hardware de consumo, a diferencia de VLA más grandes.

## Casos de uso

- Automatización de ensamblaje industrial: el modelo puede integrarse en un brazo robótico para insertar conectores, enchufes o componentes de precisión en líneas de producción. Se usaría con el robot `so_follower` y las cámaras configuradas, ejecutando `lerobot-rollout` con la tarea especificada.
- Investigación en aprendizaje por imitación: sirve como base para estudiar técnicas de transferencia de tareas, ya que su pequeño tamaño permite iterar rápidamente y con pocos recursos.
- Prototipado de células de trabajo robóticas: en entornos de laboratorio o pequeñas empresas, se puede desplegar en un robot de bajo coste para validar procesos de manipulación antes de escalar a sistemas más complejos.
- Educación en robótica: permite a estudiantes y desarrolladores experimentar con políticas de control de VLA en hardware real, sin necesidad de servidores GPU de gran potencia.
- Integración en sistemas de inspección y manipulación: el modelo puede adaptarse para tareas de recoger y colocar o de inserción de piezas en líneas de fabricación, siempre que se disponga de datos de demostración.
- Investigación en generalización de tareas: al ser un fine-tuning de un modelo base, se puede utilizar para analizar cómo se comporta un VLA compacto en tareas específicas y comparar con versiones más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card no incluye tasas de éxito ni comparaciones cuantitativas con otras políticas. Aunque el paper de SmolVLA (arxiv:2506.01844) reporta rendimiento competitivo frente a modelos 10 veces más grandes en entornos simulados y reales, estos resultados corresponden al modelo base y no a este fine-tuning específico.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 450M parámetros en safetensors (0.9 GB), se estima que puede ejecutarse en GPUs con al menos 2-4 GB de VRAM, dependiendo de la precisión de cálculo (FP32, FP16, etc.). En modo de cuantización (si se convierte a GGUF) podría reducirse aún más.
- GPU recomendadas: cualquier GPU de consumo con 4 GB o más, como NVIDIA GTX 1650, RTX 3060, RTX 4090, o incluso hardware integrado con soporte CUDA. No se requiere una A100 o H100.
- ¿Cabe en consumer GPU? Sí, es uno de los objetivos de SmolVLA: ejecutarse en hardware asequible.
- Opciones de despliegue: LeRobot ofrece `lerobot-rollout` para inferencia en el robot. También se puede exportar a otros runtimes como Embodied.cpp (para CPU/GPU/NPU) mediante conversión a GGUF, aunque no hay soporte oficial en el repositorio.
- Latencia y throughput: no se dispone de datos concretos, pero al ser un modelo compacto se espera una inferencia en tiempo real (30 FPS) en GPUs modernas, dado que el dataset se grabó a esa tasa.

## Comparativa con modelos similares

No hay una comparativa directa publicada para este fine-tuning. Como referencia, se puede comparar con otros VLA de la literatura:

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolVLA (base) | 450M | No aplica (acciones) | Competitivo a modelos 10x más grandes (paper) | Apache 2.0 | Hugging Face |
| OpenVLA | 7B | 32k tokens | Superior en benchmarks generales | MIT | Hugging Face |
| RT-2 (PaLI-X) | 55B | 32k | Muy alto, pero requiere recursos enormes | No abierta | No disponible |

Esta tabla es orientativa; no se dispone de una evaluación comparativa directa entre estos modelos y el fine-tuning `real_connector_smolvla`.

## Limitaciones y advertencias

- Entrenamiento con datos muy limitados: el dataset contiene solo 5 episodios (2400 frames), lo que puede llevar a un sobreajuste severo y a una baja generalización ante variaciones de posición, iluminación o fondo.
- Tarea específica: el modelo está entrenado exclusivamente para "Insert the connector". Cualquier otra tarea requeriría un nuevo fine-tuning con datos apropiados.
- Riesgo de alucinación y fallos de control: como modelo de acción, puede producir acciones no seguras si se encuentra fuera de la distribución de los datos de entrenamiento. Se recomienda supervisión humana en entornos reales.
- Dependencia del hardware: el rendimiento depende de la calibración de las cámaras y del robot `so_follower`. Si se usa otro tipo de robot, el modelo no funcionará correctamente.
- No hay evaluación de éxito: el model card no reporta ninguna métrica de éxito en la tarea, por lo que la fiabilidad del modelo no está verificada.
- Licencia Apache 2.0: permite uso comercial, pero el modelo se distribuye sin garantías. Se debe revisar la licencia del modelo base y de los datos utilizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yugosakaguchi/real_connector_smolvla
- Dataset de entrenamiento: https://huggingface.co/datasets/yugosakaguchi/real_connector
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Sitio web de SmolVLA: https://smolvla.net/index_en
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot para smolvla: https://huggingface.co/docs/lerobot/main/en/smolvla
