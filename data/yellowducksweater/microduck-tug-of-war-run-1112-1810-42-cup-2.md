# YellowDuckSweater/microduck-tug-of-war-run-1112-1810-42-cup-2

## Resumen

`microduck-tug-of-war-run-1112-1810-42-cup-2` es una política de control motriz entrenada por refuerzo para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. El modelo no es un modelo de lenguaje ni un transformador generativo: es una política neuronal exportada a ONNX que mapea observaciones de 61 dimensiones a 14 acciones de control a 50 Hz, pensada para ejecutarse en el propio robot como una "marcha" (gait) cargada en una ranura de política del daemon `robotctl`.

La política se ha entrenado en simulación con mjlab (el framework de entrenamiento RL basado en MuJoCo de la familia mjlab) sobre la tarea `Mjlab-TugOfWar-MicroDuck`, que reproduce un escenario de "tira y afloja" o arrastre de carga. El checkpoint corresponde a la iteración 250 de un entrenamiento con 4096 entornos paralelos, semilla 8 y commit `243f369a5` del repositorio `microduck-challenges`.

Es relevante para quienes trabajan en robótica de bajo coste y aprendizaje por refuerzo aplicado a locomoción, porque muestra el flujo completo de un pipeline sim-a-real: definición de la tarea en mjlab, entrenamiento masivo en paralelo, exportación a ONNX con normalizador de observaciones embebido y despliegue en hardware mediante un manifiesto de política versionado. El repositorio es de tamaño 0.0 GB en la información disponible, lo que sugiere un artefacto muy ligero (típicamente pocos MB para una MLP de control).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política neuronal de control (MLP) exportada a ONNX; no se especifica el número de capas ni neuronas |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; ventana de observación de 61 dimensiones por paso) |
| Tipos de cuantización | no disponible (artefacto ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` con esquema 2 del manifiesto de políticas microduck |

## Arquitectura y entrenamiento

La política es una red neuronal de control entrenada mediante aprendizaje por refuerzo en simulación con mjlab, sobre la tarea `Mjlab-TugOfWar-MicroDuck`. El espacio de observación tiene 61 dimensiones y el de acciones 14, con una frecuencia de control de 50 Hz. El entrenamiento se ejecutó con 4096 entornos paralelos, un máximo de 2888 iteraciones y semilla 8, partiendo de la base `mjlab-microduck 0.1.0` en el commit `1efd853be`. El checkpoint publicado corresponde a la iteración 250.

El artefacto desplegable es un fichero `policy.onnx` con el normalizador de observaciones embebido, de modo que el robot puede alimentar observaciones crudas directamente. El `manifest.json` sigue el esquema 2 documentado en `docs/policy-manifest.md` del repositorio del daemon. La política es "perpetua": se ejecuta de forma continua hasta que se le indique lo contrario, lo que la hace adecuada como marcha de locomoción persistente. El autor advierte que el entrenamiento no es bit-reproducible entre máquinas: repetir el mismo comando con la misma semilla produce una política comparable, no idéntica.

## Capacidades

- Control de locomoción del robot microduck: genera 14 acciones de control a 50 Hz a partir de 61 observaciones.
- Ejecución de una marcha perpetua orientada a la tarea de tira y afloja / arrastre de carga.
- Inferencia en el propio robot mediante ONNX Runtime, con normalización de observaciones integrada en el modelo.
- Carga en caliente como ranura de política mediante `robotctl policy load <slot> ...`.
- Reproducibilidad del pipeline de entrenamiento a nivel de código, dependencias (`uv.lock`), comando y semilla.
- No dispone de capacidades de lenguaje, visión, tool calling, agentes ni razonamiento multi-paso; es exclusivamente una política motriz.

## Casos de uso

- Locomoción de arrastre de carga: la política se ha entrenado específicamente en la tarea `Mjlab-TugOfWar-MicroDuck`, por lo que es adecuada para que el microduck tire de un objeto o resista una fuerza contraria mientras mantiene el equilibrio.
- Demostración de sim-a-real en robótica de bajo coste: sirve como ejemplo reproducible de un pipeline completo (tarea en mjlab, entrenamiento con 4096 entornos, exportación ONNX, despliegue con `robotctl`) para cursos y talleres.
- Banco de pruebas de control RL: al ser una política perpetua y ligera, permite comparar marchas alternativas cargadas en distintas ranuras del daemon sobre el mismo hardware.
- Investigación en robustez de políticas: el escenario de tira y afloja introduce perturbaciones externas, útil para estudiar la resistencia a empujes y cargas variables.
- Prototipado rápido en el robot: la carga en caliente vía `robotctl` permite sustituir la marcha sin recompilar firmware ni reiniciar el daemon.
- Reproducción de experimentos: el comando de entrenamiento documentado permite regenerar políticas comparables para validar metodologías de RL en mjlab.
- Base para fine-tuning de tareas relacionadas: al estar el código en `microduck-challenges`, se puede partir de esta configuración para entrenar variantes (otras cargas, otras velocidades) cambiando la tarea o la recompensa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, tasas de éxito, distancia recorrida ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del repositorio (0.0 GB) y la naturaleza de una política de control ONNX, se espera un artefacto de pocos megabytes y consumo mínimo, pero no se documenta.
- GPU recomendadas: no aplica para inferencia en robot; el modelo está pensado para ejecutarse en la CPU del microduck vía ONNX Runtime.
- ¿Cabe en GPU de consumo? Sí, con toda probabilidad, dado el tamaño típico de una política de control; no se confirma en la información disponible.
- Opciones de despliegue: ONNX Runtime en el robot mediante el daemon `robotctl` (`sudo robotctl policy load <slot> ...`). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: frecuencia de control de 50 Hz (periodo de 20 ms por paso); no se publican latencias medidas ni throughput.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas microduck ni modelos comparables de la misma categoría (locomoción RL para cuadrúpedos de bajo coste) con los que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor antes de integrarlo en productos.
- Especialización estrecha: la política está entrenada para una única tarea (`Mjlab-TugOfWar-MicroDuck`) y no se espera que generalice a otras tareas de locomoción sin reentrenamiento.
- Dependencia del simulador: el rendimiento en el robot real puede degradarse por el gap sim-a-real (fricción, latencias, ruido de sensores) no cuantificado en la model card.
- No reproducibilidad bit a bit: repetir el entrenamiento con la misma semilla produce pesos distintos; no es posible auditar exactamente el artefacto publicado a partir del comando.
- Sin métricas publicadas: no hay evidencia cuantitativa de robustez, tasa de éxito ni estabilidad de la marcha.
- Sin información sobre sesgos: al no ser un modelo lingüístico, no aplican sesgos de lenguaje, pero tampoco se documentan sesgos de simulación (por ejemplo, condiciones del terreno sobrerrepresentadas).
- Artefacto sin descargas ni validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación externa.
- Fecha de creación futura en los metadatos (2026-11-13): conviene verificar la integridad y procedencia del repositorio antes de desplegarlo en hardware.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YellowDuckSweater/microduck-tug-of-war-run-1112-1810-42-cup-2
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/StephenForte/microduck-challenges
- Commit de entrenamiento: `243f369a5` en `microduck-challenges`
- Base de simulación: `mjlab-microduck 0.1.0 @ 1efd853be`
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa)
