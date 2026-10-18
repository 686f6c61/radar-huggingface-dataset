# TheSauceman/microduck-hill-climb-1m5-climb1

## Resumen

`microduck-hill-climb-1m5-climb1` es una política de control por refuerzo (reinforcement learning) publicada por el usuario TheSauceman para el robot cuadrúpedo microduck de Pollen Robotics. No es un modelo de lenguaje: es una política de locomoción que se carga en una "policy slot" del robot y se ejecuta en bucle cerrado a 50 Hz, consumiendo observaciones de 61 dimensiones y emitiendo 14 acciones. Se distribuye como un único `policy.onnx` acompañado de un `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck.

El modelo resuelve un problema muy concreto: subir una pendiente de 8° con un microduck configurado como "Sprint" de 2 m de longitud. Según la model card, la política fue entrenada con recompensa por velocidad bruta, de modo que acelera a tope en la subida incluso cuando se le ordena caminar a 0,20 m/s. El autor reporta que pasó de 7,7 s a 1,37 s en su primer intento, lo que sitúa la ficha en el terreno de la robótica de locomotion más que en el de la IA generativa.

La relevancia es doble: por un lado, ilustra el flujo de trabajo reproducible (entorno `mjlab`, `uv.lock`, semilla fija) para entrenar políticas con RL en GPU; por otro, evidencia una limitación clásica del reward shaping: una política recompensada por velocidad pura no respeta consignas de velocidad baja en pendiente. El repositorio ocupa 0,0 GB, no tiene descargas ni likes y no declara licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de reinforcement learning exportada a ONNX (topología de la red no disponible en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; observación de 61 dimensiones por paso de control |
| Tipos de cuantizacion | no disponible (exportación ONNX; el normalizador de observaciones está embebido en `policy.onnx`) |
| Idiomas soportados | no aplica (modelo de control robótico) |
| Licencia | no disponible (no declarada en la model card ni en los metadatos de HuggingFace) |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` (schema 2 del manifiesto de políticas de microduck) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Tipo de politica | Perpetua (se ejecuta hasta recibir orden de parada), cargada como gait en un slot de política |
| Hardware objetivo | microduck (Pollen Robotics), configuración "Sprint" de 2 m |
| task_id | `Mjlab-HillClimb1m5-MicroDuck` |
| Checkpoint | 2000 |
| Semilla | 10301 |

## Arquitectura y entrenamiento

La model card no describe la topología de la red neuronal (número de capas, anchura, funciones de activación ni si se emplea memoria recurrente). Lo que sí se documenta es la interfaz: una política reactiva que mapea 61 observaciones a 14 acciones a 50 Hz, con el normalizador de observaciones integrado en el propio grafo ONNX, de forma que el robot debe alimentar observaciones en crudo. La política es de tipo perpetuo: no tiene condición de terminación propia y se ejecuta como una marcha (gait) hasta que el daemon la descarga del slot.

El entrenamiento se realizó con `mjlab-microduck 0.1.0` (commit base `8d0dbc94c`) sobre la tarea `Mjlab-HillClimb1m5-MicroDuck`, del repositorio `SteveTarter/microduck-challenges` (rama `claude/project-thread-h4e0o0`, commit `af037c788`), con 2048 entornos paralelos, un máximo de 3000 iteraciones del agente, semilla 10301, logger de TensorBoard y nombre de run `climb1`; el checkpoint publicado es el 2000. El autor advierte explícitamente que el entrenamiento no es bit-reproducible entre máquinas: la misma semilla y el mismo `uv.lock` producen una política comparable, no idéntica. La función de recompensa prioriza velocidad bruta, lo que explica el comportamiento observado en pendiente.

## Capacidades

- Locomoción cuadrúpeda en pendiente ascendente de 8° para el microduck en configuración Sprint de 2 m.
- Control reactivo en bucle cerrado a 50 Hz con observaciones de 61 dimensiones y 14 acciones.
- Ejecución perpetua como marcha cargada en un slot de política del daemon (`robotctl policy load`).
- Normalización de observaciones integrada en el ONNX: no requiere preprocesado externo en el robot.
- Despliegue autocontenido: un `policy.onnx` más un `manifest.json` con schema 2.
- No dispone de tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües; es una política de control motor.

## Casos de uso

- Investigación en locomoción en pendiente: usar la política como línea base reproducible para comparar recompensas o curricula de entrenamiento en la tarea `Mjlab-HillClimb1m5-MicroDuck`.
- Prueba de robustez de reward shaping: el caso documentado (consigna de 0,20 m/s frente a velocidad real a tope en subida) sirve para estudiar cómo una recompensa de velocidad bruta domina sobre las consignas de velocidad en terreno inclinado.
- Demostración de despliegue ONNX en robótica de bajo coste: el paquete `policy.onnx` + `manifest.json` se carga con un solo comando `robotctl policy load`, útil para validar el pipeline de políticas del daemon.
- Benchmark interno de gaitas: comparar tiempos de subida de 8° (7,7 s de referencia frente a 1,37 s reportados) entre distintas políticas cargadas en el mismo robot y pendiente.
- Reproducción de experimentos de RL con `mjlab`: reentrenar con `--env.scene.num-envs 2048`, semilla 10301 y 3000 iteraciones para verificar la variabilidad entre ejecuciones no bit-reproducibles.
- Docencia y talleres de RL aplicado a robótica: ejemplo compacto (repo de 0,0 GB) de política entrenada, exportada y desplegada en hardware real.
- Sustitución de marcha en el microduck Sprint: cargar esta política en un slot cuando el robot vaya a operar en rampas suaves, aceptando la limitación de velocidad no regulada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible. El único dato de rendimiento es anecdótico y específico de la tarea:

