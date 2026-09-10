# tfrere/microduck-move-a-forward-roll

## Resumen

`tfrere/microduck-move-a-forward-roll` es una politica de control (policy) entrenada por el usuario tfrere dentro del programa Microduck Academy, pensada para el robot cuadrupedo educativo microduck de Pollen Robotics. No es un modelo de lenguaje ni un modelo generativo de texto: es una politica de aprendizaje por refuerzo exportada a ONNX que mapea una observacion de 61 dimensiones a 14 acciones de control, ejecutandose a 50 Hz. Su habilidad concreta es una voltereta hacia delante (forward roll): el pato se agacha, mete la cabeza, rueda sobre su espalda y termina de nuevo de pie.

El modelo pertenece a la familia `roulade`, tier 1, tipo `episodic`, y fue validado por un juez automatico con veredicto PASS y puntuacion 1.0 en la primera ronda, aunque las rondas 2 y 3 del mismo juez registraron fail con puntuaciones 0.523 y 0.833 respectivamente. El repositorio es muy ligero (0.0 GB declarados) e incluye `policy.onnx` para ejecucion, `model.pt` para reentrenamiento por fine-tuning, grabaciones de trayectoria en `rollouts/*.traj` y un `manifest.json` con esquema 2 y bloque `academy`.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de un pipeline completo de entrenamiento, evaluacion automatica y despliegue en robot real dentro del ecosistema microduck, y como punto de partida para reentrenar o "remezclar" nuevas habilidades acrobaticas. El repositorio acumula 0 descargas y 0 likes, por lo que no cuenta con validacion externa mas alla del juicio automatico documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politica de control entrenada con aprendizaje por refuerzo y exportada a ONNX; la model card no detalla la topologia de la red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; ventana de observacion de 61 dimensiones por paso de control |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; las entradas son observaciones numericas de 61 dimensiones y las salidas 14 acciones) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`) y PyTorch (`model.pt`); se acompanan de `rollouts/*.traj` (trajectory.v1) y `manifest.json` (schema 2) |

Datos adicionales de operacion:

| Parametro | Valor |
|---|---|
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Duracion declarada de la habilidad | 5.0 s (la metrica `duration_s` del juez reporta 6.0 s) |
| Normalizador de observaciones | integrado dentro de `policy.onnx`; se deben alimentar observaciones en crudo |
| Familia / tier / tipo | `roulade` / tier 1 / `episodic` |
| Repositorio de entrenamiento | `pollen-robotics/microduck_rl` |

## Arquitectura y entrenamiento

La informacion disponible no describe la topologia interna de la red (numero de capas, tipo de capas o numero de parametros). Lo que si se explicita es el metodo: se trata de una politica entrenada con aprendizaje por refuerzo (etiquetas `robotics`, `reinforcement-learning`) en el repositorio `pollen-robotics/microduck_rl`, dentro del flujo de Microduck Academy. El artefacto de inferencia es un grafo ONNX que consume las 61 dimensiones de observacion y produce 14 acciones a 50 Hz, con el normalizador de observaciones embebido en el propio grafo, lo que evita tener que aplicar preprocesado externo.

El entrenamiento es de tipo episodico (`kind:episodic`): el modelo ejecuta un episodio finito de 5.0 segundos y devuelve el robot a una postura de pie. El `manifest.json` sigue el esquema 2 del manifiesto de politicas de microduck e incluye un bloque `academy` con el prompt de entrenamiento, la familia, el resultado del juez y el linaje, lo que permite trazabilidad del proceso. No se documentan en la informacion proporcionada el numero de tokens o pasos de entrenamiento, la composicion del dataset, ni el uso de RLHF/DPO, por lo que esos datos se consideran no disponibles.

## Capacidades

- Ejecucion de una habilidad motora concreta y acotada: voltereta hacia delante con recuperacion a postura erguida.
- Control de un cuadrupedo con 14 grados de accion y observaciones de 61 dimensiones a 50 Hz.
- Inferencia en tiempo real mediante ONNX, con normalizacion de observaciones integrada en el grafo.
- Reproduccion de trayectorias grabadas en formato `trajectory.v1`, utiles para auditoria o reentrenamiento.
- Reentrenamiento por fine-tuning a partir de `model.pt` (flujo "remix" de la Academia).
- Despliegue directo en robot compatible mediante el demonio `robotctl`.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, razonamiento multi-paso, vision, audio, generacion de texto ni soporte multilingue: no es un modelo de lenguaje.

## Casos de uso

- Ejecucion de la voltereta en hardware real: se instala con `robotctl policy add move-a-forward-roll tfrere/microduck-move-a-forward-roll` y se lanza con `robotctl robot do move-a-forward-roll`; el normalizador embebido permite alimentar observaciones directamente desde el robot sin preprocesado.
- Material didactico en talleres de robotica: el episodio de 5 segundos con veredicto de juez documentado sirve como ejemplo completo de ciclo entrenamiento-evaluacion-despliegue para estudiantes que se inician en RL aplicado a robots.
- Punto de partida para nuevas habilidades: `model.pt` permite hacer fine-tuning y derivar variantes (otras familias de movimiento o tiers superiores) sin partir de cero.
- Investigacion en aprendizaje por refuerzo sobre locomocion: los `rollouts/*.traj` con el esquema `trajectory.v1` permiten analizar la evolucion de variables como `max_tilt_deg` (174.4 grados), `yaw_rate_rps` (0.005) o `pitch_deg` (-2.5) durante la maniobra.
- Validacion y calibracion de jueces automaticos: al incluir el veredicto del juez y las puntuaciones de tres rondas, el modelo es util como caso de prueba para comprobar la sensibilidad del evaluador a la semilla o a la configuracion de la politica, dado que la ronda 1 pasa con 1.0 y las rondas 2 y 3 fallan con 0.523 y 0.833.
- Demostraciones de robotica en ferias o eventos: una habilidad corta, llamativa y auto-recuperable es adecuada para exhibiciones de pocos segundos repetibles en bucle.
- Pruebas de integracion del demonio `robotctl`: el manifiesto esquema 2 y los comandos documentados permiten verificar el flujo de instalacion, carga y ejecucion de politicas en el daemon.

## Benchmarks y rendimiento

Los unicos datos de evaluacion publicados son los del juez automatico de la Academia. Se recogen a continuacion tal cual aparecen en la model card:

| Ronda | Veredicto | Puntuacion |
|---|---|---|
| 1 | pass | 1.0 |
| 2 | fail | 0.523 |
| 3 | fail | 0.833 |

Metricas del informe del juez (ronda con veredicto PASS):

| Metrica | Valor |
|---|---|
| Veredicto | PASS (score 1.0) |
| height_ratio | 1.008 |
| height_m | 0.1159 |
| speed_mps | 0.0 |
| displacement_mps | 0.0 |
| pitch_deg | -2.5 |
| max_tilt_deg | 174.4 |
| yaw_rate_rps | 0.005 |
| head_yaw_ptp_rad | 0.003 |
| knee_left_rad | 0.021 |
| contact_fraction | [1.0, 1.0] |
| fell | true |
| duration_s | 6.0 |
| label | zero_cmd_seed2 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y no serian aplicables a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Se trata de una politica ONNX de muy baja complejidad, no de un modelo de lenguaje; no se documentan requisitos de GPU.
- GPU recomendadas: no disponibles. La ejecucion esta pensada para el controlador a bordo del robot microduck, no para aceleradores de datacenter.
- Compatibilidad con GPU de consumo: no disponible como dato explicito; por la naturaleza del artefacto (politica ONNX de tiempo real a 50 Hz) no se espera que requiera GPU dedicada.
- Opciones de despliegue: ONNX Runtime para `policy.onnx`; el canal documentado es el demonio `robotctl` del ecosistema microduck (`robotctl policy add ...` y `robotctl robot do ...`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: el bucle de control opera a 50 Hz, lo que implica un periodo de 20 ms por paso. No se publican medidas de latencia ni de throughput adicionales. El episodio dura 5.0 s segun la model card (6.0 s segun la metrica `duration_s` del juez).
- Tamano en disco: el repositorio declara 0.0 GB, coherente con un artefacto de pesos muy reducido.

## Comparativa con modelos similares

No hay disponible en la informacion proporcionada ningun listado de politicas comparables con sus parametros, contexto, rendimiento o licencia, por lo que no es posible construir una tabla comparativa con datos verificables. Como referencia taxonomica interna del Microduck Academy, este modelo se clasifica en la familia `roulade`, tier 1, tipo `episodic`, y podria compararse con otras politicas del mismo autor o del mismo tier publicadas bajo la etiqueta `microduck-policy`, pero no se dispone de sus fichas ni de sus metricas.

## Limitaciones y advertencias

- Inconsistencia en el veredicto del juez: la ronda 1 obtiene pass con 1.0, pero las rondas 2 y 3 fallan con 0.523 y 0.833. El resultado depende de la configuracion o semilla de evaluacion.
- La propia salida del juez incluye `"fell": true` mientras la model card afirma que el robot termina de nuevo de pie. Conviene tratar la recuperacion final como no garantizada y verificarla en hardware.
- Discrepancia en la duracion: la model card indica 5.0 s de ejecucion y el informe del juez reporta `duration_s` de 6.0 s.
- `max_tilt_deg` de 174.4 grados confirma una inversion practicamente completa; en un robot fisico esto implica riesgo de golpe, atrapamiento o dano mecanico si el entorno no esta despejado.
- Modelo altamente especializado: solo ejecuta la habilidad entrenada. No generaliza a otras tareas ni acepta instrucciones en lenguaje natural.
- No es un modelo de lenguaje: no tiene soporte multilingue ni capacidad de generacion de texto, razonamiento o codigo.
- El normalizador de observaciones esta embebido en `policy.onnx`. Si se alimentan observaciones ya normalizadas, el comportamiento sera incorrecto, ya que se aplicaria una doble normalizacion.
- Dependencia del ecosistema microduck y del demonio `robotctl` con manifiesto schema 2; no se documenta compatibilidad con otras plataformas roboticas.
- Sin validacion externa: 0 descargas y 0 likes en el momento de la consulta, y el unico enlace de la busqueda web que devuelve resultados relevantes es el de la propia ficha.
- Fecha de creacion y actualizacion declaradas como 2026-09-10, lo que resulta atipico y conviene verificar antes de citarla.
- Licencia apache-2.0: permite uso comercial y modificacion con obligaciones de atribucion y conservacion del aviso de licencia. No se documentan clausulas adicionales ni restricciones especificas del autor.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/tfrere/microduck-move-a-forward-roll
- Espacio de Microduck Academy: https://huggingface.co/spaces/tfrere/microduck
- Perfil del autor: https://huggingface.co/tfrere
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL referenciado: `pollen-robotics/microduck_rl` (sin URL publica en la informacion proporcionada)
- Documentacion del manifiesto de politicas: `docs/policy-manifest.md` en el repositorio del daemon (sin URL publica en la informacion proporcionada)
