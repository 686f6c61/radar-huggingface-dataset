# suraj-phanindra/microduck-heist-ppo4-aifund

## Resumen

`microduck-heist-ppo4-aifund` es una política de control entrenada mediante aprendizaje por refuerzo (PPO) para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. El modelo no es un modelo de lenguaje: es un controlador de locomoción que recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, pensado para ejecutarse de forma continua ("perpetua") sobre el hardware real. Lo publica el usuario suraj-phanindra como un fine-tune de la política de referencia `pollen-robotics/microduck-sock-heist-6m-reference`.

La relevancia de esta ficha es acotada: se trata de un artefacto muy específico dentro del ecosistema microduck, con cero descargas y cero likes en el momento de la consulta, y un repositorio de 0.0 GB. El interés técnico reside en que ejemplifica el formato de despliegue de políticas del daemon microduck (`policy.onnx` con normalizador integrado y `manifest.json` conforme al esquema 2), más que en sus capacidades cognitivas, que no existen.

La información disponible es muy limitada: la model card solo documenta parámetros de entrenamiento (checkpoint 3800, semilla 2, base `mjlab-microduck 0.1.0`) y el procedimiento de carga en el robot. No hay datos sobre arquitectura de red, número de parámetros, licencia ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL para control robótico; red neuronal de política, topología no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (exportado a ONNX; el normalizador de observaciones está integrado en `policy.onnx`) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas microduck) |

Parámetros adicionales documentados:

| Parametro | Valor |
|---|---|
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Tarea de entrenamiento (`task_id`) | `Mjlab-SockHeist6m-MicroDuck` |
| Checkpoint | 3800 |
| Semilla | 2 |
| Base de entrenamiento | `mjlab-microduck 0.1.0 @ 1efd853be` |
| Inicio del entrenamiento | 2026-11-12T22:08:00Z |
| Modelo base | `pollen-robotics/microduck-sock-heist-6m-reference` (fine-tune) |
| Libreria | `microduck` |
| Pipeline | `robotics` |

## Arquitectura y entrenamiento

No se dispone de la arquitectura de red de la política: la model card no especifica número de capas, anchura, tipo de red (MLP, recurrente, etc.) ni número de parámetros. Lo que sí se documenta es el pipeline de entrenamiento: se trata de un fine-tune de la política de referencia `microduck-sock-heist-6m-reference`, entrenado con PPO (según el nombre del repositorio, `ppo4`) sobre la tarea `Mjlab-SockHeist6m-MicroDuck` usando `mjlab-microduck` versión 0.1.0 (commit `1efd853be`), con semilla 2 y checkpoint final 3800. El inicio del entrenamiento se registra el 2026-11-12 a las 22:08 UTC.

La innovación técnica destacable no está en el algoritmo sino en el empaquetado para despliegue: el normalizador de observaciones está "horneado" dentro de `policy.onnx`, de modo que el robot puede alimentar observaciones en bruto sin preprocesado externo. El `manifest.json` sigue el esquema 2 del manifiesto de políticas del daemon microduck (documentado en `docs/policy-manifest.md` del repositorio del daemon). La política se describe como "perpetua": se ejecuta de forma continua hasta que se le indique lo contrario, y se carga en una ranura (slot) de políticas del robot.

## Capacidades

- Locomoción continua del robot microduck: genera una marcha ("gait") que se ejecuta de forma indefinida hasta que se detiene o se sustituye la política.
- Control a 50 Hz con 14 acciones de salida y 61 dimensiones de observación.
- Ingesta de observaciones en bruto: el normalizador integrado en el ONNX elimina la necesidad de un pipeline de normalización en el host.
- Carga dinámica en el robot mediante el comando `robotctl policy load <slot> <repo>`, lo que permite intercambiar políticas en caliente.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling, capacidades de agente ni multilingüismo: es exclusivamente un controlador motor.

## Casos de uso

