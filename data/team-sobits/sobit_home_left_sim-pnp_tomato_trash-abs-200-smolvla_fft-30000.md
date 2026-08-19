# team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200-smolvla_fft-30000

## Resumen

Este modelo es una política de robótica basada en SmolVLA, un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, que permite ejecutar tareas de manipulación en robots con hardware de consumo. El modelo presentado es un fine-tuning del modelo base `lerobot/smolvla_base` realizado con la librería LeRobot, entrenado específicamente para la tarea de lanzar una lata de tomate a una papelera en un entorno simulado. Con 450 millones de parámetros, este modelo demuestra que es posible lograr comportamientos robóticos complejos con recursos computacionales limitados, lo que lo hace relevante para la investigación y el desarrollo de robots asistentes en entornos domésticos o industriales.

El entrenamiento se realizó sobre un dataset de 200 episodios recopilados en simulación, con 48 141 frames a 10 FPS, y el modelo fue ajustado durante 30 000 pasos con un batch size de 16 y una tasa de aprendizaje de 0.0001. La arquitectura SmolVLA combina un codificador visual, un modelo de lenguaje y un decodificador de acciones, lo que le permite interpretar instrucciones en lenguaje natural y generar comandos de control de 20 dimensiones para un robot manipulador móvil equipado con dos cámaras. Aunque el modelo está especializado en una tarea concreta, su enfoque de entrenamiento y su tamaño reducido lo convierten en un ejemplo práctico de cómo aplicar VLA en escenarios reales con recursos accesibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, basada en transformer) |
| Parametros totales | 450 046 176 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura de visión-lenguaje-acción que integra un codificador de imágenes (tipo SigLIP), un modelo de lenguaje compacto (basado en SmolLM2) y un decodificador de acciones continuas. El modelo base `lerobot/smolvla_base` fue preentrenado en una amplia variedad de datos robóticos y posteriormente fine-tuneado en este repositorio con LeRobot para la tarea específica de "lanzar la lata de tomate a la papelera". El proceso de entrenamiento utilizó el dataset `team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs`, que contiene 200 episodios de demostraciones en simulación con dos cámaras (cámara de cabeza y cámara de mano izquierda) y estados del robot de 20 dimensiones. Se empleó el optimizador AdamW con una tasa de aprendizaje de 0.0001, batch size de 16 y 30 000 pasos de entrenamiento. No se menciona el uso de técnicas de refuerzo o ajuste por preferencias (RLHF/DPO); se trata de un aprendizaje por imitación supervisado estándar.

El modelo acepta como entrada las observaciones del robot: el estado (vector de 20 valores) y dos imágenes RGB (480×640 y 400×640), y produce una acción de 20 dimensiones que corresponde a los comandos de los actuadores del robot. Esta configuración es típica de los modelos VLA entrenados con LeRobot, que se centran en la generación de trayectorias de control a partir de percepciones visuales y de estado.

## Capacidades

- Control de robots manipuladores móviles: genera acciones de 20 dimensiones a partir de observaciones visuales y de estado.
- Percepción multimodal: procesa simultáneamente imágenes de dos cámaras (cabeza y mano izquierda) y el estado del robot.
- Ejecución de tareas específicas de manipulación: entrenado para lanzar una lata de tomate a una papelera en un entorno simulado.
- Integración con LeRobot: compatible con el ecosistema de LeRobot para entrenamiento, evaluación y despliegue en robots reales o simulados.
- Inferencia eficiente: al tener solo 450M parámetros, puede ejecutarse en hardware de consumo (GPUs de gama media).
- No incluye capacidades de generación de texto, tool calling ni razonamiento conversacional; es exclusivamente un modelo de control robótico.

## Casos de uso

