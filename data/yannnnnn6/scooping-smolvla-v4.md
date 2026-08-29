# yannnnnn6/scooping-smolvla-v4

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, desarrollado por Hugging Face, con 450 millones de parámetros. Este modelo concreto, `yannnnnn6/scooping-smolvla-v4`, es un fine-tuning de la base `lerobot/smolvla_base` sobre un dataset de demostraciones de tareas de "scooping" (recoger con cuchara), entrenado con la librería LeRobot. Está diseñado para desplegarse en hardware de consumo, lo que lo hace accesible para desarrolladores e investigadores de robótica. Su relevancia radica en que permite implementar políticas robóticas de bajo coste computacional sin sacrificar demasiado rendimiento, y su licencia Apache-2.0 facilita su uso comercial y académico.

El modelo se publica con el pipeline de robótica y se integra directamente con el ecosistema LeRobot, lo que simplifica el entrenamiento, la evaluación y la inferencia en robots reales o simulados. Aunque el repositorio no incluye documentación detallada sobre el dataset de entrenamiento, el nombre del dataset (`scooping-all-v2-merged`) sugiere que se compone de demostraciones de manipulación con cuchara, probablemente en entornos de laboratorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basado en SmolVLA; detalles internos no disponibles |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones. La arquitectura interna exacta (número de capas, tipo de atención, etc.) no se detalla en la información proporcionada. El modelo base `lerobot/smolvla_base` fue desarrollado por Hugging Face y se describe como compacto y eficiente, con 450 millones de parámetros, pensado para ejecutarse en GPUs de consumo.

El fine-tuning se realizó con la librería LeRobot sobre el dataset `yannnnnn6/scooping-all-v2-merged`, que contiene demostraciones de tareas de recogida con cuchara. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO. El entrenamiento se llevó a cabo mediante aprendizaje por imitación, como es habitual en políticas robóticas basadas en VLA.

## Capacidades

- Generación de acciones de control para robots, a partir de observaciones visuales y posiblemente instrucciones en lenguaje.
- Procesamiento de imágenes y texto para producir comandos motores (policy).
- Entrenado específicamente para tareas de manipulación con cuchara (scooping), como recoger y transferir objetos.
- Integración nativa con LeRobot, lo que permite cargar el modelo, ejecutar inferencia y registrar episodios de evaluación.
- Compatible con el flujo de trabajo de LeRobot para entrenar desde cero o fine-tuning sobre otros datasets.
- No se han documentado capacidades adicionales como tool calling, agentes o razonamiento multi-paso.

## Casos de uso

- Manipulación robótica en laboratorio: el modelo puede controlar un brazo robótico para realizar tareas de recogida con cuchara, por ejemplo, en entornos de investigación de aprendizaje por imitación.
- Automatización de tareas de preparación de alimentos: en entornos controlados, el modelo podría adaptarse para recoger ingredientes o servir porciones, aunque requiere validación adicional.
- Prototipado rápido de políticas robóticas: gracias a su tamaño reducido, se puede desplegar en GPUs de consumo (como RTX 3060 o superiores) para iterar rápidamente en el desarrollo de nuevas tareas.
- Investigación en VLA: sirve como punto de partida para estudiar el comportamiento de modelos compactos en robótica, comparándolo con alternativas más grandes.
- Evaluación de algoritmos de control: al integrarse con LeRobot, permite comparar diferentes políticas en el mismo hardware y entorno.
- Educación y formación: su licencia abierta y su bajo requisito de hardware lo hacen adecuado para cursos de robótica e IA, donde los estudiantes pueden entrenar y evaluar políticas sin necesidad de infraestructura costosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K, ni de evaluaciones específicas de robótica (tasa de éxito en tareas de manipulación). El autor no ha incluido comparativas con otros modelos en la model card.

## Requisitos de hardware

- El modelo tiene 450 millones de parámetros, lo que sugiere que puede ejecutarse en GPUs con al menos 4-6 GB de VRAM, aunque no se proporciona una cifra exacta.
- Está diseñado para hardware de consumo, según la descripción de SmolVLA.
- Se puede desplegar mediante LeRobot, que soporta GPUs NVIDIA con CUDA.
- No se indican opciones de cuantización ni herramientas específicas como vLLM, llama.cpp u Ollama; el flujo principal es a través de LeRobot.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos VLA en la información proporcionada. SmolVLA se posiciona como una alternativa compacta frente a modelos más grandes como OpenVLA (7B parámetros) o RT-2 (55B parámetros), pero no hay métricas de rendimiento que permitan una comparación cuantitativa. La ventaja principal es su menor coste computacional y su capacidad para ejecutarse en hardware de consumo.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para tareas de "scooping" y puede no generalizar bien a otras tareas de manipulación sin un fine-tuning adicional.
- No se han documentado sesgos específicos, pero al ser un modelo de robótica, su comportamiento depende en gran medida de la calidad y diversidad del dataset de demostraciones.
- Existe riesgo de alucinación en la generación de acciones si las observaciones difieren significativamente de los datos de entrenamiento.
- No se especifica la longitud de contexto, lo que limita la capacidad de manejar secuencias largas de instrucciones o historial de observaciones.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar la atribución y las condiciones de la licencia del modelo base y del dataset.
- No se proporcionan garantías de rendimiento en entornos reales; se recomienda validar en el robot objetivo antes de su uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yannnnnn6/scooping-smolvla-v4
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Sitio web de SmolVLA: https://smolvla.net/index_en
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Ejemplo de uso de SmolVLA con LeRobot: https://github.com/huggingface/lerobot/blob/main/examples/tutorial/smolvla/using_smolvla_example.py
- Dataset de entrenamiento: https://huggingface.co/datasets/yannnnnn6/scooping-all-v2-merged
