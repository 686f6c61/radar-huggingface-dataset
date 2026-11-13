# suraj-phanindra/microduck-heist-ppo2-aifund

## Resumen

`microduck-heist-ppo2-aifund` es una política de control motor entrenada mediante aprendizaje por refuerzo (PPO, por sus siglas en inglés) para el robot cuadrúpedo de código abierto MicroDuck de Pollen Robotics. El modelo es un finetune de la referencia `pollen-robotics/microduck-sock-heist-6m-reference` y se distribuye como un artefacto ONNX listo para cargarse en un slot de política del daemon `robotctl`. No es un modelo de lenguaje: es una política de locomoción que mapea observaciones de 61 dimensiones (estado de sensores y articulaciones) a 14 acciones de control a 50 Hz.

El autor, `suraj-phanindra`, lo publica como una política "perpetua": una marcha que se ejecuta de forma continua hasta que se le indique lo contrario. El checkpoint corresponde al paso 2900 de un entrenamiento con semilla 2 sobre el entorno `Mjlab-SockHeist6m-MicroDuck`, usando `mjlab-microduck 0.1.0` (commit `1efd853be`) como base de simulación. La relevancia es acotada pero clara para la comunidad de robótica de bajo coste: demuestra un flujo completo de entrenamiento en simulación (MuJoCo/mjlab) y despliegue en hardware real mediante un formato de política estandarizado.

