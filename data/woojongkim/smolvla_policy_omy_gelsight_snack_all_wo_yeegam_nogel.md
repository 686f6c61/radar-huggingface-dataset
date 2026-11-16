# WoojongKim/smolvla_policy_omy_gelsight_snack_all_wo_yeegam_nogel

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico con costes computacionales reducidos y despliegue en hardware de consumo. Esta ficha concreta corresponde a un *fine-tuning* del checkpoint base `lerobot/smolvla_base` realizado por el usuario WoojongKim sobre el conjunto de datos `omy_gelsight_snack_all_wo_yeegam_nogel`, orientado a una tarea específica de manipulación con sensor táctil GelSight.

El modelo resuelve el problema de convertir observaciones visuales (y potencialmente táctiles, dado el nombre del dataset) en acciones motrices de bajo nivel para un robot, sustituyendo pipelines de control clásicos por una política neuronal entrenada por imitación. Con 450 millones de parámetros y un repositorio de 0,9 GB en formato safetensors, es lo suficientemente pequeño para ejecutarse en GPUs de gama media, lo que lo hace relevante para laboratorios con presupuesto limitado que necesitan iterar rápido en tareas de manipulación.

La relevancia actual del modelo radica en su naturaleza de política preentrenada y reutilizable: el checkpoint base permite a investigadores aplicar *fine-tuning* sobre sus propios datasets de demostraciones sin partir de cero, y el pipeline `robotics` de Hugging Face junto con la librería LeRobot facilitan tanto el entrenamiento como la evaluación sobre robots reales tipo SO-100.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta, según paper SmolVLA (arXiv:2506.01844) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Modelo base | lerobot/smolvla_base |
| Dataset de entrenamiento | WoojongKim/omy_gelsight_snack_all_wo_yeegam_nogel |
| Tamano del repositorio | 0,9 GB |
| Pipeline | robotics |

## Arquitectura y entrenamiento

El modelo se basa en SmolVLA, una arquitectura de visión-lenguaje-acción presentada en el paper arXiv:2506.01844, que combina un codificador visual, un modelo de lenguaje compacto y un cabezal de acciones para producir comandos motrices a partir de observaciones e instrucciones en lenguaje natural. La información disponible no detalla la composición exacta de los componentes internos ni la configuración del transformer subyacente.

Este checkpoint concreto se ha obtenido mediante *fine-tuning* supervisado (imitación) del modelo base `lerobot/smolvla_base` sobre el dataset `omy_gelsight_snack_all_wo_yeegam_nogel`, que por su nombre sugiere demostraciones de una tarea de manipulación de snacks con sensor táctil GelSight y sin cámara de muñeca ("wo_yeegam" podría interpretarse como "without wrist camera" en una transliteración). No se dispone de información sobre el número de episodios, tokens de entrenamiento, composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El entrenamiento se ha realizado con la herramienta `lerobot-train` del ecosistema LeRobot.

## Capacidades

- Generación de acciones motrices de bajo nivel para control robótico a partir de observaciones visuales e instrucciones en lenguaje natural.
- Política de imitación entrenada específicamente para una tarea de manipulación con sensor táctil GelSight (según el nombre del dataset).
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue en robots reales (por ejemplo, SO-100 follower).
- Compatibilidad con el pipeline `robotics` de Hugging Face y carga mediante `lerobot-record` con `--policy.path`.
- Capacidad de reutilización como punto de partida para *fine-tuning* en tareas relacionadas.
- No se dispone de información sobre soporte de *tool calling*, agentes multi-paso, capacidades multilingües o modos de razonamiento explícito, al tratarse de un modelo de política robótica y no de un LLM conversacional.

## Casos de uso

- Manipulación robótica de snacks con sensor táctil: el modelo ejecuta la política entrenada para recoger y colocar objetos sobre una superficie, usando las lecturas del sensor GelSight como señal de retroalimentación. Es adecuado porque ha sido entrenado específicamente sobre este dataset.
- Investigación en aprendizaje por imitación: sirve como checkpoint de referencia para comparar variantes de entrenamiento (con y sin cámara de muñeca, con y sin sensor táctil) sobre la misma tarea.
- Evaluación de políticas VLA en robots de bajo coste: al tener 450 M de parámetros y 0,9 GB, puede desplegarse en GPUs de consumo y ejecutarse sobre plataformas tipo SO-100, lo que facilita experimentos repetibles en laboratorio.
- *Fine-tuning* para tareas de ensamblaje o picking: partiendo de este checkpoint, un equipo puede adaptar la política a objetos similares con pocos episodios de demostración, reduciendo el coste frente a entrenar desde cero.
- Docencia y formación en robótica: el modelo y su pipeline permiten a estudiantes reproducir un flujo completo de entrenamiento y evaluación con `lerobot-train` y `lerobot-record` en hardware asequible.
- Prototipado de habilidades táctiles: el uso de GelSight en el dataset lo hace útil para estudiar cómo la información táctil mejora la manipulación en políticas VLA compactas.
- Benchmarking interno de políticas: como checkpoint publicado con licencia Apache 2.0, puede integrarse en suites de evaluación comparativa de políticas robóticas dentro de una organización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,8 GB solo para pesos (450 M × 4 bytes), más activaciones y buffers; en la práctica se recomienda al menos 4-6 GB de VRAM.
- VRAM estimada en FP16/BF16: alrededor de 0,9 GB para pesos, con margen recomendado de 2-4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son válidas. Para entrenamiento se recomienda RTX 4090 o superior.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 4 GB o más de VRAM.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de inferencia en CUDA según la documentación de LeRobot. No se dispone de información sobre soporte en vLLM, llama.cpp, Ollama o TGI, que están orientados a LLMs y no a políticas robóticas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| smolvla_policy_omy_gelsight_snack_all_wo_yeegam_nogel (este) | 450 M | no disponible | Apache 2.0 | safetensors | Fine-tuning específico sobre dataset táctil GelSight |
| lerobot/smolvla_base | no disponible en la informacion | no disponible | no disponible en la informacion | safetensors | Checkpoint base del que deriva este modelo |
| Otros modelos VLA compactos (p. ej. variantes de SmolVLA publicadas en LeRobot) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de información suficiente para comparar parámetros, contexto o rendimiento con alternativas concretas como OpenVLA, π0 o RT-2.

## Limitaciones y advertencias

- El modelo está entrenado para una tarea y un dataset muy específicos; su generalización a otros objetos, entornos o robots no está garantizada.
- El nombre del dataset sugiere ausencia de cámara de muñeca ("wo_yeegam"), lo que puede limitar la percepción en configuraciones que sí la incluyan.
- No se dispone de información sobre sesgos, tasas de alucinación (en el sentido de acciones erróneas) ni robustez ante cambios de iluminación o posicionamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende del checkpoint base `lerobot/smolvla_base`, cuya licencia debe verificarse por separado.
- Al ser un modelo de 450 M de parámetros, su capacidad de razonamiento abstracto y generalización es limitada en comparación con VLAs de mayor tamaño.
- No se han publicado métricas de éxito en la tarea ni curvas de aprendizaje, por lo que no es posible evaluar su rendimiento real sin ejecutarlo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.
- La fecha de creación indicada (2026-11-16) es futura respecto a la fecha habitual de consulta; conviene verificar la integridad del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WoojongKim/smolvla_policy_omy_gelsight_snack_all_wo_yeegam_nogel
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot en GitHub: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/WoojongKim/omy_gelsight_snack_all_wo_yeegam_nogel
