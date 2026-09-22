# ZachGarner/microduck-headstand-split

## Resumen

`ZachGarner/microduck-headstand-split` es un artefacto de investigacion en robotica: una politica de control entrenada con aprendizaje por refuerzo (RL) para la tarea `Mjlab-HeadstandKickup-Flat-MicroDuck`, es decir, conseguir que el robot cuadrupedo MicroDuck se levante hasta una postura de pino sobre una superficie plana. No es un modelo de lenguaje ni un modelo generativo multimodal: es un controlador que recibe 61 valores de observacion y devuelve 14 acciones articulares. El autor publica el checkpoint original evaluado (`model_1499.pt`) junto con una exportacion ONNX (`policy.onnx`) que incluye el normalizador de observaciones.

La relevancia del repositorio es metodologica mas que de escala. Frente a la practica habitual de publicar unicamente resultados agregados, el autor adjunta `provenance.json` (run de origen, hashes y procedencia del codigo) y `evaluation.json` (informe de evaluacion individual), lo que permite reproducir y auditar la evaluacion. El checkpoint original supero 32 de 32 intentos individuales simulados con semilla 0 bajo el evaluador documentado. Ademas, el conjunto de seis politicas del proyecto completo 87 de 96 intentos de rutina en las semillas 0, 1 y 2.

