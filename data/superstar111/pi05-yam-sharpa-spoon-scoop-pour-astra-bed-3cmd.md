# Superstar111/pi05-yam-sharpa-spoon-scoop-pour-astra-bed-3cmd

## Resumen

π0.5 student of a coding agent's controller, one command per stage es un checkpoint de política robótica (vision-language-action, VLA) publicado por el usuario Superstar111 en Hugging Face. Se trata de un fine-tuning del modelo base π0.5 de Physical Intelligence, entrenado con el framework openpi sobre datos generados en simulación (Isaac Lab) para una tarea concreta de manipulación: coger una cuchara, recoger garbanzos y verterlos en una olla con un brazo YAM Ultra 2 y una mano Sharpa Wave de 28 articulaciones.

El modelo resuelve un problema de control de robots guiado por lenguaje natural en tres etapas encadenadas dentro de un episodio de 47,9 s (479 observaciones a 10 Hz). La particularidad es que cambia la instrucción en mitad del episodio: "pick up the spoon" hasta la observación 150, "scoop the beans" hasta la 329 y "pour the beans into the pot" hasta el final. Es relevante porque demuestra el uso de un "teacher" generado por un agente de código (Codex, denominado Astra) para producir automáticamente demostraciones de alta calidad sin intervención humana, y porque publica el checkpoint junto con el bundle de serving de openpi.

El repositorio ocupa 12,4 GB y no incluye resultados de evaluación cerrada en el momento de la publicación (la model card indica que la evaluación está en curso). No se dispone de información sobre licencia, idiomas ni especificaciones detalladas de arquitectura más allá de la referencia a π0.5 y openpi.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en π0.5, fine-tuneada con openpi (config `pi05_maggie_2skill_hcw_nojit`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (episodios de 479 observaciones a 10 Hz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de la tarea están en inglés) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 12,4 GB; se menciona checkpoint y bundle de serving de openpi) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de π0.5, la política VLA de Physical Intelligence, entrenado con openpi (commit eca022d) mediante la configuración `pi05_maggie_2skill_hcw_nojit` con semilla 43. Se entrenó en 4 GPU RTX PRO 6000 Blackwell Server Edition en modo data-parallel, con un total de 9250 pasos (2,060 pasadas sobre 143.700 filas con batch 32) y se publicaron los pesos EMA del paso 9249. La tarea combina tres habilidades (pickup, scoop, pour) con un comando distinto por etapa.

Los datos provienen exclusivamente de simulación (Isaac Lab, simulador dextool en e90e6f5). El "teacher" no es un humano ni un planificador scripted, sino un controlador escrito por un agente de código (Codex, "Astra") tras 100 rollouts de ajuste; validó 25 de 25 arranques retenidos antes de la recolección y aceptó 390 de 390 episodios. El pack de entrenamiento `astra_sa_n300` contiene 900 segmentos y 143.700 filas (35.860 de pickup, 62.840 de scoop y 45.000 de pour) con tres vistas (head, wrist, cam1) a 284 x 160 renderizadas en simulación. La cobertura de layouts se verificó por bins (distancia del mango a la pared de la bandeja, giro de la cuchara y altura del lecho de garbanzos), con tasas de aceptación entre el 92 % y el 100 %.

## Capacidades

- Control robótico guiado por lenguaje para una tarea de manipulación en tres etapas: coger cuchara, recoger garbanzos y verter en la olla.
- Cambio de instrucción en mitad del episodio (tres comandos encadenados con puntos de conmutación fijos o basados en una comprobación del simulador).
- Percepción multimodal con tres cámaras (head, wrist, cam1) a resolución 284 x 160.
- Política cerrada de acción sobre un brazo YAM Ultra 2 con mano Sharpa Wave de 28 articulaciones.
- Entrenado para cumplir restricciones físicas estrictas: agarre de potencia cerrado sobre el mango en al menos el 80 % de los fotogramas con la cuchara en la mano, 5-20 mm del extremo del mango libres, mano a 30 mm o más sobre la mesa y sin autocolisiones entre enlaces no adyacentes superiores a 1,0 mm.
- No se ha verificado en robot real; todas las capacidades descritas son en simulación.
- No hay información sobre tool calling, agentes multi-paso fuera de la tarea, multilingüismo ni modo thinking.

## Casos de uso

