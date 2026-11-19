# Superstar111/pi05-yam-sharpa-spoon-scoop-runA

## Resumen

π0.5 two-skill student, run A es un checkpoint de política vision-language-action (VLA) publicado por el usuario Superstar111 en Hugging Face, derivado del modelo base `pi05_base` de Physical Intelligence y entrenado con el framework openpi. El modelo está especializado en una tarea robótica concreta de dos habilidades secuenciales sobre un brazo YAM Ultra 2 equipado con una mano Sharpa Wave de 22 articulaciones (28 articulaciones en total): primero "pick up the spoon" (coger la cuchara) y después "scoop the beans" (servir las judías con la cuchara).

El entrenamiento se ha realizado exclusivamente en simulación mediante Isaac Lab, y según la model card el modelo no se ha ejecutado todavía en el robot real. El checkpoint parte del paso 5999 de la ronda anterior y continúa 3000 pasos adicionales incorporando 328 demostraciones de scoop reetiquetadas: el propio agarre del estudiante seguido del transporte y scoop del planificador. El objetivo es que la habilidad de scoop aprenda a partir de los agarres reales del estudiante y no solo de los del planificador.

Con 12,4 GB de repositorio, el artefacto incluye el checkpoint openpi completo, el código fuente de openpi en el commit de entrenamiento, el tokenizador, un script de servicio por websocket y un conjunto de verificación conocido (golden) para validar el despliegue. Es relevante para investigadores en manipulación robótica que quieran reproducir o auditar una política VLA de dos habilidades con datos de simulación y un pipeline de evaluación reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en π0.5 de Physical Intelligence; configuración openpi `pi05_maggie_2skill_hcw_nojit` |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica como contexto de texto; la política consume observaciones por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (prompts de instrucción en inglés: "pick up the spoon", "scoop the beans") |
| Licencia | no disponible (sujeta a los términos de openpi y del modelo base `pi05_base`) |
| Formato de pesos | Checkpoint openpi (`params/` + norm stats en `assets/local/main_hcw_nom_n300_rl1/`); bundle con `openpi_src.tar.gz` y `openpi_data.tar.gz` |

## Arquitectura y entrenamiento

El modelo es una política VLA derivada de `pi05_base` de Physical Intelligence, configurada en openpi como `pi05_maggie_2skill_hcw_nojit`. Consume tres vistas de cámara (cabeza, muñeca derecha y extremo de la mesa) a resolución 160×284×3 en uint8 tras una compresión JPEG de calidad 90, junto con el estado articular medido (28 ángulos en radianes) y el último comando aceptado (`observation/previous_command_rad`). Produce acciones de dimensión (10, 28) a 10 Hz: las seis columnas del brazo son offsets respecto al último objetivo aceptado y las 22 de la mano son absolutas.

El entrenamiento se realizó íntegramente en simulación con Isaac Lab. Run A continúa el checkpoint del paso 5999 de la ronda durante 3000 pasos adicionales sobre las demostraciones del planificador de la ronda más 328 scoops reetiquetados: se toma el agarre del propio estudiante y se le empalma el transporte y scoop del planificador, de modo que solo ese transporte y scoop entran en entrenamiento. La innovación metodológica es este reetiquetado (relabelling) que alinea la distribución de la habilidad de scoop con los agarres que el estudiante genera realmente, en lugar de depender solo de los del planificador. No se dispone de información sobre número total de tokens, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Manipulación robótica de dos habilidades secuenciales: "pick up the spoon" y "scoop the beans".
- Control de brazo de 6 grados de libertad (salidas como offsets respecto al último objetivo aceptado) y de mano de 22 articulaciones (salidas absolutas).
- Política de acción por imitación que genera 10 filas de acciones por consulta a 10 Hz.
- Consumo multimodal de tres cámaras simultáneas más estado propioceptivo y comando previo.
- Condicionamiento por prompt de texto corto en inglés para seleccionar la habilidad.
- Servicio por websocket mediante `scripts/serve_policy.py` de openpi, con script `serve_vla.sh` incluido.
- Verificación de despliegue mediante `golden.py` y `golden.npz` (consultas y respuestas grabadas de un servidor recién arrancado).
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento general, matemáticas, visión general ni audio; el modelo es específico de la tarea.

## Casos de uso

- Investigación en imitación robótica de dos habilidades: servir el checkpoint con `serve_vla.sh` para reproducir los resultados de simulación y comparar contra el checkpoint de run 1 y el control sin scoops reetiquetados.
- Evaluación de técnicas de relabelling: usar run A como referencia para estudiar cómo el reetiquetado de datos del planificador con agarres del estudiante afecta a la tasa de éxito en scoop.
- Auditoría de reproducibilidad: el bundle incluye el código fuente de openpi en el commit exacto, el tokenizador, listas sha256 y el golden check, lo que permite validar que un servidor nuevo produce las mismas respuestas.
- Desarrollo de pipelines de simulación a real: el modelo sirve como base para probar transferencia sim-to-real en un brazo YAM Ultra 2 con mano Sharpa Wave, aunque aún no se ha ejecutado en hardware real.
- Integración en stacks openpi: al ser un checkpoint openpi estándar, puede cargarse con las herramientas de openpi para experimentar con variantes de observación o de prompt.
- Estudio de montaje de hardware: la model card documenta el ajuste de 90 grados en la articulación 6 para el montaje girado, lo que sirve para probar la robustez del modelo ante cambios de calibración.
- Docencia y prototipado en robótica de manipulación: ejemplo completo de política VLA con datos de simulación, evaluación en escenas aleatorizadas y verificación de despliegue.

