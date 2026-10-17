# TheSauceman/microduck-sprint-2m-dash4

## Resumen

microduck-sprint-2m-dash4 es una politica de control (policy) de aprendizaje por refuerzo destinada al robot bipedo microduck de Pollen Robotics, un robot de 25 cm de altura con 15 motores, camara, LiDAR y un pico prensil. No es un modelo de lenguaje ni un modelo de vision-lenguaje: es una red neuronal que mapea una observacion de 61 dimensiones a 14 acciones de control a 50 Hz, y que se ejecuta en bucle de forma perpetua hasta recibir orden de parada. El autor, TheSauceman, la publica como una variante afinada del reto "2 m Sprint" (carrera de 2 metros) de la Microduck Arena.

Tecnicamente, el modelo se entrena con el framework mjlab (entorno de simulacion basado en MuJoCo) mediante refuerzo learning masivamente paralelo: 4096 entornos simulados durante 3000 iteraciones y semilla 1, tomando como base `mjlab-microduck 0.1.0`. La particularidad de esta variante "dash4" es que se eliminaron las penalizaciones sobre el balanceo de tronco (roll, pitch) y el giro (spin), penalizaciones que frenaban precisamente la marcha rebotante que necesita un sprint rapido. El resultado es una marcha mas agresiva y rapida.

