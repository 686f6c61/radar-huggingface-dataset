# tfrere/microduck-move-deep-squat-hold

## Resumen

Deep Squat Hold es una política de control ("move") para el robot Microduck, publicada por el usuario tfrere dentro del programa Microduck Academy. No es un modelo de lenguaje: se trata de una política neuronal que hace que el robot se agache hasta una posición de cuclillas profunda y se mantenga completamente quieto, sin desplazarse ni levantar los pies. Pertenece a la familia `velocity` (estilos de marcha) y su tipo declarado es `perpetual`, es decir, una habilidad pensada para mantenerse indefinidamente mientras está activa.

El artefacto se distribuye principalmente como `policy.onnx` (para ejecución) y `model.pt` (para reentrenamiento o ajuste fino), junto con grabaciones de trayectorias (`rollouts/*.traj`, `checkpoints/r<round>-<iter>.traj`), un `manifest.json` con metadatos de la academia y un clip de vídeo de demostración. La licencia es Apache 2.0 y el repositorio figura con 0 descargas y 0 "me gusta" en el momento de la consulta, por lo que no existe todavía validación por parte de la comunidad.

La relevancia de esta ficha es acotada y conviene ser explícito: se trata de un activo de robótica de nicho, evaluado con un juez numérico automático y un modelo de visión-lenguaje (VLM) sobre los fotogramas, con un resultado declarado de PASS (puntuación 1,0) y un 100 % en el marcador de Discover. No se publican datos de arquitectura de red, número de parámetros, contexto, idiomas ni benchmarks comparativos con otros modelos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no detalla la topología; se distribuye una política exportada a ONNX más un checkpoint PyTorch) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es un modelo MoE; no aplica) |
| Longitud de contexto | no disponible (no aplica: no es un modelo de lenguaje; las entradas son observaciones y comandos del robot) |
| Tipos de cuantización | no disponible (no se documentan variantes cuantizadas; se publica el ONNX en su precisión original) |
| Idiomas soportados | no disponible (no aplica: no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`policy.onnx`) y PyTorch (`model.pt`) |
| Desarrollador | tfrere, con Microduck Academy |
| Tipo de modelo | política de control / habilidad de movimiento (`microduck-policy`, `microduck-academy-policy`) |
| Familia | `velocity` (estilos de marcha) |
| Tipo de habilidad | `perpetual` |
| Nivel declarado | discrepancia en la fuente: la etiqueta indica `tier:1` y el texto de la model card indica "tier None" |
| Tamaño del repositorio | 0,0 GB (según HuggingFace) |
| Descargas / me gusta | 0 / 0 |
| Pipeline declarado | no disponible |
| Fecha de creación y actualización | 2026-09-21 (ambas idénticas) |
| Región | us |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura de la red. Por el contexto (familia `velocity`, comandos de velocidad, observaciones de estado del robot y salidas articulares como `knee_left_rad`), se trata con alta probabilidad de una política de control profunda entrenada por aprendizaje por refuerzo y exportada a ONNX para inferencia, pero ni el número de capas, ni el tipo de red, ni el número de parámetros aparecen en la model card. El entrenamiento se realizó mediante Microduck Academy, un espacio de HuggingFace asociado al autor, y el repositorio conserva la trazabilidad del proceso: grabaciones de rollouts en formato `trajectory.v1`, checkpoints por ronda e iteración listados en `manifest.checkpoints` y un `manifest.json` con esquema 2 que incluye los bloques `judge_score`, `vlm`, `score` y `academy` (prompt, familia, juez y linaje).

El sistema de evaluación sí está documentado con cierto detalle, aunque no los hiperparámetros: un juez programático ("code, on the numbers") evalúa la telemetría numérica de la política y un VLM ("eye, on the frames") revisa los fotogramas del resultado. La puntuación final mostrada en Discover es la del juez, recortada al 75 % cuando el VLM no está seguro y al 50 % cuando discrepa. En la ronda 2, el juez otorgó PASS con puntuación 1,0 y el VLM coincidió con la descripción del movimiento. Además, la política supera la batería de comandos con 2 respuestas correctas de 2 (área de comando 100 %). No se publican datos sobre composición del dataset, número de muestras, uso de RLHF/DPO ni técnicas de decodificación o aceleración.

