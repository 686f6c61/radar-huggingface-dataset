# youlim/microduck-sprint-head25

## Resumen

`youlim/microduck-sprint-head25` no es un modelo de lenguaje, sino una política de control motriz entrenada por aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck de Pollen Robotics. La política consume una observación de 61 dimensiones y emite 14 acciones a 50 Hz, y se distribuye como un grafo ONNX (`policy.onnx`) con el normalizador de observaciones embebido, acompañado de un `manifest.json` que sigue el esquema 2 del manifiesto de políticas del daemon de microduck. El autor es el usuario `youlim` de HuggingFace y el repositorio se publicó el 27 de octubre de 2026.

El entrenamiento se realizó con el stack `mjlab-microduck 0.1.0` sobre la tarea `Mjlab-Sprint2m-MicroDuck` del repositorio `pollen-robotics/microduck-challenges`, en el commit `f5cba0bef`, con 4096 entornos paralelos, hasta 3000 iteraciones y semilla 1; el checkpoint publicado es el 1000. La política se describe como "perpetua": ejecuta una marcha continua hasta que se le indique lo contrario, y se carga en una ranura de política del robot mediante `robotctl`.

Su relevancia es acotada pero concreta: ejemplifica el formato de empaquetado reproducible de políticas de locomoción para hardware abierto de bajo coste, con normalización embebida para evitar desajustes entre simulación y despliegue. El repositorio tiene 0 descargas, 0 likes, un tamaño de 0.0 GB y no declara licencia ni idiomas, por lo que debe tratarse como un artefacto de investigación sin validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control entrenada por aprendizaje por refuerzo y exportada como red neuronal en ONNX; topología interna (capas, anchura, activaciones) no documentada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no disponible; no es un modelo de lenguaje. La política consume una observación de 61 dimensiones por paso de control |
| Tipos de cuantizacion | no disponible (se distribuye un único `policy.onnx`) |
| Idiomas soportados | no disponible; no aplica a una política motriz |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Tarea de entrenamiento | `Mjlab-Sprint2m-MicroDuck` |
| Checkpoint publicado | 1000 |
| Libreria declarada | `microduck` |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red (número de capas, unidades ocultas ni función de activación); solo se especifica que la política se exporta a ONNX con el normalizador de observaciones integrado en el propio grafo, de modo que el robot debe alimentar observaciones en bruto. La interfaz es fija: 61 entradas de observación y 14 salidas de acción, ejecutadas en un bucle de control de 50 Hz. La política es "perpetua" en el sentido de que genera una marcha continua sin condición de parada interna. La tarea se denomina `Sprint2m`, lo que sugiere un objetivo de desplazamiento tipo sprint, aunque la model card no describe la función de recompensa ni los criterios de terminación del episodio.

El entrenamiento se realizó con `mjlab-microduck 0.1.0` (commit base `8d0dbc94c`) sobre el repositorio `pollen-robotics/microduck-challenges` en el commit `f5cba0bef`, con 4096 entornos simulados en paralelo, un máximo de 3000 iteraciones, semilla 1 y registro en TensorBoard bajo el nombre de ejecución `head25`. El autor advierte explícitamente de que el proceso no es reproducible bit a bit entre máquinas: repetir el comando con el mismo `uv.lock` y la misma semilla produce una política comparable, no idéntica. No se especifica el algoritmo de RL empleado (PPO u otro), ni el número total de pasos de entorno, ni si hubo fases de ajuste fino o de *domain randomization*.

## Capacidades

- Locomoción cuadrúpeda: genera comandos de actuación continua para 14 articulaciones a partir de 61 señales de observación, a 50 Hz.
- Marcha sostenida: política "perpetua", pensada para ejecutarse de forma continua hasta recibir una orden de parada o cambio de ranura.
- Despliegue directo en robot: se carga en una ranura de política mediante `sudo robotctl policy load <slot> youlim/microduck-sprint-head25`.
- Normalización integrada: acepta observaciones en bruto, sin preprocesado externo.
- Empaquetado estandarizado: incluye `manifest.json` conforme al esquema 2, lo que permite que el daemon valide y cargue la política sin configuración adicional.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües, de visión, audio ni generación de texto.
- No se documenta capacidad de generalización a otros robots, tareas o morfologías distintas de microduck.

## Casos de uso

