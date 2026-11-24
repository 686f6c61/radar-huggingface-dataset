# Superstar111/pour_v2_1cmd

## Resumen

`Superstar111/pour_v2_1cmd` es una política de visión-lenguaje-acción (VLA) construida sobre la base π0.5 y ajustada con el framework openpi de Physical Intelligence. Resuelve una tarea robótica concreta: un episodio de manipulación de 47,9 segundos con un brazo YAM Ultra 2 y una mano Sharpa Wave de 28 articulaciones, en el que el robot debe coger una cuchara, recoger garbanzos y verterlos en una olla. La particularidad frente a su gemelo `Superstar111/pour_v2` es que todo el episodio se gobierna con una única instrucción en lenguaje natural, en lugar de una orden por fase.

El modelo se ha entrenado exclusivamente en simulación (Isaac Lab, simulador dextool en el commit e90e6f5) y, según la model card, no se ha ejecutado todavía en el robot real. El repositorio ocupa 12,4 GB y contiene el checkpoint final (pesos EMA en el paso 9249) junto con el bundle de serving. La evaluación en bucle cerrado está en curso y el autor indica que los números se añadirán en una versión posterior de la ficha.

Su relevancia es de nicho pero técnicamente interesante: documenta con detalle poco habitual el proceso de generación de datos (un controlador escrito por un agente de código, 390 de 390 episodios aceptados) y la cobertura de layouts, lo que lo convierte en un caso de estudio sobre destilación de profesores sintéticos en políticas VLA y sobre los requisitos de validación antes de transferir a hardware.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en π0.5, ajustada con openpi |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 12,4 GB con checkpoint y bundle de serving) |

## Arquitectura y entrenamiento

El modelo parte de la base π0.5 y se ajusta con openpi (commit eca022d) usando la configuración `pi05_maggie_2skill_hcw_nojit`, semilla 43, sobre una NVIDIA H200. El entrenamiento se ejecutó durante 9250 pasos, equivalentes a 2,060 pasadas sobre 143.700 filas (regla de pasadas calibrada contra una referencia de 6000 pasos sobre 93.600 filas con batch 32). No se aplicó tope de pasos y se conservaron los pesos EMA del paso 9249.

Los datos proceden de un profesor que no es humano ni un planificador scriptado, sino un controlador escrito por un agente de código (Codex, "Astra"), validado con 25 de 25 arranques reservados superados antes de la recolección. Se aceptaron 300 episodios de entrenamiento (340 de 340 en arranques de entrenamiento, 390 de 390 en total) y se reservaron 25 arranques de validación. El pack `astra_sb_n300` contiene 300 segmentos y 143.700 filas con tres vistas (head, wrist, cam1) a 284 x 160 píxeles renderizadas en simulación. La escena varía la altura del lecho de garbanzos (4,5 a 6,0 capas), el número de garbanzos sueltos (12 a 36), la posición y orientación de bandeja, soporte y quemador (hasta 20 mm y 5 grados) y la cuchara (hasta 20 grados y 10 mm de deslizamiento), con autocolisión de los eslabones del robot activada.

## Capacidades

- Generación de acciones motoras de alta frecuencia (10 Hz) para un brazo YAM Ultra 2 con mano Sharpa Wave de 28 articulaciones.
- Ejecución de una secuencia de tres fases (pickup, scoop, pour) a partir de una única instrucción en lenguaje natural.
- Percepción visual multi-cámara: tres vistas (head, wrist, cam1) a 284 x 160 píxeles.
- Control en bucle cerrado con restricciones físicas verificadas: fuerza máxima de 5 N sobre la olla, distancia mínima de 10 mm de todos los eslabones a la bandeja durante todo el episodio.
- Agarres de potencia cerrados sobre el mango con tolerancia de 5 a 20 mm de extremo libre y holgura de 30 mm sobre la mesa.
- Generalización a variaciones de layout documentadas (posición de mango, giro de cuchara, altura del lecho, desplazamiento de la olla).
- No se documentan capacidades de tool calling, razonamiento multi-paso genérico, multilingüismo ni modalidades de audio.

## Casos de uso

