# YellowDuckSweater/microduck-sprint-2m-run-1112-1244-5-3

## Resumen

Microduck sprint-2m-run-1112-1244-5-3 es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje: es una política de locomoción ("perpetual policy") que genera comandos de acción a 50 Hz a partir de observaciones de 61 dimensiones y 14 salidas de acción, empaquetada en formato ONNX para su despliegue directo en el robot.

El modelo ha sido entrenado con el framework mjlab (basado en MuJoCo) sobre la tarea `Mjlab-Sprint2m-MicroDuck`, en el repositorio de retos `microduck-challenges`, con 4096 entornos paralelos y 2888 iteraciones de entrenamiento. El checkpoint publicado corresponde a la iteración 2887 con semilla 7. La política ejecuta una marcha de sprint de forma continua hasta que se le indique lo contrario.

Su relevancia es acotada pero concreta: demuestra el flujo completo de entrenamiento y despliegue de políticas de locomoción para un robot cuadrúpedo de código abierto, e incluye el normalizador de observaciones embebido en el propio ONNX, lo que simplifica la integración en el daemon `robotctl`. Es un artefacto de investigación reproducible (misma semilla, mismo `uv.lock`), no un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control entrenada con RL (red neuronal, detalles no disponibles) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible (exportado a ONNX) |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2) |

## Arquitectura y entrenamiento

La política se entrena con aprendizaje por refuerzo en simulación usando mjlab (versión base `mjlab-microduck 0.1.0 @ 1efd853be`), sobre MuJoCo. La tarea `Mjlab-Sprint2m-MicroDuck` entrena una marcha de sprint con 4096 entornos paralelos, 2888 iteraciones máximas y semilla 7. El checkpoint publicado es el 2887. El espacio de observación tiene 61 dimensiones y el de acción 14 dimensiones, con frecuencia de control de 50 Hz.

La arquitectura interna de la red (número de capas, tamaño de las capas ocultas, si es MLP u otra) no se detalla en la información disponible. El autor indica explícitamente que el entrenamiento no es bit-reproducible entre máquinas: repetir el proceso con el mismo código, `uv.lock`, comando y semilla produce una política comparable, no idéntica. El normalizador de observaciones está embebido en `policy.onnx`, de modo que se alimenta con observaciones en crudo.

## Capacidades

- Generación de una marcha de locomoción continua ("perpetual") para el robot microduck; se ejecuta hasta recibir una orden de parada.
- Salida de 14 comandos de acción a 50 Hz a partir de 61 observaciones.
- Normalización de observaciones integrada en el ONNX: acepta observaciones sin preprocesar.
- Carga directa en una ranura de política del daemon mediante `robotctl policy load`.
- Manifiesto `manifest.json` conforme al schema 2 del manifiesto de políticas microduck.
- Reproducibilidad documentada del pipeline de entrenamiento (código, commit, semilla y comando).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Locomoción de sprint en el robot microduck: cargar la política en una ranura con `robotctl policy load` y ejecutar la marcha continua para desplazamientos rápidos en pruebas de laboratorio.
- Validación del pipeline de entrenamiento: usar la receta documentada (repositorio, commit `da5c2f7e8`, `uv.lock`, semilla 7) para reproducir una política comparable y verificar la cadena mjlab → ONNX → robot.
- Benchmark interno de control: comparar esta política (checkpoint 2887) con otras políticas de la misma tarea para evaluar el efecto de hiperparámetros como el número de entornos o la semilla.
- Investigación en RL para robótica: servir como referencia de entrenamiento masivamente paralelo (4096 entornos) en MuJoCo para tareas de locomoción de cuadrúpedos de bajo coste.
- Desarrollo de políticas compuestas: integrar esta marcha como eslabón dentro de un sistema de control mayor que alterne entre políticas según la tarea (sprint, caminar, girar).
- Docencia y prototipado con hardware accesible: desplegar una política entrenada en un robot microduck de bajo coste sin necesidad de reentrenamiento en el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El modelo se ejecuta en el propio robot microduck a través del daemon `robotctl`, no en GPU de servidor.
- VRAM estimada para inferencia: no disponible (política exportada a ONNX, sin datos de tamaño del fichero; el repositorio ocupa aproximadamente 0.0 GB).
- GPU recomendadas: no aplica para inferencia en el robot; el entrenamiento se realizó con RL en GPU (modelo concreto no disponible).
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ONNX Runtime a través del daemon `robotctl` (`robotctl policy load <slot> ...`); no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican).
- Latencia y throughput: frecuencia de control fijada en 50 Hz; latencia por paso no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Observaciones / acciones | Frecuencia | Formato | Licencia |
|---|---|---|---|---|---|
| microduck sprint-2m-run-1112-1244-5-3 | Política RL para microduck | 61 / 14 | 50 Hz | ONNX | no disponible |
| Otras políticas de `microduck-challenges` | Políticas RL para microduck | no disponible | no disponible | no disponible | no disponible |
| Políticas de locomoción para cuadrúpedos comerciales (p. ej. Unitree) | Políticas RL propietarias | no disponible | no disponible | no disponible | propietaria |

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Ámbito muy restringido: es una política de locomoción para un robot concreto (microduck); no sirve para otras tareas ni plataformas sin reentrenamiento.
- Licencia no especificada: no hay información sobre permisos de uso comercial; conviene contactar con el autor antes de cualquier uso en producción.
- Entrenamiento no bit-reproducible: repetir la receta produce una política comparable, no los mismos pesos.
- Sin datos de benchmarks ni de robustez (sim-to-real, perturbaciones, terrenos) en la información disponible; el rendimiento real en hardware no está documentado.
- Sin información sobre sesgos, alucinación o comportamiento fuera de distribución; al ser una política de control, los fallos se manifestarían como inestabilidad o caídas del robot.
- Repositorio sin descargas ni likes y con tamaño prácticamente nulo: señales de que es un artefacto de investigación reciente y poco validado por la comunidad.
- La fecha de creación indicada (2026-11-13) es futura respecto a la información habitual de publicación; verificar la vigencia del artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/YellowDuckSweater/microduck-sprint-2m-run-1112-1244-5-3
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/StephenForte/microduck-challenges
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa)
