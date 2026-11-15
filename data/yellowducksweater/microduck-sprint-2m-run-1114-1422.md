# YellowDuckSweater/microduck-sprint-2m-run-1114-1422

## Resumen

microduck-sprint-2m-run-1114-1422 es una política de control entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo microduck de Pollen Robotics. No es un modelo de lenguaje ni un sistema multimodal: es una política de locomoción que mapea observaciones de 61 dimensiones a 14 acciones de control a 50 Hz, concebida para ejecutarse de forma continua (perpetua) hasta que el operador la detenga. El autor es el usuario YellowDuckSweater y el artefacto se publica en formato ONNX, con la normalización de observaciones embebida en el propio grafo.

La relevancia de esta ficha es acotada y muy específica: se trata de un checkpoint de un experimento de RL (task_id `Mjlab-Sprint2m-MicroDuck`) orientado a que el robot mantenga una marcha de sprint de forma indefinida. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo es de 0.0 GB, lo que sugiere que los pesos son muy ligeros, coherente con una política de control de pequeña dimensión. La model card es extremadamente escueta y no aporta información sobre arquitectura interna de la red, número de parámetros ni composición del dataset de entrenamiento.

El modelo se enmarca en el ecosistema `microduck` (librería `microduck`, pipeline `robotics`) y se carga en el robot mediante la herramienta `robotctl`, que lo asigna a un slot de política. Su utilidad práctica está restringida a la robótica de locomoción con hardware microduck y a la reproducción de experimentos de RL con el framework mjlab.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de política para control robótico (entrenada con RL en mjlab); topología interna no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; observación de 61 dimensiones, 14 acciones, 50 Hz) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del policy manifest de microduck) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red neuronal (capas, anchura, función de activación ni tipo de política, p. ej. MLP o red recurrente). Lo que sí se documenta es la interfaz: observación de 61 dimensiones, 14 acciones y frecuencia de control de 50 Hz, con normalización de observaciones integrada en `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo. El despliegue se realiza cargando el artefacto en un slot de política del daemon de microduck mediante `robotctl policy load`.

El entrenamiento se realizó con el framework mjlab (base `mjlab-microduck 0.1.0 @ 1efd853be`), tarea `Mjlab-Sprint2m-MicroDuck`, commit `c59e995d3` del repositorio `StephenForte/microduck-challenges`, checkpoint 3750, semilla 6, con 4096 entornos paralelos y un máximo de 3888 iteraciones del agente. El autor advierte explícitamente que el entrenamiento no es bit-reproducible entre máquinas: repetir el comando con el mismo `uv.lock` y la misma semilla produce una política comparable, no idénticos pesos. No se documenta composición del dataset (al tratarse de RL en simulación, la "data" es la dinámica del entorno), ni uso de RLHF/DPO, ni innovaciones técnicas adicionales.

## Capacidades

- Locomoción continua tipo sprint para el robot microduck: política perpetua que se ejecuta hasta que se le indique lo contrario.
- Control a 50 Hz con observaciones de 61 dimensiones y 14 acciones, adecuado para bucles de control en tiempo real.
- Normalización de observaciones embebida en el ONNX, lo que simplifica la integración (entrada en crudo).
- Carga y gestión mediante slots de política con `robotctl`.
- Reproducibilidad de la configuración de entrenamiento (código, `uv.lock`, comando y semilla documentados).
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Locomoción de sprint en el robot microduck: cargar la política en un slot con `robotctl policy load <slot> YellowDuckSweater/microduck-sprint-2m-run-1114-1422` y dejar que el robot mantenga la marcha de forma indefinida; es el caso de uso directo para el que se entrenó.
- Demostraciones de robótica cuadrúpeda: útil para exhibir una marcha estable en talleres, ferias o vídeos, dado que la política es perpetua y no requiere reinicio periódico.
- Investigación en RL aplicado a control: sirve como checkpoint de referencia de la tarea `Mjlab-Sprint2m-MicroDuck` para comparar con otras políticas entrenadas con la misma configuración.
- Reproducción de experimentos: el comando de entrenamiento documentado permite regenerar una política comparable y validar pipelines de mjlab con 4096 entornos en paralelo.
- Integración en pipelines de control propios: el formato ONNX con normalización embebida permite cargar `policy.onnx` en runtimes ONNX fuera del daemon, siempre que se respete la interfaz de 61 observaciones y 14 acciones a 50 Hz.
- Evaluación de robustez de locomoción: al ser una política perpetua, se puede someter al robot a pruebas de resistencia y deriva a lo largo del tiempo sin reinicios de política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repo es de 0.0 GB y la política es de control de pequeña dimensión, por lo que la huella de memoria es mínima (no se publican cifras).
- GPU recomendadas: no aplica para inferencia en el robot (la política se ejecuta en el daemon de microduck); para reentrenar, el autor emplea 4096 entornos paralelos, lo que requiere GPU de datacenter (no se especifica modelo).
- ¿Cabe en GPU consumer? Sí, con alta probabilidad, dado el tamaño reducido del artefacto, aunque no se documenta el requisito exacto.
- Opciones de despliegue: `robotctl` (carga en slots de política del daemon microduck) y runtime ONNX genérico para `policy.onnx`.
- Latencia y throughput: no disponibles; la frecuencia de control es de 50 Hz (periodo de 20 ms).

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otras políticas de locomoción comparables para el mismo robot o la misma tarea.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución de los pesos; conviene contactar con el autor antes de usos productivos.
- Model card mínima: no se documentan arquitectura interna, número de parámetros, composición del entrenamiento ni métricas de rendimiento.
- No reproducibilidad bit a bit: el propio autor advierte que reentrenar con la misma semilla produce una política comparable, no idéntica.
- Especialización extrema: la política solo sirve para microduck y la tarea de sprint; no es transferible a otros robots ni tareas sin reentrenamiento.
- Riesgo de fallo fuera de distribución: al ser una política de RL entrenada en simulación, su comportamiento ante perturbaciones no modeladas (terrenos irregulares, empujes, desgaste del hardware) no está documentado.
- Sin datos de sesgos, alucinación o limitaciones de idioma aplicables, por no ser un modelo lingüístico.

## Enlaces

- Hugging Face: https://huggingface.co/YellowDuckSweater/microduck-sprint-2m-run-1114-1422
- Repositorio de entrenamiento: https://github.com/StephenForte/microduck-challenges
- Proyecto microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
