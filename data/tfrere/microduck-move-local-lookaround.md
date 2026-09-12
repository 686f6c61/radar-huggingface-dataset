# tfrere/microduck-move-local-lookaround

## Resumen

`tfrere/microduck-move-local-lookaround` es un artefacto de control para el robot cuadrúpedo Microduck, publicado por el usuario tfrere dentro del programa Microduck Academy. No se trata de un modelo de aprendizaje automatico entrenado, sino de un "move script": una linea de tiempo de comandos que se reproduce sobre una politica de marcha ya existente. En concreto, el script explota los slots de comando de cabeza y cuerpo de la politica `pollen-robotics/microduck-policies/alpha_walking.onnx`, de modo que el comportamiento descrito ("un pato que mira alrededor mientras camina") se expresa sin necesidad de entrenar nada.

El contenido del repositorio son dos artefactos: `move_script.json`, que contiene una linea de tiempo de comandos en bucle de 10,0 segundos con 501 fotogramas clave, y `rollouts/0.traj`, que es esa misma linea de tiempo reproducida en MuJoCo sobre CPU. El autor declara explicitamente que no fue necesario entrenamiento y que el coste de GPU fue de 0 USD, ya que toda la ejecucion y evaluacion se realizaron en CPU.

La relevancia de este artefacto es metodologica mas que de rendimiento: demuestra que comportamientos relativamente ricos (desplazamiento con cabeceo de cabeza de gran amplitud) pueden lograrse recombinando comandos de una politica preexistente, sin reentrenar. El evaluador automatico (judge) le otorgo una puntuacion de 1,0 con resultado "pass", lo que lo convierte en un ejemplo validado de script de movimiento de tier 1 dentro de dicha academia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (script de movimiento sobre una politica de marcha preentrenada; no define una red neuronal propia) |
| Parametros totales | No aplica (el script no tiene parametros entrenables; el recuento de la politica base `alpha_walking.onnx` es no disponible) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (no procesa lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | Sin pesos propios; artefactos en JSON (`move_script.json`) y trayectoria (`rollouts/0.traj`). La politica base referenciada esta en ONNX |

## Arquitectura y entrenamiento

Este artefacto no implica entrenamiento. Segun la model card, el comportamiento solicitado era expresable directamente con los slots de comando de cabeza y cuerpo de la politica de marcha ya publicada (`pollen-robotics/microduck-policies/alpha_walking.onnx`). Por tanto, no hay dataset, ni tokens de entrenamiento, ni fases de RLHF/DPO: el trabajo consiste en construir una linea de tiempo de comandos coherente con la interfaz de control de dicha politica.

El resultado es `move_script.json`, una linea de tiempo en bucle de 10,0 segundos compuesta por 501 fotogramas clave, lo que equivale aproximadamente a 50,1 fotogramas clave por segundo (un intervalo medio de unos 20 ms). La unica innovacion tecnica destacable es de planteamiento: en lugar de entrenar una nueva politica para un comportamiento nuevo, se reutiliza el espacio de comandos de una politica existente para expresar el gesto de "mirar alrededor mientras se camina". La verificacion se realiza reproduciendo la linea de tiempo en el simulador MuJoCo sobre CPU, cuyo resultado queda registrado en `rollouts/0.traj`.

## Capacidades

- Ejecucion de una secuencia de movimiento en bucle de 10,0 segundos con 501 fotogramas clave, combinando desplazamiento y cabeceo de cabeza.
- Control de los slots de comando de cabeza y cuerpo de la politica de marcha `alpha_walking.onnx`.
- Generacion de un movimiento de "mirar alrededor" con un recorrido de guinada de cabeza (peak-to-peak) de 2,056 rad, segun las metricas del judge.
- Mantenimiento de la marcha durante la secuencia: fraccion de contacto por pie de 0,52 y 0,53, sin caida (`fell: false`).
- Reproduccion determinista en simulador MuJoCo sobre CPU, con coste de GPU declarado de 0 USD.
- No incluye: tool calling, function calling, razonamiento multi-paso, capacidades multilingues, vision, audio ni modo de razonamiento. No es un modelo de lenguaje ni un modelo multimodal.

## Casos de uso

- Validacion reproducible de politicas de marcha: el script permite ejecutar una secuencia fija en MuJoCo CPU y contrastar las metricas obtenidas (altura, velocidad, inclinacion) contra las registradas por el judge, sirviendo como prueba de regresion.
- Demostracion de reutilizacion de politicas existentes: ilustra como ampliar el comportamiento de una politica de marcha publicada usando sus propios slots de comando, sin reentrenar ni consumir GPU.
- Base para variaciones creativas de move scripts: la estructura de `move_script.json` (linea de tiempo de 501 fotogramas clave) puede editarse para producir gestos alternativos manteniendo el mismo esquema de comandos.
- Pruebas de estres de los canales de cabeza y cuerpo: la amplitud de guinada de cabeza de 2,056 rad permite analizar los limites del actuador de cabeza dentro del simulador sin riesgo fisico.
- Docencia de robotica: caso de estudio de como un comportamiento aparentemente complejo se expresa mediante una linea de tiempo de comandos en lugar de un nuevo entrenamiento, con coste computacional nulo en GPU.
- Comparacion entre scripts de mismo nivel: al pertenecer a un tier concreto y disponer de metricas objetivas del judge, sirve como referencia para comparar otros move scripts dentro de la academia.
- Integracion en entornos de simulacion sin acelerador: al ejecutarse en CPU, puede incluirse en pipelines de integracion continua o entornos sin GPU para verificar que una politica camina correctamente.

## Benchmarks y rendimiento

Los unicos datos disponibles proceden del evaluador (judge) de la model card. No hay resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.), ya que no es un modelo de lenguaje.

