# Szymon-Ilnicki/track_v4_no-cones_dual-image

## Resumen

SmolVLA es un modelo compacto de vision-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico mediante aprendizaje por imitación. Esta ficha concreta, `Szymon-Ilnicki/track_v4_no-cones_dual-image`, es un fine-tuning de `lerobot/smolvla_base` orientado a conducción autónoma de un vehículo a escala 1:10 de tipo F1TENTH en un circuito, usando dos cámaras como entrada visual y un estado de dos dimensiones.

El modelo resuelve el problema de mapear observaciones visuales y de estado directamente a acciones de control de bajo nivel (dos dimensiones de acción) sin necesidad de un pipeline modular de percepción-planificación-control. Su relevancia radica en que demuestra que un VLA de 450 millones de parámetros puede desplegarse en hardware de consumo, lo que abarata la experimentación en robótica de aprendizaje.

La arquitectura subyacente es SmolVLA, presentada en el artículo arXiv 2506.01844, con un total de 450.046.176 parámetros en formato safetensors y un repositorio de 1,2 GB. La licencia es Apache 2.0 y la librería de referencia es LeRobot 0.7.0. El modelo está entrenado únicamente sobre un dataset local de 26 episodios y 4.836 fotogramas a 10 FPS, por lo que su ámbito de aplicación es muy específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-lenguaje-acción compacto, transformer multimodal) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (las instrucciones de tarea del dataset están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | f1tenth |
| Cámaras de entrada | camera1, camera2 |
| Entrada visual | observation.images.camera1 (3, 240, 424), observation.images.camera2 (3, 240, 424) |
| Entrada de estado | observation.state (2,) |
| Salida de acción | action (2,) |
| Dataset de entrenamiento | local/track_v4_no-cones (26 episodios, 4.836 fotogramas, 10 FPS) |
| Pasos de entrenamiento | 20.000 |
| Tamaño de batch | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-4 |
| Semilla | 1000 |
| Versión de LeRobot | 0.7.0 |
| Tamaño del repositorio | 1,2 GB |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual con un backbone de lenguaje y una cabeza de acciones, siguiendo el paradigma de los VLA pero con un presupuesto computacional reducido para permitir inferencia en hardware de consumo. El modelo consume dos flujos de imagen de resolución 240×424 píxeles junto con un vector de estado de dos dimensiones, y produce un vector de acción de dos dimensiones. La tarea se especifica mediante una instrucción en lenguaje natural, lo que permite condicionar el comportamiento (por ejemplo, sentido de giro y velocidad) sin reentrenar.

El fine-tuning se realizó sobre el dataset `local/track_v4_no-cones`, compuesto por 26 episodios y 4.836 fotogramas capturados a 10 FPS, con cuatro tareas declaradas: completar vueltas en sentido antihorario rápido, antihorario lento, horario rápido y horario lento. El entrenamiento usó 20.000 pasos, batch de 8, AdamW con learning rate 1e-4 y semilla 1000, sobre LeRobot 0.7.0. No se documenta en la información disponible el número de tokens de entrenamiento del modelo base, la composición de su dataset original ni si hubo etapas de RLHF o DPO; tampoco se detallan innovaciones técnicas adicionales más allá de las propias de SmolVLA descritas en el artículo 2506.01844.

## Capacidades

- Control robótico end-to-end: mapea dos imágenes de cámara y un estado de dos dimensiones a un vector de acción de dos dimensiones, sin pipeline intermedio de percepción.
- Condicionamiento por instrucción en lenguaje natural: acepta tareas como "complete laps anticlockwise fast" o "complete laps clockwise slowly" para modular el comportamiento.
- Conducción en circuito cerrado: entrenado específicamente para completar vueltas en un trazado sin conos, en ambos sentidos de giro y a dos regímenes de velocidad.
- Entrada multimodal: fusión de dos vistas de cámara (frontal y otra perspectiva) con el estado del vehículo.
- Aprendizaje por imitación: reproduce políticas demostradas en el dataset, sin necesidad de recompensa explícita.
- Despliegue en hardware de consumo: el tamaño de 450 millones de parámetros y el formato safetensors permiten ejecución en GPU de gama media.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión general, audio ni modo de pensamiento; el modelo es una política robótica especializada.

## Casos de uso

- Conducción autónoma en circuito a escala: el modelo controla un F1TENTH en un trazado sin conos, generando acciones de dos dimensiones a partir de dos cámaras; es adecuado porque fue entrenado exactamente sobre ese escenario y ese robot.
- Investigación en aprendizaje por imitación: sirve como política de referencia para comparar técnicas de VLA compactos frente a pipelines modulares, dado su bajo coste computacional y su licencia permisiva.
- Prototipado rápido de políticas robóticas: al partir de `lerobot/smolvla_base` y usar LeRobot 0.7.0, un equipo puede grabar su propio dataset y fine-tunear con el mismo comando documentado, reduciendo el tiempo de iteración.
- Docencia y laboratorios de robótica: su tamaño de 450 millones de parámetros y su despliegue en GPU de consumo lo hacen viable en aulas con hardware limitado, usando el comando `lerobot-rollout` documentado.
- Evaluación de robustez ante condiciones de pista: permite estudiar cómo se degrada la política al cambiar iluminación, posición inicial o velocidad, ya que el modelo card no reporta resultados de evaluación y deja ese análisis abierto.
- Base para fine-tuning en variantes de circuito: el checkpoint puede reentrenarse sobre datasets locales adicionales para adaptar el comportamiento a otros trazados o sentidos de giro, manteniendo la misma interfaz de observación y acción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política y deja la tabla de evaluación vacía.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 millones de parámetros en safetensors (aproximadamente 1,8 GB en FP32 o 0,9 GB en FP16), la huella de pesos es modesta, pero el autor no publica cifras de VRAM.
- GPU recomendadas: no disponible en la información proporcionada; el artículo de SmolVLA indica que está pensado para hardware de consumo, pero no se detallan modelos concretos.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del modelo, aunque no se confirma con cifras oficiales.
- Opciones de despliegue: LeRobot 0.7.0 mediante el comando `lerobot-rollout` con `--policy.path=Szymon-Ilnicki/track_v4_no-cones_dual-image`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son adecuadas para una política robótica de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Szymon-Ilnicki/track_v4_no-cones_dual-image | 450.046.176 | no disponible | sin evaluación publicada | Apache 2.0 | Hugging Face, vía LeRobot |
| lerobot/smolvla_base | no disponible en la información | no disponible | no disponible | no disponible en la información | Hugging Face |
| Políticas ACT de LeRobot (referencia del ecosistema) | no disponible en la información | no disponible | no disponible | no disponible en la información | Hugging Face |
| Políticas Diffusion Policy de LeRobot (referencia del ecosistema) | no disponible en la información | no disponible | no disponible | no disponible en la información | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Especialización extrema: entrenado solo con 26 episodios y 4.836 fotogramas de un único circuito sin conos, por lo que no se espera generalización a otros trazados, robots o condiciones de iluminación.
- Sin resultados de evaluación: la model card no reporta tasa de éxito ni número de ensayos, de modo que no hay evidencia publicada de su fiabilidad en producción.
- Riesgo de sobreajuste: la combinación de 20.000 pasos con un dataset de menos de 5.000 fotogramas sugiere un alto riesgo de memorización de las trayectorias demostradas.
- Dependencia de la configuración de cámaras: los nombres e índices de cámara deben coincidir con `camera1` y `camera2` y con la resolución de entrenamiento (240×424); cambios en el montaje degradan la política.
- Sesgos conocidos: no documentados en la información disponible; al tratarse de un modelo entrenado con demostraciones humanas en un entorno concreto, hereda los sesgos de esas demostraciones.
- Riesgo de alucinación: no aplica en el sentido de generación de texto libre, pero sí existe riesgo de acciones erráticas fuera de la distribución de entrenamiento.
- Idiomas: las instrucciones de tarea del dataset están en inglés; no se documenta soporte multilingüe.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; el uso en un vehículo real exige medidas de seguridad externas.
- Caveat de producción: no se documentan latencias, tasas de fallo ni protocolos de recuperación ante acciones inválidas, imprescindibles antes de desplegar en un robot físico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Szymon-Ilnicki/track_v4_no-cones_dual-image
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Artículo SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/local/track_v4_no-cones
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