- Investigación en aprendizaje por imitación desde teachers automáticos: el modelo sirve como caso de estudio de generación de demostraciones mediante un agente de código (Astra) en lugar de teleoperación humana, con 390 de 390 episodios aceptados.
- Benchmark de políticas VLA de múltiples etapas: permite evaluar el encadenamiento de tres habilidades con comandos distintos en un mismo episodio y comparar con el gemelo de un solo comando (`pi05-yam-sharpa-spoon-scoop-pour-astra-bed-1cmd`).
- Estudio de robustez a variaciones de layout: el modelo fue entrenado con variaciones de posición y giro de la bandeja, la cuchara, el reposacucharas y el quemador, y con alturas de lecho de garbanzos de 4,5 a 6,0 capas, lo que permite analizar generalización ante cambios de escena.
- Desarrollo de pipelines de simulación a real: el checkpoint y el bundle de serving permiten reproducir la inferencia en simulación y preparar la transferencia al robot físico, con advertencias documentadas sobre el montaje de la mano y la cámara de muñeca.
- Evaluación de conmutación de comandos en políticas VLA: útil para investigar cómo afecta al rendimiento el cambio de instrucción en el tiempo (a la observación 150 y 329) frente a una única instrucción para todo el episodio.
- Docencia y divulgación en robótica: ejemplo completo de entrenamiento con openpi, dataset de 143.700 filas y criterios de éxito medibles (evaluador `evaluate_chain_pour`), reproducible con 4 GPU de gama profesional.
- Pruebas de verificación de restricciones físicas: el modelo está entrenado para satisfacer límites geométricos y de colisión concretos, lo que lo hace útil para estudiar el cumplimiento de restricciones en políticas aprendidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la evaluación en bucle cerrado está en curso y que las cifras se añadirán en una versión futura de la ficha. Los únicos datos de rendimiento disponibles son los del teacher (390 de 390 episodios aceptados, 25 de 25 arranques retenidos superados) y las tasas de cobertura del dataset de entrenamiento, que no son resultados del estudiante.

## Requisitos de hardware

- El entrenamiento se realizó en 4 GPU RTX PRO 6000 Blackwell Server Edition en data-parallel, lo que da una referencia del hardware utilizado por el autor.
- VRAM estimada para inferencia: no disponible. El tamaño del repo es de 12,4 GB, pero no se especifica el número de parámetros ni el formato de pesos, por lo que no se puede estimar con rigor.
- GPU recomendadas: no disponible. Por el hardware de entrenamiento, se puede inferir que el modelo requiere GPU de gama profesional o de centro de datos, pero no hay confirmación.
- ¿Cabe en GPU de consumo? No disponible.
- Opciones de despliegue: openpi (el repo incluye el bundle de serving); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una política VLA de robótica.
- Latencia y throughput: no disponibles. El control opera a 10 Hz en simulación (479 observaciones en 47,9 s), pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 student (este modelo) | no disponible | no disponible (479 obs/episodio) | Pickup + scoop + pour, 3 comandos | no disponible | Hugging Face, 12,4 GB |
| `Superstar111/pi05-yam-sharpa-spoon-scoop-pour-astra-bed-1cmd` | no disponible | no disponible | Misma tarea con un único comando | no disponible | Hugging Face (gemelo del mismo autor) |
| π0.5 base (Physical Intelligence) | no disponible | no disponible | Política VLA generalista | no disponible en esta información | Referenciado vía openpi |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada. La comparación con el gemelo de un solo comando es la más directa, ya que comparte demostraciones y escena, pero no se han publicado métricas de ninguno de los dos.

## Limitaciones y advertencias

- Entrenado exclusivamente en simulación (Isaac Lab); no se ha ejecutado en el robot real.
- El montaje de la mano y la articulación 6 no están verificados en el robot físico: no se debe aplicar la conversión de la articulación 6 de los cinco checkpoints anteriores; en simulación la articulación 6 marca +7,9° en la postura de reposo con la palma hacia abajo, sin offset.
- La pose de la cámara de muñeca en entrenamiento es geométrica (según el asiento del montaje), no calibrada, y no está verificada en el robot.
- La conmutación de comandos en simulación se basa en una comprobación del simulador (cuchara en la mano) o en observaciones fijas; en el robot real el primer cambio debe provenir de un operador o de un tiempo fijo, y no se ha probado.
- Requiere supervisión humana con parada de emergencia durante la ejecución en el robot.
- No hay información sobre sesgos, riesgo de alucinación, limitaciones de idioma ni restricciones de licencia para uso comercial; la licencia figura como no disponible.
- El modelo está especializado en una única tarea y escena; no es un modelo de propósito general.
- La evaluación en bucle cerrado está pendiente de publicación, por lo que no hay evidencia cuantitativa del rendimiento del estudiante.

## Enlaces

- Hugging Face: https://huggingface.co/Superstar111/pi05-yam-sharpa-spoon-scoop-pour-astra-bed-3cmd
- Modelo gemelo de un solo comando: https://huggingface.co/Superstar111/pi05-yam-sharpa-spoon-scoop-pour-astra-bed-1cmd
- openpi (framework de entrenamiento): https://github.com/Physical-Intelligence/openpi
