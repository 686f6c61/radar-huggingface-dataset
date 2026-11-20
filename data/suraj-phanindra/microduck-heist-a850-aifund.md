# suraj-phanindra/microduck-heist-a850-aifund

## Resumen

`microduck-heist-a850-aifund` es un checkpoint de política de aprendizaje por refuerzo (PPO) para el robot cuadrúpedo MicroDuck de Pollen Robotics. No se trata de un modelo de lenguaje, sino de una política de control continuo que mapea una observación de 61 dimensiones a 14 acciones a 50 Hz, pensada para ejecutarse en el propio robot. El autor, suraj-phanindra, lo publica como artefacto derivado de la receta `Mjlab-SockHeist6m-MicroDuck` del repositorio `pollen-robotics/microduck_rl`, con 4096 entornos paralelos.

El modelo corresponde al checkpoint 850 de una ejecución denominada heistA, y se presenta como hermano de `heist-ppo1-aifund` (checkpoint 999). La política es de tipo "perpetuo": ejecuta una marcha (gait) de forma continua hasta que se le indique lo contrario, y se carga en una ranura (slot) del daemon del robot mediante `robotctl`. El artefacto se distribuye en formato ONNX con la normalización de observaciones incorporada en el propio grafo.

Por su naturaleza, este modelo es relevante para quienes trabajan con robótica de bajo coste y RL aplicado a locomoción de cuadrúpedos, no para tareas de NLP. El repositorio es de tamaño 0.0 GB, sin descargas ni likes, y la licencia no está declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de RL (PPO) para control robótico; topología de red no especificada |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (exportado en ONNX) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas microduck) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Entornos de entrenamiento | 4096 (PPO) |
| Checkpoint | 850 de la ejecución heistA |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red (número de capas, unidades ocultas ni tipo de extractor de características). Se sabe que es una política entrenada con PPO (Proximal Policy Optimization) sobre la receta `Mjlab-SockHeist6m-MicroDuck`, con 4096 entornos paralelos, lo que indica entrenamiento masivo en simulación con paralelización de entornos. El checkpoint publicado es el 850 de la ejecución heistA.

La innovación práctica destacable es la incorporación del normalizador de observaciones dentro del propio `policy.onnx`: el consumidor alimenta observaciones crudas y el grafo aplica la normalización internamente, eliminando errores de integración entre entrenamiento y despliegue. El `manifest.json` sigue el esquema 2 del manifiesto de políticas del daemon de microduck, lo que permite cargar la política directamente en una ranura del robot. No se especifican número de tokens (no aplica), composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Control de locomoción continua de un robot cuadrúpedo MicroDuck a 50 Hz.
- Política "perpetua": mantiene una marcha hasta recibir instrucción de parada o cambio.
- Mapeo directo de observación cruda (61-D) a acciones (14-D) con normalización integrada.
- Despliegue en el robot mediante `robotctl policy load <slot> ...`.
- Exportación ONNX lista para inferencia en el daemon del robot.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Locomoción autónoma del MicroDuck: cargar la política en una ranura y ejecutar una marcha continua para desplazamiento del cuadrúpedo en entornos simulados o reales.
- Investigación en RL aplicado a robótica: servir como checkpoint de referencia para comparar con `heist-ppo1-aifund` (checkpoint 999) y estudiar la evolución del entrenamiento PPO.
- Reproducción de experimentos: al estar vinculada a un commit concreto (`5cee942d8`) del repositorio `microduck_rl`, permite reproducir la receta de entrenamiento.
- Benchmarking de control: evaluar el rendimiento de la política a 50 Hz con 61-D de observación frente a otras políticas entrenadas en la misma receta.
- Integración en pipelines de simulación: usar el ONNX en entornos de simulación con 4096 entornos para validar generalización antes de desplegar en hardware.
- Demostraciones de robótica de bajo coste: aprovechar la compatibilidad con el daemon microduck para mostrar locomoción continua en prototipos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB y la topología de red no está especificada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ONNX Runtime (formato `policy.onnx`) y el daemon microduck mediante `robotctl policy load`.
- Latencia y throughput: no disponibles; la política opera a 50 Hz según la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| microduck-heist-a850-aifund | no disponible | no aplica | ONNX | no disponible | Checkpoint 850 de heistA |
| heist-ppo1-aifund | no disponible | no aplica | no disponible | no disponible | Checkpoint 999 de la misma familia; hermano declarado |
| Otras políticas microduck_rl | no disponible | no aplica | no disponible | no disponible | No se dispone de datos |

## Limitaciones y advertencias

- Licencia no declarada: no hay autorización explícita para uso comercial; conviene contactar al autor antes de utilizarlo en producción.
- Idiomas no aplicables, pero tampoco se documentan restricciones de uso geográfico o sectorial.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a otras políticas.
- Repositorio con 0 descargas y 0 likes: no hay validación comunitaria ni reportes de uso en hardware real.
- Dependencia del daemon microduck y del esquema 2 del manifiesto: cambios de esquema pueden romper la carga.
- Al ser una política de RL entrenada en simulación, puede sufrir la brecha sim-a-real (sim-to-real gap); no se documenta validación en robot físico.
- Riesgo de alucinación no aplica (no es un modelo generativo de texto), pero sí existe riesgo de comportamientos no deseados en locomoción fuera de distribución.
- No se especifican sesgos; en robótica, sesgos implican fallos de control ante observaciones atípicas.

## Enlaces

- Hugging Face: https://huggingface.co/suraj-phanindra/microduck-heist-a850-aifund
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl` (rama `main`, commit `5cee942d8`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon
