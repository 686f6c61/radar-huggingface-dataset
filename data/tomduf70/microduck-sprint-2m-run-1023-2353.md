# tomduf70/microduck-sprint-2m-run-1023-2353

## Resumen

`microduck-sprint-2m-run-1023-2353` es una política de control locomotriz obtenida por aprendizaje por refuerzo para el robot microduck de Pollen Robotics. No es un modelo de lenguaje: se trata de una red neuronal de política exportada a ONNX que consume observaciones de 61 dimensiones y emite 14 acciones de control a 50 Hz, pensada para ejecutarse en bucle indefinido sobre el robot real. El autor es `tomduf70`, que la publica como parte de una serie de experimentos de la tarea `Mjlab-Sprint2m-MicroDuck`.

La política se entrenó con el stack `mjlab-microduck 0.1.0` sobre 4096 entornos paralelos, con un máximo de 3000 iteraciones y checkpoint 750, semilla 1. Según la model card, el autor buscó el menor reward de mantenimiento erguido y el mayor avance por paso, lo que produce una marcha de tipo *sprint* perpetua: el robot sigue desplazándose hasta que se le ordena lo contrario.

Su relevancia es acotada pero clara para quien trabaja en robótica open source: es un ejemplo reproducible de un pipeline completo de entrenamiento RL en simulación (MuJoCo/mjlab) hasta despliegue en hardware mediante el daemon `robotctl`, con el normalizador de observaciones embebido en el propio ONNX y un manifiesto de política versionado (esquema 2).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para control continuo, exportada a ONNX; topología interna no detallada en la informacion disponible |
| Parametros totales | no disponible (tamano del repo: 0.0 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; ventana de observacion de 61 dimensiones y control a 50 Hz |
| Tipos de cuantizacion | no disponible; se distribuye en ONNX sin variantes cuantizadas publicadas |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de politicas de microduck) |

## Arquitectura y entrenamiento

La política sigue el paradigma estándar de control por refuerzo para locomoción: un agente recibe un vector de observación de 61 dimensiones (probablemente estado propioceptivo del robot, consignas de velocidad y fase de la marcha, aunque la composición exacta no se detalla) y produce 14 acciones continuas a 50 Hz. El entrenamiento se realizó con `mjlab-microduck 0.1.0`, sobre la tarea `Mjlab-Sprint2m-MicroDuck`, con 4096 entornos simulados en paralelo, un máximo de 3000 iteraciones y checkpoint guardado en la iteración 750, semilla 1. El algoritmo concreto de optimización no se indica en la documentación disponible.

Un detalle técnico relevante es que el normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo, sin preprocesado adicional. La política se distribuye como un *slot* de política del daemon de microduck, descrito por `manifest.json` conforme al esquema 2. El autor advierte de que el entrenamiento no es bit-reproducible entre máquinas: repetir el comando con el mismo `uv.lock` y la misma semilla produce una política comparable, no idéntica.

## Capacidades

- Generación de marcha continua (*perpetua*) para el robot microduck: la política no termina por sí sola, corre hasta que se le ordena lo contrario.
- Control a 50 Hz con 14 acciones, adecuado para el bucle de control de bajo nivel del robot.
- Consumo de observaciones en crudo gracias al normalizador embebido en el ONNX.
- Tarea de *sprint* de 2 metros: optimizada para avance rápido, con un reward de mantenimiento erguido deliberadamente bajo.
- Despliegue mediante el daemon del robot (`robotctl policy load <slot> ...`), cargable en un slot de política.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es exclusivamente una política motora.

## Casos de uso

- **Investigación en locomoción con RL**: servir de punto de partida o referencia para comparar configuraciones de reward (por ejemplo, el intercambio entre estabilidad erguida y velocidad de avance) en la tarea `Mjlab-Sprint2m-MicroDuck`.
- **Validación de pipelines sim-to-real**: cargar la política en un microduck real y medir la degradación respecto a la simulación, aprovechando que el normalizador viaja dentro del ONNX y elimina una fuente habitual de discrepancias.
- **Participación en retos de microduck**: el repositorio `microduck-challenges` está pensado para experimentos comparables; esta política puede usarse como baseline del reto de sprint o como punto de comparación de otras ejecuciones de la serie `run-*`.
- **Docencia y divulgación**: ejemplo completo y reproducible de entrenamiento RL masivamente paralelo (4096 entornos) hasta despliegue en hardware, útil en cursos de robótica o aprendizaje por refuerzo.
- **Pruebas de estrés del daemon de control**: una política perpetua es útil para verificar la robustez del *scheduler* de políticas, la gestión de slots y el comportamiento ante parada forzada.
- **Pruebas de rendimiento de inferencia ONNX en el hardware del robot**: permite medir latencia real de inferencia a 50 Hz con un modelo pequeño, sin dependencia de GPU.
- **Base para *fine-tuning* o destilación**: al ser una política entrenada con un stack reproducible, puede servir de inicialización para variantes con mayor estabilidad o menores oscilaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, velocidad alcanzada, tasa de caídas ni evaluaciones en robot real, y los resultados de la búsqueda web proporcionada no guardan relación con el modelo (corresponden a un personaje de ficción). No se dispone por tanto de cifras verificables de rendimiento.

