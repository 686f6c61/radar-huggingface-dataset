# tk206y/so101-010-pick-place-nine-start-positions-two-cameras-act-hf-regress-20261119

## Resumen

SO101-010 es un modelo de política robótica entrenado con el algoritmo ACT (Action Chunking with Transformers) sobre el brazo manipulador SO-101, publicado por el usuario tk206y en Hugging Face. No es un modelo de lenguaje ni un modelo generativo de propósito general: es un checkpoint de control motor que aprende a ejecutar una tarea de pick-and-place concreta (coger una pelota amarilla dentro de un marco y dejarla sobre una base negra fija) a partir de observaciones de dos cámaras (frontal y de muñeca) y de nueve posiciones de inicio distintas.

El modelo se enmarca en una serie de experimentos del mismo autor (identificados como 007, 008, 009 y 010) que investigan cómo la observación de la posición relativa desde la cámara de muñeca ayuda en tareas donde la posición inicial varía. El checkpoint publicado corresponde a un entrenamiento corto de 1000 pasos con batch de 8 sobre 45 episodios de demostración, y el autor indica que se comparará con un entrenamiento de 10 000 y 100 000 pasos para estudiar el efecto de la cantidad de entrenamiento.

Es relevante para investigadores de robótica de imitación porque documenta un caso reproducible de ACT con configuración multi-cámara sobre hardware accesible (SO-101), y porque explicita sus limitaciones: dependencia de la máquina, calibración, pose de home, disposición de cámaras y entorno concretos, sin validación fuera de ese montaje. La model card no reporta resultados de evaluación ni métricas de éxito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación para control robótico |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; procesa observaciones de 2 cámaras por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (checkpoint LeRobot; la model card no detalla el formato de serialización) |

## Arquitectura y entrenamiento

La arquitectura es ACT (Action Chunking with Transformers), una política de imitación que predice secuencias de acciones (chunks) a partir de observaciones visuales y del estado del robot, habitual en el ecosistema LeRobot. El modelo consume dos flujos de cámara, frontal y de muñeca, y produce comandos de control para el brazo SO-101.

El entrenamiento se realizó sobre un dataset propio no publicado (`tk206y/so101-010-pick-place-nine-start-positions-two-cameras-data`) compuesto por 45 episodios de demostración, con 1000 pasos de entrenamiento y batch de 8. La tarea consiste en coger una pelota amarilla situada en nueve posiciones de inicio dentro de un marco y depositarla sobre una base negra fija. El objetivo experimental es evaluar si la observación de la posición relativa desde la cámara de muñeca mejora el agarre cuando la posición inicial varía, comparando además con entrenamientos de 10 000 y 100 000 pasos. No se documentan técnicas de RLHF, DPO ni decodificación especulativa, por tratarse de un modelo de control motor.

## Capacidades

- Control robótico de pick-and-place: ejecuta la tarea de coger una pelota amarilla y dejarla sobre una base negra fija.
- Percepción multi-cámara: integra observaciones de cámara frontal y cámara de muñeca.
- Generalización limitada a nueve posiciones de inicio de la pelota dentro de un marco, según el diseño del dataset.
- Ejecución de políticas de imitación tipo ACT con predicción de chunks de acciones.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, capacidades de agente ni multilingüismo.

## Casos de uso

- Reproducción de experimentos de imitación robótica: sirve como checkpoint de referencia para comparar el efecto del número de pasos de entrenamiento (1000 frente a 10 000 y 100 000) en una misma tarea de pick-and-place con SO-101.
- Investigación sobre percepción de muñeca: permite estudiar si la cámara de muñeca aporta información de posición relativa útil para el agarre cuando la posición inicial del objeto cambia.
- Benchmark interno de políticas ACT: útil como línea base de bajo coste computacional (1000 pasos, batch 8) para comparar arquitecturas o configuraciones de cámaras en el mismo montaje.
- Docencia y demostración de LeRobot: ilustra un pipeline completo de recogida de datos, entrenamiento y despliegue de una política de imitación sobre hardware SO-101.
- Estudio de robustez frente a variación de posición inicial: el dataset con nueve posiciones de inicio permite analizar la tasa de éxito en función de la posición de la pelota.
- Depuración de montajes multi-cámara: sirve para validar calibración, pose de home y sincronización de las dos cámaras antes de entrenamientos más largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente "registro de resultados: ninguno" y remite a un documento de experimento (`experiment.md`) que no forma parte de la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el número de parámetros no se documenta).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ecosistema LeRobot (`library_name: lerobot`); no se detallan otros runners (vLLM, llama.cpp, Ollama, TGI) y, por el tipo de modelo, no serían aplicables.
- Latencia y throughput: no disponible.
- Requisito adicional: brazo SO-101 físico con calibración, pose de home y disposición de cámaras equivalentes al montaje de entrenamiento.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SO101-010 (este modelo) | ACT sobre SO-101, 2 cámaras, 9 posiciones de inicio, 1000 pasos | no disponible | no disponible | Apache 2.0 | Hugging Face (tk206y) |
| SO101-009 (mismo autor) | ACT sobre SO-101, 2 cámaras, configuración fija | no disponible | no disponible | no disponible | Referenciado en la model card, sin enlace |
| SO101-008 (mismo autor) | ACT sobre SO-101, 9 posiciones, 100 000 pasos | no disponible | no disponible | no disponible | Referenciado en la model card, sin enlace |
| SO101-007 (mismo autor) | ACT sobre SO-101, experimento previo de pick-and-place | no disponible | no disponible | no disponible | Referenciado en la model card, sin enlace |

No se dispone de datos de benchmarks ni de especificaciones técnicas de los modelos comparables en la información proporcionada; la comparación se limita al diseño experimental descrito.

## Limitaciones y advertencias

- Dependencia del montaje físico: el modelo está ligado a una máquina, calibración, pose de home, disposición de cámaras y entorno concretos; su comportamiento en otros montajes no ha sido validado.
- No es un modelo de propósito general: no debe aplicarse directamente a otro robot o entorno sin reentrenamiento o recalibración.
- Entrenamiento corto: solo 1000 pasos y 45 episodios, lo que puede implicar agarres imprecisos o fallos (el autor menciona que en experimentos previos persistían desviaciones de agarre y fallos en vacío).
- Ausencia de métricas: no se publican tasas de éxito, latencia ni resultados de evaluación, lo que impide valorar su rendimiento de forma objetiva.
- Dataset no público: los datos de entrenamiento (`...-data`) no están disponibles, lo que limita la reproducibilidad.
- Sin materiales originales: la model card indica que no se incluyen vídeos de recogida, vídeos de evaluación ni registros originales.
- Sin capacidades lingüísticas ni de razonamiento: no es adecuado para tareas de NLP, visión general o agentes de software.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero no exime de validar el modelo en el entorno de destino; el autor declara explícitamente que no es un modelo genérico para otra máquina.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tk206y/so101-010-pick-place-nine-start-positions-two-cameras-act-hf-regress-20261119
- Dataset de entrenamiento (no público, referenciado): tk206y/so101-010-pick-place-nine-start-positions-two-cameras-data
- Documento de experimento referenciado en la model card: experiment.md (no incluido en la información disponible)
- LeRobot (librería de despliegue): no disponible en la información proporcionada
- Paper de ACT: no disponible en la información proporcionada
