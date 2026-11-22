# Superstar111/pi05-yam-sharpa-spoon-scoop-astra-block-bed-1cmd-wristrand

## Resumen

π0.5-yam-sharpa-spoon-scoop-astra-block-bed-1cmd-wristrand es un checkpoint de politica robótica de tipo vision-language-action (VLA) desarrollado por el usuario Superstar111 y publicado en Hugging Face. Se trata de un ajuste fino del modelo π0.5 de Physical Intelligence mediante la herramienta openpi, orientado a una tarea de manipulación concreta: coger una cuchara de su soporte y usarla para recoger garbanzos de un lecho, con un brazo YAM Ultra 2 equipado con una mano Sharpa Wave de 28 articulaciones. El modelo recibe una única instrucción para todo el episodio ("pick up the spoon and scoop the beans") y produce acciones de control de bajo nivel.

La relevancia de esta ficha es limitada y muy específica: no se trata de un modelo de propósito general, sino de un artefacto de investigación para un montaje robótico concreto, entrenado exclusivamente en simulación (Isaac Lab) y no validado en el robot real. Su interés técnico reside en la receta de generación de datos: un controlador profesor escrito por un agente de código (Codex, "Astra"), variaciones sistemáticas del entorno (altura del lecho de garbanzos entre 4,5 y 6,0 capas, entre 12 y 36 garbanzos sueltos, autocolisión de eslabones activada) y una aleatorización parcial de la cámara de muñeca (242 de 300 episodios con fondo aleatorizado).

El repositorio ocupa 12,4 GB y no incluye resultados de evaluación cerrada en el momento de la publicación: la model card indica explícitamente que la evaluación en bucle cerrado está en curso y que las cifras se añadirán. No se especifican licencia, idiomas ni arquitectura interna del modelo más allá de su pertenencia a la familia π0.5.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en π0.5; detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de la tarea están en inglés) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 12,4 GB; se menciona un "serving bundle" final, sin detallar formato) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de π0.5 con openpi para una política de manipulación con una sola instrucción por episodio. La arquitectura subyacente es la de π0.5 (VLA que combina percepción visual, comprensión del lenguaje y generación de acciones), pero la model card no detalla número de parámetros, configuración de atención ni esquema de cuantización. La entrada incluye al menos una cámara de muñeca (con fondo aleatorizado en 242 de 300 episodios de entrenamiento) y el estado del robot; la salida es una secuencia de acciones para el brazo y la mano.

El entrenamiento se realizó íntegramente en simulación con Isaac Lab, usando el simulador "dextool" en la revisión e90e6f5. Los datos provienen de un controlador profesor escrito por un agente de código (Codex, sesión bed-a-11-21, versión tras 100 rollouts de ajuste), que superó 25 de 25 arranques reservados antes de la recolección. Se recolectaron 390 episodios, de los cuales se seleccionaron 300 para entrenamiento; cada episodio aceptado debía cumplir una regla de agarre de potencia cerrado sobre el mango de la cuchara. La receta incluye variaciones independientes de posición (hasta 20 mm) y orientación (hasta 5 grados) del soporte con la cuchara, la bandeja y el quemador con la olla; la cuchara podía estar girada hasta 20 grados y desplazada hasta 10 mm sobre su soporte. No se variaron las poses de cámara, la iluminación, la posición inicial del brazo ni la mesa. No se menciona RLHF ni DPO.

## Capacidades

- Ejecución de una tarea de manipulación única y concreta: coger una cuchara y recoger garbanzos, en un episodio de 32,9 s según el profesor.
- Control de un brazo YAM Ultra 2 con mano Sharpa Wave de 28 articulaciones, incluyendo agarre de potencia cerrado sobre el mango.
- Percepción visual con cámara de muñeca, con robustez parcial a fondos aleatorizados en la vista de muñeca.
- Seguimiento de una instrucción en lenguaje natural en inglés ("pick up the spoon and scoop the beans").
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión general, audio ni modo de pensamiento.

## Casos de uso

