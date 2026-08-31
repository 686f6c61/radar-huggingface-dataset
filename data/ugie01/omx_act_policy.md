# Ugie01/omx_act_policy

## Resumen

`Ugie01/omx_act_policy` es un modelo de política de robótica basado en Action Chunking with Transformers (ACT), desarrollado por el usuario Ugie01 y entrenado con la librería LeRobot de Hugging Face. El modelo aprende a imitar comportamientos teleoperados para la tarea de pick and place, a partir del dataset `Ugie01/pick_and_place_j`. ACT predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y el éxito en tareas de manipulación robótica.

Con aproximadamente 51,7 millones de parámetros, es un modelo compacto pensado para ejecutarse en hardware de consumo. Su licencia Apache 2.0 permite uso comercial sin restricciones. Relevante para la comunidad de robótica e imitación learning, ya que demuestra cómo entrenar y publicar políticas robóticas de forma reproducible mediante LeRobot.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de política, no procesa texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32) |
| Idiomas soportados | no aplica (modelo de robótica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa ACT, una arquitectura transformer que codifica observaciones (imágenes y estados del robot) y decodifica una secuencia de acciones futuras. A diferencia de políticas que predicen un solo paso, ACT genera un chunk de acciones (por ejemplo, 50 pasos) que luego se ejecuta de forma abierta, reduciendo la acumulación de errores. El entrenamiento se realiza mediante imitación learning sobre datos teleoperados, utilizando el framework LeRobot. No se dispone de detalles sobre el número de tokens, composición del dataset o técnicas de refinamiento adicionales (RLHF, DPO) en la información proporcionada.

## Capacidades

- Generación de secuencias de acciones para control de robots manipuladores (tarea pick and place).
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Integración nativa con LeRobot para entrenamiento, evaluación e inferencia.
- Soporte para múltiples configuraciones de robot (por ejemplo, SO-100) mediante la interfaz de LeRobot.
- No incluye capacidades de lenguaje natural, tool calling ni razonamiento simbólico.

## Casos de uso

- Automatización de pick and place en entornos industriales: el modelo puede controlar un brazo robótico para recoger y colocar objetos en posiciones definidas, aprendiendo de demostraciones humanas.
- Prototipado rápido de tareas robóticas en investigación: gracias a LeRobot, se puede entrenar y evaluar la política en simulación o hardware real con pocas líneas de código.
- Educación en robótica e imitación learning: sirve como ejemplo didáctico de cómo entrenar una política ACT con un dataset propio.
- Integración en sistemas de teleoperación asistida: puede complementar el control manual generando acciones autónomas en tramos repetitivos.
- Benchmarking de algoritmos de imitación: al ser un checkpoint público, permite comparar ACT con otras políticas (Diffusion, VQ-BeT) en la misma tarea.
- Despliegue en robots de bajo coste: con 51M parámetros, es viable ejecutarlo en una GPU de gama media o incluso CPU para tareas en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como tasa de éxito, precisión de agarre o comparaciones con otros modelos en la tarea pick and place.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~51M parámetros, la inferencia cabe en GPUs con 4 GB o menos (por ejemplo, RTX 3050, GTX 1660). En fp32, los pesos ocupan aproximadamente 200 MB, pero el overhead de la red y las imágenes de entrada requieren memoria adicional.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM (serie 20, 30, 40) o equivalentes de AMD. También puede ejecutarse en CPU, aunque con mayor latencia.
- Opciones de despliegue: LeRobot proporciona scripts de evaluación e inferencia (`lerobot-record`). No es compatible con vLLM, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se han publicado datos. Para una tarea de control en tiempo real, se recomienda evaluar en el hardware objetivo.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de política robótica en la misma tarea. Existen otros checkpoints ACT en Hugging Face (por ejemplo, `eh-cosmos-ai/omx_act_policy`, `ksy173/omx_act_policy`) pero no se conocen sus parámetros ni rendimiento. Se recomienda consultar el paper original de ACT (arXiv:2304.13705) para comparaciones con métodos anteriores.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para la tarea pick and place con el dataset `Ugie01/pick_and_place_j`; su generalización a otras tareas u objetos no está garantizada.
- Depende de la calidad y variedad de las demostraciones teleoperadas; puede heredar sesgos del operador humano (por ejemplo, preferencias de agarre o trayectorias subóptimas).
- Riesgo de alucinación de acciones: en situaciones no vistas, puede generar movimientos erráticos o inseguros. Se recomienda supervisión humana en entornos reales.
- No hay información sobre la longitud de contexto (número de pasos de observación y acción) ni sobre el tipo de sensores utilizados.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo no incluye garantías de seguridad para aplicaciones industriales críticas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ugie01/omx_act_policy
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
