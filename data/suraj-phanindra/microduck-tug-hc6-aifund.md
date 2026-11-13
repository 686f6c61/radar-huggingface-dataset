# suraj-phanindra/microduck-tug-hc6-aifund

## Resumen

`microduck-tug-hc6-aifund` es una política de control robótico para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. El modelo ha sido publicado por el usuario suraj-phanindra como un fine-tune del checkpoint `GinDuck/microduck-tug-titan-league`, obtenido mediante una pequeña perturbación de pesos seleccionada por búsqueda aleatoria y validada en combates del simulador Arena. No es un modelo de lenguaje: es una política de reinforcement learning empaquetada en formato ONNX que se carga directamente en un slot de política del daemon `robotctl`.

La tarea concreta que resuelve es el "tug" (juego de tirar), una política perpetua que se ejecuta de forma continua hasta que se le indica lo contrario, generando una marcha (gait) a 50 Hz a partir de observaciones de 61 dimensiones y produciendo 14 acciones de control. Su relevancia es acotada pero específica: demuestra el flujo de trabajo de remezcla y evaluación de políticas para el ecosistema microduck, un robot educativo y de investigación de bajo coste, y sirve como ejemplo de cómo se puede mejorar iterativamente una política base mediante búsqueda de perturbaciones y validación en simulador.

