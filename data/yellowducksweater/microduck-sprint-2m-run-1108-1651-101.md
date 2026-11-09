# YellowDuckSweater/microduck-sprint-2m-run-1108-1651-101

## Resumen

microduck-sprint-2m-run-1108-1651-101 es una política de control por refuerzo entrenada para el robot cuadrúpedo microduck de Pollen Robotics. No se trata de un modelo de lenguaje, sino de un controlador neuronal que recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, empaquetado en formato ONNX para su despliegue directo en el robot. Lo publica el usuario YellowDuckSweater y se enmarca en el ecosistema de retos de entrenamiento `microduck-challenges`.

El modelo resuelve la tarea `Mjlab-Sprint2m-MicroDuck`, que corresponde a una marcha de sprint de 2 metros. La política es perpetua: se ejecuta de forma continua hasta que se le indique lo contrario, y se carga en una ranura de política del demonio `robotctl`. La normalización de observaciones está integrada en el propio fichero `policy.onnx`, de modo que el consumidor puede alimentar observaciones en bruto.

La relevancia de esta ficha es limitada como modelo de IA generativa: es un artefacto de robótica con licencia no declarada, sin idiomas, sin benchmarks publicados y con un repositorio de 0.0 GB. Se documenta aquí con la información disponible y se marcan explícitamente los datos ausentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de reinforcement learning exportada a ONNX; arquitectura de red no declarada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana de observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` con esquema 2 del manifiesto de políticas microduck |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura de la red neuronal (capas, dimensiones ocultas, tipo de política). Se sabe que es una política de reinforcement learning entrenada con el framework `mjlab-microduck 0.1.0` (commit `1efd853be`) sobre la tarea `Mjlab-Sprint2m-MicroDuck`, en el repositorio `microduck-challenges` (commit `6155860d6`). El entrenamiento se realizó con 4096 entornos en paralelo, 2888 iteraciones máximas del agente, semilla 88 y checkpoint 1000, iniciado el 2026-11-09T00:55:35Z.

La interfaz del controlador está bien definida: observación de 61 dimensiones, 14 acciones, frecuencia de control de 50 Hz. La normalización de observaciones está embebida en el ONNX, lo que simplifica la integración en el robot. El autor advierte que el entrenamiento no es bit-reproducible entre máquinas: repetir el comando con el mismo código, `uv.lock` y semilla produce una política comparable, no idéntica.

## Capacidades

- Control locomotor de un robot cuadrúpedo microduck mediante política neuronal perpetua.
- Generación de una marcha de sprint de 2 metros (tarea `Mjlab-Sprint2m-MicroDuck`).
- Consumo de observaciones de 61 dimensiones y emisión de 14 acciones a 50 Hz.
- Normalización de observaciones integrada en el artefacto ONNX (admite observaciones en bruto).
- Carga en una ranura de política del demonio `robotctl` mediante `robotctl policy load`.
- Ejecución continua hasta recibir una orden de parada.
- No dispone de capacidades de lenguaje, visión, tool calling, agentes ni multilingüismo.

## Casos de uso

- Locomoción de sprint en el microduck: cargar la política en una ranura con `robotctl policy load` y dejar que el robot ejecute la marcha de forma continua para pruebas de velocidad en pista.
- Validación de pipelines de entrenamiento: usar la política como referencia reproducible (mismo commit, `uv.lock` y semilla) para comprobar que el entorno `mjlab-microduck` y el reto `Mjlab-Sprint2m-MicroDuck` funcionan correctamente.
- Benchmarking interno de controladores: comparar esta política de sprint contra otras políticas cargadas en ranuras distintas del mismo demonio para evaluar estabilidad y velocidad.
- Demostraciones de robótica en investigación: integrar el ONNX en un bucle de control a 50 Hz para experimentos de locomoción con observaciones en bruto.
- Pruebas de integración del manifiesto: validar el esquema 2 de `docs/policy-manifest.md` y el flujo de carga de políticas del daemon con un artefacto real.
- Reproducción de experimentos de RL: reentrenar con el comando documentado (4096 entornos, 2888 iteraciones, semilla 88) para estudiar la variabilidad entre ejecuciones y máquinas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB, lo que sugiere un artefacto muy pequeño, pero no se confirma el número de parámetros.
- GPU recomendadas: no disponibles para inferencia; el entrenamiento se realizó con GPU (el autor menciona que el RL en GPU no es bit-reproducible), sin especificar modelo.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: el artefacto está pensado para el demonio `robotctl` del microduck, que carga `policy.onnx` en una ranura de política; el runtime ONNX subyacente no se detalla.
- Latencia y throughput: la política opera a 50 Hz (periodo de 20 ms por paso de control); no se publican medidas de latencia adicionales.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas microduck comparables ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir permiso para uso comercial ni para redistribución; es necesario contactar con el autor antes de cualquier uso en producción.
- Sin benchmarks publicados: no hay evidencia cuantitativa de robustez, estabilidad o velocidad de la marcha más allá de la descripción de la tarea.
- Entrenamiento no bit-reproducible: el propio autor advierte que repetir el entrenamiento produce una política comparable, no los mismos pesos.
- Específica del hardware microduck: la política está acoplada a la interfaz de 61 observaciones y 14 acciones del robot; no es transferible a otras plataformas sin reentrenamiento.
- Sin datos de idiomas, sesgos o alucinación: no aplica como modelo de lenguaje, pero tampoco se documentan fallos de control, caídas o comportamientos inseguros.
- Repositorio de 0.0 GB y sin descargas ni likes: no hay evidencia de uso comunitario ni de validación externa.
- Fecha de creación futura (2026-11-09) en los metadatos: conviene verificar la integridad y procedencia del artefacto antes de desplegarlo en un robot real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YellowDuckSweater/microduck-sprint-2m-run-1108-1651-101
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de retos de entrenamiento: https://github.com/StephenForte/microduck-challenges