- Locomoción de referencia en microduck: cargar la política en una ranura del daemon y dejar que el robot camine de forma continua en pruebas de laboratorio; adecuada por su naturaleza "perpetua" y su frecuencia de control de 50 Hz.
- Evaluación comparativa de políticas: al ser un fine-tune de la política de referencia con checkpoint y semilla documentados, sirve como punto de comparación reproducible frente a otras políticas entrenadas sobre `Mjlab-SockHeist6m-MicroDuck`.
- Despliegue sim-to-real en hardware Pollen Robotics: el formato ONNX con normalizador integrado simplifica la transferencia desde el entrenamiento en `mjlab-microduck` al robot físico mediante `robotctl`.
- Docencia y experimentación en RL robótico: el repositorio ilustra el ciclo completo entrenamiento (PPO, mjlab) → exportación (ONNX) → manifiesto (esquema 2) → carga en robot, útil como plantilla para nuevos desarrollos.
- Pruebas de integración del daemon microduck: sirve para validar el cargador de políticas por ranuras y el cumplimiento del esquema 2 del manifiesto en entornos de CI del propio daemon.
- Base para nuevos fine-tunes: al estar publicado como fine-tune de la referencia, puede servir de punto de partida para ajustes posteriores sobre la misma tarea con otras semillas o checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, tasas de éxito de la tarea, estabilidad de la marcha ni comparaciones cuantitativas con la política de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser una política de control exportada a ONNX con observación de 61 dimensiones y 14 acciones, es previsible que el modelo sea muy pequeño, pero no se documenta el número de parámetros ni el tamaño del fichero (el repositorio figura como 0.0 GB).
- GPU recomendadas: no disponible. La inferencia de políticas de este tipo suele ejecutarse en CPU o en el cómputo embebido del robot; no se especifica.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el método documentado es el daemon microduck mediante `robotctl policy load <slot> suraj-phanindra/microduck-heist-ppo4-aifund`; el artefacto es un `policy.onnx`, por lo que es desplegable con cualquier runtime ONNX Runtime, aunque no se documenta explícitamente.
- Latencia y throughput: no disponibles; el único dato temporal es la frecuencia de control de 50 Hz (periodo de 20 ms por paso).

## Comparativa con modelos similares

| Modelo | Tipo | Observacion / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `suraj-phanindra/microduck-heist-ppo4-aifund` | Política RL (PPO), fine-tune | 61 / 14 | 50 Hz | no disponible | Hugging Face, 0 descargas |
| `pollen-robotics/microduck-sock-heist-6m-reference` | Política RL de referencia | no disponible en la informacion proporcionada | no disponible | no disponible | Hugging Face (modelo base) |

No se dispone de datos de rendimiento de ninguno de los dos modelos, por lo que la comparación se limita a la relación de fine-tune y a los metadatos de despliegue. No se identifican en la información proporcionada otras alternativas comparables.

## Limitaciones y advertencias

- Ausencia total de documentación sobre arquitectura, número de parámetros y licencia: no es posible evaluar el coste computacional ni las condiciones de uso comercial sin consultar al autor.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni validación por parte de la comunidad.
- Naturaleza "perpetua" de la política: se ejecuta indefinidamente hasta que se detiene o se reemplaza; en producción exige mecanismos externos de parada y supervisión.
- Especialización extrema: solo válida para la tarea `Mjlab-SockHeist6m-MicroDuck` sobre el robot microduck; no es transferible a otros robots ni a tareas cognitivas.
- Dependencia de la versión del daemon y del esquema 2 del manifiesto: cambios en el daemon o en el esquema pueden romper la carga de la política.
- Sin datos de sim-to-real: no se documenta la robustez de la marcha ante perturbaciones, terreno irregular o desgaste del hardware.
- Riesgo de alucinación: no aplica (no es un modelo generativo de lenguaje); el riesgo equivalente es la inestabilidad o el fallo de la marcha, no cuantificado.
- Sesgos: no disponibles; en robótica, el sesgo relevante sería el sobreamuestreo de condiciones de simulación concretas, no documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/suraj-phanindra/microduck-heist-ppo4-aifund
- Modelo base (referencia): https://huggingface.co/pollen-robotics/microduck-sock-heist-6m-reference
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
