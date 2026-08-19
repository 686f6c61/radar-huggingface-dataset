# williamdgomez/act_so101_golden_model

## Resumen

El modelo `williamdgomez/act_so101_golden_model` es una política de aprendizaje por imitación para robótica, basada en el método Action Chunking with Transformers (ACT). Fue entrenado con el framework LeRobot de Hugging Face y está diseñado para controlar un brazo robótico SO-101, un manipulador de bajo coste muy utilizado en entornos educativos y de investigación. El modelo aprende a partir de datos teleoperados y predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación.

El desarrollo de este modelo es relevante porque democratiza el acceso a la robótica de aprendizaje: cualquier persona con un brazo SO-101 y un dataset teleoperado puede entrenar y desplegar una política de control con herramientas open source. Con aproximadamente 51,7 millones de parámetros, es un modelo ligero que puede ejecutarse en hardware de consumo, y su licencia Apache-2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no aplica (modelo de control motor) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que combina un codificador de visión con un transformador que predice una secuencia de acciones futuras (chunk) en lugar de una sola acción. Esto reduce el error de acumulación y permite movimientos más suaves y precisos. El modelo se entrena con datos teleoperados, típicamente recopilados mediante un brazo maestro o un joystick, y utiliza una pérdida de regresión sobre las acciones predichas.

El entrenamiento se realizó con LeRobot, la biblioteca de Hugging Face para robótica, que gestiona el dataset, el entrenamiento y la evaluación. El dataset asociado es `williamdgomez/so101_Golden_Model`, aunque no se han publicado detalles sobre el número de episodios, la composición de las tareas ni si se aplicaron técnicas adicionales como aumentación de datos o regularización. No se menciona el uso de RLHF ni DPO, ya que es un modelo de control continuo, no de lenguaje.

## Capacidades

- Control de un brazo robótico SO-101 mediante predicción de chunks de acciones (varios pasos a la vez).
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Ejecución de tareas de manipulación como alcanzar, agarrar, apilar o insertar objetos, dependiendo del dataset de entrenamiento.
- Integración con el ecosistema LeRobot: entrenamiento, evaluación y despliegue mediante comandos CLI.
- Inferencia en tiempo real en GPU de consumo, gracias a su tamaño reducido (~51,7M parámetros).
- No soporta tool calling, generación de texto, visión general ni capacidades multimodales fuera del ámbito robótico.

## Casos de uso

- Investigación en robótica de bajo coste: el modelo permite reproducir experimentos de aprendizaje por imitación en un brazo SO-101 sin necesidad de hardware caro, facilitando la comparación de algoritmos en laboratorios académicos.
- Educación y formación: estudiantes de robótica pueden entrenar y desplegar una política de control completa en una sesión de laboratorio, comprendiendo el flujo de teleoperación, entrenamiento y evaluación.
- Automatización de tareas repetitivas en entornos controlados: por ejemplo, clasificar piezas pequeñas o colocar objetos en posiciones fijas, donde la variabilidad es baja y la precisión es suficiente.
- Prototipado rápido de soluciones de manipulación: empresas pueden validar la viabilidad de un sistema de picking antes de invertir en brazos industriales, usando el SO-101 como banco de pruebas.
- Benchmarking de métodos de imitación: al ser un modelo ACT estándar, sirve como referencia para comparar con otras arquitecturas (diffusion policies, etc.) en el mismo hardware.
- Demostraciones y ferias tecnológicas: el modelo puede ejecutarse en tiempo real para mostrar capacidades de IA robótica en eventos, con un coste de hardware reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de precisión ni comparaciones con otros modelos. Para obtener datos de rendimiento sería necesario evaluar el modelo en el entorno físico o simulado correspondiente.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~51,7M parámetros, la inferencia requiere menos de 1 GB de VRAM en FP32, y mucho menos en FP16 o cuantizado. Cabe en cualquier GPU moderna.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM (GTX 1650, RTX 3050, etc.) es suficiente. También puede ejecutarse en CPU para inferencia no en tiempo real.
- Compatibilidad con GPU de consumo: sí, es un modelo muy ligero que funciona en GPUs de gama baja y media.
- Opciones de despliegue: LeRobot proporciona scripts de evaluación e inferencia (`lerobot-record`). No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependen del hardware y de la frecuencia de control del brazo (típicamente 10-50 Hz en estos sistemas).

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. Existe un modelo muy similar en Hugging Face, `jgreeley/act_so101_golden_model`, que parece entrenado con el mismo dataset o uno equivalente, pero no se han publicado sus especificaciones detalladas. Ambos usan la arquitectura ACT y el framework LeRobot, por lo que se espera un comportamiento comparable. No hay datos públicos de rendimiento para ninguno de los dos.

## Limitaciones y advertencias

- El modelo está especializado en el brazo SO-101 y no es transferible directamente a otros robots sin reentrenamiento o adaptación.
- Su rendimiento depende en gran medida de la calidad y variedad del dataset de teleoperación. Si las demostraciones son escasas o poco representativas, la política fallará en situaciones novedosas.
- No se han documentado sesgos específicos, pero como todo modelo de imitación, puede replicar comportamientos no deseados presentes en los datos de entrenamiento.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí puede ejecutar acciones incorrectas si el contexto visual es ambiguo.
- La licencia Apache-2.0 permite uso comercial, pero el hardware (brazo SO-101) y el dataset asociado pueden tener sus propias restricciones; conviene revisar la licencia del dataset.
- No se proporcionan garantías de seguridad para operación en entornos con personas; es un modelo de investigación y debe usarse con precaución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/williamdgomez/act_so101_golden_model
- Dataset asociado: https://huggingface.co/datasets/williamdgomez/so101_Golden_Model
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Modelo similar (referencia): https://huggingface.co/jgreeley/act_so101_golden_model
