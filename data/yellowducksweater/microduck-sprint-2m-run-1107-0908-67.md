# YellowDuckSweater/microduck-sprint-2m-run-1107-0908-67

## Resumen

microduck-sprint-2m-run-1107-0908-67 es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo microduck de Pollen Robotics. No es un modelo de lenguaje ni un transformer generativo: es una política de locomoción que mapea observaciones de 61 dimensiones a 14 acciones de control a 50 Hz, empaquetada como un grafo ONNX que se carga directamente en el daemon del robot mediante el comando `robotctl policy load`. El autor es el usuario de Hugging Face YellowDuckSweater y el artefacto se publicó el 7 de noviembre de 2026.

La política se entrenó con la librería mjlab (versión 0.1.0, commit `1efd853be`) sobre el repositorio `microduck-challenges` de StephenForte, en la tarea `Mjlab-Sprint2m-MicroDuck`, con 4096 entornos paralelos, hasta 5000 iteraciones y semilla 42. El checkpoint publicado corresponde a la iteración 1250. La model card la describe como una política «perpetua»: ejecuta una marcha continua hasta que se le indique lo contrario, y el autor anota explícitamente «not faster» (no es más rápida), lo que sugiere que el objetivo de la tarea era la estabilidad o la velocidad de sprint sin garantía de mejora frente a otras variantes.

