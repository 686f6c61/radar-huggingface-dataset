# tfrere/microduck-move-happy-forward-hop

## Resumen

El modelo identificado como `tfrere/microduck-move-happy-forward-hop` no es un modelo de lenguaje, sino una política de control (policy) para un robot con forma de pato, entrenada dentro del ecosistema Microduck Academy por el usuario tfrere. Su función concreta es generar la señal de control que hace que el robot avance dando pequeños saltos, manteniendo una postura erguida y ambas patas despegando brevemente del suelo en cada bote. Se distribuye principalmente como `policy.onnx` para su ejecución y como `model.pt` para reentrenamiento o ajuste fino.

La relevancia de esta ficha es acotada y conviene ser explícito: se trata de un artefacto de robótica y aprendizaje por refuerzo a pequeña escala, no de un sistema de propósito general. El repositorio ocupa 0,0 GB según HuggingFace, no tiene descargas ni likes registrados en el momento de la consulta y fue creado el 12 de septiembre de 2026. Está etiquetado como `microduck-policy`, familia `velocity` (estilos de marcha o gaits), tier 2 y tipo `perpetual`.

La evaluación del modelo se realiza mediante un doble mecanismo documentado por el autor: un juez automático que analiza métricas numéricas del rollout (etiquetado como PASS con puntuación 1.0) y un "ojo" basado en un modelo de visión-lenguaje que revisa los fotogramas de la animación y confirma que el pato se desplaza hacia delante con fase aérea clara. El resultado final mostrado es del 100 %.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el autor no especifica la topología de la red; el artefacto se distribuye como política de control exportada a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no se indica que sea un modelo MoE) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje; la política consume observaciones de estado por paso de simulación) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`) y PyTorch (`model.pt`); se incluyen trayectorias en formato `trajectory.v1` (`rollouts/*.traj`, `checkpoints/r<round>-<iter>.traj`) |
| Autor | tfrere |
| Familia / tipo | `family:velocity` (gaits), `kind:perpetual`, tier 2 |
| Tamaño del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-12 |
| Fecha de actualización | 2026-09-12 |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura de red empleada. Por el contexto del ecosistema (Microduck Academy, familia `velocity`, tier 2, tipo `perpetual`) y por los formatos de salida (`policy.onnx` para reproducción y `model.pt` para reajuste), se trata de una política de control entrenada mediante aprendizaje por refuerzo para una tarea de locomoción concreta. No se especifican el número de parámetros, el número de tokens o pasos de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. Todos estos datos figuran como no disponibles en la model card.

Lo que sí está documentado es el procedimiento de evaluación y la trazabilidad del entrenamiento. El autor describe un pipeline de varias rondas con registro por iteración: la ronda 1 obtuvo veredicto `fail` del juez con puntuación 0,833 y sin veredicto del "ojo" (VLM), quedando en un 83 %; las rondas 2 y final obtuvieron `pass` con puntuación 1,0 y acuerdo del VLM, alcanzando el 100 %. El manifiesto (`manifest.json`, esquema 2) incluye tanto el resultado del juez como el del VLM, un bloque `academy` con el prompt, la familia, el juez y el linaje, y la lista de checkpoints intermedios. La puntuación mostrada en el descubridor se limita al 75 % cuando el VLM no emite veredicto y al 50 % cuando discrepa.

## Capacidades

- Locomoción hacia delante mediante saltos: la política genera el patrón de control que desplaza al robot en línea recta con fase aérea intermitente.
- Control de postura erguida: el juez reporta una relación de altura de 0,973 respecto a la referencia y una inclinación máxima de 9,5 grados, con un `pitch` de 5,9 grados.
- Patrón de contacto intermitente: la fracción de contacto por pata es de [0,36, 0,27], lo que implica que el robot pasa una parte relevante del tiempo en el aire.
- Estabilización de rumbo: el `yaw_rate` medido es de -1,817 rps, con un desplazamiento lateral (`displacement_mps`) de 0,061.
- Articulación de rodilla: se registra un valor de `knee_left_rad` de 0,352.
- Movimiento de cabeza: el rango pico a pico de `head_yaw_ptp_rad` es de 0,362.
- Ejecución en formato ONNX: la política puede desplegarse en tiempo de inferencia mediante un runtime ONNX, sin necesidad del framework de entrenamiento.
- Reajuste fino: el archivo `model.pt` permite remezclar (fine-tune) la política partiendo de los pesos entrenados.
- Reproducción de trayectorias: los archivos `rollouts/*.traj` y los checkpoints por ronda permiten auditar y reproducir la evolución del entrenamiento.
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Simulación de robótica educativa: la política puede cargarse en un simulador con soporte ONNX para demostrar cómo un controlador aprendido produce una marcha concreta, usando las métricas del juez (altura, contacto, inclinación) como criterios objetivos de evaluación en clase.
- Control de un robot físico tipo pato: con el runtime ONNX adecuado, `policy.onnx` puede alimentar el bucle de control de un robot con la misma morfología, siempre que las observaciones de estado coincidan con las usadas en entrenamiento.
- Punto de partida para ajuste fino: `model.pt` permite a un investigador reentrenar la política hacia variantes de marcha (por ejemplo, saltos más largos o más rápidos) sin partir de cero, aprovechando la familia `velocity`.
- Demostración web interactiva: al ser un modelo ONNX pequeño (repositorio de 0,0 GB), puede ejecutarse en el navegador con ONNX Runtime Web para mostrar la política en una página de divulgación sin backend dedicado.
- Comparación de estilos de marcha: dentro de la familia `velocity` y el tier 2, esta política puede usarse como referencia cuantitativa para comparar gaits alternativos con las mismas métricas del juez (velocidad de 0,495 m/s, fase aérea, inclinación máxima).
- Generación de material audiovisual: el repositorio incluye `video.mp4` y `poster.jpg` generados a partir del rollout, útiles para documentar resultados de entrenamiento en publicaciones o informes técnicos.
- Dataset de imitación: los archivos `rollouts/*.traj` en formato `trajectory.v1` pueden emplearse como datos de demostración para entrenar políticas por imitación o para análisis de estabilidad.
- Auditoría de pipelines de RL: el conjunto de checkpoints por ronda e iteración (`checkpoints/r<round>-<iter>.traj`) permite estudiar cómo evoluciona una política entre la ronda fallida y la ronda aprobada, útil para investigar metodologías de evaluación automática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor sí documenta métricas de evaluación propias del sistema de jueces de Microduck Academy, que se reproducen a continuación tal como aparecen en la model card.

| Ronda | Juez | Puntuación del juez | Ojo (VLM) | Puntuación final |
|---|---|---|---|---|
| 1 | fail | 0,833 | sin veredicto | 83 % |
| 2 | pass | 1,0 | de acuerdo | 100 % |
| final | pass | 1,0 | de acuerdo | 100 % |

Métricas del veredicto final del juez:

| Métrica | Valor |
|---|---|
| `height_ratio` | 0,973 |
| `height_m` | 0,1118 |
| `speed_mps` | 0,495 |
| `displacement_mps` | 0,061 |
| `pitch_deg` | 5,9 |
| `max_tilt_deg` | 9,5 |
| `yaw_rate_rps` | -1,817 |
| `head_yaw_ptp_rad` | 0,362 |
| `knee_left_rad` | 0,352 |
| `contact_fraction` | [0,36, 0,27] |
| `fell` | false |
| `duration_s` | 8,0 |
| `label` | forward |

Veredicto del "ojo" (VLM) sobre los fotogramas: "The duck robot moves forward steadily and spends over a third of its time airborne, showing clear hopping motion."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 0,0 GB, por lo que los pesos de la política son muy reducidos y la inferencia es viable en CPU.
- GPU recomendadas: no disponible. No se especifica ningún requisito de GPU en la model card; dado el tamaño del artefacto, no se espera que sea necesario un acelerador dedicado.
- Compatibilidad con GPU de consumo: no disponible de forma explícita, aunque por el tamaño del repositorio no se anticipan limitaciones para GPUs de consumo.
- Opciones de despliegue: formato ONNX (`policy.onnx`), ejecutable con un runtime ONNX; el reentrenamiento requiere PyTorch a partir de `model.pt`.
- Latencia y throughput: no disponible. No se publican mediciones de latencia ni de frecuencia de control alcanzable.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada. No se han facilitado métricas de otras políticas de la misma familia, tier o tipo que permitan una comparación directa de parámetros, contexto, rendimiento o licencia. Las únicas referencias internas son las rondas de entrenamiento de esta misma política.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tfrere/microduck-move-happy-forward-hop` | no disponible | no aplicable | juez 1,0 (100 %) | apache-2.0 | HuggingFace, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: carece de generación de texto, razonamiento, código, matemáticas, visión o capacidades multilingües. Cualquier ficha que lo trate como tal sería incorrecta.
- Sesgos conocidos: no disponible. No se documenta ningún análisis de sesgo, algo previsible en una política de locomoción con una única tarea.
- Riesgo de alucinación: no aplicable en el sentido habitual; el riesgo análogo es que la política se comporte de forma imprevista fuera de la distribución de estados vista durante el entrenamiento.
- Especificidad de tarea: la política está entrenada para una morfología concreta (un robot pato) y una tarea concreta ("avanzar a saltos"). No se garantiza su transferencia a otras morfologías, alturas o dinámicas.
- Brecha simulación-realidad: no se documenta si el modelo ha sido validado en hardware físico; los resultados presentados provienen de rollouts y de la evaluación automática del juez y del VLM.
- Evaluación automatizada: la puntuación mostrada depende de un juez programático y de un modelo de visión-lenguaje. El propio autor indica que la puntuación se limita al 75 % si el VLM no está seguro y al 50 % si discrepa, lo que evidencia que la métrica no es una validación humana independiente.
- Longitud de contexto e idioma: no aplicables.
- Restricciones de licencia: la licencia es apache-2.0, que permite uso comercial y modificación con atribución, pero conviene verificar las condiciones del ecosistema Microduck Academy para el uso de las herramientas de entrenamiento asociadas.
- Madurez y validación comunitaria: el modelo registra 0 descargas y 0 likes, y el repositorio ocupa 0,0 GB, por lo que no existe evidencia externa de uso en producción.
- Reproducibilidad: la fecha de creación registrada (2026-09-12) y la ausencia de documentación sobre cómputo de entrenamiento, hiperparámetros y dataset dificultan la reproducción exacta del resultado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tfrere/microduck-move-happy-forward-hop
- Perfil del autor: https://huggingface.co/tfrere
- Microduck Academy (espacio de entrenamiento): https://huggingface.co/spaces/tfrere/microduck
- Clip del modelo: `video.mp4` y `poster.jpg` incluidos en el repositorio del modelo
- Archivos auxiliares: `manifest.json`, `rollouts/*.traj`, `checkpoints/r<round>-<iter>.traj`
- Documentación del sistema de puntuación: `docs/TRAINING.md`, sección 8 (referenciada en la model card, no enlazada de forma directa en la información disponible)
