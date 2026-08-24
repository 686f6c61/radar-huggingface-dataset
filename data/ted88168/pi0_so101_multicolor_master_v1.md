# ted88168/pi0_so101_multicolor_master_v1

## Resumen

El modelo `ted88168/pi0_so101_multicolor_master_v1` es un fine-tuning del modelo base `lerobot/pi0_base`, desarrollado por el usuario `ted88168` dentro del ecosistema LeRobot de Hugging Face. Se trata de una política robótica Vision-Language-Action (VLA) entrenada para controlar un brazo robótico SO-101 (tipo `so_follower`) en tareas de pick-and-place de bloques de colores. El modelo interpreta instrucciones en lenguaje natural y observaciones visuales de tres cámaras para generar comandos de acción de 6 grados de libertad.

Este checkpoint concreto se ha entrenado sobre el dataset `ted88168/so101_multicolor_master_v1`, que contiene 243 episodios con 175.923 frames a 30 FPS, cubriendo tres tareas específicas: recoger bloques rojo, azul o verde y colocarlos en una caja. Con 4.028 millones de parámetros, este modelo se posiciona como una solución práctica para experimentación robótica en entornos de laboratorio, aprovechando la arquitectura generalista de pi0 adaptada a una tarea concreta mediante fine-tuning.

La relevancia de este modelo radica en que demuestra el flujo completo de entrenamiento de políticas VLA con LeRobot sobre hardware accesible (SO-100), usando una licencia Apache-2.0 que permite uso comercial y modificación. Es un ejemplo de aplicación de la metodología de imitación learning para robots de bajo coste, con una ventana de contexto visual de 224x224 píxeles por cámara.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en pi0 (transformer multimodal) |
| Parametros totales | 4.028.019.472 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | No disponible (se distribuye en safetensors de precisión completa) |
| Idiomas soportados | No disponibles (instrucciones en inglés en el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura pi0 (π₀) desarrollada por Physical Intelligence, una política VLA generalista que combina un codificador visual, un módulo de lenguaje y un decodificador de acciones. La implementación de LeRobot adapta el código de su repositorio OpenPI. La política procesa tres flujos visuales (cámara base y dos cámaras de muñeca, todas a 224x224 píxeles) junto con un vector de estado de 32 dimensiones, y produce una acción de 6 dimensiones (posición y orientación del efector final).

El entrenamiento se realizó mediante fine-tuning del modelo base `lerobot/pi0_base` sobre el dataset `ted88168/so101_multicolor_master_v1`, que contiene 243 episodios de demostración de pick-and-place de bloques de colores. La configuración de entrenamiento incluye 20.000 pasos con batch size de 48, optimizador AdamW con learning rate de 2.5e-5 y seed 1000, utilizando la versión 0.6.2 de LeRobot. No se menciona en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación; se trata de un fine-tuning supervisado por imitación directa de las demostraciones.

## Capacidades

- Generación de acciones robóticas: produce comandos de 6 grados de libertad (posición y orientación) para el brazo SO-101.
- Comprensión de lenguaje natural: interpreta instrucciones simples como "Pick up the red block and place it in the box".
- Percepción visual multi-cámara: procesa tres flujos de imagen simultáneos (base, muñeca izquierda y muñeca derecha) a 224×224.
- Seguimiento de tareas específicas: entrenado para tres variantes de pick-and-place con bloques de colores distintos.
- Integración con LeRobot: compatible con el pipeline de rollout y entrenamiento de la librería.
- Control de robot en tiempo real: genera acciones a 30 FPS, acorde con la frecuencia de captura de las cámaras.

## Casos de uso

- Automatización de pick-and-place en entornos de laboratorio: el modelo puede controlar un brazo SO-100 para clasificar bloques de colores en una caja, útil para experimentos de manipulación robótica.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el fine-tuning de políticas VLA sobre tareas específicas, permitiendo reproducir el flujo completo de LeRobot.
- Educación robótica: en entornos universitarios o de formación técnica, permite demostrar el ciclo completo de captura de datos, entrenamiento y despliegue de una política robótica.
- Desarrollo de prototipos de automatización de bajo coste: el SO-100 es un brazo asequible, y este modelo ofrece una base para construir aplicaciones de clasificación o manipulación de objetos.
- Benchmarking de políticas VLA: se puede comparar el rendimiento de este fine-tuning con el modelo base pi0 en tareas de manipulación para evaluar la eficacia del fine-tuning específico.
- Experimentación con integración de cámaras: al usar tres cámaras, permite explorar cómo la información visual distribuida afecta al rendimiento en tareas de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que "No evaluation results have been provided for this policy yet". No se dispone de métricas como tasa de éxito en tareas reales o comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.028 millones de parámetros en precisión completa (fp32), se necesitan aproximadamente 16 GB de VRAM para la inferencia. Usando bfloat16, la estimación baja a unos 8 GB.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) o A100 (40/80 GB) son adecuadas para inferencia sin cuantización. Para entrenamiento, se recomienda al menos una A100 de 80 GB o varios GPUs con paralelismo de modelo.
- En GPU de consumo: con cuantización (no disponible en la información) o bfloat16, podría caber en una RTX 3090/4090. En fp32, solo en GPUs de 24 GB o superiores.
- Opciones de despliegue: el modelo se distribuye como política LeRobot, por lo que se ejecuta con `lerobot-rollout` y los scripts de la librería. No hay soporte directo para vLLM, Ollama o llama.cpp, ya que es un modelo de robótica, no de texto.
- Latencia y rendimiento: no hay datos publicados. La frecuencia de acción del modelo es de 30 FPS, lo que sugiere que la inferencia debe completarse en menos de 33 ms por paso, pero no se han medido valores concretos.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Licencia | Uso |
|---|---|---|---|---|
| `ted88168/pi0_so101_multicolor_master_v1` | 4.028 M | VLA pi0 | Apache 2.0 | Pick-and-place en SO-100 |
| `lerobot/pi0_base` | 4.028 M (estimado) | VLA pi0 | Apache 2.0 | Base generalista para robótica |
| `ted88168/pi0_so101_0810_merged` | No disponible | VLA pi0 | Apache 2.0 | Variante de fine-tuning para SO-100 |
| `mizutoukotori/pi0_so101_v2` | No disponible | VLA pi0 | Apache 2.0 | Variante de fine-tuning para SO-100 |

