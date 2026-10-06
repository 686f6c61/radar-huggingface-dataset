# yannnnnn6/scooping-smolvla-v7

## Resumen

scooping-smolvla-v7 es un ajuste fino (fine-tune) del modelo base `lerobot/smolvla_base`, un modelo de visión-lenguaje-acción (VLA) compacto desarrollado originalmente por Hugging Face dentro del ecosistema LeRobot y descrito en el paper arXiv:2506.01844. Lo publica el usuario yannnnnn6 y su función es resolver una tarea robótica concreta de "scooping" (recogida o paletizado de material con un efector final), aprendida a partir del dataset propio `yannnnnn6/scooping-all-v3-merged-clean`.

El modelo tiene 450.046.176 parámetros (aproximadamente 450 millones), un tamaño que lo sitúa en la categoría de VLA ligero y apto para hardware de consumo. El repositorio ocupa 0,9 GB y los pesos se distribuyen en formato safetensors. Se apoya en la librería LeRobot para entrenamiento e inferencia, y mantiene la licencia Apache 2.0 del modelo base.

Su relevancia radica en que demuestra el flujo típico de especialización de un VLA pequeño para una tarea industrial concreta: partir de un modelo generalista, ajustarlo con demostraciones propias y desplegarlo en un robot de bajo coste. No es un modelo de propósito general, sino una política (policy) robótica orientada a una tarea específica. No se han documentado en la información disponible detalles de idiomas, contexto ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA); arquitectura exacta del backbone no disponible en la informacion proporcionada |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizacion publicada) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `lerobot/smolvla_base`, un VLA compacto de 450 millones de parámetros diseñado para lograr un rendimiento competitivo con un coste computacional reducido y desplegable en hardware de consumo. La arquitectura subyacente es de tipo visión-lenguaje-acción: combina un codificador visual, un modelo de lenguaje y un mecanismo de generación de acciones, siguiendo el diseño descrito en el paper SmolVLA (arXiv:2506.01844). No se detallan en la model card los componentes internos concretos, el número de tokens de entrenamiento ni la composición del dataset original.

El ajuste fino se ha realizado sobre el dataset `yannnnnn6/scooping-all-v3-merged-clean`, un conjunto de datos propio del autor que presumiblemente contiene demostraciones de la tarea de scooping (episodios de manipulación teleoperados o grabados). El entrenamiento se ha gestionado mediante la herramienta `lerobot-train` del ecosistema LeRobot. No se documentan en la información disponible detalles sobre uso de RLHF, DPO, número de episodios ni estrategia de aumento de datos. Tampoco se especifican innovaciones técnicas adicionales más allá de las heredadas del modelo base.

## Capacidades

- Generación de acciones motoras para control robótico: el modelo traduce observaciones visuales y, si procede, instrucciones en lenguaje en comandos de acción para el robot.
- Ejecución de una tarea específica de scooping: ajustado sobre el dataset `scooping-all-v3-merged-clean`, orientado a la recogida o manipulación de material.
- Percepción visual: al ser un modelo VLA, procesa entradas de imagen procedentes de las cámaras del robot.
- Integración con el ecosistema LeRobot: compatible con el flujo de entrenamiento, evaluación e inferencia de `lerobot-train` y `lerobot-record`.
- Despliegue en hardware de consumo: hereda del modelo base la capacidad de ejecutarse en equipos asequibles.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos especiales como thinking, visión generativa o audio.

## Casos de uso

