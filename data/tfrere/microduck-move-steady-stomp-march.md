# tfrere/microduck-move-steady-stomp-march

## Resumen

`tfrere/microduck-move-steady-stomp-march` no es un modelo de lenguaje: es una politica de control motriz (una "move") para el robot bipedo Microduck de Pollen Robotics, un pequeno robot con forma de pato. La politica implementa una marcha estatica en el sitio: el robot levanta y golpea alternativamente cada pie siguiendo un ritmo constante sin desplazarse. El autor es el usuario de HuggingFace `tfrere`, que la ha entrenado dentro de Microduck Academy, la herramienta asociada al proyecto.

La ficha tecnica del repositorio la clasifica como familia `velocity` (estilos de marcha o gaits), tipo `perpetual` (movimiento continuo sin fin definido) y tier 1. El artefacto principal es `policy.onnx`, pensado para ejecutarse en el robot, acompanado de `model.pt` para reentrenamiento, grabaciones de trayectorias y un `manifest.json` con la evaluacion automatica.

Su relevancia es acotada pero concreta: forma parte de un ecosistema de politicas de locomocion reutilizables que se instalan con el comando `robotctl policy add` y se ejecutan con `robotctl robot do`. El interes tecnico esta en el sistema de evaluacion doble (un juez numerico y un modelo de vision que revisa los fotogramas) y en la discrepancia documentada entre ambos: el juez numerico da PASS con puntuacion 1.0, mientras que el revisor VLM indica "disagrees: no marching motion", lo que deja la puntuacion final en el 50 %.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politica de control exportada a ONNX; no se documenta la topologia de red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (politica de control motriz, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`) y checkpoint de PyTorch (`model.pt`) |

Otros metadatos del repositorio: ID `tfrere/microduck-move-steady-stomp-march`, etiquetas `microduck-policy`, `academy`, `family:velocity`, `kind:perpetual`, `tier:1`, `region:us`; pipeline no disponible; descargas 0; likes 0; tamano de repositorio 0.0 GB; creado el 2026-09-12 y actualizado el 2026-09-12 segun los metadatos de HuggingFace.

## Arquitectura y entrenamiento

El repositorio no publica detalles de la arquitectura de red, el numero de parametros ni la composicion del dataset. Lo que si se documenta es el proceso: la politica se ha entrenado con Microduck Academy en el marco de la familia `velocity`, que agrupa estilos de marcha, y el manifiesto conserva un bloque `academy` con el prompt de entrenamiento, la familia, el juez y el linaje. El prompt describe el objetivo: "Train a gait where the duck marches in place, alternately lifting and stomping each foot to a steady rhythm while its body stays where it is".

El repositorio incluye `rollouts/*.traj` (grabaciones en formato `trajectory.v1`) y `checkpoints/r<round>-<iter>.traj` con los pasos de entrenamiento de cada ronda, listados en `manifest.checkpoints`. El esquema del manifiesto es la version 2 e incorpora los campos `judge_score`, `vlm`, `score` y el bloque `academy`. La evaluacion se hizo en dos rondas (ronda 1 y ronda final), ambas con veredicto PASS del juez numerico y puntuacion 1.0, y ambas con desacuerdo del revisor VLM. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa, que no aplican a este tipo de artefacto.

## Capacidades

- Locomocion estatica en el sitio: marcha alternativa de pies con elevacion y golpeo ritmico, sin desplazamiento neto medible.
- Control de altura del cuerpo: el juez registra una `height_ratio` de 0.974 y una altura de 0.112 m.
- Control de equilibrio: `max_tilt_deg` de 4.2 grados, `pitch_deg` de 0.8 y ausencia de caida (`fell: false`) durante 8.0 s de ejecucion.
- Estabilidad en el eje de giro: `yaw_rate_rps` de -0.07, es decir, practicamente sin rotacion.
- Movimiento de cabeza ligado a la marcha: `head_yaw_ptp_rad` de 0.158.
- Ciclo de contacto alterno de pies: `contact_fraction` de [0.5, 0.54], coherente con un reparto casi simetrico del apoyo entre ambos pies.
- Ejecucion en robot real mediante la CLI `robotctl` (`policy add` y `robot do`).
- Reutilizacion y ajuste fino a partir de `model.pt`.
- No tiene soporte de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingues, vision, audio ni modo de pensamiento, porque no es un modelo de lenguaje ni un modelo multimodal.

## Casos de uso

- Demostracion de marcha en el sitio: la politica se instala con `sudo robotctl policy add steady stomp march tfrere/microduck-move-steady-stomp-march` y se ejecuta con `robotctl robot do steady stomp march` para mostrar una animacion de marcha ritmica sin desplazamiento del robot.
- Vitrina educativa en Microduck Academy: sirve como ejemplo resuelto de la familia `velocity` para que otros usuarios estudien el prompt, los checkpoints por ronda y la estructura del manifiesto.
- Prueba de controladores y del firmware del Microduck: al mantener una `max_tilt_deg` baja (4.2) y no caerse en 8 segundos, es una carga de trabajo util para validar estabilidad del lazo de control.
- Comparacion de estilos de marcha dentro del mismo robot: al existir otras politicas de la familia `velocity`, como `tfrere/microduck-move-happy-forward-hop`, permite contrastar una marcha estatica con una marcha con desplazamiento.
- Generacion de datos de trayectorias: los archivos `rollouts/*.traj` en formato `trajectory.v1` pueden alimentar analisis posteriores de contacto, altura y orientacion sin necesidad de repetir la sesion fisica.
- Base para ajuste fino: `model.pt` permite reentrenar la politica en Microduck Academy para modificar el ritmo, la amplitud del golpeo o la duracion del ciclo.
- Monitorizacion de la calidad de la evaluacion automatica: el caso es un ejemplo documentado de desacuerdo entre juez numerico y revisor VLM, util para calibrar los umbrales del sistema de puntuacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen metricas tipo MMLU, HumanEval o GSM8K porque el artefacto no es un modelo de lenguaje. Lo unico comparable con un "benchmark" es la evaluacion del juez numerico registrada en el manifiesto, que se reproduce a continuacion tal como aparece en la model card.

| Metrica del juez | Valor |
|---|---|
| Veredicto | PASS |
| Puntuacion del juez | 1.0 |
| height_ratio | 0.974 |
| height_m | 0.112 |
| speed_mps | -0.008 |
| displacement_mps | 0.014 |
| pitch_deg | 0.8 |
| max_tilt_deg | 4.2 |
| yaw_rate_rps | -0.07 |
| head_yaw_ptp_rad | 0.158 |
| knee_left_rad | 0.518 |
| contact_fraction | [0.5, 0.54] |
| fell | false |
| duration_s | 8.0 |
| label | forward |

| Ronda | Juez | Puntuacion del juez | Revisor VLM | Puntuacion final |
|---|---|---|---|---|
| 1 | pass | 1.0 | disagrees: no marching motion | 50 % |
| final | pass | 1.0 | disagrees: no marching motion | 50 % |

El sistema de puntuacion que se muestra en Discover aplica un tope del 75 % cuando el revisor VLM no esta seguro y del 50 % cuando discrepa, segun `docs/TRAINING.md`, seccion 8.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio declara un tamano total de 0.0 GB y el artefacto desplegable es `policy.onnx`, por lo que la huella en disco es reducida; no se publica el numero de parametros ni el consumo de memoria.
- GPU recomendadas: no disponible. Una politica de locomocion de este tipo esta pensada para ejecutarse en el propio robot, no en un acelerador de datacenter.
- Compatibilidad con GPU de consumo: no disponible; no se documenta ningun requisito de aceleracion por GPU.
- Opciones de despliegue: el metodo documentado es `robotctl` (`sudo robotctl policy add steady stomp march tfrere/microduck-move-steady-stomp-march` seguido de `robotctl robot do steady stomp march`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este artefacto.
- Latencia y throughput estimados: no disponible. Solo se conoce la duracion de la evaluacion, 8.0 s, que corresponde a la ventana medida por el juez, no a una medida de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Familia / tier | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| tfrere/microduck-move-steady-stomp-march | Politica de marcha en el sitio | velocity, tier 1, perpetual | apache-2.0 | ONNX + PyTorch | Publico en HuggingFace |
| tfrere/microduck-move-happy-forward-hop | Politica de marcha con avance | velocity, tier 2, perpetual | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Publico en HuggingFace |
| pollen-robotics/microduck | Proyecto de robot bipedo (no es una politica) | no aplica | no disponible en la informacion proporcionada | codigo y hardware | Repositorio publico en GitHub |

No hay datos publicos de parametros, contexto ni rendimiento comparado entre estas politicas, por lo que la comparacion se limita a categoria, familia, tier, licencia y formato. No se dispone de alternativas equivalentes de otros autores en la informacion consultada.

## Limitaciones y advertencias

- Ambito muy restringido: es una politica de locomocion concreta, no un modelo de proposito general; no genera texto, codigo ni respuestas.
- Desacuerdo entre evaluadores: el revisor VLM indica "disagrees: no marching motion" en las dos rondas, mientras que el juez numerico da PASS. La puntuacion final se queda en el 50 %, lo que sugiere que la marcha puede no ser visualmente recognoscible como tal.
- Etiqueta potencialmente enganosa: el campo `label` del juez es `forward` aunque la velocidad medida es practicamente nula (`speed_mps` de -0.008) y el desplazamiento es de 0.014 m/s.
- Sesgos conocidos: no disponible. No se documenta analisis de sesgo, y en este tipo de artefacto el concepto se refiere a sesgos de comportamiento fisico, no a sesgos de lenguaje.
- Riesgo de alucinacion: no aplica en el sentido habitual, ya que no genera texto; el riesgo equivalente es que el juez y el manifiesto declaren un comportamiento que el revisor visual no confirma.
- Limitaciones de contexto o idioma: no aplica, no procesa lenguaje.
- Restricciones de licencia: la licencia es apache-2.0, que permite uso comercial con las condiciones habituales de atribucion y conservacion del aviso de licencia; conviene revisar tambien la licencia del proyecto Microduck de Pollen Robotics para el hardware y el software de control.
- Cifras de adopcion nulas: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en produccion por terceros.
- Metadatos llamativos: las fechas de creacion y actualizacion indicadas son el 2026-09-12; conviene verificar la vigencia del repositorio antes de integrarlo.
- Resultados de busqueda web no relacionados: varias referencias encontradas (anuncios inmobiliarios y de restauracion) no guardan relacion con el modelo, por lo que no aportan informacion tecnica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tfrere/microduck-move-steady-stomp-march
- Autor en HuggingFace: https://huggingface.co/tfrere
- Microduck Academy (Space): https://huggingface.co/spaces/tfrere/microduck
- Politica comparable en HuggingFace: https://huggingface.co/tfrere/microduck-move-happy-forward-hop
- Repositorio del robot Microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
