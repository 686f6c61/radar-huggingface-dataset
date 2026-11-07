# YellowDuckSweater/microduck-roller-sprint-2m-run-1106-1647-15

## Resumen

microduck-roller-sprint-2m-run-1106-1647-15 es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. No es un modelo de lenguaje: es un controlador neuronal que mapea observaciones de 61 dimensiones a 14 acciones de actuación a 50 Hz, diseñado para hacer que el robot avance de forma perpetua sobre ruedas (rollers). El autor del repositorio es el usuario YellowDuckSweater y el modelo se publica en formato ONNX con la librería microduck.

La relevancia de esta ficha es acotada: se trata de un artefacto de experimentación dentro del ecosistema microduck, con cero descargas y cero likes en el momento de la consulta, y una model card mínima que incluye un texto de relleno ("blah blah"). No debe confundirse con un modelo fundacional ni con un sistema de propósito general; su interés es exclusivamente para quienes trabajan con el simulador mjlab y el daemon robotctl de microduck.

El modelo se entrenó con la tarea `Mjlab-RollerSprint2m-MicroDuck` sobre el framework mjlab (versión 0.1.0), con 4096 entornos paralelos y hasta 3000 iteraciones, fijando la semilla 7. La política resultante es "perpetua": una vez cargada en una ranura de política del robot, ejecuta la marcha hasta que se le indique lo contrario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política neuronal para control robótico; red feedforward entrenada con RL, detalles no publicados) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (observación de 61 dimensiones por paso, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos exportados a ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y manifiesto `manifest.json` (schema 2 del microduck policy manifest) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red (número de capas, anchura, función de activación ni tipo de política, p. ej. MLP o red recurrente). Lo que sí se documenta es el pipeline de entrenamiento: la tarea `Mjlab-RollerSprint2m-MicroDuck` se ejecuta sobre mjlab 0.1.0 (commit base `1efd853be`), con 4096 entornos simulados en paralelo, un máximo de 3000 iteraciones del agente y semilla 7. El checkpoint publicado corresponde a la iteración 1000. El repositorio de entrenamiento es `StephenForte/microduck-challenges`, rama `main`, commit `7765dd417`.

Una innovación práctica destacable es que el normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que el robot puede alimentar observaciones en bruto sin preprocesado externo. El autor advierte explícitamente que el entrenamiento con RL en GPU no es bit-reproducible entre máquinas: repetir el comando con el mismo `uv.lock` y la misma semilla produce una política comparable, no idéntica. No se documenta el uso de RLHF, DPO ni datos supervisados, lo cual es coherente con un pipeline de RL puro en simulación.

## Capacidades

- Locomoción perpetua sobre ruedas: ejecuta una marcha continua ("sprint") que se mantiene hasta recibir una orden de parada o cambio de política.
- Control a 50 Hz con 14 acciones de salida y 61 dimensiones de observación, adaptado a la morfología y sensórica del microduck.
- Integración con el daemon del robot mediante `robotctl policy load <slot>`, lo que permite cargarla en una ranura de política junto con otras habilidades (caminar, estar de pie, sentarse/levantarse, recoger del suelo, patadas, voltereta).
- Inferencia autocontenida en ONNX: el normalizador de observaciones va incluido en el grafo, simplificando el despliegue en el robot.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades multilingües ni modo de pensamiento; no es un modelo de lenguaje ni un agente conversacional.

## Casos de uso

- Demostración de locomoción en microduck: cargar la política en una ranura y observar el desplazamiento continuo sobre ruedas como ejemplo de política RL entrenada en mjlab.
- Investigación en aprendizaje por refuerzo sim-a-real: servir como punto de partida reproducible (commit y semilla documentados) para comparar variantes de entrenamiento en la tarea `Mjlab-RollerSprint2m-MicroDuck`.
- Benchmark interno de políticas de marcha: al ser una política perpetua concreta, permite medir estabilidad, consumo y velocidad frente a otras políticas del mismo robot (por ejemplo, las publicadas por GinDuck).
- Docencia y talleres de robótica: ilustra el flujo completo desde el entrenamiento en simulador con 4096 entornos hasta el despliegue en hardware real mediante `robotctl`.
- Pruebas de integración del daemon: valida el esquema 2 del manifiesto de políticas y el mecanismo de carga de políticas en ranuras del robot.
- Base para experimentos de composición de habilidades: al convivir en ranuras con políticas de caminar o estar de pie, permite estudiar transiciones entre habilidades sobre el mismo robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, velocidad de avance, estabilidad ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB según Hugging Face, lo que sugiere un artefacto ONNX muy pequeño, pero no se publican parámetros ni tamaño exacto del fichero.
- GPU recomendadas: no aplica para inferencia en el robot; el modelo está pensado para ejecutarse en el propio microduck a 50 Hz. Para reentrenar, el comando documentado usa 4096 entornos paralelos, lo que requiere una GPU de gama alta (el autor no especifica modelo).
- Cabe en GPU de consumo: probablemente sí para inferencia dada la naturaleza del artefacto, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: `robotctl policy load` sobre el daemon de microduck con runtime ONNX; no se documentan vLLM, llama.cpp, Ollama ni TGI (no son aplicables).
- Latencia y throughput: no disponibles; el único dato es la frecuencia de control de 50 Hz.

## Comparativa con modelos similares

| Modelo | Tipo | Observaciones | Acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| YellowDuckSweater/microduck-roller-sprint-2m-run-1106-1647-15 | Política RL sobre ruedas | 61-D | 14 | 50 Hz | no disponible | Hugging Face |
| YellowDuckSweater/microduck-sprint-2m-run-1106-0945 | Política RL (variante sprint) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| GinDuck/microduck-roller-sprint-2m-roller-1 | Política RL sobre ruedas | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas políticas; la comparación se limita a su existencia y categoría.

## Limitaciones y advertencias

- Model card prácticamente vacía: contiene texto de relleno ("blah blah") y no documenta arquitectura, métricas ni limitaciones, lo que impide evaluar su calidad con rigor.
- Licencia no disponible: no se puede asumir permiso para uso comercial ni redistribución; conviene contactar con el autor antes de cualquier uso en producción.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- Entrenada específicamente para desplazamiento sobre ruedas en el microduck; no es transferible a otros robots ni a otras tareas sin reentrenamiento.
- No es reproducible bit a bit: el propio autor advierte que el mismo comando y semilla producen pesos distintos en máquinas diferentes.
- Riesgo de fallo sim-a-real no cuantificado: no se publican pruebas en hardware físico ni tasas de éxito.
- No es un modelo de lenguaje: no admite prompts, tool calling ni razonamiento; cualquier uso fuera del control robótico del microduck es inadecuado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YellowDuckSweater/microduck-roller-sprint-2m-run-1106-1647-15
- Repositorio de entrenamiento: https://github.com/StephenForte/microduck-challenges
- Proyecto microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Modelo comparable (mismo autor): https://huggingface.co/YellowDuckSweater/microduck-sprint-2m-run-1106-0945
- Modelo comparable (otro autor): https://huggingface.co/GinDuck/microduck-roller-sprint-2m-roller-1
