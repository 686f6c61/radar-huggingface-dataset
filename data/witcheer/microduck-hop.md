# witcheer/microduck-hop

## Resumen

Microduck-hop es una política de control por refuerzo (reinforcement learning) entrenada para el robot cuadrúpedo de código abierto Microduck de Pollen Robotics. El modelo resuelve una tarea concreta de locomoción: hacer que el robot salte en el sitio, es decir, que las cuatro patas y el tronco abandonen el suelo, aterrice de pie y repita el salto. Se distribuye como un archivo ONNX con la normalización de observaciones integrada y un manifiesto que sigue el esquema 2 del manifiesto de políticas de Microduck.

El modelo lo desarrolla el usuario witcheer y se apoya en el entorno de simulación `microduck_rl` de Pollen Robotics, concretamente en una variante de la tarea de caminar con holgura (backlash) a la que se le aplica un comando de velocidad cero y una función de recompensa que premia el despegue del suelo. La política opera a 50 Hz, con una observación de 61 dimensiones y 14 acciones, y ejecuta episodios de 6 segundos que terminan devolviendo al robot a una postura de pie.

Es relevante ahora por dos motivos. Primero, demuestra que una recompensa que no describe explícitamente un salto puede hacer emerger un comportamiento de salto completo a partir de una política de marcha preentrenada. Segundo, y más importante para quien vaya a desplegarlo, el propio autor advierte de que el modelo consume el par máximo del actuador en simulación (0,641 N·m), por encima del par de bloqueo del servo XL330 real (0,60 N·m a 6 V), de modo que un Microduck físico no podría ejecutar estos saltos tal como se ha entrenado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de reinforcement learning exportada a ONNX (red neuronal; topología interna no detallada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política episódica de 6,0 s a 50 Hz) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX, presumiblemente FP32) |
| Idiomas soportados | no aplica (control robótico, sin entrada de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` (esquema 2) |

Otros datos técnicos: dimensión de observación 61, dimensión de acción 14, frecuencia de control 50 Hz, duración de episodio 6,0 s. Tamaño del repositorio en HuggingFace: 0,0 GB (redondeado; el artefacto real es un ONNX de pocos megabytes).

## Arquitectura y entrenamiento

La política se entrenó con el framework de simulación de `microduck_rl` (rama `develop`, commit `53b8971b6`, con cambios locales sin commitear correspondientes al módulo de entorno `witcheer_velocity_hop2_env_cfg.py`). La tarea es `Mjlab-Velocity-Flat-Backlash-Hop2-MicroDuck`: el entorno de marcha con holgura, pero con comando de velocidad cero, sin empujones y con episodios de 8 s. Las dimensiones de observación y acción se mantienen en 61 y 14.

El entrenamiento partió de un warm start sobre la política walk-flat v2 (iteración 7.000), con ruido de acción elevado de 0,19 a 0,6, y se extendió hasta la iteración 10.000 con 4.096 entornos en paralelo y coeficiente de entropía 0,02. El coste fue de 66 minutos en una única RTX 5090 (1,33 s por iteración), con checkpoints cada 250 iteraciones. La innovación destacable está en el diseño de la recompensa: premia los pasos en los que ninguna parte del robot toca el suelo y el tronco está al menos 10 mm por encima de la altura de pie (+12), la altura del tronco con una pata en el aire (+6) y la velocidad vertical ascendente del tronco (+6); penaliza cada parte no podal en contacto con el suelo (-5 por parte y paso) y los aterrizajes duros (-0,1 por newton por encima de 20 N). Ninguna cláusula describe un salto: el salto emerge.

El autor documenta un fallo de diseño intermedio relevante: una primera versión que solo premiaba tener ambas plantas en el aire encontró un atajo, en el que el pato se agachaba, apoyaba el caparazón en el suelo en el 96 % de los pasos y levantaba los pies. La versión final usa un sensor de contacto sobre todos los cuerpos del robot. La selección del checkpoint se fijó antes de entrenar: 4 tomas de cada checkpoint guardado, con desempate por mediana del pico del tronco y luego por el más temprano. Ganó la iteración 9.750 (4 de 4, mediana de pico 169,2 mm).

## Capacidades

- Ejecución de una política de salto en el sitio para el Microduck: el robot despega del suelo, aterriza de pie y repite el ciclo durante el episodio de 6 s.
- Control a 50 Hz con observación de 61 dimensiones y 14 acciones articulares.
- Normalización de observaciones integrada en `policy.onnx`: se alimentan observaciones en crudo, sin preprocesado externo.
- Retorno autónomo a postura de pie al final del episodio.
- Integración con el daemon de Microduck mediante `robotctl policy add` y `robotctl robot do`.
- En simulación, 14 de 15 tomas de 6 s cumplen el criterio de éxito, con 372 vuelos totales (entre 18 y 30 por toma) y un vuelo máximo de 140 ms.
- No soporta tool calling, function calling, agentes, multilingüismo ni modalidades de texto, visión o audio: es exclusivamente una política motora.

## Casos de uso

- Investigación en aprendizaje por refuerzo: reproducir el experimento de recompensa emergente, en el que una función que no menciona el salto produce un salto completo, y analizar el atajo detectado en la primera versión de la recompensa.
- Docencia y divulgación en robótica: demostrar en simulación el ciclo completo de entrenamiento, selección de checkpoint con regla fijada a priori y validación con prueba estadística (Fisher exacto unilateral, p = 1,0e-7 frente a la política de marcha de partida).
- Desarrollo de entornos de simulación: reutilizar el módulo `witcheer_velocity_hop2_env_cfg.py` como plantilla para definir tareas con sensores de contacto de cuerpo completo y penalizaciones por aterrizaje duro.
- Pruebas de software del daemon de Microduck: validar el flujo `robotctl policy add` / `robotctl robot do` y el esquema 2 de manifiestos con una política real y ligera.
- Estudio de transferencia sim-a-real: usar el caso como ejemplo documentado de brecha de actuación, ya que el par requerido en simulación (0,641 N·m) supera el par de bloqueo del XL330 (0,60 N·m a 6 V), y experimentar con limitación de par o escalado de acciones para intentar el despliegue físico.
- Comparación de políticas de una misma escalera de habilidades: el autor publica políticas hermanas en `witcheer/microduck-*` y los registros de entrenamiento en el dataset `witcheer/microduck-skill-tree`, lo que permite analizar la progresión de habilidades.
- Generación de datos sintéticos de movimiento para análisis cinemático: los 372 vuelos registrados con picos de tronco de hasta 175,1 mm sirven como referencia de cotas alcanzables en simulación.

## Benchmarks y rendimiento

Los datos disponibles son evaluaciones en simulación con una regla congelada antes del entrenamiento: 15 tomas de 6 s por política, comando cero, sin empujones; una toma es exitosa si el pato realiza al menos 3 vuelos (ningún cuerpo en el suelo durante al menos 80 ms, tronco al menos 10 mm por encima de la altura de pie), no cae nunca y termina de pie a altura de referencia.

| Metrica | microduck-hop (iter. 9.750) | walk-flat v2 (politica de partida) |
|---|---|---|
| Tomas exitosas | 14 de 15 | 0 de 15 |
| Significacion (Fisher exacto unilateral) | p = 1,0e-7 | referencia |
| Vuelos totales (15 tomas) | 372 (18 a 30 por toma) | 0 |
| Vuelo mas largo | 140 ms | no aplica |
| Pico del tronco, mediana | 168,8 mm | 116,2 mm |
| Pico del tronco, maximo | 175,1 mm | no disponible |
| Altura de pie de referencia | 116,1 mm | 116,1 mm |
| Altura sobre la de pie, maxima | 59,0 mm | 0 mm |
| Par de actuador utilizado | 0,641 N·m (techo del simulador) | no disponible |

Selección de checkpoint (4 tomas por checkpoint): iteración 7.250, 0 de 4; 7.500, 2 de 4; 7.750, 1 de 4; desde la 8.000, entre 3 y 4 de 4; 9.750, 4 de 4 con mediana de pico de 169,2 mm. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; el artefacto es un ONNX de una política de 61 entradas y 14 salidas, desplegable en CPU o en GPU integrada. No se publica el número exacto de parámetros.
- GPU recomendadas: no se requiere GPU para inferencia; el entrenamiento documentado se hizo en una única RTX 5090.
- Cabe en cualquier GPU de consumo y en la mayoría de sistemas embebidos capaces de ejecutar ONNX Runtime; el cuello de botella es el robot, no el hardware de cómputo.
- Opciones de despliegue: ONNX Runtime (formato nativo), integración con el daemon de Microduck mediante `robotctl`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas motoras.
- Latencia y throughput: control a 50 Hz, es decir, 20 ms por paso de inferencia como máximo. Entrenamiento: 1,33 s por iteración con 4.096 entornos en una RTX 5090; 66 minutos para el tramo documentado.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Resultado en simulacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-hop (witcheer) | Politica RL de salto en el sitio | Mjlab, Microduck | 14 de 15 tomas | Apache-2.0 | HuggingFace |
| walk-flat v2 (Pollen Robotics) | Politica RL de marcha | Mjlab, Microduck | 0 de 15 tomas de salto | Apache-2.0 | Repositorio `microduck_rl` |
| Politicas hermanas `witcheer/microduck-*` | Politicas RL de otros niveles de la escalera de habilidades | Mjlab, Microduck | no disponible por nivel | Apache-2.0 (presumible) | HuggingFace |

No se dispone de datos de otros modelos comparables de terceros para esta tarea concreta (salto de un cuadrúpedo de 12 servos en simulación) en la información proporcionada.

## Limitaciones y advertencias

- Brecha de actuación crítica: todas las tomas alcanzan el techo de par del simulador (0,641 N·m), por encima del par de bloqueo del XL330 real (0,60 N·m a 6 V). Un Microduck físico no puede ejecutar estos saltos tal como se ha entrenado.
- Entrenado exclusivamente en simulación y no probado en un robot real.
- Una sola semilla de entrenamiento: no hay estimación de varianza entre semillas.
- Solo salto en el sitio: sin comando de avance, sin empujones y en suelo plano. No generaliza a otras condiciones.
- Política episódica de 6 s con retorno a postura de pie; no está pensada para ejecución continua indefinida.
- Sesgos conocidos: el autor documenta un modo de fallo por atajo de recompensa en una versión previa (apoyo del caparazón en el suelo); la versión publicada corrige el problema con un sensor de contacto de cuerpo completo, pero no se han auditado otros atajos.
- Riesgo de alucinación: no aplica (no es un modelo generativo de lenguaje). El riesgo equivalente es la explotación de la función de recompensa, parcialmente mitigada por la regla de evaluación congelada y las 15 tomas de prueba.
- Licencia Apache-2.0, compatible con uso comercial, pero el uso comercial en un robot físico requeriría resolver antes la limitación de par.
- La model card indica que el checkpoint se exportó desde un checkout con cambios sin commitear; la reproducibilidad exacta depende de reconstruir el módulo de entorno descrito.
- Idiomas: no aplica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/witcheer/microduck-hop
- Repositorio del robot Microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento `microduck_rl`: https://github.com/pollen-robotics/microduck_rl
- Dataset con los registros de entrenamiento de la escalera de habilidades: https://huggingface.co/datasets/witcheer/microduck-skill-tree
- Políticas hermanas: https://huggingface.co/witcheer/microduck-* (prefijo de repositorio)
- Esquema del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa)
