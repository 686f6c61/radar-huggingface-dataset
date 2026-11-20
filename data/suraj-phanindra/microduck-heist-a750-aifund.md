# suraj-phanindra/microduck-heist-a750-aifund

## Resumen

`suraj-phanindra/microduck-heist-a750-aifund` es un checkpoint de política de refuerzo (reinforcement learning) para el robot cuadrúpedo microduck de Pollen Robotics, no un modelo de lenguaje. Se trata del checkpoint 750 de una ejecución PPO denominada heistA, entrenada con la receta `Mjlab-SockHeist6m-MicroDuck` del repositorio `pollen-robotics/microduck_rl` con 4096 entornos paralelos. Es hermano de `heist-ppo1-aifund` (checkpoint 999) y se distribuye como un artefacto ONNX listo para cargarse en una ranura de política del demonio `robotctl`.

El modelo implementa una política "perpetua": genera una marcha continua que se ejecuta indefinidamente hasta que se le indique lo contrario. Trabaja con observaciones de 61 dimensiones y 14 acciones a 50 Hz, lo que lo sitúa en el ámbito del control locomotor de bajo nivel para robótica de patas. No es un modelo generativo de texto ni procesa lenguaje natural; su relevancia radica en ser un ejemplo reproducible de entrenamiento PPO masivamente paralelo con Mjlab y despliegue directo en hardware real mediante un manifiesto estandarizado.

El repositorio es de tamaño prácticamente nulo (0,0 GB) y no registra descargas ni interacciones, lo que sugiere un artefacto experimental o de investigación más que un modelo de producción. La información pública disponible es muy limitada: no hay licencia declarada, no se especifican idiomas y no se publican benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de reinforcement learning (PPO) exportada a ONNX; red neuronal de control locomotor |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (artefacto ONNX, sin variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` con esquema 2 del manifiesto de políticas de microduck |

## Arquitectura y entrenamiento

La política se entrena con PPO (Proximal Policy Optimization) sobre Mjlab, un entorno de simulación física basado en MuJoCo, usando la receta `Mjlab-SockHeist6m-MicroDuck` con 4096 entornos en paralelo. El resultado es una red neuronal que mapea observaciones de 61 dimensiones a 14 acciones de control a 50 Hz. El checkpoint 750 corresponde a la iteración 750 de la ejecución heistA, mientras que el checkpoint 999 de la misma familia es `heist-ppo1-aifund`.

Un detalle técnico relevante es que el normalizador de observaciones está integrado dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones en bruto sin preprocesar. El entrenamiento se realizó desde el repositorio `pollen-robotics/microduck_rl`, rama `main`, commit `5cee942d8`. No se dispone de información sobre el número total de pasos de entrenamiento, la composición del dataset de recompensas ni si hubo ajuste fino posterior.

## Capacidades

- Control locomotor continuo de un robot cuadrúpedo microduck a 50 Hz.
- Política perpetua: mantiene la marcha de forma indefinida hasta recibir una orden de parada o cambio.
- Consumo de observaciones en bruto de 61 dimensiones con normalización interna.
- Emisión de 14 acciones de control por paso.
- Carga directa en una ranura de política mediante `robotctl policy load`.
- Compatibilidad con el manifiesto de políticas de microduck (esquema 2).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.

## Casos de uso

- Investigación en aprendizaje por refuerzo: sirve como punto de partida reproducible para comparar checkpoints de la misma ejecución (750 frente a 999) y analizar la evolución de la política durante el entrenamiento.
- Demostración de locomoción en microduck: permite cargar una marcha funcional en el robot físico con un solo comando, útil para validar el pipeline `robotctl` y el manifiesto de políticas.
- Evaluación de sim-to-real: al haber sido entrenado en Mjlab con 4096 entornos, es un candidato para medir la brecha entre simulación y hardware real en un cuadrúpedo de bajo coste.
- Docencia y talleres de robótica: un artefacto pequeño (0,0 GB) y de carga sencilla que ilustra el ciclo completo de entrenamiento PPO y despliegue en un robot.
- Base para ajuste fino: la política puede servir como inicialización para nuevas recetas de marcha o tareas de manipulación con patas.
- Pruebas de integración del demonio `robotctl`: valida la carga de políticas, el esquema de manifiesto 2 y la alimentación de observaciones en bruto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el artefacto es un ONNX de tamaño despreciable (repo de 0,0 GB), por lo que la inferencia cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no disponible; por el tamaño del artefacto, cualquier GPU moderna (RTX 4090, A100, H100) es sobredimensionada. La inferencia a 50 Hz es trivial para CPU.
- Cabe en GPU consumer: sí, con margen amplio; también en CPU y probablemente en el propio ordenador de a bordo del microduck.
- Opciones de despliegue: ONNX Runtime para el artefacto `policy.onnx`, y el demonio `robotctl` del stack de microduck para la carga en ranura de política.
- Latencia y throughput estimados: no disponible; el requisito de control es de 50 Hz (20 ms por paso), pero no se publican mediciones reales.

## Comparativa con modelos similares

| Modelo | Tipo | Observaciones / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-heist-a750-aifund | Política PPO (ONNX) | 61 / 14 | 50 Hz | no disponible | Hugging Face |
| heist-ppo1-aifund (checkpoint 999) | Política PPO (ONNX) | 61 / 14 | 50 Hz | no disponible | Hugging Face (misma familia) |
| Otras políticas de microduck | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación directa documentada es con `heist-ppo1-aifund`, el checkpoint 999 de la misma ejecución heistA, que comparte receta, observaciones y acciones. No se dispone de información sobre otras políticas comparables de microduck ni de benchmarks que permitan contrastar rendimiento.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no procesa lenguaje natural; cualquier uso fuera del control locomotor es inadecuado.
- Ausencia de licencia declarada: no se puede asumir permiso para uso comercial ni redistribución; conviene contactar con el autor antes de usarlo en producción.
- Sin benchmarks publicados: no hay evidencia cuantitativa de robustez, tasa de éxito o estabilidad de la marcha.
- Riesgo de sim-to-real: entrenado en Mjlab con 4096 entornos, el comportamiento en hardware real puede degradarse por diferencias de dinámica, fricción o sensores.
- Política perpetua: ejecuta la marcha indefinidamente hasta que se le indique lo contrario, lo que exige un mecanismo de parada fiable en el despliegue.
- Dependencia del normalizador interno: alimentar observaciones preprocesadas o con distinta escala puede degradar o romper la política.
- Repositorio sin descargas ni interacciones: no hay evidencia de validación por parte de la comunidad.
- Sin información sobre sesgos, idiomas ni contexto: no aplica, pero tampoco hay documentación sobre condiciones de fallo o límites operativos.

## Enlaces

- Hugging Face: https://huggingface.co/suraj-phanindra/microduck-heist-a750-aifund
- Repositorio de entrenamiento: https://github.com/pollen-robotics/microduck_rl
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del demonio (no se proporciona URL directa)