El autor es explicito sobre el alcance: se trata de artefactos de investigacion en simulacion, no de un paquete de instalacion para un daemon de robot. No se incluye manifiesto de runtime ni comando de instalacion en hardware, y la politica no se ha probado en un robot fisico. La licencia no esta declarada en la informacion disponible, lo que condiciona cualquier uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la informacion disponible (politica de aprendizaje por refuerzo entrenada en MuJoCo/Mjlab; exportacion ONNX) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (entrada fija de 61 valores de observacion) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (no es un modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | PyTorch (`model_1499.pt`) y ONNX (`policy.onnx`, con normalizador de observaciones incluido) |
| Dimensionalidad de entrada | 61 valores de observacion |
| Dimensionalidad de salida | 14 acciones articulares |
| Tarea | `Mjlab-HeadstandKickup-Flat-MicroDuck` |
| Pipeline declarado | `reinforcement-learning` |
| Libreria declarada | `onnx` |
| Tamano del repositorio | 0.0 GB (segun HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El autor no documenta en la model card la topologia concreta de la red (numero de capas, anchura, tipo de activaciones ni si se trata de un MLP u otra familia). Lo que si se explicita es el pipeline: entrenamiento con aprendizaje por refuerzo mediante el stack RSL-RL, integrado en el ecosistema MuJoCo a traves de Mjlab, sobre la tarea de levantamiento a pino en terreno plano. La ruta de checkpoints del evaluador (`logs/rsl_rl/microduck_headstand_kickup/wandb_checkpoints/y2fllvgj/model_1499.pt`) confirma que el artefacto procede de un run de RSL-RL y que las politicas se registran con Weights & Biases. No hay informacion sobre numero de tokens, composicion del dataset (no aplica: se trata de RL, no de aprendizaje supervisado) ni sobre fases de RLHF o DPO.

La innovacion tecnica destacable esta en el empaquetado y la trazabilidad, no en la arquitectura. La exportacion ONNX se realiza con el exportador estandar del repositorio de entrenamiento e incorpora el normalizador de observaciones dentro del grafo, de modo que la politica puede ejecutarse sin reproducir manualmente el preprocesado. El repositorio incluye ademas `provenance.json` con el run de origen, hashes y procedencia del codigo, y `evaluation.json` con el informe de evaluacion individual. La rutina evaluada emplea transiciones basadas en contacto y una politica de mantenimiento de pie independiente, y las muestras de fuerza en la cabeza se toman a 50 Hz.

## Capacidades

- Generacion de acciones de control: mapea 61 observaciones a 14 consignas articulares para el cuadrupedo MicroDuck.
- Ejecucion de la tarea `HeadstandKickup`: levantamiento a pino desde el suelo en terreno plano simulado.
- Inferencia via ONNX Runtime: `policy.onnx` es autocontenido respecto al normalizador de observaciones.
- Integracion con el evaluador documentado: el checkpoint `model_1499.pt` puede colocarse en la cache del evaluador en `logs/rsl_rl/microduck_headstand_kickup/wandb_checkpoints/y2fllvgj/model_1499.pt`, evitando la descarga desde W&B.
- Participacion en la rutina compuesta del proyecto: la politica forma parte del conjunto de seis politicas que ejecuta la rutina completa con transiciones de contacto.
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas, vision, audio, tool calling, function calling, capacidades de agente ni soporte multilingue: es un controlador de robot, no un modelo de lenguaje.
- Sin modo de razonamiento explicito (thinking mode), sin decodificacion especulativa ni mecanismos equivalentes.

## Casos de uso

- Reproduccion de resultados de RL en robotica: el evaluador documentado, el informe `evaluation.json` y los hashes de `provenance.json` permiten repetir la medicion de 32 de 32 exitos con semilla 0 y comprobar la estabilidad de la politica antes de reutilizarla como linea base.
- Linea base para nuevas politicas de levantamiento: al ser una tarea de kickup a pino con contacto, sirve como referencia contra la que medir variantes arquitectonicas o cambios en la recompensa dentro de Mjlab.
- Investigacion en transiciones basadas en contacto: la rutina combina cambios de politica basados en contacto y una politica de mantenimiento de pie separada, lo que la hace util para estudiar handovers entre controladores en simulacion.
- Barridos de parametros y evaluacion a gran escala: la exportacion ONNX permite ejecutar la politica en ONNX Runtime dentro de bucles de evaluacion paralelos, sin depender de PyTorch ni de reproducir el preprocesado manualmente.
- Verificacion de pipelines de exportacion: comparar el comportamiento de `model_1499.pt` y `policy.onnx` bajo las mismas observaciones es un caso practico para validar que el normalizador embebido no introduce discrepancias.
- Docencia en aprendizaje por refuerzo aplicado a robotica: el repositorio ofrece un ejemplo completo y acotado (checkpoint, exportacion, evaluador, informe de resultados y procedencia) para practicas de RL con MuJoCo.
- Estudio de robustez ante condiciones iniciales: dado que el autor advierte que el exito no esta garantizado desde posturas iniciales arbitrarias, el artefacto sirve para caracterizar el dominio de validez de la politica variando la pose de partida en simulacion.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible son los de evaluacion del propio proyecto. No se han publicado comparaciones con otros modelos en la informacion disponible.

| Evaluacion | Ambito | Resultado reportado |
|---|---|---|
| Intentos individuales, semilla 0 | Checkpoint `model_1499.pt` | 32 de 32 exitos |
| Rutina completa, semillas 0, 1 y 2 | Conjunto de seis politicas del proyecto | 87 de 96 exitos |

Advertencias del autor sobre estas cifras: no establecen rendimiento en hardware ni exito desde posturas iniciales arbitrarias, y los conteos de rollout publicados se midieron con el checkpoint original, no con la exportacion ONNX. No se dispone de MMLU, HumanEval, GSM8K ni de ninguna otra metrica de modelos de lenguaje, por no ser aplicables a este artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio se declara con un tamano de 0.0 GB, lo que indica un artefacto muy pequeno, pero el numero de parametros no esta documentado.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por la dimensionalidad de entrada (61) y salida (14), la inferencia via ONNX Runtime es viable en CPU.
- Compatibilidad con GPU de consumo: no confirmada explicitamente; dado el tamano declarado del repositorio, cualquier GPU de consumo reciente seria suficiente si se opta por aceleracion.
- Opciones de despliegue: ONNX Runtime para `policy.onnx`; PyTorch para `model_1499.pt`; el evaluador y el exportador del repositorio de entrenamiento basado en RSL-RL, junto con MuJoCo y Mjlab para el entorno de simulacion.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tiempo de inferencia ni de frecuencia de control alcanzable; el unico dato temporal es que las muestras de fuerza en la cabeza se toman a 50 Hz.
- No se proporciona manifiesto de runtime ni comando de instalacion en hardware fisico.

## Comparativa con modelos similares

No se han identificado en la informacion disponible modelos comparables de terceros. La unica comparacion factible es interna al propio proyecto.

| Artefacto | Tipo | Entrada | Salida | Resultado reportado | Licencia |
|---|---|---|---|---|---|
| `microduck-headstand-split` (`model_1499.pt` / `policy.onnx`) | Politica de RL para MuJoCo/Mjlab | 61 observaciones | 14 acciones | 32/32 en semilla 0 | No disponible |
| Conjunto de seis politicas del proyecto | Politicas de RL del mismo proyecto | No disponible | No disponible | 87/96 en semillas 0, 1 y 2 | No disponible |
| Alternativas externas | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Ambito exclusivamente simulado: el autor indica que no se ha probado en un robot fisico y que no se suministra manifiesto de runtime ni comando de instalacion en hardware.
- Los 32 de 32 exitos con semilla 0 no establecen rendimiento en hardware ni exito desde posturas iniciales arbitrarias.
- Cobertura de evaluacion limitada: los resultados agregados corresponden a las semillas 0, 1 y 2, y las cifras de rollout publicadas se midieron con el checkpoint original, no con la exportacion ONNX.
- Muestreo de fuerza limitado: las muestras de fuerza en la cabeza se toman a 50 Hz y pueden no capturar impactos mas breves.
- Criterio de exito laxo en la salida: la comprobacion de exito evalua la postura final de pie, no la forma de las patas a lo largo de toda la secuencia de salida.
- Dependencia de una rutina compuesta: el funcionamiento descrito utiliza transiciones basadas en contacto y una politica de mantenimiento de pie independiente, por lo que la politica no debe interpretarse como un controlador autonomo de extremo a extremo.
- Licencia no declarada: no es posible determinar si se permite el uso comercial, la redistribucion o la modificacion.
- Riesgo de alucinacion: no aplica, al no ser un modelo generativo de lenguaje.
- Sesgos conocidos: no disponibles. No se documenta analisis de sesgos, y el concepto no es directamente trasladable a una politica de control.
- Idiomas: no aplica.
- Reproducibilidad de artefactos de investigacion: la advertencia explicita del autor es que estos artefactos no constituyen un paquete instalable para un daemon de robot.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ZachGarner/microduck-headstand-split
- Codigo de evaluacion, configuracion y resultados en bruto: https://github.com/zachgarner/microduck-headstand/tree/71ad395
- La busqueda web realizada no devolvio ningun resultado relevante para este modelo: los enlaces recuperados correspondian a consultas no relacionadas (foros en chino sobre software de edicion de imagen, comparativas de CPU y verificacion de antecedentes laborales), por lo que no se incluyen.
- No se han localizado papers, blogs tecnicos ni demos adicionales en la informacion proporcionada.
