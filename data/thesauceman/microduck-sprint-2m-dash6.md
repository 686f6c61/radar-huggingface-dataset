# TheSauceman/microduck-sprint-2m-dash6

## Resumen

microduck-sprint-2m-dash6 es una política de control de locomoción entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck (Pollen Robotics). No es un modelo de lenguaje ni un modelo generativo de propósito general: es una política de gait («marcha») que se carga en una ranura de política del daemon del robot y se ejecuta de forma continua hasta que se le indique lo contrario. Recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, con el normalizador de observaciones integrado dentro del propio fichero `policy.onnx`.

El autor, TheSauceman, la presenta como una política «perpetua» de sprint en la que el robot trota a la velocidad más lenta de su repertorio, 0,20 m/s. Cada iteración de la serie relaja una restricción del entrenamiento anterior: primero las penalizaciones por oscilación del tronco y, en esta versión, la que impedía inclinarse hacia delante al correr, lo que según el autor mejora una métrica de tiempo de 1,21 a 1,17 s (la model card no especifica qué mide exactamente ese valor).

Su relevancia es acotada pero concreta: es un artefacto reproducible (código, `uv.lock`, comando y semilla documentados) para investigar sim2real y control de locomoción en un robot de bajo coste. El repositorio es de tamaño 0,0 GB, no tiene descargas ni «likes», no declara licencia ni idiomas, y no se han publicado resultados de benchmarks estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control entrenada por aprendizaje por refuerzo y exportada a ONNX; topología interna de la red no disponible |
| Parámetros totales | No disponible (tamaño del repositorio: 0,0 GB) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje); observación de 61 dimensiones por paso, a 50 Hz |
| Tipos de cuantización | No disponible; solo se publica el artefacto ONNX, sin variantes cuantizadas ni GGUF |
| Idiomas soportados | No aplica / no disponible |
| Licencia | No disponible (la model card no la declara) |
| Formato de pesos | ONNX (`policy.onnx`, con normalizador de observaciones embebido) + `manifest.json` (schema 2 del manifiesto de políticas de microduck) |
| Dimensiones de observación | 61 |
| Dimensiones de acción | 14 |
| Frecuencia de control | 50 Hz |
| Velocidad comandada | 0,20 m/s (la más lenta del repertorio de la serie) |
| Tarea de entrenamiento | `Mjlab-Sprint2m-MicroDuck` |
| Checkpoint / semilla | 2500 / 1 |

## Arquitectura y entrenamiento

Se trata de una política de control para locomoción de un cuadrúpedo, es decir, una función que mapea el estado del robot y el comando de velocidad a 14 consignas de actuación, evaluada a 50 Hz. El modelo se distribuye exclusivamente como grafo ONNX con el normalizador de observaciones incluido, de modo que la política consume observaciones en bruto sin preprocesado externo; esto elimina una fuente habitual de errores de integración entre simulación y robot. La model card no detalla el número de capas, el ancho de la red ni el número de parámetros, y el tamaño del repositorio (0,0 GB redondeado) sugiere un artefacto muy pequeño, pero no permite cuantificarlo.

El entrenamiento se realizó con el stack `mjlab-microduck 0.1.0` (commit base `8d0dbc94c`) sobre el repositorio `microduck-challenges`, rama `claude/project-thread-h4e0o0`, commit `1d048512e`. La configuración reportada es de 4096 entornos paralelos, 3000 iteraciones máximas del agente, semilla 1, registro en TensorBoard y nombre de ejecución `dash6`; el checkpoint publicado corresponde a la iteración 2500. El autor no indica el algoritmo de optimización ni el volumen total de muestras recolectadas. Sí advierte explícitamente de que el proceso no es reproducible bit a bit entre máquinas: repetir el comando con la misma semilla produce una política comparable, no idéntica. La innovación declarada es de diseño de recompensa, no de arquitectura: la eliminación progresiva de penalizaciones (primero la oscilación del tronco, después la restricción a inclinarse hacia delante) que, según el autor, llevó la métrica de 1,21 a 1,17 s.

## Capacidades

- Locomoción continua de tipo sprint/trote para el robot microduck, mantenida indefinidamente hasta recibir una orden de parada (política «perpetua», no episódica).
- Seguimiento de un comando de velocidad de 0,20 m/s, el más lento de la serie `sprint-2m`.
- Control a 50 Hz con 61 entradas de observación y 14 salidas de acción.
- Ingesta de observaciones en bruto gracias al normalizador embebido en el ONNX.
- Carga como política en una ranura del daemon del robot mediante `robotctl policy load <slot> ...`, lo que permite alternarla con otras marchas sin reentrenar.
- Reproducción del pipeline de entrenamiento con código, lockfile, comando y semilla documentados.
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo de razonamiento: es un controlador motor, no un modelo fundacional.

## Casos de uso

