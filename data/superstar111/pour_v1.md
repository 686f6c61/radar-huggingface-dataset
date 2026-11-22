# Superstar111/pour_v1

## Resumen

π0.5 pour_v1 es una política de visión-lenguaje-acción (VLA) publicada por el usuario Superstar111 en Hugging Face, especializada en una única tarea robótica de manipulación: coger una cuchara, recoger garbanzos y verterlos en una olla. Se trata de un fine-tuning del modelo base π0.5 de Physical Intelligence realizado con la librería openpi, sobre un brazo YAM Ultra 2 equipado con una mano Sharpa Wave de 28 articulaciones. El modelo ejecuta un episodio completo de 47,9 segundos dividido en tres etapas, cada una controlada por un comando de lenguaje distinto que se conmuta durante la ejecución.

La relevancia de esta ficha es acotada: no es un modelo de propósito general, sino un checkpoint de investigación para una tarea concreta en simulación. El autor lo describe explícitamente como el "student" de un controlador generado por un agente de código (Codex, denominado "Astra"), y advierte de que no se ha probado en el robot real. El repositorio ocupa 12,4 GB y no cuenta con descargas ni likes en el momento de la consulta.

El modelo se entrenó exclusivamente en el simulador Isaac Lab (a través del simulador "dextool"), con 300 episodios de entrenamiento aceptados y 25 arranques de validación. La model card está incompleta en el apartado de evaluación: el autor indica que la evaluación en bucle cerrado está en curso y que las cifras se añadirán posteriormente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en π0.5, fine-tuning con openpi (config `pi05_maggie_2skill_hcw_nojit`) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (episodios de 479 observaciones a 10 Hz) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (comandos en inglés en la model card) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repo contiene checkpoint y bundle de serving; tamaño 12,4 GB) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint base π0.5 y se ajusta con openpi (commit eca022d) para producir una política VLA que mapea observaciones visuales y comandos de lenguaje a acciones articulares. La entrada visual consiste en tres vistas (head, wrist y cam1) renderizadas a 284 x 160 píxeles en simulación. El entrenamiento se realizó con semilla 43 sobre 4 GPUs RTX PRO 6000 Blackwell Server Edition en paralelo de datos, con batch global sin cambios respecto a la referencia. Se ejecutaron 9250 pasos, equivalentes a 2,060 pasadas sobre el conjunto de datos (la referencia son 6000 pasos sobre 93.600 filas a batch 32, es decir, 2,051 pasadas). Los pesos publicados son los pesos EMA en el paso 9249.

Los datos provienen de un "teacher" que no es humano ni un planificador scriptado, sino un controlador escrito por un agente de código (Codex, "Astra"), validado con 25 de 25 arranques retenidos superados antes de la recolección. Se aceptaron 390 de 390 episodios (340 de 340 en arranques de entrenamiento), de los cuales se usaron 300 para entrenamiento tras excluir uno con un enlace del robot sobre la bandeja. El pack `astra_sa_n300` contiene 900 segmentos y 143.700 filas (35.860 de pickup, 62.840 de scoop y 45.000 de pour). La escena varía la altura del lecho de garbanzos (4,5 a 6,0 capas), el número de garbanzos sueltos (12 a 36), la posición y orientación del reposacucharas, la bandeja y el quemador (hasta 20 mm y 5 grados), y la cuchara (hasta 20 grados de giro y 10 mm de deslizamiento). No se variaron las poses de cámara, la iluminación, la posición inicial del brazo ni la mesa. La cobertura de layouts se verificó con un PASS global, con el peor bin al 92 % (asa a menos de 40 mm de una pared de la bandeja).

## Capacidades

- Ejecución de una tarea robótica de manipulación en tres etapas encadenadas: coger la cuchara, recoger garbanzos y verterlos en la olla.
- Condicionamiento por comando de lenguaje por etapa: "pick up the spoon", "scoop the beans" y "pour the beans into the pot", con conmutación durante el episodio.
- Control de un brazo YAM Ultra 2 con mano Sharpa Wave de 28 articulaciones, incluyendo agarre de potencia cerrado sobre el mango.
- Percepción visual multimodal a partir de tres cámaras (head, wrist, cam1) a 284 x 160.
- Política de bucle cerrado a 10 Hz durante 479 observaciones (47,9 s por episodio).
- No se documentan capacidades de tool calling, agentes multi-paso fuera de la tarea, matemáticas, código ni otros idiomas distintos del inglés de los comandos.

## Casos de uso

