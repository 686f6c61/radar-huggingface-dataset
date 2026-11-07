# YellowDuckSweater/microduck-hill-climb-1m5-run-1106-0950-12

## Resumen

`microduck-hill-climb-1m5-run-1106-0950-12` es una política de control motriz entrenada por refuerzo (reinforcement learning) para el robot cuadrúpedo de código abierto microduck de Pollen Robotics. No es un modelo de lenguaje: es una política neuronal que mapea una observación de 61 dimensiones a 14 acciones de control a 50 Hz, es decir, un gait o patrón de marcha empaquetado como política perpetua que se ejecuta en el robot hasta que se le indique lo contrario. El autor es el usuario de Hugging Face YellowDuckSweater y el artefacto se publica en formato ONNX.

El modelo resuelve un problema concreto de robótica: generar una marcha estable capaz de subir una pendiente de 1,5 metros (de ahí el sufijo `hill-climb-1m5` en el identificador de la tarea) mediante entrenamiento en simulador con el stack mjlab. La model card indica que se modificó la recompensa de velocidad respecto a iteraciones anteriores, lo que sugiere una familia de experimentos sucesivos con variaciones en la función de recompensa.

Su relevancia es acotada pero clara para quien trabaja con microduck: es un ejemplo reproducible de pipeline completo (entrenamiento masivo en paralelo con 4096 entornos, exportación a ONNX con normalizador de observaciones embebido y despliegue mediante `robotctl`). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo figura como 0.0 GB, lo que es coherente con un único `policy.onnx` de pocos megabytes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal para control robótico (detalles de capas no disponibles); observación de 61 dimensiones, 14 acciones, 50 Hz |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (exportación a ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de robótica) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` con esquema 2 del manifiesto de políticas de microduck |

## Arquitectura y entrenamiento

La política se entrena con aprendizaje por refuerzo en simulación usando el stack mjlab (base `mjlab-microduck 0.1.0` en el commit `1efd853be`). El entrenamiento se ejecuta con 4096 entornos en paralelo, un máximo de 3000 iteraciones del agente y semilla 2, con registro en TensorBoard. El checkpoint publicado corresponde a la iteración 2250. La tarea se identifica como `Mjlab-HillClimb1m5-MicroDuck` dentro del repositorio `StephenForte/microduck-challenges`, en la rama `main` y el commit `f81f44fc5`.

La model card no detalla la topología de la red (número de capas, anchura, tipo de activación) ni el número de parámetros. Sí especifica un aspecto práctico relevante para el despliegue: el normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que el robot puede alimentar observaciones en bruto sin preprocesado externo. La política es de tipo perpetuo: no tiene condición de terminación propia y se ejecuta de forma continua hasta que el operador la descargue o cargue otra en la ranura correspondiente.

El autor advierte explícitamente que el entrenamiento no es bit-reproducible entre máquinas: repetir el mismo comando con el mismo `uv.lock` y la misma semilla produce una política comparable, no idéntica en pesos.

## Capacidades

- Control locomotor de un robot cuadrúpedo microduck: genera comandos de 14 acciones a partir de 61 observaciones a 50 Hz.
- Marcha perpetua: mantiene la política activa de forma continua hasta que se le indique lo contrario.
- Ascenso de pendientes: la tarea de entrenamiento está orientada a subir una colina de 1,5 metros.
- Ajuste de recompensa de velocidad: esta ejecución concreta modifica la recompensa de velocidad respecto a versiones previas de la familia.
- Despliegue directo en robot mediante `robotctl policy load <slot> <repo>`, cargando la política en una ranura de política del daemon.
- Inferencia autocontenida: normalizador de observaciones incluido en el propio ONNX.
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento; no es un modelo generativo de texto.

## Casos de uso

- Locomoción autónoma en terreno inclinado: cargar la política en la ranura de marcha del microduck para que el robot suba pendientes de hasta 1,5 metros de desnivel en pruebas de laboratorio, aprovechando que la tarea de entrenamiento replica exactamente ese escenario.
- Base para experimentos de recompensa: al estar documentada la variación de la recompensa de velocidad y ser reproducible el pipeline, sirve como punto de partida para comparar funciones de recompensa alternativas en la misma tarea.
- Validación de pipeline sim-to-real: útil para equipos que quieran verificar el flujo completo mjlab → ONNX → `robotctl` con un artefacto ya entrenado antes de invertir cómputo propio.
- Demostraciones docentes de RL aplicado a robótica: el comando de reproducción completo (clonar, `uv sync`, `uv run train` con 4096 entornos) es un ejemplo autocontenido para cursos o talleres sobre entrenamiento masivamente paralelo.
- Pruebas de integración del daemon: la política perpetua permite dejar el robot en marcha continua mientras se prueba el daemon de control, el cargador de ranuras o la telemetría, sin necesidad de reentrenar.
- Benchmark interno de controladores: al ser una política pequeña exportada a ONNX, se puede usar como referencia de latencia y estabilidad frente a otros gaits de la misma familia (`hill-climb-1m5` de otros autores y ejecuciones).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa final, tasa de éxito en el ascenso, velocidad alcanzada ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el artefacto es un ONNX de control con 61 entradas y 14 salidas, por lo que el cómputo es mínimo y probablemente ejecutable en CPU, aunque no se documenta el tamaño exacto del fichero.
- GPU recomendadas: no disponibles. El entrenamiento original usó 4096 entornos en paralelo, lo que requiere una GPU de datacenter (el stack mjlab se apoya en simulación física acelerada), pero la model card no especifica el hardware empleado.
- Compatibilidad con GPU de consumo: no confirmada; para inferencia en el robot, lo relevante es la computadora de a bordo del microduck, no una GPU de escritorio.
- Opciones de despliegue: `robotctl policy load <slot> <repo>` sobre el daemon de microduck; el runtime esperado es ONNX Runtime (no confirmado explícitamente en la información disponible).
- Latencia y throughput: no disponibles. El único dato temporal es la frecuencia de control de 50 Hz que la política debe sostener.

## Comparativa con modelos similares

| Modelo | Tarea | Formato | Repositorio | Notas |
|---|---|---|---|---|
| `YellowDuckSweater/microduck-hill-climb-1m5-run-1106-0950-12` | Hill climb 1,5 m | ONNX | YellowDuckSweater | Ejecución del 6 de noviembre, recompensa de velocidad modificada |
| `YellowDuckSweater/microduck-hill-climb-1m5-run-1105-2003-008` | Hill climb 1,5 m | ONNX | YellowDuckSweater | Ejecución anterior del mismo autor; parámetros y métricas no disponibles |
| `GinDuck/microduck-hill-climb-1m5-hill-1` | Hill climb 1,5 m | ONNX | GinDuck | Política de otro autor para la misma tarea; ranuras de despliegue documentadas (walk, stand, sitstand, ground_pick, kick_left, kick_right, roulade) |

No se dispone de datos de parámetros, contexto ni rendimiento para establecer una comparación cuantitativa entre estas políticas; la comparación se limita a la tarea, el formato y el origen.

## Limitaciones y advertencias

- Licencia no disponible: no se puede asumir permiso de uso comercial ni de redistribución; hay que contactar con el autor antes de integrarla en un producto.
- Sin métricas publicadas: no hay evidencia cuantitativa de tasa de éxito, robustez ante perturbaciones o comportamiento fuera de la distribución de entrenamiento (terrenos distintos, cargas, superficies resbaladizas).
- Entrenada en simulación: el salto sim-to-real no está validado en la información disponible; el rendimiento en el robot físico puede degradarse.
- No reproducible bit a bit: el propio autor advierte que reentrenar con la misma semilla produce pesos distintos, lo que complica la auditoría y la comparación exacta entre ejecuciones.
- Específica de hardware: los 61 valores de observación y 14 acciones están ligados a la cinemática y a los sensores del microduck; no es transferible a otro robot sin reentrenamiento.
- Política perpetua sin terminación propia: requiere supervisión y un mecanismo externo de parada; un fallo en la carga de la ranura o en el daemon puede dejar el robot ejecutando la marcha de forma indefinida.
- Cero tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusión pública que permitan evaluar su fiabilidad.
- Idiomas y sesgos: no aplica en el sentido habitual de modelos de lenguaje; los sesgos relevantes serían de comportamiento físico (p. ej. preferencia por velocidades concretas impuestas por la recompensa), no documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YellowDuckSweater/microduck-hill-climb-1m5-run-1106-0950-12
- Ejecución previa del mismo autor: https://huggingface.co/YellowDuckSweater/microduck-hill-climb-1m5-run-1105-2003-008
- Política de otro autor para la misma tarea: https://huggingface.co/GinDuck/microduck-hill-climb-1m5-hill-1
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de desafíos y entrenamiento: https://github.com/StephenForte/microduck-challenges
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa)
