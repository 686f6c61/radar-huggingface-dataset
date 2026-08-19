# yannnnnn6/scooping-smolvla-v2

## Resumen

El modelo `yannnnnn6/scooping-smolvla-v2` es un fine-tune del modelo SmolVLA, un vision-language-action (VLA) compacto de 450 millones de parámetros desarrollado por Hugging Face. Este fine-tune está entrenado específicamente para la tarea robótica de "scooping" (recoger o palear objetos), utilizando el dataset `yannnnnn6/scooping-all-merged` y la librería LeRobot. El modelo se publica bajo licencia Apache-2.0 y está diseñado para desplegarse en hardware de consumo, lo que lo hace accesible para laboratorios y desarrolladores con recursos limitados.

La relevancia de este modelo radica en que demuestra cómo un VLA generalista y ligero puede adaptarse a una tarea manipulativa concreta mediante fine-tuning con pocos datos, manteniendo un coste computacional reducido. Al estar basado en SmolVLA, hereda su arquitectura eficiente y su capacidad de procesamiento multimodal (visión, lenguaje y acciones), pero especializado en el comportamiento de scooping. El modelo está disponible en Hugging Face con formato safetensors y se integra con el ecosistema LeRobot para entrenamiento, evaluación e inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (Vision-Language-Action, transformer multimodal) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantización publicada) |
| Idiomas soportados | no disponible (probablemente inglés, pero no especificado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-language-action que combina un codificador de visión, un modelo de lenguaje y un "action expert" que genera comandos de actuación para el robot. La arquitectura exacta no se detalla en la información proporcionada, pero se sabe que es un transformer multimodal con 450 millones de parámetros, diseñado para ser eficiente y ejecutable en GPUs de consumo. El fine-tune se realizó con LeRobot, una librería de Hugging Face para aprendizaje por imitación en robótica, utilizando el dataset `yannnnnn6/scooping-all-merged`. No se especifican los detalles del entrenamiento (número de tokens, épocas, técnica de alineación como RLHF o DPO), pero al ser un fine-tune de SmolVLA, hereda el entrenamiento base del modelo original.

## Capacidades

- Generación de acciones robóticas: el modelo produce comandos de actuación (posición, velocidad, par) a partir de observaciones visuales (múltiples cámaras) y del estado sensorimotor del robot.
- Comprensión de instrucciones en lenguaje natural: puede interpretar comandos como "recoge el objeto" o "palear hacia la izquierda" para condicionar las acciones.
- Procesamiento multimodal: integra visión (imágenes de cámaras) y lenguaje para generar acciones.
- Especialización en tarea de scooping: el fine-tune está optimizado para la manipulación con cuchara o pala, probablemente en entornos de mesa o bandeja.
- Integración con LeRobot: soporta entrenamiento, evaluación e inferencia mediante la CLI de LeRobot (`lerobot-train`, `lerobot-record`).
- Despliegue en hardware de consumo: al ser un modelo de 450M parámetros, es viable en GPUs como RTX 3090 o superiores.

## Casos de uso

- Automatización de tareas de recogida en laboratorios: el modelo puede controlar un brazo robótico para recoger objetos pequeños (tornillos, piezas) de una superficie, útil en entornos de investigación o líneas de montaje.
- Manipulación de alimentos en cocinas robóticas: el scooping es una tarea común en robótica culinaria, por ejemplo, servir arroz o verduras de un recipiente a otro.
- Pruebas de concepto en robótica educativa: estudiantes e investigadores pueden usar este modelo como base para experimentar con fine-tuning de VLA en tareas específicas sin necesidad de grandes recursos.
- Evaluación de políticas de imitación: sirve como ejemplo de cómo adaptar un VLA generalista a una tarea concreta con LeRobot, permitiendo comparar el rendimiento con el modelo base.
- Desarrollo de asistentes robóticos para personas con movilidad reducida: la capacidad de recoger objetos con una cuchara podría aplicarse en ayudas domésticas.
- Investigación en aprendizaje por imitación: el modelo y su dataset asociado pueden utilizarse para estudiar la transferencia de habilidades y la robustez de los VLA en tareas de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este fine-tune en la información disponible. El modelo base SmolVLA presenta resultados en el paper (arXiv:2506.01844) comparables a otros VLA de mayor tamaño, pero no se dispone de los números concretos en la documentación consultada. Para evaluar este modelo, se recomienda ejecutar la evaluación estándar de LeRobot sobre el dataset de scooping.

## Requisitos de hardware

- VRAM estimada: al tener 450M parámetros, en FP32 ocuparía ~1.8 GB, pero con safetensors y posiblemente en FP16 o BF16, el uso de VRAM sería inferior a 1 GB para los pesos. Sin embargo, la inferencia de un VLA requiere además memoria para las activaciones de visión y lenguaje, por lo que se estima un mínimo de 6-8 GB de VRAM en la práctica.
- GPU recomendadas: RTX 3060 (12 GB) o superior, RTX 4090, A100, H100. Es viable en GPUs de consumo con al menos 8 GB de VRAM.
- Despliegue: compatible con LeRobot, que usa PyTorch. Se puede ejecutar con `lerobot-record` para inferencia en robots SO-100 u otros compatibles. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que es un modelo de robótica con pipeline propio.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos específicos para este fine-tune. Como referencia, el modelo base SmolVLA (450M parámetros) compite con OpenVLA (7B parámetros) y RT-2 (55B parámetros) en tareas de manipulación, pero con un coste computacional mucho menor. Sin embargo, no se proporcionan números de rendimiento en la información disponible para hacer una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo entrenado con datos de demostración, puede presentar comportamientos erráticos en situaciones no vistas durante el entrenamiento. No se ha evaluado su robustez ante variaciones de iluminación, textura o disposición de objetos.
- Limitaciones de contexto: al ser un VLA, su capacidad de razonamiento de largo plazo está limitada por la ventana de contexto del modelo de lenguaje subyacente, aunque no se especifica el tamaño.
- Especialización limitada: el fine-tune está diseñado exclusivamente para scooping; no es un modelo generalista y su rendimiento en otras tareas será deficiente.
- Dependencia del hardware robótico: el modelo está entrenado para un robot específico (probablemente SO-100) y puede no transferirse directamente a otros brazos sin reentrenamiento.
- Licencia: Apache-2.0 permite uso comercial, pero se debe verificar la licencia del dataset `yannnnnn6/scooping-all-merged`, que no se especifica.
- Datos de entrenamiento: no se detalla la composición del dataset (número de episodios, variedad de escenarios), lo que dificulta evaluar la generalización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yannnnnn6/scooping-smolvla-v2
- Modelo base SmolVLA: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/yannnnnn6/scooping-all-merged
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Documentación de LeRobot para SmolVLA: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Guía de SmolVLA en LeRobot: https://github.com/huggingface/lerobot/blob/main/docs/source/smolvla.mdx
- Blog de SmolVLA: https://github.com/huggingface/blog/blob/main/smolvla.md
- Sitio oficial de SmolVLA: https://smolvla.net/index_en