## Capacidades

- Ejecución de una habilidad de movimiento concreta: agacharse en cuclillas profunda y mantener la postura sin desplazarse. La telemetría registrada muestra `travel_m` de 0,0 y `displacement_mps` de 0,0, es decir, cero avance.
- Estabilidad postural: `max_tilt_deg` de 1,8 grados, `pitch_deg` de 1,6 grados, `yaw_rate_rps` de -0,0 y `heading_drift_rad` de -0,0, lo que indica una deriva de rumbo nula en la ronda evaluada.
- Apoyo firme de ambos pies: `contact_fraction` de [1,0, 1,0] y `foot_lifts` de [0, 0], sin levantamiento de pies durante la ejecución.
- Flexión articular controlada: `knee_left_rad` de 1,288 radianes (unos 73,8 grados) y `height_ratio` de 0,673, es decir, el robot reduce su altura a aproximadamente el 67,3 % de su altura de referencia (`height_m` de 0,0773 m).
- Respuesta a comandos: contesta 2 de 2 comandos de la batería de evaluación, con un área de comando del 100 %. El detalle de qué comandos son no se especifica en la model card.
- Estabilidad de la cabeza: `head_yaw_ptp_rad` de 0,002 radianes de recorrido pico a pico, lo que sugiere que la cabeza permanece prácticamente inmóvil.
- Reutilización como base para ajuste fino: el archivo `model.pt` está pensado explícitamente para "remix" (reentrenamiento).
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, capacidades de agente ni soporte multilingüe: no es un modelo de lenguaje ni multimodal generativo.

## Casos de uso

- Habilidad reutilizable en un robot Microduck: la política se instala con `robotctl policy add deep-squat-hold tfrere/microduck-move-deep-squat-hold` y se ejecuta con `robotctl robot do deep-squat-hold`, de modo que puede invocarse como una acción discreta dentro de un repertorio de comportamientos del robot.
- Inspección o captura a baja altura: al reducir la altura al 67,3 % de la referencia y mantener deriva de rumbo nula, la política sirve para colocar sensores o cámaras cerca del suelo con una pose repetible y sin desplazamiento.
- Pose de espera en una máquina de estados de comportamientos: al ser una habilidad `perpetual`, encaja como estado estable ("esperar agachado") entre transiciones de navegación, sin consumir movimiento ni alterar la orientación.
- Punto de partida para ajuste fino: el archivo `model.pt` permite reentrenar variantes (por ejemplo, agacharse y volver a levantarse, o mantener la postura bajo perturbaciones) partiendo de una política que ya cumple el criterio del juez.
- Banco de pruebas de control y estimación de estado: la telemetría publicada (deriva de rumbo, fracción de contacto, recorrido de cabeza) permite validar estimadores, controladores articulares y latencias de inferencia en un escenario donde el resultado esperado es conocido y medible.
- Material docente y de investigación en aprendizaje por refuerzo: el repositorio incluye rollouts, checkpoints por iteración y un sistema de evaluación doble (juez numérico más VLM), lo que lo hace útil como ejemplo reproducible de un pipeline de entrenamiento y validación de políticas.
- Prueba de regresión en pipelines de robótica: al tener métricas objetivas y umbrales publicados, la política puede usarse como caso de prueba para detectar regresiones en el runtime de inferencia ONNX, en el controlador de bajo nivel o en la calibración del robot.
- Demostración y contenido divulgativo: el propio repositorio incluye `video.mp4` y `poster.jpg` generados a partir de la ejecución, reutilizables para documentar la habilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible en el sentido habitual (MMLU, HumanEval, GSM8K u otros): no aplica a una política de control. La única evaluación disponible es la del propio programa Microduck Academy, correspondiente a la ronda 2:

| Métrica | Valor |
|---|---|
| Veredicto del juez (numérico) | PASS |
| Puntuación del juez | 1,0 |
| Evaluación del VLM (sobre fotogramas) | Coincide: "el robot mantiene una cuclillas profunda con las rodillas flexionadas, el torso inclinado hacia delante y los pies firmemente apoyados en el suelo" |
| Puntuación mostrada en Discover | 100 % |
| Batería de comandos | 2 de 2 comandos respondidos (área de comando 100 %) |
| `height_ratio` | 0,673 |
| `height_m` | 0,0773 |
| `speed_mps` | -0,0 |
| `displacement_mps` | 0,0 |
| `pitch_deg` | 1,6 |
| `max_tilt_deg` | 1,8 |
| `yaw_rate_rps` | -0,0 |
| `head_yaw_ptp_rad` | 0,002 |
| `knee_left_rad` | 1,288 |
| `contact_fraction` | [1,0, 1,0] |
| `travel_m` | 0,0 |
| `heading_drift_rad` | -0,0 |
| `foot_lifts` | [0, 0] |

