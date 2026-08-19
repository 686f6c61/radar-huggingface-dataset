# thehanazhang/25ep-act-cube-pick

## Resumen

El modelo `thehanazhang/25ep-act-cube-pick` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), desarrollado por Hana Zhang y publicado en Hugging Face bajo la librería LeRobot. ACT es una técnica de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que permite a un robot ejecutar tareas de manipulación con alta tasa de éxito a partir de datos teleoperados. Este modelo concreto está entrenado sobre el dataset `Dust-Robotics/b601_wick_25ep`, orientado a tareas de recogida de cubos (cube pick), y se distribuye con licencia Apache 2.0.

El modelo tiene 51.670.663 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en una categoría ligera, apta para experimentación en entornos de investigación y prototipado. Su relevancia actual radica en que demuestra el uso práctico de ACT dentro del ecosistema LeRobot, que facilita el entrenamiento, evaluación y despliegue de políticas robóticas de forma reproducible. Al ser un modelo de imitación, no requiere un dataset etiquetado manualmente, sino demostraciones teleoperadas, lo que reduce la complejidad de entrenamiento frente a métodos de refuerzo.

La arquitectura subyacente es la descrita en el paper de ACT (arXiv:2304.13705), que combina un codificador de visión con un transformador que genera acciones en bloques. Aunque no se especifican detalles adicionales en la model card, el modelo está diseñado para ser cargado y ejecutado con las herramientas de LeRobot, tanto para inferencia como para evaluación en robots reales o simulados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.670.663 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (modelo de control robótico, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que utiliza un transformador para predecir una secuencia de acciones futuras (un "chunk") a partir de observaciones actuales. El modelo se entrena con demostraciones teleoperadas, donde un operador humano guía al robot, y el sistema aprende a replicar esas acciones. La arquitectura típica de ACT incluye un codificador de imágenes (generalmente un ResNet) y un decodificador basado en transformador que genera las acciones. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; la model card solo indica que se entrenó con LeRobot sobre el dataset `Dust-Robotics/b601_wick_25ep`. La innovación principal de ACT es la predicción por chunks, que reduce la acumulación de errores y mejora la estabilidad del control en tareas de manipulación.

## Capacidades

- Control robótico de manipulación: el modelo genera comandos de acción para un robot, típicamente en tareas de pick-and-place (recoger y colocar objetos).
- Aprendizaje por imitación: aprende directamente de demostraciones teleoperadas, sin necesidad de recompensas explícitas.
- Integración con LeRobot: compatible con el ecosistema de Hugging Face para entrenamiento, evaluación y despliegue de políticas robóticas.
- Ejecución en tiempo real: al ser un modelo ligero (51,7M de parámetros), puede ejecutarse en hardware modesto, aunque no se especifican requisitos concretos.
- No soporta tareas de lenguaje, visión general ni tool calling; su ámbito es exclusivamente el control motor robótico.

## Casos de uso

- Investigación en aprendizaje por imitación: el modelo sirve como punto de partida para estudiar el rendimiento de ACT en tareas de manipulación, permitiendo reproducir experimentos y comparar variantes.
- Prototipado de robots de bajo coste: dado su tamaño reducido, puede desplegarse en robots educativos o de investigación con GPUs de gama media, como la serie RTX 30 o 40.
- Evaluación de políticas en simulación: se puede cargar en entornos simulados (por ejemplo, MuJoCo o Isaac Gym) para validar la robustez antes de pasar al hardware real.
- Automatización de tareas repetitivas en entornos controlados: por ejemplo, recogida y colocación de piezas en líneas de montaje pequeñas, donde las demostraciones son fáciles de capturar.
- Benchmarking de métodos de control: al estar disponible en el Hub, permite comparar ACT con otras políticas (por ejemplo, Diffusion Policy) en el mismo dataset.
- Formación y docencia: el modelo y su código asociado en LeRobot son útiles para enseñar conceptos de robótica y aprendizaje automático en cursos universitarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de éxito, tasas de acierto ni comparaciones con otros modelos. Se recomienda consultar el paper original de ACT (arXiv:2304.13705) para conocer el rendimiento general del método, aunque los resultados específicos de este checkpoint no están documentados.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Con 51,7M de parámetros, una estimación orientativa sería de 1-2 GB en FP32, y menos de 1 GB en cuantización de 8 bits, pero no hay datos confirmados.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM debería ser suficiente para inferencia; para entrenamiento, se recomienda una GPU con 8-12 GB (por ejemplo, RTX 3060, RTX 4070, A10).
- Compatibilidad con consumer GPU: sí, el modelo es lo bastante pequeño para ejecutarse en GPUs de consumo como la RTX 3060 o superiores.
- Opciones de despliegue: LeRobot proporciona scripts de inferencia y evaluación; también puede usarse con PyTorch estándar. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Al ser un modelo de control, la latencia depende del bucle de control del robot y de la frecuencia de inferencia requerida.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de la misma categoría. Existen otros checkpoints de ACT en el Hub (por ejemplo, `nishanth-mcw/act_cube_pick_and_place`), pero no se conocen sus parámetros ni rendimiento. Se recomienda consultar el paper de ACT para comparaciones metodológicas con otras arquitecturas de imitación.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado con demostraciones teleoperadas, puede heredar los sesgos del operador humano (por ejemplo, trayectorias subóptimas o preferencias de agarre).
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero el modelo puede producir acciones erróneas si se enfrenta a situaciones fuera de la distribución de entrenamiento.
- Limitaciones de contexto: no se especifica la longitud de contexto; en ACT, el contexto suele ser una ventana de observaciones recientes, pero no se documenta aquí.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de licencia.
- Caveat para producción: el modelo no incluye garantías de seguridad ni robustez; su uso en robots físicos requiere validación exhaustiva y medidas de seguridad adicionales.
- Dependencia del dataset: el rendimiento está ligado al dataset `Dust-Robotics/b601_wick_25ep`; si se usa en otras tareas o entornos, el comportamiento puede degradarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thehanazhang/25ep-act-cube-pick
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Dataset utilizado: https://huggingface.co/datasets/Dust-Robotics/b601_wick_25ep (referenciado en la model card, no se ha verificado el enlace directo)