El repositorio tiene un tamaño de 0.0 GB (probablemente contiene solo el `policy.onnx` y el `manifest.json`), no registra descargas ni likes, y no declara licencia ni idiomas. La información técnica disponible es escasa y proviene casi exclusivamente de la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de política para control robótico (no disponible el detalle de capas); empaquetada en ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (formato ONNX, sin cuantizaciones declaradas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La arquitectura interna de la política no está documentada en la información disponible. Se sabe que es una política de reinforcement learning para el robot microduck, con un espacio de observación de 61 dimensiones y un espacio de acción de 14 dimensiones, ejecutada a 50 Hz. El modelo se distribuye como `policy.onnx` con el normalizador de observaciones integrado en el propio grafo, de modo que el robot debe alimentar observaciones en bruto. El `manifest.json` sigue el esquema 2 del manifiesto de políticas del daemon microduck (documentado en `docs/policy-manifest.md` del repositorio del daemon).

El entrenamiento se realizó sobre el repositorio `pollen-robotics/microduck_rl`, rama `main`, commit `5cee942d8`. El método descrito por el autor consiste en partir de la política `GinDuck/microduck-tug-titan-league` y aplicar una pequeña perturbación de pesos elegida mediante búsqueda aleatoria, validada en combates nuevos en el simulador Arena. La tabla de evaluación ("board table") se construyó con combates de rating provenientes de `jrubiosainz/microduck-tug-h7p1b-aa128e6e` (semillas 1, 2, 5) y `jrubiosainz/microduck-tug-cup2l1-c23b073f` (semillas 3, 4; su combate de semilla 3 coincide con `lphatnguyen/microduck-tug-of-war-v2`), subiendo las últimas acciones de cada combate por semilla. No se detallan números de tokens, composición del dataset, ni uso de RLHF/DPO (no aplica en este dominio).

## Capacidades

- Control locomotor del robot microduck para la tarea de "tug" (juego de tirar), con una política perpetua que se ejecuta de forma continua hasta que se detiene explícitamente.
- Generación de una marcha (gait) a 50 Hz a partir de observaciones de 61 dimensiones y emisión de 14 acciones de control.
- Carga directa en un slot de política del daemon mediante `robotctl policy load`.
- Normalización de observaciones integrada en el modelo ONNX: acepta observaciones en bruto sin preprocesado externo.
- Compatibilidad con el ecosistema de simulación Arena y con el manifiesto de políticas schema 2 de microduck.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo "thinking": no es un modelo de lenguaje.

## Casos de uso

- Investigación en locomoción de bajo coste: usar la política como línea base para estudiar marchas en el robot microduck y comparar con otras políticas del ecosistema en el simulador Arena.
- Remezcla y ajuste fino de políticas: servir como punto de partida para experimentos de perturbación de pesos y búsqueda aleatoria sobre la política `GinDuck/microduck-tug-titan-league`, replicando el método descrito por el autor.
- Docencia y talleres de reinforcement learning: cargar la política en un microduck físico o simulado para demostrar el ciclo completo de entrenamiento, validación y despliegue en robótica.
- Evaluación comparativa en torneos: inscribir la política en combates de la Arena para medir su rendimiento frente a otras políticas de tug y construir tablas de rating.
- Pruebas de integración del daemon `robotctl`: validar el flujo de carga de políticas, el manifiesto schema 2 y la ejecución a 50 Hz en un robot real.
- Prototipado de comportamiento perpetuo: emplear la política como ejemplo de control continuo sin condición de terminación, útil para estudiar estabilidad y deriva de la marcha en ejecuciones prolongadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una tabla de evaluación basada en combates del simulador Arena (semillas 1 a 5, con fuentes concretas), pero no se proporcionan cifras numéricas de rating, win rate ni métricas de rendimiento en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB y se desconoce el número de parámetros de la política.
- GPU recomendadas: no disponible. Al ser una política de control a 50 Hz empaquetada en ONNX, es plausible que se ejecute en CPU o en hardware embebido, pero no se confirma en la información disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: `robotctl policy load <slot> suraj-phanindra/microduck-tug-hc6-aifund` sobre el daemon microduck; el modelo ONNX puede ejecutarse con runtime ONNX estándar, aunque no se detalla en la información disponible.
- Latencia y throughput estimados: no disponible; la política está diseñada para operar a 50 Hz, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Tarea | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| suraj-phanindra/microduck-tug-hc6-aifund | Política RL (fine-tune) | GinDuck/microduck-tug-titan-league | Tug (microduck) | ONNX | no disponible | Hugging Face |
| GinDuck/microduck-tug-titan-league | Política RL (base) | no disponible | Tug (microduck) | no disponible | no disponible | Hugging Face |
| jrubiosainz/microduck-tug-h7p1b-aa128e6e | Política RL (evaluación) | no disponible | Tug (microduck) | no disponible | no disponible | Hugging Face |
| jrubiosainz/microduck-tug-cup2l1-c23b073f | Política RL (evaluación) | no disponible | Tug (microduck) | no disponible | no disponible | Hugging Face |

No se dispone de datos de parámetros, contexto ni rendimiento numérico de las alternativas en la información proporcionada.

## Limitaciones y advertencias

- La licencia no está declarada, por lo que no se puede confirmar si el uso comercial está permitido; es un riesgo relevante para producción.
- El modelo está entrenado específicamente para la tarea de tug en el robot microduck; no es transferible a otras tareas, morfologías o robots sin reentrenamiento.
- El método de mejora descrito (perturbación pequeña de pesos seleccionada por búsqueda aleatoria) sugiere una ganancia marginal sobre la política base; no hay métricas que cuantifiquen la mejora.
- El rendimiento se validó en el simulador Arena; no se documenta validación en hardware físico, lo que puede implicar una brecha sim-a-real (sim-to-real gap).
- No se documentan sesgos, riesgos de alucinación ni limitaciones de contexto o idioma porque no es un modelo de lenguaje.
- El repositorio no registra descargas ni likes y la documentación es mínima; la reproducibilidad depende del commit `5cee942d8` del repositorio `pollen-robotics/microduck_rl`.
- La fecha de creación indicada (2026-11-13) es futura respecto a la información habitual disponible; conviene verificar la vigencia del artefacto antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/suraj-phanindra/microduck-tug-hc6-aifund
- Modelo base: https://huggingface.co/GinDuck/microduck-tug-titan-league
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `main`, commit `5cee942d8`)
- Política de referencia para evaluación: https://huggingface.co/jrubiosainz/microduck-tug-h7p1b-aa128e6e
- Política de referencia para evaluación: https://huggingface.co/jrubiosainz/microduck-tug-cup2l1-c23b073f
- Política de referencia para evaluación: https://huggingface.co/lphatnguyen/microduck-tug-of-war-v2
