# YellowDuckSweater/microduck-tug-of-war-run-1106-0803-010

## Resumen

`microduck-tug-of-war-run-1106-0803-010` es una política de control motriz entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No es un modelo de lenguaje: es un controlador neuronal que recibe observaciones de 61 dimensiones (estado de articulaciones, sensores inerciales y consignas de tarea) y emite 14 acciones de control a 50 Hz, empaquetado como grafo ONNX. Lo publica el usuario YellowDuckSweater como primer experimento ("first run") dentro del repositorio de retos `microduck-challenges`.

El modelo resuelve una tarea concreta de locomoción y forcejeo (`Mjlab-TugOfWar-MicroDuck`): una política perpetua que mantiene la marcha indefinidamente hasta que se le ordene lo contrario. Su relevancia es acotada pero clara para quien investiga RL aplicado a robótica de bajo coste: demuestra el flujo completo de entrenamiento con mjlab (4096 entornos paralelos, 1000 iteraciones), exportación a ONNX con el normalizador de observaciones embebido y despliegue directo en hardware mediante el daemon `robotctl`.

El repositorio es de tamaño prácticamente nulo (0.0 GB reportados), sin descargas ni valoraciones, licencia no declarada e idiomas no aplicables. Debe tratarse como un artefacto de investigación reproducible, no como un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política neuronal de RL exportada a ONNX (sin detalle de capas en la información disponible) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; ventana de observación de 61 dimensiones por paso) |
| Tipos de cuantización | no disponible (se distribuye como `policy.onnx`; normalizador de observaciones embebido) |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck |
| Frecuencia de control | 50 Hz |
| Dimensión de observación | 61 |
| Dimensión de acción | 14 |
| Librería | microduck |
| Pipeline | robotics |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (número de capas, anchura, función de activación). Lo que sí se documenta es el pipeline de entrenamiento: la política se entrena con mjlab sobre la tarea `Mjlab-TugOfWar-MicroDuck`, definida en el repositorio `StephenForte/microduck-challenges` (rama `main`, commit `bd12f1691`), usando la base `mjlab-microduck 0.1.0` en el commit `1efd853be`. La ejecución registrada emplea 4096 entornos paralelos, un máximo de 1000 iteraciones del agente, semilla 1 y registro en TensorBoard, con nombre de ejecución `run-1106-0803-010`; el checkpoint publicado corresponde al paso 250.

El artefacto se distribuye como un grafo ONNX que incorpora el normalizador de observaciones, de modo que el robot puede alimentar observaciones en bruto directamente. El autor advierte explícitamente que el entrenamiento no es reproducible bit a bit entre máquinas: repetir el comando con el mismo `uv.lock` y la misma semilla produce una política comparable, no idéntica. El manifiesto sigue el esquema 2 descrito en `docs/policy-manifest.md` del repositorio del daemon.

## Capacidades

- Control locomotor continuo del microduck a 50 Hz con 14 acciones articulares.
- Política perpetua: mantiene la marcha indefinidamente hasta recibir una orden de parada o sustitución.
- Consumo de observaciones en bruto de 61 dimensiones gracias al normalizador embebido en el ONNX.
- Tarea específica de forcejeo/tirón (`TugOfWar`), orientada a resistencia y tracción sostenida.
- Carga en una ranura de política del daemon mediante `robotctl policy load`.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, visión ni audio: no es un modelo fundacional.
- Multilingüismo: no aplica.

## Casos de uso

