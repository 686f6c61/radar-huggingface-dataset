# tdesc/microduck-got-a-talent-sprint1

## Resumen

`got-a-talent-sprint1` es una política de control robótico episódica entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. El modelo recibe observaciones de 61 dimensiones y emite 14 acciones de control a una frecuencia de 50 Hz, ejecutando una rutina de 20 segundos tras la cual devuelve el robot a una pose de reposo estable. Se distribuye como un artefacto ONNX autocontenido con el normalizador de observaciones ya integrado en el grafo, de modo que el consumidor puede alimentar observaciones en crudo sin preprocesado adicional.

El modelo pertenece a la categoría de políticas de reinforcement learning para locomoción y control motor, no a la de modelos de lenguaje. Su relevancia radica en que sigue el manifiesto de políticas del daemon `robotctl` (schema 2), lo que permite desplegarlo en hardware real con dos comandos y sin infraestructura de inferencia adicional. Está publicado por el usuario `tdesc` bajo la librería `microduck` y el pipeline `robotics`.

La información pública disponible es muy limitada: el repositorio ocupa 0.0 GB, no registra descargas ni likes, no declara licencia ni idiomas, y la model card no incluye métricas de rendimiento, composición del dataset de entrenamiento ni detalles del algoritmo de RL empleado. Esta ficha documenta de forma rigurosa lo que sí está declarado y marca explícitamente como no disponible todo lo que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL exportada a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política episódica de 20.0 s a 50 Hz) |
| Tipos de cuantizacion | no disponible (artefacto ONNX, sin variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto microduck) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Duracion del episodio | 20.0 s |
| Libreria | microduck |
| Pipeline | robotics |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

La arquitectura interna de la red neuronal no está documentada en la model card: no se especifica si se trata de un MLP, una red recurrente o un transformer, ni el número de capas o parámetros. Lo que sí se declara es la interfaz: una política episódica que mapea observaciones de 61 dimensiones a 14 acciones a 50 Hz, con el normalizador de observaciones embebido en el propio `policy.onnx`, lo que elimina la necesidad de replicar la normalización en el lado del robot. El modelo se exporta junto a un `manifest.json` que cumple el schema 2 del manifiesto de políticas microduck, definido en `docs/policy-manifest.md` del repositorio del daemon.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, rama `main`, commit `7b2afcb94`, y el autor indica que la exportación se hizo desde un checkout con cambios sin confirmar, lo que introduce una discrepancia potencial entre el código publicado y el artefacto final. No se declara el número de pasos de entrenamiento, la composición del dataset, el algoritmo de RL (PPO, SAC u otro), ni si hubo fases de ajuste fino o recompensas diseñadas a medida. Tampoco se documenta ninguna innovación técnica adicional como decodificación especulativa o atención lineal, que por otra parte no aplican a este tipo de política.

## Capacidades

- Control locomotor episódico del robot microduck: ejecuta una rutina de 20.0 s y finaliza devolviendo el robot a una pose de reposo estable.
- Mapeo directo de observaciones de 61 dimensiones a 14 acciones de control a 50 Hz, con normalización integrada en el grafo ONNX.
- Despliegue en hardware real mediante el daemon `robotctl` con los comandos `policy add` y `robot do`.
- Compatibilidad con el schema 2 del manifiesto de políticas microduck, lo que facilita la integración con el ecosistema del daemon.
- Inferencia autocontenida en formato ONNX, sin dependencia de frameworks de RL en tiempo de ejecución.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes, capacidades multilingües ni modo de pensamiento: es una política de control motor y no un modelo de lenguaje.

## Casos de uso