El repositorio es muy pequeño (0,0 GB según Hugging Face, probablemente por redondeo de un ONNX de pocos megabytes), no tiene descargas ni likes, y no declara licencia ni idiomas, lo que limita su uso en producción sin verificación adicional por parte del integrador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política neuronal para control motor (entrenada con PPO); topología de red no especificada |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; observación de 61 dimensiones) |
| Tipos de cuantización | no disponible (se distribuye en ONNX; normalizador de observaciones embebido) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` (esquema 2 del manifiesto de políticas de microduck) |

Parámetros adicionales relevantes:

| Parámetro | Valor |
|---|---|
| Frecuencia de control | 50 Hz |
| Dimensión de observación | 61 |
| Dimensión de acción | 14 |
| Modelo base | `pollen-robotics/microduck-sock-heist-6m-reference` |
| Relación con el base | finetune |
| Checkpoint | 2900 |
| Semilla | 2 |
| Entorno de entrenamiento | `Mjlab-SockHeist6m-MicroDuck` |
| Stack de simulación | `mjlab-microduck 0.1.0` (commit `1efd853be`) |
| Fecha de inicio de entrenamiento | 2026-11-12T22:08:00Z |
| Librería | `microduck` |
| Pipeline | `robotics` |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red (número de capas, anchura, tipo de activación ni si emplea memoria recurrente). Lo que sí se especifica es el marco de entrenamiento: aprendizaje por refuerzo con PPO sobre el entorno `Mjlab-SockHeist6m-MicroDuck`, un escenario de simulación construido con `mjlab-microduck 0.1.0` (basado en MuJoCo). El agente recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, lo que encaja con el espacio de control de un cuadrúpedo pequeño con articulaciones de cadera y pata.

El modelo parte del checkpoint de referencia `microduck-sock-heist-6m-reference` y se afina durante 2900 pasos con semilla 2. El resultado se exporta a ONNX con el normalizador de observaciones embebido en el propio grafo, de modo que el consumidor debe alimentar observaciones en crudo. El artefacto se acompaña de un `manifest.json` conforme al esquema 2 del manifiesto de políticas del daemon de microduck, lo que permite cargarlo directamente con `robotctl policy load <slot> <repo>`. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal, que no aplican a este tipo de política.

## Capacidades

- Locomoción continua ("perpetua") del robot MicroDuck: ejecuta una marcha que se mantiene activa hasta que se detiene o se sustituye la política.
- Control motor a 50 Hz con 14 acciones articulares a partir de 61 observaciones de estado.
- Normalización de observaciones integrada en el ONNX, lo que simplifica la integración en el daemon.
- Carga directa en hardware real mediante `robotctl policy load`, sin recompilación ni conversión intermedia.
- Compatibilidad declarada con el manifiesto de políticas esquema 2 del ecosistema microduck.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No se declaran capacidades de visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Demostración de locomoción en MicroDuck: cargar la política en un slot del daemon y ejecutar una marcha continua para validar el montaje mecánico y la calibración de sensores del robot.
- Pruebas de integración del pipeline `robotctl`: usar este artefacto como política de referencia para verificar que el daemon carga correctamente un ONNX con normalizador embebido y un manifiesto de esquema 2.
- Investigación en aprendizaje por refuerzo sim-a-real: servir como punto de partida para comparar el efecto de distintos checkpoints, semillas y entornos de simulación sobre la estabilidad de la marcha.
- Docencia y talleres de robótica: ejemplo reproducible de un flujo completo que va del entrenamiento PPO en mjlab al despliegue en un cuadrúpedo de bajo coste.
- Base para finetuning de tareas específicas: al ser un finetune del modelo de referencia, puede reutilizarse como inicialización para políticas derivadas (por ejemplo, variaciones de velocidad o terreno) dentro del mismo entorno `SockHeist6m`.
- Validación de exportación ONNX: comprobar en un banco de pruebas que el grafo exportado produce acciones coherentes antes de desplegarlo en el robot físico.
- Benchmark interno de controladores: comparar la marcha de esta política con la del modelo base y con otras políticas del ecosistema microduck bajo las mismas condiciones de simulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, tasa de éxito, velocidad de marcha, estabilidad ni comparaciones cuantitativas con el modelo base.

## Requisitos de hardware

- El modelo es una política de control de tamaño reducido (repositorio de 0,0 GB según Hugging Face, consistente con un ONNX de pocos megabytes); no requiere GPU dedicada para inferencia en tiempo real.
- Inferencia en CPU: viable a 50 Hz en hardware embebido moderno (Raspberry Pi 4/5, Jetson Nano o similar) o en el propio ordenador que ejecuta el daemon `robotctl`, aunque no se especifican latencias medidas.
- GPU: no necesaria para el despliegue; cualquier GPU (RTX 4090, A100, H100) sobra para esta carga, pero no aporta ventaja práctica frente a CPU en un lazo de control de 50 Hz.
- Cabe en cualquier GPU de consumo e incluso en aceleradores de borde; el cuello de botella real es la latencia del bus de comunicación con los servos del robot, no el cómputo de la red.
- Opciones de despliegue: el runtime nativo es el daemon `microduck` con `robotctl`; el formato ONNX permite además ejecución con ONNX Runtime en otros entornos, siempre que se respete el contrato de observaciones en crudo.
- Throughput y latencia: no disponibles. El requisito funcional es sostener 50 Hz de forma estable.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / observación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `suraj-phanindra/microduck-heist-ppo2-aifund` | Política RL (PPO) para MicroDuck | no disponible | 61-D obs, 14 acciones, 50 Hz | no disponible | Hugging Face, ONNX |
| `pollen-robotics/microduck-sock-heist-6m-reference` | Política RL de referencia para MicroDuck | no disponible | Entorno SockHeist6m | no disponible | Hugging Face |
| Otras políticas del ecosistema microduck | Políticas RL para el mismo robot | no disponible | Variables según tarea | no disponible | Hugging Face |

La comparación cuantitativa con el modelo base no es posible con la información disponible: no se publican métricas de rendimiento de ninguno de los dos. La diferencia documentada es que este modelo es un finetune del de referencia, entrenado con semilla 2 hasta el checkpoint 2900.

## Limitaciones y advertencias

- No se declara licencia: no puede asumirse uso comercial sin contactar con el autor.
- No hay métricas publicadas de rendimiento ni de robustez; se desconoce su comportamiento ante terrenos, cargas o perturbaciones distintas de las del entorno de entrenamiento.
- Es una política "perpetua": no incorpora lógica de parada ni de seguridad; el operador debe garantizar mecanismos externos de interrupción.
- Depende del contrato exacto de observación (61 dimensiones en un orden concreto) y de la versión del daemon y del manifiesto esquema 2; cambios en el firmware o en el robot pueden invalidarla.
- Entrenada en simulación: existe riesgo de brecha sim-a-real (dinámica de servos, fricción, latencias) no cuantificada.
- Sin descargas ni validación comunitaria: el artefacto no ha sido verificado por terceros.
- No aplica sesgo lingüístico ni alucinación en el sentido de los modelos de lenguaje, pero sí puede producir comportamientos erráticos fuera de la distribución de entrenamiento.
- No se especifican los datos de entrenamiento ni la composición del dataset de simulación más allá del nombre del entorno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/suraj-phanindra/microduck-heist-ppo2-aifund
- Modelo base: https://huggingface.co/pollen-robotics/microduck-sock-heist-6m-reference
- Repositorio del robot MicroDuck: https://github.com/pollen-robotics/microduck
