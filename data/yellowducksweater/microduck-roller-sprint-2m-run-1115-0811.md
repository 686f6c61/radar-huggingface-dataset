# YellowDuckSweater/microduck-roller-sprint-2m-run-1115-0811

## Resumen

`microduck-roller-sprint-2m-run-1115-0811` es una política de control entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. No es un modelo de lenguaje: se trata de un artefacto de robótica que traduce observaciones del robot (61 dimensiones) en acciones de control (14 dimensiones) a 50 Hz, pensado para ejecutar una marcha concreta sobre ruedas (rollers). Lo publica el usuario YellowDuckSweater y se distribuye empaquetado en formato ONNX para cargarse directamente en el daemon del robot.

La política es de tipo "perpetuo": una vez cargada, ejecuta la marcha de forma indefinida hasta que se le indique lo contrario. El entrenamiento se realizó con el framework mjlab (basado en MuJoCo) sobre la tarea `Mjlab-RollerSprint2m-MicroDuck`, con 2048 entornos paralelos y un checkpoint en la iteración 750. La normalización de observaciones está integrada en el propio grafo ONNX, por lo que el consumidor debe alimentar observaciones en crudo.

Su relevancia es acotada y muy específica: sirve como ejemplo reproducible de un pipeline completo de RL para robótica (entorno, entrenamiento, exportación a ONNX y despliegue en hardware) y como pieza reutilizable dentro del ecosistema microduck. No tiene aplicación fuera de ese robot ni de ese dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control entrenada por RL (red neuronal exportada a ONNX); arquitectura interna no detallada en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control reactiva, sin contexto textual) |
| Tipos de cuantizacion | no disponible (se distribuye como `policy.onnx`, presumiblemente FP32) |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Tarea de entrenamiento | `Mjlab-RollerSprint2m-MicroDuck` |
| Framework de entrenamiento | mjlab-microduck 0.1.0 (commit 1efd853be) |
| Checkpoint | 750 |
| Semilla | 88 |
| Entornos paralelos | 2048 |
| Iteraciones maximas | 3888 |

## Arquitectura y entrenamiento

La información disponible no describe la topología interna de la red (número de capas, anchura, tipo de activaciones). Lo que sí se documenta es el pipeline: la política se entrena con mjlab, un framework de RL sobre MuJoCo, contra la tarea `Mjlab-RollerSprint2m-MicroDuck` del repositorio `StephenForte/microduck-challenges`. El entrenamiento usó 2048 entornos simulados en paralelo, un máximo de 3888 iteraciones del agente, semilla 88 y se publicó el checkpoint 750. El resultado se exporta a ONNX con el normalizador de observaciones embebido en el grafo.

El autor advierte explícitamente de que el entrenamiento no es bit-reproducible: repetir el comando con el mismo código, `uv.lock`, semilla y configuración produce una política "comparable", no los mismos pesos, porque el RL sobre GPU no garantiza determinismo entre máquinas. La reproducibilidad es, por tanto, de procedimiento y no de resultado exacto. No se detallan en la información proporcionada la composición del dataset (aquí generado por simulación), el número de pasos de entorno ni si hubo fases adicionales de ajuste fino o destilación.

## Capacidades

- Control locomotor del microduck sobre ruedas (rollers): genera comandos de 14 acciones a partir de 61 observaciones a 50 Hz.
- Ejecución de una marcha ("sprint") de forma perpetua hasta que se descargue o sustituya la política.
- Integración directa con el daemon del robot mediante `robotctl policy load`.
- Normalización de observaciones integrada: acepta observaciones en crudo sin preprocesado externo.
- Despliegue en formato ONNX, lo que permite inferencia en el propio robot sin dependencias de frameworks de entrenamiento.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, visión, audio ni capacidades multilingües: es exclusivamente una política de control motor.

## Casos de uso

- Investigación en RL para robótica: sirve como referencia reproducible de un pipeline completo (entorno MuJoCo, entrenamiento masivo en paralelo, exportación ONNX y despliegue en hardware) para comparar configuraciones de entrenamiento.
- Desarrollo de marchas para microduck: la política se carga en un slot del daemon y permite validar en el robot físico el comportamiento de una gait entrenada en simulación.
- Docencia y prototipado: al ser un artefacto pequeño y con instrucciones de reproducción explícitas, es útil para enseñar el ciclo sim-a-real en robots de bajo coste.
- Pruebas de integración del daemon: sirve como política de prueba para verificar la carga de manifiestos schema 2 y la ejecución de políticas perpetuas en el stack `robotctl`.
- Benchmarking de simulación: el comando de entrenamiento documentado (2048 entornos, 3888 iteraciones) permite medir throughput de mjlab en distintas GPUs con una carga de referencia.
- Base para ajuste fino o sustitución: al estar el código de entrenamiento público, se puede partir de esta configuración para entrenar variantes (otra velocidad, otro terreno, otra tarea) cambiando la tarea o los hiperparámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, tasa de éxito, velocidad alcanzada ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB y no se detalla el tamaño del grafo ONNX, por lo que no se puede estimar con rigor.
- GPU recomendadas para entrenamiento: no especificadas en la información disponible; el entrenamiento usó 2048 entornos paralelos, lo que en la práctica requiere una GPU de datacenter (A100, H100 o similar), aunque el autor no lo indica.
- Ejecución en consumer GPU: no confirmado; por la naturaleza de una política de control a 50 Hz y el tamaño reducido del artefacto, es plausible que quepa en GPUs de consumo e incluso en CPU, pero no hay datos que lo verifiquen.
- Opciones de despliegue: ONNX Runtime a través del daemon microduck (`robotctl policy load`); no se documentan otras integraciones (vLLM, llama.cpp, Ollama o TGI no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles. El único dato de temporización es la frecuencia de control de 50 Hz, que fija un presupuesto de 20 ms por paso de inferencia.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas microduck ni artefactos comparables con los que contrastar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Licencia no especificada: sin licencia declarada no hay autorización explícita para uso comercial ni para redistribución; conviene contactar con el autor antes de cualquier uso en producción.
- Modelo card prácticamente vacía (el cuerpo del README contiene solo "sss"), sin descripción de la tarea, recompensas ni condiciones de entrenamiento más allá del bloque de reproducibilidad.
- Específica para el microduck sobre rollers: no es transferible a otros robots ni a otras configuraciones de hardware sin reentrenamiento.
- Política perpetua: una vez cargada, sigue ejecutándose hasta que se sustituya; no se documentan mecanismos de parada segura ni de gestión de fallos más allá de los del propio daemon.
- Sin datos de robustez: no se indica el rendimiento ante perturbaciones, cambios de terreno, carga útil o desgaste de hardware.
- No reproducible bit a bit: los pesos publicados no se pueden regenerar exactamente, lo que dificulta auditorías y comparaciones estrictas.
- Riesgo de sobreajuste a la simulación (sim-to-real gap): no se documentan técnicas de aleatorización de dominio ni validación en el robot físico.
- Sin información sobre sesgos, alucinación o idiomas: no aplica a este tipo de artefacto, pero tampoco hay evaluación de seguridad del comportamiento motor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YellowDuckSweater/microduck-roller-sprint-2m-run-1115-0811
- Repositorio de retos y entrenamiento: https://github.com/StephenForte/microduck-challenges
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas (`docs/policy-manifest.md` en el repositorio del daemon): no disponible como enlace directo en la información proporcionada