- Investigación en destilación de profesores sintéticos: el modelo sirve como referencia para estudiar cómo un controlador generado por un agente de código se convierte en política neuronal, con métricas de aceptación (390 de 390) y cobertura de layouts documentadas de forma granular.
- Benchmark de manipulación de largo horizonte: un episodio único de 47,9 segundos con una sola instrucción permite evaluar la degradación de políticas VLA cuando se elimina la segmentación por fases, comparándolo con el gemelo `pour_v2` que usa una orden por etapa.
- Validación de pipelines openpi: el bundle de serving incluido y la configuración `pi05_maggie_2skill_hcw_nojit` permiten reproducir el flujo de entrenamiento en H200 y medir el coste de 2,06 pasadas sobre 143.700 filas.
- Estudio de robustez a variaciones de escena: los bins de cobertura (mango a menos de 40 mm de pared, cuchara girada más de 10 grados, olla desplazada hasta 20 mm) sirven para analizar qué ejes de variación degradan más la política.
- Prueba de restricciones físicas en simulación: los criterios de éxito incluyen límites de fuerza y distancia entre eslabones, útiles para investigar cómo imponer seguridad en políticas aprendidas.
- Referencia para transferencia sim-a-real: la model card detalla advertencias concretas sobre el montaje de la mano y la conversión de la articulación 6, lo que lo convierte en material para estudiar los fallos típicos de calibración al pasar del simulador al robot.
- Docencia en robótica de manipulación: la especificación del evaluador `evaluate_chain_pour_tray` y los criterios de aceptación son un ejemplo didáctico de diseño de métricas de éxito no triviales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La evaluación en bucle cerrado está en curso según la model card. Los únicos datos cuantitativos publicados son de recolección y cobertura del profesor, no del estudiante:

| Métrica del profesor | Valor |
|---|---|
| Episodios aceptados en arranques nuevos | 390 de 390 |
| Episodios aceptados en arranques de entrenamiento | 340 de 340 |
| Arranques reservados superados antes de la recolección | 25 de 25 |
| Altura media de la mano sobre la mesa en pickup | 73,1 mm (mínimo 69,6 mm) |
| Solapamiento máximo entre eslabones no vecinos | 0,56 mm |
| Episodios con eslabón del robot sobre la bandeja | 0 de 390 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del checkpoint no se desglosa y la cuantización no está documentada.
- GPU de entrenamiento documentada: NVIDIA H200.
- GPU recomendadas para inferencia: no disponible; al derivar de π0.5, es previsible que requiera GPU de centro de datos, pero no se confirma en la información.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: bundle de serving incluido en el repositorio, generado con openpi. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La política opera a 10 Hz según la frecuencia de las observaciones del dataset.

## Comparativa con modelos similares

| Modelo | Base | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Superstar111/pour_v2_1cmd` | π0.5 + openpi | Pickup, scoop y pour con una sola instrucción | no disponible | no disponible | Hugging Face |
| `Superstar111/pour_v2` | π0.5 + openpi | Misma tarea con una instrucción por fase | no disponible | no disponible | Hugging Face |
| `Superstar111/b1_v2` | π0.5 + openpi | Tarea previa con profesor relacionado | no disponible | no disponible | Hugging Face |
| π0.5 (base) | — | Política VLA generalista de Physical Intelligence | no disponible | no disponible en esta ficha | Repositorio openpi |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente en simulación (Isaac Lab); no se ha ejecutado en el robot real, por lo que no hay evidencia de transferencia sim-a-real.
- Evaluación en bucle cerrado pendiente: la model card indica que los números se añadirán y que la ficha se reemplazará por la versión completa.
- Advertencia explícita sobre el montaje de la mano: se entrenó con el montaje girado como modelo principal, por lo que no debe aplicarse la conversión de la articulación 6 de los cinco checkpoints anteriores. En simulación, la articulación 6 lee +7,9 grados en la postura de reposo con la palma hacia abajo, sin offset.
- Sesgos conocidos: no documentados.
- Riesgo de alucinación: no aplica en el sentido de texto generativo, pero sí existe riesgo de acciones fuera de distribución ante escenas no cubiertas por los bins de variación (por ejemplo, cambios en las poses de cámara, iluminación, posición inicial del brazo o la mesa, que no se variaron).
- Restricciones de licencia: no disponible; no se puede confirmar el uso comercial.
- Idiomas soportados: no disponible.
- Cobertura limitada a un objeto y una tarea: cuchara, garbanzos, bandeja, olla y quemador con variaciones acotadas; no es un modelo generalista.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Superstar111/pour_v2_1cmd
- Modelo gemelo: https://huggingface.co/Superstar111/pour_v2
- Modelo previo relacionado: https://huggingface.co/Superstar111/b1_v2
- Repositorio openpi: https://github.com/Physical-Intelligence/openpi
