# tfrere/microduck-move-a-proud-parade-march-with-th

## Resumen

`tfrere/microduck-move-a-proud-parade-march-with-th` es una política de locomoción (un "move") entrenada por el usuario tfrere dentro del programa Microduck Academy. No es un modelo de lenguaje: se trata de un artefacto de control motor que gobierna la marcha de un personaje tipo pato cuadrúpedo/bípedo para que avance con el tronco erguido y eleve cada rodilla por encima de la altura de paso habitual. Se distribuye principalmente como `policy.onnx`, acompañado de `model.pt` para reentrenamiento o ajuste fino y de grabaciones de trayectorias en `rollouts/*.traj` (formato `trajectory.v1`).

La relevancia del artefacto está en su metodología de evaluación doble: un juez programático que valida métricas numéricas de la marcha y un "eye" basado en un modelo visión-lenguaje que inspecciona los fotogramas renderizados. El juez otorga PASS con puntuación 1.0 y registra una velocidad de 0.321 m/s, un desplazamiento efectivo de 0.309 m/s y una fracción de contacto de 0.51 en ambos pies durante 8 segundos sin caída. Sin embargo, el VLM discrepa y señala "low knee lift" (elevación de rodilla insuficiente), lo que reduce la puntuación mostrada en Discover al 50 %.

