# tdesc/microduck-sprint-warmstart0

## Resumen

`microduck-sprint-warmstart0` es una política de control para robots cuadrúpedos de pequeño tamaño (microduck) desarrollada por el usuario tdesc y publicada en Hugging Face. No se trata de un modelo de lenguaje, sino de una política de aprendizaje por refuerzo entrenada para producir una marcha (gait) perpetua que se ejecuta de forma continua hasta que se detiene explícitamente. El modelo consume observaciones de 61 dimensiones y emite 14 acciones a una frecuencia de control de 50 Hz, empaquetado en formato ONNX para su despliegue en el robot.

El modelo se ha entrenado dentro del ecosistema mjlab (simulador basado en MuJoCo) con el framework microduck de Pollen Robotics, que permite cargar políticas en ranuras (slots) del daemon del robot mediante el comando `robotctl`. La política incluye el normalizador de observaciones embebido en el propio grafo ONNX, de modo que el robot puede alimentar observaciones en bruto sin preprocesado adicional.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin model card pública más allá de los metadatos de entrenamiento. No hay información sobre licencia, idiomas ni benchmarks, por lo que cualquier evaluación de rendimiento debe hacerse empíricamente sobre el robot o en el simulador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de aprendizaje por refuerzo exportada a ONNX; arquitectura de red no especificada en la información disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La política se entrena con aprendizaje por refuerzo en el simulador mjlab, sobre la tarea `Mjlab-Sprint2m-MicroDuck`, con 512 entornos paralelos, un máximo de 750 iteraciones y semilla 1. El entrenamiento parte de un warm start: se reanuda desde el run `warmstart_ref` y el checkpoint `model_ref.pt`, lo que explica el sufijo `warmstart0` del nombre. La base del entorno es `mjlab-microduck 0.1.0` en el commit `1efd853be`, y el código de entrenamiento está en el repositorio `tdesc/microduck-challenges` en el commit `f2f183853`.

La observación tiene 61 dimensiones y la acción 14 dimensiones, con control a 50 Hz, lo que es coherente con políticas de locomoción para cuadrúpedos pequeños donde el estado incluye posiciones, velocidades y orientación de las articulaciones, además de comandos de marcha. El normalizador de observaciones está integrado en el grafo ONNX, una decisión de ingeniería que simplifica el despliegue al eliminar la necesidad de replicar la normalización en el lado del robot. El autor advierte explícitamente que el entrenamiento no es bit-reproducible entre máquinas: misma semilla y mismo código producen una política comparable, no idéntica.

## Capacidades

- Locomoción perpetua: genera una marcha continua que se ejecuta hasta que se detiene explícitamente, sin horizonte de episodio fijo.
- Control a 50 Hz con 14 acciones y observaciones de 61 dimensiones, adaptado a la morfología del microduck.
- Despliegue directo en robot mediante `robotctl policy load <slot> tdesc/microduck-sprint-warmstart0`.
- Inferencia autocontenida: el normalizador de observaciones va embebido en `policy.onnx`, por lo que acepta observaciones en bruto.
- Compatibilidad con el manifiesto de políticas microduck schema 2, lo que permite cargarlo en cualquier slot del daemon.
- No soporta tool calling, agentes, razonamiento multi-step, visión, audio ni capacidades multilingües: es una política de control motor.

## Casos de uso

- Investigación en locomoción de cuadrúpedos pequeños: sirve como política base (warm start) para experimentos posteriores de fine-tuning en mjlab, ya que el autor documenta el comando exacto de reproducción y el checkpoint de partida.
- Benchmark de simulación a realidad: permite comparar el comportamiento de la política entrenada en mjlab con su ejecución en el robot físico microduck, evaluando la brecha sim-to-real en una tarea de marcha sostenida.
- Demostraciones de robótica educativa: con el comando `robotctl policy load`, un usuario con un microduck puede cargar la política en un slot y observar una marcha funcional sin entrenar nada, útil en talleres y cursos.
- Pruebas de infraestructura de despliegue: al ser un ONNX autocontenido con normalizador embebido, es un caso de prueba útil para validar pipelines de carga de políticas en el daemon (verificación de manifiesto schema 2, gestión de slots, frecuencia de control a 50 Hz).
- Comparación de estrategias de entrenamiento: al estar entrenada con warm start desde `model_ref.pt`, permite contrastar políticas con y sin warm start bajo la misma tarea `Mjlab-Sprint2m-MicroDuck` y la misma semilla.
- Base para tareas derivadas: una marcha perpetua estable es un punto de partida razonable para entrenar habilidades compuestas (giros, cambios de velocidad, recuperación de perturbaciones) mediante recompensas adicionales sobre la misma observación de 61 dimensiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, tasa de éxito, velocidad de marcha ni curvas de entrenamiento; solo los hiperparámetros y el comando de reproducción.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser una política de control pequeña exportada a ONNX, es previsible que quepa en cualquier GPU consumer e incluso en CPU, pero el tamaño exacto del grafo no se documenta (el repositorio ocupa 0.0 GB según Hugging Face).
- GPU recomendadas: no disponibles. Para el entrenamiento, la configuración documentada usa 512 entornos paralelos y 750 iteraciones, lo que requiere una GPU con memoria suficiente para el simulador mjlab; el comando de reproducción pasa `--gpu-ids None`, lo que sugiere ejecución en CPU o selección automática de dispositivo, pero no se especifica.
- Cabe en consumer GPU: previsiblemente sí para inferencia, dado el reducido tamaño de una política de locomoción; no confirmado por el autor.
- Opciones de despliegue: ONNX Runtime a través del daemon microduck (`robotctl policy load`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles. El único dato de temporización es la frecuencia de control de 50 Hz (periodo de 20 ms), que la política debe cumplir en el robot.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas microduck comparables ni datos de rendimiento que permitan una comparación cuantitativa. Como referencia cualitativa, el ecosistema microduck de Pollen Robotics publica políticas en el mismo formato (ONNX + manifiesto schema 2), pero no se dispone de sus especificaciones en esta consulta.

## Limitaciones y advertencias

- Licencia no disponible: no se puede asumir permiso de uso comercial ni de redistribución; hay que contactar con el autor antes de integrarla en un producto.
- Artefacto sin validación comunitaria: cero descargas y cero likes en el momento de la consulta, sin evidencia externa de funcionamiento en hardware real.
- Sin métricas publicadas: no hay datos de recompensa, robustez ni tasa de caídas, por lo que el rendimiento real es desconocido hasta evaluarlo.
- Entrenamiento no reproducible bit a bit: el autor lo advierte explícitamente; misma semilla y código producen una política comparable, no idéntica.
- Ámbito muy restringido: es una política de marcha para el microduck; no es un modelo de propósito general y no admite otras tareas sin reentrenamiento.
- Dependencia del ecosistema: requiere el daemon microduck y el manifiesto schema 2; no es portable a otras plataformas robóticas sin adaptación.
- Riesgo de brecha sim-to-real: no se documentan pruebas en robot físico ni técnicas de domain randomization, por lo que la transferencia desde mjlab no está garantizada.
- Sin información sobre sesgos, alucinación o multilingüismo: no aplica a este tipo de modelo, pero tampoco se documenta nada al respecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tdesc/microduck-sprint-warmstart0
- Repositorio de entrenamiento: https://github.com/tdesc/microduck-challenges.git (commit `f2f183853`)
- Framework microduck de Pollen Robotics: https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon microduck (no se proporciona URL directa en la información disponible)
