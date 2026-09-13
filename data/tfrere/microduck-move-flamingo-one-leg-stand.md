# tfrere/microduck-move-flamingo-one-leg-stand

## Resumen

`tfrere/microduck-move-flamingo-one-leg-stand` no es un modelo de lenguaje, sino una **política de control motriz** (un "move") para el robot simulado Microduck, entrenada por el usuario tfrere dentro del entorno Microduck Academy. El objetivo declarado es que el pato se mantenga quieto sobre una sola pata, con la otra levantada y sin tocar el suelo, al estilo de un flamenco, sin saltar, dar pasos ni desplazarse. Se distribuye como un artefacto de inferencia en formato ONNX (`policy.onnx`) mas un checkpoint de PyTorch (`model.pt`) reutilizable para reentrenamiento.

La relevancia de esta ficha es acotada y conviene ser explícito: se trata de un repositorio con 0 descargas y 0 likes, con un tamaño de repo de 0.0 GB y publicado el 12 de septiembre de 2026. No hay información sobre arquitectura de red, número de parámetros, datos de entrenamiento, idiomas soportados ni pipeline asociado. Cualquier dato de esa naturaleza debe considerarse no disponible.

El único material de evaluación disponible es el bloque de validación automática incluido en la model card: un juez programático emitió un veredicto PASS con puntuación 0.938, mientras que un modelo de visión-lenguaje (VLM) que revisa los fotogramas emitió un veredicto de duda ("not sure: excessive body wobble" en la ronda final y "not sure: dynamic gait instead of static balance" en la ronda 1). La puntuación final publicada en el catálogo Discover es del 75 %, resultado del recorte aplicado cuando el ojo VLM no está seguro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control motriz distribuida como ONNX; no se especifica la topología de red) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no se indica que sea MoE) |
| Longitud de contexto | no aplicable / no disponible |
| Tipos de cuantizacion | no disponible (se distribuye `policy.onnx` y `model.pt` sin indicar precisiones ni variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`) y PyTorch (`model.pt`); incluye trayectorias `.traj` (`rollouts/*.traj`, `checkpoints/r<round>-<iter>.traj`) y metadatos `manifest.json` (schema 2) |

Otros metadatos del repositorio: identificador `tfrere/microduck-move-flamingo-one-leg-stand`, autor `tfrere`, etiquetas `onnx`, `microduck-policy`, `academy`, `family:velocity`, `kind:perpetual`, `tier:2`, `region:us`. Fecha de creación 2026-09-12T19:42:59Z, última actualización 2026-09-12T19:45:14Z. Pipeline: no disponible. Descargas: 0. Likes: 0.

## Arquitectura y entrenamiento

La model card no describe la arquitectura de red subyacente. Lo que sí se documenta es el procedimiento: se trata de un "move" entrenado con Microduck Academy, perteneciente a la familia `velocity` (estilos de marcha o *gaits*), de nivel `tier:2` y de tipo `perpetual`. El entrenamiento se organiza por rondas e iteraciones, y cada paso queda registrado como una trayectoria en `checkpoints/r<round>-<iter>.traj`, con el listado completo referenciado en `manifest.checkpoints`. El `manifest.json` usa un esquema (schema 2) que incorpora los campos `judge_score`, `vlm` y `score`, además de un bloque `academy` con el prompt original, la familia, el juez y el linaje.

El prompt de entrenamiento es explícito: "Train the duck to stand motionless on one leg with the other foot held clear of the floor, flamingo-style, without hopping, stepping or drifting". No se indica el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO u optimización por refuerzo clásica, aunque el flujo de rondas con juez automático y verificación por VLM es consistente con un bucle iterativo de evaluación y refinamiento. El repositorio se distribuye con `model.pt` explícitamente destinado a "remix", es decir, a servir como punto de partida para *fine-tuning*.

## Capacidades

- Ejecución de una política motriz concreta: mantener una postura estática sobre una pata, con la otra elevada y sin contacto con el suelo.
- Control de estabilidad postural: el juez reporta `max_tilt_deg` de 6.5 grados y `pitch_deg` de 1.0 grados durante la secuencia evaluada.
- Reproducción determinista mediante ONNX, con artefacto `policy.onnx` pensado para "play it" (ejecutarlo directamente).
- Despliegue sobre robot vía la herramienta `robotctl` (comandos `robotctl policy add` y `robotctl robot do`).
- Registro de trayectorias en formato `trajectory.v1` para auditoría y análisis posterior.
- Reentrenamiento y variación de estilo a partir de `model.pt`.
- Tool calling / function calling: no aplicable.
- Soporte de agentes y razonamiento multi-paso: no aplicable.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles. La visión aparece únicamente como componente de evaluación externo (el "ojo" VLM que revisa fotogramas), no como capacidad del propio artefacto.

## Casos de uso

- Investigación en locomoción con patas: el artefacto sirve como referencia reproducible de una política de equilibrio estático sobre una sola pata, con métricas objetivas asociadas (`contact_fraction`, `knee_left_rad`, `yaw_rate_rps`) que permiten comparar variantes.
- Pruebas de pipelines de simulación a hardware: el flujo `robotctl policy add` seguido de `robotctl robot do` permite ensayar el despliegue de una política ONNX en el robot Microduck sin escribir código de integración propio.
- Punto de partida para *fine-tuning*: al incluir `model.pt`, un desarrollador puede reentrenar el movimiento para modificar duración, altura o tolerancia al balanceo, en lugar de partir de cero.
- Auditoría de sistemas de evaluación automática: el caso ilustra la discrepancia entre un juez programático (PASS, 0.938) y un verificador VLM (dudoso), útil para estudiar el diseño de rúbricas y penalizaciones.
- Docencia y demostraciones: es un ejemplo autocontenido, con vídeo (`video.mp4`) y póster (`poster.jpg`), para explicar el ciclo completo de entrenamiento, evaluación y publicación de una política en un entorno tipo academia.
- Reutilización de trayectorias para análisis: los ficheros `rollouts/*.traj` y `checkpoints/r<round>-<iter>.traj` permiten reconstruir la evolución del entrenamiento ronda a ronda y depurar regresiones de comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible en el sentido habitual (MMLU, HumanEval, GSM8K u otros). El repositorio incluye, en su lugar, una evaluación automática específica del movimiento. Estos son los datos aportados por el autor:

| Métrica del juez | Valor |
|---|---|
| Veredicto del juez | pass |
| Puntuación del juez | 0.938 |
| `height_ratio` | 1.041 |
| `height_m` | 0.1197 |
| `speed_mps` | 0.243 |
| `displacement_mps` | 0.072 |
| `pitch_deg` | 1.0 |
| `max_tilt_deg` | 6.5 |
| `yaw_rate_rps` | -1.445 |
| `head_yaw_ptp_rad` | 0.305 |
| `knee_left_rad` | 0.498 |
| `contact_fraction` | [0.27, 0.74] |
| `fell` | false |
| `duration_s` | 8.0 |
| Etiqueta | forward |

| Ronda | Juez | Puntuación del juez | Ojo (VLM) | Puntuación final |
|---|---|---|---|---|
| 1 | pass | 0.938 | not sure: dynamic gait instead of static balance | 75 % |
| final | pass | 0.938 | not sure: excessive body wobble | 75 % |

La puntuación mostrada en Discover es del 75 %, resultado de aplicar el tope del 75 % cuando el ojo VLM no está seguro y del 50 % cuando discrepa, según se documenta en `docs/TRAINING.md`, sección 8.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publica tamaño de parámetros ni huella de memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible. Al distribuirse como ONNX y tratarse de una política motriz de un robot simulado, es plausible que la ejecución sea ligera, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: ONNX Runtime para `policy.onnx`; PyTorch para `model.pt`; la model card documenta además el despliegue sobre robot mediante `robotctl`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no permite identificar políticas comparables de la misma familia `velocity`, del mismo nivel `tier:2` ni de tipo `perpetual`, ni se ofrecen métricas de otros artefactos de Microduck Academy con los que contrastar. Tampoco se dispone de resultados de la búsqueda web relevantes: las páginas devueltas corresponden a dominios de comercio electrónico y a un programa de fidelización ajenos por completo al modelo.

## Limitaciones y advertencias

- El verificador VLM no confirma el comportamiento objetivo: reporta "excessive body wobble" en la ronda final y "dynamic gait instead of static balance" en la ronda 1, lo que sugiere que el pato podría estar balanceándose o marchando en lugar de mantenerse estático.
- Discrepancia entre evaluadores: el juez programático da PASS con 0.938 mientras el ojo VLM duda, y la puntuación final cae al 75 %. No debe interpretarse el PASS como validación completa del prompt.
- `yaw_rate_rps` de -1.445 y `displacement_mps` de 0.072 indican rotación y desplazamiento residuales, en tensión con el requisito de no girar ni derivar.
- `contact_fraction` de [0.27, 0.74] describe la fracción de contacto por pata, pero no se detalla qué pata corresponde a cada valor ni se aclara si el 0.27 implica contacto de la pata supuestamente elevada.
- No hay información sobre sesgos; el término no es aplicable a una política motriz, pero sí lo es la ausencia de validación en hardware real: no se documenta transferencia del simulado al físico.
- No se especifican limitaciones de contexto ni de idioma porque el artefacto no es un modelo de lenguaje.
- Licencia apache-2.0: permite uso comercial con las condiciones habituales de atribución y declaración de cambios, pero el repositorio no incluye un fichero de aviso adicional ni términos específicos del entorno Microduck Academy; conviene verificar las condiciones de la plataforma antes de un despliegue comercial.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, con un único autor y sin revisión externa. Es un artefacto experimental, no un componente listo para producción.
- Riesgo de sobreajuste al juez: al existir un bucle de entrenamiento por rondas guiado por métricas automáticas, el comportamiento puede optimizarse hacia las métricas del juez en detrimento del objetivo cualitativo descrito en el prompt.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tfrere/microduck-move-flamingo-one-leg-stand
- Perfil del autor: https://huggingface.co/tfrere
- Microduck Academy (entorno de entrenamiento): https://huggingface.co/spaces/tfrere/microduck
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes (los resultados devueltos corresponden a sitios de comercio electrónico y a un programa de fidelización, sin relación con el modelo).
