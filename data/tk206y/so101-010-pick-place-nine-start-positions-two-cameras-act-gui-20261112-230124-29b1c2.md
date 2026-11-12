# tk206y/so101-010-pick-place-nine-start-positions-two-cameras-act-gui-20261112-230124-29b1c2

## Resumen

El modelo `tk206y/so101-010-pick-place-nine-start-positions-two-cameras-act-gui-20261112-230124-29b1c2` es una política de robótica entrenada con el algoritmo ACT (Action Chunking with Transformers) sobre el brazo robótico de bajo coste SO-101, dentro del ecosistema LeRobot de Hugging Face. Lo publica el usuario `tk206y` como parte de una serie numerada de experimentos (007, 008, 009, 010) orientados a mejorar la precisión de agarre en tareas de pick-and-place.

El modelo resuelve una tarea concreta: recoger una pelota amarilla situada en uno de nueve puntos de partida dentro de un marco y depositarla sobre una base negra fija. La novedad del experimento 010 respecto a iteraciones anteriores es el uso de dos cámaras (una frontal externa y otra en la muñeca) para comprobar si la observación de la posición relativa desde la muñeca mejora el agarre cuando la posición inicial varía.

Se trata de un artefacto de investigación, no de un modelo de propósito general: el propio autor advierte que depende de una máquina, calibración, postura de origen, disposición de cámaras y entorno de trabajo específicos, y que no ha sido validado en otras condiciones. La model card no publica resultados de evaluación ni métricas de éxito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), según la librería LeRobot |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de control robótico, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (artefacto LeRobot; la model card no detalla el formato de checkpoint) |

## Arquitectura y entrenamiento

El modelo emplea ACT, una arquitectura transformer diseñada para imitación robótica que predice secuencias de acciones (chunks) a partir de observaciones visuales y del estado del robot. La entrada combina dos flujos de cámara (frontal y de muñeca) junto con el estado de las articulaciones, y la salida es una trayectoria de acciones que se ejecutan en el robot SO-101.

El entrenamiento se realizó durante 100 000 pasos con un tamaño de lote de 8, sobre un conjunto de 45 demostraciones teleoperadas recogidas específicamente para esta tarea. El dataset de entrenamiento (`tk206y/so101-010-pick-place-nine-start-positions-two-cameras-data`) es privado y no se publica. El autor menciona que también existe un checkpoint intermedio de 10 000 pasos para comparar el efecto de la cantidad de entrenamiento sobre el comportamiento, pero no se aportan resultados de esa comparación. No se documenta uso de RLHF, DPO ni técnicas de refinamiento posteriores; se trata de aprendizaje por imitación supervisado.

## Capacidades

- Ejecución de una tarea de pick-and-place: agarrar una pelota amarilla y colocarla sobre una base negra fija.
- Generalización limitada a nueve posiciones de inicio predefinidas dentro de un marco.
- Percepción visual con dos cámaras (frontal y de muñeca) para estimar la posición relativa del objeto.
- Control de un brazo robótico SO-101 en un entorno y calibración concretos.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No tiene capacidades multilingües, de visión general, audio ni modo de razonamiento.

## Casos de uso

- Investigación en aprendizaje por imitación: sirve como referencia reproducible de un pipeline ACT completo (datos, entrenamiento, checkpoint) para estudiar cómo afecta el número de cámaras a la precisión de agarre.
- Estudio de la contribución de la cámara de muñeca: permite comparar frente a los experimentos 007, 008 y 009 del mismo autor si la observación desde la muñeca mejora el agarre cuando la posición inicial varía.
- Análisis del efecto de la cantidad de entrenamiento: el autor publica checkpoints de 10 000 y 100 000 pasos para comparar la evolución del comportamiento.
- Base para experimentos de ablación: se puede reentrenar o ajustar sobre el mismo esquema de dos cámaras para evaluar variaciones en la disposición de sensores.
- Docencia y divulgación de robótica de bajo coste: el SO-101 y LeRobot permiten montar un banco de pruebas asequible para demostrar políticas de imitación.
- Reutilización como punto de partida en tareas similares: con recalibración y recolección de datos propios, el esquema puede adaptarse a otros objetos o posiciones, aunque el autor no valida esa transferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente "記録なし" (sin registros) en las secciones de resultados y de discusión, y remite a un documento de experimento (`experiment.md`) que no forma parte de la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; ACT es una política ligera comparada con modelos de lenguaje, pero la model card no especifica tamaño ni requisitos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; por la naturaleza de ACT y del SO-101, es plausible que funcione en GPUs modestas, pero no hay dato confirmado.
- Opciones de despliegue: la librería indicada es LeRobot; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de política).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tarea | Cámaras | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| so101-010 (este modelo) | ACT | Pick-and-place en 9 posiciones | 2 (frontal + muñeca) | Apache 2.0 | Hugging Face, pesos públicos, dataset privado |
| so101-009 (mismo autor, referenciado) | ACT | Pick-and-place con configuración fija | 2 | no disponible en la información | Referenciado en la model card, sin enlace directo |
| so101-008 (mismo autor, referenciado) | ACT | Pick-and-place en 9 posiciones | no disponible | no disponible en la información | Referenciado en la model card, sin enlace directo |
| Políticas ACT genéricas de LeRobot | ACT | Tareas diversas de manipulación | variable | Apache 2.0 (LeRobot) | Repositorio LeRobot |

No se dispone de datos de rendimiento comparables entre estos modelos; la comparativa se limita a la configuración experimental descrita.

## Limitaciones y advertencias

- Dependencia total del entorno: el modelo está entrenado para una máquina, calibración, postura de origen, disposición de cámaras y entorno concretos; el autor advierte que no es un modelo genérico para otras máquinas.
- Sin validación externa: no se han publicado resultados de éxito ni métricas de evaluación; las secciones de resultados y discusión están vacías.
- Dataset privado: el conjunto de 45 demostraciones no es público, lo que dificulta la reproducibilidad completa.
- Tarea muy restringida: solo agarra una pelota amarilla en nueve posiciones y la deposita en una base fija; no generaliza a otros objetos ni disposiciones.
- Riesgo de fallo en producción: en experimentos previos (007, 008) persistieron desalineaciones de agarre y fallos en vacío; no hay evidencia de que 010 los resuelva.
- Licencia Apache 2.0: permite uso comercial y modificación, pero la falta de garantías y de validación hace desaconsejable su uso en producción sin reevaluación propia.
- Sin información sobre sesgos, alucinación o idiomas: no aplica en el sentido habitual, pero tampoco se documenta ningún análisis de robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tk206y/so101-010-pick-place-nine-start-positions-two-cameras-act-gui-20261112-230124-29b1c2
- Dataset de entrenamiento (privado, referenciado): `tk206y/so101-010-pick-place-nine-start-positions-two-cameras-data`
- Documento de experimento (referenciado en la model card): `experiment.md`
- LeRobot (librería): https://github.com/huggingface/lerobot
- SO-101 (robot): no disponible en la información proporcionada
