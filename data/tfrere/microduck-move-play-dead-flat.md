# tfrere/microduck-move-play-dead-flat

## Resumen

Microduck-move-play-dead-flat es una política motora ("move") del proyecto Microduck, entrenada por el usuario tfrere mediante la herramienta Microduck Academy. No es un modelo de lenguaje ni un modelo multimodal, sino un controlador de comportamiento que hace que un robot con forma de pato se desplome al suelo, permanezca completamente inmóvil y plano, y se mantenga en esa postura. El objetivo declarado es: "a duck that plays dead: it drops to the floor and lies there completely still, flat on the ground, and stays down".

La política pertenece a la familia `standup` (levantarse o aterrizar en una pose) y es de tipo episódico, es decir, se evalúa por episodios discretos de comportamiento. Se publica en dos formatos: `policy.onnx` para ejecución directa en el robot y `model.pt` para reentrenamiento o ajuste fino. El repositorio incluye además grabaciones de trayectorias (`rollouts/*.traj`, `checkpoints/r<round>-<iter>.traj`), un `manifest.json` con el prompt, la familia, el juez y el linaje, y un vídeo demostrativo con su póster.

La relevancia del artefacto es más metodológica que de rendimiento: documenta un ciclo de entrenamiento por rondas evaluado con dos criterios independientes, un juez automático basado en código que mide magnitudes físicas y un "eye" basado en un VLM que inspecciona los fotogramas. En la ronda final el juez da PASS con 0,966, pero el VLM no confirma el comportamiento ("not sure: spawned already down"), de modo que la puntuación mostrada en Discover queda limitada al 75 %. El repositorio registra 0 descargas y 0 likes, y un tamaño de 0,0 GB según HuggingFace.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (política neuronal exportada a ONNX; la model card no describe capas ni topología) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (política episódica de control motor, no es un modelo de lenguaje) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (política motora); no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`policy.onnx`), PyTorch (`model.pt`), trayectorias `.traj` (trajectory.v1) |
| Familia | `standup` (get up / land in a pose) |
| Tipo de comportamiento | `episodic` |
| Tier | 1 según la etiqueta del repositorio; la model card indica "tier None" (discrepancia sin resolver) |
| Pipeline declarado | No disponible |
| Tamaño del repositorio | 0,0 GB según HuggingFace |
| Descargas / likes | 0 / 0 |
| Fecha de creación y actualización | 2026-09-24 (ambas idénticas) |

## Arquitectura y entrenamiento

La información proporcionada no describe la arquitectura de la red: no se indican número de capas, dimensionalidad de las observaciones, tipo de espacio de acciones ni parámetros totales. Lo único verificable es el formato de salida: un grafo ONNX para inferencia y un checkpoint PyTorch para reentrenamiento. La model card remite a `docs/TRAINING.md` (sección 8) para el detalle del proceso de entrenamiento, pero ese documento no forma parte de la información disponible.

El entrenamiento se organizó en tres rondas, cada una con sus propios checkpoints registrados en `manifest.checkpoints`. Cada ronda se evaluó con dos mecanismos complementarios: un juez implementado en código que analiza magnitudes numéricas del episodio (altura, velocidad, desplazamiento, pitch, tilt, yaw, contacto de pies, elevación de pies, deriva de rumbo) y un revisor VLM ("eye") que inspecciona los fotogramas del vídeo. No se especifica si el entrenamiento empleó refuerzo, imitación, optimización directa de recompensa o una combinación; tampoco se documentan el número de tokens, la composición del dataset ni técnicas como RLHF o DPO, que en este dominio no serían de aplicación directa.

## Capacidades

- Ejecución de una habilidad motora concreta y única: desplomarse al suelo y permanecer tumbado, plano e inmóvil.
- Cumplimiento verificable de criterios físicos medidos por el juez: altura final de 0,0385 m (ratio 0,335 respecto a la altura de referencia), velocidad de 0,0 m/s, desplazamiento de 0,0 m/s, pitch de 1,6°, tilt máximo de 8,3°, yaw rate de 0,0 rps, deriva de rumbo de 0,001 rad, fracción de contacto de pies [1,0; 1,0] y cero elevaciones de pie.
- Estabilidad postural: la variación de yaw de cabeza es de solo 0,005 rad punto a punto, lo que indica ausencia de movimiento perceptible.
- Reentrenamiento y ajuste fino: el archivo `model.pt` está pensado explícitamente para "remix", es decir, partir de él para entrenar variantes.
- Despliegue robótico mediante el comando `robotctl policy add` / `robotctl robot do`.
- Registro de trayectorias reproducible en formato `trajectory.v1`, útil para auditoría y para reejecutar episodios.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling, function calling, capacidades de agente ni soporte multilingüe.

## Casos de uso

