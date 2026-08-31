# Tron-Hayato/smolvla-policy-test

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, con aproximadamente 450 millones de parámetros. Está diseñado para ejecutarse en hardware de consumo, lo que reduce drásticamente el coste de despliegue frente a otros VLA de mayor tamaño. Este repositorio concreto, `Tron-Hayato/smolvla-policy-test`, es un fine-tuning de la base `lerobot/smolvla_base` realizado con LeRobot, entrenado para la tarea de agarre de objetos ("Grab the object") con un robot tipo `so_follower` y dos cámaras.

El modelo resuelve el problema de control robótico por imitación: a partir de observaciones visuales y del estado del robot, genera acciones de control. Su relevancia actual radica en que democratiza la robótica de aprendizaje, permitiendo entrenar y ejecutar políticas en GPUs de gama media. Este checkpoint concreto es un experimento de prueba (sin evaluaciones publicadas) que demuestra el flujo de fine-tuning con LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, basada en transformer) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no orientado a lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA que combina un codificador visual, un modelo de lenguaje y una cabeza de acción. El checkpoint base `lerobot/smolvla_base` fue preentrenado por Hugging Face con recetas eficientes y reproducibles, y este repositorio es un fine-tuning supervisado mediante imitación. El entrenamiento se realizó con el framework LeRobot (versión 0.6.1) sobre el dataset `Tron-Hayato/record-act-merged`, que contiene 64 episodios y 28.800 frames a 30 FPS, con la tarea "Grab the object". Se usaron 1000 pasos de entrenamiento, batch size 8, optimizador AdamW y learning rate 0.0001. No se menciona el uso de RLHF ni DPO; es un entrenamiento estándar de imitación.

## Capacidades

- Control robótico por imitación: genera acciones de 6 dimensiones (posición y orientación) a partir de observaciones de estado y tres vistas de cámara (256x256).
- Percepción visual: procesa imágenes de cámara frontal y de muñeca para guiar la manipulación.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de LeRobot, incluyendo comandos CLI como `lerobot-rollout` y `lerobot-train`.
- Eficiencia computacional: al ser un modelo de 450M de parámetros, es apto para GPUs de consumo, aunque no se especifican requisitos exactos en este repo.
- No se reportan capacidades de tool calling, agentes, ni razonamiento multi-paso fuera del ámbito robótico.

## Casos de uso

- Manipulación robótica en laboratorio: el modelo puede controlar un brazo robótico tipo `so_follower` para tareas de agarre, como "Grab the object", usando las cámaras integradas.
- Prototipado rápido de políticas de imitación: investigadores pueden usar este checkpoint como punto de partida para fine-tuning en nuevas tareas, gracias a su tamaño reducido y compatibilidad con LeRobot.
- Educación en robótica de aprendizaje: sirve como ejemplo didáctico para enseñar el flujo completo de recolección de datos, entrenamiento y despliegue de un VLA.
- Evaluación de hardware de bajo coste: permite probar el rendimiento de un VLA en GPUs de gama media (por ejemplo, RTX 3060 o superiores) sin necesidad de clústeres.
- Benchmarking de algoritmos de imitación: al ser un modelo pequeño y abierto, es útil para comparar técnicas de aprendizaje por refuerzo o imitación en entornos controlados.
- Desarrollo de sistemas de automatización flexible: en entornos industriales pequeños, puede adaptarse a tareas de pick-and-place con datos propios, aunque requiere validación adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay datos de éxito en tareas reales ni comparaciones con otros modelos.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la información del modelo. Dado que el modelo tiene 450M de parámetros y el repo pesa 0.9 GB, se estima que puede caber en GPUs con 6-8 GB de VRAM en precisión FP16, pero este dato no está confirmado.
- GPU recomendada: no disponible en la documentación. Por el tamaño, una RTX 3060 o superior podría ser suficiente, pero no hay confirmación oficial.
- Opciones de despliegue: el modelo está diseñado para usarse con LeRobot, que soporta inferencia en PyTorch con CUDA. No se mencionan formatos GGUF ni integración con vLLM u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este checkpoint concreto. A nivel de arquitectura, SmolVLA se posiciona frente a otros VLA como OpenVLA (7B parámetros) o RT-2 (mucho mayor), pero no hay benchmarks en este repo que permitan una comparación cuantitativa. Se puede afirmar que SmolVLA es significativamente más pequeño y eficiente, pero no se dispone de métricas de rendimiento.

## Limitaciones y advertencias

- Sin evaluación: no hay resultados de éxito en tareas reales, por lo que su rendimiento efectivo es desconocido.
- Dataset limitado: solo 64 episodios para una única tarea, lo que puede provocar sobreajuste y baja generalización a variaciones de iluminación, posición o distracciones.
- Sin soporte de lenguaje natural: aunque es un VLA, este checkpoint no está orientado a interacción conversacional; su salida es exclusivamente acciones de control.
- Riesgo de alucinación en acciones: como cualquier modelo de imitación, puede generar acciones erróneas ante observaciones fuera de la distribución de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el usuario es responsable de validar la seguridad del robot en entornos reales.
- Dependencia de LeRobot: el despliegue requiere la instalación y configuración del framework LeRobot, así como el hardware específico (`so_follower` y cámaras).

## Enlaces

- Repositorio del modelo: https://huggingface.co/Tron-Hayato/smolvla-policy-test
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Tron-Hayato/record-act-merged
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844 (versión HTML: https://arxiv.org/html/2506.01844v1)
- Documentación de LeRobot para SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Sitio web de SmolVLA: https://smolvla.net/index_en