- Despliegue de una marcha funcional en un microduck físico: cargar la política en una ranura con `robotctl` y ejecutarla en el bucle de 50 Hz para obtener locomoción sin entrenar desde cero.
- Referencia base en el reto `microduck-challenges`: usar el checkpoint 1000 y la configuración publicada (4096 entornos, semilla 1) como línea de partida para comparar variantes de recompensa o de configuración de escena.
- Currículum de velocidad: emplear esta política de sprint como inicialización para ajustar políticas de marcha más lentas o de mayor estabilidad, reutilizando la interfaz de 61 observaciones y 14 acciones.
- Evaluación de transferencia simulación-real: comparar el comportamiento en el simulador mjlab con el del robot físico para cuantificar la brecha de transferencia con normalización embebida.
- Pruebas de integración del daemon: validar la carga, el cambio y la descarga de ranuras de política y la conformidad con el esquema 2 del manifiesto en un pipeline de CI del daemon.
- Docencia e investigación en RL para robótica de bajo coste: reproducir el entrenamiento completo con `uv sync` y un único comando sobre hardware de consumo, dado el reducido coste computacional del entorno.
- Validación de exportación a ONNX: comprobar que un grafo con normalizador embebido produce salidas equivalentes a las del entrenamiento antes de desplegar en el robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente aporta datos de configuración de entrenamiento (4096 entornos paralelos, hasta 3000 iteraciones, checkpoint 1000, semilla 1) y el nombre de la tarea (`Mjlab-Sprint2m-MicroDuck`), sin métricas de recompensa final, velocidad alcanzada, tasa de caídas ni evaluación en hardware físico.

## Requisitos de hardware

- VRAM estimada para inferencia: muy inferior a 1 GB (estimación propia a partir de una política ONNX de 61 entradas y 14 salidas; no publicado por el autor).
- GPU: no es necesaria para inferencia. Para reentrenar, la configuración de referencia usa 4096 entornos paralelos en simulador, lo que en la práctica requiere una GPU con aceleración CUDA; no se especifica el modelo concreto.
- Cabe en GPU de consumo y también en CPU: la inferencia de la política está pensada para ejecutarse en el propio robot, no en un servidor.
- Despliegue: el único mecanismo documentado es el daemon de microduck mediante `robotctl policy load`; el runtime subyacente es ONNX. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia: el bucle de control corre a 50 Hz, por lo que cada paso de inferencia debe completarse en 20 ms como máximo para no degradar la marcha. El tiempo real por inferencia no se publica.
- Throughput: no disponible.
- Almacenamiento: el repositorio ocupa 0.0 GB según HuggingFace, coherente con un grafo ONNX de tamaño reducido.

## Comparativa con modelos similares

No se dispone de información sobre políticas comparables publicadas con parámetros, contexto o métricas verificables en el material proporcionado. La única referencia adyacente es el propio stack base `mjlab-microduck 0.1.0` y el resto de políticas del repositorio `microduck-challenges` (el sufijo `head25` del nombre sugiere ejecuciones hermanas en la misma campaña), pero no se aportan datos de ninguna de ellas.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-sprint-head25 | no disponible | no aplica (observación de 61 dimensiones) | no disponible | no disponible | HuggingFace, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no puede asumirse permiso para uso comercial, redistribución ni obras derivadas; es un riesgo legal directo en producción.
- Ausencia de validación externa: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de despliegues correctos por terceros.
- Tarea única: la política está entrenada exclusivamente para `Mjlab-Sprint2m-MicroDuck`; no hay garantía de comportamiento ante comandos de velocidad, terreno o perturbaciones distintos de los del entrenamiento.
- Brecha simulación-real no documentada: no se publican resultados en hardware físico, tasa de caídas ni robustez frente a cambios de fricción, masa o calibración de actuadores.
- Dependencia del normalizador embebido: si se altera el orden o la escala de las 61 observaciones en el lado del robot, la política recibirá entradas fuera de distribución sin aviso.
- Reproducibilidad limitada: el propio autor indica que el reentrenamiento con la misma semilla produce una política comparable, no idéntica, lo que complica la auditoría y la comparación fina entre ejecuciones.
- Sin información sobre sesgos: al no tratar texto ni datos personales, no aplican sesgos lingüísticos, pero sí un posible sobreajuste a la dinámica exacta del simulador.
- Tamaño de repositorio de 0.0 GB: conviene verificar que `policy.onnx` y `manifest.json` están realmente presentes y son íntegros antes de integrarlos en un pipeline.
- Fecha de creación atípica (2026-10-27): verificar la procedencia y vigencia del artefacto antes de adoptarlo como dependencia.
- Riesgo para seguridad física: una política de locomoción perpetua sin condición de parada interna exige mecanismos externos de parada de emergencia en el robot.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/youlim/microduck-sprint-head25
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Definición del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck (ruta citada en la model card, sin URL directa disponible)
- Paper, blog o demo: no disponible
