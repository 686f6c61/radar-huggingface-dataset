# suraj-phanindra/microduck-hill-hc1

## Resumen

microduck-hill-hc1 es una política de control para el robot microduck, publicada por el usuario suraj-phanindra en HuggingFace. No es un modelo de lenguaje ni un modelo multimodal: se trata de un fichero ONNX (`policy.onnx`) que implementa un gait o patrón de locomoción, descrito en la model card como una política "perpetua" que se ejecuta de forma continua hasta que se le indique lo contrario. Trabaja con observaciones de 61 dimensiones, produce 14 acciones y está pensada para ejecutarse a 50 Hz en el bucle de control del robot.

El modelo es un fine-tuning de [namenu/microduck-arena](https://huggingface.co/namenu/microduck-arena), un remix según el propio autor, obtenido mediante "elitist hill climb" sobre la puntuación de Arena. El punto de partida declarado es el checkpoint `strata-hill-he9`. El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl` (rama `main`, commit `6ff40704a`), lo que sitúa el trabajo dentro del ecosistema de código abierto de Pollen Robotics para el robot microduck.

Su relevancia es acotada pero específica: es un ejemplo de política de RL para robótica de bajo coste distribuida como ONNX listo para cargar en un slot del daemon del robot, sin necesidad de reentrenar. La model card no documenta número de parámetros, licencia, idiomas ni resultados de benchmarks, y el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que se trata de un artefacto sin validación externa conocida.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política de control entrenada con aprendizaje por refuerzo, distribuida como grafo ONNX) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; no hay ventana de contexto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`), acompañado de `manifest.json` según el esquema 2 del manifiesto de políticas de microduck |
| Dimensión de observación | 61 |
| Dimensión de acción | 14 |
| Frecuencia de control | 50 Hz |
| Modelo base | namenu/microduck-arena (relación: fine-tune) |
| Punto de partida del fine-tuning | strata-hill-he9 |
| Normalizador de observaciones | embebido en `policy.onnx` (se alimentan observaciones crudas) |
| Pipeline declarado | robotics |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-15 |

## Arquitectura y entrenamiento

La model card no describe la topología de red empleada (número de capas, tipo de capas, función de activación ni tamaño del espacio latente). Lo único documentado es la interfaz: 61 valores de observación de entrada, 14 valores de acción de salida y una frecuencia de operación de 50 Hz, coherente con un bucle de control de tiempo real. El normalizador de observaciones está integrado dentro del propio grafo ONNX, de modo que el consumidor debe entregar observaciones sin normalizar. La política se define como "perpetua": no incluye una condición de terminación propia y sigue emitiendo acciones hasta que el daemon la detiene o la sustituye.

El procedimiento de entrenamiento declarado es un "elitist hill climb" (escalada de colina elitista) sobre la puntuación de Arena, aplicado sobre el checkpoint `strata-hill-he9`. No se especifican el número de iteraciones, el tamaño de la población evaluada, la función de recompensa detallada, la composición del conjunto de entrenamiento ni si se empleó simulación, hardware real o ambos. Tampoco se documentan mecanismos como decodificación especulativa, atención lineal u otras innovaciones técnicas, que en cualquier caso no aplican a este tipo de política. El código de entrenamiento se referencia al repositorio `pollen-robotics/microduck_rl`, rama `main`, commit `6ff40704a`.

## Capacidades

- Generación de acciones de control continuas: produce 14 valores de acción a partir de 61 valores de observación, en cada ciclo de control.
- Locomoción continua ("perpetua"): mantiene un gait activo indefinidamente hasta que se le ordena lo contrario, sin terminación autónoma.
- Ejecución a 50 Hz: el diseño asume un bucle de control de tiempo real con un presupuesto de 20 ms por ciclo.
- Integración con el daemon del robot: se carga en un slot de política mediante el comando `sudo robotctl policy load <slot> suraj-phanindra/microduck-hill-hc1`.
- Autocontención en la normalización: el normalizador de observaciones está embebido en el ONNX, lo que simplifica la integración (entrada de observaciones crudas).
- Optimización orientada a una métrica: el entrenamiento se guio por la puntuación de Arena, lo que sugiere un ajuste específico al entorno de evaluación de dicha Arena.
- Capacidades no documentadas: no hay información sobre tool calling, function calling, razonamiento multi-paso, capacidades multilingües, visión, audio ni modos de "pensamiento", ya que no se trata de un modelo de lenguaje.

## Casos de uso

- Locomoción de un robot microduck físico: cargar la política en un slot del daemon y dejar que el robot ejecute el gait de forma continua durante sesiones de demostración o exhibición.
- Punto de partida para fine-tuning posterior: al ser un remix de microduck-arena entrenado sobre strata-hill-he9, sirve como inicialización para nuevas rondas de escalada de colina sobre la puntuación de Arena.
- Evaluación comparativa dentro de la Arena: usar la política como contrincante o referencia en la evaluación de otras políticas del mismo ecosistema.
- Docencia e investigación en RL para robótica: es un artefacto pequeño y autocontenido que ilustra un pipeline completo de entrenamiento (repo `microduck_rl`), exportación a ONNX y despliegue en hardware.
- Pruebas de integración del daemon `robotctl`: al seguir el esquema 2 del manifiesto de políticas, es útil para validar el mecanismo de carga de políticas en slots y el manejo del formato `manifest.json`.
- Reproducción de experimentos: el commit de entrenamiento documentado (`6ff40704a`) permite intentar reproducir o auditar el procedimiento, siempre que el resto del pipeline sea accesible.
- Benchmarking de runtimes ONNX en el robot: al ejecutarse a 50 Hz, puede emplearse para medir latencia real de distintos runtimes de inferencia sobre el hardware objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el entrenamiento optimiza la "Arena score" y que el modelo parte de `strata-hill-he9`, pero no se proporciona ninguna cifra numérica de puntuación, recompensa, tasa de éxito ni comparación cuantitativa con otras políticas.

| Benchmark | Resultado |
|---|---|
| Arena score | no disponible (métrica citada como objetivo de optimización, sin valor publicado) |
| MMLU, HumanEval, GSM8K u otros | no aplica (no es un modelo de lenguaje) |
| Métricas de locomoción (velocidad, estabilidad, consumo) | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio figura como 0.0 GB, lo que no permite estimar el tamaño real del fichero ONNX.
- GPU recomendadas: no disponibles. La model card no menciona GPU ni aceleradores; el despliegue documentado es en el propio robot a través del daemon.
- Viabilidad en GPU de consumo: no disponible, aunque por la interfaz (61 observaciones, 14 acciones) y el contexto de robot de bajo coste es plausible una ejecución en CPU, sin que esto esté confirmado en la documentación.
- Opciones de despliegue: la única vía documentada es `robotctl policy load <slot> suraj-phanindra/microduck-hill-hc1` sobre el daemon de microduck. Al ser un fichero ONNX, podría cargarse con cualquier runtime compatible con ONNX (por ejemplo ONNX Runtime), pero esto no está documentado por el autor.
- Latencia y throughput: no se publican cifras. La frecuencia de 50 Hz implica un presupuesto de 20 ms por ciclo de control en el bucle completo (observación, inferencia, actuación), aunque no se desglosa cuánto corresponde a la inferencia.
- Nota de integración: el normalizador de observaciones está embebido en `policy.onnx`, por lo que se deben entregar observaciones crudas; alimentar observaciones ya normalizadas produciría acciones incorrectas.

## Comparativa con modelos similares

| Modelo | Tipo | Observación / acción | Frecuencia | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| suraj-phanindra/microduck-hill-hc1 | Política RL en ONNX (fine-tune) | 61 / 14 | 50 Hz | no disponible | HuggingFace, 0 descargas | no disponible |
| namenu/microduck-arena (modelo base) | Política RL en ONNX | no disponible | no disponible | no disponible | HuggingFace (referenciado) | no disponible |
| strata-hill-he9 (punto de partida) | Política RL | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría (políticas de locomoción para microduck u otros robots de tamaño similar), por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia no declarada: la ausencia de licencia explícita impide determinar si el uso comercial está permitido; en la práctica, y a falta de aclaración del autor, debe asumirse que no hay autorización clara.
- Sin validación externa: 0 descargas y 0 "likes" en el momento de la consulta, y ningún resultado de rendimiento publicado.
- Riesgo de sobreajuste a la métrica: el entrenamiento por escalada de colina sobre una única puntuación de Arena puede sobreajustar al entorno de evaluación concreto y degradarse en condiciones distintas (otro terreno, desgaste del hardware, variaciones de calibración).
- Ausencia de datos de sim2real: la model card no documenta si el entrenamiento se realizó en simulación, en hardware real o en ambos, ni si se validó la transferencia.
- Política perpetua sin terminación: el modelo no decide cuándo parar; la parada depende del daemon. Esto exige mecanismos de seguridad externos (límites de par, parada de emergencia, supervisión) antes de cualquier uso con personas o en entornos no controlados.
- Especificidad de hardware: la política está diseñada para el robot microduck; no es reutilizable directamente en otra plataforma sin reentrenamiento.
- Sesgos conocidos: no disponibles. No hay análisis de sesgo ni de comportamiento en condiciones de borde.
- Limitaciones de idioma y contexto: no aplican, ya que el modelo no procesa texto ni mantiene contexto conversacional.
- Riesgo de alucinación: no aplica en el sentido habitual; el riesgo equivalente es la emisión de acciones erráticas o inestables ante observaciones fuera de distribución.
- Caveat de integración en producción: si se alimentan observaciones ya normalizadas, el resultado será incorrecto, dado que la normalización está embebida en el grafo ONNX.
- Artefacto de investigación: por el perfil del repositorio, conviene tratarlo como material experimental y no como componente validado para producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/suraj-phanindra/microduck-hill-hc1
- Modelo base: https://huggingface.co/namenu/microduck-arena
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL citado en la model card: `pollen-robotics/microduck_rl` (rama `main`, commit `6ff40704a`)