El resultado es un caso de estudio interesante sobre desalineación entre métricas de código y evaluación perceptiva: el objetivo declarado del prompt (rodilla alta) no se refleja en los números del juez, que no mide altura de rodilla de forma directa, sino que se limita a proxies como `knee_left_rad` = 0.267 rad. El modelo es de tier 1, familia `velocity`, tipo `perpetual`, con licencia Apache 2.0 y sin descargas ni likes registrados en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control entrenada en Microduck Academy; no se especifica la topología de red) |
| Parametros totales | no disponible (el repositorio se redondea a 0.0 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no aplica en el sentido de contexto de LLM (la política opera por paso de simulación) |
| Tipos de cuantizacion | no disponible; se distribuye un artefacto ONNX (`policy.onnx`) y pesos PyTorch (`model.pt`) |
| Idiomas soportados | no disponible; el artefacto no procesa lenguaje natural (solo el prompt de entrenamiento está en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`), PyTorch (`model.pt`), trayectorias `trajectory.v1` (`rollouts/*.traj`), metadatos `manifest.json` (schema 2) |

Metadatos adicionales declarados en las etiquetas: `microduck-policy`, `academy`, `family:velocity`, `kind:perpetual`, `tier:1`, `region:us`. Creado y actualizado el 2026-09-12.

## Arquitectura y entrenamiento

No se detalla en la información disponible la arquitectura interna de la política (número de capas, tipo de red, dimensionalidad de observaciones y acciones, frecuencia de control). Lo que sí se documenta es el marco de entrenamiento: Microduck Academy, accesible en el Space `tfrere/microduck`, con un prompt de entrenamiento explícito en inglés: "Train a proud parade march: the duck walks forward with an upright tall trunk and lifts each knee high so the swing foot clears well above normal step height". El `manifest.json` incluye un bloque `academy` con prompt, familia, juez y linaje, lo que permite trazabilidad del entrenamiento y de sus variantes.

El pipeline de evaluación combina dos componentes. El primero es un juez programático ("code, on the numbers") que calcula métricas de la simulación: `height_ratio`, `height_m`, `speed_mps`, `displacement_mps`, `pitch_deg`, `max_tilt_deg`, `yaw_rate_rps`, `head_yaw_ptp_rad`, `knee_left_rad`, `contact_fraction`, `fell`, `duration_s` y `label`. El segundo es un "eye" basado en VLM que evalúa los fotogramas renderizados del clip (`video.mp4`, `poster.jpg`). La puntuación final se calcula con topes: 75 % si el VLM "no está seguro" y 50 % si discrepa, según `docs/TRAINING.md`, sección 8. No se indica si hubo RLHF, DPO ni qué algoritmo de RL o imitación se empleó, ni el número de tokens, episodios o muestras de entrenamiento.

## Capacidades

- Generación de una marcha de desfile hacia adelante: el juez etiqueta la secuencia como `forward` con una duración de 8.0 s y sin caída (`fell: false`).
- Locomoción estable con tronco erguido: `pitch_deg` de 1.9 grados y `max_tilt_deg` de 5.3 grados, lo que indica una inclinación reducida durante el ciclo.
- Mantenimiento de altura: `height_ratio` de 1.083 y altura de 0.1245 m, coherente con el objetivo de "upright tall trunk" del prompt.
- Contacto alterno de pies equilibrado: `contact_fraction` de [0.51, 0.51], es decir, aproximadamente la mitad del ciclo en contacto con el suelo para cada pie.
- Deriva de rumbo baja: `yaw_rate_rps` de -0.106, con oscilación de guiñada de cabeza `head_yaw_ptp_rad` de 0.928 rad.
- Elevación de rodilla: registrada como `knee_left_rad` = 0.267 rad. El VLM considera que esta elevación es insuficiente respecto al objetivo de "knee lifted high", por lo que la capacidad declarada no está confirmada perceptivamente.
- Exportación a ONNX para inferencia portable (`policy.onnx`) y pesos PyTorch para ajuste fino (`model.pt`).
- Reproducción de trayectorias: los ficheros `rollouts/*.traj` en formato `trajectory.v1` permiten reproducir y auditar la ejecución.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades multilingües ni modo de pensamiento; no es un modelo de propósito general.

## Casos de uso

- Animación procedural de personajes en videojuegos: la política se puede cargar como `policy.onnx` en un runtime de inferencia ligero y controlar el ciclo de marcha de un NPC tipo pato, sustituyendo animaciones grabadas a mano por una política reactiva que mantiene la estabilidad ante perturbaciones.
- Previsualización en cine y animación: el clip `video.mp4` y la política permiten generar tomas de desfile de referencia antes de comprometer recursos de animación final, con la ventaja de que el movimiento es reproducible y parametrizable.
- Investigación en locomoción con RL: el artefacto sirve como línea base de tier 1 en la familia `velocity` para comparar variantes de recompensa, especialmente en el diseño de funciones de recompensa que capturen la altura de rodilla, hoy ausente en las métricas del juez.
- Punto de partida para ajuste fino: `model.pt` permite reentrenar o derivar variantes (por ejemplo, un pato con zancada más amplia o con marcha lateral) sin partir de cero.
- Auditoría de pipelines de evaluación multimodal: este modelo es un caso práctico de discrepancia entre juez programático (PASS, 1.0) y evaluador VLM (discrepa), útil para estudiar el sesgo de evaluadores automáticos y calibrar umbrales de puntuación.
- Prototipado en robótica con patas: aunque el activo está entrenado en simulación para un personaje concreto, la interfaz ONNX y el bajo peso del artefacto lo hacen apto para experimentos de transferencia a plataformas pequeñas de bajo coste.
- Docencia en aprendizaje por refuerzo: Microduck Academy y este "move" documentado con juez, eye y métricas numéricas constituyen un ejemplo didáctico completo de ciclo entrenar-evaluar-puntuar.
- Generación de datos sintéticos de trayectorias: los ficheros `rollouts/*.traj` pueden alimentar entrenamientos de modelos de imitación o de predicción de movimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para tareas de lenguaje, código o matemáticas, ya que el artefacto no es un modelo de lenguaje. La evaluación disponible es la del juez programático y el evaluador VLM del propio Microduck Academy:

| Metrica | Valor |
|---|---|
| Resultado del juez | PASS |
| Puntuacion del juez | 1.0 |
| Evaluacion VLM (eye) | discrepa: low knee lift |
| Puntuacion mostrada en Discover | 50 % |
| height_ratio | 1.083 |
| height_m | 0.1245 |
| speed_mps | 0.321 |
| displacement_mps | 0.309 |
| pitch_deg | 1.9 |
| max_tilt_deg | 5.3 |
| yaw_rate_rps | -0.106 |
| head_yaw_ptp_rad | 0.928 |
| knee_left_rad | 0.267 |
| contact_fraction | [0.51, 0.51] |
| fell | false |
| duration_s | 8.0 |
| label | forward |

Historial de rondas de evaluación:

| Ronda | Juez | Puntuacion del juez | Eye (VLM) | Puntuacion |
|---|---|---|---|---|
| 1 | pass | 1.0 | discrepa: low knee lift | 50 % |
| 2 | pass | 1.0 | no esta seguro: low knee lift | 75 % |
| final | pass | 1.0 | discrepa: low knee lift | 50 % |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El tamano del repositorio se redondea a 0.0 GB, lo que indica que el artefacto `policy.onnx` es de muy bajo peso; artefactos de este orden se ejecutan habitualmente en CPU.
- GPU recomendadas: no disponible. No se documenta ninguna GPU concreta; dado el tamano, no se espera que requiera aceleracion dedicada.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible. Por el peso declarado del repositorio, es razonable esperar ejecucion en CPU y en cualquier GPU de consumo, pero no hay datos que lo certifiquen.
- Opciones de despliegue: ONNX Runtime es la via natural, dado que el fichero principal es `policy.onnx`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto. Los pesos `model.pt` requieren PyTorch.
- Latencia y throughput: no disponibles. No se publica la frecuencia de control de la politica, el numero de parametros ni el coste por paso de simulacion. La unica referencia temporal es `duration_s` = 8.0 s para la secuencia evaluada, con `speed_mps` = 0.321 y `displacement_mps` = 0.309.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros "moves" de Microduck Academy con los que comparar parametros, contexto, rendimiento o licencia. Los unicos datos comparativos internos son las rondas de evaluacion del propio modelo (1, 2 y final), recogidas en la seccion de benchmarks.

## Limitaciones y advertencias

- Discrepancia entre juez y evaluador perceptivo: el juez da PASS con 1.0, pero el VLM mantiene en las tres rondas la observacion "low knee lift". El objetivo declarado en el prompt (elevacion alta de rodilla) no queda validado por la inspeccion visual.
- Limitacion de la metrica: el juez mide `knee_left_rad` = 0.267 rad, un unico valor de rodilla izquierda, y no incluye ninguna metrica de altura de pie en el punto de maximo balanceo, que es precisamente lo que pide el prompt. La funcion de evaluacion no cubre el objetivo declarado.
- Puntuacion final penalizada: al discrepar el eye, la puntuacion se topa al 50 % en lugar del 100 % que sugiere el juez. Es un caso claro de no alineacion entre metricas de codigo y percepcion visual.
- Sesgos conocidos: no disponibles. No se documentan sesgos del artefacto mas alla del sesgo del propio evaluador VLM, cuya opinion varia entre "discrepa" y "no esta seguro" en rondas distintas.
- Riesgo de alucinacion: no aplica, ya que el modelo no genera texto.
- Limitaciones de contexto e idioma: no aplica en el sentido de ventana de contexto; el unico texto asociado es el prompt de entrenamiento, en ingles.
- Generalizacion: los resultados proceden de una unica evaluacion de 8 segundos en el entorno de Microduck Academy. No hay datos sobre robustez ante perturbaciones, terrenos irregulares, cambios de velocidad o condiciones distintas de las del clip evaluado.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion con atribucion y conservacion de avisos. Conviene verificar la licencia de los componentes de simulacion y render usados para generar `video.mp4` y `poster.jpg`, que no se detallan.
- Madurez: cero descargas y cero likes en el momento de la consulta, sin pipeline declarado ni idiomas declarados. No debe considerarse un artefacto validado por terceros.
- Uso en produccion: no hay garantias de estabilidad fuera de la simulacion de entrenamiento; la ausencia de documentacion sobre observaciones, acciones y frecuencia de control dificulta la integracion directa en un motor de juego o en un robot real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tfrere/microduck-move-a-proud-parade-march-with-th
- Perfil del autor: https://huggingface.co/tfrere
- Space de Microduck Academy: https://huggingface.co/spaces/tfrere/microduck
- Documentacion de entrenamiento referenciada en la model card: `docs/TRAINING.md`, seccion 8 (no se proporciona URL publica en la informacion disponible)
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las busquedas devuelven unicamente hilos de foros alemanes sobre receptores IPTV y livestreams de ARD/ZDF, sin relacion con este artefacto.
