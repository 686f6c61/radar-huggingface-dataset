# tdesc/microduck-tug-of-war-tug_full1

## Resumen

`microduck-tug-of-war-tug_full1` es una política de control motor entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. El modelo no es un modelo de lenguaje, sino una política neuronal exportada a ONNX que se ejecuta en el bucle de control del robot a 50 Hz, recibiendo observaciones de 61 dimensiones y emitiendo 14 acciones de actuación. Lo publica el usuario `tdesc` bajo el identificador `tdesc/microduck-tug-of-war-tug_full1`.

La tarea entrenada se denomina `Mjlab-TugOfWar-MicroDuck` y corresponde a una política de marcha ("perpetual policy") que se ejecuta de forma continua hasta que se le indica lo contrario. Se integra en el daemon del robot mediante el comando `robotctl policy load`, que carga el archivo `policy.onnx` en una ranura de política. El normalizador de observaciones está embebido en el propio ONNX, de modo que el consumidor debe alimentar observaciones en crudo.

El modelo es relevante en el contexto de la robótica de bajo coste y el aprendizaje por refuerzo aplicado a locomoción: demuestra un flujo de trabajo reproducible (código, `uv.lock`, semilla y comando de entrenamiento documentados) y una cadena de despliegue directa desde un artefacto ONNX hasta el hardware. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo es de 0.0 GB, lo que sugiere pesos muy ligeros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para control motor (arquitectura interna no detallada en la model card); exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`), con `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Framework de entrenamiento | mjlab-microduck 0.1.0 (commit `1efd853be`) |
| Tarea | `Mjlab-TugOfWar-MicroDuck` |
| Checkpoint | 125 |
| Semilla | 3 |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna de la red (número de capas, anchura, tipo de activación). Lo que sí se documenta es el pipeline de entrenamiento: la política se entrena con mjlab (base `mjlab-microduck 0.1.0` en el commit `1efd853be`) sobre el repositorio `tdesc/microduck-challenges`, en la rama `main` y el commit `127d3cbf5`. El entrenamiento parte de un run previo (`2026-11-24_14-09-31_tug_gentle1`, checkpoint `model_50.pt`) y continúa hasta el checkpoint 125, con 256 entornos paralelos, un máximo de 400 iteraciones, intervalo de guardado cada 25 iteraciones y semilla 3.

El modelo se exporta a ONNX con el normalizador de observaciones embebido, de forma que el consumidor no necesita replicar la normalización. El autor advierte explícitamente que el entrenamiento por refuerzo en GPU no es bit-reproducible entre máquinas: repetir el comando con el mismo código, `uv.lock` y semilla produce una política comparable, no los mismos pesos. El comando de reproducción completo está documentado en la model card (clonado del repo, `git checkout 127d3cbf5`, `uv sync` y `uv run train ...`).

## Capacidades

- Control motor de locomoción para el robot microduck: genera 14 acciones de actuación a partir de 61 observaciones a 50 Hz.
- Política perpetua: se ejecuta de forma continua hasta que se detiene explícitamente, pensada para cargarse en una ranura de política del daemon.
- Integración con el daemon del robot vía `robotctl policy load <slot> tdesc/microduck-tug-of-war-tug_full1`.
- Inferencia ONNX autocontenida: el normalizador de observaciones va embebido en `policy.onnx`.
- Metadatos de despliegue en `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Investigación en locomoción con RL: servir como política de referencia o punto de partida para experimentos de marcha en el microduck, dado que el pipeline de entrenamiento y la semilla están documentados.
- Reproducción de experimentos: permite reentrenar con el mismo código, `uv.lock`, comando y semilla para obtener una política comparable y estudiar la varianza del entrenamiento.
- Despliegue en hardware real: cargar `policy.onnx` en una ranura del daemon mediante `robotctl` para ejecutar la marcha en el robot físico sin pasos intermedios de conversión.
- Docencia y prototipado en robótica de bajo coste: el microduck de Pollen Robotics es una plataforma accesible, y esta política ilustra el ciclo completo de entrenamiento a despliegue.
- Benchmarking de políticas: comparar el rendimiento de esta política con otras del mismo repositorio de retos (`microduck-challenges`) sobre la misma tarea `Mjlab-TugOfWar-MicroDuck`.
- Integración en simuladores y tests de CI: al ser ONNX, la política puede ejecutarse en entornos simulados para validar cambios en el daemon o en el manifiesto antes de desplegar en hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repo es de 0.0 GB y la red es una política de control de dimensión de entrada 61 y salida 14, por lo que la huella de memoria es presumiblemente mínima, pero no se documenta.
- GPU recomendadas: no disponible para inferencia. Para reentrenar, la model card indica `--gpu-ids None` y 256 entornos paralelos, sin especificar modelo de GPU.
- ¿Cabe en GPU consumer? No disponible de forma explícita; por el tamaño del artefacto (ONNX de una política de control) es altamente probable que sí, pero no se confirma en la información disponible.
- Opciones de despliegue: runtime ONNX en el daemon de microduck, cargado vía `robotctl policy load`. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: frecuencia de control de 50 Hz (periodo de 20 ms por paso de inferencia). No se publican cifras de latencia por inferencia.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas comparables para el microduck ni datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier despliegue en producción.
- Entrenamiento no bit-reproducible: el autor advierte que repetir el entrenamiento produce una política comparable, no idéntica; no debe tratarse como un artefacto determinista.
- Exportado desde un checkout con cambios sin commitear: la model card indica "exported from a checkout with uncommitted changes", lo que puede afectar a la reproducibilidad exacta del artefacto.
- Número de descargas y likes nulo en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- Ámbito muy restringido: es una política específica para una tarea (`Mjlab-TugOfWar-MicroDuck`) y un robot concreto (microduck); no es transferible a otros robots o tareas sin reentrenamiento.
- Sin información sobre sesgos, alucinación o limitaciones de idioma: no aplican en el sentido habitual de modelos de lenguaje, pero tampoco se documentan modos de fallo de la política (por ejemplo, comportamiento ante observaciones fuera de distribución).
- Dependencia del contrato de observación: el consumidor debe respetar exactamente las 61 dimensiones de observación y las 14 de acción; cualquier cambio en el firmware o en el manifiesto puede invalidar la política.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tdesc/microduck-tug-of-war-tug_full1
- Repositorio de retos y entrenamiento: https://github.com/tdesc/microduck-challenges.git
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa en la información disponible)
