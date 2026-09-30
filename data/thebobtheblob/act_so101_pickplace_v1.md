# TheBobTheBlob/act_so101_pickplace_v1

## Resumen

act_so101_pickplace_v1 es una política de control robótico entrenada con ACT (Action Chunking with Transformers), el método de aprendizaje por imitación descrito en el artículo arXiv:2304.13705. La publica el usuario TheBobTheBlob en Hugging Face mediante la librería LeRobot, y su pipeline declarado es "robotics", no generación de texto.

El modelo no es un modelo de lenguaje: es un policy visuomotor que, a partir de observaciones (imágenes de cámara y estado de las articulaciones), predice trozos de acciones ("action chunks") para que un brazo robótico SO-101 ejecute una tarea de pick-and-place. Tiene 51.668.662 parámetros (unos 51,7 millones) y el repositorio ocupa 0,2 GB, con pesos en formato safetensors.

Es relevante ahora porque forma parte del ecosistema LeRobot, que estandariza el entrenamiento, la evaluación y el despliegue de políticas de imitación sobre hardware de bajo coste como el SO-101. El modelo se distribuye con licencia Apache-2.0, aunque el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de una publicación reciente y sin validación comunitaria conocida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con componente CVAE para aprendizaje por imitación |
| Parámetros totales | 51.668.662 (≈ 51,7 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no procesa texto; consume una ventana de observaciones de imagen y estado del robot) |
| Tipos de cuantización | no disponible en la model card; los pesos publicados en safetensors ocupan 0,2 GB, lo que es consistente con precisión fp32 |
| Idiomas soportados | no disponible (no aplica: no procesa lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice secuencias cortas de acciones en lugar de un único paso de control. La arquitectura combina un transformer con un autoencoder variacional condicional (CVAE): el encoder procesa la secuencia de acciones futuras durante el entrenamiento y el decoder genera el chunk de acciones a partir de las observaciones actuales. Esta formulación permite modelar la multimodalidad de las demostraciones humanas (por ejemplo, distintas trayectorias válidas para alcanzar un objeto) sin promediar comportamientos incompatibles. El entrenamiento se realiza sobre datos de teleoperación, y el chunking de acciones reduce el problema de horizonte de crédito y la acumulación de error típica de las políticas paso a paso.

En este caso concreto, el modelo se ha entrenado con LeRobot sobre el dataset TheBobTheBlob/so101_pickplace_v1, asociado a un brazo SO-101. La model card no especifica el número de episodios, el número de frames, la resolución de las cámaras, el número de vistas, la composición exacta del dataset, ni si se aplicó alguna fase de ajuste adicional (RLHF/DPO no aplica en este dominio). Tampoco se documentan innovaciones adicionales más allá de las propias de ACT.

## Capacidades

- Control visuomotor para manipulación: genera comandos de articulaciones para un brazo robótico de 6 grados de libertad más pinza.
- Ejecución de tareas de pick-and-place aprendidas por imitación de demostraciones teleoperadas.
- Predicción de chunks de acciones, lo que permite frecuencias de control más altas que una política que predice un solo paso.
- Uso de entradas multimodales de robótica: imágenes de cámara y estado propioceptivo del robot (dimensiones exactas no disponibles en la model card).
- Integración nativa con LeRobot para entrenamiento (`lerobot-train`) y evaluación/inferencia (`lerobot-record`).
- Soporte de tool calling / function calling: no aplica.
- Soporte de agentes y razonamiento multi-paso en lenguaje natural: no aplica.
- Capacidades multilingües: no aplica.
- Capacidades especiales (modo thinking, visión, audio): no aplica; la "visión" aquí es percepción para control motor, no comprensión de imágenes en el sentido de un modelo vision-language.

## Casos de uso

- Automatización de pick-and-place en prototipos de laboratorio: el policy puede recoger y colocar objetos sobre una mesa de trabajo a partir de demostraciones, lo que permite validar una celda robotizada sin programar trayectorias a mano.
- Evaluación comparativa de políticas de imitación: sirve como checkpoint de referencia para medir éxito de tareas en el brazo SO-101 frente a otras variantes de ACT o Diffusion Policy, usando el flujo `lerobot-record` con `--policy.path`.
- Punto de partida para fine-tuning de tareas nuevas: al ser un ACT de ~51,7 M de parámetros con licencia Apache-2.0, se puede reentrenar sobre un dataset propio de demostraciones si el espacio de observación y acción coincide con el del robot objetivo.
- Educación e investigación en robótica de bajo coste: permite a un laboratorio o a un curso montar un pipeline completo de teleoperación, entrenamiento y despliegue sobre hardware tipo SO-100/SO-101.
- Investigación en sim-to-real y robustez: útil como baseline para estudiar cómo se degrada el éxito de la tarea al cambiar iluminación, fondo o posición inicial de los objetos.
- Integración en bucles de control de tiempo real: al ser un modelo pequeño, puede ejecutarse en la misma máquina que controla el brazo y producir chunks de acciones con latencia baja, lo que reduce la dependencia de infraestructura en la nube.
- Generación de datos etiquetados para evaluación: las ejecuciones grabadas con `lerobot-record` producen datasets etiquetados (`eval_*`) reutilizables para medir tasas de éxito de forma reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye tasa de éxito de la tarea, número de episodios de evaluación, ni comparaciones con otras políticas sobre el mismo dataset. El artículo de referencia (arXiv:2304.13705) reporta resultados de ACT en tareas propias de los autores, pero esos números no son atribuibles a este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB. Con 51,7 M de parámetros, los pesos en fp32 ocupan unos 0,2 GB y en fp16 alrededor de 0,1 GB; el consumo real depende del tamaño de las imágenes de entrada y de los buffers de activaciones.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente, incluidas NVIDIA RTX 3060, RTX 4090, A100 o H100. No se requiere una GPU de gama alta para este tamaño de modelo.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo actual e incluso en GPUs integradas o en placas embebidas tipo Jetson, aunque la latencia dependerá del preprocesado de imagen.
- Inferencia en CPU y Apple Silicon: LeRobot permite seleccionar el dispositivo (`--policy.device`), por lo que la ejecución en CPU o en MPS es viable; no se dispone de cifras de latencia publicadas.
- Opciones de despliegue: LeRobot (`lerobot-train`, `lerobot-record`) sobre PyTorch. vLLM, llama.cpp, Ollama y TGI no aplican, ya que están orientados a modelos de lenguaje y no a políticas de control robótico.
- Latencia y throughput estimados: no disponibles. Como referencia de contexto, los datasets de este tipo de tareas suelen grabarse a 30 FPS, pero la model card no confirma la frecuencia de control ni el tiempo de inferencia de este checkpoint.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / observaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_so101_pickplace_v1 (este modelo) | ACT sobre SO-101 | 51.668.662 | no disponible | Apache-2.0 | Hugging Face, 0 descargas |
| shenlirobot/act_so101_pick_place | ACT sobre SO-101 | no disponible | no disponible | no disponible | Hugging Face |
| Diffusion Policy (familia) | Aprendizaje por imitación con difusión | no disponible | no disponible | no disponible | Implementación en LeRobot |
| SmolVLA (familia) | Vision-Language-Action | no disponible en la información proporcionada | no disponible | no disponible | LeRobot |

La comparación cuantitativa no es posible con los datos disponibles: no se han recuperado las model cards ni los resultados de evaluación de las alternativas, por lo que sus parámetros, contexto y rendimiento figuran como no disponibles.

## Limitaciones y advertencias

- Es una política de imitación, no un modelo generativo de propósito general: no entiende instrucciones en lenguaje natural ni puede razonar sobre tareas que no haya visto en las demostraciones.
- Generalización limitada: el rendimiento depende de que el entorno de despliegue se parezca al de recogida de datos (posición de cámaras, iluminación, fondo, objetos). Cambios en estas condiciones suelen degradar la tasa de éxito.
- Dependencia del hardware: el modelo está vinculado a un robot SO-101 y a un espacio de observación y acción concreto; usarlo con otra morfología o con otro número de cámaras requiere reentrenamiento.
- Riesgo de alucinación: no aplica en el sentido de texto, pero sí existe el riesgo equivalente de generar acciones plausibles y erróneas, con posible colisión o daño físico al robot o al entorno.
- Sesgos: no documentados en la model card; en aprendizaje por imitación, el policy hereda los sesgos y las preferencias del operador que teleoperó las demostraciones.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, y sin métricas de éxito publicadas, por lo que no hay evidencia independiente de que la tarea se resuelva de forma fiable.
- Idiomas: no aplica; el modelo no procesa lenguaje.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte, y el dataset asociado puede tener condiciones propias no detalladas.
- Producción: requiere supervisión humana, mecanismos de parada de emergencia y validación en un entorno controlado antes de cualquier despliegue real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheBobTheBlob/act_so101_pickplace_v1
- Dataset asociado: https://huggingface.co/datasets/TheBobTheBlob/so101_pickplace_v1
- Artículo de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas de imitación: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Política ACT similar sobre SO-101: https://huggingface.co/shenlirobot/act_so101_pick_place
- Experimento ACT con SO-101 en GitHub: https://github.com/mikami235/so101-act-pick-place
- Fork de LeRobot con dataset de pick-and-place sobre SO-101: https://github.com/skr3178/lerobot
- Ficha de directorio de un modelo homónimo: https://essamamdani.com/ai-models/hf-kob0105-act-so101-pickplace
