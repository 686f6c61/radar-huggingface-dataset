# tfrere/microduck-move-steady-spot-march

## Resumen

Microduck move steady spot march es una política de control motriz (locomotion policy) para el robot cuadrúpedo/bípedo "Microduck", entrenada por el usuario tfrere dentro del entorno Microduck Academy. No es un modelo de lenguaje ni un modelo multimodal: es un controlador entrenado por refuerzo que produce las acciones articulares necesarias para que el robot marque el paso en el sitio, alternando el levantamiento y el golpeo de cada pie con un ritmo constante y sin desplazarse. Se distribuye como grafo ONNX listo para ejecutar y como checkpoint PyTorch para reentrenamiento.

El modelo se publica con 0 descargas y 0 likes en el momento de la consulta, con un tamaño de repositorio reportado de 0.0 GB, lo que es coherente con una política de red pequeña orientada a control en tiempo real. Pertenece a la familia `velocity` (estilos de marcha o gaits), tier 2, y su tipo es `perpetual`, lo que indica que el comportamiento está pensado para sostenerse indefinidamente.

Su relevancia es acotada y muy específica: sirve como ejemplo verificable de un pipeline de entrenamiento automatizado en el que un juez programático y un modelo de visión-lenguaje (VLM) evalúan la política sobre métricas numéricas y sobre fotogramas de vídeo. La validación reportada es PASS con puntuación 1.0 y acuerdo del VLM, lo que da una puntuación final del 100 por cien en el catálogo Discover.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Autor | tfrere |
| ID en HuggingFace | tfrere/microduck-move-steady-spot-march |
| Arquitectura | no disponible (política de control motriz servida como grafo ONNX; no se documenta la topología de red) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la política consume observaciones del robot en cada paso de control) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX con precisión no documentada; no se listan variantes cuantizadas) |
| Idiomas soportados | no aplicable (no procesa lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`), PyTorch (`model.pt`) y trayectorias `trajectory.v1` (`.traj`) |
| Familia | velocity (estilos de marcha / gaits) |
| Tier | tier 2 |
| Kind | perpetual |
| Version de esquema del manifiesto | schema 2 |
| Region declarada | us |
| Fecha de creacion | 2026-09-12 |
| Fecha de actualizacion | 2026-09-12 |
| Descargas / likes | 0 / 0 |
| Tamano del repositorio | 0.0 GB (reportado por HuggingFace) |
| Entorno de entrenamiento | Microduck Academy (Space: tfrere/microduck) |
| Altura del robot en la metrica de validacion | 0.1186 m (ratio 1.031 respecto a la altura de referencia) |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la topología de la red (número de capas, anchura, si es un MLP, una red recurrente o un transformer de control), ni sobre el número de parámetros. El artefacto de inferencia es un grafo ONNX (`policy.onnx`) pensado para ejecutarse en el robot, y se ofrece además `model.pt` como punto de partida para reentrenamiento o ajuste fino ("remix") dentro de Microduck Academy. El repositorio incluye `rollouts/*.traj` con grabaciones en formato `trajectory.v1` y `checkpoints/r<round>-<iter>.traj` con los pasos de entrenamiento de cada ronda, listados en `manifest.checkpoints`.

El entrenamiento se describe únicamente a nivel de procedimiento: el autor define un prompt en lenguaje natural ("Train the duck to march in place at zero commanded speed, alternately lifting and stomping the left and right foot in a steady, even rhythm while its body stays...") y el sistema itera rondas, evaluando cada una con dos mecanismos. El primero es un juez programático que comprueba métricas numéricas de la simulación (altura, velocidad, desplazamiento, pitch, tilt, yaw, contactos y levantamientos de pie). El segundo es un "eye" basado en un VLM que revisa fotogramas del vídeo resultante. La puntuación final mostrada en el catálogo es la del juez, con topes de 75 por cien si el VLM no está seguro y de 50 por cien si discrepa. No se documentan en la información disponible ni el número de tokens o episodios de entrenamiento, ni la composición del dataset, ni el uso de RLHF o DPO (conceptos, por otra parte, propios de modelos de lenguaje y no de políticas de control).

## Capacidades

- Generación de marcha en el sitio ("march in place") a velocidad comandada cero, alternando el apoyo de ambos pies.
- Mantenimiento de una cadencia rápida y constante: la validación reporta 22 levantamientos de pie izquierdo y 21 del derecho.
- Estabilización postural: `max_tilt_deg` de 5.4 grados y `pitch_deg` de 0.6 grados durante la ejecución.
- Control de altura corporal: `height_ratio` de 1.031 respecto a la altura de referencia del robot.
- Comportamiento de tipo `perpetual`, es decir, sostenible de forma indefinida sin una condición de terminación documentada.
- Ejecución como política de control en un robot real mediante el comando `robotctl robot do steady spot march`.
- Reutilización como base para ajuste fino gracias al checkpoint `model.pt`.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo de pensamiento: es exclusivamente una política motriz.

## Casos de uso

- Validación de pipelines de entrenamiento por refuerzo: sirve como caso de referencia dentro de Microduck Academy para comprobar que el juez programático y el VLM puntúan correctamente una habilidad sencilla y bien definida.
- Demostración de locomoción en el sitio: útil para exhibir control de equilibrio y alternancia de pies en un robot físico sin riesgo de desplazamiento fuera de la zona segura, ya que el desplazamiento medido es de 0.009 m.
- Prueba de estrés de controladores de bajo nivel: al mantener contacto fraccional de 0.57 y 0.49 por pie, permite medir la respuesta de los actuadores a ciclos rápidos de carga y descarga.
- Base para ajuste fino de otras marchas: al pertenecer a la familia `velocity`, el checkpoint `model.pt` puede reentrenarse hacia gaits con desplazamiento, reutilizando el comportamiento de marcha ya aprendido.
- Componente de calentamiento o animación en rutinas más largas: una marcha perpetua y sin desplazamiento puede encadenarse con otras políticas como fase intermedia en una secuencia de comportamiento.
- Material docente sobre evaluación automatizada de políticas: el repositorio incluye rollouts, checkpoints por ronda y un manifiesto con el bloque `academy` (prompt, familia, juez y linaje), lo que permite reproducir el análisis de la curva de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni equivalentes, porque el modelo no es un modelo de lenguaje. La única evaluación disponible es la del juez programático y el VLM del propio entorno de entrenamiento, con estas métricas:

| Metrica | Valor |
|---|---|
| Veredicto del juez (codigo) | pass |
| Puntuacion del juez | 1.0 |
| Veredicto del VLM ("eye") | agrees |
| Puntuacion mostrada en Discover | 100 % |
| `height_ratio` | 1.031 |
| `height_m` | 0.1186 |
| `speed_mps` | 0.002 |
| `displacement_mps` | 0.001 |
| `pitch_deg` | 0.6 |
| `max_tilt_deg` | 5.4 |
| `yaw_rate_rps` | 1.076 |
| `head_yaw_ptp_rad` | 0.277 |
| `knee_left_rad` | -0.061 |
| `contact_fraction` | [0.57, 0.49] |
| `travel_m` | 0.009 |
| `foot_lifts` | [22, 21] |

Resultados por ronda reportados en la model card:

| Ronda | Juez | Puntuacion del juez | VLM ("eye") | Puntuacion |
|---|---|---|---|---|
| 1 | pass | 1.0 | agrees | 100 % |
| final | pass | 1.0 | agrees | 100 % |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio reporta 0.0 GB de tamaño, lo que sugiere un artefacto muy pequeño, pero no se publica el tamaño de `policy.onnx` ni el número de parámetros.
- GPU recomendadas: no disponible. No se documenta ningún requisito de GPU. Al ser un grafo ONNX de control, es plausible la inferencia en CPU, pero esto no está confirmado por el autor.
- Compatibilidad con GPU de consumo: no disponible. No hay confirmación de que el modelo se haya ejecutado en una GPU de consumo concreta.
- Opciones de despliegue: el método documentado es la herramienta `robotctl`, con los comandos `sudo robotctl policy add steady spot march tfrere/microduck-move-steady-spot-march` y `robotctl robot do steady spot march`. Para remezcla o ajuste fino se usa `model.pt`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una política de control.
- Latencia y throughput: no disponibles. No se publica la frecuencia de control ni el tiempo de inferencia por paso.
- Requisito de robot: el comportamiento está entrenado para el robot Microduck de 0.1186 m de altura; su transferencia a otro robot no está documentada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos comparables, ni políticas de la misma familia `velocity` con las que contrastar parámetros, contexto, rendimiento o licencia. Como referencia de contexto, la propia model card indica que el modelo pertenece a Microduck Academy, un espacio donde se entrenan otras políticas con distintas familias, tiers y tipos (`kind`), pero no se aportan sus identificadores ni sus métricas.

| Criterio | steady spot march | Alternativas |
|---|---|---|
| Parametros | no disponible | no disponible |
| Longitud de contexto | no aplicable | no disponible |
| Rendimiento | juez 1.0, VLM agrees, 100 % | no disponible |
| Licencia | Apache-2.0 | no disponible |
| Disponibilidad | HuggingFace, 0 descargas | no disponible |

## Limitaciones y advertencias

- Ambito restringido: no es un modelo de lenguaje ni multimodal. No genera texto, no razona, no escribe código y no procesa instrucciones en lenguaje natural en inferencia.
- Sin validación comunitaria: 0 descargas y 0 likes. La única evaluación procede del pipeline automático del propio entorno de entrenamiento, no de terceros independientes.
- Riesgo de sobreajuste a la métrica: la puntuación se calcula con un juez programático y un VLM del mismo sistema que entrena el modelo. Que el comportamiento "marche en el sitio" pase el juez no garantiza que sea estéticamente correcto ni que generalice fuera de las condiciones evaluadas.
- Interpretación de las métricas: `yaw_rate_rps` es de 1.076 rad/s pese a que la velocidad y el desplazamiento lineales son prácticamente nulos (0.002 m/s y 0.009 m de recorrido total). Conviene verificar si esa rotación en yaw es intencionada o un artefacto del control antes de usar la política en un robot real.
- Brecha simulación-realidad: no se documenta el grado de aleatorización de dominio, el motor de simulación empleado ni si el comportamiento se ha transferido con éxito a hardware físico. La instrucción de ejecución con `robotctl` implica un robot real, pero no hay evidencia publicada de la prueba.
- Altura específica: las métricas se refieren a un robot de 0.1186 m. No hay datos de comportamiento con alturas, cargas o terrenos distintos.
- Licencia: Apache-2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de copyright y la atribución correspondiente. No se declaran restricciones adicionales ni cláusulas de uso aceptable.
- Fechas: el repositorio declara fechas de creación y actualización de 2026-09-12, con una diferencia de poco más de un minuto entre ambas. No hay historial de versiones posterior.
- La búsqueda web realizada no devolvió resultados relacionados con el modelo: los enlaces obtenidos correspondían a información farmacológica sobre tamsulosina, sin ninguna relación con este repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tfrere/microduck-move-steady-spot-march
- Perfil del autor: https://huggingface.co/tfrere
- Microduck Academy (Space de entrenamiento): https://huggingface.co/spaces/tfrere/microduck
- Documentación de entrenamiento del entorno: `docs/TRAINING.md` (sección 8, citada en la model card; no se proporciona URL directa)
- Archivos del repositorio citados: `policy.onnx`, `model.pt`, `rollouts/*.traj`, `checkpoints/r<round>-<iter>.traj`, `manifest.json`, `video.mp4`, `poster.jpg`
- Papers, blogs, repositorios o demos adicionales: no disponible en la información proporcionada