El interés de esta ficha es acotado: se trata de un artefacto de investigación de robótica con cero descargas y cero likes en el momento de la consulta, sin licencia declarada, sin idiomas y con un tamaño de repositorio de 0.0 GB (probablemente un ONNX pequeño). No debe confundirse con un modelo fundacional: sus especificaciones, benchmarks y requisitos de hardware son los de una política de control, no los de un LLM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo exportada a ONNX (arquitectura de red no detallada en la información disponible) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (observación de 61 dimensiones por paso, sin ventana de contexto textual) |
| Tipos de cuantización | no disponible (se distribuye como `policy.onnx`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck |
| Frecuencia de control | 50 Hz |
| Dimensiones de observación | 61 |
| Dimensiones de acción | 14 |
| Librería | microduck |
| Pipeline | robotics |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (número de capas, anchura, tipo de activación ni si emplea memoria recurrente). Lo que sí se documenta es el pipeline de entrenamiento: la tarea `Mjlab-Sprint2m-MicroDuck` del repositorio `microduck-challenges` (rama `main`, commit `0b410b77d`), ejecutada con mjlab-microduck 0.1.0 sobre el commit `1efd853be`, con 4096 entornos simulados en paralelo, un máximo de 5000 iteraciones, semilla 42 y registro en TensorBoard bajo el nombre de ejecución `run-1107-0908-67`. El checkpoint publicado es el 1250, iniciado el 2026-11-07T17:13:20Z.

Una innovación práctica destacable es el empaquetado: el normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que el robot puede alimentar observaciones en bruto sin preprocesado externo. El manifiesto `manifest.json` sigue el esquema 2 documentado en `docs/policy-manifest.md` del repositorio del daemon. El autor advierte que el entrenamiento por refuerzo con GPU no es reproducible bit a bit entre máquinas: repetir el comando con el mismo `uv.lock` y la misma semilla produce una política comparable, no los mismos pesos.

## Capacidades

- Locomoción continua de tipo sprint para el robot microduck, con ejecución perpetua hasta recibir una orden de parada o sustitución.
- Control a 50 Hz con 14 acciones de actuación y 61 entradas de observación.
- Ingesta de observaciones en bruto gracias al normalizador embebido en el grafo ONNX.
- Carga en el robot mediante `robotctl policy load <slot> <repo>`, integrándose en un sistema de slots de políticas.
- Ejecución en inferencia ONNX, apta para despliegue en el propio robot o en un runtime compatible.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, capacidades de agente ni multilingüismo: es exclusivamente una política motora.

## Casos de uso

- Locomoción de referencia en el robot microduck: cargar la política en un slot y dejar que el robot ejecute una marcha de sprint continua mientras se evalúa su comportamiento en el banco de pruebas.
- Base para comparativas de políticas: al existir variantes como `Helldave/microduck-sprint-2m-run-1027-2224`, sirve para contrastar marchas entrenadas con la misma tarea y distinta ejecución.
- Reproducción de experimentos de RL: el comando documentado con `uv sync`, 4096 entornos y semilla 42 permite reentrenar y estudiar la variabilidad entre ejecuciones.
- Validación del pipeline mjlab-microduck: útil para verificar que el flujo de entrenamiento, exportación a ONNX y carga con `robotctl` funciona de extremo a extremo.
- Docencia e investigación en robótica con refuerzo: un artefacto pequeño y de carga directa para ilustrar el ciclo simulación-a-realidad en un cuadrúpedo de bajo coste.
- Integración en pruebas de sistema del daemon: el manifiesto con esquema 2 permite probar la gestión de slots y la carga de políticas en el software del robot.
- No es adecuado para tareas cognitivas, conversacionales ni de percepción: su ámbito es estrictamente el control motor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, velocidad alcanzada, tasa de caídas ni comparaciones cuantitativas con otras políticas; únicamente la anotación cualitativa «not faster».

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del repositorio (0.0 GB) y la naturaleza de la política, el grafo ONNX es presumiblemente muy pequeño y cabe en cualquier GPU consumer, e incluso en CPU.
- GPU recomendadas para entrenamiento: no disponibles en la información; el comando documentado usa 4096 entornos paralelos, lo que en la práctica exige una GPU de datacenter (A100, H100 o similar), aunque el modelo concreto no se especifica.
- GPU para inferencia: cualquier GPU con soporte ONNX Runtime; también es viable la ejecución en CPU o en el propio hardware del robot.
- Despliegue: ONNX Runtime y el daemon microduck mediante `robotctl policy load`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles; el único dato temporal es la frecuencia de control de 50 Hz, que fija el periodo de decisión en 20 ms.

## Comparativa con modelos similares

| Modelo | Tarea | Observación / acción | Frecuencia | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| YellowDuckSweater/microduck-sprint-2m-run-1107-0908-67 | Mjlab-Sprint2m-MicroDuck | 61 / 14 | 50 Hz | ONNX | no disponible | 0 descargas, 0 likes |
| Helldave/microduck-sprint-2m-run-1027-2224 | Sprint 2m sobre microduck | no disponible | no disponible | no disponible | no disponible | pública en Hugging Face |

No se dispone de datos de rendimiento de ninguna de las dos políticas, por lo que la comparación cuantitativa no es posible. La alternativa identificada pertenece a la misma familia de tareas (sprint de 2 metros) y al mismo robot, pero su model card no aporta especificaciones en la información consultada.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no hay autorización explícita para uso comercial, redistribución ni modificación; en producción debe tratarse como artefacto sin permisos claros.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad ni de uso en robots reales.
- El autor indica «not faster»: no debe asumirse una mejora de velocidad frente a otras políticas de sprint.
- Entrenamiento no reproducible bit a bit: los pesos no pueden regenerarse de forma idéntica, lo que dificulta la auditoría y la depuración.
- Ámbito funcional mínimo: no procesa lenguaje, no razona y no tiene percepción más allá de las 61 observaciones del robot; cualquier expectativa de modelo generativo es errónea.
- Sin datos de robustez: no se documentan tasas de éxito, comportamiento ante terrenos irregulares, empujones o fallos de sensores.
- Dependencia del ecosistema microduck: requiere el daemon, el esquema de manifiesto 2 y la herramienta `robotctl`; no es portable a otras plataformas sin adaptación.
- Riesgo de seguridad física: una política de locomoción perpetua cargada en un robot real puede provocar movimientos no deseados si no se valida en simulación y en un entorno controlado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YellowDuckSweater/microduck-sprint-2m-run-1107-0908-67
- Repositorio de retos y entrenamiento: https://github.com/StephenForte/microduck-challenges
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Política comparable: https://huggingface.co/Helldave/microduck-sprint-2m-run-1027-2224
- Sitio comercial de microduck: https://microducks.org/
