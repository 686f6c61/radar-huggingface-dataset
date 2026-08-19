# Sumair15/act_pickup_cube_2cam

## Resumen

`Sumair15/act_pickup_cube_2cam` es un modelo de robótica basado en Action Chunking with Transformers (ACT), entrenado mediante aprendizaje por imitación con el framework LeRobot. Desarrollado por el usuario Sumair15, el modelo aprende a ejecutar la tarea de recoger un cubo y colocarlo en una caja utilizando un robot tipo `so_follower` equipado con dos cámaras (lateral y pinza). El método ACT, descrito en el paper arxiv:2304.13705, predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en manipulaciones robóticas.

El modelo cuenta con aproximadamente 51,7 millones de parámetros y se distribuye en formato safetensors, con un tamaño de repositorio de 0,2 GB. Está entrenado sobre un conjunto de datos propio de 26 episodios teleoperados (24.163 fotogramas a 30 FPS) y su licencia Apache 2.0 permite uso comercial sin restricciones. Su relevancia radica en ser un ejemplo práctico de cómo LeRobot facilita el entrenamiento y despliegue de políticas robóticas de imitación con arquitecturas transformer, accesible para la comunidad investigadora y de desarrollo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de robótica; usa ventana de acción, no contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantización publicada) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa ACT, una arquitectura basada en transformers que procesa observaciones multimodales (imágenes de dos cámaras y estado del robot) y genera un chunk de acciones futuras de longitud fija. Esta predicción por bloques reduce la acumulación de errores y permite movimientos más suaves y coordinados en tareas de manipulación. El entrenamiento se realizó con el framework LeRobot (versión 0.6.2) mediante aprendizaje por imitación supervisado sobre datos teleoperados, sin uso de refuerzo ni ajuste por preferencias humanas.

El conjunto de datos de entrenamiento (`Sumair15/pickup_cube_2cam`) contiene 26 episodios con 24.163 fotogramas a 30 FPS, capturados con dos cámaras RGB de 640×480 píxeles. La configuración de entrenamiento incluye 20.000 pasos, tamaño de lote 8, optimizador AdamW con tasa de aprendizaje 1e-5 y semilla 1000. No se reportan técnicas adicionales como decodificación especulativa o atención lineal; el modelo sigue la implementación estándar de ACT en LeRobot.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones (posición y orientación de la pinza) a partir de observaciones visuales y estado.
- Percepción multimodal: integra dos flujos de imagen (cámara lateral y cámara de pinza) junto con el estado del robot (6 valores).
- Aprendizaje por imitación: reproduce la tarea teleoperada de recoger un cubo y colocarlo en una caja.
- Inferencia en tiempo real: diseñado para ejecutarse a 30 FPS en el robot `so_follower`.
- Sin capacidades de lenguaje, visión general, tool calling ni razonamiento simbólico; es un modelo puramente motor.

## Casos de uso

- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas ACT entre entornos o variaciones de la tarea.
- Prototipado rápido con LeRobot: permite validar el flujo completo de grabación, entrenamiento y despliegue en un robot real en menos de un día.
- Automatización de tareas de pick-and-place en entornos controlados: el modelo puede integrarse en líneas de montaje sencillas donde la posición del cubo y la caja sea relativamente fija.
- Benchmark de generalización: al estar entrenado con solo 26 episodios, es útil para evaluar la robustez de ACT ante cambios de iluminación, posición de objetos o distracciones.
- Educación robótica: adecuado para cursos de robótica con LeRobot, ya que el repositorio incluye instrucciones de instalación, grabación y entrenamiento.
- Base para fine-tuning: los pesos pueden ajustarse con nuevos datos para tareas similares (por ejemplo, apilar objetos o clasificar piezas) sin partir de cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real.

## Requisitos de hardware

- VRAM estimada: con 51,7 millones de parámetros, la inferencia en precisión FP32 requiere aproximadamente 0,2 GB de VRAM solo para los pesos; considerando activaciones y buffers de PyTorch, se estiman entre 2 y 4 GB en total.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM y soporte CUDA (por ejemplo, NVIDIA GTX 1650, RTX 3060, RTX 4090). Para entrenamiento, se recomienda una GPU con 8 GB o más (RTX 3070 o superior).
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas de gama media y baja.
- Opciones de despliegue: LeRobot proporciona scripts `lerobot-rollout` para ejecutar la política en el robot. También puede cargarse como módulo PyTorch estándar.
- Latencia: no se dispone de mediciones publicadas, pero la arquitectura ACT está diseñada para funcionar en tiempo real (30 FPS) en hardware modesto.

## Comparativa con modelos similares

No disponible. No se han encontrado en la información proporcionada modelos comparables de la misma categoría (políticas ACT entrenadas con LeRobot para tareas similares) con datos de rendimiento publicados.

## Limitaciones y advertencias

- Entrenamiento con solo 26 episodios: la generalización a posiciones, iluminación o entornos diferentes es limitada y no se ha evaluado.
- Sin resultados de evaluación: no hay métricas de tasa de éxito en robot real, por lo que el rendimiento real es desconocido.
- Dependencia de la calibración: el modelo espera entradas de cámaras con resolución y posición específicas (640×480, cámara lateral y de pinza); cambios en la configuración requieren reentrenamiento.
- Tarea específica: solo realiza la tarea de recoger el cubo y colocarlo en la caja; no es generalizable a otras manipulaciones sin fine-tuning.
- Sin soporte de idiomas ni interacción multimodal más allá de visión y estado: no puede interpretar comandos de voz o texto.
- Riesgo de alucinación motora: en situaciones fuera de distribución, el modelo puede generar acciones incorrectas o inseguras; es necesario supervisión humana en entornos reales.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar que los datos de entrenamiento y el hardware cumplan con sus requisitos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Sumair15/act_pickup_cube_2cam
- Paper de ACT: https://huggingface.co/papers/2304.13705
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación general de LeRobot: https://huggingface.co/docs/lerobot/index
- Dataset de entrenamiento: https://huggingface.co/datasets/Sumair15/pickup_cube_2cam