| Metrica | Valor |
|---|---|
| Puntuacion del judge | 1,0 (pass) |
| Etiqueta | script |
| Duracion | 10,0 s |
| `height_ratio` | 1,03 |
| `height_m` | 0,1184 |
| `speed_mps` | 0,151 |
| `displacement_mps` | 0,147 |
| `pitch_deg` | -1,1 |
| `max_tilt_deg` | 4,7 |
| `yaw_rate_rps` | 0,006 |
| `head_yaw_ptp_rad` | 2,056 |
| `knee_left_rad` | 0,06 |
| `contact_fraction` | [0,52, 0,53] |
| `fell` | false |
| Coste de GPU | 0 USD |

## Requisitos de hardware

- VRAM para inferencia: no aplica; la ejecucion declarada se realiza en CPU y no requiere GPU (coste de GPU de 0 USD).
- GPU recomendadas: ninguna. El artefacto no necesita acelerador, ni de clase A100/H100 ni de consumo (RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no aplica, porque no se requiere GPU.
- Opciones de despliegue: reproduccion en MuJoCo sobre CPU; la politica base referenciada se distribuye en formato ONNX, lo que permite ejecutarla con un runtime ONNX.
- Latencia y throughput estimados: la linea de tiempo dura 10,0 s con 501 fotogramas clave, lo que supone unos 50,1 fotogramas clave por segundo (intervalo medio aproximado de 20 ms). No se dispone de datos de latencia de ejecucion medidos en hardware objetivo.

## Comparativa con modelos similares

No se dispone de modelos comparables identificados en la informacion proporcionada. No obstante, puede compararse este script con la politica de marcha sobre la que opera:

| Elemento | Tipo | Entrenamiento | Requisitos de computo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tfrere/microduck-move-local-lookaround` | Move script (linea de tiempo de comandos) | No (declarado por el autor) | CPU (MuJoCo) | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| `pollen-robotics/microduck-policies/alpha_walking.onnx` | Politica de marcha (ONNX) | No disponible | No disponible | No disponible | Referenciada por la model card |

## Limitaciones y advertencias

- No es un modelo de aprendizaje automatico entrenado: es un script de movimiento; cualquier expectativa de inferencia generica o de capacidades de lenguaje es inaplicable.
- Dependencia de la politica base: su funcionamiento esta condicionado a los slots de comando y al comportamiento de `alpha_walking.onnx`; si dicha politica cambia o no esta disponible, el script puede no reproducirse igual.
- Especificidad de hardware: esta disenado para el robot Microduck y su modelo simulado en MuJoCo; no es portable directamente a otras plataformas roboticas.
- Riesgo de sobreajuste al simulador: las metricas proceden de reproduccion en MuJoCo CPU; el comportamiento en hardware fisico puede diferir y no se aportan validaciones en robot real.
- Naturaleza de las metricas: los resultados (incluida la puntuacion 1,0 del judge) provienen del sistema de evaluacion de la academia y deben interpretarse en ese contexto, no como un benchmark externo independiente.
- Ausencia de datos de sesgo y alucinacion: por su naturaleza (script de control) no aplican sesgos linguisticos ni alucinacion, pero tampoco se documentan analisis de robustez ante perturbaciones.
- Licencia apache-2.0: permite uso comercial y modificacion, sujeto a los terminos de dicha licencia; conviene verificar la licencia de la politica base referenciada, que no se especifica en la informacion disponible.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de uso ni de validacion por terceros.
- La busqueda web realizada no devolvio informacion relevante sobre este modelo (los resultados obtenidos eran ajenos al tema), por lo que toda la informacion anterior proviene de la model card.

## Enlaces

- HuggingFace: https://huggingface.co/tfrere/microduck-move-local-lookaround
- Autor: https://huggingface.co/tfrere
- Politica base referenciada: pollen-robotics/microduck-policies/alpha_walking.onnx (sin URL directa en la informacion proporcionada; busqueda en https://huggingface.co/pollen-robotics)
- Papers, blogs, repos, demos adicionales: no disponible.