Es relevante en el contexto de la robotica open source de bajo coste: el microduck se vende por 399 dolares y su pila de software es abierta, lo que permite entrenar comportamientos en simulacion y desplegarlos en el robot fisico. Este checkpoint concreto declara el indice 2000 y se distribuye como un unico archivo `policy.onnx` con el normalizador de observaciones integrado, mas un `manifest.json` que sigue el esquema 2 de manifiestos de politicas de microduck.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de politica entrenada por refuerzo learning (no disponible el detalle de capas; base mjlab-microduck 0.1.0) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; politica de control de bucle cerrado con observacion de 61 dimensiones y 14 acciones a 50 Hz |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`, con normalizador de observaciones integrado) y manifiesto JSON (`manifest.json`, esquema 2) |

## Arquitectura y entrenamiento

Se trata de una politica de control entrenada por refuerzo learning en simulacion, no de un transformer ni de un modelo generativo. El entrenamiento se realizo con mjlab sobre la base `mjlab-microduck 0.1.0` (commit `8d0dbc94c`), usando 4096 entornos paralelos y 3000 iteraciones maximas con la semilla 1. El checkpoint publicado corresponde al indice 2000. El task_id es `Mjlab-Sprint2m-MicroDuck`, dentro del repositorio `microduck-challenges` (rama `claude/project-thread-h4e0o0`, commit `8d876e797`), iniciado el 2026-10-16T18:17:47Z.

La innovacion concreta de esta variante es de ingenieria de recompensas: se eliminaron las penalizaciones sobre roll, pitch y spin del tronco. El autor argumenta que esas penalizaciones gravaban precisamente la marcha rebotante y oscilante que requiere una carrera rapida, de modo que su supresion permite una locomocion de sprint mas veloz. La inferencia opera de forma perpetua (la marcha se mantiene hasta que se le ordena lo contrario) y el normalizador de observaciones esta embebido en el propio `policy.onnx`, por lo que el consumidor debe alimentar observaciones en bruto. El autor advierte que el entrenamiento no es bit-reproducible entre maquinas: repetirlo con el mismo codigo, `uv.lock`, comando y semilla produce una politica comparable, pero no identica.

## Capacidades

- Locomocion bipeda de sprint: genera una marcha rapida de carrera de 2 metros sobre el robot microduck.
- Control en bucle cerrado a 50 Hz: transforma una observacion de 61 dimensiones en 14 acciones de control por paso.
- Ejecucion perpetua: mantiene la marcha de forma continua hasta recibir orden de parada (a diferencia de politicas episodicas).
- Normalizacion integrada: acepta observaciones en bruto sin preprocesado externo.
- Despliegue en robot fisico mediante el daemon `robotctl` (carga por ranura de politica).
- No soporta tool calling, agentes, razonamiento multi-paso, capacidades multilingues ni vision: es exclusivamente una politica motora.

## Casos de uso

- Demostracion de sprint en la Microduck Arena: se carga en una ranura del robot para competir en el reto de carrera de 2 metros, aprovechando la recompensa reajustada que prioriza velocidad sobre estabilidad de tronco.
- Investigacion en aprendizaje por refuerzo aplicado a robotica bipeda: sirve como punto de partida reproducible (codigo, `uv.lock`, comando y semilla documentados) para estudiar el efecto del diseno de recompensas en la marcha.
- Pruebas de transferencia sim-a-real (sim-to-real): la politica entrenada en mjlab/MuJoCo se despliega directamente en el microduck via `robotctl`, lo que permite evaluar la brecha simulacion-realidad en un robot de bajo coste.
- Benchmarking interno de gait: comparar esta variante (sin penalizacion de roll/pitch/spin) con otras politicas del mismo autor (por ejemplo la variante `ar04-stand02`) para medir el compromiso entre velocidad y estabilidad.
- Docencia y talleres de robotica: el montaje del microduck esta documentado en tutoriales comunitarios; esta politica permite mostrar un comportamiento motriz aprendido en una plataforma asequible de 399 dolares.
- Base para ajuste fino de nuevas marchas: al ser una politica perpetua de una sola tarea, puede reentrenarse o servir de inicializacion para variantes de sprint con distintas restricciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card no incluye tiempos de carrera, velocidad alcanzada, tasa de exito ni curvas de recompensa. Como referencia cualitativa, el autor indica que la variante elimina penalizaciones de roll, pitch y spin para favorecer una marcha rebotante mas rapida, y que se guardo en el checkpoint 2000 de un entrenamiento de 3000 iteraciones con 4096 entornos. El modelo de referencia oficial de Pollen (checkpoint 1000) se describe como "el mas rapido de la Arena", pero no se aportan cifras.

## Requisitos de hardware

- Al ser una politica de control de 61 entradas y 14 salidas, la inferencia es de coste minimo; el modelo corre en el propio robot o en el ordenador anfitrion del daemon.
- No se dispone de VRAM estimada ni de requisitos de GPU especificados en la informacion proporcionada ("no disponible").
- El entrenamiento documentado requiere simulacion masivamente paralela (4096 entornos, 3000 iteraciones), lo que en la practica exige GPU; el README no especifica el hardware concreto empleado.
- Despliegue: el modelo se carga en el robot mediante `sudo robotctl policy load <slot> TheSauceman/microduck-sprint-2m-dash4`. El formato ONNX permite inferencia ligera con runtimeres ONNX en el host del robot.
- Latencia y throughput de control: la politica opera a 50 Hz (periodo de 20 ms por ciclo), segun la model card.
- VRAM, GPUs recomendadas (A100, H100, RTX 4090 u otras) y rendimiento medido: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Observacion / acciones | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TheSauceman/microduck-sprint-2m-dash4 | Politica RL (perpetua) | 61-D obs, 14 acciones, 50 Hz | mjlab, 4096 envs, 3000 iter, checkpoint 2000, semilla 1 | no disponible | HuggingFace, ONNX |
| pollen-robotics/microduck-sprint-2m-reference | Politica RL (perpetua, referencia) | 61-D obs, 14 acciones, 50 Hz | receta sin cambios del reto sprint_2m, 4096 envs, 3000 iter, checkpoint 1000, semilla 1 | no disponible | HuggingFace |
| TheSauceman/microduck-sprint-2m-ar04-stand02 | Politica RL | no disponible (misma familia) | mismo entorno mjlab | no disponible | HuggingFace |

Las tres son politicas de la misma familia para el mismo robot y el mismo reto de sprint de 2 metros. Las diferencias clave son el checkpoint seleccionado (2000 frente a 1000 en la referencia) y el diseno de recompensas (la variante `dash4` suprime penalizaciones de roll, pitch y spin). No hay datos publicos de rendimiento que permitan compararlas cuantitativamente.

## Limitaciones y advertencias

- Es una politica monoespecifica: solo sabe hacer un sprint de 2 metros; no razona, no entiende lenguaje y no sirve para otras tareas.
- Marcha potencialmente menos estable: al eliminar las penalizaciones de roll, pitch y spin, el tronco puede oscilar mas, lo que puede reducir la robustez ante perturbaciones externas o terrenos irregulares.
- Riesgo de sobreajuste al simulador: al tratarse de RL en simulacion (mjlab/MuJoCo), puede degradarse al transferirse al robot fisico (brecha sim-to-real).
- Entrenamiento no bit-reproducible: repetir el comando con la misma semilla produce una politica comparable pero no identica.
- Licencia no especificada: la model card no indica licencia, por lo que el uso comercial queda sin garantia explicita y requiere contactar con el autor.
- Sin datos de idiomas, sesgos, benchmarks ni VRAM: no aplicable o no disponible segun el caso; no hay informacion que permita evaluar su robustez en produccion.
- Fecha de creacion registrada en 2026: conviene verificar la vigencia y trazabilidad del artefacto antes de integrarlo en un flujo real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TheSauceman/microduck-sprint-2m-dash4
- Modelo de referencia de Pollen Robotics: https://huggingface.co/pollen-robotics/microduck-sprint-2m-reference
- Variante relacionada del mismo autor: https://huggingface.co/TheSauceman/microduck-sprint-2m-ar04-stand02
- Repositorio de retos (microduck-challenges): https://github.com/SteveTarter/microduck-challenges
- Retos oficiales de Pollen Robotics (sprint_2m): https://github.com/pollen-robotics/microduck-challenges/tree/main/src/microduck_challenges/sprint_2m
- Repositorio base del robot (microduck): https://github.com/pollen-robotics/microduck
- Pagina oficial del robot microduck: https://pollen-robotics.com/microduck/
- Tutorial de montaje (comunidad): https://github.com/AI-FanGe/Microduck-build-tutorial