- Demostración de control motor en el robot Microduck: la política se carga con `robotctl policy add play-dead-flat tfrere/microduck-move-play-dead-flat` y se ejecuta con `robotctl robot do play-dead-flat`, lo que permite exhibir una habilidad completa sin programar controladores a mano.
- Línea base para comparar políticas de la familia `standup`: al fijar métricas objetivas (altura, tilt, contacto, deriva), cualquier variante posterior puede medirse contra los valores de este episodio (score 0,966 del juez).
- Ajuste fino para generar variantes del comportamiento: partiendo de `model.pt`, se pueden entrenar versiones como caída desde distintas poses iniciales o aterrizajes laterales, reutilizando la misma batería de métricas del juez.
- Validación de pipelines de evaluación automática: el contraste entre el juez de código (PASS en las tres rondas) y el VLM (discrepa o duda en las tres) convierte este modelo en un caso de estudio sobre las limitaciones de los revisores basados en VLM cuando el episodio empieza en la pose final.
- Pruebas de robustez de contacto y apoyo: las métricas `contact_fraction` y `foot_lifts` permiten comprobar si una política mantiene ambos pies en el suelo sin levantarlos, algo relevante para políticas de reposo o de seguridad.
- Docencia y formación en robótica: el repositorio incluye vídeo, póster, checkpoints por iteración y trayectorias, materiales suficientes para explicar un ciclo completo de entrenamiento por rondas con evaluación doble.
- Verificación de inferencia ONNX en hardware limitado: el grafo `policy.onnx` puede cargarse con ONNX Runtime para medir latencia y consumo en la propia plataforma del robot, aunque no se han publicado cifras de rendimiento.
- Reconstrucción y auditoría de experimentos: el `manifest.json` con el prompt original, la familia, el juez y el linaje permite reproducir la cadena de decisión que llevó a la versión final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de evaluación son las métricas internas del juez y del revisor VLM, que se reproducen a continuación.

Evaluación por rondas:

| Ronda | Juez (código) | Puntuación del juez | Eye (VLM) | Puntuación final |
|---|---|---|---|---|
| 1 | pass | 0,976 | Discrepa: reverencia de pie en lugar de desplome | 50 % |
| 2 | pass | 0,976 | Discrepa: agachado en lugar de tumbado | 50 % |
| 3 | pass | 0,966 | No está seguro: aparecía ya tumbado | 75 % |

Métricas del episodio evaluado (ronda 3, juez PASS con 0,966):

| Métrica | Valor |
|---|---|
| height_ratio | 0,335 |
| height_m | 0,0385 |
| speed_mps | 0,0 |
| displacement_mps | 0,0 |
| pitch_deg | 1,6 |
| max_tilt_deg | 8,3 |
| yaw_rate_rps | 0,0 |
| head_yaw_ptp_rad | 0,005 |
| knee_left_rad | -0,022 |
| contact_fraction | [1,0; 1,0] |
| travel_m | 0,0 |
| heading_drift_rad | 0,001 |
| foot_lifts | [0; 0] |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publica el número de parámetros ni el tamaño real de `policy.onnx`, por lo que no es posible estimar memoria.
- GPU recomendadas: no disponible. No hay indicación del tipo de acelerador compatible.
- Compatibilidad con GPU de consumo: no disponible. Al ser un grafo ONNX, es técnicamente plausible su ejecución en CPU mediante ONNX Runtime y en GPU mediante los execution providers correspondientes, pero no hay confirmación del autor ni cifras publicadas.
- Opciones de despliegue: el método documentado es `robotctl` (`robotctl policy add` seguido de `robotctl robot do`). Para el archivo ONNX no se citan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un controlador motor.
- Latencia y throughput: no disponibles.
- Nota: el repositorio declara 0,0 GB de tamaño en HuggingFace, lo que sugiere un artefacto muy pequeño, pero este dato no permite calcular requisitos de memoria.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros "moves" de Microduck Academy ni políticas comparables de las que se conozcan arquitectura, contexto, licencia o rendimiento. Tampoco se ofrecen referencias a modelos externos de control motor de tipo standup o play dead que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Validación visual incompleta: en la ronda final el VLM no pudo confirmar el comportamiento porque el pato "aparecía ya tumbado" al inicio del episodio. La puntuación de 75 % es un tope impuesto por esa duda, no una medida de éxito parcial.
- Discrepancia entre evaluadores: en las rondas 1 y 2 el juez dio PASS con 0,976 mientras el VLM observó comportamientos distintos (reverencia de pie, agachado). Esto indica que las métricas del juez pueden satisfacerse sin que la pose final sea la esperada.
- Sin adopción verificable: 0 descargas y 0 likes. No hay evidencia de uso independiente ni de reproducción por terceros.
- Tamaño del repositorio reportado como 0,0 GB, lo que obliga a comprobar manualmente que `policy.onnx`, `model.pt` y el resto de archivos estén realmente presentes y completos antes de integrarlo.
- Ausencia total de especificaciones técnicas: arquitectura, parámetros, observaciones, acciones, régimen de entrenamiento y dataset no están documentados en la información disponible.
- Fecha inconsistente: tanto la creación como la actualización figuran como 2026-09-24, una fecha futura respecto al momento habitual de consulta; conviene tratar los metadatos temporales con cautela.
- Discrepancia en el campo `tier`: la etiqueta del repositorio indica `tier:1` mientras la model card afirma "tier None".
- Alcance funcional mínimo: ejecuta una única habilidad. No sirve para generación de texto, razonamiento, código, visión, agentes ni tareas multilingües.
- Acoplamiento al hardware: la política está pensada para el robot Microduck y la cadena de herramientas `robotctl`; su transferencia a otra plataforma no está documentada.
- Licencia: Apache 2.0 permite uso comercial y modificación con atribución, pero no se declara la procedencia de los datos de entrenamiento ni posibles restricciones de terceros.
- Riesgo en producción: al carecer de métricas de latencia, memoria y tasa de fallo, no es recomendable desplegarla en un sistema crítico sin una batería de pruebas propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tfrere/microduck-move-play-dead-flat
- Perfil del autor: https://huggingface.co/tfrere
- Microduck Academy (Space de entrenamiento): https://huggingface.co/spaces/tfrere/microduck
- Documentación de entrenamiento referenciada en la model card: `docs/TRAINING.md` (sección 8), dentro del repositorio
- Archivos citados: `policy.onnx`, `model.pt`, `rollouts/*.traj`, `checkpoints/r<round>-<iter>.traj`, `manifest.json`, `video.mp4`, `poster.jpg`
