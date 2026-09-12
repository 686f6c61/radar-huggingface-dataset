# symoon11/pi05-droid-jointpos-retimed-tempo

## Resumen
`symoon11/pi05-droid-jointpos-retimed-tempo` es un checkpoint de política robótica derivado de pi0.5 (pi-zero-five), un modelo vision-language-action (VLA) del ecosistema OpenPI. Lo publica el usuario symoon11 y adapta pi0.5 al conjunto de datos DROID para el control de un manipulador con siete articulaciones más pinza. Su particularidad es que, además de las posiciones de las articulaciones, predice tres canales de "tempo" que indican cuánto más rápido puede ejecutarse cada paso de la trayectoria.

El modelo comparte entradas con `pi05_droid_jointpos` (imagen exterior, imagen de muñeca, posición articular, posición de pinza y un prompt en lenguaje natural) y produce un *chunk* de acciones de forma `(15, 11)`: siete objetivos articulares absolutos, la orden de pinza y tres canales de tempo asociados a los relojes tau 0.9, 0.95 y 0.99. El "tempo" permite reescalar la velocidad de ejecución sin reentrenar, una innovación orientada a *retiming* de demostraciones.

Es relevante ahora por su enfoque en la velocidad de ejecución como variable aprendida, un problema poco tratado en políticas VLA habituales, y porque forma parte del ecosistema OpenPI/pi0.5. Conviene señalar que, según la propia model card, los pesos no estaban subidos en el momento de su publicación: se publicará automáticamente el checkpoint del paso 5.000 cuando el entrenamiento lo escriba.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en pi0.5, con *action expert*; no se detallan la columna vertebral ni el número de capas |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | no disponible (pesos aún no subidos; se distribuirá un *checkpoint* para `openpi`) |
| Horizonte de accion | 15 pasos (1/15 s por paso en el reloj canónico) |
| Entradas | `observation/exterior_image_1_left`, `observation/wrist_image_left`, `observation/joint_position` (q7, rad), `observation/gripper_position` (g1, [0,1], 0 = abierto), `prompt` (texto) |
| Salidas | Tensor `(15, 11)` float32: columnas 0–6 objetivos articulares absolutos (rad); columna 7 pinza (0 abierto, 1 cerrado); columnas 8–10 tempo para tau 0.9/0.95/0.99 |
| Marco de servicio | Servidor websocket de OpenPI (`serve_policy.py`, puerto 8000) y cliente `openpi_client` |

## Arquitectura y entrenamiento
El modelo se apoya en pi0.5, un VLA del ecosistema OpenPI que combina percepción visual y comprensión del prompt con la generación de acciones mediante un *action expert*. En este checkpoint, los objetivos articulares se entrenan como deltas respecto a `observation/joint_position` y las transformaciones de servicio los convierten en valores absolutos. La normalización se guarda en `assets/droid/norm_stats.json` (dimensiones 0–7 del `pi05_droid_jointpos` publicado y dimensiones 8–10 para el tempo) y la carga el servidor.

El entrenamiento parte del checkpoint publicado `pi05_droid_jointpos` y actualiza únicamente el *action expert*, con batch 256 y EMA 0.99, sobre DROID reajustado temporalmente ("retimed") en el reloj tau 0.5 del flujo wm-tempo. La innovación destacable son los tres canales de tempo: `tempo[k, c] = log(duración canónica del paso k / duración en el reloj c)`, de modo que el paso k ejecutado en el reloj c dura `exp(-tempo[k,c])/15` segundos y corre `exp(tempo[k,c])` veces más rápido que el chunk original. El reloj canónico corresponde al ritmo mediano del demostrador, con valores típicos de ×1.4 / ×1.5 / ×1.7 y percentil 99 de ×2.0 / ×2.4 / ×3.1; el tempo es 0 cuando el robot está en reposo (esperas, contacto de la pinza).

## Capacidades
- Generación de acciones de control para un manipulador de siete articulaciones más pinza.
- Percepción visual dual: procesa una imagen exterior y una imagen de muñeca.
- Seguimiento de instrucciones en lenguaje natural mediante `prompt`.
- Predicción de trayectorias con horizonte de 15 pasos a 15 Hz en el reloj canónico.
- Predicción de tempo por paso para tres relojes de velocidad (tau 0.9, 0.95, 0.99).
- *Retiming* de trayectorias: permite reescalar la velocidad de ejecución (resample) sin reentrenar.
- Ejecución por prefijos (*execute a prefix and re-query*), apta para control en bucle cerrado.
- No soporta *tool calling* ni *function calling*.
- No está diseñado para orquestación de agentes ni razonamiento multi-paso en lenguaje.
- Capacidad multilingüe limitada al inglés.
- No genera texto general: es una política VLA, no un LLM conversacional.

