# ZachGarner/microduck-headstand-splitover

## Resumen

`ZachGarner/microduck-headstand-splitover` es una politica de control entrenada por aprendizaje por refuerzo para el entorno simulado `Mjlab-HeadstandSplitOver-Flat-MicroDuck`, ejecutado sobre MuJoCo. No es un modelo de lenguaje ni un modelo generativo: es una politica de robótica que recibe 61 valores de observacion y produce 14 acciones de articulacion, distribuida tanto como checkpoint original (`model_1499.pt`) como en exportacion ONNX (`policy.onnx`) que incluye el normalizador de observaciones.

El autor es ZachGarner, que publica este artefacto como complemento de un repositorio de entrenamiento y evaluacion en GitHub. La relevancia es acotada y muy especifica: se trata de un artefacto de investigacion en simulacion sobre un cuadrupedo denominado MicroDuck, que ejecuta una rutina de *headstand* con transferencias de apoyo por contacto (*splitover*) y una politica de mantenimiento en pie separada. No se ha probado en un robot fisico.

La informacion disponible es minima: no hay licencia declarada, no se especifican idiomas (no aplica), no se publican parametros del modelo ni arquitectura de la red, y el repositorio ocupa 0,0 GB. Las unicas metricas publicadas son recuentos de exito en simulacion: el checkpoint original supero 32 de 32 intentos individuales con semilla 0, y el conjunto de seis politicas completo 87 de 96 intentos rutinarios en las semillas 0, 1 y 2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politica de aprendizaje por refuerzo; el path del checkpoint apunta a `logs/rsl_rl/...`, lo que sugiere la libreria RSL-RL) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de 61 valores de observacion por paso |
| Tipos de cuantizacion | no disponible (se distribuye ONNX en precision de exportacion no especificada; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica / no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`) y ONNX (`.onnx`); el ONNX incluye el normalizador de observaciones |
| Dimension de entrada | 61 valores de observacion |
| Dimension de salida | 14 acciones de articulacion |
| Entorno de entrenamiento | `Mjlab-HeadstandSplitOver-Flat-MicroDuck` (MuJoCo) |
| Ficheros del repositorio | `model_1499.pt`, `policy.onnx`, `provenance.json`, `evaluation.json` |
| Tamano del repositorio | 0,0 GB (segun HuggingFace) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 22 de septiembre de 2026 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

No se documenta la arquitectura de red en la informacion disponible. Se sabe que es una politica de aprendizaje por refuerzo con una interfaz de 61 entradas y 14 salidas, exportada a ONNX mediante el exportador estandar del repositorio de entrenamiento. La ruta del checkpoint evaluado (`logs/rsl_rl/microduck_headstand_splitover/wandb_checkpoints/2v46kg6g/model_1499.pt`) apunta a la libreria RSL-RL y a un registro de experimentos en Weights & Biases, aunque el autor indica que si se coloca el checkpoint en la cache del evaluador no es necesario descargarlo de W&B. No se especifican el algoritmo concreto, el numero de pasos de entrenamiento, la composicion del dataset ni si hubo etapas de ajuste adicionales.

El artefacto forma parte de un conjunto de seis politicas que en conjunto completaron 87 de 96 intentos rutinarios en las semillas 0, 1 y 2. La rutina emplea transferencias de apoyo basadas en contacto y una politica de mantenimiento en pie independiente. Las muestras de fuerza en la cabeza se toman a 50 Hz, lo que puede no capturar impactos mas breves, y la comprobacion de exito a la salida valida la postura final en pie, no la forma de las patas durante toda la transicion.

## Capacidades

- Generacion de acciones de control continuas: mapea 61 observaciones a 14 consignas de articulacion para el cuadrupedo MicroDuck.
- Ejecucion de una rutina de *headstand* con transiciones de apoyo por contacto (*splitover*) en el entorno simulado `Mjlab-HeadstandSplitOver-Flat-MicroDuck`.
- Coordinacion con una politica de mantenimiento en pie separada para la fase final de la rutina.
- Inferencia via ONNX con normalizacion de observaciones integrada en el propio grafo, lo que simplifica el despliegue en tiempo de ejecucion.
- Ejecucion en CPU o GPU indiferentemente, dado el reducido tamano de la interfaz de entrada y salida.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio ni capacidades multilingues.
- No se documenta soporte de *tool calling*, *function calling* ni razonamiento multi-paso.

## Casos de uso

- Investigacion en locomotion y acrobacia cuadrupeda: permite reproducir la rutina de *headstand* con transferencia de apoyo en MuJoCo y comparar variantes de entrenamiento bajo un evaluador documentado.
- Punto de partida para *fine-tuning* con RL: el checkpoint `model_1499.pt` puede reutilizarse como inicializacion en nuevos entrenamientos sobre el mismo entorno o sobre variantes planas del mismo.
- Evaluacion comparativa de exportadores ONNX: al incluir el normalizador en el grafo, sirve para medir diferencias numericas entre la politica original en PyTorch y su exportacion ONNX.
- Pruebas de robustez frente a condiciones iniciales: el propio autor advierte de que el exito desde posturas iniciales arbitrarias no esta establecido, por lo que es un caso de uso natural para *benchmarking* de robustez.
- Pipeline de simulacion a gran escala: al ser un grafo ONNX pequeno, se puede ejecutar en paralelo en muchos hilos o procesos para barridos de semillas y analisis estadistico de tasas de exito.
- Docencia y demostraciones de RL aplicado a robotica: ilustra el flujo completo de entrenamiento en `rsl_rl`, registro en W&B, exportacion a ONNX y evaluacion con recuentos de exito reproducibles.
- Validacion de infraestructura de despliegue: sirve como carga minima para verificar que un *runtime* ONNX (ONNX Runtime, TensorRT, etc.) funciona correctamente antes de desplegar politicas mayores.

## Benchmarks y rendimiento

Unicos resultados disponibles, correspondientes a la evaluacion en simulacion descrita en la model card:

| Metrica | Resultado | Condiciones |
|---|---|---|
| Exito individual del checkpoint original | 32 de 32 intentos | Semilla 0, evaluador documentado |
| Exito rutinario del conjunto de seis politicas | 87 de 96 intentos | Semillas 0, 1 y 2 |
| Frecuencia de muestreo de fuerza en cabeza | 50 Hz | Puede no capturar impactos mas breves |

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros no aplican a este tipo de artefacto). Tampoco se publican metricas de rendimiento en hardware fisico: el propio autor indica que estos datos no establecen rendimiento en hardware ni exito desde posturas iniciales arbitrarias.

## Requisitos de hardware

- VRAM para inferencia: practicamente despreciable; se trata de un grafo de 61 entradas y 14 salidas. No se publica el numero de parametros, pero la huella es de kilobytes a pocos megabytes.
- GPU recomendadas: no aplica ninguna en concreto; el modelo puede ejecutarse en CPU. Cualquier GPU, incluida una integrada, es suficiente.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo e incluso en CPU. No se requiere una RTX 4090 ni hardware de centro de datos.
- Opciones de despliegue: ONNX Runtime, TensorRT, OpenVINO o cualquier otro *runtime* compatible con ONNX. Para la politica original en PyTorch, un entorno con PyTorch y las dependencias del repositorio de entrenamiento.
- Latencia y *throughput* estimados: no disponibles. Dependen del *runtime* y del hardware, pero con esta dimensionalidad se espera un coste por paso muy bajo para cualquier opcion razonable.
- Restricciones de despliegue en robot fisico: el autor indica explicitamente que no se proporciona manifiesto de ejecucion ni comando de instalacion en hardware, y que la politica no se ha probado en un robot real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ZachGarner/microduck-headstand-splitover` | no disponible; entrada 61 valores, salida 14 acciones | no aplica | 32/32 intentos (semilla 0); 87/96 rutinarios en 3 semillas | no disponible | ONNX y PyTorch en HuggingFace |
| Otras politicas de locomotion cuadrupeda | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Existen otras politicas de control para cuadrupedos publicadas en la literatura de aprendizaje por refuerzo (por ejemplo, trabajos sobre locomotion en MuJoCo o Isaac Gym), pero no se han aportado datos concretos que permitan una comparacion rigurosa de parametros, contexto, rendimiento o licencia. Se indica por tanto "no disponible".

## Limitaciones y advertencias

- Modelo exclusivamente simulado: no se ha probado en un robot fisico y el autor no proporciona manifiesto de ejecucion ni procedimiento de instalacion en hardware.
- Exito desde posturas iniciales arbitrarias no establecido: los 32 de 32 intentos corresponden a una evaluacion concreta en semilla 0 con el evaluador documentado.
- Las muestras de fuerza en la cabeza se toman a 50 Hz, por lo que impactos mas breves pueden pasar desapercibidos en la evaluacion.
- La comprobacion de exito a la salida valida la postura final en pie, no la forma de las patas durante toda la transicion, lo que puede enmascarar comportamientos suboptimos intermedios.
- La rutina depende de transferencias de apoyo por contacto y de una politica de mantenimiento en pie separada; el artefacto publicado no es autosuficiente para toda la secuencia.
- Licencia no declarada: no hay autorizacion explicita para uso comercial ni para redistribucion. Debe contactarse con el autor antes de cualquier uso fuera de investigacion.
- No se documentan sesgos en el sentido de modelos de lenguaje, pero si puede existir sobreajuste al entorno y al evaluador concretos, con degradacion al cambiar condiciones fisicas, masas, fricciones o retrasos de actuacion.
- No se aportan datos de reproducibilidad sobre el export ONNX: los recuentos de exito publicados se midieron con el checkpoint original, no con la exportacion, segun la propia model card.
- Autor y repositorio sin traccion: 0 descargas y 0 *likes* en el momento de los metadatos, sin historial de mantenimiento posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ZachGarner/microduck-headstand-splitover
- Repositorio de evaluacion, configuracion y resultados en bruto: https://github.com/zachgarner/microduck-headstand/tree/71ad395
- Otros enlaces relevantes (papers, blogs, demos): no disponibles en la informacion proporcionada. Los resultados de busqueda web recibidos no guardan relacion con este modelo.
