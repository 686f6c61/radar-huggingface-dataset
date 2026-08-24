# wlhong/act_pickup_red_23aug

## Resumen

El modelo `act_pickup_red_23aug` es una política de control robótico basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias de acciones en lugar de pasos individuales. Ha sido desarrollado por el usuario wlhong y entrenado con el framework LeRobot de Hugging Face, sobre un conjunto de datos de teleoperación de 50 episodios que capturan la tarea de recoger un objeto rojo y depositarlo sobre una silla.

El modelo emplea una arquitectura transformer con 51,7 millones de parámetros, que consume una imagen de cámara (640x480 píxeles) y un vector de estado del robot de 6 dimensiones, y produce un chunk de acciones de 6 dimensiones. Su relevancia radica en que representa un ejemplo práctico de política de imitación para manipulación robótica real, reproducible con el ecosistema LeRobot y publicada bajo licencia Apache 2.0, lo que facilita su uso y adaptación en entornos de investigación y desarrollo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Action Chunking with Transformers, ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa chunks de acciones de longitud fija) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | No aplica (modelo de control robótico, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación basado en transformers que predice bloques de acciones (action chunks) de longitud fija a partir de observaciones actuales, en lugar de predecir una sola acción por paso. La arquitectura utiliza un codificador de visión para procesar la imagen de la cámara y un codificador de estado para el vector de 6 dimensiones del robot, fusionando ambas entradas para generar la secuencia de acciones de salida.

El entrenamiento se realizó con el optimizador AdamW, una tasa de aprendizaje de 1e-5, tamaño de lote 8, y se ejecutaron 30.000 pasos con semilla 1000. El dataset de entrenamiento contiene 29.285 frames (aproximadamente 16 minutos de grabación a 30 FPS) de teleoperación de la tarea "Pick up the red object and put on chair". No se emplearon técnicas de refuerzo ni ajuste fino por preferencias humanas; es un entrenamiento de imitación supervisada pura.

## Capacidades

- Control de robot manipulador para tareas de pick-and-place, a partir de observaciones de cámara y estado propioceptivo.
- Generación de secuencias de acciones de 6 dimensiones (posiciones y orientaciones del efector final) con una ventana de predicción múltiple (chunking).
- Integración con el ecosistema LeRobot, que permite cargar y ejecutar la política en hardware real o simuladores compatibles.
- Robustez a variaciones en la posición de objetos gracias al entrenamiento con múltiples episodios de teleoperación.
- Capacidad de despliegue en tiempo real con el comando `lerobot-rollout`, que gestiona la comunicación con el robot y las cámaras.
- No incluye capacidades de tool calling, agentes ni procesamiento de lenguaje natural; está especializado únicamente en control robótico visual.

## Casos de uso

- **Manipulación robótica en laboratorio**: el modelo puede ejecutar tareas de recoger y colocar objetos en posiciones definidas, útil para automatizar experimentos que requieren manipulación repetitiva de muestras.
- **Control de robots de bajo coste**: gracias a su tamaño compacto (51,7 M de parámetros), puede ejecutarse en GPU de gama media o incluso CPU, facilitando su uso en robots tipo "so_follower" con hardware asequible.
- **Prototipado de nuevas tareas**: al ser entrenado con teleoperación, se puede reentrenar rápidamente con nuevos episodios para adaptar la política a tareas similares, como mover objetos de otros colores o a otras ubicaciones.
- **Investigación en aprendizaje por imitación**: sirve como caso de estudio para comparar el rendimiento de ACT frente a otros métodos de imitación, dado que su entrenamiento y evaluación están documentados y reproducibles con LeRobot.
- **Educación en robótica**: permite a estudiantes y desarrolladores experimentar con políticas de imitación en un entorno real o simulado, siguiendo la guía de LeRobot para entrenar y desplegar el modelo.
- **Integración en líneas de producción**: aunque la tarea es específica, la arquitectura puede adaptarse a tareas de ensamblaje o clasificación de piezas, siempre que se reentrene con datos de teleoperación del proceso correspondiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No existen datos de éxito en tareas concretas, ni comparaciones con otros modelos en la documentación.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al tratarse de un modelo de 51,7 M de parámetros, la inferencia en fp32 requiere aproximadamente 200 MB de memoria para los pesos, aunque el procesamiento de imágenes y el transformer pueden elevar el uso total a 1-2 GB. Es compatible con GPU de consumo.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3060) es suficiente para la inferencia; el entrenamiento requiere algo más de memoria, recomendándose al menos 8 GB (RTX 3070, RTX 4060).
- **Ejecución en consumer GPU**: sí, cabe en la mayoría de GPU de consumo actuales, tanto para inferencia como para entrenamiento con batch size reducido.
- **Opciones de despliegue**: el modelo se ejecuta mediante el framework LeRobot, que proporciona los comandos `lerobot-rollout` y `lerobot-train`. No es compatible con vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: no se han publicado medidas de latencia específicas. En una GPU moderna, se espera una frecuencia de control de al menos 10-20 Hz, suficiente para tareas de manipulación robótica de baja velocidad.

## Comparativa con modelos similares

No se dispone de información pública sobre modelos comparables en el mismo repositorio o en la documentación de LeRobot que permita una comparación cuantitativa. En la categoría de políticas de imitación para robótica, existen otros métodos como Diffusion Policy o RT-1, pero no se han encontrado datos de estos modelos entrenados sobre la misma tarea y con el mismo hardware. Por tanto, no se puede realizar una comparativa objetiva con datos fiables.

## Limitaciones y advertencias

- **Generalización limitada**: el modelo fue entrenado para una tarea específica (recoger objeto rojo y colocarlo en una silla) y puede fallar si el objeto, la posición de la silla o la iluminación cambian significativamente respecto al dataset de entrenamiento.
- **Riesgo de acciones no deseadas**: como toda política de imitación, puede generar acciones imprevistas en situaciones fuera de distribución, lo que es crítico en entornos con personas o equipos frágiles.
- **Dependencia de la calibración**: el rendimiento depende de la calibración exacta de la cámara y del robot; cualquier cambio en la configuración física requiere reentrenamiento o recalibración.
- **Sin evaluación publicada**: al no existir resultados de evaluación en robot real, no se conoce la tasa de éxito real en condiciones de producción.
- **Restricciones de licencia**: aunque la licencia Apache 2.0 permite uso comercial, el modelo depende de LeRobot y de la arquitectura ACT, cuyos componentes pueden tener licencias adicionales que deben revisarse.
- **Idiomas y contexto**: el modelo no procesa texto ni instrucciones; no es adecuado para aplicaciones fuera del control robótico visual.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/wlhong/act_pickup_red_23aug)
- [Dataset de entrenamiento](https://huggingface.co/datasets/wlhong/pickup-red-to-chair-23aug_20260823_115200)
- [Paper de ACT (Action Chunking with Transformers)](https://huggingface.co/papers/2304.13705)
- [Repositorio LeRobot](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot para ACT](https://huggingface.co/docs/lerobot/main/en/act)