## Casos de uso
- Manipulación robótica sobre DROID: control de un brazo de siete articulaciones más pinza en tareas como "put the cup in the bin", recibiendo imágenes y el estado articular como observación.
- Ejecución con límite de velocidad: emplear la opción de *solver* con cota, donde el paso k se ejecuta como máximo a `exp(tempo[k,c])` veces su ritmo, útil para respetar límites dinámicos del hardware.
- *Retiming* de una política más lenta: ejecutar `actions[:, :8]` a 15 Hz para obtener la política de ritmo mediano (misma interfaz que `symoon11/pi05-droid-measured-jointpos-retimed`, con reloj más lento).
- Investigación en VLA y aprendizaje por imitación: comparar el impacto de predecir velocidad explícitamente frente a políticas sin canal de tempo.
- Evaluación de reproducción temporal: usar `tempo_chunk.resample_chunk` para colocar la polilínea articular en un reloj elegido y remuestrear a 15 Hz, midiendo fidelidad al ritmo del demostrador.
- Integración en pipelines de robótica vía websocket: desplegar el servidor OpenPI en un puerto y consultar desde un cliente Python con `WebsocketClientPolicy`.
- Teleoperación y control asistido: reconsultar la política por prefijos para adaptar la trayectoria en tiempo real durante una tarea.
- Estudio de la relación entre tempo y reposo: analizar los tramos donde tempo = 0 (esperas y contacto de pinza) para segmentar fases de la tarea.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente "no benchmark score yet". Los únicos datos cuantitativos disponibles son estadísticas de tempo:

| Metrica | tau 0.9 | tau 0.95 | tau 0.99 |
|---|---|---|---|
| Factor de velocidad típico | ×1.4 | ×1.5 | ×1.7 |
| Factor de velocidad (percentil 99) | ×2.0 | ×2.4 | ×3.1 |

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible (no se publican parámetros ni pesos).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Pesos: no disponibles en el momento de la publicación; el checkpoint del paso 5.000 se subirá automáticamente.
- Opciones de despliegue: servidor websocket de OpenPI (`examples/droid_umi/scripts/serve_policy.py`) con cliente `openpi_client`; requiere el fork de entrenamiento `github.com/symoon11/openpi` (rama `symoon11/droid-jointpos`). No aplican vLLM, llama.cpp, Ollama ni TGI, al tratarse de una política robótica y no de un LLM generativo.
- Latencia y throughput: no disponible.
- Configuración de servicio: `--policy.config pi05_droid_retimed_tempo --policy.dir ../ckpt --port 8000`.

## Comparativa con modelos similares

| Modelo | Tipo | Salida | Reloj / tempo | Pesos | Licencia |
|---|---|---|---|---|---|
| `symoon11/pi05-droid-jointpos-retimed-tempo` | pi0.5 VLA, *action expert* | `(15, 11)`: 7 articulaciones + pinza + 3 canales de tempo | Canónico (ritmo mediano) con tau 0.9/0.95/0.99 | No subidos aún | no disponible |
| `symoon11/pi05-droid-measured-jointpos-retimed` | pi0.5 VLA | Posiciones articulares (sin tempo) | Reloj más lento | no disponible | no disponible |
| `pi05_droid_jointpos` (publicado) | pi0.5 VLA | Posiciones articulares | — | Publicado | no disponible |
| Receta upstream `pi05_droid` | pi0.5 VLA | Velocidad articular (joint-velocity) | — | Publicado | no disponible |

Nota: la model card advierte que la receta upstream `pi05_droid` es de velocidad articular y no aplica a este checkpoint, que usa objetivos de posición articular con `DeltaActions`/`AbsoluteActions` y `make_bool_mask(7, -1)`, con recorte de salida `[:, :11]`.

## Limitaciones y advertencias
- Pesos no disponibles en el momento de la publicación: solo podrá descargarse cuando el entrenamiento escriba el paso 5.000 (`checkpoint_info.json` y `SHA256SUMS`).
- Sin resultados de benchmarks: "no benchmark score yet", por lo que no hay evidencia pública de rendimiento.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene verificar antes de cualquier despliegue en producción.
- Idioma limitado al inglés.
- Modelo específico de robótica y del conjunto DROID: no es reutilizable fuera de esa tarea o plataforma sin adaptación.
- Requiere el fork `symoon11/openpi` y registrar una configuración equivalente a `pi05_droid_retimed_tempo`; OpenPI upstream no soporta esta receta directamente.
- Dependencia de la normalización de `assets/droid/norm_stats.json` (dims 0–7 del `pi05_droid_jointpos` liberado y dims 8–10 de tempo); su ausencia o desajuste invalida la inferencia.
- Riesgo de alucinación no aplicable en el sentido de texto, pero la política puede generar trayectorias inválidas fuera de la distribución de DROID.
- Solo se ha entrenado el *action expert*; el resto del modelo queda congelado.
- 0 descargas y 0 *likes*: sin validación por parte de la comunidad.
- La interpretación del tempo exige respetar la convención de signos y relojes; un uso incorrecto produce velocidades de ejecución erróneas.

## Enlaces
- HuggingFace: https://huggingface.co/symoon11/pi05-droid-jointpos-retimed-tempo
- Fork de entrenamiento de OpenPI: https://github.com/symoon11/openpi (rama `symoon11/droid-jointpos`)
- Modelo relacionado mencionado: https://huggingface.co/symoon11/pi05-droid-measured-jointpos-retimed
- No se han encontrado papers, blogs ni demos adicionales en la búsqueda web proporcionada (los resultados devueltos no están relacionados con el modelo).
