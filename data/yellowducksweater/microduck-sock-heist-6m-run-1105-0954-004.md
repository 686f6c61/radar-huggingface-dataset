# YellowDuckSweater/microduck-sock-heist-6m-run-1105-0954-004

## Resumen

microduck-sock-heist-6m-run-1105-0954-004 es una política de control para robots entrenada mediante aprendizaje por refuerzo y publicada por el usuario YellowDuckSweater en HuggingFace. No se trata de un modelo de lenguaje, sino de un agente motor entrenado para el robot cuadrúpedo de bajo coste microduck del proyecto de Pollen Robotics. La política consume observaciones de 61 dimensiones y emite 14 acciones a una frecuencia de control de 50 Hz, lo que la sitúa en el ámbito de la robótica de locomoción y manipulación reactiva.

El modelo se presenta como una política "perpetua": una marcha o comportamiento que se ejecuta de forma continua hasta que el operador la detiene, y que se carga en una ranura de política del demonio `robotctl` del robot. El entrenamiento se realizó con el framework mjlab (basado en MuJoCo) sobre la tarea `Mjlab-SockHeist6m-MicroDuck`, con 4096 entornos paralelos y hasta 2000 iteraciones, partiendo del checkpoint 1500 y la semilla 2.

Su relevancia es acotada pero concreta: demuestra el flujo completo de entrenamiento y despliegue de políticas de RL para un robot de bajo coste, con pesos exportados a ONNX y un manifiesto de política versionado. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo es de 0.0 GB según los metadatos disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | política de RL para control robótico (arquitectura de red no especificada en la información disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (exportación a ONNX) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y manifiesto `manifest.json` (schema 2) |

Otros datos técnicos relevantes:

| Parametro | Valor |
|---|---|
| Dimensión de observación | 61 |
| Dimensión de acción | 14 |
| Frecuencia de control | 50 Hz |
| Tarea de entrenamiento | `Mjlab-SockHeist6m-MicroDuck` |
| Framework de entrenamiento | mjlab-microduck 0.1.0 (commit 1efd853be) |
| Checkpoint | 1500 |
| Semilla | 2 |
| Entornos paralelos | 4096 |
| Iteraciones máximas | 2000 |
| Repositorio de entrenamiento | `StephenForte/microduck-challenges`, commit e413cf57e |
| Normalizador de observaciones | integrado en `policy.onnx` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red neuronal de la política (número de capas, tipo de red, función de activación ni tamaño de los pesos). Lo que sí se conoce es que se trata de una política entrenada con aprendizaje por refuerzo en simulación mediante mjlab, un framework construido sobre MuJoCo, y que el resultado se exporta a ONNX con el normalizador de observaciones embebido, de modo que el robot puede alimentar observaciones en crudo.

El entrenamiento se realizó sobre la tarea `Mjlab-SockHeist6m-MicroDuck` con 4096 entornos paralelos, un máximo de 2000 iteraciones, semilla 2 y checkpoint 1500, partiendo de la base mjlab-microduck 0.1.0. El autor advierte explícitamente de que el entrenamiento no es reproducible bit a bit entre máquinas: repetir el comando con el mismo código, `uv.lock`, comando y semilla produce una política comparable, no los mismos pesos. No se especifican el número de tokens, la composición del dataset (en RL no aplica directamente) ni el uso de RLHF o DPO, que no tienen sentido en este contexto.

## Capacidades

- Control locomotor y de comportamiento reactivo del robot microduck a 50 Hz.
- Política "perpetua": ejecuta una marcha o comportamiento continuo hasta que se le indica lo contrario.
- Consumo de observaciones de 61 dimensiones y emisión de 14 acciones.
- Normalización de observaciones integrada en el modelo ONNX, lo que simplifica la integración en el robot.
- Carga en una ranura de política del demonio `robotctl` mediante el comando `sudo robotctl policy load <slot> <repo>`.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni capacidades multilingües: es una política de control motor, no un modelo de lenguaje.

## Casos de uso

- Locomoción autónoma del microduck en entornos simulados o reales: la política se carga en una ranura de `robotctl` y se ejecuta de forma continua, lo que permite al robot desplazarse sin intervención hasta que se detenga manualmente.
- Investigación en aprendizaje por refuerzo para robótica de bajo coste: sirve como referencia reproducible del flujo mjlab → ONNX → robot, con el comando de entrenamiento documentado y la semilla fijada.
- Docencia y prototipado en cursos de RL aplicado: el modelo permite a estudiantes cargar una política entrenada y observar el comportamiento en el robot sin entrenar desde cero.
- Pruebas de integración del demonio `robotctl`: al seguir el schema 2 del manifiesto de políticas, es útil para validar el cargador de políticas y el pipeline de despliegue del daemon.
- Benchmarking de políticas para la tarea `SockHeist6m`: puede compararse con otras políticas entrenadas sobre la misma tarea y el mismo repositorio de desafíos.
- Experimentación con variantes de entrenamiento: el comando documentado permite reentrenar con otra semilla u otro número de entornos para estudiar la variabilidad de las políticas resultantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser una política exportada a ONNX de un robot de bajo coste, es previsible que sea muy reducida, pero no se aporta cifra.
- GPU recomendadas: no disponible para inferencia. Para reentrenar, el comando usa 4096 entornos paralelos y un máximo de 2000 iteraciones, lo que requiere una GPU de entrenamiento; el modelo concreto no se especifica.
- ¿Cabe en GPU de consumo? No disponible. La inferencia en ONNX sobre el robot sugiere que el modelo es ligero, pero no se confirma.
- Opciones de despliegue: el despliegue previsto es mediante el demonio `robotctl` del robot microduck, cargando `policy.onnx` en una ranura de política. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: la política opera a 50 Hz (20 ms por ciclo de control). No se aportan cifras de latencia adicionales.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas comparables de la misma tarea ni datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código y no procesa lenguaje natural. Cualquier uso fuera del control motor del microduck no está soportado.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- Entrenamiento no reproducible bit a bit: el autor advierte de que repetir el entrenamiento produce una política comparable, no idéntica.
- Específico del robot microduck: la política asume observaciones de 61 dimensiones y 14 acciones a 50 Hz; no es transferible a otro hardware sin reentrenamiento.
- Sin métricas publicadas: no hay benchmarks ni curvas de recompensa que permitan evaluar la calidad de la política frente a alternativas.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por parte de la comunidad.
- Riesgo de alucinación: no aplica en el sentido habitual, pero sí existe riesgo de comportamiento impredecible fuera de la distribución de entrenamiento, típico de las políticas de RL desplegadas en el mundo real.

## Enlaces

- [HuggingFace: YellowDuckSweater/microduck-sock-heist-6m-run-1105-0954-004](https://huggingface.co/YellowDuckSweater/microduck-sock-heist-6m-run-1105-0954-004)
- [Repositorio microduck de Pollen Robotics](https://github.com/pollen-robotics/microduck)
- [Repositorio de desafíos microduck-challenges](https://github.com/StephenForte/microduck-challenges)
