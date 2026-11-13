# suraj-phanindra/microduck-heist-ppo1-aifund

## Resumen

MicroDuck Heist PPO1 AIFund es una política de control robótico entrenada mediante aprendizaje por refuerzo (PPO) para el robot cuadrúpedo MicroDuck de Pollen Robotics. No se trata de un modelo de lenguaje, sino de una política neuronal de locomoción exportada a ONNX que se carga directamente en el daemon del robot para ejecutar una marcha (gait) concreta. El modelo deriva por fine-tuning del checkpoint de referencia `pollen-robotics/microduck-sock-heist-6m-reference` y se distribuye bajo el identificador `suraj-phanindra/microduck-heist-ppo1-aifund`.

La política opera a 50 Hz con una observación de 61 dimensiones y un espacio de acción de 14 dimensiones, lo que corresponde al control de las articulaciones del MicroDuck. El entrenamiento se realizó con el entorno `Mjlab-SockHeist6m-MicroDuck` sobre la base `mjlab-microduck 0.1.0`, partiendo del checkpoint 999 y con semilla 1. La normalización de observaciones está integrada en el propio fichero `policy.onnx`, de modo que el robot puede alimentar observaciones en bruto sin preprocesado adicional.

Su relevancia es acotada y muy específica: es un artefacto de investigación en robótica con refuerzo, no un modelo de propósito general. El repositorio no contiene pesos en safetensors ni documentación sobre licencia o idiomas, y su tamaño es de 0,0 GB (probablemente un ONNX ligero), por lo que debe evaluarse como una política de control embebida y no como un modelo fundacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal de control (red para RL, detalles no disponibles); exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Modelo base | `pollen-robotics/microduck-sock-heist-6m-reference` (fine-tune) |
| Entorno de entrenamiento | `Mjlab-SockHeist6m-MicroDuck` |
| Checkpoint | 999 |
| Semilla | 1 |
| Base de software | `mjlab-microduck 0.1.0 @ 1efd853be` |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (número de capas, anchura, tipo de activaciones). Se sabe que es una política entrenada con PPO (Proximal Policy Optimization) en el entorno `Mjlab-SockHeist6m-MicroDuck`, un escenario de simulación construido sobre `mjlab-microduck 0.1.0`. El entrenamiento partió del checkpoint 999 con semilla 1, y el resultado es un fine-tune del modelo de referencia `microduck-sock-heist-6m-reference`, que actúa como punto de partida.

El artefacto final se exporta a ONNX e incluye la normalización de observaciones embebida en el grafo, lo que simplifica el despliegue: el daemon del robot alimenta observaciones en bruto de 61 dimensiones y recibe 14 acciones a 50 Hz. La política se describe como "perpetua", es decir, se ejecuta de forma continua hasta que se le indique lo contrario. No se dispone de información sobre el número de tokens, composición del dataset (en RL no aplica), ni sobre el uso de técnicas como RLHF o DPO, que no son pertinentes en este contexto.

## Capacidades

- Control de locomoción del robot cuadrúpedo MicroDuck mediante una marcha (gait) preentrenada.
- Ejecución continua ("perpetua") hasta recibir una orden de parada o cambio de política.
- Consumo de observaciones en bruto de 61 dimensiones con normalización integrada en el ONNX.
- Producción de 14 acciones de control a 50 Hz.
- Carga dinámica en el robot mediante `robotctl policy load <slot> <repo>`.
- Compatibilidad con el manifiesto de políticas schema 2 del daemon de MicroDuck.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es una política de control, no un modelo generativo.

## Casos de uso

- Investigación en aprendizaje por refuerzo para robótica: sirve como punto de partida o referencia para experimentos de locomoción con el MicroDuck, ya que deriva de un modelo de referencia y documenta checkpoint, semilla y base de software.
- Demostración de marcha en el robot físico: se carga en un slot de política con `robotctl policy load` y el robot ejecuta la gait de forma continua, útil para validar el hardware y el daemon.
- Evaluación de pipelines de simulación a realidad (sim2real): al estar entrenada en `Mjlab-SockHeist6m-MicroDuck` y exportada a ONNX con normalización embebida, permite comparar el comportamiento simulado con el real.
- Benchmarking de políticas de control: al ser un fine-tune de un modelo de referencia, puede usarse como baseline en comparaciones de rendimiento de locomoción.
- Desarrollo de infraestructura de despliegue: el formato `policy.onnx` + `manifest.json` (schema 2) sirve para probar el flujo de carga de políticas en el daemon de MicroDuck.
- Docencia y talleres de robótica con refuerzo: el modelo es ligero (repo de 0,0 GB) y se carga en un robot de bajo coste, lo que facilita prácticas de RL aplicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser una política de control de tamaño reducido (repo de 0,0 GB), es probable que quepa en memoria de un dispositivo embebido, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el despliegue previsto es en el propio robot MicroDuck, no en GPU de escritorio.
- Opciones de despliegue: ONNX Runtime (implícito por el formato `policy.onnx`) y el daemon de MicroDuck mediante `robotctl policy load`.
- Latencia y throughput: frecuencia de control de 50 Hz (periodo de 20 ms); no se dispone de medidas de latencia reales.

## Comparativa con modelos similares

| Modelo | Tipo | Observacion / accion | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| suraj-phanindra/microduck-heist-ppo1-aifund | Política RL (ONNX) | 61 / 14 | 50 Hz | no disponible | Hugging Face |
| pollen-robotics/microduck-sock-heist-6m-reference | Política RL (referencia) | no disponible | no disponible | no disponible | Hugging Face |
| Otras políticas de MicroDuck | Políticas RL | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes.
- La licencia no está disponible, por lo que no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- El modelo es un fine-tune de un checkpoint concreto (999, semilla 1) sobre una base de software específica (`mjlab-microduck 0.1.0 @ 1efd853be`); cambios en el entorno o en el robot pueden degradar el comportamiento.
- La política se describe como "perpetua": se ejecuta hasta que se le indique lo contrario, lo que exige mecanismos externos de parada segura.
- No hay información sobre sesgos, alucinación o limitaciones idiomáticas porque no aplican a una política de control; el riesgo principal es el fallo de locomoción o el comportamiento impredecible fuera de las condiciones de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay validación comunitaria ni evidencia de robustez en el mundo real.
- No se documentan los datos de entrenamiento, la arquitectura interna ni las métricas de éxito de la tarea, lo que dificulta la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/suraj-phanindra/microduck-heist-ppo1-aifund
- Modelo base: https://huggingface.co/pollen-robotics/microduck-sock-heist-6m-reference
- Repositorio MicroDuck: https://github.com/pollen-robotics/microduck
