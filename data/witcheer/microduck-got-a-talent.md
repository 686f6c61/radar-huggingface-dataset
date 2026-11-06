# witcheer/microduck-got-a-talent

## Resumen

`witcheer/microduck-got-a-talent` es una política de control motriz entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de bajo coste Microduck de Pollen Robotics. No se trata de un modelo de lenguaje ni de un modelo fundacional generativo: es una política neuronal que mapea observaciones proprioceptivas del robot a comandos de actuación, empaquetada en formato ONNX y distribuida a través del ecosistema `microduck` con un manifiesto de política (schema 2) que permite cargarla directamente en un slot del daemon `robotctl`.

La política implementa la tarea `Mjlab-GotATalent-MicroDuck`, una receta de entrenamiento publicada en el repositorio `microduck-challenges` de Pollen Robotics. Se entrenó en simulación con `mjlab-microduck 0.1.0` durante 3000 iteraciones con 4096 entornos paralelos, semilla 1, sobre una única GPU RTX 5090 y en aproximadamente una hora. El checkpoint final corresponde a la iteración 2000. La política es "perpetua": una vez cargada, ejecuta una marcha continua hasta que se le indique lo contrario.

Su relevancia es doble. Por un lado, demuestra el flujo completo de entrenamiento y despliegue de políticas de RL para robótica de bajo coste en hardware de consumo. Por otro, forma parte de un experimento de generación automática de comportamiento: según la model card, el fichero `timeline.json` de la performance fue escrito por un agente (Hermes Agent) a partir de una única frase en lenguaje natural. No se han publicado evaluaciones en hardware físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal de RL (arquitectura exacta no disponible; red feed-forward típica de políticas de locomoción en mjlab) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | No disponible; se distribuye en ONNX (normalizador de observaciones integrado en `policy.onnx`) |
| Idiomas soportados | No aplica |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

Especificaciones adicionales relevantes para el despliegue:

| Parametro | Valor |
|---|---|
| Dimensión de observación | 61 |
| Dimensión de acción | 14 |
| Frecuencia de control | 50 Hz |
| Tarea de entrenamiento | `Mjlab-GotATalent-MicroDuck` |
| Checkpoint | 2000 |
| Semilla | 1 |
| Iteraciones | 3001 (máx.), guardado cada 250 |
| Entornos paralelos | 4096 |
| Base de entrenamiento | `mjlab-microduck 0.1.0 @ 1efd853be` |
| Commit del repo de tareas | `4b675ebf4` |
| Hardware de entrenamiento | 1 × RTX 5090, ~1 hora |
| Tamaño del repo | 0.0 GB |
| Descargas / likes | 16 / 0 |

## Arquitectura y entrenamiento

La política se entrena con `mjlab`, un framework de RL basado en MuJoCo para simulación de robots, sobre el modelo `mjlab-microduck 0.1.0`. El agente recibe una observación de 61 dimensiones (estado proprioceptivo del cuadrúpedo) y emite 14 acciones a 50 Hz. El normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones en bruto sin preprocesar. La arquitectura concreta de la red (capas, activaciones, número de parámetros) no se detalla en la información disponible.

El entrenamiento sigue la receta de Pollen Robotics: 4096 entornos simulados en paralelo, 3000 iteraciones, semilla 1, con TensorBoard como logger y nombre de ejecución `talent`. La reproducibilidad no es bit a bit: el autor advierte explícitamente que volver a entrenar con el mismo código, `uv.lock`, comando y semilla produce una política comparable pero no idéntica, porque el RL sobre GPU no es determinista entre máquinas. No se menciona uso de RLHF, DPO ni datos supervisados; es RL puro en simulación. La política no se ha probado en un Microduck físico.

## Capacidades

- Locomoción continua ("perpetua") del Microduck: ejecuta una marcha cargada en un slot de política y se mantiene hasta recibir una orden de parada o reemplazo.
- Control a 50 Hz con observaciones proprioceptivas de 61 dimensiones y 14 acciones.
- Integración directa con el daemon `robotctl` mediante `manifest.json` (schema 2).
- Despliegue en formato ONNX con normalización de observaciones incluida, lo que simplifica la inferencia embebida.
- Reproducibilidad del pipeline de entrenamiento mediante el repositorio `microduck-challenges` y `uv`.
- Generación de la performance (`timeline.json`) a partir de una frase en lenguaje natural por parte de un agente externo (Hermes Agent), según la model card.
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües ni procesamiento de visión, audio o texto.