- Demostración de locomoción en el robot microduck: la política ejecuta una rutina de 20 segundos y vuelve a una pose estable, lo que la hace adecuada para vídeos de presentación y validación del hardware en ferias o entornos docentes.
- Prueba de integración del daemon `robotctl`: al seguir el schema 2 del manifiesto, sirve como política de referencia para verificar que el pipeline de carga, normalización y ejecución del daemon funciona correctamente antes de desplegar políticas propias.
- Docencia en robótica y aprendizaje por refuerzo: permite a estudiantes observar el ciclo completo desde el entrenamiento en `microduck_rl` hasta la ejecución en hardware real, con una política ya exportada y lista para usar.
- Benchmark de referencia para políticas propias: al ser episódica y determinista en duración, puede usarse como línea base para comparar estabilidad, tiempo de retorno a reposo y suavidad de movimiento de nuevas políticas entrenadas por el equipo.
- Validación de hardware tras ensamblaje o reparación: ejecutar la rutina de 20 s permite comprobar que las 14 articulaciones responden, que los sensores de observación entregan las 61 dimensiones esperadas y que el robot recupera la pose de reposo sin fallos.
- Pruebas de regresión en CI de robótica: integrada en un banco de pruebas con el simulador o con hardware en bucle, la política puede ejecutarse automáticamente para detectar regresiones en el daemon o en el firmware del robot.
- Material de ejemplo para el ecosistema microduck: sirve como plantilla de estructura de repositorio (ONNX más manifiesto) para autores que quieran publicar sus propias políticas siguiendo la misma convención.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa media, tasa de éxito, error de seguimiento de trayectoria, suavidad de las acciones ni comparación con otras políticas del mismo robot.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB y la política se ejecuta en el propio robot o en el host del daemon, por lo que el requisito de memoria es previsiblemente mínimo, pero el autor no publica cifras.
- GPU recomendadas: no disponible; al ser una política de control a 50 Hz con observaciones de 61 dimensiones, la inferencia en CPU debería ser suficiente, aunque no se confirma en la documentación.
- Compatibilidad con GPU de consumo: no disponible; no se declara ningún requisito de aceleración por hardware.
- Opciones de despliegue: daemon `robotctl` del ecosistema microduck (comandos `sudo robotctl policy add got-a-talent-sprint1 tdesc/microduck-got-a-talent-sprint1` y `robotctl robot do got-a-talent-sprint1`); runtime ONNX estándar para consumo directo del `policy.onnx`.
- Latencia y throughput estimados: no disponible; el único dato temporal declarado es la frecuencia de control de 50 Hz y la duración del episodio de 20.0 s.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas del ecosistema microduck ni modelos comparables de la misma categoría (políticas de RL para cuadrúpedos de tamaño reducido) con los que establecer una comparación de parámetros, contexto, rendimiento, licencia y disponibilidad.

## Limitaciones y advertencias

- La licencia no está declarada, lo que impide determinar si el uso comercial está permitido; debe contactarse con el autor antes de cualquier despliegue productivo.
- El autor indica que la exportación se realizó desde un checkout con cambios sin confirmar sobre el commit `7b2afcb94`, por lo que el artefacto puede no ser reproducible a partir del código publicado.
- No se documenta la arquitectura de la red ni el algoritmo de RL, lo que dificulta la auditoría técnica y la depuración de comportamientos inesperados.
- Al ser una política episódica de 20.0 s diseñada para una rutina concreta, no debe esperarse generalización a otras tareas, terrenos o condiciones ambientales distintas de las del entrenamiento.
- No se declaran métricas de robustez ante perturbaciones, cambios de fricción, pendientes o fallos de sensores; el comportamiento fuera de las condiciones nominales es desconocido.
- No se especifican los sesgos del dataset de entrenamiento ni las condiciones de simulación utilizadas, lo que impide evaluar la brecha simulación-real.
- El repositorio no registra descargas ni likes y la documentación es mínima, por lo que no existe validación comunitaria del artefacto.
- No es un modelo de lenguaje: no admite prompts, tool calling ni razonamiento multi-paso; cualquier uso fuera del control motor del microduck queda fuera de su ámbito declarado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tdesc/microduck-got-a-talent-sprint1
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `main`, commit `7b2afcb94`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (referenciado en la model card, sin URL directa publicada)
