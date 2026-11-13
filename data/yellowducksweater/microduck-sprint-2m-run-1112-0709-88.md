# YellowDuckSweater/microduck-sprint-2m-run-1112-0709-88

## Resumen

microduck-sprint-2m-run-1112-0709-88 es una política de control entrenada por refuerzo para el robot cuadrúpedo microduck de Pollen Robotics. No se trata de un modelo de lenguaje, sino de un controlador neuronal exportado a ONNX que implementa una marcha ("gait") concreta: una carrera rápida y perpetua, es decir, que se ejecuta de forma continua hasta que el operador la detiene. El modelo consume observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, lo que lo sitúa en el ámbito de la robótica de locomoción y no en el del procesamiento de lenguaje natural.

El autor, YellowDuckSweater, lo publica como un artefacto de experimentación dentro del ecosistema microduck, con un flujo de entrenamiento reproducible documentado (task_id, commit, seed y comandos exactos). La relevancia es acotada pero clara para quien trabaja con robots cuadrúpedos de bajo coste: ofrece una política lista para cargar en un slot del daemon `robotctl` sin necesidad de reentrenar, y sirve como referencia de cómo se estructuran los manifiestos de políticas en este ecosistema.

La información pública disponible es muy escasa: el repositorio pesa 0.0 GB, no registra descargas ni likes, no declara licencia ni idiomas, y la model card se limita a describir el uso en robot y los parámetros de entrenamiento. No hay datos de benchmarks ni comparativas publicadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política de reinforcement learning exportada a ONNX; estructura interna no documentada) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre observaciones de 61 dimensiones por paso) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) junto con `manifest.json` (schema 2 del policy manifest de microduck) |

## Arquitectura y entrenamiento

La política se entrenó con aprendizaje por refuerzo en el entorno `Mjlab-Sprint2m-MicroDuck`, dentro del repositorio `microduck-challenges` (rama `main`, commit `5b022c002`), sobre la base `mjlab-microduck 0.1.0 @ 1efd853be`. El entrenamiento partió del checkpoint 1000, con semilla 48, 4096 entornos paralelos y un máximo de 3888 iteraciones del agente, registrando métricas en TensorBoard bajo el nombre de ejecución `run-1112-0709-88`. La fecha de inicio registrada es 2026-11-12T17:30:47Z.

El artefacto final es un archivo `policy.onnx` que incluye el normalizador de observaciones "horneado" en el propio grafo, de modo que el robot puede alimentar observaciones en bruto sin preprocesado externo. La interfaz es de 61 dimensiones de observación y 14 acciones a 50 Hz, con comportamiento perpetuo (la marcha continúa hasta que se le indique lo contrario). El autor advierte explícitamente que el entrenamiento no es bit-reproducible entre máquinas: repetir el comando con la misma semilla produce una política comparable, no idéntica.

## Capacidades

- Locomoción cuadrúpeda: ejecuta una marcha de carrera rápida ("faster run") de forma continua sobre el robot microduck.
- Control reactivo a partir de observaciones proprioceptivas de 61 dimensiones, sin necesidad de sensores externos adicionales documentados.
- Operación perpetua: la política no termina por sí sola; requiere una orden explícita para detenerse.
- Normalización integrada: acepta observaciones en bruto gracias al normalizador embebido en el ONNX.
- Despliegue directo en robot mediante `robotctl policy load <slot> <repo>`.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni capacidades multilingües: es un controlador motor, no un modelo generativo.

## Casos de uso

- Investigación en locomoción: cargar la política en un microduck para estudiar el comportamiento de una marcha de carrera entrenada con RL y compararla con otras políticas del mismo ecosistema.
- Base para fine-tuning o currículos de entrenamiento: usar el checkpoint y la configuración documentada como punto de partida para entrenar variantes (terrenos, velocidades, robustez) en `microduck-challenges`.
- Demostraciones y docencia: ilustrar en un aula o laboratorio cómo se despliega una política ONNX en un robot real mediante el daemon `robotctl`, sin infraestructura de inferencia compleja.
- Pruebas de integración del daemon: validar el flujo de carga de políticas, el esquema 2 de `manifest.json` y el pipeline `robotics` en entornos de desarrollo del software de control.
- Benchmarking interno de controladores: comparar latencia, estabilidad y consumo energético de esta marcha frente a otras políticas publicadas por la comunidad microduck.
- Prototipado de aplicaciones robóticas de bajo coste: emplear la política como componente de locomoción en prototipos que requieran desplazamiento rápido continuo sobre superficies controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser una política ONNX de tamaño reducido (repositorio de 0.0 GB), es probable que quepa en CPU y en GPU de gama baja, pero no hay cifras publicadas.
- GPU recomendadas: no disponible. El pipeline es `robotics` y la inferencia se ejecuta en el propio robot a 50 Hz, por lo que la GPU no es el destino principal.
- Compatibilidad con GPU de consumo: no confirmada; el despliegue documentado es en el robot vía `robotctl`, no en estaciones de trabajo.
- Opciones de despliegue: `robotctl policy load <slot> <repo>` sobre el daemon de microduck; el artefacto es ONNX y podría cargarse con ONNX Runtime, pero no se documenta ese uso.
- Latencia y throughput: no disponibles; el único dato es la frecuencia de control de 50 Hz (periodo de 20 ms por paso).

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otras políticas comparables del ecosistema microduck ni alternativas de otros fabricantes con especificaciones publicadas que permitan una comparación rigurosa de parámetros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial ni redistribución sin contactar con el autor.
- Sin datos de benchmarks, curvas de aprendizaje ni métricas de robustez; se desconoce su comportamiento fuera del entorno de entrenamiento.
- Entrenada para una tarea concreta (`Mjlab-Sprint2m-MicroDuck`) y una morfología concreta (microduck); no es transferible a otros robots sin reentrenamiento.
- Comportamiento perpetuo: la marcha no se detiene sola, lo que exige mecanismos de parada seguros en el operador.
- Riesgo de fallo en terrenos o condiciones no representadas en el entrenamiento (sim-to-real gap), sin documentación de domain randomization.
- No reproducible bit a bit: el propio autor advierte que reentrenar con la misma semilla produce pesos distintos.
- Sin información sobre sesgos (no aplica en el sentido lingüístico) ni sobre alucinación; el riesgo relevante es el fallo físico del robot.
- Repositorio sin descargas ni validación comunitaria: madurez y soporte desconocidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YellowDuckSweater/microduck-sprint-2m-run-1112-0709-88
- Repositorio de entrenamiento: https://github.com/StephenForte/microduck-challenges
- Proyecto microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
