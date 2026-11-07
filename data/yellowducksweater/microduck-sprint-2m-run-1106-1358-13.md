# YellowDuckSweater/microduck-sprint-2m-run-1106-1358-13

## Resumen

microduck-sprint-2m-run-1106-1358-13 es una política de control entrenada mediante aprendizaje por refuerzo para el robot bípedo microduck, un pequeño robot con forma de pato desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje, sino de una política de locomoción que mapea observaciones de 61 dimensiones a 14 acciones de control a 50 Hz, empaquetada en formato ONNX para su ejecución directa en el robot. El autor del repositorio es el usuario YellowDuckSweater.

La política se presenta como un movimiento perpetuo (perpetual): una vez cargada en una ranura del robot, se ejecuta de forma continua hasta que se le indique lo contrario. La tarea de entrenamiento se denomina `Mjlab-Sprint2m-MicroDuck`, lo que sugiere un objetivo de desplazamiento rápido (sprint) sobre una distancia de 2 metros, entrenado con el framework mjlab sobre el simulador MuJoCo.

El modelo es relevante dentro del nicho de la robótica de bajo coste y el aprendizaje por refuerzo aplicado a robots pequeños, ya que demuestra un flujo de trabajo completo de entrenamiento en simulación y despliegue en hardware real mediante un manifiesto de política estandarizado. La model card es extremadamente escueta y no proporciona datos sobre arquitectura de red, composición del dataset ni resultados de evaluación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL empaquetada en ONNX; arquitectura de red no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y manifiesto JSON (`manifest.json`, esquema 2) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura de la red neuronal de la política. Lo que sí se documenta es la interfaz: observaciones de 61 dimensiones, 14 acciones y una frecuencia de control de 50 Hz. El normalizador de observaciones está integrado dentro del propio `policy.onnx`, de modo que el robot puede alimentar observaciones en bruto sin preprocesado adicional. El manifiesto `manifest.json` sigue el esquema 2 del manifiesto de políticas de microduck, definido en `docs/policy-manifest.md` del repositorio del daemon.

El entrenamiento se realizó con aprendizaje por refuerzo en el framework mjlab (versión base `mjlab-microduck 0.1.0`, commit `1efd853be`), sobre la tarea `Mjlab-Sprint2m-MicroDuck` del repositorio `StephenForte/microduck-challenges` (rama `main`, commit `c8ae7c7ec`). Se usaron 4096 entornos paralelos, un máximo de 3000 iteraciones del agente, semilla 3 y registro en TensorBoard. El checkpoint desplegado es el 750, iniciado el 2026-11-06. El autor advierte explícitamente que el entrenamiento no es reproducible bit a bit entre máquinas: repetir el proceso con el mismo código, `uv.lock`, comando y semilla produce una política comparable, pero no idéntica.

## Capacidades

- Locomoción bípeda continua: ejecuta un patrón de marcha perpetuo hasta que se le indique lo contrario.
- Control reactivo a partir de observaciones de 61 dimensiones (estado propioceptivo del robot).
- Generación de 14 señales de acción a 50 Hz, adecuadas para el control de actuadores del microduck.
- Normalización de observaciones integrada en el modelo ONNX, lo que simplifica la integración en el daemon del robot.
- Despliegue mediante carga en una ranura de política con `robotctl policy load`.
- No soporta tool calling, agentes, razonamiento multi-step, visión, audio ni capacidades multilingües; es una política de control motriz, no un modelo generativo.

## Casos de uso

- Locomoción autónoma del microduck en demostraciones: la política se carga en una ranura y el robot camina de forma continua, lo que permite exhibir el robot en ferias, aulas o vídeos sin intervención manual.
- Investigación en aprendizaje por refuerzo sim-a-real: sirve como referencia de un pipeline completo (entrenamiento en mjlab, exportación a ONNX, despliegue en hardware) para estudiar transferencia de políticas.
- Comparación de políticas en el mismo robot: al cargarse en ranuras independientes, permite alternar entre esta política y otras (por ejemplo, `microduck-sprint-2m-run-1106-0945`) para evaluar diferencias de marcha.
- Docencia en robótica: el flujo reproducible documentado (clonar repositorio, `uv sync`, comando de entrenamiento con semilla fija) permite a estudiantes reproducir el entrenamiento y entender la variabilidad entre ejecuciones.
- Pruebas de integración del daemon: el manifiesto de esquema 2 y el ONNX con normalizador integrado sirven para validar el cargador de políticas del daemon de microduck.
- Base para ajuste fino o continuación de entrenamiento: al estar publicado el repositorio de desafíos y la configuración de la tarea, se puede partir de este checkpoint como inicialización para nuevas tareas de locomoción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, velocidad alcanzada, estabilidad ni tasa de éxito de la tarea `Sprint2m`.

## Requisitos de hardware

- Inferencia en robot: la política se ejecuta en el propio microduck a 50 Hz; el tamaño del repositorio es de 0,0 GB, lo que indica un modelo ONNX de muy pocos parámetros, apto para la electrónica embebida del robot.
- VRAM estimada para inferencia en servidor: no disponible; por el tamaño del artefacto, es despreciable frente a cualquier GPU convencional.
- GPU recomendadas para entrenamiento: no especificadas en la información disponible; el entrenamiento usa 4096 entornos paralelos en mjlab, lo que en la práctica requiere una GPU de datacenter (A100, H100 o similar), aunque el autor no lo documenta.
- ¿Cabe en GPU de consumo? La inferencia sí, con total seguridad, dado el tamaño del ONNX; no se dispone de cifras concretas.
- Opciones de despliegue: ONNX Runtime o el runtime integrado en el daemon de microduck mediante `robotctl policy load`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; la frecuencia de control de 50 Hz fija un presupuesto de 20 ms por ciclo.

## Comparativa con modelos similares

| Modelo | Tipo | Observaciones / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-sprint-2m-run-1106-1358-13 | Política RL (ONNX) | 61 / 14 | 50 Hz | no disponible | Hugging Face |
| microduck-sprint-2m-run-1106-0945 | Política RL (ONNX) | no disponible | no disponible | no disponible | Hugging Face |
| Otras políticas de microduck | Política RL | no disponible | no disponible | no disponible | Repositorio pollen-robotics/microduck |

La información disponible solo permite comparar con otra ejecución de la misma tarea (`run-1106-0945`), de la que no se detallan especificaciones. No se dispone de datos de rendimiento para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- La model card es mínima y no documenta arquitectura, licencia, sesgos ni métricas de evaluación; la evaluación en producción debe hacerse empíricamente.
- Licencia no disponible: no puede asumirse permiso de uso comercial sin consultar al autor.
- Entrenamiento no reproducible bit a bit: la misma semilla y configuración producen pesos distintos entre máquinas, lo que dificulta la auditoría exacta del comportamiento.
- Política específica de una tarea (sprint de 2 metros) y de un robot concreto (microduck); no es transferible a otras morfologías sin reentrenamiento.
- Comportamiento perpetuo: la política se ejecuta hasta que se le indique lo contrario, por lo que en producción se requiere supervisión o mecanismos externos de parada.
- Sin datos publicados sobre robustez ante perturbaciones, terreno irregular o fallos de actuadores; el riesgo de comportamiento inseguro en entornos no controlados no está caracterizado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/YellowDuckSweater/microduck-sprint-2m-run-1106-1358-13
- Ejecución relacionada: https://huggingface.co/YellowDuckSweater/microduck-sprint-2m-run-1106-0945
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de desafíos y entrenamiento: https://github.com/StephenForte/microduck-challenges