- Investigación en generación de datos sintéticos para robótica: sirve como referencia de una receta completa (profesor automático, filtros de aceptación, variaciones de layout) replicable en otros montajes de manipulación.
- Estudio de robustez a aleatorización visual: la comparación con el checkpoint base (sin aleatorización de fondo en la muñeca) permite aislar el efecto de esa variación en el rendimiento.
- Benchmark de simulación a real: útil como caso de estudio de transferencia sim-to-real, dado que el autor documenta explícitamente los offsets y calibraciones pendientes antes de ejecutarlo en el robot.
- Evaluación de políticas con autocolisión: al entrenarse con colisión entre eslabones de la mano activada, permite analizar si esa condición mejora la seguridad de las trayectorias en simulación.
- Docencia y divulgación: ejemplo didáctico de pipeline openpi completo, desde la recolección con profesor hasta el serving bundle.
- Pruebas de infraestructura de despliegue robótico: validación de runners y bundles de serving en un caso con requisitos de calibración conocidos (offset de articulación 6, pose de cámara de muñeca).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la evaluación en bucle cerrado está en curso y que las cifras se añadirán. Sí se documentan métricas de la recolección de datos, no del modelo: 388 de 390 episodios aceptados con el profesor (338 de 340 en arranques de entrenamiento) y un informe de cobertura por layout que resulta FAIL en varios bins (por ejemplo, 0 de 12 con el mango a menos de 40 mm de la pared de la bandeja; 18 de 42 entre 40 y 65 mm; 59 de 92 con la cuchara girada más de 10 grados en sentido horario).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repo (12,4 GB) incluye checkpoint y bundle de serving, pero no se desglosa.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: openpi (herramienta de referencia del ecosistema π0.5); no se detallan otros runners (vLLM, llama.cpp, Ollama, TGI no aplican a este tipo de política).
- Latencia y throughput: no disponibles; el único dato temporal es la duración del episodio del profesor (32,9 s), que no equivale a latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (π0.5 YAM + Sharpa, 1 cmd, wrist rand) | no disponible | no disponible | Cuchara + garbanzos, simulación | no disponible | Hugging Face, 0 descargas |
| Superstar111/pi05-yam-sharpa-spoon-scoop-astra-block-bed-1cmd | no disponible | no disponible | Misma tarea, sin aleatorización de fondo de muñeca | no disponible | Hugging Face |
| Superstar111/pi05-yam-sharpa-spoon-scoop-astra-block-1cmd-wristrand | no disponible | no disponible | Misma tarea, una sola altura de lecho y sin autocolisión | no disponible | Hugging Face |
| π0.5 (Physical Intelligence, base) | no disponible en la información | no disponible | VLA generalista | no disponible en la información | Referenciado vía openpi |

## Limitaciones y advertencias

- Entrenado solo en simulación (Isaac Lab); no se ha ejecutado en el robot real.
- El profesor presionó con el pulgar la pared de la bandeja en 38 de 390 episodios de recolección (hasta 21 N); los 34 episodios aceptados de ese tipo se excluyeron, por lo que no hay demostraciones con el mango a menos de 40 mm de una pared de bandeja y el comportamiento ahí es desconocido.
- El chequeo de cobertura por layout da FAIL en varios bins; algunos layouts tienen menos demostraciones de las previstas.
- Antes de ejecutar en el robot hay que resolver el offset de la articulación 6 en el montaje girado (en simulación lee +7,9° en reposo con palma hacia abajo) y verificar la pose de la cámara de muñeca, que es geométrica y no está calibrada en el robot.
- Licencia no especificada: no hay autorización explícita para uso comercial.
- Idiomas no declarados; la instrucción de tarea está en inglés.
- Riesgo de alucinación y sesgos: no evaluados ni documentados para este checkpoint.
- El autor recomienda ejecutar la recogida con una persona en el botón de parada de emergencia.
- Repositorio con 0 descargas y 0 likes: sin validación externa por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Superstar111/pi05-yam-sharpa-spoon-scoop-astra-block-bed-1cmd-wristrand
- Checkpoint base de la receta: https://huggingface.co/Superstar111/pi05-yam-sharpa-spoon-scoop-astra-block-bed-1cmd
- Checkpoint previo con aleatorización de muñeca: https://huggingface.co/Superstar111/pi05-yam-sharpa-spoon-scoop-astra-block-1cmd-wristrand
- openpi (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
