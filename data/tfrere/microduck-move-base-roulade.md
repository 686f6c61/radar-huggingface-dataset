# tfrere/microduck-move-base-roulade

## Resumen

Microduck-move-base-roulade es una política de control robótico (no un modelo de lenguaje) publicada por el usuario tfrere dentro del programa Microduck Academy. Se trata de una reproducción oficial del movimiento "roulade" de Pollen Robotics: una voltereta hacia delante de 1 segundo desde la posición de pie, encadenada con el levantamiento posterior para volver a quedar erguido. La política se ha reentrenado desde cero con la receta upstream sin modificaciones (tarea `Mjlab-Roulade-Flat-MicroDuck` del repositorio `pollen-robotics/microduck_rl`, commit `2b25a48`, 5999 iteraciones, 4096 entornos, sin edición de la función de recompensa).

El objetivo del artefacto es doble. Por un lado se distribuye `policy.onnx`, listo para ejecutarse en el robot con el normalizador ya incorporado. Por otro, el repositorio incluye el checkpoint `base/model.pt` junto con `base/agent.yaml` y `base/env.yaml`, lo que permite a los usuarios de la Academy hacer "remix", es decir, afinar la política desde ese punto de partida. La relevancia es acotada pero clara: es una pieza de una biblioteca de movimientos encadenables para un robot cuadrúpedo pequeño, con licencia Apache-2.0 y verificación de fidelidad frente a la política original de Pollen.

