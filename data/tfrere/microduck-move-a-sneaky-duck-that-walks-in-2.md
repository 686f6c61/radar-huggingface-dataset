# tfrere/microduck-move-a-sneaky-duck-that-walks-in-2

## Resumen

microduck-move-a-sneaky-duck-that-walks-in-2 no es un modelo de lenguaje: es una **política de locomoción** ("move") entrenada por el usuario tfrere dentro de Microduck Academy, un entorno de entrenamiento de movimientos para un personaje con forma de pato. El objetivo declarado es que el pato camine hacia delante manteniendo una agachada muy baja, con el tronco a aproximadamente el 75 % de su altura en posición erguida durante todo el ciclo de marcha.

El modelo pertenece a la familia `velocity` (estilos de marcha o *gaits*), es de tipo `perpetual` y de tier 1. Los artefactos publicados son una política exportada a ONNX (`policy.onnx`), pesos en PyTorch (`model.pt`) para reentrenamiento o *fine-tuning*, grabaciones de trayectorias en formato `trajectory.v1` (`rollouts/*.traj`) y un `manifest.json` con esquema 2 que incluye el bloque `academy` (prompt, familia, juez y linaje).

Su relevancia es acotada y muy específica: sirve como pieza reutilizable para animación procedural y control de personajes en simulación, y como ejemplo del flujo de trabajo de Microduck Academy (entrenar, evaluar con juez automático, publicar). El repositorio no tiene descargas ni *likes*, y la model card no documenta arquitectura de red, número de parámetros ni datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control entrenada con Microduck Academy; la model card no especifica la topología de red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se publica exportación ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`policy.onnx`), PyTorch (`model.pt`); trayectorias en `rollouts/*.traj` (trajectory.v1); metadatos en `manifest.json` (esquema 2) |
| Pipeline declarado | no disponible |
| Tamano del repositorio | 0.0 GB |
| Familia / tipo | `family:velocity`, `kind:perpetual`, `tier:1` |
| Fecha de creacion | 2026-09-11 |
| Ultima actualizacion | 2026-09-11 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card indica que el movimiento ha sido entrenado por tfrere con Microduck Academy, y etiqueta el resultado como una política (`microduck-policy`). La presencia de `policy.onnx`, de pesos `model.pt` (descritos como base para *remix*, es decir, *fine-tune* desde ellos) y de grabaciones de *rollouts* en formato `trajectory.v1` es coherente con un entrenamiento por refuerzo sobre un entorno de simulación, aunque **la información proporcionada no especifica el algoritmo de aprendizaje, la topología de la red, el número de parámetros ni el cómputo empleado**.

Tampoco se documentan el número de pasos de entrenamiento, la composición del dataset (en su caso, el entorno y las recompensas) ni si hubo fases de ajuste adicionales. El único mecanismo de validación descrito es un juez automático de la propia academia, cuyo veredicto y métricas cinemáticas se recogen en la model card y se reproducen en la sección de benchmarks. No hay ninguna innovación técnica declarada más allá del flujo de trabajo de la academia (prompt, familia, juez y linaje registrados en el `manifest.json`).

## Capacidades

- Generación de una marcha hacia delante (*label* `forward`) con agachada pronunciada: el tronco se mantiene a un `height_ratio` de 0,749 respecto a la altura erguida, es decir, unos 0,0861 m de altura en la medición del juez.
- Locomoción estable durante al menos 8,0 s de *rollout* sin caída (`fell: false`).
- Desplazamiento efectivo medido de 0,199 m/s con una velocidad de 0,205 m/s.
- Control postural: `pitch_deg` de 0,7 grados, `max_tilt_deg` de 5,6 grados y `yaw_rate_rps` de -0,049, lo que indica una trayectoria prácticamente recta y sin inclinaciones acusadas.
- Articulación de cabeza y rodilla dentro del ciclo de marcha (`head_yaw_ptp_rad` 0,709; `knee_left_rad` 0,961).
- Patrón de contacto por pata registrado (`contact_fraction` [0,55, 0,49]), indicativo de una marcha con fases de apoyo diferenciadas por extremidad.
- Ejecución en inferencia mediante el artefacto ONNX publicado.
- Reentrenamiento o *fine-tuning* a partir de `model.pt`, según la propia model card.
- Reproducción y análisis de trayectorias a partir de los ficheros `rollouts/*.traj`.
- No dispone de *tool calling*, soporte de agentes, capacidades multilingües, visión ni audio: no es un modelo generativo de texto.

## Casos de uso

