# tfrere/microduck-move-base-sitstand

## Resumen

Microduck move base sitstand es una política de control robótico para el robot Microduck de Pollen Robotics, reentrenada desde cero por Microduck Academy. No es un modelo de lenguaje: es una política de aprendizaje por refuerzo que ejecuta una única habilidad de locomoción, sentarse y levantarse, y se publica como artefacto ONNX listo para desplegar en el robot.

El entrenamiento reproduce la receta original de Pollen Robotics tal cual, sobre la tarea `Mjlab-SitStand-Flat-MicroDuck` del repositorio `pollen-robotics/microduck_rl` en el commit `2b25a48`, con 5999 iteraciones y 4096 entornos en paralelo, sin modificar la función de recompensa. El objetivo del reentrenamiento es conservar el checkpoint `base/model.pt` que la Academy necesita para hacer *remix*, es decir, fine-tuning posterior de la política.

La relevancia del modelo es acotada pero clara dentro de su ecosistema: es un movimiento oficial de nivel 1 (`tier:1`) de la familia `sitstand`, con licencia Apache-2.0, que se carga en el robot con un solo comando y se controla mediante un flag de postura en el canal `twist.vx`. Las cifras de fidelidad publicadas lo sitúan muy cerca de la política que distribuye Pollen (`alpha_sitstand.onnx`), incluso con menor inclinación máxima.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo exportada a ONNX; checkpoint entrenado con la librería rsl_rl. Detalles de capas y tamaños no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política de control; el historial de observaciones lo define el entorno Mjlab) |
| Tipos de cuantización | no disponible (se distribuye un `policy.onnx` con el normalizador integrado) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`) y checkpoint PyTorch de rsl_rl (`base/model.pt`) |
| Tarea de entrenamiento | `Mjlab-SitStand-Flat-MicroDuck` |
| Repositorio de la receta | `pollen-robotics/microduck_rl`, commit `2b25a48` |
| Iteraciones de entrenamiento | 5999 |
| Entornos en paralelo | 4096 |
| Modificación de la recompensa | ninguna (receta original sin editar) |
| Canal de comando | `command.encoding: posture_flag` sobre `twist.vx` (1.0 = sentarse, 0.0 = levantarse) |
| Tamaño del repositorio | 0.0 GB (según la ficha de HuggingFace) |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-09-14 / 2026-09-14 |

## Arquitectura y entrenamiento

La ficha no detalla la topología de la red neuronal. Lo que sí se documenta es el procedimiento: la política se entrena con la receta de Pollen Robotics para la tarea `Mjlab-SitStand-Flat-MicroDuck` del repositorio `pollen-robotics/microduck_rl`, fijada en el commit `2b25a48`, ejecutando 5999 iteraciones sobre 4096 entornos paralelos y sin editar la función de recompensa. El resultado se guarda como checkpoint de rsl_rl (`base/model.pt`) acompañado de `base/agent.yaml` y `base/env.yaml`, que recogen la configuración del agente y del entorno respectivamente.

El artefacto de inferencia es `policy.onnx`, una exportación a ONNX con el normalizador de observaciones ya integrado, pensada para ejecutarse directamente en el robot. El modelo físico de referencia es el MJCF del robot Microduck, y los datos de fidelidad se registraron con `space/payload/render/rollout.py` sobre ese MJCF mediante `spikes/base_moves/fidelity.py`. No hay información publicada sobre número de tokens, composición de dataset ni técnicas de ajuste tipo RLHF o DPO, que en este dominio no aplican: el aprendizaje es puramente por refuerzo sobre simulación.

## Capacidades

- Locomoción de una sola habilidad: ejecutar la transición de sentarse y de levantarse con una única política.
- Control por bandera de postura: el comando se envía en el canal `twist.vx` con codificación `posture_flag`, donde 1.0 ordena sentarse y 0.0 ordena levantarse.
- Ejecución suave en ambos sentidos, según describe la model card.
- Finalización correcta de la maniobra: el indicador `final_upright` es `True` tanto en esta política como en la de Pollen.
- Inclinación máxima contenida: 0.265 rad en este move frente a 0.536 rad de la política de referencia.
- Integración con el daemon del robot: se carga en la ranura `sitstand` y el botón de sentarse/levantarse del daemon dirige el flag.
- Punto de partida para *remix*: el checkpoint `base/model.pt` permite fine-tuning posterior con la Academy.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, capacidades de agente ni soporte multilingüe: no es un modelo de lenguaje y la información disponible no documenta ninguna de esas funciones.

## Casos de uso

- Despliegue directo en un robot Microduck real: basta con ejecutar `robotctl policy load sitstand tfrere/microduck-move-base-sitstand` para dejar la política en la ranura `sitstand` y controlarla con el botón del daemon.
- Sustitución o comparación con la política oficial de Pollen: al resolver la misma tarea y el mismo comando, permite validar en el robot si el comportamiento propio es aceptable frente a `alpha_sitstand.onnx`.
- Fine-tuning de nuevas habilidades: el checkpoint `base/model.pt` junto con `base/agent.yaml` y `base/env.yaml` sirve como punto de partida para *remix* y entrenar variantes de la maniobra.
- Validación en simulación antes de tocar hardware: el MJCF del robot y el script de fidelidad permiten repetir el rollout y medir inclinación, alturas y tiempos sin riesgo físico.
- Reproducción de demostraciones y análisis de trayectorias: el archivo `rollouts/0.traj` incluye una toma de showcase con los comandos, útil para auditar el comportamiento paso a paso.
- Automatización de rutinas de postura en un banco de pruebas: el flag de postura permite disparar sentarse o levantarse desde lógica externa sin reentrenar nada.
- Docencia y experimentación en la Microduck Academy: al ser un movimiento oficial de nivel 1 de la familia `sitstand`, sirve como ejemplo de referencia para comparar recetas propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (el modelo no es un modelo de lenguaje y no aplican MMLU, HumanEval, GSM8K ni métricas equivalentes). Sí se publica una comprobación de fidelidad frente a la política de Pollen, registrada con el mismo escena, el mismo comando y la toma `flag`:

| Métrica | Este move | `alpha_sitstand.onnx` de Pollen |
|---|---|---|
| final_upright | True | True |
| max_tilt | 0.265 | 0.536 |
| base_z_mean | 0.0938 | 0.0911 |
| base_z_min | 0.0593 | 0.056 |
| z_stand | 0.1155 | 0.1107 |
| z_sit | 0.0597 | 0.0595 |
| z_stand_after | 0.1156 | 0.1159 |
| t_to_sit_s | 0.58 | 0.28 |
| t_to_rise_s | 0.24 | 0.26 |

Lectura de los datos: la altura final de pie es equivalente (0.1156 frente a 0.1159) y la altura sentado prácticamente idéntica (0.0597 frente a 0.0595), con una inclinación máxima notablemente menor en este move. El principal coste es el tiempo hasta sentarse, 0.58 s frente a 0.28 s de la política de Pollen; el tiempo hasta levantarse es ligeramente mejor, 0.24 s frente a 0.26 s.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio se declara con un tamaño de 0.0 GB, lo que indica un artefacto de pesos muy pequeño, pero la ficha no publica cifras de memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; dado que el artefacto de despliegue es un `policy.onnx` de política de control, es razonable esperar ejecución en CPU, pero no hay confirmación en la información proporcionada.
- Opciones de despliegue: `robotctl policy load sitstand tfrere/microduck-move-base-sitstand` en el robot; el archivo `policy.onnx` se puede ejecutar con un runtime ONNX. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Restricción de despliegue relevante: `robotctl policy add` rechaza esta política; debe cargarse con `policy load` en la ranura `sitstand`.
- Latencia y throughput estimados: no disponible. Los únicos tiempos publicados son de la maniobra física (0.58 s para sentarse y 0.24 s para levantarse), no de cómputo.

## Comparativa con modelos similares

La alternativa directa es la política de referencia de Pollen Robotics, que resuelve exactamente la misma tarea y usa el mismo canal de comando.

| Modelo | Tarea | max_tilt | t_to_sit_s | t_to_rise_s | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| tfrere/microduck-move-base-sitstand | Sit and stand (`posture_flag`) | 0.265 | 0.58 | 0.24 | Apache-2.0 | ONNX + checkpoint rsl_rl en HuggingFace |
| pollen-robotics `alpha_sitstand.onnx` | Sit and stand (`posture_flag`) | 0.536 | 0.28 | 0.26 | Apache-2.0 (según la receta upstream) | ONNX en `pollen-robotics/microduck-policies` |
| Otros movimientos de la familia `sitstand` de la Academy | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de parámetros totales ni de contexto aplicables a ninguna de las dos políticas, por lo que la comparación se limita a comportamiento medido y a licencia y formato de distribución.

## Limitaciones y advertencias

- No es un modelo generativo: no hay riesgo de alucinación lingüística, pero sí riesgo de fallo de política cuando el estado del robot se sale de la distribución cubierta por el entrenamiento en simulación.
- Habilidad única y sin composición: la política solo ejecuta sentarse y levantarse, controlada por una bandera de postura; no acepta instrucciones en lenguaje natural ni otros comandos.
- Comportamiento más lento al sentarse: 0.58 s frente a 0.28 s de la política de Pollen, un factor a tener en cuenta en secuencias donde el tiempo de transición sea crítico.
- Incompatibilidad con `robotctl policy add`: la política debe cargarse con `policy load` en la ranura `sitstand`.
- Sin datos de robustez: no se publican resultados ante terreno irregular, perturbaciones externas, variaciones de carga ni desgaste del hardware real, ya que la fidelidad se midió en simulación sobre el MJCF del robot.
- Sesgos conocidos: no disponible. No se documenta ningún análisis de sesgo, y el concepto no aplica igual que en modelos de lenguaje.
- Idiomas soportados: no disponible, y en la práctica no aplica.
- Licencia: Apache-2.0, que permite uso comercial y modificación siempre que se mantengan los avisos de copyright y atribución. La tarea, el diseño de recompensa, el modelo del robot y la receta de entrenamiento son obra de Pollen Robotics, y este repositorio los redistribuye bajo la misma licencia.
- Adopción nula por el momento: 0 descargas y 0 likes, sin validación independiente de la comunidad.
- Fechas del repositorio: creado y actualizado el 2026-09-14 según los metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tfrere/microduck-move-base-sitstand
- Receta de entrenamiento upstream (Pollen Robotics): https://github.com/pollen-robotics/microduck_rl
- Políticas oficiales de Pollen Robotics: https://huggingface.co/pollen-robotics/microduck-policies
- Política de referencia `alpha_sitstand.onnx`: https://huggingface.co/pollen-robotics/microduck-policies/blob/main/alpha_sitstand.onnx
- Organización de Pollen Robotics en HuggingFace: https://huggingface.co/pollen-robotics
- Espacio de Microduck Academy: https://huggingface.co/spaces/tfrere/microduck
- Archivos incluidos en el repositorio: `policy.onnx`, `base/model.pt`, `base/agent.yaml`, `base/env.yaml`, `rollouts/0.traj`, `video.mp4`, `poster.jpg`, `manifest.json`, `fidelity.json`, `train.json`
- Papers, blogs o demos adicionales: no disponibles en la información proporcionada
