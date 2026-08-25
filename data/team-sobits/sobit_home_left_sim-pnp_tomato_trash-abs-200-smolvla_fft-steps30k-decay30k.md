# team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200-smolvla_fft-steps30k-decay30k

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, diseñado para robótica de manipulación móvil. Este checkpoint concreto es un fine-tuning de `lerobot/smolvla_base` entrenado por el equipo SOBITS de la Universidad de Tokio para ejecutar la tarea "lanzar la lata de tomate a la papelera" en un entorno simulado con un manipulador móvil. El modelo consume imágenes de dos cámaras (cabeza y mano izquierda) junto con el estado del robot (20 dimensiones) y produce acciones de 20 dimensiones.

El interés de este modelo radica en que es un ejemplo de aplicación de SmolVLA, una arquitectura que busca llevar los VLA a hardware de consumo, con unos 450 millones de parámetros. El entrenamiento se realizó con 200 episodios simulados (48.141 frames a 10 FPS) durante 30.000 pasos con decaimiento coseno completo, lo que lo convierte en un checkpoint totalmente anealed, a diferencia de otros de la misma serie con 60k o 90k pasos que quedan a mitad de programación. Está publicado bajo licencia Apache 2.0 y es reproducible con la librería LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, basada en transformer) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de acción, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (vía LeRobot) |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones. Está diseñado para ser desplegado en hardware de consumo, reduciendo el coste computacional frente a VLA más grandes. El checkpoint base es `lerobot/smolvla_base`, publicado por el equipo de LeRobot de Hugging Face, y este fine-tuning se realizó con la librería LeRobot (versión 0.6.0).

El entrenamiento se llevó a cabo sobre el dataset `team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs`, que contiene 200 episodios de una tarea de pick-and-place en simulación: lanzar una lata de tomate a una papelera. Se usaron 30.000 pasos de entrenamiento con batch size 16, optimizador AdamW, learning rate 0.0001 y decaimiento coseno con `scheduler_decay_steps=30000`, de modo que el modelo queda completamente anealed (LR final de 2.5e-6). Las cámaras utilizadas son `head_camera` (480x640) y `hand_left_camera` (400x640), y el estado del robot es un vector de 20 dimensiones. No se menciona el uso de RLHF ni DPO; es un entrenamiento de imitación supervisada.

## Capacidades

- Ejecución de tareas de manipulación móvil en simulación: recoger un objeto y depositarlo en un contenedor.
- Procesamiento de dos flujos visuales simultáneos (cámara de cabeza y cámara de mano izquierda) junto con el estado propioceptivo del robot.
- Generación de acciones de 20 dimensiones a 10 FPS, adecuadas para control de manipulador móvil.
- Fine-tuning eficiente sobre un modelo base preentrenado, lo que permite adaptarlo a nuevas tareas con pocos datos (200 episodios).
- Despliegue en hardware de consumo gracias al diseño compacto de SmolVLA.
- Integración nativa con el ecosistema LeRobot para entrenamiento, evaluación y rollout.

## Casos de uso

- Automatización de tareas de recogida y colocación en almacenes: el modelo puede controlar un manipulador móvil para recoger objetos de una cinta y depositarlos en contenedores, gracias a su capacidad de procesar dos cámaras y el estado del robot.
- Investigación en aprendizaje por imitación: al estar entrenado con LeRobot y publicarse el dataset, sirve como referencia reproducible para estudiar el efecto del número de pasos de entrenamiento y el decaimiento de la tasa de aprendizaje en VLA.
- Prototipado rápido de políticas robóticas en simulación: con 200 episodios y 30k pasos, es un ejemplo de cómo obtener una política funcional con recursos limitados, útil para validar ideas antes de pasar a datos reales.
- Benchmarking de VLA compactos: al ser un checkpoint totalmente anealed, permite comparar el rendimiento frente a los de 60k y 90k pasos de la misma serie, que quedan a mitad de programación coseno.
- Educación en robótica con IA: el modelo y su dataset están disponibles abiertamente, lo que permite a estudiantes y desarrolladores experimentar con VLA sin necesidad de infraestructura costosa.
- Transferencia a tareas similares: el fine-tuning sobre `smolvla_base` demuestra el flujo de adaptación a nuevas tareas; el mismo procedimiento puede aplicarse a otras tareas de pick-and-place con datasets propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No se proporcionan métricas como tasa de éxito en simulación ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. Dado que el modelo tiene 450 millones de parámetros, una estimación razonable para inferencia en FP32 sería ~1.8 GB, y en FP16 ~0.9 GB, pero no se confirma oficialmente.
- GPU recomendadas: el diseño de SmolVLA apunta a hardware de consumo; GPUs como RTX 3060, RTX 4060 o superiores deberían ser suficientes para inferencia, aunque no se especifica en la documentación.
- Compatibilidad con consumer GPU: sí, por diseño de SmolVLA, pero no hay datos concretos de VRAM ni latencia.
- Opciones de despliegue: LeRobot (rollout con `lerobot-rollout`), que soporta robots tipo `mobile_manipulator` y cámaras OpenCV. No se mencionan vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (VLA compactos para robótica) dentro de los datos proporcionados. Se podría mencionar que el modelo base `lerobot/smolvla_base` es el punto de partida, y que existen otros checkpoints de la misma serie (60k y 90k pasos) del mismo autor, pero no hay datos de rendimiento para comparar. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en simulación (dataset `sobit_home_left_sim-pnp_tomato_trash-abs`); no hay evidencia de que funcione en robot real sin fine-tuning adicional.
- La tarea es muy específica ("lanzar la lata de tomate a la papelera"); no es un modelo generalista de manipulación.
- No se han publicado resultados de evaluación, por lo que se desconoce la tasa de éxito real.
- El modelo depende de las cámaras y el estado del robot con las dimensiones exactas usadas en el entrenamiento (20 dimensiones de estado, dos cámaras con resoluciones concretas); cambios en la configuración requieren reentrenamiento.
- Al ser un checkpoint totalmente anealed, puede tener menor capacidad de adaptación que los de 60k/90k si se quisiera continuar el entrenamiento, aunque esto no está verificado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y sin resultados de seguridad o robustez en entornos reales.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones de idioma, al ser un modelo de acción y no de lenguaje.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200-smolvla_fft-steps30k-decay30k
- Dataset de entrenamiento: https://huggingface.co/datasets/team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Documentación de LeRobot sobre SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Checkpoints hermanos (60k y 90k pasos): https://huggingface.co/team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200-smolvla_fft-60000 y https://huggingface.co/team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200-smolvla_fft-90000