- Despliegue directo en robot físico: cargar la política en una ranura con `robotctl policy load <slot> TheSauceman/microduck-sprint-2m-dash6` para obtener una marcha estable a 0,20 m/s, adecuada para demostraciones y para tareas que requieren avance lento y controlado.
- Investigación sim2real: comparar el comportamiento del mismo grafo ONNX en MuJoCo (entorno de entrenamiento) y en el microduck real para medir la brecha de simulación a realidad en una política de baja velocidad, donde el deslizamiento y el ruido de sensores suelen ser menos críticos.
- Estudio de diseño de recompensa: usar esta política como punto de la ablación `dash6` frente a versiones anteriores de la serie para cuantificar el efecto de retirar penalizaciones de oscilación del tronco y de inclinación hacia delante.
- Referencia base para comparativas internas: al ser una política perpetua y de velocidad fija, sirve como línea base estable contra la que evaluar controladores propios (MPC, CPG o políticas RL nuevas) en métricas de estabilidad y seguimiento de consigna.
- Docencia y prototipado en robótica: ejemplo completo y reproducible de un pipeline de RL con 4096 entornos paralelos, manifiesto de política versionado y exportación a ONNX, útil en cursos o talleres sobre control aprendido.
- Integración en pruebas de regresión del daemon: el `manifest.json` sigue el schema 2, por lo que la política puede usarse como caso de prueba para validar la carga de políticas, el formateo del manifiesto y la compatibilidad hacia atrás del daemon.
- Evaluación de coste computacional en el borde: al ejecutarse como grafo ONNX de 61 entradas y 14 salidas a 50 Hz, permite medir el consumo de CPU del robot con un presupuesto de 20 ms por paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas internas de la tarea de entrenamiento, sin comparación con otros modelos:

| Métrica reportada | Valor | Contexto |
|---|---|---|
| Velocidad comandada | 0,20 m/s | La más lenta de la serie `sprint-2m` |
| Métrica de tiempo (no especificada por el autor) | 1,21 s → 1,17 s | Mejora atribuida a permitir la inclinación hacia delante |
| Frecuencia de control | 50 Hz | Presupuesto de 20 ms por paso |
| Checkpoint evaluado | 2500 | De un máximo de 3000 iteraciones |

## Requisitos de hardware

- Inferencia: un grafo ONNX de 61 entradas y 14 salidas a 50 Hz es despreciable en coste; se ejecuta en la CPU del propio robot con `onnxruntime`, sin necesidad de GPU ni VRAM dedicada (consumo muy por debajo de 1 GB, aunque el dato exacto no está publicado).
- Entrenamiento: 4096 entornos paralelos gestionados por `mjlab-microduck`, lo que requiere una GPU de tipo data center; el autor no especifica modelo de GPU, memoria ni tiempo total de entrenamiento.
- GPU consumer: no hay datos publicados sobre si el entrenamiento cabe en una RTX 4090 u otras tarjetas de consumo; la inferencia, en cambio, cabe en cualquier CPU moderna.
- Opciones de despliegue: daemon de microduck con `robotctl policy load <slot> <repo>` como vía oficial; alternativamente, cualquier runtime compatible con ONNX (onnxruntime en C++, Python o Rust) puede cargar `policy.onnx` respetando el orden de las 61 observaciones y las 14 acciones.
- Latencia y throughput: no se publican cifras medidas; la restricción de diseño es el presupuesto de 20 ms por paso impuesto por los 50 Hz.

## Comparativa con modelos similares

No se dispone de datos públicos de las otras políticas de la serie (`dash1` a `dash5`, u otras variantes del autor) ni de controladores alternativos para microduck, por lo que no es posible una comparación numérica rigurosa.

| Alternativa | Parámetros | Contexto / observación | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-sprint-2m-dash6 | No disponible | 61-D de observación, 14 acciones, 50 Hz | Sin benchmarks; 0,20 m/s declarados | No disponible | HuggingFace, 0 descargas |
| Versiones previas de la serie `sprint-2m` (dash1-dash5) | No disponible | Mismas dimensiones (misma interfaz) | No disponible | No disponible | No verificado en la información proporcionada |
| Controladores clásicos (MPC, CPG) para cuadrúpedos | No aplica | Depende de la implementación | No disponible para microduck | Variable | Fuera del alcance de esta ficha |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial ni para redistribución; conviene contactar con el autor antes de integrarla en un producto.
- No es un modelo de propósito general: no procesa lenguaje, imagen ni audio, y no admite instrucciones en texto; solo acepta observaciones numéricas de 61 dimensiones.
- Comportamiento especializado y frágil fuera de distribución: la política se ha entrenado para una velocidad comandada concreta (0,20 m/s) en el entorno de simulación de `mjlab-microduck`; no hay datos sobre su robustez ante empujes, terrenos irregulares, carga útil o fallos de sensores.
- Métrica de mejora ambigua: la model card cita una mejora de 1,21 a 1,17 s sin especificar qué mide ese tiempo, lo que impide evaluar su significado real.
- Sin validación externa: 0 descargas y 0 «likes» en el momento de la consulta, y ausencia de benchmarks o de vídeos verificables en la información disponible.
- Reproducibilidad limitada: el propio autor advierte de que el reentrenamiento no es bit a bit reproducible entre máquinas; los pesos publicados son el único artefacto exacto.
- Dependencia de la interfaz del daemon: el `manifest.json` sigue el schema 2 del manifiesto de políticas de microduck; cambios de esquema en el daemon pueden romper la carga.
- Fecha de creación registrada como 2026-10-17, posterior a la mayoría de referencias del ecosistema; conviene verificar la vigencia del repositorio antes de depender de él.
- La búsqueda web realizada no devolvió ninguna fuente técnica relevante sobre este modelo (solo resultados sin relación), por lo que no hay documentación externa que corroborre las afirmaciones de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TheSauceman/microduck-sprint-2m-dash6
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/SteveTarter/microduck-challenges
- Commit de entrenamiento: `1d048512e` en `microduck-challenges` (rama `claude/project-thread-h4e0o0`)
- Esquema del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck (URL exacta no disponible en la información proporcionada)
- Resultados de búsqueda web: sin fuentes relevantes sobre el modelo
