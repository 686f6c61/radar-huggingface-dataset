# tfrere/microduck-move-limbo-lean-hold

## Resumen

`tfrere/microduck-move-limbo-lean-hold` es una política de movimiento (motion policy) entrenada por el usuario tfrere con Microduck Academy, el proyecto alojado en el Space `tfrere/microduck`. No es un modelo de lenguaje: se trata de un controlador exportado a ONNX que produce una pose estática concreta para la criatura bípeda "Microduck": mantener el cuerpo inclinado hacia atrás con las rodillas empujadas hacia delante, el pico elevado y los pies clavados en el suelo, sin dar pasos ni desplazarse. Pertenece a la familia `velocity` (estilos de marcha), nivel (`tier`) 2, y es de tipo `perpetual`, es decir, una pose sostenida indefinidamente.

El problema que resuelve es de locomoción y control: conseguir un equilibrio estático controlado en una postura forzada (tipo "limbo") con desplazamiento prácticamente nulo. Su relevancia es acotada y específica del ecosistema Microduck Academy: sirve como pieza reutilizable dentro de una biblioteca de movimientos, como material de referencia para reproducir el proceso de entrenamiento (checkpoints y trayectorias incluidas) y como caso de estudio de los mecanismos de evaluación automática de la propia academia, que combinan un juez por código y un revisor VLM.

