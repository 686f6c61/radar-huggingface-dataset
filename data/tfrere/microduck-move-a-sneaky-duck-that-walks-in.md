# tfrere/microduck-move-a-sneaky-duck-that-walks-in

## Resumen

`tfrere/microduck-move-a-sneaky-duck-that-walks-in` no es un modelo de lenguaje, sino una **politica de locomocion entrenada por refuerzo** para el robot microduck de Pollen Robotics. La publica el usuario `tfrere` a traves de la herramienta Microduck Academy, y su objetivo es un unico comportamiento motor: que el robot avance hacia delante manteniendo el tronco en una posicion muy agachada, en torno al 72-75 % de su altura erguida, sin perder la estabilidad de la marcha.

Se distribuye como artefacto ONNX (`policy.onnx`) listo para cargarse en el robot, acompanado de un checkpoint PyTorch (`model.pt`) pensado para reentrenamiento o ajuste fino, grabaciones de trayectorias (`rollouts/*.traj`) y un `manifest.json` con el esquema 2 del manifiesto de politicas de microduck. Pertenece a la familia `velocity` (estilos de marcha o *gaits*), al tier 1 y al tipo `perpetual`, lo que significa que la politica se ejecuta de forma indefinida hasta que se le indique lo contrario.

Su relevancia es la de un ejemplo reproducible de extremo a extremo del pipeline abierto de Microduck Academy: entrenamiento con RL, evaluacion automatica mediante un juez con criterios numericos y publicacion de una politica lista para desplegar bajo licencia Apache-2.0. El modelo tiene 0 descargas y 0 likes, y el repositorio ocupa 0.0 GB, por lo que se trata de un artefacto muy pequeno y sin adopcion publica documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle (red neuronal de politica de control entrenada por RL y exportada a ONNX desde un checkpoint PyTorch); la model card no especifica la topologia |
| Parametros totales | No disponible |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable (no es un modelo de lenguaje): consume observaciones de 61 dimensiones a 50 Hz y se ejecuta de forma indefinida (`kind: perpetual`) |
| Tipos de cuantizacion | No disponible (se distribuye un unico `policy.onnx`; no se documentan variantes cuantizadas) |
| Idiomas soportados | No aplicable (no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`, con el normalizador de observaciones embebido) y PyTorch (`model.pt`) |
| Tipo de modelo | Politica de control para robot (`microduck-policy`) |
| Familia | `velocity` (estilos de marcha) |
| Tier | 1 |
| Tipo de politica | `perpetual` (se ejecuta hasta recibir orden de parada) |
| Espacio de observacion | 61 dimensiones |
| Espacio de accion | 14 acciones |
| Frecuencia de control | 50 Hz |
| Entrenamiento | Repositorio `pollen-robotics/microduck_rl`, mediante Microduck Academy |
| Tamano del repositorio | 0.0 GB |
| Idiomas soportados | No aplicable |

## Arquitectura y entrenamiento

La informacion disponible no detalla la topologia de red ni el algoritmo de aprendizaje por refuerzo empleado. Lo que si se documenta es el flujo completo: la politica se entrena en el repositorio `pollen-robotics/microduck_rl`, se evalua con el juez de Microduck Academy y se exporta a ONNX con el normalizador de observaciones embebido, de modo que el consumidor solo tiene que alimentar observaciones en crudo. El artefacto viene acompanado de un checkpoint `model.pt` para reajuste fino y de grabaciones `rollouts/*.traj` en formato `trajectory.v1`, junto con un `manifest.json` que sigue el esquema 2 e incluye un bloque `academy` con el prompt, la familia, el veredicto del juez y el linaje.

El proceso de evaluacion fue iterativo: la ronda 1 obtuvo un veredicto de fallo con puntuacion 0.985, la ronda 2 volvio a fallar con 0.964 y la ronda 3 alcanzo el aprobado con 1.0, puntuacion que se mantuvo en la ronda final. El juez otorgo un PASS global con score 1.0 y registro un conjunto de metricas cinematicas concretas: `height_ratio` 0.72, `height_m` 0.0828, `speed_mps` 0.443, `displacement_mps` 0.409, `pitch_deg` 6.1, `max_tilt_deg` 9.8, `yaw_rate_rps` -0.297, `head_yaw_ptp_rad` 0.99, `knee_left_rad` 1.077, `contact_fraction` [0.5, 0.45], `fell` false, `duration_s` 8.0 y `label` "forward". No se indica el numero de tokens de entrenamiento ni la composicion del dataset, datos que ademas no aplican a un problema de control motor.

## Capacidades

- Locomocion hacia delante: genera una marcha de avance estable con el tronco en posicion agachada, alrededor del 72 % de la altura erguida (0.0828 m en la evaluacion registrada).
- Control en tiempo real a 50 Hz: produce 14 acciones por ciclo a partir de 61 dimensiones de observacion, lo que encaja con un bucle de control de robot embebido.
- Ejecucion perpetua: la politica no tiene un horizonte fijo de episodio, sino que sigue generando la marcha hasta que se le indique lo contrario.
- Estabilidad de la marcha: la evaluacion reporta un `max_tilt_deg` de 9.8 y `fell` false durante 8 s de rollout, con pitch de 6.1 grados.
- Perfil bajo y sigiloso: el propio prompt de entrenamiento define el objetivo como un "pato sigiloso que entra caminando muy agachado"; el juez exige mantener ese perfil sin perder el ritmo.
- Integracion directa con el daemon de microduck: se carga con `sudo robotctl policy load walk tfrere/microduck-move-a-sneaky-duck-that-walks-in`, ocupando la ranura `walk`.
- Reutilizacion y ajuste: el `model.pt` permite reentrenar o derivar variantes de marcha mediante ajuste fino.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, capacidades de agente ni soporte multilingue: no es un modelo de lenguaje y ninguna de esas funciones aparece en la documentacion.

## Casos de uso

- Despliegue directo en el robot microduck: cargar la politica en la ranura `walk` con `robotctl` para obtener un modo de marcha agachado sin necesidad de reentrenar nada; es adecuado porque el artefacto ONNX ya incorpora el normalizador de observaciones.
- Base para ajuste fino de nuevas marchas: partir de `model.pt` y del pipeline de `microduck_rl` para derivar variantes de velocidad, postura o tipo de paso dentro de la familia `velocity`.
- Reproduccion de experimentos de RL en robotica: usar los `rollouts/*.traj` y las metricas del juez como linea base comparable frente a politicas propias, dado que el formato `trajectory.v1` y el manifiesto esquema 2 estan documentados.
- Material docente en cursos de aprendizaje por refuerzo: el flujo entrenamiento, evaluacion por juez y publicacion es un ejemplo cerrado y de tamano pequeno (repositorio de 0.0 GB) apto para practicas.
- Robots de inspeccion con perfil bajo: la marcha agachada a 0.44 m/s puede emplearse en escenarios donde interesa reducir la silueta del robot, por ejemplo bajo mobiliario o en espacios con obstaculos a baja altura.
- Pruebas de robustez y sim-to-real: ejecutar la politica en simulacion y comparar los valores de tilt, yaw rate y fraccion de contacto con los reportados por el juez antes de llevarla a hardware fisico.
- Demostraciones interactivas: integrarla en el Space de Microduck Academy como politica jugable para que terceros la ejecuten y comparen con otras de la misma familia y tier.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no aplican MMLU, HumanEval, GSM8K ni similares, al no tratarse de un modelo de lenguaje). La unica evaluacion documentada es la del juez de Microduck Academy.

| Ronda | Veredicto | Puntuacion |
|---|---|---|
| 1 | fail | 0.985 |
| 2 | fail | 0.964 |
| 3 | pass | 1.0 |
| Final | pass | 1.0 |

Metricas del veredicto final (score 1.0):

| Metrica | Valor |
|---|---|
| height_ratio | 0.72 |
| height_m | 0.0828 |
| speed_mps | 0.443 |
| displacement_mps | 0.409 |
| pitch_deg | 6.1 |
| max_tilt_deg | 9.8 |
| yaw_rate_rps | -0.297 |
| head_yaw_ptp_rad | 0.99 |
| knee_left_rad | 1.077 |
| contact_fraction | [0.5, 0.45] |
| fell | false |
| duration_s | 8.0 |
| label | forward |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB, lo que indica un artefacto muy pequeno, pero no se publica el numero de parametros ni el consumo real.
- GPU recomendadas: no disponible; por el tipo de carga (politica de control a 50 Hz con observaciones de 61 dimensiones) es plausible que no requiera GPU, aunque este dato no lo confirma la model card.
- Encaje en GPU de consumo: no disponible; no se documenta ninguna configuracion de referencia.
- Ejecucion en el robot: el despliegue previsto es sobre el propio microduck mediante el daemon y el comando `robotctl policy load walk`.
- Simulacion y evaluacion: la evaluacion se realiza con rollouts de 8 s y el juez de Microduck Academy; el repo de entrenamiento es `pollen-robotics/microduck_rl`.
- Opciones de despliegue: ONNX Runtime para el artefacto `policy.onnx`; PyTorch para el `model.pt` en tareas de ajuste fino. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible; la unica cifra temporal publicada es la frecuencia de control de 50 Hz y la duracion de 8.0 s de los rollouts evaluados.

## Comparativa con modelos similares

No disponible. La busqueda web realizada no devolvio informacion util sobre este modelo ni sobre alternativas comparables (los resultados correspondian a paginas de Google Earth). Como referencia estructural, los terminos comparables serian otras politicas `microduck-policy` de la misma familia `velocity` o del mismo tier 1 publicadas en el mismo Space de Microduck Academy, pero no se dispone de datos de ninguna de ellas.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-move-a-sneaky-duck-that-walks-in | No disponible | No aplicable | Score 1.0 del juez (PASS) | Apache-2.0 | HuggingFace, 0 descargas |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo y no soporta tool calling, agentes ni multimodalidad. Cualquier expectativa de ese tipo es un error de categoria.
- Evaluacion muy limitada: el veredicto se basa en rollouts de 8.0 s con un juez automatico; no hay evidencia de robustez en episodios largos, terrenos irregulares o perturbaciones externas.
- Dos rondas fallidas antes del aprobado: las puntuaciones 0.985 y 0.964 indican que el ajuste del comportamiento agachado fue marginal, lo que sugiere poca holgura frente a variaciones de condiciones.
- Sesgo de simulacion: no se documenta validacion en hardware fisico, por lo que existe riesgo de brecha sim-to-real (dinamica, friccion, latencia de actuadores) no cuantificada.
- Generalizacion restringida: esta entrenada para un unico comportamiento (avance agachado, etiqueta `forward`); no cubre giros, marcha atras ni otras velocidades mas alla de las registradas.
- Estado del artefacto: 0 descargas, 0 likes, creado y actualizado el mismo dia (2026-09-10) y repositorio de 0.0 GB. Conviene verificar que los pesos se descargan correctamente y no son solo punteros.
- Sin datos de parametros, VRAM ni latencia: imposible dimensionar el coste de inferencia a partir de la informacion publicada.
- Autor individual: la publicacion la realiza el usuario `tfrere` mediante Microduck Academy, sin que se documente un proceso de revision adicional mas alla del juez automatico.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion y conservacion del aviso de licencia; no se documentan restricciones adicionales, pero tampoco garantias.
- Busqueda web no concluyente: los resultados obtenidos no aportan informacion sobre el modelo ni sobre su ecosistema, por lo que no ha sido posible contrastar los datos de la model card con fuentes independientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tfrere/microduck-move-a-sneaky-duck-that-walks-in
- Perfil del autor: https://huggingface.co/tfrere
- Microduck Academy (Space de entrenamiento): https://huggingface.co/spaces/tfrere/microduck
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (referenciado en la model card, sin URL directa)
- Documentacion del manifiesto de politicas: `docs/policy-manifest.md` en el repositorio del daemon (referenciado en la model card, sin URL directa)