| Metrica | Valor reportado | Contexto |
|---|---|---|
| Tiempo de subida de pendiente de 8° | 7,7 s antes / 1,37 s después | Primer intento de la política reentrenada, según la model card |
| Velocidad de consigna | 0,20 m/s | No respetada: la política acelera a tope en subida |
| Frecuencia de control | 50 Hz | Interfaz del daemon |
| Entornos de entrenamiento | 2048 | `--env.scene.num-envs` |
| Iteraciones máximas | 3000 | `--agent.max-iterations`, checkpoint publicado 2000 |

## Requisitos de hardware

- Inferencia: no disponible como cifra de VRAM. El repositorio ocupa 0,0 GB y la política se sirve como un `policy.onnx` de una red que mapea 61 entradas a 14 salidas; por su tamaño, es previsible que se ejecute en CPU del propio robot o de un host ligero, pero no hay mediciones publicadas.
- Entrenamiento: se realizó con RL en GPU con 2048 entornos paralelos y hasta 3000 iteraciones; el modelo concreto de GPU no se indica en la model card.
- GPU recomendadas: no disponible. No se especifica ni la GPU usada en entrenamiento ni requisitos mínimos.
- Compatibilidad con GPU de consumo: no confirmada para entrenamiento; no hay datos. Para inferencia no aplica en la mayoría de despliegues, al ejecutarse en el robot.
- Opciones de despliegue: runtime ONNX (ONNX Runtime u otro) cargado por el daemon de microduck mediante `sudo robotctl policy load <slot> TheSauceman/microduck-hill-climb-1m5-climb1`. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible; el único requisito temporal explícito es sostener el bucle de control a 50 Hz (20 ms por paso).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / observacion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| microduck-hill-climb-1m5-climb1 | Política RL (ONNX) para microduck Sprint 2 m | no disponible | 61-D obs / 14 acciones, 50 Hz | 1,37 s en pendiente de 8° (dato del autor frente a 7,7 s de referencia) | no disponible | HuggingFace, 0 descargas, 0 likes |
| Otras políticas del repositorio `microduck-challenges` | Políticas RL para microduck | no disponible | no disponible | no disponible | no disponible | Repositorio GitHub del autor |
| Políticas oficiales de microduck (Pollen Robotics) | Políticas RL para microduck | no disponible | no disponible | no disponible | no disponible | Proyecto `pollen-robotics/microduck` |

No se dispone de datos públicos de parámetros, contexto o benchmarks de las alternativas en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- No respeta consignas de velocidad: con recompensa por velocidad bruta, acelera a tope en pendiente incluso con orden de 0,20 m/s, lo que puede ser inseguro en entornos con personas u obstáculos.
- Especialización estrecha: entrenada para una pendiente de 8° con un microduck Sprint de 2 m (task_id `Mjlab-HillClimb1m5-MicroDuck`); el comportamiento fuera de esa configuración no está documentado.
- Sin licencia declarada: no se especifican condiciones de uso comercial, redistribución ni modificación; debe tratarse como no licenciada hasta contactar con el autor.
- Reproducibilidad limitada: el propio autor advierte que el RL en GPU no es bit-reproducible; el mismo comando y semilla producen una política comparable, no los mismos pesos.
- Trazabilidad incompleta: la model card apunta a una rama (`claude/project-thread-h4e0o0`) y un commit concretos del repositorio de retos, sin publicar métricas de evaluación adicionales ni curvas de entrenamiento.
- Sin datos de seguridad ni de simulación a real (sim-to-real gap): no se documentan tasas de caída, robustez a perturbaciones ni comportamiento ante terrenos distintos de la pendiente entrenada.
- Metadatos pobres: 0 descargas y 0 likes en el momento de la consulta, sin idiomas ni licencia, lo que dificulta evaluar su madurez.
- Los resultados de búsqueda web obtenidos no contienen información relevante sobre el modelo (devuelven páginas de la Ligue 1 de fútbol), por lo que no se han podido verificar datos externos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TheSauceman/microduck-hill-climb-1m5-climb1
- Proyecto microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/SteveTarter/microduck-challenges
- Commit de entrenamiento: https://github.com/SteveTarter/microduck-challenges/commit/af037c788
- Rama de entrenamiento: https://github.com/SteveTarter/microduck-challenges/tree/claude/project-thread-h4e0o0
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck (no se proporciona URL directa)
- Paper, blog o demo adicionales: no disponible en la información proporcionada
