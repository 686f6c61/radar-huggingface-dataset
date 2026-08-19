# ThiennNguyen/act_so101_ft

## Resumen

`ThiennNguyen/act_so101_ft` es un modelo de robótica basado en **Action Chunking with Transformers (ACT)**, un método de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales. El modelo ha sido entrenado con el framework **LeRobot** de Hugging Face y está diseñado para controlar un robot tipo `so_follower` (un seguidor de sobremesa) en una tarea concreta de manipulación: recoger dulces y colocarlos en una cesta. Con solo 51,7 millones de parámetros, es un modelo compacto que consume una imagen de cámara frontal (480×640) y el estado del robot (6 dimensiones) para generar acciones de 6 dimensiones.

La relevancia de este modelo radica en su demostración de cómo entrenar políticas robóticas con pocos datos (33 episodios) y un pipeline estandarizado como LeRobot, lo que permite a desarrolladores e investigadores reproducir y adaptar el entrenamiento a sus propios robots. Al estar licenciado bajo Apache 2.0, su uso comercial es libre, y su pequeño tamaño facilita su despliegue en hardware de bajo coste. Sin embargo, al ser un modelo especializado en una tarea única, su aplicabilidad fuera de ese escenario es limitada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo procesa una imagen y un estado; no usa contexto textual) |
| Tipos de cuantizacion | No disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | No aplica (modelo de robótica, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo implementa **ACT (Action Chunking with Transformers)**, propuesto en el paper [arXiv:2304.13705](https://arxiv.org/abs/2304.13705). ACT combina un codificador de visión (basado en ResNet) con un transformer que genera secuencias de acciones de longitud fija (chunks). Una característica clave es el uso de un **CVAE (Conditional Variational Autoencoder)** que modela la variabilidad de las demostraciones, permitiendo que el modelo genere múltiples trayectorias plausibles para una misma observación. El entrenamiento se realiza mediante aprendizaje por imitación sobre datos teleoperados, sin necesidad de refuerzo ni recompensas explícitas.

El entrenamiento se llevó a cabo con el framework LeRobot (versión 0.6.2) sobre el dataset `ThiennNguyen/record_test_1608`, que contiene 33 episodios y 23.412 fotogramas a 30 FPS de la tarea "pick up sweets and put them in the basket". Se usaron 10.000 pasos de entrenamiento con batch size 64, optimizador AdamW y una tasa de aprendizaje de 1e-6, con semilla 1000. No se mencionan técnicas adicionales como RLHF, DPO ni aumentación de datos.

## Capacidades

- **Manipulación robótica por imitación**: el modelo aprende a ejecutar una tarea de pick-and-place a partir de demostraciones teleoperadas, generando acciones de 6 dimensiones (probablemente posición y orientación del efector final).
- **Percepción visual**: procesa una imagen RGB de 480×640 píxeles de una cámara frontal, junto con el estado del robot (6 valores), para decidir la siguiente acción.
- **Generación de chunks de acción**: a diferencia de políticas que predicen un solo paso, ACT genera secuencias de acciones, lo que reduce la acumulación de errores y mejora la suavidad del movimiento.
- **Robustez a variaciones**: gracias al CVAE, el modelo puede generar distintas trayectorias válidas ante la misma observación, lo que ayuda a generalizar a ligeras variaciones en la posición de los objetos.
- **Sin capacidades de lenguaje ni herramientas**: no soporta tool calling, razonamiento simbólico ni procesamiento de texto; su ámbito es exclusivamente sensoriomotor.

## Casos de uso

- **Automatización de tareas repetitivas en laboratorio**: el modelo puede controlar un brazo robótico para clasificar o recoger objetos pequeños (dulces, piezas, componentes) y depositarlos en contenedores, reduciendo la intervención humana.
- **Prototipado rápido de políticas robóticas**: gracias a LeRobot, este modelo sirve como plantilla para entrenar políticas personalizadas con pocos datos (33 episodios), ideal para validar conceptos en investigación antes de escalar a datasets más grandes.
- **Educación y formación en robótica**: al ser un modelo pequeño y con licencia abierta, puede usarse en cursos universitarios para enseñar aprendizaje por imitación, control de robots y despliegue de políticas en hardware real.
- **Investigación en aprendizaje por imitación**: el modelo y su dataset asociado permiten estudiar el efecto del tamaño del chunk, la arquitectura del transformer o el número de demostraciones en el rendimiento de tareas de manipulación.
- **Integración en sistemas de control industrial**: en entornos de fabricación donde las tareas son altamente repetitivas y los objetos tienen posiciones relativamente fijas, el modelo puede sustituir a la programación manual de trayectorias.
- **Benchmarking de frameworks de robótica**: puede utilizarse como caso de referencia para comparar LeRobot con otros frameworks como robosuite o RLBench, midiendo tiempos de entrenamiento, éxito en tareas reales y consumo de recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). Por tanto, no se dispone de tasas de éxito, métricas de precisión ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 51,7 millones de parámetros, el modelo en float32 ocupa aproximadamente 207 MB; en float16, unos 103 MB. La inferencia en tiempo real (30 FPS) requerirá además memoria para la imagen de entrada (480×640×3) y las activaciones, por lo que se estima un uso total de VRAM entre 1 y 2 GB, dependiendo del framework.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluyendo tarjetas consumer como NVIDIA GTX 1650, RTX 2060, RTX 3060 o superiores. También puede ejecutarse en CPU, aunque con menor rendimiento en tiempo real.
- **Compatibilidad con consumer GPU**: sí, es perfectamente viable en GPUs de gama media y baja.
- **Opciones de despliegue**: al estar integrado en LeRobot, se puede ejecutar con los comandos `lerobot-rollout` y `lerobot-train`. También es posible exportar los pesos a otros formatos (ONNX, TensorRT) para su uso con frameworks de inferencia como vLLM (aunque no es el caso típico para robótica) o directamente con PyTorch.
- **Latencia y throughput estimados**: no disponibles. Dado el tamaño reducido y la entrada de una sola imagen, se espera una latencia de decenas de milisegundos por paso en GPU, suficiente para control en tiempo real a 30 Hz, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThiennNguyen/act_so101_ft | ACT (Transformer + CVAE) | 51,7 M | Imagen + estado (no textual) | Apache-2.0 | Hugging Face |
| Diffusion Policy (Chi et al., 2023) | Denoising Diffusion Probabilistic Model | Varía según backbone (típicamente 10-100 M) | Imagen + estado | MIT (código) | GitHub |
| ACT original (Zhao et al., 2023) | Transformer + CVAE | ~80 M (configuración base) | Imagen + estado | MIT (código) | GitHub |

No se dispone de datos de rendimiento comparativo entre estos modelos para la misma tarea. La comparación se basa en características arquitectónicas y de disponibilidad. ACT y Diffusion Policy son los dos enfoques más populares en aprendizaje por imitación para manipulación; ACT tiende a ser más rápido en inferencia, mientras que Diffusion Policy suele generar trayectorias más suaves pero con mayor coste computacional.

## Limitaciones y advertencias

- **Especialización extrema**: el modelo está entrenado únicamente para la tarea "pick up sweets and put them in the basket" con un robot concreto (`so_follower`) y una cámara frontal. No generalizará a otras tareas, otros robots, otras configuraciones de cámara o entornos significativamente distintos.
- **Datos limitados**: solo 33 episodios de entrenamiento, lo que puede provocar sobreajuste y baja robustez ante variaciones en iluminación, posiciones de objetos o presencia de distractores.
- **Sin evaluación publicada**: no hay resultados de éxito en robot real, por lo que se desconoce su fiabilidad en producción.
- **Riesgo de comportamiento inseguro**: al ser un modelo de control físico, cualquier error puede causar movimientos bruscos o colisiones. Es imprescindible implementar salvaguardas (límites de velocidad, paradas de emergencia) antes de usarlo en entornos reales.
- **Sesgos y alucinación**: no aplican en el sentido de modelos de lenguaje, pero el modelo puede "alucinar" trayectorias inválidas si la observación difiere demasiado del dominio de entrenamiento.
- **Restricciones de licencia**: la licencia Apache-2.0 permite uso comercial sin restricciones, pero no se proporcionan garantías sobre el funcionamiento del modelo. El usuario asume la responsabilidad de su despliegue.
- **Dependencia del ecosistema LeRobot**: para ejecutar el modelo es necesario instalar LeRobot y sus dependencias, lo que puede requerir versiones específicas de Python, PyTorch y librerías de visión.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ThiennNguyen/act_so101_ft)
- [Dataset de entrenamiento](https://huggingface.co/datasets/ThiennNguyen/record_test_1608)
- [Paper de ACT (arXiv:2304.13705)](https://arxiv.org/abs/2304.13705)
- [LeRobot (GitHub)](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Visualizador del dataset](https://huggingface.co/spaces/lerobot/visualize_dataset?path=ThiennNguyen/record_test_1608)