El repositorio reporta 0 descargas y 0 "likes" en el momento de la consulta, y un tamaño declarado de 0.0 GB, lo que es coherente con una política de red neuronal pequeña exportada a ONNX. No se publican datos de arquitectura interna de la red, número de parámetros ni requisitos de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; checkpoint de `rsl_rl` (librería de aprendizaje por refuerzo para robots) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (política de control; no procesa secuencias de texto) |
| Tipos de cuantizacion | No disponible (se distribuye una exportación ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | No aplica (política de control robótico; no procesa lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`, con normalizador incorporado) y checkpoint PyTorch de `rsl_rl` (`base/model.pt`) |

## Arquitectura y entrenamiento

La información publicada no detalla la topología de la red (capas, dimensiones, tipo de política). Lo que sí se documenta es el procedimiento de entrenamiento: se ha reutilizado la receta upstream de Pollen Robotics tal cual, sobre la tarea `Mjlab-Roulade-Flat-MicroDuck` del repositorio `pollen-robotics/microduck_rl` en el commit `2b25a48`, con 5999 iteraciones y 4096 entornos en paralelo, y sin ninguna modificación de la función de recompensa. El resultado se almacena como checkpoint de `rsl_rl` (`base/model.pt`, acompañado de `base/agent.yaml` y `base/env.yaml`), lo que indica una política entrenada con aprendizaje por refuerzo en simulación.

La verificación de fidelidad se realizó sobre el MJCF del robot upstream, con el script `space/payload/render/rollout.py` y `spikes/base_moves/fidelity.py`. El movimiento encadena la voltereta con el "stand" del robot: el daemon aplica `chain: true` durante 1 segundo y después cede el control al `alpha_stand.onnx` de `pollen-robotics/microduck-policies`. La política reentrenada, si se deja correr más allá de 1 segundo por su cuenta, vuelve a rodar y queda tumbada, a diferencia de la de Pollen, que se levanta.

## Capacidades

- Ejecución de una voltereta hacia delante de 1 segundo desde la posición de pie (movimiento "roulade").
- Encadenamiento con la ranura de levantamiento del robot (`chain: true`, 1 s) y posterior transición al movimiento de caminar base a los 3,5 s en la toma de demostración.
- Inferencia autocontenida en ONNX, con el normalizador de observaciones ya incorporado en `policy.onnx`.
- Reentrenamiento y "remix": el repositorio incluye el checkpoint `rsl_rl` y las configuraciones de agente y entorno para afinar la política.
- Registro de trayectoria de demostración (`rollouts/0.traj`, formato `trajectory.v1`) con los comandos empleados.
- Metadatos estructurados en `manifest.json` (esquema 2, bloque `academy` con origen, tarea y política de origen, datos de entrenamiento y cifras de fidelidad).
- No soporta tool calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión ni audio: es una política de control motor.

## Casos de uso

- Despliegue del movimiento en el robot real: mediante `robotctl policy add roulade tfrere/microduck-move-base-roulade` y `robotctl robot do roulade`, se instala la política y se ejecuta la voltereta en hardware.
- Encadenado en una secuencia de acrobacias: la política está pensada para integrarse en la ranura de "stand" del robot durante 1 segundo y ceder después el control, lo que permite construir rutinas de varios movimientos.
- Punto de partida para afinar ("remix"): investigadores y usuarios de la Academy pueden partir de `base/model.pt` con `base/agent.yaml` y `base/env.yaml` para especializar la voltereta a otras condiciones o recompensas.
- Evaluación comparativa de recetas de RL: la tabla de fidelidad incluida permite contrastar una reproducción de la receta de Pollen con la política original bajo la misma escena y el mismo comando.
- Docencia y reproducción de experimentos: al incluir la tarea, el commit exacto y el número de iteraciones y entornos, sirve como caso reproducible de entrenamiento con `rsl_rl`.
- Integración en simulador: el MJCF del robot y los scripts de rollout permiten validar el movimiento antes de transferirlo a hardware.
- Registro de demostraciones: la trayectoria `rollouts/0.traj` con los comandos asociados sirve para analizar el comportamiento del controlador o para reproducir la toma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no se trata de un modelo de lenguaje. El autor sí publica una comprobación de fidelidad frente a la política `roulade.onnx` de Pollen, con la misma escena, el mismo comando y la toma `roll`:

| Métrica | Esta política | `roulade.onnx` de Pollen |
|---|---|---|
| `final_upright` | False | True |
| `max_tilt` | 1.0 | 1.0 |
| `base_z_mean` | 0.0787 | 0.1103 |
| `base_z_min` | 0.0426 | 0.0475 |
| `cum_forward_pitch_deg` | 306.9 | 342.0 |
| `z_max` | 0.1548 | 0.1775 |
| `upright_at_1s` | True | True |
| `head_contact_ticks` | 29 | 32 |
| `body_contact_ticks` | 72 | 14 |

## Requisitos de hardware

- No se publican requisitos de hardware en la información disponible.
- El repositorio declara un tamaño de 0.0 GB y el artefacto de inferencia es un único `policy.onnx` con el normalizador incorporado, lo que sugiere una inferencia ligera, aunque este extremo no está confirmado por el autor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible, aunque el tamaño declarado del artefacto apunta a que sería viable en hardware modesto.
- Opciones de despliegue: el flujo documentado es `robotctl` (Pollen Robotics) sobre el robot; el formato ONNX permite ejecución con ONNX Runtime, si bien no se documenta explícitamente.
- Latencia y throughput: no disponible. El movimiento está diseñado para ejecutarse en una ventana de 1 segundo antes de ceder el control.

## Comparativa con modelos similares

| Modelo | Tipo | Licencia | Disponibilidad | Comportamiento documentado |
|---|---|---|---|---|
| `tfrere/microduck-move-base-roulade` | Política RL reentrenada (ONNX + checkpoint `rsl_rl`) | Apache-2.0 | HuggingFace (0 descargas) | `upright_at_1s: True`, `final_upright: False`; si se deja correr, vuelve a rodar y queda tumbada |
| `pollen-robotics/microduck-policies` → `roulade.onnx` | Política RL de referencia (ONNX) | No disponible en la información proporcionada | HuggingFace (Pollen Robotics) | `upright_at_1s: True`, `final_upright: True`; se levanta al continuar |
| `pollen-robotics/microduck-policies` → `alpha_stand.onnx` | Política RL de levantamiento (ONNX) | No disponible en la información proporcionada | HuggingFace (Pollen Robotics) | Se usa como ranura de "stand" tras la voltereta en la toma de demostración |

No se dispone de datos de parámetros ni de longitud de contexto para ninguno de los elementos comparados, dado que son políticas de control y no modelos de lenguaje.

## Limitaciones y advertencias

- El movimiento solo es válido durante aproximadamente 1 segundo: pasado ese punto, la política reentrenada vuelve a rodar y termina tumbada, a diferencia de la política de Pollen, que se levanta.
- `final_upright` es `False` en la comprobación de fidelidad, frente a `True` en la política original.
- La voltereta reentrenada no se recupera por sí sola: la demostración cede el control al `alpha_stand.onnx` de Pollen a 1 segundo, porque el levantamiento reentrenado se cae desde el estado posterior a la voltereta.
- Mayor contacto corporal con el suelo: 72 ticks de contacto del cuerpo frente a 14 en la política de Pollen, y un `max_tilt` de 1.0 en ambos casos.
- Menor recorrido de giro acumulado hacia delante (306,9° frente a 342,0°) y menor altura media y máxima de la base.
- No hay información sobre sesgos, alucinación o comportamiento fuera de distribución más allá de lo indicado; son categorías propias de modelos de lenguaje y no aplican directamente a una política de control.
- La licencia Apache-2.0 permite uso comercial, pero la tarea, el diseño de recompensa, el modelo del robot y la receta de entrenamiento son obra de Pollen Robotics y así debe atribuirse.
- Repositorio con 0 descargas y 0 "likes": validación externa prácticamente nula en el momento de la consulta.
- No se documentan requisitos de hardware, versiones de dependencias ni compatibilidad con otros robots distintos del Microduck.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tfrere/microduck-move-base-roulade
- Políticas de referencia de Pollen Robotics (incluye `roulade.onnx` y `alpha_stand.onnx`): https://huggingface.co/pollen-robotics/microduck-policies
- Repositorio de entrenamiento upstream: https://github.com/pollen-robotics/microduck_rl
- Organización de Pollen Robotics en HuggingFace: https://huggingface.co/pollen-robotics
- Espacio de Microduck Academy: https://huggingface.co/spaces/tfrere/microduck

Nota: los resultados de búsqueda web proporcionados corresponden a productos de Google Gemini y no guardan relación con este modelo, por lo que no se incluyen como enlaces relevantes.