- Automatización de tareas de recogida en entornos domésticos: el modelo puede controlar un robot para recoger objetos y depositarlos en contenedores, como en la tarea de lanzar una lata a la papelera. Su tamaño compacto permite desplegarlo en robots de bajo coste.
- Pruebas de algoritmos de imitación en simulación: investigadores pueden usar este modelo como punto de partida para estudiar técnicas de aprendizaje por imitación en robótica, ya que está entrenado en un entorno simulado y puede servir como baseline.
- Desarrollo de robots asistentes para personas con movilidad reducida: la capacidad de interpretar instrucciones simples y ejecutar acciones de manipulación puede aplicarse a tareas como recoger objetos del suelo o vaciar contenedores.
- Validación de pipelines de entrenamiento con LeRobot: este modelo es un ejemplo de fine-tuning de SmolVLA base, útil para verificar flujos de trabajo de entrenamiento, evaluación y despliegue en la plataforma LeRobot.
- Investigación en generalización de tareas robóticas: al ser un fine-tuning sobre una tarea concreta, puede utilizarse para estudiar la transferencia de habilidades entre tareas o la adaptación a nuevos entornos.
- Benchmarking de hardware de robótica: gracias a su bajo requisito de cómputo, es adecuado para medir el rendimiento de GPUs de consumo o incluso de dispositivos edge en tareas de control en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que no se han proporcionado resultados de evaluación en robot real o simulación.

## Requisitos de hardware

- VRAM estimada: con 450M parámetros, en precisión fp16 el modelo ocupa aproximadamente 900 MB de VRAM, y en fp32 unos 1.8 GB. No se han publicado datos oficiales de cuantización.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo en fp16, como una NVIDIA GTX 1650, RTX 3060 o superiores. Para entrenamiento o fine-tuning se recomienda una GPU con 8 GB o más (por ejemplo, RTX 3070, RTX 4080, A100).
- Compatibilidad con hardware de consumo: sí, el modelo está diseñado para funcionar en GPUs de gama media y baja, lo que lo hace accesible para laboratorios pequeños y aficionados.
- Opciones de despliegue: se puede ejecutar mediante los comandos de LeRobot (`lerobot-rollout`), que soporta robots reales y simulados. También es compatible con el framework de Hugging Face para inferencia en Python.
- Latencia y throughput: no hay datos oficiales, pero al ser un modelo compacto se espera una latencia de inferencia en el orden de decenas de milisegundos en GPUs modernas, suficiente para control en tiempo real a 10 FPS (la frecuencia del dataset).

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos en la información proporcionada. Este modelo es un fine-tuning de `lerobot/smolvla_base`, por lo que su rendimiento es comparable al de otros fine-tunings de SmolVLA sobre tareas similares. Alternativas en el ámbito de VLA incluyen OpenVLA (7B parámetros), RT-2 (55B parámetros) y modelos más grandes que requieren hardware más potente. SmolVLA destaca por su eficiencia, pero no se tienen datos de benchmarks que permitan una comparación cuantitativa con estos modelos.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado exclusivamente en un entorno simulado, el modelo puede no transferir bien a entornos reales con iluminación, texturas o dinámicas diferentes.
- Riesgo de alucinación: no aplica, ya que no genera texto, pero puede producir acciones incorrectas si las observaciones difieren mucho de las del entrenamiento.
- Limitaciones de contexto: el modelo no tiene una ventana de contexto de lenguaje; solo procesa imágenes y estado del robot en cada paso de tiempo.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificación, pero es necesario atribuir al autor original y mantener el aviso de licencia.
- Caveat para producción: el modelo está especializado en una única tarea ("lanzar la lata de tomate a la papelera") y no es generalizable a otras tareas sin un nuevo fine-tuning. Además, no se han reportado evaluaciones en robot real, por lo que su rendimiento en producción es incierto.
- Dependencia de LeRobot: para ejecutar el modelo es necesario tener instalada la librería LeRobot y los controladores de hardware adecuados.

## Enlaces

- Repositorio del modelo: https://huggingface.co/team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200-smolvla_fft-30000
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