- Automatización de una celda de recogida (scooping) industrial: el modelo actúa como política de control que, a partir de las imágenes de las cámaras, genera las acciones del brazo robótico para recoger material de forma repetitiva.
- Prototipado rápido de políticas robóticas: sirve como punto de partida para equipos que quieran experimentar con VLA ligeros sobre su propio hardware usando LeRobot.
- Investigación en aprendizaje por imitación: al ser un fine-tune reproducible a partir de un dataset documentado, permite estudiar cómo un VLA pequeño se especializa en una tarea concreta.
- Robótica educativa y de bajo coste: su tamaño de 450M parámetros y su compatibilidad con hardware de consumo lo hacen adecuado para laboratorios y aulas con presupuesto limitado.
- Despliegue en robots tipo SO-100/SO-101: la model card muestra ejemplos con `so100_follower`, lo que sugiere su uso en plataformas de bajo coste compatibles con LeRobot.
- Evaluación comparativa de políticas: al derivar de `lerobot/smolvla_base`, permite medir la ganancia de rendimiento obtenida al ajustar sobre un dataset específico frente al modelo base.
- Generación de datos de evaluación: mediante `lerobot-record` con el prefijo `eval_`, se puede usar el modelo para producir episodios de evaluación de la tarea de scooping.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de éxito de la tarea, tasas de acierto ni comparaciones cuantitativas con el modelo base u otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: en precisión completa (FP32) en torno a 1,8 GB; en BF16/FP16 aproximadamente 0,9 GB (coincide con el tamaño del repositorio); en cuantización INT8 sería del orden de 0,45 GB, aunque no se han publicado versiones cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM disponible para el modelo, además del margen necesario para las imágenes de entrada y el runtime. Una RTX 4090, RTX 3060 o incluso GPUs integradas modernas serían suficientes.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo actual gracias a sus 450M parámetros.
- Opciones de despliegue: LeRobot (`lerobot-record`) para inferencia sobre robot; el modelo base SmolVLA está diseñado para ser desplegable en hardware de consumo, incluyendo posiblemente CPU, aunque no se documenta explícitamente en esta ficha.
- Latencia y throughput estimados: no disponibles. En robótica la latencia de inferencia es crítica, pero no se aportan cifras en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|
| yannnnnn6/scooping-smolvla-v7 | 450 M | VLA fine-tune para scooping | apache-2.0 | HuggingFace (0 descargas, 0 likes) |
| lerobot/smolvla_base | ~450 M | VLA generalista (modelo base) | apache-2.0 (segun el autor; no verificado en esta busqueda) | HuggingFace |
| OpenVLA | ~7 B | VLA generalista | no disponible en la informacion proporcionada | HuggingFace |
| pi0 / pi0.5 (Physical Intelligence) | no disponible en la informacion proporcionada | VLA generalista | no disponible en la informacion proporcionada | No verificado |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada. La comparación se limita a parámetros, tipo y disponibilidad.

## Limitaciones y advertencias

- Especialización estrecha: al ser un fine-tune sobre una única tarea (scooping), su comportamiento fuera de ese dominio no está garantizado y probablemente degrade notablemente.
- Sesgos del dataset: el modelo hereda los sesgos, la distribución y las limitaciones del dataset `scooping-all-v3-merged-clean`, no documentados en detalle. Esto puede provocar un rendimiento pobre ante variaciones de iluminación, disposición de objetos o tipo de material no representadas en los datos de entrenamiento.
- Riesgo de alucinación motora: como toda política de aprendizaje por imitación, puede generar acciones inseguras o erráticas ante observaciones fuera de distribución; en robótica esto implica riesgo físico y requiere salvaguardas.
- Sin métricas publicadas: no hay benchmarks, tasas de éxito ni evaluación de robustez, lo que impide estimar su calidad real.
- Cero adopción: el repositorio registra 0 descargas y 0 likes, por lo que no ha sido validado por la comunidad.
- Idiomas y contexto no documentados: se desconoce si acepta instrucciones en lenguaje natural y en qué idiomas, así como su longitud de contexto máxima.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base `lerobot/smolvla_base` y del dataset utilizado, ya que podrían imponer restricciones adicionales.
- Uso en producción: no se recomienda desplegarlo en entornos reales sin una validación exhaustiva previa, supervisión humana y mecanismos de parada de emergencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yannnnnn6/scooping-smolvla-v7
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA (arXiv:2506.01844): https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/yannnnnn6/scooping-all-v3-merged-clean
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot en GitHub: https://github.com/huggingface/lerobot
