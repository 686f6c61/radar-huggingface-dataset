# WoojongKim/smolvla_policy_omx_gelsight_env1_multitask_horizontal_vertical_line_nogel

## Resumen

SmolVLA es un modelo de vision-language-action (VLA) compacto y eficiente desarrollado por Hugging Face, diseñado para control robótico con capacidades de razonamiento visual y lingüístico a bajo coste computacional. Esta ficha corresponde a una política entrenada con LeRobot sobre el modelo base `lerobot/smolvla_base`, especializada en la ejecución de tareas de trazado de líneas horizontales y verticales en un entorno con sensor táctil GelSight, sin datos de agarre (nogel). El modelo tiene 450 millones de parámetros, lo que lo hace viable para hardware de consumo, y se distribuye bajo licencia Apache 2.0.

La relevancia de este checkpoint radica en su aplicación directa en robótica de manipulación fina, donde la integración de percepción visual y táctil permite ejecutar trayectorias precisas. Al estar entrenado con el framework LeRobot, su despliegue y evaluación están estandarizados en el ecosistema de Hugging Face, facilitando la reproducción de experimentos y la integración en entornos de investigación y producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, basada en transformer, detalles no especificados) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones para generar comandos de control a partir de observaciones de imagen, instrucciones lingüísticas y, en este caso, datos del sensor táctil GelSight. El checkpoint fue entrenado mediante el framework LeRobot, que proporciona una tubería estándar de entrenamiento y evaluación para políticas robóticas. El dataset utilizado, `WoojongKim/omx_gelsight_env1_multitask_horizontal_vertical_line_nogel`, incluye demostraciones de tareas de trazado de líneas horizontales y verticales en un entorno físico con sensor GelSight, sin información de agarre.

No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La arquitectura específica interna (por ejemplo, número de capas, tipo de atención) no está documentada en la información disponible. Se recomienda consultar el paper asociado (arXiv:2506.01844) para una descripción completa de SmolVLA.

## Capacidades

- Generacion de acciones de control robótico a partir de observaciones visuales y táctiles.
- Ejecución de tareas de trazado de líneas horizontales y verticales en un entorno con sensor GelSight.
- Integración con el framework LeRobot para entrenamiento y evaluación estandarizada.
- Posibilidad de ser utilizado como política para robots con cinemática tipo SO100 (se menciona en la documentación de LeRobot).
- No se reportan capacidades de tool calling, agentes o razonamiento multi-paso fuera del dominio robótico.
- No se especifica soporte multilingüe; el modelo se centra en el control robótico, no en procesamiento de lenguaje general.

## Casos de uso

- **Manipulación robótica con retroalimentación táctil**: el modelo puede controlar un brazo robótico para realizar movimientos precisos de trazado de líneas, aprovechando la información del sensor GelSight para ajustar la trayectoria en tiempo real.
- **Pruebas de integración de VLA en robótica**: sirve como referencia para evaluar el rendimiento de modelos compactos en tareas de manipulación fina, comparando con políticas más grandes.
- **Investigación en aprendizaje por imitación**: al estar entrenado con demostraciones, es útil para estudiar la transferencia de habilidades de tareas simples a entornos más complejos.
- **Despliegue en entornos de bajo coste**: gracias a su tamaño (450M parámetros) puede ejecutarse en GPUs de consumo, facilitando su uso en laboratorios de robótica con recursos limitados.
- **Evaluación de generalización**: permite probar cómo una política entrenada en un entorno específico (GelSight) se comporta en variaciones de la tarea o en nuevos objetos.
- **Benchmark para comparación de políticas**: dentro del ecosistema LeRobot, este checkpoint puede usarse como baseline para comparar con otros modelos VLA o políticas de control clásicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se incluyen métricas como MMLU, HumanEval o GSM8K, ya que el modelo está orientado a robótica y no a tareas de lenguaje o razonamiento general.

## Requisitos de hardware

No se especifican requisitos de hardware en la documentación del modelo. Dado que el modelo tiene 450 millones de parámetros, se estima que una GPU con al menos 4-6 GB de VRAM podría ser suficiente para inferencia en FP16, pero esto no está confirmado por el autor. Se recomienda consultar la documentación de LeRobot para los requisitos típicos de los modelos de políticas robóticas. Opciones de despliegue: no se mencionan herramientas como vLLM, llama.cpp o TGI, pero al ser un modelo de robótica, la inferencia se realiza típicamente con PyTorch en el entorno de LeRobot.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (VLA compactos para robótica) dentro de los datos proporcionados. Se recomienda consultar el paper de SmolVLA (arXiv:2506.01844) para comparaciones con otros modelos VLA.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para tareas de trazado de líneas horizontales y verticales en un entorno con sensor GelSight; su uso fuera de ese dominio probablemente no sea efectivo.
- No se proporcionan datos sobre sesgos o alucinaciones, pero al ser un modelo de control robótico, no aplica los mismos riesgos que en generación de lenguaje.
- La licencia Apache 2.0 permite uso comercial y modificación, pero hay que verificar si el dataset de entrenamiento tiene restricciones adicionales.
- El modelo no incluye capacidades de visión general ni procesamiento de lenguaje natural; su función está limitada a la generación de acciones.
- No se han publicado métricas de rendimiento, por lo que se desconoce la precisión exacta en tareas de robótica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WoojongKim/smolvla_policy_omx_gelsight_env1_multitask_horizontal_vertical_line_nogel
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