- Investigación en imitación jerárquica con comandos por etapa: el modelo sirve para estudiar cómo un VLA conmuta entre subobjetivos de lenguaje dentro de un mismo episodio, comparándolo con su gemelo de comando único (`Superstar111/pi05-yam-sharpa-spoon-scoop-pour-astra-bed-1cmd`).
- Generación de datos sintéticos y destilación: al ser un "student" de un controlador teacher, puede emplearse para analizar la brecha entre políticas destiladas y controladores programáticos en simulación.
- Evaluación de robustez a variaciones de escena: los bins de cobertura documentados (posición del asa, giro de la cuchara, altura del lecho) permiten diseñar experimentos controlados de generalización.
- Benchmark de manipulación de precisión: la métrica exige agarre cerrado en al menos el 80 % de los fotogramas con la cuchara en la mano, 5 a 20 mm de separación del extremo del mango y ausencia de solapamientos entre enlaces no vecinos superiores a 1,0 mm, lo que lo hace útil como referencia de calidad de agarre.
- Estudio de transferencia sim-a-real: la model card detalla los puntos de fricción (montaje de la mano, conversión de la articulación 6, calibración de la cámara de muñeca), lo que lo convierte en material para investigar dicha transferencia antes de desplegarlo en el robot físico.
- Docencia y divulgación en robótica: un episodio único de 47,9 s con tres etapas y comandos explícitos es un caso didáctico claro para ilustrar pipelines VLA con openpi.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la evaluación en bucle cerrado está en curso y que las cifras se añadirán en una versión posterior de la ficha. Los únicos datos cuantitativos disponibles son de cobertura del conjunto de datos, no de rendimiento del modelo:

| Métrica de cobertura (datos de entrenamiento) | Resultado |
|---|---|
| Episodios aceptados en recolección | 390 de 390 (340 de 340 en arranques de entrenamiento) |
| Asa a menos de 40 mm de pared de bandeja | 11 de 12 (92 %) |
| Asa a 40-65 mm de pared de bandeja | 42 de 42 (100 %) |
| Asa a más de 65 mm de pared de bandeja | 286 de 286 (100 %) |
| Cuchara girada más de 10° horario | 91 de 92 (99 %) |
| Cuchara girada 0-10° horario | 69 de 69 (100 %) |
| Cuchara girada 0-10° antihorario | 93 de 93 (100 %) |
| Cuchara girada más de 10° antihorario | 86 de 86 (100 %) |
| Lecho 4,5-5,0 capas | 97 de 98 (99 %) |
| Lecho 5,0-5,5 capas | 134 de 134 (100 %) |
| Lecho 5,5-6,0 capas | 108 de 108 (100 %) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 12,4 GB, pero no se especifica el desglose entre pesos y bundle de serving ni la cuantización.
- GPU de entrenamiento documentadas: 4 x RTX PRO 6000 Blackwell Server Edition en paralelo de datos.
- GPU recomendadas para inferencia: no disponibles. Al tratarse de un VLA con tres cámaras y 28 articulaciones, se requiere una GPU con memoria suficiente para el checkpoint completo, pero no se aportan cifras.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: openpi (commit eca022d) con la configuración `pi05_maggie_2skill_hcw_nojit`; el autor menciona un "serving bundle" incluido en el repositorio. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de política.
- Latencia y throughput: no disponibles. El control opera a 10 Hz en simulación, pero no se publican tiempos de inferencia por paso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Superstar111/pour_v1 | no disponible | no disponible | Pickup + scoop + pour con 3 comandos (YAM Ultra 2 + Sharpa Wave) | no disponible | Hugging Face, 0 descargas |
| Superstar111/pi05-yam-sharpa-spoon-scoop-pour-astra-bed-1cmd | no disponible | no disponible | Misma tarea con un único comando | no disponible | Hugging Face (gemelo del anterior) |
| π0.5 base (Physical Intelligence) | no disponible | no disponible | VLA de propósito general | no disponible en la información proporcionada | Referencia del fine-tuning |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente en simulación (Isaac Lab); no se ha ejecutado en el robot real.
- Evaluación en bucle cerrado pendiente: no hay cifras de éxito publicadas, solo cobertura del dataset.
- Montaje de la mano: entrenado con el montaje girado; no debe aplicarse la conversión de la articulación 6 de los cinco checkpoints anteriores. En simulación la articulación 6 lee +7,9° en la postura de reposo con la palma hacia abajo, sin offset; no verificado en el robot.
- Cámara de muñeca: su pose en entrenamiento es geométrica (según el asiento del montaje), no calibrada, y no verificada en el robot.
- Conmutación de comandos: en simulación el primer cambio se produce cuando se cumple la comprobación de pickup del simulador (o en la observación 150 como máximo); en el robot debe hacerlo un operador o un temporizador fijo, y no está probado.
- Variabilidad de escena limitada: no se variaron poses de cámara, iluminación, posición inicial del brazo ni mesa, lo que reduce la generalización esperada.
- Licencia no disponible: no puede confirmarse el uso comercial.
- Idiomas no disponibles: los comandos documentados están en inglés.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; al ser una política de acción, el riesgo relevante es de fallo físico (colisiones, agarres incompletos), no de generación de texto.
- Requiere supervisión humana con parada de emergencia durante cualquier prueba en el robot físico, según indica el propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Superstar111/pour_v1
- Modelo gemelo (comando único): https://huggingface.co/Superstar111/pi05-yam-sharpa-spoon-scoop-pour-astra-bed-1cmd
- Repositorio openpi: https://github.com/Physical-Intelligence/openpi
