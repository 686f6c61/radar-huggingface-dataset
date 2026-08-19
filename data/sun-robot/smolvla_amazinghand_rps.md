# sun-robot/smolvla_amazinghand_rps

## Resumen

El modelo `sun-robot/smolvla_amazinghand_rps` es un ajuste fino (fine-tuning) del modelo base `lerobot/smolvla_base`, desarrollado por el usuario sun-robot. Se trata de un modelo de visión-lenguaje-acción (VLA, por sus siglas en inglés) diseñado para control robótico, específicamente entrenado sobre el dataset `sun-robot/amazinghand_rps_v1`, que parece orientado a tareas de manipulación con una mano robótica, como el juego de piedra, papel o tijera.

SmolVLA es una arquitectura compacta y eficiente propuesta por Hugging Face que, con 450 millones de parámetros, alcanza un rendimiento competitivo frente a modelos entre 7 y 10 veces más grandes, entrenado únicamente con datos comunitarios públicos. Este ajuste fino particular se distribuye bajo licencia Apache-2.0 y se integra con el ecosistema LeRobot, lo que facilita su uso en entornos de investigación y desarrollo robótico con hardware asequible.

La relevancia de este modelo radica en su capacidad para ejecutar políticas de control robótico en tiempo real sobre GPUs de consumo, democratizando el acceso a la robótica basada en aprendizaje por imitación. El repositorio contiene los pesos en formato safetensors y el modelo está pensado para ser utilizado directamente con las herramientas de LeRobot.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (visión-lenguaje-acción) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual y un modelo de lenguaje para generar comandos de acción directamente a partir de observaciones visuales y instrucciones en lenguaje natural. El modelo base `lerobot/smolvla_base` fue preentrenado sobre grandes conjuntos de datos multimodales y posteriormente adaptado para robótica. Este ajuste fino concreto se entrenó con el framework LeRobot sobre el dataset `sun-robot/amazinghand_rps_v1`, que contiene episodios de demostración para la tarea de piedra, papel o tijera con una mano robótica.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas como RLHF o DPO. El entrenamiento se realizó mediante aprendizaje por imitación, utilizando las herramientas estándar de LeRobot para políticas de tipo VLA.

## Capacidades

- Control robótico de manipulación: genera acciones de control (posiciones, velocidades, pares) a partir de imágenes y comandos de lenguaje.
- Seguimiento de instrucciones en lenguaje natural: interpreta órdenes como "piedra", "papel" o "tijera" para ejecutar la acción correspondiente.
- Percepción visual: procesa imágenes de cámaras para identificar el estado del entorno y del robot.
- Integración con LeRobot: compatible con el flujo de entrenamiento, evaluación e inferencia de LeRobot, incluyendo la grabación de episodios y la reproducción de políticas.
- Eficiencia computacional: al tener solo 450M de parámetros, puede ejecutarse en hardware de consumo, facilitando su despliegue en laboratorios y proyectos personales.
- Aprendizaje por imitación: capacidad de imitar comportamientos demostrados en el dataset de entrenamiento, generalizando dentro de la tarea específica.

## Casos de uso

- Demostración de robótica educativa: el modelo puede utilizarse en cursos y talleres para enseñar conceptos de aprendizaje por imitación y control robótico, gracias a su bajo coste computacional y su integración con LeRobot.
- Investigación en manipulación robótica: sirve como punto de partida para estudiar la transferencia de políticas VLA a nuevas tareas o entornos, dado que es un ajuste fino de un modelo base bien documentado.
- Prototipado rápido de políticas: los desarrolladores pueden entrenar y evaluar nuevas tareas de manipulación con el flujo de LeRobot, reutilizando este modelo como inicialización para acelerar la convergencia.
- Automatización de tareas repetitivas en entornos controlados: por ejemplo, en líneas de montaje donde se requiere clasificar objetos mediante gestos de mano (piedra, papel, tijera), el modelo puede controlar un efector final para ejecutar la acción correcta.
- Benchmarking de algoritmos de control: al ser un modelo pequeño y reproducible, puede emplearse como referencia para comparar métodos de aprendizaje por refuerzo o imitación en tareas de manipulación.
- Desarrollo de interfaces humano-robot: permite que un operador dé comandos verbales o gestuales a un robot para que ejecute acciones específicas, útil en entornos de colaboración hombre-máquina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este ajuste fino concreto. El paper original de SmolVLA (arXiv:2506.01844) reporta métricas generales del modelo base, pero no hay datos específicos de rendimiento para `sun-robot/smolvla_amazinghand_rps`.

## Requisitos de hardware

- Al tratarse de un modelo de 450M de parámetros, el tamaño de los pesos en FP16 es de aproximadamente 900 MB, por lo que puede cargarse en GPUs con 4 GB de VRAM o más.
- GPU recomendada: tarjetas de consumo como NVIDIA RTX 3060, RTX 4060 o superiores son suficientes para inferencia en tiempo real. Para entrenamiento, se recomienda al menos 8 GB de VRAM.
- Es compatible con el ecosistema LeRobot, que utiliza PyTorch. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que es un modelo de robótica y no un LLM conversacional.
- La latencia y el throughput dependen del hardware y del bucle de control, pero al ser un modelo compacto, es viable para control en tiempo real con frecuencias de 10-30 Hz en GPUs de gama media.

## Comparativa con modelos similares

No se dispone de comparativas publicadas para este ajuste fino específico. A nivel general, SmolVLA (450M) se posiciona frente a otros VLA como OpenVLA (7B) o RT-2 (55B) con una fracción de los parámetros, pero no hay datos de rendimiento de este modelo concreto en tareas estandarizadas. Para una comparación justa, sería necesario evaluar el modelo en benchmarks de robótica como RLBench o CALVIN, lo cual no está documentado en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para la tarea de piedra, papel o tijera con la mano robótica "amazinghand". Su generalización a otras tareas o robots no está garantizada.
- Al ser un ajuste fino sobre un dataset de demostración limitado, puede presentar comportamientos erráticos o fallos de control en situaciones no cubiertas por los datos de entrenamiento.
- No se ha evaluado su robustez frente a cambios de iluminación, oclusiones o variaciones en la posición de la cámara, por lo que su uso en entornos no controlados requiere validación adicional.
- La licencia Apache-2.0 permite uso comercial, pero es necesario verificar que el dataset `sun-robot/amazinghand_rps_v1` tenga una licencia compatible con dicho uso.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos comunitarios, podría heredar sesgos presentes en los datos de demostración.
- El modelo no es un chatbot ni un asistente de lenguaje; su salida son acciones de control, no texto. No debe utilizarse para tareas de generación de lenguaje.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/sun-robot/smolvla_amazinghand_rps)
- [Paper de SmolVLA (arXiv)](https://arxiv.org/abs/2506.01844)
- [Blog de Hugging Face sobre SmolVLA](https://huggingface.co/blog/smolvla)
- [Colección SmolVLA en Hugging Face](https://huggingface.co/collections/lerobot/smolvla-683c072ec3ef6ab0fcb87e60)
- [Repositorio de LeRobot en GitHub](https://github.com/zyqdragon/lerobot_smolvla)
