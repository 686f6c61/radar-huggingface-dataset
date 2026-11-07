# YellowDuckSweater/microduck-sprint-2m-run-1106-0945

## Resumen

microduck-sprint-2m-run-1106-0945 es una política de control motriz entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo microduck de Pollen Robotics. No es un modelo de lenguaje: es un controlador neuronal que recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, diseñado para ejecutar una marcha o *gait* de forma perpetua hasta que se le indique lo contrario. El autor, YellowDuckSweater, lo publica como un *policy slot* cargable directamente en el robot mediante el comando `robotctl policy load`.

El modelo se entrenó con el framework mjlab (versión 0.1.0, commit 1efd853be) sobre la tarea `Mjlab-Sprint2m-MicroDuck` del repositorio microduck-challenges, con 4096 entornos paralelos, 3000 iteraciones máximas y semilla 2, hasta el checkpoint 1000. La model card describe el resultado como "better training" respecto a intentos previos, aunque no se aportan métricas comparativas.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación en robótica con licencia no declarada, sin benchmarks publicados y sin idiomas ni capacidades de texto. Su interés radica en la reproducibilidad del pipeline de entrenamiento (comando exacto, commit, semilla) y en el formato de despliegue (ONNX con normalizador integrado) para el ecosistema microduck.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política neuronal para control robótico (aprendizaje por refuerzo); topología interna no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de 61 dimensiones por paso |
| Tipos de cuantización | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) con normalizador de observaciones embebido; manifiesto `manifest.json` (schema 2) |
| Frecuencia de control | 50 Hz |
| Dimensiones de observación | 61 |
| Dimensiones de acción | 14 |
| Tarea de entrenamiento | `Mjlab-Sprint2m-MicroDuck` |
| Framework de entrenamiento | mjlab 0.1.0 (commit 1efd853be) |
| Checkpoint | 1000 |
| Semilla | 2 |
| Entornos paralelos | 4096 |
| Iteraciones máximas | 3000 |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (número de capas, anchura, tipo de capa recurrente o feed-forward). Lo que sí se documenta es el pipeline de entrenamiento: aprendizaje por refuerzo con simulación paralela masiva (4096 entornos) sobre mjlab, un framework de entrenamiento de políticas para robótica. La tarea `Mjlab-Sprint2m-MicroDuck` corresponde a una marcha de sprint de 2 metros, presumiblemente con recompensa de velocidad y estabilidad, aunque la model card no explicita la función de recompensa ni la composición del dominio de entrenamiento.

Una innovación práctica destacable es que el normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que el robot puede alimentar observaciones crudas sin preprocesado externo. El manifiesto `manifest.json` sigue el schema 2 del manifiesto de políticas microduck, lo que permite cargarlo como *slot* de política en el daemon del robot. El autor advierte que el entrenamiento no es bit-reproducible entre máquinas: misma semilla y mismo código producen una política comparable, no idéntica.

## Capacidades

- Control locomotor de un robot cuadrúpedo microduck: genera una marcha de sprint de forma perpetua hasta recibir una orden de parada.
- Política reactiva a observaciones de 61 dimensiones (estado de articulaciones, sensores del robot) con salida de 14 acciones a 50 Hz.
- Carga directa en el robot mediante `robotctl policy load <slot> <repo>`, sin necesidad de conversión adicional.
- Normalización de observaciones integrada en el modelo ONNX, lo que simplifica la integración en el daemon.
- No soporta tool calling, function calling, agentes, multi-step reasoning ni capacidades multilingües.
- No dispone de modo *thinking*, visión, audio ni generación de texto.

## Casos de uso

- Investigación en locomoción de cuadrúpedos: sirve como política de referencia para comparar algoritmos de RL sobre la tarea `Mjlab-Sprint2m-MicroDuck`, reutilizando el mismo comando de entrenamiento y semilla.
- Demostración de sprint en el robot microduck: se carga en un *slot* de política y el robot ejecuta la marcha de forma continua, útil para vídeos de divulgación o validación de hardware.
- Reproducción de experimentos: el commit `67fa886e7`, el `uv.lock` y la semilla 2 permiten regenerar una política equivalente en otra máquina, lo que facilita la auditoría del pipeline.
- Base para *fine-tuning* o continuación de entrenamiento: al estar el código y la tarea publicados, se puede partir de esta configuración para explorar variantes de recompensa o de dominio.
- Pruebas de integración del daemon microduck: el manifiesto schema 2 y el ONNX con normalizador embebido permiten validar el flujo `robotctl policy load` en un robot real o simulado.
- Benchmark interno de estabilidad: al ser una política perpetua, se puede medir deriva, consumo energético y estabilidad de la marcha a lo largo del tiempo en el robot físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB y no se especifican parámetros, por lo que no se puede estimar con rigor.
- GPU recomendadas: no disponibles para inferencia; el entrenamiento se realizó con 4096 entornos paralelos, lo que típicamente requiere GPU de datacenter (A100, H100 o similar), aunque el autor no lo especifica.
- Cabe en GPU de consumo: no disponible; al ser una política de control a 50 Hz, es plausible que quepa en hardware modesto, pero no hay datos que lo confirmen.
- Opciones de despliegue: el runtime previsto es el daemon microduck mediante `robotctl policy load`; el formato es ONNX, por lo que también podría ejecutarse con ONNX Runtime en otros entornos.
- Latencia y throughput estimados: no disponibles; la única referencia temporal es la frecuencia de control de 50 Hz (periodo de 20 ms por paso).

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Formato | Licencia | Contexto / observación |
|---|---|---|---|---|---|
| YellowDuckSweater/microduck-sprint-2m-run-1106-0945 | Política RL para microduck | Sprint 2 m | ONNX | no disponible | 61-D obs, 14 acciones, 50 Hz |
| Helldave/microduck-sprint-2m-run-1027-2224 | Política RL para microduck | Sprint 2 m | no disponible | no disponible | no disponible |
| a1rb4Ck/microduck-sprint-2m | Política RL para microduck | Sprint 2 m | no disponible | no disponible | no disponible |

Los tres modelos comparten la misma tarea y el mismo robot, pero no se han publicado métricas comparativas que permitan establecer diferencias de rendimiento entre ellos.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo generativo de propósito general: no responde a prompts, no genera texto y no procesa imágenes.
- La licencia no está declarada, por lo que el uso comercial queda en un limbo legal hasta que el autor la especifique.
- No se han publicado benchmarks, curvas de recompensa ni comparaciones cuantitativas con otras políticas; la afirmación "better training" de la model card no está respaldada por datos.
- El entrenamiento no es bit-reproducible: misma semilla y código producen pesos distintos en máquinas diferentes, lo que dificulta la replicación exacta.
- La política está especializada en una única tarea (sprint de 2 m) y un único robot (microduck); no se garantiza su transferencia a otro hardware o morfología.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque no aplican a este tipo de modelo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por parte de terceros.
- El despliegue en robot real requiere el daemon microduck y privilegios (`sudo robotctl`), lo que introduce un riesgo operativo si la política no está validada en el hardware concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YellowDuckSweater/microduck-sprint-2m-run-1106-0945
- Repositorio de entrenamiento: https://github.com/StephenForte/microduck-challenges
- Proyecto microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Modelo comparable Helldave: https://huggingface.co/Helldave/microduck-sprint-2m-run-1027-2224
- Modelo comparable a1rb4Ck: https://huggingface.co/a1rb4Ck/microduck-sprint-2m
