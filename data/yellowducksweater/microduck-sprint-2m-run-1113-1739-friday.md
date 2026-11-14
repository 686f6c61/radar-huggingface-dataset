# YellowDuckSweater/microduck-sprint-2m-run-1113-1739-friday

## Resumen

`microduck-sprint-2m-run-1113-1739-friday` es una política de control para robots entrenada mediante aprendizaje por refuerzo, publicada por el usuario YellowDuckSweater en Hugging Face. No se trata de un modelo de lenguaje ni de un modelo generativo de propósito general: es un artefacto de inferencia para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. La política consume observaciones de 61 dimensiones y produce 14 acciones a 50 Hz, lo que corresponde al bucle de control de la marcha del robot.

El modelo se distribuye principalmente como `policy.onnx`, con el normalizador de observaciones integrado en el propio grafo, de modo que la política acepta observaciones en crudo. Se complementa con un `manifest.json` que sigue el esquema 2 del manifiesto de políticas de microduck, lo que permite cargarla directamente en el daemon del robot mediante el comando `robotctl policy load`.

La relevancia de esta ficha es acotada: se trata de un checkpoint experimental de un entrenamiento de refuerzo (iteración 2750, semilla 9, 4096 entornos paralelos) para una tarea de locomoción rápida (`Sprint2m`). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card es mínima, por lo que la mayor parte de los datos técnicos habituales (licencia, idiomas, benchmarks) no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo exportada a ONNX (red neuronal de control; topología interna no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control reactiva; sin ventana de contexto) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas de microduck) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

La política se entrena con aprendizaje por refuerzo en simulación, sobre el entorno `Mjlab-Sprint2m-MicroDuck` del repositorio `StephenForte/microduck-challenges` (rama `main`, commit `6dc1c9008`). La base es `mjlab-microduck 0.1.0` en el commit `1efd853be`, un entorno construido sobre mjlab, la infraestructura de RL para MuJoCo. El entrenamiento arrancó el 2026-11-14T01:44:57Z con 4096 entornos paralelos, un máximo de 2888 iteraciones, semilla 9 y registro en TensorBoard; el checkpoint publicado corresponde a la iteración 2750.

La arquitectura interna de la red (número de capas, anchura, tipo de activación) no se documenta en la model card, por lo que no está disponible. Lo que sí se especifica es el contrato de interfaz: la política es perpetua (se ejecuta hasta que se le indique lo contrario), recibe observaciones crudas de 61 dimensiones y emite 14 acciones a 50 Hz. El normalizador de observaciones está embebido en el ONNX, lo que elimina la necesidad de preprocesar la entrada en el lado del robot. El autor advierte que el entrenamiento no es bit-reproducible entre máquinas: repetir el comando con el mismo código, `uv.lock` y semilla produce una política comparable, pero no los mismos pesos.

## Capacidades

- Control de locomoción del robot microduck: genera una marcha continua a partir de observaciones de 61 dimensiones y produce 14 acciones de actuador a 50 Hz.
- Ejecución perpetua: la política está diseñada para correr de forma indefinida hasta que el daemon la descargue o la sustituya.
- Inferencia autocontenida en ONNX: el normalizador de observaciones va integrado en el grafo, por lo que acepta observaciones en crudo sin pipeline de preprocesado externo.
- Integración con el daemon del robot mediante `robotctl policy load`, que carga la política en un slot de política.
- Compatibilidad con el manifiesto de políticas de microduck (esquema 2), lo que facilita el despliegue y la sustitución de políticas.
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento: no es un modelo de lenguaje.

## Casos de uso

- Locomoción rápida del microduck en pruebas de laboratorio: cargar la política en un slot con `robotctl policy load` y evaluar la marcha `Sprint2m` sobre el robot físico para medir velocidad y estabilidad.
- Comparación de políticas de marcha: al ser un artefacto aislado con manifiesto propio, permite alternar entre esta política y otras (por ejemplo, distintas semillas o checkpoints) en el mismo slot para comparar comportamientos.
- Reproducción de experimentos de RL: el comando de entrenamiento documentado (mismo commit, `uv.lock`, semilla 9) permite regenerar políticas comparables y estudiar la variabilidad entre ejecuciones.
- Base para ajuste fino o destilación: al estar en ONNX con interfaz fija de 61 observaciones y 14 acciones, sirve como punto de partida para entrenar variantes con recompensas o entornos modificados.
- Validación de la infraestructura mjlab-microduck: útil para verificar que el pipeline de simulación a robot (sim-to-real) funciona con el contrato de observación y acción del daemon.
- Docencia y prototipado en robótica de bajo coste: el microduck es una plataforma asequible y esta política ilustra el flujo completo de entrenamiento en simulación y despliegue en hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB y la topología de la red no se documenta, por lo que no puede estimarse con rigor. Por la naturaleza de la tarea (observación de 61 dimensiones, 14 acciones, 50 Hz), es previsible que el modelo sea muy pequeño, pero no hay datos que lo confirmen.
- GPU recomendadas: no disponible. La inferencia se ejecuta en el propio robot a través del daemon microduck, no en un servidor.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: daemon microduck con `robotctl` (carga de políticas en slots); el artefacto es ONNX, por lo que en principio puede ejecutarse con cualquier runtime ONNX Runtime, aunque no se documenta.
- Latencia y throughput: no disponibles; el único dato es la frecuencia de control de 50 Hz (periodo de 20 ms por paso).

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otras políticas comparables para el microduck ni modelos de la misma categoría con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- La model card es mínima ("booooom" es todo el texto descriptivo además de los metadatos), por lo que no hay información sobre sesgos, robustez ni condiciones de fallo.
- Licencia no disponible: no puede asumirse permiso para uso comercial, redistribución o modificación; es imprescindible contactar con el autor antes de cualquier uso en producción.
- Entrenamiento no bit-reproducible: el propio autor advierte que repetir el entrenamiento produce una política comparable, no idéntica.
- Sin benchmarks ni métricas de rendimiento publicadas: no hay evidencia cuantitativa de velocidad, estabilidad o tasa de éxito de la marcha.
- Específica de una tarea (`Sprint2m`) y de una plataforma (microduck): no es transferible a otros robots sin reentrenamiento.
- Repositorio sin descargas ni likes: no hay señal de validación por parte de la comunidad.
- Riesgo de sim-to-real no documentado: no se indica si la política se ha probado en hardware físico ni con qué resultados.
- No es un modelo de lenguaje: no debe evaluarse con criterios de MMLU, HumanEval o similares.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YellowDuckSweater/microduck-sprint-2m-run-1113-1739-friday
- Repositorio de retos y entrenamiento: https://github.com/StephenForte/microduck-challenges
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa)
