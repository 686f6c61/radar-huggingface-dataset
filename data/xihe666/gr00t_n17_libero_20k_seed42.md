# Xihe666/gr00t_n17_libero_20k_seed42

## Resumen

Este modelo es una política de control robótico basada en GR00T N1.7, el modelo fundacional de NVIDIA para razonamiento y habilidades en robots humanoides. Ha sido entrenado sobre el conjunto de datos LIBERO mediante el framework LeRobot, con el objetivo de controlar un brazo robótico Panda mediante instrucciones en lenguaje natural y observaciones visuales. El modelo emplea un backbone Cosmos-Reason2/Qwen3-VL junto con un transformer de acciones basado en flow matching, lo que permite predecir movimientos articulares a partir de visión, lenguaje y propiocepción.

Con 3.144 millones de parámetros (aproximadamente 3,1 mil millones), este modelo representa una versión compacta del GR00T N1.7, diseñada para entornos de simulación como LIBERO. Su relevancia actual radica en la creciente demanda de modelos de visión-lenguaje-acción (VLA) reproducibles y de código abierto, y en la integración nativa con el ecosistema LeRobot, que facilita la experimentación y el despliegue en robots reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (backbone Cosmos-Reason2/Qwen3-VL + action transformer con flow matching) |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible (no se especifica si es MoE; probablemente denso) |
| Longitud de contexto | no disponible (modelo de control robótico, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo safetensors, sin cuantización publicada) |
| Idiomas soportados | no disponible (aunque el backbone Qwen3-VL es multilingüe, no se especifica en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GR00T N1.7 de NVIDIA, que combina un backbone multimodal (Cosmos-Reason2/Qwen3-VL) para procesar observaciones visuales y lenguaje natural, y un action transformer basado en flow matching para generar secuencias de acciones. Las observaciones incluyen dos imágenes de 256x256 píxeles y un vector de estado propioceptivo de 8 dimensiones, y el modelo produce una acción de 7 dimensiones (espacio de la articulación del robot Panda).

El entrenamiento se realizó con LeRobot (versión 0.6.1) sobre el dataset LIBERO, que contiene 1.693 episodios y 273.465 frames a 10 FPS. Se utilizaron 20.000 pasos de entrenamiento, un tamaño de lote de 32, el optimizador AdamW y una tasa de aprendizaje de 1e-4. El conjunto de datos cubre tareas de manipulación variadas, como colocar objetos en platos, abrir cajones, recoger y colocar objetos en cestas, entre otras.

## Capacidades

- Control de un robot Panda mediante instrucciones en lenguaje natural (p. ej., "pon el tazón negro en el plato").
- Procesamiento de dos cámaras simultáneas (imagen e imagen2) con resolución 256x256.
- Predicción de acciones articulares de 7 grados de libertad a partir de observaciones visuales y estado del robot.
- Aprendizaje por imitación de políticas de manipulación en entornos de simulación (LIBERO).
- Integración nativa con LeRobot, lo que permite reutilizar el modelo en pipelines de entrenamiento y evaluación.
- Capacidad de generalización dentro del dominio de LIBERO (tareas de manipulación en mesa con objetos comunes).

## Casos de uso

- Control de un robot Panda en simulación: el modelo puede ejecutarse directamente en el entorno LIBERO para realizar tareas de manipulación como apilar objetos, abrir cajones o colocar artículos en cestas.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar técnicas de imitación, generalización a partir de pocos episodios o transferencia entre entornos.
- Desarrollo de pipelines de visión-lenguaje-acción: permite probar arquitecturas VLA en un entorno reproducible y con bajo coste computacional.
- Benchmarking de políticas robóticas: puede compararse con otras políticas de LIBERO para evaluar el rendimiento de diferentes métodos de entrenamiento.
- Prototipado de aplicaciones de robótica doméstica: aunque está entrenado en simulación, puede adaptarse a entornos reales mediante fine-tuning con datos de demostraciones reales.
- Educación y formación en robótica: sirve como ejemplo didáctico para enseñar el flujo de entrenamiento de políticas robóticas con LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas de éxito en LIBERO, ni comparaciones con otros modelos VLA.

## Requisitos de hardware

- VRAM estimada para inferencia: con los pesos en fp16 (aproximadamente 6,3 GB), se necesita una GPU con al menos 8 GB de VRAM. En fp32 (12,6 GB) se requiere al menos 16 GB.
- GPU recomendadas: para inferencia con LeRobot, una GPU NVIDIA con 8-12 GB de VRAM (p. ej., RTX 3060, RTX 4060, RTX 4070) es suficiente para fp16. Para entrenamiento, se recomienda al menos 16 GB (RTX 4080, A100).
- Si cabe en consumer GPU: sí, con cuantización fp16 o int8 se puede ejecutar en tarjetas de gama media (RTX 3060 con 12 GB).
- Opciones de despliegue: se integra con LeRobot (pipelines de rollout y entrenamiento). No se mencionan soportes para vLLM, llama.cpp, TGI u otros, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada. El modelo se puede comparar con otros VLA como OpenVLA (7B) o RT-2, pero no se tienen datos específicos de rendimiento ni licencias para establecer una comparación cuantitativa. Se recomienda consultar la documentación de LeRobot para más contextos.

## Limitaciones y advertencias

- El modelo se ha entrenado exclusivamente en el entorno de simulación LIBERO; su generalización a entornos reales requiere fine-tuning con datos de demostración del robot objetivo.
- No se han publicado métricas de rendimiento, por lo que la calidad de las predicciones no está cuantificada.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que el dataset LIBERO y el backbone Qwen3-VL cumplan con sus respectivas licencias.
- El modelo está diseñado para el robot Panda con dos cámaras y un espacio de acción de 7 grados de libertad; no es directamente aplicable a otros robots sin adaptación.
- Puede presentar sesgos en las tareas aprendidas, especialmente en la manipulación de objetos específicos o configuraciones de la mesa no presentes en el dataset.
- Al ser un modelo de robótica, no es adecuado para tareas de generación de texto o lenguaje general.

## Enlaces

- HuggingFace: https://huggingface.co/Xihe666/gr00t_n17_libero_20k_seed42
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Guía LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Dataset LIBERO: https://huggingface.co/datasets/lerobot/libero
- Isaac-GR00T (NVIDIA): https://github.com/NVIDIA/Isaac-GR00T
