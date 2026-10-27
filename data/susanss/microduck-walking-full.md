# SusanSS/microduck-walking-full

## Resumen

`SusanSS/microduck-walking-full` es una política de locomoción por aprendizaje por refuerzo (reinforcement learning) para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. No es un modelo de lenguaje: se trata de un controlador neuronal que mapea una observación de 61 dimensiones a 14 acciones de control, ejecutándose a 50 Hz sobre el hardware del robot. Se publica como un fichero `policy.onnx` con el normalizador de observaciones ya incorporado, de modo que el robot puede alimentarlo directamente con observaciones en bruto. El repositorio ocupa 0.0 GB, lo que sitúa la política en el rango de redes ligeras aptas para inferencia en el propio robot.

El modelo se enmarca en el ecosistema de políticas del daemon de microduck y ocupa el slot `walk`, es decir, la marcha que el robot utiliza cuando se le indica que camine. Según la model card del autor, se trata de una política «perpetua»: genera la marcha de forma continua hasta recibir una orden en sentido contrario, en lugar de ejecutar una secuencia finita de pasos. El autor reporta que la política completa 4 de cada 5 intentos de recorrido a 0,70 m/s.

Su relevancia es acotada pero específica: aporta una política de marcha reproducible, con procedencia declarada del entrenamiento (repositorio `pollen-robotics/microduck_rl`, rama `main`, commit `9aaec6db4`) y un formato de despliegue estandarizado (`manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck). No se dispone de información sobre arquitectura interna de la red, número de parámetros, licencia ni idiomas, datos que se marcan como no disponibles a lo largo de esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo exportada a ONNX; topología interna de la red no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; ventana de observación de 61 dimensiones por paso de control |
| Tipos de cuantización | no disponible (se distribuye en ONNX, presumiblemente FP32; no se detalla) |
| Idiomas soportados | no disponible (no aplica: modelo de control robótico, sin interfaz de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck |
| Frecuencia de control | 50 Hz |
| Dimensiones de observación | 61 |
| Dimensiones de acción | 14 |
| Slot asignado | `walk` |
| Tamaño del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La información disponible describe la política por su interfaz, no por su topología: recibe un vector de observación de 61 valores y emite 14 acciones a 50 Hz, con el normalizador de observaciones integrado dentro de `policy.onnx`. Esto implica que el fichero ONNX contiene tanto la normalización como la red de política, y que el consumidor debe entregar observaciones sin procesar. No se especifica si la red es un perceptrón multicapa, una red recurrente o una arquitectura con memoria; tampoco se detallan capas, funciones de activación ni número de parámetros.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, rama `main`, commit `9aaec6db4`, según declara el autor en la model card. No se aportan datos sobre el número de pasos de simulación, el motor físico empleado, la composición del curriculum de recompensas, el uso de dominio aleatorizado ni el método de optimización (PPO u otro). La model card describe la política como «perpetua»: mantiene la marcha indefinidamente hasta recibir una orden de parada o cambio, lo que sugiere un condicionamiento por observación continua y no por un horizonte fijo de episodio. La única métrica de rendimiento publicada es que 4 de cada 5 recorridos se completan a 0,70 m/s.

## Capacidades

- Locomoción cuadrúpeda continua: genera una marcha estable para el robot microduck en el slot `walk`, con velocidad de referencia de 0,70 m/s según el autor.
- Control reactivo a 50 Hz: consume observaciones de 61 dimensiones y produce 14 acciones de actuador en cada ciclo de 20 ms.
- Ejecución perpetua: la política mantiene la marcha hasta que el sistema de control del robot la interrumpe o la sustituye por otra política del slot.
- Normalización integrada: acepta observaciones en bruto, sin necesidad de preprocesado externo en el lado del robot.
- Despliegue estandarizado: se carga mediante el comando `robotctl policy load walk SusanSS/microduck-walking-full` del daemon de microduck.
- Compatibilidad de manifiesto: `manifest.json` sigue el esquema 2 del manifiesto de políticas, lo que permite su gestión junto al resto de políticas del robot.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, visión, audio ni capacidades multilingües: no es un modelo de propósito general.

## Casos de uso

- Marcha básica en el robot microduck: cargar la política en el slot `walk` mediante `robotctl policy load` y usar el robot para desplazamientos sobre superficie plana a una velocidad de referencia de 0,70 m/s, aprovechando que la política está pensada para ejecución continua.
- Docencia y talleres de robótica con RL: emplear la política como ejemplo funcional de extremo a extremo (entrenamiento en `microduck_rl`, exportación a ONNX, despliegue en hardware) para ilustrar el ciclo completo de una política de locomoción.
- Base de comparación de políticas: al estar versionada con un commit concreto del repositorio de entrenamiento, sirve como referencia reproducible frente a otras variantes de marcha que se entrenen sobre la misma configuración.
- Sustitución o alternancia de políticas en el mismo robot: gracias al esquema de manifiesto y a la carga por slot, se puede intercambiar por otras políticas de `walk` sin reescribir el pipeline de control del daemon.
- Pruebas de integración del daemon: al tener un `manifest.json` conforme al esquema 2, es útil para validar el cargador de políticas, la gestión de slots y el flujo de comandos del daemon en entornos de desarrollo.
- Demostraciones de robótica de bajo coste: para divulgación o prototipos donde se necesita un cuadrúpedo pequeño que camine de forma autónoma sin infraestructura de cómputo dedicada, dado el tamaño reducido del artefacto.
- Evaluación de robustez de la marcha: repetir recorridos y medir la tasa de finalización, tomando como punto de partida la cifra declarada de 4 de cada 5 intentos a 0,70 m/s.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar en la información disponible. El único dato de evaluación aportado por el autor es una tasa de finalización de recorridos:

| Métrica | Resultado declarado | Condiciones |
|---|---|---|
| Tasa de finalización de recorrido | 4 de cada 5 intentos | Velocidad de 0,70 m/s; condiciones de evaluación no detalladas |
| Velocidad de marcha | 0,70 m/s | Valor de referencia indicado en la model card |
| Frecuencia de control | 50 Hz | Especificación de la interfaz de la política |
| MMLU, HumanEval, GSM8K u otros | no disponible | No aplica: no es un modelo de lenguaje |

No se especifican la superficie de prueba, la duración de cada recorrido, el criterio exacto de «finalización» ni la variabilidad entre ejecuciones, por lo que la cifra debe interpretarse como una indicación del autor y no como un resultado reproducible sin más datos.

## Requisitos de hardware

- VRAM estimada: no disponible. Con un repositorio de 0,0 GB y una interfaz de 61 entradas y 14 salidas, el artefacto es de tamaño muy reducido y la inferencia en CPU resulta plausible, pero no se publica el número de parámetros ni el coste computacional medido.
- GPU recomendadas: no disponible. No se requiere GPU para el despliegue descrito; el flujo documentado es la ejecución en el propio robot mediante `robotctl`.
- Compatibilidad con GPU de consumo: no confirmada explícitamente, aunque por el tamaño del artefacto no se espera que sea un requisito limitante.
- Opciones de despliegue: el daemon de microduck a través de `robotctl policy load walk SusanSS/microduck-walking-full`; el fichero `policy.onnx` es ejecutable con cualquier runtime compatible con ONNX (por ejemplo, onnxruntime), siempre que se respete el contrato de 61 observaciones en bruto y 14 acciones a 50 Hz.
- Latencia y throughput: no disponibles. El único requisito temporal conocido es el periodo de control de 20 ms impuesto por los 50 Hz.
- Almacenamiento: despreciable (repositorio de 0,0 GB).

## Comparativa con modelos similares

No se dispone de datos publicados de otras políticas de locomoción comparables en la información proporcionada (ni parámetros, ni contexto, ni métricas de rendimiento). La comparación solo puede establecerse a nivel de interfaz y formato:

| Modelo | Tipo | Observación / acción | Frecuencia | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `SusanSS/microduck-walking-full` | Política RL para microduck, slot `walk` | 61 / 14 | 50 Hz | ONNX + manifest esquema 2 | no disponible | HuggingFace, 0 descargas, 0 likes |
| Otras políticas del ecosistema microduck | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| Políticas de locomoción de otros cuadrúpedos | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia de licencia declarada: sin licencia explícita no puede asumirse permiso de uso comercial, redistribución ni modificación; es un bloqueo potencial para cualquier uso en producción.
- Trazabilidad de rendimiento limitada: la única métrica es «4 de 5 finalizaciones a 0,70 m/s», sin detallar superficie, duración, criterio de éxito ni número total de ensayos, por lo que la cifra no es verificable con la información disponible.
- Arquitectura y tamaño desconocidos: al no publicarse la topología ni el número de parámetros, no es posible estimar formalmente coste de inferencia, robustez o capacidad de generalización.
- Riesgo de fallo en condiciones no representadas: al ser una política entrenada en simulación (repositorio `microduck_rl`), es esperable una brecha simulación-real ante terrenos irregulares, pendientes, empujes o cambios de fricción; no se documenta el uso de dominio aleatorizado ni pruebas en hardware más allá de la tasa de finalización declarada.
- Comportamiento perpetuo: la política mantiene la marcha hasta recibir una orden contraria, lo que exige que la capa de control superior implemente parada, límites de seguridad y detección de caídas.
- Sin capacidades de lenguaje, visión ni tool calling: no puede emplearse en tareas cognitivas ni como interfaz conversacional; su ámbito es exclusivamente el control motor.
- Dependencia de la interfaz exacta: alterar el orden, la escala o la semántica de las 61 observaciones o de las 14 acciones invalida la política, ya que el normalizador está embebido en el ONNX.
- Repositorio con 0 descargas y 0 likes y creado/actualizado en 2026-10-27: sin evidencia de uso por terceros ni de mantenimiento posterior.
- Idiomas no aplicables: cualquier expectativa de soporte multilingüe es irrelevante para este artefacto.

## Enlaces

- HuggingFace: https://huggingface.co/SusanSS/microduck-walking-full
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento declarado en la model card: `pollen-robotics/microduck_rl`, rama `main`, commit `9aaec6db4` (no se proporciona URL directa en la información disponible)
- Documentación del manifiesto de políticas (`docs/policy-manifest.md` en el repositorio del daemon): no se proporciona URL directa en la información disponible