## Requisitos de hardware

- **VRAM para inferencia**: no aplica en sentido estricto; el tamaño del repositorio es de 0.0 GB y la política está pensada para ejecutarse en el propio robot. No se publica el número de parámetros ni el tamaño del ONNX.
- **GPU recomendadas**: no disponible para inferencia; para reentrenar con 4096 entornos paralelos se requiere una GPU de gama alta (el modelo concreto no se especifica en la documentación).
- **Consumer GPU**: la inferencia de una política de este tipo es viable en CPU; el entrenamiento con 4096 entornos paralelos no es realista en GPU de consumo sin reducir `--env.scene.num-envs`.
- **Opciones de despliegue**: ONNX Runtime dentro del daemon de microduck, cargando la política con `robotctl policy load <slot> tomduf70/microduck-sprint-2m-run-1023-2353`.
- **Latencia y throughput**: el bucle de control objetivo es de 50 Hz (20 ms por paso), pero no se publican medidas reales de latencia de inferencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / observacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tomduf70/microduck-sprint-2m-run-1023-2353` | Política RL para microduck (ONNX) | no disponible | 61-D obs., 14 acciones, 50 Hz | no disponible | HuggingFace, 0 descargas |
| Otras ejecuciones de la serie `run-*` del mismo autor | Políticas RL para microduck | no disponible | misma interfaz (61-D / 14 acciones) | no disponible | no verificado en la informacion disponible |
| Políticas basadas en Isaac Lab para cuadrúpedos | Políticas RL | no disponible | variable | habitualmente BSD-3/MIT | no disponible |

No se dispone de datos públicos de modelos comparables de la misma categoría (políticas para microduck) en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- **Licencia no declarada**: al no especificarse licencia, el uso comercial y la redistribución quedan en un limbo jurídico; conviene contactar con el autor antes de integrarla en un producto.
- **Sin métricas de evaluación**: no hay datos de recompensa final, velocidad media, tasa de caídas ni evaluación sim-to-real, lo que impide valorar su calidad objetiva.
- **Sesgo de reward explícito**: el autor indica que usó el menor reward de mantenimiento erguido y el mayor avance por paso, lo que prioriza velocidad sobre estabilidad; es esperable un comportamiento agresivo y potencialmente inestable en terreno real.
- **Brecha sim-to-real**: entrenada íntegramente en simulación (mjlab); no se documenta aleatorización de dominio ni validación en hardware.
- **No reproducible bit a bit**: los pesos no pueden regenerarse exactamente, lo que complica la auditoría y la comparación fina entre ejecuciones.
- **Alcance muy restringido**: no procesa lenguaje, imagen ni audio; solo genera acciones motoras para un robot concreto.
- **Acoplamiento al hardware y al daemon**: depende de la interfaz de 61 observaciones / 14 acciones y del esquema 2 del manifiesto; cambios en el daemon o en el robot pueden invalidarla.
- **Madurez**: 0 descargas y 0 *likes* en el momento de la consulta; no hay evidencia de uso externo ni de soporte.
- **Riesgo de sobreajuste a la tarea**: optimizada para un *sprint* de 2 metros; su comportamiento en otras consignas de velocidad o dirección no está documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tomduf70/microduck-sprint-2m-run-1023-2353
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento del autor: https://github.com/tomduf70/microduck-challenges (commit `9dcc33bae`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck (ruta citada en la model card; URL exacta no disponible)
- Resultados de búsqueda web: no relevantes para este modelo (corresponden a un personaje de ficción de *My Hero Academia*); no se incluyen como fuentes.