Nota: el campo final del JSON del juez aparece truncado en la model card (`"f`) y no puede reproducirse completo. Solo se documenta una ronda (ronda 2) en la tabla de la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publican cifras de memoria, latencia ni throughput.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible como dato confirmado. Cabe señalar que el repositorio declara un tamaño de 0,0 GB y que se trata de una política de control exportada a ONNX, lo que en la práctica suele implicar modelos de pocos megabytes ejecutables en CPU o en hardware embebido; sin embargo, esta apreciación es una inferencia a partir del tamaño del repositorio, no un dato publicado.
- Opciones de despliegue: ejecución mediante el runtime ONNX sobre `policy.onnx`; el flujo documentado es la CLI `robotctl` (`policy add` y `robot do`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo. Para reentrenamiento se usa `model.pt` con PyTorch.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye ningún modelo comparable con datos de parámetros, contexto, rendimiento, licencia y disponibilidad. La única referencia de rendimiento es la evaluación interna de Microduck Academy (juez numérico más VLM), que es una métrica autorreferencial del propio programa de entrenamiento y no permite una comparación cruzada con otras políticas de locomoción o con otras habilidades de la misma academia.

## Limitaciones y advertencias

- Alcance funcional muy restringido: la política ejecuta una única habilidad (agacharse y mantenerse inmóvil). No camina, no navega y no responde a objetivos de alto nivel.
- Validación limitada: el resultado publicado corresponde a una sola ronda de evaluación (ronda 2), con un juez programático sobre telemetría y un VLM sobre fotogramas. No se documentan pruebas repetidas, semillas distintas ni condiciones iniciales variadas.
- Entorno de validación no especificado: la model card no aclara si las pruebas se realizaron en simulación, en el robot físico o en ambos, ni si existe transferencia sim-to-real verificada. Es un caveat crítico para cualquier uso en hardware real.
- Robustez no caracterizada: no hay datos sobre comportamiento ante perturbaciones externas, cambios de terreno, pendientes, carga útil, batería baja o fallos de actuadores.
- Métricas truncadas: el objeto JSON del juez aparece cortado en la model card, por lo que parte de los criterios de evaluación no son auditables.
- Riesgo de alucinación: no aplica en el sentido habitual, al no ser un modelo generativo de texto. El riesgo análogo es la discrepancia entre la métrica automática y el comportamiento real, mitigado parcialmente por la comprobación con VLM.
- Sesgos: no se documentan sesgos en el sentido estadístico del término. Si el entrenamiento se realizó en simulación, existirá un sesgo de dominio respecto al robot físico que no está cuantificado.
- Idiomas: no aplica; el modelo no procesa lenguaje natural.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, con obligación de conservar los avisos de copyright y licencia y de indicar los cambios realizados. Se distribuye sin garantías.
- Ausencia de validación comunitaria: 0 descargas y 0 "me gusta" en la fecha de consulta; no hay evidencia de uso por terceros.
- Inconsistencia en los metadatos: la etiqueta declara `tier:1` mientras el texto de la model card indica "tier None". Conviene verificar cuál es el valor correcto antes de tratarlo como un nivel oficial.
- Fecha de creación y actualización idénticas (2026-09-21) y repositorio de 0,0 GB: indicios de una publicación muy reciente y sin mantenimiento posterior documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tfrere/microduck-move-deep-squat-hold
- Perfil del autor en HuggingFace: https://huggingface.co/tfrere
- Espacio Microduck Academy: https://huggingface.co/spaces/tfrere/microduck
- Resultados de la búsqueda web: no se ha encontrado ningún resultado relevante. Las URL devueltas (kinotochka.net y sus páginas asociadas) son contenido sin relación con el modelo y se descartan como fuentes.