## Benchmarks y rendimiento

Resultados en simulación reportados en la model card (25 escenas de validación aleatorizadas y 10 layouts nominales):

| Condición | Filas ejecutadas por consulta | Run A | Run 1 (punto de partida) |
|---|---|---|---|
| 25 escenas aleatorizadas, muestra 1 | 2 | 14/25 | 7/25 |
| 25 escenas aleatorizadas, muestra 2 | 2 | 14/25 | 8/25 |
| 25 escenas aleatorizadas | 5 | 19/25 | no disponible |
| 10 layouts nominales | 2 | 4/10 | no disponible |
| 10 layouts nominales | 5 | 7/10 | no disponible |

La métrica es "sacar judías de la bandeja" (carried beans out of the tray). El control que continúa run 1 durante los mismos 3000 pasos sin los scoops reetiquetados está en evaluación según la model card; no se han publicado sus resultados. No hay benchmarks estándar (MMLU, HumanEval, GSM8K) ni comparación con otros modelos VLA en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 10 GB libres según la model card (requisito del script `serve_vla.sh`).
- GPU recomendada: NVIDIA con al menos 10 GB libres; la model card no especifica modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: probable en tarjetas con 10 GB o más de VRAM libre (por ejemplo, RTX 3080/4080/4090 en función de la memoria disponible), aunque no está confirmado explícitamente.
- Despliegue: openpi con `scripts/serve_policy.py` servido por websocket mediante `serve_vla.sh`; requiere `uv` y construye el entorno de openpi en la primera ejecución.
- Latencia y throughput: acciones a 10 Hz (10 filas de 28 dimensiones por consulta); no se publican cifras de latencia ni throughput del servidor.
- Almacenamiento: 12,4 GB de repositorio, más el espacio necesario para extraer `openpi_src.tar.gz` y `openpi_data.tar.gz`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 two-skill student run A (este) | no disponible | no disponible | Pick spoon + scoop beans (YAM Ultra 2 + Sharpa Wave) | no disponible | Hugging Face, 0 descargas |
| π0.5 base (`pi05_base`, Physical Intelligence) | no disponible | no disponible | VLA generalista base | sujeta a términos de openpi | openpi |
| Checkpoint run 1 de la misma ronda | no disponible | no disponible | Misma tarea, sin scoops reetiquetados | no disponible | Referenciado en la model card, no enlazado |
| Control sin relabelling (3000 pasos) | no disponible | no disponible | Misma tarea, en evaluación | no disponible | No disponible |

No se dispone de datos de parámetros, contexto ni benchmarks de los modelos comparables en la información proporcionada; la comparación se limita a la tarea y a la disponibilidad.

## Limitaciones y advertencias

- Entrenado exclusivamente en simulación (Isaac Lab); no se ha ejecutado en el robot real, por lo que el rendimiento sim-to-real es desconocido.
- Las tasas de éxito reportadas son moderadas: 14/25 a 2 filas por consulta y 19/25 a 5 filas en escenas aleatorizadas; 4/10 y 7/10 en layouts nominales.
- El control sin scoops reetiquetados está aún en evaluación, por lo que no puede atribuirse con certeza la mejora al relabelling.
- Licencia no disponible; el uso comercial queda sujeto a los términos de openpi y del modelo base `pi05_base`, que deben consultarse.
- El montaje de la mano afecta a la calibración: en el montaje girado, la articulación 6 lee 90 grados más y debe corregirse en `observation/state` y `observation/previous_command_rad`.
- Dependencia fuerte de las cámaras y del formato exacto de observación (tres vistas 160×284×3 tras JPEG de calidad 90); desviaciones en el pipeline de imagen pueden degradar el comportamiento.
- Los prompts están limitados a dos instrucciones en inglés; no se documenta soporte multilingüe.
- Riesgo de sobreajuste a la configuración concreta de simulación y a los layouts de validación descritos.
- Repositorio con 0 descargas y 0 likes: sin validación externa por parte de la comunidad.
- No hay información sobre sesgos, alucinación en el sentido de texto, ni límites de contexto de lenguaje, al ser un modelo de acción.

## Enlaces

- Hugging Face: https://huggingface.co/Superstar111/pi05-yam-sharpa-spoon-scoop-runA
- openpi (framework de entrenamiento y servicio): https://github.com/Physical-Intelligence/openpi
- Modelo base `pi05_base` de Physical Intelligence: referenciado en la model card a través de openpi (sin enlace directo en la información disponible)
- Isaac Lab (entorno de simulación): no disponible enlace en la información proporcionada
- Paper de π0.5: no disponible enlace en la información proporcionada
- Demo o blog del autor: no disponible
