# yorklyb/oven120

## Resumen

El modelo `yorklyb/oven120` es una implementación de la política robótica π₀.₅ (Pi05), un modelo de visión-lenguaje-acción (VLA) desarrollado originalmente por Physical Intelligence y adaptado al ecosistema LeRobot por el usuario yorklyb. π₀.₅ está diseñado para abordar el problema de la generalización en robótica: mientras que los modelos tradicionales funcionan bien en entornos controlados, este modelo pretende operar en entornos y situaciones nunca vistos durante el entrenamiento, lo que lo hace relevante para aplicaciones de manipulación y control en el mundo real.

El modelo cuenta con 4.143.404.816 parámetros (aproximadamente 4,1 mil millones) y se distribuye en formato safetensors, con un tamaño de repositorio de 9,4 GB. Está entrenado sobre el dataset `oven120` y se publica bajo licencia Apache-2.0, lo que permite uso comercial y modificación. Aunque la arquitectura exacta no se detalla en la información disponible, se trata de un modelo VLA que integra procesamiento de visión, lenguaje y acciones motoras, siguiendo la línea de π₀ y π₀.₅ de Physical Intelligence.

La relevancia actual de este modelo radica en su capacidad potencial para generalizar a tareas y entornos nuevos, un paso clave hacia robots útiles en entornos domésticos o industriales no estructurados. Al estar disponible en HuggingFace con la integración de LeRobot, facilita su uso en pipelines de entrenamiento e inferencia para la comunidad robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), basada en π₀.₅ de Physical Intelligence (detalles específicos no disponibles) |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente inglés, pero no confirmado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de π₀.₅ no se describe en detalle en la información proporcionada, pero se sabe que es un modelo de visión-lenguaje-acción (VLA) que combina un codificador visual, un modelo de lenguaje y una cabeza de acción para generar comandos motores. La implementación en LeRobot está adaptada del repositorio OpenPI de Physical Intelligence, lo que sugiere que utiliza una arquitectura transformer con atención cruzada entre modalidades. No se especifican los datos de entrenamiento (número de tokens, composición del dataset) ni si se emplearon técnicas como RLHF o DPO. El modelo fue entrenado sobre el dataset `oven120`, que probablemente contiene demostraciones de manipulación robótica, y el entrenamiento se realizó mediante el framework LeRobot.

## Capacidades

- Control robótico: genera acciones motoras (posiciones, velocidades o torques) para robots manipuladores, como brazos de tipo SO-100.
- Generalización a entornos nuevos: diseñado para operar en escenarios no vistos durante el entrenamiento, gracias a su naturaleza VLA.
- Percepción visual: procesa imágenes de cámaras para entender el estado del entorno.
- Comprensión de lenguaje: interpreta instrucciones en lenguaje natural para guiar las acciones (aunque no se especifican los idiomas soportados).
- Integración con LeRobot: compatible con el ecosistema de HuggingFace para entrenamiento, evaluación y despliegue.
- No se mencionan capacidades de tool calling, agentes multi-paso, ni modos de razonamiento explícitos.

## Casos de uso

- Manipulación robótica en entornos domésticos: el modelo puede controlar un brazo robótico para tareas como recoger objetos, abrir puertas o apilar elementos, gracias a su capacidad de generalización a entornos no estructurados.
- Automatización industrial flexible: en líneas de montaje donde los productos varían, el modelo puede adaptarse a nuevas configuraciones sin reentrenamiento específico.
- Investigación en robótica: sirve como base para experimentos sobre aprendizaje por imitación, generalización y control VLA, permitiendo a los investigadores reproducir y modificar el modelo fácilmente con LeRobot.
- Teleoperación asistida: puede utilizarse en sistemas de teleoperación donde el robot interpreta comandos de alto nivel y ejecuta las acciones necesarias.
- Evaluación de políticas robóticas: gracias a la integración con LeRobot, se puede usar para evaluar el rendimiento de políticas en entornos simulados o reales mediante el comando `lerobot-record`.
- Desarrollo de asistentes robóticos: en proyectos de robótica asistencial, el modelo puede ayudar a personas con movilidad reducida a realizar tareas cotidianas, aunque se requiere validación adicional en entornos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos robóticos. El rendimiento en tareas de manipulación no está cuantificado.

## Requisitos de hardware

- VRAM estimada: no disponible. Con 4.143 millones de parámetros, una inferencia en precisión FP32 requeriría aproximadamente 16,6 GB de VRAM (4 bytes por parámetro), pero con cuantización a 8 bits podría reducirse a unos 4,1 GB, y a 4 bits a unos 2,1 GB. Sin embargo, no se confirman cuantizaciones disponibles.
- GPU recomendadas: para una inferencia cómoda, se sugiere una GPU con al menos 8 GB de VRAM si se aplica cuantización, como una RTX 3070 o superior. Para entrenamiento o fine-tuning, se necesitaría una GPU con 24 GB o más (por ejemplo, RTX 3090, A100).
- Compatibilidad con GPU de consumo: probablemente sí, si se aplica cuantización, pero no hay datos oficiales.
- Opciones de despliegue: al ser un modelo LeRobot, se puede ejecutar con los scripts de inferencia de LeRobot, que usan PyTorch. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que es un modelo robótico, no un LLM estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (VLA robóticos). Se podría mencionar π₀ original de Physical Intelligence, pero no hay datos de rendimiento ni especificaciones para comparar. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero al ser un modelo entrenado con datos de demostración, puede heredar sesgos del dataset `oven120`.
- Riesgo de alucinación: en el contexto robótico, el modelo podría generar acciones incorrectas o no seguras si recibe entradas fuera de su distribución de entrenamiento. No se han realizado evaluaciones de seguridad.
- Limitaciones de contexto o idioma: no se especifican los idiomas soportados ni la longitud de contexto, lo que limita su uso en aplicaciones multilingües o con instrucciones largas.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero se debe atribuir el crédito correspondiente y mantener los avisos de copyright.
- Caveat para producción: el modelo es una adaptación de investigación; no se ha validado en entornos industriales o de seguridad crítica. Se recomienda probar exhaustivamente antes de desplegarlo en robots reales.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/yorklyb/oven120)
- [Blog de Physical Intelligence sobre π₀.₅](https://www.physicalintelligence.company/blog/pi05)
- [Repositorio LeRobot](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