## Casos de uso

- **Demostración de locomoción en Microduck simulado**: cargar la política en el simulador `mjlab-microduck` para reproducir la marcha y validar el pipeline de observación-acción antes de transferir a hardware.
- **Despliegue en robot físico de bajo coste**: usar `sudo robotctl policy load <slot> witcheer/microduck-got-a-talent` para que el Microduck ejecute la marcha de forma continua en demostraciones o laboratorios docentes, siempre que se valide previamente la transferencia sim-a-real.
- **Punto de partida para fine-tuning o currículos de RL**: servir como política base o referencia en experimentos de `microduck-challenges`, comparando semillas y recetas sobre la tarea `Mjlab-GotATalent-MicroDuck`.
- **Benchmark de infraestructura de entrenamiento**: reproducir la receta (4096 entornos, 3000 iteraciones, ~1 hora en RTX 5090) para medir throughput de `mjlab` en distintas GPUs.
- **Investigación en generación automática de comportamiento**: estudiar el flujo en el que un agente (Hermes Agent) traduce una frase en lenguaje natural a una `timeline.json` ejecutable por la política.
- **Educación en robótica y RL**: usar el repositorio y la política como ejemplo completo y reproducible de entrenamiento con MuJoCo, desde la clonación del repo hasta el despliegue en el daemon.
- **Pruebas de integración del daemon `robotctl`**: validar la carga de manifiestos schema 2 y slots de política en pipelines de CI del ecosistema microduck.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, tasa de éxito, velocidad de marcha ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- **Entrenamiento**: una única RTX 5090, aproximadamente una hora para 3000 iteraciones con 4096 entornos. No se documentan requisitos para otras GPUs.
- **Inferencia**: al ser una política de 61→14 dimensiones en ONNX a 50 Hz, la carga computacional es mínima; debería ejecutarse en CPU del propio robot o en un SBC. No se especifican requisitos de VRAM ni latencias medidas.
- **GPU recomendadas para inferencia**: no disponible; por la naturaleza del modelo, no requiere GPU dedicada.
- **Compatibilidad con GPU de consumo**: irrelevante para inferencia; para entrenamiento se usó una RTX 5090.
- **Opciones de despliegue**: daemon `robotctl` de microduck (carga de política por slot); ONNX Runtime para inferencia directa; simulación con `mjlab-microduck`.
- **Latencia y throughput**: no disponibles; el lazo de control está fijado a 50 Hz (20 ms por paso).

## Comparativa con modelos similares

No se dispone de información sobre otras políticas publicadas para Microduck ni de métricas comparables. La comparación con políticas de locomoción de otros cuadrúpedos (p. ej., para Unitree o ANYmal) no es significativa por diferencias de morfología, observación y acción.

| Modelo | Robot | Observación / acción | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `witcheer/microduck-got-a-talent` | Microduck | 61 / 14 | 50 Hz | Apache-2.0 | Hugging Face, ONNX |
| Otras políticas microduck | Microduck | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **No probada en hardware real**: la model card indica explícitamente que solo se entrenó en simulación y que aún no se ha testado en un Microduck físico; la transferencia sim-a-real no está validada.
- **Reproducibilidad limitada**: el propio autor advierte que el RL sobre GPU no es bit-reproducible; mismos comandos y semilla producen pesos distintos.
- **Sin métricas publicadas**: no hay benchmarks, recompensas ni tasas de éxito que permitan evaluar objetivamente la calidad de la marcha.
- **Arquitectura no documentada**: se desconoce el número de parámetros y la topología de la red, lo que dificulta auditorías técnicas.
- **Sin soporte de lenguaje ni percepción**: no procesa texto, visión ni audio; no es apta para tareas cognitivas.
- **Riesgo en producción**: al ser una política perpetua sin validación física, su uso en entornos no controlados puede provocar comportamientos no deseados o daños al robot.
- **Licencia**: Apache-2.0 permite uso comercial, pero debe conservarse el aviso de licencia y no se ofrece garantía alguna.
- **Idiomas**: no aplica; la ficha de Hugging Face no declara idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/witcheer/microduck-got-a-talent
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio microduck_rl: https://github.com/pollen-robotics/microduck_rl
- Repositorio de tareas microduck-challenges: https://github.com/pollen-robotics/microduck-challenges
- Commit de entrenamiento: `4b675ebf4` en `microduck-challenges`
- Base de simulación: `mjlab-microduck 0.1.0 @ 1efd853be`
