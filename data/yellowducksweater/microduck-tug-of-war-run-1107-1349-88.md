# YellowDuckSweater/microduck-tug-of-war-run-1107-1349-88

## Resumen

microduck-tug-of-war-run-1107-1349-88 es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. El modelo ha sido publicado por el usuario YellowDuckSweater (Stephen Forte) en Hugging Face y se distribuye en formato ONNX dentro del ecosistema de políticas `microduck`, pensado para cargarse directamente en el daemon del robot mediante `robotctl`. No se trata de un modelo de lenguaje: es una política de locomoción especializada en una tarea concreta de tipo tug-of-war (tirar de la cuerda), con observaciones de 61 dimensiones y 14 acciones a 50 Hz.

El modelo resuelve el problema de dotar al robot microduck de una marcha o comportamiento motor específico ("perpetual policy", es decir, se ejecuta de forma continua hasta que se le indique lo contrario) para la tarea `Mjlab-TugOfWar-MicroDuck`. Su relevancia radica en que forma parte de un flujo de entrenamiento reproducible y abierto: el autor documenta el repositorio, commit, checkpoint, semilla y comando exactos para regenerar una política comparable, lo que facilita la experimentación en robótica con refuerzo sin necesidad de reentrenar desde cero.

La información disponible es limitada: no hay datos de arquitectura de red, número de parámetros, benchmarks de rendimiento ni licencia declarada. La ficha se limita a lo que el autor documenta en la model card y en los resultados de búsqueda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL; red neuronal no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; normalizador de observaciones integrado) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Libreria | microduck |
| Pipeline | robotics |
| Tamano del repo | 0.0 GB (aproximado) |

## Arquitectura y entrenamiento

La arquitectura de la red neuronal no está documentada en la información disponible. Se sabe que es una política entrenada con aprendizaje por refuerzo en el entorno `mjlab` (base `mjlab-microduck 0.1.0 @ 1efd853be`), bajo la tarea `Mjlab-TugOfWar-MicroDuck` del repositorio `StephenForte/microduck-challenges`. El entrenamiento se realizó con 4096 entornos paralelos, hasta un máximo de 2000 iteraciones, semilla 3, y el checkpoint publicado corresponde a la iteración 250. La ejecución se lanzó el 2026-11-07T21:56:59Z sobre el commit `19cb6b5df` de la rama `main`.

El modelo se distribuye como `policy.onnx` con el normalizador de observaciones embebido, de modo que el robot debe alimentar observaciones en bruto. El `manifest.json` sigue el esquema 2 del manifiesto de políticas de microduck (documentado en `docs/policy-manifest.md` del repositorio del daemon). El autor advierte explícitamente que el entrenamiento no es bit-reproducible entre máquinas: repetir el mismo comando con la misma semilla produce una política comparable, no idéntica. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal, al no tratarse de un modelo generativo.

## Capacidades

- Control motor de locomoción del robot microduck para la tarea de tug-of-war (tirar de la cuerda).
- Política "perpetua": se ejecuta de forma continua hasta que se le indique lo contrario.
- Entrada de observaciones de 61 dimensiones y salida de 14 acciones a 50 Hz.
- Normalización de observaciones integrada en el propio ONNX, por lo que acepta observaciones en bruto.
- Carga directa en una ranura de política del daemon del robot mediante `robotctl policy load <slot> <repo>`.
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingües, visión ni audio: es una política de control específica, no un modelo de propósito general.

## Casos de uso

- Demostración de locomoción en microduck: cargar la política en una ranura del daemon y ejecutar la marcha de tug-of-war para mostrar el comportamiento entrenado en el robot físico.
- Investigación en aprendizaje por refuerzo aplicado a robótica: usar esta política como referencia o línea base para comparar con otras políticas del mismo autor (por ejemplo, `microduck-roller-sprint-2m-run-1104-2036-002` o `microduck-tug-of-war-run-1106-0803-010`).
- Reproducción de experimentos: clonar `microduck-challenges` en el commit `19cb6b5df`, sincronizar con `uv sync` y relanzar el entrenamiento con la misma semilla para obtener una política comparable y estudiar la variabilidad entre ejecuciones.
- Pruebas de integración del stack `microduck`: validar el esquema 2 del manifiesto de políticas y el flujo `robotctl policy load` en un entorno de desarrollo antes de desplegar políticas propias.
- Docencia y divulgación: ejemplo práctico de pipeline completo de RL (entorno mjlab, entrenamiento masivo en paralelo con 4096 entornos, exportación a ONNX y despliegue en robot) para cursos de robótica o aprendizaje automático.
- Evaluación de robustez de políticas entrenadas con semilla fija: comparar el comportamiento en hardware real frente al simulado y analizar la sensibilidad a la semilla y al checkpoint (en este caso, iteración 250).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser una política de control de dimensiones pequeñas (61 observaciones, 14 acciones) y distribuirse en ONNX, la huella de memoria es presumiblemente mínima, pero no se documenta.
- GPU recomendadas: no disponible para inferencia. Para reentrenamiento, el autor emplea entrenamiento con GPU y 4096 entornos paralelos, lo que sugiere hardware de gama alta, aunque no se especifica el modelo concreto.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: carga en el daemon del robot mediante `robotctl policy load <slot> <repo>`; ejecución de inferencia ONNX en el propio robot. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: la política opera a 50 Hz (periodo de 20 ms por paso de control); no se publican cifras de latencia adicionales.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-tug-of-war-run-1107-1349-88 | Política RL | Tug-of-war | ONNX | no disponible | Hugging Face |
| microduck-tug-of-war-run-1106-0803-010 | Política RL | Tug-of-war | no disponible | no disponible | Hugging Face |
| microduck-roller-sprint-2m-run-1104-2036-002 | Política RL | Roller sprint | no disponible | no disponible | Hugging Face |

No se dispone de datos de parámetros, contexto ni rendimiento de los modelos comparables en la información proporcionada; la comparación se limita a la tarea y al formato de distribución.

## Limitaciones y advertencias

- Es una política específica para la tarea `Mjlab-TugOfWar-MicroDuck` y el robot microduck; no es transferible a otros robots ni a tareas generales.
- No se declara licencia, por lo que el uso comercial queda sin marco legal explícito y debe consultarse con el autor.
- El entrenamiento no es bit-reproducible: la misma semilla y el mismo comando generan pesos distintos en máquinas diferentes, lo que limita la reproducibilidad exacta.
- El checkpoint publicado corresponde a la iteración 250 de un máximo de 2000; no se documenta si la política está completamente convergida.
- No hay información sobre sesgos, alucinaciones o limitaciones de idioma porque no es un modelo lingüístico; estos criterios no aplican.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.
- La información de arquitectura, parámetros y rendimiento es inexistente, lo que impide evaluar su calidad técnica más allá de la documentación del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YellowDuckSweater/microduck-tug-of-war-run-1107-1349-88
- Perfil del autor: https://huggingface.co/YellowDuckSweater
- Política comparable (tug-of-war): https://huggingface.co/YellowDuckSweater/microduck-tug-of-war-run-1106-0803-010
- Repositorio de retos de entrenamiento: https://github.com/StephenForte/microduck-challenges
- Proyecto microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
