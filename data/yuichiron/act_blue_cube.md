# Yuichiron/act_blue_cube

## Resumen

Yuichiron/act_blue_cube es un modelo de robótica basado en Action Chunking with Transformers (ACT), una técnica de aprendizaje por imitación desarrollada por el equipo de LeRobot de Hugging Face. ACT predice secuencias cortas de acciones (action chunks) en lugar de acciones individuales, lo que permite al robot ejecutar tareas complejas de manipulación con alta tasa de éxito. Este modelo concreto está entrenado para la tarea de recoger un cubo azul y colocarlo en un bol naranja, utilizando un robot tipo `so_follower` con una cámara frontal.

El modelo fue entrenado con LeRobot, la librería de Hugging Face para robótica, sobre un dataset de 30 episodios teleoperados (13.888 fotogramas a 30 FPS). Su arquitectura transformer ligera, con 40,68 millones de parámetros, lo hace apto para inferencia en tiempo real en GPUs de consumo. Está publicado bajo licencia Apache-2.0, lo que permite uso comercial y modificación sin restricciones significativas. Su relevancia actual reside en ser un ejemplo práctico de cómo aplicar aprendizaje por imitación en robótica con herramientas open source.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Action Chunking with Transformers, ACT) |
| Parametros totales | 40.668.358 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (modelo de robinaje, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo usa la arquitectura ACT (Action Chunking with Transformers), descrita en el paper arxiv:2304.13705. Se basa en un transformer encoder-decoder que recibe como entrada el estado del robot (6 dimensiones) y una imagen RGB de la cámara frontal (480×640 píxeles), y genera una secuencia de acciones de 6 dimensiones (posiciones del efector final). La innovación clave de ACT es predecir bloques de acciones (chunks) en lugar de acciones individuales, lo que reduce la acumulación de errores y mejora la estabilidad del movimiento.

El entrenamiento se realizó con el dataset Yuichiron/so101_blue_cube_to_bowl_20260823_171828, que contiene 30 episodios teleoperados de la tarea de recoger el cubo azul y colocarlo en el bolsa naranja. Se usaron 20.000 pasos de entrenamiento con batch de 8, optimizador AdamW, learning rate de 1e-5 y semilla 1000. No se aplicó RLHF ni DPO; es un entrenamiento de aprendizaje por imitación supervisado puro, con normalización de imágenes y estados.

## Capacidades

- Control robótico por imitación: aprende a replicar trayectorias de teleoperación en un robot real.
- Percepción visual: procesa imágenes RGB de 480×640 para identificar objetos y su posición.
- Generación de acciones multi-step: predice secuencias de acciones (chunks) que permiten movimientos fluidos y precisos.
- Adaptación a variaciones: puede generalizar a posiciones ligeramente diferentes de los objetos si el entrenamiento fue variado (aunque el dataset es limitado).
- Integración con LeRobot: compatible con el pipeline de rollout y entrenamiento de LeRobot, incluyendo `lerobot-rollout` y `lerobot-train`.
- Sin capacidades de texto, visión general o razonamiento: es un modelo puramente motor, no multimodal.

## Casos de uso

- Automatización de tareas de pick-and-place en laboratorios: el modelo puede recoger un objeto conocido (cubo azul) y colocarlo en una ubicación fija (bolsa naranja), útil en entornos de investigación de robótica.
- Prototipado rápido de políticas de imitación: investigadores pueden entrenar y evaluar ACT con este modelo de referencia antes de adaptarlo a sus propios datasets.
- Benchmarking de hardware robótico: se puede usar para medir la precisión de un robot `so_follower` y sus cámaras, ya que el modelo está optimizado para ese hardware.
- Enseñanza de robótica y aprendizaje por imitación: sirve como ejemplo de cómo entrenar un modelo ACT con LeRobot, documentado en los tutoriales oficiales.
- Verificación de pipelines de despliegue: permite probar el flujo completo de LeRobot (entrenamiento, rollout, evaluación) en un entorno controlado antes de escalar a tareas más complejas.
- Reproducibilidad en investigación: al estar bajo licencia Apache-2.0 y con el dataset público, otros investigadores pueden reproducir los resultados y comparar variantes del algoritmo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que no hay resultados de evaluación en el robot real ("No evaluation results have been provided for this policy yet"). No se proporcionan métricas de éxito, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: con 40,68 millones de parámetros, la inferencia requiere menos de 1 GB de VRAM (el modelo pesa ~0,2 GB en safetensors). Puede ejecutarse en cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1050 Ti, RTX 2060, Jetson Nano). No requiere GPUs de servidor como A100 o H100.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama de entrada y en plataformas embebidas como Jetson.
- Opciones de despliegue: LeRobot ofrece el comando `lerobot-rollout` para ejecutar el modelo en el robot; también se puede usar el pipeline de LeRobot con PyTorch. No se menciona soporte para vLLM, Ollama ni llama.cpp (no es un modelo de texto).
- Latencia y throughput: no disponible, pero al ser un modelo pequeño y con imágenes de 480×640, la inferencia debería ser de decenas de milisegundos en una GPU consumer.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yuichiron/act_blue_cube | 40,68 M | no disponible | pick-and-place (cubo azul a bolsa naranja) | Apache-2.0 | Hugging Face |
| kmym2/act_blue_cube | no disponible | no disponible | Pick-and-place (misma tarea) | Apache-2.0 | Hugging Face |
| Kiki3773/act_blue_cube_100k | no disponible | no disponible | Pick-and-place (misma tarea, con 100k pasos de entrenamiento) | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos. La diferencia principal es el número de pasos de entrenamiento (el de Kiki3773 tiene 100k pasos, mientras que este tiene 20k), lo que podría afectar a la precisión, pero no hay métricas publicadas.

## Limitaciones y advertencias

- Sesgos: al ser un modelo de robinica, no tiene sesgos de lenguaje, pero sí limitaciones por el dataset: solo se entrenó con un único objeto (cubo azul) y un único contenedor (bolsa naranja), por lo que no generalizará a otros objetos o colores.
- Riesgo de alucinación: en robótica, el equivalente es la generación de acciones no seguras o fallidas cuando el objeto está fuera del campo de visión o en posiciones inusuales. No hay garantías de seguridad.
- Limitaciones de contexto: la tarea es específica y el modelo no puede adaptarse a cambios en la escena (iluminación, posiciones, distractores) sin reentrenamiento.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificación, pero el usuario debe cumplir con las condiciones de la licencia (incluir aviso de copyright y cambios).
- Caveat de producción: el modelo no ha sido evaluado en el robot real según la model card. Antes de usarlo en producción, es necesario validar su tasa de éxito en el hardware objetivo y considerar el riesgo de daños al robot o al entorno.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Yuichiron/act_blue_cube
- Paper ACT (Action Chunking with Transformers): https://arxiv.org/abs/2304.13705
- Dataset de entrenamiento: https://huggingface.co/datasets/Yuichiro/so101_blue_cube_to_bowl_20260823_171828
- LeRobot (librería): https://github.com/huggingface/lerobot
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Guía de rollout: https://huggingface.co/docs/lerobot/main/en/inference