No hay información suficiente para comparar benchmarks entre estos modelos, ya que ninguno publica resultados de evaluación. El modelo se diferencia de `pi0_base` por estar fine-tuneado para una tarea concreta (pick-and-place de bloques de colores) en un robot específico (SO-100), mientras que la base es generalista.

## Limitaciones y advertencias

- Sesgos de datos: el modelo se entrenó únicamente con 243 episodios de demostración de un único robot y entorno. Puede no generalizar a otros robots, posiciones de cámara, iluminación o variaciones de objetos.
- Riesgo de alucinación: como modelo VLA, puede generar acciones inconsistentes o inválidas si las condiciones visuales difieren de las de entrenamiento.
- Limitaciones de contexto: la ventana de contexto visual está fija en 224×224 píxeles por cámara, y el estado del robot se limita a 32 dimensiones. No soporta secuencias de instrucciones complejas o múltiples tareas encadenadas.
- Restricciones de licencia: aunque la licencia Apache 2.0 permite uso comercial, el modelo se basa en pi0_base de Physical Intelligence, cuya licencia original puede tener restricciones adicionales. Se debe verificar el modelo base.
- Dependencia del hardware: el modelo requiere un brazo SO-100 con cámaras específicas (base y muñecas) y un entorno con calibración adecuada. No es un modelo que funcione sin el robot físico.
- Riesgo de seguridad: al ser una política de control físico, la ejecución incorrecta puede causar daños en el entorno o en el robot. Es necesario validar en simulación o con supervisión humana antes de un despliegue autónomo.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/ted88168/pi0_so101_multicolor_master_v1
- Dataset de entrenamiento: https://huggingface.co/datasets/ted88168/so101_multicolor_master_v1
- Modelo base: https://huggingface.co/lerobot/pi0_base
- Blog de pi0 de Physical Intelligence: https://www.physicalintelligence.company/blog/pi0
- Documentación de LeRobot para pi0: https://huggingface.co/docs/lerobot/main/en/pi0
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Repositorio del brazo SO-100: https://github.com/TheRobotStudio/SO-ARM100
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ted88168/so101_multicolor_master_v1
