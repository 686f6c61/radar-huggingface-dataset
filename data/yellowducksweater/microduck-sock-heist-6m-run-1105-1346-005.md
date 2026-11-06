# YellowDuckSweater/microduck-sock-heist-6m-run-1105-1346-005

## Resumen

microduck-sock-heist-6m-run-1105-1346-005 es una política de control entrenada por refuerzo (reinforcement learning) para el robot cuadrúpedo microduck de Pollen Robotics. No se trata de un modelo de lenguaje ni de un transformer generativo: es una política perceptivo-motora que mapea observaciones de 61 dimensiones a 14 acciones de control a 50 Hz, empaquetada en formato ONNX para su ejecución directa en el robot. El autor, YellowDuckSweater, publica este artefacto como resultado de un entrenamiento concreto (checkpoint 1999, semilla 7) sobre el entorno de simulación `Mjlab-SockHeist6m-MicroDuck`.

El modelo resuelve una tarea específica de locomoción y manipulación denominada "sock-heist": una política perpetua que se ejecuta de forma continua hasta recibir una orden de parada, cargada en una ranura de política del daemon `robotctl`. Su relevancia es acotada pero práctica: demuestra el flujo completo de entrenamiento en simulación con mjlab, exportación a ONNX con normalizador de observaciones embebido y despliegue en hardware real mediante el manifiesto de políticas schema 2.

El repositorio tiene un tamaño de 0.0 GB (artefacto muy ligero, coherente con una política de control de pocas capas), cero descargas y cero likes en el momento de la consulta, y carece de licencia e idiomas declarados. Es, por tanto, un artefacto de investigación reproducible más que un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | política de reinforcement learning para control robótico (red neuronal de política, detalles de capas no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (artefacto distribuido en ONNX) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) junto con `manifest.json` (schema 2 del microduck policy manifest) |

Especificaciones adicionales relevantes:

| Parametro | Valor |
|---|---|
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de acciones | 14 |
| Tipo de politica | perpetua (se ejecuta hasta recibir parada) |
| Entorno de entrenamiento | `Mjlab-SockHeist6m-MicroDuck` |
| Checkpoint | 1999 |
| Semilla | 7 |
| Commit de entrenamiento | `e20e3be8b` |
| Base de simulacion | `mjlab-microduck 0.1.0 @ 1efd853be` |
| Numero de entornos paralelos | 4096 |
| Iteraciones maximas | 2000 |

## Arquitectura y entrenamiento

La política se entrena mediante reinforcement learning en simulación con mjlab (entorno de simulación física basado en MuJoCo, a juzgar por la nomenclatura `Mjlab`), sobre la tarea `Mjlab-SockHeist6m-MicroDuck` del repositorio `StephenForte/microduck-challenges`. El entrenamiento se lanzó con 4096 entornos paralelos, un máximo de 2000 iteraciones, semilla 7 y registro en TensorBoard, alcanzando el checkpoint 1999. La arquitectura interna de la red de política (número de capas, anchura, tipo de activación) no está documentada en la model card.

El artefacto incluye un normalizador de observaciones embebido directamente en `policy.onnx`, de modo que el consumidor debe alimentar observaciones en bruto sin preprocesar. El autor advierte explícitamente que el entrenamiento por RL en GPU no es reproducible bit a bit entre máquinas: repetir el mismo comando con el mismo `uv.lock` y la misma semilla produce una política comparable, no pesos idénticos. El manifiesto `manifest.json` sigue el schema 2 del microduck policy manifest, documentado en `docs/policy-manifest.md` del repositorio del daemon.

## Capacidades

- Control locomotor continuo del robot microduck a 50 Hz mediante una política perpetua.
- Ejecución de la tarea "sock-heist" tal como se define en el entorno de entrenamiento `Mjlab-SockHeist6m-MicroDuck`; el detalle exacto de la tarea no está documentado en la model card.
- Mapeo directo de observaciones en bruto (61 dimensiones) a acciones (14 dimensiones) con normalización integrada en el ONNX.
- Despliegue en robot real mediante el comando `robotctl policy load <slot> ...`, cargando la política en una ranura del daemon.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües, visión, audio ni modo de pensamiento; es una política motora, no un modelo generativo.

