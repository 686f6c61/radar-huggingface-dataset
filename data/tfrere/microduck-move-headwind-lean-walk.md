# tfrere/microduck-move-headwind-lean-walk

## Resumen

`tfrere/microduck-move-headwind-lean-walk` no es un modelo de lenguaje: es una política de locomoción (un controlador entrenado por aprendizaje por refuerzo) publicada en HuggingFace dentro del ecosistema Microduck Academy. El autor, `tfrere`, la ha entrenado para que el robot Microduck ejecute un estilo de marcha concreto: caminar inclinándose muy hacia delante, con el "hocico" bajo, simulando que avanza contra un viento de cara fuerte. Pertenece a la familia `velocity` (estilos de marcha o gaits) y se clasifica como `kind: perpetual`, es decir, un movimiento continuo sin fin definido.

El artefacto desplegable es un fichero ONNX (`policy.onnx`) que se carga directamente en el robot mediante `robotctl policy add`, más un `model.pt` pensado para reentrenamiento o ajuste fino (remix). El repositorio incluye además trayectorias de rollouts, checkpoints de cada ronda de entrenamiento, un `manifest.json` con metadatos de academia (prompt, familia, juez, linaje) y un clip de vídeo con póster.

La relevancia de esta ficha es acotada: se trata de una política de tier 1 con 0 descargas y 0 likes en el momento de la consulta, con licencia Apache 2.0, y con un veredicto de calidad mixto. El juez automático basado en métricas numéricas da PASS con puntuación 1.0, pero el evaluador visual (un VLM sobre los fotogramas del checkpoint 4000) responde "not sure: stepping in place", lo que limita la puntuación mostrada en Discover al 75 %. No hay información sobre arquitectura de red, número de parámetros ni datos de entrenamiento en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política neuronal exportada a ONNX; no se detalla la topología interna) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; es una política de control con ventana de observación no documentada) |
| Tipos de cuantización | no disponible (se distribuye `policy.onnx`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no aplica: no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`) y PyTorch (`model.pt`); trayectorias en `rollouts/*.traj` (formato trajectory.v1) |
| Tipo de artefacto | política de locomoción (move) de Microduck Academy |
| Familia / tipo | `family:velocity` (estilos de marcha), `kind:perpetual` |
| Tier | etiquetado como `tier:1` en los tags; la model card indica "tier None" |
| Tamaño del repositorio | 0.0 GB (según HuggingFace) |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-22 |
| Última actualización | 2026-09-22 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura de red subyacente. Por el contexto (Microduck Academy, exportación a ONNX, rollouts de trayectorias con checkpoints por iteración), se trata de una política entrenada por aprendizaje por refuerzo y exportada como grafo ONNX para inferencia en el robot. No se especifica si es un perceptrón multicapa, una red recurrente o una política con memoria; tampoco se publican el número de parámetros, la dimensionalidad de la observación ni la de la acción. Todos esos datos habría que extraerlos del `manifest.json`, que no se ha incluido en la información proporcionada.

El proceso de entrenamiento aparece estructurado en rondas con checkpoints por iteración (`checkpoints/r<round>-<iter>.traj`) y un manifiesto que lista dichos checkpoints. La tabla de rondas documentada muestra tres rondas: la ronda 1 obtuvo veredicto `fail` del juez con puntuación 0.999, la ronda 2 `fail` con 1.0 y la ronda 3 `pass` con 1.0. El modelo que se distribuye corresponde al checkpoint 4000. No se indica el número total de tokens (no aplica), la composición del dataset de entrenamiento, ni si hubo fases de RLHF o DPO, algo que tampoco es esperable en este tipo de política.

## Capacidades

- Locomoción bípeda hacia delante con un estilo concreto: inclinación marcada del cuerpo hacia delante y cabeza baja, con un `pitch_deg` de 12.1 grados.
- Desplazamiento efectivo medido: `speed_mps` y `displacement_mps` de 0.268 m/s, con un recorrido (`travel_m`) de 1.601 metros en la evaluación.
- Ejecución continua y cíclica (`kind: perpetual`), apta para marcha sostenida sin un objetivo de parada definido.
- Respuesta a comandos: según la model card, "answers 7 of 7 commands", con un área de comando del 100 %.
- Control de orientación: deriva de rumbo (`heading_drift_rad`) de 0.075 rad y `yaw_rate_rps` de 0.012, valores bajos que indican buena estabilidad direccional en la prueba.
- Estabilidad postural: `max_tilt_deg` de 15.4 grados y `height_ratio` de 1.078 respecto a la altura de referencia (`height_m` 0.1239).
- No soporta marcha atrás: la propia model card indica de forma explícita "not trained for backward".
- No dispone de tool calling, agentes, razonamiento multi-paso, capacidades multilingües, visión ni audio: no es un modelo de lenguaje ni multimodal.
- No dispone de modo "thinking" ni de ninguna capacidad cognitiva; su salida son comandos motores.

## Casos de uso

- Control de locomoción del robot Microduck: instalar la política con `robotctl policy add headwind-lean-walk tfrere/microduck-move-headwind-lean-walk` y ejecutarla con `robotctl robot do headwind-lean-walk` para que el robot camine con este estilo en demostraciones y exposiciones.
- Estudio y reproducción de gaits: el fichero `rollouts/*.traj` (formato trajectory.v1) permite analizar la trayectoria registrada y comparar el estilo "headwind lean" con otros gaits de la familia `velocity` en términos de pitch, tilt y deriva de rumbo.
- Ajuste fino y remixes: el `model.pt` está pensado explícitamente para reentrenamiento ("remix = fine-tune from it"), de modo que sirve como punto de partida para derivar variantes de marcha más inclinadas, más rápidas o con otro reparto de contactos.
- Base para investigación en estilos de marcha con RL: con 1.601 m de recorrido y contact_fraction de [0.51, 0.51] (apoyo prácticamente simétrico entre ambos pies), es un caso de referencia para estudiar cómo la inclinación del torso afecta a la estabilidad y a la velocidad alcanzable.
- Integración en pipelines de evaluación automatizada: el `manifest.json` incluye bloques de `judge_score`, `vlm` y `score`, lo que permite alimentar un sistema de evaluación continua que compare nuevas políticas contra esta línea base (juez 1.0, VLM "not sure", score final 75 %).
- Docencia y divulgación: al ser una política pequeña con licencia Apache 2.0 y con vídeo y póster incluidos, es un ejemplo didáctico de bajo coste para explicar el ciclo completo prompt → entrenamiento → juicio automático → evaluación visual en un curso de robótica o de RL.
- Pruebas de despliegue en robótica física: el formato ONNX permite ejecutar la política fuera del entorno de entrenamiento, útil para validar el proceso de exportación e inferencia en hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card sí incluye las métricas del juez automático sobre la política distribuida (checkpoint 4000):

| Métrica | Valor |
|---|---|
| Veredicto del juez (código, sobre números) | PASS (score 1.0) |
| `height_ratio` | 1.078 |
| `height_m` | 0.1239 |
| `speed_mps` | 0.268 |
| `displacement_mps` | 0.268 |
| `pitch_deg` | 12.1 |
| `max_tilt_deg` | 15.4 |
| `yaw_rate_rps` | 0.012 |
| `head_yaw_ptp_rad` | 0.605 |
| `knee_left_rad` | 0.057 |
| `contact_fraction` | [0.51, 0.51] |
| `travel_m` | 1.601 |
| `heading_drift_rad` | 0.075 |
| `foot_lifts` | truncado en la información proporcionada |
| Evaluación visual (VLM sobre fotogramas) | "not sure: stepping in place" |
| Comandos superados | 7 de 7 |
| Puntuación mostrada en Discover | 75 % |

Histórico de rondas de entrenamiento:

| Ronda | Juez | Puntuación del juez | Evaluación visual (VLM) | Puntuación final |
|---|---|---|---|---|
| 1 | fail | 0.999 | not sure: stepping in place | 75 % |
| 2 | fail | 1.0 | not sure: stepping in place | 75 % |
| 3 | pass | 1.0 | not sure: stepping in place | 75 % |

Según la model card, la puntuación de Discover se limita al 75 % cuando la evaluación visual no está segura y al 50 % cuando discrepa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de una política exportada a ONNX y no de un modelo de lenguaje, se espera que sea muy ligera, pero no se publica el número de parámetros ni el tamaño de los tensores.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada. Dado que el artefacto es una política ONNX destinada a ejecutarse en el propio robot mediante `robotctl`, es razonable esperar ejecución en CPU, pero esto no se afirma en la documentación disponible.
- Opciones de despliegue: `robotctl` (vía `robotctl policy add` + `robotctl robot do`), y ejecución directa del grafo ONNX con cualquier runtime compatible con ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se han identificado modelos comparables en la información proporcionada; los resultados de la búsqueda web no guardan relación con este artefacto. Los únicos términos de comparación internos serían otras políticas de la familia `velocity` (estilos de marcha) dentro de Microduck Academy, pero no se han proporcionado sus nombres, métricas ni disponibilidad.

| Aspecto | Este modelo | Alternativas comparables |
|---|---|---|
| Parámetros | no disponible | no disponible |
| Contexto | no aplica | no disponible |
| Rendimiento | juez 1.0 (PASS); VLM "not sure"; score Discover 75 % | no disponible |
| Licencia | apache-2.0 | no disponible |
| Disponibilidad | ONNX + PyTorch en HuggingFace, 0 descargas | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se ha documentado ningún análisis de sesgo, algo poco habitual en políticas de locomoción, pero la ausencia de información no equivale a ausencia de comportamiento indeseado.
- Riesgo de discrepancia entre evaluación automática y real: el juez numérico da PASS con 1.0, pero el evaluador visual describe la marcha como "not sure: stepping in place" (podría estar marchando sin desplazarse de forma perceptible). Esta discrepancia es el caveat más importante del artefacto.
- Velocidad muy baja: 0.268 m/s de desplazamiento. Es una marcha deliberadamente estilizada, no una política de locomoción eficiente.
- Falta de marcha atrás: la model card confirma que no está entrenada para retroceder. Cualquier uso que requiera reversibilidad necesitará otra política o un ajuste fino.
- Desviación de rumbo acumulable: aunque `heading_drift_rad` es bajo en el recorrido medido (0.075 rad en 1.601 m), no se documenta comportamiento en trayectos largos ni en terrenos irregulares.
- Generalización desconocida: no hay datos sobre robustez frente a cambios de terreno, carga útil, fricción o perturbaciones externas.
- Idiomas y contexto: no aplica, pero conviene subrayar que este artefacto no debe confundirse con un modelo de lenguaje; no procesa texto ni instrucciones en lenguaje natural.
- Licencia: Apache 2.0, permisiva para uso comercial, siempre que se conserve el aviso de licencia y atribución correspondiente. No se documentan restricciones adicionales.
- Madurez: 0 descargas y 0 likes, sin actualizaciones desde su creación. No hay evidencia de uso en producción ni de validación por terceros.
- Contenido truncado: la métrica `foot_lifts` aparece incompleta en la información disponible, y no se ha podido acceder al `manifest.json` para completar los metadatos técnicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tfrere/microduck-move-headwind-lean-walk
- Perfil del autor: https://huggingface.co/tfrere
- Space de Microduck Academy: https://huggingface.co/spaces/tfrere/microduck

Nota: los resultados de búsqueda web disponibles no contienen ningún enlace relevante sobre este modelo (se refieren a temas sin relación: paneles de opinión, marketing, Pathfinder, fotografía y foros de automoción). No se han encontrado paper, blog ni repositorio adicional asociados.
