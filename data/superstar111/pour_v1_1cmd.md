# Superstar111/pour_v1_1cmd

## Resumen

`Superstar111/pour_v1_1cmd` es un checkpoint de política robótica de tipo vision-language-action (VLA) basado en π0.5, desarrollado por el usuario Superstar111 y publicado en Hugging Face. El modelo se ha ajustado con el framework openpi (Physical Intelligence) para controlar un brazo YAM Ultra 2 equipado con una mano Sharpa Wave de 28 articulaciones, ejecutando una tarea de manipulación en tres etapas —coger la cuchara, recoger garbanzos y verterlos en una olla— a partir de un único comando en lenguaje natural para todo el episodio.

La relevancia del modelo es doble: por un lado, demuestra el uso de un controlador "profesor" generado por un agente de código (Codex, apodado "Astra") como fuente de demostraciones para destilar una política VLA; por otro, emplea un esquema de comando único para una secuencia larga (47,9 s, 479 observaciones a 10 Hz), en lugar de una instrucción por etapa. El entrenamiento se ha realizado íntegramente en simulación (Isaac Lab, simulador dextool) y el autor indica explícitamente que el modelo no se ha ejecutado en el robot real.

El checkpoint ocupa 12,4 GB e incluye tanto los pesos de openpi como un bundle de servicio (`openpi_src.tar.gz`, tokenizer y `serve_vla.sh`). No hay resultados de evaluación en bucle cerrado publicados todavía: el autor indica que la evaluación está en curso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en π0.5, ajustada con openpi |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (episodios de 479 observaciones a 10 Hz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (comandos en inglés en los ejemplos de la model card) |
| Licencia | no disponible |
| Formato de pesos | checkpoint openpi (`params/` + norm stats en `assets/local/astra_sb_n300/`); bundle con `openpi_src.tar.gz`, `openpi_data.tar.gz` y `serve_vla.sh` |

## Arquitectura y entrenamiento

El modelo es una política π0.5 (familia VLA de Physical Intelligence) ajustada con openpi en el commit `eca022d`, configuración `pi05_maggie_2skill_hcw_nojit`, semilla 43, partiendo de la base pi0.5. El entrenamiento se ejecutó en una NVIDIA H200 con 9250 pasos (2,060 pasadas sobre 143.700 filas, batch 32); los pesos publicados son los EMA del paso 9249. La entrada son tres vistas de cámara (head, wrist y cam1) a resolución 284 x 160 renderizadas en simulación.

Las demostraciones provienen de un controlador profesor escrito por un agente de código (Codex, "Astra"), no de vídeos humanos ni de un planificador scripted. Tras 100 rollouts de ajuste, el profesor superó 25 de 25 arranques reservados y generó 390 episodios aceptados de 390 (340 de 340 en arranques de entrenamiento). El pack de entrenamiento `astra_sb_n300` contiene 300 segmentos y 143.700 filas. La escena varía la altura del lecho de garbanzos (4,5 a 6,0 capas), el número de garbanzos sueltos (12 a 36), la posición y orientación del reposacucharas, la bandeja y el quemador (hasta 20 mm y 5°), y la orientación de la cuchara (hasta 20° y 10 mm de deslizamiento). No se variaron las poses de cámara, la iluminación, la posición inicial del brazo ni la mesa.

## Capacidades

- Control robótico de manipulación en tres etapas (pickup, scoop, pour) a partir de un único comando en lenguaje natural para todo el episodio.
- Política VLA de bucle cerrado: genera acciones a partir de observaciones visuales y del estado del robot a 10 Hz.
- Manejo de una mano articulada de 28 articulaciones (Sharpa Wave) sobre brazo YAM Ultra 2.
- Ejecución de agarre de potencia cerrado sobre el mango de la cuchara con criterios geométricos estrictos (80 % de frames con agarre, 5-20 mm de extremo libre, 30 mm sobre la mesa, sin autocolisiones mayores de 1,0 mm).
- Transporte de al menos un garbanzo hasta la olla y verificación de que no queda en el cuenco de la cuchara al final del vertido.
- Robustez a variaciones de altura del lecho, posición/orientación de objetos y orientación de la cuchara dentro de los rangos entrenados.
- No se documentan capacidades de tool calling, razonamiento multi-paso genérico, multilingüismo, visión general, audio ni modo "thinking".

## Casos de uso

- **Investigación en destilación de profesores automáticos**: usar el checkpoint como referencia para estudiar cómo un controlador generado por un agente de código se convierte en política VLA; el pack `astra_sb_n300` y los criterios de aceptación del profesor permiten reproducir el pipeline.
- **Benchmark de comandos únicos vs. por etapa**: comparar este modelo con su gemelo `Superstar111/pour_v1` (un comando por etapa) sobre las mismas demostraciones para medir el coste de planificación implícita en el modelo.
- **Prototipado de tareas de "scoop and pour" en simulación**: emplear el checkpoint en Isaac Lab con el simulador dextool (commit `e90e6f5`) para generar rollouts y analizar fallos antes de transferir a hardware.
- **Validación de pipelines de servicio openpi**: el bundle incluye `serve_vla.sh` y el código fuente en el commit entrenado; sirve para probar el camino de serving (el autor verificó 12 consultas grabadas con tolerancia de 0,005 rad).
- **Estudio de robustez a variaciones de layout**: los bins de cobertura (distancia del mango a la pared de la bandeja, giro de la cuchara, altura del lecho) permiten diseñar experimentos de generalización controlada.
- **Preparación de despliegue en robot real**: el checkpoint documenta el montaje de la mano, el offset de la articulación 6 y la pose geométrica de la cámara de muñeca, lo que facilita la puesta a punto en la plataforma YAM Ultra 2 + Sharpa Wave antes de ejecutar con parada de emergencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la evaluación en bucle cerrado está en curso y que las cifras se añadirán. Lo único verificado es la ruta de serving: 12 consultas grabadas respondidas dentro de 0,0031 rad de las respuestas del clúster de entrenamiento (tolerancia 0,005 rad), tras verificación sha256 del bundle y el checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publican parámetros totales ni cuantizaciones).
- GPU de entrenamiento documentada: NVIDIA H200 (una unidad).
- GPU recomendadas para inferencia: no disponible; por el tamaño del repo (12,4 GB) y la familia π0.5, se requiere una GPU con memoria suficiente para el checkpoint completo, pero el autor no especifica cifras.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: openpi en el commit `eca022d` con `serve_vla.sh`; el bundle incluye el código fuente y el tokenizer. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tarea | Comando | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Superstar111/pour_v1_1cmd` | π0.5 (openpi) | Pickup + scoop + pour en un episodio de 47,9 s | Uno para todo el episodio | Simulación (Isaac Lab) | no disponible | Hugging Face, 0 descargas |
| `Superstar111/pour_v1` | π0.5 (openpi) | Misma tarea, mismas demostraciones | Uno por etapa | Simulación (Isaac Lab) | no disponible | Hugging Face |
| Otras políticas π0.5 ajustadas con openpi | π0.5 | Manipulación diversa | Variable | Variable | Variable | Repositorios de la comunidad |

No se dispone de datos de rendimiento comparativo entre estos modelos; la comparación se limita a la formulación de la tarea y al origen de los datos.

## Limitaciones y advertencias

- **No validado en robot real**: el autor indica explícitamente que el modelo solo se ha entrenado en simulación y no se ha ejecutado en el hardware.
- **Evaluación incompleta**: no hay resultados de éxito en bucle cerrado; la model card promete añadirlos.
- **Riesgo de alucinación y fallo de política**: al ser una política VLA, puede generar acciones fuera de distribución ante escenas no vistas; el autor recomienda ejecutarla con una persona en la parada de emergencia.
- **Offset de la articulación 6**: en simulación lee +7,9° en la postura de reposo con la palma hacia abajo; si el rig lee otro valor, esa diferencia es el offset. No verificado en el rig.
- **Cámara de muñeca**: su pose en entrenamiento es geométrica (según el montaje), no calibrada, y no está verificada en el rig.
- **Cobertura limitada de la escena**: no se variaron poses de cámara, iluminación, posición inicial del brazo ni mesa; la generalización fuera de los rangos entrenados (lecho 4,5-6,0 capas, 12-36 garbanzos, etc.) no está garantizada.
- **Licencia no disponible**: no se puede confirmar el uso comercial; hay que contactar con el autor.
- **Idiomas no disponibles**: los comandos documentados están en inglés; no se declara soporte multilingüe.
- **Madurez**: 0 descargas y 0 likes en el momento de la consulta; repositorio creado y actualizado el 2026-11-22, sin historial de uso comunitario.

## Enlaces

- Hugging Face: https://huggingface.co/Superstar111/pour_v1_1cmd
- Modelo gemelo: https://huggingface.co/Superstar111/pour_v1 (referenciado en la model card)
- openpi (framework de ajuste): https://github.com/Physical-Intelligence/openpi
- Simulador dextool (commit `e90e6f5`): no disponible como enlace directo en la información proporcionada
- Isaac Lab: no disponible como enlace directo en la información proporcionada
- Paper de π0.5: no disponible en la información proporcionada
- Resultados de búsqueda web: no relevantes para este modelo (resultados sobre Lidl Montpellier)
