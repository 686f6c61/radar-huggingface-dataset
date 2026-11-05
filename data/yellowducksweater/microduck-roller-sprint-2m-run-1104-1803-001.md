# YellowDuckSweater/microduck-roller-sprint-2m-run-1104-1803-001

## Resumen

`microduck-roller-sprint-2m-run-1104-1803-001` es una política de control entrenada por refuerzo para el robot cuadrúpedo de bajo coste microduck de Pollen Robotics. No es un modelo de lenguaje ni un modelo generativo de propósito general: es un controlador neuronal exportado a ONNX que traduce observaciones del robot (61 dimensiones) en acciones de motor (14 dimensiones) a 50 Hz, pensado para ejecutarse en el propio robot sobre ruedas o rodillos.

El modelo resuelve una tarea concreta de locomoción: mantener una marcha de sprint perpetua sobre rodillos. Su nombre indica el entorno de entrenamiento (`RollerSprint2m`), y la model card lo describe explícitamente como una "gait" (marcha) que se carga en una ranura de política del daemon `robotctl` y se ejecuta de forma continua hasta que se le indique lo contrario.

Es relevante dentro del ecosistema microduck porque ilustra el flujo completo de entrenamiento con `mjlab` (basado en MuJoCo), exportación a ONNX con el normalizador de observaciones embebido y despliegue en hardware real mediante el manifiesto de política del daemon. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y el tamaño del repo es de 0.0 GB (probablemente por redondeo de un artefacto muy pequeño).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política neuronal de reinforcement learning exportada a ONNX (arquitectura interna no especificada) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible (artefacto ONNX, sin variantes GGUF/INT8 documentadas) |
| Idiomas soportados | no aplica (control robótico, sin interfaz de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

Otros datos técnicos relevantes:

| Parámetro | Valor |
|---|---|
| Dimensión de observación | 61 |
| Dimensión de acción | 14 |
| Frecuencia de control | 50 Hz |
| Entorno de entrenamiento | `Mjlab-RollerSprint2m-MicroDuck` |
| Framework base | `mjlab-microduck 0.1.0 @ 1efd853be` |
| Checkpoint | 250 |
| Semilla | 1 |
| Commit de entrenamiento | `0da5c713b` |
| Fecha de inicio de entrenamiento | 2026-11-05T02:11:42Z |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (número de capas, anchura, tipo de activación). Lo que sí se documenta es el pipeline: la política se entrenó con `mjlab`, un framework de entrenamiento por refuerzo sobre MuJoCo, en la tarea `Mjlab-RollerSprint2m-MicroDuck` del repositorio `microduck-challenges`. El entrenamiento se lanzó con 4096 entornos paralelos, un máximo de 3000 iteraciones del agente y semilla 1, registrando en TensorBoard bajo el nombre `run-1104-1803-001`. El checkpoint final corresponde al paso 250.

El artefacto desplegable es un `policy.onnx` con el normalizador de observaciones embebido, de modo que el robot puede alimentar observaciones crudas sin preprocesado adicional. El `manifest.json` sigue el schema 2 del manifiesto de políticas del daemon microduck. El autor advierte que el entrenamiento no es bit-reproducible entre máquinas: repetir el comando con el mismo código, `uv.lock` y semilla produce una política comparable, no idéntica.

## Capacidades

- Control de locomoción continua sobre rodillos para el robot microduck, con una marcha de sprint perpetua que se ejecuta hasta recibir una orden de parada.
- Mapeo directo de observaciones crudas de 61 dimensiones a 14 acciones de motor a 50 Hz.
- Normalización de observaciones integrada en el propio grafo ONNX, lo que simplifica la integración en el daemon.
- Carga y descarga como ranura de política mediante `robotctl policy load`.
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento: es un controlador reactivo de política única.
- No se documentan capacidades de visión, audio ni percepción más allá de las 61 observaciones propietarias del robot.

## Casos de uso

- **Demostración de locomoción en microduck con rodillos**: cargar la política en una ranura con `robotctl policy load` y dejar que el robot ejecute la marcha de sprint de forma continua en una superficie con rodillos. Es adecuada porque el artefacto ya incluye el normalizador y está empaquetado para el daemon.
- **Banco de pruebas de despliegue de políticas ONNX**: usar esta política como referencia para validar el pipeline completo de `mjlab` a `policy.onnx` a `manifest.json` y a ejecución en hardware, verificando que el schema 2 del manifiesto se interpreta correctamente.
- **Reproducción de experimentos de RL**: clonar `microduck-challenges` en el commit `0da5c713b`, sincronizar con `uv` y relanzar el entrenamiento con la misma semilla para obtener una política comparable y comparar curvas en TensorBoard.
- **Punto de partida para fine-tuning o currículos de marcha**: emplear esta política como inicialización o como referencia de comportamiento al entrenar variantes de la tarea `RollerSprint2m` con distintas recompensas o dominios aleatorizados.
- **Evaluación de robustez de controladores ligeros**: someter la política a perturbaciones en el entorno simulado o en el robot para medir su tolerancia, dado que el modelo es pequeño y se ejecuta a 50 Hz en el propio robot.
- **Integración en pruebas de CI del daemon microduck**: usar el manifiesto y el ONNX como fixtures para tests de carga de políticas, validación de esquema y compatibilidad de versiones del daemon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, tasa de éxito, velocidad alcanzada ni comparaciones con otras políticas.

## Requisitos de hardware

- **VRAM estimada**: no disponible; el tamaño del repositorio es de 0.0 GB y el artefacto es un ONNX de política, por lo que se espera que quepa holgadamente en cualquier GPU consumer e incluso en CPU.
- **GPU recomendadas**: no se especifican. Dado el tamaño aparente del artefacto, cualquier GPU moderna (RTX 4090, A100, H100) sería sobredimensionada para inferencia; el entrenamiento, en cambio, requiere 4096 entornos paralelos y presumiblemente una GPU de datacenter.
- **Compatibilidad con GPU consumer**: probablemente sí en cualquier GPU consumer con soporte ONNX Runtime, aunque no se documenta oficialmente.
- **Opciones de despliegue**: ONNX Runtime en el propio robot a través del daemon `robotctl`; el entrenamiento se realiza con `mjlab` sobre MuJoCo. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- **Latencia y throughput**: no disponibles. El control opera a 50 Hz (periodo de 20 ms), pero no se publican mediciones de latencia de inferencia.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas microduck ni modelos comparables de la misma categoría (controladores RL para robots cuadrúpedos de bajo coste) con datos de parámetros, contexto o rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- **Licencia no disponible**: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- **Alcance muy restringido**: es una política específica para una tarea (sprint sobre rodillos) y un robot concreto (microduck); no generaliza a otras morfologías ni tareas.
- **Sin datos de rendimiento**: no hay métricas publicadas de velocidad, estabilidad o tasa de éxito, por lo que no se puede evaluar su calidad objetiva.
- **Reproducibilidad limitada**: el propio autor advierte que el entrenamiento no es bit-reproducible; los pesos exactos no se pueden regenerar de forma determinista.
- **Riesgo en hardware real**: una política de sprint perpetuo puede provocar caídas o daños si se ejecuta fuera de las condiciones de entrenamiento; se recomienda validación en simulación y supervisión en las primeras pruebas.
- **Madurez del ecosistema**: 0 descargas y 0 likes, sin issues ni discusión pública; el soporte de la comunidad es inexistente por el momento.
- **Sesgos y alucinación**: no aplican en el sentido habitual de modelos de lenguaje, pero sí existe el riesgo de comportamientos fuera de distribución ante observaciones anómalas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/YellowDuckSweater/microduck-roller-sprint-2m-run-1104-1803-001)
- [Repositorio microduck (Pollen Robotics)](https://github.com/pollen-robotics/microduck)
- [Repositorio microduck-challenges](https://github.com/StephenForte/microduck-challenges)