## Casos de uso

- Despliegue directo en el robot microduck: cargar la política en una ranura con `robotctl policy load` y ejecutar la gait de forma continua hasta enviar una orden de parada, aprovechando el normalizador embebido para alimentar observaciones en bruto.
- Reproducción de experimentos de RL: clonar `microduck-challenges` en el commit `e20e3be8b`, sincronizar con `uv sync` y relanzar el entrenamiento con la misma semilla para obtener una política comparable y comparar curvas en TensorBoard.
- Base para fine-tuning o ajuste de hiperparámetros: partir del entorno y del script de entrenamiento documentados para modificar recompensas, número de entornos o iteraciones y generar variantes de la gait.
- Evaluación de pipelines de simulación a real (sim-to-real): usar este artefacto como referencia de un entrenamiento completo en mjlab y medir la transferencia al hardware físico del microduck.
- Pruebas de integración del daemon `robotctl`: validar la carga de políticas con manifiesto schema 2 y comprobar el comportamiento del gestor de ranuras con una política perpetua de larga duración.
- Docencia y demostraciones de RL robótico: el artefacto es ligero (repo de 0.0 GB) y el flujo de entrenamiento está documentado paso a paso, lo que lo hace adecuado para talleres prácticos sobre políticas perceptivo-motoras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, éxito de tarea, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el artefacto es una política de control muy ligera y el repositorio ocupa 0.0 GB, por lo que la inferencia ONNX cabe con holgura en cualquier GPU consumer, aunque no se documenta una cifra concreta.
- GPU recomendadas: no especificadas. Para el entrenamiento, la model card indica 4096 entornos paralelos en mjlab, lo que sugiere hardware de gama alta (A100/H100 o similar), pero no se confirma en la documentación.
- Cabe en GPU consumer: previsiblemente sí para inferencia (política ONNX de pequeñas dimensiones de entrada/salida), sin cifras documentadas.
- Opciones de despliegue: ONNX Runtime para `policy.onnx`; carga en el robot mediante `robotctl policy load <slot>`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput estimados: el control opera a 50 Hz (periodo de 20 ms por paso), pero no se publican mediciones de latencia real en hardware.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se trata de un artefacto específico de una tarea concreta del microduck y no se han identificado alternativas equivalentes en la información disponible.

## Limitaciones y advertencias

- La licencia no está declarada; no hay autorización explícita para uso comercial ni para redistribución. Conviene contactar con el autor antes de cualquier uso fuera de investigación.
- El entrenamiento por RL en GPU no es reproducible bit a bit: repetir el comando con la misma semilla produce pesos distintos, aunque comparables en comportamiento.
- La política está entrenada para una única tarea (`Mjlab-SockHeist6m-MicroDuck`) y un único robot (microduck); no se documenta su generalización a otras tareas, entornos o morfologías.
- No hay métricas publicadas de rendimiento, tasa de éxito ni robustez, por lo que no es posible evaluar su fiabilidad en producción.
- El artefacto tiene cero descargas y cero likes, y fue creado y actualizado en la misma marca temporal; no hay evidencia de validación por terceros.
- La documentación de la arquitectura interna de la red de política es inexistente, lo que dificulta auditorías técnicas.
- Al ser una política perpetua, requiere un mecanismo externo de parada; su ejecución continuada sin supervisión puede provocar comportamientos no deseados en el robot.
- No procesa lenguaje ni dispone de salvaguardas de contenido; no aplican consideraciones de sesgo lingüístico, pero sí las habituales de seguridad física en robótica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/YellowDuckSweater/microduck-sock-heist-6m-run-1105-1346-005
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de desafíos y entrenamiento: https://github.com/StephenForte/microduck-challenges
- Documentación del manifiesto de políticas (referenciada en la model card): `docs/policy-manifest.md` en el repositorio del daemon (URL exacta no disponible)