- Investigación en RL para robótica de bajo coste: sirve como referencia reproducible de un ciclo completo entrenamiento-exportación-despliegue sobre mjlab, con comando exacto, commit y semilla documentados.
- Pruebas de tracción y resistencia en el microduck: la tarea de forcejeo permite evaluar el comportamiento del robot bajo cargas sostenidas y comprobar la estabilidad de la política en el tiempo.
- Benchmark de políticas: al existir otras ejecuciones del mismo reto publicadas por otros usuarios (por ejemplo, `GinDuck/microduck-tug-of-war-run-1031-1409`), puede usarse como punto de comparación cualitativa entre entrenamientos.
- Validación de la cadena de despliegue `robotctl`: útil para verificar la carga de políticas en ranuras, el cumplimiento del esquema 2 del manifiesto y la integración del normalizador en el grafo ONNX.
- Base para ajuste fino o continuación del entrenamiento: el repositorio de retos y el `uv.lock` permiten reanudar con distintas semillas o hiperparámetros para estudiar varianza entre ejecuciones.
- Demostración educativa: ilustra cómo una política de RL se empaqueta como artefacto ONNX portable y se ejecuta en un cuadrúpedo real sin dependencias de framework en el robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio se reporta como 0.0 GB, lo que sugiere un grafo ONNX muy pequeño, pero no se confirma la cifra de parámetros.
- GPU recomendadas: no disponibles para inferencia; para reentrenar, el comando documentado asume aceleración por GPU (el autor menciona que el RL en GPU no es reproducible bit a bit entre máquinas) con 4096 entornos paralelos, lo que en la práctica exige hardware de datacenter.
- Viabilidad en GPU de consumo: no confirmada. Por el tamaño aparente del artefacto, la inferencia ONNX debería caber en cualquier GPU de consumo e incluso ejecutarse en CPU, pero esto no está documentado.
- Opciones de despliegue: runtime ONNX en el propio robot a través del daemon microduck (`sudo robotctl policy load <slot> ...`); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: la política está diseñada para operar a 50 Hz (periodo de 20 ms por paso de control); no se publican mediciones de latencia real ni de utilización de hardware.

## Comparativa con modelos similares

| Modelo | Tarea | Formato | Frecuencia | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| YellowDuckSweater/microduck-tug-of-war-run-1106-0803-010 | TugOfWar (microduck) | ONNX + manifest | 50 Hz | mjlab, 4096 envs, 1000 iter, seed 1, checkpoint 250 | no disponible | Hugging Face, 0 descargas |
| GinDuck/microduck-tug-of-war-run-1031-1409 | TugOfWar (microduck) | ONNX + manifest (según model card) | 50 Hz (por la plataforma) | no disponible en la información | no disponible | Hugging Face |
| Otras políticas del reto microduck (ranuras walk, stand, sitstand, ground_pick, kick_left, kick_right, roulade) | Locomoción y habilidades varias | ONNX + manifest | 50 Hz (por la plataforma) | no disponible | no disponible | Hugging Face |

La comparación cuantitativa de rendimiento entre estas políticas no está disponible: no se publican métricas de recompensa, estabilidad ni tasa de éxito en ninguno de los artefactos consultados.

## Limitaciones y advertencias

- Licencia no declarada: no hay autorización explícita de uso comercial ni de redistribución; trátese como no apto para producción hasta que el autor la especifique.
- Es un primer experimento ("first run") con checkpoint en el paso 250 de un máximo de 1000 iteraciones; la política puede estar infraentrenada respecto a ejecuciones más largas.
- Tarea única y estrecha: solo cubre el escenario de forcejeo; no sirve para otras habilidades del robot sin reentrenamiento.
- No reproducible bit a bit: los pesos no pueden regenerarse de forma idéntica, lo que complica la auditoría y la comparación exacta entre ejecuciones.
- Sin métricas publicadas: no hay benchmarks, curvas de recompensa ni evaluaciones de robustez, de modo que la calidad real de la política no puede verificarse a partir de la información disponible.
- Dependencia del esquema 2 del manifiesto y de una versión concreta del daemon: cambios en `docs/policy-manifest.md` o en `robotctl` pueden romper la compatibilidad.
- Riesgo físico inherente: una política perpetua de tracción en un robot real puede generar esfuerzos sostenidos sobre actuadores y estructura; requiere supervisión y límites de par en el hardware.
- Sesgos y alucinación: no aplican en el sentido de los modelos de lenguaje, pero sí existe el riesgo de comportamientos fuera de distribución ante observaciones no vistas durante el entrenamiento.
- Cero descargas y cero valoraciones: no hay evidencia de uso independiente que respalde su fiabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YellowDuckSweater/microduck-tug-of-war-run-1106-0803-010
- Repositorio de retos y entrenamiento: https://github.com/StephenForte/microduck-challenges
- Proyecto microduck de Pollen Robotics: https://github.com/pollen-robotics/microduck
- Ejecución comparable de otro autor: https://huggingface.co/GinDuck/microduck-tug-of-war-run-1031-1409
- Árbol de ficheros de esa ejecución comparable: https://huggingface.co/GinDuck/microduck-tug-of-war-run-1031-1409/tree/main