- Animación procedural de personajes en videojuegos: la política puede ejecutarse mediante ONNX Runtime para generar un ciclo de marcha agachada sin animación capturada, útil para NPC que deben desplazarse agachados (sigilo, exploración de conductos, paso por zonas de techo bajo).
- Punto de partida para *fine-tuning* de variantes de marcha: al publicarse `model.pt` como base de *remix*, otro desarrollador puede partir de esta política y ajustarla hacia otros estilos de la familia `velocity` en lugar de entrenar desde cero.
- Generación de datos sintéticos de movimiento: los ficheros `rollouts/*.traj` permiten extraer secuencias de poses y contactos para alimentar un pipeline de animación o para construir un conjunto de datos de locomoción con etiquetas cinemáticas.
- Validación de entornos de simulación y jueces automáticos: la política sirve como caso de prueba reproducible (métricas concretas de altura, velocidad, inclinación y contacto) para comprobar si un simulador o un evaluador se comporta de forma consistente.
- Investigación en control de locomoción: el par política + métricas del juez permite estudiar el compromiso entre velocidad de desplazamiento y altura del tronco en una tarea de agachada mantenida.
- Prototipado rápido en demos y *spaces*: al ser un artefacto ONNX de tamaño reducido (el repositorio ocupa 0,0 GB), es viable cargarlo en una demo interactiva delante de un motor de render sin infraestructura GPU dedicada.
- Comparación de gaits dentro de Microduck Academy: la etiqueta `family:velocity` y el `manifest.json` con linaje facilitan enfrentar este movimiento con otros de la misma familia bajo el mismo juez.
- Pruebas de robustez en producción de videojuegos: puede integrarse como controlador de bajo nivel en un bucle de simulación por pasos para medir si las métricas del juez se degradan al cambiar la frecuencia de simulación o el terreno.

## Benchmarks y rendimiento

Los únicos datos de evaluación disponibles son los del juez de Microduck Academy, que otorgó un veredicto **PASS** con una puntuación de 0,926 en la ronda 1.

| Metrica del juez | Valor |
|---|---|
| Puntuacion (ronda 1) | 0,926 (pass) |
| Puntuacion (ronda final) | 0,951 (fail) |
| height_ratio | 0,749 |
| height_m | 0,0861 |
| speed_mps | 0,205 |
| displacement_mps | 0,199 |
| pitch_deg | 0,7 |
| max_tilt_deg | 5,6 |
| yaw_rate_rps | -0,049 |
| head_yaw_ptp_rad | 0,709 |
| knee_left_rad | 0,961 |
| contact_fraction | [0,55, 0,49] |
| fell | false |
| duration_s | 8,0 |
| label | forward |

No se han publicado resultados de benchmarks comparables (MMLU, HumanEval, GSM8K u otros) porque el modelo no es un modelo de lenguaje y la información disponible no incluye ninguna otra evaluación externa.

## Requisitos de hardware

- No se publican estimaciones de VRAM, latencia ni throughput en la información disponible.
- El repositorio ocupa 0,0 GB y el artefacto principal es una exportación ONNX, por lo que el despliegue estándar es la inferencia en CPU con ONNX Runtime; no se documenta ninguna dependencia de GPU.
- No se especifican GPU recomendadas (A100, H100, RTX 4090 u otras); no disponible.
- No se indica si el modelo cabe en GPU de consumo, aunque por el tamaño del repositorio y el formato de exportación no parece requerir aceleración dedicada. Se trata de una inferencia razonada a partir de los datos disponibles, no de un dato confirmado por el autor.
- Opciones de despliegue coherentes con los formatos publicados: ONNX Runtime para `policy.onnx` y PyTorch para `model.pt`. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- No hay datos de latencia ni de rendimiento por paso de simulación.

## Comparativa con modelos similares

No disponible. La búsqueda web realizada no devolvió ningún resultado relacionado con este modelo ni con Microduck Academy (los resultados obtenidos trataban sobre Character.AI, `COLLATE SQL_Latin1_General_CP1_CI_AS` y configuración de tabulaciones en vim, todos ellos irrelevantes), y la información proporcionada no identifica políticas de locomoción alternativas con las que comparar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Alcance muy restringido: la política resuelve una única tarea ("caminar hacia delante en agachada baja") y no es extrapolable a otras habilidades.
- Inconsistencia en la evaluación: la ronda final obtuvo una puntuación más alta (0,951) que la ronda 1 (0,926) pero fue marcada como `fail`, mientras que la ronda 1 fue `pass`. Esto sugiere que el criterio del juez no depende únicamente de la puntuación numérica, o que existe un problema de reproducibilidad que conviene verificar antes de usar el modelo como referencia.
- No se documentan la arquitectura de red, el algoritmo de entrenamiento, el número de parámetros ni los datos utilizados, lo que impide auditar el modelo o reproducir su entrenamiento.
- Riesgo de sobreajuste al evaluador: las métricas proceden exclusivamente del juez de la academia y no de una validación independiente.
- No hay evidencia de transferencia a entornos reales (*sim-to-real*) ni de robustez frente a cambios de terreno, frecuencia de control o ruido en las observaciones.
- El repositorio registra 0 descargas y 0 *likes*, por lo que no existe validación por parte de terceros.
- El tamaño del repositorio se declara como 0,0 GB, lo que puede indicar que los artefactos son muy pequeños o que el tamaño no está correctamente reportado; conviene comprobar los ficheros antes de integrarlos.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución y conservación del aviso de licencia, pero la model card no aclara la licencia de los datos de entrenamiento ni de los *rollouts*.
- Al no ser un modelo de lenguaje, no procede evaluar sesgos lingüísticos ni riesgo de alucinación textual; el riesgo análogo es el fallo físico del controlador (caída o desviación de la marcha) en condiciones no vistas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tfrere/microduck-move-a-sneaky-duck-that-walks-in-2
- Perfil del autor: https://huggingface.co/tfrere
- Microduck Academy (space de entrenamiento): https://huggingface.co/spaces/tfrere/microduck
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la búsqueda web realizada; los resultados obtenidos no guardaban relación con el modelo.