El modelo se publica con licencia Apache 2.0, tiene 0 descargas y 0 "likes" en el momento de la consulta, y su repositorio ocupa 0.0 GB según HuggingFace. No se dispone de datos sobre arquitectura de red, número de parámetros, datos de entrenamiento ni idiomas (no aplica, al no ser un modelo de lenguaje). Buena parte de las filas de especificación habituales en una ficha de LLM no son aplicables aquí.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control exportada a ONNX; `model.pt` en PyTorch) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica / no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`), PyTorch (`model.pt`), trayectorias `.traj` (trajectory.v1) |
| Autor | tfrere |
| Familia / tipo | family:velocity, kind:perpetual, tier:2 |
| Categoria de pipeline | no disponible |
| Region declarada | us |
| Fecha de creacion | 2026-09-16 |
| Fecha de actualizacion | 2026-09-16 |
| Tamano del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de red (capas, anchura, tipo de observaciones o acciones). Lo que sí se documenta es el proceso de entrenamiento: el movimiento se entrena mediante Microduck Academy, que organiza el entrenamiento en rondas con checkpoints por iteración, almacenados como `checkpoints/r<round>-<iter>.traj` y listados en `manifest.checkpoints`. El modelo publicado corresponde al checkpoint 3200, que es el que "se envía" (`the one that ships`) según la model card. Los archivos `rollouts/*.traj` contienen grabaciones en formato trajectory.v1.

El sistema de evaluación es doble. Por un lado, un juez automático que opera "sobre los números" (métricas de telemetría de la simulación) y que otorgó PASS con una puntuación de 0.929. Por otro, un revisor VLM ("eye") que inspecciona fotogramas del movimiento y que, en este caso, emitió el veredicto "not sure: no body lean" sobre los fotogramas del checkpoint 3200. La puntuación final que aparece en Discover es del 75 %, resultado de aplicar un tope del 75 % cuando el revisor VLM no está seguro y del 50 % cuando discrepa, según lo descrito en `docs/TRAINING.md` (sección 8). Además, el modelo "responde 2 de 2 comandos" con un área de comando del 100 %, según la batería de comandos descrita en `docs/TRAINING.md`.

No se especifican en la información proporcionada el volumen de datos de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO u optimización por recompensa más allá de lo implícito en los "checkpoints" y las rondas de evaluación.

## Capacidades

- Mantener una pose estática de inclinación hacia atrás con las rodillas adelantadas, el tronco angulado y la cabeza elevada, sin caminar.
- Sostener la pose de forma indefinida (tipo `perpetual`), no como transición puntual.
- Mantener contacto plantar completo: `contact_fraction` de `[1.0, 1.0]` y `foot_lifts` de `[0, 0]`, es decir, ningún pie se levanta.
- Desplazamiento prácticamente nulo: `speed_mps` 0.0, `displacement_mps` 0.0 y `travel_m` 0.002.
- Estabilidad de rumbo: `yaw_rate_rps` 0.003 y `heading_drift_rad` 0.019.
- Respuesta a comandos: contesta 2 de 2 comandos de la batería de pruebas (área de comando 100 %).
- Ejecución en robot mediante la CLI `robotctl` del ecosistema Microduck.
- Reutilización como base para fine-tuning a partir de `model.pt`.
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes, audio ni multilingüismo: no es un modelo de lenguaje.

## Casos de uso

- Despliegue en robot físico: la model card documenta el flujo `sudo robotctl policy add limbo-lean-hold tfrere/microduck-move-limbo-lean-hold` seguido de `robotctl robot do limbo-lean-hold`, de modo que la política se puede instalar y ejecutar directamente sobre el hardware compatible con `robotctl`.
- Punto de partida para fine-tuning: el archivo `model.pt` está pensado explícitamente para "remix", es decir, ajustar la política desde ese checkpoint para obtener variantes de la pose (mayor inclinación, distinta posición de rodillas o cabeza) sin partir de cero.
- Investigación en control de equilibrio estático: las métricas de contacto plantar (`contact_fraction` 1.0 en ambos pies) y de desplazamiento (0.002 m) permiten usarlo como caso base para estudiar cuánto se puede inclinar el tronco antes de que el controlador pierda el contacto o empiece a viajar.
- Generación de datos de movimiento para aprendizaje por imitación: los ficheros `rollouts/*.traj` en formato trajectory.v1 y los checkpoints por iteración constituyen un conjunto de trayectorias reutilizable para entrenar o validar otros controladores.
- Reproducción del pipeline de evaluación: sirve para estudiar la discrepancia entre un juez numérico (PASS, 0.929) y un revisor VLM ("not sure: no body lean"), incluyendo el mecanismo de topes de puntuación (75 % / 50 %) descrito en `docs/TRAINING.md`.
- Docencia y demostraciones en Spaces: al estar integrado en Microduck Academy, puede usarse como ejemplo práctico de ciclo completo de entrenamiento, evaluación y publicación de un movimiento, con vídeo y póster incluidos en el repositorio.
- Pruebas de robustez de la batería de comandos: con un resultado de 2 de 2 comandos y área de comando del 100 %, es un candidato para validar si la interfaz de comandos del ecosistema se comporta igual en poses estacionarias que en marchas de la familia `velocity`.
- Referencia negativa controlada en experimentos de locomoción: al no desplazarse, permite comparar métricas de velocidad y rumbo contra políticas de marcha de la misma familia sin la variable de avance.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible en el sentido habitual (MMLU, HumanEval, GSM8K u otros), ya que no es un modelo de lenguaje. Los únicos datos de rendimiento disponibles son las métricas de telemetría del juez automático y el veredicto del revisor VLM:

| Metrica | Valor |
|---|---|
| Veredicto del juez (codigo) | PASS |
| Puntuacion del juez | 0.929 |
| Veredicto del revisor VLM | not sure: no body lean (fotogramas del checkpoint 3200) |
| Puntuacion final en Discover | 75 % |
| Comandos respondidos | 2 de 2 (area de comando 100 %) |
| `height_ratio` | 0.849 |
| `height_m` | 0.0976 |
| `speed_mps` | 0.0 |
| `displacement_mps` | 0.0 |
| `pitch_deg` | 5.2 |
| `max_tilt_deg` | 6.4 |
| `yaw_rate_rps` | 0.003 |
| `head_yaw_ptp_rad` | 0.025 |
| `knee_left_rad` | 0.698 |
| `contact_fraction` | [1.0, 1.0] |
| `travel_m` | 0.002 |
| `heading_drift_rad` | 0.019 |
| `foot_lifts` | [0, 0] |

| Ronda | Juez | Puntuacion del juez | Revisor VLM | Puntuacion |
|---|---|---|---|---|
| 1 | pass | 0.929 | not sure: no body lean | 75 % |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publican requisitos de memoria ni de GPU.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible. El repositorio ocupa 0.0 GB, lo que sugiere pesos de tamano reducido, pero este dato no permite derivar requisitos de memoria ni confirmar que funcione en una GPU de consumo concreta.
- Opciones de despliegue: el formato ONNX (`policy.onnx`) permite inferencia mediante runtimes ONNX estándar; el flujo documentado por el autor es la CLI del ecosistema Microduck (`robotctl policy add` y `robotctl robot do`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se han encontrado en la información proporcionada datos de modelos comparables con los que contrastar parametros, contexto, rendimiento o licencia. El propio repositorio se etiqueta dentro de la familia `velocity`, nivel 2, del ecosistema Microduck Academy, lo que implica la existencia de otros movimientos hermanos del mismo autor, pero no se dispone de sus fichas, métricas ni identificadores, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- El revisor VLM dictaminó "not sure: no body lean" sobre los fotogramas del checkpoint publicado: la inspección visual no confirma que la inclinación del cuerpo sea perceptible, aunque las métricas numéricas den PASS.
- La puntuación final queda limitada al 75 % precisamente por esa incertidumbre del revisor, según la regla de topes descrita en `docs/TRAINING.md`.
- El movimiento está diseñado para no desplazarse (`travel_m` 0.002, `speed_mps` 0.0): no sirve para tareas de locomoción, navegación o transporte.
- Dependencia del ecosistema: la ejecución en robot está documentada a través de `robotctl` y de Microduck Academy; fuera de ese entorno no se describen garantías de compatibilidad.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no aplica, al no ser un modelo generativo de lenguaje.
- Limitaciones de contexto o idioma: no aplican.
- Restricciones de licencia: el modelo se publica bajo Apache 2.0, que permite uso comercial, pero la información disponible no detalla las condiciones de licencia del entorno de simulación, del robot o de las herramientas `robotctl` y Microduck Academy, que podrían imponer restricciones adicionales.
- Madurez: 0 descargas y 0 likes, con una única ronda de evaluación registrada y creado y actualizado el mismo día, lo que indica ausencia de validación externa.
- Caveat para producción: no se documentan pruebas de transferencia sim-to-real, robustez ante perturbaciones ni comportamiento ante condiciones fuera de distribución.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tfrere/microduck-move-limbo-lean-hold
- Microduck Academy (Space de entrenamiento): https://huggingface.co/spaces/tfrere/microduck
- Perfil del autor: https://huggingface.co/tfrere
- Ficheros citados en la model card: `policy.onnx`, `model.pt`, `rollouts/*.traj`, `checkpoints/r<round>-<iter>.traj`, `manifest.json`, `video.mp4`, `poster.jpg`
- Documentación referenciada por el autor: `docs/TRAINING.md` (secciones sobre la batería de comandos y la regla de puntuación, sección 8)

Nota: la búsqueda web asociada a esta consulta no devolvió ningún resultado relevante sobre el modelo; los enlaces recuperados corresponden a un alojamiento turístico en Potsdam (schiffspension.de) y no guardan relación con este repositorio. No se han encontrado papers, blogs, repositorios ni demos adicionales.
